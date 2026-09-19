import { useRef, useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { exportBackup, importBackup } from '../lib/exportUtils';
import { toast } from 'sonner';
import { Download, Upload, Trash2, Sun, Moon, User, Shield, Info, LogOut } from 'lucide-react';
import { api } from '../api/client';

export default function SettingsPage() {
  const { transactions, budgets, restoreData, clearAllData } = useExpenses();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleExportBackup = () => {
    exportBackup(transactions, budgets);
    toast.success('Backup exported successfully!');
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importBackup(file);
      await restoreData(data);
      toast.success(`Restored ${data.transactions.length} transactions and ${data.budgets.length} budgets!`);
    } catch (err) {
      toast.error(err.message || 'Failed to import backup');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      try {
        await clearAllData();
        toast.success('All data cleared.');
      } catch (err) {
        toast.error('Failed to clear data');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/change-password', {
        current_password: password,
        new_password: newPassword
      });
      toast.success('Password changed successfully');
      setPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary" style={{ fontFamily: 'Caveat, cursive' }}>
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Customize your SpendWise experience.</p>
      </div>

      <Card className="bg-card/50 border-border/50 animate-fade-up">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            <User size={18} className="text-primary" />
            Profile & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Account Information</Label>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={logout} className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t border-border/50">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Change Password</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                type="password"
                placeholder="Current Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/30"
              />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-muted/30"
              />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '80ms' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            {theme === 'dark' ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-400" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
            <div>
              <p className="text-sm font-semibold text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Currently using {theme === 'dark' ? 'Dark' : 'Light'} mode
              </p>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="cursor-pointer gap-2">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '160ms' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            <Shield size={18} className="text-accent" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
            <div>
              <p className="text-sm font-semibold text-foreground">Export Backup</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download all your data as a JSON file ({transactions.length} transactions, {budgets.length} budgets)
              </p>
            </div>
            <Button variant="outline" onClick={handleExportBackup} className="cursor-pointer gap-2">
              <Download size={16} />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
            <div>
              <p className="text-sm font-semibold text-foreground">Import Backup</p>
              <p className="text-xs text-muted-foreground mt-0.5">Restore data from a previously exported JSON file</p>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImportBackup}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="cursor-pointer gap-2">
                <Upload size={16} />
                Import
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/15">
            <div>
              <p className="text-sm font-semibold text-destructive">Clear All Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently delete all transactions and budgets</p>
            </div>
            <Button variant="destructive" onClick={handleClearData} className="cursor-pointer gap-2">
              <Trash2 size={16} />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 animate-fade-up" style={{ animationDelay: '240ms' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            <Info size={18} className="text-chart-5" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Name</span>
              <span className="text-foreground font-medium">SpendWise</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="text-foreground font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Storage</span>
              <span className="text-foreground font-medium">Secure Cloud Database</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
