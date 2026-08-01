import pathlib
import re

root = pathlib.Path(r"c:\Users\Lenovo\Desktop\bv-jewelry-bd-supabease-main")
pages = [
    "index.html", "catalog.html", "product.html", "checkout.html",
    "profile.html", "gallery.html", "services.html", "exclusive.html",
    "info.html", "privacy.html", "admin.html",
]
pat = re.compile(r"<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script>", re.I | re.S)

for name in pages:
    p = root / name
    if not p.exists():
        print(name, "MISSING")
        continue
    text = p.read_text(encoding="utf-8")
    blocks = pat.findall(text)
    print(f"\n=== {name} ({len(blocks)} inline) ===")
    for i, (attrs, body) in enumerate(blocks):
        body = body.strip()
        kind = "js"
        if "application/ld+json" in attrs:
            kind = "ld+json"
        elif "tailwind" in attrs.lower() or body.startswith("tailwind"):
            kind = "tailwind-config"
        elif not body:
            kind = "empty"
        preview = body[:70].replace("\n", " ")
        print(f"  [{i}] {kind} chars={len(body)} attrs={attrs.strip()[:50]!r}")
        print(f"       {preview!r}")
