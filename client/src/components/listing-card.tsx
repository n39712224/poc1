import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, MoreHorizontal, Edit, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ListingWithSeller } from "@/lib/types";

interface ListingCardProps {
  listing: ListingWithSeller;
  isFeatured?: boolean;
  showOwnerActions?: boolean;
  onMessage?: () => void;
}

export default function ListingCard({ listing, isFeatured = false, showOwnerActions = false, onMessage }: ListingCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getSellerName = () => {
    const { firstName, lastName } = listing.seller;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return "Anonymous Seller";
  };

  const getSellerInitials = () => {
    const name = getSellerName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMessage?.();
  };

  // Use placeholder image if no images available
  const imageUrl = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover-scale border border-gray-200 dark:border-gray-700">
      <Link href={`/listing/${listing.id}`}>
        <div className="cursor-pointer">
          <div className="relative">
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop`;
              }}
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3">
              {isFeatured && (
                <Badge className="bg-yellow-500 text-white">Featured</Badge>
              )}
              {listing.isFeatured && !isFeatured && (
                <Badge className="bg-yellow-500 text-white">Featured</Badge>
              )}
            </div>

            {/* Wishlist Button */}
            {!showOwnerActions && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleWishlist}
                className="absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <Heart 
                  className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </Button>
            )}

            {/* Owner Actions */}
            {showOwnerActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Listing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Analytics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {listing.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {listing.description}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${parseFloat(listing.price).toFixed(2)}
              </span>
              <Badge variant="outline" className="text-xs">
                {listing.condition}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={listing.seller.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xs">{getSellerInitials()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {getSellerName()}
                </span>
              </div>
              
              {!showOwnerActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMessage}
                  className="text-primary hover:text-primary/80 text-sm font-medium p-0 h-auto"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Message
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
