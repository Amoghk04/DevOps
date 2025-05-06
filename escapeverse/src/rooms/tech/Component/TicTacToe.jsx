import { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import qTable from '../AI/tic_tac_toe.json';

const TicTacToe = ({ onClose, onWin }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true); // User is 'X', goes first
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!xIsNext && !winner) {
      const aiMove = getBestMove(board);
      if (aiMove !== null) {
        makeMove(aiMove);
      }
    }
  }, [xIsNext, board, winner]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const makeMove = (i) => {
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    }
  };

  const handleClick = (i) => {
    if (winner || board[i]) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === 'X') {  // Assuming player is X
        onWin();
      }
    }
  };

  const getBestMove = (currentBoard) => {
    const stateKey = currentBoard.map(cell => cell || ' ').join('');
    const qValues = qTable[stateKey];
    if (!qValues) return getRandomEmptyCell(currentBoard);

    let maxQ = -Infinity;
    let bestMove = null;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null && qValues[i] !== undefined) {
        if (qValues[i] > maxQ) {
          maxQ = qValues[i];
          bestMove = i;
        }
      }
    }
    return bestMove !== null ? bestMove : getRandomEmptyCell(currentBoard);
  };

  const getRandomEmptyCell = (board) => {
    const emptyCells = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
  };

  const renderSquare = (i) => (
    <button
      className={`w-16 h-16 border border-gray-600 flex items-center justify-center text-2xl font-bold
        ${board[i] === 'X' ? 'text-blue-400' : 'text-red-400'}
        hover:bg-gray-800 transition-colors`}
      onClick={() => handleClick(i)}
    >
      {board[i]}
    </button>
  );

  const status = winner
    ? `Winner: ${winner}`
    : board.every(square => square)
    ? "Game Draw!"
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="absolute inset-4 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg flex flex-col">
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-white text-sm">Tic Tac Toe</span>
        </div>
        <XCircle 
          size={16} 
          className="text-red-400 cursor-pointer" 
          onClick={onClose}
        />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-4 text-green-400 text-lg">{status}</div>
        
        <div className="grid grid-rows-3 gap-1 bg-gray-700 p-1 rounded">
          {[0, 1, 2].map(row => (
            <div key={row} className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map(col => (
                <div key={col}>
                  {renderSquare(row * 3 + col)}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <button
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default TicTacToe;
