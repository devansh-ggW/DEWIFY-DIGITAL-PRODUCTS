const STORAGE_KEY='dewify:builder:v1';

const THEMES={
  aurora:{name:'Aurora',family:'Light',bg:'#f7f7fc',text:'#141414',muted:'#6c6c68',accent:'#1f5eff',card:'#ffffff',line:'#e8e8e2'},
  midnight:{name:'Midnight',family:'Dark',bg:'#0a0a0b',text:'#f4f4f2',muted:'#98989c',accent:'#d8ff4f',card:'#111113',line:'#252529'},
  studio:{name:'Studio',family:'Warm',bg:'#f3eee7',text:'#181614',muted:'#766f66',accent:'#c95b35',card:'#fffaf4',line:'#ded5ca'},
  mint:{name:'Mint',family:'Cold',bg:'#effcf7',text:'#12312c',muted:'#607a73',accent:'#0f766e',card:'#ffffff',line:'#d9ece5'},
  rose:{name:'Rose',family:'Warm',bg:'#fff3f7',text:'#291720',muted:'#7b6870',accent:'#db2777',card:'#ffffff',line:'#eedfe6'},
  obsidian:{name:'Obsidian',family:'Dark',bg:'#050508',text:'#f5f1ff',muted:'#aaa1b7',accent:'#8b5cf6',card:'#100c16',line:'#292232'},
  glacier:{name:'Glacier',family:'Cold',bg:'#eef8ff',text:'#10202e',muted:'#66859a',accent:'#1387d8',card:'#ffffff',line:'#dbeaf4'},
  ember:{name:'Ember',family:'Warm',bg:'#fff7ed',text:'#2b1710',muted:'#7c6256',accent:'#ea580c',card:'#fffdf9',line:'#efdfd3'},
  mono:{name:'Mono',family:'Light',bg:'#f5f5f5',text:'#111111',muted:'#6b7280',accent:'#111827',card:'#ffffff',line:'#e5e7eb'},
  neon:{name:'Neon',family:'Dark',bg:'#050914',text:'#eefcff',muted:'#98a8bf',accent:'#22d3ee',card:'#0d1422',line:'#1c2b43'}
};

const FOUNDATION_META={
  Lumen:{theme:'aurora',sections:['hero','featureGrid','about','contact']},
  Noir:{theme:'midnight',sections:['hero','stats','featureGrid','about','contact']},
  Atlas:{theme:'aurora',sections:['heroSplit','featureGrid','pricing','contact']},
  Arc:{theme:'studio',sections:['hero','editorialGrid','quote','contact']},
  Pulse:{theme:'neon',sections:['hero','productShowcase','featureGrid','contact']},
  Merch:{theme:'studio',sections:['heroSplit','productGrid','about','contact']},
  Agency:{theme:'mono',sections:['hero','projectGrid','statement','contact']},
  Launch:{theme:'aurora',sections:['hero','countdown','signup']},
  Personal:{theme:'mono',sections:['hero','projectList','about','contact']},
  Convert:{theme:'obsidian',sections:['heroSplit','proofList','featureGrid','contact']}
};

const SECTION_LABELS={hero:'Hero',heroSplit:'Hero + Visual',featureGrid:'Feature Grid',stats:'Stats',about:'About',contact:'Contact',pricing:'Pricing',editorialGrid:'Editorial Cards',quote:'Quote',productShowcase:'Product Showcase',productGrid:'Product Grid',projectGrid:'Project Grid',statement:'Statement',countdown:'Countdown',signup:'Signup',projectList:'Project List',proofList:'Proof List'};
const TEXT_TYPES=new Set(['heading','paragraph','button','eyebrow','label','price','brand']);
const uid=p=>`${p}-${Math.random().toString(36).slice(2,8)}`;
const clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function makeElement(type,props={}){return {id:uid(type),type,props:{...props}}}
function makeSection(type,props={},children=[]){return {id:uid(type),type,props:{...props},children}}

function starterDocument(name='Untitled Website',foundation='Lumen'){
  const theme=FOUNDATION_META[foundation]?.theme||'aurora';
  return {version:1,id:uid('site'),name,theme,settings:{fontFamily:'Inter,Arial,sans-serif',maxWidth:1120},pages:[{id:'home',name:'Home',sections:buildFoundation(foundation)}],assets:[]};
}

function buildFoundation(name){
  const b=FOUNDATION_META[name]||FOUNDATION_META.Lumen;
  const hero=makeSection('hero',{padding:96,background:'transparent',align:'center'},[
    makeElement('brand',{text:'YOUR BRAND',fontSize:18,fontWeight:900}),
    makeElement('eyebrow',{text:name.toUpperCase()+' / EDIT ME',fontSize:11,color:'accent'}),
    makeElement('heading',{text:foundationCopy[name]?.heading||'Make your next idea impossible to ignore.',fontSize:68,fontWeight:800}),
    makeElement('paragraph',{text:foundationCopy[name]?.body||'Replace this copy with your value proposition and make this website yours.',fontSize:18,color:'muted'}),
    makeElement('button',{text:foundationCopy[name]?.cta||'Get Started',href:'#contact',variant:'primary'})
  ]);
  const sections=[];
  for(const type of b.sections){
    if(type==='hero')sections.push(hero);
    else if(type==='heroSplit')sections.push(makeSection('heroSplit',{padding:82},[
      makeElement('heading',{text:foundationCopy[name]?.heading||'Turn attention into action.',fontSize:64,fontWeight:850}),
      makeElement('paragraph',{text:foundationCopy[name]?.body||'A structured starting point built for your message, offer, and proof.',fontSize:18,color:'muted'}),
      makeElement('button',{text:foundationCopy[name]?.cta||'Start Now',href:'#contact',variant:'primary'}),
      makeElement('image',{src:'',alt:'Hero visual',fit:'cover'})
    ]));
    else sections.push(defaultSection(type));
  }
  return sections;
}

const foundationCopy={
  Lumen:{heading:'Make your next idea impossible to ignore.',body:'A clean starting point for products, services, and modern brands.',cta:'Primary Action'},
  Noir:{heading:'Bold ideas. Clean execution.',body:'A dark premium canvas for brands that want visual weight and clarity.',cta:"Let's Talk"},
  Atlas:{heading:'Turn complexity into clarity.',body:'A SaaS-style foundation for software, dashboards, and modern products.',cta:'Start Free'},
  Arc:{heading:'Thoughtful work for brands with something to say.',body:'A warm editorial system for studios, consultants, creators, and premium services.',cta:'See What We Do'},
  Pulse:{heading:'The operating system for your next big thing.',body:'A product-first system for ambitious digital products and technology brands.',cta:'View Product'},
  Merch:{heading:"Made for people who don't want ordinary.",body:'A storefront foundation for clothing, accessories, and lifestyle goods.',cta:'Browse Collection'},
  Agency:{heading:'We design brands people remember.',body:'A project-led portfolio for creative studios, developers, and digital agencies.',cta:'View Work'},
  Launch:{heading:'Something better is almost here.',body:'A launch and waitlist foundation with a real editable countdown.',cta:'Notify Me'},
  Personal:{heading:'Designer, developer, and builder.',body:'A minimalist portfolio foundation for people, creators, and independent work.',cta:'Selected Work'},
  Convert:{heading:'Get the result without the busywork.',body:'A high-conversion foundation for services, products, courses, consulting, and SaaS.',cta:'Start Now'}
};

function defaultSection(type){
  switch(type){
    case 'featureGrid':return makeSection(type,{padding:72,title:'Everything you need.'},[
      makeElement('card',{title:'01. Fast setup',body:'Explain the first benefit or workflow improvement.',icon:'✦'}),makeElement('card',{title:'02. Smart workflow',body:'Explain the second benefit or capability.',icon:'◈'}),makeElement('card',{title:'03. Better outcomes',body:'Explain the measurable result customers get.',icon:'⌁'})
    ]);
    case 'stats':return makeSection(type,{padding:58},[makeElement('stat',{value:'12+',label:'EDITABLE METRIC'}),makeElement('stat',{value:'48h',label:'EDITABLE METRIC'}),makeElement('stat',{value:'4.9/5',label:'EDITABLE METRIC'})]);
    case 'about':return makeSection(type,{padding:72,title:'Built to be customized.'},[makeElement('paragraph',{text:'Replace this section with your story, experience, mission, materials, or positioning.',fontSize:18,color:'muted'})]);
    case 'contact':return makeSection(type,{padding:72,title:'Ready to start?'},[makeElement('paragraph',{text:'Replace this section with your email, booking link, checkout, or contact flow.',fontSize:16,color:'muted'}),makeElement('button',{text:'hello@example.com',href:'mailto:hello@example.com',variant:'primary'})]);
    case 'pricing':return makeSection(type,{padding:68,title:'Simple pricing.'},[makeElement('card',{title:'Starter',body:'Replace this with your offer, package, or plan.',price:'₹999',icon:'01'})]);
    case 'editorialGrid':return makeSection(type,{padding:72,title:'Work with intention.'},[makeElement('card',{title:'Brand strategy',body:'Replace this with your offer and outcome.',tag:'01 / SERVICE'}),makeElement('card',{title:'Creative direction',body:'Replace this with another offer and outcome.',tag:'02 / SERVICE'})]);
    case 'quote':return makeSection(type,{padding:96,align:'center'},[makeElement('heading',{text:'“Replace this with a memorable statement about your brand.”',fontSize:38,fontWeight:500})]);
    case 'productShowcase':return makeSection(type,{padding:54,title:'Product preview'},[makeElement('image',{src:'',alt:'Product UI placeholder',fit:'cover'}),makeElement('paragraph',{text:'Drop your screenshot, product UI, or visual here.',fontSize:15,color:'muted'})]);
    case 'productGrid':return makeSection(type,{padding:72,title:'Featured products'},[makeElement('product',{name:'Product One',price:'₹599'}),makeElement('product',{name:'Product Two',price:'₹799'}),makeElement('product',{name:'Product Three',price:'₹999'})]);
    case 'projectGrid':return makeSection(type,{padding:72,title:'Selected work'},[makeElement('project',{name:'Project One',meta:'CLIENT / PROJECT',year:'2026'}),makeElement('project',{name:'Project Two',meta:'CLIENT / PROJECT',year:'2026'}),makeElement('project',{name:'Project Three',meta:'CLIENT / PROJECT',year:'2026'}),makeElement('project',{name:'Project Four',meta:'CLIENT / PROJECT',year:'2026'})]);
    case 'statement':return makeSection(type,{padding:96},[makeElement('heading',{text:'Strategy, design, and development without the agency fluff.',fontSize:48,fontWeight:750})]);
    case 'countdown':return makeSection(type,{padding:46,title:'Countdown'},[makeElement('countdown',{days:7})]);
    case 'signup':return makeSection(type,{padding:44,title:'Get early access.'},[makeElement('form',{button:'Join Waitlist',placeholder:'you@example.com'})]);
    case 'projectList':return makeSection(type,{padding:70,title:'Selected work'},[makeElement('project',{name:'Project One',meta:'Short description',year:'2026'}),makeElement('project',{name:'Project Two',meta:'Short description',year:'2025'}),makeElement('project',{name:'Project Three',meta:'Short description',year:'2025'})]);
    case 'proofList':return makeSection(type,{padding:68},[makeElement('proof',{text:'✓ Clear outcome'}),makeElement('proof',{text:'✓ Simple process'}),makeElement('proof',{text:'✓ Social-proof friendly'}),makeElement('proof',{text:'✓ Strong CTA'})]);
    default:return makeSection('about',{},[]);
  }
}

let foundation='Lumen';
let doc=starterDocument('Untitled Website',foundation);
let selected={kind:null,id:null};
let history=[];let historyIndex=-1;let device='desktop';let zoom=1;

const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
function currentPage(){return doc.pages[0]}
function findSection(id){return currentPage().sections.find(s=>s.id===id)}
function findElement(id){for(const s of currentPage().sections){const e=s.children?.find(x=>x.id===id);if(e)return {element:e,section:s}}return null}
function snapshot(){return clone(doc)}
function commit(label){history=history.slice(0,historyIndex+1);history.push(snapshot());historyIndex++;render();setStatus(label);}
function restore(s){doc=clone(s);render();}
function undo(){if(historyIndex<=0)return;historyIndex--;restore(history[historyIndex]);setStatus('Undo');}
function redo(){if(historyIndex>=history.length-1)return;historyIndex++;restore(history[historyIndex]);setStatus('Redo');}
function setStatus(text){$('#saveStatus').textContent=text;}
function toast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),1300)}

function render(){
  $('#projectName').value=doc.name;
  const theme=THEMES[doc.theme]||THEMES.aurora;
  const site=$('#siteCanvas');site.style.setProperty('--site-bg',theme.bg);site.style.setProperty('--site-text',theme.text);site.style.setProperty('--site-muted',theme.muted);site.style.setProperty('--site-accent',theme.accent);site.style.setProperty('--site-card',theme.card);site.style.setProperty('--site-line',theme.line);site.style.fontFamily=doc.settings.fontFamily;site.innerHTML=currentPage().sections.map(renderSection).join('');
  bindCanvas();renderInspector();
}

function renderSection(s){
  const p=s.props||{};const theme=THEMES[doc.theme]||THEMES.aurora;const selectedClass=selected.kind==='section'&&selected.id===s.id?' selected':'';
  const inner=s.children?.map(renderElement).join('')||'';
  const common=`class="site-section ${esc(s.type)}${selectedClass}" data-section-id="${s.id}" style="padding:${Number(p.padding||64)}px 0;text-align:${p.align||'left'};background:${p.background==='accent'?theme.accent:'transparent'};color:${p.background==='accent'?'#fff':'inherit'}"`;
  return `<section ${common}><span class="selection-label">${esc(SECTION_LABELS[s.type]||s.type)}</span><div class="section-inner">${p.title?`<h2 style="margin:0 0 24px;font-size:clamp(30px,4vw,48px);letter-spacing:-.045em">${esc(p.title)}</h2>`:''}${sectionLayout(s,inner)}</div></section>`;
}
function sectionLayout(s,inner){
  if(['featureGrid','productGrid','projectGrid','stats','proofList'].includes(s.type))return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px">${inner}</div>`;
  if(['heroSplit'].includes(s.type))return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center">${inner}</div>`;
  if(['editorialGrid'].includes(s.type))return `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px">${inner}</div>`;
  return inner;
}
function renderElement(e){
  const p=e.props||{};const theme=THEMES[doc.theme]||THEMES.aurora;const sel=selected.kind==='element'&&selected.id===e.id?' selected-element':'';
  const attrs=`class="site-element${sel}" data-element-id="${e.id}"`;
  if(e.type==='brand')return `<div ${attrs} style="font-weight:${p.fontWeight||900};font-size:${p.fontSize||18}px;margin-bottom:24px">${esc(p.text)}</div>`;
  if(e.type==='eyebrow')return `<div ${attrs} style="font-size:${p.fontSize||11}px;letter-spacing:.14em;color:${p.color==='accent'?theme.accent:'inherit'};font-weight:800;margin-bottom:15px">${esc(p.text)}</div>`;
  if(e.type==='heading')return `<h3 ${attrs} style="font-size:${p.fontSize||48}px;line-height:.96;letter-spacing:-.055em;margin:0 0 18px;font-weight:${p.fontWeight||750}">${esc(p.text)}</h3>`;
  if(e.type==='paragraph')return `<p ${attrs} style="font-size:${p.fontSize||16}px;line-height:1.6;color:${p.color==='muted'?theme.muted:'inherit'};max-width:680px;margin:0 0 20px">${esc(p.text)}</p>`;
  if(e.type==='button')return `<a ${attrs} href="${esc(p.href||'#')}" class="btn" style="padding:12px 17px;border-radius:11px;background:${p.variant==='primary'?theme.accent:theme.card};color:${p.variant==='primary'?'#fff':theme.text};border:1px solid ${theme.line};font-weight:850;margin:5px 8px 5px 0">${esc(p.text)}</a>`;
  if(e.type==='image')return `<div ${attrs} style="min-height:230px;border-radius:22px;border:1px solid ${theme.line};background:${p.src?`url(${esc(p.src)}) center/${p.fit||'cover'} no-repeat`:theme.card};display:grid;place-items:center;color:${theme.muted};font-weight:800;text-align:center">${p.src?'':'UPLOAD IMAGE'}</div>`;
  if(e.type==='card')return `<article ${attrs} style="padding:24px;border:1px solid ${theme.line};border-radius:20px;background:${theme.card}">${p.tag?`<div style="font-size:11px;color:${theme.accent};font-weight:900;letter-spacing:.1em">${esc(p.tag)}</div>`:''}${p.icon?`<div style="color:${theme.accent};font-weight:900;font-size:20px">${esc(p.icon)}</div>`:''}<h4 style="font-size:20px;margin:9px 0">${esc(p.title||'Card')}</h4>${p.price?`<div style="font-size:26px;font-weight:900;margin-bottom:8px">${esc(p.price)}</div>`:''}<p style="margin:0;color:${theme.muted};line-height:1.55">${esc(p.body||'Add your content here.')}</p></article>`;
  if(e.type==='stat')return `<div ${attrs} style="padding:22px;border:1px solid ${theme.line};background:${theme.card};border-radius:16px"><div style="font-size:34px;font-weight:900">${esc(p.value)}</div><div style="color:${theme.muted};font-size:11px;letter-spacing:.1em">${esc(p.label)}</div></div>`;
  if(e.type==='product')return `<article ${attrs} style="padding:14px;border:1px solid ${theme.line};border-radius:20px;background:${theme.card}"><div style="height:210px;border-radius:15px;background:${theme.bg};display:grid;place-items:center;color:${theme.muted}">PRODUCT IMAGE</div><h4 style="margin:13px 4px 4px;font-size:18px">${esc(p.name)}</h4><div style="margin:0 4px 10px;color:${theme.muted}">${esc(p.price)}</div></article>`;
  if(e.type==='project'||e.type==='proof')return `<article ${attrs} style="padding:${e.type==='proof'?'13px 0':'0 0 18px'};${e.type==='project'?`border-bottom:1px solid ${theme.line}`:''}">${e.type==='project'?`<div style="height:180px;background:${theme.card};border:1px solid ${theme.line};border-radius:18px;display:grid;place-items:center;color:${theme.muted}">PROJECT IMAGE</div><div style="display:flex;justify-content:space-between;gap:12px;margin-top:10px;color:${theme.muted};font-size:12px"><span>${esc(p.meta)}</span><span>${esc(p.year)}</span></div><h4 style="margin:7px 0 0;font-size:18px">${esc(p.name)}</h4>`:`<div style="font-weight:800">${esc(p.text)}</div>`}</article>`;
  if(e.type==='countdown')return `<div ${attrs} data-countdown data-days="${Number(p.days||7)}" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap">${['Days','Hours','Minutes','Seconds'].map((x,i)=>`<div style="min-width:84px;padding:18px;border:1px solid ${theme.line};border-radius:15px;background:${theme.card};text-align:center"><div data-count-value="${i}" style="font-size:28px;font-weight:900">0</div><div style="font-size:10px;color:${theme.muted};letter-spacing:.1em">${x.toUpperCase()}</div></div>`).join('')}</div>`;
  if(e.type==='form')return `<form ${attrs} data-demo-form style="max-width:620px;margin:auto;display:flex;gap:10px"><input required type="email" placeholder="${esc(p.placeholder||'you@example.com')}" style="flex:1;padding:13px;border:1px solid ${theme.line};border-radius:10px;background:${theme.card};color:${theme.text}"><button class="btn" style="padding:13px 17px;border:0;border-radius:10px;background:${theme.accent};color:#fff;font-weight:850">${esc(p.button||'Join Waitlist')}</button></form>`;
  return '';
}

function bindCanvas(){
  $$('.site-section').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('.site-element'))return;e.stopPropagation();selected={kind:'section',id:el.dataset.sectionId};renderInspector();render()}));
  $$('.site-element').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();selected={kind:'element',id:el.dataset.elementId};renderInspector();render()}));
  $$('[data-demo-form]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();toast('Demo form submitted');}));
  startCountdowns();
}
function startCountdowns(){$$('[data-countdown]').forEach(root=>{const end=Date.now()+Number(root.dataset.days||7)*86400000;const tick=()=>{let s=Math.max(0,Math.floor((end-Date.now())/1000));const vals=[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];root.querySelectorAll('[data-count-value]').forEach((n,i)=>n.textContent=String(vals[i]).padStart(2,'0'));};tick();setInterval(tick,1000);});}

function renderInspector(){
  const box=$('#inspector');
  if(!selected.id){box.innerHTML='<div class="empty-state">Select a section or element on the canvas to edit it.</div>';return;}
  if(selected.kind==='section'){
    const s=findSection(selected.id);if(!s)return;
    box.innerHTML=`<h4>Section</h4><div class="field"><label>Type</label><input disabled value="${esc(SECTION_LABELS[s.type]||s.type)}"></div><div class="field"><label>Padding</label><input type="number" min="0" max="240" data-prop="padding" value="${Number(s.props.padding||64)}"></div><div class="field"><label>Alignment</label><select data-prop="align"><option ${s.props.align==='left'?'selected':''}>left</option><option ${s.props.align==='center'?'selected':''}>center</option><option ${s.props.align==='right'?'selected':''}>right</option></select></div><h4>Theme</h4><div class="field"><div class="swatches">${Object.entries(THEMES).map(([k,t])=>`<button class="swatch ${doc.theme===k?'active':''}" title="${t.name}" data-theme="${k}" style="background:${t.bg};box-shadow:inset 0 0 0 2px ${t.accent}"></button>`).join('')}</div></div><div class="section-actions"><button class="small-action" data-action="duplicate-section">Duplicate</button><button class="small-action danger" data-action="delete-section">Delete</button><button class="small-action" data-action="move-up">Move ↑</button><button class="small-action" data-action="move-down">Move ↓</button></div>`;
  }else{
    const found=findElement(selected.id);if(!found)return;const e=found.element,p=e.props||{};
    box.innerHTML=`<h4>Element</h4><div class="field"><label>Type</label><input disabled value="${esc(e.type)}"></div>${TEXT_TYPES.has(e.type)&&e.type!=='brand'&&e.type!=='eyebrow'?`<div class="field"><label>Text</label><textarea data-text-prop="text">${esc(p.text||'')}</textarea></div>`:''}${e.type==='brand'||e.type==='eyebrow'?`<div class="field"><label>Text</label><input data-text-prop="text" value="${esc(p.text||'')}"></div>`:''}${e.type==='button'?`<div class="field"><label>Label</label><input data-text-prop="text" value="${esc(p.text||'')}"></div><div class="field"><label>Link</label><input data-text-prop="href" value="${esc(p.href||'')}"></div>`:''}${e.type==='heading'||e.type==='paragraph'||e.type==='brand'||e.type==='eyebrow'?`<div class="row-2"><div class="field"><label>Font size</label><input type="number" min="10" max="160" data-text-prop="fontSize" value="${Number(p.fontSize||16)}"></div><div class="field"><label>Weight</label><input type="number" min="300" max="1000" step="50" data-text-prop="fontWeight" value="${Number(p.fontWeight||750)}"></div></div>`:''}${e.type==='image'?`<div class="field"><label>Image</label><input id="imageUpload" type="file" accept="image/*"></div><div class="field"><label>Fit</label><select data-text-prop="fit"><option ${p.fit==='cover'?'selected':''}>cover</option><option ${p.fit==='contain'?'selected':''}>contain</option></select></div>`:''}${e.type==='card'?`<div class="field"><label>Title</label><input data-text-prop="title" value="${esc(p.title||'')}"></div><div class="field"><label>Body</label><textarea data-text-prop="body">${esc(p.body||'')}</textarea></div><div class="field"><label>Price / label</label><input data-text-prop="price" value="${esc(p.price||p.tag||'')}"></div>`:''}${e.type==='product'?`<div class="field"><label>Product name</label><input data-text-prop="name" value="${esc(p.name||'')}"></div><div class="field"><label>Price</label><input data-text-prop="price" value="${esc(p.price||'')}"></div>`:''}<div class="section-actions"><button class="small-action danger" data-action="delete-element">Delete</button></div>`;
  }
  bindInspector();
}
function bindInspector(){
  $$('[data-prop]').forEach(inp=>inp.addEventListener('change',()=>{const s=findSection(selected.id);s.props[inp.dataset.prop]=inp.type==='number'?Number(inp.value):inp.value;commit('Updated section')}));
  $$('[data-theme]').forEach(btn=>btn.addEventListener('click',()=>{doc.theme=btn.dataset.theme;commit('Theme changed')}));
  $$('[data-text-prop]').forEach(inp=>inp.addEventListener('change',()=>{const f=findElement(selected.id);f.element.props[inp.dataset.textProp]=inp.type==='number'?Number(inp.value):inp.value;commit('Updated element')}));
  $('#imageUpload')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{const f=findElement(selected.id);f.element.props.src=r.result;doc.assets.push({id:uid('asset'),name:file.name,type:file.type,data:r.result});commit('Image added')};r.readAsDataURL(file)});
  $$('[data-action]').forEach(btn=>btn.addEventListener('click',()=>handleAction(btn.dataset.action)));
}
function handleAction(action){
  const secs=currentPage().sections;const si=secs.findIndex(s=>s.id===selected.id);
  if(action==='duplicate-section'&&si>=0){const c=clone(secs[si]);c.id=uid('section');c.children?.forEach(e=>e.id=uid('el'));secs.splice(si+1,0,c);commit('Section duplicated');return}
  if(action==='delete-section'&&si>=0){secs.splice(si,1);selected={kind:null,id:null};commit('Section deleted');return}
  if(action==='move-up'&&si>0){[secs[si-1],secs[si]]=[secs[si],secs[si-1]];commit('Section moved');return}
  if(action==='move-down'&&si>=0&&si<secs.length-1){[secs[si+1],secs[si]]=[secs[si],secs[si+1]];commit('Section moved');return}
  if(action==='delete-element'){const f=findElement(selected.id);if(f){f.section.children=f.section.children.filter(e=>e.id!==selected.id);selected={kind:null,id:null};commit('Element deleted')}}
}

function addSection(type){currentPage().sections.push(defaultSection(type));commit('Section added')}
function addElement(type){if(selected.kind!=='section'){toast('Select a section first');return}const s=findSection(selected.id);const presets={heading:{text:'New heading',fontSize:40,fontWeight:750},paragraph:{text:'Add your paragraph here.',fontSize:16,color:'muted'},button:{text:'New button',href:'#',variant:'primary'},image:{src:'',alt:'Image'},card:{title:'New card',body:'Add card content.'},stat:{value:'00',label:'EDITABLE'},quote:{text:'Add a quote'}};s.children.push(makeElement(type,presets[type]||{}));commit('Element added');selected={kind:'element',id:s.children.at(-1).id};render()}
function exportHtml(){const theme=THEMES[doc.theme]||THEMES.aurora;const body=currentPage().sections.map(renderSection).join('');const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(doc.name)}</title><style>*{box-sizing:border-box}body{margin:0;background:${theme.bg};color:${theme.text};font-family:${doc.settings.fontFamily};line-height:1.5}a{color:inherit;text-decoration:none}.wrap{width:min(${doc.settings.maxWidth}px,92%);margin:auto}.btn{display:inline-flex}input{font:inherit}</style></head><body><div class="wrap">${body}</div></body></html>`;const blob=new Blob([html],{type:'text/html'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${doc.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')||'dewify-site'}.html`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200);toast('HTML exported')}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(doc));setStatus('Saved locally');toast('Project saved')}
function load(){const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;try{doc=JSON.parse(raw);history=[snapshot()];historyIndex=0;selected={kind:null,id:null};render();toast('Project loaded')}catch{toast('Saved project is invalid')}}
function openTemplate(name){foundation=name;doc=starterDocument(name+' Website',name);history=[snapshot()];historyIndex=0;selected={kind:null,id:null};render();toast(`${name} loaded`)}

function renderLibrary(tab='sections'){
  const lib=$('#library');
  if(tab==='sections'){
    lib.innerHTML=`<div class="insert-group"><h4>Start from design</h4><div class="insert-grid">${Object.keys(FOUNDATION_META).map(n=>`<button class="insert-card" data-foundation="${n}"><strong>${n}</strong><span>${FOUNDATION_META[n].sections.length} structured sections</span></button>`).join('')}</div></div><div class="insert-group"><h4>Add section</h4><div class="insert-grid">${Object.keys(SECTION_LABELS).map(t=>`<button class="insert-card" data-add-section="${t}"><strong>${SECTION_LABELS[t]}</strong><span>Reusable block</span></button>`).join('')}</div></div>`;
    $$('[data-foundation]').forEach(b=>b.onclick=()=>openTemplate(b.dataset.foundation));
    $$('[data-add-section]').forEach(b=>b.onclick=()=>addSection(b.dataset.addSection));
  }else{
    const els=['heading','paragraph','button','image','card','stat'];
    lib.innerHTML=`<div class="insert-group"><h4>Elements</h4><div class="insert-grid">${els.map(t=>`<button class="insert-card" data-add-element="${t}"><strong>${t[0].toUpperCase()+t.slice(1)}</strong><span>Add to selected section</span></button>`).join('')}</div></div><div class="insert-group"><h4>Assets</h4><div class="empty-state" style="padding:4px">Use the image control in the inspector to add local assets. The document stores them separately for a future cloud asset manager.</div></div>`;
    $$('[data-add-element]').forEach(b=>b.onclick=()=>addElement(b.dataset.addElement));
  }
}

$('#insertTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;$$('.tab').forEach(x=>x.classList.toggle('active',x===b));renderLibrary(b.dataset.tab)});
$('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;$('#saveBtn').onclick=save;$('#exportBtn').onclick=exportHtml;
$('#previewBtn').onclick=()=>{document.body.classList.toggle('preview-mode');toast(document.body.classList.contains('preview-mode')?'Preview mode':'Editor mode')};
$('#projectName').addEventListener('change',e=>{doc.name=e.target.value.trim()||'Untitled Website';commit('Project renamed')});
$$('[data-device]').forEach(b=>b.onclick=()=>{$$('[data-device]').forEach(x=>x.classList.remove('active'));b.classList.add('active');device=b.dataset.device;$('#canvasFrame').className=`canvas-frame ${device}`});
$('#zoomOut').onclick=()=>{zoom=Math.max(.6,zoom-.1);$('#siteCanvas').style.zoom=zoom;$('#zoomLabel').textContent=Math.round(zoom*100)+'%'};
$('#zoomIn').onclick=()=>{zoom=Math.min(1.5,zoom+.1);$('#siteCanvas').style.zoom=zoom;$('#zoomLabel').textContent=Math.round(zoom*100)+'%'};
window.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}if(mod&&e.key.toLowerCase()==='y'){e.preventDefault();redo()}if(mod&&e.key.toLowerCase()==='s'){e.preventDefault();save()}});

renderLibrary();history=[snapshot()];historyIndex=0;render();load();
