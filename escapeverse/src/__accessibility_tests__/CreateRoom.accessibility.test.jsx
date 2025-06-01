import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import CreateRoom from '../CreateRoom'; // adjust path if needed

expect.extend(toHaveNoViolations);

// Mock HTMLCanvasElement.getContext to fix axe-core canvas issues
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    measureText: jest.fn(() => ({ width: 100 })),
    fillText: jest.fn(),
    font: '',
    fillStyle: '',
}));

// Mock uuid to make tests deterministic
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid-1234')
}));

// Mock console.log to avoid noise in tests
jest.spyOn(console, 'log').mockImplementation(() => {});

// Mock localStorage
const localStorageMock = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock window.alert
window.alert = jest.fn();

describe('CreateRoom Accessibility', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should have no accessibility violations', async () => {
        const { container } = render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', () => {
        render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        // Check main heading exists and is properly structured
        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toBeInTheDocument();
        expect(mainHeading).toHaveTextContent('Choose a Room Theme');
    });

    it('should have accessible button labels', () => {
        render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        // All buttons should have accessible names
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).toHaveAccessibleName();
        });

        // Check specific button text
        expect(screen.getAllByText('Create Room')).toHaveLength(3);
    });

    it('should have sufficient color contrast', async () => {
        const { container } = render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        // Run axe with color contrast rules (excluding enhanced which may not be available)
        const results = await axe(container, {
            rules: {
                'color-contrast': { enabled: true }
            }
        });
        
        expect(results).toHaveNoViolations();
    });

    it('should be keyboard navigable', () => {
        render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        // All interactive elements should be focusable
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).not.toHaveAttribute('tabindex', '-1');
        });
    });

    it('should have semantic HTML structure', () => {
        render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        // Check for proper semantic structure
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        
        // Theme cards should have proper structure
        const themeNames = ['Tech Lab Escape', 'Ancient Tomb', 'Haunted Mansion'];
        themeNames.forEach(themeName => {
            expect(screen.getByText(themeName)).toBeInTheDocument();
        });
    });

    it('should handle focus management properly', async () => {
        const { container } = render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        // Run axe with general focus and keyboard rules
        const results = await axe(container, {
            rules: {
                'focus-order-semantics': { enabled: true },
                'tabindex': { enabled: true },
                'bypass': { enabled: true }
            }
        });
        
        expect(results).toHaveNoViolations();
    });

    it('should have proper theme card structure', () => {
        render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        // Check each theme card for proper structure and accessibility
        const themes = [
            'Tech Lab Escape',
            'Ancient Tomb',
            'Haunted Mansion'
        ];

        themes.forEach(themeName => {
            const card = screen.getByRole('group', { name: new RegExp(themeName, 'i') });
            expect(card).toBeInTheDocument();

            // Check heading
            const heading = within(card).getByRole('heading', { level: 2 });
            expect(heading).toHaveTextContent(themeName);

            // Check description
            const description = within(card).getByRole('paragraph');
            expect(description).toBeInTheDocument();

            // Check button
            const button = within(card).getByRole('button');
            expect(button).toHaveAccessibleName('Create Room');
        });
    });

    it('should handle theme selection announcements', () => {
        render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        const themeCards = screen.getAllByRole('group');
        themeCards.forEach(card => {
            // Check for proper ARIA attributes
            expect(card).toHaveAttribute('aria-labelledby');
            
            // Verify theme description is accessible
            const description = within(card).getByRole('button')
                .getAttribute('aria-label');
            expect(description).toBeTruthy();
        });
    });

    it('should provide proper aria labels for interactive elements', () => {
        render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).toHaveAttribute('aria-label');
            expect(button).not.toHaveAttribute('aria-hidden');
        });
    });

    it('should maintain proper focus order', () => {
        render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        const focusableElements = screen.getAllByRole('button');
        
        // Check that we have the expected number of focusable elements
        expect(focusableElements).toHaveLength(3); // One button per theme
        
        // Verify that no buttons have a negative tabindex
        focusableElements.forEach(element => {
            expect(element).not.toHaveAttribute('tabindex', '-1');
        });

        // Verify that buttons are naturally focusable
        focusableElements.forEach(element => {
            expect(element).toBeVisible();
            expect(element).not.toBeDisabled();
            expect(element).toHaveAttribute('aria-label');
        });
    });
});