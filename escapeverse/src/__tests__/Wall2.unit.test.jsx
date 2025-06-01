import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Wall2 from '../rooms/wall2';

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
        isPowerOn: false,
        setIsPowerOn: jest.fn(),
        playErrorSound: jest.fn(),
    }),
}));

// Mock InteractiveImageMap to expose the areas prop for testing
jest.mock('../InteractiveImageMap', () => (props) => {
    // Expose the areas prop for testing
    global.__wall2Areas = props.areas;
    return (
        <img
            src={props.imageSrc}
            alt="Wall2"
            data-testid="wall2-img"
        />
    );
});

describe('Wall2', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Wall2 />
            </MemoryRouter>
        );
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('shows torchlight overlay when isDark is true', () => {
        render(
            <MemoryRouter>
                <Wall2 />
            </MemoryRouter>
        );
        expect(document.querySelector('.pointer-events-none')).toBeInTheDocument();
    });

    it('navigates left when left arrow is clicked', () => {
        render(
            <MemoryRouter>
                <Wall2 />
            </MemoryRouter>
        );
        // Find left arrow by test id or class (update Wall2 to add data-testid="left-arrow" if needed)
        const leftArrow = screen.getByTestId('left-arrow');
        fireEvent.click(leftArrow);
        expect(mockNavigate).toHaveBeenCalledWith('/wall3');
    });

    it('navigates right when right arrow is clicked', () => {
        render(
            <MemoryRouter>
                <Wall2 />
            </MemoryRouter>
        );
        const rightArrow = screen.getByTestId('right-arrow');
        fireEvent.click(rightArrow);
        expect(mockNavigate).toHaveBeenCalledWith('/wall1');
    });

    it('shows computer screen root when monitor is clicked', () => {
        render(
            <MemoryRouter>
                <Wall2 />
            </MemoryRouter>
        );
        const monitorArea = global.__wall2Areas.find(a => a.id === 'monitor');
        monitorArea.onClick();
        expect(screen.getByTestId('computer-screen-root')).toBeInTheDocument();
    });

    it('shows wire puzzle when fuseBox is clicked and power is off', () => {
        render(
            <MemoryRouter>
                <Wall2 />
            </MemoryRouter>
        );
        const fuseBoxArea = global.__wall2Areas.find(a => a.id === 'fuseBox');
        fuseBoxArea.onClick();
        expect(screen.getByTestId('wire-puzzle-root')).toBeInTheDocument();
    });
});