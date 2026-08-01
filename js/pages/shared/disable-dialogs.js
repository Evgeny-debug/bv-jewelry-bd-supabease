/** Shared snippet: disable-dialogs (extracted Phase 5). Classic script — sync load. */
window.alert = function(msg) { console.warn('Системний alert заблоковано:', msg); };
        window.confirm = function(msg) { console.warn('Системний confirm заблоковано:', msg); return true; };
        window.prompt = function(msg) { console.warn('Системний prompt заблоковано:', msg); return null; };
