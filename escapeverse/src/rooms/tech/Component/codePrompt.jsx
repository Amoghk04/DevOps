import React, { useState } from 'react';
import { XCircle } from 'lucide-react';

const CodePrompt = ({ isOpen, onClose, onSubmit, correctCode }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === correctCode) {
      onSubmit();
      setCode('');
      setError('');
    } else {
      setError('Invalid access code');
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg border-2 border-green-500 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-green-500 text-xl font-mono">Server Access</h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-green-400 mb-2 font-mono">Enter Access Code:</label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-gray-900 text-green-500 border-2 border-green-500 p-2 rounded font-mono focus:outline-none focus:border-green-400"
              maxLength={6}
              pattern="\d{6}"
              required
              placeholder="******"
            />
          </div>
          {error && <p className="text-red-500 font-mono">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 transition-colors font-mono"
          >
            ACCESS SERVER
          </button>
        </form>
      </div>
    </div>
  );
};

export default CodePrompt;