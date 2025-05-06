// jest.config.js

 

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
  // Add this to exclude Playwright tests
  modulePathIgnorePatterns: ["<rootDir>/tests/", ".*\\.spec\\.js$"],
};
