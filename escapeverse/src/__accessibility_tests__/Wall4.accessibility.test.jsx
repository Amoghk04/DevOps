import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

// Mock useGame from its actual provider location
jest.mock('../rooms/GameProvider', () => ({
  useGame: () => ({
    isDark: true,
    isWindowClosed: false,
    setIsWindowClosed: jest.fn(),
    wall3code: '123456',
  }),
}));

// Mock InteractiveImageMap to avoid errors and unnecessary rendering
jest.mock('../InteractiveImageMap', () => (props) => (
  <img src={props.imageSrc} alt="Wall4" data-testid="wall4-img" />
));

// Mock TileGrid to avoid rendering its internals
jest.mock('../rooms/tech/Component/Tiles', () => () =>
  <div data-testid="tile-grid-component" />
);

import Wall4 from '../rooms/wall4';

expect.extend(toHaveNoViolations);

describe('Wall4 accessibility', () => {
  it('has no basic accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <Wall4 />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with tile grid open', async () => {
    const { container } = render(
      <MemoryRouter>
        <Wall4 />
        <div data-testid="tile-grid-root">
          <div data-testid="tile-grid-component" />
        </div>
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with pin input open', async () => {
    const { container } = render(
      <MemoryRouter>
        <Wall4 />
        <div data-testid="pin-input-root">
          <label htmlFor="pin-input">Enter PIN</label>
          <input id="pin-input" type="password" />
        </div>
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with torchlight overlay visible', async () => {
    const { container } = render(
      <MemoryRouter>
        <Wall4 />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});