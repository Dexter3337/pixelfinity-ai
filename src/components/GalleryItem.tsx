
import { useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';

interface GalleryItemProps {
  beforeImage: string;
  afterImage: string;
  title: string;
  tags: string[];
  className?: string;
}

const GalleryItem = ({ 
  beforeImage, 
  afterImage, 
  title, 
  tags,
  className = ""
}: GalleryItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`rounded-xl overflow-hidden transition-all duration-300 hover-lift glass-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BeforeAfterSlider 
        beforeImage={beforeImage}
        afterImage={afterImage}
      />
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;
