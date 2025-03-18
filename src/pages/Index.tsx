
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Zap, 
  Lightbulb,
  ImagePlus,
  Clock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { toast } from 'sonner';

const features = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Intelligent Auto-Enhance',
    description: 'Our AI automatically detects image issues and applies optimal enhancements without manual adjustments.'
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Lightning Fast Processing',
    description: 'Advanced algorithms deliver professional-quality results in seconds, not minutes.'
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: 'Smart Scene Detection',
    description: 'The AI recognizes different scene types and applies specialized enhancements for each context.'
  },
  {
    icon: <ImagePlus className="h-5 w-5" />,
    title: 'Detail Preservation',
    description: 'Enhance images without the artifacts and quality loss common in other enhancement tools.'
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: 'Batch Processing',
    description: 'Enhance multiple images at once with consistent results across your entire collection.'
  }
];

const testimonials = [
  {
    quote: "I've tried countless photo enhancement tools, but this one is truly in a league of its own. The results are stunning!",
    name: "Sarah Johnson",
    title: "Professional Photographer"
  },
  {
    quote: "The AI enhancement is like magic. My old, low-quality photos now look like they were taken with a professional camera.",
    name: "Michael Chen",
    title: "Graphic Designer"
  },
  {
    quote: "I was skeptical at first, but the before and after results speak for themselves. Absolutely worth every penny.",
    name: "Olivia Rodriguez",
    title: "Social Media Manager"
  }
];

const beforeAfterExamples = [
  {
    before: "https://images.unsplash.com/photo-1511840636560-acee95b3a83f?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    after: "https://images.unsplash.com/photo-1547191783-94d5f8f6d8b1?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    title: "Landscape Enhancement"
  },
  {
    before: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    after: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3",
    title: "Portrait Optimization"
  }
];

const Index = () => {
  useEffect(() => {
    // Initialize demo and show welcome message
    setTimeout(() => {
      toast("Welcome to PixelEnhance AI", {
        description: "Transform your photos with cutting-edge AI technology.",
        position: "bottom-right",
      });
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Feature Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block text-sm font-medium text-primary mb-3">
                  Advanced Features
                </span>
                <h2 className="heading-2 mb-6">
                  Powered by Next-Generation AI Technology
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Our advanced AI uses deep learning techniques to analyze every aspect of your images and apply precise, contextual enhancements that preserve natural details.
                </p>
                
                <ul className="space-y-4">
                  {features.slice(0, 3).map((feature, i) => (
                    <motion.li 
                      key={i}
                      className="flex items-start"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <div className="mt-1 flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{feature.description}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/enhance">
                      Try It Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-xl">
                  <BeforeAfterSlider 
                    beforeImage="https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3"
                    afterImage="https://images.unsplash.com/photo-1569913486515-b74bf7751574?auto=format&fit=crop&q=80&w=1000&h=667&ixlib=rb-4.0.3"
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Before/After Gallery */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block text-sm font-medium text-primary mb-3">
                See The Difference
              </span>
              <h2 className="heading-2 mb-6">
                Stunning Before & After Results
              </h2>
              <p className="text-muted-foreground text-lg">
                Witness the remarkable transformation of ordinary photos into extraordinary visual masterpieces with our advanced AI enhancement technology.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {beforeAfterExamples.map((example, i) => (
                <motion.div 
                  key={i}
                  className="glass-card rounded-xl overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <BeforeAfterSlider 
                    beforeImage={example.before}
                    afterImage={example.after}
                    className="w-full h-auto"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-2">{example.title}</h3>
                    <div className="flex gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        AI Enhanced
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Automatic
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button asChild className="rounded-full">
                <Link to="/gallery">
                  View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block text-sm font-medium text-primary mb-3">
                Testimonials
              </span>
              <h2 className="heading-2 mb-6">
                What Our Users Say
              </h2>
              <p className="text-muted-foreground text-lg">
                Join thousands of satisfied users who have transformed their photos with our AI enhancement technology.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <motion.div 
                  key={i}
                  className="glass-card rounded-xl p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="mb-4 text-primary">
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <blockquote className="mb-4 text-foreground italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="heading-2 mb-6">
                Ready to Transform Your Photos?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start enhancing your images today with our powerful AI technology. Try it for free or choose a plan that suits your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link to="/enhance">
                    Enhance Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                  <Link to="/pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
