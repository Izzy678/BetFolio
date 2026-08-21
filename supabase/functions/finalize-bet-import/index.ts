import { authenticatedClient } from "../_shared/auth.ts";
import { codeFromError, handleOptions, json } from "../_shared/http.ts";

const betTypes = new Set(["single","accumulator","bet_builder","system","each_way","other"]);
const statuses = new Set(["won","lost","void","push","cashout"]);
function validUuid(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }

Deno.serve(async (request) => {
  const options = handleOptions(request); if (options) return options;
  if (request.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const { supabase, user } = await authenticatedClient(request);
    const body = await request.json().catch(() => null) as { uploadId?: unknown; bet?: Record<string,unknown> } | null;
    if (!validUuid(body?.uploadId) || !body?.bet) throw new Error("INVALID_IMPORT");
    const bet = { ...body.bet }; const amountFields = [bet.cashStake, bet.promotionalStake, bet.displayedReturn, bet.totalOddsDecimal].filter((value) => value != null);
    if (!betTypes.has(String(bet.betType)) || !statuses.has(String(bet.status)) || typeof bet.currency !== "string" || !/^[A-Z]{3}$/.test(bet.currency) || amountFields.some((value) => typeof value !== "number" || !Number.isFinite(value) || value < 0) || !Array.isArray(bet.legs) || bet.legs.length > 100) throw new Error("INVALID_IMPORT");
    if (Number(bet.promotionalStake) > 0 && bet.status !== "lost") throw new Error("INVALID_IMPORT");
    if ((bet.status === "void" || bet.status === "push") && bet.displayedReturn != null && Math.abs(Number(bet.displayedReturn) - Number(bet.cashStake)) > 0.009) throw new Error("INVALID_IMPORT");
    if (bet.status === "won" && !["gross_return","net_profit"].includes(String(bet.returnKind))) throw new Error("INVALID_IMPORT");
    if (bet.status === "cashout" && bet.returnKind !== "cashout") throw new Error("INVALID_IMPORT");
    const hasTimezone = (value: unknown) => typeof value === "string" && /(Z|[+-]\d{2}:\d{2})$/i.test(value);
    if (!hasTimezone(bet.placedAt)) bet.placedAt = null;
    if (!hasTimezone(bet.settledAt)) bet.settledAt = null;
    const { data: upload } = await supabase.from("bet_uploads").select("status,user_id").eq("id", body.uploadId).eq("user_id", user.id).single();
    if (!upload) throw new Error("UPLOAD_NOT_FOUND");
    if (upload.status === "imported") { const { data: existing } = await supabase.from("bets").select("id").eq("source_upload_id", body.uploadId).single(); return json({ ok: true, betId: existing?.id, idempotent: true }); }
    const { data: betId, error } = await supabase.rpc("finalize_bet_import", { p_upload_id: body.uploadId, p_bet: bet });
    if (error) { if (error.message.includes("BET_DUPLICATE") || error.code === "23505") throw new Error("BET_DUPLICATE"); throw error; }
    return json({ ok: true, betId });
  } catch (error) {
    const code = codeFromError(error);
    return json({ ok: false, code }, code === "BET_DUPLICATE" ? 409 : code === "UPLOAD_NOT_FOUND" ? 404 : code === "AUTH_REQUIRED" ? 401 : code === "INVALID_IMPORT" ? 400 : 500);
  }
});
