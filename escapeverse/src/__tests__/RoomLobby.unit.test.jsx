import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import RoomLobby from "../RoomLobby";
import { UserContext } from "../UserContext";
import { MemoryRouter } from "react-router-dom";
import '@testing-library/jest-dom';

// Create mock socket object
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  id: 'mock-socket-id'
};

// Mock socket.io-client
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => mockSocket)
}));

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => mockUseParams(),
  useNavigate: () => mockNavigate,
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe("RoomLobby", () => {
  const mockUser = { 
    displayName: "TestUser",
    uid: "test-uid-123"
  };

  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeAll(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(),
      },
      writable: true,
    });

    // Mock window.alert
    window.alert = jest.fn();
  });

  afterAll(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseParams.mockReturnValue({ roomId: "ROOM123" });
    
    const mockSearchParams = new URLSearchParams({ theme: "mystery", creator: "true" });
    mockUseSearchParams.mockReturnValue([mockSearchParams]);

    // Setup default localStorage behavior
    mockLocalStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case 'isRoomHost':
          return 'true';
        case 'roomHostId':
          return 'ROOM123';
        default:
          return null;
      }
    });

    // Setup default navigator.clipboard behavior
    navigator.clipboard.writeText.mockResolvedValue();
  });

  const renderComponent = (userValue = { user: mockUser }) =>
    render(
      <UserContext.Provider value={userValue}>
        <MemoryRouter>
          <RoomLobby />
        </MemoryRouter>
      </UserContext.Provider>
    );

  test("renders room and theme correctly", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Room: ROOM123/i)).toBeInTheDocument();
      expect(screen.getByText(/Theme: mystery/i)).toBeInTheDocument();
    });
  });

  test("renders room code and copy button", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText("Room Code:")).toBeInTheDocument();
      expect(screen.getByText("Copy Room Code")).toBeInTheDocument();
      expect(screen.getByText("ROOM123")).toBeInTheDocument();
      expect(screen.getByText("Share this code with friends to join!")).toBeInTheDocument();
    });
  });

  test("renders players list fallback when no players", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText("Players in the Room:")).toBeInTheDocument();
      expect(screen.getByText(/Waiting for players/i)).toBeInTheDocument();
    });
  });

  test("clicking copy button copies room code successfully", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Copy Room Code")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Copy Room Code"));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ROOM123");
      expect(window.alert).toHaveBeenCalledWith("Room code copied to clipboard!");
    });
  });

  test("handles copy button failure gracefully", async () => {
    navigator.clipboard.writeText.mockRejectedValue(new Error("Copy failed"));
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Copy Room Code")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Copy Room Code"));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ROOM123");
      expect(console.error).toHaveBeenCalledWith("Failed to copy room code:", expect.any(Error));
    });
  });

  test("shows start button for host initially", async () => {
    renderComponent();
    
    // Initially should show start button since user is marked as creator
    await waitFor(() => {
      expect(screen.getByText("Start Game")).toBeInTheDocument();
    });
  });

  test("shows waiting message for non-host", async () => {
    // Mock user as non-creator
    const mockSearchParams = new URLSearchParams({ theme: "mystery" }); // No creator param
    mockUseSearchParams.mockReturnValue([mockSearchParams]);
    
    // Mock localStorage to not indicate host
    mockLocalStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case 'isRoomHost':
          return null;
        case 'roomHostId':
          return null;
        default:
          return null;
      }
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Waiting for host to start the game/i)).toBeInTheDocument();
    });
  });

  test("sets up socket event listeners correctly", async () => {
    renderComponent();

    await waitFor(() => {
      // Verify socket.on was called for each event listener
      expect(mockSocket.on).toHaveBeenCalledWith("room-players", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("start-game", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("host-status", expect.any(Function));
    });
  });

  test("emits join-room when user is available", async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith("join-room", {
        roomId: "ROOM123",
        username: "TestUser",
        isCreator: true
      });
    });
  });

  test("handles start game button click", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Start Game")).toBeInTheDocument();
    });

    // Mock Date.now for consistent testing
    const mockDate = 1234567890;
    jest.spyOn(Date, 'now').mockReturnValue(mockDate);

    fireEvent.click(screen.getByText("Start Game"));

    expect(mockSocket.emit).toHaveBeenCalledWith("start-game", {
      roomId: "ROOM123",
      theme: "mystery"
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('gameStartTime', mockDate.toString());

    Date.now.mockRestore();
  });

  test("handles room-players socket event with array format", async () => {
    renderComponent();

    // Get the room-players event handler
    const roomPlayersHandler = mockSocket.on.mock.calls.find(
      call => call[0] === "room-players"
    )[1];

    const mockPlayers = [
      { id: "player1", username: "Player1" },
      { id: "player2", username: "Player2" }
    ];

    await act(async () => {
      roomPlayersHandler(mockPlayers);
    });

    await waitFor(() => {
      expect(screen.getByText("Player1")).toBeInTheDocument();
      expect(screen.getByText("Player2")).toBeInTheDocument();
    });
  });

  test("handles room-players socket event with object format", async () => {
    renderComponent();

    // Get the room-players event handler
    const roomPlayersHandler = mockSocket.on.mock.calls.find(
      call => call[0] === "room-players"
    )[1];

    const mockData = {
      players: [
        { id: "mock-socket-id", username: "TestUser" },
        { id: "player2", username: "Player2" }
      ],
      hostId: "mock-socket-id"
    };

    await act(async () => {
      roomPlayersHandler(mockData);
    });

    await waitFor(() => {
      expect(screen.getByText("TestUser (You) (Host)")).toBeInTheDocument();
      expect(screen.getByText("Player2")).toBeInTheDocument();
    });
  });

  test("handles start-game socket event", async () => {
    renderComponent();

    // Get the start-game event handler
    const startGameHandler = mockSocket.on.mock.calls.find(
      call => call[0] === "start-game"
    )[1];

    const gameData = { theme: "tech" };

    await act(async () => {
      startGameHandler(gameData);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/game/ROOM123/tech");
  });

  test("handles host-status socket event", async () => {
    renderComponent();

    // Get the host-status event handler
    const hostStatusHandler = mockSocket.on.mock.calls.find(
      call => call[0] === "host-status"
    )[1];

    await act(async () => {
      hostStatusHandler(true);
    });

    await waitFor(() => {
      expect(screen.getByText("Start Game")).toBeInTheDocument();
    });
  });

  test("uses default theme when not provided in search params", async () => {
    const mockSearchParams = new URLSearchParams(); // No theme param
    mockUseSearchParams.mockReturnValue([mockSearchParams]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Theme: tech/i)).toBeInTheDocument();
    });
  });

  test("cleans up socket connection on unmount", async () => {
    const { unmount } = renderComponent();

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith("join-room", expect.any(Object));
    });

    unmount();

    expect(mockSocket.emit).toHaveBeenCalledWith("leave-room", "ROOM123");
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  test("handles missing user gracefully", async () => {
    renderComponent({ user: null });

    await waitFor(() => {
      expect(screen.getByText(/Room: ROOM123/i)).toBeInTheDocument();
    });

    // Should not emit join-room when user is null
    expect(mockSocket.emit).not.toHaveBeenCalledWith("join-room", expect.any(Object));
  });

  test("clears localStorage when not host of current room", async () => {
    // Mock localStorage to return different room ID
    mockLocalStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case 'isRoomHost':
          return 'true';
        case 'roomHostId':
          return 'DIFFERENT_ROOM';
        default:
          return null;
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("isRoomHost");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("roomHostId");
    });
  });
});

jest.mock('../config', () => ({
  __esModule: true,
  default: { apiUrl: 'http://localhost:3001' }
}));