# Формат хранения задач Chess Vision Gym

## Обзор

Chess Vision Gym использует JSON-формат для хранения шахматных задач с поддержкой четырёх типов задач. Формат основан на TypeScript discriminated unions, что обеспечивает строгую типизацию и безопасность.

## Типы задач

### 1. Field (Нахождение поля)

Задача на нахождение нужного поля на доске.

**Пример:** "Где находится чёрный король?"

```json
{
  "id": "field-001",
  "type": "field",
  "fen": "r1r3k1/ppq3bQ/4p2p/4n3/3p4/2P5/PBB2PPP/4R1K1 b - - 0 1",
  "instruction": "Где находится чёрный король?",
  "answer": {
    "field": "g8"
  },
  "themes": ["pieceLocation", "kingSafety"],
  "difficulty": "beginner",
  "rating": 800,
  "hints": ["Король на последней горизонтали", "На g-линии"]
}
```

### 2. Move (Нахождение хода)

Задача на нахождение лучшего хода.

**Пример:** "Найдите лучший ход для белых"

```json
{
  "id": "move-001",
  "type": "move",
  "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 3",
  "instruction": "Найдите лучший ход для белых",
  "answer": {
    "moves": ["c4f7"],
    "allowAlternatives": false
  },
  "themes": ["tactics", "fork", "knight"],
  "difficulty": "intermediate",
  "rating": 1400
}
```

### 3. Sequence (Последовательность ходов)

Задача на нахождение последовательности ходов.

**Пример:** "Найдите мат в 3 хода"

```json
{
  "id": "sequence-001",
  "type": "sequence",
  "fen": "r1r3k1/ppq3bQ/4p2p/4n3/3p4/2P5/PBB2PPP/4R1K1 b - - 0 1",
  "instruction": "Найдите мат в 3 хода",
  "answer": {
    "moves": ["g8f8", "b2a3", "f8f7", "c2d1", "c8h8", "d1h5", "f7f6", "h7e4"],
    "includeOpponentMoves": true
  },
  "themes": ["tactics", "mate", "attack"],
  "difficulty": "advanced",
  "rating": 2000
}
```

### 4. Lichess (Импорт из Lichess)

Задача в формате Lichess для импорта из Lichess CSV.

```json
{
  "id": "lichess-005yO",
  "type": "lichess",
  "puzzleId": "005yO",
  "fen": "r1r3k1/ppq3bQ/4p2p/4n3/3p4/2P5/PBB2PPP/4R1K1 b - - 0 1",
  "answer": {
    "moves": ["g8f8", "b2a3", "f8f7", "c2d1", "c8h8", "d1h5", "f7f6", "h7e4"]
  },
  "rating": 2789,
  "ratingDeviation": 98,
  "popularity": 87,
  "nbPlays": 187,
  "gameUrl": "https://lichess.org/j65YI8hC/black#48",
  "themes": ["advantage", "exposedKing", "middlegame", "quietMove"]
}
```

## Общие поля

Все типы задач имеют следующие общие поля:

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `id` | `string` | ✅ | Уникальный идентификатор задачи |
| `type` | `string` | ✅ | Тип задачи (`field` | `move` | `sequence` | `lichess`) |
| `fen` | `string` | ✅ | Позиция в формате FEN |
| `themes` | `string[]` | ❌ | Темы задачи для категоризации |
| `difficulty` | `string` | ❌ | Уровень сложности (`beginner` | `intermediate` | `advanced` | `expert`) |
| `rating` | `number` | ❌ | Числовой рейтинг сложности |
| `hints` | `string[]` | ❌ | Подсказки для пользователя |
| `metadata` | `object` | ❌ | Дополнительные метаданные |

## Специфические поля

### Field

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `instruction` | `string` | ✅ | Инструкция для пользователя |
| `answer.field` | `string` | ✅ | Координаты поля (например, "g8", "e4") |

### Move

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `instruction` | `string` | ✅ | Инструкция для пользователя |
| `answer.moves` | `string[]` | ✅ | Список правильных ходов в UCI формате |
| `answer.allowAlternatives` | `boolean` | ❌ | Разрешены ли альтернативные правильные ходы |

### Sequence

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `instruction` | `string` | ❌ | Инструкция для пользователя |
| `answer.moves` | `string[]` | ✅ | Полная последовательность ходов в UCI формате |
| `answer.includeOpponentMoves` | `boolean` | ❌ | Включает ли последовательность ходы противника |

### Lichess

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `puzzleId` | `string` | ✅ | Идентификатор задачи на Lichess |
| `answer.moves` | `string[]` | ✅ | Последовательность ходов, начиная с хода противника |
| `rating` | `number` | ✅ | Рейтинг задачи (обязательное поле для Lichess) |
| `ratingDeviation` | `number` | ❌ | Отклонение рейтинга |
| `popularity` | `number` | ❌ | Популярность (-100 до 100) |
| `nbPlays` | `number` | ❌ | Количество решений на Lichess |
| `gameUrl` | `string` | ❌ | Ссылка на оригинальную партию |

## Формат коллекции задач

```json
{
  "name": "Название коллекции",
  "description": "Описание коллекции",
  "version": "1.0.0",
  "puzzles": [
    // ... задачи
  ]
}
```

## Импорт из Lichess CSV

Lichess предоставляет задачи в формате CSV:

```
PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl
005yO,r1r3k1/ppq3bQ/4p2p/4n3/3p4/2P5/PBB2PPP/4R1K1 b...,g8f8 b2a3 f8f7 c2d1 c8h8 d1h5 f7f6 h7e4,2789.0,98.0,87.0,187.0,advantage exposedKing...,https://lichess.org/j65YI8hC/black#48
```

Для конвертации используйте утилиту `convertLichessCsvToPuzzle()` из `src/utils/puzzleUtils.ts`.

## Использование в коде

```typescript
import type { Puzzle, PuzzleCollection } from '../types/puzzle';
import { validatePuzzle, checkAnswer } from '../utils/puzzleUtils';

// Загрузка коллекции
const collection: PuzzleCollection = require('./puzzles/examples.json');

// Валидация задачи
const validation = validatePuzzle(collection.puzzles[0]);
if (!validation.valid) {
  console.error('Ошибки валидации:', validation.errors);
}

// Проверка ответа
const isCorrect = checkAnswer(puzzle, userAnswer);
```

## Примеры задач

Примеры задач всех типов находятся в файле `public/puzzles/examples.json`.

## Уровни сложности

| Уровень | Рейтинг | Описание |
|---------|---------|----------|
| `beginner` | < 1000 | Начинающий |
| `intermediate` | 1000-1399 | Средний |
| `advanced` | 1400-1799 | Продвинутый |
| `expert` | ≥ 1800 | Эксперт |

## Темы задач

Рекомендуемые темы для категоризации задач:

- **Тактика**: `tactics`, `fork`, `pin`, `skewer`, `discovery`, `mateInOne`, `mateInTwo`, `mateInThree`
- **Стратегия**: `positional`, `pawnStructure`, `pieceActivity`, `openFiles`, `outpost`
- **Дебют**: `opening`, `development`, `centerControl`
- **Эндшпиль**: `endgame`, `pawnEnding`, `rookEnding`, `kingActivity`
- **Обучение**: `pieceLocation`, `kingSafety`, `weakSquares`, `attack`, `defense`
- **Lichess**: `advantage`, `short`, `long`, `quietMove`, `force`, `crushing`, `equality`

## Формат UCI для ходов

Ходы записываются в UCI формате:
- `e2e4` — пешка e2 на e4
- `g1f3` — конь g1 на f3
- `e7e8q` — превращение пешки e7 в ферзя

## Валидация

Используйте функции валидации из `src/utils/puzzleUtils.ts`:

- `validateFen(fen)` — проверка FEN
- `validateUciMove(move)` — проверка хода в UCI формате
- `validateField(field)` — проверка координат поля
- `validatePuzzle(puzzle)` — полная валидация задачи
- `validatePuzzleCollection(collection)` — валидация коллекции
