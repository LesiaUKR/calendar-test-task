import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const binName = process.platform === 'win32' ? 'husky.cmd' : 'husky';
const huskyBin = join('node_modules', '.bin', binName);

// CI/prod installs may skip devDependencies, so husky can be absent.
if (!existsSync(huskyBin)) {
  process.exit(0);
}

const result = spawnSync(huskyBin, { stdio: 'inherit' });
process.exit(result.status ?? 0);
