import { useState, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import type { Puzzle } from '../types/puzzle'
import { loadPositionFromFen } from '../utils/fenUtils'
import { usePuzzleAnswer } from '../hooks'
import { isFieldAnswer, isSequenceAnswer } from '../types/puzzleAnswer'
import './Puzzle.css'

interface PuzzleProps {
  /** Задача для отображения */
  puzzle: Puzzle
  /** Колбэк при завершении решения */
  onSolve?: (isCorrect: boolean) => void
}

/**
 * Компонент для отображения шахматной задачи с доской
 */
export function Puzzle({ puzzle, onSolve }: PuzzleProps) {
  const [game, setGame] = useState(() => {
    const initialGame = loadPositionFromFen(puzzle.fen)
    return initialGame || new Chess()
  })

  // Хук для управления ответами
  const {
    state,
    canSubmit,
    progress,
    selectField,
    makeMove: makeUserMove,
    undoLastAction,
    resetAnswer,
    submitAnswer,
  } = usePuzzleAnswer({ puzzle, onSolve })

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
   * Обработка события клика по полю (для типа field)
   */
  function onSquareClick(square: string) {
    if (state.answer.type === 'field' && !state.isComplete) {
      selectField(square)
    }
  }

  /**
   * Обработка события перетаскивания фигуры
   */
  function onDrop(sourceSquare: string, targetSquare: string): boolean {
    // Если решение завершено, блокируем доску
    if (state.isComplete) {
      return false
    }

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Всегда превращаем в ферзя для упрощения
    })

    if (move && (state.answer.type === 'move' || state.answer.type === 'sequence')) {
      // Формируем UCI ход
      const uciMove = `${sourceSquare}${targetSquare}`
      makeUserMove(uciMove)
    }

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
    resetAnswer()
  }

  /**
   * Формирует стили для выделения выбранного поля
   */
  const customSquareStyles = useMemo(() => {
    if (!isFieldAnswer(state.answer) || !state.answer.value) {
      return {}
    }

    const square = state.answer.value
    return {
      [square]: {
        backgroundColor: state.result === 'correct' ? 'rgba(76, 175, 80, 0.5)' :
                       state.result === 'incorrect' ? 'rgba(244, 67, 54, 0.5)' :
                       'rgba(33, 150, 243, 0.5)',
      },
    }
  }, [state.answer, state.result])

  /**
   * Рендерит UI для ответа пользователя
   */
  function renderAnswerUI() {
    if (state.isComplete) {
      return (
        <div className={`puzzle-result puzzle-result--${state.result}`}>
          {state.result === 'correct' ? '✓ Правильно!' : '✗ Неправильно'}
        </div>
      )
    }

    switch (state.answer.type) {
      case 'field':
        return state.answer.value ? (
          <div className="puzzle-answer-info">
            Выбрано поле: <strong>{state.answer.value}</strong>
          </div>
        ) : null

      case 'move':
        return state.answer.value ? (
          <div className="puzzle-answer-info">
            Ход: <strong>{formatMove(state.answer.value)}</strong>
          </div>
        ) : null

      case 'sequence':
        return state.answer.value.length > 0 ? (
          <div className="puzzle-answer-info">
            <div className="puzzle-progress">
              Ход {progress.current} из {progress.total}
            </div>
            <div className="puzzle-moves-list">
              {state.answer.value.map((move, index) => (
                <span key={index} className="puzzle-move">
                  {formatMove(move)}
                </span>
              ))}
            </div>
          </div>
        ) : null

      default:
        return null
    }
  }

  /**
   * Форматирует ход для отображения
   */
  function formatMove(move: string): string {
    // UCI формат: e2e4 → e2-e4
    if (move.length === 4) {
      return `${move.slice(0, 2)}-${move.slice(2)}`
    }
    return move
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
          onSquareClick={onSquareClick}
          customSquareStyles={customSquareStyles}
          boardWidth={480}
        />
      </div>

      {renderAnswerUI()}

      <div className="puzzle-controls">
        {!state.isComplete && (
          <>
            {isSequenceAnswer(state.answer) && state.answer.value.length > 0 && (
              <button
                className="puzzle-button puzzle-button--undo"
                onClick={undoLastAction}
              >
                Отменить
              </button>
            )}
            {canSubmit && (
              <button
                className="puzzle-button puzzle-button--submit"
                onClick={submitAnswer}
              >
                Подтвердить
              </button>
            )}
          </>
        )}
        <button 
          className="puzzle-button puzzle-button--reset"
          onClick={resetPosition}
        >
          Сбросить
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