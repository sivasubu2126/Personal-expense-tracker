import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Main content area — offset by sidebar width on desktop */}
      <main className="lg:ml-[260px] min-h-screen">
        {/* Decorative background glows */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/3 blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 left-1/2 w-[400px] h-[400px] bg-accent/3 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 p-4 pt-16 lg:pt-6 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
