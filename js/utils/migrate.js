export function migrateProductToNewFormat(p) {
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
