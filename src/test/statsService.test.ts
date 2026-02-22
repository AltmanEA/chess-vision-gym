import { describe, it, expect, beforeEach } from 'vitest';
import { saveAttempt, clearAttempts } from '../services/storageService';
import {
  calculateAccuracy,
  calculateAverageTime,
  calculateBestTime,
  calculateCompletionRate,
  calculatePuzzleStats,
  calculateMultiplePuzzleStats,
  calculateGlobalStats,
  calculateStatsByType,
  calculateStatsByAllTypes,
  getSolvedPuzzleIds,
  getAllPuzzleIds,
  isPuzzleSolved,
  getPuzzleAttemptsCount,
} from '../services/statsService';
import type { UserAttempt } from '../types/statistics';

// Очистка данных перед каждым тестом
beforeEach(() => {
  clearAttempts();
});

// ============================================
// Вспомогательные функции вычисления
// ============================================

describe('calculateAccuracy', () => {
  it('возвращает 0 для пустого массива', () => {
    expect(calculateAccuracy([])).toBe(0);
  });

  it('вычисляет процент правильных ответов', () => {
    const attempts: UserAttempt[] = [
      { id: '1', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { id: '2', puzzleId: 'p1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { id: '3', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    expect(calculateAccuracy(attempts)).toBe((2 / 3) * 100);
  });

  it('возвращает 100 если все ответы правильные', () => {
    const attempts: UserAttempt[] = [
      { id: '1', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { id: '2', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 2000, timeSpent: 3000 },
    ];
    expect(calculateAccuracy(attempts)).toBe(100);
  });

  it('возвращает 0 если все ответы неправильные', () => {
    const attempts: UserAttempt[] = [
      { id: '1', puzzleId: 'p1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 1000, timeSpent: 5000 },
      { id: '2', puzzleId: 'p1', puzzleType: 'field', answer: 'd4', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
    ];
    expect(calculateAccuracy(attempts)).toBe(0);
  });
});

describe('calculateAverageTime', () => {
  it('возвращает 0 для пустого массива', () => {
    expect(calculateAverageTime([])).toBe(0);
  });

  it('вычисляет среднее время решения', () => {
    const attempts: UserAttempt[] = [
      { id: '1', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { id: '2', puzzleId: 'p1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { id: '3', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    expect(calculateAverageTime(attempts)).toBe((5000 + 3000 + 4000) / 3);
  });
});

describe('calculateBestTime', () => {
  it('возвращает null если нет правильных попыток', () => {
    const attempts: UserAttempt[] = [
      { id: '1', puzzleId: 'p1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 1000, timeSpent: 5000 },
    ];
    expect(calculateBestTime(attempts)).toBeNull();
  });

  it('возвращает лучшее время среди правильных попыток', () => {
    const attempts: UserAttempt[] = [
      { id: '1', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { id: '2', puzzleId: 'p1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { id: '3', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 2000 },
    ];
    expect(calculateBestTime(attempts)).toBe(2000);
  });

  it('возвращает null для пустого массива', () => {
    expect(calculateBestTime([])).toBeNull();
  });
});

describe('calculateCompletionRate', () => {
  it('возвращает 0 для пустого массива', () => {
    expect(calculateCompletionRate([])).toBe(0);
  });

  it('вычисляет процент решённых задач среди уникальных', () => {
    const attempts: UserAttempt[] = [
      { id: '1', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { id: '2', puzzleId: 'p2', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { id: '3', puzzleId: 'p3', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    // 2 решённых из 3 уникальных задач
    expect(calculateCompletionRate(attempts)).toBe((2 / 3) * 100);
  });

  it('возвращает 100 если все уникальные задачи решены', () => {
    const attempts: UserAttempt[] = [
      { id: '1', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { id: '2', puzzleId: 'p2', puzzleType: 'field', answer: 'e5', isCorrect: true, timestamp: 2000, timeSpent: 3000 },
    ];
    expect(calculateCompletionRate(attempts)).toBe(100);
  });

  it('учитывает только уникальные задачи', () => {
    const attempts: UserAttempt[] = [
      { id: '1', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { id: '2', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 2000, timeSpent: 3000 },
      { id: '3', puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    // 1 решённая задача из 1 уникальной
    expect(calculateCompletionRate(attempts)).toBe(100);
  });
});

// ============================================
// Статистика по задаче
// ============================================

describe('calculatePuzzleStats', () => {
  it('возвращает нулевую статистику для задачи без попыток', () => {
    const stats = calculatePuzzleStats('puzzle-1');
    expect(stats.puzzleId).toBe('puzzle-1');
    expect(stats.totalAttempts).toBe(0);
    expect(stats.correctAttempts).toBe(0);
    expect(stats.accuracy).toBe(0);
    expect(stats.averageTime).toBe(0);
    expect(stats.bestTime).toBeNull();
    expect(stats.lastAttemptAt).toBe(0);
    expect(stats.isSolved).toBe(false);
  });

  it('корректно вычисляет статистику по задаче', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 2000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const stats = calculatePuzzleStats('puzzle-1');
    expect(stats.puzzleId).toBe('puzzle-1');
    expect(stats.totalAttempts).toBe(3);
    expect(stats.correctAttempts).toBe(2);
    expect(stats.accuracy).toBe((2 / 3) * 100);
    expect(stats.averageTime).toBe((5000 + 3000 + 2000) / 3);
    expect(stats.bestTime).toBe(2000);
    expect(stats.lastAttemptAt).toBe(3000);
    expect(stats.isSolved).toBe(true);
  });

  it('не учитывает попытки других задач', () => {
    const attempts1: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
    ];
    const attempts2: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'puzzle-2', puzzleType: 'field', answer: 'e5', isCorrect: true, timestamp: 2000, timeSpent: 3000 },
    ];
    attempts1.forEach(a => saveAttempt(a));
    attempts2.forEach(a => saveAttempt(a));

    const stats = calculatePuzzleStats('puzzle-1');
    expect(stats.totalAttempts).toBe(1);
    expect(stats.puzzleId).toBe('puzzle-1');
  });
});

describe('calculateMultiplePuzzleStats', () => {
  it('вычисляет статистику для нескольких задач', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'puzzle-2', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const stats = calculateMultiplePuzzleStats(['puzzle-1', 'puzzle-2']);
    expect(stats).toHaveLength(2);
    expect(stats[0].puzzleId).toBe('puzzle-1');
    expect(stats[1].puzzleId).toBe('puzzle-2');
  });
});

// ============================================
// Глобальная статистика
// ============================================

describe('calculateGlobalStats', () => {
  it('возвращает нулевую статистику если нет попыток', () => {
    const stats = calculateGlobalStats();
    expect(stats.totalAttempts).toBe(0);
    expect(stats.correctAttempts).toBe(0);
    expect(stats.accuracy).toBe(0);
    expect(stats.averageTime).toBe(0);
    expect(stats.uniquePuzzlesSolved).toBe(0);
    expect(stats.lastAttemptAt).toBe(0);
  });

  it('корректно вычисляет глобальную статистику', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { puzzleId: 'puzzle-2', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const stats = calculateGlobalStats();
    expect(stats.totalAttempts).toBe(3);
    expect(stats.correctAttempts).toBe(2);
    expect(stats.accuracy).toBe((2 / 3) * 100);
    expect(stats.averageTime).toBe((5000 + 3000 + 4000) / 3);
    expect(stats.uniquePuzzlesSolved).toBe(2);
    expect(stats.lastAttemptAt).toBe(3000);
  });

  it('подсчитывает уникальные решённые задачи корректно', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 2000, timeSpent: 3000 },
      { puzzleId: 'puzzle-2', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
      { puzzleId: 'puzzle-3', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 4000, timeSpent: 2000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const stats = calculateGlobalStats();
    expect(stats.uniquePuzzlesSolved).toBe(2); // puzzle-1 и puzzle-2 решены
  });
});

// ============================================
// Статистика по типам задач
// ============================================

describe('calculateStatsByType', () => {
  it('возвращает нулевую статистику для типа без попыток', () => {
    const stats = calculateStatsByType('field');
    expect(stats.type).toBe('field');
    expect(stats.totalAttempts).toBe(0);
    expect(stats.correctAttempts).toBe(0);
    expect(stats.accuracy).toBe(0);
    expect(stats.averageTime).toBe(0);
    expect(stats.uniquePuzzlesSolved).toBe(0);
    expect(stats.lastAttemptAt).toBe(0);
  });

  it('корректно вычисляет статистику по типу', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'p2', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { puzzleId: 'p3', puzzleType: 'move', answer: 'e2e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const stats = calculateStatsByType('field');
    expect(stats.type).toBe('field');
    expect(stats.totalAttempts).toBe(2);
    expect(stats.correctAttempts).toBe(1);
    expect(stats.accuracy).toBe(50);
    expect(stats.averageTime).toBe((5000 + 3000) / 2);
    expect(stats.uniquePuzzlesSolved).toBe(1);
  });

  it('не учитывает попытки других типов', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'p2', puzzleType: 'move', answer: 'e2e4', isCorrect: true, timestamp: 2000, timeSpent: 3000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const stats = calculateStatsByType('field');
    expect(stats.totalAttempts).toBe(1);
    expect(stats.type).toBe('field');
  });
});

describe('calculateStatsByAllTypes', () => {
  it('вычисляет статистику для всех типов задач', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'p2', puzzleType: 'move', answer: 'e2e4', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { puzzleId: 'p3', puzzleType: 'sequence', answer: ['e2e4', 'e7e5'], isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const stats = calculateStatsByAllTypes();
    expect(stats).toHaveLength(4); // field, move, sequence, lichess
    expect(stats.map(s => s.type)).toEqual(['field', 'move', 'sequence', 'lichess']);
  });

  it('возвращает нулевую статистику для типов без попыток', () => {
    const stats = calculateStatsByAllTypes();
    expect(stats).toHaveLength(4);
    expect(stats.every(s => s.totalAttempts === 0)).toBe(true);
  });
});

// ============================================
// Дополнительные утилитные функции
// ============================================

describe('getSolvedPuzzleIds', () => {
  it('возвращает пустой массив если нет решённых задач', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'p1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 1000, timeSpent: 5000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const solvedIds = getSolvedPuzzleIds();
    expect(solvedIds).toEqual([]);
  });

  it('возвращает ID решённых задач', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'p2', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { puzzleId: 'p3', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const solvedIds = getSolvedPuzzleIds();
    expect(solvedIds).toEqual(expect.arrayContaining(['p1', 'p3']));
    expect(solvedIds).toHaveLength(2);
  });

  it('возвращает уникальные ID без дубликатов', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 2000, timeSpent: 3000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const solvedIds = getSolvedPuzzleIds();
    expect(solvedIds).toEqual(['p1']);
    expect(solvedIds).toHaveLength(1);
  });
});

describe('getAllPuzzleIds', () => {
  it('возвращает пустой массив если нет попыток', () => {
    const allIds = getAllPuzzleIds();
    expect(allIds).toEqual([]);
  });

  it('возвращает все уникальные ID задач', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'p2', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { puzzleId: 'p1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const allIds = getAllPuzzleIds();
    expect(allIds).toEqual(expect.arrayContaining(['p1', 'p2']));
    expect(allIds).toHaveLength(2);
  });
});

describe('isPuzzleSolved', () => {
  it('возвращает false если нет попыток по задаче', () => {
    const solved = isPuzzleSolved('puzzle-1');
    expect(solved).toBe(false);
  });

  it('возвращает false если все попытки неправильные', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 1000, timeSpent: 5000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const solved = isPuzzleSolved('puzzle-1');
    expect(solved).toBe(false);
  });

  it('возвращает true если хотя бы одна попытка правильная', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 2000, timeSpent: 3000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const solved = isPuzzleSolved('puzzle-1');
    expect(solved).toBe(true);
  });
});

describe('getPuzzleAttemptsCount', () => {
  it('возвращает 0 если нет попыток по задаче', () => {
    const count = getPuzzleAttemptsCount('puzzle-1');
    expect(count).toBe(0);
  });

  it('возвращает количество попыток по задаче', () => {
    const attempts: Omit<UserAttempt, 'id'>[] = [
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 1000, timeSpent: 5000 },
      { puzzleId: 'puzzle-1', puzzleType: 'field', answer: 'e5', isCorrect: false, timestamp: 2000, timeSpent: 3000 },
      { puzzleId: 'puzzle-2', puzzleType: 'field', answer: 'e4', isCorrect: true, timestamp: 3000, timeSpent: 4000 },
    ];
    attempts.forEach(a => saveAttempt(a));

    const count = getPuzzleAttemptsCount('puzzle-1');
    expect(count).toBe(2);
  });
});
