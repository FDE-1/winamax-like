const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

/**
 * @swagger
 * /users/favorites:
 *   get:
 *     summary: Get all favorite match IDs for a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: List of favorite match IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/favorites', favoriteController.getFavorites);

/**
 * @swagger
 * /users/favorites:
 *   post:
 *     summary: Add a match to the user's favorites
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - matchId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               matchId:
 *                 type: integer
 *                 example: 42
 *     responses:
 *       200:
 *         description: Match added to favorites
 *       500:
 *         description: Internal server error
 */
router.post('/favorites', favoriteController.addFavorite);

module.exports = router;
