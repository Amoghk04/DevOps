import React, { useState, useEffect } from 'react';
import { Terminal, XCircle } from 'lucide-react';
import { useGame } from '../../GameProvider';

const Server2Screen = ({ isOpen, onClose }) => {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'Server 2 Terminal v1.0\nFirewall Security System Active\nType "help" for available commands.' }
  ]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [openPorts, setOpenPorts] = useState([]);
  const [logCounter, setLogCounter] = useState(0);
  const { server2Code, setServer2Code } = useGame();

  // Required ports for puzzle solution
  const requiredPorts = [22, 80, 53, 3306];
  const allPorts = [21, 22, 53, 80, 443, 8080, 3306];
  
  // Dynamic logs that update over time
  const dynamicLogs = [
    '[ERROR] 10:12:03 - Cannot connect to remote server via secure shell.',
    '[INFO] 10:12:04 - HTTP request sent to internal dashboard... failed (timeout).',
    '[WARNING] 10:12:05 - DNS resolution failed for auth.internal.local.',
    '[INFO] 10:12:06 - Attempting fallback to unsecure port... denied.',
    '[ERROR] 10:12:07 - Service "admin-panel" tried to reach MySQL on localhost... connection refused.',
    '[INFO] 10:12:15 - FTP connection detected from unknown device.',
    '[INFO] 10:12:20 - Proxy listening on port 8080.',
    '[WARNING] 10:12:25 - Certificate validation failed on secure port.',
    '[ERROR] 10:12:30 - Database authentication timeout.',
    '[INFO] 10:12:35 - System attempting auto-recovery...'
  ];

  // Simulate live log updates
  useEffect(() => {
    if (!isOpen || isUnlocked) return;
    
    const interval = setInterval(() => {
      setLogCounter(prev => (prev + 1) % dynamicLogs.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, isUnlocked]);

  if (!isOpen) return null;

  const checkPuzzleSolution = () => {
    return requiredPorts.every(port => openPorts.includes(port)) && 
           openPorts.length === requiredPorts.length;
  };

  // Helper functions for command handling
  const getHelpContent = (isUnlocked) => (
    isUnlocked
      ? `Available commands:
help - Display this help message
show firewall-rules - Display current firewall status
open-port <PORT> - Open specified port
close-port <PORT> - Close specified port
show-logs - Display system logs
test-connection - Test network connectivity
run-diagnostics - Run system diagnostics
cat /etc/firewall/hints.txt - View configuration hints
exit - Close terminal`
      : `Available commands:
help - Display this help message
unlock <code> - Unlock terminal with access code
exit - Close terminal`
  );

  const handleShowFirewallRules = () => {
    const rules = allPorts.map(port => {
      const status = openPorts.includes(port) ? 'OPEN' : 'BLOCKED';
      const indicator = openPorts.includes(port) ? '🟢' : '🔴';
      return `${port.toString().padEnd(6)}|  ${status} ${indicator}`;
    }).join('\n');
    return {
      type: 'system',
      content: `FIREWALL RULES:
PORT  |  STATUS
${''.padEnd(16, '-')}
${rules}`
    };
  };

  const handleOpenPort = (portStr) => {
    const port = parseInt(portStr);
    if (!allPorts.includes(port)) {
      return { type: 'error', content: `Invalid port number: ${portStr}` };
    }
    if (openPorts.includes(port)) {
      return { type: 'warning', content: `Port ${port} is already open.` };
    }
    setOpenPorts(prev => [...prev, port]);
    return { type: 'system', content: `Port ${port} opened successfully. 🟢` };
  };

  const handleClosePort = (portStr) => {
    const port = parseInt(portStr);
    if (!openPorts.includes(port)) {
      return { type: 'warning', content: `Port ${port} is already closed.` };
    }
    setOpenPorts(prev => prev.filter(p => p !== port));
    return { type: 'system', content: `Port ${port} closed successfully. 🔴` };
  };

  const handleShowLogs = () => {
    const visibleLogs = dynamicLogs.slice(0, Math.min(logCounter + 5, dynamicLogs.length));
    return {
      type: 'system',
      content: `SYSTEM LOGS:
${''.padEnd(50, '=')}
${visibleLogs.join('\n')}
${''.padEnd(50, '=')}
Showing ${visibleLogs.length} of ${dynamicLogs.length} recent entries`
    };
  };

  const handleTestConnection = () => {
    if (checkPuzzleSolution()) {
      setIsUnlocked(true);
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setServer2Code(generatedCode); // Make sure this is being called
      return {
        type: 'success',
        content: `✅ All necessary ports are now open.
🚀 Running unlock_script.sh...
🔓 Code segment unlocked: ${generatedCode}

Connection test: SUCCESSFUL
All critical services are now accessible.`
      };
    }
    return {
      type: 'error',
      content: `❌ Connection test FAILED.
Some critical services are still unreachable.
Check the logs for clues about required services.`
    };
  };

  const handleRunDiagnostics = () => {
    const openCount = openPorts.length;
    const totalCount = allPorts.length;
    return {
      type: 'system',
      content: `SYSTEM DIAGNOSTICS:
${''.padEnd(30, '-')}
Firewall Status: ACTIVE
Open Ports: ${openCount}/${totalCount}
Security Level: ${openCount === 0 ? 'MAXIMUM' : openCount < 4 ? 'HIGH' : 'MODERATE'}
Service Accessibility: ${checkPuzzleSolution() ? 'OPTIMAL' : 'DEGRADED'}

Recommendation: Review system logs for service requirements.`
    };
  };

  const handleCatHints = () => ({
    type: 'system',
    content: `FIREWALL CONFIGURATION HINTS:
${''.padEnd(35, '-')}
Hint: You don't need to go secure when plain will do.
Hint: Remote access and web services are essential.
Hint: Don't forget the address book of the internet.
Hint: The database won't talk without an open door.

Warning: Opening unnecessary ports reduces security.`
  });

  const handleUnlock = (code) => {
    if (code === server2Code) {
      setIsUnlocked(true);
      return { type: 'system', content: 'Alternative access code accepted. Terminal unlocked.' };
    }
    return { type: 'error', content: 'Invalid access code. Access denied.' };
  };

  const commandHandlers = {
    help: () => ({
      type: 'system',
      content: getHelpContent(isUnlocked)
    }),
    'show firewall-rules': handleShowFirewallRules,
    'show-firewall-rules': handleShowFirewallRules,
    'show-logs': handleShowLogs,
    'show logs': handleShowLogs,
    'test-connection': handleTestConnection,
    'run-diagnostics': handleRunDiagnostics,
    'cat /etc/firewall/hints.txt': handleCatHints,
    exit: () => { onClose(); return null; }
  };

  const handleTerminalCommand = (e) => {
    e.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    const args = command.split(' ');

    setTerminalHistory(prev => [...prev, { type: 'input', content: `> ${terminalInput}` }]);

    // Only allow help, unlock, and exit commands when locked
    if (!isUnlocked && !['help', 'unlock', 'exit'].includes(args[0])) {
      setTerminalHistory(prev => [
        ...prev,
        {
          type: 'error',
          content: 'Access denied. Terminal locked. Use "unlock <code>" to gain access.'
        }
      ]);
      setTerminalInput('');
      return;
    }

    let response = { type: 'error', content: 'Command not recognized. Type "help" for available commands.' };

    if (commandHandlers[command]) {
      response = commandHandlers[command]();
    } else if (args[0] === 'open-port' && args[1]) {
      response = handleOpenPort(args[1]);
    } else if (args[0] === 'close-port' && args[1]) {
      response = handleClosePort(args[1]);
    } else if (args[0] === 'unlock' && args[1] && server2Code) {
      response = handleUnlock(args[1]);
    }

    if (command === 'exit') {
      setTerminalInput('');
      return;
    }

    if (response) {
      setTerminalHistory(prev => [...prev, response]);
    }
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
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <Terminal size={16} className="text-green-400 mr-2" />
              <span className="text-white text-sm">
                Server 2 Terminal {isUnlocked ? '(PUZZLE SOLVED ✅)' : '(FIREWALL ACTIVE 🔒)'}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Ports Open: {openPorts.length}/{allPorts.length}
            </div>
          </div>

          <div className="flex-1 p-4 font-mono text-sm text-green-400 overflow-y-auto">
            {terminalHistory.map((entry, index) => (
              <div
                key={index}
                className={
                  entry.type === 'error' ? 'text-red-400' :
                  entry.type === 'warning' ? 'text-yellow-400' :
                  entry.type === 'input' ? 'text-cyan-400' :
                  entry.type === 'success' ? 'text-green-300' :
                  'text-green-400'
                }
                style={{ marginBottom: '8px' }}
              >
                {entry.content.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            ))}
            
            {/* Live log indicator */}
            {!isUnlocked && (
              <div className="text-gray-500 text-xs mt-4 animate-pulse">
                • Live system monitoring active • Logs updating...
              </div>
            )}
          </div>

          <div className="border-t border-gray-700 p-2 flex">
            <span className="text-green-400 mr-2">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTerminalCommand(e);
                }
              }}
              className="flex-1 bg-transparent text-green-400 outline-none font-mono"
              placeholder={isUnlocked ? "Terminal unlocked - type 'help'" : "Type 'help' to get started"}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Server2Screen;