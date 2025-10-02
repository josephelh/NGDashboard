/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: [],

  globals: {
    'ts-jest': {
      // This is the definitive way to handle the warning.
      // We are telling ts-jest to ignore this specific diagnostic code.
      diagnostics: {
        ignoreCodes: ['TS151001'],
      },
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
    },
  },

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/cypress/',
  ],
};
