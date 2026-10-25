const STEPS = [
  { title: 'Your page', body: 'The widget displays a changing code.' },
  { title: "The visitor's phone", body: 'The camera reads the code from the screen.' },
  { title: 'Polyguard', body: 'Checks the timing and the device attestation.' },
  { title: 'Your server', body: 'One POST to /v2/siteverify, then compare hostname.' },
];

/** The Trust Check flow as four boxes and three arrows. */
export function FlowDiagram() {
  const w = 760;
  const boxW = 160;
  const gap = 40;
  const boxH = 96;
  const y = 12;

  return (
    <svg
      viewBox={`0 0 ${w} ${boxH + 24}`}
      role="img"
      aria-label="Your page shows a changing code; the visitor's phone camera reads it from the screen; Polyguard checks the timing and the device attestation; your server verifies the result with one POST to /v2/siteverify and compares hostname."
      className="h-auto w-full"
      fontFamily="var(--font-sans)"
    >
      <defs>
        <marker
          id="arrow"
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
      {STEPS.map((s, i) => {
        const x = i * (boxW + gap);
        return (
          <g key={s.title}>
            <rect
              x={x}
              y={y}
              width={boxW}
              height={boxH}
              rx="8"
              fill={i === 2 ? 'var(--color-primary)' : 'var(--color-surface)'}
              stroke={i === 2 ? 'var(--color-primary)' : 'var(--color-line-strong)'}
            />
            <text
              x={x + 12}
              y={y + 28}
              fontSize="14"
              fontWeight="600"
              fill={i === 2 ? '#ffffff' : 'var(--color-ink)'}
            >
              {s.title}
            </text>
            <foreignObject x={x + 12} y={y + 38} width={boxW - 24} height={boxH - 46}>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: i === 2 ? 'var(--color-on-dark)' : 'var(--color-muted)',
                }}
              >
                {s.body}
              </p>
            </foreignObject>
            {i < STEPS.length - 1 && (
              <line
                x1={x + boxW + 4}
                y1={y + boxH / 2}
                x2={x + boxW + gap - 4}
                y2={y + boxH / 2}
                stroke="var(--color-primary)"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
