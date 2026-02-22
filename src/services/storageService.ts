/**
 * Сервис для работы с localStorage
 */

import {
  STORAGE_KEY,
  STORAGE_VERSION,
  MAX_ATTEMPTS,
  DEFAULT_STATISTICS_DATA,
  type StatisticsData,
  type UserAttempt,
  type ExportedStatistics,
} from '../types/statistics';

// ============================================
// Вспомогательные функции
// ============================================

/**
 * Получает данные из localStorage
 */
function getData(): StatisticsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATISTICS_DATA;
    }

    const data = JSON.parse(raw) as StatisticsData;

    // Миграция данных, если версия не совпадает
    return migrateData(data);
  } catch (error) {
    console.error('Ошибка при чтении данных из localStorage:', error);
    return DEFAULT_STATISTICS_DATA;
  }
}

/**
 * Сохраняет данные в localStorage
 */
function setData(data: StatisticsData): boolean {
  try {
    const raw = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, raw);
    return true;
  } catch (error) {
    console.error('Ошибка при записи данных в localStorage:', error);
    return false;
  }
}

/**
 * Генерирует уникальный ID для попытки
 */
function generateAttemptId(): string {
  return `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// Основные функции
// ============================================

/**
 * Сохраняет попытку пользователя
 * @param attempt Попытка для сохранения
 * @returns true если сохранение успешно, иначе false
 */
export function saveAttempt(attempt: Omit<UserAttempt, 'id'>): boolean {
  const data = getData();

  // Создаём новую попытку с ID
  const newAttempt: UserAttempt = {
    ...attempt,
    id: generateAttemptId(),
  };

  // Добавляем попытку в начало массива
  data.attempts.unshift(newAttempt);

  // Ограничиваем количество попыток
  if (data.attempts.length > MAX_ATTEMPTS) {
    data.attempts = data.attempts.slice(0, MAX_ATTEMPTS);
  }

  return setData(data);
}

/**
 * Получает все попытки или попытки по конкретной задаче
 * @param puzzleId Опциональный ID задачи для фильтрации
 * @returns Массив попыток
 */
export function getAttempts(puzzleId?: string): UserAttempt[] {
  const data = getData();

  if (!puzzleId) {
    return data.attempts;
  }

  return data.attempts.filter((attempt) => attempt.puzzleId === puzzleId);
}

/**
 * Очищает все попытки
 * @returns true если очистка успешна, иначе false
 */
export function clearAttempts(): boolean {
  return setData(DEFAULT_STATISTICS_DATA);
}

/**
 * Удаляет попытки по конкретной задаче
 * @param puzzleId ID задачи
 * @returns true если удаление успешно, иначе false
 */
export function clearAttemptsByPuzzleId(puzzleId: string): boolean {
  const data = getData();
  data.attempts = data.attempts.filter((attempt) => attempt.puzzleId !== puzzleId);
  return setData(data);
}

// ============================================
// Экспорт/Импорт
// ============================================

/**
 * Экспортирует все данные статистики в JSON строку
 * @returns JSON строка с данными для экспорта
 */
export function exportData(): string {
  const data = getData();
  const exported: ExportedStatistics = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };

  return JSON.stringify(exported, null, 2);
}

/**
 * Импортирует данные из JSON строки
 * @param jsonString JSON строка с данными для импорта
 * @returns true если импорт успешен, иначе false
 */
export function importData(jsonString: string): boolean {
  try {
    const imported = JSON.parse(jsonString) as ExportedStatistics;

    // Проверяем структуру импортируемых данных
    if (!imported.data || !Array.isArray(imported.data.attempts)) {
      console.error('Некорректный формат импортируемых данных');
      return false;
    }

    // Применяем миграцию к импортируемым данным
    const migratedData = migrateData(imported.data);

    return setData(migratedData);
  } catch (error) {
    console.error('Ошибка при импорте данных:', error);
    return false;
  }
}

// ============================================
// Миграция данных
// ============================================

/**
 * Мигрирует данные к текущей версии формата
 * @param data Данные для миграции
 * @returns Мигрированные данные
 */
export function migrateData(data: StatisticsData): StatisticsData {
  // Если версия совпадает, возвращаем данные как есть
  if (data.version === STORAGE_VERSION) {
    return data;
  }

  // Если версия отсутствует, устанавливаем текущую
  if (!data.version) {
    data.version = STORAGE_VERSION;
  }

  // В будущем здесь можно добавить логику миграции между версиями
  // Например:
  // if (data.version === '0.9.0') {
  //   // Логика миграции с версии 0.9.0 на 1.0.0
  //   data.version = '1.0.0';
  // }

  return data;
}

// ============================================
// Утилитные функции
// ============================================

/**
 * Проверяет, доступны ли данные в localStorage
 * @returns true если localStorage доступен, иначе false
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Получает текущую версию формата данных
 * @returns Версия формата данных
 */
export function getStorageVersion(): string {
  const data = getData();
  return data.version;
}

/**
 * Получает количество хранимых попыток
 * @returns Количество попыток
 */
export function getAttemptsCount(): number {
  const data = getData();
  return data.attempts.length;
}
