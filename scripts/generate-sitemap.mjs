/**
 * Generate sitemap.xml from Supabase catalog data.
 * Usage: node scripts/generate-sitemap.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabaseUrl, supabaseKey } from '../js/config.js';
import { generateSitemapXml, SITE_URL } from '../js/services/sitemap-builder.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const { xml, urlCount, products, categories } = await generateSitemapXml({
    supabaseUrl,
    supabaseKey,
    siteUrl: SITE_URL,
});

const outPath = join(root, 'sitemap.xml');
writeFileSync(outPath, xml, 'utf8');

console.log(`sitemap.xml written (${urlCount} URLs: ${products} products, ${categories} categories)`);
console.log(`${SITE_URL}/sitemap.xml`);
