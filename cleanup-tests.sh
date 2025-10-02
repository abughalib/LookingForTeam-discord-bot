#!/bin/bash

# Clean up test databases after running tests
echo "Cleaning up test databases..."

if [ -f "test.db" ]; then
    rm -f test.db
    echo "Removed test.db"
fi

if [ -f "performance_test.db" ]; then
    rm -f performance_test.db
    echo "Removed performance_test.db"
fi

if [ -f "test.db-journal" ]; then
    rm -f test.db-journal
    echo "Removed test.db-journal"
fi

echo "Test database cleanup completed!"
