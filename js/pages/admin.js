/**
 * Admin panel script extracted from admin.html (Phase 5).
 * Loaded as a classic (non-module) script so inline onclick
 * handlers and window.* assignments continue to work.
 */
// ==========================================
        // 0. ІНІЦІАЛІЗАЦІЯ БАЗИ ТА СТАНУ
        // ==========================================
        const supabaseUrl = 'https://trcjsnvcdonlzxprgdzd.supabase.co'; 
        const supabaseKey = 'sb_publishable_qSUZxk_9JV9wJNrdjAqeLA_8O_8-TVV'; 
        const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

        let categories = []; 
        let products = [];
        let homeBlocks = []; 
        let siteSettings = {};
        let pagesContentDB = {};
        let priceListDB = [];
        let exclusiveProcess = [];
        let exclusiveMaterials = [];
        let ordersList = [];
        let currentAddresses = []; 
        let banners = []; 
        let galleryItems = []; 
        
        let actProd = null; 
        let editLang = 'uk';
        let editVar = 'base';
        let currentPage = 1;
        const itemsPerPage = 15;
        let filteredProducts = [];

        function showNotification(msg) {
            const toast = document.getElementById('toastMessage');
            toast.innerText = msg; 
            toast.classList.add('show');
            setTimeout(() => { toast.classList.remove('show'); }, 3000);
        }

        async function checkAdminAccess() {
            const { data: { session } } = await _supabase.auth.getSession();
            if (!session) { window.location.href = 'index.html'; return; }
            const { data: profile } = await _supabase.from('profiles').select('role').eq('id', session.user.id).single();
            if (profile && profile.role === 'admin') { 
                document.body.style.opacity = '1'; 
                loadAllData(); 
            } else { 
                alert('У вас немає доступу до панелі адміністратора!');
                window.location.href = 'index.html'; 
            }
        }
        
        checkAdminAccess();

        /** Flat → nested tree (same algorithm as storefront buildTree) */
        function buildCategoriesTree(flatList) {
            const list = Array.isArray(flatList) ? flatList : [];
            const lookup = {};
            const tree = [];
            list.forEach((c) => {
                if (!c || !c.id) return;
                lookup[c.id] = { ...c, subcategories: [] };
            });
            list.forEach((c) => {
                if (!c || !c.id || !lookup[c.id]) return;
                if (c.parentId && lookup[c.parentId]) {
                    lookup[c.parentId].subcategories.push(lookup[c.id]);
                } else {
                    tree.push(lookup[c.id]);
                }
            });
            return tree;
        }

        let _adminSyncBc = null;
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                _adminSyncBc = new BroadcastChannel('bv-data-sync');
            }
        } catch (_) { /* ignore */ }

        function syncLocalCatalog(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('localStorage sync failed', e);
            }
            if (key === 'bv_categories_flat') {
                const tree = buildCategoriesTree(value || []);
                try {
                    localStorage.setItem('bv_categories_tree', JSON.stringify(tree));
                    localStorage.setItem('bv_storage_categories_tree', JSON.stringify(tree));
                    localStorage.setItem('bv_storage_categories_flat', JSON.stringify(value || []));
                } catch (_) { /* ignore */ }
            }
            if (key === 'bv_categories_tree') {
                try { localStorage.setItem('bv_storage_categories_tree', JSON.stringify(value || [])); } catch (_) {}
            }
            if (key === 'bv_gallery') {
                try {
                    localStorage.setItem('bv_storage_gallery', JSON.stringify(value || []));
                    localStorage.setItem('bv_gallery_cache', JSON.stringify(value || []));
                } catch (_) {}
            }
            const detail = { key, source: 'admin', ts: Date.now() };
            try { _adminSyncBc?.postMessage(detail); } catch (_) {}
            try { localStorage.setItem('bv_sync_ping', String(detail.ts)); } catch (_) {}
        }

        async function saveToCloudStorage(key, value) {
            const { error } = await _supabase.from('site_storage').upsert([{ key: key, value: value }]);
            if (error) throw error;
            syncLocalCatalog(key, value);
            // When categories change, always publish the nested tree for the storefront
            if (key === 'bv_categories_flat') {
                const tree = buildCategoriesTree(value || []);
                const { error: treeErr } = await _supabase
                    .from('site_storage')
                    .upsert([{ key: 'bv_categories_tree', value: tree }]);
                if (treeErr) throw treeErr;
                syncLocalCatalog('bv_categories_tree', tree);
            }
        }

        function syncProductsToStorefront() {
            syncLocalCatalog('bv_products', products);
        }

        // ==========================================
        // ЗАВАНТАЖЕННЯ В SUPABASE STORAGE
        // ==========================================
        async function uploadToStorage(file, bucketName = 'site-images', folder = 'products') {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
                const filePath = `${folder}/${fileName}`;

                const { data, error } = await _supabase.storage
                    .from(bucketName)
                    .upload(filePath, file, { cacheControl: '3600', upsert: false });

                if (error) throw error;

                const { data: { publicUrl } } = _supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath);

                return publicUrl;
                
            } catch (err) {
                console.error('Помилка завантаження:', err);
                showNotification('Помилка завантаження файлу!');
                return null;
            }
        }

        window.handleImageUpload = async function(event, previewId, hiddenInputId) {
            const file = event.target.files[0];
            if (!file) return;
            showNotification('Завантаження фото...');
            const url = await uploadToStorage(file, 'site-images', 'general');
            if (url) {
                const preview = document.getElementById(previewId);
                if (preview) { preview.src = url; preview.classList.remove('hidden'); }
                const hiddenInput = document.getElementById(hiddenInputId);
                if (hiddenInput) { hiddenInput.value = url; }
                showNotification('Фото успішно завантажено!');
            }
        };

        // ==========================================
        // ЗАВАНТАЖЕННЯ ДАНИХ
        // ==========================================
        async function loadAllData() {
    const { data: ords } = await _supabase.from('orders').select('*').order('created_at', { ascending: false });
    if(ords) ordersList = ords;
    renderOrders(ordersList);

    const { data: prods } = await _supabase.from('products').select('*');
    if(prods) { products = prods.map(migrateProductToNewFormat); }
    filteredProducts = [...products];
    
    const { data: storage } = await _supabase.from('site_storage').select('*');
    if(storage) {
        storage.forEach(item => {
            if (item.key === 'bv_categories_flat') categories = item.value; 
            if (item.key === 'bv_settings') siteSettings = item.value;
            if (item.key === 'bv_home_blocks') homeBlocks = item.value;
            if (item.key === 'bv_pages_content') pagesContentDB = item.value;
            if (item.key === 'bv_price_list') priceListDB = item.value;
            if (item.key === 'bv_exclusive_process') exclusiveProcess = item.value || [];
            if (item.key === 'bv_exclusive_materials') exclusiveMaterials = item.value || [];
            if (item.key === 'bv_banners') banners = item.value || []; 
            // Строку с bv_gallery отсюда удалили
        });
    }

    if(categories.length === 0) {
        const oldTree = storage?.find(i => i.key === 'bv_categories_tree')?.value || [];
        categories = flattenOldTree(oldTree);
        await saveToCloudStorage('bv_categories_flat', categories);
    }

    // НОВОЕ: Загружаем галерею напрямую из таблицы gallery
    const { data: galData } = await _supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (galData) {
        galleryItems = galData.map(item => ({
            id: item.id,
            img: item.image_url,
            category: item.category,
            desc: { uk: item.desc_uk, ru: item.desc_ru, en: item.desc_en }
        }));
    } else {
        galleryItems = [];
    }

    renderProducts();
    renderCategoriesAdmin();
    renderBlocksAdmin();
    renderBannersAdmin();
    renderExclusiveProcessAdmin();
    renderExclusiveMaterialsAdmin();
    populateSettings();
    renderGalleryAdmin();
    renderPriceBuilder();
    
    const priceEditor = document.getElementById('price-json-editor');
    if(priceEditor) priceEditor.value = JSON.stringify(priceListDB, null, 4);

    // Keep storefront localStorage aligned after admin boot
    syncProductsToStorefront();
    if (categories && categories.length) {
        syncLocalCatalog('bv_categories_flat', categories);
    }
    if (siteSettings && Object.keys(siteSettings).length) {
        syncLocalCatalog('bv_settings', siteSettings);
    }
}

        // ==========================================
        // НАВІГАЦІЯ ТА ВКЛАДКИ
        // ==========================================
        window.toggleAdminMenu = function() {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebarOverlay').classList.toggle('active');
        };

        window.switchTab = function(tabName) {
            document.querySelectorAll('.tab-btn').forEach(btn => { 
                btn.classList.remove('bg-white/5', 'text-[#c5a059]'); 
                btn.classList.add('text-gray-400'); 
            });
            document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
            
            const activeBtn = document.getElementById('tab-' + tabName);
            if(activeBtn) {
                activeBtn.classList.add('bg-white/5', 'text-[#c5a059]');
                activeBtn.classList.remove('text-gray-400');
            }
            
            const targetContent = document.getElementById('content-' + tabName);
            if(targetContent) targetContent.classList.remove('hidden');
            
            if(tabName === 'builder') loadPageBuilderForm();
            if(window.innerWidth < 1024) toggleAdminMenu();
        };

        // ==========================================
        // ЗАМОВЛЕННЯ
        // ==========================================
        window.renderOrders = function(list = ordersList) {
            const tbody = document.getElementById('ordersTableBody');
            if (!tbody) return;
            if (!list || list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">Замовлень поки немає.</td></tr>';
                return;
            }
            tbody.innerHTML = list.map(o => {
                const date = new Date(o.created_at || Date.now()).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                const isExclusive = o.is_exclusive || o.type === 'exclusive' || o.custom_photo;
                const badgeHtml = isExclusive ? `<span class="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded">💎 Ексклюзив</span>` : '';
                const itemsStr = isExclusive ? 'Інструкція / Індивідуальне виготовлення' : (Array.isArray(o.items) ? o.items.map(i => `${i.name || 'Товар'} (x${i.qty || 1}) - ${i.price}₴`).join('<br>') : (o.items || '—'));
                
                return `
                    <tr class="hover:bg-white/5 transition-colors cursor-pointer" onclick="openOrderModal('${o.id}')">
                        <td class="p-3 font-mono text-xs" data-label="ID / Дата">
                            <span class="text-[#c5a059] font-bold block">#${o.id || 'N/A'}</span>
                            <span class="text-[10px] text-gray-400">${date}</span>
                            ${badgeHtml}
                        </td>
                        <td class="p-3 text-xs td-column" data-label="Клієнт">
                            <div class="font-semibold text-white">${o.client_name || o.name || 'Анонім'}</div>
                            <div class="text-gray-400 text-[11px]">${o.phone || ''}</div>
                        </td>
                        <td class="p-3 text-xs td-column" data-label="Товари">
                            <div class="text-gray-300 text-[11px] leading-relaxed line-clamp-2">${itemsStr}</div>
                        </td>
                        <td class="p-3 font-bold text-[#c5a059] text-xs" data-label="Сума">${o.total_price || o.total || 0} ₴</td>
                        <td class="p-3 text-right" data-label="Статус" onclick="event.stopPropagation();">
                            <select onchange="updateOrderStatus('${o.id}', this.value)" class="input-field text-xs py-1 px-2 w-auto bg-[#1a1a1a] border-white/10 font-semibold ${getStatusColor(o.status)}">
                                <option value="new" ${o.status === 'new' ? 'selected' : ''}>Нове</option>
                                <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>В обробці</option>
                                <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Виконано</option>
                                <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Скасовано</option>
                            </select>
                        </td>
                    </tr>
                `;
            }).join('');
        };

        window.openOrderModal = function(id) {
            const order = ordersList.find(o => String(o.id) === String(id));
            if (!order) return;

            const date = new Date(order.created_at || Date.now()).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const isExclusive = order.is_exclusive || order.type === 'exclusive' || order.custom_photo;
            
            let preferencesHtml = '';
            if (order.preferences && Array.isArray(order.preferences)) {
                preferencesHtml = `
                    <div class="mt-3">
                        <span class="text-gray-400 block mb-1 font-semibold uppercase text-[10px]">Обрані матеріали та опції:</span>
                        <div class="flex flex-wrap gap-1.5">
                            ${order.preferences.map(pref => `<span class="px-2 py-1 bg-white/10 border border-white/10 rounded text-[#c5a059] font-medium">${pref}</span>`).join('')}
                        </div>
                    </div>
                `;
            } else if (order.preferences && typeof order.preferences === 'string') {
                preferencesHtml = `<div class="mt-2 text-gray-300"><span class="text-gray-400 font-semibold">Опції:</span> ${order.preferences}</div>`;
            }

            let itemsHtml = '';
            if (!isExclusive && Array.isArray(order.items)) {
                itemsHtml = `
                    <div class="mt-4 border-t border-white/10 pt-3">
                        <span class="text-gray-400 block mb-2 font-semibold uppercase text-[10px]">Склад замовлення:</span>
                        <div class="space-y-2">
                            ${order.items.map(i => `
                                <div class="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5">
                                    <div>
                                        <div class="font-bold text-white">${i.name || 'Товар'}</div>
                                        <div class="text-[10px] text-gray-400">Артикул: ${i.sku || '—'} | Розмір: ${i.size || 'Стандарт'}</div>
                                    </div>
                                    <div class="font-mono text-[#c5a059] font-bold">${i.qty || 1} шт. × ${i.price || 0} ₴</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            const photoHtml = order.custom_photo ? `
                <div class="mt-4 border-t border-white/10 pt-3">
                    <span class="text-[#c5a059] block mb-2 font-semibold uppercase tracking-wider text-[10px]">📸 Референс клієнта (Ексклюзив):</span>
                    <a href="${order.custom_photo}" target="_blank" class="block group relative rounded-lg overflow-hidden border border-white/10 w-full sm:w-2/3 max-h-64">
                        <img src="${order.custom_photo}" alt="Reference" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">Відкрити оригінал ↗</div>
                    </a>
                </div>
            ` : '';

            document.getElementById('orderModalTitle').innerText = isExclusive ? `💎 Ексклюзивне замовлення #${order.id}` : `Замовлення #${order.id}`;
            document.getElementById('orderModalContent').innerHTML = `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
                    <div><span class="text-gray-400 block text-[10px] uppercase">Клієнт</span><span class="font-bold text-white text-sm">${order.client_name || order.name || 'Анонім'}</span></div>
                    <div><span class="text-gray-400 block text-[10px] uppercase">Телефон</span><a href="tel:${order.phone}" class="font-mono text-[#c5a059] text-sm hover:underline font-bold">${order.phone || '—'}</a></div>
                    <div><span class="text-gray-400 block text-[10px] uppercase">Дата створення</span><span class="text-gray-300">${date}</span></div>
                    <div><span class="text-gray-400 block text-[10px] uppercase">Сума до сплати</span><span class="font-bold text-[#c5a059] text-sm">${order.total_price || order.total || 0} ₴</span></div>
                    ${order.address ? `<div class="sm:col-span-2"><span class="text-gray-400 block text-[10px] uppercase">Адреса / Доставка</span><span class="text-gray-300">${order.address}</span></div>` : ''}
                    ${order.comment ? `<div class="sm:col-span-2 mt-1 bg-black/20 p-2 rounded border border-white/5"><span class="text-gray-400 block text-[10px] uppercase">Коментар клієнта</span><span class="text-gray-200 italic">${order.comment}</span></div>` : ''}
                </div>
                ${preferencesHtml}
                ${itemsHtml}
                ${photoHtml}
            `;

            document.getElementById('orderModal').classList.remove('hidden');
            setTimeout(() => document.getElementById('orderModal').classList.remove('opacity-0'), 10);
        };

        window.closeOrderModal = function() {
            document.getElementById('orderModal').classList.add('opacity-0');
            setTimeout(() => document.getElementById('orderModal').classList.add('hidden'), 300);
        };

        function getStatusColor(status) {
            switch(status) {
                case 'new': return 'text-yellow-400 border-yellow-500/30';
                case 'processing': return 'text-blue-400 border-blue-500/30';
                case 'completed': return 'text-green-400 border-green-500/30';
                case 'cancelled': return 'text-red-400 border-red-500/30';
                default: return 'text-gray-300';
            }
        }

        window.updateOrderStatus = async function(id, status) {
            const { error } = await _supabase.from('orders').update({ status }).eq('id', id);
            if (error) {
                alert('Помилка оновлення статусу: ' + error.message);
            } else {
                const ord = ordersList.find(o => o.id === id);
                if (ord) ord.status = status;
                showNotification('Статус замовлення оновлено');
            }
        };

        // ==========================================
        // ДИНАМІЧНІ БЛОКИ ГОЛОВНОЇ
        // ==========================================
        function renderBlocksAdmin() {
            const list = document.getElementById('blocksListContainer');
            if(!list) return;
            list.innerHTML = homeBlocks.map(b => `
                <div class="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div class="font-bold text-[#c5a059]">${b.name.uk} <span class="text-[10px] text-gray-500 ml-2">(${b.id})</span></div>
                        <div class="text-[10px] ${b.active ? 'text-green-500' : 'text-red-500'} uppercase font-bold mt-1">${b.active ? 'Активний' : 'Вимкнено'}</div>
                    </div>
                    <div class="flex gap-3 w-full sm:w-auto">
                        <button onclick="openBlockModal('${b.id}')" class="flex-1 sm:flex-none btn-secondary text-xs py-1.5 px-4">Ред</button>
                        <button onclick="deleteBlock('${b.id}')" class="flex-1 sm:flex-none btn-danger text-xs py-1.5 px-4">Видал</button>
                    </div>
                </div>
            `).join('');
        }

        window.openBlockModal = function(id = null) {
            document.getElementById('blockForm').reset();
            document.getElementById('block-old-id').value = '';
            if(id) {
                const b = homeBlocks.find(x => x.id === id);
                document.getElementById('block-old-id').value = b.id;
                document.getElementById('block-id').value = b.id;
                document.getElementById('block-name-uk').value = b.name.uk || '';
                document.getElementById('block-name-ru').value = b.name.ru || '';
                document.getElementById('block-name-en').value = b.name.en || '';
                document.getElementById('block-active').checked = b.active;
            } else {
                document.getElementById('block-active').checked = true;
            }
            document.getElementById('blockModal').classList.remove('hidden');
            setTimeout(() => document.getElementById('blockModal').classList.remove('opacity-0'), 10);
        };

        window.closeBlockModal = function() { 
            document.getElementById('blockModal').classList.add('opacity-0'); 
            setTimeout(() => document.getElementById('blockModal').classList.add('hidden'), 300); 
        };

        document.getElementById('blockForm').onsubmit = async (e) => {
            e.preventDefault();
            const oldId = document.getElementById('block-old-id').value;
            const newId = document.getElementById('block-id').value.toLowerCase();
            
            const data = {
                id: newId,
                name: { uk: document.getElementById('block-name-uk').value, ru: document.getElementById('block-name-ru').value, en: document.getElementById('block-name-en').value },
                active: document.getElementById('block-active').checked
            };
            
            if(oldId) {
                const idx = homeBlocks.findIndex(b => b.id === oldId);
                if(idx > -1) homeBlocks[idx] = data;
            } else {
                if(homeBlocks.find(b => b.id === newId)) return alert('Блок з таким ID вже існує');
                homeBlocks.push(data);
            }
            
            await saveToCloudStorage('bv_home_blocks', homeBlocks);
            renderBlocksAdmin(); 
            closeBlockModal(); 
            showNotification('Блок збережено');
        };

        window.deleteBlock = async function(id) {
            if(confirm('Видалити цей блок назавжди?')) {
                homeBlocks = homeBlocks.filter(b => b.id !== id);
                await saveToCloudStorage('bv_home_blocks', homeBlocks);
                renderBlocksAdmin();
                showNotification('Блок видалено');
            }
        };

        // ==========================================
        // КАТЕГОРІЇ
        // ==========================================
        function flattenOldTree(tree, parentId = null) {
            let res = [];
            tree.forEach(n => {
                let nameObj = typeof n.name === 'object' ? n.name : {uk: n.name, ru: n.name, en: n.name};
                res.push({ id: n.id, name: nameObj, parentId: parentId });
                if(n.subcategories) res = res.concat(flattenOldTree(n.subcategories, n.id));
            });
            return res;
        }

        function buildCategorySelectOptions(selectedId = null, currentIdToIgnore = null) {
            let html = '<option value="">-- Коренева (Головна категорія) --</option>';
            categories.forEach(c => {
                if(c.id !== currentIdToIgnore) {
                    html += `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.name.uk} (${c.id})</option>`;
                }
            });
            return html;
        }

        function renderCategoriesAdmin() {
            const container = document.getElementById('categoriesListContainer');
            if(!container) return;
            const renderNode = (parentId, depth) => {
                const children = categories.filter(c => c.parentId === parentId);
                if(children.length === 0) return '';
                return children.map(c => `
                    <div class="py-2 ${depth === 0 ? 'bg-white/5 p-4 rounded-xl border border-white/10 mb-3' : 'ml-4 sm:ml-6 pl-3 sm:pl-4 border-l border-white/10 mt-2'}">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div class="font-medium text-sm text-white"><span class="text-[10px] text-[#c5a059] mr-2">${c.id}</span> ${c.name.uk}</div>
                            <div class="flex gap-3 w-full sm:w-auto">
                                <button onclick="openCategoryModal('${c.id}')" class="flex-1 sm:flex-none btn-secondary text-xs py-1.5 px-3">Ред</button>
                                <button onclick="deleteCategory('${c.id}')" class="flex-1 sm:flex-none btn-danger text-xs py-1.5 px-3">Видал</button>
                            </div>
                        </div>
                        ${renderNode(c.id, depth + 1)}
                    </div>
                `).join('');
            };
            container.innerHTML = renderNode(null, 0) || '<div class="text-gray-500 text-sm">Категорій немає</div>';
        }

        window.openCategoryModal = function(id = null) {
            document.getElementById('categoryForm').reset();
            document.getElementById('cat-old-id').value = '';
            document.getElementById('catModalTitle').innerText = 'Додати категорію';
            let currentParent = null;
            if (id) {
                const c = categories.find(cat => cat.id === id);
                document.getElementById('cat-old-id').value = c.id;
                document.getElementById('cat-id').value = c.id;
                document.getElementById('cat-name-uk').value = c.name.uk || '';
                document.getElementById('cat-name-ru').value = c.name.ru || '';
                document.getElementById('cat-name-en').value = c.name.en || '';
                currentParent = c.parentId;
                document.getElementById('catModalTitle').innerText = 'Редагувати';
            }
            document.getElementById('cat-parent').innerHTML = buildCategorySelectOptions(currentParent, id);
            document.getElementById('categoryModal').classList.remove('hidden');
            setTimeout(() => document.getElementById('categoryModal').classList.remove('opacity-0'), 10);
        };

        window.closeCategoryModal = function() { 
            document.getElementById('categoryModal').classList.add('opacity-0'); 
            setTimeout(() => document.getElementById('categoryModal').classList.add('hidden'), 300); 
        };

        document.getElementById('categoryForm').onsubmit = async (e) => {
            e.preventDefault();
            const oldId = document.getElementById('cat-old-id').value;
            const newId = document.getElementById('cat-id').value.toLowerCase();
            const parentId = document.getElementById('cat-parent').value || null;
            
            const data = {
                id: newId, parentId: parentId,
                name: { uk: document.getElementById('cat-name-uk').value, ru: document.getElementById('cat-name-ru').value, en: document.getElementById('cat-name-en').value }
            };

            if (oldId) {
                const idx = categories.findIndex(c => c.id === oldId);
                categories[idx] = data;
                if(oldId !== newId) categories.filter(c => c.parentId === oldId).forEach(c => c.parentId = newId);
            } else {
                if(categories.find(c => c.id === newId)) return alert('ID вже існує!');
                categories.push(data);
            }
            
            await saveToCloudStorage('bv_categories_flat', categories);
            renderCategoriesAdmin(); 
            populateCategorySelects(); 
            closeCategoryModal(); 
            showNotification('Категорію збережено');
        };

        window.deleteCategory = async function(id) {
            if(categories.find(c => c.parentId === id)) { return alert('Неможливо видалити: у цієї категорії є підкатегорії.'); }
            if(confirm('Видалити категорію?')) {
                categories = categories.filter(c => c.id !== id);
                await saveToCloudStorage('bv_categories_flat', categories);
                renderCategoriesAdmin(); 
                populateCategorySelects(); 
                showNotification('Видалено');
            }
        };

        // ==========================================
        // ТОВАРИ
        // ==========================================
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
                id: p.id, sku: p.sku || p.id, category: p.category || '', status: p.status || 'in-stock', badge: p.badge || 'none', blocks: blocks,
                sizes: Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' && p.sizes.trim() ? p.sizes.split(',').map(s=>s.trim()) : []),
                stones: p.stones || '', variant: p.variant || '', variations: { base: base }
            };
        }

   /**
 * Заповнює дворівневий селект категорій (Головна категорія + Підкатегорія)
 */

function getCategoryNameSafe(cat) {
    if (!cat) return 'Без назви';
    if (typeof window.getLoc === 'function') {
        return window.getLoc(cat, 'name') || '';
    }
    return cat.name?.uk || cat.name || cat.id || 'Без назви';
}

// Допоміжна функція для безпечного витягування масиву з Supabase site_storage
function extractStorageValue(raw) {
    if (!raw) return [];
    if (typeof raw === 'object' && 'value' in raw) raw = raw.value;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object' && raw !== null) return Object.values(raw);
    return [];
}

// Заповнення головних категорій та коректна ініціалізація підкатегорій
window.populateCategorySelect = function(selectedCategoryId = '') {
    try {
        const parentSelect = document.getElementById('prod-parent-category');
        const subSelect = document.getElementById('prod-category');
        
        if (!parentSelect || !subSelect) return;

        // Отримуємо дерево категорій так само як у ваших фільтрах
        let rawTree = typeof API !== 'undefined' ? API.get('bv_categories_tree', []) : [];
        let cats = extractStorageValue(rawTree);

        let targetId = selectedCategoryId;
        if (typeof targetId === 'object') targetId = ''; 
        targetId = String(targetId || '');

        let selectedParentId = '';

        // Шукаємо, до якої головної категорії належить обраний ID (враховуємо вкладеність)
        if (targetId && cats.length > 0) {
            for (const cat of cats) {
                if (!cat) continue;
                if (String(cat.id) === targetId) {
                    selectedParentId = String(cat.id);
                    break;
                }
                if (Array.isArray(cat.subcategories)) {
                    // Перевіряємо другий та третій рівень вкладеності
                    let foundInSub = cat.subcategories.some(sub => {
                        if (String(sub.id) === targetId) return true;
                        if (Array.isArray(sub.subcategories)) {
                            return sub.subcategories.some(subsub => String(subsub.id) === targetId);
                        }
                        return false;
                    });
                    if (foundInSub) {
                        selectedParentId = String(cat.id);
                        break;
                    }
                }
            }
        }

        if (targetId && !selectedParentId) {
            selectedParentId = targetId;
        }

        // Формуємо HTML для головних категорій
        let parentHtml = '<option value="" disabled selected>Оберіть категорію...</option>';
        cats.forEach(cat => {
            if (!cat) return;
            const catName = getCategoryNameSafe(cat);
            const isSelected = selectedParentId === String(cat.id) ? 'selected' : '';
            parentHtml += `<option value="${cat.id}" ${isSelected}>${catName}</option>`;
        });

        parentSelect.innerHTML = parentHtml;

        // Запускаємо заповнення дочірніх елементів
        handleParentCategoryChange(targetId);

    } catch (error) {
        console.error('Критична помилка в populateCategorySelect:', error);
    }
};

// Обробка зміни головної категорії (рендерить усю вкладену структуру subcategories)
window.handleParentCategoryChange = function(preselectedSubId = '') {
    try {
        const parentSelect = document.getElementById('prod-parent-category');
        const subSelect = document.getElementById('prod-category');
        const subWrapper = document.getElementById('sub-category-wrapper');

        if (!parentSelect || !subSelect) return;

        let rawTree = typeof API !== 'undefined' ? API.get('bv_categories_tree', []) : [];
        let cats = extractStorageValue(rawTree);

        const parentId = String(parentSelect.value || '');
        let targetSubId = preselectedSubId;
        if (typeof targetSubId === 'object') targetSubId = ''; 
        targetSubId = String(targetSubId || '');

        const selectedParent = cats.find(cat => cat && String(cat.id) === parentId);

        if (selectedParent && Array.isArray(selectedParent.subcategories) && selectedParent.subcategories.length > 0) {
            let subHtml = '<option value="" disabled selected>Оберіть підкатегорію...</option>';
            
            // Рекурсивно або плоско виводимо вкладені рівні для зручного вибору в селекті
            selectedParent.subcategories.forEach(sub => {
                if (!sub) return;
                const subName = getCategoryNameSafe(sub);
                const isSelected = targetSubId === String(sub.id) ? 'selected' : '';
                subHtml += `<option value="${sub.id}" ${isSelected}>— ${subName}</option>`;

                // Якщо є третій рівень (subsubcategories)
                if (Array.isArray(sub.subcategories) && sub.subcategories.length > 0) {
                    sub.subcategories.forEach(subsub => {
                        if (!subsub) return;
                        const subsubName = getCategoryNameSafe(subsub);
                        const isSubSelected = targetSubId === String(subsub.id) ? 'selected' : '';
                        subHtml += `<option value="${subsub.id}" ${isSubSelected}>&nbsp;&nbsp;&nbsp;&nbsp;• ${subsubName}</option>`;
                    });
                }
            });

            subSelect.innerHTML = subHtml;
            subSelect.required = true;
            if (subWrapper) subWrapper.style.display = 'block';
            
        } else {
            subSelect.innerHTML = `<option value="${parentId}" selected>Без підкатегорії</option>`;
            subSelect.removeAttribute('required');
            if (subWrapper) subWrapper.style.display = 'none';
        }
    } catch (error) {
        console.error('Критична помилка в handleParentCategoryChange:', error);
    }
};
        window.searchProducts = function() {
            const term = document.getElementById('prodSearch').value.toLowerCase();
            filteredProducts = products.filter(p => {
                const n = p.variations.base.name.uk.toLowerCase();
                const s = (p.sku || '').toLowerCase();
                return n.includes(term) || s.includes(term);
            });
            currentPage = 1; 
            renderProducts();
        };

        window.changePage = function(dir) { currentPage += dir; renderProducts(); };

        window.renderProducts = function() {
            const tbody = document.getElementById('productsTableBody');
            if(!tbody) return;
            tbody.innerHTML = '';
            
            const total = filteredProducts.length;
            const totalPages = Math.ceil(total / itemsPerPage) || 1;
            if(currentPage < 1) currentPage = 1;
            if(currentPage > totalPages) currentPage = totalPages;
            
            const startIndex = (currentPage - 1) * itemsPerPage;
            const currentBatch = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

            const pageInfoEl = document.getElementById('pageInfo');
            if(pageInfoEl) pageInfoEl.innerText = `Показано ${startIndex + (total>0?1:0)}-${startIndex + currentBatch.length} з ${total}`;
            
            if(total === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">Порожньо.</td></tr>';
                return;
            }
            
            currentBatch.forEach(p => {
                const mainImg = p.variations.base.images[0] || '';
                const catName = categories.find(c => c.id === p.category)?.name?.uk || p.category;
                tbody.innerHTML += `
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-3" data-label="Фото"><img src="${mainImg}" class="w-12 h-12 object-cover rounded border border-white/10"></td>
                        <td class="p-3 font-medium text-xs w-full" data-label="Назва / Артикул">
                            <span class="text-[10px] text-[#c5a059] block mb-1">Арт: ${p.sku}</span>
                            ${p.variations.base.name.uk}
                            <div class="text-[9px] text-gray-500 mt-1">Розміри: ${p.sizes && p.sizes.length > 0 ? p.sizes.join(', ') : 'Немає'}</div>
                        </td>
                        <td class="p-3 text-gray-400 text-xs" data-label="Категорія">${catName}</td>
                        <td class="p-3 text-[#c5a059] text-xs font-semibold" data-label="Ціна">${p.variations.base.price} ₴</td>
                        <td class="p-3" data-label="Дії">
                            <div class="flex justify-end gap-4">
                                <button onclick="openProductModal('${p.id}')" class="text-blue-400 font-bold hover:underline uppercase tracking-wider text-[10px]">Ред</button>
                                <button onclick="deleteProduct('${p.id}')" class="text-red-500 font-bold hover:underline uppercase tracking-wider text-[10px]">Видал</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        };

        window.openProductModal = function(id = null) {
            editLang = 'uk'; editVar = 'base';
            if(id) {
                actProd = JSON.parse(JSON.stringify(products.find(p => p.id === id)));
                if(!actProd.variations) actProd.variations = { base: { name:{uk:''}, desc:{uk:''}, images:[] } };
                if(!actProd.blocks) actProd.blocks = [];
                if(!actProd.sizes) actProd.sizes = [];
            } else {
                actProd = {
                    id: '', sku: '', category: '', status: 'in-stock', badge: 'none', blocks: [], sizes: [], stones: '', variant: '',
                    variations: { base: { name: {uk:'', ru:'', en:''}, desc: {uk:'', ru:'', en:''}, priceType: 'manual', price: '', weight: '', workCost: '', discount: '', images: [] } }
                };
            }

            document.getElementById('prodModalTitle').innerText = id ? 'Редагувати товар' : 'Новий товар';
            document.getElementById('prod-id').value = actProd.id;
            document.getElementById('prod-sku').value = actProd.sku;
            document.getElementById('prod-category').innerHTML = buildCategorySelectOptions(actProd.category);
            document.getElementById('prod-status').value = actProd.status;
            document.getElementById('prod-badge').value = actProd.badge;
            document.getElementById('prod-variant').value = actProd.variant || '';
            document.getElementById('prod-stones').value = actProd.stones || '';

            const bCont = document.getElementById('prod-blocks-container');
            if(bCont) {
                bCont.innerHTML = homeBlocks.map(b => `
                    <label class="flex items-center gap-2 text-[11px] text-white cursor-pointer bg-black/20 p-2.5 rounded border border-white/5 hover:border-[#c5a059]/50 transition-colors">
                        <input type="checkbox" value="${b.id}" class="prod-block-cb accent-[#c5a059] w-4 h-4" ${actProd.blocks.includes(b.id) ? 'checked' : ''}>
                        ${b.name.uk}
                    </label>
                `).join('');
            }
            renderProductEditor();

            // Close mobile sidebar so it does not sit under / steal focus from the modal
            const sidebar = document.getElementById('sidebar');
            const sidebarOverlay = document.getElementById('sidebarOverlay');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                sidebarOverlay?.classList.remove('active');
            }

            const modal = document.getElementById('productModal');
            const panel = modal?.querySelector('.admin-modal-panel');
            if (!modal) return;
            modal.classList.remove('hidden');
            document.body.classList.add('admin-modal-open');
            // Force reflow then animate sheet onto screen (fixes mobile translate-y-full stuck off-screen)
            void modal.offsetWidth;
            requestAnimationFrame(() => {
                modal.classList.remove('opacity-0');
                if (panel) {
                    panel.classList.remove('translate-y-full');
                    panel.classList.add('translate-y-0');
                }
            });
        };

        window.closeProductModal = function() { 
            const modal = document.getElementById('productModal');
            const panel = modal?.querySelector('.admin-modal-panel');
            if (!modal) return;
            modal.classList.add('opacity-0');
            if (panel) {
                panel.classList.add('translate-y-full');
                panel.classList.remove('translate-y-0');
            }
            document.body.classList.remove('admin-modal-open');
            setTimeout(() => modal.classList.add('hidden'), 300); 
        };
        window.switchLangTab = function(l) { editLang = l; renderProductEditor(); };
        window.switchVarTab = function(v) { editVar = v; renderProductEditor(); };

        window.addVariationSize = function() {
            const s = prompt('Введіть розмір (напр. 16.5 або 45):');
            if(s && s.trim()) {
                const val = s.trim();
                if(!actProd.sizes.includes(val)) {
                    actProd.sizes.push(val);
                    actProd.variations[val] = { name:{uk:'', ru:'', en:''}, desc:{uk:'', ru:'', en:''}, images:[], price:'', weight:'', workCost:'' };
                    editVar = val;
                    renderProductEditor();
                }
            }
        };

        window.removeVariationSize = function(size) {
            if(confirm(`Видалити розмір ${size}?`)) {
                actProd.sizes = actProd.sizes.filter(s => s !== size);
                delete actProd.variations[size];
                if(editVar === size) editVar = 'base';
                renderProductEditor();
            }
        };

        window.renderProductEditor = function() {
            document.querySelectorAll('.tab-lang').forEach(b => {
                b.classList.toggle('active', b.innerText.toLowerCase() === editLang);
                b.classList.toggle('bg-[#c5a059]', b.innerText.toLowerCase() === editLang);
            });

            let vTabs = `<button type="button" class="tab-var px-3 py-2 text-xs font-bold whitespace-nowrap ${editVar==='base'?'active':''}" onclick="switchVarTab('base')">Основна</button>`;
            if (actProd.sizes && actProd.sizes.length > 0) {
                actProd.sizes.forEach(s => {
                    vTabs += `<div class="flex items-center tab-var px-2 py-1 text-xs font-bold whitespace-nowrap ${editVar===s?'active':''}">
                        <button type="button" onclick="switchVarTab('${s}')" class="px-2">Розмір: ${s}</button>
                        <button type="button" onclick="removeVariationSize('${s}')" class="text-red-500 hover:text-white px-1">&times;</button>
                    </div>`;
                });
            }
            vTabs += `<button type="button" onclick="addVariationSize()" class="px-3 py-1 text-xs font-bold text-green-400 hover:bg-white/5 rounded ml-2">+ Додати розмір</button>`;
            document.getElementById('varTabsContainer').innerHTML = vTabs;

            if (!actProd.variations[editVar]) actProd.variations[editVar] = { name:{uk:'', ru:'', en:''}, desc:{uk:'', ru:'', en:''}, images:[], price:'', weight:'', workCost:'', priceType: 'manual' };
            const vData = actProd.variations[editVar];
            const isBase = editVar === 'base';
            
            if(!vData.name) vData.name = {uk:'', ru:'', en:''};
            if(!vData.desc) vData.desc = {uk:'', ru:'', en:''};
            if(!vData.priceType) vData.priceType = isBase ? 'manual' : (actProd.variations.base.priceType || 'manual');
            
            const baseData = actProd.variations.base;
            const cont = document.getElementById('variationFieldsContainer');
            if(!cont) return;
            
            cont.innerHTML = `
    <div class="grid grid-cols-1 gap-4">
        <div>
            <label class="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] block mb-1">Назва [${editLang.toUpperCase()}] ${!isBase?'<span class="text-gray-400 font-normal normal-case">(Пусто = як в Основній)</span>':''}</label>
            <input type="text" id="var-name" class="input-field" value="${vData.name[editLang] || ''}" placeholder="${isBase ? 'Назва товару' : (baseData.name[editLang] || 'Від Основної')}" oninput="actProd.variations['${editVar}'].name['${editLang}'] = this.value">
        </div>
        <div>
            <label class="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] block mb-1">Опис [${editLang.toUpperCase()}]</label>
            <textarea id="var-desc" class="input-field h-24 resize-none" placeholder="${isBase ? 'Опис товару...' : (baseData.desc[editLang] || 'Від Основної')}" oninput="actProd.variations['${editVar}'].desc['${editLang}'] = this.value">${vData.desc[editLang] || ''}</textarea>
        </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 border-t border-white/10 pt-4 items-end">
        <div class="md:col-span-1">
            <label class="text-[10px] uppercase text-gray-400 block mb-1">Тип розрахунку</label>
            <select id="var-price-type" class="input-field bg-[#1a1a1a] font-semibold text-[#c5a059]" onchange="toggleVarPriceMode(this.value)">
                <option value="manual" ${vData.priceType === 'manual' ? 'selected' : ''}>Вручну</option>
                <option value="auto" ${vData.priceType === 'auto' ? 'selected' : ''}>Авто (по вазі)</option>
            </select>
        </div>

        <!-- Ручний ввід ціни -->
        <div id="var-price-manual-box" class="${vData.priceType === 'auto' ? 'hidden' : ''}">
            <label class="text-[10px] uppercase text-gray-400 block mb-1">Ціна (ГРН)</label>
            <input type="number" id="var-price" class="input-field" value="${vData.price || ''}" placeholder="${isBase ? '0' : (baseData.price || 'Від Основної')}" oninput="actProd.variations['${editVar}'].price = this.value">
        </div>

        <!-- Авторозрахунок по вазі -->
        <div id="var-price-auto-box" class="${vData.priceType === 'auto' ? 'flex' : 'hidden'} gap-3 md:col-span-2 items-end">
            <div class="w-1/3">
                <label class="text-[10px] uppercase text-gray-400 block mb-1">Вага (г)</label>
                <input type="number" step="0.01" id="var-weight" class="input-field border-[#c5a059]" value="${vData.weight || ''}" placeholder="${isBase?'':(baseData.weight||'Від Основної')}" oninput="actProd.variations['${editVar}'].weight = this.value; recalculateCurrentVarPrice();">
            </div>
            <div class="w-1/3">
                <label class="text-[10px] uppercase text-gray-400 block mb-1">Робота (ГРН)</label>
                <input type="number" id="var-workCost" class="input-field border-[#c5a059]" value="${vData.workCost || ''}" placeholder="${isBase?'0':(baseData.workCost||'Від Основної')}" oninput="actProd.variations['${editVar}'].workCost = this.value; recalculateCurrentVarPrice();">
            </div>
            <!-- Плашка підсумкової розрахованої ціни -->
            <div class="w-1/3 bg-black/40 border border-[#c5a059]/30 rounded p-2 text-center">
                <span class="text-[9px] uppercase text-gray-400 block">Разом:</span>
                <span id="auto-price-preview" class="text-xs font-bold text-[#c5a059]">${vData.price || 0} ₴</span>
            </div>
        </div>

        <div class="md:col-span-1">
            <label class="text-[10px] uppercase text-gray-400 block mb-1">Акційна ціна</label>
            <input type="number" id="var-discount" class="input-field" value="${vData.discount || ''}" placeholder="${isBase?'Немає':(baseData.discount||'Від Основної')}" oninput="actProd.variations['${editVar}'].discount = this.value">
        </div>
    </div>

    <div class="mt-4 border-t border-white/10 pt-4">
        <label class="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] block mb-2">Фото ${isBase?'основного товару':`для розміру ${editVar}`} <span class="text-gray-400 normal-case ml-1">${!isBase?'(Пусто = фото Основної)':''}</span></label>
        <input type="file" accept="image/png, image/jpeg, image/webp" multiple class="input-field file-input bg-[#1a1a1a]" id="varImgUpload">
        <div id="varGalleryPreview" class="flex gap-3 mt-4 overflow-x-auto pb-2 custom-scrollbar"></div>
    </div>
`;
            
            document.getElementById('varImgUpload').addEventListener('change', async (e) => {
                const files = e.target.files;
                if(!files || files.length === 0) return;
                if(!actProd.variations[editVar].images) actProd.variations[editVar].images = [];
                showNotification('Завантаження картинок в хмару...');

                for (const file of Array.from(files)) {
                    const imageUrl = await uploadToStorage(file, 'site-images', 'products');
                    if (imageUrl) {
                        actProd.variations[editVar].images.push(imageUrl);
                    }
                }
                
                renderVarGallery();
                showNotification('Картинки успішно завантажено!');
            });
            renderVarGallery();
        };

        // Перемикання режиму (Manual / Auto)
window.toggleVarPriceMode = function(mode) {
    if (!actProd || !actProd.variations || !actProd.variations[editVar]) return;

    const vData = actProd.variations[editVar];
    
    // 1. Одразу оновлюємо тип розрахунку в пам'яті товару
    vData.priceType = mode;

    // 2. Отримуємо елементи блоків
    const manualBox = document.getElementById('var-price-manual-box');
    const autoBox = document.getElementById('var-price-auto-box');

    // 3. Перемикаємо видимість блоків
    if (mode === 'auto') {
        manualBox?.classList.add('hidden');
        autoBox?.classList.remove('hidden');
        autoBox?.classList.add('flex');

        // Автоматично вираховуємо ціну за вагою прямо зараз
        recalculateCurrentVarPrice();
    } else {
        manualBox?.classList.remove('hidden');
        autoBox?.classList.add('hidden');
        autoBox?.classList.remove('flex');

        // Повертаємо збережену ручну ціну в інпут
        const priceInput = document.getElementById('var-price');
        if (priceInput) {
            priceInput.value = vData.price || '';
        }
    }
};

// Хелпер для живого розрахунку авто-ціни
window.recalculateCurrentVarPrice = function() {
    if (!actProd || !actProd.variations || !actProd.variations[editVar]) return;

    const vData = actProd.variations[editVar];
    
    // Зчитуємо актуальні значення з інпутів модалки
    const weightInput = document.getElementById('var-weight');
    const workCostInput = document.getElementById('var-workCost');

    if (weightInput) vData.weight = weightInput.value;
    if (workCostInput) vData.workCost = workCostInput.value;

    if (vData.priceType === 'auto') {
        const weight = parseFloat(vData.weight) || 0;
        const workCost = parseFloat(vData.workCost) || 0;
        const goldRate = parseFloat(siteSettings?.goldRate) || 0;

        // Формула розрахунку
        const calculatedPrice = Math.round((weight * goldRate) + workCost);
        vData.price = calculatedPrice;

        // Оновлюємо плашку підсумку
        const previewEl = document.getElementById('auto-price-preview');
        if (previewEl) {
            previewEl.innerText = `${calculatedPrice} ₴`;
        }
    }
};
        function renderVarGallery() {
            const cont = document.getElementById('varGalleryPreview');
            const imgs = actProd.variations[editVar].images || [];
            if(imgs.length === 0) {
                cont.innerHTML = '<div class="text-[10px] text-gray-500 italic">Фотографій не завантажено.</div>';
                return;
            }
            cont.innerHTML = imgs.map((img, idx) => `
                <div class="relative w-24 h-24 flex-shrink-0 group rounded-lg overflow-hidden border border-white/20">
                    ${idx === 0 ? '<div class="absolute top-0 left-0 bg-[#c5a059] text-black text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg z-10">ГОЛОВНЕ</div>' : ''}
                    <img src="${img}" class="w-full h-full object-cover">
                    <button type="button" onclick="actProd.variations['${editVar}'].images.splice(${idx},1); window.renderVarGallery();" class="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex justify-center items-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                </div>
            `).join('');
        }
        window.renderVarGallery = renderVarGallery;

       window.saveActiveProduct = async function() {
    const submitBtn = document.querySelector('.btn-primary[onclick="saveActiveProduct()"]');
    if(submitBtn) { submitBtn.innerText = 'Зберігаю...'; submitBtn.disabled = true; }

    try {
        // 1. Оновлюємо по поточній варіації (Включаючи priceType!)
        if (actProd.variations && actProd.variations[editVar]) {
            const priceTypeSelect = document.getElementById('var-price-type');
            if (priceTypeSelect) {
                actProd.variations[editVar].priceType = priceTypeSelect.value; // <-- ГОЛОВНИЙ ФІКС
            }
            if (document.getElementById('var-weight')) {
                actProd.variations[editVar].weight = document.getElementById('var-weight').value;
                actProd.variations[editVar].workCost = document.getElementById('var-workCost').value;
                actProd.variations[editVar].discount = document.getElementById('var-discount').value;
            }
        }
        
        // 2. Оновлюємо загальні поля товару
        actProd.sku = document.getElementById('prod-sku').value.trim();
        actProd.category = document.getElementById('prod-category').value;
        actProd.status = document.getElementById('prod-status').value;
        actProd.badge = document.getElementById('prod-badge').value;
        actProd.variant = document.getElementById('prod-variant').value;
        actProd.stones = document.getElementById('prod-stones').value;
        
        const selectedBlocks = Array.from(document.querySelectorAll('.prod-block-cb:checked')).map(cb => cb.value);
        actProd.blocks = selectedBlocks;

        // 3. Якщо режим AUTO — підраховуємо актуальну ціну перед збереженням
        const goldRate = parseFloat(siteSettings?.goldRate) || 0;
        const baseVar = actProd.variations?.base || {};
        
        if (baseVar.priceType === 'auto') {
            const weight = parseFloat(baseVar.weight) || 0;
            const workCost = parseFloat(baseVar.workCost) || 0;
            baseVar.price = Math.round((weight * goldRate) + workCost);
        } else {
            baseVar.price = document.getElementById('var-price')?.value || baseVar.price || 0;
        }

        const mainName = baseVar?.name?.uk || baseVar?.name?.ru || baseVar?.name?.en || '';
        if (!mainName) throw new Error('Вкажіть назву товару!');

        actProd.name = mainName;   
        actProd.price = parseFloat(baseVar.price) || 0;

        // 4. Збереження в Supabase
        if (!actProd.id) {
            const skuSlug = actProd.sku.toLowerCase().replace(/[^a-z0-9]/g, '-');
            actProd.id = skuSlug || `prod-${Date.now()}`;
            
            const { error } = await _supabase.from('products').insert([actProd]);
            if(error) throw error;
            products.push(actProd);
        } else {
            const { error } = await _supabase.from('products').update(actProd).eq('id', actProd.id);
            if(error) throw error;
            const idx = products.findIndex(p => p.id === actProd.id);
            if (idx !== -1) products[idx] = actProd;
        }
        
        filteredProducts = [...products];
        syncProductsToStorefront();
        renderProducts();
        closeProductModal();
        if (typeof showNotification === 'function') showNotification('Товар збережено!');
    } catch (err) {
        console.error('Помилка збереження:', err);
        alert('Помилка: ' + err.message);
    } finally {
        if(submitBtn) { submitBtn.innerText = 'Зберегти товар'; submitBtn.disabled = false; }
    }
};



// ==========================================
// ПРАЙС-ЛИСТ (Ремонт та Послуги - Золото/Срібло)
// ==========================================


// Завантаження прайсу з бази Supabase при відкритті адмінки
async function initAdminPriceEditor() {
    try {
        const { data, error } = await _supabase
            .from('site_storage')
            .select('value')
            .eq('key', 'bv_price_list')
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        priceListDB = data && data.value ? data.value : [];
        renderPriceBuilder();
    } catch (err) {
        console.error('Помилка завантаження прайсу в адмінку:', err);
        priceListDB = [];
        renderPriceBuilder();
    }
}

// Головна функція побудови форми редагування прайсу
window.renderPriceBuilder = function() {
    const container = document.getElementById('priceBuilderContainer') || document.getElementById('adminPriceEditorContainer');
    if (!container) return;
    
    if (!priceListDB || priceListDB.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-sm p-4 text-center border border-white/10 rounded-lg">Прайс-лист порожній. Додайте першу категорію.</div>';
        return;
    }

    container.innerHTML = priceListDB.map((cat, cIdx) => `
        <div class="admin-category-block glass-panel p-4 lg:p-6 mb-4 border border-[#c5a059]/20 rounded-lg bg-white/5" data-cat-index="${cIdx}">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-white/10 pb-4">
                <div class="w-full sm:w-2/3">
                    <label class="block text-xs uppercase tracking-widest text-[#c5a059] mb-1 font-bold">Назва категорії</label>
                    <input type="text" class="cat-title-input w-full bg-black/40 border border-white/20 rounded p-2 text-sm text-white font-bold" value="${cat.category || ''}" oninput="updatePriceCategory(${cIdx}, this.value)">
                </div>
                <button type="button" onclick="removePriceCategory(${cIdx})" class="btn-danger text-xs py-1.5 px-3 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded transition">Видалити категорію</button>
            </div>
            
            <div class="space-y-3 items-container">
                <div class="hidden sm:grid grid-cols-12 gap-2 px-2 text-[10px] uppercase font-bold text-gray-400 mb-1">
                    <div class="col-span-6">Назва послуги</div>
                    <div class="col-span-2 text-center text-yellow-500">Золото</div>
                    <div class="col-span-2 text-center text-gray-300">Срібло</div>
                    <div class="col-span-2 text-right">Дії</div>
                </div>
                
                ${(cat.items || []).map((item, iIdx) => `
                    <div class="admin-item-row grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-black/20 p-2.5 rounded border border-white/5" data-item-index="${iIdx}">
                        <div class="sm:col-span-6">
                            <input type="text" placeholder="Назва послуги" class="item-name-input w-full bg-black/40 border border-white/20 rounded p-2 text-xs text-white" value="${item.name || ''}" oninput="updatePriceItem(${cIdx}, ${iIdx}, 'name', this.value)">
                        </div>
                        <div class="sm:col-span-2 flex items-center gap-1">
                            <span class="sm:hidden text-[10px] text-yellow-500 uppercase w-16">Золото:</span>
                            <input type="text" placeholder="Від 600" class="item-gold-input w-full bg-black/40 border border-yellow-500/30 focus:border-yellow-500 rounded p-2 text-xs text-center text-yellow-500 font-bold" value="${item.gold || ''}" oninput="updatePriceItem(${cIdx}, ${iIdx}, 'gold', this.value)">
                        </div>
                        <div class="sm:col-span-2 flex items-center gap-1">
                            <span class="sm:hidden text-[10px] text-gray-300 uppercase w-16">Срібло:</span>
                            <input type="text" placeholder="Від 400" class="item-silver-input w-full bg-black/40 border border-white/20 focus:border-white rounded p-2 text-xs text-center text-gray-300 font-bold" value="${item.silver || ''}" oninput="updatePriceItem(${cIdx}, ${iIdx}, 'silver', this.value)">
                        </div>
                        <div class="sm:col-span-2 text-right">
                            <button type="button" onclick="removePriceItem(${cIdx}, ${iIdx})" class="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-red-500/10 rounded transition">Видалити</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <button type="button" onclick="addPriceItem(${cIdx})" class="mt-4 text-xs text-[#c5a059] hover:underline font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <span>+ Додати послугу</span>
            </button>
        </div>
    `).join('');
    
    updateJsonPreview();
};

// Оновлення назви категорії в пам'яті
window.updatePriceCategory = function(cIdx, value) {
    if (priceListDB[cIdx]) {
        priceListDB[cIdx].category = value;
        updateJsonPreview();
    }
};

// Оновлення окремого поля послуги (name, gold, silver)
window.updatePriceItem = function(cIdx, iIdx, field, value) {
    if (priceListDB[cIdx] && priceListDB[cIdx].items[iIdx]) {
        priceListDB[cIdx].items[iIdx][field] = value;
        updateJsonPreview();
    }
};

// Додавання нової послуги в категорію
window.addPriceItem = function(cIdx) {
    if (!priceListDB[cIdx].items) priceListDB[cIdx].items = [];
    priceListDB[cIdx].items.push({ name: '', gold: '', silver: '' });
    renderPriceBuilder();
};

// Видалення послуги
window.removePriceItem = function(cIdx, iIdx) {
    if (confirm('Видалити послугу з прайс-листа?')) {
        priceListDB[cIdx].items.splice(iIdx, 1);
        renderPriceBuilder();
    }
};

// Видалення всієї категорії
window.removePriceCategory = function(cIdx) {
    if (confirm('Видалити цілу категорію послуг? Це безповоротно.')) {
        priceListDB.splice(cIdx, 1);
        renderPriceBuilder();
    }
};

// Додавання нової порожньої категорії
window.addPriceCategory = function() {
    priceListDB.push({
        category: 'Нова категорія послуг',
        items: []
    });
    renderPriceBuilder();
};

// Синхронізація з текстовим JSON-редактором (якщо такий є в адмінці)
function updateJsonPreview() {
    const jsonEditor = document.getElementById('price-json-editor');
    if (jsonEditor) jsonEditor.value = JSON.stringify(priceListDB, null, 4);
}

// Ініціалізація слухачів подій при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    initAdminPriceEditor();

    // Кнопка додавання нової категорії
    document.getElementById('btnAddPriceCategory')?.addEventListener('click', () => {
        window.addPriceCategory();
    });

    // Кнопка збереження прайсу в Supabase
    document.getElementById('btnSavePriceList')?.addEventListener('click', async () => {
        const btn = document.getElementById('btnSavePriceList');
        if (!btn) return;
        
        const originalText = btn.innerText;
        btn.innerText = 'Зберігаю...';
        btn.disabled = true;

        try {
            const { error } = await _supabase
                .from('site_storage')
                .upsert({ 
                    key: 'bv_price_list', 
                    value: priceListDB 
                }, { onConflict: 'key' });

            if (error) throw error;
            
            if (typeof showNotification === 'function') {
                showNotification('Прайс-лист успішно збережено в базі!');
            } else {
                alert('Прайс-лист успішно збережено в базі!');
            }
        } catch (err) {
            alert('Помилка збереження прайс-листа: ' + err.message);
            console.error(err);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
});

        // 💎 ВОССТАНОВЛЕНО: Удаление товаров
        window.deleteProduct = async function(id) {
            if(confirm('Точно видалити цей товар?')) {
                const { error } = await _supabase.from('products').delete().eq('id', id);
                if(error) {
                    alert('Помилка видалення: ' + error.message);
                } else {
                    products = products.filter(p => p.id !== id);
                    filteredProducts = filteredProducts.filter(p => p.id !== id);
                    syncProductsToStorefront();
                    renderProducts();
                    showNotification('Товар видалено!');
                }
            }
        };

        // ==========================================
        // БАНЕРИ ТА СЛАЙДЕР
        // ==========================================
        window.renderBannersAdmin = function() {
            const cont = document.getElementById('bannersListContainer');
            if (!cont) return;
            if (!banners || banners.length === 0) {
                cont.innerHTML = '<div class="col-span-full text-center text-gray-500 text-xs py-6">Банерів ще немає.</div>';
                return;
            }
            cont.innerHTML = banners.map((b, idx) => `
                <div class="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col justify-between">
                    <div>
                        <img src="${b.img}" class="w-full aspect-[21/9] object-cover rounded-lg border border-white/5 mb-3">
                        <div class="text-[11px] text-gray-400 truncate mb-2">Посилання: <span class="text-white">${b.link || 'Немає'}</span></div>
                    </div>
                    <div class="flex gap-2 border-t border-white/10 pt-2.5">
                        <button onclick="openBannerModal(${idx})" class="flex-1 btn-secondary text-xs py-1.5">Ред</button>
                        <button onclick="deleteBanner(${idx})" class="flex-1 btn-danger text-xs py-1.5 font-semibold rounded-lg">Видалити</button>
                    </div>
                </div>
            `).join('');
            
            const ratioSelect = document.getElementById('set-banner-ratio');
            if (ratioSelect && siteSettings.bannerRatio) {
                ratioSelect.value = siteSettings.bannerRatio;
            }
        };

        window.openBannerModal = function(idx = null) {
            document.getElementById('bannerForm').reset();
            const preview = document.getElementById('bannerPreview');
            preview.classList.add('hidden');
            preview.src = '';
            
            if (idx !== null) {
                const b = banners[idx];
                document.getElementById('banner-id').value = idx;
                document.getElementById('banner-img').value = b.img || '';
                document.getElementById('banner-link').value = b.link || '';
                if (b.img) { preview.src = b.img; preview.classList.remove('hidden'); }
                document.getElementById('bannerModalTitle').innerText = 'Редагувати банер';
            } else {
                document.getElementById('banner-id').value = '';
                document.getElementById('banner-img').value = '';
                document.getElementById('bannerModalTitle').innerText = 'Новий банер';
            }
            document.getElementById('bannerModal').classList.remove('hidden');
            setTimeout(() => document.getElementById('bannerModal').classList.remove('opacity-0'), 10);
        };

        window.closeBannerModal = function() {
            document.getElementById('bannerModal').classList.add('opacity-0');
            setTimeout(() => document.getElementById('bannerModal').classList.add('hidden'), 300);
        };

        document.getElementById('bannerForm').onsubmit = async (e) => {
            e.preventDefault();
            const idVal = document.getElementById('banner-id').value;
            const imgVal = document.getElementById('banner-img').value;
            const linkVal = document.getElementById('banner-link').value;
            
            if (!imgVal) return alert('Завантажте зображення банера!');
            
            const item = { img: imgVal, link: linkVal };
            if (idVal !== '') {
                banners[parseInt(idVal)] = item;
            } else {
                banners.push(item);
            }
            
            await saveToCloudStorage('bv_banners', banners);
            renderBannersAdmin();
            closeBannerModal();
            showNotification('Банер збережено!');
        };

        window.deleteBanner = async function(idx) {
            if (confirm('Видалити цей банер?')) {
                banners.splice(idx, 1);
                await saveToCloudStorage('bv_banners', banners);
                renderBannersAdmin();
                showNotification('Банер видалено');
            }
        };

        // ==========================================
        // ЕКСКЛЮЗИВ (ЕТАПИ ТА МАТЕРІАЛИ)
        // ==========================================
        window.renderExclusiveProcessAdmin = function() {
            const cont = document.getElementById('exclusiveProcessList');
            if (!cont) return;
            if (!exclusiveProcess || exclusiveProcess.length === 0) {
                cont.innerHTML = '<div class="text-xs text-gray-500 py-4 text-center">Етапи ще не додані.</div>';
                return;
            }
            cont.innerHTML = exclusiveProcess.map((step, idx) => `
                <div class="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                        ${step.img ? `<img src="${step.img}" class="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0">` : `<div class="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-[#c5a059] font-bold shrink-0">${idx+1}</div>`}
                        <div class="min-w-0">
                            <div class="font-bold text-sm text-white truncate">${step.title || 'Етап ' + (idx+1)}</div>
                            <div class="text-[11px] text-gray-400 truncate">${step.desc || ''}</div>
                        </div>
                    </div>
                    <div class="flex gap-2 shrink-0">
                        <button onclick="openProcessModal(${idx})" class="btn-secondary text-xs py-1 px-3">Ред</button>
                        <button onclick="deleteProcessStep(${idx})" class="btn-danger text-xs py-1 px-3">Видал</button>
                    </div>
                </div>
            `).join('');
        };

        window.openProcessModal = function(idx = null) {
            document.getElementById('processForm').reset();
            const preview = document.getElementById('processPreview');
            preview.classList.add('hidden');
            preview.src = '';
            
            if (idx !== null) {
                const step = exclusiveProcess[idx];
                document.getElementById('process-id').value = idx;
                document.getElementById('process-title').value = step.title || '';
                document.getElementById('process-desc').value = step.desc || '';
                document.getElementById('process-img').value = step.img || '';
                if (step.img) { preview.src = step.img; preview.classList.remove('hidden'); }
                document.getElementById('processModalTitle').innerText = 'Редагувати етап';
            } else {
                document.getElementById('process-id').value = '';
                document.getElementById('process-img').value = '';
                document.getElementById('processModalTitle').innerText = 'Новий етап';
            }
            document.getElementById('processModal').classList.remove('hidden');
            setTimeout(() => document.getElementById('processModal').classList.remove('opacity-0'), 10);
        };

        window.closeProcessModal = function() {
            document.getElementById('processModal').classList.add('opacity-0');
            setTimeout(() => document.getElementById('processModal').classList.add('hidden'), 300);
        };

        window.saveProcessStep = async function() {
            const idVal = document.getElementById('process-id').value;
            const titleVal = document.getElementById('process-title').value.trim();
            const descVal = document.getElementById('process-desc').value.trim();
            const imgVal = document.getElementById('process-img').value;
            
            if (!titleVal || !descVal) return alert('Заповніть назву та опис етапу!');
            
            const stepData = { title: titleVal, desc: descVal, img: imgVal };
            if (idVal !== '') {
                exclusiveProcess[parseInt(idVal)] = stepData;
            } else {
                exclusiveProcess.push(stepData);
            }
            
            await saveToCloudStorage('bv_exclusive_process', exclusiveProcess);
            renderExclusiveProcessAdmin();
            closeProcessModal();
            showNotification('Етап збережено!');
        };

        window.deleteProcessStep = async function(idx) {
            if (confirm('Видалити цей етап створення?')) {
                exclusiveProcess.splice(idx, 1);
                await saveToCloudStorage('bv_exclusive_process', exclusiveProcess);
                renderExclusiveProcessAdmin();
                showNotification('Етап видалено');
            }
        };

        window.renderExclusiveMaterialsAdmin = function() {
            const cont = document.getElementById('exclusiveMaterialsList');
            if (!cont) return;
            if (!exclusiveMaterials || exclusiveMaterials.length === 0) {
                cont.innerHTML = '<div class="text-xs text-gray-500 py-4 text-center">Матеріали ще не додані.</div>';
                return;
            }
            cont.innerHTML = exclusiveMaterials.map((mat, idx) => `
                <div class="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                    <div>
                        <div class="font-bold text-sm text-[#c5a059]">${mat.label || mat.name || mat.id}</div>
                        <div class="text-[10px] text-gray-400 font-mono">ID: ${mat.id} ${mat.selected ? ' | ⭐ За замовчуванням' : ''}</div>
                    </div>
                    <div class="flex gap-2 shrink-0">
                        <button onclick="openMaterialModal(${idx})" class="btn-secondary text-xs py-1 px-3">Ред</button>
                        <button onclick="deleteMaterialOption(${idx})" class="btn-danger text-xs py-1 px-3">Видал</button>
                    </div>
                </div>
            `).join('');
        };

        window.openMaterialModal = function(idx = null) {
            document.getElementById('materialForm').reset();
            document.getElementById('material-old-id').value = '';
            
            if (idx !== null) {
                const mat = exclusiveMaterials[idx];
                document.getElementById('material-old-id').value = idx;
                document.getElementById('material-id').value = mat.id || '';
                document.getElementById('material-label').value = mat.label || mat.name || '';
                document.getElementById('material-selected').checked = !!mat.selected;
                document.getElementById('materialModalTitle').innerText = 'Редагувати матеріал';
            } else {
                document.getElementById('material-old-id').value = '';
                document.getElementById('materialModalTitle').innerText = 'Новий матеріал';
            }
            document.getElementById('materialModal').classList.remove('hidden');
            setTimeout(() => document.getElementById('materialModal').classList.remove('opacity-0'), 10);
        };

        window.closeMaterialModal = function() {
            document.getElementById('materialModal').classList.add('opacity-0');
            setTimeout(() => document.getElementById('materialModal').classList.add('hidden'), 300);
        };

        window.saveMaterialOption = async function() {
            const oldIdx = document.getElementById('material-old-id').value;
            const idVal = document.getElementById('material-id').value.trim().toLowerCase();
            const labelVal = document.getElementById('material-label').value.trim();
            const selectedVal = document.getElementById('material-selected').checked;
            
            if (!idVal || !labelVal) return alert('Заповніть ID та текст на кнопці!');
            
            const matData = { id: idVal, label: labelVal, selected: selectedVal };
            if (oldIdx !== '') {
                exclusiveMaterials[parseInt(oldIdx)] = matData;
            } else {
                if (exclusiveMaterials.some(m => m.id === idVal)) return alert('Матеріал з таким ID вже існує!');
                exclusiveMaterials.push(matData);
            }
            
            await saveToCloudStorage('bv_exclusive_materials', exclusiveMaterials);
            renderExclusiveMaterialsAdmin();
            closeMaterialModal();
            showNotification('Матеріал збережено!');
        };

        window.deleteMaterialOption = async function(idx) {
            if (confirm('Видалити цей матеріал?')) {
                exclusiveMaterials.splice(idx, 1);
                await saveToCloudStorage('bv_exclusive_materials', exclusiveMaterials);
                renderExclusiveMaterialsAdmin();
                showNotification('Матеріал видалено');
            }
        };

        // ==========================================
        // КОНСТРУКТОР СТОРІНОК
        // ==========================================
        window.loadPageBuilderForm = function() {
            const pageId = document.getElementById('builder-page-select')?.value || 'home_hero';
            const cont = document.getElementById('builder-form-container');
            if (!cont) return;
            
            const content = pagesContentDB[pageId] || { title: '', subtitle: '', text: '' };
            
            cont.innerHTML = `
                <form onsubmit="event.preventDefault(); savePageContent('${pageId}');" class="space-y-4">
                    <div>
                        <label class="text-[10px] uppercase font-bold text-[#c5a059] block mb-1">Головний заголовок сторінки</label>
                        <input type="text" id="pb-title" class="input-field" value="${content.title || ''}" placeholder="Заголовок">
                    </div>
                    <div>
                        <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1">Підзаголовок / Короткий опис</label>
                        <input type="text" id="pb-subtitle" class="input-field" value="${content.subtitle || ''}" placeholder="Короткий текст під заголовком">
                    </div>
                    <div>
                        <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1">Основний текст / HTML контент</label>
                        <textarea id="pb-text" class="input-field h-48 resize-y font-mono text-xs leading-relaxed" placeholder="Текст сторінки...">${content.text || ''}</textarea>
                    </div>
                    <div class="pt-2 text-right">
                        <button type="submit" class="btn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider">Зберегти сторінку</button>
                    </div>
                </form>
            `;
        };

        window.savePageContent = async function(pageId) {
            if (!pagesContentDB) pagesContentDB = {};
            pagesContentDB[pageId] = {
                title: document.getElementById('pb-title').value.trim(),
                subtitle: document.getElementById('pb-subtitle').value.trim(),
                text: document.getElementById('pb-text').value.trim()
            };
            
            await saveToCloudStorage('bv_pages_content', pagesContentDB);
            showNotification('Контент сторінки успішно збережено!');
        };

        // ==========================================
        // РЕДАКТОР ПРАЙС-ЛИСТА
        // ==========================================
        function renderPriceBuilder() {
            const cont = document.getElementById('priceBuilderContainer');
            if (!cont) return;
            if (!priceListDB || priceListDB.length === 0) {
                cont.innerHTML = '<div class="text-center text-gray-500 text-xs py-8">Прайс-лист порожній. Натисніть "+ Додати категорію".</div>';
                return;
            }
            
            cont.innerHTML = priceListDB.map((cat, catIdx) => `
                <div class="glass-panel p-4 rounded-xl border border-white/10 space-y-4 bg-white/5">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                        <input type="text" value="${cat.category || ''}" onchange="priceListDB[${catIdx}].category = this.value" class="input-field font-bold text-[#c5a059] text-sm w-full sm:w-2/3" placeholder="Назва категорії послуг">
                        <div class="flex gap-2 w-full sm:w-auto justify-end">
                            <button type="button" onclick="addPriceItem(${catIdx})" class="btn-secondary text-xs py-1.5 px-3 border-green-500/30 text-green-400 hover:bg-green-500/10">+ Послуга</button>
                            <button type="button" onclick="deletePriceCategory(${catIdx})" class="btn-danger text-xs py-1.5 px-3">Видалити категорію</button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        ${(cat.items || []).map((item, itemIdx) => `
                            <div class="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
                                <input type="text" value="${item.name || ''}" onchange="priceListDB[${catIdx}].items[${itemIdx}].name = this.value" class="input-field text-xs flex-grow" placeholder="Назва послуги">
                                <div class="flex gap-2 items-center">
                                    <input type="text" value="${item.price || ''}" onchange="priceListDB[${catIdx}].items[${itemIdx}].price = this.value" class="input-field text-xs w-32 text-[#c5a059] font-bold text-center" placeholder="Ціна (напр: від 500 ₴)">
                                    <button type="button" onclick="deletePriceItem(${catIdx}, ${itemIdx})" class="text-red-400 hover:text-red-300 p-2 bg-red-500/10 rounded-lg shrink-0">&times;</button>
                                </div>
                            </div>
                        `).join('') || '<div class="text-[11px] text-gray-500 italic pl-2">Послуг у цій категорії немає.</div>'}
                    </div>
                </div>
            `).join('');
        }

        window.addPriceItem = function(catIdx) {
            if (!priceListDB[catIdx].items) priceListDB[catIdx].items = [];
            priceListDB[catIdx].items.push({ name: 'Нова послуга', price: 'від 0 ₴' });
            renderPriceBuilder();
        };

        window.deletePriceItem = function(catIdx, itemIdx) {
            priceListDB[catIdx].items.splice(itemIdx, 1);
            renderPriceBuilder();
        };

        window.deletePriceCategory = function(catIdx) {
            if (confirm('Видалити цю категорію прайс-листа?')) {
                priceListDB.splice(catIdx, 1);
                renderPriceBuilder();
            }
        };

        document.getElementById('btnAddPriceCategory')?.addEventListener('click', () => {
            if (!priceListDB) priceListDB = [];
            priceListDB.push({ category: 'Нова категорія', items: [{ name: 'Стандартна послуга', price: 'від 100 ₴' }] });
            renderPriceBuilder();
        });

        document.getElementById('btnSavePriceList')?.addEventListener('click', async () => {
            const priceEditor = document.getElementById('price-json-editor');
            if (priceEditor) priceEditor.value = JSON.stringify(priceListDB, null, 4);
            await saveToCloudStorage('bv_price_list', priceListDB);
            showNotification('Прайс-лист збережено!');
        });

        // ==========================================
        // НАЛАШТУВАННЯ ТА АДРЕСИ ФІЛІАЛІВ
        // ==========================================
        function populateSettings() {
            document.getElementById('set-gold-rate').value = siteSettings.goldRate || '';
            document.getElementById('set-phone').value = siteSettings.phone || '';
            document.getElementById('set-tg').value = siteSettings.tg || siteSettings.telegram || siteSettings.tgLink || '';
            document.getElementById('set-inst').value = siteSettings.inst || siteSettings.instagram || siteSettings.instLink || '';
            currentAddresses = siteSettings.addresses || [];
            renderAddresses();
        }

        function renderAddresses() {
            const cont = document.getElementById('addressesContainer');
            if (!cont) return;
            if (currentAddresses.length === 0) {
                cont.innerHTML = '<div class="text-[11px] text-gray-500 italic">Жодного філіалу не додано.</div>';
                return;
            }
            cont.innerHTML = currentAddresses.map((addr, idx) => `
                <div class="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/5">
                    <input type="text" value="${addr}" onchange="currentAddresses[${idx}] = this.value" class="input-field text-xs flex-grow" placeholder="Місто, вул. Назва, буд. 1">
                    <button type="button" onclick="currentAddresses.splice(${idx}, 1); renderAddresses();" class="text-red-400 hover:bg-red-500/10 p-2 rounded shrink-0">&times;</button>
                </div>
            `).join('');
        }

        document.getElementById('btnAddAddress')?.addEventListener('click', () => {
            currentAddresses.push('Нова адреса бутіка');
            renderAddresses();
        });

       // Автоматичний перерахунок ВСІХ товарів з типом 'auto' в БД
window.recalculateAutoProducts = async function() {
    const goldRate = parseFloat(siteSettings.goldRate) || 0;
    if (!goldRate) return;

    const updates = [];

    for (let p of products) {
        if (!p.variations) continue;
        let isChanged = false;

        // Перевіряємо всі варіації (базова + розміри)
        for (let vKey in p.variations) {
            const v = p.variations[vKey];
            if (v && v.priceType === 'auto') {
                const weight = parseFloat(v.weight) || 0;
                const workCost = parseFloat(v.workCost) || 0;
                const calculatedPrice = Math.round((weight * goldRate) + workCost);

                if (v.price !== calculatedPrice) {
                    v.price = calculatedPrice;
                    isChanged = true;
                }
            }
        }

        // Якщо ціна варіацій змінилася, оновлюємо кореневу ціну та відправляємо в Supabase
        if (isChanged) {
            const baseVar = p.variations.base;
            if (baseVar && baseVar.priceType === 'auto') {
                p.price = baseVar.price;
            }

            // Додаємо запит оновлення в масив
            updates.push(
                _supabase.from('products').update({
                    price: p.price,
                    variations: p.variations
                }).eq('id', p.id)
            );
        }
    }

    // Відправляємо всі оновлені товари в Supabase паралельно
    if (updates.length > 0) {
        await Promise.all(updates);
        filteredProducts = [...products];
        if (typeof syncProductsToStorefront === 'function') syncProductsToStorefront();
        if (typeof renderProducts === 'function') renderProducts();
    }
};

// Збереження налаштувань сайту
window.saveSiteSettings = async function() {
    const btn = document.getElementById('btnSaveSettings');
    if (btn) { btn.innerText = 'Зберігаю...'; btn.disabled = true; }

    try {
        siteSettings.goldRate = Number(document.getElementById('set-gold-rate').value) || 0;
        siteSettings.phone = document.getElementById('set-phone').value.trim();
        const tgVal = document.getElementById('set-tg').value.trim();
        const instVal = document.getElementById('set-inst').value.trim();
        // Canonical + legacy aliases so storefront always finds the links
        siteSettings.tg = tgVal;
        siteSettings.telegram = tgVal;
        siteSettings.tgLink = tgVal;
        siteSettings.inst = instVal;
        siteSettings.instagram = instVal;
        siteSettings.instLink = instVal;
        siteSettings.addresses = currentAddresses.filter(a => a && a.trim() !== '');
        
        const ratioVal = document.getElementById('set-banner-ratio')?.value;
        if (ratioVal) siteSettings.bannerRatio = ratioVal;
        
        // 1. Зберігаємо налаштування сайту (Supabase + localStorage + BroadcastChannel)
        await saveToCloudStorage('bv_settings', siteSettings);

        // 2. Масово перераховуємо всі авто-товари за новим курсом
        await recalculateAutoProducts();

        if (typeof showNotification === 'function') {
            showNotification('Налаштування збережено! Ціни авто-товарів оновлено.');
        } else {
            alert('Налаштування збережено! Ціни авто-товарів оновлено.');
        }
    } catch (err) {
        console.error('Помилка збереження налаштувань:', err);
        alert('Помилка: ' + err.message);
    } finally {
        if (btn) { btn.innerText = 'Зберегти налаштування'; btn.disabled = false; }
    }
};

        document.getElementById('btnSaveSettings')?.addEventListener('click', saveSiteSettings);

        // ==========================================
        // ГАЛЕРЕЯ РОБІТ
        // ==========================================
        window.renderGalleryAdmin = function() {
    const cont = document.getElementById('galleryAdminList');
    if (!cont) return;
    if (!galleryItems || galleryItems.length === 0) {
        cont.innerHTML = '<div class="col-span-full text-center text-gray-500 text-xs py-8">У галереї ще немає фотографій.</div>';
        return;
    }
    
    // Зверни увагу: прибрали аргумент idx з map() 
    cont.innerHTML = galleryItems.map((item) => `
        <div class="bg-white/5 p-2 rounded-xl border border-white/10 flex flex-col justify-between group relative overflow-hidden">
            <div class="relative aspect-square rounded-lg overflow-hidden mb-2 bg-black/40">
                <img src="${item.img}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <span class="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md text-[#c5a059] text-[9px] uppercase font-bold rounded">${item.category || 'Загальне'}</span>
            </div>
            <div class="text-[11px] text-gray-300 truncate mb-2 font-medium">${item.desc?.uk || item.desc || ''}</div>
            <div class="flex gap-1.5 border-t border-white/10 pt-2">
                <!-- Змінено: передаємо '${item.id}' в одинарних лапках, бо це текстовий UUID -->
                <button onclick="openGalleryModal('${item.id}')" class="flex-1 btn-secondary text-[10px] py-1">Ред</button>
                <button onclick="deleteGalleryItem('${item.id}')" class="flex-1 btn-danger text-[10px] py-1 font-bold">Видал</button>
            </div>
        </div>
    `).join('');
};

        window.openGalleryModal = function(id = null) {
    document.getElementById('galleryForm').reset();
    const preview = document.getElementById('galPreview');
    preview.classList.add('hidden');
    preview.src = '';
    
    if (id !== null) {
        // Шукаємо фотографію в масиві за її унікальним ID
        const item = galleryItems.find(i => String(i.id) === String(id));
        
        if (item) {
            document.getElementById('gal-id').value = item.id;
            document.getElementById('gal-img').value = item.img || '';
            document.getElementById('gal-category').value = item.category || 'rings';
            document.getElementById('gal-desc-uk').value = item.desc?.uk || (typeof item.desc === 'string' ? item.desc : '') || '';
            document.getElementById('gal-desc-ru').value = item.desc?.ru || (typeof item.desc === 'string' ? item.desc : '') || '';
            document.getElementById('gal-desc-en').value = item.desc?.en || (typeof item.desc === 'string' ? item.desc : '') || '';
            
            if (item.img) { 
                preview.src = item.img; 
                preview.classList.remove('hidden'); 
            }
        }
    } else {
        document.getElementById('gal-id').value = '';
        document.getElementById('gal-img').value = '';
    }
    
    document.getElementById('galleryModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('galleryModal').classList.remove('opacity-0'), 10);
};

        window.closeGalleryModal = function() {
            document.getElementById('galleryModal').classList.add('opacity-0');
            setTimeout(() => document.getElementById('galleryModal').classList.add('hidden'), 300);
        };

       window.saveGalleryItem = async function() {
    const idVal = document.getElementById('gal-id').value;
    const imgVal = document.getElementById('gal-img').value;
    const catVal = document.getElementById('gal-category').value;
    const descUk = document.getElementById('gal-desc-uk').value.trim();
    const descRu = document.getElementById('gal-desc-ru').value.trim();
    const descEn = document.getElementById('gal-desc-en').value.trim();
    
    if (!imgVal) return alert('Будь ласка, завантажте фотографію!');
    
    // Формируем объект данных в соответствии с колонками твоей таблицы gallery
    const dbPayload = {
        image_url: imgVal,
        category: catVal,
        desc_uk: descUk,
        desc_ru: descRu,
        desc_en: descEn,
        // is_published: true, // раскомментируй, если в базе есть колонка публикации
        updated_at: new Date().toISOString()
    };
    
    if (idVal !== '') {
        // Оновлюємо існуючий запис по його унікальному ID
        const { error } = await window._supabase
            .from('gallery')
            .update(dbPayload)
            .eq('id', idVal);
            
        if (error) return alert('Помилка оновлення: ' + error.message);
    } else {
        // Додаємо новий запис (Supabase сам згенерує ID)
        const { error } = await window._supabase
            .from('gallery')
            .insert([dbPayload]);
            
        if (error) return alert('Помилка збереження: ' + error.message);
    }
    
    // Після збереження перезапрошуємо актуальні дані з бази, щоб отримати нові ID
    const { data: galData, error: fetchError } = await window._supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
        
    if (galData && !fetchError) {
        galleryItems = galData.map(item => ({
            id: item.id,
            img: item.image_url,
            category: item.category,
            desc: { uk: item.desc_uk, ru: item.desc_ru, en: item.desc_en }
        }));
    }
    
    renderGalleryAdmin();
    closeGalleryModal();
    showNotification('Фото збережено в Галерею!');
};

        window.deleteGalleryItem = async function(id) {
    if (confirm('Видалити це фото з Галереї?')) {
        // Видаляємо безпосередньо з таблиці gallery в Supabase
        const { error } = await window._supabase
            .from('gallery')
            .delete()
            .eq('id', id);

        if (error) {
            return alert('Помилка видалення: ' + error.message);
        }

        // Очищаємо елемент з локального масиву для миттєвого оновлення інтерфейсу
        galleryItems = galleryItems.filter(item => String(item.id) !== String(id));
        
        renderGalleryAdmin();
        showNotification('Фотографію видалено');
    }
};

        // ==========================================
        // ВИХІД З СИСТЕМИ
        // ==========================================
        window.logout = async function() {
            if (confirm('Ви дійсно хочете вийти з панелі адміністратора?')) {
                await _supabase.auth.signOut();
                window.location.href = 'index.html';
            }
        };


        window.applyAdminSettings = function() {
    // Admin panel itself has no storefront chrome; keep for parity / preview tabs.
    // Storefront uses js/services/site-settings.js (window.applySiteSettings).
    const settings = (typeof API !== 'undefined' && API.get)
        ? (API.get('bv_settings', null) || {})
        : (siteSettings || {});
    const phone = settings.phone || '';
    const tg = settings.tg || settings.telegram || settings.tgLink || '';
    const inst = settings.inst || settings.instagram || settings.instLink || '';
    if (phone) {
        document.querySelectorAll('.header-phone-link, .js-site-phone').forEach(link => {
            link.href = `tel:${String(phone).replace(/[^\d+]/g, '')}`;
        });
        document.querySelectorAll('.header-phone-text, .js-site-phone-text').forEach(span => {
            span.innerText = phone;
        });
    }
    if (tg) document.querySelectorAll('.tg-link, .js-site-tg').forEach(link => { link.href = tg; });
    if (inst) document.querySelectorAll('.inst-link, .js-site-inst').forEach(link => { link.href = inst; });
};








/**
 * Генерирует XML-фид товаров с учетом всех полей БД и загружает его в Supabase Storage.
 * @param {HTMLElement} buttonElement - Кнопка, на которую нажали (для блокировки).
 */
async function generateAndUploadGoogleFeed(buttonElement) {
    if (!buttonElement) return;

    const originalButtonText = buttonElement.innerText;
    buttonElement.disabled = true;
    buttonElement.innerText = 'Генерація фіду...';

    const notify = (msg, isError = false) => {
        if (typeof window.showNotification === 'function') {
            window.showNotification(msg, isError ? 'error' : 'success');
        } else {
            alert(msg);
        }
    };

    try {
        console.log('Начало генерации фида Google Merchant Center...');

        // 1. Загружаем все товары из таблицы products
        const { data: products, error: dbError } = await _supabase
            .from('products')
            .select('*');

        if (dbError) throw new Error(`Помилка отримання товарів: ${dbError.message}`);

        if (!products || products.length === 0) {
            throw new Error('Таблиця products порожня. Немає товарів для додавання у фід.');
        }

        // 2. Начало XML-документа
        const siteUrl = 'https://bv-jewelry.com';
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
    <channel>
        <title>BV Jewelry</title>
        <link>${siteUrl}</link>
        <description>Google Merchant Center Feed</description>`;

        // Helper для безопасной очистки CDATA
        const cleanCdata = (str) => String(str || '').replace(/\]\]>/g, ']]&gt;');

        // Helper для получения локализованного текста
        const getLangText = (val, lang = 'uk') => {
            if (!val) return '';
            if (typeof val === 'string') return val;
            if (typeof val === 'object') return val[lang] || val['ru'] || Object.values(val)[0] || '';
            return String(val);
        };

        // 3. Обрабатываем каждый товар
        products.forEach(p => {
            const id = p.sku || p.id;

            // Обработка названия
            let title = getLangText(p.title || p.name, 'uk') || 'Ювелірний виріб';

            // Разбор вариаций (если есть)
            let varObj = p.variations;
            if (typeof varObj === 'string') {
                try { varObj = JSON.parse(varObj); } catch (e) { varObj = null; }
            }

            // Обработка описания
            let rawDesc = getLangText(p.description || p.desc || p.details, 'uk') || 'Ювелірний виріб високої якості';
            let extraDetails = [];

            if (p.stones && p.stones !== 'EMPTY') {
                extraDetails.push(`Вставки: ${p.stones}`);
            }
            if (p.material) {
                extraDetails.push(`Матеріал: ${p.material}`);
            }

            if (extraDetails.length > 0) {
                rawDesc += ` | ${extraDetails.join(', ')}`;
            }

            const link = `${siteUrl}/product.html?id=${p.id}`;

            // Поиск картинки (img -> variations -> base -> first available)
            let imageLink = `${siteUrl}/placeholder.jpg`;

            if (p.img && typeof p.img === 'string' && p.img.startsWith('http')) {
                imageLink = p.img;
            } else if (varObj && typeof varObj === 'object') {
                if (varObj.base && Array.isArray(varObj.base.images) && varObj.base.images.length > 0) {
                    imageLink = varObj.base.images[0];
                } else {
                    for (let key in varObj) {
                        if (varObj[key] && Array.isArray(varObj[key].images) && varObj[key].images.length > 0) {
                            imageLink = varObj[key].images[0];
                            break;
                        }
                    }
                }
            }

            const brand = p.brand || 'BV Jewelry';

            // Цена (проверяем p.price, затем variations.base.price)
            let rawPrice = p.price;
            if ((!rawPrice || rawPrice == 0) && varObj?.base?.price) {
                rawPrice = varObj.base.price;
            }
            const price = parseFloat(rawPrice || 0).toFixed(2);

            // Определение категории
            let category = 'Ювелірні вироби';
            
            // Если в проекте есть массив categories, пробуем найти родителя и дочку
            if (typeof categories !== 'undefined' && Array.isArray(categories)) {
                const currentCat = categories.find(c => c.id === p.category);
                if (currentCat) {
                    const parentCat = categories.find(c => c.id === currentCat.parentId);
                    const currentName = getLangText(currentCat.name, 'uk');
                    if (parentCat) {
                        const parentName = getLangText(parentCat.name, 'uk');
                        category = `Ювелірні вироби > ${parentName} > ${currentName}`;
                    } else {
                        category = `Ювелірні вироби > ${currentName}`;
                    }
                }
            } else {
                // Фолбэк-логика по ключевым словам
                const dbCat = (p.category || '').toLowerCase();
                const lowerTitle = title.toLowerCase();

                if (lowerTitle.includes('каблучк') || lowerTitle.includes('кольц') || dbCat.includes('ring')) {
                    category = 'Ювелірні вироби > Каблучки';
                } else if (lowerTitle.includes('браслет') || dbCat.includes('bracelet')) {
                    category = 'Ювелірні вироби > Браслети';
                } else if (lowerTitle.includes('ланцюг') || lowerTitle.includes('цеп') || dbCat.includes('chain')) {
                    category = 'Ювелірні вироби > Ланцюжки';
                } else if (lowerTitle.includes('сережк') || lowerTitle.includes('серьг') || dbCat.includes('earring')) {
                    category = 'Ювелірні вироби > Сережки';
                } else if (p.category && !dbCat.startsWith('{') && dbCat !== 'empty') {
                    category = `Ювелірні вироби > ${p.category}`;
                }
            }

            // Статус наличия
            let googleAvailability = 'in_stock';
            const dbStatus = (p.status || '').toLowerCase();
            if (dbStatus.includes('pre-order') || dbStatus.includes('предзаказ') || dbStatus.includes('під замовлення')) {
                googleAvailability = 'preorder';
            } else if (dbStatus.includes('out') || dbStatus.includes('немає')) {
                googleAvailability = 'out_of_stock';
            }

            xml += `
        <item>
            <g:id>${id}</g:id>
            <g:title><![CDATA[${cleanCdata(title)}]]></g:title>
            <g:description><![CDATA[${cleanCdata(rawDesc)}]]></g:description>
            <g:link>${link}</g:link>
            <g:image_link>${imageLink}</g:image_link>
            <g:brand><![CDATA[${cleanCdata(brand)}]]></g:brand>
            <g:condition>new</g:condition>
            <g:availability>${googleAvailability}</g:availability>
            <g:price>${price} UAH</g:price>
            <g:product_type><![CDATA[${cleanCdata(category)}]]></g:product_type>
        </item>`;
        });

        xml += `
    </channel>
</rss>`;

        // 4. Загрузка в Supabase Storage с UTF-8 BOM
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, xml], { type: 'application/xml;charset=utf-8;' });
        const fileName = 'google-feed.xml';

        const { error: uploadError } = await _supabase
            .storage
            .from('feeds')
            .upload(fileName, blob, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) throw new Error(`Помилка завантаження у Storage: ${uploadError.message}`);

        const { data: publicUrlData } = _supabase
            .storage
            .from('feeds')
            .getPublicUrl(fileName);

        const feedUrl = publicUrlData.publicUrl;

        // Заполняем input в админке
        const feedInput = document.getElementById('feedUrlInput');
        if (feedInput) {
            feedInput.value = feedUrl;
        }

        console.log(`Фід успішно створено: ${feedUrl}`);
        notify('Фід успішно сгенеровано та оновлено!');

    } catch (error) {
        console.error('Помилка генерації фіду:', error);
        notify(`Сталася помилка: ${error.message}`, true);
    } finally {
        buttonElement.disabled = false;
        buttonElement.innerText = originalButtonText;
    }
}

/**
 * Улучшенная функция копирования ссылки с анимацией состояния
 */
function copyFeedUrl() {
    const inputElement = document.getElementById('feedUrlInput');
    const copyBtn = document.getElementById('copyFeedBtn');

    if (!inputElement || !inputElement.value || inputElement.value.startsWith('Нажмите') || inputElement.value.startsWith('Натисніть')) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('Спочатку згенеруйте фід!', 'error');
        } else {
            alert('Спочатку згенеруйте фід!');
        }
        return;
    }

    navigator.clipboard.writeText(inputElement.value).then(() => {
        if (!copyBtn) return;

        const originalHTML = copyBtn.innerHTML;

        copyBtn.innerHTML = `
            <svg class="w-4 h-4 text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-[#c5a059]">Скопійовано!</span>
        `;
        copyBtn.classList.add('border-[#c5a059]');

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.classList.remove('border-[#c5a059]');
        }, 2000);
    }).catch(err => {
        console.error('Помилка копіювання: ', err);
        alert('Не вдалося скопіювати посилання');
    });
}

/**
 * Копирует изображения (и массив картинок) из текущей активной вкладки варіації на все остальные варіації товара.
 */
function copyImagesToAllVariations() {
    // Предполагаем, что у вас в глобальной переменной или объекте редактора хранится текущий объект товара/форма
    if (typeof currentProductEditing === 'undefined' || !currentProductEditing.variations) {
        // Если структура иная, считываем картинки прямо из инпутов текущей активной вкладки
        const activeVarKey = window.activeVariationKey || 'base';
        const imgInput = document.querySelector(`[data-var-field="${activeVarKey}-img"]`) || document.getElementById('prod-img-input');
        
        if (!imgInput || !imgInput.value) {
            alert('В текущей вкладке нет изображений для копирования!');
            return;
        }

        const sourceImageUrl = imgInput.value.trim();
        
        // Находим все инпуты картинок во всех варіаціях и прописываем туда же
        const allImgInputs = document.querySelectorAll('.variation-img-input');
        allImgInputs.forEach(input => {
            input.value = sourceImageUrl;
            // Триггерим событие input/change чтобы обновился стейт в JS
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        alert('Фотографии успешно скопированы на все размеры/варіації!');
        return;
    }

    // Если работаете через JS-модель данных:
    const activeVar = window.activeVariationKey || Object.keys(currentProductEditing.variations)[0];
    if (!activeVar || !currentProductEditing.variations[activeVar]) return;

    const sourceImages = currentProductEditing.variations[activeVar].images || [currentProductEditing.variations[activeVar].img];

    for (let key in currentProductEditing.variations) {
        if (currentProductEditing.variations.hasOwnProperty(key)) {
            currentProductEditing.variations[key].images = [...sourceImages];
            if (sourceImages.length > 0) {
                currentProductEditing.variations[key].img = sourceImages[0];
            }
        }
    }

    // Перерисовываем вкладки варіацій в модалке, если у вас есть такая функция
    if (typeof renderVariationTabs === 'function') {
        renderVariationTabs();
    }
    
    alert('Изображения успешно скопированы на все размеры!');
}


function generateGoogleFeed() {
    // Отримуємо базовий URL (або поточний хост за замовчуванням)
    const baseUrlInput = document.getElementById('feed-base-url').value.trim();
    const baseUrl = baseUrlInput || window.location.origin;
    const currency = document.getElementById('feed-currency').value;
    
    // Припускаємо, що масив товарів зберігається у змінній products (або адаптуйте під ваше сховище, напр. localStorage)
    const allProducts = window.products || JSON.parse(localStorage.getItem('bv_products') || '[]');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>BV Jewelry Feed</title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description>Google Merchant Catalog Feed for BV Jewelry</description>\n`;

    allProducts.forEach(item => {
        const itemId = item.id || item.sku || Math.random().toString(36).substring(2, 9);
        const title = escapeXml(item.title || item.name || 'Ювелірний виріб');
        const description = escapeXml(item.description || item.title || 'Ексклюзивні ювелірні прикраси');
        const link = `${baseUrl}/product.html?id=${itemId}`;
        const imageLink = item.image || item.photo || '';
        const price = `${parseFloat(item.price || 0).toFixed(2)} ${currency}`;
        const availability = (item.inStock !== false) ? 'in_stock' : 'out_of_stock';
        const category = escapeXml(item.category || 'Apparel & Accessories > Jewelry');

        xml += `    <item>\n`;
        xml += `      <g:id>${itemId}</g:id>\n`;
        xml += `      <g:title>${title}</g:title>\n`;
        xml += `      <g:description>${description}</g:description>\n`;
        xml += `      <g:link>${link}</g:link>\n`;
        xml += `      <g:image_link>${imageLink}</g:image_link>\n`;
        xml += `      <g:brand>BV Jewelry</g:brand>\n`;
        xml += `      <g:condition>new</g:condition>\n`;
        xml += `      <g:availability>${availability}</g:availability>\n`;
        xml += `      <g:price>${price}</g:price>\n`;
        xml += `      <g:product_type>${category}</g:product_type>\n`;
        xml += `    </item>\n`;
    });

    xml += `  </channel>\n`;
    xml += `</rss>`;

    // Виводимо у textarea для попереднього перегляду
    document.getElementById('feed-preview').value = xml;
    document.getElementById('feed-stats').innerText = `Всього товарів у фіді: ${allProducts.length}`;

    // Автоматичне створення та завантаження файлу
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'google-merchant-feed.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof showToast === 'function') {
        showToast('Фід успішно згенеровано та завантажено!');
    }
}

// Допоміжна функція для екранування спецсимволів XML
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}



window.downloadGoogleFeed = function() {
    showNotification('Генерація XML фіду...');
    
    // URL твоего магазина (нужно будет заменить на актуальный домен)
    const siteUrl = 'https://bv-jewelry.com'; 
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
    <title>BV Jewelry</title>
    <link>${siteUrl}</link>
    <description>Товарний фід BV Jewelry</description>\n`;
    
    // Фильтруем только активные товары, если нужно (тут берем все)
    products.forEach(p => {
        const title = (p.variations.base.name.uk || 'Товар').replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const desc = (p.variations.base.desc.uk || title).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const link = `${siteUrl}/product.html?id=${p.id}`;
        const image = p.variations.base.images[0] || '';
        const price = p.variations.base.price || 0;
        const availability = p.status === 'in-stock' ? 'in_stock' : (p.status === 'pre-order' ? 'preorder' : 'out_of_stock');
        
        xml += `    <item>
        <g:id>${p.sku || p.id}</g:id>
        <g:title>${title}</g:title>
        <g:description>${desc}</g:description>
        <g:link>${link}</g:link>
        <g:image_link>${image}</g:image_link>
        <g:condition>new</g:condition>
        <g:availability>${availability}</g:availability>
        <g:price>${price} UAH</g:price>
        <g:brand>BV Jewelry</g:brand>
    </item>\n`;
    });
    
    xml += `</channel>\n</rss>`;
    
    // Создаем Blob объект и триггерим загрузку
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bv_merchant_feed_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setTimeout(() => showNotification('Фід успішно завантажено!'), 500);
};

async function buildSitemapFromSupabase() {
    const { generateSitemapXml } = await import('../services/sitemap-builder.js');
    return generateSitemapXml({
        supabaseUrl: supabaseUrl || 'https://trcjsnvcdonlzxprgdzd.supabase.co',
        supabaseKey: supabaseKey || 'sb_publishable_qSUZxk_9JV9wJNrdjAqeLA_8O_8-TVV',
    });
}

window.downloadSitemap = async function () {
    showNotification('Генерація sitemap.xml...');
    try {
        const { xml, urlCount } = await buildSitemapFromSupabase();
        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification(`Sitemap завантажено (${urlCount} URL)`);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        showNotification(`Помилка sitemap: ${error.message}`, 'error');
    }
};

async function generateAndUploadSitemap(buttonElement) {
    if (!buttonElement || !_supabase) return;

    const originalButtonText = buttonElement.innerText;
    buttonElement.disabled = true;
    buttonElement.innerText = 'Публікація...';

    const notify = (msg, isError = false) => {
        if (typeof window.showNotification === 'function') {
            window.showNotification(msg, isError ? 'error' : 'success');
        } else {
            alert(msg);
        }
    };

    try {
        const { xml, urlCount } = await buildSitemapFromSupabase();
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, xml], { type: 'application/xml;charset=utf-8;' });
        const fileName = 'sitemap.xml';

        const { error: uploadError } = await _supabase.storage.from('feeds').upload(fileName, blob, {
            cacheControl: '3600',
            upsert: true,
        });

        if (uploadError) throw new Error(`Помилка завантаження у Storage: ${uploadError.message}`);

        const { data: publicUrlData } = _supabase.storage.from('feeds').getPublicUrl(fileName);
        const sitemapUrl = publicUrlData.publicUrl;

        const sitemapInput = document.getElementById('sitemapUrlInput');
        if (sitemapInput) sitemapInput.value = sitemapUrl;

        notify(`Sitemap опубліковано (${urlCount} URL)`);
    } catch (error) {
        console.error('Sitemap upload error:', error);
        notify(`Сталася помилка: ${error.message}`, true);
    } finally {
        buttonElement.disabled = false;
        buttonElement.innerText = originalButtonText;
    }
}

function copySitemapUrl() {
    const inputElement = document.getElementById('sitemapUrlInput');
    const copyBtn = document.getElementById('copySitemapBtn');

    if (!inputElement?.value) {
        showNotification('Спочатку опублікуйте sitemap!', 'error');
        return;
    }

    navigator.clipboard.writeText(inputElement.value).then(() => {
        if (!copyBtn) return;
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="text-[#c5a059]">Скопійовано!</span>';
        setTimeout(() => { copyBtn.innerHTML = originalHTML; }, 2000);
    });
}

// Explicit window bridge for HTML onclick handlers that call bare function decls
// (classic script already exposes them as globals; this keeps window.* lookups safe).
window.copyImagesToAllVariations = copyImagesToAllVariations;
window.renderAddresses = renderAddresses;
window.showNotification = showNotification;
window.generateAndUploadGoogleFeed = generateAndUploadGoogleFeed;
window.copyFeedUrl = copyFeedUrl;
window.generateGoogleFeed = generateGoogleFeed;
window.generateAndUploadSitemap = generateAndUploadSitemap;
window.copySitemapUrl = copySitemapUrl;
