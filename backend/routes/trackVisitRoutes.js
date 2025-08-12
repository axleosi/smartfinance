import express from "express";
import { trackVisit } from "../controllers/visitController.js";

const router = express.Router();

router.get("/track/:code", trackVisit);

export default router;
