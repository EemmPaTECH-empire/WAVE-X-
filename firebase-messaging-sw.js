importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js");

firebase.initializeApp({
apiKey: "AIzaSyCh0t_yRYsMUyNbgTFofibsJKEQz-bHIqE",
authDomain: "wavex-chat.firebaseapp.com",
projectId: "wavex-chat",
messagingSenderId: "674774241938",
appId: "1:674774241938:web:60dcecf424dd6d154dcc4b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload){

self.registration.showNotification(payload.notification.title,{
body: payload.notification.body,
icon: "/icon.png"
});

});