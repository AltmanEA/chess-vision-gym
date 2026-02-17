import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { validateFen, loadPositionFromFen, setInitialPosition } from './utils/fenUtils'
import './App.css'

function App() {
  const [fen, setFen] = useState('')
  const [game, setGame] = useState(setInitialPosition())

  function makeAMove(move: { from: string; to: string; promotion?: string }) {
    const gameCopy = new Chess(game.fen())
    
    try {
      gameCopy.move(move)
      setGame(gameCopy)
    } catch (e) {
      console.log('Invalid move:', e)
      return false
    }
    return true
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    })
    
    return move
  }

  return (
    <div className="app">
      <h1>Шахматный тренажер</h1>
      <div>
        <input 
          type="text" 
          value={fen} 
          onChange={(e) => setFen(e.target.value)} 
          placeholder="Введите FEN позицию"
        />
        <button onClick={() => {
          if (validateFen(fen)) {
            const newGame = loadPositionFromFen(fen);
            if (newGame) {
              setGame(newGame);
            }
          } else {
            alert('Некорректная FEN позиция');
          }
        }}>
          Загрузить позицию
        </button>
      </div>
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
      />
    </div>
  )
}

export default App
