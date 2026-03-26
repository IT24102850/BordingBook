const mongoose = require('mongoose');
const BookingGroup = require('../models/BookingGroup');
const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

function toObjectId(value) {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }
  return new mongoose.Types.ObjectId(value);
}

function directKeyFromUsers(userA, userB) {
  return [String(userA), String(userB)].sort().join(':');
}

function mapUser(user) {
  return {
    id: String(user?._id || ''),
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatar: user?.profilePicture || '',
    role: user?.role || 'student',
  };
}

function mapMessage(message, currentUserId) {
  const sender = mapUser(message.sender || {});
  return {
    id: String(message._id),
    conversationId: String(message.conversation),
    sender,
    content: message.content,
    messageType: message.messageType,
    createdAt: message.createdAt,
    mine: String(sender.id) === String(currentUserId),
  };
}

async function mapConversation(conversation, currentUserId) {
  const participants = (conversation.participants || []).map((entry) => ({
    ...mapUser(entry.user),
    lastReadAt: entry.lastReadAt,
    role: entry.role,
  }));

  const counterpart = participants.find((p) => p.id !== String(currentUserId));
  const title =
    conversation.type === 'group'
      ? conversation.name || 'Group Chat'
      : counterpart?.fullName || counterpart?.email || 'Direct Chat';
  const avatar = conversation.type === 'group' ? conversation.avatar : counterpart?.avatar;

  const currentParticipant = (conversation.participants || []).find(
    (entry) => String(entry.user?._id || entry.user) === String(currentUserId)
  );

  const unreadCount = await ChatMessage.countDocuments({
    conversation: conversation._id,
    sender: { $ne: currentUserId },
    createdAt: { $gt: currentParticipant?.lastReadAt || new Date(0) },
  });

  return {
    id: String(conversation._id),
    type: conversation.type,
    name: title,
    avatar: avatar || '',
    participants,
    lastMessage: {
      text: conversation.lastMessage?.text || '',
      at: conversation.lastMessage?.at || conversation.updatedAt,
      senderId: conversation.lastMessage?.sender ? String(conversation.lastMessage.sender) : null,
    },
    unreadCount,
    updatedAt: conversation.updatedAt,
  };
}

async function ensureConversationMember(conversationId, userId) {
  const conversation = await ChatConversation.findOne({
    _id: conversationId,
    'participants.user': userId,
  })
    .populate('participants.user', 'fullName email profilePicture role')
    .populate('lastMessage.sender', 'fullName email profilePicture role');

  return conversation;
}

exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const conversations = await ChatConversation.find({ 'participants.user': currentUserId })
      .populate('participants.user', 'fullName email profilePicture role')
      .populate('lastMessage.sender', 'fullName email profilePicture role')
      .sort({ updatedAt: -1 })
      .limit(100);

    const mapped = await Promise.all(conversations.map((conversation) => mapConversation(conversation, currentUserId)));

    res.status(200).json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching conversations', error: error.message });
  }
};

exports.getOrCreateDirectConversation = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const recipientId = req.body.recipientId;

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ success: false, message: 'Valid recipientId is required' });
    }

    if (String(recipientId) === String(currentUserId)) {
      return res.status(400).json({ success: false, message: 'Cannot create direct chat with yourself' });
    }

    const recipient = await User.findById(recipientId).select('fullName email profilePicture role');
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    const key = directKeyFromUsers(currentUserId, recipientId);

    let conversation = await ChatConversation.findOne({ directKey: key })
      .populate('participants.user', 'fullName email profilePicture role')
      .populate('lastMessage.sender', 'fullName email profilePicture role');

    if (!conversation) {
      conversation = await ChatConversation.create({
        type: 'direct',
        directKey: key,
        participants: [{ user: currentUserId }, { user: recipientId }],
      });

      conversation = await ChatConversation.findById(conversation._id)
        .populate('participants.user', 'fullName email profilePicture role')
        .populate('lastMessage.sender', 'fullName email profilePicture role');
    }

    const mapped = await mapConversation(conversation, currentUserId);

    return res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating direct conversation', error: error.message });
  }
};

exports.getOrCreateGroupConversation = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { groupId, name, participantIds = [] } = req.body;

    if (groupId) {
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ success: false, message: 'Invalid groupId' });
      }

      const group = await BookingGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }

      const isMember = group.members.some((member) => String(member.userId) === String(currentUserId));
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Not authorized for this group chat' });
      }

      let conversation = await ChatConversation.findOne({ groupRef: groupId })
        .populate('participants.user', 'fullName email profilePicture role')
        .populate('lastMessage.sender', 'fullName email profilePicture role');

      if (!conversation) {
        const userIds = group.members
          .map((member) => toObjectId(member.userId))
          .filter(Boolean);

        if (userIds.length < 2) {
          return res.status(400).json({ success: false, message: 'Group must have at least 2 users to start chat' });
        }

        conversation = await ChatConversation.create({
          type: 'group',
          groupRef: group._id,
          name: group.name || 'Group Chat',
          participants: userIds.map((id) => ({ user: id })),
        });

        conversation = await ChatConversation.findById(conversation._id)
          .populate('participants.user', 'fullName email profilePicture role')
          .populate('lastMessage.sender', 'fullName email profilePicture role');
      }

      const mapped = await mapConversation(conversation, currentUserId);
      return res.status(200).json({ success: true, data: mapped });
    }

    const normalizedParticipantIds = Array.from(
      new Set([String(currentUserId), ...participantIds.map((id) => String(id))])
    ).filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (normalizedParticipantIds.length < 2) {
      return res.status(400).json({ success: false, message: 'At least one additional participant is required' });
    }

    const users = await User.find({ _id: { $in: normalizedParticipantIds } }).select('fullName email profilePicture role');
    if (users.length !== normalizedParticipantIds.length) {
      return res.status(404).json({ success: false, message: 'One or more participants were not found' });
    }

    const conversation = await ChatConversation.create({
      type: 'group',
      name: name || 'New Group',
      participants: normalizedParticipantIds.map((id) => ({ user: id })),
    });

    const populated = await ChatConversation.findById(conversation._id)
      .populate('participants.user', 'fullName email profilePicture role')
      .populate('lastMessage.sender', 'fullName email profilePicture role');

    const mapped = await mapConversation(populated, currentUserId);

    return res.status(201).json({ success: true, data: mapped });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating group conversation', error: error.message });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { conversationId } = req.params;
    const limit = Math.min(Number(req.query.limit || 50), 100);

    const conversation = await ensureConversationMember(conversationId, currentUserId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const query = { conversation: conversationId };
    if (req.query.before) {
      const beforeDate = new Date(req.query.before);
      if (!Number.isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate };
      }
    }

    const messages = await ChatMessage.find(query)
      .populate('sender', 'fullName email profilePicture role')
      .sort({ createdAt: -1 })
      .limit(limit);

    await ChatConversation.updateOne(
      { _id: conversationId, 'participants.user': currentUserId },
      { $set: { 'participants.$.lastReadAt': new Date() } }
    );

    return res.status(200).json({
      success: true,
      data: messages.reverse().map((message) => mapMessage(message, currentUserId)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { conversationId } = req.params;
    const content = String(req.body.content || '').trim();

    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const conversation = await ensureConversationMember(conversationId, currentUserId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const message = await ChatMessage.create({
      conversation: conversationId,
      sender: currentUserId,
      content,
      readBy: [currentUserId],
    });

    const populatedMessage = await ChatMessage.findById(message._id).populate('sender', 'fullName email profilePicture role');

    await ChatConversation.updateOne(
      { _id: conversationId },
      {
        $set: {
          lastMessage: {
            text: content,
            sender: currentUserId,
            at: populatedMessage.createdAt,
          },
          updatedAt: new Date(),
        },
      }
    );

    const mappedMessage = mapMessage(populatedMessage, currentUserId);

    const io = req.app.locals.io;
    if (io) {
      io.to(`conversation:${conversationId}`).emit('message:new', mappedMessage);
    }

    return res.status(201).json({ success: true, data: mappedMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
};

exports.markConversationRead = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { conversationId } = req.params;

    const conversation = await ensureConversationMember(conversationId, currentUserId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await ChatConversation.updateOne(
      { _id: conversationId, 'participants.user': currentUserId },
      { $set: { 'participants.$.lastReadAt': new Date() } }
    );

    return res.status(200).json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error marking conversation as read', error: error.message });
  }
};
