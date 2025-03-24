import crypto from 'crypto'

export function generateChecksum(queryString: string, secret: string) {
  return crypto.createHash("sha1").update(queryString + secret).digest("hex");
}
