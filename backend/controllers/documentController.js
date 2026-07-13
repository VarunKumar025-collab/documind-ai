const fs = require("fs");
const pdfParse = require("pdf-parse");
const Document = require("../models/Document");
const chunkText = require("../utils/chunkText");
const getEmbedding = require("../utils/embeddings");

// @desc  Upload a PDF, extract text, chunk it, embed it, and save
// @route POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Read the uploaded PDF file from disk
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // 2. Extract raw text from the PDF
    const pdfData = await pdfParse(fileBuffer);
    const rawText = pdfData.text;

    // 3. Split the text into overlapping chunks
    const textChunks = chunkText(rawText, 1000, 200);

    // 4. Generate an embedding for each chunk
    const chunksWithEmbeddings = [];
    for (let i = 0; i < textChunks.length; i++) {
      const embedding = await getEmbedding(textChunks[i]);
      chunksWithEmbeddings.push({
        text: textChunks[i],
        embedding,
        chunkIndex: i,
      });
    }

    // 5. Save the document with all its chunks to MongoDB
    const document = await Document.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      chunks: chunksWithEmbeddings,
    });

    // 6. Delete the temporary file from disk (we don't need it anymore)
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: "Document uploaded and processed successfully",
      documentId: document._id,
      fileName: document.fileName,
      totalChunks: chunksWithEmbeddings.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all documents uploaded by the logged-in user
// @route GET /api/documents
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .select("fileName createdAt chunks")
      .sort({ createdAt: -1 });

    const formatted = documents.map((doc) => ({
      _id: doc._id,
      fileName: doc.fileName,
      totalChunks: doc.chunks.length,
      createdAt: doc.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { uploadDocument, getDocuments };