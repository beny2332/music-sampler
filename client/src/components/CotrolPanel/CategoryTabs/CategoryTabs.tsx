import React from "react";

export type CategoryName = "Drums" | "Hats" | "Percussion" | "Cymbals" | "Toms";

type CategoryTabsProps = {
  categories: Record<CategoryName, string[]>;
  activeCategories: CategoryName[];
  onToggleCategory: (category: CategoryName) => void;
};

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  categories, activeCategories, onToggleCategory 
}) => (
  <div className="category-tabs">
    {(Object.keys(categories) as CategoryName[]).map(category => (
      <button 
        key={category}
        className={`category-tab ${activeCategories.includes(category) ? 'active' : ''}`}
        onClick={() => onToggleCategory(category)}
        title={`Toggle ${category} instruments`}
      >
        {category}
      </button>
    ))}
  </div>
);

export default CategoryTabs;