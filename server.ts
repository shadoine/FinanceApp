import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { AppState } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to our local JSON database
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

// Realistic starting data for an aesthetic personal finance board
const defaultData: AppState = {
  portfolio: {
    cash: 12300,
    stocks: 34200,
    crypto: 4500,
    bonds: 8000,
    realEstate: 0,
    targetAllocation: {
      cash: 15,
      stocks: 60,
      crypto: 5,
      bonds: 10,
      realEstate: 10
    }
  },
  goals: [
    {
      id: 'g-1',
      name: 'Emergency Cushion',
      target: 20000,
      current: 12300,
      category: 'Emergency',
      deadline: '2026-12-31',
      color: 'emerald'
    },
    {
      id: 'g-2',
      name: 'Tokyo Dream Trip',
      target: 6000,
      current: 4200,
      category: 'Travel',
      deadline: '2026-10-15',
      color: 'amber'
    },
    {
      id: 'g-3',
      name: 'Cabin Downpayment',
      target: 50000,
      current: 15000,
      category: 'Housing',
      deadline: '2028-06-30',
      color: 'indigo'
    }
  ],
  transactions: [
    {
      id: 't-1',
      date: '2026-06-28T14:30:00.000Z',
      type: 'contribution',
      amount: 450,
      description: 'Monthly savings transfer',
      category: 'Emergency Cushion'
    },
    {
      id: 't-2',
      date: '2026-06-25T09:15:00.000Z',
      type: 'contribution',
      amount: 800,
      description: 'Global All-Cap ETF Purchase',
      category: 'Stocks'
    },
    {
      id: 't-3',
      date: '2026-06-20T18:00:00.000Z',
      type: 'gain',
      amount: 320,
      description: 'Ethereum Staking Reward',
      category: 'Crypto'
    },
    {
      id: 't-4',
      date: '2026-06-15T11:45:00.000Z',
      type: 'withdrawal',
      amount: 250,
      description: 'Tokyo Shinkansen ticket presale',
      category: 'Tokyo Dream Trip'
    },
    {
      id: 't-5',
      date: '2026-06-10T08:00:00.000Z',
      type: 'contribution',
      amount: 1500,
      description: 'Gov Bond Dividend reinvested',
      category: 'Bonds'
    },
    {
      id: 't-6',
      date: '2026-06-05T16:20:00.000Z',
      type: 'contribution',
      amount: 1000,
      description: 'Cabin Savings boost',
      category: 'Cabin Downpayment'
    }
  ],
  settings: {
    currency: '$',
    monthlySavingTarget: 1500,
    expectedAnnualReturn: 7.5
  }
};

// Ensure database directory and file exist
function initializeDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    console.log('Local DB initialized with default data at', DB_PATH);
  }
}

initializeDb();

// Load data from DB
function readDb(): AppState {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw) as AppState;
    }
  } catch (error) {
    console.error('Error reading DB, falling back to initial data', error);
  }
  return defaultData;
}

// Write data to DB
function writeDb(data: AppState): boolean {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to DB', error);
    return false;
  }
}

// REST API Endpoints
app.get('/api/data', (req, res) => {
  const data = readDb();
  res.json(data);
});

app.post('/api/data', (req, res) => {
  const newState = req.body as AppState;
  if (!newState || typeof newState !== 'object') {
    res.status(400).json({ error: 'Invalid state format' });
    return;
  }
  const success = writeDb(newState);
  if (success) {
    res.json({ success: true, message: 'Database saved successfully' });
  } else {
    res.status(500).json({ error: 'Failed to write data to disk' });
  }
});

// Reset database endpoint
app.post('/api/reset', (req, res) => {
  const success = writeDb(defaultData);
  if (success) {
    res.json({ success: true, data: defaultData });
  } else {
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Configure Vite middleware in development or static serving in production
async function configureServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development middleware integrated.');
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static files from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Finance Tracker server running on port ${PORT}`);
  });
}

configureServer();
