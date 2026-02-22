import { useState, useEffect, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Puzzle } from './Puzzle'
import { useSaveAttempt } from '../hooks'
import type { Puzzle as PuzzleType } from '../types/puzzle'
import './PuzzleContainer.css'

interface PuzzleContainerProps {
  /** Текущая задача */
  puzzle: PuzzleType
  /** Список всех задач для навигации */
  puzzles: PuzzleType[]
  /** Переход к списку задач */
  onBackToList: () => void
  /** Выбор другой задачи */
  onSelectPuzzle: (puzzle: PuzzleType) => void
}

/**
 * Контейнер задачи с таймером и навигацией
 */
export function PuzzleContainer({
  puzzle,
  puzzles,
  onBackToList,
  onSelectPuzzle,
}: PuzzleContainerProps) {
  const [startTime, setStartTime] = useState(() => Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)
  const [resetKey, setResetKey] = useState(0)

  const saveAttempt = useSaveAttempt()

  // Находим индекс текущей задачи
  const currentIndex = puzzles.findIndex((p) => p.id === puzzle.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < puzzles.length - 1

  // Таймер
  useEffect(() => {
    if (isComplete) return

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 100)

    return () => clearInterval(interval)
  }, [startTime, isComplete])

  // Форматирование времени
  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const tenths = Math.floor((ms % 1000) / 100)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${tenths}`
  }

  // Обработка завершения решения
  const handleSolve = useCallback(
    (isCorrect: boolean) => {
      if (isComplete) return

      const timeSpent = Date.now() - startTime
      setIsComplete(true)
      setResult(isCorrect ? 'correct' : 'incorrect')
      setElapsedTime(timeSpent)

      // Сохраняем попытку
      saveAttempt({
        puzzleId: puzzle.id,
        puzzleType: puzzle.type,
        answer: '',
        isCorrect,
        timeSpent,
        timestamp: Date.now(),
      })

      // Автопереход к следующей задаче при правильном ответе
      if (isCorrect && hasNext) {
        setTimeout(() => {
          onSelectPuzzle(puzzles[currentIndex + 1])
        }, 2000)
      }
    },
    [isComplete, startTime, puzzle.id, puzzle.type, saveAttempt, hasNext, currentIndex, puzzles, onSelectPuzzle]
  )

  // Переход к следующей задаче
  function goToNext() {
    if (hasNext) {
      onSelectPuzzle(puzzles[currentIndex + 1])
    }
  }

  // Переход к предыдущей задаче
  function goToPrevious() {
    if (hasPrevious) {
      onSelectPuzzle(puzzles[currentIndex - 1])
    }
  }

  // Повторить текущую задачу
  function retryPuzzle() {
    setStartTime(Date.now())
    setElapsedTime(0)
    setIsComplete(false)
    setResult(null)
    setResetKey(prev => prev + 1)
  }

  // Получение подсказки о стороне хода
  function getTurnHint(): string {
    try {
      const chess = new Chess(puzzle.fen)
      const turn = chess.turn()
      return turn === 'w' ? 'Ход белых' : 'Ход чёрных'
    } catch {
      return ''
    }
  }

  return (
    <div className="puzzle-container">
      {/* Шапка с навигацией */}
      <div className="puzzle-container__header">
        <button
          className="puzzle-container__nav-btn"
          onClick={onBackToList}
        >
          ← К списку
        </button>

        <div className="puzzle-container__progress">
          Задача {currentIndex + 1} из {puzzles.length}
        </div>

        <div className="puzzle-container__timer">
          ⏱️ {formatTime(elapsedTime)}
        </div>
      </div>

      {/* Подсказка о стороне хода */}
      <div className="puzzle-container__turn-hint">
        {getTurnHint()}
      </div>

      {/* Компонент задачи */}
      <Puzzle puzzle={puzzle} onSolve={handleSolve} resetKey={resetKey} />

      {/* Результат решения */}
      {isComplete && result && (
        <div className={`puzzle-container__result puzzle-container__result--${result}`}>
          <div className="puzzle-container__result-message">
            {result === 'correct' ? '🎉 Правильно!' : '😕 Неправильно'}
          </div>
          <div className="puzzle-container__result-time">
            Время: {formatTime(elapsedTime)}
          </div>
        </div>
      )}

      {/* Навигация */}
      <div className="puzzle-container__navigation">
        <button
          className="puzzle-container__nav-btn puzzle-container__nav-btn--secondary"
          onClick={goToPrevious}
          disabled={!hasPrevious}
        >
          ← Предыдущая
        </button>

        {isComplete && (
          <button
            className="puzzle-container__nav-btn puzzle-container__nav-btn--retry"
            onClick={retryPuzzle}
          >
            🔄 Повторить
          </button>
        )}

        <button
          className="puzzle-container__nav-btn"
          onClick={goToNext}
          disabled={!hasNext}
        >
          Следующая →
        </button>
      </div>
    </div>
  )
}
