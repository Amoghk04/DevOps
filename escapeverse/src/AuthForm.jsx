import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";
import googleLogo from "./assets/google.webp";
import { useNavigate } from 'react-router-dom';
import { socket } from './socket';

export default function AuthForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isLogin) {
        // Handle Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Emit login event with callback
        socket.emit("user-login", {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }, (response) => {
          if (response.success) {
            console.log("Server response:", response.message);
            navigate('/home');
          } else {
            setError(response.error);
          }
        });
      } else {
        // Handle Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Emit login event with callback
        socket.emit("user-login", {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: "New User"
        }, (response) => {
          alert(response.message);
          if (response.message === "User created successfully") {
            navigate('/create-profile');
          } else {
            navigate('/home');
          }
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      // Emit login event with callback
      socket.emit("user-login", {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      }, (response) => {
        if (response.message === "User created successfully") {
          navigate('/create-profile');
        } else {
          navigate('/home');
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuestAuth = async () => {
    try {
      const result = await signInAnonymously(auth);
      // Emit login event for guest users with callback
      socket.emit("user-login", {
        uid: result.user.uid,
        displayName: "Guest"
      }, (response) => {
        if (response.message === "User created successfully") {
          navigate('/create-profile');
        } else {
          navigate('/home');
        }
      });
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
        {isLogin ? "Login" : "Sign Up"}
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
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
      </p>
    </div>
  );
}
