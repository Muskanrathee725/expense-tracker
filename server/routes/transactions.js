const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  listTransactions,
  createTransaction,
  deleteTransaction,
  resetAll,
  resetMonth,
  parsePrompt,
} = require('../controllers/transactionController');

router.use(auth);

router.get('/', listTransactions);
router.post('/', createTransaction);
router.post('/parse', parsePrompt);
router.delete('/reset', resetAll);
router.delete('/month/:yearMonth', resetMonth);
router.delete('/:id', deleteTransaction);

module.exports = router;
