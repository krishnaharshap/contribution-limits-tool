import type { Warning } from "../calculators/shared/errors";

interface WarningBannerProps {
  warnings: readonly Warning[];
}

export function WarningBanner({ warnings }: WarningBannerProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="banner banner--warning" role="status" data-testid="warning-banner">
      <ul style={{ listStyle: "none", margin: 0 }}>
        {warnings.map((warning, index) => (
          <li key={`${warning.code}-${warning.year ?? index}`}>{warning.message}</li>
        ))}
      </ul>
    </div>
  );
}
