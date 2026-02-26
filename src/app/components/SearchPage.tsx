import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { 
  FaMapMarkerAlt, FaStar, FaHeart, FaRegTimesCircle, FaInfoCircle,
  FaWalking, FaBicycle, FaBus, FaCar, FaBed, FaBolt, FaCheckCircle,
  FaUndo, FaFilter, FaSearch, FaTimes, FaUserFriends, FaCalendarAlt,
  FaMoneyBillWave, FaShare, FaArrowLeft, FaThLarge, FaList
} from 'react-icons/fa';
import { MdOutlineVerified, MdOutlineLocationOn, MdOutlineBedroomParent } from 'react-icons/md';
import { RiUserSharedLine } from 'react-icons/ri';
import { BiCurrentLocation } from 'react-icons/bi';

// Define types
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

  // Handle touch events for swiping (only in card mode)
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
        className={`
          relative bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-3xl shadow-2xl overflow-hidden
          border border-white/10 cursor-grab active:cursor-grabbing
          transition-all duration-300 hover:shadow-cyan-500/10
          ${direction === 'left' ? 'animate-swipe-left' : ''}
          ${direction === 'right' ? 'animate-swipe-right' : ''}
        `}
      >
        {/* Image Gallery with Overlay */}
        <div className="relative h-56 overflow-hidden">
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
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

        {/* Swipe Hint (only shown on first card) */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full md:hidden">
          ← Swipe or tap buttons →
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
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');

  // Filter listings based on search and filters
  const filteredListings: Listing[] = listings.filter(listing => {
    // Search filter
    if (searchTerm && !listing.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !listing.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Chip filters
    if (selectedFilters.includes('budget') && listing.price > 20000) return false;
    if (selectedFilters.includes('near') && listing.distance > 2) return false;
    if (selectedFilters.includes('verified') && !listing.verified) return false;
    if (selectedFilters.includes('single') && listing.roomType.includes('Shared')) return false;
    if (selectedFilters.includes('shared') && !listing.roomType.includes('Shared')) return false;
    if (selectedFilters.includes('bills') && !listing.billsIncluded) return false;
    
    return true;
  });

  const currentListing: Listing | undefined = filteredListings[currentIndex];

  const handleLike = (): void => {
    if (!currentListing || isAnimating) return;
    
    setIsAnimating(true);
    setDirection('right');
    
    setTimeout(() => {
      setLikedListings([...likedListings, currentListing]);
      setToastMessage(`Added to favorites! ✨`);
      setShowToast(true);
      
      setTimeout(() => {
        if (currentIndex < filteredListings.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(filteredListings.length);
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
        if (currentIndex < filteredListings.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(filteredListings.length);
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
  if (filteredListings.length === 0 || currentIndex >= filteredListings.length) {
    return (
      <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => window.history.back()}
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <FaArrowLeft className="text-white text-sm" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
              Find Your Room
            </h1>
          </div>
          
          {/* View Toggle - Desktop only */}
          <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Card view"
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
        </div>

        {/* Tip - Hide on desktop */}
        <div className="flex md:hidden items-center justify-center gap-2 mb-4">
          <FaInfoCircle className="text-cyan-400" />
          <span className="text-xs text-cyan-200 bg-cyan-900/60 px-3 py-1.5 rounded-full">
            Browse listings and find your perfect match
          </span>
        </div>

        {/* Search and Filters Section */}
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

            {/* Filter Button - Mobile only */}
            <button className="md:hidden w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
              <FaFilter />
              Filters
            </button>
          </div>

          {/* Filter Chips - Always visible */}
          <div className="flex flex-wrap gap-2 mt-4">
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
        </div>

        {/* Results Count & Undo */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">
            {filteredListings.length} rooms found
          </span>
          <button
            onClick={handleUndo}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <FaUndo /> Undo
          </button>
        </div>

        {/* Main Content - Different layouts for mobile and desktop */}
        <div className="md:hidden">
          {/* Mobile: Card Stack View */}
          <div className="relative h-[500px] mb-4 perspective-1000">
            {/* Stack effect - next card behind */}
            {currentIndex < filteredListings.length - 1 && (
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

          {/* Action Buttons - Mobile */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handlePass}
              disabled={isAnimating}
              className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              title="Not interested"
            >
              <FaRegTimesCircle />
            </button>
            
            <button
              onClick={handleLike}
              disabled={isAnimating}
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              title="Save this listing"
            >
              <FaHeart />
            </button>
          </div>

          {/* Action Labels - Mobile */}
          <div className="flex justify-between px-8 mt-2 text-xs text-gray-500">
            <span>Pass</span>
            <span>Like</span>
          </div>
        </div>

        {/* Desktop: Grid View */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
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
        </div>

        {/* Desktop Action Bar */}
        <div className="hidden md:flex justify-center gap-4 mt-8">
          <button
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FaHeart />
            View Favorites ({likedListings.length})
          </button>
        </div>

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
      `}</style>
    </div>
  );
}