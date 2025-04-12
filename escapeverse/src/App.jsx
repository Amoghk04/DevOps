import { useEffect, useState } from 'react';
import './App.css';
import AuthForm from './AuthForm';

function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <div className="text-center space-y-6 p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900 max-w-md w-full transform transition-all duration-300 hover:scale-105">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Welcome to Escapeverse
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please log in to continue to your account.
        </p>
        <AuthForm />
        <button
          onClick={() => setDark(!dark)}
          className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Toggle {dark ? 'Light' : 'Dark'} Mode
        </button>
      </div>
    </div>
    
  );
}

export default App;
