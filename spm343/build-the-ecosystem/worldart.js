// Safe presentation loader.
// Heavy per-frame district rendering remains disabled; the movement layer only decorates
// existing actor draw calls and adds lightweight DOM/CSS motion feedback.
(function(){
  document.documentElement.dataset.ecosystemWorldArt='safe';
  import('./motion-enhance.js').catch(err=>{try{console.warn('Movement enhancement unavailable.',err)}catch{}});
})();
