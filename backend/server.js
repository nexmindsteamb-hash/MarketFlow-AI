
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MarketFlowAI Backend is running!",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn("MONGO_URI is not set: starting without a database.");
  }
  app.listen(PORT, () => {
    console.log(`MarketFlowAI server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
