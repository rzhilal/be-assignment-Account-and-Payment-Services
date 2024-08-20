import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { sendTransaction, withdrawTransaction } from '../../src/service/transactionService';
import { processTransaction } from '../../src/middleware/processTransaction';

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    paymentAccount: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      update: jest.fn(),
    },
    paymentHistory: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('../../src/middleware/processTransaction', () => ({
  processTransaction: jest.fn(),
}));

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Transaction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendTransaction', () => {
    it('should successfully send a transaction', async () => {
      const senderAccount = {
        account_id: 'account1',
        balance: '200',
      };
      const receiverAccount = {
        account_id: 'account2',
        balance: '100',
      };
      const mockTransaction = {
        transaction_id: 'transaction1',
        amount: '100',
        currency: 'USD',
        to_address: 'account2',
        status: 'pending',
      };

      (prisma.paymentAccount.findUnique as jest.Mock).mockResolvedValueOnce(senderAccount);
      (prisma.paymentAccount.findUnique as jest.Mock).mockResolvedValueOnce(receiverAccount);
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => await callback(prisma));
      (prisma.transaction.create as jest.Mock).mockResolvedValue(mockTransaction);
      (prisma.paymentHistory.create as jest.Mock).mockResolvedValue({});
      (processTransaction as jest.Mock).mockResolvedValue({});

      const result = await sendTransaction('user1', 'account1', 100, 'account2');

      expect(result).toEqual(mockTransaction);
      expect(prisma.paymentAccount.findUnique).toHaveBeenCalledWith({ where: { account_id: 'account1' } });
      expect(prisma.paymentAccount.findUnique).toHaveBeenCalledWith({ where: { account_number: 'account2' } });
      expect(prisma.paymentAccount.update).toHaveBeenCalledWith({
        where: { account_id: 'account1' },
        data: {
          balance: new Decimal(senderAccount.balance).minus(100).toString(),
        },
      });
      expect(prisma.paymentAccount.update).toHaveBeenCalledWith({
        where: { account_id: 'account2' },
        data: {
          balance: new Decimal(receiverAccount.balance).plus(100).toString(),
        },
      });
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: '100',
          currency: 'USD',
          to_address: 'account2',
          status: 'pending',
        },
      });
      expect(processTransaction).toHaveBeenCalledWith({
        amount: 100,
        currency: 'USD',
        to_address: 'account2',
        status: 'pending',
      });
    });

    it('should throw an error if sender account is not found', async () => {
      (prisma.paymentAccount.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(sendTransaction('user1', 'account1', 100, 'account2')).rejects.toThrow('Sender account not found');
    });

    it('should throw an error if receiver account is not found', async () => {
      const senderAccount = {
        account_id: 'account1',
        balance: '200',
      };

      (prisma.paymentAccount.findUnique as jest.Mock)
        .mockResolvedValueOnce(senderAccount)
        .mockResolvedValueOnce(null);

      await expect(sendTransaction('user1', 'account1', 100, 'account2')).rejects.toThrow('Receiver account not found');
    });

    it('should throw an error if sender balance is insufficient', async () => {
      const senderAccount = {
        account_id: 'account1',
        balance: '50',
      };
      const receiverAccount = {
        account_id: 'account2',
        balance: '100',
      };

      (prisma.paymentAccount.findUnique as jest.Mock)
        .mockResolvedValueOnce(senderAccount)
        .mockResolvedValueOnce(receiverAccount);

      await expect(sendTransaction('user1', 'account1', 100, 'account2')).rejects.toThrow('Insufficient balance');
    });
  });

  describe('withdrawTransaction', () => {
    it('should successfully withdraw from an account', async () => {
      const initialBalance = '200';
      const withdrawAmount = 50;
      
      const account = {
        account_id: 'account1',
        balance: initialBalance,
      };
      const mockTransaction = {
        transaction_id: 'transaction2',
        amount: `-${withdrawAmount}`,
        currency: 'USD',
        to_address: null,
        status: 'completed',
      };
  
      (prisma.paymentAccount.findUnique as jest.Mock).mockResolvedValue(account);
      (prisma.transaction.create as jest.Mock).mockResolvedValue(mockTransaction);
      (prisma.paymentHistory.create as jest.Mock).mockResolvedValue({});
      (processTransaction as jest.Mock).mockResolvedValue({});
      (prisma.paymentAccount.update as jest.Mock).mockResolvedValue({});
  
      const result = await withdrawTransaction('user1', 'account1', withdrawAmount);

      
      expect(prisma.paymentAccount.findUnique).toHaveBeenCalledWith({ where: { account_id: 'account1' } });
      expect(result).toEqual(mockTransaction);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: mockTransaction.amount,
          currency: 'USD',
          to_address: null,
          status: 'pending',
        },
      });
      // test after doing process transaction
      expect(processTransaction).toHaveBeenCalledWith({
        amount: -withdrawAmount,
        currency: 'USD',
        to_address: undefined,
        status: 'completed',
      });
    });
  
    it('should throw an error if account is not found', async () => {
      (prisma.paymentAccount.findUnique as jest.Mock).mockResolvedValue(null);
  
      await expect(withdrawTransaction('user1', 'account1', 50)).rejects.toThrow('Account not found');
    });
  
    it('should throw an error if balance is insufficient', async () => {
      const account = {
        account_id: 'account1',
        balance: '30',
      };
  
      (prisma.paymentAccount.findUnique as jest.Mock).mockResolvedValue(account);
  
      await expect(withdrawTransaction('user1', 'account1', 50)).rejects.toThrow('Insufficient balance');
    });
  });
});