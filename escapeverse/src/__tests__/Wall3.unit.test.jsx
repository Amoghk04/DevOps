import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Wall3 from '../rooms/wall3';

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
        serverRoomKey: '1234',
        server2Code: '5678',
    }),
}));

// Mock InteractiveImageMap to expose the areas prop for testing
jest.mock('../InteractiveImageMap', () => (props) => {
    global.__wall3Areas = props.areas;
    return (
        <img
            src={props.imageSrc}
            alt="Wall3"
            data-testid="wall3-img"
        />
    );
});

describe('Wall3', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Wall3 />
            </MemoryRouter>
        );
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('shows torchlight overlay when isDark is true', () => {
        render(
            <MemoryRouter>
                <Wall3 />
            </MemoryRouter>
        );
        expect(document.querySelector('.pointer-events-none')).toBeInTheDocument();
    });

    it('navigates left when left arrow is clicked', () => {
        render(
            <MemoryRouter>
                <Wall3 />
            </MemoryRouter>
        );
        // left arrow navigates to wall4
        const leftArrow = screen.getByTestId('left-arrow');
        fireEvent.click(leftArrow);
        expect(mockNavigate).toHaveBeenCalledWith('/wall4');
    });

    it('navigates right when right arrow is clicked', () => {
        render(
            <MemoryRouter>
                <Wall3 />
            </MemoryRouter>
        );
        // right arrow navigates to wall2
        const rightArrow = screen.getByTestId('right-arrow');
        fireEvent.click(rightArrow);
        expect(mockNavigate).toHaveBeenCalledWith('/wall2');
    });

    it('shows server1 screen when server-1 area is clicked', () => {
        render(
            <MemoryRouter>
                <Wall3 />
            </MemoryRouter>
        );
        const server1Area = global.__wall3Areas.find(a => a.id === 'server-1');
        server1Area.onClick();
        expect(screen.getByTestId('server1-screen-root')).toBeInTheDocument();
    });

    it('shows server2 screen when server-2 area is clicked', () => {
        render(
            <MemoryRouter>
                <Wall3 />
            </MemoryRouter>
        );
        const server2Area = global.__wall3Areas.find(a => a.id === 'server-2');
        server2Area.onClick();
        expect(screen.getByTestId('server2-screen-root')).toBeInTheDocument();
    });

    it('shows server3 screen when server-3 area is clicked', () => {
        render(
            <MemoryRouter>
                <Wall3 />
            </MemoryRouter>
        );
        const server3Area = global.__wall3Areas.find(a => a.id === 'server-3');
        server3Area.onClick();
        expect(screen.getByTestId('server3-screen-root')).toBeInTheDocument();
    });
});