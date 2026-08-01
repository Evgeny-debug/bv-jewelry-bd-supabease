/** Shared: store open-hours dots (Phase 5). */
(function() {
    try {
        const now = new Date();
        const kyivTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Kyiv' }));
        const currentHour = kyivTime.getHours() + kyivTime.getMinutes() / 60;

        // Торгова, 68: 08:00 – 17:00
        const isTorgovaOpen = currentHour >= 8 && currentHour < 17;
        const dotTorgova = document.getElementById('dot-torgova');
        if (dotTorgova && isTorgovaOpen) {
            dotTorgova.className = "absolute left-2.5 top-5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
        }

        // Покровська, 57: 09:00 – 17:00
        const isPokrovskaOpen = currentHour >= 9 && currentHour < 17;
        const dotPokrovska = document.getElementById('dot-pokrovska');
        if (dotPokrovska && isPokrovskaOpen) {
            dotPokrovska.className = "absolute left-2.5 top-5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
        }
    } catch(e) {
        console.error("Working hours indicator error:", e);
    }
})();
