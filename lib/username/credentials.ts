import { z } from "zod";
import { usernameSchema } from "./validation";

const AUTH_EMAIL_DOMAIN = "users.ledgerline.invalid";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.");

export const credentialsSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export function usernameToAuthEmail(username: string) {
  const canonical = usernameSchema.parse(username);
  return `${canonical}@${AUTH_EMAIL_DOMAIN}`;
}
