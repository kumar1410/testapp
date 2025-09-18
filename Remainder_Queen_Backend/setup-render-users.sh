#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up test users in Render database...${NC}\n"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed.${NC}"
    exit 1
fi

# Check if mysql2 module is installed
if ! node -e "require('mysql2')" &> /dev/null; then
    echo -e "${YELLOW}Installing required mysql2 module...${NC}"
    npm install mysql2 dotenv
fi

# Prompt for database credentials
echo -e "${YELLOW}Please enter your Render MySQL database credentials:${NC}"
echo -e "${YELLOW}(You can find these in your Render dashboard -> Database -> Info)${NC}\n"

read -p "Database Host: " DB_HOST
read -p "Database Name: " DB_NAME
read -p "Database User: " DB_USER
read -sp "Database Password: " DB_PASSWORD
echo # New line after password

# Create temporary .env file
echo "Creating temporary .env file..."
cat > ./scripts/.env << EOF
DB_HOST="${DB_HOST}"
DB_NAME="${DB_NAME}"
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"
EOF

echo -e "\n${GREEN}Created temporary .env file${NC}"

# Run the setup script
echo -e "\n${YELLOW}Running database setup script...${NC}"
node ./scripts/setup-test-db.js

# Clean up
rm ./scripts/.env
echo -e "\n${GREEN}Cleaned up temporary files${NC}"

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "You can now use these test accounts:"
echo -e "${YELLOW}1. admin/admin123 ${NC}(Admin access)"
echo -e "${YELLOW}2. test/test123 ${NC}(Test user)"
echo -e "${YELLOW}3. demouser/demo123 ${NC}(Demo user)"