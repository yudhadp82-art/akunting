/**
 * Database Migration Runner
 */

require('dotenv').config();
const migrate = require('./migrations/create-tables');

migrate();
