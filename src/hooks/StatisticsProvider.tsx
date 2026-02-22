/**
 * React Provider для работы со статистикой
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { saveAttempt, getAttempts, clearAttempts, clearAttemptsByPuzzleId } from '../services/storageService';
import { StatisticsContext, type StatisticsContextValue } from './statisticsContext';
import type { UserAttempt } from '../types/statistics';

// ============================================
// Provider
// ============================================

interface StatisticsProviderProps {
  children: ReactNode;
}

export function StatisticsProvider({ children }: StatisticsProviderProps) {
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);

  // Обновление списка попыток
  const refreshAttempts = useCallback(() => {
    setAttempts(getAttempts());
  }, []);

  // Загрузка попыток при монтировании
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAttempts();
  }, [refreshAttempts]);

  // Сохранение попытки
  const saveUserAttempt = useCallback((attempt: Omit<UserAttempt, 'id'>) => {
    const success = saveAttempt(attempt);
    if (success) {
      refreshAttempts();
    }
    return success;
  }, [refreshAttempts]);

  // Очистка всех попыток
  const clearAllAttempts = useCallback(() => {
    const success = clearAttempts();
    if (success) {
      refreshAttempts();
    }
    return success;
  }, [refreshAttempts]);

  // Очистка попыток по задаче
  const clearPuzzleAttempts = useCallback((puzzleId: string) => {
    const success = clearAttemptsByPuzzleId(puzzleId);
    if (success) {
      refreshAttempts();
    }
    return success;
  }, [refreshAttempts]);

  const value: StatisticsContextValue = {
    attempts,
    refreshAttempts,
    saveUserAttempt,
    clearAllAttempts,
    clearPuzzleAttempts,
  };

  return <StatisticsContext.Provider value={value}>{children}</StatisticsContext.Provider>;
}

