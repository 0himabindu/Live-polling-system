#!/bin/bash

# Create necessary directories
mkdir -p server/src/{controllers,models,routes,config}
mkdir -p client/src/{components,pages,store,utils}

# Create backend .env file
cat > server/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/polling-system
CLIENT_URL=http://localhost:3000
EOL

# Create frontend .env file
cat > client/.env << EOL
REACT_APP_SERVER_URL=https://live-polling-system-gg7v.vercel.app/
EOL

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

echo "Setup completed! You can now start the development servers:"
echo "1. Start MongoDB"
echo "2. In the server directory: npm run dev"
echo "3. In the client directory: npm start" 
