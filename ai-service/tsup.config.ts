import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  treeshake: true,
  tsconfig: 'tsconfig.tsup.json',
  shims: true,
  bundle: true,
});