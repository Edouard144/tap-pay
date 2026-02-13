// server.js
const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json());

// Root route for API verification
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Tap-to-Pay API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      cards: '/cards',
      transactions: '/transactions'
    }
  });
});

const PORT = process.env.PORT || 8208;

// ────────────────────────────────────────────────
// MQTT Client (public HiveMQ – NO credentials needed)
// ────────────────────────────────────────────────
const mqttClient = mqtt.connect(process.env.MQTT_BROKER, {
  reconnectPeriod: 5000,
  connectTimeout: 10000,
  // username & password intentionally omitted – public broker rejects them
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker (HiveMQ public)');
  const statusTopic = `${process.env.MQTT_TOPIC_PREFIX}card/status`;
  const balanceTopic = `${process.env.MQTT_TOPIC_PREFIX}card/balance`;

  mqttClient.subscribe([statusTopic, balanceTopic], (err) => {
    if (err) {
      console.error('Subscribe failed:', err.message);
    } else {
      console.log(`Subscribed to: ${statusTopic}, ${balanceTopic}`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(`MQTT rx ${topic}:`, data);

    if (topic.endsWith('card/status')) {
      io.emit('card-status', data);
    } else if (topic.endsWith('card/balance')) {
      io.emit('card-balance', data);
    }
    // Add more topic handlers here if needed (status, etc.)
  } catch (err) {
    console.error('Invalid MQTT message:', err.message);
  }
});

mqttClient.on('error', (err) => console.error('MQTT error:', err.message));
mqttClient.on('close', () => console.log('MQTT disconnected – reconnecting...'));

// ────────────────────────────────────────────────
// MongoDB Setup
// ────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    console.log('Server continuing without DB (persistence disabled)');
  });


// Schemas
const cardSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, trim: true },
    holderName: { type: String, required: true, trim: true },
    balance: { type: Number, default: 0, min: 0 },
    lastTopupAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, index: true },
    holderName: { type: String, required: true },
    type: { type: String, enum: ['topup', 'debit'], default: 'topup' },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: String,
  },
  { timestamps: true }
);

const Card = mongoose.model('Card', cardSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    mqttConnected: mqttClient.connected,
  });
});

app.post('/topup', async (req, res) => {
  const { uid, amount, holderName } = req.body;

  if (!uid || typeof uid !== 'string' || uid.trim().length < 3) {
    return res.status(400).json({ error: 'Valid UID required (min 3 chars)' });
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive integer' });
  }

  try {
    let card = await Card.findOne({ uid: uid.trim() });
    const balanceBefore = card ? card.balance : 0;
    const isNew = !card;

    if (isNew) {
      if (!holderName?.trim()) {
        return res.status(400).json({ error: 'Holder name required for new card' });
      }
      card = new Card({
        uid: uid.trim(),
        holderName: holderName.trim(),
        balance: amount,
        lastTopupAmount: amount,
      });
    } else {
      card.balance += amount;
      card.lastTopupAmount = amount;
    }

    await card.save();

    const tx = await Transaction.create({
      uid: card.uid,
      holderName: card.holderName,
      type: 'topup',
      amount,
      balanceBefore,
      balanceAfter: card.balance,
      description: `Top-up of ${amount}`,
    });

    // Optional: publish updated balance to MQTT
    const balanceTopic = `${process.env.MQTT_TOPIC_PREFIX}card/balance`;
    mqttClient.publish(
      balanceTopic,
      JSON.stringify({
        uid: card.uid,
        balance: card.balance,
        timestamp: new Date().toISOString(),
      }),
      { qos: 1 },
      (err) => {
        if (err) console.error('MQTT publish failed:', err.message);
      }
    );

    res.json({
      success: true,
      card: {
        uid: card.uid,
        holderName: card.holderName,
        balance: card.balance,
        lastTopupAmount: card.lastTopupAmount,
        updatedAt: card.updatedAt,
      },
      transaction: {
        id: tx._id,
        amount: tx.amount,
        balanceAfter: tx.balanceAfter,
        timestamp: tx.createdAt,
      },
    });
  } catch (err) {
    console.error('Top-up error:', err.message);
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Get all cards
app.get('/cards', async (req, res) => {
  try {
    const cards = await Card.find().sort({ updatedAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get specific card details
app.get('/card/:uid', async (req, res) => {
  try {
    const card = await Card.findOne({ uid: req.params.uid });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Get all transactions
app.get('/transactions', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(limit);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction history for specific card
app.get('/transactions/:uid', async (req, res) => {
  try {
    const transactions = await Transaction.find({ uid: req.params.uid }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ────────────────────────────────────────────────
// Error handling middleware (last!)
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ────────────────────────────────────────────────
// Start
// ────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`MQTT prefix: ${process.env.MQTT_TOPIC_PREFIX}`);
});