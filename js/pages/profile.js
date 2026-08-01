/**
 * Page script extracted from profile.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

// Ініціалізація Supabase (тільки читання)
        const sbClient = window.supabase.createClient('https://trcjsnvcdonlzxprgdzd.supabase.co', 'sb_publishable_qSUZxk_9JV9wJNrdjAqeLA_8O_8-TVV');

        document.addEventListener('DOMContentLoaded', async () => {
            try {
                // Перевірка сесії напряму через сервер (жодних локал стореджів)
                const { data: { session }, error } = await sbClient.auth.getSession();
                
                if (!session) {
                    window.location.href = 'index.html';
                    return;
                }

                // Витягуємо профіль юзера
                const { data: profile } = await sbClient.from('profiles').select('*').eq('id', session.user.id).single();
                
                const userObj = {
                    id: session.user.id,
                    username: session.user.email,
                    name: profile?.full_name || session.user.user_metadata?.full_name || '',
                    role: profile?.role || 'client'
                };

                // Відображаємо дані
                renderUserData(userObj);
                
                // Завантажуємо замовлення конкретно цього ID
                loadUserOrders(session.user.id);

                // Обробка форми налаштувань
                document.getElementById('settingsForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const newName = document.getElementById('settingName').value.trim();
                    
                    if (newName) {
                        try {
                            const { error: updateError } = await sbClient.auth.updateUser({
                                data: { full_name: newName }
                            });
                            if (updateError) throw updateError;

                            // Оновлюємо таблицю profiles
                            await sbClient.from('profiles').update({ full_name: newName }).eq('id', session.user.id);

                            userObj.name = newName;
                            renderUserData(userObj);
                            showToast('Дані успішно оновлено!');
                        } catch (err) {
                            alert('Помилка оновлення: ' + err.message);
                        }
                    }
                };

            } catch (err) {
                console.error("Помилка авторизації:", err);
                window.location.href = 'index.html';
            }
        });

        function renderUserData(user) {
            const avatar = user.name ? user.name.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'U');
            
            document.getElementById('userNameDisplay').innerText = user.name || 'Клієнт BV';
            document.getElementById('userEmailDisplay').innerText = user.username;
            document.getElementById('profileAvatar').innerText = avatar;
            
            document.getElementById('settingName').value = user.name || '';
            document.getElementById('settingEmail').value = user.username;

            if (user.role === 'admin') {
                document.getElementById('adminBadge').classList.remove('hidden');
                document.getElementById('adminLink').classList.remove('hidden');
                document.getElementById('adminLink').style.display = 'flex';
            }
        }

        function switchTab(tab) {
            document.querySelectorAll('.profile-tab').forEach(t => {
                t.classList.remove('text-[var(--gold-muted)]', 'border-[var(--gold-muted)]', 'active');
                t.classList.add('text-[var(--text-muted)]');
            });
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            const activeTab = document.getElementById('tab-' + tab);
            activeTab.classList.add('text-[var(--gold-muted)]', 'border-b-2', 'border-[var(--gold-muted)]', 'active');
            activeTab.classList.remove('text-[var(--text-muted)]');
            
            document.getElementById('content-' + tab).classList.remove('hidden');
        }

        const emptyStateHTML = `
            <div class="glass-panel p-16 rounded-[32px] text-center flex flex-col items-center gap-4 bg-[var(--bg-card)] border border-[var(--border)] opacity-60">
                <div class="w-20 h-20 text-[var(--text-muted)] mb-2">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1"><path d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                </div>
                <p class="text-[var(--text-muted)] text-[14px]">У вас поки немає активних замовлень.</p>
                <a href="catalog.html" class="mt-4 px-10 py-4 btn-solid rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--gold-muted)] transition-all active:scale-95 shadow-lg w-auto">Перейти до каталогу</a>
            </div>
        `;

        async function loadUserOrders(userId) {
            try {
                const { data: orders, error } = await sbClient
                    .from('orders')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                renderClientOrders(orders);
            } catch (err) {
                console.error("Помилка завантаження замовлень:", err);
            }
        }

        function renderClientOrders(orders) {
            const container = document.getElementById('ordersList');
            
            if (!orders || orders.length === 0) {
                container.innerHTML = emptyStateHTML;
                return;
            }

            container.innerHTML = '';
            
            const statusMap = {
                'pending': '<span class="text-yellow-500">Очікує підтвердження ⏳</span>',
                'accepted': '<span class="text-blue-500">В обробці ⚙️</span>',
                'shipped': '<span class="text-indigo-500">Відправлено 🚚</span>',
                'completed': '<span class="text-green-500">Виконано ✅</span>',
                'cancelled': '<span class="text-[var(--danger)]">Скасовано ❌</span>'
            };

            orders.forEach(o => {
                const date = new Date(o.created_at).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                const itemsHtml = o.items.map(i => `<div class="text-[12px] text-[var(--text-muted)]">${i.name || i.title} x${i.qty}</div>`).join('');
                const statusHtml = statusMap[o.status] || o.status;
                const paymentText = o.payment_method === 'card' ? 'Оплата карткою' : 'Накладений платіж';

                container.innerHTML += `
                    <div class="glass-panel p-6 rounded-[24px] bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative animate-fade-in">
                        <button onclick="deleteOrderHistory(${o.id})" class="absolute top-4 right-4 md:top-auto md:bottom-4 md:right-6 text-[var(--danger)] opacity-60 hover:opacity-100 text-[10px] uppercase font-bold tracking-wider hover:underline transition-opacity btn-cross bg-transparent">Видалити історію</button>
                        
                        <div class="flex flex-col gap-1 w-full md:w-1/3">
                            <span class="font-bold text-[var(--gold-muted)] text-lg">Замовлення #${o.id}</span>
                            <span class="text-[10px] text-[var(--text-muted)]">${date}</span>
                            <div class="mt-2 text-sm font-medium">${statusHtml}</div>
                        </div>

                        <div class="flex flex-col gap-1 w-full md:w-1/3 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6">
                            <span class="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Товари:</span>
                            ${itemsHtml}
                        </div>

                        <div class="flex flex-col gap-1 w-full md:w-1/3 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6 text-left md:text-right">
                            <span class="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Сума:</span>
                            <span class="font-bold text-[var(--text-main)] text-xl">${o.total_price} ₴</span>
                            <span class="text-[10px] text-[var(--text-muted)] mt-1">${paymentText}</span>
                        </div>
                    </div>
                `;
            });
        }

        window.deleteOrderHistory = async function(orderId) {
            if(confirm("Ви дійсно хочете видалити це замовлення зі своєї історії?")) {
                const { error } = await sbClient.from('orders').delete().eq('id', orderId);
                if (error) {
                    alert('Помилка видалення: ' + error.message);
                } else {
                    showToast('Замовлення видалено з історії');
                    const { data: { session } } = await sbClient.auth.getSession();
                    if(session) loadUserOrders(session.user.id);
                }
            }
        };

        function showToast(msg) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 bg-[var(--gold-muted)] text-[#111] px-6 py-3 rounded-full font-bold text-sm shadow-xl z-50 animate-fade-in flex items-center justify-center';
            toast.innerText = msg;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translate(-50%, 10px)';
                toast.style.transition = 'all 0.4s ease';
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }
