import { useExpenses } from '../hooks/useExpenses';
import { Trash2, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { getCategoryConfig, CategoryBadge } from '../lib/categories';

export function TransactionList({ limit }) {
  const { transactions, deleteTransaction } = useExpenses();
  const displayList = limit ? transactions.slice(0, limit) : transactions;

  const handleDelete = (t) => {
    deleteTransaction(t.id);
    toast.success(`Deleted: ${t.description}`);
  };

  if (displayList.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <ArrowLeftRight className="text-muted-foreground" size={24} />
        </div>
        <p className="text-muted-foreground text-sm">No transactions yet.</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Add your first transaction to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayList.map((t, i) => {
        const catConfig = getCategoryConfig(t.category);
        const CatIcon = catConfig.icon;

        return (
          <div
            key={t.id}
            className="group flex items-center gap-4 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-border hover:bg-card transition-all duration-200 animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Category Icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${catConfig.bg}`}>
              <CatIcon size={18} className={catConfig.color} />
            </div>

            {/* Details */}
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

            {/* Amount */}
            <div className={`text-right shrink-0 font-mono font-bold text-sm ${
              t.type === 'income' ? 'text-accent' : 'text-destructive'
            }`}>
              {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
            </div>

            {/* Delete */}
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
  );
}
