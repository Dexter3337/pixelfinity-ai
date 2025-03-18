
import { useState, useRef, useEffect } from 'react';

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
      className={`slider-component relative rounded-xl overflow-hidden ${className}`}
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
        className="slider-before-container"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeImage} 
          alt={beforeAlt} 
          className="h-full object-cover object-left"
          style={{ width: `${100 / (sliderPosition / 100)}%` }}
        />
      </div>
      
      {/* Slider Divider */}
      <div 
        className="slider-divider"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      ></div>
    </div>
  );
};

export default BeforeAfterSlider;
