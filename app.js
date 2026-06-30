const S={data:null,view:'home',lang:'ja',filters:{}};
const LANG_KEY='rice_navi_lang';
const VALID_LANGS=new Set(['ja','en','zh_tw','zh_cn']);
function getSavedLang(){
  try{
    const q=new URLSearchParams(location.search).get('lang');
    const saved=q||localStorage.getItem(LANG_KEY);
    return VALID_LANGS.has(saved)?saved:'ja';
  }catch(e){return 'ja';}
}
function saveLang(lang){
  if(!VALID_LANGS.has(lang)) lang='ja';
  S.lang=lang;
  try{localStorage.setItem(LANG_KEY,lang);}catch(e){}
  const el=document.getElementById('lang');
  if(el&&el.value!==lang) el.value=lang;
  updateStaticI18n();
}
function setLanguage(lang){
  saveLang(lang);
  render();
}

// TEXTRECOVERY11_CLICKFIX: robust navigation bridge.
// Handles bottom nav, home cards, daily cards, and hash links even if older inline handlers fail.
(function(){
  function cleanView(v){
    v=String(v||'home').replace(/^#/,'').trim();
    var aliases={dictionary:'words',glossary:'words',terms:'words',word:'words',story:'future',stories:'future',futureStory:'future',worldStories:'future',condition:'check',confirm:'check',water:'check',storage:'check',encyclopedia:'varieties',variety:'varieties',riceVarieties:'varieties',ranking:'rankings'};
    v=aliases[v]||v;
    return ['home','learn','literature','varieties','check','future','rankings','words'].indexOf(v)>=0?v:'home';
  }
  function performNav(el, ev){
    if(!el) return false;
    if(el.getAttribute && el.getAttribute('data-action')==='back'){
      if(ev){ev.preventDefault();ev.stopPropagation();}
      if(typeof window.goBack==='function') window.goBack();
      else if(history.length>1) history.back();
      return true;
    }
    var raw='';
    if(el.getAttribute){
      raw = el.getAttribute('data-go') || el.getAttribute('data-view') || '';
      if(!raw && el.getAttribute('href')) raw=el.getAttribute('href').replace(/^#/,'');
    }
    if(!raw) return false;
    var v=cleanView(raw);
    if(ev){ev.preventDefault();ev.stopPropagation();}
    if(typeof window.switchView==='function') window.switchView(v);
    else location.hash='#'+v;
    return true;
  }
  window.rnForceNavigate=function(v){
    var fake={getAttribute:function(k){return k==='data-go'?v:'';}};
    return performNav(fake,null);
  };
  document.addEventListener('click',function(ev){
    var el=ev.target && ev.target.closest && ev.target.closest('[data-action="back"],button[data-view],[data-go],a[href^="#"]');
    if(!el) return;
    // Inputs/selects inside cards must keep their normal behavior.
    if(ev.target && ev.target.closest && ev.target.closest('input,select,textarea,option')) return;
    performNav(el,ev);
  },true);
  document.addEventListener('keydown',function(ev){
    if(ev.key!=='Enter' && ev.key!==' ') return;
    var el=ev.target && ev.target.closest && ev.target.closest('[data-action="back"],button[data-view],[data-go],a[href^="#"]');
    if(!el) return;
    performNav(el,ev);
  },true);
})();


const I18N={
  ja:{tagline:'お米の知恵を、今日の一杯へ。',refresh:'更新',home:'ホーム',learn:'学ぶ',literature:'文献',varieties:'図鑑',check:'確認',future:'物語・未来',rankings:'ランキング',words:'辞典',todayMain:'今日のメイン',worldStories:'世界のライス物語',readMore:'続きを読む',dailyDiscovery:'今日の小さな発見',toDictionary:'辞典へ',todayRiceWord:'今日の米言葉',todayFortune:'今日の米占い',luckyNumber:'ラッキーナンバー',luckyRice:'ラッキー米種',luckyProcess:'ラッキー工程',todayRice:'今日のお米',todayCondition:'今日の米コンディション',riceFuture:'お米の未来',learnResearch:'探す・読む',list:'一覧へ',worldStoriesDesc:'365話をタイトルから選んで読む',glossary:'米辞典・用語集',glossaryDesc:'1000語を検索する',varietyBook:'米品種図鑑',varietyDesc:'件の品種を確認',ranking:'ランキング',rankingDesc:'世界の米データTOP10',waterRice:'現在地の水と炊飯',waterRiceDesc:'水質の公表情報と炊飯の見方',storage:'納米庫管理',storageDesc:'結露・湿度・虫を確認',literatureLibrary:'炊飯文献ライブラリ',literatureDesc:'文献名一覧と詳細を見る',locationHistory:'現在地のお米ヒストリー',locationHistoryDesc:'現在地の米文化へ',riceCultureMap:'米文化マップ',riceCultureMapDesc:'国から米文化を探す',riceStudy:'炊飯の勉強',riceStudyDesc:'洗米・浸漬・加熱・蒸らしを基本から学ぶ',yourRecord:'あなたの記録',recordText:'学んだことば・読んだ物語・見た品種を、画面内の各機能で続けて確認できます。',stories:'物語',varietiesShort:'品種',litShort:'文献',dataCount:'収録データ数を確認する',dataCountNote:'収録状況の目安です。各項目は画面内で確認できます。',days:'日目'},
  en:{tagline:'Rice knowledge for today’s bowl.',refresh:'Refresh',home:'Home',learn:'Learn',literature:'Refs',varieties:'Varieties',check:'Check',future:'Stories',rankings:'Rankings',words:'Dictionary',todayMain:'Today’s main story',worldStories:'World rice stories',readMore:'Read more',dailyDiscovery:'Today’s discoveries',toDictionary:'Dictionary',todayRiceWord:'Today’s rice word',todayFortune:'Rice fortune',luckyNumber:'Lucky number',luckyRice:'Lucky rice',luckyProcess:'Lucky process',todayRice:'Today’s rice',todayCondition:'Rice condition',riceFuture:'Future of rice',learnResearch:'Learn and explore',list:'List',worldStoriesDesc:'Read 365 stories by title',glossary:'Rice dictionary',glossaryDesc:'Search 1,000 terms',varietyBook:'Rice variety guide',varietyDesc:'varieties listed',ranking:'Rankings',rankingDesc:'Top 10 world rice data',waterRice:'Local water and rice cooking',waterRiceDesc:'Public water data and cooking hints',storage:'Rice storage',storageDesc:'Check condensation, humidity, and insects',literatureLibrary:'Rice-cooking references',literatureDesc:'Browse reference titles and details',locationHistory:'Local rice history',locationHistoryDesc:'Open rice culture for your area',riceCultureMap:'Rice culture map',riceCultureMapDesc:'Explore rice culture by country',riceStudy:'Rice-cooking basics',riceStudyDesc:'Learn washing, soaking, heating, and resting',yourRecord:'Your record',recordText:'Continue checking words, stories, and varieties inside each feature.',stories:'Stories',varietiesShort:'Varieties',litShort:'Refs',dataCount:'Check included data counts',dataCountNote:'These counts are a guide to what is included. You can check each item in the app.',days:'day'},
  zh_tw:{tagline:'把米飯知識帶進今天的一碗飯。',refresh:'更新',home:'首頁',learn:'學習',literature:'文獻',varieties:'圖鑑',check:'確認',future:'故事',rankings:'排行',words:'辭典',todayMain:'今日主題',worldStories:'世界米食故事',readMore:'繼續閱讀',dailyDiscovery:'今日小發現',toDictionary:'米辭典',todayRiceWord:'今日米語',todayFortune:'米占卜',luckyNumber:'幸運粒數',luckyRice:'幸運米種',luckyProcess:'幸運工序',todayRice:'今日米種',todayCondition:'米飯狀態',riceFuture:'米的未來',learnResearch:'學習與查找',list:'列表',worldStoriesDesc:'從365篇標題中選讀',glossary:'米辭典・用語集',glossaryDesc:'搜尋1000個用語',varietyBook:'米品種圖鑑',varietyDesc:'個品種可查',ranking:'排行',rankingDesc:'世界米資料TOP10',waterRice:'所在地的水與炊飯',waterRiceDesc:'公開水質資訊與炊飯觀察',storage:'納米庫管理',storageDesc:'檢查結露、濕度、蟲害',literatureLibrary:'炊飯文獻庫',literatureDesc:'查看文獻名稱與詳情',locationHistory:'所在地米食歷史',locationHistoryDesc:'連到所在地米文化',riceCultureMap:'米文化地圖',riceCultureMapDesc:'依國家探索米文化',riceStudy:'炊飯學習',riceStudyDesc:'從洗米、浸泡、加熱、燜飯學起',yourRecord:'你的紀錄',recordText:'可在各功能中繼續查看學過的詞、讀過的故事與看過的品種。',stories:'故事',varietiesShort:'品種',litShort:'文獻',dataCount:'確認收錄資料數',dataCountNote:'這些數字是收錄狀況的參考。各項目可在畫面內確認。',days:'日'},
  zh_cn:{tagline:'把米饭知识带进今天的一碗饭。',refresh:'更新',home:'首页',learn:'学习',literature:'文献',varieties:'图鉴',check:'确认',future:'故事',rankings:'排行',words:'词典',todayMain:'今日主题',worldStories:'世界米食故事',readMore:'继续阅读',dailyDiscovery:'今日小发现',toDictionary:'米词典',todayRiceWord:'今日米语',todayFortune:'米占卜',luckyNumber:'幸运粒数',luckyRice:'幸运米种',luckyProcess:'幸运工序',todayRice:'今日米种',todayCondition:'米饭状态',riceFuture:'米的未来',learnResearch:'学习与查找',list:'列表',worldStoriesDesc:'从365篇标题中选读',glossary:'米词典・术语集',glossaryDesc:'搜索1000个术语',varietyBook:'米品种图鉴',varietyDesc:'个品种可查',ranking:'排行',rankingDesc:'世界米数据TOP10',waterRice:'所在地的水与煮饭',waterRiceDesc:'公开水质信息与煮饭观察',storage:'纳米库管理',storageDesc:'检查结露、湿度、虫害',literatureLibrary:'煮饭文献库',literatureDesc:'查看文献名称与详情',locationHistory:'所在地米食历史',locationHistoryDesc:'连接所在地米文化',riceCultureMap:'米文化地图',riceCultureMapDesc:'按国家探索米文化',riceStudy:'煮饭学习',riceStudyDesc:'从洗米、浸泡、加热、焖饭学起',yourRecord:'你的记录',recordText:'可在各功能中继续查看学过的词、读过的故事与看过的品种。',stories:'故事',varietiesShort:'品种',litShort:'文献',dataCount:'确认收录数据数',dataCountNote:'这些数字是收录状况的参考。各项目可在画面内确认。',days:'日'}
};
function t(k){return (I18N[S.lang]&&I18N[S.lang][k])||I18N.ja[k]||k;}
function updateStaticI18n(){
  document.documentElement.lang={ja:'ja',en:'en',zh_tw:'zh-Hant',zh_cn:'zh-Hans'}[S.lang]||'ja';
  const tag=document.querySelector('.brand span'); if(tag) tag.textContent=t('tagline');
  const rb=document.getElementById('refreshApp'); if(rb&&!rb.disabled) rb.textContent=t('refresh');
  document.querySelectorAll('.bottomnav button').forEach(b=>{
    if(b.dataset.action==='back'){
      b.textContent={ja:'戻る',en:'Back',zh_tw:'返回',zh_cn:'返回'}[S.lang]||'戻る';
      return;
    }
    const k=b.dataset.navKey||b.dataset.view;
    if(S.lang==='ja' && b.dataset.navLabelJa){b.textContent=b.dataset.navLabelJa;return;}
    if(k)b.textContent=t(k);
  });
}

const UI={
  ja:{all:'全て',allLessons:'全教材',learnByLevel:'レベル別に見る',learnByProcess:'工程・用語で探す',category:'カテゴリ',worldFutureTitle:'世界のライス物語 / お米の未来',worldStories365:'世界のライス物語 365',future50:'お米の未来50',storySearch:'物語検索',futureSearch:'未来テーマ検索',allCountries:'全ての国・地域',allCategories:'全カテゴリ',showingStories:'表示中の物語',totalStories:'物語総数',countriesRegions:'国・地域',showing:'表示中',futureTotal:'未来テーマ総数',read:'読む',readDetail:'詳しく読む',listBack:'一覧に戻る',related:'関連',source:'出典',rankingTitle:'世界の米ランキング',rankingIntro:'順位・国・数値・単位・年・出典を見やすく表示します。',rank:'順位',countryItem:'国・項目',value:'数値',year:'年',definition:'出典・定義',unit:'単位',note:'注意',riceDictionaryWords:'米辞典・米言葉',dictionary1000:'米辞典 1000',termSearch:'用語・米言葉を検索',allTermCats:'用語カテゴリすべて',showingTerms:'表示中の用語',totalTerms:'用語総数',termCategories:'用語カテゴリ',fourLangRelated:'4言語・関連語',dailyFortune100:'今日の米占い100',dailyWords100:'今日の米言葉100',showingFortune:'表示中の米占い',fortuneTotal:'米占い総数',processes:'工程',showingDailyWords:'表示中の米言葉',wordTotal:'米言葉総数',riceWord:'米言葉',todayOneWord:'今日の一言',background:'背景'},
  en:{all:'All',allLessons:'All lessons',learnByLevel:'Browse by level',learnByProcess:'Browse by process or term',category:'Category',worldFutureTitle:'World rice stories / Future of rice',worldStories365:'World rice stories 365',future50:'Future of rice 50',storySearch:'Search stories',futureSearch:'Search future themes',allCountries:'All countries / regions',allCategories:'All categories',showingStories:'Stories shown',totalStories:'Total stories',countriesRegions:'Countries / regions',showing:'Shown',futureTotal:'Future themes',read:'Read',readDetail:'Read details',listBack:'Back to list',related:'Related',source:'Source',rankingTitle:'World rice rankings',rankingIntro:'Shows rank, country, value, unit, year, and source in a readable format.',rank:'Rank',countryItem:'Country / item',value:'Value',year:'Year',definition:'Sources and definition',unit:'Unit',note:'Note',riceDictionaryWords:'Rice dictionary and daily words',dictionary1000:'Rice dictionary 1,000',termSearch:'Search terms or rice words',allTermCats:'All term categories',showingTerms:'Terms shown',totalTerms:'Total terms',termCategories:'Term categories',fourLangRelated:'4 languages and related terms',dailyFortune100:'Rice fortune 100',dailyWords100:'Daily rice words 100',showingFortune:'Fortunes shown',fortuneTotal:'Total fortunes',processes:'Processes',showingDailyWords:'Daily words shown',wordTotal:'Total rice words',riceWord:'Rice word',todayOneWord:'Today’s phrase',background:'Background'},
  zh_tw:{all:'全部',allLessons:'全部教材',learnByLevel:'依程度瀏覽',learnByProcess:'依工序・用語搜尋',category:'分類',worldFutureTitle:'世界米食故事 / 米的未來',worldStories365:'世界米食故事365',future50:'米的未來50',storySearch:'搜尋故事',futureSearch:'搜尋未來主題',allCountries:'全部國家・地區',allCategories:'全部分類',showingStories:'顯示中的故事',totalStories:'故事總數',countriesRegions:'國家・地區',showing:'顯示中',futureTotal:'未來主題總數',read:'閱讀',readDetail:'閱讀詳情',listBack:'回到列表',related:'相關',source:'出處',rankingTitle:'世界米排行',rankingIntro:'以容易閱讀的方式顯示名次、國家、數值、單位、年份與出處。',rank:'名次',countryItem:'國家・項目',value:'數值',year:'年份',definition:'出處・定義',unit:'單位',note:'注意',riceDictionaryWords:'米辭典・今日米語',dictionary1000:'米辭典1000',termSearch:'搜尋用語・米語',allTermCats:'全部用語分類',showingTerms:'顯示中的用語',totalTerms:'用語總數',termCategories:'用語分類',fourLangRelated:'4語言・相關詞',dailyFortune100:'今日米占卜100',dailyWords100:'今日米語100',showingFortune:'顯示中的米占卜',fortuneTotal:'米占卜總數',processes:'工序',showingDailyWords:'顯示中的米語',wordTotal:'米語總數',riceWord:'米語',todayOneWord:'今日一句',background:'背景'},
  zh_cn:{all:'全部',allLessons:'全部教材',learnByLevel:'按程度浏览',learnByProcess:'按工序・术语搜索',category:'分类',worldFutureTitle:'世界米食故事 / 米的未来',worldStories365:'世界米食故事365',future50:'米的未来50',storySearch:'搜索故事',futureSearch:'搜索未来主题',allCountries:'全部国家・地区',allCategories:'全部分类',showingStories:'显示中的故事',totalStories:'故事总数',countriesRegions:'国家・地区',showing:'显示中',futureTotal:'未来主题总数',read:'阅读',readDetail:'阅读详情',listBack:'回到列表',related:'相关',source:'出处',rankingTitle:'世界米排行',rankingIntro:'以易读方式显示名次、国家、数值、单位、年份与出处。',rank:'名次',countryItem:'国家・项目',value:'数值',year:'年份',definition:'出处・定义',unit:'单位',note:'注意',riceDictionaryWords:'米词典・今日米语',dictionary1000:'米词典1000',termSearch:'搜索术语・米语',allTermCats:'全部术语分类',showingTerms:'显示中的术语',totalTerms:'术语总数',termCategories:'术语分类',fourLangRelated:'4语言・相关词',dailyFortune100:'今日米占卜100',dailyWords100:'今日米语100',showingFortune:'显示中的米占卜',fortuneTotal:'米占卜总数',processes:'工序',showingDailyWords:'显示中的米语',wordTotal:'米语总数',riceWord:'米语',todayOneWord:'今日一句',background:'背景'}
};
function ui(k){return (UI[S.lang]&&UI[S.lang][k])||UI.ja[k]||k;}
function msg(ja,en,tw,cn){return S.lang==='en'?en:S.lang==='zh_tw'?tw:S.lang==='zh_cn'?cn:ja;}

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const has=v=>v!==undefined&&v!==null&&String(v).trim()!=='';
const norm=v=>String(v??'').trim();
const same=(a,b)=>norm(a)===norm(b);
function field(o,...keys){for(const k of keys){if(o&&has(o[k])) return o[k];}return '';}
function looksUntranslated(v,L){
  const t=String(v||'');
  if(!t) return true;
  if(L==='en') return /[ぁ-んァ-ン]/.test(t);
  if(L==='zh_tw'||L==='zh_cn') return /[ぁ-んァ-ン]/.test(t);
  return false;
}
function reviewText(ja){
  return msg(ja,`Translation in review: ${ja}`,`翻譯確認中：${ja}`,`翻译确认中：${ja}`);
}
function publicFallback(label){
  return msg(`${label}は詳細で確認できます`,`Check ${label} in details`,`${label}可在詳情確認`,`${label}可在详情确认`);
}
function sourceFallback(){
  return msg('出典・定義で確認できます','Check source and definition','可在出處與定義確認','可在出处与定义确认');
}
function tx(obj,key){
  if(!obj) return '';
  const L=S.lang;
  const lists={ja:[key+'_ja',key,'ja'],en:[key+'_en','en'],zh_tw:[key+'_zh_tw',key+'_zhTW','zh_tw','zh-TW'],zh_cn:[key+'_zh_cn',key+'_zhCN','zh_cn','zh-CN']};
  const nested={ja:['ja'],en:['en'],zh_tw:['zh-TW','zh_tw','zhTW'],zh_cn:['zh-CN','zh_cn','zhCN']};
  for(const k of lists[L]||lists.ja){if(has(obj[k])&&!looksUntranslated(obj[k],L)) return obj[k];}
  if(typeof obj[key]==='object'&&obj[key]){const m=obj[key];for(const k of nested[L]||nested.ja){if(has(m[k])&&!looksUntranslated(m[k],L)) return m[k];}}
  let ja='';
  for(const k of lists.ja){if(has(obj[k])){ja=obj[k];break;}}
  if(!ja&&typeof obj[key]==='object'&&obj[key]) ja=obj[key].ja||'';
  if(L!=='ja'&&has(ja)) return reviewText(ja);
  return ja||'';
}
function lc(x,k){const i=x?.i18n||{}, L=S.lang; return field(i[L]||{},k)||field(i.ja||{},k)||field(x,k)||'';}
function todayIndex(n,salt=''){if(!n)return 0;const d=new Date();const s=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}-${salt}`;let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h%n;}
const pick=(arr,salt)=>arr&&arr.length?arr[todayIndex(arr.length,salt)]:null;
function traceText(x){
  return String(x||'')
    .replace(/source_id\+claim_id確認できる資料/g,'条件と出典をたどれる資料')
    .replace(/source_id\+claim_id確認済み/g,'条件と出典をたどれる資料')
    .replace(/正式カード候補/g,'文献に基づく項目')
    .replace(/公開候補/g,'公開用項目')
    .replace(/補填候補/g,'追加確認項目')
    .replace(/確認済み/g,'内容をたどれる資料')
    .replace(/claim/gi,'出典')
    .replace(/文献カード/g,'文献カード')
    .replace(/正式カード/g,'文献カード')
    .replace(/cards_literature_based/g,'文献に基づく教材')
    .replace(/app_ready_formal/g,'公開準備済み')
    .replace(/trace_ok/g,'出典あり')
    .replace(/formal/g,'文献に基づく')
    .replace(/core/g,'重要')
    .replace(/important/g,'重要');
}
function publicLabel(x){
  let s=norm(traceText(x));
  if(!s) return '';
  const map={
    app_heuristic:'アプリ内の目安', public_or_manual:'公表値または入力値', template:'地域データ', active:'表示中',
    translated:'翻訳済み', machine_translated:'翻訳を調整中', reviewed:'内容をたどれる資料', draft:'準備中',
    literature:'文献', government:'公的資料', academic:'学術資料', industry:'業界資料',
    A:'条件まで見られる資料', B:'要点が読める資料', C:'出典からたどる資料', D:'実用メモ'
  };
  if(map[s]) return map[s];
  s=s.replace(/_/g,' ').replace(/\bsource type\b/i,'出典種別').replace(/\bevidence level\b/i,'出典確認').trim();
  return s;
}

function waterParamLabel(x){
  const s=String(x||'').trim();
  const map={total_hardness:'硬度', hardness:'硬度', pH:'pH', ph:'pH', residual_chlorine:'残留塩素', chlorine:'残留塩素', alkalinity:'アルカリ度', conductivity:'電気伝導率'};
  return map[s] || publicLabel(s) || '項目';
}

function waterOfficialLinks(region){
  const country=field(region,'country_ja','country')||'';
  const area=[field(region,'area_name_ja'),field(region,'admin1_ja'),field(region,'admin2_ja')].join(' ');
  const links=[];
  const add=(label,url,note)=>{ if(url) links.push({label,url,note}); };
  if(country.includes('台湾')||area.includes('新北')||area.includes('桃園')||area.includes('台北')){
    add('台湾自來水公司：水質即時資訊','https://www.water.gov.tw/wq/','地図から地域を選び、残留塩素・濁度などの最新情報を確認します。');
    add('台湾自來水公司：平均水質','https://www.water.gov.tw/ch/WaterQuality?nodeId=4631','浄水場・地域ごとの平均水質を確認します。硬度、pH、残留塩素などを見るページです。');
    add('環境部 飲用水全球資訊網：自來水公司水質資訊','https://dwsiot.moenv.gov.tw/watercompany_taiwan_list','市区・浄水場ごとの水質情報ページへ進む一覧です。');
    if(area.includes('台北')||area.includes('新北')) add('臺北自來水事業處：水質資訊','https://www.water.gov.taipei/Content_List.aspx?n=77AB4A57F76B9882','台北・一部周辺地域の採水検査、管網、浄水場情報を確認します。');
    if(area.includes('桃園')||area.includes('中壢')) add('台湾自來水公司：平鎮浄水場の平均水質','https://www.water.gov.tw/ch/WaterQuality/Detail/1992?nodeId=4631','桃園・中壢方面で水質情報を確認できる浄水場ページです。実際の給水区域は公式ページで確認します。');
  } else if(country.includes('日本')||area.includes('名古屋')||area.includes('大阪')){
    if(area.includes('名古屋')) add('名古屋市上下水道局：水質検査結果','https://www.water.city.nagoya.jp/category/suidousuisitsu/144524.html','名古屋市内の毎日検査・毎月検査・水質管理情報を確認します。');
    if(area.includes('名古屋')) add('名古屋市上下水道局：水道の水質','https://www.water.city.nagoya.jp/category/suidousuisitsu/index.html','水質検査結果、PFAS、水質管理年報などを確認できるページです。');
    if(area.includes('大阪')) add('大阪市水道局：水道水質検査結果のお知らせ','https://www.city.osaka.lg.jp/suido/page/0000014772.html','大阪市の給水栓・浄水場出口などの検査結果を確認します。');
    if(area.includes('大阪')) add('大阪市水道局：水道水質基準について','https://www.city.osaka.lg.jp/suido/page/0000014774.html','水質基準項目の見方を確認します。');
    add('各自治体・水道局の水質検査結果ページを確認','https://www.google.com/search?q=%E6%B0%B4%E8%B3%AA%E6%A4%9C%E6%9F%BB%E7%B5%90%E6%9E%9C+%E6%B0%B4%E9%81%93%E5%B1%80','地域名＋水質検査結果＋水道局で、公表ページを探します。');
  } else {
    add('地域の水道事業者・自治体の水質公表ページを確認','https://www.google.com/search?q=water+quality+drinking+water+official+utility','地域名、water quality、drinking water、official utility などで確認先を探します。');
  }
  return links;
}

function storageStepLabels(){
  return msg(
    ['1. 納米庫で見るべきこと','2. 結露とは何か','3. 湿度管理','4. 温度管理','5. 残米','6. カビ臭・虫・変色','7. 危険サイン','8. 点検場所','9. 今日の補助注意','10. 出典・出典'],
    ['1. What to check in rice storage','2. What condensation means','3. Humidity control','4. Temperature control','5. Remaining rice','6. Mold odor, insects, discoloration','7. Danger signs','8. Inspection points','9. Today’s support notes','10. Sources and evidence'],
    ['1. 納米庫要看的事','2. 什麼是結露','3. 濕度管理','4. 溫度管理','5. 殘米','6. 霉味・蟲害・變色','7. 危險訊號','8. 點檢位置','9. 今日輔助注意','10. 出處・根據'],
    ['1. 纳米库要看的事','2. 什么是结露','3. 湿度管理','4. 温度管理','5. 残米','6. 霉味・虫害・变色','7. 危险信号','8. 点检位置','9. 今日辅助注意','10. 出处・依据']
  );
}
function troubleLabel(key){
  const map={
    sticky:msg('べたつき','Sticky rice','黏膩','发黏'),
    hard:msg('硬い','Too firm','偏硬','偏硬'),
    absorption:msg('吸水不足','Under-absorption','吸水不足','吸水不足'),
    staling:msg('老化','Staling','老化','老化'),
    water:msg('水質','Water quality','水質','水质'),
    mold:msg('カビ・保管','Mold / storage','霉味・保管','霉味・保存'),
    core:msg('芯残り','Uncooked core','夾生','夹生'),
    resting:msg('蒸らし不足','Insufficient resting','燜飯不足','焖饭不足')
  };
  return map[key]||key;
}

function waterLinksHTML(region){
  const links=waterOfficialLinks(region);
  if(!links.length) return '';
  return `<div class="plain-box"><b>${msg('この地域の水質情報を確認する','Check water-quality information for this area','確認此地區的水質資訊','确认此地区的水质信息')}</b><p>${msg('アプリ内に数値がない地域でも、下の公表ページから硬度・pH・残留塩素などを確認できます。確認した数値は、水加減・浸漬・炊き上がりの見方に使います。','Even when local values are not stored in the app, use the public pages below to check hardness, pH, residual chlorine and related items. Use those values as hints for water amount, soaking, and cooked-rice results.','即使App內沒有該地區數值，也可從下方公開頁面確認硬度、pH、餘氯等項目。確認後可用來判斷水量、浸泡與炊飯結果。','即使App内没有该地区数值，也可从下方公开页面确认硬度、pH、余氯等项目。确认后可用于判断水量、浸泡与米饭结果。')}</p><div class="compact-list">${links.map(x=>`<p><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a><br><span class="small">${esc(x.note)}</span></p>`).join('')}</div></div>`;
}
function regionWaterValueHTML(region){
  const items=[
    [msg('硬度','Hardness','硬度','硬度'),field(region,'total_hardness_mgL_CaCO3'),'mg/L as CaCO3',msg('水に含まれるカルシウム・マグネシウムの多さです。低いほど軟水寄り、高いほど硬水寄りです。','Amount of calcium and magnesium in the water. Lower values mean softer water; higher values mean harder water.','水中鈣與鎂的多寡。數值越低越偏軟水，越高越偏硬水。','水中钙和镁的多少。数值越低越偏软水，越高越偏硬水。')],
    ['pH',field(region,'pH'),'','7前後が中性です。7より小さいと酸性寄り、7より大きいとアルカリ性寄りです。'],
    [msg('残留塩素','Residual chlorine','餘氯','余氯'),field(region,'residual_chlorine_mgL'),'mg/L',msg('水道水を安全に保つための消毒成分の残りです。香りが気になる時の確認項目です。','Remaining disinfectant used to keep tap water safe. Check this when aroma is a concern.','為維持自來水安全所留下的消毒成分。香氣在意時可確認。','为维持自来水安全所留下的消毒成分。香气在意时可确认。')],
    ['TDS',field(region,'tds_mgL'),'mg/L','水に溶けている成分の総量の目安です。'],
    [msg('アルカリ度','Alkalinity','鹼度','碱度'),field(region,'alkalinity_mgL'),'mg/L',msg('水のpHが変わりにくさに関係する目安です。','A guide to how resistant the water is to pH change.','與水的pH是否容易變動有關的指標。','与水的pH是否容易变动有关的指标。')]
  ];
  const rows=items.map(([label,value,unit,note])=>`<tr><th>${esc(label)}</th><td>${has(value)?esc(value+(unit?' '+unit:'')):msg('公表ページで確認','Check public page','請確認公開頁面','请确认公开页面')}</td><td>${esc(note)}</td></tr>`).join('');
  return `<table><thead><tr><th>${msg('項目','Item','項目','项目')}</th><th>${msg('地域の参考値','Local reference value','地區參考值','地区参考值')}</th><th>${msg('見方','How to read it','觀察方式','查看方式')}</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function waterRegionPickerHTML(regions, selected){
  return `<div class="toolbar"><label>${msg('確認する地域','Area to check','確認地區','确认地区')} <select onchange="S.filters.waterRegion=this.value;renderCheck()">${regions.map((r,i)=>`<option value="${i}" ${i==selected?'selected':''}>${esc(localizedField(r,'area_name')||field(r,'region_id')||('地域'+(i+1)))}</option>`).join('')}</select></label><button class="btn secondary" onclick="getWaterLocationHint()">${msg('現在地を取得','Use current location','取得目前位置','获取当前位置')}</button></div><div id="geo-status" class="data-note">${msg('現在地を取得したあと、該当しそうな地域を選んで水質の公表ページと炊飯で見るポイントを確認します。','After getting your location, choose the closest area and check public water information plus rice-cooking points.','取得位置後，選擇可能對應的地區，確認公開水質頁面與炊飯觀察重點。','获取位置后，选择可能对应的地区，确认公开水质页面与煮饭观察重点。')}</div>`;
}
function getWaterLocationHint(){
  const box=document.getElementById('geo-status');
  if(!box) return;
  if(!navigator.geolocation){ box.innerHTML=msg('この端末では位置情報を取得できません。地域を選び、水質の公表ページを確認してください。','This device cannot get location. Choose an area and check the public water page.','此裝置無法取得位置。請選擇地區並確認公開水質頁面。','此设备无法获取位置。请选择地区并确认公开水质页面。'); return; }
  box.innerHTML=msg('位置情報を確認しています…','Checking location…','正在確認位置…','正在确认位置…');
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat=pos.coords.latitude.toFixed(4), lng=pos.coords.longitude.toFixed(4);
    box.innerHTML=msg('現在地を確認しました。該当しそうな地域を選ぶと、水質情報の確認先と炊飯で見るポイントを表示します。','Location checked. Choose the closest area to show water-information links and rice-cooking points.','已確認目前位置。選擇可能對應的地區後，會顯示水質資訊確認處與炊飯重點。','已确认当前位置。选择可能对应的地区后，会显示水质信息确认处和煮饭重点。');
  },()=>{box.innerHTML=msg('位置情報を取得できませんでした。地域を選び、水質の公表ページを確認してください。','Could not get location. Choose an area and check the public water page.','無法取得位置。請選擇地區並確認公開水質頁面。','无法获取位置。请选择地区并确认公开水质页面。');},{enableHighAccuracy:false,timeout:8000,maximumAge:86400000});
}
function explainEvidenceLink(kind='文献'){
  if(kind==='learn') return msg('この勉強項目は、文献や公的資料の要点を読みやすく整理したものです。詳しい条件や出典は文献ライブラリで確認できます。','This lesson organizes key points from references and public materials in an easy-to-read way. Detailed conditions and sources can be checked in the reference library.','此教材把文獻與公開資料的要點整理成容易閱讀的內容。詳細條件與出處可在文獻庫確認。','此教材把文献与公开资料的要点整理成易读内容。详细条件与出处可在文献库确认。');
  if(kind==='variety') return msg('この品種情報に関係する文献・資料を探します。品種説明と文献本文は別ページで確認します。','Search references and materials related to this variety. Variety descriptions and reference details are kept on separate pages.','查找與此品種相關的文獻與資料。品種說明與文獻詳情會分開確認。','查找与此品种相关的文献与资料。品种说明与文献详情会分开确认。');
  return msg('詳しい出典や条件は、文献ライブラリの詳細で確認できます。','Detailed evidence and conditions can be checked in the reference library.','詳細根據與條件可在文獻庫詳情確認。','详细依据与条件可在文献库详情确认。');
}
function chips(list){return (list||[]).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(x=>publicLabel(x)).filter(has).slice(0,10).map(x=>`<span class="pill">${esc(x)}</span>`).join('');}
function rangeText(min,max,unit){
  const a=has(min)?String(min).trim():''; const b=has(max)?String(max).trim():'';
  const u=unit?` ${unit}`:'';
  if(a&&b) return `${a}〜${b}${u}`;
  if(a) return `${a}${u}以上`;
  if(b) return `${b}${u}以下`;
  return msg('範囲は資料で確認します','Check the range in the source material','範圍請在資料中確認','范围请在资料中确认');
}
function phPlain(value){
  if(!has(value)) return msg('pHは公表ページで確認','Check pH on the public page','pH請在公開頁面確認','pH请在公开页面确认');
  const v=Number(value); if(!Number.isFinite(v)) return String(value);
  if(v<6.5) return msg(`pH ${v}：酸性寄り`,`pH ${v}: acidic side`,`pH ${v}：偏酸性`,`pH ${v}：偏酸性`);
  if(v<=7.5) return msg(`pH ${v}：中性付近`,`pH ${v}: near neutral`,`pH ${v}：接近中性`,`pH ${v}：接近中性`);
  return msg(`pH ${v}：アルカリ性寄り`,`pH ${v}: alkaline side`,`pH ${v}：偏鹼性`,`pH ${v}：偏碱性`);
}
function waterIntroHTML(region,w){
  const ph=field(region,'pH'); const hard=field(region,'total_hardness_mgL_CaCO3');
  const rules=(w.quality_rules||[]).filter(r=>field(r,'parameter')==='total_hardness').slice(0,5);
  const hardRows=rules.map(r=>`<tr><td>${esc(localizedField(r,'class')||msg('分類','Class','分類','分类'))}</td><td>${esc(rangeText(field(r,'min_value'),field(r,'max_value'),field(r,'unit')))}</td><td>${esc(localizedField(r,'benefit')||localizedField(r,'advice')||msg('炊飯での見方を確認','Check how to read it for rice cooking','確認炊飯時的觀察方式','确认煮饭时的观察方式'))}</td></tr>`).join('');
  const phClaims=(w.claims||[]).filter(c=>field(c,'parameter')==='pH').slice(0,3);
  const hasRegionValue=[hard,ph,field(region,'residual_chlorine_mgL'),field(region,'tds_mgL'),field(region,'alkalinity_mgL')].some(has);
  return `<p><b>${msg('地域の水質情報を見ながら、その水で炊く時の硬さ・粘り・香り・水加減の見方を確認します。','Use local water information to check cooking hints such as firmness, stickiness, aroma, and water adjustment.','參考地區水質資訊，確認炊飯時的硬度、黏性、香氣與水量調整。','参考地区水质信息，确认煮饭时的硬度、黏性、香气与水量调整。')}</b></p>
  <p>${msg('最初に地域を確認します。アプリ内に硬度・pH・残留塩素などの値が入っていれば地域の参考値として表示し、アプリ内に数値がない場合は、公式・公表ページへの確認リンクを出します。','First check the area. If hardness, pH, residual chlorine, or similar values are stored in the app, they are shown as local reference values. If not, links to official or public pages are shown.','首先確認地區。若App內已有硬度、pH、餘氯等數值，會以地區參考值顯示；若沒有數值，會顯示官方或公開頁面的確認連結。','首先确认地区。若App内已有硬度、pH、余氯等数值，会以地区参考值显示；若没有数值，会显示官方或公开页面的确认链接。')}</p>
  <p><b>${msg('選択中の地域：','Selected area: ','選擇中的地區：','选择中的地区：')}</b>${esc(localizedField(region,'area_name')||msg('地域を選択してください','Choose an area','請選擇地區','请选择地区'))}</p>
  <div class="plain-box"><b>${msg('この地域の登録状況：','Data status for this area: ','此地區的登錄狀態：','此地区的数据状态：')}</b>${hasRegionValue?msg('アプリ内に一部の水質参考値があります。','Some water-quality reference values are stored in the app.','App內有部分水質參考值。','App内有部分水质参考值。'):msg('この地域の数値はアプリ内にはありません。下の公表情報リンクで硬度・pH・残留塩素などを確認します。','Values for this area are not stored in the app. Use the public-information links below to check hardness, pH, residual chlorine, and similar items.','此地區的數值尚未收錄在App內。請使用下方公開資訊連結確認硬度、pH、餘氯等項目。','此地区的数值尚未收录在App内。请使用下方公开信息链接确认硬度、pH、余氯等项目。')}</div>
  ${regionWaterValueHTML(region)}
  ${waterLinksHTML(region)}
  <div class="plain-box"><b>${msg('pHの見方：','How to read pH: ','pH觀察方式：','pH查看方式：')}</b>${msg('pHは水が酸性か中性かアルカリ性かを見る数字です。7前後が中性です。7より小さいと酸性寄り、7より大きいとアルカリ性寄りです。','pH shows whether water is acidic, neutral, or alkaline. Around 7 is neutral. Below 7 is acidic; above 7 is alkaline.','pH是用來看水偏酸性、中性或鹼性的數字。約7為中性，小於7偏酸性，大於7偏鹼性。','pH是用来看水偏酸性、中性或碱性的数字。约7为中性，小于7偏酸性，大于7偏碱性。')}</div>
  <div class="plain-box"><b>${msg('硬度の見方：','How to read hardness: ','硬度觀察方式：','硬度查看方式：')}</b>${msg('硬度はカルシウムやマグネシウムなどのミネラルの多さです。低いほど軟水寄り、高いほど硬水寄りです。炊飯では、やわらかさ・粘り・粒感の出方を見る目安になります。','Hardness indicates the amount of minerals such as calcium and magnesium. Lower values mean softer water; higher values mean harder water. In rice cooking, it helps you watch softness, stickiness, and grain separation.','硬度表示鈣、鎂等礦物質的多寡。數值越低越接近軟水，越高越接近硬水。炊飯時可作為觀察柔軟度、黏性與粒感的線索。','硬度表示钙、镁等矿物质的多少。数值越低越接近软水，越高越接近硬水。煮饭时可作为观察柔软度、黏性与颗粒感的线索。')}</div>
  <div class="plain-box"><b>${msg('炊飯ではここを見る：','Rice-cooking points: ','炊飯時看這裡：','煮饭时看这里：')}</b>${msg('水質は、吸水のしやすさ、炊き上がりの硬さ、粘り、香りに関係する場合があります。まず硬度・pH・残留塩素を確認し、極端な値でないかを見ます。','Water quality may relate to absorption, cooked-rice firmness, stickiness, and aroma. First check hardness, pH, and residual chlorine, and look for extreme values.','水質可能與吸水容易度、炊好後的硬度、黏性與香氣有關。先確認硬度、pH與餘氯，觀察是否有極端值。','水质可能与吸水容易度、煮好后的硬度、黏性与香气有关。先确认硬度、pH与余氯，观察是否有极端值。')}</div>
  <p class="warn">${msg('地域の参考値は蛇口の実測値ではありません。貯水槽、浄水器、蛇口まわりの状態で実際の水は変わります。手元に検査表や実測値がある場合だけ、補助情報として入力します。','Local reference values are not tap measurements. Actual water can change with tanks, filters, and faucet conditions. Enter test-sheet or measured values only as supporting information when you have them.','地區參考值不是水龍頭實測值。實際用水會因水槽、濾水器與水龍頭狀態而改變。只有手邊有檢測表或實測值時，才作為補助資訊輸入。','地区参考值不是水龙头实测值。实际用水会因水箱、净水器与水龙头状态而改变。只有手边有检测表或实测值时，才作为辅助信息输入。')}</p>
  <details open><summary>${msg('硬度の目安と炊飯での見方','Hardness guide and rice-cooking view','硬度目安與炊飯觀察','硬度参考与煮饭观察')}</summary><table><thead><tr><th>${msg('分類','Class','分類','分类')}</th><th>${msg('硬度','Hardness','硬度','硬度')}</th><th>${msg('炊飯での見方','Rice-cooking view','炊飯觀察方式','煮饭观察方式')}</th></tr></thead><tbody>${hardRows}</tbody></table></details>
  <details><summary>${msg('pHと炊飯の見方','How pH relates to rice cooking','pH與炊飯的看法','pH与煮饭的看法')}</summary>${phClaims.map(c=>`<p><b>${esc(field(c,'condition')||msg('条件','Condition','條件','条件'))}</b><br>${esc(localizedField(c,'claim')||msg('要点は文献詳細または出典ページで確認します','Check the key point in reference details or on the source page','要點請在文獻詳情或出處頁面確認','要点请在文献详情或出处页面确认'))}<br><span class="small">${msg('注意：','Note: ','注意：','注意：')}${esc(localizedField(c,'display_caution')||msg('飲用水のおすすめ値ではなく、文献内の条件として見ます。','Read this as a condition in the reference, not as drinking-water advice.','這是文獻中的條件，不是飲用水建議值。','这是文献中的条件，不是饮用水建议值。'))}</span></p>`).join('')}</details>`;
}
function card(title,body,extra=''){return `<div class="card"><h2>${esc(title)}</h2>${body}${extra}</div>`;}
function stat(n,label,note=''){return `<div class="kpi"><b>${esc(n??0)}</b><span>${esc(label)}</span>${note?`<em>${esc(note)}</em>`:''}</div>`;}
function btn(view,label){return `<button type="button" class="btn" data-go="${esc(view)}" onclick="return goView('${esc(view)}')">${esc(label)}</button>`;}
function visible(...vals){for(const v of vals){if(has(v))return v;}return msg('詳細で確認できます','Check details','可在詳情確認','可在详情确认');}
function sourceBadge(label,count){return `<span class="badge">${esc(label)}：${esc(count??0)}${msg('件',' items','件','项')}</span>`;}

function sourceMap(){const m={};(S.data?.literature?.sources||[]).forEach(x=>{const id=field(x,'source_id','id','SourceID'); if(id)m[id]=x;});return m;}
function claimMap(){const m={};(S.data?.literature?.claims||[]).forEach(x=>{const id=field(x,'claim_id','id','ClaimID'); if(id)m[id]=x;});return m;}
function splitIds(v){return String(v||'').split(/[;,;；、\s]+/).map(norm).filter(has);}
function sourceDetails(ids){const sm=sourceMap(); const arr=splitIds(ids).map(id=>sm[id]).filter(Boolean); if(!arr.length)return `<div class="source">${msg('参考資料：詳細で確認します','Reference: check details','參考資料：請在詳情確認','参考资料：请在详情确认')}</div>`; return arr.slice(0,4).map(x=>`<div class="source"><b>${msg('参考資料','Reference','參考資料','参考资料')}</b><br>${esc(sourceTitleText(x)||field(x,'source_title_ja','title_ja','title','source_name')||msg('資料名は詳細で確認します','Check source title in details','資料名稱可在詳情確認','资料名称可在详情确认'))}<br>${sourceTopicText(x)?`<span class="small">${esc(sourceTopicText(x))}</span><br>`:''}${esc(field(x,'source_url','url')||msg('URLは出典ページで確認します','Check URL on the source page','URL請在出處頁面確認','URL请在出处页面确认'))}</div>`).join('');}

function literatureFieldText(obj, base, fallbackLabel){
  if(!obj) return '';
  const L=S.lang;
  const direct={
    ja:[base+'_ja',base,'summary','title','condition'],
    en:[base+'_en',base+'_en_reviewed','en'],
    zh_tw:[base+'_zh_tw',base+'_zhTW','zh_tw','zh-TW'],
    zh_cn:[base+'_zh_cn',base+'_zhCN','zh_cn','zh-CN']
  }[L] || [base+'_ja',base];
  for(const k of direct){
    if(has(obj[k])&&!looksUntranslated(obj[k],L)) return cleanPublicText(obj[k]) || obj[k];
  }
  const nested=obj.i18n||{};
  const langKeys={ja:['ja'],en:['en'],zh_tw:['zh_tw','zh-TW','zhTW'],zh_cn:['zh_cn','zh-CN','zhCN']}[L]||['ja'];
  for(const lk of langKeys){
    if(nested[lk]&&has(nested[lk][base])&&!looksUntranslated(nested[lk][base],L)) return cleanPublicText(nested[lk][base])||nested[lk][base];
  }
  let ja='';
  for(const k of [base+'_ja',base,'summary','title','condition','claim_text','usage_note','usable_topics','source_title']){
    if(has(obj[k])){ja=obj[k];break;}
  }
  if(L!=='ja'&&has(ja)) return reviewText(cleanPublicText(ja)||ja);
  return cleanPublicText(ja)||ja||publicFallback(fallbackLabel||base);
}
function literatureCategoryLabel(c){
  const s=String(c||'');
  const map={
    '浸漬・吸水':msg('浸漬・吸水','Soaking / absorption','浸泡・吸水','浸泡・吸水'),
    '糊化・加熱':msg('糊化・加熱','Gelatinization / heating','糊化・加熱','糊化・加热'),
    '老化・保存':msg('老化・保存','Staling / storage','老化・保存','老化・保存'),
    '食感・物性':msg('食感・物性','Texture / properties','口感・物性','口感・物性'),
    '水質・pH':msg('水質・pH','Water quality / pH','水質・pH','水质・pH'),
    'pH・調味液':msg('pH・調味液','pH / seasoning liquid','pH・調味液','pH・调味液'),
    '衛生・保管':msg('衛生・保管','Hygiene / storage','衛生・保存','卫生・保存'),
    '炊飯条件':msg('炊飯条件','Cooking conditions','炊飯條件','煮饭条件'),
    '工程管理':msg('工程管理','Process control','工序管理','工序管理')
  };
  return map[s]||s||msg('未分類','Uncategorized','未分類','未分类');
}
function sourceTitleText(x){return literatureFieldText(x,'source_title',msg('資料名','source title','資料名稱','资料名称'));}
function sourceTopicText(x){return literatureFieldText(x,'usable_topics',msg('確認できる内容','topics to check','可確認內容','可确认内容'));}
function claimText(x){return literatureFieldText(x,'claim_text',msg('要点','key point','要點','要点'));}
function conditionText(x){return literatureFieldText(x,'conditions_or_numbers',msg('条件・数値','conditions and numbers','條件・數值','条件・数值'));}

function claimDetails(ids){const cm=claimMap(); const arr=splitIds(ids).map(id=>cm[id]).filter(Boolean); if(!arr.length)return `<p><b>${msg('この文献で確認できること：','What this reference helps confirm: ','此文獻可確認的內容：','此文献可确认的内容：')}</b>${msg('詳細で確認します','Check details','請在詳情確認','请在详情确认')}</p>`; return arr.slice(0,4).map(x=>`<div class="claim-box"><p><b>${msg('この文献で確認できること：','What this reference helps confirm: ','此文獻可確認的內容：','此文献可确认的内容：')}</b>${esc(claimText(x)||msg('要点は詳細で確認します','Check key points in details','要點請在詳情確認','要点请在详情确认'))}</p>${conditionText(x)?`<p class="small"><b>${msg('条件・数値：','Conditions / numbers: ','條件・數值：','条件・数值：')}</b>${esc(conditionText(x))}</p>`:''}</div>`).join('');}
function topCategories(cards,limit=10){const c={};cards.forEach(x=>{const k=x.category||msg('未分類','Uncategorized','未分類','未分类');c[k]=(c[k]||0)+1});return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,limit);}
function resetFilters(keys){keys.forEach(k=>S.filters[k]='');render();}

function levelKey(x){const p=String(x.priority||x.evidence_level||''); if(p.includes('core')||x.evidence_level==='A') return 'beginner'; if(p.includes('important')||x.evidence_level==='B') return 'intermediate'; return 'advanced';}
function levelLabelFromKey(k){return k==='beginner'?msg('初級','Beginner','初級','初级'):k==='intermediate'?msg('中級','Intermediate','中級','中级'):msg('上級','Advanced','進階','进阶');}
function levelLabel(x){return levelLabelFromKey(levelKey(x));}
function classifyEvidence(x){
  if(x.type==='field_note') return 'D';
  const src=has(x.source_ids), cid=has(x.claim_ids), sum=has(x.summary)&&!same(x.summary,x.title), cond=has(x.condition);
  if(src&&cid&&sum&&cond&&String(x.status||'').includes('確認')) return 'A';
  if(src&&(cid||sum||cond)) return 'B';
  if(src||cid) return 'C';
  return 'D';
}
function evidenceLabel(c){return {A:msg('条件まで見られる資料','Source with conditions','可確認條件的資料','可确认条件的资料'),B:msg('要点が読める資料','Source with key points','可閱讀要點的資料','可阅读要点的资料'),C:msg('出典からたどる資料','Trace from source','從出處追溯的資料','从出处追溯的资料'),D:msg('実用メモ','Field note','現場記錄','现场记录')}[c]||msg('出典からたどる資料','Trace from source','從出處追溯的資料','从出处追溯的资料');}
function statusInfo(c){return {A:msg('資料名、要点、条件がそろっていて、条件まで見られる項目です。','The title, key point, and conditions are available, so conditions can be checked.','資料名、要點與條件齊全，可確認條件。','资料名、要点与条件齐全，可确认条件。'),B:msg('文献や公的資料の要点を読める項目です。','You can read key points from references or public materials.','可閱讀文獻或公開資料的要點。','可阅读文献或公开资料的要点。'),C:msg('タイトルやカテゴリから関連資料を探せる項目です。','Use the title and category to find related source material.','可由標題與分類尋找相關資料。','可由标题与分类寻找相关资料。'),D:msg('現場での確認メモです。','This is a field note for practical checking.','這是現場確認用的備註。','这是现场确认用的备注。')}[c]||msg('内容を確認しながら使う項目です。','Use this while checking the details.','請邊確認內容邊使用。','请边确认内容边使用。');}

/* Illustration asset helpers. */
const RN_ILLUST_VERSION = 'textrecovery17-home-png-icons-20260629';
function rnAsset(path){ return String(path||'') + '?v=' + RN_ILLUST_VERSION; }
const RN_APP_IMAGE_MAP = {
  hero:'01_world_rice_story_hero.webp',
  word:'03_card_rice_word.webp',
  fortune:'04_card_fortune.webp',
  rice:'05_card_today_rice.webp',
  future:'06_card_future.webp',
  varieties:'07_card_varieties.webp',
  ranking:'08_card_ranking.webp',
  country:'09_card_location_history.webp',
  history:'09_card_location_history.webp',
  water:'10_card_water_cooking.webp',
  storage:'11_card_storage.webp',
  literature:'12_card_literature.webp',
  learn:'13_card_beginner_learning.webp',
  temp:'14_card_temp_time.webp',
  weather:'15_card_rice_condition.webp',
  glossary:'02_card_glossary.webp',
  words:'02_card_glossary.webp',
  story:'detail_world_rice_meal.webp',
  story_detail:'detail_world_rice_meal.webp',
  variety_detail:'detail_variety_book.webp',
  rice_type:'detail_rice_variety_friends.webp',
  storage_clean:'detail_storage_clean.webp',
  literature_detail:'detail_literature_library.webp',
  learning_lesson:'detail_learning_lesson.webp',
  ranking_award:'detail_ranking_award.webp',
  condition_check:'detail_condition_check.webp',
  storage_check:'detail_storage_check.webp',
  storage_clean_detail:'detail_storage_clean.webp',
  cooking_guide:'detail_cooking_guide.webp',
  literature_detail:'detail_literature_library.webp',
  research_notes:'detail_research_notes.webp',
  location_map:'detail_location_map.webp',
  local_food:'detail_local_food_research.webp',
  rice_word_detail:'detail_rice_word.webp',
  daily_fortune_detail:'detail_daily_fortune.webp',
  future_breeding:'detail_future_breeding.webp',
  future_farming:'detail_future_farming.webp',
  ranking_detail:'detail_ranking_detail.webp',
  ranking_award_detail:'detail_ranking_award.webp'
  ,
  // m89: route existing completed/accepted illustrations to more screens instead of reusing one generic image everywhere.
  'taiwan-q-texture':'detail_local_food_research.webp',
  'gohan-set-meal':'detail_world_rice_meal.webp',
  'jasmine-rice':'detail_world_rice_meal.webp',
  'bibimbap':'detail_local_food_research.webp',
  'biriyani':'detail_world_rice_meal.webp',
  'risotto':'detail_cooking_guide.webp',
  'paella':'detail_cooking_guide.webp',
  'congee':'detail_world_rice_meal.webp',
  'com-tam':'detail_local_food_research.webp',
  'bibingka':'detail_local_food_research.webp',
  'festival-mochi':'detail_rice_word.webp',
  'fried-rice':'detail_cooking_guide.webp',
  'bento-rice':'detail_rice_variety_friends.webp',
  'curry-rice':'detail_cooking_guide.webp',
  'aroma-rice':'detail_rice_variety_friends.webp',
  'rice-culture-bowl':'detail_world_rice_meal.webp',
  'gps-region':'detail_location_map.webp',
  'taiwan':'detail_local_food_research.webp',
  'japan':'detail_world_rice_meal.webp',
  'thailand':'detail_world_rice_meal.webp',
  'china':'detail_world_rice_meal.webp',
  'korea':'detail_local_food_research.webp',
  'india':'detail_world_rice_meal.webp',
  'vietnam':'detail_local_food_research.webp',
  'philippines':'detail_local_food_research.webp',
  'indonesia':'detail_world_rice_meal.webp',
  'usa':'detail_ranking_detail.webp',
  'italy':'detail_cooking_guide.webp',
  'spain':'detail_cooking_guide.webp',
  'france':'detail_research_notes.webp',
  'brazil':'detail_ranking_award.webp',
  'egypt':'detail_world_rice_meal.webp',
  'turkey':'detail_world_rice_meal.webp',
  'bangladesh':'detail_world_rice_meal.webp',
  'cambodia':'detail_local_food_research.webp',
  'basmati-type':'detail_rice_variety_friends.webp',
  'jasmine-type':'detail_rice_variety_friends.webp',
  'glutinous-rice':'detail_rice_word.webp',
  'black-rice':'detail_variety_book_alt.webp',
  'brown-rice':'detail_variety_book_alt.webp',
  'core-long-grain':'detail_rice_variety_friends.webp',
  'core-short-grain':'detail_variety_book.webp',
  'fried-rice-type':'detail_cooking_guide.webp',
  'bento-rice-type':'detail_rice_variety_friends.webp',
  'curry-rice-type':'detail_cooking_guide.webp',
  'archive-rice':'detail_variety_book.webp'

};
function appImage(name, cls, alt){
  const file = RN_APP_IMAGE_MAP[name] || name || '05_card_today_rice.webp';
  return `<span class="${esc(cls||'app-illust')} app-webp" aria-label="${esc(alt||name||'')}"><img src="${rnAsset('assets/illustrations/app/' + file)}" alt="${esc(alt||'')}" loading="lazy" decoding="async" onerror="this.closest('.app-webp')&&this.closest('.app-webp').classList.add('image-missing')"></span>`;
}
function rnSvgImg(path, cls, alt){ return ''; }
function rnIllustration(name, cls, alt){ return appImage('story_detail', cls||'rn-visual', alt||name); }
function rnStoryArt(name, cls, alt){ return appImage(name||'story', cls||'rn-visual', alt||name); }
function rnCountryArt(name, cls, alt){ return appImage(name||'history', cls||'rn-visual', alt||name); }
function rnRiceTypeArt(name, cls, alt){ return appImage(name||'variety_detail', cls||'rn-visual', alt||name); }
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

function illust(kind){ return appImage(kind, 'illust '+esc(kind), kind); }


function mascotMarkup(name, alt=''){ return ''; }


function homePictogram(name, cls='home-custom-art', alt=''){
  const key = String(name||'').trim();
  const labels = {
    glossary:'用語集', words:'用語集', varieties:'米品種図鑑', literature:'文献検索', story:'物語', hero:'物語', country:'現在地', location_map:'現在地', ranking:'ランキング', water:'水と炊飯', storage:'納米庫管理', storage_check:'納米庫管理', learn:'学ぶ', learning_lesson:'学ぶ', temp:'学ぶ', word:'米言葉', fortune:'米占い', rice:'今日のお米', weather:'米コンディション', future:'お米の未来', local_food:'地域の米文化'
  };
  const k = ({words:'glossary',hero:'story',location_map:'country',storage_check:'storage',learning_lesson:'learn',temp:'learn',local_food:'country'}[key]||key);
  const title = alt || labels[k] || labels[key] || key;
  const svgMap = {
    glossary:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><defs><linearGradient id="g1" x1="0" x2="1"><stop stop-color="#fff3c6"/><stop offset="1" stop-color="#eaf6ff"/></linearGradient></defs><circle cx="48" cy="48" r="43" fill="url(#g1)"/><rect x="28" y="22" width="34" height="48" rx="6" fill="#6d8bbf" stroke="#3f587d" stroke-width="3"/><rect x="34" y="29" width="24" height="7" rx="2" fill="#fff8df"/><path d="M37 45h15M37 55h18" stroke="#fff8df" stroke-width="4" stroke-linecap="round"/><path d="M62 57l13 13" stroke="#6a4a2c" stroke-width="6" stroke-linecap="round"/><circle cx="55" cy="50" r="15" fill="none" stroke="#6a4a2c" stroke-width="5"/><path d="M22 73c10-13 23-12 33-5" stroke="#d7a51d" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="25" cy="71" rx="4" ry="7" fill="#efc348" transform="rotate(-35 25 71)"/></svg>`,
    varieties:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#fff7dd"/><path d="M31 23h33c5 0 8 4 8 8v42H24V31c0-5 3-8 7-8z" fill="#fffaf0" stroke="#8b6a3d" stroke-width="3"/><path d="M33 34h28M33 45h20M33 56h26" stroke="#c59b5b" stroke-width="4" stroke-linecap="round"/><path d="M65 28c-14 10-15 28-10 46" stroke="#69a35c" stroke-width="4" fill="none"/><path d="M57 31c9 2 13 8 16 16M56 42c8 1 13 7 16 15" stroke="#d9a019" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="74" cy="45" rx="4" ry="8" fill="#e8b83a" transform="rotate(-24 74 45)"/><ellipse cx="71" cy="33" rx="4" ry="8" fill="#e8b83a" transform="rotate(-24 71 33)"/><circle cx="35" cy="71" r="4" fill="#fff" stroke="#d0b28a"/></svg>`,
    literature:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#eef7ff"/><path d="M23 31c10-6 22-5 31 1v37c-9-6-21-7-31-1z" fill="#fffaf0" stroke="#8b6a3d" stroke-width="3"/><path d="M54 32c7-5 16-6 24-2v37c-8-4-17-3-24 2z" fill="#fff2ce" stroke="#8b6a3d" stroke-width="3"/><path d="M31 43h14M31 53h14M62 42h10M62 52h10" stroke="#c9a978" stroke-width="3" stroke-linecap="round"/><circle cx="59" cy="58" r="14" fill="rgba(255,255,255,.55)" stroke="#465a66" stroke-width="5"/><path d="M69 68l10 10" stroke="#465a66" stroke-width="6" stroke-linecap="round"/></svg>`,
    story:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#f2fbff"/><circle cx="52" cy="42" r="21" fill="#7bb8d8" stroke="#3f7891" stroke-width="3"/><path d="M32 42h40M52 22c-6 8-8 18-6 39M52 22c7 8 9 18 7 39M35 32c10 5 24 5 34 0M35 52c10-5 24-5 34 0" stroke="#dff4ff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M23 62c11-5 20-3 29 4v13c-9-7-18-9-29-4z" fill="#fff7df" stroke="#8b6a3d" stroke-width="3"/><path d="M52 66c8-7 17-9 27-5v13c-10-4-19-2-27 5z" fill="#fff0c8" stroke="#8b6a3d" stroke-width="3"/><path d="M70 23l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#f0c247"/></svg>`,
    country:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#eef8e9"/><path d="M21 66c14-12 28-12 42-2 7 5 11 5 16 2v13H21z" fill="#d9c18d"/><path d="M20 52c17-14 35-15 56 0" stroke="#89b96a" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M49 19c-9 0-16 7-16 16 0 13 16 30 16 30s16-17 16-30c0-9-7-16-16-16z" fill="#ee6f45" stroke="#8e3c28" stroke-width="3"/><circle cx="49" cy="35" r="6" fill="#fff7df"/><ellipse cx="34" cy="73" rx="13" ry="6" fill="#fff" stroke="#d0b28a"/><path d="M65 63c-3 7-2 13 1 18" stroke="#6da65a" stroke-width="4"/><path d="M66 62c8 2 12 6 15 12" stroke="#d6a31a" stroke-width="4" fill="none"/></svg>`,
    ranking:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#fff6dc"/><rect x="38" y="36" width="20" height="36" rx="4" fill="#f0c84a" stroke="#8b6a3d" stroke-width="3"/><rect x="17" y="49" width="20" height="23" rx="4" fill="#c9d8e8" stroke="#6a7890" stroke-width="3"/><rect x="59" y="55" width="20" height="17" rx="4" fill="#dfb48a" stroke="#8b6a3d" stroke-width="3"/><text x="48" y="58" text-anchor="middle" font-size="18" font-weight="900" fill="#6a4a2c">1</text><path d="M48 19l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffd85a" stroke="#a36b00" stroke-width="2"/><path d="M22 78h52" stroke="#8b6a3d" stroke-width="4" stroke-linecap="round"/></svg>`,
    water:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#eef9ff"/><path d="M51 18c12 16 21 28 21 42 0 13-10 22-22 22S28 73 28 60c0-14 10-27 23-42z" fill="#8fd1ef" stroke="#3f7f9c" stroke-width="4"/><path d="M40 56c2 8 8 12 16 11" stroke="#e7fbff" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="31" cy="76" rx="11" ry="5" fill="#fff" stroke="#cbb487"/><ellipse cx="45" cy="77" rx="6" ry="3" fill="#fff" stroke="#cbb487"/><path d="M65 25c-4 10-3 18 2 28" stroke="#e8bd43" stroke-width="4" fill="none"/><ellipse cx="67" cy="31" rx="4" ry="8" fill="#f0c247" transform="rotate(-25 67 31)"/></svg>`,
    storage:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#fff3df"/><rect x="23" y="28" width="50" height="42" rx="7" fill="#d9b47d" stroke="#7b5430" stroke-width="4"/><path d="M31 38h34M31 50h34" stroke="#8e6337" stroke-width="4" stroke-linecap="round"/><rect x="36" y="19" width="24" height="13" rx="4" fill="#c69258" stroke="#7b5430" stroke-width="3"/><path d="M35 73c7-6 19-6 26 0" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="72" cy="67" r="7" fill="#4f3a2b"/><path d="M66 61l-5-5M78 61l5-5M66 73l-5 5M78 73l5 5" stroke="#4f3a2b" stroke-width="3" stroke-linecap="round"/><path d="M72 60v14" stroke="#fff0d9" stroke-width="2"/></svg>`,
    learn:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#f3fbeb"/><rect x="20" y="25" width="56" height="37" rx="5" fill="#517b55" stroke="#2f5533" stroke-width="4"/><path d="M30 39h24M30 49h16" stroke="#f8f0cc" stroke-width="4" stroke-linecap="round"/><path d="M39 72h18M48 63v10" stroke="#6a4a2c" stroke-width="4" stroke-linecap="round"/><path d="M65 36c-7 6-9 14-5 23" stroke="#d5a51c" stroke-width="4" fill="none"/><ellipse cx="65" cy="38" rx="4" ry="8" fill="#efc348" transform="rotate(-20 65 38)"/><path d="M25 69c10-6 18-5 26 2" stroke="#f0c247" stroke-width="3" fill="none"/></svg>`,
    word:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#fff9d8"/><path d="M25 30h46v31H43L31 74V61h-6z" fill="#fffdf0" stroke="#8b6a3d" stroke-width="4"/><path d="M36 43h24M36 53h16" stroke="#c9a15a" stroke-width="4" stroke-linecap="round"/><path d="M67 21l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#f0c247"/></svg>`,
    fortune:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#fff1fb"/><circle cx="48" cy="49" r="24" fill="#fff" stroke="#8b6a3d" stroke-width="4"/><path d="M48 22v54M21 49h54M31 32c12 8 23 8 35 0M31 66c12-8 23-8 35 0" stroke="#d8cce6" stroke-width="3" fill="none"/><path d="M49 16l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#f0c247"/><path d="M27 74c9-5 20-4 29 2" stroke="#d6a31a" stroke-width="4" fill="none"/></svg>`,
    rice:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#fff4d9"/><path d="M24 55c3 16 12 25 24 25s21-9 24-25z" fill="#e1a95f" stroke="#7b5430" stroke-width="4"/><path d="M29 54c8-9 30-9 38 0" fill="#fff" stroke="#d0b28a" stroke-width="3"/><circle cx="40" cy="48" r="4" fill="#fff" stroke="#d0b28a"/><circle cx="49" cy="45" r="4" fill="#fff" stroke="#d0b28a"/><circle cx="57" cy="49" r="4" fill="#fff" stroke="#d0b28a"/><path d="M64 22c-7 12-8 25-2 39" stroke="#6ca35b" stroke-width="4" fill="none"/><path d="M65 24c8 5 12 12 13 22" stroke="#d8a11d" stroke-width="4" fill="none"/></svg>`,
    weather:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#eef9ff"/><circle cx="32" cy="31" r="12" fill="#ffd85a" stroke="#b78200" stroke-width="3"/><path d="M43 61h27c8 0 13-5 13-12s-6-12-14-12c-3-9-12-15-22-12-8 2-13 8-14 16-7 1-12 6-12 12 0 5 4 8 12 8z" fill="#fff" stroke="#8aa4b8" stroke-width="4"/><path d="M39 70v8M52 70v8M65 70v8" stroke="#6fc0e2" stroke-width="4" stroke-linecap="round"/></svg>`,
    future:`<svg viewBox="0 0 96 96" role="img" aria-label="${esc(title)}"><circle cx="48" cy="48" r="43" fill="#f1fbec"/><path d="M48 76V48" stroke="#4f8b4a" stroke-width="5" stroke-linecap="round"/><path d="M47 49c-14-3-22-12-23-24 14 1 24 9 27 22z" fill="#9bd36e" stroke="#4f8b4a" stroke-width="3"/><path d="M49 55c15-2 24-10 28-23-15 0-26 8-31 21z" fill="#7ccf92" stroke="#4f8b4a" stroke-width="3"/><circle cx="70" cy="22" r="8" fill="#ffd85a"/><path d="M25 79h46" stroke="#d6b783" stroke-width="5" stroke-linecap="round"/></svg>`
  };
  const svg = svgMap[k];
  if(!svg) return null;
  return `<span class="${esc(cls||'home-custom-art')} home-picto home-picto-${esc(k)}" aria-label="${esc(title)}">${svg}</span>`;
}
function homeArt(name, cls='home-custom-art', alt=''){
  // TEXTRECOVERY17: use actual generated PNG/WebP illustrations for main home cards.
  return appImage(name, cls, alt||name);
}
function literatureScore(x){let s=0;const c=classifyEvidence(x); if(c==='A')s+=10;if(c==='B')s+=6;if(has(x.condition))s+=4;if(has(x.summary)&&!same(x.summary,x.title))s+=3;if(has(x.source_ids))s+=2;if(has(x.claim_ids))s+=2;return s;}
function litCards(){return (S.data?.literature?.cards||[]).map(x=>({...x,_class:classifyEvidence(x)}));}
function litSorted(){return [...litCards()].sort((a,b)=>literatureScore(b)-literatureScore(a)||String(a.id||'').localeCompare(String(b.id||'')));}
function titleOfVariety(v){
  const langTitle = S.lang==='en'?field(v,'app_title_en'):S.lang==='zh_tw'?field(v,'app_title_zh_tw'):S.lang==='zh_cn'?field(v,'app_title_zh_cn'):'';
  return langTitle || field(v,'app_title_ja_v1_7','display_name_ja','name_ja','variety_name_ja','variety_name','local_name','name') || msg('品種名は詳細で確認','Check variety name in details','品種名請在詳情確認','品种名请在详情确认');
}
function countryOfVariety(v){return field(v,'country_ja','origin_country_ja','main_production_regions','country')||msg('国・地域詳細で確認できます','Check country / region details','可在詳情確認國家・地區','可在详情确认国家・地区');}
function termName(x){return tx(x,'term')||tx(x,'title')||field(x,'term_ja')||msg('用語名は詳細で確認','Check term name in details','用語名請在詳情確認','术语名请在详情确认');}
function termNote(x){const note=tx(x,'note');if(!note||/工程カード用の統一訳語|Preferred term|工程卡統一用語|工序卡统一用语/.test(note))return msg('炊飯工程や米の状態を確認するときに使う基本用語です。関連する教材・文献と合わせて確認します。','A basic term used when checking rice-cooking steps or rice condition. Check it with related lessons and references.','這是確認炊飯工序或米飯狀態時使用的基本用語。請搭配相關教材與文獻確認。','这是确认煮饭工序或米饭状态时使用的基本术语。请搭配相关教材与文献确认。');return note;}

function relatedTermButtons(v){
  const arr=String(v||'').split(/[、,;；\/]/).map(x=>x.trim()).filter(Boolean).slice(0,8);
  return arr.length?`<div class="priority-row related-row">${arr.map(t=>`<button class="btn secondary tiny" onclick="setWordSearch('${esc(t)}')">${esc(t)}</button>`).join('')}</div>`:'';
}

function termPick(){const preferred=['浸漬','吸水','蒸らし','ほぐし','糊化','粘り','硬さ','水加減','べたつき','老化'];const arr=S.data?.glossary||[];for(const n of preferred){const f=arr.find(x=>x.term_ja===n);if(f)return f;}return pick(arr,'term');}

function storyList(){
  const w=S.data?.world_rice_stories||{};
  return w[S.lang] || w.ja || [];
}
function todayDayNo(){
  const now=new Date();
  const start=new Date(now.getFullYear(),0,0);
  const diff=now-start;
  const oneDay=1000*60*60*24;
  const n=Math.floor(diff/oneDay);
  return Math.min(365,Math.max(1,n));
}
function todayStoryIndex(){
  const arr=storyList();
  if(!arr.length) return -1;
  const day=todayDayNo();
  const idx=arr.findIndex(x=>Number(field(x,'day_no'))===day);
  return idx>=0?idx:Math.min(arr.length-1,day-1);
}
function todayStory(){
  const arr=storyList();
  const idx=todayStoryIndex();
  return idx>=0 ? arr[idx] : null;
}
function storyTitle(x){return field(x,'title')||t('worldStories');}
function storySubtitle(x){return field(x,'subtitle')||field(x,'theme')||'';}
function storyCountry(x){return field(x,'country_area')||msg('国・地域詳細で確認できます','Check country / region details','可在詳情確認國家・地區','可在详情确认国家・地区');}
function storyDateLabel(x){
  const raw=Number(field(x,'day_no')||0);
  if(!Number.isFinite(raw)||raw<1) return '';
  const d=new Date(Date.UTC(2025,0,raw)); // 365日固定。年は表示しない。
  const m=d.getUTCMonth()+1, day=d.getUTCDate();
  if(S.lang==='en') return `${m}/${day}`;
  if(S.lang==='zh_tw'||S.lang==='zh_cn') return `${m}月${day}日`;
  return `${m}月${day}日`;
}
function storyDayDateChip(x){
  const day=field(x,'day_no');
  const date=storyDateLabel(x);
  return [date, day?`${day}${t('days')}`:''].filter(Boolean).join(' / ');
}
function storyBody(x,limit=520){
  const b=String(field(x,'body')||msg('本文は詳細ページで確認します','Check the body on the detail page','本文請在詳情頁確認','正文请在详情页确认'));
  if(b.length<=limit) return b;
  return b.slice(0,limit)+'…';
}
function storyCard(x,open=false){
  if(!x) return card('今日の世界ライス物語',`${rnIllustration('daily-story-card','card-visual','世界のライス物語')}<p><b>物語詳細で確認します</b></p><p>世界の米文化・料理・食感・炊き方を1日1話で表示します。</p>`);
  const art = rnStoryArt(storyVisualNameV41i(x),'card-visual story-visual','世界のライス物語');
  return `<div class="card story-card visual-card">${art}<h2>今日の世界ライス物語</h2><p class="small">${esc(storyDayDateChip(x))} / ${esc(storyCountry(x))} / ${esc(field(x,'region')||'')}</p><h3>${esc(storyTitle(x))}</h3><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,open?2000:520)).split('\\n').join('<br>')}</p><details ${open?'open':''}><summary>炊飯・食感の視点</summary><p><b>学び：</b>${esc(field(x,'learning_point')||'詳細で確認できます')}</p><p><b>食感：</b>${esc(field(x,'texture_note')||'詳細で確認できます')}</p><p><b>炊飯：</b>${esc(field(x,'cooking_note')||'詳細で確認できます')}</p><p>${chips([field(x,'texture_keywords'),field(x,'related_terms')])}</p><p class="small">本文のあとに、炊飯・食感の見方を添えています。</p></details><div class="priority-row">${btn('future','物語一覧へ')}${btn('varieties','品種を見る')}${btn('words','辞典へ')}</div></div>`;
}


function worldRiceHeroImage(){
  return `<figure class="home-story-hero-image official-hero-image" aria-label="世界のライス物語">
    <img src="${rnAsset('assets/illustrations/app/01_world_rice_story_hero.webp')}" alt="世界の米文化と料理をめぐる、やさしい水彩イラスト" loading="eager" decoding="async">
  </figure>`;
}

function storyLeadCard(x){
  const art = worldRiceHeroImage();
  if(!x) return `<div class="card story-card visual-card home-lead-story">${art}<div class="lead-kicker">いちばん読めるメインコンテンツ</div><h2>世界のライス物語</h2><p><b>物語詳細で確認します</b></p><p>世界の米文化・料理・食感・炊き方を、ホームの先頭で読めます。</p>${btn('future','物語一覧へ')}</div>`;
  return `<div class="card story-card visual-card home-lead-story">${art}<div class="lead-kicker">今日の物語</div><h2>世界のライス物語</h2><p class="small">${esc(storyDayDateChip(x))} / ${esc(storyCountry(x))} / ${esc(field(x,'region')||'')}</p><h3>${esc(storyTitle(x))}</h3><p class="story-subtitle"><b>${esc(storySubtitle(x))}</b></p><p class="story-readable">${esc(storyBody(x,390)).split('\n').join('<br>')}</p><div class="priority-row">${btn('future','365日の物語を見る')}</div></div>`;
}

function dailyRiceWord(){
  const arr=S.data?.daily_rice_words||[];
  const x=Array.isArray(arr)&&arr.length?pick(arr,'daily_rice_word'):null;
  if(!x) return null;
  return {
    id:field(x,'word_id'),
    category:field(x,'category'),
    title:tx(x,'title')||field(x,'title_ja'),
    meaning:tx(x,'meaning')||field(x,'meaning_ja'),
    message:tx(x,'message')||field(x,'message_ja'),
    note:field(x,'note_ja'),
    related:field(x,'related_card_id'),
    provisional:false
  };
}
function dailyFortune(){
  const rf=S.data?.rice_fortune||{}, arr=rf.items||[];
  const x=Array.isArray(arr)&&arr.length?pick(arr,'rice_fortune_item'):null;
  if(!x) return null;
  return {
    id:field(x,'fortune_id'),
    title:tx(x,'title')||field(x,'title_ja')||field(x,'theme_key')||'今日の米占い',
    message:tx(x,'message')||field(x,'message_ja'),
    one:tx(x,'one_word')||field(x,'one_word_ja'),
    number:field(x,'lucky_number_ja','lucky_number'),
    rice:field(x,'lucky_rice_ja'),
    process:field(x,'lucky_process_ja'),
    related:field(x,'related_card_id'),
    category:field(x,'category')
  };
}
const JP_PREFS=['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];

const VARIETY_PUBLIC_PROFILES={
  'あいちのかおり':{region:'日本 / 愛知県', feature:'大粒で、つやと粘りのバランスがよく、粒感のあるしっかりした食感が特徴です。', use:'白ごはん / 寿司 / 丼もの / チャーハン / ピラフ', summary:'愛知県を代表する、大粒で食べごたえのある米品種です。白ごはんだけでなく、寿司や丼ものなどのお米料理にも使いやすい品種です。'},
  '龍の瞳':{region:'日本 / 岐阜県・下呂市周辺', feature:'大粒で、甘みがあり、もっちりした食感が特徴の高級ブランド米です。', use:'白ごはん / 贈答用 / 高級米 / 特別な食卓', summary:'岐阜県下呂市発祥の、大粒でもっちり甘みのある高級ブランド米です。特別感のある白ごはんとして楽しみやすい品種です。'},
  '雪若丸':{region:'日本 / 山形県', feature:'粒立ちがよく、しっかりした食感が出やすい山形県のブランド米です。', use:'白ごはん / 丼もの / カレー / おにぎり', summary:'山形県のブランド米で、粒立ちとしっかりした食感を楽しみやすい品種です。'},
  '青天の霹靂':{region:'日本 / 青森県', feature:'ほどよい粘りと粒感のバランスがよく、すっきり食べやすい青森県のブランド米です。', use:'白ごはん / 和食 / おにぎり', summary:'青森県のブランド米で、粘りと粒感のバランスがよく、毎日の白ごはんとして食べやすい品種です。'},
  '新之助':{region:'日本 / 新潟県', feature:'大粒で、コクと甘みがあり、冷めても食味が落ちにくいとされる新潟県のブランド米です。', use:'白ごはん / おにぎり / 弁当 / 贈答用', summary:'新潟県のブランド米で、大粒感、甘み、冷めても食べやすい点が特徴です。'},
  'さがびより':{region:'日本 / 佐賀県', feature:'つやがあり、甘みと粘りのバランスがよい佐賀県のブランド米です。', use:'白ごはん / おにぎり / 家庭用', summary:'佐賀県のブランド米で、つや・甘み・粘りのバランスがよい品種です。'},
  'ミネアサヒ':{region:'日本 / 愛知県・中山間地域', feature:'愛知県の中山間地域などで作られる、粒感と食味のよさで知られる品種です。', use:'白ごはん / 地域米 / 和食', summary:'愛知県の山間部などで親しまれる、地域性のある米品種です。'},
  '愛ひとつぶ':{region:'日本 / 愛知県', feature:'愛知県で育成されたブランド米で、つや、甘み、粘りのバランスを楽しみやすい品種です。', use:'白ごはん / 家庭用 / 贈答用', summary:'愛知県のブランド米として、毎日の白ごはんにも使いやすい品種です。'}
};
function varietyProfile(v){ return null; }
const INTERNAL_WORDS=/候補|整理しています|整理し|確認できる資料|未確認|関係は[「\"]?高|関係は「?高|データ上|source_type|status|priority|claim|field note|ref_id|管理用|公開前|保留|未作成|表示しない|アプリ非表示|source_ids|release_status|component_status|app_card_status/i;
function cleanPublicText(x){
  let s=norm(traceText(x));
  if(!s || s==='null' || s==='undefined') return '';
  s=s.replace(/;/g,'、').replace(/；/g,'、').replace(/\s*\/\s*/g,' / ')
     .replace(/ジャポニカ候補/g,'ジャポニカ系')
     .replace(/短粒候補/g,'短粒系')
     .replace(/地域主要候補/g,'地域で知られる品種')
     .replace(/業務用途確認済/g,'業務用途の情報あり')
     .replace(/候補確認済/g,'')
     .replace(/として整理しています。?/g,'です。')
     .replace(/として整理し.*?。/g,'')
     .replace(/確認できる資料で、/g,'')
     .replace(/確認できる資料/g,'')
     .replace(/業務用途との関係は「?高」?です。?/g,'業務用・加工用途でも見られる品種です。')
     .replace(/香りメモ：未確認。?/g,'')
     .replace(/未確認のため表示しない。?/g,'')
     .replace(/未確認[:：][^。]*/g,'')
     .replace(/未確認/g,'')
     .replace(/候補/g,'')
     .replace(/\s+/g,' ')
     .replace(/、\s*、/g,'、')
     .replace(/^、|、$/g,'')
     .trim();
  if(!s || INTERNAL_WORDS.test(s)) return '';
  return s;
}
function publicValue(x, fallback='詳細で確認できます'){
  const s=cleanPublicText(x);
  return s || fallback;
}
function maybeLine(label, value){
  const v=cleanPublicText(value);
  return v ? `<p><b>${esc(label)}：</b>${esc(v)}</p>` : '';
}
function userFriendlyUnknown(label='情報'){
  return `${label}は、資料を確認できた範囲で順次追記します。`;
}

function varietyEnglishSafeText(v){
  const s=String(v||'');
  if(!s) return '';
  // Variety names may contain native characters; this helper is only for generated English explanatory text.
  if(/[ぁ-んァ-ン一-龥]/.test(s)) return '';
  return s;
}

function localizedField(obj, base){
  const L=S.lang;
  const keys={
    ja:[base+'_ja',base],
    en:[base+'_en',base],
    zh_tw:[base+'_zhTW',base+'_zh_tw',base],
    zh_cn:[base+'_zhCN',base+'_zh_cn',base]
  }[L]||[base+'_ja',base];
  const bad=(v)=>{const s=String(v||''); if(!s)return true; if(L==='en')return /[ぁ-んァ-ン]/.test(s); if(L==='zh_tw'||L==='zh_cn')return /[ぁ-んァ-ン]/.test(s); return false;};
  for(const k of keys){ if(has(obj&&obj[k])&&!bad(obj[k])) return obj[k]; }
  const ja=(obj&&(obj[base+'_ja']||obj[base]))||'';
  if(L!=='ja'&&has(ja)) return msg(ja,`Translation in review: ${ja}`,`翻譯確認中：${ja}`,`翻译确认中：${ja}`);
  return ja;
}
function localizedWaterPhrase(rule){
  const label=localizedField(rule,'class')||localizedField(rule,'rule_name')||field(rule,'parameter','item');
  const advice=localizedField(rule,'advice')||localizedField(rule,'benefit')||localizedField(rule,'meaning')||localizedField(rule,'note')||msg('炊飯での見方を確認','Check rice-cooking view','確認炊飯觀察方式','确认煮饭观察方式');
  return simpleWaterPhrase(field(rule,'parameter','rule_name','item'),label,field(rule,'min_value'),field(rule,'max_value'),field(rule,'unit'),advice);
}
function storageField(row, base){return localizedField(row,base)||publicFallback(base);}

function simpleWaterPhrase(parameter, className, min, max, unit, advice){
  const p=waterParamLabel(parameter), range=rangeText(min,max,unit);
  const cls=cleanPublicText(className)||msg('分類','class','分類','分类');
  const jaNote=cleanPublicText(advice)||'炊飯では、硬さ・粘り・粒感の出方を見る目安にします。';
  if(S.lang==='en') return `${p} ${range} is a guide for ${cls}. Use it as a cooking hint for firmness, stickiness, and grain separation.`;
  if(S.lang==='zh_tw') return `${p} ${range} 是「${cls}」的參考。可作為觀察硬度、黏性與粒粒分明的炊飯線索。`;
  if(S.lang==='zh_cn') return `${p} ${range} 是“${cls}”的参考。可作为观察硬度、黏性与颗粒感的煮饭线索。`;
  return `${p} ${range} は「${cls}」の目安です。${jaNote}`;
}
function isBadSummaryText(x){
  const s=String(x||'');
  return !s || /候補|整理|確認済|未確認|関係は|香りメモ|データ上|業務用途との関係|公開候補|表示しない/.test(s);
}
function friendlySourceHTML(urls){
  const list=String(urls||'').split(/[;；\s]+/).map(norm).filter(u=>/^https?:/.test(u));
  if(!list.length) return `<div class="source">${msg('参考資料','Reference','參考資料','参考资料')}：${msg('資料欄で確認します','Check the source field','請在資料欄確認','请在资料栏确认')}</div>`;
  return `<div class="source"><b>${msg('参考資料','Reference','參考資料','参考资料')}</b><br>${list.slice(0,3).map(u=>esc(u)).join('<br>')}</div>`;
}
function prefFromText(...vals){
  const text=vals.map(v=>String(v||'')).join(' / ');
  return JP_PREFS.filter(p=>text.includes(p));
}
function countryOfVariety(v){return field(v,'country_ja','origin_country_ja','country','country_en')||'地域は詳細で確認できます';}
function varietyBaseName(v){return (titleOfVariety(v||{}).replace(/｜.*$/,'') || field(v,'display_name_ja','variety_name','local_name') || '品種名は詳細で確認').trim();}
function varietyRegionLabel(v){
  const prof=varietyProfile(v||{}); if(prof&&prof.region) return prof.region;
  const country=countryOfVariety(v||{});
  const prod=cleanPublicText(field(v,'main_production_regions'));
  const origin=cleanPublicText(field(v,'origin_country_ja'));
  const hints=[prod,origin,field(v,'notes'),field(v,'app_detail_note_ja_v1_6'),field(v,'source_urls'),field(v,'tags')];
  const prefs=prefFromText(...hints);
  if(country==='日本'){
    if(prod && prod!=='日本') return `日本 / ${prod}`;
    if(prefs.length) return `日本 / ${prefs.slice(0,2).join('・')}`;
    return '日本';
  }
  if(prod && prod!==country) return `${country} / ${prod}`;
  return country;
}
function varietyUseLabel(v){
  const prof=varietyProfile(v||{}); if(prof&&prof.use) return prof.use;
  const s=cleanPublicText(field(v,'use_category_primary','main_uses','business_uses','use_category_secondary'));
  if(!s) return msg('用途は詳細で確認できます','Uses can be checked in details.','用途可在詳情確認。','用途可在详情确认。');
  return s.replace(/業務用白飯/g,'白飯・業務用').replace(/白飯・主食/g,'白ごはん・主食');
}
function varietyFeatureLabel(v){
  const prof=varietyProfile(v||{}); if(prof&&prof.feature) return prof.feature;
  const locDetail=localizedField(v,'app_detail_note');
  if(S.lang!=='ja' && locDetail && !jpTextLike(locDetail)) return locDetail;
  const name=varietyBaseName(v||{});
  const notes=String(field(v,'notes')||'');
  const tags=cleanPublicText(field(v,'texture_tags','tags'));
  const use=varietyUseLabel(v||{});
  if(name==='とよめき') return '粘りが強すぎず、冷凍米飯や加工米飯などにも使いやすい品種です。';
  if(/冷凍米飯|加工米飯|加工用/.test(notes+use)) return '粘りや食感の出方を見ながら、加工米飯・業務用途でも使われる品種です。';
  const detail=cleanPublicText(field(v,'app_detail_note_ja_v1_6','app_detail_note_ja'));
  if(detail && !isBadSummaryText(detail)) return detail.split('。').filter(Boolean).slice(0,2).join('。')+'。';
  const summary=cleanPublicText(field(v,'public_summary_ja'));
  if(summary && !isBadSummaryText(summary)) return summary;
  if(tags) return tags;
  const rice=cleanPublicText(field(v,'rice_type'));
  const grain=cleanPublicText(field(v,'grain_shape'));
  return [rice,grain].filter(has).join('、') || '特徴は、用途・地域・出典情報と合わせて確認します。';
}
function varietyReadableSummary(v){
  if(!v) return '品種図鑑で用途や特徴を確認します。';
  const prof=varietyProfile(v||{}); if(prof&&prof.summary) return prof.summary;
  const locSummary=localizedField(v,'app_summary');
  if(S.lang!=='ja' && locSummary && !jpTextLike(locSummary)) return locSummary;
  const name=varietyBaseName(v);
  const region=varietyRegionLabel(v);
  const summary=cleanPublicText(field(v,'public_summary_ja'));
  if(summary && !isBadSummaryText(summary)) return summary;
  const feature=varietyFeatureLabel(v);
  const use=varietyUseLabel(v);
  const parts=[];
  if(region && region!=='地域詳細で確認できます') parts.push(`${name}は、${region}で知られる米品種です。`);
  else parts.push(`${name}は、米品種図鑑に収録されている品種です。`);
  if(feature && feature!=='特徴は、用途・地域・出典情報と合わせて確認します。') parts.push(feature);
  if(use && use!==msg('用途は詳細で確認できます','Uses can be checked in details.','用途可在詳情確認。','用途可在详情确认。')) parts.push(`主な用途は${use}です。`);
  return parts.join(' ');
}
function varietyShort(v){
  const t=titleOfVariety(v||{});
  const meta=varietyRegionLabel(v||{});
  const body=varietyReadableSummary(v||{});
  return {title:t, meta, body, feature:varietyFeatureLabel(v||{}), use:varietyUseLabel(v||{})};
}

function jpTextLike(s){return /[ぁ-んァ-ン一-龥]/.test(String(s||''));}
function localizeCountryName(x){
  const s=norm(x);
  const map={
    '日本':['Japan','日本','日本'], '台湾':['Taiwan','台灣','台湾'], 'タイ':['Thailand','泰國','泰国'], '中国':['China','中國','中国'],
    '韓国':['South Korea','韓國','韩国'], 'ベトナム':['Vietnam','越南','越南'], 'インド':['India','印度','印度'],
    '米国':['United States','美國','美国'], 'アメリカ':['United States','美國','美国'], 'イタリア':['Italy','義大利','意大利'],
    'スペイン':['Spain','西班牙','西班牙'], 'フランス':['France','法國','法国'], 'オーストラリア':['Australia','澳洲','澳大利亚']
  };
  if(S.lang==='ja') return s;
  if(map[s]) return S.lang==='en'?map[s][0]:S.lang==='zh_tw'?map[s][1]:map[s][2];
  return s;
}
function varietyTermMapText(x){
  let s=cleanPublicText(x);
  if(!s) return '';
  const maps={
    en:[['白ごはん','plain white rice'],['白飯','white rice'],['主食','staple rice'],['家庭用','home use'],['贈答用','gift use'],['業務用','foodservice use'],['加工用','processing use'],['香り米','aromatic rice'],['もち米','glutinous rice'],['短粒','short grain'],['中粒','medium grain'],['長粒','long grain'],['低アミロース','low amylose'],['高アミロース','high amylose'],['たんぱく質','protein'],['粘り','stickiness'],['甘み','sweetness'],['つや','gloss'],['食感','texture'],['硬さ','firmness'],['冷凍米飯','frozen cooked rice'],['加工米飯','processed cooked rice'],['詳細で確認できます','Check in details'],['詳細で確認','Check in details']],
    zh_tw:[['白ごはん','白飯'],['白飯','白飯'],['主食','主食'],['家庭用','家庭用'],['贈答用','禮品用'],['業務用','業務用'],['加工用','加工用'],['香り米','香米'],['もち米','糯米'],['短粒','短粒'],['中粒','中粒'],['長粒','長粒'],['低アミロース','低直鏈澱粉'],['高アミロース','高直鏈澱粉'],['たんぱく質','蛋白質'],['粘り','黏性'],['甘み','甜味'],['つや','光澤'],['食感','口感'],['硬さ','硬度'],['冷凍米飯','冷凍米飯'],['加工米飯','加工米飯'],['詳細で確認できます','可在詳情確認'],['詳細で確認','可在詳情確認']],
    zh_cn:[['白ごはん','白米饭'],['白飯','白米饭'],['主食','主食'],['家庭用','家庭用'],['贈答用','礼品用'],['業務用','商用'],['加工用','加工用'],['香り米','香米'],['もち米','糯米'],['短粒','短粒'],['中粒','中粒'],['長粒','长粒'],['低アミロース','低直链淀粉'],['高アミロース','高直链淀粉'],['たんぱく質','蛋白质'],['粘り','黏性'],['甘み','甜味'],['つや','光泽'],['食感','口感'],['硬さ','硬度'],['冷凍米飯','冷冻米饭'],['加工米飯','加工米饭'],['詳細で確認できます','可在详情确认'],['詳細で確認','可在详情确认']]
  };
  if(S.lang==='ja') return s;
  (maps[S.lang]||[]).forEach(([a,b])=>{s=s.split(a).join(b)});
  return s;
}
function varietyDisplayText(x, kind='text'){
  const s=varietyTermMapText(x);
  if(!s) return '';
  if(S.lang!=='ja' && jpTextLike(s)) return reviewText(s);
  return s;
}
function varietyRegionDisplay(v){
  const raw=varietyRegionLabel(v);
  if(S.lang==='ja') return raw;
  const parts=String(raw||'').split('/').map(x=>x.trim()).filter(Boolean);
  if(!parts.length) return msg('地域は詳細で確認できます','Check region in details','地區可在詳情確認','地区可在详情确认');
  return parts.map((part,i)=>i===0?localizeCountryName(part):varietyDisplayText(part)).join(' / ');
}
function varietyUseDisplay(v){return varietyDisplayText(varietyUseLabel(v)) || msg('用途は詳細で確認できます','Uses can be checked in details','用途可在詳情確認','用途可在详情确认');}
function varietyFeatureDisplay(v){return varietyDisplayText(varietyFeatureLabel(v)) || msg('特徴は詳細データで確認します。','Check detailed data for traits.','可在詳細資料確認特徵。','可在详细资料确认特征。');}
function varietySummaryDisplay(v){
  const s=varietyReadableSummary(v);
  if(S.lang==='ja') return s;
  const mapped=varietyTermMapText(s);
  return jpTextLike(mapped)?reviewText(mapped):mapped;
}
function varietyBodyDisplay(v){
  const raw=field(v,'restored_body_ja','body_ja','app_detail_note_ja','body','description');
  const s=cleanPublicText(raw);
  if(!s) return '';
  if(S.lang==='ja') return s;
  const mapped=varietyTermMapText(s);
  return jpTextLike(mapped)?reviewText(mapped):mapped;
}
function varietyCompositionText(x){
  const s=varietyTermMapText(x);
  return (S.lang!=='ja' && jpTextLike(s))?reviewText(s):s;
}



// m89: public data/meta cleanup. Keep links mapped to existing views, route completed illustrations more broadly, and reduce user-facing/internal wording leakage.
function varietyPrefectureFromTextM71(...vals){
  const text=vals.map(v=>String(v||'')).join(' / ');
  const pairs=[['北海道','北海道'],['青森','青森県'],['岩手','岩手県'],['宮城','宮城県'],['秋田','秋田県'],['山形','山形県'],['福島','福島県'],['茨城','茨城県'],['栃木','栃木県'],['群馬','群馬県'],['埼玉','埼玉県'],['千葉','千葉県'],['東京','東京都'],['神奈川','神奈川県'],['新潟','新潟県'],['富山','富山県'],['石川','石川県'],['福井','福井県'],['山梨','山梨県'],['長野','長野県'],['岐阜','岐阜県'],['静岡','静岡県'],['愛知','愛知県'],['三重','三重県'],['滋賀','滋賀県'],['京都','京都府'],['大阪','大阪府'],['兵庫','兵庫県'],['奈良','奈良県'],['和歌山','和歌山県'],['鳥取','鳥取県'],['島根','島根県'],['岡山','岡山県'],['広島','広島県'],['山口','山口県'],['徳島','徳島県'],['香川','香川県'],['愛媛','愛媛県'],['高知','高知県'],['福岡','福岡県'],['佐賀','佐賀県'],['長崎','長崎県'],['熊本','熊本県'],['大分','大分県'],['宮崎','宮崎県'],['鹿児島','鹿児島県'],['沖縄','沖縄県']];
  const out=[];
  pairs.forEach(([key,label])=>{if(text.includes(key)&&!out.includes(label))out.push(label)});
  return out;
}
function varietyCleanDisplayM71(x){
  let s=cleanPublicText(x);
  if(!s) return '';
  if(/用途出典|追加確認|現時点|まとめています|まとめていますが|整理しています|要確認|管理用|公開前|断定表示|表示優先|出典は|確認のため|香りメモ|詳細で確認|扱い/.test(s)) return '';
  return s;
}
function varietyRegionLabel(v){
  const prof=varietyProfile(v||{}); if(prof&&prof.region) return prof.region;
  const country=countryOfVariety(v||{});
  const prod=varietyCleanDisplayM71(field(v,'main_production_regions'));
  const origin=varietyCleanDisplayM71(field(v,'origin_country_ja'));
  const prefs=varietyPrefectureFromTextM71(prod,origin,field(v,'notes'),field(v,'source_urls'),field(v,'tags'),field(v,'source_ids'));
  if(country==='日本'){
    if(prod && prod!=='日本') return `日本 / ${prod}`;
    if(prefs.length) return `日本 / ${prefs.slice(0,2).join('・')}`;
    return '日本';
  }
  if(prod && prod!==country) return `${country} / ${prod}`;
  return country||msg('地域は出典欄で確認できます','Region can be checked in sources','地區可在出處欄確認','地区可在出处栏确认');
}
function varietyUseLabel(v){
  const prof=varietyProfile(v||{}); if(prof&&prof.use) return prof.use;
  const raw=varietyCleanDisplayM71(field(v,'use_category_primary','main_uses','use_category_secondary','business_uses'));
  if(!raw) return msg('白ごはん・主食など','plain rice and staple use','白飯・主食等','白米饭・主食等');
  return raw.replace(/業務用白飯/g,'白飯・業務用').replace(/白飯・主食/g,'白ごはん・主食').replace(/弁当・中食/g,'弁当・おにぎり・中食');
}
function varietyTypeGrainTextM71(v){
  const rice=varietyCleanDisplayM71(field(v,'rice_type'));
  const grain=varietyCleanDisplayM71(field(v,'grain_shape'));
  const parts=[];
  if(rice) parts.push(rice);
  if(grain) parts.push(grain);
  return parts.join('、');
}
function varietyCompositionPhraseM71(v){
  const amy=varietyCleanDisplayM71(field(v,'amylose_range','amylose_value','amylose_class'));
  const pro=varietyCleanDisplayM71(field(v,'protein_range','protein_value','protein_class'));
  const arr=[];
  if(amy) arr.push(`アミロース ${amy}`);
  if(pro) arr.push(`たんぱく質 ${pro}`);
  return arr.join(' / ');
}
function varietyFeatureLabel(v){
  const prof=varietyProfile(v||{}); if(prof&&prof.feature) return prof.feature;
  const name=varietyBaseName(v||{});
  const type=varietyTypeGrainTextM71(v||{});
  const comp=varietyCompositionPhraseM71(v||{});
  const tags=varietyCleanDisplayM71(field(v,'texture_tags','tags'));
  if(name==='はえぬき') return '山形県で知られる日本の米品種で、ほどよい粘りと粒感のバランスがあり、白ごはんやおにぎりにも使いやすい品種です。';
  if(name==='とよめき') return '粘りが強すぎず、冷凍米飯や加工米飯などにも使いやすい品種です。';
  if(tags && !/業務用寄り|日本米|台湾米|詳細/.test(tags)) return tags;
  if(comp) return `${type?type+'の米で、':''}${comp} が資料上の目安として記録されています。`;
  if(type) return `${type}の米品種です。食味や炊き方の細部は、出典欄の情報と合わせて確認できます。`;
  return '産地、粒形、食味、用途を出典欄と合わせて確認できる米品種です。';
}
function varietyReadableSummary(v){
  if(!v) return '米品種図鑑で産地、特徴、用途を確認します。';
  const prof=varietyProfile(v||{}); if(prof&&prof.summary) return prof.summary;
  const name=varietyBaseName(v);
  const region=varietyRegionLabel(v);
  const type=varietyTypeGrainTextM71(v);
  const feature=varietyFeatureLabel(v);
  const use=varietyUseLabel(v);
  const head = region ? `${name}は、${region}で知られる米品種です。` : `${name}は、米品種図鑑に収録されている米品種です。`;
  const typeLine = type ? `${type}として整理しています。`.replace('として整理しています','の品種です') : '';
  const useLine = use ? `主な使われ方は${use}です。` : '';
  return [head,typeLine,feature,useLine].filter(Boolean).join(' ');
}
function varietySummaryDisplay(v){
  const s=varietyReadableSummary(v);
  if(S.lang==='ja') return s;
  const name=varietyBaseName(v||{}), region=varietyRegionDisplay(v||{}), use=varietyUseDisplay(v||{}), feature=varietyFeatureDisplay(v||{});
  if(S.lang==='en') return `${name} is a rice variety associated with ${region}. Main use: ${use}. Traits: ${feature}`;
  if(S.lang==='zh_tw') return `${name}是與${region}相關的米品種。主要用途：${use}。特徵：${feature}`;
  if(S.lang==='zh_cn') return `${name}是与${region}相关的米品种。主要用途：${use}。特征：${feature}`;
  return s;
}

function conditionSummary(){
  return {title:t('waterRice'), body:msg('選んだ地域の水質情報を見ながら、硬度・pH・残留塩素と炊飯の関係を確認します。数値が見つからない地域では、参考リンクから確認できます。最後は、その水で炊く時の硬さ・粘り・香り・水加減の見方へつなげます。','Check hardness, pH, residual chlorine, and how they relate to rice cooking for the selected area. If local numbers are not available, reference links are shown. The final view connects the water to firmness, stickiness, aroma, and water adjustment.','參考所選地區的水質資訊，確認硬度、pH、餘氯與炊飯的關係。沒有數值時會顯示參考連結。最後連到用這種水煮飯時的硬度、黏性、香氣與水量調整。','参考所选地区的水质信息，确认硬度、pH、余氯与煮饭的关系。没有数值时会显示参考链接。最后连接到用这种水煮饭时的硬度、黏性、香气与水量调整。')};
}
function futureShort(f){
  return {title:futureTitle(f)||t('riceFuture'), body:futureSubtitle(f)||futureBody(f)||t('riceFuture')};
}
function futureTitle(x){return tx(x,'title')||field(x,'title_ja','title')||'未来テーマ';}
function futureSubtitle(x){return tx(x,'subtitle')||field(x,'subtitle_ja')||'';}
function futureBody(x){return tx(x,'body')||field(x,'body_ja','summary_ja','text_ja')||msg('本文は詳細ページで確認します','Check the body on the detail page','本文請在詳情頁確認','正文请在详情页确认');}
function setStoryDetail(i){S.filters.storyDetail=String(i);S.filters.futureDetail='';switchView('future');}
function setFutureDetail(i){S.filters.futureDetail=String(i);S.filters.storyDetail='';switchView('future');}
function setLitDetail(i){S.filters.litDetail=String(i);switchView('literature');}

function dailyCardsHTML(variety,learn,lit,term,future){
  const word=dailyRiceWord(), vf=varietyShort(variety||{}), ft=dailyFortune(), cond=conditionSummary(), fut=futureShort(future||{});
  const fidx=(S.data?.future_rice||[]).indexOf(future);
  const wordHTML=word?`<button type="button" class="daily-mini daily-word" data-go="words" onclick="setGlossarySearch('${esc(word.title||word.meaning||'')}')">${homeArt('word','daily-illust','米言葉')}<span>${t('todayRiceWord')}</span><b>${esc(word.title)}</b><em>${esc(word.meaning)}<br>${esc(word.message)}</em></button>`:'';
  const fortuneHTML=ft?`<button type="button" class="daily-mini daily-fortune" data-go="words" onclick="setFortuneSearch('${esc(ft.process||ft.rice||ft.title)}')">${homeArt('fortune','daily-illust','米占い')}<span>${t('todayFortune')}</span><b>${esc(ft.title)}</b><em>${t('luckyNumber')}：${esc(ft.number)} / ${t('luckyRice')}：${esc(ft.rice)} / ${t('luckyProcess')}：${esc(ft.process)}<br>${esc(ft.one)}<br>${esc(ft.message)}</em></button>`:'';
  return `<section class="home-section"><div class="section-head"><h2>${t('dailyDiscovery')}</h2><span class="section-note">${msg('気になるカードを選んでください','Choose a card that interests you','請選擇感興趣的卡片','请选择感兴趣的卡片')}</span></div>
  <div class="daily-card-row">
    ${wordHTML}
    ${fortuneHTML}
    <button type="button" class="daily-mini daily-rice" data-go="varieties" onclick="setVarietySearch('${esc(vf.title)}')">${homeArt('rice','daily-illust',t('todayRice'))}<span>${t('todayRice')}</span><b>${esc(vf.title)}</b><em>${esc(vf.meta)} / ${esc(vf.body)}</em></button>
    <button type="button" class="daily-mini daily-condition" data-go="check" onclick="switchView('check')">${homeArt('weather','daily-illust','米コンディション')}<span>${t('todayCondition')}</span><b>${esc(cond.title)}</b><em>${esc(cond.body)}</em></button>
    <button type="button" class="daily-mini daily-future" data-go="future" onclick="setFutureDetail(${fidx<0?0:fidx})">${homeArt('future','daily-illust',t('riceFuture'))}<span>${t('riceFuture')}</span><b>${esc(fut.title)}</b><em>${esc(fut.body)}</em></button>
  </div></section>`;
}

function countryHistoryCard(){
  const title=t('locationHistory');
  return `<div class="card visual-card">${homeArt('location_map','card-visual','現在地ヒストリー')}<h2>${title}</h2><p><b>${msg('今いる国・地域に関係する米文化、料理、品種、歴史を紹介します。','Introduces rice culture, dishes, varieties, and history connected to your current country or region.','介紹與目前所在國家或地區相關的米食文化、料理、品種與歷史。','介绍与当前所在国家或地区相关的米食文化、料理、品种与历史。')}</b></p><div class="inline-story-visual">${homeArt('local_food','inline-visual','地域の米料理')}</div><p>${msg('たとえば台湾にいる日は、台湾の米文化や代表的な料理、食感の好み、関連する物語へ進めます。','For example, when you are in Taiwan, it leads to Taiwanese rice culture, representative dishes, texture preferences, and related stories.','例如在台灣時，可連到台灣的米食文化、代表料理、口感偏好與相關故事。','例如在台湾时，可连接到台湾的米食文化、代表料理、口感偏好与相关故事。')}</p><button class="btn secondary" onclick="switchView('future')">${msg('この地域の米文化を見る','See rice culture for this area','查看這個地區的米食文化','查看这个地区的米食文化')}</button></div>`;
}

function exploreTile(view, key, title, text){
  return `<a href="#${esc(view)}" class="explore-tile" data-go="${esc(view)}" aria-label="${esc(title)}">${homeArt(key,'explore-illust',title)}<b>${esc(title)}</b><span>${esc(text)}</span></a>`;
}
function riceWeatherConceptCard(){
  return card(t('todayCondition'),`${homeArt('weather','illust home-mini-illust',t('todayCondition'))}<p><b>${msg('気温・湿度から、米の保管で気をつけたい点を確認します。','Use temperature and humidity as hints for rice storage care.','從氣溫與濕度確認保存米時要注意的地方。','从气温与湿度确认保存米时要注意的地方。')}</b></p><p><b>${msg('保管注意','Storage note','保存提醒','保存提醒')}：</b>${msg('高湿度の日は米袋周辺、壁際、床、納米庫内壁、残米を確認します。','On humid days, check around rice bags, walls, floors, storage-bin inner walls, and remaining rice.','高濕度日要確認米袋周邊、牆邊、地面、納米庫內壁與殘米。','高湿度日要确认米袋周边、墙边、地面、纳米库内壁与残米。')}</p><p><b>${msg('結露注意','Condensation note','結露提醒','结露提醒')}：</b>${msg('外気と庫内・室内の温度差が大きい日は、水滴、濡れた付着米、カビ臭、虫、変色を先に見ます。','When the temperature gap is large, check for water drops, wet attached rice, mold odor, insects, and discoloration first.','外氣與庫內或室內溫差大時，先看水滴、濕黏米、霉味、蟲害與變色。','外气与库内或室内温差大时，先看水滴、湿黏米、霉味、虫害与变色。')}</p><p class="small">${msg('気温や湿度は、保管と炊飯の注意を見るための参考として使います。','Temperature and humidity are used as hints for storage and rice-cooking care.','氣溫與濕度會作為保存與炊飯提醒的參考。','气温与湿度会作为保存与煮饭提醒的参考。')}</p>${btn('check',t('check'))}`);
}

function todayPriorityCard(){
  const story=todayStory(), word=dailyRiceWord(), ft=dailyFortune();
  return card(msg('今日見る3つ','Three to check today','今天看的三項','今天看的三项'),`<ol class="focus-list"><li><b>${t('worldStories')}：</b>${esc(storyTitle(story||{}))}</li><li><b>${t('todayRiceWord')}：</b>${esc(word?.title||msg('米言葉を準備中','Rice word is being prepared','米語準備中','米语准备中'))}</li><li><b>${t('todayFortune')}：</b>${esc(ft?.title||msg('米占いを準備中','Rice fortune is being prepared','米占卜準備中','米占卜准备中'))} / ${esc(ft?.number||'')} / ${esc(ft?.process||'')}</li></ol><p class="small">${msg('ホーム上では短く見せ、詳細は各機能へ進みます。','The home screen stays brief; details are opened from each feature.','首頁只短短呈現，詳情從各功能進入。','首页只简短呈现，详情从各功能进入。')}</p>`);
}






function setWordSearch(q){S.filters.wordq=q||'';switchView('words');}
function setFortuneSearch(q){
  S.filters.wordq=String(q||'');
  S.filters.gcat='';
  S.filters.wordcat='';
  switchView('words');
}
function setVarietySearch(q){
  S.filters.varq=String(q||'');
  S.filters.country='';
  S.filters.use='';
  S.filters.texture='';
  S.filters.amy='';
  S.filters.protein='';
  switchView('varieties');
}
function setGlossarySearch(q){
  S.filters.wordq=String(q||'');
  S.filters.gcat='';
  S.filters.wordcat='';
  switchView('words');
}
function setLearnSearch(q){
  S.filters.learn=String(q||'');
  S.filters.level='';
  switchView('learn');
}

const RN_VALID_VIEWS=['home','learn','literature','varieties','check','future','rankings','words'];
let RN_HASH_LOCK=false;
let RN_VIEW_STACK=[];
function normalizeView(v){
  v=String(v||'home').replace(/^#/,'').trim();
  const aliases={dictionary:'words',glossary:'words',terms:'words',word:'words',story:'future',stories:'future',futureStory:'future',worldStories:'future',condition:'check',confirm:'check',water:'check',storage:'check',encyclopedia:'varieties',variety:'varieties',riceVarieties:'varieties',ranking:'rankings'};
  v=aliases[v]||v;
  return RN_VALID_VIEWS.includes(v)?v:'home';
}
function goView(v){switchView(normalizeView(v));return false;}
function goBack(){
  const prev=RN_VIEW_STACK.pop() || 'home';
  switchView(prev,{fromBack:true});
  return false;
}
function syncHash(v){
  if(!window.history||RN_HASH_LOCK) return;
  const next='#'+normalizeView(v);
  if(location.hash!==next){RN_HASH_LOCK=true; history.replaceState(null,'',next); setTimeout(()=>{RN_HASH_LOCK=false;},0);}
}
function switchView(v,opts={}){
  v=normalizeView(v);
  const el=$('#'+v);
  if(!el){console.warn('missing view',v); v='home';}
  if(!opts.fromBack && S.view && S.view!==v){
    RN_VIEW_STACK.push(S.view);
    if(RN_VIEW_STACK.length>20) RN_VIEW_STACK=RN_VIEW_STACK.slice(-20);
  }
  S.view=v;
  document.body && document.body.setAttribute('data-view', v);
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  const target=$('#'+v);
  if(target)target.classList.add('active');
  document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.toggle('active',normalizeView(b.dataset.view)===v));
  render();
  if(opts.hash!==false) syncHash(v);
  window.scrollTo({top:0,behavior:'smooth'});
}

async function refreshAppCache(){
  const btn=document.getElementById('refreshApp');
  try{
    if(btn){btn.disabled=true;btn.textContent=msg('更新中','Updating','更新中','更新中');}
    saveLang(S.lang);
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.update().catch(()=>null)));
    }
    if(window.caches){
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith('rice-navi-')).map(k=>caches.delete(k)));
    }
  }catch(e){}
  location.reload();
}

async function load(){
  saveLang(getSavedLang());
  const res=await fetch('data/rice_navi_data.json?v=textrecovery18-logo-20260629',{cache:'no-store'});
  if(!res.ok) throw new Error('data/rice_navi_data.json load failed: '+res.status);
  S.data=await res.json();
  document.querySelectorAll('.bottomnav button').forEach(b=>b.onclick=()=>{
    if(b.dataset.action==='back') return goBack();
    return switchView(b.dataset.view||b.dataset.go||'home');
  });
  document.addEventListener('click',e=>{
    const n=e.target.closest('[data-go],a[href^="#"]');
    if(!n)return;
    const inner=e.target.closest('button,a,input,select,textarea,summary');
    if(inner&&inner!==n)return;
    const raw=n.getAttribute('data-go') || (n.getAttribute('href')||'').replace(/^#/,'');
    const v=normalizeView(raw);
    e.preventDefault();
    switchView(v);
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const n=e.target.closest('[data-go],a[href^="#"]');
    if(!n)return;
    const inner=e.target.closest('button,a,input,select,textarea,summary');
    if(inner&&inner!==n)return;
    e.preventDefault();
    switchView(normalizeView(n.getAttribute('data-go') || (n.getAttribute('href')||'').replace(/^#/,'')));
  });
  window.addEventListener('hashchange',()=>{ if(!RN_HASH_LOCK) switchView(normalizeView(location.hash),{hash:false}); });
  $('#lang').onchange=e=>setLanguage(e.target.value);
  const rb=document.getElementById('refreshApp');
  if(rb)rb.onclick=refreshAppCache;
  updateStaticI18n();
  switchView(normalizeView(location.hash||'home'),{hash:false});
}
function render(){if(!S.data)return; updateStaticI18n(); const map={home:renderHome,learn:renderLearn,literature:renderLiterature,varieties:renderVarieties,check:renderCheck,future:renderFuture,rankings:renderRankings,words:renderWords}; (map[S.view]||renderHome)();}
function setFilter(k,v,view){S.filters[k]=v;if(view)switchView(view);else render();}

function renderHome(){
 const d=S.data, counts=d.counts||{}, variety=pick(d.rice_varieties,'variety'), learn=pick(d.learning_multilingual||d.learning_cards,'learn'), lit=litSorted()[0], term=termPick(), future=pick(d.future_rice,'future'), story=todayStory();
 $('#home').innerHTML=`<div class="home-app-shell">
   <section class="concept-story-hero" data-go="future" tabindex="0" aria-label="世界のライス物語を開く">
     ${worldRiceHeroImage()}
     <div class="story-floating-card">
       <div class="story-icon">${homeArt('hero','story-icon-art',t('worldStories'))}</div>
       <div class="story-copy">
         <span class="lead-kicker">${t('todayMain')}</span>
         <h1>${t('worldStories')}</h1>
         <p class="small">${esc(storyDayDateChip(story||{}))} / ${esc(storyCountry(story||{}))} / ${esc(field(story,'region')||'')}</p>
         <h2>${esc(storyTitle(story||{}))}</h2>
         <p>${esc(storyBody(story||{},230)).split('\n').join('<br>')}</p>
       </div>
       <button class="story-read" type="button" onclick="setStoryDetail(todayIndex(storyList().length,'world_rice_story'))">${t('readMore')}</button>
     </div>
   </section>
   ${dailyCardsHTML(variety,learn,lit,term,future)}
   <section class="home-section"><div class="section-head"><h2>${t('learnResearch')}</h2><span class="section-note">${msg('主要機能を選んでください','Choose a main feature','請選擇主要功能','请选择主要功能')}</span></div>
     <div class="explore-grid">
       ${exploreTile('words','glossary',t('glossary'),t('glossaryDesc'))}
       ${exploreTile('varieties','varieties',t('varietyBook'),`${counts.rice_varieties||257}${t('varietyDesc')}`)}
       ${exploreTile('literature','literature',t('literatureLibrary'),t('literatureDesc'))}
       ${exploreTile('future','story',t('worldStories'),t('worldStoriesDesc'))}
       ${exploreTile('future','country',t('locationHistory'),t('locationHistoryDesc'))}
       ${exploreTile('rankings','ranking',t('ranking'),t('rankingDesc'))}
       ${exploreTile('check','water',t('waterRice'),t('waterRiceDesc'))}
       ${exploreTile('check','storage',t('storage'),t('storageDesc'))}
       ${exploreTile('learn','learn',t('riceStudy'),t('riceStudyDesc'))}
     </div>
   </section>
 </div>`;
}


function tempMapHTML(){
 const events=[
  [msg('浸漬・吸水','Soaking and absorption','浸泡・吸水','浸泡・吸水'),msg('水温と時間で吸水状態が変わる。冷水・短時間では吸水不足を確認。','Water temperature and time change absorption. Check for under-absorption when water is cold or soaking is short.','水溫與時間會改變吸水狀態。冷水或短時間時要確認吸水不足。','水温与时间会改变吸水状态。冷水或短时间时要确认吸水不足。'),'吸水 浸漬','learn'],
  [msg('昇温','Heating up','升溫','升温'),msg('加熱初期は米粒内外の温度差と水分移動を見る。','In early heating, watch the temperature gap inside and outside the grain and water movement.','加熱初期要看米粒內外溫差與水分移動。','加热初期要看米粒内外温差与水分移动。'),'温度 時間','literature'],
  [msg('沸騰前後','Around boiling','沸騰前後','沸腾前后'),msg('98℃付近への到達と維持を、火力・蒸発・吹きこぼれと合わせて見る。','Check reaching and holding near 98°C together with heat, evaporation, and boil-over.','確認接近98℃與維持狀態，同時看火力、蒸發與溢出。','确认接近98℃与维持状态，同时看火力、蒸发与溢出。'),'沸騰 火力','literature'],
  [msg('糊化','Gelatinization','糊化','糊化'),msg('硬さ、芯残り、べたつきの分岐を確認する。','Check how firmness, uncooked core, and stickiness branch from this point.','確認硬度、夾生與黏膩感的分歧。','确认硬度、夹生与黏腻感的分歧。'),'糊化 硬さ','words'],
  [msg('蒸らし','Resting','燜飯','焖饭'),msg('水分を均一化し、硬さ・粘り・粒立ちを整える。','Even out moisture and adjust firmness, stickiness, and grain separation.','讓水分均一，調整硬度、黏性與粒粒分明。','让水分均一，调整硬度、黏性与粒粒分明。'),'蒸らし ほぐし','learn'],
  [msg('ほぐし・保温','Loosening and holding','翻鬆・保溫','翻松・保温'),msg('余分な蒸気、付着、老化、保温臭を確認する。','Check excess steam, sticking, staling, and holding odor.','確認多餘蒸氣、沾黏、老化與保溫氣味。','确认多余蒸气、粘连、老化与保温气味。'),'ほぐし 老化','words']
 ];
 return `<div class="section-title"><h2>${msg('温度×時間マップ','Temperature × time map','溫度×時間地圖','温度×时间地图')}</h2></div>${homeArt('cooking_guide','card-visual','炊飯工程')}<div class="timeline">${events.map(e=>`<div class="step"><b>${esc(e[0])}</b><p>${esc(e[1])}</p><span>${esc(e[2])}</span><button class="btn secondary" onclick="switchView('${e[3]}')">${msg('関連を見る','See related items','查看相關','查看相关')}</button></div>`).join('')}</div>`;
}
function renderLearn(){
 const data=(S.data.learning_basics&&S.data.learning_basics.length?S.data.learning_basics:(S.data.learning_multilingual&&S.data.learning_multilingual.length?S.data.learning_multilingual:S.data.learning_cards))||[], q=S.filters.learn||'', level=S.filters.level||'';
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!level||levelKey(x)===level));
 const levelKeys=['beginner','intermediate','advanced'];
 const levelCounts=levelKeys.map(k=>[k,data.filter(x=>levelKey(x)===k).length]);
 const termTop=[
  ['品種',msg('品種','Variety','品種','品种')],['洗米',msg('洗米','Washing','洗米','淘米')],['浸漬',msg('浸漬','Soaking','浸泡','浸泡')],['水加減',msg('水加減','Water ratio','水量','水量')],['粘り',msg('粘り','Stickiness','黏性','黏性')],['粒立ち',msg('粒立ち','Grain separation','粒粒分明','粒粒分明')],['香り米',msg('香り米','Aromatic rice','香米','香米')],['長粒米',msg('長粒米','Long grain rice','長粒米','长粒米')],['保存',msg('保存','Storage','保存','保存')],['加熱',msg('加熱','Heating','加熱','加热')],['蒸らし',msg('蒸らし','Resting','燜飯','焖饭')],['水質',msg('水質','Water quality','水質','水质')],['おにぎり',msg('おにぎり','Rice ball','飯糰','饭团')]
 ];
 $('#learn').innerHTML=`<div class="hero">${homeArt('learning_lesson','card-visual','炊飯の勉強')}<h1>${t('riceStudy')}</h1><p>${msg('学ぶページは、文献検索とは分けた「米と炊飯の勉強」です。100項目を25件ずつ作り、短く読める形に整えます。現在は75項目です。','The Learn page is separated from reference search. It presents simple rice and cooking lessons, built in batches of 25 toward 100 items. It now has 75 items.','學習頁與文獻搜尋分開。以每批25則整理成100個容易閱讀的米與炊飯學習項目。目前為75項。','学习页与文献搜索分开。以每批25条整理成100个易读的米与煮饭学习项目。目前为75项。')}</p></div>
 <div class="section-title"><h2>${msg('学ぶ 第1〜3弾','Learning batches 1–3','學習第1〜3批','学习第1〜3批')}</h2></div>
 <p class="data-note">${msg('ここでは出典IDやclaim IDを前面に出さず、初心者が読める説明にします。詳しい裏取りが必要な時だけ文献検索を使います。','This page does not foreground source IDs or claim IDs. It is written for beginners; reference search is used only when deeper verification is needed.','這裡不把出處ID或claim ID放在前面，而是用初學者可讀的方式說明。需要深入確認時再使用文獻搜尋。','这里不把出处ID或claim ID放在前面，而是用初学者可读的方式说明。需要深入确认时再使用文献搜索。')}</p>
 <div class="section-title"><h2>${ui('learnByLevel')}</h2></div><div class="priority-row">${levelCounts.map(([k,n])=>`<button onclick="S.filters.level='${k}';renderLearn()">${levelLabelFromKey(k)} ${n}</button>`).join('')}<button onclick="S.filters.level='';S.filters.learn='';renderLearn()">${ui('allLessons')}</button></div>
 <div class="section-title"><h2>${msg('テーマで探す','Browse by theme','依主題瀏覽','按主题浏览')}</h2></div><div class="priority-row">${termTop.map(([key,label])=>`<button onclick="S.filters.learn='${key}';renderLearn()">${label}</button>`).join('')}</div>
 <div class="toolbar"><input placeholder="${msg('勉強項目を検索','Search lessons','搜尋學習項目','搜索学习项目')}" value="${esc(q)}" oninput="setFilter('learn',this.value)"><select onchange="setFilter('level',this.value)"><option value="">${msg('全レベル','All levels','全部程度','全部程度')}</option>${levelKeys.map(k=>`<option value="${k}" ${k===level?'selected':''}>${levelLabelFromKey(k)}</option>`).join('')}</select></div>
 <div class="countbar">${stat(filtered.length,msg('表示中の学び','Lessons shown','顯示中的學習','显示中的学习'))}${stat(data.length,msg('現在の学び項目','Current lessons','目前學習項目','当前学习项目'),msg('100項目を25件ずつ作成','Building 100 items in batches of 25','以每批25則建立100項','以每批25条建立100项'))}${stat((S.data.counts&&S.data.counts.learning_basics_target)||100,msg('目標','Target','目標','目标'),msg('学ぶ100項目','100 learning items','學習100項','学习100项'))}</div>
 <div class="list learn-list">${filtered.map(x=>`<div class="item learn-item"><h3>${esc(lc(x,'title')||msg('項目名','Lesson title','項目名稱','项目名称'))}</h3><p>${chips([levelLabel(x),lc(x,'related_terms')])}</p><p>${esc(lc(x,'short')||'')}</p><details><summary>${msg('もう少し読む','Read a little more','再讀一點','再读一点')}</summary><p><b>${msg('考え方：','How to think: ','想法：','思路：')}</b>${esc(lc(x,'easy')||'')}</p><p><b>${msg('見るポイント：','What to check: ','觀察重點：','观察重点：')}</b>${esc(lc(x,'field_check_points')||'')}</p><p><b>${msg('注意：','Note: ','注意：','注意：')}</b>${esc(lc(x,'warning')||'')}</p></details><div class="priority-row"><button class="btn secondary" onclick="S.filters.wordq='${esc((lc(x,'related_terms')||lc(x,'title')||'').split(/[;；,、]/)[0])}';switchView('words')">${msg('辞典で関連語を見る','View related terms','在辭典查看相關詞','在词典查看相关词')}</button></div></div>`).join('')}</div>`;
}

function renderLiterature(){
 const cards=litCards(), notes=S.data.literature.field_notes||[], q=S.filters.litq||'', cat=S.filters.litcat||'', ev=S.filters.evidence||'AB';
 const categories=[...new Set(cards.map(x=>x.category).filter(has))].sort();
 const categoryTop=topCategories(cards,12);
 const evOK=x=>ev==='ALL'||(ev==='AB'&&['A','B'].includes(x._class))||x._class===ev;
 const filtered=cards.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!cat||x.category===cat)&&evOK(x)).sort((a,b)=>literatureScore(b)-literatureScore(a));
 const classCounts={A:cards.filter(x=>x._class==='A').length,B:cards.filter(x=>x._class==='B').length,C:cards.filter(x=>x._class==='C').length,D:cards.filter(x=>x._class==='D').length};
 const detailIndex=Number(S.filters.litDetail);
 const detail=Number.isFinite(detailIndex)?cards[detailIndex]:null;
 const searchTerms=[['浸漬',msg('浸漬','Soaking','浸泡','浸泡')],['吸水',msg('吸水','Absorption','吸水','吸水')],['糊化',msg('糊化','Gelatinization','糊化','糊化')],['蒸らし',msg('蒸らし','Resting','燜飯','焖饭')],['老化',msg('老化','Staling','老化','老化')],['水質',msg('水質','Water quality','水質','水质')],['pH','pH'],['硬さ',msg('硬さ','Firmness','硬度','硬度')],['べたつき',msg('べたつき','Stickiness','黏膩','发黏')],['衛生',msg('衛生','Hygiene','衛生','卫生')],['温度',msg('温度','Temperature','溫度','温度')],['保管',msg('保管','Storage','保存','保存')],['結露',msg('結露','Condensation','結露','结露')]];
 const detailHTML=detail?`<div class="card detail-card visual-card">${homeArt('research_notes','card-visual','文献要点')}<h2>${esc(literatureFieldText(detail,'title',msg('文献名','reference title','文獻名稱','文献名称'))||msg('文献名は詳細で確認','Check the reference title in details','文獻名稱請在詳情確認','文献名称请在详情确认'))}</h2><p>${chips([literatureCategoryLabel(detail.category),evidenceLabel(detail._class)])}</p><p class="small">${esc(statusInfo(detail._class))}</p><p class="data-note">${msg('文献名・要点・条件・数値・出典を、必要な時に確認できます。','You can check reference titles, key points, conditions, numbers, and sources when needed.','需要時可確認文獻名稱、要點、條件、數值與出處。','需要时可确认文献名称、要点、条件、数值与出处。')}</p><p class="plain-box"><b>${msg('この文献で確認できること：','What this reference can confirm: ','此文獻可確認的內容：','此文献可确认的内容：')}</b>${msg('文献要点、条件・数値、出典を確認できます。関連する学びがある場合は、そこから出典も確認できます。','You can check the key point, conditions, numbers, and sources. When related learning exists, you can also check its sources from here.','可以確認文獻要點、條件・數值與出處。若有相關學習，也可從這裡確認出處。','可以确认文献要点、条件・数值与出处。若有相关学习，也可从这里确认出处。')}</p><p><b>${msg('文献要点：','Reference key point: ','文獻要點：','文献要点：')}</b>${esc(literatureFieldText(detail,'summary',msg('要点','key point','要點','要点'))&&!same(literatureFieldText(detail,'summary',msg('要点','key point','要點','要点')),literatureFieldText(detail,'title',msg('文献名','reference title','文獻名稱','文献名称')))?literatureFieldText(detail,'summary',msg('要点','key point','要點','要点')):msg('要点は文献詳細または出典ページで確認します','Check the key point in reference details or on the source page','要點請在文獻詳情或出處頁面確認','要点请在文献详情或出处页面确认'))}</p><p><b>${msg('条件・数値：','Conditions / numbers: ','條件・數值：','条件・数值：')}</b>${esc(literatureFieldText(detail,'condition',msg('条件・数値','conditions and numbers','條件・數值','条件・数值'))||msg('条件・数値は文献詳細または出典ページで確認します','Check conditions and numbers in reference details or on the source page','條件與數值請在文獻詳情或出處頁面確認','条件与数值请在文献详情或出处页面确认'))}</p><p><b>${msg('確認ポイント：','Check point: ','確認重點：','确认重点：')}</b>${esc(field(detail,'trace')?traceText(detail.trace):msg('この文献で何を確認できるかを、要点・条件・出典から確認します','Use the key point, conditions, and sources to see what this reference can confirm.','從要點、條件與出處確認此文獻可確認什麼。','从要点、条件与出处确认此文献可确认什么。'))}</p>${claimDetails(field(detail,'claim_ids'))}${sourceDetails(field(detail,'source_ids'))}<div class="priority-row"><button class="btn secondary" onclick="S.filters.learn='${esc((detail.category||detail.title||'').split(/[・/ ]/)[0])}';switchView('learn')">${msg('関連する勉強を見る','View related learning','查看相關學習','查看相关学习')}</button><button class="btn secondary" onclick="S.filters.wordq='${esc((detail.category||detail.title||'').split(/[・/ ]/)[0])}';switchView('words')">${msg('辞典で見る','View in dictionary','在辭典查看','在词典查看')}</button><button class="btn secondary" onclick="S.filters.litDetail='';renderLiterature()">${msg('詳細を閉じる','Close details','關閉詳情','关闭详情')}</button></div></div>`:'';
 $('#literature').innerHTML=`<div class="hero">${homeArt('literature_detail','card-visual','文献ライブラリ')}<h1>${t('literatureLibrary')}</h1><p>${msg('炊飯や米の情報を、文献名・要点・条件・数値・出典から確認できます。まずは一覧で気になるタイトルを探し、必要な時だけ詳細を開きます。','Check rice-cooking and rice information through reference titles, key points, conditions, numbers, and sources. Browse the list first, then open details only when needed.','可從文獻名稱、要點、條件、數值與出處確認炊飯與米的資訊。先從列表找在意的標題，需要時再打開詳情。','可从文献名称、要点、条件、数值与出处确认煮饭与米的信息。先从列表找关注的标题，需要时再打开详情。')}</p></div>
 <div class="countbar">${stat(classCounts.A,msg('条件まで見られる資料','References with conditions','可看條件的資料','可看条件的资料'),t('literature'))}${stat(classCounts.B,msg('要点がある資料','References with key points','有要點的資料','有要点的资料'),t('literature'))}${stat(classCounts.C,msg('出典・要点を詳細で確認する資料','References needing detail check','需在詳情確認出處・要點的資料','需在详情确认出处・要点的资料'),t('literature'))}${stat(notes.length,msg('実用メモ','Practical notes','實用備註','实用备注'),msg('補足','Supplement','補充','补充'))}</div>
 <div class="toolbar"><input placeholder="${msg('文献検索','Search references','搜尋文獻','搜索文献')}" value="${esc(q)}" oninput="setFilter('litq',this.value)"><select onchange="setFilter('litcat',this.value)"><option value="">${ui('allCategories')}</option>${categories.map(c=>`<option ${c===cat?'selected':''}>${esc(c)}</option>`).join('')}</select><select aria-label="${msg('出典確認ステータス','Evidence status','根據確認狀態','依据确认状态')}" onchange="setFilter('evidence',this.value)"><option value="AB" ${ev==='AB'?'selected':''}>${msg('読みやすい資料中心','Readable references first','以易讀資料為主','以易读资料为主')}</option><option value="A" ${ev==='A'?'selected':''}>${msg('条件まで見られる資料','References with conditions','可看條件的資料','可看条件的资料')}</option><option value="B" ${ev==='B'?'selected':''}>${msg('要点がある資料','References with key points','有要點的資料','有要点的资料')}</option><option value="C" ${ev==='C'?'selected':''}>${msg('出典・要点を詳細で確認する資料','References needing detail check','需在詳情確認出處・要點的資料','需在详情确认出处・要点的资料')}</option><option value="ALL" ${ev==='ALL'?'selected':''}>${msg('全件','All','全部','全部')}</option></select></div>
 <div class="section-title"><h2>${msg('カテゴリで探す','Browse by category','依分類搜尋','按分类搜索')}</h2></div><div class="priority-row">${categoryTop.map(([k,n])=>`<button onclick="S.filters.litcat='${esc(k)}';S.filters.litq='';S.filters.litDetail='';renderLiterature()">${esc(literatureCategoryLabel(k))} ${n}</button>`).join('')}<button onclick="S.filters.litcat='';S.filters.litq='';S.filters.evidence='AB';S.filters.litDetail='';renderLiterature()">${msg('解除','Clear','清除','清除')}</button></div>
 <div class="priority-row">${searchTerms.map(([key,label])=>`<button onclick="S.filters.litDetail='';setFilter('litq','${key}')">${label}</button>`).join('')}</div>
 <div class="data-note"><b>${ui('note')}：</b>${msg('一覧では文献タイトルを見せます。全文・条件・出典はタイトルを押した詳細で確認します。学ぶページとは混ぜません。','The list shows reference titles. Full text, conditions, and sources are checked by opening the title. This stays separate from the Learn page.','列表只顯示文獻標題。全文、條件與出處請點開標題後在詳情確認。不要與學習頁混在一起。','列表只显示文献标题。全文、条件与出处请点开标题后在详情确认。不要与学习页混在一起。')}</div>
 ${detailHTML}
 <div class="countbar">${stat(filtered.length,msg('表示中の文献タイトル','Reference titles shown','顯示中的文獻標題','显示中的文献标题'))}${stat(cards.length,msg('文献カード総数','Total reference cards','文獻卡總數','文献卡总数'))}${stat(notes.length,msg('実用メモ','Practical notes','實用備註','实用备注'))}</div>
 <div class="list title-list">${filtered.map(x=>{const idx=cards.indexOf(x);const cls=x._class;return `<div class="item evidence${cls} compact-title-item"><h3>${esc(literatureFieldText(x,'title',msg('文献名','reference title','文獻名稱','文献名称'))||msg('文献名は詳細で確認','Check the reference title in details','文獻名稱請在詳情確認','文献名称请在详情确认'))}</h3><p>${chips([literatureCategoryLabel(x.category),evidenceLabel(cls)])}</p><button class="btn secondary" onclick="setLitDetail(${idx})">${msg('詳細を見る','View details','查看詳情','查看详情')}</button></div>`}).join('')}</div>
 <details class="field-note"><summary>${msg('現場メモを見る','View field notes','查看現場備註','查看现场备注')}</summary><p class="small">${msg('現場メモは、作業中の気づきや確認事項をまとめた補足です。資料の要点とは区別して読みます。','Field notes are supplementary notes from work observations and checks. Read them separately from reference key points.','現場備註是整理作業中的發現與確認事項的補充。請與資料要點區分閱讀。','现场备注是整理作业中的发现与确认事项的补充。请与资料要点区分阅读。')}</p><div class="list">${notes.map(n=>`<div class="item field-item"><h3>${esc(field(n,'title')||msg('メモ名は詳細で確認','Check note title in details','備忘名稱請在詳情確認','备注名称请在详情确认'))}</h3><p>${chips([n.category,traceText(n.decision),msg('補足メモ','Supplementary note','補充備註','补充备注')])}</p><p>${esc(field(n,'summary')||'')}</p><p><b>${msg('確認内容：','Check item: ','確認內容：','确认内容：')}</b>${esc(field(n,'condition')||msg('詳細で確認できます','Check in details','可在詳情確認','可在详情确认'))}</p><p><b>${msg('次の確認：','Next check: ','下一步確認：','下一步确认：')}</b>${esc(field(n,'next_action')||msg('詳細で確認できます','Check in details','可在詳情確認','可在详情确认'))}</p></div>`).join('')}</div></details>`;
}

function renderVarieties(){
 const data=S.data.rice_varieties||[]; const q=S.filters.varq||'', country=S.filters.country||'', use=S.filters.use||'', texture=S.filters.texture||'', amy=S.filters.amy||'', protein=S.filters.protein||'';
 const countries=[...new Set(data.map(countryOfVariety))].filter(has).sort();
 const uses=[...new Set(data.map(x=>field(x,'use_category_primary','main_uses')).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(norm).filter(x=>x&&x!=='詳細で確認'))].slice(0,80).sort();
 const textures=[...new Set(data.map(x=>field(x,'texture_tags','aroma','rice_type')).filter(has).flatMap(x=>String(x).split(/[;；,、]/)).map(norm).filter(x=>x&&x!=='詳細で確認'))].slice(0,80).sort();
 const filtered=data.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!country||countryOfVariety(x)===country)&&(!use||String(field(x,'use_category_primary','main_uses')).includes(use))&&(!texture||String(field(x,'texture_tags','aroma','rice_type')).includes(texture))&&(!amy||String(field(x,'amylose_class','amylose_range','amylose_value')).includes(amy))&&(!protein||String(field(x,'protein_class','protein_range','protein_value')).includes(protein)));
 const countryTop=[...new Map(countries.map(c=>[c,data.filter(x=>countryOfVariety(x)===c).length]).sort((a,b)=>b[1]-a[1]).slice(0,12))];
 $('#varieties').innerHTML=`<div class="hero">${homeArt('variety_detail','card-visual','米品種図鑑')}<h1>${t('varietyBook')}</h1><p>${msg(`${data.length}件を国別・用途別・食感別・アミロース・たんぱく質で確認します。`,`Check ${data.length} varieties by country, use, texture, amylose, and protein.`,`可依國家、用途、食感、直鏈澱粉與蛋白質確認${data.length}個品種。`,`可按国家、用途、口感、直链淀粉和蛋白质确认${data.length}个品种。`)}</p>${q?`<p class="data-note">${msg('検索中：','Searching: ','搜尋中：','搜索中：')}${esc(q)}。${msg('ホームの「今日のお米」から来た場合は、この条件で品種を表示します。','When opened from Today’s rice on the home screen, varieties are shown with this condition.','若從首頁「今日米種」進入，會以此條件顯示品種。','若从首页“今日米种”进入，会以此条件显示品种。')}</p>`:''}</div>
 <div class="section-title"><h2>${msg('国・地域で探す','Browse by country / region','依國家・地區搜尋','按国家・地区搜索')}</h2></div><div class="priority-row">${countryTop.map(([c,n])=>`<button onclick="S.filters.country='${esc(c)}';renderVarieties()">${esc(localizeCountryName(c))} ${n}</button>`).join('')}</div>
 <div class="toolbar"><input placeholder="${msg('品種検索','Search varieties','搜尋品種','搜索品种')}" value="${esc(q)}" oninput="setFilter('varq',this.value)"><select onchange="setFilter('country',this.value)"><option value="">${ui('allCountries')}</option>${countries.map(c=>`<option value="${esc(c)}" ${c===country?'selected':''}>${esc(localizeCountryName(c))}</option>`).join('')}</select><select onchange="setFilter('use',this.value)"><option value="">${msg('全用途','All uses','全部用途','全部用途')}</option>${uses.slice(0,50).map(c=>`<option value="${esc(c)}" ${c===use?'selected':''}>${esc(varietyDisplayText(c))}</option>`).join('')}</select><select onchange="setFilter('texture',this.value)"><option value="">${msg('全食感・特徴','All textures / traits','全部食感・特徵','全部口感・特征')}</option>${textures.slice(0,50).map(c=>`<option value="${esc(c)}" ${c===texture?'selected':''}>${esc(varietyDisplayText(c))}</option>`).join('')}</select></div>
 <div class="priority-row"><button onclick="setFilter('country','日本')">${esc(localizeCountryName('日本'))}</button><button onclick="setFilter('country','台湾')">${esc(localizeCountryName('台湾'))}</button><button onclick="setFilter('country','タイ')">${esc(localizeCountryName('タイ'))}</button><button onclick="setFilter('amy','低')">${msg('低アミロース','Low amylose','低直鏈澱粉','低直链淀粉')}</button><button onclick="setFilter('amy','高')">${msg('高アミロース','High amylose','高直鏈澱粉','高直链淀粉')}</button><button onclick="setFilter('protein','高')">${msg('高たんぱく質','High protein','高蛋白質','高蛋白质')}</button><button onclick="S.filters.country='';S.filters.use='';S.filters.texture='';S.filters.amy='';S.filters.protein='';renderVarieties()">${msg('絞込解除','Clear filters','清除篩選','清除筛选')}</button></div>
 <div class="countbar">${stat(filtered.length,msg('表示中の品種','Varieties shown','顯示中的品種','显示中的品种'))}${stat(data.length,msg('品種総数','Total varieties','品種總數','品种总数'))}${stat(countries.length,ui('countriesRegions'))}${stat(uses.length,msg('用途分類','Use categories','用途分類','用途分类'))}</div>
 <div class="list">${filtered.slice(0,250).map(v=>{const vs=varietyShort(v); const amy=varietyCompositionText(field(v,'amylose_range','amylose_value','amylose_class')); const pro=varietyCompositionText(field(v,'protein_range','protein_value','protein_class')); const feature=varietyFeatureDisplay(v); const use=varietyUseDisplay(v); const region=varietyRegionDisplay(v); const summary=varietyBodyDisplay(v)||varietySummaryDisplay(v); return `<div class="item variety-card"><h3>${esc(titleOfVariety(v))}</h3><p>${chips([region,use,feature])}</p><p class="variety-summary">${esc(summary)}</p><div class="plain-box variety-profile"><p><b>${msg('地域：','Region: ','地區：','地区：')}</b>${esc(region)}</p><p><b>${msg('特徴：','Traits: ','特徵：','特征：')}</b>${esc(feature)}</p><p><b>${msg('用途：','Use: ','用途：','用途：')}</b>${esc(use)}</p></div>${(amy||pro)?`<p><b>${msg('成分の手がかり：','Composition hints: ','成分線索：','成分线索：')}</b>${esc([amy?`${msg('アミロース','Amylose','直鏈澱粉','直链淀粉')} ${amy}`:'',pro?`${msg('たんぱく質','Protein','蛋白質','蛋白质')} ${pro}`:''].filter(Boolean).join(' / '))}</p>`:''}<details><summary>${msg('詳細・出典','Details and sources','詳情・出處','详情・出处')}</summary><p><b>${msg('品種名：','Variety name: ','品種名稱：','品种名称：')}</b>${esc(field(v,'variety_name','local_name','display_name_ja'))}</p><p><b>${msg('地域・市場：','Region / market: ','地區・市場：','地区・市场：')}</b>${esc(varietyDisplayText(field(v,'main_consumption_markets'))||region)}</p><p><b>${msg('出典の見方：','How to read sources: ','出處讀法：','出处读法：')}</b>${msg('この品種説明の出典になった公的資料・研究資料・生産団体資料などを確認する欄です。数値や専門条件は、本文ではなくここで確認します。','This section points to public documents, research, producer information, and other sources behind the variety description. Check numbers and technical conditions here rather than in the short body text.','此欄用來確認支撐品種說明的公部門資料、研究資料、生產團體資料等。數值與專門條件不放在短文中，而在此確認。','此栏用于确认支撑品种说明的公共资料、研究资料、生产团体资料等。数值与专业条件不放在短文中，而在此确认。')}</p>${friendlySourceHTML(field(v,'source_urls'))}</details><p class="data-note">${esc(explainEvidenceLink('variety'))}</p><button class="btn secondary" onclick="S.filters.litq='${esc(field(v,'related_terms','rice_type','display_name_ja'))}';switchView('literature')">${msg('この品種の出典・関連資料を見る','View sources and related references for this variety','查看此品種的根據與相關資料','查看此品种的依据与相关资料')}</button></div>`}).join('')}</div>`;
}

function renderCheck(){
 const w=S.data.water||{}, sm=S.data.storage_mold||{}, raw=sm.raw||{};
 const checklist=raw.checklist||sm.checklist||[], rules=raw.rules||sm.rules||[], claims=raw.claims||sm.claims||[], sources=raw.sources||sm.sources||[];
 const regions=w.regions||[];
 const selected=Math.max(0,Math.min(regions.length-1,Number(S.filters.waterRegion||0)||0));
 const region=regions[selected]||{};
 const coreKeys=['結露','湿度','温度','残米','付着','カビ臭','虫','変色','清掃'];
 const coreClaims=coreKeys.map(k=>claims.find(c=>String(c.theme||c.claim_ja||'').includes(k))).filter(Boolean);
 $('#check').innerHTML=`<div class="hero">${homeArt('condition_check','card-visual','確認')}<h1>${t('check')}</h1><p>${msg('水、湿度、保管、納米庫の状態を、米を扱う時の確認順に整理して表示します。','Water, humidity, storage, and rice-storage conditions are organized into a practical check order for handling rice.','將水、濕度、保管與納米庫狀態整理成處理米時的確認順序。','将水、湿度、保管与纳米库状态整理成处理米时的确认顺序。')}</p></div>
 <div class="split">
 ${card(t('waterRice'),`${homeArt('cooking_guide','card-visual','水と炊飯')}${waterRegionPickerHTML(regions,selected)}${waterIntroHTML(region,w)}`,`<p class="small">${msg('水質ルール','Water rules','水質規則','水质规则')} ${(w.quality_rules||[]).length}${msg('件',' items','件','项')} / ${msg('水質出典','Water references','水質根據','水质依据')} ${(w.claims||[]).length}${msg('件',' items','件','项')}</p>`)}
 ${card(msg('水質ルール一覧','Water-rule list','水質規則列表','水质规则列表'),`${homeArt('condition_check','card-visual','水質ルール')}<p class="data-note">${msg('硬度・pHなどの数字を、炊飯でどう見ればよいかに置き換えて表示します。たとえばpHは7前後が中性、硬度は水に含まれるミネラルの多さです。','Hardness, pH and similar values are shown as rice-cooking hints. Around pH 7 is neutral, and hardness indicates the amount of minerals in water.','硬度、pH等數字會轉成炊飯時的觀察方式。pH約7為中性，硬度表示水中礦物質的多寡。','硬度、pH等数字会转成煮饭时的观察方式。pH约7为中性，硬度表示水中矿物质的多少。')}</p><div class="compact-list">${(w.quality_rules||[]).slice(0,13).map(r=>`<p>${esc(localizedWaterPhrase(r))}</p>`).join('')}</div><details><summary>${msg('水質出典','Water sources','水質出處','水质出处')}</summary>${(w.sources||[]).slice(0,10).map(s=>`<div class="source"><b>${msg('参考資料','Reference','參考資料','参考资料')}</b><br>${esc(field(s,'source_title_ja')||msg('資料名は詳細で確認します','Check source title in details','資料名稱可在詳情確認','资料名称可在详情确认'))}<br>${has(field(s,'source_url'))?`<a href="${esc(field(s,'source_url'))}" target="_blank" rel="noopener">${esc(field(s,'source_url'))}</a>`:msg('URLは出典ページで確認します','Check URL on the source page','URL請在出處頁面確認','URL请在出处页面确认')}</div>`).join('')}</details>`)}
 ${card(msg('保管環境確認','Storage environment check','保管環境檢查','保管环境检查'),`<p><b>${msg('今日の保管注意：','Today’s storage note: ','今日保管注意：','今日保管注意：')}</b>${msg('湿度・温度差・雨天後の結露跡を確認します。','Check humidity, temperature difference, and condensation marks after rain.','確認濕度、溫差與雨後結露痕跡。','确认湿度、温差与雨后结露痕迹。')}</p><p>${msg('見る場所：米袋周辺、床、壁際、ホッパー、搬送部、納米庫内壁。','Check areas: around rice bags, floor, wall side, hopper, conveying sections, and inner walls of the rice-storage bin.','查看位置：米袋周邊、地面、牆邊、料斗、搬送部、納米庫內壁。','查看位置：米袋周边、地面、墙边、料斗、输送部、纳米库内壁。')}</p><p class="warn">${msg('濡れた付着米、カビ臭、虫、変色は炊飯調整ではなく保管・清掃・隔離判断です。','Wet rice residue, mold odor, insects, or discoloration are storage, cleaning, or isolation issues, not cooking adjustments.','濕的殘留米、霉味、蟲害、變色屬於保管、清掃或隔離判斷，不是炊飯調整。','湿的残留米、霉味、虫害、变色属于保管、清扫或隔离判断，不是煮饭调整。')}</p>`)}
 ${card(t('storage'),`${homeArt('storage_check','card-visual','保管確認')}<p><b>${msg('見る順番：','Check order: ','查看順序：','查看顺序：')}</b>${msg('結露 → 湿度 → 温度差 → 残米 → カビ臭 → 虫 → 変色 → 清掃記録。','Condensation → humidity → temperature difference → remaining rice → mold odor → insects → discoloration → cleaning record.','結露 → 濕度 → 溫差 → 殘米 → 霉味 → 蟲害 → 變色 → 清掃紀錄。','结露 → 湿度 → 温差 → 残米 → 霉味 → 虫害 → 变色 → 清扫记录。')}</p><div class="mini-grid">${storageStepLabels().map((x,i)=>`<button type="button" class="mini-chip" onclick="const d=this.closest('.card').querySelectorAll('details'); if(d[i<8?0:1]){d[i<8?0:1].open=true; d[i<8?0:1].scrollIntoView({behavior:'smooth',block:'start'});}">${esc(x)}</button>`).join('')}</div><details open><summary>${msg('危険サインと出典','Danger signs and evidence','危險訊號與根據','危险信号与依据')}</summary>${coreClaims.slice(0,9).map(c=>`<p><b>${esc(c.theme||msg('確認','Check','確認','确认'))}</b>：${esc(c.claim_ja||msg('確認ポイントは詳細で確認します','Check points can be reviewed in details','確認重點可在詳情查看','确认重点可在详情查看'))}<br><span class="small">${msg('詳しい出典は文献・出典情報で確認します。','Check detailed evidence in references and source information.','詳細根據請在文獻與出處資訊確認。','详细依据请在文献与出处信息确认。')}</span></p>`).join('')}</details><details><summary>${msg('点検場所','Inspection points','點檢位置','点检位置')}</summary>${checklist.slice(0,13).map(c=>`<p><b>${esc(c.timing||msg('点検','Inspection','點檢','点检'))}</b> ${esc(c.check_area||msg('場所は詳細で確認します','Check the place in details','位置請在詳情確認','位置请在详情确认'))}：${esc(c.check_item||msg('項目は詳細で確認します','Check the item in details','項目請在詳情確認','项目请在详情确认'))}<br><span class="small">${msg('方法：','Method: ','方法：','方法：')}${esc(c.method||msg('詳細で確認します','Check in details','請在詳情確認','请在详情确认'))} / ${msg('NG時：','If NG: ','NG時：','NG时：')}${esc(c.action_if_ng||msg('詳細で確認します','Check in details','請在詳情確認','请在详情确认'))}</span></p>`).join('')}</details>`,`<p class="small">${msg('判定ルール','Decision rules','判定規則','判定规则')} ${rules.length}${msg('件',' items','件','项')} / ${msg('点検','Inspection items','點檢','点检')} ${checklist.length}${msg('件',' items','件','项')} / ${msg('出典','Evidence','根據','依据')} ${claims.length}${msg('件',' items','件','项')}</p>`)}
 ${card(msg('納米庫ルール一覧','Rice-storage rule list','納米庫規則列表','纳米库规则列表'),`${homeArt('storage_clean_detail','card-visual','納米庫清潔管理')}<div class="compact-list">${rules.slice(0,21).map(r=>`<p><b>${esc(field(r,'rule_id','condition','trigger')||msg('ルール','Rule','規則','规则'))}</b>：${esc(field(r,'action_ja','rule_ja','message_ja','note_ja')||field(r,'condition')||msg('詳細で確認します','Check in details','請在詳情確認','请在详情确认'))}</p>`).join('')}</div><details><summary>${msg('納米庫出典','Rice-storage sources','納米庫出處','纳米库出处')}</summary>${sources.slice(0,10).map(s=>`<div class="source"><b>${msg('参考資料','Reference','參考資料','参考资料')}</b><br>${esc(s.title||msg('資料名は詳細で確認します','Check source title in details','資料名稱可在詳情確認','资料名称可在详情确认'))}<br>${has(s.url)?`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>`:msg('URLは出典ページで確認します','Check URL on the source page','URL請在出處頁面確認','URL请在出处页面确认')}</div>`).join('')}</details>`)}
 ${card(msg('トラブル診断','Trouble guide','問題診斷','问题诊断'),`${homeArt('condition_check','card-visual','トラブル診断')}<p>${msg('症状から、関連する勉強・文献・確認項目へ進みます。','Start from a symptom and open related learning, references, and confirmation items.','從症狀進入相關學習、文獻與確認項目。','从症状进入相关学习、文献与确认项目。')}</p><div class="quickgrid"><button onclick="S.filters.litq='べたつき';switchView('literature')">${troubleLabel('sticky')}</button><button onclick="S.filters.litq='硬さ';switchView('literature')">${troubleLabel('hard')}</button><button onclick="S.filters.learn='吸水';switchView('learn')">${troubleLabel('absorption')}</button><button onclick="S.filters.litq='老化';switchView('literature')">${troubleLabel('staling')}</button><button onclick="S.filters.litq='水質';switchView('literature')">${troubleLabel('water')}</button><button onclick="S.filters.litq='カビ';switchView('check')">${troubleLabel('mold')}</button><button onclick="S.filters.litq='糊化';switchView('literature')">${troubleLabel('core')}</button><button onclick="S.filters.litq='蒸らし';switchView('learn')">${troubleLabel('resting')}</button></div><p class="small">${msg('症状の説明が足りない部分は、関連する文献・勉強・納米庫管理へ進みます。','When a symptom needs more explanation, open references, learning, or storage management.','症狀說明不足時，可進入相關文獻、學習或納米庫管理。','症状说明不足时，可进入相关文献、学习或纳米库管理。')}</p>`)}
 </div>`;
}

function renderFuture(){
 const stories=storyList(), story=todayStory(), storyQ=S.filters.storyq||'', storyCountryFilter=S.filters.storyCountry||'';
 const storyCountries=[...new Set(stories.map(storyCountry).filter(has))].sort();
 const storyFiltered=stories.filter(x=>(!storyQ||JSON.stringify(x).includes(storyQ))&&(!storyCountryFilter||storyCountry(x)===storyCountryFilter));
 const todayIdx=todayStoryIndex();
 const todayStoryHTML=story?`<div class="card story-card visual-card today-story-pick"><h2>${msg('今日の物語','Today’s story','今日故事','今日故事')}</h2><p>${chips([storyDayDateChip(story),storyCountry(story),field(story,'region')])}</p><h3>${esc(storyTitle(story))}</h3><p><b>${esc(storySubtitle(story))}</b></p><p>${esc(storyBody(story,260)).split('\n').join('<br>')}</p><details class="story-inline-detail"><summary>${t('readMore')}</summary><p>${esc(storyBody(story,2400)).split('\n').join('<br>')}</p><div class="story-extra-notes"><p><b>${msg('学び','Learning point','學習重點','学习重点')}：</b>${esc(field(story,'learning_point')||publicFallback(msg('学び','learning point','學習重點','学习重点')))}</p><p><b>${msg('食感','Texture','口感','口感')}：</b>${esc(field(story,'texture_note')||publicFallback(msg('食感','texture','口感','口感')))}</p><p><b>${msg('炊飯','Rice cooking','炊飯','煮饭')}：</b>${esc(field(story,'cooking_note')||publicFallback(msg('炊飯','rice cooking','炊飯','煮饭')))}</p></div></details></div>`:'';
 const storyRows=storyFiltered.map(x=>{const idx=stories.indexOf(x); const isToday=idx===todayIdx; return `<details class="story-accordion-row${isToday?' is-today':''}"><summary><span class="story-date">${esc(storyDateLabel(x))}</span><span class="story-title-main"><b>${esc(storyTitle(x))}</b><em>${esc(storyCountry(x))}${field(x,'theme')?' / '+esc(field(x,'theme')):''}</em></span><span class="story-open">${msg('開く','Open','開啟','打开')}</span></summary><div class="story-accordion-body"><p><b>${esc(storySubtitle(x))}</b></p><p>${esc(storyBody(x,2400)).split('\n').join('<br>')}</p><div class="story-extra-notes"><p><b>${msg('学び','Learning point','學習重點','学习重点')}：</b>${esc(field(x,'learning_point')||publicFallback(msg('学び','learning point','學習重點','学习重点')))}</p><p><b>${msg('好み・文化','Preference and culture','喜好・文化','喜好・文化')}：</b>${esc(field(x,'preference_viewpoint')||publicFallback(msg('好み・文化','preference and culture','喜好・文化','喜好・文化')))}</p><p><b>${msg('料理場面','Cooking scene','料理場景','料理场景')}：</b>${esc(field(x,'scene_note')||publicFallback(msg('料理場面','cooking scene','料理場景','料理场景')))}</p><p><b>${msg('食感','Texture','口感','口感')}：</b>${esc(field(x,'texture_note')||publicFallback(msg('食感','texture','口感','口感')))}</p><p><b>${msg('炊飯','Rice cooking','炊飯','煮饭')}：</b>${esc(field(x,'cooking_note')||publicFallback(msg('炊飯','rice cooking','炊飯','煮饭')))}</p></div><p>${chips([field(x,'texture_keywords'),field(x,'related_terms'),field(x,'related_card_search')])}</p></div></details>`}).join('');
 $('#future').innerHTML=`<div class="hero">${homeArt('future_farming','card-visual','世界のライス物語')}<h1>${ui('worldStories')}</h1><p>${msg('今日の日付に合わせた1話を先に見せ、その下に365日分のタイトルを日付付きで並べます。タイトルを開くと、その場で本文を読めます。','Shows the story for today’s date first, then lists all 365 dated titles. Open a title to read it in place.','先顯示今日日期對應的一篇，下面列出365天的日期與標題。開啟標題即可在原處閱讀。','先显示今日日期对应的一篇，下面列出365天的日期与标题。打开标题即可在原处阅读。')}</p></div>
 ${todayStoryHTML}
 <div class="section-title"><h2>${ui('worldStories365')}</h2></div>
 <div class="toolbar"><input placeholder="${ui('storySearch')}" value="${esc(storyQ)}" oninput="setFilter('storyq',this.value)"><select onchange="setFilter('storyCountry',this.value)"><option value="">${ui('allCountries')}</option>${storyCountries.map(c=>`<option ${c===storyCountryFilter?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="countbar">${stat(storyFiltered.length,ui('showingStories'))}${stat(stories.length,ui('totalStories'))}${stat(storyCountries.length,ui('countriesRegions'))}</div>
 <div class="story-title-list story-accordion-list">${storyRows}</div>`;
}

function renderRankings(){
 const defs=S.data.rankings?.rankings||[], rows=S.data.ranking_items_template||[];
 const rankNote=x=>localizedValue(x,'app_note')||tx(x,'app_note')||field(x,'app_note_ja');
 const rankItemName=x=>tx(x,'country_or_item')||field(x,'country_or_item_ja');
 const uniqueItems=(arr)=>{
   const seen=new Set();
   return arr.filter(x=>{const key=[x.ranking_id,x.rank,rankItemName(x),field(x,'value')].join('|'); if(seen.has(key)) return false; seen.add(key); return true;});
 };
 $('#rankings').innerHTML=`<div class="hero">${homeArt('ranking_award_detail','card-visual','ランキング')}<h1>${ui('rankingTitle')}</h1><p>${ui('rankingIntro')}</p></div><div class="list">${defs.map(def=>{const title=tx(def,'display_title')||tx(def,'ranking_name')||def.ranking_id, desc=tx(def,'short_desc')||tx(def,'value')||'', items=uniqueItems((def.items||[]).concat(rows.filter(x=>x.ranking_id===def.ranking_id&&has(x.country_or_item_ja)&&has(x.value))));return `<div class="item visual-item">${homeArt('ranking_detail','item-visual','ランキング詳細')}<h3>${esc(title)}</h3><p>${esc(desc)}</p><p>${chips([def.source_name,def.unit])}</p>${items.length?`<table><thead><tr><th>${ui('rank')}</th><th>${ui('countryItem')}</th><th>${ui('value')}</th><th>${ui('year')}</th></tr></thead><tbody>${items.slice(0,10).map(x=>{const note=rankNote(x);return `<tr><td>${esc(x.rank)}</td><td><b>${esc(rankItemName(x))}</b>${note?`<br><span class="small">${esc(note)}</span>`:''}</td><td>${esc(field(x,'value')||sourceFallback())} ${esc(field(x,'unit')||def.unit||'')}</td><td>${esc(field(x,'source_year')||sourceFallback())}</td></tr>`}).join('')}</tbody></table>`:`<p class="rank-empty">${msg('順位データは詳細で確認します','Ranking data can be checked in details','排行資料可在詳情確認','排行数据可在详情确认')}</p>`}<details><summary>${ui('definition')}</summary><p><b>${ui('unit')}：</b>${esc(def.unit||sourceFallback())}</p><p><b>${msg('計算方法','Calculation method','計算方法','计算方法')}：</b>${esc(tx(def,'calculation_method')||field(def,'calculation_method')||sourceFallback())}</p><p><b>${ui('note')}：</b>${esc(tx(def,'caution')||sourceFallback())}</p><p><b>${msg('表示について','Display note','顯示備註','显示备注')}：</b>${msg('各順位の短い説明は、確認済みの内容を中心に表示します。','Short notes focus on reviewed content when available.','各名次的簡短說明以已確認內容為主。','各名次的简短说明以已确认内容为主。')}</p><div class="source">${esc(def.source_name||sourceFallback())}</div></details></div>`}).join('')}</div>`;
}

function renderWords(){
 const fortuneItems=fortuneList(), dailyFortuneItem=dailyFortune(), fortuneQ=S.filters.wordq||'', daily=S.data.daily_rice_words||[], glossary=S.data.glossary||[], q=S.filters.wordq||'', cat=S.filters.wordcat||'', gcat=S.filters.gcat||'';
 const cats=[...new Set(daily.map(x=>x.category).filter(has))].sort();
 const gcats=[...new Set(glossary.map(x=>field(x,'category_ja')).filter(has))].sort();
 const dailyFiltered=daily.filter(x=>(!q||JSON.stringify(x).includes(q))&&(!cat||x.category===cat));
 const fortuneFiltered=fortuneItems.filter(x=>!fortuneQ||JSON.stringify(x).includes(fortuneQ));
 const preferred=['浸漬','吸水','蒸らし','ほぐし','糊化','粘り','硬さ','水加減','べたつき','老化','結露','硬度','pH'];
 const glossaryFiltered=[...glossary].sort((a,b)=>{const ia=preferred.indexOf(a.term_ja), ib=preferred.indexOf(b.term_ja);return (ia<0?999:ia)-(ib<0?999:ib)||termName(a).localeCompare(termName(b),'ja');}).filter(x=>(!q||JSON.stringify(x).includes(q))&&(!gcat||field(x,'category_ja')===gcat));
 $('#words').innerHTML=`<div class="hero">${homeArt('rice_word_detail','card-visual','米辞典')}<h1>${ui('riceDictionaryWords')}</h1><p>${msg('米づくり・炊飯・品種・保管に関係する1000語を、ひとつの辞典として検索できます。よく使う語は見つけやすい順に表示します。','Search 1,000 terms related to rice growing, cooking, varieties, and storage in one dictionary. Frequently used terms are shown first.','可在同一個辭典中搜尋與種米、炊飯、品種、保存相關的1000個用語。常用詞會優先顯示。','可在同一个词典中搜索与种米、煮饭、品种、保存相关的1000个术语。常用词会优先显示。')}</p></div>
 <div class="section-title"><h2>${ui('dictionary1000')}</h2></div>
 <div class="toolbar"><input placeholder="${ui('termSearch')}" value="${esc(q)}" oninput="setFilter('wordq',this.value)"><select onchange="setFilter('gcat',this.value)"><option value="">${ui('allTermCats')}</option>${gcats.map(c=>`<option ${c===gcat?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div class="countbar">${stat(glossaryFiltered.length,ui('showingTerms'))}${stat(glossary.length,ui('totalTerms'))}${stat(gcats.length,ui('termCategories'))}</div>
 <div class="priority-row">${preferred.map(k=>`<button onclick="S.filters.wordq='${k}';renderWords()">${k}</button>`).join('')}<button onclick="S.filters.wordq='';S.filters.gcat='';renderWords()">${ui('all')}</button></div>
 <div class="list">${glossaryFiltered.map(x=>`<div class="item glossary-item"><h3>${esc(termName(x))}</h3><p>${chips([field(x,'category_ja'),field(x,'display_group_ja')])}</p><p><b>${msg('説明','Description','說明','说明')}：</b>${esc(field(x,'desc_ja')||termNote(x))}</p>${maybeLine(msg('炊飯・米との関係','Connection to rice cooking','與炊飯・米的關係','与煮饭・米的关系'),field(x,'relevance_ja'))}${maybeLine(msg('今日の見方','How to use today','今日的看法','今天的看法'),field(x,'today_view_ja'))}<details><summary>${ui('fourLangRelated')}</summary>${maybeLine('EN',field(x,'term_en'))}${maybeLine('繁體',field(x,'term_zh_tw'))}${maybeLine('简体',field(x,'term_zh_cn'))}${maybeLine(msg('関連語','Related terms','相關詞','相关词'),field(x,'related_terms_ja'))}${relatedTermButtons(field(x,'related_terms_ja'))}<div class="source">${msg('関連語と4言語表記を確認できます。','You can check related terms and four-language labels.','可確認相關詞與4語言表記。','可确认相关词与4语言标记。')}</div></details><div class="priority-row"><details class="term-related-links"><summary>${msg('関連リンク','Related links','相關連結','相关链接')}</summary><div class="term-link-actions"><button class="btn secondary" onclick="S.filters.learn='${esc(field(x,'term_ja'))}';switchView('learn')">${msg('学ぶで見る','View in Learn','在學習查看','在学习查看')}</button><button class="btn secondary" onclick="S.filters.litq='${esc(field(x,'term_ja'))}';switchView('literature')">${msg('この用語の文献を見る','View references for this term','查看此用語的文獻','查看此术语的文献')}</button></div></details></div></div>`).join('')}</div>
 <div class="section-title"><h2>${ui('dailyFortune100')}</h2></div><p class="data-note">${msg('米占いはお楽しみ表示です。ラッキーナンバー、米種、工程、ひとことをまとめて見られます。工程名から辞典へ進めます。','Rice fortune is a light daily feature. It shows a lucky number, rice type, process, and phrase, and lets you open the process in the dictionary.','米占卜是輕鬆的每日功能。可查看幸運數字、米種、工序與一句話，也可從工序進入辭典。','米占卜是轻松的每日功能。可查看幸运数字、米种、工序与一句话，也可从工序进入词典。')}</p>
 <div class="countbar">${stat(fortuneFiltered.length,ui('showingFortune'))}${stat(fortuneItems.length,ui('fortuneTotal'))}${stat((S.data.rice_fortune?.processes||[]).length,ui('processes'))}</div>
 ${dailyFortuneItem?`<div class="card daily-fortune-detail visual-card">${homeArt('daily_fortune_detail','card-visual','今日の米占い')}<h3>${t('todayFortune')}</h3><p>${chips([fortuneOf(dailyFortuneItem)?.number,fortuneOf(dailyFortuneItem)?.rice,fortuneOf(dailyFortuneItem)?.process])}</p><p><b>${esc(fortuneOf(dailyFortuneItem)?.title)}</b></p><p>${esc(fortuneOf(dailyFortuneItem)?.message)}</p><p><b>${ui('todayOneWord')}：</b>${esc(fortuneOf(dailyFortuneItem)?.one)}</p>${fortuneProcessLink(fortuneOf(dailyFortuneItem)?.process)}</div>`:''}
 <div class="list compact-fortune-list">${fortuneFiltered.slice(0,100).map(x=>{const f=fortuneOf(x);return `<div class="item fortune-item"><h3>${esc(f.title)}</h3><p>${chips([f.number,f.rice,f.process])}</p><p>${esc(f.message)}</p><p><b>${ui('todayOneWord')}：</b>${esc(f.one)}</p>${fortuneProcessLink(f.process)}</div>`}).join('')}</div>
 <div class="section-title"><h2>${ui('dailyWords100')}</h2></div>${homeArt('rice_word_detail','card-visual','今日の米言葉')}<p class="data-note">${msg('米言葉は用語集の代用ではなく、専用Excelの花言葉風メッセージです。','Daily rice words are a separate flower-language-style message set, not a substitute for the dictionary.','今日米語是獨立的花語風訊息，不是用語集的替代品。','今日米语是独立的花语风信息，不是术语集的替代品。')}</p><div class="toolbar"><select onchange="setFilter('wordcat',this.value)"><option value="">${ui('allCategories')}</option>${cats.map(c=>`<option ${c===cat?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="countbar">${stat(dailyFiltered.length,ui('showingDailyWords'))}${stat(daily.length,ui('wordTotal'))}${stat(cats.length,ui('category'))}</div>
 <div class="list">${dailyFiltered.map(x=>`<div class="item"><h3>${esc(tx(x,'title')||field(x,'title_ja'))}</h3><p>${chips([x.category])}</p><p><b>${ui('riceWord')}：</b>${esc(tx(x,'meaning')||field(x,'meaning_ja'))}</p><p><b>${ui('todayOneWord')}：</b>${esc(tx(x,'message')||field(x,'message_ja'))}</p>${field(x,'note_ja')?`<details><summary>${ui('background')}</summary><p>${esc(field(x,'note_ja'))}</p></details>`:''}</div>`).join('')}</div>`;
}

load().catch(e=>{document.body.innerHTML='<main><div class="card empty"><h1>データ読み込みエラー</h1><p>data/rice_navi_data.json が同じ場所にアップロードされているか確認してください。</p><pre>'+esc(e.stack||e)+'</pre></div></main>'});


// TEXTRECOVERY11_CLICKFIX: expose navigation functions for inline/capture bridge.
try{
  window.switchView=switchView;
  window.goView=goView;
  window.goBack=goBack;
  window.setLanguage=setLanguage;
  window.setVarietySearch=setVarietySearch;
  window.setGlossarySearch=setGlossarySearch;
  window.setFortuneSearch=setFortuneSearch;
  window.setFutureDetail=setFutureDetail;
}catch(e){}
