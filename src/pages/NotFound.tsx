
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-24">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
              <div className="relative z-10 text-9xl font-bold text-primary">
                404
              </div>
            </div>
            
            <h1 className="heading-2 mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-8">
              We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
