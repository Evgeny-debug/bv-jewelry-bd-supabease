/**
 * Page script extracted from services.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

let priceListDB = [];

    // Резервні дані на випадок відсутності інтернет-зв'язку
    const fallbackPriceList = [
        {
            category: "Ремонт ланцюгів та браслетів",
            items: [
                { name: { ua: "Запаяти одне місце зламу ланцюга", ru: "Запаять одно место излома цепи", en: "Solder one break point of the chain" }, gold: "Від 600", silver: "Від 400" },
                { name: { ua: "Перебирання замку «Карабін» (замiна пружини)", ru: "Переборка замка «Карабин» (замена пружины)", en: "Overhaul of 'Carabiner' lock (spring replacement)" }, gold: "Від 300", silver: "Від 300" }
            ]
        }
    ];

    // Універсальна функція для витягування тексту з урахуванням мови
    function getLocalizedText(field, lang) {
        if (!field) return '';
        if (typeof field === 'string') return field;
        
        // Підтримка різних форматів ключів мови (ua/uk)
        if (lang === 'ua' || lang === 'uk') return field.ua || field.uk || field.ru || field.en || '';
        if (lang === 'ru') return field.ru || field.ua || field.uk || field.en || '';
        if (lang === 'en') return field.en || field.ua || field.uk || field.ru || '';
        
        return field.ua || field.uk || field.ru || field.en || Object.values(field)[0] || '';
    }

    // Отримання актуального прайс-листа з Supabase (таблиця site_storage)
    async function fetchPriceListFromSupabase() {
        try {
            const { data, error } = await window._supabase
                .from('site_storage') 
                .select('value')
                .eq('key', 'bv_price_list')
                .single();

            if (error) throw error;
            
            if (data && data.value) {
                return Array.isArray(data.value) ? data.value : [data.value];
            }
            return null;
        } catch (err) {
            console.error('Виняток при завантаженні прайсу:', err);
            return null;
        }
    }

    // Рендеринг прайс-листа на сторінці
    function renderPriceList(searchQuery = '') {
        const container = document.getElementById('priceListContainer');
        if (!container) return;
        
        const q = searchQuery.toLowerCase().trim();
        let html = '';
        
        // Визначаємо поточну мову
        let lang = 'ua';
        if (typeof currentLang !== 'undefined') {
            lang = currentLang;
        } else if (localStorage.getItem('bv_lang')) {
            lang = localStorage.getItem('bv_lang');
        } else if (localStorage.getItem('app_lang')) {
            lang = localStorage.getItem('app_lang');
        }
        lang = lang.replace('uk', 'ua'); // Нормалізуємо для json-даних

        const listToRender = (window.priceListDB && window.priceListDB.length > 0) ? window.priceListDB : fallbackPriceList;

        listToRender.forEach(cat => {
            const catTitle = getLocalizedText(cat.title || cat.category || cat.name, lang) || 'Послуги';
            const items = cat.items || cat.services || [];

            const filteredItems = items.filter(item => {
                const itemName = getLocalizedText(item.name || item.title, lang).toLowerCase();
                return itemName.includes(q);
            });
            
            if (filteredItems.length > 0) {
                html += `
                <div class="mb-8">
                    <h2 class="text-xl md:text-2xl font-serif text-[var(--gold-muted)] mb-6 border-b border-white/10 pb-4 inline-block">${catTitle}</h2>
                    <div class="flex flex-col border-t border-[var(--border)]">
                        <div class="hidden md:flex justify-between items-center py-3 border-b border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-4">
                            <span class="w-3/5 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Послуга</span>
                            <span class="w-2/5 text-right text-[10px] uppercase tracking-widest text-[#e8b923] font-bold">Вартість</span>
                        </div>
                `;

                filteredItems.forEach(item => {
                    const displayName = getLocalizedText(item.name || item.title, lang) || 'Послуга';
                    const displayDesc = getLocalizedText(item.desc || item.description, lang);
                    
                    // Підтримка різних форматів ціни (старі поля або нові з адмінки: price_gold / price_silver)
                    const priceVal = item.price || item.gold || item.price_gold || '';
                    const silverVal = item.silver || item.price_silver || '';

                    html += `
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center py-4 md:py-5 border-b border-[var(--border)] px-2 md:px-4 hover:bg-[rgba(255,255,255,0.01)] transition-colors group">
                            <div class="w-full md:w-3/5 pr-4 mb-3 md:mb-0">
                                <span class="font-medium text-[var(--text-main)] text-sm md:text-base leading-snug block">${displayName}</span>
                                ${displayDesc ? `<span class="text-xs text-[var(--text-muted)] mt-1 block opacity-70">${displayDesc}</span>` : ''}
                            </div>
                            
                            <div class="w-full md:w-2/5 flex flex-wrap justify-start md:justify-end gap-4 md:gap-6 text-left md:text-right items-center mt-2 md:mt-0">
                                ${priceVal ? `
                                    <span class="text-[var(--text-main)] font-semibold flex items-center gap-2">
                                        ${silverVal ? `<span class="text-[10px] uppercase tracking-widest text-[#e8b923]">Золото:</span>` : `<span class="md:hidden text-[10px] uppercase tracking-widest text-[#e8b923]">Ціна:</span>`}
                                        ${priceVal} ${!isNaN(parseFloat(priceVal)) ? '<span class="text-[10px] text-[var(--text-muted)] ml-1">₴</span>' : ''}
                                    </span>
                                ` : ''}
                                
                                ${silverVal ? `
                                    <span class="text-[var(--text-main)] font-semibold flex items-center gap-2">
                                        <span class="text-[10px] uppercase tracking-widest text-[#c0c0c0]">Срібло:</span>
                                        ${silverVal} ${!isNaN(parseFloat(silverVal)) ? '<span class="text-[10px] text-[var(--text-muted)] ml-1">₴</span>' : ''}
                                    </span>
                                ` : ''}
                                
                                ${!priceVal && !silverVal ? `
                                    <span class="text-[var(--text-muted)] text-sm italic">За домовленістю</span>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });

                html += `</div></div>`;
            }
        });

        if (html === '') {
            html = `<div class="text-center py-20 text-[var(--text-muted)] text-lg italic">На жаль, послуг за запитом "${searchQuery}" не знайдено.</div>`;
        }

        container.innerHTML = html;
    }

    // Ініціалізація при завантаженні сторінки
    document.addEventListener('DOMContentLoaded', async () => {
        sessionStorage.setItem('on_price_page', 'true');
        
        const remoteData = await fetchPriceListFromSupabase();
        if (remoteData && Array.isArray(remoteData) && remoteData.length > 0) {
            window.priceListDB = remoteData;
        } else {
            console.warn("Дані з Supabase пусті або формат масиву невірний. Використовуємо fallback.");
            window.priceListDB = fallbackPriceList;
        }

        renderPriceList();

        const searchInput = document.getElementById('priceSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderPriceList(e.target.value);
            });
        }
    });
