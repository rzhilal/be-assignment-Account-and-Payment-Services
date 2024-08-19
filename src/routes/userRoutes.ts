import { FastifyInstance } from 'fastify';
import { registerUserController, loginUserController, getUserAccountsAndTransactionsController } from '../controller/userController';

export async function userRoutes(fastify: FastifyInstance) {
    fastify.post('/auth/register', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'password', 'email'],
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        created_at: { type: 'string' },
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
    }, registerUserController);

    fastify.post('/auth/login', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                email: { type: 'string' },
                                username: { type: 'string' },
                            },
                        },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
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
    }, loginUserController);

    fastify.get('/users/accounts-transactions', {
        schema: {
            params: {
                type: 'object',
                required: ['user_id'],
                properties: { },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        accounts: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    account_id: { type: 'string' },
                                    user_id: { type: 'string' },
                                    account_type: { type: 'string' },
                                    account_number: { type: 'string' },
                                    balance: { type: 'string' },
                                    created_at: { type: 'string', format: 'date-time' },
                                    updated_at: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                        transactions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    history_id: { type: 'string' },
                                    user_id: { type: 'string' },
                                    account_id: { type: 'string' },
                                    transaction_id: { type: 'string' },
                                    amount: { type: 'string' }, // Decimal is represented as string
                                    timestamp: { type: 'string', format: 'date-time' },
                                    transaction_type: { type: 'string' },
                                    status: { type: 'string' },
                                    created_at: { type: 'string', format: 'date-time' },
                                    updated_at: { type: 'string', format: 'date-time' },
                                    Transaction: {
                                        type: 'object',
                                        properties: {
                                            transaction_id: { type: 'string' },
                                            amount: { type: 'string' }, // Decimal is represented as string
                                            currency: { type: 'string' },
                                            timestamp: { type: 'string', format: 'date-time' },
                                            to_address: { type: 'string' },
                                            status: { type: 'string' },
                                            created_at: { type: 'string', format: 'date-time' },
                                            updated_at: { type: 'string', format: 'date-time' },
                                        },
                                    },
                                },
                            },
                        },
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
    }, getUserAccountsAndTransactionsController);
}
