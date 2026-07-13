import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getCookingHistory } from "../controllers/historyController.js";

const router = Router();

router.use(authenticate);

router.get("/", getCookingHistory);

export default router;