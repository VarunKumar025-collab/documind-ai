<div align="center">

# 🧠 DocuMind AI

### Chat with your documents using Retrieval-Augmented Generation (RAG)

Upload any PDF and get instant, accurate, hallucination-free answers grounded strictly in its content.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-6366f1?style=for-the-badge)](https://documind-ai-wheat.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://www.langchain.com/)

[Live Demo](https://documind-ai-wheat.vercel.app) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📌 Overview

**DocuMind AI** is a full-stack Retrieval-Augmented Generation (RAG) platform that lets users upload PDF documents and ask natural-language questions about them. Instead of relying on an LLM's general knowledge (which can hallucinate), every answer is generated **strictly from the content of the uploaded document** — retrieved via semantic vector search and passed to Gemini as grounded context.

Built end-to-end: authentication, PDF ingestion pipeline, vector embeddings, semantic search, conversational AI, and a polished production UI — deployed and publicly accessible.

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based auth with bcrypt password hashing
- 📄 **PDF Ingestion Pipeline** — Automatic text extraction, intelligent chunking with overlap, and embedding generation
- 🔎 **Semantic Vector Search** — MongoDB Atlas Vector Search (cosine similarity) retrieves the most relevant chunks for any query
- 🤖 **Grounded AI Responses** — Google Gemini generates answers strictly from retrieved context, minimizing hallucination
- 💬 **Real-time Chat Interface** — Clean, ChatGPT-style conversational UI with typing indicators
- 📚 **Multi-document Support** — Upload and query multiple PDFs independently, each with isolated vector search
- 🎨 **Modern, Responsive UI** — Dark-themed, glassmorphism design built with Tailwind CSS

## 🏗️ Architecture

```
┌──────────────┐      ┌──────────────────┐      ┌───────────────────┐
│   React UI   │─────▶│  Express API      │─────▶│   MongoDB Atlas    │
│  (Vercel)    │◀─────│  (Render)         │◀─────│  + Vector Search   │
└──────────────┘      └────────┬──────────┘      └───────────────────┘
                                │
                     ┌──────────▼──────────┐
                     │  Google Gemini API   │
                     │ (Embeddings + Chat)  │
                     └──────────────────────┘
```

**RAG Pipeline:**
1. **Ingest** → PDF uploaded → text extracted (`pdf-parse`) → split into overlapping chunks
2. **Embed** → Each chunk converted to a vector via Gemini embeddings
3. **Store** → Vectors + text saved in MongoDB with a Vector Search index
4. **Retrieve** → User's question is embedded and matched against stored vectors via `$vectorSearch` (cosine similarity)
5. **Generate** → Top-matching chunks are passed to Gemini as context → grounded answer returned

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, React Router, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (+ Atlas Vector Search) |
| **AI / RAG** | LangChain.js, Google Gemini (embeddings + chat) |
| **Auth** | JWT, bcrypt |
| **File Handling** | Multer, pdf-parse |
| **Deployment** | Vercel (frontend), Render (backend) |

## 🚀 Live Demo

**App:** [documind-ai-wheat.vercel.app](https://documind-ai-wheat.vercel.app)

> Note: Backend runs on Render's free tier, which spins down after inactivity. The first request after idle time may take 30–50 seconds to respond.

## 📂 Project Structure

```
documind-ai/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/      # Auth, document, and chat logic
│   ├── middleware/        # JWT auth guard, Multer upload config
│   ├── models/           # User & Document (with chunks/embeddings) schemas
│   ├── routes/           # API route definitions
│   ├── utils/            # Chunking, embeddings, token generation
│   └── server.js
└── frontend/
    └── src/
        ├── api/           # Centralized Axios instance
        ├── context/       # Auth context (global login state)
        ├── pages/         # Login, Signup, Dashboard, Chat
        └── App.jsx        # Routing
```

## ⚙️ Getting Started (Local Setup)

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (with Vector Search enabled)
- Google Gemini API key (get one at aistudio.google.com/app/apikey)

### 1. Clone the repo
```
git clone https://github.com/VarunKumar025-collab/documind-ai.git
cd documind-ai
```

### 2. Backend setup
```
cd backend
npm install --legacy-peer-deps
```
Create a `.env` file (see `.env.example`):
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret
GEMINI_API_KEY=your_gemini_api_key
```
```
npm run dev
```

### 3. Frontend setup
```
cd ../frontend
npm install
```
Create a `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```
```
npm run dev
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/documents/upload` | Upload & process a PDF (protected) |
| `GET` | `/api/documents` | List all documents for logged-in user (protected) |
| `POST` | `/api/chat/ask` | Ask a question about a document (protected) |

## 🧩 Key Engineering Decisions

- **Chunking with overlap** — prevents context loss at chunk boundaries
- **Cosine similarity search** — MongoDB Atlas Vector Search index on `chunks.embedding`
- **Grounded prompting** — Gemini is explicitly instructed to answer only from retrieved context, reducing hallucination
- **Isolated per-document search** — vector search is filtered by `documentId`, so answers never leak across documents

## 📄 License

This project is open source and available under the MIT License.

---

<div align="center">
Built by <a href="https://github.com/VarunKumar025-collab">Varun Kumar</a>
</div>
