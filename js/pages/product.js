/**
 * Page script extracted from product.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

let currentGalleryIndex = 0;
let productGallery = [];
let currentProduct = null;
let currentLang = 'uk';
let allProductsCache = [];
let productRealtimeChannel = null;

// Безпечний форматтер ціни
const formatPrice = (val) => {
    if (typeof window.formatterPrice !== 'undefined' && window.formatterPrice.format) {
        return window.formatterPrice.format(val);
    }
    return Number(val).toLocaleString('uk-UA');
};

// --- БЕЗПЕЧНЕ ОТРИМАННЯ ТЕКСТУ (УНИКАЄ [object Object]) ---
function getSafeText(val, lang = 'uk') {
    if (!val) return '';
    if (typeof val === 'object') {
        return val[lang] || val['uk'] || val['ru'] || Object.values(val)[0] || '';
    }
    return String(val);
}

// --- СПОВІЩЕННЯ ПРО НЕВИБРАНИЙ РОЗМІР ---
function showSizeWarning() {
    let toast = document.getElementById('size-warning-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'size-warning-toast';
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[11px] uppercase tracking-widest font-bold py-3 px-6 shadow-2xl z-50 transition-all duration-300 opacity-0 pointer-events-none rounded-none border border-red-500/30';
        toast.innerText = currentLang === 'en' ? 'Please select a size' : 'Будь ласка, оберіть розмір товару';
        document.body.appendChild(toast);
    }
    
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
    
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
    }, 3000);

    const sizesContainer = document.getElementById('pd-sizes-container');
    if (sizesContainer) {
        sizesContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sizesContainer.classList.add('ring-2', 'ring-red-500', 'transition-all');
        setTimeout(() => {
            sizesContainer.classList.remove('ring-2', 'ring-red-500');
        }, 1500);
    }
}

// --- ФУНКЦІЯ ПЕРЕМИКАННЯ ВКЛАДОК ---
window.switchProductTab = function(tabName) {
    const specsTab = document.getElementById('tab-btn-specs');
    const descTab = document.getElementById('tab-btn-desc');
    const specsContent = document.getElementById('tab-content-specs');
    const descContent = document.getElementById('tab-content-desc');

    if (!specsTab || !descTab || !specsContent || !descContent) return;

    if (tabName === 'specs') {
        specsTab.classList.add('text-[var(--gold-muted)]', 'border-b-2', 'border-[var(--gold-muted)]');
        specsTab.classList.remove('text-[var(--text-muted)]');
        descTab.classList.remove('text-[var(--gold-muted)]', 'border-b-2', 'border-[var(--gold-muted)]');
        descTab.classList.add('text-[var(--text-muted)]');
        
        specsContent.classList.remove('hidden');
        descContent.classList.add('hidden');
    } else {
        descTab.classList.add('text-[var(--gold-muted)]', 'border-b-2', 'border-[var(--gold-muted)]');
        descTab.classList.remove('text-[var(--text-muted)]');
        specsTab.classList.remove('text-[var(--gold-muted)]', 'border-b-2', 'border-[var(--gold-muted)]');
        specsTab.classList.add('text-[var(--text-muted)]');
        
        descContent.classList.remove('hidden');
        specsContent.classList.add('hidden');
    }
};

// --- ЛОГІКА ЧИТАННЯ ДАНИХ ТА ВАРІАЦІЙ ---
function getVarData(prod, size, field, lang = null) {
    if (!prod) return '';
    const b = (prod.variations && prod.variations.base) ? prod.variations.base : prod;
    const v = (prod.variations && size && prod.variations[size]) ? prod.variations[size] : b;
    
    const getVal = (obj, f) => {
        if (!obj) return undefined;
        const map = {
            'name': ['name', 'title'],
            'desc': ['desc', 'description'],
            'workCost': ['workCost', 'work_cost'],
            'priceType': ['priceType', 'price_type'],
            'nameEN': ['nameEN', 'name_en'],
            'isWeekly': ['isWeekly', 'is_weekly'],
            'isSpecial': ['isSpecial', 'is_special'],
            'status': ['status', 'availability', 'state', 'in_stock', 'inStock', 'available', 'is_available'],
            'stock': ['stock', 'quantity', 'qty', 'count', 'amount'],
            'stones': ['stones', 'stone'],
            'blocks': ['blocks', 'block'],
            'images': ['images', 'image', 'img']
        };
        const keys = map[f] || [f];
        for (let k of keys) {
            if (obj[k] !== undefined && obj[k] !== '' && obj[k] !== null) return obj[k];
        }
        return undefined;
    };

    if (field === 'images') {
        let imgs = getVal(v, 'images') || getVal(b, 'images') || getVal(prod, 'images');
        if (typeof imgs === 'string') {
            try { imgs = JSON.parse(imgs); } catch(e) { imgs = [imgs]; }
        }
        if (Array.isArray(imgs) && imgs.length > 0) return imgs;
        const singleImg = v?.img || v?.image || b?.img || b?.image || prod?.img || prod?.image;
        return singleImg ? [singleImg] : [];
    }

    const valV = getVal(v, field);
    const valB = getVal(b, field);
    const valProd = getVal(prod, field);

    if (valV !== undefined && valV !== '' && valV !== null) return valV;
    if (valB !== undefined && valB !== '' && valB !== null) return valB;
    if (valProd !== undefined && valProd !== '' && valProd !== null) return valProd;

    if (lang) {
        if (valV && typeof valV === 'object' && valV[lang]) return valV[lang];
        if (valB && typeof valB === 'object' && valB[lang]) return valB[lang];
        if (valProd && typeof valProd === 'object' && valProd[lang]) return valProd[lang];
    }

    return '';
}

window.selectSize = function(btn, size) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    window.currentSelectedSize = size;
    window.updateProductUI();
};

window.updateProductUI = function() {
    if(!currentProduct) return;
    const size = window.currentSelectedSize || 'base';
    currentLang = typeof window.API !== 'undefined' ? window.API.get('bv_lang', 'uk') : 'uk';

    const rawName = getVarData(currentProduct, size, 'name', currentLang) || (window.getLoc ? window.getLoc(currentProduct, 'name') : currentProduct.name);
    const name = getSafeText(rawName, currentLang);

    const rawDesc = getVarData(currentProduct, size, 'desc', currentLang) || (window.getLoc ? window.getLoc(currentProduct, 'desc') : currentProduct.desc);
    const desc = getSafeText(rawDesc, currentLang);

    const price = getVarData(currentProduct, size, 'price');
    const discount = getVarData(currentProduct, size, 'discount');
    
    const weight = getVarData(currentProduct, size, 'weight');
    const stones = getVarData(currentProduct, size, 'stones');
    const workCost = getVarData(currentProduct, size, 'workCost');
    const blocks = getVarData(currentProduct, size, 'blocks');

    if(document.getElementById('pd-title')) document.getElementById('pd-title').innerText = name;
    if(document.getElementById('pd-title-mob')) document.getElementById('pd-title-mob').innerText = name;
    if(document.getElementById('pd-desc-full')) document.getElementById('pd-desc-full').innerText = desc || 'Опис відсутній';
    
    const weightRow = document.getElementById('pd-spec-weight-row');
    const weightSpecEl = document.getElementById('pd-spec-weight');
    
    if (weight && String(weight).trim() !== '') {
        if (weightSpecEl) weightSpecEl.innerText = `${weight} г`;
        if (weightRow) {
            weightRow.classList.remove('hidden');
            weightRow.style.display = 'flex';
        }
    } else {
        if (weightRow) {
            weightRow.classList.add('hidden');
            weightRow.style.display = 'none';
        }
    }

    if(stones && String(stones).trim() !== '') {
        if(document.getElementById('pd-spec-stones')) document.getElementById('pd-spec-stones').innerText = getSafeText(stones, currentLang);
        document.getElementById('pd-spec-stones-row')?.classList.remove('hidden');
    } else {
        document.getElementById('pd-spec-stones-row')?.classList.add('hidden');
    }

    if(workCost && String(workCost).trim() !== '') {
        const el = document.getElementById('pd-spec-workcost');
        if(el) el.innerText = getSafeText(workCost, currentLang);
        document.getElementById('pd-spec-workcost-row')?.classList.remove('hidden');
    } else {
        document.getElementById('pd-spec-workcost-row')?.classList.add('hidden');
    }

    if(blocks && String(blocks).trim() !== '') {
        const el = document.getElementById('pd-spec-blocks');
        if(el) el.innerText = getSafeText(blocks, currentLang);
        document.getElementById('pd-spec-blocks-row')?.classList.remove('hidden');
    } else {
        document.getElementById('pd-spec-blocks-row')?.classList.add('hidden');
    }

    const hasDiscount = discount && Number(discount) > 0;
    const currentPrice = hasDiscount ? discount : price;
    
    let priceHtmlDesktop = hasDiscount 
        ? `<span class="text-lg md:text-xl text-[var(--danger)] line-through mb-1 md:mb-0 md:mr-3">${formatPrice(price)} ₴</span>
           <span class="text-2xl md:text-3xl font-bold text-[var(--text-main)]">${formatPrice(discount)} ₴</span>`
        : `<span class="text-2xl md:text-3xl font-bold text-[var(--text-main)]">${formatPrice(price)} ₴</span>`;
    
    if(document.getElementById('pd-price-desktop')) document.getElementById('pd-price-desktop').innerHTML = priceHtmlDesktop;

    const hasSizes = currentProduct.sizes && currentProduct.sizes.length > 0;
    let sizeStr = hasSizes ? (window.currentSelectedSize || 'Оберіть розмір') : 'Універсальний';
    const weightStr = (weight && Number(weight) > 0) ? `${weight} г.` : '';
    
    let combinedStr = '';
    if (hasSizes && !window.currentSelectedSize) {
        combinedStr = 'Оберіть розмір';
    } else {
        combinedStr = weightStr ? `${sizeStr} • ${weightStr}` : sizeStr;
    }

    if(document.getElementById('pd-price-size-weight-val')) {
        document.getElementById('pd-price-size-weight-val').innerText = combinedStr;
    }
    if(document.getElementById('selected-size-label')) {
        document.getElementById('selected-size-label').innerText = combinedStr;
    }
    
    // --- ПЕРЕВІРКА СТАТУСУ ТА НАЯВНОСТІ ---
    let statuses = [];
    const rawStatus = getVarData(currentProduct, size, 'status');
    const stockCount = getVarData(currentProduct, size, 'stock');
    const inStockField = getVarData(currentProduct, size, 'inStock') ?? getVarData(currentProduct, size, 'in_stock') ?? getVarData(currentProduct, size, 'available');
    
    const statusString = getSafeText(rawStatus, currentLang);
    const statusLower = statusString.toLowerCase().trim();

    const isExplicitlyFalse = inStockField === false || inStockField === 'false';
    const isStockZero = stockCount !== undefined && stockCount !== '' && !isNaN(stockCount) && Number(stockCount) <= 0;
    const isStatusOut = 
        statusLower === 'out-stock' || 
        statusLower === 'out_stock' || 
        statusLower === 'нет в наличии' || 
        statusLower === 'немає в наявності' ||
        statusLower === 'false' ||
        statusLower === '0';

    const isOutOfStock = isExplicitlyFalse || isStockZero || isStatusOut;
    const isOnOrder = statusLower === 'order' || statusLower === 'pod-zakaz' || statusLower === 'під замовлення' || statusLower === 'под_заказ' || Boolean(getVarData(currentProduct, size, 'isOrder'));
    const isExclusive = Boolean(getVarData(currentProduct, size, 'isExclusive') || getVarData(currentProduct, size, 'exclusive') || statusLower === 'exclusive');
    const isWeekly = Boolean(getVarData(currentProduct, size, 'isWeekly'));
    const isSpecial = Boolean(getVarData(currentProduct, size, 'isSpecial'));

    if (isOutOfStock) {
        statuses.push(`<span class="text-[10px] uppercase tracking-widest font-bold text-red-500 border border-red-500/20 px-3 py-1 rounded">Нема в наявності</span>`);
    } else if (isOnOrder) {
        statuses.push(`<span class="text-[10px] uppercase tracking-widest font-bold text-amber-500 border border-amber-500/20 px-3 py-1 rounded">Під замовлення</span>`);
    } else {
        const stockText = (stockCount !== undefined && stockCount !== '' && !isNaN(stockCount)) ? `В наявності (${stockCount} шт.)` : `В наявності`;
        statuses.push(`<span class="text-[10px] uppercase tracking-widest font-bold text-green-500 border border-green-500/20 px-3 py-1 rounded">${stockText}</span>`);
    }

    if (isExclusive) {
        statuses.push(`<span class="text-[10px] uppercase tracking-widest font-bold text-[var(--gold-muted)] border border-[var(--gold-muted)]/20 px-3 py-1 rounded">Ексклюзив</span>`);
    }

    if (isWeekly) {
        statuses.push(`<span class="text-[10px] uppercase tracking-widest font-bold text-blue-400 border border-blue-400/20 px-3 py-1 rounded">Товар тижня</span>`);
    }

    if (isSpecial) {
        statuses.push(`<span class="text-[10px] uppercase tracking-widest font-bold text-purple-400 border border-purple-400/20 px-3 py-1 rounded">Спеціальна пропозиція</span>`);
    }

    if (hasDiscount) {
        statuses.push(`<span class="text-[10px] uppercase tracking-widest font-bold text-[var(--success)] border border-[var(--success)]/20 px-3 py-1 rounded">Знижка</span>`);
    }

    const statusHtml = `<div class="flex flex-wrap gap-2 items-center">${statuses.join('')}</div>`;
    
    const pdStatusEl = document.getElementById('pd-status');
    if (pdStatusEl) pdStatusEl.innerHTML = statusHtml;

    const pdStatusMobEl = document.getElementById('pd-status-mob');
    if (pdStatusMobEl) pdStatusMobEl.innerHTML = statusHtml;

    // --- ФУНКЦІЯ НАЛАШТУВАННЯ КНОПКИ КУПІВЛІ/ЗАМОВЛЕННЯ ---
    const setupAddBtn = (id) => {
        const btn = document.getElementById(id);
        if(!btn) return;
        
        const langDict = window.i18n?.[currentLang] || window.i18n?.['uk'] || {};
        const buyText = langDict.btn_buy || (currentLang === 'en' ? 'Buy' : 'Купити');
        const buyPrefix = langDict.btn_buy_prefix || (currentLang === 'en' ? 'for' : 'за');
        const orderText = langDict.btn_order || (currentLang === 'en' ? 'Pre-order' : 'Замовити');
        const soldOutText = langDict.badge_sold_out || (currentLang === 'en' ? 'Sold out' : 'Нема в наявності');
        
        if(isOutOfStock) {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
            btn.innerHTML = `<span class="uppercase font-bold tracking-widest text-[11px]">${soldOutText}</span>`;
        } else if(isOnOrder) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
            btn.innerHTML = `<span class="uppercase font-bold tracking-widest text-[11px]">${orderText} ${buyPrefix} ${formatPrice(currentPrice)}</span>`;
            
            btn.onclick = () => {
                const needsSize = !document.getElementById('pd-sizes-container')?.classList.contains('hidden');
                if (needsSize && !window.currentSelectedSize) {
                    showSizeWarning();
                    return;
                }
                const finalName = window.currentSelectedSize ? `${name} (Під замовлення, Розмір: ${window.currentSelectedSize})` : `${name} (Під замовлення)`;
                window.addToCart(currentProduct.id, finalName, currentProduct.variant, currentPrice, productGallery?.[0] || '');
            };
        } else {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');

            btn.innerHTML = `<span class="uppercase font-bold tracking-widest text-[11px]">${buyText} ${buyPrefix} ${formatPrice(currentPrice)}</span>`;
            
            btn.onclick = () => {
                const needsSize = !document.getElementById('pd-sizes-container')?.classList.contains('hidden');
                if (needsSize && !window.currentSelectedSize) {
                    showSizeWarning();
                    return;
                }
                const finalName = window.currentSelectedSize ? `${name} (Розмір: ${window.currentSelectedSize})` : name;
                window.addToCart(currentProduct.id, finalName, currentProduct.variant, currentPrice, productGallery?.[0] || '');
            };
        }
    };
    
    setupAddBtn('pd-add-btn-desktop');
    setupAddBtn('pd-add-btn-mob');

    let newGallery = getVarData(currentProduct, size, 'images');
    if (!Array.isArray(newGallery)) {
        newGallery = newGallery ? [newGallery] : [];
    }
    if(JSON.stringify(newGallery) !== JSON.stringify(productGallery)) {
        productGallery = newGallery;
        rebuildGallery();
    }
};

function rebuildGallery() {
    const track = document.getElementById('pd-gallery-track');
    const dots = document.getElementById('pd-gallery-dots');
    const thumbsContainer = document.getElementById('pd-gallery-thumbnails');
    currentGalleryIndex = 0;
    
    const imagesToRender = productGallery.length > 0 ? productGallery : ['https://via.placeholder.com/600x800?text=Немає+зображення'];

    if(track) {
        track.innerHTML = imagesToRender.map((img, i) => `
            <div class="w-full h-full flex-shrink-0 relative cursor-zoom-in" onclick="openLightbox(${i})">
                <img src="${img}" class="w-full h-full object-cover">
            </div>
        `).join('');
        track.style.transform = `translateX(0%)`;
    }

    if(thumbsContainer) {
        if (imagesToRender.length > 1) {
            thumbsContainer.innerHTML = imagesToRender.map((img, i) => `
                <button onclick="goToGallery(${i})" class="thumb-btn btn-cross w-16 aspect-[4/5] rounded-none border border-[var(--border)] overflow-hidden shrink-0 ${i === 0 ? 'active' : ''}">
                    <img src="${img}" class="w-full h-full object-cover pointer-events-none">
                </button>
            `).join('');
            thumbsContainer.classList.remove('!hidden');
        } else {
            thumbsContainer.innerHTML = '';
            thumbsContainer.classList.add('!hidden'); 
        }
    }

    if(dots) {
        if (imagesToRender.length > 1) {
            dots.innerHTML = imagesToRender.map((_, i) => `
                <button class="btn-cross w-1.5 h-1.5 rounded-none transition-all duration-300 ${i === 0 ? 'bg-white scale-125' : 'bg-white/50'}" onclick="goToGallery(${i})"></button>
            `).join('');
        } else {
            dots.innerHTML = '';
        }
    }
}

window.scrollGallery = function(dir) {
    if (!productGallery || productGallery.length <= 1) return;
    let newIndex = currentGalleryIndex + dir;
    if (newIndex >= productGallery.length) newIndex = 0;
    if (newIndex < 0) newIndex = productGallery.length - 1;
    window.goToGallery(newIndex);
};

window.goToGallery = function(index) {
    currentGalleryIndex = index;
    const track = document.getElementById('pd-gallery-track');
    if(track) track.style.transform = `translateX(-${index * 100}%)`;
    
    document.querySelectorAll('#pd-gallery-dots button').forEach((dot, i) => {
        if(i === index) { dot.classList.remove('bg-white/50'); dot.classList.add('bg-white', 'scale-125'); } 
        else { dot.classList.remove('bg-white', 'scale-125'); dot.classList.add('bg-white/50'); }
    });
    
    document.querySelectorAll('.thumb-btn').forEach((thumb, i) => {
        if(i === index) thumb.classList.add('active'); else thumb.classList.remove('active');
    });
};

window.openLightbox = function(index) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    if(!modal || !img || !productGallery[index]) return;
    img.src = productGallery[index];
    modal.classList.remove('hidden'); modal.classList.add('flex');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
    const modal = document.getElementById('lightboxModal');
    if(!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => { modal.classList.remove('flex'); modal.classList.add('hidden'); }, 300);
    document.body.style.overflow = '';
};

function subscribeToProductUpdates(productId) {
    if (typeof window._supabase === 'undefined') return;
    
    if (productRealtimeChannel) {
        window._supabase.removeChannel(productRealtimeChannel);
    }

    productRealtimeChannel = window._supabase
        .channel(`product-live-${productId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'products',
                filter: `id=eq.${productId}`
            },
            (payload) => {
                console.log('Дані оновлено в БД:', payload.new);
                currentProduct = { ...currentProduct, ...payload.new };
                window.updateProductUI();
            }
        )
        .subscribe();
}

window.renderProductPage = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const categories = typeof window.API !== 'undefined' ? (window.API.get('bv_categories_tree', []) || window.API.get('bv_categories_flat', [])) : [];

    try {
        if (typeof window._supabase !== 'undefined' && productId) {
            const { data: productData, error } = await window._supabase
                .from('products') 
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            if (productData) currentProduct = productData;

            const { data: allData } = await window._supabase.from('products').select('*');
            if (allData) allProductsCache = allData;
        }
    } catch (err) {
        console.warn("Помилка завантаження з бази:", err);
    }

    if (!currentProduct) {
        const localProducts = typeof window.API !== 'undefined' ? window.API.get('bv_products', []) : [];
        allProductsCache = localProducts;
        currentProduct = productId ? localProducts.find(p => p.id === productId) : localProducts[0];
    }

    if (!currentProduct) {
        if(document.getElementById('pd-title')) document.getElementById('pd-title').innerText = 'Товар не знайдено';
        if(document.getElementById('pd-title-mob')) document.getElementById('pd-title-mob').innerText = 'Товар не знайдено';
        return;
    }

    let initGallery = getVarData(currentProduct, 'base', 'images');
    productGallery = Array.isArray(initGallery) ? initGallery : (initGallery ? [initGallery] : []);
    
    let touchStartX = 0; let touchEndX = 0;
    let touchStartY = 0; let touchEndY = 0;
    
    const galleryContainer = document.getElementById('pd-gallery-container');
    if (galleryContainer && !galleryContainer.dataset.touchAttached) {
        galleryContainer.addEventListener('touchstart', e => { 
            touchStartX = e.changedTouches[0].screenX; 
            touchStartY = e.changedTouches[0].screenY;
        }, {passive: true});
        
        galleryContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            
            const deltaX = Math.abs(touchStartX - touchEndX);
            const deltaY = Math.abs(touchStartY - touchEndY);

            if (productGallery.length > 1 && deltaX > 40 && deltaX > deltaY) {
                if (touchStartX > touchEndX) window.scrollGallery(1); 
                else window.scrollGallery(-1);
            }
        }, {passive: true});
        galleryContainer.dataset.touchAttached = 'true';
    }

    ['pd-sku', 'pd-spec-sku', 'pd-sku-mob'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).innerText = currentProduct.sku || currentProduct.id;
    });
    if(document.getElementById('pd-spec-metal')) document.getElementById('pd-spec-metal').innerText = getSafeText(currentProduct.variant, currentLang) || 'Не вказано';
    
    const catObj = categories.find(c => c.id === currentProduct.category) || {};
    const catName = window.getLoc ? window.getLoc(catObj.name) || currentProduct.category : currentProduct.category;
    if(document.getElementById('pd-category-name')) document.getElementById('pd-category-name').innerText = getSafeText(catName, currentLang);
    if(document.getElementById('pd-category-link')) document.getElementById('pd-category-link').href = `catalog.html#${currentProduct.category}`;
    if(document.getElementById('pd-category-name-mob')) document.getElementById('pd-category-name-mob').innerText = getSafeText(catName, currentLang);
    if(document.getElementById('pd-category-link-mob')) document.getElementById('pd-category-link-mob').href = `catalog.html#${currentProduct.category}`;

    const sizesContainer = document.getElementById('pd-sizes-container');
    const sizesList = document.getElementById('pd-sizes-list');
    if (currentProduct.sizes && currentProduct.sizes.length > 0) {
        if(sizesList) {
            sizesList.innerHTML = currentProduct.sizes.map(s => `
                <button class="size-btn btn-cross border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--gold-muted)] py-2 px-4 text-[11px] font-medium transition-colors rounded-none" onclick="selectSize(this, '${s}')">${s}</button>
            `).join('');
        }
        sizesContainer?.classList.remove('hidden');
        window.currentSelectedSize = null;
    } else {
        sizesContainer?.classList.add('hidden');
        window.currentSelectedSize = null;
    }

    const favs = typeof window.API !== 'undefined' && typeof window.API.get === 'function' ? window.API.get('bv_favs', []) : JSON.parse(localStorage.getItem('bv_favs') || '[]');
    const setupFavBtn = (id) => {
        const btn = document.getElementById(id);
        if(!btn) return;
        if(favs.includes(currentProduct.id)) {
            btn.classList.add('text-[var(--danger)]', 'border-[var(--danger)]');
            btn.querySelector('svg')?.setAttribute('fill', 'currentColor');
        }
        btn.onclick = (e) => {
            e.preventDefault();
            let isLoggedIn = false;
            const nameEl = document.getElementById('profName');
            if (nameEl && nameEl.innerText.trim().length > 0 && nameEl.innerText !== 'User') isLoggedIn = true;
            if (!isLoggedIn && localStorage.getItem('bv_current_user')) isLoggedIn = true;

            if (!isLoggedIn) {
                if(typeof window.smartProfileClick === 'function') window.smartProfileClick();
                return;
            }

            if(typeof window.toggleFav === 'function') window.toggleFav(currentProduct.id);
            const isFav = btn.classList.contains('text-[var(--danger)]');
            if(isFav) {
                btn.classList.remove('text-[var(--danger)]', 'border-[var(--danger)]');
                btn.querySelector('svg')?.setAttribute('fill', 'none');
            } else {
                btn.classList.add('text-[var(--danger)]', 'border-[var(--danger)]');
                btn.querySelector('svg')?.setAttribute('fill', 'currentColor');
            }
        };
    };
    setupFavBtn('pd-fav-btn-desktop-img');
    setupFavBtn('pd-fav-btn-mob');

    if (typeof window.renderProductCard === 'function') {
        let similarProducts = allProductsCache.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).sort(() => 0.5 - Math.random()).slice(0, 5);
        if (similarProducts.length > 0 && document.getElementById('similarGrid')) {
            document.getElementById('similarGrid').innerHTML = similarProducts.map(p => window.renderProductCard(p)).join('');
            document.getElementById('similarSection')?.classList.remove('hidden');
        }
        let boughtTogether = allProductsCache.filter(p => p.category !== currentProduct.category && p.id !== currentProduct.id).sort(() => 0.5 - Math.random()).slice(0, 5);
        if (boughtTogether.length > 0 && document.getElementById('boughtTogetherGrid')) {
            document.getElementById('boughtTogetherGrid').innerHTML = boughtTogether.map(p => window.renderProductCard(p)).join('');
            document.getElementById('boughtTogetherSection')?.classList.remove('hidden');
        }
    }

    rebuildGallery();
    window.updateProductUI();

    if (productId) {
        subscribeToProductUpdates(productId);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if(typeof window.renderProductPage === 'function') {
        window.renderProductPage(); 
    }
});
