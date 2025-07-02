import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageCircle, Heart, Share2, MapPin, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ListingWithSeller } from "@/lib/types";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch listing details
  const { data: listing, isLoading } = useQuery<ListingWithSeller>({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
  });

  // Start conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async () => {
      if (!listing || !user) throw new Error("Missing data");
      
      const response = await apiRequest("POST", "/api/conversations", {
        listingId: listing.id,
        sellerId: listing.sellerId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Conversation started! You can now message the seller.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Listing not found</p>
            <Link href="/">
              <Button className="mt-4">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : ["/api/placeholder/400/300"];
  const isOwner = user?.id === listing.sellerId;

  const handleStartConversation = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to message sellers.",
        variant: "destructive",
      });
      return;
    }
    
    if (isOwner) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot start a conversation with yourself.",
        variant: "destructive",
      });
      return;
    }

    startConversationMutation.mutate();
  };

  const getSellerName = () => {
    const { firstName, lastName } = listing.seller;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return "Anonymous Seller";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={images[selectedImageIndex]}
                alt={listing.title}
                className="w-full h-96 object-cover rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop`;
                }}
              />
              {listing.isFeatured && (
                <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
                  Featured
                </Badge>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(listing.createdAt).toLocaleDateString()}
                </span>
                <Badge variant="outline">{listing.category}</Badge>
                <Badge variant="secondary">{listing.condition}</Badge>
              </div>
            </div>

            <div className="text-4xl font-bold text-primary">
              ${parseFloat(listing.price).toFixed(2)}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {listing.tags && listing.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Seller Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seller Information</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.seller.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {getSellerName().split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getSellerName()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Member since {new Date(listing.seller.email ? '2024-01-01' : listing.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {!isOwner ? (
                <>
                  <Button 
                    onClick={handleStartConversation}
                    disabled={startConversationMutation.isPending}
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {startConversationMutation.isPending ? "Starting..." : "Message Seller"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This is your listing</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      Edit Listing
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Analytics
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
