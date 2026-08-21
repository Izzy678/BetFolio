export function exactUploadKey(userId: string, sha256: string) {
  return `${userId}:file:${sha256.toLowerCase()}`;
}

export function externalBetKey(userId: string, bookmaker: string, externalBetId: string) {
  return `${userId}:bet:${bookmaker.trim().toLowerCase()}:${externalBetId.trim()}`;
}

export function sameUploadId(previousUploadId: string, requestedUploadId: string) {
  return previousUploadId === requestedUploadId;
}
