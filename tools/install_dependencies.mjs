import { spawnSync } from 'node:child_process';

const folders = [
  'Oladipo_Afolabi_301919753_Portfolio1DatabaseDesign/tools/',
  'Oladipo_Afolabi_301919753_Portfolio2QueryOptimisation/tools/',
  'Oladipo_Afolabi_301919753_Portfolio3TransactionsConcurrency/tools/',
  'Oladipo_Afolabi_301919753_Portfolio4NoSQL/tools/',
];

// Each activity keeps its own dependencies and saved package versions.
for (const folder of folders) {
  console.log(`\nInstalling dependencies in ${folder}`);
  const result = spawnSync('npm', ['ci'], {
    cwd: new URL(`../${folder}`, import.meta.url),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error || result.status !== 0) {
    console.error(result.error?.message || 'Installation failed. Check the npm message above.');
    process.exit(1);
  }
}

console.log('\nDependencies are ready. Run npm start from the project root.');
