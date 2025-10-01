describe('Authentication Flow', () => {
  it('should allow a user to log out and be redirected to the login page', () => {
    // --- SETUP ---
    cy.visit('/login', {
      onBeforeLoad(win) {
        const user = { firstName: 'Test', lastName: 'User', image: '' };
        const token = 'fake-jwt-token-for-testing';
        win.localStorage.setItem('auth_access_token', token);
        win.localStorage.setItem('logged_user', JSON.stringify(user));
      },
    });
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');

    // --- TEST ---

    // 1. First, find and click the profile button to open the menu.
    //    Let's give the profile button its own data-cy attribute.
    cy.get('[data-cy="profile-menu-button"]').should('be.visible').click();

    // 2. NOW that the menu is open, find and click the logout button.
    //    Cypress will automatically wait for it to appear after the click.
    cy.get('[data-cy="logout-button"]').click();

    // --- ASSERTION ---
    cy.url().should('include', '/login');
    cy.contains('Sign in to your account');
  });
});

describe('User Management', () => {
  // This `beforeEach` hook is now solely responsible for setting up the authenticated state.
  beforeEach(() => {
    // --- SETUP: Programmatically log in before each test ---
    // We visit a page (it can be any page, even the base URL) and use onBeforeLoad
    // to set our localStorage. This ensures the auth state is ready for the entire test.
    cy.visit('/', {
      onBeforeLoad(win) {
        const user = { firstName: 'Test', lastName: 'User', image: '' };
        const token = 'fake-jwt-token-for-testing';
        win.localStorage.setItem('auth_access_token', token);
        win.localStorage.setItem('auth_refresh_token', token); // Also set refresh token
        win.localStorage.setItem('logged_user', JSON.stringify(user));
      },
    });
  });

  /**
   * Test Case 1: Adding a new user.
   */
  it('should allow a user to add a new user and see them in the list', () => {
    // --- MOCK API RESPONSES FOR THIS SPECIFIC TEST ---
    const newUser = {
      id: 101,
      firstName: 'Cypress',
      lastName: 'Test',
      email: 'cypress@test.com',
      phone: '123-456-7890',
      company: { name: 'Testing Inc.' },
      image: 'https://robohash.org/--.png',
    };

    cy.fixture('users.json').then((initialUserData) => {
      let requestCount = 0;
      cy.intercept('GET', '**/users?*', (req) => {
        requestCount++;
        if (requestCount === 1) {
          // The first request gets the original fixture data.
          req.alias = 'getUsersInitial';
          req.reply({ body: initialUserData }); // Use the loaded fixture data
        } else {
          // The second request gets an appended list.
          req.alias = 'getUsersAfterAdd';
          req.reply({
            // 2. Create a new list with the new user AND the original users.
            users: [newUser, ...initialUserData.users],
            total: initialUserData.total + 1, // Update the total count
            skip: 0,
            limit: 9,
          });
        }
      });
    });

    cy.intercept('POST', '**/users/add', { statusCode: 201, body: newUser }).as(
      'addUser'
    );

    // --- TEST EXECUTION ---
    // 1. NOW we visit the page. The AuthGuard will run, see the localStorage token, and allow access.
    cy.visit('/users');

    // 2. Wait for the INITIAL fetch to complete. This should finally pass.
    cy.wait('@getUsersInitial');
    cy.get('[data-cy="table-view-button"]').click();
    cy.contains('th', 'Terry Medhurst').should('be.visible');

    // 3. Find and click the "Add User" button.
    cy.get('[data-cy="add-user-button"]').click();

    // 4. Fill out the form.
    cy.get('[data-cy="firstName-input"]').type(newUser.firstName);
    cy.get('[data-cy="lastName-input"]').type(newUser.lastName);
    cy.get('[data-cy="email-input"]').type(newUser.email);
    cy.get('[data-cy="phone-input"]').type(newUser.phone);

    // 5. Click the save button and wait for the POST request.
    cy.get('[data-cy="save-user-button"]').click();
    cy.wait('@addUser');

    // --- ASSERTIONS ---
    // 6. Wait for the automatic refetch to finish.
    cy.wait('@getUsersAfterAdd');

    cy.url().should('include', '/users');
    cy.get('[data-cy="table-view-button"]').click();
    cy.contains('th', `${newUser.firstName} ${newUser.lastName}`).should(
      'be.visible'
    );
    cy.contains('td', newUser.email).should('be.visible');
  });

  /**
   * Test Case 2: Logging out.
   */
});
