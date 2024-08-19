import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { userRoutes } from './controller/userController';

const server = Fastify({
  logger: {
    level: 'info'
  },
});

server.register(swagger, {
  swagger: {
    info: {
      title: 'Fastify Payment Service API',
      description: 'API documentation for Payment Management Services',
      version: '1.0.0',
    },
  },
});

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

server.register(userRoutes);

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
