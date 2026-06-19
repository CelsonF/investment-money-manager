import { createServerFn } from '@tanstack/react-start'
import { AllocationTreeSchema } from '../lib/allocationValidation'
import type { AllocationTree } from '../types/allocation-tree'

const TREE_FILE = 'data/allocation-tree.json'
const SEED_FILE = 'src/db/db.json'

export const getTree = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AllocationTree> => {
    const { readFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const cwd = process.cwd()

    // Try runtime file first
    try {
      const raw = await readFile(join(cwd, TREE_FILE), 'utf-8')
      const result = AllocationTreeSchema.safeParse(JSON.parse(raw))
      if (result.success) return result.data
    } catch {
      // fall through to seed
    }

    // Fall back to seed
    const raw = await readFile(join(cwd, SEED_FILE), 'utf-8')
    return AllocationTreeSchema.parse((JSON.parse(raw) as { allocationTree: unknown }).allocationTree)
  },
)

export const saveTree = createServerFn({ method: 'POST' })
  .inputValidator((tree: AllocationTree) => AllocationTreeSchema.parse(tree))
  .handler(async ({ data }) => {
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { dirname, join } = await import('node:path')
    const file = join(process.cwd(), TREE_FILE)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(
      file,
      JSON.stringify({ ...data, updated_at: new Date().toISOString() }, null, 2),
      'utf-8',
    )
    return { ok: true }
  })

export const updateNodeTargets = createServerFn({ method: 'POST' })
  .inputValidator(
    (payload: { tree: AllocationTree; nodeId: string; newTargetPct: number }) => payload,
  )
  .handler(async ({ data }) => {
    const { readFile, mkdir, writeFile } = await import('node:fs/promises')
    const { dirname, join } = await import('node:path')
    const cwd = process.cwd()

    // Load current tree
    let tree: AllocationTree
    try {
      const raw = await readFile(join(cwd, TREE_FILE), 'utf-8')
      tree = AllocationTreeSchema.parse(JSON.parse(raw))
    } catch {
      const raw = await readFile(join(cwd, SEED_FILE), 'utf-8')
      tree = AllocationTreeSchema.parse(
        (JSON.parse(raw) as { allocationTree: unknown }).allocationTree,
      )
    }

    // Mutate the target on the specified node
    function patchNode(node: typeof tree.root): typeof tree.root {
      if (node.id === data.nodeId) {
        return { ...node, target_percentage: data.newTargetPct }
      }
      if (node.children) {
        return { ...node, children: node.children.map(patchNode) }
      }
      return node
    }

    const updated: AllocationTree = {
      ...tree,
      root: patchNode(tree.root),
      updated_at: new Date().toISOString(),
    }

    AllocationTreeSchema.parse(updated)

    const file = join(cwd, TREE_FILE)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, JSON.stringify(updated, null, 2), 'utf-8')

    return { ok: true, tree: updated }
  })
