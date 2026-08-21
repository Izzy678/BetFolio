export const errorMessages: Record<string, string> = {
  USERNAME_TAKEN: "That username is already in use. Try another one.",
  INVALID_USERNAME: "Use 3–24 lowercase letters, numbers, or underscores.",
  INVALID_FILE: "Choose a valid screenshot or PDF.",
  FILE_TOO_LARGE: "That file is larger than 10 MB.",
  UNSUPPORTED_FILE_TYPE: "Upload a JPEG, PNG, WebP, or PDF.",
  DUPLICATE_UPLOAD: "You already imported this exact betslip.",
  BET_DUPLICATE: "A bet with this bookmaker Bet ID is already tracked.",
  BET_NOT_SETTLED: "This slip does not appear to be settled yet.",
  NOT_A_BETSLIP: "This file does not appear to be a betting slip.",
  GEMINI_FAILED: "We couldn’t read this betslip. Please try again.",
  IMPORT_ALREADY_FINALIZED: "This betslip has already been added.",
  INTERNAL_ERROR: "Something went wrong. Please try again.",
};

export function friendlyError(code?: string) {
  return code ? (errorMessages[code] ?? errorMessages.INTERNAL_ERROR) : errorMessages.INTERNAL_ERROR;
}
