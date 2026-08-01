"""Restore corrupted HTML from zip backup, then wire js/main.js module entry."""
import zipfile
import pathlib
import re

ROOT = pathlib.Path(r'C:\Users\Lenovo\Desktop\bv-jewelry-bd-supabease-main')
ZIP = pathlib.Path(r'C:\Users\Lenovo\Desktop\bv-jewelry-bd-supabease-main.zip')
PREFIX = 'bv-jewelry-bd-supabease-main/'

pages = [
    'index.html', 'catalog.html', 'product.html', 'checkout.html',
    'profile.html', 'gallery.html', 'services.html', 'exclusive.html',
    'info.html', 'privacy.html',
]

with zipfile.ZipFile(ZIP) as z:
    for name in pages:
        arc = PREFIX + name
        if arc not in z.namelist():
            print('SKIP missing in zip', name)
            continue
        data = z.read(arc)
        # strip BOM if present
        if data.startswith(b'\xef\xbb\xbf'):
            data = data[3:]
        text = data.decode('utf-8')
        # wire module entry
        text2 = text.replace(
            '<script src="main.js"></script>',
            '<script type="module" src="js/main.js"></script>',
        )
        text2 = text2.replace(
            '<script type="module" src="main.js"></script>',
            '<script type="module" src="js/main.js"></script>',
        )
        out = ROOT / name
        out.write_bytes(text2.encode('utf-8'))
        ok = 'Каталог' in text2 or 'Головна' in text2 or name == 'privacy.html'
        has_mod = 'js/main.js' in text2
        print(f'Restored {name}: cyrillic={ok} module={has_mod} bytes={out.stat().st_size}')

print('Done.')
