import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Wall1 from '../rooms/wall1';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

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

// Mock InteractiveImageMap to expose the areas prop for testing
jest.mock('../InteractiveImageMap', () => (props) => {
    global.__wall1Areas = props.areas;
    return (
        <img
            src={props.imageSrc}
            alt="Wall1"
            data-testid="wall1-img"
        />
    );
});

describe('Wall1', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('shows Security Code keypad when keypad area is clicked', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        const keypadArea = global.__wall1Areas.find(a => a.id === 'keypad');
        keypadArea.onClick();
        expect(screen.getByTestId('keypad-root')).toBeInTheDocument();
    });

    it('shows lever overlay when lever area is clicked', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        const leverArea = global.__wall1Areas.find(a => a.id === 'lever');
        leverArea.onClick();
        expect(screen.getByTestId('lever-root')).toBeInTheDocument();
    });

    it('navigates left when left arrow area is clicked', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        const leftArrowArea = global.__wall1Areas.find(a => a.id === 'leftArrow');
        leftArrowArea.onClick();
        expect(mockNavigate).toHaveBeenCalledWith('/wall2');
    });

    it('navigates right when right arrow area is clicked', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        const rightArrowArea = global.__wall1Areas.find(a => a.id === 'rightArrow');
        rightArrowArea.onClick();
        expect(mockNavigate).toHaveBeenCalledWith('/wall4');
    });

    it('shows torchlight overlay when isDark is true', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        expect(document.querySelector('.pointer-events-none')).toBeInTheDocument();
    });

    it('renders all four corner lights', () => {
        render(
            <MemoryRouter>
                <Wall1 />
            </MemoryRouter>
        );
        expect(document.querySelectorAll('.rounded-full').length).toBeGreaterThanOrEqual(4);
    });
});