import { API } from '../services/storage.js';
import { _supabase } from '../services/supabase.js';
import { flags, sunSVG, moonSVG, formatterPrice, sunIconSvg, moonIconSvg } from '../utils/constants.js';

// ==========================================
// 15. ГАЛЕРЕЯ ТА ІНІЦІАЛІЗАЦІЯ ФІЛЬТРІВ
// ==========================================
window.loadGalleryFromDB = async function() {
    if (!_supabase) return;
    try {
        const { data, error } = await _supabase.from('gallery').select('*');
        if (error) throw error;
        
        window.galleryItems = data;
        API.set('bv_gallery', data);
        console.log("Дані галереї завантажено:", data);
        
        window.renderGalleryGrid(); 
    } catch (err) {
        console.error("Помилка завантаження галереї:", err);
    }
};

window.renderGalleryGrid = function(category = 'all') {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const items = window.galleryItems || API.get('bv_gallery', []); 
    const filtered = items.filter(item => {
        const isPublished = item.is_published === true;
        const matchesCategory = (category === 'all' || item.category === category);
        return isPublished && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="text-gray-500 text-center col-span-full">У цій категорії поки немає товарів.</p>';
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const img = item.image_url || 'placeholder.jpg'; 
        const title = item.title || 'Без назви';

        return `
            <div class="card overflow-hidden rounded-lg shadow-sm border border-gray-100 group">
                <div class="aspect-square overflow-hidden bg-gray-100">
                    <img src="${img}" alt="${title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                </div>
                <div class="p-4 text-center text-gray-800 font-serif">${title}</div> 
            </div>
        `;
    }).join('');
};

window.initGalleryFilters = function() {
    const filterButtons = document.querySelectorAll('.filter-btn'); 
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category'); 
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.renderGalleryGrid(category);
        });
    });
    console.log("Фільтри галереї підключено");
};

// ==========================================
// 16. СТИСНЕННЯ ЗОБРАЖЕНЬ ТА UPLOAD (SUPABASE STORAGE)
// ==========================================
async function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/webp', quality);
            };
        };
    });
}

window.uploadProductPhoto = async function(file) {
    if (!_supabase) {
        alert("Помилка: Supabase не підключено!");
        return null;
    }
    try {
        console.log('Стискаємо фото...');
        const compressedBlob = await window.compressImage(file);
        const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

        console.log('Відправляємо в Supabase Storage (site-images)...');
        const { data, error } = await _supabase.storage
            .from('site-images') 
            .upload(fileName, compressedBlob, {
                contentType: 'image/webp'
            });

        if (error) throw error;

        const { data: publicUrlData } = _supabase.storage
            .from('site-images')
            .getPublicUrl(fileName);

        console.log('Успішно! Посилання на фото:', publicUrlData.publicUrl);
        return publicUrlData.publicUrl;

    } catch (err) {
        console.error('Помилка при завантаженні фото:', err);
        alert('Не вдалося завантажити зображення!');
        return null;
    }
};


document.addEventListener('DOMContentLoaded', () => {
    window.initDynamicMegaMenu();
});

/**
 * Одночасне завантаження bv_categories_tree та bv_categories_flat з site_storage
 */
async function initDynamicMegaMenu() {
    const megaCol1 = document.getElementById('megaCol1');
    const megaCol2 = document.getElementById('megaCol2');
    if (!megaCol1 || !megaCol2) return;

    let categoriesTree = [];
    let categoriesFlat = [];

    // 1. Миттєве відтворення з кешу
    const cachedTree = localStorage.getItem('bv_storage_categories_tree');
    const cachedFlat = localStorage.getItem('bv_storage_categories_flat');
    if (cachedTree) {
        try {
            categoriesTree = JSON.parse(cachedTree);
            categoriesFlat = cachedFlat ? JSON.parse(cachedFlat) : [];
            window.renderMegaMenuUI(categoriesTree, categoriesFlat);
        } catch (e) {
            console.error("Помилка читання кешу меню:", e);
        }
    }

    // 2. Фонове завантаження з Supabase (беремо одразу і дерево, і плоский список)
    if (typeof _supabase !== 'undefined') {
        try {
            const { data, error } = await _supabase
                .from('site_storage')
                .select('key, value')
                .in('key', ['bv_categories_tree', 'bv_categories_flat']);

            if (!error && data) {
                data.forEach(item => {
                    const val = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                    if (item.key === 'bv_categories_tree') categoriesTree = val || [];
                    if (item.key === 'bv_categories_flat') categoriesFlat = val || [];
                });

                // Admin may only have flat updated — rebuild tree for mega-menu
                if ((!categoriesTree || categoriesTree.length === 0) && categoriesFlat.length > 0) {
                    const builder = window.buildCategoriesTree || window.buildTree;
                    if (typeof builder === 'function') {
                        categoriesTree = builder(categoriesFlat);
                    }
                }

                if (categoriesTree.length > 0 || categoriesFlat.length > 0) {
                    localStorage.setItem('bv_storage_categories_tree', JSON.stringify(categoriesTree));
                    localStorage.setItem('bv_storage_categories_flat', JSON.stringify(categoriesFlat));
                    if (window.API) {
                        window.API.set('bv_categories_tree', categoriesTree);
                        window.API.set('bv_categories_flat', categoriesFlat);
                    }
                    window.renderMegaMenuUI(categoriesTree, categoriesFlat);
                }
            }
        } catch (err) {
            console.warn("Помилка завантаження категорій з site_storage:", err);
        }
    }

    // Оновлення при зміні мови
    window.addEventListener('langChanged', () => {
        if (Array.isArray(categoriesTree) && categoriesTree.length > 0) {
            window.renderMegaMenuUI(categoriesTree, categoriesFlat);
        }
    });
}

/**
 * Універсальний помічник для отримання локалізованого тексту
 */
function getLocalizedText(field, lang = 'uk') {
    if (!field) return '';
    if (typeof field === 'object') {
        return field[lang] || field.uk || field.ru || field.en || Object.values(field)[0] || '';
    }
    return String(field);
}

/**
 * Розумний пошук підкатегорій: перевіряє всі можливі назви полів у дереві та плоскому списку
 */
function getSubcategoriesForCategory(cat, categoriesFlat) {
    // Варіант А: Підкатегорії лежать всередині об'єкта категорії (у tree)
    const nested = cat.highlights || cat.subcategories || cat.children || cat.items || cat.sub_categories || cat.list;
    if (Array.isArray(nested) && nested.length > 0) {
        return nested;
    }

    // Варіант Б: Підкатегорії лежать у flat-списку і посилаються на ID родича
    if (Array.isArray(categoriesFlat) && categoriesFlat.length > 0) {
        const catId = cat.id || cat.slug;
        const foundInFlat = categoriesFlat.filter(item => 
            item.parent_id === catId || 
            item.parent === catId || 
            item.category_id === catId ||
            item.parentSlug === catId
        );
        if (foundInFlat.length > 0) return foundInFlat;
    }

    return [];
}

/**
 * Побудова інтерфейсу
 */
function renderMegaMenuUI(categoriesTree, categoriesFlat = []) {
    const megaCol1 = document.getElementById('megaCol1');
    const megaCol2 = document.getElementById('megaCol2');
    if (!megaCol1 || !megaCol2 || !Array.isArray(categoriesTree) || !categoriesTree.length) return;

    const currentLang = localStorage.getItem('bv_lang') || document.documentElement.lang || 'uk';

    // 1. Ліві кнопки (Головні категорії)
    megaCol1.innerHTML = categoriesTree.map((cat, index) => {
        const title = window.getLocalizedText(cat.name || cat.title || cat.label, currentLang) || 'Категорія';
        const catId = cat.id || cat.slug || '';
        const isActive = index === 0 ? 'bg-black/10 dark:bg-white/10 text-[var(--gold-muted)] font-bold shadow-sm' : 'text-[var(--text-main)]';

        return `
            <button type="button" 
                    class="mega-cat-btn w-full text-left px-3 py-2.5 rounded-lg text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--gold-muted)] ${isActive}" 
                    data-index="${index}"
                    onclick="location.href='catalog.html#${catId}'">
                <span class="truncate">${title}</span>
                <svg class="w-3 h-3 flex-shrink-0 opacity-50 transform -rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
        `;
    }).join('');

    // 2. Права колонка (Підкатегорії + Банер)
    const updateCol2 = (catIndex) => {
        const cat = categoriesTree[catIndex];
        if (!cat) return;

        const title = window.getLocalizedText(cat.name || cat.title || cat.label, currentLang) || 'Категорія';
        const catId = cat.id || cat.slug || '';
        
        // Знаходимо підкатегорії через універсальний пошук
        const subItems = window.getSubcategoriesForCategory(cat, categoriesFlat);
        const bannerImg = cat.image || cat.banner_url || cat.img || '';

        // Генеруємо список підкатегорій
        let subLinksHtml = '';
        if (subItems.length > 0) {
            subLinksHtml = subItems.map(sub => {
                // Підтримка як об'єктів {name: "..."}, так і простих рядків "Каблучки з діамантами"
                const subTitle = typeof sub === 'string' 
                    ? sub 
                    : window.getLocalizedText(sub.name || sub.title || sub.label || sub.text || sub, currentLang);
                
                // Формуємо коректне посилання або якір на фільтр
                const subUrl = typeof sub === 'string'
                    ? `catalog.html#${sub}`
                    : (sub.link || sub.url || sub.href || `catalog.html#${sub.slug || sub.id || catId}`);

                return `
                    <a href="${subUrl}" class="text-xs text-[var(--text-muted)] hover:text-[var(--gold-muted)] transition-colors py-1.5 flex items-center gap-2 group/link">
                        <span class="w-1 h-1 rounded-full bg-[var(--border)] group-hover/link:bg-[var(--gold-muted)] transition-colors flex-shrink-0"></span>
                        <span class="truncate">${subTitle || 'Переглянути'}</span>
                    </a>
                `;
            }).join('');
        } else {
            subLinksHtml = `<p class="text-xs text-[var(--text-muted)] font-light col-span-2 py-2">Переглянути всі прикраси у розділі «${title}»</p>`;
        }

        // Рендер вмісту правої частини
        megaCol2.innerHTML = `
            <div class="flex flex-col justify-between h-full animate-fadeIn">
                <div>
                    <div class="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                        <h4 class="font-serif text-base text-[var(--text-main)] tracking-wide">${title}</h4>
                        <a href="catalog.html#${catId}" class="text-[10px] uppercase tracking-widest text-[var(--gold-muted)] hover:underline font-semibold">Всі прикраси &rarr;</a>
                    </div>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                        ${subLinksHtml}
                    </div>
                </div>

                ${bannerImg ? `
                <div class="mt-4 relative rounded-lg overflow-hidden border border-[var(--border)] h-24 group/banner cursor-pointer" onclick="location.href='catalog.html#${catId}'">
                    <img src="${bannerImg}" class="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105" alt="${title}" loading="lazy" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                        <span class="text-white text-[11px] font-medium tracking-wider uppercase font-['Montserrat']">Колекція: ${title}</span>
                    </div>
                </div>` : `
                <div class="mt-4 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--border)] flex items-center justify-between">
                    <span class="text-xs font-serif text-[var(--text-main)]">Ексклюзивні вироби BV Jewelry</span>
                    <a href="catalog.html#${catId}" class="px-3 py-1.5 bg-[var(--gold-muted)] text-[#111] text-[9px] font-bold uppercase tracking-widest rounded hover:opacity-90 transition">Перейти</a>
                </div>`}
            </div>
        `;
    };

    // Відмальовуємо першу категорію за замовчуванням
    updateCol2(0);

    // Додаємо слухачі наведення миші
    const buttons = megaCol1.querySelectorAll('.mega-cat-btn');
    buttons.forEach((btn, idx) => {
        btn.addEventListener('mouseenter', () => {
            buttons.forEach(b => b.className = b.className.replace('bg-black/10 dark:bg-white/10 text-[var(--gold-muted)] font-bold shadow-sm', 'text-[var(--text-main)]'));
            btn.className = btn.className.replace('text-[var(--text-main)]', 'bg-black/10 dark:bg-white/10 text-[var(--gold-muted)] font-bold shadow-sm');
            updateCol2(idx);
        });
    });
}



document.addEventListener('DOMContentLoaded', () => {
    window.initDynamicGallery();
});

/**
 * Динамическая галерея BV Jewelry с максимальной оптимизацией
 */
async function initDynamicGallery() {
    // Ищем контейнер галереи по ID или стандартным классам
    const galleryContainer = document.getElementById('galleryGrid') || document.querySelector('.gallery-grid') || document.querySelector('#gallery');
    if (!galleryContainer) return;

    let galleryData = [];

    // 1. МИГНОВЕННЫЙ РЕНДЕР ИЗ КЕША (Без ожидания ответа сервера)
    const cached = localStorage.getItem('bv_storage_gallery');
    if (cached) {
        try {
            galleryData = JSON.parse(cached);
            window.renderGalleryUI(galleryContainer, galleryData);
        } catch (e) {
            console.error("Ошибка чтения кеша галереи:", e);
        }
    }

    // 2. ФОНОВАЯ ЗАГРУЗКА АКТУАЛЬНЫХ ФОТО ИЗ SUPABASE
    if (typeof _supabase !== 'undefined') {
        try {
            // Приоритет 1: Ищем в site_storage (ключ: bv_gallery)
            const { data, error } = await _supabase
                .from('site_storage')
                .select('value')
                .eq('key', 'bv_gallery')
                .single();

            if (!error && data && data.value) {
                galleryData = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            } else {
                // Приоритет 2 (Фоллбек): Если в site_storage пусто, проверяем отдельную таблицу 'gallery'
                const { data: tableData, error: tableError } = await _supabase
                    .from('gallery')
                    .select('*')
                    .order('id', { ascending: false });

                if (!tableError && tableData) {
                    galleryData = tableData;
                }
            }

            // Если данные получены и они отличаются от кеша — перерисовываем и сохраняем
            if (Array.isArray(galleryData) && galleryData.length > 0) {
                localStorage.setItem('bv_storage_gallery', JSON.stringify(galleryData));
                window.renderGalleryUI(galleryContainer, galleryData);
            }
        } catch (err) {
            console.warn("Не удалось обновить галерею из Supabase:", err);
        }
    }

    // Инициализируем один глобальный слушатель для открытия фото во весь экран
    window.initGalleryLightbox(galleryContainer);
}

/**
 * Оптимизированный рендер через DocumentFragment
 */
function renderGalleryUI(container, items) {
    if (!container || !Array.isArray(items) || !items.length) return;

    // Очищаем контейнер перед вставкой
    container.innerHTML = '';

    // Создаем виртуальный фрагмент (в DOM добавляется только 1 раз в самом конце!)
    const fragment = document.createDocumentFragment();

    items.forEach((item, idx) => {
        // Поддерживаем разные форматы именования в БД (img, image, url, src)
        const imgSrc = item.img || item.image || item.url || item.src || '';
        if (!imgSrc) return;

        const title = item.title || item.name || item.alt || 'BV Jewelry Atelier';

        const card = document.createElement('div');
        card.className = 'gallery-item group relative overflow-hidden rounded-xl bg-black/20 border border-[var(--border,rgba(255,255,255,0.08))] cursor-pointer aspect-square shadow-lg transition-all duration-500 hover:border-[var(--gold-muted,#D4AF37)]';
        card.setAttribute('data-img', imgSrc);
        card.setAttribute('data-title', title);

        card.innerHTML = `
            <img src="${imgSrc}" 
                 alt="${title}" 
                 loading="lazy" 
                 decoding="async" 
                 class="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-110 select-none" />
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                <span class="text-[var(--gold-muted,#D4AF37)] text-[10px] uppercase tracking-widest font-semibold mb-0.5 font-['Montserrat']">BV Atelier</span>
                <p class="text-white text-xs font-serif truncate">${title}</p>
            </div>
            
            <div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
            </div>
        `;

        fragment.appendChild(card);
    });

    // Единоразовая вставка готового фрагмента в реальный DOM
    container.appendChild(fragment);
}

/**
 * Делегированное управление Lightbox (просмотр фото без нагрузки на память)
 */
function initGalleryLightbox(container) {
    // Проверяем, не повесили ли мы уже слушатель
    if (container.dataset.lightboxInit) return;
    container.dataset.lightboxInit = 'true';

    container.addEventListener('click', (e) => {
        const card = e.target.closest('.gallery-item');
        if (!card) return;

        const imgSrc = card.getAttribute('data-img');
        const title = card.getAttribute('data-title');
        if (imgSrc) window.openLightboxModal(imgSrc, title);
    });
}

/**
 * Генерация и показ модального окна просмотра
 */
function openLightboxModal(imgSrc, title) {
    // Удаляем старое модальное окно, если есть
    const existing = document.getElementById('bv-lightbox');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'bv-lightbox';
    modal.className = 'fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 opacity-0 transition-opacity duration-300 select-none';
    
    modal.innerHTML = `
        <button type="button" class="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div class="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center relative transform scale-95 transition-transform duration-300">
            <img src="${imgSrc}" alt="${title}" class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/10" />
            ${title && title !== 'BV Jewelry Atelier' ? `<p class="text-white/80 text-sm font-serif mt-4 text-center tracking-wide">${title}</p>` : ''}
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Блокируем скролл сайта

    // Плавное появление
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    });

    // Закрытие по клику на фон, крестик или клавишу ESC
    const closeModal = () => {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('button')) closeModal();
    });

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            window.removeEventListener('keydown', escHandler);
        }
    };
    window.addEventListener('keydown', escHandler);
}

// Classic-script global mirror
window.compressImage = compressImage;
window.getLocalizedText = getLocalizedText;
window.getSubcategoriesForCategory = getSubcategoriesForCategory;
window.initDynamicGallery = initDynamicGallery;
window.initDynamicMegaMenu = initDynamicMegaMenu;
window.initGalleryLightbox = initGalleryLightbox;
window.openLightboxModal = openLightboxModal;
window.renderGalleryUI = renderGalleryUI;
window.renderMegaMenuUI = renderMegaMenuUI;
