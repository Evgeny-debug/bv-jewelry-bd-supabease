/**
 * Page script extracted from gallery.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

let allGalleryItems = [];
let currentCategory = 'all';

/**
 * 1. ЗАВАНТАЖЕННЯ ДАНИХ З SUPABASE
 */
async function fetchGalleryData() {
    const container = document.getElementById('galleryGrid');
    if (container) {
        container.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-16">
                <div class="w-8 h-8 border-2 border-[var(--gold-muted)] border-t-transparent rounded-full animate-spin"></div>
            </div>`;
    }

    try {
        if (typeof window._supabase !== 'undefined') {
            const { data: tableData, error: tableError } = await window._supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (!tableError && tableData) {
                allGalleryItems = tableData.map(item => ({
                    id: item.id,
                    img: item.image_url,
                    category: item.category || 'general',
                    desc: { 
                        uk: item.desc_uk, 
                        ru: item.desc_ru, 
                        en: item.desc_en 
                    }
                }));
            }

            if (allGalleryItems.length > 0) {
                localStorage.setItem('bv_gallery_cache', JSON.stringify(allGalleryItems));
            }
        }
        
        if (allGalleryItems.length === 0) {
            const cached = localStorage.getItem('bv_gallery_cache');
            allGalleryItems = cached ? JSON.parse(cached) : [];
        }
    } catch (err) {
        console.warn("Не вдалося завантажити з Supabase, використовуємо кеш:", err);
        const cached = localStorage.getItem('bv_gallery_cache');
        allGalleryItems = cached ? JSON.parse(cached) : [];
    }

    // Будуємо динамічні фільтри та рендеримо галерею
    initDynamicGalleryFilters();
    renderGallery(currentCategory);
}

/**
 * 2. ДИНАМІЧНІ ФІЛЬТРИ (автоматичне створення або заповнення)
 */
function initDynamicGalleryFilters() {
    // Шукаємо контейнер для фільтрів за різними можливими селекторами
    let filtersContainer = document.getElementById('galleryFilters') || document.querySelector('.gallery-filters-container');
    
    // Якщо контейнера немає в HTML, створюємо його програмно перед сіткою галереї
    if (!filtersContainer) {
        const grid = document.getElementById('galleryGrid');
        if (grid && grid.parentNode) {
            filtersContainer = document.createElement('div');
            filtersContainer.id = 'galleryFilters';
            filtersContainer.className = 'flex flex-wrap items-center justify-center gap-2 mb-8';
            grid.parentNode.insertBefore(filtersContainer, grid);
        } else {
            return;
        }
    }

    // Збираємо унікальні категорії з наявних елементів
    const usedCategories = [...new Set(allGalleryItems.map(item => item.category))];
    const currentLang = localStorage.getItem('bv_lang') || document.documentElement.lang || 'uk';
    
    // Кнопка "Всі"
    let html = `
        <button data-cat="all" class="gal-filter-btn px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 ${currentCategory === 'all' ? 'bg-[var(--gold-muted)] text-white border-transparent shadow-md' : 'border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--gold-muted)]'}">
            ${currentLang === 'en' ? 'All' : currentLang === 'ru' ? 'Все' : 'Всі'}
        </button>
    `;

    // Кнопки для кожної знайденої категорії
    usedCategories.forEach(cat => {
        const label = getCategoryName(cat, currentLang);
        const isActive = currentCategory === cat;
        html += `
            <button data-cat="${cat}" class="gal-filter-btn px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 ${isActive ? 'bg-[var(--gold-muted)] text-white border-transparent shadow-md' : 'border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--gold-muted)]'}">
                ${label}
            </button>
        `;
    });

    filtersContainer.innerHTML = html;

    // Навішуємо обробники кліків
    const filterButtons = filtersContainer.querySelectorAll('.gal-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            filterButtons.forEach(b => {
                b.classList.remove('bg-[var(--gold-muted)]', 'text-white', 'border-transparent', 'shadow-md');
                b.classList.add('border-[var(--border)]', 'text-[var(--text-main)]');
            });

            btn.classList.remove('border-[var(--border)]', 'text-[var(--text-main)]');
            btn.classList.add('bg-[var(--gold-muted)]', 'text-white', 'border-transparent', 'shadow-md');

            const selectedCategory = btn.getAttribute('data-cat') || 'all';
            renderGallery(selectedCategory);
        });
    });
}

/**
 * 3. ВІДОБРАЖЕННЯ ФОТОГРАФІЙ
 */
function renderGallery(category = 'all') {
    currentCategory = category;
    const container = document.getElementById('galleryGrid');
    if (!container) return;

    const filteredItems = category === 'all' 
        ? allGalleryItems 
        : allGalleryItems.filter(item => item.category === category);

    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16">
                <p class="text-[var(--text-muted)] font-serif italic text-lg">У цій категорії поки немає робіт</p>
            </div>`;
        return;
    }

    const currentLang = localStorage.getItem('bv_lang') || document.documentElement.lang || 'uk';

    container.innerHTML = filteredItems.map(item => {
        const imageUrl = item.img || '';
        
        let description = '';
        if (typeof item.desc === 'object' && item.desc !== null) {
            description = item.desc[currentLang] || item.desc.uk || '';
        } else {
            description = item.desc || '';
        }

        const categoryLabel = getCategoryName(item.category, currentLang);
        const safeDesc = (description || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');

        return `
            <div onclick="openLightbox('${imageUrl}', '${safeDesc}')" 
                 class="group relative overflow-hidden rounded-lg bg-[var(--bg-card)] border border-[var(--border)] transition-all duration-300 hover:border-[var(--gold-muted)] hover:shadow-xl flex flex-col cursor-pointer">
                <div class="aspect-square w-full overflow-hidden bg-black/5 dark:bg-white/5 relative">
                    <img 
                        src="${imageUrl}" 
                        alt="${safeDesc}" 
                        class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onerror="this.style.display='none'; this.parentElement.style.backgroundColor='#1a1a1a';"
                    />
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg class="w-8 h-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </div>
                </div>
                <div class="p-3 flex flex-col justify-between flex-grow">
                    <p class="text-xs font-light text-[var(--text-main)] tracking-wide font-['Montserrat'] line-clamp-1">
                        ${description}
                    </p>
                    <div class="mt-2 pt-2 border-t border-[var(--border)]/50 flex justify-between items-center">
                        <span class="text-[8px] uppercase tracking-widest text-[var(--gold-muted)] font-semibold">
                            ${categoryLabel}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Лайтбокс
function openLightbox(url, caption) {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    
    if (img) img.src = url;
    if (cap) cap.textContent = caption;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

/**
 * 4. ОТРИМАННЯ НАЗВИ КАТЕГОРІЇ
 */
function getCategoryName(category, lang = 'uk') {
    const names = {
        rings: { uk: 'Каблучки', en: 'Rings', ru: 'Кольца' },
        earrings: { uk: 'Сережки', en: 'Earrings', ru: 'Серьги' },
        necklaces: { uk: 'Кольє', en: 'Necklaces', ru: 'Колье' },
        bracelets: { uk: 'Браслети', en: 'Bracelets', ru: 'Браслеты' }
    };
    if (names[category]) {
        return names[category][lang] || names[category]['uk'];
    }
    return category;
}

/**
 * 5. ЗАПУСК
 */
document.addEventListener('DOMContentLoaded', async () => {
    await fetchGalleryData();

    window.addEventListener('langChanged', () => {
        initDynamicGalleryFilters();
        renderGallery(currentCategory);
    });
});

window.renderGallery = renderGallery;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
