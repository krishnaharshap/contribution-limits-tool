import { Navigate, useParams } from "react-router";
import { ScreenHeading } from "../components/ScreenHeading";
import { useStore } from "../store/StoreContext";
import { FhsaPanel } from "./account/FhsaPanel";
import { RrspPanel } from "./account/RrspPanel";
import { TfsaPanel } from "./account/TfsaPanel";

const ACCOUNT_LABELS = { tfsa: "TFSA", fhsa: "FHSA", rrsp: "RRSP" } as const;
type AccountRouteParam = keyof typeof ACCOUNT_LABELS;

function isAccountType(value: string | undefined): value is AccountRouteParam {
  return value !== undefined && value in ACCOUNT_LABELS;
}

export function AccountScreen() {
  const { accountType } = useParams<{ accountType: string }>();
  const { state } = useStore();

  if (!isAccountType(accountType)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (state.profile.birthYear === null) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="account-screen"
    >
      <ScreenHeading>{ACCOUNT_LABELS[accountType]}</ScreenHeading>
      {accountType === "tfsa" && <TfsaPanel />}
      {accountType === "fhsa" && <FhsaPanel />}
      {accountType === "rrsp" && <RrspPanel />}
    </main>
  );
}
