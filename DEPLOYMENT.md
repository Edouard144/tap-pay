# Deployment Guide - Tap-to-Pay System

Follow these steps to move your project from your local machine to your VPS.

## 1. Transfer Files to VPS

Open a terminal on your **local machine** (Windows PowerShell or Git Bash) and run:

```bash
# Navigate to your project folder
cd C:\Users\edoua\Desktop\tap-to-pay

# Upload the entire project to your VPS
# Replace 'user270' if your username is different
scp -r . user270@157.173.101.159:~/tap-to-pay
```

## 2. Run the Deployment Script

SSH into your VPS and run the setup script:

```bash
# Connect to VPS
ssh user270@157.173.101.159

# Navigate to the project
cd ~/tap-to-pay

# Make the script executable and run it
chmod +x deploy.sh
./deploy.sh
```

## 3. Access Your Dashboard

Once the script finishes, you can access your system at:
- **Frontend**: http://157.173.101.159:9208
- **Backend API**: http://157.173.101.159:8208

## Useful Commands (on VPS)
- `pm2 status`: View running Node.js processes
- `pm2 logs`: View live logs for debugging
- `systemctl status mongod`: Check if MongoDB is running
- `pm2 restart all`: Restart both apps

