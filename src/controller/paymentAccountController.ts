import { FastifyReply, FastifyRequest } from 'fastify';
import { createPaymentAccount, getPaymentAccountsByUserId } from '../service/paymentAccountService';

export async function createPaymentAccountController(request: FastifyRequest, reply: FastifyReply) {
    const { user_id: userId, account_type: accountType, account_number: accountNumber, balance } = request.body as { user_id: string; account_type: string; account_number: string, balance: number };

    try {
        const account = await createPaymentAccount(userId, accountType, accountNumber, balance);
        request.server.log.info(`Payment account created successfully: ${account.account_number}`);
        return reply.status(201).send(account);
    } catch (error) {
        return reply.status(400).send({ message: (error as Error).message });
    }
}

export async function getPaymentAccountsController(request: FastifyRequest, reply: FastifyReply) {
    const { user_id: userId } = request.query as { user_id: string };

    try {
        const accounts = await getPaymentAccountsByUserId(userId);
        request.server.log.info(`Retrieved payment accounts for user: ${userId}`);
        return reply.status(200).send(accounts);
    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}
