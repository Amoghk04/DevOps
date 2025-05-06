import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import CreateRoom from '../CreateRoom'; // adjust path if needed

expect.extend(toHaveNoViolations);

describe('CreateRoom Accessibility', () => {
    it('should have no accessibility violations', async () => {
        const { container } = render(
            <MemoryRouter>
                <CreateRoom />
            </MemoryRouter>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
