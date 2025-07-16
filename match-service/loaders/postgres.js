const { Pool } = require('pg');
require('dotenv').config();

const port = process.env.POSTGRES_PORT || 5432;
console.log('Using port:', port);

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "winamax",
  password: process.env.POSTGRES_PASSWORD || "your_password",
  port: process.env.POSTGRES_PORT || 5432,
});

pool.on('connect', () => {
    console.log('Connection to the database winamax working');
})

module.exports = pool;
