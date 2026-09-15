const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

router.use(auth);

router.get('/summary', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    const transactions = await Transaction.find({
      user: req.userId,
      date: { $gte: start, $lt: end },
    }).sort({ date: -1 });

    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    const categoryMap = new Map();
    transactions
      .filter((item) => item.type === 'expense')
      .forEach((item) => {
        categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + item.amount);
      });

    const categoryTotals = Array.from(categoryMap.entries()).map(([category, spent]) => ({
      category,
      spent,
    }));

    const budgets = await Budget.find({ user: req.userId });

    return res.json({
      summary: {
        month,
        income,
        expenses,
        net: income - expenses,
      },
      categoryTotals,
      budgets,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
