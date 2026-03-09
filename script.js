
// ======================
// Firebase Initialization
// ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCh0t_yRYsMUyNbgTFofibsJKEQz-bHIqE",
  authDomain: "wavex-chat.firebaseapp.com",
  projectId: "wavex-chat",
  storageBucket: "wavex-chat.firebasestorage.app",
  messagingSenderId: "674774241938",
  appId: "1:674774241938:web:60dcecf424dd6d154dcc4b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ======================
// LOGIN / SIGNUP (INDEX)
// ======================
function login() {
  const emailInput = document.getElementById("username").value;
  const passInput = document.getElementById("passcode").value;

  if (!emailInput || !passInput) {
    alert("Please fill all fields.");
    return;
  }

  const pattern = /^[A-Za-z0-9]+$/;
  if (!pattern.test(passInput)) {
    alert("Passcode must contain letters & numbers only.");
    return;
  }

  // Firebase Auth: Try sign in, if fails, create user
  signInWithEmailAndPassword(auth, emailInput + "@wavex.com", passInput)
    .then(userCredential => {
      localStorage.setItem("waveXUser", userCredential.user.uid);
      window.location.href = "connect.html";
    })
    .catch(error => {
      // User not found → create account
      createUserWithEmailAndPassword(auth, emailInput + "@wavex.com", passInput)
        .then(userCredential => {
          localStorage.setItem("waveXUser", userCredential.user.uid);
          window.location.href = "connect.html";
        })
        .catch(err => alert(err.message));
    });
}

// ======================
// DASHBOARD / CONNECT PAGE
// ======================
window.onload = function () {
  const userName = localStorage.getItem("waveXUser");
  if (userName) {
    const el = document.getElementById("user-name");
    if (el) el.innerText = userName;
  }
};

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

function proceedConnection(type, contactName) {
  const userId = localStorage.getItem("waveXUser");
  const link = `${window.location.origin}/submit-email.html?user=${encodeURIComponent(contactName)}&senderId=${userId}`;
  const message = `Hello ${contactName},\nSomeone wants to connect privately via WAVE X 🌊.\nClick here to start the conversation: ${link}`;

  if (type === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  } else if (type === "email") {
    window.location.href = `mailto:?subject=Connect via WAVE X 🌊&body=${encodeURIComponent(message)}`;
  } else if (type === "phone") {
    alert(`Send this message to ${contactName} via SMS:\n\n${message}`);
  }
}

// ======================
// SUBMIT EMAIL PAGE
// ======================
async function submitEmail() {
  const emailInput = document.getElementById("user-email").value;
  const senderId = new URLSearchParams(window.location.search).get("senderId");

  if (!emailInput) {
    alert("Enter your email.");
    return;
  }

  try {
    await addDoc(collection(db, "emails"), {
      email: emailInput,
      userId: auth.currentUser.uid,
      senderId: senderId,
      timestamp: new Date()
    });
    alert("Email submitted!");
    window.location.href = `secret-box.html?conversation=${senderId}-${auth.currentUser.uid}`;
  } catch (err) {
    console.error(err);
    alert("Error submitting email.");
  }
}

// ======================
// SECRET CHAT BOX
// ======================
const messagesContainer = document.getElementById("messages");
const conversationId = new URLSearchParams(window.location.search).get("conversation");

async function sendMessage() {
  const input = document.getElementById("chat-message");
  const text = input.value.trim();
  if (!text) return;

  try {
    await addDoc(collection(db, "messages"), {
      senderId: auth.currentUser.uid,
      receiverId: conversationId.replace(auth.currentUser.uid, "").replace("-", ""),
      conversationId: conversationId,
      text: text,
      timestamp: new Date()
    });
    input.value = "";
  } catch (err) {
    console.error(err);
  }
}

// Real-time listener
if (messagesContainer && conversationId) {
  const q = query(collection(db, "messages"), where("conversationId", "==", conversationId), orderBy("timestamp"));
  onSnapshot(q, snapshot => {
    messagesContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "message " + (data.senderId === auth.currentUser.uid ? "sent" : "received");
      div.innerText = data.text;
      messagesContainer.appendChild(div);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  });
}

