/**
 * FILE: receiptGenerator.js
 * PURPOSE: Generate PDF receipts for approved payments
 * DESCRIPTION: Creates professional PDF receipts with payment details,
 *              approval information, and student/room details
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF receipt for approved payment
 * @param {Object} receipt - PaymentReceipt document
 * @param {Object} payment - StudentPayment document
 * @returns {String} Path to generated PDF file
 */
exports.generateReceiptPdf = async (receipt, payment) => {
  try {
    // The file should be in /uploads/receipts/ at project root
    const receiptDir = path.join(__dirname, '..', '..', '..', 'uploads', 'receipts');
    if (!fs.existsSync(receiptDir)) {
      fs.mkdirSync(receiptDir, { recursive: true });
    }

    const fileName = `${receipt.receiptNumber}.pdf`;
    const filePath = path.join(receiptDir, fileName);

    // Create PDF document
    const doc = new PDFDocument({
      margin: 50,
      bufferPages: true,
    });

    // Pipe to file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header - Receipt Title
    doc.fontSize(24).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
    doc.fontSize(10).text('─'.repeat(80), { align: 'center' });
    doc.moveDown(0.5);

    // Receipt Number and Date
    doc.fontSize(11).font('Helvetica-Bold').text(`Receipt #: ${receipt.receiptNumber}`);
    doc.fontSize(10).text(`Date: ${receipt.receiptDate.toLocaleDateString()}`);
    doc.moveDown(0.3);

    // Student Information Section
    doc.fontSize(12).font('Helvetica-Bold').text('Student Information', { underline: true });
    doc.fontSize(10).font('Helvetica');
    if (payment.studentId) {
      doc.text(`Name: ${payment.studentId.name || 'N/A'}`);
      doc.text(`Email: ${payment.studentId.email || 'N/A'}`);
      doc.text(`Phone: ${payment.studentId.phone || 'N/A'}`);
    }
    doc.moveDown(0.3);

    // Room Information Section
    doc.fontSize(12).font('Helvetica-Bold').text('Room Information', { underline: true });
    doc.fontSize(10).font('Helvetica');
    if (payment.roomId) {
      doc.text(`Room: ${payment.roomId.name || 'N/A'}`);
      doc.text(`Room #: ${payment.roomId.roomNumber || 'N/A'}`);
    }
    doc.moveDown(0.3);

    // Boarding House Information Section
    doc.fontSize(12).font('Helvetica-Bold').text('Boarding House', { underline: true });
    doc.fontSize(10).font('Helvetica');
    if (payment.boardingHouseId) {
      doc.text(`Name: ${payment.boardingHouseId.name || 'N/A'}`);
      doc.text(`Address: ${payment.boardingHouseId.address || 'N/A'}`);
    }
    doc.moveDown(0.5);

    // Payment Details Section
    doc.fontSize(12).font('Helvetica-Bold').text('Payment Details', { underline: true });
    doc.fontSize(10).font('Helvetica');

    // Create table for payment details
    const startY = doc.y;
    const col1X = 50;
    const col2X = 300;

    doc.text('Payment Amount:', col1X);
    doc.fontSize(11).font('Helvetica-Bold').text(`Rs. ${receipt.paymentAmount}`, col2X);
    doc.fontSize(10).font('Helvetica');

    doc.text('Payment Method:', col1X);
    doc.text(receipt.paymentMethod === 'file_upload' ? 'File Upload' : receipt.paymentMethod, col2X);

    doc.text('Payment Cycle:', col1X);
    doc.text(`Cycle #${payment.cycleNumber}`, col2X);

    doc.text('Cycle Start Date:', col1X);
    doc.text(payment.cycleStartDate?.toLocaleDateString() || 'N/A', col2X);

    doc.text('Due Date:', col1X);
    doc.text(payment.dueDate?.toLocaleDateString() || 'N/A', col2X);

    doc.moveDown(0.5);

    // Student Remarks Section
    if (payment.remarks) {
      doc.fontSize(12).font('Helvetica-Bold').text('Notes', { underline: true });
      doc.fontSize(10).font('Helvetica').text(payment.remarks, { width: 450 });
      doc.moveDown(0.3);
    }

    doc.moveDown(0.5);

    // Separator line
    doc.fontSize(10).text('─'.repeat(80), { align: 'center' });
    doc.moveDown(0.3);

    // Approval Information Section
    doc.fontSize(12).font('Helvetica-Bold').text('Approval Information', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Approved By: Owner`);
    doc.text(`Approval Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Status: APPROVED ✓`);

    doc.moveDown(1);

    // Footer
    doc.fontSize(9).font('Helvetica-Oblique').text(
      'This is an electronically generated receipt. No signature is required.',
      { align: 'center', color: '#666666' }
    );

    doc.moveDown(0.5);
    doc.fontSize(8).text(`Generated: ${new Date().toISOString()}`, { align: 'center', color: '#999999' });

    // Finalize PDF
    doc.end();

    // Return file path on stream finish
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve(filePath);
      });
      stream.on('error', reject);
    });
  } catch (error) {
    throw error;
  }
};
