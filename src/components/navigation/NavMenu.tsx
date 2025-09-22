import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Package, Tag, Users } from 'lucide-react';

interface NavMenuProps {
  className?: string;
  mobile?: boolean;
}

export const NavMenu = ({ className, mobile = false }: NavMenuProps) => {
  const location = useLocation();

  const navItems = [
    { 
      label: 'Home', 
      href: '/', 
      icon: Home 
    },
    { 
      label: 'Products', 
      href: '/products', 
      icon: Package 
    },
    { 
      label: 'Deals', 
      href: '/deals', 
      icon: Tag 
    },
  ];

  return (
    <nav className={cn('flex', mobile ? 'flex-col space-y-2' : 'space-x-6', className)}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center text-sm font-medium transition-colors hover:text-primary',
              mobile ? 'px-3 py-2 rounded-md hover:bg-accent' : '',
              isActive 
                ? 'text-primary' 
                : 'text-muted-foreground'
            )}
          >
            {mobile && <Icon className="h-4 w-4 mr-2" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};