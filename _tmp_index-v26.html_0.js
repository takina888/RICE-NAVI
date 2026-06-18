
    window.RICE_NAVI_VERSION = 'v26';
    window.RICE_NAVI_CACHE_BUST = '26';
    window.RICE_NAVI_APP_STARTED = false;
    window.addEventListener('error', function(e){
      try{
        var el=document.getElementById('bootError');
        if(el){ el.style.display='block'; el.innerHTML='起動エラー：'+String(e.message||e.error||'不明')+'<br>index.html内蔵スクリプトで停止しました。'; }
      }catch(_){ }
    });
    (function(){
      try{
        if('serviceWorker' in navigator){
          navigator.serviceWorker.getRegistrations()
            .then(function(regs){ return Promise.all(regs.map(function(r){ return r.unregister(); })); })
            .catch(function(){});
        }
        if('caches' in window){
          caches.keys()
            .then(function(names){ return Promise.all(names.map(function(n){ return caches.delete(n); })); })
            .catch(function(){});
        }
      }catch(e){}
      setTimeout(function(){
        if(!window.RICE_NAVI_APP_STARTED){
          var el=document.getElementById('bootError');
          if(el) el.style.display='block';
        }
      },9000);
    })();
  