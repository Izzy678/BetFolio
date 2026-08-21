import { describe, expect, it } from "vitest";
import { credentialsSchema, passwordSchema, usernameToAuthEmail } from "@/lib/username/credentials";

describe("username password credentials", () => {
  it("maps canonical usernames to one deterministic Supabase Auth identity", () => {
    expect(usernameToAuthEmail("Izzy")).toBe("izzy@users.ledgerline.invalid");
    expect(usernameToAuthEmail(" IZZY ")).toBe(usernameToAuthEmail("izzy"));
  });

  it("requires a password of at least eight characters", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("secure-passphrase").success).toBe(true);
  });

  it("validates username and password together", () => {
    expect(credentialsSchema.safeParse({ username: "izzy", password: "password123" }).success).toBe(true);
    expect(credentialsSchema.safeParse({ username: "iz zy", password: "password123" }).success).toBe(false);
  });
});
