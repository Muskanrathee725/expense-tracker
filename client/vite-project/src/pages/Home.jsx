import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const cardData = [
  {
    title: 'Smart Expense Logging',
    description: 'Add daily spending quickly and keep every transaction organized by category.',
    stat: '10s',
    statLabel: 'Average entry time',
  },
  {
    title: 'Monthly Budget Guard',
    description: 'Track your limits in real-time with clear progress indicators and smart reminders.',
    stat: '92%',
    statLabel: 'Users stay on budget',
  },
  {
    title: 'Insightful Reports',
    description: 'Understand where your money goes with simple, visual summaries that are easy to act on.',
    stat: '24/7',
    statLabel: 'Finance visibility',
  },
];

const insightData = [
  { label: 'Monthly Savings Growth', value: '+18.4%', tone: 'text-emerald-600' },
  { label: 'Average Daily Expense', value: 'Rs 840', tone: 'text-sky-700' },
  { label: 'Budget Health Score', value: '8.7/10', tone: 'text-cyan-700' },
];

const Home = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('expanse_theme') || 'sky');
  const isSky = theme === 'sky';
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    localStorage.setItem('expanse_theme', theme);
  }, [theme]);

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('token', 'dummy-token-123');
    window.location.href = '/dashboard';
  };

  const handleRegister = (e) => {
    e.preventDefault();
    localStorage.setItem('token', 'dummy-token-123');
    window.location.href = '/dashboard';
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${isSky ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        .landing-font { font-family: 'Outfit', sans-serif; }

        .orbital-ring {
          position: absolute;
          inset: 1rem;
          border-radius: 9999px;
          border: 1px dashed rgba(14, 116, 144, 0.35);
          animation: rotateRing 22s linear infinite;
        }

        .orbital-dot {
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          position: absolute;
          right: 14%;
          top: 48%;
          background: #0ea5e9;
          box-shadow: 0 0 20px rgba(14, 165, 233, 0.6);
        }

        .orbital-dot-delay {
          background: #0284c7;
          top: 12%;
          right: 52%;
        }

        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -left-24 -top-16 h-80 w-80 rounded-full blur-3xl ${isSky ? 'bg-cyan-200/60' : 'bg-cyan-500/20'}`} />
        <div className={`absolute -right-24 top-24 h-96 w-96 rounded-full blur-3xl ${isSky ? 'bg-sky-300/50' : 'bg-sky-500/20'}`} />
        <div className={`absolute bottom-0 left-1/4 h-72 w-72 rounded-full blur-3xl ${isSky ? 'bg-cyan-100/80' : 'bg-blue-500/20'}`} />
      </div>

      <div className="landing-font relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-16 pt-8 md:px-10">
        <header className={`mb-10 flex items-center justify-between rounded-full border px-5 py-3 backdrop-blur ${isSky ? 'border-sky-200/80 bg-white/80' : 'border-sky-800/40 bg-slate-900/70'}`}>
          <div className={`text-3xl font-extrabold tracking-tight ${isSky ? 'text-sky-900' : 'text-sky-100'}`}>Expanse Tracker</div>
          <nav className={`hidden items-center gap-7 text-base font-medium md:flex ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>
           
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme((prev) => (prev === 'sky' ? 'midnight' : 'sky'))}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${isSky ? 'border border-sky-200 bg-white text-sky-800 hover:bg-sky-50' : 'border border-sky-700 bg-slate-800 text-sky-200 hover:bg-slate-700'}`}
            >
              {isSky ? 'Midnight' : 'Sky'}
            </button>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="rounded-full bg-sky-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
            >
              Login
            </button>
          </div>
        </header>

        <section className="grid items-center gap-10 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
           
            <h1 className={`text-5xl font-extrabold leading-[1.02] md:text-7xl lg:text-8xl ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>
              Track every rupee.
              <span className="block text-sky-700">Grow with confidence.</span>
            </h1>
            <p className={`mt-6 max-w-xl text-lg md:text-2xl ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>
              Expanse Tracker gives you a clean way to monitor expenses, control budgets, and improve savings without complexity.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="rounded-full bg-sky-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-800 md:text-lg"
              >
                Create Account
              </button>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="rounded-full border border-sky-300 bg-white px-8 py-4 text-base font-semibold text-sky-800 transition hover:border-sky-400 md:text-lg"
              >
                Explore Dashboard
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`relative mx-auto h-[380px] w-full max-w-[560px] rounded-[2.2rem] border p-8 shadow-2xl ${isSky ? 'border-sky-200 bg-gradient-to-br from-sky-100 to-cyan-50 shadow-sky-100' : 'border-sky-800/40 bg-gradient-to-br from-slate-900 to-cyan-950/30 shadow-slate-900/60'}`}
          >
            <div className="orbital-ring">
              <div className="orbital-dot" />
              <div className="orbital-dot orbital-dot-delay" />
            </div>

            <div className="absolute inset-0 m-auto h-56 w-56 rounded-full border border-sky-200/80 bg-white/70 backdrop-blur-md">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 14, ease: 'linear' }} className="relative h-full w-full">
                <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-sky-700 px-4 py-1.5 text-sm font-semibold text-white">Budget</span>
                <span className="absolute bottom-2 left-2 rounded-full bg-cyan-700 px-4 py-1.5 text-sm font-semibold text-white">Income</span>
                <span className="absolute bottom-2 right-2 rounded-full bg-slate-700 px-4 py-1.5 text-sm font-semibold text-white">Savings</span>
              </motion.div>
            </div>

            <div className="absolute bottom-6 left-6 rounded-2xl border border-sky-200 bg-white/90 px-4 py-3 shadow">
              <p className="text-sm font-semibold text-slate-500">This Month</p>
              <p className="text-2xl font-extrabold text-slate-900">Rs 27,450</p>
            </div>
          </motion.div>
        </section>

        <section id="features" className="mt-16 grid gap-5 md:mt-20 md:grid-cols-3">
          {cardData.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -9 }}
              className={`rounded-3xl border p-6 shadow-md ${isSky ? 'border-sky-200 bg-gradient-to-b from-white to-sky-50/70 shadow-sky-100' : 'border-sky-800/40 bg-gradient-to-b from-slate-900 to-slate-900/70 shadow-slate-900/60'}`}
            >
              <h3 className={`text-2xl font-bold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>{card.title}</h3>
              <p className={`mt-2 text-base leading-7 ${isSky ? 'text-slate-600' : 'text-slate-300'}`}>{card.description}</p>
            </motion.article>
          ))}
        </section>

        <section id="insights" className="mt-14 grid gap-6 md:mt-20 md:grid-cols-[1.2fr_1fr]">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`rounded-[2rem] border p-7 shadow-md ${isSky ? 'border-sky-200 bg-white/90 shadow-sky-100' : 'border-sky-800/40 bg-slate-900/70 shadow-slate-900/60'}`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Insights</p>
            <h2 className={`mt-3 text-3xl font-extrabold md:text-4xl ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>
              Understand your spending behavior in one glance.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {insightData.map((item) => (
                <div key={item.label} className={`rounded-2xl border p-4 ${isSky ? 'border-sky-100 bg-sky-50/60' : 'border-sky-800/40 bg-slate-900/40'}`}>
                  <p className={`text-xs font-semibold ${isSky ? 'text-slate-500' : 'text-slate-300'}`}>{item.label}</p>
                  <p className={`mt-2 text-2xl font-extrabold ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`relative overflow-hidden rounded-[2rem] border p-7 shadow-md ${isSky ? 'border-cyan-200 bg-gradient-to-br from-cyan-100 via-sky-100 to-white shadow-sky-100' : 'border-cyan-900/40 bg-gradient-to-br from-slate-900 to-cyan-950/30 shadow-slate-900/60'}`}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-14 -top-14 h-40 w-40 rounded-full border-2 border-dashed border-sky-300/70"
            />
            <p className="relative text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Live Goals</p>
            <h3 className={`relative mt-3 text-3xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Target Achiever</h3>
            <div className={`relative mt-8 rounded-2xl border p-4 ${isSky ? 'border-cyan-200 bg-white/80' : 'border-cyan-800/40 bg-slate-900/50'}`}>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>Emergency Fund</span>
                <span>72%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-sky-100">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '72%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600"
                />
              </div>
            </div>
          </motion.article>
        </section>
      </div>

      <Modal
        isOpen={isLoginOpen}
        onRequestClose={() => setIsLoginOpen(false)}
        className={`mx-auto mt-20 w-[92%] max-w-md rounded-3xl border p-8 outline-none ${isSky ? 'border-sky-200 bg-gradient-to-b from-white to-sky-50' : 'border-sky-800 bg-gradient-to-b from-slate-900 to-slate-900/80 text-slate-100'}`}
        overlayClassName={`fixed inset-0 z-50 backdrop-blur-sm ${isSky ? 'bg-slate-900/40' : 'bg-black/60'}`}
      >
        <h2 className={`mb-6 text-3xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-3 text-lg outline-none ring-sky-300 focus:ring"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-3 text-lg outline-none ring-sky-300 focus:ring"
            required
          />
          <button className="w-full rounded-xl bg-sky-700 py-3 text-lg font-semibold text-white hover:bg-sky-800">
            Login
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isRegisterOpen}
        onRequestClose={() => setIsRegisterOpen(false)}
        className={`mx-auto mt-16 w-[92%] max-w-md rounded-3xl border p-8 outline-none ${isSky ? 'border-sky-200 bg-gradient-to-b from-white to-sky-50' : 'border-sky-800 bg-gradient-to-b from-slate-900 to-slate-900/80 text-slate-100'}`}
        overlayClassName={`fixed inset-0 z-50 backdrop-blur-sm ${isSky ? 'bg-slate-900/40' : 'bg-black/60'}`}
      >
        <h2 className={`mb-6 text-3xl font-extrabold ${isSky ? 'text-slate-900' : 'text-slate-100'}`}>Create Account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-3 text-lg outline-none ring-sky-300 focus:ring"
            required
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-3 text-lg outline-none ring-sky-300 focus:ring"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-sky-200 px-4 py-3 text-lg outline-none ring-sky-300 focus:ring"
            required
          />
          <button className="w-full rounded-xl bg-sky-700 py-3 text-lg font-semibold text-white hover:bg-sky-800">
            Register
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Home;
