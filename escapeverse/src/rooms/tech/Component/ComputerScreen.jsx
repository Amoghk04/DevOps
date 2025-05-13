import { useState, useEffect, useRef } from 'react';
import { Terminal, TerminalIcon, XCircle, Power, Folder, Monitor, FileText, HardDrive } from 'lucide-react';
import TicTacToe from './TicTacToe';
import { useGame } from '../../GameProvider';

const ComputerScreen = ({ isOpen, onClose }) => {
  const [isOn, setIsOn] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'System initialized. Type "help" for available commands.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalRef = useRef(null);
  const [showTicTacToeWinMessage, setShowTicTacToeWinMessage] = useState(false);
  const [hasDecryptedFile, setHasDecryptedFile] = useState(false);
  const [wall2Number, setWall2Number] = useState('');
  const [files, setFiles] = useState([
    { id: 1, name: 'readme.txt', type: 'text', content: 'Welcome to the secret facility terminal. Navigate carefully.' },
    { id: 2, name: 'access_codes.dat', type: 'data', content: 'ERROR: File corrupted or encrypted.' },
    { id: 3, name: 'security_log.txt', type: 'text', content: 'Last access: REDACTED\nSecurity breach attempts: 3\nStatus: LOCKDOWN' },
    { id: 4, name: 'clue.txt', type: 'text', content: `I am a six-digit number, here's your clue,
Each digit hides where logic is due.
My first is just one more than a pair.
My second, like twins, is a common affair.
My third is double three, don't you agree?
My fourth is half a score minus a tree 🌳.
My fifth is a repeat, same as the two.
My last is the very first counting you do.

PS: take me back to where my home is, I shall give you the passkey.`, hidden: true }
  ]);
  const [openFile, setOpenFile] = useState(null);
  const [time, setTime] = useState(new Date());
  const { serverRoomKey, setServerRoomKey } = useGame();

hasDecryptedFile, wall2Number;

  useEffect(() => {
    // Automatically scroll terminal to bottom when new content is added
    if (terminalRef.current && activeApp === 'terminal') {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory, activeApp]);

  useEffect(() => {
    // Update clock
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePowerToggle = () => {
    if (isOn) {
      // Shutdown sequence
      setActiveApp(null);
      setStartMenuOpen(false);
      setTimeout(() => {
        setIsOn(false);
      }, 500);
    } else {
      // Boot sequence
      setIsOn(true);
    }
  };

  const handleTerminalCommand = (e) => {
    e.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    let response = { type: 'error', content: 'Command not recognized. Type "help" for available commands.' };

    // Add user input to history
    setTerminalHistory([...terminalHistory, { type: 'input', content: `> ${terminalInput}` }]);

    if (command === '326721') {
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      setWall2Number(randomNumber.toString());
      response = {
        type: 'system',
        content: `The final key is: ${randomNumber}`
      };
      setServerRoomKey(randomNumber.toString());
    } else if (command === 'openssl enc -d access_codes.dat') {
      setHasDecryptedFile(true);
      const updatedFiles = files.map(file => 
        file.name === 'clue.txt' ? { ...file, hidden: false } : file
      );
      setFiles(updatedFiles);
      response = {
        type: 'system',
        content: 'File decrypted successfully. New file available: clue.txt'
      };
    } else if (command === 'help') {
      response = {
        type: 'system',
        content: `Available commands:
help - Display this help message
ls - List files
cat [filename] - Display file contents
clear - Clear terminal
status - Display system status
exit - Close terminal`
      };
    } else if (command === 'ls') {
      response = {
        type: 'system',
        content: files.map(file => file.name).join('\n')
      };
    } else if (command.startsWith('cat ')) {
      const fileName = command.substring(4);
      const file = files.find(f => f.name === fileName);
      if (file) {
        response = { type: 'system', content: file.content };
      } else {
        response = { type: 'error', content: `File not found: ${fileName}` };
      }
    } else if (command === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    } else if (command === 'status') {
      response = {
        type: 'system',
        content: `System Status: RESTRICTED
Security Level: AMBER
Network: DISCONNECTED
Power: BACKUP GENERATOR
Location: CLASSIFIED`
      };
    } else if (command === 'exit') {
      setActiveApp(null);
      setTerminalInput('');
      return;
    }

    // Add response to history
    setTerminalHistory([...terminalHistory, { type: 'input', content: `> ${terminalInput}` }, response]);
    setTerminalInput('');
  };

  const handleFileClick = (file) => {
    setOpenFile(file);
    setActiveApp('fileViewer');
  };

  const handleTicTacToeWin = () => {
    setShowTicTacToeWinMessage(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative w-4/5 h-4/5 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-4 border-gray-700">
        {/* Monitor frame */}
        <div className="absolute inset-0 pointer-events-none border-8 border-gray-900 rounded-lg shadow-inner"></div>

        {/* Power button */}
        <button
          onClick={handlePowerToggle}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full z-20 hover:bg-gray-700"
        >
          <Power size={16} className={`${isOn ? 'text-green-400' : 'text-red-400'}`} />
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full z-20 hover:bg-gray-700"
        >
          <XCircle size={16} className="text-red-400" />
        </button>

        {/* Screen content */}
        <div className="absolute inset-0 m-2 rounded-lg overflow-hidden">
          {!isOn ? (
            // Powered off state
            <div className="w-full h-full bg-black flex items-center justify-center">
              <div className="text-gray-700 text-lg">Press power button to start</div>
            </div>
          ) : (
            // Powered on state
            <div className="w-full h-full bg-gray-900 flex flex-col">
              {/* Desktop */}
              <div className="flex-1 p-4 relative overflow-hidden">
                {/* Desktop icons */}
                <div className="grid grid-cols-1 gap-4 w-24">
                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => setActiveApp('terminal')}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-lg group-hover:bg-opacity-70">
                      <TerminalIcon className="text-green-400" size={24} />
                    </div>
                    <span className="text-white text-xs mt-1">Terminal</span>
                  </div>

                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => setActiveApp('files')}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-lg group-hover:bg-opacity-70">
                      <Folder className="text-blue-400" size={24} />
                    </div>
                    <span className="text-white text-xs mt-1">Files</span>
                  </div>

                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => setActiveApp('tictactoe')}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-lg group-hover:bg-opacity-70">
                      <svg className="text-purple-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16v16H4z" />
                        <path d="M4 12h16M12 4v16" />
                      </svg>
                    </div>
                    <span className="text-white text-xs mt-1">Tic Tac Toe</span>
                  </div>
                </div>
                {/* Active application windows */}
                {activeApp === 'tictactoe' && (
                  <TicTacToe 
                    onClose={() => setActiveApp(null)} 
                    onWin={handleTicTacToeWin}
                  />
                )}
                {activeApp === 'terminal' && (
                  <div className="absolute inset-4 bg-black bg-opacity-80 border border-gray-700 rounded-lg overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <Terminal size={16} className="text-green-400 mr-2" />
                        <span className="text-white text-sm">Terminal</span>
                      </div>
                      <XCircle
                        size={16}
                        className="text-red-400 cursor-pointer"
                        onClick={() => setActiveApp(null)}
                      />
                    </div>
                    <div
                      ref={terminalRef}
                      className="flex-1 p-4 font-mono text-sm text-green-400 overflow-y-auto bg-black"
                    >
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
                    <form onSubmit={handleTerminalCommand} className="bg-black border-t border-gray-700 p-2 flex">
                      <span className="text-green-400 mr-2"></span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        className="flex-1 bg-transparent text-green-400 outline-none font-mono text-sm"
                        autoFocus
                      />
                    </form>
                  </div>
                )}

                {activeApp === 'files' && (
                  <div className="absolute inset-4 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <Folder size={16} className="text-blue-400 mr-2" />
                        <span className="text-white text-sm">Files</span>
                      </div>
                      <XCircle
                        size={16}
                        className="text-red-400 cursor-pointer"
                        onClick={() => setActiveApp(null)}
                      />
                    </div>
                    <div className="flex-1 p-4 grid grid-cols-3 gap-4 overflow-y-auto">
                      {files.filter(file => !file.hidden).map(file => (
                        <div
                          key={file.id}
                          className="flex flex-col items-center cursor-pointer group"
                          onClick={() => handleFileClick(file)}
                        >
                          <div className="w-16 h-16 flex items-center justify-center bg-black bg-opacity-30 rounded-lg group-hover:bg-opacity-50">
                            {file.type === 'text' ? (
                              <FileText className="text-blue-300" size={24} />
                            ) : (
                              <HardDrive className="text-purple-300" size={24} />
                            )}
                          </div>
                          <span className="text-white text-xs mt-1 text-center">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeApp === 'fileViewer' && openFile && (
                  <div className="absolute inset-4 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText size={16} className="text-blue-400 mr-2" />
                        <span className="text-white text-sm">{openFile.name}</span>
                      </div>
                      <XCircle
                        size={16}
                        className="text-red-400 cursor-pointer"
                        onClick={() => setActiveApp('files')}
                      />
                    </div>
                    <div className="flex-1 p-4 bg-gray-900 font-mono text-sm text-gray-300 overflow-y-auto">
                      {openFile.content.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Taskbar */}
              <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center px-4">
                <div
                  className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-700"
                  onClick={() => setStartMenuOpen(!startMenuOpen)}
                >
                  <Monitor size={18} className="text-white" />
                </div>

                {/* Active app indicators */}
                <div className="flex space-x-2 ml-4">
                  {activeApp === 'terminal' && (
                    <div className="px-2 py-1 bg-black bg-opacity-30 rounded flex items-center">
                      <Terminal size={14} className="text-green-400 mr-1" />
                      <span className="text-white text-xs">Terminal</span>
                    </div>
                  )}
                  {(activeApp === 'files' || activeApp === 'fileViewer') && (
                    <div className="px-2 py-1 bg-black bg-opacity-30 rounded flex items-center">
                      <Folder size={14} className="text-blue-400 mr-1" />
                      <span className="text-white text-xs">Files</span>
                    </div>
                  )}
                </div>
                {activeApp === 'tictactoe' && (
                  <div className="px-2 py-1 bg-black bg-opacity-30 rounded flex items-center">
                    <svg className="text-purple-400 mr-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16v16H4z" />
                      <path d="M4 12h16M12 4v16" />
                    </svg>
                    <span className="text-white text-xs">Tic Tac Toe</span>
                  </div>
                )}
                {/* Time */}
                <div className="ml-auto text-white text-xs">
                  {time.toLocaleTimeString()}
                </div>
              </div>

              {/* Start menu */}
              {startMenuOpen && (
                <div className="absolute bottom-12 left-0 w-64 bg-gray-800 border border-gray-700 rounded-t-lg shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <div className="text-white font-bold">System Terminal</div>
                    <div className="text-gray-400 text-xs">Restricted Access</div>
                  </div>

                  <div className="divide-y divide-gray-700">
                    <div
                      className="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setActiveApp('terminal');
                        setStartMenuOpen(false);
                      }}
                    >
                      <Terminal size={18} className="text-green-400 mr-3" />
                      <span className="text-white text-sm">Terminal</span>
                    </div>

                    <div
                      className="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setActiveApp('files');
                        setStartMenuOpen(false);
                      }}
                    >
                      <Folder size={18} className="text-blue-400 mr-3" />
                      <span className="text-white text-sm">Files</span>
                    </div>
                    <div
                      className="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setActiveApp('tictactoe');
                        setStartMenuOpen(false);
                      }}
                    >
                      <svg className="text-purple-400 mr-3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16v16H4z" />
                        <path d="M4 12h16M12 4v16" />
                      </svg>
                      <span className="text-white text-sm">Tic Tac Toe</span>
                    </div>
                    <div
                      className="flex items-center p-3 hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        handlePowerToggle();
                        setStartMenuOpen(false);
                      }}
                    >
                      <Power size={18} className="text-red-400 mr-3" />
                      <span className="text-white text-sm">Shutdown</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add TicTacToe win message popup */}
      {showTicTacToeWinMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border-2 border-green-500 shadow-xl max-w-md">
            <h3 className="text-xl text-green-400 mb-4">Congratulations!</h3>
            <p className="text-white mb-4">You've won! Here's a helpful command:</p>
            <code className="bg-black p-2 rounded text-green-400 block mb-4">
              openssl enc -d
            </code>
            <button
              onClick={() => setShowTicTacToeWinMessage(false)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputerScreen;