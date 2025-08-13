import AccountEntry from '../models/accountEntry.js';
import Receipt from '../models/Receipt.js';
import mongoose from 'mongoose';

export const getAccountSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get receipts
    const receipts = await Receipt.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("originalImageUrl total createdAt category");

    // Group receipts by month
    const receiptsByMonth = {};
    receipts.forEach(r => {
      const month = new Date(r.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!receiptsByMonth[month]) receiptsByMonth[month] = [];
      receiptsByMonth[month].push(r);
    });

    // Aggregate category totals per month
    const categoryTotalsByMonth = {};
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const allEntries = await AccountEntry.find({ user: userId });
    
    allEntries.forEach(entry => {
      const month = new Date(entry.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!categoryTotalsByMonth[month]) categoryTotalsByMonth[month] = [];
      let cat = categoryTotalsByMonth[month].find(c => c._id === entry.category);
      if (cat) cat.totalAmount += entry.amount;
      else categoryTotalsByMonth[month].push({ _id: entry.category, totalAmount: entry.amount });
    });

    res.json({ receiptsByMonth, categoryTotalsByMonth });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch account summary" });
  }
};
