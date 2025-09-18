#!/bin/bash

# Navigate to backend directory
cd "$(dirname "$0")/Remainder_Queen_Backend"

# Run the setup script
node scripts/setup-test-users.js

# Give feedback
if [ $? -eq 0 ]; then
    echo "✅ Test users setup completed successfully!"
else
    echo "❌ Test users setup failed!"
fi