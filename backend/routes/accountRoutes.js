import express from 'express';
import { getAccountSummary } from '../controllers/accountController.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/summary', authenticateJWT, getAccountSummary);

export default router;
