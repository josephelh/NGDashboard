import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    // CHANGE THIS LINE
    fixturesFolder: 'cypress/fixtures', // <-- Update this path
    // ...
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
  },
});
