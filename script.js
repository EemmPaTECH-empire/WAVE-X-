// ====== LOGIN ======
function login() {
  const name = document.getElementById("username").value;
  const pass = document.getElementById("passcode").value;
  const pattern = /^[A-Za-z0-9]+$/;

  if (!name || !pass) { alert("Please fill all fields."); return; }
  if (!pattern.test(pass)) { alert("Passcode must contain letters & numbers only."); return; }

  // Save user and generate a unique sessionId
  const sessionId = 'session-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  localStorage.setItem("waveXUser", name);
  localStorage.setItem("waveXSession", sessionId);

  window.location.href = "connect.html";
}

// ====== DASHBOARD LOAD ======
window.onload = function() {
  const user = localStorage.getItem("waveXUser");
  if (user) {
    const el = document.getElementById("user-name");
    if (el) el.innerText = user;
  }
};

// ====== SELECT CONTACT ======
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

// ====== PROCEED CONNECTION ======
function proceedConnection(type, name) {
  const sessionId = localStorage.getItem("waveXSession");
  const user = localStorage.getItem("waveXUser") || "Anonymous";

  // Create a session-specific link to submit email (secret conversation)
  const secretLink = `${window.location.origin}/submit-email.html?sessionId=${sessionId}&user=${encodeURIComponent(user)}`;

  const message = `Hello,\nSomeone wants to connect privately via WAVE X 🌊.\nPlease submit your email using this link to start a private conversation:\n${secretLink}`;

  if (type === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  } else if (type === "email") {
    window.location.href = `mailto:?subject=Connect via WAVE X 🌊&body=${encodeURIComponent(message)}`;
  } else if (type === "phone") {
    alert(`Send this message to ${name} via SMS:\n\n${message}`);
  }
}

// ====== SUBMIT EMAIL ======
function submitEmail() {
  const email = document.getElementById("user-email").value;
  if (!email) { alert("Enter your email."); return; }

  const sessionId = new URLSearchParams(window.location.search).get("sessionId");
  const user = new URLSearchParams(window.location.search).get("user");

  db.collection("emails").add({
    email: email,
    sessionId: sessionId,
    userName: user,
    timestamp: new Date()
  })
    .then(() => { 
      alert("Email submitted!"); 
      window.location.href = `secret-box.html?sessionId=${sessionId}&user=${encodeURIComponent(user)}`; 
    })
    .catch(err => { console.error(err); alert("Error saving email."); });
}

// ====== CHAT FUNCTIONS ======
function sendMessage() {
  const input = document.getElementById("chat-message");
  const text = input.value.trim();
  if (!text) return;

  const sessionId = new URLSearchParams(window.location.search).get("sessionId");
  const user = localStorage.getItem("waveXUser") || "Anonymous";

  db.collection("messages").add({
    sender: user,
    text: text,
    sessionId: sessionId,
    timestamp: new Date()
  });

  input.value = "";
}

// Listen for chat messages in real-time
if (document.getElementById("messages")) {
  const sessionId = new URLSearchParams(window.location.search).get("sessionId");

  db.collection("messages")
    .where("sessionId", "==", sessionId)
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      const container = document.getElementById("messages");
      container.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "message " + ((data.sender === localStorage.getItem("waveXUser")) ? "sent" : "received");
        div.innerText = data.text;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
      });
    });
}

