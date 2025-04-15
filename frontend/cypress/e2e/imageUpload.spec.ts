/**
 * E2E Tests for Image Upload Functionality
 * 
 * These tests validate the image upload process, 
 * security validations, and error handling in the UI.
 */

describe('Image Upload Functionality', () => {
  beforeEach(() => {
    // Visit the page with image upload functionality
    cy.visit('/create-ad');
    // Wait for page to load fully
    cy.get('h1').should('be.visible');
  });

  it('should allow uploading a valid image', () => {
    // Get the file input for image upload
    cy.get('input[type="file"]').first()
      .attachFile({
        filePath: 'fixtures/test-image.jpg',
        mimeType: 'image/jpeg',
        encoding: 'base64'
      });

    // Check that the image preview is displayed
    cy.get('[data-testid="image-preview"]').should('be.visible');
    
    // Check that no error message is displayed
    cy.get('[data-testid="upload-error"]').should('not.exist');
  });

  it('should reject uploading non-image files', () => {
    // Attempt to upload a PDF file
    cy.get('input[type="file"]').first()
      .attachFile({
        filePath: 'fixtures/test-document.pdf',
        mimeType: 'application/pdf'
      });
    
    // Check that error message is displayed
    cy.get('[data-testid="upload-error"]')
      .should('be.visible')
      .and('contain.text', 'Invalid file type');
    
    // Check that no image preview is displayed
    cy.get('[data-testid="image-preview"]').should('not.exist');
  });

  it('should reject uploading oversized images', () => {
    // Attempt to upload an oversized image
    cy.get('input[type="file"]').first()
      .attachFile({
        filePath: 'fixtures/large-image.jpg',
        mimeType: 'image/jpeg'
      });
    
    // Check that error message is displayed
    cy.get('[data-testid="upload-error"]')
      .should('be.visible')
      .and('contain.text', 'exceeds maximum allowed');
  });

  it('should sanitize filenames during upload', () => {
    // Upload image with suspicious filename
    cy.get('input[type="file"]').first()
      .attachFile({
        filePath: 'fixtures/test-image.jpg',
        fileName: '../../../etc/passwd.jpg',
        mimeType: 'image/jpeg'
      });
    
    // Check that image preview is displayed (file should be accepted)
    cy.get('[data-testid="image-preview"]').should('be.visible');
    
    // Check filename displayed in UI (if applicable)
    cy.get('[data-testid="filename-display"]')
      .should('not.contain.text', '../../../etc/passwd.jpg')
      .and('contain.text', 'etcpasswd.jpg');
  });

  it('should allow removing uploaded images', () => {
    // Upload an image first
    cy.get('input[type="file"]').first()
      .attachFile({
        filePath: 'fixtures/test-image.jpg',
        mimeType: 'image/jpeg'
      });
    
    // Verify image is displayed
    cy.get('[data-testid="image-preview"]').should('be.visible');
    
    // Click the remove button
    cy.get('[data-testid="remove-image-button"]').click();
    
    // Verify image is removed
    cy.get('[data-testid="image-preview"]').should('not.exist');
    cy.get('[data-testid="upload-placeholder"]').should('be.visible');
  });

  it('should detect malicious SVG content', () => {
    // Attempt to upload SVG with malicious content
    cy.get('input[type="file"]').first()
      .attachFile({
        filePath: 'fixtures/malicious.svg',
        mimeType: 'image/svg+xml'
      });
    
    // Check that error message is displayed
    cy.get('[data-testid="upload-error"]')
      .should('be.visible')
      .and('contain.text', 'potentially malicious content');
  });
});