const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy headers (Vercel/Reverse proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = String(process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/sports', require('./routes/sportRoutes'));
app.use('/api/social-work', require('./routes/socialWorkRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));
app.use('/api/slider-images', require('./routes/sliderImageRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler (should be last)
app.use(errorHandler);

// Initialize default admin if not exists
const initializeAdmin = async () => {
  try {
    const Admin = require('./models/Admin');
    const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping default admin initialization.');
      return;
    }

    const adminExists = await Admin.findOne({ email: adminEmail });
    
    if (!adminExists) {
      await Admin.create({
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin',
        isActive: true
      });
      console.log('Default admin created');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initializeAdmin();
  });
} else {
  initializeAdmin().catch((error) => {
    console.error('Error initializing admin:', error);
  });
}

module.exports = app;
