/**
 * Shared localStorage API + cross-tab / same-origin sync helpers.
 * Admin (classic) and storefront (modules) both use window.API / window.bvSync.
 */
export const API = {
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

const SYNC_CHANNEL = 'bv-data-sync';
let _bc = null;
try {
    if (typeof BroadcastChannel !== 'undefined') {
        _bc = new BroadcastChannel(SYNC_CHANNEL);
    }
} catch (_) { /* ignore */ }

/** Build nested category tree from flat {id, parentId, name} list */
export function buildCategoriesTree(flatList) {
    const list = Array.isArray(flatList) ? flatList : [];
    const lookup = {};
    const tree = [];
    list.forEach((c) => {
        if (!c || !c.id) return;
        lookup[c.id] = { ...c, subcategories: [] };
    });
    list.forEach((c) => {
        if (!c || !c.id || !lookup[c.id]) return;
        if (c.parentId && lookup[c.parentId]) {
            lookup[c.parentId].subcategories.push(lookup[c.id]);
        } else {
            tree.push(lookup[c.id]);
        }
    });
    return tree;
}
window.buildCategoriesTree = buildCategoriesTree;

/**
 * Persist a catalog key to localStorage (+ mirror caches used by mega-menu)
 * and notify other tabs / listeners.
 */
export function syncLocalCatalog(key, value, meta = {}) {
    API.set(key, value);

    if (key === 'bv_categories_flat') {
        localStorage.setItem('bv_storage_categories_flat', JSON.stringify(value || []));
        const tree = buildCategoriesTree(value || []);
        API.set('bv_categories_tree', tree);
        localStorage.setItem('bv_storage_categories_tree', JSON.stringify(tree));
    }
    if (key === 'bv_categories_tree') {
        localStorage.setItem('bv_storage_categories_tree', JSON.stringify(value || []));
    }
    if (key === 'bv_gallery') {
        localStorage.setItem('bv_storage_gallery', JSON.stringify(value || []));
        localStorage.setItem('bv_gallery_cache', JSON.stringify(value || []));
    }
    if (key === 'bv_products') {
        window.products = value;
    }

    const detail = { key, value, source: meta.source || 'local', ts: Date.now() };
    try {
        window.dispatchEvent(new CustomEvent('bv:data-updated', { detail }));
    } catch (_) { /* ignore */ }
    try {
        _bc?.postMessage(detail);
    } catch (_) { /* ignore */ }
    // storage event for older same-origin tabs that miss BroadcastChannel
    try {
        localStorage.setItem('bv_sync_ping', String(detail.ts));
    } catch (_) { /* ignore */ }
}
window.syncLocalCatalog = syncLocalCatalog;

export function onCatalogUpdate(handler) {
    const wrap = (e) => handler(e.detail || e.data || {});
    window.addEventListener('bv:data-updated', wrap);
    if (_bc) {
        _bc.addEventListener('message', (e) => handler(e.data || {}));
    }
    window.addEventListener('storage', (e) => {
        if (e.key === 'bv_sync_ping' || (e.key && e.key.startsWith('bv_'))) {
            handler({ key: e.key, source: 'storage' });
        }
    });
}
window.onCatalogUpdate = onCatalogUpdate;
