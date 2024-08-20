import { FastifyInstance } from 'fastify';
import { sendTransactionController, withdrawTransactionController } from '../controller/transactionController';
import { authMiddleware } from '../middleware/authMiddleware';

export async function transactionRoutes(fastify: FastifyInstance) {
  // Route for sending funds
  fastify.post('/send', {
    preHandler: authMiddleware,
    schema: {
      body: {
        type: 'object',
        required: ['user_id', 'account_id', 'amount', 'to_address'],
        properties: {
          user_id: { type: 'string' },
          account_id: { type: 'string' },
          amount: { type: 'number' },
          to_address: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            transaction_id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            to_address: { type: 'string' },
            status: { type: 'string' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, sendTransactionController);

  // Route for withdrawing funds
  fastify.post('/withdraw', {
    preHandler: authMiddleware,
    schema: {
      body: {
        type: 'object',
        required: ['user_id', 'account_id', 'amount'],
        properties: {
          user_id: { type: 'string' },
          account_id: { type: 'string' },
          amount: { type: 'number' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            transaction_id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: { type: 'string' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, withdrawTransactionController);
}
