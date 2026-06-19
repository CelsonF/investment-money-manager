import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type ExpandedState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronRight, Globe, Layers, FolderOpen, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useLocaleStore } from '../../store/localeStore'
import { buildFlatRows, type FlatRow } from '../../lib/rebalancing'
import type { InvestmentNode } from '../../types/allocation-tree'

interface AllocationTableProps {
  root: InvestmentNode
  onEditTarget?: (nodeId: string, current: number) => void
}

const TYPE_ICON: Record<InvestmentNode['type'], React.ElementType> = {
  region: Globe,
  asset_class: Layers,
  category: FolderOpen,
  asset: TrendingUp,
}

const TYPE_COLOR: Record<InvestmentNode['type'], string> = {
  region: 'text-violet-400',
  asset_class: 'text-blue-400',
  category: 'text-teal-400',
  asset: 'text-emerald-400',
}

const DEPTH_INDENT = ['', 'pl-4', 'pl-8', 'pl-12', 'pl-16']

function GapBadge({ gap }: { gap: number }) {
  if (Math.abs(gap) < 0.1) {
    return (
      <span className="rounded-full bg-stone-700/50 px-2 py-0.5 text-[10px] text-stone-400">
        ≈ meta
      </span>
    )
  }
  if (gap > 0) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-400">
        −{gap.toFixed(1)}%
      </span>
    )
  }
  return (
    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
      +{Math.abs(gap).toFixed(1)}%
    </span>
  )
}

export default function AllocationTable({ root, onEditTarget }: AllocationTableProps) {
  const { money } = useLocaleStore()
  const [expanded, setExpanded] = useState<ExpandedState>({ [root.id]: true })

  const data = useMemo(() => [buildFlatRows(root)], [root])

  const columns = useMemo<ColumnDef<FlatRow>[]>(
    () => [
      {
        id: 'name',
        header: 'Ativo / Classe',
        accessorKey: 'name',
        cell: ({ row, getValue }) => {
          const Icon = TYPE_ICON[row.original.type]
          const colorCls = TYPE_COLOR[row.original.type]
          const depth = row.depth
          return (
            <div
              className={cn('flex items-center gap-2', DEPTH_INDENT[depth] ?? 'pl-16')}
            >
              {row.getCanExpand() ? (
                <button
                  onClick={row.getToggleExpandedHandler()}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-stone-500 hover:text-white"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown size={13} />
                  ) : (
                    <ChevronRight size={13} />
                  )}
                </button>
              ) : (
                <span className="w-5 shrink-0" />
              )}
              <Icon size={13} className={cn('shrink-0', colorCls)} />
              <span
                className={cn(
                  'text-sm',
                  depth === 0 ? 'font-semibold text-white' : 'text-stone-200',
                )}
              >
                {getValue<string>()}
              </span>
            </div>
          )
        },
      },
      {
        id: 'target_pct',
        header: 'Meta local',
        accessorKey: 'target_percentage',
        cell: ({ row, getValue }) => (
          <button
            onClick={() => onEditTarget?.(row.original.id, getValue<number>())}
            className={cn(
              'rounded-lg px-2 py-1 text-sm tabular-nums',
              onEditTarget
                ? 'cursor-pointer text-stone-300 hover:bg-white/[0.06] hover:text-white'
                : 'cursor-default text-stone-400',
            )}
          >
            {getValue<number>().toFixed(1)}%
          </button>
        ),
      },
      {
        id: 'global_target',
        header: 'Meta global',
        accessorKey: 'global_target_pct',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-stone-400">
            {getValue<number>().toFixed(1)}%
          </span>
        ),
      },
      {
        id: 'current_pct',
        header: 'Atual',
        accessorKey: 'global_current_pct',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-stone-200">
            {getValue<number>().toFixed(1)}%
          </span>
        ),
      },
      {
        id: 'gap',
        header: 'Desvio',
        accessorKey: 'gap_pct',
        cell: ({ getValue }) => <GapBadge gap={getValue<number>()} />,
      },
      {
        id: 'value',
        header: 'Valor atual',
        accessorKey: 'computed_value',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-white">
            {money(getValue<number>())}
          </span>
        ),
      },
    ],
    [money, onEditTarget],
  )

  const table = useReactTable({
    data,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
      <table className="w-full border-collapse text-left">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-white/[0.06]">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="bg-white/[0.02] px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-stone-500"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                'border-b border-white/[0.04] transition-colors last:border-0',
                row.depth === 0
                  ? 'bg-white/[0.01]'
                  : 'hover:bg-white/[0.03]',
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2.5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
