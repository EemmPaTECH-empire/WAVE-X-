// Import the compat libraries for simpler integration
// No imports needed in this file when using <script> tags in HTML

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",           // Replace with your new API key
    authDomain: "wavex-chat.firebaseapp.com",
    projectId: "wavex-chat",
    storageBucket: "wavex-chat.appspot.com",
    messagingSenderId: "674774241938",
    appId: "1:674774241938:web:60dcecf424dd6d154dcc4b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore reference
const db = firebase.firestore();
