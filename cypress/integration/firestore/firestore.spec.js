context('Firestore', () => {
  beforeEach(() => {
    cy.visit('/firestore');
  });

  it('looks good', () => {
    cy.viewport('macbook-13');
    cy.get('button:contains("Start collection")').click();

    cy.get('.mdc-dialog__surface').within(() => {
      cy.root().matchImageSnapshot('new-collection-dialog');

      cy.focused().type('my-collection');
      cy.get('button:contains("Next")').click();

      cy.contains('.Field', 'Document ID').within(() => {
        cy.get('input').clear().type('my-document');
      });
      cy.root().matchImageSnapshot('new-data-dialog');

      cy.contains('.Field', 'Field').within(() => {
        cy.get('input').clear().type('foobar');
      });
      cy.contains('.Field', 'Value').within(() => {
        cy.get('input').clear().type('123');
      });
      cy.get('button:contains("Save")').click();
    });

    cy.get('.Firestore').matchImageSnapshot('with-data');
  });
});
