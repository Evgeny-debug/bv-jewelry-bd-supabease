"""Verify Phase 5 wiring: all local script src files exist; modules present."""
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
    "admin.html",
]
SRC_RE = re.compile(r"<script([^>]*)\bsrc=\"([^\"]+)\"", re.I)
INLINE_RE = re.compile(
    r"(<script)(?![^>]*\bsrc=)([^>]*>)(.*?)(</script>)",
    re.I | re.S,
)


def main() -> None:
    missing = []
    for name in PAGES:
        text = (ROOT / name).read_text(encoding="utf-8")
        print(f"\n=== {name} ===")
        for m in INLINE_RE.finditer(text):
            attrs = m.group(2)
            body = m.group(3).strip()
            if "application/ld+json" in attrs.lower():
                print("  keep: ld+json")
            elif body:
                print(f"  ERROR inline remaining ({len(body)} chars)")
            else:
                print("  empty script")
        for attrs, src in SRC_RE.findall(text):
            is_mod = "type=\"module\"" in attrs or "type='module'" in attrs
            kind = "module" if is_mod else "classic"
            if src.startswith("http") or src.startswith("//"):
                print(f"  [{kind}] CDN {src[:60]}")
                continue
            path = ROOT / src
            ok = path.exists()
            print(f"  [{kind}] {src} -> {'OK' if ok else 'MISSING'}")
            if not ok:
                missing.append((name, src))
    print("\n=== SUMMARY ===")
    if missing:
        for n, s in missing:
            print(f"MISSING: {n} -> {s}")
    else:
        print("All local script references resolve.")


if __name__ == "__main__":
    main()
