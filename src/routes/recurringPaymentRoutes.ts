import { FastifyInstance } from 'fastify';
import { addRecurringPaymentController } from '../controller/recurringPaymentController';

export async function recurringPaymentRoutes(fastify: FastifyInstance) {
  fastify.post('/recurring-payment', {
    schema: {
      body: {
        type: 'object',
        required: ['user_id', 'account_id', 'amount', 'currency', 'interval'],
        properties: {
          user_id: { type: 'string' },
          account_id: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          interval: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            recurring_payment_id: { type: 'string' },
            user_id: { type: 'string' },
            account_id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            interval: { type: 'string' },
            status: { type: 'string' },
            next_execution: { type: 'string' },
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
  }, addRecurringPaymentController);
}
