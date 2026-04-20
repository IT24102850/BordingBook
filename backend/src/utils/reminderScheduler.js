/**
 * FILE: reminderScheduler.js
 * PURPOSE: Schedule and manage automatic reminder generation
 * DESCRIPTION: Runs on a schedule to create pre-payment and overdue reminders
 *              for all active payment cycles
 */

const reminderService = require('../payment/services/reminderService');

// Store reference to the interval so we can clear it if needed
let schedulerInterval = null;

/**
 * Start the reminder generation scheduler
 * Runs every 24 hours (or as configured)
 * @param {Number} intervalMs - Milliseconds between runs (default: 86400000 = 24 hours)
 */
exports.startReminderScheduler = (intervalMs = 86400000) => {
  try {
    console.log('🚀 Starting reminder scheduler...');
    console.log(`   Interval: ${intervalMs / 1000 / 60 / 60} hours`);

    // Run immediately on startup
    console.log('📅 Running initial reminder generation...');
    reminderService.generateAllReminders()
      .then(summary => {
        console.log('✅ Initial reminder generation completed');
        console.log(`   Pre-payment: ${summary.prePaymentRemindersCreated}`);
        console.log(`   Overdue: ${summary.overdueRemindersCreated}`);
      })
      .catch(error => {
        console.error('❌ Error in initial reminder generation:', error.message);
      });

    // Schedule periodic runs
    schedulerInterval = setInterval(async () => {
      try {
        console.log('📅 Running scheduled reminder generation...');
        const summary = await reminderService.generateAllReminders();
        console.log('✅ Scheduled reminder generation completed');
        console.log(`   Pre-payment: ${summary.prePaymentRemindersCreated}`);
        console.log(`   Overdue: ${summary.overdueRemindersCreated}`);

        // Also run cleanup every 7th run
        if (Math.random() < 0.143) { // ~14.3% chance = roughly once per week if run daily
          try {
            console.log('🧹 Running reminder cleanup...');
            const cleanupResult = await reminderService.cleanupOldReminders();
            console.log('✅ Cleanup completed, removed:', cleanupResult.deletedCount);
          } catch (cleanupError) {
            console.error('⚠️  Cleanup error:', cleanupError.message);
          }
        }
      } catch (error) {
        console.error('❌ Error in scheduled reminder generation:', error.message);
      }
    }, intervalMs);

    console.log('✅ Reminder scheduler started successfully');
  } catch (error) {
    console.error('❌ Error starting reminder scheduler:', error);
  }
};

/**
 * Stop the reminder generation scheduler
 */
exports.stopReminderScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    console.log('🛑 Reminder scheduler stopped');
  }
};

/**
 * Get scheduler status
 * @returns {Object} Status information
 */
exports.getSchedulerStatus = () => {
  return {
    running: schedulerInterval !== null,
    lastCheck: new Date(),
  };
};
