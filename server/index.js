const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use('/api/', limiter);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb:
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB Connected');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('💡 Make sure your MongoDB Atlas connection string is correct in .env file');
  process.exit(1);
});
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const folderRoutes = require('./routes/folders');
const activityRoutes = require('./routes/activity');
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/activity', activityRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WalDrive API is running' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
module.exports = app;
