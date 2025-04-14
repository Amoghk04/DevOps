import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './App.css';
import AuthForm from './AuthForm';
import LandingPage from './LandingPage';

function App() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div
        className="min-h-screen w-full flex items-center justify-end relative px-10"
        style={{
          backgroundImage: 'url(/bg1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#1a1a1a', // fallback in case image doesn't load
        }}
      >
        {/* Dark overlay on top of the background */}
        {/* You can adjust opacity to control how dark the background becomes */}
        <div className="absolute inset-0 bg-black opacity-0 z-0" />
        {/* ↑ 50% darkness — try 0.3 for lighter, or 0.7 for darker */}

        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <div
                  className="relative z-10 bg-black/60 p-8 rounded-xl shadow-2xl w-full max-w-md text-white custom-margin"
                >
                  <p className="text-2xl font-bold text-center mb-4 text-yellow-300">
                    Log in to continue your Journey.
                  </p>
                  <AuthForm />
                </div>
              ) : (
                <Navigate to="/home" />
              )
            }
          />
          <Route
            path="/home"
            element={user ? <LandingPage /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
