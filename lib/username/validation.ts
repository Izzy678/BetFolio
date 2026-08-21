import { z } from "zod";

export const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "support",
  "api",
  "root",
  "system",
  "null",
  "undefined",
]);

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export const usernameSchema = z
  .string()
  .transform(normalizeUsername)
  .pipe(
    z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(24, "Username must be at most 24 characters.")
      .regex(/^[a-z0-9_]+$/, "Use only lowercase letters, numbers, and underscores.")
      .refine((value) => !RESERVED_USERNAMES.has(value), "That username is reserved."),
  );

export function validateUsername(value: string) {
  return usernameSchema.safeParse(value);
}
