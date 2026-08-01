/**
 * Dynamic sitemap builder for BV Jewelry.
 * Used by scripts/generate-sitemap.mjs, Supabase Edge Function, and admin panel.
 */

export const SITE_URL = 'https://bv-jewelry.com';

const STATIC_ROUTES = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/catalog.html', changefreq: 'daily', priority: '0.9' },
    { path: '/gallery.html', changefreq: 'weekly', priority: '0.8' },
    { path: '/services.html', changefreq: 'monthly', priority: '0.7' },
    { path: '/exclusive.html', changefreq: 'monthly', priority: '0.8' },
    { path: '/privacy.html', changefreq: 'yearly', priority: '0.3' },
];

const INFO_PAGES = ['about', 'warranty', 'terms', 'reviews'];

function escapeXml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function formatLastmod(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
    let xml = '  <url>\n';
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    if (lastmod) xml += `    <lastmod>${formatLastmod(lastmod)}</lastmod>\n`;
    if (changefreq) xml += `    <changefreq>${changefreq}</changefreq>\n`;
    if (priority) xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
    return xml;
}

export function buildSitemapEntries({
    products = [],
    categories = [],
    siteUrl = SITE_URL,
    now = new Date(),
} = {}) {
    const entries = [];

    for (const route of STATIC_ROUTES) {
        entries.push({
            loc: `${siteUrl}${route.path}`,
            lastmod: now,
            changefreq: route.changefreq,
            priority: route.priority,
        });
    }

    for (const page of INFO_PAGES) {
        entries.push({
            loc: `${siteUrl}/info.html?p=${page}`,
            lastmod: now,
            changefreq: 'monthly',
            priority: '0.6',
        });
    }

    for (const cat of categories) {
        const id = typeof cat === 'string' ? cat : cat?.id;
        if (!id) continue;
        entries.push({
            loc: `${siteUrl}/catalog.html#${id}`,
            lastmod: now,
            changefreq: 'weekly',
            priority: '0.7',
        });
    }

    for (const product of products) {
        if (!product?.id) continue;
        entries.push({
            loc: `${siteUrl}/product.html?id=${encodeURIComponent(product.id)}`,
            lastmod: product.created_at || now,
            changefreq: 'weekly',
            priority: '0.8',
        });
    }

    return entries;
}

export function buildSitemapXml(entries) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const entry of entries) {
        xml += urlEntry(entry);
    }
    xml += '</urlset>\n';
    return xml;
}

export async function fetchSitemapData(supabaseUrl, supabaseKey) {
    const headers = {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
    };

    const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/products?select=id,created_at,status`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/site_storage?key=eq.bv_categories_flat&select=value`, { headers }),
    ]);

    if (!productsRes.ok) {
        throw new Error(`Products fetch failed: ${productsRes.status} ${await productsRes.text()}`);
    }
    if (!categoriesRes.ok) {
        throw new Error(`Categories fetch failed: ${categoriesRes.status} ${await categoriesRes.text()}`);
    }

    const products = await productsRes.json();
    const categoriesRow = await categoriesRes.json();
    const categories = categoriesRow?.[0]?.value ?? [];

    return { products, categories };
}

export async function generateSitemapXml({ supabaseUrl, supabaseKey, siteUrl = SITE_URL } = {}) {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('supabaseUrl and supabaseKey are required');
    }
    const { products, categories } = await fetchSitemapData(supabaseUrl, supabaseKey);
    const entries = buildSitemapEntries({ products, categories, siteUrl });
    return {
        xml: buildSitemapXml(entries),
        urlCount: entries.length,
        products: products.length,
        categories: categories.length,
    };
}
