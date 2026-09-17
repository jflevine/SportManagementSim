// Safe presentation loader.
// Heavy per-frame district rendering remains disabled; presentation modules only add
// lightweight motion and classroom-director feedback without changing core game state.
(function(){
  document.documentElement.dataset.ecosystemWorldArt='safe';
  import('./motion-enhance.js').catch(err=>{try{console.warn('Movement enhancement unavailable.',err)}catch{}});
  import('./classroom-director.js').catch(err=>{try{console.warn('Classroom director unavailable.',err)}catch{}});
})();
