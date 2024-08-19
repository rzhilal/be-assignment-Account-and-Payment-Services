import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware';
import { createPaymentAccountController, getPaymentAccountsController } from '../controller/paymentAccountController';

export async function paymentAccountRoutes(fastify: FastifyInstance) {
    fastify.post('/', {
        preHandler: authMiddleware,
        schema: {
            body: {
                type: 'object',
                required: ['account_type', 'account_number'],
                properties: {
                    user_id: { type: 'string' },
                    account_type: { type: 'string' },
                    account_number: { type: 'string' },
                    balance: { type: 'number', default: 0 }
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        account_id: { type: 'string' },
                        user_id: { type: 'string' },
                        account_type: { type: 'string' },
                        account_number: { type: 'string' },
                        balance: { type: 'number' },
                        created_at: { type: 'string' },
                    },
                },
                401: {
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
    }, createPaymentAccountController);

    fastify.get('/', {
        preHandler: authMiddleware,
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    user_id: { type: 'string' },
                },
                required: ['user_id'],
            },
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            account_id: { type: 'string' },
                            user_id: { type: 'string' },
                            account_type: { type: 'string' },
                            account_number: { type: 'string' },
                            balance: { type: 'number' },
                            created_at: { type: 'string' },
                        },
                    },
                },
                401: {
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
    }, getPaymentAccountsController);
}
