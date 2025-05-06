// src/LandingPage.accessibility.test.jsx
import { render } from '@testing-library/react';
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
});
