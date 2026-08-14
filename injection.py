import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma


VECTOR_DB_DIR = "vector_db"
COLLECTION_NAME = "rag_documents"


def create_embedding_model():

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return embeddings


def load_document(file_path):

    if not os.path.exists(file_path):

        raise FileNotFoundError(
            f"File not found: {file_path}"
        )


    file_extension = os.path.splitext(
        file_path
    )[1].lower()


    if file_extension == ".pdf":

        loader = PyPDFLoader(file_path)


    elif file_extension == ".txt":

        from langchain_community.document_loaders import TextLoader

        loader = TextLoader(
            file_path,
            encoding="utf-8"
        )


    else:

        raise ValueError(
            "Unsupported file type. "
            "Only PDF and TXT files are supported."
        )


    return loader.load()


def split_documents(documents):

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = text_splitter.split_documents(
        documents
    )

    return chunks


def store_embeddings(chunks):

    embeddings = create_embedding_model()


    vector_db = Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=VECTOR_DB_DIR,
        embedding_function=embeddings
    )


    existing_data = vector_db.get()

    if existing_data["ids"]:

        vector_db.delete(
            ids=existing_data["ids"]
        )


    vector_db.add_documents(
        documents=chunks
    )


    return vector_db


def process_document(file_path):

    documents = load_document(
        file_path
    )

    print(
        f"Loaded {len(documents)} pages"
    )


    chunks = split_documents(
        documents
    )

    print(
        f"Created {len(chunks)} chunks"
    )


    vector_db = store_embeddings(
        chunks
    )


    print(
        "Document successfully stored in ChromaDB"
    )


    return vector_db