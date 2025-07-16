const express = require('express');
const router = express.Router();

const betController = require('../controllers/betController');
/**
 * @swagger
 * /bets:
 *   post:
 *     summary: Placer un nouveau pari
 *     description: Permet à un utilisateur authentifié de placer un pari sur un match spécifique. Le userId est déduit du token d'authentification.
 *     tags: [Bets]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - prediction
 *             properties:
 *               matchId:
 *                 type: integer
 *                 description: ID du match sur lequel parier.
 *                 example: 42
 *               prediction:
 *                 type: string
 *                 description: La prédiction de l'utilisateur (ex: 'team1_wins', 'draw', '2-1').
 *                 example: "team1_wins"
 *     responses:
 *       201:
 *         description: Pari placé avec succès. Retourne l'objet du pari créé.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bet'
 *       400:
 *         description: Données d'entrée invalides.
 *       401:
 *         description: Authentification requise. Token manquant ou invalide.
 *       409:
 *         description: Un pari existe déjà pour cet utilisateur sur ce match.
 */
router.post('/bets', betController.placeBet);

/**
 * @swagger
 * /bets:
 *   get:
 *     summary: Récupérer l'historique des paris de l'utilisateur
 *     description: Retourne la liste de tous les paris effectués par l'utilisateur actuellement authentifié.
 *     tags: [Bets]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des paris récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bet'
 *       401:
 *         description: Authentification requise.
 */
router.get('/bets', betController.getBetHistory);

/**
 * @swagger
 * /bets/resolve:
 *   post:
 *     summary: Résoudre les paris pour un match terminé (Endpoint administratif)
 *     description: >
 *       Endpoint interne ou administratif pour mettre à jour le statut (gagné/perdu) de tous les paris en attente
 *       pour un match qui vient de se terminer.
 *       **Note :** Dans une architecture événementielle, cette logique est généralement déclenchée en interne par un consommateur Kafka.
 *     tags: [Bets]
 *     security:
 *       - BearerAuth: [] # Suppose une protection (ex: token admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - winner
 *             properties:
 *               matchId:
 *                 type: integer
 *                 description: ID du match qui vient de se terminer.
 *                 example: 42
 *               winner:
 *                 type: string
 *                 description: La prédiction qui est considérée comme gagnante (doit correspondre à la valeur de `prediction` des paris).
 *                 example: "team1_wins"
 *     responses:
 *       200:
 *         description: Les paris pour le match ont été résolus avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bets resolved for match 42"
 *       404:
 *         description: Match non trouvé ou aucun pari en attente pour ce match.
 */
router.post('/bets/resolve', betController.resolveBetsForMatch);
module.exports = router;
