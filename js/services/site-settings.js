/**
 * Unified site settings manager (admin ↔ storefront).
 * Source of truth: site_storage key `bv_settings` (+ localStorage mirror).
 */
import { API } from './storage.js';

const DEFAULTS = {
    phone: '+38 063 45 40 901',
    tg: 'https://t.me/bv_jewelry_izmail',
    inst: 'https://www.instagram.com/bv.jewelry_izmail',
    addresses: [
        'вул. Торгова, 68, Ізмаїл',
        'вул. Покровська, 57, Ізмаїл',
    ],
};

/** Normalize legacy key variants from admin / older clients */
export function normalizeSiteSettings(raw) {
    const s = raw && typeof raw === 'object' ? raw : {};
    const phone = (s.phone || '').trim() || DEFAULTS.phone;
    const tg = (s.tg || s.telegram || s.tgLink || '').trim() || DEFAULTS.tg;
    const inst = (s.inst || s.instagram || s.instLink || '').trim() || DEFAULTS.inst;
    let addresses = s.addresses;
    if (!Array.isArray(addresses)) addresses = [];
    addresses = addresses.map((a) => String(a || '').trim()).filter(Boolean);
    if (!addresses.length) addresses = [...DEFAULTS.addresses];

    return {
        ...s,
        phone,
        tg,
        telegram: tg,
        tgLink: tg,
        inst,
        instagram: inst,
        instLink: inst,
        addresses,
        goldRate: s.goldRate,
        bannerRatio: s.bannerRatio || '3/1',
    };
}

export function getSiteSettings() {
    const raw = (typeof API !== 'undefined' && API.get)
        ? (API.get('bv_settings', null) || API.get('bv_site_settings', null))
        : null;
    return normalizeSiteSettings(raw);
}

function telHref(phone) {
    return `tel:${String(phone).replace(/[^\d+]/g, '')}`;
}

function mapsHref(addr) {
    return `https://maps.google.com/?q=${encodeURIComponent(addr)}`;
}

function setHrefAndText(el, href, text) {
    if (!el) return;
    if (href != null) el.setAttribute('href', href);
    if (text != null && el.childElementCount === 0) {
        el.textContent = text;
    } else if (text != null) {
        // Keep icons inside; update text node or dedicated span
        const span = el.querySelector('.header-phone-text, .js-site-phone-text, span:not(.sr-only)');
        if (span && !span.querySelector('svg')) span.textContent = text;
        else if (!el.querySelector('svg')) el.textContent = text;
    }
}

function renderAddressCards(addresses) {
    return addresses.map((addr, idx) => {
        const idHint = idx === 0 ? 'torgova' : idx === 1 ? 'pokrovska' : `branch-${idx}`;
        return `
        <div class="p-4 bg-[var(--bg-lighter,rgba(255,255,255,0.01))] rounded-lg border border-[var(--border)] relative pl-7">
            <span id="dot-${idHint}" class="absolute left-2.5 top-5 w-1.5 h-1.5 rounded-full bg-zinc-600 transition-colors"></span>
            <a href="${mapsHref(addr)}" target="_blank" rel="noopener noreferrer"
               class="js-site-address text-[13px] text-[var(--text-main)] font-medium block mb-1 hover:text-[var(--gold-muted,#C5A059)] transition-colors">
                ${addr}
            </a>
            <span class="text-[11px] text-[var(--text-muted)] font-light">Пн–Нд: згідно з графіком</span>
        </div>`;
    }).join('');
}

/**
 * Paint header / footer / side-menu / contacts from bv_settings.
 */
export function applySiteSettings(rawSettings) {
    const settings = normalizeSiteSettings(rawSettings || getSiteSettings());
    const phone = settings.phone;
    const tg = settings.tg;
    const inst = settings.inst;
    const addresses = settings.addresses;

    // —— Phone ——
    document.querySelectorAll(
        '.header-phone-link, .js-site-phone, a.phone-num, #footer a[href^="tel:"], .side-menu a[href^="tel:"]'
    ).forEach((link) => {
        link.href = telHref(phone);
        if (!link.querySelector('svg') || link.classList.contains('js-site-phone')) {
            const textEl = link.querySelector('.header-phone-text, .js-site-phone-text');
            if (textEl) textEl.textContent = phone;
            else if (!link.querySelector('svg')) link.textContent = phone;
        }
    });
    document.querySelectorAll('.header-phone-text, .js-site-phone-text').forEach((el) => {
        el.textContent = phone;
    });

    // —— Socials ——
    document.querySelectorAll(
        '.tg-link, .js-site-tg, a[aria-label="Telegram"], header a[href*="t.me"], #footer a[href*="t.me"], .side-menu a[href*="t.me"]'
    ).forEach((link) => {
        if (link.closest('a[href*="EVSdev"]')) return; // developer credit
        link.href = tg;
    });
    document.querySelectorAll(
        '.inst-link, .js-site-inst, a[aria-label="Instagram"], #footer a[href*="instagram"], .side-menu a[href*="instagram"]'
    ).forEach((link) => {
        link.href = inst;
    });

    // —— Addresses (footer grid or dedicated block) ——
    let addrBlock = document.getElementById('footerAddressesBlock');
    if (!addrBlock) {
        // Heuristic: footer address cards grid (two-column address section)
        const footer = document.getElementById('footer');
        if (footer) {
            const grids = footer.querySelectorAll('.mb-10.grid');
            grids.forEach((g) => {
                if (g.querySelector('[data-i18n="footer_address_1"], .js-site-address, a[href*="maps"]')) {
                    addrBlock = g;
                    g.id = 'footerAddressesBlock';
                }
            });
        }
    }
    if (addrBlock && addresses.length) {
        addrBlock.innerHTML = renderAddressCards(addresses);
        // Re-run store hours dots if present
        if (typeof window.refreshStoreHoursDots === 'function') {
            try { window.refreshStoreHoursDots(); } catch (_) { /* ignore */ }
        }
    }

    // Compact address line in mobile side-menu footer
    document.querySelectorAll('.js-site-addresses-line, #sideMenu .text-\\[11px\\]').forEach((el) => {
        if (el.tagName === 'A') return;
        if (el.classList.contains('js-site-addresses-line') || (el.textContent && el.textContent.includes('вул.'))) {
            el.textContent = addresses.slice(0, 2).join(' • ');
        }
    });

    // Contacts page / dedicated blocks
    document.querySelectorAll('[data-site-phone]').forEach((el) => {
        if (el.tagName === 'A') setHrefAndText(el, telHref(phone), phone);
        else el.textContent = phone;
    });
    document.querySelectorAll('[data-site-tg]').forEach((el) => {
        if (el.tagName === 'A') el.href = tg;
    });
    document.querySelectorAll('[data-site-inst]').forEach((el) => {
        if (el.tagName === 'A') el.href = inst;
    });
    document.querySelectorAll('[data-site-addresses]').forEach((el) => {
        el.innerHTML = addresses.map((a) =>
            `<a href="${mapsHref(a)}" target="_blank" rel="noopener" class="block mb-2 hover:text-[var(--gold-muted)]">${a}</a>`
        ).join('');
    });

    // Hero / page builder bits (home)
    const pages = (typeof API !== 'undefined' && API.get) ? API.get('bv_pages_content', {}) : {};
    const heroSection = document.getElementById('heroBannerSection');
    if (pages && pages.home_hero) {
        if (pages.home_hero.active === false || pages.home_hero.enabled === false) {
            if (heroSection) heroSection.style.display = 'none';
        } else if (heroSection) {
            heroSection.style.display = '';
            const heroBg = document.querySelector('.hero-img-bg');
            const heroOverlay = document.querySelector('.hero-overlay');
            const heroTitle = document.querySelector('.hero-title');
            const heroSub = document.querySelector('.hero-subtitle');
            if (heroBg && pages.home_hero.heroBg) heroBg.style.backgroundImage = `url('${pages.home_hero.heroBg}')`;
            if (heroOverlay && pages.home_hero.heroOpacity !== undefined) {
                heroOverlay.style.backgroundColor = `rgba(0, 0, 0, ${pages.home_hero.heroOpacity})`;
            }
            if (heroTitle) {
                if (pages.home_hero.title) heroTitle.innerText = pages.home_hero.title;
                if (pages.home_hero.titleColor) heroTitle.style.color = pages.home_hero.titleColor;
            }
            if (heroSub) {
                if (pages.home_hero.subtitle) heroSub.innerText = pages.home_hero.subtitle;
                if (pages.home_hero.subColor) heroSub.style.color = pages.home_hero.subColor;
            }
        }
    }

    window.__bvSiteSettings = settings;
    try {
        window.dispatchEvent(new CustomEvent('bv:settings-applied', { detail: settings }));
    } catch (_) { /* ignore */ }
    return settings;
}

window.getSiteSettings = getSiteSettings;
window.applySiteSettings = applySiteSettings;
window.applyAdminSettings = applySiteSettings; // legacy alias used by loadCloudData
window.normalizeSiteSettings = normalizeSiteSettings;

// Keep chrome in sync when admin saves / cloud refresh lands
if (typeof window !== 'undefined' && !window.__bvSettingsListenerBound) {
    window.__bvSettingsListenerBound = true;
    window.addEventListener('bv:data-updated', (e) => {
        const key = e.detail && e.detail.key;
        if (!key || key === '*' || key === 'bv_settings' || key === 'bv_site_settings' || key === 'bv_pages_content') {
            applySiteSettings();
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
        // Early paint from localStorage before cloud finishes
        try { applySiteSettings(); } catch (_) { /* ignore */ }
    });
}
