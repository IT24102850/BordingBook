/**
 * FILE: ownerPaymentDashboardController.js
 * PURPOSE: Handle owner payment & rental management dashboard requests
 * DESCRIPTION: Fetch dashboard metrics, rooms overview, and payment ledger for a specific boarding house
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const BoardingHouse = require('../../models/BoardingHouse');
const Room = require('../../models/Room');
const BookingAgreement = require('../../models/BookingAgreement');
const PaymentCycle = require('../../models/PaymentCycle');
const StudentPayment = require('../../models/StudentPayment');
const User = require('../../models/User');

/**
 * Get dashboard stats for a boarding house
 * ROUTE: GET /api/owner/boarding-houses/{boardingHouseId}/stats
 * AUTH: Required (Owner only)
 * 
 * Returns:
 * - totalTenants: Count of active tenants
 * - paidTenants: Count of tenants who paid this period
 * - overdueCount: Count of overdue payments
 * - totalCollected: Total amount collected
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { boardingHouseId } = req.params;
    const ownerId = req.user.userId;

    console.log('📊 Fetching dashboard stats:');
    console.log('   Boarding House ID:', boardingHouseId);
    console.log('   Owner ID:', ownerId);

    // Get all rooms in this boarding house (skip owner verification for testing)
    const rooms = await Room.find({ houseId: boardingHouseId });
    const roomIds = rooms.map(r => r._id);

    console.log('   Found rooms:', roomIds.length);

    // Get all active booking agreements for this boarding house
    const agreements = await BookingAgreement.find({
      boardingHouseId: boardingHouseId,
      status: 'accepted',
    });

    const totalTenants = agreements.length;
    console.log('   Total tenants:', totalTenants);

    // Get payment cycles for this boarding house
    const paymentCycles = await PaymentCycle.find({
      boardingHouseId: boardingHouseId,
    });

    console.log('   Payment cycles found:', paymentCycles.length);

    // Count paid and overdue
    let paidTenants = 0;
    let overdueCount = 0;
    let totalCollected = 0;

    for (const cycle of paymentCycles) {
      if (cycle.paymentStatus === 'paid') {
        paidTenants++;
        totalCollected += cycle.expectedAmount || 0;
      } else if (cycle.paymentStatus === 'overdue') {
        overdueCount++;
      }
    }

    console.log('   Paid tenants:', paidTenants);
    console.log('   Overdue count:', overdueCount);
    console.log('   Total collected:', totalCollected);

    return res.status(200).json({
      success: true,
      data: {
        totalTenants,
        paidTenants,
        overdueCount,
        totalCollected,
        boardingHouseName: boardingHouse.name,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
};

/**
 * Get rooms overview for a boarding house with occupancy status
 * ROUTE: GET /api/owner/boarding-houses/{boardingHouseId}/rooms-overview
 * AUTH: Required (Owner only)
 * 
 * Returns:
 * - Room list with details
 * - Occupancy status (OCCUPIED / AVAILABLE)
 * - Current tenant info (if occupied)
 */
exports.getRoomsOverview = async (req, res) => {
  try {
    const { boardingHouseId } = req.params;
   const ownerId = req.user.userId;

    console.log('🏠 Fetching rooms overview:');
    console.log('   Boarding House ID:', boardingHouseId);
    console.log('   Owner ID:', ownerId);

    // Convert boardingHouseId to ObjectId
    const boardingHouseObjectId = mongoose.Types.ObjectId.isValid(boardingHouseId)
      ? new mongoose.Types.ObjectId(boardingHouseId)
      : boardingHouseId;

    // Get all rooms in this boarding house (skip owner verification for testing)
    const rooms = await Room.find({ houseId: boardingHouseObjectId }).sort({ roomNumber: 1 });
    console.log('   ✅ Rooms found:', rooms.length);

    console.log('   Total rooms found:', rooms.length);

    // For each room, find current tenant
    const roomsWithTenants = await Promise.all(
      rooms.map(async (room) => {
        // Find booking agreement for this room
        const agreement = await BookingAgreement.findOne({
          roomId: room._id,
          status: 'accepted',
        }).populate('studentId', 'fullName email phoneNumber');

        const isOccupied = !!agreement;
        const occupancyStatus = isOccupied ? 'OCCUPIED' : 'AVAILABLE';

        return {
          id: room._id.toString(),
          roomNumber: room.roomNumber,
          name: room.name,
          price: room.price,
          bedCount: room.bedCount,
          occupancyStatus,
          currentTenant: agreement ? {
            id: agreement.studentId._id.toString(),
            name: agreement.studentId.fullName,
            email: agreement.studentId.email,
            phone: agreement.studentId.phoneNumber,
          } : null,
          location: room.location,
          facilities: room.facilities,
        };
      })
    );

    console.log('   Processed rooms:', roomsWithTenants.length);

    return res.status(200).json({
      success: true,
      data: roomsWithTenants,
    });
  } catch (error) {
    console.error('❌ Error fetching rooms overview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms overview',
      error: error.message,
    });
  }
};

/**
 * Get payment ledger for a boarding house
 * ROUTE: GET /api/owner/boarding-houses/{boardingHouseId}/payment-ledger
 * AUTH: Required (Owner only)
 * 
 * Returns:
 * - Tenant name
 * - Room number
 * - Payment amount
 * - Payment status (PAID / PENDING / OVERDUE)
 * - Due date
 */
exports.getPaymentLedger = async (req, res) => {
  try {
    const { boardingHouseId } = req.params;
    const ownerId = req.user.userId;
    const { sortBy = 'dueDate' } = req.query; // dueDate, status, studentName

    console.log('💳 Fetching payment ledger:');
    console.log('   Boarding House ID:', boardingHouseId);
    console.log('   Sort by:', sortBy);

    // Get all payment cycles for this boarding house (skip owner verification for testing)
    const paymentCycles = await PaymentCycle.find({
      boardingHouseId: boardingHouseId,
    })
      .populate('studentId', 'fullName email phoneNumber')
      .populate('roomId', 'roomNumber name price')
      .sort({ dueDate: 1 });

    console.log('   Found payment cycles:', paymentCycles.length);

    // Transform to payment ledger format
    const ledger = paymentCycles.map((cycle) => ({
      id: cycle._id.toString(),
      cycleNumber: cycle.cycleNumber,
      studentId: cycle.studentId._id.toString(),
      studentName: cycle.studentId.fullName,
      studentEmail: cycle.studentId.email,
      studentPhone: cycle.studentId.phoneNumber,
      roomNumber: cycle.roomId?.roomNumber || 'N/A',
      roomName: cycle.roomId?.name || 'N/A',
      amount: cycle.expectedAmount,
      paymentStatus: cycle.paymentStatus, // paid, pending, overdue, rejected
      startDate: cycle.startDate,
      dueDate: cycle.dueDate,
      paidDate: cycle.paidDate || null,
      isActive: cycle.isActive,
    }));

    console.log('   Ledger entries:', ledger.length);

    // Sort based on query param
    if (sortBy === 'status') {
      ledger.sort((a, b) => a.paymentStatus.localeCompare(b.paymentStatus));
    } else if (sortBy === 'studentName') {
      ledger.sort((a, b) => a.studentName.localeCompare(b.studentName));
    }
    // Default is already sorted by dueDate

    return res.status(200).json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    console.error('❌ Error fetching payment ledger:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment ledger',
      error: error.message,
    });
  }
};
/**
 * Get next payment cycle start date for a tenant
 * ROUTE: GET /api/owner/tenants/{studentId}/next-payment-cycle
 * AUTH: Required (Owner only)
 * 
 * Returns:
 * - nextPaymentCycleStartDate: Start date of next payment cycle
 * - currentCycleNumber: Current payment cycle number
 * - nextCycleNumber: Next cycle number
 */
exports.getNextPaymentCycleDate = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log('📅 Fetching next payment cycle start date:');
    console.log('   Student ID:', studentId);

    // Verify student ID is valid
    const User = require('../../models/User');
    const studentExists = await User.findById(studentId);
    if (!studentExists) {
      console.log('   ❌ Student not found:', studentId);
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
    console.log('   ✅ Student found:', studentExists.fullName);

    // Find the CURRENT payment cycle (find the one being viewed, typically lowest unpaid or latest paid)
    console.log('   🔍 Searching for payment cycles...');
    
    // First try to find current cycle by looking for the lowest cycleNumber that is pending or the highest paid
    let currentCycle = await PaymentCycle.findOne({
      studentId: studentId,
      paymentStatus: 'paid'
    })
      .sort({ cycleNumber: -1 })
      .exec();

    // If no paid cycle, look for the pending cycle
    if (!currentCycle) {
      currentCycle = await PaymentCycle.findOne({
        studentId: studentId,
        paymentStatus: 'pending'
      })
        .sort({ cycleNumber: 1 })
        .exec();
    }

    if (!currentCycle) {
      console.log('   ⚠️  No payment cycles found for this student');
      // List all cycles for debugging
      const allCycles = await PaymentCycle.find({ studentId: studentId });
      console.log('   Total cycles for student:', allCycles.length);
      return res.status(404).json({
        success: false,
        message: 'No payment cycles found for this student',
        debug: {
          studentId,
          totalCyclesFound: allCycles.length,
        },
      });
    }

    console.log('   ✅ Found current cycle number:', currentCycle.cycleNumber);
    console.log('   Status:', currentCycle.paymentStatus);
    console.log('   isActive:', currentCycle.isActive);

    // Step 2: Find the NEXT cycle (cycleNumber + 1)
    const nextCycleNumber = currentCycle.cycleNumber + 1;
    console.log('   🔍 Looking for next cycle number:', nextCycleNumber);
    const nextCycle = await PaymentCycle.findOne({
      studentId: studentId,
      cycleNumber: nextCycleNumber,
    }).exec();

    if (!nextCycle) {
      console.log('   ⚠️  No next cycle created yet');
      // Calculate expected start date if next cycle doesn't exist
      const expectedStartDate = new Date(currentCycle.dueDate);
      expectedStartDate.setDate(expectedStartDate.getDate() + 1);
      
      return res.status(200).json({
        success: true,
        data: {
          nextPaymentCycleStartDate: expectedStartDate,
          currentCycleNumber: currentCycle.cycleNumber,
          nextCycleNumber: nextCycleNumber,
          currentCycleDueDate: currentCycle.dueDate,
          status: 'projected', // Not created yet
        },
      });
    }

    console.log('   Next cycle start date:', nextCycle.startDate);
    console.log('   Next cycle number:', nextCycleNumber);

    return res.status(200).json({
      success: true,
      data: {
        nextPaymentCycleStartDate: nextCycle.startDate,
        currentCycleNumber: currentCycle.cycleNumber,
        nextCycleNumber: nextCycleNumber,
        currentCycleDueDate: currentCycle.dueDate,
        status: 'created',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching next payment cycle date:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch next payment cycle date',
      error: error.message,
    });
  }
};

/**
 * Send payment reminder to a student
 * ROUTE: POST /api/owner/tenants/:studentId/send-reminder
 * AUTH: Required (Owner only)
 * 
 * Body: { reminderMessage: string, daysLeft: number }
 * 
 * Returns:
 * - notification ID created
 * - success status
 */
exports.sendPaymentReminder = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reminderMessage, daysLeft } = req.body;

    console.log('📬 Sending payment reminder:');
    console.log('   Student ID:', studentId);
    console.log('   Days Left:', daysLeft);
    console.log('   Message:', reminderMessage);

    // Verify student exists
    const User = require('../../models/User');
    const student = await User.findById(studentId);
    if (!student) {
      console.log('   ❌ Student not found:', studentId);
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
    console.log('   ✅ Student found:', student.fullName);

    // Create notification
    const Notification = require('../../models/Notification');
    const notification = new Notification({
      user: studentId,
      type: 'payment_pre_payment',
      title: '💰 Payment Reminder',
      message: reminderMessage,
      read: false,
      data: {
        daysLeft,
      },
    });

    await notification.save();
    console.log('   ✅ Notification created:', notification._id);

    return res.status(200).json({
      success: true,
      data: {
        notificationId: notification._id,
        message: 'Payment reminder sent successfully',
      },
    });
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send payment reminder',
      error: error.message,
    });
  }
};

/**
 * Cancel/Remove a booking agreement
 * ROUTE: DELETE /api/owner/agreements/:agreementId
 * AUTH: Required (Owner only)
 * 
 * Returns:
 * - success status
 * - cancelled agreement details
 */
exports.cancelAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const ownerId = req.user.userId;

    console.log('🗑️  Cancelling agreement:');
    console.log('   Agreement ID:', agreementId);
    console.log('   Owner ID:', ownerId);

    // Find the agreement
    const agreement = await BookingAgreement.findById(agreementId);
    if (!agreement) {
      console.log('   ❌ Agreement not found:', agreementId);
      return res.status(404).json({
        success: false,
        message: 'Agreement not found',
      });
    }

    console.log('   ✅ Agreement found');
    console.log('   Student:', agreement.studentId);
    console.log('   Status Before:', agreement.status);

    // Update agreement status to cancelled
    agreement.status = 'cancelled';
    agreement.cancelledAt = new Date();
    await agreement.save();

    console.log('   ✅ Agreement cancelled successfully');
    console.log('   Status After:', agreement.status);

    return res.status(200).json({
      success: true,
      data: {
        agreementId: agreement._id,
        studentId: agreement.studentId,
        status: agreement.status,
        cancelledAt: agreement.cancelledAt,
        message: 'Agreement cancelled successfully',
      },
    });
  } catch (error) {
    console.error('❌ Error cancelling agreement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel agreement',
      error: error.message,
    });
  }
};

/**
 * Get payment receipts for a specific student (for owner viewing)
 * ROUTE: GET /api/owner/students/:studentId/receipts
 * AUTH: Required (Owner only)
 * 
 * Returns:
 * - Array of payment receipts for the specified student
 */
exports.getStudentReceiptsForOwner = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log('📋 Fetching receipts for student (Owner view):');
    console.log('   Student ID:', studentId);

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      console.log('   ❌ Student not found:', studentId);
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
    console.log('   ✅ Student found:', student.fullName);

    // Fetch receipts for this student
    const PaymentReceipt = require('../../models/PaymentReceipt');
    const receipts = await PaymentReceipt.find({ studentId })
      .sort({ createdAt: -1 })
      .lean();

    console.log('   ✅ Found receipts:', receipts.length);

    return res.status(200).json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    console.error('❌ Error fetching student receipts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student receipts',
      error: error.message,
    });
  }
};

/**
 * Download receipt PDF for a student
 * ROUTE: GET /api/owner/students/:studentId/receipts/:receiptNumber/download
 * AUTH: Required (Owner only)
 * PURPOSE: Allow owner to download a payment receipt for their tenant
 */
exports.downloadStudentReceipt = async (req, res) => {
  try {
    const { studentId, receiptNumber } = req.params;
    const ownerId = req.user.userId;

    console.log('⬇️ Owner downloading student receipt:');
    console.log('   Owner ID:', ownerId);
    console.log('   Student ID:', studentId);
    console.log('   Receipt Number:', receiptNumber);

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      console.log('   ❌ Student not found:', studentId);
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
    console.log('   ✅ Student found:', student.fullName);

    // Verify receipt exists for this student
    const PaymentReceipt = require('../../models/PaymentReceipt');
    const receipt = await PaymentReceipt.findOne({
      receiptNumber,
      studentId,
    });

    if (!receipt) {
      console.log('   ❌ Receipt not found for this student');
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
      });
    }
    console.log('   ✅ Receipt found:', receiptNumber);

    // Construct the file path
    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'receipts', `${receiptNumber}.pdf`);
    console.log('   File path:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('   ❌ File not found on disk!');
      return res.status(404).json({
        success: false,
        message: 'Receipt file not found on the server',
      });
    }
    console.log('   ✅ File exists on disk');

    // Stream the file to the client
    res.setHeader('Content-Disposition', `attachment; filename="${receiptNumber}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    console.log('   ✅ Receipt download started');

  } catch (error) {
    console.error('❌ Error downloading receipt:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download receipt',
      error: error.message,
    });
  }
};