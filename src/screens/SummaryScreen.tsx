import { ScreenHeading } from "../components/ScreenHeading";

export function SummaryScreen() {
  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="summary-screen"
    >
      <div className="card">
        <ScreenHeading>Summary</ScreenHeading>
        <p>A combined summary and export options are coming soon.</p>
      </div>
    </main>
  );
}
