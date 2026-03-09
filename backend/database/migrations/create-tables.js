/**
 * Database Migration Script
 * Creates all tables for the Koperasi Desa application
 */

const { sequelize } = require('../../src/models');

const migrate = async () => {
  try {
    console.log('Starting database migration...');

    // Sync all models to create tables
    await sequelize.sync({ force: false, alter: true });

    console.log('Database migration completed successfully!');
    console.log('Tables created/updated:');

    // List all tables
    const [results] = await sequelize.query("SHOW TABLES");
    results.forEach(row => {
      console.log(`  - ${Object.values(row)[0]}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

module.exports = migrate;
