// connect.html proceedConnection
function proceedConnection() {
    const sender = localStorage.getItem("waveXUser") || "Someone";
    const name = document.getElementById("contact-name").value;
    const type = document.getElementById("contact-type").value;

    const link = `${window.location.origin}/submit-email.html?user=${encodeURIComponent(sender)}`;
    const message = `Hello,\n${sender} wants to connect privately.\nSubmit your email here: ${link}`;

    if(type === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    else if(type === "email") window.location.href = `mailto:?subject=Connect via WAVE X 🌊&body=${encodeURIComponent(message)}`;
    else alert(`Send this manually to ${name}:\n\n${message}`);
}

// submit-email.html submitEmail
function submitEmail() {
    const email = document.getElementById("contact-email").value;
    const params = new URLSearchParams(window.location.search);
    const sender = params.get("user") || "Someone";
    if(!email) { alert("Enter email!"); return; }

    const db = firebase.firestore();
    db.collection("connections").add({sender: sender, email: email, timestamp: Date.now()})
      .then(() => {
          document.getElementById("confirmation").innerHTML = `Thank you! Redirecting to chat...`;
          setTimeout(() => { window.location.href = `secret-box.html?user=${encodeURIComponent(sender)}`; }, 2000);
      });
}

// secret-box.html real-time chat
window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const sender = params.get("user") || "Someone";
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
};

function sendMessage() {
    const msg = document.getElementById("chat-message").value;
    if(!msg) return;
    const sender = localStorage.getItem("waveXUser") || "Someone";
    const params = new URLSearchParams(window.location.search);
    const conversationWith = params.get("user");

    const db = firebase.firestore();
    db.collection("messages").add({
        sender, conversationWith, content: msg, timestamp: Date.now()
    });
    document.getElementById("chat-message").value = "";
}