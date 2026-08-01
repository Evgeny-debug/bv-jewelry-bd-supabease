/**
 * Page script extracted from info.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

const infoPagesDB = {
        'about': {
            uk: {
                title: 'Історія Atelier',
                content: `
                    <p>Atelier BV Jewelry — це не просто бренд, це спадщина, яка передається з покоління в покоління. Ми створюємо прикраси, які стають сімейними реліквіями.</p>
                    <h3>Наші цінності</h3>
                    <p>Кожен виріб виготовляється вручну майстрами з багаторічним досвідом. Ми використовуємо лише сертифіковані дорогоцінні метали та каміння найвищої якості.</p>
                    <ul>
                        <li>Ексклюзивний дизайн та індивідуальний підхід до кожного клієнта.</li>
                        <li>Бездоганна якість матеріалів (золото 585, 750 проби).</li>
                        <li>Використання сучасних технологій у поєднанні з класичним ювелірним мистецтвом.</li>
                    </ul>
                `
            },
            en: {
                title: 'Atelier History',
                content: `
                    <p>Atelier BV Jewelry is not just a brand, it is a heritage passed down through generations. We create jewelry that becomes family heirlooms.</p>
                    <h3>Our Values</h3>
                    <p>Each piece is handcrafted by artisans with years of experience. We use only certified precious metals and the highest quality gemstones.</p>
                    <ul>
                        <li>Exclusive design and individual approach to each client.</li>
                        <li>Impeccable material quality (585, 750 gold standard).</li>
                        <li>Modern technologies combined with classical jewelry craftsmanship.</li>
                    </ul>
                `
            },
            ru: {
                title: 'История Atelier',
                content: `
                    <p>Atelier BV Jewelry — это не просто бренд, это наследие, передающееся из поколения в поколение. Мы создаем украшения, которые становятся семейными реликвиями.</p>
                    <h3>Наши ценности</h3>
                    <p>Каждое изделие изготавливается вручную мастерами с многолетним опытом. Мы используем только сертифицированные драгоценные металлы и камни высочайшего качества.</p>
                    <ul>
                        <li>Эксклюзивный дизайн и индивидуальный подход к каждому клиенту.</li>
                        <li>Безупречное качество материалов (золото 585, 750 пробы).</li>
                        <li>Использование современных технологий в сочетании с классическим ювелирным искусством.</li>
                    </ul>
                `
            }
        },
        'warranty': {
            uk: {
                title: 'Гарантія на продукцію',
                content: `
                    <p>Усі ювелірні вироби BV Jewelry проходять контроль якості товару перед видачею клієнту. Усі дорогоцінні камені супроводжуються сертифікатами авторитетних лабораторій GIA, HRD, IGI та інших.</p>
                    <h3>Що включає безкоштовне обслуговування</h3>
                    <p>Гарантія та безкоштовне обслуговування включають усунення прихованих дефектів, що виникли з вини виробника.</p>
                    <p>Для виконання гарантійного ремонту, заміни або безкоштовного обслуговування клієнту необхідно мати при собі: Товарний чек, паспорт виробу, гарантійний сертифікат. Гарантійне обслуговування здійснюється виключно за наявності чека, бірки, паспорта, сертифіката на ім'я особи, на яку було оформлено виріб.</p>
                    <h3>Умови гарантійного обслуговування</h3>
                    <ul>
                        <li>Ремонт товару здійснюється протягом 10 днів з моменту прийому виробу в ремонт.</li>
                        <li>Покупець погоджується з тим, що всі пошкодження та дефекти, які можуть бути виявлені під час ремонту, виникли до прийняття виробу в ремонт.</li>
                        <li>При механічному пошкодженні (не гарантійний випадок) Ваш виріб може пройти платну послугу термінового ремонту і бути виданий у той самий день. З цінами на наші послуги ви можете ознайомитися в розділі "Послуги".</li>
                    </ul>
                    <h3>Випадки, що не покриваються гарантією</h3>
                    <p>Гарантійні зобов'язання не поширюються на ювелірні вироби, якщо були порушені умови експлуатації, або дефекти виникли внаслідок недбалого використання чи використання не за призначенням:</p>
                    <ul>
                        <li>Ювелірний виріб отримав механічні пошкодження внаслідок навмисних або випадкових дій покупця.</li>
                        <li>Виріб був відремонтований покупцем самостійно або іншим ювеліром. BV Jewelry залишає за собою право не приймати виріб, якщо при огляді будуть виявлені спроби стороннього втручання.</li>
                        <li>Випадіння вставок каменів, перламутру, емалі; прикраси були пошкоджені внаслідок інших зовнішніх впливів: деформація, зміна розміру, чищення інструментами, не призначеними для ювелірних виробів.</li>
                        <li>Виріб не відповідає паспорту чи сертифікату виробу (проба, іменник, вага, розмір). Невідповідність цих факторів свідчить про порушення цілісності виробу, неправильні умови експлуатації і не є гарантійним випадком.</li>
                    </ul>
                `
            },
            en: {
                title: 'Product Warranty',
                content: `
                    <p>All BV Jewelry pieces undergo strict quality control before delivery to the client. All gemstones are accompanied by certificates from reputable laboratories such as GIA, HRD, IGI, and others.</p>
                    <h3>What Free Maintenance Includes</h3>
                    <p>Warranty and free maintenance cover the elimination of hidden defects resulting from manufacturing faults.</p>
                    <p>To perform warranty repair, replacement, or free maintenance, the client must provide: Sales receipt, product passport, warranty certificate. Warranty service is carried out exclusively if the receipt, tag, passport, and certificate are in the name of the person for whom the item was issued.</p>
                    <h3>Warranty Maintenance Terms</h3>
                    <ul>
                        <li>Product repair is carried out within 10 days from the moment of item acceptance.</li>
                        <li>The buyer agrees that all damages and defects discovered during repair occurred prior to acceptance.</li>
                        <li>In case of mechanical damage (non-warranty case), your item can undergo paid urgent repair service and be ready on the same day. You can view our pricing in the "Services" section.</li>
                    </ul>
                    <h3>Cases Not Covered by Warranty</h3>
                    <p>Warranty obligations do not apply to jewelry if operating conditions were violated or defects arose from careless use or misuse:</p>
                    <ul>
                        <li>The jewelry piece received mechanical damage due to intentional or accidental actions of the buyer.</li>
                        <li>The item was repaired independently by the buyer or another jeweler. BV Jewelry reserves the right not to accept the item if signs of external tampering are detected.</li>
                        <li>Loss of stone inserts, mother-of-pearl, enamel; jewelry damaged due to other external impacts: deformation, resizing, cleaning with tools not intended for jewelry.</li>
                        <li>The item does not match the passport or certificate (hallmark, maker's mark, weight, size). Non-compliance indicates a breach of integrity, improper operation, and is not a warranty case.</li>
                    </ul>
                `
            },
            ru: {
                title: 'Гарантия на продукцию',
                content: `
                    <p>Все ювелирные изделия BV Jewelry проходят контроль качества товара перед выдачей клиенту. Все драгоценные камни сопровождаются сертификатами авторитетных лабораторий GIA, HRD, IGI и других.</p>
                    <h3>Что включает бесплатное обслуживание</h3>
                    <p>Гарантия и бесплатное обслуживание включают устранение скрытых дефектов, возникших по вине производителя.</p>
                    <p>Для выполнения гарантийного ремонта, замены или бесплатного обслуживания клиенту необходимо иметь при себе: Товарный чек, паспорт изделия, гарантийный сертификат. Гарантийное обслуживание осуществляется исключительно при наличии чека, бирки, паспорта, сертификата на имя лица, на которое было оформлено изделие.</p>
                    <h3>Условия гарантийного обслуживания</h3>
                    <ul>
                        <li>Ремонт товара осуществляется в течение 10 дней с момента приема изделия в ремонт.</li>
                        <li>Покупатель соглашается с тем, что все повреждения и дефекты, которые могут быть обнаружены во время ремонта, возникли до принятия изделия в ремонт.</li>
                        <li>При механическом повреждении (не гарантийный случай) Ваше изделие может пройти платную услугу срочного ремонты и быть выдано в тот же день. С ценами на наши услуги вы можете ознакомиться в разделе "Услуги".</li>
                    </ul>
                    <h3>Случаи, не покрываемые гарантией</h3>
                    <p>Гарантийные обязательства не распространяются на ювелирные изделия, если были нарушены условия эксплуатации, или дефекты возникли вследствие небрежного использования или использования не по назначению:</p>
                    <ul>
                        <li>Ювелирное изделие получило механические повреждения в результате умышленных или случайных действий покупателя.</li>
                        <li>Изделие было отремонтировано покупателем самостоятельно или другим ювелиром. BV Jewelry оставляет за собой право не принимать изделие, если при осмотре будут обнаружены попытки стороннего вмешательства.</li>
                        <li>Выпадение вставок камней, перламутра, эмали; украшения были повреждены в результате других внешних воздействий: деформация, изменение размера, чистка инструментами, не предназначенными для ювелирных изделий.</li>
                        <li>Изделие не соответствует паспорту или сертификату изделия (проба, именник, вес, размер). Несоответствие этих факторов свидетельствует о нарушении целостности изделия, неправильных условиях эксплуатации и не является гарантийным случаем.</li>
                    </ul>
                `
            }
        },
        'terms': {
            uk: {
                title: 'Оплата, виготовлення та доставка',
                content: `
                    <p>Кожна прикраса створюється індивідуально, з максимальною увагою до деталей та ваших побажань.</p>
                    <h3>Етапи створення та оплата</h3>
                    <ul>
                        <li><b>3D-моделювання:</b> Перед початком фізичного виготовлення ми створюємо точну 3D-модель вашої майбутньої прикраси. Вона відправляється вам на затвердження, щоб ви могли детально оцінити дизайн, пропорції, посадку та фінальний вигляд виробу.</li>
                        <li><b>Повна оплата:</b> Ми працюємо виключно за умови 100% передоплати. Процес створення прикраси у металі запускається тільки після повної оплати замовлення.</li>
                        <li><b>Способи оплата:</b> Онлайн оплата картою (Visa, MasterCard, Apple Pay, Google Pay) або безготівковий розрахунок за реквізитами.</li>
                    </ul>
                    <h3>Доставка</h3>
                    <ul>
                        <li><b>Нова Пошта:</b> Надійна доставка у відділення або кур'єром за адресою.</li>
                        <li><b>Самовивіз:</b> Ви можете забрати своє замовлення безпосередньо з нашого Atelier в м. Ізмаїл.</li>
                    </ul>
                `
            },
            en: {
                title: 'Payment, Production & Shipping',
                content: `
                    <p>Each piece of jewelry is created individually, with maximum attention to detail and your preferences.</p>
                    <h3>Production Stages & Payment</h3>
                    <ul>
                        <li><b>3D Modeling:</b> Before physical production begins, we create an accurate 3D model of your future jewelry. It is sent to you for approval so you can evaluate the design, proportions, fit, and final appearance.</li>
                        <li><b>Full Payment:</b> We operate exclusively on a 100% prepayment basis. The metal crafting process starts only after full payment of the order.</li>
                        <li><b>Payment Methods:</b> Online card payment (Visa, MasterCard, Apple Pay, Google Pay) or bank transfer by details.</li>
                    </ul>
                    <h3>Shipping</h3>
                    <ul>
                        <li><b>Nova Poshta:</b> Reliable delivery to a post office or by courier to your address.</li>
                        <li><b>Pickup:</b> You can pick up your order directly from our Atelier in Izmail.</li>
                    </ul>
                `
            },
            ru: {
                title: 'Оплата, изготовление и доставка',
                content: `
                    <p>Каждое украшение создается индивидуально, с максимальным вниманием к деталям и вашим пожеланиям.</p>
                    <h3>Этапы создания и оплата</h3>
                    <ul>
                        <li><b>3D-моделирование:</b> Перед началом физического изготовления мы создаем точную 3D-модель будущего украшения. Она отправляется вам на утверждение, чтобы вы могли детально оценить дизайн, пропорции, посадку и финальный вид изделия.</li>
                        <li><b>Полная оплата:</b> Мы работаем исключительно на условиях 100% предоплаты. Процесс создания украшения в металле запускается только после полной оплаты заказа.</li>
                        <li><b>Способы оплаты:</b> Онлайн оплата картой (Visa, MasterCard, Apple Pay, Google Pay) или безналичный расчет по реквизитам.</li>
                    </ul>
                    <h3>Доставка</h3>
                    <ul>
                        <li><b>Новая Почта:</b> Надежная доставка в отделение или курьером по адресу.</li>
                        <li><b>Самовывоз:</b> Вы можете забрать свой заказ непосредственно из нашего Atelier в г. Измаил.</li>
                    </ul>
                `
            }
        },
        'reviews': {
            uk: {
                title: 'Відгуки клієнтів',
                content: `
                    <p>Ваша думка — найвища оцінка нашої роботи. Незабаром тут з'явиться можливість залишати та читати відгуки наших клієнтів.</p>
                    <div class="text-center py-12 border border-dashed border-[var(--border)] rounded-2xl bg-[rgba(255,255,255,0.01)] mt-8">
                        <button class="border border-[var(--gold-muted)] text-[var(--gold-muted)] px-8 py-3 rounded-none text-xs uppercase tracking-widest font-bold hover:bg-[var(--gold-muted)] hover:text-[#111] transition-colors" data-i18n="leave_review">Залишити відгук</button>
                    </div>
                `
            },
            en: {
                title: 'Client Reviews',
                content: `
                    <p>Your opinion is the highest rating of our work. Soon you will be able to leave and read reviews from our clients here.</p>
                    <div class="text-center py-12 border border-dashed border-[var(--border)] rounded-2xl bg-[rgba(255,255,255,0.01)] mt-8">
                        <button class="border border-[var(--gold-muted)] text-[var(--gold-muted)] px-8 py-3 rounded-none text-xs uppercase tracking-widest font-bold hover:bg-[var(--gold-muted)] hover:text-[#111] transition-colors" data-i18n="leave_review">Leave a Review</button>
                    </div>
                `
            },
            ru: {
                title: 'Отзывы клиентов',
                content: `
                    <p>Ваше мнение — высшая оценка нашей работы. Скоро здесь появится возможность оставлять и читать отзывы наших клиентов.</p>
                    <div class="text-center py-12 border border-dashed border-[var(--border)] rounded-2xl bg-[rgba(255,255,255,0.01)] mt-8">
                        <button class="border border-[var(--gold-muted)] text-[var(--gold-muted)] px-8 py-3 rounded-none text-xs uppercase tracking-widest font-bold hover:bg-[var(--gold-muted)] hover:text-[#111] transition-colors" data-i18n="leave_review">Оставить отзыв</button>
                    </div>
                `
            }
        }
    };

    window.loadPage = function(pageId) {
        const currentLang = localStorage.getItem('app_lang') || localStorage.getItem('lang') || 'uk';
        const pageObj = infoPagesDB[pageId] ? infoPagesDB[pageId][currentLang] : infoPagesDB['about'][currentLang];
        
        const titleEl = document.getElementById('pageTitle');
        const contentEl = document.getElementById('pageContent');
        
        if(titleEl) titleEl.innerText = pageObj.title;
        if(contentEl) contentEl.innerHTML = pageObj.content;
        
        const url = new URL(window.location);
        url.searchParams.set('p', pageId);
        window.history.pushState({}, '', url);

        document.querySelectorAll('.info-nav-link').forEach(link => {
            link.classList.remove('active', 'text-[var(--gold-muted)]');
            link.classList.add('text-[var(--text-muted)]');
            if(link.getAttribute('data-target') === pageId) {
                link.classList.add('active', 'text-[var(--gold-muted)]');
                link.classList.remove('text-[var(--text-muted)]');
            }
        });

        document.querySelectorAll('.info-tab-mob').forEach(tab => {
            tab.classList.remove('text-[var(--gold-muted)]', 'border-b-2', 'border-[var(--gold-muted)]');
            tab.classList.add('text-[var(--text-muted)]');
            if(tab.getAttribute('data-target') === pageId) {
                tab.classList.remove('text-[var(--text-muted)]');
                tab.classList.add('text-[var(--gold-muted)]', 'border-b-2', 'border-[var(--gold-muted)]');
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
        
        if(window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Зберігаємо оригінальну функцію window.changeLang із main.js (якщо вона є), щоб не було конфліктів і циклів
    const originalChangeLang = window.changeLang;

    window.changeLang = function(lang) {
        localStorage.setItem('app_lang', lang);
        localStorage.setItem('lang', lang);
        
        const labelEl = document.getElementById('currentLangLabel');
        if (labelEl) {
            labelEl.innerText = lang.toUpperCase();
        }

        // Викликаємо оригінальну функцію перекладу всього сайту з main.js без перезавантаження
        if (typeof originalChangeLang === 'function') {
            originalChangeLang(lang);
        }

        // Оновлюємо текст інфо-сторінки під нову мову на льоту
        const urlParams = new URLSearchParams(window.location.search);
        const activePage = urlParams.get('p') || 'about';
        loadPage(activePage);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const currentLang = localStorage.getItem('app_lang') || localStorage.getItem('lang') || 'uk';
        const labelEl = document.getElementById('currentLangLabel');
        if (labelEl) {
            labelEl.innerText = currentLang.toUpperCase();
        }

        const urlParams = new URLSearchParams(window.location.search);
        const pageToLoad = urlParams.get('p') || 'about';
        loadPage(pageToLoad);
    });

    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageToLoad = urlParams.get('p') || 'about';
        loadPage(pageToLoad);
    });
