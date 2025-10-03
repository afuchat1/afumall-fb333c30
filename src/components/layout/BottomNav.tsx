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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 shadow-lg">
      <div className="flex justify-around items-center py-1.5">
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-1.5 px-2 min-w-0 relative ${
                isActive ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-4.5 w-4.5" />
                {badge && badge > 0 && (
                  <Badge 
                    className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full p-0 flex items-center justify-center text-[9px] bg-accent text-accent-foreground"
                  >
                    {badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] mt-0.5 truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};