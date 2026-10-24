'use strict';
/* =========================================================
   ART — cenários em camadas, com luz, neon, reflexo e clima
   Se existir assets/bg/<nome>.png, ele é usado no lugar do procedural.
   ========================================================= */
const ART=(()=>{
  const W=960,H=540,mk=FX.mk;
  const rnd=(i)=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
  const cache={},CJK='"Noto Sans CJK SC","Microsoft YaHei","PingFang SC","Hiragino Sans GB",sans-serif';

  function grad(g,y0,y1,stops){const r=g.createLinearGradient(0,y0,0,y1);stops.forEach(([o,c])=>r.addColorStop(o,c));g.fillStyle=r;g.fillRect(0,y0,W,y1-y0)}
  function stars(g,n,seed,maxY){for(let i=0;i<n;i++){g.globalAlpha=.3+rnd(i+seed)*.7;g.fillStyle='#fff';g.fillRect(rnd(i*3+seed)*W,rnd(i*7+seed)*maxY,1+(rnd(i)>.9),1)}g.globalAlpha=1}
  function glow(g,x,y,r,c,a){const r2=g.createRadialGradient(x,y,0,x,y,r);r2.addColorStop(0,c);r2.addColorStop(1,'rgba(0,0,0,0)');g.save();g.globalAlpha=a===undefined?1:a;g.globalCompositeOperation='lighter';g.fillStyle=r2;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
  function fog(g,y,h,col,a){const r=g.createLinearGradient(0,y,0,y+h);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(.6,col);r.addColorStop(1,'rgba(0,0,0,0)');g.save();g.globalAlpha=a;g.fillStyle=r;g.fillRect(0,y,W,h);g.restore()}
  function skyline(g,o){
    const {seed=1,y=360,minH=80,maxH=260,body='#0b0e26',win=['#ffd070','#7fe0ff'],dens=.45,bw=[34,70],neon=[],step=0,tone='#000',toneA=0}=o;
    let x=-20;let i=0;
    while(x<W+20){
      const w=bw[0]+rnd(i*5+seed)*(bw[1]-bw[0]),h=minH+rnd(i*3+seed)*(maxH-minH);
      const by=y-h;
      const gr=g.createLinearGradient(x,by,x+w,by);gr.addColorStop(0,body);gr.addColorStop(1,tone);
      g.fillStyle=body;g.fillRect(x,by,w,h+2);
      g.fillStyle='rgba(255,255,255,.04)';g.fillRect(x,by,2,h);
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+w-4,by,4,h);
      // topo
      const t=rnd(i+seed*9);
      if(t>.7){g.fillStyle=body;g.fillRect(x+w*.3,by-14,w*.4,14);g.fillRect(x+w*.5,by-34,2,20)}
      else if(t>.4){g.fillStyle=body;g.fillRect(x+4,by-8,w-8,8)}
      // janelas
      for(let wy=by+8;wy<y-8;wy+=9)for(let wx=x+5;wx<x+w-6;wx+=7){
        if(rnd(wx*13.1+wy*7.7+seed)<dens){const c=win[(rnd(wx+wy*3+seed)*win.length)|0];g.fillStyle=c;g.globalAlpha=.35+rnd(wx*3+wy)*.65;g.fillRect(wx,wy,3,5);g.globalAlpha=1}
      }
      // letreiro neon
      if(neon.length&&rnd(i*11+seed)>.62){
        const n=neon[(rnd(i+seed)*neon.length)|0],sy=by+20+rnd(i*2)*(h*.4);
        g.save();g.shadowColor=n[0];g.shadowBlur=14;g.fillStyle=n[0];g.fillRect(x+w-9,sy,5,38);
        g.font='bold 12px '+CJK;g.textAlign='center';g.fillStyle=n[1]||'#fff';
        for(let k=0;k<n[2].length;k++)g.fillText(n[2][k],x+w-6.5,sy+11+k*12);
        g.restore();
      }
      x+=w+(step||rnd(i*9)*4);i++;
    }
    if(toneA){g.fillStyle=tone;g.globalAlpha=toneA;g.fillRect(0,y-maxH-60,W,maxH+60);g.globalAlpha=1}
  }
  function pearl(g,x,y,s,col){
    g.save();g.fillStyle='#5a3a8a';g.fillRect(x-3*s,y-300*s,6*s,300*s);g.fillStyle='#3a2460';g.fillRect(x-14*s,y-60*s,5*s,60*s);g.fillRect(x+9*s,y-60*s,5*s,60*s);g.fillRect(x-3*s,y-230*s,6*s,2*s);
    g.shadowColor=col;g.shadowBlur=22;
    const sp=(cy,r)=>{const rg=g.createRadialGradient(x-r*.3,cy-r*.3,1,x,cy,r);rg.addColorStop(0,'#ff9ac0');rg.addColorStop(.5,col);rg.addColorStop(1,'#401030');g.fillStyle=rg;g.beginPath();g.arc(x,cy,r,0,6.28);g.fill()};
    sp(y-210*s,40*s);sp(y-110*s,24*s);sp(y-30*s,12*s);
    g.fillStyle=col;g.fillRect(x-1,y-355*s,2,60*s);g.restore();
  }
  function reflect(g,fy,a,h){
    const snap=mk(W,fy);snap.getContext('2d').drawImage(g.canvas,0,0,W,fy,0,0,W,fy);
    g.save();g.beginPath();g.rect(0,fy,W,H-fy);g.clip();g.translate(0,fy*2);g.scale(1,-1);g.globalAlpha=a;g.drawImage(snap,0,0);g.restore();
    const r=g.createLinearGradient(0,fy,0,H);r.addColorStop(0,'rgba(5,5,16,.15)');r.addColorStop(1,'rgba(3,3,10,.85)');g.fillStyle=r;g.fillRect(0,fy,W,H-fy);
    g.fillStyle='rgba(255,255,255,.04)';for(let i=0;i<30;i++){g.fillRect(rnd(i)*W,fy+8+rnd(i*3)*(H-fy-8),30+rnd(i*5)*90,1)}
  }
  function lantern(g,x,y,s,c){g.save();g.shadowColor=c;g.shadowBlur=18;g.fillStyle=c;g.beginPath();g.ellipse(x,y,9*s,12*s,0,0,6.28);g.fill();g.fillStyle='#d4a017';g.fillRect(x-4*s,y-14*s,8*s,3*s);g.fillRect(x-4*s,y+11*s,8*s,3*s);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x-4*s,y-6*s,3*s,10*s);g.restore()}
  function dragon(g,x,y,s,col){
    g.save();g.strokeStyle=col;g.fillStyle=col;g.lineWidth=7*s;g.lineCap='round';g.shadowColor=col;g.shadowBlur=14;
    g.beginPath();g.moveTo(x,y+160*s);g.bezierCurveTo(x+90*s,y+120*s,x-90*s,y+80*s,x+40*s,y+30*s);g.bezierCurveTo(x+110*s,y,x+20*s,y-60*s,x+70*s,y-90*s);g.stroke();
    g.lineWidth=2*s;for(let i=0;i<9;i++){const t=i/9;g.beginPath();g.moveTo(x+20*s+t*20*s,y+140*s-t*180*s);g.lineTo(x+40*s+t*20*s,y+130*s-t*190*s);g.stroke()}
    g.beginPath();g.ellipse(x+80*s,y-100*s,17*s,11*s,-.5,0,6.28);g.fill();g.fillStyle='#ffe080';g.beginPath();g.arc(x+84*s,y-104*s,3*s,0,6.28);g.fill();g.restore();
  }
  function flagCN(g,x,y,w,h,wave){
    g.fillStyle='#c4151c';g.fillRect(x,y,w,h);g.fillStyle='#ffde00';
    const star=(cx,cy,r,rot)=>{g.beginPath();for(let i=0;i<10;i++){const a=rot+i*Math.PI/5-Math.PI/2,rr=i%2?r*.4:r;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}g.closePath();g.fill()};
    star(x+w*.18,y+h*.28,h*.2,0);[[.36,.12],[.42,.22],[.42,.36],[.36,.46]].forEach(p=>star(x+w*p[0],y+h*p[1],h*.07,.5));
  }
  function consoleDesk(g,x,y,w,col){
    g.fillStyle='#10131c';g.fillRect(x,y,w,40);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x,y,w,3);
    for(let i=0;i<w/16;i++){g.fillStyle=rnd(i+x)>.5?col:'#40e0ff';g.globalAlpha=.7;g.fillRect(x+6+i*16,y+8,8,4);g.globalAlpha=1}
    g.fillStyle='#050810';g.fillRect(x+10,y-46,w-20,44);g.fillStyle=col;g.globalAlpha=.15;g.fillRect(x+12,y-44,w-24,40);g.globalAlpha=1;
    for(let i=0;i<6;i++){g.fillStyle=col;g.fillRect(x+16,y-38+i*6,20+rnd(i+x)*(w-60),2)}
  }

  /* ---------- CENAS ---------- */
  const S={};

  S.title={amb:'#6a3040',grade:['#ff3040',.10],weather:{embers:.6},
    build(g){grad(g,0,H,[[0,'#10030a'],[.5,'#40101c'],[1,'#8a1a22']]);stars(g,60,3,200);glow(g,720,200,260,'#c0202a',.35);
      skyline(g,{seed:2,y:420,minH:100,maxH:260,body:'#16060d',win:['#ffb040','#ff4050'],dens:.3,neon:[['#ff3040','#fff','中国'],['#ffb020','#fff','龙']]});
      pearl(g,650,430,1.1,'#d02050');skyline(g,{seed:9,y:520,minH:60,maxH:180,body:'#0a0206',win:['#ff9040'],dens:.35,bw:[50,100]});
      dragon(g,180,200,1.5,'rgba(200,40,40,.55)');fog(g,380,140,'rgba(180,30,40,.5)',.6);
      g.font='bold 140px '+CJK;g.textAlign='center';g.save();g.shadowColor='#f00';g.shadowBlur=40;g.fillStyle='rgba(255,60,60,.35)';g.fillText('中国',W/2,250);g.restore()},
    lights:(T)=>[[720,200,420,'rgba(200,40,50,.8)',.8],[480,300,560,'rgba(120,20,30,.5)',.6]]};

  S.office={amb:'#7a6a88',grade:['#ffb050',.10],weather:{dust:.5},
    build(g){grad(g,0,H,[[0,'#050818'],[.5,'#10143a'],[1,'#2a1230']]);stars(g,80,5,200);
      // janela panorâmica
      g.save();g.beginPath();g.rect(170,50,620,330);g.clip();
      grad(g,50,380,[[0,'#04081c'],[1,'#3a1a48']]);stars(g,60,8,200);
      skyline(g,{seed:3,y:320,minH:90,maxH:220,body:'#0a0e30',win:['#7fe0ff','#ffd070'],dens:.4,neon:[['#ff3070','#fff','上海'],['#30c0ff','#fff','电']],toneA:.25,tone:'#40206a'});
      pearl(g,470,330,.85,'#e03070');
      skyline(g,{seed:13,y:395,minH:60,maxH:160,body:'#070820',win:['#ff80c0','#80d0ff'],dens:.45,bw:[44,84]});
      // rio
      grad(g,330,380,[[0,'#101040'],[1,'#050818']]);for(let i=0;i<50;i++){g.fillStyle=['#ff3070','#30c0ff','#ffd070'][i%3];g.globalAlpha=.4;g.fillRect(170+rnd(i)*620,335+rnd(i*3)*40,6+rnd(i*7)*30,1)}g.globalAlpha=1;
      // aeronaves
      [[300,120],[640,160]].forEach(([x,y])=>{g.fillStyle='#10102a';g.beginPath();g.ellipse(x,y,22,5,0,0,6.28);g.fill();g.fillStyle='#ff4060';g.fillRect(x-14,y+3,3,3);g.fillRect(x+10,y+3,3,3)});
      g.restore();
      // caixilhos
      g.fillStyle='#0a0c14';[170,340,480,630,788].forEach(x=>g.fillRect(x-3,44,6,340));g.fillRect(160,44,640,8);g.fillRect(160,376,640,10);
      // paredes laterais, cortinas vermelhas
      g.fillStyle='#3a0a10';g.fillRect(0,0,170,H);g.fillRect(790,0,170,H);g.fillStyle='#d4a017';g.fillRect(168,0,3,H);g.fillRect(788,0,3,H);
      for(let i=0;i<8;i++){g.fillStyle=i%2?'#58101a':'#44080f';g.fillRect(8+i*20,0,18,H);g.fillRect(800+i*20,0,18,H)}
      dragon(g,86,160,.9,'#e0a040');g.save();g.shadowColor='#e0a040';g.shadowBlur=6;g.fillStyle='#e0a040';g.font='bold 18px '+CJK;g.textAlign='center';'中华民族伟大复兴'.split('').forEach((c,i)=>g.fillText(c,886,130+i*22));g.restore();
      flagCN(g,38,230,50,36);flagCN(g,820,230,50,36);
      // piso e mesa holográfica
      grad(g,384,H,[[0,'#2a0a10'],[1,'#080206']]);
      g.fillStyle='#d4a017';g.globalAlpha=.4;for(let i=0;i<16;i++)g.fillRect(i*60,400+i*2,40,2);g.globalAlpha=1;
      g.fillStyle='#1a0a12';g.fillRect(190,400,580,110);g.fillStyle='#d4a017';g.fillRect(190,400,580,3);g.fillRect(190,506,580,3);
      g.fillStyle='#071423';g.fillRect(210,408,540,88);
      // mapa holográfico
      g.fillStyle='#1ab0ff';g.globalAlpha=.35;[[250,420,90,30],[360,430,70,40],[470,418,120,30],[600,430,70,30],[660,452,50,22]].forEach(a=>g.fillRect(...a));g.globalAlpha=1;
      g.strokeStyle='#40e0ff';g.globalAlpha=.25;for(let x=210;x<750;x+=27){g.beginPath();g.moveTo(x,408);g.lineTo(x,496);g.stroke()}for(let y=408;y<496;y+=22){g.beginPath();g.moveTo(210,y);g.lineTo(750,y);g.stroke()}g.globalAlpha=1;
      g.fillStyle='#e03030';g.beginPath();g.arc(300,436,3,0,6.28);g.fill();
      // cadeira
      g.fillStyle='#2a0a10';g.fillRect(445,340,70,70);g.fillStyle='#4a1218';g.fillRect(450,345,60,50);
      // estátuas de leão e bonsai
      g.fillStyle='#c09030';g.fillRect(740,340,30,42);g.fillRect(736,334,38,10);
      g.fillStyle='#4a2a14';g.fillRect(190,372,28,12);g.fillStyle='#206020';[[198,360,18],[212,354,14],[205,348,12]].forEach(a=>{g.beginPath();g.arc(a[0],a[1],a[2]/1.5,0,6.28);g.fill()});
      reflect(g,384,.2);
    },
    dyn(g,T){
      g.save();g.globalCompositeOperation='lighter';
      g.globalAlpha=.2+.08*Math.sin(T*2);g.fillStyle='#1ab0ff';g.fillRect(210,408,540,88);
      g.globalAlpha=.6;g.fillStyle='#ff4060';for(let i=0;i<6;i++){const a=T*.5+i,x=250+((a*60)%480),y=450-Math.sin(a*2)*16;g.fillRect(x,y,3,3);g.globalAlpha=.25;g.fillRect(x-14,y,14,1);g.globalAlpha=.6}
      g.restore();
      g.fillStyle='rgba(255,255,255,.08)';g.fillRect(210,408,540,2+Math.sin(T*3)*1);
    },
    lights:(T)=>[[480,450,460,'rgba(40,160,255,.75)',.9+.1*Math.sin(T*2)],[480,200,520,'rgba(180,70,160,.45)',.7],[90,270,200,'rgba(255,200,80,.45)',.7],[870,270,200,'rgba(255,200,80,.45)',.7],[480,110,300,'rgba(255,170,90,.35)',.5]]};

  S.city={amb:'#5a5a8a',grade:['#40c0ff',.09],weather:{rain:40},
    build(g){grad(g,0,H,[[0,'#04061a'],[.6,'#201040'],[1,'#3a1450']]);stars(g,70,2,200);
      skyline(g,{seed:11,y:360,minH:100,maxH:250,body:'#0a0d2a',win:['#7fe0ff','#ff80c0'],dens:.4,neon:[['#ff3070','#fff','火锅'],['#30e0ff','#fff','电子'],['#ffd030','#222','龙']],toneA:.3,tone:'#40206a'});
      pearl(g,300,370,1.2,'#e03070');
      skyline(g,{seed:23,y:430,minH:80,maxH:220,body:'#070820',win:['#ff5090','#50d0ff'],dens:.5,bw:[50,100],neon:[['#ff2060','#fff','酒'],['#40ff90','#222','药']]});
      fog(g,300,160,'rgba(90,60,160,.5)',.55);
      grad(g,430,H,[[0,'#10101e'],[1,'#04040a']]);g.fillStyle='#d4a017';g.globalAlpha=.4;for(let i=0;i<14;i++)g.fillRect(i*80,500,50,3);g.globalAlpha=1;
      // lanternas penduradas
      g.strokeStyle='#201020';g.beginPath();g.moveTo(0,70);g.quadraticCurveTo(480,130,960,60);g.stroke();for(let i=0;i<9;i++){const x=60+i*110,y=84+Math.sin(i*.7)*18;lantern(g,x,y+20,1,i%2?'#ff3040':'#ffb030')}
      reflect(g,430,.28);
    },
    lights:(T)=>[[300,200,300,'rgba(255,60,120,.6)',.7],[700,320,380,'rgba(40,160,255,.5)',.7],[130,360,260,'rgba(255,60,120,.6)',.6],[480,500,520,'rgba(100,60,200,.4)',.5]]};

  S.port={amb:'#8a6a78',grade:['#ff7040',.12],weather:{dust:.4},
    build(g){grad(g,0,H,[[0,'#2a1050'],[.35,'#d05a50'],[.55,'#f0a050'],[.56,'#1a1030'],[1,'#080410']]);
      g.fillStyle='#ffe0a0';g.globalAlpha=.9;g.beginPath();g.arc(640,250,46,0,6.28);g.fill();g.globalAlpha=1;glow(g,640,250,220,'#ff9050',.7);
      skyline(g,{seed:5,y:310,minH:50,maxH:150,body:'#2a1030',win:['#ffd080'],dens:.3,toneA:.4,tone:'#a04050'});
      // mar
      grad(g,300,H,[[0,'#3a1840'],[1,'#080410']]);g.fillStyle='#ffd090';g.globalAlpha=.25;for(let i=0;i<40;i++)g.fillRect(560+rnd(i)*160,305+rnd(i*3)*140,10+rnd(i*7)*50,1);g.globalAlpha=1;
      // navio
      g.fillStyle='#10081a';g.beginPath();g.moveTo(40,330);g.lineTo(420,330);g.lineTo(380,380);g.lineTo(70,380);g.closePath();g.fill();
      const cols=['#b03030','#3060b0','#c0a030','#308060','#a05020'];
      for(let r=0;r<3;r++)for(let c=0;c<9;c++){g.fillStyle=cols[(c*3+r)%5];g.fillRect(60+c*38,300-r*18,34,16);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(60+c*38,300-r*18+12,34,4)}
      g.fillStyle='#1a1020';g.fillRect(340,260,60,50);g.fillStyle='#ffd070';g.fillRect(348,268,8,6);g.fillRect(364,268,8,6);g.fillRect(380,268,8,6);
      // guindastes
      g.fillStyle='#08040c';g.fillRect(780,110,10,290);g.fillRect(700,110,230,10);g.fillRect(715,120,3,70);g.fillStyle='#ff3030';g.fillRect(708,104,6,6);
      g.fillRect(500,170,8,240);g.fillRect(430,170,160,8);
      // cais
      grad(g,400,H,[[0,'#241430'],[1,'#07040a']]);g.fillStyle='#08040c';g.fillRect(0,400,W,4);
      for(let i=0;i<22;i++){g.fillStyle=cols[i%5];g.fillRect(i*46-10,410+(i%3)*14,40,38);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(i*46-10,436+(i%3)*14,40,12);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(i*46-10,410+(i%3)*14,40,3)}
      flagCN(g,880,350,56,38);g.fillStyle='#222';g.fillRect(876,340,3,70);
    },
    lights:(T)=>[[640,250,520,'rgba(255,140,70,.8)',.9],[420,300,380,'rgba(255,120,80,.4)',.5],[360,300,100,'rgba(255,210,120,.7)',.6]]};

  S.lab={amb:'#33484e',grade:['#40ff80',.07],weather:{bubbles:1,dust:.2},
    build(g){grad(g,0,H,[[0,'#04080a'],[1,'#0a1a14']]);
      // canos no teto
      g.strokeStyle='#0e1a1a';g.lineWidth=10;for(let i=0;i<8;i++){g.beginPath();g.moveTo(i*140-40,0);g.lineTo(i*140+60,50+i%3*14);g.stroke()}g.lineWidth=1;
      g.fillStyle='#08100e';g.fillRect(0,0,W,40);for(let i=0;i<14;i++){g.fillStyle='#0e1c18';g.fillRect(i*70,0,4,40)}
      // parede traseira
      g.fillStyle='#0c1816';g.fillRect(0,40,W,300);for(let i=0;i<12;i++){g.fillStyle='rgba(60,255,120,.04)';g.fillRect(i*80,40,2,300)}
      // placa chinesa
      g.fillStyle='#601018';g.fillRect(34,70,210,70);g.strokeStyle='#d4a017';g.strokeRect(38,74,202,62);g.fillStyle='#ffd0a0';g.font='bold 28px '+CJK;g.textAlign='center';g.fillText('机密实验室',139,108);g.font='13px '+CJK;g.fillText('非授权人员禁止入内',139,128);
      // quadro negro
      g.fillStyle='#10201a';g.fillRect(250,110,260,130);g.strokeStyle='#3a2a1a';g.lineWidth=5;g.strokeRect(250,110,260,130);g.lineWidth=1;
      g.fillStyle='#bcd';g.font='italic 20px serif';g.textAlign='left';g.fillText('E = mc²',262,140);g.font='13px serif';g.fillText('∂ψ/∂t = −(iħ)Ĥψ',262,166);g.fillText('Σ λ ΔE ≈ ħ ω',262,188);g.fillText('Qinghe-01 ?',262,216);
      g.strokeStyle='#bcd';g.beginPath();g.ellipse(440,170,24,10,0,0,6.28);g.ellipse(440,170,24,10,1.1,0,6.28);g.ellipse(440,170,24,10,2.2,0,6.28);g.stroke();g.fillStyle='#bcd';g.beginPath();g.arc(440,170,4,0,6.28);g.fill();
      // bandeira
      flagCN(g,580,120,50,34);
      // pôsteres, armário
      g.fillStyle='#d8d0b0';g.globalAlpha=.8;g.fillRect(640,110,70,100);g.fillRect(730,115,60,90);g.globalAlpha=1;g.strokeStyle='#50403a';g.strokeRect(640,110,70,100);
      g.fillStyle='#1a2a28';g.fillRect(740,260,70,100);for(let i=0;i<5;i++){g.fillStyle='#08100e';g.fillRect(746,268+i*18,58,12)}
      // piso
      grad(g,340,H,[[0,'#0e1c1c'],[1,'#040807']]);
      g.strokeStyle='rgba(60,255,120,.07)';for(let x=0;x<W;x+=60){g.beginPath();g.moveTo(x,340);g.lineTo(480+(x-480)*1.8,H);g.stroke()}
      // mesas
      g.fillStyle='#1d2b28';g.fillRect(30,390,260,40);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(30,390,260,3);g.fillRect(40,430,8,60);g.fillRect(270,430,8,60);
      for(let i=0;i<6;i++){const x=48+i*38;g.fillStyle='rgba(180,255,200,.25)';g.fillRect(x,350,22,40);g.fillStyle='#50ff80';g.globalAlpha=.7;g.fillRect(x+2,368+(i%3)*4,18,20-(i%3)*4);g.globalAlpha=1}
      consoleDesk(g,290,380,180,'#40ff80');
      consoleDesk(g,760,390,170,'#40ff80');
      // tanques bio
      [[58,300],[130,300]].forEach(([x,y],i)=>{g.fillStyle='#0a1412';g.fillRect(x-4,y-110,56,6);g.fillRect(x-4,y+30,56,10);g.fillStyle='rgba(60,255,100,.28)';g.fillRect(x,y-104,48,134);g.strokeStyle='#305040';g.strokeRect(x,y-104,48,134);g.fillStyle='#ffe000';g.font='bold 30px sans-serif';g.textAlign='center';g.fillText(i?'☢':'☣',x+24,y-30)});
      // reator central
      const rx=700,ry=60;g.fillStyle='#1a2428';g.fillRect(rx-24,ry-50,148,26);g.fillRect(rx-24,ry+290,148,26);
      g.fillStyle='#1a2a2e';g.fillRect(rx,ry-24,100,314);g.fillStyle='#0e1a1e';for(let i=0;i<5;i++)g.fillRect(rx-6,ry+i*66,112,10);
      g.fillStyle='#ffd020';for(let i=0;i<8;i++)g.fillRect(rx-24+i*19,ry+300,10,8);
      // caixas radioativas
      g.fillStyle='#1c2024';g.fillRect(840,430,110,70);g.fillStyle='#c09020';g.font='bold 40px sans-serif';g.fillText('☢',895,478);g.font='11px monospace';g.fillStyle='#aaa';g.fillText('D-755',895,494);
      // papéis e fios no chão
      g.strokeStyle='#0a0f0f';g.lineWidth=5;g.beginPath();g.moveTo(0,470);g.bezierCurveTo(200,420,300,520,480,480);g.bezierCurveTo(600,455,600,520,700,500);g.stroke();g.lineWidth=1;
      g.fillStyle='#d8d0c0';g.globalAlpha=.7;[[380,500],[520,520],[600,470],[200,510]].forEach(([x,y])=>{g.save();g.translate(x,y);g.rotate(rnd(x)*3);g.fillRect(-12,-8,24,16);g.restore()});g.globalAlpha=1;
      reflect(g,342,.1);
    },
    dyn(g,T){
      const p=.55+.3*Math.sin(T*2.4);
      g.save();g.globalCompositeOperation='lighter';
      const gr=g.createLinearGradient(700,0,800,0);gr.addColorStop(0,'rgba(20,160,60,'+p*.5+')');gr.addColorStop(.5,'rgba(120,255,140,'+p+')');gr.addColorStop(1,'rgba(20,160,60,'+p*.5+')');
      g.fillStyle=gr;g.fillRect(704,40,92,276);
      for(let i=0;i<5;i++){const y=60+((T*60+i*57)%250);g.fillStyle='rgba(200,255,210,.6)';g.fillRect(712+i*16,y,3,3)}
      g.globalAlpha=.4;g.fillStyle='#50ff80';g.fillRect(58,200+Math.sin(T*2)*3,48,100);g.fillRect(130,200+Math.sin(T*2+1)*3,48,100);
      g.restore();
      if(Math.sin(T*.9)>.985){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,W,H)}
      g.fillStyle='rgba(255,40,40,'+(.3+.3*Math.sin(T*5))+')';g.fillRect(26,230,10,10);
    },
    lights:(T)=>[[750,200,600,'rgba(60,255,110,.95)',.8+.15*Math.sin(T*2.4)],[100,380,260,'rgba(60,255,110,.5)',.7],[330,360,240,'rgba(60,200,255,.55)',.7],[560,60,360,'rgba(220,235,255,.55)',.6+.2*Math.sin(T*13)*(Math.sin(T*.7)>.8?1:0)],[860,380,220,'rgba(255,170,60,.4)',.5],[880,430,200,'rgba(255,60,50,.35)',.5],[34,236,140,'rgba(255,40,40,.7)',.5+.4*Math.sin(T*5)]]};

  S.station={amb:'#5a6a82',grade:['#6090c0',.12],weather:{rain:55,dust:.1},
    build(g){grad(g,0,H,[[0,'#060a12'],[1,'#141c28']]);
      // arco da estação
      g.fillStyle='#0a1018';g.fillRect(0,0,W,60);for(let i=0;i<8;i++){g.fillStyle='#10161e';g.fillRect(i*130,0,10,200)}
      grad(g,60,330,[[0,'#0c1422'],[1,'#1a2430']]);
      // relógio
      g.fillStyle='#1a222c';g.beginPath();g.arc(480,100,34,0,6.28);g.fill();g.fillStyle='#d8d0b0';g.beginPath();g.arc(480,100,29,0,6.28);g.fill();g.strokeStyle='#111';g.beginPath();g.moveTo(480,100);g.lineTo(480,80);g.moveTo(480,100);g.lineTo(494,106);g.stroke();
      // placas
      g.fillStyle='#0a3a2a';g.fillRect(70,80,150,50);g.fillStyle='#d0ffe0';g.font='bold 20px '+CJK;g.textAlign='center';g.fillText('清河站',145,112);
      g.fillStyle='#601018';g.fillRect(740,90,150,44);g.fillStyle='#ffd0a0';g.font='bold 18px '+CJK;g.fillText('禁止入内',815,120);
      // trilhos
      grad(g,330,H,[[0,'#10161c'],[1,'#050709']]);g.fillStyle='#2a2f38';g.fillRect(0,350,W,10);g.fillRect(0,420,W,10);g.fillStyle='#0a0c10';for(let i=0;i<26;i++)g.fillRect(i*40,350,18,90);
      // plataforma
      g.fillStyle='#202830';g.fillRect(0,300,W,50);g.fillStyle='#d8c040';g.fillRect(0,340,W,5);
      // banco
      g.fillStyle='#2a1a10';g.fillRect(320,285,200,12);g.fillRect(325,297,10,28);g.fillRect(505,297,10,28);g.fillRect(320,262,200,8);
      // postes
      [140,780].forEach(x=>{g.fillStyle='#2a2f38';g.fillRect(x,150,6,170);g.fillRect(x-14,144,34,8)});
      // painel de horários quebrado
      g.fillStyle='#0a1018';g.fillRect(600,130,130,70);g.fillStyle='#ff6040';g.font='12px monospace';g.textAlign='left';g.fillText('— — : — —',612,160);g.fillText('ERRO',612,180);
      reflect(g,352,.14);
    },
    lights:(T)=>[[143,160,360,'rgba(255,200,120,.85)',.85+.1*Math.sin(T*7)*(Math.sin(T*.8)>.9?1:0)],[783,160,320,'rgba(255,200,120,.6)',.6],[660,170,140,'rgba(255,90,60,.6)',.6]]};

  S.roof={amb:'#5a5488',grade:['#c040a0',.10],weather:{rain:60},
    build(g){grad(g,0,H,[[0,'#04061a'],[.6,'#1a1030'],[1,'#2a1440']]);stars(g,40,4,200);
      skyline(g,{seed:17,y:440,minH:120,maxH:300,body:'#0a0c26',win:['#ff8fd0','#7fe0ff','#ffd070'],dens:.45,neon:[['#ff3070','#fff','爱'],['#30e0ff','#fff','夜'],['#ffd030','#222','龙']],toneA:.25,tone:'#40206a'});
      pearl(g,580,450,1.3,'#e03070');fog(g,340,140,'rgba(120,60,180,.5)',.5);
      skyline(g,{seed:31,y:520,minH:40,maxH:140,body:'#06061a',win:['#ff5090'],dens:.3,bw:[60,120]});
      // laje e grade
      grad(g,420,H,[[0,'#161a26'],[1,'#080a12']]);g.fillStyle='#4a5060';g.fillRect(0,408,W,5);for(let i=0;i<48;i++)g.fillRect(i*20,408,2,34);g.fillRect(0,440,W,3);
      g.fillStyle='#202636';g.fillRect(780,360,120,100);g.fillStyle='#0a0e18';g.fillRect(790,370,40,80);
      reflect(g,444,.35);
    },
    lights:(T)=>[[580,250,420,'rgba(255,60,120,.65)',.8],[200,300,360,'rgba(60,200,255,.5)',.7],[840,330,160,'rgba(255,200,80,.5)',.5]]};

  S.qinghe={amb:'#7a7274',grade:['#a09088',.15],weather:{ash:1,embers:.1},
    build(g){grad(g,0,H,[[0,'#2a2a2e'],[.6,'#5a504c'],[1,'#7a6a62']]);
      glow(g,700,200,300,'#a08070',.35);
      skyline(g,{seed:41,y:420,minH:80,maxH:220,body:'#242224',win:['#403838'],dens:.05,bw:[40,90],toneA:.4,tone:'#6a5a52'});
      // prédios em ruínas (quebrados)
      for(let i=0;i<14;i++){const x=i*72-10,h=90+rnd(i)*190;g.fillStyle='#1c1a1c';g.beginPath();g.moveTo(x,440);g.lineTo(x,440-h);g.lineTo(x+20+rnd(i*3)*20,440-h+rnd(i*5)*40);g.lineTo(x+50,440-h+10);g.lineTo(x+60,440);g.fill();
        for(let wy=440-h+16;wy<430;wy+=22)for(let wx=x+8;wx<x+48;wx+=16){if(rnd(wx+wy)>.3){g.fillStyle='#050405';g.fillRect(wx,wy,8,12)}}}
      fog(g,300,170,'rgba(190,170,160,.55)',.55);
      // letreiro da cidade
      g.fillStyle='#2a2626';g.fillRect(380,150,200,58);g.strokeStyle='#4a4444';g.strokeRect(384,154,192,50);g.fillStyle='#8a7a70';g.font='bold 30px '+CJK;g.textAlign='center';g.fillText('清河',480,192);
      // chão
      grad(g,430,H,[[0,'#3a3434'],[1,'#141212']]);g.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<30;i++)g.fillRect(rnd(i)*W,440+rnd(i*3)*100,20+rnd(i*5)*80,2);
      // escombros e triciclo
      g.fillStyle='#2a2626';[[100,470,60,26],[300,490,80,24],[660,480,90,30],[820,470,60,24]].forEach(([x,y,w,h])=>{g.beginPath();g.moveTo(x,y+h);g.lineTo(x+w*.2,y);g.lineTo(x+w*.7,y+4);g.lineTo(x+w,y+h);g.fill()});
      g.strokeStyle='#6a3a2a';g.lineWidth=3;g.beginPath();g.arc(470,490,12,0,6.28);g.arc(500,490,8,0,6.28);g.moveTo(470,490);g.lineTo(484,466);g.lineTo(500,490);g.stroke();g.lineWidth=1;
    },
    dyn(g,T){if(Math.sin(T*1.7)>.985){FX.addAberr(5)}},
    lights:(T)=>[[700,200,520,'rgba(190,150,120,.7)',.7],[480,420,640,'rgba(120,100,100,.3)',.4]]};

  S.tower={amb:'#52486e',grade:['#40ff90',.06],weather:{embers:.8,bubbles:0},
    build(g){grad(g,0,H,[[0,'#06040c'],[1,'#120a22']]);
      g.strokeStyle='#1a1230';g.lineWidth=3;for(let i=0;i<14;i++){g.beginPath();g.moveTo(i*70-20,0);g.quadraticCurveTo(480,200,480+(i-7)*18,280);g.stroke()}
      g.strokeStyle='#2a1a50';g.lineWidth=1;for(let i=0;i<14;i++){g.beginPath();g.moveTo(i*70-20,0);g.quadraticCurveTo(480,200,480+(i-7)*18,280);g.stroke()}
      // arcos laterais
      for(let s=0;s<2;s++){g.fillStyle='#0c0818';g.fillRect(s?820:0,0,140,H);for(let i=0;i<6;i++){g.fillStyle='#1a1230';g.fillRect((s?826:6)+i*22,20,12,H)}}
      grad(g,380,H,[[0,'#140c24'],[1,'#05030a']]);
      // plataforma
      g.fillStyle='#1c1430';g.beginPath();g.ellipse(480,430,260,50,0,0,6.28);g.fill();g.strokeStyle='#40ff90';g.globalAlpha=.4;g.beginPath();g.ellipse(480,430,260,50,0,0,6.28);g.stroke();g.globalAlpha=1;
      reflect(g,382,.18);
    },
    dyn(g,T){
      const p=.55+.3*Math.sin(T*3);
      g.save();g.globalCompositeOperation='lighter';
      let r=g.createRadialGradient(480,260,10,480,260,190);r.addColorStop(0,'rgba(180,255,200,'+p+')');r.addColorStop(.35,'rgba(60,255,120,'+p*.6+')');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(260,60,440,400);
      g.strokeStyle='rgba(120,255,170,'+p+')';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.arc(480,260,50+i*34+Math.sin(T*3+i)*6,0,6.28);g.stroke()}
      for(let i=0;i<16;i++){const a=T*.8+i*.39,r2=90+Math.sin(T*2+i)*20;g.fillStyle='rgba(180,255,210,.7)';g.fillRect(480+Math.cos(a)*r2,260+Math.sin(a)*r2*.8,2,2)}
      g.restore();
    },
    lights:(T)=>[[480,240,430,'rgba(60,255,120,.85)',.85+.12*Math.sin(T*3)],[330,300,520,'rgba(210,220,255,.55)',.8],[120,300,260,'rgba(160,60,255,.45)',.6],[840,300,260,'rgba(160,60,255,.45)',.6]]};

  S.black={build(g){g.fillStyle='#04040a';g.fillRect(0,0,W,H)},lights:()=>[]};

  function get(name){
    const sc=S[name]||S.black;
    if(!sc._c){const c=mk(W,H);sc.build(c.getContext('2d'));sc._c=c}
    return sc;
  }
  const IMGBG={};
  function loadImg(name){if(IMGBG[name]!==undefined)return IMGBG[name];IMGBG[name]=null;const im=new Image();im.onload=()=>{IMGBG[name]=im};im.onerror=()=>{IMGBG[name]=false};im.src='assets/bg/'+name+'.png';return null}
  let cur='',wt=0;
  function draw(g,name,T,dt,nolight,opts){
    const sc=get(name);loadImg(name);
    if(cur!==name){cur=name;const gr=sc.grade;if(gr)FX.setGrade(gr[0],gr[1]);else FX.setGrade(null,0)}
    const im=IMGBG[name];
    // parallax sutil
    const px=Math.sin(T*.15)*5,py=Math.cos(T*.12)*2;
    g.save();g.translate(-px-6,-py-(opts&&opts.lift?0:0));g.scale(1.02,1.02);
    if(im)g.drawImage(im,0,0,W,H);else g.drawImage(sc._c,0,0);
    if(sc.dyn)sc.dyn(g,T);
    g.restore();
    if(!nolight){FX.begin(sc.amb||'#18182c');const ls=sc.lights?sc.lights(T):[];ls.forEach(l=>FX.light(l[0],l[1],l[2],l[3],l[4]))}
    // clima
    if(!FX.Q.reduce){
      const w=sc.weather||{};
      if(w.rain)FX.rain(w.rain*8,dt);
      if(w.embers&&Math.random()<w.embers*dt*8)FX.embers(1);
      if(w.dust&&Math.random()<w.dust*dt*4)FX.dust(1);
      if(w.ash&&Math.random()<dt*14)FX.ash(1);
      if(w.bubbles&&Math.random()<dt*10)FX.bubbles(704,300,90,1);
    }
  }
  return {draw,get,glow,rnd,CJK,S};
})();
