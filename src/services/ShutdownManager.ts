/**
 * ShutdownManager
 *
 * Coordinates graceful shutdown of all services.
 * Services register cleanup handlers that are called in reverse order.
 *
 * Usage:
 *   shutdownManager.register('http-server', () => server.close());
 *   shutdownManager.register('slack', () => messaging.disconnect());
 *   // Later when shutting down:
 *   await shutdownManager.shutdown();
 */

export interface CleanupHandler {
  name: string;
  priority: number;  // Higher priority = runs first
  handler: () => Promise<void> | void;
}

export interface ShutdownManagerOptions {
  /** Force exit after this many ms (default: 10000) */
  forceExitTimeout?: number;
  /** Log function */
  log?: (level: string, message: string) => void;
}

export class ShutdownManager {
  private handlers: CleanupHandler[] = [];
  private isShuttingDown = false;
  private forceExitTimeout: number;
  private log: (level: string, message: string) => void;

  constructor(options: ShutdownManagerOptions = {}) {
    this.forceExitTimeout = options.forceExitTimeout ?? 10000;
    this.log = options.log ?? ((level, msg) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        service: 'ShutdownManager',
        message: msg,
      }));
    });
  }

  /**
   * Register a cleanup handler
   * @param name Identifier for logging
   * @param handler Cleanup function (can be async)
   * @param priority Higher priority = runs first (default: 0)
   */
  register(name: string, handler: () => Promise<void> | void, priority = 0): void {
    this.handlers.push({ name, handler, priority });
    this.log('info', `Registered cleanup handler: ${name} (priority: ${priority})`);
  }

  /**
   * Unregister a cleanup handler
   */
  unregister(name: string): void {
    const index = this.handlers.findIndex(h => h.name === name);
    if (index !== -1) {
      this.handlers.splice(index, 1);
      this.log('info', `Unregistered cleanup handler: ${name}`);
    }
  }

  /**
   * Initialize signal handlers
   */
  initialize(): void {
    const signalHandler = () => {
      this.shutdown().catch(err => {
        this.log('error', `Shutdown error: ${err}`);
        process.exit(1);
      });
    };

    process.on('SIGTERM', signalHandler);
    process.on('SIGINT', signalHandler);
    this.log('info', 'Signal handlers registered');
  }

  /**
   * Execute graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      this.log('warn', 'Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    this.log('info', 'Starting graceful shutdown...');

    // Set force exit timer
    const forceExitTimer = setTimeout(() => {
      this.log('error', 'Force exit: cleanup timed out');
      process.exit(1);
    }, this.forceExitTimeout);

    // Sort by priority (descending) - higher priority first
    const sortedHandlers = [...this.handlers].sort((a, b) => b.priority - a.priority);

    // Execute handlers sequentially
    for (const { name, handler } of sortedHandlers) {
      try {
        this.log('info', `Running cleanup: ${name}`);
        await handler();
        this.log('info', `Cleanup complete: ${name}`);
      } catch (err) {
        this.log('error', `Cleanup failed for ${name}: ${err}`);
      }
    }

    clearTimeout(forceExitTimer);
    this.log('info', 'Graceful shutdown complete');
    process.exit(0);
  }

  /**
   * Check if shutdown is in progress
   */
  get shuttingDown(): boolean {
    return this.isShuttingDown;
  }
}
