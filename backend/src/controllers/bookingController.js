
const mongoose = require('mongoose');
const BookingRequest = require('../models/BookingRequest');
const BookingAgreement = require('../models/BookingAgreement');
const AgreementTemplate = require('../models/AgreementTemplate');
const Room = require('../models/Room');
const BoardingHouse = require('../models/BoardingHouse');
const Notification = require('../models/Notification');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function isOwnerOrAdmin(user) {
  return user && ['owner', 'admin'].includes(user.role);
}

function isStudent(user) {
  return user && user.role === 'student';
}

exports.getOwnerAgreementTemplates = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req.user)) {
      return res.status(403).json({ success: false, message: 'Only owners can view agreement templates' });
    }

    const templates = await AgreementTemplate.find({ ownerId: req.user.userId })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch agreement templates', error: error.message });
  }
};

exports.createOwnerAgreementTemplate = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req.user)) {
      return res.status(403).json({ success: false, message: 'Only owners can create agreement templates' });
    }

    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();

    if (title.length < 3) {
      return res.status(400).json({ success: false, message: 'Template title must be at least 3 characters' });
    }

    if (content.length < 20) {
      return res.status(400).json({ success: false, message: 'Agreement content must be at least 20 characters' });
    }

    const titleKey = title.toLowerCase();
    let template = await AgreementTemplate.findOne({ ownerId: req.user.userId, titleKey });

    if (!template) {
      template = await AgreementTemplate.create({
        ownerId: req.user.userId,
        title,
        titleKey,
        currentVersion: 1,
        currentContent: content,
        versions: [
          {
            version: 1,
            title,
            content,
            createdAt: new Date(),
          },
        ],
      });
    } else {
      const nextVersion = Number(template.currentVersion || 0) + 1;
      template.title = title;
      template.currentVersion = nextVersion;
      template.currentContent = content;
      template.versions.push({
        version: nextVersion,
        title,
        content,
        createdAt: new Date(),
      });
      await template.save();
    }

    return res.status(201).json({ success: true, message: 'Agreement template saved', data: template.toObject() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save agreement template', error: error.message });
  }
};

exports.createBookingRequest = async (req, res) => {
  try {
    if (!isStudent(req.user)) {
      return res.status(403).json({ success: false, message: 'Only students can submit booking requests' });
    }

    const {
      roomId,
      houseId,
      bookingType = 'individual',
      groupId = null,
      groupName = '',
      groupSize = 1,
      moveInDate,
      contactNumber = '',
      durationMonths = 6,
      message = '',
      mutualFriendIds = [],
    } = req.body;

    const hasValidRoomId = Boolean(roomId) && mongoose.Types.ObjectId.isValid(roomId);

    if (!hasValidRoomId) {
      return res.status(400).json({ success: false, message: 'Valid roomId is required' });
    }

    if (!moveInDate) {
      return res.status(400).json({ success: false, message: 'moveInDate is required' });
    }

    const normalizedContactNumber = String(contactNumber || '').trim();
    if (!/^\d{10}$/.test(normalizedContactNumber)) {
      return res.status(400).json({ success: false, message: 'contactNumber must contain exactly 10 digits' });
    }

    const normalizedGroupName = String(groupName || '').trim();
    if (bookingType === 'group' && !normalizedGroupName) {
      return res.status(400).json({ success: false, message: 'groupName is required for group bookings' });
    }

    let room = null;
    let resolvedOwnerId = null;
    let resolvedHouseId = null;

    room = await Room.findById(roomId);
    if (!room || !room.ownerId) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    resolvedOwnerId = room.ownerId;
    resolvedHouseId = room.houseId || null;

    let group = null;
    if (bookingType === 'group') {
      // If groupId is not provided, create a new group with mutual friends
      if (!groupId) {
        const BookingGroup = require('../models/BookingGroup');
        const User = require('../models/User');
        const creator = await User.findById(req.user.userId);
        const users = await User.find({ _id: { $in: mutualFriendIds } });
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
          })),
        ];
        group = new BookingGroup({
          name: `Group-${new Date().getTime()}`,
          creatorId: creator._id,
          members,
          status: 'forming',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await group.save();
      } else {
        const BookingGroup = require('../models/BookingGroup');
        group = await BookingGroup.findById(groupId);
      }
    }

    const request = await BookingRequest.create({
      studentId: req.user.userId,
      ownerId: resolvedOwnerId,
      roomId: room?._id || null,
      houseId: resolvedHouseId,
      bookingType: bookingType === 'group' ? 'group' : 'individual',
      groupName: bookingType === 'group' ? normalizedGroupName : '',
      groupSize: bookingType === 'group' ? Math.max(1, Number(groupSize) || 1) : 1,
      groupId: group ? group._id : null,
      moveInDate,
      contactNumber: normalizedContactNumber,
      durationMonths: Math.max(1, Number(durationMonths) || 6),
      message,
      status: 'pending',
    });

    const hydrated = await BookingRequest.findById(request._id)
      .populate('roomId', 'name roomNumber price location')
      .populate('studentId', 'fullName email phoneNumber mobileNumber')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Booking request submitted',
      data: hydrated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit booking request', error: error.message });
  }
};

exports.getMyBookingRequests = async (req, res) => {
  try {
    if (!isStudent(req.user)) {
      return res.status(403).json({ success: false, message: 'Only students can view these requests' });
    }

    const requests = await BookingRequest.find({ studentId: req.user.userId })
      .populate('roomId', 'name roomNumber price location owner ownerPhone ownerEmail')
      .populate('houseId', 'name monthlyPrice address')
      .populate('ownerId', 'fullName email phoneNumber mobileNumber')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch booking requests', error: error.message });
  }
};

exports.getOwnerBookingRequests = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req.user)) {
      return res.status(403).json({ success: false, message: 'Only owners can view booking requests' });
    }

    const { status } = req.query;
    const filter = { ownerId: req.user.userId };
    if (status && ['pending', 'approved', 'rejected'].includes(String(status))) {
      filter.status = String(status);
    }

    const requests = await BookingRequest.find(filter)
      .populate('roomId', 'name roomNumber price location')
      .populate('houseId', 'name monthlyPrice address')
      .populate('studentId', 'fullName email phoneNumber mobileNumber')
      .populate('agreementId', 'title status sentAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch owner booking requests', error: error.message });
  }
};

exports.updateBookingRequestStatus = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req.user)) {
      return res.status(403).json({ success: false, message: 'Only owners can update booking requests' });
    }

    const { requestId } = req.params;
    const { status, rejectionReason = '' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: 'Invalid request id' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be approved or rejected' });
    }

    if (status === 'rejected' && String(rejectionReason).trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Rejection reason must be at least 5 characters' });
    }

    const request = await BookingRequest.findOne({ _id: requestId, ownerId: req.user.userId });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    request.status = status;
    request.processedAt = new Date();
    request.processedBy = req.user.userId;
    request.rejectionReason = status === 'rejected' ? String(rejectionReason).trim() : '';
    await request.save();

    const hydrated = await BookingRequest.findById(request._id)
      .populate('roomId', 'name roomNumber price location')
      .populate('studentId', 'fullName email phoneNumber mobileNumber')
      .populate('agreementId', 'title status sentAt')
      .lean();

    return res.status(200).json({
      success: true,
      message: `Booking request ${status}`,
      data: hydrated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update booking request status', error: error.message });
  }
};

exports.createAgreementForRequest = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req.user)) {
      return res.status(403).json({ success: false, message: 'Only owners can create agreements' });
    }

    const {
      bookingRequestId,
      title,
      terms,
      rentAmount,
      depositAmount = 0,
      periodStart,
      periodEnd,
      additionalClauses = [],
    } = req.body;

    if (!bookingRequestId || !mongoose.Types.ObjectId.isValid(bookingRequestId)) {
      return res.status(400).json({ success: false, message: 'Valid bookingRequestId is required' });
    }

    const request = await BookingRequest.findOne({ _id: bookingRequestId, ownerId: req.user.userId });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved requests can receive agreements' });
    }

    const alreadyExists = await BookingAgreement.findOne({ bookingRequestId: request._id });
    if (alreadyExists) {
      return res.status(409).json({ success: false, message: 'Agreement already sent for this request' });
    }

    const agreement = await BookingAgreement.create({
      ownerId: req.user.userId,
      studentId: request.studentId,
      roomId: request.roomId,
      bookingRequestId: request._id,
      title,
      terms,
      rentAmount: Number(rentAmount) || 0,
      depositAmount: Number(depositAmount) || 0,
      periodStart,
      periodEnd,
      additionalClauses: Array.isArray(additionalClauses)
        ? additionalClauses.filter((item) => String(item || '').trim().length > 0)
        : [],
      status: 'sent',
      sentAt: new Date(),
    });

    request.agreementId = agreement._id;
    await request.save();

    const hydrated = await BookingAgreement.findById(agreement._id)
      .populate('bookingRequestId', 'status moveInDate durationMonths bookingType groupName groupSize')
      .populate('studentId', 'fullName email phoneNumber mobileNumber')
      .populate('roomId', 'name roomNumber price location')
      .lean();

    // Send notification to student
    await Notification.create({
      user: agreement.studentId,
      type: 'system',
      title: 'New Agreement Sent',
      message: `A digital rental agreement has been sent to you for room: ${hydrated.roomId?.name || ''}. Please review and sign to proceed with your booking.`,
      data: { agreementId: agreement._id, bookingRequestId: agreement.bookingRequestId },
    });

    return res.status(201).json({
      success: true,
      message: 'Agreement created and sent',
      data: hydrated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create agreement', error: error.message });
  }
};

exports.getOwnerAgreements = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req.user)) {
      return res.status(403).json({ success: false, message: 'Only owners can view agreements' });
    }

    const { status } = req.query;
    const filter = { ownerId: req.user.userId };
    if (status && ['sent', 'accepted', 'rejected'].includes(String(status))) {
      filter.status = String(status);
    }

    const agreements = await BookingAgreement.find(filter)
      .populate('bookingRequestId', 'status moveInDate durationMonths bookingType groupName groupSize')
      .populate('studentId', 'fullName email phoneNumber mobileNumber')
      .populate('roomId', 'name roomNumber price location')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: agreements });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch agreements', error: error.message });
  }
};

exports.getMyAgreements = async (req, res) => {
  try {
    if (!isStudent(req.user)) {
      return res.status(403).json({ success: false, message: 'Only students can view agreements' });
    }

    const agreements = await BookingAgreement.find({ studentId: req.user.userId })
      .populate('bookingRequestId', 'status moveInDate durationMonths bookingType groupName groupSize')
      .populate('ownerId', 'fullName email phoneNumber mobileNumber')
      .populate('roomId', 'name roomNumber price location')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: agreements });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch agreements', error: error.message });
  }
};

exports.respondToAgreement = async (req, res) => {
  try {
    if (!isStudent(req.user)) {
      return res.status(403).json({ success: false, message: 'Only students can respond to agreements' });
    }

    const { agreementId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(agreementId)) {
      return res.status(400).json({ success: false, message: 'Invalid agreement id' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be accepted or rejected' });
    }

    const agreement = await BookingAgreement.findOne({ _id: agreementId, studentId: req.user.userId });
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found' });
    }

    agreement.status = status;
    agreement.acceptedAt = status === 'accepted' ? new Date() : null;
    agreement.rejectedAt = status === 'rejected' ? new Date() : null;
    await agreement.save();

    let pdfUrl = null;
    if (status === 'accepted') {
      // Generate PDF
      const pdfDir = path.join(__dirname, '../../public/agreements');
      if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
      const pdfPath = path.join(pdfDir, `agreement_${agreement._id}.pdf`);
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(pdfPath));
      doc.fontSize(20).text('Boarding House Rental Agreement', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Agreement ID: ${agreement._id}`);
      doc.text(`Room: ${agreement.roomId}`);
      doc.text(`Student: ${req.user.userId}`);
      doc.text(`Owner: ${agreement.ownerId}`);
      doc.text(`Period: ${agreement.periodStart?.toISOString().slice(0,10)} to ${agreement.periodEnd?.toISOString().slice(0,10)}`);
      doc.moveDown();
      doc.text('Terms:');
      doc.text(agreement.terms);
      if (agreement.additionalClauses && agreement.additionalClauses.length > 0) {
        doc.moveDown();
        doc.text('Additional Clauses:');
        agreement.additionalClauses.forEach((clause, idx) => {
          doc.text(`${idx + 1}. ${clause}`);
        });
      }
      doc.end();
      pdfUrl = `/agreements/agreement_${agreement._id}.pdf`;
    }

    const hydrated = await BookingAgreement.findById(agreement._id)
      .populate('bookingRequestId', 'status moveInDate durationMonths bookingType groupName groupSize')
      .populate('ownerId', 'fullName email phoneNumber mobileNumber')
      .populate('roomId', 'name roomNumber price location')
      .lean();

    // Notify owner and student on sign
    if (status === 'accepted') {
      await Notification.create({
        user: agreement.ownerId,
        type: 'system',
        title: 'Agreement Signed',
        message: `The student has signed the agreement for room: ${hydrated.roomId?.name || ''}.`,
        data: { agreementId: agreement._id, bookingRequestId: agreement.bookingRequestId, pdfUrl },
      });
      await Notification.create({
        user: agreement.studentId,
        type: 'system',
        title: 'Agreement Signed',
        message: `You have signed the agreement. Download your PDF here.`,
        data: { agreementId: agreement._id, bookingRequestId: agreement.bookingRequestId, pdfUrl },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Agreement ${status}`,
      data: { ...hydrated, pdfUrl },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to respond to agreement', error: error.message });
  }
};

exports.sendAgreementFromTemplate = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req.user)) {
      return res.status(403).json({ success: false, message: 'Only owners can send agreements' });
    }

    const {
      bookingRequestId,
      templateVersionId,
      expirationDays = 7,
    } = req.body;

    if (!bookingRequestId || !mongoose.Types.ObjectId.isValid(bookingRequestId)) {
      return res.status(400).json({ success: false, message: 'Valid bookingRequestId is required' });
    }

    if (!templateVersionId) {
      return res.status(400).json({ success: false, message: 'templateVersionId is required' });
    }

    // Get booking request
    const bookingRequest = await BookingRequest.findOne({
      _id: bookingRequestId,
      ownerId: req.user.userId,
    })
      .populate('studentId', '_id fullName email')
      .populate('roomId', '_id name price')
      .populate('houseId', '_id name')
      .populate('groupId');

    if (!bookingRequest) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    if (bookingRequest.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved bookings can receive agreements' });
    }

    // Check if agreement already exists
    const existingAgreement = await BookingAgreement.findOne({ bookingRequestId });
    if (existingAgreement) {
      return res.status(409).json({ success: false, message: 'Agreement already exists for this booking' });
    }

    // Get template version
    const template = await AgreementTemplate.findOne({
      _id: templateVersionId,
      ownerId: req.user.userId,
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const currentVersion = template.versions[template.versions.length - 1];
    if (!currentVersion) {
      return res.status(400).json({ success: false, message: 'Template has no versions' });
    }

    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);

    // Prepare agreement data
    const roomName = bookingRequest.roomId?.name || bookingRequest.houseId?.name || 'Room';
    const periodEnd = new Date(bookingRequest.moveInDate);
    periodEnd.setMonth(periodEnd.getMonth() + bookingRequest.durationMonths);

    // Create agreement
    const agreement = await BookingAgreement.create({
      ownerId: req.user.userId,
      studentId: bookingRequest.studentId._id,
      roomId: bookingRequest.roomId?._id || null,
      bookingRequestId: bookingRequest._id,
      title: `${currentVersion.title} - ${roomName}`,
      terms: currentVersion.content,
      rentAmount: bookingRequest.roomId?.price || 0,
      depositAmount: 0,
      periodStart: bookingRequest.moveInDate,
      periodEnd,
      additionalClauses: [],
      status: bookingRequest.bookingType === 'group' ? 'partially_signed' : 'pending',
      sentAt: new Date(),
      expirationDate,
    });

    // If group booking, initialize group member signatures
    if (bookingRequest.bookingType === 'group' && bookingRequest.groupId?.members) {
      agreement.groupMemberSignatures = bookingRequest.groupId.members.map((member) => ({
        memberId: member.userId,
        memberName: member.name,
        memberEmail: member.email,
        status: 'pending',
      }));
      await agreement.save();
    }

    // Update booking request
    bookingRequest.agreementId = agreement._id;
    await bookingRequest.save();

    // Send notification to student
    await Notification.create({
      user: bookingRequest.studentId._id,
      type: 'agreement_pending',
      title: 'Agreement Pending Your Signature',
      message: `A rental agreement for ${roomName} has been sent. Please review and sign before ${expirationDate.toLocaleDateString()}.`,
      data: {
        agreementId: agreement._id,
        bookingRequestId: bookingRequest._id,
        expirationDate,
      },
    });

    // If group booking, send notifications to all group members
    if (bookingRequest.bookingType === 'group' && bookingRequest.groupId?.members) {
      for (const member of bookingRequest.groupId.members) {
        if (member.userId.toString() !== bookingRequest.studentId._id.toString()) {
          await Notification.create({
            user: member.userId,
            type: 'agreement_pending',
            title: 'Agreement Pending Your Signature',
            message: `An agreement for your group booking has been sent. Please review and sign before ${expirationDate.toLocaleDateString()}.`,
            data: {
              agreementId: agreement._id,
              bookingRequestId: bookingRequest._id,
              expirationDate,
            },
          });
        }
      }
    }

    const hydrated = await BookingAgreement.findById(agreement._id)
      .populate('bookingRequestId', '_id status moveInDate durationMonths bookingType groupName groupSize')
      .populate('studentId', '_id fullName email')
      .populate('roomId', '_id name price')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Agreement sent successfully',
      data: hydrated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send agreement', error: error.message });
  }
};

exports.signAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { action } = req.body; // 'sign' or 'reject'

    if (!mongoose.Types.ObjectId.isValid(agreementId)) {
      return res.status(400).json({ success: false, message: 'Invalid agreement id' });
    }

    if (!['sign', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'action must be sign or reject' });
    }

    const agreement = await BookingAgreement.findById(agreementId)
      .populate('bookingRequestId')
      .populate('studentId', 'fullName email')
      .populate('roomId', 'name');

    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found' });
    }

    // Check if user is the student or a group member
    const isStudent = agreement.studentId._id.toString() === req.user.userId;
    let isGroupMember = false;
    let memberSignature = null;

    if (agreement.groupMemberSignatures && agreement.groupMemberSignatures.length > 0) {
      memberSignature = agreement.groupMemberSignatures.find(
        (sig) => sig.memberId.toString() === req.user.userId
      );
      isGroupMember = !!memberSignature;
    }

    if (!isStudent && !isGroupMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to sign this agreement' });
    }

    if (action === 'reject') {
      agreement.status = 'rejected';
      agreement.rejectedAt = new Date();
    } else if (action === 'sign') {
      if (isStudent) {
        agreement.status = 'signed';
        agreement.signedAt = new Date();
        agreement.acknowledgedAt = new Date();
      } else if (isGroupMember) {
        memberSignature.status = 'signed';
        memberSignature.signedAt = new Date();

        // Check if all group members have signed
        const allSigned = agreement.groupMemberSignatures.every(
          (sig) => sig.status === 'signed'
        );
        if (allSigned) {
          agreement.status = 'signed';
          agreement.signedAt = new Date();
        }
      }
    }

    await agreement.save();

    // Generate PDF if signed
    let pdfUrl = null;
    if (action === 'sign') {
      pdfUrl = await generateAgreementPDF(agreement, req.user.userId);
    }

    const hydrated = await BookingAgreement.findById(agreement._id)
      .populate('bookingRequestId', 'status moveInDate durationMonths bookingType groupName groupSize')
      .populate('studentId', 'fullName email')
      .populate('roomId', 'name price')
      .lean();

    // Send notifications
    if (action === 'sign') {
      const notificationTitle = memberSignature ? 'Agreement Partially Signed' : 'Agreement Signed';
      const notificationMsg = memberSignature
        ? `${req.user.fullName} has signed the agreement.`
        : 'You have signed the agreement. Download your PDF.';

      await Notification.create({
        user: agreement.ownerId,
        type: memberSignature ? 'system' : 'agreement_signed',
        title: notificationTitle,
        message: notificationMsg,
        data: { agreementId: agreement._id, bookingRequestId: agreement.bookingRequestId, pdfUrl },
      });
    } else {
      await Notification.create({
        user: agreement.ownerId,
        type: 'system',
        title: 'Agreement Rejected',
        message: `The student has rejected the agreement for ${agreement.roomId?.name || 'the booking'}.`,
        data: { agreementId: agreement._id, bookingRequestId: agreement.bookingRequestId },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Agreement ${action === 'sign' ? 'signed' : 'rejected'} successfully`,
      data: { ...hydrated, pdfUrl },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to sign agreement',
      error: error.message,
    });
  }
};

exports.getOwnerSignedAgreements = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req.user)) {
      return res.status(403).json({ success: false, message: 'Only owners can view agreements' });
    }

    const { status, sortBy = 'createdAt' } = req.query;
    const filter = { ownerId: req.user.userId };

    // Map UI statuses to DB statuses
    if (status) {
      if (status === 'pending') filter.status = 'pending';
      else if (status === 'signed') filter.status = 'signed';
      else if (status === 'partially_signed') filter.status = 'partially_signed';
      else if (status === 'expired') {
        filter.expirationDate = { $lt: new Date() };
        filter.status = { $in: ['pending', 'partially_signed'] };
      }
    }

    let sortObj = {};
    if (sortBy === 'recent') sortObj = { createdAt: -1 };
    else if (sortBy === 'oldest') sortObj = { createdAt: 1 };
    else if (sortBy === 'expiringsoon') sortObj = { expirationDate: 1 };

    const agreements = await BookingAgreement.find(filter)
      .populate('bookingRequestId', 'status moveInDate durationMonths bookingType groupName groupSize')
      .populate('studentId', 'fullName email mobileNumber')
      .populate('roomId', 'name roomNumber price location')
      .sort(sortObj)
      .lean();

    // Add computed status for expired agreements
    const now = new Date();
    const enriched = agreements.map((agr) => ({
      ...agr,
      computedStatus:
        agr.status === 'signed'
          ? agr.periodEnd < now
            ? 'expired'
            : 'signed'
          : agr.status,
    }));

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch agreements', error: error.message });
  }
};

exports.downloadAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agreementId)) {
      return res.status(400).json({ success: false, message: 'Invalid agreement id' });
    }

    const agreement = await BookingAgreement.findById(agreementId)
      .populate('studentId', 'fullName')
      .populate('roomId', 'name')
      .populate('ownerId', 'fullName')
      .lean();

    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found' });
    }

    // Check authorization
    const isOwner = agreement.ownerId._id.toString() === req.user.userId;
    const isStudent = agreement.studentId._id.toString() === req.user.userId;

    if (!isOwner && !isStudent) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this agreement' });
    }

    // Generate PDF
    const pdfDir = path.join(__dirname, '../../public/agreements');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const pdfFileName = `agreement_${agreement._id}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    // Create PDF document
    const doc = new PDFDocument({
      margin: 50,
      bufferPages: true,
    });

    // Pipe to file
    doc.pipe(fs.createWriteStream(pdfPath));

    // Set up document
    doc.fontSize(24).font('Helvetica-Bold').text('BOARDING HOUSE RENTAL AGREEMENT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Agreement ID: AGR-${agreement._id.toString().slice(-8).toUpperCase()}`, {
      align: 'center',
    });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Agreement details
    doc.fontSize(11).font('Helvetica-Bold').text('AGREEMENT DETAILS', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Property: ${agreement.roomId?.name || 'Room'}`, { indent: 20 });
    doc.text(`Tenant: ${agreement.studentId?.fullName || 'N/A'}`, { indent: 20 });
    doc.text(`Owner: ${agreement.ownerId?.fullName || 'N/A'}`, { indent: 20 });
    doc.text(
      `Duration: ${new Date(agreement.periodStart).toLocaleDateString()} to ${new Date(
        agreement.periodEnd
      ).toLocaleDateString()}`,
      { indent: 20 }
    );
    doc.text(`Monthly Rent: Rs. ${agreement.rentAmount}`, { indent: 20 });
    if (agreement.depositAmount > 0) {
      doc.text(`Security Deposit: Rs. ${agreement.depositAmount}`, { indent: 20 });
    }
    doc.moveDown();

    // Terms
    doc.fontSize(11).font('Helvetica-Bold').text('TERMS AND CONDITIONS', { underline: true });
    doc.fontSize(10).font('Helvetica').text(agreement.terms, { align: 'left' });
    doc.moveDown();

    // Additional clauses
    if (agreement.additionalClauses && agreement.additionalClauses.length > 0) {
      doc.fontSize(11).font('Helvetica-Bold').text('ADDITIONAL CLAUSES', { underline: true });
      doc.fontSize(10).font('Helvetica');
      agreement.additionalClauses.forEach((clause, idx) => {
        doc.text(`${idx + 1}. ${clause}`, { indent: 20 });
      });
      doc.moveDown();
    }

    // Signature section
    doc.fontSize(11).font('Helvetica-Bold').text('SIGNATURE', { underline: true });
    doc.moveDown(2);
    doc.fontSize(9).font('Helvetica').text('Tenant Signature: ________________________  Date: ____________', {
      indent: 20,
    });
    doc.moveDown(2);
    doc.text('Owner Signature: ________________________  Date: ____________', { indent: 20 });

    // Footer
    doc.moveTo(50, doc.y + 20).lineTo(550, doc.y + 20).stroke();
    doc.fontSize(8).text('This agreement is digitally signed and approved by BordingBook.', {
      align: 'center',
      y: doc.y + 25,
    });

    doc.end();

    // Send file
    const stream = fs.createReadStream(pdfPath);
    stream.on('error', (err) => {
      res.status(500).json({ success: false, message: 'Failed to generate PDF', error: err.message });
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="agreement_${agreement._id}.pdf"`);
    stream.pipe(res);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to download agreement', error: error.message });
  }
};

// Helper function to generate and store PDF
async function generateAgreementPDF(agreement, userId) {
  try {
    const pdfDir = path.join(__dirname, '../../public/agreements');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const pdfFileName = `agreement_${agreement._id}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    const doc = new PDFDocument({
      margin: 50,
      bufferPages: true,
    });

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(24).font('Helvetica-Bold').text('BOARDING HOUSE RENTAL AGREEMENT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Agreement ID: AGR-${agreement._id.toString().slice(-8).toUpperCase()}`, {
      align: 'center',
    });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    doc.fontSize(11).font('Helvetica-Bold').text('AGREEMENT DETAILS', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Property: ${agreement.roomId?.name || 'Room'}`, { indent: 20 });
    doc.text(`Tenant: ${agreement.studentId?.fullName || 'N/A'}`, { indent: 20 });
    doc.text(`Owner: ${agreement.ownerId?.fullName || 'N/A'}`, { indent: 20 });
    doc.text(
      `Duration: ${new Date(agreement.periodStart).toLocaleDateString()} to ${new Date(
        agreement.periodEnd
      ).toLocaleDateString()}`,
      { indent: 20 }
    );
    doc.text(`Monthly Rent: Rs. ${agreement.rentAmount}`, { indent: 20 });

    doc.moveDown();
    doc.fontSize(11).font('Helvetica-Bold').text('TERMS AND CONDITIONS', { underline: true });
    doc.fontSize(10).font('Helvetica').text(agreement.terms, { align: 'left' });

    if (agreement.additionalClauses && agreement.additionalClauses.length > 0) {
      doc.moveDown();
      doc.fontSize(11).font('Helvetica-Bold').text('ADDITIONAL CLAUSES', { underline: true });
      doc.fontSize(10).font('Helvetica');
      agreement.additionalClauses.forEach((clause, idx) => {
        doc.text(`${idx + 1}. ${clause}`, { indent: 20 });
      });
    }

    doc.end();

    return `/agreements/${pdfFileName}`;
  } catch (error) {
    console.error('PDF generation error:', error);
    return null;
  }
}
