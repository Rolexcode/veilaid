import { cpSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const mode = process.argv[2] ?? 'preprod';
rmSync('dist', { recursive: true, force: true });

for (const [bin, args] of [
  ['../node_modules/typescript/bin/tsc', []],
  ['../node_modules/vite/bin/vite.js', ['build', '--mode', mode]],
]) {
  const result = spawnSync(process.execPath, [bin, ...args], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const folder of ['keys', 'zkir']) {
  const source = `../contract/src/managed/bboard/${folder}`;
  if (existsSync(source)) cpSync(source, `dist/${folder}`, { recursive: true });
}
