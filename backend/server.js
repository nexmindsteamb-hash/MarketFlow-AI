
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const socialRoutes = require("./routes/socialRoutes")
const app = express();

app.use(cors());
app.use(express.json());
// Social Media Automation Routes
app.use("/api/social", socialRoutes);
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

app.listen(PORT, () => {
  console.log(`MarketFlowAI server running on port ${PORT}`);
});
