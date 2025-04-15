require('dotenv').config();
const AIOrchestrator = require('./orchestrator');

// Make the orchestrator a singleton for the entire app
const aiOrchestrator = new AIOrchestrator();

// Initialize the AI orchestrator with configuration
aiOrchestrator.initialize({
  // Default providers
  textProvider: process.env.TEXT_PROVIDER || 'openai',
  imageProvider: process.env.IMAGE_PROVIDER || 'replicate',
  videoProvider: process.env.VIDEO_PROVIDER || 'replicate',
  voiceProvider: process.env.VOICE_PROVIDER || 'elevenlabs',
  
  // API Keys
  openAIKey: process.env.OPENAI_API_KEY,
  replicateKey: process.env.REPLICATE_API_KEY,
  elevenLabsKey: process.env.ELEVEN_LABS_KEY,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
});

// Export the orchestrator instance for use in the backend
module.exports = aiOrchestrator; 