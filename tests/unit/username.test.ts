import { describe, expect, it } from "vitest";
import { normalizeUsername, validateUsername } from "@/lib/username/validation";

describe("username validation", () => {
  it.each([["Izzy", "izzy"], ["IZZY", "izzy"], ["  izzy  ", "izzy"]])("normalizes %s", (input, expected) => expect(normalizeUsername(input)).toBe(expected));
  it("accepts trimmed valid usernames", () => expect(validateUsername("  izzy_24 ").success).toBe(true));
  it.each(["iz zy", "izzy!", "ab", "administrator", "this_username_is_far_too_long"])('rejects "%s"', (input) => expect(validateUsername(input).success).toBe(false));
  it("rejects email addresses with a clear message", () => {
    const result = validateUsername("amuneisrael224@gmail.com");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toMatch(/not an email/i);
  });
  it("produces the same canonical value for case-insensitive duplicates", () => expect(validateUsername("Izzy").data).toBe(validateUsername("IZZY").data));
});
