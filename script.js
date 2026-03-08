
// ---------------- Homepage Login ----------------
function login() {
    const name = document.getElementById("username").value.trim();
    const pass = document.getElementById("passcode").value.trim();
    const pattern = /^[A-Za-z0-9]+$/;

    if (!name || !pass) {
        alert("Please fill in all fields.");
        return;
    }

    if (!pattern.test(pass)) {
        alert("Passcode must contain only letters and numbers.");
        return;
    }

    // Store username to display in dashboard
    localStorage.setItem("waveXUser", name);

    // Redirect to connect page
    window.location.href = "connect.html";
}

// ---------------- Connect Page ----------------
window.onload = function() {
    const user = localStorage.getItem("waveXUser");
    if (user && document.getElementById("user-name")) {
        document.getElementById("user-name").innerText = user;
    }

    // If on secret-box page, initialize chat
    if (document.getElementById("chat-box")) {
        initChat();
    }
};

function selectContact(type) {
    const contactName = prompt(`Enter the name of the ${type} contact:`);
    if (!contactName) return;

    const contactDiv = document.getElementById("contact-selection");
    contactDiv.innerHTML = `
        <p>You selected: <strong>${contactName}</strong></p>
        <p>Do you wish to connect with <strong>${contactName}</strong>?</p>
        <button onclick="cancelSelection()">Cancel</button>
        <button onclick="proceedConnection('${type}', '${contactName}')">Proceed</button>
    `;
}

function cancelSelection() {
    document.getElementById("contact-selection").innerHTML = "";
}

function proceedConnection(type, name) {
    const sender = localStorage.getItem("waveXUser");
    const link = `${window.location.origin}/submit-email.html?user=${encodeURIComponent(sender)}`;
    const message = `Hello,\n${sender} wants to connect privately via WAVE X 🌊.\nPlease submit your email here: ${link}`;

    if (type === "whatsapp") {
        // Open WhatsApp link for the user to select contact
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } else if (type === "email") {
        window.location.href = `mailto:?subject=Connect via WAVE X 🌊&body=${encodeURIComponent(message)}`;
    } else if (type === "phone") {
        alert(`Send this message to ${name} via SMS:\n\n${message}`);
    }
}

// ---------------- Submit Email Page ----------------
function submitEmail() {
    const emailInput = document.getElementById("contact-email");
    const email = emailInput.value.trim();
    const params = new URLSearchParams(window.location.search);
    const sender = params.get("user") || "User";

    if (!email) {
        alert("Please enter your email to proceed.");
        return;
    }

    const db = firebase.firestore();

    // Store the email along with sender info
    db.collection("connections").add({
        sender: sender,
        recipientEmail: email,
        timestamp: Date.now()
    }).then(() => {
        alert("Email submitted successfully! Redirecting to your private chat...");
        // Redirect to secret chat page
        window.location.href = `secret-box.html?user=${encodeURIComponent(sender)}`;
    }).catch((error) => {
        console.error("Error submitting email: ", error);
        alert("An error occurred. Please try again.");
    });
}

// ---------------- Secret Chat ----------------
function initChat() {
    const params = new URLSearchParams(window.location.search);
    const conversationWith = params.get("user");
    document.getElementById("chat-header").innerText = `Secret Chat with ${conversationWith}`;

    const db = firebase.firestore();
    const chatBox = document.getElementById("chat-box");

    // Listen to messages in real time
    db.collection("messages")
      .where("conversationWith", "==", conversationWith)
      .orderBy("timestamp")
      .onSnapshot(snapshot => {
          chatBox.innerHTML = "";
          snapshot.forEach(doc => {
              const msg = doc.data();
              const div = document.createElement("div");
              div.className = msg.sender === localStorage.getItem("waveXUser") ? "msg sender" : "msg recipient";
              div.innerText = msg.content;
              chatBox.appendChild(div);
          });
          chatBox.scrollTop = chatBox.scrollHeight;
      });
}

// Send a chat message
function sendMessage() {
    const msgInput = document.getElementById("chat-message");
    if (!msgInput.value) return;

    const msg = msgInput.value.trim();
    const sender = localStorage.getItem("waveXUser");
    const params = new URLSearchParams(window.location.search);
    const conversationWith = params.get("user");

    const db = firebase.firestore();
    db.collection("messages").add({
        sender,
        conversationWith,
        content: msg,
        timestamp: Date.now()
    });
    msgInput.value = "";
}

// Placeholder functions for future features
function uploadMedia() { alert("Media feature coming soon."); }
function recordAudio() { alert("Audio feature coming soon."); }