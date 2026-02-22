/**
 * Сервис для вычисления статистики
 */

import { getAttempts } from './storageService';
import type {
  UserAttempt,
  PuzzleStatistics,
  GlobalStatistics,
  TypeStatistics,
  PuzzleType,
} from '../types/statistics';

// ============================================
// Вспомогательные функции вычисления
// ============================================

/**
 * Вычисляет процент правильных ответов
 * @param attempts Массив попыток
 * @returns Процент правильных ответов (0-100)
 */
export function calculateAccuracy(attempts: UserAttempt[]): number {
  if (attempts.length === 0) {
    return 0;
  }

  const correctCount = attempts.filter((attempt) => attempt.isCorrect).length;
  return (correctCount / attempts.length) * 100;
}

/**
 * Вычисляет среднее время решения
 * @param attempts Массив попыток
 * @returns Среднее время в миллисекундах
 */
export function calculateAverageTime(attempts: UserAttempt[]): number {
  if (attempts.length === 0) {
    return 0;
  }

  const totalTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
  return totalTime / attempts.length;
}

/**
 * Вычисляет лучшее время решения (среди правильных попыток)
 * @param attempts Массив попыток
 * @returns Лучшее время в миллисекундах или null, если нет правильных попыток
 */
export function calculateBestTime(attempts: UserAttempt[]): number | null {
  const correctAttempts = attempts.filter((attempt) => attempt.isCorrect);

  if (correctAttempts.length === 0) {
    return null;
  }

  return Math.min(...correctAttempts.map((attempt) => attempt.timeSpent));
}

/**
 * Вычисляет процент решённых задач (среди уникальных)
 * @param attempts Массив попыток
 * @returns Процент решённых задач (0-100)
 */
export function calculateCompletionRate(attempts: UserAttempt[]): number {
  if (attempts.length === 0) {
    return 0;
  }

  const uniquePuzzleIds = new Set(attempts.map((attempt) => attempt.puzzleId));
  const solvedPuzzleIds = new Set(
    attempts.filter((attempt) => attempt.isCorrect).map((attempt) => attempt.puzzleId)
  );

  return (solvedPuzzleIds.size / uniquePuzzleIds.size) * 100;
}

// ============================================
// Статистика по задаче
// ============================================

/**
 * Вычисляет статистику по конкретной задаче
 * @param puzzleId ID задачи
 * @returns Статистика по задаче
 */
export function calculatePuzzleStats(puzzleId: string): PuzzleStatistics {
  const attempts = getAttempts(puzzleId);

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((attempt) => attempt.isCorrect).length;
  const accuracy = calculateAccuracy(attempts);
  const averageTime = calculateAverageTime(attempts);
  const bestTime = calculateBestTime(attempts);
  const isSolved = correctAttempts > 0;

  // Находим время последней попытки
  const lastAttemptAt =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => attempt.timestamp))
      : 0;

  return {
    puzzleId,
    totalAttempts,
    correctAttempts,
    accuracy,
    averageTime,
    bestTime,
    lastAttemptAt,
    isSolved,
  };
}

/**
 * Вычисляет статистику по нескольким задачам
 * @param puzzleIds Массив ID задач
 * @returns Массив статистики по задачам
 */
export function calculateMultiplePuzzleStats(puzzleIds: string[]): PuzzleStatistics[] {
  return puzzleIds.map((puzzleId) => calculatePuzzleStats(puzzleId));
}

// ============================================
// Глобальная статистика
// ============================================

/**
 * Вычисляет глобальную статистику пользователя
 * @returns Глобальная статистика
 */
export function calculateGlobalStats(): GlobalStatistics {
  const attempts = getAttempts();

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((attempt) => attempt.isCorrect).length;
  const accuracy = calculateAccuracy(attempts);
  const averageTime = calculateAverageTime(attempts);

  // Количество уникальных решённых задач
  const solvedPuzzleIds = new Set(
    attempts.filter((attempt) => attempt.isCorrect).map((attempt) => attempt.puzzleId)
  );
  const uniquePuzzlesSolved = solvedPuzzleIds.size;

  // Время последней попытки
  const lastAttemptAt =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => attempt.timestamp))
      : 0;

  return {
    totalAttempts,
    correctAttempts,
    accuracy,
    averageTime,
    uniquePuzzlesSolved,
    lastAttemptAt,
  };
}

// ============================================
// Статистика по типам задач
// ============================================

/**
 * Вычисляет статистику по конкретному типу задач
 * @param type Тип задачи
 * @returns Статистика по типу задач
 */
export function calculateStatsByType(type: PuzzleType): TypeStatistics {
  const attempts = getAttempts().filter((attempt) => attempt.puzzleType === type);

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((attempt) => attempt.isCorrect).length;
  const accuracy = calculateAccuracy(attempts);
  const averageTime = calculateAverageTime(attempts);

  // Количество уникальных решённых задач этого типа
  const solvedPuzzleIds = new Set(
    attempts.filter((attempt) => attempt.isCorrect).map((attempt) => attempt.puzzleId)
  );
  const uniquePuzzlesSolved = solvedPuzzleIds.size;

  // Время последней попытки
  const lastAttemptAt =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => attempt.timestamp))
      : 0;

  return {
    type,
    totalAttempts,
    correctAttempts,
    accuracy,
    averageTime,
    uniquePuzzlesSolved,
    lastAttemptAt,
  };
}

/**
 * Вычисляет статистику по всем типам задач
 * @returns Массив статистики по типам задач
 */
export function calculateStatsByAllTypes(): TypeStatistics[] {
  const types: PuzzleType[] = ['field', 'move', 'sequence', 'lichess'];
  return types.map((type) => calculateStatsByType(type));
}

// ============================================
// Дополнительные утилитные функции
// ============================================

/**
 * Получает список уникальных ID решённых задач
 * @returns Массив ID решённых задач
 */
export function getSolvedPuzzleIds(): string[] {
  const attempts = getAttempts();
  const solvedPuzzleIds = new Set(
    attempts.filter((attempt) => attempt.isCorrect).map((attempt) => attempt.puzzleId)
  );
  return Array.from(solvedPuzzleIds);
}

/**
 * Получает список уникальных ID всех решённых задач
 * @returns Массив ID всех задач
 */
export function getAllPuzzleIds(): string[] {
  const attempts = getAttempts();
  const puzzleIds = new Set(attempts.map((attempt) => attempt.puzzleId));
  return Array.from(puzzleIds);
}

/**
 * Проверяет, решена ли задача
 * @param puzzleId ID задачи
 * @returns true если задача решена, иначе false
 */
export function isPuzzleSolved(puzzleId: string): boolean {
  const attempts = getAttempts(puzzleId);
  return attempts.some((attempt) => attempt.isCorrect);
}

/**
 * Получает количество попыток по задаче
 * @param puzzleId ID задачи
 * @returns Количество попыток
 */
export function getPuzzleAttemptsCount(puzzleId: string): number {
  return getAttempts(puzzleId).length;
}
