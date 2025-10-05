import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Store } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-background to-muted/30 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.jpg" alt="AfuMall Logo" className="h-10 w-10 rounded-full object-cover" />
              <h3 className="text-lg font-bold">AfuMall</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your premier online shopping destination. Quality products, unbeatable prices, and exceptional service.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Products
              </Link>
              <Link to="/deals" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Deals
              </Link>
              <Link to="/categories" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Categories
              </Link>
            </nav>
          </div>

          {/* Seller Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">Become a Seller</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/seller-request" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2">
                <Store className="h-4 w-4" />
                Apply to Sell
              </Link>
              <p className="text-xs text-muted-foreground">
                Join our marketplace and reach thousands of customers
              </p>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">Contact Us</h3>
            <div className="flex flex-col space-y-3">
              <a href="mailto:support@afumall.com" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4" />
                support@afumall.com
              </a>
              <a href="tel:+256123456789" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +256 123 456 789
              </a>
              <div className="text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Kampala, Uganda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AfuMall. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
