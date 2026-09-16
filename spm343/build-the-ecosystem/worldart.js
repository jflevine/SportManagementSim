// Phase 2.1 — optimized district art
// Static district scenes are pre-rendered once into offscreen canvases and then
// composited with a single drawImage call during the game render. This avoids
// the heavy per-frame drawing path that could stall the live game.
(function(){
  const D=window.RPG_DATA||{};
  const proto=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
  if(!proto||proto.__ecosystemCachedWorldArt)return;
  proto.__ecosystemCachedWorldArt=true;
  const priorFillRect=proto.fillRect;
  const isWorld=ctx=>ctx&&ctx.canvas&&ctx.canvas.id==='world';
  const zones=Object.entries(D.zones||{});
  const inner=zones.map(([id,z])=>({id,z,x:z.x+14,y:z.y+17,w:z.w-28,h:z.h-42}));
  const cache=new Map();
  let disabled=false;

  function rect(c,x,y,w,h,fill,stroke){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.strokeRect(x+.5,y+.5,w-1,h-1)}}
  function line(c,x1,y1,x2,y2,stroke,width=1){c.strokeStyle=stroke;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
  function screen(c,x,y,w,h,color,label){rect(c,x,y,w,h,'#071321','rgba(255,255,255,.14)');rect(c,x+3,y+3,w-6,h-6,color);c.fillStyle='#eef8ff';c.font="700 7px 'Times New Roman'";c.textAlign='center';c.fillText(label||'LIVE',x+w/2,y+h/2+2)}
  function desk(c,x,y,w,color){rect(c,x,y,w,10,'#31445a');rect(c,x+4,y+10,4,12,'#182638');rect(c,x+w-8,y+10,4,12,'#182638');line(c,x+8,y+4,x+w-8,y+4,color,1.3)}
  function pc(c,x,y,color){screen(c,x,y,24,15,color,'');rect(c,x+10,y+15,4,6,'#59687a');rect(c,x+5,y+21,14,2,'#263548')}
  function chair(c,x,y){c.fillStyle='#26394f';c.beginPath();c.arc(x,y,6,0,Math.PI*2);c.fill();rect(c,x-1,y+5,2,8,'#1a2838')}
  function arcade(c,x,y,color,label){rect(c,x,y,22,38,'#101c2c',color);screen(c,x+4,y+5,14,11,color,label||'GO');rect(c,x+5,y+23,12,3,color);c.fillStyle='#f1c75c';c.beginPath();c.arc(x+8,y+30,2,0,Math.PI*2);c.fill()}
  function rack(c,x,y,color){rect(c,x,y,21,44,'#0e1825','rgba(255,255,255,.12)');for(let i=0;i<5;i++){rect(c,x+3,y+5+i*7,15,4,'#22374c');c.fillStyle=i%2?color:'#7ad9a2';c.beginPath();c.arc(x+16,y+7+i*7,1.2,0,Math.PI*2);c.fill()}}
  function camera(c,x,y,color){rect(c,x,y,17,10,'#1b2a3b',color);c.fillStyle=color;c.beginPath();c.moveTo(x+17,y+2);c.lineTo(x+23,y-1);c.lineTo(x+23,y+11);c.lineTo(x+17,y+8);c.closePath();c.fill();line(c,x+8,y+10,x+2,y+25,'#4e6174',2);line(c,x+8,y+10,x+14,y+25,'#4e6174',2)}
  function trophy(c,x,y,color){c.fillStyle=color;c.beginPath();c.moveTo(x-6,y);c.lineTo(x+6,y);c.lineTo(x+3,y+10);c.quadraticCurveTo(x,y+14,x-3,y+10);c.closePath();c.fill();rect(c,x-1,y+11,2,5,color);rect(c,x-5,y+16,10,3,color)}
  function crowd(c,x,y,w,count,color){const cols=Math.max(1,Math.floor(w/10));for(let i=0;i<count;i++){const px=x+(i%cols)*10+(i%3),py=y+Math.floor(i/cols)*8;c.fillStyle=i%4===0?color:'rgba(176,196,216,.44)';c.beginPath();c.arc(px,py,2,0,Math.PI*2);c.fill()}}
  function banner(c,w,color,text){rect(c,14,11,w-28,17,'rgba(5,13,25,.84)',color);c.fillStyle='#eef8ff';c.font="700 8px 'Times New Roman'";c.textAlign='center';c.fillText(text,w/2,22)}
  function floor(c,w,h,color){c.fillStyle='#071422';c.fillRect(0,0,w,h);c.strokeStyle=color;c.globalAlpha=.12;c.lineWidth=.7;for(let x=0;x<w;x+=24){line(c,x,0,x,h,color,.7)}for(let y=0;y<h;y+=24){line(c,0,y,w,y,color,.7)}c.globalAlpha=1}

  function drawScene(id,z,w,h){
    const el=document.createElement('canvas');el.width=Math.max(1,Math.floor(w));el.height=Math.max(1,Math.floor(h));const c=el.getContext('2d');const color=z.color||'#69dce3';floor(c,w,h,color);
    if(id==='grassroots'){
      banner(c,w,color,'COMMUNITY BRACKET · TONIGHT');arcade(c,18,42,color,'1V1');arcade(c,48,42,'#9a70df','GG');arcade(c,78,42,'#f1c75c','KO');desk(c,w-102,55,78,color);pc(c,w-90,35,color);pc(c,w-56,35,'#9a70df');rect(c,20,h-42,75,18,'#183d42','rgba(105,220,227,.18)');
    }else if(id==='scholastic'){
      banner(c,w,color,'ESPORTS LAB · LEARN / PLAY / BUILD');for(let i=0;i<3;i++){desk(c,18+i*65,58,52,color);pc(c,29+i*65,38,color);chair(c,44+i*65,79)}screen(c,w-73,h-47,54,27,color,'CAREERS');
    }else if(id==='creator'){
      banner(c,w,color,'CREATOR STUDIO · ON AIR');desk(c,25,63,w-50,color);pc(c,45,42,'#a86cd4');pc(c,80,42,'#69dce3');camera(c,w-49,39,color);screen(c,22,h-49,84,27,color,'CLIP → SHARE');
    }else if(id==='college'){
      banner(c,w,color,'CAMPUS ESPORTS · ARENA');for(let i=0;i<4;i++){desk(c,18+i*61,61,49,color);pc(c,28+i*61,41,color);chair(c,42+i*61,80)}trophy(c,w-29,38,'#f1c75c');screen(c,28,h-48,w-56,26,color,'COMPETE · CONNECT');
    }else if(id==='sponsor'){
      banner(c,w,color,'PARTNERSHIP ACTIVATION FLOOR');screen(c,25,46,w-50,28,color,'AUDIENCE × OBJECTIVE');for(let i=0;i<3;i++){rect(c,28+i*70,90,54,40,'#172334','rgba(241,199,92,.18)');screen(c,37+i*70,100,36,19,i===1?'#2d8f8b':color,i===1?'TRY':'LIVE')}
    }else if(id==='publisher'){
      banner(c,w,color,'PUBLISHER ACCESS · LICENSE GATE');rack(c,24,50,color);rack(c,53,50,'#69dce3');rack(c,82,50,color);screen(c,w-104,49,76,38,color,'RIGHTS / DATA');screen(c,w-104,96,76,24,'#233c65','ACCESS');
    }else if(id==='pro'){
      banner(c,w,color,'PRO TEAM PERFORMANCE CENTER');for(let i=0;i<3;i++){desk(c,18+i*75,61,62,color);pc(c,30+i*75,41,color);chair(c,48+i*75,81)}trophy(c,w-29,38,'#f1c75c');screen(c,29,h-48,w-58,26,color,'PERFORMANCE · RUNWAY');
    }else if(id==='event'){
      banner(c,w,color,'CHAMPIONSHIP NIGHT · LIVE');const sx=36,sw=w-72;rect(c,sx,51,sw,52,'#0f1b29','rgba(113,211,199,.22)');screen(c,sx+sw*.28,60,sw*.44,27,color,'CHAMPIONSHIP');line(c,sx+8,43,sx+sw-8,43,'#576a7d',3);line(c,sx+8,43,sx+8,51,'#576a7d',3);line(c,sx+sw-8,43,sx+sw-8,51,'#576a7d',3);crowd(c,31,h-54,w-62,40,'#f1c75c');camera(c,w-52,h-80,color);
    }else if(id==='boardroom'){
      banner(c,w,color,'ECOSYSTEM STRATEGY BOARD');screen(c,23,39,61,31,color,'MARKET');screen(c,w-84,39,61,31,'#2c8f8b','RISK');c.fillStyle='#293849';c.beginPath();c.ellipse(w/2,h*.61,w*.34,h*.17,0,0,Math.PI*2);c.fill();c.strokeStyle='rgba(241,199,92,.34)';c.stroke();screen(c,w/2-42,h*.53,84,26,'#7e5b1d','DECIDE');
    }
    c.globalAlpha=.17;c.fillStyle=color;c.fillRect(0,0,w,3);c.globalAlpha=1;return el;
  }

  inner.forEach(({id,z,w,h})=>{try{cache.set(id,drawScene(id,z,w,h))}catch{}});

  proto.fillRect=function(x,y,w,h){
    const result=priorFillRect.apply(this,arguments);
    if(disabled||!isWorld(this))return result;
    const match=inner.find(q=>Math.abs(q.x-x)<.1&&Math.abs(q.y-y)<.1&&Math.abs(q.w-w)<.1&&Math.abs(q.h-h)<.1);
    if(match){
      try{const art=cache.get(match.id);if(art){this.save();this.globalAlpha*=.78;this.drawImage(art,x,y,w,h);this.restore();}}
      catch(err){disabled=true;try{console.warn('Ecosystem district art disabled after render error.',err)}catch{}}
    }
    return result;
  };
})();

// Manager Development is intentionally loaded after the core game/visual scripts.
import('./progression.js').catch(err=>{try{console.warn('Manager Development unavailable.',err)}catch{}});
