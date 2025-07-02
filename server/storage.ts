import {
  users,
  listings,
  conversations,
  messages,
  offers,
  type User,
  type UpsertUser,
  type Listing,
  type InsertListing,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Offer,
  type InsertOffer,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Listing operations
  createListing(listing: InsertListing): Promise<Listing>;
  getListings(filters?: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    condition?: string;
    search?: string;
    sellerId?: string;
  }): Promise<Listing[]>;
  getListingById(id: number): Promise<Listing | undefined>;
  getListingWithSeller(id: number): Promise<any>;
  updateListing(id: number, updates: Partial<InsertListing>): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  getFeaturedListings(): Promise<Listing[]>;

  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationsByUserId(userId: string): Promise<any[]>;
  getConversationById(id: number): Promise<any>;
  findConversation(listingId: number, buyerId: string, sellerId: string): Promise<Conversation | undefined>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: number): Promise<any[]>;

  // Offer operations
  createOffer(offer: InsertOffer): Promise<Offer>;
  getOffersByListingId(listingId: number): Promise<any[]>;
  updateOfferStatus(id: number, status: string): Promise<Offer | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Listing operations
  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async getListings(filters?: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    condition?: string;
    search?: string;
    sellerId?: string;
  }): Promise<Listing[]> {
    let query = db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        category: listings.category,
        condition: listings.condition,
        tags: listings.tags,
        images: listings.images,
        sellerId: listings.sellerId,
        isFeatured: listings.isFeatured,
        isActive: listings.isActive,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        seller: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(eq(listings.isActive, true));

    const conditions = [];

    if (filters?.category) {
      conditions.push(eq(listings.category, filters.category));
    }

    if (filters?.priceMin !== undefined) {
      conditions.push(sql`${listings.price} >= ${filters.priceMin}`);
    }

    if (filters?.priceMax !== undefined) {
      conditions.push(sql`${listings.price} <= ${filters.priceMax}`);
    }

    if (filters?.condition) {
      conditions.push(eq(listings.condition, filters.condition));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(listings.title, `%${filters.search}%`),
          ilike(listings.description, `%${filters.search}%`)
        )
      );
    }

    if (filters?.sellerId) {
      conditions.push(eq(listings.sellerId, filters.sellerId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(listings.createdAt));
  }

  async getListingById(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async getListingWithSeller(id: number): Promise<any> {
    const [listing] = await db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        category: listings.category,
        condition: listings.condition,
        tags: listings.tags,
        images: listings.images,
        sellerId: listings.sellerId,
        isFeatured: listings.isFeatured,
        isActive: listings.isActive,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        seller: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          email: users.email,
        },
      })
      .from(listings)
      .leftJoin(users, eq(listings.sellerId, users.id))
      .where(eq(listings.id, id));
    return listing;
  }

  async updateListing(id: number, updates: Partial<InsertListing>): Promise<Listing | undefined> {
    const [listing] = await db
      .update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async deleteListing(id: number): Promise<boolean> {
    const result = await db.update(listings).set({ isActive: false }).where(eq(listings.id, id));
    return result.rowCount > 0;
  }

  async getFeaturedListings(): Promise<Listing[]> {
    return db
      .select()
      .from(listings)
      .where(and(eq(listings.isFeatured, true), eq(listings.isActive, true)))
      .orderBy(desc(listings.createdAt))
      .limit(4);
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async getConversationsByUserId(userId: string): Promise<any[]> {
    return db
      .select({
        id: conversations.id,
        listingId: conversations.listingId,
        buyerId: conversations.buyerId,
        sellerId: conversations.sellerId,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
        listing: {
          id: listings.id,
          title: listings.title,
          images: listings.images,
        },
        otherUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(conversations)
      .leftJoin(listings, eq(conversations.listingId, listings.id))
      .leftJoin(
        users,
        or(
          and(eq(conversations.buyerId, userId), eq(users.id, conversations.sellerId)),
          and(eq(conversations.sellerId, userId), eq(users.id, conversations.buyerId))
        )
      )
      .where(or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId)))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async getConversationById(id: number): Promise<any> {
    const [conversation] = await db
      .select({
        id: conversations.id,
        listingId: conversations.listingId,
        buyerId: conversations.buyerId,
        sellerId: conversations.sellerId,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
        listing: {
          id: listings.id,
          title: listings.title,
          images: listings.images,
        },
        buyer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(conversations)
      .leftJoin(listings, eq(conversations.listingId, listings.id))
      .leftJoin(users, eq(conversations.buyerId, users.id))
      .where(eq(conversations.id, id));
    return conversation;
  }

  async findConversation(listingId: number, buyerId: string, sellerId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.listingId, listingId),
          eq(conversations.buyerId, buyerId),
          eq(conversations.sellerId, sellerId)
        )
      );
    return conversation;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    
    // Update conversation's lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return newMessage;
  }

  async getMessagesByConversationId(conversationId: number): Promise<any[]> {
    return db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Offer operations
  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  async getOffersByListingId(listingId: number): Promise<any[]> {
    return db
      .select({
        id: offers.id,
        listingId: offers.listingId,
        buyerId: offers.buyerId,
        amount: offers.amount,
        message: offers.message,
        status: offers.status,
        createdAt: offers.createdAt,
        buyer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(offers)
      .leftJoin(users, eq(offers.buyerId, users.id))
      .where(eq(offers.listingId, listingId))
      .orderBy(desc(offers.createdAt));
  }

  async updateOfferStatus(id: number, status: string): Promise<Offer | undefined> {
    const [offer] = await db
      .update(offers)
      .set({ status })
      .where(eq(offers.id, id))
      .returning();
    return offer;
  }
}

export const storage = new DatabaseStorage();
