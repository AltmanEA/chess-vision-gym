/**
 * Утилиты для работы с шахматными задачами
 */

import { Chess } from 'chess.js';
import type {
  Puzzle,
  PuzzleCollection,
  LichessPuzzle,
  FieldPuzzle,
  MovePuzzle,
  SequencePuzzle,
} from '../types/puzzle';

// ============================================
// Валидация задач
// ============================================

/**
 * Проверяет корректность FEN строки
 */
export function validateFen(fen: string): boolean {
  try {
    const chess = new Chess(fen);
    return chess.board() !== null;
  } catch {
    return false;
  }
}

/**
 * Проверяет корректность хода в UCI формате
 */
export function validateUciMove(move: string): boolean {
  const uciPattern = /^[a-h][1-8][a-h][1-8][qnrb]?$/i;
  return uciPattern.test(move);
}

/**
 * Проверяет корректность координат поля (например, "e4")
 */
export function validateField(field: string): boolean {
  const fieldPattern = /^[a-h][1-8]$/i;
  return fieldPattern.test(field);
}

/**
 * Валидирует задачу
 */
export function validatePuzzle(puzzle: Puzzle): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Проверка обязательных полей
  if (!puzzle.id || typeof puzzle.id !== 'string') {
    errors.push('Отсутствует или некорректный id');
  }

  if (!puzzle.fen || typeof puzzle.fen !== 'string') {
    errors.push('Отсутствует или некорректный fen');
  } else if (!validateFen(puzzle.fen)) {
    errors.push('Некорректный FEN');
  }

  if (!puzzle.type) {
    errors.push('Отсутствует тип задачи');
  }

  // Проверка ответа в зависимости от типа
  switch (puzzle.type) {
    case 'field': {
      if (!puzzle.answer?.field || !validateField(puzzle.answer.field)) {
        errors.push('Некорректное поле в ответе');
      }
      break;
    }
    case 'move': {
      if (!puzzle.answer?.moves || !Array.isArray(puzzle.answer.moves)) {
        errors.push('Отсутствуют или некорректны ходы в ответе');
      } else if (puzzle.answer.moves.length === 0) {
        errors.push('Отсутствуют или некорректны ходы в ответе');
      } else {
        puzzle.answer.moves.forEach((move, index) => {
          if (!validateUciMove(move)) {
            errors.push(`Некорректный ход #${index + 1}: ${move}`);
          }
        });
      }
      break;
    }
    case 'sequence':
    case 'lichess': {
      if (!puzzle.answer?.moves || !Array.isArray(puzzle.answer.moves)) {
        errors.push('Отсутствуют или некорректны ходы в ответе');
      } else if (puzzle.answer.moves.length === 0) {
        errors.push('Отсутствуют или некорректны ходы в ответе');
      } else {
        puzzle.answer.moves.forEach((move, index) => {
          if (!validateUciMove(move)) {
            errors.push(`Некорректный ход #${index + 1}: ${move}`);
          }
        });
      }
      break;
    }
    default: {
      errors.push(`Неизвестный тип задачи: ${(puzzle as Puzzle).type}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Валидирует коллекцию задач
 */
export function validatePuzzleCollection(collection: PuzzleCollection): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!collection.name) {
    errors.push('Отсутствует название коллекции');
  }

  if (!collection.puzzles || !Array.isArray(collection.puzzles)) {
    errors.push('Отсутствуют или некорректны задачи в коллекции');
  } else {
    collection.puzzles.forEach((puzzle, index) => {
      const validation = validatePuzzle(puzzle);
      if (!validation.valid) {
        errors.push(`Задача #${index + 1} (${puzzle.id}): ${validation.errors.join(', ')}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// Конвертация Lichess CSV в формат задачи
// ============================================

/**
 * Представление строки CSV из Lichess
 */
export interface LichessCsvRow {
  puzzleId: string;
  fen: string;
  moves: string;
  rating: string;
  ratingDeviation: string;
  popularity: string;
  nbPlays: string;
  themes: string;
  gameUrl: string;
}

/**
 * Конвертирует строку CSV из Lichess в задачу типа 'lichess'
 */
export function convertLichessCsvToPuzzle(row: LichessCsvRow): LichessPuzzle {
  const moves = row.moves.split(' ').filter(Boolean);
  const themes = row.themes ? row.themes.split(' ').filter(Boolean) : undefined;

  // Определяем уровень сложности на основе рейтинга
  const difficulty = getDifficultyFromRating(Number(row.rating));

  return {
    id: `lichess-${row.puzzleId}`,
    type: 'lichess',
    puzzleId: row.puzzleId,
    fen: row.fen,
    answer: { moves },
    rating: Number(row.rating),
    ratingDeviation: Number(row.ratingDeviation),
    popularity: Number(row.popularity),
    nbPlays: Number(row.nbPlays),
    gameUrl: row.gameUrl,
    themes,
    difficulty,
  };
}

/**
 * Конвертирует массив строк CSV из Lichess в массив задач
 */
export function convertLichessCsvToPuzzles(rows: LichessCsvRow[]): LichessPuzzle[] {
  return rows.map(convertLichessCsvToPuzzle);
}

/**
 * Парсит строку CSV из Lichess
 */
export function parseLichessCsvLine(line: string): LichessCsvRow | null {
  const parts = line.split(',');
  if (parts.length < 9) {
    return null;
  }

  const [puzzleId, fen, moves, rating, ratingDeviation, popularity, nbPlays, themes, gameUrl] = parts;

  return {
    puzzleId: puzzleId.trim(),
    fen: fen.trim(),
    moves: moves.trim(),
    rating: rating.trim(),
    ratingDeviation: ratingDeviation.trim(),
    popularity: popularity.trim(),
    nbPlays: nbPlays.trim(),
    themes: themes.trim(),
    gameUrl: gameUrl.trim(),
  };
}

// ============================================
// Вспомогательные функции
// ============================================

/**
 * Определяет уровень сложности на основе рейтинга
 */
export function getDifficultyFromRating(rating: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (rating < 1000) return 'beginner';
  if (rating < 1400) return 'intermediate';
  if (rating < 1800) return 'advanced';
  return 'expert';
}

/**
 * Получает задачу по ID из коллекции
 */
export function getPuzzleById(collection: PuzzleCollection, id: string): Puzzle | undefined {
  return collection.puzzles.find((puzzle) => puzzle.id === id);
}

/**
 * Фильтрует задачи по типу
 */
export function filterPuzzlesByType<T extends Puzzle['type']>(
  puzzles: Puzzle[],
  type: T
): Extract<Puzzle, { type: T }>[] {
  return puzzles.filter((puzzle): puzzle is Extract<Puzzle, { type: T }> => puzzle.type === type);
}

/**
 * Фильтрует задачи по уровню сложности
 */
export function filterPuzzlesByDifficulty(puzzles: Puzzle[], difficulty: string): Puzzle[] {
  return puzzles.filter((puzzle) => puzzle.difficulty === difficulty);
}

/**
 * Фильтрует задачи по теме
 */
export function filterPuzzlesByTheme(puzzles: Puzzle[], theme: string): Puzzle[] {
  return puzzles.filter((puzzle) => puzzle.themes?.includes(theme));
}

/**
 * Сортирует задачи по рейтингу
 */
export function sortPuzzlesByRating(puzzles: Puzzle[], ascending = true): Puzzle[] {
  return [...puzzles].sort((a, b) => {
    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    return ascending ? ratingA - ratingB : ratingB - ratingA;
  });
}

// ============================================
// Проверка ответов
// ============================================

/**
 * Проверяет ответ пользователя для задачи типа 'field'
 */
export function checkFieldAnswer(puzzle: FieldPuzzle, userAnswer: string): boolean {
  return userAnswer.toLowerCase() === puzzle.answer.field.toLowerCase();
}

/**
 * Проверяет ответ пользователя для задачи типа 'move'
 */
export function checkMoveAnswer(puzzle: MovePuzzle, userAnswer: string): boolean {
  const normalizedUserAnswer = userAnswer.toLowerCase();
  
  if (puzzle.answer.allowAlternatives) {
    // Любой из предложенных ходов считается правильным
    return puzzle.answer.moves.some((move) => move.toLowerCase() === normalizedUserAnswer);
  } else {
    // Точный ответ
    return puzzle.answer.moves[0].toLowerCase() === normalizedUserAnswer;
  }
}

/**
 * Проверяет ответ пользователя для задачи типа 'sequence'
 */
export function checkSequenceAnswer(
  puzzle: SequencePuzzle | LichessPuzzle,
  userMoves: string[]
): boolean {
  const correctMoves = puzzle.answer.moves;
  
  if (userMoves.length !== correctMoves.length) {
    return false;
  }

  return userMoves.every((move, index) => move.toLowerCase() === correctMoves[index].toLowerCase());
}

/**
 * Универсальная функция проверки ответа
 */
export function checkAnswer(puzzle: Puzzle, userAnswer: string | string[]): boolean {
  switch (puzzle.type) {
    case 'field':
      return checkFieldAnswer(puzzle, userAnswer as string);
    case 'move':
      return checkMoveAnswer(puzzle, userAnswer as string);
    case 'sequence':
    case 'lichess':
      return checkSequenceAnswer(puzzle, userAnswer as string[]);
    default:
      return false;
  }
}
