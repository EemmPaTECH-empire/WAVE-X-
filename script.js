// FIREBASE
const db = firebase.firestore();
const storage = firebase.storage ? firebase.storage() : null;


// USER + ROOM DETECTION
const urlParams = new URLSearchParams(window.location.search);

let roomId = urlParams.get("room");
let currentUser =
urlParams.get("user") ||
localStorage.getItem("waveXUser") ||
localStorage.getItem("wavex_user") ||
"Anonymous";

if(roomId){
localStorage.setItem("activeRoom", roomId);
}

roomId = roomId || localStorage.getItem("activeRoom");

const chatRef = db.collection("rooms").doc(roomId).collection("messages");


// LOGIN
function login(){

const name = document.getElementById("username").value;

const pass = document.getElementById("passcode").value;

const pattern = /^[A-Za-z0-9]+$/;

if(!name || !pass){

alert("Please fill all fields.");

return;

}

if(!pattern.test(pass)){

alert("Passcode must contain letters and numbers only.");

return;

}

localStorage.setItem("waveXUser", name);

window.location.href="connect.html";

}



// SELECT CONTACT
function selectContact(type){

const contactName = prompt(`Enter the name of the ${type} contact:`);

if(!contactName) return;

const div = document.getElementById("contact-selection");

div.innerHTML=`

<p>You selected: <strong>${contactName}</strong></p>

<p>Do you wish to connect with <strong>${contactName}</strong>?</p>

<button onclick="cancelSelection()">Cancel</button>

<button onclick="proceedConnection('${type}','${contactName}')">Proceed</button>

`;

}

function cancelSelection(){

document.getElementById("contact-selection").innerHTML="";

}



// PROCEED CONNECTION
function proceedConnection(type,name){

const user = localStorage.getItem("waveXUser") || "Anonymous";

roomId = "room_"+Date.now();

const secretLink =
`https://eemmpatech-empire.github.io/WAVE-X-/submit-email.html?room=${roomId}&user=${encodeURIComponent(user)}&contact=${encodeURIComponent(name)}`;

const message = `Hello ${name},
Someone wants to connect privately with you via WAVE X 🌊.
Click this secure link to join the conversation:
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

// sender enters chat too
window.location.href=`secret-box.html?room=${roomId}&user=${encodeURIComponent(user)}`;

}



// SUBMIT EMAIL
function submitEmail(){

const email = document.getElementById("user-email").value.trim();

if(!email){

alert("Enter your email");

return;

}

const params = new URLSearchParams(window.location.search);

const room = params.get("room");

localStorage.setItem("wavex_user",email);

window.location.href=`secret-box.html?room=${room}&user=${encodeURIComponent(email)}`;

}



// INIT CHAT
function initChatListener(){

if(!roomId) return;

const messagesContainer = document.getElementById("messages");

chatRef.orderBy("timestamp")

.onSnapshot(snapshot=>{

messagesContainer.innerHTML="";

snapshot.forEach(doc=>{

const msg = doc.data();

const div = document.createElement("div");

div.className="message "+(msg.sender===currentUser?"sent":"received");

let content="";


// TEXT MESSAGE
if(msg.text){

content+=`<div>${msg.text}</div>`;

}


// IMAGE
if(msg.image){

content+=`<img src="${msg.image}" style="max-width:200px;border-radius:8px;">`;

}


// AUDIO
if(msg.audio){

content+=`
<audio controls>
<source src="${msg.audio}">
</audio>
`;

}


// TIMESTAMP
const time = new Date(msg.timestamp);

const timeString =
time.toLocaleTimeString([],{
hour:'2-digit',
minute:'2-digit'
});

content+=`<div style="font-size:10px;opacity:0.7">${timeString}</div>`;


div.innerHTML=`<b>${msg.sender}</b><br>${content}`;

messagesContainer.appendChild(div);

});

messagesContainer.scrollTop = messagesContainer.scrollHeight;

});

}



// SEND MESSAGE
function sendMessage(){

const input=document.getElementById("chat-message");

const text=input.value.trim();

if(!text) return;

chatRef.add({

text:text,

sender:currentUser,

timestamp:Date.now(),

seen:false

});

input.value="";

}



// IMAGE UPLOAD
function uploadImage(){

const input=document.createElement("input");

input.type="file";

input.accept="image/*";

input.onchange=e=>{

const file=e.target.files[0];

const reader=new FileReader();

reader.onload=function(){

chatRef.add({

image:reader.result,

sender:currentUser,

timestamp:Date.now()

});

};

reader.readAsDataURL(file);

};

input.click();

}



// VOICE RECORD
let recorder;

let audioChunks=[];

function recordVoice(){

navigator.mediaDevices.getUserMedia({audio:true})

.then(stream=>{

recorder=new MediaRecorder(stream);

recorder.start();

audioChunks=[];

recorder.ondataavailable=e=>{

audioChunks.push(e.data);

};

recorder.onstop=e=>{

const blob=new Blob(audioChunks);

const reader=new FileReader();

reader.onloadend=function(){

chatRef.add({

audio:reader.result,

sender:currentUser,

timestamp:Date.now()

});

};

reader.readAsDataURL(blob);

};

setTimeout(()=>{

recorder.stop();

},5000);

});

}



// PAGE LOAD
window.onload=function(){

if(document.getElementById("messages")){

initChatListener();

}

};
