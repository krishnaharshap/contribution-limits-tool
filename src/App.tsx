import { HashRouter, Navigate, Route, Routes } from "react-router";
import { NavBar } from "./components/NavBar";
import { RouteAnnouncer } from "./components/RouteAnnouncer";
import { StoreProvider, useStore } from "./store/StoreContext";
import { AboutScreen } from "./screens/AboutScreen";
import { AccountScreen } from "./screens/AccountScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SummaryScreen } from "./screens/SummaryScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";

// Sends a first-time visitor to the disclaimer, a returning visitor
// with no profile yet to setup, and everyone else straight to their data.
function RootRedirect() {
  const { state } = useStore();

  if (state.ui.disclaimerAcceptedAt === null) {
    return <Navigate to="/welcome" replace />;
  }

  if (state.profile.birthYear === null) {
    return <Navigate to="/profile" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function AppShell() {
  return (
    <>
      <a className="skip-link" href={`#main-heading`}>
        Skip to main content
      </a>
      <NavBar />
      <RouteAnnouncer />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/account/:accountType" element={<AccountScreen />} />
        <Route path="/summary" element={<SummaryScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </StoreProvider>
  );
}

export default App;
