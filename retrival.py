import os

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma


VECTOR_DB_DIR = "vector_db"
COLLECTION_NAME = "rag_documents"


def create_embedding_model():

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return embeddings


def load_vector_db():

    if not os.path.exists(VECTOR_DB_DIR):

        raise FileNotFoundError(
            "Vector database not found. "
            "Please upload and process a document first."
        )


    embeddings = create_embedding_model()


    vector_db = Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=VECTOR_DB_DIR,
        embedding_function=embeddings
    )


    return vector_db


def retrieve_documents(query, k=7):

    vector_db = load_vector_db()


    documents = vector_db.similarity_search(
        query,
        k=k
    )


    return documents