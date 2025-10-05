import { Search, ShoppingCart, User, Menu, ChevronDown, LogOut, Settings, Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { toast } from 'sonner';

export const Header = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query: searchQuery.trim() }
      });

      if (error) throw error;

      if (data?.products) {
        sessionStorage.setItem('aiSearchResults', JSON.stringify(data.products));
        sessionStorage.setItem('aiSearchQuery', searchQuery.trim());
        navigate('/products');
        setSearchQuery('');
      }
    } catch (error: any) {
      console.error('AI search error:', error);
      toast.error('AI search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-header text-header-foreground border-b border-border/20 sticky top-0 z-50">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/logo.jpg" alt="AfuMall Logo" className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover" loading="eager" />
            <span className="text-lg md:text-xl font-bold text-header-foreground">AfuMall</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8 gap-1">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-sm bg-white/10 border-white/20 text-header-foreground placeholder:text-white/60 focus:bg-white focus:text-foreground"
                />
              </div>
            </form>
            <Button 
              type="button"
              onClick={handleAISearch}
              disabled={searching || !searchQuery.trim()}
              size="sm"
              className="h-8 px-2 bg-accent/20 hover:bg-accent/30 text-accent-foreground border border-accent/40"
              title="AI Search"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative text-header-foreground hover:text-accent hover:bg-white/10 h-8 w-8 md:h-9 md:w-9">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                {getItemCount() > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 flex items-center justify-center text-[10px] md:text-xs bg-accent text-accent-foreground"
                  >
                    {getItemCount()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 text-header-foreground hover:text-accent hover:bg-white/10 h-8 text-sm px-2">
                      <User className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline text-xs">{profile?.name || 'Account'}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1 text-xs font-medium">
                      {profile?.name || user.email}
                    </div>
                    <div className="px-2 py-1 text-[10px] text-muted-foreground">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center text-xs">
                        <User className="h-3.5 w-3.5 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile?tab=orders" className="flex items-center text-xs">
                        <Package className="h-3.5 w-3.5 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/seller/dashboard" className="flex items-center text-xs">
                        <Package className="h-3.5 w-3.5 mr-2" />
                        My Store
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center text-xs">
                            <Settings className="h-3.5 w-3.5 mr-2" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-xs">
                      <LogOut className="h-3.5 w-3.5 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground h-8 text-xs px-3">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-header-foreground hover:text-accent hover:bg-white/10 h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="py-6">
                    <h2 className="text-lg font-semibold">Navigation</h2>
                  </div>
                  
                  <nav className="flex-1 space-y-2">
                    <Link
                      to="/"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                    >
                      Home
                    </Link>
                    <Link
                      to="/products"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                    >
                      Products
                    </Link>
                    <Link
                      to="/deals"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                    >
                      Deals
                    </Link>
                    <Link
                      to="/flash-sales"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                    >
                      Flash Sales
                    </Link>
                    <Link
                      to="/new-arrivals"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                    >
                      New Arrivals
                    </Link>
                    
                    <div className="border-t my-4"></div>
                    
                    <Link
                      to="/about"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                    >
                      About
                    </Link>
                    <Link
                      to="/contact"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                    >
                      Contact
                    </Link>
                    <Link
                      to="/seller-request"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                    >
                      Become a Seller
                    </Link>
                    
                    {user ? (
                      <>
                        <div className="border-t my-4"></div>
                        <Link
                          to="/profile"
                          className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                        >
                          <User className="h-4 w-4 mr-2" />
                          My Profile
                        </Link>
                        <Link
                          to="/profile?tab=orders"
                          className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          My Orders
                        </Link>
                        <Link
                          to="/my-seller-request"
                          className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                        >
                          My Seller Request
                        </Link>
                        <Link
                          to="/seller/dashboard"
                          className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                        >
                          Seller Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-3 py-2 rounded-md hover:bg-accent text-left"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="border-t my-4"></div>
                        <Link
                          to="/auth"
                          className="flex items-center px-3 py-2 rounded-md hover:bg-accent"
                        >
                          Sign In
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-3 flex gap-1">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/60 h-3.5 w-3.5" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm bg-white/10 border-white/20 text-header-foreground placeholder:text-white/60 focus:bg-white focus:text-foreground"
              />
            </div>
          </form>
          <Button 
            type="button"
            onClick={handleAISearch}
            disabled={searching || !searchQuery.trim()}
            size="sm"
            className="h-8 px-2 bg-accent/20 hover:bg-accent/30 text-accent-foreground border border-accent/40"
            title="AI Search"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
};