import type { ReactNode } from 'react';

type Step = { title: string; body: string };
export type Lane = { label: string; steps: Step[] };

export const TWO_DEVICES: Lane = {
  label: 'On a computer: the visitor scans the screen with their phone',
  steps: [
    { title: 'Your form', body: 'Shows a code that keeps changing.' },
    { title: "The visitor's phone", body: 'Reads the code with its camera.' },
    { title: 'Polyguard', body: 'Checks the timing, and that the phone is real.' },
    { title: 'Your server', body: 'Verifies the result with one request.' },
  ],
};

export const ONE_DEVICE: Lane = {
  label: 'On a phone: the visitor confirms on that phone',
  steps: [
    { title: 'Your form', body: 'Opens a Polyguard page on the same phone.' },
    {
      title: "The visitor's phone",
      body: 'Runs an App Clip on iPhone, or the browser on Android.',
    },
    { title: 'Polyguard', body: 'Checks that the phone is real.' },
    { title: 'Your server', body: 'Verifies the result with one request.' },
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

/** One lane of the postcaptcha flow: a title above an image and four steps; the steps stack below lg. */
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
