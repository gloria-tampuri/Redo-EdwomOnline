/**
 * Generates a unique order ID in format: ORD-XXXXXXXX-XXXXXXXX
 * Uses random alphanumeric characters for uniqueness
 */
export function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let part1 = "";
  let part2 = "";

  for (let i = 0; i < 8; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `ORD-${part1}-${part2}`;
}
