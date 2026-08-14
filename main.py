import os
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from injection import process_document
from generation import generate_answer


app = FastAPI(
    title="RAG Chatbot API",
    description="Document-based Retrieval-Augmented Generation Chatbot",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


class QuestionRequest(BaseModel):
    question: str
    top_k: int = 3


@app.get("/")
def root():

    return {
        "message": "RAG Chatbot API is running"
    }


@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):

    allowed_extensions = [".pdf", ".txt"]

    file_extension = os.path.splitext(
        file.filename
    )[1].lower()


    if file_extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported."
        )


    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )


    try:

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        process_document(file_path)


        return {
            "message":
                "Document uploaded and processed successfully.",

            "filename":
                file.filename
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )


@app.post("/ask")
def ask_question(
    request: QuestionRequest
):

    if not request.question.strip():

        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )


    if request.top_k < 1 or request.top_k > 10:

        raise HTTPException(
            status_code=400,
            detail="Top-K must be between 1 and 10."
        )


    try:

        result = generate_answer(
            question=request.question,
            k=request.top_k
        )

        return result


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Error generating answer: {str(e)}"
        )