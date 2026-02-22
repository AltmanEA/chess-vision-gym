import { useEffect, useState } from 'react'
import type { Puzzle } from '../types/puzzle'
import { useGlobalStats, useAttempts } from '../hooks'
import './PuzzleList.css'

interface PuzzleListProps {
  /** Выбор задачи для решения */
  onSelectPuzzle: (puzzle: Puzzle) => void
  /** Переход к статистике */
  onShowStats: () => void
}

/**
 * Компонент списка задач
 */
export function PuzzleList({ onSelectPuzzle, onShowStats }: PuzzleListProps) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'solved' | 'unsolved'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'field' | 'move' | 'sequence' | 'lichess'>('all')

  const globalStats = useGlobalStats()
  const { attempts: allAttempts } = useAttempts()

  // Загрузка задач
  useEffect(() => {
    let cancelled = false
    
    fetch('/puzzles/examples.json')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setPuzzles(data.puzzles || [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Ошибка загрузки задач: ' + err.message)
          setLoading(false)
        }
      })
    
    return () => { cancelled = true }
  }, [])

  // Получение ID решённых задач
  const solvedPuzzleIds = new Set(
    allAttempts
      .filter((a) => a.isCorrect)
      .map((a) => a.puzzleId)
  )

  // Фильтрация задач
  const filteredPuzzles = puzzles.filter((puzzle) => {
    if (filter === 'solved' && !solvedPuzzleIds.has(puzzle.id)) return false
    if (filter === 'unsolved' && solvedPuzzleIds.has(puzzle.id)) return false
    if (typeFilter !== 'all' && puzzle.type !== typeFilter) return false
    return true
  })

  // Форматирование сложности
  function formatDifficulty(difficulty?: string): string {
    const map: Record<string, string> = {
      beginner: 'Начальный',
      intermediate: 'Средний',
      advanced: 'Продвинутый',
      expert: 'Эксперт',
    }
    return map[difficulty || ''] || difficulty || '—'
  }

  // Форматирование типа задачи
  function formatType(type: string): string {
    const map: Record<string, string> = {
      field: 'Поле',
      move: 'Ход',
      sequence: 'Последовательность',
      lichess: 'Lichess',
    }
    return map[type] || type
  }

  if (loading) {
    return <div className="puzzle-list puzzle-list--loading">Загрузка задач...</div>
  }

  if (error) {
    return <div className="puzzle-list puzzle-list--error">{error}</div>
  }

  return (
    <div className="puzzle-list">
      <div className="puzzle-list__header">
        <h2 className="puzzle-list__title">Доступные задачи</h2>
        <button className="puzzle-list__stats-btn" onClick={onShowStats}>
          📊 Статистика
        </button>
      </div>

      <div className="puzzle-list__summary">
        <div className="puzzle-list__stat">
          <span className="puzzle-list__stat-value">{globalStats.totalAttempts}</span>
          <span className="puzzle-list__stat-label">Попыток</span>
        </div>
        <div className="puzzle-list__stat">
          <span className="puzzle-list__stat-value">{globalStats.accuracy.toFixed(0)}%</span>
          <span className="puzzle-list__stat-label">Точность</span>
        </div>
        <div className="puzzle-list__stat">
          <span className="puzzle-list__stat-value">{solvedPuzzleIds.size}</span>
          <span className="puzzle-list__stat-label">Решено</span>
        </div>
        <div className="puzzle-list__stat">
          <span className="puzzle-list__stat-value">{puzzles.length}</span>
          <span className="puzzle-list__stat-label">Всего</span>
        </div>
      </div>

      <div className="puzzle-list__filters">
        <select
          className="puzzle-list__filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="all">Все задачи</option>
          <option value="solved">Решённые</option>
          <option value="unsolved">Нерешённые</option>
        </select>

        <select
          className="puzzle-list__filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
        >
          <option value="all">Все типы</option>
          <option value="field">Поле</option>
          <option value="move">Ход</option>
          <option value="sequence">Последовательность</option>
          <option value="lichess">Lichess</option>
        </select>
      </div>

      <div className="puzzle-list__grid">
        {filteredPuzzles.map((puzzle) => {
          const isSolved = solvedPuzzleIds.has(puzzle.id)
          return (
            <div
              key={puzzle.id}
              className={`puzzle-card ${isSolved ? 'puzzle-card--solved' : ''}`}
              onClick={() => onSelectPuzzle(puzzle)}
            >
              <div className="puzzle-card__header">
                <span className="puzzle-card__id">{puzzle.id}</span>
                {isSolved && <span className="puzzle-card__badge">✓</span>}
              </div>

              <div className="puzzle-card__type">{formatType(puzzle.type)}</div>

              {puzzle.difficulty && (
                <div className={`puzzle-card__difficulty puzzle-card__difficulty--${puzzle.difficulty}`}>
                  {formatDifficulty(puzzle.difficulty)}
                </div>
              )}

              {puzzle.rating && (
                <div className="puzzle-card__rating">⭐ {puzzle.rating}</div>
              )}

              {puzzle.themes && puzzle.themes.length > 0 && (
                <div className="puzzle-card__themes">
                  {puzzle.themes.slice(0, 3).map((theme) => (
                    <span key={theme} className="puzzle-card__theme">{theme}</span>
                  ))}
                </div>
              )}

              <div className="puzzle-card__instruction">
                {'instruction' in puzzle && puzzle.instruction
                  ? puzzle.instruction.slice(0, 60)
                  : 'Решите задачу'}...
              </div>
            </div>
          )
        })}
      </div>

      {filteredPuzzles.length === 0 && (
        <div className="puzzle-list__empty">
          Нет задач, соответствующих выбранным фильтрам
        </div>
      )}
    </div>
  )
}
