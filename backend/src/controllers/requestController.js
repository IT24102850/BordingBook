const RoommateRequest = require('../models/RoommateRequest');
const RoommateProfile = require('../models/RoommateProfile');

/**
 * @desc Send roommate request to another user
 * @route POST /api/roommates/request/send
 * @access Private
 */
exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: 'recipientId and message are required',
      });
    }

    if (senderId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send request to yourself',
      });
    }

    // Check if recipient exists
    const recipientProfile = await RoommateProfile.findOne({ userId: recipientId });
    if (!recipientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found',
      });
    }

    // Check for existing request
    const existingRequest = await RoommateRequest.findOne({
      senderId,
      recipientId,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Request already sent to this user',
      });
    }

    const request = new RoommateRequest({
      senderId,
      recipientId,
      message,
    });

    await request.save();

    res.status(201).json({
      success: true,
      message: 'Request sent successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending request',
      error: error.message,
    });
  }
};

/**
 * @desc Get inbox requests (received by current user)
 * @route GET /api/roommates/request/inbox
 * @access Private
 */
exports.getInboxRequests = async (req, res) => {
  try {
    const recipientId = req.user.userId;
    const { status } = req.query;

    const filter = { recipientId };
    if (status) {
      filter.status = status;
    }

    const requests = await RoommateRequest.find(filter)

      .populate('senderId', 'fullName email')

      .populate('senderId', 'name email')

      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inbox requests',
      error: error.message,
    });
  }
};

/**
 * @desc Get sent requests (sent by current user)
 * @route GET /api/roommates/request/sent
 * @access Private
 */
exports.getSentRequests = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { status } = req.query;

    const filter = { senderId };
    if (status) {
      filter.status = status;
    }

    const requests = await RoommateRequest.find(filter)

      .populate('recipientId', 'fullName email')

      .populate('recipientId', 'name email')

      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sent requests',
      error: error.message,
    });
  }
};

/**
 * @desc Accept roommate request
 * @route PATCH /api/roommates/request/:requestId/accept
 * @access Private
 */
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const request = await RoommateRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify recipient is the requester
    if (request.recipientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to accept this request',
      });
    }

    request.status = 'accepted';
    request.respondedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request accepted',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting request',
      error: error.message,
    });
  }
};

/**
 * @desc Reject roommate request
 * @route PATCH /api/roommates/request/:requestId/reject
 * @access Private
 */
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const request = await RoommateRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Verify recipient is the requester
    if (request.recipientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to reject this request',
      });
    }

    request.status = 'rejected';
    request.respondedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting request',
      error: error.message,
    });
  }
};

/**
 * @desc Get specific request by ID
 * @route GET /api/roommates/request/:requestId
 * @access Private
 */
exports.getRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await RoommateRequest.findById(requestId)

      .populate('senderId', 'fullName email')
      .populate('recipientId', 'fullName email');

      .populate('senderId', 'name email')
      .populate('recipientId', 'name email');


    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching request',
      error: error.message,
    });
  }
};
