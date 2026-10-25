const ROWS = [
  {
    phone: 'iPhone',
    without:
      'The hand-off page in Safari links to the App Clip, which runs the Trust Check with device attestation.',
    with: 'The hand-off page opens Polyguard Mobile.',
  },
  {
    phone: 'Android',
    without:
      'The hand-off page runs a browser check with Android key attestation. The presence score is reported as OFFLINE and does not fail the check.',
    with: 'The hand-off page opens Polyguard Mobile.',
  },
  {
    phone: 'Desktop',
    without: 'The visitor scans the code with their phone and continues as above.',
    with: 'Same as above.',
  },
];

export function PhoneRequirements() {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm leading-relaxed">
        <thead className="bg-surface text-[13px]">
          <tr>
            <th scope="col" className="border-b border-line px-4 py-2.5 font-semibold">
              Visitor on
            </th>
            <th scope="col" className="border-b border-line px-4 py-2.5 font-semibold">
              Without the app
            </th>
            <th scope="col" className="border-b border-line px-4 py-2.5 font-semibold">
              With Polyguard Mobile
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.phone} className="align-top">
              <th scope="row" className="border-b border-line px-4 py-2.5 font-semibold">
                {r.phone}
              </th>
              <td className="border-b border-line px-4 py-2.5 text-muted">{r.without}</td>
              <td className="border-b border-line px-4 py-2.5 text-muted">{r.with}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
