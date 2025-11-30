const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
require('./models');
const { ensureAdminUser } = require('./utils/seedAdmin');
const authRoutes = require('./routes/auth.routes');
const workOrderRoutes = require('./routes/workOrder.routes');
const assetRoutes = require('./routes/asset.routes');
const personRoutes = require('./routes/person.routes');
const workActivityRoutes = require('./routes/workActivity.routes');
const skillRoutes = require('./routes/skill.routes');
const attachmentRoutes = require('./routes/attachment.routes');
const ticketRoutes = require('./routes/ticket.routes');

const DATA_DIR = path.join(__dirname, 'data');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for attachments
app.use('/data', express.static(DATA_DIR));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/work-activities', workActivityRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/tickets', ticketRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    await ensureAdminUser();
    console.log('Default admin user ensured');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  testConnection();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
