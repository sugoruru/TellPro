import crypto from "crypto";

export const returnRandomText32 = () => {
  const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const N = 32;
  return Array.from(crypto.randomFillSync(new Uint8Array(N))).map((n) => S[n % S.length]).join('');
}