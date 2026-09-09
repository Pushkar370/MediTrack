export default function DataTable({ columns, data, emptyMessage = "No records found." }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-ink/50 border-b border-sage/30">
            {columns.map((col) => (
              <th key={col.key} className="font-medium px-3 py-3 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-ink/50 py-10">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                className="border-b border-sage/20 hover:bg-background/60 transition"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-3 align-middle">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
