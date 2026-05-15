'use client'

import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T = object> {
  key: string
  header: string
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

interface TableProps<T extends object> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  skeletonRows?: number
  className?: string
  rowKey?: (row: T, index: number) => string | number
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-[#F3F4F6]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className={[
              'h-4 rounded shimmer',
              i === 0 ? 'w-3/4' : i % 3 === 0 ? 'w-1/2' : 'w-2/3',
            ].join(' ')}
          />
        </td>
      ))}
    </tr>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={999} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            aria-hidden="true"
            className="w-10 h-10 text-[#D1D5DB]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
            />
          </svg>
          <p className="text-sm text-[#6B7280] font-['DM_Sans',sans-serif]">{message}</p>
        </div>
      </td>
    </tr>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function Table<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  skeletonRows = 5,
  className = '',
  rowKey,
}: TableProps<T>) {
  return (
    <div
      className={[
        'w-full overflow-x-auto rounded-xl border border-[#E5E7EB] shadow-sm bg-white',
        className,
      ].join(' ')}
    >
      <table className="min-w-full divide-y divide-[#F3F4F6] text-sm font-['DM_Sans',sans-serif]">
        {/* Head */}
        <thead className="bg-[#F9FAFB]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-[#F3F4F6]">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow key={i} cols={columns.length} />
            ))
          ) : data.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            data.map((row, index) => {
              const key = rowKey ? rowKey(row, index) : index
              return (
                <tr
                  key={key}
                  className="hover:bg-[#F9FAFB] transition-colors duration-100"
                >
                  {columns.map((col) => {
                    const rawValue = (row as Record<string, unknown>)[col.key]
                    const cell = col.render
                      ? col.render(rawValue, row, index)
                      : (rawValue as React.ReactNode)

                    return (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-[#374151] align-middle"
                      >
                        {cell ?? <span className="text-[#9CA3AF]">—</span>}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
