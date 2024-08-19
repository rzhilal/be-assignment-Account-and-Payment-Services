import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js'; // Import Decimal dari decimal.js
import { processTransaction } from '../middleware/processTransaction'; // Pastikan path-nya benar

const prisma = new PrismaClient();

export const sendTransaction = async (user_id: string, account_id: string, amount: number, to_address: string) => {
    const amountDecimal = new Decimal(amount);

    const senderAccount = await prisma.paymentAccount.findUnique({
      where: { account_id },
    });
  
    if (!senderAccount) {
      throw new Error('Sender account not found');
    }
  
    const senderBalance = new Decimal(senderAccount.balance);
    if (senderBalance.lessThan(amountDecimal)) {
      throw new Error('Insufficient balance');
    }
  
    // receiver's account based on to_address
    const receiverAccount = await prisma.paymentAccount.findUnique({
      where: { account_number: to_address },
    });
  
    if (!receiverAccount) {
      throw new Error('Receiver account not found');
    }
  
    // Start transaction
    const transaction = await prisma.$transaction(async (prisma) => {
      // Deduct balance from sender
      await prisma.paymentAccount.update({
        where: { account_id },
        data: {
          balance: senderBalance.minus(amountDecimal).toString(),
        },
      });
  
      // Add balance to receiver
      await prisma.paymentAccount.update({
        where: { account_id: receiverAccount.account_id },
        data: {
          balance: new Decimal(receiverAccount.balance).plus(amountDecimal).toString(),
        },
      });
  
      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          amount: amountDecimal.toString(), // Convert Decimal to string for Prisma
          currency: 'USD', // Default currency
          to_address,
          status: 'pending',
        },
      });
  
      // Create payment history record for the sender
      await prisma.paymentHistory.create({
        data: {
          user_id,
          account_id,
          transaction_id: transaction.transaction_id,
          amount: amountDecimal.toString(),
          timestamp: new Date(),
          transaction_type: 'send',
          status: 'pending',
        },
      });
  
      // Process the transaction (mocked)
      await processTransaction({
        amount: amountDecimal.toNumber(),
        currency: transaction.currency,
        to_address: transaction.to_address || undefined,
        status: transaction.status,
      });
  
      // Update transaction and payment history statuses to 'completed'
      await prisma.transaction.update({
        where: { transaction_id: transaction.transaction_id },
        data: { status: 'completed' },
      });
  
      await prisma.paymentHistory.updateMany({
        where: { transaction_id: transaction.transaction_id },
        data: { status: 'completed' },
      });
  
      return transaction;
    });
  
    return transaction;
  };

export const withdrawTransaction = async (user_id: string, account_id: string, amount: number) => {
    const amountDecimal = new Decimal(amount);
  
    const account = await prisma.paymentAccount.findUnique({
      where: { account_id },
    });
  
    if (!account) {
      throw new Error('Account not found');
    }
  
    const accountBalance = new Decimal(account.balance);
  
    if (accountBalance.lessThan(amountDecimal)) {
      throw new Error('Insufficient balance');
    }
  
    const transaction = await prisma.transaction.create({
      data: {
        amount: amountDecimal.negated().toString(), // Convert Decimal to string for Prisma
        currency: 'USD', // Default currency
        to_address: null,
        status: 'pending',
      },
    });
  
    await prisma.paymentHistory.create({
      data: {
        user_id,
        account_id,
        transaction_id: transaction.transaction_id,
        amount: amountDecimal.negated().toString(),
        timestamp: new Date(),
        transaction_type: 'withdraw',
        status: 'pending',
      },
    });
  
    await processTransaction({
      amount: amountDecimal.negated().toNumber(),
      currency: transaction.currency,
      to_address: undefined,
      status: transaction.status,
    });
  
    await prisma.paymentAccount.update({
      where: { account_id },
      data: { balance: account.balance.minus(amountDecimal).toString(), },
    });
  
    await prisma.transaction.update({
      where: { transaction_id: transaction.transaction_id },
      data: { status: 'completed' },
    });
  
    await prisma.paymentHistory.updateMany({
      where: { transaction_id: transaction.transaction_id },
      data: { status: 'completed' },
    });
  
    return transaction;
};
