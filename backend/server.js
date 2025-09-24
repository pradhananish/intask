import express from "express";
import session from "express-session";
import { createClient } from "redis";
import * as connectRedis from "connect-redis"; // import as namespace
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Use connect-redis with express-session
const RedisStore = connectRedis.default(session); // access .default for ES module

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.connect().catch(console.error);

// Middleware
app.use(express.json());
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 },
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
