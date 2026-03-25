const BoardingHouse = require('../models/BoardingHouse');
const Room = require('../models/Room');

const fallbackHouseImages = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80',
];

const getFallbackHouses = () => [
  {
    _id: 'dummy-house-1',
    name: 'Campus View Boarding House',
    address: 'Malabe',
    totalRooms: 8,
    occupiedRooms: 5,
    monthlyPrice: 16500,
    roomType: 'Single Room',
    availableFrom: new Date().toISOString(),
    deposit: 33000,
    roommateCount: 'None (Private)',
    description: 'Clean and modern boarding house with easy access to universities.',
    features: ['WiFi', 'Laundry', 'Security'],
    image: fallbackHouseImages[0],
    images: [fallbackHouseImages[0], fallbackHouseImages[1]],
    status: 'active',
    genderPreference: 'any',
    isDummy: true,
  },
  {
    _id: 'dummy-house-2',
    name: 'Green Garden Bodim',
    address: 'Kaduwela',
    totalRooms: 6,
    occupiedRooms: 2,
    monthlyPrice: 12500,
    roomType: 'Shared Room',
    availableFrom: new Date().toISOString(),
    deposit: 25000,
    roommateCount: '2',
    description: 'Budget-friendly bodim with spacious common areas and garden.',
    features: ['Meals', 'Parking', 'WiFi'],
    image: fallbackHouseImages[2],
    images: [fallbackHouseImages[2], fallbackHouseImages[3]],
    status: 'active',
    genderPreference: 'any',
    isDummy: true,
  },
];

function ensureOwnerRole(req, res) {
  if (!['owner', 'admin'].includes(req.user.role)) {
    res.status(403).json({ success: false, message: 'Only owners can manage boarding data' });
    return false;
  }
  return true;
}

exports.getHouses = async (req, res) => {
  if (!ensureOwnerRole(req, res)) return;
  try {
    const houses = await BoardingHouse.find({ ownerId: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: houses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch houses', error: error.message });
  }
};


exports.getPublicHouses = async (req, res) => {
  try {
    let houses = await BoardingHouse.find({ status: 'active' }).sort({ createdAt: -1 });

    if (!Array.isArray(houses) || houses.length === 0) {
      houses = getFallbackHouses();
    }

    return res.status(200).json({ success: true, data: houses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch houses', error: error.message });
  }
};


exports.createHouse = async (req, res) => {
  if (!ensureOwnerRole(req, res)) return;
  try {
    const {
      name,
      address,
      totalRooms,
      monthlyPrice,
      roomType,
      availableFrom,
      deposit,
      roommateCount,
      description,
      features,
      image,
      images,
      status,
      genderPreference,
    } = req.body;
    const normalizedImages = Array.isArray(images) ? images.filter(Boolean) : [];
    const normalizedFeatures = Array.isArray(features) ? features.filter(Boolean) : [];
    const coverImage = image || normalizedImages[0] || '';

    const house = await BoardingHouse.create({
      name,
      address,
      totalRooms: Number(totalRooms) || 0,
      monthlyPrice: Number(monthlyPrice) || 0,
      roomType: roomType || 'Single Room',
      availableFrom: availableFrom || '',
      deposit: Number(deposit) || 0,
      roommateCount: roommateCount || 'None (Private)',
      description: description || '',
      features: normalizedFeatures,
      occupiedRooms: 0,
      image: coverImage,
      images: normalizedImages,
      status: status || 'active',
      genderPreference: ['girls', 'boys', 'any'].includes(genderPreference) ? genderPreference : 'any',
      ownerId: req.user.userId,
    });

    return res.status(201).json({ success: true, message: 'Boarding house created', data: house });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create house', error: error.message });
  }
};

exports.updateHouse = async (req, res) => {
  if (!ensureOwnerRole(req, res)) return;
  try {
    const { houseId } = req.params;

    const house = await BoardingHouse.findOneAndUpdate(
      { _id: houseId, ownerId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found' });
    }

    return res.status(200).json({ success: true, message: 'Boarding house updated', data: house });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update house', error: error.message });
  }
};

exports.deleteHouse = async (req, res) => {
  if (!ensureOwnerRole(req, res)) return;
  try {
    const { houseId } = req.params;

    const house = await BoardingHouse.findOneAndDelete({ _id: houseId, ownerId: req.user.userId });

    if (!house) {
      return res.status(404).json({ success: false, message: 'House not found' });
    }

    await Room.deleteMany({ ownerId: req.user.userId, houseId: houseId });

    return res.status(200).json({ success: true, message: 'Boarding house deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete house', error: error.message });
  }
};

exports.getRooms = async (req, res) => {
  if (!ensureOwnerRole(req, res)) return;
  try {
    const rooms = await Room.find({ ownerId: req.user.userId, isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch rooms', error: error.message });
  }
};

exports.createRoom = async (req, res) => {
  if (!ensureOwnerRole(req, res)) return;
  try {
    const {
      houseId,
      name,
      roomNumber,
      floor,
      bedCount,
      occupancy,
      price,
      facilities,
      images,
      location,
      roomType,
      genderPreference,
      availableFrom,
      deposit,
      roommateCount,
      description,
      owner,
      ownerPhone,
      ownerEmail,
    } = req.body;

    const room = await Room.create({
      houseId,
      name: name || `Room ${roomNumber}`,
      roomNumber,
      floor: Number(floor) || 1,
      bedCount: Number(bedCount) || 1,
      totalSpots: Number(bedCount) || 1,
      occupancy: Number(occupancy) || 0,
      price: Number(price),
      facilities: facilities || [],
      images: images || [],
      location,
      roomType: roomType || 'Single Room',
      genderPreference: genderPreference || 'Any',
      availableFrom: availableFrom || null,
      deposit: Number(deposit) || 0,
      roommateCount: roommateCount || 'None',
      description: description || '',
      owner: owner || '',
      ownerPhone: ownerPhone || '',
      ownerEmail: ownerEmail || '',
      ownerId: req.user.userId,
      isActive: true,
    });

    return res.status(201).json({ success: true, message: 'Room created', data: room });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create room', error: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  if (!ensureOwnerRole(req, res)) return;
  try {
    const { roomId } = req.params;

    const room = await Room.findOneAndUpdate(
      { _id: roomId, ownerId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    return res.status(200).json({ success: true, message: 'Room updated', data: room });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update room', error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  if (!ensureOwnerRole(req, res)) return;
  try {
    const { roomId } = req.params;

    const room = await Room.findOneAndDelete({ _id: roomId, ownerId: req.user.userId });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    return res.status(200).json({ success: true, message: 'Room deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete room', error: error.message });
  }
};

// Payment-related controllers
exports.getPendingPaymentSlips = async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only owners can view payment slips' });
  }
  try {
    const { status = 'pending' } = req.query;
    
    // Get all rooms for this owner
    const rooms = await Room.find({ ownerId: req.user.userId }).populate('houseId');
    
    // Get booking groups that are in "ready" or "forming" status (not yet booked/paid)
    const BookingGroup = require('../models/BookingGroup');
    const pendingBookings = await BookingGroup.find({ 
      status: { $in: ['forming', 'ready'] }
    }).populate('members.userId');
    
    // Build payment slips from pending bookings
    const slips = [];
    
    for (const booking of pendingBookings) {
      // Find the room associated with this booking
      const room = rooms.find(r => r._id.toString() === booking.boardingHouse || 
                                   r.name === booking.boardingHouse);
      
      if (room && booking.members && booking.members.length > 0) {
        for (const member of booking.members) {
          if (member.status === 'accepted' || member.status === 'pending') {
            slips.push({
              id: `bs-${booking._id}-${member.userId}`,
              tenantName: member.name || member.email,
              roomNumber: room.roomNumber || room.name,
              placeId: room.houseId?._id?.toString() || room.houseId,
              placeName: room.houseId?.name || 'Boarding House',
              amount: booking.totalBudget ? Math.floor(booking.totalBudget / booking.members.length) : room.price,
              originalRent: room.price,
              date: new Date(member.joinedAt).toISOString().split('T')[0],
              trustScore: member.status === 'accepted' ? 'high' : 'medium',
              status: 'pending',
              slipUrl: null
            });
          }
        }
      }
    }
    
    return res.status(200).json({ success: true, data: slips });
  } catch (error) {
    console.error('Error fetching payment slips:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment slips', error: error.message });
  }
};

exports.downloadPaymentSlip = async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only owners can download slips' });
  }
  try {
    const { slipId } = req.params;
    
    // TODO: Implement file download logic
    // For now, returning placeholder
    return res.status(200).json({ success: true, message: 'Download initiated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to download slip', error: error.message });
  }
};

exports.approvePaymentSlip = async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only owners can approve slips' });
  }
  try {
    const { slipId } = req.params;
    
    // TODO: Implement payment slip approval logic
    // Database update to mark slip as approved
    
    return res.status(200).json({ success: true, message: 'Payment slip approved', data: { slipId, status: 'approved' } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to approve slip', error: error.message });
  }
};

exports.rejectPaymentSlip = async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only owners can reject slips' });
  }
  try {
    const { slipId } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Rejection reason must be at least 10 characters' });
    }
    
    // TODO: Implement payment slip rejection logic
    // Database update to mark slip as rejected with reason
    
    return res.status(200).json({ success: true, message: 'Payment slip rejected', data: { slipId, status: 'rejected', reason } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reject slip', error: error.message });
  }
};

exports.getFinancialOverview = async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only owners can view financial data' });
  }
  try {
    // Get all rooms for this owner
    const rooms = await Room.find({ ownerId: req.user.userId });
    
    // Calculate expected revenue from occupied rooms
    let totalExpected = 0;
    rooms.forEach(room => {
      // Expected revenue = monthly price × occupancy count
      if (room.occupancy > 0) {
        totalExpected += room.price * room.occupancy;
      }
    });

    // Calculate collected revenue based on booking status
    // A "booked" booking group means payment has been received
    const BookingGroup = require('../models/BookingGroup');
    const bookedGroups = await BookingGroup.find({ status: 'booked' });
    
    let totalCollected = 0;
    bookedGroups.forEach(group => {
      if (group.totalBudget && group.members && group.members.length > 0) {
        // Evenly distribute the budget among members
        totalCollected += group.totalBudget;
      }
    });

    // If no bookings yet, calculate based on room occupancy
    if (totalCollected === 0) {
      rooms.forEach(room => {
        if (room.occupancy > 0) {
          totalCollected += room.price * Math.floor(room.occupancy * 0.5); // Assume 50% collected
        }
      });
    }

    const totalDeficit = totalExpected - totalCollected;
    const collectionPercentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    const overview = {
      totalExpected,
      totalCollected,
      totalDeficit: totalDeficit >= 0 ? totalDeficit : 0,
      collectionPercentage
    };
    
    return res.status(200).json({ success: true, data: overview });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch financial overview', error: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only owners can view payment history' });
  }
  try {
    const { houseId, status } = req.query;
    
    // Build query for rooms
    let query = { ownerId: req.user.userId };
    if (houseId) {
      query.houseId = houseId;
    }

    // Get all rooms for this owner (or filtered by house)
    const rooms = await Room.find(query).populate('houseId');

    // Convert rooms to payment history format
    const history = rooms.map(room => ({
      id: room._id.toString(),
      tenantName: room.owner || 'Room ' + room.roomNumber,
      roomNumber: room.roomNumber || room.name,
      boardingHouseId: room.houseId?._id?.toString() || room.houseId,
      boardingHouseName: room.houseId?.name || 'Boarding House',
      monthlyRent: room.price,
      outstandingBalance: 0,
      paymentStatus: room.occupancy > 0 ? 'paid' : 'pending',
      dueDate: '2026-02-28',
      lastPaidDate: '2026-02-28',
      checkInDate: new Date().toISOString().split('T')[0],
      trustScore: room.occupancy > 0 ? 'high' : 'low',
      occupancyCount: room.occupancy || 0,
      totalSpots: room.totalSpots || 1
    }));

    // Filter by status if provided
    if (status) {
      return res.status(200).json({ 
        success: true, 
        data: history.filter(h => h.paymentStatus === status) 
      });
    }
    
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment history', error: error.message });
  }
};
