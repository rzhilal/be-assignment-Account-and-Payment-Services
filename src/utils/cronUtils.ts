// Fungsi untuk mengonversi interval ke cron expression
export function getCronExpression(interval: string): string {
    switch (interval.toLowerCase()) {
      case 'daily':
        return '0 0 * * *';
      case 'weekly':
        return '0 0 * * 0';
      case 'monthly':
        return '0 0 1 * *';
      case 'hourly':
        return '0 * * * *';
      case 'minute':
        return '* * * * *';
      default:
        console.warn(`Interval "${interval}" tidak dikenali. Menggunakan default "daily".`);
        return '0 0 * * *'; // Default ke harian
    }
  }
  