#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════
 * Frontend Build Script
 * ═══════════════════════════════════════════════════════
 * Build React components with Bun.build()
 */

import { build } from 'bun';
import { readdirSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';

console.log('🔨 Building frontend...\n');

const startTime = Date.now();
const isProd = (process.env.NODE_ENV || 'production') === 'production';
const rawApiUrl = (process.env.API_URL || '').trim();
const isLocalApi = rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1');
const buildApiUrl = isProd && isLocalApi ? '' : rawApiUrl;

try {
  // Build React app
  const result = await build({
    entrypoints: ['./frontend/src/index.tsx'],
    outdir: './public/react',
    tsconfig: './frontend/tsconfig.json',
    minify: true,
    target: 'browser',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.API_URL': JSON.stringify(buildApiUrl),
    },
    splitting: false,
    sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
  });

  // Copy HTML template
  const htmlTemplate = './frontend/public/index.html';
  const htmlDest = './public/index.html';
  
  cpSync(htmlTemplate, htmlDest);
  console.log('✅ Copied index.html');

  // Stats
  const duration = Date.now() - startTime;
  const outputSize = result.outputs.reduce((acc, file) => {
    return acc + (file.size || 0);
  }, 0);

  console.log('\n📊 Build Stats:');
  console.log(`   Duration: ${duration}ms`);
  console.log(`   Output: ${result.outputs.length} files`);
  console.log(`   Size: ${(outputSize / 1024).toFixed(2)} KB`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`   API URL: ${buildApiUrl || 'auto-detect'}\n`);
  console.log('✅ Frontend built successfully!\n');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
