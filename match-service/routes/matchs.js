const express = require('express');
const router = express.Router();

const matchController = require('../controllers/matchController');

/**
 * @swagger
 * /matchs/fetchAllMatch:
 *   post:
 *     summary: Get all match
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Matchs fetchs successfully
 *       500:
 *         description: Internal server error
 */
router.post('/fetchAllMatch', matchController.getAllMatch);

/**
 * @swagger
 * /matchs:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchInput'
 *     responses:
 *       201:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 team1:
 *                   type: string
 *                 team2:
 *                   type: string
 *                 start_time:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.post('/', matchController.createMatch);
/**
 * @swagger
 * /matchs:
 *   delete:
 *     summary: Delete a match by ID
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 team1:
 *                   type: string
 *                 team2:
 *                   type: string
 *                 start_time:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Match not found
 *       500:
 *         description: Internal server error
 */
router.delete('/', matchController.deleteMatch);

/**
 * @swagger
 * /matchs/update:
 *   post:
 *     summary: Update a match
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMatch'
 *     responses:
 *       200:
 *         description: Match updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 team1:
 *                   type: string
 *                 team2:
 *                   type: string
 *                 start_time:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                 goals_team1:
 *                   type: integer
 *                 goals_team2:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
router.post('/update', matchController.updateMatch);

/**
 * @swagger
 * /matchs/upcoming:
 *   get:
 *     summary: Get upcoming matches
 *     description: Returns a list of matches that are scheduled to occur in the future
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: A list of upcoming matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MatchInput'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_type:
 *                   type: string
 *                   example: "ControllerError"
 *                 message:
 *                   type: string
 *                   example: "Service encountered an error"
 *                 details:
 *                   type: object
 *                   example: {
 *                     service: "matchService",
 *                     operation: "upComingMatch"
 *                   }
 */
router.get('/upcoming', matchController.upComingMatch);

/**
 * @swagger
 * /matchs/live:
 *   get:
 *     summary: Get all currently live matches
 *     description: Returns real-time status updates for all matches that are currently in progress
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Array of live match status updates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StatusUpdate'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve live matches"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-12-28T15:30:45Z"
 */
router.get('/live', matchController.getLiveMatch);

module.exports = router;
