// Test setup file for Jest
import { jest } from "@jest/globals";

// Increase timeout for database operations
jest.setTimeout(10000);

// Mock environment variables
process.env.DATABASE_URL = "file:./test.db";

// Global test utilities
global.console = {
  ...console,
  // Suppress error logs in tests unless needed
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Clean up after tests
afterAll(async () => {
  // Any global cleanup can go here
});
