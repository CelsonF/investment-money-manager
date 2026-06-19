import type {
  InvestmentNode,
  AportAllocation,
  AportDistributionResult,
} from '../types/allocation-tree'

// ─── Tree utilities ────────────────────────────────────────────────────────────

/** Bottom-up: returns the total value of a node (sum of leaf descendants). */
export function computeNodeValue(node: InvestmentNode): number {
  if (!node.children || node.children.length === 0) return node.current_value
  return node.children.reduce((s, c) => s + computeNodeValue(c), 0)
}

/** Total portfolio value (sum of root children). */
export function totalPortfolioValue(root: InvestmentNode): number {
  return computeNodeValue(root)
}

/** Depth-first traversal — calls `fn` on every node. */
export function walkTree(
  node: InvestmentNode,
  fn: (node: InvestmentNode, path: string[], depth: number) => void,
  path: string[] = [],
  depth = 0,
): void {
  fn(node, path, depth)
  if (node.children) {
    for (const child of node.children) {
      walkTree(child, fn, [...path, node.name], depth + 1)
    }
  }
}

// ─── Core algorithm ────────────────────────────────────────────────────────────

/**
 * Distributes `aportValue` across the leaf nodes of `tree` using a
 * buy-only, proportional-deficit strategy.
 *
 * Rules:
 * - Never suggest selling. Nodes above target receive 0.
 * - At each level: ideal_value_i = (target_pct_i / 100) * (parent_current + parent_aport)
 *   deficit_i = max(0, ideal_value_i - current_value_i)
 * - If total deficit ≤ aport: fill all deficits exactly, distribute remainder
 *   proportionally to all children (maintaining balance going forward).
 * - If total deficit > aport: scale allocations proportionally to deficits.
 * - Cascade: each child's allocation becomes the aport for its own children.
 */
export function calculateAportDistribution(
  tree: InvestmentNode,
  aportValue: number,
): AportDistributionResult {
  const portfolioBefore = computeNodeValue(tree)
  const leafAllocations: AportAllocation[] = []

  function cascade(
    node: InvestmentNode,
    availableAport: number,
    path: string[],
    globalTargetPct: number, // product of ancestor target_percentages
  ): void {
    const children = node.children
    if (!children || children.length === 0) {
      // Leaf node — record the allocation
      const currentGlobalPct =
        portfolioBefore > 0 ? (node.current_value / portfolioBefore) * 100 : 0
      const newValue = node.current_value + availableAport
      const portfolioAfter = portfolioBefore + aportValue
      const newGlobalPct = portfolioAfter > 0 ? (newValue / portfolioAfter) * 100 : 0

      if (availableAport > 0.005) {
        leafAllocations.push({
          node_id: node.id,
          node_name: node.name,
          path,
          amount: Math.round(availableAport * 100) / 100,
          current_value: node.current_value,
          current_pct_global: Math.round(currentGlobalPct * 100) / 100,
          target_pct_local: node.target_percentage,
          target_pct_global: Math.round(globalTargetPct * 100) / 100,
          new_value: Math.round(newValue * 100) / 100,
          new_pct_global: Math.round(newGlobalPct * 100) / 100,
        })
      }
      return
    }

    const parentCurrentValue = children.reduce((s, c) => s + computeNodeValue(c), 0)
    const newParentTotal = parentCurrentValue + availableAport

    // Step 1: calculate each child's ideal value and deficit
    const childData = children.map((child) => {
      const childCurrentValue = computeNodeValue(child)
      const idealValue = (child.target_percentage / 100) * newParentTotal
      const deficit = Math.max(0, idealValue - childCurrentValue)
      return { child, childCurrentValue, idealValue, deficit }
    })

    const totalDeficit = childData.reduce((s, d) => s + d.deficit, 0)

    // Step 2: determine how much each child gets
    const childAllocations = childData.map(({ child, deficit }) => {
      let alloc: number
      if (totalDeficit === 0) {
        // Everyone is at or above target — distribute proportionally to target weights
        alloc = availableAport * (child.target_percentage / 100)
      } else if (totalDeficit <= availableAport) {
        // Enough to fill all deficits
        const remainder = availableAport - totalDeficit
        // Remainder goes proportionally (maintains balance going forward)
        const extraShare = remainder * (child.target_percentage / 100)
        alloc = deficit + extraShare
      } else {
        // Not enough — scale proportionally to deficits
        alloc = availableAport * (deficit / totalDeficit)
      }
      return { child, alloc }
    })

    // Step 3: cascade into each child's subtree
    for (const { child, alloc } of childAllocations) {
      if (alloc < 0.005) continue
      const childGlobalTarget = (globalTargetPct * child.target_percentage) / 100
      cascade(child, alloc, [...path, child.name], childGlobalTarget)
    }
  }

  // Kick off from root's children (root is just a container)
  if (tree.children && tree.children.length > 0) {
    const rootGlobal = tree.target_percentage
    cascade(tree, aportValue, [], rootGlobal)
  }

  const totalAllocated = leafAllocations.reduce((s, a) => s + a.amount, 0)

  return {
    allocations: leafAllocations.sort((a, b) => b.amount - a.amount),
    aport_total: aportValue,
    total_allocated: Math.round(totalAllocated * 100) / 100,
    unallocated: Math.round((aportValue - totalAllocated) * 100) / 100,
    portfolio_value_before: portfolioBefore,
    portfolio_value_after: portfolioBefore + aportValue,
  }
}

// ─── Flat table helper ─────────────────────────────────────────────────────────

export interface FlatRow {
  id: string
  name: string
  type: InvestmentNode['type']
  depth: number
  path: string[]
  parent_id: string | null
  target_percentage: number
  current_value: number
  computed_value: number
  global_target_pct: number
  global_current_pct: number
  gap_pct: number
  has_children: boolean
  subRows?: FlatRow[]
}

export function buildFlatRows(
  node: InvestmentNode,
  parentId: string | null = null,
  depth = 0,
  ancestorTargetPct = 100,
  portfolioTotal?: number,
): FlatRow {
  const computed = computeNodeValue(node)
  const total = portfolioTotal ?? computed
  const globalTarget = (ancestorTargetPct * node.target_percentage) / 100
  const globalCurrent = total > 0 ? (computed / total) * 100 : 0
  const gap = globalTarget - globalCurrent // negative = above target

  const subRows = node.children?.map((child) =>
    buildFlatRows(child, node.id, depth + 1, globalTarget, total),
  )

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    depth,
    path: [],
    parent_id: parentId,
    target_percentage: node.target_percentage,
    current_value: node.current_value,
    computed_value: computed,
    global_target_pct: Math.round(globalTarget * 100) / 100,
    global_current_pct: Math.round(globalCurrent * 100) / 100,
    gap_pct: Math.round(gap * 100) / 100,
    has_children: Boolean(node.children?.length),
    subRows,
  }
}
