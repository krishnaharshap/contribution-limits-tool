import { ScreenHeading } from "../components/ScreenHeading";

export function ProfileScreen() {
  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="profile-screen"
    >
      <div className="card">
        <ScreenHeading>Your profile</ScreenHeading>
        <p>Profile setup is coming soon.</p>
      </div>
    </main>
  );
}
