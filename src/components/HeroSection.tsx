
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white z-0"></div>
      
      {/* Animated shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          className="absolute w-72 h-72 rounded-full bg-blue-100/40 blur-3xl"
          animate={{
            x: [mousePosition.x * -30, mousePosition.x * -30],
            y: [mousePosition.y * -30, mousePosition.y * -30],
          }}
          transition={{ type: "spring", stiffness: 50 }}
          style={{ top: '20%', left: '15%' }}
        />
        <motion.div 
          className="absolute w-96 h-96 rounded-full bg-blue-200/30 blur-3xl"
          animate={{
            x: [mousePosition.x * -20, mousePosition.x * -20],
            y: [mousePosition.y * -20, mousePosition.y * -20],
          }}
          transition={{ type: "spring", stiffness: 40 }}
          style={{ bottom: '10%', right: '10%' }}
        />
      </div>
      
      <div className="container px-4 mx-auto relative z-10 pt-24 md:pt-36 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
            AI-Powered Technology
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="heading-1 mb-6 max-w-4xl mx-auto text-balance"
        >
          Transform Your Photos with Unparalleled AI Enhancement
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance"
        >
          Experience photo enhancement like never before. Our AI technology automatically detects and fixes imperfections, creating stunning, professional-quality images in seconds.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Button asChild size="lg" className="rounded-full px-6 shadow-sm">
            <Link to="/enhance">
              Enhance Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-6">
            <Link to="/gallery">View Gallery</Link>
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative overflow-hidden rounded-xl border border-gray-200/50 shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=675"
              alt="AI Enhanced Photography" 
              className="w-full h-auto max-w-4xl rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
              <div className="text-white text-left">
                <p className="text-sm font-medium mb-2">Before & After Enhancement</p>
                <div className="flex gap-4 items-center">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">Auto-Enhance</span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">HDR Effect</span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">Color Correction</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
