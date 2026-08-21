import { API } from '../services/storage.js';
import { _supabase } from '../services/supabase.js';
import { flags, sunSVG, moonSVG, formatterPrice, sunIconSvg, moonIconSvg } from '../utils/constants.js';

let categoriesTree = [];
let products = [];

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
    document.querySelectorAll('[data-i18n]').forEach(el => el.innerHTML = window.i18n[lang][el.dataset.i18n] || el.innerHTML);
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = window.i18n[lang][el.dataset.i18nPlaceholder] || el.placeholder);
    API.set('bv_lang', lang);
    window.renderCart();
    window.renderFavDrawer();
    
    if(document.getElementById('dynamicHomeBlocksContainer') && typeof window.renderHomeSections === 'function') window.renderHomeSections();
    if(typeof window.renderCatalogBatch === 'function') window.renderCatalogBatch(); 
    if(document.getElementById('productContainer') && typeof window.renderProductPage === 'function') window.renderProductPage();
    
    const mobLangList = document.getElementById('mobLangList');
    if(mobLangList && mobLangList.classList.contains('open')) window.toggleAccordion('mobLangList', 'mobLangArrow');
};

// НОВА ФУНКЦІЯ: Глобальне створення модалки авторизації
window.injectAuthModal = function() {
    if (document.getElementById('authModal')) return; // Вже існує

    const modalHtml = `
    <div id="authModal" class="fixed inset-0 bg-black/80 z-[6000] hidden opacity-0 transition-opacity flex items-center justify-center p-4 backdrop-blur-md" aria-modal="true" role="dialog">
        <div class="glass-panel p-8 w-full max-w-sm relative rounded-none shadow-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden">
            <button onclick="window.closeAuthModal()" class="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--danger)] text-3xl leading-none transition-colors z-10">&times;</button>
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
                        
                        
                    </div>

                    <div class="text-center text-xs text-[var(--text-muted)] mt-4">
                        <span id="authToggleText">Немає акаунта?</span> 
                        <button type="button" onclick="window.toggleAuthMode(event)" class="text-[var(--gold-muted)] font-bold hover:underline ml-1" id="authToggleLink">Зареєструватися</button>
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

window.i18n = {
    uk: { 
        m1: "Головна", m2: "Каталог", m_gallery: "Галерея", m_price: "Прайс", m_atelier: "Ексклюзив", m_info: "info", m_menu: "Меню",
        search_ph: "Пошук...", search_mob_ph: "Пошукаємо прикрасу?...",
        cart_title: "Кошик", cart_subtotal: "Підсумок:", cart_clear: "Очистити",
        fav_title: "Улюблене",
        exc_subtitle: "Individual Order", exc_title_main: "ЕКСКЛЮЗИВ", btn_details: "Дізнатися більше",
        cat_subtitle: "Our World",
        badge_pre_order: "Під замовлення",
        badge_sold_out: "Немає в наявності",
        badge_new: "Новинка",
        badge_exclusive: "Ексклюзив",
        out_stock: "Немає",
        pokupka: "Купити",
        btn_buy: "Купити",
        btn_buy_prefix: "за",
        footer_desc: "Формуємо сімейні цінності у дорогоцінних металах з 1984 року.",
        footer_phone_title: "Контактний телефон",
        footer_phone_sub: "Згідно з тарифами вашого оператора",
        footer_socials_title: "Ми в соцмережах",
        footer_address_1: "вул. Торгова, 68, Ізмаїл",
        footer_schedule_1: "Пн–Нд: 08:00 – 17:00",
        footer_address_2: "вул. Покровська, 57, Ізмаїл",
        footer_schedule_2: "Пн–Нд: 09:00 – 17:00",
        footer_col_buyers: "Покупцям",
        footer_link_delivery: "Доставка та оплата",
        footer_link_warranty: "Гарантія",
        footer_link_services: "Послуги та Прайс",
        footer_col_catalog: "Каталог",
        footer_cat_rings: "Каблучки",
        footer_cat_earrings: "Сережки",
        footer_cat_chains: "Ланцюжки",
        footer_cat_pendants: "Кулони та підвіски",
        footer_dev: "Розроблено:"
    },
    ua: { 
        m1: "Головна", m2: "Каталог", m_gallery: "Галерея", m_price: "Прайс", m_atelier: "Ексклюзив", m_info: "info", m_menu: "Меню",
        search_ph: "Пошук...", search_mob_ph: "Пошукаємо прикрасу?...",
        cart_title: "Кошик", cart_subtotal: "Підсумок:", cart_clear: "Очистити",
        fav_title: "Улюблене",
        exc_subtitle: "Individual Order", exc_title_main: "ЕКСКЛЮЗИВ", btn_details: "Дізнатися більше",
        cat_subtitle: "Our World",
        badge_pre_order: "Під замовлення",
        badge_sold_out: "Немає в наявності",
        badge_new: "Новинка",
        badge_exclusive: "Ексклюзив",
        out_stock: "Немає",
        pokupka: "Купити",
        btn_buy: "Купити",
        btn_buy_prefix: "за",
        footer_desc: "Формуємо сімейні цінності у дорогоцінних металах з 1984 року.",
        footer_phone_title: "Контактний телефон",
        footer_phone_sub: "Згідно з тарифами вашого оператора",
        footer_socials_title: "Ми в соцмережах",
        footer_address_1: "вул. Торгова, 68, Ізмаїл",
        footer_schedule_1: "Пн–Нд: 08:00 – 17:00",
        footer_address_2: "вул. Покровська, 57, Ізмаїл",
        footer_schedule_2: "Пн–Нд: 09:00 – 17:00",
        footer_col_buyers: "Покупцям",
        footer_link_delivery: "Доставка та оплата",
        footer_link_warranty: "Гарантія",
        footer_link_services: "Послуги та Прайс",
        footer_col_catalog: "Каталог",
        footer_cat_rings: "Каблучки",
        footer_cat_earrings: "Сережки",
        footer_cat_chains: "Ланцюжки",
        footer_cat_pendants: "Кулони та підвіски",
        footer_dev: "Розроблено:" 
    },
    ru: { 
        m1: "Главная", m2: "Каталог", m_gallery: "Галерея", m_price: "Прайс", m_atelier: "Эксклюзив", m_info: "info", m_menu: "Меню",
        search_ph: "Поиск...", search_mob_ph: "Поищем украшение?...",
        cart_title: "Корзина", cart_subtotal: "Итог:", cart_clear: "Очистить",
        fav_title: "Избранное",
        exc_subtitle: "Individual Order", exc_title_main: "ЭКСКЛЮЗИВ", btn_details: "Узнать больше",
        cat_subtitle: "Our World",
        badge_pre_order: "Под заказ",
        badge_sold_out: "Нет в наличии",
        badge_new: "Новинка",
        badge_exclusive: "Эксклюзив",
        out_stock: "Нет",
        btn_buy: "Купить",
        btn_buy_prefix: "за",
        footer_desc: "Формируем семейные ценности в драгоценных металлах с 1984 года.",
        footer_phone_title: "Контактный телефон",
        footer_phone_sub: "Согласно тарифам вашего оператора",
        footer_socials_title: "Мы в соцсетях",
        footer_address_1: "ул. Торговая, 68, Измаил",
        footer_schedule_1: "Пн–Вс: 08:00 – 17:00",
        footer_address_2: "ул. Покровская, 57, Измаил",
        footer_schedule_2: "Пн–Вс: 09:00 – 17:00",
        footer_col_buyers: "Покупателям",
        footer_link_delivery: "Доставка и оплата",
        footer_link_warranty: "Гарантия",
        footer_link_services: "Услуги и Прайс",
        footer_col_catalog: "Каталог",
        footer_cat_rings: "Кольца",
        footer_cat_earrings: "Серьги",
        footer_cat_chains: "Цепочки",
        footer_cat_pendants: "Кулоны и подвески",
        footer_dev: "Разработано:"
    },
    en: { 
        m1: "Home", m2: "Catalog", m_gallery: "Gallery", m_price: "Prices", m_atelier: "Exclusive", m_info: "info", m_menu: "Menu",
        search_ph: "Search...", search_mob_ph: "Looking for jewelry?...",
        cart_title: "Cart", cart_subtotal: "Subtotal:", cart_clear: "Clear",
        fav_title: "Favorites",
        exc_subtitle: "Individual Order", exc_title_main: "EXCLUSIVE", btn_details: "Discover more",
        cat_subtitle: "Our World",
        badge_pre_order: "Pre-order",
        badge_sold_out: "Sold out",
        badge_new: "New",
        badge_exclusive: "Exclusive",
        out_stock: "Out of stock",
        btn_buy: "Buy",
        btn_buy_prefix: "for",
        footer_desc: "Shaping family values in precious metals since 1984.",
        footer_phone_title: "Contact Phone",
        footer_phone_sub: "According to your operator's tariffs",
        footer_socials_title: "Follow us",
        footer_address_1: "68 Torhova St., Izmail",
        footer_schedule_1: "Mon–Sun: 08:00 AM – 05:00 PM",
        footer_address_2: "57 Pokrovska St., Izmail",
        footer_schedule_2: "Mon–Sun: 09:00 AM – 05:00 PM",
        footer_col_buyers: "Customer Care",
        footer_link_delivery: "Delivery & Payment",
        footer_link_warranty: "Warranty",
        footer_link_services: "Services & Prices",
        footer_col_catalog: "Catalog",
        footer_cat_rings: "Rings",
        footer_cat_earrings: "Earrings",
        footer_cat_chains: "Chains",
        footer_cat_pendants: "Pendants & Charms",
        footer_dev: "Developed by:"
    }
};

// Робимо 'ua' точною копією 'uk' автоматично, щоб уникнути помилок доступу
window.i18n.ua = window.i18n.uk;
window.getLoc = function(obj, field) {
    if (!obj) return '';
    let rawLang = API.get('bv_lang', 'uk');
    // Нормалізуємо 'ua' у 'uk' для сумісності зі словниками об'єктів
    const lang = (rawLang === 'ua') ? 'uk' : rawLang;
    
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') {
        if (field) {
            if (typeof obj[field] === 'object' && obj[field] !== null) {
                return obj[field][lang] || obj[field]['uk'] || obj[field]['ua'] || '';
            }
            if (lang === 'uk') return obj[field] || '';
            const locField = field + lang.toUpperCase(); 
            return obj[locField] || obj[field] || ''; 
        } else {
            return obj[lang] || obj['uk'] || obj['ua'] || '';
        }
    }
    return '';
};
// ==========================================
// 3. БАЗА ДАНИХ ТА СИНХРОНІЗАЦІЯ (SUPABASE)
// ==========================================

const SITE_STORAGE_KEYS = [
    'bv_home_blocks',
    'bv_categories_flat',
    'bv_categories_tree',
    'bv_settings',
    'bv_site_settings',
    'bv_banners',
    'bv_gallery',
    'bv_pages_content',
    'bv_price_list',
    'bv_exclusive_process',
    'bv_exclusive_materials',
];

function applyCloudToUI() {
    if (typeof window.generateMenus === 'function') window.generateMenus();
    if (typeof window.renderHomeSections === 'function') window.renderHomeSections();
    if (typeof window.updateFavoriteIcons === 'function') window.updateFavoriteIcons();
    if (typeof window.initMarqueeSim === 'function' && document.getElementById('marqueeTrack')) {
        window.initMarqueeSim();
    }
    if (typeof window.renderCatalogBatch === 'function') window.renderCatalogBatch();
    if (typeof window.renderExclusivePage === 'function') window.renderExclusivePage();
    if (typeof window.applySiteSettings === 'function') window.applySiteSettings();
    else if (typeof window.applyAdminSettings === 'function') window.applyAdminSettings();
    try {
        window.dispatchEvent(new CustomEvent('bv:data-updated', { detail: { key: '*', source: 'cloud' } }));
    } catch (_) { /* ignore */ }
}

function ingestSiteStorageRows(rows) {
    if (!Array.isArray(rows)) return;
    let flat = null;
    let tree = null;
    rows.forEach((item) => {
        if (!item || !item.key) return;
        let val = item.value;
        if (typeof val === 'string') {
            try { val = JSON.parse(val); } catch (_) { /* keep string */ }
        }
        if (typeof window.syncLocalCatalog === 'function') {
            // syncLocalCatalog also rebuilds tree from flat — call API.set first for raw keys
            API.set(item.key, val);
        } else {
            API.set(item.key, val);
        }
        if (item.key === 'bv_categories_flat') flat = val;
        if (item.key === 'bv_categories_tree') tree = val;
        if (item.key === 'bv_gallery') {
            localStorage.setItem('bv_storage_gallery', JSON.stringify(val || []));
            localStorage.setItem('bv_gallery_cache', JSON.stringify(val || []));
        }
        if (item.key === 'bv_site_settings' && !API.get('bv_settings', null)) {
            API.set('bv_settings', val);
        }
    });

    // Admin writes flat; storefront often reads tree — keep both in sync
    if (Array.isArray(flat)) {
        const built = typeof window.buildCategoriesTree === 'function'
            ? window.buildCategoriesTree(flat)
            : (typeof window.buildTree === 'function' ? window.buildTree(flat) : tree);
        if (built) {
            API.set('bv_categories_tree', built);
            localStorage.setItem('bv_storage_categories_tree', JSON.stringify(built));
            localStorage.setItem('bv_storage_categories_flat', JSON.stringify(flat));
            API.set('bv_categories_flat', flat);
        }
    } else if (Array.isArray(tree)) {
        localStorage.setItem('bv_storage_categories_tree', JSON.stringify(tree));
    }
}

// Завантаження даних з хмари при старті
window.loadCloudData = async function() {
    if (!navigator.onLine || !_supabase) {
        console.warn('Supabase не підключено або відсутній інтернет. Працюємо з локальними даними.');
        products = API.get('bv_products', []);
        window.products = products;
        applyCloudToUI();
        return;
    }
    
    try {
        // 1. Товари з таблиці products (в т.ч. порожній список = повна синхронізація)
        const { data: prodData, error: prodError } = await _supabase.from('products').select('*');
        if (prodError) throw prodError;
        
        if (Array.isArray(prodData)) {
            products = prodData;
            window.products = prodData;
            if (typeof window.syncLocalCatalog === 'function') {
                window.syncLocalCatalog('bv_products', prodData, { source: 'cloud' });
            } else {
                API.set('bv_products', prodData);
            }
        }

        // 2. Усі ключі site_storage (категорії, налаштування, банери, блоки…)
        const { data: storageRows, error: storageError } = await _supabase
            .from('site_storage')
            .select('key, value')
            .in('key', SITE_STORAGE_KEYS);

        if (!storageError && storageRows) {
            ingestSiteStorageRows(storageRows);
        }
        
        applyCloudToUI();
        
    } catch (err) {
        console.error('Помилка завантаження даних з Supabase:', err);
        products = API.get('bv_products', []);
        window.products = products;
        applyCloudToUI();
    }
};

/** Live sync: Realtime + focus/visibility + cross-tab messages */
window.initCatalogRealtime = function() {
    if (window.__bvCatalogRealtimeInit) return;
    window.__bvCatalogRealtimeInit = true;

    let refreshTimer = null;
    const scheduleRefresh = () => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => {
            if (typeof window.loadCloudData === 'function') window.loadCloudData();
        }, 400);
    };

    if (typeof window.onCatalogUpdate === 'function') {
        window.onCatalogUpdate((detail) => {
            if (detail && detail.source === 'cloud') return;
            scheduleRefresh();
        });
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') scheduleRefresh();
    });
    window.addEventListener('focus', scheduleRefresh);

    if (!_supabase || typeof _supabase.channel !== 'function') return;

    try {
        _supabase
            .channel('bv-storefront-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, scheduleRefresh)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_storage' }, scheduleRefresh)
            .subscribe();
    } catch (err) {
        console.warn('Realtime catalog sync unavailable:', err);
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

// sunIconSvg → import
// moonIconSvg → import

function updateThemeIcon(isDark) {
    const iconEl = document.getElementById('themeIcon');
    if (!iconEl) return;
    
    iconEl.setAttribute('fill', 'none');
    iconEl.setAttribute('stroke', 'currentColor');
    iconEl.innerHTML = isDark ? sunIconSvg : moonIconSvg;
}

function getTargetTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    window.updateThemeIcon(theme === 'dark');
}

// Ручное переключение по кнопке (сохраняет выбор навсегда)
window.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || window.getTargetTheme();
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    
    try {
        localStorage.setItem('theme', nextTheme);
    } catch (e) {}
    
    window.applyTheme(nextTheme);
};

// Синхронизация иконки при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.applyTheme(window.getTargetTheme());
});

// Защита от сброса темы при динамической отрисовке страниц SPA
const themeGuard = new MutationObserver(() => {
    const targetTheme = window.getTargetTheme();
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme !== targetTheme) {
        document.documentElement.setAttribute('data-theme', targetTheme);
    }
});

themeGuard.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});



function getCurrentUser() { return API.get('bv_current_user', null); }
function getScopedStorageKey(baseKey) {
    const currentUser = window.getCurrentUser();
    if (!currentUser || !currentUser.username) return baseKey;
    return `${baseKey}_${currentUser.username.toLowerCase()}`;
}

function migrateScopedState() {
    const currentUser = window.getCurrentUser();
    if (!currentUser || !currentUser.username) return;
    const userCartKey = window.getScopedStorageKey('bv_cart');
    const globalCart = API.get('bv_cart', null);
    if (!API.get(userCartKey, null) && Array.isArray(globalCart)) API.set(userCartKey, globalCart);
}

function getFavs() {
    const currentUser = window.getCurrentUser();
    if (currentUser && Array.isArray(currentUser.favs)) { 
        API.set(window.getScopedStorageKey('bv_favs'), currentUser.favs); 
        return currentUser.favs;
    }
    return API.get(window.getScopedStorageKey('bv_favs'), []);
}

window.setFavs = async function(favs) {
    API.set(window.getScopedStorageKey('bv_favs'), favs);
    API.set('bv_favs', favs);
    const currentUser = window.getCurrentUser();
    if (currentUser && currentUser.id && _supabase) {
        currentUser.favs = favs; 
        API.set('bv_current_user', currentUser);
        await _supabase.from('profiles').update({ favs: favs }).eq('id', currentUser.id);
    }
};

function getCart() { return API.get(window.getScopedStorageKey('bv_cart'), []); }
function setCart(cart) { API.set(window.getScopedStorageKey('bv_cart'), cart); API.set('bv_cart', cart); }

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
            const svgIcon = window.getCategoryIconSVG(cat.id);
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
    <div class="flex flex-col h-full">
        <!-- Шапка (статичная) -->
        <div class="flex justify-between items-center pb-4 border-b border-[var(--border)] pt-4 px-4 flex-shrink-0">
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

        <!-- Основной контент (скроллится) -->
        <div class="px-4 py-2 flex flex-col flex-grow overflow-y-auto custom-scrollbar">
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
        </div>

        <!-- Футер (статичный внизу, стилизован под шапку) -->
        <div class="flex justify-between items-center pt-4 pb-4 px-4 border-t border-[var(--border)] flex-shrink-0">
            <div class="flex flex-col gap-1 text-[11px] text-[var(--text-muted)]">
                <a href="tel:+380634540901" class="js-site-phone text-[13px] text-[var(--gold-muted)] font-medium transition hover:opacity-80">+38 063 45 40 901</a>
                <span class="js-site-addresses-line">вул. Торгова, 68 • вул. Покровська, 57</span>
            </div>
            <div class="flex items-center gap-3">
                <a href="https://www.instagram.com/bv.jewelry_izmail" target="_blank" class="inst-link js-site-inst w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] hover:text-[#111] hover:bg-[var(--gold-muted)] hover:border-[var(--gold-muted)] transition-all duration-300">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://t.me/bv_jewelry_izmail" target="_blank" class="tg-link js-site-tg w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] hover:text-[#111] hover:bg-[var(--gold-muted)] hover:border-[var(--gold-muted)] transition-all duration-300">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </a>
            </div>
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
// 5. КОШИК ТА УЛЮБЛЕНЕ (Виправлено покращене керування сердечками)
// ==========================================

// Централізована функція керування скролом сторінки
window.updateBodyOverflow = function() {
    const cartActive = document.getElementById('cartDrawer')?.classList.contains('active');
    const favActive = document.getElementById('favDrawer')?.classList.contains('active');
    const menuActive = document.getElementById('sideMenu')?.classList.contains('active');

    if (cartActive || favActive || menuActive) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
};

window.toggleCart = function() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (!drawer || !overlay) return;
    
    if (!drawer.classList.contains('active')) {
        window.renderCart();
        drawer.classList.add('active'); 
        overlay.classList.add('active');
    } else {
        drawer.classList.remove('active'); 
        overlay.classList.remove('active');
    }
    window.updateBodyOverflow();
};

window.addToCart = function(id, title, variant, price, img) {
    let cart = window.getCart();
    
    // Захист від undefined / null у вхідних даних
    const safeTitle = title ? String(title) : '';
    let extractedSize = null;
    let cleanTitle = safeTitle;
    
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
            variant: (variant && variant !== 'undefined') ? String(variant) : '', 
            price: Number(price) || 0, 
            img: (img && img !== 'undefined') ? String(img) : '', 
            qty: 1,
            sku: sku,
            size: extractedSize
        });
    }
    
    window.setCart(cart);
    window.renderCart();
    if (!document.getElementById('cartDrawer').classList.contains('active')) window.toggleCart();
};

window.updateCartQty = function(cartId, delta) {
    const cart = window.getCart();
    const item = cart.find((entry) => entry.cartId === cartId);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    window.setCart(cart);
    window.renderCart();
};

window.removeFromCart = function(cartId) {
    let cart = window.getCart();
    cart = cart.filter(item => item.cartId !== cartId);
    window.setCart(cart);
    window.renderCart();
};

window.clearEntireCart = function(force = false) {
    if(force || confirm('Ви впевнені, що хочете очистити кошик?')) {
        window.setCart([]);
        window.renderCart();
    }
};

window.checkoutOrder = function() {
    const cart = window.getCart();
    if(cart.length === 0) { return alert('Ваш кошик порожній!'); }
    window.toggleCart();
    window.location.href = 'checkout.html';
};

window.renderCart = function() {
    let cart = window.getCart();
    const cartBody = document.getElementById('cartBody');
    const cartBadges = document.querySelectorAll('.cart-badge:not(.fav-badge)');
    const subtotalVal = document.querySelector('.cart-subtotal-val');
    let total = 0, totalQty = 0;
    
    if(!cartBody) return;
    cartBody.innerHTML = '';

    // Пустое состояние корзины
    if (cart.length === 0) {
        const lang = API.get('bv_lang', 'uk');
        const emptyMsg = (typeof window.i18n !== 'undefined' && window.i18n[lang] && window.i18n[lang].cart_empty) 
            ? window.i18n[lang].cart_empty 
            : 'Ваш кошик порожній';

        cartBody.innerHTML = `
            <div class="cart-empty-msg text-center text-[var(--text-muted)] my-12 flex flex-col items-center justify-center gap-5 px-4">
                <p class="text-sm uppercase tracking-wider opacity-80">${emptyMsg}</p>
                <a href="catalog.html" onclick="if(window.toggleCart) window.toggleCart()" class="btn-solid inline-block bg-[var(--gold-muted)] !text-[#111] font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-none hover:opacity-90 transition-all active:scale-95 text-center">
                    Перейти до каталогу
                </a>
            </div>
        `;
        
        if(subtotalVal) subtotalVal.innerText = '0 ₴';
        cartBadges.forEach(b => {
            b.innerText = '0';
            b.style.display = 'none';
        });
        
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
                    <span class="text-sm font-semibold uppercase tracking-wide leading-tight line-clamp-2">${window.escapeHtml(item.title)}</span>
                    <div class="flex flex-wrap items-center gap-2 mt-1">
                        ${sizeBadge}
                        ${skuBadge}
                    </div>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="text-sm font-bold text-[var(--gold-muted)]">${formatterPrice.format(item.price)} ₴</span>
                        <div class="inline-flex items-center rounded-none border border-[var(--border)] bg-[var(--bg-elevated)]">
                            <button class="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] btn-cross" onclick="window.updateCartQty('${item.cartId}', -1)">−</button>
                            <span class="px-2 text-xs text-[var(--text-main)] font-semibold min-w-6 text-center">${item.qty}</span>
                            <button class="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] btn-cross" onclick="window.updateCartQty('${item.cartId}', 1)">+</button>
                        </div>
                    </div>
                </div>
                <button class="cart-item-remove absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)] btn-cross" onclick="window.removeFromCart('${item.cartId}')">
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

// Допоміжна перевірка авторизації
function checkUserIsLogged() {
    let isLogged = false;
    if (localStorage.getItem('user') || localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('auth')) {
        isLogged = true;
    } else {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('auth') || key.includes('token') || key.includes('sb-'))) {
                const val = localStorage.getItem(key);
                if (val && val.length > 5) { isLogged = true; break; }
            }
        }
    }
    const favoritesCheck = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favoritesCheck.length > 0) isLogged = true;
    return isLogged;
}

// ==========================================
// дает авторизированным профилям сохранить товар в избранные
// ==========================================

window.updateFavoriteIcons = function() {
    const rawFavs = typeof window.getFavs === 'function' ? window.getFavs() : JSON.parse(localStorage.getItem('favorites') || '[]');
    const favs = rawFavs.map(String);
    
    // Проходимо по всіх кнопках обраного, які мають data-id
    document.querySelectorAll('button[data-id]').forEach(btn => {
        const onclick = btn.getAttribute('onclick') || '';
        // Перевіряємо, чи це дійсно кнопка обраного (містить handleFavClick або window.toggleFav)
        if (!onclick.includes('Fav')) return;

        const prodId = String(btn.getAttribute('data-id'));
        const isFav = favs.includes(prodId);
        const svg = btn.querySelector('svg');
        const path = svg ? svg.querySelector('path') : null;

        if (isFav) {
            // Фарбуємо в червоний з найвищим пріоритетом (!important)
            btn.classList.remove('text-[#888]', 'text-[#aaa]', 'dark:text-[#aaa]');
            btn.classList.add('text-red-500');
            btn.style.setProperty('color', '#ef4444', 'important');
            
            if (svg) {
                svg.setAttribute('fill', 'currentColor');
                svg.style.setProperty('fill', 'currentColor', 'important');
            }
            if (path) {
                path.setAttribute('fill', 'currentColor');
                path.style.setProperty('fill', 'currentColor', 'important');
            }
        } else {
            // Повертаємо сірий колір та видаляємо заливку
            btn.classList.remove('text-red-500');
            btn.style.removeProperty('color');
            
            if (svg) {
                svg.setAttribute('fill', 'none');
                svg.style.setProperty('fill', 'none', 'important');
            }
            if (path) {
                path.setAttribute('fill', 'none');
                path.style.setProperty('fill', 'none', 'important');
            }
        }
    });
};

// Автоматичне спостереження за новими картками у SPA
if (!window._favObserverInitialized) {
    window._favObserverInitialized = true;
    const observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0)) {
            setTimeout(window.updateFavoriteIcons, 30);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', window.updateFavoriteIcons);
window.addEventListener('popstate', () => setTimeout(window.updateFavoriteIcons, 100));


window.toggleFav = function(id) {
    // Перевірка авторизації: якщо не зареєстрований — відкриваємо модалку входу
    if (!window.checkUserIsLogged()) {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal();
        } else if (typeof window.toggleAuthModal === 'function') {
            window.toggleAuthModal();
        } else {
            console.warn('Модальне вікно авторизації не знайдено');
        }
        return;
    }

    let favs = typeof window.getFavs === 'function' ? window.getFavs() : JSON.parse(localStorage.getItem('favorites') || '[]');
    const idx = favs.indexOf(id);
    
    if (idx > -1) {
        favs.splice(idx, 1); // Зняти з обраного
    } else {
        favs.push(id);       // Додати в обране
    }
    
    if (typeof window.setFavs === 'function') {
        window.setFavs(favs);
    } else {
        localStorage.setItem('favorites', JSON.stringify(favs));
    }
    
    window.updateFavoriteIcons();
    if (typeof window.renderFavDrawer === 'function') {
        window.renderFavDrawer();
    }
};

window.toggleFavDrawer = async function() {
    if (!window.checkUserIsLogged()) {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal();
        } else if (typeof window.toggleAuthModal === 'function') {
            window.toggleAuthModal();
        } else {
            console.warn('Модальне вікно авторизації не знайдено');
        }
        return;
    }

    const drawer = document.getElementById('favDrawer');
    const overlay = document.getElementById('favOverlay');
    if (!drawer) return;
    
    window.updateFavoriteIcons();

    if (!drawer.classList.contains('active')) {
        if (typeof window.renderFavDrawer === 'function') {
            window.renderFavDrawer();
        }
        drawer.classList.add('active'); 
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        drawer.classList.remove('active'); 
        if (overlay) overlay.classList.remove('active');
        if (!document.getElementById('sideMenu')?.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    }
};

window.renderFavDrawer = function() {
    let favsIds = window.getFavs();
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
        favBody.innerHTML = `<div class="text-center text-[var(--text-muted)] mt-10" data-i18n="fav_empty">${window.i18n[lang].fav_empty || "Список порожній"}</div>`;
        return;
    }

    const favProducts = allProducts.filter(p => favsIds.includes(p.id));
    favBody.innerHTML = favProducts.map(prod => {
        const base = prod.variations ? prod.variations.base : prod;
        const safeImg = window.escapeHtml((base.images && base.images.length > 0) ? base.images[0] : (base.img || base.image || ''));
        const safeName = window.escapeHtml(window.getLoc(base.name));
        const priceDisplay = base.discount && Number(base.discount) > 0 ? base.discount : base.price;

        return `
        <div class="cart-item flex gap-4 p-3 border border-[var(--border)] rounded-none mb-3 relative transition-all duration-300 hover:border-[var(--gold-muted)]/35 cursor-pointer" onclick="location.href='product.html?id=${prod.id}'">
            <img src="${safeImg}" class="w-16 h-16 object-cover border border-[var(--border)] rounded-none mix-blend-multiply">
            <div class="flex-grow flex flex-col justify-center pr-6">
                <span class="text-xs font-semibold uppercase tracking-wide line-clamp-1">${safeName}</span>
                <span class="text-[10px] text-[var(--text-muted)] mt-1">${window.escapeHtml(prod.variant || '')}</span>
                <span class="text-sm font-bold text-[var(--gold-muted)] mt-1">${formatterPrice.format(priceDisplay)} ₴</span>
            </div>
            <button class="cart-item-remove absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)] btn-cross" onclick="event.stopPropagation(); window.toggleFav('${prod.id}')" title="Видалити">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        `;
    }).join('');
};
// ==========================================
// 7. ГЛОБАЛЬНИЙ РЕНДЕР КАРТКИ ТОВАРУ
// ==========================================
window.handleFavClick = function(id) {
    // 🔥 Універсальна перевірка всіх можливих варіантів авторизації
    const isRegistered = 
        window.isLoggedIn || 
        localStorage.getItem('user_token') || 
        window.currentUser || 
        localStorage.getItem('bv_current_user') || 
        localStorage.getItem('bv_logged_in') === 'true';
    
    if (!isRegistered) {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal();
        } else if (typeof window.showAuth === 'function') {
            window.showAuth();
        } else if (typeof window.smartProfileClick === 'function') {
            window.smartProfileClick();
        } else {
            const authModal = document.getElementById('auth-modal') || document.getElementById('register-modal');
            if (authModal) {
                authModal.classList.remove('hidden');
            } else {
                alert('Будь ласка, зареєструйтеся, щоб додати товар до обраного.');
            }
        }
        return;
    }
    
    if (typeof window.toggleFav === 'function') {
        window.toggleFav(id);
    }

    // ВІДРАЗУ ОНОВЛЮЄМО ІКОНКИ НА СТОРІНЦІ ПІСЛЯ КЛИКУ
    if (typeof window.updateFavoriteIcons === 'function') {
        window.updateFavoriteIcons();
    }
    
    // Оновлення віджета/шухляди обраного, якщо є
    if (typeof window.renderFavDrawer === 'function') {
        window.renderFavDrawer();
    }
};

// Обробник кліку на кошик для товарів "під замовлення"
window.handlePreOrderClick = function() {
    const modal = document.getElementById('preorder-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        alert('Цей товар доступний лише під замовлення.');
    }
};


window.closePreOrderModal = function() {
    const modal = document.getElementById('preorder-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

window.renderProductCard = function(prod) {
    const base = prod.variations ? prod.variations.base : prod;  
    
    const isOutOfStock = prod.status === 'out-stock';
    const isPreOrder = prod.status === 'pre-order';
    
    const isRegistered = window.isLoggedIn || localStorage.getItem('user_token') || window.currentUser;
    const isFav = isRegistered && typeof window.getFavs === 'function' && window.getFavs().includes(prod.id);

    const price = base.price || 0;
    const discount = base.discount || null;
    
    const currentLang = (typeof API !== 'undefined' && API.get) ? API.get('bv_lang', 'uk') : 'uk';
    
    const dict = {
        uk: { pre: "ПІД ЗАМОВЛЕННЯ", sold: "НЕМАЄ", new: "НОВИНКА", exc: "ЕКСКЛЮЗИВ" },
        ru: { pre: "ПОД ЗАКАЗ", sold: "НЕТ", new: "НОВИНКА", exc: "ЭКСКЛЮЗИВ" },
        en: { pre: "PRE-ORDER", sold: "SOLD OUT", new: "NEW", exc: "EXCLUSIVE" }
    };
    const t = dict[currentLang] || dict.uk;

    let badgesHtml = '<div class="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">';
    
    if (isOutOfStock) {
        badgesHtml += `<div class="prod-badge badge-sold-out rounded-none text-[9px] px-1.5 py-0.5">${t.sold}</div>`;
    } else if (isPreOrder) {
        badgesHtml += `<div class="prod-badge badge-pre-order rounded-none text-[9px] px-1.5 py-0.5">${t.pre}</div>`;
    }

    // Всевариантная проверка эксклюзива и новинки
    const isSpecialItem = Boolean(
        prod.isSpecial === true || prod.isSpecial === 'true' || prod.isSpecial === 1 ||
        prod.special === true || prod.special === 'true' || prod.special === 1 ||
        prod.exclusive === true || prod.exclusive === 'true' || prod.exclusive === 1 ||
        base.isSpecial === true || base.isSpecial === 'true' || base.isSpecial === 1 ||
        base.special === true || base.special === 'true' || base.special === 1 ||
        base.exclusive === true || base.exclusive === 'true' || base.exclusive === 1
    );

    const isWeeklyItem = Boolean(
        prod.isWeekly === true || prod.isWeekly === 'true' || prod.isWeekly === 1 ||
        prod.weekly === true || prod.weekly === 'true' || prod.weekly === 1 ||
        base.isWeekly === true || base.isWeekly === 'true' || base.isWeekly === 1 ||
        base.weekly === true || base.weekly === 'true' || base.weekly === 1
    );

    if (isSpecialItem) {
        badgesHtml += `<div class="prod-badge badge-exclusive rounded-none text-[9px] px-1.5 py-0.5">${t.exc}</div>`;
    }
    
    if (isWeeklyItem) {
        badgesHtml += `<div class="prod-badge badge-new rounded-none text-[9px] px-1.5 py-0.5">${t.new}</div>`;
    }

    if (discount && Number(discount) > 0 && price > discount) {
        const percent = Math.round(((price - discount) / price) * 100);
        const badgeText = percent > 0 ? `-${percent}%` : 'SALE';
        badgesHtml += `<div class="rounded-none text-[11px] px-2 py-0.5 font-bold shadow-sm" style="background-color: #dc2626 !important; color: #ffffff !important;">${badgeText}</div>`;
    }
    
    badgesHtml += '</div>';

    let priceHtml = `<span class="text-[12px] md:text-[15px] font-bold text-[var(--gold-muted)]">${formatterPrice.format(price)} ₴</span>`;
    if (discount && Number(discount) > 0) {
        priceHtml = `<span class="text-[12px] md:text-[15px] font-bold text-[#c5a059]">${formatterPrice.format(discount)} ₴</span><span class="text-[9px] md:text-[11px] text-[#888] dark:text-[#aaa] line-through ml-1.5 opacity-70">${formatterPrice.format(price)} ₴</span>`;
    }

    const safeId = typeof window.escapeHtml === 'function' ? window.escapeHtml(prod.id || '') : (prod.id || '');
    const safeName = typeof window.escapeHtml === 'function' ? window.escapeHtml(window.getLoc(base.name)) : window.getLoc(base.name);
    const safeVariant = typeof window.escapeHtml === 'function' ? window.escapeHtml(prod.variant || '') : (prod.variant || '');
    const rawImg = (base.images && base.images.length > 0) ? base.images[0] : (base.img || base.image || '');
    const safeImg = typeof window.escapeHtml === 'function' ? window.escapeHtml(rawImg) : rawImg;

    return `
        <div class="product-card group relative flex flex-col w-full h-full bg-white dark:bg-[#1a1a1a] border border-[#f0f0f0] dark:border-[#333] overflow-hidden transition-colors duration-300">
            <div class="relative w-full aspect-square bg-transparent overflow-hidden">
                <a href="product.html?id=${safeId}" class="block w-full h-full m-0 p-0">
                    <img src="${safeImg}" class="w-full h-full m-0 p-0 object-cover" loading="lazy">
                </a>
                ${badgesHtml}
                <button class="absolute top-2 right-2 z-25 w-8 h-8 rounded-[6px] flex items-center justify-center bg-gradient-to-br from-white via-[#f4f1ea] to-[#e8e2d5] dark:from-[#2a2a2a] dark:via-[#222222] dark:to-[#1a1a1a] backdrop-blur-md border border-[#d8d0c1] dark:border-[#3a3a3a] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-95 ${isFav ? 'text-[#ff3b30]' : 'text-[#c5a059] dark:text-[#dfc384]'}" data-id="${safeId}" onclick="handleFavClick('${safeId}')" title="У вибране">
                    <svg width="15" height="15" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
            </div>
            
            <div class="card-text-block px-2.5 md:px-3 pt-2 pb-2.5 bg-white dark:bg-[#1a1a1a]">
                <div class="flex flex-col gap-0.5">
                    ${safeVariant ? `<a href="product.html?id=${safeId}" class="product-variant text-[9px] uppercase tracking-widest line-clamp-1">${safeVariant}</a>` : ''}
                    <a href="product.html?id=${safeId}" class="product-title text-[11px] md:text-[13px] font-medium leading-tight line-clamp-2">${safeName}</a>
                </div>
                
                <div class="pt-1 flex items-center justify-between">
                    <div>${priceHtml}</div>
                    <div>
                        ${!isOutOfStock ? `
                        <button onclick="${isPreOrder ? 'window.handlePreOrderClick()' : `window.addToCartById('${safeId}')`}" class="w-8 h-8 flex items-center justify-center shrink-0 ${isPreOrder ? 'text-gray-400 dark:text-gray-500 hover:opacity-80' : ''}" title="${isPreOrder ? 'Під замовлення' : 'Купити'}">
                            <svg class="w-5 h-5" fill="none" stroke="${isPreOrder ? 'currentColor' : 'var(--gold-muted, #C5A059)'}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </button>
                        ` : `
                        <span class="text-[9px] font-bold uppercase tracking-widest text-[#888] dark:text-[#aaa] shrink-0">${t.sold}</span>
                        `}
                    </div>
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
    if (html) { track.innerHTML = html; setTimeout(() => { window.createInertiaScroll('.marquee-wrapper', '#marqueeTrack', -0.5); }, 100); }
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
        window.bannerInterval = setInterval(() => window.moveBanner(1), 5000); 

        let touchStartX = 0; let touchEndX = 0;
        container.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; clearInterval(window.bannerInterval); }, {passive: true});
        container.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 40) window.moveBanner(1); 
            if (touchEndX - touchStartX > 40) window.moveBanner(-1); 
            window.bannerInterval = setInterval(() => window.moveBanner(1), 5000); 
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
    window.bannerInterval = setInterval(() => window.moveBanner(1), 5000);
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
    window.bannerInterval = setInterval(() => window.moveBanner(1), 5000);
};

// ==========================================
// 11. ГОЛОВНА ТА ПІДВАЛ: РЕНДЕР ДИНАМІЧНИХ СЕКЦІЙ 
// ==========================================
window.renderHomeSections = function() {
    let container = document.getElementById('dynamicHomeBlocksContainer');
    if (!container) return;

    let homeBlocks = [];
    if (typeof window.homeBlocks !== 'undefined' && Array.isArray(window.homeBlocks)) {
        homeBlocks = window.homeBlocks;
    } else if (typeof API !== 'undefined' && typeof API.get === 'function') {
        homeBlocks = API.get('bv_home_blocks', []);
    }

    if (typeof products === 'undefined' || !Array.isArray(products) || products.length === 0) {
        console.warn('⚠️ Масив products ще не завантажений.');
        return;
    }

    if (!Array.isArray(homeBlocks) || homeBlocks.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    const activeBlocks = homeBlocks.filter(b => b && b.active);

    activeBlocks.forEach(block => {
        // Умная фильтрация: поддерживает блоки эксклюзивов, новинок и кастомные поля
        let items = products.filter(p => {
            if (!p) return false;
            const base = p.variations ? p.variations.base : p;

            if (Array.isArray(p.blocks) && p.blocks.includes(block.id)) return true;
            if (typeof p.blocks === 'string' && p.blocks.includes(block.id)) return true;
            if (p[block.id] === true || p[block.id] === 'true' || p[block.id] === 1 || p[block.id] === '1') return true;
            if (base && (base[block.id] === true || base[block.id] === 'true' || base[block.id] === 1 || base[block.id] === '1')) return true;

            // Специальный мостик для эксклюзивов (если ID блока 'exclusive' или 'special', а в базе 'isSpecial')
            if (block.id === 'exclusive' || block.id === 'special') {
                if (p.isSpecial === true || p.isSpecial === 'true' || p.isSpecial === 1 || p.special === true || p.special === 'true' || p.special === 1 || p.exclusive === true || p.exclusive === 'true' || p.exclusive === 1) return true;
                if (base && (base.isSpecial === true || base.isSpecial === 'true' || base.isSpecial === 1 || base.special === true || base.special === 'true' || base.special === 1 || base.exclusive === true || base.exclusive === 'true' || base.exclusive === 1)) return true;
            }

            // Мостик для недельных/новых товаров
            if (block.id === 'weekly' || block.id === 'new') {
                if (p.isWeekly === true || p.isWeekly === 'true' || p.isWeekly === 1 || p.weekly === true || p.weekly === 'true' || p.weekly === 1) return true;
                if (base && (base.isWeekly === true || base.isWeekly === 'true' || base.isWeekly === 1 || base.weekly === true || base.weekly === 'true' || base.weekly === 1)) return true;
            }

            return false;
        });

        if (items.length > 0) {
            let title = block.id || '';
            if (block.name) {
                const currentLang = (typeof window.getCurrentLang === 'function') ? window.getCurrentLang() : 'uk';
                if (typeof block.name === 'object') {
                    title = block.name[currentLang] || block.name.uk || block.name.ru || block.name.en || block.id || '';
                } else {
                    title = block.name;
                }
            }

            const trackId = `block-track-${block.id}`;
            if (typeof window.renderProductCard !== 'function') return;

            const cardWrapper = (p) => `<div class="flex-none w-[50%] sm:w-[33.333%] md:w-[25%] lg:w-[20%] xl:w-[16.666%] snap-start flex px-1">${window.renderProductCard(p)}</div>`;
            
            let blockItems = [...items];
            while(blockItems.length < 12 && blockItems.length > 0) {  
                blockItems = blockItems.concat(items);  
            }
            
            html += `
            <section class="max-w-[1920px] mx-auto px-0 py-4 md:py-6 border-t border-[var(--border)]">
                <div class="mb-3 text-center px-4">
                    <span class="text-[9px] uppercase tracking-[0.4em] text-[var(--gold-muted)] font-semibold block mb-1">BV Jewelry</span>
                    <h2 class="hero-title text-[var(--text-main)] !text-[24px] md:!text-[32px]">${title}</h2>
                </div>
                <div class="promo-carousel-container select-none group relative">
                    <div id="${trackId}" class="flex overflow-x-auto gap-0 snap-x snap-mandatory no-scrollbar min-h-[200px]">
                        ${blockItems.map(cardWrapper).join('')}
                    </div>
                </div>
            </section>`;
        }
    });
    
    container.innerHTML = html;
    
    activeBlocks.forEach(block => {
        const track = document.getElementById(`block-track-${block.id}`);
        if (track && typeof window.initPremiumCarousel === 'function') {
            window.initPremiumCarousel(track);
        }
    });
};

window.showBranchesModal = function() {
    const settings = (typeof API !== 'undefined' && API.get) ? API.get('bv_settings', {}) : {};
    const addrs = settings.addresses || [];
    if(addrs.length === 0) return;
    
    const list = addrs.map(a => `<a href="http://maps.google.com/?q=${encodeURIComponent(a)}" target="_blank" class="block p-4 border border-[var(--border)] rounded-none hover:border-[var(--gold-muted)] text-[var(--text-main)] text-sm mb-3 transition-colors flex items-center justify-between group">
        <span>${a || ''}</span>
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
    const priceDB = (typeof API !== 'undefined' && API.get) ? API.get('bv_price_list', []) : [];
    tbody.innerHTML = '';
    
    if (!Array.isArray(priceDB) || priceDB.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center py-10 text-[var(--text-muted)]">Прайс порожній. Додайте послуги в Адмін-панелі.</td></tr>`;
        return;
    }
    
    priceDB.forEach(cat => {
        if (!cat) return;
        tbody.innerHTML += `
            <tr class="bg-[rgba(255,255,255,0.02)] border-b border-[var(--border)]">
                <td colspan="2" class="py-4 px-2 md:px-4 font-serif text-lg md:text-xl text-[var(--gold-muted)]">${cat.category || ''}</td>
            </tr>
        `;
        if(Array.isArray(cat.items)) {
            cat.items.forEach(item => {
                if (!item) return;
                tbody.innerHTML += `
                    <tr class="border-b border-[var(--border)] hover:bg-[rgba(255,255,255,0.01)] transition-colors group">
                        <td class="py-4 px-2 md:px-4 font-medium text-[var(--text-main)] pr-4">${item.name || ''}</td>
                        <td class="py-4 px-2 md:px-4 text-right align-top md:align-middle">
                            <div class="flex flex-col md:flex-row justify-end gap-1 md:gap-4">
                                <div class="flex flex-col text-right">
                                    <span class="text-[9px] uppercase tracking-widest text-[#e8b923] font-bold">Золото</span>
                                    <span class="text-[var(--text-main)] font-semibold">${item.gold || ''}</span>
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
    const processContainer =
        document.getElementById('processListContainer') ||
        document.getElementById('exclusive-process-container');
    const materialsContainer =
        document.getElementById('materialsContainer') ||
        document.getElementById('material-options-container');

    const processDB = (typeof API !== 'undefined' && API.get) ? API.get('bv_exclusive_process', []) : [];
    const matDB = (typeof API !== 'undefined' && API.get) ? API.get('bv_exclusive_materials', []) : [];

    if (processContainer && Array.isArray(processDB) && processDB.length > 0) {
        processContainer.innerHTML = processDB.map((step, index) => `
            <div class="process-step flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
                <div class="process-img-wrap w-full md:w-1/2 order-1 overflow-hidden rounded-[32px] shadow-2xl relative aspect-[4/3] md:aspect-[4/3]">
                    <img src="${step && step.img ? step.img : ''}" alt="${(step && step.title) || ''}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                    <div class="absolute inset-0 border border-white/10 rounded-[32px] pointer-events-none"></div>
                </div>
                <div class="process-text-wrap w-full md:w-1/2 order-2 flex flex-col justify-center px-2 md:px-0">
                    <span class="text-[10px] md:text-xs uppercase tracking-widest text-[var(--gold-muted)] font-bold mb-3 block">Етап 0${index + 1}</span>
                    <h3 class="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 md:mb-6 text-[var(--text-main)]">${(step && step.title) || ''}</h3>
                    <p class="text-[var(--text-muted)] font-light leading-relaxed text-sm md:text-base">${(step && step.desc) || ''}</p>
                </div>
            </div>
        `).join('');
    }

    if (materialsContainer && Array.isArray(matDB) && matDB.length > 0) {
        materialsContainer.innerHTML = matDB.map((m) => {
            const id = (m && (m.id || m.value || m.label)) || '';
            const label = (m && (m.label || m.name || m.title)) || id;
            return `<button type="button" onclick="selectMaterial('${String(id).replace(/'/g, "\\'")}', this)" class="choice-btn">${label}</button>`;
        }).join('');
    }
};

// Classic-script global mirror
window.applyTheme = applyTheme;
window.checkUserIsLogged = checkUserIsLogged;
window.createInertiaScroll = createInertiaScroll;
window.escapeHtml = escapeHtml;
window.generateMenus = generateMenus;
window.getCart = getCart;
window.getCategoryIconSVG = getCategoryIconSVG;
window.getCurrentUser = getCurrentUser;
window.getFavs = getFavs;
window.getScopedStorageKey = getScopedStorageKey;
window.getTargetTheme = getTargetTheme;
window.migrateScopedState = migrateScopedState;
window.setCart = setCart;
window.updateThemeIcon = updateThemeIcon;

// Sync shared arrays onto window after load / mutations that set window.products explicitly (already in original)
window.products = products;
window.categoriesTree = categoriesTree;
