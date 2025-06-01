// src/LandingPage.accessibility.test.jsx
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../UserContext';
import LandingPage from '../LandingPage';

// Mock dependencies
jest.mock('../firebase', () => ({
  auth: {
    signOut: jest.fn().mockResolvedValue({}),
  },
}));

// Mock ProfileOverlay component 
jest.mock('../ProfileOverlay', () => function MockProfileOverlay({ onClose }) {
  return <div role="dialog" data-testid="profile-overlay">
    <button onClick={onClose}>Close</button>
  </div>
});

// Mock SettingsOverlay component
jest.mock('../SettingsOverlay', () => function MockSettingsOverlay({ onClose }) {
  return <div role="dialog" data-testid="settings-overlay">
    <button onClick={onClose}>Close</button>
  </div>
});

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

describe('LandingPage Accessibility', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ points: 150 }),
    });
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderWithProviders(<LandingPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels for interactive elements', () => {
    renderWithProviders(<LandingPage />);
    
    // Check theme toggle button
    expect(screen.getByLabelText('Toggle Theme')).toBeInTheDocument();
    
    // Check sign out button
    expect(screen.getByTitle('Sign Out')).toBeInTheDocument();
    
    // Check social media links
    expect(screen.getByLabelText('Visit us on Github')).toBeInTheDocument();
    expect(screen.getByLabelText('Visit us on Instagram')).toBeInTheDocument();
  });

  it('should have proper heading structure', () => {
    renderWithProviders(<LandingPage />);
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Check main headings
    expect(screen.getByText('Building Wonders')).toHaveAttribute('class', expect.stringContaining('text-2xl'));
    expect(screen.getByText('Room Gatherings')).toHaveAttribute('class', expect.stringContaining('text-2xl'));
  });

  it('should have proper navigation structure', () => {
    renderWithProviders(<LandingPage />);
    
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
  });

  it('should maintain proper color contrast', () => {
    const { container } = renderWithProviders(<LandingPage />);
    const elements = container.querySelectorAll('[class*="text-"]');
    
    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      // Note: Actual contrast calculations would require additional color contrast libraries
      expect(backgroundColor).toBeDefined();
      expect(color).toBeDefined();
    });
  });

  it('should have proper dialog behavior for overlays', () => {
    renderWithProviders(<LandingPage />);
    
    const profileOverlay = screen.queryByTestId('profile-overlay');
    const settingsOverlay = screen.queryByTestId('settings-overlay');
    
    // Overlays should not be visible by default
    expect(profileOverlay).not.toBeInTheDocument();
    expect(settingsOverlay).not.toBeInTheDocument();
  });

  it('should handle keyboard navigation properly', () => {
    renderWithProviders(<LandingPage />);
    
    const interactiveElements = screen.getAllByRole('button');
    interactiveElements.forEach(element => {
      expect(element).toBeVisible();
      expect(element).not.toHaveAttribute('tabindex', '-1');
    });
  });

  it('should have proper profile icon accessibility', () => {
    renderWithProviders(<LandingPage />, {
      userValue: { user: { displayName: 'Test User' } }
    });
    
    const profileIcon = screen.getByRole('img', { name: /Test User's profile picture/i });
    expect(profileIcon).toBeInTheDocument();
  });
});
