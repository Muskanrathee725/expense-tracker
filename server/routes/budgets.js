const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId }).sort({ name: 1 });
    return res.json({ budgets });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, amount } = req.body;
    if (!name || Number.isNaN(Number(amount))) {
      return res.status(400).json({ message: 'name and amount are required' });
    }

    const normalizedName = String(name).trim();
    const parsedAmount = Number(amount);

    if (!normalizedName) {
      return res.status(400).json({ message: 'name is required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.userId, name: normalizedName },
      { $set: { amount: parsedAmount } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return res.status(201).json({ budget });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { amount } = req.body;
    if (Number.isNaN(Number(amount))) {
      return res.status(400).json({ message: 'amount is required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: { amount: Number(amount) } },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    return res.json({ budget });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    return res.json({ message: 'Budget deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
