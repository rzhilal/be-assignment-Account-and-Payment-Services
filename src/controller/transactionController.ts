import { FastifyReply, FastifyRequest } from 'fastify';
import { sendTransaction, withdrawTransaction } from '../service/transactionService';

export async function sendTransactionController(request: FastifyRequest, reply: FastifyReply) {
  const { user_id, account_id, amount, to_address } = request.body as { user_id: string; account_id: string; amount: number; to_address: string };

  try {
    const transaction = await sendTransaction(user_id, account_id, amount, to_address);
    return reply.status(201).send(transaction);
  } catch (error) {
    return reply.status(400).send({ message: (error as Error).message });
  }
}

export async function withdrawTransactionController(request: FastifyRequest, reply: FastifyReply) {
    const { user_id, account_id, amount } = request.body as { user_id: string; account_id: string; amount: number };
  
    try {
      const transaction = await withdrawTransaction(user_id, account_id, amount);
      return reply.status(201).send(transaction);
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
}
