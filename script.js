

// ==========================
// LOGIN
// ==========================

function login(){

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



// ==========================
// PAGE LOAD
// ==========================

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

// ==========================
// FIREBASE
// ==========================

const db = firebase.firestore();



// ==========================
// ENABLE NOTIFICATIONS
// ==========================

if ("Notification" in window) {

Notification.requestPermission().then(permission => {

if(permission === "granted"){
console.log("Notifications enabled");
}

});

}



// ==========================
// CONTACT SELECTION
// ==========================

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



// ==========================
// CREATE PRIVATE ROOM
// ==========================

function proceedConnection(type,name){

const user = localStorage.getItem("waveXUser") || "Anonymous";

const roomId = crypto.randomUUID();

const secretLink =
`https://eemmpatech-empire.github.io/WAVE-X-/submit-email.html?room=${roomId}&user=${encodeURIComponent(user)}&contact=${encodeURIComponent(name)}`;

const message =
`Hello ${name},
Someone wants to connect privately with you via WAVE X 🌊.

Open this link to start the private conversation:
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

// sender automatically enters chat
window.location.href=`secret-box.html?room=${roomId}&user=${encodeURIComponent(user)}`;

}



// ==========================
// SUBMIT EMAIL
// ==========================

function submitEmail(){

const email = document.getElementById("user-email").value.trim();

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

window.location.href =
`secret-box.html?room=${room}&user=${encodeURIComponent(email)}`;

})
.catch(err=>{
console.error(err);
alert("Error saving email.");
});

}



// ==========================
// CHAT SYSTEM
// ==========================

const urlParams = new URLSearchParams(window.location.search);

const roomId = urlParams.get("room");

let currentUser;

const linkUser = urlParams.get("user");

if(linkUser){
currentUser = linkUser;
}else{
currentUser = localStorage.getItem("waveXUser") || "Anonymous";
}

let messagesRef;

if(roomId){

messagesRef =
db.collection("rooms")
.doc(roomId)
.collection("messages");

}



// ==========================
// REALTIME CHAT LISTENER
// ==========================

function initChatListener(){

const container = document.getElementById("messages");

messagesRef
.orderBy("timestamp")
.onSnapshot(snapshot=>{

container.innerHTML="";

snapshot.forEach(doc=>{

const msg = doc.data();

const div = document.createElement("div");

div.className =
"message " +
(msg.sender===currentUser ? "sent":"received");

let content = `<b>${msg.sender}</b><br>`;

// TEXT
if(msg.text){
content += msg.text + "<br>";
}

// IMAGE
if(msg.image){
content += `<img src="${msg.image}" style="max-width:200px;border-radius:10px;"><br>`;
}

// VOICE
if(msg.voice){
content += `<audio controls src="${msg.voice}"></audio><br>`;
}

// TIMESTAMP
if(msg.timestamp){

const time = new Date(msg.timestamp);

const timeString = time.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

content += `<span style="font-size:11px;opacity:0.6">${timeString}</span>`;

}

div.innerHTML = content;

container.appendChild(div);

});

container.scrollTop = container.scrollHeight;

});

}



// ==========================
// SEND MESSAGE
// ==========================

function sendMessage(){

const input = document.getElementById("chat-message");

const text = input.value.trim();

if(!text) return;

messagesRef.add({

text:text,
sender:currentUser,
timestamp:Date.now()

});

// browser notification
if(Notification.permission === "granted"){

new Notification("WAVE X 🌊",{
body: currentUser + ": " + text
});

}

input.value="";

}



// ==========================
// IMAGE UPLOAD
// ==========================

function uploadImage(){

const fileInput = document.createElement("input");

fileInput.type="file";

fileInput.accept="image/*";

fileInput.onchange = function(e){

const file = e.target.files[0];

const reader = new FileReader();

reader.onload=function(){

messagesRef.add({

image:reader.result,
sender:currentUser,
timestamp:Date.now()

});

};

reader.readAsDataURL(file);

};

fileInput.click();

}



// ==========================
// VOICE MESSAGE
// ==========================

let recorder;
let audioChunks=[];

function recordVoice(){

navigator.mediaDevices.getUserMedia({audio:true})
.then(stream=>{

recorder = new MediaRecorder(stream);

recorder.start();

audioChunks=[];

alert("Recording voice...");

recorder.ondataavailable=e=>{
audioChunks.push(e.data);
};

setTimeout(()=>{

recorder.stop();

},5000);

recorder.onstop=()=>{

const blob = new Blob(audioChunks,{type:"audio/webm"});

const reader = new FileReader();

reader.onload=()=>{

messagesRef.add({

voice:reader.result,
sender:currentUser,
timestamp:Date.now()

});

};

reader.readAsDataURL(blob);

};

});

}



// ==========================
// EMOJI SUPPORT
// ==========================

function addEmoji(emoji){

const input = document.getElementById("chat-message");

input.value += emoji;

}



// ==========================
// TEMPORARY SECRET CHAT
// ==========================

if(roomId){

setTimeout(()=>{

db.collection("rooms").doc(roomId).delete();

},86400000); // 98 hours

}