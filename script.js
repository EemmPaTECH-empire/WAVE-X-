// LOGIN
function login() {
    const name = document.getElementById("username").value;
    const pass = document.getElementById("passcode").value;
    const pattern = /^[A-Za-z0-9]+$/;

    if (!name || !pass) {
        alert("Please fill all fields.");
        return;
    }

    if (!pattern.test(pass)) {
        alert("Passcode must contain letters & numbers only.");
        return;
    }

    localStorage.setItem("waveXUser", name);
    window.location.href = "connect.html";
}


// DASHBOARD LOAD
window.onload = function () {

    const user = localStorage.getItem("waveXUser");

    if (user) {
        const el = document.getElementById("user-name");
        if (el) el.innerText = user;
    }

    // If on chat page start listener
    if (document.getElementById("messages")) {
        initChatListener();
    }

};


// SELECT CONTACT
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


// PROCEED CONNECTION
function proceedConnection(type, name) {

    const user = localStorage.getItem("waveXUser") || "Anonymous";

    const secretLink =
    `https://eemmpatech-empire.github.io/WAVE-X-/submit-email.html?user=${encodeURIComponent(user)}&contact=${encodeURIComponent(name)}`;

    const message =
`Hello ${name},
Someone wants to connect privately with you via WAVE X 🌊.

Submit your email using this link to start a private conversation:
${secretLink}`;

    if (type === "whatsapp") {

        window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
        );

    } else if (type === "email") {

        window.location.href =
        `mailto:?subject=Connect via WAVE X 🌊&body=${encodeURIComponent(message)}`;

    } else if (type === "phone") {

        alert(`Send this message to ${name} via SMS:\n\n${message}`);

    }

}


// SUBMIT EMAIL
function submitEmail() {

    const email = document.getElementById("user-email").value.trim();

    if (!email) {
        alert("Enter your email.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);

    const sender =
    urlParams.get("user") ||
    localStorage.getItem("waveXUser") ||
    "Anonymous";

    const contact =
    urlParams.get("contact") ||
    "Unknown";


    db.collection("emails").add({

        sender: sender,
        contact: contact,
        email: email,
        timestamp: new Date()

    })
    .then(() => {

        alert("Email submitted! Redirecting to secret conversation...");

        window.location.href =
        `secret-box.html?user=${encodeURIComponent(sender)}`;

    })
    .catch(err => {

        console.error(err);

        alert("Error saving email.");

    });

}


// CHAT SYSTEM
const chatRef = db.collection("messages");

let user =
localStorage.getItem("waveXUser") || "Anonymous";


// INIT CHAT LISTENER
function initChatListener() {

    const messagesContainer =
    document.getElementById("messages");

    const urlParams = new URLSearchParams(window.location.search);

    user =
    urlParams.get("user") ||
    localStorage.getItem("waveXUser") ||
    "Anonymous";

    chatRef
    .orderBy("timestamp")
    .onSnapshot(snapshot => {

        messagesContainer.innerHTML = "";

        snapshot.forEach(doc => {

            const data = doc.data();

            const div = document.createElement("div");

            div.className =
            "message " +
            (data.sender === user ? "sent" : "received");

            div.innerText =
            `${data.sender}: ${data.text}`;

            messagesContainer.appendChild(div);

        });

        messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

    });

}


// SEND MESSAGE
function sendMessage() {

    const input =
    document.getElementById("messageInput");

    const text = input.value.trim();

    if (!text) return;

    chatRef.add({

        text: text,
        sender: user,
        timestamp: Date.now(),
        read: false

    });

    input.value = "";

}
