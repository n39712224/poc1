import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import CategoryTabs from "@/components/category-tabs";
import FilterBar from "@/components/filter-bar";
import ListingCard from "@/components/listing-card";
import MessagingModal from "@/components/messaging-modal";
import CreateListingModal from "@/components/create-listing-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ListingWithSeller, Category, Condition, SortOption } from "@/lib/types";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [conditionFilter, setConditionFilter] = useState<Condition | "">(""); 
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);

  // Fetch featured listings
  const { data: featuredListings = [], isLoading: featuredLoading } = useQuery<ListingWithSeller[]>({
    queryKey: ["/api/listings/featured"],
  });

  // Build filters for main listings query
  const buildFilters = () => {
    const filters: Record<string, any> = {};
    
    if (selectedCategory !== "all") {
      filters.category = selectedCategory;
    }
    
    if (conditionFilter) {
      filters.condition = conditionFilter;
    }
    
    if (searchQuery) {
      filters.search = searchQuery;
    }
    
    // Parse price filter
    if (priceFilter) {
      if (priceFilter === "0-25") {
        filters.priceMin = 0;
        filters.priceMax = 25;
      } else if (priceFilter === "25-100") {
        filters.priceMin = 25;
        filters.priceMax = 100;
      } else if (priceFilter === "100-500") {
        filters.priceMin = 100;
        filters.priceMax = 500;
      } else if (priceFilter === "500+") {
        filters.priceMin = 500;
      }
    }
    
    return filters;
  };

  // Fetch all listings with filters
  const { data: allListings = [], isLoading: listingsLoading } = useQuery<ListingWithSeller[]>({
    queryKey: ["/api/listings", buildFilters()],
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
  });

  const handleOpenMessaging = () => {
    setIsMessagingOpen(true);
  };

  const handleCreateListing = () => {
    setIsCreateListingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenMessages={handleOpenMessaging}
        onCreateListing={handleCreateListing}
      />
      
      <CategoryTabs 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <FilterBar
        priceFilter={priceFilter}
        onPriceFilterChange={setPriceFilter}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        conditionFilter={conditionFilter}
        onConditionFilterChange={setConditionFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        itemCount={allListings.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Section */}
        {featuredListings.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Items</h2>
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-80 animate-pulse" />
                ))
              ) : (
                featuredListings.map((listing) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    isFeatured 
                    onMessage={handleOpenMessaging}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {/* All Listings Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Listings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listingsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-80 animate-pulse" />
              ))
            ) : allListings.length > 0 ? (
              allListings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing}
                  onMessage={handleOpenMessaging}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No listings found. Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>

          {/* Load More Button - placeholder for pagination */}
          {allListings.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Items
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          onClick={handleCreateListing}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Modals */}
      <MessagingModal 
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />
      
      <CreateListingModal 
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
      />
    </div>
  );
}
