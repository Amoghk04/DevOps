import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RoomLobby from "../RoomLobby";
import { UserContext } from "../UserContext";
import { MemoryRouter } from "react-router-dom";

// Mocks
jest.mock("socket.io-client", () => {
  return {
    io: () => ({
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    }),
  };
});

const mockNavigate = jest.fn();
const mockSearchParams = new URLSearchParams({ theme: "mystery", creator: "true" });

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ roomId: "ROOM123" }),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

describe("RoomLobby", () => {
  const mockUser = { displayName: "TestUser" };

  beforeEach(() => {
    localStorage.setItem("isRoomHost", "true");
    localStorage.setItem("roomHostId", "ROOM123");
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <RoomLobby />
        </MemoryRouter>
      </UserContext.Provider>
    );

  test("renders room and theme correctly", () => {
    renderComponent();
    expect(screen.getByText(/Room: ROOM123/i)).toBeInTheDocument();
    expect(screen.getByText(/Theme: mystery/i)).toBeInTheDocument();
  });

  test("renders room code and copy button", () => {
    renderComponent();
    expect(screen.getByText("Room Code:")).toBeInTheDocument();
    expect(screen.getByText("Copy Room Code")).toBeInTheDocument();
  });

  test("renders players list fallback", () => {
    renderComponent();
    expect(screen.getByText(/Waiting for players/i)).toBeInTheDocument();
  });

  test("clicking copy button copies room code", async () => {
    navigator.clipboard = { writeText: jest.fn().mockResolvedValue() };
    renderComponent();

    fireEvent.click(screen.getByText("Copy Room Code"));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ROOM123");
    });
  });

  test("shows start button for host", () => {
    renderComponent();
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });
});
