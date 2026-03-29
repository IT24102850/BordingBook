
// Utility to normalize ID values (handles string, number, object with _id/id)
function normalizeIdValue(value: any): string {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return '';
}

// Utility to derive age from a profile object (expects profile.dob as ISO string or Date)
function deriveProfileAge(profile: any): number {
  if (!profile || !profile.dob) return 0;
  const dob = new Date(profile.dob);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  const beforeBirthday = monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate());
  if (beforeBirthday) years -= 1;
  return years > 0 ? years : 0;
}

// Listing type
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
  campus?: string[];
  fullAddress?: string;
  vacancy?: string;
  totalRooms?: number;
  occupiedRooms?: number;
}

// Roommate type
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

import React, { useState, useEffect, useRef, ReactNode } from 'react';
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
import { distMap } from '../data/rooms';

const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');

 


// Mini Roommate Card for passed/favorites columns
const MiniRoommateCard: React.FC<{ roommate: any; type: 'passed' | 'liked' }> = ({ roommate, type }) => {
  return (
    <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-lg overflow-hidden border border-white/10 hover:shadow-pink-500/10 transition-all mb-2">
      <div className="flex items-center gap-2 p-2">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={roommate.image} 
            alt={roommate.name}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${type === 'passed' ? 'bg-red-500/20' : 'bg-green-500/20'} flex items-center justify-center`}>
            {type === 'passed' ? (
              <FaRegTimesCircle className="text-red-400 text-xs" />
            ) : (
              <FaHeart className="text-green-400 text-xs" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white truncate">{roommate.name}, {roommate.age}</h4>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <FaUserFriends className="text-pink-400" />
            <span className="truncate">{roommate.university}</span>
          </div>
          <div className="text-[10px] text-pink-400 truncate">
            {roommate.gender}
          </div>
        </div>
      </div>
    </div>
  );
};

// Roommate swipe card component
function RoommateSwipeCard({ roommate, onLike, onPass, isAnimating, direction }: { roommate: any; onLike: () => void; onPass: () => void; isAnimating: boolean; direction: string | null }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  // Use only real data from the database, no fallbacks
  const displayName = roommate.name;
  const images: string[] = Array.isArray(roommate.profilePictures) && roommate.profilePictures.length > 0
    ? roommate.profilePictures.map((img: any) => String(img))
    : (roommate.image ? [String(roommate.image)] : []);

  const resetCardTransform = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = '';
    cardRef.current.style.opacity = '';
    cardRef.current.style.transition = '';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isAnimating || !cardRef.current) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;

    if (Math.abs(diff) > 10) {
      e.preventDefault();
      cardRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.03}deg)`;
      cardRef.current.style.opacity = `${1 - Math.min(Math.abs(diff) / 420, 0.6)}`;
    }
  };

  const handleTouchEnd = () => {
    if (isAnimating) return;
    const diff = touchCurrentX.current - touchStartX.current;
    resetCardTransform();

    if (diff > 90) onLike();
    else if (diff < -90) onPass();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating || !cardRef.current) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    cardRef.current.style.transition = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating || !cardRef.current) return;
    const diff = e.clientX - dragStartX;

    if (Math.abs(diff) > 10) {
      cardRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.03}deg)`;
      cardRef.current.style.opacity = `${1 - Math.min(Math.abs(diff) / 420, 0.6)}`;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating) {
      setIsDragging(false);
      resetCardTransform();
      return;
    }

    const diff = e.clientX - dragStartX;
    setIsDragging(false);
    resetCardTransform();

    if (diff > 90) onLike();
    else if (diff < -90) onPass();
  };

  const handleMouseLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    resetCardTransform();
  };

  return (
    <div
      ref={cardRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`relative bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl shadow-2xl overflow-hidden border border-white/10 w-full max-w-[20rem] mx-auto transition-all duration-300 cursor-grab active:cursor-grabbing ${direction === 'left' ? 'animate-swipe-left' : ''} ${direction === 'right' ? 'animate-swipe-right' : ''}`}
      style={{ minHeight: 340, touchAction: 'pan-y' }}
    >
      {/* Image Carousel */}
      <div className="relative w-full aspect-square bg-gray-800 overflow-hidden">
        {images.length > 0 ? (
          <img 
            src={images[imageIndex]} 
            alt={displayName} 
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">No Image</div>
        )}
        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImageIndex((i) => (i - 1 + images.length) % images.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImageIndex((i) => (i + 1) % images.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all"
            >
              ›
            </button>
          </>
        )}
        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === imageIndex ? 'w-6 bg-white' : 'w-1 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center p-4">
        <h3 className="text-xl font-bold text-white mb-1">
          {displayName}, <span className="text-pink-300">{roommate.age}</span>
        </h3>
        <div className="text-sm text-pink-200 mb-1">
          {roommate.gender} | {roommate.university}
        </div>
        <div className="text-sm text-gray-300 mb-3 text-center">
          {roommate.bio}
        </div>
        {typeof roommate.mutualCount === 'number' && roommate.mutualCount > 0 && (
          <div className="mb-3 text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
            {roommate.mutualCount} mutual interests
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {(roommate.interests || []).map((interest: string, idx: number) => (
            <span key={idx} className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-xs">{interest}</span>
          ))}
        </div>
        <div className="flex gap-8 mt-2">
          <button
            onClick={onPass}
            className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:scale-110 transition-transform"
            title="Pass"
            disabled={isAnimating}
          >
            <FaRegTimesCircle />
          </button>
          <button
            onClick={onLike}
            className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:scale-110 transition-transform"
            title="Like"
            disabled={isAnimating}
          >
            <FaHeart />
          </button>
        </div>
      </div>
    </div>
  );


// Roommate Finder tab content with swipe logic
function RoommateFinderPlaceholder({ roommateData }: { roommateData: Roommate[] }) {
  const navigate = useNavigate();
  const [roommateTab, setRoommateTab] = React.useState<'browse' | 'requests' | 'inbox' | 'groups'>('browse');
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [liked, setLiked] = React.useState<any[]>([]);
  const [passed, setPassed] = React.useState<any[]>([]);
  const [mutualMatches, setMutualMatches] = React.useState<any[]>([]);
  const [direction, setDirection] = React.useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [showSidePanels, setShowSidePanels] = React.useState(false);
  const [sentRequests, setSentRequests] = React.useState<any[]>([]);
  const [inboxRequests, setInboxRequests] = React.useState<any[]>([]);
  const [groups, setGroups] = React.useState<any[]>([]);
  const [apiNotice, setApiNotice] = React.useState('');
  // Filter out owners (assuming profile.role or profile.isOwner)
  const studentsOnly = roommateData.filter((profile: any) => !profile.role || profile.role !== 'owner');
  const current = studentsOnly[currentIdx];

  // Placeholder implementations for missing functions
  function handleRequestResponse(id: any, accepted: boolean) {
    // TODO: Implement request response logic
    alert(`Request ${id} ${accepted ? 'accepted' : 'declined'}`);
  }
  function createGroupFromLiked() {
    // TODO: Implement group creation logic
    alert('Group created from liked roommates');
  }

  // Ensure this returns JSX
  return <></>;

  const isMongoId = (value: any): boolean => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

  const callRoommateApi = React.useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token = localStorage.getItem('bb_access_token') || '';
      if (!token) {
        throw new Error('Please sign in to use roommate features');
      }

      const response = await fetch(`${API_BASE_URL}/api/roommates${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || json?.success === false) {
        throw new Error(json?.message || 'Roommate request failed');
      }

      return json;
    },
    []
  );

  const mapProfileToRoommate = React.useCallback((profile: any) => ({
    id: normalizeIdValue(profile._id || profile.id),
    userId: normalizeIdValue(profile.userId || profile._id || profile.id),
    name: profile.name || profile.fullName || '',
    email: profile.email || '',
    age: deriveProfileAge(profile),
    gender: profile.gender || '',
    university: profile.boardingHouse || profile.academicYear || '',
    bio: profile.bio,
    image: Array.isArray(profile.profilePictures) && profile.profilePictures.length > 0
      ? profile.profilePictures[0]
      : (profile.profilePicture || profile.image || ''),
    profilePictures: Array.isArray(profile.profilePictures) ? profile.profilePictures : [],
    interests: Array.isArray(profile.tags) ? profile.tags : [],
    mutualCount: Number(profile.mutualCount) || 0,
    role: profile.role || '',
  }), []);

  const loadRoommateNetworkData = React.useCallback(async () => {
    try {
      const [likedRes, sentRes, inboxRes, mutualRes, groupsRes] = await Promise.allSettled([
        callRoommateApi('/liked'),
        callRoommateApi('/request/sent'),
        callRoommateApi('/request/inbox'),
        callRoommateApi('/mutual'),
        callRoommateApi('/groups'),
      ]);
    setTimeout(() => {
      setPassed((prev) => (prev.some((r) => r.id === current.id) ? prev : [...prev, current]));
      // ...existing code...

      {/* SENT REQUESTS TAB */}
      {roommateTab === 'requests' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Requests Sent</h3>
          <div className="space-y-3">
            {sentRequests.length > 0 ? (
              sentRequests.map((req) => (
                <div key={req.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={req.from.image} alt="" className="w-12 h-12 rounded-full object-cover border border-pink-400" />
                    <div>
                      <p className="text-white font-semibold">{req.from.name}</p>
                      <p className="text-xs text-gray-400">{req.message}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${req.status === 'pending' ? 'bg-yellow-900/50 text-yellow-200' : req.status === 'accepted' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No requests sent yet</p>
            )}
          </div>
        </div>
      )}

      {/* INBOX TAB */}
      {roommateTab === 'inbox' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Requests Received</h3>
          <div className="space-y-3">
            {inboxRequests.length > 0 ? (
              inboxRequests.map((req) => (
                <div key={req.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={req.from.image} alt="" className="w-12 h-12 rounded-full object-cover border border-pink-400" />
                      <div>
                        <p className="text-white font-semibold">{req.from.name}</p>
                        <p className="text-xs text-gray-400">{req.from.university}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${req.status === 'pending' ? 'bg-yellow-900/50 text-yellow-200' : req.status === 'accepted' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-3 text-sm">{req.message}</p>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRequestResponse(req.id, true)} className="flex-1 px-3 py-2 bg-green-600/30 border border-green-600 text-green-300 rounded-lg hover:bg-green-600/50 text-xs font-semibold">
                        Accept
                      </button>
                      <button onClick={() => handleRequestResponse(req.id, false)} className="flex-1 px-3 py-2 bg-red-600/30 border border-red-600 text-red-300 rounded-lg hover:bg-red-600/50 text-xs font-semibold">
                        Decline
                      </button>
                    </div>
                  )}
                  {req.status === 'accepted' && (
                    <button
                      onClick={() => {
                        // Always normalize recipientId and ensure selectedRoommate.userId is set
                        const recipientId = normalizeIdValue(req.from.userId || req.from.id || '');
                        const selectedRoommate = { ...req.from, userId: normalizeIdValue(req.from.userId || req.from.id || '') };
                        navigate(`/chat?recipientId=${encodeURIComponent(recipientId)}`, {
                          state: { selectedRoommate, chatType: 'direct-message', recipientId },
                        });
                      }}
                      className="w-full px-3 py-2 bg-cyan-600/30 border border-cyan-600 text-cyan-300 rounded-lg hover:bg-cyan-600/50 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      Start Chat
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No requests received yet</p>
            )}
          </div>
        </div>
      )}

      {/* GROUPS TAB */}
      {roommateTab === 'groups' && (
        {/* ...existing group tab content... */}
      )}

// Placeholder for Map View
function MapViewPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl border border-white/10 text-cyan-200 text-lg font-semibold shadow-inner">
      <span className="mb-2">Map</span>
      Map View coming soon...
    </div>
  );


interface ListingCardProps {
  listing: Listing;
  onLike: () => void;
  onPass: () => void;
  onViewDetails: (listing: Listing) => void;
  isAnimating: boolean;
  direction: 'left' | 'right' | null;
  viewMode?: 'card' | 'grid' | 'mini';
}

interface DetailsModalProps {
  listing: Listing | null;
  onClose: () => void;
  onLike: () => void;
  onBooking?: (listing: Listing) => void;
}

interface FilterChip {
  id: string;
  label: string;
  icon: ReactNode;
}

// Real boarding room images
const roomImages: string[] = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598928506911-5c200b0e2f4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
];

// Enhanced mock data with real boarding info
const listings: Listing[] = [
  {
    id: 1,
    title: 'Modern Boarding House near SLIIT',
    images: [roomImages[0], roomImages[1], roomImages[2]],
    price: 18000,
    location: 'Malabe',
    distance: 0.8,
    distanceUnit: 'km',
    travelTime: '5 min walk',
    roomType: 'Single Room',
    genderPreference: 'Any',
    availableFrom: '2024-02-01',
    billsIncluded: true,
    verified: true,
    badges: ['Verified', 'New'],
    description: 'Spacious, fully furnished room with attached bathroom. Walking distance to SLIIT campus. Includes WiFi, AC, and study table.',
    features: ['AC', 'WiFi', 'Attached Bathroom', 'Study Table', 'Furnished'],
    deposit: 36000,
    roommateCount: 0
  },
  {
    id: 2,
    title: 'Cozy Room with Balcony',
    images: [roomImages[1], roomImages[2], roomImages[3]],
    price: 15000,
    location: 'Kaduwela',
    distance: 2.5,
    distanceUnit: 'km',
    travelTime: '10 min bus',
    roomType: 'Shared Room (2 persons)',
    genderPreference: 'Male',
    availableFrom: '2024-01-15',
    billsIncluded: true,
    verified: false,
    badges: ['Popular'],
    description: 'Private room with balcony, shared kitchen and living area. All bills included. Friendly housemates.',
    features: ['Balcony', 'Kitchen Access', 'WiFi', 'Common Area'],
    deposit: 30000,
    roommateCount: 2
  },
  {
    id: 3,
    title: 'Luxury Studio Apartment',
    images: [roomImages[2], roomImages[3], roomImages[4]],
    price: 25000,
    location: 'Battaramulla',
    distance: 3.2,
    distanceUnit: 'km',
    travelTime: '15 min bus',
    roomType: 'Studio',
    genderPreference: 'Female',
    availableFrom: '2024-02-10',
    billsIncluded: false,
    verified: true,
    badges: ['Verified', 'Premium'],
    description: 'Modern studio apartment with AC, attached bathroom, and kitchenette. Secure building with elevator.',
    features: ['AC', 'Kitchenette', 'Attached Bathroom', 'Security', 'Elevator'],
    deposit: 50000,
    roommateCount: 0
  },
  {
    id: 4,
    title: 'Budget Student Dormitory',
    images: [roomImages[3], roomImages[4], roomImages[5]],
    price: 8500,
    location: 'Malabe',
    distance: 1.2,
    distanceUnit: 'km',
    travelTime: '10 min walk',
    roomType: 'Shared Dorm (4 persons)',
    genderPreference: 'Any',
    availableFrom: '2024-01-20',
    billsIncluded: true,
    verified: false,
    badges: ['Budget'],
    description: 'Affordable dormitory for students. Common kitchen, study area, and laundry facilities.',
    features: ['Common Kitchen', 'Study Area', 'Lockers', 'Laundry'],
    deposit: 17000,
    roommateCount: 3
  },
  {
    id: 5,
    title: 'Modern Apartment with Gym',
    images: [roomImages[4], roomImages[5], roomImages[0]],
    price: 32000,
    location: 'Battaramulla',
    distance: 2.8,
    distanceUnit: 'km',
    travelTime: '12 min bus',
    roomType: '1 Bedroom',
    genderPreference: 'Any',
    availableFrom: '2024-02-15',
    billsIncluded: false,
    verified: true,
    badges: ['Verified', 'Premium'],
    description: 'Modern apartment with gym access, fully furnished, near major bus routes.',
    features: ['Gym', 'Furnished', 'Security', 'Parking'],
    deposit: 64000,
    roommateCount: 0
  },
  {
    id: 6,
    title: 'Student Shared House',
    images: [roomImages[5], roomImages[0], roomImages[1]],
    price: 12000,
    location: 'Kaduwela',
    distance: 3.5,
    distanceUnit: 'km',
    travelTime: '15 min bus',
    roomType: 'Shared Room',
    genderPreference: 'Female',
    availableFrom: '2024-01-25',
    billsIncluded: true,
    verified: false,
    badges: ['Budget'],
    description: 'Friendly shared house with 3 other students. Common areas, kitchen, garden.',
    features: ['Garden', 'Kitchen', 'Common Area', 'WiFi'],
    deposit: 24000,
    roommateCount: 3
  }
];

// Filter chips data
const filterChips: FilterChip[] = [
  { id: 'budget', label: 'Budget < 20k', icon: React.createElement(FaMoneyBillWave) },
  { id: 'near', label: 'Near Campus', icon: React.createElement(FaWalking) },
  { id: 'verified', label: 'Verified', icon: React.createElement(MdOutlineVerified) },
  { id: 'single', label: 'Single Room', icon: React.createElement(FaBed) },
  { id: 'shared', label: 'Shared Room', icon: React.createElement(FaUserFriends) },
  { id: 'bills', label: 'Bills Included', icon: React.createElement(FaBolt) },
];

// Travel time icons based on distance
const getTravelIcon = (distance: number): ReactNode => {
  if (distance <= 1) return React.createElement(FaWalking, { className: "text-green-400" });
  if (distance <= 2) return React.createElement(FaBicycle, { className: "text-blue-400" });
  if (distance <= 3) return React.createElement(FaBus, { className: "text-yellow-400" });
  return React.createElement(FaCar, { className: "text-red-400" });
};

// Travel time text based on distance
const getTravelTime = (distance: number): string => {
  if (distance <= 1) return `${Math.round(distance * 12)} min walk`;
  if (distance <= 2) return `${Math.round(distance * 8)} min bike`;
  if (distance <= 3) return `${Math.round(distance * 5)} min bus`;
  return `${Math.round(distance * 3)} min drive`;
};

// Get vacancy badge info based on vacancy status
const getVacancyInfo = (vacancy: string, totalRooms: number, occupiedRooms: number): { label: string; color: string; bgColor: string; icon: string } => {
  switch (vacancy) {
    case 'low':
      return {
        label: 'Low Vacancy',
        color: 'text-yellow-300',
        bgColor: 'bg-yellow-500/20 border-yellow-500/30',
        icon: '!' // Replace with icon component if needed
      };
    case 'full':
      return {
        label: 'Full',
        color: 'text-red-300',
        bgColor: 'bg-red-500/20 border-red-500/30',
        icon: 'X' // Replace with icon component if needed
      };
    case 'coming':
      return {
        label: 'Coming Soon',
        color: 'text-blue-300',
        bgColor: 'bg-blue-500/20 border-blue-500/30',
        icon: '...' // Replace with icon component if needed
      };
    default: // 'available'
      return {
        label: `${totalRooms - occupiedRooms} Available`,
        color: 'text-green-300',
        bgColor: 'bg-green-500/20 border-green-500/30',
        icon: 'OK' // Replace with icon component if needed
      };
  }
  // Fallback return to satisfy TypeScript
  return {
    label: 'Unknown',
    color: 'text-gray-300',
    bgColor: 'bg-gray-500/20 border-gray-500/30',
    icon: '?'
  };
};

// Booking Form Component
const BookingForm: React.FC<{
  listing: Listing | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  currentUserName?: string;
  currentUserEmail?: string;
  currentUserImage?: string;
}> = ({
  listing,
  onClose,
  onSubmit,
  currentUserName = '',
  currentUserEmail = '',
  currentUserImage = '',
}) => {
  const [bookingType, setBookingType] = useState<'individual' | 'group'>('individual');
  const [fullName, setFullName] = useState(currentUserName);
  const [groupName, setGroupName] = useState('');
  const [contact, setContact] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (bookingType === 'individual' && !fullName && currentUserName) {
      setFullName(currentUserName);
    }
  }, [bookingType, currentUserName, fullName]);

  const handleSubmit = () => {
    if (!contact || !moveInDate || !duration) {
      alert('Please fill all required fields');
      return;
    }

    const data = {
      roomId: listing?.id,
      bookingType,
      name: bookingType === 'individual' ? fullName : groupName,
      userEmail: currentUserEmail,
      userName: currentUserName || fullName,
      userImage: currentUserImage,
      contact,
      moveInDate,
      duration,
      notes
    };

    onSubmit(data);
    onClose();
  };

  if (!listing) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#181f36] to-[#0f172a] p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">Booking Form</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          {/* Subtitle */}
          <p className="text-xs text-gray-400 mb-4">Submit your room booking request</p>

          {/* Selected Room Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <FaBed className="text-cyan-400" />
              <div>
                <p className="text-gray-300 text-xs">Selected Boarding Room ID: L001</p>
              </div>
            </div>
          </div>

          {/* Booking Type Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setBookingType('individual')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                bookingType === 'individual'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Individual Booking
            </button>
            <button
              onClick={() => setBookingType('group')}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                bookingType === 'group'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Group Booking
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 mb-4">
            {/* Name Field */}
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                {bookingType === 'individual' ? 'Full Name' : 'Group Name'} *
              </label>
              <input
                type="text"
                value={bookingType === 'individual' ? fullName : groupName}
                onChange={(e) => bookingType === 'individual' ? setFullName(e.target.value) : setGroupName(e.target.value)}
                placeholder={bookingType === 'individual' ? 'Enter full name' : 'e.g. SLIIT Friends'}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all text-sm"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                Contact Number *
              </label>
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. 0771234567"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all text-sm"
              />
            </div>

            {/* Move-in Date and Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                  Move-in Date *
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                  Duration (months) *
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 6"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1.5 block">
                Special Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional requests"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FaCheckCircle />
            Submit Booking Request
          </button>
        </div>
      </div>
    </div>
  );
};

// Mini Card for side panels
const MiniListingCard: React.FC<{ listing: Listing; type: 'passed' | 'liked' }> = ({ listing, type }) => {
  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-lg overflow-hidden border border-white/10 hover:shadow-cyan-500/10 transition-all mb-2">
      <div className="flex items-center gap-2 p-2">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${type === 'passed' ? 'bg-red-500/20' : 'bg-green-500/20'} flex items-center justify-center`}>
            {type === 'passed' ? (
              <FaRegTimesCircle className="text-red-400 text-xs" />
            ) : (
              <FaHeart className="text-green-400 text-xs" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white truncate">{listing.title}</h4>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <FaMapMarkerAlt className="text-purple-400" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-bold">
            {formatPrice(listing.price)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Ranked Result Card Component - for list view display
const RankedResultCard: React.FC<{ room: any; onOpen: (id: number) => void }> = ({ room, onOpen }) => {
  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString()}/mo`;
  };

  const stars = '★'.repeat(Math.floor(room.rating)) + (room.rating % 1 >= 0.5 ? '☆' : '');

  return (
    <div
      onClick={() => onOpen(room.id)}
      className="bg-gradient-to-br from-[#181f36]/80 to-[#232b47]/80 backdrop-blur-sm rounded-xl p-4 mb-3 border border-white/10 hover:border-cyan-400/50 hover:bg-gradient-to-br hover:from-[#181f36] hover:to-[#232b47] transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20"
    >
      {/* Top Row: Name + Price */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-bold text-white mb-1">{room.name}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            {formatPrice(room.price)}
          </div>
        </div>
      </div>

      {/* Second Row: Location + Distance + Rating */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-gray-300">
          <FaMapMarkerAlt className="text-pink-400 flex-shrink-0" />
          <span>{room.location}, {room.campus}</span>
        </div>
      </div>

      {/* Distance and Rating Row */}
      <div className="flex items-center gap-4 mb-3 flex-wrap text-xs md:text-sm">
        <div className="flex items-center gap-1 text-gray-400">
          <FaWalking className="text-cyan-400" />
          <span className="font-semibold">{room.distKm < 1 ? `${Math.round(room.distKm * 1000)}m` : `${room.distKm}km`} away</span>
        </div>
        <div className="flex items-center gap-1">
          {stars && (
            <>
              <span className="text-yellow-400">{stars}</span>
              <span className="text-gray-400">{room.rating.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>

      {/* Availability Badge + Facilities */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 border ${
            room.available
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}
        >
          {room.available ? 'Available' : 'Occupied'}
        </span>

        {/* Vacancy Badge */}
        {room.vacancy && (() => {
          const vacancyInfo = getVacancyInfo(room.vacancy, room.totalRooms || 1, room.occupiedRooms || 0);
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 border ${vacancyInfo.bgColor}`}>
              {vacancyInfo.label}
            </span>
          );
        })()}

        {/* Facilities Tags */}
        {room.facilities.slice(0, 3).map((fac: string, idx: number) => (
          <span
            key={idx}
            className="px-2 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 flex-shrink-0"
          >
            {fac}
          </span>
        ))}
        {room.facilities.length > 3 && (
          <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-gray-400 border border-white/10">
            +{room.facilities.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
};

// Card View Component (for mobile and desktop card mode)
const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  onLike, 
  onPass, 
  onViewDetails, 
  isAnimating, 
  direction,
  viewMode = 'card'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);

  // Handle mouse drag for desktop swipe
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Handle touch events for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode !== 'card') return;
    startX.current = e.touches[0].clientX;
  };

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
    
    if (diff > 100) {
      onLike();
    } else if (diff < -100) {
      onPass();
    }
  };

  // Handle mouse drag for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'card' || isAnimating) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cardRef.current || isAnimating || viewMode !== 'card') return;
    
    const diff = e.clientX - dragStartX;
    setDragOffset(diff);
    
    if (Math.abs(diff) > 20) {
      cardRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.02}deg)`;
      cardRef.current.style.opacity = `${1 - Math.abs(diff) / 500}`;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !cardRef.current || isAnimating || viewMode !== 'card') {
      setIsDragging(false);
      return;
    }
    
    const diff = e.clientX - dragStartX;
    cardRef.current.style.transition = '';
    cardRef.current.style.transform = '';
    cardRef.current.style.opacity = '';
    
    if (diff > 100) {
      onLike();
    } else if (diff < -100) {
      onPass();
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging && cardRef.current) {
      cardRef.current.style.transition = '';
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '';
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString()}`;
  };

  // Card mode (original Tinder-like view)
  if (viewMode === 'card') {
    return (
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`
          relative bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl shadow-2xl overflow-hidden
          border border-white/10 cursor-grab active:cursor-grabbing
          transition-all duration-300 hover:shadow-cyan-500/10
          ${direction === 'left' ? 'animate-swipe-left' : ''}
          ${direction === 'right' ? 'animate-swipe-right' : ''}
          ${isDragging ? 'shadow-2xl scale-[1.02]' : ''}
        `}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Image Gallery with Overlay */}
        <div className="relative h-56 overflow-hidden">
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            draggable="false"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {listing.badges.map((badge: string) => (
              <span 
                key={badge} 
                className={`
                  px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm
                  ${badge === 'Verified' ? 'bg-green-500/90 text-white' : 
                    badge === 'New' ? 'bg-purple-500/90 text-white' : 
                    badge === 'Premium' ? 'bg-amber-500/90 text-white' :
                    badge === 'Popular' ? 'bg-pink-500/90 text-white' :
                    'bg-cyan-500/90 text-white'}
                `}
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-white font-bold">{formatPrice(listing.price)}</span>
            <span className="text-gray-300 text-xs ml-1">/month</span>
          </div>

          {/* Room Type Badge */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
            <FaBed className="text-cyan-400 text-xs" />
            <span className="text-white text-xs">{listing.roomType}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-white">{listing.title}</h2>
            <div className="flex items-center gap-1 text-xs bg-cyan-500/20 px-2 py-1 rounded-full">
              {getTravelIcon(listing.distance)}
              <span className="text-cyan-300">{listing.travelTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <FaMapMarkerAlt className="text-purple-400" />
            <span>{listing.location} | {listing.distance}km from SLIIT</span>
          </div>

          {/* Metadata Chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
              <BiCurrentLocation className="text-cyan-400" />
              <span>{listing.travelTime}</span>
            </div>
            
            <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
              <RiUserSharedLine className="text-purple-400" />
              <span>{listing.genderPreference}</span>
            </div>
            
            {listing.billsIncluded && (
              <div className="bg-green-500/20 px-2 py-1 rounded-full text-xs text-green-400 flex items-center gap-1">
                <FaBolt />
                <span>Bills Included</span>
              </div>
            )}

            {/* Vacancy Status Badge */}
            {listing.vacancy && (() => {
              const vacancyInfo = getVacancyInfo(listing.vacancy, listing.totalRooms || 1, listing.occupiedRooms || 0);
              return (
                <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${vacancyInfo.bgColor}`}>
                  <span>{vacancyInfo.icon}</span>
                  <span>{vacancyInfo.label}</span>
                </div>
              );
            })()}
            
            <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
              <FaCalendarAlt className="text-orange-400" />
              <span>Available: {new Date(listing.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {listing.description}
          </p>

          {/* View Details Link */}
          <button
            onClick={() => onViewDetails(listing)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <FaInfoCircle />
            <span>View details</span>
          </button>
        </div>

        {/* Swipe Hint */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full md:hidden">
          Drag or tap buttons
        </div>
      </div>
    );
  }

  // Grid mode (for desktop)
  return (
    <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl overflow-hidden border border-white/10 hover:shadow-cyan-500/10 transition-all hover:scale-[1.02]">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={listing.images[0]} 
          alt={listing.title}
          className="w-full h-full object-cover"
          draggable="false"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {listing.badges.slice(0, 2).map((badge: string) => (
            <span key={badge} className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/90 text-white">
              {badge}
            </span>
          ))}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white font-bold">
          {formatPrice(listing.price)}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{listing.title}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <FaMapMarkerAlt className="text-purple-400 text-[10px]" />
          <span>{listing.location}</span>
          <span className="mx-1">|</span>
          <span>{listing.distance}km</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[10px] text-gray-300">
            {listing.roomType}
          </span>
          {listing.billsIncluded && (
            <span className="bg-green-500/20 px-1.5 py-0.5 rounded-full text-[10px] text-green-400">
              Bills
            </span>
          )}
        </div>
        <button
          onClick={() => onViewDetails(listing)}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
        >
          <FaInfoCircle /> Details
        </button>
      </div>
    </div>
  );
};

const DetailsModal: React.FC<DetailsModalProps> = ({ listing, onClose, onLike, onBooking }) => {
  if (!listing) return null;

  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#181f36] to-[#0f172a] p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Room Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Image Gallery */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {listing.images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`Room ${idx + 1}`}
                className="w-full h-20 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
              />
            ))}
          </div>
          
          <h4 className="text-xl font-bold text-white mb-2">{listing.title}</h4>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <FaMoneyBillWave className="text-green-400" />
              <span className="text-gray-300">Price:</span>
              <span className="text-white font-bold">{formatPrice(listing.price)}/month</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <FaMapMarkerAlt className="text-purple-400" />
              <span className="text-gray-300">Location:</span>
              <span className="text-white">{listing.location} ({listing.distance}km from SLIIT)</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <FaBed className="text-cyan-400" />
              <span className="text-gray-300">Room Type:</span>
              <span className="text-white">{listing.roomType}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <RiUserSharedLine className="text-pink-400" />
              <span className="text-gray-300">Gender Preference:</span>
              <span className="text-white">{listing.genderPreference}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <FaCalendarAlt className="text-orange-400" />
              <span className="text-gray-300">Available From:</span>
              <span className="text-white">{new Date(listing.availableFrom).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <FaMoneyBillWave className="text-yellow-400" />
              <span className="text-gray-300">Deposit:</span>
              <span className="text-white">{formatPrice(listing.deposit)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <FaUserFriends className="text-blue-400" />
              <span className="text-gray-300">Roommates:</span>
              <span className="text-white">{listing.roommateCount === 0 ? 'None (Private)' : `${listing.roommateCount} others`}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <h5 className="text-sm font-medium text-cyan-300 mb-2">Description</h5>
            <p className="text-sm text-gray-400">{listing.description}</p>
          </div>
          
          <div className="mb-4">
            <h5 className="text-sm font-medium text-cyan-300 mb-2">Features</h5>
            <div className="flex flex-wrap gap-2">
              {listing.features.map((feature: string, idx: number) => (
                <span key={idx} className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300">
                  {feature}
                </span>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onBooking?.(listing);
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <FaCheckCircle />
              Book Now
            </button>
            <button
              onClick={() => {
                onLike();
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <FaHeart />
              Like This Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced FiltersPanel Component matching the image
const FiltersPanel: React.FC<{
  filters: any;
  setters: any;
  onReset: () => void;
}> = ({ filters, setters, onReset }) => {
  const { priceMax, dist, room, avail, facs, rating } = filters;
  const { setPriceMax, setDist, setRoom, setAvail, setFacs, setRating } = setters;

  const facilityOptions = [
    { name: 'WiFi', icon: 'WiFi' },
    { name: 'Air-Cond', icon: 'AC' },
    { name: 'Meals', icon: 'Meals' },
    { name: 'Private Bath', icon: 'Bath' },
    { name: 'Parking', icon: 'Parking' },
    { name: 'Laundry', icon: 'Laundry' },
    { name: 'Security', icon: 'Security' },
    { name: 'Gym', icon: 'Gym' }
  ];

  const distanceOptions = [
    { label: '500m', value: '500m' },
    { label: '1km', value: 'walking' },
    { label: '2km', value: 'cycling' },
    { label: '5km', value: 'bus' },
    { label: 'Any', value: 'any' }
  ];

  const roomTypeOptions = ['All', 'Single', 'Master', 'Sharing', 'Annex'];

  const availabilityOptions = ['All', 'Available', 'Occupied'];

  return (
    <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <FaFilter className="text-cyan-400 text-lg sm:text-xl flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold text-white">Real-Time Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
        >
          <FaTimes className="text-xs sm:text-sm" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Filters Row 1: Price, Distance, Room Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Price Range */}
        <div className="lg:col-span-1 md:col-span-2">
          <label className="text-xs sm:text-sm text-cyan-300 mb-2 sm:mb-3 block font-semibold">Price Range (Rs./Month)</label>
          <div className="space-y-2">
            <input
              type="range"
              min="3000"
              max="50000"
              step="500"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span className="hidden sm:inline">Rs. 3,000</span>
              <span className="sm:hidden text-[10px]">3k</span>
              <span className="text-cyan-400 font-bold text-center text-xs sm:text-sm">Rs. {priceMax.toLocaleString()}</span>
              <span className="hidden sm:inline">Rs. 50,000</span>
              <span className="sm:hidden text-[10px]">50k</span>
            </div>
          </div>
        </div>

        {/* Max Distance from Campus */}
        <div className="md:col-span-2 lg:col-span-2">
          <label className="text-xs sm:text-sm text-cyan-300 mb-2 sm:mb-3 block font-semibold">Max Distance from Campus</label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {distanceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDist(option.value)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  dist === option.value
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Room Type */}
        <div className="md:col-span-2 lg:col-span-2">
          <label className="text-xs sm:text-sm text-cyan-300 mb-2 sm:mb-3 block font-semibold">Room Type</label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {roomTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => setRoom(type.toLowerCase())}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  (type === 'All' && room === 'any') || room === type.toLowerCase()
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Row 2: Availability & Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Availability */}
        <div className="md:col-span-1 lg:col-span-1">
          <label className="text-xs sm:text-sm text-cyan-300 mb-2 sm:mb-3 block font-semibold">Availability</label>
          <div className="flex gap-1.5 sm:gap-2">
            {availabilityOptions.map((status) => (
              <button
                key={status}
                onClick={() => setAvail(status === 'All' ? 'all' : status.toLowerCase())}
                className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  (status === 'All' && avail === 'all') || avail === status.toLowerCase()
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="text-xs sm:text-sm text-cyan-300 mb-2 sm:mb-3 block font-semibold">Minimum Rating</label>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-xl sm:text-2xl transition-all ${
                    rating >= star ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-300 ml-auto sm:ml-0 pr-0 sm:pr-4">
              {rating > 0 ? `${rating} stars and above` : 'Any'}
            </span>
          </div>
        </div>
      </div>

      {/* Facilities with Icon + Toggle */}
      <div>
        <label className="text-xs sm:text-sm text-cyan-300 mb-3 sm:mb-4 block font-semibold">Facilities</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2 sm:gap-3">
          {facilityOptions.map((facility) => (
            <button
              key={facility.name}
              onClick={() => {
                if (facs.includes(facility.name)) {
                  setFacs(facs.filter((f: string) => f !== facility.name));
                } else {
                  setFacs([...facs, facility.name]);
                }
              }}
              className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl transition-all border-2 ${
                facs.includes(facility.name)
                  ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/30'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-lg sm:text-2xl">{facility.icon}</span>
              <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${
                facs.includes(facility.name) ? 'text-cyan-300' : 'text-gray-400'
              }`}>
                {facility.name}
              </span>
              {/* Toggle indicator */}
              <div className={`w-5 sm:w-6 h-2.5 sm:h-3 rounded-full transition-all mt-0.5 sm:mt-1 ${
                facs.includes(facility.name)
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  : 'bg-gray-600'
              }`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Notification Interface
interface Notification {
  id: string;
  type:
    | 'owner_approval'
    | 'payment_pending'
    | 'payment_verified'
    | 'receipt_generated'
    | 'booking_confirmed'
    | 'checkin_reminder'
    | 'roommate_request_received'
    | 'roommate_request_accepted'
    | 'roommate_request_rejected'
    | 'group_invitation'
    | 'group_status_ready'
    | 'group_status_booked';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  bookingId?: string;
  roomTitle?: string;
}

const READ_NOTIFICATIONS_STORAGE_KEY = 'bb_read_notification_ids';

const extractResponseArray = (payload: any): any[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const getStoredReadNotificationIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

const saveReadNotificationIds = (notifications: Notification[]) => {
  if (typeof window === 'undefined') return;
  const ids = notifications.filter((n) => n.read).map((n) => n.id);
  window.localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(ids));
};

// Student Payment Portal Content Component
function StudentPaymentPortalContent({ bookingId }: { bookingId: string | null }) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'not_uploaded' | 'uploaded' | 'verified' | 'rejected'>('not_uploaded');
  const [isSplitPayment, setIsSplitPayment] = useState<boolean>(false);

  const handleUploadSlip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      alert('Please select a payment slip to upload');
      return;
    }
    setPaymentStatus('uploaded');
    setUploadedFile(null);
  };

  const mockBookingDetails = {
    bookingId: bookingId || 'BK002',
    roomTitle: 'Modern Boarding House near SLIIT',
    roomImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    roomPrice: 18000,
    location: 'Malabe, Colombo',
    moveInDate: '2026-04-01',
    duration: 6,
    totalAmount: 108000,
    ownerName: 'Mr. Perera',
    approvedDate: '2026-03-04'
  };

  const generateAndDownloadReceipt = () => {
    const receiptContent = generateReceiptHTML(mockBookingDetails);

    // Create blob and download
    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${mockBookingDetails.bookingId}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Also open in new window for immediate viewing/printing
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(receiptContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Status */}
      <div className="bg-gradient-to-br from-cyan-900/40 via-purple-900/30 to-indigo-900/40 rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              <FaCheckCircle className="text-emerald-400" size={28} />
              Approved Booking Payment
            </h2>
            <p className="text-sm text-gray-300 mt-1">Booking ID: {mockBookingDetails.bookingId}</p>
            <p className="text-xs text-gray-400 mt-0.5">Approved on: {new Date(mockBookingDetails.approvedDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-lg ${
              paymentStatus === 'not_uploaded' ? 'bg-amber-900/40 text-amber-300 border border-amber-500/30' :
              paymentStatus === 'uploaded' ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' :
              paymentStatus === 'verified' ? 'bg-green-900/40 text-green-300 border border-green-500/30' :
              'bg-red-900/40 text-red-300 border border-red-500/30'
            }`}>
              {paymentStatus === 'not_uploaded' && 'Payment Pending'}
              {paymentStatus === 'uploaded' && 'Under Review'}
              {paymentStatus === 'verified' && 'Payment Verified'}
              {paymentStatus === 'rejected' && 'Payment Rejected'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Room Details Card */}
          <div className="md:col-span-2 bg-white/5 rounded-lg p-5 backdrop-blur-sm">
            <div className="flex gap-4">
              <img
                src={mockBookingDetails.roomImage}
                alt={mockBookingDetails.roomTitle}
                className="w-32 h-32 object-cover rounded-lg shadow-md"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{mockBookingDetails.roomTitle}</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-cyan-400" size={16} />
                    <span>{mockBookingDetails.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-400" size={16} />
                    <span>{mockBookingDetails.moveInDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-400" size={16} />
                    <span>{mockBookingDetails.roomPrice.toLocaleString()}/month +{mockBookingDetails.duration} months</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUserFriends className="text-amber-400" size={16} />
                    <span>{mockBookingDetails.ownerName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Action Card */}
          <div className="bg-white/5 rounded-lg p-5 backdrop-blur-sm">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-400 mb-1">{isSplitPayment ? 'Payment Per Installment' : 'Total Amount'}</div>
              <div className="text-3xl font-bold text-emerald-400">
                LKR {isSplitPayment 
                  ? (mockBookingDetails.totalAmount / 2).toLocaleString() 
                  : mockBookingDetails.totalAmount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isSplitPayment 
                  ? '(2 installments of 3 months each)' 
                  : `(${mockBookingDetails.duration} months booking)`}
              </div>
            </div>

            {/* Split Payment Toggle */}
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <FaMoneyBillWave className="text-purple-400" size={16} />
                    Split Payment Option
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {isSplitPayment ? 'Pay in 2 installments' : 'Pay full amount upfront'}
                  </div>
                </div>
                <button
                  onClick={() => setIsSplitPayment(!isSplitPayment)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    isSplitPayment ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isSplitPayment ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Installment Details */}
              {isSplitPayment && (
                <div className="mt-3 pt-3 border-t border-purple-500/20 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">1st Installment (Now):</span>
                    <span className="text-emerald-400 font-semibold">LKR {(mockBookingDetails.totalAmount / 2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">2nd Installment (Month 3):</span>
                    <span className="text-purple-400 font-semibold">LKR {(mockBookingDetails.totalAmount / 2).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-amber-300 bg-amber-900/20 p-2 rounded border border-amber-500/20 mt-2 flex items-start gap-1">
                    <span>!</span>
                    <span>Upload slip for 1st installment now. 2nd installment due in 3 months.</span>
                  </div>
                </div>
              )}
            </div>

            {paymentStatus === 'not_uploaded' && (
              <div className="space-y-3">
                <div className="text-sm text-amber-300 bg-amber-900/20 p-3 rounded-lg border border-amber-500/20 flex items-start gap-2">
                  <span className="text-lg">!</span>
                  <span>Please upload your payment slip to proceed</span>
                </div>
                <label className="block">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-cyan-400/50 hover:bg-white/5 transition-all">
                    <FaMoneyBillWave className="text-3xl mx-auto mb-2 text-cyan-400" />
                    <div className="text-sm text-gray-300">
                      {uploadedFile ? (
                        <span className="text-emerald-400 font-medium">{uploadedFile.name}</span>
                      ) : (
                        'Click to upload slip'
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</div>
                  </div>
                  <input
                    type="file"
                    onChange={handleUploadSlip}
                    accept="image/*,.pdf"
                    className="sr-only"
                  />
                </label>
                <button
                  onClick={handleSubmit}
                  disabled={!uploadedFile}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  Submit Payment Slip
                </button>
              </div>
            )}

            {paymentStatus === 'uploaded' && (
              <div className="space-y-3">
                <div className="text-sm text-blue-300 bg-blue-900/20 p-3 rounded-lg border border-blue-500/20 text-center">
                  Your payment is being verified by the owner
                </div>
                <div className="text-xs text-gray-400 text-center">
                  This usually takes 1-2 business days
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Verification in progress...</span>
                </div>
              </div>
            )}

            {paymentStatus === 'verified' && (
              <div className="space-y-3">
                <div className="text-sm text-green-300 bg-green-900/20 p-4 rounded-lg border border-green-500/20 text-center flex items-center justify-center gap-2">
                  <FaCheckCircle className="text-green-400" size={18} />
                  <span className="font-semibold">Payment Verified</span>
                </div>
                <button
                  onClick={generateAndDownloadReceipt}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FaMoneyBillWave size={18} />
                  Download Receipt
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Receipt will open in a new window and download automatically
                </p>
              </div>
            )}

            {paymentStatus === 'rejected' && (
              <div className="space-y-3">
                <div className="text-sm text-red-300 bg-red-900/20 p-3 rounded-lg border border-red-500/20 flex items-start gap-2">
                  <span className="text-lg">X</span>
                  <span>Payment rejected. Please upload a clear payment slip.</span>
                </div>
                <label className="block">
                  <div className="border-2 border-dashed border-red-400/30 rounded-lg p-4 text-center cursor-pointer hover:border-red-400/50 hover:bg-white/5 transition-all">
                    <FaMoneyBillWave className="text-3xl mx-auto mb-2 text-red-400" />
                    <div className="text-sm text-gray-300">
                      {uploadedFile ? (
                        <span className="text-emerald-400 font-medium">{uploadedFile.name}</span>
                      ) : (
                        'Re-upload payment slip'
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</div>
                  </div>
                  <input
                    type="file"
                    onChange={handleUploadSlip}
                    accept="image/*,.pdf"
                    className="sr-only"
                  />
                </label>
                <button
                  onClick={handleSubmit}
                  disabled={!uploadedFile}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  Re-submit Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Instructions Card */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex gap-3">
          <FaInfoCircle className="text-cyan-400 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-white mb-2 text-base">Payment Instructions:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-400">
              <li>Upload a clear photo or PDF of your bank transfer receipt</li>
              <li>Ensure all transaction details (date, amount, reference) are visible</li>
              <li>Owner will verify your payment within 1-2 business days</li>
              <li>You'll receive a notification once payment is verified</li>
              <li>After verification, you can download your official booking receipt</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {paymentStatus === 'verified' && (
          <button
            onClick={() => {
              // View receipt in new window without downloading
              const receiptContent = generateReceiptHTML(mockBookingDetails);
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.write(receiptContent);
                newWindow.document.close();
              }
            }}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaEye className="text-emerald-400" size={20} />
              </div>
              <div>
                <div className="text-white font-medium text-sm">View Receipt</div>
                <div className="text-gray-400 text-xs">Preview in browser</div>
              </div>
            </div>
          </button>
        )}
        
        <button
          onClick={() => setPaymentStatus('verified')}
          className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaCheckCircle className="text-blue-400" size={20} />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Test Verification</div>
              <div className="text-gray-400 text-xs">Simulate owner review</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setPaymentStatus('not_uploaded')}
          className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaUndo className="text-purple-400" size={20} />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Reset Status</div>
              <div className="text-gray-400 text-xs">Start upload again</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  // Helper function to generate receipt HTML (separated for reuse)
  function generateReceiptHTML(bookingDetails: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt - ${bookingDetails.bookingId}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .receipt-container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #667eea;
      margin: 0;
      font-size: 32px;
    }
    .header p {
      color: #64748b;
      margin: 5px 0;
    }
    .verified-badge {
      display: inline-block;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      margin-top: 10px;
    }
    .info-section {
      margin: 30px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-label {
      color: #64748b;
      font-weight: 500;
    }
    .info-value {
      color: #1e293b;
      font-weight: 600;
    }
    .total-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
    }
    .total-section h2 {
      margin: 0;
      font-size: 24px;
    }
    .total-amount {
      font-size: 42px;
      font-weight: bold;
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
    }
    .print-button {
      display: block;
      width: 200px;
      margin: 20px auto;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }
    @media print {
      body {
        background: white;
        margin: 0;
        padding: 0;
      }
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <h1>BOARDING PAYMENT RECEIPT</h1>
      <p>Official Payment Confirmation</p>
      <div class="verified-badge">PAYMENT VERIFIED</div>
    </div>

    <div class="info-section">
      <div class="info-row">
        <span class="info-label">Receipt Number:</span>
        <span class="info-value">RCP-${bookingDetails.bookingId}-${Date.now()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Booking ID:</span>
        <span class="info-value">${bookingDetails.bookingId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Issue Date:</span>
        <span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Verified On:</span>
        <span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>

    <div class="info-section">
      <h3 style="color: #667eea; margin-bottom: 15px;">Booking Details</h3>
      <div class="info-row">
        <span class="info-label">Property:</span>
        <span class="info-value">${bookingDetails.roomTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Location:</span>
        <span class="info-value">${bookingDetails.location}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Owner:</span>
        <span class="info-value">${bookingDetails.ownerName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Move-in Date:</span>
        <span class="info-value">${new Date(bookingDetails.moveInDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Rental Duration:</span>
        <span class="info-value">${bookingDetails.duration} months</span>
      </div>
      <div class="info-row">
        <span class="info-label">Monthly Rent:</span>
        <span class="info-value">LKR ${bookingDetails.roomPrice.toLocaleString()}</span>
      </div>
    </div>

    <div class="total-section">
      <h2>Total Amount Paid</h2>
      <div class="total-amount">LKR ${bookingDetails.totalAmount.toLocaleString()}</div>
      <p style="margin: 0; opacity: 0.9;">Payment received in full</p>
    </div>

    <div class="footer">
      <p><strong>Thank you for your payment!</strong></p>
      <p>This is an official receipt for your booking payment.</p>
      <p>For any queries, please contact the property owner: ${bookingDetails.ownerName}</p>
      <p style="margin-top: 20px; font-size: 12px;">
        Generated on ${new Date().toLocaleString()}<br>
        Smart Boarding Management System
      </p>
    </div>

    <button class="print-button" onclick="window.print()">Print Receipt</button>
  </div>
</body>
</html>
    `;
  }
}

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
  
  // Notification states
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
  
  // Advanced filter states matching the image
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

  const dismissPopupNotification = React.useCallback(() => {
    setPopupNotification(null);
    if (popupHideTimerRef.current) {
      window.clearTimeout(popupHideTimerRef.current);
      popupHideTimerRef.current = null;
    }
  }, []);

  const openNotification = React.useCallback((notif: Notification) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
      saveReadNotificationIds(updated);
      return updated;
    });

    if (notif.type === 'owner_approval' || notif.type === 'payment_pending') {
      setSelectedNotificationBooking(notif.bookingId || null);
      setShowPaymentPortal(true);
      setShowNotifications(false);
    } else if (notif.type === 'checkin_reminder') {
      setSelectedNotificationBooking(notif.bookingId || null);
      setShowCheckinForm(true);
      setShowNotifications(false);
    } else if (notif.type === 'receipt_generated' || notif.type === 'payment_verified') {
      setSelectedNotificationBooking(notif.bookingId || null);
      setShowPaymentPortal(true);
      setShowNotifications(false);
    } else if (
      notif.type === 'roommate_request_received' ||
      notif.type === 'roommate_request_accepted' ||
      notif.type === 'roommate_request_rejected' ||
      notif.type === 'group_invitation' ||
      notif.type === 'group_status_ready' ||
      notif.type === 'group_status_booked'
    ) {
      setActiveTab('roommate');
      setShowNotifications(false);
    }
  }, []);

  const fetchLatestNotifications = React.useCallback(
    async (token: string, userId: string, options?: { withLoader?: boolean; suppressPopup?: boolean }) => {
      const withLoader = options?.withLoader ?? false;
      const suppressPopup = options?.suppressPopup ?? false;

      if (!token || !userId) return;

      if (withLoader) {
        setIsNotificationsLoading(true);
      }

      try {
        const [inboxResponse, sentResponse, groupsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/roommates/request/inbox`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/roommates/request/sent`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/roommates/groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [inboxJson, sentJson, groupsJson] = await Promise.all([
          inboxResponse.json(),
          sentResponse.json(),
          groupsResponse.json(),
        ]);

        const inboxItems = inboxResponse.ok ? extractResponseArray(inboxJson) : [];
        const sentItems = sentResponse.ok ? extractResponseArray(sentJson) : [];
        const groupItems = groupsResponse.ok ? extractResponseArray(groupsJson) : [];

        const inboxNotifications: Notification[] = inboxItems.map((req: any) => {
          const senderName = req?.senderId?.fullName || req?.senderId?.email || 'A student';
          const baseTitle = req?.status === 'accepted'
            ? 'Roommate Request Accepted'
            : req?.status === 'rejected'
            ? 'Roommate Request Rejected'
            : 'New Roommate Request';

          const type: Notification['type'] = req?.status === 'accepted'
            ? 'roommate_request_accepted'
            : req?.status === 'rejected'
            ? 'roommate_request_rejected'
            : 'roommate_request_received';

          return {
            id: `request-inbox-${req?._id || Math.random().toString(36).slice(2)}`,
            type,
            title: baseTitle,
            message: req?.status === 'pending'
              ? `${senderName} sent you a roommate request${req?.message ? `: "${req.message}"` : '.'}`
              : `${senderName} request status is now ${req?.status || 'updated'}.`,
            timestamp: req?.respondedAt || req?.createdAt || new Date().toISOString(),
            read: false,
            actionRequired: req?.status === 'pending',
          };
        });

        const sentNotifications: Notification[] = sentItems
          .filter((req: any) => req?.status === 'accepted' || req?.status === 'rejected')
          .map((req: any) => {
            const recipientName = req?.recipientId?.fullName || req?.recipientId?.email || 'the recipient';
            const accepted = req?.status === 'accepted';
            return {
              id: `request-sent-${req?._id || Math.random().toString(36).slice(2)}-${req?.status || 'pending'}`,
              type: accepted ? 'roommate_request_accepted' : 'roommate_request_rejected',
              title: accepted ? 'Request Accepted' : 'Request Rejected',
              message: `${recipientName} has ${accepted ? 'accepted' : 'rejected'} your roommate request.`,
              timestamp: req?.respondedAt || req?.createdAt || new Date().toISOString(),
              read: false,
              actionRequired: false,
            };
          });

        const groupNotifications: Notification[] = groupItems.flatMap((group: any) => {
          const members = Array.isArray(group?.members) ? group.members : [];
          const invitation = members.find((member: any) => {
            const memberId = String(member?.userId?._id || member?.userId || '');
            return memberId === userId && member?.status === 'pending';
          });

          const mapped: Notification[] = [];

          if (invitation) {
            mapped.push({
              id: `group-invite-${group?._id || Math.random().toString(36).slice(2)}`,
              type: 'group_invitation',
              title: 'Group Invitation',
              message: `You were invited to join the group "${group?.name || 'Booking Group'}".`,
              timestamp: group?.updatedAt || group?.createdAt || new Date().toISOString(),
              read: false,
              actionRequired: true,
            });
          }

          if (group?.status === 'ready') {
            mapped.push({
              id: `group-ready-${group?._id || Math.random().toString(36).slice(2)}`,
              type: 'group_status_ready',
              title: 'Group Is Ready',
              message: `Your group "${group?.name || 'Booking Group'}" is now ready for booking.`,
              timestamp: group?.updatedAt || group?.createdAt || new Date().toISOString(),
              read: false,
              actionRequired: true,
            });
          }

          if (group?.status === 'booked') {
            mapped.push({
              id: `group-booked-${group?._id || Math.random().toString(36).slice(2)}`,
              type: 'group_status_booked',
              title: 'Booking Confirmed',
              message: `Booking has been confirmed for group "${group?.name || 'Booking Group'}".`,
              timestamp: group?.updatedAt || group?.createdAt || new Date().toISOString(),
              read: false,
              actionRequired: false,
            });
          }

          return mapped;
        });

        const allNotifications = [...inboxNotifications, ...sentNotifications, ...groupNotifications].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const readIds = getStoredReadNotificationIds();
        const hydrated = allNotifications.map((notification) => ({
          ...notification,
          read: readIds.has(notification.id),
        }));

        if (!suppressPopup && seenNotificationIdsRef.current.size > 0) {
          const incoming = hydrated.find((notification) => !seenNotificationIdsRef.current.has(notification.id));
          if (incoming) {
            setPopupNotification(incoming);
            if (popupHideTimerRef.current) {
              window.clearTimeout(popupHideTimerRef.current);
            }
            popupHideTimerRef.current = window.setTimeout(() => {
              setPopupNotification(null);
              popupHideTimerRef.current = null;
            }, 6000);
          }
        }

        seenNotificationIdsRef.current = new Set(hydrated.map((n) => n.id));
        setNotifications(hydrated);
      } catch {
        setNotifications([]);
      } finally {
        if (withLoader) {
          setIsNotificationsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!currentUserId) return;

    const token = localStorage.getItem('bb_access_token') || '';
    if (!token) return;

    const intervalId = window.setInterval(() => {
      void fetchLatestNotifications(token, currentUserId, { withLoader: false, suppressPopup: false });
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentUserId, fetchLatestNotifications]);

  useEffect(() => {
    return () => {
      if (popupHideTimerRef.current) {
        window.clearTimeout(popupHideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    if (!showNotifications) return;

    const updatePanelPosition = () => {
      const trigger = notificationButtonRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const panelWidth = Math.min(window.innerWidth * 0.94, 416);
      const minLeft = 12;
      const maxLeft = Math.max(minLeft, window.innerWidth - panelWidth - 12);
      const alignedLeft = rect.right - panelWidth;
      const left = Math.min(maxLeft, Math.max(minLeft, alignedLeft));
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

    const normalizeInterestToken = (value: string) => value.trim().toLowerCase();

    const loadSearchData = async () => {
      try {
        const token = localStorage.getItem('bb_access_token') || '';

        const roomsResponse = await fetch(`${API_BASE_URL}/api/roommates/rooms`);
        const housesResponse = await fetch(`${API_BASE_URL}/api/owner/public/houses`);
        const [roomsJson, housesJson] = await Promise.all([roomsResponse.json(), housesResponse.json()]);

        if (!isCancelled) {
          const roomsData = Array.isArray(roomsJson?.data)
            ? roomsJson.data
            : (Array.isArray(roomsJson?.rooms) ? roomsJson.rooms : (Array.isArray(roomsJson) ? roomsJson : []));

          const housesData = Array.isArray(housesJson?.data)
            ? housesJson.data
            : (Array.isArray(housesJson?.houses) ? housesJson.houses : (Array.isArray(housesJson) ? housesJson : []));

          const mappedRooms: Listing[] = roomsResponse.ok && roomsData.length > 0
            ? roomsData.map((roomItem: any, index: number) => ({
                id: index + 1,
                title: roomItem.name || 'Room Listing',
                images: Array.isArray(roomItem.images) && roomItem.images.length > 0 ? roomItem.images : [roomImages[index % roomImages.length]],
                price: Number(roomItem.price) || 0,
                location: roomItem.location || 'Unknown',
                distance: 1,
                distanceUnit: 'km',
                travelTime: 'Near campus',
                roomType: roomItem.roomType || 'Single Room',
                genderPreference: roomItem.genderPreference || 'Any',
                availableFrom: roomItem.availableFrom || '',
                billsIncluded: Array.isArray(roomItem.facilities) ? roomItem.facilities.includes('Meals') : false,
                verified: true,
                badges: [roomItem.occupancy < roomItem.totalSpots ? 'Available' : 'Occupied'],
                description: roomItem.description || '',
                features: Array.isArray(roomItem.facilities) ? roomItem.facilities : [],
                deposit: Number(roomItem.deposit) || Number(roomItem.price || 0) * 2,
                roommateCount: Number(roomItem.occupancy) || 0,
              }))
            : [];

          const mappedHouses: Listing[] = housesResponse.ok && housesData.length > 0
            ? housesData.map((house: any, index: number) => ({
                id: 100000 + index,
                title: house.name || 'Boarding House',
                images: Array.isArray(house.images) && house.images.length > 0
                  ? house.images
                  : (house.image ? [house.image] : [roomImages[index % roomImages.length]]),
                price: Number(house.monthlyPrice) || 0,
                location: house.address || 'Unknown',
                distance: 1.2,
                distanceUnit: 'km',
                travelTime: 'Near city',
                roomType: house.roomType || 'Single Room',
                genderPreference: house.genderPreference || 'any',
                availableFrom: house.availableFrom || '',
                billsIncluded: false,
                verified: true,
                badges: [house.status === 'active' ? 'Available' : 'Occupied'],
                description: house.description || '',
                features: Array.isArray(house.features) ? house.features : [],
                deposit: Number(house.deposit) || Number(house.monthlyPrice || 0) * 2,
                roommateCount: Number(house.occupiedRooms) || 0,
              }))
            : [];

          setDbListings([...mappedRooms, ...mappedHouses]);
        }

        if (!token) return;

        const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meJson = await meResponse.json();
        const currentUser = meJson?.data || null;
        const currentInterests: string[] = Array.isArray(currentUser?.lifestylePrefs)
          ? currentUser.lifestylePrefs.map((i: string) => normalizeInterestToken(i))
          : [];

        if (!isCancelled && currentUser?.email) {
          setCurrentUserId(String(currentUser._id || currentUser.id || ''));
          setCurrentUserEmail(currentUser.email);
          setCurrentUserName(currentUser.fullName || '');
          if (currentUser.profilePicture) {
            setCurrentUserImage(currentUser.profilePicture);
          }
        }
        const resolvedUserId = String(currentUser?._id || currentUser?.id || '');
        if (!isCancelled) {
          await fetchLatestNotifications(token, resolvedUserId, { withLoader: true, suppressPopup: true });
        }

        const roommateResponse = await fetch(`${API_BASE_URL}/api/roommates/browse`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const roommateJson = await roommateResponse.json();

        if (!isCancelled && roommateResponse.ok) {
          const roommateData = Array.isArray(roommateJson?.data)
            ? roommateJson.data
            : (Array.isArray(roommateJson?.profiles) ? roommateJson.profiles : (Array.isArray(roommateJson) ? roommateJson : []));

          const mappedRoommates: Roommate[] = roommateData.map((profile: any, index: number) => {
            const profileInterests: string[] = [
              ...(Array.isArray(profile.tags) ? profile.tags : []),
              ...(typeof profile.preferences === 'string' ? profile.preferences.split(',') : []),
            ]
              .map((v: string) => normalizeInterestToken(v))
              .filter(Boolean);

            const mutualCount = profileInterests.filter((interest) => currentInterests.includes(interest)).length;

            return {
              id: normalizeIdValue(profile._id || profile.id) || `profile-${index}`,
              userId: normalizeIdValue(profile.userId || profile._id || profile.id),
              name: profile.name || 'Student',
              email: profile.email || '',
              age: deriveProfileAge(profile),
              gender: profile.gender || 'Any',
              university: profile.boardingHouse || profile.academicYear || 'SLIIT',
              bio: profile.description || '',
              image: profile.image || '',
              interests: profileInterests,
              mutualCount,
            };
          });

          setDbRoommates(mappedRoommates);
        }
      } catch {
        setDbListings([]);
      } finally {
        if (!isCancelled) {
          setIsListingsLoading(false);
        }
      }
    };

    loadSearchData();
    return () => {
      isCancelled = true;
    };
  }, []);

  const effectiveListings = dbListings;
  const effectiveRoommates = dbRoommates;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean);

  // Filter listings based on search and advanced filters
  const filteredListings: Listing[] = effectiveListings.filter(listing => {
    // Search filter
    if (searchTerm && !listing.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !listing.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Chip filters (kept for backward compatibility)
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

  const rankedListings: Listing[] = [...filteredListings].sort((a, b) => {
    if (sortMode === 'price-low') return a.price - b.price;
    if (sortMode === 'price-high') return b.price - a.price;
    if (sortMode === 'distance') return a.distance - b.distance;
    return listingScore(b) - listingScore(a);
  });

  const roomDataset: any[] = dbListings.map((listing, index) => ({
    id: listing.id || index + 1,
    name: listing.title,
    location: listing.location,
    campus: listing.location,
    price: listing.price,
    distKm: Number(listing.distance) || 1,
    roomType: listing.roomType,
    available: !String(listing.badges || []).toLowerCase().includes('occupied'),
    facilities: Array.isArray(listing.features) ? listing.features : [],
    rating: listing.rating || 4.0,
    reviews: 10,
    desc: listing.description || '',
    vacancy: 'available',
    totalRooms: 1,
    occupiedRooms: 0,
  }));

  // Filter room data based on advanced filters
  const getFilteredRooms = () => {
    return roomDataset.filter((r: any) => {
      // Search term
      if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !r.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !r.campus.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Price
      if (r.price > priceMax) return false;
      
      // Distance
      if (dist !== 'any' && r.distKm > (distMap as any)[dist]) return false;
      
      // Room type
      if (room !== 'any' && r.roomType.toLowerCase() !== room.toLowerCase()) return false;
      
      // Availability
      if (avail === 'available' && !r.available) return false;
      if (avail === 'occupied' && r.available) return false;
      
      // Facilities
      if (facs.length > 0 && !facs.every(f => r.facilities.map((fac: string) => fac.toLowerCase()).includes(f.toLowerCase()))) {
        return false;
      }
      
      return true;
    });
  };
  
  const filteredRooms = getFilteredRooms();
  
  const roomScore = (roomItem: any): number => {
    let score = 0;

    if (!normalizedSearch) {
      score += roomItem.available ? 25 : 0;
      score += roomItem.rating * 8;
      score += Math.max(0, 12 - roomItem.distKm * 2.2);
      score += Math.max(0, 8 - roomItem.price / 6000);
      return score;
    }

    const haystack = `${roomItem.name} ${roomItem.location} ${roomItem.campus} ${roomItem.roomType} ${roomItem.desc} ${roomItem.facilities.join(' ')}`.toLowerCase();
    if (roomItem.name.toLowerCase().includes(normalizedSearch)) score += 42;
    if (roomItem.location.toLowerCase().includes(normalizedSearch)) score += 24;
    if (roomItem.campus.toLowerCase().includes(normalizedSearch)) score += 20;

    for (const token of searchTokens) {
      if (roomItem.name.toLowerCase().includes(token)) score += 14;
      if (roomItem.location.toLowerCase().includes(token)) score += 10;
      if (roomItem.campus.toLowerCase().includes(token)) score += 10;
      if (roomItem.roomType.toLowerCase().includes(token)) score += 8;
      if (haystack.includes(token)) score += 4;
    }

    score += roomItem.available ? 12 : 0;
    score += roomItem.rating * 5;
    score += Math.min(12, roomItem.reviews / 3);
    score += Math.max(0, 10 - roomItem.distKm * 2);
    return score;
  };

  const rankedRooms = [...filteredRooms].sort((a, b) => {
    if (sortMode === 'price-low') return a.price - b.price;
    if (sortMode === 'price-high') return b.price - a.price;
    if (sortMode === 'distance') return a.distKm - b.distKm;
    return roomScore(b) - roomScore(a);
  });

  const currentListing: Listing | undefined = rankedListings[currentIndex];

  const handleLike = (): void => {
    if (!currentListing || isAnimating) return;
    
    setIsAnimating(true);
    setDirection('right');
    
    setTimeout(() => {
      setLikedListings([...likedListings, currentListing]);
      setToastMessage('Added to favorites!');
      setShowToast(true);
      
      setTimeout(() => {
        if (currentIndex < rankedListings.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(rankedListings.length);
        }
        setDirection(null);
        setIsAnimating(false);
        
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      }, 300);
    }, 150);
  };

  const handlePass = (): void => {
    if (!currentListing || isAnimating) return;
    
    setIsAnimating(true);
    setDirection('left');
    
    setTimeout(() => {
      setPassedListings([...passedListings, currentListing]);
      setToastMessage(`Not interested`);
      setShowToast(true);
      
      setTimeout(() => {
        if (currentIndex < rankedListings.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(rankedListings.length);
        }
        setDirection(null);
        setIsAnimating(false);
        
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      }, 300);
    }, 150);
  };

  const handleUndo = (): void => {
    if (currentIndex > 0) {
      // Remove the last action
      const lastPassed = passedListings[passedListings.length - 1];
      const lastLiked = likedListings[likedListings.length - 1];
      
      if (lastPassed && lastPassed.id === rankedListings[currentIndex - 1]?.id) {
        setPassedListings(passedListings.slice(0, -1));
      } else if (lastLiked && lastLiked.id === rankedListings[currentIndex - 1]?.id) {
        setLikedListings(likedListings.slice(0, -1));
      }
      
      setCurrentIndex(currentIndex - 1);
      setToastMessage('Action undone');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const toggleFilter = (filterId: string): void => {
    if (selectedFilters.includes(filterId)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filterId));
    } else {
      setSelectedFilters([...selectedFilters, filterId]);
    }
    setCurrentIndex(0); // Reset to first listing
  };

  const handleViewDetails = (listing: Listing): void => {
    setSelectedListing(listing);
    setShowDetails(true);
  };

  const clearFilters = (): void => {
    setSelectedFilters([]);
    setSearchTerm('');
    setCurrentIndex(0);
  };

  const handleLogout = (): void => {
    localStorage.removeItem('bb_access_token');
    localStorage.removeItem('bb_current_user');
    navigate('/signin');
  };

  if (isListingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-300 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-200 text-sm">Loading rooms and boarding data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col items-center w-full mb-6">
          <div className="w-full mb-4 md:max-w-5xl md:mx-auto rounded-2xl border border-white/10 bg-[#0f172a]/70 backdrop-blur-xl shadow-2xl px-3 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { window.location.href = '/'; }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Go to home"
              >
                <FaArrowLeft className="text-white text-sm" />
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="text-left"
              >
                <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent leading-tight">
                  BoardingBook
                </h1>
                <p className="text-[10px] md:text-xs text-cyan-100/70">Find & Search</p>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
              <button
                onClick={() => navigate('/')}
                className={`px-4 py-2 text-sm rounded-xl border transition ${location.pathname === '/' ? 'bg-cyan-500/25 border-cyan-300/50 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                Home
              </button>
              <button
                onClick={() => navigate('/chatbot')}
                className={`px-4 py-2 text-sm rounded-xl border transition ${location.pathname === '/chatbot' ? 'bg-cyan-500/25 border-cyan-300/50 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                AI Chatbot
              </button>
              <button
                onClick={() => navigate('/owner-dashboard')}
                className={`px-4 py-2 text-sm rounded-xl border transition ${location.pathname === '/owner-dashboard' ? 'bg-cyan-500/25 border-cyan-300/50 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                List Your Property
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative z-[130]">
                <button
                  ref={notificationButtonRef}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors relative"
                >
                  <FaBell className="text-white text-lg" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {showNotifications && typeof document !== 'undefined' && (createPortal(
                  <div
                    ref={notificationPanelRef}
                    className="fixed w-[min(94vw,26rem)] max-h-[72vh] overflow-hidden bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl shadow-2xl border border-white/10 z-[9999]"
                    style={{ top: notificationPanelPos.top, left: notificationPanelPos.left }}
                  >
                    <div className="sticky top-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-lg">Notifications</h3>
                        <button
                          onClick={() => {
                            setNotifications((prev) => {
                              const updated = prev.map((n) => ({ ...n, read: true }));
                              saveReadNotificationIds(updated);
                              return updated;
                            });
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          Mark all read
                        </button>
                      </div>
                    </div>

                    <div className="p-2 overflow-y-auto max-h-[calc(72vh-4.5rem)] scrollbar-thin">
                      {isNotificationsLoading ? (
                        <div className="text-center py-10 text-gray-400">
                          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-300 rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-sm">Loading notifications...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <FaBell className="text-4xl mx-auto mb-2 opacity-50" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 mb-2 rounded-lg cursor-pointer transition-all ${
                              notif.read
                                ? 'bg-white/5 hover:bg-white/10'
                                : 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 hover:border-cyan-500/40'
                            }`}
                            onClick={() => {
                              dismissPopupNotification();
                              openNotification(notif);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                notif.type === 'owner_approval' ? 'bg-green-500/20' :
                                notif.type === 'payment_verified' ? 'bg-emerald-500/20' :
                                notif.type === 'receipt_generated' ? 'bg-blue-500/20' :
                                notif.type === 'booking_confirmed' ? 'bg-purple-500/20' :
                                notif.type === 'checkin_reminder' ? 'bg-amber-500/20' :
                                notif.type === 'roommate_request_received' ? 'bg-cyan-500/20' :
                                notif.type === 'roommate_request_accepted' ? 'bg-green-500/20' :
                                notif.type === 'roommate_request_rejected' ? 'bg-red-500/20' :
                                notif.type === 'group_invitation' ? 'bg-indigo-500/20' :
                                notif.type === 'group_status_ready' ? 'bg-amber-500/20' :
                                notif.type === 'group_status_booked' ? 'bg-violet-500/20' :
                                'bg-amber-500/20'
                              }`}>
                                {notif.type === 'owner_approval' && <FaCheckCircle className="text-green-400" />}
                                {notif.type === 'payment_verified' && <FaCheckCircle className="text-emerald-400" />}
                                {notif.type === 'receipt_generated' && <FaMoneyBillWave className="text-blue-400" />}
                                {notif.type === 'booking_confirmed' && <FaCheckCircle className="text-purple-400" />}
                                {notif.type === 'checkin_reminder' && <FaCalendarAlt className="text-amber-400" />}
                                {notif.type === 'roommate_request_received' && <FaUserFriends className="text-cyan-400" />}
                                {notif.type === 'roommate_request_accepted' && <FaCheckCircle className="text-green-400" />}
                                {notif.type === 'roommate_request_rejected' && <FaRegTimesCircle className="text-red-400" />}
                                {notif.type === 'group_invitation' && <RiUserSharedLine className="text-indigo-300" />}
                                {notif.type === 'group_status_ready' && <FaCalendarAlt className="text-amber-400" />}
                                {notif.type === 'group_status_booked' && <FaCheckCircle className="text-violet-300" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-semibold text-sm">{notif.title}</h4>
                                  {!notif.read && <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>}
                                </div>
                                <p className="text-gray-300 text-xs mb-2">{notif.message}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500 text-xs">
                                    {new Date(notif.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {notif.actionRequired && (
                                    <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                                      Action Required
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>,
                  document.body
                ) as any)}
                </div>

                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  title="Open profile settings"
                >
                  <img src={currentUserImage} alt="User" className="w-7 h-7 rounded-full object-cover border border-cyan-400/40" />
                  <span className="hidden md:inline text-xs text-cyan-100 max-w-[180px] truncate">{currentUserName || currentUserEmail}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 transition text-red-200"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-xs" />
                  <span className="hidden md:inline text-xs">Logout</span>
                </button>
              </div>
            </div>
          </div>
          {/* Segmented Tab Switcher */}
          <div className="flex flex-col items-center w-full">
            <div className="flex rounded-full bg-gradient-to-r from-[#181f36] to-[#0f172a] p-1 shadow-inner w-full max-w-md mb-2 border border-cyan-500/20 md:max-w-2xl">
              <button
                className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${activeTab === 'rooms' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg scale-105' : 'text-cyan-200 hover:bg-white/10'}`}
                onClick={() => setActiveTab('rooms')}
              >
                Rooms
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${activeTab === 'map' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg scale-105' : 'text-cyan-200 hover:bg-white/10'}`}
                onClick={() => setActiveTab('map')}
              >
                Map View
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${activeTab === 'roommate' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg scale-105' : 'text-cyan-200 hover:bg-white/10'}`}
                onClick={() => setActiveTab('roommate')}
              >
                Matches
              </button>
            </div>
            {/* View Toggle for Rooms tab only */}
            {activeTab === 'rooms' && (
              <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  title="Swipe view"
                >
                  <FaThLarge />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  title="Grid view"
                >
                  <FaList />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <FaInfoCircle className="text-cyan-400" />
          <span className="text-xs text-cyan-200 bg-cyan-900/60 px-3 py-1.5 rounded-full">
            {activeTab === 'rooms'
              ? (viewMode === 'card' 
                  ? 'Drag cards left/right to pass or like. Click buttons to act.' 
                  : 'Browse all listings in grid view')
              : activeTab === 'map'
                ? 'View all rooms on a map (coming soon)'
                : 'Find your ideal roommate!'}
          </span>
        </div>

        {/* Search and Filters Section (only for Rooms tab) */}
        {activeTab === 'rooms' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location or keyword..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentIndex(0);
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 mt-4 mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <FaFilter />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {filterChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => toggleFilter(chip.id)}
                  className={`
                    flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${selectedFilters.includes(chip.id)
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }
                  `}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400">Sort results</span>
              <select
                value={sortMode}
                onChange={(e) => {
                  setSortMode(e.target.value as 'discovery' | 'relevance' | 'price-low' | 'price-high' | 'distance');
                  setCurrentIndex(0);
                }}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="discovery" className="bg-[#131d3a]">Discovery Picks</option>
                <option value="relevance" className="bg-[#131d3a]">Best Match</option>
                <option value="distance" className="bg-[#131d3a]">Nearest First</option>
                <option value="price-low" className="bg-[#131d3a]">Lowest Price</option>
                <option value="price-high" className="bg-[#131d3a]">Highest Price</option>
              </select>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-4">
                <FiltersPanel
                  filters={{
                    priceMax,
                    dist,
                    room,
                    avail,
                    facs
                  }}
                  setters={{
                    setPriceMax,
                    setDist,
                    setRoom,
                    setAvail,
                    setFacs
                  }}
                  onReset={() => {
                    setPriceMax(50000);
                    setDist('any');
                    setRoom('any');
                    setAvail('all');
                    setFacs([]);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        {activeTab === 'rooms' ? (
          <>
            {/* Desktop Views */}
            <div className="hidden md:block">
              {viewMode === 'card' ? (
                <div className="grid grid-cols-3 gap-6">
                  {/* Left Column - Passed Listings */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <FaHistory className="text-red-400" />
                      <h3 className="text-sm font-bold text-white">Passed</h3>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-auto">{passedListings.length}</span>
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {passedListings.length > 0 ? (
                        passedListings.map((listing) => (
                          <MiniListingCard key={listing.id} listing={listing} type="passed" />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-xs text-gray-500">No passed listings yet</p>
                          <p className="text-[10px] text-gray-600 mt-1">Swipe left to pass</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Column - Main Swipe Card */}
                  <div>
                    <div className="relative h-[500px] mb-4 perspective-1000">
                      {/* Stack effect - next card behind */}
                      {currentIndex < rankedListings.length - 1 && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl border border-white/10 shadow-xl transform translate-y-2 translate-x-1 scale-[0.98] opacity-30" />
                      )}
                      
                      {/* Current Card */}
                      {currentListing && (
                        <ListingCard
                          listing={currentListing}
                          onLike={handleLike}
                          onPass={handlePass}
                          onViewDetails={handleViewDetails}
                          isAnimating={isAnimating}
                          direction={direction}
                          viewMode="card"
                        />
                      )}
                    </div>

                    {/* Action Buttons - Desktop */}
                    <div className="flex justify-center gap-4 mt-3">
                      <button
                        onClick={handlePass}
                        disabled={isAnimating}
                        className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                        title="Not interested (swipe left)"
                      >
                        <FaRegTimesCircle />
                      </button>

                      <button
                        onClick={handleLike}
                        disabled={isAnimating}
                        className="w-14 h-14 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                        title="Save this listing (swipe right)"
                      >
                        <FaHeart />
                      </button>
                    </div>

                    <div className="flex justify-between px-8 mt-2 text-xs text-gray-500">
                      <span>Pass | Swipe Left</span>
                      <span>Like | Swipe Right</span>
                    </div>
                  </div>

                  {/* Right Column - Liked Listings */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <FaBookmark className="text-green-400" />
                      <h3 className="text-sm font-bold text-white">Favorites</h3>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-auto">{likedListings.length}</span>
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {likedListings.length > 0 ? (
                        likedListings.map((listing) => (
                          <MiniListingCard key={listing.id} listing={listing} type="liked" />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-xs text-gray-500">No favorites yet</p>
                          <p className="text-[10px] text-gray-600 mt-1">Swipe right to save</p>
                        </div>
                      )}
                    </div>
                    
                    {/* View All Button */}
                    {likedListings.length > 0 && (
                      <button className="w-full mt-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
                        View All Favorites
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Grid View (Desktop) */
                <>
                  {/* Original Listings Grid */}
                  {rankedListings.length > 0 && (
                    <>
                      <h2 className="text-xl font-bold text-white mb-4">Your Saved Searches</h2>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {rankedListings.map((listing) => (
                          <ListingCard
                            key={listing.id}
                            listing={listing}
                            onLike={() => {
                              setLikedListings([...likedListings, listing]);
                              setToastMessage('Added to favorites!');
                              setShowToast(true);
                              setTimeout(() => setShowToast(false), 2000);
                            }}
                            onPass={() => {}}
                            onViewDetails={handleViewDetails}
                            isAnimating={false}
                            direction={null}
                            viewMode="grid"
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Advanced Filtered Rooms Grid */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">
                        All Available Rooms {rankedRooms.length > 0 && `(${rankedRooms.length})`}
                      </h2>
                      {(priceMax < 50000 || dist !== 'any' || room !== 'any' || avail !== 'all' || facs.length > 0) && (
                        <button
                          onClick={() => {
                            setPriceMax(50000);
                            setDist('any');
                            setRoom('any');
                            setAvail('all');
                            setFacs([]);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                        >
                          <FaTimes />
                          Clear Filters
                        </button>
                      )}
                    </div>
                    
                    {rankedRooms.length > 0 ? (
                      <div className="space-y-2 max-h-screen overflow-y-auto pr-2 custom-scrollbar">
                        {rankedRooms.map((room) => (
                          <RankedResultCard
                            key={room.id}
                            room={room}
                            onOpen={(id: number) => {
                              const r = roomDataset.find((rm: any) => rm.id === id);
                              if (!r) return;
                              const listing: Listing = {
                                id: r.id,
                                title: r.name,
                                images: [r.img],
                                price: r.price,
                                location: r.location,
                                distance: r.distKm,
                                distanceUnit: 'km',
                                travelTime: r.distKm < 1 ? `${Math.round(r.distKm * 1000)}m walk` : `${r.distKm}km from ${r.campus}`,
                                roomType: r.roomType,
                                genderPreference: 'Any',
                                availableFrom: new Date().toISOString(),
                                billsIncluded: r.facilities.includes('Meals'),
                                verified: true,
                                badges: r.available ? ['Available'] : ['Occupied'],
                                description: r.desc,
                                features: r.facilities,
                                deposit: r.price * 2,
                                roommateCount: r.roomType.toLowerCase().includes('sharing') ? 2 : 0,
                                vacancy: r.vacancy,
                                totalRooms: r.totalRooms,
                                occupiedRooms: r.occupiedRooms
                              };
                              handleViewDetails(listing);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                        <FaSearch className="text-4xl text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 text-sm mb-1">No rooms match your filters</p>
                        <p className="text-sm text-gray-500">Try adjusting your criteria</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile View - Grid by default, can switch to card */}
            <div className="md:hidden">
              {viewMode === 'card' ? (
                <>
                  {/* Card View (Swipe) */}
                  <div className="relative h-[500px] mb-4 perspective-1000 max-w-md mx-auto">
                    {/* Stack effect - next card behind */}
                    {currentIndex < rankedListings.length - 1 && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl border border-white/10 shadow-xl transform translate-y-2 translate-x-1 scale-[0.98] opacity-30" />
                    )}
                    
                    {/* Current Card */}
                    {currentListing && (
                      <ListingCard
                        listing={currentListing}
                        onLike={handleLike}
                        onPass={handlePass}
                        onViewDetails={handleViewDetails}
                        isAnimating={isAnimating}
                        direction={direction}
                        viewMode="card"
                      />
                    )}
                  </div>

                  {/* Results Count & Undo - Mobile */}
                  <div className="flex justify-between items-center mb-4 max-w-md mx-auto">
                    <span className="text-sm text-gray-400">
                      {rankedListings.length - currentIndex} rooms remaining
                    </span>
                    <button
                      onClick={handleUndo}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <FaUndo /> Undo
                    </button>
                  </div>

                  {/* Action Buttons - Mobile */}
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={handlePass}
                      disabled={isAnimating}
                      className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      title="Not interested (swipe left)"
                    >
                      <FaRegTimesCircle />
                    </button>
                    
                    <button
                      onClick={handleLike}
                      disabled={isAnimating}
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      title="Save this listing (swipe right)"
                    >
                      <FaHeart />
                    </button>
                  </div>

                  {/* Action Labels - Mobile */}
                  <div className="flex justify-between px-8 mt-2 text-xs text-gray-500 max-w-md mx-auto">
                    <span>Pass | Swipe Left</span>
                    <span>Like | Swipe Right</span>
                  </div>
                </>
              ) : (
                /* Grid View (Mobile) - DEFAULT */
                <>
                  {/* Original Listings Grid */}
                  {rankedListings.length > 0 && (
                    <>
                      <h2 className="text-lg font-bold text-white mb-3 px-2">Your Saved Searches</h2>
                      <div className="grid grid-cols-1 gap-3 mb-6">
                        {rankedListings.map((listing) => (
                          <ListingCard
                            key={listing.id}
                            listing={listing}
                            onLike={() => {
                              setLikedListings([...likedListings, listing]);
                              setToastMessage('Added to favorites!');
                              setShowToast(true);
                              setTimeout(() => setShowToast(false), 2000);
                            }}
                            onPass={() => {}}
                            onViewDetails={handleViewDetails}
                            isAnimating={false}
                            direction={null}
                            viewMode="grid"
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Advanced Filtered Rooms Grid */}
                  <div className="px-2">
                    <h2 className="text-lg font-bold text-white mb-3">
                      All Rooms {rankedRooms.length > 0 && `(${rankedRooms.length})`}
                    </h2>
                    
                    {rankedRooms.length > 0 ? (
                      <div className="space-y-2 max-h-screen overflow-y-auto pr-2 custom-scrollbar">
                        {rankedRooms.map((room) => (
                          <RankedResultCard
                            key={room.id}
                            room={room}
                            onOpen={(id: number) => {
                              const r = roomDataset.find((rm: any) => rm.id === id);
                              if (!r) return;
                              const listing: Listing = {
                                id: r.id,
                                title: r.name,
                                images: [r.img],
                                price: r.price,
                                location: r.location,
                                distance: r.distKm,
                                distanceUnit: 'km',
                                travelTime: r.distKm < 1 ? `${Math.round(r.distKm * 1000)}m walk` : `${r.distKm}km from ${r.campus}`,
                                roomType: r.roomType,
                                genderPreference: 'Any',
                                availableFrom: new Date().toISOString(),
                                billsIncluded: r.facilities.includes('Meals'),
                                verified: true,
                                badges: r.available ? ['Available'] : ['Occupied'],
                                description: r.desc,
                                features: r.facilities,
                                deposit: r.price * 2,
                                roommateCount: r.roomType.toLowerCase().includes('sharing') ? 2 : 0,
                                vacancy: r.vacancy,
                                totalRooms: r.totalRooms,
                                occupiedRooms: r.occupiedRooms
                              };
                              handleViewDetails(listing);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                        <FaSearch className="text-3xl text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm mb-1">No rooms match your filters</p>
                        <p className="text-xs text-gray-500">Try adjusting your criteria</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        ) : activeTab === 'map' ? (
          <MapViewPlaceholder />
        ) : (
          <RoommateFinderPlaceholder roommateData={effectiveRoommates} />
        )}

        {popupNotification && (
          <div className="fixed bottom-24 right-4 w-[min(92vw,22rem)] z-50 animate-fade-in-up">
            <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-[#101a36] to-[#0b132b] shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="flex items-start gap-3 p-4">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
                  <FaBell className="text-cyan-300 text-sm" />
                </div>
                <button
                  onClick={() => {
                    openNotification(popupNotification);
                    dismissPopupNotification();
                  }}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-xs text-cyan-200/80 mb-1">New notification</p>
                  <p className="text-sm font-semibold text-white truncate">{popupNotification.title}</p>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">{popupNotification.message}</p>
                </button>
                <button
                  onClick={dismissPopupNotification}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  aria-label="Dismiss notification"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in-up z-50">
            <FaCheckCircle className="text-green-400" />
            <span className="text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && (
          <DetailsModal
            listing={selectedListing}
            onClose={() => setShowDetails(false)}
            onLike={handleLike}
            onBooking={(listing) => {
              setSelectedRoomForBooking(listing);
              setShowBooking(true);
            }}
          />
        )}

        {/* Booking Form Modal */}
        {showBooking && (
          <BookingForm
            listing={selectedRoomForBooking}
            onClose={() => setShowBooking(false)}
            currentUserName={currentUserName}
            currentUserEmail={currentUserEmail}
            currentUserImage={currentUserImage}
            onSubmit={(data) => {
              setToastMessage(`Booking request submitted for ${selectedRoomForBooking?.title}!`);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }}
          />
        )}

        {/* Payment Portal Modal - Shows StudentPayment.tsx content */}
        {showPaymentPortal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm p-4 border-b border-white/10 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-white">Payment Portal</h2>
                  <p className="text-sm text-gray-400">
                    {selectedNotificationBooking && `Booking ID: ${selectedNotificationBooking}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentPortal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaTimes className="text-white" />
                </button>
              </div>
              <div className="p-6">
                <StudentPaymentPortalContent bookingId={selectedNotificationBooking} />
              </div>
            </div>
          </div>
        )}

        {/* Check-in Date Submission Modal */}
        {showCheckinForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Submit Check-in Date</h2>
                  <button
                    onClick={() => setShowCheckinForm(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-white" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <FaCalendarAlt className="text-amber-400 text-2xl" />
                    <div>
                      <h3 className="text-white font-semibold">Booking Confirmed!</h3>
                      <p className="text-sm text-gray-400">
                        {selectedNotificationBooking && `Booking ID: ${selectedNotificationBooking}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    Your payment has been verified and your booking is confirmed. Please select your expected check-in date to complete the process.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Check-in Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={checkinDate}
                    onChange={(e) => setCheckinDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Select a date from today onwards
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCheckinForm(false)}
                    className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!checkinDate) {
                        alert('Please select a check-in date');
                        return;
                      }
                      // Simulate submission
                      setToastMessage(`Check-in date submitted: ${new Date(checkinDate).toLocaleDateString()}`);
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                      setShowCheckinForm(false);
                      setCheckinDate('');
                      
                      // Remove the check-in reminder notification
                      setNotifications((prev) => {
                        const updated = prev.filter((n) => n.type !== 'checkin_reminder' || n.bookingId !== selectedNotificationBooking);
                        saveReadNotificationIds(updated);
                        return updated;
                      });
                    }}
                    disabled={!checkinDate}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      {/* Global Animations */}
      <style>{`
        @keyframes swipe-left {
          0% { transform: translateX(0) rotate(0); opacity: 1; }
          100% { transform: translateX(-300px) rotate(-15deg); opacity: 0; }
        }
        @keyframes swipe-right {
          0% { transform: translateX(0) rotate(0); opacity: 1; }
          100% { transform: translateX(300px) rotate(15deg); opacity: 0; }
        }
        .animate-swipe-left {
          animation: swipe-left 0.3s ease-out forwards;
        }
        .animate-swipe-right {
          animation: swipe-right 0.3s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.5);
        }
      `}</style>
    </div>
  );
}
