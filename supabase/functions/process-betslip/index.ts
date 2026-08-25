import { GoogleGenAI } from "npm:@google/genai@2.10.0";
import { authenticatedClient } from "../_shared/auth.ts";
import { codeFromError, handleOptions, json } from "../_shared/http.ts";
import { mockForFilename } from "./mock.ts";
import { EXTRACTION_PROMPT, PROMPT_VERSION } from "./prompt.ts";
import { responseJsonSchema, SCHEMA_VERSION } from "./schema.ts";
import { validateExtraction } from "./validator.ts";

const MAX_BYTES = 10 * 1024 * 1024;
function actualMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.slice(0,8).every((value,index) => value === [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a][index])) return "image/png";
  const head = new TextDecoder().decode(bytes.slice(0,12));
  if (head.startsWith("RIFF") && head.endsWith("WEBP")) return "image/webp";
  if (head.startsWith("%PDF-")) return "application/pdf";
  return null;
}
function toBase64(bytes: Uint8Array) { let binary = ""; const size = 0x8000; for (let i=0;i<bytes.length;i+=size) binary += String.fromCharCode(...bytes.subarray(i,i+size)); return btoa(binary); }
async function sha256(bytes: Uint8Array) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map((byte) => byte.toString(16).padStart(2,"0")).join(""); }

Deno.serve(async (request) => {
  const options = handleOptions(request); if (options) return options;
  if (request.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405);
  let uploadId: string | undefined;
  try {
    const { supabase, user } = await authenticatedClient(request);
    const body = await request.json().catch(() => null) as { uploadId?: unknown } | null;
    uploadId = typeof body?.uploadId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.uploadId) ? body.uploadId : undefined;
    if (!uploadId) throw new Error("UPLOAD_NOT_FOUND");
    const { data: uploadRow } = await supabase.from("bet_uploads").select("*").eq("id", uploadId).eq("user_id", user.id).single();
    if (!uploadRow) throw new Error("UPLOAD_NOT_FOUND");
    let upload = uploadRow;
    if (upload.status === "imported") return json({ ok: true, status: "imported", uploadId });
    const { data: prior } = await supabase.from("bet_extractions").select("validation_issues,confidence_score").eq("upload_id", uploadId).eq("schema_version", SCHEMA_VERSION).maybeSingle();
    if (prior) return json({ ok: true, status: upload.status, uploadId, confidenceScore: prior.confidence_score, issues: prior.validation_issues });
    if (!upload.storage_path.startsWith(`${user.id}/${uploadId}/`) || upload.storage_path.includes("..")) throw new Error("UPLOAD_FORBIDDEN");
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabase.from("bet_uploads").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("updated_at", oneMinuteAgo).in("status", ["processing","ready","needs_review"]);
    if ((count ?? 0) > 6) return json({ ok: false, code: "RATE_LIMITED" }, 429);
    await supabase.from("bet_uploads").update({ status: "processing", error_code: null, error_message: null }).eq("id", uploadId);
    const { data: blob, error: downloadError } = await supabase.storage.from("betslips").download(upload.storage_path);
    if (downloadError || !blob) throw new Error("INVALID_FILE");
    if (blob.size <= 0 || blob.size > MAX_BYTES) throw new Error(blob.size > MAX_BYTES ? "FILE_TOO_LARGE" : "INVALID_FILE");
    const bytes = new Uint8Array(await blob.arrayBuffer()); const mime = actualMime(bytes);
    if (!mime) throw new Error("UNSUPPORTED_FILE_TYPE");
    const hash = await sha256(bytes);
    const { data: duplicate } = await supabase.from("bet_uploads").select("id, status").eq("user_id", user.id).eq("sha256", hash).is("duplicate_of", null).neq("id", uploadId).maybeSingle();
    if (duplicate) {
      await supabase.from("bet_uploads").update({ status: "duplicate", duplicate_of: duplicate.id, sha256: null, error_code: "DUPLICATE_UPLOAD", error_message: "Exact file already uploaded." }).eq("id", uploadId);
      if (duplicate.status === "imported") return json({ ok: false, code: "DUPLICATE_UPLOAD", duplicateOf: duplicate.id }, 409);
      uploadId = duplicate.id;
      const { data: canonical } = await supabase.from("bet_uploads").select("*").eq("id", uploadId).eq("user_id", user.id).single();
      if (!canonical) throw new Error("UPLOAD_NOT_FOUND");
      upload = canonical;
      const { data: priorCanonical } = await supabase.from("bet_extractions").select("validation_issues,confidence_score").eq("upload_id", uploadId).eq("schema_version", SCHEMA_VERSION).maybeSingle();
      if (priorCanonical) return json({ ok: true, status: upload.status, uploadId, confidenceScore: priorCanonical.confidence_score, issues: priorCanonical.validation_issues, reused: true });
      if (upload.status === "failed") {
        await supabase.from("bet_uploads").update({ status: "processing", error_code: null, error_message: null }).eq("id", uploadId);
      } else if (!["uploaded", "processing"].includes(upload.status)) {
        return json({ ok: true, uploadId, status: upload.status, reused: true });
      }
    } else {
      const { error: hashError } = await supabase.from("bet_uploads").update({ sha256: hash, mime_type: mime, file_size_bytes: bytes.byteLength }).eq("id", uploadId);
      if (hashError?.code === "23505") throw new Error("DUPLICATE_UPLOAD"); if (hashError) throw hashError;
    }
    const mode = Deno.env.get("BETSLIP_AI_MODE") ?? "gemini";
    if (mode === "mock" && Deno.env.get("APP_ENV") === "production") throw new Error("GEMINI_FAILED");
    let raw: unknown; let provider: string; let model: string;
    if (mode === "mock") { raw = mockForFilename(upload.original_filename); provider = "mock"; model = "fixture-v1"; }
    else {
      const apiKey = Deno.env.get("GEMINI_API_KEY"); model = Deno.env.get("GEMINI_MODEL") ?? "";
      if (!apiKey || !model) throw new Error("GEMINI_FAILED");
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({ model, contents: [{ role: "user", parts: [{ text: EXTRACTION_PROMPT }, { inlineData: { mimeType: mime, data: toBase64(bytes) } }] }], config: { responseMimeType: "application/json", responseJsonSchema } });
        if (!response.text) throw new Error("GEMINI_INVALID_RESPONSE");
        raw = JSON.parse(response.text);
        provider = "google-gemini";
      } catch (geminiError) {
        console.error("Gemini extraction failed:", geminiError instanceof Error ? geminiError.message : geminiError);
        throw new Error("GEMINI_FAILED");
      }
    }
    const assessment = validateExtraction(raw);
    const { error: insertError } = await supabase.from("bet_extractions").insert({ upload_id: uploadId, user_id: user.id, provider, model, prompt_version: PROMPT_VERSION, schema_version: SCHEMA_VERSION, raw_response: raw, normalized_data: assessment.normalized, validation_issues: assessment.issues, confidence_score: assessment.score });
    if (insertError?.code !== "23505" && insertError) throw insertError;
    await supabase.from("bet_uploads").update({ status: assessment.status }).eq("id", uploadId);
    const { error: deleteError } = await supabase.storage.from("betslips").remove([upload.storage_path]);
    if (deleteError) console.warn("Failed to delete betslip after extraction:", deleteError.message);
    return json({ ok: true, uploadId, status: assessment.status, confidenceScore: assessment.score, issues: assessment.issues });
  } catch (error) {
    const code = codeFromError(error);
    if (uploadId && code !== "DUPLICATE_UPLOAD") { try { const { supabase } = await authenticatedClient(request); await supabase.from("bet_uploads").update({ status: "failed", error_code: code, error_message: "Processing failed." }).eq("id", uploadId); } catch { /* response remains sanitized */ } }
    return json({ ok: false, code }, ["INVALID_FILE","FILE_TOO_LARGE","UNSUPPORTED_FILE_TYPE","UPLOAD_NOT_FOUND"].includes(code) ? 400 : code === "DUPLICATE_UPLOAD" ? 409 : code === "AUTH_REQUIRED" ? 401 : 500);
  }
});
