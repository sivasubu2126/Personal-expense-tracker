import { useExpenses } from '../hooks/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';

export function DashboardCards() {
  const { balance, totalIncome: income, totalExpense: expense, transactions } = useExpenses();
  const totalTransactions = transactions.length;

  const cards = [
    {
      title: 'Total Balance',
      value: balance,
      icon: DollarSign,
      color: balance >= 0 ? 'text-primary' : 'text-destructive',
      bg: balance >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20',
      iconBg: balance >= 0 ? 'bg-primary/20' : 'bg-destructive/20',
      prefix: balance >= 0 ? '₹' : '-₹',
      displayValue: Math.abs(balance),
    },
    {
      title: 'Total Income',
      value: income,
      icon: ArrowUpRight,
      color: 'text-accent',
      bg: 'bg-accent/5 border-accent/15',
      iconBg: 'bg-accent/15',
      prefix: '+₹',
      displayValue: income,
    },
    {
      title: 'Total Expenses',
      value: expense,
      icon: ArrowDownRight,
      color: 'text-destructive',
      bg: 'bg-destructive/5 border-destructive/15',
      iconBg: 'bg-destructive/15',
      prefix: '-₹',
      displayValue: expense,
    },
    {
      title: 'Transactions',
      value: totalTransactions,
      icon: BarChart3,
      color: 'text-chart-5',
      bg: 'bg-chart-5/5 border-chart-5/15',
      iconBg: 'bg-chart-5/15',
      prefix: '',
      displayValue: totalTransactions,
      isCount: true,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <Card
          key={card.title}
          className={`${card.bg} border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-up`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{card.title}</p>
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} />
              </div>
            </div>
            <p className={`text-2xl lg:text-3xl font-bold ${card.color} font-mono tracking-tight`}>
              {card.isCount ? card.displayValue : `${card.prefix}${card.displayValue.toFixed(2)}`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
