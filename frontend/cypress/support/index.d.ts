/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to verify image integrity
     * @example cy.verifyImageIntegrity('[data-testid="image-preview"] img')
     */
    verifyImageIntegrity(selector: string): Chainable<JQuery<HTMLElement>>

    /**
     * Custom command to mock image security validation
     * @example cy.mockImageSecurity(false, 'Invalid file type')
     */
    mockImageSecurity(allowImage?: boolean, errorMessage?: string): Chainable<void>

    /**
     * Custom command to upload a file
     * @example cy.get('input[type="file"]').attachFile('example.json')
     */
    attachFile(fileOrPath: string | Blob | FileAttachOptions): Chainable<JQuery<HTMLElement>>
  }
}

interface FileAttachOptions {
  filePath?: string
  fileName?: string
  mimeType?: string
  encoding?: string
  lastModified?: number
  fileContent?: string
} 