/* RICE NAVI 軽量PWA */
const DATA = window.RICE_DATA;
const state = {
  tab: "today",
  q: "",
  dq: "",
  sq: "",
  country: "",
  major: "",
  priority: "",
  chipMajor: "",
  diagTag: "",
  bookmarks: new Set(JSON.parse(localStorage.getItem("riceKnowledgeBookmarks") || "[]")),
  limit: 40,
  dailyOffset: 0
};

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const sourceById = new Map(DATA.sources.map(s => [s.id, s]));
const knowledgeById = new Map(DATA.knowledge.map(k => [k.id, k]));

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function compact(s, n=120){
  s = String(s ?? "");
  return s.length > n ? s.slice(0, n) + "…" : s;
}
function normalize(s){
  return String(s ?? "").toLowerCase().replace(/\s+/g,"");
}
function todayIndex(){
  const d = new Date();
  const base = Date.UTC(2026,0,1);
  const now = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.abs(Math.floor((now - base) / 86400000));
}
function hitTextKnowledge(k){
  return normalize([k.id,k.country,k.major,k.minor,k.keywords,k.symptoms?.join(" "),k.display,k.extra,k.caution,k.checks,k.test,k.sourceIds?.join(" ")].join(" "));
}
function hitTextDiagnosis(d){
  return normalize([d.id,d.tags?.join(" "),d.symptom,d.appearance,d.firstSuspect,d.causes,d.checks,d.test,d.dont,d.display,d.knowledgeIds?.join(" ")].join(" "));
}
function hitTextSource(s){
  return normalize([s.id,s.country,s.title,s.author,s.org,s.year,s.type,s.journal,s.evidence,s.infoType,s.memo].join(" "));
}
function highlight(text, query){
  const raw = String(text ?? "");
  const q = String(query ?? "").trim();
  if(!q) return esc(raw);
  const words = q.split(/\s+/).filter(Boolean).slice(0,5).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if(!words.length) return esc(raw);
  const re = new RegExp("(" + words.join("|") + ")", "ig");
  return esc(raw).replace(re, "<mark>$1</mark>");
}
function saveBookmarks(){
  localStorage.setItem("riceKnowledgeBookmarks", JSON.stringify([...state.bookmarks]));
}
function badges(items){
  return `<div class="meta-row">${items.filter(Boolean).map(x => `<span class="badge ${x.cls || ""}">${esc(x.text || x)}</span>`).join("")}</div>`;
}
function sourceLinks(ids){
  const arr = (ids || []).filter(id => sourceById.has(id));
  if(!arr.length) return "";
  return `<div class="link-list">${arr.map(id => `<button class="text-link" data-source-id="${esc(id)}">${esc(id)}</button>`).join("")}</div>`;
}
function knowledgeLinks(ids){
  const arr = (ids || []).filter(id => knowledgeById.has(id));
  if(!arr.length) return "";
  return `<div class="link-list">${arr.slice(0,12).map(id => `<button class="text-link" data-knowledge-id="${esc(id)}">${esc(id)}</button>`).join("")}${arr.length>12?`<span class="muted">他 ${arr.length-12}件</span>`:""}</div>`;
}

function init(){
  fillFilters();
  renderStats();
  renderDaily();
  renderKnowledge();
  renderDiagnosis();
  renderSources();
  bindEvents();
  registerSW();
}
function fillFilters(){
  const country = $("#countryFilter");
  DATA.meta.countries.forEach(c => country.insertAdjacentHTML("beforeend", `<option value="${esc(c)}">${esc(c)}</option>`));
  const major = $("#majorFilter");
  DATA.meta.majors.forEach(m => major.insertAdjacentHTML("beforeend", `<option value="${esc(m)}">${esc(m)}</option>`));
  $("#categoryChips").innerHTML = DATA.meta.majors.slice(0,28).map(m => `<button class="pill" data-major-chip="${esc(m)}">${esc(m)}</button>`).join("");
  $("#symptomChips").innerHTML = DATA.meta.symptoms.slice(0,40).map(t => `<button class="pill" data-diag-tag="${esc(t)}">${esc(t)}</button>`).join("");
}
function renderStats(){
  $("#dbStats").textContent = `知識 ${DATA.meta.knowledgeCount}件／診断 ${DATA.meta.diagnosisCount}件／出典 ${DATA.meta.sourceCount}件`;
  $("#infoKnowledge").textContent = `${DATA.meta.knowledgeCount}件`;
  $("#infoDiagnosis").textContent = `${DATA.meta.diagnosisCount}件`;
  $("#infoSources").textContent = `${DATA.meta.sourceCount}件`;
  $("#infoWorkbook").textContent = DATA.meta.sourceWorkbook;
}
function renderDaily(){
  const list = DATA.knowledge.filter(k => k.display);
  const idx = (todayIndex() + state.dailyOffset) % list.length;
  const k = list[idx];
  $("#dailyTitle").textContent = k.major || "RICE NAVI";
  $("#dailyText").textContent = k.display;
  $("#dailyMeta").innerHTML = badges([{text:k.id},{text:k.country,cls:"gray"},{text:k.minor,cls:"gray"},{text:"根拠 " + (k.evidence || "-"),cls:"warn"}]);
  $("#openDaily").dataset.knowledgeId = k.id;
}
function renderKnowledge(){
  const q = normalize(state.q);
  let rows = DATA.knowledge;
  if(q) rows = rows.filter(k => hitTextKnowledge(k).includes(q));
  if(state.country) rows = rows.filter(k => k.country === state.country);
  const majorVal = state.chipMajor || state.major;
  if(majorVal) rows = rows.filter(k => k.major === majorVal);
  if(state.priority) rows = rows.filter(k => k.priority === state.priority);
  if($("#bookmarkFilter").value === "only") rows = rows.filter(k => state.bookmarks.has(k.id));
  $("#resultCount").textContent = `${rows.length}件`;
  $("#showMore").hidden = rows.length <= state.limit;
  $("#knowledgeList").innerHTML = rows.slice(0,state.limit).map(k => knowledgeCard(k)).join("") || `<div class="empty">該当する知識がありません。</div>`;
}
function knowledgeCard(k){
  const bm = state.bookmarks.has(k.id);
  return `<article class="knowledge-card" data-card-id="${esc(k.id)}">
    <div class="card-top">
      <div>
        <p class="card-title">${highlight(k.display, state.q)}</p>
        <p class="card-text">${highlight(compact(k.extra || k.caution || k.checks, 120), state.q)}</p>
      </div>
      <button class="bookmark ${bm ? "active" : ""}" data-bookmark="${esc(k.id)}" title="保存">${bm ? "★" : "☆"}</button>
    </div>
    ${badges([{text:k.id},{text:k.country,cls:"gray"},{text:k.major,cls:"gray"},{text:k.minor,cls:"gray"},{text:k.priority ? "優先 " + k.priority : "",cls:"warn"}])}
    <div class="actions"><button class="ghost small" data-knowledge-id="${esc(k.id)}">詳細</button></div>
  </article>`;
}
function renderDiagnosis(){
  const q = normalize(state.dq);
  let rows = DATA.diagnosis;
  if(q) rows = rows.filter(d => hitTextDiagnosis(d).includes(q));
  if(state.diagTag) rows = rows.filter(d => d.tags.includes(state.diagTag));
  $("#diagnosisList").innerHTML = rows.map(d => diagCard(d)).join("") || `<div class="empty">該当する診断がありません。</div>`;
}
function diagCard(d){
  return `<article class="diag-card">
    <p class="card-title">${esc(d.order)}. ${highlight(d.symptom, state.dq)}</p>
    <p class="card-text">${highlight(d.appearance || d.display, state.dq)}</p>
    ${badges([{text:d.priority ? "優先 " + d.priority : "",cls:"warn"},{text:d.firstSuspect || "",cls:"gray"}])}
    <div class="detail-grid">
      <div class="detail-box"><strong>最初に疑うこと</strong>${highlight(d.firstSuspect, state.dq)}</div>
      <div class="detail-box"><strong>確認項目</strong>${highlight(d.checks, state.dq)}</div>
    </div>
    <div class="actions"><button class="ghost small" data-diag-id="${esc(d.id)}">詳細</button></div>
  </article>`;
}
function renderSources(){
  const q = normalize(state.sq);
  let rows = DATA.sources;
  if(q) rows = rows.filter(s => hitTextSource(s).includes(q));
  $("#sourceList").innerHTML = rows.map(s => sourceCard(s)).join("") || `<div class="empty">該当する出典がありません。</div>`;
}
function sourceCard(s){
  return `<article class="source-card">
    <p class="card-title">${esc(s.id)} ${highlight(s.title, state.sq)}</p>
    <p class="card-text">${esc([s.author, s.journal, s.year].filter(Boolean).join("／"))}</p>
    ${badges([{text:s.country,cls:"gray"},{text:s.evidence ? "根拠 " + s.evidence : "",cls:"warn"},{text:s.type,cls:"gray"}])}
    <div class="actions">${s.url ? `<a class="ghost small" href="${esc(s.url)}" target="_blank" rel="noopener">開く</a>` : ""}<button class="ghost small" data-source-id="${esc(s.id)}">詳細</button></div>
  </article>`;
}
function openKnowledge(id){
  const k = knowledgeById.get(id);
  if(!k) return;
  openDrawer(`<p class="eyebrow">${esc(k.id)} / ${esc(k.country)}</p>
    <h2 id="drawerTitle">${esc(k.display)}</h2>
    ${badges([{text:k.major},{text:k.minor,cls:"gray"},{text:k.priority ? "優先 " + k.priority : "",cls:"warn"},{text:k.evidence ? "根拠 " + k.evidence : "",cls:"warn"}])}
    <div class="detail-grid">
      ${detail("補足", k.extra)}
      ${detail("注意", k.caution)}
      ${detail("確認項目", k.checks)}
      ${detail("試験例", k.test)}
      ${detail("キーワード", k.keywords)}
      ${detail("症状タグ", (k.symptoms||[]).join("、"))}
      ${detailRaw("出典", sourceLinks(k.sourceIds))}
    </div>`);
}
function openDiag(id){
  const d = DATA.diagnosis.find(x => x.id === id);
  if(!d) return;
  openDrawer(`<p class="eyebrow">${esc(d.id)}</p>
    <h2 id="drawerTitle">${esc(d.symptom)}</h2>
    <p class="card-text">${esc(d.display || d.appearance)}</p>
    ${badges([{text:d.priority ? "優先 " + d.priority : "",cls:"warn"},{text:d.firstSuspect || "",cls:"gray"}])}
    <div class="detail-grid">
      ${detail("現場での見え方", d.appearance)}
      ${detail("最初に疑うこと", d.firstSuspect)}
      ${detail("原因候補", d.causes)}
      ${detail("確認項目", d.checks)}
      ${detail("試験例", d.test)}
      ${detail("やってはいけないこと", d.dont)}
      ${detailRaw("関連ナレッジ", knowledgeLinks(d.knowledgeIds))}
      ${detailRaw("主な出典", sourceLinks(d.sourceIds))}
    </div>`);
}
function openSource(id){
  const s = sourceById.get(id);
  if(!s) return;
  openDrawer(`<p class="eyebrow">${esc(s.id)} / ${esc(s.country)}</p>
    <h2 id="drawerTitle">${esc(s.title)}</h2>
    <div class="detail-grid">
      ${detail("著者", s.author)}
      ${detail("所属", s.org)}
      ${detail("年", s.year)}
      ${detail("種別", s.type)}
      ${detail("掲載誌・機関", s.journal)}
      ${detail("根拠レベル", s.evidence)}
      ${detail("情報区分", s.infoType)}
      ${detail("確認メモ", s.memo)}
      ${detail("DOI", s.doi)}
      ${detailRaw("URL", s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>` : "")}
    </div>`);
}
function detail(label, value){
  if(value === undefined || value === null || value === "") return "";
  return `<div class="detail-box"><strong>${esc(label)}</strong>${esc(value)}</div>`;
}
function detailRaw(label, html){
  if(!html) return "";
  return `<div class="detail-box"><strong>${esc(label)}</strong>${html}</div>`;
}
function openDrawer(html){
  $("#drawerContent").innerHTML = html;
  $("#drawer").classList.add("open");
  $("#drawer").setAttribute("aria-hidden","false");
}
function closeDrawer(){
  $("#drawer").classList.remove("open");
  $("#drawer").setAttribute("aria-hidden","true");
}
function switchTab(tab){
  state.tab = tab;
  $$(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  $$(".panel").forEach(p => p.classList.toggle("active", p.id === tab));
  location.hash = tab;
}
function bindEvents(){
  $$(".tab").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));
  $$(".jump").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tabTarget)));
  $("#nextDaily").addEventListener("click", () => { state.dailyOffset++; renderDaily(); });
  $("#q").addEventListener("input", e => { state.q = e.target.value; state.limit = 40; renderKnowledge(); });
  $("#dq").addEventListener("input", e => { state.dq = e.target.value; renderDiagnosis(); });
  $("#sq").addEventListener("input", e => { state.sq = e.target.value; renderSources(); });
  $("#countryFilter").addEventListener("change", e => { state.country = e.target.value; state.limit = 40; renderKnowledge(); });
  $("#majorFilter").addEventListener("change", e => { state.major = e.target.value; state.chipMajor = ""; updatePills(); state.limit = 40; renderKnowledge(); });
  $("#priorityFilter").addEventListener("change", e => { state.priority = e.target.value; state.limit = 40; renderKnowledge(); });
  $("#bookmarkFilter").addEventListener("change", renderKnowledge);
  $("#clearSearch").addEventListener("click", () => { $("#q").value=""; state.q=""; state.country=""; state.major=""; state.priority=""; state.chipMajor=""; $("#countryFilter").value=""; $("#majorFilter").value=""; $("#priorityFilter").value=""; $("#bookmarkFilter").value=""; updatePills(); renderKnowledge(); });
  $("#clearDiag").addEventListener("click", () => { $("#dq").value=""; state.dq=""; state.diagTag=""; updatePills(); renderDiagnosis(); });
  $("#clearSource").addEventListener("click", () => { $("#sq").value=""; state.sq=""; renderSources(); });
  $("#showMore").addEventListener("click", () => { state.limit += 40; renderKnowledge(); });

  document.body.addEventListener("click", e => {
    const kb = e.target.closest("[data-knowledge-id]");
    const db = e.target.closest("[data-diag-id]");
    const sb = e.target.closest("[data-source-id]");
    const bm = e.target.closest("[data-bookmark]");
    const cm = e.target.closest("[data-major-chip]");
    const dt = e.target.closest("[data-diag-tag]");
    if(kb){ openKnowledge(kb.dataset.knowledgeId); return; }
    if(db){ openDiag(db.dataset.diagId); return; }
    if(sb){ openSource(sb.dataset.sourceId); return; }
    if(bm){
      const id = bm.dataset.bookmark;
      state.bookmarks.has(id) ? state.bookmarks.delete(id) : state.bookmarks.add(id);
      saveBookmarks(); renderKnowledge(); return;
    }
    if(cm){
      state.chipMajor = state.chipMajor === cm.dataset.majorChip ? "" : cm.dataset.majorChip;
      $("#majorFilter").value = "";
      state.major = "";
      updatePills(); state.limit = 40; renderKnowledge(); return;
    }
    if(dt){
      state.diagTag = state.diagTag === dt.dataset.diagTag ? "" : dt.dataset.diagTag;
      updatePills(); renderDiagnosis(); return;
    }
    if(e.target.closest("[data-close]")) closeDrawer();
  });
  document.addEventListener("keydown", e => { if(e.key === "Escape") closeDrawer(); });
  const hash = location.hash.replace("#","");
  if(["today","knowledge","diagnosis","sources","info"].includes(hash)) switchTab(hash);
}
function updatePills(){
  $$("[data-major-chip]").forEach(b => b.classList.toggle("active", b.dataset.majorChip === state.chipMajor));
  $$("[data-diag-tag]").forEach(b => b.classList.toggle("active", b.dataset.diagTag === state.diagTag));
}
function registerSW(){
  if("serviceWorker" in navigator){
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
  }
  let promptEvent;
  const btn = $("#installBtn");
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    promptEvent = e;
    btn.hidden = false;
  });
  btn.addEventListener("click", async () => {
    if(!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    promptEvent = null;
    btn.hidden = true;
  });
}
init();
