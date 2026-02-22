import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import type { Puzzle } from '../types/puzzle'
import { loadPositionFromFen } from '../utils/fenUtils'
import './Puzzle.css'

interface PuzzleProps {
  /** Задача для отображения */
  puzzle: Puzzle
  /** Колбэк при завершении решения (пока не используется) */
  onSolve?: (isCorrect: boolean) => void
}

/**
 * Компонент для отображения шахматной задачи с доской
 */
export function Puzzle({ puzzle }: PuzzleProps) {
  const [game, setGame] = useState(() => {
    const initialGame = loadPositionFromFen(puzzle.fen)
    return initialGame || new Chess()
  })

  /**
   * Выполняет ход в шахматной партии
   */
  function makeAMove(move: { from: string; to: string; promotion?: string }): boolean {
    const gameCopy = new Chess(game.fen())
    
    try {
      gameCopy.move(move)
      setGame(gameCopy)
      return true
    } catch (e) {
      console.log('Invalid move:', e)
      return false
    }
  }

  /**
   * Обработка события перетаскивания фигуры
   */
  function onDrop(sourceSquare: string, targetSquare: string): boolean {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Всегда превращаем в ферзя для упрощения
    })
    
    return move
  }

  /**
   * Получает инструкцию для задачи в зависимости от типа
   */
  function getInstruction(): string {
    switch (puzzle.type) {
      case 'field':
        return puzzle.instruction
      case 'move':
        return puzzle.instruction
      case 'sequence':
        return puzzle.instruction || 'Найдите последовательность ходов'
      case 'lichess':
        return 'Найдите лучший ход'
      default:
        return 'Решите задачу'
    }
  }

  /**
   * Сбрасывает позицию к исходному состоянию задачи
   */
  function resetPosition() {
    const initialGame = loadPositionFromFen(puzzle.fen)
    if (initialGame) {
      setGame(initialGame)
    }
  }

  return (
    <div className="puzzle">
      <div className="puzzle-header">
        <h2 className="puzzle-title">Задача {puzzle.id}</h2>
        {puzzle.difficulty && (
          <span className={`puzzle-difficulty puzzle-difficulty--${puzzle.difficulty}`}>
            {puzzle.difficulty}
          </span>
        )}
        {puzzle.rating && (
          <span className="puzzle-rating">Рейтинг: {puzzle.rating}</span>
        )}
      </div>

      <div className="puzzle-instruction">
        <p>{getInstruction()}</p>
      </div>

      <div className="puzzle-board-container">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={480}
        />
      </div>

      <div className="puzzle-controls">
        <button 
          className="puzzle-button puzzle-button--reset"
          onClick={resetPosition}
        >
          Сбросить позицию
        </button>
      </div>

      {puzzle.themes && puzzle.themes.length > 0 && (
        <div className="puzzle-themes">
          <span className="puzzle-themes-label">Темы:</span>
          <ul className="puzzle-themes-list">
            {puzzle.themes.map((theme, index) => (
              <li key={index} className="puzzle-theme">{theme}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}