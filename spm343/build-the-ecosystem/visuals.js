(function(){
  const D=window.RPG_DATA||{};
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zoneName=document.getElementById('zoneName');
  const worldWrap=document.querySelector('.world-wrap');
  const ribbon=document.getElementById('districtRibbon');
  const titleArt=document.querySelector('.title-art');
  const titleScreen=document.getElementById('titleScreen');
  const gameScreen=document.getElementById('gameScreen');

  const zones=Object.entries(D.zones||{});
  const zoneByName=new Map(zones.map(([id,z])=>[z.name,{id,...z}]));
  const palette=['#69dce3','#7ad9a2','#9a70df','#7087e6','#f1c75c','#6487d3','#e46d83','#3f938c','#d29a38'];

  function hexToRgb(hex){
    const h=String(hex||'').replace('#','');
    if(!/^[0-9a-f]{6}$/i.test(h))return {r:105,g:220,b:227};
    return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
  }

  function buildRibbon(){
    if(!ribbon||!zones.length)return;
    ribbon.innerHTML='';
    zones.forEach(([id,z],i)=>{
      const dot=document.createElement('span');
      dot.dataset.zone=id;
      dot.title=z.name;
      dot.style.setProperty('--zone-color',z.color||palette[i%palette.length]);
      ribbon.appendChild(dot);
    });
    syncZone();
  }

  function syncZone(){
    if(!zoneName||!ribbon)return;
    const active=zoneByName.get(zoneName.textContent.trim());
    ribbon.querySelectorAll('span').forEach(dot=>{
      const on=active&&dot.dataset.zone===active.id;
      dot.classList.toggle('active',!!on);
      if(on){
        const z=(D.zones||{})[active.id];
        dot.style.background=z&&z.color?z.color:'#69dce3';
        dot.style.boxShadow=`0 0 14px ${z&&z.color?z.color:'#69dce3'}`;
      }else{
        dot.style.background='';
        dot.style.boxShadow='';
      }
    });
    if(worldWrap){
      const z=active&&(D.zones||{})[active.id];
      worldWrap.style.setProperty('--active-zone-color',z&&z.color?z.color:'#69dce3');
    }
  }

  if(zoneName){new MutationObserver(syncZone).observe(zoneName,{childList:true,subtree:true,characterData:true});}
  buildRibbon();

  if(titleArt&&!reduced){
    let raf=0;
    titleArt.addEventListener('pointermove',e=>{
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        raf=0;
        const r=titleArt.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width-.5;
        const py=(e.clientY-r.top)/r.height-.5;
        titleArt.style.transform=`perspective(1100px) rotateY(${px*4.5}deg) rotateX(${-py*3.5}deg) translateY(-2px)`;
      });
    });
    titleArt.addEventListener('pointerleave',()=>{titleArt.style.transform='';});
  }

  if(worldWrap){
    const fx=document.createElement('canvas');
    fx.className='world-fx-canvas';
    fx.setAttribute('aria-hidden','true');
    worldWrap.insertBefore(fx,worldWrap.querySelector('.district-ribbon'));
    const ctx=fx.getContext('2d');
    const particles=Array.from({length:26},(_,i)=>({
      x:Math.random(),y:Math.random(),r:1+Math.random()*2.2,
      v:.00002+Math.random()*.000035,
      sway:(Math.random()-.5)*.00002,
      alpha:.14+Math.random()*.28,
      phase:Math.random()*Math.PI*2,
      color:palette[i%palette.length]
    }));
    let w=0,h=0,dpr=1,last=performance.now();

    function resize(){
      const r=worldWrap.getBoundingClientRect();
      dpr=Math.min(window.devicePixelRatio||1,2);
      w=Math.max(1,Math.floor(r.width));h=Math.max(1,Math.floor(r.height));
      fx.width=Math.floor(w*dpr);fx.height=Math.floor(h*dpr);
      fx.style.width=w+'px';fx.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize();
    new ResizeObserver(resize).observe(worldWrap);

    function activeColor(){
      const z=zoneName&&zoneByName.get(zoneName.textContent.trim());
      const info=z&&(D.zones||{})[z.id];
      return info&&info.color?info.color:'#69dce3';
    }

    function draw(now){
      const dt=Math.min(50,now-last);last=now;
      ctx.clearRect(0,0,w,h);
      const c=hexToRgb(activeColor());

      const glow=ctx.createRadialGradient(w*.52,h*.58,20,w*.52,h*.58,Math.max(w,h)*.62);
      glow.addColorStop(0,`rgba(${c.r},${c.g},${c.b},.075)`);
      glow.addColorStop(.46,`rgba(${c.r},${c.g},${c.b},.018)`);
      glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);

      ctx.save();
      ctx.globalCompositeOperation='screen';
      particles.forEach((p,i)=>{
        if(!reduced){
          p.y-=p.v*dt;
          p.x+=Math.sin(now*.00035+p.phase)*p.sway*dt;
          if(p.y<-.03){p.y=1.04;p.x=Math.random();}
          if(p.x<-.03)p.x=1.03;if(p.x>1.03)p.x=-.03;
        }
        const pulse=.65+.35*Math.sin(now*.0013+p.phase);
        const rgb=hexToRgb(i%4===0?activeColor():p.color);
        const x=p.x*w,y=p.y*h;
        ctx.beginPath();ctx.arc(x,y,p.r*pulse,0,Math.PI*2);
        ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${p.alpha})`;ctx.fill();
        if(i%5===0){
          ctx.strokeStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${p.alpha*.28})`;
          ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x-8,y);ctx.lineTo(x+8,y);ctx.stroke();
        }
      });
      ctx.restore();

      ctx.save();
      ctx.strokeStyle=`rgba(${c.r},${c.g},${c.b},.085)`;ctx.lineWidth=1;
      const sweep=(now*.025)%(w+220)-110;
      ctx.beginPath();ctx.moveTo(sweep,0);ctx.lineTo(sweep-160,h);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.035)';
      ctx.beginPath();ctx.arc(w*.5,h*.5,Math.min(w,h)*.38,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(w*.5,h*.5,Math.min(w,h)*.44,0,Math.PI*2);ctx.stroke();
      ctx.restore();

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  const style=document.createElement('style');
  style.textContent=`
    .world-fx-canvas{position:absolute;inset:0;z-index:2;pointer-events:none;mix-blend-mode:screen;opacity:.9}
    .district-ribbon span{position:relative}
    .district-ribbon span:after{content:"";position:absolute;inset:-4px;border:1px solid transparent;border-radius:50%}
    .district-ribbon span.active:after{border-color:rgba(255,255,255,.22)}
    .game-screen:not(.hidden) .sidebar{animation:hudIn .45s ease both}
    .game-screen:not(.hidden) .world-topbar{animation:hudDrop .38s ease both}
    @keyframes hudIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
    @keyframes hudDrop{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
    @media(prefers-reduced-motion:reduce){.game-screen:not(.hidden) .sidebar,.game-screen:not(.hidden) .world-topbar{animation:none}}
  `;
  document.head.appendChild(style);

  if(titleScreen&&gameScreen){
    const syncMode=()=>document.body.classList.toggle('career-mode',!gameScreen.classList.contains('hidden'));
    new MutationObserver(syncMode).observe(gameScreen,{attributes:true,attributeFilter:['class']});
    syncMode();
  }
})();