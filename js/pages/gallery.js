/**
 * Page script extracted from gallery.html (Phase 5).
 * Loaded as ES module after js/main.js. 
 * Fully integrated with dynamic categories from Supabase and multi-language support.
 */

// Глобальні масиви для зберігання даних
let allGalleryItems = [];
let dynamicCategories = [];
let currentCategory = 'all';

/**
 * 1. ЗАВАНТАЖЕННЯ ДИНАМІЧНИХ КАТЕГОРІЙ (ФІЛЬТРІВ) З SUPABASE
 */
async function loadGalleryMainFilters() {
    const filtersContainer = document.getElementById('gallery-main-filters');
    if (!filtersContainer) return;

    try {
        if (typeof window._supabase !== 'undefined') {
            const { data, error } = await window._supabase
                .from('categories')
                .select('*')
                .order('id', { ascending: true });

            if (!error && data) {
                dynamicCategories = data;
            }
        }

        const currentLang = localStorage.getItem('bv_lang') || document.documentElement.lang || 'uk';

        // Базова кнопка "Всі"
        let filtersHTML = `
            <a href="#all" class="gal-filter-btn px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all bg-[var(--gold-muted)] text-white border-transparent shadow-md" data-cat="all">Всі</a>
        `;

        // Динамічне додавання категорій з БД з урахуванням мови
        dynamicCategories.forEach(cat => {
            const catName = cat[`name_${currentLang}`] || cat.name_uk || cat.id;
            filtersHTML += `
                <a href="#${cat.id}" class="gal-filter-btn px-6 py-2 border border-[var(--border)] text-[var(--text-main)] rounded-full text-xs font-bold uppercase tracking-widest transition-all" data-cat="${cat.id}">${catName}</a>
            `;
        });

        filtersContainer.innerHTML = filtersHTML;
        
        // Ініціалізація подій кліку по фільтрах
        initGalleryFilterLogic();

    } catch (error) {
        console.error('Помилка завантаження фільтрів галереї:', error);
    }
}

/**
 * 2. ІНІЦІАЛІЗАЦІЯ КНОПОК ФІЛЬТРІВ
 */
function initGalleryFilterLogic() {
    const filterButtons = document.querySelectorAll('.gal-filter-btn');
    
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
 * 3. ЗАВАНТАЖЕННЯ ДАНИХ ФОТОГРАФІЙ З SUPABASE (АБО ЛОКАЛЬНОГО КЕШУ)
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
            // Спробуємо спочатку завантажити з site_storage (ключ bv_gallery)
            const { data: storageData, error: storageError } = await window._supabase
                .from('site_storage')
                .select('value')
                .eq('key', 'bv_gallery')
                .single();

            if (!storageError && storageData && storageData.value && Array.isArray(storageData.value)) {
                allGalleryItems = storageData.value;
            } else {
                // Якщо в site_storage пусто або помилка, запитуємо таблицю gallery
                const { data: tableData, error: tableError } = await window._supabase
                    .from('gallery')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!tableError && tableData) {
                    allGalleryItems = tableData;
                }
            }

            if (allGalleryItems.length > 0) {
                localStorage.setItem('bv_gallery_cache', JSON.stringify(allGalleryItems));
            }
        }
        
        // Якщо Supabase недоступний — беремо з кешу або window.API
        if (!allGalleryItems.length) {
            const cached = localStorage.getItem('bv_gallery_cache');
            allGalleryItems = cached ? JSON.parse(cached) : (typeof window.API !== 'undefined' ? window.API.get('bv_gallery', []) : []);
        }
    } catch (err) {
        console.warn("Не вдалося завантажити з Supabase, використовуємо кеш:", err);
        const cached = localStorage.getItem('bv_gallery_cache');
        allGalleryItems = cached ? JSON.parse(cached) : [];
    }

    renderGallery(currentCategory);
}

/**
 * 4. ВІДОБРАЖЕННЯ ФОТОГРАФІЙ НА ЕКРАНІ
 */
function renderGallery(category = 'all') {
    currentCategory = category;
    const container = document.getElementById('galleryGrid');
    if (!container) return;

    const filteredItems = category === 'all' 
        ? allGalleryItems 
        : allGalleryItems.filter(item => String(item.category) === String(category));

    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16">
                <p class="text-[var(--text-muted)] font-serif italic text-lg">У цій категорії поки немає робіт</p>
            </div>`;
        return;
    }

    const currentLang = localStorage.getItem('bv_lang') || document.documentElement.lang || 'uk';

    container.innerHTML = filteredItems.map(item => {
        const imageUrl = item.img || item.image_url || item.url || item.image || '';
        
        let description = '';
        if (typeof item.desc === 'object' && item.desc !== null) {
            description = item.desc[currentLang] || item.desc.uk || '';
        } else {
            description = item[`desc_${currentLang}`] || item.desc_uk || item.title || '';
        }

        const categoryLabel = getCategoryName(item.category, currentLang);
        const safeDesc = description.replace(/'/g, "\\'").replace(/"/g, '&quot;');

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

/**
 * 5. ФУНКЦІЇ КЕРУВАННЯ ЛАЙТБОКСОМ
 */
window.openLightbox = function(url, caption) {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    
    img.src = url;
    cap.textContent = caption;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

window.closeLightbox = function() {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Закриття по Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeLightbox();
});

/**
 * 6. ДОПОМІЖНА ФУНКЦІЯ: НАЗВА КАТЕГОРІЇ ОБРАНОЮ МОВОЮ
 */
function getCategoryName(categoryId, lang = 'uk') {
    const dynCat = dynamicCategories.find(c => String(c.id) === String(categoryId));
    if (dynCat) {
        return dynCat[`name_${lang}`] || dynCat.name_uk || dynCat.id;
    }

    const names = {
        rings: { uk: 'Каблучка', en: 'Ring', ru: 'Кольцо' },
        earrings: { uk: 'Сережки', en: 'Earrings', ru: 'Серьги' },
        necklaces: { uk: 'Ланцюжок / Кольє', en: 'Necklace', ru: 'Цепочка / Колье' },
        bracelets: { uk: 'Браслет', en: 'Bracelet', ru: 'Браслет' }
    };
    return names[categoryId] ? (names[categoryId][lang] || names[categoryId]['uk']) : categoryId;
}

/**
 * 7. ЗАПУСК ПРИ ЗАВАНТАЖЕННІ СТОРІНКИ
 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadGalleryMainFilters();
    await fetchGalleryData();

    window.addEventListener('langChanged', async () => {
        await loadGalleryMainFilters();
        renderGallery(currentCategory);
    });
});

window.renderGallery = renderGallery;
