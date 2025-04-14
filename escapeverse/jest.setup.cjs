// jest.setup.js

/* eslint-disable no-undef */

/* eslint-env jest */
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

require('@testing-library/jest-dom');
const { toHaveNoViolations } = require('jest-axe');

expect.extend(toHaveNoViolations);
