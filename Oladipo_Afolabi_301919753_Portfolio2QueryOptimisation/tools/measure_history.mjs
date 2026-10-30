import { writeFile } from 'node:fs/promises';

// Run the same history query five times and save the plan from each run.
export async function measureHistoryQuery(database, historySql, evidenceFolder, phase) {
  // Give PostgreSQL one extra run before we start recording times.
  await database.query(historySql);

  const measurements = [];
  const plans = [];

  for (let run = 1; run <= 5; run++) {
    const result = await database.query(`EXPLAIN (ANALYZE, BUFFERS) ${historySql}`);
    const planLines = result.rows.map((row) => row['QUERY PLAN']);
    const planText = planLines.join('\n');

    // The last lines of the plan contain these two times, in milliseconds.
    const executionMatch = planText.match(/Execution Time: ([\d.]+) ms/);
    const planningMatch = planText.match(/Planning Time: ([\d.]+) ms/);

    if (!executionMatch || !planningMatch) {
      throw new Error('The query plan did not include its execution and planning times');
    }

    measurements.push({
      run,
      execution_ms: Number(executionMatch[1]),
      planning_ms: Number(planningMatch[1]),
    });
    plans.push(`Run ${run}\n${planText}`);
  }

  const planFile = new URL(`query_02_plan_${phase}.txt`, evidenceFolder);
  await writeFile(planFile, plans.join('\n\n') + '\n');

  return { measurements, plans };
}

export function summariseTimings(measurements) {
  const times = measurements.map((measurement) => measurement.execution_ms);
  times.sort((first, second) => first - second);

  // There are five runs: the first is the minimum, the third is the median,
  // and the fifth is the maximum after sorting.
  return {
    minimum_ms: times[0],
    median_ms: times[2],
    maximum_ms: times[4],
  };
}
