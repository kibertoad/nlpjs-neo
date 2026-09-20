import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const packagesDir = fileURLToPath(new URL('./packages', import.meta.url));

// Resolve `@nlpjs-neo/*` to the TypeScript sources instead of the published
// `dist/` output, so the test run does not depend on a prior build.
const workspaceAliases = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({
    find: new RegExp(`^@nlpjs-neo/${entry.name}$`),
    replacement: `${packagesDir}/${entry.name}/src/index.ts`,
  }));

export default defineConfig({
  resolve: {
    alias: workspaceAliases,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/test/**/*.test.ts'],
    // Several tests assert on formatted dates, so pin the timezone.
    env: {
      TZ: 'Europe/London',
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/lang-*/**'],
    },
  },
});
