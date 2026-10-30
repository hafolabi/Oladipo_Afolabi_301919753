import { randomBytes } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';
import pg from 'pg';

export async function openDemoDatabase() {
  const port = Number(process.env.DEMO_PORT || 55330);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error('DEMO_PORT must be a port from 1024 to 65535.');
  }

  const temporaryFolder = await mkdtemp(join(tmpdir(), 'afolabipay-menu-'));
  const password = randomBytes(24).toString('hex');
  let serverStarted = false;
  const server = new EmbeddedPostgres({
    databaseDir: join(temporaryFolder, 'database'),
    user: 'afolabipay_demo',
    password,
    port,
    authMethod: 'scram-sha-256',
    persistent: false,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    postgresFlags: ['-c', 'listen_addresses=127.0.0.1', '-c', 'unix_socket_directories='],
    onLog: () => {},
    onError: (error) => console.error(String(error)),
  });
  const database = new pg.Client({
    host: '127.0.0.1', port, user: 'afolabipay_demo', password,
    database: 'postgres', application_name: 'afolabipay-menu', connectionTimeoutMillis: 5000,
  });

  async function close() {
    try {
      await database.end();
    } finally {
      if (serverStarted) await server.stop();
      await rm(temporaryFolder, { recursive: true, force: true });
    }
  }

  try {
    await server.initialise();
    await server.start();
    serverStarted = true;
    await database.connect();
    await database.query("SET TIME ZONE 'UTC'");
    await database.query("SET statement_timeout = '15s'");
    await database.query("SET lock_timeout = '10s'");

    // Start with the original mock accounts and payments from Portfolio 1.
    const designFolder = new URL('../../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/', import.meta.url);
    const schema = await readFile(new URL('schema.sql', designFolder), 'utf8');
    const sampleData = await readFile(new URL('seed.sql', designFolder), 'utf8');
    await database.query(schema);
    await database.query(sampleData);
    return { database, close };
  } catch (error) {
    await close();
    throw error;
  }
}
