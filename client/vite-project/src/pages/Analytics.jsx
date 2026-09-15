import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  Area,
  AreaChart,
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
import { getFinanceData } from '../lib/financeStore';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const categoryColors = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#14b8a6', '#64748b'];

const Analytics = () => {
  const outlet = useOutletContext();
  const theme = outlet?.theme || 'sky';
  const isSky = theme === 'sky';
  const [financeData, setFinanceData] = useState(() => getFinanceData());
  const [windowMonths, setWindowMonths] = useState(12);

  useEffect(() => {
    const sync = () => setFinanceData(getFinanceData());
    window.addEventListener('finance-data-updated', sync);
    return () => window.removeEventListener('finance-data-updated', sync);
  }, []);

  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set((financeData.transactions || [])
        .map((t) => new Date(t.date).getFullYear())
        .filter((y) => !Number.isNaN(y))),
    ).sort((a, b) => b - a);
    return years.length ? years : [new Date().getFullYear()];
  }, [financeData.transactions]);

  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const { overview, monthlyTrend, expenseCategorySplit, weeklyExpenses, monthlyCompare, topCategories, avgMonthlyExpense } = useMemo(() => {
    const tx = financeData.transactions || [];
    const currentYear = selectedYear;

    const totalExpenses = tx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = tx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const savings = totalIncome - totalExpenses;

    const monthMap = new Map();
    monthLabels.forEach((label, idx) => monthMap.set(idx, { month: label, expenses: 0, income: 0, savings: 0 }));
    tx.forEach((t) => {
      const date = new Date(t.date);
      if (date.getFullYear() !== currentYear) return;
      const item = monthMap.get(date.getMonth());
      if (!item) return;
      if (t.type === 'expense') item.expenses += t.amount;
      if (t.type === 'income') item.income += t.amount;
      item.savings = item.income - item.expenses;
    });
    let monthlyTrendData = Array.from(monthMap.values());
    if (windowMonths === 6) monthlyTrendData = monthlyTrendData.slice(-6);

    const categoryMap = new Map();
    tx.filter((t) => t.type === 'expense').forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });
    const categorySplitData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
    const totalCategorySpend = categorySplitData.reduce((sum, c) => sum + c.value, 0);
    const topCategoryData = [...categorySplitData]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((c) => ({
        ...c,
        percent: totalCategorySpend > 0 ? Math.round((c.value / totalCategorySpend) * 100) : 0,
      }));

    const weekMap = weekLabels.map((day) => ({ day, amount: 0 }));
    tx.filter((t) => t.type === 'expense').forEach((t) => {
      const day = new Date(t.date).getDay();
      weekMap[day].amount += t.amount;
    });

    const monthNow = new Date().getMonth();
    const prevMonth = monthNow === 0 ? 11 : monthNow - 1;
    const compare = [
      { name: monthLabels[prevMonth], income: 0, expenses: 0 },
      { name: monthLabels[monthNow], income: 0, expenses: 0 },
    ];
    tx.forEach((t) => {
      const d = new Date(t.date);
      const m = d.getMonth();
      if (m !== monthNow && m !== prevMonth) return;
      const bucket = m === prevMonth ? compare[0] : compare[1];
      if (t.type === 'income') bucket.income += t.amount;
      if (t.type === 'expense') bucket.expenses += t.amount;
    });

    return {
      overview: { totalExpenses, totalIncome, savings },
      monthlyTrend: monthlyTrendData,
      expenseCategorySplit: categorySplitData,
      weeklyExpenses: weekMap,
      monthlyCompare: compare,
      topCategories: topCategoryData,
      avgMonthlyExpense: Math.round(monthlyTrendData.reduce((sum, m) => sum + m.expenses, 0) / (monthlyTrendData.length || 1)),
    };
  }, [financeData, selectedYear, windowMonths]);

  const tooltipStyle = {
    borderRadius: '12px',
    border: `1px solid ${isSky ? '#bae6fd' : '#334155'}`,
    background: isSky ? '#ffffff' : '#0f172a',
  };

  return (
    <div>
      <div className={`mb-7 rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.15em] ${isSky ? 'text-sky-700' : 'text-sky-300'}`}>Analytics</p>
            <h2 className={`mt-1 text-4xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Spending Intelligence</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${isSky ? 'border-sky-200 bg-white text-slate-700' : 'border-sky-800 bg-slate-900 text-slate-100'}`}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {[6, 12].map((months) => (
              <button
                key={months}
                onClick={() => setWindowMonths(months)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  windowMonths === months
                    ? isSky ? 'bg-sky-700 text-white' : 'bg-sky-600 text-white'
                    : isSky ? 'bg-sky-100 text-sky-800' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {months}M
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className={`rounded-3xl border p-6 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
          <p className={`text-base font-semibold ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>Total Income</p>
          <p className="mt-2 text-4xl font-extrabold text-emerald-600">Rs {overview.totalIncome.toLocaleString()}</p>
        </div>
        <div className={`rounded-3xl border p-6 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
          <p className={`text-base font-semibold ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>Total Expenses</p>
          <p className="mt-2 text-4xl font-extrabold text-rose-600">Rs {overview.totalExpenses.toLocaleString()}</p>
        </div>
        <div className={`rounded-3xl border p-6 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
          <p className={`text-base font-semibold ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>Net Savings</p>
          <p className="mt-2 text-4xl font-extrabold text-sky-700">Rs {overview.savings.toLocaleString()}</p>
        </div>
        <div className={`rounded-3xl border p-6 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
          <p className={`text-base font-semibold ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>Avg Monthly Expense</p>
          <p className="mt-2 text-4xl font-extrabold text-amber-600">Rs {avgMonthlyExpense.toLocaleString()}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}
        >
          <h3 className={`text-2xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Income vs Expense vs Savings</h3>
          <div className="mt-5 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={isSky ? '#e2e8f0' : '#334155'} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="savings" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={`rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-gradient-to-b from-white to-sky-50/70' : 'border-sky-800/40 bg-gradient-to-b from-slate-900 to-slate-900/70'}`}
        >
          <h3 className={`text-2xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Expense Category Split</h3>
          <div className="mt-5 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseCategorySplit} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={3}>
                  {expenseCategorySplit.map((item, idx) => (
                    <Cell key={`${item.name}-${idx}`} fill={categoryColors[idx % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={`mt-2 space-y-2 text-sm ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>
            {topCategories.length === 0 && <p>No expense categories available yet.</p>}
            {topCategories.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span className="font-semibold">{item.percent}%</span>
              </div>
            ))}
          </div>
        </motion.article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className={`rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
          <h3 className={`text-2xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Weekly Expense Activity</h3>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyExpenses}>
                <defs>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isSky ? '#e2e8f0' : '#334155'} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="amount" stroke="#0284c7" fill="url(#expenseFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={`rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
          <h3 className={`text-2xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Current vs Previous Month</h3>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke={isSky ? '#e2e8f0' : '#334155'} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Analytics;
