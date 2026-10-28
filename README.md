# IRONFIT — Fitness & Nutrition (موقع ثابت بدون Backend)

HTML + CSS + JavaScript فقط. كل المسارات نسبية فتعمل على GitHub Pages حتى داخل مستودع فرعي.

## الهيكل
- `index.html` — الصفحة الوحيدة (تنقل بالـ hash: `#/meals`, `#/workouts/p1`, ...)
- `style.css`, `app.js` — التصميم والمنطق
- `data/data.js` — الوجبات (100) والأنظمة (10)، مولَّد من الملف الأصلي
- `tools/source.txt` — الملف الأصلي، و`tools/build_data.py` — يعيد توليد البيانات ويتحقق من 50/50/10

## التشغيل محليًا
افتح `index.html` في المتصفح مباشرة (لا حاجة لخادم).
لإعادة توليد البيانات بعد تعديل الملف الأصلي: `python3 tools/build_data.py tools/source.txt`

## النشر على GitHub Pages
ارفع محتوى المجلد إلى مستودع، ثم Settings → Pages → Deploy from a branch → `main` / root.
