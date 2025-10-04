/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: [],

  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/cypress/',
  ],
};
