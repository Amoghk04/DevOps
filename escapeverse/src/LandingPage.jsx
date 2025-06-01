// src/LandingPage.jsx
import { useUser } from "./UserContext";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import { Moon, Sun, LogOut, UserCircle2, Instagram, Menu, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileOverlay from "./ProfileOverlay";
import SettingsOverlay from './SettingsOverlay';

export default function LandingPage() {
  const { user } = useUser();
  const [dark, setDark] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const sidebarRef = useRef(null);

  const username = localStorage.getItem("username") || user?.displayName || user?.email || "Guest";
  const profileIndex = parseInt(localStorage.getItem("profileIndex") || "0");

  // Toggle dark mode based on state.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Handle clicks outside sidebar to collapse it on mobile
  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target) && window.innerWidth < 768) {
      setSidebarExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add this helper function inside the component
  const getIconPosition = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return {
      x: `${col * 50}%`,
      y: `${row * 50}%`
    };
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex-grow flex bg-gradient-to-r from-sky-400 via-blue-500 to-teal-500 dark:from-blue-900 dark:via-teal-900 dark:to-slate-800 overflow-hidden w-full">

        {/* Expandable Sidebar */}
        <aside
          ref={sidebarRef}
          className={`${sidebarExpanded ? 'w-72' : 'w-20'} h-screen bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out z-40 relative`}
        >
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            className="absolute -right-4 top-10 p-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 dark:from-blue-600 dark:to-teal-600 text-white shadow-lg hover:shadow-blue-400/50 dark:hover:shadow-blue-600/50"
          >
            {sidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>

          <div className="h-full flex flex-col justify-between p-5">
            <div>
              <h2 className={`text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500 dark:from-blue-400 dark:to-teal-400 mb-12 ${!sidebarExpanded && 'text-center'}`}>
                {sidebarExpanded ? 'EscapeVerse' : 'EV'}
              </h2>

              <nav className="flex flex-col gap-8">
                <div className="flex items-center">
                  <button
                    onClick={() => setShowProfile(true)}
                    className={`flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 ${!sidebarExpanded ? 'justify-center w-full' : ''}`}
                  >
                    <UserCircle2 size={24} className="text-blue-500 dark:text-blue-400" />
                    {sidebarExpanded && <span className="font-medium">Profile</span>}
                  </button>
                </div>

                <div className={`flex items-center gap-3 text-gray-600 dark:text-gray-300 ${!sidebarExpanded && 'justify-center'}`} onClick={() => setShowSettings(true)} style={{ cursor: 'pointer' }}>
                  <Settings size={24} className="text-blue-500 dark:text-blue-400" />
                  {sidebarExpanded && <span className="font-medium">Settings</span>}
                </div>
              </nav>
            </div>

            <div>
              {sidebarExpanded && (
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Connect</p>
              )}
              <div className={`flex gap-4 ${!sidebarExpanded ? 'flex-col items-center' : ''}`}>
                <a href="https://github.com/Amoghk04/DevOps" target="_blank" rel="noreferrer" aria-label="Visit us on Github" className="hover:scale-125 transition-transform">
                  <img
                    src={dark ? "/icons8-github.svg" : "/icons8-github.svg"}
                    alt="GitHub"
                    className="w-6 h-6"
                    style={{
                      filter: dark ? "invert(1) contrast(0.7)" : "none",
                    }}
                  />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Visit us on Instagram" className="hover:scale-125 transition-transform">
                  <Instagram size={24} className="text-teal-600 dark:text-teal-400" />
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-24">
          {/* Header */}
          <header className="flex justify-between items-center mb-10 p-5 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div 
                className="w-32 h-32 rounded-full overflow-hidden relative"
                role="img"
                aria-label={`${username}'s profile picture`}
              >
                <div
                  className="absolute w-full h-full bg-cover"
                  style={{
                    backgroundImage: "url('profile1.png')",
                    backgroundSize: "300% 300%",
                    backgroundPosition: `${getIconPosition(profileIndex).x} ${getIconPosition(profileIndex).y}`
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{`Hi, ` + username + `!`}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDark(!dark)}
                className="p-3 rounded-full bg-white/20 dark:bg-gray-800/30 backdrop-blur-md hover:bg-white/30 dark:hover:bg-gray-800/50 transition-all duration-300 shadow-lg"
                aria-label="Toggle Theme"
              >
                {dark ? <Sun className="text-yellow-300" /> : <Moon className="text-blue-900" />}
              </button>
              <button
                onClick={handleSignOut}
                className="p-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-full shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-blue-700/30 transition-all duration-300"
                title="Sign Out"
              >
                <LogOut size={24} />
              </button>
            </div>
          </header>

          {/* Body Grid - Larger size with softer colors */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Create Room Box */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] dark:hover:shadow-[0_0_35px_rgba(14,165,233,0.4)] group">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400">
                Building Wonders
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors duration-300">
                Create your own immersive escape room experience. Design puzzles, set themes, and invite friends.
              </p>
              <Link
                to="/create-room"
                className="block p-5 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 rounded-2xl text-white text-center font-bold shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-blue-700/50 transition-all duration-300"
              >
                Create Room
              </Link>
            </div>

            {/* Join Room Box */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(20,184,166,0.6)] dark:hover:shadow-[0_0_35px_rgba(45,212,191,0.4)] group">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
                Room Gatherings
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 group-hover:text-teal-900 dark:group-hover:text-teal-300 transition-colors duration-300">
                Connect and join existing rooms. Enter a room code or select from available public rooms.
              </p>
              <Link
                to="/join-room"
                className="block p-5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-2xl text-white text-center font-bold shadow-lg hover:shadow-teal-500/50 dark:hover:shadow-teal-700/50 transition-all duration-300"
              >
                Join Room
              </Link>
            </div>
          </section>
        </main>
        {showProfile && <ProfileOverlay onClose={() => setShowProfile(false)} />}
        {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
}
