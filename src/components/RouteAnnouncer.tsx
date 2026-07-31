import { useEffect } from "react";
import { useLocation } from "react-router";

export const MAIN_HEADING_ID = "main-heading";

/**
 * Screen readers and keyboard users get no feedback when a client-side
 * route change swaps content without a real page load. Moving focus to
 * the new screen's heading on every navigation is the standard fix.
 */
export function RouteAnnouncer() {
  const location = useLocation();

  useEffect(() => {
    const heading = document.getElementById(MAIN_HEADING_ID);
    heading?.focus();
  }, [location.pathname]);

  return null;
}
