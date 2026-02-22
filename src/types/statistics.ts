/**
 * Типы для хранения статистики и попыток пользователя
 */

// ============================================
// Типы попыток пользователя
// ============================================

/**
 * Типы задач для статистики
 */
export type PuzzleType = 'field' | 'move' | 'sequence' | 'lichess';

/**
 * Ответ пользователя на задачу (одна попытка)
 */
export interface UserAttempt {
  /** Уникальный идентификатор попытки */
  id: string;
  /** ID задачи */
  puzzleId: string;
  /** Тип задачи */
  puzzleType: PuzzleType;
  /** Ответ пользователя */
  answer: string | string[];
  /** Правильность ответа */
  isCorrect: boolean;
  /** Время начала попытки (timestamp) */
  timestamp: number;
  /** Время, затраченное на попытку (в миллисекундах) */
  timeSpent: number;
}

// ============================================
// Типы вычисляемой статистики
// ============================================

/**
 * Статистика по конкретной задаче
 */
export interface PuzzleStatistics {
  /** ID задачи */
  puzzleId: string;
  /** Общее количество попыток */
  totalAttempts: number;
  /** Количество правильных попыток */
  correctAttempts: number;
  /** Процент правильных ответов (0-100) */
  accuracy: number;
  /** Среднее время решения (в миллисекундах) */
  averageTime: number;
  /** Лучшее время решения (в миллисекундах), только для правильных попыток */
  bestTime: number | null;
  /** Время последней попытки (timestamp) */
  lastAttemptAt: number;
  /** Была ли задача решена хотя бы один раз */
  isSolved: boolean;
}

/**
 * Статистика по типу задач
 */
export interface TypeStatistics {
  /** Тип задачи */
  type: PuzzleType;
  /** Общее количество попыток */
  totalAttempts: number;
  /** Количество правильных попыток */
  correctAttempts: number;
  /** Процент правильных ответов (0-100) */
  accuracy: number;
  /** Среднее время решения (в миллисекундах) */
  averageTime: number;
  /** Количество уникальных решённых задач */
  uniquePuzzlesSolved: number;
  /** Время последней попытки (timestamp) */
  lastAttemptAt: number;
}

/**
 * Глобальная статистика пользователя
 */
export interface GlobalStatistics {
  /** Общее количество попыток */
  totalAttempts: number;
  /** Количество правильных попыток */
  correctAttempts: number;
  /** Процент правильных ответов (0-100) */
  accuracy: number;
  /** Среднее время решения (в миллисекундах) */
  averageTime: number;
  /** Количество уникальных решённых задач */
  uniquePuzzlesSolved: number;
  /** Время последней попытки (timestamp) */
  lastAttemptAt: number;
}

// ============================================
// Типы для хранения в localStorage
// ============================================

/**
 * Данные статистики, хранящиеся в localStorage
 */
export interface StatisticsData {
  /** Версия формата данных */
  version: string;
  /** Список попыток пользователя (максимум 1000) */
  attempts: UserAttempt[];
}

// ============================================
// Константы
// ============================================

/**
 * Ключ для хранения данных в localStorage
 */
export const STORAGE_KEY = 'chessVisionGym';

/**
 * Текущая версия формата данных
 */
export const STORAGE_VERSION = '1.0.0';

/**
 * Максимальное количество хранимых попыток
 */
export const MAX_ATTEMPTS = 1000;

/**
 * Дефолтные данные при инициализации
 */
export const DEFAULT_STATISTICS_DATA: StatisticsData = {
  version: STORAGE_VERSION,
  attempts: [],
};

// ============================================
// Типы для экспорта/импорта
// ============================================

/**
 * Данные для экспорта статистики
 */
export interface ExportedStatistics {
  /** Версия формата */
  version: string;
  /** Дата экспорта (ISO string) */
  exportedAt: string;
  /** Данные статистики */
  data: StatisticsData;
}
