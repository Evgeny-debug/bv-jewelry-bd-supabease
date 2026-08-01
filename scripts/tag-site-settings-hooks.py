"""Tag storefront HTML contact hooks for site-settings.js (minimal class/id adds)."""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(r"c:\Users\Lenovo\Desktop\bv-jewelry-bd-supabease-main")
PAGES = [
    "index.html",
    "catalog.html",
    "product.html",
    "checkout.html",
    "profile.html",
    "gallery.html",
    "services.html",
    "exclusive.html",
    "info.html",
    "privacy.html",
]


def patch(text: str) -> str:
    # Footer phone link
    text = re.sub(
        r'(<a href="tel:\+380634540901" class=")(text-\[18px\])',
        r'\1js-site-phone \2',
        text,
    )
    # Header phone already has header-phone-link

    # Mobile header telegram
    text = re.sub(
        r'(<a href="https://t\.me/bv_jewelry_izmail" target="_blank" class=")(mobile-only)',
        r'\1tg-link js-site-tg \2',
        text,
    )

    # Footer Instagram (often href="#")
    text = re.sub(
        r'(<a href="[^"]*" target="_blank" aria-label="Instagram" class=")(w-9 h-9)',
        r'\1inst-link js-site-inst \2',
        text,
    )
    # Footer Telegram
    text = re.sub(
        r'(<a href="https://t\.me/bv_jewelry_izmail" target="_blank" aria-label="Telegram" class=")(w-9 h-9)',
        r'\1tg-link js-site-tg \2',
        text,
    )

    # Address grid → footerAddressesBlock (first mb-10 grid that contains footer_address_1)
    if 'id="footerAddressesBlock"' not in text and 'data-i18n="footer_address_1"' in text:
        text = text.replace(
            '<div class="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">',
            '<div id="footerAddressesBlock" class="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">',
            1,
        )

    return text


def main() -> None:
    for name in PAGES:
        path = ROOT / name
        if not path.exists():
            print("skip missing", name)
            continue
        old = path.read_text(encoding="utf-8")
        new = patch(old)
        if new != old:
            path.write_text(new, encoding="utf-8")
            print("patched", name)
        else:
            print("no change", name)


if __name__ == "__main__":
    main()
