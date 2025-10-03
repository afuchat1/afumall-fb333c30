import { Home, Tag, ShoppingCart, User, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export const BottomNav = () => {
  const location = useLocation();
  const { getItemCount } = useCart();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: getItemCount() },
    { icon: User, label: 'Account', path: user ? '/profile' : '/auth' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-background/95 backdrop-blur-lg border-t border-border/50 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-1.5 px-2 min-w-0 relative transition-all duration-300 ${
                isActive ? 'text-accent scale-105' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <div className={`${isActive ? 'bg-accent/10 p-2 rounded-xl' : ''}`}>
                  <Icon className={`${isActive ? 'h-5 w-5' : 'h-4.5 w-4.5'} transition-all`} />
                </div>
                {badge && badge > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[9px] bg-accent text-accent-foreground animate-pulse"
                  >
                    {badge}
                  </Badge>
                )}
              </div>
              <span className={`text-[10px] mt-1 truncate font-medium transition-all ${
                isActive ? 'scale-105' : ''
              }`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};