const S={data:null,view:'home',lang:'ja',filters:{}};
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

/* v41 illustrated: real SVG asset helpers. No generic artwork replacement. */
const RN_ILLUST_VERSION = 'v41u100';
function rnAsset(path){ return String(path||'') + '?v=' + RN_ILLUST_VERSION; }
const RN_ICON_MAP = {
  guide:'learn', fortune:'stories', grain:'words', rice:'rice-type', doc:'literature',
  storage:'storage', future:'future', check:'check', water:'water', weather:'storage',
  ranking:'ranking', home:'home', country:'country', history:'history', words:'words',
  varieties:'varieties', learn:'learn', literature:'literature'
};
function rnIconAsset(kind){
  const name = RN_ICON_MAP[kind] || kind || 'rice-type';
  return rnAsset('assets/ui-icons/' + name + '.svg');
}
function rnSvgImg(path, cls, alt){
  const clean = String(path||'').replace(/^assets\//,'').replace(/\.svg(?:\?.*)?$/,'');
  const parts = clean.split('/');
  const category = parts[0] || '';
  const name = parts.slice(1).join('/') || '';
  const svg = (window.rnSvgMarkup ? window.rnSvgMarkup(category, name) : '');
  if(svg) return `<span class="${esc(cls||'rn-svg')} rn-svg-inline" aria-label="${esc(alt||'')}">${svg}</span>`;
  return `<span class="${esc(cls||'rn-svg')} rn-svg-missing">画像未設定: ${esc(category+'/'+name)}</span>`;
}
function rnIllustration(name, cls, alt){ return rnSvgImg('assets/illustrations/' + name + '.svg', cls||'rn-visual', alt||name); }
function rnStoryArt(name, cls, alt){ return rnSvgImg('assets/stories/' + name + '.svg', cls||'rn-visual', alt||name); }
function rnCountryArt(name, cls, alt){ return rnSvgImg('assets/countries/' + name + '.svg', cls||'rn-visual', alt||name); }
function rnRiceTypeArt(name, cls, alt){ return rnSvgImg('assets/rice-types/' + name + '.svg', cls||'rn-visual', alt||name); }
function storyVisualNameV41i(x){
  const s = [field(x,'title'), field(x,'theme'), field(x,'country_area'), field(x,'related_terms'), field(x,'texture_keywords')].join(' ').toLowerCase();
  if(/台湾|q弾|taiwan/.test(s)) return 'taiwan-q-texture';
  if(/日本|白飯|japan|gohan/.test(s)) return 'gohan-set-meal';
  if(/タイ|ジャスミン|thai|jasmine|香り/.test(s)) return 'jasmine-rice';
  if(/韓国|ビビンバ|korea|bibimbap/.test(s)) return 'bibimbap';
  if(/インド|ビリヤニ|india|biriyani|biryani|basmati/.test(s)) return 'biriyani';
  if(/イタリア|リゾット|italy|risotto/.test(s)) return 'risotto';
  if(/スペイン|パエリア|spain|paella/.test(s)) return 'paella';
  if(/中国|粥|china|congee/.test(s)) return 'congee';
  if(/ベトナム|vietnam|com|cơm|banh|bánh/.test(s)) return 'com-tam';
  if(/フィリピン|philippines|bibingka/.test(s)) return 'bibingka';
  if(/もち|mochi/.test(s)) return 'festival-mochi';
  if(/炒飯|fried/.test(s)) return 'fried-rice';
  if(/弁当|bento/.test(s)) return 'bento-rice';
  if(/カレー|curry/.test(s)) return 'curry-rice';
  if(/長粒|aroma|long|香り/.test(s)) return 'aroma-rice';
  return 'rice-culture-bowl';
}
function countryVisualNameV41i(name){
  const m = {'台湾':'taiwan','日本':'japan','タイ':'thailand','中国':'china','韓国':'korea','インド':'india','ベトナム':'vietnam','フィリピン':'philippines','インドネシア':'indonesia','アメリカ':'usa','米国':'usa','イタリア':'italy','スペイン':'spain','フランス':'france','ブラジル':'brazil','エジプト':'egypt','トルコ':'turkey','バングラデシュ':'bangladesh','カンボジア':'cambodia'};
  return m[String(name||'').trim()] || 'gps-region';
}
function varietyVisualNameV41i(v){
  const s = [titleOfVariety(v||{}), countryOfVariety(v||{}), field(v,'rice_type'), field(v,'grain_shape'), field(v,'main_uses'), field(v,'texture_tags'), field(v,'aroma')].join(' ').toLowerCase();
  if(/basmati|バスマティ/.test(s)) return 'basmati-type';
  if(/jasmine|ジャスミン|香り/.test(s)) return 'jasmine-type';
  if(/もち|glutinous/.test(s)) return 'glutinous-rice';
  if(/黒|black/.test(s)) return 'black-rice';
  if(/brown|玄米/.test(s)) return 'brown-rice';
  if(/長粒|long|indica|インディカ/.test(s)) return 'core-long-grain';
  if(/短粒|short|japonica|ジャポニカ|稉/.test(s)) return 'core-short-grain';
  if(/弁当|bento/.test(s)) return 'bento-rice';
  if(/炒飯|fried/.test(s)) return 'fried-rice-type';
  if(/カレー|curry/.test(s)) return 'curry-rice-type';
  return 'archive-rice';
}

function illust(kind){
  const name = RN_ICON_MAP[kind] || kind || 'rice-type';
  const svg = (window.rnSvgMarkup ? window.rnSvgMarkup('ui-icons', name) : '');
  if(svg) return `<span class="illust ${esc(kind)} real-illust rn-svg-inline">${svg}</span>`;
  return `<span class="illust ${esc(kind)} real-illust rn-svg-missing">!</span>`;
}
function literatureScore(x){let s=0;const c=classifyEvidence(x); if(c==='A')s+=10;if(c==='B')s+=6;if(has(x.condition))s+=4;if(has(x.summary)&&!same(x.summary,x.title))s+=3;if(has(x.source_ids))s+=2;if(has(x.claim_ids))s+=2;return s;}
function litCards(){return (S.data?.literature?.cards||[]).map(x=>({...x,_class:classifyEvidence(x)}));}
function litSorted(){return [...litCards()].sort((a,b)=>literatureScore(b)-literatureScore(a)||String(a.id||'').localeCompare(String(b.id||'')));}
function titleOfVariety(v){return field(v,'app_title_ja_v1_7','display_name_ja','name_ja','variety_name_ja','variety_name','local_name','name')||'品種名未確認';}
function countryOfVariety(v){return field(v,'country_ja','origin_country_ja','main_production_regions','country')||'国・地域未確認';}
function termName(x){return tx(x,'term')||tx(x,'title')||field(x,'term_ja')||'用語未確認';}
function termNote(x){const note=tx(x,'note');if(!note||/工程カード用の統一訳語|Preferred term|工程卡統一用語|工序卡统一用语/.test(note))return '炊飯工程や米の状態を確認するときに使う基本用語です。関連する教材・文献と合わせて確認します。';return note;}
function termPick(){const preferred=['浸漬','吸水','蒸らし','ほぐし','糊化','粘り','硬さ','水加減','べたつき','老化'];const arr=S.data?.glossary||[];for(const n of preferred){const f=arr.find(x=>x.term_ja===n);if(f)return f;}return pick(arr,'term');}

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
  if(!x) return card('今日の世界ライス物語',`${rnIllustration('daily-story-card','card-visual','世界のライス物語')}<p><b>物語データ未確認</b></p><p>世界の米文化・料理・食感・炊き方を1日1話で表示します。</p>`);
  const art = rnStoryArt(storyVisualNameV41i(x),'card-visual story-visual','世界のライス物語');
  return `<div class="card story-card visual-card">${art}<h2>今日の世界ライス物語</h2><p class="small">${esc(field(x,'day_no')||'')}日目 / ${esc(storyCountry(x))} / ${esc(field(x,'region')||'')}</p><h3>${esc(storyTitle(x))}</h3><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,open?2000:520)).split('\\n').join('<br>')}</p><details ${open?'open':''}><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(x,'learning_point')||'未確認')}</p><p><b>食感：</b>${esc(field(x,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(x,'cooking_note')||'未確認')}</p><p>${chips([field(x,'texture_keywords'),field(x,'related_terms')])}</p><p class="small">既存本文を保持し、必要に応じて関連情報を下に足していきます。</p></details><div class="priority-row">${btn('future','物語一覧へ')}${btn('varieties','品種を見る')}${btn('words','米辞典へ')}</div></div>`;
}

function countryHistoryCard(){
  const art = rnIllustration('country-history-card','card-visual','現在地のお米ヒストリー');
  return `<div class="card visual-card">${art}<h2>現在地のお米ヒストリー</h2><p><b>GPSで現在地の国を1日1回だけ確認し、その国のお米の歴史・文化・料理・品種へつなげる機能です。</b></p><p>表示単位は市区町村ではなく国単位です。緯度経度を見せる機能ではなく、国判定を米文化の入口に変換します。</p><details open><summary>位置情報の扱い</summary><p>常時取得は行いません。基本は1日1回、最後に取得した国をその日の参考国として使います。</p><p class="warn">GPSは水質、庫内湿度、米の品質、保管状態を測定するものではありません。</p></details><p class="small">国別ヒストリーマスター取り込み後、国の米文化・代表料理・品種・ランキング・文献へ接続します。未収録国は準備中と表示します。</p>${btn('future','物語・未来へ')}</div>`;
}

function riceWeatherConceptCard(){
  return card('今日の米天気',`<p><b>天気予報ではなく、気象条件を米管理の注意へ変換します。</b></p><p><b>保管注意：</b>高湿度の日は米袋周辺、壁際、床、納米庫内壁、残米・付着米を確認します。</p><p><b>結露注意：</b>外気と庫内・室内の温度差が大きい日は、水滴、濡れた付着米、カビ臭、虫、変色を先に見ます。</p><p><b>炊飯確認：</b>吸水状態、べたつき、粒立ち、冷めた後の食感を確認します。</p><p class="warn">地域・天気は補助情報です。GPSだけでは水質や庫内状態は分かりません。</p>${btn('check','チェックへ')}`);
}
function todayPriorityCard(){
  const story=todayStory(), term=termPick();
  return card('今日見る3つ',`<ol class="focus-list"><li><b>米管理：</b>保管注意・結露注意を先に確認</li><li><b>世界の米文化：</b>${esc(storyTitle(story||{}))}</li><li><b>今日の米言葉：</b>${esc(termName(term))}</li></ol><p class="small">毎日変わる入口から、品種・文献・水・納米庫・物語へ進みます。</p>`);
}

function switchView(v){S.view=v;document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));const el=$('#'+v);if(el)el.classList.add('active');document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));render();window.scrollTo({top:0,behavior:'smooth'});}
async function load(){const res=await fetch('data/rice_navi_data_v41.json?v=41u100');S.data=await res.json();document.querySelectorAll('.bottomnav button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));$('#lang').onchange=e=>{S.lang=e.target.value;render()};render();}
function render(){if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords}; (map[S.view]||renderHome)();}
function setFilter(k,v,view){S.filters[k]=v;if(view)switchView(view);else render();}

function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), learn=pick(d.learning_multilingual||d.learning_cards,'learn'), lit=litSorted()[0], term=termPick(), future=pick(d.future_rice,'future'), story=todayStory();
 const fortune=['吸水運','粒立ち運','ふっくら運','温度管理運','水加減運','蒸らし運','保管注意運'][todayIndex(7,'fortune')];
 $('#home').innerHTML=`<div class="hero hero-home"><div><h1>RICE NAVI</h1><p>お米の知恵を、今日の一杯へ。米・炊飯・水・保管を、初めてでも迷いにくいカードで確認します。</p></div><div class="hero-visual real-hero-visual">${rnIllustration('daily-riceword-card','hero-inline-visual','')}</div></div>
 <div class="first-guide"><div>${illust('guide')}</div><div><b>初めての方へ</b><p>まずは「今日見る3つ」だけ見れば大丈夫です。詳しく知りたい時だけ、文献・図鑑・チェックへ進みます。</p></div></div>
 <div class="today-strip"><button onclick="switchView('home')">米占い<span>${esc(fortune)}</span></button><button onclick="switchView('check')">米天気<span>保管・結露注意</span></button><button onclick="switchView('future')">世界ライス<span>毎日1話</span></button></div>
 <div class="grid home-grid">
 ${todayPriorityCard()}
 ${card('今日の米占い',`${illust('fortune')}<p><b>${fortune}</b></p><p>今日は「${esc(termName(term))}」を入口に、米粒の状態と工程を見ます。</p><p><b>ラッキー米種：</b>${esc(titleOfVariety(variety||{}))}</p><p><b>ラッキー工程：</b>${esc(lc(learn,'title')||'浸漬・吸水')}</p><p><b>関連文献：</b>${esc(field(lit,'title')||'文献カード未確認')}</p><div class="priority-row">${btn('varieties','品種を見る')}${btn('learn','教材を見る')}${btn('literature','文献を見る')}</div>`)}
 ${riceWeatherConceptCard()}
 ${card('今日の米言葉',`${illust('grain')}<p><b>${esc(termName(term))}</b></p><p>${esc(termNote(term))}</p><p><b>今日の見方：</b>用語→教材→文献→現場確認の順で見る。</p>${btn('words','米辞典へ')}`)}
 ${card('今日のお米',`${illust('rice')}<p><b>${esc(titleOfVariety(variety||{}))}</b></p><p>${esc(countryOfVariety(variety||{}))} / ${esc(field(variety,'rice_type','grain_shape')||'種類未確認')}</p><p><b>アミロース：</b>${esc(field(variety,'amylose_range','amylose_value','amylose_class')||'未確認')}</p><p><b>たんぱく質：</b>${esc(field(variety,'protein_range','protein_value','protein_class')||'未確認')}</p><p><b>用途：</b>${esc(field(variety,'main_uses','business_uses')||'未確認')}</p>${btn('varieties','米品種図鑑へ')}`)}
 ${storyCard(story,false)}
 ${countryHistoryCard()}
 ${card('炊飯文献ライブラリ',`${illust('doc')}<p><b>${esc(field(lit,'title')||'文献カード')}</b></p><p>${esc(field(lit,'summary')&&!same(lit.summary,lit.title)?lit.summary:'文献要点、条件、出典、確認ポイントを確認します。')}</p><p>${sourceBadge('炊飯文献',counts.literature_cards_v74)} ${sourceBadge('現場メモ',counts.field_notes_v74)}</p><p>${chips([evidenceLabel(lit?._class)])}</p><p class="small">※確認状況は文献の優劣ではなく、RICE NAVI内での整理状態です。</p>${btn('literature','文献を見る')}`)}
 ${card('温度×時間マップ',`<p><b>浸漬・昇温・沸騰・蒸らし・ほぐし</b></p><p>トラブルを工程の流れで確認します。</p>${btn('learn','温度×時間を見る')}`)}
 ${card('納米庫管理',`${illust('storage')}<p><b>結露・湿度・温度差・残米・カビ臭・虫・変色</b></p><p>点検リストだけでなく、危険サインと根拠を見ます。</p>${btn('check','チェックへ')}`)}
 ${card('お米の未来',`${illust('future')}<p><b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b></p><p>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}</p>${btn('future','未来50を見る')}`)}
 </div>
 <details class="data-check"><summary>収録データ数を確認する</summary><div class="countbar">${stat(counts.literature_cards_v74,'炊飯文献','文献ライブラリ')}${stat(counts.field_notes_v74,'現場メモ','文献とは別枠')}${stat(counts.learning_cards_v82,'教材カード','お米マイスター')}${stat(counts.rice_varieties,'米品種','図鑑')}${stat(counts.glossary_terms,'米辞典','用語')}${stat(counts.future_rice,'お米の未来','未来テーマ')}${stat(counts.world_rice_stories,'世界のライス物語','365話')}${stat(counts.water_rules,'水質ルール','水の相性')}${stat(counts.mold_rules,'納米庫ルール','保管管理')}${stat(counts.ranking_definitions,'ランキング','世界の米')}</div></details>`;
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
 $('#learn').innerHTML=`<div class="hero"><h1>お米マイスター / 学ぶ</h1><p>82件の教材カードを、初級・中級・上級、関連用語、関連文献へつなげます。</p></div>${tempMapHTML()}
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
 $('#literature').innerHTML=`<div class="hero"><h1>炊飯文献ライブラリ</h1><p>文献の価値をランク付けするのではなく、RICE NAVI内での確認・整理状況、条件、根拠、出典を分かりやすく表示します。現場メモは文献と分けます。</p></div>
 <div class="countbar">${stat(classCounts.A,'原文確認済み候補','確認状態')}${stat(classCounts.B,'要約整理済み','確認状態')}${stat(classCounts.C,'確認中','再確認対象')}${stat(notes.length,'現場メモ','文献と分離')}</div>
 <div class="toolbar"><input placeholder="文献検索" value="${esc(q)}" oninput="setFilter('litq',this.value)"><select onchange="setFilter('litcat',this.value)"><option value="">全カテゴリ</option>${categories.map(c=>`<option ${c===cat?'selected':''}>${esc(c)}</option>`).join('')}</select><select aria-label="根拠確認ステータス" onchange="setFilter('evidence',this.value)"><option value="AB" ${ev==='AB'?'selected':''}>確認済み中心</option><option value="A" ${ev==='A'?'selected':''}>原文確認済み候補</option><option value="B" ${ev==='B'?'selected':''}>要約整理済み</option><option value="C" ${ev==='C'?'selected':''}>確認中</option><option value="ALL" ${ev==='ALL'?'selected':''}>全件</option></select></div>
 <div class="section-title"><h2>カテゴリ入口</h2></div><div class="priority-row">${categoryTop.map(([k,n])=>`<button onclick="S.filters.litcat='${esc(k)}';S.filters.litq='';renderLiterature()">${esc(k)} ${n}</button>`).join('')}<button onclick="S.filters.litcat='';S.filters.litq='';S.filters.evidence='AB';renderLiterature()">解除</button></div>
 <div class="priority-row">${['浸漬','吸水','糊化','蒸らし','老化','水質','pH','硬さ','べたつき','衛生','温度','保管','結露'].map(k=>`<button onclick="setFilter('litq','${k}')">${k}</button>`).join('')}</div>
 <div class="data-note"><b>注意：</b>この区分は文献の優劣ではなく、RICE NAVI内での確認・整理状況を示します。出典IDだけで確定扱いにせず、要点・条件・出典の有無を確認します。現場メモは文献と分けて表示します。</div>
 <div class="list">${filtered.slice(0,180).map(x=>{const cls=x._class;const summary=field(x,'summary');return `<div class="item evidence${cls}"><h3>${esc(field(x,'title')||'文献名未確認')}</h3><p>${chips([x.category,evidenceLabel(cls),traceText(x.status),traceText(x.decision)])}</p><p class="small">${esc(statusInfo(cls))}</p>${summary&&!same(summary,x.title)?`<p><b>文献要点：</b>${esc(summary)}</p>`:`<p><b>文献要点：</b>未確認</p>`}<p><b>条件・数値：</b>${esc(field(x,'condition')||'未確認')}</p><details><summary>根拠・出典・確認ポイント</summary><p><b>確認ポイント：</b>${esc(field(x,'trace')?traceText(x.trace):'未確認')}</p>${claimDetails(field(x,'claim_ids'))}<div class="source">カードID：${esc(field(x,'id')||'未確認')} / 根拠番号：${esc(field(x,'claim_ids')||'未確認')}</div>${sourceDetails(field(x,'source_ids'))}</details><div class="priority-row"><button class="btn secondary" onclick="S.filters.learn='${esc((x.category||x.title||'').split(/[・/ ]/)[0])}';switchView('learn')">関連教材を探す</button><button class="btn secondary" onclick="S.filters.wordq='${esc((x.category||x.title||'').split(/[・/ ]/)[0])}';switchView('words')">米辞典で見る</button></div></div>`}).join('')}</div>
 <details class="field-note"><summary>現場メモを別枠で見る</summary><p class="small">現場メモは文献カードではありません。文献根拠と混ぜずに表示します。</p><div class="list">${notes.slice(0,120).map(n=>`<div class="item field-item"><h3>${esc(field(n,'title')||'メモ名未確認')}</h3><p>${chips([n.category,traceText(n.decision),'文献とは分離'])}</p><p>${esc(field(n,'summary')||'')}</p><p><b>扱い：</b>${esc(field(n,'condition')||'未確認')}</p><p><b>次の確認：</b>${esc(field(n,'next_action')||'未確認')}</p></div>`).join('')}</div></details>`;
}

function renderVarieties(){
 const data=S.data.rice_varieties||[]; const q=S.filters.varq||'', country=S.filters.country||'', use=S.filters.use||'', texture=S.filters.texture||'', amy=S.filters.amy||'', protein=S.filters.protein||'';
 const countries=[...new Set(data.map(countryOfVariety))].filter(has).sort();
 const uses=[...new Set(data.map(x=>field(x,'use_category_primary','main_uses')).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(norm).filter(x=>x&&x!=='未確認'))].slice(0,80).sort();
 const textures=[...new Set(data.map(x=>field(x,'texture_tags','aroma','rice_type')).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(norm).filter(x=>x&&x!=='未確認'))].slice(0,80).sort();
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||countryOfVariety(x)===country)&&(!use||String(field(x,'use_category_primary','main_uses')).includes(use))&&(!texture||String(field(x,'texture_tags','aroma','rice_type')).includes(texture))&&(!amy||String(field(x,'amylose_class','amylose_range','amylose_value')).includes(amy))&&(!protein||String(field(x,'protein_class','protein_range','protein_value')).includes(protein)));
 const countryTop=[...new Map(countries.map(c=>[c,data.filter(x=>countryOfVariety(x)===c).length]).sort((a,b)=>b[1]-a[1]).slice(0,12))];
 $('#varieties').innerHTML=`<div class="hero"><h1>米品種図鑑</h1><p>250件を国別・用途別・食感別・アミロース・たんぱく質で確認します。</p></div>
 <div class="section-title"><h2>国・地域別入口</h2></div><div class="priority-row">${countryTop.map(([c,n])=>`<button onclick="S.filters.country='${esc(c)}';renderVarieties()">${esc(c)} ${n}</button>`).join('')}</div>
 <div class="toolbar"><input placeholder="品種検索" value="${esc(q)}" oninput="setFilter('varq',this.value)"><select onchange="setFilter('country',this.value)"><option value="">全ての国・地域</option>${countries.map(c=>`<option ${c===country?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('use',this.value)"><option value="">全用途</option>${uses.slice(0,50).map(c=>`<option ${c===use?'selected':''}>${esc(c)}</option>`).join('')}</select><select onchange="setFilter('texture',this.value)"><option value="">全食感・特徴</option>${textures.slice(0,50).map(c=>`<option ${c===texture?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="priority-row"><button onclick="setFilter('country','日本')">日本</button><button onclick="setFilter('country','台湾')">台湾</button><button onclick="setFilter('country','タイ')">タイ</button><button onclick="setFilter('amy','低')">低アミロース</button><button onclick="setFilter('amy','高')">高アミロース</button><button onclick="setFilter('protein','高')">高たんぱく質</button><button onclick="S.filters.country='';S.filters.use='';S.filters.texture='';S.filters.amy='';S.filters.protein='';renderVarieties()">絞込解除</button></div>
 <div class="countbar">${stat(filtered.length,'表示中の品種')}${stat(data.length,'品種総数')}${stat(countries.length,'国・地域')}${stat(uses.length,'用途分類候補')}</div>
 <div class="list">${filtered.slice(0,250).map(v=>`<div class="item"><h3>${esc(titleOfVariety(v))}</h3><p>${chips([countryOfVariety(v),field(v,'rice_type'),field(v,'grain_shape'),field(v,'texture_tags')])}</p><p><b>アミロース：</b>${esc(field(v,'amylose_range','amylose_value','amylose_class')||'未確認')}　<b>たんぱく質：</b>${esc(field(v,'protein_range','protein_value','protein_class')||'未確認')}</p><p><b>用途：</b>${esc(field(v,'main_uses','business_uses','use_category_primary')||'未確認')}</p><p><b>炊飯メモ：</b>${esc(field(v,'cooking_points','app_detail_note_ja_v1_6','safe_app_note_ja_v1_4')||'未確認')}</p><details><summary>詳細・出典</summary><p><b>原産・生産：</b>${esc(field(v,'main_production_regions','origin_country_ja')||'未確認')}</p><p><b>消費市場：</b>${esc(field(v,'main_consumption_markets')||'未確認')}</p><p><b>食感：</b>${esc(field(v,'texture_tags')||'未確認')}</p><p><b>出典確認：</b>${esc(field(v,'source_confidence','source_type')||'未確認')}</p><p><b>未確認項目：</b>${esc(field(v,'unverified_fields')||'未確認')}</p><div class="source">出典ID：${esc(field(v,'source_ids')||'未確認')}<br>${esc(field(v,'source_urls')||'URL未確認')}</div></details><button class="btn secondary" onclick="S.filters.litq='${esc(field(v,'related_terms','rice_type','display_name_ja'))}';switchView('literature')">関連文献を探す</button></div>`).join('')}</div>`;
}

function renderCheck(){
 const w=S.data.water||{}, sm=S.data.storage_mold||{}, raw=sm.raw||{}; const checklist=raw.checklist||sm.checklist||[], rules=raw.rules||sm.rules||[], claims=raw.claims||sm.claims||[], sources=raw.sources||sm.sources||[], region=(w.regions||[])[0]||{};
 const coreKeys=['結露','湿度','温度','残米','付着','カビ臭','虫','変色','清掃'];
 const coreClaims=coreKeys.map(k=>claims.find(c=>String(c.theme||c.claim_ja||'').includes(k))).filter(Boolean);
 $('#check').innerHTML=`<div class="hero"><h1>チェック</h1><p>GPS・天気・水質・保管情報を、そのまま出すのではなく、米の確認順に変換して表示します。</p></div>
 <div class="split">
 ${card('水の相性チェック',`<p><b>GPSは水質を測定しません。</b></p><p>pH、硬度、TDS、残留塩素は公開値または手入力値の参考です。建物配管、貯水槽、フィルターで実水は変わります。</p><p>地域参考値：${esc(field(region,'area_name_ja')||'準備中')} / 硬度：${esc(field(region,'total_hardness_mgL_CaCO3')||'未確認')} / pH：${esc(field(region,'pH')||'未確認')}</p><div class="mini-grid"><span><b>pH</b><br>酸性・中性・アルカリ性の目安</span><span><b>硬度</b><br>カルシウム・マグネシウム量の目安</span><span><b>TDS</b><br>水に溶けた物質量の目安</span><span><b>残留塩素</b><br>におい・味への影響確認</span></div><details open><summary>見る順番</summary><p>1. 公式水質値または検査値を確認</p><p>2. 建物側の貯水槽・配管・フィルターを確認</p><p>3. 炊飯結果の硬さ・粘り・においと照合</p><p>4. 水だけで結論にせず、米・浸漬・加熱条件と合わせて見る</p></details>`,`<p class="small">水質ルール ${(w.quality_rules||[]).length}件 / 水質根拠 ${(w.claims||[]).length}件</p>`)}
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
 $('#future').innerHTML=`<div class="hero"><h1>物語・未来</h1><p>世界のライス物語は毎日1話。既存本文を活かし、文化背景・料理例・炊飯視点・関連リンクを足して、品種・文献・ランキングへつなげます。</p></div>
 <div class="grid">${storyCard(story,true)}${countryHistoryCard()}${card('GPS・天気情報の扱い',`<p><b>GPSは国判定の入口、天気は米管理アラートの補助です。</b></p><p>GPSで水質、庫内湿度、米の品質を測定しているわけではありません。天気情報は、保管注意・結露注意・吸水や炊飯確認ポイントへ変換して表示します。</p><p class="small">常時取得ではなく、現在地のお米ヒストリーでは1日1回の国判定を基本にします。</p>`)}</div>
 <div class="section-title"><h2>世界のライス物語 365</h2></div>
 <div class="toolbar"><input placeholder="物語検索" value="${esc(storyQ)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">全ての国・地域</option>${storyCountries.map(c=>`<option ${c===storyCountryFilter?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="countbar">${stat(storyFiltered.length,'表示中の物語')}${stat(stories.length,'物語総数')}${stat(storyCountries.length,'国・地域')}</div>
 <div class="list">${storyFiltered.slice(0,80).map(x=>`<div class="item story-item visual-item">${rnStoryArt(storyVisualNameV41i(x),'item-visual','世界のライス物語')}<h3>${esc(storyTitle(x))}</h3><p>${chips([field(x,'day_no')+'日目',storyCountry(x),field(x,'region'),field(x,'theme')])}</p><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,360)).split('\n').join('<br>')}</p><details><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(x,'learning_point')||'未確認')}</p><p><b>好み・文化：</b>${esc(field(x,'preference_viewpoint')||'未確認')}</p><p><b>料理場面：</b>${esc(field(x,'scene_note')||'未確認')}</p><p><b>食感：</b>${esc(field(x,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(x,'cooking_note')||'未確認')}</p><p>${chips([field(x,'texture_keywords'),field(x,'related_terms'),field(x,'related_card_search')])}</p></details></div>`).join('')}</div>
 <div class="section-title"><h2>お米の未来50</h2></div><div class="toolbar"><input placeholder="未来テーマ検索" value="${esc(q)}" oninput="setFilter('future',this.value)"><select onchange="setFilter('futureCat',this.value)"><option value="">全カテゴリ</option>${cats.map(c=>`<option ${c===cat?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(filtered.length,'表示中')}${stat(data.length,'未来テーマ総数')}${stat(cats.length,'カテゴリ')}</div>
 <div class="list">${filtered.map(x=>`<div class="item"><h3>${esc(tx(x,'title')||field(x,'title_ja','title')||'未来テーマ')}</h3><p>${chips([x.category,x.source_type])}</p><p><b>${esc(tx(x,'subtitle')||field(x,'subtitle_ja')||'')}</b></p><p>${esc(tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||'本文未確認')}</p><details><summary>関連・出典</summary><p><b>関連：</b>文献、米品種、世界ランキング、水、保管、物語へ接続予定</p><div class="source">${esc(field(x,'source_note','source_name')||'未確認')}<br>${esc(field(x,'source_url')||'URL未確認')}</div></details></div>`).join('')}</div>`;
}
function renderRankings(){
 const defs=S.data.rankings?.rankings||[], rows=S.data.ranking_items_template||[];
 $('#rankings').innerHTML=`<div class="hero"><h1>世界の米ランキング</h1><p>順位・国・数値・単位・年・出典を表示します。順位明細が空欄の場合は未入力として表示します。</p></div><div class="list">${defs.map(def=>{const title=tx(def,'display_title')||tx(def,'ranking_name')||def.ranking_id, desc=tx(def,'short_desc')||tx(def,'value')||'', items=(def.items||[]).concat(rows.filter(x=>x.ranking_id===def.ranking_id&&has(x.country_or_item_ja)&&has(x.value)));return `<div class="item"><h3>${esc(title)}</h3><p>${esc(desc)}</p><p>${chips([def.source_name,def.unit,def.priority])}</p>${items.length?`<table><thead><tr><th>順位</th><th>国・項目</th><th>数値</th><th>年</th></tr></thead><tbody>${items.slice(0,10).map(x=>`<tr><td>${esc(x.rank)}</td><td>${esc(tx(x,'country_or_item')||field(x,'country_or_item_ja'))}</td><td>${esc(field(x,'value')||'未確認')} ${esc(field(x,'unit')||def.unit||'')}</td><td>${esc(field(x,'source_year')||'未確認')}</td></tr>`).join('')}</tbody></table>`:`<p class="rank-empty">順位データ未入力</p>`}<details><summary>出典・定義</summary><p><b>単位：</b>${esc(def.unit||'未確認')}</p><p><b>計算方法：</b>${esc(def.calculation_method||'未確認')}</p><p><b>注意：</b>${esc(tx(def,'caution')||'未確認')}</p><div class="source">${esc(def.source_name||'出典名未確認')}</div></details></div>`}).join('')}</div>`;
}
function renderWords(){
 const data=S.data.glossary||[], q=S.filters.wordq||'', preferred=['浸漬','吸水','蒸らし','ほぐし','糊化','粘り','硬さ','水加減','べたつき','老化'];
 const sorted=[...data].sort((a,b)=>{const ia=preferred.indexOf(a.term_ja), ib=preferred.indexOf(b.term_ja);return (ia<0?999:ia)-(ib<0?999:ib)||termName(a).localeCompare(termName(b),'ja');});
 const filtered=sorted.filter(x=>!q||JSON.stringify(x).includes(q));
 $('#words').innerHTML=`<div class="hero"><h1>米辞典</h1><p>米の用語を、今日の米言葉・教材・文献検索への入口として表示します。入口向きの用語を上に出します。</p></div><div class="toolbar"><input placeholder="用語検索" value="${esc(q)}" oninput="setFilter('wordq',this.value)"></div><div class="priority-row">${preferred.map(k=>`<button onclick="setFilter('wordq','${k}')">${k}</button>`).join('')}<button onclick="setFilter('wordq','')">全件</button></div><div class="list">${filtered.map(x=>`<div class="item"><h3>${esc(termName(x))}</h3><p>${esc(termNote(x))}</p><p><b>なぜ炊飯に関係するか：</b>米粒の水分、温度、粘り、硬さ、保管状態を説明するときの入口になります。</p><p><b>今日の見方：</b>この言葉を関連教材・文献・トラブル確認の検索語として使います。</p><button class="btn secondary" onclick="S.filters.litq='${esc(field(x,'term_ja'))}';switchView('literature')">関連文献を探す</button></div>`).join('')}</div>`;
}
load().catch(e=>{document.body.innerHTML='<main><div class="card empty"><h1>データ読み込みエラー</h1><p>data/rice_navi_data_v41.json が同じ場所にアップロードされているか確認してください。</p><pre>'+esc(e.stack||e)+'</pre></div></main>'});
