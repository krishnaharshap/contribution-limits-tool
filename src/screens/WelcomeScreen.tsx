import { ScreenHeading } from "../components/ScreenHeading";

export function WelcomeScreen() {
  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="welcome-screen"
    >
      <div className="card">
        <ScreenHeading>Welcome</ScreenHeading>
        <p>Track remaining TFSA, FHSA, and RRSP contribution room across years.</p>
      </div>
    </main>
  );
}
