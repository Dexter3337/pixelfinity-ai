
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import EnhancementOptions from '@/components/EnhancementOptions';
import { useEnhancement } from './useEnhancement';
import ResultSection from './ResultSection';
import ProcessingSection from './ProcessingSection';
import EmptyResultSection from './EmptyResultSection';
import EnhancementCounter from './EnhancementCounter';

const Enhance = () => {
  const {
    selectedImage,
    enhancementOption,
    isProcessing,
    enhancementResult,
    enhancementCount,
    enhancementParams,
    processingStage,
    handleImageSelected,
    handleEnhancementOptionSelected,
    resetEnhancementParams,
    handleEnhance,
    setEnhancementParams
  } = useEnhancement();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <h1 className="heading-2 mt-4 mb-2">Enhance Your Image</h1>
            <p className="text-muted-foreground text-lg">
              Upload your photo and let our advanced AI models (Real-ESRGAN & SwinIR) transform your images with stunning detail.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <ImageUploader onImageSelected={handleImageSelected} />
              
              {selectedImage && (
                <EnhancementOptions 
                  selectedOption={enhancementOption}
                  onOptionSelected={handleEnhancementOptionSelected}
                  isProcessing={isProcessing}
                  onEnhance={handleEnhance}
                  enhancementParams={enhancementParams}
                  onParamsChange={setEnhancementParams}
                  hasResult={!!enhancementResult}
                  onResetParams={resetEnhancementParams}
                />
              )}
              
              <EnhancementCounter enhancementCount={enhancementCount} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {isProcessing ? (
                <ProcessingSection processingStage={processingStage} />
              ) : enhancementResult ? (
                <ResultSection 
                  enhancementResult={enhancementResult} 
                  selectedImage={selectedImage} 
                />
              ) : (
                <EmptyResultSection />
              )}
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <style>
        {`
        @keyframes progress {
          0% { width: 0%; }
          20% { width: 20%; }
          50% { width: 50%; }
          70% { width: 70%; }
          90% { width: 90%; }
          100% { width: 95%; }
        }
        
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
        `}
      </style>
    </div>
  );
};

export default Enhance;
