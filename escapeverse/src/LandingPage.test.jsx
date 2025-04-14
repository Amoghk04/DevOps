// src/LandingPage.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from './UserContext';
import LandingPage from './LandingPage';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('./firebase', () => ({
  auth: {
    signOut: jest.fn().mockResolvedValue({}),
  },
}));

// Mock ProfileOverlay component
jest.mock('./ProfileOverlay', () => function MockProfileOverlay({ onClose }) {
  return <div role="dialog" data-testid="profile-overlay">
    <button onClick={onClose}>Close</button>
  </div>
});

// Mock fetch API
global.fetch = jest.fn();

// Wrapper to provide context and router
const renderWithProviders = (ui, { userValue = { user: null } } = {}) => {
  return render(
    <UserContext.Provider value={userValue}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </UserContext.Provider>
  );
};

describe('LandingPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ points: 150 }),
    });
    document.documentElement.classList.remove('dark');
  });

  test('renders without crashing', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText(/escapeverse/i)).toBeInTheDocument();
  });

  test('displays user information correctly', () => {
    const mockUser = { 
      displayName: 'Test User',
      uid: '123456'
    };
    
    renderWithProviders(<LandingPage />, { 
      userValue: { user: mockUser } 
    });
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('displays "Guest" when no user is logged in', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText('Guest')).toBeInTheDocument();
  });

  test('fetches and displays user points', async () => {
    const mockUser = { uid: '123456' };
    
    renderWithProviders(<LandingPage />, { 
      userValue: { user: mockUser } 
    });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/get_user_points?uid=123456`);
      expect(screen.getByText(/total points: 150/i)).toBeInTheDocument();
    });
  });

  test('toggles theme when button is clicked', () => {
    renderWithProviders(<LandingPage />);
    
    expect(document.documentElement.classList.contains('dark')).toBeFalsy();
    
    const themeButton = screen.getByLabelText(/toggle theme/i);
    fireEvent.click(themeButton);
    
    expect(document.documentElement.classList.contains('dark')).toBeTruthy();
  });

  test('toggles profile overlay when profile button is clicked', () => {
    renderWithProviders(<LandingPage />);
    
    // Initially profile overlay should not be visible
    expect(screen.queryByTestId('profile-overlay')).not.toBeInTheDocument();
    
    // Click profile button
    const profileButton = screen.getByText('Profile');
    fireEvent.click(profileButton);
    
    // Profile overlay should be visible
    expect(screen.getByTestId('profile-overlay')).toBeInTheDocument();
  });

  test('calls signOut when logout button is clicked', () => {
    const { auth } = require('./firebase');
    
    renderWithProviders(<LandingPage />);
    
    const logoutButton = screen.getByTitle('Sign Out');
    fireEvent.click(logoutButton);
    
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });
});
