export function q(num: number | string | null | undefined) {
  if (num === null || num === undefined) return "Q0.00";
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (Number.isNaN(n)) return "Q0.00";
  return `Q${n.toFixed(2)}`;
}
