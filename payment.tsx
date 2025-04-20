import { useState, FC, useEffect } from 'react';
import { useLocation } from 'wouter';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ProgressIndicator from '@/components/ProgressIndicator';
import { AlertCircle, CreditCard, Check } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment Form Component
const PaymentForm: FC<{ mode: 'preview' | 'live' }> = ({ mode }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    
    try {
      if (mode === 'preview') {
        // In PREVIEW mode, simulate payment success
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Confirm the payment on the server
        await apiRequest('POST', '/api/payment/confirm', {
          paymentIntentId: 'mock_payment_intent',
          mode
        });
        
        setCompleted(true);
        toast({
          title: 'Payment successful',
          description: 'This is a simulated payment in PREVIEW mode.'
        });
        
        // Redirect to success page or dashboard
        setTimeout(() => {
          setLocation('/dashboard');
        }, 1500);
      } else {
        // In LIVE mode, use Stripe for real payment
        const cardElement = elements.getElement(CardElement);
        
        if (!cardElement) {
          throw new Error('Card element not found');
        }
        
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Process payment with the server
        // In a real implementation, this would use the payment method ID
        // and create a payment intent on the server
        const paymentResponse = await apiRequest('POST', '/api/payment/confirm', {
          paymentIntentId: paymentMethod.id,
          mode
        });
        
        const paymentData = await paymentResponse.json();
        
        if (paymentData.success) {
          setCompleted(true);
          toast({
            title: 'Payment successful',
            description: 'Your payment has been processed successfully.'
          });
          
          // Redirect to success page or dashboard
          setTimeout(() => {
            setLocation('/dashboard');
          }, 1500);
        } else {
          throw new Error(paymentData.message || 'Payment failed');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error.message || 'An error occurred during payment processing',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {completed ? (
          <div className="p-4 bg-green-50 rounded-md flex items-center text-green-700">
            <Check className="h-5 w-5 mr-2" />
            <p>Payment processed successfully!</p>
          </div>
        ) : (
          <>
            <div className="p-4 border rounded-md">
              <CardElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
            
            {mode === 'preview' && (
              <div className="p-3 bg-orange-50 text-orange-800 rounded-md flex items-start text-sm">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>In PREVIEW mode, this is a simulated payment. No actual charges will be made.</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button 
          type="submit" 
          disabled={!stripe || processing || completed}
        >
          {processing ? 'Processing...' : completed ? 'Payment Complete' : `Pay $49.99`}
        </Button>
      </div>
    </form>
  );
};

// Main Payment Page Component
const Payment: FC = () => {
  const [mode, setMode] = useState<'preview' | 'live'>('preview');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest('POST', '/api/payment/create-intent', {
          amount: 49.99, // Price for the service
          mode
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to initialize payment',
          variant: 'destructive'
        });
      }
    };
    
    createPaymentIntent();
  }, [mode, toast]);

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || '',
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-center mb-8">
        <img src="/logo.svg" alt="Signhey" className="h-12" />
      </div>
      
      <ProgressIndicator 
        steps={['Agreement', 'Files', 'Payment']} 
        currentStep={2} 
        mode={mode}
        onModeChange={setMode}
      />

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>
            Complete your payment to finalize the document signing process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="bg-slate-50 p-4 rounded-md mb-6">
              <div className="flex justify-between mb-4">
                <span className="text-slate-600">Pro Document Signing Service</span>
                <span className="font-medium">$49.99</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-medium">
                <span>Total</span>
                <span>$49.99</span>
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <CreditCard className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">Payment Method</h3>
            </div>
            
            {clientSecret ? (
              <Elements stripe={stripePromise} options={options}>
                <PaymentForm mode={mode} />
              </Elements>
            ) : (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 text-sm text-slate-600">
          All transactions are secure and encrypted. By proceeding with payment, you agree to our Terms of Service.
        </CardFooter>
      </Card>
    </div>
  );
};

export default Payment;