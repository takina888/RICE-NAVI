(() => {
  'use strict';
  const VERSION = '28';
  const app = document.getElementById('app');
  const state = {
    lang: localStorage.getItem('riceNaviLang') || 'ja',
    manifest: null,
    core: {},
    modules: {},
    view: 'home',
    selected: null,
    filters: {},
    weather: null
  };

  const MODULES = [
    { id:'stories', nav:'reading', icon:'🌏', title:'世界のライス物語', desc:'今週と過去1か月の米文化ストーリー', count:'52週' },
    { id:'rankings', nav:'reading', icon:'📊', title:'世界の米ランキング', desc:'4ヶ国語対応。世界の米を数字で見る', count:'11件' },
    { id:'future', nav:'reading', icon:'🌱', title:'お米の未来', desc:'気候・技術・流通から見る未来の米', count:'50件' },
    { id:'jpReading', nav:'reading', icon:'🍵', title:'日本語限定読み物', desc:'米笑点など、日本語だけの読み物コーナー', count:'237件' },
    { id:'meister', nav:'learning', icon:'🎓', title:'お米マイスター100', desc:'初級30・中級40・上級30の学習コース', count:'100件' },
    { id:'library', nav:'library', icon:'📚', title:'炊飯文献ライブラリ', desc:'文献カード・claim・工程データの入口', count:'82+235' },
    { id:'dictionary', nav:'learning', icon:'🔤', title:'米辞典', desc:'米用語と4言語訳。今日の米言葉の本体', count:'30語' },
    { id:'tempMap', nav:'learning', icon:'🔥', title:'温度×時間マップ', desc:'浸漬から保温・冷却まで工程で見る', count:'9工程' },
    { id:'water', nav:'check', icon:'💧', title:'水の相性チェック', desc:'地域水質・pH・硬度・スケール注意', count:'7地域' },
    { id:'weather', nav:'check', icon:'☁️', title:'今日の米天気', desc:'天気を保管・吸水・結露注意に変換', count:'API' },
    { id:'storage', nav:'check', icon:'🏚️', title:'保管環境チェック', desc:'気温・湿度・カビ・虫・結露の注意', count:'20規則' },
    { id:'riceBin', nav:'check', icon:'🏭', title:'納米庫チェッカー', desc:'結露・湿度・温度帯を学び、確認する', count:'12項目' },
    { id:'varieties', nav:'library', icon:'🌾', title:'米品種図鑑', desc:'250件マスター。特徴・用途・出典を確認', count:'250件' },
    { id:'history', nav:'reading', icon:'📍', title:'現在地のお米ヒストリー', desc:'いる場所から米の歴史を読む', count:'4地域' }
  ];

  function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function pick(obj){
    if (!obj || typeof obj !== 'object') return obj ?? '';
    return obj[state.lang] ?? obj[state.lang.replace('-', '_')] ?? obj.ja ?? obj.en ?? obj['zh-TW'] ?? obj['zh-CN'] ?? Object.values(obj)[0] ?? '';
  }
  function todayIndex(len, salt=0){ const d=new Date(); return len ? Math.abs((d.getFullYear()*1000 + d.getMonth()*37 + d.getDate()+salt) % len) : 0; }
  async function loadJSON(path){
    const res = await fetch(`${path}?v=${VERSION}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${path} ${res.status}`);
    return await res.json();
  }
  async function cleanupOldCaches(){
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch (e) { console.warn('cache cleanup skipped', e); }
  }
  function setShell(){
    document.body.innerHTML = `
      <div class="header"><div class="topbar">
        <div class="brand"><img src="assets/RICE_NAVI_RN_icon.png?v=28" alt="RN"><div><div class="brand-title">RICE NAVI</div><div class="brand-sub">Rice learning & field navigator</div></div></div>
        <div class="spacer"></div>
        <select class="lang-select" id="langSelect" aria-label="language">
          <option value="ja">日本語</option><option value="en">EN</option><option value="zh-TW">繁中</option><option value="zh-CN">简中</option>
        </select>
        <button class="home-btn" id="homeTop">ホーム</button>
      </div></div>
      <main id="app" class="app"></main>
      <nav class="footer-nav" aria-label="main navigation">
        <button data-nav="home" class="active">ホーム</button><button data-nav="reading">読む</button><button data-nav="learning">学ぶ</button><button data-nav="check">チェック</button>
      </nav>`;
    window.app = document.getElementById('app');
    document.getElementById('langSelect').value = state.lang;
    document.getElementById('langSelect').addEventListener('change', e=>{ state.lang=e.target.value; localStorage.setItem('riceNaviLang', state.lang); render(); });
    document.getElementById('homeTop').addEventListener('click', ()=>showHome());
    document.querySelectorAll('.footer-nav button').forEach(b=>b.addEventListener('click',()=>{
      const nav=b.dataset.nav; if(nav==='home') showHome(); else showCategory(nav);
    }));
  }
  function navActive(nav){ document.querySelectorAll('.footer-nav button').forEach(b=>b.classList.toggle('active', b.dataset.nav===nav)); }
  function main(){ return document.getElementById('app'); }
  function setContent(html){ main().innerHTML = html; window.scrollTo({top:0, behavior:'smooth'}); }
  function showHome(){ state.view='home'; state.selected=null; navActive('home'); renderHome(); }
  function showCategory(nav){ state.view='category'; state.selected=nav; navActive(nav); renderCategory(nav); }
  function showModule(id){ state.view='module'; state.selected=id; navActive((MODULES.find(m=>m.id===id)||{}).nav || 'home'); renderModule(id); }

  function render(){ if(state.view==='home') renderHome(); else if(state.view==='category') renderCategory(state.selected); else if(state.view==='module') renderModule(state.selected); }
  function summaryCounts(){
    const c = state.manifest?.counts || {};
    return `<div class="hero-grid">
      <div class="hero-stat"><b>${c.rice_varieties||250}</b><span>米品種</span></div>
      <div class="hero-stat"><b>${c.meister||100}</b><span>マイスター</span></div>
      <div class="hero-stat"><b>${c.future||50}</b><span>お米の未来</span></div>
      <div class="hero-stat"><b>${c.jp_reading||237}</b><span>日本語読み物</span></div>
    </div>`;
  }
  function renderHome(){
    const home=state.core.home||{}, learn=state.core.learning||{};
    const fortune=(home.fortunes||[])[todayIndex((home.fortunes||[]).length)]||{};
    const term=(learn.terms||[])[todayIndex((learn.terms||[]).length, 7)]||{};
    const history=(home.histories||[])[0]||{};
    setContent(`
      <section class="hero">
        <h1>RICE NAVI</h1>
        <p>米の特徴、炊飯工程、水、保管、文化、ランキングをつなげて見るためのナビゲーションです。</p>
        ${summaryCounts()}
      </section>
      <section class="dashboard">
        <article class="today-card"><h2>今日の米占い</h2><p class="lead">${esc(fortune.title)}</p><p>${esc(fortune.message)}</p><span class="pill">${esc(fortune.rice)}</span><span class="pill">${esc(fortune.process)}</span></article>
        <article class="today-card"><h2>今日の米天気</h2><p class="lead" id="weatherLead">現在地から確認</p><p id="weatherNote">天気を保管・吸水・結露注意に変換します。</p><button class="action" id="weatherBtn">天気を確認</button></article>
        <article class="today-card"><h2>今日の米言葉</h2><p class="lead">${esc(term.term_ja)}</p><p>${esc(term.note_ja)}</p><span class="pill">EN ${esc(term.term_en)}</span><button class="ghost" data-open="dictionary">米辞典で見る</button></article>
      </section>
      <section class="section"><div class="section-head"><div><h2>入口</h2><p class="desc">必要なところから開きます。重いデータは画面を開いた時だけ読み込みます。</p></div></div><div class="module-grid">${MODULES.map(tile).join('')}</div></section>
      <section class="section"><div class="section-head"><div><h2>現在地のお米ヒストリー</h2><p class="desc">${esc(history.region || '台湾')}</p></div></div><p>${esc(history.body || '')}</p><button class="ghost" data-open="history">詳しく見る</button></section>`);
    bindOpeners();
    const w=document.getElementById('weatherBtn'); if(w) w.addEventListener('click', requestWeather);
  }
  function tile(m){ return `<button class="module-tile" data-open="${m.id}"><span class="count">${esc(m.count)}</span><div class="module-icon">${m.icon}</div><h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p></button>`; }
  function bindOpeners(){ document.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>showModule(el.dataset.open))); }
  function renderCategory(nav){
    const title = nav==='reading'?'読む':nav==='learning'?'学ぶ':nav==='library'?'文献・図鑑':'チェック';
    const mods = MODULES.filter(m=>m.nav===nav || (nav==='library' && m.nav==='library'));
    setContent(`<section class="section"><div class="section-head"><button class="back" id="backHome">← ホームへ</button><div><h2>${title}</h2><p class="desc">機能を選んでください。</p></div></div><div class="module-grid">${mods.map(tile).join('')}</div></section>`);
    document.getElementById('backHome').onclick=showHome; bindOpeners();
  }
  async function renderModule(id){
    const mod=MODULES.find(m=>m.id===id); if(!mod) return showHome();
    setContent(`<section class="section"><div class="section-head"><button class="back" id="backHome">← ホームへ</button><div><h2>${esc(mod.title)}</h2><p class="desc">読み込み中です。</p></div></div><div class="skeleton"></div></section>`);
    document.getElementById('backHome').onclick=showHome;
    try{
      if(id==='varieties') await ensureModule('rice_varieties');
      if(id==='rankings') await ensureModule('world_rice_rankings');
      if(id==='jpReading') await ensureModule('jp_reading_corner');
      const html = await moduleHTML(id, mod);
      setContent(html); bindModuleEvents(id);
    }catch(e){
      setContent(`<section class="section"><div class="section-head"><button class="back" id="backHome">← ホームへ</button><div><h2>${esc(mod.title)}</h2><p class="desc danger">読み込みに失敗しました。</p></div></div><p>${esc(e.message)}</p></section>`); document.getElementById('backHome').onclick=showHome;
    }
  }
  async function ensureModule(key){ if(!state.modules[key]) state.modules[key]=await loadJSON(state.manifest.modules[key]); }
  function head(mod, extra=''){ return `<section class="section"><div class="section-head"><button class="back" id="backHome">← ホームへ</button><div><h2>${esc(mod.title)}</h2><p class="desc">${esc(mod.desc)}</p></div></div>${extra}`; }
  async function moduleHTML(id, mod){
    const learn=state.core.learning||{}, reading=state.core.reading||{}, check=state.core.check||{}, home=state.core.home||{};
    if(id==='dictionary') return head(mod, searchBar('termSearch') + listTerms(learn.terms||[])) + `</section>`;
    if(id==='meister') return head(mod, chips(['すべて','初級','中級','上級'], 'levelChip') + `<div class="list" id="meisterList">${meisterList(learn.meister||[])}</div>`) + `</section>`;
    if(id==='library') return head(mod, `<div class="notice">文献カード82件と工程claim235件を分けて表示します。詳細では条件・注意・参照範囲を確認します。</div>` + searchBar('libSearch') + `<div class="grid2"><div><h3>文献カード</h3><div class="list" id="cardList">${learningCards(learn.learning_cards||[])}</div></div><div><h3>工程claim</h3><div class="list" id="claimList">${claims(learn.process_claims||[])}</div></div></div>`) + `</section>`;
    if(id==='tempMap') return head(mod, `<div class="list">${(learn.temp_map||[]).map((x,i)=>card(`<h3>${esc(x.stage)}</h3><p>${esc(x.event)}</p><div class="meta"><span>温度: ${esc(x.temp)}</span><span>時間: ${esc(x.time)}</span></div><p><b>見る点:</b> ${esc(x.watch)}</p>`, i)).join('')}</div>`) + `</section>`;
    if(id==='stories') return head(mod, `<div class="notice">表示は今週＋過去1か月分です。全件をいきなり並べません。</div><div class="list">${(reading.stories||[]).slice(0,5).map((s,i)=>card(`<h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p><details><summary>本文を見る</summary><p>${esc(s.body)}</p></details><div class="meta"><span>Week ${esc(s.week)}</span></div>`,i)).join('')}</div>`) + `</section>`;
    if(id==='future') return head(mod, searchBar('futureSearch') + `<div class="list" id="futureList">${(reading.future||[]).map((f,i)=>card(`<h3>${esc(f.title)}</h3><p>${esc(f.subtitle||f.body)}</p><details><summary>詳しく見る</summary><p>${esc(f.body)}</p><div class="meta"><span>${esc(f.category)}</span><span>${esc(f.source_type)}</span></div></details>`,i)).join('')}</div>`) + `</section>`;
    if(id==='history') return head(mod, `<div class="list">${(home.histories||[]).map((h,i)=>card(`<h3>${esc(h.title)}</h3><p>${esc(h.body)}</p><div class="meta"><span>${esc(h.region)}</span><span>${esc(h.note)}</span></div>`,i)).join('')}</div>`) + `</section>`;
    if(id==='rankings') { const r=state.modules.world_rice_rankings; return head(mod, `<div class="toolbar"><select id="rankLang" class="lang-select"><option value="ja">日本語</option><option value="en">English</option><option value="zh-TW">繁體中文</option><option value="zh-CN">简体中文</option></select></div><div class="list" id="rankingList">${rankingList(r.rankings||[])}</div>`) + `</section>`; }
    if(id==='jpReading') { const j=state.modules.jp_reading_corner; return head(mod, `<div class="notice">この読み物コーナーだけ日本語限定です。</div>${searchBar('jpSearch')}<div class="list" id="jpList">${jpReadingList((j.items||[]).slice(0,80))}</div>`) + `</section>`; }
    if(id==='varieties') { const v=state.modules.rice_varieties; return head(mod, `<div class="ok">250件マスターを使用。未確認項目は未確認として表示します。</div>${searchBar('varietySearch')}<div class="toolbar"><button class="chip active" data-var-filter="all">すべて</button><button class="chip" data-var-filter="台湾">台湾</button><button class="chip" data-var-filter="日本">日本</button><button class="chip" data-var-filter="Asia">Asia</button></div><div class="list" id="varietyList">${varietyList((v.varieties||[]).slice(0,80))}</div>`) + `</section>`; }
    if(id==='water') return head(mod, `<div class="grid2"><div class="card"><h3>地域参考水質</h3><p>GPSは水を測るものではありません。地域参考値として見ます。</p>${(check.region_water||[]).slice(0,5).map(r=>`<span class="pill">${esc(r.area_name_ja||r.country_ja)}</span>`).join('')}</div><div class="card"><h3>水質claim</h3>${(check.water_claims||[]).slice(0,5).map(c=>`<p>・${esc(c.claim_ja)}</p>`).join('')}</div></div>`) + `</section>`;
    if(id==='weather') return head(mod, `<div class="card"><h3>今日の米天気</h3><p id="weatherDetail">現在地から天気を取得し、保管・吸水・結露注意に変換します。</p><button class="action" id="weatherBtn2">現在地で確認</button></div>`) + `</section>`;
    if(id==='storage') return head(mod, `<div class="list">${(check.mold_rules||[]).map((r,i)=>card(`<h3>${esc(r.condition_ja)}</h3><p>${esc(r.message_ja)}</p><div class="meta"><span>${esc(r.risk_level)}</span><span>${esc(r.input_field)}</span></div>`,i)).join('')}</div>`) + `</section>`;
    if(id==='riceBin') return head(mod, `<div class="notice">納米庫はチェックだけでなく、結露・湿度・温度差を学ぶページとして扱います。</div><div class="grid2"><div>${(check.mold_claims||[]).slice(0,8).map((c,i)=>card(`<h3>${esc(c.theme)}</h3><p>${esc(c.claim_ja)}</p>`,i)).join('')}</div><div>${(check.mold_checklist||[]).map((c,i)=>card(`<h3>${esc(c.check_item)}</h3><p>${esc(c.method)}</p><p><b>NG時:</b> ${esc(c.action_if_ng)}</p>`,i)).join('')}</div></div>`) + `</section>`;
    return head(mod, `<p>準備中です。</p>`) + `</section>`;
  }
  function searchBar(id){ return `<div class="toolbar"><input id="${id}" class="search" placeholder="検索" /></div>`; }
  function card(inner, i){ return `<article class="card" data-i="${i}">${inner}</article>`; }
  function listTerms(items){ return `<div class="list" id="termList">${items.map((t,i)=>card(`<h3>${esc(t.term_ja)}</h3><p>${esc(t.note_ja)}</p><div class="meta"><span>EN ${esc(t.term_en)}</span><span>繁 ${esc(t.term_zh_tw)}</span><span>简 ${esc(t.term_zh_cn)}</span></div>`,i)).join('')}</div>`; }
  function meisterList(items){ return items.map((m,i)=>card(`<h3>${esc(m.no)}. ${esc(m.title)}</h3><p>${esc(m.body)}</p><p><b>今日のポイント:</b> ${esc(m.point)}</p><div class="meta"><span>${esc(m.level)}</span><span>${esc(m.root)}</span></div>`,i)).join(''); }
  function learningCards(items){ return items.slice(0,80).map((x,i)=>card(`<h3>${esc(x.title)}</h3><p>${esc(x.easy || x.short)}</p><details><summary>条件・注意を見る</summary><div class="kv"><b>数値</b><span>${esc(x.numbers)}</span></div><div class="kv"><b>注意</b><span>${esc(x.warning)}</span></div></details>`,i)).join(''); }
  function claims(items){ return items.slice(0,120).map((x,i)=>card(`<h3>${esc(x.theme)}</h3><p>${esc(x.claim)}</p><div class="meta"><span>${esc(x.category)}</span><span>${esc(x.temperature)}</span><span>${esc(x.time)}</span></div>`,i)).join(''); }
  function rankingList(items){ return items.map((r,i)=>card(`<h3>${esc(pick(r.display_title || r.ranking_name))}</h3><p>${esc(pick(r.short_desc))}</p><div class="meta"><span>${esc(pick(r.category))}</span><span>${esc(r.source_name)}</span><span>${esc(r.status)}</span></div><details><summary>注意・出典</summary><p>${esc(pick(r.caution))}</p><p>${esc(r.calculation_method)}</p></details>`,i)).join(''); }
  function jpReadingList(items){ return items.map((x,i)=>card(`<h3>${esc(x.title_or_question)}</h3><p class="lead">${esc(x.text_ja)}</p><div class="meta"><span>${esc(x.series_name)}</span><span>${esc(x.status)}</span></div>`,i)).join(''); }
  function varietyList(items){ return items.map((v,i)=>card(`<h3>${esc(v.display_name_ja || v.variety_name)}</h3><p>${esc(v.app_summary_ja_v1_7 || v.app_summary_ja_v1_6 || v.notes || '特徴情報は未確認です。')}</p><div class="meta"><span>${esc(v.country_ja)}</span><span>${esc(v.rice_type)}</span><span>${esc(v.grain_shape)}</span><span>アミロース ${esc(v.amylose_range || v.amylose_value || '未確認')}</span><span>たんぱく質 ${esc(v.protein_range || v.protein_value || '未確認')}</span></div><details><summary>用途・出典を見る</summary><div class="kv"><b>用途</b><span>${esc(v.main_uses || '未確認')}</span></div><div class="kv"><b>炊飯ポイント</b><span>${esc(v.cooking_points || '未確認')}</span></div><div class="kv"><b>出典</b><span>${esc(v.source_type)} / ${esc(v.source_ids)}</span></div></details>`,i)).join(''); }

  function bindModuleEvents(id){
    const back=document.getElementById('backHome'); if(back) back.onclick=showHome;
    if(id==='dictionary') bindSearch('termSearch','#termList .card');
    if(id==='future') bindSearch('futureSearch','#futureList .card');
    if(id==='jpReading') bindSearch('jpSearch','#jpList .card');
    if(id==='varieties') { bindSearch('varietySearch','#varietyList .card'); document.querySelectorAll('[data-var-filter]').forEach(b=>b.onclick=()=>filterVarieties(b.dataset.varFilter)); }
    if(id==='meister') document.querySelectorAll('.levelChip').forEach(b=>b.onclick=()=>filterMeister(b.textContent));
    if(id==='weather') { const b=document.getElementById('weatherBtn2'); if(b) b.onclick=requestWeather; }
    if(id==='rankings') { const s=document.getElementById('rankLang'); if(s) s.onchange=e=>{ state.lang=e.target.value; document.getElementById('rankingList').innerHTML=rankingList(state.modules.world_rice_rankings.rankings||[]); }; }
  }
  function bindSearch(id, selector){ const input=document.getElementById(id); if(!input) return; input.addEventListener('input',()=>{ const q=input.value.toLowerCase(); document.querySelectorAll(selector).forEach(c=>c.style.display=c.textContent.toLowerCase().includes(q)?'':'none'); }); }
  function filterMeister(level){ document.querySelectorAll('.levelChip').forEach(c=>c.classList.toggle('active', c.textContent===level)); const items=state.core.learning.meister||[]; const out=level==='すべて'?items:items.filter(x=>x.level===level); document.getElementById('meisterList').innerHTML=meisterList(out); }
  function filterVarieties(filter){ document.querySelectorAll('[data-var-filter]').forEach(c=>c.classList.toggle('active', c.dataset.varFilter===filter)); const items=state.modules.rice_varieties.varieties||[]; const out=filter==='all'?items:items.filter(v=>String(v.country_ja||'').includes(filter)||String(v.region_group||'').includes(filter)); document.getElementById('varietyList').innerHTML=varietyList(out.slice(0,120)); }
  async function requestWeather(){
    const update=(msg,note)=>{ const a=document.getElementById('weatherLead'); if(a) a.textContent=msg; const b=document.getElementById('weatherNote'); if(b) b.textContent=note; const c=document.getElementById('weatherDetail'); if(c) c.textContent=`${msg}。${note}`; };
    update('現在地を確認中','ブラウザの位置情報許可が必要です。');
    if(!navigator.geolocation){ update('位置情報が使えません','天気取得は未対応の環境です。'); return; }
    navigator.geolocation.getCurrentPosition(async pos=>{
      try{
        const {latitude, longitude}=pos.coords;
        const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
        const w=await fetch(url,{cache:'no-store'}).then(r=>r.json());
        const temp=w.current?.temperature_2m, hum=w.current?.relative_humidity_2m, rain=w.current?.precipitation;
        let note='通常管理でよい状態です。';
        if(hum>=75) note='湿度が高めです。保管室、米袋、納米庫の結露・カビ臭・濡れた米粒に注意してください。';
        else if(temp>=30) note='高温です。米の保管温度、虫、劣化に注意してください。';
        else if(rain>0) note='雨があります。搬入時の濡れ、床面湿気、袋表面の水分に注意してください。';
        update(`${Math.round(temp)}℃ / 湿度${hum}%`, note);
      }catch(e){ update('天気取得に失敗', '通信環境またはAPI応答を確認してください。'); }
    },()=>update('位置情報が許可されていません','天気は米の保管・結露注意に使います。必要な時だけ許可してください。'),{timeout:8000});
  }
  async function init(){
    try{
      await cleanupOldCaches();
      setShell();
      state.manifest = await loadJSON('data/manifest.json');
      const [home, reading, learning, check] = await Promise.all([
        loadJSON(state.manifest.core.home), loadJSON(state.manifest.core.reading), loadJSON(state.manifest.core.learning), loadJSON(state.manifest.core.check)
      ]);
      state.core = {home, reading, learning, check};
      showHome();
    }catch(e){
      const el=document.getElementById('app')||app;
      el.className='app';
      el.innerHTML=`<section class="section"><h2>起動できませんでした</h2><p class="danger">${esc(e.message)}</p><p>GitHub上で <code>data/manifest.json</code> と <code>data/core/home.json</code> があるか確認してください。</p><p class="small">v28</p></section>`;
    }
  }
  window.addEventListener('DOMContentLoaded', init);
})();
