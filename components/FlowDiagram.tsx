import type { ReactNode } from 'react';

type Step = { title: string; body: string };
export type Lane = { label: string; steps: Step[] };

export const TWO_DEVICES: Lane = {
  label: 'Two devices: the visitor is on a laptop or desktop',
  steps: [
    { title: 'Your page', body: 'The widget displays a changing code.' },
    { title: "The visitor's phone", body: 'The camera reads the code from the screen.' },
    { title: 'Polyguard', body: 'Checks the timing and the device attestation.' },
    { title: 'Your server', body: 'Verifies with one POST.' },
  ],
};

export const ONE_DEVICE: Lane = {
  label: 'One device: the visitor is on their phone',
  steps: [
    { title: 'Your page', body: 'The widget opens the check on the same phone.' },
    { title: "The visitor's phone", body: 'The App Clip or browser check attests the device.' },
    { title: 'Polyguard', body: 'Checks the attestation.' },
    { title: 'Your server', body: 'Verifies with one POST.' },
  ],
};

function Arrow({ vertical }: { vertical: boolean }) {
  return vertical ? (
    <svg
      viewBox="0 0 16 28"
      aria-hidden="true"
      className="absolute top-full left-1/2 h-7 w-4 -translate-x-1/2 lg:hidden"
    >
      <path d="M8 4v15" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M3 17l5 8 5-8z" fill="var(--color-primary)" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 40 16"
      aria-hidden="true"
      className="absolute top-1/2 left-full hidden h-4 w-10 -translate-y-1/2 lg:block"
    >
      <path d="M4 8h23" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M25 3l9 5-9 5z" fill="var(--color-primary)" />
    </svg>
  );
}

/** One lane of the Trust Check flow: a title above an image and four steps; the steps stack below lg. */
export function FlowLane({ lane, image }: { lane: Lane; image: ReactNode }) {
  return (
    <figure className="m-0 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-4 sm:gap-x-8 lg:gap-y-3">
      <figcaption className="col-span-2 text-lg leading-snug font-semibold text-ink lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:self-end lg:text-[13px] lg:text-muted">
        {lane.label}
      </figcaption>
      <div className="row-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">{image}</div>
      <ol className="col-start-2 row-start-2 m-0 grid max-w-lg list-none gap-7 p-0 lg:max-w-none lg:grid-cols-4 lg:gap-10">
        {lane.steps.map((s, i) => {
          const dark = i === 2;
          return (
            <li
              key={s.title}
              className={`relative flex flex-col gap-1 rounded-lg border p-3 ${
                dark ? 'border-primary bg-primary' : 'border-line-strong bg-surface'
              }`}
            >
              <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-ink'}`}>
                {s.title}
              </span>
              <span
                className={`text-[13px] leading-snug lg:text-xs ${dark ? 'text-on-dark' : 'text-muted'}`}
              >
                {s.body}
              </span>
              {i < lane.steps.length - 1 && (
                <>
                  <Arrow vertical />
                  <Arrow vertical={false} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
