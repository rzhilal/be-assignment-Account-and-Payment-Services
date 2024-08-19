import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a payment account
export const createPaymentAccount = async (userId: string, accountType: string, accountNumber: string, balance: number = 0) => {
    return await prisma.paymentAccount.create({
        data: {
            user_id: userId,
            account_type: accountType,
            account_number: accountNumber,
            balance
        },
    });
};

// Retrieve all payment accounts for a user
export const getPaymentAccountsByUserId = async (userId: string) => {
    return await prisma.paymentAccount.findMany({
        where: { user_id: userId },
    });
};
