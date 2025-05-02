import { Request, Response, Express } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertAgreementSchema } from "@shared/schema";

export function registerAgreementRoutes(app: Express) {
  // Get all agreements for the logged-in user
  app.get("/api/agreements", async (req: Request, res: Response) => {
    try {
      // Verify user authentication
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      // Get user to check tier
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Get page and limit from query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Get agreements for user
      const { agreements, total } = await storage.getUserAgreements(userId, page, limit);
      
      res.json({
        success: true,
        agreements: agreements.map(agreement => ({
          id: agreement.id,
          clientName: agreement.clientName,
          title: agreement.title,
          status: agreement.status,
          mode: agreement.mode,
          createdAt: agreement.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "An error occurred" });
    }
  });
  
  // Get a specific agreement by ID
  app.get("/api/agreements/:id", async (req: Request, res: Response) => {
    try {
      // Verify user authentication
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const agreementId = parseInt(req.params.id);
      
      if (isNaN(agreementId)) {
        return res.status(400).json({ success: false, message: "Invalid agreement ID" });
      }
      
      // Get agreement
      const agreement = await storage.getAgreement(agreementId);
      
      if (!agreement) {
        return res.status(404).json({ success: false, message: "Agreement not found" });
      }
      
      // Verify user owns this agreement
      if (agreement.userId !== userId) {
        return res.status(403).json({ success: false, message: "Not authorized to access this agreement" });
      }
      
      res.json({
        success: true,
        agreement
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "An error occurred" });
    }
  });
  
  // Create a new agreement
  app.post("/api/agreements/create", async (req: Request, res: Response) => {
    try {
      // Verify user authentication
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      // Get user to check tier
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Extract mode from request
      const { mode = "preview" } = req.body;
      
      // Check if user can use LIVE mode based on tier and quota
      if (mode === "live") {
        if (user.tier === "free") {
          return res.status(403).json({
            success: false,
            message: "Free tier does not have access to LIVE mode"
          });
        }
        
        if (user.liveUsed >= user.liveQuota) {
          return res.status(403).json({
            success: false,
            message: "LIVE mode quota exceeded"
          });
        }
      }
      
      // Validate input
      const validatedData = {
        ...insertAgreementSchema.parse({
          ...req.body,
          userId
        }),
        mode
      };
      
      // Create agreement
      const agreement = await storage.createAgreement(validatedData);
      
      // If LIVE mode, increment user's LIVE used count
      if (mode === "live") {
        await storage.incrementLiveUsedCount(userId);
      }
      
      res.status(201).json({
        success: true,
        agreement: {
          id: agreement.id,
          title: agreement.title,
          clientName: agreement.clientName,
          clientEmail: agreement.clientEmail,
          paymentAmount: agreement.paymentAmount,
          status: agreement.status,
          mode: agreement.mode,
          signerLink: agreement.signerLink
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ success: false, message: error.message || "An error occurred" });
    }
  });
  
  // Send the agreement link to client via email
  app.post("/api/agreements/send-link", async (req: Request, res: Response) => {
    try {
      // Verify user authentication
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      // Extract agreement ID from request
      const { agreementId } = req.body;
      
      if (!agreementId) {
        return res.status(400).json({ success: false, message: "Agreement ID is required" });
      }
      
      // Get agreement
      const agreement = await storage.getAgreement(parseInt(agreementId));
      
      if (!agreement) {
        return res.status(404).json({ success: false, message: "Agreement not found" });
      }
      
      // Verify user owns this agreement
      if (agreement.userId !== userId) {
        return res.status(403).json({ success: false, message: "Not authorized to access this agreement" });
      }
      
      // Mark agreement link as sent
      const updatedAgreement = await storage.markAgreementLinkSent(agreement.id);
      
      // For LIVE mode, this would actually send an email
      // For PREVIEW mode, we just simulate sending
      if (agreement.mode === "live") {
        // In a real implementation, this would use a proper email service
        console.log(`Email sent to ${agreement.clientEmail} with signer link: ${agreement.signerLink}`);
      }
      
      res.json({
        success: true,
        message: `Signer link ${agreement.mode === "preview" ? "would be" : "was"} sent to ${agreement.clientEmail}`,
        agreement: {
          id: updatedAgreement.id,
          linkSent: updatedAgreement.linkSent,
          linkSentAt: updatedAgreement.linkSentAt
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "An error occurred" });
    }
  });
}