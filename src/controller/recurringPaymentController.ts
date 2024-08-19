import { FastifyReply, FastifyRequest } from 'fastify';
import { createRecurringPayment } from '../service/recurringPaymenService';

export async function addRecurringPaymentController(request: FastifyRequest, reply: FastifyReply) {
  const { user_id, account_id, amount, currency, interval } = request.body as {
    user_id: string;
    account_id: string;
    amount: number;
    currency: string;
    interval: string;
  };

  try {
    const recurringPayment = await createRecurringPayment(user_id, account_id, amount, currency, interval);
    return reply.status(201).send(recurringPayment);
  } catch (error) {
    return reply.status(400).send({ message: (error as Error).message });
  }
}
