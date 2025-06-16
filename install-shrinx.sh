#!/bin/bash

set -e

echo "🚀 Starting Shrinx Installation..."

# --- Configuration ---
GIT_REPO="https://github.com/isawebapp/shorturl.git"
INSTALL_DIR="$HOME/shrinx"

# --- 1) Install system dependencies ---
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y git curl sqlite3 build-essential

# --- 2) Ensure Node.js ≥18 is installed ---
echo "🔍 Checking Node.js version..."
if command -v node >/dev/null 2>&1; then
  VERSION=$(node -v | sed 's/^v//')
  MAJOR=${VERSION%%.*}
  if [ "$MAJOR" -lt 18 ]; then
    echo "⬇️ Node.js v$VERSION detected (<18). Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
  else
    echo "✅ Node.js v$VERSION detected. Skipping installation."
  fi
else
  echo "❗ Node.js not found. Installing Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
fi

# --- 3) Install PM2 globally ---
echo "📦 Installing PM2..."
npm install -g pm2

# --- 4) Clone (or update) the repo ---
if [ -d "$INSTALL_DIR" ]; then
  echo "📂 Repository already exists. Pulling latest changes..."
  cd "$INSTALL_DIR"
  git pull
else
  echo "📂 Cloning Shrinx repository..."
  git clone "$GIT_REPO" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# --- 5) Install TypeScript globally for build process ---
echo "📦 Installing TypeScript..."
npm install -g typescript

# --- 6) Prompt for environment variables ---
echo "🔧 Configuring environment variables..."
read -p "🔑 Cloudflare Turnstile site key: " SITE_KEY
read -p "🔑 Cloudflare Turnstile secret key: " SECRET_KEY
read -p "🌐 Allowed domains (comma-separated, e.g. localhost:3000,example.com): " DOMAINS
read -p "👤 Admin username: " ADMIN_USER
read -s -p "🔒 Admin password: " ADMIN_PASS
echo ""
read -s -p "🔐 Session password (min 32 characters): " SESSION_PASS
echo ""
while [ ${#SESSION_PASS} -lt 32 ]; do
  echo "❌ Session password must be at least 32 characters"
  read -s -p "🔐 Please enter a session password (min 32 characters): " SESSION_PASS
  echo ""
done
read -p "🚪 Port to serve the app on (default 3000): " APP_PORT
APP_PORT=${APP_PORT:-3000}

cat > .env.local <<EOF
NEXT_PUBLIC_TURNSTILE_SITE_KEY=$SITE_KEY
TURNSTILE_SECRET_KEY=$SECRET_KEY

ADMIN_USERNAME=$ADMIN_USER
ADMIN_PASSWORD=$ADMIN_PASS

SESSION_PASSWORD=$SESSION_PASS

DOMAINS=$DOMAINS
PORT=$APP_PORT
EOF

echo "✅ .env.local created"

# --- 7) Install project dependencies ---
echo "📦 Installing project dependencies..."
npm install

# --- 8) Build the Next.js app ---
echo "🏗  Building the app..."
npm run build

# --- 9) Start with PM2 ---
echo "🚀 Starting Shrinx under PM2 on port $APP_PORT..."
pm2 start "npm run start -- -p $APP_PORT" --name "shrinx"
pm2 save
pm2 startup

echo ""
echo "🎉 Installation complete!"
echo "🔗 Visit: http://localhost:$APP_PORT"
echo "🛑 To view PM2 processes: pm2 list"
echo "📄 To see logs: pm2 logs shrinx"
