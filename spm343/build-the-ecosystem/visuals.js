// Emergency stability hotfix.
// The Phase 1 visual layer previously monkeypatched CanvasRenderingContext2D methods.
// That presentation enhancement is temporarily disabled so the core game loop remains
// responsive and student play is reliable. Character/environment art will be restored
// only through explicit renderer calls rather than global Canvas prototype overrides.
(function(){
  document.documentElement.dataset.ecosystemVisualMode='safe';
})();
