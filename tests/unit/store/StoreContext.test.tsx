import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { actions } from "../../../src/store/actions";
import { StoreProvider, useStore } from "../../../src/store/StoreContext";
import { STORAGE_KEY } from "../../../src/store/persistence";

function TestConsumer() {
  const { state, dispatch } = useStore();

  return (
    <div>
      <p data-testid="birth-year">{state.profile.birthYear ?? "unset"}</p>
      <button onClick={() => dispatch(actions.profileUpdated({ birthYear: 1990 }))}>
        Set birth year
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("StoreProvider", () => {
  it("throws if useStore is called outside a StoreProvider", () => {
    function Orphan() {
      useStore();
      return null;
    }

    expect(() => render(<Orphan />)).toThrow(/StoreProvider/);
  });

  it("provides state and dispatch to descendants, and persists updates", async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <TestConsumer />
      </StoreProvider>,
    );

    expect(screen.getByTestId("birth-year")).toHaveTextContent("unset");

    await user.click(screen.getByRole("button", { name: "Set birth year" }));

    expect(screen.getByTestId("birth-year")).toHaveTextContent("1990");
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.profile.birthYear).toBe(1990);
  });
});
