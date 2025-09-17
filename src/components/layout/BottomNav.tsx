import { Home, Tag, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';

export const BottomNav = () => {
  const location = useLocation();
  const { getItemCount } = useCart();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Tag, label: 'Deals', path: '/deals' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: getItemCount() },
    { icon: User, label: 'Account', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-2 px-3 min-w-0 relative ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge && badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1 truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};