import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { deleteTransaction, getFinanceData } from '../lib/financeStore';

const Transactions = () => {
  const outlet = useOutletContext();
  const theme = outlet?.theme || 'sky';
  const isSky = theme === 'sky';
  const [transactions, setTransactions] = useState(() => getFinanceData().transactions);

  useEffect(() => {
    const sync = () => setTransactions(getFinanceData().transactions);
    window.addEventListener('finance-data-updated', sync);
    return () => window.removeEventListener('finance-data-updated', sync);
  }, []);

  const handleDelete = (tx) => {
    if (!window.confirm(`Delete "${tx.title}" transaction?`)) return;
    deleteTransaction(tx.id);
  };

  return (
    <div>
      <div className={`mb-7 rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
        <p className={`text-base font-semibold uppercase tracking-[0.15em] ${isSky ? 'text-sky-700' : 'text-sky-300'}`}>Transactions</p>
        <h2 className={`mt-1 text-4xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Transaction Timeline</h2>
      </div>

      <section className={`rounded-3xl border p-7 shadow-sm ${isSky ? 'border-sky-200 bg-white/90' : 'border-sky-800/40 bg-slate-900/70'}`}>
        <div className="space-y-4">
          {transactions.length === 0 && (
            <div className={`rounded-2xl border border-dashed p-8 text-center ${isSky ? 'border-sky-200 bg-sky-50/50 text-slate-500' : 'border-sky-800/40 bg-slate-900/40 text-slate-300'}`}>
              No transactions found.
            </div>
          )}
          {transactions.map((tx, index) => (
            <motion.article
              key={tx.id || `${tx.title}-${tx.date}-${index}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              whileHover={{ y: -2 }}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${isSky ? 'border-sky-100 bg-sky-50/60' : 'border-sky-800/40 bg-slate-900/40'}`}
            >
              <div>
                <p className={`text-lg font-bold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>{tx.title}</p>
                <p className={`text-sm font-medium ${isSky ? 'text-slate-500' : 'text-slate-300'}`}>{tx.category} | {tx.date}</p>
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
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Transactions;
