import User from '../models/User.js';
import Receipt from '../models/Receipt.js';
import Winner from '../models/Winner.js';
import Coupon from '../models/Coupon.js';
import sharedReferrals from '../models/sharedReferrals.js';
import VisitLog from '../models/visitLog.js';
import ConsultingLog from '../models/ConsultingLog.js';
import Payment from '../models/Payment.js';
// Assume Partner is a User with role='partner', no separate model shown here

// 1️⃣ USER MANAGEMENT

// Get users with filters: subscriptionStatus, account active, search by name/email
export const getUsers = async (req, res) => {
  try {
    const { subscriptionStatus, active, search } = req.query;
    const query = {};

    if (subscriptionStatus) query.subscriptionStatus = subscriptionStatus;
    if (active) query.active = active === 'true';
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];

    // Populate receipt count and winning count (aggregate)
    const users = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'receipts',
          localField: '_id',
          foreignField: 'user',
          as: 'receipts'
        }
      },
      {
        $lookup: {
          from: 'winners',
          localField: '_id',
          foreignField: 'userId',
          as: 'winnings'
        }
      },
      {
        $addFields: {
          receiptCount: { $size: '$receipts' },
          winningCount: { $size: '$winnings' }
        }
      },
      {
        $project: {
          password: 0,
          receipts: 0,
          winnings: 0
        }
      }
    ]);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Suspend/ban user
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(userId, { suspended: true });
    res.json({ message: 'User suspended successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset password helper (dummy example)
export const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const newPassword = req.body.newPassword; // Should hash this in real app
    await User.findByIdAndUpdate(userId, { password: newPassword });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get receipt upload stats per user
export const getUserReceiptStats = async (req, res) => {
  try {
    const stats = await Receipt.aggregate([
      {
        $group: {
          _id: '$user',
          receiptCount: { $sum: 1 },
          totalSpent: { $sum: '$total' }
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ PARTNER MANAGEMENT

// List partner users with referral stats
export const getPartners = async (req, res) => {
  try {
    const partners = await User.aggregate([
      { $match: { role: 'partner' } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referredUsers'
        }
      },
      {
        $addFields: {
          referredUserCount: { $size: '$referredUsers' }
        }
      },
      {
        $project: {
          password: 0,
          referredUsers: 0
        }
      }
    ]);
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve/Create partner (simple example)
export const createPartner = async (req, res) => {
  try {
    const { name, email, promoCode, promoLink } = req.body;
    // Check duplicate promoCode
    const exists = await User.findOne({ promoCode });
    if (exists) return res.status(400).json({ message: 'Promo code already in use' });

    const newPartner = new User({
      name,
      email,
      role: 'partner',
      promoCode,
      promoLink
    });
    await newPartner.save();
    res.json({ message: 'Partner created', partner: newPartner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ SUBSCRIPTION & PAYMENT OVERSIGHT

// This assumes you have Payment and Subscription models (not shown here)
// Just example get payments, coupons

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).limit(50);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('partnerId userId').limit(50);
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4️⃣ WINNING STATISTICS MANAGEMENT

export const getAllWinningEntries = async (req, res) => {
  try {
    const winnings = await Winner.find().populate('userId').sort({ date: -1 });
    res.json(winnings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addWinningNumber = async (req, res) => {
  try {
    const { userId, name, stockDecimal, receiptNumber, date } = req.body;
    const newWinner = new Winner({ userId, name, stockDecimal, receiptNumber, date });
    await newWinner.save();
    res.json({ message: 'Winning entry added', newWinner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5️⃣ VISITOR & SOURCE TRACKING

export const getVisitorSources = async (req, res) => {
  try {
    const sources = await VisitLog.aggregate([
      {
        $group: {
          _id: '$referrerId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'partner'
        }
      },
      { $unwind: '$partner' },
      {
        $project: {
          _id: 0,
          partnerName: '$partner.name',
          visits: '$count'
        }
      }
    ]);
    res.json(sources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSNShares = async (req, res) => {
  try {
    const shares = await sharedReferrals.find().populate('userId').limit(50);
    res.json(shares);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6️⃣ SERVICE STATISTICS & REPORTS

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const subscriptionRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const popularQueries = await ConsultingLog.aggregate([
      { $group: { _id: '$inputData.query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const monthlyWinnings = await Winner.aggregate([
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 }
        }
      }
    ]);
    const partnerRanking = await User.aggregate([
      { $match: { role: 'partner' } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referredUsers'
        }
      },
      {
        $addFields: {
          referralCount: { $size: '$referredUsers' }
        }
      },
      { $sort: { referralCount: -1 } },
      { $limit: 5 }
    ]);
    res.json({
      totalUsers,
      subscriptionRevenue: subscriptionRevenue[0]?.totalRevenue || 0,
      popularQueries,
      monthlyWinnings,
      partnerRanking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7️⃣ ADMIN ONLY OPERATIONS

// Example: Remove inappropriate receipt
export const deleteReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    await Receipt.findByIdAndDelete(receiptId);
    res.json({ message: 'Receipt deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

