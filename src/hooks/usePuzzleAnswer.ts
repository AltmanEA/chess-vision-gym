/**
 * Хук для управления ответами пользователя на шахматные задачи
 * Обеспечивает единый интерфейс для работы с ответами разных типов задач
 */

import { useState, useCallback, useMemo } from 'react';
import type { Puzzle } from '../types/puzzle';
import { isSequencePuzzle, isLichessPuzzle } from '../types/puzzle';
import type { PuzzleSolveState } from '../types/puzzleAnswer';
import { createInitialAnswer as createInitialAnswerImpl } from '../types/puzzleAnswer';
import { checkAnswer } from '../utils/puzzleUtils';
import { useSaveAttempt } from './useStatistics';
import type { UserAttempt } from '../types/statistics';

/**
 * Параметры хука usePuzzleAnswer
 */
interface UsePuzzleAnswerParams {
  /** Задача, на которую отвечают */
  puzzle: Puzzle;
  /** Колбэк при завершении решения */
  onSolve?: (isCorrect: boolean) => void;
}

/**
 * Возвращаемое значение хука usePuzzleAnswer
 */
interface UsePuzzleAnswerReturn {
  /** Текущее состояние решения */
  state: PuzzleSolveState;
  /** Можно ли подтвердить ответ */
  canSubmit: boolean;
  /** Прогресс решения (для sequence) */
  progress: { current: number; total: number };
  /** Выбирает поле (для типа field) */
  selectField: (field: string) => void;
  /** Выполняет ход (для типа move и sequence) */
  makeMove: (move: string) => void;
  /** Отменяет последнее действие (для sequence) */
  undoLastAction: () => void;
  /** Сбрасывает ответ */
  resetAnswer: () => void;
  /** Проверяет ответ */
  checkAnswer: () => boolean;
  /** Подтверждает ответ и сохраняет в статистику */
  submitAnswer: () => void;
}

/**
 * Хук для управления ответами пользователя на шахматные задачи
 *
 * @param params - Параметры хука
 * @returns Объект с состоянием и методами управления ответом
 */
export function usePuzzleAnswer({
  puzzle,
  onSolve,
}: UsePuzzleAnswerParams): UsePuzzleAnswerReturn {
  const saveAttempt = useSaveAttempt();

  // Состояние решения задачи
  const [state, setState] = useState<PuzzleSolveState>(() => ({
    answer: createInitialAnswerImpl(puzzle),
    result: null,
    startTime: Date.now(),
    isComplete: false,
  }));

  // Вычисляемое свойство: можно ли подтвердить ответ
  const canSubmit = useMemo(() => {
    if (state.isComplete || state.result !== null) {
      return false;
    }

    switch (state.answer.type) {
      case 'field':
        return state.answer.value !== null;
      case 'move':
        return state.answer.value !== null;
      case 'sequence': {
        // Для sequence можно подтвердить только если выполнены все ходы
        const requiredMoves = (isSequencePuzzle(puzzle) || isLichessPuzzle(puzzle))
          ? puzzle.answer.moves.length
          : 0;
        return state.answer.value.length >= requiredMoves;
      }
      case 'multiField':
        return state.answer.value.length > 0;
      default:
        return false;
    }
  }, [state.answer, state.isComplete, state.result, puzzle]);

  // Вычисляемое свойство: прогресс решения
  const progress = useMemo(() => {
    switch (state.answer.type) {
      case 'sequence': {
        const total = (isSequencePuzzle(puzzle) || isLichessPuzzle(puzzle))
          ? puzzle.answer.moves.length
          : 1;
        const current = state.answer.value.length;
        return { current, total };
      }
      default:
        return { current: 0, total: 1 };
    }
  }, [state.answer, puzzle]);

  /**
   * Выбирает поле (для типа field)
   */
  const selectField = useCallback(
    (field: string) => {
      if (state.isComplete) return;

      if (state.answer.type === 'field') {
        setState((prev) => ({
          ...prev,
          answer: { type: 'field', value: field },
        }));
      }
    },
    [state.isComplete, state.answer.type]
  );

  /**
   * Выполняет ход (для типа move и sequence)
   */
  const makeMove = useCallback(
    (move: string) => {
      if (state.isComplete) return;

      switch (state.answer.type) {
        case 'move': {
          setState((prev) => ({
            ...prev,
            answer: { type: 'move', value: move },
          }));
          break;
        }
        case 'sequence': {
          setState((prev) => ({
            ...prev,
            answer: {
              type: 'sequence',
              value: [...(prev.answer as { type: 'sequence'; value: string[] }).value, move],
            },
          }));
          break;
        }
      }
    },
    [state.isComplete, state.answer.type]
  );

  /**
   * Отменяет последнее действие (для sequence)
   */
  const undoLastAction = useCallback(() => {
    if (state.isComplete) return;

    switch (state.answer.type) {
      case 'sequence': {
        if (state.answer.value.length > 0) {
          setState((prev) => ({
            ...prev,
            answer: {
              type: 'sequence',
              value: (prev.answer as { type: 'sequence'; value: string[] }).value.slice(0, -1),
            },
          }));
        }
        break;
      }
      case 'field': {
        setState((prev) => ({
          ...prev,
          answer: { type: 'field', value: null },
        }));
        break;
      }
      case 'move': {
        setState((prev) => ({
          ...prev,
          answer: { type: 'move', value: null },
        }));
        break;
      }
    }
  }, [state.isComplete, state.answer.type, state.answer.value]);

  /**
   * Сбрасывает ответ
   */
  const resetAnswer = useCallback(() => {
    setState({
      answer: createInitialAnswerImpl(puzzle),
      result: null,
      startTime: Date.now(),
      isComplete: false,
    });
  }, [puzzle]);

  /**
   * Проверяет ответ
   */
  const checkAnswerFn = useCallback((): boolean => {
    if (state.isComplete) return state.result === 'correct';

    let userAnswer: string | string[];

    switch (state.answer.type) {
      case 'field': {
        if (!state.answer.value) return false;
        userAnswer = state.answer.value;
        break;
      }
      case 'move': {
        if (!state.answer.value) return false;
        userAnswer = state.answer.value;
        break;
      }
      case 'sequence': {
        if (state.answer.value.length === 0) return false;
        userAnswer = state.answer.value;
        break;
      }
      case 'multiField': {
        if (state.answer.value.length === 0) return false;
        userAnswer = state.answer.value;
        break;
      }
      default:
        return false;
    }

    return checkAnswer(puzzle, userAnswer);
  }, [puzzle, state.answer, state.isComplete, state.result]);

  /**
   * Создаёт запись попытки для сохранения в статистику
   */
  const createAttemptRecord = useCallback(
    (isCorrect: boolean): UserAttempt => {
      let answer: string | string[];

      switch (state.answer.type) {
        case 'field': {
          answer = state.answer.value || '';
          break;
        }
        case 'move': {
          answer = state.answer.value || '';
          break;
        }
        case 'sequence': {
          answer = state.answer.value;
          break;
        }
        case 'multiField': {
          answer = state.answer.value;
          break;
        }
      }

      return {
        id: `${puzzle.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        puzzleId: puzzle.id,
        puzzleType: puzzle.type,
        answer,
        isCorrect,
        timestamp: state.startTime,
        timeSpent: Date.now() - state.startTime,
      };
    },
    [puzzle, state.answer, state.startTime]
  );

  /**
   * Подтверждает ответ и сохраняет в статистику
   */
  const submitAnswer = useCallback(() => {
    if (state.isComplete) return;

    const isCorrect = checkAnswerFn();
    const attemptRecord = createAttemptRecord(isCorrect);

    // Сохраняем попытку в статистику
    saveAttempt(attemptRecord);

    // Обновляем состояние
    setState((prev) => ({
      ...prev,
      result: isCorrect ? 'correct' : 'incorrect',
      isComplete: true,
    }));

    // Вызываем колбэк
    onSolve?.(isCorrect);
  }, [state.isComplete, checkAnswerFn, createAttemptRecord, saveAttempt, onSolve]);

  return {
    state,
    canSubmit,
    progress,
    selectField,
    makeMove,
    undoLastAction,
    resetAnswer,
    checkAnswer: checkAnswerFn,
    submitAnswer,
  };
}
