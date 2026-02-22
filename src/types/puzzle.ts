/**
 * Типы шахматных задач для тренажера Chess Vision Gym
 */

// Уровни сложности
export type PuzzleDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Базовые поля, общие для всех типов задач
interface BasePuzzle {
  /** Уникальный идентификатор задачи */
  id: string;
  /** Позиция в формате FEN */
  fen: string;
  /** Темы задачи для категоризации */
  themes?: string[];
  /** Уровень сложности */
  difficulty?: PuzzleDifficulty;
  /** Числовой рейтинг сложности */
  rating?: number;
  /** Подсказки для пользователя */
  hints?: string[];
  /** Дополнительные метаданные */
  metadata?: Record<string, unknown>;
}

// ============================================
// Тип 1: Нахождение поля
// ============================================

/**
 * Задача на нахождение нужного поля на доске
 * Пример: "Где находится чёрный король?"
 */
export interface FieldPuzzle extends BasePuzzle {
  type: 'field';
  /** Инструкция для пользователя */
  instruction: string;
  /** Правильный ответ */
  answer: {
    /** Координаты поля (например, "g8", "e4") */
    field: string;
  };
}

// ============================================
// Тип 2: Нахождение хода
// ============================================

/**
 * Задача на нахождение лучшего хода
 * Пример: "Найдите лучший ход для белых"
 */
export interface MovePuzzle extends BasePuzzle {
  type: 'move';
  /** Инструкция для пользователя */
  instruction: string;
  /** Правильный ответ */
  answer: {
    /** Список правильных ходов в UCI формате (например, ["e2e4"]) */
    moves: string[];
    /** Разрешены ли альтернативные правильные ходы */
    allowAlternatives?: boolean;
  };
}

// ============================================
// Тип 3: Последовательность ходов
// ============================================

/**
 * Задача на нахождение последовательности ходов
 * Пример: "Найдите мат в 3 хода"
 */
export interface SequencePuzzle extends BasePuzzle {
  type: 'sequence';
  /** Инструкция для пользователя (опционально) */
  instruction?: string;
  /** Правильный ответ */
  answer: {
    /** Полная последовательность ходов в UCI формате */
    moves: string[];
    /** Включает ли последовательность ходы противника */
    includeOpponentMoves?: boolean;
  };
}

// ============================================
// Тип 4: Lichess-совместимый формат
// ============================================

/**
 * Задача в формате Lichess для импорта из Lichess CSV
 * Пример: импортированная тактическая задача с lichess.org
 */
export interface LichessPuzzle extends BasePuzzle {
  type: 'lichess';
  /** Идентификатор задачи на Lichess */
  puzzleId: string;
  /** Позиция в формате FEN (ДО хода противника) */
  fen: string;
  /** Правильный ответ */
  answer: {
    /** Последовательность ходов, начиная с хода противника */
    moves: string[];
  };
  /** Рейтинг задачи (обязательное поле для Lichess) */
  rating: number;
  /** Отклонение рейтинга */
  ratingDeviation?: number;
  /** Популярность (-100 до 100) */
  popularity?: number;
  /** Количество решений на Lichess */
  nbPlays?: number;
  /** Ссылка на оригинальную партию */
  gameUrl?: string;
}

// ============================================
// Объединённый тип задачи
// ============================================

/**
 * Объединённый тип для всех видов задач
 */
export type Puzzle = FieldPuzzle | MovePuzzle | SequencePuzzle | LichessPuzzle;

// ============================================
// Типы для защиты типов (Type Guards)
// ============================================

/**
 * Проверяет, является ли задача задачей на нахождение поля
 */
export function isFieldPuzzle(puzzle: Puzzle): puzzle is FieldPuzzle {
  return puzzle.type === 'field';
}

/**
 * Проверяет, является ли задача задачей на нахождение хода
 */
export function isMovePuzzle(puzzle: Puzzle): puzzle is MovePuzzle {
  return puzzle.type === 'move';
}

/**
 * Проверяет, является ли задача задачей на последовательность ходов
 */
export function isSequencePuzzle(puzzle: Puzzle): puzzle is SequencePuzzle {
  return puzzle.type === 'sequence';
}

/**
 * Проверяет, является ли задача задачей Lichess
 */
export function isLichessPuzzle(puzzle: Puzzle): puzzle is LichessPuzzle {
  return puzzle.type === 'lichess';
}

// ============================================
// Типы для коллекции задач
// ============================================

/**
 * Коллекция задач
 */
export interface PuzzleCollection {
  /** Название коллекции */
  name: string;
  /** Описание коллекции */
  description?: string;
  /** Список задач */
  puzzles: Puzzle[];
  /** Версия формата */
  version: string;
}

// ============================================
// Re-export типов из statistics.ts
// ============================================

/**
 * Типы для статистики экспортируются из statistics.ts
 * @see {@link ../types/statistics}
 */
export type { UserAttempt, PuzzleStatistics, GlobalStatistics, TypeStatistics } from './statistics';
