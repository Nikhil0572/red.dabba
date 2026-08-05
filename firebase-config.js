// ============================================================
// YAHAN APNI FIREBASE PROJECT KI DETAILS DAALEIN
// (Firebase Console > Project Settings > General > Your apps > SDK setup)
// README.md mein poora tarika likha hai
// ============================================================

const firebaseConfig = {
  apiKey: "YAHAN_APNI_API_KEY_DAALO",
  authDomain: "YAHAN_APNA_PROJECT.firebaseapp.com",
  projectId: "YAHAN_APNA_PROJECT_ID",
  storageBucket: "YAHAN_APNA_PROJECT.appspot.com",
  messagingSenderId: "YAHAN_APNA_SENDER_ID",
  appId: "YAHAN_APNI_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
