const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const { getRetentionDate } = require('../utils/activityRetention');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    try {
      await ActivityLog.createIndexes();
      await ActivityLog.deleteMany({ timestamp: { $lt: getRetentionDate() } });
    } catch (indexError) {
      console.warn('ActivityLog retention setup failed:', indexError.message || indexError);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
