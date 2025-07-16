Ce projet est censé être un projet de "WINAMAX"-like.

Voici les différents services:

1-Match Service

Ce service est la source de vérité pour toutes les données relatives aux matchs. Il gère la création, la lecture, la mise à jour et la suppression des matchs, ainsi que la production d'événements importants vers Kafka.

API Endpoints (Port: 3000)

POST /fetchAllMatch: Récupère la liste de tous les matchs.
curl -X POST http://localhost:3000/fetchAllMatch

GET /upcoming: Récupère tous les matchs à venir.
curl http://localhost:3000/upcoming

GET /live: Récupère tous les matchs en direct.
curl http://localhost:3000/live

POST /: Crée un nouveau match.
curl -X POST http://localhost:3000/ \
    -H "Content-Type: application/json" \
    -d '{"team1": "PSG", "team2": "Marseille", "start_time": "2025-12-25T20:00:00Z"}'

POST /update: Met à jour un match existant. Cette action produit des événements Kafka.
curl -X POST http://localhost:3000/update \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "status": "live", "goals_team1": 1, "goals_team2": 0}'

DELETE /: Supprime un match par son ID.
curl -X DELETE http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'


2. User Service

API Endpoints (Port: 3001)

POST /register: Inscrire un nouvel utilisateur.
curl -X POST http://localhost:3001/register \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "password123"}'

POST /login: Connecter un utilisateur et obtenir un token JWT.
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

GET /favorites: Récupérer la liste des favoris de l'utilisateur connecté.
curl http://localhost:3001/favorites \
    -H "Authorization: Bearer VOTRE_USER_ID"

POST /favorites: Ajouter un match aux favoris de l'utilisateur connecté.
curl -X POST http://localhost:3001/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{"matchId": 42}'


3. Gamification Service

API Endpoints (Port: 3002)

POST /bets: Placer un nouveau pari (nécessite un token d'authentification).
curl -X POST http://localhost:3002/bets \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
    -d '{"matchId": 42, "prediction": "team1_wins"}'

GET /bets: Récupérer l'historique des paris de l'utilisateur authentifié.
curl http://localhost:3002/bets \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"

POST /bets/resolve: Endpoint administratif pour résoudre les paris d'un match.
curl -X POST http://localhost:3002/bets/resolve \
  -H "Content-Type: application/json" \
  -d '{"matchId": 42, "winner": "team1_wins"}'

4. Notification Service

API Endpoints (Port: 3003)

GET /health: Vérifie si le service est opérationnel.
curl http://localhost:3003/health


Le service écoute activement les topics suivants :

    match-events:

        match.started: Notifie les abonnés du début d'un match.

        match.goal: Notifie les abonnés d'un nouveau but.

        match.statusChanged: Notifie d'un changement de statut (ex: mi-temps).

        match.finished: Notifie de la fin d'un match.

    notification-events:

        bet.resolved: Notifie un utilisateur spécifique du résultat de son pari (gagné/perdu).



Un client doit suivre ce flux pour recevoir des notifications :

Se connecter au serveur WebSocket à l'adresse http://localhost:3003.

Envoyer un événement authenticate avec son ID utilisateur pour s'identifier auprès du serveur.

socket.emit('authenticate', monUserId);

Pour lancer les tests:
enlever les commentaire de services contenant test-* dans le docker compose

Pour tester l'application:
docker compose up
lancer index.html
