import { Navigate, useParams } from "react-router";
import { ScreenHeading } from "../components/ScreenHeading";

const ACCOUNT_LABELS = { tfsa: "TFSA", fhsa: "FHSA", rrsp: "RRSP" } as const;
type AccountRouteParam = keyof typeof ACCOUNT_LABELS;

function isAccountType(value: string | undefined): value is AccountRouteParam {
  return value !== undefined && value in ACCOUNT_LABELS;
}

export function AccountScreen() {
  const { accountType } = useParams<{ accountType: string }>();

  if (!isAccountType(accountType)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="account-screen"
    >
      <div className="card">
        <ScreenHeading>{ACCOUNT_LABELS[accountType]}</ScreenHeading>
        <p>Contribution tracking for {ACCOUNT_LABELS[accountType]} is coming soon.</p>
      </div>
    </main>
  );
}
