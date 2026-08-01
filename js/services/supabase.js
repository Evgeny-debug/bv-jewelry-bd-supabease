import { supabaseUrl, supabaseKey } from '../config.js';

export const _supabase = typeof supabase !== 'undefined'
    ? supabase.createClient(supabaseUrl, supabaseKey)
    : null;

if (_supabase) {
    console.log("BV Jewelry: Підключення до хмари Supabase встановлено.");
} else {
    console.warn("BV Jewelry: Supabase SDK не знайдено. Працюємо в офлайн/локальному режимі.");
}
window._supabase = _supabase;
