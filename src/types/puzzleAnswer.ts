/**
 * Типы для управления ответами пользователя на шахматные задачи
 * Этот модуль обеспечивает единый интерфейс для работы с ответами
 * разных типов задач, обеспечивая расширяемость и типобезопасность.
 */

import type { Puzzle } from './puzzle';

// ============================================
// Типы ответов пользователя
// ============================================

/**
 * Ответ для задачи типа "field" (нахождение поля)
 * Пользователь выбирает одно поле на доске
 */
export interface FieldAnswer {
  type: 'field';
  /** Выбранное поле (например, "e4") или null если не выбрано */
  value: string | null;
}

/**
 * Ответ для задачи типа "move" (нахождение хода)
 * Пользователь выполняет один ход
 */
export interface MoveAnswer {
  type: 'move';
  /** Выполненный ход в UCI формате (например, "e2e4") или null */
  value: string | null;
}

/**
 * Ответ для задачи типа "sequence" (последовательность ходов)
 * Пользователь выполняет несколько ходов
 */
export interface SequenceAnswer {
  type: 'sequence';
  /** Список выполненных ходов в UCI формате */
  value: string[];
}

/**
 * Ответ для задачи типа "multiField" (нахождение нескольких полей)
 * Резервный тип для будущих задач
 */
export interface MultiFieldAnswer {
  type: 'multiField';
  /** Список выбранных полей */
  value: string[];
}

/**
 * Объединённый тип для всех видов ответов пользователя
 */
export type UserAnswer = FieldAnswer | MoveAnswer | SequenceAnswer | MultiFieldAnswer;

// ============================================
// Типы состояния решения
// ============================================

/**
 * Результат проверки ответа
 */
export type AnswerResult = 'correct' | 'incorrect' | null;

/**
 * Состояние решения задачи
 */
export interface PuzzleSolveState {
  /** Ответ пользователя */
  answer: UserAnswer;
  /** Результат проверки */
  result: AnswerResult;
  /** Время начала решения (timestamp) */
  startTime: number;
  /** Завершено ли решение */
  isComplete: boolean;
}

// ============================================
// Type Guards
// ============================================

/**
 * Проверяет, является ли ответ ответом типа "field"
 */
export function isFieldAnswer(answer: UserAnswer): answer is FieldAnswer {
  return answer.type === 'field';
}

/**
 * Проверяет, является ли ответ ответом типа "move"
 */
export function isMoveAnswer(answer: UserAnswer): answer is MoveAnswer {
  return answer.type === 'move';
}

/**
 * Проверяет, является ли ответ ответом типа "sequence"
 */
export function isSequenceAnswer(answer: UserAnswer): answer is SequenceAnswer {
  return answer.type === 'sequence';
}

/**
 * Проверяет, является ли ответ ответом типа "multiField"
 */
export function isMultiFieldAnswer(answer: UserAnswer): answer is MultiFieldAnswer {
  return answer.type === 'multiField';
}

// ============================================
// Функции для создания начальных ответов
// ============================================

/**
 * Создаёт начальный ответ для задачи указанного типа
 */
export function createInitialAnswer(puzzle: Puzzle): UserAnswer {
  switch (puzzle.type) {
    case 'field':
      return { type: 'field', value: null };
    case 'move':
      return { type: 'move', value: null };
    case 'sequence':
    case 'lichess':
      return { type: 'sequence', value: [] };
    default:
      // Для неизвестных типов используем field как дефолт
      return { type: 'field', value: null };
  }
}

/**
 * Создаёт начальное состояние решения задачи
 */
export function createInitialSolveState(puzzle: Puzzle): PuzzleSolveState {
  return {
    answer: createInitialAnswer(puzzle),
    result: null,
    startTime: Date.now(),
    isComplete: false,
  };
}
