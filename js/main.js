/**
 * BV Jewelry — ES module entry (phases 1–4).
 * HTML structure, CSS, and behavior unchanged; window.* API kept for inline handlers.
 */
import './utils/debug.js';
import './services/storage.js';
import './services/site-settings.js';
import './services/supabase.js';
import './utils/constants.js';
import './utils/dom.js';
import './utils/icons.js';
import './utils/migrate.js';

import './app/shop-core.js';
import './app/auth-bootstrap.js';
import './app/gallery-menus.js';
import './app/admin-widgets.js';
import './app/extras.js';

console.log('BV Jewelry: modular main loaded');
