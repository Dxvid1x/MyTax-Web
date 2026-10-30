// Bank names/export instructions alone do not establish a tested layout.
export const statementBankCoverage = [
  { id: "kbank", name: "กสิกรไทย" },
  { id: "scb", name: "ไทยพาณิชย์" },
  { id: "krungthai", name: "กรุงไทย" },
  { id: "krungsri", name: "กรุงศรี" },
  { id: "ttb", name: "ทีทีบี" },
  { id: "gsb", name: "ออมสิน" },
  { id: "bangkok", name: "กรุงเทพ" },
] as const;
export function detectStatementProfile(input: {
  format: string;
  rows?: string[][];
}) {
  // No bank-specific variant has anonymised fixtures yet. Generic mapping remains available.
  void input;
  return null;
}
