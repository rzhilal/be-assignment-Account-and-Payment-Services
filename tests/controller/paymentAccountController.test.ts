import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import { createPaymentAccountController, getPaymentAccountsController } from '../../src/controller/paymentAccountController';
import { createPaymentAccount, getPaymentAccountsByUserId } from '../../src/service/paymentAccountService';

// Mock dependencies
jest.mock('../../src/service/paymentAccountService');

describe('PaymentAccountController', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = fastify();
        app.post('/createPaymentAccount', createPaymentAccountController);
        app.get('/getPaymentAccounts', getPaymentAccountsController);
    });

    afterAll(() => {
        app.close();
    });

    describe('createPaymentAccountController', () => {
        it('should create a payment account and return the account data', async () => {
            const mockAccount = {
                user_id: 'user_id',
                account_type: 'checking',
                account_number: '123456',
                balance: 1000
            };
            (createPaymentAccount as jest.Mock).mockResolvedValue(mockAccount);

            const response = await app.inject({
                method: 'POST',
                url: '/createPaymentAccount',
                payload: {
                    user_id: 'user_id',
                    account_type: 'checking',
                    account_number: '123456',
                    balance: 1000
                }
            });

            expect(response.statusCode).toBe(201);
            expect(response.json()).toEqual(mockAccount);
        });

        it('should return 400 if there is an error', async () => {
            (createPaymentAccount as jest.Mock).mockRejectedValue(new Error('Creation error'));

            const response = await app.inject({
                method: 'POST',
                url: '/createPaymentAccount',
                payload: {
                    user_id: 'user_id',
                    account_type: 'checking',
                    account_number: '123456',
                    balance: 1000
                }
            });

            expect(response.statusCode).toBe(400);
            expect(response.json()).toEqual({ message: 'Creation error' });
        });
    });

    describe('getPaymentAccountsController', () => {
        it('should return payment accounts for a user', async () => {
            const mockAccounts = [
                { user_id: 'user_id', account_type: 'checking', account_number: '123456', balance: 1000 },
                { user_id: 'user_id', account_type: 'savings', account_number: '654321', balance: 2000 }
            ];
            (getPaymentAccountsByUserId as jest.Mock).mockResolvedValue(mockAccounts);

            const response = await app.inject({
                method: 'GET',
                url: '/getPaymentAccounts',
                query: {
                    user_id: 'user_id'
                }
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toEqual(mockAccounts);
        });

        it('should return 500 if there is an error', async () => {
            (getPaymentAccountsByUserId as jest.Mock).mockRejectedValue(new Error('Retrieval error'));

            const response = await app.inject({
                method: 'GET',
                url: '/getPaymentAccounts',
                query: {
                    user_id: 'user_id'
                }
            });

            expect(response.statusCode).toBe(500);
            expect(response.json()).toEqual({ message: 'Internal server error' });
        });
    });
});
