"""
Cleanup Phase 5 extractions:
1) Dedupe store-hours into shared classic script
2) Rename *-2.js → page.js + window bridge
3) Fix HTML: store-hours before main.js, page module after main.js
"""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(r"c:\Users\Lenovo\Desktop\bv-jewelry-bd-supabease-main")
PAGES = ROOT / "js" / "pages"
SHARED = PAGES / "shared"

HOURS_PAGES = [
    "index", "catalog", "product", "profile", "gallery", "services", "exclusive",
]

GLOBALS = [
    "API", "_supabase", "formatterPrice", "flags", "sunSVG", "moonSVG",
    "escapeHtml", "getLoc", "getFavs", "setFavs", "getCart", "setCart",
    "getCurrentUser", "getScopedStorageKey", "categoriesTree",
    "migrateScopedState", "generateMenus", "renderCart", "renderFavDrawer",
    "updateFavoriteIcons", "renderProductCard", "addToCart", "addToCartById",
    "toggleFav", "handleFavClick", "openAuthModal", "closeAuthModal",
    "changeLang", "toggleTheme", "priceListDB",
]


def bridge_globals(code: str) -> str:
    for g in GLOBALS:
        def repl(m, name=g, src=None):
            # late-bind source via nonlocal pattern — use code from closure after assign
            return m.group(0)

    # Rebuild with explicit code reference
    for g in GLOBALS:
        pattern = re.compile(rf"(?<![\w.]){re.escape(g)}\b")

        def make_repl(name):
            def repl(m):
                start = m.start()
                before = code[max(0, start - 20) : start]
                if before.endswith("window.") or before.endswith("."):
                    return m.group(0)
                if re.search(r"(?:function|const|let|var|class)\s*$", before):
                    return m.group(0)
                return f"window.{name}"
            return repl

        code = pattern.sub(make_repl(g), code)

    code = code.replace("window.window.", "window.")
    code = re.sub(r"\bfunction window\.", "function ", code)
    code = re.sub(r"\basync function window\.", "async function ", code)
    code = re.sub(r"\bconst window\.", "const ", code)
    code = re.sub(r"\blet window\.", "let ", code)
    code = re.sub(r"\bvar window\.", "var ", code)
    return code


def fix_mirror_block(code: str) -> str:
    code = re.sub(r"\n// Classic-script global mirror[\s\S]*$", "", code).rstrip() + "\n"
    names = [
        m.group(2)
        for m in re.finditer(r"(?m)^(async\s+)?function\s+([A-Za-z_$][\w$]*)", code)
    ]
    if not names:
        return code
    lines = [f"window.{n} = {n};" for n in sorted(set(names))]
    return code + "\n// Classic-script global mirror\n" + "\n".join(lines) + "\n"


def process_page_file(path: pathlib.Path) -> None:
    content = path.read_text(encoding="utf-8")
    content = bridge_globals(content)
    content = fix_mirror_block(content)
    path.write_text(content, encoding="utf-8")


def main():
    # 1) store-hours from current index.js (hours IIFE)
    src = (PAGES / "index.js").read_text(encoding="utf-8")
    body_i = src.find("(function")
    body = src[body_i:] if body_i >= 0 else src
    body = re.sub(r"\n// Classic-script global mirror[\s\S]*$", "", body).rstrip() + "\n"
    hours_path = SHARED / "store-hours.js"
    hours_path.write_text(
        "/** Shared: store open-hours dots (Phase 5). */\n" + body,
        encoding="utf-8",
    )
    print("wrote", hours_path.relative_to(ROOT))

    # 2) Rename *-2.js → page.js
    for stem in HOURS_PAGES:
        big = PAGES / f"{stem}-2.js"
        dest = PAGES / f"{stem}.js"
        if big.exists():
            content = big.read_text(encoding="utf-8")
            content = content.replace(f"{stem}-2", stem)
            content = re.sub(
                r"extracted from \w+\.html",
                f"extracted from {stem}.html",
                content,
                count=1,
            )
            dest.write_text(content, encoding="utf-8")
            big.unlink(missing_ok=True)
            print(f"renamed {stem}-2.js -> {stem}.js")
        process_page_file(dest)
        print(f"bridged {stem}.js")

    for stem in ["checkout", "info", "privacy"]:
        p = PAGES / f"{stem}.js"
        if p.exists():
            process_page_file(p)
            print(f"bridged {stem}.js")

    # 3) HTML order fix
    for html_name in [
        "index.html", "catalog.html", "product.html", "profile.html",
        "gallery.html", "services.html", "exclusive.html",
        "checkout.html", "info.html", "privacy.html",
    ]:
        path = ROOT / html_name
        text = path.read_text(encoding="utf-8")
        stem = path.stem

        text = text.replace(f"js/pages/{stem}-2.js", f"js/pages/{stem}.js")

        # Strip existing hours + page module tags (we'll re-place)
        text = re.sub(
            r"[ \t]*<script(?: type=\"module\")? src=\"js/pages/shared/store-hours\.js\"></script>\r?\n?",
            "",
            text,
        )
        text = re.sub(
            rf"[ \t]*<script type=\"module\" src=\"js/pages/{stem}\.js\"></script>\r?\n?",
            "",
            text,
        )
        # Also strip old hours-as-page if still present before this cleanup somehow
        # (already renamed files)

        main_tag = '<script type="module" src="js/main.js"></script>'

        if stem in HOURS_PAGES:
            if main_tag not in text:
                raise SystemExit(f"No main.js in {html_name}")
            injection = (
                f'    <script src="js/pages/shared/store-hours.js"></script>\n'
                f"    {main_tag}\n"
                f'    <script type="module" src="js/pages/{stem}.js"></script>'
            )
            text = text.replace(main_tag, injection, 1)
        elif main_tag in text:
            injection = (
                f"{main_tag}\n"
                f'    <script type="module" src="js/pages/{stem}.js"></script>'
            )
            text = text.replace(main_tag, injection, 1)
        else:
            # privacy: keep/ensure page script near end of body
            if f"js/pages/{stem}.js" not in text:
                text = text.replace(
                    "</body>",
                    f'    <script type="module" src="js/pages/{stem}.js"></script>\n</body>',
                    1,
                )

        path.write_text(text, encoding="utf-8")
        print("fixed", html_name)

    print("Done.")


if __name__ == "__main__":
    main()
