export function processTransaction(transaction: {
    amount: number;
    currency: string;
    to_address?: string;
    status?: string;
  }) {
    return new Promise((resolve, reject) => {
      console.log('Transaction processing started for:', transaction);
  
      // Simulate long running process
      setTimeout(() => {
        // After 30 seconds, we assume the transaction is processed successfully
        console.log('Transaction processed for:', transaction);
        resolve(transaction);
      }, 1000); // make the time lower due to exception api for 5000ms
    });
  }
  