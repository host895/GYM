# Parses tools/source.txt into data/data.js (window.DATA). Usage: python3 tools/build_data.py tools/source.txt
import re, json, sys, pathlib
src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'tools/source.txt').read_text(encoding='utf-8')
types = {'الفطور': 'فطار', 'الغداء': 'غداء', 'العشاء': 'عشاء', 'السناكس': 'سناكس'}
meals, plans, goal, typ, part, cur = [], [], None, None, 1, None
for ln in src.splitlines():
    s = ln.strip()
    if s.startswith('PART 2'): part = 2; continue
    if not s or set(s) <= set('=-'): continue
    if part == 1:
        if s.startswith('أولاً'): goal = 'cut'; continue
        if s.startswith('ثانياً'): goal = 'bulk'; continue
        m = re.match(r'\[ وجبات (\S+)', s)
        if m: typ = types[m.group(1)]; continue
        m = re.match(r'(\d+)\.\s+(.*)', s)
        if m and goal and typ:
            t = m.group(2); name, ing = (t.split(':', 1) + [''])[:2] if ':' in t else (t, '')
            meals.append({'id': f'{goal}-{m.group(1)}', 'n': int(m.group(1)), 'goal': goal, 'type': typ,
                          'name': name.strip(), 'ing': ing.strip(), 't': t})
    else:
        m = re.match(r'(\d+)\.\s+(نظام.*)', s)
        if m:
            full = m.group(2); name, _, sub = full.partition(' - ')
            d = re.search(r'(\d+)\s+أيام', full)
            cur = {'id': 'p' + m.group(1), 'n': int(m.group(1)), 'name': name.strip(), 'sub': sub.strip(),
                   'days': int(d.group(1)) if d else None, 'goal': '', 'lines': []}
            plans.append(cur); continue
        if not cur: continue
        if s.startswith('الهدف:'): cur['goal'] = s[6:].strip()
        elif s.startswith('•'): cur['lines'].append({'k': 'day', 's': s[1:].strip()})
        elif s.startswith('-'): cur['lines'].append({'k': 'item', 's': s[1:].strip()})
        elif re.match(r'\d+\.\s', s): cur['lines'].append({'k': 'item', 's': s})
        else: cur['lines'].append({'k': 'note', 's': s})
c = sum(m['goal'] == 'cut' for m in meals); b = sum(m['goal'] == 'bulk' for m in meals)
assert (c, b, len(plans)) == (50, 50, 10), (c, b, len(plans))
out = pathlib.Path('data/data.js')
out.write_text('window.DATA=' + json.dumps({'meals': meals, 'plans': plans}, ensure_ascii=False) + ';', encoding='utf-8')
print('OK: cutting', c, 'bulking', b, 'plans', len(plans), 'lines', sum(len(p['lines']) for p in plans))
