const request = require('supertest');
const express = require('express');
const pool = require('../../loaders/postgres');
const redis = require('../../loaders/redis');
const matchsRoutes = require('../../routes/matchs');
const { swaggerUi, swaggerDocs } = require('../../loaders/swagger');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/matchs', matchsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

describe('Match Routes Integration Tests', () => {

  beforeEach(async () => {
    await pool.query('TRUNCATE users, favorites, matchs RESTART IDENTITY CASCADE');
    await pool.query(`
      INSERT INTO matchs (id, team1, team2, start_time, status, goals_team1, goals_team2, create_at, last_updated) VALUES
      (1, 'PSG', 'Marseille', '2025-12-25 21:00:00+01', 'Live', 2, 2, '2025-06-20 12:58:15.61+02', '2025-06-20 17:44:51.376+02'),
      (3, 'PSG', 'Marseille', '2023-12-25 20:00:00+00', 'NOT STARTED', 0, 0, '2025-06-20 14:34:00.947+02', '2025-06-20 14:34:00.947+02'),
      (4, 'PSG', 'Marseille', '2023-12-25 20:00:00+00', 'NOT STARTED', 0, 0, '2025-06-20 14:36:34.064+02', '2025-06-20 14:36:34.064+02'),
      (5, 'PSG', 'Marseille', '2023-12-25 20:00:00+00', 'NOT STARTED', 0, 0, '2025-06-20 14:39:46.601+02', '2025-06-20 14:39:46.601+02'),
      (6, 'PSG', 'Marseille', '2023-12-25 21:00:00+01', 'NOT STARTED', 2, 0, '2025-06-20 14:40:55.806+02', '2025-06-20 14:42:56.805+02'),
      (7, 'PSG', 'Marseille', '2023-12-27 21:00:00+01', 'NOT STARTED', 0, 0, '2025-06-20 15:03:34.665+02', '2025-06-20 15:03:34.665+02'),
      (8, 'PSG', 'Marseille', '2025-12-25 21:00:00+01', 'NOT STARTED', 0, 0, '2025-06-20 15:10:43.768+02', '2025-06-20 15:10:43.768+02');
    `);
  });

  afterAll(async () => {
    await pool.end();
    await redis.quit();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('POST /matchs/fetchAllMatch returns all matches', async () => {
    const response = await request(app)
      .post('/matchs/fetchAllMatch')
      .expect(200);

    expect(response.body.length).toBe(7);
  });

  test('POST /matchs creates a new match', async () => {
    const newMatch = {
      team1: 'Lyon',
      team2: 'Monaco',
      start_time: '2025-12-25T20:00:00Z',
    };
    await pool.query('TRUNCATE users, favorites, matchs RESTART IDENTITY CASCADE');
    let response;
    response = await request(app)
      .post('/matchs')
      .send(newMatch)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      team1: 'Lyon',
      team2: 'Monaco',
      start_time: expect.any(String),
    });

    const { rows } = await pool.query('SELECT * FROM matchs WHERE id = $1', [response.body.id]);
    expect(rows[0]).toMatchObject({
      team1: 'Lyon',
      team2: 'Monaco',
      start_time: expect.any(Date),
      status: 'NOT STARTED',
      goals_team1: 0,
      goals_team2: 0,
    });
  });

  test('DELETE /matchs deletes a match by ID', async () => {
    const newMatch = {
      team1: 'Lyon',
      team2: 'Monaco',
      start_time: '2025-12-25T20:00:00Z',
    };
    await pool.query('TRUNCATE users, favorites, matchs RESTART IDENTITY CASCADE');
    let response;
    response = await request(app)
      .post('/matchs')
      .send(newMatch)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      team1: 'Lyon',
      team2: 'Monaco',
      start_time: expect.any(String),
    });

    let { rows: initialRows } = await pool.query('SELECT * FROM matchs WHERE id = $1', [response.body.id]);
    expect(initialRows[0]).toMatchObject({
      team1: 'Lyon',
      team2: 'Monaco',
      start_time: expect.any(Date),
      status: 'NOT STARTED',
      goals_team1: 0,
      goals_team2: 0,
    });

    const deleteResponse = await request(app)
      .delete(`/matchs`)
      .send({ id: initialRows[0].id })
      .expect(200);

    expect(deleteResponse.body).toMatchObject({
      id: initialRows[0].id,
      team1: 'Lyon',
      team2: 'Monaco',
      start_time: expect.any(String),
    });

    const { rows: rowsAfterDelete } = await pool.query('SELECT * FROM matchs WHERE id = $1', [response.body.id]);
    expect(rowsAfterDelete.length).toBe(0);
  });


  test('POST /matchs/update updates a match', async () => {
    const updateData = {
      id: 1,
      team1: 'PSG Updated',
      team2: 'Marseille',
      start_time: '2025-12-25T22:00:00.000Z',
      status: 'Completed',
      goals_team1: 3,
      goals_team2: 1,
    };

    const response = await request(app)
      .post('/matchs/update')
      .send(updateData)
      .expect(200);

    expect(response.body).toMatchObject({
      id: 1,
      team1: 'PSG Updated',
      team2: 'Marseille',
      start_time: expect.any(String),
      status: 'Completed',
      goals_team1: 3,
      goals_team2: 1,
      create_at: expect.any(String),
      last_updated: expect.any(String),
    });

    const { rows: [updated] } = await pool.query('SELECT * FROM matchs WHERE id = 1');
    expect(updated.id).toBe(updateData.id);
    expect(updated.team1).toBe(updateData.team1);
    expect(updated.team2).toBe(updateData.team2);
    expect(updated.status).toBe(updateData.status);
    expect(updated.goals_team1).toBe(updateData.goals_team1);
    expect(updated.goals_team2).toBe(updateData.goals_team2);
    expect(updated.start_time.toISOString()).toBe(updateData.start_time);
  });

  test('GET /matchs/upcoming returns upcoming matches', async () => {
    const response = await request(app)
      .get('/matchs/upcoming')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 8,
          team1: 'PSG',
          team2: 'Marseille',
          start_time: '2025-12-25T20:00:00.000Z',
          status: 'NOT STARTED',
        }),
      ])
    );
    expect(response.body).toHaveLength(1);
  });

  test('GET /matchs/live returns live matches', async () => {
    const response = await request(app)
      .get('/matchs/live')
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 1,
        status: 'Live',
      }),
    ]);
  });
});
