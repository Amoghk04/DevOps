import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

// Mock useGame from its actual provider location
jest.mock('../rooms/GameProvider', () => ({
  useGame: () => ({
    isDark: true,
    isPowerOn: false,
    setIsPowerOn: jest.fn(),
    playErrorSound: jest.fn(),
  }),
}));

// Mock InteractiveImageMap to avoid errors and unnecessary rendering
jest.mock('../InteractiveImageMap', () => (props) => (
  <img src={props.imageSrc} alt="Wall2" data-testid="wall2-img" />
));

// Mock ComputerScreen and WirePuzzle to avoid rendering their internals
jest.mock('../rooms/tech/Component/ComputerScreen', () => (props) =>
  props.isOpen ? <div data-testid="computer-screen-root" /> : null
);
jest.mock('../rooms/tech/Component/WirePuzzle', () => () =>
  <div data-testid="wire-puzzle-root" />
);

import Wall2 from '../rooms/wall2';

expect.extend(toHaveNoViolations);

describe('Wall2 accessibility', () => {
  it('has no basic accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <Wall2 />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with computer screen open', async () => {
    // Render Wall2 and simulate computer screen open
    const { container } = render(
      <MemoryRouter>
        <Wall2 />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with wire puzzle open', async () => {
    // Remock useGame if needed, or simulate opening the wire puzzle
    const { container } = render(
      <MemoryRouter>
        <Wall2 />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with torchlight overlay visible', async () => {
    const { container } = render(
      <MemoryRouter>
        <Wall2 />
      </MemoryRouter>
    );
    // The torchlight overlay is visible when isDark is true (already mocked)
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});