
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProcessingAnimationProps {
  isVisible: boolean;
  currentStep?: string;
}

const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({ 
  isVisible,
  currentStep = 'Processing your image...'
}) => {
  if (!isVisible) return null;
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-xl p-8 shadow-xl max-w-md w-full mx-4"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <motion.div
              className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </motion.div>
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-primary border-dashed"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Enhancing Your Image</h3>
            <p className="text-muted-foreground">{currentStep}</p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <motion.div 
              className="bg-primary h-full"
              initial={{ width: "10%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 8, ease: "easeInOut" }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            Using Real-ESRGAN and SwinIR for superior image quality
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProcessingAnimation;
