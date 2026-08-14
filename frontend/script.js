// ============================================
// RAG CHATBOT - FRONTEND SCRIPT
// ============================================

const API_BASE_URL = "http://127.0.0.1:8000";


// ============================================
// GLOBAL STATE
// ============================================

let currentFile = null;
let isUploading = false;
let isAsking = false;


// ============================================
// DOM ELEMENTS
// ============================================

const fileInput =
    document.getElementById("fileInput");

const chooseFileButton =
    document.getElementById("chooseFileButton");

const uploadArea =
    document.getElementById("uploadArea");

const uploadStatus =
    document.getElementById("uploadStatus");

const uploadedFileName =
    document.getElementById("uploadedFileName");

const uploadStatusText =
    document.getElementById("uploadStatusText");

const documentList =
    document.getElementById("documentList");

const questionInput =
    document.getElementById("questionInput");

const sendButton =
    document.getElementById("sendButton");

const chatContent =
    document.getElementById("chatContent");

const topK =
    document.getElementById("topK");

const chatDocumentStatus =
    document.getElementById("chatDocumentStatus");

const loadingOverlay =
    document.getElementById("loadingOverlay");

const loadingText =
    document.getElementById("loadingText");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const retrievedSection =
    document.getElementById("retrievedSection");

const retrievedCount =
    document.getElementById("retrievedCount");

const sourcesContainer =
    document.getElementById("sourcesContainer");

const collapseSources =
    document.getElementById("collapseSources");


// ============================================
// INITIALIZATION
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "RAG Chatbot frontend loaded."
        );

        console.log(
            "Backend URL:",
            API_BASE_URL
        );

        // Disable chat initially
        disableChat();

        // Check backend ONCE
        checkBackend();
    }
);


// ============================================
// BACKEND CONNECTION CHECK
// ============================================

async function checkBackend() {

    console.log(
        "Checking backend..."
    );

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/`,
                {
                    method: "GET"
                }
            );


        console.log(
            "Backend status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Backend returned ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Backend connected:",
            data
        );


        updateConnectionStatus(
            true
        );


    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );


        updateConnectionStatus(
            false
        );
    }
}


// ============================================
// UPDATE CONNECTION STATUS
// ============================================

function updateConnectionStatus(
    connected
) {

    const container =
        document.querySelector(
            ".connection-status"
        );


    if (!container) {
        return;
    }


    const dot =
        container.querySelector(
            ".status-dot"
        );


    const text =
        container.querySelector(
            "span:last-child"
        );


    if (connected) {

        if (dot) {

            dot.style.background =
                "#22c55e";

            dot.style.boxShadow =
                "0 0 8px rgba(34,197,94,0.5)";
        }


        if (text) {

            text.textContent =
                "Backend connected";
        }


    } else {

        if (dot) {

            dot.style.background =
                "#ef4444";

            dot.style.boxShadow =
                "0 0 8px rgba(239,68,68,0.5)";
        }


        if (text) {

            text.textContent =
                "Backend disconnected";
        }
    }
}


// ============================================
// CHOOSE FILE BUTTON
// ============================================

if (chooseFileButton) {

    chooseFileButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            console.log(
                "Choose File clicked"
            );

            fileInput.click();
        }
    );
}


// ============================================
// FILE INPUT
// ============================================

if (fileInput) {

    fileInput.addEventListener(
        "change",
        () => {

            console.log(
                "File input changed"
            );


            if (!fileInput.files.length) {
                return;
            }


            const file =
                fileInput.files[0];


            console.log(
                "Selected file:",
                file.name
            );


            uploadFile(file);
        }
    );
}


// ============================================
// DRAG & DROP
// ============================================

if (uploadArea) {

    uploadArea.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            uploadArea.classList.add(
                "drag-over"
            );
        }
    );


    uploadArea.addEventListener(
        "dragleave",
        () => {

            uploadArea.classList.remove(
                "drag-over"
            );
        }
    );


    uploadArea.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            uploadArea.classList.remove(
                "drag-over"
            );


            const files =
                event.dataTransfer.files;


            if (!files.length) {
                return;
            }


            uploadFile(
                files[0]
            );
        }
    );
}


// ============================================
// UPLOAD FILE
// ============================================

async function uploadFile(file) {

    if (isUploading) {
        return;
    }


    console.log(
        "Uploading:",
        file.name
    );


    // Validate file extension

    const extension =
        file.name
            .substring(
                file.name.lastIndexOf(".")
            )
            .toLowerCase();


    if (
        extension !== ".pdf" &&
        extension !== ".txt"
    ) {

        showToast(
            "Only PDF and TXT files are supported.",
            "error"
        );

        return;
    }


    isUploading = true;


    // Disable upload button

    if (chooseFileButton) {

        chooseFileButton.disabled =
            true;
    }


    showLoading(
        `Uploading ${file.name}...`
    );


    try {

        // ------------------------------------
        // Create FormData
        // ------------------------------------

        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        console.log(
            "Sending upload request..."
        );


        // ------------------------------------
        // Send request to FastAPI
        // ------------------------------------

        const response =
            await fetch(
                `${API_BASE_URL}/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );


        console.log(
            "Upload status:",
            response.status
        );


        // ------------------------------------
        // Read response
        // ------------------------------------

        const data =
            await response.json();


        console.log(
            "Upload response:",
            data
        );


        // ------------------------------------
        // Handle error
        // ------------------------------------

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "File upload failed."
            );
        }


        // ------------------------------------
        // SUCCESS
        // ------------------------------------

        currentFile =
            data.filename ||
            file.name;


        console.log(
            "Current document:",
            currentFile
        );


        // ------------------------------------
        // Update UI
        // ------------------------------------

        showUploadedFile(
            currentFile
        );


        // ------------------------------------
        // Clear previous conversation
        // ------------------------------------

        clearChat();


        // ------------------------------------
        // Enable chat
        // ------------------------------------

        enableChat();


        // ------------------------------------
        // Update document status
        // ------------------------------------

        if (chatDocumentStatus) {

            chatDocumentStatus.textContent =
                `Current document: ${currentFile}`;
        }


        // ------------------------------------
        // Success message
        // ------------------------------------

        showToast(
            `${currentFile} uploaded successfully.`,
            "success"
        );


    } catch (error) {

        console.error(
            "Upload error:",
            error
        );


        showToast(
            error.message ||
            "Could not upload document.",
            "error"
        );


    } finally {

        isUploading = false;


        if (chooseFileButton) {

            chooseFileButton.disabled =
                false;
        }


        // Reset file input so
        // the same file can be selected again

        fileInput.value = "";


        hideLoading();
    }
}


// ============================================
// SHOW UPLOADED FILE
// ============================================

function showUploadedFile(
    filename
) {

    console.log(
        "Showing uploaded file:",
        filename
    );


    // Show upload status

    if (uploadStatus) {

        uploadStatus.classList.remove(
            "hidden"
        );
    }


    // Show filename

    if (uploadedFileName) {

        uploadedFileName.textContent =
            filename;
    }


    // Show status

    if (uploadStatusText) {

        uploadStatusText.textContent =
            "Active document";
    }


    // Clear previous document

    if (documentList) {

        documentList.innerHTML = "";
    }


    // Create document card

    const documentItem =
        document.createElement(
            "div"
        );


    documentItem.className =
        "document-item active-document";


    // File icon

    const extension =
        filename
            .substring(
                filename.lastIndexOf(".")
            )
            .toLowerCase();


    let icon = "📄";


    if (extension === ".pdf") {

        icon = "📕";
    }


    documentItem.innerHTML = `

        <div class="document-icon">
            ${icon}
        </div>

        <div class="document-info">

            <strong>
                ${escapeHtml(filename)}
            </strong>

            <span>
                ✓ Active document
            </span>

        </div>

    `;


    if (documentList) {

        documentList.appendChild(
            documentItem
        );
    }
}


// ============================================
// ENABLE CHAT
// ============================================

function enableChat() {

    console.log(
        "Chat enabled"
    );


    if (questionInput) {

        questionInput.disabled =
            false;

        questionInput.placeholder =
            "Ask a question about your document...";
    }


    if (sendButton) {

        sendButton.disabled =
            false;
    }


    if (topK) {

        topK.disabled =
            false;
    }
}


// ============================================
// DISABLE CHAT
// ============================================

function disableChat() {

    if (questionInput) {

        questionInput.disabled =
            true;

        questionInput.placeholder =
            "Upload a document first...";
    }


    if (sendButton) {

        sendButton.disabled =
            true;
    }


    if (topK) {

        topK.disabled =
            true;
    }
}


// ============================================
// CLEAR CHAT
// ============================================

function clearChat() {

    console.log(
        "Clearing previous chat..."
    );


    if (!chatContent) {
        return;
    }


    chatContent.innerHTML = `

        <div
            id="emptyState"
            class="empty-state"
        >

            <div class="empty-state-icon">
                💬
            </div>

            <h2>
                Document Ready
            </h2>

            <p>
                Your document has been processed.
                Ask a question about its content.
            </p>

        </div>

    `;


    // Clear retrieved chunks

    if (retrievedSection) {

        retrievedSection.classList.add(
            "hidden"
        );
    }


    if (sourcesContainer) {

        sourcesContainer.innerHTML =
            "";
    }


    if (retrievedCount) {

        retrievedCount.textContent =
            "0 relevant chunks";
    }
}


// ============================================
// SEND BUTTON
// ============================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        () => {

            askQuestion();
        }
    );
}


// ============================================
// ENTER KEY
// ============================================

if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                askQuestion();
            }
        }
    );
}


// ============================================
// ASK QUESTION
// ============================================

async function askQuestion() {

    if (isAsking) {
        return;
    }


    const question =
        questionInput.value.trim();


    // Validate question

    if (!question) {

        showToast(
            "Please enter a question.",
            "error"
        );

        return;
    }


    // Validate document

    if (!currentFile) {

        showToast(
            "Please upload a document first.",
            "error"
        );

        return;
    }


    isAsking = true;


    console.log(
        "Question:",
        question
    );


    // ------------------------------------
    // Add user message
    // ------------------------------------

    addMessage(
        question,
        "user"
    );


    // Clear input

    questionInput.value = "";

    autoResizeTextarea();


    // Disable send button

    sendButton.disabled =
        true;


    showLoading(
        "Searching your document..."
    );


    try {

        // ------------------------------------
        // Top K
        // ------------------------------------

        let k =
            parseInt(
                topK.value
            );


        if (
            isNaN(k) ||
            k < 1
        ) {

            k = 3;
        }


        // ------------------------------------
        // Request body
        // ------------------------------------

        const requestBody = {

            question: question,

            top_k: k
        };


        console.log(
            "Sending question:",
            requestBody
        );


        // ------------------------------------
        // Send request
        // ------------------------------------

        const response =
            await fetch(
                `${API_BASE_URL}/ask`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        console.log(
            "Ask response status:",
            response.status
        );


        // ------------------------------------
        // Read response
        // ------------------------------------

        const data =
            await response.json();


        console.log(
            "Ask response:",
            data
        );


        // ------------------------------------
        // Handle error
        // ------------------------------------

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to generate answer."
            );
        }


        // ------------------------------------
        // Get answer
        // ------------------------------------

        const answer =
            data.answer ||
            data.response ||
            data.result ||
            "No answer was returned by the AI.";


        // ------------------------------------
        // Display answer
        // ------------------------------------

        addMessage(
            answer,
            "assistant"
        );


        // ------------------------------------
        // Display retrieved chunks
        // ------------------------------------

        const documents =
            data.documents ||
            data.retrieved_documents ||
            data.sources ||
            data.context ||
            [];


        if (
            Array.isArray(documents) &&
            documents.length > 0
        ) {

            displayRetrievedDocuments(
                documents
            );

        } else {

            hideRetrievedDocuments();
        }


    } catch (error) {

        console.error(
            "Question error:",
            error
        );


        addMessage(
            `Error: ${error.message}`,
            "assistant"
        );


        showToast(
            error.message ||
            "Something went wrong.",
            "error"
        );


    } finally {

        isAsking = false;

        sendButton.disabled =
            false;

        hideLoading();


        questionInput.focus();
    }
}


// ============================================
// ADD MESSAGE
// ============================================

function addMessage(
    text,
    type
) {

    if (!chatContent) {
        return;
    }


    // Remove empty state

    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (emptyState) {

        emptyState.remove();
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        `message ${type}-message`;


    const label =
        type === "user"
            ? "You"
            : "AI Assistant";


    const avatar =
        type === "user"
            ? "👤"
            : "🤖";


    message.innerHTML = `

        <div class="message-label">

            <div class="message-avatar">
                ${avatar}
            </div>

            <span>
                ${label}
            </span>

        </div>

        <div class="message-body">
            ${formatText(text)}
        </div>

    `;


    chatContent.appendChild(
        message
    );


    // Scroll chat to bottom

    chatContent.scrollTop =
        chatContent.scrollHeight;
}


// ============================================
// DISPLAY RETRIEVED DOCUMENTS
// ============================================

function displayRetrievedDocuments(
    documents
) {

    if (
        !retrievedSection ||
        !sourcesContainer
    ) {
        return;
    }


    retrievedSection.classList.remove(
        "hidden"
    );


    if (retrievedCount) {

        retrievedCount.textContent =
            `${documents.length} relevant chunks`;
    }


    sourcesContainer.innerHTML = "";


    documents.forEach(
        (doc, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "source-card";


            let content = "";

            let page = "";


            // --------------------------------
            // Handle LangChain Document
            // --------------------------------

            if (
                typeof doc === "string"
            ) {

                content =
                    doc;

            } else {

                content =
                    doc.page_content ||
                    doc.content ||
                    doc.text ||
                    "";


                if (doc.metadata) {

                    if (
                        doc.metadata.page !==
                        undefined
                    ) {

                        page =
                            `Page ${
                                doc.metadata.page + 1
                            }`;
                    }
                }
            }


            card.innerHTML = `

                <div class="source-header">

                    <span class="source-title">
                        Chunk ${index + 1}
                    </span>

                    <span class="source-page">
                        ${escapeHtml(page)}
                    </span>

                </div>

                <div class="source-content">
                    ${escapeHtml(content)}
                </div>

            `;


            sourcesContainer.appendChild(
                card
            );
        }
    );
}


// ============================================
// HIDE RETRIEVED DOCUMENTS
// ============================================

function hideRetrievedDocuments() {

    if (retrievedSection) {

        retrievedSection.classList.add(
            "hidden"
        );
    }


    if (sourcesContainer) {

        sourcesContainer.innerHTML =
            "";
    }


    if (retrievedCount) {

        retrievedCount.textContent =
            "0 relevant chunks";
    }
}


// ============================================
// COLLAPSE RETRIEVED CHUNKS
// ============================================

if (collapseSources) {

    collapseSources.addEventListener(
        "click",
        () => {

            if (
                sourcesContainer.style.display ===
                "none"
            ) {

                sourcesContainer.style.display =
                    "block";

                collapseSources.textContent =
                    "−";

            } else {

                sourcesContainer.style.display =
                    "none";

                collapseSources.textContent =
                    "+";
            }
        }
    );
}


// ============================================
// SUGGESTION BUTTONS
// ============================================

document.addEventListener(
    "click",
    (event) => {

        const suggestion =
            event.target.closest(
                ".suggestion"
            );


        if (!suggestion) {
            return;
        }


        const question =
            suggestion.dataset.question ||
            suggestion.textContent.trim();


        if (!currentFile) {

            showToast(
                "Please upload a document first.",
                "error"
            );

            return;
        }


        questionInput.value =
            question;


        askQuestion();
    }
);


// ============================================
// TEXTAREA AUTO RESIZE
// ============================================

if (questionInput) {

    questionInput.addEventListener(
        "input",
        autoResizeTextarea
    );
}


function autoResizeTextarea() {

    if (!questionInput) {
        return;
    }


    questionInput.style.height =
        "auto";


    questionInput.style.height =
        Math.min(
            questionInput.scrollHeight,
            130
        ) + "px";
}


// ============================================
// LOADING
// ============================================

function showLoading(
    message
) {

    if (!loadingOverlay) {
        return;
    }


    if (loadingText) {

        loadingText.textContent =
            message;
    }


    loadingOverlay.classList.remove(
        "hidden"
    );
}


function hideLoading() {

    if (!loadingOverlay) {
        return;
    }


    loadingOverlay.classList.add(
        "hidden"
    );
}


// ============================================
// TOAST
// ============================================

function showToast(
    message,
    type = "success"
) {

    if (
        !toast ||
        !toastMessage
    ) {
        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.remove(
        "hidden"
    );


    if (type === "error") {

        toast.style.borderColor =
            "rgba(239, 68, 68, 0.4)";

    } else {

        toast.style.borderColor =
            "rgba(34, 197, 94, 0.4)";
    }


    setTimeout(
        () => {

            toast.classList.add(
                "hidden"
            );

        },
        3500
    );
}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;
}


// ============================================
// FORMAT TEXT
// ============================================

function formatText(
    text
) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";
    }


    let formatted =
        escapeHtml(text);


    // Convert new lines to <br>

    formatted =
        formatted.replace(
            /\n/g,
            "<br>"
        );


    return formatted;
}