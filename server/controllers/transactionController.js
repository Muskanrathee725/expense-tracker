const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { parseFinancePrompt } = require('../utils/financeParser');

const normalizeType = (rawType) => {
  const value = String(rawType || '').toLowerCase();
  if (value === 'income' || value === 'received') return 'income';
  if (value === 'expense' || value === 'sent') return 'expense';
  return null;
};

const upsertBudgetCategory = async (userId, categoryName) => {
  const name = String(categoryName || '').trim();
  if (!name) return;
  await Budget.updateOne(
    { user: userId, name },
    { $setOnInsert: { amount: 0 } },
    { upsert: true },
  );
};

const listTransactions = async (req, res) => {
  try {
    const filter = { user: req.userId };
    const { month } = req.query;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    return res.json({ transactions });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    const normalizedType = normalizeType(type);

    if (!title || !amount || !normalizedType || !category) {
      return res.status(400).json({ message: 'title, amount, type, and category are required' });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'amount must be greater than 0' });
    }

    const tx = await Transaction.create({
      user: req.userId,
      title: String(title).trim(),
      amount: parsedAmount,
      type: normalizedType,
      category: String(category).trim(),
      date: date ? new Date(date) : new Date(),
    });

    await upsertBudgetCategory(req.userId, category);

    return res.status(201).json({ transaction: tx });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    return res.json({ message: 'Transaction deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const resetAll = async (req, res) => {
  try {
    await Transaction.deleteMany({ user: req.userId });
    await Budget.updateMany({ user: req.userId }, { $set: { amount: 0 } });
    return res.json({ message: 'All data reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const resetMonth = async (req, res) => {
  try {
    const { yearMonth } = req.params;
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
      return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM' });
    }

    const start = new Date(`${yearMonth}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    await Transaction.deleteMany({
      user: req.userId,
      date: { $gte: start, $lt: end },
    });

    return res.json({ message: `Transactions reset for ${yearMonth}` });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const parsePrompt = async (req, res) => {
  const { text } = req.body;
  const result = parseFinancePrompt(text);
  return res.json(result);
};

module.exports = {
  listTransactions,
  createTransaction,
  deleteTransaction,
  resetAll,
  resetMonth,
  parsePrompt,
};
