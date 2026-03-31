import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  FaMapMarkerAlt, FaStar, FaHeart, FaRegTimesCircle, FaInfoCircle,
  FaWalking, FaBicycle, FaBus, FaCar, FaBed, FaBolt, FaCheckCircle,
  FaUndo, FaFilter, FaSearch, FaTimes, FaUserFriends, FaCalendarAlt,
  FaMoneyBillWave, FaShare, FaArrowLeft, FaThLarge, FaList,
  FaHistory, FaBookmark, FaSave, FaTrash, FaFolder, FaRobot,
  FaChevronDown, FaChevronUp, FaEdit, FaPlus, FaEye, FaBell, FaSignOutAlt
} from 'react-icons/fa';
import { MdOutlineVerified } from 'react-icons/md';
import { RiUserSharedLine } from 'react-icons/ri';
import { BiCurrentLocation } from 'react-icons/bi';

const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');

// Utility functions
function normalizeIdValue(value: any): string {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return '';
}

function deriveProfileAge(profile: any): number {
  if (!profile) return 18;
  const numericAge = Number(profile?.age);
  if (Number.isFinite(numericAge) && numericAge > 0) return Math.floor(numericAge);
  
  const dobRaw = profile?.dateOfBirth || profile?.dob || profile?.birthDate;
  if (dobRaw) {
    const dob = new Date(dobRaw);
    if (!Number.isNaN(dob.getTime())) {
      const today = new Date();
      let years = today.getFullYear() - dob.getFullYear();
      const monthDelta = today.getMonth() - dob.getMonth();
      const beforeBirthday = monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate());
      if (beforeBirthday) years -= 1;
      if (years > 0) return years;
    }
  }
  return 18;
}

// Types
interface Roommate {
  id: number | string;
  userId?: string;
  name: string;
  email?: string;
  age: number;
  gender: string;
  university: string;
  bio: string;
  image: string;
  profilePictures?: string[];
  interests?: string[];
  mutualCount?: number;
  role?: string;
}

interface Listing {
  id: number;
  title: string;
  images: string[];
  price: number;
  location: string;
  distance: number;
  distanceUnit: string;
  travelTime: string;
  roomType: string;
  genderPreference: string;
  availableFrom: string;
  billsIncluded: boolean;
  verified: boolean;
  badges: string[];
  description: string;
  features: string[];
  deposit: number;
  roommateCount: number;
  rating?: number;
}

interface ListingCardProps {
  listing: Listing;
  onLike: () => void;
  onPass: () => void;
  onViewDetails: (listing: Listing) => void;
  isAnimating: boolean;
  direction: 'left' | 'right' | null;
  viewMode?: 'card' | 'grid';
}

interface DetailsModalProps {
  listing: Listing;
  onClose: () => void;
  onLike: () => void;
  onBooking: (listing: Listing) => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  bookingId?: string;
}

// Constants
const roomImages: string[] = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598928506911-5c200b0e2f4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

const filterChipsData = [
  { id: 'budget', icon: <FaMoneyBillWave />, label: 'Budget' },
  { id: 'near', icon: <FaMapMarkerAlt />, label: 'Near' },
  { id: 'verified', icon: <FaCheckCircle />, label: 'Verified' },
  { id: 'single', icon: <FaBed />, label: 'Single' },
  { id: 'shared', icon: <FaUserFriends />, label: 'Shared' },
  { id: 'bills', icon: <FaBolt />, label: 'Bills' },
];

const getTravelIcon = (distance: number) => <FaWalking className="text-green-400" />;

const extractResponseArray = (payload: any): any[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const getStoredReadNotificationIds = (): Set<string> => new Set();
const saveReadNotificationIds = (notifications: Notification[]) => {};

// Mini Card for side panels
const MiniListingCard: React.FC<{ listing: Listing; type: 'passed' | 'liked' }> = ({ listing, type }) => {
  const formatPrice = (price: number): string => `Rs. ${price.toLocaleString()}`;
  return (
    <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-lg overflow-hidden border border-white/10 hover:shadow-cyan-500/10 transition-all mb-2">
      <div className="flex items-center gap-2 p-2">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 ${type === 'passed' ? 'bg-red-500/20' : 'bg-green-500/20'} flex items-center justify-center`}>
            {type === 'passed' ? <FaRegTimesCircle className="text-red-400 text-xs" /> : <FaHeart className="text-green-400 text-xs" />}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white truncate">{listing.title}</h4>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <FaMapMarkerAlt className="text-purple-400" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-bold">{formatPrice(listing.price)}</div>
        </div>
      </div>
    </div>
  );
};

// Ranked Result Card Component
const RankedResultCard: React.FC<{ room: any; onOpen: (id: number) => void }> = ({ room, onOpen }) => {
  const formatPrice = (price: number): string => `Rs. ${price.toLocaleString()}/mo`;
  const stars = '★'.repeat(Math.floor(room.rating)) + (room.rating % 1 >= 0.5 ? '☆' : '');
  return (
    <div onClick={() => onOpen(room.id)} className="bg-gradient-to-br from-[#181f36]/80 to-[#232b47]/80 backdrop-blur-sm rounded-xl p-4 mb-3 border border-white/10 hover:border-cyan-400/50 hover:bg-gradient-to-br hover:from-[#181f36] hover:to-[#232b47] transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1"><h3 className="text-base md:text-lg font-bold text-white mb-1">{room.name}</h3></div>
        <div className="text-right"><div className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{formatPrice(room.price)}</div></div>
      </div>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-gray-300"><FaMapMarkerAlt className="text-pink-400 flex-shrink-0" /><span>{room.location}</span></div>
      </div>
      <div className="flex items-center gap-4 mb-3 flex-wrap text-xs md:text-sm">
        <div className="flex items-center gap-1 text-gray-400"><FaWalking className="text-cyan-400" /><span className="font-semibold">{room.distKm < 1 ? `${Math.round(room.distKm * 1000)}m` : `${room.distKm}km`} away</span></div>
        <div className="flex items-center gap-1">{stars && <><span className="text-yellow-400">{stars}</span><span className="text-gray-400">{room.rating.toFixed(1)}</span></>}</div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 border ${room.available ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
          {room.available ? 'Available' : 'Occupied'}
        </span>
        {room.facilities?.slice(0, 3).map((fac: string, idx: number) => (
          <span key={idx} className="px-2 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 flex-shrink-0">{fac}</span>
        ))}
        {room.facilities?.length > 3 && <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-gray-400 border border-white/10">+{room.facilities.length - 3} more</span>}
      </div>
    </div>
  );
};

// Card View Component
const ListingCard: React.FC<ListingCardProps> = ({ listing, onLike, onPass, onViewDetails, isAnimating, direction, viewMode = 'card' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => { if (viewMode !== 'card') return; startX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (viewMode !== 'card' || !cardRef.current || isAnimating) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    if (Math.abs(diff) > 20) {
      cardRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.02}deg)`;
      cardRef.current.style.opacity = `${1 - Math.abs(diff) / 500}`;
    }
  };
  const handleTouchEnd = () => {
    if (viewMode !== 'card' || !cardRef.current || isAnimating) return;
    const diff = currentX.current - startX.current;
    cardRef.current.style.transform = '';
    cardRef.current.style.opacity = '';
    if (diff > 100) onLike();
    else if (diff < -100) onPass();
  };

  const handleMouseDown = (e: React.MouseEvent) => { if (viewMode !== 'card' || isAnimating) return; setIsDragging(true); setDragStartX(e.clientX); if (cardRef.current) cardRef.current.style.transition = 'none'; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cardRef.current || isAnimating || viewMode !== 'card') return;
    const diff = e.clientX - dragStartX;
    if (Math.abs(diff) > 20) {
      cardRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.02}deg)`;
      cardRef.current.style.opacity = `${1 - Math.abs(diff) / 500}`;
    }
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !cardRef.current || isAnimating || viewMode !== 'card') { setIsDragging(false); return; }
    const diff = e.clientX - dragStartX;
    cardRef.current.style.transition = '';
    cardRef.current.style.transform = '';
    cardRef.current.style.opacity = '';
    if (diff > 100) onLike();
    else if (diff < -100) onPass();
    setIsDragging(false);
  };
  const handleMouseLeave = () => { if (isDragging && cardRef.current) { cardRef.current.style.transition = ''; cardRef.current.style.transform = ''; cardRef.current.style.opacity = ''; setIsDragging(false); } };

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;

  if (viewMode === 'card') {
    return (
      <div ref={cardRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
        className={`relative bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl shadow-2xl overflow-hidden border border-white/10 cursor-grab active:cursor-grabbing transition-all duration-300 ${direction === 'left' ? 'animate-swipe-left' : ''} ${direction === 'right' ? 'animate-swipe-right' : ''} ${isDragging ? 'shadow-2xl scale-[1.02]' : ''}`}>
        <div className="relative h-56 overflow-hidden">
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {(listing.badges ?? []).map((badge) => (<span key={badge} className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/90 text-white">{badge}</span>))}
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full"><span className="text-white font-bold">{formatPrice(listing.price)}</span><span className="text-gray-300 text-xs ml-1">/month</span></div>
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1"><FaBed className="text-cyan-400 text-xs" /><span className="text-white text-xs">{listing.roomType}</span></div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2"><h2 className="text-xl font-bold text-white">{listing.title}</h2><div className="flex items-center gap-1 text-xs bg-cyan-500/20 px-2 py-1 rounded-full">{getTravelIcon(listing.distance)}<span className="text-cyan-300">{listing.travelTime}</span></div></div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3"><FaMapMarkerAlt className="text-purple-400" /><span>{listing.location} | {listing.distance}km from SLIIT</span></div>
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1"><BiCurrentLocation className="text-cyan-400" /><span>{listing.travelTime}</span></div>
            <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1"><RiUserSharedLine className="text-purple-400" /><span>{listing.genderPreference}</span></div>
            {listing.billsIncluded && (<div className="bg-green-500/20 px-2 py-1 rounded-full text-xs text-green-400 flex items-center gap-1"><FaBolt /><span>Bills Included</span></div>)}
            <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1"><FaCalendarAlt className="text-orange-400" /><span>Available: {listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span></div>
          </div>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{listing.description}</p>
          <button onClick={() => onViewDetails(listing)} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><FaInfoCircle /><span>View details</span></button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl overflow-hidden border border-white/10 hover:shadow-cyan-500/10 transition-all hover:scale-[1.02]">
      <div className="relative h-40 overflow-hidden"><img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" /><div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white font-bold">{formatPrice(listing.price)}</div></div>
      <div className="p-3"><h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{listing.title}</h3><div className="flex items-center gap-1 text-xs text-gray-400 mb-2"><FaMapMarkerAlt className="text-purple-400 text-[10px]" /><span>{listing.location}</span><span className="mx-1">|</span><span>{listing.distance}km</span></div>
      <button onClick={() => onViewDetails(listing)} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><FaInfoCircle /> Details</button></div>
    </div>
  );
};

// Details Modal Component
const DetailsModal: React.FC<DetailsModalProps> = ({ listing, onClose, onLike, onBooking }) => {
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10">
        <div className="sticky top-0 bg-gradient-to-br from-[#181f36] to-[#0f172a] p-4 border-b border-white/10 flex justify-between items-center"><h3 className="text-lg font-bold text-white">Room Details</h3><button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><FaTimes className="text-gray-400" /></button></div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">{listing.images.map((img, idx) => (<img key={idx} src={img} className="w-full h-20 object-cover rounded-lg" />))}</div>
          <h4 className="text-xl font-bold text-white mb-2">{listing.title}</h4>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm"><FaMoneyBillWave className="text-green-400" /><span className="text-gray-300">Price:</span><span className="text-white font-bold">{formatPrice(listing.price)}/month</span></div>
            <div className="flex items-center gap-2 text-sm"><FaMapMarkerAlt className="text-purple-400" /><span className="text-gray-300">Location:</span><span className="text-white">{listing.location} ({listing.distance}km)</span></div>
            <div className="flex items-center gap-2 text-sm"><FaBed className="text-cyan-400" /><span className="text-gray-300">Room Type:</span><span className="text-white">{listing.roomType}</span></div>
            <div className="flex items-center gap-2 text-sm"><RiUserSharedLine className="text-pink-400" /><span className="text-gray-300">Gender:</span><span className="text-white">{listing.genderPreference}</span></div>
          </div>
          <div className="mb-4"><h5 className="text-sm font-medium text-cyan-300 mb-2">Description</h5><p className="text-sm text-gray-400">{listing.description}</p></div>
          <div className="mb-4"><h5 className="text-sm font-medium text-cyan-300 mb-2">Features</h5><div className="flex flex-wrap gap-2">{(listing.features ?? []).map((feature, idx) => (<span key={idx} className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300">{feature}</span>))}</div></div>
          <div className="space-y-2"><button onClick={() => { onBooking(listing); onClose(); }} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-xl font-medium"><FaCheckCircle /> Book Now</button><button onClick={() => { onLike(); onClose(); }} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium"><FaHeart /> Like This Room</button></div>
        </div>
      </div>
    </div>
  );
};

// Filters Panel Component
const FiltersPanel: React.FC<{ filters: any; setters: any; onReset: () => void }> = ({ filters, setters, onReset }) => {
  const { priceMax, dist, room, avail, facs } = filters;
  const { setPriceMax, setDist, setRoom, setAvail, setFacs } = setters;

  const facilityOptions = [{ name: 'WiFi', icon: '📶' }, { name: 'Air-Cond', icon: '❄️' }, { name: 'Meals', icon: '🍽️' }, { name: 'Private Bath', icon: '🚿' }, { name: 'Parking', icon: '🅿️' }, { name: 'Laundry', icon: '🧺' }, { name: 'Security', icon: '🛡️' }, { name: 'Gym', icon: '💪' }];
  const distanceOptions = [{ label: '500m', value: '500m' }, { label: '1km', value: 'walking' }, { label: '2km', value: 'cycling' }, { label: '5km', value: 'bus' }, { label: 'Any', value: 'any' }];
  const roomTypeOptions = ['All', 'Single', 'Master', 'Sharing', 'Annex'];
  const availabilityOptions = ['All', 'Available', 'Occupied'];

  return (
    <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3"><FaFilter className="text-cyan-400 text-lg sm:text-xl flex-shrink-0" /><h3 className="text-lg sm:text-xl font-bold text-white">Real-Time Filters</h3></div>
        <button onClick={onReset} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"><FaTimes className="text-xs sm:text-sm" /><span>Reset All</span></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-1 md:col-span-2">
          <label className="text-xs sm:text-sm text-cyan-300 mb-2 sm:mb-3 block font-semibold">Price Range (Rs./Month)</label>
          <div className="space-y-2">
            <input type="range" min="3000" max="50000" step="500" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            <div className="flex justify-between text-xs text-gray-400"><span className="hidden sm:inline">Rs. 3,000</span><span className="sm:hidden text-[10px]">3k</span><span className="text-cyan-400 font-bold text-center text-xs sm:text-sm">Rs. {priceMax.toLocaleString()}</span><span className="hidden sm:inline">Rs. 50,000</span><span className="sm:hidden text-[10px]">50k</span></div>
          </div>
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <label className="text-xs sm:text-sm text-cyan-300 mb-2 sm:mb-3 block font-semibold">Max Distance from Campus</label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">{distanceOptions.map((option) => (<button key={option.value} onClick={() => setDist(option.value)} className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${dist === option.value ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50' : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'}`}>{option.label}</button>))}</div>
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <label className="text-xs sm:text-sm text-cyan-300 mb-2 sm:mb-3 block font-semibold">Room Type</label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">{roomTypeOptions.map((type) => (<button key={type} onClick={() => setRoom(type.toLowerCase())} className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${(type === 'All' && room === 'any') || room === type.toLowerCase() ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50' : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'}`}>{type}</button>))}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="md:col-span-1 lg:col-span-1">
          <label className="text-xs sm:text-sm text-cyan-300 mb-2 sm:mb-3 block font-semibold">Availability</label>
          <div className="flex gap-1.5 sm:gap-2">{availabilityOptions.map((status) => (<button key={status} onClick={() => setAvail(status === 'All' ? 'all' : status.toLowerCase())} className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${(status === 'All' && avail === 'all') || avail === status.toLowerCase() ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'}`}>{status}</button>))}</div>
        </div>
      </div>
      <div><label className="text-xs sm:text-sm text-cyan-300 mb-3 sm:mb-4 block font-semibold">Facilities</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2 sm:gap-3">
          {facilityOptions.map((facility) => (<button key={facility.name} onClick={() => { if (facs.includes(facility.name)) { setFacs(facs.filter((f: string) => f !== facility.name)); } else { setFacs([...facs, facility.name]); } }} className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl transition-all border-2 ${facs.includes(facility.name) ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/30' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}>
            <span className="text-lg sm:text-2xl">{facility.icon}</span>
            <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${facs.includes(facility.name) ? 'text-cyan-300' : 'text-gray-400'}`}>{facility.name}</span>
            <div className={`w-5 sm:w-6 h-2.5 sm:h-3 rounded-full transition-all mt-0.5 sm:mt-1 ${facs.includes(facility.name) ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-600'}`} />
          </button>))}
        </div>
      </div>
    </div>
  );
};

// Student Payment Portal Content
const StudentPaymentPortalContent = ({ bookingId }: { bookingId: string | null }) => (
  <div className="space-y-6"><div className="bg-gradient-to-br from-cyan-900/40 via-purple-900/30 to-indigo-900/40 rounded-2xl p-6 border border-cyan-500/20"><h2 className="text-2xl font-bold text-white">Payment Portal</h2><p className="text-gray-300 mt-2">Booking ID: {bookingId || 'N/A'}</p></div></div>
);

// Booking Form Component
const BookingForm: React.FC<{ listing: Listing | null; onClose: () => void; onSubmit: (data: any) => void; currentUserName?: string; currentUserEmail?: string; currentUserImage?: string }> = ({ listing, onClose, onSubmit, currentUserName = '' }) => {
  const [studentName, setStudentName] = useState(currentUserName);
  const [contactNumber, setContactNumber] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');

  const handleSubmit = () => {
    if (!contactNumber || !moveInDate || !durationMonths) { alert('Please fill all fields'); return; }
    onSubmit({ studentName, contactNumber, moveInDate, durationMonths });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl max-w-md w-full p-4">
        <h3 className="text-xl font-bold text-white mb-4">Booking Form</h3>
        <input type="text" placeholder="Full Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full mb-2 p-2 rounded bg-white/10 text-white" />
        <input type="tel" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full mb-2 p-2 rounded bg-white/10 text-white" />
        <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className="w-full mb-2 p-2 rounded bg-white/10 text-white" />
        <input type="number" placeholder="Duration (months)" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} className="w-full mb-4 p-2 rounded bg-white/10 text-white" />
        <div className="flex gap-2"><button onClick={onClose} className="flex-1 p-2 bg-gray-700 rounded">Cancel</button><button onClick={handleSubmit} className="flex-1 p-2 bg-cyan-500 rounded">Submit</button></div>
      </div>
    </div>
  );
};

// Map View Placeholder
const MapViewPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl border border-white/10 text-cyan-200 text-lg font-semibold shadow-inner">
    <span className="mb-2">Map</span>Map View coming soon...
  </div>
);

// Roommate Finder Component
const RoommateFinderPlaceholder = ({ roommateData }: { roommateData: Roommate[] }) => {
  const navigate = useNavigate();
  const [roommateTab, setRoommateTab] = useState<'browse' | 'requests' | 'inbox' | 'groups'>('browse');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [liked, setLiked] = useState<any[]>([]);
  const [passed, setPassed] = useState<any[]>([]);
  const [mutualMatches, setMutualMatches] = useState<any[]>([]);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSidePanels, setShowSidePanels] = useState(true);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [inboxRequests, setInboxRequests] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [apiNotice, setApiNotice] = useState('');
  const [isLoadingRoommates, setIsLoadingRoommates] = useState(false);
  const [localRoommateData, setLocalRoommateData] = useState<any[]>([]);

  const studentsOnly = React.useMemo(() => {
    const data = localRoommateData.length > 0 ? localRoommateData : roommateData;
    return data.filter((profile: any) => profile.role !== 'owner');
  }, [localRoommateData, roommateData]);

  const current = studentsOnly[currentIdx];

  const callRoommateApi = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('bb_access_token') || '';
    if (!token) throw new Error('Please sign in');
    const response = await fetch(`${API_BASE_URL}/api/roommates${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    const json = await response.json();
    if (!response.ok || json?.success === false) throw new Error(json?.message || 'Request failed');
    return json;
  }, []);

  const mapProfileToRoommate = useCallback((profile: any) => ({
    id: normalizeIdValue(profile._id || profile.id),
    userId: normalizeIdValue(profile.userId || profile._id || profile.id),
    name: profile.name || profile.fullName || 'Student',
    email: profile.email || '',
    age: deriveProfileAge(profile),
    gender: profile.gender || 'Any',
    university: profile.boardingHouse || profile.academicYear || 'Student',
    bio: profile.description || profile.bio || 'Looking for a compatible roommate.',
    image: profile.image || profile.profilePicture || 'https://randomuser.me/api/portraits/lego/1.jpg',
    interests: Array.isArray(profile.tags) ? profile.tags : [],
    mutualCount: Number(profile.mutualCount) || 0,
    role: profile.role || '',
  }), []);

  const loadRoommateProfiles = useCallback(async () => {
    setIsLoadingRoommates(true);
    try {
      const token = localStorage.getItem('bb_access_token') || '';
      if (!token) { setLocalRoommateData([]); setIsLoadingRoommates(false); return; }
      const response = await fetch(`${API_BASE_URL}/api/roommates/browse`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await response.json();
      if (response.ok && json.success !== false) {
        const profiles = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        setLocalRoommateData(profiles.map(mapProfileToRoommate));
      } else { setLocalRoommateData([]); }
    } catch (error) { console.error('Error loading roommate profiles:', error); setLocalRoommateData([]); }
    finally { setIsLoadingRoommates(false); }
  }, [mapProfileToRoommate]);

  const loadRoommateNetworkData = useCallback(async () => {
    try {
      const [likedRes, sentRes, inboxRes, mutualRes, groupsRes] = await Promise.allSettled([
        callRoommateApi('/liked'), callRoommateApi('/request/sent'), callRoommateApi('/request/inbox'),
        callRoommateApi('/mutual'), callRoommateApi('/groups'),
      ]);
      if (likedRes.status === 'fulfilled') setLiked((likedRes.value?.data || []).map(mapProfileToRoommate));
      if (sentRes.status === 'fulfilled') {
        setSentRequests((sentRes.value?.data || []).map((req: any) => ({
          id: req._id, message: req.message, status: req.status,
          from: mapProfileToRoommate({ _id: req.recipientId?._id, userId: req.recipientId?._id, fullName: req.recipientId?.fullName, email: req.recipientId?.email, profilePicture: req.recipientId?.profilePicture }),
        })));
      }
      if (inboxRes.status === 'fulfilled') {
        setInboxRequests((inboxRes.value?.data || []).map((req: any) => ({
          id: req._id, message: req.message, status: req.status,
          from: mapProfileToRoommate({ _id: req.senderId?._id, userId: req.senderId?._id, fullName: req.senderId?.fullName, email: req.senderId?.email, profilePicture: req.senderId?.profilePicture }),
        })));
      }
      if (mutualRes.status === 'fulfilled') setMutualMatches((mutualRes.value?.data || []).map(mapProfileToRoommate));
      if (groupsRes.status === 'fulfilled') setGroups(groupsRes.value?.data || []);
    } catch (error) { console.error('Error loading roommate network data:', error); }
  }, [callRoommateApi, mapProfileToRoommate]);

  useEffect(() => { loadRoommateProfiles(); loadRoommateNetworkData(); }, [loadRoommateProfiles, loadRoommateNetworkData]);

  const handleLike = () => {
    if (!current || isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    setTimeout(() => {
      setLiked((prev) => (prev.some((r) => r.id === current.id) ? prev : [...prev, current]));
      if (currentIdx < studentsOnly.length - 1) setCurrentIdx(currentIdx + 1);
      setDirection(null);
      setIsAnimating(false);
      void (async () => {
        try {
          if (current.id && typeof current.id === 'string' && /^[a-f\d]{24}$/i.test(current.id)) {
            await callRoommateApi('/swipe', { method: 'POST', body: JSON.stringify({ profileId: current.id, action: 'like' }) });
          }
          if (current.userId && typeof current.userId === 'string' && /^[a-f\d]{24}$/i.test(current.userId)) {
            await callRoommateApi('/request/send', { method: 'POST', body: JSON.stringify({ recipientId: current.userId, message: 'Hi! Want to connect?' }) });
          }
          await loadRoommateNetworkData();
          setApiNotice('Like saved and request sent.');
          setTimeout(() => setApiNotice(''), 3000);
        } catch (error) {
          setApiNotice((error as Error).message || 'Unable to sync');
          setTimeout(() => setApiNotice(''), 3000);
        }
      })();
    }, 250);
  };

  const handlePass = () => {
    if (!current || isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setTimeout(() => {
      setPassed((prev) => (prev.some((r) => r.id === current.id) ? prev : [...prev, current]));
      if (currentIdx < studentsOnly.length - 1) setCurrentIdx(currentIdx + 1);
      setDirection(null);
      setIsAnimating(false);
      void (async () => {
        try {
          if (current.id && typeof current.id === 'string' && /^[a-f\d]{24}$/i.test(current.id)) {
            await callRoommateApi('/swipe', { method: 'POST', body: JSON.stringify({ profileId: current.id, action: 'pass' }) });
          }
        } catch (error) { console.error('Error syncing pass:', error); }
      })();
    }, 250);
  };

  const handleUndo = () => { if (currentIdx > 0) { setCurrentIdx(currentIdx - 1); setDirection(null); } };
  const handleRequestResponse = async (requestId: string, accept: boolean) => {
    try {
      await callRoommateApi(`/request/${requestId}/${accept ? 'accept' : 'reject'}`, { method: 'PATCH' });
      await loadRoommateNetworkData();
      setApiNotice(accept ? 'Request accepted. Start chatting now!' : 'Request rejected.');
      setTimeout(() => setApiNotice(''), 3000);
    } catch (error) {
      setApiNotice((error as Error).message || 'Failed to update');
      setTimeout(() => setApiNotice(''), 3000);
    }
  };
  const createGroupFromLiked = async () => {
    try {
      const memberEmails = liked.map((m) => m.email).filter(Boolean);
      if (memberEmails.length === 0) { setApiNotice('Like at least one roommate first.'); setTimeout(() => setApiNotice(''), 3000); return; }
      await callRoommateApi('/group', { method: 'POST', body: JSON.stringify({ name: `Roommate Group ${new Date().toLocaleDateString()}`, memberEmails }) });
      await loadRoommateNetworkData();
      setApiNotice('Group created successfully!');
      setTimeout(() => setApiNotice(''), 3000);
    } catch (error) {
      setApiNotice((error as Error).message || 'Failed to create group');
      setTimeout(() => setApiNotice(''), 3000);
    }
  };

  if (isLoadingRoommates && studentsOnly.length === 0) {
    return <div className="flex flex-col items-center justify-center py-12"><div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-300 rounded-full animate-spin mb-4" /><p className="text-cyan-200 text-sm">Loading roommate profiles...</p></div>;
  }
  if (!isLoadingRoommates && studentsOnly.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white/5 rounded-xl border border-white/10">
        <FaUserFriends className="text-4xl text-cyan-400 mx-auto mb-3 opacity-50" />
        <p className="text-gray-300 font-semibold mb-2">No roommate profiles found</p>
        <button onClick={() => navigate('/profile')} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-semibold">Update Your Profile</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
        {[
          { id: 'browse', label: `Browse (${studentsOnly.length})` },
          { id: 'requests', label: `Sent (${sentRequests.length})` },
          { id: 'inbox', label: `Inbox (${inboxRequests.filter((r) => r.status === 'pending').length})` },
          { id: 'groups', label: 'Groups' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setRoommateTab(tab.id as any)} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-semibold ${roommateTab === tab.id ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {roommateTab === 'browse' && (
        <>
          {apiNotice && <div className="text-xs text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{apiNotice}</div>}
          {mutualMatches.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              <p className="text-sm text-emerald-200 font-semibold mb-2">Mutual Matches ({mutualMatches.length})</p>
              <div className="flex flex-wrap gap-2">
                {mutualMatches.slice(0, 6).map((match) => (
                  <button key={match.id} onClick={() => navigate(`/chat?recipientId=${match.userId || match.id}`)} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 transition">
                    <img src={match.image} className="w-6 h-6 rounded-full object-cover" /><span className="text-xs text-emerald-100">{match.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="text-center py-8"><p className="text-gray-400">Swipe to find roommates</p><button onClick={() => setShowSidePanels(!showSidePanels)} className="mt-2 text-xs text-cyan-400">Toggle Panels</button></div>
        </>
      )}

      {roommateTab === 'requests' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Requests Sent</h3>
          {sentRequests.length > 0 ? sentRequests.map((req) => (
            <div key={req.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><img src={req.from.image} className="w-12 h-12 rounded-full object-cover" /><div><p className="text-white font-semibold">{req.from.name}</p><p className="text-xs text-gray-400">{req.message}</p></div></div>
              <span className={`text-xs px-3 py-1 rounded-full ${req.status === 'pending' ? 'bg-yellow-900/50 text-yellow-200' : req.status === 'accepted' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>{req.status.toUpperCase()}</span>
            </div>
          )) : <p className="text-gray-400 text-center py-8">No requests sent yet</p>}
        </div>
      )}

      {roommateTab === 'inbox' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Requests Received</h3>
          {inboxRequests.length > 0 ? inboxRequests.map((req) => (
            <div key={req.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3"><img src={req.from.image} className="w-12 h-12 rounded-full object-cover" /><div><p className="text-white font-semibold">{req.from.name}</p><p className="text-xs text-gray-400">{req.from.university}</p></div></div>
                <span className={`text-xs px-3 py-1 rounded-full ${req.status === 'pending' ? 'bg-yellow-900/50 text-yellow-200' : req.status === 'accepted' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>{req.status.toUpperCase()}</span>
              </div>
              <p className="text-gray-300 mb-3 text-sm">{req.message}</p>
              {req.status === 'pending' && (
                <div className="flex gap-2"><button onClick={() => handleRequestResponse(req.id, true)} className="flex-1 px-3 py-2 bg-green-600/30 border border-green-600 text-green-300 rounded-lg hover:bg-green-600/50 text-xs font-semibold">Accept</button><button onClick={() => handleRequestResponse(req.id, false)} className="flex-1 px-3 py-2 bg-red-600/30 border border-red-600 text-red-300 rounded-lg hover:bg-red-600/50 text-xs font-semibold">Decline</button></div>
              )}
              {req.status === 'accepted' && (
                <button onClick={() => navigate(`/chat?recipientId=${req.from.userId || req.from.id}`)} className="w-full px-3 py-2 bg-cyan-600/30 border border-cyan-600 text-cyan-300 rounded-lg hover:bg-cyan-600/50 text-xs font-semibold">Start Chat</button>
              )}
            </div>
          )) : <p className="text-gray-400 text-center py-8">No requests received yet</p>}
        </div>
      )}

      {roommateTab === 'groups' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-white">Groups</h3><button onClick={createGroupFromLiked} disabled={liked.length === 0} className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 ${liked.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-600 hover:to-pink-600'}`}><FaPlus size={16} /> Create Group</button></div>
          {groups.length > 0 && groups.map((group: any) => (
            <div key={group._id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"><div><p className="text-white font-semibold text-sm">{group.name}</p><p className="text-xs text-gray-400">{group.members?.length || 0} members</p></div><span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">Synced</span></div>
          ))}
          {liked.length > 0 ? (
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-6 border border-cyan-500/30">
              <h4 className="text-white font-semibold mb-4">Your Liked Roommates ({liked.length})</h4>
              <button onClick={createGroupFromLiked} className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg transition"><FaUserFriends size={18} /> Create Group with These Members</button>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <FaUserFriends className="text-4xl text-pink-400 mx-auto mb-3 opacity-50" /><p className="text-gray-300 font-semibold mb-2">No groups yet</p><button onClick={() => setRoommateTab('browse')} className="px-4 py-2 bg-white/10 border border-white/20 text-gray-300 hover:text-white rounded-lg text-sm font-semibold">Browse Roommates</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main SearchPage Component
export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [likedListings, setLikedListings] = useState<Listing[]>([]);
  const [passedListings, setPassedListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('grid');
  const [activeTab, setActiveTab] = useState<'rooms' | 'map' | 'roommate'>('rooms');
  const [showBooking, setShowBooking] = useState<boolean>(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Listing | null>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showPaymentPortal, setShowPaymentPortal] = useState<boolean>(false);
  const [showCheckinForm, setShowCheckinForm] = useState<boolean>(false);
  const [selectedNotificationBooking, setSelectedNotificationBooking] = useState<string | null>(null);
  const [checkinDate, setCheckinDate] = useState<string>('');
  const [notificationPanelPos, setNotificationPanelPos] = useState<{ top: number; left: number }>({ top: 96, left: 16 });
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);
  
  const [priceMax, setPriceMax] = useState<number>(50000);
  const [dist, setDist] = useState<string>('any');
  const [room, setRoom] = useState<string>('any');
  const [avail, setAvail] = useState<string>('all');
  const [facs, setFacs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [sortMode, setSortMode] = useState<'discovery' | 'relevance' | 'price-low' | 'price-high' | 'distance'>('discovery');
  const [dbListings, setDbListings] = useState<Listing[]>([]);
  const [dbRoommates, setDbRoommates] = useState<Roommate[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState('Guest');
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserImage, setCurrentUserImage] = useState('');
  const [popupNotification, setPopupNotification] = useState<Notification | null>(null);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const popupHideTimerRef = useRef<number | null>(null);
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const dismissPopupNotification = useCallback(() => {
    setPopupNotification(null);
    if (popupHideTimerRef.current) { window.clearTimeout(popupHideTimerRef.current); popupHideTimerRef.current = null; }
  }, []);

  const openNotification = useCallback((notif: Notification) => {
    setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.type === 'owner_approval' || notif.type === 'payment_pending') { setSelectedNotificationBooking(notif.bookingId || null); setShowPaymentPortal(true); setShowNotifications(false); }
    else if (notif.type === 'checkin_reminder') { setSelectedNotificationBooking(notif.bookingId || null); setShowCheckinForm(true); setShowNotifications(false); }
    else if (notif.type === 'roommate_request_received' || notif.type === 'roommate_request_accepted' || notif.type === 'roommate_request_rejected') { setActiveTab('roommate'); setShowNotifications(false); }
  }, []);

  const fetchLatestNotifications = useCallback(async (token: string, userId: string, options?: any) => {
    if (!token || !userId) return;
    try {
      const [inboxResponse, sentResponse, groupsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/roommates/request/inbox`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/roommates/request/sent`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/roommates/groups`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setNotifications([]);
    } catch { setNotifications([]); }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const token = localStorage.getItem('bb_access_token') || '';
    if (!token) return;
    const intervalId = setInterval(() => fetchLatestNotifications(token, currentUserId), 60000);
    return () => clearInterval(intervalId);
  }, [currentUserId, fetchLatestNotifications]);

  useEffect(() => {
    return () => { if (popupHideTimerRef.current) clearTimeout(popupHideTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(target) && notificationButtonRef.current && !notificationButtonRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    if (!showNotifications) return;
    const updatePanelPosition = () => {
      const trigger = notificationButtonRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const panelWidth = Math.min(window.innerWidth * 0.94, 416);
      const left = Math.min(Math.max(12, rect.right - panelWidth), window.innerWidth - panelWidth - 12);
      const top = rect.bottom + 8;
      setNotificationPanelPos({ top, left });
    };
    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [showNotifications]);

  useEffect(() => {
    let isCancelled = false;
    const loadSearchData = async () => {
      try {
        const token = localStorage.getItem('bb_access_token') || '';
        const [roomsResponse, housesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/roommates/rooms`),
          fetch(`${API_BASE_URL}/api/owner/public/houses`),
        ]);
        const [roomsJson, housesJson] = await Promise.all([roomsResponse.json(), housesResponse.json()]);
        if (!isCancelled) {
          const roomsData = Array.isArray(roomsJson?.data) ? roomsJson.data : (Array.isArray(roomsJson) ? roomsJson : []);
          const housesData = Array.isArray(housesJson?.data) ? housesJson.data : (Array.isArray(housesJson) ? housesJson : []);
          const mappedRooms: Listing[] = roomsData.map((room: any, idx: number) => ({
            id: idx + 1, title: room.name || 'Room', images: room.images?.length ? room.images : [roomImages[idx % roomImages.length]],
            price: Number(room.price) || 0, location: room.location || 'Unknown', distance: 1, distanceUnit: 'km', travelTime: 'Near campus',
            roomType: room.roomType || 'Single Room', genderPreference: room.genderPreference || 'Any', availableFrom: room.availableFrom || '',
            billsIncluded: room.facilities?.includes('Meals') || false, verified: true, badges: ['Available'], description: room.description || '',
            features: room.facilities || [], deposit: Number(room.deposit) || 0, roommateCount: Number(room.occupancy) || 0,
          }));
          const mappedHouses: Listing[] = housesData.map((house: any, idx: number) => ({
            id: 100000 + idx, title: house.name || 'House', images: house.images?.length ? house.images : [roomImages[idx % roomImages.length]],
            price: Number(house.monthlyPrice) || 0, location: house.address || 'Unknown', distance: 1.2, distanceUnit: 'km', travelTime: 'Near city',
            roomType: house.roomType || 'Single Room', genderPreference: house.genderPreference || 'Any', availableFrom: house.availableFrom || '',
            billsIncluded: false, verified: true, badges: ['Available'], description: house.description || '', features: house.features || [],
            deposit: Number(house.deposit) || 0, roommateCount: Number(house.occupiedRooms) || 0,
          }));
          setDbListings([...mappedRooms, ...mappedHouses]);
        }
        if (!token) return;
        const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const meJson = await meResponse.json();
        const currentUser = meJson?.data || null;
        if (!isCancelled && currentUser?.email) {
          setCurrentUserId(String(currentUser._id || currentUser.id || ''));
          setCurrentUserEmail(currentUser.email);
          setCurrentUserName(currentUser.fullName || '');
          if (currentUser.profilePicture) setCurrentUserImage(currentUser.profilePicture);
        }
        const roommateResponse = await fetch(`${API_BASE_URL}/api/roommates/browse`, { headers: { Authorization: `Bearer ${token}` } });
        const roommateJson = await roommateResponse.json();
        if (!isCancelled && roommateResponse.ok) {
          const roommateData = Array.isArray(roommateJson?.data) ? roommateJson.data : (Array.isArray(roommateJson) ? roommateJson : []);
          setDbRoommates(roommateData.map((profile: any) => ({
            id: normalizeIdValue(profile._id || profile.id), userId: normalizeIdValue(profile.userId || profile._id || profile.id),
            name: profile.name || 'Student', email: profile.email || '', age: deriveProfileAge(profile), gender: profile.gender || 'Any',
            university: profile.boardingHouse || profile.academicYear || 'SLIIT', bio: profile.description || '',
            image: profile.image || 'https://randomuser.me/api/portraits/lego/1.jpg', interests: profile.tags || [], mutualCount: 0, role: profile.role || '',
          })));
        }
      } catch { setDbListings([]); } finally { if (!isCancelled) setIsListingsLoading(false); }
    };
    loadSearchData();
    return () => { isCancelled = true; };
  }, []);

  const effectiveListings = dbListings;
  const effectiveRoommates = dbRoommates;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean);

  const filteredListings = effectiveListings.filter(listing => {
    if (searchTerm && !listing.title.toLowerCase().includes(normalizedSearch) && !listing.location.toLowerCase().includes(normalizedSearch)) return false;
    if (selectedFilters.includes('budget') && listing.price > 20000) return false;
    if (selectedFilters.includes('near') && listing.distance > 2) return false;
    if (selectedFilters.includes('verified') && !listing.verified) return false;
    if (selectedFilters.includes('single') && listing.roomType !== 'Single Room') return false;
    if (selectedFilters.includes('shared') && !listing.roomType.includes('Shared')) return false;
    if (selectedFilters.includes('bills') && !listing.billsIncluded) return false;
    return true;
  });

  const listingScore = (listing: Listing): number => {
    let score = 0;
    if (!normalizedSearch) {
      score += listing.verified ? 25 : 0;
      score += listing.billsIncluded ? 12 : 0;
      score += Math.max(0, 10 - listing.distance * 2);
      score += Math.max(0, 8 - listing.price / 5000);
      return score;
    }
    const haystack = `${listing.title} ${listing.location} ${listing.roomType} ${listing.description}`.toLowerCase();
    if (listing.title.toLowerCase().includes(normalizedSearch)) score += 40;
    if (listing.location.toLowerCase().includes(normalizedSearch)) score += 26;
    for (const token of searchTokens) {
      if (listing.title.toLowerCase().includes(token)) score += 12;
      if (listing.location.toLowerCase().includes(token)) score += 9;
      if (listing.roomType.toLowerCase().includes(token)) score += 7;
      if (haystack.includes(token)) score += 4;
    }
    score += listing.verified ? 10 : 0;
    score += listing.billsIncluded ? 6 : 0;
    score += Math.max(0, 10 - listing.distance * 2);
    return score;
  };

  const rankedListings = [...filteredListings].sort((a, b) => {
    if (sortMode === 'price-low') return a.price - b.price;
    if (sortMode === 'price-high') return b.price - a.price;
    if (sortMode === 'distance') return a.distance - b.distance;
    return listingScore(b) - listingScore(a);
  });

  const roomDataset = dbListings.map((listing, index) => ({
    id: listing.id || index + 1, name: listing.title, location: listing.location, price: listing.price,
    distKm: Number(listing.distance) || 1, roomType: listing.roomType, available: !String(listing.badges || []).includes('Occupied'),
    facilities: listing.features || [], rating: listing.rating || 4.0, desc: listing.description || '',
  }));

  const distMap: Record<string, number> = { '500m': 0.5, walking: 1, cycling: 2, bus: 5, any: 9999 };
  const filteredRooms = roomDataset.filter((r: any) => {
    if (searchTerm && !r.name.toLowerCase().includes(normalizedSearch) && !r.location.toLowerCase().includes(normalizedSearch)) return false;
    if (r.price > priceMax) return false;
    if (dist !== 'any' && r.distKm > distMap[dist]) return false;
    if (room !== 'any' && r.roomType.toLowerCase() !== room.toLowerCase()) return false;
    if (avail === 'available' && !r.available) return false;
    if (avail === 'occupied' && r.available) return false;
    if (facs.length && !facs.every(f => r.facilities.map((fac: string) => fac.toLowerCase()).includes(f.toLowerCase()))) return false;
    return true;
  });

  const roomScore = (roomItem: any): number => {
    let score = 0;
    if (!normalizedSearch) {
      score += roomItem.available ? 25 : 0;
      score += roomItem.rating * 8;
      score += Math.max(0, 12 - roomItem.distKm * 2.2);
      score += Math.max(0, 8 - roomItem.price / 6000);
      return score;
    }
    const haystack = `${roomItem.name} ${roomItem.location} ${roomItem.roomType} ${roomItem.desc} ${roomItem.facilities.join(' ')}`.toLowerCase();
    if (roomItem.name.toLowerCase().includes(normalizedSearch)) score += 42;
    if (roomItem.location.toLowerCase().includes(normalizedSearch)) score += 24;
    for (const token of searchTokens) {
      if (roomItem.name.toLowerCase().includes(token)) score += 14;
      if (roomItem.location.toLowerCase().includes(token)) score += 10;
      if (roomItem.roomType.toLowerCase().includes(token)) score += 8;
      if (haystack.includes(token)) score += 4;
    }
    score += roomItem.available ? 12 : 0;
    score += roomItem.rating * 5;
    score += Math.max(0, 10 - roomItem.distKm * 2);
    return score;
  };

  const rankedRooms = [...filteredRooms].sort((a, b) => {
    if (sortMode === 'price-low') return a.price - b.price;
    if (sortMode === 'price-high') return b.price - a.price;
    if (sortMode === 'distance') return a.distKm - b.distKm;
    return roomScore(b) - roomScore(a);
  });

  const currentListing = rankedListings[currentIndex];

  const handleLike = () => {
    if (!currentListing || isAnimating) return;
    setIsAnimating(true); setDirection('right');
    setTimeout(() => {
      setLikedListings([...likedListings, currentListing]);
      setToastMessage('Added to favorites!'); setShowToast(true);
      setTimeout(() => {
        if (currentIndex < rankedListings.length - 1) setCurrentIndex(currentIndex + 1);
        setDirection(null); setIsAnimating(false);
        setTimeout(() => setShowToast(false), 2000);
      }, 300);
    }, 150);
  };

  const handlePass = () => {
    if (!currentListing || isAnimating) return;
    setIsAnimating(true); setDirection('left');
    setTimeout(() => {
      setPassedListings([...passedListings, currentListing]);
      setToastMessage('Not interested'); setShowToast(true);
      setTimeout(() => {
        if (currentIndex < rankedListings.length - 1) setCurrentIndex(currentIndex + 1);
        setDirection(null); setIsAnimating(false);
        setTimeout(() => setShowToast(false), 2000);
      }, 300);
    }, 150);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const lastPassed = passedListings[passedListings.length - 1];
      const lastLiked = likedListings[likedListings.length - 1];
      if (lastPassed && lastPassed.id === rankedListings[currentIndex - 1]?.id) setPassedListings(passedListings.slice(0, -1));
      else if (lastLiked && lastLiked.id === rankedListings[currentIndex - 1]?.id) setLikedListings(likedListings.slice(0, -1));
      setCurrentIndex(currentIndex - 1);
      setToastMessage('Action undone'); setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]);
    setCurrentIndex(0);
  };

  const handleViewDetails = (listing: Listing) => { setSelectedListing(listing); setShowDetails(true); };
  const handleLogout = () => { localStorage.removeItem('bb_access_token'); localStorage.removeItem('bb_current_user'); navigate('/signin'); };

  if (isListingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
        <div className="text-center"><div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-300 rounded-full animate-spin mx-auto mb-4" /><p className="text-cyan-200">Loading rooms...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col items-center w-full mb-6">
          <div className="w-full mb-4 rounded-2xl border border-white/10 bg-[#0f172a]/70 backdrop-blur-xl shadow-2xl px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-white/10"><FaArrowLeft className="text-white" /></button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">BoardingBook</h1>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-white/5">Home</button>
                <button onClick={() => navigate('/chatbot')} className="px-4 py-2 rounded-xl bg-white/5">AI Chatbot</button>
                <button onClick={() => navigate('/owner-dashboard')} className="px-4 py-2 rounded-xl bg-white/5">List Property</button>
              </div>
              <div className="flex items-center gap-2">
                <button ref={notificationButtonRef} onClick={() => setShowNotifications(!showNotifications)} className="p-2 bg-white/10 rounded-lg relative">
                  <FaBell className="text-white" />
                  {unreadNotificationCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{unreadNotificationCount}</span>}
                </button>
                <button onClick={() => navigate('/profile')} className="flex items-center gap-2 px-2 py-2 rounded-xl bg-white/5">
                  <img src={currentUserImage || 'https://randomuser.me/api/portraits/lego/1.jpg'} className="w-7 h-7 rounded-full object-cover" />
                  <span className="hidden md:inline text-xs text-cyan-100">{currentUserName || currentUserEmail}</span>
                </button>
                <button onClick={handleLogout} className="px-2 py-2 rounded-xl bg-red-500/10 text-red-200"><FaSignOutAlt /></button>
              </div>
            </div>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex rounded-full bg-gradient-to-r from-[#181f36] to-[#0f172a] p-1 w-full max-w-md mb-2">
            <button onClick={() => setActiveTab('rooms')} className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold ${activeTab === 'rooms' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'text-cyan-200'}`}>Rooms</button>
            <button onClick={() => setActiveTab('map')} className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold ${activeTab === 'map' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'text-cyan-200'}`}>Map</button>
            <button onClick={() => setActiveTab('roommate')} className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold ${activeTab === 'roommate' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'text-cyan-200'}`}>Matches</button>
          </div>
          {activeTab === 'rooms' && (
            <div className="flex justify-center gap-2 mt-2">
              <button onClick={() => setViewMode('card')} className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}><FaThLarge /></button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}><FaList /></button>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="flex justify-center mb-4"><span className="text-xs text-cyan-200 bg-cyan-900/60 px-3 py-1.5 rounded-full"><FaInfoCircle className="inline mr-1" />{activeTab === 'rooms' ? (viewMode === 'card' ? 'Swipe cards left/right' : 'Browse listings') : 'Find your ideal roommate!'}</span></div>

        {/* Search & Filters */}
        {activeTab === 'rooms' && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by location..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentIndex(0); }} className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white" />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white"><FaFilter /> {showFilters ? 'Hide' : 'Show'} Filters</button>
              {filterChipsData.map(chip => (<button key={chip.id} onClick={() => toggleFilter(chip.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${selectedFilters.includes(chip.id) ? 'bg-cyan-500 text-white' : 'bg-white/10 text-gray-300'}`}>{chip.icon}{chip.label}</button>))}
            </div>
            <div className="mt-3 flex justify-between"><span className="text-xs text-gray-400">Sort by</span><select value={sortMode} onChange={(e) => setSortMode(e.target.value as any)} className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white"><option value="discovery">Discovery</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="distance">Nearest First</option></select></div>
            {showFilters && <FiltersPanel filters={{ priceMax, dist, room, avail, facs }} setters={{ setPriceMax, setDist, setRoom, setAvail, setFacs }} onReset={() => { setPriceMax(50000); setDist('any'); setRoom('any'); setAvail('all'); setFacs([]); }} />}
          </div>
        )}

        {/* Main Content */}
        {activeTab === 'rooms' ? (
          <>
            <div className="hidden md:block">
              {viewMode === 'card' ? (
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-xl p-4"><h3 className="text-sm font-bold text-white mb-4">Passed ({passedListings.length})</h3>{passedListings.map(l => <MiniListingCard key={l.id} listing={l} type="passed" />)}</div>
                  <div><div className="relative h-[500px]">{currentListing && <ListingCard listing={currentListing} onLike={handleLike} onPass={handlePass} onViewDetails={handleViewDetails} isAnimating={isAnimating} direction={direction} viewMode="card" />}</div><div className="flex justify-center gap-4 mt-4"><button onClick={handlePass} className="w-14 h-14 bg-red-500 rounded-full"><FaRegTimesCircle /></button><button onClick={handleLike} className="w-14 h-14 bg-green-500 rounded-full"><FaHeart /></button></div></div>
                  <div className="bg-white/5 rounded-xl p-4"><h3 className="text-sm font-bold text-white mb-4">Favorites ({likedListings.length})</h3>{likedListings.map(l => <MiniListingCard key={l.id} listing={l} type="liked" />)}</div>
                </div>
              ) : (
                <>
                  {rankedListings.length > 0 && <><h2 className="text-xl font-bold text-white mb-4">Your Saved Searches</h2><div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">{rankedListings.map(l => <ListingCard key={l.id} listing={l} onLike={() => { setLikedListings([...likedListings, l]); setToastMessage('Added to favorites!'); setShowToast(true); setTimeout(() => setShowToast(false), 2000); }} onPass={() => {}} onViewDetails={handleViewDetails} isAnimating={false} direction={null} viewMode="grid" />)}</div></>}
                  <h2 className="text-xl font-bold text-white mb-4">All Available Rooms ({rankedRooms.length})</h2>
                  {rankedRooms.length > 0 ? <div className="space-y-2">{rankedRooms.map(room => <RankedResultCard key={room.id} room={room} onOpen={(id) => { const r = roomDataset.find(rm => rm.id === id); if (r) handleViewDetails({ ...r, images: [roomImages[0]] }); }} />)}</div> : <div className="text-center py-12 bg-white/5 rounded-xl"><FaSearch className="text-4xl text-gray-500 mx-auto mb-4" /><p>No rooms match your filters</p></div>}
                </>
              )}
            </div>
            <div className="md:hidden"><p className="text-center text-gray-400">Mobile view - Swipe or browse</p></div>
          </>
        ) : activeTab === 'map' ? <MapViewPlaceholder /> : <RoommateFinderPlaceholder roommateData={effectiveRoommates} />}

        {/* Modals */}
        {showDetails && selectedListing && <DetailsModal listing={selectedListing} onClose={() => setShowDetails(false)} onLike={handleLike} onBooking={(l) => { setSelectedRoomForBooking(l); setShowBooking(true); }} />}
        {showBooking && <BookingForm listing={selectedRoomForBooking} onClose={() => setShowBooking(false)} onSubmit={() => { setToastMessage('Booking submitted!'); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} currentUserName={currentUserName} currentUserEmail={currentUserEmail} currentUserImage={currentUserImage} />}
        {showPaymentPortal && <StudentPaymentPortalContent bookingId={selectedNotificationBooking} />}
        {popupNotification && <div className="fixed bottom-24 right-4 w-64 z-50 animate-fade-in-up"><div className="rounded-2xl border border-cyan-400/30 bg-[#101a36] p-4"><button onClick={() => openNotification(popupNotification)}><p className="text-sm font-semibold text-white">{popupNotification.title}</p><p className="text-xs text-gray-300">{popupNotification.message}</p></button></div></div>}
        {showToast && <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50"><FaCheckCircle className="text-green-400" /><span>{toastMessage}</span></div>}
      </div>
      <style>{`
        @keyframes swipe-left { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(-300px) rotate(-15deg); opacity: 0; } }
        @keyframes swipe-right { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(300px) rotate(15deg); opacity: 0; } }
        .animate-swipe-left { animation: swipe-left 0.3s ease-out forwards; }
        .animate-swipe-right { animation: swipe-right 0.3s ease-out forwards; }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}