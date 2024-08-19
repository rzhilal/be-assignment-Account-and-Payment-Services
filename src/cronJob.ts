import cron from 'node-cron';

const CRON_SCHEDULE = '0 0 * * *'; // every day at midnight

cron.schedule(CRON_SCHEDULE, async () => {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:3000/process-recurring', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to process recurring payments: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Recurring payments processed:', data);
  } catch (error) {
    console.error('Error processing recurring payments:', error);
  }
});
