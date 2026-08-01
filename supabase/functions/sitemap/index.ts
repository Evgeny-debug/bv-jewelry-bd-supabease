/**
 * Supabase Edge Function: dynamic sitemap.xml
 * Deploy: supabase functions deploy sitemap
 * URL: https://<project>.supabase.co/functions/v1/sitemap
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SITE_URL = 'https://bv-jewelry.com';

const STATIC_ROUTES = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/catalog.html', changefreq: 'daily', priority: '0.9' },
    { path: '/gallery.html', changefreq: 'weekly', priority: '0.8' },
    { path: '/services.html', changefreq: 'monthly', priority: '0.7' },
    { path: '/exclusive.html', changefreq: 'monthly', priority: '0.8' },
    { path: '/privacy.html', changefreq: 'yearly', priority: '0.3' },
];

const INFO_PAGES = ['about', 'warranty', 'terms', 'reviews'];

function escapeXml(str: string) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function formatLastmod(date: string | Date) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
}

type SitemapEntry = {
    loc: string;
    lastmod?: string | Date;
    changefreq?: string;
    priority?: string;
};

function buildXml(entries: SitemapEntry[]) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const entry of entries) {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
        if (entry.lastmod) xml += `    <lastmod>${formatLastmod(entry.lastmod)}</lastmod>\n`;
        if (entry.changefreq) xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
        if (entry.priority) xml += `    <priority>${entry.priority}</priority>\n`;
        xml += '  </url>\n';
    }
    xml += '</urlset>\n';
    return xml;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        );

        const now = new Date();
        const entries: SitemapEntry[] = [];

        for (const route of STATIC_ROUTES) {
            entries.push({
                loc: `${SITE_URL}${route.path}`,
                lastmod: now,
                changefreq: route.changefreq,
                priority: route.priority,
            });
        }

        for (const page of INFO_PAGES) {
            entries.push({
                loc: `${SITE_URL}/info.html?p=${page}`,
                lastmod: now,
                changefreq: 'monthly',
                priority: '0.6',
            });
        }

        const { data: categoriesRow } = await supabase
            .from('site_storage')
            .select('value')
            .eq('key', 'bv_categories_flat')
            .maybeSingle();

        const categories = (categoriesRow?.value as Array<{ id: string }> | null) ?? [];
        for (const cat of categories) {
            if (!cat?.id) continue;
            entries.push({
                loc: `${SITE_URL}/catalog.html#${cat.id}`,
                lastmod: now,
                changefreq: 'weekly',
                priority: '0.7',
            });
        }

        const { data: products, error } = await supabase
            .from('products')
            .select('id, created_at, status');

        if (error) throw error;

        for (const product of products ?? []) {
            if (!product?.id) continue;
            entries.push({
                loc: `${SITE_URL}/product.html?id=${encodeURIComponent(product.id)}`,
                lastmod: product.created_at || now,
                changefreq: 'weekly',
                priority: '0.8',
            });
        }

        return new Response(buildXml(entries), {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(`<?xml version="1.0" encoding="UTF-8"?><error>${escapeXml(message)}</error>`, {
            status: 500,
            headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });
    }
});
