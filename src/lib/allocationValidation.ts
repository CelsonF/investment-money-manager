import { z } from 'zod'
import type { InvestmentNode } from '../types/allocation-tree'

// ─── Zod schemas ───────────────────────────────────────────────────────────────

const nodeTypeSchema = z.enum(['region', 'asset_class', 'category', 'asset'])

// Recursive schema (Zod lazy for self-reference)
const InvestmentNodeSchema: z.ZodType<InvestmentNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(100),
    type: nodeTypeSchema,
    target_percentage: z.number().min(0).max(100),
    current_value: z.number().min(0),
    children: z.array(InvestmentNodeSchema).optional(),
  }),
)

export const AllocationTreeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  root: InvestmentNodeSchema,
  emergency_reserve: z
    .object({
      id: z.string(),
      name: z.string(),
      target_value: z.number().min(0),
      current_value: z.number().min(0),
    })
    .optional(),
  updated_at: z.string().datetime(),
})

// ─── Sibling-sum validation ────────────────────────────────────────────────────

export interface ValidationError {
  path: string[]     // path of the parent node whose children don't sum to 100
  actual_sum: number
  node_names: string[]
}

/**
 * Recursively validates that sibling `target_percentage` values sum to exactly
 * 100 at every level of the tree. Returns an array of errors (empty = valid).
 *
 * Precision: sums are rounded to 2 decimal places before comparison to avoid
 * floating-point noise (e.g., 33.33 + 33.33 + 33.34 = 100.00 ✓).
 */
export function validateSiblingWeights(
  node: InvestmentNode,
  path: string[] = [],
): ValidationError[] {
  const errors: ValidationError[] = []

  if (!node.children || node.children.length === 0) return errors

  const sum = Math.round(
    node.children.reduce((s, c) => s + c.target_percentage, 0) * 100,
  ) / 100

  if (sum !== 100) {
    errors.push({
      path: [...path, node.name],
      actual_sum: sum,
      node_names: node.children.map((c) => c.name),
    })
  }

  for (const child of node.children) {
    errors.push(...validateSiblingWeights(child, [...path, node.name]))
  }

  return errors
}

/**
 * Returns `true` if the entire tree passes sibling-weight validation.
 * Use `validateSiblingWeights` for detailed error reporting.
 */
export function isTreeValid(node: InvestmentNode): boolean {
  return validateSiblingWeights(node).length === 0
}

/**
 * Zod-based single-level validator. Useful for validating a sibling group
 * before the user saves edits to a specific level of the tree.
 */
export const siblingGroupSchema = z
  .array(
    z.object({
      id: z.string(),
      name: z.string(),
      target_percentage: z.number().min(0).max(100),
    }),
  )
  .superRefine((siblings, ctx) => {
    const sum = Math.round(
      siblings.reduce((s, n) => s + n.target_percentage, 0) * 100,
    ) / 100
    if (sum !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `A soma dos pesos deve ser exatamente 100%. Atual: ${sum}%`,
        path: ['target_percentage'],
      })
    }
  })

export type SiblingGroup = z.infer<typeof siblingGroupSchema>
