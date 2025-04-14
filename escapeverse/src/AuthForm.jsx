import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously, // <-- Add this
} from "firebase/auth";
import googleLogo from "./assets/google.webp";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      alert("Success!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Logged in with Google!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuestAuth = async () => {
    try {
      await signInAnonymously(auth);
      alert("You’re now logged in as a Guest!");
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
