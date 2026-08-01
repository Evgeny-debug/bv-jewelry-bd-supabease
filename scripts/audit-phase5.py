"""Audit Phase 5: inline scripts vs external module wiring."""
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
SCRIPT_RE = re.compile(
    r"(<script)(?![^>]*\bsrc=)([^>]*>)(.*?)(</script>)",
    re.I | re.S,
)
SRC_RE = re.compile(r"<script[^>]+src=\"([^\"]+)\"", re.I)


def main() -> None:
    for name in PAGES:
        text = (ROOT / name).read_text(encoding="utf-8")
        inlines = []
        for m in SCRIPT_RE.finditer(text):
            attrs = m.group(2)
            body = m.group(3).strip()
            if "application/ld+json" in attrs.lower():
                inlines.append(("ld+json", len(body)))
            elif body:
                preview = body[:60].replace("\n", " ")
                inlines.append(("INLINE", len(body), preview))
            else:
                inlines.append(("empty", 0))
        mods = SRC_RE.findall(text)
        print(f"{name}: inlines={inlines}")
        print(f"  scripts: {mods}")


if __name__ == "__main__":
    main()
