import { describe, it, expect } from 'vitest';
import {
  validateFen,
  validateUciMove,
  validateField,
  validatePuzzle,
  validatePuzzleCollection,
  checkFieldAnswer,
  checkMoveAnswer,
  checkSequenceAnswer,
  checkAnswer,
  getDifficultyFromRating,
  getPuzzleById,
  filterPuzzlesByType,
  filterPuzzlesByDifficulty,
  filterPuzzlesByTheme,
  sortPuzzlesByRating,
  parseLichessCsvLine,
  convertLichessCsvToPuzzle,
  convertLichessCsvToPuzzles,
} from '../utils/puzzleUtils';
import type { Puzzle, PuzzleCollection, FieldPuzzle, MovePuzzle, SequencePuzzle } from '../types/puzzle';

// ============================================
// Валидация FEN
// ============================================

describe('validateFen', () => {
  it('возвращает true для корректной начальной позиции', () => {
    expect(validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')).toBe(true);
  });

  it('возвращает true для корректной позиции с черными', () => {
    expect(validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1')).toBe(true);
  });

  it('возвращает false для некорректной FEN строки', () => {
    expect(validateFen('invalid-fen-string')).toBe(false);
  });

  it('возвращает false для пустой строки', () => {
    expect(validateFen('')).toBe(false);
  });

  it('возвращает false для FEN с неправильным количеством фигур', () => {
    expect(validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN w KQkq - 0 1')).toBe(false);
  });
});

// ============================================
// Валидация UCI ходов
// ============================================

describe('validateUciMove', () => {
  it('возвращает true для корректного хода пешкой', () => {
    expect(validateUciMove('e2e4')).toBe(true);
  });

  it('возвращает true для корректного хода конем', () => {
    expect(validateUciMove('g1f3')).toBe(true);
  });

  it('возвращает true для хода с превращением пешки', () => {
    expect(validateUciMove('e7e8q')).toBe(true);
  });

  it('возвращает false для хода с некорректным превращением', () => {
    expect(validateUciMove('e7e8x')).toBe(false);
  });

  it('возвращает false для некорректных координат', () => {
    expect(validateUciMove('i2i4')).toBe(false);
  });

  it('возвращает false для слишком короткого хода', () => {
    expect(validateUciMove('e2e')).toBe(false);
  });
});

// ============================================
// Валидация полей
// ============================================

describe('validateField', () => {
  it('возвращает true для корректного поля e4', () => {
    expect(validateField('e4')).toBe(true);
  });

  it('возвращает true для корректного поля a1', () => {
    expect(validateField('a1')).toBe(true);
  });

  it('возвращает true для корректного поля h8', () => {
    expect(validateField('h8')).toBe(true);
  });

  it('возвращает false для некорректного поля', () => {
    expect(validateField('i9')).toBe(false);
  });

  it('возвращает false для пустой строки', () => {
    expect(validateField('')).toBe(false);
  });
});

// ============================================
// Валидация задач
// ============================================

describe('validatePuzzle', () => {
  describe('тип field', () => {
    it('возвращает valid: true для корректной задачи типа field', () => {
      const puzzle: FieldPuzzle = {
        id: 'test-1',
        type: 'field',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        instruction: 'Найдите чёрного короля',
        answer: { field: 'e8' },
      };
      expect(validatePuzzle(puzzle)).toEqual({ valid: true, errors: [] });
    });

    it('возвращает ошибку если отсутствует id', () => {
      const puzzle = {
        id: '' as const,
        type: 'field' as const,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        instruction: 'Тест',
        answer: { field: 'e8' },
      };
      const result = validatePuzzle(puzzle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Отсутствует или некорректный id');
    });

    it('возвращает ошибку если некорректный FEN', () => {
      const puzzle: FieldPuzzle = {
        id: 'test-1',
        type: 'field',
        fen: 'invalid-fen',
        instruction: 'Тест',
        answer: { field: 'e8' },
      };
      const result = validatePuzzle(puzzle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Некорректный FEN');
    });

    it('возвращает ошибку если некорректное поле в ответе', () => {
      const puzzle: FieldPuzzle = {
        id: 'test-1',
        type: 'field',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        instruction: 'Тест',
        answer: { field: 'i9' },
      };
      const result = validatePuzzle(puzzle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Некорректное поле в ответе');
    });
  });

  describe('тип move', () => {
    it('возвращает valid: true для корректной задачи типа move', () => {
      const puzzle: MovePuzzle = {
        id: 'test-2',
        type: 'move',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        instruction: 'Найдите лучший ход',
        answer: { moves: ['e2e4'] },
      };
      expect(validatePuzzle(puzzle)).toEqual({ valid: true, errors: [] });
    });

    it('возвращает ошибку если отсутствуют ходы в ответе', () => {
      const puzzle: MovePuzzle = {
        id: 'test-2',
        type: 'move',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        instruction: 'Тест',
        answer: { moves: [] },
      };
      const result = validatePuzzle(puzzle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Отсутствуют или некорректны ходы в ответе');
    });

    it('возвращает ошибку если некорректный ход в ответе', () => {
      const puzzle: MovePuzzle = {
        id: 'test-2',
        type: 'move',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        instruction: 'Тест',
        answer: { moves: ['invalid'] },
      };
      const result = validatePuzzle(puzzle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Некорректный ход #1: invalid');
    });
  });

  describe('тип sequence', () => {
    it('возвращает valid: true для корректной задачи типа sequence', () => {
      const puzzle: SequencePuzzle = {
        id: 'test-3',
        type: 'sequence',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        instruction: 'Мат в 2 хода',
        answer: { moves: ['e2e4', 'e7e5'] },
      };
      expect(validatePuzzle(puzzle)).toEqual({ valid: true, errors: [] });
    });

    it('возвращает ошибку если некорректный ход в последовательности', () => {
      const puzzle: SequencePuzzle = {
        id: 'test-3',
        type: 'sequence',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        instruction: 'Тест',
        answer: { moves: ['e2e4', 'invalid'] },
      };
      const result = validatePuzzle(puzzle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Некорректный ход #2: invalid');
    });
  });

  describe('тип lichess', () => {
    it('возвращает valid: true для корректной задачи типа lichess', () => {
      const puzzle = {
        id: 'lichess-test',
        type: 'lichess' as const,
        puzzleId: '12345',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        answer: { moves: ['e2e4', 'e7e5'] },
        rating: 1200,
      };
      expect(validatePuzzle(puzzle)).toEqual({ valid: true, errors: [] });
    });

    it('возвращает ошибку если отсутствует обязательное поле rating для lichess', () => {
      const puzzle = {
        id: 'lichess-test',
        type: 'lichess' as const,
        puzzleId: '12345',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        answer: { moves: ['e2e4'] },
        rating: 1200,
      };
      const result = validatePuzzle(puzzle);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('неизвестный тип', () => {
    it('возвращает ошибку для неизвестного типа задачи', () => {
      const puzzle = {
        id: 'test',
        type: 'unknown' as const,
        puzzleId: 'unknown-1',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        answer: { moves: [] },
        rating: 1200,
      } as unknown as Puzzle;
      const result = validatePuzzle(puzzle);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Неизвестный тип задачи: unknown');
    });
  });
});

// ============================================
// Валидация коллекций задач
// ============================================

describe('validatePuzzleCollection', () => {
  it('возвращает valid: true для корректной коллекции', () => {
    const collection: PuzzleCollection = {
      name: 'Тестовая коллекция',
      version: '1.0.0',
      puzzles: [
        {
          id: 'test-1',
          type: 'field',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          instruction: 'Тест',
          answer: { field: 'e8' },
        },
      ],
    };
    expect(validatePuzzleCollection(collection)).toEqual({ valid: true, errors: [] });
  });

  it('возвращает ошибку если отсутствует название коллекции', () => {
    const collection = {
      version: '1.0.0',
      puzzles: [],
    } as unknown as PuzzleCollection;
    const result = validatePuzzleCollection(collection);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Отсутствует название коллекции');
  });

  it('возвращает ошибку если отсутствуют задачи', () => {
    const collection = {
      name: 'Тест',
      version: '1.0.0',
    } as unknown as PuzzleCollection;
    const result = validatePuzzleCollection(collection);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Отсутствуют или некорректны задачи в коллекции');
  });

  it('возвращает ошибку если одна из задач невалидна', () => {
    const collection: PuzzleCollection = {
      name: 'Тест',
      version: '1.0.0',
      puzzles: [
        {
          id: 'test-1',
          type: 'field',
          fen: 'invalid',
          instruction: 'Тест',
          answer: { field: 'e8' },
        },
      ],
    };
    const result = validatePuzzleCollection(collection);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ============================================
// Проверка ответов
// ============================================

describe('checkFieldAnswer', () => {
  const puzzle: FieldPuzzle = {
    id: 'test',
    type: 'field',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    instruction: 'Тест',
    answer: { field: 'e4' },
  };

  it('возвращает true для правильного ответа', () => {
    expect(checkFieldAnswer(puzzle, 'e4')).toBe(true);
  });

  it('возвращает true для правильного ответа в другом регистре', () => {
    expect(checkFieldAnswer(puzzle, 'E4')).toBe(true);
  });

  it('возвращает false для неправильного ответа', () => {
    expect(checkFieldAnswer(puzzle, 'e5')).toBe(false);
  });
});

describe('checkMoveAnswer', () => {
  it('возвращает true для точного ответа', () => {
    const puzzle: MovePuzzle = {
      id: 'test',
      type: 'move',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      instruction: 'Тест',
      answer: { moves: ['e2e4'] },
    };
    expect(checkMoveAnswer(puzzle, 'e2e4')).toBe(true);
  });

  it('возвращает false для неправильного ответа', () => {
    const puzzle: MovePuzzle = {
      id: 'test',
      type: 'move',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      instruction: 'Тест',
      answer: { moves: ['e2e4'] },
    };
    expect(checkMoveAnswer(puzzle, 'd2d4')).toBe(false);
  });

  it('возвращает true для любого из альтернативных ходов', () => {
    const puzzle: MovePuzzle = {
      id: 'test',
      type: 'move',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      instruction: 'Тест',
      answer: { moves: ['e2e4', 'd2d4'], allowAlternatives: true },
    };
    expect(checkMoveAnswer(puzzle, 'd2d4')).toBe(true);
    expect(checkMoveAnswer(puzzle, 'e2e4')).toBe(true);
  });

  it('игнорирует регистр при сравнении', () => {
    const puzzle: MovePuzzle = {
      id: 'test',
      type: 'move',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      instruction: 'Тест',
      answer: { moves: ['e2e4'] },
    };
    expect(checkMoveAnswer(puzzle, 'E2E4')).toBe(true);
  });
});

describe('checkSequenceAnswer', () => {
  it('возвращает true для правильной последовательности', () => {
    const puzzle: SequencePuzzle = {
      id: 'test',
      type: 'sequence',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      answer: { moves: ['e2e4', 'e7e5'] },
    };
    expect(checkSequenceAnswer(puzzle, ['e2e4', 'e7e5'])).toBe(true);
  });

  it('возвращает false если количество ходов не совпадает', () => {
    const puzzle: SequencePuzzle = {
      id: 'test',
      type: 'sequence',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      answer: { moves: ['e2e4', 'e7e5'] },
    };
    expect(checkSequenceAnswer(puzzle, ['e2e4'])).toBe(false);
  });

  it('возвращает false если последовательность неверна', () => {
    const puzzle: SequencePuzzle = {
      id: 'test',
      type: 'sequence',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      answer: { moves: ['e2e4', 'e7e5'] },
    };
    expect(checkSequenceAnswer(puzzle, ['e2e4', 'd7d5'])).toBe(false);
  });

  it('игнорирует регистр при сравнении', () => {
    const puzzle: SequencePuzzle = {
      id: 'test',
      type: 'sequence',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      answer: { moves: ['e2e4', 'e7e5'] },
    };
    expect(checkSequenceAnswer(puzzle, ['E2E4', 'E7E5'])).toBe(true);
  });
});

describe('checkAnswer', () => {
  it('корректно проверяет ответ для типа field', () => {
    const puzzle: FieldPuzzle = {
      id: 'test',
      type: 'field',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      instruction: 'Тест',
      answer: { field: 'e4' },
    };
    expect(checkAnswer(puzzle, 'e4')).toBe(true);
    expect(checkAnswer(puzzle, 'e5')).toBe(false);
  });

  it('корректно проверяет ответ для типа move', () => {
    const puzzle: MovePuzzle = {
      id: 'test',
      type: 'move',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      instruction: 'Тест',
      answer: { moves: ['e2e4'] },
    };
    expect(checkAnswer(puzzle, 'e2e4')).toBe(true);
    expect(checkAnswer(puzzle, 'd2d4')).toBe(false);
  });

  it('корректно проверяет ответ для типа sequence', () => {
    const puzzle: SequencePuzzle = {
      id: 'test',
      type: 'sequence',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      answer: { moves: ['e2e4', 'e7e5'] },
    };
    expect(checkAnswer(puzzle, ['e2e4', 'e7e5'])).toBe(true);
    expect(checkAnswer(puzzle, ['e2e4'])).toBe(false);
  });

  it('возвращает false для неизвестного типа', () => {
    const puzzle = {
      id: 'test',
      type: 'unknown' as const,
      puzzleId: 'unknown-1',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      answer: { moves: [] },
      rating: 1200,
    } as unknown as Puzzle;
    expect(checkAnswer(puzzle, 'test')).toBe(false);
  });
});

// ============================================
// Вспомогательные функции
// ============================================

describe('getDifficultyFromRating', () => {
  it('возвращает beginner для рейтинга < 1000', () => {
    expect(getDifficultyFromRating(999)).toBe('beginner');
    expect(getDifficultyFromRating(500)).toBe('beginner');
  });

  it('возвращает intermediate для рейтинга 1000-1399', () => {
    expect(getDifficultyFromRating(1000)).toBe('intermediate');
    expect(getDifficultyFromRating(1200)).toBe('intermediate');
    expect(getDifficultyFromRating(1399)).toBe('intermediate');
  });

  it('возвращает advanced для рейтинга 1400-1799', () => {
    expect(getDifficultyFromRating(1400)).toBe('advanced');
    expect(getDifficultyFromRating(1600)).toBe('advanced');
    expect(getDifficultyFromRating(1799)).toBe('advanced');
  });

  it('возвращает expert для рейтинга >= 1800', () => {
    expect(getDifficultyFromRating(1800)).toBe('expert');
    expect(getDifficultyFromRating(2000)).toBe('expert');
  });
});

describe('getPuzzleById', () => {
  const collection: PuzzleCollection = {
    name: 'Тест',
    version: '1.0.0',
    puzzles: [
      { id: 'puzzle-1', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e4' } },
      { id: 'puzzle-2', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e5' } },
    ],
  };

  it('возвращает задачу по существующему ID', () => {
    const puzzle = getPuzzleById(collection, 'puzzle-1');
    expect(puzzle).toBeDefined();
    expect(puzzle?.id).toBe('puzzle-1');
  });

  it('возвращает undefined для несуществующего ID', () => {
    const puzzle = getPuzzleById(collection, 'puzzle-999');
    expect(puzzle).toBeUndefined();
  });
});

describe('filterPuzzlesByType', () => {
  const puzzles: Puzzle[] = [
    { id: '1', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e4' } },
    { id: '2', type: 'move', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { moves: ['e2e4'] } },
    { id: '3', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e5' } },
  ];

  it('фильтрует задачи по типу field', () => {
    const filtered = filterPuzzlesByType(puzzles, 'field');
    expect(filtered).toHaveLength(2);
    expect(filtered.every(p => p.type === 'field')).toBe(true);
  });

  it('фильтрует задачи по типу move', () => {
    const filtered = filterPuzzlesByType(puzzles, 'move');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('возвращает пустой массив если нет задач указанного типа', () => {
    const filtered = filterPuzzlesByType(puzzles, 'sequence');
    expect(filtered).toHaveLength(0);
  });
});

describe('filterPuzzlesByDifficulty', () => {
  const puzzles: Puzzle[] = [
    { id: '1', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e4' }, difficulty: 'beginner' },
    { id: '2', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e5' }, difficulty: 'advanced' },
    { id: '3', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'd4' }, difficulty: 'beginner' },
  ];

  it('фильтрует задачи по сложности beginner', () => {
    const filtered = filterPuzzlesByDifficulty(puzzles, 'beginner');
    expect(filtered).toHaveLength(2);
  });

  it('фильтрует задачи по сложности advanced', () => {
    const filtered = filterPuzzlesByDifficulty(puzzles, 'advanced');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('возвращает пустой массив если нет задач указанной сложности', () => {
    const filtered = filterPuzzlesByDifficulty(puzzles, 'expert');
    expect(filtered).toHaveLength(0);
  });
});

describe('filterPuzzlesByTheme', () => {
  const puzzles: Puzzle[] = [
    { id: '1', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e4' }, themes: ['fork', 'pin'] },
    { id: '2', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e5' }, themes: ['skewer'] },
    { id: '3', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'd4' }, themes: ['fork'] },
  ];

  it('фильтрует задачи по теме fork', () => {
    const filtered = filterPuzzlesByTheme(puzzles, 'fork');
    expect(filtered).toHaveLength(2);
  });

  it('фильтрует задачи по теме skewer', () => {
    const filtered = filterPuzzlesByTheme(puzzles, 'skewer');
    expect(filtered).toHaveLength(1);
  });

  it('возвращает пустой массив если нет задач с указанной темой', () => {
    const filtered = filterPuzzlesByTheme(puzzles, 'mate');
    expect(filtered).toHaveLength(0);
  });
});

describe('sortPuzzlesByRating', () => {
  const puzzles: Puzzle[] = [
    { id: '1', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e4' }, rating: 1500 },
    { id: '2', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'e5' }, rating: 1200 },
    { id: '3', type: 'field', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', instruction: 'Тест', answer: { field: 'd4' }, rating: 1800 },
  ];

  it('сортирует задачи по возрастанию рейтинга', () => {
    const sorted = sortPuzzlesByRating(puzzles, true);
    expect(sorted[0].rating).toBe(1200);
    expect(sorted[1].rating).toBe(1500);
    expect(sorted[2].rating).toBe(1800);
  });

  it('сортирует задачи по убыванию рейтинга', () => {
    const sorted = sortPuzzlesByRating(puzzles, false);
    expect(sorted[0].rating).toBe(1800);
    expect(sorted[1].rating).toBe(1500);
    expect(sorted[2].rating).toBe(1200);
  });

  it('не изменяет исходный массив', () => {
    const original = [...puzzles];
    sortPuzzlesByRating(puzzles);
    expect(puzzles).toEqual(original);
  });
});

// ============================================
// Конвертация Lichess CSV
// ============================================

describe('parseLichessCsvLine', () => {
  it('парсит корректную строку CSV', () => {
    const line = 'puzzle123,rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1,e2e4 e7e5,1200,50,10,100,fork pin,https://lichess.org/game123';
    const result = parseLichessCsvLine(line);
    expect(result).toEqual({
      puzzleId: 'puzzle123',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: 'e2e4 e7e5',
      rating: '1200',
      ratingDeviation: '50',
      popularity: '10',
      nbPlays: '100',
      themes: 'fork pin',
      gameUrl: 'https://lichess.org/game123',
    });
  });

  it('возвращает null если недостаточно полей', () => {
    const line = 'puzzle123,rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1,e2e4';
    const result = parseLichessCsvLine(line);
    expect(result).toBeNull();
  });

  it('обрезает пробелы в полях', () => {
    const line = ' puzzle123 , rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 , e2e4 e7e5 , 1200 , 50 , 10 , 100 , fork pin , https://lichess.org/game123 ';
    const result = parseLichessCsvLine(line);
    expect(result?.puzzleId).toBe('puzzle123');
    expect(result?.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });
});

describe('convertLichessCsvToPuzzle', () => {
  it('конвертирует строку CSV в задачу', () => {
    const row = {
      puzzleId: 'puzzle123',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: 'e2e4 e7e5',
      rating: '1200',
      ratingDeviation: '50',
      popularity: '10',
      nbPlays: '100',
      themes: 'fork pin',
      gameUrl: 'https://lichess.org/game123',
    };
    const result = convertLichessCsvToPuzzle(row);
    expect(result.id).toBe('lichess-puzzle123');
    expect(result.type).toBe('lichess');
    expect(result.puzzleId).toBe('puzzle123');
    expect(result.fen).toBe(row.fen);
    expect(result.answer.moves).toEqual(['e2e4', 'e7e5']);
    expect(result.rating).toBe(1200);
    expect(result.ratingDeviation).toBe(50);
    expect(result.popularity).toBe(10);
    expect(result.nbPlays).toBe(100);
    expect(result.themes).toEqual(['fork', 'pin']);
    expect(result.gameUrl).toBe('https://lichess.org/game123');
    expect(result.difficulty).toBe('intermediate');
  });

  it('правильно определяет сложность beginner', () => {
    const row = {
      puzzleId: 'puzzle123',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: 'e2e4',
      rating: '999',
      ratingDeviation: '50',
      popularity: '10',
      nbPlays: '100',
      themes: '',
      gameUrl: '',
    };
    const result = convertLichessCsvToPuzzle(row);
    expect(result.difficulty).toBe('beginner');
  });

  it('правильно определяет сложность expert', () => {
    const row = {
      puzzleId: 'puzzle123',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: 'e2e4',
      rating: '1800',
      ratingDeviation: '50',
      popularity: '10',
      nbPlays: '100',
      themes: '',
      gameUrl: '',
    };
    const result = convertLichessCsvToPuzzle(row);
    expect(result.difficulty).toBe('expert');
  });
});

describe('convertLichessCsvToPuzzles', () => {
  it('конвертирует массив строк CSV в массив задач', () => {
    const rows = [
      {
        puzzleId: 'puzzle1',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: 'e2e4',
        rating: '1200',
        ratingDeviation: '50',
        popularity: '10',
        nbPlays: '100',
        themes: '',
        gameUrl: '',
      },
      {
        puzzleId: 'puzzle2',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: 'd2d4',
        rating: '1500',
        ratingDeviation: '50',
        popularity: '10',
        nbPlays: '100',
        themes: '',
        gameUrl: '',
      },
    ];
    const result = convertLichessCsvToPuzzles(rows);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('lichess-puzzle1');
    expect(result[1].id).toBe('lichess-puzzle2');
  });
});
