module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: './test/tsconfig.json',
    },
  },
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**', '!**/*.test.{ts,tsx}'],
  coverageReporters: ['json', 'lcov', 'text', 'html', 'cobertura'],
  coverageDirectory: '.coverage',
  testMatch: ['<rootDir>/test/**/?(*.)+(spec|test).+(ts|tsx|js)'],
  setupFilesAfterEnv: ['<rootDir>/test/_setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  verbose: false,
	collectCoverage: true,
  /**
   * restoreMocks [boolean]
   *
   * Default: false
   *
   * Automatically restore mock state between every test.
   * Equivalent to calling jest.restoreAllMocks() between each test.
   * This will lead to any mocks having their fake implementations removed
   * and restores their initial implementation.
   */
  restoreMocks: true,
  resetMocks: true,

  /**
   * resetModules [boolean]
   *
   * Default: false
   *
   * By default, each test file gets its own independent module registry.
   * Enabling resetModules goes a step further and resets the module registry before running each individual test.
   * This is useful to isolate modules for every test so that local module state doesn't conflict between tests.
   * This can be done programmatically using jest.resetModules().
   */
  resetModules: true,
};
