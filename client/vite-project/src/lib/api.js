import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

// Server stores transactions with `_id` and a full ISO date; the UI was
// built around `id` + a YYYY-MM-DD date string, so normalize once here
// instead of touching every page that reads a transaction.
const normalizeTransaction = (tx) => ({
  id: tx._id,
  title: tx.title,
  amount: tx.amount,
  type: tx.type,
  category: tx.category,
  date: new Date(tx.date).toISOString().slice(0, 10),
});

export const registerUser = (username, email, password) =>
  api.post('/auth/register', { username, email, password }).then((r) => r.data);

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const getMe = () => api.get('/auth/me').then((r) => r.data.user);

export const listTransactions = (month) =>
  api
    .get('/transactions', { params: month ? { month } : {} })
    .then((r) => r.data.transactions.map(normalizeTransaction));

export const createTransaction = (payload) =>
  api.post('/transactions', payload).then((r) => normalizeTransaction(r.data.transaction));

export const deleteTransactionApi = (id) => api.delete(`/transactions/${id}`).then((r) => r.data);

export const resetAllApi = () => api.delete('/transactions/reset').then((r) => r.data);

export const resetMonthApi = (yearMonth) =>
  api.delete(`/transactions/month/${yearMonth}`).then((r) => r.data);

export const listBudgets = () => api.get('/budgets').then((r) => r.data.budgets);

export const upsertBudget = (name, amount) =>
  api.post('/budgets', { name, amount }).then((r) => r.data.budget);

export const getAnalyticsSummary = (month) =>
  api.get('/analytics/summary', { params: month ? { month } : {} }).then((r) => r.data);

export default api;
