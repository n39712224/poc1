import { Button } from "@/components/ui/button";
import { Grid3X3, Laptop, Shirt, Home, Book, Dumbbell, Palette } from "lucide-react";
import type { Category } from "@/lib/types";

interface CategoryTabsProps {
  selectedCategory: Category | "all";
  onSelectCategory: (category: Category | "all") => void;
}

const categories = [
  { value: "all" as const, label: "All Items", icon: Grid3X3 },
  { value: "electronics" as const, label: "Electronics", icon: Laptop },
  { value: "fashion" as const, label: "Fashion", icon: Shirt },
  { value: "home" as const, label: "Home & Garden", icon: Home },
  { value: "books" as const, label: "Books", icon: Book },
  { value: "sports" as const, label: "Sports", icon: Dumbbell },
  { value: "art" as const, label: "Art & Crafts", icon: Palette },
];

export default function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto py-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.value;
            
            return (
              <Button
                key={category.value}
                variant="ghost"
                onClick={() => onSelectCategory(category.value)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? "text-primary bg-primary/10 dark:bg-primary/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
