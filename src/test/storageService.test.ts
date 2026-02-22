import { describe, it, expect } from 'vitest';
import {
  saveAttempt,
  getAttempts,
  clearAttempts,
  clearAttemptsByPuzzleId,
  exportData,
  importData,
  migrateData,
  isStorageAvailable,
  getStorageVersion,
  getAttemptsCount,
} from '../services/storageService';
import type { UserAttempt } from '../types/statistics';
import { STORAGE_KEY, STORAGE_VERSION, DEFAULT_STATISTICS_DATA } from '../types/statistics';

// ============================================
// Сохранение и получение попыток
// ============================================

describe('saveAttempt', () => {
  it('сохраняет попытку и возвращает true', () => {
    clearAttempts();
    const attempt: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: Date.now(),
      timeSpent: 5000,
    };

    const result = saveAttempt(attempt);
    expect(result).toBe(true);
  });

  it('сохранённая попытка имеет уникальный ID', () => {
    clearAttempts();
    const attempt: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: Date.now(),
      timeSpent: 5000,
    };

    saveAttempt(attempt);
    const attempts = getAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].id).toBeDefined();
    expect(typeof attempts[0].id).toBe('string');
  });

  it('сохранённая попытка добавляется в начало массива', () => {
    clearAttempts();
    const attempt1: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: 1000,
      timeSpent: 5000,
    };
    const attempt2: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-2',
      puzzleType: 'field',
      answer: 'e5',
      isCorrect: false,
      timestamp: 2000,
      timeSpent: 3000,
    };

    saveAttempt(attempt1);
    saveAttempt(attempt2);
    const attempts = getAttempts();
    expect(attempts[0].puzzleId).toBe('puzzle-2');
    expect(attempts[1].puzzleId).toBe('puzzle-1');
  });

  it('ограничивает количество попыток до MAX_ATTEMPTS', () => {
    clearAttempts();
    const attempt: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: Date.now(),
      timeSpent: 5000,
    };

    // Сохраняем больше попыток чем лимит
    for (let i = 0; i < 1100; i++) {
      saveAttempt({ ...attempt, puzzleId: `puzzle-${i}` });
    }

    const attempts = getAttempts();
    expect(attempts.length).toBeLessThanOrEqual(1000);
  });
});

describe('getAttempts', () => {
  it('возвращает пустой массив если нет попыток', () => {
    clearAttempts();
    const attempts = getAttempts();
    expect(attempts).toEqual([]);
  });

  it('возвращает все попытки', () => {
    clearAttempts();
    const attempt1: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: 1000,
      timeSpent: 5000,
    };
    const attempt2: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-2',
      puzzleType: 'move',
      answer: 'e2e4',
      isCorrect: false,
      timestamp: 2000,
      timeSpent: 3000,
    };

    saveAttempt(attempt1);
    saveAttempt(attempt2);
    const attempts = getAttempts();
    expect(attempts).toHaveLength(2);
  });

  it('фильтрует попытки по puzzleId', () => {
    clearAttempts();
    const attempt1: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: 1000,
      timeSpent: 5000,
    };
    const attempt2: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: false,
      timestamp: 2000,
      timeSpent: 3000,
    };
    const attempt3: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-2',
      puzzleType: 'field',
      answer: 'e5',
      isCorrect: true,
      timestamp: 3000,
      timeSpent: 4000,
    };

    saveAttempt(attempt1);
    saveAttempt(attempt2);
    saveAttempt(attempt3);
    const attempts = getAttempts('puzzle-1');
    expect(attempts).toHaveLength(2);
    expect(attempts.every(a => a.puzzleId === 'puzzle-1')).toBe(true);
  });

  it('возвращает пустой массив если нет попыток для указанного puzzleId', () => {
    clearAttempts();
    const attempt: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: 1000,
      timeSpent: 5000,
    };

    saveAttempt(attempt);
    const attempts = getAttempts('puzzle-999');
    expect(attempts).toEqual([]);
  });
});

// ============================================
// Очистка попыток
// ============================================

describe('clearAttempts', () => {
  it('очищает все попытки и возвращает true', () => {
    clearAttempts();
    const attempt: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: 1000,
      timeSpent: 5000,
    };

    saveAttempt(attempt);
    expect(getAttempts()).toHaveLength(1);

    const result = clearAttempts();
    expect(result).toBe(true);
    expect(getAttempts()).toEqual([]);
  });

  it('устанавливает дефолтные данные после очистки', () => {
    clearAttempts();
    const attempt: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: 1000,
      timeSpent: 5000,
    };

    saveAttempt(attempt);
    clearAttempts();

    const raw = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(raw!);
    expect(data).toEqual(DEFAULT_STATISTICS_DATA);
  });
});

describe('clearAttemptsByPuzzleId', () => {
  it('удаляет попытки по указанному puzzleId', () => {
    clearAttempts();
    const attempt1: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: 1000,
      timeSpent: 5000,
    };
    const attempt2: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-2',
      puzzleType: 'field',
      answer: 'e5',
      isCorrect: false,
      timestamp: 2000,
      timeSpent: 3000,
    };

    saveAttempt(attempt1);
    saveAttempt(attempt2);

    const result = clearAttemptsByPuzzleId('puzzle-1');
    expect(result).toBe(true);

    const attempts = getAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].puzzleId).toBe('puzzle-2');
  });

  it('возвращает true если нет попыток для удаления', () => {
    const result = clearAttemptsByPuzzleId('puzzle-999');
    expect(result).toBe(true);
  });
});

// ============================================
// Экспорт/Импорт
// ============================================

describe('exportData', () => {
  it('экспортирует данные в JSON строку', () => {
    clearAttempts();
    const attempt: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: 1000,
      timeSpent: 5000,
    };

    saveAttempt(attempt);
    const exported = exportData();

    expect(typeof exported).toBe('string');
    const data = JSON.parse(exported);
    expect(data.version).toBe(STORAGE_VERSION);
    expect(data.exportedAt).toBeDefined();
    expect(data.data).toBeDefined();
    expect(data.data.attempts).toHaveLength(1);
  });

  it('экспортирует пустые данные если нет попыток', () => {
    clearAttempts();
    const exported = exportData();
    const data = JSON.parse(exported);
    expect(data.data.attempts).toEqual([]);
  });
});

describe('importData', () => {
  it('импортирует данные из JSON строки', () => {
    clearAttempts();
    const importDataStr = JSON.stringify({
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        version: STORAGE_VERSION,
        attempts: [
          {
            id: 'attempt-1',
            puzzleId: 'puzzle-1',
            puzzleType: 'field' as const,
            answer: 'e4',
            isCorrect: true,
            timestamp: 1000,
            timeSpent: 5000,
          },
        ],
      },
    });

    const result = importData(importDataStr);
    expect(result).toBe(true);

    const attempts = getAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].id).toBe('attempt-1');
  });

  it('возвращает false для некорректного JSON', () => {
    const result = importData('invalid json');
    expect(result).toBe(false);
  });

  it('возвращает false если отсутствует поле data', () => {
    const importDataStr = JSON.stringify({
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
    });

    const result = importData(importDataStr);
    expect(result).toBe(false);
  });

  it('возвращает false если attempts не является массивом', () => {
    const importDataStr = JSON.stringify({
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        version: STORAGE_VERSION,
        attempts: 'not an array',
      },
    });

    const result = importData(importDataStr);
    expect(result).toBe(false);
  });
});

// ============================================
// Миграция данных
// ============================================

describe('migrateData', () => {
  it('возвращает данные без изменений если версия совпадает', () => {
    const data = {
      version: STORAGE_VERSION,
      attempts: [],
    };

    const result = migrateData(data);
    expect(result).toBe(data);
  });

  it('устанавливает текущую версию если версия отсутствует', () => {
    const data: Omit<import('../types/statistics').StatisticsData, 'version'> = {
      attempts: [],
    };

    const result = migrateData(data as import('../types/statistics').StatisticsData);
    expect(result.version).toBe(STORAGE_VERSION);
  });
});

// ============================================
// Утилитные функции
// ============================================

describe('isStorageAvailable', () => {
  it('возвращает true если localStorage доступен', () => {
    // В тестовой среде с jsdom localStorage всегда доступен
    expect(isStorageAvailable()).toBe(true);
  });
});

describe('getStorageVersion', () => {
  it('возвращает текущую версию если нет данных', () => {
    const version = getStorageVersion();
    expect(version).toBe(STORAGE_VERSION);
  });
});

describe('getAttemptsCount', () => {
  it('возвращает количество попыток', () => {
    clearAttempts();
    const attempt: Omit<UserAttempt, 'id'> = {
      puzzleId: 'puzzle-1',
      puzzleType: 'field',
      answer: 'e4',
      isCorrect: true,
      timestamp: 1000,
      timeSpent: 5000,
    };

    saveAttempt(attempt);
    saveAttempt(attempt);
    saveAttempt(attempt);

    const count = getAttemptsCount();
    expect(count).toBe(3);
  });
});

// ============================================
// Обработка ошибок
// ============================================

describe('Обработка ошибок', () => {
  it('возвращает дефолтные данные при ошибке чтения', () => {
    // Сохраняем некорректные данные
    clearAttempts();
    localStorage.setItem(STORAGE_KEY, 'invalid json');

    const attempts = getAttempts();
    expect(attempts).toEqual([]);
  });
});

