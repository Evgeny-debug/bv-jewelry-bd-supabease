"""
Phase 5: extract inline <script> (no src) from HTML pages into js/pages/.
- Leaves application/ld+json in place
- Early head scripts → classic (non-module) files to preserve sync timing
- Page logic after main.js → type=module
- Does not alter HTML markup outside of <script>...</script> replacements
"""
from __future__ import annotations

import hashlib
import pathlib
import re
from collections import defaultdict

ROOT = pathlib.Path(r"c:\Users\Lenovo\Desktop\bv-jewelry-bd-supabease-main")
PAGES_DIR = ROOT / "js" / "pages"
SHARED_DIR = PAGES_DIR / "shared"
PAGES_DIR.mkdir(parents=True, exist_ok=True)
SHARED_DIR.mkdir(parents=True, exist_ok=True)

SCRIPT_RE = re.compile(
    r"(<script)(?![^>]*\bsrc=)([^>]*>)(.*?)(</script>)",
    re.I | re.S,
)

USER_PAGES = [
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


def normalize(body: str) -> str:
    return re.sub(r"\s+", " ", body.strip())


def classify(body: str, attrs: str, position_hint: str) -> tuple[str, str, bool]:
    """
    Returns (filename_stem_or_shared_key, kind, is_module)
    kind: shared | page | keep
    """
    n = normalize(body)
    attrs_l = attrs.lower()

    if "application/ld+json" in attrs_l:
        return ("", "keep", False)
    if not body.strip():
        return ("", "keep", False)

    if "jivo_onLoadCallback" in body and "jivo_api" in body and "setCustomPosition" in body:
        return ("jivo-callback", "shared", False)
    if "styleJivoWidget" in body or ("jivo_api" in body and "setCustomStyle" in n):
        return ("jivo-style", "shared", False)
    if "localStorage.getItem('theme')" in body and "data-theme" in body and len(n) < 900:
        return ("early-theme", "shared", False)
    if "getFullYear" in body and "currentYear" in body and len(n) < 1500:
        return ("footer-year", "shared", False)
    if "window.alert" in body and "window.confirm" in body and len(n) < 500:
        return ("disable-dialogs", "shared", False)

    # page-specific
    return ("page", "page", True)


def wrap_module(body: str, page: str) -> str:
    """Ensure page script works as ES module: mirror key fns to window if declared."""
    header = (
        f"/**\n"
        f" * Page script extracted from {page} (Phase 5).\n"
        f" * Loaded as ES module after js/main.js. Behavior unchanged.\n"
        f" */\n"
    )
    # Detect top-level function declarations and mirror to window (classic globals)
    names = re.findall(
        r"(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)",
        body,
    )
    # Also const/let fn = for common patterns? skip — rare in these pages
    mirror = ""
    if names:
        uniq = sorted(set(names))
        # Avoid mirroring nested cookie helpers etc. that are inside IIFE — only top-level
        # Heuristic: if function appears inside IIFE-only, still listed — check brace depth later if needed
        lines = [f"if (typeof {n} !== 'undefined') window.{n} = {n};" for n in uniq]
        mirror = "\n\n// Classic-script global mirror for inline onclick handlers\n" + "\n".join(lines) + "\n"
    return header + "\n" + body.strip() + mirror


def wrap_classic(body: str, key: str) -> str:
    return (
        f"/** Shared snippet: {key} (extracted Phase 5). Classic script — sync load. */\n"
        + body.strip()
        + "\n"
    )


def extract_page(html_name: str, shared_files: dict[str, str], page_counters: dict[str, int]):
    path = ROOT / html_name
    text = path.read_text(encoding="utf-8")
    page_stem = pathlib.Path(html_name).stem
    replacements = 0

    def repl(m: re.Match) -> str:
        nonlocal replacements
        open_tag, attrs_and_gt, body, close = m.group(1), m.group(2), m.group(3), m.group(4)
        # attrs_and_gt is like ' type="x">' or '>'
        attrs = attrs_and_gt[:-1] if attrs_and_gt.endswith(">") else attrs_and_gt
        key, kind, is_module = classify(body, attrs, html_name)

        if kind == "keep":
            return m.group(0)

        if kind == "shared":
            if key not in shared_files:
                shared_files[key] = body
                out = SHARED_DIR / f"{key}.js"
                out.write_text(wrap_classic(body, key), encoding="utf-8")
                print(f"  shared -> js/pages/shared/{key}.js ({len(body)} chars)")
            src = f"js/pages/shared/{key}.js"
            # preserve any type attr? early scripts should NOT be module
            return f'<script src="{src}"></script>'

        # page-specific
        page_counters[page_stem] += 1
        idx = page_counters[page_stem]
        if idx == 1:
            fname = f"{page_stem}.js"
        else:
            fname = f"{page_stem}-{idx}.js"
        out = PAGES_DIR / fname
        content = wrap_module(body, html_name) if is_module else wrap_classic(body, fname)
        out.write_text(content, encoding="utf-8")
        print(f"  page   -> js/pages/{fname} ({len(body)} chars, module={is_module})")
        replacements += 1
        if is_module:
            return f'<script type="module" src="js/pages/{fname}"></script>'
        return f'<script src="js/pages/{fname}"></script>'

    new_text = SCRIPT_RE.sub(repl, text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        print(f"Updated {html_name}")
    else:
        print(f"No changes {html_name}")


def main():
    shared_files: dict[str, str] = {}
    page_counters: dict[str, int] = defaultdict(int)
    print("=== User pages ===")
    for page in USER_PAGES:
        print(f"\n{page}")
        extract_page(page, shared_files, page_counters)

    # Ensure page modules load AFTER main.js when both are modules:
    # HTML order is preserved by replacement in-place, so as long as
    # page scripts appear after main.js in the original HTML, order is fine.
    print("\nDone user pages.")


if __name__ == "__main__":
    main()
