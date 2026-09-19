import {
  Utensils, Car, ShoppingBag, Zap, Film, Heart, GraduationCap,
  Plane, Briefcase, Code, TrendingUp, Gift, HelpCircle, Wallet
} from 'lucide-react';

// Map each category to a Lucide icon and color
const CATEGORY_CONFIG = {
  'Food & Dining':     { icon: Utensils,      color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  'Transportation':    { icon: Car,            color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  'Shopping':          { icon: ShoppingBag,    color: 'text-pink-400',    bg: 'bg-pink-400/10' },
  'Bills & Utilities': { icon: Zap,            color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  'Entertainment':     { icon: Film,           color: 'text-purple-400',  bg: 'bg-purple-400/10' },
  'Health':            { icon: Heart,          color: 'text-red-400',     bg: 'bg-red-400/10' },
  'Education':         { icon: GraduationCap,  color: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
  'Travel':            { icon: Plane,          color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'Salary':            { icon: Briefcase,      color: 'text-green-400',   bg: 'bg-green-400/10' },
  'Freelance':         { icon: Code,           color: 'text-teal-400',    bg: 'bg-teal-400/10' },
  'Investment':        { icon: TrendingUp,     color: 'text-indigo-400',  bg: 'bg-indigo-400/10' },
  'Gift':              { icon: Gift,           color: 'text-rose-400',    bg: 'bg-rose-400/10' },
  'Other':             { icon: HelpCircle,     color: 'text-slate-400',   bg: 'bg-slate-400/10' },
};

export function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
}

export function CategoryIcon({ category, size = 16, className = '' }) {
  const config = getCategoryConfig(category);
  const Icon = config.icon;
  return <Icon size={size} className={`${config.color} ${className}`} />;
}

export function CategoryBadge({ category }) {
  const config = getCategoryConfig(category);
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
      <Icon size={11} />
      {category || 'Other'}
    </span>
  );
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
  'Entertainment', 'Health', 'Education', 'Travel', 'Gift', 'Other',
];

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Gift', 'Other',
];

export const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
