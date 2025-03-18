
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GalleryItem from '@/components/GalleryItem';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Sample gallery items
const galleryItems = [
  {
    id: 1,
    beforeImage: "https://images.unsplash.com/photo-1492024923575-e6a5f1a0b37b?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    afterImage: "https://images.unsplash.com/photo-1672912883661-50cc99953a99?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    title: "Cityscape Enhancement",
    tags: ["Auto-Enhance", "HDR Effect"]
  },
  {
    id: 2,
    beforeImage: "https://images.unsplash.com/photo-1474312650852-739d4703e766?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    afterImage: "https://images.unsplash.com/photo-1511407397940-d57f68e81203?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    title: "Portrait Lighting",
    tags: ["Portrait Mode", "Detail Boost"]
  },
  {
    id: 3,
    beforeImage: "https://images.unsplash.com/photo-1498002352538-5584384e0ebf?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    afterImage: "https://images.unsplash.com/photo-1517480448885-d5c53555eaa1?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    title: "Landscape Vibrance",
    tags: ["Color Pop", "Style Transfer"]
  },
  {
    id: 4,
    beforeImage: "https://images.unsplash.com/photo-1516422663365-7feef20eab8d?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    afterImage: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    title: "Night Photography",
    tags: ["Night Mode", "Noise Reduction"]
  },
  {
    id: 5,
    beforeImage: "https://images.unsplash.com/photo-1463237454774-de5174c47a84?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    afterImage: "https://images.unsplash.com/photo-1561909381-c61077482858?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    title: "Food Photography",
    tags: ["Detail Boost", "Color Pop"]
  },
  {
    id: 6,
    beforeImage: "https://images.unsplash.com/photo-1509455143528-0cf2e9eea1d4?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    afterImage: "https://images.unsplash.com/photo-1589151422545-a76d0a0cca1b?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    title: "Architectural Shot",
    tags: ["Auto-Enhance", "HDR Effect"]
  }
];

// Filter categories
const categories = [
  { id: 'all', name: 'All' },
  { id: 'portrait', name: 'Portrait' },
  { id: 'landscape', name: 'Landscape' },
  { id: 'night', name: 'Night' },
  { id: 'architecture', name: 'Architecture' },
];

const Gallery = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-sm font-medium text-primary mb-3">
              Showcase
            </span>
            <h1 className="heading-2 mb-6">
              Before & After Gallery
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse our collection of before and after examples to see the power of our AI enhancement technology in action.
            </p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={category.id === 'all' ? 'default' : 'outline'}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
          
          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GalleryItem
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  title={item.title}
                  tags={item.tags}
                />
              </motion.div>
            ))}
          </div>
          
          {/* CTA Section */}
          <div className="mt-24 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="heading-3 mb-4">Ready to enhance your own photos?</h2>
              <p className="text-muted-foreground mb-8">
                Try our AI enhancement tool now and see the difference for yourself. Start with one free enhancement, no credit card required.
              </p>
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/enhance">
                  Enhance Your Photos <ArrowRight className="ml-2 h-4 w-4" />
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

export default Gallery;
