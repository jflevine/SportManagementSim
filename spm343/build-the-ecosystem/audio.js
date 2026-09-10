(function(){
const PREF_KEY='spm343_rpg_audio_v1';
let muted=localStorage.getItem(PREF_KEY)==='muted';
let ctx=null, master=null, musicGain=null, sfxGain=null, musicTimer=null, step=0, started=false;
const AudioCtx=window.AudioContext||window.webkitAudioContext;
const melody=[261.63,329.63,392.00,523.25,392.00,329.63,293.66,349.23,440.00,587.33,440.00,349.23,246.94,329.63,392.00,493.88];
const bass=[130.81,130.81,146.83,146.83,123.47,123.47,110.00,110.00];

function ensure(){
  if(!AudioCtx) return false;
  if(!ctx){
    ctx=new AudioCtx();
    master=ctx.createGain(); musicGain=ctx.createGain(); sfxGain=ctx.createGain();
    master.gain.value=muted?0:0.7; musicGain.gain.value=0.055; sfxGain.gain.value=0.18;
    musicGain.connect(master); sfxGain.connect(master); master.connect(ctx.destination);
  }
  if(ctx.state==='suspended') ctx.resume();
  return true;
}
function tone(freq,dur=0.09,type='square',vol=1,delay=0,dest=sfxGain){
  if(muted||!ensure()) return;
  const t=ctx.currentTime+delay, o=ctx.createOscillator(), g=ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0001,vol),t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+0.02);
}
function noise(dur=.05,vol=.025){
  if(muted||!ensure()) return;
  const n=Math.max(1,Math.floor(ctx.sampleRate*dur)), b=ctx.createBuffer(1,n,ctx.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
  const src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=b;g.gain.value=vol;src.connect(g);g.connect(sfxGain);src.start();
}
function blip(){tone(660,.055,'square',.045);tone(990,.04,'square',.025,.04)}
function talk(){tone(392,.045,'square',.035);tone(440,.045,'square',.03,.055);tone(523.25,.05,'square',.025,.11)}
function item(){tone(523.25,.08,'square',.05);tone(659.25,.08,'square',.05,.08);tone(783.99,.12,'square',.055,.16)}
function quest(){[392,523.25,659.25,783.99].forEach((f,i)=>tone(f,.12,'square',.055,i*.085))}
function level(){[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,.16,'square',.065,i*.11))}
function warning(){tone(220,.08,'square',.055);tone(185,.1,'square',.05,.11)}
function open(){tone(330,.05,'triangle',.035);tone(494,.06,'square',.025,.05)}

function musicTick(){
  if(muted||!ensure()) return;
  const m=melody[step%melody.length], b=bass[Math.floor(step/2)%bass.length];
  tone(m,.15,'square',.018,0,musicGain);
  if(step%2===0) tone(b,.22,'triangle',.025,0,musicGain);
  if(step%4===2) noise(.025,.006);
  step++;
}
function startMusic(){
  if(started||muted||!ensure()) return;
  started=true; musicTick(); musicTimer=setInterval(musicTick,240);
}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}started=false}
function setMuted(v){
  muted=v;localStorage.setItem(PREF_KEY,muted?'muted':'on');
  if(master) master.gain.setTargetAtTime(muted?0:0.7,ctx.currentTime,.03);
  if(muted) stopMusic(); else {ensure();startMusic();blip()}
  syncButtons();
}
function toggle(e){if(e)e.stopPropagation();ensure();setMuted(!muted)}
function syncButtons(){document.querySelectorAll('[data-audio-toggle]').forEach(b=>{b.textContent=muted?'🔇 Muted':'🔊 Audio';b.setAttribute('aria-pressed',String(!muted));b.title=muted?'Turn game audio on':'Mute game audio'})}
function installButtons(){
  const actions=document.querySelector('.start-panel .actions');
  if(actions&&!document.getElementById('audioTitleBtn')){const b=document.createElement('button');b.id='audioTitleBtn';b.className='btn btn-secondary';b.dataset.audioToggle='1';b.onclick=toggle;actions.appendChild(b)}
  const top=document.querySelector('.world-topbar .top-right');
  if(top&&!document.getElementById('audioGameBtn')){const b=document.createElement('button');b.id='audioGameBtn';b.className='hud-pill';b.dataset.audioToggle='1';b.onclick=toggle;top.prepend(b)}
  const menu=document.getElementById('pauseMenu');
  if(menu&&!document.getElementById('audioMenuBtn')){const b=document.createElement('button');b.id='audioMenuBtn';b.className='btn btn-secondary';b.dataset.audioToggle='1';b.onclick=toggle;menu.insertBefore(b,menu.querySelector('#returnTitleBtn'))}
  syncButtons();
}

// Browser audio may only start after a user gesture.
document.addEventListener('pointerdown',()=>{if(!muted){ensure();startMusic()}},{once:true,capture:true});
document.addEventListener('keydown',e=>{if(!muted){ensure();startMusic()} if((e.key==='e'||e.key==='E')&&!document.getElementById('modalBackdrop')?.classList.contains('hidden')) return; if(e.key==='e'||e.key==='E') talk()});
document.addEventListener('click',e=>{
  if(e.target.closest('[data-audio-toggle]')) return;
  if(e.target.closest('button,.archetype,.avatar-choice,.choice,.decision')) blip();
  if(e.target.closest('#talkMobile')) talk();
});

const toast=document.getElementById('toast');
if(toast){new MutationObserver(()=>{const t=(toast.textContent||'').toLowerCase();if(!t)return;if(t.includes('level up'))level();else if(t.includes('item acquired'))item();else if(t.includes('quest')&&t.includes('complete'))quest();else if(t.includes('locked')||t.includes('cannot'))warning();}).observe(toast,{childList:true,subtree:true,characterData:true})}
const modal=document.getElementById('modalBackdrop');
if(modal){new MutationObserver(()=>{if(!modal.classList.contains('hidden'))open()}).observe(modal,{attributes:true,attributeFilter:['class']})}
const game=document.getElementById('gameScreen');
if(game){new MutationObserver(()=>{if(!game.classList.contains('hidden')&&!muted){ensure();startMusic()}}).observe(game,{attributes:true,attributeFilter:['class']})}

window.RPG_AUDIO={blip,talk,item,quest,level,warning,setMuted,isMuted:()=>muted};
installButtons();
})();