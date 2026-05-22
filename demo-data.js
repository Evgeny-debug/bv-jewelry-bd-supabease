// ==========================================
// BV JEWELRY - HEADLESS CMS DEMO DATA MODULE (PEXELS EDITION)
// ==========================================

window.BVDemoData = (function() {
    console.log("BV Jewelry: Генерація бази даних (Pexels Надійні Фото)...");

    // 1. НАДІЙНІ ФОТОГРАФІЇ З PEXELS (Преміум естетика)
    const safeImages = {
        rings: [
            'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/266621/pexels-photo-266621.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1721996/pexels-photo-1721996.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1232931/pexels-photo-1232931.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        earrings: [
            'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/27308253/pexels-photo-27308253.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/9483324/pexels-photo-9483324.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        necklaces: [
            'https://images.pexels.com/photos/6263143/pexels-photo-6263143.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/908602/pexels-photo-908602.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/7436125/pexels-photo-7436125.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        bracelets: [
            // Заменили две неформатные фотографии на новые эстетичные макро
            'https://images.pexels.com/photos/2679542/pexels-photo-2679542.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/3734045/pexels-photo-3734045.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1191503/pexels-photo-1191503.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        // Розкішна обкладинка для головного екрану
        hero: 'https://images.pexels.com/photos/908602/pexels-photo-908602.jpeg?auto=compress&cs=tinysrgb&w=1920', 
        // Банери для каруселі
        banners: [
            'https://images.pexels.com/photos/908602/pexels-photo-908602.jpeg?auto=compress&cs=tinysrgb&w=1920',
            'https://images.pexels.com/photos/908602/pexels-photo-908602.jpeg?auto=compress&cs=tinysrgb&w=1920',
            'https://images.pexels.com/photos/908602/pexels-photo-908602.jpeg?auto=compress&cs=tinysrgb&w=1920'
        ],
        // Фото процесу для сторінки Ексклюзиву
        exclusive: [
            'https://images.pexels.com/photos/1050312/pexels-photo-1050312.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/30541169/pexels-photo-30541169.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/28131346/pexels-photo-28131346.jpeg?auto=compress&cs=tinysrgb&w=800'
        ]
    };

    // 2. ГЛОБАЛЬНІ НАЛАШТУВАННЯ
    const settings = {
        heroBg: safeImages.hero,
        goldRate: 6800,
        phone: '+38 063 45 40 901',
        tgLink: 'https://t.me/bv_jewelry',
        instLink: 'https://instagram.com/bv_jewelry',
        addr1: 'м. Ізмаїл, вул. Торгова, 68',
        addr2: 'м. Ізмаїл, вул. Покровська, 57',
        bannerRatio: '21/9'
    };

    // 3. МАКСИМАЛЬНО ДЕТАЛЬНА СТРУКТУРА КАТЕГОРІЙ
    const categories = [
        {
            id: 'rings', name: 'Каблучки',
            subcategories: [
                { 
                    id: 'women_rings', name: 'Жіночі', 
                    subcategories: [
                        { id: 'wr_gold_red', name: 'Червоне золото' },
                        { id: 'wr_gold_white', name: 'Біле золото' },
                        { id: 'wr_silver', name: 'Срібні' },
                        { id: 'wr_diamonds', name: 'З діамантами' },
                        { id: 'wr_engagement', name: 'На заручини' }
                    ]
                },
                { 
                    id: 'men_rings', name: 'Чоловічі', 
                    subcategories: [
                        { id: 'mr_gold', name: 'Золоті печатки' },
                        { id: 'mr_silver', name: 'Срібні персні' },
                        { id: 'mr_wedding', name: 'Обручки' },
                        { id: 'mr_enamel', name: 'З емаллю/оніксом' }
                    ]
                },
                { 
                    id: 'kids_rings', name: 'Дитячі', 
                    subcategories: [
                        { id: 'kr_gold', name: 'Золоті' },
                        { id: 'kr_silver', name: 'Срібні' },
                        { id: 'kr_enamel', name: 'З кольоровою емаллю' }
                    ]
                }
            ],
            highlights: [
                { name: 'Колекція "Infinity"', link: '#wr_diamonds', isAccent: true },
                { name: 'Ексклюзив під замовлення', link: '#exclusive', isAccent: false }
            ]
        },
        {
            id: 'earrings', name: 'Сережки',
            subcategories: [
                { 
                    id: 'women_earrings', name: 'Жіночі', 
                    subcategories: [
                        { id: 'we_gold', name: 'Золоті' },
                        { id: 'we_silver', name: 'Срібні' },
                        { id: 'we_studs', name: 'Пусети (Гвоздики)' },
                        { id: 'we_english', name: 'Англійський замок' },
                        { id: 'we_diamonds', name: 'З діамантами' }
                    ]
                },
                { 
                    id: 'kids_earrings', name: 'Дитячі', 
                    subcategories: [
                        { id: 'ke_gold_french', name: 'Золоті (Французький замок)' },
                        { id: 'ke_silver_studs', name: 'Срібні пусети' },
                        { id: 'ke_animals', name: 'З тваринками/емаллю' }
                    ]
                },
                { 
                    id: 'men_earrings', name: 'Чоловічі', 
                    subcategories: [
                        { id: 'me_gold', name: 'Золоті моносережки' },
                        { id: 'me_silver', name: 'Срібні моносережки' }
                    ]
                }
            ]
        },
        {
            id: 'necklaces', name: 'Кольє та Ланцюжки',
            subcategories: [
                { 
                    id: 'women_necklaces', name: 'Жіночі', 
                    subcategories: [
                        { id: 'wn_gold_chains', name: 'Золоті ланцюжки' },
                        { id: 'wn_silver_chains', name: 'Срібні ланцюжки' },
                        { id: 'wn_pendants', name: 'З підвіскою' },
                        { id: 'wn_diamonds', name: 'Діамантові кольє' }
                    ]
                },
                { 
                    id: 'men_necklaces', name: 'Чоловічі', 
                    subcategories: [
                        { id: 'mn_gold_massive', name: 'Масивні золоті' },
                        { id: 'mn_silver_bismarck', name: 'Срібні (Бісмарк)' },
                        { id: 'mn_crosses', name: 'Хрестики та ладанки' }
                    ]
                },
                { 
                    id: 'kids_necklaces', name: 'Дитячі', 
                    subcategories: [
                        { id: 'kn_thin_silver', name: 'Тонкі срібні ланцюжки' },
                        { id: 'kn_gold_crosses', name: 'Золоті хрестики' }
                    ]
                }
            ]
        },
        {
            id: 'bracelets', name: 'Браслети',
            subcategories: [
                { 
                    id: 'women_bracelets', name: 'Жіночі', 
                    subcategories: [
                        { id: 'wb_gold', name: 'Золоті гнучкі' },
                        { id: 'wb_silver_hard', name: 'Срібні жорсткі' },
                        { id: 'wb_tennis', name: 'Тенісні браслети' },
                        { id: 'wb_charms', name: 'З шармами' }
                    ]
                },
                { 
                    id: 'men_bracelets', name: 'Чоловічі', 
                    subcategories: [
                        { id: 'mb_leather_gold', name: 'Шкіряні з золотом' },
                        { id: 'mb_silver_massive', name: 'Срібні масивні' }
                    ]
                },
                { 
                    id: 'kids_bracelets', name: 'Дитячі', 
                    subcategories: [
                        { id: 'kb_red_thread', name: 'Червона нитка з золотом' },
                        { id: 'kb_silver_plate', name: 'Срібні з пластинкою' }
                    ]
                }
            ]
        }
    ];

    // 4. БАНЕРИ ДЛЯ СЛАЙДЕРА НА ГОЛОВНІЙ
    const banners = [
        { id: 1, img: safeImages.banners[0], link: 'catalog.html#wr_diamonds' },
        { id: 2, img: safeImages.banners[1], link: 'catalog.html#sale' },
        { id: 3, img: safeImages.banners[2], link: 'catalog.html#new' }
    ];

    // 5. РОЗУМНИЙ ГЕНЕРАТОР ТОВАРІВ (З правильною граматикою)
    let products = [];
    let idCounter = 1000;

    const adjsF = ["Вишукана", "Королівська", "Елегантна", "Сяюча", "Мінімалістична", "Класична", "Сучасна"];
    const adjsM = ["Вишуканий", "Королівський", "Елегантний", "Сяючий", "Мінімалістичний", "Класичний", "Сучасний"];
    const adjsN = ["Вишукане", "Королівське", "Елегантне", "Сяюче", "Мінімалістичне", "Класичне", "Сучасне"];
    
    categories.forEach(cat => {
        cat.subcategories.forEach(sub => {
            if(sub.subcategories) {
                sub.subcategories.forEach(subsub => {
                    
                    const itemsCount = Math.floor(Math.random() * 5) + 8;
                    for (let i = 0; i < itemsCount; i++) {
                        const isSale = Math.random() > 0.8;
                        const basePrice = Math.floor(Math.random() * 40000) + 3000; 
                        
                        let imgArray = safeImages.rings;
                        let baseName = 'каблучка';
                        let adjList = adjsF;

                        if(cat.id === 'earrings') { imgArray = safeImages.earrings; baseName = 'сережка'; adjList = adjsF; }
                        if(cat.id === 'necklaces') { imgArray = safeImages.necklaces; baseName = 'кольє'; adjList = adjsN; }
                        if(cat.id === 'bracelets') { imgArray = safeImages.bracelets; baseName = 'браслет'; adjList = adjsM; }
                        
                        const imgUrl = imgArray[Math.floor(Math.random() * imgArray.length)];
                        const adj = adjList[Math.floor(Math.random() * adjList.length)];
                        
                        let badge = 'none';
                        if (Math.random() > 0.85) badge = 'new';
                        else if (isSale) badge = 'sale';
                        else if (Math.random() > 0.9) badge = 'exclusive';

                        let metal = 'Золото 585';
                        if (subsub.id.includes('silver')) metal = 'Срібло 925';
                        if (subsub.id.includes('white')) metal = 'Біле золото 585';

                        let prefix = '';
                        if(sub.id.includes('men')) {
                            if (adjList === adjsF) prefix = 'Чоловіча ';
                            else if (adjList === adjsN) prefix = 'Чоловіче ';
                            else prefix = 'Чоловічий ';
                        }
                        if(sub.id.includes('kids')) {
                            if (adjList === adjsF) prefix = 'Дитяча ';
                            else if (adjList === adjsN) prefix = 'Дитяче ';
                            else prefix = 'Дитячий ';
                        }

                        products.push({
                            id: `${cat.id.charAt(0).toUpperCase()}-${idCounter++}`,
                            sku: `ART-${idCounter}`,
                            name: `${adj} ${prefix}${baseName}`,
                            variant: metal,
                            sizes: cat.id === 'rings' ? ['15.5', '16.0', '16.5', '17.0', '17.5', '18.0', '18.5', '19.0', '20.0'] : [],
                            category: cat.id,
                            subcategory: subsub.id,
                            priceType: 'manual',
                            price: isSale ? Math.floor(basePrice * 0.8) : basePrice,
                            discount: isSale ? basePrice : '',
                            status: Math.random() > 0.95 ? 'out-stock' : 'in-stock',
                            badge: badge,
                            isSpecial: Math.random() > 0.85, 
                            isWeekly: Math.random() > 0.85,  
                            img: imgUrl,
                            desc: `Ексклюзивний виріб від Atelier BV Jewelry. Бездоганна якість та довічна гарантія. Створено з любов'ю.`
                        });
                    }
                });
            }
        });
    });

    // 6. ІНФО-СТОРІНКИ 
    const pages = {
        'about': { title: 'Історія Atelier', content: '<h3>Спадщина з 1984 року</h3><p>Atelier BV Jewelry — це не просто бренд, це сімейні цінності, втілені у дорогоцінних металах. Кожен виріб створюється майстрами вручну.</p>' },
        'warranty': { title: 'Гарантія та Якість', content: '<p>Ми надаємо довічну гарантію на всі вироби. Безкоштовне ультразвукове чищення раз на рік для наших клієнтів.</p>' },
        'terms': { title: 'Оплата та Доставка', content: '<ul><li>Безкоштовна доставка Новою Поштою від 5000 грн.</li><li>Оплата онлайн або при отриманні.</li></ul>' },
        'home_hero': { title: 'BV Jewelry', subtitle: 'Atelier since 1984' }
    };

    // 7. ПРАЙС-ЛИСТ ПОСЛУГ
    const priceList = [
        {
            category: "Ремонт та реставрація",
            items: [
                { name: "Лазерна пайка (один злам)", gold: "Від 800", silver: "Від 500" },
                { name: "Ультразвукова чистка та полірування", gold: "Від 400", silver: "Від 300" },
                { name: "Збільшення/Зменшення розміру каблучки", gold: "Від 800", silver: "Від 500" }
            ]
        },
        {
            category: "Закріплення каміння",
            items: [
                { name: "Закріплення фіаніту", gold: "Від 400", silver: "Від 400" },
                { name: "Закріплення діамантів", gold: "Договірна", silver: "Договірна" }
            ]
        }
    ];

    // 8. ДАНІ ДЛЯ СТОРІНКИ ЕКСКЛЮЗИВ
    const exclusiveProcess = [
        { id: 1, title: 'Ідея та Ескіз', desc: 'Наші дизайнери створюють унікальний малюнок за вашими побажаннями.', img: safeImages.exclusive[0] },
        { id: 2, title: '3D Моделювання', desc: 'Ви побачите точну цифрову копію майбутньої прикраси до початку роботи.', img: safeImages.exclusive[1] },
        { id: 3, title: 'Ручна робота', desc: 'Ювелір відливає, обробляє та полірує виріб, закріплюючи каміння під мікроскопом.', img: safeImages.exclusive[2] }
    ];
    
    const exclusiveMaterials = [
        { id: 'have_gold', label: 'Є свій метал (Золото/Срібло)', selected: true },
        { id: 'need_gold', label: 'Потрібен метал від Atelier', selected: false },
        { id: 'have_stones', label: 'Є власне каміння', selected: false }
    ];

    // Фіксимо картинки в Акордеоні (на головній сторінці знизу)
    document.addEventListener("DOMContentLoaded", () => {
        const accordionPanels = document.querySelectorAll('.glass-panel-item .panel-bg');
        if(accordionPanels.length >= 4) {
            accordionPanels[0].src = safeImages.rings[0];
            accordionPanels[1].src = safeImages.earrings[0];
            accordionPanels[2].src = safeImages.necklaces[0];
            accordionPanels[3].src = safeImages.bracelets[0];
        }
    });

    return {
        settings,
        categories,
        products,
        banners,
        pages,
        priceList,
        exclusiveProcess,
        exclusiveMaterials
    };

})();