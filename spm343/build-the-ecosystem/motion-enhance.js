// Safe Phase 3 presentation layer: richer actors + movement feedback without a new render loop.
// It only decorates the existing player/NPC circle draw calls on the #world canvas and uses
// native Canvas2D methods internally to avoid recursive drawing hooks.
(function(){
  const proto=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
  if(!proto||proto.__ecosystemMotionEnhance)return;
  proto.__ecosystemMotionEnhance=true;

  const nativeArc=proto.arc;
  const nativeFill=proto.fill;
  const nativeStroke=proto.stroke;
  const nativeFillText=proto.fillText;
  const nativeEllipse=proto.ellipse;
  const worldOnly=ctx=>ctx&&ctx.canvas&&ctx.canvas.id==='world';
  let lastPlayer={x:null,y:null,t:0,dx:0,dy:1};

  function begin(ctx){ctx.beginPath()}
  function circle(ctx,x,y,r,fill,alpha=1){
    const old=ctx.globalAlpha;ctx.globalAlpha=old*alpha;ctx.fillStyle=fill;begin(ctx);nativeArc.call(ctx,x,y,r,0,Math.PI*2);nativeFill.call(ctx);ctx.globalAlpha=old;
  }
  function ellipse(ctx,x,y,rx,ry,fill,alpha=1){
    const old=ctx.globalAlpha;ctx.globalAlpha=old*alpha;ctx.fillStyle=fill;begin(ctx);nativeEllipse.call(ctx,x,y,rx,ry,0,0,Math.PI*2);nativeFill.call(ctx);ctx.globalAlpha=old;
  }
  function poly(ctx,pts,fill,stroke){
    begin(ctx);ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fillStyle=fill;nativeFill.call(ctx);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;nativeStroke.call(ctx)}
  }
  function safeColor(v){return typeof v==='string'&&v?String(v):'#55d6ff'}

  function playerMotion(a){
    const now=performance.now();
    if(lastPlayer.x==null){lastPlayer={x:a.x,y:a.y,t:now,dx:0,dy:1};return{moving:false,dx:0,dy:1,phase:0}}
    const dx=a.x-lastPlayer.x,dy=a.y-lastPlayer.y,dist=Math.hypot(dx,dy),moving=dist>.15;
    let ux=lastPlayer.dx,uy=lastPlayer.dy;if(moving){ux=dx/dist;uy=dy/dist}
    const phase=now/95;
    lastPlayer={x:a.x,y:a.y,t:now,dx:ux,dy:uy};
    return{moving,dx:ux,dy:uy,phase};
  }

  function decoratePlayer(ctx,a){
    const m=playerMotion(a),color=safeColor(a.color),angle=Math.atan2(m.dy,m.dx)+Math.PI/2;
    ctx.save();
    // Lightweight motion ghosts make movement read immediately without persistent particles.
    if(m.moving){
      for(let i=3;i>=1;i--){const gx=a.x-m.dx*i*8,gy=a.y-m.dy*i*8;ellipse(ctx,gx,gy+8,12-i,6-i*.8,color,.05*i)}
    }
    ellipse(ctx,a.x,a.y+14,17,7,'#000',.33);
    // Cover the old token before drawing the top-down character.
    circle(ctx,a.x,a.y,20,'#08131f',.96);
    ctx.translate(a.x,a.y);ctx.rotate(angle);
    const stride=m.moving?Math.sin(m.phase)*4:0;
    // Legs / boots.
    ctx.fillStyle='#071019';ctx.fillRect(-9,-1+stride*.25,6,18);ctx.fillRect(3,-1-stride*.25,6,18);
    ctx.fillStyle='#d8f4ff';ctx.fillRect(-10,12+stride*.25,7,5);ctx.fillRect(3,12-stride*.25,7,5);
    // Jacket silhouette.
    poly(ctx,[[-13,8],[-12,-7],[-7,-14],[7,-14],[12,-7],[13,8],[7,13],[-7,13]],'#101d2c','#dff8ff');
    // Team-color panels.
    ctx.fillStyle=color;ctx.fillRect(-10,-7,4,14);ctx.fillRect(6,-7,4,14);ctx.fillRect(-5,5,10,4);
    // Shoulder lights.
    circle(ctx,-12,-6,3,color,.85);circle(ctx,12,-6,3,color,.85);
    // Head + hair/helmet.
    circle(ctx,0,-15,8,'#efc8ad');
    ctx.fillStyle='#0a0d14';begin(ctx);ctx.arc(0,-17,8,Math.PI,Math.PI*2);nativeFill.call(ctx);
    ctx.fillStyle=color;ctx.fillRect(-7,-18,14,2);
    // Directional visor.
    ctx.fillStyle='#9cf4ff';ctx.fillRect(-4,-20,8,2);
    // Forward chevron.
    ctx.strokeStyle=color;ctx.lineWidth=2;begin(ctx);ctx.moveTo(-5,-30);ctx.lineTo(0,-35);ctx.lineTo(5,-30);nativeStroke.call(ctx);
    ctx.restore();
    // Selection ring stays outside character rotation.
    ctx.save();ctx.strokeStyle='rgba(145,238,255,.78)';ctx.lineWidth=2;ctx.setLineDash([5,5]);begin(ctx);nativeArc.call(ctx,a.x,a.y,25,0,Math.PI*2);nativeStroke.call(ctx);ctx.setLineDash([]);ctx.restore();
  }

  function decorateNpc(ctx,a){
    const color=safeColor(a.color);ctx.save();ellipse(ctx,a.x,a.y+12,15,6,'#000',.28);circle(ctx,a.x,a.y,19,'#08131f',.94);
    // Compact top-down staff character; no animation cost.
    ctx.fillStyle='#0d1b2a';ctx.fillRect(a.x-9,a.y-2,18,18);ctx.fillStyle=color;ctx.fillRect(a.x-9,a.y+4,18,4);
    ctx.fillStyle='#eef7ff';ctx.fillRect(a.x-7,a.y+14,5,6);ctx.fillRect(a.x+2,a.y+14,5,6);
    circle(ctx,a.x,a.y-8,8,'#e8bea2');ctx.fillStyle='#11151e';begin(ctx);ctx.arc(a.x,a.y-10,8,Math.PI,Math.PI*2);nativeFill.call(ctx);
    circle(ctx,a.x-9,a.y+1,2.3,color,.95);circle(ctx,a.x+9,a.y+1,2.3,color,.95);ctx.restore();
  }

  proto.arc=function(x,y,r,start,end,...rest){
    if(worldOnly(this)&&(Math.abs(r-18)<.01||Math.abs(r-17)<.01)&&Math.abs((end-start)-Math.PI*2)<.05){
      this.__ecoActor={x,y,r,color:this.fillStyle};
      this.__ecoLastActorCenter={x,y};
    }
    return nativeArc.call(this,x,y,r,start,end,...rest);
  };

  proto.fill=function(...args){
    const mark=worldOnly(this)?this.__ecoActor:null;
    const out=nativeFill.apply(this,args);
    if(mark&&mark.r===17){try{decorateNpc(this,mark)}catch(e){}this.__ecoActor=null}
    return out;
  };

  proto.stroke=function(...args){
    const mark=worldOnly(this)?this.__ecoActor:null;
    const out=nativeStroke.apply(this,args);
    if(mark&&mark.r===18){try{decoratePlayer(this,mark)}catch(e){}this.__ecoActor=null}
    return out;
  };

  proto.fillText=function(text,x,y,...rest){
    if(worldOnly(this)&&this.__ecoLastActorCenter){
      const a=this.__ecoLastActorCenter;
      // Hide the old initials token text but preserve NPC names, quest markers, and district labels.
      if(String(text).length<=3&&Math.abs(x-a.x)<1.5&&Math.abs(y-(a.y+4))<2)return;
    }
    return nativeFillText.call(this,text,x,y,...rest);
  };

  function installUiPolish(){
    const wrap=document.querySelector('.world-wrap'),canvas=document.getElementById('world'),ribbon=document.getElementById('districtRibbon'),zone=document.getElementById('zoneName');
    if(!wrap||!canvas)return;
    const style=document.createElement('style');style.textContent=`
      .world-wrap{isolation:isolate;background:radial-gradient(circle at 50% 48%,rgba(28,99,125,.18),transparent 56%),#06111d;overflow:hidden}
      .world-canvas{filter:saturate(1.28) contrast(1.08) brightness(1.04);transition:filter .18s ease;position:relative;z-index:2}
      .world-wrap.is-moving .world-canvas{filter:saturate(1.42) contrast(1.1) brightness(1.07)}
      .eco-vignette,.eco-speedlines{position:absolute;inset:0;pointer-events:none;z-index:3;border-radius:inherit}
      .eco-vignette{box-shadow:inset 0 0 85px rgba(0,0,0,.62),inset 0 0 28px rgba(79,215,255,.08)}
      .eco-speedlines{opacity:0;background:repeating-linear-gradient(115deg,transparent 0 44px,rgba(111,230,255,.09) 45px,transparent 47px);transform:translateX(-8%);transition:opacity .12s ease}
      .world-wrap.is-moving .eco-speedlines{opacity:.78;animation:ecoRush .42s linear infinite}
      @keyframes ecoRush{to{transform:translateX(8%)}}
      #districtRibbon{position:absolute;left:50%;top:82px;transform:translate(-50%,-10px);z-index:5;min-width:230px;text-align:center;padding:9px 18px;border:1px solid rgba(127,232,255,.55);background:rgba(5,18,30,.88);color:#dffaff;font:700 13px 'Times New Roman',serif;letter-spacing:.16em;text-transform:uppercase;opacity:0;pointer-events:none;box-shadow:0 0 26px rgba(61,204,255,.18);transition:opacity .22s ease,transform .22s ease}
      #districtRibbon.eco-show{opacity:1;transform:translate(-50%,0)}
      .interact{z-index:6!important;box-shadow:0 8px 28px rgba(0,0,0,.34),0 0 22px rgba(87,225,255,.18)}
      @media (prefers-reduced-motion:reduce){.world-wrap.is-moving .eco-speedlines{animation:none}.world-canvas{transition:none!important}}
    `;document.head.appendChild(style);
    const v=document.createElement('div');v.className='eco-vignette';v.setAttribute('aria-hidden','true');wrap.appendChild(v);
    const s=document.createElement('div');s.className='eco-speedlines';s.setAttribute('aria-hidden','true');wrap.appendChild(s);
    const movementKeys=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d','W','A','S','D']);
    const held=new Set();const sync=()=>wrap.classList.toggle('is-moving',held.size>0&&!document.getElementById('gameScreen')?.classList.contains('hidden'));
    window.addEventListener('keydown',e=>{if(movementKeys.has(e.key)){held.add(e.key);sync()}},{passive:true});
    window.addEventListener('keyup',e=>{held.delete(e.key);sync()},{passive:true});
    window.addEventListener('blur',()=>{held.clear();sync()});
    document.querySelectorAll('.dpad button').forEach(b=>{const on=()=>{held.add('mobile');sync()},off=()=>{held.delete('mobile');sync()};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)});
    if(zone&&ribbon){let last=(zone.textContent||'').trim();new MutationObserver(()=>{const next=(zone.textContent||'').trim();if(!next||next===last)return;last=next;ribbon.textContent=next;ribbon.classList.add('eco-show');clearTimeout(ribbon._ecoT);ribbon._ecoT=setTimeout(()=>ribbon.classList.remove('eco-show'),1250)}).observe(zone,{childList:true,subtree:true,characterData:true})}
  }

  try{installUiPolish();document.documentElement.dataset.ecosystemMotion='enhanced'}catch(e){document.documentElement.dataset.ecosystemMotion='safe'}
})();
