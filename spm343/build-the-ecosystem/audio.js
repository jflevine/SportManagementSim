(function(){
const PREF_KEY='spm343_rpg_audio_v2';
let muted=localStorage.getItem(PREF_KEY)==='muted';
let ctx=null,master=null,musicGain=null,sfxGain=null,ambienceGain=null,musicTimer=null,step=0,started=false,currentMood='title';
const AudioCtx=window.AudioContext||window.webkitAudioContext;

const MOODS={
  title:{root:146.83,mode:[0,3,7,10],tempo:136,energy:.62,lead:'triangle',pad:'sine'},
  grassroots:{root:164.81,mode:[0,3,7,10],tempo:132,energy:.82,lead:'square',pad:'triangle'},
  scholastic:{root:174.61,mode:[0,4,7,11],tempo:126,energy:.58,lead:'triangle',pad:'sine'},
  creator:{root:196.00,mode:[0,3,7,10],tempo:142,energy:.86,lead:'sawtooth',pad:'triangle'},
  college:{root:155.56,mode:[0,4,7,11],tempo:130,energy:.7,lead:'triangle',pad:'sine'},
  sponsor:{root:185.00,mode:[0,4,7,10],tempo:128,energy:.68,lead:'triangle',pad:'sine'},
  publisher:{root:138.59,mode:[0,3,7,10],tempo:122,energy:.54,lead:'sine',pad:'triangle'},
  pro:{root:155.56,mode:[0,3,7,10],tempo:146,energy:.94,lead:'sawtooth',pad:'triangle'},
  event:{root:174.61,mode:[0,3,7,10],tempo:150,energy:1,lead:'square',pad:'triangle'},
  boardroom:{root:130.81,mode:[0,3,7,10],tempo:116,energy:.48,lead:'sine',pad:'sine'}
};
const ZONE_MAP={'Grassroots Arcade':'grassroots','Scholastic Lab':'scholastic','Creator Studio':'creator','Campus Arena':'college','Sponsorship Row':'sponsor','Publisher Tower':'publisher','Pro District':'pro','Global Event Center':'event','Ecosystem Boardroom':'boardroom','Ecosystem City':'title'};

function ensure(){
  if(!AudioCtx)return false;
  if(!ctx){
    ctx=new AudioCtx();
    master=ctx.createGain();musicGain=ctx.createGain();sfxGain=ctx.createGain();ambienceGain=ctx.createGain();
    const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=16;limiter.ratio.value=5;limiter.attack.value=.005;limiter.release.value=.18;
    master.gain.value=muted?0:.72;musicGain.gain.value=.085;sfxGain.gain.value=.23;ambienceGain.gain.value=.035;
    musicGain.connect(master);sfxGain.connect(master);ambienceGain.connect(master);master.connect(limiter);limiter.connect(ctx.destination);
  }
  if(ctx.state==='suspended')ctx.resume();
  return true;
}
function hz(root,semitones){return root*Math.pow(2,semitones/12)}
function envGain(dest,t,attack,peak,release){const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+attack+release);g.connect(dest);return g}
function synth(freq,dur=.12,type='triangle',vol=.03,delay=0,dest=musicGain,filter=2200,detune=0){
  if(muted||!ensure())return;const t=ctx.currentTime+delay,o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=envGain(dest,t,.012,vol,Math.max(.025,dur));
  o.type=type;o.frequency.setValueAtTime(freq,t);o.detune.setValueAtTime(detune,t);f.type='lowpass';f.frequency.setValueAtTime(filter,t);f.Q.value=.7;o.connect(f);f.connect(g);o.start(t);o.stop(t+dur+.05);
}
function noise(dur=.05,vol=.025,delay=0,dest=sfxGain,highpass=1200){
  if(muted||!ensure())return;const t=ctx.currentTime+delay,n=Math.max(1,Math.floor(ctx.sampleRate*dur)),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=envGain(dest,t,.003,vol,Math.max(.018,dur));src.buffer=b;f.type='highpass';f.frequency.value=highpass;src.connect(f);f.connect(g);src.start(t);
}
function kick(delay=0,vol=.055){if(muted||!ensure())return;const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(118,t);o.frequency.exponentialRampToValueAtTime(46,t+.12);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+.17)}
function snare(delay=0,vol=.022){noise(.11,vol,delay,musicGain,900);synth(185,.09,'triangle',vol*.55,delay,musicGain,900)}
function hat(delay=0,vol=.008){noise(.025,vol,delay,musicGain,5200)}
function pad(root,mode,delay=0,vol=.014,type='sine'){
  [mode[0],mode[1],mode[2]].forEach((s,i)=>{synth(hz(root,s+(i===2?12:0)),.78,type,vol*(i===0?1:.78),delay,musicGain,1050,i===1?-4:4)});
}
function arp(mood,index){const degrees=[0,2,1,3,2,1,3,1],s=mood.mode[degrees[index%degrees.length]%mood.mode.length]+(index%4>1?12:0);synth(hz(mood.root,s),.12,mood.lead,.009+.009*mood.energy,0,musicGain,2300+1400*mood.energy,index%2?3:-3)}
function bass(mood,index){const s=index%2===0?mood.mode[0]:mood.mode[2]-12;synth(hz(mood.root,s),.22,'triangle',.018+.012*mood.energy,0,musicGain,620)}
function ambience(mood){if(step%32!==0)return;const root=mood.root/2;synth(root,1.8,'sine',.008,0,ambienceGain,520);synth(root*1.5,1.55,'sine',.004,.08,ambienceGain,740)}

function musicTick(){
  if(muted||!ensure())return;const mood=MOODS[currentMood]||MOODS.title,beat=60000/mood.tempo/4;
  if(step%16===0)pad(mood.root,mood.mode,0,.012+.006*mood.energy,mood.pad);
  if(step%16===8)pad(hz(mood.root,mood.mode[1]),mood.mode,0,.009+.004*mood.energy,mood.pad);
  if(step%4===0)bass(mood,Math.floor(step/4));
  if(step%2===0)arp(mood,Math.floor(step/2));
  if(step%8===0)kick(0,.034+.022*mood.energy);
  if(step%8===4)snare(0,.012+.012*mood.energy);
  if(step%2===1&&mood.energy>.6)hat(0,.004+.004*mood.energy);
  ambience(mood);step=(step+1)%64;
  if(musicTimer){clearTimeout(musicTimer);musicTimer=setTimeout(musicTick,beat)}
}
function startMusic(){if(started||muted||!ensure())return;started=true;step=0;musicTimer=setTimeout(musicTick,0)}
function stopMusic(){if(musicTimer){clearTimeout(musicTimer);musicTimer=null}started=false}
function setMood(next){if(!MOODS[next]||next===currentMood)return;currentMood=next;step=0;if(musicGain&&ctx)musicGain.gain.setTargetAtTime(.075,ctx.currentTime,.18)}

function blip(){if(muted)return;synth(720,.045,'sine',.055,0,sfxGain,4200);synth(1040,.06,'triangle',.035,.035,sfxGain,5200)}
function talk(){if(muted)return;[392,466.16,523.25].forEach((f,i)=>synth(f,.055,'triangle',.04,i*.045,sfxGain,2600))}
function item(){if(muted)return;[523.25,659.25,783.99,1046.5].forEach((f,i)=>synth(f,.13,'triangle',.055,i*.065,sfxGain,4200));noise(.08,.018,.08,sfxGain,3800)}
function quest(){if(muted)return;[392,493.88,587.33,783.99].forEach((f,i)=>synth(f,.18,i<2?'triangle':'sine',.06,i*.08,sfxGain,3600));kick(.02,.045)}
function level(){if(muted)return;[523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>synth(f,.21,'triangle',.066,i*.075,sfxGain,4800));noise(.14,.02,.16,sfxGain,4200)}
function warning(){if(muted)return;synth(220,.11,'sawtooth',.045,0,sfxGain,1100);synth(185,.14,'sawtooth',.042,.1,sfxGain,900)}
function open(){if(muted)return;synth(330,.055,'sine',.04,0,sfxGain,3500);synth(494,.07,'triangle',.032,.04,sfxGain,4200)}
function confirm(){if(muted)return;synth(523.25,.07,'sine',.04,0,sfxGain,4200);synth(783.99,.08,'triangle',.032,.045,sfxGain,5000)}
function foot(){if(muted||!ensure())return;noise(.018,.006,0,sfxGain,500);synth(105,.025,'sine',.008,0,sfxGain,420)}

function setMuted(v){
  muted=v;localStorage.setItem(PREF_KEY,muted?'muted':'on');if(master&&ctx)master.gain.setTargetAtTime(muted?0:.72,ctx.currentTime,.04);if(muted)stopMusic();else{ensure();startMusic();blip()}syncButtons();
}
function toggle(e){if(e)e.stopPropagation();ensure();setMuted(!muted)}
function syncButtons(){document.querySelectorAll('[data-audio-toggle]').forEach(b=>{b.textContent=muted?'🔇 Muted':'🔊 Sound';b.setAttribute('aria-pressed',String(!muted));b.title=muted?'Turn game audio on':'Mute game audio'})}
function installButtons(){
  const actions=document.querySelector('.start-panel .actions');if(actions&&!document.getElementById('audioTitleBtn')){const b=document.createElement('button');b.id='audioTitleBtn';b.className='btn btn-secondary';b.dataset.audioToggle='1';b.onclick=toggle;actions.appendChild(b)}
  const top=document.querySelector('.world-topbar .top-right');if(top&&!document.getElementById('audioGameBtn')){const b=document.createElement('button');b.id='audioGameBtn';b.className='hud-pill';b.dataset.audioToggle='1';b.onclick=toggle;top.prepend(b)}
  const menu=document.getElementById('pauseMenu');if(menu&&!document.getElementById('audioMenuBtn')){const b=document.createElement('button');b.id='audioMenuBtn';b.className='btn btn-secondary';b.dataset.audioToggle='1';b.onclick=toggle;menu.insertBefore(b,menu.querySelector('#returnTitleBtn'))}syncButtons();
}

let lastFoot=0;
document.addEventListener('pointerdown',()=>{if(!muted){ensure();startMusic()}},{once:true,capture:true});
document.addEventListener('keydown',e=>{
  if(!muted){ensure();startMusic()}
  if((e.key==='e'||e.key==='E')&&!document.getElementById('modalBackdrop')?.classList.contains('hidden'))return;
  if(e.key==='e'||e.key==='E')talk();
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){const now=performance.now();if(now-lastFoot>190){lastFoot=now;foot();}}
});
document.addEventListener('click',e=>{if(e.target.closest('[data-audio-toggle]'))return;if(e.target.closest('.choice,.mini-card,#finishQuestBtn,#backWorld'))confirm();else if(e.target.closest('button,.archetype,.avatar-choice,.decision'))blip();if(e.target.closest('#talkMobile'))talk();});

const toast=document.getElementById('toast');if(toast)new MutationObserver(()=>{const t=(toast.textContent||'').toLowerCase();if(!t)return;if(t.includes('level up'))level();else if(t.includes('item acquired'))item();else if(t.includes('quest')&&t.includes('complete'))quest();else if(t.includes('locked')||t.includes('cannot'))warning();}).observe(toast,{childList:true,subtree:true,characterData:true});
const modal=document.getElementById('modalBackdrop');if(modal)new MutationObserver(()=>{if(!modal.classList.contains('hidden'))open()}).observe(modal,{attributes:true,attributeFilter:['class']});
const game=document.getElementById('gameScreen');if(game)new MutationObserver(()=>{if(!game.classList.contains('hidden')&&!muted){ensure();startMusic()}else if(game.classList.contains('hidden'))setMood('title')}).observe(game,{attributes:true,attributeFilter:['class']});
const zone=document.getElementById('zoneName');if(zone)new MutationObserver(()=>setMood(ZONE_MAP[(zone.textContent||'').trim()]||'title')).observe(zone,{childList:true,subtree:true,characterData:true});

window.RPG_AUDIO={blip,talk,item,quest,level,warning,confirm,setMuted,setMood,isMuted:()=>muted};installButtons();
})();