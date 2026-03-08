// Display logged in user
document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("waveXUser") || "User";
    const userNameSpan = document.getElementById("user-name");
    if(userNameSpan) userNameSpan.textContent = user;

    // Initialize chat if chat box exists
    const chatBox = document.getElementById("chat-box");
    if(chatBox) initChat();
});

// Connect page contact selection
function selectContact(type) {
    const selectionDiv = document.getElementById("contact-selection");
    selectionDiv.innerHTML = ""; // Clear previous content
    const user = localStorage.getItem("waveXUser") || "User";
    let html = `
        <p>You selected <strong>${type.toUpperCase()}</strong>.</p>
        <input type="text" id="contact-name" placeholder="Enter contact name">
        <button onclick="proceedConnection('${type}')">Proceed</button>
    `;
    selectionDiv.innerHTML = html;
}

// Proceed button logic
function proceedConnection(type) {
    const sender = localStorage.getItem("waveXUser") || "User";
    const nameInput = document.getElementById("contact-name");
    if(!nameInput || !nameInput.value) { alert("Enter contact name!"); return; }
    const name = nameInput.value;

    const link = `${window.location.origin}/submit-email.html?user=${encodeURIComponent(sender)}`;
    const message = `Hello,\n${sender} wants to connect privately with you through WAVE X 🌊.\nSubmit your email here: ${link}`;

    if(type === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    else if(type === "email") window.location.href = `mailto:?subject=Connect via WAVE X 🌊&body=${encodeURIComponent(message)}`;
    else alert(`Send this manually to ${name}:\n\n${message}`);
}

// Submit email page
function submitEmail() {
    const email = document.getElementById("contact-email").value;
    const params = new URLSearchParams(window.location.search);
    const sender = params.get("user") || "User";
    if(!email) { alert("Enter email!"); return; }

    const db = firebase.firestore();
    db.collection("connections").add({
        sender: sender,
        email: email,
        timestamp: Date.now()
    }).then(() => {
        document.getElementById("confirmation").innerText = "Thank you! Redirecting to chat...";
        setTimeout(() => {
            window.location.href = `secret-box.html?user=${encodeURIComponent(sender)}`;
        }, 2000);
    });
}

// Chat box initialization
function initChat() {
    const params = new URLSearchParams(window.location.search);
    const sender = params.get("user") || "User";
    document.getElementById("chat-header").innerText = `Secret Conversation with ${sender}`;

    const db = firebase.firestore();
    const chatBox = document.getElementById("chat-box");

    db.collection("messages")
      .where("conversationWith","==",sender)
      .orderBy("timestamp")
      .onSnapshot(snapshot => {
        chatBox.innerHTML = "";
        snapshot.forEach(doc => {
            const msg = doc.data();
            const div = document.createElement("div");
            div.className = msg.sender===localStorage.getItem("waveXUser")?"msg sender":"msg recipient";
            div.innerText = msg.content;
            chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
      });
}

// Send chat message
function sendMessage() {
    const msgInput = document.getElementById("chat-message");
    if(!msgInput.value) return;
    const msg = msgInput.value;
    const sender = localStorage.getItem("waveXUser") || "User";
    const params = new URLSearchParams(window.location.search);
    const conversationWith = params.get("user");

    const db = firebase.firestore();
    db.collection("messages").add({
        sender, conversationWith, content: msg, timestamp: Date.now()
    });
    msgInput.value = "";
}

// Placeholder functions for media/audio
function uploadMedia(){ alert("Media upload coming soon!"); }
function recordAudio(){ alert("Audio recording coming soon!"); }