# Формат хранения статистики Chess Vision Gym

## Обзор

Статистика пользователя хранится в `localStorage` браузера в формате JSON. Все данные сохраняются автоматически после каждой попытки решения задачи.

## Структура данных

### Попытка пользователя (UserAttempt)

Каждая попытка решения задачи записывается как отдельный объект:

```typescript
interface UserAttempt {
  id: string;           // Уникальный ID попытки (timestamp)
  puzzleId: string;     // ID задачи
  puzzleType: string;   // Тип задачи (field | move | sequence | lichess)
  answer: string | string[];  // Ответ пользователя
  isCorrect: boolean;   // Правильность ответа
  timeSpent: number;    // Время решения (миллисекунды)
  timestamp: number;    // Время попытки (timestamp)
}
```

### Пример попытки

```json
{
  "id": "1735843200000",
  "puzzleId": "field-001",
  "puzzleType": "field",
  "answer": "g8",
  "isCorrect": true,
  "timeSpent": 3245,
  "timestamp": 1735843200000
}
```

### Хранение в localStorage

Данные хранятся под ключом `chess-vision-gym:attempts`:

```json
{
  "attempts": [
    { /* UserAttempt */ },
    { /* UserAttempt */ },
    // ...
  ],
  "version": "1.0.0"
}
```

## Статистические данные

### Статистика по задаче (PuzzleStatistics)

```typescript
interface PuzzleStatistics {
  puzzleId: string;        // ID задачи
  totalAttempts: number;   // Общее количество попыток
  correctAttempts: number; // Количество правильных решений
  accuracy: number;        // Точность в процентах (0-100)
  averageTime: number;     // Среднее время решения (мс)
  bestTime: number | null; // Лучшее время среди правильных решений (мс)
  lastAttemptAt: number;   // Время последней попытки (timestamp)
  isSolved: boolean;       // Была ли задача решена хотя бы раз
}
```

### Глобальная статистика (GlobalStatistics)

```typescript
interface GlobalStatistics {
  totalAttempts: number;      // Общее количество попыток
  correctAttempts: number;    // Общее количество правильных решений
  accuracy: number;           // Общая точность в процентах (0-100)
  averageTime: number;        // Среднее время решения (мс)
  uniquePuzzlesSolved: number;// Количество уникальных решённых задач
  lastAttemptAt: number;      // Время последней попытки (timestamp)
}
```

### Статистика по типам задач (TypeStatistics)

```typescript
interface TypeStatistics {
  type: string;              // Тип задачи
  totalAttempts: number;     // Общее количество попыток
  correctAttempts: number;   // Количество правильных решений
  accuracy: number;          // Точность в процентах (0-100)
  averageTime: number;       // Среднее время решения (мс)
  uniquePuzzlesSolved: number;// Количество уникальных решённых задач
  lastAttemptAt: number;     // Время последней попытки (timestamp)
}
```

## React хуки

### useSaveAttempt()

Хук для сохранения попытки пользователя.

```typescript
const saveAttempt = useSaveAttempt();

// Сохранение попытки
saveAttempt({
  puzzleId: 'field-001',
  puzzleType: 'field',
  answer: 'g8',
  isCorrect: true,
  timeSpent: 3245,
  timestamp: Date.now()
});
```

### useAttempts(puzzleId?)

Хук для получения списка попыток.

```typescript
// Все попытки
const { attempts, refreshAttempts } = useAttempts();

// Попытки по конкретной задаче
const { attempts, refreshAttempts } = useAttempts('field-001');
```

### usePuzzleStats(puzzleId)

Хук для получения статистики по конкретной задаче.

```typescript
const stats = usePuzzleStats('field-001');

console.log(stats);
// {
//   puzzleId: 'field-001',
//   totalAttempts: 5,
//   correctAttempts: 3,
//   accuracy: 60,
//   averageTime: 4123,
//   bestTime: 2856,
//   lastAttemptAt: 1735843200000,
//   isSolved: true
// }
```

### useGlobalStats()

Хук для получения глобальной статистики.

```typescript
const stats = useGlobalStats();

console.log(stats);
// {
//   totalAttempts: 50,
//   correctAttempts: 35,
//   accuracy: 70,
//   averageTime: 3890,
//   uniquePuzzlesSolved: 20,
//   lastAttemptAt: 1735843200000
// }
```

### useStatsByType()

Хук для получения статистики по типам задач.

```typescript
const statsByType = useStatsByType();

console.log(statsByType);
// [
//   {
//     type: 'field',
//     totalAttempts: 15,
//     correctAttempts: 12,
//     accuracy: 80,
//     averageTime: 2150,
//     uniquePuzzlesSolved: 8,
//     lastAttemptAt: 1735843200000
//   },
//   // ...
// ]
```

### useClearAttempts()

Хук для очистки всех попыток.

```typescript
const clearAllAttempts = useClearAttempts();

const success = clearAllAttempts(); // возвращает boolean
```

### useClearPuzzleAttempts()

Хук для очистки попыток по конкретной задаче.

```typescript
const clearPuzzleAttempts = useClearPuzzleAttempts();

const success = clearPuzzleAttempts('field-001'); // возвращает boolean
```

## Provider

Для работы хуков необходимо обернуть приложение в `StatisticsProvider`:

```tsx
import { StatisticsProvider } from './hooks';

function App() {
  return (
    <StatisticsProvider>
      <YourApp />
    </StatisticsProvider>
  );
}
```

## Сервисы

### storageService

Низкоуровневый сервис для работы с `localStorage`:

```typescript
import {
  saveAttempt,
  getAttempts,
  clearAttempts,
  clearAttemptsByPuzzleId
} from './services/storageService';

// Сохранить попытку
const success = saveAttempt(attempt);

// Получить все попытки
const attempts = getAttempts();

// Очистить все попытки
const success = clearAttempts();

// Очистить попытки по задаче
const success = clearAttemptsByPuzzleId('field-001');
```

### statsService

Сервис для вычисления статистики (используется внутри хуков):

```typescript
import {
  calculatePuzzleStats,
  calculateGlobalStats,
  calculateStatsByType
} from './services/statsService';

// Вычислить статистику по задаче
const stats = calculatePuzzleStats(attempts, 'field-001');

// Вычислить глобальную статистику
const stats = calculateGlobalStats(attempts);

// Вычислить статистику по типам
const statsByType = calculateStatsByType(attempts);
```

## Версионирование данных

Формат хранения включает поле `version` для совместимости:

```json
{
  "attempts": [...],
  "version": "1.0.0"
}
```

При изменении формата в будущем необходимо:
1. Увеличить номер версии
2. Добавить логику миграции в `storageService.ts`

## Экспорт и импорт данных

Хотя UI для экспорта/импорта ещё не реализован, данные можно экспортировать вручную через консоль браузера:

```javascript
// Экспорт
const data = localStorage.getItem('chess-vision-gym:attempts');
console.log(data);

// Импорт
localStorage.setItem('chess-vision-gym:attempts', JSON.stringify({...}));
```

## Очистка данных

Для полной очистки данных приложения:

```javascript
localStorage.removeItem('chess-vision-gym:attempts');
```

Или через React хуки:

```typescript
const clearAllAttempts = useClearAttempts();
clearAllAttempts();
```

## Приватность данных

- Все данные хранятся локально в браузере пользователя
- Данные не передаются на сервер
- Данные могут быть очищены пользователем в любой момент
- При использовании режима инкогнито данные удаляются после закрытия браузера

## Метрики

### Время решения

Измеряется в миллисекундах от начала попытки до её завершения.

### Точность (Accuracy)

Процент правильных решений от общего количества попыток:

```
accuracy = (correctAttempts / totalAttempts) * 100
```

### Уникальные задачи

Количество задач, решённых хотя бы раз правильно.

## Пример использования

```tsx
import { usePuzzleStats, useSaveAttempt } from './hooks';

function PuzzleView({ puzzle }) {
  const stats = usePuzzleStats(puzzle.id);
  const saveAttempt = useSaveAttempt();

  const handleAnswer = (answer) => {
    const isCorrect = checkAnswer(puzzle, answer);
    const timeSpent = Date.now() - startTime;

    saveAttempt({
      puzzleId: puzzle.id,
      puzzleType: puzzle.type,
      answer,
      isCorrect,
      timeSpent,
      timestamp: Date.now()
    });
  };

  return (
    <div>
      <h2>{puzzle.instruction}</h2>
      {/* ... */}
      <div className="stats">
        <p>Попыток: {stats.totalAttempts}</p>
        <p>Точность: {stats.accuracy.toFixed(1)}%</p>
        <p>Лучшее время: {stats.bestTime ? `${stats.bestTime}мс` : '-'}</p>
      </div>
    </div>
  );
}
```
