const mysql = require('mysql2/promise')
require('dotenv').config()

const {
  MYSQL_HOST = 'localhost',
  MYSQL_PORT = 3306,
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = '',
  MYSQL_DATABASE = 'asistencia',
  MYSQL_CONNECTION_LIMIT = 10,
} = process.env

const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: Number(MYSQL_CONNECTION_LIMIT),
  queueLimit: 0,
})

async function ping() {
  const [rows] = await pool.query('SELECT 1 AS ok')
  return rows
}

module.exports = { pool, ping }