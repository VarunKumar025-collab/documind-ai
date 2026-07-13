const express = require("express");
const router = express.Router();
const { uploadDocument, getDocuments } = require("../controllers/documentController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// POST /api/documents/upload
router.post("/upload", protect, upload.single("file"), uploadDocument);

// GET /api/documents
router.get("/", protect, getDocuments);

module.exports = router;