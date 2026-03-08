// LOGIN
function login(){
  const name=document.getElementById("username").value;
  const pass=document.getElementById("passcode").value;
  const pattern=/^[A-Za-z0-9]+$/;

  if(!name||!pass){ alert("Please fill all fields."); return;}
  if(!pattern.test(pass)){ alert("Passcode must contain letters & numbers only."); return;}

  localStorage.setItem("waveXUser",name);
  window.location.href="connect.html";
}

// DASHBOARD LOAD
window.onload=function(){
  const user=localStorage.getItem("waveXUser");
  if(user){
    const el=document.getElementById("user-name");
    if(el) el.innerText=user;
  }
};

// SELECT CONTACT
function selectContact(type){
  const contactName=prompt(`Enter the name of the ${type} contact:`);
  if(!contactName) return;

  const div=document.getElementById("contact-selection");
  div.innerHTML=`
    <p>You selected: <strong>${contactName}</strong></p>
    <p>Do you wish to connect with <strong>${contactName}</strong>?</p>
    <button onclick="cancelSelection()">Cancel</button>
    <button onclick="proceedConnection('${type}','${contactName}')">Proceed</button>
  `;
}

function cancelSelection(){ document.getElementById("contact-selection").innerHTML=""; }

function proceedConnection(type,name){
  const message=`Hello,\nSomeone wants to connect privately via WAVE X 🌊. Please submit your email using the link to start a conversation.`;

  if(type==="whatsapp"){ window.open(`https://wa.me/?text=${encodeURIComponent(message)}`,"_blank"); }
  else if(type==="email"){ window.location.href=`mailto:?subject=Connect via WAVE X 🌊&body=${encodeURIComponent(message)}`; }
  else if(type==="phone"){ alert(`Send this message to ${name} via SMS:\n\n${message}`); }
}

// SUBMIT EMAIL
function submitEmail(){
  const email=document.getElementById("user-email").value;
  if(!email){ alert("Enter email."); return; }
  db.collection("emails").add({email:email,timestamp:new Date()})
    .then(()=>{ alert("Email submitted!"); window.location.href="secret-box.html"; })
    .catch(err=>{ console.error(err); alert("Error saving email."); });
}

// CHAT FUNCTIONS (simple real-time listener)
function sendMessage(){
  const input=document.getElementById("chat-message");
  const text=input.value.trim();
  if(!text) return;

  const user=localStorage.getItem("waveXUser")||"Anonymous";

  db.collection("messages").add({
    sender:user,
    text:text,
    timestamp:new Date()
  });

  input.value="";
}

if(document.getElementById("messages")){
  db.collection("messages").orderBy("timestamp")
    .onSnapshot(snapshot=>{
      const container=document.getElementById("messages");
      container.innerHTML="";
      snapshot.forEach(doc=>{
        const data=doc.data();
        const div=document.createElement("div");
        div.className="message "+((data.sender===localStorage.getItem("waveXUser"))?"sent":"received");
        div.innerText=data.text;
        container.appendChild(div);
        container.scrollTop=container.scrollHeight;
      });
    });
}
