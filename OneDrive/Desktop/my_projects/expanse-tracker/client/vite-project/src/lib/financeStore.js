const STORAGE_KEY = 'expanse_finance_data_v1';

const defaultData = {
  budgets: {
    Food: 9000,
    Transport: 5000,
    Shopping: 7000,
    Health: 4000,
    Bills: 6000,
    Other: 5000,
  },
  transactions: [
    { id: 't1', title: 'Salary Credit', amount: 35000, type: 'income', date: '2026-03-02', category: 'Income' },
    { id: 't2', title: 'Electricity Bill', amount: 2150, type: 'expense', date: '2026-03-01', category: 'Bills' },
    { id: 't3', title: 'Grocery Store', amount: 1340, type: 'expense', date: '2026-02-28', category: 'Food' },
    { id: 't4', title: 'Freelance Client', amount: 8500, type: 'income', date: '2026-02-27', category: 'Income' },
    { id: 't5', title: 'Metro Card', amount: 480, type: 'expense', date: '2026-02-26', category: 'Transport' },
  ],
};

const normalizeData = (data) => {
  if (!data || typeof data !== 'object') return defaultData;
  return {
    budgets: { ...defaultData.budgets, ...(data.budgets || {}) },
    transactions: Array.isArray(data.transactions) ? data.transactions : defaultData.transactions,
  };
};

export const getFinanceData = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData;
  try {
    return normalizeData(JSON.parse(raw));
  } catch {
    return defaultData;
  }
};

export const saveFinanceData = (data) => {
  const normalized = normalizeData(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('finance-data-updated'));
};

export const addTransaction = ({ title, amount, type, category, date }) => {
  const current = getFinanceData();
  const transaction = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title,
    amount: Number(amount),
    type,
    category,
    date,
  };
  saveFinanceData({
    ...current,
    transactions: [transaction, ...current.transactions],
  });
  return transaction;
};

export const deleteTransaction = (id) => {
  const current = getFinanceData();
  saveFinanceData({
    ...current,
    transactions: current.transactions.filter((tx) => tx.id !== id),
  });
};

export const resetAllFinanceData = () => {
  saveFinanceData({
    budgets: { ...defaultData.budgets },
    transactions: [],
  });
};

export const resetTransactionsForMonth = (yearMonth) => {
  const current = getFinanceData();
  const filteredTransactions = current.transactions.filter((tx) => !String(tx.date).startsWith(yearMonth));
  saveFinanceData({
    ...current,
    transactions: filteredTransactions,
  });
};

export const setBudgetForCategory = (category, amount) => {
  const trimmed = String(category || '').trim();
  if (!trimmed) return;
  const current = getFinanceData();
  saveFinanceData({
    ...current,
    budgets: {
      ...current.budgets,
      [trimmed]: Math.max(0, Number(amount) || 0),
    },
  });
};

const categoryKeywords = {
  food: 'Food',
  grocery: 'Food',
  restaurant: 'Food',
  transport: 'Transport',
  metro: 'Transport',
  fuel: 'Transport',
  shop: 'Shopping',
  shopping: 'Shopping',
  medical: 'Health',
  health: 'Health',
  bill: 'Bills',
  electricity: 'Bills',
  internet: 'Bills',
  salary: 'Income',
  freelance: 'Income',
};

export const parseFinancePrompt = (text) => {
  const input = text.toLowerCase().trim();
  const amountMatch = input.match(/(\d+(?:\.\d+)?)/);
  if (!amountMatch) {
    return { ok: false, message: 'I could not find an amount. Example: "spent 600 on food".' };
  }

  const amount = Number(amountMatch[1]);
  const isExpense = /(spent|spend|pay|paid|expense|bought|purchase|debit|minus|sent|gave)/.test(input);
  const isIncome = /(received|receive|recieved|recievd|credit|credited|earned|salary|income|got|deposit|deposited|added|inflow|\+)/.test(input);
  const type = isIncome && !isExpense ? 'income' : 'expense';

  let category = type === 'income' ? 'Income' : 'Other';
  for (const [word, mapped] of Object.entries(categoryKeywords)) {
    if (input.includes(word)) {
      category = mapped;
      break;
    }
  }

  let title = type === 'income' ? 'Income Entry' : 'Expense Entry';
  const onMatch = input.match(/on\s+([a-zA-Z\s]+)/);
  if (onMatch?.[1]) title = onMatch[1].trim().replace(/\b\w/g, (m) => m.toUpperCase());
  if (type === 'income' && category === 'Income' && input.includes('salary')) title = 'Salary Credit';

  return {
    ok: true,
    entry: {
      title,
      amount,
      type,
      category,
      date: new Date().toISOString().slice(0, 10),
    },
  };
};
