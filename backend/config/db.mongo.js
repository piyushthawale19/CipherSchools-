 // config/db.mongo.js — MongoDB Atlas connection via Mongoose
 

const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");
const logger = require("../utils/logger");

async function connectMongoDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("[MongoDB] Connected successfully");
  } catch (err) {
    logger.error(`[MongoDB] Connection failed: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("[MongoDB] Disconnected — attempting reconnect...");
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`[MongoDB] Error: ${err.message}`);
  });
}

module.exports = { connectMongoDB };
