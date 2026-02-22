import { useState, useEffect } from 'react'
import { PuzzleList, PuzzleContainer, StatisticsScreen } from './components'
import { StatisticsProvider } from './hooks'
import type { Puzzle as PuzzleType } from './types/puzzle'
import './App.css'

type Screen = 'list' | 'puzzle' | 'stats'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list')
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType | null>(null)
  const [puzzles, setPuzzles] = useState<PuzzleType[]>([])

  // Загрузка задач при монтировании
  useEffect(() => {
    fetch('/puzzles/examples.json')
      .then((res) => res.json())
      .then((data) => setPuzzles(data.puzzles || []))
      .catch((err) => console.error('Ошибка загрузки задач:', err))
  }, [])

  // Выбор задачи
  function handleSelectPuzzle(puzzle: PuzzleType) {
    setSelectedPuzzle(puzzle)
    setCurrentScreen('puzzle')
  }

  // Возврат к списку
  function handleBackToList() {
    setCurrentScreen('list')
    setSelectedPuzzle(null)
  }

  // Показать статистику
  function handleShowStats() {
    setCurrentScreen('stats')
  }

  // Рендер текущего экрана
  function renderScreen() {
    switch (currentScreen) {
      case 'list':
        return (
          <PuzzleList
            onSelectPuzzle={handleSelectPuzzle}
            onShowStats={handleShowStats}
          />
        )
      case 'puzzle':
        if (!selectedPuzzle) return null
        return (
          <PuzzleContainer
            key={selectedPuzzle.id}
            puzzle={selectedPuzzle}
            puzzles={puzzles}
            onBackToList={handleBackToList}
            onSelectPuzzle={handleSelectPuzzle}
          />
        )
      case 'stats':
        return <StatisticsScreen onBack={handleBackToList} />
      default:
        return null
    }
  }

  return (
    <StatisticsProvider>
      <div className="app">
        <header className="app__header">
          <h1 className="app__title" onClick={handleBackToList}>
            ♟️ Chess Vision Gym
          </h1>
        </header>
        <main className="app__main">
          {renderScreen()}
        </main>
      </div>
    </StatisticsProvider>
  )
}

export default App
