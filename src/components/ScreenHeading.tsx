import type { ReactNode } from "react";
import { MAIN_HEADING_ID } from "./RouteAnnouncer";

interface ScreenHeadingProps {
  children: ReactNode;
}

/** Every screen's top heading - RouteAnnouncer focuses this element by id on navigation. */
export function ScreenHeading({ children }: ScreenHeadingProps) {
  return (
    <h1 id={MAIN_HEADING_ID} tabIndex={-1}>
      {children}
    </h1>
  );
}
