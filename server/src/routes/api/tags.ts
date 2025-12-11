import { Router, Request, Response } from "express";
import Database from "better-sqlite3";
import { createTagService } from "../../services/tags";
import { logger } from "../../utils/logger";

const router = Router();

// Middleware для получения базы данных из app.locals
function getDb(req: Request): Database.Database {
  return req.app.locals.db as Database.Database;
}

// GET /api/tags - получение списка всех тегов
router.get("/tags", async (req: Request, res: Response) => {
  try {
    const db = getDb(req);
    const tagService = createTagService(db);
    const tags = tagService.getAllTags();
    res.json(tags);
  } catch (error) {
    logger.error(error, "Ошибка при получении списка тегов");
    res.status(500).json({ error: "Не удалось получить список тегов" });
  }
});

// POST /api/tags - создание нового тега
router.post("/tags", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    // Валидация входных данных
    if (typeof name !== "string") {
      res.status(400).json({
        error:
          "Поле name обязательно и должно быть строкой не более 255 символов",
      });
      return;
    }

    const db = getDb(req);
    const tagService = createTagService(db);
    const tag = tagService.createTag(name);
    res.status(201).json(tag);
  } catch (error: any) {
    logger.error(error, "Ошибка при создании тега");

    // Обработка конфликта (тег уже существует)
    if (error.statusCode === 409) {
      res.status(409).json({
        error: "Тег с таким именем уже существует",
        existingTag: error.existingTag,
      });
      return;
    }

    // Обработка ошибок валидации
    if (error.message && error.message.includes("обязательно")) {
      res.status(400).json({
        error:
          "Поле name обязательно и должно быть строкой не более 255 символов",
      });
      return;
    }

    res.status(500).json({ error: "Не удалось создать тег" });
  }
});

// GET /api/tags/:id - получение тега по ID
router.get("/tags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb(req);
    const tagService = createTagService(db);
    const tag = tagService.getTagById(id);

    if (!tag) {
      res.status(404).json({ error: "Тег с указанным ID не найден" });
      return;
    }

    res.json(tag);
  } catch (error) {
    logger.error(error, "Ошибка при получении тега");
    res.status(500).json({ error: "Не удалось получить тег" });
  }
});

// PUT /api/tags/:id - полное обновление тега
router.put("/tags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Валидация входных данных
    if (typeof name !== "string") {
      res.status(400).json({
        error:
          "Поле name обязательно и должно быть строкой не более 255 символов",
      });
      return;
    }

    const db = getDb(req);
    const tagService = createTagService(db);
    const tag = tagService.updateTag(id, name);
    res.json(tag);
  } catch (error: any) {
    logger.error(error, "Ошибка при обновлении тега");

    // Обработка ошибки "не найден"
    if (error.statusCode === 404) {
      res.status(404).json({ error: "Тег с указанным ID не найден" });
      return;
    }

    // Обработка конфликта (тег с таким rawName уже существует)
    if (error.statusCode === 409) {
      res.status(409).json({
        error: "Тег с таким именем уже существует",
        existingTag: error.existingTag,
      });
      return;
    }

    // Обработка ошибок валидации
    if (error.message && error.message.includes("обязательно")) {
      res.status(400).json({
        error:
          "Поле name обязательно и должно быть строкой не более 255 символов",
      });
      return;
    }

    res.status(500).json({ error: "Не удалось обновить тег" });
  }
});

// PATCH /api/tags/:id - частичное обновление тега
router.patch("/tags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Валидация входных данных
    if (typeof name !== "string") {
      res.status(400).json({
        error:
          "Поле name обязательно и должно быть строкой не более 255 символов",
      });
      return;
    }

    const db = getDb(req);
    const tagService = createTagService(db);
    const tag = tagService.patchTag(id, name);
    res.json(tag);
  } catch (error: any) {
    logger.error(error, "Ошибка при частичном обновлении тега");

    // Обработка ошибки "не найден"
    if (error.statusCode === 404) {
      res.status(404).json({ error: "Тег с указанным ID не найден" });
      return;
    }

    // Обработка конфликта (тег с таким rawName уже существует)
    if (error.statusCode === 409) {
      res.status(409).json({
        error: "Тег с таким именем уже существует",
        existingTag: error.existingTag,
      });
      return;
    }

    // Обработка ошибок валидации
    if (error.message && error.message.includes("обязательно")) {
      res.status(400).json({
        error:
          "Поле name обязательно и должно быть строкой не более 255 символов",
      });
      return;
    }

    res.status(500).json({ error: "Не удалось обновить тег" });
  }
});

// DELETE /api/tags/:id - удаление тега
router.delete("/tags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb(req);
    const tagService = createTagService(db);
    tagService.deleteTag(id);
    res.json({ message: "Тег успешно удален" });
  } catch (error: any) {
    logger.error(error, "Ошибка при удалении тега");

    // Обработка ошибки "не найден"
    if (error.statusCode === 404) {
      res.status(404).json({ error: "Тег с указанным ID не найден" });
      return;
    }

    res.status(500).json({ error: "Не удалось удалить тег" });
  }
});

export default router;
