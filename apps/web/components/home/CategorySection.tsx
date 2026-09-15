'use client';

import { Icon } from '../icon';

type Props = {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
};

export function CategorySection({ selectedCategory, onSelectCategory }: Props) {
  const categories = [
    { id: 'Restaurants', name: 'Restaurants', icon: 'food', activeBg: '#e6f4ea' },
    { id: 'Shisanyama', name: 'Shisanyamas', icon: 'fire', activeBg: '#fff7ed' },
    { id: 'Alcohol', name: 'Liquor Stores', icon: 'alcohol', activeBg: '#fef2f2' },
    { id: 'Takeaways', name: 'Takeaways', icon: 'store', activeBg: '#f0fdf4' },
    { id: 'Stores', name: 'Groceries & Stores', icon: 'grid', activeBg: '#eff6ff' },
    { id: 'Specials', name: 'Specials', icon: 'specials', activeBg: '#fff0e6', badge: true },
  ];

  return (
    <section className="category-section wrap-container">
      <div className="category-grid">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-item-card ${selectedCategory === cat.id ? 'selected' : ''} ${cat.badge ? 'badge-card' : ''}`}
            onClick={() => onSelectCategory(selectedCategory === cat.id ? '' : cat.id)}
          >
            <span className="cat-icon-wrapper">
              <Icon name={cat.icon} size={24} />
            </span>
            <span className="cat-name">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
