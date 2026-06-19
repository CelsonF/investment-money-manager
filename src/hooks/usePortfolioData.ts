import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTree, saveTree } from '../server/allocationTree'
import { validateSiblingWeights, isTreeValid } from '../lib/allocationValidation'
import { calculateAportDistribution } from '../lib/rebalancing'
import type { AllocationTree, AportDistributionResult } from '../types/allocation-tree'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  tree: ['allocationTree'] as const,
} as const

// ─── Fetch hook ───────────────────────────────────────────────────────────────

/**
 * Fetches the allocation tree from the server with a 60s stale time.
 * Automatically cached — multiple consumers share the same request.
 */
export function usePortfolioData() {
  return useQuery({
    queryKey: QUERY_KEYS.tree,
    queryFn: () => getTree(),
    staleTime: 60_000,
  })
}

// ─── Mutation: save full tree ─────────────────────────────────────────────────

/**
 * Saves the updated allocation tree.
 * Validates sibling weights before sending; rejects if any level is invalid.
 */
export function useUpdateTargets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tree: AllocationTree) => {
      const errors = validateSiblingWeights(tree.root)
      if (errors.length > 0) {
        const detail = errors
          .map((e) => `"${e.path.join(' → ')}": soma = ${e.actual_sum}%`)
          .join('\n')
        throw new Error(`Pesos inválidos — corrija antes de salvar:\n${detail}`)
      }
      return saveTree({ data: tree })
    },
    onSuccess: (_data, tree) => {
      // Optimistic update: put the new tree straight into the cache
      queryClient.setQueryData(QUERY_KEYS.tree, tree)
    },
  })
}

// ─── Optimistic node edit ─────────────────────────────────────────────────────

/**
 * Returns a helper that optimistically updates one node's target_percentage
 * in the cache (no server round-trip yet — call useUpdateTargets to persist).
 */
export function useOptimisticNodeEdit() {
  const queryClient = useQueryClient()

  return (nodeId: string, newTargetPct: number) => {
    queryClient.setQueryData<AllocationTree>(QUERY_KEYS.tree, (prev) => {
      if (!prev) return prev

      function patch(node: AllocationTree['root']): AllocationTree['root'] {
        if (node.id === nodeId) return { ...node, target_percentage: newTargetPct }
        if (node.children) return { ...node, children: node.children.map(patch) }
        return node
      }

      return { ...prev, root: patch(prev.root) }
    })
  }
}

// ─── Aport simulator ─────────────────────────────────────────────────────────

/**
 * Runs the buy-only rebalancing algorithm on the cached tree.
 * This is a pure client-side computation — no server call needed.
 */
export function useAportSimulation(
  aportValue: number,
): { result: AportDistributionResult | null; treeValid: boolean } {
  const { data: tree } = usePortfolioData()

  if (!tree || aportValue <= 0) return { result: null, treeValid: Boolean(tree && isTreeValid(tree.root)) }

  const treeValid = isTreeValid(tree.root)
  const result = treeValid ? calculateAportDistribution(tree.root, aportValue) : null

  return { result, treeValid }
}
