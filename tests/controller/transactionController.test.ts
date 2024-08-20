import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import { sendTransactionController, withdrawTransactionController } from '../../src/controller/transactionController';
import { sendTransaction, withdrawTransaction } from '../../src/service/transactionService';

// Mock dependencies
jest.mock('../../src/service/transactionService', () => ({
  sendTransaction: jest.fn(),
  withdrawTransaction: jest.fn(),
}));

const buildFastify = (): FastifyInstance => {
  const app = fastify();
  
  app.post('/transaction/send', sendTransactionController);
  app.post('/transaction/withdraw', withdrawTransactionController);

  return app;
};

describe('Transaction Controller', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = buildFastify();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendTransactionController', () => {
    it('should send a transaction successfully', async () => {
      const mockTransaction = { transaction_id: 'transaction1', amount: 100, currency: 'USD', to_address: 'account2', status: 'completed' };

      (sendTransaction as jest.Mock).mockResolvedValue(mockTransaction);

      const response = await app.inject({
        method: 'POST',
        url: '/transaction/send',
        payload: {
          user_id: 'user1',
          account_id: 'account1',
          amount: 100,
          to_address: 'account2',
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(mockTransaction);
      expect(sendTransaction).toHaveBeenCalledWith('user1', 'account1', 100, 'account2');
    });

    it('should handle errors from sendTransaction', async () => {
      (sendTransaction as jest.Mock).mockRejectedValue(new Error('Transaction error'));

      const response = await app.inject({
        method: 'POST',
        url: '/transaction/send',
        payload: {
          user_id: 'user1',
          account_id: 'account1',
          amount: 100,
          to_address: 'account2',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ message: 'Transaction error' });
    });
  });

  describe('withdrawTransactionController', () => {
    it('should withdraw from an account successfully', async () => {
      const mockTransaction = { transaction_id: 'transaction2', amount: -50, currency: 'USD', to_address: null, status: 'completed' };

      (withdrawTransaction as jest.Mock).mockResolvedValue(mockTransaction);

      const response = await app.inject({
        method: 'POST',
        url: '/transaction/withdraw',
        payload: {
          user_id: 'user1',
          account_id: 'account1',
          amount: 50,
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(mockTransaction);
      expect(withdrawTransaction).toHaveBeenCalledWith('user1', 'account1', 50);
    });

    it('should handle errors from withdrawTransaction', async () => {
      (withdrawTransaction as jest.Mock).mockRejectedValue(new Error('Withdrawal error'));

      const response = await app.inject({
        method: 'POST',
        url: '/transaction/withdraw',
        payload: {
          user_id: 'user1',
          account_id: 'account1',
          amount: 50,
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ message: 'Withdrawal error' });
    });
  });
});
