const express = require("express");
const router = express.Router();
const { askQuestion } = require("../controllers/chatController");
const protect = require("../middleware/authMiddleware");

// POST /api/chat/ask
router.post("/ask", protect, askQuestion);

module.exports = router;