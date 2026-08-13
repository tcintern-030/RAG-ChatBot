import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

from retrival import retrieve_documents
from prompt import RAG_PROMPT

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    temperature=0
)

def format_context(documents):
    context_parts = []

    for document in documents:
        context_parts.append(document.page_content)

    return "\n\n".join(context_parts)


def generate_answer(question, k=3):
    documents = retrieve_documents(
        query=question,
        k=k
    )

    if not documents:
        return {
            "answer": "The information is not available in the provided documents.",
            "sources": []
        }

    context = format_context(documents)

    prompt = RAG_PROMPT.format(
        context=context,
        question=question
    )

    response = llm.invoke(prompt)

    answer = response.content

    sources = []

    for document in documents:
        sources.append({
            "content": document.page_content,
            "metadata": document.metadata
        })

    return {
        "answer": answer,
        "sources": sources
    }