'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/icon';

type Merchant = { id: string; name: string; description: string; category: string; serviceStatus: string; prepMinutes: number; zoneId: string };
type Item = { id: string; name: string; description: string; priceCents: number; available: boolean };
type Menu = { merchant: Merchant; items: Item[] };
type Line = { item: Item; quantity: number };
const money = (cents: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100);
const categories = [{ name: 'All kitchens', icon: 'grid', value: '' }, { name: 'Shisanyama', icon: 'fire', value: 'Shisanyama' }, { name: 'Takeaways', icon: 'food', value: 'Takeaways' }, { name: 'Stores', icon: 'store', value: 'Stores' }];

async function read<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

export default function Home() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [basketMerchant, setBasketMerchant] = useState<Merchant | null>(null);
  const [notice, setNotice] = useState('');
  const [pendingItem, setPendingItem] = useState<Item | null>(null);
  const [panel, setPanel] = useState<'menu' | 'basket'>('menu');
  const dialog = useRef<HTMLDialogElement>(null);
  const menuRequest = useRef(0);
  const count = lines.reduce((n, line) => n + line.quantity, 0);
  const subtotal = lines.reduce((n, line) => n + line.quantity * line.item.priceCents, 0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const timeout = setTimeout(() => {
      const params = new URLSearchParams({ query, category });
      read<Merchant[]>(`/api/catalogue?${params}`, controller.signal)
        .then(setMerchants)
        .catch(e => { if (!controller.signal.aborted) setError(e.message); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 200);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [query, category, retry]);

  function showBasket() { setPanel('basket'); setNotice(''); dialog.current?.showModal(); }
  async function openMenu(id: string) {
    const requestId = ++menuRequest.current;
    setSelectedId(id); setPanel('menu'); setMenu(null); setMenuLoading(true); setMenuError(''); setNotice(''); setPendingItem(null);
    dialog.current?.showModal();
    try { const result = await read<Menu>(`/api/catalogue/${id}`); if (requestId === menuRequest.current) setMenu(result); }
    catch (e) { if (requestId === menuRequest.current) setMenuError(e instanceof Error ? e.message : 'Could not load menu.'); }
    finally { if (requestId === menuRequest.current) setMenuLoading(false); }
  }
  function add(item: Item) {
    if (!menu || !item.available || menu.merchant.serviceStatus !== 'OPEN') return;
    if (basketMerchant && basketMerchant.id !== menu.merchant.id && lines.length) { setPendingItem(item); return; }
    setBasketMerchant(menu.merchant);
    setLines(previous => {
      const existing = previous.find(line => line.item.id === item.id);
      return existing ? previous.map(line => line.item.id === item.id ? { ...line, quantity: Math.min(line.quantity + 1, 20) } : line) : [...previous, { item, quantity: 1 }];
    });
    setNotice(`${item.name} added to your basket.`);
  }
  function replaceBasket() {
    if (!pendingItem || !menu) return;
    setLines([{ item: pendingItem, quantity: 1 }]); setBasketMerchant(menu.merchant); setPendingItem(null); setNotice('Basket switched to this kitchen.');
  }
  function quantity(id: string, delta: number) {
    setLines(previous => previous.map(line => line.item.id === id ? { ...line, quantity: Math.min(20, line.quantity + delta) } : line).filter(line => line.quantity > 0));
  }

  return <>
    <a className="skip" href="#kitchens">Skip to kitchens</a>
    <div className="pilot-strip"><span className="status-dot"/> Made for eXobho. Built around you. <span className="pilot-label">PILOT PREVIEW</span></div>
    <header className="header wrap">
      <a href="/" className="brand" aria-label="Duze home"><span className="brand-mark"><Icon name="bag" size={25}/></span><span><strong>Duze<span className="orange">.</span></strong><small>Local favourites. Delivered.</small></span></a>
      <div className="location"><span className="location-pin"><Icon name="pin"/></span><span><small>YOUR NEIGHBOURHOOD</small><b>eXobho (Ixopo), KZN</b></span><span className="location-tag">Pilot</span></div>
      <button className="basket-button" onClick={showBasket}><Icon name="bag"/><span>Basket</span><b>{count}</b></button>
    </header>
    <div className="nav-line"><nav className="wrap navigation" aria-label="Main navigation"><a className="active" href="#home">Discover</a><a href="#kitchens">Local kitchens</a><a href="#how-it-works">How Duze works</a><span><Icon name="heart" size={15}/> A little closer to local.</span></nav></div>
    <main id="home" className="wrap">
      <section className="hero" aria-labelledby="hero-title">
        <Image src="/local-delivery.png" alt="Illustration of a motorcycle rider collecting food from a local kitchen" fill priority sizes="(max-width: 1200px) 100vw, 1200px" className="hero-image"/>
        <div className="hero-shade"/>
        <div className="hero-content"><span className="eyebrow"><span/> GOOD FOOD. GREAT NEIGHBOURS.</span><h1 id="hero-title">A little local.<br/>A lot to <em>love.</em></h1><p>From the shisanyama down the road to your<br className="desktop-break"/> everyday favourites. Discover the good in eXobho.</p><a className="button orange-button" href="#kitchens">Find your local favourite <Icon name="arrow" size={19}/></a><div className="hero-foot"><Icon name="pin" size={16}/> Starting in eXobho, KwaZulu-Natal</div></div>
        <div className="hero-sticker"><span className="sticker-icon"><Icon name="bike" size={28}/></span><span><b>From our town.<br/>To your door.</b><small>That’s the Duze way.</small></span></div>
      </section>
      <section className="browse-controls" aria-label="Find kitchens">
        <label className="search"><Icon name="search"/><input type="search" aria-label="Search kitchens or dishes" placeholder="What are you craving? Search kitchens or dishes" value={query} maxLength={120} onChange={event => setQuery(event.target.value)}/>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><Icon name="close" size={17}/></button>}</label>
        <div className="categories" role="group" aria-label="Kitchen category">{categories.map(c => <button key={c.name} aria-pressed={category === c.value} className={category === c.value ? 'selected' : ''} onClick={() => setCategory(c.value)}><Icon name={c.icon} size={19}/>{c.name}</button>)}</div>
      </section>
      <section id="kitchens" className="kitchens" aria-labelledby="kitchen-title">
        <div className="section-heading"><div><span className="overline">GOOD THINGS, CLOSE BY</span><h2 id="kitchen-title">Neighbourhood favourites<span className="orange">.</span></h2><p>Local kitchens. Big flavour. A taste of home.</p></div><span className="sample-badge">Sample catalogue</span></div>
        <div className="catalogue-note"><Icon name="pin" size={17}/><span>Explore fictional pilot kitchens and sample prices. Ordering is not available in this preview.</span></div>
        {loading ? <div className="merchant-grid" aria-label="Loading kitchens" aria-busy="true">{[1,2,3].map(n => <div className="skeleton" key={n}><div/><p/><p/></div>)}</div>
          : error ? <div className="empty" role="alert"><Icon name="store" size={34}/><h3>The kitchens are taking a moment.</h3><p>{error}</p><button className="button green-button" onClick={() => setRetry(r => r + 1)}>Try again</button></div>
          : !merchants.length ? <div className="empty"><Icon name="search" size={34}/><h3>No favourites found just yet.</h3><p>Try a different dish or explore all kitchens.</p><button className="button green-button" onClick={() => { setQuery(''); setCategory(''); }}>Show all kitchens</button></div>
          : <div className="merchant-grid">{merchants.map((merchant, index) => <button key={merchant.id} className="merchant-card" onClick={() => openMenu(merchant.id)} aria-label={`View ${merchant.name} menu`}>
            <div className={`merchant-photo photo-${index % 3}`}><Image src="/local-delivery.png" alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 400px"/><span className="photo-tag"><Icon name={merchant.category === 'Stores' ? 'store' : 'fire'} size={14}/>{merchant.category}</span><span className="photo-corner"><Icon name="arrow" size={18}/></span></div>
            <div className="merchant-info"><div className="merchant-title"><h3>{merchant.name}</h3><span className={`open-tag ${merchant.serviceStatus !== 'OPEN' ? 'closed' : ''}`}><i/>{merchant.serviceStatus === 'OPEN' ? 'Open' : merchant.serviceStatus === 'BUSY' ? 'Busy' : 'Closed'}</span></div><p>{merchant.description}</p><div className="merchant-meta"><span><Icon name="clock" size={15}/>{merchant.prepMinutes} min prep</span><span className="meta-dot">·</span><span>eXobho</span><b>View menu <span>↗</span></b></div></div>
          </button>)}</div>}
      </section>
      <section className="local-banner"><div className="local-banner-symbol"><Icon name="heart" size={32}/></div><div><span className="overline">SMALL TOWN. BIG HEART.</span><h2>Your next favourite is closer than you think.</h2><p>Every local order has a story. Let’s make more of them.</p></div><span className="local-seal">PROUDLY<br/><b>eXobho</b><br/>ROOTED IN LOCAL</span></section>
      <section id="how-it-works" className="how-section"><div className="section-heading"><div><span className="overline">THE DUZE WAY</span><h2>Local goodness, made simple.</h2></div><span className="muted">Our planned delivery experience</span></div><div className="steps">{[{ icon: 'search', title: 'Find your favourite', text: 'Explore the kitchens and everyday essentials around you.' }, { icon: 'fire', title: 'Made with local love', text: 'Your kitchen accepts and gets your favourites ready.' }, { icon: 'bike', title: 'A friendly ride away', text: 'A Duze rider brings it over. Follow every step along the way.' }].map((step, i) => <article key={step.title}><div className="step-icon"><Icon name={step.icon} size={26}/><span>0{i + 1}</span></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></section>
    </main>
    <footer><div className="wrap footer-content"><a href="/" className="footer-brand">Duze<span className="orange">.</span><small>Local favourites. Delivered.</small></a><p>For the kitchens, riders and people<br/>who make eXobho feel like home.</p><span>eXobho, KwaZulu-Natal<br/><small>Development preview · No live orders</small></span></div></footer>
    <nav className="mobile-nav" aria-label="Mobile navigation"><a href="#home"><Icon name="grid" size={20}/>Discover</a><a href="#kitchens"><Icon name="food" size={20}/>Kitchens</a><button onClick={showBasket}><Icon name="bag" size={20}/>Basket {count > 0 && `(${count})`}</button></nav>
    <dialog ref={dialog} aria-labelledby="panel-title" onClose={() => setPendingItem(null)}>
      <div className="dialog-heading"><div><span className="overline">DUZE · PILOT PREVIEW</span><h2 id="panel-title">{panel === 'basket' ? 'Your basket' : menu?.merchant.name || 'Kitchen menu'}</h2></div><button autoFocus className="icon-button" aria-label="Close panel" onClick={() => dialog.current?.close()}><Icon name="close"/></button></div>
      {panel === 'menu' ? <>
        {menuLoading && <p role="status" className="dialog-message">Getting the menu ready…</p>}
        {menuError && <div className="dialog-message" role="alert"><p>{menuError}</p><button className="button green-button" onClick={() => openMenu(selectedId)}>Try again</button></div>}
        {menu && <><p className="menu-description">{menu.merchant.description}</p><div className="menu-meta"><Icon name="clock" size={16}/>{menu.merchant.prepMinutes} min preparation estimate · Sample prices</div>{menu.merchant.serviceStatus !== 'OPEN' && <p className="notice">This kitchen is {menu.merchant.serviceStatus.toLowerCase()}. You can explore its menu.</p>}
          <div className="menu-items">{menu.items.map(item => <article className="menu-item" key={item.id}><div><h3>{item.name}</h3><p>{item.description}</p><b>{money(item.priceCents)}</b></div><button className="add-button" aria-label={`Add ${item.name}`} disabled={!item.available || menu.merchant.serviceStatus !== 'OPEN'} onClick={() => add(item)}>{item.available ? '+ Add' : 'Sold out'}</button></article>)}{!menu.items.length && <p>The menu is being prepared. Check back soon.</p>}</div>
          {pendingItem && <div className="notice" role="alert"><b>Switch kitchens?</b><p>Your basket has items from {basketMerchant?.name}. Replace them with {pendingItem.name} from {menu.merchant.name}?</p><div className="action-row"><button className="button green-button" onClick={replaceBasket}>Replace basket</button><button className="button outline-button" onClick={() => setPendingItem(null)}>Keep my basket</button></div></div>}
          <p className="sr-status" role="status">{notice}</p><button className="button green-button full" onClick={showBasket}><Icon name="bag" size={18}/>View basket ({count})<span>{money(subtotal)}</span></button></>}
      </> : lines.length ? <><p className="menu-description">From <b>{basketMerchant?.name}</b></p><div className="menu-items">{lines.map(line => <article className="basket-line" key={line.item.id}><div><h3>{line.item.name}</h3><span>{money(line.item.priceCents)} each</span></div><div className="quantity"><button aria-label={`Remove one ${line.item.name}`} onClick={() => quantity(line.item.id, -1)}>−</button><span aria-label={`${line.quantity} in basket`}>{line.quantity}</span><button aria-label={`Add one ${line.item.name}`} disabled={line.quantity >= 20} onClick={() => quantity(line.item.id, 1)}>+</button></div><b>{money(line.quantity * line.item.priceCents)}</b></article>)}</div><div className="totals"><div><span>Item subtotal</span><b>{money(subtotal)}</b></div><div><span>Delivery fee</span><span>Quoted at checkout</span></div><div><span>Service fee</span><span>Quoted at checkout</span></div></div><div className="notice"><b>You’re exploring the pilot.</b><p>Checkout is not connected yet. Your basket is kept for this page session only. No order will be placed or payment taken.</p></div><button className="button green-button full" onClick={() => dialog.current?.close()}>Keep exploring <Icon name="arrow" size={18}/></button><button className="text-button" onClick={() => { setLines([]); setBasketMerchant(null); }}>Clear basket</button></> : <div className="empty"><Icon name="bag" size={42}/><h3>Something good belongs here.</h3><p>Explore a local kitchen and add your favourites.</p><button className="button green-button" onClick={() => { dialog.current?.close(); document.getElementById('kitchens')?.scrollIntoView(); }}>Explore kitchens</button></div>}
    </dialog>
  </>;
}
