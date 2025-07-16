const request = require('supertest');
const express = require('express');
const pool = require('../../loaders/postgres');
const betRoutes = require('../../routes/bet');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', betRoutes);

beforeAll(async () => {
  await pool.query('TRUNCATE users, favorites, matchs RESTART IDENTITY CASCADE');
  await pool.query('ALTER SEQUENCE matchs_id_seq RESTART WITH 1');
  await pool.query(`
    INSERT INTO matchs (id, team1, team2, start_time, status, goals_team1, goals_team2, create_at, last_updated) VALUES
    (1, 'PSG', 'Marseille', '2025-12-25 21:00:00+01', 'Live', 2, 2, now(), now()),
    (3, 'PSG', 'Marseille', '2023-12-25 20:00:00+00', 'NOT STARTED', 0, 0, now(), now());
  `);

  await pool.query(`INSERT INTO users (id, email, password) VALUES (1, 'test', 'test') ON CONFLICT DO NOTHING;`);
  await pool.query(`INSERT INTO favorites(user_id, match_id) VALUES (1, 1) ON CONFLICT DO NOTHING;`);
});

describe('API Bets Endpoints', () => {

  test('POST /bets devrait créer un nouveau pari', async () => {
    const betData = {
      userId: 1,
      matchId: 1,
      prediction: 'team1',
    };

    const response = await request(app)
      .post('/bets')
      .send(betData);

    expect(response.statusCode).toBe(201);
    expect(response.body.user_id).toBe(betData.userId);
    expect(response.body.status).toBe('pending');
  });

  test('GET /bets/:userId - devrait retourner l\'historique des paris pour un utilisateur', async () => {
    const data = {
      "user_id" : 1
    }
    const response = await request(app).get(`/bets`).send(data);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].user_id).toBe(1);
  });
});
