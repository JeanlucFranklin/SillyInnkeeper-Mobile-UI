import { parsePngMetadata } from "./png-parser";
import { CardValidator } from "./card-validator";
import { CardDataExtractor } from "./card-data-extractor";
import { ExtractedCardData } from "./types";

/**
 * Главный класс для парсинга карточек персонажей
 * Объединяет валидацию и извлечение данных в единый интерфейс
 */
export class CardParser {
  private extractor: CardDataExtractor;

  constructor() {
    this.extractor = new CardDataExtractor();
  }

  /**
   * Парсит PNG файл и возвращает данные карточки в единообразном формате
   * @param filePath - Путь к PNG файлу
   * @returns Извлеченные данные или null в случае ошибки
   */
  parse(filePath: string): ExtractedCardData | null {
    try {
      // Читаем метаданные из PNG
      const parsedData = parsePngMetadata(filePath);
      if (!parsedData) {
        console.error(
          `Не удалось найти метаданные карточки в файле: ${filePath}`
        );
        return null;
      }

      // Обрабатываем JSON данные
      return this.parseJson(parsedData.data, filePath);
    } catch (error) {
      console.error(`Ошибка при парсинге PNG файла ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Парсит JSON данные карточки
   * @param jsonData - JSON данные карточки
   * @param filePath - Путь к файлу (для логирования ошибок)
   * @returns Извлеченные данные или null в случае ошибки
   */
  parseJson(jsonData: unknown, filePath?: string): ExtractedCardData | null {
    try {
      // Создаем валидатор для этих данных
      const validator = new CardValidator(jsonData);

      // Валидируем карточку
      const specVersion = validator.validate();

      if (!specVersion) {
        const errorMsg =
          validator.getLastError() || "Неизвестная ошибка валидации";
        const fileInfo = filePath ? ` (файл: ${filePath})` : "";

        // Предполагаем тип ошибки на основе структуры данных
        let errorType = "Неизвестная структура данных";
        if (jsonData && typeof jsonData === "object") {
          const card = jsonData as Record<string, unknown>;
          if (card.spec !== undefined) {
            errorType = `Неверная спецификация: ${card.spec}`;
          } else if (card.name !== undefined) {
            errorType = "Неполные данные V1 (отсутствуют обязательные поля)";
          } else {
            errorType = "Отсутствуют обязательные поля";
          }
        }

        console.error(`Ошибка при парсинге карточки${fileInfo}`);
        console.error(`Тип ошибки: ${errorType}`);
        console.error(`Детали: ${errorMsg}`);
        return null;
      }

      // Извлекаем данные в единообразный формат
      const extractedData = this.extractor.extract(jsonData, specVersion);

      return extractedData;
    } catch (error) {
      const fileInfo = filePath ? ` (файл: ${filePath})` : "";
      console.error(`Ошибка при извлечении данных карточки${fileInfo}:`, error);

      // Предполагаем тип ошибки
      let errorType = "Ошибка извлечения данных";
      if (error instanceof Error) {
        errorType = error.message;
      }

      console.error(`Тип ошибки: ${errorType}`);
      return null;
    }
  }
}
