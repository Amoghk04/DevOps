import { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";
import googleLogo from "./assets/google.webp";
import { useNavigate } from 'react-router-dom';
import { socket } from './socket';
import config from './config';

const guestNames = [
  "Buttercup",
  "Supermario",
  "Princess Peach",
  "Kungfu Panda",
  "Blade Manja",
  "Ethan Hunt",
  "Dissapointment",
  "Baba Ramdev",
  "Phil Dunphy",
  "Carmey",
];

// Update the checkUserCredentials function
const checkUserCredentials = async (email) => {
  try {
    const response = await fetch(`${config.apiUrl}:3001/api/get-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking credentials:', error);
    return { exists: false, message: 'Error checking credentials' };
  }
};

export default function AuthForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // First check if user exists and get their details
      const userDetails = await checkUserCredentials(email);
      
      if (!userDetails || !userDetails.exists) {
        setError(userDetails?.message || "No account found with this email");
        return;
      }

      // Try to sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // If login successful, set the user details in localStorage
      localStorage.setItem("username", userDetails.username);
      localStorage.setItem("profileIndex", userDetails.profileIndex);

      // Emit login event
      socket.emit("user-login", {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userDetails.username,
        profileIndex: userDetails.profileIndex
      });

      navigate('/home');

    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setError("Incorrect password");
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email");
      } else {
        setError(err.message);
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in database
      const userDetails = await checkUserCredentials(result.user.email);
      
      if (userDetails && userDetails.exists) {
        // User exists in database, set their details to localStorage
        localStorage.setItem("username", userDetails.username);
        localStorage.setItem("profileIndex", userDetails.profileIndex);

        // Emit login event with full details
        socket.emit("user-login", {
          uid: result.user.uid,
          email: result.user.email,
          displayName: userDetails.username,
          profileIndex: userDetails.profileIndex
        });

        navigate('/home');
      } else {
        // New user, redirect to profile creation
        navigate('/create-profile');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuestAuth = async () => {
    try {
      // Generate random name and profile index
      const randomName = guestNames[Math.floor(Math.random() * guestNames.length)];
      const randomProfileIndex = Math.floor(Math.random() * 9); // 0-8

      // Set to localStorage
      localStorage.setItem("username", randomName);
      localStorage.setItem("profileIndex", randomProfileIndex.toString());

      const result = await signInAnonymously(auth);
      console.log("result", result);
      // Guest user is not added to the database
      // socket.emit("guest-login", {
      //   uid: result.user.uid,
      //   displayName: randomName,
      //   profileIndex: randomProfileIndex,
      //   isGuest: true
      // });

      // Navigate directly to home
      navigate('/home');
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 rounded-md bg-white text-black"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 rounded-md bg-white text-black"
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        onClick={handleAuth}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {"Sign Up"}
      </button>
      <div className="flex gap-4">
        <button
          onClick={handleGoogleAuth}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <img src={googleLogo} alt="Google" className="w-5 h-5" />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Sign in with Google
          </span>
        </button>

        <button
          onClick={handleGuestAuth}
          className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          Continue as Guest
        </button>
      </div>
      <p
        className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer underline text-center"
        onClick={() => navigate("/create-profile")}
      >
        {"Don't have an account? Sign Up"}
      </p>
    </div>
  );
}
