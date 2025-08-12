import express from 'express';
import multer from 'multer';
import { getReceipt, uploadReceipt, getAdvice } from '../controllers/receiptController.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload', authenticateJWT, upload.single('receipt'), uploadReceipt);
router.get('/', authenticateJWT, getReceipt);
router.get('/:id/advice', authenticateJWT, getAdvice)

export default router;
