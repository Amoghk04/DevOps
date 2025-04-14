// jest.setup.js

/* eslint-disable no-undef */

/* eslint-env jest */

require('@testing-library/jest-dom');
const { toHaveNoViolations } = require('jest-axe');

expect.extend(toHaveNoViolations);
