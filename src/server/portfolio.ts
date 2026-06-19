import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const AssetSchema = z.object({
  id: z.string().uuid(),
  ticker: z.string().min(1).max(20),
  type: z.enum(['stock', 'reit', 'fixed_income', 'etf', 'crypto', 'fund', 'other']),
  quantity: z.number().nonnegative().nullable(),
  averagePrice: z.number().nonnegative(),
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
