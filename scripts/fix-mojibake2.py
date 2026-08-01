import pathlib

t = pathlib.Path('catalog.html').read_text(encoding='utf-8-sig')
bad = []
for i, ch in enumerate(t):
    try:
        ch.encode('cp1252')
    except UnicodeEncodeError:
        bad.append((i, ch, hex(ord(ch))))
        if len(bad) > 30:
            break
print('bad count sample', len(bad))
print(bad[:20])
print('total non-cp1252', sum(1 for ch in t if True and (lambda c: not (c.encode('cp1252') or True))(ch) ))

# count
n = 0
for ch in t:
    try:
        ch.encode('cp1252')
    except Exception:
        n += 1
print('total bad chars', n)

# try recover with xmlcharrefreplace / ignore then fix
# Better approach: work on BYTES of corrupted file
raw = pathlib.Path('catalog.html').read_bytes()
if raw.startswith(b'\xef\xbb\xbf'):
    raw = raw[3:]
# Decode as utf-8 to get unicode, encode each char to cp1252 with ignore
recovered_bytes = bytearray()
for ch in raw.decode('utf-8'):
    try:
        recovered_bytes.extend(ch.encode('cp1252'))
    except UnicodeEncodeError:
        # skip or try cp1251
        try:
            recovered_bytes.extend(ch.encode('cp1251'))
        except Exception:
            pass
try:
    fixed = recovered_bytes.decode('utf-8')
    print('recovered Golovna', 'Головна' in fixed, 'Katalog', 'Каталог' in fixed)
    print('sample', fixed[fixed.find('data-i18n="m2"'):fixed.find('data-i18n="m2"')+40] if 'data-i18n="m2"' in fixed else 'no')
except Exception as e:
    print('recover fail', e)
