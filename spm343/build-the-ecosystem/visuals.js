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
  const zoneLabels={grassroots:'ARCADE',scholastic:'LAB',creator:'STUDIO',college:'ARENA',sponsor:'BRAND HQ',publisher:'PUBLISHER',pro:'TEAM HQ',event:'EVENT HALL',boardroom:'BOARDROOM'};

  function hexToRgb(hex){
    const h=String(hex||'').replace('#','');
    if(!/^[0-9a-f]{6}$/i.test(h))return {r:105,g:220,b:227};
    return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
  }

  function installCanvasSkin(){
    const proto=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
    if(!proto||proto.__ecosystemVisualSkin)return;
    proto.__ecosystemVisualSkin=true;

    const native={
      fillRect:proto.fillRect,
      fill:proto.fill,
      stroke:proto.stroke,
      arc:proto.arc,
      fillText:proto.fillText
    };
    const isWorld=ctx=>ctx&&ctx.canvas&&ctx.canvas.id==='world';
    const innerZones=zones.map(([id,z])=>({id,z,x:z.x+14,y:z.y+17,w:z.w-28,h:z.h-42}));

    function buildingLots(){
      const lots=[];
      for(let row=0;row<6;row++){
        for(let col=0;col<10;col++){
          const seed=(row+3)*37+(col+5)*61;
          const x=34+col*158+(seed%21);
          const y=42+row*152+((seed*7)%25);
          const w=34+(seed%38);
          const h=20+((seed*11)%31);
          lots.push({x,y,w,h,a:.025+((seed%7)*.006)});
        }
      }
      return lots;
    }
    const lots=buildingLots();

    function drawWorldTexture(ctx){
      ctx.save();
      ctx.globalAlpha=1;
      lots.forEach((b,i)=>{
        ctx.fillStyle=i%4===0?'rgba(101,171,211,.055)':'rgba(143,179,209,.03)';
        native.fillRect.call(ctx,b.x,b.y,b.w,b.h);
        ctx.strokeStyle=i%4===0?'rgba(105,220,227,.055)':'rgba(149,184,216,.035)';
        ctx.lineWidth=1;
        ctx.strokeRect(b.x,b.y,b.w,b.h);
      });
      ctx.fillStyle='rgba(105,220,227,.07)';
      for(let x=70;x<1540;x+=128){native.fillRect.call(ctx,x,508,3,3);}
      for(let y=60;y<940;y+=118){native.fillRect.call(ctx,788,y,3,3);}
      ctx.restore();
    }

    function drawZoneSkin(ctx,id,z){
      const rgb=hexToRgb(z.color);
      const x=z.x+24,y=z.y+30,w=z.w-48,h=z.h-74;
      const pulse=reduced?1:(.9+.1*Math.sin(performance.now()*.0018+(z.x+z.y)*.01));
      ctx.save();

      const grad=ctx.createLinearGradient(x,y,x+w,y+h);
      grad.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},.26)`);
      grad.addColorStop(.52,'rgba(10,24,43,.92)');
      grad.addColorStop(1,`rgba(${rgb.r},${rgb.g},${rgb.b},.14)`);
      ctx.fillStyle=grad;
      native.fillRect.call(ctx,x,y,w,h);

      ctx.strokeStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},.52)`;
      ctx.lineWidth=2;
      ctx.strokeRect(x+.5,y+.5,w-1,h-1);

      ctx.beginPath();
      ctx.moveTo(x+18,y+28);
      ctx.lineTo(x+w*.54,y+9);
      ctx.lineTo(x+w-16,y+28);
      ctx.lineTo(x+w*.52,y+46);
      ctx.closePath();
      ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},.22)`;
      native.fill.call(ctx);
      ctx.strokeStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},.34)`;
      ctx.lineWidth=1;
      native.stroke.call(ctx);

      ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${.68*pulse})`;
      native.fillRect.call(ctx,x+9,y+12,3,h-24);
      native.fillRect.call(ctx,x+w-12,y+12,3,h-24);

      const cols=Math.max(3,Math.floor(w/42));
      const rows=Math.max(2,Math.floor((h-68)/27));
      const gapX=(w-54)/cols;
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const wx=x+28+c*gapX;
          const wy=y+57+r*25;
          const active=((r*cols+c+id.length)%4)!==0;
          ctx.fillStyle=active?`rgba(${rgb.r+Math.min(255-rgb.r,35)},${rgb.g+Math.min(255-rgb.g,35)},${rgb.b+Math.min(255-rgb.b,35)},.30)`:'rgba(91,116,142,.10)';
          native.fillRect.call(ctx,wx,wy,Math.max(9,gapX-14),7);
        }
      }

      ctx.fillStyle='rgba(3,10,19,.70)';
      native.fillRect.call(ctx,x+w*.26,y+h-28,w*.48,18);
      ctx.strokeStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},.40)`;
      ctx.strokeRect(x+w*.26+.5,y+h-27.5,w*.48-1,17);
      ctx.font="700 10px 'Times New Roman'";
      ctx.textAlign='center';
      ctx.fillStyle='rgba(235,246,255,.88)';
      native.fillText.call(ctx,zoneLabels[id]||'DISTRICT',x+w/2,y+h-16);

      ctx.beginPath();
      ctx.arc(x+20,y+h-18,3.2,0,Math.PI*2);
      ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},.95)`;
      native.fill.call(ctx);
      ctx.shadowColor=`rgba(${rgb.r},${rgb.g},${rgb.b},.75)`;
      ctx.shadowBlur=10;
      ctx.beginPath();ctx.arc(x+20,y+h-18,2.1,0,Math.PI*2);native.fill.call(ctx);
      ctx.shadowBlur=0;

      ctx.restore();
    }

    function decorateAvatar(ctx,arcInfo){
      const {x,y,r}=arcInfo;
      if(r!==17&&r!==18)return;
      const player=r===18;
      ctx.save();
      ctx.globalAlpha=1;
      ctx.shadowBlur=0;

      ctx.beginPath();
      ctx.ellipse(x,y+18,player?22:20,player?8:7,0,0,Math.PI*2);
      ctx.fillStyle='rgba(0,0,0,.26)';
      native.fill.call(ctx);

      ctx.beginPath();
      native.arc.call(ctx,x,y,player?25:23,0,Math.PI*2);
      ctx.strokeStyle=player?'rgba(255,255,255,.34)':'rgba(151,211,229,.24)';
      ctx.lineWidth=1.2;
      native.stroke.call(ctx);

      if(player){
        ctx.beginPath();
        native.arc.call(ctx,x,y,30,Math.PI*1.08,Math.PI*1.92);
        ctx.strokeStyle='rgba(241,199,92,.72)';
        ctx.lineWidth=2;
        native.stroke.call(ctx);
        ctx.fillStyle='rgba(241,199,92,.8)';
        native.fillRect.call(ctx,x-2,y+27,4,5);
      }else{
        ctx.fillStyle='rgba(105,220,227,.45)';
        native.fillRect.call(ctx,x-5,y+24,10,2);
      }
      ctx.restore();
    }

    proto.fillRect=function(x,y,w,h){
      const result=native.fillRect.apply(this,arguments);
      if(!isWorld(this))return result;
      if(x===0&&y===0&&w>=1500&&h>=900){drawWorldTexture(this);return result;}
      const zone=innerZones.find(q=>Math.abs(q.x-x)<.1&&Math.abs(q.y-y)<.1&&Math.abs(q.w-w)<.1&&Math.abs(q.h-h)<.1);
      if(zone)drawZoneSkin(this,zone.id,zone.z);
      return result;
    };

    proto.arc=function(x,y,r,start,end,ccw){
      if(isWorld(this))this.__ecosystemLastArc={x,y,r};
      return native.arc.apply(this,arguments);
    };

    proto.fill=function(){
      const info=isWorld(this)?this.__ecosystemLastArc:null;
      const result=native.fill.apply(this,arguments);
      if(info)decorateAvatar(this,info);
      if(isWorld(this))this.__ecosystemLastArc=null;
      return result;
    };

    proto.fillText=function(text,x,y,maxWidth){
      if(!isWorld(this))return native.fillText.apply(this,arguments);
      this.save();
      const oldShadow=this.shadowColor;
      const oldBlur=this.shadowBlur;
      this.shadowColor='rgba(0,0,0,.55)';
      this.shadowBlur=5;
      const result=arguments.length>3?native.fillText.call(this,text,x,y,maxWidth):native.fillText.call(this,text,x,y);
      this.shadowColor=oldShadow;
      this.shadowBlur=oldBlur;
      this.restore();
      return result;
    };
  }

  installCanvasSkin();

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
    if(window.ResizeObserver)new ResizeObserver(resize).observe(worldWrap);else window.addEventListener('resize',resize);

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
    .city-tower:hover{transform:none!important}
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