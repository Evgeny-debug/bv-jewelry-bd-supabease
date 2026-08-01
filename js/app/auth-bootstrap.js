import { API } from '../services/storage.js';
import { _supabase } from '../services/supabase.js';
import { flags, sunSVG, moonSVG, formatterPrice, sunIconSvg, moonIconSvg } from '../utils/constants.js';

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

window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if(modal) { modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 300); }
};

window.toggleAuthMode = function(e) {
    e.preventDefault(); window.isRegisterMode = !window.isRegisterMode; window.updateAuthView();
};

window.updateAuthView = function() {
    document.getElementById('authTitle').innerText = window.isRegisterMode ? 'Реєстрація' : 'Вхід';
    document.getElementById('authSubtitle').innerText = window.isRegisterMode ? 'Приєднуйтесь до світу BV Jewelry' : 'Раді бачити вас знову';
    document.getElementById('authSubmitBtn').innerText = window.isRegisterMode ? 'Створити акаунт' : 'Увійти';
    document.getElementById('authToggleText').innerText = window.isRegisterMode ? 'Вже є акаунт?' : 'Немає акаунта?';
    document.getElementById('authToggleLink').innerText = window.isRegisterMode ? 'Увійти' : 'Зареєструватися';
    
    const nameField = document.getElementById('nameFieldContainer');
    if(nameField) {
        if(window.isRegisterMode) {
            nameField.classList.remove('hidden'); nameField.classList.add('flex'); document.getElementById('authName').required = true;
        } else {
            nameField.classList.add('hidden'); nameField.classList.remove('flex'); document.getElementById('authName').required = false;
        }
    }
};

window.loginWithGoogle = async function() {
    if(!_supabase) return alert('Помилка підключення бази даних.');
    await _supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } });
};

window.loginWithApple = async function() {
    if(!_supabase) return alert('Помилка підключення бази даних.');
    await _supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin + window.location.pathname } });
};

window.updateProfileMenu = function() {
    const user = window.getCurrentUser();
    const dropdownMenu = document.getElementById('profileDropdownMenu');
    const profileBtn = document.getElementById('headerProfileBtn');
    
    if (profileBtn) {
        profileBtn.onclick = function() {
            if (user) location.href = 'profile.html';
            else window.openAuthModal();
        };
    }
    
    if(dropdownMenu) {
        if (user) {
            dropdownMenu.innerHTML = `
                <a href="profile.html" class="dropdown-item w-full text-left font-medium">Мій кабінет</a>
                ${user.role === 'admin' ? '<a href="admin.html" class="dropdown-item w-full text-left font-bold text-[#c5a059]">Панель Адміна</a>' : ''}
                <button onclick="logoutUser()" class="btn-cross dropdown-item w-full text-left text-red-400 hover:text-red-500 mt-2 border-t border-[var(--border)] pt-2">Вийти з акаунту</button>
            `;
        } else {
            dropdownMenu.innerHTML = `
                <button onclick="window.isRegisterMode=false; window.openAuthModal();" class="btn-cross dropdown-item w-full text-left font-medium">Увійти</button>
                <button onclick="window.isRegisterMode=true; window.openAuthModal();" class="btn-cross dropdown-item w-full text-left font-medium text-[#bf0d0d] font-bold">Зареєструватися</button>
            `;
        }
    }
};

window.initRealtime = function() {
    const user = window.getCurrentUser();
    if(!user || !_supabase) return;

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

window.logoutUser = async function() {
    if(_supabase && _supabase.auth) {
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
document.addEventListener('DOMContentLoaded', async () => {
    if(typeof window.injectAuthModal === 'function') window.injectAuthModal();

    const deskSearch = document.querySelector('.search-input.desktop-only') || document.querySelector('.desktop-only .search-input');
    if (deskSearch) { deskSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.executeSearch(e.target.value); }); }
    const overlayInput = document.getElementById('mobSearchOverlayInput');
    if (overlayInput) { overlayInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.executeSearch(e.target.value); }); }

    if(_supabase && window.location.hash && window.location.hash.includes('access_token')) {
        const { data: { session } } = await _supabase.auth.getSession();
        if (session && session.user) {
            const { data: profile } = await _supabase.from('profiles').select('*').eq('id', session.user.id).single();
            const role = (profile && profile.role === 'admin') ? 'admin' : 'client';
            const fullName = (profile && profile.full_name) ? profile.full_name : (session.user.user_metadata?.full_name || 'Клієнт');
            const userFavs = profile && profile.favs ? profile.favs : [];

            API.set('bv_current_user', { id: session.user.id, username: session.user.email, role: role, name: fullName, favs: userFavs });
            if (role === 'admin') sessionStorage.setItem('isAdminAuth', 'true');
            API.set(window.getScopedStorageKey('bv_favs'), userFavs);
            
            history.replaceState(null, null, ' ');
            window.updateProfileMenu();
            if(typeof window.renderFavDrawer === 'function') window.renderFavDrawer();
        }
    }

    const authForm = document.getElementById('authForm');
    if(authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(!_supabase) return alert("Помилка бази даних: підключення відсутнє.");

            const submitBtn = document.getElementById('authSubmitBtn');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Зачекайте...';
            submitBtn.disabled = true;

            const email = document.getElementById('authUser').value.trim();
            const pass = document.getElementById('authPass').value.trim();
            const name = document.getElementById('authName') ? document.getElementById('authName').value.trim() : '';

            if (window.isRegisterMode) {
                if (pass.length < 6) { 
                    alert('Пароль має містити мінімум 6 символів.'); 
                    submitBtn.innerText = originalText; submitBtn.disabled = false; return; 
                }
                const { data, error } = await _supabase.auth.signUp({
                    email: email, password: pass, options: { data: { full_name: name } }
                });

                if (error) {
                    alert('Помилка реєстрації: ' + error.message);
                } else {
                    if(data.user) {
                        await _supabase.from('profiles').insert([
                            { id: data.user.id, full_name: name, role: 'client', favs: [] }
                        ]);
                    }
                    alert('Реєстрація успішна! Тепер ви можете увійти.');
                    window.isRegisterMode = false;
                    window.updateAuthView();
                }
            } else {
                const { data, error } = await _supabase.auth.signInWithPassword({ email: email, password: pass });

                if (error) {
                    alert('Невірний логін або пароль!');
                    submitBtn.innerText = originalText; submitBtn.disabled = false; return;
                }

                const { data: profile } = await _supabase.from('profiles').select('*').eq('id', data.user.id).single();
                const role = (profile && profile.role === 'admin') ? 'admin' : 'client';
                const fullName = (profile && profile.full_name) ? profile.full_name : (data.user.user_metadata?.full_name || 'Клієнт');
                const userFavs = profile && profile.favs ? profile.favs : [];

                API.set('bv_current_user', { id: data.user.id, username: data.user.email, role: role, name: fullName, favs: userFavs });
                if (role === 'admin') sessionStorage.setItem('isAdminAuth', 'true');
                API.set(window.getScopedStorageKey('bv_favs'), userFavs);
                
                window.closeAuthModal();
                if(typeof window.updateBadges === 'function') window.updateBadges();
                window.renderFavDrawer();
                window.initRealtime();
                window.updateProfileMenu(); 
            }
            submitBtn.innerText = originalText; submitBtn.disabled = false;
        });
    }
    
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
                catalogWrapper.classList.remove('open'); document.body.classList.remove('menu-open');
            }
        });
    }
});

window.onload = async () => { 
    if(window.location.pathname.includes('admin.html')) return;

    window.migrateScopedState();
    if(typeof window.injectGlobalUI === 'function') window.injectGlobalUI();
    
    await window.loadCloudData();
    if (typeof window.initCatalogRealtime === 'function') window.initCatalogRealtime();

    if(document.getElementById('marqueeTrack') && typeof window.initMarqueeSim === 'function') window.initMarqueeSim();
    if(document.getElementById('productContainer') && typeof window.renderProductPage === 'function') window.renderProductPage();
    if(document.getElementById('servicesPriceBody') && typeof window.renderServicesTable === 'function') window.renderServicesTable();
    if(document.getElementById('processListContainer') || document.getElementById('exclusive-process-container')) {
        if (typeof window.renderExclusivePage === 'function') window.renderExclusivePage();
    }
    if (typeof window.applySiteSettings === 'function') window.applySiteSettings();

    const savedLang = API.get('bv_lang', 'uk');
    if(typeof window.changeLang === 'function') window.changeLang(savedLang);

    const savedTheme = API.get('bv_theme', 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById('themeIcon'); 
    const iconMob = document.getElementById('themeIconMob');
    const svg = savedTheme === 'light' ? sunSVG : moonSVG;
    if(icon) icon.innerHTML = svg; 
    if(iconMob) iconMob.innerHTML = svg;

    const yearEl = document.getElementById('currentYear');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    if(typeof window.renderCart === 'function') window.renderCart(); 
    if(typeof window.renderFavDrawer === 'function') window.renderFavDrawer();

    const currentUser = API.get('bv_current_user', null);
    if(currentUser || localStorage.getItem('isAdminAuth') === 'true') window.initRealtime();
    
    window.updateProfileMenu(); 

    const burgerBtn = document.getElementById('burger');
    if(burgerBtn) { burgerBtn.onclick = function(e) { e.stopPropagation(); if(typeof window.toggleMenu === 'function') window.toggleMenu(); }; }
};

let lastScrollTop = 0;
let isScrollingUp = false;

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if(header) header.classList.toggle('scrolled', window.scrollY > 50);
    
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    isScrollingUp = currentScroll < lastScrollTop && currentScroll > 400;
    
    const topBtn = document.getElementById('scrollToTopBtn');

    if(isScrollingUp) { 
        if(topBtn) { topBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4'); topBtn.classList.add('opacity-100', 'translate-y-0'); }
    } else {
        if(topBtn) { topBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4'); topBtn.classList.remove('opacity-100', 'translate-y-0'); }
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, { passive: true });

const overlay = document.getElementById('overlay');
const cartOverlay = document.getElementById('cartOverlay');
const favOverlay = document.getElementById('favOverlay');
if(overlay) overlay.onclick = () => { if(typeof window.toggleMenu === 'function') window.toggleMenu(); };
if(cartOverlay) cartOverlay.onclick = () => { if(typeof window.toggleCart === 'function') window.toggleCart(); };
if(favOverlay) favOverlay.onclick = () => { if(typeof window.toggleFavDrawer === 'function') window.toggleFavDrawer(); };
