import { PrismaClient } from '@prisma/client';
import { createPaymentAccount, getPaymentAccountsByUserId } from '../../src/service/paymentAccountService';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        paymentAccount: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('PaymentAccountService', () => {
    const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createPaymentAccount', () => {
        it('should create a payment account and return the account data', async () => {
            const mockAccount = {
                user_id: 'user_id',
                account_type: 'checking',
                account_number: '123456',
                balance: 1000
            };
            (prisma.paymentAccount.create as jest.Mock).mockResolvedValue(mockAccount);

            const result = await createPaymentAccount('user_id', 'checking', '123456', 1000);

            expect(prisma.paymentAccount.create).toHaveBeenCalledWith({
                data: {
                    user_id: 'user_id',
                    account_type: 'checking',
                    account_number: '123456',
                    balance: 1000,
                },
            });
            expect(result).toEqual(mockAccount);
        });

        it('should throw an error if Prisma create fails', async () => {
            (prisma.paymentAccount.create as jest.Mock).mockRejectedValue(new Error('Prisma error'));

            await expect(createPaymentAccount('user_id', 'checking', '123456', 1000)).rejects.toThrow('Prisma error');
        });
    });

    describe('getPaymentAccountsByUserId', () => {
        it('should return payment accounts for a user', async () => {
            const mockAccounts = [
                { user_id: 'user_id', account_type: 'checking', account_number: '123456', balance: 1000 },
                { user_id: 'user_id', account_type: 'savings', account_number: '654321', balance: 2000 }
            ];
            (prisma.paymentAccount.findMany as jest.Mock).mockResolvedValue(mockAccounts);

            const result = await getPaymentAccountsByUserId('user_id');

            expect(prisma.paymentAccount.findMany).toHaveBeenCalledWith({
                where: { user_id: 'user_id' },
            });
            expect(result).toEqual(mockAccounts);
        });

        it('should throw an error if Prisma findMany fails', async () => {
            (prisma.paymentAccount.findMany as jest.Mock).mockRejectedValue(new Error('Prisma error'));

            await expect(getPaymentAccountsByUserId('user_id')).rejects.toThrow('Prisma error');
        });
    });
});
