import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { getCronExpression } from '../utils/cronUtils';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

const createRecurringPayment = async (user_id: string, account_id: string, amount: number, currency: string, interval: string) => {
  // Validasi interval dan nilai lainnya sebelum menyimpan
  const validIntervals = ['daily', 'weekly', 'monthly', 'hourly', 'minute'];
  if (!validIntervals.includes(interval.toLowerCase())) {
    throw new Error('Invalid interval');
  }

  const recurringPayment = await prisma.recurringPayment.create({
    data: {
      user_id,
      account_id,
      amount,
      currency,
      interval,
      status: 'active',
      next_execution: getNextExecutionDate(interval),
    },
  });

  // Jadwalkan tugas cron untuk pembayaran berulang
  const cronExpression = getCronExpression(interval);
  cron.schedule(cronExpression, async () => {
    await processRecurringPayment(recurringPayment);
  });

  return recurringPayment;
};

// Fungsi untuk memproses pembayaran berulang individu
async function processRecurringPayment(payment: any) {
  try {
    const account = await prisma.paymentAccount.findUnique({
      where: { account_id: payment.account_id },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const balance = new Decimal(account.balance);
    if (balance.lessThan(payment.amount)) {
      throw new Error('Insufficient balance for recurring payment');
    }

    await prisma.paymentAccount.update({
      where: { account_id: payment.account_id },
      data: { balance: balance.minus(payment.amount).toString() },
    });

    const transaction = await prisma.transaction.create({
      data: {
        amount: payment.amount.toString(),
        currency: payment.currency,
        to_address: null,
        status: 'completed',
      },
    });

    await prisma.paymentHistory.create({
      data: {
        user_id: payment.user_id,
        account_id: payment.account_id,
        transaction_id: transaction.transaction_id,
        amount: payment.amount.toString(),
        timestamp: new Date(),
        transaction_type: 'recurring',
        status: 'completed',
      },
    });

    const nextExecutionDate = getNextExecutionDate(payment.interval);
    await prisma.recurringPayment.update({
      where: { recurring_payment_id: payment.recurring_payment_id },
      data: { next_execution: nextExecutionDate },
    });
  } catch (error) {
    console.error('Error processing recurring payment:', error);
  }
}

// Fungsi untuk menghitung tanggal eksekusi berikutnya berdasarkan interval
function getNextExecutionDate(interval: string): Date {
  const now = new Date();
  const nextExecution = new Date(now);

  switch (interval.toLowerCase()) {
    case 'daily':
      nextExecution.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      nextExecution.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      nextExecution.setMonth(now.getMonth() + 1);
      break;
    case 'hourly':
      nextExecution.setHours(now.getHours() + 1);
      break;
    case 'minute':
      nextExecution.setMinutes(now.getMinutes() + 1);
      break;
  }

  return nextExecution;
}


// Export the function to be used elsewhere
export { createRecurringPayment };
