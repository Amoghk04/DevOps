import React, { useState } from 'react';
import { Terminal, XCircle, Code, Send, AlertCircle } from 'lucide-react';
import { debuggingChallenges } from './debuggingChallenges';
import { useGame } from '../../GameProvider';

const ServerScreen = ({ isOpen, onClose, isSecondServer = false }) => {
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'Server Terminal v1.0\nType "help" for available commands.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [showDebugger, setShowDebugger] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionCode, setCompletionCode] = useState('');
  const [challengesCompleted, setChallengesCompleted] = useState(false);
  const { setServer2Code } = useGame();
accessCode;

  if (!isOpen) return null;

  const handleTerminalCommand = (e) => {
    e.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    
    setTerminalHistory([...terminalHistory, { type: 'input', content: `> ${terminalInput}` }]);
    
    let response = { type: 'error', content: 'Command not recognized. Type "help" for available commands.' };

    if (command === 'help') {
      response = {
        type: 'system',
        content: `Available commands:
help - Display this help message
status - Check server status
logs - View recent logs
debug - Start debugging challenge${challengesCompleted ? '\ncode - Reveal Server 2 access code' : ''}
exit - Close terminal`
      };
    } else if (command === 'code') {
      if (challengesCompleted) {
        response = {
          type: 'system',
          content: `Server 2 Access Code: ${accessCode}\n⚠️ Store this code safely - you'll need it to access Server 2`
        };
      } else {
        response = {
          type: 'error',
          content: 'Access denied. Complete all debugging challenges first.'
        };
      }
    } else if (command === 'debug') {
      setShowDebugger(true);
      setUserCode(debuggingChallenges[currentChallenge].buggyCode);
      return;
    } else if (command === 'status') {
      response = {
        type: 'system',
        content: `Server Status: ONLINE
Memory Usage: 78%
CPU Load: 92%
Storage: 45% used
Network: ACTIVE`
      };
    } else if (command === 'logs') {
      response = {
        type: 'system',
        content: `[WARNING] Unauthorized access attempt detected
[ERROR] Memory overflow in sector 7
[INFO] Backup process completed
[ALERT] Security protocol breach detected`
      };
    } else if (command === 'exit') {
      onClose();
      return;
    }

    setTerminalHistory([...terminalHistory, response]);
    setTerminalInput('');
  };

  const handleCodeSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      const isCorrect = true; // For testing, always true
    
      if (isCorrect) {
        setSuccess(true);
        
        if (currentChallenge === 2) {
          const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
          setAccessCode(generatedCode);
          setServer2Code(generatedCode);
          setChallengesCompleted(true);
          setShowDebugger(false);
          
          // Add completion message to terminal
          setTerminalHistory(prev => [...prev, 
            { type: 'system', content: '🎉 All debugging challenges completed!' },
            { type: 'system', content: 'Type "help" to see available commands.' }
          ]);
        } else if (currentChallenge < debuggingChallenges.length - 1) {
          setTimeout(() => {
            setCurrentChallenge(prev => prev + 1);
            setUserCode(debuggingChallenges[currentChallenge + 1].buggyCode);
            setSuccess(false);
          }, 1500);
        }
      } else {
        setError('Solution incorrect. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative w-4/5 h-4/5 rounded-lg overflow-hidden shadow-xl">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/server-bg.jpg)' }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 z-10"
        >
          <XCircle size={24} className="text-red-400" />
        </button>

        {showDebugger && currentChallenge < debuggingChallenges.length ? (
          <div className="absolute inset-8 bg-black bg-opacity-80 rounded-lg border border-gray-700 flex flex-col">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center">
                <Code size={16} className="text-green-400 mr-2" />
                <span className="text-white text-sm">Debug Challenge {currentChallenge + 1}/{debuggingChallenges.length}</span>
              </div>
              <span className="text-sm text-gray-400">
                {debuggingChallenges[currentChallenge]?.language || 'Unknown'}
              </span>
            </div>

            <div className="flex-1 flex p-4 gap-4">
              {/* Original Code */}
              <div className="flex-1 flex flex-col">
                <div className="text-sm text-gray-400 mb-2">Original Code</div>
                <div className="flex-1 bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-300 overflow-auto">
                  {debuggingChallenges[currentChallenge].buggyCode}
                </div>
              </div>

              {/* Editable Code */}
              <div className="flex-1 flex flex-col">
                <div className="text-sm text-gray-400 mb-2">Your Solution</div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="flex-1 bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400 outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle size={16} className="text-yellow-400 mr-2" />
                  <span className="text-sm text-gray-400">Hint: {debuggingChallenges[currentChallenge].hint}</span>
                </div>
                <button
                  onClick={handleCodeSubmit}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    loading ? 'bg-gray-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Send size={16} className="mr-2" />
                  {loading ? 'Checking...' : 'Submit Solution'}
                </button>
              </div>
              {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}
              {success && <div className="mt-2 text-green-400 text-sm">Success! Moving to next challenge...</div>}
            </div>
          </div>
        ) : (
          <div className="absolute inset-8 bg-black bg-opacity-80 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex items-center">
              <Terminal size={16} className="text-green-400 mr-2" />
              <span className="text-white text-sm">Server Terminal</span>
            </div>

            <div className="flex-1 p-4 font-mono text-sm text-green-400 overflow-y-auto">
              {terminalHistory.map((entry, index) => (
                <div
                  key={index}
                  className={
                    entry.type === 'error' ? 'text-red-400' :
                    entry.type === 'input' ? 'text-yellow-400' :
                    'text-green-400'
                  }
                >
                  {entry.content.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              ))}
            </div>

            <form onSubmit={handleTerminalCommand} className="border-t border-gray-700 p-2 flex">
              <span className="text-green-400 mr-2">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="flex-1 bg-transparent text-green-400 outline-none font-mono"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerScreen;