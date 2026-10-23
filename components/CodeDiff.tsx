import { sideBySide, type DiffCell } from '@/lib/line-diff';

const CELL: Record<string, string> = {
  same: 'text-line',
  del: 'bg-[#3b1f24] text-[#ffd7d5]',
  add: 'bg-[#1b3a2a] text-[#c9f2d6]',
  empty: 'bg-[#0b111a]',
};
const MARK: Record<string, string> = { same: ' ', del: '-', add: '+' };

function Cell({ cell, side }: { cell: DiffCell; side: 'left' | 'right' }) {
  const kind = cell ? cell.kind : 'empty';
  return (
    <div
      className={`px-3 whitespace-pre ${CELL[kind]} ${side === 'right' ? 'border-l border-[#243041]' : ''}`}
    >
      {cell && (
        <>
          <span aria-hidden="true" className="mr-2 inline-block w-2 select-none opacity-70">
            {MARK[cell.kind]}
          </span>
          {cell.kind !== 'same' && (
            <span className="sr-only">{cell.kind === 'del' ? 'Removed: ' : 'Added: '}</span>
          )}
          {cell.text || ' '}
        </>
      )}
    </div>
  );
}

export function CodeDiff({
  before,
  after,
  fromLabel,
  toLabel = 'Polyguard',
}: {
  before: string;
  after: string;
  fromLabel: string;
  toLabel?: string;
}) {
  const lines = sideBySide(before, after);
  return (
    <div className="overflow-x-auto rounded-lg bg-ink">
      <div className="grid w-max min-w-full grid-cols-[minmax(max-content,1fr)_minmax(max-content,1fr)] font-mono text-[12.5px] leading-[1.7]">
        <div className="border-b border-[#243041] px-3 py-2 font-sans text-xs font-semibold text-on-dark">
          {fromLabel}
        </div>
        <div className="border-b border-l border-[#243041] px-3 py-2 font-sans text-xs font-semibold text-on-dark">
          {toLabel}
        </div>
        {lines.map((line, i) => (
          <div key={i} className="contents">
            <Cell cell={line.left} side="left" />
            <Cell cell={line.right} side="right" />
          </div>
        ))}
      </div>
    </div>
  );
}
