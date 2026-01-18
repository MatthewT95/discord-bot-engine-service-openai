import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment variables if not already set
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Use a different port for tests