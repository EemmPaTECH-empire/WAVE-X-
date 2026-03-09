
// ===== LOGIN =====
function login() {
    const name = document.getElementById("username").value.trim();
    const pass = document.getElementById("passcode").value.trim();
    const pattern = /^[A-Za-z0-9]+$/;

    if (!name || !pass) { alert("Please fill all fields."); return; }
    if (!pattern.test(pass)) { alert("Passcode must contain letters & numbers only."); return; }

    localStorage.setItem("waveXUser", name);
    window.location.href = "connect.html";
}

// ===== DASHBOARD LOAD =====
window.onload = function() {
    const user = localStorage.getItem("waveXUser");
    if (user) {
        const el = document.getElementById("user-name");
        if (el) el.innerText = user;
    }
};

// ===== CONTACT SELECTION =====
function selectContact(type) {
    const contactName = prompt(`Enter the name of the ${type} contact:`);
    if (!contactName) return;

    const div = document.getElementById("contact-selection");
    div.innerHTML = `
        <p>You selected: <strong>${contactName}</strong></p>
        <p>Do you wish to connect with <strong>${contactName}</strong>?</p>
        <button onclick="cancelSelection()">Cancel</button>
        <button onclick="proceedConnection('${type}','${contactName}')">Proceed</button>
    `;
}

function cancelSelection() {
    document.getElementById("contact-selection").innerHTML = "";
}

function proceedConnection(type, name) {
    // Prepare the automated message link
    const link = `https://eemmpatech-empire.github.io/submit-email.html?user=${encodeURIComponent(localStorage.getItem("waveXUser"))}&contact=${encodeURIComponent(name)}`;
    const message = `Hello,\nSomeone wants to connect privately via WAVE X 🌊.\nSubmit your email here to start the conversation:\n${link}`;

    if (type === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } else if (type === "email") {
        window.location.href = `mailto:?subject=Connect via WAVE X 🌊&body=${encodeURIComponent(message)}`;
    } else if (type === "phone") {
        alert(`Send this message to ${name} via SMS:\n\n${message}`);
    }
}

// ===== SUBMIT EMAIL =====
function submitEmail() {
    const email = document.getElementById("user-email").value.trim();
    if (!email) { alert("Enter your email."); return; }

    // URL parameters from automated link
    const urlParams = new URLSearchParams(window.location.search);
    const sender = urlParams.get("user") || localStorage.getItem("waveXUser") || "Anonymous";
    const contact = urlParams.get("contact") || "Unknown";

    db.collection("emails").add({
        sender: sender,
        contact: contact,
        email: email,
        timestamp: new Date()
    })
    .then(() => {
        alert("Email submitted! Redirecting to secret conversation...");
        window.location.href = `secret-box.html?user=${encodeURIComponent(sender)}&contact=${encodeURIComponent(contact)}`;
    })
    .catch(err => {
        console.error(err);
        alert("Error saving email.");
    });
}

// ===== CHAT FUNCTIONS =====
function sendMessage() {
    const input = document.getElementById("chat-message");
    const text = input.value.trim();
    if (!text) return;

    // Identify the current user
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get("user") || localStorage.getItem("waveXUser") || "Anonymous";
    const contact = urlParams.get("contact") || "Unknown";

    // Save to Firebase Firestore under a conversation document
    db.collection("conversations")
      .doc(`${user}_${contact}`) // unique conversation ID per user-contact pair
      .collection("messages")
      .add({
          sender: user,
          text: text,
          timestamp: new Date()
      });

    input.value = "";
}

// Real-time listener for messages
if (document.getElementById("messages")) {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get("user") || localStorage.getItem("waveXUser") || "Anonymous";
    const contact = urlParams.get("contact") || "Unknown";

    db.collection("conversations")
      .doc(`${user}_${contact}`)
      .collection("messages")
      .orderBy("timestamp")
      .onSnapshot(snapshot => {
          const container = document.getElementById("messages");
          container.innerHTML = "";
          snapshot.forEach(doc => {
              const data = doc.data();
              const div = document.createElement("div");
              div.className = "message " + ((data.sender === user) ? "sent" : "received");
              div.innerText = data.text;
              container.appendChild(div);
              container.scrollTop = container.scrollHeight;
          });
      });
}