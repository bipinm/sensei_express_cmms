const bcrypt = require('bcryptjs');
const { Person } = require('../models');

const ensureAdminUser = async () => {
  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@senseiexpress.com';

  const existing = await Person.findOne({ where: { username } });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await Person.create({
    username,
    email,
    name: 'System Administrator',
    type: 'ADMIN',
    passwordHash,
    notes: 'Default admin user',
  });
};

module.exports = {
  ensureAdminUser,
};
