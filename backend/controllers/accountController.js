import AccountEntry from '../models/accountEntry.js';

export const getAccountSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    // Aggregate total spending per category this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const categoryTotals = await AccountEntry.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId), date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } }
    ]);

    // Get recent transactions
    const recentEntries = await AccountEntry.find({ user: userId })
      .sort({ date: -1 })
      .limit(20);

    res.json({ categoryTotals, recentEntries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch account summary' });
  }
};
