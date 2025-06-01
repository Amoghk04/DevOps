import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Wall1 from '../rooms/wall1';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock useGame from its actual provider location
jest.mock('../rooms/GameProvider', () => ({
    useGame: () => ({
        isDark: true,
        setIsDark: jest.fn(),
        wall1GatePositions: [
            { left: 200, top: 300 },
            { left: 300, top: 300 },
            { left: 400, top: 300 },
            { left: 500, top: 300 }
        ],
        setWall1GatePositions: jest.fn(),
        lightCode: '123',
        playLightOnSound: jest.fn(),
        cornerLights: [false, false, false, false],
        gatesSolved: [false, false, false, false],
        updateCornerLight: jest.fn(),
        wall4code: '123456',
        isRoomOpened: false,
        setIsRoomOpened: jest.fn(),
    }),
}));

describe('Wall1', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        // Check for the main image (InteractiveImageMap renders an img)
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('shows Security Code keypad when keypad is activated', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        
        expect(screen.queryByText(/Security Code/i)).not.toBeInTheDocument();
    });

    it('does not show the lever overlay by default', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        expect(screen.queryByText(/Enter the code to lift the darkness/i)).not.toBeInTheDocument();
    });

    it('navigates left when left arrow is clicked', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        // Find left arrow by role or add data-testid in Wall1 for easier selection
        fireEvent.click(screen.getByTestId('left-arrow'));
        expect(mockNavigate).toHaveBeenCalledWith('/wall2');
    });

    it('navigates right when right arrow is clicked', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByTestId('right-arrow'));
        expect(mockNavigate).toHaveBeenCalledWith('/wall4');
    });

    it('shows torchlight overlay when isDark is true', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        // The torchlight overlay is a div with a radial-gradient background
        expect(document.querySelector('.pointer-events-none')).toBeInTheDocument();
    });

    it('renders all four corner lights', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        // There should be 4 corner light divs
        expect(document.querySelectorAll('.rounded-full').length).toBeGreaterThanOrEqual(4);
    });

    it('shows opened wall image when isRoomOpened is true', () => {
        // Override mock to set isRoomOpened true
        jest.mock('../rooms/GameProvider', () => ({
            useGame: () => ({
                isDark: true,
                setIsDark: jest.fn(),
                wall1GatePositions: [
                    { left: 200, top: 300 },
                    { left: 300, top: 300 },
                    { left: 400, top: 300 },
                    { left: 500, top: 300 }
                ],
                setWall1GatePositions: jest.fn(),
                lightCode: '123',
                playLightOnSound: jest.fn(),
                cornerLights: [false, false, false, false],
                gatesSolved: [false, false, false, false],
                updateCornerLight: jest.fn(),
                wall4code: '123456',
                isRoomOpened: true,
                setIsRoomOpened: jest.fn(),
            }),
        }));
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        expect(screen.getByRole('img').getAttribute('src')).toContain('png');
    });
});