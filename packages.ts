import { Express, Request, Response } from "express";
import { storage } from "../storage";

export function registerPackageRoutes(app: Express) {
  // Get user's current package information
  app.get("/api/packages/current", async (req: Request, res: Response) => {
    try {
      // Verify user authentication
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Return package information
      res.json({
        success: true,
        package: {
          tier: user.tier,
          liveQuota: user.liveQuota,
          liveUsed: user.liveUsed
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "An error occurred retrieving package information" 
      });
    }
  });
  
  // Check if user has quota for LIVE mode
  app.get("/api/packages/check-quota", async (req: Request, res: Response) => {
    try {
      // Verify user authentication
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // Check quota
      const hasQuota = user.tier !== "free" && user.liveUsed < user.liveQuota;
      
      res.json({
        success: true,
        hasQuota,
        quotaRemaining: user.tier === "free" ? 0 : Math.max(0, user.liveQuota - user.liveUsed)
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "An error occurred checking quota" 
      });
    }
  });
}