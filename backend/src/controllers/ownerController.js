const BoardingHouse = require('../models/BoardingHouse');
const Room = require('../models/Room');

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
    const houses = await BoardingHouse.find({ status: 'active' }).sort({ createdAt: -1 });
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
