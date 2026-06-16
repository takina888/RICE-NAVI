const DATA = window.RICE_TROUBLE_DATA;
const $ = (id) => document.getElementById(id);
const state = { view:'all', query:'', chip:'', group:'', priority:'' };
const savedKey = 'riceNaviTroubleSavedIds';
const memoKey = 'riceNaviTroubleMemos';
const saved = new Set(JSON.parse(localStorage.getItem(savedKey) || '[]'));
const memos = JSON.parse(localStorage.getItem(memoKey) || '{}');
const knowledgeMap = new Map(DATA.knowledge.map(k => [k.id, k]));
const sourceMap = new Map(DATA.sources.map(s => [s.id, s]));

function esc(s='') { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function priorityClass(p='') { if (p.includes('最重要')) return 'critical'; if (p.includes('高')) return 'high'; return 'mid'; }
function splitCauses(text='') { return text.split(/\s*(?=\d+\))/).filter(Boolean); }
function saveSaved(){ localStorage.setItem(savedKey, JSON.stringify([...saved])); }
function saveMemos(){ localStorage.setItem(memoKey, JSON.stringify(memos)); }

function init(){
  DATA.meta.groups.forEach(g => { const opt=document.createElement('option'); opt.value=g; opt.textContent='分類：'+g; $('groupFilter').appendChild(opt); });
  $('quickChips').innerHTML = DATA.meta.quickSymptoms.map(x=>`<button class="chip" data-chip="${esc(x)}">${esc(x)}</button>`).join('');
  $('statDiag').textContent = DATA.meta.diagnosisCount + '件';
  $('statKnow').textContent = DATA.meta.knowledgeCount + '件（診断詳細内のみ表示）';
  $('statSrc').textContent = DATA.meta.sourceCount + '件';
  $('statBook').textContent = DATA.meta.sourceWorkbook;
  bind();
  render();
}

function bind(){
  $('q').addEventListener('input', e => { state.query=e.target.value.trim().toLowerCase(); render(); });
  $('clearBtn').addEventListener('click', () => { $('q').value=''; state.query=''; state.chip=''; document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); render(); });
  $('quickChips').addEventListener('click', e => { const b=e.target.closest('[data-chip]'); if(!b) return; const val=b.dataset.chip; state.chip = state.chip===val ? '' : val; document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active', c.dataset.chip===state.chip)); render(); });
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { state.view=t.dataset.view; document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active', x===t)); $('finder').classList.toggle('active', state.view!=='info'); $('info').classList.toggle('active', state.view==='info'); render(); }));
  $('groupFilter').addEventListener('change', e => { state.group=e.target.value; render(); });
  $('priorityFilter').addEventListener('change', e => { state.priority=e.target.value; render(); });
  $('list').addEventListener('click', e => {
    const save=e.target.closest('[data-save]');
    if(save){ const id=save.dataset.save; saved.has(id) ? saved.delete(id) : saved.add(id); saveSaved(); render(); return; }
    const open=e.target.closest('[data-open]'); if(open) openDetail(open.dataset.open);
  });
  document.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click', closeDetail));
  window.addEventListener('keydown', e => { if(e.key==='Escape') closeDetail(); });
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window._installEvent=e; $('installBtn').hidden=false; });
  $('installBtn').addEventListener('click', async () => { if(window._installEvent){ window._installEvent.prompt(); window._installEvent=null; $('installBtn').hidden=true; }});
}

function filtered(){
  let arr = DATA.diagnosis.slice().sort((a,b)=>a.order-b.order);
  if(state.view==='urgent') arr = arr.filter(d => d.priority.includes('最重要'));
  if(state.view==='saved') arr = arr.filter(d => saved.has(d.id));
  if(state.group) arr = arr.filter(d => d.group===state.group);
  if(state.priority) arr = arr.filter(d => d.priority===state.priority);
  const terms = [];
  if(state.query) terms.push(state.query);
  if(state.chip) terms.push(state.chip.toLowerCase());
  for(const term of terms){ arr = arr.filter(d => d.searchText.includes(term)); }
  return arr;
}

function render(){
  if(state.view==='info') return;
  const arr = filtered();
  const labels = {all:'症状から探す', urgent:'最重要だけ表示', saved:'保存した診断'};
  $('modeLabel').textContent = labels[state.view] || '';
  $('resultCount').textContent = arr.length + '件';
  if(!arr.length){ $('list').innerHTML = '<div class="empty">該当する診断がありません。検索語を短くするか、分類を解除してください。</div>'; return; }
  $('list').innerHTML = arr.map(cardHtml).join('');
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
      <section class="block wide"><h3>関連ナレッジ</h3><div class="miniList">${related.length?related.map(k=>`<div class="mini"><b>${esc(k.id)} ${esc(k.major||'')}</b><br>${esc(k.display||'')}</div>`).join(''):'<p>関連ナレッジなし</p>'}</div></section>
      <section class="block wide"><h3>出典</h3><div class="miniList">${sources.length?sources.map(s=>`<div class="mini"><b>${esc(s.id)} ${esc(s.title||'')}</b><br><span>${esc(s.org||'')} ${esc(s.year||'')}</span>${s.url?`<br><span class="sourceLink">${esc(s.url)}</span>`:''}</div>`).join(''):'<p>出典なし</p>'}</div></section>
      <section class="block wide"><h3>現場メモ（端末内保存）</h3><textarea class="memo" id="memoBox" placeholder="例：6/16 3釜目のみ。浸漬60分、加水+2%、沸騰到達10分。">${esc(memos[id]||'')}</textarea></section>
    </div>`;
  $('drawer').classList.add('open'); $('drawer').setAttribute('aria-hidden','false');
  const box=$('memoBox'); box.addEventListener('input',()=>{ memos[id]=box.value; saveMemos(); });
}
function closeDetail(){ $('drawer').classList.remove('open'); $('drawer').setAttribute('aria-hidden','true'); }

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{})); }
init();
