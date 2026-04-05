import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const routesManifestPath = '.next/routes-manifest.json';

if (!existsSync(routesManifestPath)) {
  console.log(`Skipping next-sitemap because ${routesManifestPath} was not found.`);
  process.exit(0);
}

const result = spawnSync('next-sitemap', ['--config', 'next-sitemap.config.js'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);