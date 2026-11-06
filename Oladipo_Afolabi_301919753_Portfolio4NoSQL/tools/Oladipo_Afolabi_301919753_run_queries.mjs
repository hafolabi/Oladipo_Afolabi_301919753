import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { BSON, Long, MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { loadSampleData } from "./Oladipo_Afolabi_301919753_sample_data.mjs";
import {
  findCustomer,
  findAccountHistory,
  findCompletedTransfers,
} from "./Oladipo_Afolabi_301919753_queries.mjs";

const evidenceFolder = new URL("../evidence/", import.meta.url);
const messages = [];
let server;
let client;

function log(message) {
  console.log(message);
  messages.push(message);
}

async function saveResult(filename, documents) {
  // Extended JSON keeps the BSON integer and date types in the saved evidence.
  const text = BSON.EJSON.stringify(documents, null, 2, { relaxed: false });
  await writeFile(new URL(filename, evidenceFolder), text + "\n");
}

async function packageVersion(name) {
  const text = await readFile(
    new URL(`node_modules/${name}/package.json`, import.meta.url),
    "utf8",
  );
  return JSON.parse(text).version;
}

try {
  await mkdir(evidenceFolder, { recursive: true });
  const runDate = new Date().toISOString();
  log("AfolabiPay — Portfolio 4 MongoDB document example");
  log(`Run date: ${runDate}`);

  // Start a real local mongod process with a fresh temporary database.
  // Cache its download inside node_modules so it stays out of the repository.
  server = await MongoMemoryServer.create({
    binary: {
      version: "8.0.16",
      downloadDir: fileURLToPath(
        new URL("node_modules/.cache/mongodb-binaries/", import.meta.url),
      ),
    },
    instance: { ip: "127.0.0.1", launchTimeout: 30000 },
  });
  client = new MongoClient(server.getUri(), {
    promoteLongs: false,
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  const database = client.db("afolabipay_portfolio4");
  const buildInfo = await database.command({ buildInfo: 1 });
  const driverVersion = await packageVersion("mongodb");
  const serverHelperVersion = await packageVersion(
    "mongodb-memory-server-core",
  );
  log(
    `MongoDB ${buildInfo.version}; driver ${driverVersion}; server helper ${serverHelperVersion}.`,
  );
  log(`Node.js ${process.version}; ${process.platform}/${process.arch}.`);

  // insertMany creates each collection when its first documents are added.
  await loadSampleData(database);
  const profileCount = await database
    .collection("customer_profiles")
    .countDocuments();
  const eventCount = await database
    .collection("transaction_events")
    .countDocuments();
  assert.equal(profileCount, 2);
  assert.equal(eventCount, 3);
  log(
    "PASS: inserted two customer profiles and three payment events into two collections.",
  );

  const profile = await findCustomer(database, "ada@example.test");
  assert.equal(profile._id, 1);
  assert.equal(profile.name.first, "Ada");
  await saveResult("Oladipo_Afolabi_301919753_query_01_profile.json", profile);
  log(
    "PASS: profile lookup returned Ada Okafor with embedded name and contact details.",
  );

  const history = await findAccountHistory(database, "1000000001");
  const historyReferences = history.map(
    (payment) => payment.transaction_reference,
  );
  assert.deepEqual(historyReferences, ["DEP-001", "TRF-001"]);
  await saveResult("Oladipo_Afolabi_301919753_query_02_history.json", history);
  log(
    "PASS: Ada account 1000000001 returned DEP-001 and TRF-001 in posting-time order.",
  );

  const transfers = await findCompletedTransfers(database);
  assert.deepEqual(
    transfers.map((payment) => payment.transaction_reference),
    ["TRF-001"],
  );
  const transferAmounts = transfers[0].entries.map((entry) =>
    entry.amount_minor.toString(),
  );
  assert.deepEqual(transferAmounts, ["-200000", "200000"]);
  await saveResult("Oladipo_Afolabi_301919753_query_03_transfers.json", transfers);
  log(
    "PASS: completed-transfer lookup returned TRF-001, moving 200000 kobo (NGN 2,000).",
  );

  const events = await database
    .collection("transaction_events")
    .find()
    .toArray();
  for (const event of events) {
    assert.equal(event.entries.length, 2);
    let total = 0n;
    for (const entry of event.entries) {
      assert.ok(Long.isLong(entry.amount_minor));
      total += entry.amount_minor.toBigInt();
    }
    assert.equal(total, 0n);
  }
  log(
    "PASS: each sample event has two balanced entries stored as BSON Long whole kobo.",
  );

  const environment = {
    run_date: runDate,
    mongodb_version: buildInfo.version,
    driver_version: driverVersion,
    server_helper_version: serverHelperVersion,
    node_version: process.version,
    host: `${process.platform}/${process.arch}`,
    database: "afolabipay_portfolio4",
    collections: {
      customer_profiles: profileCount,
      transaction_events: eventCount,
    },
    query_results: {
      profile_id: profile._id,
      history: historyReferences,
      transfers: ["TRF-001"],
    },
    money_type: "BSON Long: exact signed 64-bit whole kobo",
    all_checks_passed: true,
  };
  await writeFile(
    new URL("Oladipo_Afolabi_301919753_environment.json", evidenceFolder),
    JSON.stringify(environment, null, 2) + "\n",
  );
  log("ALL PORTFOLIO 4 CHECKS PASSED.");
} catch (error) {
  log(`PORTFOLIO 4 CHECK FAILED: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (client) await client.close();
  if (server) {
    await server.stop();
    log("Stopped MongoDB and removed its temporary data.");
  }
  await writeFile(
    new URL("Oladipo_Afolabi_301919753_validation.txt", evidenceFolder),
    messages.join("\n") + "\n",
  );
}
