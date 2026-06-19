import { createServerFn } from '@tanstack/react-start'
import type { Asset, Profile } from '../types'

const PORTFOLIO_FILE = 'data/portfolio.json'
const PROFILE_FILE = 'data/profile.json'
const SEED_FILE = 'src/db/db.json'

export const getAssets = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Asset>> => {
    const { readFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    try {
      const raw = await readFile(join(process.cwd(), PORTFOLIO_FILE), 'utf-8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed?.assets) ? (parsed.assets as Array<Asset>) : []
    } catch {
      try {
        const raw = await readFile(join(process.cwd(), SEED_FILE), 'utf-8')
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed?.assets) ? (parsed.assets as Array<Asset>) : []
      } catch {
        return []
      }
    }
  },
)

export const saveAssets = createServerFn({ method: 'POST' })
  .inputValidator((assets: Array<Asset>) => assets)
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

export const getProfile = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Profile> => {
    const { readFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    try {
      const raw = await readFile(join(process.cwd(), PROFILE_FILE), 'utf-8')
      return JSON.parse(raw) as Profile
    } catch {
      const raw = await readFile(join(process.cwd(), SEED_FILE), 'utf-8')
      const parsed = JSON.parse(raw)
      return parsed.profile as Profile
    }
  },
)

export const updateProfile = createServerFn({ method: 'POST' })
  .inputValidator((profile: Profile) => profile)
  .handler(async ({ data }) => {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { dirname, join } = await import('node:path')
    const file = join(process.cwd(), PROFILE_FILE)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
    return { ok: true }
  })
