/** Shared snippet: early-theme (extracted Phase 5). Classic script — sync load. */
(function() {
        try {
            const saved = localStorage.getItem('theme');
            const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', theme);
        } catch (e) {}
    })();
   

        // Відключаємо стандартне запам'ятовування скролу браузером
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Примусово кидаємо наверх при перезавантаженні та завантаженні
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});
