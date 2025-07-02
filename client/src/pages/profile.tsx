import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { ArrowLeft, Settings, Plus } from "lucide-react";
import ListingCard from "@/components/listing-card";
import type { ListingWithSeller } from "@/lib/types";

export default function Profile() {
  const { user } = useAuth();

  // Fetch user's listings
  const { data: userListings = [], isLoading } = useQuery<ListingWithSeller[]>({
    queryKey: ["/api/listings", { sellerId: user?.id }],
    queryFn: ({ queryKey }) => {
      const [url, filters] = queryKey;
      const params = new URLSearchParams();
      
      Object.entries(filters as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
      
      return fetch(`${url}?${params.toString()}`, {
        credentials: "include",
      }).then(res => res.json());
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Please sign in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUserName = () => {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return "Anonymous User";
  };

  const getInitials = () => {
    const name = getUserName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const activeListings = userListings.filter(listing => listing.isActive);
  const inactiveListings = userListings.filter(listing => !listing.isActive);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {getUserName()}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user.email}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {activeListings.length}
                    </span> Active Listings
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userListings.filter(l => l.isFeatured).length}
                    </span> Featured Items
                  </div>
                  <div>
                    Member since{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(user.createdAt || Date.now()).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Link href="/create-listing">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Listing
                  </Button>
                </Link>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Listings ({activeListings.length})</TabsTrigger>
            <TabsTrigger value="sold">Sold Items ({inactiveListings.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : activeListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeListings.map((listing) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing}
                    showOwnerActions
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No active listings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You haven't created any listings yet. Start selling today!
                  </p>
                  <Link href="/create-listing">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sold" className="space-y-6">
            {inactiveListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inactiveListings.map((listing) => (
                  <div key={listing.id} className="relative">
                    <ListingCard listing={listing} />
                    <div className="absolute inset-0 bg-gray-900/50 rounded-xl flex items-center justify-center">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Sold
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No sold items
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Items you've sold will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Activity tracking coming soon! This will show your recent listings, messages, and transactions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
