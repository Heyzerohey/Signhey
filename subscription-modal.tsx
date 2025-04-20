import { FC, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getTierDetails } from "@/lib/stripe";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "./user-context";
import { queryClient } from "@/lib/queryClient";

interface SubscriptionModalProps {
  open: boolean;
  tier: string;
  onClose: () => void;
}

const SubscriptionModal: FC<SubscriptionModalProps> = ({ open, tier, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, setUser } = useUser();
  const tierDetails = getTierDetails(tier);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login first to subscribe",
        variant: "destructive",
      });
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      // If tier is free, just update the user
      if (tier === 'free') {
        const response = await apiRequest("POST", "/api/downgrade-to-free", { userId: user.id });
        if (response.ok) {
          const updatedUser = await response.json();
          setUser({ ...user, ...updatedUser });
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
          toast({
            title: "Plan downgraded",
            description: "You have been downgraded to the free plan",
          });
        }
      } else {
        window.location.href = `/subscribe?tier=${tier}`;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Subscribe to {tierDetails.name} Plan</DialogTitle>
          <DialogDescription>
            {tier === 'free' 
              ? "Downgrade your account to the free plan. You will lose access to premium features."
              : `Upgrade to our ${tierDetails.name} plan for ${tierDetails.quota} LIVE document signing quota and additional features.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Price</span>
              <span>${tierDetails.price}/month</span>
            </div>
            
            <div className="font-medium">Features:</div>
            <ul className="space-y-2 text-sm">
              {tierDetails.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? "Processing..." : tier === 'free' ? "Downgrade" : "Proceed to Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
