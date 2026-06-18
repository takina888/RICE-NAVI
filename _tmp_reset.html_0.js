
function log(t){document.getElementById('log').textContent += '
' + t;}
async function resetAndOpen(){
  document.getElementById('log').textContent='初期化開始';
  try{
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations(); log('Service Worker: '+regs.length+'件');
      for(const r of regs){ await r.unregister(); }
      log('Service Worker解除完了');
    } else { log('Service Worker未対応'); }
    if('caches' in window){
      const names=await caches.keys(); log('Cache Storage: '+names.length+'件');
      for(const n of names){ await caches.delete(n); }
      log('Cache Storage削除完了');
    } else { log('Cache Storage未対応'); }
    log('v26へ移動します');
    location.href='./index.html?v=26&reset='+Date.now();
  }catch(e){ log('エラー: '+(e && e.message ? e.message : e)); }
}
window.addEventListener('load',()=>setTimeout(resetAndOpen,500));
