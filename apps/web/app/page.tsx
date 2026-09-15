'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/icon';
import { SignupForm } from '../components/auth/SignupForm';
import { LoginForm } from '../components/auth/LoginForm';

type Merchant = { id: string; name: string; description: string; category: string; serviceStatus: string; prepMinutes: number; zoneId: string; rating?: number; reviews?: number; distance?: string };
type Item = { id: string; name: string; description: string; priceCents: number; available: boolean; categoryName?: string };
type Menu = { merchant: Merchant; items: Item[] };
type Line = { item: Item; quantity: number };

const money = (cents: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100);

const sampleMerchants: Merchant[] = [
  { id: '1', name: "Marley's Shisanyama", description: 'Shisanyama • Alcohol • Entertainment', category: 'Shisanyama', serviceStatus: 'OPEN', prepMinutes: 25, zoneId: 'z1', rating: 4.6, reviews: 328, distance: '1.8 km' },
  { id: '2', name: 'KFC Ixopo', description: 'Finger lickin good chicken and sides', category: 'Takeaways', serviceStatus: 'OPEN', prepMinutes: 20, zoneId: 'z1', rating: 4.3, reviews: 210, distance: '2.5 km' },
  { id: '3', name: 'Spur Ixopo', description: 'Famous steak ranches and family meals', category: 'Restaurants', serviceStatus: 'OPEN', prepMinutes: 30, zoneId: 'z1', rating: 4.2, reviews: 185, distance: '3.1 km' },
  { id: '4', name: 'Debonairs Pizza', description: 'Hot fresh pizza delivered to your door', category: 'Takeaways', serviceStatus: 'OPEN', prepMinutes: 25, zoneId: 'z1', rating: 4.1, reviews: 156, distance: '1.5 km' },
  { id: '5', name: 'Shoprite Ixopo', description: 'Groceries, fresh produce and essentials', category: 'Stores', serviceStatus: 'OPEN', prepMinutes: 15, zoneId: 'z1', rating: 4.5, reviews: 92, distance: '4.5 km' }
];

const marleyMenuItems: Item[] = [
  { id: 'm1', name: 'Beef Ribs', description: 'Flame-grilled succulent beef ribs served with pap & relish', priceCents: 8900, available: true, categoryName: 'Grills' },
  { id: 'm2', name: 'Chicken Wings', description: 'Crispy grilled wings tossed in spicy shisanyama marinade', priceCents: 7500, available: true, categoryName: 'Grills' },
  { id: 'm3', name: 'Pap & Wors', description: 'Traditional boerewors grilled over open coals with braai pap', priceCents: 6500, available: true, categoryName: 'Meals' },
  { id: 'm4', name: 'Bucket Special (6 Beers)', description: 'Ice-cold beer bucket special (18+ restricted item)', priceCents: 12000, available: true, categoryName: 'Drinks' },
];

export default function Home() {
  const [activeView, setActiveView] = useState<
    'welcome' | 'signup' | 'login' | 'customer-home' | 'restaurant-page' | 'tracking' | 'rider-app' | 'merchant-dashboard' | 'admin-dashboard'
  >('customer-home');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentAddress, setCurrentAddress] = useState<any>(null);
  const [merchants, setMerchants] = useState<Merchant[]>(sampleMerchants);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [lines, setLines] = useState<Line[]>([
    { item: marleyMenuItems[0], quantity: 1 },
    { item: marleyMenuItems[2], quantity: 1 }
  ]);
  const [basketMerchant, setBasketMerchant] = useState<Merchant | null>(sampleMerchants[0]);
  const [riderOnline, setRiderOnline] = useState(true);
  const [merchantSoundEnabled, setMerchantSoundEnabled] = useState(true);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const subtotal = lines.reduce((n, l) => n + l.quantity * l.item.priceCents, 0);
  const totalCount = lines.reduce((n, l) => n + l.quantity, 0);

  useEffect(() => {
    fetch(`/api/catalogue?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length) setMerchants(data); })
      .catch(() => setMerchants(sampleMerchants));
  }, [query, category]);

  function handleAuthSuccess(user: any, address: any) {
    setCurrentUser(user);
    if (address) setCurrentAddress(address);
    setActiveView('customer-home');
  }

  function openMenuModal(m: Merchant) {
    setMenu({ merchant: m, items: marleyMenuItems });
    dialogRef.current?.showModal();
  }

  function addItemToCart(item: Item) {
    setLines(prev => {
      const existing = prev.find(l => l.item.id === item.id);
      if (existing) return prev.map(l => l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l);
      return [...prev, { item, quantity: 1 }];
    });
  }

  return (
    <>
      {/* TOP PLATFORM VIEW SWITCHER */}
      <div className="view-switcher-bar">
        <div className="view-switcher-title">
          <span className="brand-mark" style={{ width: 28, height: 32, borderRadius: '12px 12px 12px 3px' }}><Icon name="bag" size={14} /></span>
          <span>DUZE PLATFORM PREVIEW</span>
        </div>
        <div className="view-switcher-tabs">
          <button className={`view-tab ${activeView === 'welcome' ? 'active' : ''}`} onClick={() => setActiveView('welcome')}>
            1. Welcome
          </button>
          <button className={`view-tab ${activeView === 'signup' ? 'active' : ''}`} onClick={() => setActiveView('signup')}>
            2. Sign Up
          </button>
          <button className={`view-tab ${activeView === 'login' ? 'active' : ''}`} onClick={() => setActiveView('login')}>
            3. Log In
          </button>
          <button className={`view-tab ${activeView === 'customer-home' ? 'active' : ''}`} onClick={() => setActiveView('customer-home')}>
            4. Customer Home
          </button>
          <button className={`view-tab ${activeView === 'restaurant-page' ? 'active' : ''}`} onClick={() => setActiveView('restaurant-page')}>
            5. Restaurant Page
          </button>
          <button className={`view-tab ${activeView === 'tracking' ? 'active' : ''}`} onClick={() => setActiveView('tracking')}>
            6. Order Tracking
          </button>
          <button className={`view-tab ${activeView === 'rider-app' ? 'active' : ''}`} onClick={() => setActiveView('rider-app')}>
            7. Rider App
          </button>
          <button className={`view-tab ${activeView === 'merchant-dashboard' ? 'active' : ''}`} onClick={() => setActiveView('merchant-dashboard')}>
            8. Store Dashboard
          </button>
          <button className={`view-tab ${activeView === 'admin-dashboard' ? 'active' : ''}`} onClick={() => setActiveView('admin-dashboard')}>
            9. Admin Dashboard
          </button>
        </div>
      </div>

      <div className="pilot-strip">
        <span className="status-dot" /> Serving eXobho (Ixopo), KwaZulu-Natal • Original Delivery Marketplace
      </div>

      {/* 1. WELCOME SCREEN */}
      {activeView === 'welcome' && (
        <div className="auth-container" style={{ textAlign: 'center' }}>
          <div className="auth-card">
            <span className="brand-mark" style={{ width: 50, height: 60, margin: '0 auto 16px' }}>
              <Icon name="bag" size={30} />
            </span>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--forest)' }}>
              Duze<span className="orange">.</span>
            </h1>
            <p className="muted" style={{ fontStyle: 'italic', marginBottom: 20 }}>Local favourites. Delivered.</p>

            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 8px' }}>
              Food. Drinks. Good Vibes.<br />
              <span className="orange">At Your Door.</span>
            </h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 24 }}>
              Order from your favourite local restaurants, shisanyamas, liquor stores and everyday shops in eXobho.
            </p>

            <button className="button orange-button full-btn" onClick={() => setActiveView('signup')}>
              Get Started
            </button>
            <button className="button outline-button full-btn" style={{ marginTop: 12 }} onClick={() => setActiveView('login')}>
              Log In
            </button>
          </div>
        </div>
      )}

      {/* 2. SIGN UP SCREEN */}
      {activeView === 'signup' && (
        <div className="auth-container">
          <SignupForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setActiveView('login')}
          />
        </div>
      )}

      {/* 3. LOG IN SCREEN */}
      {activeView === 'login' && (
        <div className="auth-container">
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setActiveView('signup')}
          />
        </div>
      )}

      {/* 4. CUSTOMER HOME & 5. RESTAURANT PAGE */}
      {(activeView === 'customer-home' || activeView === 'restaurant-page') && (
        <>
          <header className="header wrap">
            <a href="#" className="brand">
              <span className="brand-mark"><Icon name="bag" size={24} /></span>
              <span>
                <strong>Duze<span className="orange">.</span></strong>
                <small>Local favourites. Delivered.</small>
              </span>
            </a>
            <div className="location-picker">
              <span className="location-pin"><Icon name="pin" size={16} /></span>
              <div>
                <small>DELIVER TO</small>
                <b>{currentAddress ? `${currentAddress.line1}, ${currentAddress.town}` : 'eXobho (Ixopo) ▾'}</b>
              </div>
            </div>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--forest)' }}>
                  👋 {currentUser.firstName} {currentUser.surname}
                </span>
                <button
                  className="basket-button"
                  onClick={() => { setMenu({ merchant: basketMerchant || sampleMerchants[0], items: marleyMenuItems }); dialogRef.current?.showModal(); }}
                >
                  <Icon name="bag" size={18} />
                  <span>Cart</span>
                  <b>{totalCount}</b>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button outline-button" style={{ minHeight: 38, padding: '6px 14px' }} onClick={() => setActiveView('login')}>Log In</button>
                <button className="button orange-button" style={{ minHeight: 38, padding: '6px 14px' }} onClick={() => setActiveView('signup')}>Sign Up</button>
              </div>
            )}
          </header>

          <div className="nav-line">
            <nav className="wrap navigation">
              <a href="#" className="active">Home</a>
              <a href="#restaurants">Restaurants</a>
              <a href="#shisanyamas">Shisanyamas</a>
              <a href="#liquor">Liquor Stores</a>
              <a href="#stores">Groceries & Stores</a>
              <a href="#how">How it Works</a>
              <span><Icon name="heart" size={15} /> Support Local • Create Jobs</span>
            </nav>
          </div>

          <main className="wrap">
            {/* HERO */}
            <section className="hero">
              <Image src="/local-delivery.png" alt="Duze delivery rider in eXobho" fill priority className="hero-image" />
              <div className="hero-shade" />
              <div className="hero-content">
                <span className="eyebrow"><span /> Food. Drinks. Good Vibes.</span>
                <h1>At Your Door<span className="orange">.</span></h1>
                <p>eXobho&apos;s Best Food & Drinks Delivered to You. Order from top restaurants, shisanyamas, liquor stores and more.</p>
                <a href="#restaurants" className="button orange-button">
                  Find Favourites Now <Icon name="arrow" size={18} />
                </a>
              </div>
            </section>

            {/* CATEGORY ICON STRIP */}
            <section className="category-strip">
              {[
                { name: 'Restaurants', icon: 'food', val: 'Restaurants' },
                { name: 'Shisanyamas', icon: 'fire', val: 'Shisanyama' },
                { name: 'Liquor Stores', icon: 'alcohol', val: 'Alcohol' },
                { name: 'Takeaways', icon: 'store', val: 'Takeaways' },
                { name: 'Groceries & more', icon: 'grid', val: 'Stores' }
              ].map(cat => (
                <button
                  key={cat.name}
                  className={`category-card ${category === cat.val ? 'selected' : ''}`}
                  onClick={() => setCategory(category === cat.val ? '' : cat.val)}
                >
                  <span className="icon-box"><Icon name={cat.icon} size={20} /></span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </section>

            {/* SEARCH */}
            <div className="browse-controls" style={{ marginTop: 24 }}>
              <div className="search">
                <Icon name="search" size={20} />
                <input
                  type="search"
                  placeholder="Search for restaurants, drinks, stores in eXobho..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* RESTAURANTS GRID */}
            <section id="restaurants" className="kitchens">
              <div className="section-heading">
                <div>
                  <span className="overline">LOCAL FAVOURITES</span>
                  <h2>Featured Merchants in eXobho<span className="orange">.</span></h2>
                  <p>Order directly from local kitchens, shisanyamas and stores</p>
                </div>
              </div>

              <div className="merchant-grid">
                {merchants.map((m) => (
                  <button key={m.id} className="merchant-card" onClick={() => openMenuModal(m)}>
                    <div className="merchant-photo">
                      <Image src="/local-delivery.png" alt={m.name} fill />
                      <span className="photo-tag">{m.category}</span>
                      <span className="rating-badge">
                        <Icon name="star" size={12} /> {m.rating || 4.5} ({m.reviews || 120})
                      </span>
                    </div>
                    <div className="merchant-info">
                      <div className="merchant-title">
                        <h3>{m.name}</h3>
                        <span className={`open-tag ${m.serviceStatus !== 'OPEN' ? 'closed' : ''}`}>
                          <i /> {m.serviceStatus === 'OPEN' ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <p>{m.description}</p>
                      <div className="merchant-meta">
                        <span><Icon name="clock" size={14} /> {m.prepMinutes} min</span>
                        <span>• {m.distance || '1.8 km'}</span>
                        <b style={{ marginLeft: 'auto', color: 'var(--green)' }}>View Menu ↗</b>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      {/* 6. ORDER TRACKING VIEW */}
      {activeView === 'tracking' && (
        <main className="wrap">
          <div className="tracking-container">
            <div className="tracking-header">
              <span className="overline">LIVE ORDER STATUS</span>
              <h2>Your Order is on the Way!<span className="orange">.</span></h2>
              <p className="muted">Estimated arrival: <strong>12 minutes</strong> • Order #1024</p>
            </div>

            <div className="tracking-steps">
              <div className="tracking-step done">
                <div className="step-dot"><Icon name="check" size={16} /></div>
                <span>Confirmed</span>
              </div>
              <div className="tracking-step done">
                <div className="step-dot"><Icon name="check" size={16} /></div>
                <span>Preparing</span>
              </div>
              <div className="tracking-step active">
                <div className="step-dot"><Icon name="bike" size={18} /></div>
                <span>On the way</span>
              </div>
              <div className="tracking-step">
                <div className="step-dot"><Icon name="pin" size={16} /></div>
                <span>Delivered</span>
              </div>
            </div>

            {/* LIVE SVG MAP SIMULATION */}
            <div className="tracking-map">
              <svg width="100%" height="100%" viewBox="0 0 800 260">
                <rect width="800" height="260" fill="#14261e" />
                <path d="M50 200 Q200 80 400 140 T750 60" fill="none" stroke="#22543d" strokeWidth="12" />
                <path d="M50 200 Q200 80 400 140 T750 60" fill="none" stroke="#ff781f" strokeWidth="4" strokeDasharray="8 4" />
                {/* Merchant Pin */}
                <circle cx="50" cy="200" r="16" fill="#125641" />
                <text x="50" y="205" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">🔥</text>
                <text x="50" y="235" textAnchor="middle" fill="#a0aec0" fontSize="11">Marley&apos;s Shisanyama</text>
                {/* Rider Pin */}
                <g transform="translate(400, 140)">
                  <circle cx="0" cy="0" r="22" fill="#ff781f" />
                  <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14">🏍️</text>
                  <rect x="-45" y="-45" width="90" height="20" rx="10" fill="white" />
                  <text x="0" y="-31" textAnchor="middle" fill="#073c2f" fontSize="10" fontWeight="bold">Sipho ★ 4.8</text>
                </g>
                {/* Customer House Pin */}
                <circle cx="750" cy="60" r="16" fill="#059669" />
                <text x="750" y="65" textAnchor="middle" fill="white" fontSize="12">🏠</text>
                <text x="750" y="95" textAnchor="middle" fill="#a0aec0" fontSize="11">{currentAddress ? currentAddress.line1 : '25 East Street, Ixopo'}</text>
              </svg>
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, background: '#f8faf7', padding: 18, borderRadius: 14, border: '1px solid var(--line)' }}>
                <small className="overline">DELIVERY ADDRESS</small>
                <p><strong>{currentAddress ? `${currentAddress.line1}, ${currentAddress.town}` : '25 East Street, Ixopo'}</strong></p>
                <p className="muted">Landmark: Near Ixopo High School gate</p>
              </div>
              <div style={{ flex: 1, background: '#fff7ed', padding: 18, borderRadius: 14, border: '1px solid #fed7aa' }}>
                <small className="overline" style={{ color: '#c2410c' }}>HANDOVER VERIFICATION PIN</small>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#c2410c', letterSpacing: 4 }}>4829</p>
                <p style={{ fontSize: 11, color: '#9a3412' }}>Give this 4-digit PIN to rider Sipho upon delivery.</p>
              </div>
            </div>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button className="button orange-button">
                <Icon name="phone" size={16} /> Contact Rider Sipho
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 7. RIDER APP SIMULATOR */}
      {activeView === 'rider-app' && (
        <main className="wrap">
          <div className="rider-app-container">
            <div className="rider-header">
              <div>
                <h2>Duze Rider</h2>
                <small style={{ color: '#a0aec0' }}>eXobho Zone • Rider Sipho</small>
              </div>
              <button
                className={`toggle-online ${!riderOnline ? 'offline' : ''}`}
                onClick={() => setRiderOnline(!riderOnline)}
              >
                <i style={{ width: 8, height: 8, borderRadius: '50%', background: riderOnline ? '#4ade80' : '#9ca3af' }} />
                {riderOnline ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>

            <div className="rider-content">
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button className="button orange-button" style={{ flex: 1, minHeight: 36, padding: '6px 12px', fontSize: 12 }}>New Offers (3)</button>
                <button className="button outline-button" style={{ flex: 1, minHeight: 36, padding: '6px 12px', fontSize: 12 }}>Active Delivery (1)</button>
              </div>

              {/* OFFER CARDS */}
              <div className="offer-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="offer-num">OFFER #1024</span>
                  <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>Expires 00:22</span>
                </div>
                <div className="offer-title">Marley&apos;s Shisanyama</div>
                <div className="offer-meta">📍 Pickup: Main Road (0.8 km away)<br />🏠 Drop-off: 25 East Street, Ixopo (1.5 km)</div>
                <div className="offer-payout">You earn: R32.00</div>
                <button className="button orange-button" style={{ width: '100%', minHeight: 42 }}>
                  Accept Trip Offer ➔
                </button>
              </div>

              <div className="offer-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="offer-num">OFFER #1025</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>2.8 km trip</span>
                </div>
                <div className="offer-title">KFC Ixopo</div>
                <div className="offer-meta">🏠 Drop-off: 10 Margaret Street, Ixopo</div>
                <div className="offer-payout">You earn: R28.00</div>
                <button className="button outline-button" style={{ width: '100%', minHeight: 42 }}>Accept Trip Offer</button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 8. BUSINESS DASHBOARD (MERCHANT PWA) */}
      {activeView === 'merchant-dashboard' && (
        <main className="wrap">
          <div className="dashboard-layout">
            <aside className="dash-sidebar">
              <div className="dash-brand">
                <Icon name="store" size={24} /> Duze Business
              </div>
              <a href="#" className="dash-nav-item active"><Icon name="dashboard" size={18} /> Dashboard</a>
              <a href="#" className="dash-nav-item"><Icon name="orders" size={18} /> Orders (24)</a>
              <a href="#" className="dash-nav-item"><Icon name="food" size={18} /> Menu Management</a>
              <a href="#" className="dash-nav-item"><Icon name="grid" size={18} /> Stock / Sold Out</a>
              <a href="#" className="dash-nav-item"><Icon name="chart" size={18} /> Sales Analytics</a>
              <a href="#" className="dash-nav-item"><Icon name="star" size={18} /> Customer Reviews</a>
              <a href="#" className="dash-nav-item"><Icon name="settings" size={18} /> Store Settings</a>
            </aside>

            <section className="dash-main">
              <div className="dash-topbar">
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 900 }}>Marley&apos;s Shisanyama</h2>
                  <p className="muted">Main Road, eXobho • Store ID #501</p>
                </div>
                <button
                  className={`button ${merchantSoundEnabled ? 'orange-button' : 'outline-button'}`}
                  onClick={() => setMerchantSoundEnabled(!merchantSoundEnabled)}
                >
                  <Icon name="volume" size={18} /> Audio Alerts: {merchantSoundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* KPI CARDS */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">New Orders</div>
                  <div className="kpi-value" style={{ color: 'var(--orange)' }}>24</div>
                  <div className="kpi-sub">Needs acceptance</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Preparing</div>
                  <div className="kpi-value">12</div>
                  <div className="kpi-sub">In kitchen</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Completed</div>
                  <div className="kpi-value">18</div>
                  <div className="kpi-sub">Today</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Today&apos;s Sales</div>
                  <div className="kpi-value">R4,520</div>
                  <div className="kpi-sub">+18% vs yesterday</div>
                </div>
              </div>

              {/* RECENT ORDERS TABLE */}
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Live Merchant Order Board</h3>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Items</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>#1024</strong></td>
                    <td>Beef Ribs x1, Pap & Wors x1, Bucket Special x1</td>
                    <td>25 East Street, Ixopo</td>
                    <td><strong>R274.00</strong></td>
                    <td><span className="status-pill preparing">Preparing (15m left)</span></td>
                    <td><button className="add-btn" style={{ fontSize: 11 }}>Mark Ready</button></td>
                  </tr>
                  <tr>
                    <td><strong>#1025</strong></td>
                    <td>Chicken Wings x2, Extra Chakalaka</td>
                    <td>10 Margaret Street</td>
                    <td><strong>R170.00</strong></td>
                    <td><span className="status-pill ready">Ready for Pickup</span></td>
                    <td><span className="muted" style={{ fontSize: 11 }}>Rider Sipho assigned</span></td>
                  </tr>
                  <tr>
                    <td><strong>#1023</strong></td>
                    <td>Mixed Grill Plate x2, Soft Drinks x2</td>
                    <td>12 Highflats Road</td>
                    <td><strong>R230.00</strong></td>
                    <td><span className="status-pill completed">Completed</span></td>
                    <td><span className="muted" style={{ fontSize: 11 }}>Delivered</span></td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </main>
      )}

      {/* 9. ADMIN DASHBOARD */}
      {activeView === 'admin-dashboard' && (
        <main className="wrap">
          <div className="dashboard-layout">
            <aside className="dash-sidebar">
              <div className="dash-brand"><Icon name="shield" size={24} /> Duze Admin</div>
              <a href="#" className="dash-nav-item active"><Icon name="dashboard" size={18} /> Overview</a>
              <a href="#" className="dash-nav-item"><Icon name="user" size={18} /> Users & Roles</a>
              <a href="#" className="dash-nav-item"><Icon name="store" size={18} /> Merchants (27)</a>
              <a href="#" className="dash-nav-item"><Icon name="bike" size={18} /> Riders (18)</a>
              <a href="#" className="dash-nav-item"><Icon name="orders" size={18} /> Orders & Reassign</a>
              <a href="#" className="dash-nav-item"><Icon name="card" size={18} /> Payments & Fees</a>
              <a href="#" className="dash-nav-item"><Icon name="chart" size={18} /> Reports</a>
              <a href="#" className="dash-nav-item"><Icon name="settings" size={18} /> Zone Configuration</a>
            </aside>

            <section className="dash-main">
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Platform Admin Overview</h2>

              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Total Orders</div>
                  <div className="kpi-value">1,248</div>
                  <div className="kpi-sub">+12% this week</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Active Riders</div>
                  <div className="kpi-value">18</div>
                  <div className="kpi-sub">14 on active trips</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Approved Stores</div>
                  <div className="kpi-value">27</div>
                  <div className="kpi-sub">eXobho pilot zone</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Total Revenue</div>
                  <div className="kpi-value">R24,560</div>
                  <div className="kpi-sub">+15% platform fee</div>
                </div>
              </div>

              <div className="admin-grid">
                <div className="admin-panel">
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Orders Volume Trend</h3>
                  <svg width="100%" height="180" viewBox="0 0 500 180">
                    <path d="M10 150 Q100 120 200 60 T400 90 T490 20" fill="none" stroke="#ff781f" strokeWidth="4" />
                    <circle cx="490" cy="20" r="6" fill="#073c2f" />
                  </svg>
                </div>
                <div className="admin-panel">
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Top Merchants</h3>
                  <ol style={{ paddingLeft: 18, fontSize: 13, lineHeight: 2 }}>
                    <li><strong>Marley&apos;s Shisanyama</strong> — 328 orders</li>
                    <li><strong>KFC Ixopo</strong> — 245 orders</li>
                    <li><strong>Shoprite Ixopo</strong> — 198 orders</li>
                    <li><strong>Spur Ixopo</strong> — 176 orders</li>
                  </ol>
                </div>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* MENU MODAL DIALOG */}
      <dialog ref={dialogRef} onClose={() => setMenu(null)}>
        <div className="dialog-heading">
          <h2>{menu?.merchant.name || "Marley's Shisanyama"}</h2>
          <button className="icon-button" onClick={() => dialogRef.current?.close()}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="merchant-banner-header">
          <Image src="/local-delivery.png" alt="Shisanyama" fill />
          <div className="merchant-logo-overlay">🔥</div>
        </div>

        <p className="menu-description">{menu?.merchant.description}</p>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)', margin: '8px 0 16px' }}>
          <span><Icon name="star" size={14} /> 4.6 (328 reviews)</span>
          <span>• Open • 20-40 min prep • 1.8 km</span>
        </div>

        <div className="menu-tab-chips">
          <button className="menu-tab-chip active">All</button>
          <button className="menu-tab-chip">Grills</button>
          <button className="menu-tab-chip">Meals</button>
          <button className="menu-tab-chip">Drinks</button>
          <button className="menu-tab-chip">Combos</button>
        </div>

        <div className="menu-items">
          {(menu?.items || marleyMenuItems).map(item => (
            <div key={item.id} className="menu-item-row">
              <div className="menu-item-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <b>{money(item.priceCents)}</b>
              </div>
              <button className="add-btn" onClick={() => addItemToCart(item)}>
                + Add
              </button>
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="floating-cart-bar">
            <div>
              <span style={{ fontWeight: 800 }}>🛒 {totalCount} items</span>
              <span style={{ marginLeft: 12, opacity: 0.9 }}>{money(subtotal)}</span>
            </div>
            <button className="button orange-button" onClick={() => { dialogRef.current?.close(); setActiveView('tracking'); }}>
              Checkout / Track ➔
            </button>
          </div>
        )}
      </dialog>

      {/* FEATURE BANNER BAR FROM REFERENCE IMAGE */}
      <section className="feature-banner-bar">
        <div className="wrap">
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon"><Icon name="truck" size={22} /></div>
              <span>Fast Delivery</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Icon name="shield" size={22} /></div>
              <span>Safe & Secure</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Icon name="heart" size={22} /></div>
              <span>Support Local</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Icon name="bike" size={22} /></div>
              <span>Available on Web & Mobile</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Icon name="card" size={22} /></div>
              <span>Multiple Payment Options</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Icon name="alcohol" size={22} /></div>
              <span>18+ Alcohol Controls</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Icon name="chart" size={22} /></div>
              <span>Grow Your Business</span>
            </div>
          </div>

          <div className="duze-badge-card">
            Duze — More Than Delivery. A Stronger eXobho.
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footer-content">
          <div>
            <span className="footer-brand">Duze<span className="orange">.</span></span>
            <p>Local favourites. Delivered.<br />Rooted in eXobho, KwaZulu-Natal</p>
          </div>
          <p style={{ textAlign: 'right' }}>
            © 2026 Duze Delivery Marketplace.<br />
            <small>Supporting local kitchens, riders and businesses.</small>
          </p>
        </div>
      </footer>
    </>
  );
}
