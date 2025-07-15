import React, { useState } from 'react';
import CategoryFilter from '@/components/CategoryFilter';
import PromptGrid from '@/components/PromptGrid';
import Footer from '@/components/Footer';
import { useLocation } from 'react-router-dom';

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('latest');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('search')?.toLowerCase() || '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                Explore <span className="gradient-text">AI Prompts</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover thousands of high-quality prompts created by the community
              </p>
            </div>
            <div className="mt-0 mb-0">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                sortOption={sortOption}
                onSortChange={setSortOption}
              />
            </div>
          </div>
        </div>
        <PromptGrid selectedCategory={selectedCategory} searchTerm={searchTerm} sortOption={sortOption} />
      </div>
      <Footer />
    </div>
  );
};

export default Explore;