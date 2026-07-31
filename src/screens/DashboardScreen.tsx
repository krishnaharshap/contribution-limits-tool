import { Navigate } from "react-router";
import { FHSA_LIFETIME_LIMIT } from "../data/limits";
import { addCents, formatCad } from "../calculators/shared/money";
import { getAccountStatus } from "../components/accountStatus";
import { RoomCard } from "../components/RoomCard";
import { ScreenHeading } from "../components/ScreenHeading";
import { WarningBanner } from "../components/WarningBanner";
import { selectAllResults } from "../store/selectors";
import { useStore } from "../store/StoreContext";
import { getCurrentYear } from "../utils/currentYear";

function percentOf(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

export function DashboardScreen() {
  const { state } = useStore();
  const asOfYear = getCurrentYear();

  if (state.profile.birthYear === null) {
    return <Navigate to="/profile" replace />;
  }

  const results = selectAllResults(state, asOfYear);
  const tfsa = results.tfsa;
  const fhsa = results.fhsa;
  const rrsp = results.rrsp;

  if (!tfsa || !fhsa || !rrsp) {
    return <Navigate to="/profile" replace />;
  }

  const totalRemainingCents = addCents(
    tfsa.remainingRoomCents,
    fhsa.remainingRoomCents,
    rrsp.remainingRoomCents,
  );
  const allWarnings = [...tfsa.warnings, ...fhsa.warnings, ...rrsp.warnings];

  const tfsaStatus = getAccountStatus({
    eligible: tfsa.eligible,
    hasRoom: true,
    remainingRoomCents: tfsa.remainingRoomCents,
    isOverContributed: tfsa.isOverContributed,
    estimatedMonthlyPenaltyCents: tfsa.estimatedMonthlyPenaltyCents,
    notEligibleLabel: "Not yet eligible",
  });

  const fhsaStatus = getAccountStatus({
    eligible: fhsa.eligible,
    hasRoom: fhsa.hasAccountOpen,
    remainingRoomCents: fhsa.remainingRoomCents,
    isOverContributed: fhsa.isOverContributed,
    estimatedMonthlyPenaltyCents: fhsa.estimatedMonthlyPenaltyCents,
    notEligibleLabel: "Not yet eligible",
    noRoomLabel: fhsa.isParticipationPeriodOver ? "Account closed" : "No account open",
  });

  const rrspStatus = getAccountStatus({
    eligible: rrsp.eligible,
    hasRoom: rrsp.yearlyBreakdown.length > 0,
    remainingRoomCents: rrsp.remainingRoomCents,
    isOverContributed: rrsp.isOverContributed,
    estimatedMonthlyPenaltyCents: rrsp.estimatedMonthlyPenaltyCents,
    notEligibleLabel: `Must collapse by ${rrsp.mustCollapseByYear}`,
    noRoomLabel: "No income on record",
  });

  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="dashboard-screen"
    >
      <ScreenHeading>Dashboard</ScreenHeading>
      <p>
        Total remaining room across all accounts:{" "}
        <strong data-testid="dashboard-total-remaining">{formatCad(totalRemainingCents)}</strong>
      </p>

      <WarningBanner warnings={allWarnings} />

      <div className="grid">
        <RoomCard
          title="TFSA"
          testId="room-card-tfsa"
          remainingRoomCents={tfsa.remainingRoomCents}
          percentUsed={percentOf(tfsa.totalContributedCents, tfsa.totalRoomEarnedCents)}
          status={tfsaStatus}
          whyText={`${formatCad(tfsa.totalRoomEarnedCents)} room earned - ${formatCad(tfsa.totalContributedCents)} contributed`}
          detailHref="/account/tfsa"
        />
        <RoomCard
          title="FHSA"
          testId="room-card-fhsa"
          remainingRoomCents={fhsa.remainingRoomCents}
          percentUsed={percentOf(fhsa.lifetimeContributedCents, FHSA_LIFETIME_LIMIT * 100)}
          status={fhsaStatus}
          whyText={
            fhsa.hasAccountOpen
              ? `${formatCad(fhsa.lifetimeContributedCents)} of ${formatCad(FHSA_LIFETIME_LIMIT * 100)} lifetime limit used`
              : "Open an account to start building room"
          }
          detailHref="/account/fhsa"
        />
        <RoomCard
          title="RRSP"
          testId="room-card-rrsp"
          remainingRoomCents={rrsp.remainingRoomCents}
          percentUsed={percentOf(
            rrsp.totalContributedCents,
            addCents(rrsp.totalContributedCents, rrsp.remainingRoomCents),
          )}
          status={rrspStatus}
          whyText={`${formatCad(rrsp.totalContributedCents)} contributed against your income-based room`}
          detailHref="/account/rrsp"
        />
      </div>
    </main>
  );
}
