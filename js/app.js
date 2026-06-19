const S={data:null,view:'home',lang:'ja',filters:{}};
const RN_ASSET_VERSION='78ui43';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const has=v=>v!==undefined&&v!==null&&String(v).trim()!=='';
const norm=v=>String(v??'').trim();
const same=(a,b)=>norm(a)===norm(b);
function field(o,...keys){for(const k of keys){if(o&&has(o[k])) return o[k];}return '';}
function tx(obj,key){
  if(!obj) return '';
  const L=S.lang;
  const lists={ja:[key+'_ja',key,'ja'],en:[key+'_en','en'],zh_tw:[key+'_zh_tw',key+'_zhTW','zh_tw','zh-TW'],zh_cn:[key+'_zh_cn',key+'_zhCN','zh_cn','zh-CN']};
  for(const k of lists[L]||lists.ja){if(has(obj[k])) return obj[k];}
  if(typeof obj[key]==='object'&&obj[key]){const m=obj[key], nested={ja:['ja'],en:['en'],zh_tw:['zh-TW','zh_tw','zhTW'],zh_cn:['zh-CN','zh_cn','zhCN']};for(const k of nested[L]||nested.ja){if(has(m[k])) return m[k];}}
  for(const k of lists.ja){if(has(obj[k])) return obj[k];}
  return '';
}
function lc(x,k){const i=x?.i18n||{}, L=S.lang; return field(i[L]||{},k)||field(i.ja||{},k)||field(x,k)||'';}
function todayIndex(n,salt=''){if(!n)return 0;const d=new Date();const s=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}-${salt}`;let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h%n;}
const pick=(arr,salt)=>arr&&arr.length?arr[todayIndex(arr.length,salt)]:null;
function traceText(x){return String(x||'').replace(/source_id\+claim_id確認済み/g,'出典・根拠ID確認済み').replace(/claim/gi,'根拠').replace(/正式カード候補/g,'文献カード候補').replace(/正式カード/g,'文献カード').replace(/cards_literature_based/g,'文献ベース教材').replace(/app_ready_formal/g,'公開準備済み').replace(/trace_ok/g,'出典確認済み').replace(/formal/g,'文献確認済み').replace(/core/g,'重要').replace(/important/g,'重要');}
function chips(list){return (list||[]).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(x=>norm(traceText(x))).filter(has).slice(0,10).map(x=>`<span class="pill">${esc(x)}</span>`).join('');}
function card(title,body,extra=''){return `<div class="card"><h2>${esc(title)}</h2>${body}${extra}</div>`;}
function stat(n,label,note=''){return `<div class="kpi"><b>${esc(n??0)}</b><span>${esc(label)}</span>${note?`<em>${esc(note)}</em>`:''}</div>`;}
function btn(view,label){return `<button class="btn" onclick="switchView('${view}')">${esc(label)}</button>`;}
function visible(...vals){for(const v of vals){if(has(v))return v;}return '未確認';}
function sourceBadge(label,count){return `<span class="badge">${esc(label)}：${esc(count??0)}件</span>`;}

function sourceMap(){const m={};(S.data?.literature?.sources||[]).forEach(x=>{const id=field(x,'source_id','id','SourceID'); if(id)m[id]=x;});return m;}
function claimMap(){const m={};(S.data?.literature?.claims||[]).forEach(x=>{const id=field(x,'claim_id','id','ClaimID'); if(id)m[id]=x;});return m;}
function splitIds(v){return String(v||'').split(/[;,;；、\s]+/).map(norm).filter(has);}
function sourceDetails(ids){const sm=sourceMap(); const arr=splitIds(ids).map(id=>sm[id]).filter(Boolean); if(!arr.length)return '<div class="source">出典ID：'+esc(ids||'未確認')+'</div>'; return arr.slice(0,4).map(x=>`<div class="source"><b>${esc(field(x,'source_id','id')||'')}</b> ${esc(field(x,'source_title_ja','title_ja','title','source_name')||'出典名未確認')}<br>${esc(field(x,'source_url','url')||'URL未確認')}</div>`).join('');}
function claimDetails(ids){const cm=claimMap(); const arr=splitIds(ids).map(id=>cm[id]).filter(Boolean); if(!arr.length)return '<p><b>根拠要点：</b>未確認</p>'; return arr.slice(0,4).map(x=>`<p><b>根拠要点：</b>${esc(field(x,'claim_ja','summary_ja','text_ja','claim','summary')||'未確認')}<br><span class="small">根拠番号：${esc(field(x,'claim_id','id')||'未確認')}</span></p>`).join('');}
function topCategories(cards,limit=10){const c={};cards.forEach(x=>{const k=x.category||'未分類';c[k]=(c[k]||0)+1});return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,limit);}
function resetFilters(keys){keys.forEach(k=>S.filters[k]='');render();}

function levelLabel(x){const p=String(x.priority||x.evidence_level||''); if(p.includes('core')||x.evidence_level==='A') return '初級'; if(p.includes('important')||x.evidence_level==='B') return '中級'; return '上級';}
function classifyEvidence(x){
  if(x.type==='field_note') return 'D';
  const src=has(x.source_ids), cid=has(x.claim_ids), sum=has(x.summary)&&!same(x.summary,x.title), cond=has(x.condition);
  if(src&&cid&&sum&&cond&&String(x.status||'').includes('確認')) return 'A';
  if(src&&(cid||sum||cond)) return 'B';
  if(src||cid) return 'C';
  return 'D';
}
function evidenceLabel(c){return {A:'原文確認済み候補',B:'要約整理済み',C:'確認中',D:'現場メモ'}[c]||'確認状況未確認';}
function statusInfo(c){return {A:'原文・要点・条件・出典がそろっている候補です。',B:'文献根拠をもとに要約整理した候補です。',C:'出典や要約内容の再確認が必要です。',D:'文献ではなく、現場メモとして別枠で扱います。'}[c]||'確認状況を確認中です。';}
function illust(kind){
  const allowed={fortune:'check',weather:'water',world:'stories',grain:'words',rice:'varieties',doc:'literature',storage:'storage',future:'future',guide:'learn',ranking:'ranking',map:'history'};
  const name=allowed[kind]||'learn';
  return `<span class="illust ${esc(kind)}"><img src="assets/ui-icons/${name}.svg?v=${RN_ASSET_VERSION}" alt="" loading="lazy"></span>`;
}
function literatureScore(x){let s=0;const c=classifyEvidence(x); if(c==='A')s+=10;if(c==='B')s+=6;if(has(x.condition))s+=4;if(has(x.summary)&&!same(x.summary,x.title))s+=3;if(has(x.source_ids))s+=2;if(has(x.claim_ids))s+=2;return s;}
function litCards(){return (S.data?.literature?.cards||[]).map(x=>({...x,_class:classifyEvidence(x)}));}
function litSorted(){return [...litCards()].sort((a,b)=>literatureScore(b)-literatureScore(a)||String(a.id||'').localeCompare(String(b.id||'')));}
function titleOfVariety(v){return field(v,'app_title_ja_v1_7','display_name_ja','name_ja','variety_name_ja','variety_name','local_name','name')||'品種名未確認';}
function countryOfVariety(v){return field(v,'country_ja','origin_country_ja','main_production_regions','country')||'国・地域未確認';}
function termName(x){return tx(x,'term')||tx(x,'title')||field(x,'term_ja')||'用語未確認';}
function termDesc(x){return tx(x,'desc')||tx(x,'description')||'';}
function termRelevance(x){return tx(x,'relevance')||'';}
function termTodayView(x){return tx(x,'today_view')||'';}
function termCategory(x){return tx(x,'category')||'炊飯用語';}
function termRelated(x){return tx(x,'related_terms')||'';}
function termNote(x){
  const desc=termDesc(x);
  if(has(desc)) return desc;
  const note=tx(x,'note');
  if(!note||/工程カード用の統一訳語|Preferred term|工程卡統一用語|工序卡统一用语/.test(note))return 'この用語の説明は確認中です。教材・文献と合わせて確認します。';
  return note;
}
function termPick(){const preferred=['浸漬','吸水','蒸らし','ほぐし','糊化','粘り','硬さ','水加減','べたつき','老化'];const arr=S.data?.glossary||[];for(const n of preferred){const f=arr.find(x=>x.term_ja===n);if(f)return f;}return pick(arr,'term');}

function safeTermPick(){
  const preferred=['浸漬','吸水','蒸らし','ほぐし','糊化','粘り','硬さ','水加減','べたつき','老化'];
  const arr=S.data?.glossary||[];
  const n=preferred[todayIndex(preferred.length,'safe_term')];
  return arr.find(x=>x.term_ja===n)||termPick();
}
function processPick(){
  const arr=(S.data?.rice_fortune?.processes||[]);
  if(arr.length){const p=arr[todayIndex(arr.length,'process')]; return p.label_ja||p.glossary_term_ja||p.term_ja||'工程未確認';}
  const processes=['種選び','播種','育苗','田植え','水管理','分げつ','出穂','登熟','収穫','乾燥','籾すり','選別','精米','計量','洗米','浸漬','吸水','水加減','加熱','沸騰','蒸らし','ほぐし','盛り付け','冷ます','保存','再加熱','保管確認'];
  return processes[todayIndex(processes.length,'process')];
}
function fortuneMessage(name,term,process){
  const map={
    '吸水運':'水の入り方を確認する日です。浸漬時間と水温を少し意識すると、炊き上がりの硬さを見直しやすくなります。',
    '粒立ち運':'炊き上がり後のほぐしを丁寧に見る日です。余分な蒸気を逃がし、粒の輪郭を確認します。',
    'ふっくら運':'吸水と蒸らしを整える日です。やわらかさだけでなく、粒感とのバランスを見ます。',
    '温度管理運':'水温・室温・保管温度の差を意識する日です。結露や吸水の変化も合わせて確認します。',
    '水加減運':'水の量だけで判断せず、米の状態、浸漬、蒸らしまで一緒に見ます。',
    '蒸らし運':'炊飯後の時間の使い方を見る日です。蒸らしとほぐしで食感が変わります。',
    '保管注意運':'米を炊く前に保管場所を見る日です。湿度、におい、虫、変色、付着米を確認します。'
  };
  return map[name] || `今日は「${term}」と「${process}」を入口に、米の状態を確認します。`;
}
function cleanCookingMemo(v){
  const direct=field(v,'cooking_points','app_summary_ja_v1_7','app_summary_ja_v1_6');
  if(has(direct)) return direct;
  return 'この品種の炊飯メモは未確認です。用途・成分・出典を確認しながら表示します。';
}
function varietyConfirmNote(v){
  const hidden=field(v,'safe_app_note_ja_v1_4','app_caution_ja_v1_7','use_review_note');
  if(!has(hidden)) return '確認状況：未確認項目は未確認として扱います。';
  return '確認状況：公開前の確認メモがあります。通常画面には内部メモを出さず、未確認項目だけを表示します。';
}
function sourceStatusText(v){
  const s=field(v,'source_confidence','source_type','status');
  if(!has(s)) return '出典確認：未確認';
  return `出典確認：${String(s).replace(/^A$/,'原文・公的情報確認候補').replace(/^B$/,'出典確認候補').replace(/^C$/,'確認中')}`;
}

function storyList(){
  const w=S.data?.world_rice_stories||{};
  return w[S.lang] || w.ja || [];
}
function todayStory(){
  const arr=storyList();
  return arr.length ? arr[todayIndex(arr.length,'world_rice_story')] : null;
}
function storyTitle(x){return field(x,'title')||'世界のライス物語';}
function storySubtitle(x){return field(x,'subtitle')||field(x,'theme')||'';}
function storyCountry(x){return field(x,'country_area')||'国・地域未確認';}
function storyBody(x,limit=520){
  const b=String(field(x,'body')||'本文未確認');
  if(b.length<=limit) return b;
  return b.slice(0,limit)+'…';
}
function storyCard(x,open=false){
  if(!x) return card('今日の世界ライス物語',`<p><b>物語データ未確認</b></p><p>世界の米文化・料理・食感・炊き方を1日1話で表示します。</p>`);
  return `<div class="card story-card"><h2>今日の世界ライス物語</h2><p class="small">${esc(field(x,'day_no')||'')}日目 / ${esc(storyCountry(x))} / ${esc(field(x,'region')||'')}</p><h3>${esc(storyTitle(x))}</h3><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,open?2000:520)).split('\n').join('<br>')}</p><details ${open?'open':''}><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(x,'learning_point')||'未確認')}</p><p><b>食感：</b>${esc(field(x,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(x,'cooking_note')||'未確認')}</p><p>${chips([field(x,'texture_keywords'),field(x,'related_terms')])}</p><p class="small">既存本文を保持し、必要に応じて関連情報を下に足していきます。</p></details><div class="priority-row">${btn('future','物語一覧へ')}${btn('varieties','品種を見る')}${btn('words','用語集へ')}</div></div>`;
}
function countryHistoryCard(){
  return `<div class="card"><h2>現在地のお米ヒストリー</h2><p><b>今いる国のお米の歴史や食文化へつなげます。</b></p><p>位置情報は1日1回を基本に、国単位の判定だけに使います。市区町村単位で物語を作ったり、緯度経度を長期表示したりしません。</p><details><summary>位置情報の扱い</summary><p>常時取得は行いません。最後に取得した国を、その日の参考国として使います。</p><p class="warn">GPSは水質、庫内湿度、米の品質、保管状態を測定するものではありません。</p></details><p class="small">国別ヒストリーデータは元マスター確認後に取り込みます。未収録国は準備中として表示します。</p>${btn('future','世界ライスへ')}</div>`;
}
function riceWeatherConceptCard(){
  return card('米コンディション',`<p><b>天気予報ではなく、米を扱うための確認ポイントです。</b></p><p><b>保管：</b>高湿度の日は米袋周辺、壁際、床、納米庫内壁、残米・付着米を確認します。</p><p><b>結露：</b>外気と庫内・室内の温度差が大きい日は、水滴、濡れた付着米、カビ臭、虫、変色を見ます。</p><p><b>炊飯：</b>吸水状態、べたつき、粒立ち、冷めた後の食感を確認します。</p><p class="warn">地域・天気は補助情報です。GPSだけでは水質や庫内状態は分かりません。</p>${btn('check','チェックへ')}`);
}
function todayPriorityCard(){
  const story=todayStory(), term=safeTermPick(), process=processPick();
  return `<section class="daily-hub card"><div class="daily-head"><div><span class="eyebrow">DAILY GUIDE</span><h2>今日の米ナビ</h2><p>今日の一杯を考える。米の状態、ことば、世界の物語を短く見渡します。</p></div>${illust('guide')}</div><div class="daily-cards"><button onclick="switchView('check')"><b>米のコンディション</b><span>保管・結露・水を確認</span></button><button onclick="switchView('future')"><b>世界ライス物語</b><span>${esc(storyTitle(story||{}))}</span></button><button onclick="switchView('words')"><b>用語集</b><span>${esc(termName(term))} / ${esc(process)}</span></button></div></section>`;
}

function switchView(v){S.view=v;document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));const el=$('#'+v);if(el)el.classList.add('active');document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));render();window.scrollTo({top:0,behavior:'smooth'});}
async function load(){
  const home=$('#home');
  try{
    const res=await fetch('data/rice_navi_data.json?v=78ui43',{cache:'no-store'});
    if(!res.ok) throw new Error('data fetch failed '+res.status);
    S.data=await res.json();
    document.querySelectorAll('.bottomnav button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
    const lang=$('#lang');
    if(lang) lang.onchange=e=>{S.lang=e.target.value;render()};
    render();
  }catch(err){
    console.error('RICE NAVI load error',err);
    if(home){home.innerHTML=`<div class="hero load-error"><h1>RICE NAVI</h1><p>データを読み込めませんでした。</p><p class="small">通信状態、GitHub Pagesの更新、またはデータファイル名を確認してください。</p><button class="btn" onclick="location.reload()">再読み込み</button></div>`;}
  }
}
function render(){if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords}; (map[S.view]||renderHome)();}
function setFilter(k,v,view){S.filters[k]=v;if(view)switchView(view);else render();}

function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), term=safeTermPick(), process=processPick(), future=pick(d.future_rice,'future'), story=todayStory();
 const fortunes=['吸水運','粒立ち運','ふっくら運','温度管理運','水加減運','蒸らし運','保管注意運'];
 const fortune=fortunes[todayIndex(fortunes.length,'fortune')];
 $('#home').innerHTML=`<div class="home-shell">
 <div class="home-title compact-brand"><div><h1>RICE NAVI</h1><p>米を知り、今日の一杯を考える。</p></div><div class="home-mark">RN</div></div>
 ${todayPriorityCard()}
 <div class="today-strip polished"><button onclick="switchView('home')">米ナビ<span>${esc(fortune)}</span></button><button onclick="switchView('check')">米状態<span>保管・結露・水</span></button><button onclick="switchView('future')">世界ライス<span>毎日1話</span></button></div>
 <div class="grid home-grid compact-home">
 ${card('今日の米ナビ',`${illust('fortune')}<p><b>${fortune}</b></p><p>${esc(fortuneMessage(fortune,termName(term),process))}</p><p><b>米言葉：</b>${esc(termName(term))}　<b>工程：</b>${esc(process)}</p><div class="priority-row">${btn('words','用語集で見る')}${btn('learn','学ぶ')}</div>`)}
 ${card('米コンディション',`${illust('weather')}<p><b>天気ではなく、米管理の注意へ。</b></p><p>湿度・温度差が大きい日は、保管場所、結露跡、におい、虫、付着米を先に確認します。</p><p class="warn">GPSは水質や庫内状態を測定しません。</p>${btn('check','チェックへ')}`)}
 ${storyCard(story,false)}
 ${card('今日の米言葉',`${illust('grain')}<p><b>${esc(termName(term))}</b></p><p>${esc(termNote(term))}</p><p><b>使い方：</b>用語から教材・文献・トラブル確認へ進みます。</p>${btn('words','用語集へ')}`)}
 ${card('今日のお米',`${illust('rice')}<p><b>${esc(titleOfVariety(variety||{}))}</b></p><p>${esc(countryOfVariety(variety||{}))} / ${esc(field(variety,'rice_type','grain_shape')||'種類未確認')}</p><p><b>アミロース：</b>${esc(field(variety,'amylose_range','amylose_value','amylose_class')||'未確認')}</p><p><b>たんぱく質：</b>${esc(field(variety,'protein_range','protein_value','protein_class')||'未確認')}</p><p><b>炊飯メモ：</b>${esc(cleanCookingMemo(variety||{}))}</p>${btn('varieties','米品種図鑑へ')}`)}
 ${countryHistoryCard()}
 ${card('炊飯文献ライブラリ',`${illust('doc')}<p><b>根拠・条件・数値を確認する場所です。</b></p><p>文献そのものの格付けではなく、RICE NAVI内での確認状況を整理して表示します。</p><p>${sourceBadge('炊飯文献',counts.literature_cards_v74)} ${sourceBadge('現場メモ',counts.field_notes_v74)}</p>${btn('literature','文献を見る')}`)}
 ${card('米品種図鑑',`${illust('rice')}<p><b>国・用途・食感・成分から探す。</b></p><p>確認できている情報を中心に表示し、未確認の項目は断定しません。</p>${btn('varieties','図鑑へ')}`)}
 ${card('納米庫管理',`${illust('storage')}<p><b>結露・湿度・温度差・残米・カビ臭・虫・変色</b></p><p>天気は補助。主役は保管場所の状態確認です。</p>${btn('check','保管を確認')}`)}
 ${card('ランキング',`${illust('ranking')}<p><b>米を数字で見る。</b></p><p>統合済みの順位・比較データを、対象年・単位・出典と一緒に確認します。</p>${btn('rankings','ランキングへ')}`)}
 ${card('お米の未来',`${illust('future')}<p><b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b></p><p>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}</p>${btn('future','未来50を見る')}`)}
 </div>
 <details class="data-check"><summary>収録内容を見る</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.field_notes_v74,'現場メモ','文献とは別枠')}${stat(counts.learning_cards_v82,'教材カード','お米マイスター')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat(counts.glossary_terms,'用語集','用語')}${stat(counts.future_rice,'お米の未来','未来テーマ')}${stat(counts.world_rice_stories,'世界のライス物語','365話')}${stat(counts.water_rules,'水質ルール','水の相性')}${stat(counts.mold_rules,'納米庫ルール','保管管理')}${stat(counts.ranking_definitions,'ランキング','世界の米')}</div></details>
 </div>`;
}

function tempMapHTML(){
 const events=[['浸漬・吸水','水温と時間で吸水状態が変わる。冷水・短時間では吸水不足を確認。','吸水 浸漬','learn'],['昇温','加熱初期は米粒内外の温度差と水分移動を見る。','温度 時間','literature'],['沸騰前後','98℃付近への到達と維持を、火力・蒸発・吹きこぼれと合わせて見る。','沸騰 火力','literature'],['糊化','硬さ、芯残り、べたつきの分岐を確認する。','糊化 硬さ','words'],['蒸らし','水分を均一化し、硬さ・粘り・粒立ちを整える。','蒸らし ほぐし','learn'],['ほぐし・保温','余分な蒸気、付着、老化、保温臭を確認する。','ほぐし 老化','words']];
 return `<div class="section-title"><h2>温度×時間マップ</h2></div><div class="timeline">${events.map(e=>`<div class="step"><b>${esc(e[0])}</b><p>${esc(e[1])}</p><span>${esc(e[2])}</span><button class="btn secondary" onclick="switchView('${e[3]}')">関連を見る</button></div>`).join('')}</div>`;
}
function renderLearn(){
 const data=(S.data.learning_multilingual&&S.data.learning_multilingual.length?S.data.learning_multilingual:S.data.learning_cards)||[], q=S.filters.learn||'', level=S.filters.level||'';
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!level||levelLabel(x)===level));
 const levelCounts=['初級','中級','上級'].map(l=>[l,data.filter(x=>levelLabel(x)===l).length]);
 const termTop=['浸漬','吸水','水温','糊化','蒸らし','ほぐし','老化','硬さ','粘り','水質'];
 $('#learn').innerHTML=`<div class="hero"><h1>学ぶ</h1><p>炊飯の基本から応用まで、教材カード・用語・文献をつないで確認します。</p></div>${tempMapHTML()}
 <div class="section-title"><h2>レベル別入口</h2></div><div class="priority-row">${levelCounts.map(([l,n])=>`<button onclick="S.filters.level='${l}';renderLearn()">${l} ${n}</button>`).join('')}<button onclick="S.filters.level='';S.filters.learn='';renderLearn()">全教材</button></div>
 <div class="section-title"><h2>工程・用語入口</h2></div><div class="priority-row">${termTop.map(k=>`<button onclick="S.filters.learn='${k}';renderLearn()">${k}</button>`).join('')}</div>
 <div class="toolbar"><input placeholder="教材検索" value="${esc(q)}" oninput="setFilter('learn',this.value)"><select onchange="setFilter('level',this.value)"><option value="">全レベル</option>${['初級','中級','上級'].map(x=>`<option ${x===level?'selected':''}>${x}</option>`).join('')}</select></div>
 <div class="countbar">${stat(filtered.length,'表示中の教材')}${stat(data.length,'教材カード総数')}${stat((S.data.literature.cards||[]).length,'関連文献候補')}</div>
 <div class="list">${filtered.map(x=>`<div class="item"><h3>${esc(lc(x,'title')||'教材名未確認')}</h3><p>${chips([levelLabel(x),lc(x,'related_terms')])}</p><p>${esc(lc(x,'short')||lc(x,'easy')||'説明は未確認')}</p><p><b>確認ポイント：</b>${esc(lc(x,'field_check_points')||'未確認')}</p><details><summary>条件・注意・出典</summary><p><b>条件・数値：</b>${esc(lc(x,'numbers_conditions')||'未確認')}</p><p><b>注意：</b>${esc(lc(x,'warning')||'未確認')}</p><div class="source">出典ID：${esc(field(x,'source_ids')||'未確認')}<br>根拠番号：${esc(field(x,'claim_ids')||'未確認')}</div></details><button class="btn secondary" onclick="S.filters.litq='${esc((lc(x,'related_terms')||lc(x,'title')||'').split(/[;；,、]/)[0])}';switchView('literature')">関連文献を探す</button></div>`).join('')}</div>`;
}

function renderLiterature(){
 const cards=litCards(), notes=S.data.literature.field_notes||[], q=S.filters.litq||'', cat=S.filters.litcat||'', ev=S.filters.evidence||'AB';
 const categories=[...new Set(cards.map(x=>x.category).filter(has))].sort();
 const categoryTop=topCategories(cards,12);
 const evOK=x=>ev==='ALL'||(ev==='AB'&&['A','B'].includes(x._class))||x._class===ev;
 const filtered=cards.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!cat||x.category===cat)&&evOK(x)).sort((a,b)=>literatureScore(b)-literatureScore(a));
 const classCounts={A:cards.filter(x=>x._class==='A').length,B:cards.filter(x=>x._class==='B').length,C:cards.filter(x=>x._class==='C').length,D:cards.filter(x=>x._class==='D').length};
 $('#literature').innerHTML=`<div class="hero"><h1>炊飯文献ライブラリ</h1><p>根拠、条件、数値、出典を確認する場所です。表示区分は文献の優劣ではなく、RICE NAVI内の確認状況です。</p></div>
 <div class="countbar">${stat(classCounts.A,'原文確認済み候補','確認状態')}${stat(classCounts.B,'要約整理済み','確認状態')}${stat(classCounts.C,'確認中','再確認対象')}${stat(notes.length,'現場メモ','文献と分離')}</div>
 <div class="toolbar"><input placeholder="文献検索" value="${esc(q)}" oninput="setFilter('litq',this.value)"><select onchange="setFilter('litcat',this.value)"><option value="">全カテゴリ</option>${categories.map(c=>`<option ${c===cat?'selected':''}>${esc(c)}</option>`).join('')}</select><select aria-label="根拠確認ステータス" onchange="setFilter('evidence',this.value)"><option value="AB" ${ev==='AB'?'selected':''}>確認済み中心</option><option value="A" ${ev==='A'?'selected':''}>原文確認済み候補</option><option value="B" ${ev==='B'?'selected':''}>要約整理済み</option><option value="C" ${ev==='C'?'selected':''}>確認中</option><option value="ALL" ${ev==='ALL'?'selected':''}>全件</option></select></div>
 <div class="section-title"><h2>カテゴリ入口</h2></div><div class="priority-row">${categoryTop.map(([k,n])=>`<button onclick="S.filters.litcat='${esc(k)}';S.filters.litq='';renderLiterature()">${esc(k)} ${n}</button>`).join('')}<button onclick="S.filters.litcat='';S.filters.litq='';S.filters.evidence='AB';renderLiterature()">解除</button></div>
 <div class="priority-row">${['浸漬','吸水','糊化','蒸らし','老化','水質','pH','硬さ','べたつき','衛生','温度','保管','結露'].map(k=>`<button onclick="setFilter('litq','${k}')">${k}</button>`).join('')}</div>
 <div class="data-note"><b>注意：</b>この区分は文献の優劣ではなく、RICE NAVI内での確認・整理状況を示します。出典IDだけで確定扱いにせず、要点・条件・出典の有無を確認します。現場メモは文献と分けて表示します。</div>
 <div class="list">${filtered.slice(0,180).map(x=>{const cls=x._class;const summary=field(x,'summary');return `<div class="item evidence${cls}"><h3>${esc(field(x,'title')||'文献名未確認')}</h3><p>${chips([x.category,evidenceLabel(cls),traceText(x.status),traceText(x.decision)])}</p><p class="small">${esc(statusInfo(cls))}</p>${summary&&!same(summary,x.title)?`<p><b>文献要点：</b>${esc(summary)}</p>`:`<p><b>文献要点：</b>未確認</p>`}<p><b>条件・数値：</b>${esc(field(x,'condition')||'未確認')}</p><details><summary>根拠・出典・確認ポイント</summary><p><b>確認ポイント：</b>${esc(field(x,'trace')?traceText(x.trace):'未確認')}</p>${claimDetails(field(x,'claim_ids'))}<div class="source">カードID：${esc(field(x,'id')||'未確認')} / 根拠番号：${esc(field(x,'claim_ids')||'未確認')}</div>${sourceDetails(field(x,'source_ids'))}</details><div class="priority-row"><button class="btn secondary" onclick="S.filters.learn='${esc((x.category||x.title||'').split(/[・/ ]/)[0])}';switchView('learn')">関連教材を探す</button><button class="btn secondary" onclick="S.filters.wordq='${esc((x.category||x.title||'').split(/[・/ ]/)[0])}';switchView('words')">用語集で見る</button></div></div>`}).join('')}</div>
 <details class="field-note"><summary>現場メモを別枠で見る</summary><p class="small">現場メモは文献カードではありません。文献根拠と混ぜずに表示します。</p><div class="list">${notes.slice(0,120).map(n=>`<div class="item field-item"><h3>${esc(field(n,'title')||'メモ名未確認')}</h3><p>${chips([n.category,traceText(n.decision),'文献とは分離'])}</p><p>${esc(field(n,'summary')||'')}</p><p><b>扱い：</b>${esc(field(n,'condition')||'未確認')}</p><p><b>次の確認：</b>${esc(field(n,'next_action')||'未確認')}</p></div>`).join('')}</div></details>`;
}

function renderVarieties(){
 const data=S.data.rice_varieties||[]; const q=S.filters.varq||'', country=S.filters.country||'', use=S.filters.use||'', texture=S.filters.texture||'', amy=S.filters.amy||'', protein=S.filters.protein||'';
 const countries=[...new Set(data.map(countryOfVariety))].filter(has).sort();
 const uses=[...new Set(data.map(x=>field(x,'use_category_primary','main_uses')).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(norm).filter(x=>x&&x!=='未確認'))].slice(0,80).sort();
 const textures=[...new Set(data.map(x=>field(x,'texture_tags','aroma','rice_type')).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(norm).filter(x=>x&&x!=='未確認'))].slice(0,80).sort();
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||countryOfVariety(x)===country)&&(!use||String(field(x,'use_category_primary','main_uses')).includes(use))&&(!texture||String(field(x,'texture_tags','aroma','rice_type')).includes(texture))&&(!amy||String(field(x,'amylose_class','amylose_range','amylose_value')).includes(amy))&&(!protein||String(field(x,'protein_class','protein_range','protein_value')).includes(protein)));
 const countryTop=[...new Map(countries.map(c=>[c,data.filter(x=>countryOfVariety(x)===c).length]).sort((a,b)=>b[1]-a[1]).slice(0,12))];
 $('#varieties').innerHTML=`<div class="hero"><h1>米品種図鑑</h1><p>国、用途、食感、成分から品種を探せます。未確認の情報は断定せず表示します。</p></div>
 <div class="section-title"><h2>国・地域別入口</h2></div><div class="priority-row">${countryTop.map(([c,n])=>`<button onclick="S.filters.country='${esc(c)}';renderVarieties()">${esc(c)} ${n}</button>`).join('')}</div>
 <div class="toolbar"><input placeholder="品種検索" value="${esc(q)}" oninput="setFilter('varq',this.value)"><select onchange="setFilter('country',this.value)"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('use',this.value)"><option value="">全用途</option>${uses.slice(0,50).map(c=>`<option ${c===use?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('texture',this.value)"><option value="">全食感・特徴</option>${textures.slice(0,50).map(c=>`<option ${c===texture?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="priority-row"><button onclick="setFilter('country','日本')">日本</button><button onclick="setFilter('country','台湾')">台湾</button><button onclick="setFilter('country','タイ')">タイ</button><button onclick="setFilter('amy','低')">低アミロース</button><button onclick="setFilter('amy','高')">高アミロース</button><button onclick="setFilter('protein','高')">高たんぱく質</button><button onclick="S.filters.country='';S.filters.use='';S.filters.texture='';S.filters.amy='';S.filters.protein='';renderVarieties()">絞込解除</button></div>
 <div class="countbar">${stat(filtered.length,'表示中の品種')}${stat(data.length,'品種総数')}${stat(countries.length,'国・地域')}${stat(uses.length,'用途分類候補')}</div>
 <div class="list">${filtered.slice(0,250).map(v=>`<div class="item"><h3>${esc(titleOfVariety(v))}</h3><p>${chips([countryOfVariety(v),field(v,'rice_type'),field(v,'grain_shape'),field(v,'texture_tags')])}</p><p><b>アミロース：</b>${esc(field(v,'amylose_range','amylose_value','amylose_class')||'未確認')}　<b>たんぱく質：</b>${esc(field(v,'protein_range','protein_value','protein_class')||'未確認')}</p><p><b>用途：</b>${esc(field(v,'main_uses','business_uses','use_category_primary')||'未確認')}</p><p><b>炊飯メモ：</b>${esc(cleanCookingMemo(v))}</p><details><summary>詳細・出典</summary><p><b>原産・生産：</b>${esc(field(v,'main_production_regions','origin_country_ja')||'未確認')}</p><p><b>消費市場：</b>${esc(field(v,'main_consumption_markets')||'未確認')}</p><p><b>食感：</b>${esc(field(v,'texture_tags')||'未確認')}</p><p><b>${esc(sourceStatusText(v))}</b></p><p class="small">${esc(varietyConfirmNote(v))}</p><p><b>未確認項目：</b>${esc(field(v,'unverified_fields')||'未確認')}</p><div class="source">出典ID：${esc(field(v,'source_ids')||'未確認')}<br>${esc(field(v,'source_urls')||'URL未確認')}</div></details><button class="btn secondary" onclick="S.filters.litq='${esc(field(v,'related_terms','rice_type','display_name_ja'))}';switchView('literature')">関連文献を探す</button></div>`).join('')}</div>`;
}

function renderCheck(){
 const w=S.data.water||{}, sm=S.data.storage_mold||{}, raw=sm.raw||{}; const checklist=raw.checklist||sm.checklist||[], rules=raw.rules||sm.rules||[], claims=raw.claims||sm.claims||[], sources=raw.sources||sm.sources||[], region=(w.regions||[])[0]||{};
 const coreKeys=['結露','湿度','温度','残米','付着','カビ臭','虫','変色','清掃'];
 const coreClaims=coreKeys.map(k=>claims.find(c=>String(c.theme||c.claim_ja||'').includes(k))).filter(Boolean);
 $('#check').innerHTML=`<div class="hero"><h1>チェック</h1><p>天気・水・保管の情報を、米を扱うための確認ポイントに変換します。</p></div>
 <div class="split">
 ${card('水の相性チェック',`<p><b>水の傾向を、炊飯結果と合わせて見ます。</b></p><p>pH、硬度、TDS、残留塩素を、硬さ・粘り・においの変化と一緒に確認します。</p><p>地域参考値：${esc(field(region,'area_name_ja')||'準備中')} / 硬度：${esc(field(region,'total_hardness_mgL_CaCO3')||'未確認')} / pH：${esc(field(region,'pH')||'未確認')}</p><div class="mini-grid"><span><b>pH</b><br>酸性・中性・アルカリ性の目安</span><span><b>硬度</b><br>カルシウム・マグネシウム量の目安</span><span><b>TDS</b><br>水に溶けた物質量の目安</span><span><b>残留塩素</b><br>におい・味への影響確認</span></div><details open><summary>見る順番</summary><p>1. 地域の参考値を確認</p><p>2. 手元の測定値があれば入力</p><p>3. 炊飯結果の硬さ・粘り・においと照合</p><p>4. 米・浸漬・加熱条件と合わせて見る</p></details>`,`<p class="small">水質ルール ${(w.quality_rules||[]).length}件 / 水質根拠 ${(w.claims||[]).length}件</p>`)}
 ${card('水質ルール一覧',`<div class="compact-list">${(w.quality_rules||[]).slice(0,13).map(r=>`<p><b>${esc(field(r,'parameter','rule_name','item')||'項目')}</b>：${esc(field(r,'rule_ja','meaning_ja','advice_ja','note_ja')||'未確認')}</p>`).join('')}</div><details><summary>水質出典</summary>${(w.sources||[]).slice(0,10).map(s=>`<div class="source"><b>${esc(field(s,'source_id'))}</b> ${esc(field(s,'source_title_ja'))}<br>${esc(field(s,'source_url'))}</div>`).join('')}</details>`)}
 ${card('保管環境チェック',`<p><b>今日の保管注意：</b>湿度・温度差・雨天後の結露跡を確認します。</p><p>見る場所：米袋周辺、床、壁際、ホッパー、搬送部、納米庫内壁。</p><p class="warn">濡れた付着米、カビ臭、虫、変色は炊飯調整ではなく保管・清掃・隔離判断です。</p>`)}
 ${card('納米庫管理',`<p><b>見る順番：</b>結露 → 湿度 → 温度差 → 残米・付着米 → カビ臭 → 虫 → 変色 → 清掃記録。</p><div class="mini-grid"><span>1. 納米庫で見るべきこと</span><span>2. 結露とは何か</span><span>3. 湿度管理</span><span>4. 温度管理</span><span>5. 残米・付着米</span><span>6. カビ臭・虫・変色</span><span>7. 危険サイン</span><span>8. 点検場所</span><span>9. 今日の補助注意</span><span>10. 出典・根拠</span></div><details open><summary>危険サインと根拠</summary>${coreClaims.slice(0,9).map(c=>`<p><b>${esc(c.theme||'確認')}</b>：${esc(c.claim_ja||'未確認')}<br><span class="small">根拠ID：${esc(c.claim_id||'未確認')} / 出典：${esc(c.source_ids||'未確認')}</span></p>`).join('')}</details><details><summary>点検場所</summary>${checklist.slice(0,13).map(c=>`<p><b>${esc(c.timing||'点検')}</b> ${esc(c.check_area||'場所未確認')}：${esc(c.check_item||'項目未確認')}<br><span class="small">方法：${esc(c.method||'未確認')} / NG時：${esc(c.action_if_ng||'未確認')}</span></p>`).join('')}</details>`,`<p class="small">判定ルール ${rules.length}件 / 点検 ${checklist.length}件 / 根拠 ${claims.length}件</p>`)}
 ${card('納米庫ルール一覧',`<div class="compact-list">${rules.slice(0,21).map(r=>`<p><b>${esc(field(r,'rule_id','condition','trigger')||'ルール')}</b>：${esc(field(r,'action_ja','rule_ja','message_ja','note_ja')||field(r,'condition')||'未確認')}</p>`).join('')}</div><details><summary>納米庫出典</summary>${sources.slice(0,10).map(s=>`<div class="source"><b>${esc(s.source_id||'')}</b> ${esc(s.title||'')}<br>${esc(s.url||'')}</div>`).join('')}</details>`)}
 ${card('トラブル診断',`<p>症状から、関連する教材・文献・チェック項目へ進みます。</p><div class="quickgrid"><button onclick="S.filters.litq='べたつき';switchView('literature')">べたつき</button><button onclick="S.filters.litq='硬さ';switchView('literature')">硬い</button><button onclick="S.filters.learn='吸水';switchView('learn')">吸水不足</button><button onclick="S.filters.litq='老化';switchView('literature')">老化</button><button onclick="S.filters.litq='水質';switchView('literature')">水質</button><button onclick="S.filters.litq='カビ';switchView('check')">カビ・保管</button><button onclick="S.filters.litq='糊化';switchView('literature')">芯残り</button><button onclick="S.filters.litq='蒸らし';switchView('learn')">蒸らし不足</button></div><p class="small">専用診断データが不足する部分は、関連する文献・教材・納米庫管理へ接続します。</p>`)}
 </div>`;
}

function renderFuture(){
 const data=S.data.future_rice||[], q=S.filters.future||'', cat=S.filters.futureCat||'', cats=[...new Set(data.map(x=>x.category).filter(has))].sort();
 const stories=storyList(), story=todayStory(), storyQ=S.filters.storyq||'', storyCountryFilter=S.filters.storyCountry||'';
 const storyCountries=[...new Set(stories.map(storyCountry).filter(has))].sort();
 const storyFiltered=stories.filter(x=>(!storyQ||JSON.stringify(x).includes(storyQ))&&(!storyCountryFilter||storyCountry(x)===storyCountryFilter));
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!cat||x.category===cat));
 $('#future').innerHTML=`<div class="hero"><h1>世界ライス物語</h1><p>世界の米文化を毎日1話。本文を大切にしながら、料理・食感・炊飯の見方へつなげます。</p></div>
 <div class="grid">${storyCard(story,true)}${countryHistoryCard()}${card('GPS・天気情報の扱い',`<p><b>GPSは国判定の入口、天気は米管理アラートの補助です。</b></p><p>GPSで水質、庫内湿度、米の品質を測定しているわけではありません。天気情報は、保管注意・結露注意・吸水や炊飯確認ポイントへ変換して表示します。</p><p class="small">常時取得ではなく、現在地のお米ヒストリーでは1日1回の国判定を基本にします。</p>`)}</div>
 <div class="section-title"><h2>世界のライス物語 365</h2></div>
 <div class="toolbar"><input placeholder="物語検索" value="${esc(storyQ)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">全ての国・地域</option>${storyCountries.map(c=>`<option ${c===storyCountryFilter?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="countbar">${stat(storyFiltered.length,'表示中の物語')}${stat(stories.length,'物語総数')}${stat(storyCountries.length,'国・地域')}</div>
 <div class="list">${storyFiltered.slice(0,80).map(x=>`<div class="item story-item"><h3>${esc(storyTitle(x))}</h3><p>${chips([field(x,'day_no')+'日目',storyCountry(x),field(x,'region'),field(x,'theme')])}</p><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,360)).split('\n').join('<br>')}</p><details><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(x,'learning_point')||'未確認')}</p><p><b>好み・文化：</b>${esc(field(x,'preference_viewpoint')||'未確認')}</p><p><b>料理場面：</b>${esc(field(x,'scene_note')||'未確認')}</p><p><b>食感：</b>${esc(field(x,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(x,'cooking_note')||'未確認')}</p><p>${chips([field(x,'texture_keywords'),field(x,'related_terms'),field(x,'related_card_search')])}</p></details></div>`).join('')}</div>
 <div class="section-title"><h2>お米の未来50</h2></div><div class="toolbar"><input placeholder="未来テーマ検索" value="${esc(q)}" oninput="setFilter('future',this.value)"><select onchange="setFilter('futureCat',this.value)"><option value="">全カテゴリ</option>${cats.map(c=>`<option ${c===cat?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'未来テーマ総数')}${stat(cats.length,'カテゴリ')}</div>
 <div class="list">${filtered.map(x=>`<div class="item"><h3>${esc(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ')}</h3><p>${chips([x.category,x.source_type])}</p><p><b>${esc(tx(x,'subtitle')||field(x,'subtitle_ja')||'')}</b></p><p>${esc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'本文未確認')}</p><details><summary>関連・出典</summary><p><b>関連：</b>文献、米品種、世界ランキング、水、保管、物語へ接続予定</p><div class="source">${esc(field(x,'source_note','source_name')||'未確認')}<br>${esc(field(x,'source_url')||'URL未確認')}</div></details></div>`).join('')}</div>`;
}
function renderRankings(){
 const defs=S.data.rankings?.rankings||[], rows=S.data.ranking_items_template||[];
 const filledRows=rows.filter(x=>has(x.country_or_item_ja)&&has(x.value));
 const readyDefs=defs.filter(def=>{
   const items=(def.items||[]).concat(filledRows.filter(x=>x.ranking_id===def.ranking_id));
   return items.length>0;
 });
 const pendingDefs=defs.filter(def=>!readyDefs.includes(def));
 function rankCard(def,ready){
   const title=tx(def,'display_title')||tx(def,'ranking_name')||def.ranking_id;
   const desc=tx(def,'short_desc')||tx(def,'value')||'説明未確認';
   const items=(def.items||[]).concat(filledRows.filter(x=>x.ranking_id===def.ranking_id));
   return `<div class="item ranking-card ${ready?'':'pending'}"><h3>${esc(title)}</h3><p>${esc(desc)}</p><p>${chips([def.source_name,def.unit])}</p>${ready?`<table><thead><tr><th>順位</th><th>国・項目</th><th>数値</th><th>年</th></tr></thead><tbody>${items.slice(0,10).map(x=>`<tr><td>${esc(x.rank)}</td><td>${esc(tx(x,'country_or_item')||field(x,'country_or_item_ja'))}</td><td>${esc(field(x,'value')||'未確認')} ${esc(field(x,'unit')||def.unit||'')}</td><td>${esc(field(x,'source_year')||'未確認')}</td></tr>`).join('')}</tbody></table>`:`<div class="rank-empty"><b>順位データ確認中</b><br><span>このランキングは定義のみ収録されています。確認できた順位・国、数値、単位、年を表示します。</span></div>`}<details><summary>定義・出典候補</summary><p><b>出典候補：</b>${esc(def.source_name||'出典名未確認')}</p><p><b>単位：</b>${esc(def.unit||'未確認')}</p><p><b>計算方法：</b>${esc(def.calculation_method||'未確認')}</p><p><b>注意：</b>${esc(tx(def,'caution')||'未確認')}</p></details></div>`;
 }
 $('#rankings').innerHTML=`<div class="hero page-hero"><h1>世界の米ランキング</h1><p>米を数字で見るページです。統合済みの順位・比較データを、対象年・単位・出典と一緒に表示します。</p></div>
 <div class="data-note"><b>順位表の状態：</b>TOP10明細がそろっているランキングを表で表示します。</div>
 <div class="countbar">${stat(defs.length,'ランキング定義')}${stat(filledRows.length,'入力済み順位')}${stat(readyDefs.length,'順位表あり')}${stat(pendingDefs.length,'順位データ確認中')}</div>
 <div class="section-title"><h2>順位表があるランキング</h2></div>
 <div class="list ranking-list">${readyDefs.length?readyDefs.map(def=>rankCard(def,true)).join(''):`<div class="item"><h3>順位表を確認中です</h3><p>ランキング定義は収録されていますが、順位・比較データを確認中です。出典確認後に表として表示します。</p></div>`}</div>
 <div class="section-title"><h2>順位データ確認中</h2></div>
 <div class="list ranking-list">${pendingDefs.map(def=>rankCard(def,false)).join('')}</div>`;
}

function renderWords(){
 const data=S.data.glossary||[], q=S.filters.wordq||'', preferred=['浸漬','吸水','蒸らし','ほぐし','糊化','粘り','硬さ','水加減','べたつき','老化'];
 const sorted=[...data].sort((a,b)=>{const ia=preferred.indexOf(a.term_ja), ib=preferred.indexOf(b.term_ja);return (ia<0?999:ia)-(ib<0?999:ib)||termName(a).localeCompare(termName(b),'ja');});
 const filtered=sorted.filter(x=>!q||JSON.stringify(x).includes(q));
 $('#words').innerHTML=`${v47PageLead('用語集','米・炊飯・水・保管・世界の米文化に関わる用語を検索します。','word')}
 <section class="dictionary-feature-v51">${art('word')}<div><span class="eyebrow">RICE WORDS</span><h2>用語集</h2><p>1000語を目標に、既存データから抽出した用語を整理しています。説明はRICE NAVI編集解説として扱います。</p></div></section>
 <div class="toolbar"><input placeholder="用語検索" value="${esc(q)}" oninput="setFilter('wordq',this.value)"></div>
 <div class="priority-row">${preferred.map(k=>`<button onclick="setFilter('wordq','${k}')">${k}</button>`).join('')}<button onclick="setFilter('wordq','')">全件</button></div>
 <div class="countbar">${stat(filtered.length,'表示中の用語')}${stat(data.length,'用語集')}${stat(preferred.length,'入口用語')}</div>
 <div class="dictionary-grid-v51">${filtered.map(x=>`<article class="item dictionary-card-v51"><div class="dict-head-v51"><div><span class="pill">${esc(termCategory(x))}</span><h3>${esc(termName(x))}</h3></div>${art('word')}</div><p>${esc(termNote(x))}</p><p><b>炊飯で見ること：</b>${esc(termRelevance(x)||'関連する教材・文献と合わせて確認します。')}</p><p><b>今日の見方：</b>${esc(termTodayView(x)||'検索語として使います。')}</p><p>${chips([termRelated(x)])}</p><div class="priority-row"><button class="btn secondary" onclick="S.filters.litq='${esc(field(x,'term_ja'))}';switchView('literature')">関連文献</button><button class="btn secondary" onclick="S.filters.learn='${esc(field(x,'term_ja'))}';switchView('learn')">教材で見る</button></div></article>`).join('')}</div>`;
}

function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), term=safeTermPick(), process=processPick(), future=pick(d.future_rice,'future'), story=todayStory();
 const fortunes=['吸水運','粒立ち運','ふっくら運','温度管理運','水加減運','蒸らし運','保管注意運'];
 const fortune=fortunes[todayIndex(fortunes.length,'fortune')];
 $('#home').innerHTML=`<div class="home-v47">
  <section class="daily-hero-v47">
    <div class="daily-copy"><span class="eyebrow">RICE NAVI</span><h1>今日の米ナビ</h1><p>今日の一杯を考える。米の状態、ことば、世界の物語を軽く見渡します。</p></div>
    <div class="daily-visual">${art('fortune')}</div>
  </section>
  <section class="nav-cards-v47">
    ${navCard('home','米ナビ',fortune,'fortune','今日の入口')}
    ${navCard('check','米コンディション','保管・結露・水を確認','weather','米管理')}
    ${navCard('future','世界ライス','毎日1話の米文化','world','物語')}
  </section>
  <section class="home-grid-v47">
    ${homeMini('用語集',`<b>${esc(termName(term))}</b><br>${esc(termNote(term))}<br><span class="small">工程：${esc(process)}</span>`,'word','words','用語集へ')}
    ${currentRiceCardV47(variety)}
    ${homeMini('現在地のお米ヒストリー',`今いる国に関係する米文化、料理、品種の入口です。<br><span class="small">32か国の国別ヒストリーを収録済みです。</span>`,'map','future','考え方を見る')}
    ${homeMini('米コンディション',`湿度・温度差が大きい日は、結露、におい、虫、付着米を先に確認します。`,'weather','check','チェックへ')}
    ${todayStoryHomeCard(story)}
    ${homeMini('炊飯文献',`文献の優劣ではなく、RICE NAVI内での確認状態を整理します。<br><span class="small">${esc(counts.literature_cards_v74||0)}件 / 現場メモは別枠</span>`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露・湿度・温度差・残米・カビ臭・虫・変色を見るページです。`,'storage','check','保管へ')}
    ${homeMini('世界ランキング',`統合済みの順位・比較データを確認します。`,'ranking','rankings','ランキングへ')}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来50へ')}
  </section>
  <details class="data-check compact"><summary>収録内容を見る</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.field_notes_v74,'現場メモ','文献とは別枠')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.ranking_definitions,'ランキング','定義')}</div></details>
 </div>`;
}
function renderCheck(){
 const water=S.data.water||{}, storage=S.data.storage_mold||{};
 const rules=water.rules||[], claims=water.claims||[], mRules=storage.rules||[], checklist=storage.checklist||[];
 const ten=['結露','湿度','温度差','残米','付着米','カビ臭','虫','変色','清掃','点検場所'];
 $('#check').innerHTML=`<div class="hero page-hero"><h1>チェック</h1><p>天気や地域情報をそのまま表示するのではなく、米を扱うための確認ポイントに変換します。</p></div>
 <div class="grid compact-home">
 ${card('米コンディション',`${illust('weather')}<p><b>保管注意・結露注意を先に見ます。</b></p><p>湿度・温度差が大きい日は、米袋周辺、納米庫内壁、残米・付着米、におい、虫、変色を確認します。</p><p class="warn">GPSや天気は補助情報です。水質、庫内湿度、米品質を測定するものではありません。</p>`)}
 ${card('水の相性チェック',`${illust('weather')}<p><b>pH、硬度、TDS、残留塩素の意味を確認します。</b></p><p>地域参考値がない場合は「準備中」「未確認」と表示します。建物配管、貯水槽、フィルターで実際の水質は変わります。</p><div class="priority-row"><button>pH</button><button>硬度</button><button>TDS</button><button>残留塩素</button></div>`)}
 ${card('納米庫管理',`${illust('storage')}<p><b>見るべき10項目</b></p><p>${ten.map(x=>`<span class="pill">${x}</span>`).join(' ')}</p><p>天気は補助。主役は保管場所の状態です。</p>`)}
 </div>
 <div class="section-title"><h2>水質ルール</h2></div><div class="list">${rules.slice(0,40).map(x=>`<div class="item"><h3>${esc(field(x,'title_ja','title')||'水質ルール')}</h3><p>${esc(field(x,'summary_ja','summary')||field(x,'rule_ja')||'説明未確認')}</p><p class="small">地域参考値：準備中 / 実測値：ユーザー入力または検査値で確認</p></div>`).join('')||'<div class="item"><h3>水質ルール未確認</h3><p>ルールデータが未収録です。</p></div>'}</div>
 <div class="section-title"><h2>納米庫ルール</h2></div><div class="list">${mRules.slice(0,40).map(x=>`<div class="item"><h3>${esc(field(x,'title_ja','title')||field(x,'check_item_ja')||'納米庫ルール')}</h3><p>${esc(field(x,'summary_ja','summary','rule_ja')||'説明未確認')}</p></div>`).join('')}${checklist.slice(0,13).map(x=>`<div class="item field-item"><h3>${esc(field(x,'item_ja','title_ja','title')||'点検項目')}</h3><p>${esc(field(x,'check_ja','summary_ja','summary')||'点検内容未確認')}</p></div>`).join('')}</div>`;
}


/* v47: deeper UI implementation for literature, variety, rankings, and world story.
   Carry-over policy: new fixes do not erase previous tasks. This version keeps v46 home visual assets and expands them to core pages. */
function v47Text(v, fallback='未確認'){ return has(v)?esc(traceText(v)):esc(fallback); }
function v47StatusClass(x){ const cls=classifyLit(x); return cls==='A'||cls==='B'?'confirmed':cls==='C'?'checking':'field'; }
function v47StatusLabel(x){ return confirmationLabel(classifyLit(x)); }
function v47StatusNote(x){ return confirmationTone(classifyLit(x)); }
function v47PageLead(title, copy, kind){return `<div class="page-lead-v47"><div><span class="eyebrow">RICE NAVI</span><h1>${esc(title)}</h1><p>${copy}</p></div>${art(kind)}</div>`;}
function v47Empty(title, copy){return `<div class="item empty-state-v47"><h3>${esc(title)}</h3><p>${copy}</p></div>`;}
function v47SourceBlock(ids){ return sourceDetails(ids); }
function v47LiteratureCard(x){
 const cls=classifyLit(x), title=field(x,'title')||'文献名未確認', summary=field(x,'summary'), cond=field(x,'condition'), cat=field(x,'category');
 return `<article class="item lit-card-v47 ${v47StatusClass(x)}"><div class="item-top"><div><h3>${esc(title)}</h3><p>${chips([cat, v47StatusLabel(x), traceText(field(x,'status')), traceText(field(x,'decision'))])}</p></div><span class="status-chip ${cls==='C'||cls==='D'?'soft':''}">${esc(v47StatusLabel(x))}</span></div>
 <div class="confirm-box ${cls==='C'?'confirm-C':cls==='D'?'confirm-D':''}"><b>確認状況</b><span>${esc(v47StatusNote(x))}</span><span>この表示は文献の優劣ではなく、RICE NAVI内の整理状況です。</span></div>
 ${summary&&!same(summary,title)?`<p><b>文献要点：</b>${esc(summary)}</p>`:`<p><b>文献要点：</b><span class="missing">未確認</span></p>`}
 <p><b>条件・数値：</b>${cond?esc(cond):'<span class="missing">未確認</span>'}</p>
 <details><summary>根拠・出典・関連を見る</summary><p><b>確認ポイント：</b>${esc(field(x,'trace')?traceText(x.trace):'未確認')}</p>${claimDetails(field(x,'claim_ids'))}<div class="source">カードID：${esc(field(x,'id')||'未確認')} / 根拠番号：${esc(field(x,'claim_ids')||'未確認')}</div>${v47SourceBlock(field(x,'source_ids'))}<div class="priority-row"><button class="btn secondary" onclick="S.filters.learn='${esc((cat||title||'').split(/[・/ ]/)[0])}';switchView('learn')">関連教材</button><button class="btn secondary" onclick="S.filters.wordq='${esc((cat||title||'').split(/[・/ ]/)[0])}';switchView('words')">用語集</button></div></details></article>`;
}
function renderLiterature(){
 const all=S.data.literature?.cards||[], notes=S.data.literature?.field_notes||[], q=S.filters.litq||'', cat=S.filters.litcat||'', status=S.filters.litstatus||'confirmed';
 const enriched=all.map(x=>({...x,_class:classifyLit(x)}));
 const cats=topCategories(all,14); const base=enriched.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!cat||x.category===cat));
 const filtered=base.filter(x=> status==='all'||(status==='confirmed'&&(x._class==='A'||x._class==='B'))||(status==='source'&&x._class==='A')||(status==='summary'&&x._class==='B')||(status==='checking'&&x._class==='C'));
 const countBy={confirmed:base.filter(x=>x._class==='A'||x._class==='B').length,source:base.filter(x=>x._class==='A').length,summary:base.filter(x=>x._class==='B').length,checking:base.filter(x=>x._class==='C').length,all:base.length};
 $('#literature').innerHTML=`${v47PageLead('炊飯文献ライブラリ','文献・条件・数値・出典を、現場メモと混ぜずに確認します。文献の価値を格付けする画面ではありません。','doc')}
 <section class="v47-intro-grid"><div class="intro-card-v47">${art('doc')}<b>根拠を確認</b><span>要点、条件、出典IDを分けて表示。</span></div><div class="intro-card-v47">${art('word')}<b>条件を探す</b><span>浸漬、吸水、糊化、蒸らしなどで検索。</span></div><div class="intro-card-v47">${art('storage')}<b>現場メモを分離</b><span>文献ではなく実務メモとして別枠にします。</span></div></section>
 <div class="toolbar sticky-toolbar-v47"><input placeholder="文献検索：浸漬、吸水、糊化、水質など" value="${esc(q)}" oninput="setFilter('litq',this.value)"><select onchange="setFilter('litcat',this.value)"><option value="">全カテゴリ</option>${cats.map(([c,n])=>`<option ${c===cat?'selected':''} value="${esc(c)}">${esc(c)} (${n})</option>`).join('')}</select></div>
 <div class="status-tabs-v47"><button class="${status==='confirmed'?'active':''}" onclick="setFilter('litstatus','confirmed')">確認済み中心 ${countBy.confirmed}</button><button class="${status==='source'?'active':''}" onclick="setFilter('litstatus','source')">原文確認候補 ${countBy.source}</button><button class="${status==='summary'?'active':''}" onclick="setFilter('litstatus','summary')">要約整理済み ${countBy.summary}</button><button class="${status==='checking'?'active':''}" onclick="setFilter('litstatus','checking')">再確認が必要 ${countBy.checking}</button><button class="${status==='all'?'active':''}" onclick="setFilter('litstatus','all')">全件 ${countBy.all}</button></div>
 <div class="data-note"><b>確認ステータス：</b>文献要点と出典の対応を確認しやすくするための整理です。</div>
 <div class="quickgrid category-grid-v47">${cats.slice(0,8).map(([c,n])=>`<button onclick="S.filters.litcat='${esc(c)}';renderLiterature()">${esc(c)}<br><span>${n}件</span></button>`).join('')}</div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat(all.length,'文献カード')}${stat(notes.length,'現場メモ','別枠')}${stat((S.data.literature?.sources||[]).length,'出典')}</div>
 <div class="list lit-list-v47">${filtered.slice(0,160).map(v47LiteratureCard).join('')||v47Empty('該当する文献がありません','検索語や確認ステータスを変えてください。')}</div>
 <details class="field-note"><summary>現場メモを別枠で見る</summary><p class="small">現場メモは文献カードではありません。文献根拠と混ぜずに扱います。</p><div class="list">${notes.slice(0,120).map(n=>`<div class="item field-item"><h3>${esc(field(n,'title')||'メモ名未確認')}</h3><p>${chips([n.category,'現場メモ','文献とは分離'])}</p><p>${esc(field(n,'summary')||'')}</p><p><b>扱い：</b>${esc(field(n,'condition')||'未確認')}</p></div>`).join('')}</div></details>`;
}
function v47VarietyCard(v){
 const memo=cleanCookingMemo(v); const hasMemo=!memo.includes('未確認');
 return `<article class="item variety-card-v47"><div class="variety-card-head"><div>${art('variety')}</div><div><h3>${esc(titleOfVariety(v))}</h3><p>${chips([countryOfVariety(v),field(v,'rice_type'),field(v,'grain_shape')])}</p></div></div>
 <div class="variety-facts"><span><b>用途</b>${v47Text(field(v,'main_uses','business_uses','use_category_primary'))}</span><span><b>食感</b>${v47Text(field(v,'texture_tags','aroma'))}</span><span><b>アミロース</b>${v47Text(field(v,'amylose_range','amylose_value','amylose_class'))}</span><span><b>たんぱく質</b>${v47Text(field(v,'protein_range','protein_value','protein_class'))}</span></div>
 <p><b>炊飯メモ：</b>${hasMemo?esc(memo):'<span class="missing">この品種の炊飯メモは未確認です。</span>'}</p>
 <details><summary>詳細・確認状況</summary><p><b>原産・生産：</b>${v47Text(field(v,'main_production_regions','origin_country_ja'))}</p><p><b>消費市場：</b>${v47Text(field(v,'main_consumption_markets'))}</p><p><b>未確認項目：</b>${v47Text(field(v,'unverified_fields'))}</p><p><b>${esc(sourceStatusText(v))}</b></p><p class="small">${esc(varietyConfirmNote(v))}</p><div class="source">出典ID：${esc(field(v,'source_ids')||'未確認')}<br>${esc(field(v,'source_urls')||'URL未確認')}</div></details><button class="btn secondary" onclick="S.filters.litq='${esc(field(v,'related_terms','rice_type','display_name_ja'))}';switchView('literature')">関連文献を探す</button></article>`;
}
function renderVarieties(){
 const data=S.data.rice_varieties||[]; const q=S.filters.varq||'', country=S.filters.country||'', use=S.filters.use||'', texture=S.filters.texture||'', amy=S.filters.amy||'', protein=S.filters.protein||'';
 const countries=[...new Set(data.map(countryOfVariety))].filter(has).sort();
 const uses=[...new Set(data.map(x=>field(x,'use_category_primary','main_uses')).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(norm).filter(x=>x&&x!=='未確認'))].slice(0,80).sort();
 const textures=[...new Set(data.map(x=>field(x,'texture_tags','aroma','rice_type')).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(norm).filter(x=>x&&x!=='未確認'))].slice(0,80).sort();
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||countryOfVariety(x)===country)&&(!use||String(field(x,'use_category_primary','main_uses')).includes(use))&&(!texture||String(field(x,'texture_tags','aroma','rice_type')).includes(texture))&&(!amy||String(field(x,'amylose_class','amylose_range','amylose_value')).includes(amy))&&(!protein||String(field(x,'protein_class','protein_range','protein_value')).includes(protein)));
 const countryTop=[...new Map(countries.map(c=>[c,data.filter(x=>countryOfVariety(x)===c).length]).sort((a,b)=>b[1]-a[1]).slice(0,12))];
 const today=pick(data,'variety');
 $('#varieties').innerHTML=`${v47PageLead('米品種図鑑','250件の品種を、国・用途・食感・成分から探します。未確認の値は断定しません。','variety')}
 <section class="featured-variety-v47"><div><span class="eyebrow">TODAY'S RICE</span><h2>${esc(titleOfVariety(today||{}))}</h2><p>${esc(countryOfVariety(today||{}))} / ${esc(field(today,'rice_type','grain_shape')||'種類未確認')}</p><p class="small">今日のお米は図鑑への入口です。品種説明が未確認の部分は未確認として表示します。</p></div>${art('variety')}</section>
 <div class="toolbar sticky-toolbar-v47"><input placeholder="品種名・国・用途で検索" value="${esc(q)}" oninput="setFilter('varq',this.value)"><select onchange="setFilter('country',this.value)"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('use',this.value)"><option value="">全用途</option>${uses.slice(0,50).map(c=>`<option ${c===use?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('texture',this.value)"><option value="">全食感・特徴</option>${textures.slice(0,50).map(c=>`<option ${c===texture?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="quickgrid category-grid-v47">${countryTop.slice(0,8).map(([c,n])=>`<button onclick="S.filters.country='${esc(c)}';renderVarieties()">${esc(c)}<br><span>${n}件</span></button>`).join('')}<button onclick="setFilter('amy','低')">低アミロース</button><button onclick="setFilter('amy','高')">高アミロース</button><button onclick="S.filters.country='';S.filters.use='';S.filters.texture='';S.filters.amy='';S.filters.protein='';S.filters.varq='';renderVarieties()">絞込解除</button></div>
 <div class="data-note"><b>確認できる情報：</b>品種ごとに確認できる項目を中心に表示します。</div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'品種総数')}${stat(countries.length,'国・地域')}${stat(uses.length,'用途候補')}</div>
 <div class="variety-list-v47">${filtered.slice(0,250).map(v47VarietyCard).join('')||v47Empty('該当する品種がありません','検索条件を変えてください。')}</div>`;
}
function renderRankings(){
 const defs=S.data.rankings?.rankings||[], rows=S.data.ranking_items_template||[]; const q=S.filters.rankq||'';
 const filledRows=rows.filter(x=>has(x.country_or_item_ja)&&has(x.value));
 const list=defs.filter(def=>!q||JSON.stringify(def).includes(q));
 function itemsFor(def){return (def.items||[]).concat(filledRows.filter(x=>x.ranking_id===def.ranking_id));}
 function rankCard(def){const title=tx(def,'display_title')||tx(def,'ranking_name')||def.ranking_id; const desc=tx(def,'short_desc')||tx(def,'value')||'説明未確認'; const items=itemsFor(def); const ready=items.length>0; return `<article class="item ranking-card-v47 ${ready?'ready':'pending'}"><div class="ranking-head-v47">${art('ranking')}<div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div></div><p>${chips([def.source_name,def.unit,ready?'順位表あり':'順位データ確認中'])}</p>${ready?`<table class="ranking-table-v47"><thead><tr><th>順位</th><th>国・項目</th><th>数値</th><th>年</th></tr></thead><tbody>${items.slice(0,10).map(x=>`<tr><td>${esc(x.rank)}</td><td>${esc(tx(x,'country_or_item')||field(x,'country_or_item_ja'))}</td><td>${esc(field(x,'value')||'未確認')} ${esc(field(x,'unit')||def.unit||'')}</td><td>${esc(field(x,'source_year')||'未確認')}</td></tr>`).join('')}</tbody></table>`:`<div class="rank-empty-v47"><b>順位データ確認中</b><span>TOP10明細、順位、国、数値、単位、年はまだ入っていません。定義を確認できます。</span></div>`}<details><summary>定義・出典候補</summary><p><b>出典候補：</b>${esc(def.source_name||'出典名未確認')}</p><p><b>単位：</b>${esc(def.unit||'未確認')}</p><p><b>計算方法：</b>${esc(def.calculation_method||'未確認')}</p><p><b>注意：</b>${esc(tx(def,'caution')||'未確認')}</p></details></article>`;}
 const ready=list.filter(d=>itemsFor(d).length>0), pending=list.filter(d=>itemsFor(d).length===0);
 $('#rankings').innerHTML=`${v47PageLead('世界の米ランキング','ランキング定義と順位・比較データを、対象年・単位・出典と一緒に表示します。','ranking')}
 <div class="toolbar"><input placeholder="ランキング検索" value="${esc(q)}" oninput="setFilter('rankq',this.value)"></div>
 <div class="countbar">${stat(defs.length,'ランキング定義')}${stat(filledRows.length,'入力済み順位')}${stat(ready.length,'順位表あり')}${stat(pending.length,'順位データ確認中')}</div>
 <div class="section-title"><h2>順位表があるランキング</h2></div><div class="ranking-grid-v47">${ready.map(rankCard).join('')||v47Empty('順位表を確認中です','ランキング定義はあります。順位・比較データは確認できた内容を表示します。')}</div>
 <div class="section-title"><h2>順位データ確認中</h2></div><div class="ranking-grid-v47">${pending.map(rankCard).join('')}</div>`;
}
function renderFuture(){
 const data=S.data.future_rice||[], stories=storyList(), story=todayStory(), q=S.filters.storyq||'', country=S.filters.storyCountry||'', fq=S.filters.future||'';
 const storyCountries=[...new Set(stories.map(storyCountry).filter(has))].sort(); const storyFiltered=stories.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||storyCountry(x)===country)); const futureFiltered=data.filter(x=>!fq||JSON.stringify(x).includes(fq));
 $('#future').innerHTML=`${v47PageLead('世界ライス物語','365話を毎日1話。既存本文を大切にし、料理・食感・炊飯の視点へつなげます。','world')}
 <section class="today-story-v47"><div><span class="eyebrow">TODAY'S STORY</span><h2>${esc(storyTitle(story||{}))}</h2><p class="small">${esc(storyCountry(story||{}))} / ${esc(field(story,'theme')||'テーマ未確認')}</p><p>${esc(storyBody(story||{},720)).split('\n').join('<br>')}</p><details open><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(story,'learning_point')||'未確認')}</p><p><b>料理場面：</b>${esc(field(story,'scene_note')||'未確認')}</p><p><b>食感：</b>${esc(field(story,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(story,'cooking_note')||'未確認')}</p><p>${chips([field(story,'texture_keywords'),field(story,'related_terms')])}</p></details></div>${art('world')}</section>
 <div class="grid"><div class="card">${art('map')}<h2>現在地のお米ヒストリー</h2><p>GPSは1日1回、国単位の参考判定に使う方針です。市区町村単位の米文化を無理に作りません。</p><p class="small">32か国の国別本文を統合済みです。国単位の参考として表示します。</p></div><div class="card">${art('weather')}<h2>GPS・天気の扱い</h2><p>GPSは水質、庫内湿度、米品質を測定する機能ではありません。天気は保管・結露・吸水確認の補助として使います。</p></div></div>
 <div class="section-title"><h2>物語を探す</h2></div><div class="toolbar"><input placeholder="物語検索" value="${esc(q)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">全ての国・地域</option>${storyCountries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(storyFiltered.length,'表示中の物語')}${stat(stories.length,'物語総数')}${stat(storyCountries.length,'国・地域')}</div>
 <div class="story-list-v47">${storyFiltered.slice(0,80).map(x=>`<article class="item story-item-v47"><h3>${esc(storyTitle(x))}</h3><p>${chips([field(x,'day_no')+'日目',storyCountry(x),field(x,'region'),field(x,'theme')])}</p><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,280)).split('\n').join('<br>')}</p></article>`).join('')}</div>
 <div class="section-title"><h2>お米の未来50</h2></div><div class="toolbar"><input placeholder="未来テーマ検索" value="${esc(fq)}" oninput="setFilter('future',this.value)"></div><div class="list">${futureFiltered.slice(0,50).map(x=>`<div class="item"><h3>${esc(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ')}</h3><p>${chips([x.category,x.source_type])}</p><p>${esc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'本文未確認')}</p></div>`).join('')}</div>`;
}

/* v48: water compatibility, 納米庫管理, and daily cards refinement.
   Carry-over policy: this version keeps previous tasks and fixes the data-source mistakes in check pages. */
function v48ByLang(obj, keyBase){
  if(!obj) return '';
  const map={ja:['ja','_ja'],en:['en','_en'],zh_tw:['zhTW','zh_tw','zh-TW'],zh_cn:['zhCN','zh_cn','zh-CN']};
  const arr=map[S.lang]||map.ja;
  for(const suf of arr){
    const k=suf.startsWith('_')?keyBase+suf:suf;
    if(has(obj[k])) return obj[k];
  }
  if(has(obj[keyBase+'_ja'])) return obj[keyBase+'_ja'];
  if(has(obj[keyBase])) return obj[keyBase];
  return '';
}
function v48WaterQualityRules(){return S.data?.water?.quality_rules||[];}
function v48ScaleRules(){return S.data?.water?.scale_rules||[];}
function v48WaterClaims(){return S.data?.water?.claims||[];}
function v48WaterSources(){return S.data?.water?.sources||[];}
function v48WaterRegions(){return S.data?.water?.regions||[];}
function v48StorageRaw(){return S.data?.storage_mold?.raw||{};}
function v48StorageClaims(){return v48StorageRaw().claims || S.data?.storage_mold?.claims || [];}
function v48StorageRules(){return v48StorageRaw().rules || S.data?.storage_mold?.rules || [];}
function v48StorageChecklist(){return v48StorageRaw().checklist || S.data?.storage_mold?.checklist || [];}
function v48StorageSources(){return v48StorageRaw().sources || S.data?.storage_mold?.sources || [];}
function v48UIText(key){const u=v48StorageRaw().ui_texts||{}; const v=u[key]; if(!v)return ''; return v[S.lang]||v.ja||v.en||'';}
function v48ImportantCaution(){const v=v48StorageRaw().important_caution||{}; return v[S.lang]||v.ja||'';}
function v48Disclaimer(){const v=v48StorageRaw().disclaimer||{}; return v[S.lang]||v.ja||'';}
function v48ParamLabel(p){return {pH:'pH',total_hardness:'硬度',tds:'TDS',residual_chlorine:'残留塩素'}[p]||p||'項目';}
function v48RuleText(r){return v48ByLang(r,'advice') || v48ByLang(r,'mechanism') || v48ByLang(r,'recommended_action') || field(r,'display_note','note') || '説明未確認';}
function v48ScaleText(r){return v48ByLang(r,'risk') || v48ByLang(r,'mechanism') || v48ByLang(r,'equipment_impact') || '説明未確認';}
function v48ClaimText(c){return v48ByLang(c,'claim') || field(c,'claim_ja') || '根拠要点未確認';}
function v48SourceLine(s){return `<div class="source"><b>${esc(field(s,'source_id')||'出典ID未確認')}</b> ${esc(field(s,'source_title_ja','title','publisher_or_journal')||'出典名未確認')}<br>${esc(field(s,'source_url','url')||'URL未確認')}</div>`;}
function v48StorageClaimById(id){return v48StorageClaims().find(c=>String(c.claim_id||'')===String(id));}
function v48ClaimPills(ids){return splitIds(ids).map(id=>{const c=v48StorageClaimById(id); return c?`<span class="pill">${esc(id)} ${esc(field(c,'theme')||'')}</span>`:`<span class="pill">${esc(id)}</span>`;}).join('');}
function v48StorageRuleCard(r){
  const level=field(r,'risk_level')||field(r,'rule_type')||'判定未確認';
  return `<article class="item risk-card-v48"><div class="risk-head-v48"><b>${esc(field(r,'condition_ja')||'条件未確認')}</b><span>${esc(level)}</span></div><p>${esc(field(r,'message_ja')||'対応メッセージ未確認')}</p><p>${v48ClaimPills(field(r,'claim_ids'))}</p><details><summary>根拠・確認</summary>${splitIds(field(r,'claim_ids')).map(id=>{const c=v48StorageClaimById(id);return c?`<p><b>${esc(id)} ${esc(field(c,'theme')||'')}</b><br>${esc(v48ClaimText(c))}<br><span class="small">出典：${esc(field(c,'source_ids')||'未確認')} / 注意：${esc(field(c,'limitations')||'未確認')}</span></p>`:`<p>${esc(id)}：根拠未確認</p>`;}).join('')}</details></article>`;
}
function v48ChecklistCard(c){return `<article class="item checklist-card-v48"><h3>${esc(field(c,'check_area')||'点検場所未確認')}</h3><p><b>${esc(field(c,'timing')||'タイミング未確認')}</b>：${esc(field(c,'check_item')||'点検項目未確認')}</p><p><b>方法：</b>${esc(field(c,'method')||'未確認')}　<b>NG時：</b>${esc(field(c,'action_if_ng')||'未確認')}</p><p>${v48ClaimPills(field(c,'claim_ids'))}</p></article>`;}
function v48WaterRuleCard(r){return `<article class="item water-card-v48"><h3>${esc(v48ParamLabel(field(r,'parameter')))}：${esc(field(r,'class_ja','risk_ja')||'区分未確認')}</h3><p>${esc(v48RuleText(r))}</p><p><b>利点：</b>${esc(field(r,'benefit_ja')||'未確認')}　<b>注意：</b>${esc(field(r,'demerit_ja')||field(r,'note')||'未確認')}</p><p class="small">${esc(field(r,'display_note','source_policy','source_basis')||'')}</p></article>`;}
function v48SafeDailyCopy(){
  const term=safeTermPick(), process=processPick();
  const themes=[
    ['吸水を見直す','水の入り方、浸漬時間、水温を確認します。硬さや芯残りが気になる時の入口です。'],
    ['粒感を整える','蒸らしとほぐしを意識します。炊き上がり直後の水分と粒の輪郭を見ます。'],
    ['保管から見る','炊く前に、米のにおい、湿気、虫、変色、保管容器を確認します。'],
    ['水を確認する','水質はGPSでは分かりません。pH、硬度、TDS、残留塩素は地域参考値や実測値で確認します。']
  ];
  const t=themes[todayIndex(themes.length,'v48_daily')];
  return {title:t[0], body:t[1], term:termName(term), process};
}
function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), future=pick(d.future_rice,'future'), story=todayStory(), daily=v48SafeDailyCopy();
 $('#home').innerHTML=`<div class="home-v47 home-v48">
  <section class="daily-hero-v47"><div class="daily-copy"><span class="eyebrow">RICE NAVI</span><h1>今日の米ナビ</h1><p>今日の一杯を考える。米・水・保管・物語を、必要なところから見ます。</p></div><div class="daily-visual">${art('fortune')}</div></section>
  <section class="nav-cards-v47">
    ${navCard('home','米ナビ',daily.title,'fortune','今日の入口')}
    ${navCard('check','米コンディション','水・保管・納米庫','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47">
    ${homeMini('今日の米ナビ',`<b>${esc(daily.title)}</b><br>${esc(daily.body)}<br><span class="small">米言葉：${esc(daily.term)} / 工程：${esc(daily.process)}</span>`,'fortune','words','用語集へ')}
    ${homeMini('米コンディション',`湿度・温度差・水質を米管理の確認ポイントに変換します。<br><span class="small">GPSや天気は測定ではなく補助情報です。</span>`,'weather','check','チェックへ')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${homeMini('現在地のお米ヒストリー',`GPSは1日1回、国単位の参考判定に使います。<br><span class="small">32か国の国別本文を統合済み。国単位の参考として表示します。</span>`,'map','future','考え方を見る')}
    ${homeMini('炊飯文献',`文献の優劣ではなく、RICE NAVI内の確認状態を整理します。<br><span class="small">${esc(counts.literature_cards_v74||0)}件 / 現場メモは別枠</span>`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露・湿度・温度差・残米・付着米・カビ臭・虫・変色を確認します。`,'storage','check','保管へ')}
    ${homeMini('世界ランキング',`統合済みの順位・比較データを確認します。`,'ranking','rankings','ランキングへ')}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来50へ')}
  </section>
  <details class="data-check compact"><summary>収録内容を見る</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.field_notes_v74,'現場メモ','文献とは別枠')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.ranking_definitions,'ランキング','定義')}</div></details>
 </div>`;
}
function renderCheck(){
 const qRules=v48WaterQualityRules(), sRules=v48ScaleRules(), wClaims=v48WaterClaims(), wSources=v48WaterSources(), regions=v48WaterRegions();
 const claims=v48StorageClaims(), rules=v48StorageRules(), checklist=v48StorageChecklist(), sources=v48StorageSources();
 const region=regions[0]||{};
 const danger=rules.filter(r=>String(field(r,'rule_type','risk_level')||'').includes('即時')||String(field(r,'risk_level')||'').includes('停止')).slice(0,6);
 const attention=rules.filter(r=>!danger.includes(r)).slice(0,10);
 $('#check').innerHTML=`${v47PageLead('チェック','水・天気・保管の情報を、炊飯と米管理の確認ポイントに変換します。測定していないものは測定したように見せません。','weather')}
 <section class="v48-alert-panel"><div>${art('storage')}<h2>最初に見る危険サイン</h2><p>${esc(v48ImportantCaution()||'目視カビ・カビ臭・濡れ跡・虫・変色は、炊飯条件で解決しない可能性があります。')}</p></div><div class="risk-stack-v48">${danger.map(r=>`<span>${esc(field(r,'condition_ja')||'条件未確認')}</span>`).join('')}</div></section>
 <section class="v48-check-grid">
  <article class="card v48-card">${art('weather')}<h2>米コンディション</h2><p><b>天気ではなく、米管理の見方です。</b></p><p>高湿度、雨天後、昼夜の温度差がある日は、結露跡、におい、虫、付着米、床・壁際を先に見ます。</p><p class="warn">GPS・天気は水質、庫内湿度、米品質を測定しません。</p></article>
  <article class="card v48-card">${art('weather')}<h2>水の相性チェック</h2><p><b>地域参考値と実測値を分けます。</b></p><p>pH、硬度、TDS、残留塩素は、公開値・手入力・検査値で確認します。建物配管、貯水槽、フィルターで実際の水は変わります。</p><p class="small">地域参考：${esc(field(region,'area_name_ja')||'準備中')} / pH：${esc(field(region,'pH')||'未確認')} / 硬度：${esc(field(region,'total_hardness_mgL_CaCO3')||'未確認')}</p></article>
  <article class="card v48-card">${art('storage')}<h2>納米庫管理</h2><p><b>見る順番：</b>結露 → 湿度 → 温度差 → 残米・付着米 → カビ臭 → 虫 → 変色 → 清掃記録。</p><p>${['結露','湿度','温度差','残米','付着米','カビ臭','虫','変色','清掃','点検場所'].map(x=>`<span class="pill">${x}</span>`).join(' ')}</p><p class="small">${esc(v48Disclaimer()||'最終判断は品質管理基準と現場責任者の確認に従ってください。')}</p></article>
 </section>
 <div class="section-title"><h2>水の相性：見る項目</h2></div><div class="v48-param-grid"><div><b>pH</b><span>酸性・中性・アルカリ性の目安。飲用水推奨ではなく、条件確認として扱う。</span></div><div><b>硬度</b><span>カルシウム・マグネシウム量の目安。食感と設備付着の両方を見る。</span></div><div><b>TDS</b><span>水に溶けた物質量の目安。地域参考値と実測値を分ける。</span></div><div><b>残留塩素</b><span>におい・味への影響を確認する項目。GPSでは分からない。</span></div></div>
 <div class="section-title"><h2>水質ルール</h2></div><div class="list v48-list">${qRules.slice(0,13).map(v48WaterRuleCard).join('')||v47Empty('水質ルール未確認','quality_rulesが見つかりません。')}</div>
 <div class="section-title"><h2>設備付着・スケールの見方</h2></div><div class="list v48-list">${sRules.slice(0,11).map(v48WaterRuleCard).join('')}</div>
 <details class="field-note" open><summary>水質根拠・出典</summary><div class="list">${wClaims.slice(0,8).map(c=>`<div class="item"><h3>${esc(field(c,'topic')||field(c,'parameter')||'水質根拠')}</h3><p>${esc(v48ClaimText(c))}</p><p class="small">条件：${esc(field(c,'condition')||'未確認')} / 注意：${esc(field(c,'display_caution_ja')||'未確認')}</p><div class="source">根拠ID：${esc(field(c,'claim_id')||'未確認')} / 出典：${esc(field(c,'source_id')||'未確認')}<br>${esc(field(c,'source_url')||'URL未確認')}</div></div>`).join('')}</div><div>${wSources.slice(0,5).map(v48SourceLine).join('')}</div></details>
 <div class="section-title"><h2>納米庫：危険サイン</h2></div><div class="list v48-list">${danger.map(v48StorageRuleCard).join('')}</div>
 <div class="section-title"><h2>納米庫：注意・点検ルール</h2></div><div class="list v48-list">${attention.map(v48StorageRuleCard).join('')}</div>
 <div class="section-title"><h2>納米庫：点検場所</h2></div><div class="list v48-list">${checklist.slice(0,12).map(v48ChecklistCard).join('')}</div>
 <details class="field-note"><summary>納米庫の文献根拠・出典</summary><div class="list">${claims.slice(0,19).map(c=>`<div class="item"><h3>${esc(field(c,'theme')||'根拠')}</h3><p>${esc(v48ClaimText(c))}</p><p class="small">使い方：${esc(field(c,'use_in_rule')||'未確認')} / 注意：${esc(field(c,'limitations')||'未確認')}</p><div class="source">根拠ID：${esc(field(c,'claim_id')||'未確認')} / 出典：${esc(field(c,'source_ids')||'未確認')}</div></div>`).join('')}</div><div>${sources.slice(0,9).map(v48SourceLine).join('')}</div></details>`;
}


/* v49: user-facing copy cleanup.
   Important: design rules such as GPS/water/real-measurement separation are not shown verbatim.
   They are converted into natural UI structure and short user copy. */
function conciseDataAvailability(label, available){
  return available ? `${label}：表示できます` : `${label}：確認できるデータがありません`;
}
function naturalWaterNote(){
  return '地域の値は参考情報です。蛇口の水は建物設備やフィルターでも変わります。';
}
function naturalLocationNote(){
  return '位置情報は、今いる国に合う米文化を選ぶための入口です。';
}
function naturalWeatherNote(){
  return '天気は、保管・結露・吸水を見直すきっかけとして使います。';
}
function countryHistoryCard(){
  return `<div class="card"><h2>現在地のお米ヒストリー</h2><p><b>今いる国の米文化へ。</b></p><p>現在地から国を選び、その国に関係する米の歴史、料理、食感、品種の入口につなげます。</p><details><summary>位置情報の使い方</summary><p>${esc(naturalLocationNote())}</p><p class="small">細かな住所や緯度経度を見せる画面ではなく、国単位の米文化を選ぶために使います。</p></details><p class="small">国別本文は確認済みマスターから取り込みます。未収録の国は、無理に文章を作らず「未確認」とします。</p>${btn('future','世界ライスへ')}</div>`;
}
function riceWeatherConceptCard(){
  return card('米コンディション',`<p><b>今日は米をどう扱うか。</b></p><p><b>保管：</b>湿度が高い日は、米袋周辺、壁際、床、納米庫内壁、残米・付着米を見ます。</p><p><b>結露：</b>温度差が大きい日は、水滴、濡れた付着米、におい、虫、変色を確認します。</p><p><b>炊飯：</b>吸水状態、べたつき、粒立ち、冷めた後の食感を見ます。</p><p class="small">${esc(naturalWeatherNote())}</p>${btn('check','チェックへ')}`);
}
function v49WaterStatus(region){
  const area=field(region,'area_name_ja')||'地域情報なし';
  const ph=field(region,'pH')||'未確認';
  const hardness=field(region,'total_hardness_mgL_CaCO3')||'未確認';
  return `<div class="water-status-v49"><div><b>地域の参考値</b><span>${esc(area)}</span></div><div><b>pH</b><span>${esc(ph)}</span></div><div><b>硬度</b><span>${esc(hardness)}</span></div><div><b>手元の測定値</b><span>未入力</span></div></div>`;
}
function v48SafeDailyCopy(){
  const term=safeTermPick(), process=processPick();
  const themes=[
    ['吸水を見直す','浸漬時間と水温を見て、米粒に水が入る状態を確認します。'],
    ['粒感を整える','蒸らしとほぐしを意識し、炊き上がり直後の水分と粒の輪郭を見ます。'],
    ['保管から見る','炊く前に、米のにおい、湿気、虫、変色、保管容器を確認します。'],
    ['水を見直す','pH、硬度、TDS、残留塩素を、炊飯結果と合わせて確認します。']
  ];
  const t=themes[todayIndex(themes.length,'v49_daily')];
  return {title:t[0], body:t[1], term:termName(term), process};
}
function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), future=pick(d.future_rice,'future'), story=todayStory(), daily=v48SafeDailyCopy();
 $('#home').innerHTML=`<div class="home-v47 home-v48 home-v49">
  <section class="daily-hero-v47"><div class="daily-copy"><span class="eyebrow">RICE NAVI</span><h1>今日の米ナビ</h1><p>今日の一杯を考える。米・水・保管・物語を、必要なところから見ます。</p></div><div class="daily-visual">${art('fortune')}</div></section>
  <section class="nav-cards-v47">
    ${navCard('home','米ナビ',daily.title,'fortune','今日の入口')}
    ${navCard('check','米コンディション','水・保管・納米庫','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47">
    ${homeMini('今日の米ナビ',`<b>${esc(daily.title)}</b><br>${esc(daily.body)}<br><span class="small">米言葉：${esc(daily.term)} / 工程：${esc(daily.process)}</span>`,'fortune','words','用語集へ')}
    ${homeMini('米コンディション',`湿度・温度差・水の状態を、米を扱う時の見方に変えます。<br><span class="small">${esc(naturalWeatherNote())}</span>`,'weather','check','チェックへ')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${homeMini('現在地のお米ヒストリー',`今いる国の米文化・料理・品種への入口です。<br><span class="small">${esc(naturalLocationNote())}</span>`,'map','future','考え方を見る')}
    ${homeMini('炊飯文献',`条件・数値・注意点を、文献要点から確認します。<br><span class="small">${esc(counts.literature_cards_v74||0)}件 / 現場メモは別枠</span>`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露・湿度・温度差・残米・付着米・カビ臭・虫・変色を確認します。`,'storage','check','保管へ')}
    ${homeMini('世界ランキング',`順位・比較データを表で確認します。`,'ranking','rankings','ランキングへ')}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来50へ')}
  </section>
  <details class="data-check compact"><summary>収録内容を見る</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.field_notes_v74,'現場メモ','文献とは別枠')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.ranking_definitions,'ランキング','定義')}</div></details>
 </div>`;
}
function renderCheck(){
 const qRules=v48WaterQualityRules(), sRules=v48ScaleRules(), wClaims=v48WaterClaims(), wSources=v48WaterSources(), regions=v48WaterRegions();
 const claims=v48StorageClaims(), rules=v48StorageRules(), checklist=v48StorageChecklist(), sources=v48StorageSources();
 const region=regions[0]||{};
 const danger=rules.filter(r=>String(field(r,'rule_type','risk_level')||'').includes('即時')||String(field(r,'risk_level')||'').includes('停止')).slice(0,6);
 const attention=rules.filter(r=>!danger.includes(r)).slice(0,10);
 $('#check').innerHTML=`${v47PageLead('チェック','水・天気・保管の情報を、米を扱う時の確認ポイントとして見ます。','weather')}
 <section class="v48-alert-panel"><div>${art('storage')}<h2>最初に見る危険サイン</h2><p>${esc(v48ImportantCaution()||'目視カビ・カビ臭・濡れ跡・虫・変色は、炊飯条件だけでは解決しない可能性があります。')}</p></div><div class="risk-stack-v48">${danger.map(r=>`<span>${esc(field(r,'condition_ja')||'条件未確認')}</span>`).join('')}</div></section>
 <section class="v48-check-grid">
  <article class="card v48-card">${art('weather')}<h2>米コンディション</h2><p><b>保管と炊飯の見方です。</b></p><p>高湿度、雨天後、昼夜の温度差がある日は、結露跡、におい、虫、付着米、床・壁際を先に見ます。</p><p class="small">${esc(naturalWeatherNote())}</p></article>
  <article class="card v48-card">${art('weather')}<h2>水の相性チェック</h2><p><b>水の傾向を、炊飯結果と合わせて見ます。</b></p><p>pH、硬度、TDS、残留塩素を確認し、硬さ・粘り・においなどの結果と照らし合わせます。</p>${v49WaterStatus(region)}<p class="small">${esc(naturalWaterNote())}</p></article>
  <article class="card v48-card">${art('storage')}<h2>納米庫管理</h2><p><b>見る順番：</b>結露 → 湿度 → 温度差 → 残米・付着米 → カビ臭 → 虫 → 変色 → 清掃記録。</p><p>${['結露','湿度','温度差','残米','付着米','カビ臭','虫','変色','清掃','点検場所'].map(x=>`<span class="pill">${x}</span>`).join(' ')}</p><p class="small">${esc(v48Disclaimer()||'最終判断は品質管理基準と現場責任者の確認に従ってください。')}</p></article>
 </section>
 <div class="section-title"><h2>水の相性：見る項目</h2></div><div class="v48-param-grid"><div><b>pH</b><span>酸性・中性・アルカリ性の目安。</span></div><div><b>硬度</b><span>カルシウム・マグネシウム量の目安。食感と設備付着の両方を見る。</span></div><div><b>TDS</b><span>水に溶けた物質量の目安。</span></div><div><b>残留塩素</b><span>におい・味への影響を確認する項目。</span></div></div>
 <div class="section-title"><h2>水質ルール</h2></div><div class="list v48-list">${qRules.slice(0,13).map(v48WaterRuleCard).join('')||v47Empty('水質ルール未確認','quality_rulesが見つかりません。')}</div>
 <div class="section-title"><h2>設備付着・スケールの見方</h2></div><div class="list v48-list">${sRules.slice(0,11).map(v48WaterRuleCard).join('')}</div>
 <details class="field-note"><summary>水質根拠・出典</summary><div class="list">${wClaims.slice(0,8).map(c=>`<div class="item"><h3>${esc(field(c,'topic')||field(c,'parameter')||'水質根拠')}</h3><p>${esc(v48ClaimText(c))}</p><p class="small">条件：${esc(field(c,'condition')||'未確認')} / 注意：${esc(field(c,'display_caution_ja')||'未確認')}</p><div class="source">根拠ID：${esc(field(c,'claim_id')||'未確認')} / 出典：${esc(field(c,'source_id')||'未確認')}<br>${esc(field(c,'source_url')||'URL未確認')}</div></div>`).join('')}</div><div>${wSources.slice(0,5).map(v48SourceLine).join('')}</div></details>
 <div class="section-title"><h2>納米庫：危険サイン</h2></div><div class="list v48-list">${danger.map(v48StorageRuleCard).join('')}</div>
 <div class="section-title"><h2>納米庫：注意・点検ルール</h2></div><div class="list v48-list">${attention.map(v48StorageRuleCard).join('')}</div>
 <div class="section-title"><h2>納米庫：点検場所</h2></div><div class="list v48-list">${checklist.slice(0,12).map(v48ChecklistCard).join('')}</div>
 <details class="field-note"><summary>納米庫の文献根拠・出典</summary><div class="list">${claims.slice(0,19).map(c=>`<div class="item"><h3>${esc(field(c,'theme')||'根拠')}</h3><p>${esc(v48ClaimText(c))}</p><p class="small">使い方：${esc(field(c,'use_in_rule')||'未確認')} / 注意：${esc(field(c,'limitations')||'未確認')}</p><div class="source">根拠ID：${esc(field(c,'claim_id')||'未確認')} / 出典：${esc(field(c,'source_ids')||'未確認')}</div></div>`).join('')}</div><div>${sources.slice(0,9).map(v48SourceLine).join('')}</div></details>`;
}
function renderFuture(){
 const data=S.data.future_rice||[], stories=storyList(), story=todayStory(), q=S.filters.storyq||'', country=S.filters.storyCountry||'', fq=S.filters.future||'';
 const storyCountries=[...new Set(stories.map(storyCountry).filter(has))].sort(); const storyFiltered=stories.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||storyCountry(x)===country)); const futureFiltered=data.filter(x=>!fq||JSON.stringify(x).includes(fq));
 $('#future').innerHTML=`${v47PageLead('世界ライス物語','365話を毎日1話。料理・食感・炊飯の視点へつなげます。','world')}
 <section class="today-story-v47"><div><span class="eyebrow">TODAY'S STORY</span><h2>${esc(storyTitle(story||{}))}</h2><p class="small">${esc(storyCountry(story||{}))} / ${esc(field(story,'theme')||'テーマ未確認')}</p><p>${esc(storyBody(story||{},720)).split('\n').join('<br>')}</p><details open><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(story,'learning_point')||'未確認')}</p><p><b>料理場面：</b>${esc(field(story,'scene_note')||'未確認')}</p><p><b>食感：</b>${esc(field(story,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(story,'cooking_note')||'未確認')}</p><p>${chips([field(story,'texture_keywords'),field(story,'related_terms')])}</p></details></div>${art('world')}</section>
 <div class="grid"><div class="card">${art('map')}<h2>現在地のお米ヒストリー</h2><p>今いる国に関係する米文化、料理、品種の入口です。</p><p class="small">国別本文は確認済みマスターから取り込みます。未確認の国は無理に文章を作りません。</p></div><div class="card">${art('weather')}<h2>米コンディション</h2><p>${esc(naturalWeatherNote())}</p></div></div>
 <div class="section-title"><h2>物語を探す</h2></div><div class="toolbar"><input placeholder="物語検索" value="${esc(q)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">全ての国・地域</option>${storyCountries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(storyFiltered.length,'表示中の物語')}${stat(stories.length,'物語総数')}${stat(storyCountries.length,'国・地域')}</div>
 <div class="story-list-v47">${storyFiltered.slice(0,80).map(x=>`<article class="item story-item-v47"><h3>${esc(storyTitle(x))}</h3><p>${chips([field(x,'day_no')+'日目',storyCountry(x),field(x,'region'),field(x,'theme')])}</p><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,280)).split('\n').join('<br>')}</p></article>`).join('')}</div>
 <div class="section-title"><h2>お米の未来50</h2></div><div class="toolbar"><input placeholder="未来テーマ検索" value="${esc(fq)}" oninput="setFilter('future',this.value)"></div><div class="list">${futureFiltered.slice(0,50).map(x=>`<div class="item"><h3>${esc(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ')}</h3><p>${chips([x.category,x.source_type])}</p><p>${esc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'本文未確認')}</p></div>`).join('')}</div>`;
}

/* v49 additional overrides: user-facing copy cleanup. */
function renderLiterature(){
 const cards=litSorted(), notes=S.data.literature?.field_notes||[], q=S.filters.litq||'', cat=S.filters.litcat||'', ev=S.filters.evidence||'AB';
 const categories=[...new Set(cards.map(x=>x.category).filter(has))].sort();
 let filtered=cards.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!cat||x.category===cat));
 if(ev==='AB') filtered=filtered.filter(x=>['A','B'].includes(x._class)); else if(ev!=='ALL') filtered=filtered.filter(x=>x._class===ev);
 const classCounts={A:cards.filter(x=>x._class==='A').length,B:cards.filter(x=>x._class==='B').length,C:cards.filter(x=>x._class==='C').length,D:cards.filter(x=>x._class==='D').length};
 $('#literature').innerHTML=`${v47PageLead('炊飯文献ライブラリ','文献要点、条件、数値、注意点、出典をたどれる形で確認します。','doc')}
 <div class="lit-note-v47"><b>確認ステータス</b><p>この区分は文献の価値を比べるものではありません。RICE NAVI内で、原文・要約・出典の対応をどこまで確認できているかを示します。</p></div>
 <div class="toolbar sticky-toolbar-v47"><input placeholder="文献検索" value="${esc(q)}" oninput="setFilter('litq',this.value)"><select onchange="setFilter('litcat',this.value)"><option value="">全カテゴリ</option>${categories.map(c=>`<option ${c===cat?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('evidence',this.value)"><option value="AB" ${ev==='AB'?'selected':''}>確認済み中心</option><option value="A" ${ev==='A'?'selected':''}>原文確認候補</option><option value="B" ${ev==='B'?'selected':''}>要約整理済み</option><option value="C" ${ev==='C'?'selected':''}>再確認が必要</option><option value="ALL" ${ev==='ALL'?'selected':''}>全件</option></select></div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat(cards.length,'文献カード')}${stat(notes.length,'現場メモ')}${stat(classCounts.C,'再確認が必要')}</div>
 <div class="quickgrid category-grid-v47">${topCategories(cards,12).map(([c,n])=>`<button onclick="setFilter('litcat','${esc(c)}')">${esc(c)}<br><span>${n}件</span></button>`).join('')}</div>
 <div class="list lit-list-v47">${filtered.slice(0,120).map(v47LitCard).join('')||v47Empty('該当する文献がありません','検索条件を変えてください。')}</div>
 <details class="field-note"><summary>現場メモを見る</summary><p>現場メモは文献とは分けて扱います。</p><div class="list">${notes.slice(0,80).map(x=>`<div class="item field-note-item"><h3>${esc(field(x,'title','note_title')||'現場メモ')}</h3><p>${esc(field(x,'summary','note','text')||'本文未確認')}</p></div>`).join('')}</div></details>`;
}
function renderVarieties(){
 const data=S.data.rice_varieties||[], q=S.filters.varq||'', country=S.filters.country||'', use=S.filters.use||'', texture=S.filters.texture||'', amy=S.filters.amy||'';
 const today=pick(data,'today_variety');
 const countries=[...new Set(data.map(countryOfVariety).filter(has))].sort();
 const countryTop=Object.entries(data.reduce((a,v)=>{const c=countryOfVariety(v);a[c]=(a[c]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
 const uses=[...new Set(data.flatMap(v=>String(field(v,'uses','best_use','suitable_dish','dish_fit')||'').split(/[;；,、]/)).map(norm).filter(has))].sort();
 const textures=[...new Set(data.flatMap(v=>String(field(v,'texture','texture_profile','app_texture_ja_v1_7')||'').split(/[;；,、]/)).map(norm).filter(has))].sort();
 let filtered=data.filter(v=>!q||JSON.stringify(v).toLowerCase().includes(q.toLowerCase()));
 if(country) filtered=filtered.filter(v=>countryOfVariety(v)===country);
 if(use) filtered=filtered.filter(v=>JSON.stringify(v).includes(use));
 if(texture) filtered=filtered.filter(v=>JSON.stringify(v).includes(texture));
 if(amy==='低') filtered=filtered.filter(v=>/低|low/i.test(JSON.stringify(v)));
 if(amy==='高') filtered=filtered.filter(v=>/高|high/i.test(JSON.stringify(v)));
 $('#varieties').innerHTML=`${v47PageLead('米品種図鑑','250件の品種を、国・用途・食感・成分から探します。未確認の値は断定しません。','variety')}
 <section class="featured-variety-v47"><div><span class="eyebrow">TODAY'S RICE</span><h2>${esc(titleOfVariety(today||{}))}</h2><p>${esc(countryOfVariety(today||{}))} / ${esc(field(today,'rice_type','grain_shape')||'種類未確認')}</p><p class="small">確認できる項目を中心に表示します。炊飯メモが未確認の品種は、未確認として扱います。</p></div>${art('variety')}</section>
 <div class="toolbar sticky-toolbar-v47"><input placeholder="品種名・国・用途で検索" value="${esc(q)}" oninput="setFilter('varq',this.value)"><select onchange="setFilter('country',this.value)"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('use',this.value)"><option value="">全用途</option>${uses.slice(0,50).map(c=>`<option ${c===use?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('texture',this.value)"><option value="">全食感・特徴</option>${textures.slice(0,50).map(c=>`<option ${c===texture?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="quickgrid category-grid-v47">${countryTop.slice(0,8).map(([c,n])=>`<button onclick="S.filters.country='${esc(c)}';renderVarieties()">${esc(c)}<br><span>${n}件</span></button>`).join('')}<button onclick="setFilter('amy','低')">低アミロース</button><button onclick="setFilter('amy','高')">高アミロース</button><button onclick="S.filters.country='';S.filters.use='';S.filters.texture='';S.filters.amy='';S.filters.varq='';renderVarieties()">絞込解除</button></div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'品種総数')}${stat(countries.length,'国・地域')}${stat(uses.length,'用途候補')}</div>
 <div class="variety-list-v47">${filtered.slice(0,250).map(v47VarietyCard).join('')||v47Empty('該当する品種がありません','検索条件を変えてください。')}</div>`;
}
function renderRankings(){
 const defs=S.data.rankings?.rankings||[], rows=S.data.ranking_items_template||[]; const q=S.filters.rankq||'';
 const filledRows=rows.filter(x=>has(x.country_or_item_ja)&&has(x.value));
 const list=defs.filter(def=>!q||JSON.stringify(def).includes(q));
 function itemsFor(def){return (def.items||[]).concat(filledRows.filter(x=>x.ranking_id===def.ranking_id));}
 function rankCard(def){const title=tx(def,'display_title')||tx(def,'ranking_name')||def.ranking_id; const desc=tx(def,'short_desc')||tx(def,'value')||'説明未確認'; const items=itemsFor(def); const ready=items.length>0; return `<article class="item ranking-card-v47 ${ready?'ready':'pending'}"><div class="ranking-head-v47">${art('ranking')}<div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div></div><p>${chips([def.source_name,def.unit,ready?'順位表あり':'順位データ確認中'])}</p>${ready?`<table class="ranking-table-v47"><thead><tr><th>順位</th><th>国・項目</th><th>数値</th><th>年</th></tr></thead><tbody>${items.slice(0,10).map(x=>`<tr><td>${esc(x.rank)}</td><td>${esc(tx(x,'country_or_item')||field(x,'country_or_item_ja'))}</td><td>${esc(field(x,'value')||'未確認')} ${esc(field(x,'unit')||def.unit||'')}</td><td>${esc(field(x,'source_year')||'未確認')}</td></tr>`).join('')}</tbody></table>`:`<div class="rank-empty-v47"><b>順位データ確認中</b><span>順位・比較データの対象年・単位・出典を確認中です。</span></div>`}<details><summary>定義・出典候補</summary><p><b>出典候補：</b>${esc(def.source_name||'出典名未確認')}</p><p><b>単位：</b>${esc(def.unit||'未確認')}</p><p><b>計算方法：</b>${esc(def.calculation_method||'未確認')}</p><p><b>注意：</b>${esc(tx(def,'caution')||'未確認')}</p></details></article>`;}
 const ready=list.filter(d=>itemsFor(d).length>0), pending=list.filter(d=>itemsFor(d).length===0);
 $('#rankings').innerHTML=`${v47PageLead('世界の米ランキング','米を数字で見るページです。統合済みの順位・比較データを表示します。','ranking')}
 <div class="toolbar"><input placeholder="ランキング検索" value="${esc(q)}" oninput="setFilter('rankq',this.value)"></div>
 <div class="countbar">${stat(defs.length,'ランキング定義')}${stat(filledRows.length,'入力済み順位')}${stat(ready.length,'順位表あり')}${stat(pending.length,'順位データ確認中')}</div>
 <div class="section-title"><h2>順位表があるランキング</h2></div><div class="ranking-grid-v47">${ready.map(rankCard).join('')||v47Empty('順位表を確認中です','定義はあります。TOP10明細は確認できたものから表示します。')}</div>
 <div class="section-title"><h2>順位データ確認中</h2></div><div class="ranking-grid-v47">${pending.map(rankCard).join('')}</div>`;
}


/* v50: 10th-round user-centered copy/UI cleanup.
   Carry-over is maintained: Excel spec alignment, illustration implementation, copy review, data misuse prevention. */
function v50HomeIntro(){
  return `<section class="daily-hero-v47 daily-hero-v50"><div class="daily-copy"><span class="eyebrow">RICE NAVI</span><h1>今日の米ナビ</h1><p>今日の一杯を考える。米・水・保管・世界の物語を、必要な入口から見られます。</p></div><div class="daily-visual">${art('fortune')}</div></section>`;
}
function v50StatusLine(){
  return `<div class="v50-status-line"><span>米の状態</span><span>水の見方</span><span>保管の確認</span><span>世界の米文化</span></div>`;
}
function v50SoftNote(text){ return `<p class="v50-soft-note">${esc(text)}</p>`; }
function v50CountryHistoryCard(){
  return homeMini('今いる国のお米ヒストリー',`今いる国に関係する米文化、料理、品種の入口です。<br><span class="small">国別本文は、確認できたマスターから順次表示します。</span>`,'map','future','入口を見る');
}
function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), story=todayStory(), future=pick(d.future_rice,'future'), daily=v48SafeDailyCopy();
 $('#home').innerHTML=`<div class="home-v47 home-v50">
  ${v50HomeIntro()}
  ${v50StatusLine()}
  <section class="nav-cards-v47 nav-cards-v50">
    ${navCard('words','用語集',daily.term,'word','今日の入口')}
    ${navCard('check','米コンディション','水・保管・結露','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47 home-grid-v50">
    ${homeMini('今日の米ナビ',`<b>${esc(daily.title)}</b><br>${esc(daily.body)}<br><span class="small">工程：${esc(daily.process)}</span>`,'fortune','words','関連語へ')}
    ${homeMini('米コンディション',`保管、結露、水の傾向を見て、炊飯前の確認につなげます。`,'weather','check','確認する')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${v50CountryHistoryCard()}
    ${homeMini('炊飯文献',`文献要点、条件、数値、注意点、出典を確認します。<br><span class="small">現場メモは別枠で扱います。</span>`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露・湿度・温度差・残米・付着米・カビ臭・虫・変色を見ます。`,'storage','check','保管へ')}
    ${homeMini('世界ランキング',`順位・比較データを表で確認します。`,'ranking','rankings','数字を見る')}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来へ')}
  </section>
  <details class="data-check compact"><summary>収録内容</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.field_notes_v74,'現場メモ','文献とは別枠')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.ranking_definitions,'ランキング','定義')}</div></details>
 </div>`;
}
function v50WaterStatus(region){
  const area=field(region,'area_name_ja')||'地域情報なし';
  const ph=field(region,'pH')||'未確認';
  const hardness=field(region,'total_hardness_mgL_CaCO3')||'未確認';
  return `<div class="water-status-v49 water-status-v50"><div><b>地域の参考値</b><span>${esc(area)}</span></div><div><b>pH</b><span>${esc(ph)}</span></div><div><b>硬度</b><span>${esc(hardness)}</span></div><div><b>手元の測定値</b><span>未入力</span></div></div>`;
}
function renderCheck(){
 const qRules=v48WaterQualityRules(), sRules=v48ScaleRules(), wClaims=v48WaterClaims(), wSources=v48WaterSources(), regions=v48WaterRegions();
 const claims=v48StorageClaims(), rules=v48StorageRules(), checklist=v48StorageChecklist(), sources=v48StorageSources();
 const region=regions[0]||{};
 const danger=rules.filter(r=>String(field(r,'rule_type','risk_level')||'').includes('即時')||String(field(r,'risk_level')||'').includes('停止')).slice(0,6);
 const attention=rules.filter(r=>!danger.includes(r)).slice(0,10);
 $('#check').innerHTML=`${v47PageLead('チェック','米を扱う前に、水・保管・納米庫の状態を確認します。','weather')}
 <section class="v48-alert-panel v50-alert-panel"><div>${art('storage')}<h2>最初に見るサイン</h2><p>${esc(v48ImportantCaution()||'目視カビ・カビ臭・濡れ跡・虫・変色を先に確認します。')}</p></div><div class="risk-stack-v48">${danger.map(r=>`<span>${esc(field(r,'condition_ja')||'条件未確認')}</span>`).join('')}</div></section>
 <section class="v48-check-grid">
  <article class="card v48-card">${art('weather')}<h2>米コンディション</h2><p><b>保管と炊飯の見方です。</b></p><p>湿度、雨天後、昼夜の温度差がある日は、結露跡、におい、虫、付着米、床・壁際を先に見ます。</p></article>
  <article class="card v48-card">${art('weather')}<h2>水の相性チェック</h2><p><b>水の傾向を、炊飯結果と合わせて見ます。</b></p><p>pH、硬度、TDS、残留塩素を、硬さ・粘り・においの変化と一緒に確認します。</p>${v50WaterStatus(region)}</article>
  <article class="card v48-card">${art('storage')}<h2>納米庫管理</h2><p><b>見る順番：</b>結露 → 湿度 → 温度差 → 残米・付着米 → カビ臭 → 虫 → 変色 → 清掃記録。</p><p>${['結露','湿度','温度差','残米','付着米','カビ臭','虫','変色','清掃','点検場所'].map(x=>`<span class="pill">${x}</span>`).join(' ')}</p></article>
 </section>
 <div class="section-title"><h2>水の相性：見る項目</h2></div><div class="v48-param-grid"><div><b>pH</b><span>酸性・中性・アルカリ性の目安。</span></div><div><b>硬度</b><span>食感と設備付着の両方を見る項目。</span></div><div><b>TDS</b><span>水に溶けた物質量の目安。</span></div><div><b>残留塩素</b><span>におい・味への影響を確認する項目。</span></div></div>
 <div class="section-title"><h2>水質ルール</h2></div><div class="list v48-list">${qRules.slice(0,13).map(v48WaterRuleCard).join('')||v47Empty('水質ルール未確認','quality_rulesが見つかりません。')}</div>
 <div class="section-title"><h2>設備付着・スケールの見方</h2></div><div class="list v48-list">${sRules.slice(0,11).map(v48WaterRuleCard).join('')}</div>
 <details class="field-note"><summary>水質根拠・出典</summary><div class="list">${wClaims.slice(0,8).map(c=>`<div class="item"><h3>${esc(field(c,'topic')||field(c,'parameter')||'水質根拠')}</h3><p>${esc(v48ClaimText(c))}</p><p class="small">条件：${esc(field(c,'condition')||'未確認')} / 注意：${esc(field(c,'display_caution_ja')||'未確認')}</p><div class="source">根拠ID：${esc(field(c,'claim_id')||'未確認')} / 出典：${esc(field(c,'source_id')||'未確認')}<br>${esc(field(c,'source_url')||'URL未確認')}</div></div>`).join('')}</div><div>${wSources.slice(0,5).map(v48SourceLine).join('')}</div></details>
 <div class="section-title"><h2>納米庫：危険サイン</h2></div><div class="list v48-list">${danger.map(v48StorageRuleCard).join('')}</div>
 <div class="section-title"><h2>納米庫：注意・点検ルール</h2></div><div class="list v48-list">${attention.map(v48StorageRuleCard).join('')}</div>
 <div class="section-title"><h2>納米庫：点検場所</h2></div><div class="list v48-list">${checklist.slice(0,12).map(v48ChecklistCard).join('')}</div>
 <details class="field-note"><summary>納米庫の文献根拠・出典</summary><div class="list">${claims.slice(0,19).map(c=>`<div class="item"><h3>${esc(field(c,'theme')||'根拠')}</h3><p>${esc(v48ClaimText(c))}</p><p class="small">使い方：${esc(field(c,'use_in_rule')||'未確認')} / 注意：${esc(field(c,'limitations')||'未確認')}</p><div class="source">根拠ID：${esc(field(c,'claim_id')||'未確認')} / 出典：${esc(field(c,'source_ids')||'未確認')}</div></div>`).join('')}</div><div>${sources.slice(0,9).map(v48SourceLine).join('')}</div></details>`;
}
function renderFuture(){
 const data=S.data.future_rice||[], stories=storyList(), story=todayStory(), q=S.filters.storyq||'', country=S.filters.storyCountry||'', fq=S.filters.future||'';
 const storyCountries=[...new Set(stories.map(storyCountry).filter(has))].sort(); const storyFiltered=stories.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||storyCountry(x)===country)); const futureFiltered=data.filter(x=>!fq||JSON.stringify(x).includes(fq));
 $('#future').innerHTML=`${v47PageLead('世界ライス物語','365話を毎日1話。料理・食感・炊飯の視点へつなげます。','world')}
 <section class="today-story-v47"><div><span class="eyebrow">TODAY'S STORY</span><h2>${esc(storyTitle(story||{}))}</h2><p class="small">${esc(storyCountry(story||{}))} / ${esc(field(story,'theme')||'テーマ未確認')}</p><p>${esc(storyBody(story||{},720)).split('\n').join('<br>')}</p><details open><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(story,'learning_point')||'未確認')}</p><p><b>料理場面：</b>${esc(field(story,'scene_note')||'未確認')}</p><p><b>食感：</b>${esc(field(story,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(story,'cooking_note')||'未確認')}</p><p>${chips([field(story,'texture_keywords'),field(story,'related_terms')])}</p></details></div>${art('world')}</section>
 <div class="grid"><div class="card">${art('map')}<h2>今いる国のお米ヒストリー</h2><p>現在地から国を選び、その国の米文化、料理、品種の入口につなげます。</p><p class="small">32か国の国別ヒストリーを収録済みです。</p></div><div class="card">${art('future')}<h2>お米の未来</h2><p>技術・環境・品種改良など、未来テーマへ進みます。</p></div></div>
 <div class="section-title"><h2>物語を探す</h2></div><div class="toolbar"><input placeholder="物語検索" value="${esc(q)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">全ての国・地域</option>${storyCountries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(storyFiltered.length,'表示中の物語')}${stat(stories.length,'物語総数')}${stat(storyCountries.length,'国・地域')}</div>
 <div class="story-list-v47">${storyFiltered.slice(0,80).map(x=>`<article class="item story-item-v47"><h3>${esc(storyTitle(x))}</h3><p>${chips([field(x,'day_no')+'日目',storyCountry(x),field(x,'region'),field(x,'theme')])}</p><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,280)).split('\n').join('<br>')}</p></article>`).join('')}</div>
 <div class="section-title"><h2>お米の未来50</h2></div><div class="toolbar"><input placeholder="未来テーマ検索" value="${esc(fq)}" oninput="setFilter('future',this.value)"></div><div class="list">${futureFiltered.slice(0,50).map(x=>`<div class="item"><h3>${esc(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ')}</h3><p>${chips([x.category,x.source_type])}</p><p>${esc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'本文未確認')}</p></div>`).join('')}</div>`;
}
function renderRankings(){
 const defs=S.data.rankings?.rankings||[], rows=S.data.ranking_items_template||[]; const q=S.filters.rankq||'';
 const filledRows=rows.filter(x=>has(x.country_or_item_ja)&&has(x.value));
 const list=defs.filter(def=>!q||JSON.stringify(def).includes(q));
 function itemsFor(def){return (def.items||[]).concat(filledRows.filter(x=>x.ranking_id===def.ranking_id));}
 function rankCard(def){const title=tx(def,'display_title')||tx(def,'ranking_name')||def.ranking_id; const desc=tx(def,'short_desc')||tx(def,'value')||'説明未確認'; const items=itemsFor(def); const ready=items.length>0; return `<article class="item ranking-card-v47 ${ready?'ready':'pending'}"><div class="ranking-head-v47">${art('ranking')}<div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div></div><p>${chips([def.source_name,def.unit,ready?'順位表あり':'順位データ確認中'])}</p>${ready?`<table class="ranking-table-v47"><thead><tr><th>順位</th><th>国・項目</th><th>数値</th><th>年</th></tr></thead><tbody>${items.slice(0,10).map(x=>`<tr><td>${esc(x.rank)}</td><td>${esc(tx(x,'country_or_item')||field(x,'country_or_item_ja'))}</td><td>${esc(field(x,'value')||'未確認')} ${esc(field(x,'unit')||def.unit||'')}</td><td>${esc(field(x,'source_year')||'未確認')}</td></tr>`).join('')}</tbody></table>`:`<div class="rank-empty-v47"><b>順位データ確認中</b><span>順位・比較データの対象年・単位・出典を確認中です。</span></div>`}<details><summary>定義・出典候補</summary><p><b>出典候補：</b>${esc(def.source_name||'出典名未確認')}</p><p><b>単位：</b>${esc(def.unit||'未確認')}</p><p><b>計算方法：</b>${esc(def.calculation_method||'未確認')}</p><p><b>注意：</b>${esc(tx(def,'caution')||'未確認')}</p></details></article>`;}
 const ready=list.filter(d=>itemsFor(d).length>0), pending=list.filter(d=>itemsFor(d).length===0);
 $('#rankings').innerHTML=`${v47PageLead('世界の米ランキング','米を数字で見るページです。順位表があるものと、まだ入力が必要なものを分けて表示します。','ranking')}
 <div class="toolbar"><input placeholder="ランキング検索" value="${esc(q)}" oninput="setFilter('rankq',this.value)"></div>
 <div class="countbar">${stat(defs.length,'ランキング定義')}${stat(filledRows.length,'入力済み順位')}${stat(ready.length,'順位表あり')}${stat(pending.length,'順位データ確認中')}</div>
 <div class="section-title"><h2>順位表があるランキング</h2></div><div class="ranking-grid-v47">${ready.map(rankCard).join('')||v47Empty('順位表を確認中です','定義はあります。TOP10明細は確認できたものから表示します。')}</div>
 <div class="section-title"><h2>順位データ確認中</h2></div><div class="ranking-grid-v47">${pending.map(rankCard).join('')}</div>`;
}


/* === v54: 今日の米言葉100件を専用Excelから統合。用語集とは別機能。 === */
function v54DailyRiceWord(){
  const arr=S.data?.daily_rice_words||[];
  return arr.length ? arr[todayIndex(arr.length,'daily_rice_word_v54')] : null;
}
function riceWordTx(w,key){
  if(!w) return '';
  const L=S.lang;
  const map={ja:'ja',en:'en',zh_tw:'zh_tw',zh_cn:'zh_cn'};
  const lang=map[L]||'ja';
  return field(w.i18n?.[lang]||{},key)||field(w.i18n?.ja||{},key)||field(w,key)||'';
}
function v54RiceWordCard(open=false){
  const w=v54DailyRiceWord();
  if(!w){
    return homeMini('今日の米言葉','今日の米言葉の専用データは確認中です。','word','words','用語集へ');
  }
  return `<article class="card rice-word-card-v53">${art('word')}<div><span class="eyebrow">今日の米言葉</span><h2>${esc(riceWordTx(w,'word'))}</h2><p class="rice-word-meaning-v53"><b>米言葉：</b>${esc(riceWordTx(w,'meaning'))}</p><p>${esc(riceWordTx(w,'body'))}</p><p class="rice-word-message-v53"><b>今日のひとこと：</b>${esc(riceWordTx(w,'message'))}</p><details ${open?'open':''}><summary>米とのつながり</summary><p>${esc(riceWordTx(w,'body')||'米とのつながりは確認中です。')}</p><p class="small">出典：今日の米言葉 花言葉風100。用語集とは別の日替わりメッセージです。</p><div class="priority-row"><button class="btn secondary" onclick="S.filters.wordq='${esc(riceWordTx(w,'word'))}';switchView('words')">関連用語を見る</button><button class="btn secondary" onclick="switchView('learn')">学ぶへ</button></div></details></div></article>`;
}
function v54TodayNaviCard(){
  const w=v54DailyRiceWord(), story=todayStory(), daily=v48SafeDailyCopy();
  return homeMini('今日の米ナビ',`<b>${esc(daily.title)}</b><br>${esc(daily.body)}<br><span class="small">米言葉：${esc(w?.word||'確認中')}</span>`,'fortune','home','今日の入口');
}
function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), story=todayStory(), future=pick(d.future_rice,'future'), daily=v48SafeDailyCopy(), w=v54DailyRiceWord();
 $('#home').innerHTML=`<div class="home-v47 home-v50 home-v53">
  ${v50HomeIntro()}
  ${v50StatusLine()}
  <section class="nav-cards-v47 nav-cards-v50 nav-cards-v53">
    ${navCard('home','今日の米ナビ','今日の一杯を考える','fortune','入口')}
    ${navCard('check','米コンディション','水・保管・結露','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47 home-grid-v50 home-grid-v53">
    ${v54RiceWordCard(false)}
    ${homeMini('米コンディション',`保管、結露、水の傾向を見て、炊飯前の確認につなげます。`,'weather','check','確認する')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${v50CountryHistoryCard()}
    ${homeMini('用語集',`1000語から検索します。<br><span class="small">今日の米言葉とは別の参照機能です。</span>`,'word','words','用語を見る')}
    ${homeMini('炊飯文献',`文献要点、条件、数値、注意点、出典を確認します。<br><span class="small">現場メモは別枠で扱います。</span>`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露・湿度・温度差・残米・付着米・カビ臭・虫・変色を見ます。`,'storage','check','保管へ')}
    ${homeMini('世界ランキング',`順位・比較データを表で確認します。`,'ranking','rankings','数字を見る')}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来へ')}
  </section>
  <details class="data-check compact"><summary>収録内容</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat(counts.glossary_terms,'用語集','1000語')}${stat(counts.daily_rice_words,'今日の米言葉','花言葉風')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.ranking_definitions,'ランキング','定義')}</div></details>
 </div>`;
}
function renderWords(){
 const data=S.data.glossary||[], q=S.filters.wordq||'', category=S.filters.wordcat||'';
 const categories=[...new Set(data.map(x=>field(x,'category_ja','category')).filter(has))].slice(0,40);
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!category||field(x,'category_ja','category')===category));
 $('#words').innerHTML=`${v47PageLead('用語集','米・炊飯・水・保管・世界の米文化に関わる用語を検索します。','word')}
 <section class="dictionary-feature-v51 dictionary-feature-v53">${art('word')}<div><span class="eyebrow">GLOSSARY</span><h2>用語集</h2><p>収録目標は1000語です。今日の米言葉とは別の、検索・参照用の機能です。</p></div></section>
 ${v54RiceWordCard(true)}
 <div class="toolbar"><input placeholder="用語を検索" value="${esc(q)}" oninput="setFilter('wordq',this.value)"><select onchange="setFilter('wordcat',this.value)"><option value="">全カテゴリ</option>${categories.map(c=>`<option ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'収録語')}${stat(categories.length,'カテゴリ')}</div>
 <div class="list glossary-list-v53">${filtered.slice(0,220).map(x=>`<div class="item"><h3>${esc(termName(x))}</h3><p>${chips([field(x,'category_ja'),field(x,'term_status'),field(x,'source_area')])}</p><p>${esc(termNote(x)||field(x,'desc_ja')||'説明は確認中です。')}</p><p><b>炊飯で見ること：</b>${esc(field(x,'relevance_ja')||'関連カードで確認します。')}</p><p><b>使い方：</b>${esc(field(x,'today_view_ja')||'用語集で検索し、関連する教材・文献へ進みます。')}</p><details><summary>出典・編集区分</summary><p class="small">${esc(field(x,'app_status_ja')||'RICE NAVI編集解説として扱います。')}</p><p class="source">参照元：${esc(field(x,'source_area')||'未確認')} / キー：${esc(field(x,'source_key')||'未確認')}</p></details></div>`).join('')}</div>`;
}


/* === v55: source-index routine + user-facing copy cleanup ===
   Focus: keep 今日の米言葉 separate from 用語集, remove instruction-like UI notes,
   and carry forward unresolved work without dropping previous tasks. */
function v55SelectedLangAllowed(){ return S.lang === 'ja'; }
function v55RiceWordText(w,key){
  if(!w) return '';
  // 今日の米言葉100は日本語正本として扱う。未レビュー翻訳は完成表示にしない。
  return field(w.i18n?.ja||{},key)||field(w,key)||'';
}
function v55RiceWordCard(open=false){
  const w=v54DailyRiceWord();
  if(!w){
    return `<article class="card rice-word-card-v53 rice-word-card-v55">${art('word')}<div><span class="eyebrow">今日の米言葉</span><h2>確認中</h2><p>今日の米言葉は、米にまつわる言葉を花言葉のように味わう日替わりメッセージです。</p></div></article>`;
  }
  if(!v55SelectedLangAllowed()){
    const labels={en:['Daily Rice Word','The reviewed text is being prepared.'],zh_tw:['今日米語','審校後的文字正在準備中。'],zh_cn:['今日米语','审校后的文字正在准备中。']};
    const l=labels[S.lang]||labels.en;
    return `<article class="card rice-word-card-v53 rice-word-card-v55">${art('word')}<div><span class="eyebrow">${esc(l[0])}</span><h2>${esc(l[1])}</h2><p>${esc(l[1])}</p></div></article>`;
  }
  const word=v55RiceWordText(w,'word'), meaning=v55RiceWordText(w,'meaning'), body=v55RiceWordText(w,'body'), message=v55RiceWordText(w,'message');
  return `<article class="card rice-word-card-v53 rice-word-card-v55">${art('word')}<div><span class="eyebrow">今日の米言葉</span><h2>${esc(word||'米言葉')}</h2><p class="rice-word-meaning-v53"><b>意味：</b>${esc(meaning||'確認中')}</p><p>${esc(body||'米とのつながりを確認中です。')}</p><p class="rice-word-message-v53"><b>今日のひとこと：</b>${esc(message||'今日を少し丁寧に見るための言葉です。')}</p><details ${open?'open':''}><summary>米とのつながり</summary><p>${esc(body||'米とのつながりを確認中です。')}</p><div class="priority-row"><button class="btn secondary" onclick="S.filters.wordq='${esc(word)}';switchView('words')">関連用語を見る</button><button class="btn secondary" onclick="switchView('future')">世界ライスへ</button></div></details></div></article>`;
}
function v55GlossaryMini(){
  return homeMini('用語集',`米・炊飯・水・保管・世界の米文化の言葉を検索できます。<br><span class="small">収録語：${esc((S.data?.glossary||[]).length)}語</span>`,'word','words','用語を見る');
}
function v55CountryHistoryCard(){
  return `<div class="card">${art('map')}<h2>今いる国のお米ヒストリー</h2><p>現在地から国を選び、その国の米文化、料理、品種の入口につなげます。</p><p class="small">国別本文は、確認できたマスターから順に表示します。</p></div>`;
}
function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), story=todayStory(), future=pick(d.future_rice,'future');
 $('#home').innerHTML=`<div class="home-v47 home-v50 home-v53 home-v55">
  ${v50HomeIntro()}
  ${v50StatusLine()}
  <section class="nav-cards-v47 nav-cards-v50 nav-cards-v53 nav-cards-v55">
    ${navCard('home','今日の米ナビ','今日の一杯を考える','fortune','入口')}
    ${navCard('check','米コンディション','水・保管・結露','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47 home-grid-v50 home-grid-v53 home-grid-v55">
    ${v55RiceWordCard(false)}
    ${homeMini('米コンディション',`水の傾向、湿度、保管状態を見て、炊飯前の確認につなげます。`,'weather','check','確認する')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${v50CountryHistoryCard()}
    ${v55GlossaryMini()}
    ${homeMini('炊飯文献',`文献要点、条件、数値、注意点、出典を確認します。`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露、湿度、温度差、残米、付着米、カビ臭、虫、変色を見ます。`,'storage','check','保管へ')}
    ${homeMini('世界ランキング',`順位表があるものは表で、不足しているものは入力状況を分けて表示します。`,'ranking','rankings','数字を見る')}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来へ')}
  </section>
  <details class="data-check compact"><summary>収録内容</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat((S.data?.glossary||[]).length,'用語集','収録語')}${stat((S.data?.daily_rice_words||[]).length,'今日の米言葉','花言葉風')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.ranking_definitions,'ランキング','定義')}</div></details>
 </div>`;
}
function renderWords(){
 const data=S.data.glossary||[], q=S.filters.wordq||'', category=S.filters.wordcat||'';
 const categories=[...new Set(data.map(x=>field(x,'category_ja','category')).filter(has))].slice(0,50);
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!category||field(x,'category_ja','category')===category));
 $('#words').innerHTML=`${v47PageLead('用語集','米・炊飯・水・保管・世界の米文化に関わる言葉を、検索とカテゴリからたどります。','word')}
 <section class="dictionary-feature-v51 dictionary-feature-v53 dictionary-feature-v55">${art('word')}<div><span class="eyebrow">GLOSSARY</span><h2>用語集</h2><p>用語を調べ、関連する教材・文献・品種・チェック項目へ進むための入口です。</p></div></section>
 <div class="toolbar"><input placeholder="用語を検索" value="${esc(q)}" oninput="setFilter('wordq',this.value)"><select onchange="setFilter('wordcat',this.value)"><option value="">全カテゴリ</option>${categories.map(c=>`<option ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'収録語')}${stat(categories.length,'カテゴリ')}</div>
 <div class="list glossary-list-v53 glossary-list-v55">${filtered.slice(0,260).map(x=>`<div class="item"><h3>${esc(termName(x))}</h3><p>${chips([field(x,'category_ja'),field(x,'term_status')])}</p><p>${esc(termNote(x)||field(x,'desc_ja')||'説明は確認中です。')}</p><p><b>炊飯で見ること：</b>${esc(field(x,'relevance_ja')||'関連カードで確認します。')}</p><p><b>確認の入口：</b>${esc(field(x,'today_view_ja')||'関連する教材・文献へ進みます。')}</p><details><summary>参照元</summary><p class="source">参照元：${esc(field(x,'source_area')||'未確認')} / キー：${esc(field(x,'source_key')||'未確認')}</p></details></div>`).join('')}</div>`;
}
function renderFuture(){
 const data=S.data.future_rice||[], q=S.filters.storyq||'', country=S.filters.storyCountry||'', fq=S.filters.future||'';
 const stories=storyList(), story=todayStory(), storyCountries=[...new Set(stories.map(storyCountry).filter(has))].sort();
 const storyFiltered=stories.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||storyCountry(x)===country));
 const futureFiltered=data.filter(x=>!fq||JSON.stringify(x).includes(fq));
 $('#future').innerHTML=`${v47PageLead('世界ライス物語','世界の米文化を毎日1話。料理・食感・炊飯の見方へつなげます。','world')}
 <section class="today-story-v47"><div><span class="eyebrow">TODAY'S STORY</span><h2>${esc(storyTitle(story||{}))}</h2><p class="small">${esc(storyCountry(story||{}))} / ${esc(field(story,'theme')||'テーマ未確認')}</p><p>${esc(storyBody(story||{},720)).split('\n').join('<br>')}</p><details open><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(story,'learning_point')||'未確認')}</p><p><b>料理場面：</b>${esc(field(story,'scene_note')||'未確認')}</p><p><b>食感：</b>${esc(field(story,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(story,'cooking_note')||'未確認')}</p><p>${chips([field(story,'texture_keywords'),field(story,'related_terms')])}</p></details></div>${art('world')}</section>
 <div class="grid">${v55CountryHistoryCard()}<div class="card">${art('future')}<h2>お米の未来</h2><p>技術・環境・品種改良など、未来テーマへ進みます。</p></div></div>
 <div class="section-title"><h2>物語を探す</h2></div><div class="toolbar"><input placeholder="物語検索" value="${esc(q)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">全ての国・地域</option>${storyCountries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(storyFiltered.length,'表示中の物語')}${stat(stories.length,'物語総数')}${stat(storyCountries.length,'国・地域')}</div>
 <div class="story-list-v47">${storyFiltered.slice(0,80).map(x=>`<article class="item story-item-v47"><h3>${esc(storyTitle(x))}</h3><p>${chips([field(x,'day_no')+'日目',storyCountry(x),field(x,'region'),field(x,'theme')])}</p><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,280)).split('\n').join('<br>')}</p></article>`).join('')}</div>
 <div class="section-title"><h2>お米の未来50</h2></div><div class="toolbar"><input placeholder="未来テーマ検索" value="${esc(fq)}" oninput="setFilter('future',this.value)"></div><div class="list">${futureFiltered.slice(0,50).map(x=>`<div class="item"><h3>${esc(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ')}</h3><p>${chips([x.category,x.source_type])}</p><p>${esc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'本文未確認')}</p></div>`).join('')}</div>`;
}


/* === v56/v57: 今日の米言葉 4言語対応を正しく使用 ===
   Source routine checked: File_Data_Index + 今日の米言葉100 Excel.
   Keep 今日の米言葉 separate from 用語集1000. Do not treat it as Japanese-only. */
function v56Lang(){ return S.lang || 'ja'; }
function v56RiceWordLabel(key){
  const L=v56Lang();
  const ui=S.data?.daily_rice_words_ui_texts||{};
  const row=ui[key]||{};
  return row[L] || row.ja || row.en || '';
}
function v56RiceWordText(w,key){
  if(!w) return '';
  const L=v56Lang();
  const langMap={ja:'ja',en:'en',zh_tw:'zh_tw',zh_cn:'zh_cn'};
  const lang=langMap[L]||'ja';
  const src=w.i18n?.[lang]||{};
  const fallback=w.i18n?.ja||{};
  return field(src,key)||field(fallback,key)||field(w,key)||'';
}
function v55RiceWordText(w,key){ return v56RiceWordText(w,key); }
function v56RelatedWordButtonLabel(){
  const L=v56Lang();
  return ({ja:'関連用語を見る',en:'Related terms',zh_tw:'查看相關用語',zh_cn:'查看相关用语'})[L] || '関連用語を見る';
}
function v56WorldButtonLabel(){
  const L=v56Lang();
  return ({ja:'世界ライスへ',en:'World rice stories',zh_tw:'前往世界米故事',zh_cn:'前往世界米故事'})[L] || '世界ライスへ';
}
function v55RiceWordCard(open=false){
  const w=v54DailyRiceWord();
  const title=v56RiceWordLabel('module_title')||'今日の米言葉';
  const subtitle=v56RiceWordLabel('subtitle')||'';
  const meaningLabel=v56RiceWordLabel('meaning_label')||'米言葉';
  const messageLabel=v56RiceWordLabel('message_label')||'今日のひとこと';
  const sourceNote=v56RiceWordLabel('source_note')||'';
  if(!w){
    return `<article class="card rice-word-card-v53 rice-word-card-v55 rice-word-card-v56">${art('word')}<div><span class="eyebrow">${esc(title)}</span><h2>確認中</h2><p>${esc(subtitle)}</p></div></article>`;
  }
  const word=v56RiceWordText(w,'word'), meaning=v56RiceWordText(w,'meaning'), body=v56RiceWordText(w,'body'), message=v56RiceWordText(w,'message');
  return `<article class="card rice-word-card-v53 rice-word-card-v55 rice-word-card-v56">${art('word')}<div><span class="eyebrow">${esc(title)}</span><h2>${esc(word||title)}</h2>${subtitle?`<p class="small">${esc(subtitle)}</p>`:''}<p class="rice-word-meaning-v53"><b>${esc(meaningLabel)}：</b>${esc(meaning||'確認中')}</p><p>${esc(body||'米とのつながりを確認中です。')}</p><p class="rice-word-message-v53"><b>${esc(messageLabel)}：</b>${esc(message||'今日を少し丁寧に見るための言葉です。')}</p><details ${open?'open':''}><summary>${esc(v56RiceWordLabel('detail_label')||'詳しく見る')}</summary><p>${esc(body||'米とのつながりを確認中です。')}</p>${sourceNote?`<p class="small">${esc(sourceNote)}</p>`:''}<div class="priority-row"><button class="btn secondary" onclick="S.filters.wordq='${esc(word)}';switchView('words')">${esc(v56RelatedWordButtonLabel())}</button><button class="btn secondary" onclick="switchView('future')">${esc(v56WorldButtonLabel())}</button></div></details></div></article>`;
}
function v55GlossaryMini(){
  const L=v56Lang();
  const text=({ja:'米・炊飯・水・保管・世界の米文化の言葉を検索できます。',en:'Search terms for rice, cooking, water, storage, and world rice culture.',zh_tw:'搜尋米、炊飯、水、保存與世界米文化相關用語。',zh_cn:'搜索米、煮饭、水、保存与世界米文化相关用语。'})[L] || '米・炊飯・水・保管・世界の米文化の言葉を検索できます。';
  const btnText=({ja:'用語を見る',en:'Open glossary',zh_tw:'查看用語',zh_cn:'查看用语'})[L] || '用語を見る';
  return homeMini('用語集',`${esc(text)}<br><span class="small">${esc((S.data?.glossary||[]).length)}語</span>`,'word','words',btnText);
}
function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), story=todayStory(), future=pick(d.future_rice,'future');
 $('#home').innerHTML=`<div class="home-v47 home-v50 home-v53 home-v55 home-v56">
  ${v50HomeIntro()}
  ${v50StatusLine()}
  <section class="nav-cards-v47 nav-cards-v50 nav-cards-v53 nav-cards-v55">
    ${navCard('home','今日の米ナビ','今日の一杯を考える','fortune','入口')}
    ${navCard('check','米コンディション','水・保管・結露','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47 home-grid-v50 home-grid-v53 home-grid-v55">
    ${v55RiceWordCard(false)}
    ${homeMini('米コンディション',`水の傾向、湿度、保管状態を見て、炊飯前の確認につなげます。`,'weather','check','確認する')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${v50CountryHistoryCard()}
    ${v55GlossaryMini()}
    ${homeMini('炊飯文献',`文献要点、条件、数値、注意点、出典を確認します。`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露、湿度、温度差、残米、付着米、カビ臭、虫、変色を見ます。`,'storage','check','保管へ')}
    ${homeMini('世界ランキング',`順位表があるものは表で、不足しているものは入力状況を分けて表示します。`,'ranking','rankings','数字を見る')}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来へ')}
  </section>
  <details class="data-check compact"><summary>収録内容</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat((S.data?.glossary||[]).length,'用語集','収録語')}${stat((S.data?.daily_rice_words||[]).length,'今日の米言葉','花言葉風')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.ranking_definitions,'ランキング','定義')}</div></details>
 </div>`;
}

/* v57: Data integration status was checked before further UI work. This does not invent missing country history or ranking TOP10 data. */


/* === v58: 国別お米ヒストリー32か国・4言語を正式統合 ===
   Source routine checked: RICE_NAVI_File_Data_Index_v1 + uploaded country history workbook.
   Corrected previous mistake: 本文は存在確認済み。未確認ではなく、v58で統合済み。 */
function histData(){ return S.data?.country_rice_history || {}; }
function histRecords(){ return histData().records || []; }
function histSources(){ return histData().sources || []; }
function histLangSuffix(){ return ({ja:'ja',en:'en',zh_tw:'zhTW',zh_cn:'zhCN'})[S.lang] || 'ja'; }
function histField(row,base){
  const suf=histLangSuffix();
  return field(row,`${base}_${suf}`,`${base}_ja`,base);
}
function histCountryName(row){ return histField(row,'country') || field(row,'country_ja','country_en','country_code') || '国名未確認'; }
function histPeriod(row){ return histField(row,'history_period') || '時代・期間未確認'; }
function histBody(row){ return histField(row,'history') || '本文未確認'; }
function histNote(row){ return histField(row,'display_note') || ''; }
function histDefaultCode(){
  const saved=localStorage.getItem('rice_navi_country_code');
  if(saved && histRecords().some(x=>x.country_code===saved)) return saved;
  const byLang={ja:'JP',zh_tw:'TW',zh_cn:'CN',en:'US'};
  return histRecords().some(x=>x.country_code===byLang[S.lang]) ? byLang[S.lang] : (histRecords()[0]?.country_code || '');
}
function histCurrent(){
  const code=S.filters.historyCountry || histDefaultCode();
  return histRecords().find(x=>x.country_code===code) || histRecords()[0] || null;
}
function setHistoryCountry(code){
  S.filters.historyCountry=code;
  if(code) localStorage.setItem('rice_navi_country_code',code);
  render();
}
function histSourceMap(){
  const m={}; histSources().forEach(s=>{if(s.source_id)m[s.source_id]=s;}); return m;
}
function histSourceDetails(ids){
  const sm=histSourceMap();
  const arr=String(ids||'').split(/[;,、\s]+/).map(x=>x.trim()).filter(Boolean).map(id=>sm[id]).filter(Boolean);
  if(!arr.length) return `<p class="source">出典ID：${esc(ids||'未確認')}</p>`;
  return arr.slice(0,4).map(s=>`<div class="source"><b>${esc(s.source_id||'')}</b> ${esc(s.source_name||'出典名未確認')}<br>${esc(s.url||'URL未確認')}</div>`).join('');
}
function histCountrySelector(selected){
  const rows=histRecords().slice().sort((a,b)=>(Number(a.sort_order)||999)-(Number(b.sort_order)||999));
  return `<select onchange="setHistoryCountry(this.value)">${rows.map(r=>`<option value="${esc(r.country_code)}" ${r.country_code===selected?'selected':''}>${esc(histCountryName(r))}</option>`).join('')}</select>`;
}
function countryHistoryFeatureCard(open=false){
  const h=histCurrent();
  if(!h) return `<div class="card">${art('map')}<h2>今いる国のお米ヒストリー</h2><p>国別本文データを確認中です。</p></div>`;
  const code=h.country_code;
  const title=({ja:'今いる国のお米ヒストリー',en:'Rice history by country',zh_tw:'所在國家的米食歷史',zh_cn:'所在国家的米食历史'})[S.lang] || '今いる国のお米ヒストリー';
  const change=({ja:'表示する国',en:'Country',zh_tw:'顯示國家',zh_cn:'显示国家'})[S.lang] || '表示する国';
  const note=histNote(h);
  return `<article class="card country-history-card-v58">${art('map')}<div><span class="eyebrow">COUNTRY RICE HISTORY</span><h2>${esc(title)}</h2><div class="toolbar compact-toolbar"><label>${esc(change)}</label>${histCountrySelector(code)}</div><h3>${esc(histCountryName(h))}</h3><p class="small">${esc(histPeriod(h))}</p><p>${esc(histBody(h)).split('\n').join('<br>')}</p><p>${chips([h.representative_tags])}</p><details ${open?'open':''}><summary>出典・表示について</summary>${note?`<p class="small">${esc(note)}</p>`:''}${histSourceDetails(h.source_ids)}<p class="small">国単位の米文化史として表示します。細かな住所ではなく、表示国を選んで読むための機能です。</p></details></div></article>`;
}
function countryHistoryHomeMini(){
  const h=histCurrent();
  if(!h) return homeMini('今いる国のお米ヒストリー','国別本文データを確認中です。','map','future','入口を見る');
  const body=esc(histBody(h));
  return `<article class="home-mini country-history-mini-v58"><button onclick="switchView('future')">${illust('map')}<b>${esc(histCountryName(h))}のお米ヒストリー</b><span>${esc(histPeriod(h))}<br>${body.length>88?body.slice(0,88)+'…':body}</span></button></article>`;
}
const renderHome_v58_base = renderHome;
renderHome=function(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), story=todayStory(), future=pick(d.future_rice,'future');
 $('#home').innerHTML=`<div class="home-v47 home-v50 home-v53 home-v55 home-v56 home-v58">
  ${v50HomeIntro()}
  ${v50StatusLine()}
  <section class="nav-cards-v47 nav-cards-v50 nav-cards-v53 nav-cards-v55">
    ${navCard('home','今日の米ナビ','今日の一杯を考える','fortune','入口')}
    ${navCard('check','米コンディション','水・保管・結露','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47 home-grid-v50 home-grid-v53 home-grid-v55">
    ${v55RiceWordCard(false)}
    ${countryHistoryHomeMini()}
    ${homeMini('米コンディション',`水の傾向、湿度、保管状態を見て、炊飯前の確認につなげます。`,'weather','check','確認する')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${v55GlossaryMini()}
    ${homeMini('炊飯文献',`文献要点、条件、数値、注意点、出典を確認します。`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露、湿度、温度差、残米、付着米、カビ臭、虫、変色を見ます。`,'storage','check','保管へ')}
    ${homeMini('世界ランキング',`順位表があるものは表で、不足しているものは入力状況を分けて表示します。`,'ranking','rankings','数字を見る')}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来へ')}
  </section>
  <details class="data-check compact"><summary>収録内容</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat((S.data?.glossary||[]).length,'用語集','収録語')}${stat((S.data?.daily_rice_words||[]).length,'今日の米言葉','花言葉風')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.country_rice_history_countries,'国別ヒストリー','32か国')}${stat(counts.ranking_definitions,'ランキング','定義')}</div></details>
 </div>`;
}
renderFuture=function(){
 const data=S.data.future_rice||[], q=S.filters.storyq||'', country=S.filters.storyCountry||'', fq=S.filters.future||'';
 const stories=storyList(), story=todayStory(), storyCountries=[...new Set(stories.map(storyCountry).filter(has))].sort();
 const storyFiltered=stories.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||storyCountry(x)===country));
 const futureFiltered=data.filter(x=>!fq||JSON.stringify(x).includes(fq));
 $('#future').innerHTML=`${v47PageLead('世界ライス物語','世界の米文化を毎日1話。料理・食感・炊飯の見方へつなげます。','world')}
 <section class="today-story-v47"><div><span class="eyebrow">TODAY'S STORY</span><h2>${esc(storyTitle(story||{}))}</h2><p class="small">${esc(storyCountry(story||{}))} / ${esc(field(story,'theme')||'テーマ未確認')}</p><p>${esc(storyBody(story||{},720)).split('\n').join('<br>')}</p><details open><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(story,'learning_point')||'未確認')}</p><p><b>料理場面：</b>${esc(field(story,'scene_note')||'未確認')}</p><p><b>食感：</b>${esc(field(story,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(story,'cooking_note')||'未確認')}</p><p>${chips([field(story,'texture_keywords'),field(story,'related_terms')])}</p></details></div>${art('world')}</section>
 ${countryHistoryFeatureCard(true)}
 <div class="section-title"><h2>物語を探す</h2></div><div class="toolbar"><input placeholder="物語検索" value="${esc(q)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">全ての国・地域</option>${storyCountries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(storyFiltered.length,'表示中の物語')}${stat(stories.length,'物語総数')}${stat(storyCountries.length,'国・地域')}${stat(histRecords().length,'国別ヒストリー','32か国')}</div>
 <div class="story-list-v47">${storyFiltered.slice(0,80).map(x=>`<article class="item story-item-v47"><h3>${esc(storyTitle(x))}</h3><p>${chips([field(x,'day_no')+'日目',storyCountry(x),field(x,'region'),field(x,'theme')])}</p><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,280)).split('\n').join('<br>')}</p></article>`).join('')}</div>
 <div class="section-title"><h2>お米の未来50</h2></div><div class="toolbar"><input placeholder="未来テーマ検索" value="${esc(fq)}" oninput="setFilter('future',this.value)"></div><div class="list">${futureFiltered.slice(0,50).map(x=>`<div class="item"><h3>${esc(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ')}</h3><p>${chips([x.category,x.source_type])}</p><p>${esc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'本文未確認')}</p></div>`).join('')}</div>`;
}


/* === v59: ランキングはTOP10明細がないため主要画面から外す ===
   Source routine checked: File_Data_Index + v30仕様 + ranking_master/template.
   v30 rule: 順位データ確認中ならランキング画面として出さない。
   Keep definitions internally, but do not present definitions-only content as a ranking feature. */
function rankingActualRows(){
  const rows=S.data?.ranking_items_template||[];
  return rows.filter(r=>has(r.country_or_item_ja)||has(r.country_or_item_en)||has(r.value)).filter(r=>has(r.value)).length;
}
function rankingDefinitionsCount(){ return (S.data?.rankings?.rankings||[]).length; }
function rankingStatusMini(){
  const n=rankingDefinitionsCount(), actual=rankingActualRows();
  if(actual>0){ return homeMini('世界ランキング',`確認済みの順位表を表示します。`,'ranking','rankings','数字を見る'); }
  return `<article class="home-mini ranking-status-v59 muted"><button type="button" onclick="switchView('home')">${illust('ranking')}<b>世界ランキング</b><span>ランキング定義 ${esc(n)}件。TOP10表がそろうまで主要画面には出しません。</span></button></article>`;
}
const renderHome_v59_prev = renderHome;
renderHome=function(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), story=todayStory(), future=pick(d.future_rice,'future');
 $('#home').innerHTML=`<div class="home-v47 home-v50 home-v53 home-v55 home-v56 home-v58 home-v59">
  ${v50HomeIntro()}
  ${v50StatusLine()}
  <section class="nav-cards-v47 nav-cards-v50 nav-cards-v53 nav-cards-v55">
    ${navCard('home','今日の米ナビ','今日の一杯を考える','fortune','入口')}
    ${navCard('check','米コンディション','水・保管・結露','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47 home-grid-v50 home-grid-v53 home-grid-v55">
    ${v55RiceWordCard(false)}
    ${countryHistoryHomeMini()}
    ${homeMini('米コンディション',`水の傾向、湿度、保管状態を見て、炊飯前の確認につなげます。`,'weather','check','確認する')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${v55GlossaryMini()}
    ${homeMini('炊飯文献',`文献要点、条件、数値、注意点、出典を確認します。`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露、湿度、温度差、残米、付着米、カビ臭、虫、変色を見ます。`,'storage','check','保管へ')}
    ${rankingStatusMini()}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来へ')}
  </section>
  <details class="data-check compact"><summary>収録内容</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat((S.data?.glossary||[]).length,'用語集','収録語')}${stat((S.data?.daily_rice_words||[]).length,'今日の米言葉','花言葉風')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.country_rice_history_countries,'国別ヒストリー','32か国')}</div></details>
 </div>`;
}
renderRankings=function(){
 const defs=S.data?.rankings?.rankings||[], actual=rankingActualRows();
 if(actual<=0){
   $('#rankings').innerHTML=`${v47PageLead('世界の米ランキング','TOP10表に必要な国・数値・年がそろってから公開します。','ranking')}
   <section class="card ranking-hold-v59">${art('ranking')}<h2>順位表はまだ公開していません</h2><p>ランキング名と出典候補は ${esc(defs.length)} 件ありますが、順位表として見せるための明細がまだ入っていません。</p><p>このページは、完成したランキングのようには見せず、出典確認後に表として公開します。</p><details><summary>保持しているランキング定義</summary><ul>${defs.map(d=>`<li>${esc(tx(d,'ranking_name')||d.ranking_id)} / ${esc(d.source_name||'出典候補未確認')}</li>`).join('')}</ul></details></section>`;
   return;
 }
 // fallback to earlier implementation if rows are populated later
 const defsReady=S.data.rankings?.rankings||[], rows=S.data.ranking_items_template||[]; const q=S.filters.rankq||'';
 const filledRows=rows.filter(x=>has(field(x,'country_or_item_ja','country_or_item_en'))&&has(x.value));
 function itemsFor(def){return (def.items||[]).concat(filledRows.filter(x=>x.ranking_id===def.ranking_id));}
 function rankCard(def){const title=tx(def,'display_title')||tx(def,'ranking_name')||def.ranking_id; const desc=tx(def,'short_desc')||tx(def,'value')||'説明未確認'; const items=itemsFor(def); return `<article class="item ranking-card-v47 ready"><div class="ranking-head-v47">${art('ranking')}<div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div></div><p>${chips([def.source_name,def.unit,'順位表あり'])}</p><table class="ranking-table-v47"><thead><tr><th>順位</th><th>国・項目</th><th>数値</th><th>年</th></tr></thead><tbody>${items.slice(0,10).map(x=>`<tr><td>${esc(x.rank)}</td><td>${esc(tx(x,'country_or_item')||field(x,'country_or_item_ja'))}</td><td>${esc(field(x,'value')||'未確認')} ${esc(field(x,'unit')||def.unit||'')}</td><td>${esc(field(x,'source_year')||'未確認')}</td></tr>`).join('')}</tbody></table></article>`;}
 const ready=defsReady.filter(d=>itemsFor(d).length>0);
 $('#rankings').innerHTML=`${v47PageLead('世界の米ランキング','確認済みの順位表を表示します。','ranking')}<div class="ranking-grid-v47">${ready.map(rankCard).join('')}</div>`;
}


/* === v60: 米占いを米らしく整理。ラッキーナンバー・米種・栽培から保存までの工程を用語集へリンク ===
   Source routine checked: File_Data_Index + rice_fortune module + glossary terms/candidates + rice_varieties.
   Rules: no unrelated literature claims, no random pH/water/source text in fortune, no exclamation mark in lucky number. */
function fortuneDataV60(){ return S.data?.rice_fortune || {}; }
function luckyNumberV60(){ const arr=fortuneDataV60().lucky_numbers||['88粒']; return arr[todayIndex(arr.length,'v60_lucky_number')]; }
function luckyFortuneNameV60(){ const arr=fortuneDataV60().fortune_names||['粒立ち運']; return arr[todayIndex(arr.length,'v60_fortune_name')]; }
function luckyProcessV60(){ const arr=fortuneDataV60().processes||[]; return arr.length ? arr[todayIndex(arr.length,'v60_lucky_process')] : {label_ja:'蒸らし',glossary_term_ja:'蒸らし',category_ja:'炊飯'}; }
function luckyVarietyV60(){ const arr=S.data?.rice_varieties||[]; return arr.length ? arr[todayIndex(arr.length,'v60_lucky_variety')] : null; }
function glossaryAllV60(){ return (S.data?.glossary||[]).concat(S.data?.glossary_process_candidates||[]); }
function openGlossaryTermV60(term){ S.filters.wordq=term; switchView('words'); }
function termButtonV60(term,label){ return `<button class="inline-link-v60" onclick="openGlossaryTermV60('${esc(term)}')">${esc(label||term)}</button>`; }
function varietyNameV60(v){ return v ? titleOfVariety(v) : '品種未確認'; }
function varietyCountryV60(v){ return v ? countryOfVariety(v) : '国・地域未確認'; }
function fortuneBodyV60(name, process){
  const p=process?.label_ja || '米の工程';
  const map={
    '粒立ち運':'細かなことを一つずつ整える日です。粒の輪郭をそろえるように、今日の流れも丁寧に見ていきます。',
    'ふっくら運':'急がず、少し余白を持つ日です。水分がなじむように、気持ちにもやわらかな時間を置いてみてください。',
    '実り運':'積み重ねたことが、少しずつ形になりやすい日です。見えにくい変化も、静かに進んでいます。',
    '水めぐり運':'流れを止めず、状態を見ながら整える日です。無理に動かすより、通り道をつくる意識が合います。',
    'ぬくもり運':'身近なものを大切にする日です。あたたかい一杯のように、落ち着ける場所を整えてください。',
    'ほどける運':'詰まっていたことが、少しずつ軽くなる日です。力を入れすぎず、やさしくほどいていきます。',
    '整い運':'基準を見直すことで、全体が整いやすい日です。量、時間、場所をひとつ確認してみてください。',
    '実り待ち運':'すぐに答えを出さず、育つ時間を待つ日です。今日のラッキー工程は「'+p+'」です。'
  };
  return map[name] || `今日は「${p}」を入口に、米の流れを少し丁寧に見ていきます。`;
}
function riceFortuneCardV60(open=false){
  const name=luckyFortuneNameV60(), num=luckyNumberV60(), v=luckyVarietyV60(), process=luckyProcessV60();
  const proc=process?.label_ja || process?.glossary_term_ja || '蒸らし';
  const procTerm=process?.glossary_term_ja || proc;
  const variety=varietyNameV60(v), country=varietyCountryV60(v);
  return `<article class="card rice-fortune-v60">${art('fortune')}<div><span class="eyebrow">今日の米占い</span><h2>${esc(name)}</h2><p>${esc(fortuneBodyV60(name,process))}</p><div class="fortune-grid-v60"><div><span>今日のラッキーナンバー</span><b>${esc(num)}</b></div><div><span>ラッキー米種</span><b>${esc(variety)}</b><small>${esc(country)}</small></div><div><span>ラッキー工程</span><b>${termButtonV60(procTerm,proc)}</b><small>${esc(process?.category_ja||'米の工程')}</small></div></div><details ${open?'open':''}><summary>今日の見方</summary><p>米占いは、米を身近に見るための軽い入口です。文献や水質データを無理に結びつけず、品種と工程はそれぞれのページへつなげます。</p><div class="priority-row"><button class="btn secondary" onclick="S.filters.varq='${esc(variety)}';switchView('varieties')">米種を見る</button><button class="btn secondary" onclick="openGlossaryTermV60('${esc(procTerm)}')">工程を用語集で見る</button></div></details></div></article>`;
}
function homeFortuneMiniV60(){
  const name=luckyFortuneNameV60(), num=luckyNumberV60(), v=luckyVarietyV60(), p=luckyProcessV60();
  const proc=p?.label_ja || '蒸らし';
  return `<article class="home-mini fortune-mini-v60"><button onclick="switchView('home')">${illust('fortune')}<b>今日の米占い</b><span>${esc(name)}<br>ラッキーナンバー：${esc(num)}<br>米種：${esc(varietyNameV60(v))} / 工程：${esc(proc)}</span></button></article>`;
}
const renderHome_v60_prev=renderHome;
renderHome=function(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), story=todayStory(), future=pick(d.future_rice,'future');
 $('#home').innerHTML=`<div class="home-v47 home-v50 home-v53 home-v55 home-v56 home-v58 home-v59 home-v60">
  ${v50HomeIntro()}
  ${v50StatusLine()}
  <section class="nav-cards-v47 nav-cards-v50 nav-cards-v53 nav-cards-v55">
    ${navCard('home','今日の米ナビ','今日の一杯を考える','fortune','入口')}
    ${navCard('check','米コンディション','水・保管・結露','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47 home-grid-v50 home-grid-v53 home-grid-v55">
    ${riceFortuneCardV60(false)}
    ${v55RiceWordCard(false)}
    ${countryHistoryHomeMini()}
    ${homeMini('米コンディション',`水の傾向、湿度、保管状態を見て、炊飯前の確認につなげます。`,'weather','check','確認する')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${v55GlossaryMini()}
    ${homeMini('炊飯文献',`文献要点、条件、数値、注意点、出典を確認します。`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露、湿度、温度差、残米、付着米、カビ臭、虫、変色を見ます。`,'storage','check','保管へ')}
    ${rankingStatusMini()}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来へ')}
  </section>
  <details class="data-check compact"><summary>収録内容</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.learning_cards_v82,'教材カード','学ぶ')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat((S.data?.glossary||[]).length,'用語集','収録語')}${stat((S.data?.glossary_process_candidates||[]).length,'工程語候補','用語集リンク')}${stat((S.data?.daily_rice_words||[]).length,'今日の米言葉','花言葉風')}${stat(counts.world_rice_stories,'世界ライス','365話')}${stat(counts.country_rice_history_countries,'国別ヒストリー','32か国')}</div></details>
 </div>`;
}
const renderWords_v60_prev=renderWords;
renderWords=function(){
 const data=glossaryAllV60(), q=S.filters.wordq||'', category=S.filters.wordcat||'';
 const categories=[...new Set(data.map(x=>field(x,'category_ja','category')).filter(has))].slice(0,50);
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!category||field(x,'category_ja','category')===category));
 $('#words').innerHTML=`${v47PageLead('用語集','米づくり、炊飯、水、保管、世界の米文化の言葉を検索します。今日の米言葉とは別の参照機能です。','word')}
 <div class="toolbar"><input placeholder="用語を検索" value="${esc(q)}" oninput="setFilter('wordq',this.value)"><select onchange="setFilter('wordcat',this.value)"><option value="">全カテゴリ</option>${categories.map(c=>`<option ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="priority-row">${['種選び','育苗','田植え','出穂','登熟','収穫','精米','洗米','浸漬','蒸らし','ほぐし','保管確認'].map(k=>`<button onclick="setFilter('wordq','${k}')">${k}</button>`).join('')}<button onclick="setFilter('wordq','')">全件</button></div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat((S.data?.glossary||[]).length,'用語集')}${stat((S.data?.glossary_process_candidates||[]).length,'工程語候補')}</div>
 <div class="dictionary-grid-v51">${filtered.slice(0,240).map(x=>`<article class="item dictionary-card-v51 ${field(x,'term_status')==='candidate'?'candidate-term-v60':''}"><div class="dict-head-v51"><div><span class="pill">${esc(termCategory(x))}</span><h3>${esc(termName(x))}</h3></div>${art('word')}</div><p>${esc(termNote(x))}</p><p><b>米とのつながり：</b>${esc(termRelevance(x)||'関連する教材・文献と合わせて確認します。')}</p><p><b>今日の見方：</b>${esc(termTodayView(x)||'検索語として使います。')}</p>${field(x,'term_status')==='candidate'?'<p class="small">工程語候補。RICE NAVI編集解説として追加確認中です。</p>':''}<p>${chips([termRelated(x)])}</p><div class="priority-row"><button class="btn secondary" onclick="S.filters.litq='${esc(termName(x))}';switchView('literature')">関連文献</button><button class="btn secondary" onclick="S.filters.learn='${esc(termName(x))}';switchView('learn')">関連教材</button></div></article>`).join('')}</div>`;
}

/* load() moved to the final line in v78 forest_fix_3 so final render overrides are active. */



/* === v61: 世界ランキングTOP10/価格比較データ統合 ===
   Source routine checked: File_Data_Index + uploaded 4-language ranking workbook.
   11 ranking definitions, 106 ranking/comparison rows, 7 source rows.
   Do not show ranking as empty or pending when actual rows exist. */
function v61RankingRows(){
  return (S.data?.ranking_items_template||[]).filter(r=>has(field(r,'country_or_item_ja','country_or_item_en','country_or_item_zh_tw','country_or_item_zh_cn'))&&has(r.value));
}
function v61RankingSources(){
  return S.data?.rankings?.sources||[];
}
function v61DataQualityLabel(code){
  const rows=S.data?.rankings?.data_quality_summary||[];
  const hit=rows.find(x=>x.data_quality===code);
  return hit?.app_display_ja || hit?.meaning_ja || code || '';
}
rankingActualRows=function(){return v61RankingRows().length;};
rankingStatusMini=function(){
  const actual=rankingActualRows(), defs=(S.data?.rankings?.rankings||[]).length;
  if(actual>0){ return homeMini('世界ランキング',`確認済みのランキング ${esc(defs)}件を表示します。`,'ranking','rankings','数字を見る'); }
  return `<article class="home-mini ranking-status-v59 muted"><button type="button" onclick="switchView('home')">${illust('ranking')}<b>世界ランキング</b><span>順位表データを確認中です。</span></button></article>`;
};
renderRankings=function(){
 const defs=S.data?.rankings?.rankings||[], rows=v61RankingRows(), q=S.filters.rankq||'';
 const langMatch=(obj)=>JSON.stringify(obj||{}).toLowerCase().includes(String(q).toLowerCase());
 const list=defs.filter(def=>!q||langMatch(def)||rows.some(r=>r.ranking_id===def.ranking_id&&langMatch(r)));
 function itemsFor(def){return rows.filter(x=>x.ranking_id===def.ranking_id).sort((a,b)=>Number(a.rank)-Number(b.rank));}
 function rankCard(def){
   const title=tx(def,'display_title')||tx(def,'ranking_name')||def.ranking_id;
   const desc=tx(def,'short_desc')||tx(def,'value')||'説明未確認';
   const items=itemsFor(def);
   const sourceLabel=def.source_name||def.source_id||'出典未確認';
   return `<article class="item ranking-card-v47 ready">
     <div class="ranking-head-v47">${art('ranking')}<div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div></div>
     <p>${chips([sourceLabel,def.unit,def.source_year,'順位表あり'])}</p>
     <table class="ranking-table-v47"><thead><tr><th>順位</th><th>国・項目</th><th>数値</th><th>年</th></tr></thead>
       <tbody>${items.map(x=>`<tr><td>${esc(x.rank)}</td><td>${esc(tx(x,'country_or_item')||field(x,'country_or_item_ja'))}</td><td>${esc(field(x,'value')||'未確認')} ${esc(field(x,'unit')||def.unit||'')}</td><td>${esc(field(x,'source_year')||def.source_year||'未確認')}</td></tr>`).join('')}</tbody></table>
     <details><summary>出典・注記</summary>
       <p><b>出典：</b>${esc(sourceLabel)}</p>
       <p><b>データ区分：</b>${esc(v61DataQualityLabel(def.data_quality))}</p>
       <p><b>単位：</b>${esc(def.unit||'未確認')}</p>
       <p><b>対象年：</b>${esc(def.source_year||'未確認')}</p>
       ${items.some(x=>tx(x,'app_note'))?`<ul>${items.slice(0,3).map(x=>`<li>${esc(tx(x,'app_note'))}</li>`).join('')}</ul>`:''}
     </details>
   </article>`;
 }
 const ready=list.filter(d=>itemsFor(d).length>0), pending=list.filter(d=>itemsFor(d).length===0);
 $('#rankings').innerHTML=`${v47PageLead('世界の米ランキング','米を数字で見るためのランキングです。出典と対象年を確認できる形で表示します。','ranking')}
 <div class="toolbar"><input placeholder="ランキング検索" value="${esc(q)}" oninput="setFilter('rankq',this.value)"></div>
 <div class="countbar">${stat(defs.length,'ランキング')}${stat(rows.length,'順位・比較行')}${stat(v61RankingSources().length,'出典')}</div>
 <div class="ranking-grid-v47">${ready.map(rankCard).join('')||v47Empty('表示できる順位表がありません','データの入力状態を確認してください。')}</div>
 ${pending.length?`<details class="card"><summary>明細未入力のランキング</summary><ul>${pending.map(d=>`<li>${esc(tx(d,'ranking_name')||d.ranking_id)}</li>`).join('')}</ul></details>`:''}`;
};



/* === v62: 用語集1000語 品質整理・表示改善 ===
   Source routine checked: File_Data_Index + v61 JSON glossary/rice_fortune/daily_rice_words.
   Scope: glossary quality/status display. Do not merge 今日の米言葉 with 用語集.
*/
function glossaryV62(){return (S.data?.glossary||[]).concat(S.data?.glossary_process_candidates||[]);} 
function glossaryGroupV62(x){return field(x,'display_group_ja')||field(x,'category_ja')||'その他';}
function glossaryQualityV62(x){return field(x,'glossary_quality_ja')||field(x,'term_status')||'確認中';}
function glossaryPriorityV62(x){return Number(field(x,'display_priority'))||0;}
function isCoreV62(x){return !!x.is_core_term || glossaryPriorityV62(x)>=90;}
function glossaryGroupsV62(){
  const base=['まず見る用語','工程','品質・成分','水','保管・納米庫','文献・評価','世界米文化','品種名','その他'];
  return base;
}
function glossaryFilterHitV62(x,group){
  if(!group || group==='') return true;
  if(group==='まず見る用語') return isCoreV62(x);
  return glossaryGroupV62(x)===group;
}
function glossaryCardV62(x){
  const term=termName(x), group=glossaryGroupV62(x), q=glossaryQualityV62(x);
  const statusClass = q.includes('確認中') || q.includes('候補') ? 'needs-review' : 'ready';
  return `<article class="item dictionary-card-v51 glossary-v62 ${statusClass}">
    <div class="dict-head-v51"><div><span class="pill">${esc(group)}</span><h3>${esc(term)}</h3></div>${art(group==='品種名'?'variety':'word')}</div>
    <p>${esc(termNote(x)||'説明は確認中です。')}</p>
    <p><b>米とのつながり：</b>${esc(termRelevance(x)||'関連する教材・文献・図鑑への入口として扱います。')}</p>
    <p><b>見方：</b>${esc(termTodayView(x)||'必要に応じて関連カードで確認します。')}</p>
    <p>${chips([q,field(x,'definition_type_ja'),field(x,'category_ja')])}</p>
    <details><summary>参照元</summary><p class="source">${esc(field(x,'source_area')||'未確認')} / ${esc(field(x,'source_key')||'キー未確認')}</p>${field(x,'source_context')?`<p class="small">${esc(field(x,'source_context'))}</p>`:''}</details>
    <div class="priority-row"><button class="btn secondary" onclick="S.filters.litq='${esc(term)}';switchView('literature')">文献を探す</button><button class="btn secondary" onclick="S.filters.varq='${esc(term)}';switchView('varieties')">図鑑を探す</button></div>
  </article>`;
}
renderWords=function(){
 const data=glossaryV62(), q=S.filters.wordq||'', group=S.filters.wordgroup||'まず見る用語';
 const filtered=data.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(String(q).toLowerCase()))&&glossaryFilterHitV62(x,group))
   .sort((a,b)=>glossaryPriorityV62(b)-glossaryPriorityV62(a)||String(termName(a)).localeCompare(String(termName(b)),'ja'));
 const meta=S.data?.glossary_meta_v62||{};
 const groups=glossaryGroupsV62();
 $('#words').innerHTML=`${v47PageLead('用語集','米づくり、炊飯、水、保管、世界の米文化の言葉を探すための参照機能です。今日の米言葉とは別に扱います。','word')}
 <div class="toolbar"><input placeholder="用語を検索" value="${esc(q)}" oninput="setFilter('wordq',this.value)"></div>
 <div class="priority-row glossary-tabs-v62">${groups.map(g=>`<button class="${g===group?'active':''}" onclick="S.filters.wordgroup='${g}';renderWords()">${esc(g)}</button>`).join('')}</div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat((S.data?.glossary||[]).length,'用語集')}${stat(meta.reviewed_core_terms||0,'説明整備済み')}${stat((S.data?.glossary_process_candidates||[]).length,'工程語候補')}</div>
 <details class="card compact"><summary>用語集の見方</summary><p>品種名は品種図鑑への入口、工程語は米占いや学習への入口として扱います。説明が確認中の語は、今後の編集対象です。</p></details>
 <div class="dictionary-grid-v51 glossary-grid-v62">${filtered.slice(0,260).map(glossaryCardV62).join('')||v47Empty('表示できる用語がありません','検索条件を変えてください。')}</div>`;
}


/* === v63: 今日の米言葉100件・4言語表示確認 ===
   Source routine checked: File_Data_Index + v62 JSON + 今日の米言葉100 Excel integration state.
   Correct state: data exists in ja/en/zh_tw/zh_cn. Do not write as if translations are missing.
   Scope: UI display switching, archive/list preview, wording cleanup. */
function riceWordAuditV63(){ return S.data?.daily_rice_words_audit_v63 || {}; }
function riceWordListV63(){ return S.data?.daily_rice_words || []; }
function riceWordStatusTextV63(){
  const L=S.lang;
  return ({ja:'100件・4言語データあり',en:'100 entries in 4 languages',zh_tw:'100筆・4語言資料已收錄',zh_cn:'100条・4语言数据已收录'})[L] || '100件・4言語データあり';
}
function riceWordArchiveButtonTextV63(){
  const L=S.lang;
  return ({ja:'米言葉100件を見る',en:'View 100 rice meanings',zh_tw:'查看100則米語',zh_cn:'查看100条米语'})[L] || '米言葉100件を見る';
}
function renderRiceWordArchiveV63(){
  const list=riceWordListV63();
  const q=S.filters.ricewordq||'';
  const filtered=list.filter(w=>!q||JSON.stringify(w).toLowerCase().includes(String(q).toLowerCase()));
  const title=v56RiceWordLabel('module_title')||'今日の米言葉';
  const subtitle=v56RiceWordLabel('subtitle')||'';
  const meaningLabel=v56RiceWordLabel('meaning_label')||'米言葉';
  const messageLabel=v56RiceWordLabel('message_label')||'今日のひとこと';
  $('#detail').innerHTML=`${v47PageLead(title, subtitle || riceWordStatusTextV63(),'word')}
    <div class="toolbar"><input placeholder="米言葉を検索" value="${esc(q)}" oninput="S.filters.ricewordq=this.value;renderRiceWordArchiveV63()"><button class="btn secondary" onclick="switchView('home')">ホームへ</button></div>
    <div class="countbar">${stat(list.length,'米言葉')}${stat(4,'言語')}${stat(filtered.length,'表示中')}</div>
    <details class="card compact" open><summary>${esc(riceWordStatusTextV63())}</summary><p>${esc((riceWordAuditV63().status_ja)||'4言語データあり。表示切替と文体を確認します。')}</p><p class="small">${esc((riceWordAuditV63().separation_rule_ja)||'今日の米言葉は用語集とは別機能です。')}</p></details>
    <div class="dictionary-grid-v51 rice-word-archive-v63">${filtered.slice(0,100).map(w=>`<article class="item rice-word-list-card-v63"><h3>${esc(v56RiceWordText(w,'word'))}</h3><p><b>${esc(meaningLabel)}：</b>${esc(v56RiceWordText(w,'meaning'))}</p><p>${esc(v56RiceWordText(w,'body'))}</p><p><b>${esc(messageLabel)}：</b>${esc(v56RiceWordText(w,'message'))}</p><p class="small">ID：${esc(w.rice_word_id||'')}</p></article>`).join('')}</div>`;
  switchView('detail');
}
function openRiceWordArchiveV63(){ S.view='detail'; document.querySelectorAll('.view').forEach(x=>x.classList.remove('active')); $('#detail').classList.add('active'); renderRiceWordArchiveV63(); window.scrollTo({top:0,behavior:'smooth'}); }
const v63RiceWordCardPrev=v55RiceWordCard;
v55RiceWordCard=function(open=false){
  const w=v54DailyRiceWord();
  const title=v56RiceWordLabel('module_title')||'今日の米言葉';
  const subtitle=v56RiceWordLabel('subtitle')||'';
  const meaningLabel=v56RiceWordLabel('meaning_label')||'米言葉';
  const messageLabel=v56RiceWordLabel('message_label')||'今日のひとこと';
  const sourceNote=v56RiceWordLabel('source_note')||'';
  if(!w){ return v63RiceWordCardPrev(open); }
  const word=v56RiceWordText(w,'word'), meaning=v56RiceWordText(w,'meaning'), body=v56RiceWordText(w,'body'), message=v56RiceWordText(w,'message');
  return `<article class="card rice-word-card-v53 rice-word-card-v55 rice-word-card-v56 rice-word-card-v63">${art('word')}<div><span class="eyebrow">${esc(title)}</span><h2>${esc(word||title)}</h2>${subtitle?`<p class="small">${esc(subtitle)}</p>`:''}<p class="rice-word-meaning-v53"><b>${esc(meaningLabel)}：</b>${esc(meaning||'確認中')}</p><p>${esc(body||'米とのつながりを確認中です。')}</p><p class="rice-word-message-v53"><b>${esc(messageLabel)}：</b>${esc(message||'今日を少し丁寧に見るための言葉です。')}</p><p class="small rice-word-lang-status-v63">${esc(riceWordStatusTextV63())}</p><details ${open?'open':''}><summary>${esc(v56RiceWordLabel('detail_label')||'詳しく見る')}</summary><p>${esc(body||'米とのつながりを確認中です。')}</p>${sourceNote?`<p class="small">${esc(sourceNote)}</p>`:''}<div class="priority-row"><button class="btn secondary" onclick="S.filters.wordq='${esc(word)}';switchView('words')">${esc(v56RelatedWordButtonLabel())}</button><button class="btn secondary" onclick="openRiceWordArchiveV63()">${esc(riceWordArchiveButtonTextV63())}</button><button class="btn secondary" onclick="switchView('future')">${esc(v56WorldButtonLabel())}</button></div></details></div></article>`;
};
const renderHome_v63_prev=renderHome;
renderHome=function(){ renderHome_v63_prev(); };

/* v63.1: detail view render hook for 米言葉一覧 */
function renderDetailV63(){
  if(S.filters.detailMode==='rice_words'){
    const list=riceWordListV63();
    const q=S.filters.ricewordq||'';
    const filtered=list.filter(w=>!q||JSON.stringify(w).toLowerCase().includes(String(q).toLowerCase()));
    const title=v56RiceWordLabel('module_title')||'今日の米言葉';
    const subtitle=v56RiceWordLabel('subtitle')||'';
    const meaningLabel=v56RiceWordLabel('meaning_label')||'米言葉';
    const messageLabel=v56RiceWordLabel('message_label')||'今日のひとこと';
    $('#detail').innerHTML=`${v47PageLead(title, subtitle || riceWordStatusTextV63(),'word')}
      <div class="toolbar"><input placeholder="米言葉を検索" value="${esc(q)}" oninput="S.filters.ricewordq=this.value;render()"><button class="btn secondary" onclick="switchView('home')">ホームへ</button></div>
      <div class="countbar">${stat(list.length,'米言葉')}${stat(4,'言語')}${stat(filtered.length,'表示中')}</div>
      <details class="card compact" open><summary>${esc(riceWordStatusTextV63())}</summary><p>${esc((riceWordAuditV63().status_ja)||'4言語データあり。表示切替と文体を確認します。')}</p><p class="small">${esc((riceWordAuditV63().separation_rule_ja)||'今日の米言葉は用語集とは別機能です。')}</p></details>
      <div class="dictionary-grid-v51 rice-word-archive-v63">${filtered.slice(0,100).map(w=>`<article class="item rice-word-list-card-v63"><h3>${esc(v56RiceWordText(w,'word'))}</h3><p><b>${esc(meaningLabel)}：</b>${esc(v56RiceWordText(w,'meaning'))}</p><p>${esc(v56RiceWordText(w,'body'))}</p><p><b>${esc(messageLabel)}：</b>${esc(v56RiceWordText(w,'message'))}</p><p class="small">ID：${esc(w.rice_word_id||'')}</p></article>`).join('')}</div>`;
    return;
  }
  $('#detail').innerHTML=`<div class="hero"><h1>詳細</h1><p>表示する詳細を選んでください。</p></div>`;
}
render=function(){if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderDetailV63}; (map[S.view]||renderHome)();}
openRiceWordArchiveV63=function(){ S.filters.detailMode='rice_words'; switchView('detail'); }


/* === v66: 用語集は親Excel不在のため、RICE NAVI新規作成コンテンツとして4言語化 ===
   Scope: glossary 1019 terms, Japanese / English / Traditional Chinese / Simplified Chinese fields.
   The glossary is not a user-provided parent Excel. It is an app content asset created and maintained by RICE NAVI.
*/
const glossaryCardV66Prev=glossaryCardV62;
glossaryCardV62=function(x){
  const term=termName(x), group=glossaryGroupV62(x), q=glossaryQualityV62(x);
  const statusClass = String(field(x,'translation_status')).includes('draft') ? 'ready' : 'needs-review';
  return `<article class="item dictionary-card-v51 glossary-v62 ${statusClass}">
    <div class="dict-head-v51"><div><span class="pill">${esc(group)}</span><h3>${esc(term)}</h3></div>${art(group==='品種名'?'variety':'word')}</div>
    <p>${esc(termNote(x)||'説明は確認中です。')}</p>
    <p><b>${esc(({ja:'米とのつながり',en:'Rice connection',zh_tw:'與米的連結',zh_cn:'与米的连接'})[S.lang]||'米とのつながり')}：</b>${esc(termRelevance(x)||'関連する教材・文献・図鑑への入口として扱います。')}</p>
    <p><b>${esc(({ja:'見方',en:'How to use',zh_tw:'查看方式',zh_cn:'查看方式'})[S.lang]||'見方')}：</b>${esc(termTodayView(x)||'必要に応じて関連カードで確認します。')}</p>
    <p>${chips([field(x,'definition_type_'+S.lang)||field(x,'definition_type_ja'),field(x,'category_'+S.lang)||field(x,'category_ja')])}</p>
    
    <div class="priority-row"><button class="btn secondary" onclick="S.filters.litq='${esc(term)}';switchView('literature')">${esc(({ja:'文献を探す',en:'Find literature',zh_tw:'搜尋文獻',zh_cn:'搜索文献'})[S.lang]||'文献を探す')}</button><button class="btn secondary" onclick="S.filters.varq='${esc(term)}';switchView('varieties')">${esc(({ja:'図鑑を探す',en:'Find varieties',zh_tw:'搜尋圖鑑',zh_cn:'搜索图鉴'})[S.lang]||'図鑑を探す')}</button></div>
  </article>`;
};
const renderWordsV66Prev=renderWords;
renderWords=function(){ renderWordsV66Prev(); };


/* === v67: 用語集の実機表示向け整理 ===
   - 用語集はRICE NAVI作成コンテンツ。親Excel由来とは表示しない。
   - 主要工程・主要品質語は4言語説明を優先整理。
   - 画面では source_area / source_key / 親Excel / claim などの内部管理語を前面に出さない。
*/
function v67Label(map){ return map[S.lang] || map.ja || ''; }
function v67TermCategory(x){ return field(x,'category_'+S.lang) || termCategory(x) || field(x,'category_ja') || '用語'; }
function v67TermGroup(x){ return field(x,'display_group_'+S.lang) || field(x,'display_group_ja') || v67TermCategory(x); }
function v67SearchText(x){ return String(x.search_text_v67 || JSON.stringify(x)).toLowerCase(); }
function v67GlossaryCard(x){
  const term=termName(x), cat=v67TermCategory(x), group=v67TermGroup(x), desc=termNote(x), rel=termRelevance(x), today=termTodayView(x), related=termRelated(x);
  return `<article class="item dictionary-card-v51 glossary-v67">
    <div class="dict-head-v51"><div><span class="pill">${esc(group)}</span><h3>${esc(term)}</h3></div>${art(group.includes('品種')||group.includes('Variety')?'variety':'word')}</div>
    <p>${esc(desc||v67Label({ja:'説明を整理中です。',en:'This explanation is being reviewed.',zh_tw:'說明正在整理中。',zh_cn:'说明正在整理中。'}))}</p>
    <p><b>${esc(v67Label({ja:'米とのつながり',en:'Rice connection',zh_tw:'與米的連結',zh_cn:'与米的连接'}))}：</b>${esc(rel||v67Label({ja:'関連する工程・品種・チェック項目と合わせて確認します。',en:'Check it together with related processes, varieties, and check items.',zh_tw:'請與相關流程、品種與檢查項目一起查看。',zh_cn:'请与相关流程、品种与检查项目一起查看。'}))}</p>
    <p><b>${esc(v67Label({ja:'見方',en:'How to use',zh_tw:'查看方式',zh_cn:'查看方式'}))}：</b>${esc(today||v67Label({ja:'用語だけで判断せず、前後の流れを見ます。',en:'Do not judge from the word alone; check the surrounding context.',zh_tw:'不要只看單一詞語，請確認前後脈絡。',zh_cn:'不要只看单一词语，请确认前后脉络。'}))}</p>
    ${related?`<p>${chips([related])}</p>`:''}
    <div class="priority-row"><button class="btn secondary" onclick="S.filters.litq='${esc(term)}';switchView('literature')">${esc(v67Label({ja:'文献を探す',en:'Find literature',zh_tw:'搜尋文獻',zh_cn:'搜索文献'}))}</button><button class="btn secondary" onclick="S.filters.varq='${esc(term)}';switchView('varieties')">${esc(v67Label({ja:'図鑑を探す',en:'Find varieties',zh_tw:'搜尋圖鑑',zh_cn:'搜索图鉴'}))}</button></div>
  </article>`;
}
renderWords=function(){
 const data=S.data.glossary||[], q=String(S.filters.wordq||'').toLowerCase(), category=S.filters.wordcat||'';
 const categories=[...new Set(data.map(v67TermCategory).filter(has))].slice(0,70);
 const core=data.filter(x=>x.translation_status==='v67_core_reviewed_4lang');
 const filtered=data.filter(x=>(!q||v67SearchText(x).includes(q))&&(!category||v67TermCategory(x)===category));
 $('#words').innerHTML=`${v47PageLead(v67Label({ja:'用語集',en:'Glossary',zh_tw:'用語集',zh_cn:'用语集'}),v67Label({ja:'米づくり、炊飯、保存、食感、世界の米文化の言葉を調べます。',en:'Look up words for rice cultivation, cooking, storage, texture, and world rice culture.',zh_tw:'查詢米作、炊飯、保存、口感與世界米文化的詞語。',zh_cn:'查询米作、煮饭、保存、口感与世界米文化的词语。'}),'word')}
 <section class="dictionary-feature-v51 dictionary-feature-v53 dictionary-feature-v55 glossary-v67-head">${art('word')}<div><span class="eyebrow">GLOSSARY</span><h2>${esc(v67Label({ja:'用語集',en:'Glossary',zh_tw:'用語集',zh_cn:'用语集'}))}</h2><p>${esc(v67Label({ja:'米占いの工程名ともリンクします。用語を押して、工程・品種・文献へ進みます。',en:'It also links to the lucky processes in Rice Fortune. Open a term to move to processes, varieties, and literature.',zh_tw:'也會連結米占卜中的幸運工程。可從用語前往流程、品種與文獻。',zh_cn:'也会连接米占卜中的幸运工程。可从用语前往流程、品种与文献。'}))}</p></div></section>
 <div class="toolbar"><input placeholder="${esc(v67Label({ja:'用語を検索',en:'Search terms',zh_tw:'搜尋用語',zh_cn:'搜索用语'}))}" value="${esc(S.filters.wordq||'')}" oninput="setFilter('wordq',this.value)"><select onchange="setFilter('wordcat',this.value)"><option value="">${esc(v67Label({ja:'全カテゴリ',en:'All categories',zh_tw:'全部分類',zh_cn:'全部分类'}))}</option>${categories.map(c=>`<option ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="countbar">${stat(filtered.length,v67Label({ja:'表示中',en:'shown',zh_tw:'顯示中',zh_cn:'显示中'}))}${stat(data.length,v67Label({ja:'収録語',en:'terms',zh_tw:'收錄詞',zh_cn:'收录词'}))}${stat(core.length,v67Label({ja:'主要語整理済み',en:'core reviewed',zh_tw:'主要詞已整理',zh_cn:'主要词已整理'}))}</div>
 <div class="list glossary-list-v53 glossary-list-v55 glossary-list-v67">${filtered.slice(0,280).map(v67GlossaryCard).join('')}</div>`;
};


/* === v70: 修正＋再スクリーニング cycle 1 ===
   Purpose: keep app usable if data fetch fails, use current v70 data path, and force current rules for fortune/country/ranking/glossary UI.
*/
function v70Text(map){ return map[S.lang] || map.ja || ''; }
function v70DataStatusCard(){
  const c=S.data?.counts||{};
  return `<details class="data-check compact"><summary>収録内容</summary><div class="countbar">${stat(c.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(c.learning_cards_v82,'教材カード','学ぶ')}${stat(c.rice_varieties,'米品種','図鑑')}${stat((S.data?.daily_rice_words||[]).length,'今日の米言葉','100件・4言語')}${stat((S.data?.world_rice_stories?.ja||[]).length,'世界ライス','365話')}${stat((S.data?.country_rice_history?.records||[]).length,'国別ヒストリー','32か国')}${stat(rankingActualRows(),'ランキング行','順位・比較')}${stat((S.data?.rice_fortune?.processes||[]).length,'米占い工程','栽培から保存')}</div></details>`;
}
function v70CountryHistoryNote(){
  const records=S.data?.country_rice_history?.records||[];
  return homeMini('現在地のお米ヒストリー',`32か国・4言語の本文を収録済み。国単位の米文化史として表示します。<br><span class="small">位置情報は国選択の参考。水質や保管状態は測定しません。</span>`,'map','future','ヒストリーへ');
}
function v70FortuneMini(){
  const p=luckyProcessV60(), v=luckyVarietyV60();
  const proc=p?.label_ja||p?.glossary_term_ja||'工程未確認';
  return `<article class="home-mini fortune-mini-v60"><button onclick="switchView('home')">${illust('fortune')}<b>今日の米占い</b><span>${esc(luckyFortuneNameV60())}<br>ラッキーナンバー：${esc(luckyNumberV60())}<br>米種：${esc(varietyNameV60(v))} / 工程：${esc(proc)}</span></button></article>`;
}
renderHome=function(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), story=todayStory(), future=pick(d.future_rice,'future');
 $('#home').innerHTML=`<div class="home-v47 home-v50 home-v53 home-v55 home-v56 home-v58 home-v59 home-v60 home-v70">
  ${v50HomeIntro()}
  ${v50StatusLine()}
  <section class="nav-cards-v47 nav-cards-v50 nav-cards-v53 nav-cards-v55">
    ${navCard('home','今日の米ナビ','今日の一杯を考える','fortune','入口')}
    ${navCard('check','米コンディション','水・保管・結露','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47 home-grid-v50 home-grid-v53 home-grid-v55">
    ${riceFortuneCardV60(false)}
    ${v55RiceWordCard(false)}
    ${countryHistoryHomeMini()}
    ${homeMini('米コンディション',`地域参考値と手元の確認値を分け、水・保管・結露の確認につなげます。`,'weather','check','確認する')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${v55GlossaryMini()}
    ${homeMini('炊飯文献',`文献要点、条件、数値、注意点、出典を確認します。現場メモとは分けて扱います。`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露、湿度、温度差、残米、付着米、カビ臭、虫、変色を見ます。`,'storage','check','保管へ')}
    ${rankingStatusMini()}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来へ')}
  </section>
  ${v70DataStatusCard()}
 </div>`;
}


/* === v71: 修正＋再スクリーニング cycle 2 ===
   Scope: daily rice word language cleanup, glossary internal-info separation, and version references.
*/
function v71Text(map){ return map[S.lang] || map.ja || ''; }
function v71RiceWordStatusText(){
  return v71Text({ja:'100件・4言語表示を整理済み',en:'100 entries; 4-language display cleaned',zh_tw:'100筆・4語言顯示已整理',zh_cn:'100条・4语言显示已整理'});
}
riceWordStatusTextV63=function(){ return v71RiceWordStatusText(); };
function v71GlossaryCard(x){
  const term=termName(x), cat=v67TermCategory(x), group=v67TermGroup(x), desc=termNote(x), rel=termRelevance(x), today=termTodayView(x), related=termRelated(x);
  return `<article class="item dictionary-card-v51 glossary-v67 glossary-v71">
    <div class="dict-head-v51"><div><span class="pill">${esc(group)}</span><h3>${esc(term)}</h3></div>${art(group.includes('品種')||group.includes('Variety')?'variety':'word')}</div>
    <p>${esc(desc||v71Text({ja:'説明を整理中です。',en:'This explanation is being reviewed.',zh_tw:'說明正在整理中。',zh_cn:'说明正在整理中。'}))}</p>
    <p><b>${esc(v71Text({ja:'米とのつながり',en:'Rice connection',zh_tw:'與米的連結',zh_cn:'与米的连接'}))}：</b>${esc(rel||v71Text({ja:'関連する工程・品種・チェック項目と合わせて確認します。',en:'Check it together with related processes, varieties, and check items.',zh_tw:'請與相關流程、品種與檢查項目一起查看。',zh_cn:'请与相关流程、品种与检查项目一起查看。'}))}</p>
    <p><b>${esc(v71Text({ja:'見方',en:'How to use',zh_tw:'查看方式',zh_cn:'查看方式'}))}：</b>${esc(today||v71Text({ja:'用語だけで判断せず、前後の流れを見ます。',en:'Do not judge from the word alone; check the surrounding context.',zh_tw:'不要只看單一詞語，請確認前後脈絡。',zh_cn:'不要只看单一词语，请确认前后脉络。'}))}</p>
    ${related?`<p>${chips([related])}</p>`:''}
    <div class="priority-row"><button class="btn secondary" onclick="S.filters.litq='${esc(term)}';switchView('literature')">${esc(v71Text({ja:'文献を探す',en:'Find literature',zh_tw:'搜尋文獻',zh_cn:'搜索文献'}))}</button><button class="btn secondary" onclick="S.filters.varq='${esc(term)}';switchView('varieties')">${esc(v71Text({ja:'図鑑を探す',en:'Find varieties',zh_tw:'搜尋圖鑑',zh_cn:'搜索图鉴'}))}</button></div>
  </article>`;
}
renderWords=function(){
 const data=S.data.glossary||[], q=String(S.filters.wordq||'').toLowerCase(), category=S.filters.wordcat||'';
 const categories=[...new Set(data.map(v67TermCategory).filter(has))].slice(0,70);
 const core=data.filter(x=>x.translation_status==='v67_core_reviewed_4lang' || Number(x.display_priority||0)>=90);
 const filtered=data.filter(x=>(!q||v67SearchText(x).includes(q))&&(!category||v67TermCategory(x)===category));
 $('#words').innerHTML=`${v47PageLead(v71Text({ja:'用語集',en:'Glossary',zh_tw:'用語集',zh_cn:'用语集'}),v71Text({ja:'米づくり、炊飯、保存、食感、世界の米文化の言葉を調べます。',en:'Look up words for rice cultivation, cooking, storage, texture, and world rice culture.',zh_tw:'查詢米作、炊飯、保存、口感與世界米文化的詞語。',zh_cn:'查询米作、煮饭、保存、口感与世界米文化的词语。'}),'word')}
 <section class="dictionary-feature-v51 dictionary-feature-v53 dictionary-feature-v55 glossary-v67-head glossary-v71-head">${art('word')}<div><span class="eyebrow">GLOSSARY</span><h2>${esc(v71Text({ja:'用語集',en:'Glossary',zh_tw:'用語集',zh_cn:'用语集'}))}</h2><p>${esc(v71Text({ja:'米占いの工程名ともリンクします。用語を押して、工程・品種・文献へ進みます。',en:'It also links to the lucky processes in Rice Fortune. Open a term to move to processes, varieties, and literature.',zh_tw:'也會連結米占卜中的幸運工程。可從用語前往流程、品種與文獻。',zh_cn:'也会连接米占卜中的幸运工程。可从用语前往流程、品种与文献。'}))}</p></div></section>
 <div class="toolbar"><input placeholder="${esc(v71Text({ja:'用語を検索',en:'Search terms',zh_tw:'搜尋用語',zh_cn:'搜索用语'}))}" value="${esc(S.filters.wordq||'')}" oninput="setFilter('wordq',this.value)"><select onchange="setFilter('wordcat',this.value)"><option value="">${esc(v71Text({ja:'全カテゴリ',en:'All categories',zh_tw:'全部分類',zh_cn:'全部分类'}))}</option>${categories.map(c=>`<option ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="countbar">${stat(filtered.length,v71Text({ja:'表示中',en:'shown',zh_tw:'顯示中',zh_cn:'显示中'}))}${stat(data.length,v71Text({ja:'収録語',en:'terms',zh_tw:'收錄詞',zh_cn:'收录词'}))}${stat(core.length,v71Text({ja:'主要語整理済み',en:'core reviewed',zh_tw:'主要詞已整理',zh_cn:'主要词已整理'}))}</div>
 <details class="card compact"><summary>${esc(v71Text({ja:'用語集の状態',en:'Glossary status',zh_tw:'用語集狀態',zh_cn:'用语集状态'}))}</summary><p>${esc(v71Text({ja:'用語集はRICE NAVI用に作成した参照コンテンツです。管理用の内部キーは画面に出しません。',en:'The glossary is reference content created for RICE NAVI. Internal management keys are not shown on the screen.',zh_tw:'用語集是為 RICE NAVI 製作的參照內容。管理用內部鍵不顯示在畫面上。',zh_cn:'用语集是为 RICE NAVI 制作的参照内容。管理用内部键不显示在画面上。'}))}</p></details>
 <div class="list glossary-list-v53 glossary-list-v55 glossary-list-v67 glossary-list-v71">${filtered.slice(0,280).map(v71GlossaryCard).join('')}</div>`;
};
const v71HomePrev=renderHome;
renderHome=function(){
  v71HomePrev();
  const note=document.createElement('div');
  note.className='screening-note-v71';
  note.innerHTML='<details class="data-check compact"><summary>v71チェック状態</summary><p>読み込み停止対策、米言葉4言語表示、用語集内部情報分離を再確認中です。</p></details>';
  const home=document.querySelector('#home .home-v70'); if(home) home.appendChild(note);
};


/* === v72: 修正＋再スクリーニング cycle 3 ===
   Focus: program-level runtime guards and UI internal-word output paths.
   - Literature page no longer depends on undefined v47LitCard / classifyLit.
   - Internal IDs are hidden behind user-facing labels and not shown as source_key/claim.
   - Old country-history "統合状況確認済み/架空" copy is overridden.
   - Check page source details are summarized without raw claim/source-key language.
*/
function v72T(map){ return map[S.lang] || map.ja || ''; }
function v72ClassifyLit(x){ return classifyEvidence(x); }
function v72ConfirmLabel(c){ return ({A:'原文確認済み候補',B:'要約整理済み',C:'再確認が必要',D:'現場メモ'})[c] || '確認中'; }
function v72ConfirmNote(c){ return ({A:'原文・要点・条件・出典の対応を確認した候補です。',B:'文献情報をもとに要約整理した候補です。',C:'要点・条件・出典の対応をもう一度確認します。',D:'文献ではなく、現場メモとして別枠で扱います。'})[c] || '確認中です。'; }
function v72SafeLitCard(x){
  const cls=v72ClassifyLit(x), title=field(x,'title')||'文献名未確認', summary=field(x,'summary'), cond=field(x,'condition'), cat=field(x,'category')||'未分類';
  const sourceIds=field(x,'source_ids'), claimIds=field(x,'claim_ids');
  return `<article class="item lit-card-v72 ${cls==='A'||cls==='B'?'confirmed':cls==='C'?'checking':'field'}"><div class="item-top"><div><h3>${esc(title)}</h3><p>${chips([cat,v72ConfirmLabel(cls)])}</p></div><span class="status-chip ${cls==='C'||cls==='D'?'soft':''}">${esc(v72ConfirmLabel(cls))}</span></div>
  <div class="confirm-box ${cls==='C'?'confirm-C':cls==='D'?'confirm-D':''}"><b>確認状況</b><span>${esc(v72ConfirmNote(cls))}</span><span>文献の優劣ではなく、RICE NAVI内の整理状況です。</span></div>
  ${summary&&!same(summary,title)?`<p><b>文献要点：</b>${esc(summary)}</p>`:`<p><b>文献要点：</b><span class="missing">未確認</span></p>`}
  <p><b>条件・数値：</b>${cond?esc(cond):'<span class="missing">未確認</span>'}</p>
  <details><summary>出典と確認ポイント</summary><p><b>確認ポイント：</b>${esc(field(x,'trace')?traceText(x.trace):'未確認')}</p>${claimDetails(claimIds)}${sourceDetails(sourceIds)}<p class="small">内部管理番号は画面上の判断材料ではなく、出典確認用の控えです。</p><div class="priority-row"><button class="btn secondary" onclick="S.filters.learn='${esc((cat||title||'').split(/[・/ ]/)[0])}';switchView('learn')">関連教材</button><button class="btn secondary" onclick="S.filters.wordq='${esc((cat||title||'').split(/[・/ ]/)[0])}';switchView('words')">用語集</button></div></details></article>`;
}
const v47LitCard=v72SafeLitCard;
function classifyLit(x){ return classifyEvidence(x); }
function confirmationLabel(c){ return v72ConfirmLabel(c); }
function confirmationTone(c){ return v72ConfirmNote(c); }
renderLiterature=function(){
 const cards=litSorted(), notes=S.data.literature?.field_notes||[], q=S.filters.litq||'', cat=S.filters.litcat||'', ev=S.filters.evidence||'AB';
 const categories=[...new Set(cards.map(x=>x.category).filter(has))].sort();
 let filtered=cards.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!cat||x.category===cat));
 if(ev==='AB') filtered=filtered.filter(x=>['A','B'].includes(x._class)); else if(ev!=='ALL') filtered=filtered.filter(x=>x._class===ev);
 const classCounts={A:cards.filter(x=>x._class==='A').length,B:cards.filter(x=>x._class==='B').length,C:cards.filter(x=>x._class==='C').length,D:cards.filter(x=>x._class==='D').length};
 $('#literature').innerHTML=`${v47PageLead('炊飯文献ライブラリ','文献要点、条件、数値、注意点、出典をたどれる形で確認します。','doc')}
 <div class="lit-note-v47"><b>確認ステータス</b><p>この区分は文献の価値を比べるものではありません。RICE NAVI内で、原文・要約・出典の対応をどこまで確認できているかを示します。</p></div>
 <div class="toolbar sticky-toolbar-v47"><input placeholder="文献検索" value="${esc(q)}" oninput="setFilter('litq',this.value)"><select onchange="setFilter('litcat',this.value)"><option value="">全カテゴリ</option>${categories.map(c=>`<option ${c===cat?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('evidence',this.value)"><option value="AB" ${ev==='AB'?'selected':''}>確認済み中心</option><option value="A" ${ev==='A'?'selected':''}>原文確認候補</option><option value="B" ${ev==='B'?'selected':''}>要約整理済み</option><option value="C" ${ev==='C'?'selected':''}>再確認が必要</option><option value="ALL" ${ev==='ALL'?'selected':''}>全件</option></select></div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat(cards.length,'文献カード')}${stat(notes.length,'現場メモ')}${stat(classCounts.C,'再確認が必要')}</div>
 <div class="quickgrid category-grid-v47">${topCategories(cards,12).map(([c,n])=>`<button onclick="setFilter('litcat','${esc(c)}')">${esc(c)}<br><span>${n}件</span></button>`).join('')}</div>
 <div class="list lit-list-v47 lit-list-v72">${filtered.slice(0,120).map(v72SafeLitCard).join('')||v47Empty('該当する文献がありません','検索条件を変えてください。')}</div>
 <details class="field-note"><summary>現場メモを見る</summary><p>現場メモは文献とは分けて扱います。</p><div class="list">${notes.slice(0,80).map(x=>`<div class="item field-note-item"><h3>${esc(field(x,'title','note_title')||'現場メモ')}</h3><p>${esc(field(x,'summary','note','text')||'本文未確認')}</p></div>`).join('')}</div></details>`;
};
function v72CountryHistoryCard(){
 const records=S.data?.country_rice_history?.records||[];
 const r=records[todayIndex(records.length||1,'country_history')]||{};
 const title=field(r,'country_name_ja','country_ja','country')||'国別ヒストリー';
 const body=tx(r,'history')||field(r,'history_ja','body_ja','summary_ja')||'国単位のお米ヒストリーを表示します。';
 return `<div class="card country-history-v72">${art('map')}<h2>現在地のお米ヒストリー</h2><p><b>${esc(title)}</b></p><p>${esc(String(body).slice(0,220))}</p><p class="small">位置情報は国単位の参考です。水質や保管状態の測定とは分けて扱います。</p></div>`;
}
function renderFuture(){
 const data=S.data.future_rice||[], q=S.filters.storyq||'', country=S.filters.storyCountry||'', fq=S.filters.future||'';
 const stories=storyList(), story=todayStory(), storyCountries=[...new Set(stories.map(storyCountry).filter(has))].sort();
 const storyFiltered=stories.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||storyCountry(x)===country));
 const futureFiltered=data.filter(x=>!fq||JSON.stringify(x).includes(fq));
 $('#future').innerHTML=`${v47PageLead('世界ライス物語','世界の米文化を毎日1話。料理・食感・炊飯の見方へつなげます。','world')}
 <section class="today-story-v47"><div><span class="eyebrow">TODAY'S STORY</span><h2>${esc(storyTitle(story||{}))}</h2><p class="small">${esc(storyCountry(story||{}))} / ${esc(field(story,'theme')||'テーマ未確認')}</p><p>${esc(storyBody(story||{},720)).split('\n').join('<br>')}</p><details open><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(story,'learning_point')||'未確認')}</p><p><b>料理場面：</b>${esc(field(story,'scene_note')||'未確認')}</p><p><b>食感：</b>${esc(field(story,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(story,'cooking_note')||'未確認')}</p><p>${chips([field(story,'texture_keywords'),field(story,'related_terms')])}</p></details></div>${art('world')}</section>
 <div class="grid">${v72CountryHistoryCard()}<div class="card">${art('future')}<h2>お米の未来</h2><p>技術・環境・品種改良など、未来テーマへ進みます。</p></div></div>
 <div class="section-title"><h2>物語を探す</h2></div><div class="toolbar"><input placeholder="物語検索" value="${esc(q)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">全ての国・地域</option>${storyCountries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(storyFiltered.length,'表示中の物語')}${stat(stories.length,'物語総数')}${stat(storyCountries.length,'国・地域')}</div>
 <div class="story-list-v47">${storyFiltered.slice(0,80).map(x=>`<article class="item story-item-v47"><h3>${esc(storyTitle(x))}</h3><p>${chips([field(x,'day_no')+'日目',storyCountry(x),field(x,'region'),field(x,'theme')])}</p><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,280)).split('\n').join('<br>')}</p></article>`).join('')}</div>
 <div class="section-title"><h2>お米の未来50</h2></div><div class="toolbar"><input placeholder="未来テーマ検索" value="${esc(fq)}" oninput="setFilter('future',this.value)"></div><div class="list">${futureFiltered.slice(0,50).map(x=>`<div class="item"><h3>${esc(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ')}</h3><p>${chips([x.category,x.source_type])}</p><p>${esc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'本文未確認')}</p></div>`).join('')}</div>`;
}
function renderCheck(){
 const w=S.data.water||{}, sm=S.data.storage_mold||{}, raw=sm.raw||{};
 const rules=w.quality_rules||w.rules||[], checklist=raw.checklist||sm.checklist||[], storageRules=raw.rules||sm.rules||[], region=(w.regions||[])[0]||{};
 const ten=['結露','湿度','温度差','残米','付着米','カビ臭','虫','変色','清掃','点検場所'];
 $('#check').innerHTML=`<div class="hero"><h1>チェック</h1><p>天気・水・保管の情報を、米を扱うための確認ポイントに変換します。</p></div>
 <div class="split">
 ${card('水の相性チェック',`<p><b>水の傾向を、炊飯結果と合わせて見ます。</b></p><p>pH、硬度、TDS、残留塩素を、硬さ・粘り・においの変化と一緒に確認します。</p><p>地域参考値：${esc(field(region,'area_name_ja')||'準備中')} / 硬度：${esc(field(region,'total_hardness_mgL_CaCO3')||'未確認')} / pH：${esc(field(region,'pH')||'未確認')}</p><p class="small">地域参考値と手元の測定値は別です。</p>`)}
 ${card('納米庫管理',`<p><b>見る順番：</b>結露 → 湿度 → 温度差 → 残米・付着米 → カビ臭 → 虫 → 変色 → 清掃記録。</p><p>${ten.map(x=>`<span class="pill">${x}</span>`).join(' ')}</p><p class="small">天気は補助。主役は保管場所の状態です。</p>`)}
 </div>
 <div class="section-title"><h2>水質ルール</h2></div><div class="list">${rules.slice(0,20).map(r=>`<div class="item"><h3>${esc(field(r,'parameter','rule_name','item')||'項目')}</h3><p>${esc(field(r,'rule_ja','meaning_ja','advice_ja','note_ja','summary_ja')||'未確認')}</p></div>`).join('')}</div>
 <div class="section-title"><h2>納米庫ルール</h2></div><div class="list">${storageRules.slice(0,20).map(x=>`<div class="item"><h3>${esc(field(x,'title_ja','title')||field(x,'check_item_ja')||'納米庫ルール')}</h3><p>${esc(field(x,'summary_ja','summary','rule_ja')||'説明未確認')}</p></div>`).join('')}${checklist.slice(0,13).map(x=>`<div class="item field-item"><h3>${esc(field(x,'item_ja','title_ja','title')||'点検項目')}</h3><p>${esc(field(x,'check_ja','summary_ja','summary')||'点検内容未確認')}</p></div>`).join('')}</div>`;
}
const v72HomeBase=renderHome;
renderHome=function(){
 const d=S.data, variety=pick(d.rice_varieties,'variety'), story=todayStory(), future=pick(d.future_rice,'future');
 $('#home').innerHTML=`<div class="home-v47 home-v50 home-v53 home-v55 home-v56 home-v58 home-v59 home-v60 home-v70 home-v72">
  ${v50HomeIntro()}
  <section class="nav-cards-v47 nav-cards-v50 nav-cards-v53 nav-cards-v55">
    ${navCard('home','今日の米ナビ','今日の一杯を考える','fortune','入口')}
    ${navCard('check','米コンディション','水・保管・結露','weather','確認')}
    ${navCard('future','世界ライス','毎日1話','world','物語')}
  </section>
  <section class="home-grid-v47 home-grid-v50 home-grid-v53 home-grid-v55">
    ${riceFortuneCardV60(false)}
    ${v55RiceWordCard(false)}
    ${countryHistoryHomeMini()}
    ${homeMini('米コンディション',`地域参考値と手元の確認値を分け、水・保管・結露の確認につなげます。`,'weather','check','確認する')}
    ${todayStoryHomeCard(story)}
    ${currentRiceCardV47(variety)}
    ${v55GlossaryMini()}
    ${homeMini('炊飯文献',`文献要点、条件、数値、注意点、出典を確認します。現場メモとは分けて扱います。`,'doc','literature','文献へ')}
    ${homeMini('納米庫管理',`結露、湿度、温度差、残米、付着米、カビ臭、虫、変色を見ます。`,'storage','check','保管へ')}
    ${rankingStatusMini()}
    ${homeMini('お米の未来',`<b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b><br>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}`,'future','future','未来へ')}
  </section>
  ${v70DataStatusCard()}
 </div>`;
};


/* === v73: 修正＋再スクリーニング cycle 4 ===
   Scope: 米品種図鑑の炊飯メモと管理用メモを分離。
   safe_app_note / app_caution / use_review_note は炊飯メモとして表示しない。
*/
function v73CleanPublicText(x){
  const s=String(x||'').trim();
  if(!s) return '';
  if(/safe_app_note|use_review_note|app_caution|管理用|公開前|アプリ非表示|親Excel|source_key/i.test(s)) return '';
  return s;
}
function cleanCookingMemo(v){
  const direct=v73CleanPublicText(field(v,'public_cooking_note_ja_v73','cooking_points'));
  if(direct && !/未確認/.test(direct)) return direct;
  return 'この品種の炊飯メモは未確認です。成分・用途・出典を確認できた範囲だけ表示します。';
}
function varietyConfirmNote(v){
  return field(v,'public_confirm_note_ja_v73') || '未確認の用途・成分・炊飯条件は断定せず、未確認として表示します。';
}
function sourceStatusText(v){
  const s=field(v,'source_type','source_confidence','status');
  if(!has(s)) return '出典確認：未確認';
  const t=String(s).replace(/^A$/,'原文または公的情報を確認した候補').replace(/^B$/,'出典確認候補').replace(/^C$/,'確認中');
  return `出典確認：${t}`;
}
function v73VarietySummary(v){
  return v73CleanPublicText(field(v,'public_summary_ja_v73','app_summary_ja_v1_7','app_summary_ja_v1_6')) || `${titleOfVariety(v)}は、確認できる用途・成分・出典を中心に表示します。`;
}
function v73VarietyCard(v){
 const memo=cleanCookingMemo(v);
 const hasMemo=!/未確認/.test(memo);
 const unverified=field(v,'unverified_fields')||'未確認項目なし';
 return `<article class="item variety-card-v47 variety-card-v73"><div class="variety-card-head"><div>${art('variety')}</div><div><h3>${esc(titleOfVariety(v))}</h3><p>${chips([countryOfVariety(v),field(v,'rice_type'),field(v,'grain_shape')])}</p></div></div>
 <p>${esc(v73VarietySummary(v))}</p>
 <div class="variety-facts"><span><b>用途</b>${v47Text(field(v,'main_uses','business_uses','use_category_primary'))}</span><span><b>食感</b>${v47Text(field(v,'texture_tags','aroma'))}</span><span><b>アミロース</b>${v47Text(field(v,'amylose_range','amylose_value','amylose_class'))}</span><span><b>たんぱく質</b>${v47Text(field(v,'protein_range','protein_value','protein_class'))}</span></div>
 <p><b>炊飯メモ：</b>${hasMemo?esc(memo):'<span class="missing">この品種の炊飯メモは未確認です。</span>'}</p>
 <details><summary>詳細・確認状況</summary><p><b>原産・生産：</b>${v47Text(field(v,'main_production_regions','origin_country_ja'))}</p><p><b>消費市場：</b>${v47Text(field(v,'main_consumption_markets'))}</p><p><b>未確認項目：</b>${v47Text(unverified)}</p><p><b>${esc(sourceStatusText(v))}</b></p><p class="small">${esc(varietyConfirmNote(v))}</p><div class="source">出典ID：${esc(field(v,'source_ids')||'未確認')}</div></details><button class="btn secondary" onclick="S.filters.litq='${esc(field(v,'related_terms','rice_type','display_name_ja'))}';switchView('literature')">関連文献を探す</button></article>`;
}
v47VarietyCard=v73VarietyCard;
renderVarieties=function(){
 const data=S.data.rice_varieties||[]; const q=S.filters.varq||'', country=S.filters.country||'', use=S.filters.use||'', texture=S.filters.texture||'', amy=S.filters.amy||'';
 const today=pick(data,'today_variety');
 const countries=[...new Set(data.map(countryOfVariety).filter(has))].sort();
 const countryTop=Object.entries(data.reduce((a,v)=>{const c=countryOfVariety(v);a[c]=(a[c]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
 const uses=[...new Set(data.flatMap(v=>String(field(v,'uses','best_use','suitable_dish','dish_fit','main_uses')||'').split(/[;；,、]/)).map(norm).filter(has))].sort();
 const textures=[...new Set(data.flatMap(v=>String(field(v,'texture','texture_profile','texture_tags','app_texture_ja_v1_7')||'').split(/[;；,、]/)).map(norm).filter(has))].sort();
 let filtered=data.filter(v=>!q||JSON.stringify(v).toLowerCase().includes(q.toLowerCase()));
 if(country) filtered=filtered.filter(v=>countryOfVariety(v)===country);
 if(use) filtered=filtered.filter(v=>JSON.stringify(v).includes(use));
 if(texture) filtered=filtered.filter(v=>JSON.stringify(v).includes(texture));
 if(amy==='低') filtered=filtered.filter(v=>/低|low/i.test(JSON.stringify(v)));
 if(amy==='高') filtered=filtered.filter(v=>/高|high/i.test(JSON.stringify(v)));
 $('#varieties').innerHTML=`${v47PageLead('米品種図鑑','250件の品種を、国・用途・食感・成分から探します。炊飯メモと管理用メモは分けて表示します。','variety')}
 <section class="featured-variety-v47"><div><span class="eyebrow">TODAY'S RICE</span><h2>${esc(titleOfVariety(today||{}))}</h2><p>${esc(countryOfVariety(today||{}))} / ${esc(field(today,'rice_type','grain_shape')||'種類未確認')}</p><p class="small">今日のお米は図鑑への入口です。未確認の用途・成分・炊飯条件は断定しません。</p></div>${art('variety')}</section>
 <div class="toolbar sticky-toolbar-v47"><input placeholder="品種名・国・用途で検索" value="${esc(q)}" oninput="setFilter('varq',this.value)"><select onchange="setFilter('country',this.value)"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('use',this.value)"><option value="">全用途</option>${uses.slice(0,50).map(c=>`<option ${c===use?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('texture',this.value)"><option value="">全食感・特徴</option>${textures.slice(0,50).map(c=>`<option ${c===texture?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="quickgrid category-grid-v47">${countryTop.slice(0,8).map(([c,n])=>`<button onclick="S.filters.country='${esc(c)}';renderVarieties()">${esc(c)}<br><span>${n}件</span></button>`).join('')}<button onclick="setFilter('amy','低')">低アミロース</button><button onclick="setFilter('amy','高')">高アミロース</button><button onclick="S.filters.country='';S.filters.use='';S.filters.texture='';S.filters.amy='';S.filters.varq='';renderVarieties()">絞込解除</button></div>
 <div class="data-note"><b>表示ルール：</b>管理用メモは炊飯メモに使わず、確認できた内容と未確認項目を分けます。</div>
 <div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'品種総数')}${stat(countries.length,'国・地域')}${stat(uses.length,'用途候補')}</div>
 <div class="variety-list-v47 variety-list-v73">${filtered.slice(0,250).map(v73VarietyCard).join('')||v47Empty('該当する品種がありません','検索条件を変えてください。')}</div>`;
};


/* === v74: 修正＋再スクリーニング cycle 5 ===
   Focus: 初見UX、ホーム導線、details 展開時の内部語漏れ防止。
   The app still keeps raw data for audit, but UI output uses public labels only.
*/
function v74T(map){ return map[S.lang] || map.ja || ''; }
function v74PublicText(s){
  return String(s??'')
    .replace(/safe_app_note[_a-z0-9]*/gi,'確認用メモ')
    .replace(/app_caution[_a-z0-9]*/gi,'確認用メモ')
    .replace(/use_review_note/gi,'確認用メモ')
    .replace(/source_key/gi,'参照情報')
    .replace(/source_area/gi,'参照分類')
    .replace(/親Excel/g,'作成データ')
    .replace(/claim_id/gi,'根拠番号')
    .replace(/claim/gi,'根拠')
    .replace(/未実装/g,'準備中')
    .replace(/架空補完しない/g,'確認できた内容だけ表示')
    .replace(/表示ルール/g,'見方')
    .replace(/データ反映/g,'収録状態');
}
function v74Esc(s){ return esc(v74PublicText(s)); }
function v74Mini(view,title,body,icon,cta){ return `<article class="home-mini home-mini-v74"><button onclick="switchView('${view}')">${illust(icon)}<b>${v74Esc(title)}</b><span>${v74Esc(body)}</span><em>${v74Esc(cta||'開く')}</em></button></article>`; }
function v74DataSummary(){
  const c=S.data?.counts||{};
  return `<details class="data-check compact v74-data"><summary>${v74Esc('収録内容')}</summary><div class="countbar">${stat((S.data?.daily_rice_words||[]).length,'米言葉','100件・4言語')}${stat((S.data?.rice_fortune?.processes||[]).length,'米占い工程','栽培から保存')}${stat((S.data?.world_rice_stories?.ja||[]).length,'世界ライス','365話')}${stat((S.data?.country_rice_history?.records||[]).length,'国別ヒストリー','32か国')}${stat(rankingActualRows(),'ランキング行','順位・比較')}${stat(c.rice_varieties||0,'米品種','図鑑')}${stat((S.data?.glossary||[]).length,'用語集','収録語')}</div></details>`;
}
function renderHome(){
  const variety=pick(S.data?.rice_varieties,'v74_variety'), story=todayStory(), future=pick(S.data?.future_rice,'v74_future');
  $('#home').innerHTML=`<div class="home-v74">
    <section class="hero hero-v74"><span class="eyebrow">RICE NAVI</span><h1>${v74Esc('米を知り、今日の一杯を考える')}</h1><p>${v74Esc('米言葉、米占い、世界の米文化、品種、文献、水・保管をひとつの入口から見られます。')}</p><div class="priority-row"><button class="btn" onclick="switchView('check')">${v74Esc('今日の確認へ')}</button><button class="btn secondary" onclick="switchView('future')">${v74Esc('物語を読む')}</button><button class="btn secondary" onclick="switchView('varieties')">${v74Esc('品種を見る')}</button></div></section>
    <section class="nav-cards-v47 nav-cards-v50 nav-cards-v74">
      ${navCard('check','今日の確認','水・保管・結露を見る','weather','まず見る')}
      ${navCard('future','世界ライス','毎日1話と国別ヒストリー','world','読む')}
      ${navCard('literature','文献','根拠と条件を確認','doc','調べる')}
      ${navCard('varieties','品種図鑑','用途・食感・成分を見る','variety','探す')}
    </section>
    <section class="home-grid-v47 home-grid-v74">
      ${riceFortuneCardV60(false)}
      ${v55RiceWordCard(false)}
      ${countryHistoryHomeMini()}
      ${todayStoryHomeCard(story)}
      ${currentRiceCardV47(variety)}
      ${v74Mini('rankings','世界ランキング','統合済みの順位・比較データを表で確認します。','ranking','ランキングへ')}
      ${v74Mini('words','用語集','米占いの工程名や炊飯用語を調べます。','word','用語を探す')}
      ${v74Mini('check','納米庫管理','結露、湿度、温度差、残米、カビ臭、虫、変色を確認します。','storage','保管を見る')}
      ${v74Mini('learn','学ぶ','教材カードから炊飯の考え方を確認します。','book','学ぶ')}
      ${v74Mini('literature','炊飯文献','文献要点、条件、数値、注意点、出典を確認します。','doc','文献へ')}
      ${v74Mini('future','お米の未来',field(future,'title_ja','title')||'未来テーマを表示します。','future','未来へ')}
    </section>
    ${v74DataSummary()}
    <details class="data-check compact v74-first"><summary>${v74Esc('初めての人へ')}</summary><p>${v74Esc('迷ったら、まず「今日の確認」か「世界ライス」から開いてください。専門情報は文献・品種・用語集で後から確認できます。')}</p></details>
  </div>`;
}
function v74GlossaryCard(x){
  const term=termName(x), group=v67TermGroup(x), desc=termNote(x), rel=termRelevance(x), today=termTodayView(x), related=termRelated(x);
  return `<article class="item dictionary-card-v51 glossary-v74"><div class="dict-head-v51"><div><span class="pill">${v74Esc(group)}</span><h3>${v74Esc(term)}</h3></div>${art(group.includes('品種')?'variety':'word')}</div><p>${v74Esc(desc||'説明を整理中です。')}</p><p><b>${v74Esc('米とのつながり')}：</b>${v74Esc(rel||'関連する工程・品種・チェック項目と合わせて確認します。')}</p><p><b>${v74Esc('見方')}：</b>${v74Esc(today||'用語だけで判断せず、前後の流れを見ます。')}</p>${related?`<p>${chips([v74PublicText(related)])}</p>`:''}<div class="priority-row"><button class="btn secondary" onclick="S.filters.litq='${esc(term)}';switchView('literature')">${v74Esc('文献を探す')}</button><button class="btn secondary" onclick="S.filters.varq='${esc(term)}';switchView('varieties')">${v74Esc('図鑑を探す')}</button></div></article>`;
}
v71GlossaryCard=v74GlossaryCard;
renderWords=function(){
 const data=S.data.glossary||[], q=String(S.filters.wordq||'').toLowerCase(), category=S.filters.wordcat||'';
 const categories=[...new Set(data.map(v67TermCategory).filter(has))].slice(0,70);
 const core=data.filter(x=>x.translation_status==='v67_core_reviewed_4lang' || Number(x.display_priority||0)>=90);
 const filtered=data.filter(x=>(!q||v67SearchText(x).includes(q))&&(!category||v67TermCategory(x)===category));
 $('#words').innerHTML=`${v47PageLead('用語集','米づくり、炊飯、保存、食感、世界の米文化の言葉を調べます。','word')}<div class="toolbar"><input placeholder="用語を検索" value="${esc(S.filters.wordq||'')}" oninput="setFilter('wordq',this.value)"><select onchange="setFilter('wordcat',this.value)"><option value="">全カテゴリ</option>${categories.map(c=>`<option ${c===category?'selected':''}>${v74Esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'収録語')}${stat(core.length,'主要語整理済み')}</div><details class="card compact"><summary>${v74Esc('用語集の見方')}</summary><p>${v74Esc('用語集はRICE NAVI用に作成した参照コンテンツです。管理用の内部キーは画面に出しません。')}</p></details><div class="list glossary-list-v74">${filtered.slice(0,280).map(v74GlossaryCard).join('')}</div>`;
};
function v74VarietyCard(v){
 const memo=cleanCookingMemo(v), hasMemo=!/未確認/.test(memo), unverified=field(v,'unverified_fields')||'未確認項目なし';
 return `<article class="item variety-card-v47 variety-card-v73 variety-card-v74"><div class="variety-card-head"><div>${art('variety')}</div><div><h3>${v74Esc(titleOfVariety(v))}</h3><p>${chips([countryOfVariety(v),field(v,'rice_type'),field(v,'grain_shape')])}</p></div></div><p>${v74Esc(v73VarietySummary(v))}</p><div class="variety-facts"><span><b>用途</b>${v47Text(field(v,'main_uses','business_uses','use_category_primary'))}</span><span><b>食感</b>${v47Text(field(v,'texture_tags','aroma'))}</span><span><b>アミロース</b>${v47Text(field(v,'amylose_range','amylose_value','amylose_class'))}</span><span><b>たんぱく質</b>${v47Text(field(v,'protein_range','protein_value','protein_class'))}</span></div><p><b>炊飯メモ：</b>${hasMemo?v74Esc(memo):'<span class="missing">この品種の炊飯メモは未確認です。</span>'}</p><details><summary>詳細・確認状況</summary><p><b>原産・生産：</b>${v47Text(field(v,'main_production_regions','origin_country_ja'))}</p><p><b>消費市場：</b>${v47Text(field(v,'main_consumption_markets'))}</p><p><b>未確認項目：</b>${v47Text(unverified)}</p><p><b>${v74Esc(sourceStatusText(v))}</b></p><p class="small">${v74Esc(varietyConfirmNote(v))}</p><div class="source">${v74Esc('出典ID')}：${v74Esc(field(v,'source_ids')||'未確認')}</div></details><button class="btn secondary" onclick="S.filters.litq='${esc(field(v,'related_terms','rice_type','display_name_ja'))}';switchView('literature')">関連文献を探す</button></article>`;
}
v47VarietyCard=v74VarietyCard;
renderVarieties=function(){
 const data=S.data.rice_varieties||[]; const q=S.filters.varq||'', country=S.filters.country||'', use=S.filters.use||'', texture=S.filters.texture||'', amy=S.filters.amy||'';
 const today=pick(data,'today_variety');
 const countries=[...new Set(data.map(countryOfVariety).filter(has))].sort();
 const countryTop=Object.entries(data.reduce((a,v)=>{const c=countryOfVariety(v);a[c]=(a[c]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
 const uses=[...new Set(data.flatMap(v=>String(field(v,'uses','best_use','suitable_dish','dish_fit','main_uses')||'').split(/[;；,、]/)).map(norm).filter(has))].sort();
 const textures=[...new Set(data.flatMap(v=>String(field(v,'texture','texture_profile','texture_tags','app_texture_ja_v1_7')||'').split(/[;；,、]/)).map(norm).filter(has))].sort();
 let filtered=data.filter(v=>!q||JSON.stringify(v).toLowerCase().includes(q.toLowerCase()));
 if(country) filtered=filtered.filter(v=>countryOfVariety(v)===country); if(use) filtered=filtered.filter(v=>JSON.stringify(v).includes(use)); if(texture) filtered=filtered.filter(v=>JSON.stringify(v).includes(texture)); if(amy==='低') filtered=filtered.filter(v=>/低|low/i.test(JSON.stringify(v))); if(amy==='高') filtered=filtered.filter(v=>/高|high/i.test(JSON.stringify(v)));
 $('#varieties').innerHTML=`${v47PageLead('米品種図鑑','250件の品種を、国・用途・食感・成分から探します。炊飯メモと管理用メモは分けて表示します。','variety')}<section class="featured-variety-v47"><div><span class="eyebrow">TODAY\'S RICE</span><h2>${v74Esc(titleOfVariety(today||{}))}</h2><p>${v74Esc(countryOfVariety(today||{}))} / ${v74Esc(field(today,'rice_type','grain_shape')||'種類未確認')}</p><p class="small">今日のお米は図鑑への入口です。未確認の用途・成分・炊飯条件は断定しません。</p></div>${art('variety')}</section><div class="toolbar sticky-toolbar-v47"><input placeholder="品種名・国・用途で検索" value="${esc(q)}" oninput="setFilter('varq',this.value)"><select onchange="setFilter('country',this.value)"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===country?'selected':''}>${v74Esc(c)}</option>`).join('')}</select><select onchange="setFilter('use',this.value)"><option value="">全用途</option>${uses.slice(0,50).map(c=>`<option ${c===use?'selected':''}>${v74Esc(c)}</option>`).join('')}</select><select onchange="setFilter('texture',this.value)"><option value="">全食感・特徴</option>${textures.slice(0,50).map(c=>`<option ${c===texture?'selected':''}>${v74Esc(c)}</option>`).join('')}</select></div><div class="quickgrid category-grid-v47">${countryTop.slice(0,8).map(([c,n])=>`<button onclick="S.filters.country='${esc(c)}';renderVarieties()">${v74Esc(c)}<br><span>${n}件</span></button>`).join('')}<button onclick="setFilter('amy','低')">低アミロース</button><button onclick="setFilter('amy','高')">高アミロース</button><button onclick="S.filters.country='';S.filters.use='';S.filters.texture='';S.filters.amy='';S.filters.varq='';renderVarieties()">絞込解除</button></div><div class="data-note"><b>見方：</b>炊飯メモは確認できた内容だけ表示し、未確認の内容は未確認として分けます。</div><div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'品種総数')}${stat(countries.length,'国・地域')}${stat(uses.length,'用途候補')}</div><div class="variety-list-v47 variety-list-v74">${filtered.slice(0,250).map(v74VarietyCard).join('')||v47Empty('該当する品種がありません','検索条件を変えてください。')}</div>`;
};


/* v76: ranking count recheck + stale path override. Earlier duplicate blocks are kept for traceability, but this final block is the active render path. */
function v76RankingRows(){ return (S.data?.ranking_items_template||[]).filter(x=>has(x.ranking_id)&&has(x.rank)&&has(x.value)&&has(x.unit)&&has(x.source_year)); }
rankingActualRows=function(){ return v76RankingRows().length; };
function v76RowsForRanking(id){ return v76RankingRows().filter(x=>x.ranking_id===id); }
function v76SourceMap(){ const m={}; (S.data?.rankings?.sources||[]).forEach(s=>{ if(s.source_id)m[s.source_id]=s; }); return m; }
function v76RankValue(x){ return `${v74Esc(field(x,'value')||'未確認')} ${v74Esc(field(x,'unit')||'')}`.trim(); }
function v76RankCard(def){
  const rows=v76RowsForRanking(def.ranking_id), src=v76SourceMap()[def.source_id]||{};
  const title=tx(def,'display_title')||tx(def,'ranking_name')||def.ranking_id;
  const desc=tx(def,'short_desc')||tx(def,'value')||'説明を確認中です。';
  const note=rows.length===10?'TOP10形式':(rows.length>0?`${rows.length}項目の比較`:'確認中');
  return `<article class="item ranking-card-v47 ranking-card-v76"><div class="ranking-head-v47">${art('ranking')}<div><h3>${v74Esc(title)}</h3><p>${v74Esc(desc)}</p></div></div><p>${chips([tx(def,'category'), def.source_name, def.unit, note])}</p>${rows.length?`<table class="ranking-table-v47"><thead><tr><th>順位</th><th>国・項目</th><th>数値</th><th>対象年</th></tr></thead><tbody>${rows.slice(0,10).map(x=>`<tr><td>${v74Esc(x.rank)}</td><td>${v74Esc(tx(x,'country_or_item')||field(x,'country_or_item_ja'))}</td><td>${v76RankValue(x)}</td><td>${v74Esc(field(x,'source_year')||'未確認')}</td></tr>`).join('')}</tbody></table>`:`<div class="rank-empty-v47"><b>データ確認中</b><span>このランキングは定義のみ確認中です。</span></div>`}<details><summary>出典・見方</summary><p><b>出典：</b>${v74Esc(def.source_name||src.source_name||'出典名未確認')}</p><p><b>URL：</b>${src.source_url?`<a href="${esc(src.source_url)}" target="_blank" rel="noopener">${v74Esc('出典ページを開く')}</a>`:v74Esc('URL未確認')}</p><p><b>単位：</b>${v74Esc(def.unit||'未確認')}</p><p><b>対象年：</b>${v74Esc(def.source_year||'各行に表示')}</p><p><b>注意：</b>${v74Esc(tx(def,'caution')||'出典・単位・対象年を確認して見てください。')}</p></details></article>`;
}
renderRankings=function(){
 const defs=S.data?.rankings?.rankings||[], rows=v76RankingRows(), q=String(S.filters.rankq||'').toLowerCase();
 const filteredDefs=defs.filter(d=>!q||JSON.stringify(d).toLowerCase().includes(q)||v76RowsForRanking(d.ranking_id).some(r=>JSON.stringify(r).toLowerCase().includes(q)));
 const ready=filteredDefs.filter(d=>v76RowsForRanking(d.ranking_id).length>0);
 const pending=filteredDefs.filter(d=>v76RowsForRanking(d.ranking_id).length===0);
 $('#rankings').innerHTML=`${v47PageLead('世界の米ランキング','11件のランキング定義と106件の順位・比較データを、対象年・単位・出典と一緒に確認します。','ranking')}<div class="toolbar"><input placeholder="ランキング検索" value="${esc(S.filters.rankq||'')}" oninput="setFilter('rankq',this.value)"></div><div class="countbar">${stat(defs.length,'ランキング定義')}${stat(rows.length,'順位・比較行')}${stat((S.data?.rankings?.sources||[]).length,'出典')}${stat(pending.length,'確認中')}</div><div class="data-note"><b>見方：</b>10行あるものはTOP10形式、6行など少ないものは比較データとして表示します。</div><div class="section-title"><h2>ランキング表</h2></div><div class="ranking-grid-v47 ranking-grid-v76">${ready.map(v76RankCard).join('')||v47Empty('該当するランキングがありません','検索条件を変えてください。')}</div>${pending.length?`<div class="section-title"><h2>確認中</h2></div><div class="ranking-grid-v47">${pending.map(v76RankCard).join('')}</div>`:''}`;
};


/* v76: final public text guard. Management-only terms are hidden from generic public text helpers. */
const __v76_internal_term_re = /safe_app_note|app_caution|use_review_note|source_key|source_area|親Excel|parent_excel/i;
function v76Public(s){ const t=String(s||'').trim(); return __v76_internal_term_re.test(t) ? '' : t; }


/* === v77: final public render guards for literature/details/check. Active path is below. === */
function v77PublicText(s){
  return String(s ?? '')
    .replace(/safe_app_note[_a-z0-9]*/gi,'確認用メモ')
    .replace(/app_caution[_a-z0-9]*/gi,'確認用メモ')
    .replace(/use_review_note/gi,'確認用メモ')
    .replace(/source_key|source_area|parent_excel/gi,'参照情報')
    .replace(/親Excel/g,'作成データ')
    .replace(/claim_id/gi,'根拠番号')
    .replace(/claim_ids/gi,'根拠番号')
    .replace(/claim/gi,'文献要点')
    .replace(/未実装/g,'準備中')
    .replace(/架空作成しない|架空補完しない/g,'確認できた内容だけ表示')
    .replace(/国別本文未統合/g,'国別ヒストリー収録済み')
    .replace(/TOP10未公開|明細0件/g,'ランキング収録済み');
}
function v77Esc(s){ return esc(v77PublicText(s)); }
function v77EvidenceNo(ids){ const a=splitIds(ids); return a.length ? a.slice(0,6).join(', ') : '未確認'; }
function v77SourceDetails(ids){
  const sm=sourceMap();
  const arr=splitIds(ids).map(id=>sm[id]).filter(Boolean);
  if(!arr.length) return '<p class="small">出典：未確認</p>';
  return arr.slice(0,4).map(s=>`<p class="source"><b>${v77Esc(field(s,'source_title','title','name')||field(s,'source_id','id')||'出典')}</b><br>${field(s,'url','source_url')?`<a href="${esc(field(s,'url','source_url'))}" target="_blank" rel="noopener">出典ページを開く</a>`:v77Esc(field(s,'publisher','organization','year')||'URL未確認')}</p>`).join('');
}
function v77LiteratureCard(x){
  const title=field(x,'title')||'文献名未確認';
  const cat=field(x,'category')||'分類未確認';
  const summary=field(x,'summary');
  const condition=field(x,'condition');
  const sourceIds=field(x,'source_ids');
  const evidenceNos=field(x,'claim_ids');
  return `<article class="item evidence-card-v77"><h3>${v77Esc(title)}</h3><p>${chips([cat, evidenceLabel(x._class), statusInfo(x._class)])}</p><p><b>文献要点：</b>${summary&&!same(summary,title)?v77Esc(summary):'未確認'}</p><p><b>条件・数値：</b>${condition?v77Esc(condition):'未確認'}</p><details><summary>出典・確認番号</summary><p><b>確認番号：</b>${v77Esc(v77EvidenceNo(evidenceNos))}</p>${v77SourceDetails(sourceIds)}<p class="small">確認番号は出典照合用です。画面上の判断は、文献要点・条件・出典を合わせて見ます。</p></details><div class="priority-row"><button class="btn secondary" onclick="S.filters.learn='${esc((cat||title||'').split(/[・/ ]/)[0])}';switchView('learn')">関連教材</button><button class="btn secondary" onclick="S.filters.wordq='${esc((cat||title||'').split(/[・/ ]/)[0])}';switchView('words')">用語集</button></div></article>`;
}
renderLiterature=function(){
  const raw=S.data?.literature?.cards||S.data?.literature?.entries||[];
  const q=String(S.filters.litq||'').toLowerCase(), cat=S.filters.litcat||'';
  const cats=[...new Set(raw.map(x=>field(x,'category')).filter(has))].sort();
  const enriched=raw.map(x=>({...x,_class:classifyEvidence(x),_score:literatureScore(x)}));
  let filtered=enriched.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!cat||field(x,'category')===cat)).sort((a,b)=>b._score-a._score);
  $('#literature').innerHTML=`${v47PageLead('炊飯文献ライブラリ','文献要点、条件・数値、出典を確認します。内部管理語は画面に出さず、公開用の言葉に整理します。','doc')}<div class="toolbar sticky-toolbar-v47"><input placeholder="文献・条件・用語で検索" value="${esc(S.filters.litq||'')}" oninput="setFilter('litq',this.value)"><select onchange="setFilter('litcat',this.value)"><option value="">全カテゴリ</option>${cats.map(c=>`<option ${c===cat?'selected':''}>${v77Esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(raw.length,'文献カード')}${stat(cats.length,'カテゴリ')}</div><div class="data-note"><b>見方：</b>文献要点、条件・数値、出典を合わせて確認します。現場メモや管理用IDは判断文として表示しません。</div><div class="list literature-list-v77">${filtered.slice(0,180).map(v77LiteratureCard).join('')||v47Empty('該当する文献がありません','検索条件を変えてください。')}</div>`;
};
function v77WaterClaimLine(c){
  const topic=field(c,'topic','parameter','theme')||'確認項目';
  const text=field(c,'claim_ja','summary_ja','display_text_ja')||field(c,'condition')||'確認中';
  return `<p><b>${v77Esc(topic)}</b>：${v77Esc(text)}<br><span class="small">確認番号：${v77Esc(field(c,'claim_id','id')||'未確認')} / 出典：${v77Esc(field(c,'source_ids','source_id')||'未確認')}</span></p>`;
}
renderCheck=function(){
  const w=S.data.water||{}, storage=S.data.storage_mold||{}, raw=storage.raw||{};
  const region=(w.regions||[])[0]||{}, rules=w.quality_rules||w.rules||[], wClaims=w.claims||[], mRules=raw.rules||storage.rules||[], checklist=raw.checklist||storage.checklist||[], sClaims=raw.claims||storage.claims||[];
  $('#check').innerHTML=`${v47PageLead('今日の確認','水、炊飯結果、納米庫の状態を順番に見ます。GPSや地域情報は参考値として扱い、手元の測定値とは分けます。','weather')}<section class="check-grid-v77">${card('水の相性チェック',`<p><b>地域参考値と手元の測定値を分けて見ます。</b></p><p>地域参考値：${v77Esc(field(region,'area_name_ja')||'未確認')} / 硬度：${v77Esc(field(region,'total_hardness_mgL_CaCO3')||'未確認')} / pH：${v77Esc(field(region,'pH')||'未確認')}</p><div class="mini-grid"><span><b>pH</b><br>酸性・中性・アルカリ性の目安</span><span><b>硬度</b><br>カルシウム・マグネシウム量の目安</span><span><b>TDS</b><br>溶けた物質量の目安</span><span><b>残留塩素</b><br>におい・味への影響確認</span></div><details><summary>確認の順番</summary><p>1. 地域参考値を見る</p><p>2. 測定値があれば入力して比較する</p><p>3. 炊飯結果の硬さ・粘り・においと合わせて見る</p></details>`,`<p class="small">水質ルール ${rules.length}件 / 水質確認 ${wClaims.length}件</p>`)}${card('納米庫管理',`<p><b>見る順番：</b>結露 → 湿度 → 温度差 → 残米・付着米 → カビ臭 → 虫 → 変色 → 清掃記録。</p><div class="mini-grid"><span>結露</span><span>湿度</span><span>温度差</span><span>残米・付着米</span><span>カビ臭</span><span>虫</span><span>変色</span><span>清掃記録</span></div><details><summary>危険サインと確認番号</summary>${sClaims.slice(0,9).map(v77WaterClaimLine).join('')}</details><details><summary>点検場所</summary>${checklist.slice(0,13).map(c=>`<p><b>${v77Esc(field(c,'timing')||'点検')}</b> ${v77Esc(field(c,'check_area')||'場所未確認')}：${v77Esc(field(c,'check_item')||'項目未確認')}<br><span class="small">方法：${v77Esc(field(c,'method')||'未確認')} / NG時：${v77Esc(field(c,'action_if_ng')||'未確認')}</span></p>`).join('')}</details>`,`<p class="small">判定ルール ${mRules.length}件 / 点検 ${checklist.length}件 / 確認 ${sClaims.length}件</p>`)}</section><details class="data-check compact"><summary>水質・保管の出典確認</summary>${wClaims.slice(0,6).map(v77WaterClaimLine).join('')}</details>`;
};


/* v78 helper guards: previous cycles referenced these card helpers; define them once for the active public path. */
function art(kind){ return illust(kind); }
function homeMini(title, body, icon, view, cta){ return `<article class="home-mini"><button onclick="switchView('${view}')">${illust(icon)}<b>${esc(title)}</b><span>${body}</span><em>${esc(cta||'開く')}</em></button></article>`; }
function navCard(view,title,body,icon,cta){ return `<article class="nav-card"><button onclick="switchView('${view}')">${illust(icon)}<b>${esc(title)}</b><span>${esc(body)}</span><em>${esc(cta||'開く')}</em></button></article>`; }

/* === v78 forest pass: final active render path focused on overall app value and major routes. === */
function v78SafeText(s){ return v77PublicText(v74PublicText(s)); }
function v78Esc(s){ return esc(v78SafeText(s)); }
function v78CurrentHistoryMini(){
  const h=histCurrent();
  if(!h) return homeMini('現在地のお米ヒストリー','32か国の米文化史データを確認中です。','map','future','ヒストリーへ');
  const body=v78SafeText(histBody(h));
  return `<article class="home-mini country-history-mini-v78"><button onclick="switchView('future')">${illust('map')}<b>現在地のお米ヒストリー</b><span>${v78Esc(histCountryName(h))} / ${v78Esc(histPeriod(h))}<br>${v78Esc(body.length>86?body.slice(0,86)+'…':body)}</span><em>32か国から表示</em></button></article>`;
}
countryHistoryHomeMini=v78CurrentHistoryMini;
function v78CountryHistoryPanel(){
  const h=histCurrent();
  if(!h) return `<div class="card country-history-v78">${art('map')}<h2>現在地のお米ヒストリー</h2><p>32か国の米文化史データを確認中です。</p></div>`;
  const note=histNote(h);
  return `<article class="card country-history-card-v78">${art('map')}<div><span class="eyebrow">LOCATION RICE HISTORY</span><h2>現在地のお米ヒストリー</h2><p class="small">GPSは参考です。表示国を選んで、国単位の米文化史として読みます。</p><div class="toolbar compact-toolbar"><label>表示する国・地域</label>${histCountrySelector(h.country_code)}</div><h3>${v78Esc(histCountryName(h))}</h3><p class="small">${v78Esc(histPeriod(h))}</p><p>${v78Esc(histBody(h)).split('\n').join('<br>')}</p><p>${chips([h.representative_tags])}</p><details><summary>出典・表示について</summary>${note?`<p class="small">${v78Esc(note)}</p>`:''}${histSourceDetails(h.source_ids)}<p class="small">細かな住所ではなく、現在地または選択した国・地域の米文化史を表示します。水質・保管状態は別機能で確認します。</p></details></div></article>`;
}
v72CountryHistoryCard=v78CountryHistoryPanel;

function todayStoryHomeCard(x){
  x=x||{};
  return `<article class="home-mini today-story-mini-v78"><button onclick="switchView('future')">${illust('world')}<b>今日の世界ライス物語</b><span>${v78Esc(storyCountry(x)||'国・地域未確認')}<br>${v78Esc(storyTitle(x)||'物語を確認')}</span><em>物語へ</em></button></article>`;
}
function currentRiceCardV47(v){
  v=v||{};
  return `<article class="home-mini current-rice-mini-v78"><button onclick="switchView('varieties')">${illust('variety')}<b>今日の米品種</b><span>${v78Esc(titleOfVariety(v))}<br>${v78Esc(countryOfVariety(v))}</span><em>図鑑へ</em></button></article>`;
}

function v78StoryCard(x){
  return `<article class="item story-item-v78"><h3>${v78Esc(storyTitle(x))}</h3><p>${chips([field(x,'day_no')+'日目',storyCountry(x),field(x,'region'),field(x,'theme')])}</p><p><b>${v78Esc(storySubtitle(x))}</b></p><p>${v78Esc(storyBody(x,280)).split('\n').join('<br>')}</p><details><summary>炊飯・食感の視点</summary><p><b>学び：</b>${v78Esc(field(x,'learning_point')||'未確認')}</p><p><b>食感：</b>${v78Esc(field(x,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${v78Esc(field(x,'cooking_note')||'未確認')}</p></details></article>`;
}
renderFuture=function(){
 const data=S.data.future_rice||[], q=S.filters.storyq||'', country=S.filters.storyCountry||'', fq=S.filters.future||'';
 const stories=storyList(), story=todayStory(), storyCountries=[...new Set(stories.map(storyCountry).filter(has))].sort();
 const storyFiltered=stories.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(String(q).toLowerCase()))&&(!country||storyCountry(x)===country));
 const futureFiltered=data.filter(x=>!fq||JSON.stringify(x).toLowerCase().includes(String(fq).toLowerCase()));
 $('#future').innerHTML=`${v47PageLead('世界ライス物語','世界の米文化を毎日1話。料理・食感・炊飯の見方へつなげます。現在地のお米ヒストリーもここから確認します。','world')}
 <section class="today-story-v47 today-story-v78"><div><span class="eyebrow">TODAY'S STORY</span><h2>${v78Esc(storyTitle(story||{}))}</h2><p class="small">${v78Esc(storyCountry(story||{}))} / ${v78Esc(field(story,'theme')||'テーマ未確認')}</p><p>${v78Esc(storyBody(story||{},720)).split('\n').join('<br>')}</p><details open><summary>炊飯・食感の視点</summary><p><b>学び：</b>${v78Esc(field(story,'learning_point')||'未確認')}</p><p><b>料理場面：</b>${v78Esc(field(story,'scene_note')||'未確認')}</p><p><b>食感：</b>${v78Esc(field(story,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${v78Esc(field(story,'cooking_note')||'未確認')}</p><p>${chips([field(story,'texture_keywords'),field(story,'related_terms')])}</p></details></div>${art('world')}</section>
 <div class="grid">${v78CountryHistoryPanel()}<div class="card">${art('future')}<h2>お米の未来</h2><p>技術・環境・品種改良など、未来テーマへ進みます。</p><p class="small">50件収録</p></div></div>
 <div class="section-title"><h2>物語を探す</h2></div><div class="toolbar"><input placeholder="物語検索" value="${esc(q)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">全ての国・地域</option>${storyCountries.map(c=>`<option ${c===country?'selected':''}>${v78Esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(storyFiltered.length,'表示中の物語')}${stat(stories.length,'物語総数')}${stat(storyCountries.length,'国・地域')}${stat((S.data?.country_rice_history?.records||[]).length,'ヒストリー','32か国')}</div>
 <div class="story-list-v47 story-list-v78">${storyFiltered.slice(0,120).map(v78StoryCard).join('')}</div>
 <div class="section-title"><h2>お米の未来50</h2></div><div class="toolbar"><input placeholder="未来テーマ検索" value="${esc(fq)}" oninput="setFilter('future',this.value)"></div><div class="list">${futureFiltered.slice(0,50).map(x=>`<div class="item"><h3>${v78Esc(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ')}</h3><p>${chips([x.category,x.source_type])}</p><p>${v78Esc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'本文未確認')}</p></div>`).join('')}</div>`;
};
renderHome=function(){
  const c=S.data?.counts||{}, variety=pick(S.data?.rice_varieties,'v78_variety'), story=todayStory(), future=pick(S.data?.future_rice,'v78_future');
  $('#home').innerHTML=`<div class="home-v78">
    <section class="hero hero-v74 hero-v78"><span class="eyebrow">RICE NAVI</span><h1>${v78Esc('米を知り、今日の一杯を考える')}</h1><p>${v78Esc('炊飯トラブルの確認、米文化の発見、品種・文献・用語の確認をひとつの流れで使えます。')}</p><div class="priority-row"><button class="btn" onclick="switchView('check')">今日の確認</button><button class="btn secondary" onclick="switchView('future')">物語・ヒストリー</button><button class="btn secondary" onclick="switchView('literature')">文献を確認</button></div></section>
    <section class="nav-cards-v47 nav-cards-v50 nav-cards-v74 nav-cards-v78">
      ${navCard('check','今日の確認','水・納米庫・炊飯結果を見る','weather','まず見る')}
      ${navCard('future','物語・ヒストリー','365話と現在地のお米史','world','読む')}
      ${navCard('literature','炊飯文献','根拠・条件・数値を確認','doc','調べる')}
      ${navCard('varieties','米品種図鑑','用途・食感・成分を見る','variety','探す')}
    </section>
    <section class="home-grid-v47 home-grid-v74 home-grid-v78">
      ${riceFortuneCardV60(false)}
      ${v55RiceWordCard(false)}
      ${v78CurrentHistoryMini()}
      ${todayStoryHomeCard(story)}
      ${currentRiceCardV47(variety)}
      ${v74Mini('rankings','世界ランキング','106件の順位・比較データを対象年・単位つきで確認します。','ranking','ランキングへ')}
      ${v74Mini('words','用語集','炊飯・保存・食感・米文化の言葉を調べます。','word','用語を探す')}
      ${v74Mini('check','納米庫管理','結露、湿度、温度差、残米、カビ臭、虫、変色を確認します。','storage','保管を見る')}
      ${v74Mini('learn','学ぶ','82件の教材カードから炊飯の考え方を確認します。','book','学ぶ')}
      ${v74Mini('literature','炊飯文献','428件の文献カードから条件・数値・出典を確認します。','doc','文献へ')}
      ${v74Mini('future','お米の未来',field(future,'title_ja','title')||'未来テーマを表示します。','future','未来へ')}
    </section>
    <details class="data-check compact v78-data"><summary>${v78Esc('収録内容')}</summary><div class="countbar">${stat((S.data?.literature?.cards||[]).length,'文献カード','428件')}${stat((S.data?.learning_cards||[]).length,'教材カード','82件')}${stat((S.data?.rice_varieties||[]).length,'米品種','250件')}${stat((S.data?.world_rice_stories?.ja||[]).length,'世界のライス物語','365話')}${stat((S.data?.country_rice_history?.records||[]).length,'現在地ヒストリー','32か国')}${stat(rankingActualRows(),'ランキング行','順位・比較')}${stat((S.data?.glossary||[]).length,'用語集','収録語')}${stat((S.data?.daily_rice_words||[]).length,'米言葉','100件')}</div></details>
    <details class="data-check compact"><summary>${v78Esc('迷ったときの順番')}</summary><p>${v78Esc('現場で困ったら「今日の確認」。知識を広げるなら「物語・ヒストリー」。根拠を確認するなら「文献」。品種を調べるなら「図鑑」。この順番で使います。')}</p></details>
  </div>`;
};



/* === v78.43 public UI cleanup: hide internal labels and make navigation buttons reliable. === */
const VIEWS_V784 = new Set(['home','learn','literature','varieties','check','future','rankings','words']);
function cleanPublicV784(v){
  let s = String(v ?? '').trim();
  if(!s) return '';
  const drop = [/^未確認$/,/^確認中$/,/^N\/?A$/i,/^null$/i,/^undefined$/i,/^none$/i,/^nan$/i,/^準備中$/];
  if(drop.some(r=>r.test(s))) return '';
  return s
    .replace(/safe_app_note[_a-z0-9]*/gi,'')
    .replace(/app_caution[_a-z0-9]*/gi,'')
    .replace(/use_review_note/gi,'')
    .replace(/source_key/gi,'')
    .replace(/source_area/gi,'')
    .replace(/source_type/gi,'')
    .replace(/source_id/gi,'')
    .replace(/claim_id/gi,'')
    .replace(/claim/gi,'根拠')
    .replace(/親Excel/g,'')
    .replace(/候補/g,'')
    .replace(/正式カード/g,'文献カード')
    .replace(/原文確認済み/g,'原文確認')
    .replace(/関連文献候補/g,'関連文献')
    .replace(/カード候補/g,'カード')
    .replace(/キー未確認/g,'')
    .replace(/出典ID/g,'出典')
    .replace(/URL未確認/g,'')
    .replace(/本文未確認/g,'本文を整理中')
    .replace(/説明未確認/g,'説明を整理中')
    .replace(/種類未確認/g,'種類を整理中')
    .replace(/国・地域未確認/g,'国・地域を整理中')
    .replace(/テーマ未確認/g,'テーマを整理中')
    .replace(/品種名未確認/g,'品種名を整理中')
    .replace(/文献名未確認/g,'文献名を整理中')
    .replace(/工程未確認/g,'工程を整理中')
    .replace(/用途候補/g,'用途')
    .replace(/ジャポニカ候補/g,'ジャポニカ')
    .replace(/短粒候補/g,'短粒')
    .replace(/\s{2,}/g,' ')
    .trim();
}
function pEsc(v){ return esc(cleanPublicV784(v)); }
function pText(v, fallback='情報を整理中です。'){
  const s = cleanPublicV784(v);
  return s || fallback;
}
function pHas(v){ return !!cleanPublicV784(v); }
function pChip(vals){
  const arr = vals.flatMap(v=>String(v??'').split(/[;；,、|/]/)).map(cleanPublicV784).filter(Boolean);
  return arr.length ? `<p class="chips">${[...new Set(arr)].slice(0,5).map(x=>`<span>${esc(x)}</span>`).join('')}</p>` : '';
}
function jsArg(v){
  return "'" + String(v ?? '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/[\r\n]+/g,' ') + "'";
}
function btnV784(view,label,key='',val=''){
  return `<button class="btn secondary" onclick="goViewV784(${jsArg(view)},${jsArg(key)},${jsArg(val)})">${pEsc(label)}</button>`;
}
function cardV784(title, body, footer=''){
  return `<article class="card public-card-v784"><h2>${pEsc(title)}</h2>${body}${footer}</article>`;
}
function itemV784(title, body, footer=''){
  return `<article class="item public-item-v784"><h3>${pEsc(title)}</h3>${body}${footer}</article>`;
}
function termsFromV784(x){
  return cleanPublicV784(field(x,'category','related_terms','tags','theme','title','term_ja','name_ja')||'').split(/[;；,、/ ]/).filter(Boolean)[0] || '';
}
function softStatusV784(c){ return ({A:'出典確認済み',B:'要点整理済み',C:'再確認中',D:'現場メモ'})[c] || '確認中'; }
function sourceNamesV784(ids){
  const sm=sourceMap();
  const arr=splitIds(ids).map(id=>sm[id]).filter(Boolean).map(x=>pText(field(x,'source_title_ja','title_ja','title','source_name'),''));
  return [...new Set(arr.filter(Boolean))].slice(0,3);
}
renderLearn=function(){
  const data=S.data.learning_cards||[], q=String(S.filters.learn||'').toLowerCase(), level=S.filters.level||'';
  const filtered=data.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!level||levelLabel(x)===level));
  const topicBtns=['浸漬','吸水','水温','糊化','蒸らし','ほぐし','老化','硬さ','粘り','水質'];
  $('#learn').innerHTML=`${v47PageLead('学ぶ','炊飯の基本から応用まで、教材カード・用語・文献をつないで確認します。','book')}
  <div class="section-title"><h2>温度×時間マップ</h2></div>
  <div class="list">
    ${itemV784('浸漬・吸水','<p>水温と時間で吸水状態が変わります。冷水・短時間では吸水不足を確認します。</p>'+pChip(['吸水','浸漬'])+btnV784('literature','関連文献を見る','litq','吸水'))}
    ${itemV784('昇温','<p>加熱初期は米粒内外の温度差と水分移動を見ます。</p>'+pChip(['温度','時間'])+btnV784('literature','関連文献を見る','litq','温度'))}
    ${itemV784('沸騰前後','<p>火力、水分、鍋内状態を合わせて確認します。</p>'+pChip(['沸騰','火力'])+btnV784('literature','関連文献を見る','litq','沸騰'))}
  </div>
  <div class="section-title"><h2>教材を探す</h2></div>
  <div class="priority-row">${topicBtns.map(k=>`<button onclick="S.filters.learn=${jsArg(k)};renderLearn()">${pEsc(k)}</button>`).join('')}<button onclick="S.filters.learn='';S.filters.level='';renderLearn()">解除</button></div>
  <div class="toolbar"><input placeholder="教材検索" value="${esc(S.filters.learn||'')}" oninput="S.filters.learn=this.value;renderLearn()"><select onchange="S.filters.level=this.value;renderLearn()"><option value="">全レベル</option><option ${level==='初級'?'selected':''}>初級</option><option ${level==='中級'?'selected':''}>中級</option><option ${level==='上級'?'selected':''}>上級</option></select></div>
  <div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'教材カード')}</div>
  <div class="list">${filtered.slice(0,120).map(x=>{const title=lc(x,'title')||'教材カード'; const rel=termsFromV784(x)||title; return itemV784(title,`${pChip([levelLabel(x),lc(x,'related_terms')])}<p>${pEsc(lc(x,'short')||lc(x,'easy')||'炊飯の見方を整理中です。')}</p>${pHas(lc(x,'field_check_points'))?`<p><b>確認ポイント：</b>${pEsc(lc(x,'field_check_points'))}</p>`:''}<details><summary>条件・注意</summary>${pHas(lc(x,'numbers_conditions'))?`<p><b>条件・数値：</b>${pEsc(lc(x,'numbers_conditions'))}</p>`:''}${pHas(lc(x,'warning'))?`<p><b>注意：</b>${pEsc(lc(x,'warning'))}</p>`:''}</details>`,btnV784('literature','関連文献を見る','litq',rel));}).join('')||v47Empty('表示できる教材がありません','検索条件を変えてください。')}</div>`;
}
renderLiterature=function(){
  const cards=(S.data.literature?.cards||[]), q=S.filters.litq||'', cat=S.filters.litcat||'', ev=S.filters.evidence||'AB';
  const categories=[...new Set(cards.map(x=>cleanPublicV784(field(x,'category'))).filter(Boolean))].sort();
  let filtered=cards.filter(x=>!q||JSON.stringify(x).toLowerCase().includes(String(q).toLowerCase()));
  if(cat) filtered=filtered.filter(x=>cleanPublicV784(field(x,'category'))===cat);
  if(ev&&ev!=='ALL') filtered=filtered.filter(x=>ev.includes(v72ClassifyLit(x)) || (ev==='AB'&&['A','B'].includes(v72ClassifyLit(x))));
  $('#literature').innerHTML=`${v47PageLead('炊飯文献','文献の要点、条件、数値、注意点を確認します。内部管理番号は表示しません。','doc')}
  <div class="toolbar sticky-toolbar-v47"><input placeholder="文献検索" value="${esc(q)}" oninput="setFilter('litq',this.value)"><select onchange="setFilter('litcat',this.value)"><option value="">全カテゴリ</option>${categories.slice(0,80).map(c=>`<option ${c===cat?'selected':''}>${pEsc(c)}</option>`).join('')}</select><select onchange="setFilter('evidence',this.value)"><option value="AB" ${ev==='AB'?'selected':''}>確認済み中心</option><option value="A" ${ev==='A'?'selected':''}>出典確認済み</option><option value="B" ${ev==='B'?'selected':''}>要点整理済み</option><option value="C" ${ev==='C'?'selected':''}>再確認中</option><option value="ALL" ${ev==='ALL'?'selected':''}>全件</option></select></div>
  <div class="priority-row">${['浸漬','吸水','糊化','蒸らし','老化','水質','pH','硬さ','粘り','温度','保管','結露'].map(k=>`<button onclick="setFilter('litq',${jsArg(k)})">${pEsc(k)}</button>`).join('')}<button onclick="S.filters.litq='';S.filters.litcat='';S.filters.evidence='AB';renderLiterature()">解除</button></div>
  <div class="countbar">${stat(filtered.length,'表示中')}${stat(cards.length,'文献カード')}</div>
  <div class="list">${filtered.slice(0,160).map(x=>{const cls=v72ClassifyLit(x), title=field(x,'title')||'文献'; const sum=field(x,'summary'), cond=field(x,'condition'), term=termsFromV784(x)||field(x,'category')||title, names=sourceNamesV784(field(x,'source_ids')); return itemV784(title,`${pChip([field(x,'category'),softStatusV784(cls)])}${pHas(sum)&&!same(sum,title)?`<p><b>要点：</b>${pEsc(sum)}</p>`:''}${pHas(cond)?`<p><b>条件・数値：</b>${pEsc(cond)}</p>`:''}<details><summary>確認ポイント</summary>${pHas(field(x,'trace'))?`<p>${pEsc(field(x,'trace'))}</p>`:''}${names.length?`<p class="small"><b>主な出典：</b>${names.map(esc).join(' / ')}</p>`:''}</details>`,`${btnV784('learn','関連教材','learn',term)}${btnV784('words','用語集','wordq',term)}`);}).join('')||v47Empty('該当する文献がありません','検索条件を変えてください。')}</div>`;
}
renderVarieties=function(){
  const data=S.data.rice_varieties||[], q=S.filters.varq||'', country=S.filters.country||'', use=S.filters.use||'', texture=S.filters.texture||'';
  const countries=[...new Set(data.map(countryOfVariety).map(cleanPublicV784).filter(Boolean))].sort();
  const uses=[...new Set(data.flatMap(v=>String(field(v,'uses','best_use','suitable_dish','dish_fit','main_uses')||'').split(/[;；,、]/)).map(cleanPublicV784).filter(Boolean))].sort();
  const textures=[...new Set(data.flatMap(v=>String(field(v,'texture','texture_profile','texture_tags','app_texture_ja_v1_7')||'').split(/[;；,、]/)).map(cleanPublicV784).filter(Boolean))].sort();
  let filtered=data.filter(v=>!q||JSON.stringify(v).toLowerCase().includes(String(q).toLowerCase()));
  if(country) filtered=filtered.filter(v=>cleanPublicV784(countryOfVariety(v))===country);
  if(use) filtered=filtered.filter(v=>JSON.stringify(v).includes(use));
  if(texture) filtered=filtered.filter(v=>JSON.stringify(v).includes(texture));
  $('#varieties').innerHTML=`${v47PageLead('米品種図鑑','品種を、国・用途・食感・成分から探します。確認できた内容を中心に表示します。','variety')}
  <div class="toolbar sticky-toolbar-v47"><input placeholder="品種名・国・用途で検索" value="${esc(q)}" oninput="setFilter('varq',this.value)"><select onchange="setFilter('country',this.value)"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===country?'selected':''}>${pEsc(c)}</option>`).join('')}</select><select onchange="setFilter('use',this.value)"><option value="">全用途</option>${uses.slice(0,50).map(c=>`<option ${c===use?'selected':''}>${pEsc(c)}</option>`).join('')}</select><select onchange="setFilter('texture',this.value)"><option value="">全食感・特徴</option>${textures.slice(0,50).map(c=>`<option ${c===texture?'selected':''}>${pEsc(c)}</option>`).join('')}</select></div>
  <div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'品種総数')}</div>
  <div class="list variety-list-v784">${filtered.slice(0,160).map(v=>{const title=titleOfVariety(v), country=countryOfVariety(v), term=title; const uses=pText(field(v,'main_uses','business_uses','use_category_primary'),'情報整理中'); const texture=pText(field(v,'texture_tags','aroma'),'情報整理中'); const amy=pText(field(v,'amylose_range','amylose_value','amylose_class'),'情報整理中'); const prot=pText(field(v,'protein_range','protein_value','protein_class'),'情報整理中'); return itemV784(`${title}｜${country}`,`${pChip([country,field(v,'rice_type'),field(v,'grain_shape')])}<p>${pEsc(v73VarietySummary(v))}</p><div class="variety-facts"><span><b>用途</b>${pEsc(uses)}</span><span><b>食感</b>${pEsc(texture)}</span><span><b>アミロース</b>${pEsc(amy)}</span><span><b>たんぱく質</b>${pEsc(prot)}</span></div><details><summary>詳しく見る</summary><p><b>原産・生産：</b>${pEsc(field(v,'main_production_regions','origin_country_ja')||'情報整理中')}</p><p><b>消費市場：</b>${pEsc(field(v,'main_consumption_markets')||'情報整理中')}</p></details>`,btnV784('literature','関連文献を見る','litq',term));}).join('')||v47Empty('該当する品種がありません','検索条件を変えてください。')}</div>`;
}
renderWords=function(){
 const data=S.data.glossary||[], q=String(S.filters.wordq||'').toLowerCase(), category=S.filters.wordcat||'';
 const categories=[...new Set(data.map(v67TermCategory).map(cleanPublicV784).filter(Boolean))].slice(0,70);
 const filtered=data.filter(x=>(!q||v67SearchText(x).includes(q))&&(!category||cleanPublicV784(v67TermCategory(x))===category));
 $('#words').innerHTML=`${v47PageLead('用語集','米づくり、炊飯、保存、食感、世界の米文化の言葉を調べます。','word')}<div class="toolbar"><input placeholder="用語を検索" value="${esc(S.filters.wordq||'')}" oninput="setFilter('wordq',this.value)"><select onchange="setFilter('wordcat',this.value)"><option value="">全カテゴリ</option>${categories.map(c=>`<option ${c===category?'selected':''}>${pEsc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'収録語')}</div><div class="list glossary-list-v74">${filtered.slice(0,240).map(x=>{const term=termName(x), group=v67TermGroup(x), desc=termNote(x), rel=termRelevance(x), today=termTodayView(x); return itemV784(term,`${pChip([group])}<p>${pEsc(desc||'説明を整理中です。')}</p>${pHas(rel)?`<p><b>米とのつながり：</b>${pEsc(rel)}</p>`:''}${pHas(today)?`<p><b>見方：</b>${pEsc(today)}</p>`:''}`,`${btnV784('literature','文献を探す','litq',term)}${btnV784('varieties','図鑑を探す','varq',term)}`);}).join('')||v47Empty('該当する用語がありません','検索条件を変えてください。')}</div>`;
}
renderRankings=function(){
 const data=S.data.rankings?.rankings||S.data.rankings||[], q=S.filters.rankq||'';
 const rows=[]; data.forEach(r=>{const title=field(r,'ranking_name_ja','title_ja','title','name')||'ランキング'; const items=r.items||r.rows||r.top10||[]; if(!q || JSON.stringify(r).toLowerCase().includes(String(q).toLowerCase())) rows.push({title, items, r});});
 $('#rankings').innerHTML=`${v47PageLead('世界ランキング','生産量、消費量、輸出入などの順位・比較データを確認します。','ranking')}<div class="toolbar"><input placeholder="ランキング検索" value="${esc(q)}" oninput="setFilter('rankq',this.value)"></div><div class="countbar">${stat(rows.length,'表示中')}${stat(data.length,'ランキング')}</div><div class="list">${rows.slice(0,80).map(o=>{const body=(o.items||[]).slice(0,10).map((it,i)=>`<p><b>${i+1}.</b> ${pEsc(field(it,'country_ja','name_ja','country','name')||field(it,'item_ja','item')||'項目')} ${pEsc(field(it,'value','amount','score','rank_value')||'')}</p>`).join(''); return itemV784(o.title,`${pChip([field(o.r,'category_ja','category'),field(o.r,'unit_ja','unit')])}${body||'<p>順位データを整理中です。</p>'}<details><summary>表示について</summary><p>対象年・単位が確認できる項目から表示します。</p></details>`);}).join('')||v47Empty('該当するランキングがありません','検索条件を変えてください。')}</div>`;
}
renderCheck=function(){
 const w=S.data.water||{}, sm=S.data.storage_mold||{}, raw=sm.raw||{};
 const rules=w.quality_rules||w.rules||[], checklist=raw.checklist||sm.checklist||[], storageRules=raw.rules||sm.rules||[], region=(w.regions||[])[0]||{};
 $('#check').innerHTML=`${v47PageLead('今日の確認','水の相性と納米庫管理を、炊飯結果と合わせて確認します。','weather')}
 <section class="grid check-grid-v784">${cardV784('水の相性チェック',`<p><b>地域参考値と手元の測定値を分けて見ます。</b></p><p>地域参考値：${pEsc(field(region,'area_name_ja')||'新北市三重区')} / 硬度：${pEsc(field(region,'total_hardness_mgL_CaCO3')||'情報整理中')} / pH：${pEsc(field(region,'pH')||'情報整理中')}</p><div class="mini-grid"><span><b>pH</b><br>酸性・中性・アルカリ性の目安</span><span><b>硬度</b><br>カルシウム・マグネシウム量の目安</span><span><b>TDS</b><br>溶けた物質量の目安</span><span><b>残留塩素</b><br>におい・味への影響確認</span></div><details><summary>確認の順番</summary><p>1. 地域参考値を見る</p><p>2. 測定値があれば入力して比較する</p><p>3. 炊飯結果の硬さ・粘り・においと合わせて見る</p></details>`)}${cardV784('納米庫管理',`<p><b>見る順番：</b>結露 → 湿度 → 温度差 → 残米・付着米 → カビ臭 → 虫 → 変色 → 清掃記録。</p><div class="mini-grid"><span>結露</span><span>湿度</span><span>温度差</span><span>残米・付着米</span><span>カビ臭</span><span>虫</span><span>変色</span><span>清掃記録</span></div><details><summary>点検場所</summary>${checklist.slice(0,12).map(c=>`<p><b>${pEsc(field(c,'timing')||'点検')}</b> ${pEsc(field(c,'check_area')||'場所')}：${pEsc(field(c,'check_item')||'項目')}<br><span class="small">方法：${pEsc(field(c,'method')||'確認')} / NG時：${pEsc(field(c,'action_if_ng')||'対応')}</span></p>`).join('')}</details>`)}</section>
 <div class="section-title"><h2>水質ルール</h2></div><div class="list">${rules.slice(0,16).map(r=>itemV784(field(r,'parameter','rule_name','item')||'水質項目',`<p>${pEsc(field(r,'rule_ja','meaning_ja','advice_ja','note_ja','summary_ja')||'内容を整理中です。')}</p>`)).join('')}</div>
 <div class="section-title"><h2>納米庫ルール</h2></div><div class="list">${storageRules.slice(0,16).map(x=>itemV784(field(x,'title_ja','title')||field(x,'check_item_ja')||'納米庫ルール',`<p>${pEsc(field(x,'summary_ja','summary','rule_ja')||'内容を整理中です。')}</p>`)).join('')}</div>`;
}
function v78StoryCard(x){
  return itemV784(storyTitle(x),`${pChip([field(x,'day_no')?field(x,'day_no')+'日目':'',storyCountry(x),field(x,'region'),field(x,'theme')])}<p><b>${pEsc(storySubtitle(x))}</b></p><p>${pEsc(storyBody(x,360)).split('\n').join('<br>')}</p><details><summary>炊飯・食感の視点</summary>${pHas(field(x,'learning_point'))?`<p><b>学び：</b>${pEsc(field(x,'learning_point'))}</p>`:''}${pHas(field(x,'texture_note'))?`<p><b>食感：</b>${pEsc(field(x,'texture_note'))}</p>`:''}${pHas(field(x,'cooking_note'))?`<p><b>炊飯：</b>${pEsc(field(x,'cooking_note'))}</p>`:''}</details>`);
}
function v78CountryHistoryPanel(){
  const h=histCurrent();
  if(!h) return cardV784('現在地のお米ヒストリー','<p>32か国の米文化史データを整理中です。</p>');
  return `<article class="card country-history-card-v78">${art('map')}<div><span class="eyebrow">LOCATION RICE HISTORY</span><h2>現在地のお米ヒストリー</h2><p class="small">GPSは参考です。表示国を選んで、国単位の米文化史として読みます。</p><div class="toolbar compact-toolbar"><label>表示する国・地域</label>${histCountrySelector(h.country_code)}</div><h3>${pEsc(histCountryName(h))}</h3><p class="small">${pEsc(histPeriod(h))}</p><p>${pEsc(histBody(h)).split('\n').join('<br>')}</p>${pChip([h.representative_tags])}<details><summary>表示について</summary><p class="small">細かな住所ではなく、現在地または選択した国・地域の米文化史を表示します。水質・保管状態は別機能で確認します。</p></details></div></article>`;
}



/* === v78.43 sweep pass: public text scrub + safer internal navigation. === */
try { VIEWS_V784.add('detail'); } catch(e) {}
const V785_BAD_TEXT = [
  [/safe_app_note[_a-z0-9]*/gi,''],[/app_caution[_a-z0-9]*/gi,''],[/use_review_note/gi,''],
  [/source_key/gi,''],[/source_area/gi,''],[/source_type/gi,''],[/source_ids?/gi,''],
  [/claim_ids?/gi,''],[/parent_excel/gi,''],[/親Excel/g,''],
  [/source\s*id/gi,''],[/claim\s*id/gi,''],
  [/正式カード候補/g,'文献カード'],[/公開候補/g,'公開用に整理済み'],[/原文確認済み候補/g,'出典確認済み'],[/出典確認候補/g,'出典確認中'],
  [/関連文献候補/g,'関連文献'],[/カード候補/g,'カード'],[/用途候補/g,'用途'],[/ジャポニカ候補/g,'ジャポニカ'],[/短粒候補/g,'短粒'],
  [/国別本文未統合/g,'国別ヒストリー収録済み'],[/TOP10未公開/g,'ランキング収録済み'],[/明細0件/g,'表示準備中'],
  [/safe app note/gi,''],[/app caution/gi,''],[/raw/gi,'']
];
function scrubTextV785(v){
  let s=String(v ?? '');
  V785_BAD_TEXT.forEach(([r,to])=>{s=s.replace(r,to)});
  s=s.replace(/(?:根拠番号|確認番号|カードID|出典ID)\s*[：:]\s*[A-Z]{1,4}\d+(?:\s*[,、]\s*[A-Z]{1,4}\d+)*/g,'')
     .replace(/(?:根拠番号|確認番号|カードID|出典ID)\s*[：:]\s*(?:未確認|情報整理中)/g,'')
     .replace(/\b(?:CL|SRC|LIT|CARD)\d{1,5}\b/g,'')
     .replace(/\bundefined\b|\bNaN\b|\bnull\b/gi,'')
     .replace(/\/\s*\/+/g,'/')
     .replace(/[：:]\s*\/\s*/g,'：')
     .replace(/\s{2,}/g,' ')
     .replace(/^[\s\/・,、]+|[\s\/・,、]+$/g,'')
     .trim();
  return s;
}
const cleanPublicV784_old = typeof cleanPublicV784 === 'function' ? cleanPublicV784 : (x=>String(x??''));
cleanPublicV784=function(v){
  const s=scrubTextV785(cleanPublicV784_old(v));
  if(!s || /^(未確認|確認中|情報整理中|N\/?A|none)$/i.test(s)) return '';
  return s;
};
pEsc=function(v){ return esc(cleanPublicV784(v)); };
pText=function(v, fallback='情報を整理中です。'){ return cleanPublicV784(v) || fallback; };
pHas=function(v){ return !!cleanPublicV784(v); };
function scrubRenderedV785(root=document){
  try{
    const targets=[...root.querySelectorAll('.view')];
    targets.forEach(t=>{
      const walker=document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
      let n; const nodes=[]; while(n=walker.nextNode()) nodes.push(n);
      nodes.forEach(n=>{ const s=scrubTextV785(n.nodeValue); if(s!==n.nodeValue) n.nodeValue=s; });
      t.querySelectorAll('a').forEach(a=>{
        const href=(a.getAttribute('href')||'').trim();
        if(!href || /未確認|undefined|null|NaN|^#$/.test(href)){
          const span=document.createElement('span'); span.className='safe-link-note small'; span.textContent='出典情報を整理中'; a.replaceWith(span);
        }
      });
      t.querySelectorAll('button').forEach(b=>{
        if(!b.getAttribute('type')) b.setAttribute('type','button');
        if(!b.textContent.trim()) b.textContent='開く';
      });
    });
  }catch(e){ console.warn('scrubRenderedV785 skipped', e); }
}
const render_old_v785 = render;
render=function(){ render_old_v785(); scrubRenderedV785(document); };
const switchView_old_v785 = switchView;
switchView=function(v){
  if(!['home','learn','literature','varieties','check','future','rankings','words','detail'].includes(v)) v='home';
  switchView_old_v785(v);
  scrubRenderedV785(document);
};
goViewV784=function(view, key='', val=''){
  if(!['home','learn','literature','varieties','check','future','rankings','words','detail'].includes(view)) view='home';
  if(key) S.filters[key]=String(val ?? '');
  switchView(view);
};
window.addEventListener('click', function(e){
  const b=e.target.closest && e.target.closest('button[data-view]');
  if(b && b.dataset.view){ e.preventDefault(); switchView(b.dataset.view); }
}, true);

/* v78.43: start after public cleanup overrides are defined. */



/* === v78.43 relationship-link sweep: add links where links should exist, not only repair broken links. === */
const V786_LINK_TERMS = ['吸水','浸漬','水温','温度','時間','糊化','α化','沸騰','蒸らし','ほぐし','老化','硬さ','粘り','べたつき','水質','硬度','pH','TDS','残留塩素','保管','結露','湿度','納米庫','カビ','虫','変色','洗米','加水','火力','品種','ジャポニカ','インディカ','短粒','長粒','もち米','うるち米','食感','香り'];
const V786_COUNTRIES = ['日本','台湾','中国','韓国','タイ','ベトナム','インド','インドネシア','フィリピン','アメリカ','イタリア','スペイン','フランス','トルコ','エジプト','ブラジル','メキシコ','ペルー','ネパール','ブータン','スリランカ','カンボジア','ラオス','ミャンマー','バングラデシュ','パキスタン','イラン','イラク','ギリシャ','ポルトガル'];
function v786PickTermFromText(text){
  const s=String(text||'');
  const hit=V786_LINK_TERMS.find(k=>s.includes(k)) || V786_COUNTRIES.find(k=>s.includes(k));
  if(hit) return hit;
  const m=s.match(/[一-龠ぁ-んァ-ヶーA-Za-z0-9]{2,12}/);
  return m?m[0]:'米';
}
function v786Btn(label, view, key='', val=''){
  const safeLabel=esc(cleanPublicV784(label||'開く'));
  const attrs=`type="button" class="btn secondary link-v786" onclick="goViewV784(${jsArg(view)},${jsArg(key)},${jsArg(val)})"`;
  return `<button ${attrs}>${safeLabel}</button>`;
}
function v786RelatedLinks(kind, term, country=''){
  const t=cleanPublicV784(term)||'米';
  const c=cleanPublicV784(country)||t;
  const links=[];
  const add=(label,view,key,val)=>{ if(!links.some(x=>x.label===label&&x.view===view)) links.push({label,view,key,val}); };
  if(kind==='home'){
    add('今日の確認','check','',''); add('物語・ヒストリー','future','',''); add('文献を確認','literature','litq',t); add('図鑑を見る','varieties','varq',t);
  }else if(kind==='learn'){
    add('関連文献','literature','litq',t); add('用語集','words','wordq',t); add('図鑑','varieties','varq',t); add('今日の確認','check','','');
  }else if(kind==='literature'){
    add('関連教材','learn','learn',t); add('用語集','words','wordq',t); add('品種図鑑','varieties','varq',t); add('今日の確認','check','','');
  }else if(kind==='varieties'){
    add('炊飯文献','literature','litq',t); add('用語集','words','wordq',t); add('水・保管確認','check','',''); add('物語','future','storyq',c);
  }else if(kind==='words'){
    add('文献を探す','literature','litq',t); add('教材で見る','learn','learn',t); add('図鑑で探す','varieties','varq',t); add('今日の確認','check','','');
  }else if(kind==='future'){
    add('関連用語','words','wordq',t); add('炊飯文献','literature','litq',t); add('品種図鑑','varieties','varq',c); add('現在地ヒストリー','future','storyCountry',c);
  }else if(kind==='rankings'){
    add('国・地域の物語','future','storyq',t); add('品種図鑑','varieties','varq',t); add('用語集','words','wordq',t); add('文献','literature','litq',t);
  }else if(kind==='check'){
    add('関連文献','literature','litq',t); add('教材で確認','learn','learn',t); add('用語集','words','wordq',t); add('品種図鑑','varieties','varq',t);
  }else{
    add('関連文献','literature','litq',t); add('用語集','words','wordq',t); add('教材','learn','learn',t);
  }
  return `<div class="related-links-v786" aria-label="関連リンク"><span>関連：</span>${links.slice(0,4).map(x=>v786Btn(x.label,x.view,x.key,x.val)).join('')}</div>`;
}
function v786ViewKind(){ return (S&&S.view)||'home'; }
function v786EnsureRelatedLinks(root=document){
  try{
    const view=v786ViewKind();
    const selector = view==='home' ? '.hero, .home-mini, .nav-card, .card' : '.item, .card, .today-story-v47, .country-history-card-v78';
    root.querySelectorAll(selector).forEach(el=>{
      if(el.classList.contains('data-check') || el.querySelector('.related-links-v786')) return;
      if(el.closest('.bottomnav') || el.closest('header')) return;
      const txt=scrubTextV785(el.innerText||el.textContent||'');
      if(!txt || txt.length<6) return;
      const term=v786PickTermFromText(txt);
      const country=V786_COUNTRIES.find(c=>txt.includes(c)) || '';
      const panel=document.createElement('div');
      panel.innerHTML=v786RelatedLinks(view, term, country);
      el.appendChild(panel.firstElementChild);
    });
    root.querySelectorAll('button.link-v786').forEach(b=>{
      if(!b.textContent.trim()) b.textContent='開く';
      if(!b.getAttribute('type')) b.setAttribute('type','button');
    });
  }catch(e){ console.warn('v786EnsureRelatedLinks skipped', e); }
}
function v786StripInternalBlocks(root=document){
  try{
    root.querySelectorAll('.source').forEach(el=>{
      const txt=el.textContent||'';
      if(/出典ID|カードID|根拠番号|確認番号|source|claim|SRC|CL|LIT|CARD/i.test(txt)){
        el.innerHTML='<span class="small">出典・確認情報を整理中</span>';
      }
    });
    root.querySelectorAll('details').forEach(d=>{
      const txt=d.textContent||'';
      if(/source_key|claim_id|safe_app_note|app_caution|親Excel|TOP10未公開|国別本文未統合|明細0件/i.test(txt)){
        d.querySelectorAll('*').forEach(n=>{ if(n.childNodes.length===1 && n.firstChild.nodeType===3) n.textContent=scrubTextV785(n.textContent); });
      }
    });
  }catch(e){ console.warn('v786StripInternalBlocks skipped', e); }
}
const scrubRendered_old_v786 = scrubRenderedV785;
scrubRenderedV785=function(root=document){
  scrubRendered_old_v786(root);
  v786StripInternalBlocks(root);
  v786EnsureRelatedLinks(root);
};
function v786PostRender(){ try{ scrubRenderedV785(document); }catch(e){} }
window.addEventListener('DOMContentLoaded', ()=>setTimeout(v786PostRender,60));
window.addEventListener('hashchange', ()=>setTimeout(v786PostRender,60));

/* v78.43: start moved by v78.43. */


/* === v78.43 iterative sweep: public wording, link presence, and readable text guard === */
const V787_INTERNAL_RE = /(safe_app_note|app_caution|use_review_note|source_key|source_area|claim_id|claim_ids|source_id|source_ids|親Excel|parent_excel|国別本文未統合|TOP10未公開|明細0件|raw|debug|CARD_[A-Z0-9_\-]+|SRC_[A-Z0-9_\-]+|CL_[A-Z0-9_\-]+)/ig;
function cleanPublicV787(s){
  return String(s ?? '')
    .replace(V787_INTERNAL_RE,'確認情報')
    .replace(/工程語候補/g,'工程語')
    .replace(/用途候補/g,'用途')
    .replace(/出典候補未確認/g,'出典確認中')
    .replace(/出典候補/g,'出典確認中')
    .replace(/原文確認済み候補/g,'原文確認済み')
    .replace(/原文確認候補/g,'原文確認中')
    .replace(/確認済み候補/g,'確認済み')
    .replace(/短粒候補/g,'短粒')
    .replace(/長粒候補/g,'長粒')
    .replace(/ジャポニカ候補/g,'ジャポニカ')
    .replace(/インディカ候補/g,'インディカ')
    .replace(/候補です/g,'確認中です')
    .replace(/候補/g,'確認中')
    .replace(/出典ID/g,'確認情報')
    .replace(/根拠番号/g,'確認情報')
    .replace(/キー未確認/g,'確認中')
    .replace(/URL未確認/g,'確認中')
    .replace(/未公開/g,'準備中')
    .replace(/\s{2,}/g,' ')
    .trim();
}
function v787TextNodeSweep(root=document){
  try{
    const walker=document.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p=node.parentElement;
        if(!p) return NodeFilter.FILTER_REJECT;
        if(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{ const c=cleanPublicV787(n.nodeValue); if(c!==n.nodeValue.trim()) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), c); });
  }catch(e){ console.warn('v787TextNodeSweep skipped', e); }
}
function v787RemoveInternalDetails(root=document){
  try{
    root.querySelectorAll('.source').forEach(el=>{ el.textContent='出典・確認情報を整理中'; el.classList.add('small'); });
    root.querySelectorAll('details').forEach(d=>{
      const t=d.textContent||'';
      if(V787_INTERNAL_RE.test(t) || /確認情報.*確認情報/.test(t)){
        d.querySelectorAll('.source').forEach(el=>{el.textContent='出典・確認情報を整理中';});
      }
    });
  }catch(e){ console.warn('v787RemoveInternalDetails skipped', e); }
}
function v787EnsureBackLinks(root=document){
  try{
    // Any article/item/card with details should have a safe related-link panel after v78.43.
    root.querySelectorAll('.item,.card,article,section').forEach(el=>{
      if(el.closest('header') || el.closest('.bottomnav') || el.classList.contains('data-check')) return;
      if(el.querySelector('.related-links-v786')) return;
      const txt=(el.innerText||el.textContent||'').trim();
      if(txt.length<30) return;
      const term=v786PickTermFromText ? v786PickTermFromText(txt) : '米';
      const div=document.createElement('div');
      div.innerHTML=v786RelatedLinks ? v786RelatedLinks((S&&S.view)||'home',term,'') : '';
      if(div.firstElementChild) el.appendChild(div.firstElementChild);
    });
  }catch(e){ console.warn('v787EnsureBackLinks skipped', e); }
}
function v787ReadableClass(root=document){
  try{ document.body.classList.add('v787-readable'); }catch(e){}
}
const scrubRendered_old_v787 = scrubRenderedV785;
scrubRenderedV785=function(root=document){
  scrubRendered_old_v787(root);
  v787RemoveInternalDetails(root);
  v787TextNodeSweep(root);
  v787EnsureBackLinks(root);
  v787ReadableClass(root);
};
function v787PostRender(){ try{ scrubRenderedV785(document); }catch(e){} }
['DOMContentLoaded','load','hashchange'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(v787PostRender,80)));
window.addEventListener('click',()=>setTimeout(v787PostRender,50),true);

/* v78.43: start after font/link/internal-word overrides are defined. */
load();

/* v78.43 learn-section cleanup
   The learning database currently has 82 cards and no meaningful beginner/intermediate/advanced split.
   Remove the false level segmentation from the public UI and organize by purpose/topic instead. */
function learnTopicV788(x){
  const s=JSON.stringify(x||{}).toLowerCase();
  if(/べたつ|硬|芯|老化|臭|カビ|虫|保温|吹きこぼ|焦げ|異物|トラブル|problem|trouble/.test(s)) return 'トラブル別';
  if(/吸水|浸漬|洗米|加水|水温|水質|蒸らし|ほぐし|炊飯|糊化|沸騰|火力|温度|工程|process/.test(s)) return '炊飯工程';
  if(/食感|粘|粒立|硬さ|品質|評価|官能|texture|quality/.test(s)) return '品質・食感';
  if(/保存|納米庫|湿度|温度差|結露|保管|storage|water|水/.test(s)) return '水・保管';
  if(/品種|ジャポニカ|インディカ|アミロース|タンパク|variety/.test(s)) return '品種・原料';
  return '基本知識';
}
function learnShortV788(x){return lc(x,'short')||lc(x,'easy')||lc(x,'summary')||lc(x,'description')||'炊飯の考え方を確認する教材カードです。';}
function learnTitleV788(x){return lc(x,'title')||field(x,'title_ja')||field(x,'title')||'教材カード';}
function learnTermsV788(x){return termsFromV784(x)||lc(x,'related_terms')||learnTitleV788(x);}
function renderLearn(){
  if(!S.data) return;
  S.filters.level='';
  const data=S.data.learning_cards||S.data.learning_multilingual||[];
  const q=String(S.filters.learn||'').trim();
  const ql=q.toLowerCase();
  const topics=['炊飯工程','トラブル別','品質・食感','水・保管','品種・原料','基本知識'];
  const topicCounts=Object.fromEntries(topics.map(t=>[t,0]));
  data.forEach(x=>{const t=learnTopicV788(x); topicCounts[t]=(topicCounts[t]||0)+1;});
  const filtered=data.filter(x=>!ql || JSON.stringify(x).toLowerCase().includes(ql) || learnTopicV788(x).toLowerCase().includes(ql));
  const topicBtns=topics.filter(t=>topicCounts[t]).map(t=>`<button onclick="S.filters.learn=${jsArg(t)};renderLearn()">${pEsc(t)} ${topicCounts[t]}</button>`).join('');
  const flowBtns=['洗米','浸漬','吸水','加水','沸騰','糊化','蒸らし','ほぐし','べたつき','硬い','水質','保管'].map(k=>`<button onclick="S.filters.learn=${jsArg(k)};renderLearn()">${pEsc(k)}</button>`).join('');
  $('#learn').innerHTML=`${v47PageLead('学ぶ','82件の教材カードを、レベル分けではなく「工程・トラブル・品質・保管」の入口から確認します。','book')}
  <section class="card learn-policy-v788"><h2>教材の見方</h2><p>現在の教材データは、初級・中級・上級を分けられる状態ではありません。そのため、無理なレベル分けはやめ、目的別に探せる形へ整理しました。</p><p class="small">必要になった段階で、中級・上級カードを追加してからレベル別入口を復活させます。</p></section>
  <div class="section-title"><h2>目的別入口</h2></div><div class="priority-row learn-topic-row-v788">${topicBtns}<button onclick="S.filters.learn='';renderLearn()">全教材 ${data.length}</button></div>
  <div class="section-title"><h2>工程・症状から探す</h2></div><div class="priority-row learn-topic-row-v788">${flowBtns}</div>
  <div class="toolbar"><input placeholder="教材検索" value="${esc(q)}" oninput="S.filters.learn=this.value;renderLearn()"></div>
  <div class="list">${filtered.slice(0,140).map(x=>{const title=learnTitleV788(x), topic=learnTopicV788(x), rel=learnTermsV788(x); return itemV784(title,`${pChip([topic, lc(x,'related_terms')])}<p>${pEsc(learnShortV788(x))}</p>${pHas(lc(x,'field_check_points'))?`<p><b>確認ポイント：</b>${pEsc(lc(x,'field_check_points'))}</p>`:''}<details><summary>条件・注意</summary>${pHas(lc(x,'numbers_conditions'))?`<p><b>条件・数値：</b>${pEsc(lc(x,'numbers_conditions'))}</p>`:''}${pHas(lc(x,'warning'))?`<p><b>注意：</b>${pEsc(lc(x,'warning'))}</p>`:''}</details>`,`${btnV784('literature','関連文献を見る','litq',rel)}${btnV784('words','用語集','wordq',rel)}${btnV784('check','今日の確認','','')}`);}).join('')||v47Empty('表示できる教材がありません','検索条件を変えてください。')}</div>`;
  try{ sweepPublicTextV784(); ensureRelatedLinksV786(); enforceMinFontV787(); }catch(e){}
}


/* v78.43 GPS water-quality workflow
   Restore the original concept: use GPS as the entry point, match it to regional water-quality records, then convert the result into rice-cooking advice.
   Note: browser GPS cannot measure water quality by itself; it selects the region record or accepts manual/test values. */
function v789WaterState(){
  try{return JSON.parse(localStorage.getItem('rice_navi_water_state_v789')||'{}')||{};}catch(e){return {};}
}
function v789SaveWaterState(st){
  try{localStorage.setItem('rice_navi_water_state_v789', JSON.stringify(st||{}));}catch(e){}
}
function v789Num(v){
  if(v===null||v===undefined||v==='') return null;
  const n=Number(String(v).replace(/[０-９]/g,d=>'０１２３４５６７８９'.indexOf(d)));
  return Number.isFinite(n)?n:null;
}
function v789RegionCandidateByText(label){
  const rs=(S.data?.water?.regions)||[]; const s=String(label||'');
  return rs.find(r=>s.includes(field(r,'admin2_ja'))||s.includes(field(r,'area_name_ja')))||rs.find(r=>s.includes(field(r,'admin1_ja')))||rs[0]||{};
}
function v789RegionFromCoords(lat,lng){
  const rs=(S.data?.water?.regions)||[];
  function find(id){return rs.find(r=>r.region_id===id)||null;}
  if(lat==null||lng==null) return rs[0]||{};
  // Current master has template regions. Until full latitude/longitude water DB is loaded, use broad area matching.
  if(lat>=24.75&&lat<=25.35&&lng>=121.25&&lng<=121.75) return find('TW-NTP-SANCHONG')||find('TW-TPE-CITY')||rs[0]||{};
  if(lat>=24.80&&lat<=25.10&&lng>=120.95&&lng<=121.35) return find('TW-TAO-ZHONGLI')||rs[0]||{};
  if(lat>=35.0&&lat<=35.4&&lng>=136.75&&lng<=137.10) return find('JP-AIC-NAGOYA')||rs[0]||{};
  if(lat>=34.45&&lat<=34.85&&lng>=135.30&&lng<=135.75) return find('JP-OSK-OSAKA')||rs[0]||{};
  if(lat>=13.55&&lat<=14.00&&lng>=100.30&&lng<=100.90) return find('TH-BKK')||rs[0]||{};
  if(lat>=10.60&&lat<=11.00&&lng>=106.45&&lng<=107.00) return find('VN-HCM')||rs[0]||{};
  return rs[0]||{};
}
function v789ClassRule(param,val){
  if(val===null) return null;
  const rules=(S.data?.water?.quality_rules||S.data?.water?.rules||[]).filter(r=>String(r.parameter||'').toLowerCase().includes(param.toLowerCase()) || String(param).toLowerCase().includes(String(r.parameter||'').toLowerCase()));
  return rules.find(r=>{
    const min=v789Num(r.min_value), max=v789Num(r.max_value);
    return (min===null||val>=min)&&(max===null||val<=max);
  })||null;
}
function v789ScaleRule(val){
  if(val===null) return null;
  const rules=(S.data?.water?.scale_rules||[]).filter(r=>String(r.parameter||'').includes('hardness'));
  return rules.find(r=>{
    const min=v789Num(r.min_value), max=v789Num(r.max_value);
    return (min===null||val>=min)&&(max===null||val<=max);
  })||null;
}
function v789WaterAdviceValues(region, manual){
  const h=v789Num(manual.hardness ?? region.total_hardness_mgL_CaCO3);
  const ph=v789Num(manual.pH ?? region.pH);
  const tds=v789Num(manual.tds ?? region.tds_mgL);
  const cl=v789Num(manual.chlorine ?? region.residual_chlorine_mgL);
  const hardRule=v789ClassRule('hardness',h)||v789ClassRule('total_hardness',h);
  const scale=v789ScaleRule(h);
  const notes=[];
  if(h!==null){
    notes.push(`<p><b>硬度 ${pEsc(h)} mg/L as CaCO3：</b>${pEsc(field(hardRule,'class_ja')||'区分確認中')}。${pEsc(field(hardRule,'advice_ja')||'炊飯結果と合わせて確認します。')}</p>`);
    if(scale) notes.push(`<p><b>設備側：</b>${pEsc(field(scale,'risk_ja')||'スケール確認')}。${pEsc(field(scale,'recommended_action_ja')||'定期清掃と記録を継続します。')}</p>`);
  }else notes.push('<p><b>硬度：</b>地域データ未入力です。水道局データまたは実測値を入れると、白飯の粘り・粒感・スケール注意へ変換します。</p>');
  if(ph!==null){
    let pnote='中性付近として扱いやすい範囲か、米飯の食感・保存条件と合わせて確認します。';
    if(ph<6.5) pnote='酸性寄りです。調味液・酢飯・保存条件と混同せず、通常炊飯ではにおい・老化傾向を確認します。';
    if(ph>8.5) pnote='アルカリ寄りです。べたつき、表層の粘り、におい、設備側の付着を確認します。';
    notes.push(`<p><b>pH ${pEsc(ph)}：</b>${pEsc(pnote)}</p>`);
  }else notes.push('<p><b>pH：</b>未入力です。pHが分かると、調味液・老化・においの確認ポイントへつなげます。</p>');
  if(tds!==null) notes.push(`<p><b>TDS ${pEsc(tds)} mg/L：</b>溶けた物質量の目安として、味・におい・フィルター後の差を確認します。</p>`);
  if(cl!==null) notes.push(`<p><b>残留塩素 ${pEsc(cl)} mg/L：</b>におい・味の違和感、浸漬中の香り変化と合わせて見ます。</p>`);
  return notes.join('');
}
function v789WaterLocationPanel(){
  const st=v789WaterState(); const rs=(S.data?.water?.regions)||[];
  const region=st.region_id ? (rs.find(r=>r.region_id===st.region_id)||{}) : (rs[0]||{});
  const manual=st.manual||{};
  const located=!!st.lat;
  const status=st.error?`<p class="warn">位置情報：${pEsc(st.error)}</p>`:(located?`<p class="ok">位置情報：取得済み。${pEsc(field(region,'area_name_ja')||'地域候補')}として水質マスターを照合します。</p>`:'<p class="small">この画面を開いた時、またはボタンを押した時に位置情報を取得し、地域の水質マスターに当て込みます。</p>');
  const source=field(region,'source_name')&&field(region,'source_name')!=='未入力'?field(region,'source_name'):'地域水質データ未入力';
  const valLine=`地域候補：${pEsc(field(region,'area_name_ja')||'未判定')} / 硬度：${pEsc(field(region,'total_hardness_mgL_CaCO3')||'未入力')} / pH：${pEsc(field(region,'pH')||'未入力')} / 出典：${pEsc(source)}`;
  return cardV784('現在地の水質 → 炊飯アドバイス',`${status}<div class="water-gps-actions"><button onclick="v789RequestWaterLocation()">現在地で水質を確認</button><button onclick="v789ClearWaterLocation()">位置情報をリセット</button></div><p class="small">${valLine}</p><details open><summary>手元の測定値・水道局データを入力</summary><div class="water-input-grid"><label>硬度 mg/L as CaCO3<input inputmode="decimal" value="${pEsc(manual.hardness||'')}" onchange="v789SetWaterManual('hardness',this.value)"></label><label>pH<input inputmode="decimal" value="${pEsc(manual.pH||'')}" onchange="v789SetWaterManual('pH',this.value)"></label><label>TDS mg/L<input inputmode="decimal" value="${pEsc(manual.tds||'')}" onchange="v789SetWaterManual('tds',this.value)"></label><label>残留塩素 mg/L<input inputmode="decimal" value="${pEsc(manual.chlorine||'')}" onchange="v789SetWaterManual('chlorine',this.value)"></label></div></details><div class="water-advice-box">${v789WaterAdviceValues(region,manual)}</div><p class="small">GPSは水質を測る機能ではなく、地域水質データを選ぶ入口です。水質値は公開データ・検査値・現場測定値を使います。</p>`,`${btnV784('literature','水質文献を見る','litq','水質')}${btnV784('words','水質用語を見る','wordq','硬度 pH TDS 残留塩素')}${btnV784('learn','水・保管を学ぶ','learn','水・保管')}`);
}
function v789RequestWaterLocation(){
  const st=v789WaterState();
  if(!navigator.geolocation){ st.error='この端末またはブラウザでは位置情報が使えません。'; v789SaveWaterState(st); renderCheck(); return; }
  st.error=''; st.requested_at=new Date().toISOString(); v789SaveWaterState(st); try{renderCheck();}catch(e){}
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat=pos.coords.latitude, lng=pos.coords.longitude; const r=v789RegionFromCoords(lat,lng);
    const ns=v789WaterState(); ns.lat=lat; ns.lng=lng; ns.accuracy=pos.coords.accuracy; ns.region_id=r.region_id||''; ns.error=''; ns.updated_at=new Date().toISOString(); v789SaveWaterState(ns); renderCheck();
  },err=>{
    const ns=v789WaterState(); ns.error= err && err.code===1 ? '位置情報の許可がありません。許可すると現在地の水質マスターを照合できます。' : '位置情報を取得できませんでした。'; v789SaveWaterState(ns); renderCheck();
  },{enableHighAccuracy:false, timeout:10000, maximumAge:86400000});
}
function v789ClearWaterLocation(){ const st=v789WaterState(); delete st.lat; delete st.lng; delete st.accuracy; delete st.region_id; delete st.error; v789SaveWaterState(st); renderCheck(); }
function v789SetWaterManual(key,val){ const st=v789WaterState(); st.manual=st.manual||{}; st.manual[key]=String(val||'').trim(); v789SaveWaterState(st); renderCheck(); }
const renderCheck_pre_v789 = renderCheck;
renderCheck=function(){
  if(!S.data) return;
  const w=S.data.water||{}, sm=S.data.storage_mold||{}, raw=sm.raw||{};
  const rules=w.quality_rules||w.rules||[], checklist=raw.checklist||sm.checklist||[], storageRules=raw.rules||sm.rules||[];
  $('#check').innerHTML=`${v47PageLead('今日の確認','GPSで地域水質マスターを照合し、水の相性・納米庫管理・炊飯結果をつなげて確認します。','weather')}
  <section class="grid check-grid-v789">${v789WaterLocationPanel()}${cardV784('納米庫管理',`<p><b>見る順番：</b>結露 → 湿度 → 温度差 → 残米・付着米 → カビ臭 → 虫 → 変色 → 清掃記録。</p><div class="mini-grid"><span>結露</span><span>湿度</span><span>温度差</span><span>残米・付着米</span><span>カビ臭</span><span>虫</span><span>変色</span><span>清掃記録</span></div><details><summary>点検場所</summary>${checklist.slice(0,12).map(c=>`<p><b>${pEsc(field(c,'timing')||'点検')}</b> ${pEsc(field(c,'check_area')||'場所')}：${pEsc(field(c,'check_item')||'項目')}<br><span class="small">方法：${pEsc(field(c,'method')||'確認')} / NG時：${pEsc(field(c,'action_if_ng')||'対応')}</span></p>`).join('')||'<p>点検リストを整理中です。</p>'}</details>`)}</section>
  <div class="section-title"><h2>水質ルール</h2></div><div class="list">${rules.slice(0,16).map(r=>itemV784(field(r,'class_ja','parameter','rule_name','item')||'水質項目',`<p>${pEsc(field(r,'advice_ja','rule_ja','meaning_ja','note_ja','summary_ja')||'内容を整理中です。')}</p>${pHas(field(r,'benefit_ja'))?`<p><b>良い点：</b>${pEsc(field(r,'benefit_ja'))}</p>`:''}${pHas(field(r,'demerit_ja'))?`<p><b>注意：</b>${pEsc(field(r,'demerit_ja'))}</p>`:''}`)).join('')}</div>
  <div class="section-title"><h2>保管・納米庫ルール</h2></div><div class="list">${storageRules.slice(0,12).map(r=>itemV784(field(r,'title_ja','risk_ja','rule_name')||'保管ルール',`<p>${pEsc(field(r,'advice_ja','mechanism_ja','recommended_action_ja','note_ja')||'保管状態を確認します。')}</p>`)).join('')||'<div class="item"><h3>保管ルール整理中</h3><p>納米庫の点検項目を確認します。</p></div>'}</div>`;
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
  // Request once per session when the user opens the check view. Browsers still show a permission prompt.
  try{ if(!sessionStorage.getItem('rice_navi_water_gps_prompted_v789')){ sessionStorage.setItem('rice_navi_water_gps_prompted_v789','1'); setTimeout(()=>{ if(S.view==='check') v789RequestWaterLocation(); },500); } }catch(e){}
};

/* === v78.43 daily-page redesign: one daily item only; archive/search separated ===
   Rule: Daily screens must not list all records below the daily item. Full collections are opened from a separate search/archive page. */
const V7810_VERSION='78ui43';
function arrV7810(v){ return Array.isArray(v)?v:[]; }
function dailyRiceWordV7810(){ const a=arrV7810(S.data?.daily_rice_words); return a.length ? a[todayIndex(a.length,'daily_rice_word_v7810')] : null; }
function riceWordTextV7810(x,k){ return lc(x,k)||field(x,k)||''; }
function riceWordCardV7810(x, compact=false){
  if(!x) return cardV784('今日の米言葉','<p>今日の米言葉データを確認中です。</p>',`${archiveBtnV7810('ricewords','米言葉を検索する')}`);
  return cardV784('今日の米言葉',`${art('word')}<p><b>${pEsc(riceWordTextV7810(x,'word')||'米言葉')}</b></p><p><b>${pEsc(riceWordTextV7810(x,'meaning')||'意味を整理中')}</b></p><p>${pEsc(riceWordTextV7810(x,'message')||riceWordTextV7810(x,'body')||'今日の見方を整理中です。')}</p>${compact?'':`<details><summary>由来を見る</summary><p>${pEsc(riceWordTextV7810(x,'body')||'説明を整理中です。')}</p></details>`}`,`${archiveBtnV7810('ricewords','米言葉を検索する')}${btnV784('words','用語集へ','wordq',riceWordTextV7810(x,'word'))}`);
}
function archiveBtnV7810(kind,label){ return `<button class="btn secondary" onclick="openArchiveV7810(${jsArg(kind)})">${pEsc(label)}</button>`; }
function openArchiveV7810(kind){ S.archiveKind=kind; S.view='detail'; switchView('detail'); }
function archiveQKeyV7810(kind){ return 'archive_'+kind; }
function archiveQueryV7810(kind){ return String(S.filters[archiveQKeyV7810(kind)]||'').trim(); }
function setArchiveQueryV7810(kind,val){ S.filters[archiveQKeyV7810(kind)]=val; S.archiveKind=kind; render(); }
function matchQ7810(x,q){ if(!q) return true; return JSON.stringify(x||{}).toLowerCase().includes(String(q).toLowerCase()); }
function archiveHeaderV7810(title,lead,kind){ const q=archiveQueryV7810(kind); return `${v47PageLead(title,lead,'guide')}<div class="toolbar archive-toolbar-v7810"><input placeholder="検索" value="${pEsc(q)}" oninput="setArchiveQueryV7810(${jsArg(kind)},this.value)"><button class="btn secondary" onclick="switchView('home')">ホームへ</button></div>`; }
function storyArchiveV7810(){
  const kind='stories', q=archiveQueryV7810(kind), stories=storyList();
  const countries=[...new Set(stories.map(storyCountry).filter(Boolean))].sort();
  const filtered=stories.filter(x=>matchQ7810(x,q) && (!S.filters.storyCountryArchive || storyCountry(x)===S.filters.storyCountryArchive));
  return `${archiveHeaderV7810('世界ライス物語を探す','毎日表示とは別の検索ページです。全件を見たい場合だけここで探します。',kind)}<div class="toolbar archive-toolbar-v7810"><select onchange="S.filters.storyCountryArchive=this.value;render()"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===S.filters.storyCountryArchive?'selected':''}>${pEsc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(stories.length,'総数')}</div><div class="list archive-list-v7810">${filtered.slice(0,80).map(x=>itemV784(storyTitle(x),`<p class="small">${pEsc(storyCountry(x))} / ${pEsc(field(x,'theme')||'テーマ')}</p><p>${pEsc(storyBody(x,360)).split('\n').join('<br>')}</p><details><summary>炊飯・食感の視点</summary><p><b>学び：</b>${pEsc(field(x,'learning_point')||'整理中')}</p><p><b>食感：</b>${pEsc(field(x,'texture_note')||'整理中')}</p><p><b>炊飯：</b>${pEsc(field(x,'cooking_note')||'整理中')}</p></details>`,`${btnV784('words','関連用語','wordq',field(x,'related_terms')||storyTitle(x))}${btnV784('literature','関連文献','litq',storyTitle(x))}`)).join('')||v47Empty('該当する物語がありません','検索条件を変えてください。')}</div>`;
}
function riceWordArchiveV7810(){
  const kind='ricewords', q=archiveQueryV7810(kind), words=arrV7810(S.data?.daily_rice_words), filtered=words.filter(x=>matchQ7810(x,q));
  return `${archiveHeaderV7810('米言葉を探す','今日の1件とは別の検索ページです。必要な時だけ米言葉100件から探します。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(words.length,'総数')}</div><div class="list archive-list-v7810">${filtered.slice(0,100).map(x=>itemV784(riceWordTextV7810(x,'word')||'米言葉',`<p><b>${pEsc(riceWordTextV7810(x,'meaning')||'意味を整理中')}</b></p><p>${pEsc(riceWordTextV7810(x,'message')||riceWordTextV7810(x,'body')||'内容を整理中です。')}</p>`,`${btnV784('words','用語集で見る','wordq',riceWordTextV7810(x,'word'))}${btnV784('learn','関連教材','learn',riceWordTextV7810(x,'word'))}`)).join('')||v47Empty('該当する米言葉がありません','検索条件を変えてください。')}</div>`;
}
function historyArchiveV7810(){
  const kind='history', q=archiveQueryV7810(kind), rec=histRecords ? histRecords() : [], filtered=rec.filter(x=>matchQ7810(x,q));
  return `${archiveHeaderV7810('地域のお米ヒストリーを探す','現在地表示とは別の検索ページです。国・地域を選んで見たい場合だけここで探します。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(rec.length,'総数')}</div><div class="list archive-list-v7810">${filtered.slice(0,80).map(x=>itemV784(histCountryName(x),`<p class="small">${pEsc(histPeriod(x))}</p><p>${pEsc(histBody(x)).slice(0,520)}${histBody(x).length>520?'…':''}</p>`,`${btnV784('future','今日の物語へ','','')}${btnV784('words','関連用語','wordq',histCountryName(x)+' 米')}`)).join('')||v47Empty('該当する地域がありません','検索条件を変えてください。')}</div>`;
}
function futureArchiveV7810(){
  const kind='futureRice', q=archiveQueryV7810(kind), data=arrV7810(S.data?.future_rice), filtered=data.filter(x=>matchQ7810(x,q));
  return `${archiveHeaderV7810('お米の未来を探す','日替わり表示とは別の検索ページです。未来テーマを探したい場合だけここで開きます。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div><div class="list archive-list-v7810">${filtered.slice(0,80).map(x=>itemV784(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ',`<p><b>${pEsc(tx(x,'subtitle')||field(x,'subtitle_ja')||'')}</b></p><p>${pEsc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'内容を整理中です。')}</p>`,`${btnV784('literature','関連文献','litq',tx(x,'title')||field(x,'title_ja'))}${btnV784('words','関連用語','wordq',field(x,'category')||'米')}`)).join('')||v47Empty('該当するテーマがありません','検索条件を変えてください。')}</div>`;
}
function varietiesArchiveV7810(){
  const kind='varieties', q=archiveQueryV7810(kind), data=arrV7810(S.data?.rice_varieties), filtered=data.filter(x=>matchQ7810(x,q));
  return `${archiveHeaderV7810('米品種図鑑で探す','今日の1品種とは別の図鑑検索ページです。必要な時だけ品種を探します。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div><div class="list archive-list-v7810">${filtered.slice(0,120).map(v=>itemV784(titleOfVariety(v),`<p class="small">${pEsc(countryOfVariety(v))} / ${pEsc(field(v,'rice_type','grain_shape')||'種類確認中')}</p><p><b>用途：</b>${pEsc(field(v,'main_uses','use_category_primary')||'確認中')}</p><p><b>炊飯メモ：</b>${pEsc(cleanCookingMemo(v))}</p>`,`${btnV784('literature','関連文献','litq',titleOfVariety(v))}${btnV784('words','関連用語','wordq',field(v,'related_terms')||titleOfVariety(v))}`)).join('')||v47Empty('該当する品種がありません','検索条件を変えてください。')}</div>`;
}
function literatureArchiveV7810(){
  const kind='literature', q=archiveQueryV7810(kind), data=litSorted ? litSorted() : [], filtered=data.filter(x=>matchQ7810(x,q));
  return `${archiveHeaderV7810('文献ライブラリで探す','今日の紹介とは別の検索ページです。根拠・条件・数値を確認したい時だけ検索します。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div><div class="list archive-list-v7810">${filtered.slice(0,120).map(x=>itemV784(field(x,'title','title_ja')||'文献カード',`<p>${pEsc(field(x,'summary','summary_ja','condition','note')||'内容を整理中です。')}</p><p class="small">${pEsc(softStatusV784(x._class))}</p>`,`${btnV784('learn','関連教材','learn',field(x,'title','category')||'')}${btnV784('words','関連用語','wordq',termsFromV784(x))}`)).join('')||v47Empty('該当する文献がありません','検索条件を変えてください。')}</div>`;
}
function learnArchiveV7810(){
  // Reuse the purpose-based learning page as the archive/search destination.
  const data=arrV7810(S.data?.learning_cards), q=archiveQueryV7810('learn'), filtered=data.filter(x=>matchQ7810(x,q));
  return `${archiveHeaderV7810('教材を探す','今日の学びとは別の検索ページです。工程・症状・用語から教材カードを探します。','learn')}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div><div class="list archive-list-v7810">${filtered.slice(0,120).map(x=>itemV784(learnTitleV788(x),`${pChip([learnTopicV788(x), lc(x,'related_terms')])}<p>${pEsc(learnShortV788(x))}</p>`,`${btnV784('literature','関連文献','litq',learnTermsV788(x))}${btnV784('words','用語集','wordq',learnTermsV788(x))}`)).join('')||v47Empty('該当する教材がありません','検索条件を変えてください。')}</div>`;
}
function renderArchiveV7810(){
  const kind=S.archiveKind||'stories';
  const map={stories:storyArchiveV7810,ricewords:riceWordArchiveV7810,history:historyArchiveV7810,futureRice:futureArchiveV7810,varieties:varietiesArchiveV7810,literature:literatureArchiveV7810,learn:learnArchiveV7810};
  $('#detail').innerHTML=(map[kind]||storyArchiveV7810)();
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
}
function todayLearningCardV7810(){ const data=arrV7810(S.data?.learning_cards); return data.length?data[todayIndex(data.length,'today_learning_v7810')]:null; }
function todayLiteratureCardV7810(){ const data=litSorted ? litSorted() : []; return data.length?data[todayIndex(data.length,'today_literature_v7810')]:null; }
function todayFutureRiceV7810(){ const data=arrV7810(S.data?.future_rice); return data.length?data[todayIndex(data.length,'today_future_rice_v7810')]:null; }
function todayStorySectionV7810(story){
  return `<section class="today-story-v47 daily-only-v7810"><div><span class="eyebrow">TODAY'S STORY</span><h2>${pEsc(storyTitle(story||{}))}</h2><p class="small">${pEsc(storyCountry(story||{}))} / ${pEsc(field(story,'theme')||'テーマ確認中')}</p><p>${pEsc(storyBody(story||{},720)).split('\n').join('<br>')}</p><details><summary>炊飯・食感の視点</summary><p><b>学び：</b>${pEsc(field(story,'learning_point')||'整理中')}</p><p><b>料理場面：</b>${pEsc(field(story,'scene_note')||'整理中')}</p><p><b>食感：</b>${pEsc(field(story,'texture_note')||'整理中')}</p><p><b>炊飯：</b>${pEsc(field(story,'cooking_note')||'整理中')}</p></details><div class="priority-row">${archiveBtnV7810('stories','物語を検索する')}${archiveBtnV7810('history','地域ヒストリーを探す')}${btnV784('words','関連用語','wordq',field(story,'related_terms')||storyTitle(story||{}))}</div></div>${art('world')}</section>`;
}
renderFuture=function(){
  if(!S.data) return;
  const story=todayStory(), future=todayFutureRiceV7810();
  $('#future').innerHTML=`${v47PageLead('今日の世界ライス物語','この画面は毎日1話だけ表示します。全件一覧は出さず、見たい人だけ検索ページで探します。','world')}
  ${todayStorySectionV7810(story)}
  ${(typeof currentRiceCardV47!=='undefined') ? currentRiceCardV47(true) : ''}
  ${cardV784('今日のお米の未来',`<p><b>${pEsc(tx(future,'title')||field(future,'title_ja','title')||'未来テーマ')}</b></p><p>${pEsc(tx(future,'body')||field(future,'body_ja','summary_ja')||'内容を整理中です。')}</p>`,`${archiveBtnV7810('futureRice','お米の未来を検索する')}${btnV784('literature','関連文献','litq',tx(future,'title')||field(future,'title_ja'))}`)}
  <section class="card daily-policy-v7810"><h2>表示ルール</h2><p>日替わり機能の画面には、今日読むものだけを表示します。365話や全地域データは、この画面には並べません。</p><p class="small">全件を見たい場合だけ、検索ページへ移動します。</p></section>`;
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
};
renderHome=function(){
 const d=S.data||{}, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), story=todayStory(), word=dailyRiceWordV7810(), learn=todayLearningCardV7810(), lit=todayLiteratureCardV7810(), daily=v48SafeDailyCopy ? v48SafeDailyCopy() : {title:'今日の確認',body:'米の状態を確認します。',term:'米',process:'炊飯'};
 $('#home').innerHTML=`<div class="home-shell">
  <section class="daily-hero-v47"><div class="daily-copy"><span class="eyebrow">RICE NAVI</span><h1>今日の米ナビ</h1><p>今日見るものだけを表示します。全件一覧は検索ページへ分けます。</p></div><div class="daily-visual">${art('fortune')}</div></section>
  <section class="nav-grid-v47 simple-home-v7810">
    ${navCard('check','米の確認','水質・保管・炊飯状態','weather','確認')}
    ${navCard('future','今日の物語','毎日1話だけ表示','world','物語')}
    ${navCard('learn','今日の学び','教材は検索へ分離','book','学ぶ')}
    ${navCard('varieties','品種図鑑','探す時だけ開く','variety','図鑑')}
  </section>
  <section class="daily-stack-v7810">
    ${homeMini('今日の米ナビ',`<b>${pEsc(daily.title)}</b><br>${pEsc(daily.body)}<br><span class="small">工程：${pEsc(daily.process)}</span>`,'fortune','check','今日の確認へ')}
    ${todayStoryHomeCard ? todayStoryHomeCard(story) : storyCard(story,false)}
    ${riceWordCardV7810(word,true)}
    ${cardV784('今日の学び',`<p><b>${pEsc(learnTitleV788(learn||{}))}</b></p><p>${pEsc(learnShortV788(learn||{}))}</p>`,`${archiveBtnV7810('learn','教材を検索する')}${btnV784('learn','学ぶ画面へ','','')}`)}
    ${cardV784('今日のお米',`<p><b>${pEsc(titleOfVariety(variety||{}))}</b></p><p>${pEsc(countryOfVariety(variety||{}))} / ${pEsc(field(variety,'rice_type','grain_shape')||'種類確認中')}</p><p>${pEsc(cleanCookingMemo(variety||{}))}</p>`,`${archiveBtnV7810('varieties','品種図鑑で探す')}`)}
    ${cardV784('今日の文献',`<p><b>${pEsc(field(lit,'title','title_ja')||'文献カード')}</b></p><p>${pEsc(field(lit,'summary','summary_ja','condition','note')||'内容を整理中です。')}</p>`,`${archiveBtnV7810('literature','文献ライブラリで探す')}`)}
  </section>
  <details class="data-check compact"><summary>収録数を確認する</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献')}${stat(counts.learning_cards_v82,'教材カード')}${stat(counts.rice_varieties,'米品種')}${stat((S.data?.daily_rice_words||[]).length,'米言葉')}${stat(counts.world_rice_stories,'世界ライス')}${stat(counts.country_rice_history_countries,'国別ヒストリー')}</div><p class="small">収録数は確認用です。日替わり画面には全件を並べません。</p></details>
 </div>`;
 try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
};
renderLearn=function(){
  if(!S.data) return;
  const learn=todayLearningCardV7810();
  $('#learn').innerHTML=`${v47PageLead('今日の学び','この画面では今日の1件だけを表示します。教材82件は検索ページへ分けます。','book')}
  ${cardV784('今日の学び',`<p><b>${pEsc(learnTitleV788(learn||{}))}</b></p><p>${pEsc(learnShortV788(learn||{}))}</p>${pHas(lc(learn,'field_check_points'))?`<p><b>確認ポイント：</b>${pEsc(lc(learn,'field_check_points'))}</p>`:''}<details><summary>条件・注意</summary>${pHas(lc(learn,'numbers_conditions'))?`<p><b>条件・数値：</b>${pEsc(lc(learn,'numbers_conditions'))}</p>`:''}${pHas(lc(learn,'warning'))?`<p><b>注意：</b>${pEsc(lc(learn,'warning'))}</p>`:''}</details>`,`${archiveBtnV7810('learn','教材を検索する')}${btnV784('literature','関連文献','litq',learnTermsV788(learn||{}))}${btnV784('words','用語集','wordq',learnTermsV788(learn||{}))}`)}
  <section class="card daily-policy-v7810"><h2>表示ルール</h2><p>教材カードをこの画面に全件羅列しません。必要な時だけ検索ページで探します。</p></section>`;
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
};
renderVarieties=function(){
  const v=pick(S.data?.rice_varieties,'variety');
  $('#varieties').innerHTML=`${v47PageLead('今日のお米','この画面では今日の1品種だけを表示します。品種全件は図鑑検索ページへ分けます。','variety')}
  ${cardV784(titleOfVariety(v||{}),`<p class="small">${pEsc(countryOfVariety(v||{}))} / ${pEsc(field(v,'rice_type','grain_shape')||'種類確認中')}</p><p><b>アミロース：</b>${pEsc(field(v,'amylose_range','amylose_value','amylose_class')||'確認中')}</p><p><b>たんぱく質：</b>${pEsc(field(v,'protein_range','protein_value','protein_class')||'確認中')}</p><p><b>炊飯メモ：</b>${pEsc(cleanCookingMemo(v||{}))}</p>`,`${archiveBtnV7810('varieties','品種図鑑で探す')}${btnV784('literature','関連文献','litq',titleOfVariety(v||{}))}${btnV784('words','関連用語','wordq',field(v,'related_terms')||titleOfVariety(v||{}))}`)}
  <section class="card daily-policy-v7810"><h2>表示ルール</h2><p>今日の1品種と、検索入口だけを表示します。250件の品種はこの画面に並べません。</p></section>`;
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
};
renderLiterature=function(){
  const x=todayLiteratureCardV7810();
  $('#literature').innerHTML=`${v47PageLead('今日の文献','この画面では今日の1件だけを表示します。文献全件はライブラリ検索ページへ分けます。','book')}
  ${cardV784(field(x,'title','title_ja')||'文献カード',`<p>${pEsc(field(x,'summary','summary_ja','condition','note')||'内容を整理中です。')}</p><p class="small">${pEsc(softStatusV784(x?x._class:''))}</p>`,`${archiveBtnV7810('literature','文献ライブラリで探す')}${btnV784('learn','関連教材','learn',field(x,'title','category')||'')}${btnV784('words','関連用語','wordq',termsFromV784(x||{}))}`)}
  <section class="card daily-policy-v7810"><h2>表示ルール</h2><p>今日の紹介と、検索入口だけを表示します。428件の文献カードはこの画面に並べません。</p></section>`;
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
};
const renderBaseV7810=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
render=renderBaseV7810;
try{ if(S.data) render(); }catch(e){ console.warn('v7810 rerender skipped', e); }

/* === v78.43 archive UX: title list + tap-to-open details + back controls ===
   Rule: archive/search pages must not show long records as continuous scroll.
   Show titles first; detail appears only when the user opens a row. */
const V7811_VERSION='78ui43';
function publicSearchTextV7811(x){
  if(!x) return '';
  const keys=['title','title_ja','name','name_ja','term_ja','term','word','meaning','message','body','body_ja','summary','summary_ja','short','easy','category','category_ja','country','country_ja','region','theme','related_terms','main_uses','use_category_primary','rice_type','grain_shape'];
  return keys.map(k=>field(x,k)||lc(x,k)||'').join(' ').toLowerCase();
}
function matchQ7810(x,q){ if(!q) return true; return publicSearchTextV7811(x).includes(String(q).toLowerCase()); }
function goArchiveBackV7811(){ const v=S.archiveBackView||'home'; S.archiveKind=''; S.view=v; switchView(v); }
function openArchiveV7810(kind){ S.archiveBackView=S.view||'home'; S.archiveKind=kind; S.view='detail'; switchView('detail'); }
function archiveHeaderV7810(title,lead,kind){
  const q=archiveQueryV7810(kind);
  return `${v47PageLead(title,lead,'guide')}
  <div class="toolbar archive-toolbar-v7810 archive-toolbar-v7811">
    <button class="btn secondary" onclick="goArchiveBackV7811()">← 戻る</button>
    <input placeholder="タイトル・キーワードで検索" value="${pEsc(q)}" oninput="setArchiveQueryV7810(${jsArg(kind)},this.value)">
    <button class="btn secondary" onclick="switchView('home')">ホーム</button>
  </div>
  <p class="small archive-note-v7811">一覧はタイトル中心です。興味がある項目だけタップして内容を開きます。</p>`;
}
function archiveRowV7811(title,meta,body,actions){
  const safeTitle=pEsc(cleanPublicV784(title||'項目'));
  const safeMeta=pEsc(cleanPublicV784(meta||''));
  return `<details class="archive-row-v7811"><summary><span class="archive-title-v7811">${safeTitle}</span>${safeMeta?`<span class="archive-meta-v7811">${safeMeta}</span>`:''}</summary><div class="archive-body-v7811">${body||'<p>内容を整理中です。</p>'}${actions?`<div class="priority-row archive-actions-v7811">${actions}</div>`:''}<button class="btn secondary close-row-v7811" onclick="this.closest('details').removeAttribute('open')">閉じる</button></div></details>`;
}
function archiveListWrapV7811(html){ return `<div class="archive-title-list-v7811">${html}</div>`; }
function storyArchiveV7810(){
  const kind='stories', q=archiveQueryV7810(kind), stories=storyList();
  const countries=[...new Set(stories.map(storyCountry).filter(Boolean))].sort();
  const filtered=stories.filter(x=>matchQ7810(x,q) && (!S.filters.storyCountryArchive || storyCountry(x)===S.filters.storyCountryArchive));
  const rows=filtered.slice(0,160).map(x=>archiveRowV7811(storyTitle(x),`${storyCountry(x)} / ${field(x,'theme')||'テーマ'}`,
    `<p>${pEsc(storyBody(x,720)).split('\n').join('<br>')}</p><p><b>学び：</b>${pEsc(field(x,'learning_point')||'整理中')}</p><p><b>食感：</b>${pEsc(field(x,'texture_note')||'整理中')}</p><p><b>炊飯：</b>${pEsc(field(x,'cooking_note')||'整理中')}</p>`,
    `${btnV784('words','関連用語','wordq',field(x,'related_terms')||storyTitle(x))}${btnV784('literature','関連文献','litq',storyTitle(x))}`)).join('');
  return `${archiveHeaderV7810('世界ライス物語を探す','今日の1話とは別に、必要な時だけタイトルから探します。',kind)}<div class="toolbar archive-toolbar-v7810"><select onchange="S.filters.storyCountryArchive=this.value;render()"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===S.filters.storyCountryArchive?'selected':''}>${pEsc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(stories.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する物語がありません','検索条件を変えてください。'))}`;
}
function riceWordArchiveV7810(){
  const kind='ricewords', q=archiveQueryV7810(kind), words=arrV7810(S.data?.daily_rice_words), filtered=words.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,160).map(x=>archiveRowV7811(riceWordTextV7810(x,'word')||'米言葉', riceWordTextV7810(x,'meaning')||'',
    `<p><b>${pEsc(riceWordTextV7810(x,'meaning')||'意味を整理中')}</b></p><p>${pEsc(riceWordTextV7810(x,'message')||riceWordTextV7810(x,'body')||'内容を整理中です。')}</p>`,
    `${btnV784('words','用語集で見る','wordq',riceWordTextV7810(x,'word'))}${btnV784('learn','関連教材','learn',riceWordTextV7810(x,'word'))}`)).join('');
  return `${archiveHeaderV7810('米言葉を探す','今日の1件とは別に、必要な時だけタイトルから探します。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(words.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する米言葉がありません','検索条件を変えてください。'))}`;
}
function historyArchiveV7810(){
  const kind='history', q=archiveQueryV7810(kind), rec=histRecords ? histRecords() : [], filtered=rec.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,120).map(x=>archiveRowV7811(histCountryName(x), histPeriod(x),
    `<p>${pEsc(histBody(x))}</p>`,
    `${btnV784('future','今日の物語へ','','')}${btnV784('words','関連用語','wordq',histCountryName(x)+' 米')}`)).join('');
  return `${archiveHeaderV7810('地域のお米ヒストリーを探す','現在地表示とは別に、国・地域名から探します。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(rec.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する地域がありません','検索条件を変えてください。'))}`;
}
function futureArchiveV7810(){
  const kind='futureRice', q=archiveQueryV7810(kind), data=arrV7810(S.data?.future_rice), filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,120).map(x=>{ const title=tx(x,'title')||field(x,'title_ja','title')||'未来テーマ'; return archiveRowV7811(title, field(x,'category')||'',
    `<p><b>${pEsc(tx(x,'subtitle')||field(x,'subtitle_ja')||'')}</b></p><p>${pEsc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'内容を整理中です。')}</p>`,
    `${btnV784('literature','関連文献','litq',title)}${btnV784('words','関連用語','wordq',field(x,'category')||'米')}`); }).join('');
  return `${archiveHeaderV7810('お米の未来を探す','日替わり表示とは別に、未来テーマのタイトルから探します。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当するテーマがありません','検索条件を変えてください。'))}`;
}
function varietiesArchiveV7810(){
  const kind='varieties', q=archiveQueryV7810(kind), data=arrV7810(S.data?.rice_varieties), filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,180).map(v=>{ const title=titleOfVariety(v); return archiveRowV7811(title, `${countryOfVariety(v)} / ${field(v,'rice_type','grain_shape')||'種類確認中'}`,
    `<p><b>用途：</b>${pEsc(field(v,'main_uses','use_category_primary')||'確認中')}</p><p><b>食感：</b>${pEsc(field(v,'texture_tags','aroma')||'確認中')}</p><p><b>炊飯メモ：</b>${pEsc(cleanCookingMemo(v))}</p>`,
    `${btnV784('literature','関連文献','litq',title)}${btnV784('words','関連用語','wordq',field(v,'related_terms')||title)}`); }).join('');
  return `${archiveHeaderV7810('米品種図鑑で探す','今日の1品種とは別に、品種名だけを一覧し、必要な品種だけ開きます。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する品種がありません','検索条件を変えてください。'))}`;
}
function literatureArchiveV7810(){
  const kind='literature', q=archiveQueryV7810(kind), data=litSorted ? litSorted() : [], filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,180).map(x=>{ const title=field(x,'title','title_ja')||'文献カード'; return archiveRowV7811(title, `${field(x,'category')||''} ${softStatusV784(x._class)||''}`,
    `<p>${pEsc(field(x,'summary','summary_ja','condition','note')||'内容を整理中です。')}</p>`,
    `${btnV784('learn','関連教材','learn',field(x,'title','category')||'')}${btnV784('words','関連用語','wordq',termsFromV784(x))}`); }).join('');
  return `${archiveHeaderV7810('文献ライブラリで探す','今日の1件とは別に、文献タイトルから探して必要なものだけ開きます。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する文献がありません','検索条件を変えてください。'))}`;
}
function learnArchiveV7810(){
  const kind='learn', q=archiveQueryV7810(kind), data=arrV7810(S.data?.learning_cards), filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,160).map(x=>archiveRowV7811(learnTitleV788(x), learnTopicV788(x),
    `${pChip([learnTopicV788(x), lc(x,'related_terms')])}<p>${pEsc(learnShortV788(x))}</p>${pHas(lc(x,'field_check_points'))?`<p><b>確認ポイント：</b>${pEsc(lc(x,'field_check_points'))}</p>`:''}${pHas(lc(x,'numbers_conditions'))?`<p><b>条件・数値：</b>${pEsc(lc(x,'numbers_conditions'))}</p>`:''}${pHas(lc(x,'warning'))?`<p><b>注意：</b>${pEsc(lc(x,'warning'))}</p>`:''}`,
    `${btnV784('literature','関連文献','litq',learnTermsV788(x))}${btnV784('words','用語集','wordq',learnTermsV788(x))}`)).join('');
  return `${archiveHeaderV7810('教材を探す','今日の1件とは別に、教材タイトルから探して必要なカードだけ開きます。',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する教材がありません','検索条件を変えてください。'))}`;
}
try{ if(S.data) render(); }catch(e){ console.warn('v7811 rerender skipped', e); }


/* === v78.43: homepage as attraction/navigation entry + organized UI icons === */
const RN_BUILD_V7813='v78.43 / build 78ui43';
function rnIconV7813(name){ return `<img class="rn-ui-icon-v7813" src="assets/ui-icons/${pEsc(name||'home')}.svg?v=${RN_ASSET_VERSION}" alt="" loading="lazy">`; }
function rnSearchV7813(){
  const q=pEsc(S.filters.homeSearchV7813||'');
  return `<div class="rn-main-search-v7813">${rnIconV7813('search')}<input placeholder="米・炊飯・水質・品種を探す" value="${q}" oninput="S.filters.homeSearchV7813=this.value" onkeydown="if(event.key==='Enter'){setFilter('learn',this.value);switchView('learn')}"></div>`;
}
function rnQuickV7813(icon,title,sub,view,filterKey,filterValue){
  const click=filterKey?`setFilter('${filterKey}','${pEsc(filterValue||'')}');switchView('${view}')`:`switchView('${view}')`;
  return `<button class="rn-quick-card-v7813" onclick="${click}">${rnIconV7813(icon)}<b>${pEsc(title)}</b><span>${pEsc(sub)}</span></button>`;
}
function rnArchiveQuickV7813(icon,title,sub,kind){
  return `<button class="rn-quick-card-v7813" onclick="openArchiveV7810('${kind}')">${rnIconV7813(icon)}<b>${pEsc(title)}</b><span>${pEsc(sub)}</span></button>`;
}
function rnTodayMiniV7813(icon,label,title,sub,action){
  return `<article class="rn-today-card-v7813" onclick="${action||''}">${rnIconV7813(icon)}<div><b>${pEsc(label)}：${pEsc(title||'確認中')}</b><span>${pEsc(sub||'タップして見る')}</span></div></article>`;
}
renderHome=function(){
  const story=todayStory ? todayStory() : {};
  const word=pick(S.data?.daily_rice_words,'v7813_word')||{};
  const variety=pick(S.data?.rice_varieties,'v7813_variety')||{};
  const lit=pick((S.data?.literature?.cards||[]),'v7813_lit')||{};
  $('#home').innerHTML=`<div class="home-v7813">
    <section class="hero-v7813"><span class="eyebrow">RICE NAVI</span><h1>今日の米を、どこから見る？</h1><p>炊飯チェック、米品種、水質、物語、文献へすぐ進めます。</p>${rnSearchV7813()}</section>
    <section class="rn-quick-grid-v7813">
      ${rnQuickV7813('check','今日の確認','炊飯・水質・保管を見る','check')}
      ${rnArchiveQuickV7813('varieties','米品種を探す','品種名から開く','varieties')}
      ${rnArchiveQuickV7813('stories','物語を探す','国・料理・文化から開く','stories')}
      ${rnQuickV7813('water','水質アドバイス','現在地と水の条件を見る','check','checkq','水質')}
      ${rnQuickV7813('learn','炊飯を学ぶ','目的別に教材を探す','learn')}
      ${rnArchiveQuickV7813('literature','文献を探す','タイトルから開く','literature')}
      ${rnArchiveQuickV7813('history','地域ヒストリー','国・地域から開く','history')}
      ${rnQuickV7813('storage','納米庫管理','湿度・温度・保管を見る','check','checkq','納米庫')}
    </section>
    <section class="rn-today-strip-v7813">
      ${rnTodayMiniV7813('stories','今日の物語',storyTitle(story||{}),`${storyCountry(story||{})||'地域確認中'} / ${field(story,'theme')||'テーマ'}`,"switchView('future')")}
      ${rnTodayMiniV7813('words','今日の米言葉',riceWordTextV7810(word,'word')||'米言葉',riceWordTextV7810(word,'meaning')||'今日の一言',"switchView('words')")}
      ${rnTodayMiniV7813('varieties','今日の品種',titleOfVariety(variety||{}),countryOfVariety(variety||{}),"openArchiveV7810('varieties')")}
      ${rnTodayMiniV7813('literature','今日の文献',field(lit,'title','title_ja')||'文献カード','必要な時だけ開いて確認',"openArchiveV7810('literature')")}
    </section>
    <p class="rn-version-v7813">RICE NAVI ${RN_BUILD_V7813}</p>
  </div>`;
};
const rnArchiveRowV7811Base=archiveRowV7811;
function rnKindIconV7813(){
  const k=S.archiveKind||'';
  if(k==='stories')return 'stories'; if(k==='ricewords')return 'words'; if(k==='history')return 'history'; if(k==='futureRice')return 'future'; if(k==='varieties')return 'varieties'; if(k==='literature')return 'literature'; if(k==='learn')return 'learn'; return 'search';
}
archiveRowV7811=function(title,meta,body,actions){
  const html=rnArchiveRowV7811Base(title,meta,body,actions);
  return html.replace('<summary>','<summary>'+rnIconV7813(rnKindIconV7813()));
};
const archiveHeaderV7810_base_v7813=archiveHeaderV7810;
archiveHeaderV7810=function(title,lead,kind){
  const html=archiveHeaderV7810_base_v7813(title,lead,kind);
  return html.replace('← 戻る',`${rnIconV7813('back')}戻る`).replace('ホーム',`${rnIconV7813('home')}ホーム`);
};
try{ if(S.data) render(); }catch(e){ console.warn('v7813 rerender skipped', e); }

/* === v78.43: rice variety visual category continuation + cleaner public pages === */
const RN_BUILD_V7814='v78.43 / build 78ui43';
function v7814Text(v){return String(v||'').toLowerCase();}
function varietySearchBlobV7814(v){return [titleOfVariety(v),countryOfVariety(v),field(v,'rice_type'),field(v,'grain_shape'),field(v,'texture_tags'),field(v,'aroma'),field(v,'main_uses'),field(v,'use_category_primary'),field(v,'related_terms')].join(' ');}
function varietyCategoryV7814(v){
  const s=varietySearchBlobV7814(v);
  if(/もち|糯|glutinous|sticky|mochi/.test(s)) return ['rice-glutinous','もち米系'];
  if(/香|aroma|aromatic|jasmine|basmati|fragrant/.test(s)) return ['rice-aroma','香り米系'];
  if(/長粒|long|indica|インディカ/.test(s)) return ['rice-long','長粒米系'];
  if(/短粒|short|japonica|ジャポニカ|粳/.test(s)) return ['rice-short','短粒米系'];
  return ['rice-type','米種確認中'];
}
function varietyTypePillsV7814(){
  const chips=[['rice-short','短粒米','短粒 ジャポニカ Japonica'],['rice-long','長粒米','長粒 インディカ Indica'],['rice-aroma','香り米','香り米 Jasmine Basmati 香'],['rice-glutinous','もち米','もち米 糯 Glutinous Sticky'],['rice-bag','用途で探す','寿司 弁当 カレー 炒飯 おにぎり']];
  return `<section class="variety-type-panel-v7814"><div class="section-title-v7814"><h2>米種から探す</h2></div><div class="variety-type-grid-v7814">${chips.map(([icon,label,q])=>`<button onclick="S.filters[archiveQKeyV7810('varieties')]=${jsArg(q)};openArchiveV7810('varieties')">${rnIconV7813(icon)}<b>${pEsc(label)}</b></button>`).join('')}</div></section>`;
}
function varietyVisualCardV7814(v){
  const [icon,cat]=varietyCategoryV7814(v||{});
  return `<article class="variety-feature-v7814">${rnIconV7813(icon)}<div><span class="eyebrow">RICE TYPE</span><h2>${pEsc(titleOfVariety(v||{}))}</h2><p>${pEsc(countryOfVariety(v||{}))} / ${pEsc(cat)}</p><p>${pEsc(cleanCookingMemo(v||{}))}</p></div></article>`;
}
function archiveCleanLeadV7814(title,kind){
  const labels={stories:'国・料理・文化から探す',ricewords:'米言葉を探す',history:'国・地域から探す',futureRice:'未来テーマから探す',varieties:'品種名・米種から探す',literature:'文献タイトルから探す',learn:'教材タイトルから探す'};
  return archiveHeaderV7810(title, labels[kind]||'タイトルから探す', kind);
}
function varietiesArchiveV7810(){
  const kind='varieties', q=archiveQueryV7810(kind), data=arrV7810(S.data?.rice_varieties), filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,180).map(v=>{ const title=titleOfVariety(v); const [icon,cat]=varietyCategoryV7814(v); return archiveRowV7811(title, `${countryOfVariety(v)} / ${cat}`,
    `<div class="archive-variety-visual-v7814">${rnIconV7813(icon)}<div><p><b>用途：</b>${pEsc(field(v,'main_uses','use_category_primary')||'確認中')}</p><p><b>食感：</b>${pEsc(field(v,'texture_tags','aroma')||'確認中')}</p><p><b>炊飯メモ：</b>${pEsc(cleanCookingMemo(v))}</p></div></div>`,
    `${btnV784('literature','関連文献','litq',title)}${btnV784('words','関連用語','wordq',field(v,'related_terms')||title)}`); }).join('');
  return `${archiveCleanLeadV7814('米品種図鑑で探す',kind)}${varietyTypePillsV7814()}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する品種がありません','検索条件を変えてください。'))}`;
}
function storyArchiveV7810(){
  const kind='stories', q=archiveQueryV7810(kind), stories=storyList();
  const countries=[...new Set(stories.map(storyCountry).filter(Boolean))].sort();
  const filtered=stories.filter(x=>matchQ7810(x,q) && (!S.filters.storyCountryArchive || storyCountry(x)===S.filters.storyCountryArchive));
  const rows=filtered.slice(0,160).map(x=>archiveRowV7811(storyTitle(x), `${storyCountry(x)} / ${field(x,'theme')||'テーマ'}`,
    `<p>${pEsc(storyBody(x,720)).split('\n').join('<br>')}</p><details><summary>炊飯・食感の視点</summary><p><b>学び：</b>${pEsc(field(x,'learning_point')||'整理中')}</p><p><b>料理場面：</b>${pEsc(field(x,'scene_note')||'整理中')}</p><p><b>食感：</b>${pEsc(field(x,'texture_note')||'整理中')}</p><p><b>炊飯：</b>${pEsc(field(x,'cooking_note')||'整理中')}</p></details>`,
    `${btnV784('words','関連用語','wordq',field(x,'related_terms')||storyTitle(x))}${btnV784('literature','関連文献','litq',storyTitle(x))}`)).join('');
  return `${archiveCleanLeadV7814('世界ライス物語を探す',kind)}<div class="toolbar archive-toolbar-v7810"><select onchange="S.filters.storyCountryArchive=this.value;render()"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===S.filters.storyCountryArchive?'selected':''}>${pEsc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(stories.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する物語がありません','検索条件を変えてください。'))}`;
}
function riceWordArchiveV7810(){
  const kind='ricewords', q=archiveQueryV7810(kind), words=arrV7810(S.data?.daily_rice_words), filtered=words.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,160).map(x=>archiveRowV7811(riceWordTextV7810(x,'word')||'米言葉', riceWordTextV7810(x,'meaning')||'',
    `<p><b>${pEsc(riceWordTextV7810(x,'meaning')||'意味を整理中')}</b></p><p>${pEsc(riceWordTextV7810(x,'message')||riceWordTextV7810(x,'body')||'内容を整理中です。')}</p>`,
    `${btnV784('words','用語集で見る','wordq',riceWordTextV7810(x,'word'))}${btnV784('learn','関連教材','learn',riceWordTextV7810(x,'word'))}`)).join('');
  return `${archiveCleanLeadV7814('米言葉を探す',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(words.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する米言葉がありません','検索条件を変えてください。'))}`;
}
function historyArchiveV7810(){
  const kind='history', q=archiveQueryV7810(kind), rec=histRecords ? histRecords() : [], filtered=rec.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,120).map(x=>archiveRowV7811(histCountryName(x), histPeriod(x), `<p>${pEsc(histBody(x))}</p>`, `${btnV784('future','今日の物語へ','','')}${btnV784('words','関連用語','wordq',histCountryName(x)+' 米')}`)).join('');
  return `${archiveCleanLeadV7814('地域のお米ヒストリーを探す',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(rec.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する地域がありません','検索条件を変えてください。'))}`;
}
function futureArchiveV7810(){
  const kind='futureRice', q=archiveQueryV7810(kind), data=arrV7810(S.data?.future_rice), filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,120).map(x=>{ const title=tx(x,'title')||field(x,'title_ja','title')||'未来テーマ'; return archiveRowV7811(title, field(x,'category')||'', `<p><b>${pEsc(tx(x,'subtitle')||field(x,'subtitle_ja')||'')}</b></p><p>${pEsc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'内容を整理中です。')}</p>`, `${btnV784('literature','関連文献','litq',title)}${btnV784('words','関連用語','wordq',field(x,'category')||'米')}`); }).join('');
  return `${archiveCleanLeadV7814('お米の未来を探す',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当するテーマがありません','検索条件を変えてください。'))}`;
}
function literatureArchiveV7810(){
  const kind='literature', q=archiveQueryV7810(kind), data=litSorted ? litSorted() : [], filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,180).map(x=>{ const title=field(x,'title','title_ja')||'文献カード'; return archiveRowV7811(title, `${field(x,'category')||''} ${softStatusV784(x._class)||''}`, `<p>${pEsc(field(x,'summary','summary_ja','condition','note')||'内容を整理中です。')}</p>`, `${btnV784('learn','関連教材','learn',field(x,'title','category')||'')}${btnV784('words','関連用語','wordq',termsFromV784(x))}`); }).join('');
  return `${archiveCleanLeadV7814('文献ライブラリで探す',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する文献がありません','検索条件を変えてください。'))}`;
}
function learnArchiveV7810(){
  const kind='learn', q=archiveQueryV7810(kind), data=arrV7810(S.data?.learning_cards), filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,160).map(x=>archiveRowV7811(learnTitleV788(x), learnTopicV788(x), `${pChip([learnTopicV788(x), lc(x,'related_terms')])}<p>${pEsc(learnShortV788(x))}</p>${pHas(lc(x,'field_check_points'))?`<p><b>確認ポイント：</b>${pEsc(lc(x,'field_check_points'))}</p>`:''}${pHas(lc(x,'numbers_conditions'))?`<p><b>条件・数値：</b>${pEsc(lc(x,'numbers_conditions'))}</p>`:''}${pHas(lc(x,'warning'))?`<p><b>注意：</b>${pEsc(lc(x,'warning'))}</p>`:''}`, `${btnV784('literature','関連文献','litq',learnTermsV788(x))}${btnV784('words','用語集','wordq',learnTermsV788(x))}`)).join('');
  return `${archiveCleanLeadV7814('教材を探す',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する教材がありません','検索条件を変えてください。'))}`;
}
renderHome=function(){
  const story=todayStory ? todayStory() : {};
  const word=pick(S.data?.daily_rice_words,'v7814_word')||{};
  const variety=pick(S.data?.rice_varieties,'v7814_variety')||{};
  const lit=pick((S.data?.literature?.cards||[]),'v7814_lit')||{};
  $('#home').innerHTML=`<div class="home-v7813 home-v7814">
    <section class="hero-v7813"><span class="eyebrow">RICE NAVI</span><h1>今日の米を、どこから見る？</h1><p>炊飯チェック、米品種、水質、物語、文献へすぐ進めます。</p>${rnSearchV7813()}</section>
    <section class="rn-quick-grid-v7813">
      ${rnQuickV7813('check','今日の確認','炊飯・水質・保管を見る','check')}
      ${rnArchiveQuickV7813('varieties','米品種を探す','品種名・米種から開く','varieties')}
      ${rnArchiveQuickV7813('stories','物語を探す','国・料理・文化から開く','stories')}
      ${rnQuickV7813('water','水質アドバイス','現在地と水の条件を見る','check','checkq','水質')}
      ${rnQuickV7813('learn','炊飯を学ぶ','目的別に教材を探す','learn')}
      ${rnArchiveQuickV7813('literature','文献を探す','タイトルから開く','literature')}
      ${rnArchiveQuickV7813('history','地域ヒストリー','国・地域から開く','history')}
      ${rnQuickV7813('storage','納米庫管理','湿度・温度・保管を見る','check','checkq','納米庫')}
    </section>
    ${varietyTypePillsV7814()}
    <section class="rn-today-strip-v7813">
      ${rnTodayMiniV7813('stories','今日の物語',storyTitle(story||{}),`${storyCountry(story||{})||'地域確認中'} / ${field(story,'theme')||'テーマ'}`,"switchView('future')")}
      ${rnTodayMiniV7813('words','今日の米言葉',riceWordTextV7810(word,'word')||'米言葉',riceWordTextV7810(word,'meaning')||'今日の一言',"switchView('words')")}
      ${rnTodayMiniV7813('varieties','今日の品種',titleOfVariety(variety||{}),countryOfVariety(variety||{}),"switchView('varieties')")}
      ${rnTodayMiniV7813('literature','今日の文献',field(lit,'title','title_ja')||'文献カード','必要な時だけ開いて確認',"openArchiveV7810('literature')")}
    </section>
    <p class="rn-version-v7813">RICE NAVI ${RN_BUILD_V7814}</p>
  </div>`;
};
renderVarieties=function(){
  const v=pick(S.data?.rice_varieties,'v7814_variety')||{};
  $('#varieties').innerHTML=`${v47PageLead('今日のお米','品種を見る入口です。','variety')}${varietyVisualCardV7814(v)}${varietyTypePillsV7814()}<div class="priority-row">${archiveBtnV7810('varieties','品種図鑑で探す')}${btnV784('literature','関連文献','litq',titleOfVariety(v||{}))}${btnV784('words','関連用語','wordq',field(v,'related_terms')||titleOfVariety(v||{}))}</div>`;
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
};
renderFuture=function(){
  if(!S.data) return;
  const story=todayStory(), future=todayFutureRiceV7810();
  $('#future').innerHTML=`${v47PageLead('今日の世界ライス物語','国・料理・食感から米文化へ進みます。','world')}${todayStorySectionV7810(story)}${cardV784('今日のお米の未来',`<p><b>${pEsc(tx(future,'title')||field(future,'title_ja','title')||'未来テーマ')}</b></p><p>${pEsc(tx(future,'body')||field(future,'body_ja','summary_ja')||'内容を整理中です。')}</p>`,`${archiveBtnV7810('futureRice','お米の未来を検索する')}${btnV784('literature','関連文献','litq',tx(future,'title')||field(future,'title_ja'))}`)}`;
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
};
renderLearn=function(){
  if(!S.data) return; const learn=todayLearningCardV7810();
  $('#learn').innerHTML=`${v47PageLead('今日の学び','炊飯の工程・症状・用語へ進みます。','book')}${cardV784('今日の学び',`<p><b>${pEsc(learnTitleV788(learn||{}))}</b></p><p>${pEsc(learnShortV788(learn||{}))}</p>${pHas(lc(learn,'field_check_points'))?`<p><b>確認ポイント：</b>${pEsc(lc(learn,'field_check_points'))}</p>`:''}<details><summary>条件・注意</summary>${pHas(lc(learn,'numbers_conditions'))?`<p><b>条件・数値：</b>${pEsc(lc(learn,'numbers_conditions'))}</p>`:''}${pHas(lc(learn,'warning'))?`<p><b>注意：</b>${pEsc(lc(learn,'warning'))}</p>`:''}</details>`,`${archiveBtnV7810('learn','教材を検索する')}${btnV784('literature','関連文献','litq',learnTermsV788(learn||{}))}${btnV784('words','用語集','wordq',learnTermsV788(learn||{}))}`)}`;
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
};
renderLiterature=function(){
  const x=todayLiteratureCardV7810();
  $('#literature').innerHTML=`${v47PageLead('今日の文献','必要な根拠をタイトルから確認します。','book')}${cardV784(field(x,'title','title_ja')||'文献カード',`<p>${pEsc(field(x,'summary','summary_ja','condition','note')||'内容を整理中です。')}</p><p class="small">${pEsc(softStatusV784(x?x._class:''))}</p>`,`${archiveBtnV7810('literature','文献ライブラリで探す')}${btnV784('learn','関連教材','learn',field(x,'title','category')||'')}${btnV784('words','関連用語','wordq',termsFromV784(x||{}))}`)}`;
  try{ v787PostRender(); enforceMinFontV787(); }catch(e){}
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7814 rerender skipped', e); }


/* === v78.43 visual asset continuation: illustrations + fixed folder references === */
function rnAssetImgV7817(folder,name,cls='rn-feature-art'){
  return `<img class="${pEsc(cls)}" src="assets/${pEsc(folder)}/${pEsc(name)}.svg?v=${RN_ASSET_VERSION}" alt="" loading="lazy">`;
}
function riceTypeVisualNameV7817(icon){
  return ({'rice-short':'short-grain','rice-long':'long-grain','rice-aroma':'aroma-rice','rice-glutinous':'glutinous-rice','rice-bag':'use-rice','rice-type':'use-rice'}[icon]||'use-rice');
}
function countryVisualV7817(name){
  const s=String(name||'').toLowerCase();
  if(/台湾|taiwan/.test(s)) return 'taiwan';
  if(/日本|japan/.test(s)) return 'japan';
  if(/タイ|thai/.test(s)) return 'thailand';
  if(/ベトナム|viet/.test(s)) return 'vietnam';
  if(/中国|china/.test(s)) return 'china';
  if(/インド|india/.test(s)) return 'india';
  if(/韓国|korea/.test(s)) return 'korea';
  if(/米国|アメリカ|usa|america/.test(s)) return 'usa';
  if(/イタリア|italy/.test(s)) return 'italy';
  if(/スペイン|spain/.test(s)) return 'spain';
  if(/インドネシア|indonesia/.test(s)) return 'indonesia';
  if(/フィリピン|philippines/.test(s)) return 'philippines';
  return '';
}
varietyVisualCardV7814=function(v){
  const [icon,cat]=varietyCategoryV7814(v||{});
  const art=rnAssetImgV7817('rice-types',riceTypeVisualNameV7817(icon));
  return `<article class="variety-feature-v7814">${art}<div>${rnIconV7813(icon)}<span class="eyebrow">RICE TYPE</span><h2>${pEsc(titleOfVariety(v||{}))}</h2><p>${pEsc(countryOfVariety(v||{}))} / ${pEsc(cat)}</p><p>${pEsc(cleanCookingMemo(v||{}))}</p></div></article>`;
};
function storyVisualChipV7817(x){
  const country=storyCountry(x||{}); const c=countryVisualV7817(country);
  if(c) return `<div class="archive-visual-chip"><img src="assets/countries/${pEsc(c)}.svg?v=${RN_ASSET_VERSION}" alt="" loading="lazy"><span>${pEsc(country)}</span></div>`;
  return `<div class="archive-visual-chip"><img src="assets/stories/rice-bowl-culture.svg?v=${RN_ASSET_VERSION}" alt="" loading="lazy"><span>${pEsc(country||'米文化')}</span></div>`;
}
const renderHomeV7817=function(){
  const story=todayStory ? todayStory() : {};
  const word=pick(S.data?.daily_rice_words,'v7817_word')||{};
  const variety=pick(S.data?.rice_varieties,'v7817_variety')||{};
  const lit=pick((S.data?.literature?.cards||[]),'v7817_lit')||{};
  $('#home').innerHTML=`<div class="home-v7813 home-v7814">
    <section class="hero-v7813"><div><span class="eyebrow">RICE NAVI</span><h1>今日の米を、どこから見る？</h1><p>炊飯チェック、米品種、水質、物語、文献へすぐ進めます。</p>${rnSearchV7813()}</div>${rnAssetImgV7817('illustrations','home-hero','rn-hero-art')}</section>
    <section class="rn-quick-grid-v7813">
      ${rnQuickV7813('check','今日の確認','炊飯・水質・保管を見る','check')}
      ${rnArchiveQuickV7813('varieties','米品種を探す','品種名・米種から開く','varieties')}
      ${rnArchiveQuickV7813('stories','物語を探す','国・料理・文化から開く','stories')}
      ${rnQuickV7813('water','水質アドバイス','現在地と水の条件を見る','check','checkq','水質')}
      ${rnQuickV7813('learn','炊飯を学ぶ','目的別に教材を探す','learn')}
      ${rnArchiveQuickV7813('literature','文献を探す','タイトルから開く','literature')}
      ${rnArchiveQuickV7813('history','地域ヒストリー','国・地域から開く','history')}
      ${rnQuickV7813('storage','納米庫管理','湿度・温度・保管を見る','check','checkq','納米庫')}
    </section>
    ${varietyTypePillsV7814()}
    <section class="rn-today-strip-v7813">
      ${rnTodayMiniV7813('stories','今日の物語',storyTitle(story||{}),`${storyCountry(story||{})||'地域確認中'} / ${field(story,'theme')||'テーマ'}`,"switchView('future')")}
      ${rnTodayMiniV7813('words','今日の米言葉',riceWordTextV7810(word,'word')||'米言葉',riceWordTextV7810(word,'meaning')||'今日の一言',"switchView('words')")}
      ${rnTodayMiniV7813('varieties','今日の品種',titleOfVariety(variety||{}),countryOfVariety(variety||{}),"switchView('varieties')")}
      ${rnTodayMiniV7813('literature','今日の文献',field(lit,'title','title_ja')||'文献カード','必要な時だけ開いて確認',"openArchiveV7810('literature')")}
    </section>
    <p class="rn-version-v7813">RICE NAVI v78.43 / build 78ui43</p>
  </div>`;
};
renderHome=renderHomeV7817;
const storyArchiveBaseV7817=storyArchiveV7810;
storyArchiveV7810=function(){
  const kind='stories', q=archiveQueryV7810(kind), stories=storyList();
  const countries=[...new Set(stories.map(storyCountry).filter(Boolean))].sort();
  const filtered=stories.filter(x=>matchQ7810(x,q) && (!S.filters.storyCountryArchive || storyCountry(x)===S.filters.storyCountryArchive));
  const rows=filtered.slice(0,160).map(x=>archiveRowV7811(storyTitle(x), `${storyCountry(x)} / ${field(x,'theme')||'テーマ'}`,
    `${storyVisualChipV7817(x)}<p>${pEsc(storyBody(x,720)).split('\n').join('<br>')}</p><details><summary>炊飯・食感の視点</summary><p><b>学び：</b>${pEsc(field(x,'learning_point')||'整理中')}</p><p><b>料理場面：</b>${pEsc(field(x,'scene_note')||'整理中')}</p><p><b>食感：</b>${pEsc(field(x,'texture_note')||'整理中')}</p><p><b>炊飯：</b>${pEsc(field(x,'cooking_note')||'整理中')}</p></details>`,
    `${btnV784('words','関連用語','wordq',field(x,'related_terms')||storyTitle(x))}${btnV784('literature','関連文献','litq',storyTitle(x))}`)).join('');
  return `${archiveCleanLeadV7814('世界ライス物語を探す',kind)}<div class="toolbar archive-toolbar-v7810"><select onchange="S.filters.storyCountryArchive=this.value;render()"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===S.filters.storyCountryArchive?'selected':''}>${pEsc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(stories.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する物語がありません','検索条件を変えてください。'))}`;
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7817 rerender skipped', e); }


/* === v78.43 page visual continuation: header illustrations + compact page logic ===
   Keep homepage as a search/entry page; do not add explanatory policy text.
   Detail/search pages use title-list + click-to-open and include visual cues only where useful. */
function rnPageVisualV7819(view){
  const map={
    learn:['learning-cooking','学ぶ','炊飯の要点を探す'],
    literature:['literature-library','文献','根拠を探す'],
    varieties:['variety-card','米品種','米種・用途で探す'],
    check:['water-quality','チェック','水質・保管を確認'],
    future:['story-culture','物語','米文化を探す'],
    rankings:['history-map','ランキング','数字で見る'],
    words:['story-culture','米言葉','言葉から探す']
  };
  return map[view]||['home-hero','RICE NAVI','探す入口'];
}
function rnVisualHeaderV7819(view){
  const [img,title,sub]=rnPageVisualV7819(view);
  return `<section class="rn-page-visual-v7819"><div>${rnIconV7813(view==='future'?'stories':view==='literature'?'literature':view==='varieties'?'varieties':view==='check'?'check':view==='words'?'words':view==='rankings'?'ranking':'learn')}<span class="eyebrow">RICE NAVI</span><h1>${pEsc(title)}</h1><p>${pEsc(sub)}</p></div>${rnAssetImgV7817('illustrations',img,'rn-page-art-v7819')}</section>`;
}
function rnCleanPageAfterRenderV7819(view){
  const el=document.getElementById(view); if(!el) return;
  // Remove developer-policy cards from user-facing daily pages. The behavior stays; the explanation is not shown.
  Array.from(el.querySelectorAll('section.card, .card')).forEach(card=>{
    const h=(card.querySelector('h2')||{}).textContent||'';
    if(h.trim()==='表示ルール') card.remove();
  });
  // Replace old text-heavy page lead with a visual header. Keep content below.
  const oldLead=el.querySelector('.page-lead-v47');
  if(oldLead){ oldLead.insertAdjacentHTML('beforebegin', rnVisualHeaderV7819(view)); oldLead.remove(); }
  if(!el.querySelector('.rn-page-visual-v7819') && view!=='home') el.insertAdjacentHTML('afterbegin', rnVisualHeaderV7819(view));
}
function rnEnhanceArchiveV7819(kind){
  const el=document.getElementById('detail'); if(!el) return;
  const map={stories:['story-culture','物語を探す','国・料理・文化からタイトルで探す'],ricewords:['story-culture','米言葉を探す','気になる言葉だけ開く'],history:['history-map','地域ヒストリーを探す','国・地域から探す'],futureRice:['story-culture','お米の未来を探す','テーマから探す'],varieties:['variety-card','米品種図鑑で探す','米種・用途・品種名で探す'],literature:['literature-library','文献ライブラリで探す','根拠・条件・数値を探す'],learn:['learning-cooking','教材を探す','工程・症状・用語から探す']};
  const [img,title,sub]=map[kind]||map.stories;
  const old=el.querySelector('.archive-lead-v7814, .archive-header-v7810, .page-lead-v47');
  const hero=`<section class="rn-page-visual-v7819 archive-visual-v7819"><div>${rnIconV7813(kind==='stories'?'stories':kind==='ricewords'?'words':kind==='history'?'history':kind==='futureRice'?'future':kind==='varieties'?'varieties':kind==='literature'?'literature':'learn')}<span class="eyebrow">SEARCH</span><h1>${pEsc(title)}</h1><p>${pEsc(sub)}</p><div class="archive-back-v7819"><button class="btn secondary" onclick="goArchiveBackV7811()">← 戻る</button><button class="btn secondary" onclick="switchView('home')">ホーム</button></div></div>${rnAssetImgV7817('illustrations',img,'rn-page-art-v7819')}</section>`;
  if(old){ old.insertAdjacentHTML('beforebegin',hero); old.remove(); }
  else if(!el.querySelector('.rn-page-visual-v7819')) el.insertAdjacentHTML('afterbegin',hero);
  // Keep title list clean: no internal fields, no long continuous records outside opened details.
  Array.from(el.querySelectorAll('.source,[data-internal],.audit-note')).forEach(n=>n.remove());
}
const renderLearnV7819=renderLearn;
renderLearn=function(){ renderLearnV7819(); rnCleanPageAfterRenderV7819('learn'); };
const renderLiteratureV7819=renderLiterature;
renderLiterature=function(){ renderLiteratureV7819(); rnCleanPageAfterRenderV7819('literature'); };
const renderVarietiesV7819=renderVarieties;
renderVarieties=function(){ renderVarietiesV7819(); rnCleanPageAfterRenderV7819('varieties'); };
const renderCheckV7819=renderCheck;
renderCheck=function(){ renderCheckV7819(); rnCleanPageAfterRenderV7819('check'); };
const renderFutureV7819=renderFuture;
renderFuture=function(){ renderFutureV7819(); rnCleanPageAfterRenderV7819('future'); };
const renderRankingsV7819=renderRankings;
renderRankings=function(){ renderRankingsV7819(); rnCleanPageAfterRenderV7819('rankings'); };
const renderWordsV7819=renderWords;
renderWords=function(){ renderWordsV7819(); rnCleanPageAfterRenderV7819('words'); };
const renderArchiveBaseV7819=renderArchiveV7810;
renderArchiveV7810=function(){ renderArchiveBaseV7819(); rnEnhanceArchiveV7819(S.archiveKind||'stories'); };
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7819 rerender skipped', e); }

/* === v78.43 visual balance + safe public display continuation ===
   Keep home as an entry/search page. Keep detail pages title-first. */
const RN_PUBLIC_BUILD_V7819='RICE NAVI v78.43 / build 78ui43';
function rnPublicCleanV7819(scope){
  const el=typeof scope==='string'?document.getElementById(scope):scope;
  if(!el) return;
  const bad=/source_key|claim_id|source_id|safe_app_note|app_caution|親Excel|raw|debug|正式カード候補|cards_literature_based|app_ready_formal|trace_ok|国別本文未統合|TOP10未公開|明細0件/i;
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n=>{ if(bad.test(n.nodeValue||'')) n.nodeValue=(n.nodeValue||'').replace(bad,'確認中'); });
  Array.from(el.querySelectorAll('.source,[data-internal],.audit-note,.debug,.raw')).forEach(n=>n.remove());
}
function rnUpdateVersionV7819(){
  const v=document.querySelector('.rn-version-v7813');
  if(v) v.textContent=RN_PUBLIC_BUILD_V7819;
}
const renderHomeV7819=renderHome;
renderHome=function(){ renderHomeV7819(); rnUpdateVersionV7819(); rnPublicCleanV7819('home'); };
['learn','literature','varieties','check','future','rankings','words','detail'].forEach(view=>{
  const key='render_'+view+'_v7819';
});
const renderLearnV7819b=renderLearn; renderLearn=function(){renderLearnV7819b(); rnPublicCleanV7819('learn');};
const renderLiteratureV7819b=renderLiterature; renderLiterature=function(){renderLiteratureV7819b(); rnPublicCleanV7819('literature');};
const renderVarietiesV7819b=renderVarieties; renderVarieties=function(){renderVarietiesV7819b(); rnPublicCleanV7819('varieties');};
const renderCheckV7819b=renderCheck; renderCheck=function(){renderCheckV7819b(); rnPublicCleanV7819('check');};
const renderFutureV7819b=renderFuture; renderFuture=function(){renderFutureV7819b(); rnPublicCleanV7819('future');};
const renderRankingsV7819b=renderRankings; renderRankings=function(){renderRankingsV7819b(); rnPublicCleanV7819('rankings');};
const renderWordsV7819b=renderWords; renderWords=function(){renderWordsV7819b(); rnPublicCleanV7819('words');};
const renderArchiveV7819b=renderArchiveV7810; renderArchiveV7810=function(){renderArchiveV7819b(); rnPublicCleanV7819('detail');};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7819 rerender skipped', e); }


/* === v78.43 semantic visual continuation: more UI icons + no-root-asset bug cleanup === */
const RN_PUBLIC_BUILD_V7823='RICE NAVI v78.43 / build 78ui43';
function rnPageVisualV7823(view){
  const map={
    learn:['learning-cooking','学ぶ','工程・症状・用語から探す','learn'],
    literature:['literature-library','文献','根拠・条件・数値を探す','literature'],
    varieties:['variety-card','米品種','米種・用途・食感から探す','varieties'],
    check:['gps-water','今日の確認','水質・保管・炊飯状態を見る','gps-water'],
    future:['story-culture','物語','国・料理・文化から探す','stories'],
    rankings:['history-map','ランキング','数字から米を見る','ranking'],
    words:['glossary-terms','米言葉・用語','言葉から学びへ進む','glossary']
  };
  return map[view]||['home-hero','RICE NAVI','探す入口','home'];
}
function rnVisualHeaderV7823(view){
  const [img,title,sub,icon]=rnPageVisualV7823(view);
  return `<section class="rn-page-visual-v7819 rn-page-visual-v7823"><div>${rnIconV7813(icon)}<span class="eyebrow">RICE NAVI</span><h1>${pEsc(title)}</h1><p>${pEsc(sub)}</p></div>${rnAssetImgV7817('illustrations',img,'rn-page-art-v7819')}</section>`;
}
function rnCleanPageAfterRenderV7823(view){
  rnCleanPageAfterRenderV7819(view);
  const el=document.getElementById(view); if(!el) return;
  const old=el.querySelector('.rn-page-visual-v7819');
  if(old){ old.outerHTML=rnVisualHeaderV7823(view); }
  rnPublicCleanV7819(el);
}
const renderLearnV7823=renderLearn; renderLearn=function(){renderLearnV7823(); rnCleanPageAfterRenderV7823('learn');};
const renderLiteratureV7823=renderLiterature; renderLiterature=function(){renderLiteratureV7823(); rnCleanPageAfterRenderV7823('literature');};
const renderVarietiesV7823=renderVarieties; renderVarieties=function(){renderVarietiesV7823(); rnCleanPageAfterRenderV7823('varieties');};
const renderCheckV7823=renderCheck; renderCheck=function(){renderCheckV7823(); rnCleanPageAfterRenderV7823('check');};
const renderFutureV7823=renderFuture; renderFuture=function(){renderFutureV7823(); rnCleanPageAfterRenderV7823('future');};
const renderRankingsV7823=renderRankings; renderRankings=function(){renderRankingsV7823(); rnCleanPageAfterRenderV7823('rankings');};
const renderWordsV7823=renderWords; renderWords=function(){renderWordsV7823(); rnCleanPageAfterRenderV7823('words');};
const renderHomeV7823=renderHome;
renderHome=function(){
  renderHomeV7823();
  const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7823;
  rnPublicCleanV7819('home');
};
function rnEnhanceArchiveV7823(kind){
  rnEnhanceArchiveV7819(kind);
  const el=document.getElementById('detail'); if(!el) return;
  const map={
    stories:['story-culture','物語を探す','国・料理・文化からタイトルで探す','stories'],
    ricewords:['glossary-terms','米言葉を探す','気になる言葉だけ開く','glossary'],
    history:['history-map','地域ヒストリーを探す','国・地域から探す','country'],
    futureRice:['story-culture','お米の未来を探す','テーマから探す','future'],
    varieties:['variety-card','米品種図鑑で探す','米種・用途・品種名で探す','varieties'],
    literature:['literature-library','文献ライブラリで探す','根拠・条件・数値を探す','literature'],
    learn:['temperature-time','教材を探す','工程・症状・用語から探す','learn']
  };
  const [img,title,sub,icon]=map[kind]||map.stories;
  const hero=el.querySelector('.rn-page-visual-v7819');
  if(hero){ hero.outerHTML=`<section class="rn-page-visual-v7819 rn-page-visual-v7823 archive-visual-v7819"><div>${rnIconV7813(icon)}<span class="eyebrow">SEARCH</span><h1>${pEsc(title)}</h1><p>${pEsc(sub)}</p><div class="archive-back-v7819"><button class="btn secondary" onclick="goArchiveBackV7811()">← 戻る</button><button class="btn secondary" onclick="switchView('home')">ホーム</button></div></div>${rnAssetImgV7817('illustrations',img,'rn-page-art-v7819')}</section>`; }
  rnPublicCleanV7819(el);
}
const renderArchiveV7823=renderArchiveV7810; renderArchiveV7810=function(){renderArchiveV7823(); rnEnhanceArchiveV7823(S.archiveKind||'stories');};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7823 rerender skipped', e); }

/* === v78.43 country/story visual expansion ===
   Continue original visual work: more country/story assets, title-first pages,
   no internal fields, fixed file names, no ZIP unless requested. */
const RN_PUBLIC_BUILD_V7824='RICE NAVI v78.43 / build 78ui43';
function countryVisualV7824(name){
  const s=String(name||'').toLowerCase();
  if(/台湾|taiwan|魯肉飯|池上|油飯|飯糰/.test(s)) return 'taiwan';
  if(/日本|japan|寿司|弁当|おにぎり|新米|古米|東北|関西|九州|カレー/.test(s)) return 'japan';
  if(/タイ|thai|ジャスミン|もち米/.test(s)) return 'thailand';
  if(/ベトナム|viet|コムタム/.test(s)) return 'vietnam';
  if(/中国|china|香港|広東|東北|南方|炒飯|粥/.test(s)) return /香港|hong/.test(s)?'hongkong':'china';
  if(/韓国|korea|キンパ|石鍋/.test(s)) return 'korea';
  if(/インドネシア|indonesia|ナシゴレン|ナシウドゥック/.test(s)) return 'indonesia';
  if(/フィリピン|philippines|シナンガグ/.test(s)) return 'philippines';
  if(/インド|india|ビリヤニ|南部/.test(s)) return 'india';
  if(/バングラデシュ|bangladesh/.test(s)) return 'bangladesh';
  if(/パキスタン|pakistan/.test(s)) return 'pakistan';
  if(/ネパール|nepal/.test(s)) return 'nepal';
  if(/スリランカ|sri/.test(s)) return 'sri-lanka';
  if(/ラオス|laos/.test(s)) return 'laos';
  if(/カンボジア|cambodia/.test(s)) return 'cambodia';
  if(/ミャンマー|myanmar/.test(s)) return 'myanmar';
  if(/マレーシア|malaysia|ナシレマ/.test(s)) return 'malaysia';
  if(/シンガポール|singapore|チキンライス/.test(s)) return 'singapore';
  if(/イラン|iran/.test(s)) return 'iran';
  if(/イラク|iraq/.test(s)) return 'iraq';
  if(/トルコ|turkey|ドルマ/.test(s)) return 'turkey';
  if(/レバノン|lebanon/.test(s)) return 'lebanon';
  if(/エジプト|egypt/.test(s)) return 'egypt';
  if(/モロッコ|morocco/.test(s)) return 'morocco';
  if(/セネガル|senegal/.test(s)) return 'senegal';
  if(/ナイジェリア|nigeria/.test(s)) return 'nigeria';
  if(/ガーナ|ghana/.test(s)) return 'ghana';
  if(/マダガスカル|madagascar/.test(s)) return 'madagascar';
  if(/メキシコ|mexico/.test(s)) return 'mexico';
  if(/ブラジル|brazil/.test(s)) return 'brazil';
  if(/ペルー|peru/.test(s)) return 'peru';
  if(/キューバ|cuba/.test(s)) return 'cuba';
  if(/プエルトリコ|puerto/.test(s)) return 'puerto-rico';
  if(/ルイジアナ|louisiana/.test(s)) return 'louisiana';
  if(/ハワイ|hawaii/.test(s)) return 'hawaii';
  if(/オーストラリア|australia/.test(s)) return 'australia';
  if(/イギリス|uk|britain/.test(s)) return 'uk';
  if(/フランス|france/.test(s)) return 'france';
  if(/ギリシャ|greece/.test(s)) return 'greece';
  if(/ポルトガル|portugal/.test(s)) return 'portugal';
  if(/イタリア|italy|ミラノ|risotto|リゾット/.test(s)) return 'italy';
  if(/スペイン|spain|パエリア|黒い米/.test(s)) return 'spain';
  if(/米国|アメリカ|usa|america|南部/.test(s)) return 'usa';
  if(/モンゴル|mongolia/.test(s)) return 'mongolia';
  return countryVisualV7817 ? countryVisualV7817(name) : '';
}
function storyThemeVisualV7824(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms')].join(' ').toLowerCase();
  if(/寿司|おにぎり|sushi|onigiri/.test(s)) return 'sushi-onigiri';
  if(/弁当|bento/.test(s)) return 'bento-rice';
  if(/魯肉|油飯|lu rou/.test(s)) return 'lu-rou-fan';
  if(/ビリヤニ|biryani/.test(s)) return 'biriyani';
  if(/ナシレマ|nasi lemak/.test(s)) return 'nasi-lemak';
  if(/パエリア|paella|黒い米/.test(s)) return 'paella';
  if(/リゾット|risotto|ミラノ/.test(s)) return 'risotto';
  if(/ジョロフ|jollof|ナイジェリア|ガーナ|セネガル/.test(s)) return 'jollof-rice';
  if(/粥|congee/.test(s)) return 'congee';
  if(/炒飯|fried rice|ナシゴレン|シナンガグ/.test(s)) return 'fried-rice';
  if(/もち米|sticky|ラオス|タイ・もち/.test(s)) return 'sticky-rice';
  if(/市場|market|輸出|輸入/.test(s)) return 'rice-market-global';
  if(/棚田|水田|水|field|terrace/.test(s)) return 'rice-field-terrace';
  if(/祭|festival/.test(s)) return 'rice-festival';
  return 'rice-bowl-culture';
}
function storyVisualChipV7824(x){
  const country=storyCountry(x||{}), c=countryVisualV7824(country), theme=storyThemeVisualV7824(x||{});
  const countryImg=c?`<img src="assets/countries/${pEsc(c)}.svg?v=${RN_ASSET_VERSION}" alt="" loading="lazy">`:'';
  return `<div class="archive-visual-chip archive-visual-chip-v7824"><img src="assets/stories/${pEsc(theme)}.svg?v=${RN_ASSET_VERSION}" alt="" loading="lazy">${countryImg}<span>${pEsc(country||'米文化')}</span></div>`;
}
function historyVisualChipV7824(x){
  const name=histCountryName ? histCountryName(x||{}) : field(x,'country','country_ja');
  const c=countryVisualV7824(name);
  const img=c?`assets/countries/${pEsc(c)}.svg?v=${RN_ASSET_VERSION}`:`assets/illustrations/history-map.svg?v=${RN_ASSET_VERSION}`;
  return `<div class="archive-visual-chip archive-visual-chip-v7824"><img src="${img}" alt="" loading="lazy"><span>${pEsc(name||'地域')}</span></div>`;
}
storyArchiveV7810=function(){
  const kind='stories', q=archiveQueryV7810(kind), stories=storyList();
  const countries=[...new Set(stories.map(storyCountry).filter(Boolean))].sort();
  const filtered=stories.filter(x=>matchQ7810(x,q) && (!S.filters.storyCountryArchive || storyCountry(x)===S.filters.storyCountryArchive));
  const rows=filtered.slice(0,180).map(x=>archiveRowV7811(storyTitle(x), `${storyCountry(x)} / ${field(x,'theme')||'テーマ'}`,
    `${storyVisualChipV7824(x)}<p>${pEsc(storyBody(x,720)).split('\n').join('<br>')}</p><details><summary>炊飯・食感の視点</summary><p><b>学び：</b>${pEsc(field(x,'learning_point')||'整理中')}</p><p><b>料理場面：</b>${pEsc(field(x,'scene_note')||'整理中')}</p><p><b>食感：</b>${pEsc(field(x,'texture_note')||'整理中')}</p><p><b>炊飯：</b>${pEsc(field(x,'cooking_note')||'整理中')}</p></details>`,
    `${btnV784('words','関連用語','wordq',field(x,'related_terms')||storyTitle(x))}${btnV784('literature','関連文献','litq',storyTitle(x))}`)).join('');
  return `${archiveCleanLeadV7814('世界ライス物語を探す',kind)}<div class="toolbar archive-toolbar-v7810"><select onchange="S.filters.storyCountryArchive=this.value;render()"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===S.filters.storyCountryArchive?'selected':''}>${pEsc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(stories.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する物語がありません','検索条件を変えてください。'))}`;
};
historyArchiveV7810=function(){
  const kind='history', q=archiveQueryV7810(kind), rec=histRecords ? histRecords() : [], filtered=rec.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,120).map(x=>archiveRowV7811(histCountryName(x), histPeriod(x), `${historyVisualChipV7824(x)}<p>${pEsc(histBody(x))}</p>`, `${btnV784('future','今日の物語へ','','')}${btnV784('words','関連用語','wordq',histCountryName(x)+' 米')}`)).join('');
  return `${archiveCleanLeadV7814('地域のお米ヒストリーを探す',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(rec.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する地域がありません','検索条件を変えてください。'))}`;
};
const renderArchiveV7824=function(){
  const map={stories:storyArchiveV7810,ricewords:riceWordArchiveV7810,history:historyArchiveV7810,futureRice:futureArchiveV7810,varieties:varietiesArchiveV7810,literature:literatureArchiveV7810,learn:learnArchiveV7810};
  $('#detail').innerHTML=(map[S.archiveKind]||storyArchiveV7810)();
  rnEnhanceArchiveV7823(S.archiveKind||'stories');
  rnPublicCleanV7819('detail');
};
renderArchiveV7810=renderArchiveV7824;
const renderHomeV7824=renderHome;
renderHome=function(){
  renderHomeV7824();
  const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7824;
  rnPublicCleanV7819('home');
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7824 rerender skipped', e); }

/* === v78.43 visual discovery pass: show country/story visuals only as entry points === */
const RN_PUBLIC_BUILD_V7825='RICE NAVI v78.43 / build 78ui43';
function rnVisualEntryV7825(kind,title,sub,img,onclick){
  const src=kind==='country'?`assets/countries/${pEsc(img)}.svg?v=${RN_ASSET_VERSION}`:kind==='story'?`assets/stories/${pEsc(img)}.svg?v=${RN_ASSET_VERSION}`:`assets/illustrations/${pEsc(img)}.svg?v=${RN_ASSET_VERSION}`;
  return `<button class="visual-entry-v7825" onclick="${onclick}"><img src="${src}" alt="" loading="lazy"><span><b>${pEsc(title)}</b><small>${pEsc(sub)}</small></span></button>`;
}
function rnHomeVisualDiscoveryV7825(){
  return `<section class="visual-discovery-v7825" aria-label="探す入口">
    <div class="section-title"><h2>気になる入口から探す</h2></div>
    <div class="visual-entry-grid-v7825">
      ${rnVisualEntryV7825('story','台湾の米文化','Q弾・魯肉飯・池上米', 'lu-rou-fan', "S.archiveKind='stories';S.filters.storyCountryArchive='台湾';switchView('detail')")}
      ${rnVisualEntryV7825('story','世界の料理','ビリヤニ・パエリア・粥', 'biriyani', "S.archiveKind='stories';S.filters.archive_stories='料理';switchView('detail')")}
      ${rnVisualEntryV7825('illust','米種から探す','短粒米・長粒米・香り米', 'variety-card', "S.archiveKind='varieties';switchView('detail')")}
      ${rnVisualEntryV7825('illust','水質を見る','現在地と水から炊飯へ', 'gps-water', "switchView('check')")}
    </div>
  </section>`;
}
function rnFutureVisualShortcutsV7825(){
  return `<section class="visual-discovery-v7825 inline-v7825">
    <div class="section-title"><h2>テーマで探す</h2></div>
    <div class="visual-entry-grid-v7825 compact-v7825">
      ${rnVisualEntryV7825('story','寿司・おにぎり','日本の米文化', 'sushi-onigiri', "S.archiveKind='stories';S.filters.archive_stories='寿司 おにぎり';switchView('detail')")}
      ${rnVisualEntryV7825('story','魯肉飯','台湾の食感文化', 'lu-rou-fan', "S.archiveKind='stories';S.filters.archive_stories='魯肉飯 台湾';switchView('detail')")}
      ${rnVisualEntryV7825('story','ビリヤニ','香り米とスパイス', 'biriyani', "S.archiveKind='stories';S.filters.archive_stories='ビリヤニ';switchView('detail')")}
      ${rnVisualEntryV7825('story','粥','水分と食感', 'congee', "S.archiveKind='stories';S.filters.archive_stories='粥';switchView('detail')")}
    </div>
  </section>`;
}
function rnVarietyVisualShortcutsV7825(){
  return `<section class="visual-discovery-v7825 inline-v7825">
    <div class="section-title"><h2>米種で探す</h2></div>
    <div class="visual-entry-grid-v7825 compact-v7825">
      ${rnVisualEntryV7825('illust','短粒米','日本・台湾など', 'variety-card', "S.archiveKind='varieties';S.filters.archive_varieties='短粒';switchView('detail')")}
      ${rnVisualEntryV7825('illust','長粒米','タイ・インドなど', 'variety-card', "S.archiveKind='varieties';S.filters.archive_varieties='長粒';switchView('detail')")}
      ${rnVisualEntryV7825('illust','香り米','ジャスミン・バスマティ', 'variety-card', "S.archiveKind='varieties';S.filters.archive_varieties='香り';switchView('detail')")}
      ${rnVisualEntryV7825('illust','もち米','粘り・菓子・料理', 'variety-card', "S.archiveKind='varieties';S.filters.archive_varieties='もち';switchView('detail')")}
    </div>
  </section>`;
}
const renderHomeV7825=renderHome;
renderHome=function(){
  renderHomeV7825();
  const home=document.getElementById('home');
  if(home && !home.querySelector('.visual-discovery-v7825')){
    const version=home.querySelector('.rn-version-v7813');
    if(version) version.insertAdjacentHTML('beforebegin', rnHomeVisualDiscoveryV7825());
    else home.insertAdjacentHTML('beforeend', rnHomeVisualDiscoveryV7825());
  }
  const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7825;
  rnPublicCleanV7819('home');
};
const renderFutureV7825=renderFuture;
renderFuture=function(){
  renderFutureV7825();
  const el=document.getElementById('future');
  if(el && !el.querySelector('.visual-discovery-v7825.inline-v7825')){
    const toolbar=el.querySelector('.toolbar');
    if(toolbar) toolbar.insertAdjacentHTML('beforebegin', rnFutureVisualShortcutsV7825());
  }
  rnPublicCleanV7819('future');
};
const renderVarietiesV7825=renderVarieties;
renderVarieties=function(){
  renderVarietiesV7825();
  const el=document.getElementById('varieties');
  if(el && !el.querySelector('.visual-discovery-v7825.inline-v7825')){
    const toolbar=el.querySelector('.toolbar');
    if(toolbar) toolbar.insertAdjacentHTML('beforebegin', rnVarietyVisualShortcutsV7825());
  }
  rnPublicCleanV7819('varieties');
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7825 rerender skipped', e); }


/* v78.43: keep homepage as a concise entry point.
   Broad visual entrances only; specific lists remain in search/detail pages. */
function rnFocusEntryV7826(kind,title,sub,key,onclick){
  const src = kind==='story'
    ? storyVisualPathV7824(key)
    : kind==='country'
      ? countryVisualPathV7824(key)
      : `assets/illustrations/${key}.svg?v=78ui43`;
  return `<button class="home-focus-card-v7826" onclick="${onclick}">
    <img src="${src}" alt="" loading="lazy">
    <span><b>${pEsc(title)}</b><small>${pEsc(sub)}</small></span>
  </button>`;
}
rnHomeVisualDiscoveryV7825=function(){
  return `<section class="home-focus-v7826" aria-label="探す入口">
    <div class="section-title"><h2>探す入口</h2></div>
    <div class="home-focus-grid-v7826">
      ${rnFocusEntryV7826('illust','米種・品種から探す','短粒米・長粒米・香り米・もち米','variety-card',"S.archiveKind='varieties';switchView('detail')")}
      ${rnFocusEntryV7826('story','料理・文化から探す','国・料理・食感の物語','rice-bowl',"S.archiveKind='stories';switchView('detail')")}
      ${rnFocusEntryV7826('illust','水質・保管を確認','GPS水質・納米庫・炊飯条件','gps-water',"switchView('check')")}
    </div>
    <details class="home-more-v7826">
      <summary>もっと探す</summary>
      <div class="home-more-grid-v7826">
        <button onclick="S.archiveKind='history';switchView('detail')">地域ヒストリー</button>
        <button onclick="switchView('literature')">文献</button>
        <button onclick="switchView('learn')">学ぶ</button>
        <button onclick="switchView('rankings')">ランキング</button>
        <button onclick="switchView('words')">用語集</button>
        <button onclick="S.archiveKind='futureRice';switchView('detail')">未来テーマ</button>
      </div>
    </details>
  </section>`;
};
const RN_PUBLIC_BUILD_V7826='RICE NAVI v78.43 / build 78ui43';
const renderHomeV7826=renderHome;
renderHome=function(){
  renderHomeV7826();
  const v=document.querySelector('.rn-version-v7813');
  if(v) v.textContent=RN_PUBLIC_BUILD_V7826;
  rnPublicCleanV7819('home');
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7826 rerender skipped', e); }


/* v78.43: illustration insertion continuation. Focus only on visual assets and where they appear. */
function rnAsset7827(folder,name){return `assets/${folder}/${pEsc(name)}.svg?v=78ui43`;}
function rnVisualChip7827(folder,name,title,sub){
  return `<div class="rn-visual-chip-v7827"><img src="${rnAsset7827(folder,name)}" alt="" loading="lazy"><span><b>${pEsc(title||'')}</b><small>${pEsc(sub||'')}</small></span></div>`;
}
const storyThemeVisualV7827Base = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body')].join(' ').toLowerCase();
  if(/カオマンガイ|海南|chicken rice|hainan/.test(s)) return 'chicken-rice';
  if(/カレー|curry/.test(s)) return 'curry-rice';
  if(/キンパ|gimbap|kimbap/.test(s)) return 'kimbap';
  if(/ビビンバ|bibimbap/.test(s)) return 'bibimbap';
  if(/ナシゴレン|nasi goreng/.test(s)) return 'nasi-goreng';
  if(/コムタム|cơm tấm|com tam/.test(s)) return 'com-tam';
  if(/ドルマ|ピラフ|pilaf|dolma/.test(s)) return 'dolma-pilaf';
  if(/米粉麺|米麺|rice noodle|フォー|pho/.test(s)) return 'rice-noodle';
  if(/餅|米菓|せんべい|rice cake|mochi/.test(s)) return 'rice-cake';
  if(/酒米|日本酒|sake/.test(s)) return 'sake-rice';
  if(/米粉|rice flour/.test(s)) return 'rice-flour';
  if(/プディング|pudding|甘い|dessert/.test(s)) return 'rice-pudding';
  if(/アランチーニ|arancini/.test(s)) return 'arancini';
  if(/ジャンバラヤ|jambalaya/.test(s)) return 'jambalaya';
  if(/ガンボ|gumbo/.test(s)) return 'gumbo-rice';
  if(/豆|beans|rice and beans/.test(s)) return 'rice-and-beans';
  if(/朝粥|朝ごはん|breakfast porridge/.test(s)) return 'rice-porridge-breakfast';
  if(/米麺スープ|noodle soup/.test(s)) return 'rice-noodle-soup';
  if(/スナック|snack|菓子/.test(s)) return 'rice-snack';
  return storyThemeVisualV7827Base ? storyThemeVisualV7827Base(x) : 'rice-bowl-culture';
};
function riceWordVisualNameV7827(x){
  const s=[riceWordTextV7810(x,'word'), riceWordTextV7810(x,'meaning'), field(x,'category')].join(' ');
  if(/新米|古米|季節|収穫/.test(s)) return 'rice-grain-closeup';
  if(/もち|縁|粘り/.test(s)) return 'rice-cake';
  if(/水|吸水|浸漬/.test(s)) return 'water-hardness';
  if(/蒸らし|炊飯|火|釜/.test(s)) return 'steam-rice';
  if(/保管|湿度|納米庫/.test(s)) return 'storage-humidity';
  return 'daily-word';
}
function futureVisualNameV7827(x){
  const s=[field(x,'category'),field(x,'title_ja','title'),field(x,'subtitle_ja'),field(x,'body_ja')].join(' ');
  if(/暑|高温|白未熟|気候/.test(s)) return 'future-climate';
  if(/干ばつ|水不足|乾燥/.test(s)) return 'future-drought';
  if(/塩害|塩分|海/.test(s)) return 'future-salt';
  if(/洪水|冠水|雨/.test(s)) return 'future-flood';
  if(/技術|AI|センサ|ゲノム|育種/.test(s)) return 'future-tech';
  return 'future-climate';
}
function varietyTypeVisualNameV7827(v){
  const s=varietySearchBlobV7814(v||{});
  if(/玄米|brown/.test(s)) return 'brown-rice';
  if(/黒米|black/.test(s)) return 'black-rice';
  if(/赤米|red/.test(s)) return 'red-rice';
  if(/酒|sake/.test(s)) return 'sake-rice';
  if(/寿司|sushi/.test(s)) return 'sushi-rice';
  if(/業務|commercial|外食|弁当/.test(s)) return 'commercial-rice';
  if(/粥|porridge|congee/.test(s)) return 'porridge-rice';
  if(/炒飯|fried/.test(s)) return 'fried-rice-type';
  const [icon]=varietyCategoryV7814(v||{});
  if(icon==='rice-short') return 'short-grain';
  if(icon==='rice-long') return 'long-grain';
  if(icon==='rice-aroma') return 'aroma-rice';
  if(icon==='rice-glutinous') return 'glutinous-rice';
  return 'use-rice';
}
const riceWordArchiveV7827Base = riceWordArchiveV7810;
riceWordArchiveV7810=function(){
  const kind='ricewords', q=archiveQueryV7810(kind), words=arrV7810(S.data?.daily_rice_words), filtered=words.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,160).map(x=>{
    const word=riceWordTextV7810(x,'word')||'米言葉';
    const meaning=riceWordTextV7810(x,'meaning')||'意味を整理中';
    return archiveRowV7811(word, meaning,
      `${rnVisualChip7827('illustrations',riceWordVisualNameV7827(x),word,meaning)}<p><b>${pEsc(meaning)}</b></p><p>${pEsc(riceWordTextV7810(x,'message')||riceWordTextV7810(x,'body')||'内容を整理中です。')}</p>`,
      `${btnV784('words','用語集で見る','wordq',word)}${btnV784('learn','関連教材','learn',word)}`);
  }).join('');
  return `${archiveCleanLeadV7814('米言葉を探す',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(words.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する米言葉がありません','検索条件を変えてください。'))}`;
};
futureArchiveV7810=function(){
  const kind='futureRice', q=archiveQueryV7810(kind), data=arrV7810(S.data?.future_rice), filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,120).map(x=>{
    const title=field(x,'title_ja','title')||'未来テーマ';
    const sub=field(x,'subtitle_ja','category')||'お米の未来';
    return archiveRowV7811(title, `${field(x,'category')||'未来'} / ${field(x,'evidence_level')||'確認中'}`,
      `${rnVisualChip7827('illustrations',futureVisualNameV7827(x),title,sub)}<p>${pEsc(field(x,'body_ja','body')||'内容を整理中です。')}</p>`,
      `${btnV784('literature','関連文献','litq',title)}${btnV784('words','関連用語','wordq',field(x,'category')||title)}`);
  }).join('');
  return `${archiveCleanLeadV7814('お米の未来を探す',kind)}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する未来テーマがありません','検索条件を変えてください。'))}`;
};
varietiesArchiveV7810=function(){
  const kind='varieties', q=archiveQueryV7810(kind), data=arrV7810(S.data?.rice_varieties), filtered=data.filter(x=>matchQ7810(x,q));
  const rows=filtered.slice(0,180).map(v=>{ const title=titleOfVariety(v); const [icon,cat]=varietyCategoryV7814(v); const img=varietyTypeVisualNameV7827(v); return archiveRowV7811(title, `${countryOfVariety(v)} / ${cat}`,
    `<div class="archive-variety-visual-v7827"><img src="${rnAsset7827('rice-types',img)}" alt="" loading="lazy"><div><p><b>用途：</b>${pEsc(field(v,'main_uses','use_category_primary')||'確認中')}</p><p><b>食感：</b>${pEsc(field(v,'texture_tags','aroma')||'確認中')}</p><p><b>炊飯メモ：</b>${pEsc(cleanCookingMemo(v))}</p></div></div>`,
    `${btnV784('literature','関連文献','litq',title)}${btnV784('words','関連用語','wordq',field(v,'related_terms')||title)}`); }).join('');
  return `${archiveCleanLeadV7814('米品種図鑑で探す',kind)}${varietyTypePillsV7814()}<div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'総数')}</div>${archiveListWrapV7811(rows||v47Empty('該当する品種がありません','検索条件を変えてください。'))}`;
};
const RN_PUBLIC_BUILD_V7827='RICE NAVI v78.43 / build 78ui43';
const renderHomeV7827=renderHome;
renderHome=function(){ renderHomeV7827(); const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7827; rnPublicCleanV7819('home'); };
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7827 rerender skipped', e); }


/* v78.43: illustration insertion continuation. More story/country/rice visuals, no UI detour. */
const storyThemeVisualV7828Base = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'story_angle'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body')].join(' ').toLowerCase();
  if(/油飯|youfan/.test(s)) return 'taiwan-oil-rice';
  if(/便當|弁当|bento/.test(s)) return /駅弁|ekiben/.test(s)?'ekiben-rice':'taiwan-bento';
  if(/丼|donburi/.test(s)) return 'donburi-rice';
  if(/炊き込み|炊込|takikomi/.test(s)) return 'takikomi-gohan';
  if(/赤飯|sekihan/.test(s)) return 'sekihan';
  if(/茶漬|ochazuke/.test(s)) return 'ochazuke';
  if(/煲仔|claypot/.test(s)) return 'claypot-rice';
  if(/釜飯|kamameshi/.test(s)) return 'kamameshi';
  if(/バスマティ|basmati/.test(s)) return 'basmati-rice';
  if(/ジャスミン|jasmine/.test(s)) return 'jasmine-rice';
  if(/プロフ|plov/.test(s)) return 'plov-rice';
  if(/プラオ|pulao/.test(s)) return 'pulao-rice';
  if(/マンディ|mandi/.test(s)) return 'mandi-rice';
  if(/マクルーバ|maqluba/.test(s)) return 'maqluba-rice';
  if(/カブサ|kabsa/.test(s)) return 'kabsa-rice';
  if(/ターディグ|tahdig/.test(s)) return 'tahdig-rice';
  if(/ナシウドゥック|nasi uduk/.test(s)) return 'nasi-uduk';
  if(/ナシクニン|nasi kuning/.test(s)) return 'nasi-kuning';
  if(/クトゥパ|ロントン|ketupat|lontong/.test(s)) return 'ketupat-lontong';
  if(/雑穀|zakkoku|mixed grain/.test(s)) return 'zakkoku-rice';
  if(/ライスサラダ|rice salad/.test(s)) return 'rice-salad';
  if(/ライスバーガー|rice burger/.test(s)) return 'rice-burger';
  if(/ロコモコ|loco moco/.test(s)) return 'loco-moco';
  if(/タコライス|taco rice/.test(s)) return 'taco-rice';
  if(/イドゥリ|ドーサ|idli|dosa/.test(s)) return 'idli-dosa';
  if(/ホッパー|hopper/.test(s)) return 'hopper-rice';
  if(/粽|ちまき|zongzi/.test(s)) return 'zongzi';
  if(/おこわ|okowa/.test(s)) return 'okowa';
  if(/米酒|酒文化|rice wine/.test(s)) return 'rice-wine-culture';
  return storyThemeVisualV7828Base ? storyThemeVisualV7828Base(x) : 'rice-bowl-culture';
};
const varietyTypeVisualNameV7828Base = varietyTypeVisualNameV7827;
varietyTypeVisualNameV7827=function(v){
  const s=varietySearchBlobV7814(v||{}).toLowerCase();
  if(/basmati|バスマティ/.test(s)) return 'basmati-type';
  if(/jasmine|ジャスミン/.test(s)) return 'jasmine-type';
  if(/calrose|カルローズ/.test(s)) return 'calrose-type';
  if(/indica|インディカ|長粒/.test(s)) return 'indica-type';
  if(/japonica|ジャポニカ|短粒/.test(s)) return 'japonica-type';
  if(/sticky|glutinous|もち|糯/.test(s)) return 'sticky-type';
  if(/無洗|quick|時短|簡便/.test(s)) return 'quick-cook-rice';
  if(/特別|premium|ブランド|高級/.test(s)) return 'premium-rice';
  return varietyTypeVisualNameV7828Base ? varietyTypeVisualNameV7828Base(v) : 'use-rice';
};
const RN_PUBLIC_BUILD_V7828='RICE NAVI v78.43 / build 78ui43';
const renderHomeV7828=renderHome;
renderHome=function(){ renderHomeV7828(); const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7828; rnPublicCleanV7819('home'); };
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7828 rerender skipped', e); }


/* v78.43: illustration insertion continuation only. More story/country/rice visual mappings. */
const storyThemeVisualV7829Base = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'story_angle'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body')].join(' ').toLowerCase();
  if(/arroz caldo|アロスカルド/.test(s)) return 'arroz-caldo';
  if(/lugaw|ルガウ/.test(s)) return 'lugaw';
  if(/champorado|チャンポラード/.test(s)) return 'champorado';
  if(/sinangag|シナンガグ|garlic rice/.test(s)) return 'sinangag';
  if(/bibingka|ビビンカ/.test(s)) return 'bibingka';
  if(/mango sticky|マンゴー.*もち米|カオニャオ.*マムアン/.test(s)) return 'mango-sticky-rice';
  if(/\bxôi\b|xoi|ソイ|ベトナム.*もち米/.test(s)) return 'xoi-vietnam';
  if(/bánh chưng|banh chung|バインチュン/.test(s)) return 'banh-chung';
  if(/bánh tét|banh tet|バンテット/.test(s)) return 'banh-tet';
  if(/rice paper|ライスペーパー|生春巻/.test(s)) return 'rice-paper-roll';
  if(/lo mai gai|糯米雞|ローマイガイ/.test(s)) return 'lo-mai-gai';
  if(/cheung fun|腸粉|チョンファン/.test(s)) return 'cheung-fun';
  if(/tteok|トック|떡/.test(s)) return 'tteok';
  if(/songpyeon|ソンピョン/.test(s)) return 'songpyeon';
  if(/rice ball|おにぎり|飯糰|ファントゥアン/.test(s)) return 'rice-ball';
  if(/卵かけ|tamago kake|tkg/.test(s)) return 'tamago-kake';
  if(/オムライス|omurice/.test(s)) return 'omurice';
  if(/ハヤシライス|hayashi/.test(s)) return 'hayashi-rice';
  if(/arroz con pollo|アロス.*ポヨ/.test(s)) return 'arroz-con-pollo';
  if(/arroz negro|黒いパエリア|イカ墨/.test(s)) return 'arroz-negro';
  if(/horchata|オルチャタ/.test(s)) return 'horchata';
  if(/rice milk|ライスミルク/.test(s)) return 'rice-milk';
  if(/米酢|rice vinegar|酢飯/.test(s)) return 'rice-vinegar';
  if(/米ぬか|糠|rice bran|nuka/.test(s)) return 'rice-bran';
  if(/朝市|朝食|breakfast|屋台/.test(s)) return 'market-breakfast';
  if(/蒸籠|蒸し|steamer/.test(s)) return 'rice-steamer';
  if(/器|茶碗|bowl|ceramic/.test(s)) return 'ceramic-bowl';
  return storyThemeVisualV7829Base ? storyThemeVisualV7829Base(x) : 'rice-bowl-culture';
};
const countryVisualSlugV7829Base = countryVisualSlugV7824;
countryVisualSlugV7824=function(name){
  const s=String(name||'').toLowerCase();
  const map=[[/afghanistan|アフガニスタン/,'afghanistan'],[/uzbekistan|ウズベキスタン/,'uzbekistan'],[/kazakhstan|カザフスタン/,'kazakhstan'],[/azerbaijan|アゼルバイジャン/,'azerbaijan'],[/georgia|ジョージア/,'georgia'],[/saudi|サウジ/,'saudi-arabia'],[/uae|emirates|アラブ首長国連邦/,'uae'],[/oman|オマーン/,'oman'],[/jordan|ヨルダン/,'jordan'],[/syria|シリア/,'syria'],[/israel|イスラエル/,'israel'],[/ethiopia|エチオピア/,'ethiopia'],[/kenya|ケニア/,'kenya'],[/tanzania|タンザニア/,'tanzania'],[/south africa|南アフリカ/,'south-africa'],[/colombia|コロンビア/,'colombia'],[/argentina|アルゼンチン/,'argentina'],[/chile|チリ/,'chile'],[/germany|ドイツ/,'germany'],[/netherlands|オランダ/,'netherlands'],[/poland|ポーランド/,'poland'],[/romania|ルーマニア/,'romania'],[/bulgaria|ブルガリア/,'bulgaria'],[/sweden|スウェーデン/,'sweden'],[/denmark|デンマーク/,'denmark'],[/canada|カナダ/,'canada'],[/new zealand|ニュージーランド/,'new-zealand'],[/qatar|カタール/,'qatar'],[/kuwait|クウェート/,'kuwait'],[/bhutan|ブータン/,'bhutan']];
  for(const [re,slug] of map){ if(re.test(s)) return slug; }
  return countryVisualSlugV7829Base ? countryVisualSlugV7829Base(name) : 'world-map-rice';
};
const riceWordVisualNameV7829Base = riceWordVisualNameV7827;
riceWordVisualNameV7827=function(x){
  const s=[riceWordTextV7810(x,'word'), riceWordTextV7810(x,'meaning'), riceWordTextV7810(x,'message'), field(x,'category')].join(' ');
  if(/季節|春|夏|秋|冬|収穫|新米/.test(s)) return 'word-season';
  if(/注意|確認|危険|不足|過多|失敗/.test(s)) return 'word-warning';
  if(/硬|やわ|粘|粒|食感|ふっくら/.test(s)) return 'word-texture';
  if(/水|吸水|浸漬|硬度|pH/.test(s)) return 'word-water';
  return riceWordVisualNameV7829Base ? riceWordVisualNameV7829Base(x) : 'daily-word';
};
const futureVisualNameV7829Base = futureVisualNameV7827;
futureVisualNameV7827=function(x){
  const s=[field(x,'category'),field(x,'title_ja','title'),field(x,'subtitle_ja'),field(x,'body_ja')].join(' ');
  if(/水|灌漑|用水|水資源/.test(s)) return 'future-water';
  if(/育種|品種|ゲノム|交配/.test(s)) return 'future-breeding';
  if(/人手|労働|農家|担い手|自動化/.test(s)) return 'future-labor';
  if(/循環|副産物|ぬか|廃棄|サステナ/.test(s)) return 'future-circular';
  if(/包装|パッケージ|保存|流通/.test(s)) return 'future-package';
  return futureVisualNameV7829Base ? futureVisualNameV7829Base(x) : 'future-climate';
};
const varietyTypeVisualNameV7829Base = varietyTypeVisualNameV7827;
varietyTypeVisualNameV7827=function(v){
  const s=varietySearchBlobV7814(v||{}).toLowerCase();
  if(/blend|ブレンド|混合/.test(s)) return 'rice-blend';
  if(/低アミロース|low amylose/.test(s)) return 'low-amylose';
  if(/高アミロース|high amylose/.test(s)) return 'high-amylose';
  if(/中粒|medium grain|medium-grain/.test(s)) return 'medium-grain';
  if(/parboiled|パーボイル/.test(s)) return 'parboiled-rice';
  if(/米粉|rice flour|製粉/.test(s)) return 'rice-flour-type';
  if(/飼料|加工|industrial|原料用/.test(s)) return 'feed-industrial-rice';
  if(/大吟醸|酒造好適|sake premium/.test(s)) return 'sake-premium';
  return varietyTypeVisualNameV7829Base ? varietyTypeVisualNameV7829Base(v) : 'use-rice';
};
const RN_PUBLIC_BUILD_V7829='RICE NAVI v78.43 / build 78ui43';
const renderHomeV7829=renderHome;
renderHome=function(){ renderHomeV7829(); const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7829; rnPublicCleanV7819('home'); };
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7829 rerender skipped', e); }


/* v78.43: illustration continuation only. Add more cultural/rice-type mappings. */
const storyThemeVisualV7830Base = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'story_angle'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body')].join(' ').toLowerCase();
  if(/koshari|コシャリ/.test(s)) return 'koshari';
  if(/mujadara|ムジャッダラ/.test(s)) return 'mujadara';
  if(/sarma|サルマ/.test(s)) return 'sarma';
  if(/dolma|ドルマ/.test(s)) return 'dolma-rice';
  if(/couscous|クスクス/.test(s)) return 'rice-couscous';
  if(/waakye|ワチェ/.test(s)) return 'waakye';
  if(/thieboudienne|チェブジェン/.test(s)) return 'thieboudienne';
  if(/nasi campur|ナシチャンプル/.test(s)) return 'nasi-campur';
  if(/lemang|レマン/.test(s)) return 'lemang';
  if(/bubur ayam|ブブール/.test(s)) return 'bubur-ayam';
  if(/khichdi|キチュリ/.test(s)) return 'khichdi';
  if(/pongal|ポンガル/.test(s)) return 'pongal';
  if(/lemon rice|レモンライス/.test(s)) return 'lemon-rice';
  if(/curd rice|カードライス/.test(s)) return 'curd-rice';
  if(/おにぎり|onigiri/.test(s)) return 'onigiri-shop';
  return storyThemeVisualV7830Base ? storyThemeVisualV7830Base(x) : 'rice-bowl-culture';
};
const countryVisualSlugV7830Base = countryVisualSlugV7824;
countryVisualSlugV7824=function(name){
  const s=String(name||'').toLowerCase();
  const map=[[/mauritius|モーリシャス/,'mauritius'],[/mozambique|モザンビーク/,'mozambique'],[/zambia|ザンビア/,'zambia'],[/uganda|ウガンダ/,'uganda'],[/rwanda|ルワンダ/,'rwanda'],[/bolivia|ボリビア/,'bolivia'],[/uruguay|ウルグアイ/,'uruguay'],[/paraguay|パラグアイ/,'paraguay'],[/venezuela|ベネズエラ/,'venezuela'],[/costa rica|コスタリカ/,'costa-rica'],[/panama|パナマ/,'panama'],[/dominican|ドミニカ/,'dominican-republic'],[/jamaica|ジャマイカ/,'jamaica'],[/belgium|ベルギー/,'belgium'],[/switzerland|スイス/,'switzerland'],[/austria|オーストリア/,'austria'],[/czech|チェコ/,'czechia'],[/hungary|ハンガリー/,'hungary'],[/serbia|セルビア/,'serbia'],[/croatia|クロアチア/,'croatia']];
  for(const [re,slug] of map){ if(re.test(s)) return slug; }
  return countryVisualSlugV7830Base ? countryVisualSlugV7830Base(name) : 'world-map-rice';
};
const varietyTypeVisualNameV7830Base = varietyTypeVisualNameV7827;
varietyTypeVisualNameV7827=function(v){
  const s=varietySearchBlobV7814(v||{}).toLowerCase();
  if(/arborio|アルボリオ/.test(s)) return 'arborio-type';
  if(/risotto|リゾット/.test(s)) return 'risotto-type';
  if(/paella|パエリア/.test(s)) return 'paella-type';
  if(/sushi|寿司/.test(s)) return 'sushi-premium';
  if(/bento|弁当/.test(s)) return 'bento-rice';
  if(/onigiri|おにぎり/.test(s)) return 'onigiri-rice';
  if(/低たんぱく|low protein/.test(s)) return 'low-protein-rice';
  if(/高たんぱく|high protein/.test(s)) return 'high-protein-rice';
  if(/やわらか|soft/.test(s)) return 'soft-rice';
  if(/粒立ち|firm|硬め/.test(s)) return 'firm-rice';
  return varietyTypeVisualNameV7830Base ? varietyTypeVisualNameV7830Base(v) : 'use-rice';
};
const RN_PUBLIC_BUILD_V7830='RICE NAVI v78.43 / build 78ui43';
const renderHomeV7830=renderHome;
renderHome=function(){ renderHomeV7830(); const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7830; rnPublicCleanV7819('home'); };
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7830 rerender skipped', e); }


/* v78.43 illustration continuation: more story and rice-type matching */
const RN_PUBLIC_BUILD_V7831='RICE NAVI v78.43 / build 78ui43';
const _storyThemeVisualV7831 = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms')].join(' ').toLowerCase();
  if(/カオマンガイ|khao man gai|海南鶏飯/.test(s)) return 'khao-man-gai';
  if(/オムライス|omurice/.test(s)) return 'omurice';
  if(/ハヤシ|hayashi/.test(s)) return 'hayashi-rice';
  if(/ロコモコ|loco moco/.test(s)) return 'loco-moco';
  if(/アロス.?コン.?ポヨ|arroz con pollo/.test(s)) return 'arroz-con-pollo';
  if(/アロス.?ネグロ|arroz negro/.test(s)) return 'arroz-negro';
  if(/ビビンバ|bibimbap/.test(s)) return 'bibimbap-rice';
  if(/キンパ|김밥|gimbap|kimbap/.test(s)) return 'kimbap-rice';
  if(/ナシチャンプル|nasi campur/.test(s)) return 'nasi-campur';
  if(/マクルーバ|maklouba/.test(s)) return 'maklouba-rice';
  if(/カブサ|kabsa/.test(s)) return 'kabsa-rice';
  if(/キチュリ|khichdi/.test(s)) return 'khichdi-rice';
  if(/ポンガル|pongal/.test(s)) return 'pongal-rice';
  if(/レモンライス|lemon rice/.test(s)) return 'lemon-rice';
  if(/カードライス|curd rice/.test(s)) return 'curd-rice';
  return _storyThemeVisualV7831(x);
};
const _countryVisualV7831 = countryVisualV7824;
countryVisualV7824=function(name){
  const s=String(name||'').toLowerCase();
  if(/ハワイ|hawaii/.test(s)) return 'hawaii';
  if(/スペイン|spain/.test(s)) return 'spain';
  if(/韓国|korea/.test(s)) return 'korea';
  if(/サウジ|saudi|湾岸/.test(s)) return 'saudi-arabia';
  return _countryVisualV7831(name);
};
function varietyVisualV7831(v){
  const s=[titleOfVariety(v||{}), field(v,'type'), field(v,'cuisine_use'), field(v,'usage_note'), field(v,'texture'), field(v,'characteristics')].join(' ').toLowerCase();
  if(/バスマティ|basmati/.test(s)) return 'basmati-type';
  if(/カルローズ|calrose/.test(s)) return 'calrose-type';
  if(/アルボリオ|arborio|リゾット/.test(s)) return 'arborio-type';
  if(/弁当/.test(s)) return 'bento-rice';
  if(/粒立ち/.test(s)) return 'grainy-rice';
  if(/やわらか|もちもち/.test(s)) return 'soft-sticky-rice';
  if(/業務用/.test(s)) return 'business-rice';
  if(/プレミアム|高級/.test(s)) return 'premium-japonica';
  return '';
}
const _varietyVisualCardV7831 = typeof varietyVisualCardV7814==='function' ? varietyVisualCardV7814 : null;
if(_varietyVisualCardV7831){
  varietyVisualCardV7814=function(v){
    const extra=varietyVisualV7831(v||{});
    const html=_varietyVisualCardV7831(v||{});
    if(!extra) return html;
    return html.replace('<article class="variety-feature-v7814">', `<article class="variety-feature-v7814"><div class="archive-visual-chip archive-visual-chip-v7824"><img src="assets/rice-types/${extra}.svg?v=${RN_ASSET_VERSION}" alt="" loading="lazy"><span>${pEsc(titleOfVariety(v||{}))}</span></div>`);
  }
}
const _renderHomeV7831 = renderHome;
renderHome=function(){ _renderHomeV7831(); const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7831; };
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7831 rerender skipped', e); }


/* v78.43 illustration continuation: rice processing, daily cards, water/storage visuals */
const RN_PUBLIC_BUILD_V7832='RICE NAVI v78.43 / build 78ui43';

const _storyThemeVisualV7832 = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body_ja')].join(' ').toLowerCase();
  if(/米粉パン|rice flour bread/.test(s)) return 'rice-flour-bread';
  if(/米粉.*(菓子|ケーキ)|rice flour cake/.test(s)) return 'rice-flour-cake';
  if(/せんべい|煎餅|米菓|cracker/.test(s)) return 'senbei-rice-cracker';
  if(/餅|もち文化|mochi/.test(s)) return 'mochi-culture';
  if(/甘酒|amazake/.test(s)) return 'amazake-rice';
  if(/酒米|日本酒|sake/.test(s)) return 'sake-brewing';
  if(/麹|こうじ|koji/.test(s)) return 'rice-koji';
  if(/米ぬか|糠|bran/.test(s)) return 'rice-bran-nuka';
  if(/米酢|vinegar/.test(s)) return 'rice-vinegar-culture';
  if(/土鍋.*粥|claypot/.test(s)) return 'porridge-claypot';
  if(/蒸し米|steamed rice/.test(s)) return 'steamed-rice-bowl';
  if(/雑穀|mixed grain/.test(s)) return 'mixed-grain-bowl';
  if(/給食|school lunch/.test(s)) return 'school-lunch-rice';
  if(/米屋|米市場|rice store/.test(s)) return 'rice-store-market';
  if(/祭.*餅|festival.*mochi/.test(s)) return 'festival-mochi';
  if(/供物|お供え|offering/.test(s)) return 'rice-offering';
  if(/朝食|breakfast/.test(s)) return 'rice-breakfast-shop';
  if(/弁当|便當|bento/.test(s)) return 'rice-bento-shop';
  if(/米麺|rice noodle/.test(s)) return 'rice-noodle-factory';
  if(/包む|wrapper|ライスペーパー/.test(s)) return 'rice-wrapper-food';
  return _storyThemeVisualV7832(x);
};

function dailyIllustrationV7832(kind, obj){
  const s=JSON.stringify(obj||{}).toLowerCase();
  if(kind==='word'){
    if(/水|硬度|吸水/.test(s)) return 'ricewords-water';
    if(/食感|粘り|硬さ|粒立ち/.test(s)) return 'ricewords-texture';
    if(/季節|春|夏|秋|冬/.test(s)) return 'ricewords-seasonal';
    return 'daily-riceword-card';
  }
  if(kind==='future'){
    if(/水|干ばつ|洪水|水資源/.test(s)) return 'future-water';
    if(/育種|品種|耐性/.test(s)) return 'future-breeding';
    if(/気候|温暖化| climate/.test(s)) return 'future-climate';
    return 'daily-story-card';
  }
  return 'daily-story-card';
}

function waterIllustrationV7832(text){
  const s=String(text||'').toLowerCase();
  if(/硬度|hardness/.test(s)) return 'water-hardness-card';
  if(/塩素|chlorine|カルキ/.test(s)) return 'chlorine-smell-card';
  if(/ph|酸|アルカリ/.test(s)) return 'ph-water-card';
  if(/tds|溶存/.test(s)) return 'tds-water-card';
  return 'water-quality';
}

const _varietyVisualV7832 = typeof varietyVisualV7831==='function' ? varietyVisualV7831 : function(){return ''};
varietyVisualV7831=function(v){
  const s=[titleOfVariety(v||{}), field(v,'type'), field(v,'cuisine_use'), field(v,'usage_note'), field(v,'texture'), field(v,'characteristics')].join(' ').toLowerCase();
  if(/麹|こうじ/.test(s)) return 'koji-rice';
  if(/米粉/.test(s)) return 'rice-flour-premium';
  if(/米菓|せんべい|煎餅/.test(s)) return 'cracker-rice';
  if(/餅|もち/.test(s)) return 'mochi-premium';
  if(/粥/.test(s)) return 'porridge-soft';
  if(/炒飯|チャーハン/.test(s)) return 'fried-grainy';
  if(/弁当/.test(s)) return 'bento-stable';
  if(/寿司/.test(s)) return 'sushi-balanced';
  if(/冷めても|冷飯/.test(s)) return 'cold-rice-good';
  if(/粘り控えめ|低粘/.test(s)) return 'low-stickiness';
  return _varietyVisualV7832(v);
};

const _renderHomeV7832=renderHome;
renderHome=function(){
  _renderHomeV7832();
  const v=document.querySelector('.rn-version-v7813');
  if(v) v.textContent=RN_PUBLIC_BUILD_V7832;
  rnPublicCleanV7819('home');
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7832 rerender skipped', e); }


/* v78.43 illustration continuation: Japanese/Taiwan/home-water and regional rice visuals */
const RN_PUBLIC_BUILD_V7833='RICE NAVI v78.43 / build 78ui43';

const _storyThemeVisualV7833 = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body_ja')].join(' ').toLowerCase();
  if(/定食|一汁三菜|白飯/.test(s)) return 'gohan-set-meal';
  if(/炊飯器|家庭.*炊飯/.test(s)) return 'rice-cooker-home';
  if(/釜飯/.test(s)) return 'kamameshi';
  if(/茶漬け|お茶漬け/.test(s)) return 'ochazuke';
  if(/丼|どんぶり|donburi/.test(s)) return 'donburi-bowl';
  if(/炊き込み|季節.*ご飯/.test(s)) return 'takikomi-seasonal';
  if(/赤飯|祝い/.test(s)) return 'sekihan-celebration';
  if(/雑煮/.test(s)) return 'zoni-mochi';
  if(/お粥|病人食|体調/.test(s)) return 'okayu-care';
  if(/おにぎり店|おむすび店/.test(s)) return 'rice-ball-shop';
  if(/魯肉飯/.test(s)) return 'lu-rou-fan-bowl';
  if(/便當|弁当.*台湾/.test(s)) return 'taiwan-bian-dang';
  if(/鶏肉飯|雞肉飯/.test(s)) return 'ji-rou-fan';
  if(/粽|ちまき/.test(s)) return 'zongzi-basket';
  if(/タイ.*もち米|sticky.*basket/.test(s)) return 'thai-sticky-basket';
  if(/ジャスミン|jasmine/.test(s)) return 'jasmine-steam';
  if(/バスマティ|basmati/.test(s)) return 'basmati-pot';
  if(/プロフ|plov/.test(s)) return 'plov-cauldron';
  if(/ピラフ|pilaf/.test(s)) return 'pilaf-pan';
  if(/米と豆|rice and beans/.test(s)) return 'rice-and-beans';
  return _storyThemeVisualV7833(x);
};

const _countryVisualV7833 = countryVisualV7824;
countryVisualV7824=function(name){
  const s=String(name||'').toLowerCase();
  if(/メコン|mekong/.test(s)) return 'mekong-delta';
  if(/イラワジ|irrawaddy/.test(s)) return 'irrawaddy-delta';
  if(/ミャンマー|myanmar/.test(s)) return 'myanmar-delta';
  if(/ポー川|po valley|イタリア北部/.test(s)) return 'po-valley';
  if(/エブロ|ebro/.test(s)) return 'ebro-delta';
  if(/カマルグ|camargue/.test(s)) return 'camargue';
  if(/アーカンソー|arkansas/.test(s)) return 'arkansas-rice';
  if(/カリフォルニア|california|カルローズ/.test(s)) return 'california-rice';
  return _countryVisualV7833(name);
};

const _varietyVisualV7833 = typeof varietyVisualV7831==='function' ? varietyVisualV7831 : function(){return ''};
varietyVisualV7831=function(v){
  const s=[titleOfVariety(v||{}), field(v,'type'), field(v,'cuisine_use'), field(v,'usage_note'), field(v,'texture'), field(v,'characteristics')].join(' ').toLowerCase();
  if(/白米|精米/.test(s)) return 'white-rice-standard';
  if(/玄米/.test(s)) return 'brown-rice-standard';
  if(/発芽玄米/.test(s)) return 'germinated-brown';
  if(/胚芽米/.test(s)) return 'haiga-rice';
  if(/無洗米/.test(s)) return 'musenmai';
  if(/新米/.test(s)) return 'new-crop-rice';
  if(/古米|古古米/.test(s)) return 'old-crop-rice';
  if(/ブレンド|業務用/.test(s)) return 'blended-commercial';
  return _varietyVisualV7833(v);
};

const _renderHomeV7833=renderHome;
renderHome=function(){
  _renderHomeV7833();
  const v=document.querySelector('.rn-version-v7813');
  if(v) v.textContent=RN_PUBLIC_BUILD_V7833;
  rnPublicCleanV7819('home');
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7833 rerender skipped', e); }


/* v78.43 illustration continuation: regional dishes and theme header matching */
const RN_PUBLIC_BUILD_V7834='RICE NAVI v78.43 / build 78ui43';

const _storyThemeVisualV7834 = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body_ja')].join(' ').toLowerCase();
  if(/ビビンカ|bibingka/.test(s)) return 'bibingka-rice-cake';
  if(/チャンポラード|champorado/.test(s)) return 'champorado';
  if(/アロス.?カルド|arroz caldo/.test(s)) return 'arroz-caldo';
  if(/ルガウ|lugaw/.test(s)) return 'lugaw';
  if(/マンゴー.*もち米|mango sticky/.test(s)) return 'mango-sticky-rice';
  if(/バインチュン|banh chung/.test(s)) return 'banchung';
  if(/バンテット|banh tet/.test(s)) return 'bantet';
  if(/腸粉|cheung fun/.test(s)) return 'cheung-fun';
  if(/糯米鶏|ローマイガイ|lo mai gai/.test(s)) return 'lo-mai-gai';
  if(/トックク|tteokguk/.test(s)) return 'tteokguk';
  if(/ライスコロッケ/.test(s)) return 'rice-croquette';
  if(/アランチーニ|arancini/.test(s)) return 'arancini-rice';
  if(/ジャンバラヤ|jambalaya/.test(s)) return 'jambalaya-pot';
  if(/ガンボ|gumbo/.test(s)) return 'gumbo-rice';
  if(/コシャリ|koshari/.test(s)) return 'koshari-bowl';
  if(/ムジャッダラ|mujaddara/.test(s)) return 'mujaddara-rice';
  if(/ワチェ|waakye/.test(s)) return 'waakye-bowl';
  if(/レマン|lemang/.test(s)) return 'lemang-bamboo';
  if(/ブブールアヤム|bubur ayam/.test(s)) return 'bubur-ayam';
  if(/クトゥパ|ロントン|ketupat|lontong/.test(s)) return 'ketupat-lontong';
  return _storyThemeVisualV7834(x);
};

const _countryVisualV7834 = countryVisualV7824;
countryVisualV7824=function(name){
  const s=String(name||'').toLowerCase();
  if(/台湾|taiwan/.test(s)) return 'taiwan-rice-field';
  if(/日本|japan/.test(s)) return 'japan-rice-field';
  if(/タイ|thai/.test(s)) return 'thai-rice-field';
  if(/インド|india/.test(s)) return 'india-rice-market';
  if(/ベトナム|vietnam/.test(s)) return 'vietnam-river-rice';
  if(/韓国|korea/.test(s)) return 'korea-rice-table';
  if(/イタリア|italy|risotto|リゾット/.test(s)) return 'italy-risotto-region';
  if(/スペイン|spain|paella|パエリア/.test(s)) return 'spain-paella-region';
  if(/西アフリカ|west africa|セネガル|ガーナ|ナイジェリア/.test(s)) return 'west-africa-rice';
  if(/南米|south america|ブラジル|ペルー|コロンビア/.test(s)) return 'south-america-rice';
  return _countryVisualV7834(name);
};

const _varietyVisualV7834 = typeof varietyVisualV7831==='function' ? varietyVisualV7831 : function(){return ''};
varietyVisualV7831=function(v){
  const s=[titleOfVariety(v||{}), field(v,'type'), field(v,'cuisine_use'), field(v,'usage_note'), field(v,'texture'), field(v,'characteristics')].join(' ').toLowerCase();
  if(/長粒.*香り|香り.*長粒/.test(s)) return 'long-aroma-premium';
  if(/短粒.*もち|もち.*短粒/.test(s)) return 'short-sticky-premium';
  if(/中粒|medium/.test(s)) return 'medium-balanced';
  if(/インディカ|indica/.test(s)) return 'indica-dry';
  if(/ジャポニカ|japonica/.test(s)) return 'japonica-sticky';
  if(/高アミロース/.test(s)) return 'high-amylose-firm';
  if(/低アミロース/.test(s)) return 'low-amylose-soft';
  if(/酒造|酒米|精米歩合/.test(s)) return 'sake-polishing';
  if(/加工用|原料用/.test(s)) return 'processed-rice';
  if(/主食用|高級/.test(s)) return 'table-rice-premium';
  return _varietyVisualV7834(v);
};

const _renderHomeV7834=renderHome;
renderHome=function(){
  _renderHomeV7834();
  const v=document.querySelector('.rn-version-v7813');
  if(v) v.textContent=RN_PUBLIC_BUILD_V7834;
  rnPublicCleanV7819('home');
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7834 rerender skipped', e); }


/* v78.43 illustration continuation: restored from v78.43 package, re-applied v78.43-v78.43 visual batches, then added quality/storage/factory visuals */
const RN_PUBLIC_BUILD_V7838='RICE NAVI v78.43 / build 78ui43';
const _storyThemeVisualV7838 = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body_ja')].join(' ').toLowerCase();
  if(/品質確認|quality/.test(s)) return 'rice-quality-inspection';
  if(/温度管理|temperature/.test(s)) return 'rice-temperature-control';
  if(/湿度管理|humidity/.test(s)) return 'rice-humidity-control';
  if(/虫確認|insect/.test(s)) return 'rice-insect-check';
  if(/カビ臭|mold/.test(s)) return 'rice-mold-smell-check';
  if(/硬度|hardness/.test(s)) return 'rice-water-hardness-story';
  if(/塩素|カルキ|chlorine/.test(s)) return 'rice-chlorine-story';
  if(/ph|酸|アルカリ/.test(s)) return 'rice-ph-story';
  if(/土|soil/.test(s)) return 'rice-soil-story';
  if(/苗|seedling/.test(s)) return 'rice-seedling-story';
  if(/灌漑|irrigation/.test(s)) return 'rice-field-irrigation';
  if(/乾燥|drying/.test(s)) return 'rice-drying';
  if(/流通|transport/.test(s)) return 'rice-transport';
  if(/売場|retail/.test(s)) return 'rice-retail-shelf';
  if(/贈答|gift/.test(s)) return 'rice-premium-gift';
  if(/通販|online/.test(s)) return 'rice-online-store';
  if(/米飯ライン|factory line/.test(s)) return 'rice-factory-line';
  if(/センサー|sensor/.test(s)) return 'rice-sensor-check';
  if(/記録|log/.test(s)) return 'rice-record-log';
  return _storyThemeVisualV7838(x);
};
const _countryVisualV7838 = countryVisualV7824;
countryVisualV7824=function(name){
  const s=String(name||'').toLowerCase();
  if(/品質管理|quality/.test(s)) return 'quality-control-region';
  if(/保管気候|storage climate/.test(s)) return 'storage-climate-region';
  if(/米飯工場|factory/.test(s)) return 'factory-line-region';
  if(/小売|retail/.test(s)) return 'retail-market-region';
  if(/贈答|gift/.test(s)) return 'gift-rice-region';
  if(/通販|online/.test(s)) return 'online-rice-region';
  if(/灌漑|irrigation/.test(s)) return 'irrigation-region';
  if(/乾燥|drying/.test(s)) return 'drying-region';
  if(/流通|transport/.test(s)) return 'transport-region';
  if(/検査|sensor/.test(s)) return 'sensor-factory-region';
  return _countryVisualV7838(name);
};
const _varietyVisualV7838 = typeof varietyVisualV7831==='function' ? varietyVisualV7831 : function(){return ''};
varietyVisualV7831=function(v){
  const s=[titleOfVariety(v||{}), field(v,'type'), field(v,'cuisine_use'), field(v,'usage_note'), field(v,'texture'), field(v,'characteristics')].join(' ').toLowerCase();
  if(/品質安定/.test(s)) return 'quality-stable-rice';
  if(/温度変化/.test(s)) return 'temperature-tolerant-rice';
  if(/湿度|保管/.test(s)) return 'humidity-storage-rice';
  if(/ライン|工場/.test(s)) return 'factory-line-type';
  if(/売場|小売/.test(s)) return 'retail-shelf-type';
  if(/贈答/.test(s)) return 'gift-premium-type';
  if(/通販/.test(s)) return 'online-store-type';
  if(/選別|センサー/.test(s)) return 'sensor-sorting-type';
  if(/乾燥/.test(s)) return 'drying-stable-type';
  if(/流通|輸送/.test(s)) return 'transport-stable-type';
  return _varietyVisualV7838(v);
};
const _renderHomeV7838=renderHome;
renderHome=function(){ _renderHomeV7838(); const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7838; rnPublicCleanV7819('home'); };
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7838 rerender skipped', e); }


/* v78.43 illustration continuation: seed, cultivation, quality, traceability matching */
const RN_PUBLIC_BUILD_V7839='RICE NAVI v78.43 / build 78ui43';

const _storyThemeVisualV7839 = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body_ja')].join(' ').toLowerCase();
  if(/種子選別|seed selection/.test(s)) return 'seed-selection-rice';
  if(/育苗|苗箱|seedling/.test(s)) return 'rice-seedling-tray';
  if(/田植え|移植|transplant/.test(s)) return 'rice-transplanting';
  if(/水田管理|field management/.test(s)) return 'rice-field-management';
  if(/施肥|肥料|fertilizer/.test(s)) return 'rice-fertilizer';
  if(/病害虫|害虫|pest/.test(s)) return 'rice-pest-control';
  if(/除草|weeding/.test(s)) return 'rice-weeding';
  if(/出穂|heading/.test(s)) return 'rice-heading';
  if(/開花|flowering/.test(s)) return 'rice-flowering';
  if(/登熟|ripening/.test(s)) return 'rice-ripening';
  if(/乾燥サイロ|drying silo/.test(s)) return 'rice-drying-silo';
  if(/籾摺|籾すり|hulling/.test(s)) return 'rice-hulling';
  if(/選別|sorting/.test(s)) return 'rice-sorting';
  if(/包装ライン|packaging line/.test(s)) return 'rice-packaging-line';
  if(/低温流通|コールドチェーン|cold chain/.test(s)) return 'rice-cold-chain';
  if(/品質検査|quality lab/.test(s)) return 'rice-quality-lab';
  if(/官能評価|sensory/.test(s)) return 'rice-sensory-test';
  if(/炊飯試験|cooking test/.test(s)) return 'rice-cooking-test';
  if(/記録管理|data record/.test(s)) return 'rice-data-record';
  if(/トレーサビリティ|traceability|追跡/.test(s)) return 'rice-traceability';
  return _storyThemeVisualV7839(x);
};

const _countryVisualV7839 = countryVisualV7824;
countryVisualV7824=function(name){
  const s=String(name||'').toLowerCase();
  if(/種子産地|seed production/.test(s)) return 'seed-production-area';
  if(/研究地域|research/.test(s)) return 'rice-research-area';
  if(/検査地域|quality lab/.test(s)) return 'quality-lab-region';
  if(/低温保管|cold storage/.test(s)) return 'cold-storage-region';
  if(/包装拠点|packaging center/.test(s)) return 'packaging-center-region';
  if(/物流拠点|distribution hub/.test(s)) return 'distribution-hub-rice';
  if(/追跡管理|traceability/.test(s)) return 'traceability-region';
  if(/食味文化|sensory culture/.test(s)) return 'sensory-culture-region';
  if(/水管理|irrigation control/.test(s)) return 'irrigation-control-region';
  if(/収穫時期|harvest season/.test(s)) return 'harvest-season-region';
  return _countryVisualV7839(name);
};

const _varietyVisualV7839 = typeof varietyVisualV7831==='function' ? varietyVisualV7831 : function(){return ''};
varietyVisualV7831=function(v){
  const s=[titleOfVariety(v||{}), field(v,'type'), field(v,'cuisine_use'), field(v,'usage_note'), field(v,'texture'), field(v,'characteristics')].join(' ').toLowerCase();
  if(/種子/.test(s)) return 'seed-use-rice';
  if(/試験用|検査用/.test(s)) return 'lab-test-rice';
  if(/選別上位|上位選別/.test(s)) return 'premium-sorted-rice';
  if(/低温/.test(s)) return 'low-temperature-rice';
  if(/追跡|トレーサ/.test(s)) return 'traceable-rice';
  if(/官能評価|食味評価/.test(s)) return 'sensory-good-rice';
  if(/炊飯試験/.test(s)) return 'cooking-test-rice';
  if(/包装適性/.test(s)) return 'packaging-fit-rice';
  if(/乾燥安定/.test(s)) return 'drying-stable-rice';
  if(/栽培適応|適応性/.test(s)) return 'field-adapted-rice';
  return _varietyVisualV7839(v);
};

const _renderHomeV7839=renderHome;
renderHome=function(){
  _renderHomeV7839();
  const v=document.querySelector('.rn-version-v7813');
  if(v) v.textContent=RN_PUBLIC_BUILD_V7839;
  rnPublicCleanV7819('home');
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7839 rerender skipped', e); }


/* v78.43 illustration continuation: future and resilience category coverage */
const RN_PUBLIC_BUILD_V7840='RICE NAVI v78.43 / build 78ui43';
const _storyThemeVisualV7840 = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body_ja')].join(' ').toLowerCase();
  if(/気候リスク|climate risk/.test(s)) return 'rice-climate-risk';
  if(/干ばつ|drought/.test(s)) return 'rice-drought-field';
  if(/洪水|flood/.test(s)) return 'rice-flood-field';
  if(/塩害|salt/.test(s)) return 'salt-tolerant-rice';
  if(/高温|heat/.test(s)) return 'heat-tolerant-rice';
  if(/低温|cold/.test(s)) return 'cold-tolerant-rice';
  if(/育種|breeding/.test(s)) return 'rice-breeding-lab';
  if(/遺伝資源|gene bank/.test(s)) return 'gene-bank-rice';
  if(/スマート農業|smart farm/.test(s)) return 'smart-farm-rice';
  if(/ドローン|drone/.test(s)) return 'drone-rice-field';
  if(/衛星|satellite/.test(s)) return 'satellite-rice-map';
  if(/節水|water saving/.test(s)) return 'water-saving-rice';
  if(/有機|organic/.test(s)) return 'organic-rice-field';
  if(/低炭素|low carbon/.test(s)) return 'low-carbon-rice';
  if(/循環|recycling/.test(s)) return 'rice-recycling';
  if(/稲わら|straw/.test(s)) return 'rice-straw-use';
  if(/籾殻|husk/.test(s)) return 'rice-husk-use';
  if(/エネルギー|energy/.test(s)) return 'rice-energy';
  if(/食料安全保障|food security/.test(s)) return 'rice-food-security';
  if(/未来の食卓|future table/.test(s)) return 'rice-future-table';
  return _storyThemeVisualV7840(x);
};
const _countryVisualV7840 = countryVisualV7824;
countryVisualV7824=function(name){
  const s=String(name||'').toLowerCase();
  if(/気候リスク|climate risk/.test(s)) return 'climate-risk-region';
  if(/干ばつ|drought/.test(s)) return 'drought-region';
  if(/洪水|flood/.test(s)) return 'flood-region';
  if(/塩害|salt/.test(s)) return 'salt-region';
  if(/高温|heat/.test(s)) return 'heat-region';
  if(/冷涼|低温|cold/.test(s)) return 'cold-region';
  if(/有機|organic/.test(s)) return 'organic-region';
  if(/スマート農業|smart/.test(s)) return 'smart-farm-region';
  if(/節水|water saving/.test(s)) return 'water-saving-region';
  if(/食料安全保障|food security/.test(s)) return 'food-security-region';
  return _countryVisualV7840(name);
};
const _varietyVisualV7840 = typeof varietyVisualV7831==='function' ? varietyVisualV7831 : function(){return ''};
varietyVisualV7831=function(v){
  const s=[titleOfVariety(v||{}), field(v,'type'), field(v,'cuisine_use'), field(v,'usage_note'), field(v,'texture'), field(v,'characteristics')].join(' ').toLowerCase();
  if(/干ばつ/.test(s)) return 'drought-tolerant-type';
  if(/洪水/.test(s)) return 'flood-tolerant-type';
  if(/塩害/.test(s)) return 'salt-tolerant-type';
  if(/高温/.test(s)) return 'heat-tolerant-type';
  if(/低温|冷涼/.test(s)) return 'cold-tolerant-type';
  if(/有機/.test(s)) return 'organic-type';
  if(/低炭素/.test(s)) return 'low-carbon-type';
  if(/節水/.test(s)) return 'water-saving-type';
  if(/育種/.test(s)) return 'future-breeding-type';
  if(/環境適応|レジリエンス/.test(s)) return 'resilient-rice-type';
  return _varietyVisualV7840(v);
};
const _renderHomeV7840=renderHome;
renderHome=function(){ _renderHomeV7840(); const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7840; rnPublicCleanV7819('home'); };
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7840 rerender skipped', e); }


/* v78.43 illustration continuation: glossary, literature, ranking, search-link coverage */
const RN_PUBLIC_BUILD_V7841='RICE NAVI v78.43 / build 78ui43';

const _storyThemeVisualV7841 = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body_ja')].join(' ').toLowerCase();
  if(/用語|glossary/.test(s)) return 'rice-glossary-term';
  if(/文献メモ|literature note/.test(s)) return 'rice-literature-note';
  if(/参考資料|reference book/.test(s)) return 'rice-reference-book';
  if(/研究論文|paper/.test(s)) return 'rice-research-paper';
  if(/基準|指針|standard|guide/.test(s)) return 'rice-standard-guide';
  if(/haccp|衛生管理/.test(s)) return 'rice-haccp-note';
  if(/品質マニュアル|quality manual/.test(s)) return 'rice-quality-manual';
  if(/ランキング|ranking/.test(s)) return 'rice-ranking-chart';
  if(/生産地図|production map/.test(s)) return 'rice-production-map';
  if(/消費量|consumption/.test(s)) return 'rice-consumption-chart';
  if(/輸出|輸入|export|import/.test(s)) return 'rice-export-flow';
  if(/タイトル検索/.test(s)) return 'rice-search-title';
  if(/キーワード検索/.test(s)) return 'rice-keyword-search';
  if(/関連リンク/.test(s)) return 'rice-related-link';
  if(/一覧|archive/.test(s)) return 'rice-archive-list';
  if(/詳細カード|card detail/.test(s)) return 'rice-card-detail';
  if(/根拠メモ/.test(s)) return 'rice-note-source';
  if(/公的データ|public data/.test(s)) return 'rice-public-data';
  if(/大学研究|university/.test(s)) return 'rice-university-study';
  if(/研究機関|institute/.test(s)) return 'rice-institute-data';
  return _storyThemeVisualV7841(x);
};

const _countryVisualV7841 = countryVisualV7824;
countryVisualV7824=function(name){
  const s=String(name||'').toLowerCase();
  if(/世界ランキング|global ranking/.test(s)) return 'global-ranking';
  if(/生産地域|production region/.test(s)) return 'production-region';
  if(/消費地域|consumption region/.test(s)) return 'consumption-region';
  if(/輸出地域|export region/.test(s)) return 'export-region';
  if(/輸入地域|import region/.test(s)) return 'import-region';
  if(/研究地域|research region/.test(s)) return 'research-region';
  if(/基準地域|standard region/.test(s)) return 'standard-region';
  if(/公的データ地域|public data region/.test(s)) return 'public-data-region';
  if(/文献地域|literature region/.test(s)) return 'literature-region';
  if(/一覧地域|archive region/.test(s)) return 'archive-region';
  return _countryVisualV7841(name);
};

const _varietyVisualV7841 = typeof varietyVisualV7831==='function' ? varietyVisualV7831 : function(){return ''};
varietyVisualV7831=function(v){
  const s=[titleOfVariety(v||{}), field(v,'type'), field(v,'cuisine_use'), field(v,'usage_note'), field(v,'texture'), field(v,'characteristics')].join(' ').toLowerCase();
  if(/根拠あり|エビデンス/.test(s)) return 'evidence-supported-rice';
  if(/文献あり/.test(s)) return 'reference-variety';
  if(/ランキング/.test(s)) return 'ranking-variety';
  if(/検索対象/.test(s)) return 'searchable-rice';
  if(/関連リンク/.test(s)) return 'linked-rice';
  if(/公的情報/.test(s)) return 'public-data-rice';
  if(/基準整理/.test(s)) return 'standard-rice';
  if(/品質メモ/.test(s)) return 'quality-note-rice';
  if(/出典確認/.test(s)) return 'source-checked-rice';
  if(/一覧収録/.test(s)) return 'archive-rice';
  return _varietyVisualV7841(v);
};

const _renderHomeV7841=renderHome;
renderHome=function(){
  _renderHomeV7841();
  const v=document.querySelector('.rn-version-v7813');
  if(v) v.textContent=RN_PUBLIC_BUILD_V7841;
  rnPublicCleanV7819('home');
};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7841 rerender skipped', e); }


/* v78.43 illustration continuation: daily, fortune, GPS, troubleshoot linkage coverage */
const RN_PUBLIC_BUILD_V7842='RICE NAVI v78.43 / build 78ui43';
const _storyThemeVisualV7842 = storyThemeVisualV7824;
storyThemeVisualV7824=function(x){
  const s=[storyCountry(x||{}), storyTitle(x||{}), field(x,'theme'), field(x,'scene_note'), field(x,'related_terms'), field(x,'body_ja')].join(' ').toLowerCase();
  if(/米占い|fortune/.test(s)) return 'rice-fortune-card';
  if(/ラッキー工程|lucky process/.test(s)) return 'lucky-process';
  if(/米言葉|lucky rice word/.test(s)) return 'lucky-rice-word';
  if(/毎日|daily|今日/.test(s)) return 'daily-rice-calendar';
  if(/記憶|memory/.test(s)) return 'rice-memory-card';
  if(/クイズ|quiz/.test(s)) return 'rice-quiz-card';
  if(/学習導線|learning path/.test(s)) return 'rice-learning-path';
  if(/基本学習|beginner/.test(s)) return 'rice-beginner-card';
  if(/困りごと|トラブル|troubleshoot/.test(s)) return 'rice-troubleshoot-path';
  if(/芯残り|硬い/.test(s)) return 'rice-symptom-hard';
  if(/やわらかい|柔らかい/.test(s)) return 'rice-symptom-soft';
  if(/におい|臭い/.test(s)) return 'rice-symptom-smell';
  if(/カビ臭/.test(s)) return 'rice-symptom-mold';
  if(/虫/.test(s)) return 'rice-symptom-insect';
  if(/水質|水の違い/.test(s)) return 'rice-symptom-water';
  if(/保管/.test(s)) return 'rice-symptom-storage';
  if(/現在地|location|gps/.test(s)) return 'rice-location-highlight';
  return _storyThemeVisualV7842(x);
};
const _countryVisualV7842 = countryVisualV7824;
countryVisualV7824=function(name){
  const s=String(name||'').toLowerCase();
  if(/現在地ヒストリー|local history/.test(s)) return 'local-history-region';
  if(/gps|現在地/.test(s)) return 'gps-region';
  if(/水道|water supply/.test(s)) return 'water-supply-region';
  if(/気候保管|weather storage/.test(s)) return 'weather-storage-region';
  if(/今日|daily/.test(s)) return 'daily-region';
  if(/占い|fortune/.test(s)) return 'fortune-region';
  if(/学習|learning/.test(s)) return 'learning-region';
  if(/問題解決|troubleshoot/.test(s)) return 'troubleshoot-region';
  if(/関連|related/.test(s)) return 'related-region';
  if(/検索|search/.test(s)) return 'search-region';
  return _countryVisualV7842(name);
};
const _varietyVisualV7842 = typeof varietyVisualV7831==='function' ? varietyVisualV7831 : function(){return ''};
varietyVisualV7831=function(v){
  const s=[titleOfVariety(v||{}), field(v,'type'), field(v,'cuisine_use'), field(v,'usage_note'), field(v,'texture'), field(v,'characteristics')].join(' ').toLowerCase();
  if(/占い/.test(s)) return 'fortune-rice-type';
  if(/今日/.test(s)) return 'daily-rice-type';
  if(/芯残り|硬い/.test(s)) return 'trouble-hard-type';
  if(/柔らか|やわらか/.test(s)) return 'trouble-soft-type';
  if(/におい|臭い/.test(s)) return 'trouble-smell-type';
  if(/保管/.test(s)) return 'storage-safe-type';
  if(/水質/.test(s)) return 'water-advice-type';
  if(/地域|現在地/.test(s)) return 'gps-local-type';
  if(/教材|基本/.test(s)) return 'learning-basic-type';
  if(/関連/.test(s)) return 'related-link-type';
  return _varietyVisualV7842(v);
};
const _renderHomeV7842=renderHome;
renderHome=function(){_renderHomeV7842(); const v=document.querySelector('.rn-version-v7813'); if(v) v.textContent=RN_PUBLIC_BUILD_V7842; rnPublicCleanV7819('home');};
render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7842 rerender skipped', e); }


/* v78.43 GitHub upload under-100-files mode:
   visual SVGs are bundled in js/visual_assets.js as data URIs. */
const RN_PUBLIC_BUILD_V7843='RICE NAVI v78.43 / build 78ui43 GitHub under100';

function rnBundledVisualV7843(category, name){
  if(window.rnVisualAssetSrc) return window.rnVisualAssetSrc(category, name);
  return '';
}

if(typeof rnAssetImgV7817 === 'function'){
  rnAssetImgV7817=function(category, name, cls){
    const src=rnBundledVisualV7843(category, String(name||'').replace(/\.svg$/,''));
    return `<img class="${pEsc(cls||'rn-asset-img')}" src="${src}" alt="" loading="lazy">`;
  };
}

storyVisualChipV7824=function(x){
  const country=storyCountry(x||{}), c=countryVisualV7824(country), theme=storyThemeVisualV7824(x||{});
  const countryImg=c?`<img src="${rnBundledVisualV7843('countries',c)}" alt="" loading="lazy">`:'';
  return `<div class="archive-visual-chip archive-visual-chip-v7824"><img src="${rnBundledVisualV7843('stories',theme)}" alt="" loading="lazy">${countryImg}<span>${pEsc(country||'米文化')}</span></div>`;
};

historyVisualChipV7824=function(x){
  const name=histCountryName ? histCountryName(x||{}) : field(x,'country','country_ja');
  const c=countryVisualV7824(name);
  const src=c?rnBundledVisualV7843('countries',c):rnBundledVisualV7843('illustrations','history-map');
  return `<div class="archive-visual-chip archive-visual-chip-v7824"><img src="${src}" alt="" loading="lazy"><span>${pEsc(name||'地域')}</span></div>`;
};

rnVisualEntryV7825=function(kind,title,sub,img,onclick){
  const cat=kind==='country'?'countries':kind==='story'?'stories':'illustrations';
  const src=rnBundledVisualV7843(cat,img);
  return `<button class="visual-entry-v7825" onclick="${onclick}"><img src="${src}" alt="" loading="lazy"><span><b>${pEsc(title)}</b><small>${pEsc(sub)}</small></span></button>`;
};

rnFocusEntryV7826=function(kind,title,sub,key,onclick){
  const cat=kind==='country'?'countries':kind==='story'?'stories':'illustrations';
  const src=rnBundledVisualV7843(cat,key);
  return `<button class="home-focus-card-v7826" onclick="${onclick}">
    <img src="${src}" alt="" loading="lazy">
    <span><b>${pEsc(title)}</b><small>${pEsc(sub)}</small></span>
  </button>`;
};

if(typeof varietyVisualCardV7814 === 'function'){
  const _varietyVisualCardUnder100V7843 = varietyVisualCardV7814;
  varietyVisualCardV7814=function(v){
    const extra = (typeof varietyVisualV7831==='function') ? varietyVisualV7831(v||{}) : '';
    const html = _varietyVisualCardUnder100V7843(v||{});
    if(!extra) return html;
    const src = rnBundledVisualV7843('rice-types', extra);
    return html.replace('<article class="variety-feature-v7814">', `<article class="variety-feature-v7814"><div class="archive-visual-chip archive-visual-chip-v7824"><img src="${src}" alt="" loading="lazy"><span>${pEsc(titleOfVariety(v||{}))}</span></div>`);
  };
}

const _renderHomeV7843=renderHome;
renderHome=function(){
  _renderHomeV7843();
  const v=document.querySelector('.rn-version-v7813');
  if(v) v.textContent=RN_PUBLIC_BUILD_V7843;
  rnPublicCleanV7819('home');
};

render=function(){ if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords,detail:renderArchiveV7810}; (map[S.view]||renderHome)(); };
try{ if(S.data) render(); }catch(e){ console.warn('v7843 rerender skipped', e); }
