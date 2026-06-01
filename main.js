// ==========================================
// 0. ІНІЦІАЛІЗАЦІЯ БАЗИ ДАНИХ (SUPABASE)
// ==========================================
const supabaseUrl = 'sb_secret_sT3umq1sRCFrcuQUsLDSdw_KX1-fNfB'; 
const supabaseKey = 'sb_publishable_qSUZxk_9JV9wJNrdjAqeLA_8O_8-TVV'; 
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log("BV Jewelry: Підключення до бази встановлено.", _supabase);

// ==========================================
// 1. API ФАСАД (HEADLESS CMS CLIENT)
// ==========================================
const API = {
    get: (key, def) => {
        try {
            const d = localStorage.getItem(key);
            return d ? JSON.parse(d) : def;
        } catch (e) { return def; }
    },
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
};

// ==========================================
// 2. БАЗОВІ ДАНІ ТА ЛОКАЛІЗАЦІЯ (Глобальний словник)
// ==========================================
const i18n = {
    uk: { 
        // Меню та Навігація
        m1: "Головна", m2: "Каталог", m3: "Бренд", m4: "Контакти", m_price: "Прайс", m_atelier: "Ексклюзив",
        menu_all: "Всі товари", menu_for_whom: "Для кого", menu_metal: "За металом",
        
        // Кошик та Улюблене
        cart_title: "Кошик", cart_subtotal: "Підсумок:", cart_checkout: "Оформити замовлення", cart_empty: "Ваш кошик порожній",
        fav_title: "Улюблене", fav_empty: "Список порожній",
        
        // Статуси та бейджі
        in_stock: "В наявності", out_stock: "Немає", pre_order: "Під замовлення",
        badge_new: "Новинка", badge_exclusive: "Ексклюзив", badge_sale: "Sale", badge_sold_out: "Продано", badge_pre_order: "Під замовлення",
        
        // Кнопки
        btn_buy: "Купити", btn_details: "Детальніше", btn_send: "Надіслати",
        
        // Сторінка товару
        similar: "Також рекомендуємо", desc_title: "Опис виробу", pd_nav_specs: "Характеристики", pd_nav_review: "Відгуки", pd_nav_all: "Усе про товар", pd_nav_photo: "Фото", pd_nav_ask: "Задати питання",
        
        // Каталог
        cat_filters: "Фільтри", cat_sort: "Сортування", cat_sort_new: "Спочатку нові", cat_sort_cheap: "Від дешевих до дорогих", cat_sort_exp: "Від дорогих до дешевих", cat_load_more: "Показати ще", cat_reset: "Скинути", cat_empty: "Товарів не знайдено",
        
        // Пошук та Авторизація
        search_ph: "Пошук...", login: "Увійти", register: "Зареєструватися", login_mob_title: "КАБІНЕТ", theme_mob: "Змінити тему", lang_title: "МОВА",
        
        // Футер
        footer_rights: "Всі права захищені.", footer_dev: "Розроблено",
        
        // Ексклюзив
        exc_title: "Створення ексклюзиву", exc_step: "Етап", exc_order: "Замовити прорахунок"
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
    },
    ru: { 
        m1: "Главная", m2: "Каталог", m3: "Бренд", m4: "Контакты", m_price: "Прайс", m_atelier: "Эксклюзив",
        menu_all: "Все товары", menu_for_whom: "Для кого", menu_metal: "По металлу",
        cart_title: "Корзина", cart_subtotal: "Итого:", cart_checkout: "Оформить заказ", cart_empty: "Ваша корзина пуста",
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
    bg: { 
        m1: "Начало", m2: "Каталог", m3: "Марка", m4: "Контакти", m_price: "Цени", m_atelier: "Ексклузив",
        menu_all: "Всички продукти", menu_for_whom: "За кого", menu_metal: "По метал",
        cart_title: "Количка", cart_subtotal: "Общо:", cart_checkout: "Поръчай", cart_empty: "Вашата количка е празна",
        fav_title: "Любими", fav_empty: "Списъкът е празен",
        in_stock: "В наличност", out_stock: "Изчерпано", pre_order: "По поръчка",
        badge_new: "Ново", badge_exclusive: "Ексклузивно", badge_sale: "Разпродажба", badge_sold_out: "Изчерпано", badge_pre_order: "По поръчка",
        btn_buy: "Купи", btn_details: "Детайли", btn_send: "Изпрати",
        similar: "Препоръчваме също", desc_title: "Описание", pd_nav_specs: "Характеристики", pd_nav_review: "Отзиви", pd_nav_all: "За продукта", pd_nav_photo: "Снимки", pd_nav_ask: "Задай въпрос",
        cat_filters: "Филтри", cat_sort: "Сортиране", cat_sort_new: "Най-нови", cat_sort_cheap: "От евтини към скъпи", cat_sort_exp: "От скъпи към евтини", cat_load_more: "Покажи още", cat_reset: "Изчисти", cat_empty: "Няма намерени продукти",
        search_ph: "Търсене...", login: "Вход", register: "Регистрация", login_mob_title: "ПРОФИЛ", theme_mob: "Смяна на тема", lang_title: "ЕЗИК",
        footer_rights: "Всички права запазени.", footer_dev: "Разработено от",
        exc_title: "Създаване на ексклузив", exc_step: "Етап", exc_order: "Запитване за цена"
    }
};

window.getLoc = function(obj, field) {
    if (!obj) return '';
    const lang = API.get('bv_lang', 'uk');
    if (lang === 'uk') return obj[field] || '';
    const locField = field + lang.toUpperCase(); 
    return obj[locField] || obj[field] || ''; 
};

const flags = { uk: "ua", en: "gb", ru: "ru", bg: "bg" };
const sunSVG = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
const moonSVG = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`;
const formatterPrice = new Intl.NumberFormat('uk-UA', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ==========================================
// 3. ІНІЦІАЛІЗАЦІЯ ДАНИХ (З АДМІНКИ АБО ДЕМО-ФАЙЛУ)
// ==========================================
if (!API.get('bv_is_initialized', false)) {
    console.log("BV Jewelry: Запуск системи. База порожня, шукаю демо-дані...");
    
    if (typeof window.BVDemoData !== 'undefined') {
        API.set('bv_settings', window.BVDemoData.settings || {});
        API.set('bv_categories_tree', window.BVDemoData.categories || []);
        API.set('bv_products', window.BVDemoData.products || []);
        API.set('bv_collage_config', window.BVDemoData.collage || {});
        API.set('bv_banners', window.BVDemoData.banners || []);
        API.set('bv_pages_content', window.BVDemoData.pages || {});
        API.set('bv_price_list', window.BVDemoData.priceList || []);
        API.set('bv_exclusive_process', window.BVDemoData.exclusiveProcess || []);
        API.set('bv_exclusive_materials', window.BVDemoData.exclusiveMaterials || []);
        
        API.set('bv_is_initialized', true);
        console.log("BV Jewelry: Демо-дані успішно завантажено.");
    } else {
        console.warn("BV Jewelry: Файл demo-data.js не підключено або об'єкт BVDemoData відсутній!");
    }
}

// ==========================================
// 4. СТАН ТА СИНХРОНІЗАЦІЯ (SCOPED STORAGE)
// ==========================================
// Тепер дані гарантовано тягнуться з БД (localStorage) після перевірки на ініціалізацію
let categoriesTree = API.get('bv_categories_tree', []);
let products = API.get('bv_products', []);

function getCurrentUser() { return API.get('bv_current_user', null); }
function getScopedStorageKey(baseKey) {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.username) return baseKey;
    return `${baseKey}_${currentUser.username.toLowerCase()}`;
}

function migrateScopedState() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.username) return;
    const userFavsKey = getScopedStorageKey('bv_favs');
    const userCartKey = getScopedStorageKey('bv_cart');
    const globalFavs = API.get('bv_favs', null);
    const globalCart = API.get('bv_cart', null);
    if (!API.get(userFavsKey, null) && Array.isArray(globalFavs)) API.set(userFavsKey, globalFavs);
    if (!API.get(userCartKey, null) && Array.isArray(globalCart)) API.set(userCartKey, globalCart);
}

function getFavs() {
    const currentUser = getCurrentUser();
    if (currentUser && Array.isArray(currentUser.favs)) { API.set(getScopedStorageKey('bv_favs'), currentUser.favs); }
    return API.get(getScopedStorageKey('bv_favs'), []);
}
function setFavs(favs) {
    API.set(getScopedStorageKey('bv_favs'), favs);
    API.set('bv_favs', favs);
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const users = API.get('bv_users', []);
    const idx = users.findIndex((u) => u.username.toLowerCase() === currentUser.username.toLowerCase());
    if (idx !== -1) { users[idx].favs = favs; API.set('bv_users', users); API.set('bv_current_user', users[idx]); }
}

function getCart() { return API.get(getScopedStorageKey('bv_cart'), []); }
function setCart(cart) { API.set(getScopedStorageKey('bv_cart'), cart); API.set('bv_cart', cart); }

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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

// ==========================================
// 5. КОШИК ТА УЛЮБЛЕНЕ (ЛОГІКА І РЕНДЕР)
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
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, title: String(title), variant: String(variant), price: Number(price), img: String(img), qty: 1 });
    setCart(cart);
    window.renderCart();
    if (!document.getElementById('cartDrawer').classList.contains('active')) window.toggleCart();
};

window.updateCartQty = function(id, delta) {
    const cart = getCart();
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    setCart(cart);
    window.renderCart();
};

window.removeFromCart = function(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    setCart(cart);
    window.renderCart();
};

window.clearEntireCart = function() {
    if(confirm('Ви впевнені, що хочете видалити всі товари з кошика?')) {
        setCart([]);
        window.renderCart();
    }
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
        return;
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        totalQty += item.qty;
        cartBody.insertAdjacentHTML('beforeend', `
            <div class="cart-item flex gap-4 p-3 rounded-xl mb-3 relative transition-all duration-300 hover:border-[var(--gold-muted)]/40">
                <img src="${item.img}" class="w-20 h-20 object-cover rounded-lg border border-[var(--border)]">
                <div class="flex-grow flex flex-col justify-center pr-6">
                    <span class="text-sm font-semibold uppercase tracking-wide leading-tight line-clamp-2">${escapeHtml(item.title)}</span>
                    <span class="text-xs text-[var(--text-muted)] mt-1">${escapeHtml(item.variant)}</span>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="text-sm font-bold text-[var(--gold-muted)]">${formatterPrice.format(item.price)} ₴</span>
                        <div class="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)]">
                            <button class="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)]" onclick="updateCartQty('${item.id}', -1)">−</button>
                            <span class="px-2 text-xs text-[var(--text-main)] font-semibold min-w-6 text-center">${item.qty}</span>
                            <button class="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)]" onclick="updateCartQty('${item.id}', 1)">+</button>
                        </div>
                    </div>
                </div>
                <button class="cart-item-remove absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)]" onclick="removeFromCart('${item.id}')">
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
};

window.toggleFavDrawer = function() {
    const drawer = document.getElementById('favDrawer');
    const overlay = document.getElementById('favOverlay');
    if (!drawer) return;
    
    const isLoggedIn = !!getCurrentUser();
    if (!isLoggedIn) {
        if(typeof window.openAuthModal === 'function') window.openAuthModal();
        return;
    }

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
    const isLoggedIn = !!getCurrentUser();
    if (!isLoggedIn) {
        if(typeof window.openAuthModal === 'function') window.openAuthModal();
        return;
    }

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
    favBody.innerHTML = favProducts.map(prod => `
        <div class="cart-item flex gap-4 p-3 rounded-xl mb-3 relative transition-all duration-300 hover:border-[var(--gold-muted)]/35 cursor-pointer" onclick="location.href='product.html?id=${prod.id}'">
            <img src="${prod.img || prod.image}" class="w-16 h-16 object-cover rounded-lg border border-[var(--border)]">
            <div class="flex-grow flex flex-col justify-center pr-6">
                <span class="text-xs font-semibold uppercase tracking-wide line-clamp-1">${escapeHtml(window.getLoc(prod, 'name'))}</span>
                <span class="text-[10px] text-[var(--text-muted)] mt-1">${escapeHtml(window.getLoc(prod, 'variant'))}</span>
                <span class="text-sm font-bold text-[var(--gold-muted)] mt-1">${formatterPrice.format(prod.discount || prod.price)} ₴</span>
            </div>
            <button class="cart-item-remove absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)]" onclick="event.stopPropagation(); toggleFav('${prod.id}')" title="Видалити">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    `).join('');
};

// ==========================================
// 7. ГЛОБАЛЬНИЙ РЕНДЕР КАРТКИ ТОВАРУ
// ==========================================
window.renderProductCard = function(prod) {
    const lang = API.get('bv_lang', 'uk');
    const isOutOfStock = prod.status === 'out-stock';
    const isPreOrder = prod.status === 'pre-order';
    const isFav = getFavs().includes(prod.id);
    
    let badgesHtml = '<div class="flex flex-wrap gap-1 justify-end items-center">';
    if (isOutOfStock) badgesHtml += `<div class="prod-badge badge-sold-out">${i18n[lang].badge_sold_out}</div>`;
    else if (isPreOrder) badgesHtml += `<div class="prod-badge badge-pre-order">${i18n[lang].badge_pre_order}</div>`;
    if(prod.badge === 'new') badgesHtml += `<div class="prod-badge badge-new">${i18n[lang].badge_new}</div>`;
    if(prod.badge === 'exclusive') badgesHtml += `<div class="prod-badge badge-exclusive">${i18n[lang].badge_exclusive}</div>`;
    if(prod.badge === 'sale') badgesHtml += `<div class="prod-badge badge-sale">${i18n[lang].badge_sale}</div>`;
    badgesHtml += '</div>';

    let priceHtml = `<span class="text-[14px] md:text-[16px] font-bold text-[var(--gold-muted)]">${formatterPrice.format(prod.price)} ₴</span>`;
    if (prod.discount && Number(prod.discount) > 0) {
        priceHtml = `<span class="text-[14px] md:text-[16px] font-bold text-[var(--success)]">${formatterPrice.format(prod.discount)} ₴</span><span class="text-[10px] md:text-[12px] text-[var(--text-muted)] line-through ml-2 opacity-70">${formatterPrice.format(prod.price)} ₴</span>`;
    }

    const safeId = escapeHtml(prod.id);
    const safeName = escapeHtml(window.getLoc(prod, 'name')).replace(/'/g, "\\'"); 
    const safeVariant = escapeHtml(window.getLoc(prod, 'variant')).replace(/'/g, "\\'");
    const safeImg = escapeHtml(prod.img || prod.image);
    const priceDisplay = prod.discount && Number(prod.discount) > 0 ? prod.discount : prod.price;

    return `
        <div class="product-card group relative overflow-hidden transition-all duration-400 flex flex-col w-full h-full">
            <a href="product.html?id=${prod.id}" class="relative w-full aspect-square overflow-hidden bg-[var(--bg-elevated)] block">
                <img src="${safeImg}" class="product-img w-full h-full object-cover transition duration-700 group-hover:scale-105" loading="lazy">
            </a>
            
            <div class="p-4 flex flex-col gap-1 flex-grow bg-[var(--bg-card)]">
                <a href="product.html?id=${prod.id}" class="text-[9px] md:text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--gold-muted)] transition-all duration-300">${safeVariant}</a>
                <a href="product.html?id=${prod.id}" class="text-[12px] md:text-[14px] font-medium text-[var(--text-main)] leading-snug hover:text-[var(--gold-muted)] transition-all duration-300 line-clamp-2 mt-1 min-h-[36px] md:min-h-[44px]">${safeName}</a>
                <div class="mt-auto pt-2 mb-1 flex items-center">${priceHtml}</div>
            </div>

            <div class="px-4 py-3 border-t border-[var(--border)] flex justify-between items-center mt-auto bg-[var(--bg-card)]">
                <div class="flex items-center gap-2">
                    ${!isOutOfStock ? `
                    <button onclick="addToCart('${safeId}', '${safeName}', '${safeVariant}', ${priceDisplay}, '${safeImg}')" class="flex items-center gap-1 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[var(--text-main)] hover:text-[var(--gold-muted)] transition-all duration-300 active:scale-95 group/btn">
                        <span>${i18n[lang].btn_buy}</span><span class="text-[14px] font-light mb-[2px] transition-transform group-hover/btn:rotate-90">+</span>
                    </button>
                    ` : `<span class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">${i18n[lang].out_stock}</span>`}
                </div>
                <div class="flex items-center gap-3">
                    ${badgesHtml}
                    <button class="fav-btn-inline ${isFav ? 'text-[var(--danger)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'} transition-all duration-300 active:scale-95" data-id="${prod.id}" onclick="toggleFav('${prod.id}')">
                        <svg width="18" height="18" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
};

// ==========================================
// 8. ДИНАМІЧНА ГЕНЕРАЦІЯ МЕНЮ (CMS DATA)
// ==========================================
function generateMenus() {
    const megaCol1 = document.getElementById('megaCol1');
    const megaMenu = document.querySelector('.mega-menu');
    const sideMenu = document.getElementById('sideMenu');
    
    if(megaCol1) {
        megaCol1.innerHTML = '';
        if(megaMenu) megaMenu.querySelectorAll('.mega-col-2').forEach(col => col.remove());

        categoriesTree.forEach((cat, index) => {
            const isActive = index === 0 ? 'active' : ''; 
            const svgIcon = getCategoryIconSVG(cat.id);
            
            // 1. Ліва колонка
            megaCol1.innerHTML += `<div class="mega-cat-item ${isActive}" data-target="mc-${cat.id}"><svg class="mega-cat-icon" viewBox="0 0 24 24">${svgIcon}</svg><span>${cat.name}</span></div>`;

            // 2. Сітка груп (Читаємо 3 рівні)
            let groupsHtml = '<div class="zlato-groups-grid">';
            
            if (cat.subcategories && cat.subcategories.length > 0) {
                cat.subcategories.forEach(sub => {
                    groupsHtml += `<div class="zlato-group-wrapper">`;
                    groupsHtml += `<a href="catalog.html#${sub.id}" class="zlato-group-title">${sub.name}</a>`;
                    
                    if (sub.subcategories && sub.subcategories.length > 0) {
                        groupsHtml += `<div class="zlato-tags-container">`;
                        sub.subcategories.forEach(subsub => { 
                            groupsHtml += `<a href="catalog.html#${subsub.id}" class="zlato-tag">${subsub.name}</a>`; 
                        });
                        groupsHtml += `</div>`;
                    }
                    groupsHtml += `</div>`;
                });
            }
            groupsHtml += '</div>';

            // 3. Блок нижніх хайлайтів
            let highlightsHtml = '';
            if (cat.highlights && cat.highlights.length > 0) {
                highlightsHtml += `<div class="zlato-highlights">`;
                cat.highlights.forEach(hl => {
                    const accentClass = hl.isAccent ? 'accent' : '';
                    highlightsHtml += `<a href="catalog.html${hl.link}" class="zlato-highlight-btn ${accentClass}">${hl.name} &rarr;</a>`;
                });
                highlightsHtml += `</div>`;
            }

            // 4. Збірка правої колонки
            if(megaMenu) {
                const newCol2 = document.createElement('div');
                newCol2.className = `mega-col-2 zlato-content ${isActive}`;
                newCol2.id = `mc-${cat.id}`;
                
                newCol2.innerHTML = `
                    <div class="flex items-center gap-3 mb-6">
                        <h2 class="text-3xl font-serif text-[var(--text-main)]">${cat.name}</h2>
                        <a href="catalog.html#${cat.id}" class="text-[12px] uppercase tracking-widest text-[var(--gold-muted)] font-bold transition-colors">Всі &rarr;</a>
                    </div>
                    ${groupsHtml}
                    ${highlightsHtml}
                `;
                megaMenu.appendChild(newCol2);
            }
        });

        megaCol1.innerHTML += `<a href="exclusive.html" class="mega-atelier-btn mt-auto mx-4 mb-4 border border-[var(--gold-muted)] text-[var(--gold-muted)] p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--gold-muted)] hover:text-[#111] transition-colors font-bold uppercase tracking-widest text-[10px]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7-7-7M5 12h14"/></svg><span data-i18n="m_atelier">Ексклюзив</span></a>`;
        
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

    // --- ОНОВЛЕНЕ МОБІЛЬНЕ МЕНЮ ---
    if(sideMenu) {
        let mobCatHtml = '';
        categoriesTree.forEach(cat => {
            let mobSubLinksHtml = '';
            
            if (cat.subcategories && cat.subcategories.length > 0) {
                cat.subcategories.forEach(sub => {
                   mobSubLinksHtml += `<div class="mob-group-title">${sub.name}</div>`;
                   
                   if (sub.subcategories && sub.subcategories.length > 0) {
                       mobSubLinksHtml += `<div class="mob-tags-wrap">`;
                       sub.subcategories.forEach(subsub => {
                            mobSubLinksHtml += `<a href="catalog.html#${subsub.id}" class="mob-tag" onclick="window.toggleMenu()">${subsub.name}</a>`; 
                       });
                       mobSubLinksHtml += `</div>`;
                   }
                });
            }
            
            mobSubLinksHtml += `<a href="catalog.html#${cat.id}" class="mob-all-btn" onclick="window.toggleMenu()">Всі товари: ${cat.name} &rarr;</a>`;
            
            mobCatHtml += `
            <div class="mob-nested-wrap">
                <div class="mob-nested-title" onclick="window.toggleAccordion('mob-sub-${cat.id}', 'mob-arrow-${cat.id}')">
                    <div class="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="opacity-70">${getCategoryIconSVG(cat.id)}</svg> 
                        <span style="font-size: 15px;">${cat.name}</span>
                    </div>
                    <svg id="mob-arrow-${cat.id}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="transition-transform duration-300"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div class="mob-nested-list" id="mob-sub-${cat.id}">
                    ${mobSubLinksHtml}
                </div>
            </div>`;
        });

        const savedLang = API.get('bv_lang', 'uk');
        const displayLang = savedLang === 'uk' ? 'UA' : savedLang.toUpperCase();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const currentThemeIcon = currentTheme === 'light' ? sunSVG : moonSVG;

        sideMenu.innerHTML = `
            <div class="sidebar-top-logo mb-6 border-b border-[var(--border)] pb-8 pt-4 text-center flex flex-col items-center">
                <a href="index.html" class="flex flex-col items-center justify-center gap-1">
                    <span class="text-4xl font-serif text-[var(--gold-muted)] leading-none">BV</span>
                    <span class="text-[10px] tracking-[0.4em] text-[var(--text-main)] uppercase font-light pl-1">jewelry</span>
                </a>
                <p class="text-[9px] text-[var(--text-muted)] mt-4 uppercase tracking-[0.2em]">Вишуканість у деталях</p>
            </div>
            
            <a href="index.html" data-i18n="m1" class="mob-menu-title" onclick="window.toggleMenu()">Головна</a>
            <a href="exclusive.html" class="mob-atelier-link mt-4" onclick="window.toggleMenu()"><span data-i18n="m_atelier">Ексклюзив</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
            
            <div class="menu-divider"></div>
            
            <div>
                <div class="mob-menu-title" onclick="window.toggleAccordion('mobCatList', 'mobCatArrow')">
                    <span data-i18n="m2">Каталог</span>
                    <svg id="mobCatArrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-muted)" stroke-width="2" class="transition-transform duration-300"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div class="mob-accordion-list" id="mobCatList" style="gap: 0; padding-left: 0;">${mobCatHtml}</div>
            </div>
            
            <div>
                <div class="mob-menu-title" onclick="window.toggleAccordion('mobInfoList', 'mobInfoArrow')">
                    <span>Бренд</span>
                    <svg id="mobInfoArrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-muted)" stroke-width="2" class="transition-transform duration-300"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div class="mob-accordion-list" id="mobInfoList" style="gap: 5px; padding-left: 20px;">
                    <a href="info.html?p=about" class="sub-cat-link py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Історія Atelier</a>
                    <a href="info.html?p=warranty" class="sub-cat-link py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Гарантія</a>
                    <a href="info.html?p=terms" class="sub-cat-link py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Умови</a>
                    <a href="info.html?p=reviews" class="sub-cat-link py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Відгуки</a>
                </div>
            </div>
            
            <a href="services.html" class="mob-menu-title" onclick="window.toggleMenu()"><span>Прайс</span></a>
            <a href="#footer" data-i18n="m4" class="mob-menu-title" onclick="window.toggleMenu()">Контакти</a>
            
            <div class="menu-divider mt-6"></div>
            
            <div class="mobile-settings-group pb-10">
                <div>
                    <div class="mob-menu-title border-none" onclick="window.toggleAccordion('mobLangList', 'mobLangArrow')" style="font-size: 14px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="https://flagcdn.com/${flags[savedLang] || 'ua'}.svg" class="flag" id="currentFlagMob">
                            <span>МОВА:</span> 
                            <span id="currentLangLabelMob" style="font-weight: 600; color: var(--text-main);">${displayLang}</span>
                        </div>
                        <svg id="mobLangArrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-muted)" stroke-width="2" class="transition-transform duration-300"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                    <div class="mob-accordion-list" id="mobLangList" style="margin-top: 10px; background: rgba(0,0,0,0.1); border-radius: 12px;">
                        <div class="dropdown-item py-3" onclick="window.changeLang('uk')"><img src="https://flagcdn.com/ua.svg" class="flag"> Українська</div>
                        <div class="dropdown-item py-3" onclick="window.changeLang('en')"><img src="https://flagcdn.com/gb.svg" class="flag"> English</div>
                        <div class="dropdown-item py-3" onclick="window.changeLang('ru')"><img src="https://flagcdn.com/ru.svg" class="flag"> Русский</div>
                    </div>
                </div>
                
                <div id="themeToggleMob" class="mobile-theme-toggle flex items-center gap-3 py-4 mt-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity bg-[var(--bg-elevated)] rounded-xl px-4 justify-center" onclick="window.toggleTheme()" style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    <svg id="themeIconMob" viewBox="0 0 24 24" class="w-5 h-5 fill-none stroke-currentColor stroke-2 text-[var(--gold-muted)]">${currentThemeIcon}</svg>
                    <span data-i18n="theme_mob">Змінити тему</span>
                </div>
            </div>
        `;
        document.querySelectorAll('[data-i18n]').forEach(el => el.innerHTML = i18n[savedLang][el.dataset.i18n] || el.innerHTML);
    }
}

// ==========================================
// 9. БЕЗКІНЧЕННА БІГУЧА СТРОКА ТА КАРУСЕЛІ
// ==========================================
if (!document.getElementById('marquee-fix-styles')) {
    const style = document.createElement('style');
    style.id = 'marquee-fix-styles';
    style.innerHTML = `
        .marquee-wrapper {
            width: 100% !important;
            overflow: hidden !important;
            background: var(--bg-card);
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            padding: 20px 0;
            cursor: grab;
            user-select: none;
            display: block !important;
            position: relative;
        }
        #marqueeTrack {
            display: flex !important;
            gap: 0px !important;
            white-space: nowrap;
            width: max-content;
            will-change: transform;
            align-items: center;
        }
        .marquee-item {
            flex-shrink: 0;
            padding: 0 !important;
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            font-style: italic;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--gold-muted);
            text-decoration: none;
            display: flex;
            align-items: center;
            user-select: none;
            -webkit-user-drag: none;
        }
        .marquee-item::after {
            content: "•";
            margin: 0 25px !important;
            color: var(--gold-muted);
            opacity: 0.4;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
}

function createInertiaScroll(containerSelector, trackSelector, baseSpeed = -0.5) {
    const container = document.querySelector(containerSelector);
    const track = document.querySelector(trackSelector);
    if (!container || !track) return;

    let currentX = 0;
    let isDown = false;
    let isDragging = false; 
    let startX;
    let velocity = 0;
    let state = 'playing'; 
    let pauseTimer = null;

    const content = track.innerHTML;
    track.innerHTML = content + content + content + content;

    track.addEventListener('dragstart', (e) => e.preventDefault());
    track.addEventListener('click', (e) => {
        if (isDragging) { e.preventDefault(); e.stopPropagation(); }
    });

    function step() {
        if (state === 'playing') {
            currentX += baseSpeed;
        } else if (state === 'coasting') {
            currentX += velocity;
            velocity *= 0.95; 
            if (Math.abs(velocity) < 0.2) {
                state = 'paused';
                clearTimeout(pauseTimer);
                pauseTimer = setTimeout(() => { state = 'playing'; }, 3000);
            }
        } 

        const resetPoint = track.scrollWidth / 4;
        if (currentX <= -resetPoint) currentX += resetPoint;
        if (currentX > 0) currentX -= resetPoint;

        track.style.transform = `translate3d(${currentX}px, 0, 0)`;
        requestAnimationFrame(step);
    }

    const startDrag = (e) => {
        isDown = true; isDragging = false; state = 'dragging';
        clearTimeout(pauseTimer);
        startX = (e.pageX || e.touches[0].pageX) - currentX;
        velocity = 0;
        container.style.cursor = 'grabbing';
    };

    const endDrag = () => {
        if (!isDown) return;
        isDown = false;
        container.style.cursor = 'grab';
        state = 'coasting'; 
        setTimeout(() => { isDragging = false; }, 50);
    };

    const moveDrag = (e) => {
        if (!isDown) return;
        const x = (e.pageX || e.touches[0].pageX) - startX;
        if (Math.abs(x - currentX) > 3) isDragging = true;
        velocity = x - currentX; 
        currentX = x;
    };

    container.addEventListener('mousedown', startDrag);
    window.addEventListener('mouseup', endDrag);
    container.addEventListener('mouseleave', endDrag);
    container.addEventListener('mousemove', moveDrag);
    container.addEventListener('touchstart', startDrag, {passive: true});
    container.addEventListener('touchend', endDrag);
    container.addEventListener('touchmove', moveDrag, {passive: true});

    requestAnimationFrame(step);
}

window.initMarqueeSim = function() {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;
    const categoriesDB = API.get('bv_categories_tree', []);
    const html = categoriesDB.map(c => `<a href="catalog.html#${c.id}" class="marquee-item">${c.name}</a>`).join('');
    if (html) {
        track.innerHTML = html;
        setTimeout(() => { createInertiaScroll('.marquee-wrapper', '#marqueeTrack', -0.5); }, 100);
    }
};

function initPremiumCarousel(track) {
    if (!track || track.dataset.init === 'true') return;
    track.dataset.init = 'true';

    let wrapper = track.closest('.group');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'relative w-full group outline-none'; 
        track.parentNode.insertBefore(wrapper, track);
        wrapper.appendChild(track);
    }

    const btnClass = "hidden md:flex absolute top-1/2 -translate-y-1/2 z-40 w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-[var(--bg-card)]/40 backdrop-blur-md border border-[var(--border)] text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-all duration-400 hover:scale-110 hover:bg-[var(--bg-card)] hover:border-[var(--gold-muted)] hover:text-[var(--gold-muted)] shadow-[0_8px_30px_rgba(0,0,0,0.15)]";
    
    const prevBtn = document.createElement('button');
    prevBtn.className = `${btnClass} left-2 lg:left-6`;
    prevBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg>`;
    
    const nextBtn = document.createElement('button');
    nextBtn.className = `${btnClass} right-2 lg:right-6`;
    nextBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg>`;

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);

    track.classList.add('no-scrollbar', 'cursor-grab');
    track.classList.remove('snap-x', 'snap-mandatory');
    track.style.scrollBehavior = 'auto';

    let isDown = false;
    let isDragging = false;
    let startX, scrollLeft, lastX;
    let velX = 0;
    let momentumID;

    track.addEventListener('dragstart', (e) => e.preventDefault());
    track.addEventListener('click', (e) => { if (isDragging) { e.preventDefault(); e.stopPropagation(); } });

    const momentumLoop = () => {
        if (isDown) return;
        track.scrollLeft -= velX;
        velX *= 0.95;
        checkInfinite();
        if (Math.abs(velX) > 0.5) { momentumID = requestAnimationFrame(momentumLoop); } 
        else { track.classList.add('snap-x', 'snap-mandatory'); }
    };

    const beginMomentum = () => {
        track.classList.remove('snap-x', 'snap-mandatory');
        cancelAnimationFrame(momentumID);
        momentumID = requestAnimationFrame(momentumLoop);
    };

    nextBtn.onclick = () => { velX = -25; beginMomentum(); };
    prevBtn.onclick = () => { velX = 25; beginMomentum(); };

    const startAction = (e) => {
        isDown = true; isDragging = false;
        track.classList.remove('snap-x', 'snap-mandatory');
        track.classList.add('cursor-grabbing');
        cancelAnimationFrame(momentumID);
        startX = (e.pageX || e.touches[0].pageX);
        scrollLeft = track.scrollLeft;
        lastX = startX;
        velX = 0;
    };

    const endAction = () => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove('cursor-grabbing');
        beginMomentum();
        setTimeout(() => { isDragging = false; }, 50);
    };

    const moveAction = (e) => {
        if (!isDown) return;
        const currentX = (e.pageX || e.touches[0].pageX);
        const walk = (currentX - startX);
        if (Math.abs(walk) > 5) isDragging = true;
        track.scrollLeft = scrollLeft - walk;
        velX = currentX - lastX;
        lastX = currentX;
        checkInfinite();
    };

    const checkInfinite = () => {
        const bWidth = track.scrollWidth / 3;
        if (track.scrollLeft >= bWidth * 2) track.scrollLeft -= bWidth;
        if (track.scrollLeft <= 0) track.scrollLeft += bWidth;
    };

    track.addEventListener('mousedown', startAction);
    window.addEventListener('mouseup', endAction);
    track.addEventListener('mousemove', moveAction);
    track.addEventListener('mouseleave', endAction);
    track.addEventListener('touchstart', startAction, {passive: true});
    track.addEventListener('touchend', endAction);
    track.addEventListener('touchmove', moveAction, {passive: true});

    setTimeout(() => { track.scrollLeft = track.scrollWidth / 3; }, 200);
}

// ==========================================
// 10. СЛАЙДЕР БАНЕРІВ (АДАПТИВНИЙ РОЗМІР)
// ==========================================
window.initBannerSlider = function() {
    const banners = API.get('bv_banners', []);
    const container = document.getElementById('mainBannerContainer');
    if(!container || banners.length === 0) return;

    const settings = API.get('bv_settings', {});
    const ratio = settings.bannerRatio || '3/1';

    window.bannerCount = banners.length; window.currentBanner = 0; window.isBannerAnimating = false;
    let html = '<div class="banner-track" id="bannerTrack" style="display: flex; width: 100%; height: 100%;">';
    banners.forEach((b, i) => { 
        html += `<div class="banner-slide" data-index="${i}"><a href="${b.link || '#'}"><img src="${b.img}" alt="Promo" style="aspect-ratio: ${ratio};"></a></div>`; 
    });
    html += '</div>';

    if(banners.length > 1) {
        html += `<button class="banner-arrow prev" onclick="moveBanner(-1)">&#10094;</button><button class="banner-arrow next" onclick="moveBanner(1)">&#10095;</button><div class="banner-dots">`;
        banners.forEach((_, i) => { html += `<span class="banner-dot ${i===0?'active':''}" onclick="goToBanner(${i})"></span>`; });
        html += `</div>`;
    }
    container.innerHTML = html;
    document.getElementById('bannerTrack').style.transition = 'none';
    
    if(banners.length > 1) { 
        clearInterval(window.bannerInterval); 
        window.bannerInterval = setInterval(() => moveBanner(1), 5000); 

        let touchStartX = 0; let touchEndX = 0;
        container.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; clearInterval(window.bannerInterval); }, {passive: true});
        container.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50; 
            if (touchStartX - touchEndX > swipeThreshold) moveBanner(1); 
            if (touchEndX - touchStartX > swipeThreshold) moveBanner(-1); 
            window.bannerInterval = setInterval(() => moveBanner(1), 5000); 
        }, {passive: true});
    }
};

function updateBannerDots() {
    const dots = document.querySelectorAll('.banner-dot');
    dots.forEach(d => d.classList.remove('active'));
    if(dots[window.currentBanner]) dots[window.currentBanner].classList.add('active');
}

window.moveBanner = function(dir) {
    if(window.bannerCount <= 1 || window.isBannerAnimating) return;
    clearInterval(window.bannerInterval);
    const track = document.getElementById('bannerTrack');
    window.isBannerAnimating = true;
    window.currentBanner = (window.currentBanner + dir + window.bannerCount) % window.bannerCount;
    updateBannerDots();
    track.style.transition = 'none';
    const targetSlide = track.querySelector(`.banner-slide[data-index="${window.currentBanner}"]`);
    track.prepend(targetSlide);
    track.style.transform = 'translateX(-100%)';
    void track.offsetWidth;
    track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = 'translateX(0)';
    setTimeout(() => { window.isBannerAnimating = false; }, 600);
    window.bannerInterval = setInterval(() => moveBanner(1), 5000);
};

window.goToBanner = function(index) {
    if(window.bannerCount <= 1 || window.isBannerAnimating || index === window.currentBanner) return;
    clearInterval(window.bannerInterval);
    const track = document.getElementById('bannerTrack');
    window.isBannerAnimating = true; window.currentBanner = index; updateBannerDots();
    track.style.transition = 'none';
    const targetSlide = track.querySelector(`.banner-slide[data-index="${window.currentBanner}"]`);
    track.prepend(targetSlide);
    track.style.transform = 'translateX(-100%)';
    void track.offsetWidth;
    track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = 'translateX(0)';
    setTimeout(() => { window.isBannerAnimating = false; }, 600);
    window.bannerInterval = setInterval(() => moveBanner(1), 5000);
};

// ==========================================
// 11. ГОЛОВНА: РЕНДЕР СЕКЦІЙ 
// ==========================================
window.renderHomeCollage = function() {
    const collage = document.getElementById('art-collage');
    if (!collage) return;
    const config = API.get('bv_collage_config', { template: 'grid-6', items: [] });
    
    const perfectCollage = document.querySelector('.grid-perfect-collage');
    if (perfectCollage && config.items.length > 0) {
        perfectCollage.innerHTML = '';
        config.items.forEach((item, index) => {
            let itemClass = index === 0 ? 'grid-6-big' : 'grid-6-box';
            let badgeHtml = index === 0 ? '<span class="badge-status badge-new">New</span>' : (index === 1 ? '<span class="badge-status badge-sale">Sale</span>' : '');
            
            perfectCollage.innerHTML += `
                <div class="collage-item ${itemClass} group" onclick="location.href='catalog.html#${item.catId}'">
                    <img src="${item.img}" alt="${item.title}" class="item-img" loading="lazy">
                    <div class="item-overlay">
                        ${badgeHtml}
                        <span class="item-category-serif">${item.title}</span>
                    </div>
                </div>
            `;
        });
    }
};

window.renderHomeSections = function() {
    const specialGrid = document.getElementById('specialGrid');
    const weeklyGrid = document.getElementById('weeklyGrid');

    const trackClasses = "flex overflow-x-auto gap-4 md:gap-5 pb-6 pt-2 snap-x snap-mandatory no-scrollbar";
    const cardWrapper = (p) => `<div class="flex-none w-[45%] sm:w-[32%] md:w-[26%] lg:w-[20%] xl:w-[18%] snap-start flex">${window.renderProductCard(p)}</div>`;
    const generateInfiniteHTML = (items) => {
        if(items.length === 0) return '';
        let blockItems = [...items];
        while(blockItems.length < 12) { blockItems = blockItems.concat(items); }
        const html = blockItems.map(cardWrapper).join('');
        return html + html + html; 
    };

    if(specialGrid) {
        specialGrid.className = trackClasses;
        const items = products.filter(p => p.isSpecial).slice(0, 10);
        specialGrid.innerHTML = generateInfiniteHTML(items);
        initPremiumCarousel(specialGrid);
    }
    
    if(weeklyGrid) {
        weeklyGrid.className = trackClasses;
        const items = products.filter(p => p.isWeekly).slice(0, 10);
        weeklyGrid.innerHTML = generateInfiniteHTML(items);
        initPremiumCarousel(weeklyGrid);
    }
};

window.applyAdminSettings = function() {
    const settings = API.get('bv_settings', null);
    const pages = API.get('bv_pages_content', {});
    
    // 1. Оновлення Hero (Дані беремо з Конструктора)
    if (pages.home_hero) {
        const heroBg = document.querySelector('.hero-img-bg');
        const heroOverlay = document.querySelector('.hero-overlay'); // Переконайся що цей клас є в index.html
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

    // 2. Контакти та Інші налаштування
    if (settings) {
        if (settings.phone) {
            document.querySelectorAll('.header-phone-link, .phone-num').forEach(link => { link.href = `tel:${settings.phone.replace(/\s+/g, '')}`; });
            document.querySelectorAll('.header-phone-text, .phone-num span').forEach(span => { span.innerText = settings.phone; });
        }
        if(settings.tgLink) document.querySelectorAll('.tg-link').forEach(link => link.href = settings.tgLink);
        if(settings.instLink) document.querySelectorAll('.inst-link').forEach(link => link.href = settings.instLink);
        if(settings.addr1) document.querySelectorAll('.addr-text-1').forEach(el => el.innerText = settings.addr1);
        if(settings.addr2) document.querySelectorAll('.addr-text-2').forEach(el => el.innerText = settings.addr2);
    }
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
    if (isOpening) {
        const isTopLevel = list.classList.contains('mob-accordion-list');
        const openLists = isTopLevel ? document.querySelectorAll('.mob-accordion-list.open') : list.closest('.mob-accordion-list').querySelectorAll('.mob-nested-list.open');
        openLists.forEach(openList => {
            if (openList !== list) {
                openList.classList.remove('open');
                const title = openList.previousElementSibling;
                if (title && title.getAttribute('onclick')) {
                    const match = title.getAttribute('onclick').match(/'([^']+)',\s*'([^']+)'/);
                    if (match && match[2]) { const oldArrow = document.getElementById(match[2]); if (oldArrow) oldArrow.style.transform = 'rotate(0deg)'; }
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
    if(document.getElementById('specialGrid') && typeof renderHomeSections === 'function') renderHomeSections();
    if(typeof window.renderCatalogBatch === 'function') window.renderCatalogBatch(); 
    if(document.getElementById('productContainer') && typeof renderProductPage === 'function') renderProductPage();
    const mobLangList = document.getElementById('mobLangList');
    if(mobLangList && mobLangList.classList.contains('open')) window.toggleAccordion('mobLangList', 'mobLangArrow');
};

window.injectGlobalUI = function() {
    if (!document.getElementById('globalContactBtn')) {
        const tgLink = API.get('bv_settings', {}).tgLink || 'https://t.me/bv_jewelry_izmail';
        document.body.insertAdjacentHTML('beforeend', `<a href="${tgLink}" target="_blank" id="globalContactBtn" class="floating-contact-btn tg-link" aria-label="Telegram"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.24.37-.48 1.02-.73 4-1.74 6.67-2.88 8.01-3.41 3.81-1.52 4.6-1.78 5.12-1.79.11 0 .37.03.54.17.14.12.18.28.2.4.02.07.02.15.02.24z"/></svg></a>`);
    }
    if (!document.getElementById('scrollToTopBtn')) {
        document.body.insertAdjacentHTML('beforeend', `<button id="scrollToTopBtn" onclick="window.scrollTo({top:0, behavior:'smooth'})" aria-label="Вверх" class="fixed bottom-[165px] right-4 z-[4800] w-12 h-12 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--gold-muted)] rounded-full flex items-center justify-center text-[var(--gold-muted)] shadow-[0_5px_20px_rgba(0,0,0,0.3)] opacity-0 translate-y-4 pointer-events-none transition-all duration-300 active:scale-95 md:bottom-10 md:right-10 hover:bg-[var(--gold-muted)] hover:text-[var(--bg-body)]"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg></button>`);
    }
};

window.toggleAccordionPanel = function(clickedPanel) {
    const allPanels = document.querySelectorAll('.glass-panel-item');
    if (clickedPanel.classList.contains('active')) return;
    allPanels.forEach(panel => panel.classList.remove('active'));
    clickedPanel.classList.add('active');
};

// ==========================================
// 13. ПОШУК ТА АВТОРИЗАЦІЯ (SUPABASE)
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

document.addEventListener('DOMContentLoaded', () => {
    const deskSearch = document.querySelector('.search-input.desktop-only') || document.querySelector('.desktop-only .search-input');
    if (deskSearch) { deskSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.executeSearch(e.target.value); }); }
    const overlayInput = document.getElementById('mobSearchOverlayInput');
    if (overlayInput) { overlayInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.executeSearch(e.target.value); }); }
});

let isRegisterMode = false;

window.openAuthModal = function() {
    if(document.getElementById('sideMenu') && document.getElementById('sideMenu').classList.contains('active')){ window.toggleMenu(); }
    const modal = document.getElementById('authModal');
    if(!modal) return;

    const currentUser = API.get('bv_current_user', null);
    modal.classList.remove('hidden'); 
    setTimeout(() => modal.classList.remove('opacity-0'), 10);

    if (currentUser) {
        document.getElementById('authFormContainer').classList.add('hidden');
        document.getElementById('profileView').classList.remove('hidden');
        document.getElementById('profileView').classList.add('flex');

        const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U');
        document.getElementById('profAvatar').innerText = initial;
        document.getElementById('profName').innerText = currentUser.name || 'Клієнт';
        document.getElementById('profEmail').innerText = currentUser.username || '';

        if (currentUser.role === 'admin' || localStorage.getItem('isAdminAuth') === 'true') {
            document.getElementById('adminLinkBtn').classList.remove('hidden');
            document.getElementById('clientLinkBtn').classList.add('hidden');
        } else {
            document.getElementById('adminLinkBtn').classList.add('hidden');
            document.getElementById('clientLinkBtn').classList.remove('hidden');
        }
    } else {
        document.getElementById('profileView').classList.add('hidden');
        document.getElementById('profileView').classList.remove('flex');
        document.getElementById('authFormContainer').classList.remove('hidden');
        isRegisterMode = false; 
        updateAuthView();
    }
};

window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if(modal) { modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 300); }
};

window.toggleAuthMode = function(e) {
    e.preventDefault(); isRegisterMode = !isRegisterMode; updateAuthView();
};

window.updateAuthView = function() {
    document.getElementById('authTitle').innerText = isRegisterMode ? 'Реєстрація' : 'Вхід';
    document.getElementById('authSubtitle').innerText = isRegisterMode ? 'Приєднуйтесь до світу BV Jewelry' : 'Раді бачити вас знову';
    document.getElementById('authSubmitBtn').innerText = isRegisterMode ? 'Створити акаунт' : 'Увійти';
    document.getElementById('authToggleText').innerText = isRegisterMode ? 'Вже є акаунт?' : 'Немає акаунта?';
    document.getElementById('authToggleLink').innerText = isRegisterMode ? 'Увійти' : 'Зареєструватися';
    
    const nameField = document.getElementById('nameFieldContainer');
    if(nameField) {
        if(isRegisterMode) {
            nameField.classList.remove('hidden');
            nameField.classList.add('flex');
            document.getElementById('authName').required = true;
        } else {
            nameField.classList.add('hidden');
            nameField.classList.remove('flex');
            document.getElementById('authName').required = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    if(authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('authSubmitBtn');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Зачекайте...';
            submitBtn.disabled = true;

            const email = document.getElementById('authUser').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            const name = document.getElementById('authName') ? document.getElementById('authName').value.trim() : '';
            
            if(email === 'admin' && pass === 'admin') {
                localStorage.setItem('isAdminAuth', 'true');
                API.set('bv_current_user', { username: 'admin', email: 'admin@bv.com', role: 'admin', name: 'Admin' });
                submitBtn.innerText = originalText; submitBtn.disabled = false;
                window.openAuthModal();
                return;
            }

            if (isRegisterMode) {
                if (pass.length < 6) { 
                    alert('Пароль має містити мінімум 6 символів.'); 
                    submitBtn.innerText = originalText; submitBtn.disabled = false;
                    return; 
                }
                
                const { data, error } = await _supabase.auth.signUp({
                    email: email, password: pass, options: { data: { full_name: name } }
                });

                if (error) {
                    alert('Помилка реєстрації: ' + error.message);
                } else {
                    alert('Реєстрація успішна! Тепер ви можете увійти.');
                    isRegisterMode = false;
                    updateAuthView();
                }
            } else {
                const { data, error } = await _supabase.auth.signInWithPassword({
                    email: email, password: pass,
                });

                if (error) {
                    alert('Невірний логін або пароль!');
                    submitBtn.innerText = originalText; submitBtn.disabled = false;
                    return;
                }

                const { data: profile } = await _supabase.from('profiles').select('role, full_name').eq('id', data.user.id).single();

                const role = (profile && profile.role === 'admin') ? 'admin' : 'client';
                const fullName = (profile && profile.full_name) ? profile.full_name : (data.user.user_metadata?.full_name || 'Клієнт');

                API.set('bv_current_user', { username: data.user.email, role: role, name: fullName });
                if (role === 'admin') sessionStorage.setItem('isAdminAuth', 'true');
                
                openAuthModal();
                if(typeof updateBadges === 'function') updateBadges();
            }
            submitBtn.innerText = originalText; submitBtn.disabled = false;
        });
    }
});

window.logoutUser = async function() {
    if(typeof _supabase !== 'undefined' && _supabase.auth) await _supabase.auth.signOut();
    API.set('bv_current_user', null); 
    API.set('bv_favs', []); 
    API.set('bv_cart', []);
    sessionStorage.removeItem('isAdminAuth'); 
    
    if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('profile.html')) {
        window.location.href = 'index.html';
    } else {
        openAuthModal();
        if(typeof window.renderCart === 'function') window.renderCart(); 
        if(typeof window.renderFavDrawer === 'function') window.renderFavDrawer();
        const profBtn = document.getElementById('headerProfileBtn');
        if(profBtn) profBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    }
};

// ==========================================
// 14. ГЛОБАЛЬНИЙ СТАРТ ТА СЛУХАЧІ
// ==========================================
window.onload = () => { 
    if(window.location.pathname.includes('admin.html')) return; // Зупинка для адмінки

    migrateScopedState();
    if(typeof window.injectGlobalUI === 'function') window.injectGlobalUI();
    if(typeof generateMenus === 'function') generateMenus();
    if(typeof initBannerSlider === 'function') initBannerSlider();
    if(typeof renderHomeCollage === 'function') renderHomeCollage();
    
    if(document.getElementById('marqueeTrack') && typeof initMarqueeSim === 'function') initMarqueeSim();
    if(document.getElementById('specialGrid') && typeof initPremiumCarousel === 'function') {
        renderHomeSections(); 
    }
    if(document.getElementById('productContainer') && typeof renderProductPage === 'function') renderProductPage();
    if(document.getElementById('servicesPriceBody') && typeof renderServicesTable === 'function') renderServicesTable();
    if(document.getElementById('exclusive-process-container') && typeof renderExclusivePage === 'function') renderExclusivePage();

    const savedLang = API.get('bv_lang', 'uk');
    if(typeof window.changeLang === 'function') window.changeLang(savedLang);

    const savedTheme = API.get('bv_theme', 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById('themeIcon'); const iconMob = document.getElementById('themeIconMob');
    const svg = savedTheme === 'light' ? sunSVG : moonSVG;
    if(icon) icon.innerHTML = svg; if(iconMob) iconMob.innerHTML = svg;

    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    if(typeof window.renderCart === 'function') window.renderCart(); 
    if(typeof window.renderFavDrawer === 'function') window.renderFavDrawer();
    if(typeof window.applyAdminSettings === 'function') window.applyAdminSettings(); 

    const currentUser = API.get('bv_current_user', null);
    if(currentUser || localStorage.getItem('isAdminAuth') === 'true') {
        const profBtn = document.getElementById('headerProfileBtn');
        const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A';
        if(profBtn) profBtn.innerHTML = `<div class="w-6 h-6 bg-[var(--gold-muted)] text-[#111] rounded-full flex items-center justify-center text-xs font-bold">${initial}</div>`;
    }

    const burgerBtn = document.getElementById('burger');
    if(burgerBtn) { burgerBtn.onclick = function(e) { e.stopPropagation(); if(typeof window.toggleMenu === 'function') window.toggleMenu(); }; }
};

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if(header) header.classList.toggle('scrolled', window.scrollY > 50);
    const topBtn = document.getElementById('scrollToTopBtn');
    const tgBtn = document.getElementById('globalContactBtn');

    if(window.scrollY > 400) { 
        if(topBtn) { topBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4'); topBtn.classList.add('opacity-100', 'translate-y-0'); }
        if(tgBtn) tgBtn.classList.add('lifted'); 
    } else {
        if(topBtn) { topBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4'); topBtn.classList.remove('opacity-100', 'translate-y-0'); }
        if(tgBtn) tgBtn.classList.remove('lifted'); 
    }
});

const overlay = document.getElementById('overlay');
const cartOverlay = document.getElementById('cartOverlay');
const favOverlay = document.getElementById('favOverlay');
if(overlay) overlay.onclick = () => { if(typeof window.toggleMenu === 'function') window.toggleMenu(); };
if(cartOverlay) cartOverlay.onclick = () => { if(typeof window.toggleCart === 'function') window.toggleCart(); };
if(favOverlay) favOverlay.onclick = () => { if(typeof window.toggleFavDrawer === 'function') window.toggleFavDrawer(); };

document.addEventListener('DOMContentLoaded', () => {
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
                catalogWrapper.classList.remove('open');
                document.body.classList.remove('menu-open');
            }
        });
    }
});