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
const RN_ILLUST_VERSION = 'v78m1';
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


/* v78m2 home-only replacement illustrations: soft mascot / lifestyle-culture direction. */
function homeArt(name, cls='home-custom-art', alt=''){
  const svgs={
    hero:`<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RICE NAVI home">
      <rect width="120" height="120" rx="30" fill="#fff8ee"/>
      <circle cx="32" cy="25" r="8" fill="#ffe28a" opacity=".9"/><circle cx="94" cy="28" r="6" fill="#ffc7d1" opacity=".85"/>
      <path d="M16 82c18-18 42-22 70-13 9 3 16 7 22 12" fill="none" stroke="#8b623d" stroke-width="4" stroke-linecap="round" opacity=".22"/>
      <g transform="translate(28 26)">
        <ellipse cx="31" cy="38" rx="26" ry="31" fill="#fffef8" stroke="#8b623d" stroke-width="3"/>
        <path d="M20 22c-5-12-1-19 8-18 5 6 6 12 3 19" fill="#e4f6ff" stroke="#8b623d" stroke-width="2.5"/>
        <path d="M41 23c4-11 11-15 18-9 0 8-4 13-12 16" fill="#ffeeb8" stroke="#8b623d" stroke-width="2.5"/>
        <circle cx="22" cy="39" r="2.8" fill="#5a3b25"/><circle cx="40" cy="39" r="2.8" fill="#5a3b25"/>
        <path d="M27 49c5 4 9 4 14 0" fill="none" stroke="#5a3b25" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="14" cy="47" r="5" fill="#ffb8bd" opacity=".55"/><circle cx="49" cy="47" r="5" fill="#ffb8bd" opacity=".55"/>
      </g>
      <path d="M24 90h72" stroke="#8b623d" stroke-width="3" stroke-linecap="round" opacity=".25"/>
      <g fill="#ffbf52"><path d="M91 52l3 6 6 2-6 2-3 6-3-6-6-2 6-2z"/><path d="M22 48l2 4 4 1-4 2-2 4-2-4-4-2 4-1z"/></g>
    </svg>`,
    story:`<svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="世界のライス物語">
      <defs><linearGradient id="hs_story_bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7e8"/><stop offset="1" stop-color="#e8f7ff"/></linearGradient></defs>
      <rect width="640" height="420" rx="36" fill="url(#hs_story_bg)"/>
      <path d="M38 302c95-58 209-70 318-38 79 23 151 17 246-28v142H38z" fill="#fff" opacity=".72"/>
      <g opacity=".82" stroke="#8b623d" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M64 104c48-34 90-36 128-6"/><path d="M448 112c44-32 84-34 122-6"/>
        <path d="M108 104v80M520 112v76" opacity=".3"/>
      </g>
      <g transform="translate(70 116)">
        <rect x="0" y="70" width="118" height="78" rx="18" fill="#ffefc7" stroke="#8b623d" stroke-width="4"/>
        <path d="M18 70c12-34 68-38 88 0" fill="#ffcf7d" stroke="#8b623d" stroke-width="4"/>
        <circle cx="42" cy="110" r="5" fill="#5a3b25"/><circle cx="75" cy="110" r="5" fill="#5a3b25"/><path d="M50 126c12 8 22 8 34 0" stroke="#5a3b25" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="26" cy="124" r="9" fill="#ffb8bd" opacity=".5"/><circle cx="92" cy="124" r="9" fill="#ffb8bd" opacity=".5"/>
      </g>
      <g transform="translate(240 86)">
        <ellipse cx="78" cy="126" rx="76" ry="92" fill="#fffef8" stroke="#8b623d" stroke-width="5"/>
        <path d="M38 62c-8-38 8-58 38-50 5 24 0 43-17 60" fill="#dff4ff" stroke="#8b623d" stroke-width="4"/>
        <path d="M111 64c18-31 43-39 62-16-6 25-23 38-51 40" fill="#ffe7a4" stroke="#8b623d" stroke-width="4"/>
        <circle cx="53" cy="126" r="6" fill="#5a3b25"/><circle cx="101" cy="126" r="6" fill="#5a3b25"/><path d="M63 148c18 12 31 12 49 0" stroke="#5a3b25" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="32" cy="146" r="14" fill="#ffb8bd" opacity=".5"/><circle cx="124" cy="146" r="14" fill="#ffb8bd" opacity=".5"/>
        <path d="M2 202c52 24 105 24 154 0" fill="#b9e7c6" stroke="#8b623d" stroke-width="4"/>
      </g>
      <g transform="translate(452 174)">
        <circle cx="52" cy="62" r="54" fill="#cceeff" stroke="#8b623d" stroke-width="4"/>
        <path d="M21 46c19-14 42-14 62 0" fill="none" stroke="#8b623d" stroke-width="4" stroke-linecap="round" opacity=".4"/>
        <circle cx="34" cy="64" r="5" fill="#5a3b25"/><circle cx="70" cy="64" r="5" fill="#5a3b25"/><path d="M43 80c10 7 19 7 28 0" stroke="#5a3b25" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M70 102c28 0 52-14 68-38" fill="none" stroke="#8b623d" stroke-width="5" stroke-linecap="round"/>
      </g>
      <g fill="#ffbd59"><path d="M506 72l7 13 14 4-14 5-7 13-7-13-14-5 14-4z"/><path d="M151 62l5 10 10 3-10 4-5 10-5-10-10-4 10-3z"/></g>
      <g transform="translate(56 318)"><rect width="528" height="52" rx="26" fill="#ffffff" opacity=".72"/><circle cx="36" cy="26" r="12" fill="#ffd166"/><circle cx="82" cy="26" r="12" fill="#b9e7c6"/><circle cx="128" cy="26" r="12" fill="#ffb8bd"/><path d="M176 26h294" stroke="#8b623d" stroke-width="8" stroke-linecap="round" opacity=".18"/></g>
    </svg>`,
    word:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="米言葉"><rect width="100" height="100" rx="24" fill="#fff8ee"/><path d="M21 68c14 11 44 11 58 0v12c-14 10-44 10-58 0z" fill="#ffe1a6" stroke="#8b623d" stroke-width="3"/><ellipse cx="50" cy="55" rx="31" ry="25" fill="#fffef8" stroke="#8b623d" stroke-width="3"/><circle cx="40" cy="54" r="3" fill="#5a3b25"/><circle cx="60" cy="54" r="3" fill="#5a3b25"/><path d="M44 64c5 4 8 4 13 0" stroke="#5a3b25" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M27 27h46" stroke="#8b623d" stroke-width="5" stroke-linecap="round" opacity=".2"/><path d="M31 37h38" stroke="#8b623d" stroke-width="5" stroke-linecap="round" opacity=".16"/><circle cx="22" cy="25" r="5" fill="#ffb8bd"/><circle cx="80" cy="31" r="4" fill="#ffd166"/></svg>`,
    fortune:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="米占い"><rect width="100" height="100" rx="24" fill="#fff5fb"/><path d="M50 13l7 15 16 5-16 5-7 15-7-15-16-5 16-5z" fill="#ffd166"/><ellipse cx="50" cy="62" rx="28" ry="25" fill="#fffef8" stroke="#8b623d" stroke-width="3"/><circle cx="40" cy="61" r="3" fill="#5a3b25"/><circle cx="60" cy="61" r="3" fill="#5a3b25"/><path d="M43 70c5 4 10 4 15 0" stroke="#5a3b25" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M23 78c9 9 46 10 55 0" fill="none" stroke="#8b623d" stroke-width="4" stroke-linecap="round" opacity=".28"/><circle cx="21" cy="49" r="6" fill="#b9e7c6"/><circle cx="80" cy="50" r="6" fill="#cceeff"/></svg>`,
    rice:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="今日のお米"><rect width="100" height="100" rx="24" fill="#f2fbff"/><g stroke="#8b623d" stroke-width="3"><ellipse cx="32" cy="58" rx="15" ry="27" fill="#fffef8" transform="rotate(-22 32 58)"/><ellipse cx="52" cy="50" rx="15" ry="29" fill="#fff5cf" transform="rotate(10 52 50)"/><ellipse cx="70" cy="60" rx="13" ry="25" fill="#e6f6dc" transform="rotate(24 70 60)"/></g><circle cx="47" cy="58" r="3" fill="#5a3b25"/><circle cx="60" cy="58" r="3" fill="#5a3b25"/><path d="M50 68c5 4 10 4 15 0" stroke="#5a3b25" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M18 84h64" stroke="#8b623d" stroke-width="4" stroke-linecap="round" opacity=".24"/><circle cx="24" cy="27" r="5" fill="#ffd166"/></svg>`,
    weather:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="米天気"><rect width="100" height="100" rx="24" fill="#eef9ff"/><circle cx="34" cy="32" r="13" fill="#ffd166" stroke="#8b623d" stroke-width="3"/><path d="M30 61c7-19 39-18 47 0 12 1 18 9 18 18H16c0-10 6-17 14-18z" fill="#fff" stroke="#8b623d" stroke-width="3"/><ellipse cx="49" cy="69" rx="16" ry="12" fill="#fffef8" stroke="#8b623d" stroke-width="3"/><circle cx="43" cy="69" r="2.8" fill="#5a3b25"/><circle cx="55" cy="69" r="2.8" fill="#5a3b25"/><path d="M46 76c4 3 7 3 11 0" stroke="#5a3b25" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M75 29c8 8 10 20 4 30" stroke="#64b5f6" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    future:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="お米の未来"><rect width="100" height="100" rx="24" fill="#f7fff2"/><path d="M51 82c-5-20 0-38 17-54" stroke="#55a36a" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M56 43c-20-6-27-18-21-32 18 0 29 10 31 28" fill="#b9e7c6" stroke="#8b623d" stroke-width="3"/><path d="M60 56c16-13 30-12 37-1-9 13-24 17-40 8" fill="#dff4ff" stroke="#8b623d" stroke-width="3"/><ellipse cx="43" cy="68" rx="18" ry="16" fill="#fffef8" stroke="#8b623d" stroke-width="3"/><circle cx="37" cy="68" r="2.5" fill="#5a3b25"/><circle cx="49" cy="68" r="2.5" fill="#5a3b25"/><path d="M39 76c4 3 8 3 12 0" stroke="#5a3b25" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="22" cy="27" r="5" fill="#ffd166"/></svg>`,
    country:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="現在地のお米ヒストリー"><rect width="100" height="100" rx="24" fill="#fff8ee"/><path d="M16 62c18-12 49-13 68 0v20H16z" fill="#ffe1a6" stroke="#8b623d" stroke-width="3"/><path d="M28 62V42l12-12 12 12v20M54 62V36l10-10 10 10v26" fill="#ffd7a8" stroke="#8b623d" stroke-width="3"/><ellipse cx="50" cy="70" rx="19" ry="15" fill="#fffef8" stroke="#8b623d" stroke-width="3"/><circle cx="43" cy="69" r="2.7" fill="#5a3b25"/><circle cx="57" cy="69" r="2.7" fill="#5a3b25"/><path d="M46 77c4 3 7 3 11 0" stroke="#5a3b25" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M74 18l7 13 14 4-14 4-7 13-7-13-14-4 14-4z" fill="#ffbf52"/></svg>`,
    literature:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="文献ライブラリ"><rect width="100" height="100" rx="24" fill="#f8fbff"/><rect x="20" y="25" width="47" height="56" rx="8" fill="#fff" stroke="#8b623d" stroke-width="3"/><path d="M31 39h25M31 50h25M31 61h18" stroke="#8b623d" stroke-width="4" stroke-linecap="round" opacity=".25"/><circle cx="66" cy="67" r="14" fill="#e3f4ff" stroke="#8b623d" stroke-width="3"/><path d="M77 78l10 10" stroke="#8b623d" stroke-width="5" stroke-linecap="round"/><ellipse cx="38" cy="76" rx="12" ry="10" fill="#fffef8" stroke="#8b623d" stroke-width="3"/><circle cx="34" cy="75" r="2" fill="#5a3b25"/><circle cx="42" cy="75" r="2" fill="#5a3b25"/></svg>`,
    temp:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="温度と時間"><rect width="100" height="100" rx="24" fill="#fff8ee"/><path d="M26 72h48" stroke="#8b623d" stroke-width="5" stroke-linecap="round" opacity=".22"/><rect x="35" y="20" width="18" height="50" rx="9" fill="#fff" stroke="#8b623d" stroke-width="3"/><path d="M44 52v15" stroke="#ff8a65" stroke-width="8" stroke-linecap="round"/><circle cx="44" cy="69" r="12" fill="#ffb08a" stroke="#8b623d" stroke-width="3"/><path d="M61 31c11 8 14 26 3 39" stroke="#64b5f6" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="72" cy="72" rx="12" ry="10" fill="#fffef8" stroke="#8b623d" stroke-width="3"/><circle cx="68" cy="72" r="2" fill="#5a3b25"/><circle cx="76" cy="72" r="2" fill="#5a3b25"/></svg>`,
    storage:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="納米庫管理"><rect width="100" height="100" rx="24" fill="#f6fbff"/><rect x="19" y="28" width="56" height="48" rx="8" fill="#fff" stroke="#8b623d" stroke-width="3"/><path d="M31 28v48M63 28v48" stroke="#8b623d" stroke-width="3" opacity=".22"/><path d="M72 23c10 11 12 26 4 42" stroke="#64b5f6" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M79 63c5 8 5 14 0 18-5-4-5-10 0-18z" fill="#9ee3ff" stroke="#8b623d" stroke-width="2.5"/><ellipse cx="47" cy="69" rx="18" ry="12" fill="#fffef8" stroke="#8b623d" stroke-width="3"/><circle cx="41" cy="68" r="2.5" fill="#5a3b25"/><circle cx="53" cy="68" r="2.5" fill="#5a3b25"/><path d="M42 76c4 3 9 3 13 0" stroke="#5a3b25" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
  };
  const svg=svgs[name]||svgs.hero;
  return `<span class="${esc(cls)} rn-home-svg" aria-label="${esc(alt)}">${svg}</span>`;
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

function storyLeadCard(x){
  if(!x) return `<div class="card story-card visual-card home-lead-story">${homeArt('story','card-visual story-visual home-custom-visual','世界のライス物語')}<div class="lead-kicker">いちばん読めるメインコンテンツ</div><h2>世界のライス物語</h2><p><b>物語データ未確認</b></p><p>世界の米文化・料理・食感・炊き方を、ホームの先頭で読める形にします。</p>${btn('future','物語一覧へ')}</div>`;
  const art = homeArt('story','card-visual story-visual home-custom-visual','世界のライス物語');
  return `<div class="card story-card visual-card home-lead-story">${art}<div class="lead-kicker">今日のメイン</div><h2>世界のライス物語</h2><p class="small">${esc(field(x,'day_no')||'')}日目 / ${esc(storyCountry(x))} / ${esc(field(x,'region')||'')}</p><h3>${esc(storyTitle(x))}</h3><p class="story-subtitle"><b>${esc(storySubtitle(x))}</b></p><p class="story-readable">${esc(storyBody(x,780)).split('\n').join('<br>')}</p><div class="story-points"><p><b>食感：</b>${esc(field(x,'texture_note')||'未確認')}</p><p><b>炊飯：</b>${esc(field(x,'cooking_note')||'未確認')}</p></div><div class="priority-row">${btn('future','物語一覧へ')}${btn('varieties','関連する米を見る')}${btn('rankings','世界ランキングへ')}</div></div>`;
}
function dailyCardsHTML(variety,learn,lit,term,future,fortune){
  return `<div class="section-title daily-title"><h2>今日の日替わり</h2><p>文章を閉じ込めず、ホームでさっと読める入口にします。</p></div><div class="grid home-daily-grid">
  ${card('今日の米言葉',`${homeArt('word','illust home-mini-illust','米言葉')}<p><b>${esc(termName(term))}</b></p><p>${esc(termNote(term))}</p><p class="small">用語から教材・文献・現場確認へつなげます。</p>${btn('words','米辞典へ')}`)}
  ${card('今日の米占い',`${homeArt('fortune','illust home-mini-illust','米占い')}<p><b>${fortune}</b></p><p>今日は「${esc(termName(term))}」を入口に、米粒の状態と工程を見ます。</p><p><b>ラッキー米種：</b>${esc(titleOfVariety(variety||{}))}</p><p><b>ラッキー工程：</b>${esc(lc(learn,'title')||'浸漬・吸水')}</p><p><b>関連文献：</b>${esc(field(lit,'title')||'文献カード未確認')}</p><div class="priority-row">${btn('varieties','品種を見る')}${btn('learn','教材を見る')}${btn('literature','文献を見る')}</div>`)}
  ${card('今日のお米',`${homeArt('rice','illust home-mini-illust','今日のお米')}<p><b>${esc(titleOfVariety(variety||{}))}</b></p><p>${esc(countryOfVariety(variety||{}))} / ${esc(field(variety,'rice_type','grain_shape')||'種類未確認')}</p><p><b>アミロース：</b>${esc(field(variety,'amylose_range','amylose_value','amylose_class')||'未確認')}</p><p><b>たんぱく質：</b>${esc(field(variety,'protein_range','protein_value','protein_class')||'未確認')}</p><p><b>用途：</b>${esc(field(variety,'main_uses','business_uses')||'未確認')}</p>${btn('varieties','米品種図鑑へ')}`)}
  ${riceWeatherConceptCard()}
  ${card('お米の未来',`${homeArt('future','illust home-mini-illust','お米の未来')}<p><b>${esc(field(future,'title_ja','title')||'未来テーマ')}</b></p><p>${esc(field(future,'subtitle_ja','body_ja')||'未来テーマを表示します。')}</p>${btn('future','未来50を見る')}`)}
</div>`;
}


function countryHistoryCard(){
  const art = rnIllustration('country-history-card','card-visual','現在地のお米ヒストリー');
  return `<div class="card visual-card">${art}<h2>現在地のお米ヒストリー</h2><p><b>GPSで現在地の国を1日1回だけ確認し、その国のお米の歴史・文化・料理・品種へつなげる機能です。</b></p><p>表示単位は市区町村ではなく国単位です。緯度経度を見せる機能ではなく、国判定を米文化の入口に変換します。</p><details open><summary>位置情報の扱い</summary><p>常時取得は行いません。基本は1日1回、最後に取得した国をその日の参考国として使います。</p><p class="warn">GPSは水質、庫内湿度、米の品質、保管状態を測定するものではありません。</p></details><p class="small">国別ヒストリーマスター取り込み後、国の米文化・代表料理・品種・ランキング・文献へ接続します。未収録国は準備中と表示します。</p>${btn('future','物語・未来へ')}</div>`;
}


function countryHistoryHomeCard(){
  const art = homeArt('country','card-visual home-custom-visual','現在地のお米ヒストリー');
  return `<div class="card visual-card home-only-card">${art}<h2>現在地のお米ヒストリー</h2><p><b>GPSで現在地の国を1日1回だけ確認し、その国のお米の歴史・文化・料理・品種へつなげる機能です。</b></p><p>表示単位は市区町村ではなく国単位です。緯度経度を見せる機能ではなく、国判定を米文化の入口に変換します。</p><details open><summary>位置情報の扱い</summary><p>常時取得は行いません。基本は1日1回、最後に取得した国をその日の参考国として使います。</p><p class="warn">GPSは水質、庫内湿度、米の品質、保管状態を測定するものではありません。</p></details><p class="small">国別ヒストリーマスター取り込み後、国の米文化・代表料理・品種・ランキング・文献へ接続します。未収録国は準備中と表示します。</p>${btn('future','物語・未来へ')}</div>`;
}

function riceWeatherConceptCard(){
  return card('今日の米天気',`${homeArt('weather','illust home-mini-illust','今日の米天気')}<p><b>天気予報ではなく、気象条件を米管理の注意へ変換します。</b></p><p><b>保管注意：</b>高湿度の日は米袋周辺、壁際、床、納米庫内壁、残米・付着米を確認します。</p><p><b>結露注意：</b>外気と庫内・室内の温度差が大きい日は、水滴、濡れた付着米、カビ臭、虫、変色を先に見ます。</p><p><b>炊飯確認：</b>吸水状態、べたつき、粒立ち、冷めた後の食感を確認します。</p><p class="warn">地域・天気は補助情報です。GPSだけでは水質や庫内状態は分かりません。</p>${btn('check','チェックへ')}`);
}
function todayPriorityCard(){
  const story=todayStory(), term=termPick();
  return card('今日見る3つ',`<ol class="focus-list"><li><b>米管理：</b>保管注意・結露注意を先に確認</li><li><b>世界の米文化：</b>${esc(storyTitle(story||{}))}</li><li><b>今日の米言葉：</b>${esc(termName(term))}</li></ol><p class="small">毎日変わる入口から、品種・文献・水・納米庫・物語へ進みます。</p>`);
}

function switchView(v){S.view=v;document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));const el=$('#'+v);if(el)el.classList.add('active');document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));render();window.scrollTo({top:0,behavior:'smooth'});}
async function load(){const res=await fetch('data/rice_navi_data.json?v=78m2');S.data=await res.json();document.querySelectorAll('.bottomnav button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));$('#lang').onchange=e=>{S.lang=e.target.value;render()};render();}
function render(){if(!S.data)return; const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords}; (map[S.view]||renderHome)();}
function setFilter(k,v,view){S.filters[k]=v;if(view)switchView(view);else render();}

function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), learn=pick(d.learning_multilingual||d.learning_cards,'learn'), lit=litSorted()[0], term=termPick(), future=pick(d.future_rice,'future'), story=todayStory();
 const fortune=['吸水運','粒立ち運','ふっくら運','温度管理運','水加減運','蒸らし運','保管注意運'][todayIndex(7,'fortune')];
 $('#home').innerHTML=`<div class="hero hero-home"><div><h1>RICE NAVI</h1><p>まずは世界のライス物語。次に、日替わりの米言葉・米占い・品種・水と保管を、短い文章で確認します。</p></div><div class="hero-visual real-hero-visual">${homeArt('hero','hero-inline-visual home-custom-hero','RICE NAVI')}</div></div>
 <div class="today-strip"><button onclick="switchView('future')">世界ライス<span>今日のメイン</span></button><button onclick="switchView('words')">米言葉<span>${esc(termName(term))}</span></button><button onclick="switchView('check')">水と保管<span>GPSは参考入口</span></button></div>
 ${storyLeadCard(story)}
 ${dailyCardsHTML(variety,learn,lit,term,future,fortune)}
 <div class="section-title"><h2>詳しく調べる</h2><p>必要になったら、文献・図鑑・管理・ランキングへ進みます。</p></div>
 <div class="grid home-grid secondary-home-grid">
 ${countryHistoryHomeCard()}
 ${card('炊飯文献ライブラリ',`${homeArt('literature','illust home-mini-illust','文献ライブラリ')}<p><b>${esc(field(lit,'title')||'文献カード')}</b></p><p>${esc(field(lit,'summary')&&!same(lit.summary,lit.title)?lit.summary:'文献要点、条件、出典、確認ポイントを確認します。')}</p><p>${sourceBadge('炊飯文献',counts.literature_cards_v74)} ${sourceBadge('現場メモ',counts.field_notes_v74)}</p><p>${chips([evidenceLabel(lit?._class)])}</p><p class="small">※確認状況は文献の優劣ではなく、RICE NAVI内での整理状態です。</p>${btn('literature','文献を見る')}`)}
 ${card('温度×時間マップ',`${homeArt('temp','illust home-mini-illust','温度と時間')}<p><b>浸漬・昇温・沸騰・蒸らし・ほぐし</b></p><p>トラブルを工程の流れで確認します。</p>${btn('learn','温度×時間を見る')}`)}
 ${card('納米庫管理',`${homeArt('storage','illust home-mini-illust','納米庫管理')}<p><b>結露・湿度・温度差・残米・カビ臭・虫・変色</b></p><p>点検リストだけでなく、危険サインと根拠を見ます。</p>${btn('check','チェックへ')}`)}
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
 ${card('水の相性チェック',`<p><b>結論：GPSだけでは水質は取れません。ただし、地域から「公表水質データ」に紐づけることは可能です。</b></p><p>GPSで分かるのは現在地・地域の入口です。そこから水道局・浄水場・行政区域などの公開データに接続できれば、硬度、pH、残留塩素などの<b>地域参考値</b>を表示できます。</p><p class="warn">ただし、建物配管、貯水槽、浄水器、工場内配管で実際の蛇口水は変わります。GPS値は実測値ではありません。</p><p>現在の表示：${esc(field(region,'area_name_ja')||'地域データ準備中')} / 硬度：${esc(field(region,'total_hardness_mgL_CaCO3')||'未確認')} / pH：${esc(field(region,'pH')||'未確認')}</p><div class="mini-grid"><span><b>現在できる</b><br>地域判定、登録済み水質マスターの表示、手入力値との照合</span><span><b>追加で可能</b><br>水道局・浄水場・行政区域データとの紐づけ</span><span><b>できない</b><br>GPSだけで蛇口水や工場水を実測すること</span><span><b>必要な入力</b><br>公式値、検査値、または現場の測定値</span></div><details open><summary>アプリ上の正しい見せ方</summary><p>1. GPSで地域候補を出す</p><p>2. 地域に紐づく公表水質データがあれば「地域参考値」として表示</p><p>3. 現場水・浄水器後・貯水槽後の値は手入力または検査値として分ける</p><p>4. 炊飯結果の硬さ・粘り・においと照合する</p></details>`,`<p class="small">水質ルール ${(w.quality_rules||[]).length}件 / 水質根拠 ${(w.claims||[]).length}件</p>`)}
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
load().catch(e=>{document.body.innerHTML='<main><div class="card empty"><h1>データ読み込みエラー</h1><p>data/rice_navi_data.json が同じ場所にアップロードされているか確認してください。</p><pre>'+esc(e.stack||e)+'</pre></div></main>'});
