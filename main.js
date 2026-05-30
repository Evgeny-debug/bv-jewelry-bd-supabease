// ==========================================
// 0. ІНІЦІАЛІЗАЦІЯ БАЗИ ДАНИХ (SUPABASE)
// ==========================================
const supabaseUrl = 'https://trcjsnvcdonlzxprgdzd.supabase.co'; 
const supabaseKey = 'sb_publishable_qSUZxk_9JV9wJNrdjAqeLA_8O_8-TVV'; 
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log("BV Jewelry: Підключення до хмари Supabase встановлено.");

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
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
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

// УМНИЙ ЛОКАЛІЗАТОР (Підтримує і старий, і новий мультиязичний JSON-формат)
window.getLoc = function(obj, field) {
    if (!obj) return '';
    const lang = API.get('bv_lang', 'uk');
    
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') {
        if (field) {
            // Новий формат: obj.name = {uk: '...', ru: '...', en: '...'}
            if (typeof obj[field] === 'object' && obj[field] !== null) {
                return obj[field][lang] || obj[field]['uk'] || '';
            }
            // Старий формат
            if (lang === 'uk') return obj[field] || '';
            const locField = field + lang.toUpperCase(); 
            return obj[locField] || obj[field] || ''; 
        } else {
            // Якщо передали одразу об'єкт перекладів
            return obj[lang] || obj['uk'] || '';
        }
    }
    return '';
};

const flags = { uk: "ua", ru: "ru", en: "gb", bg: "bg" };
const sunSVG = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
const moonSVG = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`;
const formatterPrice = new Intl.NumberFormat('uk-UA', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 });

let categoriesTree = [];
let products = [];

// ==========================================
// 3. АСИНХРОННЕ ЗАВАНТАЖЕННЯ ДАНИХ ТА ГЕНЕРАЦІЯ ДЕРЕВА
// ==========================================
function buildTree(flatList) {
    let tree = [];
    let lookup = {};
    flatList.forEach(c => lookup[c.id] = { ...c, subcategories: [] });
    flatList.forEach(c => {
        if (c.parentId && lookup[c.parentId]) {
            lookup[c.parentId].subcategories.push(lookup[c.id]);
        } else {
            tree.push(lookup[c.id]);
        }
    });
    return tree;
}

window.loadCloudData = async function() {
    try {
        const { data: prodData } = await _supabase.from('products').select('*');
        if (prodData && prodData.length > 0) {
            products = prodData;
            API.set('bv_products', products);
        } else if (prodData && prodData.length === 0 && typeof window.BVDemoData !== 'undefined') {
            products = window.BVDemoData.products || [];
            if(products.length > 0) await _supabase.from('products').upsert(products);
            API.set('bv_products', products);
        }

        const { data: storageData } = await _supabase.from('site_storage').select('*');
        if (storageData && storageData.length > 0) {
            let flatCats = [];
            storageData.forEach(item => {
                API.set(item.key, item.value);
                if(item.key === 'bv_categories_flat') flatCats = item.value;
                if(item.key === 'bv_categories_tree') categoriesTree = item.value; // Фоллбек
            });
            
            // Якщо є плоский список - будуємо справжнє безкінечне дерево
            if(flatCats.length > 0) {
                categoriesTree = buildTree(flatCats);
                API.set('bv_categories_tree', categoriesTree);
            }
        }
        
        if(typeof generateMenus === 'function') generateMenus();
        if(typeof initBannerSlider === 'function') initBannerSlider();
        if(typeof renderHomeSections === 'function') renderHomeSections();
        if(typeof window.applyAdminSettings === 'function') window.applyAdminSettings(); 
        
        window.updateProfileMenu(); 
    } catch (err) {
        console.error("Помилка завантаження бази:", err);
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
    if (currentUser && currentUser.id) {
        currentUser.favs = favs; 
        API.set('bv_current_user', currentUser);
        await _supabase.from('profiles').update({ favs: favs }).eq('id', currentUser.id);
    }
}

function getCart() { return API.get(getScopedStorageKey('bv_cart'), []); }
function setCart(cart) { API.set(getScopedStorageKey('bv_cart'), cart); API.set('bv_cart', cart); }

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, """).replace(/'/g, "'");
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
    
    if (existing) existing.qty += 1;
    else {
        cart.push({ 
            cartId: cartId, id: id, title: cleanTitle, variant: String(variant), 
            price: Number(price), img: String(img), qty: 1, sku: sku, size: extractedSize
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
    if(cart.length === 0) return alert('Ваш кошик порожній!');
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
        
        const sizeBadge = item.size ? `<span class="bg-[var(--gold-muted)]/20 text-[var(--gold-muted)] px-2 py-0.5 rounded text-[10px] font-bold">Розмір: ${item.size}</span>` : '';
        const skuBadge = `<span class="text-[10px] text-[var(--text-muted)]">Арт: ${item.sku}</span>`;

        cartBody.insertAdjacentHTML('beforeend', `
            <div class="cart-item flex gap-4 p-3 rounded-xl mb-3 relative transition-all duration-300 hover:border-[var(--gold-muted)]/40">
                <img src="${item.img}" class="w-20 h-20 object-cover rounded-lg border border-[var(--border)]">
                <div class="flex-grow flex flex-col justify-center pr-6">
                    <span class="text-sm font-semibold uppercase tracking-wide leading-tight line-clamp-2">${escapeHtml(item.title)}</span>
                    <div class="flex flex-wrap items-center gap-2 mt-1">
                        ${sizeBadge}
                        ${skuBadge}
                    </div>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="text-sm font-bold text-[var(--gold-muted)]">${formatterPrice.format(item.price)} ₴</span>
                        <div class="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)]">
                            <button class="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)]" onclick="updateCartQty('${item.cartId}', -1)">−</button>
                            <span class="px-2 text-xs text-[var(--text-main)] font-semibold min-w-6 text-center">${item.qty}</span>
                            <button class="px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)]" onclick="updateCartQty('${item.cartId}', 1)">+</button>
                        </div>
                    </div>
                </div>
                <button class="cart-item-remove absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)]" onclick="removeFromCart('${item.cartId}')">
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
        checkoutBtnWrapper.innerHTML = `<button id="checkoutBtn" onclick="window.checkoutOrder()" class="w-full bg-[var(--gold-muted)] text-[#111] font-bold uppercase tracking-widest py-3 rounded-xl hover:opacity-90 transition-opacity active:scale-95">Оформити замовлення</button>`;
    }
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
    favBody.innerHTML = favProducts.map(prod => {
        const base = prod.variations ? prod.variations.base : prod;
        const safeImg = escapeHtml((base.images && base.images.length > 0) ? base.images[0] : (base.img || base.image || ''));
        const safeName = escapeHtml(window.getLoc(base.name));
        const priceDisplay = base.discount && Number(base.discount) > 0 ? base.discount : base.price;

        return `
        <div class="cart-item flex gap-4 p-3 rounded-xl mb-3 relative transition-all duration-300 hover:border-[var(--gold-muted)]/35 cursor-pointer" onclick="location.href='product.html?id=${prod.id}'">
            <img src="${safeImg}" class="w-16 h-16 object-cover rounded-lg border border-[var(--border)]">
            <div class="flex-grow flex flex-col justify-center pr-6">
                <span class="text-xs font-semibold uppercase tracking-wide line-clamp-1">${safeName}</span>
                <span class="text-[10px] text-[var(--text-muted)] mt-1">${escapeHtml(prod.variant || '')}</span>
                <span class="text-sm font-bold text-[var(--gold-muted)] mt-1">${formatterPrice.format(priceDisplay)} ₴</span>
            </div>
            <button class="cart-item-remove absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)]" onclick="event.stopPropagation(); toggleFav('${prod.id}')" title="Видалити">
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
    const base = prod.variations ? prod.variations.base : prod; // Зворотня сумісність
    
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

    const price = base.price || 0;
    const discount = base.discount || null;

    let priceHtml = `<span class="text-[14px] md:text-[16px] font-bold text-[var(--gold-muted)]">${formatterPrice.format(price)} ₴</span>`;
    if (discount && Number(discount) > 0) {
        priceHtml = `<span class="text-[14px] md:text-[16px] font-bold text-[var(--success)]">${formatterPrice.format(discount)} ₴</span><span class="text-[10px] md:text-[12px] text-[var(--text-muted)] line-through ml-2 opacity-70">${formatterPrice.format(price)} ₴</span>`;
    }

    const safeId = escapeHtml(prod.id);
    const safeName = escapeHtml(window.getLoc(base.name)).replace(/'/g, "\\'"); 
    const safeVariant = escapeHtml(prod.variant || '').replace(/'/g, "\\'");
    
    const safeImg = escapeHtml((base.images && base.images.length > 0) ? base.images[0] : (base.img || base.image || ''));
    const priceDisplay = discount && Number(discount) > 0 ? discount : price;

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
// 8. ДИНАМІЧНА ГЕНЕРАЦІЯ МЕНЮ (БЕЗКІНЧЕННІ КАТЕГОРІЇ)
// ==========================================
function generateMenus() {
    const megaCol1 = document.getElementById('megaCol1');
    const megaMenu = document.querySelector('.mega-menu');
    const sideMenu = document.getElementById('sideMenu');
    
    // Допоміжна функція для мобільного дерева
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

    if(sideMenu) {
        let mobCatHtml = buildMobileTree(categoriesTree);
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
                    <a href="info.html?p=about" class="sub-cat-link py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Про нас</a>
                    <a href="info.html?p=warranty" class="sub-cat-link py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Гарантія та повернення</a>
                    <a href="info.html?p=terms" class="sub-cat-link py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Оплата і доставка</a>
                    <a href="info.html?p=faq" class="sub-cat-link py-3 block text-[14px] opacity-80" onclick="window.toggleMenu()">Часті питання</a>
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
                        <div class="dropdown-item py-3" onclick="window.changeLang('ru')"><img src="https://flagcdn.com/ru.svg" class="flag"> Русский</div>
                        <div class="dropdown-item py-3" onclick="window.changeLang('en')"><img src="https://flagcdn.com/gb.svg" class="flag"> English</div>
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

    const btnClass = "hidden md:flex absolute top-1/2 -translate-y-1/2 z-40 w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-[var(--bg-card)]/40 backdrop-blur-md border border-[var(--border)] text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-all duration-400 hover:scale-110 hover:bg-[var(--bg-card)] hover:border-[var(--gold-muted)] hover:text-[var(--gold-muted)] shadow-[0_8px_30px_rgba(0,0,0,0.15)]";
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
        html += `<div class="banner-slide" data-index="${i}"><a href="${b.link || '#'}"><img src="${b.img}" alt="Promo" style="aspect-ratio: ${ratio}; object-cover;"></a></div>`; 
    });
    html += '</div>';

    if(banners.length > 1) {
        html += `<button class="banner-arrow prev" onclick="moveBanner(-1)">❮</button><button class="banner-arrow next" onclick="moveBanner(1)">❯</button><div class="banner-dots">`;
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
// 11. ГОЛОВНА: ДИНАМІЧНІ БЛОКИ СЕКЦІЙ
// ==========================================
window.renderHomeSections = function() {
    const homeBlocks = API.get('bv_home_blocks', [
        { id: 'hits', name: {uk: 'Хіти місяця', ru: 'Хиты', en: 'Hits'}, active: true },
        { id: 'weekly', name: {uk: 'Вибір тижня', ru: 'Выбор недели', en: 'Weekly Choice'}, active: true }
    ]);
    
    // Видаляємо старі хардкодні секції
    const oldSpecial = document.getElementById('special-section');
    if (oldSpecial) oldSpecial.style.display = 'none';
    const oldWeekly = document.getElementById('weekly-section');
    if (oldWeekly) oldWeekly.style.display = 'none';
    
    // Створюємо динамічний контейнер
    let container = document.getElementById('dynamicHomeBlocksContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'dynamicHomeBlocksContainer';
        const catSec = document.getElementById('categories-section');
        if (catSec && catSec.parentNode) {
            catSec.parentNode.insertBefore(container, catSec);
        } else {
            // Фолбек якщо структуру сторінки змінено
            document.querySelector('main').appendChild(container);
        }
    }
    
    let html = '';
    homeBlocks.filter(b => b.active).forEach(block => {
        // Шукаємо товари для цього блоку
        let items = products.filter(p => {
            if (p.blocks && p.blocks.includes(block.id)) return true;
            // Зворотня сумісність
            if (block.id === 'hits' && p.isSpecial) return true;
            if (block.id === 'weekly' && p.isWeekly) return true;
            return false;
        });
        
        if (items.length > 0) {
            const title = window.getLoc(block.name);
            const trackId = `block-track-${block.id}`;
            const cardWrapper = (p) => `<div class="flex-none w-[45%] sm:w-[32%] md:w-[26%] lg:w-[20%] xl:w-[18%] snap-start flex">${window.renderProductCard(p)}</div>`;
            
            let blockItems = [...items];
            // Розмножуємо для безкінечного скролу
            while(blockItems.length < 12 && blockItems.length > 0) { blockItems = blockItems.concat(items); }
            
            html += `
            <section class="max-w-[1920px] mx-auto px-4 md:px-12 py-12 md:py-24 border-t border-[var(--border)] mt-10">
                <div class="mb-8 md:mb-16 text-left md:text-center px-4">
                    <span class="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-[var(--gold-muted)] font-semibold block mb-4">BV Jewelry</span>
                    <h2 class="hero-title text-[var(--text-main)] !text-[28px] md:!text-[40px] leading-tight">${title}</h2>
                </div>
                <div class="promo-carousel-container select-none group relative">
                    <div id="${trackId}" class="flex overflow-x-auto gap-4 md:gap-5 pb-6 pt-2 snap-x snap-mandatory no-scrollbar min-h-[300px]">
                        ${blockItems.map(cardWrapper).join('')}
                    </div>
                </div>
            </section>`;
        }
    });
    
    container.innerHTML = html;
    
    // Ініціалізація каруселей
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
            html += `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.addresses[0])}" target="_blank" class="text-[14px] text-[var(--text-main)] opacity-90 hover:text-[var(--gold-muted)] flex items-center gap-2 transition">
                        <svg class="w-4 h-4 fill-currentColor opacity-60" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span>${settings.addresses[0]}</span>
                    </a>`;
            
            if (settings.addresses.length > 1) {
                html += `<button onclick="window.showBranchesModal()" class="text-[11px] font-bold uppercase tracking-widest text-[var(--gold-muted)] hover:underline mt-2">Наші філіали (${settings.addresses.length})</button>`;
            }
            footerAddrBlock.innerHTML = html;
        }
    }
};

window.showBranchesModal = function() {
    const settings = API.get('bv_settings', {});
    const addrs = settings.addresses || [];
    if(addrs.length === 0) return;
    
    const list = addrs.map(a => `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}" target="_blank" class="block p-4 border border-[var(--border)] rounded-xl hover:border-[var(--gold-muted)] text-[var(--text-main)] text-sm mb-3 transition-colors flex items-center justify-between group">
        <span>${a}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--gold-muted)]"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
    </a>`).join('');
    
    const modalHtml = `
    <div id="branchesModal" class="fixed inset-0 bg-black/80 z-[7000] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity" onclick="this.remove()">
        <div class="glass-panel p-8 w-full max-w-md relative rounded-[24px] shadow-2xl bg-[var(--bg-card)] border border-[var(--border)]" onclick="event.stopPropagation()">
            <button onclick="document.getElementById('branchesModal').remove()" class="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--danger)] text-2xl leading-none">×</button>
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
    
    // Перерендер динамічних блоків
    if(document.getElementById('dynamicHomeBlocksContainer') && typeof renderHomeSections === 'function') renderHomeSections();
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
    modal.classList.remove('hidden'); 
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    isRegisterMode = false; 
    updateAuthView();
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

    const subsField = document.getElementById('subsFieldContainer');
    if(!subsField && isRegisterMode) {
        document.getElementById('authForm').insertAdjacentHTML('beforeend', `
            <div id="subsFieldContainer" class="flex flex-col gap-2 mt-4">
                <label class="flex items-center gap-2 text-xs text-gray-400 cursor-pointer"><input type="checkbox" id="authNewsletter" class="accent-[var(--gold-muted)]" checked> Повідомляти про новинки</label>
                <label class="flex items-center gap-2 text-xs text-gray-400 cursor-pointer"><input type="checkbox" id="authDiscounts" class="accent-[var(--gold-muted)]" checked> Отримувати персональні знижки</label>
            </div>
        `);
    } else if (subsField && !isRegisterMode) {
        subsField.remove();
    }
    
    const socialBlockId = 'socialLoginBlock';
    let socialBlock = document.getElementById(socialBlockId);
    
    if(!socialBlock) {
        const formContainer = document.getElementById('authFormContainer');
        formContainer.insertAdjacentHTML('beforeend', `
            <div id="${socialBlockId}" class="mt-4 flex flex-col gap-3">
                <div class="relative flex items-center justify-center w-full mt-2 mb-2">
                    <div class="border-t border-[var(--border)] w-full"></div>
                    <span class="bg-[var(--bg-card)] px-3 text-[10px] text-[var(--text-muted)] absolute uppercase tracking-widest">Або</span>
                </div>
                <div class="flex gap-3">
                    <button type="button" onclick="loginWithGoogle()" class="flex-1 flex items-center justify-center gap-2 border border-[var(--border)] py-3 rounded-xl text-xs font-semibold hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-main)] active:scale-95">
                        <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Google
                    </button>
                    <button type="button" onclick="loginWithApple()" class="flex-1 flex items-center justify-center gap-2 border border-[var(--border)] py-3 rounded-xl text-xs font-semibold hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-main)] active:scale-95">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.8 3.59-.83 1.89-.04 3.23.86 4.14 2.19-3.21 1.83-2.66 5.89.5 7.05-.72 1.63-1.87 3.19-3.31 3.76zm-3.08-16.7c.66-.82 1.13-1.95.95-3.08-1.02.04-2.27.68-2.98 1.5-.61.69-1.16 1.86-.93 2.97 1.14.09 2.24-.51 2.96-1.39z"/></svg> Apple
                    </button>
                </div>
            </div>
        `);
    }
};

window.loginWithGoogle = async function() {
    if(typeof _supabase === 'undefined') return alert('Помилка підключення бази даних.');
    await _supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } });
};

window.loginWithApple = async function() {
    if(typeof _supabase === 'undefined') return alert('Помилка підключення бази даних.');
    await _supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin + window.location.pathname } });
};

window.updateProfileMenu = function() {
    const user = getCurrentUser();
    const dropdownMenu = document.getElementById('profileDropdownMenu');
    if(dropdownMenu) {
        if (user) {
            dropdownMenu.innerHTML = `
                <a href="profile.html" class="dropdown-item w-full text-left font-medium">Мій кабінет</a>
                ${user.role === 'admin' ? '<a href="admin.html" class="dropdown-item w-full text-left font-bold text-[#c5a059]">Панель Адміна</a>' : ''}
                <button onclick="logoutUser()" class="dropdown-item w-full text-left text-red-400 hover:text-red-500 mt-2 border-t border-[var(--border)] pt-2">Вийти з акаунту</button>
            `;
        } else {
            dropdownMenu.innerHTML = `
                <button onclick="window.isRegisterMode=false; window.openAuthModal();" class="dropdown-item w-full text-left font-medium">Увійти</button>
                <button onclick="window.isRegisterMode=true; window.openAuthModal();" class="dropdown-item w-full text-left font-medium text-[#c5a059]">Зареєструватися</button>
            `;
        }
    }
};

window.initRealtime = function() {
    const user = getCurrentUser();
    if(!user) return;

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

document.addEventListener('DOMContentLoaded', async () => {
    if(window.location.hash && window.location.hash.includes('access_token')) {
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
            const submitBtn = document.getElementById('authSubmitBtn');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Зачекайте...';
            submitBtn.disabled = true;

            const email = document.getElementById('authUser').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            const name = document.getElementById('authName') ? document.getElementById('authName').value.trim() : '';

            if (isRegisterMode) {
                if (pass.length < 6) { 
                    alert('Пароль має містити мінімум 6 символів.'); 
                    submitBtn.innerText = originalText; submitBtn.disabled = false;
                    return; 
                }
                
                const w_news = document.getElementById('authNewsletter')?.checked || false;
                const w_disc = document.getElementById('authDiscounts')?.checked || false;

                const { data, error } = await _supabase.auth.signUp({
                    email: email, password: pass, options: { data: { full_name: name, wants_newsletter: w_news, wants_discounts: w_disc } }
                });

                if (error) {
                    alert('Помилка реєстрації: ' + error.message);
                } else {
                    if(data.user) {
                        await _supabase.from('profiles').insert([
                            { id: data.user.id, full_name: name, role: 'client', wants_newsletter: w_news, wants_discounts: w_disc, favs: [] }
                        ]);
                    }
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
});

window.logoutUser = async function() {
    if(typeof _supabase !== 'undefined' && _supabase.auth) {
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
    const icon = document.getElementById('themeIcon'); const iconMob = document.getElementById('themeIconMob');
    const svg = savedTheme === 'light' ? sunSVG : moonSVG;
    if(icon) icon.innerHTML = svg; if(iconMob) iconMob.innerHTML = svg;

    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    if(typeof window.renderCart === 'function') window.renderCart(); 
    if(typeof window.renderFavDrawer === 'function') window.renderFavDrawer();

    const currentUser = API.get('bv_current_user', null);
    if(currentUser || localStorage.getItem('isAdminAuth') === 'true') {
        window.initRealtime();
    }
    
    window.updateProfileMenu(); 

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