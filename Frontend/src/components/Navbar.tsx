import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Zap, User, Heart, ShoppingCart, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Zap className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 animate-ping">
                  <Zap className="h-8 w-8 text-primary opacity-20" />
                </div>
              </div>
              <span className="text-2xl font-bold gradient-text">PromptHub</span>
              <Badge variant="secondary" className="text-xs">AI</Badge>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
              <Link to="/explore">Explore</Link>
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
              <Link to="/create">Create</Link>
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            {/* Icons: Only show buy icon if logged in */}
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/buy">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    2
                  </Badge>
                </Link>
              </Button>
            )}
            
            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" asChild>
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="default" size="sm" className="btn-ai" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;