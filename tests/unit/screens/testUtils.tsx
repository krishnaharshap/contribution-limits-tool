import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { StoreProvider } from "../../../src/store/StoreContext";

export function renderScreen(element: ReactElement, initialPath = "/", routePath = "*") {
  return render(
    <StoreProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path={routePath} element={element} />
        </Routes>
      </MemoryRouter>
    </StoreProvider>,
  );
}
