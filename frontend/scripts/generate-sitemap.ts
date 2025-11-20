#!/usr/bin/env tsx
/**
 * Build script to generate sitemap.xml
 * Run: npm run generate-sitemap
 */

import path from 'path';
import { generateAndSaveSitemap } from '../src/utils/sitemap-generator';

const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

async function main() {
  console.log('🔄 Generating sitemap...');
  
  try {
    await generateAndSaveSitemap(OUTPUT_PATH);
    console.log('✅ Sitemap generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

main();
