
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingCard, { PricingTier } from '@/components/PricingCard';
import { CheckIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  const pricingTiers: PricingTier[] = [
    {
      name: 'Free',
      tagline: 'For occasional use',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out our AI enhancement technology.',
      features: [
        '3 image enhancements per month',
        'Basic enhancement options',
        'Standard resolution output',
        'Web-only access',
        '5 MB max file size'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outline',
    },
    {
      name: 'Hobbyist',
      tagline: 'For regular users',
      price: billingPeriod === 'monthly' ? '$9' : '$90',
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Save 16% with annual billing. Perfect for regular photo enhancement needs.',
      features: [
        '50 image enhancements per month',
        'All enhancement options',
        'High resolution output',
        'Priority processing',
        'Web & mobile access',
        'Download & share options',
        '15 MB max file size',
        'Priority Support'
      ],
      buttonText: 'Subscribe Now',
      highlighted: true,
    },
    {
      name: 'Pro',
      tagline: 'For professionals',
      price: billingPeriod === 'monthly' ? '$29' : '$290',
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Save 17% with annual billing. Ideal for professional photographers and designers.',
      features: [
        '300 image enhancements per month',
        'All enhancement options',
        'Ultra-high resolution output',
        'Express processing queue',
        'API access',
        'Batch processing',
        'Advanced analytics',
        '25 MB max file size'
      ],
      buttonText: 'Go Pro',
    }
  ];
  
  const faqs = [
    {
      question: 'How does the free plan work?',
      answer: 'Our free plan allows you to enhance up to 3 images per month without any payment required. It\'s perfect for trying out our technology or for occasional use.'
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.'
    },
    {
      question: 'What is the maximum file size I can upload?',
      answer: 'The maximum file size varies by plan: 5 MB for Free users, 15 MB for Hobbyist users, and 25 MB for Pro users.'
    },
    {
      question: 'Do you offer a refund if I\'m not satisfied?',
      answer: 'Yes, we offer a 14-day money-back guarantee if you\'re not completely satisfied with your subscription.'
    },
    {
      question: 'What file formats can I upload?',
      answer: 'We support JPEG, PNG, and WebP formats across all plans.'
    },
    {
      question: 'How does batch processing work?',
      answer: 'Batch processing, available on the Pro plan, allows you to enhance multiple images at once. Simply upload a zip file containing your images, and our system will process them all automatically.'
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-sm font-medium text-primary mb-3">
              Pricing Plans
            </span>
            <h1 className="heading-2 mb-6">
              Choose the Perfect Plan for Your Needs
            </h1>
            <p className="text-muted-foreground text-lg">
              Whether you're enhancing a single photo or processing hundreds of images, we have a plan that's right for you.
            </p>
            
            <div className="mt-8 inline-flex items-center bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Yearly <span className="text-xs text-primary font-normal">Save up to 17%</span>
              </button>
            </div>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="h-full"
              >
                <PricingCard tier={tier} />
              </motion.div>
            ))}
          </div>
          
          {/* Feature Comparison */}
          <div className="mt-24 max-w-5xl mx-auto">
            <h2 className="heading-3 text-center mb-12">Feature Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-4 text-left font-medium text-muted-foreground">Feature</th>
                    <th className="p-4 text-center font-medium">Free</th>
                    <th className="p-4 text-center font-medium">Hobbyist</th>
                    <th className="p-4 text-center font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-sm">Monthly Image Limit</td>
                    <td className="p-4 text-center text-sm">3 images</td>
                    <td className="p-4 text-center text-sm">50 images</td>
                    <td className="p-4 text-center text-sm">300 images</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-sm">Max Resolution</td>
                    <td className="p-4 text-center text-sm">1080p</td>
                    <td className="p-4 text-center text-sm">4K</td>
                    <td className="p-4 text-center text-sm">8K</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-sm">Enhancement Options</td>
                    <td className="p-4 text-center text-sm">Basic</td>
                    <td className="p-4 text-center text-sm">All</td>
                    <td className="p-4 text-center text-sm">All</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-sm">Processing Priority</td>
                    <td className="p-4 text-center text-sm">Standard</td>
                    <td className="p-4 text-center text-sm">Priority</td>
                    <td className="p-4 text-center text-sm">Express</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-sm">Batch Processing</td>
                    <td className="p-4 text-center text-sm"><XIcon className="h-4 w-4 inline text-gray-400" /></td>
                    <td className="p-4 text-center text-sm"><XIcon className="h-4 w-4 inline text-gray-400" /></td>
                    <td className="p-4 text-center text-sm"><CheckIcon className="h-4 w-4 inline text-green-500" /></td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-sm">API Access</td>
                    <td className="p-4 text-center text-sm"><XIcon className="h-4 w-4 inline text-gray-400" /></td>
                    <td className="p-4 text-center text-sm"><XIcon className="h-4 w-4 inline text-gray-400" /></td>
                    <td className="p-4 text-center text-sm"><CheckIcon className="h-4 w-4 inline text-green-500" /></td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-sm">Max File Size</td>
                    <td className="p-4 text-center text-sm">5 MB</td>
                    <td className="p-4 text-center text-sm">15 MB</td>
                    <td className="p-4 text-center text-sm">25 MB</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-4 text-sm">Priority Support</td>
                    <td className="p-4 text-center text-sm"><XIcon className="h-4 w-4 inline text-gray-400" /></td>
                    <td className="p-4 text-center text-sm"><CheckIcon className="h-4 w-4 inline text-green-500" /></td>
                    <td className="p-4 text-center text-sm"><CheckIcon className="h-4 w-4 inline text-green-500" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* FAQs */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="heading-3 text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mt-24 text-center bg-blue-50 p-12 rounded-2xl max-w-4xl mx-auto">
            <h2 className="heading-3 mb-4">Ready to Transform Your Photos?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with our free plan today and experience the power of our AI image enhancement technology.
            </p>
            <Button asChild size="lg" className="rounded-full px-6">
              <Link to="/enhance">
                Try for Free
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required for the free plan.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
