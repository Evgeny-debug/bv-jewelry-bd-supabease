export function getCategoryIconSVG(catId) {
    const id = catId.toLowerCase();
    if (id.includes('gold')) return `<path stroke-linecap="round" stroke-linejoin="round" d="M6 3h12l4 6-10 13L2 9Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M11 3 8 9l4 13"/><path stroke-linecap="round" stroke-linejoin="round" d="M13 3l3 6-4 13"/>`;
    if (id.includes('silver')) return `<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    if (id.includes('ring')) return `<circle cx="12" cy="14" r="5" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 9l-2-3h4l-2 3z"/>`;
    if (id.includes('earring')) return `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v9"/><circle cx="12" cy="16" r="3" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 4h6"/>`;
    if (id.includes('chain') || id.includes('neck')) return `<circle cx="8" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M11 12h2"/>`;
    if (id.includes('bracelet')) return `<ellipse cx="12" cy="12" rx="7" ry="3" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 12v2c0 2 3 7 3s7-1 7-3v-2"/>`;
    return `<circle cx="12" cy="12" r="4" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 20v2"/>`;
}
window.getCategoryIconSVG = getCategoryIconSVG;
