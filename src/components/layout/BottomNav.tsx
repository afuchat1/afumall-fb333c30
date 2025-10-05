import { Home, Tag, ShoppingCart, User, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export const BottomNav = () => {
  const location = useLocation();
  const { getItemCount } = useCart();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: getItemCount() },
    { icon: User, label: 'Account', path: user ? '/profile' : '/auth' },
  ];

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-background/95 border-t border-border/50 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="flex justify-around items-center py-1">
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-1 px-1.5 min-w-0 relative transition-all ${
                isActive ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-4 w-4" />
                {badge && badge > 0 && (
                  <Badge 
                    className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full p-0 flex items-center justify-center text-[8px] bg-accent text-accent-foreground"
                  >
                    {badge}
                  </Badge>
                )}
              </div>
              <span className="text-[9px] mt-0.5 truncate font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};