'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'

interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
  sortable?: boolean
}

interface AdminTableProps<T> {
  data: T[]
  columns: Column<T>[]
  sortConfig?: { key: string; direction: 'asc' | 'desc' }
  onSort?: (key: string) => void
  emptyMessage?: string
}

export default function AdminTable<T extends { id: string | number }>({
  data,
  columns,
  sortConfig,
  onSort,
  emptyMessage = 'No data found'
}: AdminTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-glass bg-background/50 backdrop-blur-md shadow-lg transition-colors duration-300">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-[10px] uppercase font-bold tracking-widest bg-muted/40 text-slate-500 dark:text-slate-400 border-b border-glass">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i}
                className={`px-6 py-5 ${col.sortable ? 'cursor-pointer hover:bg-muted/60 transition-colors' : ''}`}
                onClick={() => col.sortable && onSort && typeof col.accessor === 'string' && onSort(col.accessor as string)}
              >
                <div className="flex items-center">
                  {col.header}
                  {col.sortable && sortConfig?.key === col.accessor && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr 
                key={item.id} 
                className="border-b border-glass hover:bg-emerald-500/5 transition-colors group/row"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-slate-600 dark:text-slate-300 group-hover/row:text-foreground transition-colors font-medium">
                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
