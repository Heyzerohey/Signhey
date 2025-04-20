import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { getTierDetails } from "@/lib/stripe";
import { cn } from "@/lib/utils";
import { useUser } from "./user-context";

interface PriceCardProps {
  tier: string;
  currentTier?: string;
  onSubscribe: (tier: string) => void;
}

const PriceCard: FC<PriceCardProps> = ({ tier, currentTier, onSubscribe }) => {
  const tierDetails = getTierDetails(tier);
  const { user } = useUser();
  
  const isCurrentPlan = currentTier === tier;
  
  return (
    <Card className={cn(
      "flex flex-col h-full transition-all",
      tierDetails.recommended ? "border-primary shadow-md" : "border-slate-200",
      isCurrentPlan && "ring-2 ring-primary"
    )}>
      <CardHeader className="pb-4">
        <h3 className="text-lg font-medium text-slate-900">{tierDetails.name}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {tier === 'free' && "Perfect for individuals and small projects."}
          {tier === 'pro' && "For professionals and small businesses."}
          {tier === 'enterprise' && "For organizations with advanced needs."}
        </p>
      </CardHeader>
      <CardContent className="pb-6 flex-grow">
        <div className="flex items-baseline text-slate-900">
          <span className="text-4xl font-extrabold">${tierDetails.price}</span>
          <span className="ml-1 text-base text-slate-500">/month</span>
        </div>
        
        <ul className="mt-6 space-y-4">
          {tierDetails.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg 
                className={cn(
                  "flex-shrink-0 h-5 w-5 mr-2",
                  feature.includes("0 LIVE") ? "text-red-500" : "text-green-500"
                )} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                {feature.includes("0 LIVE") ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              <span className="text-sm text-slate-500">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0 pb-6">
        <Button 
          onClick={() => onSubscribe(tier)} 
          variant={tierDetails.recommended ? "default" : "outline"}
          className="w-full"
          disabled={isCurrentPlan || !user}
        >
          {isCurrentPlan 
            ? "Current Plan" 
            : tier === 'free' 
              ? "Start for Free" 
              : tier === 'pro' 
                ? "Subscribe to Pro" 
                : "Subscribe to Enterprise"
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PriceCard;
