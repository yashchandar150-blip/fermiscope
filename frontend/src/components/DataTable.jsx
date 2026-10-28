// Reusable table.
// columns: [{ key: "title", label: "Title", render: (row) => <b>{row.title}</b> }]
// onRowClick(row) is optional.
export default function DataTable({ columns, rows, onRowClick, emptyText = "No records found." }) {
  return (
    <div className="table-responsive">
      <table className="table fs-table align-middle">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted-space py-4">
                {emptyText}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={row._id}
              className={onRowClick ? "row-click" : ""}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key] ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
