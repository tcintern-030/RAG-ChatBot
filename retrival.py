from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

def create_embedding_model():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return embeddings

def load_vector_db():
    embeddings = create_embedding_model()

    vector_db = Chroma(
        persist_directory="vector_db",
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