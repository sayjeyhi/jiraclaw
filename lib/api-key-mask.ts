/**
 * Masks an API key for display: first 2 + "***" + last 3 characters.
 */
export function maskApiKey(key: string): string {
  const t = key.trim();
  if (t.length <= 5) return "***";
  const first2 = t.slice(0, 2);
  const last3 = t.slice(-3);
  return `${first2}***${last3}`;
}
