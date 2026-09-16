// Keeps the basketball shot clock on one 24-second wall-clock deadline even when
// the screen re-renders after a play selection. Isolated to this activity.
(()=>{
  const nativeSet=window.setInterval.bind(window);
  const nativeClear=window.clearInterval.bind(window);
  let guardedId=null,deadline=null;
  window.setInterval=function(fn,delay,...args){
    if(delay!==1000)return nativeSet(fn,delay,...args);
    const now=Date.now();
    if(deadline===null)deadline=now+24000;
    if(guardedId!==null)nativeClear(guardedId);
    const elapsed=Math.max(0,24-Math.ceil((deadline-now)/1000));
    for(let i=0;i<elapsed;i++)fn(...args);
    guardedId=nativeSet(fn,delay,...args);
    return guardedId;
  };
  window.clearInterval=function(id){
    nativeClear(id);
    if(id===guardedId){guardedId=null;deadline=null;}
  };
})();
