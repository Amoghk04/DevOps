import { useEffect, useState } from 'react';
import './App.css';
import AuthForm from './AuthForm';
import { Sun, Moon } from 'lucide-react'; // Add this if using lucide-react icons

function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Toggle button */}
      <button
        onClick={() => setDark(!dark)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:scale-105 transition-transform"
        aria-label="Toggle Theme"
      >
        {dark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
      </button>

      {/* Auth card */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Welcome to Escapeverse
        </h1>
        <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-6">
          Please log in to continue to your account.
        </p>
        <AuthForm />
      </div>
    </div>
  );
}

export default App;
