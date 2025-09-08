const express = require('express');

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Define routes
// Use new enhanced auth routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/onboarding', require('./routes/onboarding.routes'));

// Legacy routes - these will be migrated to new structure
app.use('/api/doctors', require('./api/routes/doctor.routes'));
app.use('/api/patients', require('./api/routes/patient.routes'));
app.use('/api/pharmacies', require('./api/routes/pharmacy.routes'));
app.use('/api/appointments', require('./api/routes/appointment.routes'));
app.use('/api/erx', require('./api/routes/erx.routes'));
app.use('/api/orders', require('./api/routes/order.routes'));
app.use('/api/pharma', require('./api/routes/pharma.routes'));
app.use('/api/admin', require('./api/routes/admin.routes'));

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // Server startup message suppressed in production
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  }
});

module.exports = app; // For testing purposes