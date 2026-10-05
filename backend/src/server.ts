import { createApp } from './app';
import { env } from './config/env';
import { pool } from './shared/infrastructure/db';
import { runMigrations } from './shared/infrastructure/runMigrations';

const app = createApp();

let server: ReturnType<typeof app.listen> | undefined;

async function start(): Promise<void> {
  await runMigrations(pool);
  server = app.listen(env.PORT, () => {
    console.log(`Moving Circle Therapy API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

start().catch((error) => {
  console.error('Failed to start the server:', error);
  process.exit(1);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down.`);
  if (!server) {
    await pool.end();
    process.exit(0);
    return;
  }
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
