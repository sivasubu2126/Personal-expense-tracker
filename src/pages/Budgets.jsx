import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Trash2, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { toast } from 'sonner';
import { EXPENSE_CATEGORIES, getCategoryConfig } from '../lib/categories';

export default function BudgetsPage() {
  const { budgets, addBudget, deleteBudget, budgetProgress } = useExpenses();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  const handleAddBudget = (e) => {
    e.preventDefault();
    if (!category || !limit) {
      toast.error('Please select a category and set a limit');
      return;
    }
    addBudget({ category, monthly_limit: parseFloat(limit) });
    toast.success(`Budget set: ₹${parseFloat(limit).toFixed(2)} for ${category}`);
    setCategory('');
    setLimit('');
    setOpen(false);
  };

  const handleDeleteBudget = (id) => {
    deleteBudget(id);
    toast.success(`Budget removed`);
  };

  // Categories that already have budgets
  const usedCategories = budgets.map(b => b.category);
  const availableCategories = EXPENSE_CATEGORIES.filter(c => !usedCategories.includes(c));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary" style={{ fontFamily: 'Caveat, cursive' }}>
            Budgets
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Set spending limits for each category.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 
            hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Plus size={16} />
            Set Budget
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] border-border bg-card shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl text-primary" style={{ fontFamily: 'Caveat, cursive' }}>
                New Budget
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBudget} className="grid gap-5 pt-2">
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-muted/30 border-border/50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {availableCategories.length === 0 ? (
                      <SelectItem value="_none" disabled>All categories have budgets</SelectItem>
                    ) : (
                      availableCategories.map(c => {
                        const config = getCategoryConfig(c);
                        const Icon = config.icon;
                        return (
                          <SelectItem key={c} value={c} className="focus:bg-primary/10">
                            <span className="flex items-center gap-2">
                              <Icon size={14} className={config.color} />
                              {c}
                            </span>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Monthly Limit (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="5000"
                  className="bg-muted/30 border-border/50 font-mono"
                />
              </div>
              <Button type="submit" className="w-full font-semibold cursor-pointer">
                Create Budget
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Cards */}
      {budgetProgress.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Target className="text-muted-foreground" size={28} />
            </div>
            <p className="text-muted-foreground text-sm">No budgets set yet.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Create your first budget to start tracking spending limits.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgetProgress.map((b, i) => {
            const isOver = b.percentage >= 100;
            const isWarning = b.percentage >= 80 && b.percentage < 100;
            const catConfig = getCategoryConfig(b.category);
            const CatIcon = catConfig.icon;

            return (
              <Card
                key={b.category}
                className={`bg-card/50 border animate-fade-up transition-all duration-300 ${
                  isOver ? 'border-destructive/30' : isWarning ? 'border-yellow-500/30' : 'border-border/50'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${catConfig.bg}`}>
                        <CatIcon size={18} className={catConfig.color} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{b.category}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ₹{b.spent.toFixed(2)} of ₹{b.limit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOver ? (
                        <AlertTriangle size={16} className="text-destructive" />
                      ) : (
                        <CheckCircle size={16} className="text-accent" />
                      )}
                      <button
                        onClick={() => handleDeleteBudget(b.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                        aria-label="Delete budget"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isOver ? 'bg-destructive' : isWarning ? 'bg-yellow-500' : 'bg-accent'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-mono font-bold ${
                      isOver ? 'text-destructive' : isWarning ? 'text-yellow-500' : 'text-accent'
                    }`}>
                      {b.percentage.toFixed(0)}%
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {b.remaining >= 0 ? `₹${b.remaining.toFixed(2)} left` : `₹${Math.abs(b.remaining).toFixed(2)} over`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
