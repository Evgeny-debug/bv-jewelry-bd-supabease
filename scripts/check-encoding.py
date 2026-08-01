import pathlib

for f in ['catalog.html', 'syte/bv-engine-project/pages/catalog.html']:
    raw = pathlib.Path(f).read_bytes()
    print('===', f, 'BOM', list(raw[:3]), 'size', len(raw))
    needle = b'data-i18n="m2"'
    idx = raw.find(needle)
    print('m2 idx', idx)
    if idx > 0:
        print(raw[idx:idx + 100])
    # Ukrainian Каталог utf-8 bytes
    kat = 'Каталог'.encode('utf-8')
    print('Каталог count', raw.count(kat))
    gol = 'Головна'.encode('utf-8')
    print('Головна count', raw.count(gol))
