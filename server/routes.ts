import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertListingSchema, insertMessageSchema, insertOfferSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Listings routes
  app.get('/api/listings', async (req: Request, res: Response) => {
    try {
      const { 
        category, 
        priceMin, 
        priceMax, 
        condition, 
        search, 
        sellerId 
      } = req.query;

      const filters: any = {};
      if (category) filters.category = category as string;
      if (priceMin) filters.priceMin = parseFloat(priceMin as string);
      if (priceMax) filters.priceMax = parseFloat(priceMax as string);
      if (condition) filters.condition = condition as string;
      if (search) filters.search = search as string;
      if (sellerId) filters.sellerId = sellerId as string;

      const listings = await storage.getListings(filters);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get('/api/listings/featured', async (req: Request, res: Response) => {
    try {
      const featuredListings = await storage.getFeaturedListings();
      res.json(featuredListings);
    } catch (error) {
      console.error("Error fetching featured listings:", error);
      res.status(500).json({ message: "Failed to fetch featured listings" });
    }
  });

  app.get('/api/listings/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage.getListingWithSeller(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.post('/api/listings', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertListingSchema.parse({
        ...req.body,
        sellerId: userId,
      });

      const listing = await storage.createListing(validatedData);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      console.error("Error creating listing:", error);
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.put('/api/listings/:id', isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if listing exists and belongs to user
      const existingListing = await storage.getListingById(id);
      if (!existingListing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (existingListing.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this listing" });
      }

      const validatedData = insertListingSchema.partial().parse(req.body);
      const listing = await storage.updateListing(id, validatedData);
      
      res.json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      console.error("Error updating listing:", error);
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  app.delete('/api/listings/:id', isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if listing exists and belongs to user
      const existingListing = await storage.getListingById(id);
      if (!existingListing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (existingListing.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this listing" });
      }

      const success = await storage.deleteListing(id);
      if (success) {
        res.json({ message: "Listing deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete listing" });
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Conversations routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id', isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const conversation = await storage.getConversationById(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Check if user is part of the conversation
      if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this conversation" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post('/api/conversations', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId, sellerId } = req.body;
      
      // Check if conversation already exists
      const existingConversation = await storage.findConversation(listingId, userId, sellerId);
      if (existingConversation) {
        return res.json(existingConversation);
      }
      
      const conversation = await storage.createConversation({
        listingId,
        buyerId: userId,
        sellerId,
      });
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Messages routes
  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify user is part of the conversation
      const conversation = await storage.getConversationById(conversationId);
      if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
        return res.status(403).json({ message: "Not authorized to view these messages" });
      }
      
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify user is part of the conversation
      const conversation = await storage.getConversationById(conversationId);
      if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
        return res.status(403).json({ message: "Not authorized to send messages in this conversation" });
      }
      
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
        senderId: userId,
      });
      
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Offers routes
  app.get('/api/listings/:id/offers', isAuthenticated, async (req: any, res: Response) => {
    try {
      const listingId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns the listing
      const listing = await storage.getListingById(listingId);
      if (!listing || listing.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized to view offers for this listing" });
      }
      
      const offers = await storage.getOffersByListingId(listingId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  app.post('/api/listings/:id/offers', isAuthenticated, async (req: any, res: Response) => {
    try {
      const listingId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const validatedData = insertOfferSchema.parse({
        ...req.body,
        listingId,
        buyerId: userId,
      });
      
      const offer = await storage.createOffer(validatedData);
      res.status(201).json(offer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid offer data", errors: error.errors });
      }
      console.error("Error creating offer:", error);
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  app.put('/api/offers/:id/status', isAuthenticated, async (req: any, res: Response) => {
    try {
      const offerId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const offer = await storage.updateOfferStatus(offerId, status);
      res.json(offer);
    } catch (error) {
      console.error("Error updating offer status:", error);
      res.status(500).json({ message: "Failed to update offer status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
