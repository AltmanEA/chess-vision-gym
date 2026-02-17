import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import './App.css'

function App() {
  const [game, setGame] = useState(new Chess())

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
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
      />
    </div>
  )
}

export default App
