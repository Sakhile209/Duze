'use client';

import Image from 'next/image';
import { Icon } from '../icon';

type Props = {
  onOrderNow: () => void;
};

export function HeroSection({ onOrderNow }: Props) {
  return (
    <section className="hero-banner-card wrap-container">
      <Image
        src="/local-delivery.png"
        alt="Flame grilled food and delivery in eXobho"
        fill
        priority
        className="hero-bg-img"
      />
      <div className="hero-gradient-overlay" />

      <div className="hero-body-content">
        <span className="hero-eyebrow">FOOD. DRINKS. GOOD VIBES.</span>
        <h1 className="hero-headline">
          At Your <span className="hero-orange-accent">Door.</span>
        </h1>
        <p className="hero-subtext">
          eXobho&apos;s best food &amp; drinks delivered to you.<br />
          Order from top restaurants, shisanyamas, liquor stores, groceries and more.
        </p>

        <button className="button hero-cta-btn" onClick={onOrderNow}>
          Order Now ➔
        </button>

        <div className="hero-benefits-strip">
          <div className="benefit-pill">
            <Icon name="truck" size={18} />
            <span>Fast Delivery</span>
          </div>
          <div className="benefit-pill">
            <Icon name="shield" size={18} />
            <span>Safe &amp; Reliable</span>
          </div>
          <div className="benefit-pill">
            <Icon name="heart" size={18} />
            <span>Support Local Business</span>
          </div>
        </div>
      </div>

      <div className="hero-script-overlay">
        <span className="script-text">Good Food<br />Good People<br />Greater Communities</span>
        <div className="script-orange-curve" />
      </div>

      <div className="hero-carousel-dots">
        <span className="dot active" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </section>
  );
}
