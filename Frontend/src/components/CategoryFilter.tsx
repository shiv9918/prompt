import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

const categories = [
  'All',
  'Business',
  'Creative',
  'Development',
  'Marketing',
  'Education',
  'Design',
  'Research'
];

const priceFilters = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Premium', value: 'premium' },
  { label: 'Under $10', value: 'under10' },
  { label: 'Under $25', value: 'under25' }
];

const CategoryFilter = ({ selectedCategory = 'All', onCategoryChange, sortOption, onSortChange }) => {
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const popularTags = [
    'AI', 'ChatGPT', 'Marketing', 'Business', 'Creative', 'Writing',
    'Code', 'SEO', 'Email', 'Social Media', 'Research', 'Design'
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    onCategoryChange && onCategoryChange('All');
    setSelectedPrice('all');
    setSelectedTags([]);
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedPrice !== 'all' || selectedTags.length > 0;

  return (
    <div className="py-8 border-b border-border/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {(selectedCategory !== 'All' ? 1 : 0) + 
                   (selectedPrice !== 'all' ? 1 : 0) + 
                   selectedTags.length}
                </Badge>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sort by:</span>
            <select
              className="bg-background border border-border rounded px-2 py-1 text-sm"
              value={sortOption}
              onChange={e => onSortChange && onSortChange(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange && onCategoryChange(category)}
              className={selectedCategory === category ? "btn-ai" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="card-glow">
            <CardContent className="p-6 space-y-6">
              {/* Price Filter */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="flex flex-wrap gap-2">
                  {priceFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant={selectedPrice === filter.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPrice(filter.value)}
                      className={selectedPrice === filter.value ? "btn-ai" : ""}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <h4 className="font-medium mb-3">Popular Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedTags.includes(tag) 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'hover:bg-primary/10'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedCategory !== 'All' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onCategoryChange && onCategoryChange('All')} />
              </Badge>
            )}
            {selectedPrice !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Price: {priceFilters.find(f => f.value === selectedPrice)?.label}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPrice('all')} />
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleTag(tag)} />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;