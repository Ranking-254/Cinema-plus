const Seat = require('../models/Seat');

exports.releaseExpiredHolds = async () => {
  try {
    const now = new Date();

    // Find seats that are HELD but the time has passed ($lt = Less Than now)
    const result = await Seat.updateMany(
      { 
        status: 'HELD', 
        holdExpiresAt: { $lt: now } 
      },
      { 
        $set: { 
          status: 'AVAILABLE', 
          userId: null, 
          holdExpiresAt: null 
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`🧹 Cleanup: Released ${result.modifiedCount} expired seats back to the pool.`);
    }
  } catch (error) {
    console.error('Cleanup Error:', error);
  }
};