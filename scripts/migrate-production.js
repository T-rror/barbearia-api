const { execFileSync } = require('node:child_process');

if (process.env.VERCEL_ENV !== 'production') {
  process.exit(0);
}

const prismaCli = process.platform === 'win32'
  ? 'node_modules/.bin/prisma.cmd'
  : 'node_modules/.bin/prisma';

execFileSync(prismaCli, ['migrate', 'deploy'], { stdio: 'inherit' });
