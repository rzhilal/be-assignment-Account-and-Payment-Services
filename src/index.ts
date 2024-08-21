import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { userRoutes } from './routes/userRoutes';
import { paymentAccountRoutes } from './routes/paymentAccountRoutes';
import { transactionRoutes } from './routes/transactionRoutes';
import { recurringPaymentRoutes } from './routes/recurringPaymentRoutes';

const server = Fastify({
  logger: {
    level: 'info'
  },
});

// Register Swagger documentation
server.register(swagger, {
  swagger: {
    info: {
      title: 'Fastify Payment Service API',
      description: 'API documentation for Payment and Account Management Services',
      version: '1.0.0',
    },
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: "Enter the token in the format `Bearer <token>`",
      }
    },
    security: [{ Bearer: [] }],
  },
});

// Register Swagger UI
server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
});

// Register routes
server.register(userRoutes, { prefix: '/api/users' });
server.register(paymentAccountRoutes, { prefix: '/api/accounts' });
server.register(transactionRoutes, { prefix: '/api/transaction' });
server.register(recurringPaymentRoutes, { prefix: '/api/recurring' });

// Start the server
server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
