/**
 * Контекст и хук для доступа к статистике (внутренний)
 */

import { createContext, useContext } from 'react';
import type { UserAttempt } from '../types/statistics';

export interface StatisticsContextValue {
  // Попытки
  attempts: UserAttempt[];
  refreshAttempts: () => void;

  // Сохранение
  saveUserAttempt: (attempt: Omit<UserAttempt, 'id'>) => boolean;

  // Очистка
  clearAllAttempts: () => boolean;
  clearPuzzleAttempts: (puzzleId: string) => boolean;
}

export const StatisticsContext = createContext<StatisticsContextValue | undefined>(undefined);

/**
 * Хук для доступа к контексту (внутренний)
 */
export function useStatisticsContext(): StatisticsContextValue {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatisticsContext должен использоваться внутри StatisticsProvider');
  }
  return context;
}
