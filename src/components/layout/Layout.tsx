import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-14 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};