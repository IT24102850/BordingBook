/**
 * FILE: paymentController.js
 * PURPOSE: Handle HTTP requests and responses for payment-related endpoints
 * DESCRIPTION: This controller receives API requests, validates input data,
 *              calls the payment service for business logic, and returns
 *              formatted JSON responses to the frontend.
 */

const paymentService = require('../services/paymentService');
const { deleteUploadedFile } = require('../middleware/uploadHandler');
const StudentPayment = require('../../models/StudentPayment');
const path = require('path');
const fs = require('fs');

/**
 * Submit payment slip
 * ROUTE: POST /api/roommates/payments/submit
 * AUTH: Required
 * FILE: paymentSlip (PNG, JPG, PDF, max 5MB)
 */
exports.submitPaymentSlip = async (req, res) => {
  try {
    const { bookingAgreementId, paymentAmount, remarks } = req.body;
    const studentId = req.user.userId;

    if (!bookingAgreementId || !paymentAmount) {
      if (req.file) deleteUploadedFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Booking agreement and payment amount are required',
      });
    }

    if (!req.uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'Payment slip file is required',
      });
    }

    const paymentData = {
      studentId,
      bookingAgreementId,
      paymentAmount: Number(paymentAmount),
      remarks: remarks || '',
      paymentSlipPath: req.uploadedFile.filename,  // Store just the filename (e.g., "1234567890_image.jpeg")
      paymentSlipUrl: req.uploadedFile.url,  // Store the URL for display (e.g., "/uploads/payments/[studentId]/filename")
      fileType: req.uploadedFile.extension,
      fileSize: req.uploadedFile.size,
    };

    console.log('💾 Saving payment with:');
    console.log('   paymentSlipPath:', paymentData.paymentSlipPath);
    console.log('   paymentSlipUrl:', paymentData.paymentSlipUrl);
    console.log('   fileType:', paymentData.fileType);

    const result = await paymentService.submitPaymentSlip(paymentData);

    return res.status(201).json({
      success: true,
      message: 'Payment slip submitted for review',
      data: result,
    });
  } catch (error) {
    if (req.file) deleteUploadedFile(req.file.path);
    console.error('Error submitting payment slip:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit payment slip',
      error: error.message,
    });
  }
};

/**
 * Get student payment history
 * ROUTE: GET /api/roommates/payments/history
 * AUTH: Required
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const payments = await paymentService.getStudentPaymentHistory(studentId);

    return res.status(200).json({
      success: true,
      message: 'Payment history fetched successfully',
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
};

/**
 * Get student payment cycles
 * ROUTE: GET /api/roommates/payments/cycles
 * AUTH: Required
 */
exports.getPaymentCycles = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const cycles = await paymentService.getStudentPaymentCycles(studentId);

    return res.status(200).json({
      success: true,
      message: 'Payment cycles fetched successfully',
      count: cycles.length,
      data: cycles,
    });
  } catch (error) {
    console.error('Error fetching payment cycles:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment cycles',
      error: error.message,
    });
  }
};

/**
 * Get pending payments for owner review
 * ROUTE: GET /api/roommates/payments/pending
 * AUTH: Required (Owner only)
 */
exports.getPendingPayments = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    console.log('📥 getPendingPayments called:');
    console.log('   ownerId:', ownerId);
    console.log('   user:', req.user);

    const pendingPayments = await paymentService.getPendingPayments(ownerId);
    console.log('   Raw pendingPayments from service:', pendingPayments.length, 'records');
    if (pendingPayments.length > 0) {
      console.log('   First payment:', pendingPayments[0]);
    }

    // Transform backend data to match frontend PaymentSlip interface
    const formattedPayments = pendingPayments.map(payment => {
      // Build slip URL - handle both pre-generated URL and fallback construction
      let slipUrl = null;
      if (payment.paymentSlipUrl) {
        // Use pre-generated URL
        slipUrl = payment.paymentSlipUrl;
      } else if (payment.paymentSlipPath) {
        // Fallback: extract filename from either:
        // - Just filename: "1234567890_image.jpeg"
        // - Full path: "/f:\BordingBook\backend\uploads\payments\[studentId]\1234567890_image.jpeg"
        let filename = payment.paymentSlipPath;
        
        // If it's a full path, extract just the filename
        if (filename.includes('\\') || filename.includes('/')) {
          filename = filename.split(/[\\\/]/).pop();
          console.log('   Extracted filename from path:', filename);
        }
        
        slipUrl = `/uploads/payments/${String(payment.studentId._id)}/${filename}`;
      }

      return {
        id: String(payment._id),
        tenantId: payment.studentId ? String(payment.studentId._id) : '',
        tenantName: payment.studentId?.fullName || 'Unknown Tenant',
        roomId: payment.roomId ? String(payment.roomId._id) : '',
        roomNumber: payment.roomId?.roomNumber || 'N/A',
        placeId: payment.boardingHouseId ? String(payment.boardingHouseId._id) : '',
        placeName: payment.boardingHouseId?.name || 'Unknown House',
        amount: payment.paymentAmount || 0,
        originalRent: payment.roomId?.price || 0,
        date: payment.uploadedAt ? new Date(payment.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        slipUrl: slipUrl,
        status: payment.status || 'pending',
        trustScore: 'high', // Default - can be enhanced with student history
        uploadedAt: payment.uploadedAt,
      };
    });

    console.log('📋 Formatted payments for frontend:');
    console.log('   Total count:', formattedPayments.length);
    if (formattedPayments.length > 0) {
      console.log('   First slip URL:', formattedPayments[0].slipUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Pending payments fetched successfully',
      count: formattedPayments.length,
      data: formattedPayments,
    });
  } catch (error) {
    console.error('Error fetching pending payments:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending payments',
      error: error.message,
    });
  }
};

/**
 * Approve payment slip
 * ROUTE: POST /api/owner/payments/approve/:paymentId
 * AUTH: Required (Owner only)
 */
exports.approvePaymentSlip = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const approverId = req.user.userId;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
    }

    const result = await paymentService.approvePaymentSlip(paymentId, approverId);

    return res.status(200).json({
      success: true,
      message: 'Payment approved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error approving payment:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to approve payment',
      error: error.message,
    });
  }
};

/**
 * Reject payment slip
 * ROUTE: POST /api/owner/payments/reject/:paymentId
 * AUTH: Required (Owner only)
 * BODY: { rejectionReason: String }
 */
exports.rejectPaymentSlip = async (req, res) => {
  try {
    const { slipId } = req.params;
    const { rejectionReason } = req.body;
    const approverId = req.user.userId;

    console.log('🚫 Rejecting payment slip:');
    console.log('   Slip ID:', slipId);
    console.log('   Reason:', rejectionReason);
    console.log('   Approver ID:', approverId);

    if (!slipId || !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Slip ID and rejection reason are required',
      });
    }

    const result = await paymentService.rejectPaymentSlip(
      slipId,
      approverId,
      rejectionReason
    );

    return res.status(200).json({
      success: true,
      message: 'Payment rejected successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get receipt details
 * ROUTE: GET /api/roommates/payments/receipt/:receiptId
 * AUTH: Required
 */
exports.getReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        message: 'Receipt ID is required',
      });
    }

    const receipt = await paymentService.getReceipt(receiptId);

    return res.status(200).json({
      success: true,
      message: 'Receipt fetched successfully',
      data: receipt,
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch receipt',
      error: error.message,
    });
  }
};

/**
 * Get all receipts for logged-in student
 * ROUTE: GET /api/roommates/payments/receipts
 * AUTH: Required (student)
 */
exports.getStudentReceipts = async (req, res) => {
  try {
    const studentId = req.user.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found in token',
      });
    }

    const receipts = await paymentService.getStudentReceipts(studentId);

    return res.status(200).json({
      success: true,
      message: 'Receipts fetched successfully',
      data: receipts,
    });
  } catch (error) {
    console.error('Error fetching student receipts:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch receipts',
      error: error.message,
    });
  }
};

/**
 * Get next payment due date for calendar highlighting
 * ROUTE: GET /api/roommates/payments/next-due
 * AUTH: Required
 */
exports.getNextDueDate = async (req, res) => {
  try {
    console.log('\n\n╔════════════════════════════════════════════════════╗');
    console.log('║         NEXT DUE DATE ENDPOINT CALLED             ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('📋 req.user object:');
    console.log(JSON.stringify(req.user, null, 2));
    console.log('\n📌 req.user.userId:', req.user?.userId);
    console.log('📌 req.user._id:', req.user?._id);
    console.log('📌 req.user.id:', req.user?.id);
    console.log('╔════════════════════════════════════════════════════╗\n');

    const studentId = req.user?.userId || req.user?._id || req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found in token',
      });
    }

    const nextDue = await paymentService.getNextDueDate(studentId);

    return res.status(200).json({
      success: true,
      message: 'Next due date fetched successfully',
      data: nextDue,
    });
  } catch (error) {
    console.error('Error fetching next due date:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch next due date',
      error: error.message,
    });
  }
};

/**
 * Get owner boarding places
 * ROUTE: GET /api/payment/boarding-places
 * AUTH: Required
 */
exports.getOwnerBoardingPlaces = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found in token',
      });
    }

    console.log('📍 getOwnerBoardingPlaces called for owner:', ownerId);
    const boardingPlaces = await paymentService.getOwnerBoardingHouses(ownerId);
    console.log('📦 Fetched places:', boardingPlaces?.length || 0);
    console.log('📦 First place structure:', JSON.stringify(boardingPlaces?.[0], null, 2).substring(0, 500));

    if (!boardingPlaces || boardingPlaces.length === 0) {
      console.log('⚠️  No boarding places found for owner');
      return res.status(200).json({
        success: true,
        message: 'No boarding places found',
        count: 0,
        data: [],
      });
    }

    console.log('✅ Returning', boardingPlaces.length, 'places with rooms');
    return res.status(200).json({
      success: true,
      message: 'Boarding places fetched successfully',
      count: boardingPlaces.length,
      data: boardingPlaces,
    });
  } catch (error) {
    console.error('❌ Error in getOwnerBoardingPlaces:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch boarding places',
      error: error.message,
    });
  }
};

/**
 * NEW ENDPOINT: Get boarding places with tenants properly populated
 * This directly queries booking agreements to get accurate tenant data
 */
exports.getOwnerBoardingPlacesWithTenants = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    
    console.log('\n📍 getOwnerBoardingPlacesWithTenants called for owner:', ownerId);

    // Step 1: Get all houses for this owner
    const houses = await BoardingHouse.find({ ownerId });
    console.log('🏢 Found houses:', houses.length);

    if (!houses || houses.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Step 2: For each house, get rooms and tenants
    const housesWithData = await Promise.all(
      houses.map(async (house) => {
        console.log('\n🔄 Processing house:', house.name);

        // Get all rooms for this house
        const rooms = await Room.find({ houseId: house._id });
        console.log('   Rooms found:', rooms.length);

        // For each room, get booking agreements and payment info
        const roomsWithTenants = await Promise.all(
          rooms.map(async (room) => {
            // Get booking agreements for this room
            const bookings = await BookingAgreement.find({
              roomId: room._id,
              status: 'accepted'
            }).populate('studentId', 'fullName email phoneNumber');

            console.log(`   Room ${room.roomNumber}: ${bookings.length} tenant(s)`);

            // Build tenants array with payment info
            const tenants = await Promise.all(
              bookings.map(async (booking) => {
                // Get latest payment cycle for this booking
                const paymentCycle = await PaymentCycle.findOne({
                  boardingHouseId: house._id,
                  studentId: booking.studentId._id,
                  roomId: room._id
                }).sort({ createdAt: -1 });

                return {
                  id: booking.studentId._id.toString(),
                  name: booking.studentId.fullName,
                  email: booking.studentId.email,
                  phone: booking.studentId.phoneNumber,
                  roomId: room._id.toString(),
                  paymentStatus: paymentCycle?.paymentStatus || 'pending',
                  dueDate: paymentCycle?.dueDate || new Date(),
                  monthlyRent: room.price,
                  trustScore: 'high'
                };
              })
            );

            return {
              id: room._id.toString(),
              roomNumber: room.roomNumber,
              bedCount: room.bedCount,
              occupiedBeds: tenants.length,
              price: room.price,
              status: tenants.length >= room.bedCount ? 'full' : (tenants.length > 0 ? 'partial' : 'available'),
              tenants: tenants
            };
          })
        );

        return {
          _id: house._id.toString(),
          id: house._id.toString(),
          name: house.name,
          address: house.address,
          city: house.city,
          totalRooms: rooms.length,
          occupiedRooms: rooms.filter(r => r.occupancy > 0).length,
          rooms: roomsWithTenants
        };
      })
    );

    console.log('\n✅ Returning', housesWithData.length, 'houses with complete tenant data\n');
    return res.status(200).json({
      success: true,
      count: housesWithData.length,
      data: housesWithData,
    });
  } catch (error) {
    console.error('❌ Error in getOwnerBoardingPlacesWithTenants:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch boarding places with tenants',
      error: error.message,
    });
  }
};

/**
 * Get house summary
 * ROUTE: GET /api/payment/house-summary/:houseId
 * AUTH: Required
 */
exports.getHouseSummary = async (req, res) => {
  try {
    const { houseId } = req.params;
    const ownerId = req.user.userId;

    if (!houseId) {
      return res.status(400).json({
        success: false,
        message: 'House ID is required',
      });
    }

    const summary = await paymentService.getHouseSummary(houseId, ownerId);

    return res.status(200).json({
      success: true,
      message: 'House summary fetched successfully',
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching house summary:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch house summary',
      error: error.message,
    });
  }
};

/**
 * Get payment summary/dashboard for a specific boarding house
 * 
 * ROUTE: GET /api/payment/house-summary/:houseId
 * AUTH: Required
 * 
 * PARAMS: houseId (MongoDB ObjectId)
 * 
 * SUCCESS RESPONSE (200):
 * {
 *   success: true,
 *   message: "House summary fetched",
 *   data: {
 *     houseName: "Student Plaza Hostel",
 *     expectedMonthlyIncome: 156000,
 *     capacityMonthlyIncome: 195000,
 *     occupancyPercentage: "80%"
 *   }
 * }
 * 
 * ERROR RESPONSE (404):
 * {
 *   success: false,
 *   message: "Boarding house not found"
 * }
 */
exports.getHouseSummary = async (req, res) => {
  try {
    const { houseId } = req.params;
    const ownerId = req.user.userId;

    if (!houseId) {
      return res.status(400).json({
        success: false,
        message: 'House ID is required',
      });
    }

    // Call service to calculate income and get summary
    const houseSummary = await paymentService.calculateHouseIncome(houseId);

    return res.status(200).json({
      success: true,
      message: 'House summary fetched successfully',
      data: houseSummary,
    });
  } catch (error) {
    console.error('Error in getHouseSummary:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch house summary',
      error: error.message,
    });
  }
};

/**
 * Download a payment slip file
 * ROUTE: GET /api/payments/download/:id
 * AUTH: Required
 */
exports.downloadPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📥 Download request for payment slip ID: ${id}`);

    const payment = await StudentPayment.findById(id);

    if (!payment) {
      console.log(`   ⚠️ Payment with ID ${id} not found.`);
      return res.status(404).json({
        success: false,
        message: 'Payment slip not found',
      });
    }

    // CRITICAL: Construct the absolute file path from the stored URL.
    // The URL is stored like: /uploads/payment/1711645297876_my-slip.jpg
    // The backend's root directory is f:\BordingBook\backend, and the file is in f:\BordingBook\backend\uploads\payment\...
    // So, we need to resolve the path correctly.

    // The `__dirname` is `f:\BordingBook\backend\src\payment\controllers`
    // We go up three levels to get to `f:\BordingBook\backend`
    const backendRoot = path.resolve(__dirname, '..', '..', '..');

    // The stored URL might have a leading slash, which `path.join` ignores if it's not the first argument.
    // We need to remove it to ensure a correct join.
    const relativePath = payment.slipUrl.startsWith('/')
      ? payment.slipUrl.substring(1)
      : payment.slipUrl;

    const filePath = path.join(backendRoot, relativePath);

    console.log(`   📂 Attempting to download from path: ${filePath}`);

    // Check if the file exists before attempting to send
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ File found. Initiating download...`);
      // Set headers to trigger browser download
      res.download(filePath, err => {
        if (err) {
          console.error('   ❌ Error sending file:', err);
          // Avoid sending another response if headers are already sent
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Server error while sending the file.',
            });
          }
        }
      });
    } else {
      console.log(`   ❌ File not found at the specified path.`);
      return res.status(404).json({
        success: false,
        message: 'File not found on server.',
      });
    }
  } catch (error) {
    console.error('   🔥 Top-level error in downloadPaymentSlip:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download payment slip',
        error: error.message,
      });
    }
  }
};

/**
 * Download a generated receipt PDF
 * ROUTE: GET /api/payments/receipt/download/:receiptNumber
 * AUTH: Required
 */
exports.downloadReceiptPdf = async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    const studentId = req.user.userId;

    console.log('⬇️ Download request for receipt:', receiptNumber);

    // Find the receipt to ensure the logged-in user has access
    const receipt = await paymentService.getReceiptByNumber(receiptNumber, studentId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found or you do not have permission to access it.',
      });
    }

    // Construct the absolute file path
    // The file is in /uploads/receipts/ at the project root, so we go up 3 levels
    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'receipts', `${receiptNumber}.pdf`);
    
    console.log('   File path:', filePath);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error('   File not found on disk!');
      return res.status(404).json({
        success: false,
        message: 'Receipt file not found on the server.',
      });
    }

    // Stream the file to the client
    res.setHeader('Content-Disposition', `attachment; filename="${receiptNumber}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading receipt PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download receipt.',
      error: error.message,
    });
  }
};
