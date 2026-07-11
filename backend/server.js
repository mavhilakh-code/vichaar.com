import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import marketsRoutes from './routes/markets.js';
import userRoutes from './routes/user.js';
import chartRoutes from './routes/charts.js';
import commentRoutes from './routes/comments.js';
import walletRoutes from './routes/wallet.js';
import { startCronJobs } from './cron/marketSeeder.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/markets", marketsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/wallet", walletRoutes);

// Start Cron Jobs
startCronJobs();

// Test route
app.get("/", (req, res) => {
  res.send("Vichaar Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// 