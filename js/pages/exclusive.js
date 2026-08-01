/**
 * Page script extracted from exclusive.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

// Захист від повторного оголошення змінних Supabase на сторінці
    if (typeof window.supabaseUrl === 'undefined') {
        window.supabaseUrl = 'https://trcjsnvcdonlzxprgdzd.supabase.co';
    }
    if (typeof window.supabaseKey === 'undefined') {
        window.supabaseKey = 'sb_publishable_qSUZxk_9JV9wJNrdjAqeLA_8O_8-TVV';
    }
    if (typeof window.supabaseClient === 'undefined') {
        window.supabaseClient = supabase.createClient(window.supabaseUrl, window.supabaseKey);
    }

    let selectedMaterial = '';

    // Оновлення імені файлу в формі
    window.updateFileName = function(input) {
        const display = document.getElementById('fileNameDisplay');
        if (display) {
            if (input.files && input.files.length > 0) {
                display.innerText = input.files[0].name;
                display.classList.add('text-[var(--gold-muted)]');
            } else {
                display.innerText = 'Натисніть або перетягніть файл сюди';
                display.classList.remove('text-[var(--gold-muted)]');
            }
        }
    };

    // Функція перемикання матеріалів
    window.selectMaterial = function(id, btnElement) {
        selectedMaterial = id;
        document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('active'));
        if (btnElement) btnElement.classList.add('active');
    };

    // Робоча функція відправки замовлення
    window.submitExclusiveOrder = async function(event) {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }
        
        const form = (event && event.target) || document.getElementById('exclusiveForm');
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        
        const originalBtnText = submitBtn ? submitBtn.innerText : 'Відправити';
        if (submitBtn) { 
            submitBtn.innerText = 'Відправка...'; 
            submitBtn.disabled = true; 
        }

        try {
            const nameInput = document.getElementById('exc-client-name') || document.getElementById('exName');
            const phoneInput = document.getElementById('exc-client-phone') || document.getElementById('exContact');
            const commentInput = document.getElementById('exc-client-comment') || document.getElementById('exDesc');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const comment = commentInput ? commentInput.value.trim() : '';
            const fileInput = document.getElementById('exc-file-input');
            
            if (!name || !phone) {
                alert('Будь ласка, вкажіть ваше ім\'я та номер телефону!');
                return;
            }

            let selectedPreferences = Array.from(document.querySelectorAll('.exc-pref-btn.active, input[name="exc-pref"]:checked'))
                .map(el => el.dataset.value || el.value || el.innerText.trim());

            if (selectedMaterial && !selectedPreferences.includes(selectedMaterial)) {
                selectedPreferences.push(selectedMaterial);
            }

            // Завантаження фото в Supabase Storage (якщо є)
            let customPhotoUrl = null;
            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `exclusive_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
                const filePath = `exclusive_orders/${fileName}`;

                const { error: uploadError } = await window.supabaseClient.storage
                    .from('site-images')
                    .upload(filePath, file, { cacheControl: '3600', upsert: false });

                if (uploadError) {
                    throw new Error('Помилка завантаження фото: ' + uploadError.message);
                }

                const { data: publicUrlData } = window.supabaseClient.storage
                    .from('site-images')
                    .getPublicUrl(filePath);
                    
                customPhotoUrl = publicUrlData.publicUrl;
            }

            // Формуємо загальний коментар
            let fullComment = `Клієнт: ${name}\nТелефон: ${phone}`;
            if (selectedPreferences.length > 0) {
                fullComment += `\nВподобання/Матеріали: ${selectedPreferences.join(', ')}`;
            }
            if (comment) {
                fullComment += `\nКоментар: ${comment}`;
            }
            if (customPhotoUrl) {
                fullComment += `\nФото-референс: ${customPhotoUrl}`;
            }

            // Передаємо обов'язкове поле items, щоб задовольнити вимоги бази даних
            const newOrder = {
                comment: fullComment,
                total_price: 0,
                status: 'new',
                items: [
                    {
                        title: 'Індивідуальне замовлення',
                        preferences: selectedPreferences,
                        photo: customPhotoUrl,
                        client_name: name,
                        phone: phone,
                        note: comment
                    }
                ]
            };

            const { error: dbError } = await window.supabaseClient.from('orders').insert([newOrder]);
            if (dbError) {
                throw new Error('Помилка створення замовлення: ' + dbError.message);
            }

            alert('Ваше індивідуальне замовлення успішно прийнято! Ми зв\'яжемося з вами найближчим часом.');
            
            if (form) form.reset();
            
            selectedMaterial = '';
            document.querySelectorAll('.exc-pref-btn.active, .choice-btn').forEach(b => b.classList.remove('active'));
            const previewEl = document.getElementById('exc-photo-preview');
            if (previewEl) previewEl.classList.add('hidden');

            const fileNameDisplay = document.getElementById('fileNameDisplay');
            if (fileNameDisplay) {
                fileNameDisplay.innerText = 'Натисніть або перетягніть файл сюди';
                fileNameDisplay.classList.remove('text-[var(--gold-muted)]');
            }

        } catch (err) {
            console.error(err);
            alert('Сталася помилка: ' + err.message);
        } finally {
            if (submitBtn) { 
                submitBtn.innerText = originalBtnText; 
                submitBtn.disabled = false; 
            }
        }
    };

    // Ініціалізація сторінки: фото етапів і матеріали з bv_exclusive_* (адмінка)
    function renderExclusiveFromStore() {
        if (typeof window.renderExclusivePage === 'function') {
            window.renderExclusivePage();
            return;
        }

        let processData = [];
        try {
            if (typeof window.API !== 'undefined') {
                processData = window.API.get('bv_exclusive_process', []) || [];
            }
        } catch (e) {
            console.warn('window.API недоступний', e);
        }

        if (!processData || processData.length === 0) {
            processData = [
                {
                    img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
                    title: 'Обговорення ідеї',
                    desc: "Ви надсилаєте ескіз, фотографію або просто описуєте прикрасу мрії своїми словами. Наш дизайнер-ювелір зв'язується з вами та затверджує всі дрібниці."
                },
                {
                    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                    title: 'Створення 3D-моделі',
                    desc: 'Ми будуємо високоточну тривимірну комп\'ютерну модель виробу. Ви зможете роздивитися майбутню прикрасу до найменших деталей ще до початку її лиття.'
                },
                {
                    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
                    title: 'Ювелірна магія',
                    desc: 'Втілюємо прикрасу в металі. Майстер виконує ручну доробку, акуратну закріпку коштовного каміння та бездоганне фінальне полірування.'
                }
            ];
        }

        const processContainer = document.getElementById('processListContainer');
        if (processContainer) {
            processContainer.innerHTML = processData.map((step, index) => `
                <div class="process-step flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
                    <div class="process-img-wrap w-full md:w-1/2 order-1 overflow-hidden rounded-[32px] shadow-2xl relative aspect-[4/3] md:aspect-[4/3]">
                        <img src="${step.img || ''}" alt="${step.title || ''}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                        <div class="absolute inset-0 border border-white/10 rounded-[32px] pointer-events-none"></div>
                    </div>
                    <div class="process-text-wrap w-full md:w-1/2 order-2 flex flex-col justify-center px-2 md:px-0">
                        <span class="text-[10px] md:text-xs uppercase tracking-widest text-[var(--gold-muted)] font-bold mb-3 block">Етап 0${index + 1}</span>
                        <h3 class="text-3xl md:text-4xl lg:text-5xl font-serif mb-4 md:mb-6 text-[var(--text-main)]">${step.title || ''}</h3>
                        <p class="text-[var(--text-muted)] font-light leading-relaxed text-sm md:text-base">${step.desc || ''}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        renderExclusiveFromStore();
    });

    window.addEventListener('bv:data-updated', (e) => {
        const key = e.detail && e.detail.key;
        if (!key || key === '*' || key === 'bv_exclusive_process' || key === 'bv_exclusive_materials') {
            renderExclusiveFromStore();
        }
    });
