'use strict';
(() => {
const ENDPOINT='https://havsvkhddvdbzbsmhqbr.supabase.co/functions/v1/spm343-tap-lab2';
const $=id=>document.getElementById(id);
let busy=false,lastSuccess=null;
function formatName(v){return v==='tournament'?'Beginner-friendly mini-tournament':'Guided play + short team exhibition';}
async function refresh(){
 if(busy)return;busy=true;$('refresh').disabled=true;
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch(`${ENDPOINT}?view=guest`,{cache:'no-store',signal:controller.signal});const data=await response.json();
  if(!response.ok||!data.ok||data.mode!=='pilot'||data.synthetic!==true||!data.aggregate)throw Error('Pilot unavailable');
  const a=data.aggregate;
  for(const [id,key]of[['started','started'],['initial','initialPlans'],['completed','completedRevisions']])$(id).textContent=String(Number(a[key])||0);
  const guided=Number(a.formats?.guided)||0,tournament=Number(a.formats?.tournament)||0,total=Math.max(guided+tournament,1);
  $('guided-count').textContent=String(guided);$('tournament-count').textContent=String(tournament);
  $('guided-bar').style.width=`${100*guided/total}%`;$('tournament-bar').style.width=`${100*tournament/total}%`;
  $('shared-demo').hidden=!data.demo;
  if(data.demo){$('demo-format').textContent=formatName(data.demo.format);$('demo-stage').textContent=({draft:'Choosing the event',plan_locked:'Initial plan saved · listening to Andrew',submitted:'Reflection complete'})[data.demo.stage]||'Practice in progress';$('demo-summary').textContent=data.demo.summary||'';}
  $('proposals').replaceChildren();const proposals=Array.isArray(data.proposals)?data.proposals:[];$('no-proposals').hidden=proposals.length>0;
  for(const p of proposals){const article=document.createElement('article');article.className='proposal';const h=document.createElement('h3');h.textContent=`${p.label} · ${formatName(p.format)}`;const text=document.createElement('p');text.textContent=p.summary;article.append(h,text);$('proposals').append(article);}
  lastSuccess=new Date();$('refresh-status').textContent=`Updated ${lastSuccess.toLocaleTimeString()} · Synthetic pilot data`;
 }catch{ $('refresh-status').textContent=lastSuccess?`Connection interrupted. Showing the last saved view from ${lastSuccess.toLocaleTimeString()}. Trying again automatically.`:'The live pilot is not available yet. No data is shown. Try Refresh now shortly.'; }
 finally{clearTimeout(timeout);busy=false;$('refresh').disabled=false;}
}
$('refresh').addEventListener('click',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(()=>{if(!document.hidden)refresh();},10000);refresh();
})();
