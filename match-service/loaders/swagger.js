const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Winamax-like API",
      description: "API for managing matches",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      schemas: {
        MatchInput: {
          type: 'object',
          required: ['team1', 'team2', 'start_time'],
          properties: {
            team1: { type: 'string', example: 'PSG' },
            team2: { type: 'string', example: 'Marseille' },
            start_time: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-25T20:00:00Z'
            }
          }
        },
        UpdateMatch: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer', example: 1 },
            team1: { type: 'string', example: 'PSG' },
            team2: { type: 'string', example: 'Marseille' },
            start_time: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-25T20:00:00Z'
            },
            status: { type: 'string', example: 'Completed' },
            goals_team1: { type: 'integer', example: 2 },
            goals_team2: { type: 'integer', example: 2 }
          }
        },
        StatusUpdate: {
          type: 'object',
          required: ['id', 'status'],
          properties: {
            id: { type: 'integer', example: 1 },
            status: { type: 'string', example: 'Completed' }
          }
        }
      }
    }
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
