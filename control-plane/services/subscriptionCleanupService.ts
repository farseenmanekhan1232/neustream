// Note: These services are not yet converted to TypeScript
// Will use require() for now and can be updated later
import subscriptionService from './subscriptionService.js';
import chatConnectorService from './chatConnectorService.js';

/**
 * Subscription Cleanup Service
 * Periodically cleans up expired subscriptions and disconnects chat connectors
 */
class SubscriptionCleanupService {
  private isRunning: boolean;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.isRunning = false;
    this.cleanupInterval = null;
  }

  /**
   * Start the subscription cleanup service
   */
  start(): void {
    if (this.isRunning) {
      console.log('Subscription cleanup service is already running');
      return;
    }

    console.log('Starting subscription cleanup service...');
    this.isRunning = true;

    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSubscriptions();
    }, 60 * 60 * 1000); // 1 hour

    // Run immediately on startup
    this.cleanupExpiredSubscriptions();
  }

  /**
   * Stop the subscription cleanup service
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('Subscription cleanup service stopped');
  }

  /**
   * Clean up expired subscriptions and disconnect chat connectors
   */
  async cleanupExpiredSubscriptions(): Promise<void> {
    try {
      console.log('Starting expired subscription cleanup...');

      const expiredUserIds = await (subscriptionService as any).getUsersWithExpiredSubscriptions();

      if (expiredUserIds.length === 0) {
        console.log('No expired subscriptions found');
        return;
      }

      console.log(`Found ${expiredUserIds.length} users with expired subscriptions`);

      let totalDisconnected = 0;
      for (const userId of expiredUserIds) {
        try {
          const disconnectedCount = await (chatConnectorService as any).disconnectExpiredSubscriptionConnectors(userId);
          totalDisconnected += disconnectedCount;
          console.log(`Disconnected ${disconnectedCount} chat connectors for user ${userId}`);
        } catch (error) {
          console.error(`Failed to disconnect chat connectors for user ${userId}:`, error);
        }
      }

      console.log(`Subscription cleanup completed. Disconnected ${totalDisconnected} chat connectors across ${expiredUserIds.length} users`);
    } catch (error) {
      console.error('Error during subscription cleanup:', error);
    }
  }

  /**
   * Manually trigger cleanup (for testing or admin purposes)
   */
  async manualCleanup(): Promise<void> {
    console.log('Manual subscription cleanup triggered');
    await this.cleanupExpiredSubscriptions();
  }
}

export default new SubscriptionCleanupService();
