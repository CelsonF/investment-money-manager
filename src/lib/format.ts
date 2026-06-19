export const pct = (part: number, total: number): number =>
  total ? Math.round((part / total) * 100) : 0
