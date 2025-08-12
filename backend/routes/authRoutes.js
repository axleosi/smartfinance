import express from 'express';
import { register, login, becomePartner, userDetails, getPartnerReferrals } from '../controllers/authControllers.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/become-partner', authenticateJWT, becomePartner);
router.get('/me', authenticateJWT, userDetails)
router.get('/referrals', authenticateJWT, getPartnerReferrals);


export default router;
