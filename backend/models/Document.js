const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number], // vector array (e.g. 1536 dimensions for OpenAI embeddings)
    required: true,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
});

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    chunks: [chunkSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);