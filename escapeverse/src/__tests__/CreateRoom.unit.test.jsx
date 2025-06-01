import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateRoom from "../CreateRoom";
import { BrowserRouter } from "react-router-dom";
import '@testing-library/jest-dom';

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-room-id-123"),
}));

// Mock react-router-dom
const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("CreateRoom Component", () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeAll(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock window.alert
    window.alert = jest.fn();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockLocalStorage.clear.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockedNavigate.mockClear();
    window.alert.mockClear();
  });

  const renderWithRouter = () =>
    render(
      <BrowserRouter>
        <CreateRoom />
      </BrowserRouter>
    );

  test("renders page with correct title", () => {
    renderWithRouter();
    expect(screen.getByText(/Choose a Room Theme/i)).toBeInTheDocument();
  });

  test("renders all theme cards with correct content", () => {
    renderWithRouter();

    // Check for all theme names
    expect(screen.getByText("Tech Lab Escape")).toBeInTheDocument();
    expect(screen.getByText("Ancient Tomb")).toBeInTheDocument();
    expect(screen.getByText("Haunted Mansion")).toBeInTheDocument();

    // Check for theme descriptions
    expect(screen.getByText(/Hack into the system, decode digital puzzles/i)).toBeInTheDocument();
    expect(screen.getByText(/Solve riddles of the pharaohs/i)).toBeInTheDocument();
    expect(screen.getByText(/Unravel the secrets of a haunted estate/i)).toBeInTheDocument();

    // Check that all Create Room buttons are present
    const createRoomButtons = screen.getAllByRole("button", { name: /create room/i });
    expect(createRoomButtons).toHaveLength(3);
  });

  test("clicking tech theme button creates room and navigates correctly", () => {
    renderWithRouter();

    const createRoomButtons = screen.getAllByRole("button", { name: /create room/i });
    const techButton = createRoomButtons[0]; // First button is tech theme
    
    fireEvent.click(techButton);

    // Check localStorage was set correctly
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("isRoomHost", "true");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("roomHostId", "mock-room-id-123");
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);

    // Check navigation
    expect(mockedNavigate).toHaveBeenCalledWith(
      "/room/mock-room-id-123?theme=tech&creator=true"
    );
    expect(mockedNavigate).toHaveBeenCalledTimes(1);

    // Ensure no alert was shown
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("clicking mystery theme button shows development alert and navigates home", () => {
    renderWithRouter();

    const createRoomButtons = screen.getAllByRole("button", { name: /create room/i });
    const mysteryButton = createRoomButtons[1]; // Second button is mystery theme
    
    fireEvent.click(mysteryButton);

    // Check localStorage was still set (room creation starts before theme check)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("isRoomHost", "true");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("roomHostId", "mock-room-id-123");

    // Check alert was shown
    expect(window.alert).toHaveBeenCalledWith("This page is still under development");

    // Check navigation to home
    expect(mockedNavigate).toHaveBeenCalledWith('/home');
    expect(mockedNavigate).toHaveBeenCalledTimes(1);
  });

  test("clicking horror theme button shows development alert and navigates home", () => {
    renderWithRouter();

    const createRoomButtons = screen.getAllByRole("button", { name: /create room/i });
    const horrorButton = createRoomButtons[2]; // Third button is horror theme
    
    fireEvent.click(horrorButton);

    // Check localStorage was still set (room creation starts before theme check)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("isRoomHost", "true");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("roomHostId", "mock-room-id-123");

    // Check alert was shown
    expect(window.alert).toHaveBeenCalledWith("This page is still under development");

    // Check navigation to home
    expect(mockedNavigate).toHaveBeenCalledWith('/home');
    expect(mockedNavigate).toHaveBeenCalledTimes(1);
  });

  test("generates unique room IDs for each room creation", () => {
    const { v4: mockUuidv4 } = require("uuid");
    
    // Mock multiple calls to return different IDs
    mockUuidv4
      .mockReturnValueOnce("room-id-1")
      .mockReturnValueOnce("room-id-2");

    renderWithRouter();

    const createRoomButtons = screen.getAllByRole("button", { name: /create room/i });
    
    // Click tech button twice (would happen if user navigates back and clicks again)
    fireEvent.click(createRoomButtons[0]);
    fireEvent.click(createRoomButtons[0]);

    expect(mockUuidv4).toHaveBeenCalledTimes(2);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("roomHostId", "room-id-1");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("roomHostId", "room-id-2");
  });

  test("renders with correct styling classes", () => {
    renderWithRouter();

    // Check main container has background styling
    const mainContainer = screen.getByText(/Choose a Room Theme/i).closest('div');
    expect(mainContainer).toHaveClass('min-h-screen', 'w-full');

    // Check theme cards have proper styling
    const techCard = screen.getByText("Tech Lab Escape").closest('div');
    expect(techCard).toHaveClass('bg-white/80', 'dark:bg-gray-800/80', 'backdrop-blur-md');
  });

  test("console.log is called when creating room", () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithRouter();

    const createRoomButtons = screen.getAllByRole("button", { name: /create room/i });
    fireEvent.click(createRoomButtons[0]);

    expect(consoleSpy).toHaveBeenCalledWith("Creating room as host");
    
    consoleSpy.mockRestore();
  });

  test("handles theme keys correctly", () => {
    renderWithRouter();

    const createRoomButtons = screen.getAllByRole("button", { name: /create room/i });
    
    // Test tech theme
    fireEvent.click(createRoomButtons[0]);
    expect(mockedNavigate).toHaveBeenLastCalledWith(
      expect.stringContaining("theme=tech")
    );

    // Reset mocks
    mockedNavigate.mockClear();
    window.alert.mockClear();

    // Test mystery theme
    fireEvent.click(createRoomButtons[1]);
    expect(window.alert).toHaveBeenCalledWith("This page is still under development");
    expect(mockedNavigate).toHaveBeenLastCalledWith('/home');
  });

  test("all buttons are clickable and responsive", () => {
    renderWithRouter();

    const createRoomButtons = screen.getAllByRole("button", { name: /create room/i });
    
    // Ensure all buttons are rendered and clickable
    createRoomButtons.forEach((button) => {
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
      
      // Check button styling
      expect(button).toHaveClass('block', 'w-full', 'rounded-xl', 'text-white');
    });
  });

  test("theme descriptions are correctly displayed", () => {
    renderWithRouter();

    const expectedDescriptions = [
      "Hack into the system, decode digital puzzles, and escape a high-security tech lab.",
      "Solve riddles of the pharaohs and unlock the mysteries of the pyramid.",
      "Unravel the secrets of a haunted estate filled with eerie clues."
    ];

    expectedDescriptions.forEach((description) => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  test("component renders without crashing with no props", () => {
    expect(() => renderWithRouter()).not.toThrow();
  });
});