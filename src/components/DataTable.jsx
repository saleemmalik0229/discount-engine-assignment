/**
 * DataTable.jsx
 *
 * Reusable table driven by column config with optional cell renderers.
 *
 * @param {{ columns: Array<{ key: string, label: string, render?: (value: *, row: *) => import('react').ReactNode }>, rows: Object[], emptyMessage?: string }} props
 */

function EmptyTableIcon() {
  return (
    <svg
      className="data-table-empty__icon"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function DataTable({ columns, rows, emptyMessage = 'No data loaded.' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="data-table-empty" role="status">
        <EmptyTableIcon />
        <span>{emptyMessage}</span>
      </div>
    )
  }

  return (
    <div className="data-table-wrap" tabIndex={0} role="region" aria-label="Scrollable data table">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
