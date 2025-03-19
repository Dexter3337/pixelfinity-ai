
import { useState, useRef, useEffect } from 'react';
import './BeforeAfterSlider.css';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

const BeforeAfterSlider = ({ 
  beforeImage, 
  afterImage, 
  beforeAlt = "Before",
  afterAlt = "After",
  className = ""
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const calculateSliderPosition = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const { left, width } = sliderRef.current.getBoundingClientRect();
    let position = ((clientX - left) / width) * 100;
    
    // Constrain position between 0 and 100
    position = Math.max(0, Math.min(position, 100));
    
    setSliderPosition(position);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    calculateSliderPosition(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    calculateSliderPosition(e.touches[0].clientX);
  };

  // Animated slider effect
  useEffect(() => {
    if (!sliderRef.current) return;
    
    // Create a subtle animation effect when component mounts
    const animateSlider = () => {
      const startPos = 20;
      const endPos = 80;
      const duration = 1500; // ms
      const startTime = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        
        if (elapsed < duration) {
          const progress = elapsed / duration;
          const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
          const newPos = startPos + (endPos - startPos) * easedProgress;
          setSliderPosition(newPos);
          requestAnimationFrame(animate);
        } else {
          setSliderPosition(50); // Reset to middle
        }
      };
      
      requestAnimationFrame(animate);
    };
    
    // Run animation once on mount
    const timer = setTimeout(animateSlider, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div 
      ref={sliderRef} 
      className={`before-after-slider relative rounded-xl overflow-hidden ${className}`}
    >
      {/* Labels */}
      <div className="absolute top-4 left-4 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded">
        Before
      </div>
      <div className="absolute top-4 right-4 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded">
        After
      </div>
      
      {/* After (Full) Image */}
      <img 
        src={afterImage} 
        alt={afterAlt} 
        className="w-full h-auto block"
      />
      
      {/* Before Image (Revealed by slider) */}
      <div 
        className="slider-before-container absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeImage} 
          alt={beforeAlt} 
          className="h-full object-cover object-left absolute top-0 left-0"
          style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }}
        />
      </div>
      
      {/* Slider Divider */}
      <div 
        className="slider-divider absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="slider-handle w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transform -translate-x-1/2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
