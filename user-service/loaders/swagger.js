const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Winamax-like API - User Service",
      description: "API for managing users and authentication",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
    components: {
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            password: { type: 'string', example: 'StrongPass123' }
          }
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            password: { type: 'string', example: 'StrongPass123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'
            }
          }
        },
        FavoriteInput: {
          type: 'object',
          required: ['matchId'],
          properties: {
            matchId: {
              type: 'string',
              example: 'abc123'
            }
          }
        },
        Favorite: {
          type: 'object',
          properties: {
            matchId: { type: 'string', example: 'abc123' }
          }
        }
      }
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication routes"
      },
      {
        name: "Users",
        description: "User-related operations"
      }
    ]
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
