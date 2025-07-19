import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Live Coding Collaboration API",
      version: "1.0.0",
      description: "API for real-time coding collaboration with Socket.IO",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/swaggerDocs/index.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
