/**
 * FILE: paymentService.js
 * PURPOSE: Handle all payment-related business logic and database operations
 * DESCRIPTION: Service layer that processes payment submissions, approvals,
 *              rejections, receipt generation, cycle management, and notifications
 */

const mongoose = require('mongoose');
const StudentPayment = require('../../models/StudentPayment');
const PaymentReceipt = require('../../models/PaymentReceipt');
const PaymentCycle = require('../../models/PaymentCycle');
const Notification = require('../../models/Notification');
const BookingAgreement = require('../../models/BookingAgreement');
const Room = require('../../models/Room');
const BoardingHouse = require('../../models/BoardingHouse');
const User = require('../../models/User');
const fs = require('fs');
const path = require('path');
const { generateReceiptPdf } = require('../utils/receiptGenerator');

/**
 * Submit payment slip for a booking agreement
 * @param {Object} paymentData - Payment submission details
 * @returns {Object} Created StudentPayment record
 */
exports.submitPaymentSlip = async (paymentData) => {
  try {
    const {
      studentId,
      bookingAgreementId,
      paymentAmount,
      remarks,
      paymentSlipPath,
      paymentSlipUrl,
      fileType,
      fileSize,
    } = paymentData;

    // Validate bookingAgreementId format
    if (!bookingAgreementId || typeof bookingAgreementId !== 'string' || bookingAgreementId.trim() === '') {
      throw new Error('Valid booking agreement ID is required');
    }

    // Basic ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(bookingAgreementId)) {
      throw new Error('Invalid booking agreement ID format');
    }

    console.log('💳 Submitting payment slip:');
    console.log('   Student ID:', studentId);
    console.log('   Booking Agreement ID:', bookingAgreementId);

    // Fetch accepted booking agreement with all required references
    const bookingAgreement = await BookingAgreement.findById(bookingAgreementId)
      .populate({
        path: 'roomId',
        select: '_id houseId name roomNumber bedCount price',
        populate: { path: 'houseId', select: '_id name' }
      })
      .populate('studentId', 'fullName email')
      .lean(); // Use lean() to get the raw document including any extra fields

    if (!bookingAgreement) {
      throw new Error('Booking agreement not found');
    }

    console.log('✅ Booking agreement found');
    console.log('   Status:', bookingAgreement.status);
    console.log('   Full booking agreement:', JSON.stringify(bookingAgreement, null, 2));
    console.log('   Boarding House ID (from doc):', bookingAgreement.boardingHouseId);
    console.log('   Boarding House ID (from room):', bookingAgreement.roomId?.houseId?._id);
    console.log('   Owner ID:', bookingAgreement.ownerId);

    // Validate booking agreement is accepted
    if (bookingAgreement.status !== 'accepted') {
      throw new Error(`Booking agreement is not accepted. Current status: ${bookingAgreement.status}`);
    }

    // Validate student ID matches
    if (bookingAgreement.studentId._id.toString() !== studentId.toString()) {
      throw new Error('Student does not own this booking agreement');
    }

    // Extract required fields directly from booking agreement
    const roomId = bookingAgreement.roomId._id;
    
    // Try to get boardingHouseId from multiple sources
    let boardingHouseId = bookingAgreement.boardingHouseId || bookingAgreement.roomId?.houseId?._id;
    
    console.log('📍 Extracted fields (attempt 1):');
    console.log('   Room ID:', roomId);
    console.log('   Boarding House ID:', boardingHouseId);
    
    // If still not found, try to find the boarding house by owner and room
    if (!boardingHouseId) {
      console.log('⚠️ boardingHouseId not found anywhere, attempting to locate via owner...');
      const ownedHouses = await BoardingHouse.find({ ownerId: bookingAgreement.ownerId }).select('_id');
      
      if (ownedHouses.length > 0) {
        boardingHouseId = ownedHouses[0]._id;
        console.log('✅ Found boarding house via owner:', boardingHouseId);
      } else {
        throw new Error('No boarding house found for the owner');
      }
    }
    
    const ownerId = bookingAgreement.ownerId;
    const bookingRequestId = bookingAgreement.bookingRequestId;

    console.log('📍 Extracted fields:');
    console.log('   Room ID:', roomId);
    console.log('   Boarding House ID:', boardingHouseId);
    console.log('   Owner ID:', ownerId);
    console.log('   Booking Request ID:', bookingRequestId);

    // Validate all required fields exist
    if (!roomId || !boardingHouseId || !ownerId || !bookingRequestId) {
      console.error('❌ Missing required fields from booking agreement:');
      console.error('   roomId:', roomId);
      console.error('   boardingHouseId:', boardingHouseId);
      console.error('   ownerId:', ownerId);
      console.error('   bookingRequestId:', bookingRequestId);
      throw new Error('Booking agreement missing required references. All fields must be populated.');
    }

    console.log('✅ All required fields validated:');
    console.log('   Room ID:', roomId);
    console.log('   Boarding House ID:', boardingHouseId);
    console.log('   Owner ID:', ownerId);
    console.log('   Booking Request ID:', bookingRequestId);

    // Calculate cycle number (count of previous approved payments + 1)
    const previousPayments = await StudentPayment.countDocuments({
      bookingAgreementId,
      status: 'approved',
    });

    const cycleNumber = previousPayments + 1;

    // Create new payment record with correctly extracted data
    const newPayment = new StudentPayment({
      studentId, // Student submitting the payment
      roomId, // Room ID from booking agreement
      boardingHouseId, // Boarding house ID from room (NOT owner ID)
      bookingAgreementId, // Booking agreement reference
      paymentAmount,
      remarks,
      paymentSlipPath,
      paymentSlipUrl,
      uploadedAt: new Date(),
      fileType,
      fileSize,
      cycleNumber,
      status: 'submitted', // Payment is now in submitted state waiting for owner approval
    });

    await newPayment.save();

    console.log('✅ Payment slip created successfully:');
    console.log('   Payment ID:', newPayment._id);
    console.log('   Boarding House ID:', newPayment.boardingHouseId);
    console.log('   Status:', newPayment.status);
    console.log('   Will appear in owner dashboard filtering by boardingHouseId:', boardingHouseId);

    return {
      success: true,
      message: 'Payment slip submitted successfully',
      paymentId: newPayment._id,
      cycleNumber: newPayment.cycleNumber,
      boardingHouseId: boardingHouseId, // Return for verification
    };
  } catch (error) {
    console.error('❌ Error submitting payment slip:', error.message);
    throw error;
  }
};

/**
 * Get pending payment slips for owner review
 * @param {String} ownerId - Owner's user ID
 * @returns {Array} List of pending payments
 */
exports.getPendingPayments = async (ownerId) => {
  try {
    console.log('🔍 Service: getPendingPayments for ownerId:', ownerId);

    // First, find all boarding houses owned by this owner
    const ownedHouses = await BoardingHouse.find({ ownerId }).select('_id');
    console.log('🏠 Found owned houses:', ownedHouses.length);
    console.log('   House IDs:', ownedHouses.map(h => h._id.toString()));

    const houseIds = ownedHouses.map(h => h._id);

    if (houseIds.length === 0) {
      console.log('⚠️ No boarding houses found for owner');
      return []; // No boarding houses, no pending payments
    }

    // Get all pending payments (submitted status) for owner's boarding houses
    const pendingPayments = await StudentPayment.find({
      boardingHouseId: { $in: houseIds },
      status: 'submitted',
    })
      .populate('studentId', 'fullName email mobileNumber')
      .populate('roomId', 'name roomNumber bedCount price')
      .populate('bookingAgreementId')
      .populate('boardingHouseId', 'name')
      .sort({ createdAt: -1 });

    console.log('✅ Found pending payments:', pendingPayments.length);
    if (pendingPayments.length > 0) {
      console.log('   First payment:', {
        id: pendingPayments[0]._id,
        status: pendingPayments[0].status,
        amount: pendingPayments[0].paymentAmount,
        slipUrl: pendingPayments[0].paymentSlipUrl,
      });
    }

    return pendingPayments;
  } catch (error) {
    console.error('❌ Error in getPendingPayments:', error);
    throw error;
  }
};

/**
 * Approve payment slip and generate receipt
 * @param {String} paymentId - Payment record ID
 * @param {String} approverId - Owner/Admin user ID
 * @returns {Object} Approval result with receipt details
 */
exports.approvePaymentSlip = async (paymentId, approverId) => {
  try {
    console.log('💰 Approving payment slip:');
    console.log('   Payment ID:', paymentId);
    console.log('   Approved By:', approverId);

    // Fetch payment with all related data
    const payment = await StudentPayment.findById(paymentId)
      .populate('studentId')
      .populate('roomId')
      .populate('bookingAgreementId');

    console.log('🔍 Payment object fetched:');
    console.log('   Payment found:', !!payment);
    if (payment) {
      console.log('   Student ID type:', typeof payment.studentId);
      console.log('   Room ID type:', typeof payment.roomId);
      console.log('   Booking Agree ID type:', typeof payment.bookingAgreementId);
    }

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'submitted') {
      throw new Error('Payment can only be approved if it is in submitted status');
    }

    console.log('✅ Payment found - Status:', payment.status);
    console.log('   Student:', payment.studentId._id);
    console.log('   Boarding House:', payment.boardingHouseId);
    console.log('   Room:', payment.roomId._id);

    // Validate that boardingHouseId exists
    if (!payment.boardingHouseId) {
      throw new Error('Boarding house ID not found in payment record');
    }

    // ========== STEP 1: Check Existing PaymentCycle ==========
    const existingCycle = await PaymentCycle.findOne({
      studentId: payment.studentId._id,
      boardingHouseId: payment.boardingHouseId,
      roomId: payment.roomId._id,
      isActive: true,
    });

    console.log('🔄 Checking payment cycles...');
    let currentCycle = null;
    let nextCycle = null;

    if (!existingCycle) {
      // ========== SCENARIO 1: NEW STUDENT - No cycle exists ==========
      console.log('📌 SCENARIO: NEW STUDENT - Creating first payment cycle');

      const approvalTime = new Date();
      const dueDate = new Date(approvalTime.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // CREATE CYCLE 1 (Current - PAID)
      currentCycle = new PaymentCycle({
        studentId: payment.studentId._id,
        bookingAgreementId: payment.bookingAgreementId._id,
        roomId: payment.roomId._id,
        boardingHouseId: payment.boardingHouseId,
        cycleNumber: 1,
        startDate: approvalTime,
        dueDate: dueDate,
        expectedAmount: payment.roomId.price, // Use room price
        paymentStatus: 'paid',
        paymentId: payment._id,
        isActive: false, // Mark as done
      });
      await currentCycle.save();
      console.log('✅ Cycle 1 created (PAID):', currentCycle._id);

      // CREATE CYCLE 2 (Next - PENDING)
      nextCycle = new PaymentCycle({
        studentId: payment.studentId._id,
        bookingAgreementId: payment.bookingAgreementId._id,
        roomId: payment.roomId._id,
        boardingHouseId: payment.boardingHouseId,
        cycleNumber: 2,
        startDate: dueDate, // Starts from cycle 1 due date
        dueDate: new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        expectedAmount: payment.roomId.price,
        paymentStatus: 'pending',
        paymentId: null,
        isActive: true, // This is the current active cycle
      });
      await nextCycle.save();
      console.log('✅ Cycle 2 created (PENDING):', nextCycle._id);

    } else {
      // ========== SCENARIO 2: EXISTING STUDENT - Cycle already exists ==========
      console.log('📌 SCENARIO: EXISTING STUDENT - Updating payment cycle');

      // UPDATE CURRENT CYCLE as PAID
      currentCycle = existingCycle;
      currentCycle.paymentStatus = 'paid';
      currentCycle.paymentId = payment._id;
      currentCycle.isActive = false; // Mark as done
      await currentCycle.save();
      console.log('✅ Cycle updated to PAID:', currentCycle._id);

      // CREATE NEXT CYCLE from current due date
      const nextStartDate = currentCycle.dueDate; // Use ORIGINAL due date, not approval date
      const nextDueDate = new Date(nextStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      nextCycle = new PaymentCycle({
        studentId: payment.studentId._id,
        bookingAgreementId: payment.bookingAgreementId._id,
        roomId: payment.roomId._id,
        boardingHouseId: payment.boardingHouseId,
        cycleNumber: currentCycle.cycleNumber + 1,
        startDate: nextStartDate, // From original due date
        dueDate: nextDueDate,
        expectedAmount: payment.roomId.price,
        paymentStatus: 'pending',
        paymentId: null,
        isActive: true, // New active cycle
      });
      await nextCycle.save();
      console.log('✅ Next cycle created (PENDING):', nextCycle._id);
    }

    // ========== STEP 2: Generate Receipt (After cycles are created) ==========
    let receipt;
    let receiptError = null;
    try {
      receipt = await this.generateReceipt(payment, approverId, currentCycle);
      console.log('📄 Receipt generated:', receipt.receiptNumber);
    } catch (err) {
      receiptError = err;
      console.error('❌ Error generating receipt:', err.message);
      console.error('   Stack:', err.stack);
      // Don't throw here - create a placeholder receipt so approval can complete
      console.warn('⚠️  Continuing with approval despite receipt generation error');
      
      // Create a minimal receipt record for tracking
      const studentId = payment.studentId && typeof payment.studentId === 'object' 
        ? payment.studentId._id 
        : payment.studentId;
      
      receipt = new PaymentReceipt({
        studentPaymentId: payment._id,
        studentId: studentId,
        roomId: payment.roomId && typeof payment.roomId === 'object' 
          ? payment.roomId._id 
          : payment.roomId,
        boardingHouseId: payment.boardingHouseId,
        receiptNumber: `REC-ERR-${Date.now()}-${String(studentId).slice(-8)}`,
        receiptDate: new Date(),
        paymentAmount: payment.paymentAmount,
        paymentMethod: 'file_upload',
        studentRemarks: payment.remarks,
        approvedBy: approverId,
        validFromDate: currentCycle.startDate,
        validToDate: currentCycle.dueDate,
        cycleNumber: currentCycle.cycleNumber,
        receiptUrl: '/receipts/pending-generation', // Placeholder
      });
      await receipt.save();
      console.log('📋 Placeholder receipt created:', receipt.receiptNumber);
    }

    // ========== STEP 3: Update StudentPayment ==========
    payment.status = 'approved';
    payment.approvedBy = approverId;
    payment.approvedAt = new Date();
    payment.receiptId = receipt._id;
    payment.cycleStartDate = currentCycle.startDate;
    payment.dueDate = currentCycle.dueDate;
    payment.isOverdue = false;
    await payment.save();
    console.log('✅ StudentPayment updated - Status: APPROVED');

    // ========== STEP 5: Create Approval Notification ==========
    const notification = new Notification({
      user: payment.studentId._id,
      type: 'payment_approved',
      title: 'Payment Approved ✓',
      message: `Your payment of Rs. ${payment.paymentAmount} has been approved. Receipt: ${receipt.receiptNumber}`,
      data: {
        receiptNumber: receipt.receiptNumber,
        receiptUrl: receipt.receiptUrl,
      },
    });
    await notification.save();
    console.log('📬 Approval notification created');

    console.log('✅ APPROVAL COMPLETE');
    console.log('   Receipt Number:', receipt.receiptNumber);
    console.log('   Current Cycle:', currentCycle.cycleNumber, '(PAID)');
    console.log('   Next Cycle:', nextCycle.cycleNumber, '(PENDING)');
    console.log('   Next Due Date:', nextCycle.dueDate.toDateString());

    return {
      success: true,
      message: 'Payment approved successfully',
      paymentId: payment._id,
      receiptId: receipt._id,
      receiptNumber: receipt.receiptNumber,
      currentCycle: {
        cycleNumber: currentCycle.cycleNumber,
        status: 'paid',
        startDate: currentCycle.startDate,
        dueDate: currentCycle.dueDate,
      },
      nextCycle: {
        cycleNumber: nextCycle.cycleNumber,
        status: 'pending',
        dueDate: nextCycle.dueDate,
      },
    };
  } catch (error) {
    console.error('❌ Error approving payment slip:', error.message);
    throw error;
  }
};

/**
 * Reject payment slip
 * @param {String} paymentId - Payment record ID
 * @param {String} approverId - Owner/Admin user ID
 * @param {String} rejectionReason - Reason for rejection
 * @returns {Object} Rejection result
 */
exports.rejectPaymentSlip = async (paymentId, approverId, rejectionReason) => {
  try {
    const payment = await StudentPayment.findById(paymentId).populate('studentId');

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'submitted') {
      throw new Error('Payment can only be rejected if it is in submitted status');
    }

    // Update payment status
    payment.status = 'rejected';
    payment.rejectionReason = rejectionReason;
    payment.rejectedAt = new Date();

    await payment.save();

    // Create notification for student
    const notification = new Notification({
      user: payment.studentId._id,
      type: 'payment_rejected',
      title: '❌ Payment Rejected',
      message: `Your payment submission has been rejected. Reason: ${rejectionReason}`,
      data: {
        paymentId: payment._id,
        rejectionReason: rejectionReason,
      },
      read: false,
    });

    await notification.save();
    
    console.log('📬 Rejection notification created:');
    console.log('   Student ID:', payment.studentId._id);
    console.log('   Notification ID:', notification._id);
    console.log('   Reason:', rejectionReason);

    return {
      success: true,
      message: 'Payment rejected successfully',
      paymentId: payment._id,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Generate receipt after payment approval
 * @param {Object} payment - Approved StudentPayment document
 * @param {String} approverId - Owner who approved
 * @returns {Object} Created PaymentReceipt record
 */
exports.generateReceipt = async (payment, approverId, currentCycle) => {
  try {
    const receiptDate = new Date();
    const dateStr = receiptDate
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '-');
    const receiptNumber = `REC-${dateStr}-${payment.studentId._id.toString().slice(-8)}-${currentCycle.cycleNumber
      .toString()
      .padStart(3, '0')}`;

    // Create receipt record
    const receipt = new PaymentReceipt({
      studentPaymentId: payment._id,
      studentId: payment.studentId._id,
      roomId: payment.roomId._id,
      boardingHouseId: payment.boardingHouseId,
      receiptNumber,
      receiptDate: new Date(),
      paymentAmount: payment.paymentAmount,
      paymentMethod: 'file_upload',
      studentRemarks: payment.remarks,
      approvedBy: approverId,
      // Add cycle validity period
      validFromDate: currentCycle.startDate,
      validToDate: currentCycle.dueDate,
      cycleNumber: currentCycle.cycleNumber,
    });

    // Generate PDF receipt
    const pdfPath = await generateReceiptPdf(receipt, payment);
    const receiptUrl = `/uploads/receipts/${receiptNumber}.pdf`;

    receipt.receiptPath = pdfPath;
    receipt.receiptUrl = receiptUrl;

    await receipt.save();

    return receipt;
  } catch (error) {
    throw error;
  }
};

/**
 * Get student payment history
 * @param {String} studentId - Student's user ID
 * @returns {Array} List of payments with receipts
 */
exports.getStudentPaymentHistory = async (studentId) => {
  try {
    const payments = await StudentPayment.find({ studentId })
      .populate('roomId', 'name roomNumber price')
      .populate('boardingHouseId', 'name address')
      .populate('receiptId')
      .sort({ createdAt: -1 });

    return payments;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment cycles for student
 * @param {String} studentId - Student's user ID
 * @returns {Array} List of payment cycles
 */
exports.getStudentPaymentCycles = async (studentId) => {
  try {
    const cycles = await PaymentCycle.find({ studentId, isActive: true })
      .populate('roomId', 'name price')
      .populate('boardingHouseId', 'name')
      .sort({ cycleNumber: -1 });

    // Calculate overdue status
    const cyclesWithStatus = cycles.map((cycle) => {
      const isOverdue = new Date() > cycle.dueDate && cycle.paymentStatus === 'pending';
      return {
        ...cycle.toObject(),
        isOverdue,
      };
    });

    return cyclesWithStatus;
  } catch (error) {
    throw error;
  }
};

/**
 * Get receipt by ID
 * @param {String} receiptId - Receipt record ID
 * @returns {Object} Receipt details
 */
exports.getReceipt = async (receiptId) => {
  try {
    const receipt = await PaymentReceipt.findById(receiptId).populate(
      'studentId',
      'name email'
    );

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    return receipt;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all receipts for a student
 * @param {String} studentId - Student's user ID
 * @returns {Array} List of receipts for the student
 */
exports.getStudentReceipts = async (studentId) => {
  try {
    console.log('📋 Fetching receipts for student:', studentId);

    const receipts = await PaymentReceipt.find({ studentId })
      .populate('studentId', 'fullName email')
      .populate('roomId', 'name roomNumber price')
      .populate('boardingHouseId', 'name address')
      .sort({ createdAt: -1 }); // Most recent first

    console.log('✅ Found receipts:', receipts.length);
    return receipts;
  } catch (error) {
    console.error('❌ Error fetching student receipts:', error.message);
    throw error;
  }
};

/**
 * Get next payment due date for student (for calendar highlighting)
 * Since each student can have only ONE accepted booking agreement,
 * they have only ONE active pending payment cycle
 * @param {String} studentId - Student's user ID
 * @returns {Object} Next due date information
 */
exports.getNextDueDate = async (studentId) => {
  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║        getNextDueDate SERVICE CALLED              ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('📅 Querying for studentId:', studentId);
    console.log('   Type:', typeof studentId);

    // Convert string studentId to ObjectId
    let studentObjectId;
    try {
      studentObjectId = new mongoose.Types.ObjectId(studentId);
      console.log('✅ Converted to ObjectId:', studentObjectId.toString());
    } catch (err) {
      console.error('❌ Invalid studentId format:', err.message);
      return null;
    }

    // First, let's see ALL students with ANY cycles
    console.log('\n📊 SEARCHING DATABASE FOR ALL PAYMENT CYCLES...');
    const allCyclesInDb = await PaymentCycle.find().lean();
    console.log(`   Total PaymentCycles in database: ${allCyclesInDb.length}`);
    
    const uniqueStudents = new Set(allCyclesInDb.map(c => c.studentId.toString()));
    console.log(`   Unique students with cycles: ${uniqueStudents.size}`);
    console.log('   Student IDs with cycles:');
    uniqueStudents.forEach(sid => {
      const matchesCurrentUser = sid === studentObjectId.toString();
      console.log(`     - ${sid} ${matchesCurrentUser ? '✅ MATCHES CURRENT USER' : ''}`);
    });

    // Now search for THIS student's cycles using OBJECTID
    console.log(`\n🔍 Searching for cycles with studentId (as ObjectId): ${studentObjectId}`);
    const thisStudentsCycles = await PaymentCycle.find({ studentId: studentObjectId }).lean();
    console.log(`   Cycles found: ${thisStudentsCycles.length}`);
    thisStudentsCycles.forEach((cycle, idx) => {
      console.log(`   Cycle ${idx + 1}:`, {
        cycleNumber: cycle.cycleNumber,
        isActive: cycle.isActive,
        paymentStatus: cycle.paymentStatus,
        dueDate: cycle.dueDate
      });
    });

    // Query for active cycle using OBJECTID - THIS IS THE KEY FIX!
    console.log('\n🔎 Querying for: { studentId (as ObjectId), isActive: true }');
    const activeCycle = await PaymentCycle.findOne({
      studentId: studentObjectId,  // ← CONVERT TO OBJECTID - THIS WAS THE BUG!
      isActive: true,
    })
      .select('dueDate cycleNumber startDate paymentStatus isActive')
      .sort({ cycleNumber: -1 })
      .lean();

    console.log('   Query result:', activeCycle ? 'FOUND ✅' : 'NOT FOUND ❌');
    if (activeCycle) {
      console.log('   ✅ FOUND ACTIVE CYCLE:');
      console.log('   Details:', {
        cycleNumber: activeCycle.cycleNumber,
        dueDate: activeCycle.dueDate,
        paymentStatus: activeCycle.paymentStatus,
        isActive: activeCycle.isActive
      });
    } else {
      console.log('   ❌ NO ACTIVE CYCLES found for this student');
    }
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    if (!activeCycle) {
      return null;
    }
    
    return {
      dueDate: activeCycle.dueDate,
      cycleNumber: activeCycle.cycleNumber,
      startDate: activeCycle.startDate,
    };
  } catch (error) {
    console.error('❌ Error in getNextDueDate:', error.message);
    throw error;
  }
};

/**
 * Get receipt by its unique number for a specific student
 * @param {String} receiptNumber - The receipt number (e.g., "REC-2026-04-01-...")
 * @param {String} studentId - The student's user ID
 * @returns {Object} Found PaymentReceipt record
 */
exports.getReceiptByNumber = async (receiptNumber, studentId) => {
  try {
    const receipt = await PaymentReceipt.findOne({ receiptNumber, studentId });
    if (!receipt) {
      throw new Error('Receipt not found or access denied.');
    }
    return receipt;
  } catch (error) {
    console.error(`Error fetching receipt by number ${receiptNumber}:`, error);
    throw error;
  }
};

/**
 * Get owner boarding houses for dashboard
 * @param {String} ownerId - Owner's user ID
 * @returns {Array} List of boarding houses
 */
exports.getOwnerBoardingHouses = async (ownerId) => {
  try {
    console.log('🔍 getOwnerBoardingHouses - Fetching for owner:', ownerId);
    const houses = await BoardingHouse.find({ ownerId }).select(
      'name address city monthlyPrice totalRooms status'
    );
    console.log('📦 Found houses:', houses.length);

    // For each house, fetch its rooms with tenant details
    const housesWithRoomsAndTenants = await Promise.all(
      houses.map(async (house) => {
        console.log(`\n🏠 Processing house: ${house.name} (ID: ${house._id})`);
        const rooms = await Room.find({ houseId: house._id });
        console.log(`   Found ${rooms.length} rooms for this house.`);
        
        // For each room, fetch active booking agreements (tenants)
        const roomsWithTenants = await Promise.all(
          rooms.map(async (room) => {
            console.log(`      -> Processing Room ${room.roomNumber} (ID: ${room._id})`);
            // Fetch accepted booking agreements for this room
            const agreements = await BookingAgreement.find({
              roomId: room._id,
              status: 'accepted',
            }).populate('studentId', 'fullName email phoneNumber');

            console.log(
              `         Found ${
                agreements.length
              } accepted agreements for this room.`
            );

            if (agreements.length > 0) {
              console.log(
                '         Agreement details:',
                JSON.stringify(agreements, null, 2)
              );
            }

            // Map agreements to tenant objects with payment info
            const tenants = await Promise.all(
              agreements.map(async (agreement) => {
                if (!agreement.studentId) {
                  console.log(
                    `         WARNING: Agreement ${agreement._id} is missing studentId.`
                  );
                  return null;
                }
                console.log(
                  `         --> Mapping tenant: ${agreement.studentId.fullName}`
                );
                // Fetch latest payment cycle for this tenant
                const paymentCycle = await PaymentCycle.findOne({
                  boardingHouseId: house._id,
                  studentId: agreement.studentId._id,
                  isActive: true, // <-- Ensure we only get the ACTIVE cycle
                }).sort({ cycleNumber: -1 });

                console.log(
                  `             Payment cycle for ${
                    agreement.studentId.fullName
                  }:`,
                  paymentCycle
                    ? JSON.stringify(paymentCycle, null, 2)
                    : 'No active cycle found'
                );

                return {
                  id: agreement._id.toString(),
                  name: agreement.studentId.fullName,
                  email: agreement.studentId.email || '',
                  phone: agreement.studentId.phoneNumber || '',
                  roomId: room._id.toString(),
                  monthlyRent: room.price || 0,
                  paymentStatus: paymentCycle?.paymentStatus || 'pending',
                  dueDate: paymentCycle?.dueDate || new Date().toISOString(),
                  checkInDate:
                    agreement.checkInDate || new Date().toISOString(),
                };
              })
            );
            
            const validTenants = tenants.filter(t => t !== null);

            // Determine room status based on occupancy
            const occupiedBeds = validTenants.length;
            const bedCount = room.bedCount || 1;
            let roomStatus = 'available';
            if (occupiedBeds > 0 && occupiedBeds < bedCount) {
              roomStatus = 'partial';
            } else if (occupiedBeds >= bedCount) {
              roomStatus = 'full';
            }
            
            console.log(`         Room ${room.roomNumber} has ${validTenants.length} tenants. Status: ${roomStatus}`);

            return {
              id: room._id.toString(),
              roomNumber: room.roomNumber,
              bedCount: bedCount,
              occupiedBeds: occupiedBeds,
              price: room.price || 0,
              status: roomStatus,
              tenants: validTenants,
              name: room.name || `Room ${room.roomNumber}`
            };
          })
        );

        const totalTenants = roomsWithTenants.reduce((sum, room) => sum + room.tenants.length, 0);
        console.log(`   ✅ Finished processing ${house.name}. Total tenants found: ${totalTenants}`);
        return {
          ...house.toObject(),
          id: house._id.toString(),
          totalRooms: roomsWithTenants.length,
          occupiedRooms: roomsWithTenants.filter(r => r.status !== 'available').length,
          rooms: roomsWithTenants
        };
      })
    );

    console.log('\n✅✅✅ FINAL: Returning fully populated house data. ✅✅✅');
    console.log(JSON.stringify(housesWithRoomsAndTenants, null, 2));
    return housesWithRoomsAndTenants;
  } catch (error) {
    console.error('❌❌❌ FATAL ERROR in getOwnerBoardingHouses:', error);
    throw error;
  }
};

/**
 * Get payment summary for a house
 * @param {String} houseId - Boarding house ID
 * @param {String} ownerId - Owner's user ID
 * @returns {Object} Payment summary statistics
 */
exports.getHouseSummary = async (houseId, ownerId) => {
  try {
    // Verify ownership
    const house = await BoardingHouse.findOne({ _id: houseId, ownerId });

    if (!house) {
      throw new Error('Boarding house not found or unauthorized access');
    }

    // Get payment statistics
    const totalPayments = await StudentPayment.countDocuments({
      boardingHouseId: houseId,
    });

    const approvedPayments = await StudentPayment.countDocuments({
      boardingHouseId: houseId,
      status: 'approved',
    });

    const rejectedPayments = await StudentPayment.countDocuments({
      boardingHouseId: houseId,
      status: 'rejected',
    });

    const pendingPayments = await StudentPayment.countDocuments({
      boardingHouseId: houseId,
      status: 'submitted',
    });

    const totalRevenue = await StudentPayment.aggregate([
      {
        $match: {
          boardingHouseId: require('mongoose').Types.ObjectId(houseId),
          status: 'approved',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$paymentAmount' },
        },
      },
    ]);

    const overduePayments = await StudentPayment.countDocuments({
      boardingHouseId: houseId,
      status: 'approved',
      isOverdue: true,
    });

    return {
      houseName: house.name,
      totalPayments,
      approvedPayments,
      rejectedPayments,
      pendingPayments,
      overduePayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      collectionRate: totalPayments > 0 ? ((approvedPayments / totalPayments) * 100).toFixed(2) : 0,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate house income based on rooms
 * @param {String} houseId - Boarding house ID
 * @returns {Object} Income calculation breakdown
 */
exports.calculateHouseIncome = async (houseId) => {
  try {
    if (!houseId) {
      throw new Error('House ID is required');
    }

    const house = await BoardingHouse.findById(houseId);
    if (!house) {
      throw new Error('Boarding house not found');
    }

    const rooms = await Room.find({ houseId: houseId });

    let totalExpectedIncome = 0;
    let totalCapacityIncome = 0;

    rooms.forEach((room) => {
      totalExpectedIncome += room.occupancy * room.price;
      totalCapacityIncome += room.totalSpots * room.price;
    });

    return {
      houseName: house.name,
      expectedMonthlyIncome: totalExpectedIncome,
      capacityMonthlyIncome: totalCapacityIncome,
      occupancyPercentage: totalCapacityIncome > 0 ? ((totalExpectedIncome / totalCapacityIncome) * 100).toFixed(2) : 0,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update overdue status for payments (background job)
 */
exports.updateOverdueStatus = async () => {
  try {
    const now = new Date();

    const overduePayments = await StudentPayment.find({
      status: 'approved',
      dueDate: { $lt: now },
      isOverdue: false,
    });

    for (const payment of overduePayments) {
      payment.isOverdue = true;
      await payment.save();

      const notification = new Notification({
        user: payment.studentId,
        type: 'payment_overdue',
        title: 'Payment Overdue',
        message: `Your payment of Rs. ${payment.paymentAmount} was due on ${payment.dueDate.toDateString()}. Please make payment immediately.`,
        data: {
          paymentId: String(payment._id),
        },
      });

      await notification.save();
    }

    return {
      success: true,
      updatedCount: overduePayments.length,
    };
  } catch (error) {
    throw error;
  }
};
