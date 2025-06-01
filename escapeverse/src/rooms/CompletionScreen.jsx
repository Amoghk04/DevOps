import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompletionScreen = () => {
  const [elapsedTime, setElapsedTime] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [username, setUsername] = useState(''); // Add this state
  const navigate = useNavigate();

  useEffect(() => {
    const timeTaken = parseInt(localStorage.getItem('timeTaken'));
    const totalSeconds = Math.floor(timeTaken / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    setElapsedTime(`${hours}h ${minutes}m ${seconds}s`);
    
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username') || 'Player';
    setUsername(storedUsername);

    // Animate content appearance
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => {
      localStorage.removeItem('gameStartTime');
      localStorage.removeItem('gameEndTime');
      localStorage.removeItem('timeTaken');
      clearTimeout(timer);
    };
  }, []);

  const handleReturnHome = () => {
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
    }
    navigate('/home');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-purple-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Success particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className={`relative z-10 text-center max-w-2xl mx-auto px-6 transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        {/* Trophy icon */}
        <div className="text-8xl mb-2">🏆</div>

        {/* Main heading */}
        <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 font-mono mb-6 animate-pulse">
          ESCAPE COMPLETE!
        </h1>

        {/* Success message */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl text-green-400 font-mono mb-4 animate-fade-in">
            🎉 Congratulations, {username}!
          </p>
          <p className="text-xl text-gray-300 font-mono leading-relaxed">
            You've successfully navigated through all challenges<br />
            and completed your escape mission!
          </p>
        </div>

        {/* Time display */}
        <div className="bg-black/50 backdrop-blur-sm border-2 border-green-500 rounded-xl p-6 mb-8 shadow-2xl shadow-green-500/20">
          <div className="text-lg text-green-300 font-mono mb-2">MISSION DURATION</div>
          <div className="text-4xl md:text-5xl text-green-400 font-bold font-mono tracking-wider">
            {elapsedTime}
          </div>
          <div className="text-sm text-gray-400 font-mono mt-2">Time to Freedom</div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <button
            onClick={handleReturnHome}
            className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 px-8 rounded-xl font-mono text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 border border-green-400"
          >
            Return to Home
          </button>

        </div>


      </div>

    </div>
  );
};

export default CompletionScreen;