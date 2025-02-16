#!/bin/bash

echo "🚀 Starting Shrinx Installation..."

# Variables
GIT_REPO="https://github.com/your-username/Shrinx.git"
INSTALL_DIR="$HOME/Shrinx"

# Install necessary dependencies
echo "📦 Installing dependencies..."
sudo apt update && sudo apt install -y git curl nodejs npm sqlite3

# Install PM2 globally
npm install -g pm2

# Clone the repository
echo "📂 Cloning Shrinx repository..."
git clone $GIT_REPO $INSTALL_DIR
cd $INSTALL_DIR || exit

# Ask for user input
read -p "🔑 Enter Turnstile Secret Key: " TURNSTILE_SECRET
read -p "🌐 Enter the domain name (e.g., domain.com): " DOMAIN
read -p "👤 Enter Admin Username: " ADMIN_USER
read -s -p "🔒 Enter Admin Password: " ADMIN_PASS
echo ""

# Backend Setup
echo "⚙️ Setting up Backend..."
cd backend || exit
npm install

# Generate Config File
cat <<EOF > config.yml
database:
  path: "database.db"

turnstile:
  secret_key: "$TURNSTILE_SECRET"

url: "localhost:5000"

server:
  port: 5000

domains:
  - "$DOMAIN"

admin:
  username: "$ADMIN_USER"
  password: "$ADMIN_PASS"
EOF

echo "✅ Configuration file created!"

# Start backend with PM2
pm2 start server.js --name "Shrinx-Backend"
pm2 save
pm2 startup

echo "🚀 Backend is now running with PM2!"

# Frontend Setup
echo "⚙️ Setting up Frontend..."
cd ../frontend || exit
npm install

# Start frontend with PM2
pm2 start "npm start" --name "Shrinx-Frontend" --cwd "$INSTALL_DIR/frontend"
pm2 save

echo "✅ Frontend is now running with PM2!"

echo "🎉 Shrinx installation is complete!"
echo "🔗 Access Frontend: http://localhost:3000/"
echo "🔗 Access Backend: http://localhost:5000/"
