# Silent Shield - RFID Tap-to-Pay System

A real-time RFID-based payment and monitoring system built with ESP8266, Node.js, and MongoDB.

## 🚀 Live Dashboard
The web dashboard is hosted and accessible at:
**[http://157.173.101.159:9270](http://157.173.101.159:9270)**

## 📦 Project Components

### 1. ESP8266 Firmware (`/firmware`)
- Written in C++/Arduino.
- Handles RFID card scanning and MQTT communication.
- Connects to the centralized HiveMQ broker.

### 2. Backend API (`/backend`)
- Built with **Node.js** and **Express**.
- Manages card data and transactions in **MongoDB Atlas**.
- Provides real-time updates via **Socket.IO**.
- Handles MQTT messages from the hardware devices.

### 3. Web Dashboard (`/frontend`)
- Modern, minimal UI built with **HTML/Vanilla CSS** and **JavaScript**.
- Real-time status monitoring for MQTT Broker, Backend Server, and Database.
- Live stats for total cards, transaction volume, and recent history.
- Clean, responsive design optimized for desktop viewing.

## 🛠️ Setup Instructions

### Backend Setup
1. Navigate to `/backend`.
2. Install dependencies: `npm install`.
3. Configure `.env` with your MongoDB URI and Preferred Port.
4. Start the server: `npm run dev`.

### Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Configure `config.js` with your Backend URL.
4. Start the server: `npm run dev`.

### Hardware Setup
1. Open the `.ino` files in `/firmware` using Arduino IDE.
2. Update WiFi credentials and MQTT topic.
3. Upload to ESP8266.

## � Running Locally

If you clone this repository, follow these steps to run it on your machine:

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance or MongoDB Atlas account)

### 2. Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update `MONGODB_URI` in `.env` with your own database connection string.

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. Ensure `config.js` is set to point to your local backend (usually `http://localhost:8271`).

### 4. Start the Application
- **Start Backend**: `cd backend && npm run dev`
- **Start Frontend**: `cd frontend && npm run dev`
- **Open Dashboard**: Visit `http://localhost:9270` in your browser.

## �📄 Repository Structure
```text
tap-to-pay/
├── backend/      # Node.js API & Business Logic
├── frontend/     # Web Dashboard Assets
├── firmware/     # ESP8266 Arduino Source Code
├── README.md     # Project Documentation
└── deploy.sh     # VPS Deployment Script
```

---
**Submission Metadata:**
- **Public URL:** [https://github.com/Edouard144/tap-pay](https://github.com/Edouard144/tap-pay)
- **Live URL:** http://157.173.101.159:9270
