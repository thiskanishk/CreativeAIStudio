/// <reference types="cypress" />
/// <reference path="./index.d.ts" />

/**
 * Custom Cypress commands
 */
// @ts-nocheck - Disable TypeScript checking for this file
// Import cypress-file-upload package
import 'cypress-file-upload';

// Add type definition for cypress-file-upload
declare namespace Cypress {
  interface Chainable {
    attachFile(filePath: string | FileDetails | FileDetails[]): Chainable<JQuery<HTMLElement>>;
  }
}

// Interface for file details
interface FileDetails {
  filePath?: string;
  fileName?: string;
  mimeType?: string;
  encoding?: string;
  fileContent?: string;
}

// Extend Cypress namespace with our custom commands
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to verify image integrity
     * @example cy.verifyImageIntegrity('[data-testid="image-preview"] img')
     */
    verifyImageIntegrity(selector: string): void;

    /**
     * Custom command to mock image security validation
     * @example cy.mockImageSecurity(false, 'Invalid file type')
     */
    mockImageSecurity(allowImage?: boolean, errorMessage?: string): void;
  }
}

/**
 * Custom command to verify image integrity
 * Checks that an image loads properly and doesn't throw errors
 */
// @ts-nocheck - Disable TypeScript checking for this file
Cypress.Commands.add('verifyImageIntegrity', (selector: string) => {
  // Get the image element
  cy.get(selector).then($img => {
    // Should be visible
    cy.wrap($img).should('be.visible');

    // Check for proper image dimensions (non-zero)
    cy.wrap($img)
      .should('have.prop', 'naturalWidth')
      .and('be.greaterThan', 0);
    
    cy.wrap($img)
      .should('have.prop', 'naturalHeight')
      .and('be.greaterThan', 0);
    
    // Check image hasn't failed loading (no error event)
    cy.document().then(doc => {
      const imgElem = doc.querySelector(selector) as HTMLImageElement;
      // Has complete property set to true
      expect(imgElem.complete).to.be.true;
      // No error in loading the image
      cy.wrap($img).should('not.have.class', 'error');
    });
  });
});

/**
 * Custom command to mock image security validation
 * This allows testing security behaviors without changing the UI components
 */
// @ts-nocheck - Disable TypeScript checking for this file
Cypress.Commands.add('mockImageSecurity', (allowImage = true, errorMessage = '') => {
  cy.window().then(win => {
    // Mock validateImage function on window object
    cy.stub(win, 'validateImage').returns(
      allowImage 
        ? { isValid: true, message: 'File is valid' }
        : { isValid: false, message: 'File validation failed', issues: [errorMessage] }
    );
  });
});

// For TypeScript support
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to verify image integrity
       * @example cy.verifyImageIntegrity('[data-testid="image-preview"] img')
       */
      verifyImageIntegrity(selector: string): void;

      /**
       * Custom command to mock image security validation
       * @example cy.mockImageSecurity(false, 'Invalid file type')
       */
      mockImageSecurity(allowImage?: boolean, errorMessage?: string): void;
    }
  }
} 