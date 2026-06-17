const DATA_FILES = {
  modules: 'data/rice_navi_module_manifest_v2.json',
  menu: 'data/rice_navi_app_menu_v2.json',
  importManifest: 'data/rice_navi_json_import_manifest_v2.json',
  learning: 'data/rice_navi_learning_cards_multilingual_v82.json',
  glossary: 'data/rice_navi_term_glossary_multilingual_v82.json',
  water: 'data/rice_navi_storage_mold_rules_v1_0.json',
  future: 'data/rice_navi_future_rice_50_ja_LATEST.json'
};

const T = {
  ja: { subtitle:'炊飯を学ぶ・調べる・確認する', search:'カード検索', today:'今日の炊飯知識', allLearning:'炊飯を学ぶ', glossary:'用語集', water:'水質・保存チェック', future:'お米の未来50', status:'統合状況', conditions:'数値・条件', field:'現場で見るポイント', warning:'注意', terms:'関連用語', trace:'出典・claim', noResult:'該当するカードがありません。', futureNotice:'この読み物は現時点では日本語版です。', pending:'未接続', ready:'接続済み' },
  en: { subtitle:'Learn, check, and navigate rice cooking', search:'Search cards', today:'Today\'s rice cooking knowledge', allLearning:'Learn Rice Cooking', glossary:'Glossary', water:'Water and Storage Check', future:'Future Rice 50', status:'Integration Status', conditions:'Numbers / conditions', field:'Field check points', warning:'Caution', terms:'Related terms', trace:'Sources / claims', noResult:'No matching cards.', futureNotice:'This story content is currently available in Japanese.', pending:'Pending', ready:'Ready' },
  zh_tw: { subtitle:'學習、查詢、確認炊飯', search:'搜尋卡片', today:'今日炊飯知識', allLearning:'學習炊飯', glossary:'用語集', water:'水質與保存檢查', future:'稻米未來50', status:'整合狀態', conditions:'數值與條件', field:'現場確認重點', warning:'注意', terms:'相關用語', trace:'出處與claim', noResult:'沒有符合的卡片。', futureNotice:'此閱讀內容目前為日文版。', pending:'未連接', ready:'已連接' },
  zh_cn: { subtitle:'学习、查询、确认米饭烹煮', search:'搜索卡片', today:'今日米饭烹煮知识', allLearning:'学习米饭烹煮', glossary:'术语表', water:'水质与保存检查', future:'大米未来50', status:'整合状态', conditions:'数值与条件', field:'现场确认要点', warning:'注意', terms:'相关术语', trace:'出处与claim', noResult:'没有匹配的卡片。', futureNotice:'此阅读内容目前为日文版。', pending:'未连接', ready:'已连接' }
};

const state = { lang:'ja', view:'today_learning', data:{}, query:'' };

async function loadJson(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

async function init(){
  try{
    const [modules, menu, importManifest, learning, glossary, water, future] = await Promise.all([
      loadJson(DATA_FILES.modules), loadJson(DATA_FILES.menu), loadJson(DATA_FILES.importManifest),
      loadJson(DATA_FILES.learning), loadJson(DATA_FILES.glossary), loadJson(DATA_FILES.water), loadJson(DATA_FILES.future)
    ]);
    state.data = {modules, menu, importManifest, learning, glossary, water, future};
    wireEvents();
    renderMenu();
    render();
    document.getElementById('loadStatus').textContent = `cards ${learning.length} / terms ${glossary.length} / v7 translation polish`;
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js').catch(()=>{}); }
  }catch(err){
    document.getElementById('app').innerHTML = `<section class="panel"><h2>読み込みエラー</h2><p>${escapeHtml(err.message)}</p></section>`;
  }
}

function wireEvents(){
  const lang = document.getElementById('languageSelect');
  const search = document.getElementById('searchInput');
  lang.addEventListener('change', e => { state.lang = e.target.value; renderMenu(); render(); });
  search.addEventListener('input', e => { state.query = e.target.value.trim().toLowerCase(); render(); });
}

function renderMenu(){
  const menu = document.getElementById('menu');
  const items = [
    {key:'today_learning', label:T[state.lang].today},
    {key:'learning_cards', label:T[state.lang].allLearning},
    {key:'water_storage', label:T[state.lang].water},
    {key:'story_future_rice', label:T[state.lang].future},
    {key:'glossary_translation', label:T[state.lang].glossary},
    {key:'status', label:T[state.lang].status}
  ];
  menu.innerHTML = items.map(item => `<button class="${state.view===item.key?'active':''}" data-view="${item.key}">${item.label}</button>`).join('');
  menu.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { state.view = btn.dataset.view; renderMenu(); render(); }));
  document.getElementById('subtitle').textContent = T[state.lang].subtitle;
  document.getElementById('searchInput').placeholder = T[state.lang].search;
}

function render(){
  const app = document.getElementById('app');
  if(state.view === 'today_learning') app.innerHTML = renderToday();
  else if(state.view === 'learning_cards') app.innerHTML = renderLearning();
  else if(state.view === 'water_storage') app.innerHTML = renderWater();
  else if(state.view === 'story_future_rice') app.innerHTML = renderFuture();
  else if(state.view === 'glossary_translation') app.innerHTML = renderGlossary();
  else app.innerHTML = renderStatus();
}

function localizedCard(card){ return card.i18n?.[state.lang] || card.i18n?.ja || card; }
function todayIndex(length){ const d = new Date(); const start = new Date(d.getFullYear(),0,0); return Math.floor((d - start)/86400000) % length; }
function filterText(text){ return !state.query || (text || '').toLowerCase().includes(state.query); }
function cardSearchBlob(card){
  const c = localizedCard(card);
  return [card.card_id, c.title, c.short, c.easy, c.related_terms, c.numbers_conditions, c.field_check_points, card.status].join(' ');
}

function renderToday(){
  const cards = state.data.learning;
  const card = cards[todayIndex(cards.length)];
  return `<section class="panel today"><h2>${T[state.lang].today}</h2><p class="small">${new Date().toLocaleDateString()}</p></section>${renderCard(card)}`;
}

function renderLearning(){
  const cards = state.data.learning.filter(c => filterText(cardSearchBlob(c)));
  if(!cards.length) return `<section class="empty">${T[state.lang].noResult}</section>`;
  return `<section class="panel"><h2>${T[state.lang].allLearning}</h2><p class="small">${cards.length} / ${state.data.learning.length}</p></section><div class="grid">${cards.map(renderCard).join('')}</div>`;
}

function renderCard(card){
  const c = localizedCard(card);
  const status = card.status || c.status || 'formal';
  return `<article class="card">
    <h3>${escapeHtml(c.title || card.card_id)}</h3>
    <span class="badge ${status}">${escapeHtml(status)}</span><span class="badge">${escapeHtml(card.evidence_level || c.evidence_level || '')}</span>
    <p><b>${escapeHtml(c.short || '')}</b></p>
    <p>${escapeHtml(c.easy || '')}</p>
    ${c.numbers_conditions ? `<div class="kv"><b>${T[state.lang].conditions}</b><span>${escapeHtml(c.numbers_conditions)}</span></div>`:''}
    ${c.field_check_points ? `<div class="kv"><b>${T[state.lang].field}</b><span>${escapeHtml(c.field_check_points)}</span></div>`:''}
    ${c.warning ? `<div class="warning"><b>${T[state.lang].warning}</b><br>${escapeHtml(c.warning)}</div>`:''}
    <div class="meta kv">
      <b>ID</b><span>${escapeHtml(card.card_id || c.card_id || '')}</span>
      <b>${T[state.lang].terms}</b><span>${escapeHtml(c.related_terms || '')}</span>
      <b>${T[state.lang].trace}</b><span>${escapeHtml(card.source_ids || c.source_ids || '')} / ${escapeHtml(card.claim_ids || c.claim_ids || '')}</span>
    </div>
  </article>`;
}

function renderGlossary(){
  const rows = state.data.glossary.filter(t => filterText([t.term_ja,t.term_en,t.term_zh_tw,t.term_zh_cn].join(' ')));
  const fields = {ja:['term_ja','note_ja'], en:['term_en','note_en'], zh_tw:['term_zh_tw','note_zh_tw'], zh_cn:['term_zh_cn','note_zh_cn']}[state.lang];
  return `<section class="panel"><h2>${T[state.lang].glossary}</h2><p class="small">${rows.length} / ${state.data.glossary.length}</p></section><div class="grid">${rows.map(t => `<article class="card"><h3>${escapeHtml(t[fields[0]] || t.term_ja)}</h3><p>${escapeHtml(t[fields[1]] || '')}</p><div class="meta small">JA: ${escapeHtml(t.term_ja)} / EN: ${escapeHtml(t.term_en)}</div></article>`).join('')}</div>`;
}

function renderWater(){
  const w = state.data.water;
  const rules = (w.rules || []).filter(r => filterText([r.rule_id,r.rule_type,r.condition_ja,r.message_ja,r.risk_level].join(' ')));
  const checklist = w.checklist || [];
  return `<section class="panel"><h2>${T[state.lang].water}</h2><p>${escapeHtml(w.purpose || '')}</p><p class="small">rules ${rules.length}</p></section>
  <div class="grid">${rules.map(r => `<article class="card"><h3>${escapeHtml(r.rule_id)} ${escapeHtml(r.rule_type || '')}</h3><span class="badge conditional">${escapeHtml(r.risk_level || '')}</span><p>${escapeHtml(r.condition_ja || '')}</p><p>${escapeHtml(r.message_ja || '')}</p><div class="meta small">claim: ${escapeHtml(r.claim_ids || '')}</div></article>`).join('')}</div>
  ${checklist.length ? `<section class="panel"><h2>Checklist</h2><ul class="check-list">${checklist.map(x=>`<li>${escapeHtml(typeof x === 'string' ? x : JSON.stringify(x))}</li>`).join('')}</ul></section>`:''}`;
}

function renderFuture(){
  const items = (state.data.future.items || []).filter(i => filterText([i.future_id,i.category,i.title_ja,i.subtitle_ja,i.body_ja].join(' ')));
  return `<section class="panel"><h2>${T[state.lang].future}</h2><p class="small">${T[state.lang].futureNotice} ${items.length} / ${state.data.future.items.length}</p></section><div class="grid">${items.map(i => `<article class="card story-card"><span class="badge">${escapeHtml(i.category)}</span><h3>${escapeHtml(i.title_ja)}</h3><p><b>${escapeHtml(i.subtitle_ja || '')}</b></p><p>${escapeHtml(i.body_ja || '')}</p><div class="meta small">${escapeHtml(i.future_id)} / ${escapeHtml(i.evidence_level || '')}</div></article>`).join('')}</div>`;
}

function renderStatus(){
  const modules = state.data.modules.modules || [];
  const lang = state.lang;
  return `<section class="panel"><h2>${T[lang].status}</h2><p class="small">RICE NAVI single app / split database import</p></section><div class="grid">${modules.map(m => `<article class="card"><h3>${escapeHtml(m.display_name?.[lang] || m.display_name?.ja || m.module_id)}</h3><span class="badge ${m.status === 'ready' || m.status === 'ja_ready' ? 'formal':'conditional'}">${escapeHtml(m.status || '')}</span><p class="small">source: ${escapeHtml(m.source || '')}</p><p class="small">json: ${escapeHtml(m.primary_json || T[lang].pending)}</p><p class="small">count: ${escapeHtml(String(m.count ?? '-'))}</p></article>`).join('')}</div>`;
}

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

init();
