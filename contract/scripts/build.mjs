import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

rmSync('dist', { recursive: true, force: true });
const result = spawnSync(process.execPath, ['../node_modules/typescript/bin/tsc', '--project', 'tsconfig.build.json'], {
  stdio: 'inherit',
  shell: false,
});
if (result.status !== 0) process.exit(result.status ?? 1);
mkdirSync('dist', { recursive: true });
cpSync('src/managed', 'dist/managed', { recursive: true });
cpSync('src/bboard.compact', 'dist/bboard.compact');
