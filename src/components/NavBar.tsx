import { NavLink } from "react-router";

const NAV_ITEMS = [
  { to: "/about", label: "About" },
  { to: "/profile", label: "Profile" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/summary", label: "Summary" },
];

export function NavBar() {
  return (
    <header className="nav-bar">
      <NavLink
        to="/dashboard"
        style={{ fontWeight: 700, textDecoration: "none", color: "var(--color-text)" }}
      >
        Contribution Limits Tool
      </NavLink>
      <nav aria-label="Main">
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className="nav-link"
                data-testid={`nav-link-${item.label.toLowerCase()}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
