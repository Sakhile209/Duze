'use client';

import { Icon } from '../icon';

type Props = {
  currentUser: any;
  currentAddress: any;
  cartCount: number;
  onOpenDrawer: () => void;
  onOpenCart: () => void;
  onSearch: (q: string) => void;
  query: string;
  setQuery: (q: string) => void;
  onSelectAddress: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
};

export function Header({
  currentUser,
  currentAddress,
  cartCount,
  onOpenDrawer,
  onOpenCart,
  onSearch,
  query,
  setQuery,
  onSelectAddress,
  onLoginClick,
  onSignupClick,
}: Props) {
  return (
    <header className="main-header wrap-container">
      <div className="header-left">
        <button className="hamburger-btn" aria-label="Open menu" onClick={onOpenDrawer}>
          <Icon name="menu" size={22} />
        </button>

        <a href="#" className="brand-logo">
          <span className="brand-mark-icon">
            <Icon name="bag" size={22} />
          </span>
          <div className="brand-text">
            <strong>Duze<span className="orange">.</span></strong>
            <small>Local favourites. Delivered.</small>
          </div>
        </a>

        <button className="location-pill-btn" onClick={onSelectAddress}>
          <Icon name="pin" size={16} />
          <div className="location-text">
            <small>Deliver to</small>
            <b>{currentAddress ? `${currentAddress.line1}, ${currentAddress.town}` : 'eXobho (Ixopo) ▾'}</b>
          </div>
        </button>
      </div>

      <div className="header-center">
        <div className="search-bar-input">
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="Search for restaurants, food, drinks, groceries..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value);
            }}
          />
          <button className="button search-submit-btn" onClick={() => onSearch(query)}>
            Search
          </button>
        </div>
      </div>

      <div className="header-right">
        <button className="cart-badge-btn" aria-label="View Shopping Cart" onClick={onOpenCart}>
          <Icon name="cart" size={22} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>

        {currentUser ? (
          <div className="user-profile-pill">
            <div className="avatar-circle">
              <Icon name="user" size={18} />
            </div>
            <span>Hi, <strong>{currentUser.firstName}</strong> ▾</span>
          </div>
        ) : (
          <div className="auth-btn-row">
            <button className="button outline-btn-sm" onClick={onLoginClick}>Log In</button>
            <button className="button orange-btn-sm" onClick={onSignupClick}>Sign Up</button>
          </div>
        )}
      </div>
    </header>
  );
}
