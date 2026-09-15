'use client';

import { Icon } from '../icon';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  onSelectItem: (item: string) => void;
  currentUser: any;
  onLogout: () => void;
};

export function SideNavigation({
  isOpen,
  onClose,
  activeItem,
  onSelectItem,
  currentUser,
  onLogout,
}: Props) {
  if (!isOpen) return null;

  const userRole = currentUser?.role || 'CUSTOMER';

  const customerNav = [
    { id: 'customer-home', label: 'Home', icon: 'home' },
    { id: 'restaurants', label: 'Restaurants', icon: 'food' },
    { id: 'shisanyamas', label: 'Shisanyamas', icon: 'fire' },
    { id: 'liquor', label: 'Liquor Stores', icon: 'alcohol' },
    { id: 'takeaways', label: 'Takeaways', icon: 'store' },
    { id: 'groceries', label: 'Groceries & Stores', icon: 'grid' },
    { id: 'tracking', label: 'Order Tracking', icon: 'pin' },
    { id: 'rider-app', label: 'Rider App', icon: 'bike' },
    { id: 'my-orders', label: 'My Orders', icon: 'orders' },
    { id: 'my-addresses', label: 'My Addresses', icon: 'pin' },
    { id: 'my-profile', label: 'My Profile', icon: 'user' },
    { id: 'support', label: 'Support / Help', icon: 'help' },
  ];

  const adminNav = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: 'dashboard' },
  ];

  const merchantNav = [
    { id: 'merchant-dashboard', label: 'Store Dashboard', icon: 'store' },
  ];

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="left-side-drawer" role="dialog" aria-label="Duze side navigation">
        <div className="drawer-top-bar">
          <button className="close-btn" aria-label="Close navigation" onClick={onClose}>
            <Icon name="close" size={22} />
          </button>
          <div className="drawer-brand">
            <span className="drawer-brand-mark"><Icon name="bag" size={20} /></span>
            <div>
              <strong>Duze<span className="orange">.</span></strong>
              <small>Local favourites. Delivered.</small>
            </div>
          </div>
        </div>

        <nav className="drawer-menu-list">
          {customerNav.map((item) => (
            <button
              key={item.id}
              className={`drawer-menu-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onSelectItem(item.id)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </button>
          ))}

          {userRole === 'ADMIN' && adminNav.map((item) => (
            <button
              key={item.id}
              className={`drawer-menu-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onSelectItem(item.id)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </button>
          ))}

          {userRole === 'MERCHANT' && merchantNav.map((item) => (
            <button
              key={item.id}
              className={`drawer-menu-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onSelectItem(item.id)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="drawer-divider" />

          <button className="drawer-menu-item" onClick={() => onSelectItem('settings')}>
            <Icon name="settings" size={20} />
            <span>Settings</span>
          </button>

          {currentUser ? (
            <button className="drawer-menu-item" onClick={onLogout}>
              <Icon name="logout" size={20} />
              <span>Log Out</span>
            </button>
          ) : (
            <button className="drawer-menu-item" onClick={() => onSelectItem('login')}>
              <Icon name="login" size={20} />
              <span>Log In</span>
            </button>
          )}
        </nav>

        <div className="drawer-sticker-card">
          <div className="sticker-content">
            <span className="sticker-icon"><Icon name="bike" size={28} /></span>
            <div>
              <strong>Good Food Creates Stronger Communities.</strong>
            </div>
          </div>
          <div className="orange-wave-line" />
        </div>
      </aside>
    </>
  );
}
