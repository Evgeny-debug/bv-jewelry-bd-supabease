/**
 * Page script extracted from catalog.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

// Універсальна безпечна функція читання полів товару
    function getProdVal(prod, field) {
        if (!prod) return '';
        if (field === 'desc') return prod.desc || prod.description || '';
        if (field === 'workCost') return prod.workCost || prod.work_cost || 0;
        if (field === 'priceType') return prod.priceType || prod.price_type || '';
        if (field === 'nameEN') return prod.nameEN || prod.name_en || '';
        if (field === 'img') {
            let imgs = prod.images || prod.img;
            if (typeof imgs === 'string') {
                try { imgs = JSON.parse(imgs); } catch(e) { imgs = [imgs]; }
            }
            if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
            return imgs || '';
        }
        return prod[field] !== undefined ? prod[field] : '';
    }

    // Робимо головний слухач асинхронним
    document.addEventListener('DOMContentLoaded', async () => {
        const grid = document.getElementById('productGrid');
        const sideFilterCategories = document.getElementById('sideFilterCategories');
        const mobFilterCategories = document.getElementById('mobileFilterCategories');
        const sortSelect = document.getElementById('sortSelect');
        
        // ЕЛЕМЕНТИ ПАГІНАЦІЇ
        const pagContainer = document.getElementById('paginationContainer');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        const pageIndicator = document.getElementById('pageIndicator');
        
        let filteredProducts = [];
        let currentPage = 1;
        const itemsPerPage = 120;
        let filterEventsBound = false;
        let refreshTimer = null;

        // --- НОВА ФУНКЦІЯ: Завантаження категорій з Supabase ---
        // --- НОВА ФУНКЦІЯ: Завантаження категорій з Supabase ---
        let isFetchingCategories = false; // Блокування для запобігання циклу

        async function fetchCategoriesFromDB() {
            if (isFetchingCategories) return resolveCategoriesTreeFromCache();
            isFetchingCategories = true;

            try {
                const db = typeof window._supabase !== 'undefined' ? window._supabase : null;

                if (!db || typeof db.from !== 'function') {
                    console.warn('[DB Error] Клієнт window._supabase не готовий. Використовуємо кеш.');
                    return resolveCategoriesTreeFromCache();
                }

                // Prefer tree; fall back to flat→tree (admin writes flat + now also tree)
                const { data: rows, error } = await db
                    .from('site_storage')
                    .select('key, value')
                    .in('key', ['bv_categories_tree', 'bv_categories_flat']);

                if (error) throw error;

                let tree = null;
                let flat = null;
                (rows || []).forEach((item) => {
                    let val = item.value;
                    if (typeof val === 'string') {
                        try { val = JSON.parse(val); } catch (_) {}
                    }
                    if (item.key === 'bv_categories_tree') tree = val;
                    if (item.key === 'bv_categories_flat') flat = val;
                });

                if (Array.isArray(flat) && flat.length) {
                    // ИСПРАВЛЕНИЕ: Пишем напрямую в localStorage, чтобы не дергать window.API.set 
                    // и не вызывать бесконечный цикл события bv:data-updated
                    localStorage.setItem('bv_categories_flat', JSON.stringify(flat));
                    
                    const built = typeof window.buildCategoriesTree === 'function'
                        ? window.buildCategoriesTree(flat)
                        : (typeof window.buildTree === 'function' ? window.buildTree(flat) : null);
                        
                    if (built) {
                        localStorage.setItem('bv_categories_tree', JSON.stringify(built));
                        return built;
                    }
                }
                if (Array.isArray(tree) && tree.length) {
                    // ИСПРАВЛЕНИЕ: Тихое сохранение
                    localStorage.setItem('bv_categories_tree', JSON.stringify(tree));
                    return tree;
                }
            } catch (err) {
                console.warn('[DB Error] Не вдалося завантажити категорії з БД, використовуємо кеш:', err);
            } finally {
                isFetchingCategories = false; // Знімаємо блокування
            }
            
            return resolveCategoriesTreeFromCache();
        }

        function resolveCategoriesTreeFromCache() {
            if (typeof window.API === 'undefined') return [];
            const tree = window.API.get('bv_categories_tree', []);
            if (Array.isArray(tree) && tree.length) return tree;
            const flat = window.API.get('bv_categories_flat', []);
            if (Array.isArray(flat) && flat.length) {
                const built = typeof window.buildCategoriesTree === 'function'
                    ? window.buildCategoriesTree(flat)
                    : (typeof window.buildTree === 'function' ? window.buildTree(flat) : []);
                return built || [];
            }
            return [];
        }

        // 1. ДИНАМІЧНА ГЕНЕРАЦІЯ ДЕРЕВА КАТЕГОРІЙ (Тепер асинхронна)
        async function initFilters() {
            // Чекаємо на отримання реальних даних з бази
            const cats = await fetchCategoriesFromDB();
            
            let sideHtml = `<button class="filter-link active font-bold mb-4 text-[14px] w-full text-left" data-filter="all" data-i18n="menu_all">Всі вироби</button>`;
            let mobHtml = `<button class="filter-link active font-bold mb-4 text-[14px] w-full text-left" data-filter="all" data-i18n="menu_all">Всі вироби</button>`;

            cats.forEach(cat => {
                const catName = window.getLoc ? window.getLoc(cat, 'name') : (cat.name || '');
                
                let treeHtml = `
                <details class="group mb-1">
                    <summary class="flex justify-between items-center cursor-pointer text-[12px] font-bold uppercase tracking-widest text-[var(--text-main)] outline-none py-2">
                        <!-- УБРАН data-filter, теперь клик только раскрывает details -->
                        <span class="hover:text-[var(--gold-muted)] transition-colors w-full">${catName}</span>
                        <svg class="w-4 h-4 transform transition-transform group-open:rotate-180 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </summary>
                    <div class="pl-3 mt-1 flex flex-col gap-1 border-l border-[var(--border)] ml-1 mb-4">`;
                
                if (cat.subcategories && cat.subcategories.length > 0) {
                    cat.subcategories.forEach(sub => {
                        const subName = window.getLoc ? window.getLoc(sub, 'name') : (sub.name || '');
                        
                        if (sub.subcategories && sub.subcategories.length > 0) {
                            treeHtml += `
                            <details class="group/sub">
                                <summary class="flex justify-between items-center cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-[var(--gold-muted)] hover:opacity-80 transition-opacity outline-none py-1.5 mt-1">
                                    <!-- УБРАН data-filter для вложенного аккордеона -->
                                    <span class="hover:text-[var(--text-main)] transition-colors w-full">${subName}</span>
                                    <svg class="w-3 h-3 transform transition-transform group-open/sub:rotate-180 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                </summary>
                                <div class="pl-3 mt-1 flex flex-col gap-2 border-l border-white/10 ml-1 mb-2">`;
                            
                            sub.subcategories.forEach(subsub => {
                                const subsubName = window.getLoc ? window.getLoc(subsub, 'name') : (subsub.name || '');
                                // Здесь data-filter остается, так как это конечный пункт
                                treeHtml += `<button class="filter-link text-[12px] w-full text-left py-1" data-filter="${subsub.id}">${subsubName}</button>`;
                            });
                            treeHtml += `</div></details>`;
                        } else {
                            // Здесь data-filter тоже остается, так как подкатегорий нет
                            treeHtml += `<button class="filter-link text-[11px] w-full text-left py-1.5 uppercase tracking-widest font-semibold" data-filter="${sub.id}">${subName}</button>`;
                        }
                    });
                }
                treeHtml += `</div></details>`;

                sideHtml += treeHtml;
                mobHtml += treeHtml;
            });

            if(sideFilterCategories) sideFilterCategories.innerHTML = sideHtml;
            if(mobFilterCategories) mobFilterCategories.innerHTML = mobHtml;

            const savedLang = window.API.get('bv_lang', 'uk');
            if (savedLang !== 'uk' && window.i18n && window.i18n[savedLang] && window.i18n[savedLang]['menu_all']) {
                document.querySelectorAll('[data-filter="all"]').forEach(el => el.innerText = window.i18n[savedLang]['menu_all']);
            }

            bindFilterEventsOnce();
        }

        function bindFilterEventsOnce() {
            if (filterEventsBound) return;
            filterEventsBound = true;

            const handleFilterContainer = (container) => {
                if (!container) return;

                container.addEventListener('toggle', (e) => {
                    const detail = e.target;
                    if (detail.tagName !== 'DETAILS' || !detail.open) return;
                    const siblings = detail.parentElement?.querySelectorAll(':scope > details');
                    siblings?.forEach((sibling) => {
                        if (sibling !== detail) sibling.removeAttribute('open');
                    });
                }, true);

                container.addEventListener('click', (e) => {
                    const btn = e.target.closest('[data-filter]');
                    if (!btn || !container.contains(btn)) return;

                    const f = btn.dataset.filter;
                    if (!f) return;

                    if (btn.tagName === 'SPAN') {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll(`[data-filter="${f}"]`).forEach(b => b.classList.add('active'));
                    window.location.hash = f === 'all' ? '' : f;

                    currentPage = 1;
                    applyAllFilters();
                    if (window.innerWidth < 1024 && window.toggleMobileFilters) window.toggleMobileFilters();
                });
            };

            handleFilterContainer(sideFilterCategories);
            handleFilterContainer(mobFilterCategories);

            document.querySelectorAll('.chip-filter, #mobileSortOptions button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const v = e.currentTarget.dataset.variant;
                    const s = e.currentTarget.dataset.sort;

                    if (v) {
                        e.currentTarget.classList.toggle('active');
                        currentPage = 1;
                        applyAllFilters();
                    }

                    if (s) {
                        document.querySelectorAll('#mobileSortOptions button').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        const sortElement = document.getElementById('sortSelect');
                        if (sortElement) sortElement.value = s;
                        currentPage = 1;
                        applyAllFilters();
                        if (window.innerWidth < 1024 && window.toggleMobileFilters) window.toggleMobileFilters();
                    }
                });
            });
        }
        
        window.toggleMobileFilters = function() {
            const overlay = document.getElementById('mobileFilterOverlay');
            const drawer = document.getElementById('mobileFilterDrawer');
            if (!overlay || !drawer) return;
            
            if(drawer.classList.contains('active')) {
                drawer.classList.remove('active');
                overlay.classList.add('hidden');
                overlay.classList.remove('opacity-100');
                document.body.style.overflow = '';
            } else {
                overlay.classList.remove('hidden');
                setTimeout(() => overlay.classList.add('opacity-100'), 10);
                drawer.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        function applyAllFilters() {
            const allProducts = window.API.get('bv_products', []);
            const hash = window.location.hash.replace('#', '');
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');
            const sortType = sortSelect ? sortSelect.value : 'newest';
            
            let results = [...allProducts];

            const badge = document.getElementById('floatingFilterBadge');
            if (badge) {
                const hasActiveFilters = (hash && hash !== 'all') || searchQuery || document.querySelectorAll('.chip-filter[data-variant].active').length > 0;
                badge.classList.toggle('hidden', !hasActiveFilters);
            }

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                results = results.filter(p => {
                    const name = window.getLoc ? window.getLoc(p, 'name').toLowerCase() : (p.name || '').toLowerCase();
                    return name.includes(q) || (p.id && p.id.toLowerCase().includes(q));
                });
                const titleEl = document.getElementById('catalogMainTitle');
                if (titleEl) titleEl.innerText = `Пошук: "${searchQuery}"`;
            } else if (hash) {
                if (['new', 'sale', 'exclusive'].includes(hash)) {
                    results = results.filter(p => p.badge === hash);
                } else {
                    results = results.filter(p => p.category === hash || p.subcategory === hash);
                }
                const activeBtn = document.querySelector(`[data-filter="${hash}"]`);
                const titleEl = document.getElementById('catalogMainTitle');
                if (titleEl) titleEl.innerText = activeBtn ? activeBtn.innerText : 'Каталог';
            } else {
                const titleEl = document.getElementById('catalogMainTitle');
                if (titleEl) titleEl.innerText = 'Колекція Atelier';
            }

            const activeChips = Array.from(document.querySelectorAll('.chip-filter[data-variant].active')).map(b => b.dataset.variant.toLowerCase());
            if(activeChips.length > 0) {
                results = results.filter(p => p.variant && activeChips.some(v => p.variant.toLowerCase().includes(v)));
            }

            if (sortType === 'price-asc') results.sort((a, b) => (a.price || 0) - (b.price || 0));
            if (sortType === 'price-desc') results.sort((a, b) => (b.price || 0) - (a.price || 0));
            if (sortType === 'newest') results.sort((a, b) => (b.badge === 'new' ? -1 : 1));

            filteredProducts = results;
            renderBatch();
        }

        function renderBatch() {
            if (!grid) return;
            grid.innerHTML = '';
            
            const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
            if (currentPage < 1) currentPage = 1;
            if (currentPage > totalPages) currentPage = totalPages;

            const startIndex = (currentPage - 1) * itemsPerPage;
            const nextBatch = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

            if (nextBatch.length > 0) {
                const html = nextBatch.map(p => window.renderProductCard ? window.renderProductCard(p) : '').join('');
                grid.innerHTML = html;
            }

            const emptyState = document.getElementById('emptyState');
            if (emptyState) emptyState.classList.toggle('hidden', filteredProducts.length > 0);
            grid.classList.toggle('hidden', filteredProducts.length === 0);
            
            if (pagContainer) {
                if (totalPages > 1) {
                    pagContainer.classList.remove('hidden');
                    if (pageIndicator) pageIndicator.innerText = `${currentPage} / ${totalPages}`;
                    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
                    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
                } else {
                    pagContainer.classList.add('hidden');
                }
            }

            const subTitle = document.getElementById('catalogSubTitle');
            if (subTitle) subTitle.innerText = `Знайдено виробів: ${filteredProducts.length}`;
        }

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if(currentPage > 1) { 
                    currentPage--; 
                    renderBatch(); 
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
                if(currentPage < totalPages) { 
                    currentPage++; 
                    renderBatch(); 
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        window.resetFilters = () => {
            window.location.hash = '';
            window.history.pushState({}, '', window.location.pathname);
            document.querySelectorAll('.active[data-filter]').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('[data-filter="all"]').forEach(b => b.classList.add('active'));
            currentPage = 1;
            applyAllFilters();
        };

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                currentPage = 1;
                applyAllFilters();
            });
        }

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'all';
            document.querySelectorAll('.active[data-filter]').forEach(b => b.classList.remove('active'));
            const newActive = document.querySelectorAll(`[data-filter="${hash}"]`);
            newActive.forEach(b => {
                b.classList.add('active');
                let parentDetails = b.closest('details');
                while(parentDetails) {
                    parentDetails.setAttribute('open', '');
                    parentDetails = parentDetails.parentElement.closest('details');
                }
            });
            currentPage = 1;
            applyAllFilters();
        });

        // ІНІЦІАЛІЗАЦІЯ КАТЕГОРІЙ З БД ТА ПЕРШИЙ РЕНДЕР
        await initFilters();
        
        const initialHash = window.location.hash.replace('#', '');
        if(initialHash) {
            setTimeout(() => {
                document.querySelectorAll('.active[data-filter]').forEach(b => b.classList.remove('active'));
                const newActive = document.querySelectorAll(`[data-filter="${initialHash}"]`);
                newActive.forEach(b => {
                    b.classList.add('active');
                    let parentDetails = b.closest('details');
                    while(parentDetails) {
                        parentDetails.setAttribute('open', '');
                        parentDetails = parentDetails.parentElement.closest('details');
                    }
                });
                applyAllFilters();
            }, 100);
        } else {
            applyAllFilters();
        }

        // Re-pull catalog when admin/cloud sync updates products or categories
        window.renderCatalogBatch = function() { applyAllFilters(); };
        const refreshFromSync = (event) => {
            const detail = event?.detail || {};
            const key = detail.key;

            // applyCloudToUI already calls renderCatalogBatch() before this event
            if (detail.source === 'cloud' && key === '*') return;

            clearTimeout(refreshTimer);
            refreshTimer = setTimeout(async () => {
                const categoriesChanged = key === 'bv_categories_flat' || key === 'bv_categories_tree';
                if (categoriesChanged) {
                    try { await initFilters(); } catch (_) {}
                }
                applyAllFilters();
            }, 80);
        };
        window.addEventListener('bv:data-updated', refreshFromSync);
    });

    // Решта ваших слухачів
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof renderHomeCategories === 'function') renderHomeCategories();
        if (typeof renderHomeCategoriesScroll === 'function') renderHomeCategoriesScroll();
    });

    document.addEventListener("DOMContentLoaded", () => {
        const fixGrids = () => {
            const containers = document.querySelectorAll('#dynamicHomeBlocksContainer .grid, #glassAccordion .grid, #dynamicHomeBlocksContainer div[class*="grid-cols-"], #glassAccordion div[class*="grid-cols-"]');
            containers.forEach(el => {
                el.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 w-full";
            });
        };
        fixGrids();
        setTimeout(fixGrids, 500);
        setTimeout(fixGrids, 1500);
    });

    // Ініціалізація кастомного меню фільтрів (якщо воно є на сторінці)
    document.addEventListener('DOMContentLoaded', () => {
        const drawer = document.getElementById('filterDrawer');
        const openBtn = document.getElementById('openFilterBtn');
        const closeBtn = document.getElementById('closeFilterBtn');
        const applyBtn = document.getElementById('applyFilterBtn');
        const resetBtn = document.getElementById('resetFilterBtn');

        openBtn?.addEventListener('click', () => drawer.classList.add('active'));
        closeBtn?.addEventListener('click', () => drawer.classList.remove('active'));

        applyBtn?.addEventListener('click', () => {
            const categoryEl = document.getElementById('filterCategory');
            const maxPriceEl = document.getElementById('filterMaxPrice');
            const category = categoryEl ? categoryEl.value : 'all';
            const maxPrice = maxPriceEl ? parseFloat(maxPriceEl.value) : NaN;

            const allProducts = window.products || [];

            const filtered = allProducts.filter(item => {
                const matchCategory = (category === 'all') || (item.category === category);
                const matchPrice = isNaN(maxPrice) || (parseFloat(item.price || item.price_usd) <= maxPrice);
                return matchCategory && matchPrice;
            });

            if (typeof renderCatalog === 'function') renderCatalog(filtered);
            if (drawer) drawer.classList.remove('active');
        });

        resetBtn?.addEventListener('click', () => {
            const categoryEl = document.getElementById('filterCategory');
            const maxPriceEl = document.getElementById('filterMaxPrice');
            if (categoryEl) categoryEl.value = 'all';
            if (maxPriceEl) maxPriceEl.value = '';
            
            if (typeof renderCatalog === 'function') renderCatalog(window.products || []);
            if (drawer) drawer.classList.remove('active');
        });
    });

    function renderCatalog(items) {
        const container = document.getElementById('catalogGrid');
        if (!container) return;
        if (items.length === 0) {
            container.innerHTML = '<p class="empty-msg">Товары не найдены</p>';
            return;
        }
        container.innerHTML = items.map(product => typeof createProductCard === 'function' ? createProductCard(product) : '').join('');
    }
