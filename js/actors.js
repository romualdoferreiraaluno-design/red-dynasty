'use strict';
/* =========================================================
   ACTORS — retratos animados (piscar, falar) e sprites com ciclo de andar.
   Se existir assets/portraits/<id>.png ou assets/sprites/<id>.png, é usado no lugar.
   ========================================================= */
const ACT=(()=>{
  const mk=FX.mk;
  const DEF={
    mao:{n:'Mao Ernani',skin:'#d9a07a',skinD:'#a8704e',hair:null,cloth:'#b3121c',cloth2:'#e0a040',acc:'goatee',eye:'#2a1a10',bg:['#4a0c10','#14040a'],rim:['#ff3040','#ffb040'],h:1.0},
    ernani:{n:'Ernani',skin:'#d9a07a',skinD:'#a8704e',hair:'#2a1a12',cloth:'#4b5a3a',cloth2:'#1a2030',acc:'lanyard',eye:'#2a1a10',bg:['#1c2a1c','#060a08'],rim:['#40e0ff','#ff40a0'],h:1.0},
    milho:{n:'Menino do Milho',skin:'#d9a07a',skinD:'#a8704e',hair:'#2a1a12',cloth:'#eeeeee',cloth2:'#1a2a4a',acc:'glasses',eye:'#2a1a10',bg:['#12203a','#04060c'],rim:['#40a0ff','#ffd040'],h:.96},
    lobao:{n:'Lobão',skin:'#d9a07a',skinD:'#a8704e',hair:'#3a3a3a',cloth:'#f2f2f2',cloth2:'#222',acc:'glassbeard',eye:'#2a1a10',bg:['#2a0c0c','#0a0404'],rim:['#ff4040','#40ff90'],h:1.0},
    seita:{n:'Guardião',skin:'#8a6a50',skinD:'#5a4030',hair:null,cloth:'#1a1216',cloth2:'#8a1010',acc:'none',eye:'#c8a040',bg:['#3a0a08','#050203'],rim:['#ff3a20','#d4a017'],h:1.08},
    x:{n:'*****',skin:'#b8805a',skinD:'#8a5a3a',hair:'#1a1210',cloth:'#7a1020',cloth2:'#2a2a30',acc:'beard',eye:'#2a1a10',bg:['#0c2a0c','#020a04'],rim:['#40ff70','#ff3040'],h:1.1}
  };
  const IM={};
  const loadI=(k,p)=>{const key=p+'.'+k;if(IM[key]!==undefined)return IM[key];IM[key]=null;const im=new Image();im.onload=()=>{IM[key]=im};im.onerror=()=>{IM[key]=false};im.src='assets/'+(p==='p'?'portraits/':'sprites/')+k+'.png';return null};
  ['novico','iniciado','guardiao','mestre','anciao'].forEach(n=>{DEF['seita_'+n]=Object.assign({},DEF.seita,{n:({novico:'Semeador',iniciado:'Guardião',guardiao:'Intérprete',mestre:'Jardineiro',anciao:'Cultivador-Mor'})[n]})});
  Object.keys(DEF).forEach(k=>{loadI(k,'p');loadI(k,'s');['neutral','angry','smile','sad','surprised'].forEach(e=>loadI(k+'_'+e,'p'));for(let i=0;i<6;i++)loadI(k+'_w'+i,'s')});['tigre','tigre_w0','tigre_w1','tigre_w2','tigre_int','tigre_atk','tigre_bite','tigre_roar'].forEach(k=>loadI(k,'s'));loadI('tigre','p');

  const L=48,buf=mk(L,L),b=buf.getContext('2d');b.imageSmoothingEnabled=false;
  const R=(x,y,w,h,c)=>{b.fillStyle=c;b.fillRect(x,y,w,h)};
  const blinkAt=(t,k)=>{const p=(t+k*1.7)%4.1;return p>3.95?1:p>3.9?.5:0};

  /* ---- retrato: desenha em g (qualquer tamanho) ---- */
  function portrait(g,k,size,expr,t,talk,tint){
    const blinkI=(Math.sin((t||0)*1.3)>.985)&&IM['p.'+k+'_sad'];
    const im=blinkI||IM['p.'+k+'_'+(expr||'neutral')]||IM['p.'+k];
    if(im){g.imageSmoothingEnabled=false;g.clearRect(0,0,size,size);g.drawImage(im,0,0,size,size);
      if(talk){const my=size*.78,a=Math.sin((t||0)*22)>0?1:0;g.fillStyle='rgba(20,0,0,'+(.35*a)+')';g.fillRect(size*.4,my,size*.2,size*.04*a)}
      if(tint){g.save();g.globalCompositeOperation='lighter';g.fillStyle=tint;g.globalAlpha=.12+.08*Math.sin((t||0)*6);g.fillRect(0,0,size,size);g.restore()}
      g.fillStyle='rgba(0,0,0,.12)';for(let y=0;y<size;y+=3)g.fillRect(0,y,size,1);return}
    const d=DEF[k]||DEF.ernani;t=t||0;expr=expr||'neutral';
    b.clearRect(0,0,L,L);
    // fundo com gradiente, janela neon
    const gr=b.createLinearGradient(0,0,0,L);gr.addColorStop(0,d.bg[0]);gr.addColorStop(1,d.bg[1]);b.fillStyle=gr;b.fillRect(0,0,L,L);
    for(let i=0;i<14;i++){b.fillStyle=(i%2)?d.rim[0]:d.rim[1];b.globalAlpha=.25;b.fillRect((i*7+3)%L,8+(i*5)%22,2,3+(i%3));b.globalAlpha=1}
    // ombros / roupa
    R(4,38,40,10,d.cloth);R(4,38,40,2,'rgba(255,255,255,.18)');R(30,38,14,10,'rgba(0,0,0,.28)');
    if(k==='mao'){R(18,38,12,10,d.cloth2);R(22,38,4,10,'#7a0a12');R(20,36,8,2,d.cloth2);for(let i=0;i<4;i++){R(8+i*8,42,3,2,d.cloth2)}}
    else if(k==='lobao'){R(16,38,16,10,'#1a1a20');R(12,38,6,10,'#fff');R(30,38,6,10,'#fff');R(22,38,4,10,'#d0d0d8')}
    else if(k==='milho'){R(18,38,12,5,'#fff');R(22,38,4,8,'#1a2a4a');R(21,40,6,2,'#5a6a8a')}
    else if(k==='x'){R(18,38,12,10,'#aaa');R(20,41,8,6,'#fff');R(22,42,4,4,'#c03020')}
    else{R(20,38,8,3,d.skin)}
    if(k==='ernani'){R(20,38,2,10,'#111');R(26,38,2,10,'#111');R(21,44,6,4,'#eee');R(22,45,4,2,'#223')}
    // pescoço
    R(20,31,8,8,d.skinD);R(20,31,8,2,'rgba(0,0,0,.35)');
    // cabeça
    const hs=d.h;
    const hx=24,hy=20,rw=9.2,rh=12*hs;
    b.fillStyle=d.skin;b.beginPath();b.ellipse(hx,hy,rw,rh,0,0,6.28);b.fill();
    // orelhas
    R(14,19,2,4,d.skinD);R(32,19,2,4,d.skinD);
    // sombra lateral (luz da esquerda)
    b.save();b.beginPath();b.ellipse(hx,hy,rw,rh,0,0,6.28);b.clip();
    b.fillStyle='rgba(120,60,40,.35)';b.fillRect(29,6,10,34);b.fillStyle='rgba(120,60,40,.18)';b.fillRect(26,6,3,34);
    b.fillStyle='rgba(255,230,200,.18)';b.fillRect(15,12,3,12);
    b.fillStyle='rgba(0,0,0,.18)';b.fillRect(14,28,22,8);
    b.restore();
    // cabelo
    const hc=d.hair;
    if(hc){b.fillStyle=hc;b.beginPath();b.ellipse(hx,hy-6,rw+.8,7*hs,0,Math.PI,6.28);b.fill();R(14,10,2,8,hc);R(32,10,2,8,hc);
      R(18,9,4,2,'rgba(255,255,255,.18)');
      if(k==='lobao'){R(14,14,2,6,'#9a9a9a');R(32,14,2,6,'#9a9a9a');R(16,8,16,2,'#8a8a8a')}
      if(k==='ernani'||k==='milho'){R(16,10,16,2,hc);R(19,8,12,2,hc)}
    }else{R(18,10,6,2,'rgba(255,255,255,.35)');R(19,9,3,1,'rgba(255,255,255,.55)')}
    // sobrancelhas
    const bw=expr==='sad'?[1,-1]:expr==='angry'?[-1,1]:expr==='surprised'?[-2,-2]:[0,0];
    const bc=hc||'#2a2a2a';
    R(17,15+bw[0],5,1,k==='lobao'?'#6a6a6a':bc);R(26,15+bw[1],5,1,k==='lobao'?'#6a6a6a':bc);
    if(expr==='angry'){R(21,16,1,1,bc);R(26,16,1,1,bc)}
    // olhos
    const bl=blinkAt(t,k.length);
    const eyeY=19+(expr==='sad'?0:0);
    [[18,eyeY],[27,eyeY]].forEach(([ex,ey],i)=>{
      if(bl>.7){R(ex,ey+1,4,1,d.skinD);R(ex,ey+1,4,1,'rgba(0,0,0,.45)')}
      else{
        const hh=bl>.2||expr==='sad'?2:3;
        R(ex,ey,4,hh,'#f4f0ea');
        const ix=ex+1+(Math.sin(t*.7)>.8?1:0)+(Math.sin(t*.3+i)>.92?-1:0);
        R(ix,ey,2,hh,tint||d.eye);R(ix,ey,1,1,'#fff');
        R(ex,ey-1,4,1,'rgba(0,0,0,.45)');
        if(expr==='sad')R(ex,ey+hh,4,1,'rgba(180,90,90,.35)');
      }
    });
    // nariz
    R(23,22,2,5,'rgba(110,55,35,.45)');R(22,27,4,1,'rgba(90,40,25,.6)');R(24,22,1,3,'rgba(255,230,200,.25)');
    // bochechas
    if(expr==='smile'){R(17,25,2,1,'rgba(255,120,110,.3)');R(29,25,2,1,'rgba(255,120,110,.3)')}
    // barba e cavanhaque
    if(d.acc==='goatee'){R(17,23,5,1,'#222');R(26,23,5,1,'#222');R(21,29,6,1,'#1a1a1a');R(22,31,4,4,'#161616');R(20,30,8,1,'#111')}
    else if(d.acc==='lanyard'){b.fillStyle='rgba(30,20,15,.35)';for(let i=0;i<30;i++){b.fillRect(16+((i*7)%16),27+((i*5)%8),1,1)}R(22,33,4,2,'#2a1a12');R(21,29,6,1,'#2a1a12')}
    else if(d.acc==='glassbeard'){R(15,26,3,8,'#9a9a9a');R(30,26,3,8,'#9a9a9a');R(16,31,16,4,'#a8a8a8');R(18,29,12,2,'#bdbdbd');R(20,28,8,1,'#d0d0d0')}
    else if(d.acc==='beard'){R(14,24,4,9,'#1a1210');R(30,24,4,9,'#1a1210');R(16,30,16,5,'#1a1210');R(19,28,10,2,'#1a1210');R(20,27,8,1,'#2a1c16')}
    // boca
    const my=30+(d.acc==='goatee'?-1:0)+(d.acc==='beard'||d.acc==='glassbeard'?-1:0);
    const open=talk?(Math.sin(t*22)>0?2:1):0;
    if(open){R(21,my,6,open+1,'#3a0c0c');R(21,my,6,1,'#e8e0d8');R(22,my+open,4,1,'#c0505a')}
    else if(expr==='smile'){R(20,my,1,1,'#7a2a2a');R(21,my+1,6,1,'#7a2a2a');R(27,my,1,1,'#7a2a2a');R(22,my+1,4,1,'#f4f0ea')}
    else if(expr==='sad'){R(21,my+1,6,1,'#7a2a2a');R(20,my+2,1,1,'#7a2a2a');R(27,my+2,1,1,'#7a2a2a')}
    else if(expr==='angry'){R(21,my+1,6,1,'#6a2020');R(21,my,1,1,'#6a2020')}
    else R(21,my+1,6,1,'#8a3a3a');
    // óculos
    if(d.acc==='glasses'||d.acc==='glassbeard'){
      b.fillStyle='#111';[[16,18],[26,18]].forEach(([x,y])=>{R(x,y,7,1,'#111');R(x,y+5,7,1,'#111');R(x,y,1,6,'#111');R(x+6,y,1,6,'#111');R(x+1,y+1,2,1,'rgba(180,220,255,.5)')});
      R(23,20,3,1,'#111');R(14,19,2,1,'#111');R(32,19,2,1,'#111');
    }
    // luz de contorno neon
    b.save();b.globalCompositeOperation='lighter';
    b.fillStyle=d.rim[0];b.globalAlpha=.45;b.fillRect(14,10,2,24);b.globalAlpha=.2;b.fillRect(4,38,3,10);
    b.fillStyle=d.rim[1];b.globalAlpha=.35;b.fillRect(32,10,2,24);b.restore();
    if(tint){b.save();b.globalCompositeOperation='lighter';b.fillStyle=tint;b.globalAlpha=.12+.08*Math.sin(t*6);b.fillRect(0,0,L,L);b.restore()}
    // saída
    g.imageSmoothingEnabled=false;g.clearRect(0,0,size,size);g.drawImage(buf,0,0,size,size);
    // moldura vidro/scan
    g.fillStyle='rgba(0,0,0,.14)';for(let y=0;y<size;y+=3)g.fillRect(0,y,size,1);
  }

  /* ---- sprites ---- */
  const tmpS=mk(120,160),ts=tmpS.getContext('2d');
  function sprite(g,k,x,y,s,o){
    // x,y = pés; s = escala; o = {walk(0..), face(-1,1), t, atk(0..1), hurt(0..1), alpha}
    o=o||{};const d=DEF[k]||DEF.ernani,t=o.t||0,im=IM['s.'+k];
    const fx=o.face||1,wk=o.walk||0;
    g.save();g.translate(x,y);
    // sombra
    g.fillStyle='rgba(0,0,0,.42)';g.beginPath();g.ellipse(0,1,13*s*d.h,4*s,0,0,6.28);g.fill();
    g.scale(fx,1);
    if(im){
      let fr=im;const ws=[0,1,2,3,4,5].map(i=>IM['s.'+k+'_w'+i]).filter(Boolean);
      if(wk&&ws.length){const seq=ws.length<4?[ws[0],im,ws[1]||ws[0],im]:ws;fr=seq[Math.floor(wk*seq.length)%seq.length]}
      const th=40*s*d.h*(o.big||1),r=th/fr.height,w=fr.width*r;
      const bob2=wk?-Math.abs(Math.sin(wk*Math.PI*2))*s*.8:Math.sin(t*2)*-.5*s;
      g.imageSmoothingEnabled=false;g.drawImage(fr,-w/2,-th+bob2,w,th);g.restore();return}
    const R=(rx,ry,w,h,c)=>{g.fillStyle=c;g.fillRect(rx*s,ry*s,w*s,h*s)};
    const bob=wk?Math.abs(Math.sin(wk*Math.PI*2))*-1:Math.sin(t*2)*-.35;
    const sw=wk?Math.sin(wk*Math.PI*2):0,hh=d.h;
    g.translate(0,bob*s);
    const ht=k==='x'?1.12:1;g.scale(ht,ht);
    const leg=(lx,ph)=>{const a=wk?Math.sin(wk*Math.PI*2+ph)*4:0;R(lx,-12,4,12+(a>0?-a*.3:0),k==='mao'?'#18181c':k==='x'?'#2a2a2e':'#1a2030');R(lx-.5+a*.5,-2,5,2,'#101014')};
    leg(-5,0);leg(1,Math.PI);
    // tronco
    R(-6,-24,12,13,d.cloth);R(3,-24,3,13,'rgba(0,0,0,.28)');R(-6,-24,2,13,'rgba(255,255,255,.15)');
    if(k==='mao'){R(-6,-24,12,2,d.cloth2);R(-1,-24,2,13,'#7a0a12');for(let i=0;i<3;i++){R(-5,-20+i*4,3,1.5,d.cloth2);R(2,-20+i*4,3,1.5,d.cloth2)}R(-6,-13,12,2,d.cloth2)}
    if(k==='ernani'){R(-1,-24,2,10,'#111');R(-1,-16,2,3,'#eee');R(-6,-13,12,1,'#222')}
    if(k==='milho'){R(-2,-24,4,4,'#fff');R(-1,-24,2,10,'#1a2a4a');R(-5,-22,10,1,'rgba(0,0,0,.15)')}
    if(k==='lobao'){R(-6,-24,12,17,'#f2f2f6');R(-2,-24,4,14,'#1a1a20');R(-6,-8,12,1,'rgba(0,0,0,.15)');R(3,-22,3,2,'#bcd')}
    if(k==='x'){R(-4,-18,1.6,3,'#8fff40');R(-1.5,-18,1.6,3,'#8fff40');R(1,-18,1.6,3,'#8fff40');R(-6,-13,12,2,'#201010');R(-1,-22,2,2,'#fff')}
    // braços
    const aA=wk?sw*4:Math.sin(t*2)*.6;
    const armc=k==='lobao'?'#f2f2f6':d.cloth;
    R(-9,-23+aA*.2,3,10,armc);R(6,-23-aA*.2,3,10,armc);R(-9,-14+aA*.2,3,3,d.skin);R(6,-14-aA*.2,3,3,d.skin);
    if(o.atk){const a=Math.sin(o.atk*Math.PI);R(6,-21,6+a*8,3,armc);R(12+a*8,-21,3,3,d.skin);if(k==='ernani'||k==='lobao'){R(15+a*8,-22,5,2,'#222')}}
    // pescoço e cabeça
    R(-2,-26,4,3,d.skinD);
    const hy=-37*1,hw=9;
    R(-4.5,-36,9,10,d.skin);R(1.5,-36,3,10,'rgba(120,60,40,.35)');R(-4.5,-36,1.5,8,'rgba(255,230,200,.2)');
    if(d.hair){R(-5,-38,10,4,d.hair);R(-5,-36,1.5,3,d.hair);R(3.5,-36,1.5,3,d.hair);R(-3,-39,6,1,d.hair)}else R(-3,-37,3,1,'rgba(255,255,255,.4)');
    if(k==='lobao'){R(-5,-38,10,2,'#8a8a8a');R(-4,-31,8,4,'#aaa')}
    if(k==='x'){R(-4,-31,8,4,'#1a1210')}
    if(k==='mao'){R(-1,-30,2,3,'#161616')}
    if(k==='ernani'){R(-3,-30,6,1,'rgba(30,20,15,.5)')}
    const bl=blinkAt(t,k.length);
    if(bl<.5){R(-3,-33,1.5,1.5,'#111');R(1.5,-33,1.5,1.5,'#111');R(-3,-33,.6,.6,'#fff');R(1.5,-33,.6,.6,'#fff')}else{R(-3,-32.5,1.5,.6,'#222');R(1.5,-32.5,1.5,.6,'#222')}
    if(d.acc==='glasses'||d.acc==='glassbeard'){g.strokeStyle='#111';g.lineWidth=.8*s;g.strokeRect(-4*s,-34*s,3.6*s,3*s);g.strokeRect(.4*s,-34*s,3.6*s,3*s)}
    if(o.hurt>0){g.globalCompositeOperation='source-atop'}
    g.restore();
    if(o.hurt>0){g.save();g.globalAlpha=Math.min(1,o.hurt)*.0;g.restore()}
  }
  function tiger(g,x,y,s,o){
    o=o||{};const t=o.t||0,wk=o.walk||0,fx=o.face||1,im=IM['s.tigre'];
    g.save();g.translate(x,y);g.fillStyle='rgba(0,0,0,.42)';g.beginPath();g.ellipse(0,1,26*s,5*s,0,0,6.28);g.fill();g.scale(fx,1);
    if(im){let f=im;const pose=o.pose;if(pose&&IM['s.tigre_'+pose])f=IM['s.tigre_'+pose];else if(wk>0){const q=IM['s.tigre_w'+(Math.floor((t||0)*8)%2)];if(q)f=q}
      const w=44*s*(f===IM['s.tigre_atk']||f===IM['s.tigre_roar']?1.1:1),h=f.height*w/f.width;g.drawImage(f,-w/2,-h+1,w,h);g.restore();return}
    const R=(rx,ry,w,h,c)=>{g.fillStyle=c;g.fillRect(rx*s,ry*s,w*s,h*s)};
    const br=Math.sin(t*2)*.5,ph=wk*Math.PI*2;
    const leg=(lx,p)=>{const a=wk?Math.sin(ph+p)*4:0;R(lx+a*.4,-9,5,9,'#c47a20');R(lx-.5+a*.4,-1.5,6,2,'#f0d8b0')};
    leg(-17,0);leg(11,Math.PI);leg(-10,Math.PI*.5);leg(4,Math.PI*1.5);
    R(-20,-20+br,40,13,'#e0902c');R(-20,-9+br,40,3,'#f4d8a8');R(-20,-20+br,40,2,'rgba(255,230,160,.4)');R(6,-20+br,14,13,'rgba(120,50,0,.25)');
    for(let i=0;i<7;i++){R(-17+i*5.5,-20+br,1.8,10,'#2a1608')}
    const tw=Math.sin(t*2.6)*6;R(-30,-18+br+tw*.2,12,3,'#e0902c');R(-34,-20+br+tw*.5,5,3,'#2a1608');
    R(16,-27+br,15,14,'#e8982f');R(28,-22+br,6,7,'#f4d8a8');R(33,-21+br,2,2,'#2a1010');R(18,-29+br,4,4,'#c47a20');R(26,-29+br,4,4,'#c47a20');
    R(24,-24+br,3,1.5,'#7fdc50');R(19,-27+br,1.5,6,'#2a1608');R(23,-27+br,1.5,6,'#2a1608');
    g.restore();
  }
  return {portrait,sprite,tiger,DEF,im:IM,blinkAt};
})();
