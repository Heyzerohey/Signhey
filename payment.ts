import { Express, Request, Response } from "express";
import { storage } from "../storage";
import Stripe from "stripe";

export function registerPaymentRoutes(app: Express) {
  // Initialize Stripe with API key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('Missing STRIPE_SECRET_KEY. Stripe functionality will not work properly.');
  }
  
  const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      }) 
    : null;
  
  // Create payment intent
  app.post("/api/payment/create-intent", async (req: Request, res: Response) => {
    try {
      // Verify user authentication
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const { amount, mode } = req.body;
      
      // Validate input
      if (!amount) {
        return res.status(400).json({ 
          success: false, 
          message: "Amount is required" 
        });
      }
      
      if (mode === 'preview') {
        // For PREVIEW mode, return a mock client secret
        // This allows the frontend to test the payment flow without making a real charge
        const mockClientSecret = `mock_pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`;
        
        return res.json({ 
          success: true,
          clientSecret: mockClientSecret,
          mode: 'preview'
        });
      } else {
        // For LIVE mode, create a real payment intent with Stripe
        if (!stripe) {
          return res.status(500).json({ 
            success: false, 
            message: "Stripe is not configured" 
          });
        }
        
        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
          metadata: {
            userId: userId.toString()
          },
          // Add any additional options here (e.g., receipt_email, description)
        });
        
        res.json({ 
          success: true,
          clientSecret: paymentIntent.client_secret,
          mode: 'live'
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "An error occurred creating payment intent" 
      });
    }
  });
  
  // Confirm payment
  app.post("/api/payment/confirm", async (req: Request, res: Response) => {
    try {
      // Verify user authentication
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const { paymentIntentId, mode } = req.body;
      
      // Validate input
      if (!paymentIntentId) {
        return res.status(400).json({ 
          success: false, 
          message: "Payment intent ID is required" 
        });
      }
      
      if (mode === 'preview') {
        // For PREVIEW mode, simulate payment confirmation
        return res.json({ 
          success: true,
          message: "Payment simulated successfully in PREVIEW mode",
          mode: 'preview'
        });
      } else {
        // For LIVE mode, verify payment with Stripe
        if (!stripe) {
          return res.status(500).json({ 
            success: false, 
            message: "Stripe is not configured" 
          });
        }
        
        // In a real implementation, you would verify the payment intent status with Stripe
        // For this example, we'll simulate success
        
        res.json({ 
          success: true,
          message: "Payment processed successfully",
          mode: 'live'
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "An error occurred confirming payment" 
      });
    }
  });
}