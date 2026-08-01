"""
Phase 5: extract admin.html inline script into js/pages/admin.js
as a classic (non-module) script so onclick handlers keep working.
"""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(r"c:\Users\Lenovo\Desktop\bv-jewelry-bd-supabease-main")
ADMIN_HTML = ROOT / "admin.html"
OUT_JS = ROOT / "js" / "pages" / "admin.js"

# Match the large trailing inline script (not src, not ld+json)
SCRIPT_RE = re.compile(
    r"(?P<indent>[ \t]*)<script>(?P<body>.*?)</script>(?P<ws>\s*)</body>",
    re.I | re.S,
)


def main() -> None:
    text = ADMIN_HTML.read_text(encoding="utf-8")
    m = SCRIPT_RE.search(text)
    if not m:
        raise SystemExit("No trailing inline <script> found before </body>")

    body = m.group("body")
    content = (
        "/**\n"
        " * Admin panel script extracted from admin.html (Phase 5).\n"
        " * Loaded as a classic (non-module) script so inline onclick\n"
        " * handlers and window.* assignments continue to work.\n"
        " */\n"
        + body.strip()
        + "\n"
    )

    fn_names = sorted(
        set(
            re.findall(
                r"(?m)^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)",
                body,
            )
        )
    )

    # Classic script: top-level function/var declarations are already globals,
    # and many handlers are already assigned to window.*. No blind mirror —
    # nested decls would make that throw ReferenceError.
    OUT_JS.parent.mkdir(parents=True, exist_ok=True)
    OUT_JS.write_text(content, encoding="utf-8")
    print(f"Wrote {OUT_JS.relative_to(ROOT)} ({len(content)} chars)")
    print(f"  function decls detected: {len(fn_names)}")

    onclick_needed = sorted(
        set(
            re.findall(
                r"""onclick\s*=\s*["'](?:[^"']*\b)?([A-Za-z_$][\w$]*)\s*\(""",
                text,
                flags=re.I,
            )
        )
    )
    print(f"  onclick callee names in HTML: {onclick_needed}")

    replacement = (
        f'{m.group("indent")}<script src="js/pages/admin.js"></script>'
        f'{m.group("ws")}</body>'
    )
    new_text = SCRIPT_RE.sub(replacement, text, count=1)
    if new_text == text:
        raise SystemExit("HTML replacement failed")
    ADMIN_HTML.write_text(new_text, encoding="utf-8")
    print(f"Updated {ADMIN_HTML.name}: inline script -> js/pages/admin.js")


if __name__ == "__main__":
    main()
