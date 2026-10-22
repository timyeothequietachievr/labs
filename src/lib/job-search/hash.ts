import { createHash } from "crypto";

export function hashJd(text: string) {
  return createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
}
