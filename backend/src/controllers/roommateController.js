/**
 * @route GET /api/roommates/browse
 * @access Private
 */
const User = require('../models/User');

exports.browseProfiles = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const query = { isActive: true };
    if (userId) {
      query._id = { $ne: userId };
    }
    // Select only the fields needed for roommate browsing
    const users = await User.find(query).select('name email gender academicYear profilePicture description tags boardingHouse');
    // Map to expected frontend format if needed
    const profiles = users.map(user => ({
      id: user._id,
      userId: user._id,
      name: user.name || 'Student',
      email: user.email || '',
      gender: user.gender || 'Any',
      university: user.boardingHouse || user.academicYear || '',
      bio: user.description || '',
      image: user.profilePicture || 'https://randomuser.me/api/portraits/lego/1.jpg',
      interests: Array.isArray(user.tags) ? user.tags : [],
    }));
    res.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roommate profiles',
      error: error.message,
    });
  }
};

/**
 * @desc Create or update roommate profile for current user
 * @route POST /api/roommates/profile
 * @access Private
 */
exports.createOrUpdateProfile = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Roommate profiles not yet implemented',
  });
};

/**
 * @desc Get current user's roommate profile
 * @route GET /api/roommates/profile
 * @access Private
 */
exports.getMyProfile = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Roommate profiles not yet implemented',
  });
};


/**
 * @desc Swipe on a profile (like/pass)
 * @route POST /api/roommates/swipe
 * @access Private
 */
exports.swipeProfile = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Swipe functionality not yet implemented',
  });
};

/**
 * @desc Get liked profiles
 * @route GET /api/roommates/liked
 * @access Private
 */
exports.getLikedProfiles = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Liked profiles not yet implemented',
  });
};

/**
 * @desc Get mutual matches
 * @route GET /api/roommates/mutual
 * @access Private
 */
exports.getMutualMatches = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Mutual matches not yet implemented',
  });
};

/**
 * @desc Send roommate request
 * @route POST /api/roommates/request/send
 * @access Private
 */
exports.sendRequest = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Request functionality not yet implemented',
  });
};

/**
 * @desc Get inbox requests
 * @route GET /api/roommates/request/inbox
 * @access Private
 */
exports.getInboxRequests = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Inbox not yet implemented',
  });
};

/**
 * @desc Get sent requests
 * @route GET /api/roommates/request/sent
 * @access Private
 */
exports.getSentRequests = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Sent requests not yet implemented',
  });
};

/**
 * @desc Accept roommate request
 * @route PATCH /api/roommates/request/:requestId/accept
 * @access Private
 */
exports.acceptRequest = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Request acceptance not yet implemented',
  });
};

/**
 * @desc Reject roommate request
 * @route PATCH /api/roommates/request/:requestId/reject
 * @access Private
 */
exports.rejectRequest = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Request rejection not yet implemented',
  });
};

