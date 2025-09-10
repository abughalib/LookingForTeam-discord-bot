#!/bin/bash

# Test Runner Script for LookingForTeam Discord Bot Database Tests
# This script sets up the test environment and runs the database tests

echo "Setting up test environment for LookingForTeam Discord Bot"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate Prisma client if needed
echo "Generating Prisma client..."
npx prisma generate

# Set test environment variable
export NODE_ENV=test
export DATABASE_URL="file:./test.db"

echo "Running database tests..."
echo "=================================================="

# Run tests with different options based on argument
case "${1:-all}" in
    "unit")
        echo "Running unit tests only..."
        npm run test:unit
        ;;
    "integration") 
        echo "Running integration tests only..."
        npm run test:integration
        ;;
    "performance")
        echo "Running performance tests..."
        npx jest --testPathPattern=performance
        ;;
    "coverage")
        echo "Running tests with coverage..."
        npm run test:coverage
        ;;
    "all"|*)
        echo "Running all tests..."
        npm test
        ;;
esac

echo "=================================================="
echo "Test run completed!"

# Clean up test databases
if [ -f "test.db" ]; then
    echo "Cleaning up test database..."
    rm -f test.db
fi

if [ -f "performance_test.db" ]; then
    echo "Cleaning up performance test database..."  
    rm -f performance_test.db
fi

echo "All done! The database functions are ready for Elite Dangerous colonization projects!"
