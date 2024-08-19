import { FastifyInstance } from 'fastify';
import { registerUserController, loginUserController } from '../controller/userController';

export async function userRoutes(fastify: FastifyInstance) {
    fastify.post('/register', {
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

    fastify.post('/login', {
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
}
