import { 
  users, 
  documents, 
  signers, 
  type User, 
  type InsertUser, 
  type Document, 
  type InsertDocument,
  type Signer,
  type InsertSigner 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, profile: { fullName: string }): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  updateUserSubscription(id: number, subscription: { 
    tier: string; 
    liveQuota: number;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null; 
  }): Promise<User>;
  incrementLiveUsedCount(id: number): Promise<void>;
  
  // Document methods
  getUserDocuments(userId: number, page: number, limit: number, filter?: string): Promise<{ documents: Document[], total: number }>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // Signer methods
  getDocumentSigners(documentId: number): Promise<Signer[]>;
  createSigner(signer: InsertSigner): Promise<Signer>;
  updateSigner(id: number, signer: Partial<Signer>): Promise<Signer>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values({
        ...insertUser,
        liveQuota: insertUser.liveQuota || 0,
        liveUsed: 0
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: number, profile: { fullName: string }): Promise<User> {
    const [user] = await db.update(users)
      .set(profile)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
    
    if (!result) {
      throw new Error("User not found");
    }
  }

  async updateUserSubscription(id: number, subscription: { 
    tier: string; 
    liveQuota: number;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null; 
  }): Promise<User> {
    // Reset liveUsed to 0 if tier is free
    const liveUsed = subscription.tier === 'free' ? 0 : undefined;
    
    const [user] = await db.update(users)
      .set({
        tier: subscription.tier,
        liveQuota: subscription.liveQuota,
        liveUsed: liveUsed,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async incrementLiveUsedCount(id: number): Promise<void> {
    await db.update(users)
      .set({
        liveUsed: sql`${users.liveUsed} + 1`
      })
      .where(eq(users.id, id));
  }

  // Document methods
  async getUserDocuments(userId: number, page: number, limit: number, filter?: string): Promise<{ documents: Document[], total: number }> {
    let query = db.select().from(documents).where(eq(documents.userId, userId));
    
    if (filter && filter !== 'all') {
      query = db.select().from(documents).where(
        and(
          eq(documents.userId, userId),
          eq(documents.status, filter)
        )
      );
    }
    
    // Get total count
    const countResult = await db.select({ count: sql`count(*)` }).from(documents).where(eq(documents.userId, userId));
    const total = Number(countResult[0]?.count || 0);
    
    // Get paginated results
    const startIndex = (page - 1) * limit;
    const paginatedResults = await query
      .orderBy(desc(documents.createdAt))
      .limit(limit)
      .offset(startIndex);
    
    return { documents: paginatedResults, total };
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents)
      .values(insertDocument)
      .returning();
    
    // Create signers if provided
    if (insertDocument.signers && Array.isArray(insertDocument.signers)) {
      const signerData = typeof insertDocument.signers[0] === 'string'
        ? JSON.parse(insertDocument.signers[0] as string)
        : insertDocument.signers;
        
      for (const signer of signerData) {
        await this.createSigner({
          documentId: document.id,
          name: signer.name,
          email: signer.email
        });
      }
    }
    
    return document;
  }

  async updateDocument(id: number, documentUpdate: Partial<Document>): Promise<Document> {
    const [document] = await db.update(documents)
      .set(documentUpdate)
      .where(eq(documents.id, id))
      .returning();
    
    if (!document) {
      throw new Error("Document not found");
    }
    
    // Update signers if provided
    if (documentUpdate.signers && Array.isArray(documentUpdate.signers)) {
      // Delete existing signers
      await db.delete(signers).where(eq(signers.documentId, id));
      
      // Create new signers
      const signerData = typeof documentUpdate.signers[0] === 'string'
        ? JSON.parse(documentUpdate.signers[0] as string)
        : documentUpdate.signers;
        
      for (const signer of signerData) {
        await this.createSigner({
          documentId: id,
          name: signer.name,
          email: signer.email
        });
      }
    }
    
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    // Delete associated signers first to maintain referential integrity
    await db.delete(signers).where(eq(signers.documentId, id));
    
    // Then delete the document
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Signer methods
  async getDocumentSigners(documentId: number): Promise<Signer[]> {
    return db.select().from(signers).where(eq(signers.documentId, documentId));
  }

  async createSigner(insertSigner: InsertSigner): Promise<Signer> {
    const [signer] = await db.insert(signers)
      .values({
        ...insertSigner,
        signed: false
      })
      .returning();
    
    return signer;
  }

  async updateSigner(id: number, signerUpdate: Partial<Signer>): Promise<Signer> {
    // If setting signed to true, set signedAt to current date
    if (signerUpdate.signed) {
      signerUpdate.signedAt = new Date();
    }
    
    const [signer] = await db.update(signers)
      .set(signerUpdate)
      .where(eq(signers.id, id))
      .returning();
    
    if (!signer) {
      throw new Error("Signer not found");
    }
    
    return signer;
  }
}

export const storage = new DatabaseStorage();
