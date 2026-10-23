export type DiffRow = { from: string; to: string; note?: string };

/** Side-by-side diff of a migration table: removed on the left, added on the right. */
export function DiffTable({ fromLabel, rows }: { fromLabel: string; rows: DiffRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[640px] border-collapse text-left font-mono text-[13px] leading-relaxed">
        <thead className="bg-surface font-sans text-[13px]">
          <tr>
            <th scope="col" className="w-1/2 border-b border-line px-4 py-2.5 font-semibold">
              {fromLabel}
            </th>
            <th
              scope="col"
              className="w-1/2 border-b border-l border-line px-4 py-2.5 font-semibold"
            >
              Polyguard
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.from} className="align-top">
              <td className="border-b border-line bg-del-bg px-4 py-2.5 text-del-ink">
                <span aria-hidden="true" className="mr-2 select-none">
                  -
                </span>
                <span className="sr-only">Remove: </span>
                {row.from}
              </td>
              <td className="border-b border-l border-line bg-add-bg px-4 py-2.5 text-add-ink">
                <span aria-hidden="true" className="mr-2 select-none">
                  +
                </span>
                <span className="sr-only">Add: </span>
                {row.to}
                {row.note && (
                  <span className="mt-1 block font-sans text-[12px] text-muted">{row.note}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
