import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const ASSET_TYPE_IDS = ['stock', 'reit', 'fixed_income', 'etf', 'crypto', 'fund', 'bdr', 'other'] as const
const CURRENCY = ['BRL', 'USD'] as const

const AssetSchema = z.object({
  id: z.string().uuid(),
  ticker: z.string().min(1).max(20),
  type: z.enum(ASSET_TYPE_IDS),
  currency: z.enum(CURRENCY).default('BRL'),
  quantity: z.number().nonnegative().nullable(),
  averagePrice: z.number().nonnegative(),
  createdAt: z.string().datetime(),
})

const TransactionSchema = z.object({
  id: z.string().uuid(),
  ticker: z.string().min(1).max(20),
  assetType: z.enum(ASSET_TYPE_IDS),
  currency: z.enum(CURRENCY).default('BRL'),
  kind: z.enum(['buy', 'sell']),
  quantity: z.number().nonnegative(),
  price: z.number().nonnegative(),
  otherCosts: z.number().nonnegative(),
  total: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string().datetime(),
})

const DividendSchema = z.object({
  id: z.string().uuid(),
  ticker: z.string().min(1).max(20),
  assetType: z.enum(ASSET_TYPE_IDS),
  currency: z.enum(CURRENCY).default('BRL'),
  kind: z.enum(['dividendo', 'jcp', 'rendimento', 'amortizacao', 'outros']),
  quantity: z.number().nonnegative(),
  amountPerUnit: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string().datetime(),
})

const ProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'viewer']),
  avatarUrl: z.string().nullable(),
  initials: z.string().min(1).max(3),
  createdAt: z.string().datetime(),
})

const AssetsPayloadSchema = z.array(AssetSchema)

const PORTFOLIO_FILE = 'src/db/data/portfolio.json'
const PROFILE_FILE = 'src/db/data/profile.json'
const TRANSACTIONS_FILE = 'src/db/data/transactions.json'
const DIVIDENDS_FILE = 'src/db/data/dividends.json'
const SEED_FILE = 'src/db/db.json'

export const getAssets = createServerFn({ method: 'GET' }).handler(async () => {
  const { readFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  try {
    const raw = await readFile(join(process.cwd(), PORTFOLIO_FILE), 'utf-8')
    const result = AssetsPayloadSchema.safeParse(JSON.parse(raw)?.assets)
    if (result.success) return result.data
  } catch {
    // fall through to seed
  }
  try {
    const raw = await readFile(join(process.cwd(), SEED_FILE), 'utf-8')
    const result = AssetsPayloadSchema.safeParse(JSON.parse(raw)?.assets)
    return result.success ? result.data : []
  } catch {
    return []
  }
})

export const saveAssets = createServerFn({ method: 'POST' })
  .inputValidator((assets: z.infer<typeof AssetsPayloadSchema>) =>
    AssetsPayloadSchema.parse(assets),
  )
  .handler(async ({ data }) => {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { dirname, join } = await import('node:path')
    const file = join(process.cwd(), PORTFOLIO_FILE)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(
      file,
      JSON.stringify(
        { updatedAt: new Date().toISOString(), total: data.length, assets: data },
        null,
        2,
      ),
      'utf-8',
    )
    return { ok: true, total: data.length }
  })

export const getProfile = createServerFn({ method: 'GET' }).handler(async () => {
  const { readFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  try {
    const raw = await readFile(join(process.cwd(), PROFILE_FILE), 'utf-8')
    const result = ProfileSchema.safeParse(JSON.parse(raw))
    if (result.success) return result.data
  } catch {
    // fall through to seed
  }
  const raw = await readFile(join(process.cwd(), SEED_FILE), 'utf-8')
  return ProfileSchema.parse(JSON.parse(raw).profile)
})

export const updateProfile = createServerFn({ method: 'POST' })
  .inputValidator((profile: z.infer<typeof ProfileSchema>) =>
    ProfileSchema.parse(profile),
  )
  .handler(async ({ data }) => {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { dirname, join } = await import('node:path')
    const file = join(process.cwd(), PROFILE_FILE)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
    return { ok: true }
  })

export const getPortfolioHistory = createServerFn({ method: 'GET' }).handler(async () => {
  const { readFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  try {
    const raw = await readFile(join(process.cwd(), SEED_FILE), 'utf-8')
    const data = JSON.parse(raw) as { portfolioHistory?: Array<{ month: string; totalValue: number }> }
    return data.portfolioHistory ?? []
  } catch {
    return []
  }
})

/** Fetches the current USD → BRL exchange rate from the AwesomeAPI (free, no auth). */
export const fetchExchangeRate = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { USDBRL: { bid: string; create_date: string } }
    return { rate: parseFloat(data.USDBRL.bid), updatedAt: data.USDBRL.create_date }
  } catch {
    return { rate: null, updatedAt: null }
  }
})

// ─── Transactions ─────────────────────────────────────────────────────────────

const TransactionsPayload = z.object({ transactions: z.array(TransactionSchema) })

export const getTransactions = createServerFn({ method: 'GET' }).handler(async () => {
  const { readFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  try {
    const raw = await readFile(join(process.cwd(), TRANSACTIONS_FILE), 'utf-8')
    const r = TransactionsPayload.safeParse(JSON.parse(raw))
    if (r.success) return r.data.transactions
  } catch { /* fall through */ }
  return []
})

export const saveTransactions = createServerFn({ method: 'POST' })
  .inputValidator((v: z.infer<typeof TransactionsPayload>) => TransactionsPayload.parse(v))
  .handler(async ({ data }) => {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { dirname, join } = await import('node:path')
    const file = join(process.cwd(), TRANSACTIONS_FILE)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, JSON.stringify({ updatedAt: new Date().toISOString(), ...data }, null, 2))
    return { ok: true }
  })

// ─── Dividends ────────────────────────────────────────────────────────────────

const DividendsPayload = z.object({ dividends: z.array(DividendSchema) })

export const getDividends = createServerFn({ method: 'GET' }).handler(async () => {
  const { readFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  try {
    const raw = await readFile(join(process.cwd(), DIVIDENDS_FILE), 'utf-8')
    const r = DividendsPayload.safeParse(JSON.parse(raw))
    if (r.success) return r.data.dividends
  } catch { /* fall through */ }
  return []
})

export const saveDividends = createServerFn({ method: 'POST' })
  .inputValidator((v: z.infer<typeof DividendsPayload>) => DividendsPayload.parse(v))
  .handler(async ({ data }) => {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { dirname, join } = await import('node:path')
    const file = join(process.cwd(), DIVIDENDS_FILE)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, JSON.stringify({ updatedAt: new Date().toISOString(), ...data }, null, 2))
    return { ok: true }
  })

// ─── Price quotes (brapi.dev — free, no auth for basic usage) ─────────────────

interface BrapiResult {
  symbol: string
  regularMarketPrice: number
  regularMarketChangePercent: number
  currency: string
}

export const fetchQuotes = createServerFn({ method: 'GET' })
  .inputValidator((tickers: string[]) => z.array(z.string().min(1)).parse(tickers))
  .handler(async ({ data }) => {
    if (!data.length) return {} as Record<string, { price: number; changePercent: number }>
    try {
      const joined = data.join(',')
      const res = await fetch(`https://brapi.dev/api/quote/${joined}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as { results?: BrapiResult[] }
      const out: Record<string, { price: number; changePercent: number }> = {}
      for (const q of json.results ?? []) {
        if (q.regularMarketPrice != null) {
          out[q.symbol] = { price: q.regularMarketPrice, changePercent: q.regularMarketChangePercent ?? 0 }
        }
      }
      return out
    } catch {
      return {} as Record<string, { price: number; changePercent: number }>
    }
  })
