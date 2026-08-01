/** Shared lists mirrored on window for page scripts & cross-module use. */
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
