import React, { useState } from 'react';
import { Terminal, XCircle } from 'lucide-react';

const ServerScreen = ({ isOpen, onClose }) => {
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'Server Terminal v1.0\nType "help" for available commands.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  

  if (!isOpen) return null;

  const handleTerminalCommand = (e) => {
    e.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    
    // Add user input to history
    setTerminalHistory([...terminalHistory, { type: 'input', content: `> ${terminalInput}` }]);
    
    let response = { type: 'error', content: 'Command not recognized. Type "help" for available commands.' };

    if (command === 'help') {
      response = {
        type: 'system',
        content: `Available commands:
help - Display this help message
status - Check server status
logs - View recent logs
exit - Close terminal`
      };
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/server-bg.jpg)' }}
        >
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      <div className="relative w-4/5 h-4/5 rounded-lg overflow-hidden shadow-xl">
        

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 z-10"
        >
          <XCircle size={24} className="text-red-400" />
        </button>

        {/* Terminal Window */}
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
      </div>
    </div>
  );
};

export default ServerScreen;