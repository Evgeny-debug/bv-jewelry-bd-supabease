// ==========================================
// 0. ІНІЦІАЛІЗАЦІЯ БАЗИ ДАНИХ (SUPABASE)
// ==========================================
const supabaseUrl = 'https://trcjsnvcdonlzxprgdzd.supabase.co'; 
const supabaseKey = 'sb_publishable_qSUZxk_9JV9wJNrdjAqeLA_8O_8-TVV'; 
const _supabase = typeof supabase !== 'undefined' ? supabase.createClient(supabaseUrl, supabaseKey) : null;

if (_supabase) {
    console.log("BV Jewelry: Підключення до хмари Supabase встановлено.");
} else {
    console.warn("BV Jewelry: Supabase SDK не знайдено. Працюємо в офлайн/локальному режимі.");
}

// ==========================================
// 1. API ФАСАД (ЛОКАЛЬНИЙ КЕШ)
// ==========================================
const API = {
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
// ==========================================
// 12. ГЛОБАЛЬНИЙ UI ТА НАВІГАЦІЯ
// ==========================================
window.toggleMenu = function() {
    const burger = document.getElementById('burger');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    if(burger) burger.classList.toggle('open');
    if(sideMenu) sideMenu.classList.toggle('active');
    if(overlay) overlay.classList.toggle('active');
    document.body.style.overflow = (sideMenu && sideMenu.classList.contains('active')) ? 'hidden' : 'auto';
    const searchBox = document.getElementById('mobSearchContainer');
    if(searchBox && !searchBox.classList.contains('hidden')) window.toggleMobileSearch(true);
};

window.toggleAccordion = function(listId, arrowId) {
    const list = document.getElementById(listId);
    const arrow = document.getElementById(arrowId);
    if (!list) return;

    const isOpening = !list.classList.contains('open');

    if (isOpening && list.classList.contains('mob-accordion-list')) {
        const openMainLists = document.querySelectorAll('.mob-accordion-list.open');
        openMainLists.forEach(ol => {
            if (ol !== list) {
                ol.classList.remove('open');
                const title = ol.previousElementSibling;
                if (title) {
                    const siblingArrow = title.querySelector('svg');
                    if (siblingArrow) siblingArrow.style.transform = 'rotate(0deg)';
                }
            }
        });
    }

    list.classList.toggle('open');
    if (arrow) arrow.style.transform = list.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
};

window.toggleTheme = function() {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    API.set('bv_theme', newTheme);
    const svg = newTheme === 'light' ? sunSVG : moonSVG;
    const icon = document.getElementById('themeIcon');
    const iconMob = document.getElementById('themeIconMob');
    if(icon) icon.innerHTML = svg;
    if(iconMob) iconMob.innerHTML = svg;
};

window.changeLang = function(lang) {
    const displayLang = lang === 'uk' ? 'UA' : lang.toUpperCase();
    ['currentFlag', 'currentFlagMob'].forEach(id => { const el = document.getElementById(id); if(el) el.src = `https://flagcdn.com/${flags[lang]}.svg`; });
    ['currentLangLabel', 'currentLangLabelMob'].forEach(id => { const el = document.getElementById(id); if(el) el.innerText = displayLang; });
    document.querySelectorAll('[data-i18n]').forEach(el => el.innerHTML = i18n[lang][el.dataset.i18n] || el.innerHTML);
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = i18n[lang][el.dataset.i18nPlaceholder] || el.placeholder);
    API.set('bv_lang', lang);
    window.renderCart();
    window.renderFavDrawer();
    
    if(document.getElementById('dynamicHomeBlocksContainer') && typeof renderHomeSections === 'function') renderHomeSections();
    if(typeof window.renderCatalogBatch === 'function') window.renderCatalogBatch(); 
    if(document.getElementById('productContainer') && typeof renderProductPage === 'function') renderProductPage();
    
    const mobLangList = document.getElementById('mobLangList');
    if(mobLangList && mobLangList.classList.contains('open')) window.toggleAccordion('mobLangList', 'mobLangArrow');
};

// НОВА ФУНКЦІЯ: Глобальне створення модалки авторизації
window.injectAuthModal = function() {
    if (document.getElementById('authModal')) return; // Вже існує

    const modalHtml = `
    <div id="authModal" class="fixed inset-0 bg-black/80 z-[6000] hidden opacity-0 transition-opacity flex items-center justify-center p-4 backdrop-blur-md" aria-modal="true" role="dialog">
        <div class="glass-panel p-8 w-full max-w-sm relative rounded-none shadow-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
            <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--danger)] text-3xl leading-none transition-colors z-10">&times;</button>
            <div id="authFormContainer">
                <h3 id="authTitle" class="text-2xl font-serif text-[var(--text-main)] mb-1 text-center" data-i18n="login">Вхід</h3>
                <p id="authSubtitle" class="text-center text-[var(--text-muted)] text-xs mb-6 font-light">Раді бачити вас знову</p>
                <form id="authForm" class="flex flex-col gap-3">
                    <div id="nameFieldContainer" class="hidden flex-col gap-1.5">
                        <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--gold-muted)] ml-1">Ваше ім'я</label>
                        <input type="text" id="authName" placeholder="Олена" class="auth-input outline-none border border-[var(--border)] bg-[rgba(255,255,255,0.03)] focus:border-[var(--gold-muted)] rounded-none px-4 py-3 text-sm text-[var(--text-main)] transition-colors w-full">
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--gold-muted)] ml-1">Email</label>
                        <input type="email" id="authUser" placeholder="mail@example.com" class="auth-input outline-none border border-[var(--border)] bg-[rgba(255,255,255,0.03)] focus:border-[var(--gold-muted)] rounded-none px-4 py-3 text-sm text-[var(--text-main)] transition-colors w-full" required>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--gold-muted)] ml-1">Пароль</label>
                        <input type="password" id="authPass" placeholder="Мінімум 6 символів" class="auth-input outline-none border border-[var(--border)] bg-[rgba(255,255,255,0.03)] focus:border-[var(--gold-muted)] rounded-none px-4 py-3 text-sm text-[var(--text-main)] transition-colors w-full" required>
                    </div>
                    <button type="submit" class="btn-solid py-3.5 rounded-none font-bold uppercase tracking-widest text-[11px] hover:opacity-90 transition-opacity active:scale-95 shadow-md mt-2" id="authSubmitBtn" data-i18n="login">Увійти</button>
                    
                    <div class="mt-4 flex flex-col gap-2.5">
                        <div class="relative flex py-2 items-center">
                            <div class="flex-grow border-t border-[var(--border)]"></div>
                            <span class="flex-shrink-0 mx-4 text-[var(--text-muted)] text-[10px] uppercase tracking-widest">Або</span>
                            <div class="flex-grow border-t border-[var(--border)]"></div>
                        </div>
                        
                        <button type="button" onclick="window.loginWithGoogle()" class="w-full flex items-center justify-center gap-3 border border-[var(--border)] bg-white/5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-main)] hover:border-[var(--gold-muted)] hover:bg-white/10 transition-all active:scale-95 rounded-none">
                            <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2 6.42 2 12c0 5.59 4.39 10 10.1 10 5.92 0 10.28-4.61 10.28-10.4 0-.83-.07-1.39-.07-1.39z"/></svg>
                            Увійти через Google
                        </button>
                        
                        <button type="button" onclick="window.loginWithApple()" class="w-full flex items-center justify-center gap-3 border border-[var(--border)] bg-white/5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-main)] hover:border-[var(--gold-muted)] hover:bg-white/10 transition-all active:scale-95 rounded-none">
                            <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.85 3.73-.7 1.13.1 2.25.69 2.94 1.7-2.64 1.63-2.15 5.04.51 6.13-.67 1.84-1.63 3.75-2.26 5.04zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                            Увійти через Apple
                        </button>
                    </div>

                    <div class="text-center text-xs text-[var(--text-muted)] mt-4">
                        <span id="authToggleText">Немає акаунта?</span> 
                        <button type="button" onclick="toggleAuthMode(event)" class="text-[var(--gold-muted)] font-bold hover:underline ml-1" id="authToggleLink">Зареєструватися</button>
                    </div>
                </form>
            </div>
            
            <div id="profileView" class="hidden flex-col gap-4">
                <h3 class="text-2xl font-serif text-[var(--text-main)] mb-1 text-center" data-i18n="login_mob_title">Кабінет</h3>
                <div class="flex flex-col items-center justify-center p-5 bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-none mb-1 relative overflow-hidden group">
                    <div class="w-16 h-16 bg-[var(--gold-muted)] text-[#111] rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-md mb-3 relative z-10" id="profAvatar">A</div>
                    <p class="text-center text-[var(--text-main)] font-semibold text-lg relative z-10" id="profName">User</p>
                    <p class="text-center text-[var(--text-muted)] text-[11px] mt-1 relative z-10" id="profEmail">user@mail.com</p>
                </div>
                <div class="flex flex-col gap-2">
                    <button onclick="location.href='admin.html'" id="adminLinkBtn" class="hidden w-full border border-[var(--gold-muted)] text-[var(--gold-muted)] py-3 rounded-none font-bold uppercase tracking-widest text-[10px] hover:bg-[var(--gold-muted)] hover:text-[#111] transition-colors active:scale-95 text-center">Панель Адміністратора</button>
                    <button onclick="location.href='profile.html'" id="clientLinkBtn" class="btn-solid py-3 rounded-none font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity active:scale-95 w-full">Мої замовлення</button>
                    <button onclick="window.logoutUser()" class="w-full py-3 rounded-none border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold active:scale-95 bg-transparent mt-1">Вийти з акаунту</button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.injectGlobalUI = function() {
    window.injectAuthModal(); // Створюємо модалку глобально
    if (!document.getElementById('scrollToTopBtn')) {
        document.body.insertAdjacentHTML('beforeend', `<button id="scrollToTopBtn" onclick="window.scrollTo({top:0, behavior:'smooth'})" aria-label="Вверх" class="btn-cross fixed bottom-[165px] left-4 z-[4800] w-12 h-12 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border)] rounded-none flex items-center justify-center text-[var(--gold-muted)] shadow-[0_5px_20px_rgba(0,0,0,0.3)] opacity-0 translate-y-4 pointer-events-none transition-all duration-300 active:scale-95 md:bottom-10 md:left-10 hover:bg-[var(--gold-muted)] hover:text-[var(--bg-body)]"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg></button>`);
    }
};

window.toggleAccordionPanel = function(clickedPanel) {
    const allPanels = document.querySelectorAll('.glass-panel-item');
    if (clickedPanel.classList.contains('active')) return;
    allPanels.forEach(panel => panel.classList.remove('active'));
    clickedPanel.classList.add('active');
};
// ==========================================
// 2. БАЗОВІ ДАНІ ТА ЛОКАЛІЗАЦІЯ
// ==========================================
const i18n = {
    uk: { 
        m1: "Головна", m2: "Каталог", m3: "Бренд", m4: "Контакти", m_price: "Прайс", m_atelier: "Ексклюзив",
        menu_all: "Всі товари", menu_for_whom: "Для кого", menu_metal: "За металом",
        cart_title: "Кошик", cart_subtotal: "Підсумок:", cart_checkout: "Оформити замовлення", cart_empty: "Ваш кошик порожній",
        fav_title: "Улюблене", fav_empty: "Список порожній",
        in_stock: "В наявності", out_stock: "Немає", pre_order: "Під замовлення",
        badge_new: "Новинка", badge_exclusive: "Ексклюзив", badge_sale: "Sale", badge_sold_out: "Продано", badge_pre_order: "Під замовлення",
        btn_buy: "Купити", btn_details: "Детальніше", btn_send: "Надіслати",
        similar: "Також рекомендуємо", desc_title: "Опис виробу", pd_nav_specs: "Характеристики", pd_nav_review: "Відгуки", pd_nav_all: "Усе про товар", pd_nav_photo: "Фото", pd_nav_ask: "Задати питання",
        cat_filters: "Фільтри", cat_sort: "Сортування", cat_sort_new: "Спочатку нові", cat_sort_cheap: "Від дешевих до дорогих", cat_sort_exp: "Від дорогих до дешевих", cat_load_more: "Показати ще", cat_reset: "Скинути", cat_empty: "Товарів не знайдено",
        search_ph: "Пошук...", login: "Увійти", register: "Зареєструватися", login_mob_title: "КАБІНЕТ", theme_mob: "Змінити тему", lang_title: "МОВА",
        footer_rights: "Всі права захищені.", footer_dev: "Розроблено",
        exc_title: "Створення ексклюзиву", exc_step: "Етап", exc_order: "Замовити прорахунок"
    },
    ru: { 
        m1: "Главная", m2: "Каталог", m3: "Бренд", m4: "Контакты", m_price: "Прайс", m_atelier: "Эксклюзив",
        menu_all: "Все товары", menu_for_whom: "Для кого", menu_metal: "По металлу",
        cart_title: "Корзина", cart_subtotal: "Итог:", cart_checkout: "Оформить заказ", cart_empty: "Ваша корзина пуста",
        fav_title: "Избранное", fav_empty: "Список пуст",
        in_stock: "В наличии", out_stock: "Нет в наличии", pre_order: "Под заказ",
        badge_new: "Новинка", badge_exclusive: "Эксклюзив", badge_sale: "Sale", badge_sold_out: "Продано", badge_pre_order: "Под заказ",
        btn_buy: "Купить", btn_details: "Подробнее", btn_send: "Отправить",
        similar: "Также рекомендуем", desc_title: "Описание изделия", pd_nav_specs: "Характеристики", pd_nav_review: "Отзывы", pd_nav_all: "Всё о товаре", pd_nav_photo: "Фото", pd_nav_ask: "Задать вопрос",
        cat_filters: "Фильтры", cat_sort: "Сортировка", cat_sort_new: "Сначала новые", cat_sort_cheap: "От дешевых к дорогим", cat_sort_exp: "От дорогих к дешевым", cat_load_more: "Показать еще", cat_reset: "Сбросить", cat_empty: "Товары не найдены",
        search_ph: "Поиск...", login: "Войти", register: "Регистрация", login_mob_title: "КАБИНЕТ", theme_mob: "Сменить тему", lang_title: "ЯЗЫК",
        footer_rights: "Все права защищены.", footer_dev: "Разработано",
        exc_title: "Создание эксклюзива", exc_step: "Этап", exc_order: "Заказать просчет"
    },
    en: { 
        m1: "Home", m2: "Catalog", m3: "Brand", m4: "Contacts", m_price: "Price", m_atelier: "Exclusive",
        menu_all: "All products", menu_for_whom: "For whom", menu_metal: "By metal",
        cart_title: "Cart", cart_subtotal: "Subtotal:", cart_checkout: "Checkout", cart_empty: "Your cart is empty",
        fav_title: "Favorites", fav_empty: "List is empty",
        in_stock: "In stock", out_stock: "Out of stock", pre_order: "Pre-order",
        badge_new: "New", badge_exclusive: "Exclusive", badge_sale: "Sale", badge_sold_out: "Sold Out", badge_pre_order: "Pre-order",
        btn_buy: "Buy", btn_details: "Details", btn_send: "Send",
        similar: "You might also like", desc_title: "Description", pd_nav_specs: "Specifications", pd_nav_review: "Reviews", pd_nav_all: "About Product", pd_nav_photo: "Photos", pd_nav_ask: "Ask a Question",
        cat_filters: "Filters", cat_sort: "Sort by", cat_sort_new: "Newest first", cat_sort_cheap: "Price: Low to High", cat_sort_exp: "Price: High to Low", cat_load_more: "Load more", cat_reset: "Reset", cat_empty: "No products found",
        search_ph: "Search...", login: "Log in", register: "Register", login_mob_title: "PROFILE", theme_mob: "Change Theme", lang_title: "LANGUAGE",
        footer_rights: "All rights reserved.", footer_dev: "Developed by",
        exc_title: "Exclusive Creation", exc_step: "Step", exc_order: "Request Quote"
    }
};

window.getLoc = function(obj, field) {
    if (!obj) return '';
    const lang = API.get('bv_lang', 'uk');
    
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') {
        if (field) {
            if (typeof obj[field] === 'object' && obj[field] !== null) {
                return obj[field][lang] || obj[field]['uk'] || '';
            }
            if (lang === 'uk') return obj[field] || '';
            const locField = field + lang.toUpperCase(); 
            return obj[locField] || obj[field] || ''; 
        } else {
            return obj[lang] || obj['uk'] || '';
        }
    }
    return '';
};

const flags = { uk: "ua", en: "gb", ru: "ru", bg: "bg" };
const sunSVG = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
const moonSVG = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`;
const formatterPrice = new Intl.NumberFormat('uk-UA', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 });

let categoriesTree = [];
let products = [];

function migrateProductToNewFormat(p) {
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

function buildTree(flatList) {
    let tree = [];
    let lookup = {};
    flatList.forEach(c => lookup[c.id] = { ...c, subcategories: [] });
    flatList.forEach(c => {
        if (c.parentId && lookup[c.parentId]) lookup[c.parentId].subcategories.push(lookup[c.id]);
        else tree.push(lookup[c.id]);
    });
    return tree;
}

// ==========================================
// 3. БАЗА ДАНИХ ТА СИНХРОНІЗАЦІЯ (SUPABASE)
// ==========================================

// Завантаження даних з хмари при старті
window.loadCloudData = async function() {
    if (!navigator.onLine || !_supabase) {
        console.warn('Supabase не підключено або відсутній інтернет. Працюємо з локальними даними.');
        products = API.get('bv_products', []);
        window.products = products;
        if(typeof window.generateMenus === 'function') window.generateMenus();
        if(typeof window.renderHomeSections === 'function') window.renderHomeSections();
        return;
    }
    
    try {
        const { data, error } = await _supabase.from('products').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
            products = data;            
            window.products = data;     
            API.set('bv_products', data); 
        }
        
        if(typeof window.generateMenus === 'function') window.generateMenus();
        if(typeof window.renderHomeSections === 'function') window.renderHomeSections();
        
    } catch (err) {
        console.error('Помилка завантаження даних з Supabase:', err);
        products = API.get('bv_products', []);
        window.products = products;
        if(typeof window.generateMenus === 'function') window.generateMenus();
    }
};

// Збереження/Оновлення товару
window.saveProductToDB = async function(productData) {
    if (!_supabase) {
        alert('Помилка: Supabase не підключено');
        return null;
    }
    try {
        const { data, error } = await _supabase.from('products').upsert([productData]).select();
        if (error) throw error;
        
        const currentProducts = window.products || [];
        const index = currentProducts.findIndex(p => p.id === productData.id);
        
        if (index > -1) {
            currentProducts[index] = data[0];
        } else {
            currentProducts.push(data[0]);
        }
        window.products = currentProducts;
        API.set('bv_products', currentProducts);
        
        alert('Товар успішно збережено в Supabase!');
        return data[0];
    } catch (err) {
        console.error('Помилка збереження товару:', err);
        alert('Помилка збереження. Деталі в консолі.');
        return null;
    }
};

// Видалення товару
window.deleteProductFromDB = async function(productId) {
    if (!_supabase) return false;
    try {
        const { error } = await _supabase.from('products').delete().eq('id', productId);
        if (error) throw error;
        
        window.products = (window.products || []).filter(p => p.id !== productId);
        API.set('bv_products', window.products);
        
        alert('Товар успішно видалено з бази');
        return true;
    } catch (err) {
        console.error('Помилка видалення товару:', err);
        alert('Помилка видалення. Деталі в консолі.');
        return false;
    }
};

// ==========================================
// 4. СТАН ТА СИНХРОНІЗАЦІЯ
// ==========================================
function getCurrentUser() { return API.get('bv_current_user', null); }
function getScopedStorageKey(baseKey) {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.username) return baseKey;
    return `${baseKey}_${currentUser.username.toLowerCase()}`;
}

function migrateScopedState() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.username) return;
    const userCartKey = getScopedStorageKey('bv_cart');
    const globalCart = API.get('bv_cart', null);
    if (!API.get(userCartKey, null) && Array.isArray(globalCart)) API.set(userCartKey, globalCart);
}

function getFavs() {
    const currentUser = getCurrentUser();
    if (currentUser && Array.isArray(currentUser.favs)) { 
        API.set(getScopedStorageKey('bv_favs'), currentUser.favs); 
        return currentUser.favs;
    }
    return API.get(getScopedStorageKey('bv_favs'), []);
}

window.setFavs = async function(favs) {
    API.set(getScopedStorageKey('bv_favs'), favs);
    API.set('bv_favs', favs);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id && _supabase) {
        currentUser.favs = favs; 
        API.set('bv_current_user', currentUser);
        await _supabase.from('profiles').update({ favs: favs }).eq('id', currentUser.id);
    }
};

function getCart() { return API.get(getScopedStorageKey('bv_cart'), []); }
function setCart(cart) { API.set(getScopedStorageKey('bv_cart'), cart); API.set('bv_cart', cart); }

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getCategoryIconSVG(catId) {
    const id = catId.toLowerCase();
    if (id.includes('gold')) return `<path stroke-linecap="round" stroke-linejoin="round" d="M6 3h12l4 6-10 13L2 9Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M11 3 8 9l4 13"/><path stroke-linecap="round" stroke-linejoin="round" d="M13 3l3 6-4 13"/>`; 
    if (id.includes('silver')) return `<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    if (id.includes('ring')) return `<circle cx="12" cy="14" r="5" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 9l-2-3h4l-2 3z"/>`; 
    if (id.includes('earring')) return `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v9"/><circle cx="12" cy="16" r="3" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 4h6"/>`; 
    if (id.includes('chain') || id.includes('neck')) return `<circle cx="8" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M11 12h2"/>`; 
    if (id.includes('bracelet')) return `<ellipse cx="12" cy="12" rx="7" ry="3" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 12v2c0 2 3 7 3s7-1 7-3v-2"/>`; 
    return `<circle cx="12" cy="12" r="4" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 20v2"/>`; 
}

// ДИНАМІЧНА ГЕНЕРАЦІЯ МЕНЮ З ДЕРЕВА
function generateMenus() {
    const megaCol1 = document.getElementById('megaCol1');
    const megaMenu = document.querySelector('.mega-menu');
    const sideMenu = document.getElementById('sideMenu');
    
    const buildMobileTree = (nodes) => {
        let html = '';
        nodes.forEach(n => {
            const name = window.getLoc(n.name);
            if (n.subcategories && n.subcategories.length > 0) {
                html += `
                <div class="mob-nested-wrap">
                    <div class="mob-nested-title" onclick="window.toggleAccordion('mob-sub-${n.id}', 'mob-arrow-${n.id}')">
                        <div class="flex items-center gap-3">
                            <span style="font-size: 14px; font-weight: 500;">${name}</span>
                        </div>
                        <svg id="mob-arrow-${n.id}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="transition-transform duration-300"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                    <div class="mob-nested-list" id="mob-sub-${n.id}">
                        ${buildMobileTree(n.subcategories)}
                        <a href="catalog.html#${n.id}" class="mob-all-btn mt-2" onclick="window.toggleMenu()">Всі товари: ${name} →</a>
                    </div>
                </div>`;
            } else {
                html += `<a href="catalog.html#${n.id}" class="mob-tag py-2" onclick="window.toggleMenu()">${name}</a>`;
            }
        });
        return html;
    };

    if(megaCol1 && categoriesTree.length > 0) {
        megaCol1.innerHTML = '';
        if(megaMenu) megaMenu.querySelectorAll('.mega-col-2').forEach(col => col.remove());

        categoriesTree.forEach((cat, index) => {
            const isActive = index === 0 ? 'active' : ''; 
            const svgIcon = getCategoryIconSVG(cat.id);
            const catName = window.getLoc(cat.name);
            
            megaCol1.innerHTML += `<div class="mega-cat-item ${isActive}" data-target="mc-${cat.id}"><svg class="mega-cat-icon" viewBox="0 0 24 24">${svgIcon}</svg><span>${catName}</span></div>`;

            let groupsHtml = '<div class="zlato-groups-grid">';
            if (cat.subcategories && cat.subcategories.length > 0) {
                cat.subcategories.forEach(sub => {
                    groupsHtml += `<div class="zlato-group-wrapper">`;
                    groupsHtml += `<a href="catalog.html#${sub.id}" class="zlato-group-title">${window.getLoc(sub.name)}</a>`;
                    
                    if (sub.subcategories && sub.subcategories.length > 0) {
                        groupsHtml += `<div class="zlato-tags-container">`;
                        sub.subcategories.forEach(subsub => { 
                            groupsHtml += `<a href="catalog.html#${subsub.id}" class="zlato-tag">${window.getLoc(subsub.name)}</a>`; 
                        });
                        groupsHtml += `</div>`;
                    }
                    groupsHtml += `</div>`;
                });
            }
            groupsHtml += '</div>';

            if(megaMenu) {
                const newCol2 = document.createElement('div');
                newCol2.className = `mega-col-2 zlato-content ${isActive}`;
                newCol2.id = `mc-${cat.id}`;
                newCol2.innerHTML = `
                    <div class="flex items-center gap-3 mb-6">
                        <h2 class="text-3xl font-serif text-[var(--text-main)]">${catName}</h2>
                        <a href="catalog.html#${cat.id}" class="text-[12px] uppercase tracking-widest text-[var(--gold-muted)] font-bold transition-colors">Всі →</a>
                    </div>
                    ${groupsHtml}
                `;
                megaMenu.appendChild(newCol2);
            }
        });

        megaCol1.innerHTML += `<a href="exclusive.html" class="mega-atelier-btn mt-auto mx-4 mb-4 border border-[var(--gold-muted)] text-[var(--gold-muted)] p-3 rounded-none flex items-center justify-center gap-2 hover:bg-[var(--gold-muted)] hover:text-[#111] transition-colors font-bold uppercase tracking-widest text-[10px]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7-7-7M5 12h14"/></svg><span data-i18n="m_atelier">Ексклюзив</span></a>`;
        
        document.querySelectorAll('.mega-cat-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                document.querySelectorAll('.mega-cat-item').forEach(i => i.classList.remove('active'));
                document.querySelectorAll('.zlato-content').forEach(p => p.classList.remove('active'));
                item.classList.add('active');
                const targetId = item.getAttribute('data-target').replace('mc-', '');
                const targetCol = document.getElementById('mc-' + targetId);
                if(targetCol) targetCol.classList.add('active');
            });
        });
    }

    if(sideMenu) {
        let mobCatHtml = buildMobileTree(categoriesTree);
        const savedLang = API.get('bv_lang', 'uk');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const currentThemeIcon = currentTheme === 'light' ? sunSVG : moonSVG;

        sideMenu.innerHTML = `
            <div class="flex justify-between items-center pb-4 mb-4 border-b border-[var(--border)] pt-4 px-4">
                <a href="index.html" class="flex flex-col items-start gap-1" style="text-decoration:none;">
                    <span class="text-3xl font-serif text-[var(--gold-muted)] leading-none">BV</span>
                </a>
                <div class="flex items-center gap-5">
                    <button onclick="window.toggleTheme()" class="text-[var(--text-main)] opacity-80 hover:opacity-100 transition-opacity">
                        <svg id="themeIconMob" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${currentThemeIcon}</svg>
                    </button>
                    <div class="text-[11px] font-bold text-[var(--text-main)] flex gap-1.5 uppercase opacity-80">
                        <span class="cursor-pointer ${savedLang==='uk'?'text-[var(--gold-muted)]':''}" onclick="window.changeLang('uk')">UK</span>
                        <span class="opacity-30">|</span>
                        <span class="cursor-pointer ${savedLang==='ru'?'text-[var(--gold-muted)]':''}" onclick="window.changeLang('ru')">RU</span>
                        <span class="opacity-30">|</span>
                        <span class="cursor-pointer ${savedLang==='en'?'text-[var(--gold-muted)]':''}" onclick="window.changeLang('en')">EN</span>
                    </div>
                    <button onclick="window.smartProfileClick()" class="text-[var(--text-main)] opacity-80 hover:opacity-100 transition-opacity">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </button>
                </div>
            </div>

            <div class="px-4 pb-6 flex flex-col flex-grow overflow-y-auto custom-scrollbar">
                <a href="index.html" class="mob-menu-title break-normal" onclick="window.toggleMenu()">Головна</a>
                <div>
                    <div class="mob-menu-title cursor-pointer flex justify-between items-center" onclick="window.toggleAccordion('mobCatList', 'mobCatArrow')">
                        <span data-i18n="m2">Каталог</span>
                        <svg id="mobCatArrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-muted)" stroke-width="2" class="transition-transform duration-300"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                    <div class="mob-accordion-list flex flex-col" id="mobCatList" style="gap: 5px; padding-left: 10px;">
                        <a href="catalog.html#" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Всі товари</a>
                        <a href="catalog.html#gold" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Золото</a>
                        <a href="catalog.html#gold" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Срібло</a>
                        <a href="catalog.html#rings" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Каблучки</a>
                        <a href="catalog.html#earrings" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Сережки</a>
                        <a href="catalog.html#necklaces" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Кольє та Ланцюжки</a>
                        <a href="catalog.html#bracelets" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Браслети</a>
                    </div>
                </div>
                <a href="gallery.html" class="mob-menu-title border-b border-[var(--border)] break-normal" onclick="window.toggleMenu()">Галерея</a>
                <div>
                    <div class="mob-menu-title cursor-pointer flex justify-between items-center" onclick="window.toggleAccordion('mobInfoList', 'mobInfoArrow')">
                        <span>Бренд</span>
                        <svg id="mobInfoArrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform duration-300"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                    <div class="mob-accordion-list flex flex-col" id="mobInfoList" style="gap: 5px; padding-left: 10px;">
                        <a href="info.html?p=about" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Про нас</a>
                        <a href="info.html?p=warranty" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Гарантія та повернення</a>
                        <a href="info.html?p=terms" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Оплата і доставка</a>
                        <a href="info.html?p=faq" class="sub-cat-link break-normal py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Часті питання</a>
                    </div>
                </div>
                <a href="services.html" class="mob-menu-title break-normal" onclick="window.toggleMenu()"><span data-i18n="m_price">Наші послуги</span></a>
                <div>
                    <a href="exclusive.html" class="text-[var(--gold-muted)] font-bold py-3 block">
                        <span data-i18n="m_atelier">Ексклюзив</span>
                    </a>
                </div>
                <div class="mt-4 flex flex-col gap-2 text-[12px] text-[var(--text-muted)]">
                    <a href="tel:+380634540901" class="text-[14px] text-[var(--gold-muted)] font-medium transition hover:opacity-80">+38 063 45 40 901</a>
                    <span>Пн–Пт: 08:00–18:00</span>
                    <span>м. Ізмаїл, вул. Торгова, 68</span>
                    <span>м. Ізмаїл, вул. Покровська, 57</span>
                </div>
                <div class="flex items-center gap-4 mt-4">
                    <a href="https://www.instagram.com/bv.jewelry_izmail" target="_blank" class="inst-link w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] hover:text-[#111] hover:bg-[var(--gold-muted)] hover:border-[var(--gold-muted)] transition-all duration-300">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                    <a href="https://t.me/bv_jewelry_izmail" target="_blank" class="tg-link w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] hover:text-[#111] hover:bg-[var(--gold-muted)] hover:border-[var(--gold-muted)] transition-all duration-300">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </a>
                </div>
            </div>
        `;
    }
}

window.smartProfileClick = function() {
    if(document.getElementById('sideMenu')?.classList.contains('active')) {
        window.toggleMenu(); 
    }
    const user = API.get('bv_current_user', null);
    if (user && user.id) {
        window.location.href = 'profile.html';
    } else {
        window.openAuthModal();
    }
};

window.openAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
    }
};

// ==========================================
// 5. КОШИК ТА УЛЮБЛЕНЕ
// ==========================================
window.toggleCart = function() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (!drawer || !overlay) return;
    if (!drawer.classList.contains('active')) {
        window.renderCart();
        drawer.classList.add('active'); overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        drawer.classList.remove('active'); overlay.classList.remove('active');
        if (!document.getElementById('sideMenu')?.classList.contains('active')) document.body.style.overflow = '';
    }
};

window.addToCart = function(id, title, variant, price, img) {
    let cart = getCart();
    
    let extractedSize = null;
    let cleanTitle = String(title);
    if (cleanTitle.includes('(Розмір:')) {
        const parts = cleanTitle.split('(Розмір:');
        cleanTitle = parts[0].trim();
        extractedSize = parts[1].replace(')', '').trim();
    }

    const allProducts = API.get('bv_products', []);
    const prod = allProducts.find(p => p.id === id);
    const sku = prod && prod.sku ? prod.sku : id;

    const cartId = id + (extractedSize ? '-' + extractedSize : '');

    const existing = cart.find(item => item.cartId === cartId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ 
            cartId: cartId, 
            id: id, 
            title: cleanTitle, 
            variant: String(variant), 
            price: Number(price), 
            img: String(img), 
            qty: 1,
            sku: sku,
            size: extractedSize
        });
    }
    
    setCart(cart);
    window.renderCart();
    if (!document.getElementById('cartDrawer').classList.contains('active')) window.toggleCart();
};

window.updateCartQty = function(cartId, delta) {
    const cart = getCart();
    const item = cart.find((entry) => entry.cartId === cartId);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    setCart(cart);
    window.renderCart();
};

window.removeFromCart = function(cartId) {
    let cart = getCart();
    cart = cart.filter(item => item.cartId !== cartId);
    setCart(cart);
    window.renderCart();
};

window.clearEntireCart = function(force = false) {
    if(force || confirm('Ви впевнені, що хочете очистити кошик?')) {
        setCart([]);
        window.renderCart();
    }
};

window.checkoutOrder = function() {
    const cart = getCart();
    if(cart.length === 0) { return alert('Ваш кошик порожній!'); }
    window.toggleCart();
    window.location.href = 'checkout.html';
};

window.renderCart = function() {
    let cart = getCart();
    const cartBody = document.getElementById('cartBody');
    const cartBadges = document.querySelectorAll('.cart-badge:not(.fav-badge)');
    const subtotalVal = document.querySelector('.cart-subtotal-val');
    let total = 0, totalQty = 0;
    
    if(!cartBody) return;
    cartBody.innerHTML = '';

    if (cart.length === 0) {
        const lang = API.get('bv_lang', 'uk');
        cartBody.innerHTML = `<div class="cart-empty-msg text-center text-[var(--text-muted)] mt-10">${i18n[lang].cart_empty}</div>`;
        if(subtotalVal) subtotalVal.innerText = '0 ₴';
        cartBadges.forEach(b => b.innerText = '0');
        const checkoutBtnWrapper = document.getElementById('checkoutBtnWrapper');
        if(checkoutBtnWrapper) checkoutBtnWrapper.style.display = 'none';
        return;
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        totalQty += item.qty;
        
        const sizeBadge = item.size ? `<span class="bg-[var(--gold-muted)]/20 text-[var(--gold-muted)] px-2 py-0.5 rounded-none text-[10px] font-bold">Розмір: ${item.size}</span>` : '';
        const skuBadge = `<span class="text-[10px] text-[var(--text-muted)]">Арт: ${item.sku}</span>`;

        cartBody.insertAdjacentHTML('beforeend', `
            <div class="cart-item flex gap-4 p-3 border border-[var(--border)] rounded-none mb-3 relative transition-all duration-300 hover:border-[var(--gold-muted)]/40">
                <img src="${item.img}" class="w-20 h-20 object-cover border border-[var(--border)] rounded-none mix-blend-multiply">
                <div class="flex-grow flex flex-col justify-center pr-6">
                    <span class="text-sm font-semibold uppercase tracking-wide leading-tight line-clamp-2">${escapeHtml(item.title)}</span>
                    <div class="flex flex-wrap items-center gap-2 mt-1">
                        ${sizeBadge}
                        ${skuBadge}
                    </div>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="text-sm font-bold text-[var(--gold-muted)]">${formatterPrice.format(item.price)} ₴</span>
                        <div class="inline-flex items-center rounded-none border border-[var(--border)] bg-[var(--bg-elevated)]">
                            <button class="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] btn-cross" onclick="updateCartQty('${item.cartId}', -1)">−</button>
                            <span class="px-2 text-xs text-[var(--text-main)] font-semibold min-w-6 text-center">${item.qty}</span>
                            <button class="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] btn-cross" onclick="updateCartQty('${item.cartId}', 1)">+</button>
                        </div>
                    </div>
                </div>
                <button class="cart-item-remove absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)] btn-cross" onclick="removeFromCart('${item.cartId}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `);
    });
    
    if(subtotalVal) subtotalVal.innerText = formatterPrice.format(total) + ' ₴';
    cartBadges.forEach(b => {
        b.innerText = totalQty;
        b.style.display = totalQty > 0 ? 'flex' : 'none';
    });

    const checkoutBtnWrapper = document.getElementById('checkoutBtnWrapper');
    if(checkoutBtnWrapper) {
        checkoutBtnWrapper.style.display = 'block';
        checkoutBtnWrapper.innerHTML = `<button id="checkoutBtn" onclick="window.checkoutOrder()" class="btn-solid w-full bg-[var(--gold-muted)] !text-[#111] font-bold uppercase tracking-widest py-3 rounded-none hover:opacity-90 transition-opacity active:scale-95 border-none">Оформити замовлення</button>`;
    }
};

window.toggleFavDrawer = function() {
    const drawer = document.getElementById('favDrawer');
    const overlay = document.getElementById('favOverlay');
    if (!drawer) return;
    
    if (!drawer.classList.contains('active')) {
        window.renderFavDrawer();
        drawer.classList.add('active'); if(overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        drawer.classList.remove('active'); if(overlay) overlay.classList.remove('active');
        if (!document.getElementById('sideMenu')?.classList.contains('active')) document.body.style.overflow = '';
    }
};

window.toggleFav = function(id) {
    let favs = getFavs();
    const idx = favs.indexOf(id);
    if(idx > -1) favs.splice(idx, 1); else favs.push(id);
    setFavs(favs);
    
    document.querySelectorAll(`.fav-btn-inline[data-id="${id}"]`).forEach(btn => {
        const icon = btn.querySelector('svg');
        if (!icon) return;
        if(favs.includes(id)) {
            btn.classList.add('text-[var(--danger)]'); btn.classList.remove('text-[var(--text-muted)]');
            icon.setAttribute('fill', 'currentColor');
        } else {
            btn.classList.remove('text-[var(--danger)]'); btn.classList.add('text-[var(--text-muted)]');
            icon.setAttribute('fill', 'none');
        }
    });
    window.renderFavDrawer();
};

window.renderFavDrawer = function() {
    let favsIds = getFavs();
    const allProducts = API.get('bv_products', []);
    const favBody = document.getElementById('favBody');
    const favBadges = document.querySelectorAll('.fav-badge');
    
    favBadges.forEach(b => {
        b.innerText = favsIds.length;
        b.style.display = favsIds.length > 0 ? 'flex' : 'none';
    });
    if(!favBody) return;

    if (favsIds.length === 0) {
        const lang = API.get('bv_lang', 'uk');
        favBody.innerHTML = `<div class="text-center text-[var(--text-muted)] mt-10" data-i18n="fav_empty">${i18n[lang].fav_empty || "Список порожній"}</div>`;
        return;
    }

    const favProducts = allProducts.filter(p => favsIds.includes(p.id));
    favBody.innerHTML = favProducts.map(prod => {
        const base = prod.variations ? prod.variations.base : prod;
        const safeImg = escapeHtml((base.images && base.images.length > 0) ? base.images[0] : (base.img || base.image || ''));
        const safeName = escapeHtml(window.getLoc(base.name));
        const priceDisplay = base.discount && Number(base.discount) > 0 ? base.discount : base.price;

        return `
        <div class="cart-item flex gap-4 p-3 border border-[var(--border)] rounded-none mb-3 relative transition-all duration-300 hover:border-[var(--gold-muted)]/35 cursor-pointer" onclick="location.href='product.html?id=${prod.id}'">
            <img src="${safeImg}" class="w-16 h-16 object-cover border border-[var(--border)] rounded-none mix-blend-multiply">
            <div class="flex-grow flex flex-col justify-center pr-6">
                <span class="text-xs font-semibold uppercase tracking-wide line-clamp-1">${safeName}</span>
                <span class="text-[10px] text-[var(--text-muted)] mt-1">${escapeHtml(prod.variant || '')}</span>
                <span class="text-sm font-bold text-[var(--gold-muted)] mt-1">${formatterPrice.format(priceDisplay)} ₴</span>
            </div>
            <button class="cart-item-remove absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)] btn-cross" onclick="event.stopPropagation(); toggleFav('${prod.id}')" title="Видалити">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        `;
    }).join('');
};

// ==========================================
// 7. ГЛОБАЛЬНИЙ РЕНДЕР КАРТКИ ТОВАРУ
// ==========================================
window.renderProductCard = function(prod) {
    const lang = API.get('bv_lang', 'uk');
    const base = prod.variations ? prod.variations.base : prod; 
    
    const isOutOfStock = prod.status === 'out-stock';
    const isPreOrder = prod.status === 'pre-order';
    const isFav = getFavs().includes(prod.id);
    
    let badgesHtml = '<div class="flex flex-wrap gap-1 justify-end items-center">';
    if (isOutOfStock) badgesHtml += `<div class="prod-badge badge-sold-out rounded-none">${i18n[lang].badge_sold_out}</div>`;
    else if (isPreOrder) badgesHtml += `<div class="prod-badge badge-pre-order rounded-none">${i18n[lang].badge_pre_order}</div>`;
    if(prod.badge === 'new') badgesHtml += `<div class="prod-badge badge-new rounded-none">${i18n[lang].badge_new}</div>`;
    if(prod.badge === 'exclusive') badgesHtml += `<div class="prod-badge badge-exclusive rounded-none">${i18n[lang].badge_exclusive}</div>`;
    if(prod.badge === 'sale') badgesHtml += `<div class="prod-badge badge-sale rounded-none">${i18n[lang].badge_sale}</div>`;
    badgesHtml += '</div>';

    const price = base.price || 0;
    const discount = base.discount || null;

    let priceHtml = `<span class="text-[14px] md:text-[16px] font-bold text-[var(--gold-muted)]">${formatterPrice.format(price)} ₴</span>`;
    if (discount && Number(discount) > 0) {
        priceHtml = `<span class="text-[14px] md:text-[16px] font-bold text-[#c5a059]">${formatterPrice.format(discount)} ₴</span><span class="text-[10px] md:text-[12px] text-[var(--text-muted)] line-through ml-2 opacity-70">${formatterPrice.format(price)} ₴</span>`;
    }

    const safeId = escapeHtml(prod.id);
    const safeName = escapeHtml(window.getLoc(base.name)); 
    const safeVariant = escapeHtml(prod.variant || '');
    const safeImg = escapeHtml((base.images && base.images.length > 0) ? base.images[0] : (base.img || base.image || ''));

    return `
        <div class="product-card group relative overflow-hidden flex flex-col w-full h-full bg-[#ffffff] transition-colors duration-300">
            <a href="product.html?id=${safeId}" class="relative w-full aspect-square overflow-hidden bg-white block p-2 md:p-4">
                <img src="${safeImg}" class="product-img w-full h-full object-contain transition duration-700 group-hover:scale-105" loading="lazy">
            </a>
            
            <div class="px-3 md:px-4 pb-1 pt-2 flex flex-col gap-1 flex-grow bg-white border-t border-[#f5f5f5]">
                <a href="product.html?id=${safeId}" class="text-[9px] md:text-[10px] uppercase tracking-widest text-[#888] hover:text-[var(--gold-muted)] transition-all duration-300">${safeVariant}</a>
                <a href="product.html?id=${safeId}" class="text-[12px] md:text-[14px] font-medium text-[#222] leading-snug hover:text-[var(--gold-muted)] transition-all duration-300 line-clamp-2 mt-1 min-h-[36px] md:min-h-[44px]">${safeName}</a>
                <div class="mt-auto pt-2 mb-1 flex items-center">${priceHtml}</div>
            </div>

            <div class="px-3 md:px-4 py-3 border-t border-[#f5f5f5] flex justify-between items-center mt-auto bg-white">
                <div class="flex items-center gap-2">
                    ${!isOutOfStock ? `
                    <button onclick="window.addToCartById('${safeId}')" class="btn-cross flex items-center gap-1 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#222] hover:text-[var(--gold-muted)] transition-all duration-300 active:scale-95 group/btn">
                        <span>${i18n[lang].btn_buy}</span><span class="text-[14px] font-light mb-[2px] transition-transform group-hover/btn:rotate-90">+</span>
                    </button>
                    ` : `<span class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#888]">${i18n[lang].out_stock}</span>`}
                </div>
                <div class="flex items-center gap-3">
                    ${badgesHtml}
                    <button class="fav-btn-inline btn-cross ${isFav ? 'text-[var(--danger)]' : 'text-[#888] hover:text-[#222]'} transition-all duration-300 active:scale-95" data-id="${safeId}" onclick="toggleFav('${safeId}')">
                        <svg width="18" height="18" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
};

window.addToCartById = function(id) {
    const allProducts = window.products || API.get('bv_products', []);
    const prod = allProducts.find(p => p.id === id);
    if (!prod) return;
    
    const base = prod.variations ? prod.variations.base : prod;
    const name = window.getLoc(base.name);
    const price = base.discount && Number(base.discount) > 0 ? base.discount : base.price;
    const img = (base.images && base.images.length > 0) ? base.images[0] : (base.img || base.image || '');
    
    window.addToCart(prod.id, name, prod.variant || '', price, img);
};

// ==========================================
// 9. БЕЗКІНЧЕННА БІГУЧА СТРОКА ТА КАРУСЕЛІ
// ==========================================
if (!document.getElementById('marquee-fix-styles')) {
    const style = document.createElement('style');
    style.id = 'marquee-fix-styles';
    style.innerHTML = `
        .marquee-wrapper { width: 100% !important; overflow: hidden !important; background: var(--bg-card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 20px 0; cursor: grab; user-select: none; display: block !important; position: relative; }
        #marqueeTrack { display: flex !important; gap: 0px !important; white-space: nowrap; width: max-content; will-change: transform; align-items: center; }
        .marquee-item { flex-shrink: 0; padding: 0 !important; font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold-muted); text-decoration: none; display: flex; align-items: center; user-select: none; -webkit-user-drag: none; }
        .marquee-item::after { content: "•"; margin: 0 25px !important; color: var(--gold-muted); opacity: 0.4; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
}

function createInertiaScroll(containerSelector, trackSelector, baseSpeed = -0.5) {
    const container = document.querySelector(containerSelector);
    const track = document.querySelector(trackSelector);
    if (!container || !track) return;

    let currentX = 0, isDown = false, isDragging = false, startX, velocity = 0, state = 'playing', pauseTimer = null;
    const content = track.innerHTML;
    track.innerHTML = content + content + content + content;

    track.addEventListener('dragstart', (e) => e.preventDefault());
    track.addEventListener('click', (e) => { if (isDragging) { e.preventDefault(); e.stopPropagation(); } });

    function step() {
        if (state === 'playing') currentX += baseSpeed;
        else if (state === 'coasting') {
            currentX += velocity; velocity *= 0.95; 
            if (Math.abs(velocity) < 0.2) { state = 'paused'; clearTimeout(pauseTimer); pauseTimer = setTimeout(() => { state = 'playing'; }, 3000); }
        } 
        const resetPoint = track.scrollWidth / 4;
        if (currentX <= -resetPoint) currentX += resetPoint;
        if (currentX > 0) currentX -= resetPoint;
        track.style.transform = `translate3d(${currentX}px, 0, 0)`;
        requestAnimationFrame(step);
    }

    const startDrag = (e) => { isDown = true; isDragging = false; state = 'dragging'; clearTimeout(pauseTimer); startX = (e.pageX || e.touches[0].pageX) - currentX; velocity = 0; container.style.cursor = 'grabbing'; };
    const endDrag = () => { if (!isDown) return; isDown = false; container.style.cursor = 'grab'; state = 'coasting'; setTimeout(() => { isDragging = false; }, 50); };
    const moveDrag = (e) => { if (!isDown) return; const x = (e.pageX || e.touches[0].pageX) - startX; if (Math.abs(x - currentX) > 3) isDragging = true; velocity = x - currentX; currentX = x; };

    container.addEventListener('mousedown', startDrag); window.addEventListener('mouseup', endDrag); container.addEventListener('mouseleave', endDrag); container.addEventListener('mousemove', moveDrag);
    container.addEventListener('touchstart', startDrag, {passive: true}); container.addEventListener('touchend', endDrag); container.addEventListener('touchmove', moveDrag, {passive: true});
    requestAnimationFrame(step);
}

window.initMarqueeSim = function() {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;
    const categoriesFlat = API.get('bv_categories_flat', []);
    const html = categoriesFlat.map(c => `<a href="catalog.html#${c.id}" class="marquee-item">${window.getLoc(c.name)}</a>`).join('');
    if (html) { track.innerHTML = html; setTimeout(() => { createInertiaScroll('.marquee-wrapper', '#marqueeTrack', -0.5); }, 100); }
};

window.initPremiumCarousel = function(track) {
    if (!track || track.dataset.init === 'true') return;
    track.dataset.init = 'true';

    let wrapper = track.closest('.group');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'relative w-full group outline-none'; 
        track.parentNode.insertBefore(wrapper, track);
        wrapper.appendChild(track);
    }

    const btnClass = "btn-cross hidden md:flex absolute top-1/2 -translate-y-1/2 z-40 w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-none bg-[var(--bg-card)]/40 backdrop-blur-md border border-[var(--border)] text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-all duration-400 hover:bg-[var(--bg-card)] hover:border-[var(--gold-muted)] hover:text-[var(--gold-muted)] shadow-[0_8px_30px_rgba(0,0,0,0.15)]";
    const prevBtn = document.createElement('button'); prevBtn.className = `${btnClass} left-2 lg:left-6`; prevBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg>`;
    const nextBtn = document.createElement('button'); nextBtn.className = `${btnClass} right-2 lg:right-6`; nextBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg>`;
    wrapper.appendChild(prevBtn); wrapper.appendChild(nextBtn);

    track.classList.add('no-scrollbar', 'cursor-grab'); track.classList.remove('snap-x', 'snap-mandatory'); track.style.scrollBehavior = 'auto';

    let isDown = false, isDragging = false, startX, scrollLeft, lastX, velX = 0, momentumID;

    track.addEventListener('dragstart', (e) => e.preventDefault());
    track.addEventListener('click', (e) => { if (isDragging) { e.preventDefault(); e.stopPropagation(); } });

    const momentumLoop = () => {
        if (isDown) return; track.scrollLeft -= velX; velX *= 0.95; checkInfinite();
        if (Math.abs(velX) > 0.5) { momentumID = requestAnimationFrame(momentumLoop); } else { track.classList.add('snap-x', 'snap-mandatory'); }
    };

    const beginMomentum = () => { track.classList.remove('snap-x', 'snap-mandatory'); cancelAnimationFrame(momentumID); momentumID = requestAnimationFrame(momentumLoop); };

    nextBtn.onclick = () => { velX = -25; beginMomentum(); };
    prevBtn.onclick = () => { velX = 25; beginMomentum(); };

    const startAction = (e) => { isDown = true; isDragging = false; track.classList.remove('snap-x', 'snap-mandatory'); track.classList.add('cursor-grabbing'); cancelAnimationFrame(momentumID); startX = (e.pageX || e.touches[0].pageX); scrollLeft = track.scrollLeft; lastX = startX; velX = 0; };
    const endAction = () => { if (!isDown) return; isDown = false; track.classList.remove('cursor-grabbing'); beginMomentum(); setTimeout(() => { isDragging = false; }, 50); };
    const moveAction = (e) => { if (!isDown) return; const currentX = (e.pageX || e.touches[0].pageX); const walk = (currentX - startX); if (Math.abs(walk) > 5) isDragging = true; track.scrollLeft = scrollLeft - walk; velX = currentX - lastX; lastX = currentX; checkInfinite(); };
    const checkInfinite = () => { const bWidth = track.scrollWidth / 3; if (track.scrollLeft >= bWidth * 2) track.scrollLeft -= bWidth; if (track.scrollLeft <= 0) track.scrollLeft += bWidth; };

    track.addEventListener('mousedown', startAction); window.addEventListener('mouseup', endAction); track.addEventListener('mousemove', moveAction); track.addEventListener('mouseleave', endAction);
    track.addEventListener('touchstart', startAction, {passive: true}); track.addEventListener('touchend', endAction); track.addEventListener('touchmove', moveAction, {passive: true});

    setTimeout(() => { track.scrollLeft = track.scrollWidth / 3; }, 200);
};

// ==========================================
// 10. СЛАЙДЕР БАНЕРІВ (ЗАВАНТАЖЕННЯ З БД)
// ==========================================
window.initBannerSlider = function() {
    const container = document.getElementById('mainBannerContainer');
    if (!container) return;

    let banners = API.get('bv_banners', []);
    if (!banners || banners.length === 0) {
        banners = [
            { id: 1, img: 'https://images.pexels.com/photos/266621/pexels-photo-266621.jpeg', link: 'catalog.html' },
            { id: 2, img: 'https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg', link: 'exclusive.html' }
        ];
    }

    const settings = API.get('bv_settings', {});
    const ratio = settings.bannerRatio || '3/1';

    window.bannerCount = banners.length; 
    window.currentBanner = 0; 
    window.isBannerAnimating = false;
    
    let html = `
        <div class="relative w-full h-full rounded-none overflow-hidden group bg-[var(--bg-elevated)] border border-[var(--border)]" id="bannerTrack">
            ${banners.map((b, i) => `
                <div class="banner-slide absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ease-in-out" style="opacity: ${i === 0 ? '1' : '0'}; z-index: ${i === 0 ? '10' : '1'};" data-index="${i}" onclick="window.location.href='${b.link || '#'}'">
                    <img src="${b.img}" class="w-full h-full object-cover" style="aspect-ratio: ${ratio};">
                    <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                </div>
            `).join('')}
            
            <button class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-none items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden md:flex" onclick="window.moveBanner(-1, event)">❮</button>
            <button class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 text-white rounded-none items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden md:flex" onclick="window.moveBanner(1, event)">❯</button>
            
            <div id="bannerDots" class="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                ${banners.map((_, i) => `
                    <button class="banner-dot w-1.5 h-1.5 md:w-2 md:h-2 rounded-none transition-all duration-300 ${i === 0 ? 'bg-[var(--gold-muted)] scale-125' : 'bg-white/50'}" onclick="window.goToBanner(${i}, event)"></button>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    if(banners.length > 1) { 
        clearInterval(window.bannerInterval); 
        window.bannerInterval = setInterval(() => moveBanner(1), 5000); 

        let touchStartX = 0; let touchEndX = 0;
        container.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; clearInterval(window.bannerInterval); }, {passive: true});
        container.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 40) moveBanner(1); 
            if (touchEndX - touchStartX > 40) moveBanner(-1); 
            window.bannerInterval = setInterval(() => moveBanner(1), 5000); 
        }, {passive: true});
    }
};

window.updateBannerDots = function() {
    const dots = document.querySelectorAll('.banner-dot');
    dots.forEach((d, i) => {
        d.className = i === window.currentBanner 
            ? 'banner-dot w-1.5 h-1.5 md:w-2 md:h-2 rounded-none transition-all duration-300 bg-[var(--gold-muted)] scale-125' 
            : 'banner-dot w-1.5 h-1.5 md:w-2 md:h-2 rounded-none transition-all duration-300 bg-white/50';
    });
};

window.moveBanner = function(dir, e) {
    if(e) e.stopPropagation();
    if(window.bannerCount <= 1 || window.isBannerAnimating) return;
    window.isBannerAnimating = true;
    clearInterval(window.bannerInterval);
    
    const newIndex = (window.currentBanner + dir + window.bannerCount) % window.bannerCount;
    window.executeFade(newIndex);
    
    setTimeout(() => { window.isBannerAnimating = false; }, 700);
    window.bannerInterval = setInterval(() => moveBanner(1), 5000);
};

window.executeFade = function(newIndex) {
    const track = document.getElementById('bannerTrack');
    if(!track) return;
    const slides = track.querySelectorAll('.banner-slide');
    
    slides.forEach((slide, i) => {
        slide.style.opacity = i === newIndex ? '1' : '0';
        slide.style.zIndex = i === newIndex ? '10' : '1';
    });
    
    window.currentBanner = newIndex;
    window.updateBannerDots();
};

window.goToBanner = function(index, e) {
    if(e) e.stopPropagation();
    if(window.bannerCount <= 1 || window.isBannerAnimating || index === window.currentBanner) return;
    window.isBannerAnimating = true;
    clearInterval(window.bannerInterval);
    
    window.executeFade(index);
    
    setTimeout(() => { window.isBannerAnimating = false; }, 700);
    window.bannerInterval = setInterval(() => moveBanner(1), 5000);
};

// ==========================================
// 11. ГОЛОВНА ТА ПІДВАЛ: РЕНДЕР ДИНАМІЧНИХ СЕКЦІЙ 
// ==========================================
window.renderHomeSections = function() {
    const homeBlocks = API.get('bv_home_blocks', [
        { id: 'hits', name: {uk: 'Хіти місяця', ru: 'Хиты', en: 'Hits'}, active: true },
        { id: 'weekly', name: {uk: 'Вибір тижня', ru: 'Выбор недели', en: 'Weekly Choice'}, active: true }
    ]);
    
    let container = document.getElementById('dynamicHomeBlocksContainer');
    if (!container) return;
    
    let html = '';
    homeBlocks.filter(b => b.active).forEach(block => {
        let items = products.filter(p => {
            if (p.blocks && p.blocks.includes(block.id)) return true;
            if (block.id === 'hits' && (p.isSpecial === true || p.isSpecial === 'true')) return true;
            if (block.id === 'weekly' && (p.isWeekly === true || p.isWeekly === 'true')) return true;
            return false;
        });
        
        if (items.length > 0) {
            const title = window.getLoc(block.name);
            const trackId = `block-track-${block.id}`;
            const cardWrapper = (p) => `<div class="flex-none w-[50%] sm:w-[33.333%] md:w-[25%] lg:w-[20%] xl:w-[16.666%] snap-start flex">${window.renderProductCard(p)}</div>`;
            
            let blockItems = [...items];
            while(blockItems.length < 12 && blockItems.length > 0) { blockItems = blockItems.concat(items); }
            
            html += `
            <section class="max-w-[1920px] mx-auto px-0 py-4 md:py-6 border-t border-[var(--border)]">
                <div class="mb-3 text-center px-4">
                    <span class="text-[9px] uppercase tracking-[0.4em] text-[var(--gold-muted)] font-semibold block mb-1">BV Jewelry</span>
                    <h2 class="hero-title text-[var(--text-main)] !text-[24px] md:!text-[32px]">${title}</h2>
                </div>
                <div class="promo-carousel-container select-none group relative">
                    <div id="${trackId}" class="flex overflow-x-auto gap-0 snap-x snap-mandatory no-scrollbar min-h-[300px]">
                        ${blockItems.map(cardWrapper).join('')}
                    </div>
                </div>
            </section>`;
        }
    });
    
    container.innerHTML = html;
    
    homeBlocks.filter(b => b.active).forEach(block => {
        const track = document.getElementById(`block-track-${block.id}`);
        if (track && typeof window.initPremiumCarousel === 'function') {
            window.initPremiumCarousel(track);
        }
    });
};

window.applyAdminSettings = function() {
    const settings = API.get('bv_settings', null);
    const pages = API.get('bv_pages_content', {});
    
    if (pages.home_hero) {
        const heroBg = document.querySelector('.hero-img-bg');
        const heroOverlay = document.querySelector('.hero-overlay');
        const heroTitle = document.querySelector('.hero-title');
        const heroSub = document.querySelector('.hero-subtitle');

        if (heroBg && pages.home_hero.heroBg) heroBg.style.backgroundImage = `url('${pages.home_hero.heroBg}')`;
        if (heroOverlay && pages.home_hero.heroOpacity !== undefined) heroOverlay.style.backgroundColor = `rgba(0, 0, 0, ${pages.home_hero.heroOpacity})`;
        
        if (heroTitle) {
            if (pages.home_hero.title) heroTitle.innerText = pages.home_hero.title;
            if (pages.home_hero.titleColor) heroTitle.style.color = pages.home_hero.titleColor;
        }
        if (heroSub) {
            if (pages.home_hero.subtitle) heroSub.innerText = pages.home_hero.subtitle;
            if (pages.home_hero.subColor) heroSub.style.color = pages.home_hero.subColor;
        }
    }

    if (settings) {
        if (settings.phone) {
            document.querySelectorAll('.header-phone-link, .phone-num').forEach(link => { link.href = `tel:${settings.phone.replace(/\s+/g, '')}`; });
            document.querySelectorAll('.header-phone-text, .phone-num span').forEach(span => { span.innerText = settings.phone; });
        }
        if(settings.tgLink) document.querySelectorAll('.tg-link').forEach(link => link.href = settings.tgLink);
        if(settings.instLink) document.querySelectorAll('.inst-link').forEach(link => link.href = settings.instLink);
        
        const footerAddrBlock = document.getElementById('footerAddressesBlock');
        if (footerAddrBlock && settings.addresses && settings.addresses.length > 0) {
            let html = '';
            html += `<a href="http://maps.google.com/?q=${encodeURIComponent(settings.addresses[0])}" target="_blank" class="text-[14px] text-[var(--text-main)] opacity-90 hover:text-[var(--gold-muted)] flex items-center gap-2 transition">
                        <svg class="w-4 h-4 fill-currentColor opacity-60" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span>${settings.addresses[0]}</span>
                    </a>`;
            
            if (settings.addresses.length > 1) {
                html += `<button onclick="window.showBranchesModal()" class="btn-cross text-[11px] font-bold uppercase tracking-widest text-[var(--gold-muted)] hover:underline mt-2">Наші філіали (${settings.addresses.length})</button>`;
            }
            footerAddrBlock.innerHTML = html;
        }
    }
};

window.showBranchesModal = function() {
    const settings = API.get('bv_settings', {});
    const addrs = settings.addresses || [];
    if(addrs.length === 0) return;
    
    const list = addrs.map(a => `<a href="http://maps.google.com/?q=${encodeURIComponent(a)}" target="_blank" class="block p-4 border border-[var(--border)] rounded-none hover:border-[var(--gold-muted)] text-[var(--text-main)] text-sm mb-3 transition-colors flex items-center justify-between group">
        <span>${a}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--gold-muted)]"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
    </a>`).join('');
    
    const modalHtml = `
    <div id="branchesModal" class="fixed inset-0 bg-black/80 z-[7000] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity" onclick="this.remove()">
        <div class="glass-panel p-8 w-full max-w-md relative rounded-none shadow-2xl bg-[var(--bg-card)] border border-[var(--border)]" onclick="event.stopPropagation()">
            <button onclick="document.getElementById('branchesModal').remove()" class="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--danger)] text-2xl leading-none btn-cross">×</button>
            <h3 class="text-2xl font-serif text-[var(--gold-muted)] mb-6 text-center italic">Наші філіали</h3>
            <div class="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                ${list}
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.renderServicesTable = function() {
    const tbody = document.getElementById('servicesPriceBody');
    if (!tbody) return;
    const priceDB = API.get('bv_price_list', []);
    tbody.innerHTML = '';
    
    if (priceDB.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center py-10 text-[var(--text-muted)]">Прайс порожній. Додайте послуги в Адмін-панелі.</td></tr>`;
        return;
    }
    
    priceDB.forEach(cat => {
        tbody.innerHTML += `
            <tr class="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border)]">
                <td colspan="2" class="py-4 px-2 md:px-4 font-serif text-lg md:text-xl text-[var(--gold-muted)]">${cat.category}</td>
            </tr>
        `;
        if(cat.items) {
            cat.items.forEach(item => {
                tbody.innerHTML += `
                    <tr class="border-b border-[var(--border)] hover:bg-[rgba(255,255,255,0.01)] transition-colors group">
                        <td class="py-4 px-2 md:px-4 font-medium text-[var(--text-main)] pr-4">${item.name}</td>
                        <td class="py-4 px-2 md:px-4 text-right align-top md:align-middle">
                            <div class="flex flex-col md:flex-row justify-end gap-1 md:gap-4">
                                <div class="flex flex-col text-right">
                                    <span class="text-[9px] uppercase tracking-widest text-[#e8b923] font-bold">Золото</span>
                                    <span class="text-[var(--text-main)] font-semibold">${item.gold}</span>
                                </div>
                                ${item.silver ? `
                                <div class="flex flex-col text-right opacity-70 group-hover:opacity-100 transition">
                                    <span class="text-[9px] uppercase tracking-widest text-[#c0c0c0] font-bold">Срібло</span>
                                    <span class="text-[var(--text-main)] font-semibold">${item.silver}</span>
                                </div>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    });
};

window.renderExclusivePage = function() {
    const processContainer = document.getElementById('exclusive-process-container');
    const materialsContainer = document.getElementById('material-options-container');
    
    if(processContainer) {
        const processDB = API.get('bv_exclusive_process', []);
        processContainer.innerHTML = processDB.map((step, idx) => `
            <div class="flex flex-col md:flex-row gap-6 items-center bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-none group hover:border-[var(--gold-muted)] transition-colors">
                <div class="w-full md:w-1/3 aspect-[4/3] bg-black overflow-hidden relative">
                    <div class="absolute top-2 left-2 bg-[var(--gold-muted)] text-[#111] text-[10px] font-bold uppercase tracking-widest px-2 py-1 z-10">Етап ${idx+1}</div>
                    <img src="${step.img}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700">
                </div>
                <div class="w-full md:w-2/3">
                    <h3 class="font-serif text-2xl text-[var(--text-main)] mb-3">${step.title}</h3>
                    <p class="text-sm text-[var(--text-muted)] leading-relaxed">${step.desc}</p>
                </div>
            </div>
        `).join('');
    }

    if(materialsContainer) {
        const matDB = API.get('bv_exclusive_materials', []);
        materialsContainer.innerHTML = matDB.map(m => `
            <label class="flex-1 cursor-pointer">
                <input type="radio" name="material" value="${m.id}" class="peer hidden" ${m.selected ? 'checked' : ''}>
                <div class="border border-[var(--border)] text-center py-4 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] peer-checked:border-[var(--gold-muted)] peer-checked:text-[var(--gold-muted)] hover:border-[var(--gold-muted)] transition-colors">
                    ${m.label}
                </div>
            </label>
        `).join('');
    }
};

// // ==========================================
// // 12. ГЛОБАЛЬНІ ЕЛЕМЕНТИ ІНТЕРФЕЙСУ ТА НАВІГАЦІЯ
// // ==========================================
// window.toggleAccordion = function(listId, arrowId) {
//     const list = document.getElementById(listId);
//     const arrow = document.getElementById(arrowId);
//     if (!list) return;

//     const parent = list.parentElement;
//     if (parent) {
//         const openLists = parent.querySelectorAll('.accordion-content.open');
//         openLists.forEach(openList => {
//             if (openList !== list) {
//                 openList.classList.remove('open');
//                 const siblingArrow = document.getElementById(openList.id.replace('List', 'Arrow'));
//                 if (siblingArrow) siblingArrow.style.transform = 'rotate(0deg)';
//             }
//         });
//     }

//     list.classList.toggle('open');
//     if (arrow) arrow.style.transform = list.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
// };

// window.toggleTheme = function() {
//     const html = document.documentElement;
//     const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
//     html.setAttribute('data-theme', newTheme);
//     API.set('bv_theme', newTheme);
//     const svg = newTheme === 'light' ? sunSVG : moonSVG;
//     const icon = document.getElementById('themeIcon');
//     const iconMob = document.getElementById('themeIconMob');
//     if(icon) icon.innerHTML = svg;
//     if(iconMob) iconMob.innerHTML = svg;
// };

// window.changeLang = function(lang) {
//     const displayLang = lang === 'uk' ? 'UA' : lang.toUpperCase();
//     ['currentFlag', 'currentFlagMob'].forEach(id => { 
//         const el = document.getElementById(id); 
//         if(el) el.src = `https://flagcdn.com/${flags[lang]}.svg`; 
//     });
//     ['currentLangLabel', 'currentLangLabelMob'].forEach(id => { 
//         const el = document.getElementById(id); 
//         if(el) el.innerText = displayLang; 
//     });
//     document.querySelectorAll('[data-i18n]').forEach(el => el.innerHTML = i18n[lang][el.dataset.i18n] || el.innerHTML);
//     document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = i18n[lang][el.dataset.i18nPlaceholder] || el.placeholder);
//     API.set('bv_lang', lang);
    
//     if(typeof window.renderCart === 'function') window.renderCart();
//     if(typeof window.renderFavDrawer === 'function') window.renderFavDrawer();
    
//     if(document.getElementById('dynamicHomeBlocksContainer') && typeof renderHomeSections === 'function') renderHomeSections();
//     if(typeof window.renderCatalogBatch === 'function') window.renderCatalogBatch(); 
//     if(document.getElementById('productContainer') && typeof renderProductPage === 'function') renderProductPage();
    
//     const mobLangList = document.getElementById('mobLangList');
//     if(mobLangList && mobLangList.classList.contains('open')) window.toggleAccordion('mobLangList', 'mobLangArrow');
// };

// window.showAdminPanel = function() {
//     const adminSec = document.getElementById('adminSection');
//     const mainSec = document.getElementById('mainContent');
//     const profileSec = document.getElementById('profileSection');
//     if (adminSec) {
//         if (mainSec) mainSec.classList.add('hidden');
//         if (profileSec) profileSec.classList.add('hidden');
//         adminSec.classList.remove('hidden');
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     } else {
//         location.href = 'admin.html';
//     }
// };

// window.showClientProfile = function() {
//     const profileSec = document.getElementById('profileSection');
//     const mainSec = document.getElementById('mainContent');
//     const adminSec = document.getElementById('adminSection');
//     if (profileSec) {
//         if (mainSec) mainSec.classList.add('hidden');
//         if (adminSec) adminSec.classList.add('hidden');
//         profileSec.classList.remove('hidden');
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     } else {
//         location.href = 'profile.html';
//     }
// };

// window.injectAuthModal = function() {
//     if (document.getElementById('authModal')) return;

//     const modalHtml = `
//     <div id="authModal" class="fixed inset-0 bg-black/80 z-[6000] hidden opacity-0 transition-opacity flex items-center justify-center p-4 backdrop-blur-md" aria-modal="true" role="dialog">
//         <div class="glass-panel p-8 w-full max-w-sm relative rounded-none shadow-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
//             <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--danger)] text-3xl leading-none transition-colors z-10">&times;</button>
//             <div id="authFormContainer">
//                 <h3 id="authTitle" class="text-2xl font-serif text-[var(--text-main)] mb-1 text-center" data-i18n="login">Вхід</h3>
//                 <p id="authSubtitle" class="text-center text-[var(--text-muted)] text-xs mb-6 font-light">Раді бачити вас знову</p>
//                 <form id="authForm" class="flex flex-col gap-3">
//                     <div id="nameFieldContainer" class="hidden flex-col gap-1.5">
//                         <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--gold-muted)] ml-1">Ваше ім'я</label>
//                         <input type="text" id="authName" placeholder="Олена" class="auth-input outline-none border border-[var(--border)] bg-[rgba(255,255,255,0.03)] focus:border-[var(--gold-muted)] rounded-none px-4 py-3 text-sm text-[var(--text-main)] transition-colors w-full">
//                     </div>
//                     <div class="flex flex-col gap-1.5">
//                         <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--gold-muted)] ml-1">Email</label>
//                         <input type="email" id="authUser" placeholder="mail@example.com" class="auth-input outline-none border border-[var(--border)] bg-[rgba(255,255,255,0.03)] focus:border-[var(--gold-muted)] rounded-none px-4 py-3 text-sm text-[var(--text-main)] transition-colors w-full" required>
//                     </div>
//                     <div class="flex flex-col gap-1.5">
//                         <label class="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--gold-muted)] ml-1">Пароль</label>
//                         <input type="password" id="authPass" placeholder="Мінімум 6 символів" class="auth-input outline-none border border-[var(--border)] bg-[rgba(255,255,255,0.03)] focus:border-[var(--gold-muted)] rounded-none px-4 py-3 text-sm text-[var(--text-main)] transition-colors w-full" required>
//                     </div>
//                     <button type="submit" class="btn-solid py-3.5 rounded-none font-bold uppercase tracking-widest text-[11px] hover:opacity-90 transition-opacity active:scale-95 shadow-md mt-2" id="authSubmitBtn" data-i18n="login">Увійти</button>
                    
//                     <div class="mt-4 flex flex-col gap-2.5">
//                         <div class="relative flex py-2 items-center">
//                             <div class="flex-grow border-t border-[var(--border)]"></div>
//                             <span class="flex-shrink-0 mx-4 text-[var(--text-muted)] text-[10px] uppercase tracking-widest">Або</span>
//                             <div class="flex-grow border-t border-[var(--border)]"></div>
//                         </div>
//                         <button type="button" onclick="window.loginWithGoogle()" class="w-full flex items-center justify-center gap-3 border border-[var(--border)] bg-white/5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-main)] hover:border-[var(--gold-muted)] hover:bg-white/10 transition-all active:scale-95 rounded-none">
//                             <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2 6.42 2 12c0 5.59 4.39 10 10.1 10 5.92 0 10.28-4.61 10.28-10.4 0-.83-.07-1.39-.07-1.39z"/></svg>
//                             Увійти через Google
//                         </button>
//                         <button type="button" onclick="window.loginWithApple()" class="w-full flex items-center justify-center gap-3 border border-[var(--border)] bg-white/5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-main)] hover:border-[var(--gold-muted)] hover:bg-white/10 transition-all active:scale-95 rounded-none">
//                             <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.85 3.73-.7 1.13.1 2.25.69 2.94 1.7-2.64 1.63-2.15 5.04.51 6.13-.67 1.84-1.63 3.75-2.26 5.04zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
//                             Увійти через Apple
//                         </button>
//                     </div>

//                     <div class="text-center text-xs text-[var(--text-muted)] mt-4">
//                         <span id="authToggleText">Немає акаунта?</span> 
//                         <button type="button" onclick="toggleAuthMode(event)" class="text-[var(--gold-muted)] font-bold hover:underline ml-1" id="authToggleLink">Зареєструватися</button>
//                     </div>
//                 </form>
//             </div>
            
//             <div id="profileView" class="hidden flex-col gap-4">
//                 <h3 class="text-2xl font-serif text-[var(--text-main)] mb-1 text-center" data-i18n="login_mob_title">Кабінет</h3>
//                 <div class="flex flex-col items-center justify-center p-5 bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-none mb-1 relative overflow-hidden group">
//                     <div class="w-16 h-16 bg-[var(--gold-muted)] text-[#111] rounded-full flex items-center justify-center text-2xl font-bold uppercase shadow-md mb-3 relative z-10" id="profAvatar">A</div>
//                     <p class="text-center text-[var(--text-main)] font-semibold text-lg relative z-10" id="profName">User</p>
//                     <p class="text-center text-[var(--text-muted)] text-[11px] mt-1 relative z-10" id="profEmail">user@mail.com</p>
//                 </div>
//                 <div class="flex flex-col gap-2">
//                     <button onclick="window.showAdminPanel(); closeAuthModal();" id="adminLinkBtn" class="hidden w-full border border-[var(--gold-muted)] text-[var(--gold-muted)] py-3 rounded-none font-bold uppercase tracking-widest text-[10px] hover:bg-[var(--gold-muted)] hover:text-[var(--bg-body)] transition-colors active:scale-95 text-center">Панель Адміністратора</button>
//                     <button onclick="window.showClientProfile(); closeAuthModal();" id="clientLinkBtn" class="btn-solid py-3 rounded-none font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity active:scale-95 w-full">Мої замовлення</button>
//                     <button onclick="window.logoutUser()" class="w-full py-3 rounded-none border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold active:scale-95 bg-transparent mt-1">Вийти з акаунту</button>
//                 </div>
//             </div>
//         </div>
//     </div>
//     `;
//     document.body.insertAdjacentHTML('beforeend', modalHtml);
// };

// window.injectGlobalUI = function() {
//     window.injectAuthModal();
//     if (!document.getElementById('scrollToTopBtn')) {
//         document.body.insertAdjacentHTML('beforeend', `<button id="scrollToTopBtn" onclick="window.scrollTo({top:0, behavior:'smooth'})" aria-label="Вверх" class="btn-cross fixed bottom-[165px] left-4 z-[4800] w-12 h-12 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border)] rounded-none flex items-center justify-center text-[var(--gold-muted)] shadow-[0_5px_20px_rgba(0,0,0,0.3)] opacity-0 translate-y-4 pointer-events-none transition-all duration-300 active:scale-95 md:bottom-10 md:left-10 hover:bg-[var(--gold-muted)] hover:text-[var(--bg-body)]"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg></button>`);
//     }
// };

// window.toggleAccordionPanel = function(clickedPanel) {
//     const allPanels = document.querySelectorAll('.glass-panel-item');
//     if (clickedPanel.classList.contains('active')) return;
//     allPanels.forEach(panel => panel.classList.remove('active'));
//     clickedPanel.classList.add('active');
// };

// ==========================================
// 13. ПОШУК, АВТОРИЗАЦІЯ ТА REALTIME (SUPABASE)
// ==========================================
window.executeSearch = function(query) {
    if (!query || !query.trim()) return;
    window.location.href = `catalog.html?search=${encodeURIComponent(query.trim())}`;
};

window.toggleMobileSearch = function(forceClose = null) {
    const searchBox = document.getElementById('mobSearchContainer');
    if (!searchBox) return;
    if (forceClose === true) { searchBox.classList.add('hidden'); return; }
    if (forceClose === false) { searchBox.classList.remove('hidden'); }
    else { searchBox.classList.toggle('hidden'); }
    if (!searchBox.classList.contains('hidden')) { setTimeout(() => { const inp = document.getElementById('mobSearchOverlayInput'); if (inp) inp.focus(); }, 100); }
};

window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if(modal) { modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 300); }
};

window.toggleAuthMode = function(e) {
    e.preventDefault(); window.isRegisterMode = !window.isRegisterMode; updateAuthView();
};

window.updateAuthView = function() {
    document.getElementById('authTitle').innerText = window.isRegisterMode ? 'Реєстрація' : 'Вхід';
    document.getElementById('authSubtitle').innerText = window.isRegisterMode ? 'Приєднуйтесь до світу BV Jewelry' : 'Раді бачити вас знову';
    document.getElementById('authSubmitBtn').innerText = window.isRegisterMode ? 'Створити акаунт' : 'Увійти';
    document.getElementById('authToggleText').innerText = window.isRegisterMode ? 'Вже є акаунт?' : 'Немає акаунта?';
    document.getElementById('authToggleLink').innerText = window.isRegisterMode ? 'Увійти' : 'Зареєструватися';
    
    const nameField = document.getElementById('nameFieldContainer');
    if(nameField) {
        if(window.isRegisterMode) {
            nameField.classList.remove('hidden'); nameField.classList.add('flex'); document.getElementById('authName').required = true;
        } else {
            nameField.classList.add('hidden'); nameField.classList.remove('flex'); document.getElementById('authName').required = false;
        }
    }
};

window.loginWithGoogle = async function() {
    if(!_supabase) return alert('Помилка підключення бази даних.');
    await _supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } });
};

window.loginWithApple = async function() {
    if(!_supabase) return alert('Помилка підключення бази даних.');
    await _supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin + window.location.pathname } });
};

window.updateProfileMenu = function() {
    const user = getCurrentUser();
    const dropdownMenu = document.getElementById('profileDropdownMenu');
    const profileBtn = document.getElementById('headerProfileBtn');
    
    if (profileBtn) {
        profileBtn.onclick = function() {
            if (user) location.href = 'profile.html';
            else window.openAuthModal();
        };
    }
    
    if(dropdownMenu) {
        if (user) {
            dropdownMenu.innerHTML = `
                <a href="profile.html" class="dropdown-item w-full text-left font-medium">Мій кабінет</a>
                ${user.role === 'admin' ? '<a href="admin.html" class="dropdown-item w-full text-left font-bold text-[#c5a059]">Панель Адміна</a>' : ''}
                <button onclick="logoutUser()" class="btn-cross dropdown-item w-full text-left text-red-400 hover:text-red-500 mt-2 border-t border-[var(--border)] pt-2">Вийти з акаунту</button>
            `;
        } else {
            dropdownMenu.innerHTML = `
                <button onclick="window.isRegisterMode=false; window.openAuthModal();" class="btn-cross dropdown-item w-full text-left font-medium">Увійти</button>
                <button onclick="window.isRegisterMode=true; window.openAuthModal();" class="btn-cross dropdown-item w-full text-left font-medium text-[#c5a059]">Зареєструватися</button>
            `;
        }
    }
};

window.initRealtime = function() {
    const user = getCurrentUser();
    if(!user || !_supabase) return;

    _supabase.channel('custom-user-orders')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, (payload) => {
            const newStatus = payload.new.status;
            let statusText = 'Оновлено';
            if(newStatus === 'accepted') statusText = 'Прийнято в обробку';
            if(newStatus === 'shipped') statusText = 'Відправлено';
            if(newStatus === 'completed') statusText = 'Виконано';
            if(newStatus === 'cancelled') statusText = 'Скасовано';
            
            alert(`📦 Статус вашого замовлення #${payload.new.id} змінено: ${statusText}!`);
        })
        .subscribe();
};

window.logoutUser = async function() {
    if(_supabase && _supabase.auth) {
        _supabase.removeAllChannels();
        await _supabase.auth.signOut();
    }
    API.set('bv_current_user', null); 
    API.set('bv_favs', []); 
    API.set('bv_cart', []);
    sessionStorage.removeItem('isAdminAuth'); 
    
    if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('profile.html')) {
        window.location.href = 'index.html';
    } else {
        if(typeof window.renderCart === 'function') window.renderCart(); 
        if(typeof window.renderFavDrawer === 'function') window.renderFavDrawer();
        window.updateProfileMenu(); 
    }
};

// ==========================================
// 14. ГЛОБАЛЬНИЙ СТАРТ ТА СЛУХАЧІ
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    if(typeof window.injectAuthModal === 'function') window.injectAuthModal();

    const deskSearch = document.querySelector('.search-input.desktop-only') || document.querySelector('.desktop-only .search-input');
    if (deskSearch) { deskSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.executeSearch(e.target.value); }); }
    const overlayInput = document.getElementById('mobSearchOverlayInput');
    if (overlayInput) { overlayInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.executeSearch(e.target.value); }); }

    if(_supabase && window.location.hash && window.location.hash.includes('access_token')) {
        const { data: { session } } = await _supabase.auth.getSession();
        if (session && session.user) {
            const { data: profile } = await _supabase.from('profiles').select('*').eq('id', session.user.id).single();
            const role = (profile && profile.role === 'admin') ? 'admin' : 'client';
            const fullName = (profile && profile.full_name) ? profile.full_name : (session.user.user_metadata?.full_name || 'Клієнт');
            const userFavs = profile && profile.favs ? profile.favs : [];

            API.set('bv_current_user', { id: session.user.id, username: session.user.email, role: role, name: fullName, favs: userFavs });
            if (role === 'admin') sessionStorage.setItem('isAdminAuth', 'true');
            API.set(getScopedStorageKey('bv_favs'), userFavs);
            
            history.replaceState(null, null, ' ');
            window.updateProfileMenu();
            if(typeof window.renderFavDrawer === 'function') window.renderFavDrawer();
        }
    }

    const authForm = document.getElementById('authForm');
    if(authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(!_supabase) return alert("Помилка бази даних: підключення відсутнє.");

            const submitBtn = document.getElementById('authSubmitBtn');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Зачекайте...';
            submitBtn.disabled = true;

            const email = document.getElementById('authUser').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            const name = document.getElementById('authName') ? document.getElementById('authName').value.trim() : '';

            if (window.isRegisterMode) {
                if (pass.length < 6) { 
                    alert('Пароль має містити мінімум 6 символів.'); 
                    submitBtn.innerText = originalText; submitBtn.disabled = false; return; 
                }
                const { data, error } = await _supabase.auth.signUp({
                    email: email, password: pass, options: { data: { full_name: name } }
                });

                if (error) {
                    alert('Помилка реєстрації: ' + error.message);
                } else {
                    if(data.user) {
                        await _supabase.from('profiles').insert([
                            { id: data.user.id, full_name: name, role: 'client', favs: [] }
                        ]);
                    }
                    alert('Реєстрація успішна! Тепер ви можете увійти.');
                    window.isRegisterMode = false;
                    window.updateAuthView();
                }
            } else {
                const { data, error } = await _supabase.auth.signInWithPassword({ email: email, password: pass });

                if (error) {
                    alert('Невірний логін або пароль!');
                    submitBtn.innerText = originalText; submitBtn.disabled = false; return;
                }

                const { data: profile } = await _supabase.from('profiles').select('*').eq('id', data.user.id).single();
                const role = (profile && profile.role === 'admin') ? 'admin' : 'client';
                const fullName = (profile && profile.full_name) ? profile.full_name : (data.user.user_metadata?.full_name || 'Клієнт');
                const userFavs = profile && profile.favs ? profile.favs : [];

                API.set('bv_current_user', { id: data.user.id, username: data.user.email, role: role, name: fullName, favs: userFavs });
                if (role === 'admin') sessionStorage.setItem('isAdminAuth', 'true');
                API.set(getScopedStorageKey('bv_favs'), userFavs);
                
                closeAuthModal();
                if(typeof updateBadges === 'function') updateBadges();
                window.renderFavDrawer();
                window.initRealtime();
                window.updateProfileMenu(); 
            }
            submitBtn.innerText = originalText; submitBtn.disabled = false;
        });
    }
    
    const catalogToggle = document.querySelector('.catalog-toggle');
    const catalogWrapper = document.querySelector('.catalog-dropdown-wrapper');
    if (catalogToggle && catalogWrapper) {
        catalogToggle.onclick = function(e) {
            e.preventDefault();
            const isOpen = catalogWrapper.classList.toggle('open');
            document.body.classList.toggle('menu-open', isOpen);
        };
        document.addEventListener('click', function(e) {
            if (catalogWrapper.classList.contains('open') && !catalogWrapper.contains(e.target)) {
                catalogWrapper.classList.remove('open'); document.body.classList.remove('menu-open');
            }
        });
    }
});

window.onload = async () => { 
    if(window.location.pathname.includes('admin.html')) return;

    migrateScopedState();
    if(typeof window.injectGlobalUI === 'function') window.injectGlobalUI();
    
    await window.loadCloudData();

    if(document.getElementById('marqueeTrack') && typeof initMarqueeSim === 'function') initMarqueeSim();
    if(document.getElementById('productContainer') && typeof renderProductPage === 'function') renderProductPage();
    if(document.getElementById('servicesPriceBody') && typeof renderServicesTable === 'function') renderServicesTable();
    if(document.getElementById('exclusive-process-container') && typeof renderExclusivePage === 'function') renderExclusivePage();

    const savedLang = API.get('bv_lang', 'uk');
    if(typeof window.changeLang === 'function') window.changeLang(savedLang);

    const savedTheme = API.get('bv_theme', 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById('themeIcon'); 
    const iconMob = document.getElementById('themeIconMob');
    const svg = savedTheme === 'light' ? sunSVG : moonSVG;
    if(icon) icon.innerHTML = svg; 
    if(iconMob) iconMob.innerHTML = svg;

    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    if(typeof window.renderCart === 'function') window.renderCart(); 
    if(typeof window.renderFavDrawer === 'function') window.renderFavDrawer();

    const currentUser = API.get('bv_current_user', null);
    if(currentUser || localStorage.getItem('isAdminAuth') === 'true') window.initRealtime();
    
    window.updateProfileMenu(); 

    const burgerBtn = document.getElementById('burger');
    if(burgerBtn) { burgerBtn.onclick = function(e) { e.stopPropagation(); if(typeof window.toggleMenu === 'function') window.toggleMenu(); }; }
};

let lastScrollTop = 0;
let isScrollingUp = false;

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if(header) header.classList.toggle('scrolled', window.scrollY > 50);
    
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    isScrollingUp = currentScroll < lastScrollTop && currentScroll > 400;
    
    const topBtn = document.getElementById('scrollToTopBtn');

    if(isScrollingUp) { 
        if(topBtn) { topBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4'); topBtn.classList.add('opacity-100', 'translate-y-0'); }
    } else {
        if(topBtn) { topBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4'); topBtn.classList.remove('opacity-100', 'translate-y-0'); }
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, { passive: true });

const overlay = document.getElementById('overlay');
const cartOverlay = document.getElementById('cartOverlay');
const favOverlay = document.getElementById('favOverlay');
if(overlay) overlay.onclick = () => { if(typeof window.toggleMenu === 'function') window.toggleMenu(); };
if(cartOverlay) cartOverlay.onclick = () => { if(typeof window.toggleCart === 'function') window.toggleCart(); };
if(favOverlay) favOverlay.onclick = () => { if(typeof window.toggleFavDrawer === 'function') window.toggleFavDrawer(); };

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
        const compressedBlob = await compressImage(file);
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
    initDynamicMegaMenu();
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
            renderMegaMenuUI(categoriesTree, categoriesFlat);
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

                if (categoriesTree.length > 0) {
                    localStorage.setItem('bv_storage_categories_tree', JSON.stringify(categoriesTree));
                    localStorage.setItem('bv_storage_categories_flat', JSON.stringify(categoriesFlat));
                    renderMegaMenuUI(categoriesTree, categoriesFlat);
                }
            }
        } catch (err) {
            console.warn("Помилка завантаження категорій з site_storage:", err);
        }
    }

    // Оновлення при зміні мови
    window.addEventListener('langChanged', () => {
        if (Array.isArray(categoriesTree) && categoriesTree.length > 0) {
            renderMegaMenuUI(categoriesTree, categoriesFlat);
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
        const title = getLocalizedText(cat.name || cat.title || cat.label, currentLang) || 'Категорія';
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

        const title = getLocalizedText(cat.name || cat.title || cat.label, currentLang) || 'Категорія';
        const catId = cat.id || cat.slug || '';
        
        // Знаходимо підкатегорії через універсальний пошук
        const subItems = getSubcategoriesForCategory(cat, categoriesFlat);
        const bannerImg = cat.image || cat.banner_url || cat.img || '';

        // Генеруємо список підкатегорій
        let subLinksHtml = '';
        if (subItems.length > 0) {
            subLinksHtml = subItems.map(sub => {
                // Підтримка як об'єктів {name: "..."}, так і простих рядків "Каблучки з діамантами"
                const subTitle = typeof sub === 'string' 
                    ? sub 
                    : getLocalizedText(sub.name || sub.title || sub.label || sub.text || sub, currentLang);
                
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
    initDynamicGallery();
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
            renderGalleryUI(galleryContainer, galleryData);
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
                renderGalleryUI(galleryContainer, galleryData);
            }
        } catch (err) {
            console.warn("Не удалось обновить галерею из Supabase:", err);
        }
    }

    // Инициализируем один глобальный слушатель для открытия фото во весь экран
    initGalleryLightbox(galleryContainer);
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
        if (imgSrc) openLightboxModal(imgSrc, title);
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




// ==========================================
// МОДУЛЬ БАНЕРІВ (SPA & Admin)
// ==========================================

let banners = [];

// 1. ВИВЕДЕННЯ БАНЕРІВ НА ГОЛОВНІЙ СТОРІНЦІ
// Викликайте цю функцію всередині вашого роутера/функції генерації головної сторінки,
// коли блок #homeBannersSlider вже з'явився в DOM.
async function renderHomeBanners() {
    const sliderContainer = document.getElementById('homeBannersSlider');
    if (!sliderContainer) return;

    try {
        const { data, error } = await _supabase
            .from('site_storage')
            .select('value')
            .eq('key', 'bv_banners')
            .single();

        if (error || !data || !data.value || data.value.length === 0) {
            sliderContainer.innerHTML = '';
            return;
        }

        sliderContainer.innerHTML = data.value.map(b => `
            <div class="banner-slide relative rounded-2xl overflow-hidden shadow-lg group">
                <a href="${b.link || '#'}" target="_blank" class="block">
                    <img src="${b.image}" alt="Banner" class="w-full aspect-[21/9] object-cover transition-transform duration-500 group-hover:scale-105">
                </a>
            </div>
        `).join('');
    } catch (err) {
        console.error('Помилка завантаження банерів:', err);
    }
}


// 2. ЗАВАНТАЖЕННЯ БАНЕРІВ В АДМІНКУ
// Викликайте цю функцію при перемиканні на вкладку управління візуалами/банерами в адмінці.
async function loadBannersAdmin() {
    try {
        const { data } = await _supabase
            .from('site_storage')
            .select('value')
            .eq('key', 'bv_banners')
            .single();
        
        banners = (data && data.value) ? data.value : [];
        renderBannersAdmin();
    } catch (err) {
        banners = [];
        renderBannersAdmin();
    }
}


// 3. РЕНДЕРИНГ СІТКИ БАНЕРІВ В АДМІНЦІ
function renderBannersAdmin() {
    const container = document.getElementById('bannersListContainer');
    if (!container) return;

    if (banners.length === 0) {
        container.innerHTML = '<div class="text-xs text-gray-500 col-span-full">Банерів поки немає. Додайте перший банер.</div>';
        return;
    }

    container.innerHTML = banners.map((banner, index) => `
        <div class="glass-panel p-3 relative group overflow-hidden border border-white/10 rounded-xl bg-white/5">
            <img src="${banner.image}" class="w-full aspect-[21/9] object-cover rounded-lg border border-white/10 mb-3">
            <div class="text-[11px] text-gray-300 truncate mb-3">
                <span class="text-[#c5a059] font-bold">Посилання:</span> ${banner.link || 'Не вказано'}
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="openBannerModal(${index})" class="flex-1 btn-secondary text-xs py-1.5">Редагувати</button>
                <button type="button" onclick="deleteBanner(${index})" class="btn-danger text-xs py-1.5 px-3">Видалити</button>
            </div>
        </div>
    `).join('');
}


// 4. КЕРУВАННЯ МОДАЛЬНИМ ВІКНОМ АДМІНКИ
window.openBannerModal = function(index = null) {
    const form = document.getElementById('bannerForm');
    if (form) form.reset();
    
    document.getElementById('banner-id').value = '';
    const preview = document.getElementById('bannerPreview');
    if (preview) {
        preview.src = '';
        preview.classList.add('hidden');
    }

    if (index !== null && banners[index]) {
        const b = banners[index];
        document.getElementById('banner-id').value = index;
        document.getElementById('banner-img').value = b.image || '';
        document.getElementById('banner-link').value = b.link || '';
        
        if (b.image) {
            preview.src = b.image;
            preview.classList.remove('hidden');
        }
        document.getElementById('bannerModalTitle').innerText = 'Редагувати банер';
    } else {
        document.getElementById('bannerModalTitle').innerText = 'Додати банер';
    }

    document.getElementById('bannerModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('bannerModal').classList.remove('opacity-0'), 10);
};

window.closeBannerModal = function() {
    document.getElementById('bannerModal').classList.add('opacity-0');
    setTimeout(() => document.getElementById('bannerModal').classList.add('hidden'), 300);
};


// 5. ЗБЕРЕЖЕННЯ ТА ВИДАЛЕННЯ (СИНХРОНІЗАЦІЯ З SUPABASE)
document.addEventListener('DOMContentLoaded', () => {
    const bannerForm = document.getElementById('bannerForm');
    if (bannerForm) {
        bannerForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const indexStr = document.getElementById('banner-id').value;
            const imgUrl = document.getElementById('banner-img').value;
            const link = document.getElementById('banner-link').value;

            if (!imgUrl) {
                alert('Вкажіть посилання на зображення!');
                return;
            }

            const bannerData = { image: imgUrl, link: link };

            if (indexStr !== '' && !isNaN(indexStr)) {
                banners[Number(indexStr)] = bannerData;
            } else {
                banners.push(bannerData);
            }

            // Зберігаємо масив у Supabase
            const { error } = await _supabase
                .from('site_storage')
                .upsert({ key: 'bv_banners', value: banners });

            if (error) {
                console.error(error);
                alert('Помилка збереження в базу!');
                return;
            }

            renderBannersAdmin();
            closeBannerModal();
            if (typeof showNotification === 'function') showNotification('Зміни успішно збережено!');
        };
    }
});

window.deleteBanner = async function(index) {
    if (confirm('Ви впевнені, що хочете видалити цей банер?')) {
        banners.splice(index, 1);
        
        const { error } = await _supabase
            .from('site_storage')
            .upsert({ key: 'bv_banners', value: banners });

        if (error) {
            alert('Помилка при видаленні!');
            return;
        }

        renderBannersAdmin();
        if (typeof showNotification === 'function') showNotification('Банер видалено!');
    }
};



// Функція завантаження та виведення банерів на головній сторінці
async function initMainBanners() {
    const container = document.getElementById('mainBannerContainer');
    if (!container) return;

    try {
        const { data, error } = await _supabase
            .from('site_storage')
            .select('value')
            .eq('key', 'bv_banners')
            .single();

        if (error || !data || !data.value || data.value.length === 0) {
            container.innerHTML = '<div class="text-center py-10 text-gray-400 text-xs tracking-widest uppercase">Банери відсутні</div>';
            return;
        }

        const banners = data.value;

        // Використовуємо клас .banner-slide для зв'язку з CSS стилями
        container.innerHTML = banners.map(b => {
            const imgSrc = b.image || b.img || b.url || b.imageUrl;
            if (!imgSrc) return '';

            return `
                <a href="${b.link || '#'}" class="banner-slide block relative w-full h-full group">
                    <img src="${imgSrc}" alt="Banner">
                </a>
            `;
        }).join('');

    } catch (err) {
        console.error('Помилка завантаження банерів:', err);
    }
}

initMainBanners();
