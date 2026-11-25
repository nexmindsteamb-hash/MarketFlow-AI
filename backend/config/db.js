const mongoose = require("mongoose");

/**
 * Connects to MongoDB using MONGO_URI from the environment.
 * Call once at server start-up: `await connectDB();`
 */
async function connectDB(uri = process.env.MONGO_URI) {
  if (!uri) {
    throw new Error("MONGO_URI is not set. Add it to backend/.env (see .env.example).");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
