// server.js
const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const redisClient = require("./redisClient"); // CommonJS export
const authRouter = require("./auth"); // CommonJS

const app = express();

// Middleware
app.use(express.json());
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 3600000 }
}));

// Routes
app.use("/auth", authRouter);
app.get("/dashboard", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
  res.json({ message: `Welcome, ${req.session.username}` });
});

// Start server only if file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export app for testing
module.exports = app;
