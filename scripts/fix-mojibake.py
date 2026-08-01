import pathlib

raw_text = pathlib.Path('catalog.html').read_text(encoding='utf-8-sig')
for enc in ['cp1251', 'cp1252', 'latin1', 'cp866', 'mac_cyrillic']:
    try:
        fixed = raw_text.encode(enc).decode('utf-8')
        has = 'Каталог' in fixed and 'Головна' in fixed
        print(enc, 'OK' if has else 'no', 'Каталог' in fixed, 'Головна' in fixed)
        if has:
            pathlib.Path('catalog.fixed-test.html').write_text(fixed, encoding='utf-8')
            print('  wrote catalog.fixed-test.html')
            break
    except Exception as e:
        print(enc, type(e).__name__, str(e)[:80])
