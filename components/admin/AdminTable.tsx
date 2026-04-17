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
    <div className="w-full overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/30">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i}
                className={`px-6 py-4 font-semibold ${col.sortable ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
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
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr 
                key={item.id} 
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-slate-300">
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
