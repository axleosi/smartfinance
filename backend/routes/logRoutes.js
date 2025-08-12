import express from 'express';
import { createConsultingLog, getConsultingLogs } from '../controllers/logControllers.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

router.post('/', authenticateJWT, createConsultingLog);
router.get('/', authenticateJWT, getConsultingLogs);

export default router;
