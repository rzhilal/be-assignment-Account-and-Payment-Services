import { FastifyRequest, FastifyReply } from 'fastify';
import { registerUserController, loginUserController, getUserAccountsAndTransactionsController } from '../../src/controller/userController';
import { registerUser, getUserAccountsAndTransactions } from '../../src/service/userService';
import { supabase } from '../../src/utils/supabaseClient';

// Import the service module before mocking it
import '../../src/service/userService';

jest.mock('../../src/service/userService.ts');
jest.mock('../../src/utils/supabaseClient.ts');
describe('UserController', () => {
    let request: Partial<FastifyRequest>;
    let reply: Partial<FastifyReply>;

    beforeEach(() => {
        request = {
          body: {},
          server: {
            log: {
              info: jest.fn(),
              error: jest.fn(),
            },
          } as any,
        };

        reply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    describe('registerUserController', () => {
        it('should register a user successfully', async () => {
            (registerUser as jest.Mock).mockResolvedValue({ username: 'testuser' });

            request.body = { username: 'testuser', password: 'testpass', email: 'test@example.com' };

            await registerUserController(request as FastifyRequest, reply as FastifyReply);

            expect(registerUser).toHaveBeenCalledWith('testuser', 'testpass', 'test@example.com');
            expect(reply.status).toHaveBeenCalledWith(201);
            expect(reply.send).toHaveBeenCalledWith({ username: 'testuser' });
        });

        it('should return 400 if registration fails', async () => {
            (registerUser as jest.Mock).mockRejectedValue(new Error('Registration failed'));

            await registerUserController(request as FastifyRequest, reply as FastifyReply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith({ message: 'Registration failed' });
        });
    });

    describe('loginUserController', () => {
        it('should log in a user successfully', async () => {
            request.body = { email: 'test@example.com', password: 'testpass' };
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user_id' }, session: { access_token: 'token', refresh_token: 'refresh' } },
                error: null,
            });

            await loginUserController(request as FastifyRequest, reply as FastifyReply);

            expect(reply.status).toHaveBeenCalledWith(200);
            expect(reply.send).toHaveBeenCalledWith({
                user: { id: 'user_id' },
                accessToken: 'token',
                refreshToken: 'refresh',
            });
        });

        it('should return 401 if login fails', async () => {
            request.body = { email: 'test@example.com', password: 'wrongpass' };
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                data: null,
                error: { message: 'Invalid email or password' },
            });

            await loginUserController(request as FastifyRequest, reply as FastifyReply);

            expect(reply.status).toHaveBeenCalledWith(401);
            expect(reply.send).toHaveBeenCalledWith({ message: 'Invalid email or password' });
        });
    });

    describe('getUserAccountsAndTransactionsController', () => {
        it('should return user accounts and transactions', async () => {
            (getUserAccountsAndTransactions as jest.Mock).mockResolvedValue({ accounts: [], transactions: [] });

            await getUserAccountsAndTransactionsController(request as FastifyRequest, reply as FastifyReply);

            expect(reply.status).toHaveBeenCalledWith(200);
            expect(reply.send).toHaveBeenCalledWith({ accounts: [], transactions: [] });
        });

        it('should return 400 if fetching accounts and transactions fails', async () => {
            (getUserAccountsAndTransactions as jest.Mock).mockRejectedValue(new Error('Failed to fetch data'));

            await getUserAccountsAndTransactionsController(request as FastifyRequest, reply as FastifyReply);

            expect(reply.status).toHaveBeenCalledWith(400);
            expect(reply.send).toHaveBeenCalledWith({ message: 'Failed to fetch data' });
        });
    });
});