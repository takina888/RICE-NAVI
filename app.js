
const APP_VERSION='v27';
const q=(s,r=document)=>r.querySelector(s); const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const state={manifest:null,cache:{},lang:'ja'};
function esc(v){return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
async function loadJson(path){ const url=path+(path.includes('?')?'&':'?')+'v='+APP_VERSION+'&t='+Date.now(); const res=await fetch(url,{cache:'no-store'}); if(!res.ok) throw new Error(`${path} ${res.status}`); return await res.json(); }
async function getData(key){ if(state.cache[key]) return state.cache[key]; const path=state.manifest.core?.[key]||state.manifest.modules?.[key]; if(!path) throw new Error(`manifestに${key}がありません`); state.cache[key]=await loadJson(path); return state.cache[key]; }
function setStatus(msg,cls=''){ const el=q('#status'); el.className='status '+cls; el.innerHTML=msg; }
function layout(title,body){ q('#view').innerHTML=`<div class="section-title"><h2>${esc(title)}</h2><button class="btn secondary" onclick="renderHome()">← ホームへ</button></div>${body}`; window.scrollTo(0,0); }
async function init(){
 try{ setStatus('起動中：データ目次を確認しています。','loading'); state.manifest=await loadJson('data/manifest.json'); const home=await getData('home'); setStatus(`起動OK：${esc(state.manifest.version)} / 米品種${state.manifest.counts.rice_varieties}件 / 起動時は軽量データのみ読込`, 'ok'); renderHome(home); }
 catch(e){ setStatus(`起動できません。<br><span class="small">原因：${esc(e.message)}</span><br><button class="btn" onclick="location.reload()">再読み込み</button>`, 'error'); }
}
function pick(arr){return arr[Math.abs(new Date().getDate()+new Date().getMonth())%Math.max(1,arr.length)]||{};}
function titleOf(o){return o.title||o.name||o.term_ja||o.display_name_ja||o.variety_name||o.headline||o.ranking_name_ja||o.id||'無題';}
function summaryOf(o){return o.summary||o.description||o.short_text||o.body||o.message||o.note||o.feature_summary_ja||o.commentary_ja||o.text||'';}
function renderHome(home=state.cache.home){ const f=pick(home.fortunes||[]); const h=pick(home.histories||[]); q('#view').innerHTML=`
 <div class="grid">
  <section class="card"><span class="pill">今日</span><h2>今日の米占い</h2><h3>${esc(titleOf(f))}</h3><p>${esc(summaryOf(f))}</p></section>
  <section class="card"><span class="pill">天気</span><h2>今日の米天気</h2><p>天気は取得できる場合だけ表示します。湿度・気温差・雨を、米の保管と吸水注意に変換します。</p><button class="btn" onclick="renderWeather()">米天気を見る</button></section>
  <section class="card"><span class="pill">今米言葉</span><h2>今米言葉</h2><p>米辞典から今日の言葉を表示します。</p><button class="btn" onclick="renderGlossary()">米辞典を見る</button></section>
  <section class="card"><span class="pill">現在地</span><h2>現在地のお米ヒストリー</h2><h3>${esc(titleOf(h))}</h3><p>${esc(summaryOf(h)).slice(0,140)}</p><button class="btn secondary" onclick="renderHistories()">詳しく見る</button></section>
 </div>
 <section class="card"><h2>RICE NAVI メニュー</h2><div class="grid">
  ${menuButton('世界のライス物語','renderStories()')}
  ${menuButton('お米の未来','renderFuture()')}
  ${menuButton('炊飯文献ライブラリ','renderLiterature()')}
  ${menuButton('お米マイスター100','renderMeister()')}
  ${menuButton('温度×時間マップ','renderTempMap()')}
  ${menuButton('水・保管・納米庫チェック','renderChecks()')}
  ${menuButton('米品種図鑑 250','renderVarieties()')}
  ${menuButton('世界の米ランキング','renderRankings()')}
  ${menuButton('日本語読み物コーナー','renderJpReading()')}
  ${menuButton('データ状態','renderDataStatus()')}
 </div></section>`; }
function menuButton(label,fn){return `<button class="btn secondary" onclick="${fn}">${esc(label)}</button>`}
function renderCards(title,arr,opts={}){ const limit=opts.limit||arr.length; window.currentList=arr; window.displayList=arr.slice(0,limit); const body=`<input class="search" placeholder="検索" oninput="filterList(this.value)"><div class="list" id="list">${window.displayList.map((o,i)=>itemHtml(o,i)).join('')}</div>${arr.length>limit?`<p class="muted">${arr.length}件中${limit}件を表示。検索すると対象を絞れます。</p>`:''}`; layout(title,body); }
function itemHtml(o,i){ const tags=[o.category,o.level,o.region,o.country,o.rice_type,o.phase,o.module,o.language].filter(Boolean).slice(0,4).map(x=>`<span class="pill">${esc(x)}</span>`).join(''); return `<div class="item" data-text="${esc(JSON.stringify(o).toLowerCase())}"><div class="item-title">${esc(titleOf(o))}</div><div>${tags}</div><p>${esc(summaryOf(o)).slice(0,260)}</p><button class="btn secondary" onclick="showDetailByIndex(${i})">詳しく見る</button></div>`; }
function filterList(v){ const s=v.toLowerCase(); const arr=window.currentList||[]; window.displayList=arr.filter(o=>JSON.stringify(o).toLowerCase().includes(s)).slice(0,200); q('#list').innerHTML=window.displayList.map((o,i)=>itemHtml(o,i)).join('')||'<p class="muted">該当なし</p>'; }
function showDetailByIndex(i){ const o=(window.displayList||[])[i]; if(o) showDetail(o); }
function showDetail(o){ layout(titleOf(o),`<div class="card"><p>${esc(summaryOf(o))}</p><div class="mono">${esc(JSON.stringify(o,null,2))}</div></div>`); }
async function renderGlossary(){ const d=await getData('learning'); renderCards('米辞典・今米言葉', d.terms||[]); }
async function renderHistories(){ const d=await getData('home'); renderCards('現在地のお米ヒストリー', d.histories||[]); }
async function renderStories(){ const d=await getData('reading'); renderCards('世界のライス物語（今週＋過去閲覧）', d.stories||[], {limit:8}); }
async function renderFuture(){ const d=await getData('reading'); renderCards('お米の未来', d.future||[]); }
async function renderLiterature(){ const d=await getData('learning'); renderCards('炊飯文献ライブラリ', d.learning_cards||[], {limit:120}); }
async function renderMeister(){ const d=await getData('learning'); renderCards('お米マイスター100', d.meister||[]); }
async function renderTempMap(){ const d=await getData('learning'); renderCards('温度×時間マップ', d.temp_map||[]); }
async function renderChecks(){ const d=await getData('check'); const arr=[...(d.water_rules||[]),...(d.scale_rules||[]),...(d.mold_rules||[]),...(d.mold_checklist||[])]; renderCards('水・保管・納米庫チェック', arr, {limit:200}); }
async function renderVarieties(){ const d=await getData('rice_varieties'); renderCards('米品種図鑑 250', d.varieties||[], {limit:80}); }
async function renderRankings(){ const d=await getData('world_rice_rankings'); const arr=Array.isArray(d)?d:(d.rankings||d.items||[]); renderCards('世界の米ランキング', arr, {limit:80}); }
async function renderJpReading(){ const d=await getData('jp_reading_corner'); const arr=Array.isArray(d)?d:(d.items||[]); renderCards('日本語読み物コーナー', arr, {limit:80}); }
function renderWeather(){ layout('今日の米天気',`<div class="card"><p>現在地の気温・湿度を取得し、米の保管・結露・吸水注意に変換します。</p><button class="btn" onclick="getWeather()">現在地の米天気を見る</button><div id="weatherBox" class="status">未取得</div></div>`); }
async function getWeather(){ const box=q('#weatherBox'); box.textContent='取得中...'; try{ if(!navigator.geolocation) throw new Error('このブラウザでは位置情報を使えません'); navigator.geolocation.getCurrentPosition(async pos=>{ const {latitude,longitude}=pos.coords; const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`; const j=await (await fetch(url)).json(); const c=j.current||{}; box.innerHTML=`気温 ${esc(c.temperature_2m)}℃ / 湿度 ${esc(c.relative_humidity_2m)}% / 雨量 ${esc(c.precipitation)}mm<br>湿度が高い日は、米袋・保管室・納米庫の結露、カビ臭、濡れた米粒に注意してください。`; },err=>{box.textContent='位置情報を取得できませんでした：'+err.message;}); }catch(e){ box.textContent=e.message; } }
function renderDataStatus(){ const m=state.manifest; layout('データ状態',`<div class="card"><h3>${esc(m.version)}</h3><div class="mono">${esc(JSON.stringify(m.counts,null,2))}</div><p class="muted">起動時はmanifestとhomeのみ。重い米品種・ランキング・日本語読み物は画面を開いた時だけ読み込みます。</p></div>`); }
qa('.bottomnav button').forEach(btn=>btn.addEventListener('click',()=>{qa('.bottomnav button').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}));
window.addEventListener('DOMContentLoaded',init);
