// Emergency stability hotfix.
// Phase 2 district rendering is temporarily disabled to guarantee responsive student play.
// The next visual restoration will use explicit renderer calls rather than Canvas prototype hooks.
(function(){
  document.documentElement.dataset.ecosystemWorldArt='safe';
})();
