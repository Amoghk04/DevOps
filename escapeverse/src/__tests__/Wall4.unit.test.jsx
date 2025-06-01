import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Wall4 from '../rooms/wall4';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock useGame from its actual provider location
jest.mock('../rooms/GameProvider', () => ({
    useGame: () => ({
        isDark: true,
        isWindowClosed: false,
        setIsWindowClosed: jest.fn(),
        wall3code: '123456',
    }),
}));

// Mock InteractiveImageMap to expose the areas prop for testing
jest.mock('../InteractiveImageMap', () => (props) => {
    global.__wall4Areas = props.areas;
    return (
        <img
            src={props.imageSrc}
            alt="Wall4"
            data-testid="wall4-img"
        />
    );
});

describe('Wall4', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Wall4 />
            </MemoryRouter>
        );
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('shows torchlight overlay when isDark is true', () => {
        render(
            <MemoryRouter>
                <Wall4 />
            </MemoryRouter>
        );
        expect(document.querySelector('.pointer-events-none')).toBeInTheDocument();
    });

    it('navigates left when left arrow is clicked', () => {
        render(
            <MemoryRouter>
                <Wall4 />
            </MemoryRouter>
        );
        // left arrow navigates to wall1
        const leftArrow = screen.getByTestId('left-arrow');
        fireEvent.click(leftArrow);
        expect(mockNavigate).toHaveBeenCalledWith('/wall1');
    });

    it('navigates right when right arrow is clicked', () => {
        render(
            <MemoryRouter>
                <Wall4 />
            </MemoryRouter>
        );
        // right arrow navigates to wall3
        const rightArrow = screen.getByTestId('right-arrow');
        fireEvent.click(rightArrow);
        expect(mockNavigate).toHaveBeenCalledWith('/wall3');
    });

    it('shows tile grid when window area is clicked', () => {
        render(
            <MemoryRouter>
                <Wall4 />
            </MemoryRouter>
        );
        const windowArea = global.__wall4Areas.find(a => a.id === 'window');
        windowArea.onClick();
        expect(screen.getByTestId('tile-grid-root')).toBeInTheDocument();
    });

    it('shows pin input when passcode area is clicked', () => {
        render(
            <MemoryRouter>
                <Wall4 />
            </MemoryRouter>
        );
        const passcodeArea = global.__wall4Areas.find(a => a.id === 'passcode');
        passcodeArea.onClick();
        expect(screen.getByTestId('pin-input-root')).toBeInTheDocument();
    });
});