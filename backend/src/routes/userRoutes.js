const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const Review = require('../admin/models/Review');
const SupportTicket = require('../admin/models/SupportTicket');

/**
 * POST /api/user/reviews
 * Authenticated user submits a platform review.
 */
router.post('/reviews', userAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }
    const r = Number(rating);
    if (r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    const review = await Review.create({ userId: req.user._id, rating: r, comment: comment.trim() });
    res.status(201).json({ success: true, message: 'Review submitted successfully', data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/user/tickets
 * Authenticated user opens a support ticket.
 */
router.post('/tickets', userAuth, async (req, res) => {
  try {
    const { subject, description, category } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }
    const ticket = await SupportTicket.create({
      userId: req.user._id,
      subject: subject.trim(),
      description: description.trim(),
      category: category || 'other',
    });
    res.status(201).json({ success: true, message: 'Ticket created successfully', data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/user/tickets/:id/message
 * Authenticated user replies to their own ticket.
 */
router.post('/tickets/:id/message', userAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    ticket.messages.push({ sender: 'user', content: content.trim() });
    await ticket.save();
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
