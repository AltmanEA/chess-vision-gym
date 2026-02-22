import { useGlobalStats, useStatsByType, useAttempts } from '../hooks'
import './StatisticsScreen.css'

interface StatisticsScreenProps {
  /** Возврат к списку задач */
  onBack: () => void
}

/**
 * Экран статистики
 */
export function StatisticsScreen({ onBack }: StatisticsScreenProps) {
  const globalStats = useGlobalStats()
  const statsByType = useStatsByType()
  const { attempts } = useAttempts()

  // Форматирование времени (мс → мин:сек)
  function formatTime(ms: number): string {
    if (ms === 0) return '—'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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

  // Последние попытки (последние 10)
  const recentAttempts = [...attempts]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)

  return (
    <div className="statistics-screen">
      <div className="statistics-screen__header">
        <h2 className="statistics-screen__title">📊 Статистика</h2>
        <button className="statistics-screen__back-btn" onClick={onBack}>
          ← К задачам
        </button>
      </div>

      {/* Глобальная статистика */}
      <section className="statistics-section">
        <h3 className="statistics-section__title">Общая статистика</h3>
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-card__value">{globalStats.totalAttempts}</div>
            <div className="stat-card__label">Всего попыток</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{globalStats.accuracy.toFixed(1)}%</div>
            <div className="stat-card__label">Точность</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{globalStats.correctAttempts}</div>
            <div className="stat-card__label">Правильных ответов</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{globalStats.totalAttempts - globalStats.correctAttempts}</div>
            <div className="stat-card__label">Неправильных ответов</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatTime(globalStats.averageTime)}</div>
            <div className="stat-card__label">Среднее время</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{globalStats.uniquePuzzlesSolved}</div>
            <div className="stat-card__label">Решено уникальных задач</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{globalStats.uniquePuzzlesSolved}</div>
            <div className="stat-card__label">Уникальных задач решено</div>
          </div>
        </div>
      </section>

      {/* Статистика по типам */}
      <section className="statistics-section">
        <h3 className="statistics-section__title">По типам задач</h3>
        <div className="type-stats">
          {statsByType.map((stat) => (
            <div key={stat.type} className="type-stat-card">
              <div className="type-stat-card__header">
                <span className="type-stat-card__name">{formatType(stat.type)}</span>
                <span className="type-stat-card__accuracy">{stat.accuracy.toFixed(0)}%</span>
              </div>
              <div className="type-stat-card__details">
                <div className="type-stat-card__row">
                  <span>Попыток:</span>
                  <span>{stat.totalAttempts}</span>
                </div>
                <div className="type-stat-card__row">
                  <span>Правильно:</span>
                  <span>{stat.correctAttempts}</span>
                </div>
                <div className="type-stat-card__row">
                  <span>Среднее время:</span>
                  <span>{formatTime(stat.averageTime)}</span>
                </div>
                <div className="type-stat-card__row">
                  <span>Решено задач:</span>
                  <span>{stat.uniquePuzzlesSolved}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Последние попытки */}
      <section className="statistics-section">
        <h3 className="statistics-section__title">Последние попытки</h3>
        {recentAttempts.length > 0 ? (
          <div className="attempts-table-container">
            <table className="attempts-table">
              <thead>
                <tr>
                  <th>Задача</th>
                  <th>Тип</th>
                  <th>Результат</th>
                  <th>Время</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>{attempt.puzzleId}</td>
                    <td>{formatType(attempt.puzzleType)}</td>
                    <td>
                      <span className={`attempt-result ${attempt.isCorrect ? 'attempt-result--correct' : 'attempt-result--incorrect'}`}>
                        {attempt.isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                      </span>
                    </td>
                    <td>{formatTime(attempt.timeSpent)}</td>
                    <td>{new Date(attempt.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="statistics-empty">Пока нет попыток решения задач</div>
        )}
      </section>
    </div>
  )
}
