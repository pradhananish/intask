// auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const users = [{ id: 1, username: "admin", passwordHash: bcrypt.hashSync("password123", 10) }];

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: "Invalid username" });
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ message: "Invalid password" });

  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ message: "Login successful" });
});

module.exports = router;
