const openaiProvider = require('./openai.provider');
const leonardoProvider = require('./leonardo.provider');

/**
 * AI providers collection
 */
const providers = {
  openai: openaiProvider,
  leonardo: leonardoProvider
};

module.exports = providers; 