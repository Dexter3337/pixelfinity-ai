
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { Link } from "react-router-dom";

export interface PricingTier {
  name: string;
  tagline: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline" | "secondary";
  highlighted?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
}

const PricingCard = ({ tier }: PricingCardProps) => {
  return (
    <div 
      className={`h-full flex flex-col rounded-2xl border transition-all duration-200 
      ${tier.highlighted 
        ? 'border-primary/30 shadow-lg scale-[1.02] relative z-10 bg-white' 
        : 'border-gray-200 hover:border-gray-300 bg-white/70'
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-5 left-0 right-0 flex justify-center">
          <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        <div>
          <h3 className="text-xl font-semibold">{tier.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{tier.tagline}</p>
        </div>
        
        <div className="mt-5 mb-5">
          <div className="flex items-baseline">
            <span className="text-3xl md:text-4xl font-bold">{tier.price}</span>
            {tier.period && (
              <span className="ml-1 text-sm text-muted-foreground">
                {tier.period}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
        </div>
        
        <ul className="space-y-3 my-6 flex-grow">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckIcon className="h-3.5 w-3.5" />
              </div>
              <span className="ml-3 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          asChild
          variant={tier.buttonVariant || "default"}
          className={`mt-auto rounded-full w-full ${
            tier.highlighted ? 'shadow-sm' : ''
          }`}
        >
          <Link to="/enhance">
            {tier.buttonText}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;
