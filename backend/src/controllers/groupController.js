
/**
 * Group Controller - Placeholder for future group functionality
 */



const BookingGroup = require('../models/BookingGroup');
const RoommateProfile = require('../models/RoommateProfile');
const User = require('../models/User');
const { redis } = require('../lib/redis');

exports.createGroup = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }


    const { memberEmails } = req.body;
    if (!Array.isArray(memberEmails) || memberEmails.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one member email is required' });
    }

    // Find users by email, exclude duplicates and the creator
    const users = await User.find({ email: { $in: memberEmails, $ne: req.user.email } });
    // Always include the creator as a member (status: accepted)
    const creator = await User.findById(userId);
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    // Build members array
    const members = [
      {
        userId: creator._id,
        email: creator.email,
        name: creator.fullName || creator.name || creator.email,
        status: 'accepted',
        joinedAt: new Date(),
      },
      ...users.map(u => ({
        userId: u._id,
        email: u.email,
        name: u.fullName || u.name || u.email,
        status: 'pending',
        joinedAt: null,
      }))
    ];

    // Create group
    // Generate a unique group ID (MongoDB _id)
    const group = new BookingGroup({
      name: `Group-${new Date().getTime()}`,
      creatorId: creator._id,
      members,
      status: 'forming',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await group.save();

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { groupId: group._id, ...group.toObject() },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create group', error: error.message });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    const cacheKey = `groups:${userId}`;
    try {
      const cached = await redis.get(cacheKey);
      console.log('[Redis][get][Groups]', cacheKey, cached);
      if (cached) {
        return res.json({ success: true, data: JSON.parse(cached), fromCache: true });
      }
    } catch (redisErr) {
      console.error('[Redis][get][Groups][Error]', cacheKey, redisErr);
    }
    // Find groups where user is creator or a member
    const groups = await BookingGroup.find({
      $or: [
        { creatorId: userId },
        { 'members.userId': userId }
      ]
    }).select('-__v');
    try {
      await redis.setex(cacheKey, 120, JSON.stringify(groups));
      console.log('[Redis][setex][Groups]', cacheKey);
    } catch (redisErr) {
      console.error('[Redis][setex][Groups][Error]', cacheKey, redisErr);
    }
    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups',
      error: error.message,
    });
  }
};

exports.getGroup = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Groups not yet implemented',
  });
};

exports.addGroupMember = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Group members not yet implemented',
  });
};

exports.removeGroupMember = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Group members not yet implemented',
  });
};

exports.respondToGroupInvite = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Group invites not yet implemented',
  });
};

/**
 * @desc Update group status (forming -> ready -> booked)
 * @route PATCH /api/roommates/group/:groupId/status
 * @access Private
 */
exports.updateGroupStatus = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;
    const { status } = req.body; // 'forming', 'ready', 'booked'

    if (!['forming', 'ready', 'booked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be "forming", "ready", or "booked"',
      });
    }

    const group = await BookingGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Verify user is group creator
    if (group.creatorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group creator can change status',
      });
    }

    group.status = status;
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Group status updated',
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating group status',
      error: error.message,
    });
  }

};
