import express from 'express';
import {
  getUsers,
  suspendUser,
  resetPassword,
  getUserReceiptStats,
  getPartners,
  createPartner,
  getPayments,
  getCoupons,
  getAllWinningEntries,
  addWinningNumber,
  getVisitorSources,
  getSNShares,
  getDashboardStats,
  deleteReceipt,
} from '../controllers/adminControllers.js';

import { checkAdmin } from '../middleware/checkAdmin.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

// Apply admin auth middleware to all routes
router.use(authenticateJWT, checkAdmin);

// --- USER MANAGEMENT ---
router.get('/users', getUsers);
router.patch('/users/:userId/suspend', suspendUser);
router.patch('/users/:userId/reset-password', resetPassword);
router.get('/users/receipt-stats', getUserReceiptStats);

// --- PARTNER MANAGEMENT ---
router.get('/partners', getPartners);
router.post('/partners', createPartner);

// --- SUBSCRIPTIONS & PAYMENTS ---
router.get('/payments', getPayments);
router.get('/coupons', getCoupons);

// --- WINNING STATISTICS ---
router.get('/winnings', getAllWinningEntries);
router.post('/winnings', addWinningNumber);

// --- VISITOR & SOURCE TRACKING ---
router.get('/visitor-sources', getVisitorSources);
router.get('/sns-shares', getSNShares);

// --- SERVICE STATISTICS & REPORTS ---
router.get('/dashboard-stats', getDashboardStats);

// --- ADMIN ONLY OPERATIONS ---
router.delete('/receipts/:receiptId', deleteReceipt);

export default router;
