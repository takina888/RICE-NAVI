const DATA = window.RICE_TROUBLE_DATA;
const $ = (id) => document.getElementById(id);
const state = { view:'all', query:'', chip:'', group:'', priority:'' };
const savedKey = 'riceNaviTroubleSavedIds';
const memoKey = 'riceNaviTroubleMemos';
const saved = new Set(JSON.parse(localStorage.getItem(savedKey) || '[]'));
const memos = JSON.parse(localStorage.getItem(memoKey) || '{}');
const knowledgeMap = new Map(DATA.knowledge.map(k => [k.id, k]));
const sourceMap = new Map(DATA.sources.map(s => [s.id, s]));
const MAX_KNOWLEDGE_RENDER = 120;

function esc(s='') { return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function priorityClass(p='') { if (String(p).includes('最重要')) return 'critical'; if (String(p).includes('高')) return 'high'; return 'mid'; }
function splitCauses(text='') { return String(text||'').split(/\s*(?=\d+\))/).filter(Boolean); }
function saveSaved(){ localStorage.setItem(savedKey, JSON.stringify([...saved])); }
function saveMemos(){ localStorage.setItem(memoKey, JSON.stringify(memos)); }
function terms(){ const out=[]; if(state.query) out.push(state.query); if(state.chip) out.push(state.chip.toLowerCase()); return out; }

function init(){
  DATA.meta.groups.forEach(g => { const opt=document.createElement('option'); opt.value=g; opt.textContent='分類：'+g; $('groupFilter').appendChild(opt); });
  $('quickChips').innerHTML = DATA.meta.quickSymptoms.map(x=>`<button class="chip" data-chip="${esc(x)}">${esc(x)}</button>`).join('');
  $('statDiag').textContent = DATA.meta.diagnosisCount + '件';
  $('statKnow').textContent = DATA.meta.knowledgeCount + '件（全件格納）';
  if($('statLinkedKnow')) $('statLinkedKnow').textContent = DATA.meta.linkedKnowledgeCount + '件（診断詳細に直接表示）';
  $('statSrc').textContent = DATA.meta.sourceCount + '件（全件格納）';
  if($('statLinkedSrc')) $('statLinkedSrc').textContent = DATA.meta.linkedSourceCount + '件（診断に直接ひもづく出典）';
  $('statBook').textContent = DATA.meta.sourceWorkbook;
  if($('diagCountText')) $('diagCountText').textContent = DATA.meta.diagnosisCount + '件';
  if($('knowCountText')) $('knowCountText').textContent = DATA.meta.knowledgeCount + '件';
  if($('appVersion')) $('appVersion').textContent = DATA.meta.version;
  bind();
  render();
}

function bind(){
  $('q').addEventListener('input', e => { state.query=e.target.value.trim().toLowerCase(); render(); });
  $('clearBtn').addEventListener('click', () => { $('q').value=''; state.query=''; state.chip=''; document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); render(); });
  $('quickChips').addEventListener('click', e => { const b=e.target.closest('[data-chip]'); if(!b) return; const val=b.dataset.chip; state.chip = state.chip===val ? '' : val; document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active', c.dataset.chip===state.chip)); render(); });
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { 
    state.view=t.dataset.view; 
    document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active', x===t)); 
    $('finder').classList.toggle('active', state.view!=='info'); 
    $('info').classList.toggle('active', state.view==='info'); 
    const isKnowledge = state.view === 'knowledge';
    $('groupFilter').disabled = isKnowledge;
    $('priorityFilter').disabled = isKnowledge;
    render(); 
  }));
  $('groupFilter').addEventListener('change', e => { state.group=e.target.value; render(); });
  $('priorityFilter').addEventListener('change', e => { state.priority=e.target.value; render(); });
  $('list').addEventListener('click', e => {
    const save=e.target.closest('[data-save]');
    if(save){ const id=save.dataset.save; saved.has(id) ? saved.delete(id) : saved.add(id); saveSaved(); render(); return; }
    const open=e.target.closest('[data-open]'); if(open) openDetail(open.dataset.open);
    const openKnowledge=e.target.closest('[data-open-knowledge]'); if(openKnowledge) openKnowledgeDetail(openKnowledge.dataset.openKnowledge);
  });
  document.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click', closeDetail));
  window.addEventListener('keydown', e => { if(e.key==='Escape') closeDetail(); });
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window._installEvent=e; $('installBtn').hidden=false; });
  $('installBtn').addEventListener('click', async () => { if(window._installEvent){ window._installEvent.prompt(); window._installEvent=null; $('installBtn').hidden=true; }});
}

function filtered(){
  let arr = DATA.diagnosis.slice().sort((a,b)=>a.order-b.order);
  if(state.view==='urgent') arr = arr.filter(d => String(d.priority).includes('最重要'));
  if(state.view==='saved') arr = arr.filter(d => saved.has(d.id));
  if(state.group) arr = arr.filter(d => d.group===state.group);
  if(state.priority) arr = arr.filter(d => d.priority===state.priority);
  for(const term of terms()){ arr = arr.filter(d => d.searchText.includes(term)); }
  return arr;
}

function filteredKnowledge(){
  let arr = DATA.knowledge.slice();
  const ts = terms();
  if(ts.length){
    for(const term of ts){ arr = arr.filter(k => k.searchText.includes(term)); }
  }
  arr.sort((a,b) => {
    const al = a.linkedToDiagnosis ? 0 : 1;
    const bl = b.linkedToDiagnosis ? 0 : 1;
    if(al !== bl) return al - bl;
    return String(a.id).localeCompare(String(b.id), 'ja');
  });
  return arr;
}

function render(){
  if(state.view==='info') return;
  if(state.view==='knowledge') return renderKnowledge();
  const arr = filtered();
  const labels = {all:'症状から探す', urgent:'最重要だけ表示', saved:'保存した診断'};
  $('modeLabel').textContent = labels[state.view] || '';
  $('resultCount').textContent = arr.length + '件';
  if(!arr.length){ $('list').innerHTML = '<div class="empty">該当する診断がありません。検索語を短くするか、分類を解除してください。</div>'; return; }
  $('list').innerHTML = arr.map(cardHtml).join('');
}

function renderKnowledge(){
  const arr = filteredKnowledge();
  const show = arr.slice(0, MAX_KNOWLEDGE_RENDER);
  const limited = arr.length > show.length;
  $('modeLabel').textContent = limited ? `ナレッジ検索（${show.length}件表示。検索で絞り込み）` : 'ナレッジ検索';
  $('resultCount').textContent = arr.length + '件';
  if(!arr.length){ $('list').innerHTML = '<div class="empty">該当するナレッジがありません。検索語を短くしてください。</div>'; return; }
  $('list').innerHTML = show.map(knowledgeCardHtml).join('') + (limited ? '<div class="empty">全件を画面に出すと重くなるため、先頭120件だけ表示しています。検索語を入れると絞り込めます。</div>' : '');
}

function cardHtml(d){
  return `<article class="card">
    <div class="cardTop"><span class="group">${esc(d.group)} / ${esc(d.id)}</span><span class="badge ${priorityClass(d.priority)}">${esc(d.priority)}</span></div>
    <h3>${esc(d.symptom)}</h3>
    <p class="lead">まず疑う：${esc(d.firstSuspect)}</p>
    <p class="summary">${esc(d.appearance)}</p>
    <div class="cardActions"><button class="primary" data-open="${esc(d.id)}">対処を見る</button><button class="saveBtn ${saved.has(d.id)?'saved':''}" data-save="${esc(d.id)}">${saved.has(d.id)?'保存済':'保存'}</button></div>
  </article>`;
}

function knowledgeCardHtml(k){
  const label = k.linkedToDiagnosis ? '診断関連' : '知識DB';
  return `<article class="card knowledgeCard">
    <div class="cardTop"><span class="group">${esc(k.country)} / ${esc(k.id)} / ${esc(k.major||'')}</span><span class="badge mid">${label}</span></div>
    <h3>${esc(k.minor || k.keywords || k.id)}</h3>
    <p class="lead">${esc(k.display || k.note || '')}</p>
    <p class="summary">${esc(k.keywords || k.tags || '')}</p>
    <div class="cardActions"><button class="primary" data-open-knowledge="${esc(k.id)}">詳細を見る</button></div>
  </article>`;
}

function openDetail(id){
  const d = DATA.diagnosis.find(x=>x.id===id); if(!d) return;
  const related = d.knowledgeIds.map(id=>knowledgeMap.get(id)).filter(Boolean).slice(0,12);
  const srcIds = new Set([...(d.sourceIds||[])]); related.forEach(k => (k.sourceIds||[]).forEach(s=>srcIds.add(s)));
  const sources = [...srcIds].map(id=>sourceMap.get(id)).filter(Boolean);
  $('detail').innerHTML = `<div class="detailHead">
      <p class="eyebrow">${esc(d.group)} / ${esc(d.id)}</p>
      <h2 id="drawerTitle">${esc(d.symptom)}</h2>
      <span class="badge ${priorityClass(d.priority)}">${esc(d.priority)}</span>
    </div>
    <div class="detailGrid">
      <section class="block"><h3>現場での見え方</h3><p>${esc(d.appearance)}</p></section>
      <section class="block"><h3>最初に疑うこと</h3><p>${esc(d.firstSuspect)}</p></section>
      <section class="block wide"><h3>原因候補</h3><ol class="listText">${splitCauses(d.causes).map(x=>`<li>${esc(x.replace(/^\d+\)\s*/,''))}</li>`).join('')}</ol></section>
      <section class="block wide"><h3>確認項目</h3><p>${esc(d.checks)}</p></section>
      <section class="block wide"><h3>試験例</h3><p>${esc(d.test)}</p></section>
      <section class="block dont wide"><h3>やってはいけないこと</h3><p>${esc(d.dont)}</p></section>
      <section class="block wide"><h3>表示文</h3><p>${esc(d.display)}</p></section>
      <section class="block wide"><h3>関連ナレッジ</h3><div class="miniList">${related.length?related.map(k=>`<div class="mini"><b>${esc(k.id)} ${esc(k.major||'')}</b><br>${esc(k.display||'')}<br><button class="small ghost" data-open-knowledge="${esc(k.id)}">ナレッジ詳細</button></div>`).join(''):'<p>関連ナレッジなし</p>'}</div></section>
      <section class="block wide"><h3>出典</h3><div class="miniList">${sources.length?sources.map(s=>`<div class="mini"><b>${esc(s.id)} ${esc(s.title||'')}</b><br><span>${esc(s.org||'')} ${esc(s.year||'')}</span>${s.url?`<br><span class="sourceLink">${esc(s.url)}</span>`:''}</div>`).join(''):'<p>出典なし</p>'}</div></section>
      <section class="block wide"><h3>現場メモ（端末内保存）</h3><textarea class="memo" id="memoBox" placeholder="例：6/16 3釜目のみ。浸漬60分、加水+2%、沸騰到達10分。">${esc(memos[id]||'')}</textarea></section>
    </div>`;
  $('drawer').classList.add('open'); $('drawer').setAttribute('aria-hidden','false');
  const box=$('memoBox'); box.addEventListener('input',()=>{ memos[id]=box.value; saveMemos(); });
}

function openKnowledgeDetail(id){
  const k = knowledgeMap.get(id); if(!k) return;
  const sources = (k.sourceIds||[]).map(id=>sourceMap.get(id)).filter(Boolean);
  $('detail').innerHTML = `<div class="detailHead">
      <p class="eyebrow">${esc(k.country)} / ${esc(k.id)} / ${esc(k.major||'')}</p>
      <h2 id="drawerTitle">${esc(k.minor || k.keywords || k.id)}</h2>
      <span class="badge mid">${k.linkedToDiagnosis ? '診断関連' : '知識DB'}</span>
    </div>
    <div class="detailGrid">
      <section class="block wide"><h3>表示文</h3><p>${esc(k.display)}</p></section>
      <section class="block wide"><h3>補足</h3><p>${esc(k.note)}</p></section>
      <section class="block wide"><h3>注意</h3><p>${esc(k.caution)}</p></section>
      <section class="block wide"><h3>確認項目</h3><p>${esc(k.checks)}</p></section>
      <section class="block wide"><h3>試験例</h3><p>${esc(k.test)}</p></section>
      <section class="block"><h3>キーワード</h3><p>${esc(k.keywords)}</p></section>
      <section class="block"><h3>症状タグ</h3><p>${esc(k.tags)}</p></section>
      <section class="block"><h3>根拠・優先度</h3><p>根拠：${esc(k.evidence)}\n優先度：${esc(k.priority)}\n炊飯関連度：${esc(k.riceRelevance)}\n扱い区分：${esc(k.handling)}</p></section>
      <section class="block wide"><h3>出典</h3><div class="miniList">${sources.length?sources.map(s=>`<div class="mini"><b>${esc(s.id)} ${esc(s.title||'')}</b><br><span>${esc(s.org||'')} ${esc(s.year||'')}</span>${s.url?`<br><span class="sourceLink">${esc(s.url)}</span>`:''}</div>`).join(''):'<p>出典なし</p>'}</div></section>
    </div>`;
  $('drawer').classList.add('open'); $('drawer').setAttribute('aria-hidden','false');
}

function closeDetail(){ $('drawer').classList.remove('open'); $('drawer').setAttribute('aria-hidden','true'); }

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{})); }
init();
