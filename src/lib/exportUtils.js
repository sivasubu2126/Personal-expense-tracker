// Export transactions to CSV file and trigger download
export function exportToCSV(transactions) {
  if (transactions.length === 0) return;

  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (₹)'];
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString('en-IN'),
    `"${t.description.replace(/"/g, '""')}"`,
    t.category || 'Other',
    t.type,
    t.type === 'income' ? t.amount.toFixed(2) : `-${t.amount.toFixed(2)}`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SpendWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Export all data as JSON for backup
export function exportBackup(transactions, budgets) {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    budgets,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SpendWise_Backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Import backup from JSON file
export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.transactions || !Array.isArray(data.transactions)) {
          reject(new Error('Invalid backup file format'));
          return;
        }
        resolve({
          transactions: data.transactions.map(t => ({
            ...t,
            category: t.category || 'Other',
          })),
          budgets: data.budgets || [],
        });
      } catch (err) {
        reject(new Error('Could not parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}
