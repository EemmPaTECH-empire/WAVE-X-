// ===============================
// LOGIN
// ===============================

function login() {

const name = document.getElementById("username").value;
const pass = document.getElementById("passcode").value;

const pattern = /^[A-Za-z0-9]+$/;

if(!name || !pass){
alert("Please fill all fields.");
return;
}

if(!pattern.test(pass)){
alert("Passcode must contain letters & numbers only.");
return;
}

localStorage.setItem("waveXUser",name);

window.location.href="connect.html";

}



// ===============================
// PAGE LOAD
// ===============================

window.onload = function(){

const user = localStorage.getItem("waveXUser");

if(user){

const el = document.getElementById("user-name");

if(el) el.innerText=user;

}

if(document.getElementById("messages")){
initChatListener();
}

}



// ===============================
// CONTACT SELECTION
// ===============================

function selectContact(type){

const contactName = prompt(`Enter the name of the ${type} contact:`);

if(!contactName) return;

const div = document.getElementById("contact-selection");

div.innerHTML = `
<p>You selected: <strong>${contactName}</strong></p>
<p>Do you wish to connect with <strong>${contactName}</strong>?</p>
<button onclick="cancelSelection()">Cancel</button>
<button onclick="proceedConnection('${type}','${contactName}')">Proceed</button>
`;

}


function cancelSelection(){
document.getElementById("contact-selection").innerHTML="";
}



// ===============================
// CREATE PRIVATE ROOM
// ===============================

function proceedConnection(type,name){

const user = localStorage.getItem("waveXUser") || "Anonymous";

const roomId =
Math.random().toString(36).substring(2,10);

const secretLink =
`https://eemmpatech-empire.github.io/WAVE-X-/submit-email.html?room=${roomId}&user=${encodeURIComponent(user)}&contact=${encodeURIComponent(name)}`;

const message =
`Hello ${name},
Someone wants to connect privately with you via WAVE X 🌊.

Open this secret link to start a private conversation:
${secretLink}`;

if(type==="whatsapp"){
window.open(`https://wa.me/?text=${encodeURIComponent(message)}`,"_blank");
}

else if(type==="email"){
window.location.href=`mailto:?subject=WAVE X Private Chat&body=${encodeURIComponent(message)}`;
}

else if(type==="phone"){
alert(`Send this message to ${name}:\n\n${message}`);
}

}



// ===============================
// SUBMIT EMAIL
// ===============================

function submitEmail(){

const email =
document.getElementById("user-email").value.trim();

if(!email){
alert("Enter your email.");
return;
}

const params = new URLSearchParams(window.location.search);

const room = params.get("room");

const sender =
params.get("user") ||
localStorage.getItem("waveXUser") ||
"Anonymous";

const contact = params.get("contact") || "Unknown";


db.collection("emails").add({

sender:sender,
contact:contact,
email:email,
timestamp:new Date()

})

.then(()=>{

alert("Email submitted! Redirecting to secret chat...");

window.location.href =
`secret-box.html?room=${room}&user=${encodeURIComponent(sender)}`;

})

.catch(err=>{

console.error(err);

alert("Error saving email.");

});

}



// ===============================
// CHAT SYSTEM
// ===============================

const urlParams = new URLSearchParams(window.location.search);

const roomId = urlParams.get("room");

let currentUser =
urlParams.get("user") ||
localStorage.getItem("waveXUser") ||
"Anonymous";

let messagesRef;

if(roomId){

messagesRef =
db.collection("rooms")
.doc(roomId)
.collection("messages");

}



// ===============================
// REALTIME CHAT LISTENER
// ===============================

function initChatListener(){

if(!roomId) return;

const container =
document.getElementById("messages");

messagesRef
.orderBy("timestamp")
.onSnapshot(snapshot=>{

container.innerHTML="";

snapshot.forEach(doc=>{

const msg = doc.data();

const div =
document.createElement("div");

div.className =
"message " +
(msg.sender===currentUser ? "sent":"received");

if(msg.text){

div.innerHTML =
`<b>${msg.sender}</b><br>${msg
}