import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { 
  FaMapMarkerAlt, FaStar, FaHeart, FaRegTimesCircle, FaInfoCircle,
  FaWalking, FaBicycle, FaBus, FaCar, FaBed, FaBolt, FaCheckCircle,
  FaUndo, FaFilter, FaSearch, FaTimes, FaUserFriends, FaCalendarAlt,
  FaMoneyBillWave, FaShare, FaArrowLeft, FaThLarge, FaList,
  FaHistory, FaBookmark
} from 'react-icons/fa';
import { MdOutlineVerified, MdOutlineLocationOn, MdOutlineBedroomParent } from 'react-icons/md';
import { RiUserSharedLine } from 'react-icons/ri';
import { BiCurrentLocation } from 'react-icons/bi';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import FiltersPanel from './boarding/FiltersPanel';
import RoomCard from './boarding/RoomCard';
import { ROOMS, distMap, fi } from '../data/rooms';
>>>>>>> Stashed changes
=======
import FiltersPanel from './boarding/FiltersPanel';
import RoomCard from './boarding/RoomCard';
import { ROOMS, distMap, fi } from '../data/rooms';
>>>>>>> Stashed changes

<<<<<<< Updated upstream
// Roommate Finder navigation handler
// Roommate Finder tab content placeholder
// Mock roommate data
const roommates = [
  {
    id: 1,
    name: 'Ayesha Perera',
    age: 22,
    gender: 'Female',
    university: 'SLIIT',
    bio: 'Looking for a friendly roommate. Loves music and reading.',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    interests: ['Music', 'Reading', 'Cooking'],
  },
  {
    id: 2,
    name: 'Nimal Silva',
    age: 24,
    gender: 'Male',
    university: 'CINEC',
    bio: 'Clean, quiet, and respectful. Enjoys sports and movies.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    interests: ['Sports', 'Movies', 'Travel'],
  },
  {
    id: 3,
    name: 'Sajini Fernando',
    age: 21,
    gender: 'Female',
    university: 'NSBM',
    bio: 'Outgoing and social. Loves to cook and explore new places.',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    interests: ['Cooking', 'Travel', 'Dancing'],
  },
];
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes

// Mini Roommate Card for passed/favorites columns
const MiniRoommateCard: React.FC<{ roommate: Roommate; type: 'passed' | 'liked' }> = ({ roommate, type }) => {
=======
const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');

type FinderProfile = {
  id: string;
  userId?: string;
  name: string;
  age: number;
  gender: string;
  university: string;
  bio: string;
  image: string;
  interests: string[];
  budget: number;
  preferences: string;
  roomType?: string;
  availableFrom?: string;
  academicYear?: string;
  matchScore?: number;
};

// Mini Roommate Card for passed/favorites columns
const MiniRoommateCard: React.FC<{ roommate: FinderProfile; type: 'passed' | 'liked' }> = ({ roommate, type }) => {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

// Roommate swipe card component
<<<<<<< Updated upstream
function RoommateSwipeCard({ roommate, onLike, onPass, isAnimating, direction }: { roommate: any; onLike: () => void; onPass: () => void; isAnimating: boolean; direction: string | null }) {
=======
function RoommateSwipeCard({ roommate, onLike, onPass, isAnimating, direction }: { roommate: FinderProfile; onLike: () => void; onPass: () => void; isAnimating: boolean; direction: string | null }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

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

>>>>>>> Stashed changes
  return (
    <div
      className={`relative bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl shadow-2xl overflow-hidden border border-white/10 w-full max-w-md mx-auto transition-all duration-300 ${direction === 'left' ? 'animate-swipe-left' : ''} ${direction === 'right' ? 'animate-swipe-right' : ''}`}
      style={{ minHeight: 340 }}
    >
      <div className="flex flex-col items-center p-6">
        <img src={roommate.image} alt={roommate.name} className="w-24 h-24 rounded-full object-cover border-4 border-pink-300 mb-3" />
        <h3 className="text-xl font-bold text-white mb-1">{roommate.name}, <span className="text-pink-300">{roommate.age}</span></h3>
        <div className="text-xs text-cyan-300 mb-1 font-semibold">{roommate.matchScore ?? 0}% Match</div>
        <div className="text-sm text-pink-200 mb-1">{roommate.gender} • {roommate.university}</div>
        <div className="text-sm text-gray-300 mb-3 text-center">{roommate.bio}</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {roommate.interests.map((interest: string, idx: number) => (
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
function RoommateFinderPlaceholder() {
<<<<<<< Updated upstream
=======
  const navigate = useNavigate();
  const [roommateTab, setRoommateTab] = React.useState<'browse' | 'profile' | 'requests' | 'inbox' | 'groups'>('browse');
  const [roommates, setRoommates] = React.useState<FinderProfile[]>([]);
>>>>>>> Stashed changes
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [liked, setLiked] = React.useState<FinderProfile[]>([]);
  const [passed, setPassed] = React.useState<FinderProfile[]>([]);
  const [direction, setDirection] = React.useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);
<<<<<<< Updated upstream
=======
  const [loading, setLoading] = React.useState(false);
  const [finderError, setFinderError] = React.useState('');
  const [profileEdit, setProfileEdit] = React.useState(false);
  const [sentRequests, setSentRequests] = React.useState<any[]>([]);
  const [inboxRequests, setInboxRequests] = React.useState<any[]>([]);
  const [groups, setGroups] = React.useState<any[]>([]);
  const [myProfile, setMyProfile] = React.useState({
    budget: 12000,
    gender: 'Male',
    preferences: '',
    academicYear: '1st Year',
    roomType: 'Shared Room',
    availableFrom: new Date().toISOString().slice(0, 10),
    description: '',
  });

>>>>>>> Stashed changes
  const current = roommates[currentIdx];

  const authHeaders = () => {
    const token = localStorage.getItem('bb_access_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const parseProfile = (profile: any): FinderProfile => {
    const tags = Array.isArray(profile?.tags) ? profile.tags : [];
    return {
      id: String(profile?._id || profile?.id || ''),
      userId: profile?.userId ? String(profile.userId) : undefined,
      name: profile?.name || 'Unknown Student',
      age: 22,
      gender: profile?.gender || 'Other',
      university: profile?.boardingHouse || 'SLIIT',
      bio: profile?.description || 'Looking for a compatible roommate.',
      image: profile?.image || 'https://randomuser.me/api/portraits/lego/1.jpg',
      interests: tags,
      budget: Number(profile?.budget) || 12000,
      preferences: profile?.preferences || '',
      roomType: profile?.roomType || 'Shared Room',
      availableFrom: profile?.availableFrom ? new Date(profile.availableFrom).toISOString().slice(0, 10) : undefined,
      academicYear: profile?.academicYear || '',
      matchScore: 0,
    };
  };

  const calculateMatchScore = (
    candidate: FinderProfile,
    baseProfile: { budget: number; roomType: string; gender: string; preferences: string; availableFrom: string }
  ) => {
    let score = 45;

    const budgetDiff = Math.abs((candidate.budget || 0) - (baseProfile.budget || 0));
    if (budgetDiff <= 3000) score += 20;
    else if (budgetDiff <= 7000) score += 12;
    else if (budgetDiff <= 12000) score += 5;
    else score -= 8;

    if ((candidate.roomType || '').toLowerCase() === (baseProfile.roomType || '').toLowerCase()) {
      score += 18;
    }

    if (baseProfile.gender && baseProfile.gender !== 'Other' && candidate.gender === baseProfile.gender) {
      score += 7;
    }

    const myTokens = new Set(
      (baseProfile.preferences || '')
        .toLowerCase()
        .split(/[\s,]+/)
        .map((v) => v.trim())
        .filter((v) => v.length > 2)
    );

    const candidateTokens = new Set(
      [candidate.preferences, ...(candidate.interests || [])]
        .join(' ')
        .toLowerCase()
        .split(/[\s,]+/)
        .map((v) => v.trim())
        .filter((v) => v.length > 2)
    );

    let overlap = 0;
    myTokens.forEach((t) => {
      if (candidateTokens.has(t)) overlap += 1;
    });
    score += Math.min(15, overlap * 4);

    const myDate = baseProfile.availableFrom ? new Date(baseProfile.availableFrom).getTime() : NaN;
    const candidateDate = candidate.availableFrom ? new Date(candidate.availableFrom).getTime() : NaN;
    if (!Number.isNaN(myDate) && !Number.isNaN(candidateDate)) {
      const dayDiff = Math.abs(myDate - candidateDate) / (1000 * 60 * 60 * 24);
      if (dayDiff <= 14) score += 10;
      else if (dayDiff <= 30) score += 6;
      else if (dayDiff <= 60) score += 2;
    }

    return Math.max(1, Math.min(99, Math.round(score)));
  };

  const fetchJson = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body?.success) {
      throw new Error(body?.message || 'Request failed');
    }
    return body;
  };

  const loadFinderData = React.useCallback(async () => {
    const token = localStorage.getItem('bb_access_token');
    if (!token) {
      setFinderError('Please sign in to use Roommate Finder.');
      return;
    }

    try {
      setLoading(true);
      setFinderError('');

      const [browse, likedProfiles, sent, inbox, userGroups, profile] = await Promise.all([
        fetchJson(`${API_BASE_URL}/api/roommates/browse`, { headers: authHeaders() }),
        fetchJson(`${API_BASE_URL}/api/roommates/liked`, { headers: authHeaders() }),
        fetchJson(`${API_BASE_URL}/api/roommates/request/sent`, { headers: authHeaders() }),
        fetchJson(`${API_BASE_URL}/api/roommates/request/inbox`, { headers: authHeaders() }),
        fetchJson(`${API_BASE_URL}/api/roommates/groups`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/roommates/profile`, { headers: authHeaders() }),
      ]);

      setLiked((likedProfiles.data || []).filter(Boolean).map(parseProfile));
      setSentRequests(sent.data || []);
      setInboxRequests(inbox.data || []);
      setGroups(userGroups.data || []);

      let baseProfile = {
        budget: 12000,
        gender: 'Male',
        preferences: '',
        roomType: 'Shared Room',
        availableFrom: new Date().toISOString().slice(0, 10),
      };

      if (profile.ok) {
        const profileBody = await profile.json().catch(() => null);
        if (profileBody?.success && profileBody?.data) {
          const p = profileBody.data;
          const normalizedProfile = {
            budget: Number(p.budget) || 12000,
            gender: p.gender || 'Male',
            preferences: p.preferences || '',
            academicYear: p.academicYear || '1st Year',
            roomType: p.roomType || 'Shared Room',
            availableFrom: p.availableFrom ? new Date(p.availableFrom).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            description: p.description || '',
          };
          setMyProfile(normalizedProfile);
          baseProfile = {
            budget: normalizedProfile.budget,
            gender: normalizedProfile.gender,
            preferences: normalizedProfile.preferences,
            roomType: normalizedProfile.roomType,
            availableFrom: normalizedProfile.availableFrom,
          };
        }
      }

      const parsedBrowse: FinderProfile[] = (browse.data || []).map((profile: any) => parseProfile(profile));
      const rankedBrowse: FinderProfile[] = parsedBrowse
        .map((candidate) => ({
          ...candidate,
          matchScore: calculateMatchScore(candidate, baseProfile),
        }))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      setRoommates(rankedBrowse);
      setCurrentIdx(0);
    } catch (error) {
      setFinderError((error as Error).message || 'Failed to load roommate data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadFinderData();
  }, [loadFinderData]);

  const handleLike = async () => {
    if (!current || isAnimating) return;
<<<<<<< Updated upstream
    setIsAnimating(true);
    setDirection('right');
    setTimeout(() => {
      setLiked([...liked, current]);
      if (currentIdx < roommates.length - 1) {
        setCurrentIdx(currentIdx + 1);
      }
      setDirection(null);
      setIsAnimating(false);
    }, 250);
  };
  const handlePass = () => {
    if (!current || isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setTimeout(() => {
      setPassed([...passed, current]);
      if (currentIdx < roommates.length - 1) {
        setCurrentIdx(currentIdx + 1);
      }
      setDirection(null);
      setIsAnimating(false);
    }, 250);
  };
  const handleUndo = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setDirection(null);
    }
  };

  if (currentIdx >= roommates.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl border border-white/10 text-pink-200 text-lg font-semibold shadow-inner">
        <span className="mb-2 text-2xl">🎉</span>
        <div className="mb-1">No more roommate profiles!</div>
        <div className="text-sm text-pink-300 mt-2">Check back later for new matches.</div>
        <button onClick={handleUndo} className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl text-xs font-medium hover:shadow-lg transition-all">Undo</button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View - 3 Column Layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Passed Roommates */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <FaHistory className="text-red-400" />
              <h3 className="text-sm font-bold text-white">Passed</h3>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-auto">
                {passed.length}
              </span>
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
=======

    try {
      setIsAnimating(true);
      setDirection('right');

      await fetchJson(`${API_BASE_URL}/api/roommates/swipe`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ profileId: current.id, action: 'like' }),
      });

      if (current.userId) {
        await fetchJson(`${API_BASE_URL}/api/roommates/request/send`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            recipientId: current.userId,
            message: 'Hi! I think we would be great roommates. Interested in connecting?',
          }),
        });
      }

      setLiked((prev) => [...prev, current]);
      setSentRequests((prev) => [
        {
          _id: `local-${Date.now()}`,
          recipientId: { name: current.name, email: '' },
          message: 'Hi! I think we would be great roommates. Interested in connecting?',
          status: 'pending',
        },
        ...prev,
      ]);
      if (currentIdx < roommates.length - 1) {
        setCurrentIdx(currentIdx + 1);
      }
    } catch (error) {
      alert((error as Error).message || 'Failed to like profile');
    } finally {
      setTimeout(() => {
        setDirection(null);
        setIsAnimating(false);
      }, 250);
    }
  };

  const handlePass = async () => {
    if (!current || isAnimating) return;

    try {
      setIsAnimating(true);
      setDirection('left');
      await fetchJson(`${API_BASE_URL}/api/roommates/swipe`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ profileId: current.id, action: 'pass' }),
      });
      setPassed((prev) => [...prev, current]);
      if (currentIdx < roommates.length - 1) {
        setCurrentIdx(currentIdx + 1);
      }
    } catch (error) {
      alert((error as Error).message || 'Failed to pass profile');
    } finally {
      setTimeout(() => {
        setDirection(null);
        setIsAnimating(false);
      }, 250);
    }
  };

  const handleUndo = () => {
    alert('Undo is not available once a swipe is saved to the database.');
  };

  const handleRequestResponse = async (requestId: string, accept: boolean) => {
    try {
      await fetchJson(`${API_BASE_URL}/api/roommates/request/${requestId}/${accept ? 'accept' : 'reject'}`, {
        method: 'PATCH',
        headers: authHeaders(),
      });

      setInboxRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: accept ? 'accepted' : 'rejected' } : req
        )
      );
    } catch (error) {
      alert((error as Error).message || 'Failed to update request');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await fetchJson(`${API_BASE_URL}/api/roommates/profile`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          budget: Number(myProfile.budget),
          gender: myProfile.gender,
          academicYear: myProfile.academicYear,
          roomType: myProfile.roomType,
          availableFrom: myProfile.availableFrom,
          preferences: myProfile.preferences,
          description: myProfile.description,
          billsIncluded: false,
          tags: myProfile.preferences
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          lookingFor: myProfile.roomType,
        }),
      });

      setProfileEdit(false);
      alert('Profile saved successfully');
      loadFinderData();
    } catch (error) {
      alert((error as Error).message || 'Failed to save profile');
    }
  };

  const handleCreateGroup = async () => {
    const name = window.prompt('Enter group name');
    if (!name) return;

    try {
      await fetchJson(`${API_BASE_URL}/api/roommates/group`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name }),
      });
      await loadFinderData();
    } catch (error) {
      alert((error as Error).message || 'Failed to create group');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
        {[
          { id: 'browse', label: '🔍 Browse', icon: '🔍' },
          { id: 'profile', label: '👤 Profile', icon: '👤' },
          { id: 'requests', label: `📤 Sent (${sentRequests.length})`, icon: '📤' },
          { id: 'inbox', label: `📥 Inbox (${inboxRequests.filter((r) => r.status === 'pending').length})`, icon: '📥' },
          { id: 'groups', label: `👥 Groups (${groups.length})`, icon: '👥' },
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

      {finderError && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm px-3 py-2">
          {finderError}
        </div>
      )}

      {loading && <p className="text-sm text-gray-400">Loading roommate data...</p>}

      {/* BROWSE TAB */}
      {roommateTab === 'browse' && (
        <>
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Passed Roommates */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <FaHistory className="text-red-400" />
                  <h3 className="text-sm font-bold text-white">Passed</h3>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-auto">{passed.length}</span>
>>>>>>> Stashed changes
                </div>
              )}
            </div>
          </div>

          {/* Center Column - Main Swipe Card */}
          <div>
            <div className="relative h-[500px] mb-4 perspective-1000">
              {/* Stack effect - next card behind */}
              {currentIdx < roommates.length - 1 && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl border border-white/10 shadow-xl transform translate-y-2 translate-x-1 scale-[0.98] opacity-30" />
              )}
              
              {/* Current Card */}
              {current && (
                <RoommateSwipeCard
                  roommate={current}
                  onLike={handleLike}
                  onPass={handlePass}
                  isAnimating={isAnimating}
                  direction={direction}
                />
<<<<<<< Updated upstream
              )}
=======
                <div className="flex justify-between w-full max-w-md mt-4 px-4">
                  <span className="text-xs text-gray-400">{Math.max(0, roommates.length - currentIdx)} profiles left</span>
                  <button onClick={handleUndo} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
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

      {/* PROFILE TAB */}
      {roommateTab === 'profile' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">My Roommate Profile</h3>
            <button
              onClick={() => setProfileEdit(!profileEdit)}
              className="px-4 py-2 bg-cyan-500/30 border border-cyan-500 text-cyan-300 rounded-lg hover:bg-cyan-500/50 text-xs font-semibold"
            >
              {profileEdit ? 'Done' : 'Edit'}
            </button>
          </div>
          <div className="space-y-3">
            {profileEdit ? (
              <>
                <div>
                  <label className="text-sm text-gray-300">Budget (Rs.)</label>
                  <input type="number" value={myProfile.budget} onChange={(e) => setMyProfile({...myProfile, budget: Number(e.target.value)})} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white mt-1" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Gender</label>
                  <select value={myProfile.gender} onChange={(e) => setMyProfile({...myProfile, gender: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white mt-1">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-300">Academic Year</label>
                  <select value={myProfile.academicYear} onChange={(e) => setMyProfile({...myProfile, academicYear: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white mt-1">
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-300">Preferred Room Type</label>
                  <select value={myProfile.roomType} onChange={(e) => setMyProfile({...myProfile, roomType: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white mt-1">
                    <option>Single Room</option>
                    <option>Shared Room</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-300">Available From</label>
                  <input type="date" value={myProfile.availableFrom} onChange={(e) => setMyProfile({...myProfile, availableFrom: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white mt-1" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Description</label>
                  <textarea value={myProfile.description} onChange={(e) => setMyProfile({...myProfile, description: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white mt-1" rows={2} />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Preferences</label>
                  <textarea value={myProfile.preferences} onChange={(e) => setMyProfile({...myProfile, preferences: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white mt-1" placeholder="e.g., Early riser, non-smoker" rows={2} />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-semibold"
                >
                  Save Profile
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-300"><span className="text-gray-400">Budget:</span> Rs. {myProfile.budget.toLocaleString()}</p>
                <p className="text-gray-300"><span className="text-gray-400">Gender:</span> {myProfile.gender}</p>
                <p className="text-gray-300"><span className="text-gray-400">Academic Year:</span> {myProfile.academicYear}</p>
                <p className="text-gray-300"><span className="text-gray-400">Room Type:</span> {myProfile.roomType}</p>
                <p className="text-gray-300"><span className="text-gray-400">Preferences:</span> {myProfile.preferences || 'Not specified'}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* SENT REQUESTS TAB */}
      {roommateTab === 'requests' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Requests Sent</h3>
          <div className="space-y-3">
            {sentRequests.length > 0 ? (
              sentRequests.map((req) => (
                <div key={req._id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="" className="w-12 h-12 rounded-full object-cover border border-pink-400" />
                    <div>
                      <p className="text-white font-semibold">{req.recipientId?.fullName || req.recipientId?.name || 'User'}</p>
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
                <div key={req._id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="" className="w-12 h-12 rounded-full object-cover border border-pink-400" />
                      <div>
                        <p className="text-white font-semibold">{req.senderId?.fullName || req.senderId?.name || 'User'}</p>
                        <p className="text-xs text-gray-400">{req.senderId?.email || ''}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${req.status === 'pending' ? 'bg-yellow-900/50 text-yellow-200' : req.status === 'accepted' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-3 text-sm">{req.message}</p>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRequestResponse(req._id, true)} className="flex-1 px-3 py-2 bg-green-600/30 border border-green-600 text-green-300 rounded-lg hover:bg-green-600/50 text-xs font-semibold">
                        Accept
                      </button>
                      <button onClick={() => handleRequestResponse(req._id, false)} className="flex-1 px-3 py-2 bg-red-600/30 border border-red-600 text-red-300 rounded-lg hover:bg-red-600/50 text-xs font-semibold">
                        Decline
                      </button>
                    </div>
                  )}
                  {req.status === 'accepted' && (
                    <button
                      onClick={() => navigate('/chat', { state: { selectedRoommate: req.senderId, chatType: 'direct-message' } })}
                      className="w-full px-3 py-2 bg-cyan-600/30 border border-cyan-600 text-cyan-300 rounded-lg hover:bg-cyan-600/50 text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      💬 Start Chat
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
              onClick={handleCreateGroup}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            >
              <FaPlus size={16} />
              Create Group
            </button>
          </div>
          
          {groups.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-6 border border-cyan-500/30">
                <h4 className="text-white font-semibold mb-4">Your Groups ({groups.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {groups.map((group) => (
                    <div key={group._id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                      <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt={group.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{group.name}</p>
                        <p className="text-gray-400 text-xs">{group.members?.length || 0} members • {group.status}</p>
                      </div>
                      <FaCheckCircle className="text-green-400" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Manage your roommate groups in real-time from the database.
                </p>
                <button 
                  onClick={handleCreateGroup}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <FaUserFriends size={18} />
                  Create New Group
                </button>
              </div>
>>>>>>> Stashed changes
            </div>
            
            {/* Results Count & Undo */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-400">
                {roommates.length - currentIdx} profiles remaining
              </span>
              <button
                onClick={handleUndo}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <FaUndo /> Undo
              </button>
            </div>
          </div>

          {/* Right Column - Liked Roommates */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <FaBookmark className="text-green-400" />
              <h3 className="text-sm font-bold text-white">Favorites</h3>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-auto">
                {liked.length}
              </span>
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
            
            {/* View All Button */}
            {liked.length > 0 && (
              <button className="w-full mt-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
                View All Favorites
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View - Single Card */}
      <div className="md:hidden flex flex-col items-center justify-center min-h-[400px]">
        <RoommateSwipeCard
          roommate={current}
          onLike={handleLike}
          onPass={handlePass}
          isAnimating={isAnimating}
          direction={direction}
        />
        <div className="flex justify-between w-full max-w-md mt-4 px-4">
          <span className="text-xs text-gray-400">{roommates.length - currentIdx} profiles left</span>
          <button onClick={handleUndo} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><FaUndo /> Undo</button>
        </div>
      </div>
    </>
  );
}

// Placeholder for Map View
function MapViewPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl border border-white/10 text-cyan-200 text-lg font-semibold shadow-inner">
      <span className="mb-2">🗺️</span>
      Map View coming soon...
    </div>
  );
}

// Define types
interface Roommate {
  id: number;
  name: string;
  age: number;
  gender: string;
  university: string;
  bio: string;
  image: string;
  interests: string[];
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
}

type SearchRoom = (typeof ROOMS)[number];

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
const RankedResultCard: React.FC<{ room: (typeof ROOMS)[number]; onOpen: (id: number) => void }> = ({ room, onOpen }) => {
  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString()}/mo`;
  };

  const stars = '★'.repeat(Math.floor(room.rating)) + (room.rating % 1 >= 0.5 ? '½' : '');

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
          className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
            room.available
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {room.available ? '✅ Available' : '❌ Occupied'}
        </span>

        {/* Facilities Tags */}
        {room.facilities.slice(0, 3).map((fac, idx) => (
          <span
            key={idx}
            className="px-2 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 flex-shrink-0"
          >
            {fi(fac)}
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
            <span>{listing.location} • {listing.distance}km from SLIIT</span>
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
          ← Drag or tap buttons →
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
          <span className="mx-1">•</span>
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

const DetailsModal: React.FC<DetailsModalProps> = ({ listing, onClose, onLike }) => {
  if (!listing) return null;

  const formatPrice = (price: number): string => {
    return `Rs. ${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10">
        {/* Header */}
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
  );
};

export default function SearchPage() {
  const navigate = useNavigate();
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
  
  // Advanced filter states
  const [priceMax, setPriceMax] = useState<number>(50000);
  const [dist, setDist] = useState<string>('any');
  const [room, setRoom] = useState<string>('any');
  const [avail, setAvail] = useState<string>('all');
  const [facs, setFacs] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [sortMode, setSortMode] = useState<'discovery' | 'relevance' | 'price-low' | 'price-high' | 'distance'>('discovery');
  const [roomsData, setRoomsData] = useState<SearchRoom[]>([]);
  const [roomsLoadError, setRoomsLoadError] = useState<string>('');

  const parseDistanceKm = (text: string): number => {
    const match = text.match(/(\d+(?:\.\d+)?)\s*km/i);
    if (!match) {
      return 1;
    }
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : 1;
  };

  const getVacancyStatus = (totalRooms: number, occupiedRooms: number): 'available' | 'low' | 'full' => {
    const available = Math.max(0, totalRooms - occupiedRooms);
    if (available === 0) return 'full';
    if (available <= 2) return 'low';
    return 'available';
  };

  const mapSearchRoomToListing = (roomItem: SearchRoom): Listing => ({
    id: roomItem.id,
    title: roomItem.name,
    images: [roomItem.img],
    price: roomItem.price,
    location: roomItem.location,
    distance: roomItem.distKm,
    distanceUnit: 'km',
    travelTime: roomItem.distKm < 1 ? `${Math.round(roomItem.distKm * 1000)}m walk` : `${roomItem.distKm}km from ${roomItem.campus}`,
    roomType: roomItem.roomType,
    genderPreference: 'Any',
    availableFrom: new Date().toISOString(),
    billsIncluded: roomItem.facilities.includes('Meals'),
    verified: true,
    badges: roomItem.available ? ['Available'] : ['Occupied'],
    description: roomItem.desc,
    features: roomItem.facilities,
    deposit: roomItem.price * 2,
    roommateCount: roomItem.roomType.toLowerCase().includes('sharing') || roomItem.roomType.toLowerCase().includes('shared') ? 2 : 0,
    vacancy: roomItem.vacancy,
    totalRooms: roomItem.totalRooms,
    occupiedRooms: roomItem.occupiedRooms,
  });

  useEffect(() => {
    let isMounted = true;

    const loadSearchData = async () => {
      try {
        setRoomsLoadError('');

        const [roomsResponse, housesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/roommates/rooms`),
          fetch(`${API_BASE_URL}/api/owner/public/houses`),
        ]);

        const mappedRooms: SearchRoom[] = [];

        if (roomsResponse.ok) {
          const roomBody = await roomsResponse.json();
          const roomData = Array.isArray(roomBody?.data) ? roomBody.data : [];

          roomData.forEach((item: any, index: number) => {
            const totalRooms = Number(item.totalSpots) || Number(item.bedCount) || 1;
            const occupiedRooms = Number(item.occupancy) || 0;
            const distKm = parseDistanceKm(String(item.location || ''));
            const firstImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '';

            mappedRooms.push({
              id: index + 1,
              name: item.name || `Room ${item.roomNumber || index + 1}`,
              location: item.location || 'Near SLIIT',
              campus: 'SLIIT',
              distKm,
              price: Number(item.price) || 0,
              roomType: item.roomType || 'Single Room',
              facilities: Array.isArray(item.facilities) ? item.facilities : [],
              available: occupiedRooms < totalRooms,
              rating: 4.5,
              reviews: 0,
              owner: item.owner || 'Owner',
              img: firstImage || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              desc: item.description || 'Comfortable room near campus.',
              vacancy: getVacancyStatus(totalRooms, occupiedRooms),
              totalRooms,
              occupiedRooms,
            });
          });
        }

        if (housesResponse.ok) {
          const houseBody = await housesResponse.json();
          const houseData = Array.isArray(houseBody?.data) ? houseBody.data : [];

          houseData.forEach((item: any, index: number) => {
            const totalRooms = Number(item.totalRooms) || 1;
            const occupiedRooms = Number(item.occupiedRooms) || 0;
            const distKm = parseDistanceKm(String(item.address || ''));
            const imageFromList = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '';
            const monthlyPrice = Number(item.monthlyPrice) || Number(item.deposit) || 0;

            mappedRooms.push({
              id: mappedRooms.length + index + 1,
              name: item.name || `Boarding House ${index + 1}`,
              location: item.address || 'Near SLIIT',
              campus: 'SLIIT',
              distKm,
              price: monthlyPrice,
              roomType: item.roomType || 'Single Room',
              facilities: Array.isArray(item.features) ? item.features : [],
              available: occupiedRooms < totalRooms,
              rating: Number(item.rating) || 4.5,
              reviews: Number(item.totalReviews) || 0,
              owner: 'Owner',
              img: item.image || imageFromList || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              desc: item.description || 'Boarding house listing.',
              vacancy: getVacancyStatus(totalRooms, occupiedRooms),
              totalRooms,
              occupiedRooms,
            });
          });
        }

        if (!isMounted) return;

        setRoomsData(mappedRooms);
        if (mappedRooms.length === 0) {
          setRoomsLoadError('No listings found in the database yet.');
        }
      } catch (error) {
        if (!isMounted) return;
        setRoomsData([]);
        setRoomsLoadError((error as Error).message || 'Failed to load listings from database.');
      }
    };

    loadSearchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean);
  const listingsFromDatabase: Listing[] = roomsData.map(mapSearchRoomToListing);

  // Filter listings based on search and advanced filters
  const filteredListings: Listing[] = listingsFromDatabase.filter(listing => {
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

  // Filter ROOMS data based on advanced filters
  const getFilteredRooms = () => {
<<<<<<< Updated upstream
    return ROOMS.filter(r => {
=======
    return roomsData.filter((r: SearchRoom) => {
>>>>>>> Stashed changes
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
      if (facs.length > 0 && !facs.every(f => r.facilities.map(fac => fac.toLowerCase()).includes(f.toLowerCase()))) {
        return false;
      }
      
      // Rating
      if (rating > 0 && r.rating < rating) return false;
      
      return true;
    });
  };
  
  const filteredRooms = getFilteredRooms();
<<<<<<< Updated upstream
  const roomScore = (roomItem: typeof ROOMS[number]): number => {
=======
  
  const roomScore = (roomItem: SearchRoom): number => {
>>>>>>> Stashed changes
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
      setToastMessage(`Added to favorites! ✨`);
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

  // Empty state
  if (rankedListings.length === 0 || currentIndex >= rankedListings.length) {
    return (
      <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <FaArrowLeft className="text-white text-sm" />
            </button>
            <h1 className="text-xl font-bold text-white">Find Your Boarding</h1>
          </div>

          <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl p-8 text-center border border-white/10 shadow-2xl max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <FaSearch className="text-4xl text-cyan-400" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">No More Listings</h2>
            
            {selectedFilters.length > 0 ? (
              <>
                <p className="text-gray-400 text-sm mb-6">
                  Try adjusting your filters to see more rooms
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Clear All Filters
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-6">
                  You've seen all available rooms. Check back later for new listings!
                </p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Go to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col items-center w-full mb-6">
          <div className="flex items-center gap-3 mb-4 w-full md:max-w-3xl md:mx-auto">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <FaArrowLeft className="text-white text-sm" />
            </button>
            <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent flex-1 text-center">
              Find Your Room
            </h1>
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
                Roommate Finder
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
                  ? 'Drag cards left/right to pass or like • Click buttons to act' 
                  : 'Browse all listings in grid view')
              : activeTab === 'map'
                ? 'View all rooms on a map (coming soon)'
                : 'Find your ideal roommate!'}
          </span>
        </div>

        {activeTab === 'rooms' && roomsLoadError && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {roomsLoadError}
          </div>
        )}

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
                    facs,
                    rating
                  }}
                  setters={{
                    setPriceMax,
                    setDist,
                    setRoom,
                    setAvail,
                    setFacs,
                    setRating
                  }}
                  onReset={() => {
                    setPriceMax(50000);
                    setDist('any');
                    setRoom('any');
                    setAvail('all');
                    setFacs([]);
                    setRating(0);
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
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-auto">
                        {passedListings.length}
                      </span>
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
                  </div>

                  {/* Right Column - Liked Listings */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <FaBookmark className="text-green-400" />
                      <h3 className="text-sm font-bold text-white">Favorites</h3>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-auto">
                        {likedListings.length}
                      </span>
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
                              setToastMessage(`Added to favorites! ✨`);
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
                      {(priceMax < 50000 || dist !== 'any' || room !== 'any' || avail !== 'all' || facs.length > 0 || rating > 0) && (
                        <button
                          onClick={() => {
                            setPriceMax(50000);
                            setDist('any');
                            setRoom('any');
                            setAvail('all');
                            setFacs([]);
                            setRating(0);
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
                              // Convert room to listing format for details modal
<<<<<<< Updated upstream
                              const r = ROOMS.find(rm => rm.id === id);
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
                                roommateCount: r.roomType.toLowerCase().includes('sharing') ? 2 : 0
                              };
                              handleViewDetails(listing);
=======
                              const r = roomsData.find((rm) => rm.id === id);
                              if (!r) return;
                              handleViewDetails(mapSearchRoomToListing(r));
>>>>>>> Stashed changes
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
                    <span>Pass • Swipe Left</span>
                    <span>Like • Swipe Right</span>
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
                              setToastMessage(`Added to favorites! ✨`);
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
<<<<<<< Updated upstream
                              const r = ROOMS.find(rm => rm.id === id);
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
                                roommateCount: r.roomType.toLowerCase().includes('sharing') ? 2 : 0
                              };
                              handleViewDetails(listing);
=======
                              const r = roomsData.find((rm) => rm.id === id);
                              if (!r) return;
                              handleViewDetails(mapSearchRoomToListing(r));
>>>>>>> Stashed changes
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
          <RoommateFinderPlaceholder />
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
          />
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