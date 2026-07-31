import { Link } from "react-router";
import { formatCad } from "../calculators/shared/money";
import type { AccountStatus } from "./accountStatus";
import { ProgressRing } from "./ProgressRing";

interface RoomCardProps {
  title: string;
  remainingRoomCents: number;
  percentUsed: number;
  status: AccountStatus;
  whyText: string;
  detailHref: string;
  testId: string;
}

export function RoomCard({
  title,
  remainingRoomCents,
  percentUsed,
  status,
  whyText,
  detailHref,
  testId,
}: RoomCardProps) {
  return (
    <div className="card card--interactive" data-testid={testId}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ marginBottom: "var(--space-2)" }}>{title}</h3>
          <p
            style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: 700,
              color: "var(--color-text)",
              margin: 0,
            }}
            data-testid={`${testId}-remaining`}
          >
            {formatCad(remainingRoomCents)}
          </p>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--font-size-sm)" }}>{whyText}</p>
        </div>
        <ProgressRing percent={percentUsed} />
      </div>

      <div
        style={{
          marginTop: "var(--space-4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className={`badge badge--${status.tone}`} data-testid={`${testId}-status`}>
          {status.label}
        </span>
        <Link to={detailHref} className="button button--secondary button--small">
          View details
        </Link>
      </div>
    </div>
  );
}
