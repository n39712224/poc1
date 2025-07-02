export interface ListingWithSeller {
  id: number;
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  tags: string[] | null;
  images: string[] | null;
  sellerId: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    email?: string | null;
  };
}

export interface ConversationWithDetails {
  id: number;
  listingId: number;
  buyerId: string;
  sellerId: string;
  lastMessageAt: string;
  createdAt: string;
  listing: {
    id: number;
    title: string;
    images: string[] | null;
  };
  otherUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export interface MessageWithSender {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export interface OfferWithBuyer {
  id: number;
  listingId: number;
  buyerId: string;
  amount: string;
  message: string | null;
  status: string;
  createdAt: string;
  buyer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  tags?: string[];
  images?: string[];
}

export interface CreateMessageData {
  content: string;
}

export interface CreateOfferData {
  amount: number;
  message?: string;
}

export type Category = "electronics" | "fashion" | "home" | "books" | "sports" | "art";
export type Condition = "new" | "like-new" | "good" | "fair";
export type SortOption = "newest" | "price-low" | "price-high" | "popular";
