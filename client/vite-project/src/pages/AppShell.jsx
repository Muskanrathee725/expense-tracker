import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/expenses', label: 'Expenses' },
  { path: '/transactions', label: 'Transactions' },
  { path: '/analytics', label: 'Analytics' },
];

const AppShell = () => {
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('expanse_theme') || 'sky');

  useEffect(() => {
    localStorage.setItem('expanse_theme', theme);
  }, [theme]);

  return (
    <div className={`shell-font relative min-h-screen text-[17px] ${theme === 'sky' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        .shell-font { font-family: 'Plus Jakarta Sans', sans-serif; }

        .gradient-wave {
          background-size: 200% 200%;
          animation: waveMove 16s ease-in-out infinite;
        }

        .float-blob {
          animation: floatBlob 12s ease-in-out infinite;
        }

        .float-blob-delay {
          animation-delay: -5s;
        }

        @keyframes waveMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes floatBlob {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-16px) translateX(10px); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`gradient-wave absolute inset-0 ${
            theme === 'sky'
              ? 'bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.45),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(56,189,248,0.4),transparent_40%),linear-gradient(135deg,#e0f2fe_0%,#f0f9ff_45%,#e6fffa_100%)]'
              : 'bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.24),transparent_40%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#082f49_100%)]'
          }`}
        />
        <div className={`float-blob absolute -left-20 top-6 h-72 w-72 rounded-full blur-3xl ${theme === 'sky' ? 'bg-cyan-200/70' : 'bg-sky-500/20'}`} />
        <div className={`float-blob float-blob-delay absolute right-8 top-24 h-72 w-72 rounded-full blur-3xl ${theme === 'sky' ? 'bg-sky-200/60' : 'bg-cyan-500/20'}`} />
        <div className={`float-blob absolute bottom-10 left-1/4 h-56 w-56 rounded-full blur-3xl ${theme === 'sky' ? 'bg-cyan-100/70' : 'bg-blue-500/20'}`} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-8 md:px-10">
        <header className={`mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border p-5 shadow-sm ${
          theme === 'sky' ? 'border-sky-200 bg-white/85' : 'border-sky-900/40 bg-slate-900/70'
        }`}>
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.15em] ${theme === 'sky' ? 'text-sky-700' : 'text-sky-300'}`}>Expanse Tracker</p>
            <h1 className={`text-4xl font-extrabold ${theme === 'sky' ? 'text-slate-900' : 'text-slate-100'}`}>Control Center</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-base font-semibold">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-full px-4 py-2 transition ${
                    active
                      ? theme === 'sky'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-sky-500/20 text-sky-200'
                      : theme === 'sky'
                        ? 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                        : 'text-slate-300 hover:bg-sky-900/40 hover:text-sky-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => setTheme((prev) => (prev === 'sky' ? 'midnight' : 'sky'))}
              className={`rounded-full px-4 py-2 ${
                theme === 'sky'
                  ? 'border border-sky-200 bg-white text-sky-800 hover:bg-sky-50'
                  : 'border border-sky-700 bg-slate-800 text-sky-200 hover:bg-slate-700'
              }`}
            >
              {theme === 'sky' ? 'Midnight Theme' : 'Sky Theme'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              className={`rounded-full px-4 py-2 ${theme === 'sky' ? 'text-rose-600 hover:bg-rose-50' : 'text-rose-300 hover:bg-rose-900/30'}`}
            >
              Logout
            </button>
          </nav>
        </header>

        <Outlet context={{ theme }} />
      </div>
    </div>
  );
};

export default AppShell;
