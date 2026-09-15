import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { getFinanceData, setBudgetForCategory } from '../lib/financeStore';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const Expenses = () => {
  const outlet = useOutletContext();
  const theme = outlet?.theme || 'sky';
  const isSky = theme === 'sky';
  const [financeData, setFinanceData] = useState(() => getFinanceData());
  const [plannerCategory, setPlannerCategory] = useState('Food');
  const [plannerPercent, setPlannerPercent] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [plannerMsg, setPlannerMsg] = useState('');
  const [rangeMode, setRangeMode] = useState('monthly');

  useEffect(() => {
    const sync = () => setFinanceData(getFinanceData());
    window.addEventListener('finance-data-updated', sync);
    return () => window.removeEventListener('finance-data-updated', sync);
  }, []);

  const expenseRows = useMemo(() => {
    const budgets = financeData.budgets || {};
    const expenseTx = (financeData.transactions || []).filter((tx) => tx.type === 'expense');
    const spentByCategory = expenseTx.reduce((acc, tx) => {
      const key = tx.category || 'Other';
      acc[key] = (acc[key] || 0) + Number(tx.amount || 0);
      return acc;
    }, {});

    const allCategories = Array.from(new Set([...Object.keys(budgets), ...Object.keys(spentByCategory)]));
    return allCategories.map((category) => {
      const budget = Number(budgets[category] || 0);
      const spent = Number(spentByCategory[category] || 0);
      let status = 'Safe';
      if (budget > 0 && spent > budget) status = 'Over Budget';
      else if (budget > 0 && spent >= budget * 0.7) status = 'On Track';

      return {
        title: category,
        budget,
        spent,
        status,
      };
    });
  }, [financeData]);

  const categoryOptions = useMemo(() => {
    const fromBudgets = Object.keys(financeData.budgets || {});
    const fromTx = (financeData.transactions || []).map((tx) => tx.category).filter(Boolean);
    const unique = Array.from(new Set([...fromBudgets, ...fromTx]));
    return unique.length ? unique : ['Food', 'Transport', 'Shopping', 'Health', 'Bills', 'Other'];
  }, [financeData]);

  const totalMoney = useMemo(
    () => (financeData.transactions || [])
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
    [financeData],
  );

  const { trendData, categoryData } = useMemo(() => {
    const expenseTx = (financeData.transactions || [])
      .filter((tx) => tx.type === 'expense')
      .map((tx) => ({ ...tx, d: new Date(tx.date) }))
      .filter((tx) => !Number.isNaN(tx.d.getTime()));

    const now = new Date();
    const buckets = [];
    const keyToLabel = new Map();

    if (rangeMode === 'daily') {
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        buckets.push({ key, label, amount: 0 });
        keyToLabel.set(key, label);
      }
      expenseTx.forEach((tx) => {
        const key = tx.d.toISOString().slice(0, 10);
        if (keyToLabel.has(key)) {
          const item = buckets.find((b) => b.key === key);
          if (item) item.amount += Number(tx.amount || 0);
        }
      });
    } else if (rangeMode === 'weekly') {
      for (let i = 7; i >= 0; i -= 1) {
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        const key = `${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}`;
        const label = `W${8 - i}`;
        buckets.push({ key, label, amount: 0, start, end });
      }
      expenseTx.forEach((tx) => {
        const item = buckets.find((b) => tx.d >= b.start && tx.d <= b.end);
        if (item) item.amount += Number(tx.amount || 0);
      });
    } else {
      for (let i = 5; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString(undefined, { month: 'short' });
        buckets.push({ key, label, amount: 0 });
        keyToLabel.set(key, label);
      }
      expenseTx.forEach((tx) => {
        const key = `${tx.d.getFullYear()}-${String(tx.d.getMonth() + 1).padStart(2, '0')}`;
        if (keyToLabel.has(key)) {
          const item = buckets.find((b) => b.key === key);
          if (item) item.amount += Number(tx.amount || 0);
        }
      });
    }

    const categoryMap = {};
    expenseTx.forEach((tx) => {
      const cat = tx.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(tx.amount || 0);
    });
    const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    return {
      trendData: buckets.map((b) => ({ label: b.label, amount: Math.round(b.amount) })),
      categoryData: pieData,
    };
  }, [financeData, rangeMode]);

  const budgetVsSpentData = useMemo(
    () => expenseRows.map((row) => ({ category: row.title, budget: row.budget, spent: row.spent })),
    [expenseRows],
  );

  const handleApplyPercentage = (e) => {
    e.preventDefault();
    const percent = Number(plannerPercent);
    if (!percent || percent <= 0 || percent > 100) {
      setPlannerMsg('Enter a valid percentage between 1 and 100.');
      return;
    }
    if (totalMoney <= 0) {
      setPlannerMsg('No income found. Add income transactions first.');
      return;
    }

    const chosen = plannerCategory === '__new__' ? customCategory.trim() : plannerCategory;
    if (!chosen) {
      setPlannerMsg('Please select or type a category.');
      return;
    }

    const budgetAmount = Math.round((totalMoney * percent) / 100);
    setBudgetForCategory(chosen, budgetAmount);
    setPlannerMsg(`Budget set: ${chosen} = ${percent}% of total money (Rs ${budgetAmount.toLocaleString()}).`);
    if (plannerCategory === '__new__') {
      setPlannerCategory(chosen);
      setCustomCategory('');
    }
    setPlannerPercent('');
  };

  return (
    <div>
      <div className={`mb-7 rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
        <p className={`text-base font-semibold uppercase tracking-[0.15em] ${isSky ? 'text-sky-700' : 'text-sky-300'}`}>Expenses</p>
        <h2 className={`mt-1 text-4xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Budget Control Panel</h2>
      </div>

      <section className={`rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className={`text-3xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Category Budgets</h3>
          <button className={`rounded-full px-5 py-2 text-sm font-semibold text-white ${isSky ? 'bg-sky-700 hover:bg-sky-800' : 'bg-sky-600 hover:bg-sky-500'}`}>
            Add Expense
          </button>
        </div>

        <form onSubmit={handleApplyPercentage} className={`mb-6 rounded-2xl border p-4 ${isSky ? 'border-sky-200 bg-sky-50/60' : 'border-sky-800/40 bg-slate-900/40'}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className={`text-lg font-bold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Budget Split by Percentage</p>
            <p className={`text-sm font-semibold ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>
              Total Money: Rs {totalMoney.toLocaleString()}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_160px_180px_auto]">
            <select
              value={plannerCategory}
              onChange={(e) => setPlannerCategory(e.target.value)}
              className={`rounded-xl border px-3 py-2 text-sm outline-none ring-sky-300 focus:ring ${isSky ? 'border-sky-200 bg-white text-slate-900' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__new__">Other (Add New)</option>
            </select>
            <input
              type="number"
              min="1"
              max="100"
              step="0.1"
              value={plannerPercent}
              onChange={(e) => setPlannerPercent(e.target.value)}
              placeholder="%"
              className={`rounded-xl border px-3 py-2 text-sm outline-none ring-sky-300 focus:ring ${isSky ? 'border-sky-200 bg-white text-slate-900' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
            />
            {plannerCategory === '__new__' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="New category"
                className={`rounded-xl border px-3 py-2 text-sm outline-none ring-sky-300 focus:ring ${isSky ? 'border-sky-200 bg-white text-slate-900' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
              />
            )}
            {plannerCategory !== '__new__' && <div />}
            <button className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${isSky ? 'bg-sky-700 hover:bg-sky-800' : 'bg-sky-600 hover:bg-sky-500'}`}>
              Apply
            </button>
          </div>
          {plannerMsg && (
            <p className={`mt-3 text-sm font-medium ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>{plannerMsg}</p>
          )}
        </form>

        <div className={`mb-6 rounded-2xl border p-5 ${isSky ? 'border-sky-200 bg-white/80' : 'border-sky-800/40 bg-slate-900/40'}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h4 className={`text-2xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Expense Analytics</h4>
            <div className="flex flex-wrap gap-2">
              {['daily', 'weekly', 'monthly'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRangeMode(mode)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
                    rangeMode === mode
                      ? isSky
                        ? 'bg-sky-700 text-white'
                        : 'bg-sky-600 text-white'
                      : isSky
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className={`rounded-2xl border p-4 ${isSky ? 'border-sky-100 bg-sky-50/50' : 'border-sky-800/40 bg-slate-900/30'}`}>
              <p className={`mb-3 text-base font-bold ${isSky ? 'text-slate-800' : 'text-slate-100'}`}>Spending Trend</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isSky ? '#dbeafe' : '#334155'} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} />
                    <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${isSky ? 'border-sky-100 bg-sky-50/50' : 'border-sky-800/40 bg-slate-900/30'}`}>
              <p className={`mb-3 text-base font-bold ${isSky ? 'text-slate-800' : 'text-slate-100'}`}>Category Distribution</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88}>
                      {categoryData.map((item, idx) => (
                        <Cell key={`${item.name}-${idx}`} fill={['#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6'][idx % 6]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={`mt-5 rounded-2xl border p-4 ${isSky ? 'border-sky-100 bg-sky-50/50' : 'border-sky-800/40 bg-slate-900/30'}`}>
            <p className={`mb-3 text-base font-bold ${isSky ? 'text-slate-800' : 'text-slate-100'}`}>Budget vs Spent by Category</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsSpentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isSky ? '#dbeafe' : '#334155'} />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#38bdf8" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="spent" fill="#fb7185" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {expenseRows.length === 0 && (
            <div className={`rounded-2xl border border-dashed p-8 text-center ${isSky ? 'border-sky-200 bg-sky-50/50 text-slate-500' : 'border-sky-800/40 bg-slate-900/40 text-slate-300'}`}>
              No categories available yet.
            </div>
          )}
          {expenseRows.map((row, index) => {
            const percentage = row.budget > 0 ? Math.min(Math.round((row.spent / row.budget) * 100), 100) : 0;
            const overBudget = row.budget > 0 && row.spent > row.budget;
            return (
              <motion.article
                key={row.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className={`rounded-2xl border p-5 ${isSky ? 'border-sky-100 bg-sky-50/60' : 'border-sky-800/40 bg-slate-900/40'}`}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-xl font-bold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>{row.title}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${overBudget ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {row.status}
                  </span>
                </div>
                <div className={`mb-2 flex items-center justify-between text-sm font-semibold ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>
                  <span>Spent: Rs {row.spent.toLocaleString()}</span>
                  <span>Budget: Rs {row.budget.toLocaleString()}</span>
                </div>
                <div className={`h-3 overflow-hidden rounded-full ${isSky ? 'bg-sky-100' : 'bg-slate-800'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.55, delay: 0.2 + index * 0.1 }}
                    className={`h-full rounded-full ${overBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-sky-500'}`}
                  />
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Expenses;
