/**
 * Page script extracted from index.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

// --- РЕНДЕРИНГ ГОЛОВНОГО АККОРДЕОНУ КАТЕГОРІЙ ---






// Допоміжна рекурсивна функція збору підкатегорій
function getAllSubCategoryIds(catId, allCategories) {
    const children = allCategories.filter(c => c.parentId === catId);
    let ids = children.map(c => c.id);
    for (const child of children) {
        ids = ids.concat(getAllSubCategoryIds(child.id, allCategories));
    }
    return ids;
}


// --- РЕНДЕРИНГ ГОРИЗОНТАЛЬНОГО СКРОЛУ КАТЕГОРІЙ З ВИЇЗДОМ ПІДКАТЕГОРІЙ ---
async function renderHomeCategoriesScroll() {
    const scrollContainer = document.getElementById('homeCategoriesScroll');
    if (!scrollContainer) return;

    try {
        let categories = null;

        const { data: rows, error } = await window._supabase
            .from('site_storage')
            .select('key, value')
            .in('key', ['bv_categories_tree', 'bv_categories_flat']);

        if (!error && rows) {
            let tree = null;
            let flat = null;
            rows.forEach((item) => {
                let val = item.value;
                if (typeof val === 'string') {
                    try { val = JSON.parse(val); } catch (_) {}
                }
                if (item.key === 'bv_categories_tree') tree = val;
                if (item.key === 'bv_categories_flat') flat = val;
            });
            if (Array.isArray(flat) && flat.length && typeof window.buildCategoriesTree === 'function') {
                categories = window.buildCategoriesTree(flat);
            } else if (Array.isArray(flat) && flat.length && typeof window.buildTree === 'function') {
                categories = window.buildTree(flat);
            } else if (Array.isArray(tree) && tree.length) {
                categories = tree;
            }
        }

        if (!categories || !categories.length) {
            const cachedFlat = window.API?.get?.('bv_categories_flat', []);
            if (cachedFlat?.length && window.buildCategoriesTree) {
                categories = window.buildCategoriesTree(cachedFlat);
            } else {
                categories = window.API?.get?.('bv_categories_tree', []) || [];
            }
        }

        if (!Array.isArray(categories) || !categories.length) {
            console.error('Помилка завантаження дерева категорій:', error);
            return;
        }

        scrollContainer.innerHTML = '';

        categories.forEach(category => {
            const group = document.createElement('div');
            group.className = 'category-group';

            const mainBtn = document.createElement('button');
            mainBtn.type = 'button';
            mainBtn.className = 'main-category';
            const catName = category.name?.uk || category.name || category.title || category.id;
            mainBtn.textContent = catName;

            const subcategories = category.subcategories || category.children || [];

            // Клік (тап) для мобільних та сенсорних пристроїв
            mainBtn.addEventListener('click', (e) => {
                if (subcategories.length > 0) {
                    document.querySelectorAll('.category-group').forEach(g => {
                        if (g !== group) g.classList.remove('active');
                    });
                    group.classList.toggle('active');
                } else {
                    window.location.href = `catalog.html?cat=${category.id}`;
                }
            });

            group.appendChild(mainBtn);

            if (subcategories.length > 0) {
                const subContainer = document.createElement('div');
                subContainer.className = 'subcategories-container';

                subcategories.forEach(subcat => {
                    const subBtn = document.createElement('a');
                    subBtn.href = `catalog.html?cat=${subcat.id}`;
                    subBtn.className = 'sub-category';
                    subBtn.textContent = subcat.name?.uk || subcat.name || subcat.title || subcat.id;
                    
                    subBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });

                    subContainer.appendChild(subBtn);
                });

                group.appendChild(subContainer);
            }

            scrollContainer.appendChild(group);
        });

        // Плавний горизонтальний скрол колесом миші для ПК
        scrollContainer.addEventListener('wheel', (evt) => {
            if (evt.deltaY !== 0) {
                evt.preventDefault();
                scrollContainer.scrollLeft += evt.deltaY;
            }
        }, { passive: false });

    } catch (err) {
        console.error('Помилка рендерингу скролу категорій:', err);
    }
}


// --- ЛОГІКА БАНЕРА (Fade / Автоплей) ---
let currentSlideIndex = 0;
let slideStartTime = Date.now();
const SLIDE_DURATION = 10000;

function showSlide(index) {
    const container = document.getElementById('mainBannerContainer');
    if (!container) return;
    const slides = Array.from(container.children).filter(el => !el.classList.contains('animate-pulse'));
    if (slides.length === 0) return;

    if (index >= slides.length) currentSlideIndex = 0;
    else if (index < 0) currentSlideIndex = slides.length - 1;
    else currentSlideIndex = index;

    slides.forEach((slide, idx) => {
        if (idx === currentSlideIndex) {
            slide.classList.add('banner-active');
        } else {
            slide.classList.remove('banner-active');
        }
    });

    const dotsContainer = document.getElementById('bannerDots');
    if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.banner-dot');
        dots.forEach((dot, idx) => {
            if (idx === currentSlideIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // 👇 ЖЕСТКАЯ ПРИВЯЗКА HREF КНОПКИ К ТЕКУЩЕМУ СЛАЙДУ
    const currentSlide = slides[currentSlideIndex];
    const visualBtn = document.getElementById('bannerVisualBtn');
    
    if (visualBtn && currentSlide) {
        // Ищем реальную ссылку в текущем слайде
        let realLink = '#';
        if (currentSlide.tagName === 'A') {
            realLink = currentSlide.href;
        } else {
            const innerLink = currentSlide.querySelector('a');
            if (innerLink) realLink = innerLink.href;
        }
        
        // Меняем href у самой кнопки
        visualBtn.href = realLink;
    }
}

window.scrollBanner = function(direction) {
    const container = document.getElementById('mainBannerContainer');
    if (!container) return;
    const slides = Array.from(container.children).filter(el => !el.classList.contains('animate-pulse'));
    if (slides.length <= 1) return;

    showSlide(currentSlideIndex + direction);
    slideStartTime = Date.now();
};






window.goToSlide = function(index) {
    showSlide(index);
    slideStartTime = Date.now();
};

function initFadeBannerSlider() {
    const container = document.getElementById('mainBannerContainer');
    const dotsContainer = document.getElementById('bannerDots');
    const timeProgress = document.getElementById('bannerTimeProgress');
    if (!container || !dotsContainer) return;

    let lastSlideCount = 0;

    const updateSlidesAndDots = () => {
        const slides = Array.from(container.children).filter(el => !el.classList.contains('animate-pulse'));
        if (slides.length === 0) return;

        if (slides.length !== lastSlideCount) {
            lastSlideCount = slides.length;
            dotsContainer.innerHTML = '';
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = `banner-dot ${index === 0 ? 'active' : ''}`;
                dot.onclick = () => window.goToSlide(index);
                dotsContainer.appendChild(dot);
            });
            currentSlideIndex = 0;
            showSlide(0);
        }
    };

    function runAutoplayLoop() {
        const slides = Array.from(container.children).filter(el => !el.classList.contains('animate-pulse'));
        
        if (slides.length > 1) {
            const now = Date.now();
            const elapsed = now - slideStartTime;
            
            const progressPercent = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
            if (timeProgress) {
                timeProgress.style.width = `${progressPercent}%`;
            }

            if (elapsed >= SLIDE_DURATION) {
                showSlide(currentSlideIndex + 1);
                slideStartTime = Date.now();
            }
        }
        requestAnimationFrame(runAutoplayLoop);
    }

    window.addEventListener('resize', updateSlidesAndDots);

    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 40;
        if (touchEndX < touchStartX - swipeThreshold) {
            showSlide(currentSlideIndex + 1);
            slideStartTime = Date.now();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            showSlide(currentSlideIndex - 1);
            slideStartTime = Date.now();
        }
    }, { passive: true });

    const observer = new MutationObserver(() => {
        updateSlidesAndDots();
    });
    observer.observe(container, { childList: true, subtree: true });

    updateSlidesAndDots();
    slideStartTime = Date.now();
    requestAnimationFrame(runAutoplayLoop);
}





// --- ЗАПУСК УСІХ СКРИПТІВ ПРИ ЗАВАНТАЖЕННІ ---
document.addEventListener('DOMContentLoaded', () => {
    renderHomeCategories();
    renderHomeCategoriesScroll();
    initFadeBannerSlider();

});
document.addEventListener("DOMContentLoaded", () => {
        const fixGrids = () => {
            const containers = document.querySelectorAll('#dynamicHomeBlocksContainer .grid, #glassAccordion .grid, #dynamicHomeBlocksContainer div[class*="grid-cols-"], #glassAccordion div[class*="grid-cols-"]');
            containers.forEach(el => {
                el.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 w-full";
            });
        };
        fixGrids();
        // Запускаємо ще раз на випадок динамічного завантаження даних із Supabase
        setTimeout(fixGrids, 500);
        setTimeout(fixGrids, 1500);
    });
function initInfiniteHorizontalScroll() {
    const scrollContainers = document.querySelectorAll('#dynamicHomeBlocksContainer .promo-horizontal-scroll');

    scrollContainers.forEach(container => {
        const track = container.querySelector('.promo-track');
        if (!track || track.dataset.infiniteInitialized === "true") return;
        
        track.dataset.infiniteInitialized = "true";

        // Очищаємо всі дочірні елементи від класів snap-* (якщо вони були згенеровані)
        track.querySelectorAll('*').forEach(el => {
            Array.from(el.classList).forEach(cls => {
                if (cls.startsWith('snap-')) el.classList.remove(cls);
            });
        });

        const originalItems = Array.from(track.children);
        if (originalItems.length === 0) return;

        // Створюємо клони для лівого та правого буфера
        const fragmentBefore = document.createDocumentFragment();
        const fragmentAfter = document.createDocumentFragment();

        originalItems.forEach(item => {
            fragmentBefore.appendChild(item.cloneNode(true));
            fragmentAfter.appendChild(item.cloneNode(true));
        });

        track.insertBefore(fragmentBefore, track.firstChild);
        track.appendChild(fragmentAfter);

        // Точний розрахунок ширини 1 набору елементів враховуючи gap
        const getSingleSetWidth = () => {
            let totalWidth = 0;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 12;
            for (let i = 0; i < originalItems.length; i++) {
                totalWidth += originalItems[i].getBoundingClientRect().width + gap;
            }
            return totalWidth;
        };

        let setWidth = getSingleSetWidth();
        
        // Встановлюємо початковий скролл на центральний (оригінальний) блок
        container.scrollLeft = setWidth;

        let isTicking = false;

        const handleScroll = () => {
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    setWidth = getSingleSetWidth();
                    if (setWidth <= 0) {
                        isTicking = false;
                        return;
                    }

                    // Якщо дійшли до лівого краю буфера — безшумно перестрибуємо в центр
                    if (container.scrollLeft <= 10) {
                        container.scrollLeft += setWidth;
                    } 
                    // Якщо дійшли до правого краю буфера — безшумно перестрибуємо в центр
                    else if (container.scrollLeft >= setWidth * 2 - 10) {
                        container.scrollLeft -= setWidth;
                    }

                    isTicking = false;
                });
                isTicking = true;
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        // Перераховуємо ширину при зміні орієнтації чи розміру екрана
        window.addEventListener('resize', () => {
            setWidth = getSingleSetWidth();
        }, { passive: true });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    // Даємо невелику паузу (300мс), щоб SPA встиг згенерувати та відмалювати картки товарів у DOM
    setTimeout(() => {
        const slider = document.querySelector('.promo-horizontal-scroll');
        if (slider) {
            slider.scrollLeft = 24; // Змініть це число (в пікселях), якщо потрібно зробити край ширшим або вужчим
        }
    }, 300);
});
(function() {
    const shiftCarousel = () => {
        const slider = document.querySelector('.promo-horizontal-scroll');
        if (slider && slider.children.length > 0) {
            // Зміщуємо скрол на 18 пікселів, щоб з'явився край наступної картки
            slider.scrollLeft = 18;
            return true;
        }
        return false;
    };

    // Перевіряємо готовність елемента в циклі, оскільки контент генерується динамічно через JS
    const interval = setInterval(() => {
        if (shiftCarousel()) {
            clearInterval(interval);
        }
    }, 50);

    // Страховка на випадок затримок мережі
    setTimeout(() => clearInterval(interval), 4000);
})();




document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.promo-horizontal-scroll');
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    // 1. Прокрутка колесиком мыши на ПК (конвертация вертикали в горизонталь)
    slider.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            slider.scrollBy({
                left: e.deltaY * 1.8,
                behavior: 'smooth'
            });
        }
    }, { passive: false });

    // 2. Перетаскивание мышью (Drag-to-scroll)
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        slider.style.cursor = 'grabbing';
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Коэффициент скорости перемещения
        slider.scrollLeft = scrollLeft - walk;
    });

    // 3. Бесшовное бесконечное зацикливание
    slider.addEventListener('scroll', () => {
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        if (maxScroll <= 0) return;

        // Если доскролили до самого конца вправо, незаметно возвращаем в начало
        if (slider.scrollLeft >= maxScroll - 2) {
            slider.scrollLeft = 2;
        } 
        // Если уперлись влево, перебрасываем в конец
        else if (slider.scrollLeft <= 0) {
            slider.scrollLeft = maxScroll - 2;
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.promo-horizontal-scroll');
    if (!slider) return;

    // 1. Конвертация колесика мыши в горизонтальный скролл на ПК
    slider.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            slider.scrollBy({
                left: e.deltaY * 1.8,
                behavior: 'smooth'
            });
        }
    }, { passive: false });

    // 2. Бесшовное кольцевое зацикливание при скролле
    slider.addEventListener('scroll', () => {
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        if (maxScroll <= 0) return;

        if (slider.scrollLeft >= maxScroll - 2) {
            slider.scrollLeft = 2;
        } else if (slider.scrollLeft <= 0) {
            slider.scrollLeft = maxScroll - 2;
        }
    });

    // 3. Управление кнопками .btn-cross (правая и левая стрелки)
    const nextBtn = document.querySelector('.btn-cross.right-2, .btn-cross[class*="right-"]');
    const prevBtn = document.querySelector('.btn-cross.left-2, .btn-cross[class*="left-"]');

    const getScrollStep = () => {
        const firstCard = slider.querySelector('.product-card, > *');
        return firstCard ? firstCard.offsetWidth + 16 : 300; // Ширина карточки + отступ
    };

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const step = getScrollStep();
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            
            // Если дошли до конца, циклично перескакиваем в начало
            if (slider.scrollLeft + step >= maxScroll - 10) {
                slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: step, behavior: 'smooth' });
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const step = getScrollStep();
            
            // Если находимся в начале, циклично перескакиваем в конец
            if (slider.scrollLeft <= 10) {
                slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: -step, behavior: 'smooth' });
            }
        });
    }
});

// Classic-script global mirror
window.getAllSubCategoryIds = getAllSubCategoryIds;
window.initFadeBannerSlider = initFadeBannerSlider;
window.initInfiniteHorizontalScroll = initInfiniteHorizontalScroll;
window.renderHomeCategoriesScroll = renderHomeCategoriesScroll;
window.showSlide = showSlide;








