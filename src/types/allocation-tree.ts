// ─── Node types ───────────────────────────────────────────────────────────────

export type NodeType = 'region' | 'asset_class' | 'category' | 'asset'

export interface InvestmentNode {
  id: string
  name: string
  type: NodeType
  /** % relative to the sum of siblings (siblings must sum to 100) */
  target_percentage: number
  /** Current invested value in display currency */
  current_value: number
  children?: InvestmentNode[]
}

export interface EmergencyReserve {
  id: string
  name: string
  /** Absolute target value (not a percentage) */
  target_value: number
  current_value: number
}

export interface AllocationTree {
  id: string
  name: string
  root: InvestmentNode
  emergency_reserve?: EmergencyReserve
  updated_at: string
}

// ─── Rebalancing algorithm output ─────────────────────────────────────────────

export interface AportAllocation {
  node_id: string
  node_name: string
  /** Full path from root to this leaf node */
  path: string[]
  /** Amount to invest in display currency */
  amount: number
  current_value: number
  /** Current % of total portfolio (before aport) */
  current_pct_global: number
  /** Target % relative to parent */
  target_pct_local: number
  /** Global target % (product of ancestors) */
  target_pct_global: number
  new_value: number
  /** % of total after aport */
  new_pct_global: number
}

export interface AportDistributionResult {
  allocations: AportAllocation[]
  aport_total: number
  total_allocated: number
  /** Rounding remainder — can be placed in any node or left in cash */
  unallocated: number
  portfolio_value_before: number
  portfolio_value_after: number
}

// ─── UI / validation helpers ──────────────────────────────────────────────────

/** Flat view of a node with computed depth and path for table rendering */
export interface FlatNode extends Omit<InvestmentNode, 'children'> {
  depth: number
  path: string[]
  parent_id: string | null
  has_children: boolean
  /** Bottom-up computed value (sum of leaf descendants) */
  computed_value: number
  /** Global % of total portfolio */
  global_pct: number
  /** Gap between current global % and target global % */
  gap_pct: number
}
