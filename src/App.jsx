import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExpenseProvider } from './hooks/useExpenses';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from 'sonner';

import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ExpenseProvider>
            <Toaster position="bottom-right" theme="system" />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </ExpenseProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
