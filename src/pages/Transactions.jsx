import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { TransactionForm } from '../components/TransactionForm';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getCategoryConfig, CategoryBadge } from '../lib/categories';
import { exportToCSV } from '../lib/exportUtils';

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useExpenses();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
                          (t.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (t) => {
    deleteTransaction(t.id);
    toast.success(`Deleted: ${t.description}`);
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    exportToCSV(filtered);
    toast.success(`Exported ${filtered.length} transactions to CSV`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary" style={{ fontFamily: 'Caveat, cursive' }}>
            Transactions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="cursor-pointer gap-2">
            <Download size={16} />
            Export CSV
          </Button>
          <TransactionForm />
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by description or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/30 border-border/50"
              />
            </div>
            <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
              {['all', 'income', 'expense'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                    filterType === type
                      ? type === 'income' ? 'bg-accent/20 text-accent shadow-sm'
                      : type === 'expense' ? 'bg-destructive/20 text-destructive shadow-sm'
                      : 'bg-primary/20 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="text-muted-foreground text-sm">
                {transactions.length === 0 ? 'No transactions yet. Add your first one!' : 'No results match your search.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((t, i) => {
                const catConfig = getCategoryConfig(t.category);
                const CatIcon = catConfig.icon;
                return (
                  <div
                    key={t.id}
                    className="group flex items-center gap-4 p-3 rounded-xl bg-background/50 border border-border/30 hover:border-border hover:bg-card/80 transition-all duration-200 animate-fade-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${catConfig.bg}`}>
                      <CatIcon size={18} className={catConfig.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(t.transaction_date || t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-muted-foreground/40">•</span>
                        <CategoryBadge category={t.category} />
                      </div>
                    </div>
                    <div className={`text-right shrink-0 font-mono font-bold text-sm ${
                      t.type === 'income' ? 'text-accent' : 'text-destructive'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleDelete(t)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer shrink-0"
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
