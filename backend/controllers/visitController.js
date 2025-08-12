import VisitLog from '../models/visitLog.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const trackVisit = async (req, res) => {
  try {
    const code = req.params.code;
    if (!code) return res.status(400).json({ message: 'No referral code provided' });

    // Find partner by promo code
    const partner = await User.findOne({ promoCode: code, role: 'partner' });
    if (!partner) return res.status(400).json({ message: 'Invalid referral code' });

    // Generate a visitorId (or reuse if in cookie)
    let visitorId = req.cookies.visitorId;
    if (!visitorId) {
      visitorId = uuidv4(); // or hash IP
      res.cookie('visitorId', visitorId, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 });
    }

    // Log the visit
    await VisitLog.create({
      visitorId,
      referrerId: partner._id,
    });

    res.status(200).json({ message: 'Visit logged' });
  } catch (err) {
    console.error('Track visit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
