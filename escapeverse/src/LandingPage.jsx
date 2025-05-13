// src/LandingPage.jsx
import { useUser } from "./UserContext";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import { Moon, Sun, LogOut, UserCircle2, Instagram, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileOverlay from "./ProfileOverlay";

export default function LandingPage() {
  const { user } = useUser();
  const [dark, setDark] = useState(false);
  const [points, setPoints] = useState(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const sidebarRef = useRef(null);

  // Toggle dark mode based on state.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Fetch user points from backend (Flask & MongoDB)
  // Fetch user points from backend (Flask & MongoDB)
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user?.uid) return;
      
      try {
        const response = await fetch(`/api/get_user_points?uid=${user.uid}`);
        const data = await response.json();
        setPoints(data.points || 0);
      } catch (err) {
        console.error("Failed to fetch points:", err);
      }
    };

    fetchUserPoints();
  }, [user]);

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

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Main container with new softer color scheme */}
      <div className="flex-grow flex bg-gradient-to-r from-sky-400 via-blue-500 to-teal-500 dark:from-blue-900 dark:via-teal-900 dark:to-slate-800 overflow-hidden">

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
                {sidebarExpanded ? 'Escapeverse' : 'EV'}
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


                <div className={`flex items-center gap-3 text-gray-600 dark:text-gray-300 ${!sidebarExpanded && 'justify-center'}`}>
                  <Menu size={24} className="text-blue-500 dark:text-blue-400" />
                  {sidebarExpanded && <span className="font-medium">Settings</span>}
                </div>
              </nav>
            </div>

            <div>
              {sidebarExpanded && (
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Connect</p>
              )}
              <div className={`flex gap-4 ${!sidebarExpanded && 'justify-center'}`}>
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
              <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 dark:from-blue-600 dark:to-teal-600 rounded-full">
                <UserCircle2 size={48} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{user?.displayName || user?.email || "Guest"}</h1>
                <p className="text-lg md:text-xl text-blue-100 dark:text-blue-200">Total Points: {points}</p>
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

            {/* User Statistics Box */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] dark:hover:shadow-[0_0_35px_rgba(8,145,178,0.4)] group">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-sky-600 dark:from-cyan-400 dark:to-sky-400">
                User Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-cyan-100/70 dark:bg-cyan-900/30">
                  <span className="font-semibold text-cyan-800 dark:text-cyan-300">Games Played:</span>
                  <span className="text-lg text-gray-800 dark:text-gray-200">24</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-cyan-100/70 dark:bg-cyan-900/30">
                  <span className="font-semibold text-cyan-800 dark:text-cyan-300">Games Won:</span>
                  <span className="text-lg text-gray-800 dark:text-gray-200">18</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-cyan-100/70 dark:bg-cyan-900/30">
                  <span className="font-semibold text-cyan-800 dark:text-cyan-300">Win Rate:</span>
                  <span className="text-lg text-gray-800 dark:text-gray-200">75%</span>
                </div>
              </div>
            </div>

            {/* Updates Box */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(2,132,199,0.6)] dark:hover:shadow-[0_0_35px_rgba(3,105,161,0.4)] group">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400">
                Updates
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-sky-100/70 dark:bg-sky-900/30">
                  <p className="text-lg font-medium text-sky-800 dark:text-sky-300">New "Atlantis" Theme</p>
                  <p className="text-gray-700 dark:text-gray-300">Explore underwater mysteries with new puzzles!</p>
                </div>
                <div className="p-4 rounded-xl bg-sky-100/70 dark:bg-sky-900/30">
                  <p className="text-lg font-medium text-sky-800 dark:text-sky-300">Weekend Bonus Points</p>
                  <p className="text-gray-700 dark:text-gray-300">Play this weekend to earn 2x points!</p>
                </div>
              </div>
            </div>

            {/* Live Gameplay - Full Width */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] dark:hover:shadow-[0_0_35px_rgba(59,130,246,0.4)] md:col-span-2 group">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Live Gameplay
              </h2>
              <div className="bg-gradient-to-r from-blue-100/40 to-indigo-100/40 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="font-bold text-blue-800 dark:text-blue-300">LIVE NOW</span>
                  </div>
                  <span className="text-sm font-medium bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                    8 Active Rooms
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/60 dark:bg-gray-900/60 p-4 rounded-xl flex items-center justify-between group-hover:scale-105 transition-transform">
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Space Adventure</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">4 players • 12 min remaining</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium">
                      Watch
                    </button>
                  </div>

                  <div className="bg-white/60 dark:bg-gray-900/60 p-4 rounded-xl flex items-center justify-between group-hover:scale-105 transition-transform">
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Ancient Temple</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">3 players • 8 min remaining</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium">
                      Watch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        {showProfile && <ProfileOverlay onClose={() => setShowProfile(false)} />}
      </div>
    </div>
  );
}
