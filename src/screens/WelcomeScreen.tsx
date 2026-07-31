import { Link, useNavigate } from "react-router";
import { ScreenHeading } from "../components/ScreenHeading";
import { actions } from "../store/actions";
import { useStore } from "../store/StoreContext";

export function WelcomeScreen() {
  const { dispatch } = useStore();
  const navigate = useNavigate();

  function handleGetStarted() {
    dispatch(actions.disclaimerAccepted());
    navigate("/profile");
  }

  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-7)" }}
      data-testid="welcome-screen"
    >
      <div className="card" style={{ maxWidth: "38rem", margin: "0 auto" }}>
        <ScreenHeading>Contribution Limits Tool</ScreenHeading>
        <p>
          Track your remaining TFSA, FHSA, and RRSP contribution room across years, in one place,
          without spreadsheets.
        </p>
        <p>
          This tool gives <strong>estimates only</strong> - it is not tax, legal, or financial
          advice. Your official contribution room is shown in your CRA My Account and on your Notice
          of Assessment. Nothing you enter leaves your browser: all data is stored only on this
          device.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
          <button
            type="button"
            className="button button--primary"
            data-testid="get-started-button"
            onClick={handleGetStarted}
          >
            Get started
          </button>
          <Link to="/about" className="button button--secondary">
            See how it works
          </Link>
        </div>
      </div>
    </main>
  );
}
