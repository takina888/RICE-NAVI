const DATA_FILES = {
  modules: 'data/rice_navi_module_manifest_v2.json',
  menu: 'data/rice_navi_app_menu_v2.json',
  learning: 'data/rice_navi_learning_cards_multilingual_current.json',
  glossary: 'data/rice_navi_term_glossary_multilingual_v82.json',
  water: 'data/rice_navi_storage_mold_rules_v1_0.json',
  future: 'data/rice_navi_future_rice_50_ja_LATEST.json',
  tempEvents: 'data/rice_navi_temperature_event_map_v77.json'
};
const state = { view:'home', lang:'ja', query:'', data:{} };
const fortuneSeeds = [
  {title:'吸水運アップ', msg:'急がず、準備の時間を大切にすると整いやすい日です。', rice:'コシヒカリ', step:'浸漬', emoji:'🍚'},
  {title:'ふっくら運', msg:'水分の行き先をよく見ると、次の一手が見えやすい日です。', rice:'あきたこまち', step:'蒸らし', emoji:'🌾'},
  {title:'観察運アップ', msg:'結果だけでなく、温度と時間の流れを見直すと発見があります。', rice:'ひとめぼれ', step:'温度記録', emoji:'📈'},
  {title:'粒感運', msg:'粘りと付着性を分けて見ると、炊き上がりの理由が整理できます。', rice:'ササニシキ', step:'ほぐし', emoji:'✨'},
  {title:'水運よし', msg:'水の条件を確認すると、いつもの炊飯が少し読みやすくなります。', rice:'台中秈10号', step:'加水', emoji:'💧'}
];
const homeItems = [
  {view:'fortune', title:'今日の米占い', sub:'毎日軽く楽しめる米テーマの一言', icon:'🍚', art:'🌾', main:true},
  {view:'history', title:'現在地のお米ヒストリー', sub:'今いる場所のお米の歴史を表示する', icon:'📍', art:'🏞️'},
  {view:'world', title:'世界のライス物語', sub:'世界の米文化・料理・食べ方を読む', icon:'🌏', art:'🍛'},
  {view:'future', title:'お米の未来', sub:'これからの米づくり、技術、食文化を読む', icon:'🌱', art:'🚜'},
  {view:'library', title:'炊飯文献ライブラリ', sub:'炊飯に関する文献・claimを整理する', icon:'📚', art:'🏅', important:true},
  {view:'meister', title:'お米マイスター100', sub:'米の基本を100テーマで学ぶ', icon:'🎓', art:'📖'},
  {view:'varieties', title:'米品種図鑑', sub:'世界と日本の米品種を調べる', icon:'🔎', art:'🌾'},
  {view:'water', title:'水の相性チェック', sub:'pH、硬度、TDSなどから水と炊飯の関係を見る', icon:'💧', art:'💦'},
  {view:'environment', title:'気温・湿度・保管環境チェック', sub:'現在の環境から米の保管・吸水・カビリスクを見る', icon:'🌤️', art:'🌡️'},
  {view:'bin', title:'納米庫チェッカー', sub:'納米庫の湿度、結露、残留米、カビ臭を確認する', icon:'🏭', art:'✅'}
];
async function loadJson(path){ const r = await fetch(path); if(!r.ok) throw new Error(`${path}: ${r.status}`); return r.json(); }
async function init(){
  try{
    const [modules, menu, learning, glossary, water, future, tempEvents] = await Promise.all(Object.values(DATA_FILES).map(loadJson));
    state.data = {modules, menu, learning, glossary, water, future, tempEvents};
    wireEvents(); render();
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js').catch(()=>{}); }
  }catch(e){ document.getElementById('app').innerHTML = `<section class="panel"><h2>読み込みエラー</h2><p>${esc(e.message)}</p></section>`; }
}
function wireEvents(){
  document.querySelectorAll('.bottom-nav button').forEach(b => b.addEventListener('click',()=>{ state.view=b.dataset.view; setActive(); render(); window.scrollTo({top:0,behavior:'smooth'}); }));
  document.getElementById('searchToggle').addEventListener('click',()=>document.getElementById('searchInput').focus());
  document.getElementById('searchInput').addEventListener('input', e=>{ state.query=e.target.value.trim().toLowerCase(); if(state.query && state.view==='home') state.view='library'; setActive(); render(); });
  document.getElementById('languageSelect').addEventListener('change',e=>{ state.lang=e.target.value; render(); });
}
function setActive(){ document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active', b.dataset.view===state.view)); }
function render(){
  const app=document.getElementById('app');
  if(state.view==='home') app.innerHTML = renderHome();
  else if(state.view==='meister') app.innerHTML = renderMeister();
  else if(state.view==='library') app.innerHTML = renderLibrary();
  else if(state.view==='checks') app.innerHTML = renderChecks();
  else if(state.view==='status') app.innerHTML = renderStatus();
  else if(state.view==='fortune') app.innerHTML = renderFortuneDetail();
  else if(state.view==='history') app.innerHTML = renderHistory();
  else if(state.view==='world') app.innerHTML = renderWorld();
  else if(state.view==='future') app.innerHTML = renderFuture();
  else if(state.view==='varieties') app.innerHTML = renderVarieties();
  else if(state.view==='water' || state.view==='environment' || state.view==='bin') app.innerHTML = renderChecks(state.view);
}
function todayIdx(n){ const d=new Date(); const s=new Date(d.getFullYear(),0,0); return Math.floor((d-s)/86400000)%n; }
function todayFortune(){ return fortuneSeeds[todayIdx(fortuneSeeds.length)]; }
function localized(card){ return card.i18n?.[state.lang] || card.i18n?.ja || card; }
function renderHome(){
  const f=todayFortune();
  return `
  <section class="fortune-card" data-view="fortune" onclick="goView('fortune')">
    <div class="fortune-top"><div class="rice-illust">${f.emoji}</div><div><h2>✨ 今日の米占い ✨</h2><p><b>${esc(f.title)}</b><br>${esc(f.msg)}</p></div></div>
    <div class="fortune-tags"><div class="fortune-tag"><small>ラッキー米</small><b>${esc(f.rice)}</b></div><div class="fortune-tag"><small>ラッキー工程</small><b>${esc(f.step)}</b></div></div>
    <div class="carousel-dots"><i></i><i></i><i></i><i></i></div>
  </section>
  <div class="section-title"><h2>今日の入口</h2><span>面白さから入る</span></div>
  <div class="menu-list">${homeItems.slice(1,4).map(menuCard).join('')}</div>
  <div class="section-title"><h2>信頼性の中心</h2><span>文献claim</span></div>
  <div class="menu-list">${homeItems.slice(4,5).map(menuCard).join('')}</div>
  <div class="section-title"><h2>学ぶ・調べる</h2><span>順番に進める</span></div>
  <div class="menu-list">${homeItems.slice(5,7).map(menuCard).join('')}</div>
  <div class="section-title"><h2>現場・環境確認</h2><span>参考値として見る</span></div>
  <div class="menu-list">${homeItems.slice(7).map(menuCard).join('')}</div>
  <div class="notice">位置情報は起動時または1日1回程度の取得を想定。常時バックグラウンド取得はしません。取得できない場合は最後に取得した地域を使います。</div>`;
}
function menuCard(item){ return `<a href="#" class="menu-card ${item.important?'important':''}" onclick="goView('${item.view}');return false"><div class="menu-icon">${item.icon}</div><div><h3>${item.title}</h3><p>${item.sub}</p></div><div class="menu-art">${item.art}</div><div class="chev">›</div></a>`; }
function renderFortuneDetail(){ const f=todayFortune(); return `<section class="fortune-card"><div class="fortune-top"><div class="rice-illust">${f.emoji}</div><div><h2>今日の米占い</h2><p><b>${esc(f.title)}</b><br>${esc(f.msg)}</p></div></div><div class="fortune-tags"><div class="fortune-tag"><small>ラッキー米</small><b>${esc(f.rice)}</b></div><div class="fortune-tag"><small>ラッキー工程</small><b>${esc(f.step)}</b></div></div></section><section class="panel"><h2>注意</h2><p>米占いはお楽しみ機能です。診断・品質判定・現場判断には使いません。</p></section>`; }
function renderHistory(){ return `<section class="panel"><h2>現在地のお米ヒストリー</h2><span class="badge">現在地：台湾</span><p>この土地のお米ヒストリーを表示します。例：日本統治時代の台湾では、日本型の稉米を台湾の気候に合わせる品種改良が進み、蓬莱米の普及につながりました。</p><p class="small">この表示は最後に取得した位置情報をもとにしています。現在地と違う場合は地域を変更してください。</p></section>`; }
function renderWorld(){ return `<section class="panel"><h2>世界のライス物語</h2><p>世界各地の米文化・料理・食べ方を週1ストーリーで表示します。過去のストーリーも閲覧できる想定です。</p></section><div class="card-grid">${['台湾のQ弾食感','日本のおにぎり文化','タイの香り米','インドのビリヤニ'].map((x,i)=>`<article class="learning-card"><span class="badge">Story ${i+1}</span><h3>${x}</h3><p>米の種類、水分、粘り、粒感、料理との相性につながる短い読み物。</p></article>`).join('')}</div>`; }
function renderFuture(){ const items=(state.data.future.items||[]).slice(0,12); return `<section class="panel"><h2>お米の未来</h2><p>研究・政策・社会変化に沿った、少しやわらかい未来読み物です。</p></section><div class="card-grid">${items.map(i=>`<article class="learning-card"><span class="badge">${esc(i.category)}</span><h3>${esc(i.title_ja)}</h3><p><b>${esc(i.subtitle_ja||'')}</b></p><p>${esc(i.body_ja||'')}</p></article>`).join('')}</div>`; }
function renderMeister(){
  const cards=state.data.learning || [];
  const chunks=[cards.slice(0,28),cards.slice(28,56),cards.slice(56,82)];
  const labels=['初級','中級','上級'];
  const tempRows = (state.data.tempEvents||[]).slice(0,6).map(e=>`<tr><td>${esc(e.temperature_range || e.temperature_band || e.temperature || '')}</td><td>${esc(e.rice_change_event || e.event || e.summary || '')}</td></tr>`).join('');
  return `<section class="panel"><h2>お米マイスター100</h2><p>米の基本と炊飯工程を、初級・中級・上級に分けて順番に学びます。</p><div class="course-strip">${labels.map((l,i)=>`<button class="course-chip" onclick="document.getElementById('course${i}').scrollIntoView({behavior:'smooth'})">${l}</button>`).join('')}</div></section>
  <section class="panel"><h2>温度と時間の関係</h2><p class="small">以前作成した「温度×時間×水分×物性」の工程表は、お米マイスター内の中核表として配置します。</p><table class="temp-table">${tempRows || '<tr><td>60℃前後</td><td>糊化が始まる温度帯として学ぶ</td></tr><tr><td>98℃以上</td><td>高温保持時間と糊化の関係を見る</td></tr>'}</table></section>
  ${chunks.map((chunk,i)=>`<section class="panel" id="course${i}"><h2>${labels[i]}</h2><p class="small">${i===0?'米と炊飯工程の基本':i===1?'水・温度・物性の関係':'条件付きclaimとトラブル接続'}</p></section><div class="lesson-list">${chunk.slice(0,12).map((c,j)=>{const lc=localized(c); return `<article class="lesson-item" onclick="goView('library','${c.card_id}')"><div class="lesson-no">${i*28+j+1}</div><div><h3>${esc(lc.title)}</h3><p>${esc(lc.short||'')}</p></div><div class="chev">›</div></article>`}).join('')}</div>`).join('')}`;
}
function renderLibrary(targetId){
  const q=state.query;
  const cards=(state.data.learning||[]).filter(c=>!q || JSON.stringify(c).toLowerCase().includes(q));
  return `<section class="panel"><h2>炊飯文献ライブラリ</h2><p>RICE NAVIの信頼性の中心です。文献claim、条件、使える範囲、注意点を確認します。</p><p class="small">${cards.length} / ${(state.data.learning||[]).length} cards</p></section><div class="card-grid">${cards.map(renderLearningCard).join('')}</div>`;
}
function renderLearningCard(card){ const c=localized(card); const st=card.status||'formal'; return `<article class="learning-card" id="${esc(card.card_id)}"><span class="badge ${st}">${esc(st)}</span><span class="badge">${esc(card.evidence_level||'')}</span><h3>${esc(c.title||card.card_id)}</h3><p><b>${esc(c.short||'')}</b></p><p>${esc(c.easy||'')}</p>${c.numbers_conditions?`<p><b>数値・条件：</b>${esc(c.numbers_conditions)}</p>`:''}${c.warning?`<div class="notice">${esc(c.warning)}</div>`:''}<div class="trace">source: ${esc(card.source_ids||c.source_ids||'')}<br>claim: ${esc(card.claim_ids||c.claim_ids||'')}</div></article>`; }
function renderChecks(specific){
  const all=[homeItems[7],homeItems[8],homeItems[9]];
  const items=specific ? all.filter(x=>x.view===specific) : all;
  const purpose=state.data.water?.purpose?.ja || '水質・保存・納米庫の状態を確認します。';
  return `<section class="panel"><h2>現場・環境確認</h2><p>${esc(purpose).replace('納米庫・米タンク・ホッパー周辺','納米庫周辺')}</p><p class="small">地域参考値や入力値は断定ではなく、確認の入口として扱います。</p></section><div class="menu-list">${items.map(menuCard).join('')}</div><section class="panel"><h2>確認例</h2><ul>${['pH・硬度・TDS・残留塩素を見る','高温高湿時の保管注意を確認する','納米庫の結露、残留米、カビ臭、虫を確認する'].map(x=>`<li>${x}</li>`).join('')}</ul></section>`;
}
function renderVarieties(){ return `<section class="panel"><h2>米品種図鑑</h2><p>品種名、国・地域、系統、粒形、アミロース、たんぱく質、食味・食感、用途、出典を確認する図鑑です。</p><div class="notice">一般参考値は入れません。不明な数値は未確認、推定値は推定と明記します。</div></section>`; }
function renderStatus(){ const mods=state.data.modules.modules||[]; return `<section class="panel"><h2>統合状況</h2><p>RICE NAVI v9 home UI redesign。アプリは1つ、Excel/JSONは用途別分割管理。</p></section><div class="card-grid">${mods.map(m=>`<article class="learning-card"><h3>${esc(m.display_name?.ja||m.module_id)}</h3><span class="badge ${m.status==='ready'||m.status==='ja_ready'?'formal':'conditional'}">${esc(m.status)}</span><p class="small">${esc(m.source||'')}</p><p class="small">count: ${esc(m.count ?? '-')}</p></article>`).join('')}</div>`; }
function goView(view,target){ state.view=view; setActive(); render(); setTimeout(()=>{ if(target){ document.getElementById(target)?.scrollIntoView({behavior:'smooth'}); } else { window.scrollTo({top:0,behavior:'smooth'}); } },30); }
function esc(v){ return String(v??'').replace(/[&<>'"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[s])); }
init();
