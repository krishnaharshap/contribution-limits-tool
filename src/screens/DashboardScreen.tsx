import { ScreenHeading } from "../components/ScreenHeading";

export function DashboardScreen() {
  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="dashboard-screen"
    >
      <div className="card">
        <ScreenHeading>Dashboard</ScreenHeading>
        <p>Your account overview is coming soon.</p>
      </div>
    </main>
  );
}
