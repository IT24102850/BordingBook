import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ACCENT = '#b5c45a';
const ACCENT_DARK = '#9aaa44';
const API_BASE = 'http://localhost:5001/api';

// ---------- Types ----------
interface Listing {
  _id: string;
  title: string;
  description: string;
  type: string;
  address: string;
  bedrooms: number;
  price: number;
  priceUnit: string;
  imageUrl: string;
}

// ---------- Styles ----------
const s: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    background: '#f5f5f3',
    color: '#111',
    overflow: 'hidden',
  },

  /* ---- Navbar ---- */
  nav: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 48px',
    height: '64px',
    background: 'rgba(245,245,243,0.88)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.5px',
    color: '#111', textDecoration: 'none',
  },
  navLinks: {
    display: 'flex', alignItems: 'center', gap: '32px',
    listStyle: 'none', margin: 0, padding: 0,
  },
  navLink: {
    fontSize: '0.88rem', color: '#444', textDecoration: 'none',
    fontWeight: 500, cursor: 'pointer',
  },
  navDivider: { width: '1px', height: '14px', background: '#ccc' },
  joinBtn: {
    background: ACCENT, color: '#111', border: 'none',
    borderRadius: '999px', padding: '10px 24px',
    fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
  },

  /* ---- Hero ---- */
  hero: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    paddingTop: '64px',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg,#e8e8e4 0%,#d4d4cf 60%,#c8c8c2 100%)',
    zIndex: 0,
  },
  heroBgOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(245,245,243,0.45)',
    zIndex: 1,
  },

  heroContent: {
    position: 'relative', zIndex: 2,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '0 24px',
    maxWidth: '720px', width: '100%',
  },
  heroLabel: { fontSize: '1rem', color: '#666', marginBottom: '12px', fontWeight: 400 },
  heroHeading: {
    fontSize: 'clamp(3rem,8vw,5.5rem)', fontWeight: 800,
    lineHeight: 1.05, letterSpacing: '-2px', color: '#111', margin: '0 0 20px',
  },
  heroDesc: {
    fontSize: '1rem', color: '#555', lineHeight: 1.7,
    maxWidth: '460px', margin: '0 auto 32px',
  },
  discoverBtn: {
    background: '#111', color: '#fff', border: 'none',
    borderRadius: '999px', padding: '16px 40px',
    fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
    letterSpacing: '0.01em', marginBottom: '56px',
    transition: 'background 0.2s, transform 0.15s',
  },

  /* ---- Search Bar ---- */
  searchBar: {
    position: 'relative', zIndex: 2,
    width: '90%', maxWidth: '820px',
    background: '#fff', borderRadius: '999px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
    display: 'flex', alignItems: 'stretch',
    padding: '8px', gap: '0', marginBottom: '80px',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  searchField: {
    flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
    padding: '8px 24px', cursor: 'pointer',
    borderRight: '1px solid #e5e5e5', minWidth: 0,
  },
  searchFieldLast: {
    flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
    padding: '8px 24px', cursor: 'pointer', minWidth: 0,
  },
  fieldIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: '#f0f2e8', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  fieldLabel: { fontSize: '0.75rem', color: '#999', marginBottom: '2px', fontWeight: 500 },
  fieldValue: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '0.9rem', fontWeight: 600, color: '#111',
  },
  selectEl: {
    border: 'none', background: 'transparent', fontWeight: 600,
    fontSize: '0.9rem', cursor: 'pointer', outline: 'none',
    appearance: 'none' as any, color: '#111', minHeight: 'auto', padding: 0,
  },
  chevron: { width: 12, height: 12 } as React.CSSProperties,
  searchBtn: {
    background: ACCENT, color: '#111', border: 'none',
    borderRadius: '999px', padding: '0 32px', fontWeight: 700,
    fontSize: '0.95rem', cursor: 'pointer', flexShrink: 0,
    height: '52px', transition: 'background 0.2s',
  },

  /* ---- Listings Section ---- */
  listingsSection: {
    background: '#fafafa',
    padding: '80px 48px',
  },
  listingsHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  availableLabel: {
    fontSize: '0.9rem', color: '#888', fontWeight: 500,
    marginBottom: '8px',
  },
  listingsHeading: {
    fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800,
    letterSpacing: '-1px', color: '#111', margin: '0 0 16px',
  },
  listingsSubtext: {
    fontSize: '1rem', color: '#666', lineHeight: 1.7,
    maxWidth: '560px', margin: '0 auto',
  },

  /* Filter Tabs */
  tabRow: {
    display: 'flex', justifyContent: 'center', gap: '8px',
    marginTop: '32px', marginBottom: '40px',
  },


  /* Cards Grid */
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    background: '#fff', borderRadius: '16px',
    overflow: 'hidden', border: '1px solid #f0f0f0',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex', flexDirection: 'column',
  },
  cardImg: {
    width: '100%', height: '190px',
    objectFit: 'cover', display: 'block',
  },
  cardBody: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' },
  cardTitle: {
    fontSize: '1rem', fontWeight: 700, color: '#111',
    margin: '0 0 6px', lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: '0.82rem', color: '#777', lineHeight: 1.5,
    margin: '0 0 14px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardMeta: {
    display: 'flex', alignItems: 'center', gap: '14px',
    fontSize: '0.78rem', color: '#888', marginBottom: '14px',
  },
  cardMetaItem: { display: 'flex', alignItems: 'center', gap: '4px' },
  cardFooter: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 'auto',
    paddingTop: '12px', borderTop: '1px solid #f0f0f0',
  },
  cardPrice: { fontSize: '1.2rem', fontWeight: 800, color: '#111' },
  cardPriceUnit: { fontSize: '0.78rem', color: '#999', fontWeight: 400, marginLeft: '2px' },
  rentBtn: {
    background: ACCENT, color: '#111', border: 'none',
    borderRadius: '999px', padding: '8px 20px',
    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
    transition: 'background 0.2s',
  },

  /* Loading / Empty */
  stateMsg: { textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '1rem' },

  /* View All */
  viewAllRow: { textAlign: 'center', marginTop: '40px' },
  viewAllBtn: {
    background: 'transparent', color: '#111',
    border: '2px solid #111', borderRadius: '999px',
    padding: '12px 36px', fontSize: '0.9rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
  },
};

const NAV_ITEMS = ['About', 'Testimonials', 'FAQ', 'Contacts'];

function blobStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    [side]: '-60px', top: '50%', transform: 'translateY(-50%)',
    width: '380px', height: '380px', borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(200,205,185,0.6) 0%,transparent 70%)',
    zIndex: 1,
  };
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '9px 22px', borderRadius: '999px',
    fontSize: '0.875rem', fontWeight: active ? 700 : 500,
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? '#111' : '#fff',
    color: active ? '#fff' : '#444',
    border: active ? '2px solid #111' : '2px solid #e0e0e0',
  };
}

const TABS = [
  { label: 'All', value: '' },
  { label: 'House', value: 'house' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Room', value: 'room' },
  { label: 'Hostel', value: 'hostel' },
];
const LOOKING_OPTIONS = ['Rent a Room', 'Rent an Apartment', 'Share a Room', 'Student Hostel'];
const ROOM_OPTIONS = ['1 room', '2 rooms', '3 rooms', '4+ rooms'];
const PRICE_OPTIONS = ['Any price', 'LKR 5,000–10,000', 'LKR 10,000–20,000', 'LKR 20,000+'];

// ---------- Sub-components ----------
function Chevron() {
  return (
    <svg style={s.chevron} viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="#666" strokeWidth="1.5" />
    </svg>
  );
}

function ListingCard({ listing, onRent }: { listing: Listing; onRent: () => void }) {
  const [hover, setHover] = useState(false);
  const [rentHover, setRentHover] = useState(false);
  return (
    <div
      style={{ ...s.card, transform: hover ? 'translateY(-4px)' : 'none', boxShadow: hover ? '0 8px 28px rgba(0,0,0,0.10)' : '0 2px 12px rgba(0,0,0,0.06)' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={listing.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'}
        alt={listing.title}
        style={s.cardImg}
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'; }}
      />
      <div style={s.cardBody}>
        <h3 style={s.cardTitle}>{listing.title}</h3>
        <p style={s.cardDesc}>{listing.description}</p>
        <div style={s.cardMeta}>
          <span style={s.cardMetaItem}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#999" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
            {listing.address}
          </span>
          <span style={s.cardMetaItem}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#999" strokeWidth="2"><path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" /></svg>
            {listing.bedrooms} Bedroom{listing.bedrooms > 1 ? 's' : ''}
          </span>
        </div>
        <div style={s.cardFooter}>
          <div>
            <span style={s.cardPrice}>LKR {listing.price.toLocaleString()}</span>
            <span style={s.cardPriceUnit}>/{listing.priceUnit}</span>
          </div>
          <button
            style={{ ...s.rentBtn, background: rentHover ? ACCENT_DARK : ACCENT }}
            onMouseEnter={() => setRentHover(true)}
            onMouseLeave={() => setRentHover(false)}
            onClick={onRent}
          >
            Rent
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Component ----------
export default function LandingPage() {
  const navigate = useNavigate();

  // Hero state
  const [looking, setLooking] = useState('Rent a Room');
  const [rooms, setRooms] = useState('1 room');
  const [price, setPrice] = useState('LKR 5,000–10,000');
  const [joinHover, setJoinHover] = useState(false);
  const [discHover, setDiscHover] = useState(false);
  const [srchHover, setSrchHover] = useState(false);

  // Listings state
  const [activeTab, setActiveTab] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAllHover, setVAHover] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = activeTab
      ? `${API_BASE}/listings?type=${activeTab}`
      : `${API_BASE}/listings`;

    fetch(url)
      .then(r => r.json())
      .then(json => setListings((json.data || []).slice(0, 4)))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── Navbar ── */}
      <nav style={s.nav}>
        <a href="/" style={s.logo}>
          <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
            <rect x="0" y="0" width="6" height="8" rx="1" fill="#111" />
            <rect x="8" y="0" width="6" height="8" rx="1" fill="#111" />
            <rect x="0" y="10" width="6" height="8" rx="1" fill="#111" />
            <rect x="8" y="10" width="6" height="8" rx="1" fill="#111" />
            <rect x="16" y="4" width="6" height="10" rx="1" fill={ACCENT} />
          </svg>
          BoardingBook
        </a>

        <ul style={s.navLinks}>
          {NAV_ITEMS.map((item, i) => (
            <React.Fragment key={item}>
              {i > 0 && <span style={s.navDivider} />}
              <li><a href={`#${item.toLowerCase()}`} style={s.navLink}>{item}</a></li>
            </React.Fragment>
          ))}
        </ul>

        <button
          style={{ ...s.joinBtn, background: joinHover ? ACCENT_DARK : ACCENT }}
          onMouseEnter={() => setJoinHover(true)}
          onMouseLeave={() => setJoinHover(false)}
          onClick={() => navigate('/signup')}
        >
          Join
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroBgOverlay} />
        <div style={blobStyle('left')} />
        <div style={blobStyle('right')} />

        <div style={s.heroContent}>
          <p style={s.heroLabel}>Discover your perfect</p>
          <h1 style={s.heroHeading}>Boarding place</h1>
          <p style={s.heroDesc}>
            Find verified student boarding rooms and apartments near your campus.
            Explore options for every lifestyle and budget — unlock your ideal home today.
          </p>
          <button
            style={{ ...s.discoverBtn, background: discHover ? '#333' : '#111', transform: discHover ? 'translateY(-2px)' : 'none' }}
            onMouseEnter={() => setDiscHover(true)}
            onMouseLeave={() => setDiscHover(false)}
            onClick={() => navigate('/find')}
          >
            Discover rooms
          </button>
        </div>

        {/* Search Bar */}
        <div style={s.searchBar}>
          <div style={s.searchField}>
            <span style={s.fieldIcon}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7c2e" strokeWidth="2"><path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" /><path d="M9 22V12h6v10" /></svg>
            </span>
            <div>
              <div style={s.fieldLabel}>I'm looking to...</div>
              <div style={s.fieldValue}>
                <select value={looking} onChange={e => setLooking(e.target.value)} style={s.selectEl}>
                  {LOOKING_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                <Chevron />
              </div>
            </div>
          </div>

          <div style={s.searchField}>
            <span style={s.fieldIcon}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7c2e" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
            </span>
            <div>
              <div style={s.fieldLabel}>Number of rooms</div>
              <div style={s.fieldValue}>
                <select value={rooms} onChange={e => setRooms(e.target.value)} style={s.selectEl}>
                  {ROOM_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                <Chevron />
              </div>
            </div>
          </div>

          <div style={s.searchFieldLast}>
            <span style={s.fieldIcon}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7c2e" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
            </span>
            <div>
              <div style={s.fieldLabel}>Price range</div>
              <div style={s.fieldValue}>
                <select value={price} onChange={e => setPrice(e.target.value)} style={s.selectEl}>
                  {PRICE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                <Chevron />
              </div>
            </div>
          </div>

          <button
            style={{ ...s.searchBtn, background: srchHover ? ACCENT_DARK : ACCENT }}
            onMouseEnter={() => setSrchHover(true)}
            onMouseLeave={() => setSrchHover(false)}
            onClick={() => navigate('/find')}
          >
            Search
          </button>
        </div>
      </section>

      {/* ── Listings Section ── */}
      <section style={s.listingsSection} id="listings">
        <div style={s.listingsHeader}>
          <p style={s.availableLabel}>Available now</p>
          <h2 style={s.listingsHeading}>Boarding places for rent</h2>
          <p style={s.listingsSubtext}>
            Explore our top verified boarding places. Whether you need a cozy single room,
            a shared apartment, or a student hostel, we have something for everyone.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={s.tabRow}>
          {TABS.map(tab => (
            <button
              key={tab.value}
              style={tabStyle(activeTab === tab.value)}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <p style={s.stateMsg}>Loading listings...</p>
        ) : listings.length === 0 ? (
          <p style={s.stateMsg}>No listings found for this category.</p>
        ) : (
          <div style={s.cardsGrid}>
            {listings.map(listing => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onRent={() => navigate('/find')}
              />
            ))}
          </div>
        )}

        {/* View All */}
        <div style={s.viewAllRow}>
          <button
            style={{ ...s.viewAllBtn, background: viewAllHover ? '#111' : 'transparent', color: viewAllHover ? '#fff' : '#111' }}
            onMouseEnter={() => setVAHover(true)}
            onMouseLeave={() => setVAHover(false)}
            onClick={() => navigate('/find')}
          >
            View all listings
          </button>
        </div>
      </section>
    </div>
  );
}