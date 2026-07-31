import {
  FHSA_ANNUAL_LIMITS,
  FHSA_LIFETIME_LIMIT,
  FHSA_MAX_CARRYFORWARD,
  FHSA_MAX_PARTICIPATION_YEARS,
  LIMIT_SOURCES,
  LIMITS_LAST_VERIFIED,
  RRSP_DOLLAR_LIMITS,
  RRSP_EARNED_INCOME_RATE,
  RRSP_OVERCONTRIBUTION_BUFFER,
  TFSA_ANNUAL_LIMITS,
} from "../data/limits";
import { formatCad } from "../calculators/shared/money";
import { ScreenHeading } from "../components/ScreenHeading";

function LimitTable({
  title,
  limits,
}: {
  title: string;
  limits: Readonly<Record<number, number>>;
}) {
  const years = Object.keys(limits)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="card" style={{ marginBottom: "var(--space-5)" }}>
      <h2>{title}</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col" className="numeric">
              Annual limit
            </th>
          </tr>
        </thead>
        <tbody>
          {years.map((year) => (
            <tr key={year}>
              <td>{year}</td>
              <td className="numeric">{formatCad(limits[year] * 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AboutScreen() {
  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="about-screen"
    >
      <ScreenHeading>About this tool</ScreenHeading>

      <div
        className="banner banner--warning"
        role="note"
        style={{ marginBottom: "var(--space-6)" }}
      >
        <p style={{ margin: 0 }}>
          This tool provides <strong>estimates only</strong> and is not tax, legal, or financial
          advice. Contribution room depends on your full history of residency, income, pension
          adjustments, withdrawals, and transfers - much of which this tool does not track for you.
          Your official contribution room is shown in your CRA My Account and on your Notice of
          Assessment. Limit figures below were last verified against CRA sources on{" "}
          {LIMITS_LAST_VERIFIED}.
        </p>
      </div>

      <section aria-labelledby="rules-heading" style={{ marginBottom: "var(--space-6)" }}>
        <h2 id="rules-heading">How each account works</h2>
        <div className="grid">
          <div className="card">
            <h3>TFSA</h3>
            <p>
              Room accrues from the year you turn 18 (as a Canadian resident) and carries forward
              indefinitely. Withdrawals are added back to your room, but only on January 1 of the
              following year - withdrawing and re-contributing in the same year still counts as an
              over-contribution.
            </p>
          </div>
          <div className="card">
            <h3>FHSA</h3>
            <p>
              Room does not accrue until you open an account: $
              {FHSA_MAX_CARRYFORWARD.toLocaleString()} per year once opened, up to $
              {FHSA_LIFETIME_LIMIT.toLocaleString()} lifetime. Unused room carries forward, but only
              up to ${FHSA_MAX_CARRYFORWARD.toLocaleString()} from the immediately preceding year.
              The account closes after {FHSA_MAX_PARTICIPATION_YEARS} years, at age 71, or the year
              after your first qualifying withdrawal - whichever comes first.
            </p>
          </div>
          <div className="card">
            <h3>RRSP</h3>
            <p>
              New room each year is {RRSP_EARNED_INCOME_RATE * 100}% of your prior year's earned
              income, capped at that year's published dollar maximum, minus any pension adjustment.
              There is no minimum age, only an upper bound: you must collapse your RRSP by the end
              of the year you turn 71. A ${RRSP_OVERCONTRIBUTION_BUFFER.toLocaleString()} lifetime
              cushion absorbs small over-contributions before the penalty applies.
            </p>
          </div>
        </div>
      </section>

      <LimitTable title="TFSA annual limits" limits={TFSA_ANNUAL_LIMITS} />
      <LimitTable title="FHSA annual limits" limits={FHSA_ANNUAL_LIMITS} />
      <LimitTable title="RRSP dollar limits" limits={RRSP_DOLLAR_LIMITS} />

      <section aria-labelledby="sources-heading">
        <h2 id="sources-heading">Sources</h2>
        <ul style={{ listStyle: "none" }}>
          {LIMIT_SOURCES.map((source) => (
            <li key={source.url} style={{ marginBottom: "var(--space-2)" }}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
