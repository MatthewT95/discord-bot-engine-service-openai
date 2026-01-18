import express from 'express';
import { OpenAI } from 'openai';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create Express app
const app = express();

// Export app for testing
export { app };
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/models', async (req, res) => {
  try {
    // Return a static list for now - in production you might want to fetch from OpenAI
    res.json({
      models: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo'
      ]
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.post('/responses', async (req, res) => {
  try {
    const { model, input, instructions, temperature, max_output_tokens } = req.body;

    if (!model || !input) {
      return res.status(400).json({ error: 'Missing required fields: model and input' });
    }

    const response = await openai.responses.create({
      model,
      input,
      instructions,
      temperature,
      max_output_tokens,
    });

    res.json(response);
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Map OpenAI errors to HTTP status codes
    if (error.status === 400) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    if (error.status === 500) {
      return res.status(500).json({ error: 'OpenAI service error' });
    }

    // Default error response
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Models endpoint: http://localhost:${port}/models`);
  console.log(`Responses endpoint: http://localhost:${port}/responses`);
});