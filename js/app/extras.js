import { API } from '../services/storage.js';
import { _supabase } from '../services/supabase.js';
import { flags, sunSVG, moonSVG, formatterPrice, sunIconSvg, moonIconSvg } from '../utils/constants.js';

/* ==========================================
   ZLATO MEGA MENU SCRIPT - TEXT ONLY
   ========================================== */

async function initZlatoMegaMenu() {
    const parentMenu = document.querySelector('.zlato-style');
    if (!parentMenu) {
        console.error('Елемент .zlato-style не знайдено в DOM!');
        return;
    }

    let categoriesCol = parentMenu.querySelector('.zlato-categories');
    if (!categoriesCol) {
        categoriesCol = document.createElement('div');
        categoriesCol.className = 'zlato-categories';
        parentMenu.prepend(categoriesCol);
    }

    parentMenu.querySelectorAll('.zlato-content').forEach(el => el.remove());

    const fallbackCategories = [
      { id: "rings", name: { en: "Каблучки", ru: "Каблучки", uk: "Каблучки" }, parentId: null },
      { id: "women_rings", name: { en: "Жіночі", ru: "Жіночі", uk: "Жіночі" }, parentId: "rings" },
      { id: "wr_gold_red", name: { en: "Червоне золото", ru: "Червоне золото", uk: "Червоне золото" }, parentId: "women_rings" },
      { id: "wr_gold_white", name: { en: "Біле золото", ru: "Біле золото", uk: "Біле золото" }, parentId: "women_rings" },
      { id: "wr_silver", name: { en: "Срібні", ru: "Срібні", uk: "Срібні" }, parentId: "women_rings" },
      { id: "wr_diamonds", name: { en: "З діамантами", ru: "З діамантами", uk: "З діамантами" }, parentId: "women_rings" },
      { id: "wr_engagement", name: { en: "На заручини", ru: "На заручини", uk: "На заручини" }, parentId: "women_rings" },
      { id: "men_rings", name: { en: "Чоловічі", ru: "Чоловічі", uk: "Чоловічі" }, parentId: "rings" },
      { id: "mr_gold", name: { en: "Золоті печатки", ru: "Золоті печатки", uk: "Золоті печатки" }, parentId: "men_rings" },
      { id: "mr_silver", name: { en: "Срібні персні", ru: "Срібні персні", uk: "Срібні персні" }, parentId: "men_rings" },
      { id: "mr_wedding", name: { en: "Обручки", ru: "Обручки", uk: "Обручки" }, parentId: "men_rings" },
      { id: "mr_enamel", name: { en: "З емаллю/оніксом", ru: "З емаллю/оніксом", uk: "З емаллю/оніксом" }, parentId: "men_rings" },
      { id: "kids_rings", name: { en: "Дитячі", ru: "Дитячі", uk: "Дитячі" }, parentId: "rings" },
      { id: "kr_gold", name: { en: "Золоті", ru: "Золоті", uk: "Золоті" }, parentId: "kids_rings" },
      { id: "kr_silver", name: { en: "Срібні", ru: "Срібні", uk: "Срібні" }, parentId: "kids_rings" },
      { id: "kr_enamel", name: { en: "З кольоровою емаллю", ru: "З кольоровою емаллю", uk: "З кольоровою емаллю" }, parentId: "kids_rings" },
      { id: "earrings", name: { en: "Сережки", ru: "Сережки", uk: "Сережки" }, parentId: null },
      { id: "women_earrings", name: { en: "Жіночі", ru: "Жіночі", uk: "Жіночі" }, parentId: "earrings" },
      { id: "we_gold", name: { en: "Золоті", ru: "Золоті", uk: "Золоті" }, parentId: "women_earrings" },
      { id: "we_silver", name: { en: "Срібні", ru: "Срібні", uk: "Срібні" }, parentId: "women_earrings" },
      { id: "we_studs", name: { en: "Пусети (Гвоздики)", ru: "Пусети (Гвоздики)", uk: "Пусети (Гвоздики)" }, parentId: "women_earrings" },
      { id: "we_english", name: { en: "Англійський замок", ru: "Англійський замок", uk: "Англійський замок" }, parentId: "women_earrings" },
      { id: "we_diamonds", name: { en: "З діамантами", ru: "З діамантами", uk: "З діамантами" }, parentId: "women_earrings" },
      { id: "kids_earrings", name: { en: "Дитячі", ru: "Дитячі", uk: "Дитячі" }, parentId: "earrings" },
      { id: "ke_gold_french", name: { en: "Золоті (Французький замок)", ru: "Золоті (Французький замок)", uk: "Золоті (Французький замок)" }, parentId: "kids_earrings" },
      { id: "ke_silver_studs", name: { en: "Срібні пусети", ru: "Срібні пусети", uk: "Срібні пусети" }, parentId: "kids_earrings" },
      { id: "ke_animals", name: { en: "З тваринками/емаллю", ru: "З тваринками/емаллю", uk: "З тваринками/емаллю" }, parentId: "kids_earrings" },
      { id: "men_earrings", name: { en: "Чоловічі", ru: "Чоловічі", uk: "Чоловічі" }, parentId: "earrings" },
      { id: "me_gold", name: { en: "Золоті моносережки", ru: "Золоті моносережки", uk: "Золоті моносережки" }, parentId: "men_earrings" },
      { id: "me_silver", name: { en: "Срібні моносережки", ru: "Срібні моносережки", uk: "Срібні моносережки" }, parentId: "men_earrings" },
      { id: "necklaces", name: { en: "Кольє та Ланцюжки", ru: "Кольє та Ланцюжки", uk: "Кольє та Ланцюжки" }, parentId: null },
      { id: "women_necklaces", name: { en: "Жіночі", ru: "Жіночі", uk: "Жіночі" }, parentId: "necklaces" },
      { id: "wn_gold_chains", name: { en: "Золоті ланцюжки", ru: "Золоті ланцюжки", uk: "Золоті ланцюжки" }, parentId: "women_necklaces" },
      { id: "wn_silver_chains", name: { en: "Срібні ланцюжки", ru: "Срібні ланцюжки", uk: "Срібні ланцюжки" }, parentId: "women_necklaces" },
      { id: "wn_pendants", name: { en: "З підвіскою", ru: "З підвіскою", uk: "З підвіскою" }, parentId: "women_necklaces" },
      { id: "wn_diamonds", name: { en: "Діамантові кольє", ru: "Діамантові кольє", uk: "Діамантові кольє" }, parentId: "women_necklaces" },
      { id: "men_necklaces", name: { en: "Чоловічі", ru: "Чоловічі", uk: "Чоловічі" }, parentId: "necklaces" },
      { id: "mn_gold_massive", name: { en: "Масивні золоті", ru: "Масивні золоті", uk: "Масивні золоті" }, parentId: "men_necklaces" },
      { id: "mn_silver_bismarck", name: { en: "Срібні (Бісмарк)", ru: "Срібні (Бісмарк)", uk: "Срібні (Бісмарк)" }, parentId: "men_necklaces" },
      { id: "mn_crosses", name: { en: "Хрестики та ладанки", ru: "Хрестики та ладанки", uk: "Хрестики та ладанки" }, parentId: "men_necklaces" },
      { id: "kids_necklaces", name: { en: "Дитячі", ru: "Дитячі", uk: "Дитячі" }, parentId: "necklaces" },
      { id: "kn_thin_silver", name: { en: "Тонкі срібні ланцюжки", ru: "Тонкі срібні ланцюжки", uk: "Тонкі срібні ланцюжки" }, parentId: "kids_necklaces" },
      { id: "kn_gold_crosses", name: { en: "Золоті хрестики", ru: "Золоті хрестики", uk: "Золоті хрестики" }, parentId: "kids_necklaces" },
      { id: "bracelets", name: { en: "Браслети", ru: "Браслети", uk: "Браслети" }, parentId: null },
      { id: "women_bracelets", name: { en: "Жіночі", ru: "Жіночі", uk: "Жіночі" }, parentId: "bracelets" },
      { id: "wb_gold", name: { en: "Золоті гнучкі", ru: "Золоті гнучкі", uk: "Золоті гнучкі" }, parentId: "women_bracelets" },
      { id: "wb_silver_hard", name: { en: "Срібні жорсткі", ru: "Срібні жорсткі", uk: "Срібні жорсткі" }, parentId: "women_bracelets" },
      { id: "wb_tennis", name: { en: "Тенісні браслети", ru: "Тенісні браслети", uk: "Тенісні браслети" }, parentId: "women_bracelets" },
      { id: "wb_charms", name: { en: "З шармами", ru: "З шармами", uk: "З шармами" }, parentId: "women_bracelets" },
      { id: "men_bracelets", name: { en: "Чоловічі", ru: "Чоловічі", uk: "Чоловічі" }, parentId: "bracelets" },
      { id: "mb_leather_gold", name: { en: "Шкіряні з золотом", ru: "Шкіряні з золотом", uk: "Шкіряні з золотом" }, parentId: "men_bracelets" },
      { id: "mb_silver_massive", name: { en: "Срібні масивні", ru: "Срібні масивні", uk: "Срібні масивні" }, parentId: "men_bracelets" },
      { id: "kids_bracelets", name: { en: "Дитячі", ru: "Дитячі", uk: "Дитячі" }, parentId: "bracelets" },
      { id: "kb_red_thread", name: { en: "Червона нитка з золотом", ru: "Червона нитка з золотом", uk: "Червона нитка з золотом" }, parentId: "kids_bracelets" },
      { id: "kb_silver_plate", name: { en: "Срібні з пластинкою", ru: "Срібні з пластинкою", uk: "Срібні з пластинкою" }, parentId: "kids_bracelets" }
    ];

    let categories = [];

    try {
        if (typeof _supabase !== 'undefined') {
            const { data: catRes } = await _supabase.from('site_storage').select('*').eq('key', 'bv_categories_flat').single();
            categories = catRes ? (catRes.value || catRes.data || catRes) : [];
        }
    } catch (err) {
        console.warn('Supabase warning:', err);
    }

    if (!Array.isArray(categories) || categories.length === 0) {
        categories = fallbackCategories;
    }

    const getText = (nameField) => {
        if (!nameField) return '';
        if (typeof nameField === 'string') return nameField;
        if (typeof nameField === 'object') {
            return nameField.uk || nameField.ru || nameField.en || Object.values(nameField)[0] || '';
        }
        return String(nameField);
    };

    const getAllSubcategories = (catId, allCats) => {
        let subs = allCats.filter(c => String(c.parentId) === String(catId));
        let result = [...subs];
        subs.forEach(sub => {
            result.push(...getAllSubcategories(sub.id, allCats));
        });
        return result;
    };

    const mainCategories = categories.filter(c => c.parentId === null || c.parentId === undefined);

    let col1HTML = '';
    let contentsHTML = '';

    mainCategories.forEach((mainCat, index) => {
        const isActive = index === 0 ? 'active' : '';
        const mainName = getText(mainCat.name);

        col1HTML += `
            <button class="zlato-cat-item ${isActive}" data-target="zlato-cat-${mainCat.id}" onmouseenter="switchZlatoTab('${mainCat.id}')">
                <span>${mainName}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        `;

        const subCategories = getAllSubcategories(mainCat.id, categories);

        let subcatsHTML = '';
        if (subCategories.length > 0) {
            subcatsHTML = subCategories.map(sub => {
                const subName = getText(sub.name);
                return `
                    <a href="catalog.html?cat=${sub.id}" class="zlato-subcat-card">
                        <div class="zlato-subcat-title">${subName}</div>
                    </a>
                `;
            }).join('');
        } else {
            subcatsHTML = `<div style="grid-column: span 4; text-align: center; padding: 30px; font-size: 12px; color: var(--text-muted);">Підкатегорій не знайдено</div>`;
        }

        contentsHTML += `
            <div class="zlato-content ${isActive}" id="zlato-cat-${mainCat.id}">
                <div class="zlato-subcats-grid">
                    ${subcatsHTML}
                </div>
            </div>
        `;
    });

    categoriesCol.innerHTML = col1HTML;
    parentMenu.insertAdjacentHTML('beforeend', contentsHTML);
}

window.switchZlatoTab = function(catId) {
    const parentMenu = document.querySelector('.zlato-style');
    if (!parentMenu) return;

    parentMenu.querySelectorAll('.zlato-cat-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === `zlato-cat-${catId}`);
    });

    parentMenu.querySelectorAll('.zlato-content').forEach(content => {
        content.classList.toggle('active', content.id === `zlato-cat-${catId}`);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    window.initZlatoMegaMenu();
});

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.injectAuthModal === 'function') {
        window.injectAuthModal();
    }
});




const forceMoveJivo = () => {
    // Ищем мобильную кнопку Jivo
    const jivoBtn = document.querySelector('.__jivoMobileButton');
    
    if (jivoBtn) {
        // Принудительно смещаем её вверх на нужное количество пикселей (например, на 300 пикселей)
        // Чем больше число, тем выше поднимется кнопка
        jivoBtn.style.setProperty('transform', 'translateY(-150px)', 'important');
    }
};

// Запускаем постоянную проверку
setInterval(forceMoveJivo, 200);




// === МОДУЛЬ COOKIE-БАННЕРА ===
(function() {
    // Функции работы с куки
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    // Создаем и внедряем HTML-разметку баннера
    function initCookieBanner() {
        // Если согласие уже получено ранее, ничего не выводим
        if (getCookie("bv_cookie_consent")) return;

        const banner = document.createElement("div");
        banner.id = "cookieBanner";
        // Позиционируем чуть выше нижнего бара (строго над кнопкой «До головної»)
        // Изменили класс мобильного отступа с bottom-36 на bottom-48 (или bottom-52)
        banner.className = "fixed bottom-48 sm:bottom-24 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-white/90 backdrop-blur-md border border-slate-200 p-5 rounded-2xl shadow-2xl transition-all duration-500 transform translate-y-4 opacity-0 pointer-events-none";
        
        banner.innerHTML = `
            <div class="flex flex-col space-y-3">
                <div class="flex items-start justify-between">
                    <h3 class="text-sm font-semibold text-slate-900">🍪 Використання Cookies</h3>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                    Ми використовуємо файли cookie для покращення роботи. Детальніше читайте в нашій 
                    <a href="privacy.html" class="text-slate-900 font-medium underline hover:text-slate-600 transition">Політиці конфіденційності</a>.
                </p>
                <div class="flex items-center justify-end gap-2 pt-1">
                    <button id="acceptCookiesBtn" class="bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-slate-800 active:scale-95 transition-all cursor-pointer">
                        Зрозуміло
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Плавное появление через 500мс после загрузки страницы
        setTimeout(() => {
            banner.classList.remove("translate-y-4", "opacity-0", "pointer-events-none");
            banner.classList.add("translate-y-0", "opacity-100");
        }, 500);

        // Обработка нажатия на кнопку «Зрозуміло»
        const acceptBtn = document.getElementById("acceptCookiesBtn");
        if (acceptBtn) {
            acceptBtn.addEventListener("click", function() {
                setCookie("bv_cookie_consent", "accepted", 30); // Запоминаем выбор на 30 дней
                
                // Плавное исчезновение
                banner.classList.remove("translate-y-0", "opacity-100");
                banner.classList.add("translate-y-4", "opacity-0", "pointer-events-none");
                
                setTimeout(() => banner.remove(), 500);
            });
        }
    }

    // Запускаем инициализацию при загрузке DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCookieBanner);
    } else {
        initCookieBanner();
    }
})();




async function renderHomeCategories() {
    const accordionContainer = document.getElementById('glassAccordion');
    if (!accordionContainer) return;

    try {
        const { data: categoriesData } = await _supabase.from('site_storage').select('*').eq('key', 'bv_categories_flat').single();
        const { data: productsData } = await _supabase.from('products').select('*');

        const categories = categoriesData ? (categoriesData.value || categoriesData) : [];
        const products = productsData || [];

        const mainCategoryIds = ['rings', 'earrings', 'necklaces', 'bracelets'];
        const rootCategories = categories.filter(c => mainCategoryIds.includes(c.id) || !c.parentId);

        accordionContainer.innerHTML = rootCategories.map((cat, index) => {
            const allSubIds = getAllSubCategoryIds(cat.id, categories);
            const targetCatIds = [cat.id, ...allSubIds].map(id => String(id).toLowerCase());

            let firstProduct = products.find(p => {
                const pCat = p.category || p.category_id || p.cat_id || p.group || p.parent_id;
                return pCat && targetCatIds.includes(String(pCat).toLowerCase());
            });

            if (!firstProduct && products.length > 0) {
                firstProduct = products[0];
            }
            
            let bgImage = '';
            if (firstProduct) {
                bgImage = firstProduct.image || 
                        firstProduct.image_url || 
                        firstProduct.photo || 
                        firstProduct.img || 
                        firstProduct.thumbnail || 
                        (Array.isArray(firstProduct.images) ? firstProduct.images[0] : null);

                if (!bgImage && firstProduct.variations) {
                    const vars = Object.values(firstProduct.variations);
                    for (const v of vars) {
                        const vImg = v?.image || v?.image_url || v?.photo || (Array.isArray(v?.images) ? v.images[0] : null);
                        if (vImg) {
                            bgImage = vImg;
                            break;
                        }
                    }
                }
            }

            const subCategories = categories.filter(c => c.parentId === cat.id);
            const tagsHtml = subCategories.map(sub => `
                <a href="catalog.html#${sub.id}" onclick="event.stopPropagation()" class="panel-tag">${sub.name?.uk || sub.name || sub.id}</a>
            `).join('');

            const categoryName = cat.name?.uk || cat.name || cat.id;
            const isActive = index === 0 ? 'active' : '';

            return `
                <div class="glass-panel-item group ${isActive}" onclick="toggleAccordionPanel(this)">
                    ${bgImage ? `<img src="${bgImage}" alt="${categoryName}" class="panel-bg">` : `<div class="panel-bg bg-gray-200 dark:bg-zinc-800"></div>`}
                    <div class="panel-overlay"></div>
                    <div class="panel-content">
                        <h3 class="panel-title">${categoryName}</h3>
                        <div class="panel-hidden-content">
                            <div class="panel-tags">
                                ${tagsHtml}
                            </div>
                            <a href="catalog.html#${cat.id}" onclick="event.stopPropagation()" class="panel-btn">Всі ${categoryName.toLowerCase()} →</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Помилка рендерингу категорій аккордеону:', error);
    }
}







function createProductCard(product) {
    // Подстраховка от undefined: берем существующее поле или значение по умолчанию
    const title = product.name || product.title || 'Без названия';
    const price = product.price || product.price_usd ? `$${product.price || product.price_usd}` : 'Цена по запросу';
    const imageUrl = product.image_url || product.image || 'https://via.placeholder.com/300';

    return `
        <div class="product-card" data-id="${product.id}">
            <img src="${imageUrl}" alt="${title}">
            <h3>${title}</h3>
            <span>${price}</span>
        </div>
    `;
}



// Глобальний захист від появи слова "undefined" у будь-яких елементах на сайті
document.addEventListener("DOMContentLoaded", () => {
    const sanitizeUndefined = () => {
        document.querySelectorAll('*').forEach(el => {
            // Перевіряємо текстові вузли без дочірніх тегів
            if (el.children.length === 0 && el.textContent && el.textContent.trim() === 'undefined') {
                el.textContent = ''; // Очищаємо сміття
            }
        });
    };

    // Запускаємо при завантаженні та періодично для динамічних елементів (кошик, модалки тощо)
    sanitizeUndefined();
    setInterval(sanitizeUndefined, 500);
});

// Classic-script global mirror
window.createProductCard = createProductCard;
window.initZlatoMegaMenu = initZlatoMegaMenu;
window.renderHomeCategories = renderHomeCategories;
