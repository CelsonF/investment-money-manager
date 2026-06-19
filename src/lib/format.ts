export const money = (n: number | string | null | undefined): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n) || 0)

export const pct = (part: number, total: number): number =>
  total ? Math.round((part / total) * 100) : 0
