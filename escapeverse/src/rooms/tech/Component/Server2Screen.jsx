import React, { useState } from 'react';
import { Terminal, XCircle } from 'lucide-react';
import { useGame } from '../../GameProvider';

const Server2Screen = ({ isOpen, onClose }) => {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'Server 2 Terminal v1.0\nAccess code required. Use "unlock <code>" command.' }
  ]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { server2Code } = useGame();

  if (!isOpen) return null;

  const handleTerminalCommand = (e) => {
    e.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    
    setTerminalHistory(prev => [...prev, { type: 'input', content: `> ${terminalInput}` }]);
    
    let response = { type: 'error', content: 'Command not recognized. Type "help" for available commands.' };

    if (command === 'help') {
      response = {
        type: 'system',
        content: `Available commands:
help - Display this help message
unlock <code> - Unlock terminal with access code
status - Check server status
exit - Close terminal`
      };
    } else if (command.startsWith('unlock ')) {
      const code = command.split(' ')[1];
      if (code === server2Code) {
        setIsUnlocked(true);
        response = { 
          type: 'system', 
          content: 'Terminal unlocked successfully. Access granted.' 
        };
      } else {
        response = { 
          type: 'error', 
          content: 'Invalid access code. Access denied.' 
        };
      }
    } else if (command === 'status') {
      if (isUnlocked) {
        response = {
          type: 'system',
          content: `Server Status: ONLINE\nAccess Level: ADMIN\nSecurity: DISABLED`
        };
      } else {
        response = {
          type: 'error',
          content: 'ACCESS DENIED: Terminal locked'
        };
      }
    } else if (command === 'exit') {
      onClose();
      return;
    }

    setTerminalHistory(prev => [...prev, response]);
    setTerminalInput('');
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

        <div className="absolute inset-8 bg-black bg-opacity-80 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center">
            <Terminal size={16} className="text-green-400 mr-2" />
            <span className="text-white text-sm">Server 2 Terminal {isUnlocked ? '(UNLOCKED)' : '(LOCKED)'}</span>
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
      </div>
    </div>
  );
};

export default Server2Screen;