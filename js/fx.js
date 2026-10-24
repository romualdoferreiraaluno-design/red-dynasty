'use strict';
/* =========================================================
   FX — pós-processamento e partículas (Canvas 2D, sem libs)
   Luz dinâmica • bloom • vinheta • grão • letterbox • clima
   ========================================================= */
const FX=(()=>{
  const W=960,H=540;
  const Q={level:'high',reduce:false};
  try{const s=JSON.parse(localStorage.getItem('chinaRPG_opts')||'{}');if(s.level)Q.level=s.level;Q.reduce=!!s.reduce}catch(e){}
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
  const LW=240,LH=135;
  const lightC=mk(LW,LH),lg=lightC.getContext('2d');
  const bloomA=mk(120,68),ba=bloomA.getContext('2d'),bloomB=mk(120,68),bb=bloomB.getContext('2d'),bloomC=mk(30,17),bc=bloomC.getContext('2d');
  [lg,ba,bb,bc].forEach(g=>g.imageSmoothingEnabled=true);
  const vig=mk(W,H);{const g=vig.getContext('2d'),r=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,'rgba(0,0,8,.72)');g.fillStyle=r;g.fillRect(0,0,W,H)}
  const noise=mk(128,128);{const g=noise.getContext('2d'),d=g.createImageData(128,128);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0)}
  const scan=mk(4,4);{const g=scan.getContext('2d');g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,0,4,1)}
  const set=(o)=>{Object.assign(Q,o);try{localStorage.setItem('chinaRPG_opts',JSON.stringify(Q))}catch(e){}};

  /* ---- luz ---- */
  let amb='#161a30',lights=[];
  function begin(ambient){amb=ambient||'#161a30';lights.length=0}
  let oy=0;const offset=v=>{oy=v};
  function light(x,y,r,color,k){lights.push([x,y+oy,r,color,k===undefined?1:k])}
  function applyLight(g){
    if(Q.level==='low')return;
    lg.globalCompositeOperation='source-over';lg.fillStyle=amb;lg.fillRect(0,0,LW,LH);
    lg.globalCompositeOperation='lighter';
    for(const [x,y,r,c,k] of lights){
      const X=x/4,Y=y/4,R=r/4,gr=lg.createRadialGradient(X,Y,0,X,Y,R);
      gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');
      lg.globalAlpha=Math.min(1,k);lg.fillStyle=gr;lg.fillRect(X-R,Y-R,R*2,R*2);
    }
    lg.globalAlpha=1;
    g.save();g.imageSmoothingEnabled=true;
    g.globalCompositeOperation='multiply';g.drawImage(lightC,0,0,W,H);
    g.globalCompositeOperation='lighter';g.globalAlpha=.20;g.drawImage(lightC,0,0,W,H);
    g.restore();
  }
  function bloom(g){
    if(Q.level!=='high')return;
    ba.globalCompositeOperation='source-over';ba.drawImage(g.canvas,0,0,120,68);
    bb.globalCompositeOperation='source-over';bb.drawImage(bloomA,0,0);
    ba.globalCompositeOperation='multiply';ba.drawImage(bloomB,0,0);ba.drawImage(bloomB,0,0);
    bc.drawImage(bloomA,0,0,30,17);
    g.save();g.imageSmoothingEnabled=true;g.globalCompositeOperation='lighter';
    g.globalAlpha=.55;g.drawImage(bloomC,0,0,W,H);g.globalAlpha=.35;g.drawImage(bloomA,0,0,W,H);g.restore();
  }
  let grade=null,gradeA=0;
  function setGrade(c,a){grade=c;gradeA=a||0}
  let lbT=0,lb=0;
  function letterbox(on){lbT=on?1:0}
  let flash=0,flashC='#fff',aberr=0;
  function doFlash(c,a){flashC=c||'#fff';flash=a===undefined?.7:a}
  function post(g,dt,T){
    applyLight(g);bloom(g);
    if(grade){g.save();g.globalCompositeOperation='soft-light';g.globalAlpha=gradeA;g.fillStyle=grade;g.fillRect(0,0,W,H);g.restore()}
    if(aberr>0.5&&Q.level!=='low'&&!Q.reduce){
      g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.25;
      g.drawImage(g.canvas,-aberr,0);g.drawImage(g.canvas,aberr,0);g.restore();aberr*=.9;
    }
    if(Q.level!=='low'){g.drawImage(vig,0,0)}
    if(Q.level==='high'){
      g.save();g.globalAlpha=.07;g.globalCompositeOperation='overlay';
      const ox=Math.floor(Math.random()*128),oy=Math.floor(Math.random()*128);
      for(let x=-ox;x<W;x+=128)for(let y=-oy;y<H;y+=128)g.drawImage(noise,x,y);
      g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle=g.createPattern(scan,'repeat');g.globalAlpha=.5;g.fillRect(0,0,W,H);g.restore();
    }
    lb+= (lbT-lb)*Math.min(1,dt*0.006);
    if(lb>0.01){const h=Math.round(lb*H*0.075);g.fillStyle='#000';g.fillRect(0,0,W,h);g.fillRect(0,H-h,W,h)}
    if(flash>0.01){g.save();g.globalAlpha=flash;g.fillStyle=flashC;g.fillRect(0,0,W,H);g.restore();flash*=.86}
  }
  const addAberr=v=>{aberr=Math.max(aberr,v)};

  /* ---- partículas ---- */
  const P=[];
  const lim=()=>Q.level==='low'?60:Q.level==='med'?220:600;
  function add(o){if(P.length>=lim())return;P.push(Object.assign({x:0,y:0,vx:0,vy:0,g:0,life:1,max:1,s:2,c:'#fff',add:false,kind:'dot',drag:1,s1:null,rot:0},o,{max:o.life||1}))}
  let rainAcc=0;
  function rain(perSec,dt){
    if(Q.level==='low')perSec/=3;
    rainAcc+=perSec*(dt||.016);const n=Math.floor(rainAcc);rainAcc-=n;
    for(let i=0;i<n;i++)add({kind:'rain',x:Math.random()*(W+200)-100,y:-10,vx:-120,vy:900+Math.random()*300,life:.7,c:'rgba(170,210,255,.55)',s:1,splash:true});
  }
  function embers(n,col){for(let i=0;i<n;i++)add({kind:'dot',x:Math.random()*W,y:H+5,vx:(Math.random()-.5)*30,vy:-30-Math.random()*70,life:3+Math.random()*3,s:1.5+Math.random()*2,c:col||'#ff8a30',add:true})}
  function dust(n,col){for(let i=0;i<n;i++)add({kind:'dot',x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,life:5+Math.random()*4,s:1+Math.random()*1.5,c:col||'rgba(255,230,180,.5)',fade:true})}
  function ash(n){for(let i=0;i<n;i++)add({kind:'dot',x:Math.random()*W,y:-5,vx:-10+Math.random()*20,vy:20+Math.random()*30,life:9,s:1+Math.random()*2,c:'rgba(200,200,200,.5)',fade:true})}
  function bubbles(x,y,w,n){for(let i=0;i<n;i++)add({kind:'ring',x:x+Math.random()*w,y,vx:0,vy:-30-Math.random()*40,life:2,s:1+Math.random()*2.5,c:'rgba(120,255,140,.7)',add:true})}
  function sparks(x,y,n,col,spd){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=(spd||200)*(.3+Math.random());add({kind:'dot',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,g:400,life:.4+Math.random()*.5,s:2,c:col||'#ffd060',add:true})}}
  function burst(x,y,col,n,sz){
    for(let i=0;i<n;i++){const a=Math.random()*6.28,v=40+Math.random()*180;add({kind:'blob',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,g:-20,life:.6+Math.random()*.7,s:(sz||10)*(.5+Math.random()),s1:2,c:col,drag:.93,add:Math.random()<.5})}
  }
  function smoke(x,y,n,col){for(let i=0;i<n;i++)add({kind:'blob',x:x+(Math.random()-.5)*30,y,vx:(Math.random()-.5)*50,vy:-20-Math.random()*40,life:1.2+Math.random()*1.2,s:12+Math.random()*16,s1:30,c:col||'rgba(70,70,70,.5)',drag:.97})}
  function explosion(x,y,big){
    sparks(x,y,big?40:20,'#ffb040',big?420:260);
    burst(x,y,'#ff9020',big?26:12,big?26:14);burst(x,y,'#ffe080',big?14:6,big?16:9);smoke(x,y,big?14:6,'rgba(50,40,40,.6)');
    ring(x,y,big?240:130,'#ffcf80',.5);doFlash('#ffcf90',big?.5:.25);FX.addAberr(big?6:3);
  }
  function ring(x,y,r,col,life){add({kind:'wave',x,y,life:life||.6,s:6,s1:r,c:col,add:true})}
  function text(x,y,str,col,big){add({kind:'text',x,y,vy:-60,life:1.1,str,c:col||'#fff',s:big?30:20,drag:.96})}
  function update(dt,g){
    for(let i=P.length-1;i>=0;i--){
      const p=P[i];p.life-=dt;if(p.life<=0){if(p.splash&&p.y>0&&Q.level!=='low')add({kind:'dot',x:p.x,y:p.y,vx:(Math.random()-.5)*60,vy:-60,g:300,life:.25,s:1,c:'rgba(170,210,255,.6)'});P.splice(i,1);continue}
      p.vy+=p.g*dt;p.vx*=p.drag===1?1:Math.pow(p.drag,dt*60);p.vy*=p.drag===1?1:Math.pow(p.drag,dt*60);p.x+=p.vx*dt;p.y+=p.vy*dt;
    }
  }
  function draw(g){
    for(const p of P){
      const k=p.life/p.max,a=p.fade?Math.min(1,k*4)*Math.min(1,(1-k)*4):k;
      g.save();g.globalCompositeOperation=p.add?'lighter':'source-over';
      if(p.kind==='rain'){g.strokeStyle=p.c;g.lineWidth=1;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+p.vx*.025,p.y+p.vy*.025);g.stroke();p.y>H*.98&&(p.life=0)}
      else if(p.kind==='dot'){g.globalAlpha=Math.max(0,a);g.fillStyle=p.c;g.fillRect(p.x,p.y,p.s,p.s)}
      else if(p.kind==='ring'){g.globalAlpha=Math.max(0,a);g.strokeStyle=p.c;g.lineWidth=1;g.beginPath();g.arc(p.x,p.y,p.s,0,6.28);g.stroke()}
      else if(p.kind==='blob'){const s=p.s+(p.s1!==null?(p.s1-p.s)*(1-k):0);g.globalAlpha=Math.max(0,a);g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,s,0,6.28);g.fill()}
      else if(p.kind==='wave'){const r=p.s+(p.s1-p.s)*(1-k);g.globalAlpha=Math.max(0,a);g.strokeStyle=p.c;g.lineWidth=4*k+1;g.beginPath();g.arc(p.x,p.y,r,0,6.28);g.stroke()}
      else if(p.kind==='text'){g.globalAlpha=Math.min(1,k*2);g.font='bold '+p.s+'px "Courier New",monospace';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000';g.strokeText(p.str,p.x,p.y);g.fillStyle=p.c;g.fillText(p.str,p.x,p.y)}
      g.restore();
    }
  }
  const count=()=>P.length;
  return {W,H,Q,set,begin,light,offset,post,addAberr,setGrade,letterbox,flash:doFlash,add,rain,embers,dust,ash,bubbles,sparks,burst,smoke,explosion,ring,text,update,draw,count,mk};
})();
