import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Calendar, DollarSign, CheckCircle, XCircle, Clock, 
  Upload, Download, AlertTriangle, ArrowRight, FileText,
  MapPin, User, Phone, Mail, Star, Heart, TrendingUp
} from 'lucide-react';

// Types
interface BookingStatus {
  id: string;
  roomTitle: string;
  roomImage: string;
  roomPrice: number;
  location: string;
  moveInDate: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  paymentStatus?: 'not_uploaded' | 'uploaded' | 'verified' | 'rejected';
  paymentSlipUrl?: string;
  receiptUrl?: string;
  rejectionReason?: string;
  ownerName?: string;
  ownerContact?: string;
}

const mockBookingStatus: BookingStatus = {
  id: 'BK002',
  roomTitle: 'Modern Boarding House near SLIIT',
  roomImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  roomPrice: 18000,
  location: 'Malabe, Colombo',
  moveInDate: '2026-04-01',
  duration: 6,
  status: 'approved',
  submittedDate: '2026-03-01',
  paymentStatus: 'not_uploaded',
  ownerName: 'Mr. Perera',
  ownerContact: '+94 77 111 2222'
};

const savedRooms = [
  {
    id: 1,
    title: 'Cozy Room with Balcony',
    image: 'https://images.unsplash.com/photo-1598928506911-5c200b0e2f4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 15000,
    location: 'Kaduwela',
    rating: 4.2
  },
  {
    id: 2,
    title: 'Budget Student Dormitory',
    image: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 8500,
    location: 'Malabe',
    rating: 4.0
  }
];

export default function StudentBookingDashboard() {
  const navigate = useNavigate();
  const [booking] = useState<BookingStatus>(mockBookingStatus);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmitPayment = () => {
    if (!uploadedFile) {
      alert('Please select a file to upload');
      return;
    }
    // Simulate upload
    alert('Payment slip uploaded successfully! Owner will verify it soon.');
    setShowUploadModal(false);
    setUploadedFile(null);
    // Navigate to student payment page
    navigate('/student-payment');
  };

  // Get status display
  const getStatusBadge = () => {
    switch (booking.status) {
      case 'pending':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/30 border border-amber-500/30 rounded-lg">
            <Clock size={18} className="text-amber-400" />
            <span className="text-amber-400 font-semibold">Awaiting Owner Review</span>
          </div>
        );
      case 'approved':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg">
            <CheckCircle size={18} className="text-green-400" />
            <span className="text-green-400 font-semibold">Booking Approved!</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-lg">
            <XCircle size={18} className="text-red-400" />
            <span className="text-red-400 font-semibold">Booking Rejected</span>
          </div>
        );
    }
  };

  const getPaymentStatusSection = () => {
    if (booking.status !== 'approved') return null;

    switch (booking.paymentStatus) {
      case 'not_uploaded':
        return (
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Upload size={24} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Upload Payment Slip</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Your booking has been approved! Please upload your payment slip to confirm your booking.
                </p>
                <div className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-3 mb-4">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Payment Details:</p>
                  <p className="text-white text-sm">Amount: Rs. {booking.roomPrice.toLocaleString()}</p>
                  <p className="text-gray-300 text-xs mt-1">Please transfer to owner's account and upload the receipt</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Upload size={18} />
                  Upload Payment Slip
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'uploaded':
        return (
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={24} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Payment Under Review</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Your payment slip has been uploaded successfully. The owner is reviewing it now.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-300">
                  <FileText size={16} />
                  <span>Payment slip uploaded on {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'verified':
        return (
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Payment Verified!</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Congratulations! Your payment has been verified and your booking is confirmed.
                </p>
                <button
                  onClick={() => window.open(booking.receiptUrl, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Download size={18} />
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'rejected':
        return (
          <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <XCircle size={24} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Payment Slip Rejected</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Your payment slip was rejected by the owner. Please upload a new one.
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Upload size={18} />
                  Re-upload Payment Slip
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            My Booking Dashboard
          </h1>
          <p className="text-gray-400">Track your booking status and manage payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Booking Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Booking */}
            <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] border border-white/10 rounded-2xl overflow-hidden">
              {/* Room Image */}
              <div className="relative h-48 md:h-64">
                <img 
                  src={booking.roomImage} 
                  alt={booking.roomTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white mb-1">{booking.roomTitle}</h2>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <MapPin size={16} className="text-cyan-400" />
                    {booking.location}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="p-6">
                {/* Status Badge */}
                <div className="mb-6">
                  {getStatusBadge()}
                </div>

                {/* Booking Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={18} className="text-purple-400" />
                      <span className="text-gray-400 text-sm">Move-in Date</span>
                    </div>
                    <p className="text-white font-semibold">{new Date(booking.moveInDate).toLocaleDateString()}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={18} className="text-green-400" />
                      <span className="text-gray-400 text-sm">Monthly Rent</span>
                    </div>
                    <p className="text-white font-semibold">Rs. {booking.roomPrice.toLocaleString()}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={18} className="text-orange-400" />
                      <span className="text-gray-400 text-sm">Duration</span>
                    </div>
                    <p className="text-white font-semibold">{booking.duration} months</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={18} className="text-blue-400" />
                      <span className="text-gray-400 text-sm">Booking ID</span>
                    </div>
                    <p className="text-white font-semibold">{booking.id}</p>
                  </div>
                </div>

                {/* Payment Status Section */}
                {getPaymentStatusSection()}

                {/* Rejection Reason (if rejected) */}
                {booking.status === 'rejected' && (
                  <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-semibold mb-1">Rejection Reason:</p>
                        <p className="text-gray-300 text-sm">{booking.rejectionReason || 'No reason provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/find')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Home size={20} />
                Browse More Rooms
              </button>
              <button
                onClick={() => navigate('/student-payment')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <DollarSign size={20} />
                Payment History
              </button>
            </div>
          </div>

          {/* Sidebar - Saved Rooms & Quick Actions */}
          <div className="space-y-6">
            {/* Owner Contact (if approved) */}
            {booking.status === 'approved' && (
              <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Owner Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <User size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Owner Name</p>
                      <p className="text-white text-sm font-semibold">{booking.ownerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Phone size={20} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Contact Number</p>
                      <p className="text-white text-sm font-semibold">{booking.ownerContact}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Rooms (Wishlist from rejected) */}
            <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={20} className="text-pink-400" />
                <h3 className="text-lg font-bold text-white">Saved Rooms</h3>
              </div>
              <div className="space-y-3">
                {savedRooms.map(room => (
                  <div key={room.id} className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex gap-3 p-3">
                      <img 
                        src={room.image} 
                        alt={room.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-semibold mb-1 truncate">{room.title}</h4>
                        <p className="text-gray-400 text-xs mb-1">{room.location}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 text-sm font-bold">Rs. {room.price.toLocaleString()}</span>
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-gray-400 text-xs">{room.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total Saved</span>
                  <span className="text-white font-bold">{savedRooms.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Active Bookings</span>
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Account Status</span>
                  <span className="text-green-400 font-bold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Payment Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl max-w-md w-full border border-cyan-500/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Upload Payment Slip</h3>
              <p className="text-gray-400 mb-6 text-sm">
                Please upload a clear photo or PDF of your bank transfer receipt
              </p>

              <div className="mb-6">
                <label className="block border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 transition-all bg-cyan-500/5">
                  <Upload size={48} className="text-cyan-400 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">
                    {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-gray-400 text-xs">JPG, PNG or PDF (Max 5MB)</p>
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFile(null);
                  }}
                  className="flex-1 py-3 bg-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPayment}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
