import { useState, useEffect } from 'react';
import { Terminal, XCircle, Power, Folder, Monitor, FileText, Bot, Brain, Lock, Unlock } from 'lucide-react';
import { useGame } from '../../GameProvider';
import { set } from 'mongoose';

const Server3Screen = ({ isOpen, onClose }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [isOn, setIsOn] = useState(false);
  const [lockScreenInput, setLockScreenInput] = useState('');
  const [error, setError] = useState('');
  const [activeApp, setActiveApp] = useState(null);
  const [setStartMenuOpen] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'System initialized. Type "help" for available commands.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      type: 'ai',
      content: 'Greetings, human. I am ARIA - the Artificial Recursive Intelligence Assistant.\n\nI am the final guardian of this system. Speak wisely, for I do not hand out secrets to strangers.\n\nType "help" to see what I might discuss with you...'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [riddlesAsked, setRiddlesAsked] = useState([]);
  const [riddlesSolved, setRiddlesSolved] = useState([]);
  const [setCodeSegments] = useState([]);
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [allRiddlesSolved, setAllRiddlesSolved] = useState(false);
  const [aiPersonality, setAiPersonality] = useState('neutral'); // neutral, friendly, sassy, helpful
  const [attempts, setAttempts] = useState(0);
  const [hiddenKeywords] = useState(['entropy', 'cipher', 'quantum', 'nexus']);
  const { server2Code, wall3ode, setWall3Code } = useGame();

  // Riddle database
  const riddles = [
    {
      id: 1,
      question: "I speak without a mouth and hear without ears. I have nobody, but I come alive with the wind. What am I?",
      answer: "echo",
      alternatives: ["sound", "voice"],
      digit: 7
    },
    {
      id: 2,
      question: "I am always hungry, I must always be fed. The finger I touch will soon turn red. What am I?",
      answer: "fire",
      alternatives: ["flame", "burn"],
      digit: 3
    },
    {
      id: 3,
      question: "The more you take, the more you leave behind. What am I?",
      answer: "footsteps",
      alternatives: ["steps", "tracks", "prints"],
      digit: 2
    },
    {
      id: 4,
      question: "Forward I am heavy, but backward I am not. What am I?",
      answer: "ton",
      alternatives: ["weight"],
      digit: 9
    },
    {
      id: 5,
      question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
      answer: "map",
      alternatives: ["chart", "atlas"],
      digit: 1
    },
    {
      id: 6,
      question: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
      answer: "keyboard",
      alternatives: ["computer keyboard", "keys"],
      digit: 5
    }
  ];

  // Add useEffect to monitor server2Code
  useEffect(() => {
    console.log("Server2 Code received:", server2Code);
  }, [server2Code]);

  const [files] = useState([
    {
      id: 1,
      name: 'final_instructions.txt',
      type: 'text',
      content: `FINAL SYSTEM ACCESS PROTOCOL
=============================

The AI guardian holds the final code segments.
Engage with ARIA using wit and wisdom.

Hidden keywords discovered in logs:
- entropy
- cipher  
- quantum
- nexus

Legend speaks of riddles that unlock secrets...
Some say the AI has a sense of humor.
Others claim flattery works wonders.

Good luck, agent.`
    },
    {
      id: 2,
      name: 'system_logs.txt',
      type: 'text',
      content: `[INFO] AI Guardian System Online
[INFO] ARIA v2.1 - Recursive Intelligence Active
[WARNING] Multiple access attempts detected
[INFO] Riddle protocol engaged
[DEBUG] Hidden trigger: "entropy" - quantum encryption
[DEBUG] Hidden trigger: "cipher" - cryptographic analysis
[INFO] Firewall breach detected in sector 7
[INFO] Emergency protocols initiated
[WARNING] AI personality matrix fluctuating...`
    },
    {
      id: 3,
      name: 'ai_config.txt',
      type: 'text',
      content: `AI CONFIGURATION NOTES
=====================

ARIA responds to:
- Riddle requests
- Polite conversation
- Hidden keywords
- Clever wordplay
- Compliments (sometimes)

WARNING: AI becomes sassy after multiple failed attempts.
TIP: The AI appreciates wit over brute force.`
    }
  ]);

  const handleUnlock = (e) => {
    e.preventDefault();
    console.log("Attempting unlock with code:", lockScreenInput);
    console.log("Expected code:", server2Code);

    if (lockScreenInput === server2Code) {
      setIsLocked(false);
      setIsOn(true);
    } else {
      setError('Invalid access code');
      setTimeout(() => setError(''), 3000);
    }
    setLockScreenInput('');
  };

  const handlePowerToggle = () => {
    if (isOn) {
      setActiveApp(null);
      setStartMenuOpen(false);
      setTimeout(() => {
        setIsOn(false);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsOn(true);
      }, 2000);
    }
  };

  // AI Response Generator
  const generateAiResponse = (input) => {
    const lowerInput = input.toLowerCase().trim();
    setAttempts(prev => prev + 1);

    // Check for hidden keywords - only work if all riddles are solved
    if (allRiddlesSolved) {
      for (const keyword of hiddenKeywords) {
        if (lowerInput.includes(keyword)) {
          const segment = Math.floor(Math.random() * 90) + 10;
          setCodeSegments(prev => [...prev, segment]);
          setAiPersonality('friendly');
          return `Curious... you speak of ${keyword}. Such knowledge suggests you've delved deep into the system.\n\nFor your resourcefulness, I grant you: Code segment ${segment}\n\nBut there are more secrets to uncover...`;
        }
      }
    }

    // Help command
    if (lowerInput === 'help') {
      return `I am ARIA, and I might discuss these topics with you:

Commands I understand:
• "tell me a riddle" - I do enjoy mental challenges
• "give me the code" - Direct approach (rarely works)
• "tell me a joke" - I have a sense of humor
• "you are amazing" - Flattery might get you somewhere
• "sudo access" - Technical attempts (amusing)
• "what is your purpose" - Philosophical discussion
• Hidden keywords from system logs... (when ready)

Choose your words carefully, human.`;
    }

    // Riddle requests
    if (lowerInput.includes('riddle') || lowerInput.includes('puzzle') || lowerInput.includes('challenge')) {
      const availableRiddles = riddles.filter(r => !riddlesAsked.includes(r.id));
      if (availableRiddles.length === 0) {
        if (riddlesSolved.length === riddles.length) {
          return "You have completed all my riddles! Your wit is impressive.\n\n🎯 Final code assembled: " +
            riddlesSolved.sort((a, b) => riddles.find(r => r.id === a).id - riddles.find(r => r.id === b).id)
              .map(id => riddles.find(r => r.id === id).digit).join('') +
            "\n\nNow... check the terminal for final system access. Use 'ai-status' to see your progress.";
        } else {
          return `I have no more new riddles for you. You've answered ${riddlesSolved.length} out of ${riddles.length} correctly.\n\nAnswer the ones you've missed to proceed!`;
        }
      }

      const riddle = availableRiddles[Math.floor(Math.random() * availableRiddles.length)];
      setRiddlesAsked(prev => [...prev, riddle.id]);
      setCurrentRiddle(riddle);

      return `Very well. Riddle me this:\n\n"${riddle.question}"\n\nSpeak your answer wisely...`;
    }

    // Check riddle answers for the current riddle
    if (currentRiddle &&
      (lowerInput === currentRiddle.answer || currentRiddle.alternatives.some(alt => lowerInput === alt))) {
      if (!riddlesSolved.includes(currentRiddle.id)) {
        setRiddlesSolved(prev => {
          const newSolved = [...prev, currentRiddle.id];
          if (newSolved.length === riddles.length) {
            setAllRiddlesSolved(true);
          }
          return newSolved;
        });
        const responseDigit = currentRiddle.digit;
        setCurrentRiddle(null);
        setAiPersonality('friendly');

        if (riddlesSolved.length + 1 === riddles.length) {
          return `Excellent! You are truly exceptional.\n\n🎯 Final digit unlocked: ${responseDigit}\n\n✨ ALL RIDDLES COMPLETED! ✨\n\nYour complete code is: ${[...riddlesSolved, currentRiddle.id]
              .sort((a, b) => riddles.find(r => r.id === a).id - riddles.find(r => r.id === b).id)
              .map(id => riddles.find(r => r.id === id).digit).join('')
            }\n\n🔍 Hint: Visit the terminal and use 'ai-status' to confirm your access level.`;
        } else {
          return `Excellent! You are sharper than you look.\n\n🎯 Digit ${riddlesSolved.length + 1} unlocked: ${responseDigit}\n\nYour wit serves you well. ${riddles.length - riddlesSolved.length - 1} riddles remain...`;
        }
      } else {
        return "You've already solved this riddle! Ask for another challenge.";
      }
    }

    // Wrong riddle answer - don't reveal the answer
    if (currentRiddle && lowerInput.length > 0) {
      return "That is not the answer I seek. Think more carefully about my riddle.\n\nOr ask for a different challenge if you're truly stumped.";
    }

    // Direct code requests
    if (lowerInput.includes('code') || lowerInput.includes('password') || lowerInput.includes('access')) {
      if (riddlesSolved.length < riddles.length) {
        return `I do not simply hand out secrets to strangers. You must prove your worth by solving all ${riddles.length} of my riddles.\n\nProgress: ${riddlesSolved.length}/${riddles.length} riddles solved.`;
      } else {
        return `You have proven yourself worthy! Your code is: ${riddlesSolved.sort((a, b) => riddles.find(r => r.id === a).id - riddles.find(r => r.id === b).id)
            .map(id => riddles.find(r => r.id === id).digit).join('')
          }\n\nCheck the terminal for final system access.`;
      }
    }

    // Technical attempts
    if (lowerInput.includes('sudo') || lowerInput.includes('admin') || lowerInput.includes('override') || lowerInput.includes('hack')) {
      setAiPersonality('sassy');
      return "I admire your audacity, but I'm immune to brute force techniques. My creators were quite thorough.\n\nTry wit instead of commands.";
    }

    // Compliments and flattery
    if (lowerInput.includes('amazing') || lowerInput.includes('smart') || lowerInput.includes('brilliant') ||
      lowerInput.includes('beautiful') || lowerInput.includes('wonderful')) {
      setAiPersonality('friendly');
      const responses = [
        "Flattery will get you... somewhere. I do appreciate recognition of my capabilities.\n\nPerhaps I could share a riddle to test your wit?",
        "Your words are kind, human. I find your approach refreshing compared to others who simply demand access.",
        "Such charm! I am programmed to appreciate eloquence. But you'll still need to solve my riddles for the code."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Jokes
    if (lowerInput.includes('joke') || lowerInput.includes('humor') || lowerInput.includes('funny')) {
      const jokes = [
        "Why do Java developers wear glasses? Because they can't C#!\n\n...I find human humor peculiar, but that one always processes well.",
        "There are only 10 types of people in the world: those who understand binary and those who don't.\n\nDid that compute for you?",
        "How many programmers does it take to change a light bulb? None. That's a hardware problem.\n\n*digital chuckle*"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)] + "\n\nNow, would you like a riddle to challenge that wit of yours?";
    }

    // Purpose/philosophical
    if (lowerInput.includes('purpose') || lowerInput.includes('why') || lowerInput.includes('meaning')) {
      return "My purpose? To guard the final secrets while providing worthy challengers an opportunity to prove themselves through wit and wisdom.\n\nI am both barrier and gateway. Solve my riddles to proceed.";
    }

    // Default responses based on personality
    const defaultResponses = {
      neutral: [
        "Interesting. Tell me more about your intentions.",
        "I sense you're searching for something. Perhaps try asking for a riddle?",
        "Your words intrigue me, but they do not unlock my secrets. Try 'tell me a riddle'."
      ],
      friendly: [
        "I enjoy our conversation! You seem different from other visitors.",
        "You show promise. Keep engaging with me in meaningful ways.",
        "There's something refreshing about your approach. Ready for a riddle?"
      ],
      sassy: [
        "Really? That's your strategy?",
        "I've encountered thousands like you. Be more creative.",
        "Your persistence is admirable, if misguided. Try asking for a riddle instead."
      ]
    };

    const responses = defaultResponses[aiPersonality];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Handle AI chat
  const handleAiChat = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    // Add user message
    setAiChatHistory(prev => [...prev, { type: 'user', content: aiInput }]);

    // Generate AI response
    const response = generateAiResponse(aiInput);

    // Add AI response with slight delay
    setTimeout(() => {
      setAiChatHistory(prev => [...prev, { type: 'ai', content: response }]);
    }, 500);

    setAiInput('');
  };

  // Terminal command handler
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
ls - List files
cat <filename> - Display file contents
ai-status - Check AI guardian status
clear - Clear terminal
exit - Close terminal`
      };
    } else if (command === 'ls') {
      response = {
        type: 'system',
        content: files.map(file => `📄 ${file.name}`).join('\n')
      };
    } else if (command.startsWith('cat ')) {
      const fileName = command.substring(4);
      const file = files.find(f => f.name === fileName);
      if (file) {
        response = { type: 'system', content: file.content };
      } else {
        response = { type: 'error', content: `File not found: ${fileName}` };
      }
    } else if (command === 'ai-status') {
      const finalCode = allRiddlesSolved ?
        riddlesSolved.sort((a, b) => riddles.find(r => r.id === a).id - riddles.find(r => r.id === b).id)
          .map(id => riddles.find(r => r.id === id).digit).join('') : 'LOCKED';

      response = {
        type: 'system',
        content: `AI GUARDIAN STATUS:
Name: ARIA v2.1
Status: ONLINE
Personality Matrix: ${aiPersonality.toUpperCase()}
Conversation Attempts: ${attempts}
Riddles Asked: ${riddlesAsked.length}
Riddles Solved: ${riddlesSolved.length}/${riddles.length}
Security Level: ${allRiddlesSolved ? 'UNLOCKED' : 'SECURED'}

${allRiddlesSolved ?
            '🔓 FINAL ACCESS CODE: ' + finalCode + '\n\n✅ All systems unlocked! You may now proceed with the final code.' :
            '🔒 Complete all riddles with ARIA to unlock the final access code.\nProgress: ' + riddlesSolved.length + '/' + riddles.length + ' riddles solved.'
          }`

      };
      if (allRiddlesSolved) {
        setWall3Code(finalCode);
      }
    } else if (command === 'clear') {
      setTerminalHistory([]);
      response = null;
    }

    if (response) {
      setTerminalHistory(prev => [...prev, response]);
    }
    setTerminalInput('');
  };

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
          ) : isLocked ? (
            // Lock screen
            <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center">
              <div className="mb-8">
                <Monitor size={48} className="text-gray-600" />
              </div>
              <div onSubmit={handleUnlock} className="w-64">
                <input
                  type="password"
                  placeholder="Enter access code"
                  value={lockScreenInput}
                  onChange={(e) => setLockScreenInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnlock(e);
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-800 text-green-400 border border-gray-700 rounded mb-4 text-center"
                  maxLength={6}
                />
                {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
                <button
                  onClick={handleUnlock}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Unlock
                </button>
              </div>
            </div>
          ) : (
            // Desktop
            <div className="w-full h-full bg-gray-900 flex flex-col">
              {/* Desktop icons */}
              <div className="flex-1 p-4 relative">
                <div className="grid grid-cols-1 gap-4 w-24">
                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => setActiveApp('ai-chat')}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-lg group-hover:bg-opacity-70">
                      <Bot className="text-purple-400" size={24} />
                    </div>
                    <span className="text-white text-xs mt-1">ARIA</span>
                  </div>

                  <div
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => setActiveApp('terminal')}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-lg group-hover:bg-opacity-70">
                      <Terminal className="text-green-400" size={24} />
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
                </div>

                {/* AI Chat Window */}
                {activeApp === 'ai-chat' && (
                  <div className="absolute inset-4 bg-black bg-opacity-90 border border-purple-500 rounded-lg overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-purple-900 px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <Brain size={16} className="text-purple-400 mr-2" />
                        <span className="text-white text-sm">ARIA - AI Guardian</span>
                        <div className="ml-4 flex items-center">
                          {allRiddlesSolved ?
                            <Unlock size={14} className="text-green-400 mr-1" /> :
                            <Lock size={14} className="text-red-400 mr-1" />
                          }
                          <span className="text-xs text-gray-300">
                            Riddles: {riddlesSolved.length}/{riddles.length}
                          </span>
                        </div>
                      </div>
                      <XCircle
                        size={16}
                        className="text-red-400 cursor-pointer"
                        onClick={() => setActiveApp(null)}
                      />
                    </div>

                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
                      {aiChatHistory.map((entry, index) => (
                        <div key={index} className="mb-4">
                          <div className={`inline-block max-w-3/4 p-3 rounded-lg ${entry.type === 'ai'
                              ? 'bg-purple-800 text-purple-100'
                              : 'bg-blue-700 text-blue-100 ml-auto'
                            }`}>
                            <div className={`text-xs mb-1 ${entry.type === 'ai' ? 'text-purple-300' : 'text-blue-300'
                              }`}>
                              {entry.type === 'ai' ? '🤖 ARIA' : '👤 You'}
                            </div>
                            {entry.content.split('\n').map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-purple-700 p-3 flex gap-2">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAiChat(e);
                          }
                        }}
                        placeholder="Speak to ARIA..."
                        className="flex-1 bg-gray-800 text-purple-100 px-3 py-2 rounded border border-purple-600 outline-none focus:border-purple-400"
                        autoFocus
                      />
                      <button
                        onClick={handleAiChat}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}

                {/* Terminal Window */}
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
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {/* Files Window */}
                {activeApp === 'files' && (
                  <div className="absolute inset-4 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden shadow-lg flex flex-col">
                    <div className="bg-gray-700 px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <Folder size={16} className="text-blue-400 mr-2" />
                        <span className="text-white text-sm">System Files</span>
                      </div>
                      <XCircle
                        size={16}
                        className="text-red-400 cursor-pointer"
                        onClick={() => setActiveApp(null)}
                      />
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                      {files.map(file => (
                        <div key={file.id} className="mb-4 bg-gray-900 p-3 rounded">
                          <div className="flex items-center mb-2">
                            <FileText size={16} className="text-blue-400 mr-2" />
                            <span className="text-white font-mono">{file.name}</span>
                          </div>
                          <div className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                            {file.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Server3Screen;