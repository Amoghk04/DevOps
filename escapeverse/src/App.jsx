import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { GameProvider } from './rooms/GameProvider';
import './App.css';
import AuthForm from './AuthForm';
import LandingPage from './LandingPage';
import CreateRoom from './CreateRoom';
import RoomLobby from './RoomLobby';
import JoinRoom from './JoinRoom';
import Wall1 from './rooms/wall1';
import Wall2 from './rooms/wall2';
import Wall3 from './rooms/wall3';
import Wall4 from './rooms/wall4';
import CreateProfile from './CreateProfile';
import CompletionScreen from './rooms/CompletionScreen';

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
        className="min-h-screen w-full flex items-center relative"
        style={{
          backgroundImage: 'url(/bg1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#1a1a1a',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black opacity-0 pointer-events-none z-0" />

        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <div className="relative z-10 bg-black/60 p-8 rounded-xl shadow-2xl w-full max-w-md text-white ml-auto mr-10">
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
            element={user ? (
              <div className="w-full min-h-screen">
                <LandingPage />
              </div>
            ) : (
              <Navigate to="/" />
            )}
          />
          <Route
            path="/create-profile"
            element={<CreateProfile />}
          />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/room/:roomId" element={<RoomLobby />} />
          <Route 
            path="/join-room" 
            element={
              <div className="relative z-10 bg-black/60 p-8 rounded-xl shadow-2xl w-full max-w-md text-white ml-auto mr-10">
                <JoinRoom />
              </div>
            } 
          />
          {/* game rooms */}
          <Route path="/game/:roomId/*" element={
            <GameProvider>
              <Wall1 />
            </GameProvider>
          }
          />

          {/* Walls */}
          <Route path="/wall1" element={
            <GameProvider>
              <Wall1 />
            </GameProvider>
          } />
          <Route path="/wall2" element={
            <GameProvider>
              <Wall2 />
            </GameProvider>
          } />
          <Route path="/wall3" element={
            <GameProvider>
              <Wall3 />
            </GameProvider>
          } />
          <Route path="/wall4" element={
            <GameProvider>
              <Wall4 />
            </GameProvider>
          } />
          <Route path="/completion" element={<CompletionScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
