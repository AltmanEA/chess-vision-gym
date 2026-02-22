/**
 * React хуки для работы со статистикой
 */

import { useStatisticsContext } from './statisticsContext';
import type {
  PuzzleStatistics,
  GlobalStatistics,
  TypeStatistics,
  PuzzleType,
  UserAttempt,
} from '../types/statistics';

// ============================================
// Публичные хуки
// ============================================

/**
 * Хук для сохранения попытки пользователя
 * @returns Функция для сохранения попытки
 */
export function useSaveAttempt() {
  const { saveUserAttempt } = useStatisticsContext();
  return saveUserAttempt;
}

/**
 * Хук для получения списка попыток
 * @param puzzleId Опциональный ID задачи для фильтрации
 * @returns Массив попыток и функция обновления
 */
export function useAttempts(puzzleId?: string) {
  const { attempts, refreshAttempts } = useStatisticsContext();

  const filteredAttempts = puzzleId
    ? attempts.filter((attempt: UserAttempt) => attempt.puzzleId === puzzleId)
    : attempts;

  return {
    attempts: filteredAttempts,
    refreshAttempts,
  };
}

/**
 * Хук для получения статистики по конкретной задаче
 * @param puzzleId ID задачи
 * @returns Статистика по задаче
 */
export function usePuzzleStats(puzzleId: string): PuzzleStatistics {
  const { attempts } = useStatisticsContext();

  const puzzleAttempts = attempts.filter((attempt: { puzzleId: string }) => attempt.puzzleId === puzzleId);

  // Вычисляем статистику на основе attempts
  const totalAttempts = puzzleAttempts.length;
  const correctAttempts = puzzleAttempts.filter((attempt: UserAttempt) => attempt.isCorrect).length;
  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
  const averageTime =
    totalAttempts > 0
      ? puzzleAttempts.reduce((sum: number, attempt: UserAttempt) => sum + attempt.timeSpent, 0) / totalAttempts
      : 0;
  const correctPuzzleAttempts = puzzleAttempts.filter((attempt: UserAttempt) => attempt.isCorrect);
  const bestTime =
    correctPuzzleAttempts.length > 0
      ? Math.min(...correctPuzzleAttempts.map((attempt: UserAttempt) => attempt.timeSpent))
      : null;
  const isSolved = correctAttempts > 0;
  const lastAttemptAt =
    totalAttempts > 0 ? Math.max(...puzzleAttempts.map((attempt: UserAttempt) => attempt.timestamp)) : 0;

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
 * Хук для получения глобальной статистики
 * @returns Глобальная статистика
 */
export function useGlobalStats(): GlobalStatistics {
  const { attempts } = useStatisticsContext();

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((attempt: UserAttempt) => attempt.isCorrect).length;
  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
  const averageTime =
    totalAttempts > 0
      ? attempts.reduce((sum: number, attempt: UserAttempt) => sum + attempt.timeSpent, 0) / totalAttempts
      : 0;

  const solvedPuzzleIds = new Set(
    attempts.filter((attempt: UserAttempt) => attempt.isCorrect).map((attempt: UserAttempt) => attempt.puzzleId)
  );
  const uniquePuzzlesSolved = solvedPuzzleIds.size;

  const lastAttemptAt =
    totalAttempts > 0 ? Math.max(...attempts.map((attempt: UserAttempt) => attempt.timestamp)) : 0;

  return {
    totalAttempts,
    correctAttempts,
    accuracy,
    averageTime,
    uniquePuzzlesSolved,
    lastAttemptAt,
  };
}

/**
 * Хук для получения статистики по типам задач
 * @returns Массив статистики по типам задач
 */
export function useStatsByType(): TypeStatistics[] {
  const { attempts } = useStatisticsContext();

  const types: PuzzleType[] = ['field', 'move', 'sequence', 'lichess'];

  return types.map((type) => {
    const typeAttempts = attempts.filter((attempt: UserAttempt) => attempt.puzzleType === type);

    const totalAttempts = typeAttempts.length;
    const correctAttempts = typeAttempts.filter((attempt: UserAttempt) => attempt.isCorrect).length;
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    const averageTime =
      totalAttempts > 0
        ? typeAttempts.reduce((sum: number, attempt: UserAttempt) => sum + attempt.timeSpent, 0) / totalAttempts
        : 0;

    const solvedPuzzleIds = new Set(
      typeAttempts.filter((attempt: UserAttempt) => attempt.isCorrect).map((attempt: UserAttempt) => attempt.puzzleId)
    );
    const uniquePuzzlesSolved = solvedPuzzleIds.size;

    const lastAttemptAt =
      totalAttempts > 0 ? Math.max(...typeAttempts.map((attempt: UserAttempt) => attempt.timestamp)) : 0;

    return {
      type,
      totalAttempts,
      correctAttempts,
      accuracy,
      averageTime,
      uniquePuzzlesSolved,
      lastAttemptAt,
    };
  });
}

/**
 * Хук для очистки всех попыток
 * @returns Функция для очистки всех попыток
 */
export function useClearAttempts() {
  const { clearAllAttempts } = useStatisticsContext();
  return clearAllAttempts;
}

/**
 * Хук для очистки попыток по задаче
 * @returns Функция для очистки попыток по задаче
 */
export function useClearPuzzleAttempts() {
  const { clearPuzzleAttempts } = useStatisticsContext();
  return clearPuzzleAttempts;
}
