import { describe, expect, it } from "vitest";
import { exactUploadKey, externalBetKey, sameUploadId } from "@/lib/betting/duplicate";

describe("duplicate identity", () => {
  it("recognizes the same upload id", () => expect(sameUploadId("upload-1", "upload-1")).toBe(true));
  it("normalizes file hashes within one user", () => expect(exactUploadKey("user-a", "ABC123")).toBe(exactUploadKey("user-a", "abc123")));
  it("keeps identical files from different users distinct", () => expect(exactUploadKey("user-a", "abc")).not.toBe(exactUploadKey("user-b", "abc")));
  it("normalizes bookmaker identity but preserves the visible Bet ID", () => expect(externalBetKey("user-a", " Bet365 ", "O/123")).toBe(externalBetKey("user-a", "bet365", "O/123")));
});
