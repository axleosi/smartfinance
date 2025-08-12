import express from "express";
import { logShare } from "../controllers/shareControllers.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";

const router = express.Router();

router.post("/shared", authenticateJWT, logShare);

export default router;
