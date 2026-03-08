// Homepage Login
function login() {
    let name = document.getElementById("username").value;
    let pass = document.getElementById("passcode").value;

    let pattern = /^[A-Za-z0-9]+$/;

    if (!name || !pass) {
        alert("Please fill in all fields.");
        return;
    }

    if (!pattern.test(pass)) {
        alert("Passcode must contain only letters and numbers.");
        return;
    }

    // Store username for dashboard
    localStorage.setItem("waveXUser", name);

    // Redirect to connect page
    window.location.href = "connect.html";
}

// Connection Dashboard
window.onload = function() {
    let user = localStorage.getItem("waveXUser");
    if (user) {
        const userSpan = document.getElementById("user-name");
        if (userSpan) userSpan.innerText = user;
    }
};

function selectContact(type) {
    let contactName = prompt(`Enter the name of the ${type} contact:`);

    if (!contactName) return;

    let contactDiv = document.getElementById("contact-selection");
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
    const sender = localStorage.getItem("waveXUser") || "Someone";
    const link = `https://eemmpatech-empire.github.io/submit-email.html?user=${encodeURIComponent(sender)}`;

    const message = `Hello,\n\n${sender} wants to connect privately with you through WAVE X 🌊.\n\nPlease submit your email using this link to start a private conversation:\n${link}`;

    if (type === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    } else if (type === "email") {
        window.location.href = `mailto:?subject=Connect via WAVE X 🌊&body=${encodeURIComponent(message)}`;
    } else if (type === "phone") {
        alert(`Send this message to ${name} via SMS:\n\n${message}`);
    }
}
