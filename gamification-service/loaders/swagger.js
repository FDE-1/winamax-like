const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Gamification Service API",
      description: "API pour la gestion des paris utilisateurs.",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3002",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: "Entrez le token JWT avec le préfixe 'Bearer ' (ex: 'Bearer eyJhbGci...')"
        }
      },
      schemas: {
        Bet: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: "L'identifiant unique du pari.",
              example: 1,
              readOnly: true
            },
            user_id: {
              type: 'integer',
              description: "L'ID de l'utilisateur qui a placé le pari.",
              example: 1
            },
            match_id: {
              type: 'integer',
              description: "L'ID du match concerné par le pari.",
              example: 42
            },
            prediction: {
              type: 'string',
              description: "La prédiction faite par l'utilisateur.",
              example: "team1_wins"
            },
            status: {
              type: 'string',
              description: "Le statut actuel du pari.",
              enum: ['pending', 'won', 'lost'],
              example: "pending"
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: "La date de création du pari.",
              example: "2023-10-27T10:00:00.000Z",
              readOnly: true
            }
          }
        }
      }
    }
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
