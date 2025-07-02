import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Condition, SortOption } from "@/lib/types";

interface FilterBarProps {
  priceFilter: string;
  onPriceFilterChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  conditionFilter: Condition | "";
  onConditionFilterChange: (value: Condition | "") => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
  itemCount: number;
}

export default function FilterBar({
  priceFilter,
  onPriceFilterChange,
  locationFilter,
  onLocationFilterChange,
  conditionFilter,
  onConditionFilterChange,
  sortBy,
  onSortByChange,
  itemCount,
}: FilterBarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
            
            {/* Price Filter */}
            <Select value={priceFilter} onValueChange={onPriceFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Price</SelectItem>
                <SelectItem value="0-25">Under $25</SelectItem>
                <SelectItem value="25-100">$25 - $100</SelectItem>
                <SelectItem value="100-500">$100 - $500</SelectItem>
                <SelectItem value="500+">$500+</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={onLocationFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Any Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Location</SelectItem>
                <SelectItem value="local">Local Pickup</SelectItem>
                <SelectItem value="shipping">Ships Nationwide</SelectItem>
              </SelectContent>
            </Select>

            {/* Condition Filter */}
            <Select value={conditionFilter} onValueChange={onConditionFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Any Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Condition</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like-new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {itemCount.toLocaleString()} items
            </span>
            
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
