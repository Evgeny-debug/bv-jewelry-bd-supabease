/**
 * Split root main.js → js/* ES modules (phases 1–4).
 * Keeps original identifiers; only extracts foundations + feature chunks.
 * Function declarations are mirrored to window (classic-script behavior).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const lines = fs.readFileSync(path.join(root, 'main.js'), 'utf8').split(/\r?\n/);

const slice = (a, b) => lines.slice(a - 1, b).join('\n');
const write = (rel, content) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, '\n'), 'utf8');
  console.log('✓', rel);
};

function stripImportedConsts(code) {
  return code
    .replace(/^const flags = .*$/m, '// flags → import')
    .replace(/^const sunSVG = .*$/m, '// sunSVG → import')
    .replace(/^const moonSVG = .*$/m, '// moonSVG → import')
    .replace(/^const formatterPrice = .*$/m, '// formatterPrice → import')
    .replace(/^const sunIconSvg = .*$/m, '// sunIconSvg → import')
    .replace(/^const moonIconSvg = .*$/m, '// moonIconSvg → import');
}

function bindGlobals(code) {
  const names = new Set();
  let m;
  const re = /(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g;
  while ((m = re.exec(code))) names.add(m[1]);
  const binds = [...names].sort().map((n) => `window.${n} = ${n};`);
  return binds.length ? `\n// Classic-script global mirror\n${binds.join('\n')}\n` : '';
}

function wrap(imports, body) {
  const transformed = stripImportedConsts(body);
  // Bare i18n was a classic global
  const withI18n = transformed.replace(/(?<![-\w.])i18n\b/g, 'window.i18n');
  return `${imports}\n\n${withI18n}\n${bindGlobals(withI18n)}`;
}

const IMP_APP = `import { API } from '../services/storage.js';
import { _supabase } from '../services/supabase.js';
import { flags, sunSVG, moonSVG, formatterPrice, sunIconSvg, moonIconSvg } from '../utils/constants.js';`;

// --- foundations ---
write('js/config.js', `export const supabaseUrl = 'https://trcjsnvcdonlzxprgdzd.supabase.co';
export const supabaseKey = 'sb_publishable_qSUZxk_9JV9wJNrdjAqeLA_8O_8-TVV';
`);

write('js/services/storage.js', `export const API = {
    get: (key, def) => {
        try {
            const d = localStorage.getItem(key);
            return d ? JSON.parse(d) : def;
        } catch (e) { return def; }
    },
    set: (key, val) => {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error("Помилка збереження в localStorage:", e);
        }
    }
};
window.API = API;
`);

write('js/services/supabase.js', `import { supabaseUrl, supabaseKey } from '../config.js';

export const _supabase = typeof supabase !== 'undefined'
    ? supabase.createClient(supabaseUrl, supabaseKey)
    : null;

if (_supabase) {
    console.log("BV Jewelry: Підключення до хмари Supabase встановлено.");
} else {
    console.warn("BV Jewelry: Supabase SDK не знайдено. Працюємо в офлайн/локальному режимі.");
}
window._supabase = _supabase;
`);

write('js/utils/constants.js', `export const flags = { uk: "ua", en: "gb", ru: "ru", bg: "bg" };
export const sunSVG = \`<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>\`;
export const moonSVG = \`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>\`;
export const formatterPrice = new Intl.NumberFormat('uk-UA', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 });
export const sunIconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
export const moonIconSvg = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
window.flags = flags;
window.sunSVG = sunSVG;
window.moonSVG = moonSVG;
window.formatterPrice = formatterPrice;
`);

write('js/utils/debug.js', slice(1, 39) + '\n');

write('js/utils/dom.js', `export function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
window.escapeHtml = escapeHtml;
`);

write('js/utils/icons.js', `export function getCategoryIconSVG(catId) {
    const id = catId.toLowerCase();
    if (id.includes('gold')) return \`<path stroke-linecap="round" stroke-linejoin="round" d="M6 3h12l4 6-10 13L2 9Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M11 3 8 9l4 13"/><path stroke-linecap="round" stroke-linejoin="round" d="M13 3l3 6-4 13"/>\`;
    if (id.includes('silver')) return \`<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>\`;
    if (id.includes('ring')) return \`<circle cx="12" cy="14" r="5" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 9l-2-3h4l-2 3z"/>\`;
    if (id.includes('earring')) return \`<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v9"/><circle cx="12" cy="16" r="3" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 4h6"/>\`;
    if (id.includes('chain') || id.includes('neck')) return \`<circle cx="8" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M11 12h2"/>\`;
    if (id.includes('bracelet')) return \`<ellipse cx="12" cy="12" rx="7" ry="3" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 12v2c0 2 3 7 3s7-1 7-3v-2"/>\`;
    return \`<circle cx="12" cy="12" r="4" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 20v2"/>\`;
}
window.getCategoryIconSVG = getCategoryIconSVG;
`);

write('js/utils/migrate.js', `export function migrateProductToNewFormat(p) {
    if(p.variations) return p;
    let base = {
        name: { uk: p.name || '', ru: p.name || '', en: p.nameEN || p.name || '' },
        desc: { uk: p.desc || '', ru: p.desc || '', en: p.desc || '' },
        priceType: p.priceType || 'manual',
        price: p.price || 0, weight: p.weight || 0, workCost: p.workCost || 0, discount: p.discount || null,
        images: p.images && p.images.length > 0 ? p.images : (p.img || p.image ? [p.img || p.image] : [])
    };
    let blocks = [];
    if(p.isSpecial) blocks.push('hits');
    if(p.isWeekly) blocks.push('weekly');
    return {
        id: p.id, sku: p.sku || p.id, category: p.category || '', status: p.status || 'in-stock', badge: p.badge || 'none',
        blocks: blocks,
        sizes: Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' && p.sizes.trim() ? p.sizes.split(',').map(s=>s.trim()) : []),
        variations: { base: base }, stones: p.stones || '', variant: p.variant || ''
    };
}
export function buildTree(flatList) {
    let tree = [];
    let lookup = {};
    flatList.forEach(c => lookup[c.id] = { ...c, subcategories: [] });
    flatList.forEach(c => {
        if (c.parentId && lookup[c.parentId]) lookup[c.parentId].subcategories.push(lookup[c.id]);
        else tree.push(lookup[c.id]);
    });
    return tree;
}
window.migrateProductToNewFormat = migrateProductToNewFormat;
window.buildTree = buildTree;
`);

// Shared mutable state module — products / categoriesTree live here so all app chunks share one binding via window sync helpers
write('js/state/store.js', `/** Shared lists mirrored on window for page scripts & cross-module use. */
export let products = [];
export let categoriesTree = [];
export let banners = [];

export function setProducts(next) {
    products = Array.isArray(next) ? next : [];
    window.products = products;
}
export function setCategoriesTree(next) {
    categoriesTree = Array.isArray(next) ? next : [];
    window.categoriesTree = categoriesTree;
}
export function setBanners(next) {
    banners = Array.isArray(next) ? next : [];
    window.banners = banners;
}

window.products = products;
window.categoriesTree = categoriesTree;
window.banners = banners;
if (typeof window.priceListDB === 'undefined') window.priceListDB = [];
`);

/**
 * For shop-core: keep `let products` / `let categoriesTree` in file (original),
 * and after any `products =` / `window.products =` the window mirror stays.
 * Other modules that need products should use window.products.
 *
 * We INCLUDE let products/categoriesTree in shop-core from original lines 385-386.
 */

const moduleA = [
  // include let products / categoriesTree from original
  'let categoriesTree = [];\nlet products = [];\n',
  slice(75, 378),
  // skip 380-419 (flags/migrate — extracted)
  slice(421, 1814),
].join('\n');

// After shop-core body, sync helpers so assignments stay on window
const shopCoreSync = `
// Keep window.products in sync when module-level products is reassigned
const _syncProducts = () => { window.products = products; };
const _origProductsDesc = Object.getOwnPropertyDescriptor(window, 'products');
`;

write('js/app/shop-core.js', wrap(IMP_APP, moduleA) + `
// Sync shared arrays onto window after load / mutations that set window.products explicitly (already in original)
window.products = products;
window.categoriesTree = categoriesTree;
`);

write('js/app/auth-bootstrap.js', wrap(IMP_APP, slice(1986, 2277)));
write('js/app/gallery-menus.js', wrap(IMP_APP, slice(2279, 2798)));
write('js/app/admin-widgets.js', wrap(IMP_APP, 'let banners = [];\n' + slice(2808, 3386)));
write('js/app/extras.js', wrap(IMP_APP, [
  slice(3393, 3564),
  slice(3568, 3797),
].join('\n\n')));

write('js/main.js', `/**
 * BV Jewelry — ES module entry (phases 1–4).
 * HTML structure, CSS, and behavior unchanged; window.* API kept for inline handlers.
 */
import './utils/debug.js';
import './services/storage.js';
import './services/supabase.js';
import './utils/constants.js';
import './utils/dom.js';
import './utils/icons.js';
import './utils/migrate.js';

import './app/shop-core.js';
import './app/auth-bootstrap.js';
import './app/gallery-menus.js';
import './app/admin-widgets.js';
import './app/extras.js';

console.log('BV Jewelry: modular main loaded');
`);

console.log('\\nSplit complete.');
