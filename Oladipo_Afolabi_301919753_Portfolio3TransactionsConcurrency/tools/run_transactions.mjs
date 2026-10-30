import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';
import pg from 'pg';
import { checkCommit, checkRollback } from './check_commit_rollback.mjs';
import { checkIsolation } from './check_isolation.mjs';
import { checkConcurrency } from './check_concurrency.mjs';

const activityFolder = new URL('../', import.meta.url);
const evidenceFolder = new URL('evidence/', activityFolder);
const messages = [];
const serverMessages = [];
const clients = [];
let server;
let serverStarted = false;
let temporaryFolder;

function log(message) {
  console.log(message);
  messages.push(message);
}

async function saveJson(filename, value) {
  await writeFile(new URL(filename, evidenceFolder), JSON.stringify(value, null, 2) + '\n');
}

async function readPackageVersion(name) {
  const text = await readFile(new URL(`node_modules/${name}/package.json`, import.meta.url), 'utf8');
  return JSON.parse(text).version;
}

try {
  await mkdir(evidenceFolder, { recursive: true });
  const runDate = new Date().toISOString();
  log('AfolabiPay — Portfolio 3 transaction and concurrency checks');
  log(`Run date: ${runDate}`);
  const port = Number(process.env.P3_PORT || 55329);
  assert.ok(Number.isInteger(port) && port >= 1024 && port <= 65535, 'P3_PORT must be a port from 1024 to 65535.');
  temporaryFolder = await mkdtemp(join(tmpdir(), 'afolabipay-p3-'));
  const password = randomBytes(24).toString('hex');

  // This package starts a native PostgreSQL process, not the PGlite engine.
  // It only listens on this machine, and its database files are disposable.
  server = new EmbeddedPostgres({
    databaseDir: join(temporaryFolder, 'database'),
    user: 'afolabipay_demo',
    password,
    port,
    authMethod: 'scram-sha-256',
    persistent: false,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    postgresFlags: ['-c', 'listen_addresses=127.0.0.1', '-c', 'unix_socket_directories='],
    onLog: (message) => serverMessages.push(String(message)),
    onError: (error) => serverMessages.push(String(error)),
  });
  await server.initialise();
  await server.start();
  serverStarted = true;
  log(`Started a temporary PostgreSQL server on 127.0.0.1:${port}.`);

  // Each Client is a separate server connection and has its own transaction.
  async function connectSession(name) {
    const client = new pg.Client({
      host: '127.0.0.1', port, user: 'afolabipay_demo', password,
      database: 'postgres', application_name: name, connectionTimeoutMillis: 5000,
    });
    await client.connect();
    clients.push(client);
    await client.query("SET TIME ZONE 'UTC'");
    await client.query("SET statement_timeout = '15s'");
    await client.query("SET lock_timeout = '10s'");
    return client;
  }

  const sessionA = await connectSession('afolabipay-session-a');
  const sessionB = await connectSession('afolabipay-session-b');
  const observer = await connectSession('afolabipay-observer');
  const pidA = await sessionA.query('SELECT pg_backend_pid() AS pid');
  const pidB = await sessionB.query('SELECT pg_backend_pid() AS pid');
  const pidObserver = await observer.query('SELECT pg_backend_pid() AS pid');
  const sessionIds = { session_a: pidA.rows[0].pid, session_b: pidB.rows[0].pid, observer: pidObserver.rows[0].pid };
  assert.equal(new Set(Object.values(sessionIds)).size, 3);
  const versionResult = await sessionA.query('SELECT version() AS version');
  const engine = versionResult.rows[0].version;
  const versions = {
    embedded_postgres: await readPackageVersion('embedded-postgres'),
    pg: await readPackageVersion('pg'),
  };
  log(engine);
  log(`Node.js ${process.version}; ${process.platform}/${process.arch}; embedded-postgres ${versions.embedded_postgres}; pg ${versions.pg}.`);
  log(`Separate server sessions: A=${sessionIds.session_a}, B=${sessionIds.session_b}, observer=${sessionIds.observer}.`);

  const schemaSql = await readFile(new URL('../../Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/schema.sql', import.meta.url), 'utf8');
  const sampleSql = await readFile(new URL('sample_data.sql', activityFolder), 'utf8');
  await sessionA.query(schemaSql);
  await sessionA.query(sampleSql);
  log('Loaded the Portfolio 1 schema and Portfolio 3 mock accounts. Reset funds between experiments.');

  await saveJson('01_commit.json', await checkCommit(sessionA, log));
  await saveJson('02_rollback.json', await checkRollback(sessionA, sessionB, log));
  await saveJson('03_isolation.json', await checkIsolation(sessionA, sessionB, log));
  await saveJson('04_concurrency.json', await checkConcurrency(sessionA, sessionB, observer, sessionIds, log));
  await saveJson('environment.json', {
    run_date: runDate,
    engine,
    node_version: process.version,
    host: `${process.platform}/${process.arch}`,
    versions,
    session_ids: sessionIds,
    isolation_level: 'read committed',
    server: 'Disposable native PostgreSQL on loopback; three independent pg.Client connections.',
    scenarios: ['commit', 'rollback after a database error', 'read committed visibility', 'two competing withdrawals with account locks'],
    all_checks_passed: true,
  });
  log('ALL PORTFOLIO 3 CHECKS PASSED. Closing the connections and removing the temporary database.');
} catch (error) {
  log(`PORTFOLIO 3 CHECK FAILED: ${error?.message || 'PostgreSQL did not start; see server_log.txt.'}`);
  process.exitCode = 1;
} finally {
  // Close A first so it releases any lock that B might still be waiting for.
  for (const client of clients) {
    try {
      await client.query('ROLLBACK');
      await client.end();
    } catch (error) {
      console.error(`Could not close a session cleanly: ${error.message}`);
      process.exitCode = 1;
    }
  }
  if (serverStarted) await server.stop();
  if (temporaryFolder) await rm(temporaryFolder, { recursive: true, force: true });
  await writeFile(new URL('transaction_validation.txt', evidenceFolder), messages.join('\n') + '\n');
  await writeFile(new URL('server_log.txt', evidenceFolder), serverMessages.join('\n') + '\n');
}

// Cleanup is finished. Preserve a failing exit code despite the server library's exit hook.
if (process.exitCode) process.exit(process.exitCode);
