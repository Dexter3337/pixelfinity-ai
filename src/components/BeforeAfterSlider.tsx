
import { useState, useRef, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';
import './BeforeAfterSlider.css';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
  metrics?: {
    psnr: number;
    ssim: number;
    improvement: number;
  };
}

const BeforeAfterSlider = ({ 
  beforeImage, 
  afterImage, 
  beforeAlt = "Before",
  afterAlt = "After",
  className = "",
  metrics
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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

  // Double-click to reset
  const handleDoubleClick = () => {
    setSliderPosition(50);
  };

  // Handle keyboard arrow controls
  const handleKeyDown = (e: KeyboardEvent) => {
    if (document.activeElement !== sliderRef.current) return;
    
    if (e.key === 'ArrowLeft') {
      setSliderPosition(prev => Math.max(0, prev - 5));
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      setSliderPosition(prev => Math.min(100, prev + 5));
      e.preventDefault();
    }
  };

  // Play animation on button click
  const playAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Save original position
    const originalPosition = sliderPosition;
    
    // Animate slider from 0 to 100
    let start = 0;
    const duration = 1500;
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      
      if (elapsed < duration) {
        // Easing function for smooth animation
        const progress = elapsed / duration;
        const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        
        setSliderPosition(easedProgress * 100);
        requestAnimationFrame(animate);
      } else {
        // Reset to original position after animation
        setSliderPosition(originalPosition);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Animated slider effect on mount
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
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging]);

  return (
    <div className="space-y-2">
      <div 
        ref={sliderRef} 
        className={`before-after-slider relative rounded-xl overflow-hidden ${className}`}
        onDoubleClick={handleDoubleClick}
        tabIndex={0}
        role="slider"
        aria-valuenow={sliderPosition}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Before-after image comparison slider"
      >
        {/* Quality Improvement Indicator */}
        {metrics && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center">
            <span className="font-medium">
              {metrics.improvement > 25 
                ? "Significant Improvement" 
                : metrics.improvement > 15 
                  ? "Good Improvement" 
                  : "Subtle Enhancement"}
            </span>
            <span className="ml-2 text-xs text-green-300">+{Math.round(metrics.improvement)}%</span>
          </div>
        )}
        
        {/* Labels */}
        <div className="absolute top-4 left-4 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Before
        </div>
        <div className="absolute top-4 right-4 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded">
          After
        </div>
        
        {/* Play Animation Button */}
        <button
          onClick={playAnimation}
          disabled={isAnimating}
          className="absolute bottom-4 right-4 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded-full hover:bg-black/90 transition-colors"
        >
          {isAnimating ? "Playing..." : "Play Comparison"}
        </button>
        
        {/* After (Full) Image */}
        <img 
          src={afterImage} 
          alt={afterAlt} 
          className="w-full h-auto block"
        />
        
        {/* Before Image (Revealed by slider) */}
        <div 
          className="slider-before-container absolute top-0 left-0 h-full overflow-hidden transition-all duration-75"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={beforeImage} 
            alt={beforeAlt} 
            className="h-full w-full object-cover object-center"
            style={{ 
              width: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </div>
        
        {/* Slider Divider */}
        <div 
          className="slider-divider absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize flex items-center justify-center transition-all duration-75"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="slider-handle w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transform -translate-x-1/2 transition-transform duration-200">
            <MoveHorizontal className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>
      
      {/* Quality Metrics Display */}
      {metrics && (
        <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-gray-500 mb-1">PSNR</div>
            <div className="font-semibold">{metrics.psnr.toFixed(1)} dB</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">SSIM</div>
            <div className="font-semibold">{metrics.ssim.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Improvement</div>
            <div className={`font-semibold ${metrics.improvement > 20 ? 'text-green-600' : ''}`}>
              {Math.round(metrics.improvement)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforeAfterSlider;
