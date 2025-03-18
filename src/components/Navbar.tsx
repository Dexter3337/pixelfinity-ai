
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { MenuIcon, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Enhance', path: '/enhance' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Pricing', path: '/pricing' },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">
            PixelEnhance
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.path) 
                  ? 'text-primary'
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Button size="sm" className="rounded-full px-4 shadow-sm">
            Try for Free
          </Button>
        </nav>
        
        {/* Mobile Menu Button */}
        <button
          className="block md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="block md:hidden absolute top-full left-0 right-0 bg-white shadow-md animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium py-2 transition-colors ${
                  isActive(link.path) 
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Button size="sm" className="rounded-full px-4 shadow-sm self-start">
              Try for Free
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
