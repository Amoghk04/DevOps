// jest.setup.js

/* eslint-disable no-undef */

/* eslint-env jest */

import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);