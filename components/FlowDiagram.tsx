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

const W = 760;
const BOX_W = 160;
const GAP = 40;
const BOX_H = 92;
const LABEL_H = 26;

/** One lane of the Trust Check flow: four boxes and three arrows. */
export function FlowLane({ lane, id }: { lane: Lane; id: string }) {
  const y = LABEL_H;
  const label = lane.steps.map((s) => `${s.title}: ${s.body}`).join(' ');
  return (
    <svg
      viewBox={`0 0 ${W} ${LABEL_H + BOX_H + 4}`}
      role="img"
      aria-label={`${lane.label}. ${label}`}
      className="h-auto w-full"
      fontFamily="var(--font-sans)"
    >
      <defs>
        <marker
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="var(--color-primary)" />
        </marker>
      </defs>
      <text x={0} y={14} fontSize="13" fontWeight="600" fill="var(--color-muted)">
        {lane.label}
      </text>
      {lane.steps.map((s, i) => {
        const x = i * (BOX_W + GAP);
        const dark = i === 2;
        return (
          <g key={s.title}>
            <rect
              x={x}
              y={y}
              width={BOX_W}
              height={BOX_H}
              rx="8"
              fill={dark ? 'var(--color-primary)' : 'var(--color-surface)'}
              stroke={dark ? 'var(--color-primary)' : 'var(--color-line-strong)'}
            />
            <text
              x={x + 12}
              y={y + 26}
              fontSize="14"
              fontWeight="600"
              fill={dark ? '#ffffff' : 'var(--color-ink)'}
            >
              {s.title}
            </text>
            <foreignObject x={x + 12} y={y + 36} width={BOX_W - 24} height={BOX_H - 42}>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: dark ? 'var(--color-on-dark)' : 'var(--color-muted)',
                }}
              >
                {s.body}
              </p>
            </foreignObject>
            {i < lane.steps.length - 1 && (
              <line
                x1={x + BOX_W + 4}
                y1={y + BOX_H / 2}
                x2={x + BOX_W + GAP - 4}
                y2={y + BOX_H / 2}
                stroke="var(--color-primary)"
                strokeWidth="2"
                markerEnd={`url(#arrow-${id})`}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
