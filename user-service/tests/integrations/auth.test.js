const request = require('supertest');
const express = require('express');
const pool = require('../../loaders/postgres');
const authRoutes = require('../../routes/auth');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRoutes);

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await pool.query('TRUNCATE users, favorites, matchs RESTART IDENTITY CASCADE');
  });

  test('POST /auth/register registers a new user', async () => {
    const user = { email: 'test@example.com', password: 'password123' };

    try {
      const res = await request(app)
        .post('/auth/register')
        .send(user)
        .expect(200);

      expect(res.body).toMatchObject({
        id: expect.any(Number),
        email: user.email,
      });

      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [res.body.id]);
      expect(rows.length).toBe(1);
      expect(rows[0].email).toBe(user.email);
    } catch (error) {
      console.error('Login test failed:');
      console.error('Status:', error.response?.status);
      console.error('Body:', error.response?.body);
      console.error('Text:', error.response?.text);
      console.error('Register test failed:', error.response?.text || error.message || error);
      throw error;
    }
  });

  test('POST /auth/login logs in and returns token', async () => {
    const user = { email: 'test@example.com', password: 'secure123' };

    try {
      await request(app).post('/auth/register').send(user);

      const res = await request(app)
        .post('/auth/login')
        .send(user)
        .expect(200);

      expect(res.body).toHaveProperty('token');
    } catch (error) {
      console.error('Login test failed:');
      console.error('Status:', error.response?.status);
      console.error('Body:', error.response?.body);
      console.error('Text:', error.response?.text);
      throw error;
    }
  });

});
