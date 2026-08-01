/** Shared snippet: jivo-style (extracted Phase 5). Classic script — sync load. */
const styleJivoWidget = () => {
        if (window.jivo_api && typeof window.jivo_api.setCustomPosition === 'function') {
            // Перемещаем кнопку ниже (примерно в два раза ближе к низу экрана)
            window.jivo_api.setCustomPosition({
                bottom: '27vh', // Опустили ниже (было 55vh)
                right: '15px'
            });
            window.jivo_api.show();
        }

        // Управляем размером и прозрачностью кнопки
        const jivoElement = document.querySelector('.__jivoMobileButton') || document.querySelector('jdiv[class*="jivo_"]');
        if (jivoElement) {
            jivoElement.style.setProperty('width', '60px', 'important');
            jivoElement.style.setProperty('height', '60px', 'important');
            jivoElement.style.setProperty('opacity', '1', 'important'); 
        }
    };

    const jivoInterval = setInterval(styleJivoWidget, 200);
