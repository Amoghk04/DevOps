import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../UserContext';
import LandingPage from '../LandingPage';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  signOut: jest.fn().mockResolvedValue({}),
}));

// Mock ProfileOverlay component
jest.mock('../ProfileOverlay', () => function MockProfileOverlay({ onClose }) {
  return (
    <div role="dialog" data-testid="profile-overlay">
      <button onClick={onClose}>Close Profile</button>
    </div>
  );
});

// Mock SettingsOverlay component
jest.mock('../SettingsOverlay', () => function MockSettingsOverlay({ onClose }) {
  return (
    <div role="dialog" data-testid="settings-overlay">
      <button onClick={onClose}>Close Settings</button>
    </div>
  );
});

// Mock react-router-dom Link component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, className, ...props }) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Wrapper to provide context and router
const renderWithProviders = (ui, { userValue = { user: null } } = {}) => {
  return render(
    <UserContext.Provider value={userValue}>
      <BrowserRouter>{ui}</BrowserRouter>
    </UserContext.Provider>
  );
};

describe('LandingPage Component', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    
    // Default localStorage values
    mockLocalStorage.getItem.mockImplementation((key) => {
      switch (key) {
        case 'username':
          return null;
        case 'profileIndex':
          return '0';
        default:
          return null;
      }
    });
    
    // Reset dark mode
    document.documentElement.classList.remove('dark');
    
    // Mock window.innerWidth for responsive behavior
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders without crashing', async () => {
    renderWithProviders(<LandingPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/escapeverse/i)).toBeInTheDocument();
    });
  });

  test('displays user displayName when available', async () => {
    const mockUser = {
      displayName: 'Test User',
      uid: '123456',
      email: 'test@example.com',
    };

    renderWithProviders(<LandingPage />, {
      userValue: { user: mockUser },
    });

    await waitFor(() => {
      expect(screen.getByText(/Hi, Test User!/)).toBeInTheDocument();
    });
  });

  test('displays user email when displayName is not available', async () => {
    const mockUser = {
      uid: '123456',
      email: 'test@example.com',
    };

    renderWithProviders(<LandingPage />, {
      userValue: { user: mockUser },
    });

    await waitFor(() => {
      expect(screen.getByText(/Hi, test@example.com!/)).toBeInTheDocument();
    });
  });

  test('displays localStorage username when available', async () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'username') return 'StoredUser';
      if (key === 'profileIndex') return '0';
      return null;
    });

    const mockUser = {
      displayName: 'Test User',
      uid: '123456',
    };

    renderWithProviders(<LandingPage />, {
      userValue: { user: mockUser },
    });

    await waitFor(() => {
      expect(screen.getByText(/Hi, StoredUser!/)).toBeInTheDocument();
    });
  });

  test('displays "Guest" when no user is logged in and no stored username', async () => {
    renderWithProviders(<LandingPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Hi, Guest!/)).toBeInTheDocument();
    });
  });

  test('toggles theme when button is clicked', async () => {
    renderWithProviders(<LandingPage />);

    expect(document.documentElement.classList.contains('dark')).toBeFalsy();

    const themeButton = await screen.findByLabelText(/toggle theme/i);
    fireEvent.click(themeButton);

    expect(document.documentElement.classList.contains('dark')).toBeTruthy();

    // Test toggle back to light mode
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains('dark')).toBeFalsy();
  });

  test('toggles profile overlay when profile button is clicked', async () => {
    renderWithProviders(<LandingPage />);

    expect(screen.queryByTestId('profile-overlay')).not.toBeInTheDocument();

    const profileButton = await screen.findByText('Profile');
    fireEvent.click(profileButton);

    expect(screen.getByTestId('profile-overlay')).toBeInTheDocument();

    // Test closing the overlay
    const closeButton = screen.getByText('Close Profile');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('profile-overlay')).not.toBeInTheDocument();
    });
  });

  test('toggles settings overlay when settings button is clicked', async () => {
    renderWithProviders(<LandingPage />);

    expect(screen.queryByTestId('settings-overlay')).not.toBeInTheDocument();

    const settingsButton = await screen.findByText('Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('settings-overlay')).toBeInTheDocument();

    // Test closing the overlay
    const closeButton = screen.getByText('Close Settings');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('settings-overlay')).not.toBeInTheDocument();
    });
  });

  test('calls signOut when logout button is clicked', async () => {
    const { signOut } = require('firebase/auth');

    renderWithProviders(<LandingPage />);

    const logoutButton = await screen.findByTitle('Sign Out');
    fireEvent.click(logoutButton);

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  test('toggles sidebar when toggle button is clicked', async () => {
    renderWithProviders(<LandingPage />);

    // Find the sidebar and toggle button
    const toggleButton = await screen.findByLabelText(/collapse sidebar/i);
    fireEvent.click(toggleButton);

    // After clicking, it should show "Expand Sidebar"
    await waitFor(() => {
      expect(screen.getByLabelText(/expand sidebar/i)).toBeInTheDocument();
    });

    // Click again to expand
    const expandButton = screen.getByLabelText(/expand sidebar/i);
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/collapse sidebar/i)).toBeInTheDocument();
    });
  });

  test('renders navigation links correctly', async () => {
    renderWithProviders(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText('Create Room')).toBeInTheDocument();
      expect(screen.getByText('Join Room')).toBeInTheDocument();
    });

    // Check if links have correct href attributes
    const createRoomLink = screen.getByText('Create Room').closest('a');
    const joinRoomLink = screen.getByText('Join Room').closest('a');

    expect(createRoomLink).toHaveAttribute('href', '/create-room');
    expect(joinRoomLink).toHaveAttribute('href', '/join-room');
  });

  test('renders social media links', async () => {
    renderWithProviders(<LandingPage />);

    await waitFor(() => {
      const githubLink = screen.getByLabelText(/visit us on github/i);
      const instagramLink = screen.getByLabelText(/visit us on instagram/i);

      expect(githubLink).toHaveAttribute('href', 'https://github.com/Amoghk04/DevOps');
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(instagramLink).toHaveAttribute('target', '_blank');
    });
  });

  test('applies correct profile icon positioning', async () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'profileIndex') return '4'; // This should map to position 1,1
        return null;
    });

    renderWithProviders(<LandingPage />);

    await waitFor(() => {
        const profileIcon = screen.getByRole('img', { 
            name: /Guest's profile picture/i 
        });
        expect(profileIcon).toBeInTheDocument();
        
        // Check if the background position is correct for index 4
        const backgroundDiv = profileIcon.querySelector('.bg-cover');
        expect(backgroundDiv).toHaveStyle({
            backgroundPosition: '50% 50%'
        });
    });
  });

  test('handles click outside sidebar on mobile', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    renderWithProviders(<LandingPage />);

    // Simulate clicking outside the sidebar
    fireEvent.mouseDown(document.body);

    // The sidebar should remain expanded initially, but the event listener should be attached
    // This test mainly ensures no errors are thrown
  });

  test('renders main content sections', async () => {
    renderWithProviders(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText('Building Wonders')).toBeInTheDocument();
      expect(screen.getByText('Room Gatherings')).toBeInTheDocument();
      expect(screen.getByText(/create your own immersive escape room/i)).toBeInTheDocument();
      expect(screen.getByText(/connect and join existing rooms/i)).toBeInTheDocument();
    });
  });
});