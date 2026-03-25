const Room = require('../models/Room');

const fallbackRoomImages = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1598928506911-5c200b0e2f4b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80',
];

const getFallbackRooms = () => [
  {
    _id: 'dummy-room-1',
    name: 'Modern Student Room - Malabe',
    location: 'Malabe',
    price: 18000,
    totalSpots: 2,
    occupancy: 1,
    facilities: ['WiFi', 'Laundry', 'Meals'],
    images: [fallbackRoomImages[0], fallbackRoomImages[1]],
    roomType: 'Shared Room',
    genderPreference: 'Any',
    availableFrom: new Date().toISOString(),
    deposit: 36000,
    description: 'Fully furnished student room near campus with fast internet.',
    isActive: true,
    isDummy: true,
  },
  {
    _id: 'dummy-room-2',
    name: 'Quiet Single Room - Kaduwela',
    location: 'Kaduwela',
    price: 14000,
    totalSpots: 1,
    occupancy: 0,
    facilities: ['WiFi', 'Parking', 'Security'],
    images: [fallbackRoomImages[2], fallbackRoomImages[3]],
    roomType: 'Single Room',
    genderPreference: 'Female',
    availableFrom: new Date().toISOString(),
    deposit: 28000,
    description: 'Comfortable single room in a secure boarding environment.',
    isActive: true,
    isDummy: true,
  },
];

/**
 * @desc Get all available rooms
 * @route GET /api/roommates/rooms
 * @access Public
 */
exports.getAllRooms = async (req, res) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      minVacancy,
      facilities,
      sort,
    } = req.query;

    const filter = { isActive: true };

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (minPrice) {
      filter.price = { $gte: parseInt(minPrice) };
    }

    if (maxPrice) {
      if (!filter.price) filter.price = {};
      filter.price.$lte = parseInt(maxPrice);
    }

    if (minVacancy) {
      // Using aggregation for vacancy filter
      const rooms = await Room.aggregate([
        {
          $addFields: {
            vacancy: { $subtract: ['$totalSpots', '$occupancy'] },
          },
        },
        {
          $match: {
            ...filter,
            vacancy: { $gte: parseInt(minVacancy) },
          },
        },
        {
          $sort: sort === 'price' ? { price: 1 } : { createdAt: -1 },
        },
      ]);

      return res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms,
      });
    }

    if (facilities) {
      const facilityArray = Array.isArray(facilities)
        ? facilities
        : [facilities];
      filter.facilities = { $in: facilityArray };
    }

    let query = Room.find(filter);

    if (sort === 'price') {
      query = query.sort({ price: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    let rooms = await query;

    if (!Array.isArray(rooms) || rooms.length === 0) {
      rooms = getFallbackRooms();
    }

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message,
    });
  }
};

/**
 * @desc Get specific room by ID
 * @route GET /api/roommates/room/:roomId
 * @access Public
 */
exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message,
    });
  }
};

/**
 * @desc Create new room (booking house owner only)
 * @route POST /api/roommates/room
 * @access Private (Admin/Owner)
 */
exports.createRoom = async (req, res) => {
  try {
    const {
      name,
      location,
      price,
      totalSpots,
      facilities,
      description,
      owner,
      ownerPhone,
      ownerEmail,
      amenities,
      rules,
    } = req.body;

    if (!name || !location || !price || !totalSpots) {
      return res.status(400).json({
        success: false,
        message: 'name, location, price, and totalSpots are required',
      });
    }

    const room = new Room({
      name,
      location,
      price,
      totalSpots,
      occupancy: 0,
      facilities: facilities || [],
      description: description || '',
      owner: owner || 'Unknown',
      ownerPhone: ownerPhone || '',
      ownerEmail: ownerEmail || '',
      amenities: amenities || [],
      rules: rules || [],
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message,
    });
  }
};

/**
 * @desc Update room
 * @route PATCH /api/roommates/room/:roomId
 * @access Private (Admin/Owner)
 */
exports.updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const updates = req.body;

    const room = await Room.findByIdAndUpdate(roomId, updates, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message,
    });
  }
};

/**
 * @desc Update room occupancy
 * @route PATCH /api/roommates/room/:roomId/occupancy
 * @access Private (Admin/Owner)
 */
exports.updateOccupancy = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { occupancy } = req.body;

    if (typeof occupancy !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'occupancy must be a number',
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (occupancy > room.totalSpots) {
      return res.status(400).json({
        success: false,
        message: 'Occupancy cannot exceed total spots',
      });
    }

    room.occupancy = occupancy;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Occupancy updated',
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating occupancy',
      error: error.message,
    });
  }
};
