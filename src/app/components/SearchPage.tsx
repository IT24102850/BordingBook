import React, { useState, useEffect, useRef, ReactNode } from 'react';


// Public house listings for all users
type PublicHouse = {
  _id: string;
  name: string;
  address: string;
  monthlyPrice: number;
  deposit: number;
  roomType: string;
  genderPreference: string;
  status: string;
  rating?: number;
  totalReviews?: number;
  features?: string[];
  image?: string;
  images?: string[];
  description?: string;
  createdAt?: string;
};

// --- Public Listings Section ---
function PublicListings() {
  const [listings, setListings] = useState<PublicHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/owner/public/houses')
      .then(res => res.json())
      .then(data => {
        setListings(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load listings');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-cyan-300">Loading public listings...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!listings.length) return <div className="text-gray-400">No public listings found.</div>;

  return (
    <div className="my-6">
      <h3 className="text-lg font-bold text-cyan-200 mb-2">Public Boarding Houses</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(house => (
          <div key={house._id} className="bg-white/10 rounded-lg p-4 border border-cyan-900/30">
            <div className="font-bold text-white text-lg mb-1">{house.name}</div>
            <div className="text-cyan-300 text-xs mb-1">{house.address}</div>
            <div className="text-cyan-100 text-sm mb-2">Rs. {house.monthlyPrice?.toLocaleString()} / month</div>
            {house.image && <img src={house.image} alt={house.name} className="w-full h-32 object-cover rounded mb-2" />}
            <div className="text-xs text-gray-300 mb-1">Type: {house.roomType} | Gender: {house.genderPreference}</div>
            <div className="text-xs text-gray-400 mb-1">{house.description?.slice(0, 80)}{house.description && house.description.length > 80 ? '...' : ''}</div>
            <div className="text-xs text-gray-500">Listed: {house.createdAt ? new Date(house.createdAt).toLocaleDateString() : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}



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
import { BiCurrentLocation, BiWifi, BiWind, BiRestaurant, BiShower, BiCar, BiShield, BiDumbbell, BiLoaderCircle } from 'react-icons/bi';
import { RiUserSharedLine } from 'react-icons/ri';
<<<<<<< Updated upstream
=======
import { BiCurrentLocation } from 'react-icons/bi';
import { distMap } from '../data/rooms';

const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5000').replace(/\/api\/?$/, '').replace(/\/$/, '');

function deriveProfileAge(profile: any): number {
  const numericAge = Number(profile?.age);
  if (Number.isFinite(numericAge) && numericAge > 0) {
    return Math.floor(numericAge);
  }

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

  const yearToken = String(profile?.academicYear || '').toLowerCase();
  if (yearToken.includes('1')) return 19;
  if (yearToken.includes('2')) return 20;
  if (yearToken.includes('3')) return 21;
  if (yearToken.includes('4')) return 22;

  return 18;
}

function normalizeIdValue(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return String(value);
}

// Removed mock roommate data. Only API data will be used for houses and rooms.

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

  const displayName = roommate.name && roommate.name.trim() ? roommate.name : (roommate.email || 'Student');
  const images: string[] = Array.isArray(roommate.profilePictures) && roommate.profilePictures.length > 0
    ? roommate.profilePictures.map((img: any) => String(img))
    : [String(roommate.image || 'https://randomuser.me/api/portraits/lego/1.jpg')];

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
        <img 
          src={images[imageIndex]} 
          alt={displayName} 
          className="w-full h-full object-cover transition-all duration-300"
        />
        
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
        <h3 className="text-xl font-bold text-white mb-1">{displayName}, <span className="text-pink-300">{roommate.age || 20}</span></h3>
        <div className="text-sm text-pink-200 mb-1">{roommate.gender || 'Any'} | {roommate.university || 'SLIIT'}</div>
        <div className="text-sm text-gray-300 mb-3 text-center">{roommate.bio || 'Looking for a compatible roommate.'}</div>
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
}

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
  const current = roommateData[currentIdx];

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
    name: profile.name || profile.fullName || (profile.email ? profile.email.split('@')[0] : 'Student'),
    email: profile.email || '',
    age: deriveProfileAge(profile),
    gender: profile.gender || 'Any',
    university: profile.boardingHouse || profile.academicYear || 'SLIIT',
    bio: profile.description || profile.bio || 'Looking for a compatible roommate.',
    image: profile.image || profile.profilePicture || 'https://randomuser.me/api/portraits/lego/1.jpg',
    interests: Array.isArray(profile.tags) ? profile.tags : [],
    mutualCount: Number(profile.mutualCount) || 0,
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

      if (likedRes.status === 'fulfilled') {
        const profiles = Array.isArray(likedRes.value?.data) ? likedRes.value.data : [];
        setLiked(profiles.map(mapProfileToRoommate));
      }

      if (sentRes.status === 'fulfilled') {
        const requests = Array.isArray(sentRes.value?.data) ? sentRes.value.data : [];
        setSentRequests(
          requests.map((req: any) => ({
            id: req._id,
            message: req.message,
            status: req.status,
            from: mapProfileToRoommate({
              _id: req.recipientId?._id,
              userId: req.recipientId?._id,
              fullName: req.recipientId?.fullName,
              email: req.recipientId?.email,
              profilePicture: req.recipientId?.profilePicture,
            }),
          }))
        );
      }

      if (inboxRes.status === 'fulfilled') {
        const requests = Array.isArray(inboxRes.value?.data) ? inboxRes.value.data : [];
        setInboxRequests(
          requests.map((req: any) => ({
            id: req._id,
            message: req.message,
            status: req.status,
            from: mapProfileToRoommate({
              _id: req.senderId?._id,
              userId: req.senderId?._id,
              fullName: req.senderId?.fullName,
              email: req.senderId?.email,
              profilePicture: req.senderId?.profilePicture,
            }),
          }))
        );
      }

      if (mutualRes.status === 'fulfilled') {
        const matches = Array.isArray(mutualRes.value?.data) ? mutualRes.value.data : [];
        setMutualMatches(matches.map(mapProfileToRoommate));
      }

      if (groupsRes.status === 'fulfilled') {
        setGroups(Array.isArray(groupsRes.value?.data) ? groupsRes.value.data : []);
      }
    } catch {
      // Network sync is best-effort; keep UI usable with local fallback states.
    }
  }, [callRoommateApi, mapProfileToRoommate]);

  React.useEffect(() => {
    loadRoommateNetworkData();
  }, [loadRoommateNetworkData]);

  const handleLike = () => {
    if (!current || isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    setTimeout(() => {
      setLiked((prev) => (prev.some((r) => r.id === current.id) ? prev : [...prev, current]));
      if (currentIdx < roommateData.length - 1) {
        setCurrentIdx(currentIdx + 1);
      }
      setDirection(null);
      setIsAnimating(false);

      void (async () => {
        try {
          if (isMongoId(current.id)) {
            await callRoommateApi('/swipe', {
              method: 'POST',
              body: JSON.stringify({ profileId: current.id, action: 'like' }),
            });
          }

          if (isMongoId(current.userId)) {
            await callRoommateApi('/request/send', {
              method: 'POST',
              body: JSON.stringify({
                recipientId: current.userId,
                message: 'Hi! I think we could be great roommates. Want to connect?',
              }),
            });
          }

          await loadRoommateNetworkData();
          setApiNotice('Like saved and request sent.');
        } catch (error) {
          setApiNotice((error as Error).message || 'Unable to sync roommate request');
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
      if (currentIdx < roommateData.length - 1) {
        setCurrentIdx(currentIdx + 1);
      }
      setDirection(null);
      setIsAnimating(false);

      void (async () => {
        try {
          if (isMongoId(current.id)) {
            await callRoommateApi('/swipe', {
              method: 'POST',
              body: JSON.stringify({ profileId: current.id, action: 'pass' }),
            });
          }
        } catch {
          // Keep pass action local if backend sync fails.
        }
      })();
    }, 250);
  };

  const handleUndo = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setDirection(null);
    }
  };

  const handleRequestResponse = async (requestId: string, accept: boolean) => {
    try {
      await callRoommateApi(`/request/${requestId}/${accept ? 'accept' : 'reject'}`, {
        method: 'PATCH',
      });
      await loadRoommateNetworkData();
      setApiNotice(accept ? 'Request accepted. You can start chatting now.' : 'Request rejected.');
    } catch (error) {
      setApiNotice((error as Error).message || 'Failed to update request status');
    }
  };

  const createGroupFromLiked = async () => {
    try {
      const memberEmails = liked.map((m) => m.email).filter(Boolean);
      if (memberEmails.length === 0) {
        setApiNotice('Like at least one roommate before creating a group.');
        return;
      }

      await callRoommateApi('/group', {
        method: 'POST',
        body: JSON.stringify({
          name: `Roommate Group ${new Date().toLocaleDateString()}`,
          memberEmails,
        }),
      });

      await loadRoommateNetworkData();
      setApiNotice('Group created successfully. Members will receive invites.');
    } catch (error) {
      setApiNotice((error as Error).message || 'Failed to create group');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
        {[
          { id: 'browse', label: 'Browse' },
          { id: 'requests', label: `Sent (${sentRequests.length})` },
          { id: 'inbox', label: `Inbox (${inboxRequests.filter((r) => r.status === 'pending').length})` },
          { id: 'groups', label: 'Groups' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRoommateTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-semibold ${
              roommateTab === tab.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BROWSE TAB */}
      {roommateTab === 'browse' && (
        <>
          {apiNotice && (
            <div className="text-xs text-cyan-200 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">
              {apiNotice}
            </div>
          )}

          {mutualMatches.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              <p className="text-sm text-emerald-200 font-semibold mb-2">Mutual Matches ({mutualMatches.length})</p>
              <div className="flex flex-wrap gap-2">
                {mutualMatches.slice(0, 6).map((match) => (
                  <button
                    key={match.id}
                    onClick={() => {
                      const getUserId = (user: any) => user.userId || user._id || user.id || (typeof user === 'string' ? user : '');
                      const recipientId = String(getUserId(match));
                      const selectedRoommate = { ...match, userId: recipientId };
                      navigate(`/chat?recipientId=${encodeURIComponent(recipientId)}`, {
                        state: { selectedRoommate, chatType: 'direct-message', recipientId },
                      });
                    }}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
                  >
                    <img src={match.image} alt={match.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs text-emerald-100">{match.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-xs text-gray-400">Focus mode keeps swipe actions clear on smaller windows.</p>
              <button
                onClick={() => setShowSidePanels((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 border border-white/15 text-cyan-200 hover:bg-white/15 transition"
              >
                {showSidePanels ? 'Hide Passed & Favorites' : 'Show Passed & Favorites'}
              </button>
            </div>

            <div className={showSidePanels ? 'grid grid-cols-3 gap-6' : 'grid grid-cols-1 gap-6'}>
              {/* Left Column - Passed Roommates */}
              {showSidePanels && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <FaHistory className="text-red-400" />
                  <h3 className="text-sm font-bold text-white">Passed</h3>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-auto">{passed.length}</span>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {passed.length > 0 ? (
                    passed.map((roommate) => (
                      <MiniRoommateCard key={roommate.id} roommate={roommate} type="passed" />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs text-gray-500">No passed profiles yet</p>
                      <p className="text-[10px] text-gray-600 mt-1">Swipe left to pass</p>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Center Column - Main Swipe Card */}
              <div className={showSidePanels ? '' : 'max-w-2xl mx-auto'}>
                <div className="mb-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-cyan-200">
                    Profile {Math.min(currentIdx + 1, Math.max(1, roommateData.length))} of {roommateData.length}
                  </span>
                  <span className="text-xs text-gray-400">{Math.max(0, roommateData.length - currentIdx)} remaining</span>
                </div>
                <div className="relative h-[460px] mb-4 perspective-1000">
                  {currentIdx < roommateData.length - 1 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl border border-white/10 shadow-xl transform translate-y-2 translate-x-1 scale-[0.98] opacity-30" />
                  )}
                  {current ? (
                    <RoommateSwipeCard
                      roommate={current}
                      onLike={handleLike}
                      onPass={handlePass}
                      isAnimating={isAnimating}
                      direction={direction}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl border border-white/10">
                      <p className="text-gray-400 text-center">No more profiles!</p>
                    </div>
                  )}
                </div>
                <div className="relative z-20 flex justify-end items-center mt-5">
                  <button
                    onClick={handleUndo}
                    disabled={currentIdx === 0}
                    className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaUndo /> Undo
                  </button>
                </div>

              </div>

              {/* Right Column - Liked Roommates */}
              {showSidePanels && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <FaBookmark className="text-green-400" />
                  <h3 className="text-sm font-bold text-white">Favorites</h3>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-auto">{liked.length}</span>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {liked.length > 0 ? (
                    liked.map((roommate) => (
                      <MiniRoommateCard key={roommate.id} roommate={roommate} type="liked" />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs text-gray-500">No favorites yet</p>
                      <p className="text-[10px] text-gray-600 mt-1">Swipe right to save</p>
                    </div>
                  )}
                </div>
                {liked.length > 0 && (
                  <button className="w-full mt-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
                    View All Favorites
                  </button>
                )}
              </div>
              )}
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-full max-w-md mb-3 px-4">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-cyan-200">
                  Profile {Math.min(currentIdx + 1, Math.max(1, roommateData.length))} of {roommateData.length}
                </span>
                <span className="text-xs text-gray-400">{Math.max(0, roommateData.length - currentIdx)} left</span>
              </div>
            </div>
            {current ? (
              <>
                <RoommateSwipeCard
                  roommate={current}
                  onLike={handleLike}
                  onPass={handlePass}
                  isAnimating={isAnimating}
                  direction={direction}
                />
                <div className="relative z-20 flex justify-end w-full max-w-md mt-5 px-4">
                  <button
                    onClick={handleUndo}
                    disabled={currentIdx === 0}
                    className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaUndo /> Undo
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400">No more profiles!</p>
            )}
          </div>
        </>
      )}

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
                        // Always use MongoDB userId for chat
                        const getUserId = (user: any) => user.userId || user._id || user.id || (typeof user === 'string' ? user : '');
                        const recipientId = String(getUserId(req.from));
                        const selectedRoommate = { ...req.from, userId: recipientId };
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
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Groups</h3>
            <button 
              onClick={createGroupFromLiked}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            >
              <FaPlus size={16} />
              Create Group
            </button>
          </div>

          {groups.length > 0 && (
            <div className="mb-6 space-y-2">
              {groups.map((group: any) => (
                <div key={group._id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{group.name}</p>
                    <p className="text-xs text-gray-400">
                      {Array.isArray(group.members) ? group.members.length : 0} members • Status: {group.status || 'forming'}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Synced
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {liked.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-6 border border-cyan-500/30">
                <h4 className="text-white font-semibold mb-4">Your Liked Roommates ({liked.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {liked.map((roommate) => (
                    <div key={roommate.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                      <img src={roommate.image} alt={roommate.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{roommate.name}</p>
                        <p className="text-gray-400 text-xs">{roommate.age} | {roommate.university}</p>
                      </div>
                      <FaCheckCircle className="text-green-400" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Ready to create a group? These are your favorite roommates. Start a group and invite them to join!
                </p>
                <button 
                  onClick={createGroupFromLiked}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <FaUserFriends size={18} />
                  Create Group with These Members
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <FaUserFriends className="text-4xl text-pink-400 mx-auto mb-3 opacity-50" />
              <p className="text-gray-300 font-semibold mb-2">No groups yet</p>
              <p className="text-sm text-gray-400 mb-4">Start by liking roommates in the Browse tab</p>
              <button 
                onClick={() => setRoommateTab('browse')}
                className="px-4 py-2 bg-white/10 border border-white/20 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition"
              >
                Browse Roommates
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Placeholder for Map View
function MapViewPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl border border-white/10 text-cyan-200 text-lg font-semibold shadow-inner">
      <span className="mb-2">Map</span>
      Map View coming soon...
    </div>
  );
}

// Define types
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
  interests: string[];
  mutualCount?: number;
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
  campus?: string[];
  fullAddress?: string;
  vacancy?: string;
  totalRooms?: number;
  occupiedRooms?: number;
}

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
        label: `${totalRooms - occupiedRooms} Vacancy Left`, 
        color: 'text-red-300', 
        bgColor: 'bg-red-500/20 border-red-500/30',
        icon: '!' 
      };
    case 'full':
      return { 
        label: 'Fully Booked', 
        color: 'text-gray-300', 
        bgColor: 'bg-gray-500/20 border-gray-500/30',
        icon: 'X'
      };
    case 'coming':
      return { 
        label: 'Coming Soon', 
        color: 'text-blue-300', 
        bgColor: 'bg-blue-500/20 border-blue-500/30',
        icon: '...'
      };
    default: // 'available'
      return { 
        label: `${totalRooms - occupiedRooms} Available`, 
        color: 'text-green-300', 
        bgColor: 'bg-green-500/20 border-green-500/30',
        icon: 'OK'
      };
  }
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
        <div className="sticky top-0 bg-gradient-to-br from-[#181f36] to-[#0f172a] p-4 border-b border-white/10 flex justify-between items-center">
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

>>>>>>> Stashed changes
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

// Placeholder for Map View
function MapViewPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl border border-white/10 text-cyan-200 text-lg font-semibold shadow-inner">
      <span className="mb-2">Map</span>
      Map View coming soon...
    </div>
  );
}

// Roommate Finder Placeholder Component
const RoommateFinderPlaceholder: React.FC<{
  roommateData: Roommate[];
  dbListings: Listing[];
  currentUserId: string;
  isRoommatesLoading: boolean;
  onToast: (msg: string) => void;
  currentUserName?: string;
  currentUserImage?: string;
}> = ({ roommateData, dbListings, currentUserId, isRoommatesLoading, onToast, currentUserName, currentUserImage }) => {
  const navigate = useNavigate();
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'browse' | 'rooms' | 'sent' | 'inbox' | 'groups'>('browse');
  const [inboxItems, setInboxItems] = useState<any[]>([]);
  const [sentItems, setSentItems] = useState<any[]>([]);
  const [groupItems, setGroupItems] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [tabErrorMessage, setTabErrorMessage] = useState('');
  const [groupScenario, setGroupScenario] = useState<'join-existing' | 'new-place'>('new-place');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [browseIndex, setBrowseIndex] = useState(0);
  const [browseAnimating, setBrowseAnimating] = useState(false);
  const [browseDirection, setBrowseDirection] = useState<string | null>(null);
  const [likedProfiles, setLikedProfiles] = useState<Roommate[]>([]);
  const [passedProfiles, setPassedProfiles] = useState<Roommate[]>([]);
  const swipeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const currentProfile = roommateData[browseIndex];

  const getAuthToken = () => localStorage.getItem('bb_access_token') || '';
  const inboxCacheKey = currentUserId ? `bb_inbox_cache_${currentUserId}` : 'bb_inbox_cache';

  const sortRequestsNewestFirst = (items: any[]) => {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => {
      const aTime = new Date(a?.createdAt || 0).getTime();
      const bTime = new Date(b?.createdAt || 0).getTime();
      return bTime - aTime;
    });
  };

  const DEFAULT_PROFILE_IMAGE = 'https://randomuser.me/api/portraits/lego/1.jpg';

  const resolveProfileImage = (profile: any) => {
    const raw = profile?.image || profile?.profilePicture || (Array.isArray(profile?.profilePictures) ? profile.profilePictures[0] : '');
    return typeof raw === 'string' && raw.trim().length > 0 ? raw : DEFAULT_PROFILE_IMAGE;
  };

  const mapProfile = (profile: any): Roommate => ({
    id: normalizeIdValue(profile._id || profile.id),
    userId: normalizeIdValue(profile.userId || profile._id || profile.id),
    name: profile.name || profile.fullName || 'Student',
    email: profile.email || '',
    age: Number(profile.age) || deriveProfileAge(profile),
    gender: profile.gender || 'Any',
    university: profile.university || profile.boardingHouse || profile.academicYear || 'SLIIT',
    bio: profile.bio || profile.description || profile.about || profile.profileBio || 'No bio provided yet.',
    image: resolveProfileImage(profile),
    interests: Array.isArray(profile.interests) ? profile.interests : Array.isArray(profile.tags) ? profile.tags : [],
    mutualCount: Number(profile.mutualCount) || 0,
    role: profile.role || 'student',
    compatibility: Number(profile.compatibility) || 0,
  });

  const pushSwipeToDatabase = async (profile: Roommate, action: 'like' | 'pass') => {
    const token = getAuthToken();
    if (!token) return;
    const profileId = profile.userId || profile.id;
    if (!profileId) return;
    try {
      await fetch(`${API_BASE_URL}/api/roommates/swipe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId, action }),
      });
    } catch {
      // Keep UI responsive even if swipe persistence fails.
    }
  };

  const createRequestFromLike = async (profile: Roommate) => {
    const token = getAuthToken();
    if (!token) return;

    const recipientId = resolveValidRecipientId(profile);
    if (!recipientId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/roommates/request/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          message: `Hi ${profile.name}, I liked your profile and would like to connect as roommates.`,
        }),
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || json?.success === false) {
        return;
      }

      // Optimistically surface in Sent tab with pending/default status.
      setSentItems((prev) => {
        const key = String(profile.userId || profile.id);
        if (prev.some((item) => String(item?.recipientId?._id || item?.recipientId || '') === key)) {
          return prev;
        }
        return [
          {
            _id: json?.data?._id || `like-${key}`,
            recipientId: {
              _id: profile.userId || profile.id,
              fullName: profile.name,
              email: profile.email,
              profilePicture: profile.image,
            },
            message: json?.data?.message || `Hi ${profile.name}, I liked your profile and would like to connect as roommates.`,
            status: json?.data?.status || 'pending',
            createdAt: json?.data?.createdAt || new Date().toISOString(),
          },
          ...prev,
        ];
      });
    } catch {
      // Keep swipe flow responsive even if request creation fails.
    }
  };

  const loadLikedProfiles = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 20000);
      const response = await fetch(`${API_BASE_URL}/api/roommates/liked`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        cache: 'no-store',
      }).finally(() => window.clearTimeout(timeoutId));

      const json = await response.json();
      const rows = response.ok ? extractResponseArray(json) : [];
      setLikedProfiles(rows.map(mapProfile));
    } catch {
      setLikedProfiles([]);
    }
  };

  const handleBrowseLike = async () => {
    if (!currentProfile || browseAnimating) return;
    setBrowseAnimating(true);
    setBrowseDirection('right');
    void pushSwipeToDatabase(currentProfile, 'like');
    window.setTimeout(() => {
      setLikedProfiles((prev) => {
        const profileKey = String(currentProfile.userId || currentProfile.id);
        if (prev.some((item) => String(item.userId || item.id) === profileKey)) {
          return prev;
        }
        return [...prev, currentProfile];
      });
      void createRequestFromLike(currentProfile);
      onToast(`Added ${currentProfile.name} to favourites`);
      setBrowseIndex((prev) => prev + 1);
      setBrowseDirection(null);
      setBrowseAnimating(false);
    }, 260);
  };

  const handleBrowsePass = async () => {
    if (!currentProfile || browseAnimating) return;
    setBrowseAnimating(true);
    setBrowseDirection('left');
    void pushSwipeToDatabase(currentProfile, 'pass');
    window.setTimeout(() => {
      setPassedProfiles((prev) => [...prev, currentProfile]);
      setBrowseIndex((prev) => prev + 1);
      setBrowseDirection(null);
      setBrowseAnimating(false);
    }, 260);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeRef.current || browseAnimating || !currentProfile) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    if (Math.abs(diff) > 20) {
      swipeRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.02}deg)`;
      swipeRef.current.style.opacity = `${1 - Math.abs(diff) / 500}`;
    }
  };

  const handleTouchEnd = () => {
    if (!swipeRef.current || browseAnimating || !currentProfile) return;
    const diff = currentXRef.current - startXRef.current;
    swipeRef.current.style.transform = '';
    swipeRef.current.style.opacity = '';
    if (diff > 100) handleBrowseLike();
    if (diff < -100) handleBrowsePass();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (browseAnimating || !currentProfile) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    if (swipeRef.current) swipeRef.current.style.transition = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !swipeRef.current || browseAnimating || !currentProfile) return;
    const diff = e.clientX - dragStartX;
    if (Math.abs(diff) > 20) {
      swipeRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.02}deg)`;
      swipeRef.current.style.opacity = `${1 - Math.abs(diff) / 500}`;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !swipeRef.current || browseAnimating || !currentProfile) {
      setIsDragging(false);
      return;
    }
    const diff = e.clientX - dragStartX;
    swipeRef.current.style.transition = '';
    swipeRef.current.style.transform = '';
    swipeRef.current.style.opacity = '';
    if (diff > 100) handleBrowseLike();
    if (diff < -100) handleBrowsePass();
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging && swipeRef.current) {
      swipeRef.current.style.transition = '';
      swipeRef.current.style.transform = '';
      swipeRef.current.style.opacity = '';
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (activeSection !== 'sent' && activeSection !== 'inbox' && activeSection !== 'groups') return;
    const token = localStorage.getItem('bb_access_token') || '';
    if (!token) return;

    let cancelled = false;
    const fetchJsonWithTimeout = async (url: string, timeoutMs = 15000) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: 'no-store',
        });
        const json = await response.json().catch(() => ({}));
        return {
          ok: response.ok,
          status: response.status,
          data: response.ok ? extractResponseArray(json) : [],
          message: typeof json?.message === 'string' ? json.message : '',
        };
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    const loadTabData = async () => {
      setIsTabLoading(true);
      setTabErrorMessage('');
      try {
        if (cancelled) return;

        if (activeSection === 'inbox') {
          const cachedInboxRaw = localStorage.getItem(inboxCacheKey);
          if (cachedInboxRaw && !cancelled) {
            try {
              const cachedInbox = JSON.parse(cachedInboxRaw);
              if (Array.isArray(cachedInbox) && cachedInbox.length > 0) {
                setInboxItems(sortRequestsNewestFirst(cachedInbox));
              }
            } catch {
              // Ignore invalid cache payloads.
            }
          }

          const inboxResult = await fetchJsonWithTimeout(`${API_BASE_URL}/api/roommates/request/inbox`, 12000);
          if (!cancelled && inboxResult.ok) {
            const freshInbox = sortRequestsNewestFirst(inboxResult.data);
            setInboxItems(freshInbox);
            localStorage.setItem(inboxCacheKey, JSON.stringify(freshInbox));
          } else if (!cancelled && !inboxResult.ok) {
            if (inboxResult.status === 401 || inboxResult.status === 403) {
              setTabErrorMessage('Inbox could not refresh because your session expired. Please sign in again.');
            } else if (inboxResult.status >= 500) {
              setTabErrorMessage('Inbox service is temporarily unavailable. Showing the latest available data.');
            } else if (inboxResult.message) {
              setTabErrorMessage(inboxResult.message);
            }
          }

          // Fetch conversations/chats
          const conversationsResult = await fetchJsonWithTimeout(`${API_BASE_URL}/api/chats/conversations`, 12000);
          if (!cancelled && conversationsResult.ok) {
            setConversations(conversationsResult.data);
          }
        } else if (activeSection === 'sent') {
          const sentResult = await fetchJsonWithTimeout(`${API_BASE_URL}/api/roommates/request/sent`, 12000);
          if (!cancelled && sentResult.ok) setSentItems(sentResult.data);
        } else if (activeSection === 'groups') {
          const cachedGroupsRaw = localStorage.getItem('bb_groups_cache');
          if (cachedGroupsRaw && !cancelled) {
            try {
              const cachedGroups = JSON.parse(cachedGroupsRaw);
              if (Array.isArray(cachedGroups) && cachedGroups.length > 0) {
                setGroupItems(cachedGroups);
              }
            } catch {
              // Ignore invalid cache payloads.
            }
          }

          const groupsResult = await fetchJsonWithTimeout(`${API_BASE_URL}/api/roommates/groups`, 12000);
          if (!cancelled && groupsResult.ok) {
            setGroupItems(groupsResult.data);
            localStorage.setItem('bb_groups_cache', JSON.stringify(groupsResult.data));
          }
        }
      } catch {
        if (!cancelled) {
          if (activeSection === 'inbox') {
            setTabErrorMessage('Could not refresh inbox right now. Showing the latest available data.');
          }
          if (activeSection === 'sent') setSentItems([]);
          if (activeSection === 'groups') setGroupItems([]);
        }
      } finally {
        if (!cancelled) setIsTabLoading(false);
      }
    };

    loadTabData();
    return () => {
      cancelled = true;
    };
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== 'inbox') return;
    const token = getAuthToken();
    if (!token) return;

    let cancelled = false;

    const refreshInboxFromDatabase = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/roommates/request/inbox`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok || cancelled) return;

        const latestInbox = sortRequestsNewestFirst(extractResponseArray(json));
        setInboxItems(latestInbox);
        localStorage.setItem(inboxCacheKey, JSON.stringify(latestInbox));

        // Also fetch conversations
        try {
          const convResponse = await fetch(`${API_BASE_URL}/api/chats/conversations`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });
          const convJson = await convResponse.json().catch(() => ({}));
          if (convResponse.ok && !cancelled) {
            setConversations(extractResponseArray(convJson));
          }
        } catch {
          // Keep current conversations on fetch failure
        }
      } catch {
        // Keep current inbox UI state when background refresh fails.
      }
    };

    const onWindowFocus = () => {
      void refreshInboxFromDatabase();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshInboxFromDatabase();
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshInboxFromDatabase();
    }, 15000);

    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [activeSection, inboxCacheKey]);

  useEffect(() => {
    if (activeSection !== 'browse') return;
    // Avoid heavy initial /liked fetch slowing down first swipe render.
    // Favorites are updated optimistically on like and can be refreshed when needed.
  }, [activeSection]);

  const handleSendRequest = (roommate: Roommate) => {
    if (!resolveValidRecipientId(roommate)) {
      onToast('This profile cannot receive roommate requests because it does not have a valid account id. Please refresh and try again.');
      return;
    }
    setSelectedRoommate(roommate);
    setShowRequestModal(true);
  };

  const submitRequest = async () => {
    if (!selectedRoommate) return;
    const token = getAuthToken();
    if (!token) {
      onToast('Please sign in to send roommate requests');
      return;
    }

    const recipientId = resolveValidRecipientId(selectedRoommate);
    if (!recipientId) {
      onToast('This roommate profile is missing a valid account id. Refresh the list and try again.');
      return;
    }

    const trimmed = requestMessage.trim();
    const messageToSend = trimmed.length >= 10
      ? trimmed
      : 'Hi! I would like to connect as a roommate near SLIIT.';

    try {
      const response = await fetch(`${API_BASE_URL}/api/roommates/request/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          message: messageToSend,
        }),
      });

      const json = await response.json();
      if (!response.ok || json?.success === false) {
        onToast(json?.message || 'Failed to send roommate request');
        return;
      }

      onToast(`Roommate request sent to ${selectedRoommate.name}!`);
      setShowRequestModal(false);
      setRequestMessage('');
      if (activeSection !== 'browse') {
        setActiveSection('sent');
      }
    } catch {
      onToast('Network error while sending request');
    }
  };

  const refreshRoommateTabData = async () => {
    const token = getAuthToken();
    if (!token) return;
    const load = async (url: string) => {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      const json = await response.json().catch(() => ({}));
      return response.ok ? extractResponseArray(json) : [];
    };
    const [inbox, sent, groups] = await Promise.all([
      load(`${API_BASE_URL}/api/roommates/request/inbox`),
      load(`${API_BASE_URL}/api/roommates/request/sent`),
      load(`${API_BASE_URL}/api/roommates/groups`),
    ]);
    const sortedInbox = sortRequestsNewestFirst(inbox);
    setInboxItems(sortedInbox);
    setSentItems(sent);
    setGroupItems(groups);
    localStorage.setItem(inboxCacheKey, JSON.stringify(sortedInbox));
    localStorage.setItem('bb_groups_cache', JSON.stringify(groups));
  };

  const handleRequestDecision = async (requestId: string, decision: 'accept' | 'reject') => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/roommates/request/${requestId}/${decision}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json?.success === false) {
        onToast(json?.message || `Failed to ${decision} request`);
        return;
      }
      onToast(`Request ${decision}ed`);
      await refreshRoommateTabData();
    } catch {
      onToast(`Network error while trying to ${decision} request`);
    }
  };

  const handleGroupInviteDecision = async (groupId: string, decision: 'accepted' | 'rejected') => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/roommates/group/${groupId}/respond`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: decision }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json?.success === false) {
        onToast(json?.message || 'Failed to respond to group invite');
        return;
      }
      onToast(`Group invite ${decision}`);
      await refreshRoommateTabData();
    } catch {
      onToast('Network error while responding to group invite');
    }
  };

  const handleStartGroupChat = async (group: any) => {
    const groupId = String(group?._id || group?.id || '');
    if (!groupId) {
      onToast('Invalid group');
      return;
    }

    const acceptedCount = Array.isArray(group?.members)
      ? group.members.filter((member: any) => member?.status === 'accepted').length
      : 0;

    if (acceptedCount < 2) {
      onToast('Group chat requires at least 2 accepted members');
      return;
    }

    navigate('/chat', { state: { groupId } });
  };

  const toggleGroupMember = (memberId: string) => {
    setSelectedGroupMembers((prev) => (
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    ));
  };

  const submitCreateGroup = async () => {
    const token = getAuthToken();
    if (!token) {
      onToast('Please sign in first');
      return;
    }
    if (selectedGroupMembers.length === 0) {
      onToast('Select at least one member to invite');
      return;
    }
    if (groupScenario === 'join-existing' && !selectedRoomId) {
      onToast('Choose a room with vacancy to join');
      return;
    }

    const members = roommateData.filter((m) => selectedGroupMembers.includes(m.userId || m.id));
    const memberEmails = members.map((m) => m.email).filter(Boolean);
    if (!memberEmails.length) {
      onToast('Selected members do not have valid emails');
      return;
    }

    const selectedRoom: any = (dbListings || []).find((room: any) => String(room.id || room._id) === String(selectedRoomId));
    const totalSpots = Number(selectedRoom?.totalSpots || 0);
    const occupancy = Number(selectedRoom?.occupancy || 0);
    const vacancy = Math.max(0, totalSpots - occupancy);

    setIsCreatingGroup(true);
    try {
      const payload: any = {
        memberEmails,
        scenario: groupScenario,
        plannedBoardingHouseTag: groupScenario === 'new-place' ? 'Planned boarding house' : '',
        currentBoardingHouseTag:
          groupScenario === 'join-existing'
            ? (vacancy === 1 ? 'Current boarding house (1 vacancy left)' : 'Current boarding house')
            : '',
      };
      if (groupScenario === 'join-existing') {
        payload.roomId = selectedRoomId;
      }

      const response = await fetch(`${API_BASE_URL}/api/roommates/group`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json?.success === false) {
        onToast(json?.message || 'Failed to create group');
        return;
      }

      onToast('Group created and invitations sent');
      setSelectedGroupMembers([]);
      setSelectedRoomId('');
      await refreshRoommateTabData();
      setActiveSection('groups');
    } catch {
      onToast('Network error while creating group');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const MiniProfileCard: React.FC<{ item: Roommate; type: 'passed' | 'liked' }> = ({ item, type }) => (
    <div className="bg-[#111b38] rounded-lg border border-white/10 p-2 flex items-center gap-2">
      <img
        src={resolveProfileImage(item)}
        alt={item.name}
        className="w-10 h-10 rounded-full object-cover"
        onError={(event) => {
          const target = event.currentTarget;
          if (target.src !== DEFAULT_PROFILE_IMAGE) target.src = DEFAULT_PROFILE_IMAGE;
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white font-semibold truncate">{item.name}</p>
        <p className="text-[10px] text-gray-400 truncate">{item.university}</p>
      </div>
      {type === 'liked' ? <FaHeart className="text-green-400 text-xs" /> : <FaRegTimesCircle className="text-red-400 text-xs" />}
    </div>
  );

  const renderBrowseTab = () => {
    if (isRoommatesLoading && !roommateData.length) {
      return (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-300 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Loading Students</h3>
          <p className="text-gray-400 text-sm">Finding available roommates near SLIIT...</p>
        </div>
      );
    }

    if (!roommateData.length) {
      return (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
          <FaUserFriends className="text-5xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Roommates Found</h3>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">We couldn't find any roommate matches right now. Check back later.</p>
        </div>
      );
    }

    if (!currentProfile) {
      return (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
          <FaCheckCircle className="text-5xl text-cyan-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">You reviewed all student profiles</h3>
          <button
            onClick={() => {
              setBrowseIndex(0);
              setLikedProfiles([]);
              setPassedProfiles([]);
            }}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold"
          >
            Restart Swipe
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="hidden md:grid grid-cols-3 gap-5">

          <div className="bg-white/5 rounded-xl border border-white/10 p-3 space-y-2 max-h-[560px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white font-semibold">Passed</p>
              <span className="text-xs text-red-300">{passedProfiles.length}</span>
            </div>
            {passedProfiles.length ? passedProfiles.map((item) => <MiniProfileCard key={`p-${item.id}`} item={item} type="passed" />) : <p className="text-xs text-gray-500">Swipe left to pass</p>}
          </div>

          <div>
            <div
              ref={swipeRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className={`relative bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl overflow-hidden border border-white/10 ${browseDirection === 'left' ? 'animate-swipe-left' : ''} ${browseDirection === 'right' ? 'animate-swipe-right' : ''}`}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              <div className="relative h-80">
                <img src={currentProfile.image} alt={currentProfile.name} className="w-full h-full object-cover" draggable="false" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-2xl font-bold">{currentProfile.name}, <span className="text-pink-300">{currentProfile.age}</span></h3>
                  <p className="text-xs text-cyan-200">{currentProfile.gender} | {currentProfile.university}</p>
                  <p className="text-xs text-gray-200 mt-1 line-clamp-2">{currentProfile.bio}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3 flex justify-center">
                  <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                    {Math.max(1, currentProfile.mutualCount || currentProfile.interests.length || 1)} mutual interests
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {currentProfile.interests.slice(0, 4).map((interest, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-full">{interest}</span>
                  ))}
                </div>
                <div className="flex justify-center gap-6">
                  <button onClick={handleBrowsePass} disabled={browseAnimating} className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center">
                    <FaRegTimesCircle />
                  </button>
                  <button onClick={handleBrowseLike} disabled={browseAnimating} className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <FaHeart />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-3 space-y-2 max-h-[560px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white font-semibold">Favorites</p>
              <span className="text-xs text-green-300">{likedProfiles.length}</span>
            </div>
            {likedProfiles.length ? likedProfiles.map((item) => <MiniProfileCard key={`l-${item.id}`} item={item} type="liked" />) : <p className="text-xs text-gray-500">Swipe right to like</p>}
          </div>
        </div>

        <div className="md:hidden">
          <div
            ref={swipeRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className={`relative bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl overflow-hidden border border-white/10 ${browseDirection === 'left' ? 'animate-swipe-left' : ''} ${browseDirection === 'right' ? 'animate-swipe-right' : ''}`}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <div className="relative h-80">
              <img src={currentProfile.image} alt={currentProfile.name} className="w-full h-full object-cover" draggable="false" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-2xl font-bold">{currentProfile.name}, <span className="text-pink-300">{currentProfile.age}</span></h3>
                <p className="text-xs text-cyan-200">{currentProfile.gender} | {currentProfile.university}</p>
                <p className="text-xs text-gray-200 mt-1 line-clamp-2">{currentProfile.bio}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3 flex justify-center">
                <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                  {Math.max(1, currentProfile.mutualCount || currentProfile.interests.length || 1)} mutual interests
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                {currentProfile.interests.slice(0, 4).map((interest, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-full">{interest}</span>
                ))}
              </div>
              <div className="flex justify-center gap-6">
                <button onClick={handleBrowsePass} disabled={browseAnimating} className="w-14 h-14 rounded-full bg-pink-600 text-white flex items-center justify-center text-xl">
                  <FaRegTimesCircle />
                </button>
                <button onClick={handleBrowseLike} disabled={browseAnimating} className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl">
                  <FaHeart />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderRequestCard = (item: any, mode: 'sent' | 'inbox') => {
    const person = mode === 'sent' ? item?.recipientId : item?.senderId;
    const personId = normalizeIdValue(person?._id || person?.id || person?.userId || person);
    const personName = person?.fullName || person?.name || person?.email || (mode === 'sent' ? 'Recipient' : 'Sender');
    const personEmail = person?.email || '';
    const createdAt = item?.createdAt ? new Date(item.createdAt).toLocaleString() : '';
    const status = String(item?.status || 'pending');
    const statusTone = status === 'accepted'
      ? 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30'
      : status === 'rejected'
      ? 'text-rose-300 bg-rose-500/15 border-rose-400/30'
      : 'text-amber-200 bg-amber-500/15 border-amber-300/30';

    const hasActions = mode === 'inbox' && status === 'pending';
  const canStartChat = mode === 'inbox' && status === 'accepted' && Boolean(personId);

    return (
      <div key={item?._id || `${mode}-${Math.random().toString(36).slice(2)}`} className="bg-white/5 rounded-xl border border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{personName}</p>
            {personEmail ? <p className="text-[11px] text-gray-400 truncate">{personEmail}</p> : null}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] border ${statusTone}`}>{status}</span>
        </div>
        <p className="text-xs text-gray-200 mt-2">{item?.message || 'No message provided.'}</p>
        {createdAt ? <p className="text-[11px] text-gray-500 mt-2">{createdAt}</p> : null}
        {hasActions ? (
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => handleRequestDecision(String(item?._id), 'accept')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => handleRequestDecision(String(item?._id), 'reject')}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs"
            >
              Reject
            </button>
          </div>
        ) : null}
        {canStartChat ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => navigate('/chat', { state: { recipientId: personId } })}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs"
            >
              Start Chat
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  const renderConversationCard = (conversation: any) => {
    const title = conversation?.name || 'Conversation';
    const avatar = conversation?.avatar || '';
    const lastMessage = conversation?.lastMessage?.text || 'No messages yet';
    const updatedAt = conversation?.updatedAt ? new Date(conversation.updatedAt).toLocaleString() : '';
    const unreadCount = conversation?.unreadCount || 0;
    const conversationId = conversation?.id || conversation?._id || '';

    return (
      <div key={conversationId} className="bg-white/5 rounded-xl border border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {avatar && (
              <img
                src={avatar}
                alt={title}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{title}</p>
              <p className="text-xs text-gray-300 truncate">{lastMessage}</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-500/20 border border-pink-400/30 text-pink-200 flex-shrink-0">
              {unreadCount} new
            </span>
          )}
        </div>
        {updatedAt && <p className="text-[11px] text-gray-500 mt-2">{updatedAt}</p>}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => navigate('/chat', { state: { conversationId } })}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs w-full"
          >
            Open Chat
          </button>
        </div>
      </div>
    );
  };

  const renderGroups = () => (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
        <p className="text-sm text-white font-semibold">Create Booking Group</p>
        <div className="flex gap-3 text-xs">
          <label className="flex items-center gap-2 text-gray-200">
            <input
              type="radio"
              checked={groupScenario === 'join-existing'}
              onChange={() => setGroupScenario('join-existing')}
              className="accent-cyan-400"
            />
            Join existing room
          </label>
          <label className="flex items-center gap-2 text-gray-200">
            <input
              type="radio"
              checked={groupScenario === 'new-place'}
              onChange={() => setGroupScenario('new-place')}
              className="accent-pink-400"
            />
            Form group for new place
          </label>
        </div>

        {groupScenario === 'join-existing' ? (
          <div>
            <label className="block text-xs text-gray-300 mb-1">Select current boarding house</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">-- Select a room --</option>
              {dbListings.map((room: any) => {
                const roomId = String(room.id || room._id || '');
                const vacancy = Math.max(0, Number(room.totalSpots || room.totalRooms || 0) - Number(room.occupancy || room.occupiedRooms || 0));
                return (
                  <option key={roomId} value={roomId}>
                    {room.title || room.name || 'Room'} ({vacancy} vacancies)
                  </option>
                );
              })}
            </select>
            {(() => {
              const selectedRoom: any = dbListings.find((room: any) => String(room.id || room._id) === String(selectedRoomId));
              if (!selectedRoom) return null;
              const vacancy = Math.max(0, Number(selectedRoom.totalSpots || selectedRoom.totalRooms || 0) - Number(selectedRoom.occupancy || selectedRoom.occupiedRooms || 0));
              if (vacancy !== 1) return null;
              return <p className="mt-2 text-xs text-amber-300">Tagged: Current boarding house (1 vacancy left)</p>;
            })()}
          </div>
        ) : (
          <p className="text-xs text-cyan-200">Tagged: Planned boarding house</p>
        )}

        <div>
          <label className="block text-xs text-gray-300 mb-1">Invite members</label>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
            {roommateData.map((mate) => (
              <label key={mate.userId || mate.id} className="flex items-center gap-2 text-xs text-gray-200">
                <input
                  type="checkbox"
                  checked={selectedGroupMembers.includes(mate.userId || mate.id)}
                  onChange={() => toggleGroupMember(mate.userId || mate.id)}
                  className="accent-cyan-400"
                />
                <span>{mate.name}</span>
                <span className="text-gray-400 truncate">{mate.email}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={isCreatingGroup}
          onClick={submitCreateGroup}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold disabled:opacity-60"
        >
          {isCreatingGroup ? 'Creating...' : 'Create Group & Send Invites'}
        </button>
      </div>

      {groupItems.length ? groupItems.map((group: any) => (
        <div key={group._id || group.id} className="bg-white/5 rounded-xl border border-white/10 p-4">
          {(() => {
            const members = Array.isArray(group?.members) ? group.members : [];
            const acceptedCount = members.filter((member: any) => member?.status === 'accepted').length;
            const isCurrentUserAccepted = members.some((member: any) => {
              const memberId = String(member?.userId?._id || member?.userId || '');
              return member?.status === 'accepted' && memberId === String(currentUserId);
            });

            return (
              <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white text-sm font-semibold">{group.name || 'Booking Group'}</p>
              <p className="text-[11px] text-gray-400 mt-1">Members: {Array.isArray(group.members) ? group.members.length : 0}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] border border-cyan-400/30 bg-cyan-500/15 text-cyan-200">
              {group.status || 'forming'}
            </span>
          </div>
          {group?.scenario === 'join-existing' ? (
            <p className="text-[11px] text-amber-200 mt-1">{group?.currentBoardingHouseTag || 'Current boarding house'}</p>
          ) : (
            <p className="text-[11px] text-cyan-200 mt-1">{group?.plannedBoardingHouseTag || 'Planned boarding house'}</p>
          )}
          {Array.isArray(group.members) && group.members.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {group.members.slice(0, 6).map((member: any, index: number) => (
                <span key={`${group._id || group.id}-member-${index}`} className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-gray-200">
                  {member?.name || member?.email || 'Member'}
                </span>
              ))}
            </div>
          ) : null}

          {isCurrentUserAccepted ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11px] text-gray-300">
                Accepted members: <span className="text-cyan-200 font-semibold">{acceptedCount}</span>
              </p>
              <button
                type="button"
                onClick={() => handleStartGroupChat(group)}
                disabled={acceptedCount < 2}
                className="px-3 py-1.5 rounded text-[11px] font-semibold bg-cyan-500/20 border border-cyan-400/30 text-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Group Chat
              </button>
            </div>
          ) : null}

          {Array.isArray(group.members) && group.members.some((member: any) => {
            const memberId = String(member?.userId?._id || member?.userId || '');
            return member?.status === 'pending' && memberId === String(currentUserId);
          }) ? (
            <div className="mt-3 space-y-2">
              {group.members
                .filter((member: any) => {
                  const memberId = String(member?.userId?._id || member?.userId || '');
                  return member?.status === 'pending' && memberId === String(currentUserId);
                })
                .map((member: any, idx: number) => (
                  <div key={`${group._id || group.id}-pending-${idx}`} className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-300">Pending invite: {member?.name || member?.email || 'Member'}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleGroupInviteDecision(String(group._id || group.id), 'accepted')}
                        className="px-2 py-1 text-[10px] rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-200"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGroupInviteDecision(String(group._id || group.id), 'rejected')}
                        className="px-2 py-1 text-[10px] rounded bg-rose-500/20 border border-rose-400/30 text-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : null}
                      </>
                    );
                  })()}
        </div>
      )) : <p className="text-sm text-gray-400">No groups found.</p>}
    </div>
  );
  // ...existing code...

  // --- Render public listings at the top ---
  // You can move this section wherever you want in your layout
  // It will show public houses from the database for all users

  // ...existing code...

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Find Your Perfect Roommate</h2>
            <p className="text-gray-400 text-sm mt-1">
              Connect with students looking for roommates near SLIIT
            </p>
          </div>
          <div className="bg-cyan-500/20 px-3 py-1.5 rounded-full">
            <span className="text-cyan-300 text-sm font-semibold">{roommateData.length} Matches</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <FaUserFriends className="text-cyan-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">Active Students</p>
            <p className="text-white font-bold text-lg">{roommateData.length}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <FaHeart className="text-pink-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">Compatibility Rate</p>
            <p className="text-white font-bold text-lg">85%</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <FaMapMarkerAlt className="text-purple-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">Near Campus</p>
            <p className="text-white font-bold text-lg">2km</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <FaCalendarAlt className="text-orange-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">Available Now</p>
            <p className="text-white font-bold text-lg">{roommateData.length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="px-5 py-2 rounded-xl text-sm border bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-semibold shadow hover:from-cyan-500 hover:to-purple-500 transition-all mr-2"
        >
          Go to Student Dashboard
        </button>
        <button
          onClick={() => setActiveSection('browse')}
          className={`px-5 py-2 rounded-xl text-sm border ${activeSection === 'browse' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveSection('rooms')}
          className={`px-5 py-2 rounded-xl text-sm border ${activeSection === 'rooms' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}
        >
          Rooms & Houses
        </button>
        <button
          onClick={() => setActiveSection('sent')}
          className={`px-5 py-2 rounded-xl text-sm border ${activeSection === 'sent' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}
        >
          Sent ({sentItems.length})
        </button>
        <button
          onClick={() => setActiveSection('inbox')}
          className={`px-5 py-2 rounded-xl text-sm border ${activeSection === 'inbox' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}
        >
          Inbox ({inboxItems.length + conversations.length})
        </button>
        <button
          onClick={() => setActiveSection('groups')}
          className={`px-5 py-2 rounded-xl text-sm border ${activeSection === 'groups' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}
        >
          Groups ({groupItems.length})
        </button>
      </div>

      {activeSection === 'browse' && renderBrowseTab()}

      {activeSection === 'rooms' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-2">Rooms & Houses</h3>
          <PublicListings />
          {/* TODO: Insert your existing rooms rendering logic here if you have a separate rooms list */}
        </div>
      )}

      {activeSection !== 'browse' && (
        <div className="space-y-3">
          {activeSection === 'inbox' && tabErrorMessage ? (
            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {tabErrorMessage}
              {(tabErrorMessage.toLowerCase().includes('sign in') || tabErrorMessage.toLowerCase().includes('session')) ? (
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="ml-3 underline text-amber-100"
                >
                  Go to sign in
                </button>
              ) : null}
            </div>
          ) : null}
          {isTabLoading ? (
            <div className="text-center py-10 text-gray-400">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-300 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading {activeSection}...</p>
            </div>
          ) : activeSection === 'sent' ? (
            sentItems.length ? sentItems.map((item) => renderRequestCard(item, 'sent')) : <p className="text-sm text-gray-400">No sent requests found in database.</p>
          ) : activeSection === 'inbox' ? (
            inboxItems.length || conversations.length ? (
              <div className="space-y-3">
                {/* Roommate Requests Section */}
                {inboxItems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-300 mb-2 px-1">Roommate Requests ({inboxItems.length})</h3>
                    {inboxItems.map((item) => renderRequestCard(item, 'inbox'))}
                  </div>
                )}
                {/* Chat Conversations Section */}
                {conversations.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-300 mb-2 px-1">Chats ({conversations.length})</h3>
                    {conversations.map((conv) => renderConversationCard(conv))}
                  </div>
                )}
              </div>
            ) : <p className="text-sm text-gray-400">No inbox requests or messages found in database.</p>
          ) : (
            renderGroups()
          )}
        </div>
      )}

      {showRequestModal && selectedRoommate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedRoommate.image}
                    alt={selectedRoommate.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-white">Send Request</h2>
                    <p className="text-xs text-gray-400">to {selectedRoommate.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaTimes className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2">Message (Optional)</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Hi! I'm also looking for a roommate near SLIIT. Would you be interested in connecting?"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRequest}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// ...existing code...

// ---- TypeScript type/interface stubs ----
interface Listing {
  id: string | number;
  title: string;
  images: string[];
  price: number;
  location: string;
  distance: number;
  distanceUnit?: string;
  travelTime?: string;
  roomType: string;
  genderPreference?: string;
  availableFrom?: string;
  billsIncluded?: boolean;
  verified?: boolean;
  badges?: string[];
  description?: string;
  features?: string[];
  deposit?: number;
  roommateCount?: number;
  rating?: number;
  totalSpots?: number;
  occupancy?: number;
  totalRooms?: number;
  occupiedRooms?: number;
}

interface Roommate {
  id: string;
  userId: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  university: string;
  bio: string;
  image: string;
  interests: string[];
  mutualCount: number;
  role: string;
  compatibility?: number;
  availability?: string;
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

interface ListingCardProps {
  listing: Listing;
  onLike: () => void;
  onPass: () => void;
  onViewDetails: (listing: Listing) => void;
  isAnimating: boolean;
  direction: string | null;
  viewMode?: 'card' | 'grid';
}

interface DetailsModalProps {
  listing: Listing;
  onClose: () => void;
  onLike: () => void;
  onBooking: (listing: Listing) => void;
}

// ---- Utility functions ----
function getTravelIcon(distance: number) {
  return <FaWalking />;
}

function extractResponseArray(json: any): any[] {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

function saveReadNotificationIds(notifications: Notification[]) {}
function getStoredReadNotificationIds(): Set<string> { return new Set(); }

function normalizeIdValue(value: any): string {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return '';
}

function isMongoObjectId(value: unknown): boolean {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
}

function resolveValidRecipientId(roommate: Roommate | null | undefined): string {
  if (!roommate) return '';
  const candidateIds = [roommate.userId, roommate.id].map((value) => String(value || '').trim());
  return candidateIds.find((value) => isMongoObjectId(value)) || '';
}

function deriveProfileAge(profile: any): number {
  if (!profile) return 0;

  const directAge = Number(profile.age);
  if (Number.isFinite(directAge) && directAge > 0) {
    return Math.floor(directAge);
  }

  const dobRaw = profile.dateOfBirth || profile.dob || profile.birthDate;
  if (!dobRaw) return 0;

  const dob = new Date(dobRaw);
  if (Number.isNaN(dob.getTime())) return 0;

  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const beforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate());
  if (beforeBirthday) years -= 1;

  return years > 0 ? years : 0;
}

const roomImages = [
  'https://randomuser.me/api/portraits/lego/1.jpg',
  'https://randomuser.me/api/portraits/lego/2.jpg',
  'https://randomuser.me/api/portraits/lego/3.jpg',
];

const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');



// Ranked Result Card Component
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
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1 text-sm text-gray-300">
          <FaMapMarkerAlt className="text-pink-400 flex-shrink-0" />
          <span>{room.location}</span>
        </div>
      </div>
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

// Card View Component
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

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
  };

  const handleMouseLeave = () => {
    if (isDragging && cardRef.current) {
      cardRef.current.style.transition = '';
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '';
      setIsDragging(false);
    }
  };

  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString()}`;
  };

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
        <div className="relative h-56 overflow-hidden">
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            draggable="false"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {(listing.badges ?? []).map((badge: string) => (
              <span 
                key={badge} 
                className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                  badge === 'Verified' ? 'bg-green-500/90 text-white' : 
                  badge === 'New' ? 'bg-purple-500/90 text-white' : 
                  badge === 'Premium' ? 'bg-amber-500/90 text-white' :
                  badge === 'Popular' ? 'bg-pink-500/90 text-white' :
                  'bg-cyan-500/90 text-white'
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-white font-bold">{formatPrice(listing.price)}</span>
            <span className="text-gray-300 text-xs ml-1">/month</span>
          </div>
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
            <FaBed className="text-cyan-400 text-xs" />
            <span className="text-white text-xs">{listing.roomType}</span>
          </div>
        </div>
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
            <div className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
              <FaCalendarAlt className="text-orange-400" />
              <span>Available: {listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {listing.description}
          </p>
          <button
            onClick={() => onViewDetails(listing)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <FaInfoCircle />
            <span>View details</span>
          </button>
        </div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full md:hidden">
          Drag or tap buttons
        </div>
      </div>
    );
  }

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
          {(listing.badges ?? []).slice(0, 2).map((badge: string) => (
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

// Details Modal Component
const DetailsModal: React.FC<DetailsModalProps> = ({ listing, onClose, onLike, onBooking }) => {
  if (!listing) return null;

  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10">
        <div className="sticky top-0 bg-gradient-to-br from-[#181f36] to-[#0f172a] p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Room Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>
        
        <div className="p-4">
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
              <span className="text-white">{listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaMoneyBillWave className="text-yellow-400" />
              <span className="text-gray-300">Deposit:</span>
              <span className="text-white">{formatPrice(listing.deposit ?? 0)}</span>
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
              {(listing.features ?? []).map((feature: string, idx: number) => (
                <span key={idx} className="bg-white/10 px-2 py-1 rounded-full text-xs text-gray-300">
                  {feature}
                </span>
              ))}
            </div>
          </div>
          
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

// Advanced FiltersPanel Component
const FiltersPanel: React.FC<{
  filters: any;
  setters: any;
  onReset: () => void;
}> = ({ filters, setters, onReset }) => {
  const { priceMax, dist, room, avail, facs } = filters;
  const { setPriceMax, setDist, setRoom, setAvail, setFacs } = setters;

  const facilityOptions: { name: string; icon: React.ReactNode }[] = [
    { name: 'WiFi',         icon: <BiWifi size={22} /> },
    { name: 'Air-Cond',    icon: <BiWind size={22} /> },
    { name: 'Meals',       icon: <BiRestaurant size={22} /> },
    { name: 'Private Bath', icon: <BiShower size={22} /> },
    { name: 'Parking',     icon: <BiCar size={22} /> },
    { name: 'Laundry',     icon: <BiLoaderCircle size={22} /> },
    { name: 'Security',    icon: <BiShield size={22} /> },
    { name: 'Gym',         icon: <BiDumbbell size={22} /> },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
      </div>

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

// Student Payment Portal Content Component (simplified for brevity)
function StudentPaymentPortalContent({ bookingId }: { bookingId: string | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-cyan-900/40 via-purple-900/30 to-indigo-900/40 rounded-2xl p-6 border border-cyan-500/20">
        <h2 className="text-2xl font-bold text-white">Payment Portal</h2>
        <p className="text-gray-300 mt-2">Booking ID: {bookingId || 'N/A'}</p>
        <p className="text-gray-400 text-sm mt-4">Payment processing coming soon...</p>
      </div>
    </div>
  );
}








// Booking Form Component (advanced version)
const BookingForm: React.FC<{
  listing: Listing | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  currentUserName?: string;
  currentUserEmail?: string;
  currentUserImage?: string;
}> = ({ listing, onClose, onSubmit, currentUserName = '', currentUserEmail = '', currentUserImage = '' }) => {
  const [bookingType, setBookingType] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL');
  const [studentName, setStudentName] = useState(currentUserName);
  const [groupName, setGroupName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const listingTitle = listing?.title || 'N/A';
  const listingId = listing?.id || 'N/A';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    if (
      (bookingType === 'INDIVIDUAL' && !studentName) ||
      (bookingType === 'GROUP' && !groupName) ||
      !contactNumber ||
      !moveInDate ||
      !durationMonths
    ) {
      setFormError('Please fill all required fields.');
      return;
    }
    onSubmit({
      bookingType,
      studentName,
      groupName,
      contactNumber,
      moveInDate,
      durationMonths,
      specialNotes,
      listingId,
      listingTitle,
    });
    setSuccessMessage('Booking request submitted!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">Booking Form</h2>
        <p className="text-center text-gray-300 mb-8">Submit your room booking request</p>

        <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] border border-white/10 rounded-xl p-4 md:p-6 mb-6">
          <h3 className="text-lg font-semibold mb-1">Selected Room</h3>
          <p className="text-sm text-gray-300">{listingTitle} • ID: {listingId}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#181f36] to-[#0f172a] border border-white/10 rounded-xl p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setBookingType('INDIVIDUAL');
                setFormError('');
                setSuccessMessage('');
              }}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${bookingType === 'INDIVIDUAL'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'text-gray-300 hover:text-white'
              }`}
            >
              Individual Booking
            </button>
            <button
              type="button"
              onClick={() => {
                setBookingType('GROUP');
                setFormError('');
                setSuccessMessage('');
              }}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${bookingType === 'GROUP'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'text-gray-300 hover:text-white'
              }`}
            >
              Group Booking
            </button>
          </div>

          {bookingType === 'INDIVIDUAL' ? (
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full Name *</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Enter full name"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-300 mb-1">Group Name *</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="e.g. SLIIT Friends"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1">Contact Number *</label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="e.g. 0771234567"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Move-in Date *</label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Duration (months) *</label>
              <input
                type="number"
                min="1"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="e.g. 6"
              />
            </div>
          </div>

          {bookingType === 'INDIVIDUAL' && (
            <div>
              <label className="block text-sm text-gray-300 mb-1">Special Notes</label>
              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Any additional requests"
              />
            </div>
          )}

          {formError && <p className="text-red-400 text-sm text-center">{formError}</p>}
          {successMessage && <p className="text-green-400 text-sm text-center">{successMessage}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Submit Booking Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// React Router navigation
function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
      // State for details modal
      const [showDetails, setShowDetails] = useState(false);
      const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    // Filter chips for quick filtering
    const filterChips = [
      { id: 'budget', icon: <FaMoneyBillWave />, label: 'Budget' },
      { id: 'near', icon: <FaMapMarkerAlt />, label: 'Near' },
      { id: 'verified', icon: <FaCheckCircle />, label: 'Verified' },
      { id: 'single', icon: <FaBed />, label: 'Single' },
      { id: 'shared', icon: <FaUserFriends />, label: 'Shared' },
      { id: 'bills', icon: <FaBolt />, label: 'Bills' },
    ];
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('grid');
  const [activeTab, setActiveTab] = useState<'rooms' | 'map' | 'roommate'>('rooms');
  const [showBooking, setShowBooking] = useState<boolean>(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Listing | null>(null);

  // Insert missing state variables for search/filter/swipe logic
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<string | null>(null);
  const [likedListings, setLikedListings] = useState<Listing[]>([]);
  const [passedListings, setPassedListings] = useState<Listing[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
  const [isRoommatesLoading, setIsRoommatesLoading] = useState<boolean>(true);
  const [isListingsTimedOut, setIsListingsTimedOut] = useState<boolean>(false);
  const [listingsError, setListingsError] = useState<string>('');
  const [listingsLoadKey, setListingsLoadKey] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState('Guest');
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserImage, setCurrentUserImage] = useState('');
  const [popupNotification, setPopupNotification] = useState<Notification | null>(null);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const popupHideTimerRef = useRef<number | null>(null);
  const isFetchingNotifications = useRef(false);
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
      if (isFetchingNotifications.current) return;

      isFetchingNotifications.current = true;

      if (withLoader) {
        setIsNotificationsLoading(true);
      }

      try {
        const fetchNotificationItems = async (url: string, timeoutMs = 8000) => {
          const controller = new AbortController();
          const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
          try {
            const response = await fetch(url, {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
              cache: 'no-store',
            });
            const json = await response.json().catch(() => ({}));
            return response.ok ? extractResponseArray(json) : [];
          } finally {
            window.clearTimeout(timeout);
          }
        };

        const [inboxResult, sentResult, groupsResult, dbNotificationsResult] = await Promise.allSettled([
          fetchNotificationItems(`${API_BASE_URL}/api/roommates/request/inbox`),
          fetchNotificationItems(`${API_BASE_URL}/api/roommates/request/sent`),
          fetchNotificationItems(`${API_BASE_URL}/api/roommates/groups`),
          fetchNotificationItems(`${API_BASE_URL}/api/notifications`),
        ]);

        const inboxItems = inboxResult.status === 'fulfilled' ? inboxResult.value : [];
        const sentItems = sentResult.status === 'fulfilled' ? sentResult.value : [];
        const groupItems = groupsResult.status === 'fulfilled' ? groupsResult.value : [];
        const dbNotificationItems = dbNotificationsResult.status === 'fulfilled' ? dbNotificationsResult.value : [];

        const inboxNotifications: Notification[] = inboxItems.map((req: any) => {
          const senderName = req?.senderId?.fullName || req?.senderId?.email || 'A student';
          const type: Notification['type'] = req?.status === 'accepted'
            ? 'roommate_request_accepted'
            : req?.status === 'rejected'
            ? 'roommate_request_rejected'
            : 'roommate_request_received';

          return {
            id: `request-inbox-${req?._id || Math.random().toString(36).slice(2)}`,
            type,
            title: req?.status === 'accepted' ? 'Roommate Request Accepted' : 
                   req?.status === 'rejected' ? 'Roommate Request Rejected' : 
                   'New Roommate Request',
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

        const persistedNotifications: Notification[] = dbNotificationItems.map((item: any) => ({
          id: `db-notification-${item?._id || Math.random().toString(36).slice(2)}`,
          type: item?.type || 'other',
          title: item?.title || 'Notification',
          message: item?.message || '',
          timestamp: item?.createdAt || new Date().toISOString(),
          read: Boolean(item?.read),
          actionRequired: ['group_invite', 'group_invite_accepted', 'group_invite_rejected'].includes(String(item?.type || '')),
        }));

        const allNotifications = [...inboxNotifications, ...sentNotifications, ...groupNotifications, ...persistedNotifications].sort(
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
        // Keep existing notifications when network errors happen.
      } finally {
        isFetchingNotifications.current = false;
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

    let isMounted = true;
    let intervalId = 0;
    let delayId = 0;

    // Delay first poll by 4 seconds so page loads first
    delayId = window.setTimeout(() => {
      if (!isMounted) return;
      void fetchLatestNotifications(token, currentUserId, { withLoader: false, suppressPopup: false });
      intervalId = window.setInterval(() => {
        if (!isMounted) return;
        void fetchLatestNotifications(token, currentUserId, { withLoader: false, suppressPopup: false });
      }, 60000); // 60s interval
    }, 4000);

    return () => {
      isMounted = false;
      window.clearTimeout(delayId);
      window.clearInterval(intervalId);
    };
  }, [currentUserId]);

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
    setIsListingsLoading(true);
    setIsListingsTimedOut(false);
    setListingsError('');
    // Reduce loading timeout to 5 seconds
    const loadingTimeoutId = window.setTimeout(() => {
      if (!isCancelled) {
        setIsListingsTimedOut(true);
        setIsListingsLoading(false);
      }
    }, 5000);

    const loadSearchData = async () => {
      try {
        const token = localStorage.getItem('bb_access_token') || '';

<<<<<<< Updated upstream
        const fetchJsonWithTimeout = async (url: string, init?: RequestInit, timeoutMs = 8000) => {
          const controller = new AbortController();
          const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
          try {
            const response = await fetch(url, {
              ...init,
              signal: controller.signal,
              cache: 'no-store',
            });
            const json = await response.json().catch(() => ({}));
            return { ok: response.ok, json };
          } finally {
            window.clearTimeout(timeout);
          }
        };

        // Load rooms and me immediately (fast)
        const [roomsResult, meResult] = await Promise.allSettled([
          fetchJsonWithTimeout(`${API_BASE_URL}/api/roommates/rooms`, undefined, 12000),
          token
            ? fetchJsonWithTimeout(`${API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
              }, 10000)
            : Promise.resolve({ ok: false, json: null }),
        ]);

        if (isCancelled) return;

        const roomsOk = roomsResult.status === 'fulfilled' && roomsResult.value.ok;
        const roomsPayload = roomsOk ? roomsResult.value.json : {};

        // Handle /api/auth/me errors gracefully
        let mePayload = null;
        if (meResult.status === 'fulfilled') {
          if (meResult.value.ok) {
            mePayload = meResult.value.json;
          } else {
            // If 404 or error, treat as guest
            mePayload = null;
            setCurrentUserId('');
            setCurrentUserEmail('');
            setCurrentUserName('');
            setCurrentUserImage('');
          }
        }

        // Show page immediately after rooms load
        if (!isCancelled) {
          setIsListingsLoading(false);
          setIsListingsTimedOut(false);
        }

        // Load houses in background — non-blocking
        fetchJsonWithTimeout(`${API_BASE_URL}/api/owner/public/houses`, undefined, 16000)
          .then(({ ok, json }) => {
            if (!ok || isCancelled) return;
            const housesData = Array.isArray(json?.data) ? json.data
              : Array.isArray(json?.houses) ? json.houses
              : Array.isArray(json) ? json : [];
            const mappedHouses: Listing[] = housesData.map((house: any, index: number) => ({
              id: 100000 + index,
              title: house.name || 'Boarding House',
              images: Array.isArray(house.images) && house.images.length > 0 ? house.images
                : house.image ? [house.image] : [roomImages[index % roomImages.length]],
              price: Number(house.monthlyPrice) || 0,
              location: house.address || 'Unknown',
              distance: 1.2, distanceUnit: 'km', travelTime: 'Near city',
              roomType: house.roomType || 'Single Room',
              genderPreference: house.genderPreference || 'any',
              availableFrom: house.availableFrom || '',
              billsIncluded: false, verified: true,
              badges: [house.status === 'active' ? 'Available' : 'Occupied'],
              description: house.description || '',
              features: Array.isArray(house.features) ? house.features : [],
              deposit: Number(house.deposit) || Number(house.monthlyPrice || 0) * 2,
              roommateCount: Number(house.occupiedRooms) || 0,
              totalRooms: Number(house.totalRooms) || 0,
              occupiedRooms: Number(house.occupiedRooms) || 0,
            }));
            if (!isCancelled) setDbListings(prev => [...prev, ...mappedHouses]);
          })
          .catch(() => {});

        const roomsData = Array.isArray(roomsPayload?.data)
          ? roomsPayload.data
          : Array.isArray(roomsPayload?.rooms)
            ? roomsPayload.rooms
            : Array.isArray(roomsPayload)
              ? roomsPayload
              : [];

        const mappedRooms: Listing[] = roomsResult.status === 'fulfilled' && roomsResult.value.ok && roomsData.length > 0
          ? roomsData.map((roomItem: any, index: number) => ({
              id: index + 1,
              title: roomItem.name || 'Room Listing',
              images: Array.isArray(roomItem.images) && roomItem.images.length > 0
                ? roomItem.images
                : [roomImages[index % roomImages.length]],
=======
        // Use sessionStorage cache to avoid refetching same data
        const cacheKey = 'searchPageCache';
        const cachedData = sessionStorage.getItem(cacheKey);
        const now = Date.now();

        if (cachedData) {
          try {
            const { timestamp, data } = JSON.parse(cachedData);
            // Use cache if less than 5 minutes old
            if (now - timestamp < 5 * 60 * 1000) {
              if (!isCancelled) {
                setDbListings(data.listings);
                setDbRoommates(data.roommates);
                setCurrentUserId(data.currentUserId);
                setCurrentUserEmail(data.currentUserEmail);
                setCurrentUserName(data.currentUserName);
                if (data.currentUserImage) setCurrentUserImage(data.currentUserImage);
                setIsListingsLoading(false);
              }
              return;
            }
          } catch {
            sessionStorage.removeItem(cacheKey);
          }
        }

        // Helper function with timeout to prevent hanging
        const fetchWithTimeout = (url: string, options: any = {}, timeoutMs: number = 8000) => {
          return Promise.race([
            fetch(url, options).then(r => r.json()).catch(() => ({})),
            new Promise(resolve => setTimeout(() => resolve({}), timeoutMs))
          ]) as Promise<any>;
        };

        // Create all fetch promises immediately (parallel execution) with timeout
        const fetchPromises = [
          fetchWithTimeout(`${API_BASE_URL}/api/roommates/rooms`, {}, 8000),
          fetchWithTimeout(`${API_BASE_URL}/api/owner/public/houses`, {}, 8000),
          token ? fetchWithTimeout(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }, 8000) : Promise.resolve({}),
          token ? fetchWithTimeout(`${API_BASE_URL}/api/roommates/browse`, { headers: { Authorization: `Bearer ${token}` } }, 8000) : Promise.resolve({}),
        ];

        // Wait for all API calls to complete in parallel
        const [roomsJson, housesJson, meJson, roommateJson] = await Promise.all(fetchPromises);

        if (isCancelled) return;

        // Process rooms and houses
        const roomsData = Array.isArray(roomsJson?.data)
          ? roomsJson.data
          : (Array.isArray(roomsJson?.rooms) ? roomsJson.rooms : (Array.isArray(roomsJson) ? roomsJson : []));

        const housesData = Array.isArray(housesJson?.data)
          ? housesJson.data
          : (Array.isArray(housesJson?.houses) ? housesJson.houses : (Array.isArray(housesJson) ? housesJson : []));

        const availableRooms = roomsData.filter((roomItem: any) => {
          const totalSpots = Number(roomItem.totalSpots ?? roomItem.bedCount ?? 0);
          const occupancy = Number(roomItem.occupancy ?? 0);
          return totalSpots <= 0 || occupancy < totalSpots;
        });

        const availableHouses = housesData.filter((house: any) => {
          const totalRooms = Number(house.totalRooms ?? 0);
          const occupiedRooms = Number(house.occupiedRooms ?? 0);
          const isActive = (house.status || 'active') === 'active';
          return isActive && (totalRooms <= 0 || occupiedRooms < totalRooms);
        });

        const mappedRooms: Listing[] = availableRooms.length > 0
          ? availableRooms.map((roomItem: any, index: number) => ({
              id: index + 1,
              title: roomItem.name || 'Room Listing',
              images: Array.isArray(roomItem.images) && roomItem.images.length > 0 ? roomItem.images : [roomImages[index % roomImages.length]],
>>>>>>> Stashed changes
              price: Number(roomItem.price) || 0,
              location: roomItem.location || 'Unknown',
              distance: 1,
              distanceUnit: 'km',
              travelTime: 'Near campus',
              roomType: roomItem.roomType || 'Single Room',
              genderPreference: roomItem.genderPreference || 'Any',
              availableFrom: roomItem.availableFrom || '',
<<<<<<< Updated upstream
              billsIncluded: Array.isArray(roomItem.facilities)
                ? roomItem.facilities.includes('Meals')
                : false,
=======
              billsIncluded: Array.isArray(roomItem.facilities) ? roomItem.facilities.includes('Meals') : false,
>>>>>>> Stashed changes
              verified: true,
              badges: [roomItem.occupancy < roomItem.totalSpots ? 'Available' : 'Occupied'],
              description: roomItem.description || '',
              features: Array.isArray(roomItem.facilities) ? roomItem.facilities : [],
              deposit: Number(roomItem.deposit) || Number(roomItem.price || 0) * 2,
              roommateCount: Number(roomItem.occupancy) || 0,
<<<<<<< Updated upstream
              totalSpots: Number(roomItem.totalSpots) || 0,
              occupancy: Number(roomItem.occupancy) || 0,
            }))
          : [];

        if (!isCancelled) {
          setDbListings([...mappedRooms]);
          setIsListingsLoading(false);
          setIsListingsTimedOut(false);
        }

        const currentUser = mePayload?.data?.user || mePayload?.data || mePayload?.user || null;
        const resolvedUserId = String(currentUser?._id || currentUser?.id || '');

        if (!isCancelled && currentUser?.email) {
          setCurrentUserId(resolvedUserId);
=======
            }))
          : [];

        const mappedHouses: Listing[] = availableHouses.length > 0
          ? availableHouses.map((house: any, index: number) => ({
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

        const combinedListings = [...mappedRooms, ...mappedHouses];
        setDbListings(combinedListings);

        // Process user info
        const currentUser = meJson?.data || null;
        const currentInterests: string[] = Array.isArray(currentUser?.lifestylePrefs)
          ? currentUser.lifestylePrefs.map((i: string) => normalizeInterestToken(i))
          : [];

        if (currentUser?.email) {
          setCurrentUserId(String(currentUser._id || currentUser.id || ''));
>>>>>>> Stashed changes
          setCurrentUserEmail(currentUser.email);
          setCurrentUserName(currentUser.fullName || '');
          if (currentUser.profilePicture) {
            setCurrentUserImage(currentUser.profilePicture);
          }
        }
<<<<<<< Updated upstream

        if (token && !isCancelled) {
          if (resolvedUserId) {
            void fetchLatestNotifications(token, resolvedUserId, {
              withLoader: false,
              suppressPopup: true,
            });
          }

          // Start loading roommates
          if (!isCancelled) setIsRoommatesLoading(true);
=======

        // Fetch notifications in parallel with other data
        const resolvedUserId = String(currentUser?._id || currentUser?.id || '');
        if (token && resolvedUserId) {
          void fetchLatestNotifications(token, resolvedUserId, { withLoader: false, suppressPopup: true });
        }

        // Process roommates
        if (roommateJson?.success !== false) {
          const roommateData = Array.isArray(roommateJson?.data)
            ? roommateJson.data
            : (Array.isArray(roommateJson?.profiles) ? roommateJson.profiles : (Array.isArray(roommateJson) ? roommateJson : []));
>>>>>>> Stashed changes

          // Instant fallback: show last successful roommate list while fresh data loads.
          const cachedRoommatesRaw = localStorage.getItem('bb_roommates_cache');
          if (cachedRoommatesRaw && !isCancelled) {
            try {
              const cachedRoommates = JSON.parse(cachedRoommatesRaw);
              if (Array.isArray(cachedRoommates) && cachedRoommates.length > 0) {
                setDbRoommates(cachedRoommates);
                // Cache available, so loading is not needed anymore
                if (!isCancelled) setIsRoommatesLoading(false);
              }
            } catch {
              // Ignore invalid cache payloads.
            }
          }

          const roommateResult = await fetchJsonWithTimeout(`${API_BASE_URL}/api/roommates/browse`, {
            headers: { Authorization: `Bearer ${token}` },
          }, 10000);

          if (!isCancelled && roommateResult.ok) {
            const roommateData = Array.isArray(roommateResult.json?.data)
              ? roommateResult.json.data
              : Array.isArray(roommateResult.json?.profiles)
                ? roommateResult.json.profiles
                : Array.isArray(roommateResult.json)
                  ? roommateResult.json
                  : [];

<<<<<<< Updated upstream
            const mappedRoommates = roommateData
              .map((profile: any) => ({
                id: normalizeIdValue(profile._id || profile.id),
                userId: normalizeIdValue(profile.userId || profile._id || profile.id),
                name: profile.name || 'Student',
                email: profile.email || '',
                age: deriveProfileAge(profile),
                gender: profile.gender || 'Any',
                university: profile.boardingHouse || profile.academicYear || 'SLIIT',
                bio: profile.bio || profile.description || profile.about || profile.profileBio || 'No bio provided yet.',
                image: profile.image || profile.profilePicture || (Array.isArray(profile.profilePictures) ? profile.profilePictures[0] : '') || 'https://randomuser.me/api/portraits/lego/1.jpg',
                interests: Array.isArray(profile.tags) ? profile.tags : Array.isArray(profile.interests) ? profile.interests : [],
                mutualCount: Number(profile.mutualCount) || 0,
                role: profile.role || 'student',
              }));

            setDbRoommates(mappedRoommates);
            localStorage.setItem('bb_roommates_cache', JSON.stringify(mappedRoommates));
            if (!isCancelled) setIsRoommatesLoading(false);
          } else if (!isCancelled) {
            // Fetch failed or timed out, stop loading indicator
            setIsRoommatesLoading(false);
=======
          setDbRoommates(mappedRoommates);

          // Cache the data for 5 minutes
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              timestamp: now,
              data: {
                listings: combinedListings,
                roommates: mappedRoommates,
                currentUserId: String(currentUser?._id || currentUser?.id || ''),
                currentUserEmail: currentUser?.email || 'Guest',
                currentUserName: currentUser?.fullName || '',
                currentUserImage: currentUser?.profilePicture,
              },
            }));
          } catch {
            // Cache might be full, silently ignored
>>>>>>> Stashed changes
          }
        }
      } catch {
        setDbListings([]);
      } finally {
        window.clearTimeout(loadingTimeoutId);
        if (!isCancelled) {
          setIsListingsLoading(false);
        }
      }
    };

    loadSearchData();
    return () => {
      isCancelled = true;
      window.clearTimeout(loadingTimeoutId);
    };
  }, [fetchLatestNotifications, listingsLoadKey]);

  const effectiveListings = dbListings;
  const effectiveRoommates = dbRoommates;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean);

  const filteredListings: Listing[] = effectiveListings.filter(listing => {
    if (searchTerm && !listing.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !listing.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
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
  }));

  // Distance mapping for filtering
  const distMap: Record<string, number> = {
    '500m': 0.5,
    'walking': 1,
    'cycling': 2,
    'bus': 5,
    'any': 9999
  };

  const getFilteredRooms = () => {
    return roomDataset.filter((r: any) => {
      if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !r.location.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (r.price > priceMax) return false;
      if (dist !== 'any' && r.distKm > distMap[dist]) return false;
      if (room !== 'any' && r.roomType.toLowerCase() !== room.toLowerCase()) return false;
      if (avail === 'available' && !r.available) return false;
      if (avail === 'occupied' && r.available) return false;
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
    setCurrentIndex(0);
  };

  const handleViewDetails = (listing: Listing): void => {
    setSelectedListing(listing);
    setShowDetails(true);
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
          {!isListingsTimedOut ? (
            <p className="text-cyan-200 text-sm">Loading rooms and boarding data...</p>
          ) : (
            <div className="space-y-3">
              <p className="text-amber-200 text-sm">Loading is taking longer than expected.</p>
              <button
                onClick={() => {
                  setListingsLoadKey((prev) => prev + 1);
                  setIsListingsLoading(true);
                  setIsListingsTimedOut(false);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-300/40 text-cyan-100 text-sm hover:bg-cyan-500/30"
              >
                Retry loading data
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (listingsError && dbListings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] px-4">
        <div className="max-w-xl w-full text-center space-y-3 bg-white/5 border border-rose-400/30 rounded-xl p-6">
          <p className="text-rose-200 text-sm">Failed to load data: {listingsError}</p>
          <button
            onClick={() => {
              setListingsLoadKey((prev) => prev + 1);
              setIsListingsLoading(true);
              setIsListingsTimedOut(false);
              setListingsError('');
            }}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-300/40 text-cyan-100 text-sm hover:bg-cyan-500/30"
          >
            Retry loading data
          </button>
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
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
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className={`px-4 py-2 text-sm rounded-xl border transition ${location.pathname === '/student/dashboard' ? 'bg-cyan-500/25 border-cyan-300/50 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                >
                  Student Dashboard
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

                  {showNotifications && typeof document !== 'undefined' && createPortal(
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
                  )}
                </div>

                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  title="Open profile settings"
                >
                  <img src={currentUserImage || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt="User" className="w-7 h-7 rounded-full object-cover border border-cyan-400/40" />
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
                  setSortMode(e.target.value as any);
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

            {showFilters && (
              <div className="mt-4">
                <FiltersPanel
                  filters={{ priceMax, dist, room, avail, facs }}
                  setters={{ setPriceMax, setDist, setRoom, setAvail, setFacs }}
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

                  <div>
                    <div className="relative h-[500px] mb-4 perspective-1000">
                      {currentIndex < rankedListings.length - 1 && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl border border-white/10 shadow-xl transform translate-y-2 translate-x-1 scale-[0.98] opacity-30" />
                      )}
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
                    <div className="flex justify-center gap-4 mt-3">
                      <button
                        onClick={handlePass}
                        disabled={isAnimating}
                        className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <FaRegTimesCircle />
                      </button>
                      <button
                        onClick={handleLike}
                        disabled={isAnimating}
                        className="w-14 h-14 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <FaHeart />
                      </button>
                    </div>
                    <div className="flex justify-between px-8 mt-2 text-xs text-gray-500">
                      <span>Pass | Swipe Left</span>
                      <span>Like | Swipe Right</span>
                    </div>
                  </div>

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
                    {likedListings.length > 0 && (
                      <button className="w-full mt-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
                        View All Favorites
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
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
                              };
                              handleViewDetails(listing);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                        <FaSearch className="text-4xl text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">No rooms match your filters</p>
                        <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
              {viewMode === 'card' ? (
                <>
                  <div className="relative h-[500px] mb-4 perspective-1000 max-w-md mx-auto">
                    {currentIndex < rankedListings.length - 1 && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl border border-white/10 shadow-xl transform translate-y-2 translate-x-1 scale-[0.98] opacity-30" />
                    )}
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
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={handlePass}
                      disabled={isAnimating}
                      className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <FaRegTimesCircle />
                    </button>
                    <button
                      onClick={handleLike}
                      disabled={isAnimating}
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <FaHeart />
                    </button>
                  </div>
                  <div className="flex justify-between px-8 mt-2 text-xs text-gray-500 max-w-md mx-auto">
                    <span>Pass | Swipe Left</span>
                    <span>Like | Swipe Right</span>
                  </div>
                </>
              ) : (
                <>
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
          <RoommateFinderPlaceholder
            roommateData={effectiveRoommates}
            dbListings={dbListings}
            currentUserId={currentUserId}
            isRoommatesLoading={isRoommatesLoading}
            currentUserName={currentUserName}
            currentUserImage={currentUserImage}
            onToast={(msg) => {
              setToastMessage(msg);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }}
          />
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in-up z-50">
            <FaCheckCircle className="text-green-400" />
            <span className="text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedListing && (
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

        {/* Payment Portal Modal */}
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
                      setToastMessage(`Check-in date submitted: ${new Date(checkinDate).toLocaleDateString()}`);
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                      setShowCheckinForm(false);
                      setCheckinDate('');
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
      </div>

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
        .animate-swipe-left { animation: swipe-left 0.3s ease-out forwards; }
        .animate-swipe-right { animation: swipe-right 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translate(-50%, 20px); } 100% { opacity: 1; transform: translate(-50%, 0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
        .perspective-1000 { perspective: 1000px; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.5); }
      `}</style>
    </div>
  );
}

export default SearchPage;