import { Express, Request, Response } from "express";
import { storage } from "../storage";

export function registerUploadRoutes(app: Express) {
  // File upload route
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      // Verify user authentication
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }
      
      const { mode } = req.body;
      
      // In a real implementation, this would handle file uploads to a service like Vercel Blob
      // For this example, we'll generate a mock URL that simulates the upload result
      const fileId = Math.random().toString(36).substring(2, 15);
      const fileName = (req.body.fileName || `document-${Date.now()}`).replace(/\s+/g, '-');
      
      let fileUrl;
      
      if (mode === 'live') {
        // Check if user has quota for LIVE mode
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
        
        if (user.tier === "free") {
          return res.status(403).json({ 
            success: false, 
            message: "Free tier does not support LIVE mode uploads" 
          });
        }
        
        // In a real implementation, this would upload to Vercel Blob or similar service
        // and return the actual URL
        fileUrl = `https://storage.example.com/${userId}/${fileId}/${fileName}`;
      } else {
        // For PREVIEW mode, generate a temporary URL
        fileUrl = `https://preview.storage.example.com/${userId}/${fileId}/${fileName}`;
      }
      
      res.json({ 
        success: true, 
        fileUrl,
        mode 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "An error occurred during file upload" 
      });
    }
  });
}