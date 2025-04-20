import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { getTierDetails } from "@/lib/stripe";
import { ArrowLeft, CheckCircle, LoaderCircle } from "lucide-react";
import { useUser } from "@/components/user-context";
import { queryClient } from "@/lib/queryClient";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ tier }: { tier: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, setUser } = useUser();
  const tierDetails = getTierDetails(tier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/dashboard',
      },
      redirect: 'if_required'
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "There was an issue processing your payment.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded, update user's subscription status
      try {
        const response = await apiRequest("POST", "/api/subscription/confirm", {
          tier,
          userId: user?.id
        });
        
        if (!response.ok) {
          throw new Error("Failed to confirm subscription");
        }
        
        const updatedUser = await response.json();
        
        // Update user context and invalidate user queries
        if (setUser && user) {
          setUser({ ...user, ...updatedUser });
        }
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        
        toast({
          title: "Subscription Successful",
          description: `You are now subscribed to the ${tierDetails.name} plan.`,
        });
        
        // Redirect to dashboard
        setLocation("/dashboard");
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "There was a problem confirming your subscription.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex items-center justify-between pt-4">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => setLocation("/profile")}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit" disabled={isSubmitting || !stripe}>
          {isSubmitting ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe to ${tierDetails.name} - $${tierDetails.price}/month`
          )}
        </Button>
      </div>
    </form>
  );
};

const SubscribePage = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [tier, setTier] = useState<string>("pro");
  const [, params] = useLocation();
  const { toast } = useToast();
  const tierDetails = getTierDetails(tier);
  const { user } = useUser();

  useEffect(() => {
    // Get tier from URL query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const tierParam = searchParams.get('tier');
    if (tierParam && ['pro', 'enterprise'].includes(tierParam)) {
      setTier(tierParam);
    }
    
    // Create payment intent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/subscription/create-intent", { 
          tier: tierParam || 'pro', 
          userId: user?.id 
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create subscription");
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "There was a problem setting up the payment.",
          variant: "destructive",
        });
      }
    };

    if (user) {
      createPaymentIntent();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to subscribe to a plan.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">
              Subscribe to {tierDetails.name} Plan
            </h1>
            <p className="mt-2 text-slate-500">
              Subscribe to our {tierDetails.name} plan to access premium features and increase your document signing quota.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
                <CardDescription>
                  {tier === 'pro' 
                    ? 'For professionals and small businesses' 
                    : 'For organizations with advanced needs'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline text-slate-900">
                  <span className="text-3xl font-extrabold">${tierDetails.price}</span>
                  <span className="ml-1 text-base text-slate-500">/month</span>
                </div>
                
                <ul className="space-y-3 text-sm">
                  {tierDetails.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter your payment information below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!clientSecret ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin mr-2 h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    <span>Loading payment form...</span>
                  </div>
                ) : (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <CheckoutForm tier={tier} />
                  </Elements>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              By subscribing, you agree to our 
              <a href="#" className="text-primary hover:underline"> Terms of Service</a> and 
              <a href="#" className="text-primary hover:underline"> Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubscribePage;
