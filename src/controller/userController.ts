import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { registerUser } from '../service/userService';

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
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { username, password, email } = request.body as { username: string; password: string; email: string };

        try {
            const user = await registerUser(username, password, email);
            fastify.log.info(`User registered successfully: ${user.username}`);
            return reply.status(201).send(user);
        } catch (error) {
            return reply.status(400).send({ message: (error as Error).message });
        }
    });
}
