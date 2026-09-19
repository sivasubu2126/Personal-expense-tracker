import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryConfig } from '../lib/categories';

export function TransactionForm({ triggerClassName = '' }) {
  const { addTransaction } = useExpenses();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) {
      toast.error('Please fill in all fields');
      return;
    }

    addTransaction({
      description,
      amount: parseFloat(amount),
      type,
      category,
      transaction_date: date,
      date: date,
    });

    toast.success(`${type === 'income' ? 'Income' : 'Expense'} added: ₹${parseFloat(amount).toFixed(2)}`);

    // Reset form
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setOpen(false);
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 
        hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer ${triggerClassName}`}
      >
        <Plus size={16} />
        Add Transaction
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] border-border bg-card shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl text-primary" style={{ fontFamily: 'Caveat, cursive' }}>
            New Transaction
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5 pt-2">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`py-2 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-destructive/20 text-destructive shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`py-2 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-accent/20 text-accent shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-muted-foreground text-xs uppercase tracking-wider">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you spend on?"
              className="bg-muted/30 border-border/50 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-muted-foreground text-xs uppercase tracking-wider">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-muted/30 border-border/50 focus:border-primary font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-muted-foreground text-xs uppercase tracking-wider">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-muted/30 border-border/50 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-muted/30 border-border/50 focus:border-primary">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map(c => {
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
                })}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full mt-1 font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer"
          >
            {type === 'expense' ? 'Add Expense' : 'Add Income'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
