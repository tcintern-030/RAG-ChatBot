# RAG Chatbot

A complete **Retrieval-Augmented Generation (RAG) Chatbot** that allows users to upload PDF or TXT documents, process them into embeddings, store them in ChromaDB, retrieve relevant document chunks, and generate grounded answers using an LLM.

The project demonstrates an end-to-end RAG workflow with a **FastAPI backend** and a simple web-based frontend.

---

## Features

* 📄 Upload **PDF** and **TXT** documents
* ✂️ Split documents into smaller chunks
* 🧠 Generate embeddings using Hugging Face
* 🗄️ Store document embeddings in **ChromaDB**
* 🔍 Retrieve relevant chunks using similarity search
* 🤖 Generate answers using an LLM
* 💬 Interactive chatbot interface
* 📊 Configure **Top-K** retrieval
* 📚 Display retrieved document chunks
* 📁 Display the currently uploaded document
* 🔄 Automatically clear previous chat when a new document is uploaded
* 🌐 FastAPI REST API
* 🎨 Web-based frontend

---

# Project Architecture

```text
                ┌──────────────────────┐
                │      User            │
                │  Upload Document     │
                │  Ask Question        │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │      Frontend        │
                │ HTML + CSS + JS      │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │      FastAPI         │
                │      Backend         │
                └──────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      ┌───────────────┐         ┌───────────────┐
      │  Injection    │         │  Retrieval    │
      │    Pipeline   │         │    Pipeline   │
      └───────┬───────┘         └───────┬───────┘
              │                         │
              ▼                         ▼
      Load Document              Similarity Search
              │                         │
              ▼                         ▼
       Text Splitting               ChromaDB
              │                         │
              ▼                         │
         Embeddings                    │
              │                         │
              ▼                         │
          ChromaDB ◄───────────────────┘
                                        │
                                        ▼
                              Retrieved Context
                                        │
                                        ▼
                              ┌────────────────┐
                              │ Prompt + LLM   │
                              └───────┬────────┘
                                      │
                                      ▼
                                AI Response
```

---

# RAG Workflow

The application follows the standard RAG pipeline:

```text
Document
   │
   ▼
Load Document
   │
   ▼
Split into Chunks
   │
   ▼
Generate Embeddings
   │
   ▼
Store in ChromaDB
   │
   ▼
User Question
   │
   ▼
Similarity Search
   │
   ▼
Top-K Relevant Chunks
   │
   ▼
Context Injection
   │
   ▼
Prompt Template
   │
   ▼
LLM
   │
   ▼
Grounded Answer
```

---

# Technologies Used

### Backend

* Python
* FastAPI
* Uvicorn
* LangChain

### Document Processing

* PyPDFLoader
* TextLoader
* RecursiveCharacterTextSplitter

### Embeddings

* Hugging Face
* `sentence-transformers/all-MiniLM-L6-v2`

### Vector Database

* ChromaDB

### LLM

* Google Gemini through LangChain

### Frontend

* HTML
* CSS
* JavaScript

---

# Project Structure

```text
RAG-ChatBot/
│
├── main.py
├── injection.py
├── retrieval.py
├── prompts.py
├── generation.py
│
├── requirements.txt
├── .env
├── .gitignore
│
├── uploads/
│
├── vector_db/
│
└── frontend/
    │
    ├── index.html
    ├── style.css
    └── script.js
```

---

# File Description

### `main.py`

Contains the FastAPI application and API endpoints.

It handles:

* Document uploads
* User questions
* Input validation
* Communication between frontend and RAG pipeline

Main endpoints:

```text
GET  /
POST /upload
POST /ask
```

---

### `injection.py`

Implements the **document ingestion/injection pipeline**.

It:

1. Loads the uploaded document
2. Detects PDF/TXT files
3. Splits documents into chunks
4. Generates embeddings
5. Stores the chunks and embeddings in ChromaDB

---

### `retrieval.py`

Implements the retrieval pipeline.

It:

1. Loads the ChromaDB vector database
2. Converts the user query into an embedding
3. Performs similarity search
4. Returns the most relevant document chunks

The number of retrieved chunks can be controlled using **Top-K**.

---

### `prompts.py`

Contains the prompt template used for the LLM.

The retrieved document context is inserted into the prompt before sending it to the LLM.

---

### `generation.py`

Handles the LLM generation process.

It combines:

```text
User Question
+
Retrieved Context
+
Prompt Template
        ↓
       LLM
        ↓
   AI Response
```

---

### `frontend/index.html`

Contains the structure of the chatbot interface.

It provides:

* Document upload section
* Uploaded document information
* Chat interface
* Question input
* Top-K control
* Retrieved chunks section

---

### `frontend/style.css`

Contains the complete styling of the web application.

---

### `frontend/script.js`

Handles communication between the frontend and FastAPI backend.

It manages:

* File selection
* File upload
* Displaying uploaded filename
* Sending questions
* Receiving AI responses
* Displaying retrieved chunks
* Top-K selection
* Loading states
* Error handling

---

# Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
```

Move into the project directory:

```bash
cd RAG-ChatBot
```

---

## 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Environment Variables

Create a `.env` file in the project root:

```text
GEMINI_API_KEY=your_api_key_here
```

Replace:

```text
your_api_key_here
```

with your actual Google Gemini API key.

### Important

The `.env` file should **not be pushed to GitHub** because it contains a secret API key.

Make sure `.env` is included in `.gitignore`.

Example:

```text
.env
__pycache__/
*.pyc
vector_db/
uploads/
venv/
```

---

# Running the Backend

Make sure you are in the project root:

```text
RAG-ChatBot/
```

Run:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

You can also open the FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Running the Frontend

Open a **second terminal**.

Move into the frontend directory:

```bash
cd frontend
```

Start the frontend server:

```bash
python -m http.server 5500 --bind 127.0.0.1
```

The frontend will be available at:

```text
http://127.0.0.1:5500
```

### Important

Do not open `index.html` directly using:

```text
file:///...
```

Use the local HTTP server instead.

---

# How to Use

### Step 1 — Start the Backend

```bash
uvicorn main:app --reload
```

### Step 2 — Start the Frontend

In another terminal:

```bash
cd frontend
python -m http.server 5500 --bind 127.0.0.1
```

### Step 3 — Open the Application

Go to:

```text
http://127.0.0.1:5500
```

### Step 4 — Upload a Document

Upload either:

```text
document.pdf
```

or:

```text
document.txt
```

The application will display the uploaded filename.

For example:

```text
📄 Laws of Cricket.pdf
✓ Active document
```

### Step 5 — Document Processing

The backend:

```text
Upload
  ↓
Load
  ↓
Chunk
  ↓
Embed
  ↓
Store in ChromaDB
```

### Step 6 — Ask a Question

Enter a question related to the uploaded document.

For example:

```text
What are the ways a batsman can be dismissed?
```

### Step 7 — Retrieval

The system searches ChromaDB and retrieves the most relevant chunks.

```text
Question
   ↓
Similarity Search
   ↓
Top-K Chunks
```

### Step 8 — Generation

The retrieved chunks are injected into the prompt and sent to the LLM.

```text
Retrieved Context
       +
User Question
       ↓
Prompt
       ↓
LLM
       ↓
Grounded Answer
```

---

# Top-K Retrieval

The application allows you to control how many document chunks are retrieved.

For example:

```text
Top-K = 3
```

retrieves the 3 most relevant chunks.

```text
Top-K = 7
```

retrieves the 7 most relevant chunks.

You can experiment with different values and compare the quality of the generated responses.

### Lower Top-K

```text
Top-K = 2
```

Advantages:

* Less context
* Faster processing
* More focused information

Disadvantages:

* May miss relevant information

### Higher Top-K

```text
Top-K = 7
```

Advantages:

* More context
* Better chance of finding relevant information

Disadvantages:

* More irrelevant information may be included
* Larger prompt

---

# Supported File Types

Currently supported:

| File Type | Supported |
| --------- | --------- |
| PDF       | ✅         |
| TXT       | ✅         |
| DOCX      | ❌         |
| DOC       | ❌         |
| CSV       | ❌         |
| XLSX      | ❌         |

---

# API Endpoints

## `GET /`

Checks whether the backend is running.

Example response:

```json
{
    "message": "RAG Chatbot API is running"
}
```

---

## `POST /upload`

Uploads and processes a document.

Accepted file types:

```text
.pdf
.txt
```

Example response:

```json
{
    "message": "Document uploaded and processed successfully.",
    "filename": "document.pdf"
}
```

---

## `POST /ask`

Accepts a user question and retrieves relevant document chunks before generating an answer.

Example request:

```json
{
    "question": "What is this document about?",
    "top_k": 3
}
```

The response contains the generated answer and retrieval information according to the backend implementation.

---

# Example

Suppose the user uploads:

```text
cricket_laws.pdf
```

The system processes it:

```text
cricket_laws.pdf
       ↓
PDF Loader
       ↓
Text
       ↓
Recursive Character Text Splitter
       ↓
Chunks
       ↓
Hugging Face Embeddings
       ↓
ChromaDB
```

The user asks:

```text
What is Law 40 about?
```

The retrieval pipeline searches the vector database:

```text
User Question
      ↓
Embedding
      ↓
ChromaDB Similarity Search
      ↓
Relevant Chunks
```

Then:

```text
Relevant Chunks
      +
Question
      ↓
Prompt
      ↓
Gemini
      ↓
Answer
```

The application can also display the retrieved chunks so the user can see **what information was used to generate the response**.

---

# Important RAG Concepts Demonstrated

This project demonstrates the major components of a RAG system:

### 1. Document Loading

Documents are loaded from user uploads.

### 2. Chunking

Large documents are divided into smaller pieces using:

```text
RecursiveCharacterTextSplitter
```

### 3. Embeddings

Each chunk is converted into a numerical vector using:

```text
sentence-transformers/all-MiniLM-L6-v2
```

### 4. Vector Database

Embeddings are stored in:

```text
ChromaDB
```

### 5. Retrieval

Relevant chunks are retrieved using similarity search.

### 6. Context Injection

Retrieved chunks are inserted into the LLM prompt.

### 7. Generation

The LLM generates an answer based on the retrieved context.

---

# Project Learning Objectives

This project was built to understand and implement:

* Retrieval-Augmented Generation
* Document ingestion
* Text splitting
* Embeddings
* Vector databases
* Similarity search
* Retrievers
* Context injection
* Prompt templates
* LLM integration
* FastAPI
* Frontend-backend communication
* End-to-end RAG architecture

---

# Future Improvements

Possible future improvements include:

* Support for DOCX files
* Support for multiple documents simultaneously
* Document management and deletion
* Persistent document metadata
* Conversation memory
* Streaming LLM responses
* Authentication
* Better source citations
* Advanced retrieval techniques
* Hybrid search
* Reranking
* Improved UI/UX
* Deployment to a cloud platform

---

# Security Notes

Do not commit your API key to GitHub.

Never push:

```text
.env
```

to a public repository.

Also consider excluding generated data such as:

```text
vector_db/
uploads/
```

from version control.

---

# Developer

**Developed by Ahmad Mustafa**

This project was developed as an **AI Engineering learning project** to demonstrate a complete Retrieval-Augmented Generation pipeline using **Python, LangChain, ChromaDB, FastAPI, Hugging Face Embeddings, and Google Gemini**.
