#!/bin/bash

# --- IoT RFID Tap-to-Pay VPS Deployment Script (No-Sudo Version) ---
echo "🚀 Starting Deployment..."

# 1. Access Check
if command -v sudo &> /dev/null; then
    echo "📦 Updating system packages..."
    sudo apt-get update -y
else
    echo "⚠️ Skipping system update (no sudo access)"
fi

# 2. Node.js check
if ! command -v node &> /dev/null
then
    echo "🔴 Error: Node.js is not installed on this VPS. Please contact support."
    exit 1
else
    echo "✅ Node.js already installed ($(node -v))"
fi

# 3. PM2 Check and Local Install
if ! command -v pm2 &> /dev/null
then
    echo "🟢 PM2 not found globally. Installing locally..."
    npm install pm2
    PM2_CMD="./node_modules/.bin/pm2"
else
    echo "✅ PM2 found globally"
    PM2_CMD="pm2"
fi

# 4. Setup Backend
echo "⚙️ Setting up Backend..."
cd backend
npm install
$PM2_CMD delete tap-to-pay-backend 2>/dev/null || true
$PM2_CMD start server.js --name "tap-to-pay-backend"
cd ..

# 5. Setup Frontend
echo "⚙️ Setting up Frontend..."
cd frontend
npm install
$PM2_CMD delete tap-to-pay-frontend 2>/dev/null || true
$PM2_CMD start server.js --name "tap-to-pay-frontend"
cd ..

# 6. Final Status
$PM2_CMD save
echo "✅ Deployment Complete!"
$PM2_CMD status
