import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaBed,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUserFriends,
  FaHeart,
  FaCheckCircle,
  FaStar,
  FaShieldAlt,
  FaWifi,
  FaSnowflake,
  FaUtensils,
  FaShower,
  FaCar,
  FaTshirt,
  FaLock,
  FaDumbbell,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

const BACKEND_URL = (((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5001')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <FaWifi />,
  'wi-fi': <FaWifi />,
  'air-cond': <FaSnowflake />,
  'air conditioning': <FaSnowflake />,
  meals: <FaUtensils />,
  'private bath': <FaShower />,
  parking: <FaCar />,
  laundry: <FaTshirt />,
  security: <FaLock />,
  gym: <FaDumbbell />,
};

function facilityIcon(name: string) {
  return FACILITY_ICONS[name.toLowerCase()] ?? null;
}

export default function ListingDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const listing = location.state?.listing as any | undefined;

  const [activeImg, setActiveImg] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingType, setBookingType] = useState<'individual' | 'group'>('individual');
  const [moveInDate, setMoveInDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('3');
  const [message, setMessage] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupSize, setGroupSize] = useState('2');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0a1124] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Listing not found.</p>
          <button
            onClick={() => navigate('/find')}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const images: string[] = listing.images?.length ? listing.images : [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=60',
  ];

  const prev = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveImg((i) => (i + 1) % images.length);

  const fmt = (n: number) => `Rs. ${n?.toLocaleString() ?? '—'}`;

  const handleBook = async () => {
    setFormError('');
    const roomMongoId = listing.mongoId || '';
    if (!roomMongoId) {
      setFormError('Room ID is missing. Please go back and select the room again.');
      return;
    }
    if (!moveInDate) {
      setFormError('Please select a move-in date.');
      return;
    }
    const token = localStorage.getItem('bb_access_token') || '';
    if (!token) {
      navigate('/signin');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        roomId: roomMongoId,
        bookingType,
        moveInDate,
        durationMonths: parseInt(durationMonths, 10),
        message: message || undefined,
      };
      if (bookingType === 'group') {
        payload.groupName = groupName;
        payload.groupSize = parseInt(groupSize, 10) || 2;
      }
      const res = await fetch(`${BACKEND_URL}/api/roommates/booking-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || 'Failed to submit booking request.');
      } else {
        setSuccessMsg('Booking request sent! The owner will review and get back to you.');
        setShowBooking(false);
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1124] text-white">
      {/* Top nav bar */}
      <div className="sticky top-0 z-30 bg-[#0a1124]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/find')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <FaArrowLeft className="text-xs" />
            Back to search
          </button>
          <button
            onClick={() => setLiked((v) => !v)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'}`}
          >
            <FaHeart className={liked ? 'fill-pink-400' : ''} />
            {liked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Image gallery */}
        <div className="relative rounded-2xl overflow-hidden bg-black/30 aspect-video">
          <img
            src={images[activeImg]}
            alt="Room"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <FaChevronLeft className="text-white text-sm" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <FaChevronRight className="text-white text-sm" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? 'bg-white w-4' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-0 right-0 p-3 flex gap-2">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-cyan-400' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: main info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {listing.verified && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <FaShieldAlt className="text-[10px]" /> Verified
                  </span>
                )}
                {listing.billsIncluded && (
                  <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">Bills included</span>
                )}
                {listing.badges?.map((b: string) => (
                  <span key={b} className="text-xs bg-white/5 text-gray-400 border border-white/10 px-2.5 py-1 rounded-full">{b}</span>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
              <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-sm">
                <FaMapMarkerAlt className="text-cyan-400 text-xs" />
                {listing.location}
                <span className="text-gray-600 mx-1">·</span>
                <span>{listing.distance} km from campus</span>
                {listing.travelTime && (
                  <>
                    <span className="text-gray-600 mx-1">·</span>
                    <span>{listing.travelTime}</span>
                  </>
                )}
              </div>
              {listing.rating != null && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-white font-medium">{Number(listing.rating).toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Key details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: <FaBed className="text-cyan-400" />, label: 'Room type', value: listing.roomType },
                { icon: <FaUserFriends className="text-purple-400" />, label: 'Gender preference', value: listing.genderPreference || 'Any' },
                { icon: <FaCalendarAlt className="text-orange-400" />, label: 'Available from', value: listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Now' },
                { icon: <FaMoneyBillWave className="text-green-400" />, label: 'Deposit', value: fmt(listing.deposit ?? 0) },
                { icon: <FaUserFriends className="text-blue-400" />, label: 'Roommates', value: listing.roommateCount === 0 ? 'None (Private)' : `${listing.roommateCount ?? '—'} others` },
                ...(listing.totalSpots ? [{ icon: <FaBed className="text-pink-400" />, label: 'Total spots', value: `${listing.occupancy ?? 0} / ${listing.totalSpots}` }] : []),
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-500">{icon}{label}</div>
                  <p className="text-sm text-white font-medium">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <>
                <div className="border-t border-white/5" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About this room</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{listing.description}</p>
                </div>
              </>
            )}

            {/* Features / facilities */}
            {listing.features?.length > 0 && (
              <>
                <div className="border-t border-white/5" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.features.map((f: string) => (
                      <span key={f} className="flex items-center gap-1.5 bg-white/5 border border-white/8 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                        <span className="text-cyan-400">{facilityIcon(f)}</span>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: pricing + CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
              <div>
                <p className="text-3xl font-bold text-white">{fmt(listing.price)}</p>
                <p className="text-gray-500 text-sm">per month</p>
              </div>

              {successMsg ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-300">
                  <FaCheckCircle className="inline mr-2" />{successMsg}
                </div>
              ) : showBooking ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Booking type</p>
                  <div className="flex rounded-lg overflow-hidden border border-white/10">
                    {(['individual', 'group'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setBookingType(t)}
                        className={`flex-1 py-2 text-xs font-medium transition-colors capitalize ${bookingType === t ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {bookingType === 'group' && (
                    <>
                      <input
                        placeholder="Group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Group size"
                        min={2}
                        value={groupSize}
                        onChange={(e) => setGroupSize(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                      />
                    </>
                  )}

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Move-in date</label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Duration (months)</label>
                    <select
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      {[1, 2, 3, 6, 12].map((m) => (
                        <option key={m} value={m} className="bg-gray-900">{m} month{m > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    placeholder="Message to owner (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />

                  {formError && <p className="text-xs text-red-400">{formError}</p>}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowBooking(false)}
                      className="flex-1 py-2.5 text-sm border border-white/10 rounded-xl text-gray-400 hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBook}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaCheckCircle />}
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowBooking(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <FaCheckCircle />
                  Book Now
                </button>
              )}

              {!showBooking && !successMsg && (
                <button
                  onClick={() => setLiked((v) => !v)}
                  className={`w-full py-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${liked ? 'border-pink-500/40 bg-pink-500/10 text-pink-400' : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'}`}
                >
                  <FaHeart />
                  {liked ? 'Saved to favourites' : 'Save'}
                </button>
              )}

              <p className="text-xs text-gray-600 text-center">No payment charged until booking is approved</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}