import { useState, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getCategoryConfig } from '../lib/categories';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const DATE_RANGES = [
  { label: 'This Month', value: 'month' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

export default function AnalyticsPage() {
  const { transactions } = useExpenses();
  const [dateRange, setDateRange] = useState('all');

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    if (dateRange === 'all') return transactions;
    const now = new Date();
    let startDate;
    switch (dateRange) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return transactions;
    }
    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, dateRange]);

  // Compute stats from filtered data
  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

    const categoryMap = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });

    // Monthly data
    const monthlyMap = {};
    filteredTransactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, income: 0, expense: 0 };
      monthlyMap[key][t.type] += t.amount;
    });
    const monthlyData = Object.values(monthlyMap);

    // Daily spending for current month
    const now = new Date();
    const dailySpending = {};
    filteredTransactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).forEach(t => {
      const day = new Date(t.date).getDate();
      dailySpending[day] = (dailySpending[day] || 0) + t.amount;
    });

    const dailyData = Object.entries(dailySpending)
      .map(([day, amount]) => ({ day: `Day ${day}`, amount }))
      .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));

    const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;

    return { income, expense, categoryMap, monthlyData, dailyData, dailySpending, savingsRate };
  }, [filteredTransactions]);

  const pieData = Object.entries(stats.categoryMap).map(([name, value]) => ({ name, value }));
  const hasData = filteredTransactions.length > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary" style={{ fontFamily: 'Caveat, cursive' }}>
            Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Visual breakdown of your finances.</p>
        </div>

        {/* Date Range Filters */}
        <div className="flex gap-1 p-1 bg-card/50 border border-border/50 rounded-lg">
          {DATE_RANGES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setDateRange(value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                dateRange === value
                  ? 'bg-primary/20 text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground">Add some transactions to see your analytics come alive!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="bg-card/50 border-border/50 animate-fade-up">
              <CardContent className="p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Savings Rate</p>
                <p className={`text-4xl font-bold font-mono ${stats.savingsRate >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {stats.savingsRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '80ms' }}>
              <CardContent className="p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Avg. Daily Spend</p>
                <p className="text-4xl font-bold font-mono text-chart-3">
                  ₹{(stats.expense / Math.max(Object.keys(stats.dailySpending).length, 1)).toFixed(0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '160ms' }}>
              <CardContent className="p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Categories Used</p>
                <p className="text-4xl font-bold font-mono text-chart-5">
                  {Object.keys(stats.categoryMap).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Income vs Expense Bar Chart */}
          <Card className="bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Income vs Expenses
              </CardTitle>
              <p className="text-xs text-muted-foreground">Monthly comparison</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-foreground)' }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category Pie Chart */}
            <Card className="bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  Expense Breakdown
                </CardTitle>
                <p className="text-xs text-muted-foreground">By category</p>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No expense data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-foreground)' }}
                        formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px' }}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Daily Spending */}
            <Card className="bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  Daily Spending
                </CardTitle>
                <p className="text-xs text-muted-foreground">Current month</p>
              </CardHeader>
              <CardContent>
                {stats.dailyData.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No spending this month.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={stats.dailyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-foreground)' }}
                        formatter={(value) => [`₹${value.toFixed(2)}`, 'Spent']}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={2} fill="url(#dailyGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
