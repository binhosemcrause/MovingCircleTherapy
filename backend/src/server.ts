import { createApp } from './app';
import { env } from './config/env';
import { pool } from './shared/infrastructure/db';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Moving Circle Therapy API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
