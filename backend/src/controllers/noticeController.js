const Notice = require('../models/Notice');

// Create a new notice
exports.createNotice = async (req, res) => {
  try {
    const { title, message, type, description, recipients, date, time } = req.body;
    const ownerId = req.user.userId;
    const notice = await Notice.create({ 
      ownerId, 
      title, 
      message,
      type: type || 'general',
      description: description || '',
      recipients: recipients || 'All Students',
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toLocaleTimeString()
    });
    res.status(201).json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create notice', details: err.message });
  }
};

// Get all notices for owner
exports.getNotices = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const notices = await Notice.find({ ownerId }).sort({ createdAt: -1 });
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch notices', details: err.message });
  }
};

// Update a notice
exports.updateNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const { title, message, type, description, recipients, date, time } = req.body;
    const ownerId = req.user.userId;
    const notice = await Notice.findOneAndUpdate(
      { _id: noticeId, ownerId },
      { title, message, type, description, recipients, date, time, updatedAt: Date.now() },
      { new: true }
    );
    if (!notice) return res.status(404).json({ success: false, error: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update notice', details: err.message });
  }
};

// Delete a notice
exports.deleteNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const ownerId = req.user.userId;
    const result = await Notice.deleteOne({ _id: noticeId, ownerId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Notice not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notice', details: err.message });
  }
};
