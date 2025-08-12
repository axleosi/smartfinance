import { authenticateJWT } from '../middleware/authenticateJWT.js';
import express from 'express'
import checkWinnings from '../controllers/winningReceptController.js'

const router = express.Router();


router.post('/winnings',authenticateJWT, checkWinnings);

export default router;