import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});

  const loadData = async () => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      return;
    }
    try {
      const [txnRes, budgetRes, statsRes, monthlyRes, categoryRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/budgets'),
        api.get('/analytics/summary'),
        api.get('/analytics/monthly'),
        api.get('/analytics/categories')
      ]);
      const txns = txnRes.data.map(t => ({
        ...t,
        date: t.transaction_date || t.date
      }));
      setTransactions(txns);
      setBudgets(budgetRes.data);
      setStats({
        totalIncome: statsRes.data.total_income,
        totalExpense: statsRes.data.total_expense,
        balance: statsRes.data.balance
      });
      setMonthlyData(monthlyRes.data);
      
      const catMap = {};
      categoryRes.data.forEach(item => {
        catMap[item.category] = item.amount;
      });
      setCategoryMap(catMap);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const addTransaction = async (transaction) => {
    try {
      const payload = {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        transaction_date: transaction.transaction_date || (transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0])
      };
      const res = await api.post('/transactions', payload);
      const newTxn = { ...res.data, date: res.data.transaction_date };
      setTransactions([newTxn, ...transactions]);
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const editTransaction = async (id, updatedTransaction) => {
    try {
      const res = await api.put(`/transactions/${id}`, updatedTransaction);
      setTransactions(transactions.map(t => t.id === id ? res.data : t));
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const addBudget = async (budget) => {
    try {
      const res = await api.post('/budgets', budget);
      setBudgets([...budgets, res.data]);
    } catch (err) {
      throw err;
    }
  };
  
  const editBudget = async (id, updatedBudget) => {
    try {
      const res = await api.put(`/budgets/${id}`, updatedBudget);
      setBudgets(budgets.map(b => b.id === id ? res.data : b));
    } catch (err) {
      throw err;
    }
  }

  const deleteBudget = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets(budgets.filter(b => b.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const clearAllData = async () => {
    try {
      await api.delete('/data');
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const restoreData = async (data) => {
    try {
      await api.post('/backup/import', data);
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const budgetProgress = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const limit = parseFloat(budget.monthly_limit);
    const percentage = limit > 0 ? (spent / limit) * 100 : 100;
    
    return {
      id: budget.id,
      category: budget.category,
      limit: limit,
      spent: spent,
      percentage: percentage,
      remaining: limit - spent
    };
  });

  return (
    <ExpenseContext.Provider value={{
      transactions,
      budgets,
      budgetProgress,
      monthlyData,
      categoryMap,
      addTransaction,
      editTransaction,
      deleteTransaction,
      addBudget,
      editBudget,
      deleteBudget,
      clearAllData,
      restoreData,
      refreshData: loadData,
      ...stats
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
