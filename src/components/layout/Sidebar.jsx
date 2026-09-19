import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, BarChart3, Target, X, Menu, Settings, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-[260px] bg-sidebar border-r border-sidebar-border
        flex flex-col transition-transform duration-300 ease-out
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SpendWise" className="w-10 h-10 rounded-xl" />
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Caveat, cursive' }}>
                SpendWise
              </h1>
              <p className="text-[11px] text-muted-foreground tracking-wider uppercase">Expense Tracker</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 sidebar-scroll overflow-y-auto">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-semibold mb-3 px-3">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-200 cursor-pointer group
                      ${isActive
                        ? 'bg-sidebar-active text-sidebar-active-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-muted/50 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon size={18} className={`transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    {label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-400" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>
    </>
  );
}
