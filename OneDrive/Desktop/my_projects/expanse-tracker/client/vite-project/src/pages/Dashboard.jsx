import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  addTransaction,
  deleteTransaction,
  getFinanceData,
  parseFinancePrompt,
  resetAllFinanceData,
  resetTransactionsForMonth,
} from '../lib/financeStore';

const Dashboard = () => {
  const outlet = useOutletContext();
  const theme = outlet?.theme || 'sky';
  const isSky = theme === 'sky';
  const [financeData, setFinanceData] = useState(() => getFinanceData());
  const [prompt, setPrompt] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [assistantMsg, setAssistantMsg] = useState('Try: "spent 650 on food" or "received 35000 salary".');
  const [manualType, setManualType] = useState('expense');
  const [manualCategory, setManualCategory] = useState('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [manualAmount, setManualAmount] = useState('');

  useEffect(() => {
    const sync = () => setFinanceData(getFinanceData());
    window.addEventListener('finance-data-updated', sync);
    return () => window.removeEventListener('finance-data-updated', sync);
  }, []);

  const summaryCards = useMemo(() => {
    const totalExpenses = financeData.transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = financeData.transactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    return [
      { label: 'Total Expenses', value: `Rs ${totalExpenses.toLocaleString()}`, tone: 'text-rose-600' },
      { label: 'Money Received', value: `Rs ${totalIncome.toLocaleString()}`, tone: 'text-emerald-600' },
      { label: 'Net Savings', value: `Rs ${netSavings.toLocaleString()}`, tone: 'text-sky-700' },
    ];
  }, [financeData]);

  const recentTransactions = useMemo(
    () => financeData.transactions.slice(0, 6),
    [financeData.transactions],
  );

  const categoryOptions = useMemo(() => {
    const budgetCategories = Object.keys(financeData.budgets || {});
    const txCategories = (financeData.transactions || []).map((tx) => tx.category).filter(Boolean);
    const unique = Array.from(new Set([...budgetCategories, ...txCategories]));
    return unique.length ? unique : ['Food', 'Transport', 'Shopping', 'Health', 'Bills', 'Other'];
  }, [financeData]);

  const getEntryDate = () => {
    const currentDate = new Date();
    const day = selectedMonth === currentDate.toISOString().slice(0, 7)
      ? String(currentDate.getDate()).padStart(2, '0')
      : '01';
    return `${selectedMonth}-${day}`;
  };

  const handleAiLog = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const parsed = parseFinancePrompt(prompt);
    if (!parsed.ok) {
      setAssistantMsg(parsed.message);
      return;
    }
    const entryDate = getEntryDate();
    const entry = addTransaction({ ...parsed.entry, date: entryDate });
    setAssistantMsg(`Logged: ${entry.type === 'income' ? '+' : '-'}Rs ${entry.amount} under ${entry.category}.`);
    setPrompt('');
  };

  const handleManualLog = (e) => {
    e.preventDefault();
    const amount = Number(manualAmount);
    if (!amount || amount <= 0) {
      setAssistantMsg('Please enter a valid amount greater than 0.');
      return;
    }

    const chosenCategory = manualCategory === '__new__' ? customCategory.trim() : manualCategory;
    if (!chosenCategory) {
      setAssistantMsg('Please choose or enter a category.');
      return;
    }

    const entry = addTransaction({
      title: manualType === 'income' ? `${chosenCategory} Credit` : `${chosenCategory} Expense`,
      amount,
      type: manualType,
      category: chosenCategory,
      date: getEntryDate(),
    });

    setAssistantMsg(`Manually logged: ${entry.type === 'income' ? '+' : '-'}Rs ${entry.amount} in ${entry.category}.`);
    setManualAmount('');
    setCustomCategory('');
    if (manualCategory === '__new__') setManualCategory(chosenCategory);
  };

  const handleResetMonth = () => {
    if (!window.confirm(`Reset all logs for ${selectedMonth}?`)) return;
    resetTransactionsForMonth(selectedMonth);
    setAssistantMsg(`Reset done for month ${selectedMonth}.`);
  };

  const handleResetAll = () => {
    if (!window.confirm('Reset all finance data? This cannot be undone.')) return;
    resetAllFinanceData();
    setAssistantMsg('All finance data has been reset.');
  };

  const handleDelete = (tx) => {
    if (!window.confirm(`Delete "${tx.title}" transaction?`)) return;
    deleteTransaction(tx.id);
    setAssistantMsg(`Deleted transaction: ${tx.title}`);
  };

  return (
    <div>
      <div className={`mb-7 rounded-3xl border p-8 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
        <p className={`text-base font-semibold uppercase tracking-[0.15em] ${isSky ? 'text-sky-700' : 'text-sky-300'}`}>Dashboard</p>
        <h2 className={`mt-1 text-5xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Financial Snapshot</h2>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        {summaryCards.map((card, index) => (
          <motion.article
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className={`rounded-3xl border p-6 shadow-sm ${isSky ? 'border-sky-200 bg-gradient-to-b from-white to-sky-50/70' : 'border-sky-800/40 bg-gradient-to-b from-slate-900 to-slate-900/70'}`}
          >
            <p className={`text-lg font-semibold ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>{card.label}</p>
            <p className={`mt-3 text-5xl font-extrabold ${card.tone}`}>{card.value}</p>
          </motion.article>
        ))}
      </section>

      <section className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <article className={`rounded-3xl border p-7 shadow-sm ${isSky ? 'border-cyan-200 bg-gradient-to-br from-cyan-50 to-white' : 'border-cyan-900/40 bg-gradient-to-br from-slate-900 to-cyan-950/30'}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className={`text-3xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>AI Quick Logger</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${isSky ? 'bg-sky-100 text-sky-700' : 'bg-sky-900/40 text-sky-200'}`}>Natural Language</span>
          </div>
          <form onSubmit={handleAiLog} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[180px_1fr]">
              <label className={`text-base font-semibold ${isSky ? 'text-slate-700' : 'text-slate-200'}`}>
                Logging Month
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none ring-sky-300 focus:ring ${isSky ? 'border-sky-200 bg-white text-slate-900' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
                />
              </label>
              <div className={`text-base ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>
                Entries from AI logger will be saved in the selected month so users can start fresh each new month.
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Example: "spent 1200 on groceries"'
              rows={4}
              className={`w-full rounded-2xl border px-4 py-3 text-lg outline-none ring-sky-300 focus:ring ${isSky ? 'border-sky-200 bg-white text-slate-900' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
            />
            <button className={`rounded-2xl px-6 py-3 text-lg font-semibold text-white ${isSky ? 'bg-sky-700 hover:bg-sky-800' : 'bg-sky-600 hover:bg-sky-500'}`}>
              Log with AI
            </button>
          </form>
        </article>

        <article className={`rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/95' : 'border-sky-800/40 bg-slate-900/70'}`}>
          <h4 className={`text-2xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>AI Status</h4>
          <p className={`mt-3 rounded-2xl p-4 text-base font-medium leading-7 ${isSky ? 'bg-sky-50 text-slate-700' : 'bg-sky-950/40 text-slate-200'}`}>
            {assistantMsg}
          </p>
          <div className={`mt-5 space-y-2 text-sm ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>
            <p className={`font-semibold ${isSky ? 'text-slate-800' : 'text-slate-100'}`}>Try examples:</p>
            <p>"spent 450 on transport"</p>
            <p>"received 15000 freelance"</p>
            <p>"paid 2000 electricity bill"</p>
          </div>
          <form onSubmit={handleManualLog} className={`mt-6 space-y-3 rounded-2xl border p-4 ${isSky ? 'border-sky-200 bg-sky-50/60' : 'border-sky-800/40 bg-slate-900/60'}`}>
            <p className={`text-base font-bold ${isSky ? 'text-slate-800' : 'text-slate-100'}`}>Manual Transaction</p>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value)}
                className={`rounded-xl border px-3 py-2 text-base outline-none ring-sky-300 focus:ring ${isSky ? 'border-sky-200 bg-white text-slate-900' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <input
                type="number"
                min="1"
                step="0.01"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="Amount"
                className={`rounded-xl border px-3 py-2 text-base outline-none ring-sky-300 focus:ring ${isSky ? 'border-sky-200 bg-white text-slate-900' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
              />
            </div>
            <select
              value={manualCategory}
              onChange={(e) => setManualCategory(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 text-base outline-none ring-sky-300 focus:ring ${isSky ? 'border-sky-200 bg-white text-slate-900' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__new__">Other (Add New)</option>
            </select>
            {manualCategory === '__new__' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Type new category name"
                className={`w-full rounded-xl border px-3 py-2 text-base outline-none ring-sky-300 focus:ring ${isSky ? 'border-sky-200 bg-white text-slate-900' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
              />
            )}
            <button className={`w-full rounded-xl px-4 py-2 text-base font-semibold text-white ${isSky ? 'bg-sky-700 hover:bg-sky-800' : 'bg-sky-600 hover:bg-sky-500'}`}>
              Add Transaction
            </button>
          </form>
          <div className="mt-6 grid gap-2">
            <button
              onClick={handleResetMonth}
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-base font-semibold text-amber-700 hover:bg-amber-100"
            >
              Reset Selected Month
            </button>
            <button
              onClick={handleResetAll}
              className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-base font-semibold text-rose-700 hover:bg-rose-100"
            >
              Reset All Data
            </button>
          </div>
        </article>
      </section>

      <section className={`mt-7 rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
        <h3 className={`mb-6 text-4xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Recent Transactions</h3>
        <div className="space-y-4">
          {recentTransactions.length === 0 && (
            <div className={`rounded-2xl border border-dashed p-8 text-center ${isSky ? 'border-sky-200 bg-sky-50/50 text-slate-500' : 'border-sky-800/40 bg-slate-900/40 text-slate-300'}`}>
              No transactions yet. Use AI logger to add one.
            </div>
          )}
          {recentTransactions.map((tx) => (
            <motion.div
              key={tx.id || `${tx.title}-${tx.date}`}
              whileHover={{ y: -2 }}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${isSky ? 'border-sky-100 bg-sky-50/60' : 'border-sky-800/40 bg-slate-900/40'}`}
            >
              <div>
                <p className={`text-xl font-bold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>{tx.title}</p>
                <p className={`text-base font-medium ${isSky ? 'text-slate-500' : 'text-slate-300'}`}>{tx.category} | {tx.date}</p>
              </div>
              <p className={`text-xl font-extrabold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {`${tx.type === 'income' ? '+' : '-'}Rs ${tx.amount.toLocaleString()}`}
              </p>
              <button
                onClick={() => handleDelete(tx)}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            </motion.div>
          ))}
        </div>
      </section>
      </div>
  );
};

export default Dashboard;
