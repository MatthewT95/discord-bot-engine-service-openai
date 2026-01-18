# Discord Bot Engine Service - OpenAI Wrapper

A simple Express API that wraps the OpenAI Responses API, built with TypeScript and ES2022 modules.

## Features

- **POST /responses**: Forward requests to OpenAI's Responses API
- **GET /health**: Health check endpoint
- **GET /models**: List available models
- TypeScript support with Node.js 20+
- Environment-based configuration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```

3. **Required environment variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: Server port (optional, defaults to 3000)

## Running

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

## API Endpoints

### POST /responses

Forward requests to OpenAI's Responses API.

**Request Body:**
```json
{
  "model": "gpt-4o",
  "input": "Hello, how are you?",
  "instructions": "You are a helpful assistant.",
  "temperature": 0.7,
  "max_output_tokens": 1000
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "input": "What is the capital of France?"
  }'
```

### GET /health

Health check endpoint.

**Example:**
```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"2024-01-18T12:00:00.000Z"}
```

### GET /models

List available models.

**Example:**
```bash
curl http://localhost:3000/models
# Response: {"models":["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-4","gpt-3.5-turbo"]}
```

## Error Handling

The API maps OpenAI errors to appropriate HTTP status codes:
- `400`: Invalid request parameters
- `401`: Invalid API key
- `429`: Rate limit exceeded
- `500`: OpenAI service error or internal server error

## Development

- **Linting**: Uses TypeScript's strict mode
- **Testing**: Jest with Supertest for API testing
- **Building**: Compiles to `dist/` directory

## Testing

**Run tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Test environment setup:**
- Copy `.env.example` to `.env.test`
- Set your OpenAI API key in `.env.test`
- Tests run on port 3001 by default

The main test includes a chat response test that outputs the AI's response to the console.

## License

MIT