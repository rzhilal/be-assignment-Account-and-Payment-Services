import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { registerUser, getUserAccountsAndTransactions } from '../../src/service/userService';
import { supabase } from '../../src/utils/supabaseClient';

// Mock dependencies
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        user: {
            create: jest.fn(),
        },
        paymentAccount: {
            findMany: jest.fn(),
        },
        paymentHistory: {
            findMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});
jest.mock('bcrypt');
jest.mock('../../src/utils/supabaseClient', () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
        },
    },
}));

describe('UserService', () => {
    const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    const bcryptHashMock = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
    const supabaseSignUpMock = supabase.auth.signUp as jest.MockedFunction<typeof supabase.auth.signUp>;
    const supabaseSignInMock = supabase.auth.signInWithPassword as jest.MockedFunction<typeof supabase.auth.signInWithPassword>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('should register a user and return the user data', async () => {
            // Mock bcrypt to hash password
            bcryptHashMock.mockImplementation(() => Promise.resolve('hashedpassword'));

            // Mock Supabase signUp to succeed
            supabaseSignUpMock.mockResolvedValue({
                data: { user: { id: 'supabase_user_id' } as any, session: null },
                error: null,
            });

            // Ensure prisma.user.create is typed as a jest.fn()
            (prisma.user.create as jest.Mock).mockResolvedValue({
                user_id: 'user_id',
                username: 'testuser',
                email: 'test@example.com',
                created_at: new Date(),
                updated_at: new Date(), // Add all required fields
            });

            const result = await registerUser('testuser', 'password', 'test@example.com');

            expect(bcryptHashMock).toHaveBeenCalledWith('password', 10);
            expect(supabaseSignUpMock).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    user_id: 'supabase_user_id',
                    username: 'testuser',
                    password_hash: 'hashedpassword',
                    email: 'test@example.com',
                },
            });
            expect(result).toEqual({
                user_id: 'user_id',
                username: 'testuser',
                email: 'test@example.com',
                created_at: expect.any(Date),
                supabaseUserId: 'supabase_user_id',
            });
        });

        it('should throw an error if registration with Supabase fails', async () => {
            // Mock bcrypt to hash password
            bcryptHashMock.mockImplementation(() => Promise.resolve('hashedpassword'));

            // Mock Supabase signUp to fail
            supabaseSignUpMock.mockRejectedValue(new Error('Supabase error'));

            await expect(registerUser('testuser', 'password', 'test@example.com')).rejects.toThrow('Supabase error');
        });

        it('should throw an error if Prisma create fails', async () => {
            // Mock bcrypt to hash password
            bcryptHashMock.mockImplementation(() => Promise.resolve('hashedpassword'));

            // Mock Supabase signUp to succeed
            supabaseSignUpMock.mockResolvedValue({
                data: { user: { id: 'supabase_user_id' } as any, session: null },
                error: null,
            });

            // Ensure prisma.user.create is typed as a jest.fn()
            (prisma.user.create as jest.Mock).mockRejectedValue(new Error('Prisma error'));

            await expect(registerUser('testuser', 'password', 'test@example.com')).rejects.toThrow('Prisma error');
        });
    });

    describe('getUserAccountsAndTransactions', () => {
        it('should return user accounts and transactions', async () => {
            // Mock Prisma findMany to return mock data
            (prisma.paymentAccount.findMany as jest.Mock).mockResolvedValue([{ id: 'account1', updated_at: new Date() }]);
            (prisma.paymentHistory.findMany as jest.Mock).mockResolvedValue([{ id: 'history1', updated_at: new Date() }]);

            const result = await getUserAccountsAndTransactions();

            expect(prisma.paymentAccount.findMany).toHaveBeenCalledWith({
                include: {
                    PaymentHistory: {
                        include: {
                            Transaction: true,
                        },
                    },
                },
            });
            expect(prisma.paymentHistory.findMany).toHaveBeenCalledWith({
                include: {
                    Transaction: true,
                },
            });
            expect(result).toEqual({
                accounts: [{ id: 'account1', updated_at: expect.any(Date) }],
                transactions: [{ id: 'history1', updated_at: expect.any(Date) }],
            });
        });

        it('should throw an error if Prisma findMany fails', async () => {
            // Mock Prisma findMany to throw an error
            (prisma.paymentAccount.findMany as jest.Mock).mockRejectedValue(new Error('Prisma error'));
            (prisma.paymentHistory.findMany as jest.Mock).mockRejectedValue(new Error('Prisma error'));

            await expect(getUserAccountsAndTransactions()).rejects.toThrow('Prisma error');
        });
    });
});
