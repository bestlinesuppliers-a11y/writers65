import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, FileText, Users, Settings } from "lucide-react";

interface NavigationProps {
  userRole?: 'client' | 'writer' | 'admin' | null;
}

export const Navigation = ({ userRole }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">
            365writers
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/how-it-works"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/how-it-works") ? "text-primary" : "text-foreground/60"
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/pricing"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/pricing") ? "text-primary" : "text-foreground/60"
            }`}
          >
            Pricing
          </Link>
          
          {!userRole ? (
            <div className="flex items-center space-x-3">
              <Link to="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="hero">Get Started</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to={`/${userRole}/dashboard`}>
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              {userRole === 'admin' && (
                <Link to="/admin">
                  <Button variant="admin" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm">
                Sign Out
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-3">
            <Link
              to="/how-it-works"
              className="block text-sm font-medium text-foreground/60 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/pricing"
              className="block text-sm font-medium text-foreground/60 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            
            {!userRole ? (
              <div className="space-y-2 pt-2">
                <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register" onClick={() => setIsOpen(false)}>
                  <Button variant="hero" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to={`/${userRole}/dashboard`} onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                {userRole === 'admin' && (
                  <Link to="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="admin" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" className="w-full justify-start">
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};