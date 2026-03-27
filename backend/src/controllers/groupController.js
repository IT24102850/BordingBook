const BookingGroup = require('../models/BookingGroup');
const RoommateProfile = require('../models/RoommateProfile');
const User = require('../models/User');

/**
 * @desc Create a new booking group
 * @route POST /api/roommates/group
 * @access Private
 */
exports.createGroup = async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const {
      name,
      boardingHouse,
      description,
      memberEmails,
      totalBudget,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required',
      });
    }

    const creatorUser = await User.findById(creatorId).select('fullName email');
    if (!creatorUser) {
      return res.status(404).json({
        success: false,
        message: 'Creator user not found',
      });
    }

    // Create group with creator as first member
    const group = new BookingGroup({
      name,
      creatorId,
      boardingHouse: boardingHouse || '',
      description: description || '',
      totalBudget: totalBudget || 0,
      members: [
        {
          userId: creatorId,
          email: creatorUser.email,
          name: creatorUser.fullName || creatorUser.email,
          status: 'accepted', // Creator is auto-accepted
        },
      ],
    });

    // Add other members if provided
    if (memberEmails && Array.isArray(memberEmails)) {
      for (const email of memberEmails) {
        const user = await User.findOne({ email });
        if (user) {
          group.members.push({
            userId: user._id,
            email: user.email,
            name: user.fullName || user.email,
            status: 'pending',
          });
        }
      }
    }

    await group.save();

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating group',
      error: error.message,
    });
  }
};

/**
 * @desc Get user's booking groups
 * @route GET /api/roommates/groups
 * @access Private
 */
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find groups where user is creator or member
    const groups = await BookingGroup.find({
      $or: [
        { creatorId: userId },
        { 'members.userId': userId },
      ],
    }).populate('members.userId', 'name email');

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching groups',
      error: error.message,
    });
  }
};

/**
 * @desc Get specific group by ID
 * @route GET /api/roommates/group/:groupId
 * @access Private
 */
exports.getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await BookingGroup.findById(groupId).populate(
      'members.userId',
      'name email'
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group',
      error: error.message,
    });
  }
};

/**
 * @desc Add member to group
 * @route POST /api/roommates/group/:groupId/member
 * @access Private
 */
exports.addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;
    const { memberEmail } = req.body;

    if (!memberEmail) {
      return res.status(400).json({
        success: false,
        message: 'memberEmail is required',
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
        message: 'Only group creator can add members',
      });
    }

    // Check if member already exists
    if (group.members.some((m) => m.email === memberEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Member already in group',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: memberEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Add member
    group.members.push({
      userId: user._id,
      email: user.email,
      name: user.fullName || user.email,
      status: 'pending',
    });

    await group.save();

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding member',
      error: error.message,
    });
  }
};

/**
 * @desc Remove member from group
 * @route DELETE /api/roommates/group/:groupId/member/:memberId
 * @access Private
 */
exports.removeGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.userId;

    const group = await BookingGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Verify user is group creator or removing themselves
    if (group.creatorId.toString() !== userId && memberId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to remove member',
      });
    }

    // Cannot remove creator
    const memberToRemove = group.members.find((m) => m.userId.toString() === memberId);
    if (memberToRemove && memberId === group.creatorId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove group creator',
      });
    }

    group.members = group.members.filter(
      (m) => m.userId.toString() !== memberId
    );

    await group.save();

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing member',
      error: error.message,
    });
  }
};

/**
 * @desc Accept/Reject group invitation
 * @route PATCH /api/roommates/group/:groupId/respond
 * @access Private
 */
exports.respondToGroupInvite = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be "accepted" or "rejected"',
      });
    }

    const group = await BookingGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Find member
    const member = group.members.find((m) => m.userId.toString() === userId);

    if (!member) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    member.status = status;
    await group.save();

    res.status(200).json({
      success: true,
      message: `Group invitation ${status}`,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error responding to invite',
      error: error.message,
    });
  }
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
