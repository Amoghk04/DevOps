import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { MemoryRouter } from "react-router-dom";
import { UserContext } from "../UserContext";
import RoomLobby from "../RoomLobby";

expect.extend(toHaveNoViolations);

const renderWithContext = () => {
  const mockUser = { displayName: "TestUser" };
  return render(
    <UserContext.Provider value={{ user: mockUser }}>
      <MemoryRouter initialEntries={["/room/123?theme=tech"]}>
        <RoomLobby />
      </MemoryRouter>
    </UserContext.Provider>
  );
};

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

  it("should have proper heading structure", () => {
    renderWithContext();

    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(4); // Room title, Theme, Room Code, and Players list headings

    // Check heading hierarchy
    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toHaveTextContent(/Room:/);

    const subHeadings = screen.getAllByRole("heading", { level: 2 });
    expect(subHeadings[0]).toHaveTextContent(/Theme:/);

    const tertiaryHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(tertiaryHeadings).toHaveLength(2);
    expect(tertiaryHeadings[0]).toHaveTextContent(/Room Code/);
    expect(tertiaryHeadings[1]).toHaveTextContent(/Players in the Room/);
  });

  it("should have accessible button labels", () => {
    renderWithContext(true);

    // Check copy button
    const copyButton = screen.getByRole("button", { name: /copy room code/i });
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toHaveAttribute("class", expect.stringContaining("bg-blue-600"));
  });

  it("should display appropriate game status message", () => {
    renderWithContext(false);

    const statusMessage = screen.getByText(/waiting for host to start the game/i);
    expect(statusMessage).toBeInTheDocument();
    expect(statusMessage).toHaveClass("bg-gray-700");
  });

  it("should have proper list structure for players", () => {
    renderWithContext();

    const playersList = screen.getByRole("list");
    expect(playersList).toBeInTheDocument();

    // Check initial waiting message
    const waitingMessage = screen.getByText(/waiting for players/i);
    expect(waitingMessage).toBeInTheDocument();
  });

  it("should have proper room code display", () => {
    renderWithContext();

    // Check room code section structure
    const roomCodeContainer = screen.getByRole("region", { 
      name: /room code/i 
    });
    expect(roomCodeContainer).toHaveClass("mb-6", "text-center");

    // Check room code element
    const roomCodeElement = screen.getByTestId("room-code");
    expect(roomCodeElement).toHaveClass("text-2xl", "font-mono", "bg-gray-800");

    // Check helper text
    const helperText = screen.getByText(/share this code with friends/i);
    expect(helperText).toBeInTheDocument();

    // Check copy button
    const copyButton = screen.getByRole("button", { 
      name: /copy room code/i 
    });
    expect(copyButton).toBeInTheDocument();
  });
});
