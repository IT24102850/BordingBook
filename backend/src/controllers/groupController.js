
/**
 * Group Controller - Placeholder for future group functionality
 */

const BookingGroup = require('../models/BookingGroup');
const RoommateProfile = require('../models/RoommateProfile');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Group functionality not yet implemented',
  });
};

const BookingGroup = require('../models/BookingGroup');

exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    // Find groups where user is creator or a member
    const groups = await BookingGroup.find({
      $or: [
        { creatorId: userId },
        { 'members.userId': userId }
      ]
    }).select('-__v');
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
