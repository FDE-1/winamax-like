const request = require('supertest');
const express = require('express');
const pool = require('../../loaders/postgres');
const authRoutes = require('../../routes/auth');
const userRoutes = require('../../routes/favorite');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

describe('Favorites Endpoints', () => {
  let userId;
  let matchId = 1;

  beforeEach(async () => {
    await pool.query('TRUNCATE users, favorites, matchs RESTART IDENTITY CASCADE');
    await pool.query('ALTER SEQUENCE matchs_id_seq RESTART WITH 1');
    const insertedMatch = await pool.query(`
      INSERT INTO matchs (team1, team2, start_time, status, goals_team1, goals_team2, create_at, last_updated) VALUES
      ('PSG', 'Marseille', '2025-12-25 21:00:00+01', 'Live', 2, 2, '2025-06-20 12:58:15.61+02', '2025-06-20 17:44:51.376+02') RETURNING id;
    `);
    matchId = insertedMatch.rows[0].id;
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'fav@example.com', password: 'pass123' });
    userId = res.body.id;
  });

  test('POST /users/favorites adds a favorite', async () => {
      const res = await request(app)
      .post('/users/favorites')
      .send({ userId: userId, matchId: matchId })
      .expect(200);

    expect(res.body).toMatchObject({
      user_id: userId,
      match_id: matchId,
    });

    const { rows } = await pool.query('SELECT * FROM favorites WHERE user_id = $1 AND match_id = $2', [userId, matchId]);
    expect(rows.length).toBe(1);
  });

  test('GET /users/favorites gets favorites', async () => {
    // email= 'login@example.com'
    // password= 'secure123'
    // await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password]);
    await pool.query('INSERT INTO favorites (user_id, match_id) VALUES ($1, $2)', [userId, matchId]);

    const res = await request(app)
      .get('/users/favorites')
      .send({ userId })
      .expect(200);

    expect(res.body).toMatchObject({"match_id": matchId});

  });
});
