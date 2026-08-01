/** Shared snippet: jivo-callback (extracted Phase 5). Classic script — sync load. */
function jivo_onLoadCallback() {
        // Смещаем кнопку JivoChat выше, чтобы она не перекрывалась другими элементами
        // (задаем отступ снизу, например, на уровень вашей старой кнопки)
        window.jivo_api.setCustomPosition({
            bottom: '140px', // подберите точное значение под ваш дизайн (аналог bottom-36 / bottom-40)
            right: '24px'    // отступ справа
        });
    }
