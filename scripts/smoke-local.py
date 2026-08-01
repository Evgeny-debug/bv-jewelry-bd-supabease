"""Smoke-test local server: HTML pages + critical JS assets return 200."""
from __future__ import annotations

import urllib.error
import urllib.request

BASE = "http://127.0.0.1:8765"
PATHS = [
    "/",
    "/index.html",
    "/catalog.html",
    "/product.html",
    "/checkout.html",
    "/profile.html",
    "/gallery.html",
    "/services.html",
    "/exclusive.html",
    "/info.html",
    "/privacy.html",
    "/sitemap.xml",
    "/robots.txt",
    "/admin.html",
    "/demo-data.js",
    "/js/main.js",
    "/js/pages/admin.js",
    "/js/pages/catalog.js",
    "/js/pages/product.js",
    "/js/pages/checkout.js",
    "/js/pages/profile.js",
    "/js/pages/index.js",
    "/js/pages/gallery.js",
    "/js/pages/services.js",
    "/js/pages/exclusive.js",
    "/js/pages/info.js",
    "/js/pages/privacy.js",
    "/js/pages/shared/early-theme.js",
    "/js/pages/shared/store-hours.js",
    "/js/pages/shared/jivo-callback.js",
    "/js/config.js",
    "/js/app/shop-core.js",
    "/style.css",
]


def main() -> None:
    failed = []
    for path in PATHS:
        url = BASE + path
        try:
            with urllib.request.urlopen(url, timeout=5) as resp:
                code = resp.getcode()
                length = len(resp.read())
                print(f"{code} {path} ({length} bytes)")
                if code != 200:
                    failed.append((path, code))
        except Exception as exc:  # noqa: BLE001
            print(f"FAIL {path}: {exc}")
            failed.append((path, str(exc)))
    print("\n=== SUMMARY ===")
    if failed:
        for item in failed:
            print("FAILED:", item)
        raise SystemExit(1)
    print(f"All {len(PATHS)} paths OK")


if __name__ == "__main__":
    main()
