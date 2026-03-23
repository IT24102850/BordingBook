const RoommateProfile = require('../models/RoommateProfile');
const RoommateMatch = require('../models/RoommateMatch');
const RoommateRequest = require('../models/RoommateRequest');
const User = require('../models/User');

/**
 * @desc Create or update roommate profile for current user
 * @route POST /api/roommates/profile
 * @access Private
 */
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      description,
      image,
      budget,
      gender,
      academicYear,
      preferences,
      roomType,
      billsIncluded,
      availableFrom,
      tags,
      boardingHouse,
      lookingFor,
    } = req.body;

    // Validate required fields
    if (!budget || !gender || !academicYear || !roomType || !availableFrom) {
      return res.status(400).json({
        success: false,
        message: 'budget, gender, academicYear, roomType, and availableFrom are required',
      });
    }

    // Check if profile exists
    let profile = await RoommateProfile.findOne({ userId });

    if (profile) {
      // Update existing profile
      profile.description = description || profile.description;
      profile.image = image || profile.image;
      profile.budget = budget;
      profile.gender = gender;
      profile.academicYear = academicYear;
      profile.preferences = preferences || profile.preferences;
      profile.roomType = roomType;
      profile.billsIncluded = billsIncluded;
      profile.availableFrom = availableFrom;
      profile.tags = tags || profile.tags;
      profile.boardingHouse = boardingHouse || profile.boardingHouse;
      profile.lookingFor = lookingFor || profile.lookingFor;
      await profile.save();
    } else {
      // Create new profile
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      profile = new RoommateProfile({
        userId,
        name: user.name,
        email: user.email,
        description,
        image,
        budget,
        gender,
        academicYear,
        preferences,
        roomType,
        billsIncluded,
        availableFrom,
        tags,
        boardingHouse,
        lookingFor,
      });

      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving profile',
      error: error.message,
    });
  }
};

/**
 * @desc Get current user's roommate profile
 * @route GET /api/roommates/profile
 * @access Private
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await RoommateProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Roommate profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

/**
 * @desc Get roommate profiles with filters (for swiping)
 * @route GET /api/roommates/browse
 * @access Private
 */
exports.browseProfiles = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { gender, minBudget, maxBudget, roomType, academicYear } = req.query;

    // Build filter
    const filter = { userId: { $ne: userId }, isActive: true };

    if (gender && gender !== 'Any') {
      filter.gender = gender;
    }

    if (minBudget) {
      filter.budget = { $gte: parseInt(minBudget) };
    }

    if (maxBudget) {
      if (!filter.budget) filter.budget = {};
      filter.budget.$lte = parseInt(maxBudget);
    }

    if (roomType && roomType !== 'Any') {
      filter.roomType = roomType;
    }

    if (academicYear) {
      filter.academicYear = academicYear;
    }

    // Get already liked/passed profiles
    const matches = await RoommateMatch.find(
      { userId },
      'targetProfileId'
    ).lean();
    const matchedProfileIds = matches.map((m) => m.targetProfileId);

    // Exclude already matched profiles
    filter._id = { $nin: matchedProfileIds };

    const profiles = await RoommateProfile.find(filter)
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profiles',
      error: error.message,
    });
  }
};

/**
 * @desc Like or pass on a profile (Tinder-style swipe)
 * @route POST /api/roommates/swipe
 * @access Private
 */
exports.swipeProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { profileId, action } = req.body;

    if (!profileId || !action) {
      return res.status(400).json({
        success: false,
        message: 'profileId and action (like/pass) are required',
      });
    }

    if (!['like', 'pass'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'action must be "like" or "pass"',
      });
    }

    // Check if profile exists
    const profile = await RoommateProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Create match record
    const match = new RoommateMatch({
      userId,
      targetProfileId: profileId,
      action,
    });

    await match.save();

    res.status(200).json({
      success: true,
      message: `Profile ${action}d successfully`,
      data: match,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Already swiped on this profile',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error swiping profile',
      error: error.message,
    });
  }
};

/**
 * @desc Get liked profiles for current user
 * @route GET /api/roommates/liked
 * @access Private
 */
exports.getLikedProfiles = async (req, res) => {
  try {
    const userId = req.user.userId;

    const likedMatches = await RoommateMatch.find({
      userId,
      action: 'like',
    }).populate('targetProfileId');

    const profiles = likedMatches.map((m) => m.targetProfileId);

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching liked profiles',
      error: error.message,
    });
  }
};
