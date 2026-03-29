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
    const users = await User.find(query).select('name fullName email gender academicYear profilePicture profilePictures description bio tags boardingHouse age dateOfBirth dob birthDate');
    const profiles = users.map(user => ({
      id: user._id,
      userId: user._id,
      name: user.name || user.fullName || '',
      bio: user.bio || user.description || '',
      profilePictures: Array.isArray(user.profilePictures) && user.profilePictures.length > 0
        ? user.profilePictures
        : (user.profilePicture ? [user.profilePicture] : []),
      profilePicture: user.profilePicture || '',
      gender: user.gender || '',
      university: user.boardingHouse || user.academicYear || '',
      email: user.email || '',
      interests: Array.isArray(user.tags) ? user.tags : [],
      age: user.age,
      dateOfBirth: user.dateOfBirth || user.dob || user.birthDate || '',
    }));
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch roommate profiles', error: error.message });
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
  try {
    const userId = req.user.userId;
    const { profileId, action } = req.body;
    if (!profileId || !['like', 'pass'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid swipe action or profileId' });
    }
    const update =
      action === 'like'
        ? { $addToSet: { liked: profileId } }
        : { $addToSet: { passed: profileId } };
    await User.findByIdAndUpdate(userId, update);
    res.json({ success: true, message: `Profile ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Swipe failed', error: error.message });
  }
};

/**
 * @desc Get liked profiles
 * @route GET /api/roommates/liked
 * @access Private
 */
exports.getLikedProfiles = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const likedIds = user.liked || [];
    const users = await User.find({ _id: { $in: likedIds }, isActive: true })
      .select('name email gender academicYear profilePicture profilePictures description tags boardingHouse');
    const profiles = users.map(user => ({
      id: user._id,
      userId: user._id,
      name: user.name || 'Student',
      bio: user.description || '',
      profilePictures: user.profilePictures && user.profilePictures.length > 0 ? user.profilePictures : [user.profilePicture || 'https://randomuser.me/api/portraits/lego/1.jpg'],
      gender: user.gender || 'Any',
      university: user.boardingHouse || user.academicYear || '',
      email: user.email || '',
      interests: Array.isArray(user.tags) ? user.tags : [],
    }));
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch liked profiles', error: error.message });
  }
};

/**
 * @desc Get passed profiles (if you track them)
 * @route GET /api/roommates/passed
 * @access Private
 */
exports.getPassedProfiles = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const passedIds = user.passed || [];
    const users = await User.find({ _id: { $in: passedIds }, isActive: true })
      .select('name email gender academicYear profilePicture profilePictures description tags boardingHouse');
    const profiles = users.map(user => ({
      id: user._id,
      userId: user._id,
      name: user.name || 'Student',
      bio: user.description || '',
      profilePictures: user.profilePictures && user.profilePictures.length > 0 ? user.profilePictures : [user.profilePicture || 'https://randomuser.me/api/portraits/lego/1.jpg'],
      gender: user.gender || 'Any',
      university: user.boardingHouse || user.academicYear || '',
      email: user.email || '',
      interests: Array.isArray(user.tags) ? user.tags : [],
    }));
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch passed profiles', error: error.message });
  }
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

