import { API } from '../services/storage.js';
import { _supabase } from '../services/supabase.js';
import { flags, sunSVG, moonSVG, formatterPrice, sunIconSvg, moonIconSvg } from '../utils/constants.js';

let banners = [];
let priceListDB = Array.isArray(window.priceListDB) ? window.priceListDB : [];
window.priceListDB = priceListDB;

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
        window.renderBannersAdmin();
    } catch (err) {
        banners = [];
        window.renderBannersAdmin();
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

            window.renderBannersAdmin();
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

        window.renderBannersAdmin();
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



// ==========================================
// ВІЗУАЛЬНИЙ РЕДАКТОР ПРАЙС-ЛИСТА
// ==========================================

function renderPriceBuilder() {
    const container = document.getElementById('priceBuilderContainer');
    if (!container) return;
    
    if (!Array.isArray(priceListDB)) priceListDB = [];
    
    if (priceListDB.length === 0) {
        container.innerHTML = `
            <div class="glass-panel p-8 text-center text-gray-400 text-xs">
                Прайс-лист порожній. Натисніть «+ Додати категорію», щоб почати.
            </div>
        `;
        return;
    }

    container.innerHTML = priceListDB.map((cat, catIdx) => {
        const catTitle = cat.title || cat.category || 'Категорія';
        const items = cat.items || [];
        
        return `
            <div class="glass-panel p-4 lg:p-6 space-y-4 border border-white/10">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div class="w-full sm:w-1/2">
                        <label class="text-[10px] uppercase font-bold text-[#c5a059] block mb-1">Назва категорії</label>
                        <input type="text" class="input-field text-xs font-semibold" value="${catTitle}" oninput="updatePriceCatTitle(${catIdx}, this.value)">
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto justify-end">
                        <button type="button" onclick="addPriceItem(${catIdx})" class="btn-secondary text-xs py-1.5 px-3">+ Послуга</button>
                        <button type="button" onclick="deletePriceCat(${catIdx})" class="btn-danger text-xs py-1.5 px-3">Видалити категорію</button>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <div class="text-[10px] uppercase font-bold text-gray-400">Послуги та ціни</div>
                    ${items.length === 0 ? '<div class="text-xs text-gray-500 italic py-2">У цій категорії поки немає послуг.</div>' : ''}
                    ${items.map((item, itemIdx) => `
                        <div class="flex flex-col sm:flex-row gap-2 items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                            <input type="text" class="input-field text-xs flex-1" placeholder="Назва послуги (напр. Лазерне паяння)" value="${item.name || ''}" oninput="updatePriceItem(${catIdx}, ${itemIdx}, 'name', this.value)">
                            <input type="text" class="input-field text-xs w-full sm:w-48 font-mono text-[#c5a059]" placeholder="Ціна (напр. від 300 ₴)" value="${item.price || ''}" oninput="updatePriceItem(${catIdx}, ${itemIdx}, 'price', this.value)">
                            <button type="button" onclick="deletePriceItem(${catIdx}, ${itemIdx})" class="btn-danger text-xs p-2 h-10 w-full sm:w-auto flex items-center justify-center" title="Видалити">&times;</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

window.addPriceCategory = function() {
    if (!Array.isArray(priceListDB)) priceListDB = [];
    priceListDB.push({ title: 'Нова категорія', items: [] });
    window.renderPriceBuilder();
};

window.deletePriceCat = function(catIdx) {
    if (confirm('Видалити всю категорію разом із послугами?')) {
        priceListDB.splice(catIdx, 1);
        window.renderPriceBuilder();
    }
};

window.updatePriceCatTitle = function(catIdx, val) {
    if (priceListDB[catIdx]) {
        priceListDB[catIdx].title = val;
        priceListDB[catIdx].category = val;
    }
};

window.addPriceItem = function(catIdx) {
    if (!priceListDB[catIdx].items) priceListDB[catIdx].items = [];
    priceListDB[catIdx].items.push({ name: '', price: '' });
    window.renderPriceBuilder();
};

window.deletePriceItem = function(catIdx, itemIdx) {
    priceListDB[catIdx].items.splice(itemIdx, 1);
    window.renderPriceBuilder();
};

window.updatePriceItem = function(catIdx, itemIdx, field, val) {
    if (priceListDB[catIdx] && priceListDB[catIdx].items[itemIdx]) {
        priceListDB[catIdx].items[itemIdx][field] = val;
    }
};

window.saveVisualPriceList = async function() {
    // Синхронізуємо зі старим скриптом, якщо десь використовується textarea
    const priceEditor = document.getElementById('price-json-editor');
    if (priceEditor) priceEditor.value = JSON.stringify(priceListDB, null, 4);

    // Зберігаємо в Supabase у таблицю site_storage
    await saveToCloudStorage('bv_price_list', priceListDB);
    showNotification('Прайс-лист успішно збережено!');
};

// Залишаємо сумісність для виклику старої функції збереження якщо потрібно
window.savePriceList = function() {
    window.saveVisualPriceList();
};



// Безпечна ініціалізація подій прайс-листа
document.addEventListener('DOMContentLoaded', () => {
    const addCatBtn = document.getElementById('btnAddPriceCategory');
    if (addCatBtn) {
        addCatBtn.addEventListener('click', window.addPriceCategory);
    }

    const savePriceBtn = document.getElementById('btnSavePriceList');
    if (savePriceBtn) {
        savePriceBtn.addEventListener('click', window.saveVisualPriceList);
    }
});



// ==========================================
// УПРАВЛІННЯ НАЛАШТУВАННЯМИ ТА АДРЕСАМИ
// ==========================================

window.renderAddresses = function(addresses = []) {
    const container = document.getElementById('addressesContainer');
    if (!container) return;
    
    if (!Array.isArray(addresses)) addresses = [];

    if (addresses.length === 0) {
        container.innerHTML = '<div class="text-xs text-gray-500 italic">Адреси не додано</div>';
        return;
    }

    container.innerHTML = addresses.map((addr, idx) => `
        <div class="flex gap-2 items-center">
            <input type="text" class="input-field text-xs flex-1 address-input" placeholder="Адреса бутіка (напр. вул. Хрещатик, 1)" value="${addr || ''}">
            <button type="button" onclick="removeAddressField(${idx})" class="btn-danger text-xs p-2 h-10 w-10 flex items-center justify-center shrink-0" title="Видалити">&times;</button>
        </div>
    `).join('');
};

window.addAddressField = function() {
    const container = document.getElementById('addressesContainer');
    if (!container) return;
    
    const inputs = container.querySelectorAll('.address-input');
    const currentValues = Array.from(inputs).map(input => input.value);
    currentValues.push('');
    window.renderAddresses(currentValues);
};

window.removeAddressField = function(idx) {
    const container = document.getElementById('addressesContainer');
    if (!container) return;
    
    const inputs = container.querySelectorAll('.address-input');
    const currentValues = Array.from(inputs).map(input => input.value);
    currentValues.splice(idx, 1);
    window.renderAddresses(currentValues);
};

window.loadSiteSettings = function(settingsData) {
    if (!settingsData) return;
    
    if (document.getElementById('set-gold-rate')) document.getElementById('set-gold-rate').value = settingsData.goldRate || '';
    if (document.getElementById('set-phone')) document.getElementById('set-phone').value = settingsData.phone || '';
    if (document.getElementById('set-tg')) {
        document.getElementById('set-tg').value = settingsData.tg || settingsData.telegram || settingsData.tgLink || '';
    }
    if (document.getElementById('set-inst')) {
        document.getElementById('set-inst').value = settingsData.inst || settingsData.instagram || settingsData.instLink || '';
    }
    
    window.renderAddresses(settingsData.addresses || []);
};

window.saveSiteSettings = async function() {
    // Prefer admin.js implementation when on admin panel (it owns the real form state)
    if (document.body && document.body.classList.contains && window.location.pathname.includes('admin')) {
        /* admin.html uses classic admin.js handler */
    }

    const addressInputs = document.querySelectorAll('#addressesContainer input, .address-input');
    const addresses = Array.from(addressInputs).map(input => input.value.trim()).filter(Boolean);
    const tg = document.getElementById('set-tg') ? document.getElementById('set-tg').value.trim() : '';
    const inst = document.getElementById('set-inst') ? document.getElementById('set-inst').value.trim() : '';

    const settingsData = {
        goldRate: document.getElementById('set-gold-rate') ? document.getElementById('set-gold-rate').value : '',
        phone: document.getElementById('set-phone') ? document.getElementById('set-phone').value.trim() : '',
        tg,
        telegram: tg,
        tgLink: tg,
        inst,
        instagram: inst,
        instLink: inst,
        addresses: addresses
    };

    if (typeof saveToCloudStorage === 'function') {
        await saveToCloudStorage('bv_settings', settingsData);
    } else if (typeof window.syncLocalCatalog === 'function') {
        window.syncLocalCatalog('bv_settings', settingsData);
    }
    if (typeof showNotification === 'function') {
        showNotification('Налаштування успішно збережено!');
    }
};

// Безпечна прив'язка подій
document.addEventListener('DOMContentLoaded', () => {
    const addAddressBtn = document.getElementById('btnAddAddress');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', window.addAddressField);
    }

    const saveSettingsBtn = document.getElementById('btnSaveSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', window.saveSiteSettings);
    }
});



let currentEditingCatIdx = null;
let currentEditingItemIdx = null;

// Відкриття модального вікна (для додавання або редагування)
window.openServiceModal = function(catIdx, itemIdx = null) {
    currentEditingCatIdx = catIdx;
    currentEditingItemIdx = itemIdx;

    const modal = document.getElementById('serviceModal');
    const modalTitle = document.getElementById('modalTitle');
    const inputRu = document.getElementById('modalNameRu');
    const inputUa = document.getElementById('modalNameUa');
    const inputEn = document.getElementById('modalNameEn');
    const inputPrice = document.getElementById('modalPrice');

    if (!modal) return;

    if (itemIdx !== null) {
        // Редагування існуючої послуги
        modalTitle.textContent = 'Редагувати послугу';
        const item = priceListDB[catIdx].items[itemIdx];
        
        // Підтримка як старого формату (рядок), так і нового (об'єкт мов)
        if (typeof item.name === 'object' && item.name !== null) {
            inputRu.value = item.name.ru || '';
            inputUa.value = item.name.ua || '';
            inputEn.value = item.name.en || '';
        } else {
            inputUa.value = item.name || ''; // За замовчуванням ставимо в українську
            inputRu.value = '';
            inputEn.value = '';
        }
        inputPrice.value = item.price || '';
    } else {
        // Додавання нової послуги
        modalTitle.textContent = 'Додати нову послугу';
        inputRu.value = '';
        inputUa.value = '';
        inputEn.value = '';
        inputPrice.value = '';
    }

    modal.classList.remove('hidden');
};

window.closeServiceModal = function() {
    const modal = document.getElementById('serviceModal');
    if (modal) modal.classList.add('hidden');
};

// Збереження послуги з модального вікна
window.saveServiceFromModal = async function() {
    if (currentEditingCatIdx === null) return;

    const nameRu = document.getElementById('modalNameRu').value.trim();
    const nameUa = document.getElementById('modalNameUa').value.trim();
    const nameEn = document.getElementById('modalNameEn').value.trim();
    const price = document.getElementById('modalPrice').value.trim();

    if (!nameUa && !nameRu && !nameEn) {
        alert('Будь ласка, заповніть назву послуги хоча б однією мовою.');
        return;
    }

    const serviceData = {
        name: {
            ru: nameRu || nameUa,
            ua: nameUa || nameRu,
            en: nameEn || nameUa
        },
        price: price
    };

    if (!priceListDB[currentEditingCatIdx].items) {
        priceListDB[currentEditingCatIdx].items = [];
    }

    if (currentEditingItemIdx !== null) {
        priceListDB[currentEditingCatIdx].items[currentEditingItemIdx] = serviceData;
    } else {
        priceListDB[currentEditingCatIdx].items.push(serviceData);
    }

    window.closeServiceModal();
    window.renderPriceBuilder();
    
    // Автоматичне збереження в Supabase
    await saveToCloudStorage('bv_price_list', priceListDB);
    showNotification('Послугу успішно збережено!');
};

// Оновлений рендер карток у візуальному редакторі адмінки
window.renderPriceBuilder = function() {
    const container = document.getElementById('priceBuilderContainer');
    if (!container) return;
    
    if (!Array.isArray(priceListDB)) priceListDB = [];
    
    if (priceListDB.length === 0) {
        container.innerHTML = `
            <div class="glass-panel p-8 text-center text-gray-400 text-xs">
                Прайс-лист порожній. Натисніть «+ Додати категорію», щоб почати.
            </div>
        `;
        return;
    }

    container.innerHTML = priceListDB.map((cat, catIdx) => {
        const catTitle = cat.title || cat.category || 'Категорія';
        const items = cat.items || [];
        
        return `
            <div class="glass-panel p-4 lg:p-6 space-y-4 border border-white/10">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                    <div class="w-full sm:w-1/2">
                        <label class="text-[10px] uppercase font-bold text-[#c5a059] block mb-1">Назва категорії</label>
                        <input type="text" class="input-field text-xs font-semibold" value="${catTitle}" oninput="updatePriceCatTitle(${catIdx}, this.value)">
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto justify-end">
                        <button type="button" onclick="openServiceModal(${catIdx})" class="btn-secondary text-xs py-1.5 px-3">+ Послуга</button>
                        <button type="button" onclick="deletePriceCat(${catIdx})" class="btn-danger text-xs py-1.5 px-3">Видалити категорію</button>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <div class="text-[10px] uppercase font-bold text-gray-400">Послуги та ціни (3 мови)</div>
                    ${items.length === 0 ? '<div class="text-xs text-gray-500 italic py-2">У цій категорії поки немає послуг.</div>' : ''}
                    ${items.map((item, itemIdx) => {
                        const displayName = (typeof item.name === 'object') ? (item.name.ua || item.name.ru || item.name.en) : item.name;
                        return `
                            <div class="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5 gap-2">
                                <div class="flex-1">
                                    <div class="text-xs text-white font-medium">${displayName}</div>
                                    <div class="text-[10px] text-gray-400">UA: ${item.name?.ua || '—'} | RU: ${item.name?.ru || '—'} | EN: ${item.name?.en || '—'}</div>
                                </div>
                                <div class="text-xs font-mono text-[#c5a059] font-bold shrink-0">${item.price || ''}</div>
                                <div class="flex gap-1 shrink-0">
                                    <button type="button" onclick="openServiceModal(${catIdx}, ${itemIdx})" class="btn-secondary text-xs p-1.5 px-2.5">Редагувати</button>
                                    <button type="button" onclick="deletePriceItem(${catIdx}, ${itemIdx})" class="btn-danger text-xs p-1.5 px-2.5">&times;</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
};

// Прив'язка подій модального вікна при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeServiceModalBtn');
    const saveBtn = document.getElementById('saveServiceModalBtn');
    
    if (closeBtn) closeBtn.addEventListener('click', window.closeServiceModal);
    if (saveBtn) saveBtn.addEventListener('click', window.saveServiceFromModal);
});

// Classic-script global mirror
window.initMainBanners = initMainBanners;
window.loadBannersAdmin = loadBannersAdmin;
window.renderBannersAdmin = renderBannersAdmin;
window.renderHomeBanners = renderHomeBanners;
window.renderPriceBuilder = renderPriceBuilder;
window.priceListDB = priceListDB; // sync
