import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { createInsertSchema } from "drizzle-zod";
import { 
  insertUserSchema, 
  insertDocumentSchema, 
  insertSignerSchema,
  users,
  documents,
  signers
} from "@shared/schema";
import { registerSignRoutes } from "./routes/sign";
import { registerPackageRoutes } from "./routes/packages";
import { registerUploadRoutes } from "./routes/upload";
import { registerPaymentRoutes } from "./routes/payment";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY. Stripe functionality will not work properly.');
}
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as Stripe.ApiVersion,
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Register API routes from separate modules
  registerSignRoutes(app);
  registerPackageRoutes(app);
  registerUploadRoutes(app);
  registerPaymentRoutes(app);
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedData.password, salt);
      
      // Create user with hashed password and free tier
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        tier: "free",
        liveQuota: 0,
        liveUsed: 0
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Set user in session
      req.session.userId = user.id;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "An error occurred during registration" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set user in session
      req.session.userId = user.id;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred during login" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });
  
  app.put("/api/auth/password", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });
  
  // User profile routes
  app.get("/api/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });
  
  app.put("/api/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { fullName } = req.body;
      
      if (!fullName) {
        return res.status(400).json({ message: "Full name is required" });
      }
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(userId, { fullName });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });
  
  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filter = req.query.filter as string;
      
      const { documents, total } = await storage.getUserDocuments(userId, page, limit, filter);
      
      res.json({ documents, total });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });
  
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const documentId = parseInt(req.params.id);
      
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Ensure the document belongs to the user
      if (document.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this document" });
      }
      
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });
  
  app.post("/api/documents", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const documentData = { ...req.body, userId };
      
      // Validate document data
      const validatedData = insertDocumentSchema.parse(documentData);
      
      // Check if document is in LIVE mode and user has quota
      if (validatedData.mode === "live") {
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        if (user.tier === "free") {
          return res.status(403).json({ message: "Free tier does not support LIVE mode documents" });
        }
        
        if (user.liveUsed >= user.liveQuota) {
          return res.status(403).json({ message: "You have reached your LIVE document quota for this month" });
        }
        
        // Increment live used count
        await storage.incrementLiveUsedCount(userId);
      }
      
      // Create document
      const document = await storage.createDocument(validatedData);
      
      res.status(201).json(document);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });
  
  app.put("/api/documents/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const documentId = parseInt(req.params.id);
      
      // Get existing document
      const existingDocument = await storage.getDocument(documentId);
      
      if (!existingDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Ensure the document belongs to the user
      if (existingDocument.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this document" });
      }
      
      const updateData = { ...req.body, userId };
      
      // If mode is changing from preview to live, check quota
      if (existingDocument.mode === "preview" && updateData.mode === "live") {
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        if (user.tier === "free") {
          return res.status(403).json({ message: "Free tier does not support LIVE mode documents" });
        }
        
        if (user.liveUsed >= user.liveQuota) {
          return res.status(403).json({ message: "You have reached your LIVE document quota for this month" });
        }
        
        // Increment live used count
        await storage.incrementLiveUsedCount(userId);
      }
      
      // Update document
      const updatedDocument = await storage.updateDocument(documentId, updateData);
      
      res.json(updatedDocument);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });
  
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const documentId = parseInt(req.params.id);
      
      // Get existing document
      const existingDocument = await storage.getDocument(documentId);
      
      if (!existingDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Ensure the document belongs to the user
      if (existingDocument.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this document" });
      }
      
      // Delete document
      await storage.deleteDocument(documentId);
      
      res.json({ message: "Document deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred" });
    }
  });
  
  // File upload route
  app.post("/api/upload", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // In a real implementation, this would handle file uploads to a service like Vercel Blob
      // For this example, we'll generate a mock URL
      const mockFileUrl = `https://storage.example.com/${userId}/document-${Date.now()}.pdf`;
      
      res.json({ fileUrl: mockFileUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred during file upload" });
    }
  });
  
  // Subscription routes
  app.post("/api/subscription/create-intent", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { tier } = req.body;
      
      if (!tier || !['pro', 'enterprise'].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }
      
      if (!stripe) {
        return res.status(500).json({ message: "Stripe configuration not available" });
      }
      
      const amount = tier === 'pro' ? 4900 : 14900; // $49 or $149 in cents
      
      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          userId: userId.toString(),
          tier
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred creating payment intent" });
    }
  });
  
  app.post("/api/subscription/confirm", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { tier } = req.body;
      
      if (!tier || !['pro', 'enterprise'].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }
      
      // Update user's subscription
      const liveQuota = tier === 'pro' ? 30 : 100;
      
      // In a real implementation, we would store Stripe customer and subscription IDs
      const stripeCustomerId = `cus_${Math.random().toString(36).substr(2, 9)}`;
      const stripeSubscriptionId = `sub_${Math.random().toString(36).substr(2, 9)}`;
      
      const updatedUser = await storage.updateUserSubscription(userId, {
        tier,
        liveQuota,
        stripeCustomerId,
        stripeSubscriptionId
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred confirming subscription" });
    }
  });
  
  app.post("/api/downgrade-to-free", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // In a real implementation, we would cancel the Stripe subscription
      
      // Update user to free tier
      const updatedUser = await storage.updateUserSubscription(userId, {
        tier: "free",
        liveQuota: 0,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "An error occurred downgrading subscription" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
