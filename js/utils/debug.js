const _origLog = console.warn;
console.warn = function(...args) {
    if (args.some(arg => String(arg).includes('undefined'))) {
        console.trace('⚡ Знайдено запис із undefined!');
    }
    _origLog.apply(console, args);
};

// Перехоплювач появи тексту "undefined" у DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
            if (node.nodeType === 3 && node.nodeValue.includes('undefined')) {
                console.error('🎯 Знайдено текст "undefined" у вузлі:', node.parentElement);
            }
        });
    });
});
observer.observe(document.body, { subtree: true, characterData: true, childList: true });




/* ==========================================
   ВІДКЛЮЧЕННЯ СИСТЕМНИХ СПІВПАДАЮЧИХ ВІКОН (ALERT/CONFIRM/PROMPT)
   ========================================== */
window.alert = function(msg) {
    console.warn('Системний alert заблоковано:', msg);
};

window.confirm = function(msg) {
    console.warn('Системний confirm заблоковано:', msg);
    return true; // або false залежно від того, що зазвичай потрібно за замовчуванням
};

window.prompt = function(msg) {
    console.warn('Системний prompt заблоковано:', msg);
    return null;
};
