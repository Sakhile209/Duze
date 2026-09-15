'use client';

import { useEffect, useRef, useState } from 'react';
import { Header } from '../components/home/Header';
import { SideNavigation } from '../components/home/SideNavigation';
import { HeroSection } from '../components/home/HeroSection';
import { CategorySection } from '../components/home/CategorySection';
import { PopularNearYou } from '../components/home/PopularNearYou';
import { SignupForm } from '../components/auth/SignupForm';
import { LoginForm } from '../components/auth/LoginForm';
import { Icon } from '../components/icon';
import Image from 'next/image';

type Merchant = { id: string; name: string; description: string; category: string; serviceStatus: string; prepMinutes: number; rating?: number; reviews?: number; priceTier?: string; deliveryFee?: string };
type Item = { id: string; name: string; description: string; priceCents: number; available: boolean; categoryName?: string };
type Menu = { merchant: Merchant; items: Item[] };
type Line = { item: Item; quantity: number };

const money = (cents: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100);

const sampleMerchants: Merchant[] = [
  { id: 'm-1', name: "Marley's Shisanyama", description: 'Shisanyama • Ixopo', category: 'Shisanyama', serviceStatus: 'OPEN', prepMinutes: 25, rating: 4.6, reviews: 128, priceTier: '$$', deliveryFee: 'R25 delivery' },
  { id: 'm-2', name: 'KFC Ixopo', description: 'Fast Food • Ixopo', category: 'Takeaways', serviceStatus: 'OPEN', prepMinutes: 20, rating: 4.4, reviews: 96, priceTier: '$', deliveryFee: 'R20 delivery' },
  { id: 'm-3', name: 'Spur Ixopo', description: 'Family Restaurant • Ixopo', category: 'Restaurants', serviceStatus: 'OPEN', prepMinutes: 30, rating: 4.7, reviews: 210, priceTier: '$$', deliveryFee: 'R30 delivery' },
  { id: 'm-4', name: 'TOPS at SPAR', description: 'Liquor Store • Ixopo', category: 'Alcohol', serviceStatus: 'OPEN', prepMinutes: 20, rating: 4.3, reviews: 58, priceTier: '$', deliveryFee: 'R25 delivery' },
  { id: 'm-5', name: 'SPAR Ixopo', description: 'Groceries • Ixopo', category: 'Stores', serviceStatus: 'OPEN', prepMinutes: 20, rating: 4.5, reviews: 74, priceTier: '$', deliveryFee: 'R25 delivery' },
];

const marleyMenuItems: Item[] = [
  { id: 'm1', name: 'Beef Ribs', description: 'Flame-grilled succulent beef ribs served with pap & relish', priceCents: 8900, available: true, categoryName: 'Grills' },
  { id: 'm2', name: 'Chicken Wings', description: 'Crispy grilled wings tossed in spicy shisanyama marinade', priceCents: 7500, available: true, categoryName: 'Grills' },
  { id: 'm3', name: 'Pap & Wors', description: 'Traditional boerewors grilled over open coals with braai pap', priceCents: 6500, available: true, categoryName: 'Meals' },
  { id: 'm4', name: 'Bucket Special (6 Beers)', description: 'Ice-cold beer bucket special (18+ restricted item)', priceCents: 12000, available: true, categoryName: 'Drinks' },
];

export default function CustomerHomePage() {
  const [activeView, setActiveView] = useState<string>('customer-home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>({ firstName: 'Sakhile', surname: 'Simelane', role: 'CUSTOMER' });
  const [currentAddress, setCurrentAddress] = useState<any>({ line1: '25 East Street', town: 'eXobho (Ixopo)' });

  const [merchants, setMerchants] = useState<Merchant[]>(sampleMerchants);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [lines, setLines] = useState<Line[]>([
    { item: marleyMenuItems[0], quantity: 1 },
    { item: marleyMenuItems[2], quantity: 1 }
  ]);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const cartCount = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((n, l) => n + l.quantity * l.item.priceCents, 0);

  useEffect(() => {
    fetch(`/api/catalogue?query=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length) setMerchants(data); })
      .catch(() => setMerchants(sampleMerchants));
  }, [query, selectedCategory]);

  function handleAuthSuccess(user: any, address: any) {
    setCurrentUser(user);
    if (address) setCurrentAddress(address);
    setActiveView('customer-home');
  }

  function handleSelectItem(itemId: string) {
    setDrawerOpen(false);
    if (itemId === 'signup') setActiveView('signup');
    else if (itemId === 'login') setActiveView('login');
    else if (itemId === 'tracking') setActiveView('tracking');
    else if (itemId === 'rider-app') setActiveView('rider-app');
    else if (itemId === 'merchant-dashboard') setActiveView('merchant-dashboard');
    else if (itemId === 'admin-dashboard') setActiveView('admin-dashboard');
    else setActiveView('customer-home');
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
      {/* 1. MAIN HEADER */}
      <Header
        currentUser={currentUser}
        currentAddress={currentAddress}
        cartCount={cartCount}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenCart={() => { setMenu({ merchant: sampleMerchants[0], items: marleyMenuItems }); dialogRef.current?.showModal(); }}
        onSearch={(q) => setQuery(q)}
        query={query}
        setQuery={setQuery}
        onSelectAddress={() => alert('Saved addresses: Home (25 East Street, Ixopo)')}
        onLoginClick={() => setActiveView('login')}
        onSignupClick={() => setActiveView('signup')}
      />

      {/* 2. LEFT SIDE NAVIGATION DRAWER */}
      <SideNavigation
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem={activeView}
        onSelectItem={handleSelectItem}
        currentUser={currentUser}
        onLogout={() => { setCurrentUser(null); setActiveView('customer-home'); }}
      />

      {/* 3. SIGNUP SCREEN */}
      {activeView === 'signup' && (
        <div className="auth-container">
          <SignupForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setActiveView('login')}
          />
        </div>
      )}

      {/* 4. LOGIN SCREEN */}
      {activeView === 'login' && (
        <div className="auth-container">
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setActiveView('signup')}
          />
        </div>
      )}

      {/* 5. CUSTOMER HOME MAIN CONTENT */}
      {activeView === 'customer-home' && (
        <main>
          {/* HERO BANNER */}
          <HeroSection onOrderNow={() => {
            const el = document.getElementById('popular-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }} />

          {/* CATEGORIES STRIP */}
          <CategorySection
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />

          {/* POPULAR NEAR YOU */}
          <div id="popular-section">
            <PopularNearYou
              merchants={merchants}
              onSelectMerchant={(m) => openMenuModal(m)}
              onViewAll={() => setSelectedCategory('')}
            />
          </div>
        </main>
      )}

      {/* 6. ORDER TRACKING VIEW */}
      {activeView === 'tracking' && (
        <main className="wrap-container" style={{ marginTop: 24 }}>
          <div className="tracking-container">
            <div className="tracking-header">
              <span className="overline">LIVE ORDER STATUS</span>
              <h2>Your Order is on the Way!<span className="orange">.</span></h2>
              <p className="muted">Estimated arrival: <strong>12 minutes</strong> • Order #1024</p>
            </div>

            <div className="tracking-steps">
              <div className="tracking-step done"><div className="step-dot"><Icon name="check" size={16} /></div><span>Confirmed</span></div>
              <div className="tracking-step done"><div className="step-dot"><Icon name="check" size={16} /></div><span>Preparing</span></div>
              <div className="tracking-step active"><div className="step-dot"><Icon name="bike" size={18} /></div><span>On the way</span></div>
              <div className="tracking-step"><div className="step-dot"><Icon name="pin" size={16} /></div><span>Delivered</span></div>
            </div>

            <div className="tracking-map">
              <svg width="100%" height="100%" viewBox="0 0 800 260">
                <rect width="800" height="260" fill="#14261e" />
                <path d="M50 200 Q200 80 400 140 T750 60" fill="none" stroke="#22543d" strokeWidth="12" />
                <path d="M50 200 Q200 80 400 140 T750 60" fill="none" stroke="#FF6B18" strokeWidth="4" strokeDasharray="8 4" />
                <circle cx="50" cy="200" r="16" fill="#075844" />
                <text x="50" y="205" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">🔥</text>
                <g transform="translate(400, 140)">
                  <circle cx="0" cy="0" r="22" fill="#FF6B18" />
                  <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14">🏍️</text>
                  <rect x="-45" y="-45" width="90" height="20" rx="10" fill="white" />
                  <text x="0" y="-31" textAnchor="middle" fill="#003D2E" fontSize="10" fontWeight="bold">Sipho ★ 4.8</text>
                </g>
                <circle cx="750" cy="60" r="16" fill="#059669" />
                <text x="750" y="65" textAnchor="middle" fill="white" fontSize="12">🏠</text>
              </svg>
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, background: '#f8faf7', padding: 18, borderRadius: 14, border: '1px solid var(--line)' }}>
                <small className="overline">DELIVERY ADDRESS</small>
                <p><strong>{currentAddress ? `${currentAddress.line1}, ${currentAddress.town}` : '25 East Street, Ixopo'}</strong></p>
              </div>
              <div style={{ flex: 1, background: '#fff7ed', padding: 18, borderRadius: 14, border: '1px solid #fed7aa' }}>
                <small className="overline" style={{ color: '#c2410c' }}>HANDOVER VERIFICATION PIN</small>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#c2410c', letterSpacing: 4 }}>4829</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 7. RIDER APP SIMULATOR */}
      {activeView === 'rider-app' && (
        <main className="wrap-container" style={{ marginTop: 24 }}>
          <div className="rider-app-container">
            <div className="rider-header">
              <div>
                <h2>Duze Rider</h2>
                <small style={{ color: '#a0aec0' }}>eXobho Zone • Rider Sipho</small>
              </div>
              <button className="toggle-online">ONLINE</button>
            </div>
            <div className="rider-content">
              <div className="offer-card">
                <span className="offer-num">OFFER #1024</span>
                <div className="offer-title">Marley&apos;s Shisanyama</div>
                <div className="offer-meta">📍 Pickup: Main Road (0.8 km)<br />🏠 Drop-off: 25 East Street, Ixopo (1.5 km)</div>
                <div className="offer-payout">You earn: R32.00</div>
                <button className="button full-btn" style={{ background: 'var(--orange)', color: 'white' }}>Accept Trip Offer ➔</button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 8. MERCHANT DASHBOARD */}
      {activeView === 'merchant-dashboard' && (
        <main className="wrap-container" style={{ marginTop: 24 }}>
          <div className="dashboard-layout">
            <aside className="dash-sidebar">
              <div className="dash-brand"><Icon name="store" size={24} /> Duze Business</div>
              <a href="#" className="dash-nav-item active"><Icon name="dashboard" size={18} /> Dashboard</a>
              <a href="#" className="dash-nav-item"><Icon name="orders" size={18} /> Orders (24)</a>
            </aside>
            <section className="dash-main">
              <h2 style={{ fontSize: 24, fontWeight: 900 }}>Marley&apos;s Shisanyama</h2>
              <div className="kpi-grid" style={{ marginTop: 20 }}>
                <div className="kpi-card"><div className="kpi-title">New Orders</div><div className="kpi-value" style={{ color: 'var(--orange)' }}>24</div></div>
                <div className="kpi-card"><div className="kpi-title">Preparing</div><div className="kpi-value">12</div></div>
                <div className="kpi-card"><div className="kpi-title">Completed</div><div className="kpi-value">18</div></div>
                <div className="kpi-card"><div className="kpi-title">Today&apos;s Sales</div><div className="kpi-value">R4,520</div></div>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* 9. ADMIN DASHBOARD */}
      {activeView === 'admin-dashboard' && (
        <main className="wrap-container" style={{ marginTop: 24 }}>
          <div className="dashboard-layout">
            <aside className="dash-sidebar">
              <div className="dash-brand"><Icon name="shield" size={24} /> Duze Admin</div>
              <a href="#" className="dash-nav-item active"><Icon name="dashboard" size={18} /> Overview</a>
            </aside>
            <section className="dash-main">
              <h2 style={{ fontSize: 24, fontWeight: 900 }}>Platform Admin Overview</h2>
              <div className="kpi-grid" style={{ marginTop: 20 }}>
                <div className="kpi-card"><div className="kpi-title">Total Orders</div><div className="kpi-value">1,248</div></div>
                <div className="kpi-card"><div className="kpi-title">Active Riders</div><div className="kpi-value">18</div></div>
                <div className="kpi-card"><div className="kpi-title">Approved Stores</div><div className="kpi-value">27</div></div>
                <div className="kpi-card"><div className="kpi-title">Total Revenue</div><div className="kpi-value">R24,560</div></div>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* STORE MENU DIALOG */}
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

        {cartCount > 0 && (
          <div className="floating-cart-bar">
            <div>
              <span style={{ fontWeight: 800 }}>🛒 {cartCount} items</span>
              <span style={{ marginLeft: 12, opacity: 0.9 }}>{money(subtotal)}</span>
            </div>
            <button className="button" style={{ background: 'var(--orange)', color: 'white' }} onClick={() => { dialogRef.current?.close(); setActiveView('tracking'); }}>
              Checkout / Track ➔
            </button>
          </div>
        )}
      </dialog>

      <footer>
        <div className="wrap-container footer-content">
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
