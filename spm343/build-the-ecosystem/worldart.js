(function(){
  const D=window.RPG_DATA||{};
  const proto=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
  if(!proto||proto.__ecosystemWorldArt)return;
  proto.__ecosystemWorldArt=true;

  const priorFillRect=proto.fillRect;
  const isWorld=ctx=>ctx&&ctx.canvas&&ctx.canvas.id==='world';
  const zones=Object.entries(D.zones||{});
  const inner=zones.map(([id,z])=>({id,z,x:z.x+14,y:z.y+17,w:z.w-28,h:z.h-42}));
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rgb(hex){const h=String(hex||'#69dce3').replace('#','');return /^[0-9a-f]{6}$/i.test(h)?{r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}:{r:105,g:220,b:227}}
  function rect(ctx,x,y,w,h,fill,stroke){ctx.fillStyle=fill;priorFillRect.call(ctx,x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x+.5,y+.5,w-1,h-1)}}
  function roundRect(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
  function glowLine(ctx,x1,y1,x2,y2,color,width=2){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowColor=color;ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore()}
  function screen(ctx,x,y,w,h,color,text){const c=rgb(color);roundRect(ctx,x,y,w,h,4,'rgba(4,12,24,.96)',`rgba(${c.r},${c.g},${c.b},.55)`);const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,`rgba(${c.r},${c.g},${c.b},.25)`);g.addColorStop(1,'rgba(9,16,31,.06)');ctx.fillStyle=g;ctx.fillRect(x+3,y+3,w-6,h-6);ctx.fillStyle='rgba(229,245,255,.86)';ctx.font="700 7px 'Times New Roman'";ctx.textAlign='center';ctx.fillText(text||'LIVE',x+w/2,y+h/2+2)}
  function desk(ctx,x,y,w,color){ctx.save();ctx.fillStyle='rgba(2,8,16,.5)';ctx.beginPath();ctx.ellipse(x+w/2,y+16,w*.55,7,0,0,Math.PI*2);ctx.fill();const g=ctx.createLinearGradient(x,y,x+w,y+12);g.addColorStop(0,'#233348');g.addColorStop(.5,'#41536b');g.addColorStop(1,'#172637');roundRect(ctx,x,y,w,11,3,g,'rgba(255,255,255,.09)');rect(ctx,x+5,y+10,4,11,'#182333');rect(ctx,x+w-9,y+10,4,11,'#182333');glowLine(ctx,x+10,y+4,x+w-10,y+4,color,1);ctx.restore()}
  function pc(ctx,x,y,color){screen(ctx,x,y,25,15,color,'');rect(ctx,x+11,y+15,3,5,'#5b6675');rect(ctx,x+6,y+20,13,2,'#39475b');rect(ctx,x+4,y+24,17,3,'#1d293a')}
  function chair(ctx,x,y,color='rgba(88,107,133,.7)'){roundRect(ctx,x,y,12,12,4,color);rect(ctx,x+5,y+11,2,7,'#243348')}
  function arcade(ctx,x,y,color,label){const c=rgb(color);ctx.save();ctx.fillStyle='#111b2c';ctx.beginPath();ctx.moveTo(x,y+4);ctx.lineTo(x+20,y);ctx.lineTo(x+20,y+35);ctx.lineTo(x+2,y+38);ctx.closePath();ctx.fill();ctx.strokeStyle=`rgba(${c.r},${c.g},${c.b},.55)`;ctx.stroke();screen(ctx,x+4,y+6,13,10,color,label||'GO');rect(ctx,x+4,y+21,13,3,`rgba(${c.r},${c.g},${c.b},.62)`);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+8,y+29,2,0,Math.PI*2);ctx.fill();ctx.restore()}
  function camera(ctx,x,y,color){ctx.save();rect(ctx,x,y,16,10,'#1b2838',color);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+16,y+2);ctx.lineTo(x+22,y-2);ctx.lineTo(x+22,y+12);ctx.lineTo(x+16,y+8);ctx.closePath();ctx.fill();ctx.strokeStyle='#263749';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+8,y+10);ctx.lineTo(x+2,y+25);ctx.moveTo(x+8,y+10);ctx.lineTo(x+14,y+25);ctx.stroke();ctx.restore()}
  function rack(ctx,x,y,color){roundRect(ctx,x,y,20,42,3,'#111c29','rgba(255,255,255,.12)');for(let i=0;i<5;i++){rect(ctx,x+3,y+5+i*7,14,4,'#1f3144');ctx.fillStyle=i%2?color:'#7ad9a2';ctx.beginPath();ctx.arc(x+15,y+7+i*7,1.2,0,Math.PI*2);ctx.fill()}}
  function plant(ctx,x,y){rect(ctx,x-4,y+9,8,7,'#5d4632');ctx.fillStyle='#3e8c70';for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(x+(i-2)*2,y+7-Math.abs(i-2)*2,3,7,(i-2)*.28,0,Math.PI*2);ctx.fill()}}
  function trophy(ctx,x,y,color){ctx.save();ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.lineTo(x+3,y+9);ctx.quadraticCurveTo(x,y+13,x-3,y+9);ctx.closePath();ctx.fill();ctx.strokeStyle=color;ctx.beginPath();ctx.arc(x-6,y+4,4,Math.PI*.5,Math.PI*1.5);ctx.arc(x+6,y+4,4,-Math.PI*.5,Math.PI*.5);ctx.stroke();rect(ctx,x-1,y+10,2,5,color);rect(ctx,x-5,y+15,10,3,color);ctx.restore()}
  function billboard(ctx,x,y,w,color,text){rect(ctx,x,y,w,24,'rgba(6,14,26,.9)',`rgba(255,255,255,.13)`);glowLine(ctx,x+4,y+4,x+w-4,y+4,color,2);ctx.fillStyle='#edf7ff';ctx.font="700 9px 'Times New Roman'";ctx.textAlign='center';ctx.fillText(text,x+w/2,y+16);rect(ctx,x+w*.23,y+24,3,11,'#28374a');rect(ctx,x+w*.74,y+24,3,11,'#28374a')}
  function crowd(ctx,x,y,w,count,color){ctx.save();for(let i=0;i<count;i++){const px=x+(i%(Math.max(1,Math.floor(w/10))))*10+((i*7)%4),py=y+Math.floor(i/(Math.max(1,Math.floor(w/10))))*8;ctx.fillStyle=i%4===0?color:'rgba(160,183,208,.42)';ctx.beginPath();ctx.arc(px,py,2,0,Math.PI*2);ctx.fill()}ctx.restore()}
  function floorGrid(ctx,x,y,w,h,color){ctx.save();ctx.strokeStyle=color;ctx.globalAlpha*=.18;ctx.lineWidth=.7;for(let xx=x;xx<x+w;xx+=22){ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+h);ctx.stroke()}for(let yy=y;yy<y+h;yy+=22){ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke()}ctx.restore()}
  function topBanner(ctx,x,y,w,color,text){const c=rgb(color);const grad=ctx.createLinearGradient(x,y,x+w,y);grad.addColorStop(0,`rgba(${c.r},${c.g},${c.b},.08)`);grad.addColorStop(.5,`rgba(${c.r},${c.g},${c.b},.35)`);grad.addColorStop(1,`rgba(${c.r},${c.g},${c.b},.08)`);rect(ctx,x,y,w,16,grad);ctx.fillStyle='rgba(239,248,255,.9)';ctx.font="700 8px 'Times New Roman'";ctx.textAlign='center';ctx.fillText(text,x+w/2,y+11)}

  function drawGrassroots(ctx,x,y,w,h,c,t){
    floorGrid(ctx,x+9,y+8,w-18,h-16,'rgba(77,220,205,.35)');topBanner(ctx,x+16,y+12,w-32,c,'TONIGHT · COMMUNITY BRACKET');
    arcade(ctx,x+20,y+42,c,'1V1');arcade(ctx,x+48,y+40,'#9a70df','GG');arcade(ctx,x+76,y+44,'#f1c75c','KO');
    desk(ctx,x+w-104,y+48,78,c);pc(ctx,x+w-92,y+28,c);pc(ctx,x+w-58,y+28,'#9a70df');
    roundRect(ctx,x+20,y+h-53,76,20,8,'rgba(37,69,73,.8)','rgba(105,220,227,.16)');roundRect(ctx,x+104,y+h-53,52,20,8,'rgba(37,69,73,.8)');
    if(!reduce){const pulse=.45+.35*Math.sin(t*.004);ctx.fillStyle=`rgba(105,220,227,${pulse})`;ctx.beginPath();ctx.arc(x+w-25,y+21,3,0,Math.PI*2);ctx.fill()}
  }
  function drawSchool(ctx,x,y,w,h,c){
    floorGrid(ctx,x+8,y+8,w-16,h-16,'rgba(83,134,213,.3)');topBanner(ctx,x+16,y+12,w-32,c,'ESPORTS LAB · LEARN / PLAY / BUILD');
    for(let i=0;i<3;i++){desk(ctx,x+20+i*62,y+54,52,c);pc(ctx,x+31+i*62,y+34,c);chair(ctx,x+40+i*62,y+68)}
    rect(ctx,x+20,y+h-48,w-40,27,'rgba(229,240,252,.08)','rgba(141,175,217,.2)');ctx.strokeStyle='rgba(220,237,255,.42)';ctx.beginPath();ctx.moveTo(x+32,y+h-36);ctx.lineTo(x+66,y+h-41);ctx.lineTo(x+94,y+h-30);ctx.lineTo(x+128,y+h-39);ctx.stroke();
  }
  function drawCreator(ctx,x,y,w,h,c,t){
    floorGrid(ctx,x+8,y+8,w-16,h-16,'rgba(168,108,212,.25)');topBanner(ctx,x+16,y+12,w-32,c,'CREATOR STUDIO · ON AIR');
    desk(ctx,x+28,y+62,w-56,c);pc(ctx,x+48,y+41,'#a86cd4');pc(ctx,x+82,y+39,'#69dce3');camera(ctx,x+w-52,y+36,c);
    ctx.strokeStyle='rgba(255,255,255,.15)';ctx.beginPath();ctx.arc(x+w-36,y+h-44,13,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=!reduce&&Math.sin(t*.006)>0?'#e46d83':'#7ad9a2';ctx.beginPath();ctx.arc(x+w-36,y+h-44,9,0,Math.PI*2);ctx.stroke();
    billboard(ctx,x+20,y+h-54,82,c,'CLIP → SHARE → GROW');
  }
  function drawCampus(ctx,x,y,w,h,c){
    floorGrid(ctx,x+8,y+8,w-16,h-16,'rgba(98,120,216,.25)');topBanner(ctx,x+16,y+12,w-32,c,'CAMPUS ESPORTS · ARENA');
    for(let i=0;i<4;i++){desk(ctx,x+21+i*60,y+62,50,c);pc(ctx,x+31+i*60,y+42,c);chair(ctx,x+40+i*60,y+76)}
    billboard(ctx,x+26,y+h-50,w-52,c,'COMPETE · CONNECT · CREATE');trophy(ctx,x+w-28,y+35,'#f1c75c');
  }
  function drawSponsor(ctx,x,y,w,h,c,t){
    floorGrid(ctx,x+8,y+8,w-16,h-16,'rgba(196,147,51,.22)');topBanner(ctx,x+16,y+12,w-32,c,'PARTNERSHIP ACTIVATION FLOOR');
    billboard(ctx,x+24,y+45,w-48,c,'AUDIENCE × OBJECTIVE × ACTIVATION');
    for(let i=0;i<3;i++){roundRect(ctx,x+28+i*70,y+94,54,38,8,'rgba(28,39,56,.92)','rgba(241,199,92,.2)');screen(ctx,x+37+i*70,y+101,36,19,i===1?'#69dce3':c,i===1?'TRY':'LIVE')}
    if(!reduce){glowLine(ctx,x+24,y+h-26,x+w-24,y+h-26,Math.sin(t*.004)>0?c:'#69dce3',2)}
  }
  function drawPublisher(ctx,x,y,w,h,c,t){
    floorGrid(ctx,x+8,y+8,w-16,h-16,'rgba(84,112,184,.25)');topBanner(ctx,x+16,y+12,w-32,c,'PUBLISHER ACCESS · LICENSE GATE');
    rack(ctx,x+25,y+48,c);rack(ctx,x+53,y+48,'#69dce3');rack(ctx,x+81,y+48,c);screen(ctx,x+w-105,y+48,74,38,c,'RIGHTS / DATA');
    rect(ctx,x+w-93,y+95,50,3,'rgba(84,112,184,.7)');rect(ctx,x+w-88,y+104,40,3,'rgba(105,220,227,.45)');
    if(!reduce){const scan=(t*.025)%(w-50);rect(ctx,x+25+scan,y+h-26,26,2,'rgba(105,220,227,.42)')}
  }
  function drawPro(ctx,x,y,w,h,c){
    floorGrid(ctx,x+8,y+8,w-16,h-16,'rgba(183,80,101,.22)');topBanner(ctx,x+16,y+12,w-32,c,'PRO TEAM PERFORMANCE CENTER');
    for(let i=0;i<3;i++){desk(ctx,x+20+i*74,y+60,62,c);pc(ctx,x+32+i*74,y+39,c);chair(ctx,x+44+i*74,y+75,'rgba(112,49,66,.9)')}
    trophy(ctx,x+w-30,y+35,'#f1c75c');billboard(ctx,x+28,y+h-48,w-56,c,'PERFORMANCE · CONTENT · RUNWAY');
  }
  function drawEvent(ctx,x,y,w,h,c,t){
    floorGrid(ctx,x+8,y+8,w-16,h-16,'rgba(52,125,115,.24)');topBanner(ctx,x+16,y+12,w-32,c,'CHAMPIONSHIP NIGHT · LIVE');
    const stageX=x+38,stageY=y+49,stageW=w-76;rect(ctx,stageX,stageY,stageW,49,'#101b29','rgba(113,211,199,.22)');screen(ctx,stageX+stageW*.28,stageY+7,stageW*.44,26,c,'CHAMPIONSHIP');
    ctx.strokeStyle='#4a5a6b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(stageX,stageY);ctx.lineTo(stageX+stageW,stageY);ctx.moveTo(stageX+8,stageY);ctx.lineTo(stageX+8,stageY-15);ctx.moveTo(stageX+stageW-8,stageY);ctx.lineTo(stageX+stageW-8,stageY-15);ctx.moveTo(stageX+8,stageY-15);ctx.lineTo(stageX+stageW-8,stageY-15);ctx.stroke();
    crowd(ctx,x+32,y+h-54,w-64,40,!reduce&&Math.sin(t*.005)>0?'#f1c75c':c);camera(ctx,x+w-50,y+h-78,c);
  }
  function drawBoardroom(ctx,x,y,w,h,c,t){
    floorGrid(ctx,x+8,y+8,w-16,h-16,'rgba(210,154,56,.18)');topBanner(ctx,x+14,y+10,w-28,c,'ECOSYSTEM STRATEGY BOARD');
    ctx.save();ctx.fillStyle='rgba(2,8,16,.5)';ctx.beginPath();ctx.ellipse(x+w/2,y+h*.59,w*.36,h*.19,0,0,Math.PI*2);ctx.fill();const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#3c4758');g.addColorStop(.5,'#17283a');g.addColorStop(1,'#4f3920');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x+w/2,y+h*.52,w*.34,h*.16,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(241,199,92,.28)';ctx.stroke();ctx.restore();
    screen(ctx,x+26,y+36,60,30,c,'MARKET');screen(ctx,x+w-86,y+36,60,30,'#69dce3','RISK');
    if(!reduce){const a=.2+.2*Math.sin(t*.003);ctx.fillStyle=`rgba(241,199,92,${a})`;ctx.beginPath();ctx.ellipse(x+w/2,y+h*.52,w*.25,h*.1,0,0,Math.PI*2);ctx.fill()}
  }

  function drawDistrictArt(ctx,id,z){
    const x=z.x+28,y=z.y+47,w=z.w-56,h=z.h-92,c=z.color,t=performance.now();
    ctx.save();ctx.globalAlpha*=.98;roundRect(ctx,x,y,w,h,8,'rgba(4,13,25,.72)','rgba(255,255,255,.045)');
    if(id==='grassroots')drawGrassroots(ctx,x,y,w,h,c,t);
    else if(id==='scholastic')drawSchool(ctx,x,y,w,h,c,t);
    else if(id==='creator')drawCreator(ctx,x,y,w,h,c,t);
    else if(id==='college')drawCampus(ctx,x,y,w,h,c,t);
    else if(id==='sponsor')drawSponsor(ctx,x,y,w,h,c,t);
    else if(id==='publisher')drawPublisher(ctx,x,y,w,h,c,t);
    else if(id==='pro')drawPro(ctx,x,y,w,h,c,t);
    else if(id==='event')drawEvent(ctx,x,y,w,h,c,t);
    else if(id==='boardroom')drawBoardroom(ctx,x,y,w,h,c,t);
    ctx.restore();
  }

  proto.fillRect=function(x,y,w,h){
    const result=priorFillRect.apply(this,arguments);
    if(!isWorld(this))return result;
    const match=inner.find(q=>Math.abs(q.x-x)<.1&&Math.abs(q.y-y)<.1&&Math.abs(q.w-w)<.1&&Math.abs(q.h-h)<.1);
    if(match)drawDistrictArt(this,match.id,match.z);
    return result;
  };
})();