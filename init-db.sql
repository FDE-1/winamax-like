CREATE TABLE matchs (
    id SERIAL PRIMARY KEY,
    team1 VARCHAR(100),
    team2 VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50),
    goals_team1 INTEGER,
    goals_team2 INTEGER,
    create_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE
);

INSERT INTO matchs (id, team1, team2, start_time, status, goals_team1, goals_team2, create_at, last_updated) VALUES
(1, 'PSG', 'Marseille', '2025-12-25 21:00:00+01', 'Live', 2, 2, '2025-06-20 12:58:15.61+02', '2025-06-20 17:44:51.376+02'),
(3, 'PSG', 'Marseille', '2023-12-25 20:00:00+00', 'NOT STARTED', 0, 0, '2025-06-20 14:34:00.947+02', '2025-06-20 14:34:00.947+02'),
(4, 'PSG', 'Marseille', '2023-12-25 20:00:00+00', 'NOT STARTED', 0, 0, '2025-06-20 14:36:34.064+02', '2025-06-20 14:36:34.064+02'),
(5, 'PSG', 'Marseille', '2023-12-25 20:00:00+00', 'NOT STARTED', 0, 0, '2025-06-20 14:39:46.601+02', '2025-06-20 14:39:46.601+02'),
(6, 'PSG', 'Marseille', '2023-12-25 21:00:00+01', 'NOT STARTED', 2, 0, '2025-06-20 14:40:55.806+02', '2025-06-20 14:42:56.805+02'),
(7, 'PSG', 'Marseille', '2023-12-27 21:00:00+01', 'NOT STARTED', 0, 0, '2025-06-20 15:03:34.665+02', '2025-06-20 15:03:34.665+02'),
(8, 'PSG', 'Marseille', '2025-12-25 21:00:00+01', 'NOT STARTED', 0, 0, '2025-06-20 15:10:43.768+02', '2025-06-20 15:10:43.768+02');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

INSERT INTO users (id, email, password) VALUES
(1, 'test', 'test');

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    match_id INTEGER NOT NULL REFERENCES matchs(id),
    notify_on_start BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_goal BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_finish BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (user_id, match_id)
);

INSERT INTO favorites(user_id, match_id) VALUES (1, 1) ON CONFLICT DO NOTHING;

CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost');

CREATE TABLE bets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL REFERENCES matchs(id) ON DELETE CASCADE,
    prediction VARCHAR(50) NOT NULL,
    status bet_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, match_id)
);
