(function(){
'use strict';
var D=window.DATA||{meals:[],plans:[]};
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var st={get:function(k,d){try{var v=localStorage.getItem('ironfit.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('ironfit.'+k,JSON.stringify(v))}catch(e){toast('تعذر الحفظ في المتصفح')}}};
var app=$('#app');
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('on')},1800)}
function copy(t){var ok=function(){toast('تم النسخ')};
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,function(){toast('تعذر النسخ')})}
 else{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){toast('تعذر النسخ')}a.remove()}}
var GOAL={cut:'تنشيف',bulk:'تضخيم'};
function mealById(id){return D.meals.filter(function(m){return m.id===id})[0]}

/* ---------- Home ---------- */
function home(){
 var c=D.meals.filter(function(m){return m.goal==='cut'}).length,b=D.meals.length-c;
 app.innerHTML='<section class="hero"><h1>ابنِ جسمك. طوّر قوتك. اصنع نسختك الأفضل.</h1><p>وجبات للتنشيف والتضخيم وأنظمة تدريب كاملة، مع أدوات تعمل داخل متصفحك دون حساب أو خادم.</p><div class="row"><a class="btn" href="#/workouts">أنظمة التمارين</a><a class="btn ghost" href="#/meals">استكشف الوجبات</a></div></section>'+
 '<div class="grid">'+[
  ['#/meals','الوجبات',D.meals.length+' وجبة: '+c+' تنشيف و'+b+' تضخيم، مع بحث وفلترة ومفضلة.'],
  ['#/workouts','أنظمة التمارين',D.plans.length+' أنظمة تدريب مستقلة بكامل تمارينها ومجموعاتها وتكراراتها.'],
  ['#/calc','حاسبة السعرات','BMR وTDEE وهدف سعرات ونطاق بروتين وكربوهيدرات ودهون (تقديرية).'],
  ['#/shop','قائمة التسوق','أضف وجباتك بضغطة، وعدّل الكميات، وانسخ القائمة.'],
  ['#/progress','سجل التقدم','وزنك وأوزان تمارينك محفوظة في جهازك فقط، مع رسم بياني وتصدير.']
 ].map(function(x){return '<a class="card" href="'+x[0]+'"><h2>'+x[1]+'</h2><p class="muted">'+x[2]+'</p></a>'}).join('')+'</div>';
}

/* ---------- Meals ---------- */
var mf={goal:'',type:'',q:'',fav:false};
function meals(){
 app.innerHTML='<h1>الوجبات الرياضية</h1><div class="bar"><input id="q" type="search" aria-label="بحث في الوجبات" placeholder="ابحث باسم الوجبة أو مكوناتها" value="'+esc(mf.q)+'"><div class="chips" id="chips"></div></div><p id="cnt" class="muted"></p><div id="list" class="grid"></div><p class="muted">الكميات كما وردت في الملف الأصلي دون إضافة قيم غذائية.</p>';
 $('#q').oninput=function(e){mf.q=e.target.value;mealList()};
 chips();mealList();
}
function chips(){
 var defs=[['goal','','الكل'],['goal','cut','تنشيف'],['goal','bulk','تضخيم'],['type','','كل الأنواع'],['type','فطار','فطار'],['type','غداء','غداء'],['type','عشاء','عشاء'],['type','سناكس','سناكس']];
 $('#chips').innerHTML=defs.map(function(d){return '<button class="chip'+(mf[d[0]]===d[1]?' on':'')+'" data-act="chip" data-k="'+d[0]+'" data-v="'+d[1]+'">'+d[2]+'</button>'}).join('')+
 '<button class="chip'+(mf.fav?' on':'')+'" data-act="chip" data-k="fav" data-v="">★ المفضلة</button>';
}
function mealList(){
 var favs=st.get('favMeals',[]),q=mf.q.trim().toLowerCase();
 var r=D.meals.filter(function(m){return (!mf.goal||m.goal===mf.goal)&&(!mf.type||m.type===mf.type)&&(!mf.fav||favs.indexOf(m.id)>-1)&&(!q||m.t.toLowerCase().indexOf(q)>-1)});
 $('#cnt').textContent='عدد النتائج: '+r.length+' من '+D.meals.length;
 $('#list').innerHTML=r.length?r.map(function(m){var f=favs.indexOf(m.id)>-1;
  return '<article class="card"><span class="badge '+m.goal+'">'+GOAL[m.goal]+'</span><span class="badge">'+m.type+'</span><span class="muted">#'+m.n+'</span><h2>'+esc(m.name)+'</h2>'+(m.ing?'<p class="muted">'+esc(m.ing)+'</p>':'')+
  '<div class="row"><button class="btn sm ghost" data-act="fav" data-id="'+m.id+'" aria-pressed="'+f+'">'+(f?'★ في المفضلة':'☆ أضف للمفضلة')+'</button><button class="btn sm ghost" data-act="copy" data-id="'+m.id+'">نسخ المكونات</button><button class="btn sm" data-act="shop" data-id="'+m.id+'">للتسوق +</button></div></article>'}).join(''):'<div class="empty" style="grid-column:1/-1">لا توجد وجبات مطابقة. جرّب كلمة أخرى أو أزل بعض الفلاتر.</div>';
}

/* ---------- Workouts ---------- */
function workouts(){
 var fav=st.get('favPlan','');
 app.innerHTML='<h1>أنظمة التمارين</h1><p class="muted">كل نظام مستقل؛ اختر ما يناسب مستواك ووقتك. لا يُعد أي نظام مناسبًا طبيًا للجميع.</p><div class="grid">'+D.plans.map(function(p){
  return '<a class="card hov" href="#/workouts/'+p.id+'"><span class="badge">'+(p.days?p.days+' أيام أسبوعيًا':'نظام خاص')+'</span>'+(fav===p.id?'<span class="badge bulk">★ مفضل</span>':'')+'<h2>'+esc(p.name.replace(/^نظام\s*/,''))+'</h2><p class="muted">'+esc(p.goal||p.sub)+'</p></a>'}).join('')+'</div>';
}
function plan(id){
 var p=D.plans.filter(function(x){return x.id===id})[0];if(!p)return nf();
 var isFav=st.get('favPlan','')===p.id,html='',open=false;
 p.lines.forEach(function(l){
  if(l.k==='day'){if(open)html+='</ul></div>';html+='<div class="card day"><h3>'+esc(l.s)+'</h3><ul>';open=true}
  else if(l.k==='item'){if(!open){html+='<div class="card day"><ul>';open=true}html+='<li>'+esc(l.s)+'</li>'}
  else{if(open){html+='</ul></div>';open=false}html+='<p class="muted">'+esc(l.s)+'</p>'}
 });if(open)html+='</ul></div>';
 app.innerHTML='<p class="noprint"><a href="#/workouts">← كل الأنظمة</a></p><h1>'+esc(p.name)+'</h1><p><span class="badge">'+esc(p.sub||(p.days?p.days+' أيام':''))+'</span></p><p><b>الهدف:</b> '+esc(p.goal)+'</p><div class="row noprint"><button class="btn sm'+(isFav?'':' ghost')+'" data-act="favplan" data-id="'+p.id+'">'+(isFav?'★ نظامي المفضل':'☆ اجعله نظامي المفضل')+'</button><button class="btn sm ghost" onclick="window.print()">طباعة</button></div><div class="grid">'+html+'</div>';
}

/* ---------- Calculator ---------- */
function calc(){
 app.innerHTML='<h1>حاسبة السعرات والاحتياجات</h1><form id="cf" class="card form" novalidate><label>العمر (سنة)<input name="age" type="number" inputmode="numeric" required></label><label>الجنس<select name="sex"><option value="m">ذكر</option><option value="f">أنثى</option></select></label><label>الطول (سم)<input name="h" type="number" inputmode="decimal" required></label><label>الوزن (كجم)<input name="w" type="number" inputmode="decimal" required></label><label>مستوى النشاط<select name="act"><option value="1.2">خامل (بدون تمرين)</option><option value="1.375">خفيف (1–3 أيام)</option><option value="1.55" selected>متوسط (3–5 أيام)</option><option value="1.725">عالٍ (6–7 أيام)</option><option value="1.9">عالٍ جدًا (عمل بدني + تمرين)</option></select></label><label>الهدف<select name="goal"><option value="keep">المحافظة على الوزن</option><option value="cut">تنشيف</option><option value="bulk">تضخيم</option></select></label><div><button class="btn" type="submit">احسب</button></div></form><div id="out"></div>';
 $('#cf').onsubmit=function(e){e.preventDefault();var f=new FormData(e.target),a=+f.get('age'),h=+f.get('h'),w=+f.get('w'),o=$('#out');
  if(!(a>=15&&a<=90&&h>=120&&h<=230&&w>=35&&w<=250)){o.innerHTML='<p class="err">تحقق من القيم: العمر 15–90، الطول 120–230 سم، الوزن 35–250 كجم.</p>';return}
  var bmr=10*w+6.25*h-5*a+(f.get('sex')==='m'?5:-161),tdee=bmr*(+f.get('act')),g=f.get('goal'),t=g==='cut'?tdee*.8:g==='bulk'?tdee*1.1:tdee;
  var p1=1.6*w,p2=2.2*w,f1=.8*w,f2=1.0*w,cmax=Math.max(0,(t-p1*4-f1*9)/4),cmin=Math.max(0,(t-p2*4-f2*9)/4),R=Math.round;
  var box=function(l,v){return '<div class="card"><div class="muted">'+l+'</div><div class="stat">'+v+'</div></div>'};
  o.innerHTML='<div class="grid">'+box('معدل الأيض الأساسي BMR',R(bmr)+' سعرة')+box('الاحتياج اليومي TDEE',R(tdee)+' سعرة')+box('هدف السعرات المبدئي',R(t)+' سعرة')+box('البروتين',R(p1)+'–'+R(p2)+' جم')+box('الدهون',R(f1)+'–'+R(f2)+' جم')+box('الكربوهيدرات (تقريبًا)',R(cmin)+'–'+R(cmax)+' جم')+'</div><p class="muted">المعادلة: Mifflin-St Jeor. التنشيف = TDEE × 0.8، التضخيم = TDEE × 1.1، البروتين 1.6–2.2 جم/كجم، الدهون 0.8–1 جم/كجم. النتائج تقديرية وليست قياسًا أو نصيحة طبية.</p>'};
}

/* ---------- Shopping ---------- */
var sf=false;
function shop(){
 app.innerHTML='<h1>قائمة التسوق</h1><form id="sform" class="row"><input id="sin" placeholder="أضف عنصرًا مع الكمية، مثال: صدور دجاج 1 كجم" aria-label="عنصر جديد" style="flex:1;min-width:200px"><button class="btn" type="submit">إضافة</button></form><div class="row" style="margin:10px 0"><button class="chip'+(sf?' on':'')+'" data-act="sfilter">المتبقي فقط</button><button class="chip" data-act="scopy">نسخ القائمة</button><button class="chip" data-act="sclear">حذف المشتراة</button></div><ul class="shop" id="sl"></ul>';
 $('#sform').onsubmit=function(e){e.preventDefault();var v=$('#sin').value.trim();if(!v){toast('اكتب اسم العنصر أولًا');return}addShop(v);$('#sin').value='';shopList()};
 shopList();
}
function addShop(t){var l=st.get('shop',[]);if(l.some(function(x){return x.t.trim()===t.trim()})){toast('العنصر موجود بالفعل');return false}l.push({id:Date.now()+Math.random(),t:t,d:false});st.set('shop',l);return true}
function shopList(){var l=st.get('shop',[]).filter(function(x){return !sf||!x.d});
 $('#sl').innerHTML=l.length?l.map(function(x){return '<li class="'+(x.d?'done':'')+'"><input type="checkbox" data-act="sdone" data-id="'+x.id+'"'+(x.d?' checked':'')+' aria-label="تم الشراء"><span>'+esc(x.t)+'</span><button class="btn sm ghost" data-act="sdel" data-id="'+x.id+'" aria-label="حذف">✕</button></li>'}).join(''):'<li class="empty">القائمة فارغة. أضف عنصرًا أو أضف وجبة من صفحة الوجبات.</li>'}

/* ---------- Progress ---------- */
function progress(){
 var w=st.get('weights',[]).slice().sort(function(a,b){return a.d<b.d?-1:1}),ex=st.get('lifts',[]),today=new Date().toISOString().slice(0,10);
 var chart='<p class="muted">سجّل قياسين للوزن على الأقل لظهور الرسم البياني.</p>';
 if(w.length>=2){var v=w.map(function(x){return x.w}),mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,pts=w.map(function(x,i){return (20+i*(560/(w.length-1))).toFixed(1)+','+(160-(x.w-mn)/rg*140).toFixed(1)}).join(' ');
  chart='<svg viewBox="0 0 600 180" role="img" aria-label="رسم بياني للوزن" style="width:100%"><polyline fill="none" stroke="#ff6a1a" stroke-width="3" points="'+pts+'"/><text x="4" y="14" fill="currentColor" font-size="12">'+mx+'</text><text x="4" y="176" fill="currentColor" font-size="12">'+mn+'</text></svg>'}
 app.innerHTML='<h1>سجل التقدم</h1><p class="muted">بياناتك تُحفظ في متصفحك فقط (localStorage) ولا تُرسل لأي خادم.</p><div class="card">'+chart+'</div><h2>تسجيل الوزن</h2><form id="wf" class="form card"><label>التاريخ<input name="d" type="date" value="'+today+'" required></label><label>الوزن (كجم)<input name="w" type="number" step="0.1" required></label><label>ملاحظة<input name="n"></label><div><button class="btn" type="submit">حفظ</button></div></form><h2>تسجيل تمرين</h2><form id="lf" class="form card"><label>التاريخ<input name="d" type="date" value="'+today+'" required></label><label>التمرين<input name="e" required></label><label>الوزن المستخدم (كجم)<input name="k" type="number" step="0.5" required></label><label>التكرارات<input name="r" type="number" required></label><label>ملاحظة<input name="n"></label><div><button class="btn" type="submit">حفظ</button></div></form>'+
 '<h2>السجلات</h2><table><tbody>'+w.map(function(x,i){return '<tr><td>'+x.d+'</td><td>وزن: '+x.w+' كجم</td><td>'+esc(x.n||'')+'</td><td><button class="btn sm ghost" data-act="delw" data-i="'+i+'" aria-label="حذف">✕</button></td></tr>'}).join('')+ex.map(function(x,i){return '<tr><td>'+x.d+'</td><td>'+esc(x.e)+': '+x.k+' كجم × '+x.r+'</td><td>'+esc(x.n||'')+'</td><td><button class="btn sm ghost" data-act="dell" data-i="'+i+'" aria-label="حذف">✕</button></td></tr>'}).join('')+'</tbody></table>'+(w.length+ex.length?'':'<p class="empty">لا توجد سجلات بعد.</p>')+
 '<div class="row"><button class="btn ghost" data-act="export">تصدير JSON</button><button class="btn ghost" data-act="wipe">حذف كل البيانات</button></div>';
 $('#wf').onsubmit=function(e){e.preventDefault();var f=new FormData(e.target),v=+f.get('w');if(!(v>=20&&v<=400)){toast('أدخل وزنًا منطقيًا');return}var l=st.get('weights',[]);l.push({d:f.get('d'),w:v,n:f.get('n')});st.set('weights',l);progress()};
 $('#lf').onsubmit=function(e){e.preventDefault();var f=new FormData(e.target);if(!(+f.get('r')>0)||!(+f.get('k')>=0)){toast('تحقق من الوزن والتكرارات');return}var l=st.get('lifts',[]);l.push({d:f.get('d'),e:f.get('e'),k:+f.get('k'),r:+f.get('r'),n:f.get('n')});st.set('lifts',l);progress()};
}

/* ---------- About / 404 ---------- */
function about(){app.innerHTML='<h1>الخصوصية والمصادر وإخلاء المسؤولية</h1><div class="card"><p><b>الخصوصية:</b> لا توجد حسابات ولا خوادم. المفضلة وقائمة التسوق والسجل تُحفظ في متصفحك فقط، ويمكنك حذفها أو تصديرها من صفحة السجل.</p><p><b>المصدر:</b> الوجبات وأنظمة التمارين مأخوذة كما هي من الملف النصي المرفق (tools/source.txt).</p><p><b>الصور:</b> لا يتضمن هذا الإصدار صور تمارين أو وجبات، ولا ننسب أي صورة لمصدر لم نتحقق من ترخيصه.</p><p><b>إخلاء المسؤولية:</b> المحتوى تثقيفي وليس بديلًا عن الطبيب أو أخصائي التغذية أو المدرب. أوقف أي تمرين يسبب ألمًا حادًا.</p></div>'}
function nf(){app.innerHTML='<div class="empty"><h1>الصفحة غير موجودة</h1><a class="btn" href="#/">الرئيسية</a></div>'}

/* ---------- Router & events ---------- */
function route(){var p=(location.hash.replace(/^#\/?/,'')||'').split('/');
 document.querySelectorAll('nav a').forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#/'+p[0])});
 ({'':home,meals:meals,workouts:function(){p[1]?plan(p[1]):workouts()},calc:calc,shop:shop,progress:progress,about:about}[p[0]]||nf)();
 $('#nav').classList.remove('open');window.scrollTo(0,0);app.focus({preventScroll:true})}
window.addEventListener('hashchange',route);
document.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,id=b.dataset.id,m;
 if(a==='chip'){var k=b.dataset.k;if(k==='fav')mf.fav=!mf.fav;else mf[k]=b.dataset.v;chips();mealList()}
 else if(a==='fav'){var f=st.get('favMeals',[]),i=f.indexOf(id);i>-1?f.splice(i,1):f.push(id);st.set('favMeals',f);mealList()}
 else if(a==='copy'){m=mealById(id);copy(m.ing||m.t)}
 else if(a==='shop'){m=mealById(id);if(addShop(m.name+(m.ing?': '+m.ing:'')))toast('أُضيفت إلى قائمة التسوق')}
 else if(a==='favplan'){st.set('favPlan',st.get('favPlan','')===id?'':id);plan(id)}
 else if(a==='sfilter'){sf=!sf;shop()}
 else if(a==='scopy'){copy(st.get('shop',[]).map(function(x){return (x.d?'[x] ':'[ ] ')+x.t}).join('\n'))}
 else if(a==='sclear'){st.set('shop',st.get('shop',[]).filter(function(x){return !x.d}));shopList()}
 else if(a==='sdel'){st.set('shop',st.get('shop',[]).filter(function(x){return String(x.id)!==id}));shopList()}
 else if(a==='delw'||a==='dell'){var key=a==='delw'?'weights':'lifts',l=st.get(key,[]);if(key==='weights'){var s=l.slice().sort(function(x,y){return x.d<y.d?-1:1});s.splice(+b.dataset.i,1);l=s}else l.splice(+b.dataset.i,1);st.set(key,l);progress()}
 else if(a==='export'){var u=URL.createObjectURL(new Blob([JSON.stringify({weights:st.get('weights',[]),lifts:st.get('lifts',[])},null,2)],{type:'application/json'})),x=document.createElement('a');x.href=u;x.download='ironfit-progress.json';x.click();setTimeout(function(){URL.revokeObjectURL(u)},500)}
 else if(a==='wipe'){if(confirm('حذف كل السجلات نهائيًا؟')){st.set('weights',[]);st.set('lifts',[]);progress()}}
});
document.addEventListener('change',function(e){var b=e.target;if(b.dataset.act==='sdone'){st.set('shop',st.get('shop',[]).map(function(x){if(String(x.id)===b.dataset.id)x.d=b.checked;return x}));shopList()}});
$('#burger').onclick=function(){var o=$('#nav').classList.toggle('open');this.setAttribute('aria-expanded',o)};
$('#theme').onclick=function(){var t=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=t;st.set('theme',t)};
var tt=$('#totop');tt.onclick=function(){window.scrollTo({top:0})};window.addEventListener('scroll',function(){tt.hidden=window.scrollY<400});
route();
})();
