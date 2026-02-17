import { Chess } from 'chess.js';

/**
 * Валидация FEN строки
 * @param fen - FEN строка для валидации
 * @returns true если FEN корректна, иначе false
 */
export function validateFen(fen: string): boolean {
  try {
    new Chess(fen);
    return true;
  } catch (error) {
    console.error('Ошибка валидации FEN:', error);
    return false;
  }
}

/**
 * Загрузка позиции из FEN строки
 * @param fen - FEN строка
 * @returns Объект Chess с загруженной позицией или null при ошибке
 */
export function loadPositionFromFen(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch (error) {
    console.error('Ошибка загрузки позиции из FEN:', error);
    return null;
  }
}

/**
 * Установка начальной позиции через FEN строку
 * @param fen - FEN строка
 * @returns Объект Chess с начальной позицией или стандартная позиция при ошибке
 */
export function setInitialPosition(fen?: string): Chess {
  if (!fen) {
    return new Chess();
  }
  
  try {
    return new Chess(fen);
  } catch (error) {
    console.error('Ошибка установки начальной позиции из FEN, используется стандартная позиция:', error);
    return new Chess();
  }
}