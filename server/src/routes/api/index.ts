import { Router } from "express";
import settings from "./settings";
import cards from "./cards";
import tags from "./tags";

const router = Router();

// Подключаем дочерние роутеры
router.use(settings);
router.use(cards);
router.use(tags);

export default router;
