
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWu8U-ZjXqAAGAkf-CFLCMcz2eLfgsciY",
  authDomain: "escape-verse.firebaseapp.com",
  projectId: "escape-verse",
  storageBucket: "escape-verse.firebasestorage.app",
  messagingSenderId: "989313795358",
  appId: "1:989313795358:web:2777c7c76f60b02495f50f",
  measurementId: "G-JHEFN7JTNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);