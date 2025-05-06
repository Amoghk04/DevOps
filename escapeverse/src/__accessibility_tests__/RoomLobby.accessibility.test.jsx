import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { MemoryRouter } from "react-router-dom";
import { UserContext } from "../UserContext";
import RoomLobby from "../RoomLobby";

expect.extend(toHaveNoViolations);

describe("Accessibility tests for RoomLobby", () => {
  it("should have no accessibility violations", async () => {
    const mockUser = { displayName: "TestUser" };

    const { container } = render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter initialEntries={["/room/123?theme=tech"]}>
          <RoomLobby />
        </MemoryRouter>
      </UserContext.Provider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
