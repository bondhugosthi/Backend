const mongoose = require('mongoose');

const getGridFSBucket = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready');
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
};

module.exports = { getGridFSBucket };
