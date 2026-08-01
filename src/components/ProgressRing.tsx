interface ProgressRingProps {
  percent: number;
  size?: number;
}

export function ProgressRing({ percent, size = 64 }: ProgressRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className="progress-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(clamped)}% of room used`}
    >
      <svg width={size} height={size}>
        <circle
          className="progress-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="progress-ring-label" aria-hidden="true">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}
