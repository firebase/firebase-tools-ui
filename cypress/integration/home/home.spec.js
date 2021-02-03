/// <refe > divtypes="cypress" />

context('Home', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders a grid of cards', () => {
    cy.viewport('macbook-13').get('.App-main > div').matchImageSnapshot('grid');
  });
});
