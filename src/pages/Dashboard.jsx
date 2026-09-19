import { Link } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { DashboardCards } from '../components/DashboardCards';
import { TransactionList } from '../components/TransactionList';
import { TransactionForm } from '../components/TransactionForm';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowRight, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getCategoryConfig } from '../lib/categories';

export default function DashboardPage() {
  const { monthlyData, categoryMap, transactions } = useExpenses();
  const userName = localStorage.getItem('spendwise-username');

  // Top 4 expense categories
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const totalCategorySpend = topCategories.reduce((a, [, v]) => a + v, 0);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary" style={{ fontFamily: 'Caveat, cursive' }}>
            {greeting}{userName ? `, ${userName}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your financial overview.</p>
        </div>
        <TransactionForm />
      </div>

      {/* KPI Cards */}
      <DashboardCards />

      {/* Charts + Top Categories */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Monthly Overview Chart */}
        <Card className="lg:col-span-3 bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Monthly Overview
            </CardTitle>
            <p className="text-xs text-muted-foreground">Income vs Expenses — Last 6 months</p>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                <Wallet size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Add transactions to see your chart</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-foreground)' }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Top Spending
            </CardTitle>
            <p className="text-xs text-muted-foreground">Your highest expense categories</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No expense data yet.</p>
            ) : (
              topCategories.map(([category, amount], i) => {
                const pct = totalCategorySpend > 0 ? (amount / totalCategorySpend) * 100 : 0;
                const catConfig = getCategoryConfig(category);
                const CatIcon = catConfig.icon;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-foreground font-medium flex items-center gap-2">
                        <CatIcon size={14} className={catConfig.color} />
                        {category}
                      </span>
                      <span className="text-muted-foreground font-mono">₹{amount.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%`, backgroundColor: catConfig.color.includes('orange') ? '#fb923c' : catConfig.color.includes('blue') ? '#60a5fa' : catConfig.color.includes('pink') ? '#f472b6' : catConfig.color.includes('yellow') ? '#fbbf24' : '#94a3b8' }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '500ms' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Recent Transactions
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Your last 5 transactions</p>
          </div>
          {transactions.length > 5 && (
            <Link
              to="/transactions"
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <TransactionList limit={5} />
        </CardContent>
      </Card>
    </div>
  );
}
