import { Puzzle } from './components/Puzzle'
import { StatisticsProvider } from './hooks'
import type { Puzzle as PuzzleType } from './types/puzzle'
import './App.css'

// Пример задачи для демонстрации (тип "move")
const examplePuzzle: PuzzleType = {
  id: 'move-001',
  type: 'move',
  fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3',
  instruction: 'Найдите лучший ход для белых',
  answer: {
    moves: ['c4f7'],
    allowAlternatives: false,
  },
  themes: ['tactics', 'fork', 'knight'],
  difficulty: 'intermediate',
  rating: 1400,
}

function App() {
  return (
    <StatisticsProvider>
      <div className="app">
        <h1>Шахматный тренажер</h1>
        <Puzzle puzzle={examplePuzzle} />
      </div>
    </StatisticsProvider>
  )
}

export default App
