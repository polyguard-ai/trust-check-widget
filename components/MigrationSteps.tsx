import { withCode } from '@/components/InlineCode';
import type { Migration, MigrationStep } from '@/lib/migrations';

function Step({ step, muted }: { step: MigrationStep; muted?: boolean }) {
  return (
    <li className="flex flex-col gap-1.5">
      <span>{withCode(step.text)}</span>
      {step.from && step.to && (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[13px]">
          <span
            className={`rounded px-1.5 py-0.5 ${muted ? 'bg-surface text-muted' : 'bg-del-bg text-del-ink'}`}
          >
            {step.from}
          </span>
          <span aria-hidden="true" className="text-muted">
            →
          </span>
          <span
            className={`rounded px-1.5 py-0.5 ${muted ? 'bg-surface text-muted' : 'bg-add-bg text-add-ink'}`}
          >
            {step.to}
          </span>
        </span>
      )}
    </li>
  );
}

export function MigrationSteps({ migration: m }: { migration: Migration }) {
  return (
    <div className="flex min-w-0 flex-col gap-5 rounded-xl border border-line p-6">
      <h3 className="m-0 text-lg font-semibold">From {m.fromLabel}</h3>
      <ol className="m-0 flex list-decimal flex-col gap-4 pl-5 text-[15px] leading-relaxed text-ink">
        {m.required.map((s) => (
          <Step key={s.text} step={s} />
        ))}
      </ol>
      <div className="flex flex-col gap-3 border-t border-line pt-4 text-muted">
        <h4 className="m-0 text-sm font-semibold">Optional, for later cleanup</h4>
        <ul className="m-0 flex list-disc flex-col gap-3 pl-5 text-sm leading-relaxed">
          {m.optional.map((s) => (
            <Step key={s.text} step={s} muted />
          ))}
        </ul>
      </div>
    </div>
  );
}
