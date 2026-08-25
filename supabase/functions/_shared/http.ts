export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

export function handleOptions(request: Request) {
  return request.method === "OPTIONS" ? new Response("ok", { headers: corsHeaders }) : null;
}

export function codeFromError(error: unknown) {
  const message = error instanceof Error ? error.message : "INTERNAL_ERROR";
  const allowed = new Set(["AUTH_REQUIRED","USERNAME_TAKEN","INVALID_USERNAME","INVALID_IMPORT","INVALID_FILE","FILE_TOO_LARGE","UNSUPPORTED_FILE_TYPE","UPLOAD_NOT_FOUND","UPLOAD_NOT_READY","UPLOAD_FORBIDDEN","DUPLICATE_UPLOAD","NOT_A_BETSLIP","BET_NOT_SETTLED","GEMINI_FAILED","GEMINI_INVALID_RESPONSE","EXTRACTION_NEEDS_REVIEW","BET_DUPLICATE","IMPORT_ALREADY_FINALIZED"]);
  return allowed.has(message) ? message : "INTERNAL_ERROR";
}
