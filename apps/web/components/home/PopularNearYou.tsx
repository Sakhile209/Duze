'use client';

import Image from 'next/image';
import { Icon } from '../icon';

type Merchant = {
  id: string;
  name: string;
  description: string;
  category: string;
  serviceStatus: string;
  prepMinutes: number;
  rating?: number;
  reviews?: number;
  priceTier?: string;
  deliveryFee?: string;
  imageUrl?: string;
};

type Props = {
  merchants: Merchant[];
  onSelectMerchant: (merchant: Merchant) => void;
  onViewAll: () => void;
};

export function PopularNearYou({ merchants, onSelectMerchant, onViewAll }: Props) {
  const sampleData: Merchant[] = [
    {
      id: 'm-1',
      name: "Marley's Shisanyama",
      description: 'Shisanyama • Ixopo',
      category: 'Shisanyama',
      serviceStatus: 'OPEN',
      prepMinutes: 25,
      rating: 4.6,
      reviews: 128,
      priceTier: '$$',
      deliveryFee: 'R25 delivery',
    },
    {
      id: 'm-2',
      name: 'KFC Ixopo',
      description: 'Fast Food • Ixopo',
      category: 'Takeaways',
      serviceStatus: 'OPEN',
      prepMinutes: 20,
      rating: 4.4,
      reviews: 96,
      priceTier: '$',
      deliveryFee: 'R20 delivery',
    },
    {
      id: 'm-3',
      name: 'Spur Ixopo',
      description: 'Family Restaurant • Ixopo',
      category: 'Restaurants',
      serviceStatus: 'OPEN',
      prepMinutes: 30,
      rating: 4.7,
      reviews: 210,
      priceTier: '$$',
      deliveryFee: 'R30 delivery',
    },
    {
      id: 'm-4',
      name: 'TOPS at SPAR',
      description: 'Liquor Store • Ixopo',
      category: 'Alcohol',
      serviceStatus: 'OPEN',
      prepMinutes: 20,
      rating: 4.3,
      reviews: 58,
      priceTier: '$',
      deliveryFee: 'R25 delivery',
    },
    {
      id: 'm-5',
      name: 'SPAR Ixopo',
      description: 'Groceries • Ixopo',
      category: 'Stores',
      serviceStatus: 'OPEN',
      prepMinutes: 20,
      rating: 4.5,
      reviews: 74,
      priceTier: '$',
      deliveryFee: 'R25 delivery',
    },
  ];

  const list = merchants.length ? merchants : sampleData;

  return (
    <section className="popular-section wrap-container">
      <div className="section-header-row">
        <div>
          <h2>Popular Near You</h2>
          <p className="muted">Top restaurants and stores in eXobho (Ixopo)</p>
        </div>
        <button className="view-all-link" onClick={onViewAll}>
          View All ➔
        </button>
      </div>

      <div className="popular-cards-grid">
        {list.map((m) => (
          <button key={m.id} className="popular-merchant-card" onClick={() => onSelectMerchant(m)}>
            <div className="merchant-card-image-wrapper">
              <Image
                src="/local-delivery.png"
                alt={m.name}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 250px"
              />
              <span className={`status-badge-tag ${m.serviceStatus === 'OPEN' ? 'open' : 'closed'}`}>
                {m.serviceStatus === 'OPEN' ? 'Open' : 'Closed'}
              </span>
              <span className="rating-pill">
                <Icon name="star" size={12} />
                <strong>{m.rating || 4.5}</strong> ({m.reviews || 120})
              </span>
            </div>

            <div className="merchant-card-details">
              <h3>{m.name}</h3>
              <p className="card-sub">{m.priceTier || '$$'} • {m.category} • Ixopo</p>
              <div className="card-meta">
                <span><Icon name="clock" size={13} /> {m.prepMinutes - 5}–{m.prepMinutes + 5} min</span>
                <span>• {m.deliveryFee || 'R25 delivery'}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
