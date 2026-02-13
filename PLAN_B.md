# Project: Tap-to-Pay Deployment Plan B

Since you don't have `sudo` permissions on the VPS, we are switching to **Plan B**:
1.  **Unique Ports**: Moving to **8270** (Backend) and **9270** (Frontend) so you don't see Isaac's work!
2.  **MongoDB Atlas**: Using remote Atlas (no sudo needed).

## 🛠️ Step 1: Clean Up Locally
On your **Windows computer**, delete the heavy folders:
```bash
rm -rf backend/node_modules frontend/node_modules
```

## 📤 Step 2: Upload Again
```bash
scp -r . user270@157.173.101.159:~/tap-to-pay
```

## 🚀 Step 3: Run Deployment (on VPS)
```bash
cd ~/tap-to-pay && ./deploy.sh
```

## 📊 Step 4: Access Your App
Frontend: **http://157.173.101.159:9270**
Backend: **http://157.173.101.159:8271**


