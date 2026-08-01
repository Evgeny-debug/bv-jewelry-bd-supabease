/**
 * Page script extracted from checkout.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

const NP_API_KEY = 'ea3e6549afc2be5909102726eeafd052'; 
        let allBranches = []; 

        async function fetchNP(model, method, properties) {
            if(!NP_API_KEY) return [];
            try {
                const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        apiKey: NP_API_KEY,
                        modelName: model,
                        calledMethod: method,
                        methodProperties: properties
                    })
                });
                const data = await res.json();
                return data.success ? data.data : [];
            } catch (e) { return []; }
        }

        const cityInput = document.getElementById('orderCity');
        const cityDropdown = document.getElementById('cityDropdown');
        const cityRefInput = document.getElementById('orderCityRef');
        const branchInput = document.getElementById('orderBranch');
        const branchDropdown = document.getElementById('branchDropdown');
        let cityDebounceTimer;

        cityInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(cityDebounceTimer);
            
            branchInput.value = '';
            branchInput.disabled = true;
            branchInput.placeholder = 'Оберіть місто спочатку';
            allBranches = [];

            if (query.length < 2) {
                cityDropdown.classList.add('hidden');
                return;
            }

            cityDebounceTimer = setTimeout(async () => {
                const cities = await fetchNP("Address", "searchSettlements", { CityName: query, Limit: "20" });
                const addresses = cities.length > 0 ? cities[0].Addresses : [];
                
                if (addresses.length > 0) {
                    cityDropdown.innerHTML = addresses.map(c => `
                        <div class="np-dropdown-item" data-ref="${c.DeliveryCity}" data-name="${c.Present}">${c.Present}</div>
                    `).join('');
                    cityDropdown.classList.remove('hidden');
                } else {
                    cityDropdown.innerHTML = '<div class="p-2 text-[10px] text-gray-500">Місто не знайдено</div>';
                    cityDropdown.classList.remove('hidden');
                }
            }, 400); 
        });

        cityDropdown.addEventListener('click', async (e) => {
            if (e.target.classList.contains('np-dropdown-item')) {
                cityInput.value = e.target.getAttribute('data-name');
                cityRefInput.value = e.target.getAttribute('data-ref');
                cityDropdown.classList.add('hidden');

                branchInput.disabled = false;
                branchInput.placeholder = 'Завантаження...';
                branchInput.value = '';
                
                allBranches = await fetchNP("Address", "getWarehouses", { CityRef: cityRefInput.value });
                branchInput.placeholder = 'Введіть номер відділення';
            }
        });

        branchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length === 0) {
                branchDropdown.classList.add('hidden');
                return;
            }
            const filtered = allBranches.filter(b => b.Description.toLowerCase().includes(query) || b.Number === query);
            
            if (filtered.length > 0) {
                branchDropdown.innerHTML = filtered.slice(0, 30).map(b => `
                    <div class="np-dropdown-item" data-name="${b.Description}">${b.Description}</div>
                `).join('');
                branchDropdown.classList.remove('hidden');
            } else {
                branchDropdown.innerHTML = '<div class="p-2 text-[10px] text-gray-500">Не знайдено</div>';
                branchDropdown.classList.remove('hidden');
            }
        });
        
        branchInput.addEventListener('focus', () => {
            if (allBranches.length > 0 && branchInput.value === '') {
                branchDropdown.innerHTML = allBranches.slice(0, 30).map(b => `
                    <div class="np-dropdown-item" data-name="${b.Description}">${b.Description}</div>
                `).join('');
                branchDropdown.classList.remove('hidden');
            }
        });

        branchDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('np-dropdown-item')) {
                branchInput.value = e.target.getAttribute('data-name');
                branchDropdown.classList.add('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target !== cityInput && !cityDropdown.contains(e.target)) cityDropdown.classList.add('hidden');
            if (e.target !== branchInput && !branchDropdown.contains(e.target)) branchDropdown.classList.add('hidden');
        });

        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const cart = typeof window.getCart === 'function' ? window.getCart() : [];
                if (cart.length === 0) {
                    alert('Ваш кошик порожній!');
                    window.location.href = 'index.html';
                    return;
                }

                const listContainer = document.getElementById('checkoutItemsList');
                let total = 0;
                
                listContainer.innerHTML = cart.map(item => {
                    total += item.price * item.qty;
                    const sizeBadge = item.size ? `<span class="text-[9px] text-[var(--gold-muted)] block mt-0.5">Розмір: ${item.size}</span>` : '';
                    return `
                        <div class="flex gap-3 relative group pb-2 border-b border-[var(--glass-border)] last:border-0">
                            <img src="${item.img}" class="w-14 h-14 object-cover border border-[var(--glass-border)]">
                            <div class="flex-grow flex flex-col justify-center">
                                <span class="text-[11px] font-semibold uppercase tracking-wide leading-tight line-clamp-1">${item.title}</span>
                                ${sizeBadge}
                                <div class="flex justify-between items-center mt-1">
                                    <span class="text-[10px] opacity-60">${item.qty} шт.</span>
                                    <span class="text-[11px] font-bold text-[var(--gold-muted)]">${new Intl.NumberFormat('uk-UA').format(item.price * item.qty)} ₴</span>
                                </div>
                            </div>
                            <button class="absolute top-0 right-0 opacity-50 hover:opacity-100 hover:text-red-500 transition-opacity" onclick="window.removeFromCart('${item.cartId}'); location.reload();">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    `;
                }).join('');

                document.getElementById('checkoutTotal').innerText = new Intl.NumberFormat('uk-UA').format(total) + ' ₴';

                const user = typeof window.getCurrentUser === 'function' ? window.getCurrentUser() : null;
                if (user) {
                    document.getElementById('orderEmail').value = user.username || '';
                    document.getElementById('orderName').value = user.name || '';
                }
            }, 500);

            document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if(!NP_API_KEY && (!cityInput.value.trim() || !branchInput.value.trim())) {
                    alert('Будь ласка, введіть місто та відділення Нової Пошти.');
                    return;
                }

                const btn = document.getElementById('submitBtn');
                btn.innerText = 'Обробка...';
                btn.disabled = true;

                const cart = window.getCart();
                const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
                const user = window.getCurrentUser();
                const paymentMethod = document.getElementById('orderPayment').value;
                const deliveryText = `${document.getElementById('orderName').value.trim()}, ${document.getElementById('orderCity').value.trim()}, ${document.getElementById('orderBranch').value.trim()}`;

                const orderData = {
                    user_id: user ? user.id : null,
                    user_email: document.getElementById('orderEmail').value.trim(),
                    phone: document.getElementById('orderPhone').value.trim(),
                    delivery_info: deliveryText, 
                    payment_method: paymentMethod,
                    comment: document.getElementById('orderComment').value.trim(),
                    items: cart, 
                    total_price: total,
                    status: 'pending'
                };

                try {
                    const { error } = await window._supabase.from('orders').insert([orderData]);
                    if (error) throw error;

                    if(typeof clearEntireCart === 'function') { clearEntireCart(true); }

                    document.getElementById('checkoutContainer').classList.add('hidden');
                    const modal = document.getElementById('successModal');
                    modal.classList.remove('hidden');
                    setTimeout(() => modal.classList.remove('opacity-0'), 50);

                } catch (err) {
                    alert('Виникла помилка: ' + err.message);
                    btn.innerText = 'Підтвердити замовлення';
                    btn.disabled = false;
                }
            });
        });
