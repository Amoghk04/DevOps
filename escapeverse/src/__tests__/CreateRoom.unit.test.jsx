import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateRoom from "../CreateRoom";
import { BrowserRouter } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// Mock uuid and navigate
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-room-id"),
}));

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("CreateRoom Component", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedNavigate.mockClear();
  });

  const renderWithRouter = () =>
    render(
      <BrowserRouter>
        <CreateRoom />
      </BrowserRouter>
    );

  test("renders page with all themes", () => {
    renderWithRouter();

    expect(screen.getByText(/Choose a Room Theme/i)).toBeInTheDocument();

    expect(screen.getByText("Tech Lab Escape")).toBeInTheDocument();
    expect(screen.getByText("Ancient Tomb")).toBeInTheDocument();
    expect(screen.getByText("Haunted Mansion")).toBeInTheDocument();
  });

  test("clicking 'Create Room' sets localStorage and navigates to room", () => {
    renderWithRouter();

    const buttons = screen.getAllByRole("button", { name: /create room/i });
    const techButton = buttons[0]; // or [1] or [2] depending on the room you want
    fireEvent.click(techButton);

    expect(localStorage.getItem("isRoomHost")).toBe("true");
    expect(localStorage.getItem("roomHostId")).toBe("mock-room-id");

    expect(mockedNavigate).toHaveBeenCalledWith(
      "/room/mock-room-id?theme=tech&creator=true"
    );
  });
});
