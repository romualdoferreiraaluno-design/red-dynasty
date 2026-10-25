'use strict';
/* =========================================================
   RED DYNASTY: THE PRICE OF ASCENSION — ALPHA 0.2 (motor HD-2D em Canvas)
   Módulos: fx.js (luz/bloom/partículas) • art.js (cenários)
            actors.js (retratos/sprites) • audio.js • game.js
   ========================================================= */
const $=id=>document.getElementById(id);
const cv=$('cv'),ctx=cv.getContext('2d');
const W=960,H=540;
const rnd=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const ri=n=>Math.floor(Math.random()*n);
const CH=ACT.DEF;
let PORT={k:null,expr:'neutral'},dtS=.016;

/* ---------- ESTADO ---------- */
const fresh=()=>({love:0,mao:3,unrest:2,research:0,frag:0,flags:{},dupe:1,zee:0,money:150,infl:0,scene:'intro',found:{},seita:{sinais:0,grao:0,contam:0,aliado:0,calma:0}});
let G=fresh();
let mode='title',view='bg',bgName='black',queue=[],done=null,typing=null,typeFull=null,waiting=null,shake=0,glitchT=0,T=0,cardTok=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function add(k,v){G[k]=clamp(G[k]+v,0,k==='money'?9999:10)}
const ENDS_KEY='chinaRPG_endings',SAVE_KEY='chinaRPG_save';
const endings=()=>{try{return JSON.parse(localStorage.getItem(ENDS_KEY)||'[]')}catch(e){return[]}};

/* ---------- ENGINE DE DIÁLOGO ---------- */
const sayf=(c,t,e,g)=>({c,t,e,g});
const Mao=(t,e)=>sayf('mao',t,e),Ern=(t,e)=>sayf('ernani',t,e),Mil=(t,e)=>sayf('milho',t,e),Lob=(t,e)=>sayf('lobao',t,e),Xx=(t,e)=>sayf('x',t,e),Nar=t=>({t});
const Gl=(c,t)=>sayf(c,t,null,true);
const SY='#%&@$¤§░▒';
const garble=s=>s.replace(/[a-zA-ZÀ-ú]/g,c=>Math.random()<0.1?SY[ri(SY.length)]:c);

function jump(id){queue=(S[id]||[]).slice();G.scene=id;done=null;if(mode!=='title')autosave();step()}
function playLines(lines,cb){queue=lines.slice();done=cb||null;step()}
function autosave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(G))}catch(e){}}

function step(){
  waiting=null;
  if(!queue.length){if(done){const d=done;done=null;d()}return}
  const n=queue.shift();
  if(n.fn){n.fn();return step()}
  if(n.bg){bgName=n.bg;view='bg';AUDIO.setMood(bgName);return step()}
  if(n.glitch){glitchT=n.glitch;AUDIO.play('glitch');FX.addAberr(9);return step()}
  if(n.shake){shake=n.shake;if(n.shake>=15){AUDIO.play('thud');FX.flash('#fff',.25)}return step()}
  if(n.go){return jump(n.go)}
  if(n.if){queue.unshift(...(n.if()?n.then:(n.else||[])));return step()}
  if(n.mode){hideDlg();if(n.mode==='explore')startExplore(n.map);else if(n.mode==='manage')startManage(n);else if(n.mode==='battle')startBattle();return}
  if(n.title){showCard(n);return}
  if(n.ch){showChoice(n);return}
  if(n.end){showEnding(n.end);return}
  if(n.t!==undefined){showSay(n);return}
  step();
}
function hideDlg(){$('dlg').classList.remove('on');$('choices').innerHTML=''}
function showSay(n){
  const ch=n.c?CH[n.c]:null,d=$('dlg');d.classList.add('on');$('choices').innerHTML='';
  $('name').textContent=ch?ch.n:'';
  if(ch){d.classList.add('pt');PORT={k:n.c,expr:n.e||'neutral'}}else{d.classList.remove('pt');PORT.k=null}
  const tx=$('text');tx.className=n.g?'gl':'';
  let s=typeof n.t==='function'?n.t():n.t;if(n.g)s=garble(s);
  $('nxt').style.display='none';
  clearInterval(typing);tx.textContent='';let i=0;
  const fin=()=>{typing=null;$('nxt').style.display='block';waiting='say'};
  typing=setInterval(()=>{i++;tx.textContent=s.slice(0,i);if(n.c&&i%2===0&&s[i-1]!==' ')AUDIO.play('blip',n.c,i);if(i>=s.length){clearInterval(typing);fin()}},14);
  typeFull=()=>{clearInterval(typing);tx.textContent=s;fin()};
}
function showChoice(n){
  const d=$('dlg');d.classList.add('on');if(!n.c){d.classList.remove('pt');$('name').textContent='';PORT.k=null}
  $('text').className='';$('text').textContent=n.q||'';$('nxt').style.display='none';
  const box=$('choices');box.innerHTML='';box.className='';
  n.ch.forEach((o,i)=>{
    if(o.if&&!o.if())return;
    const b=document.createElement('button');b.textContent=(i+1)+'. '+o.t;
    b.onclick=()=>{AUDIO.play('choose');box.innerHTML='';if(o.fx)o.fx();if(o.go){queue=(S[o.go]||[]).slice();G.scene=o.go;autosave()}else if(o.do)queue.unshift(...o.do);step()};
    box.appendChild(b);
  });
  waiting='choice';
}
function showCard(n){
  const c=$('card');c.innerHTML='<h1>'+n.title+'</h1><p>'+(n.sub||'')+'</p>';c.classList.add('on');hideDlg();
  waiting='card';const tok=++cardTok;setTimeout(()=>{if(waiting==='card'&&tok===cardTok)closeCard()},3000);
}
function closeCard(){$('card').classList.remove('on');step()}
function advance(){
  AUDIO.resume();
  if(mode==='explore'){exploreAct();return}
  if(typing&&typeFull){typeFull();return}
  if(waiting==='say')step();
  else if(waiting==='card')closeCard();
}
$('wrap').addEventListener('click',e=>{if(e.target.closest('button'))return;advance()});
document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(k==='arrowleft'||k==='a')keys.left=1;else if(k==='arrowright'||k==='d')keys.right=1;else if(k==='arrowup'||k==='w')keys.up=1;else if(k==='arrowdown'||k==='s')keys.down=1;
  else if(k===' '||k==='enter'||k==='z'){e.preventDefault();advance()}
  else if(waiting==='choice'&&/^[1-4]$/.test(k)){const b=$('choices').children[+k-1];if(b)b.click()}
});
document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();
  if(k==='arrowleft'||k==='a')keys.left=0;if(k==='arrowright'||k==='d')keys.right=0;if(k==='arrowup'||k==='w')keys.up=0;if(k==='arrowdown'||k==='s')keys.down=0});
const keys={};
document.querySelectorAll('#touch [data-k]').forEach(b=>{
  const k=b.dataset.k;const on=e=>{e.preventDefault();keys[k]=1},off=e=>{e.preventDefault();keys[k]=0};
  b.addEventListener('touchstart',on);b.addEventListener('touchend',off);b.addEventListener('mousedown',on);b.addEventListener('mouseup',off);b.addEventListener('mouseleave',off);
});
$('tA').addEventListener('click',e=>{e.stopPropagation();advance()});

/* ---------- HUD / MENU ---------- */
function updHud(){$('hud').textContent='♥'+G.love+'  毛'+G.mao+'  ⚠'+G.unrest+'  ⚗'+G.research+'  ¥'+G.money}
function showHud(v){$('hud').style.display=v?'block':'none';$('menuBtn').style.display=v?'block':'none';$('sndBtn').style.display=v?'block':'none'}
const bar=(l,v,max,col)=>'<div class="st"><span>'+l+'</span><i><b style="width:'+(v/max*100)+'%;background:'+col+'"></b></i><em>'+v+'</em></div>';
const canTrue=()=>G.love>=5&&G.mao>=5&&G.frag>=3&&G.research>=4&&G.unrest<=6;
function openMenu(){
  const chk=(c,t)=>'<div class="'+(c?'ok':'no')+'">'+(c?'✓':'✗')+' '+t+'</div>';
  const m=$('menu');m.classList.add('on');
  m.innerHTML='<div class="box"><h2>Status</h2>'+bar('Vínculo com *****',G.love,10,'#e5a')+bar('Confiança de Mao',G.mao,10,'#e33')+bar('Pressão social',G.unrest,10,'#fa3')+bar('Pesquisa (Lobão)',G.research,10,'#3cf')+bar('Fragmentos de memória',G.frag,5,'#cf6')+
  '<p>DUPE nv.'+G.dupe+' • ZEE '+G.zee+' • Influência '+G.infl+'% • ¥'+G.money+'</p>'+
  '<h2>Inventário</h2><p>Ernani: pistola, crachá, tablet.<br>Menino do Milho: moto, capacete, celular, mochila, Tigre.<br>Lobão: notebook, tablet, jaleco, materiais químicos.<br>Fragmentos: '+G.frag+'/5</p>'+
  '<h2>Seita do Grão</h2><p>Pistas: '+G.seita.sinais+'/6 • Grão: '+(G.seita.grao?'com o Menino do Milho (contaminação '+G.seita.contam+')':G.seita.aliado?'deixado; aliança com uma ala dos Guardiões':'—')+'</p>'+
  '<h2>Requisitos do final verdadeiro <small>(debug do Alpha)</small></h2>'+chk(G.love>=5,'Vínculo ≥ 5')+chk(G.mao>=5,'Confiança de Mao ≥ 5')+chk(G.frag>=3,'Fragmentos ≥ 3')+chk(G.research>=4,'Pesquisa ≥ 4')+chk(G.unrest<=6,'Pressão social ≤ 6')+
  '<div id="mOpts"></div><div class="col"><button class="btn" id="mSave">Salvar</button><button class="btn" id="mBack">Voltar ao jogo</button><button class="btn" id="mTitle">Menu principal</button></div></div>';
  const ro=()=>{$('mOpts').innerHTML=optsHTML();bindOpts($('mOpts'),ro)};ro();
  $('mBack').onclick=()=>m.classList.remove('on');
  $('mSave').onclick=()=>{autosave();$('mSave').textContent='Salvo ✓'};
  $('mTitle').onclick=()=>{m.classList.remove('on');toTitle()};
}
$('menuBtn').addEventListener('click',e=>{e.stopPropagation();openMenu()});
$('sndBtn').addEventListener('click',e=>{e.stopPropagation();AUDIO.resume();AUDIO.toggle();updSnd()});
document.addEventListener('pointerdown',()=>AUDIO.resume());

/* ---------- TÍTULO / OPÇÕES ---------- */
function optsHTML(){
  const q=FX.Q;
  return '<h2>Opções</h2><div class="col">'+
   '<div class="row">Qualidade gráfica: '+['low','med','high'].map(l=>'<button class="btn sm'+(q.level===l?' sel':'')+'" data-q="'+l+'">'+({low:'Baixa',med:'Média',high:'Alta'})[l]+'</button>').join('')+'</div>'+
   '<div class="row">Reduzir movimento (chuva, brilhos): <button class="btn sm" id="oRed">'+(q.reduce?'Ligado':'Desligado')+'</button></div>'+
   '<div class="row">Som: <button class="btn sm" id="oSnd">'+(AUDIO.on?'Ligado':'Mudo')+'</button> Volume <input type="range" id="oVol" min="0" max="100" value="'+Math.round(AUDIO.vol*100)+'"></div></div>';
}
function bindOpts(root,redo){
  root.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{FX.set({level:b.dataset.q});redo()});
  root.querySelector('#oRed').onclick=()=>{FX.set({reduce:!FX.Q.reduce});redo()};
  root.querySelector('#oSnd').onclick=()=>{AUDIO.resume();AUDIO.toggle();updSnd();redo()};
  root.querySelector('#oVol').oninput=e=>AUDIO.setVol(e.target.value/100);
}
function updSnd(){$('sndBtn').textContent=AUDIO.on?'🔊':'🔇'}
function toTitle(){
  mode='title';view='bg';bgName='title';queue=[];done=null;PORT.k=null;hideDlg();$('card').classList.remove('on');showHud(false);$('touch').style.display='none';$('hint').style.display='none';AUDIO.setMood('title');
  const p=$('panel');p.className='on tt';const e=endings(),has=!!localStorage.getItem(SAVE_KEY);
  p.innerHTML='<div class="box"><h1>RED DYNASTY</h1><div class="sub" style="letter-spacing:3px">THE PRICE OF ASCENSION</div><div class="sub">中国 • O Amor Impossível do Império • Alpha 0.4</div>'+
  '<div class="col"><button class="btn" id="bNew">▶ Novo Jogo</button><button class="btn" id="bCont"'+(has?'':' disabled')+'>Continuar</button><button class="btn" id="bOpt">Opções (qualidade e som)</button><button class="btn" id="bInfo">Como trocar as imagens</button></div>'+
  '<p class="sub">Finais encontrados: '+e.length+'/4'+(e.includes('true')?' • ✦ Final verdadeiro desbloqueado':'')+'</p></div>';
  $('bNew').onclick=()=>{AUDIO.resume();p.className='';G=fresh();startGame()};
  $('bCont').onclick=()=>{AUDIO.resume();try{G=Object.assign(fresh(),JSON.parse(localStorage.getItem(SAVE_KEY)))}catch(x){G=fresh()}p.className='';startGame(true)};
  const showOpt=()=>{p.innerHTML='<div class="box">'+optsHTML()+'<div class="col"><button class="btn" id="bBack">Voltar</button></div></div>';bindOpts(p,showOpt);$('bBack').onclick=toTitle};
  $('bOpt').onclick=()=>{AUDIO.resume();AUDIO.setMood('title');showOpt()};
  $('bInfo').onclick=()=>{p.innerHTML='<div class="box"><h2>Imagens</h2><p>Coloque PNGs na pasta <b>assets/</b>. Tudo que faltar é desenhado em pixel art HD-2D procedural:<br><br>• assets/portraits/mao.png, ernani.png, milho.png, lobao.png, x.png (quadrados)<br>• assets/sprites/mao.png … x.png e tigre.png (em pé, fundo transparente)<br>• assets/bg/office.png, lab.png, city.png, port.png, station.png, roof.png, qinghe.png, tower.png, title.png (16:9, 1920×1080 ou 960×540)</p><div class="col"><button class="btn" id="bBack">Voltar</button></div></div>';$('bBack').onclick=toTitle};
}
function startGame(cont){updSnd();showHud(true);updHud();view='bg';mode='scene';jump(cont?G.scene:'intro')}

/* ---------- EXPLORAÇÃO ---------- */
const MAPS={
  lab:{need:3,then:'cap3b',start:[9,9],pal:{bg:'#050a09',f1:'#122320',f2:'#0f1e1b',wall:'#0b1412',wall2:'#1d3a30'},
    items:{B:{id:'board',scene:'lab_board'},N:{id:'book',scene:'lab_book'},M:{id:'mon',scene:'lab_mon'}},
    rows:["####################","#..cc..........RRR.#","#..cc....B.....RRR.#","#..................#","#.TT......TT.......#","#.TT......TT...N...#","#..................#","#.cc.......M.M.....#","#..................#","#..................#","########DD##########"]},
  qinghe:{need:3,then:'cap8b',start:[9,9],pal:{bg:'#101010',f1:'#3a3636',f2:'#343030',wall:'#1c1818',wall2:'#4a4444'},
    items:{F:{id:'F',multi:true,scenes:['q1','q2','q3']}},
    rows:["####################","#..rr.......F...rr.#","#..................#","#.rrr..........rrr.#","#..................#","#.......F..........#","#..rr..........rr..#","#..................#","#.............F....#","#..................#","####################"]},
  porto:{need:3,then:'sx_porta',start:[9,9],style:'porto',hero:'milho',tiger:true,mood:'porto_noite',amb:'#2c3c52',pal:{bg:'#05080e',f1:'#16202c',f2:'#121b26',wall:'#1a2430',wall2:'#2a3848'},
    items:{S:{id:'caixa',scene:'sx_caixa'},N:{id:'caderno',scene:'sx_caderno'},K:{id:'selo',scene:'sx_selo'}},
    rows:["########YYY#########","#CC..kk.....L...CC.#","#CC........b....CC.#","#.....L..kk....S...#","#..bb...........b..#","#...L.......CC.....#","#..N........CC.k.K.#","#.........b........#","#CC....kk........CC#","#CC............L...#","####################"]},
  templo:{need:4,then:'sx_out',start:[9,9],style:'templo',hero:'milho',tiger:true,mood:'templo',amb:'#3a2426',pal:{bg:'#060203',f1:'#1c100f',f2:'#170c0c',wall:'#120808',wall2:'#2c1a18'},
    items:{G:{id:'grav',scene:'sx_grav'},P:{id:'doc',scene:'sx_doc'},m:{id:'mask',scene:'sx_mask'},A:{id:'altar',scene:'sx_altar',last:true}},
    rows:["####################","#sss.....AA.....sss#","#m...p..f..f..p....#","#m.................#","#......h....h......#","#s...p........p....#","#s.....f....f....G.#","#.......h..h.......#","#.P..p........p....#","#..f..h......h..f..#","####################"]}
};
Object.keys(MAPS).forEach(k=>MAPS[k].rows.forEach(r=>{if(r.length!==20)throw new Error('mapa '+k+': linha com tamanho '+r.length)}));
MAPS.lab.rows.forEach(r=>{if(r.length!==20)throw new Error('mapa lab: linha com tamanho '+r.length)});
MAPS.qinghe.rows.forEach(r=>{if(r.length!==20)throw new Error('mapa qinghe: linha com tamanho '+r.length)});
let E=null;
const TS=48,OY=6;
function startExplore(map){
  const m=MAPS[map];E={map,x:m.start[0],y:m.start[1],face:[0,-1],cd:0,step:0,vx:m.start[0]*TS+TS/2,vy:m.start[1]*TS+OY+TS-6,walk:0,moving:false,tr:[[m.start[0],m.start[1]]],tx:m.start[0]*TS+TS/2,ty:m.start[1]*TS+OY+TS-6,tf:1,tm:false};
  mode='explore';view='explore';AUDIO.setMood(m.mood||(map==='lab'?'lab':'qinghe'));updTouch();
}
function updTouch(){$('touch').style.display=(mode==='explore'&&'ontouchstart' in window)?'block':'none'}
const SOLID='#cTRrBNMDFCkLbSKYpfsmGPAh';
function solidAt(x,y){const m=MAPS[E.map],g=m.rows[y]&&m.rows[y][x];return !g||SOLID.includes(g)}
function nearItem(){
  const m=MAPS[E.map],c=[[E.x+E.face[0],E.y+E.face[1]],[E.x+1,E.y],[E.x-1,E.y],[E.x,E.y+1],[E.x,E.y-1]];
  for(const [x,y] of c){const g=m.rows[y]&&m.rows[y][x],it=g&&m.items[g];if(!it)continue;const key=E.map+(it.multi?x+','+y:it.id);if(G.found[key])continue;if(it.last&&countFound()<MAPS[E.map].need-1)continue;return{x,y,it,key}}
  return null;
}
function countFound(){return Object.keys(G.found).filter(k=>k.startsWith(E.map)).length}
function exploreAct(){
  if(mode!=='explore')return;const f=nearItem();if(!f)return;
  G.found[f.key]=1;const n=countFound(),m=MAPS[E.map];
  const sc=f.it.multi?f.it.scenes[n-1]:f.it.scene;
  AUDIO.play('ok');FX.sparks(f.x*TS+TS/2,f.y*TS+TS/2,16,'#ffe080',160);
  mode='scene';updTouch();$('hint').style.display='none';
  playLines(S[sc],()=>{if(countFound()>=m.need){view='bg';jump(m.then)}else{mode='explore';updTouch()}});
}
function updateExplore(dt){
  E.cd-=dt;
  if(E.cd<=0){let dx=0,dy=0;if(keys.left)dx=-1;else if(keys.right)dx=1;else if(keys.up)dy=-1;else if(keys.down)dy=1;
    if(dx||dy){E.face=[dx,dy];const nx=E.x+dx,ny=E.y+dy;if(!solidAt(nx,ny)){E.x=nx;E.y=ny;E.step++;E.tr.push([nx,ny]);if(E.tr.length>8)E.tr.shift()}E.cd=115}}
  const tx=E.x*TS+TS/2,ty=E.y*TS+OY+TS-6,ddx=tx-E.vx,ddy=ty-E.vy,d=Math.hypot(ddx,ddy);
  E.moving=d>1;if(d>1){const k=Math.min(1,dt*.42/d);E.vx+=ddx*k;E.vy+=ddy*k;E.walk=(E.walk+dt/440)%1}else{E.vx=tx;E.vy=ty;E.walk=0}
  {const q=E.tr[Math.max(0,E.tr.length-3)],qx=q[0]*TS+TS/2,qy=q[1]*TS+OY+TS-6,dx=qx-E.tx,dy=qy-E.ty,dd=Math.hypot(dx,dy);
   E.tm=dd>2;if(dd>2){const k=Math.min(1,dt*.38/dd);E.tx+=dx*k;E.ty+=dy*k;if(Math.abs(dx)>1)E.tf=dx<0?-1:1}else{E.tx=qx;E.ty=qy}}
  const h=$('hint'),f=nearItem();h.style.display='block';h.textContent=(f?'▶ Examinar (Espaço / A)   ':'')+'Pistas '+countFound()+'/'+MAPS[E.map].need;
}
function drawExplore(){
  const m=MAPS[E.map],g=ctx,lab=E.map==='lab',st=m.style||(lab?'lab':'ruin');
  g.fillStyle=m.pal.bg;g.fillRect(0,0,W,H);
  FX.begin(m.amb||(lab?'#2a463f':'#4f4846'));
  const props=[];
  for(let y=0;y<11;y++)for(let x=0;x<20;x++){
    const ch=m.rows[y][x],px=x*TS,py=y*TS+OY,odd=(x+y)%2;
    // piso (sempre embaixo)
    g.fillStyle=odd?m.pal.f1:m.pal.f2;g.fillRect(px,py,TS,TS);
    g.fillStyle='rgba(0,0,0,.35)';g.fillRect(px,py,TS,1);g.fillRect(px,py,1,TS);
    g.fillStyle='rgba(255,255,255,.035)';g.fillRect(px+1,py+1,TS-2,2);
    const r=rnd(x*17+y*31+(lab?1:9));
    if(r>.78){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(px+6+r*20,py+8+r*18,10+r*14,3)}
    if(r<.1){g.fillStyle=lab?'rgba(60,255,110,.08)':'rgba(200,190,180,.07)';g.fillRect(px+4,py+4,TS-8,TS-8)}
    if(st==='porto'){g.fillStyle='rgba(0,0,0,.28)';g.fillRect(px,py+TS/2,TS,1);if(r>.55){g.fillStyle='rgba(150,190,230,'+(.05+.05*Math.sin(T*2+x))+')';g.fillRect(px+3,py+10,TS-8,TS-26)}}
    if(st==='templo'){if(x>=8&&x<=11){g.fillStyle='rgba(150,30,25,.3)';g.fillRect(px,py,TS,TS);if(x===8||x===11){g.fillStyle='rgba(212,160,60,.25)';g.fillRect(x===8?px:px+TS-2,py,2,TS)}}if(r>.85){g.fillStyle='rgba(160,30,20,.2)';g.fillRect(px+8,py+20,TS-16,2)}}
    if(ch!=='.')props.push([ch,x,y,px,py]);
  }
  const lightsOn=[];
  for(const [ch,x,y,px,py] of props){
    const it=m.items[ch],fd=it&&G.found[E.map+(it.multi?x+','+y:it.id)];
    g.save();g.translate(px,py);
    if(ch==='#'){
      g.fillStyle=m.pal.wall;g.fillRect(0,0,TS,TS);g.fillStyle=m.pal.wall2;g.fillRect(0,0,TS,9);
      if(st==='porto'){g.globalAlpha=.5;g.fillStyle=['#5a2a24','#24425a','#5a4a24','#2a4a3a'][(x*3+y)%4];g.fillRect(0,0,TS,TS);g.globalAlpha=1;g.fillStyle='rgba(0,0,0,.4)';for(let i=0;i<8;i++)g.fillRect(i*6+1,10,2,TS-10)}
      if(st==='templo'){g.fillStyle='rgba(0,0,0,.35)';for(let i=0;i<3;i++)g.fillRect(0,12+i*13,TS,1);for(let i=0;i<4;i++)g.fillRect(((i+y)%2)*12+i*12,9,1,TS-9)}
      g.fillStyle='rgba(0,0,0,.3)';for(let i=0;i<4;i++)g.fillRect(i*12,9,1,TS-9);
      g.fillStyle='rgba(255,255,255,.05)';g.fillRect(0,9,TS,2);
      const gr=g.createLinearGradient(0,TS*.4,0,TS);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=gr;g.fillRect(0,0,TS,TS);
      if(lab&&rnd(x*3+y)>.8){g.fillStyle='rgba(60,255,110,.5)';g.fillRect(8,20,TS-16,2)}
    }else{
      g.scale(2,2);
      const R=(a,b,c,d,col)=>{g.fillStyle=col;g.fillRect(a,b,c,d)};
      R(1,20,22,3,'rgba(0,0,0,.4)');
      if(st==='porto'||st==='templo')propNew(R,ch,fd,x,y,px,py,lightsOn);
      else if(ch==='c'){R(2,2,20,20,'#2a3236');R(2,2,20,3,'#3c474c');R(2,2,2,20,'rgba(255,255,255,.08)');for(let i=0;i<3;i++){R(4+i*6,6+(i%2)*3,4,8,lab?'#1f5a30':'#555');R(5+i*6,7+(i%2)*3,2,3,lab?'#5fff8a':'#aaa')}R(4,17,16,2,'#0a0e10');lightsOn.push([px+TS/2,py+TS/2,90,'rgba(60,255,110,.5)',.7])}
      else if(ch==='T'){R(1,5,22,15,'#3a3a44');R(1,5,22,4,'#585866');R(1,5,22,1,'rgba(255,255,255,.2)');R(3,20,2,3,'#222');R(19,20,2,3,'#222');R(5,2,6,4,'#c0c8d0');R(14,3,5,3,'#a0602a')}
      else if(ch==='R'){const a=.45+.3*Math.sin(T*3+x);R(0,0,24,24,'#10202a');R(1,2,22,20,'rgba(60,255,90,'+a+')');R(0,0,24,3,'#223');R(0,21,24,3,'#223');for(let i=0;i<3;i++)R(3+i*7,4+((T*20+i*9)%14),2,2,'rgba(220,255,230,.8)');lightsOn.push([px+TS/2,py+TS/2,150,'rgba(60,255,100,.9)',.9])}
      else if(ch==='B'){R(0,2,24,20,'#16301f');R(0,2,24,2,'#3a2a1a');R(3,6,18,2,fd?'#456':'#dfd');R(3,12,12,2,fd?'#456':'#dfd');R(3,17,8,2,fd?'#456':'#dfd');if(!fd)lightsOn.push([px+TS/2,py+TS/2,80,'rgba(255,240,150,.7)',.4+.3*Math.sin(T*4)])}
      else if(ch==='N'){R(3,8,18,13,fd?'#6a6040':'#e8d8a0');R(11,8,2,13,'#654');R(3,8,18,2,'rgba(255,255,255,.3)');if(!fd)lightsOn.push([px+TS/2,py+TS/2,80,'rgba(255,240,150,.7)',.4+.3*Math.sin(T*4)])}
      else if(ch==='M'){R(1,3,22,16,'#0a1a1f');R(3,5,18,11,fd?'#285':'rgba(60,220,255,'+(.6+.3*Math.sin(T*4+x))+')');R(9,19,6,3,'#1a1a1a');if(!fd)for(let i=0;i<4;i++)R(4,7+i*2.5,6+(i*5%8),1,'rgba(0,0,0,.4)');lightsOn.push([px+TS/2,py+TS/2,fd?50:110,'rgba(60,200,255,.7)',.7])}
      else if(ch==='D'){R(0,0,24,24,'#601010');R(0,0,24,3,'#d4a017');R(9,10,6,3,'#d4a017');R(2,3,2,20,'rgba(255,255,255,.1)');lightsOn.push([px+TS/2,py+TS/2,70,'rgba(255,60,50,.6)',.5+.3*Math.sin(T*5)])}
      else if(ch==='r'){R(2,8,20,14,'#4a4444');R(6,4,10,8,'#5a5454');R(2,8,20,2,'rgba(255,255,255,.1)');R(4,12,4,2,'#2a2626')}
      else if(ch==='F'){const a=fd?.15:.55+.4*Math.sin(T*4);R(8,8,8,8,'rgba(255,240,150,'+a+')');R(10,4,4,16,'rgba(255,240,150,'+a*.6+')');if(!fd)lightsOn.push([px+TS/2,py+TS/2,90,'rgba(255,230,140,.9)',.5+.4*Math.sin(T*4)])}
    }
    g.restore();
  }
  // sombra suave de cada parede e personagem
  const face=E.face[0]<0?-1:1;
  if(m.tiger){const tgd=()=>ACT.tiger(g,E.tx,E.ty,1.25,{t:T,face:E.tf,walk:E.tm?1:0});
    if(E.ty<E.vy){tgd();ACT.sprite(g,m.hero,E.vx,E.vy,2.3,{walk:E.moving?E.walk:0,face,t:T})}else{ACT.sprite(g,m.hero,E.vx,E.vy,2.3,{walk:E.moving?E.walk:0,face,t:T});tgd()}}
  else ACT.sprite(g,m.hero||'ernani',E.vx,E.vy,2.3,{walk:E.moving?E.walk:0,face,t:T});
  lightsOn.forEach(l=>FX.light(l[0],l[1],l[2],l[3],l[4]));
  FX.light(E.vx+E.face[0]*34,E.vy-46+E.face[1]*30,330,'rgba(255,240,215,.95)',1);
  if(Math.random()<.04)FX.dust(1,lab?'rgba(120,255,160,.5)':'rgba(220,210,200,.4)');
  if(st==='ruin'&&Math.random()<.2)FX.ash(1);if(st==='porto')FX.rain(420,dtS);if(st==='templo'&&Math.random()<.08)FX.embers(1);
}
function propNew(R,ch,fd,x,y,px,py,L){
  const cx=px+TS/2,cy=py+TS/2,mark=(c,r)=>{if(!fd)L.push([cx,cy,r||90,c||'rgba(255,220,130,.8)',.45+.3*Math.sin(T*4+x)])};
  const sp=(w,h)=>{if(!fd){const a=.5+.4*Math.sin(T*4+x+y),bb=Math.sin(T*5)*1.5;R(w,h,2,2,'rgba(255,230,150,'+a+')');R(w+6,h-4,1,1,'rgba(255,230,150,'+a+')');R(9,-6+bb,6,2,'rgba(255,215,110,.95)');R(10,-4+bb,4,2,'rgba(255,215,110,.95)');R(11,-2+bb,2,2,'rgba(255,215,110,.95)')}};
  switch(ch){
   case 'C':{const cs=['#6a2a24','#24486a','#6a5a24','#245a44','#4a3a28'],c=cs[(x*5+y*3)%5];R(0,1,24,22,c);for(let i=1;i<8;i++)R(i*3,3,1,18,'rgba(0,0,0,.4)');R(0,1,24,2,'rgba(255,255,255,.15)');R(0,20,24,3,'rgba(0,0,0,.5)');R(2,8,6,3,'rgba(220,200,150,.25)');break}
   case 'k':R(1,4,22,18,'#4a3220');R(1,4,22,2,'#6a4a30');for(let i=0;i<4;i++)R(2+i*6,6,1,16,'rgba(0,0,0,.4)');R(1,12,22,1,'rgba(0,0,0,.45)');break;
   case 'L':R(11,3,2,19,'#080b10');R(7,1,10,3,'#ffcf80');R(8,0,8,1,'#0a0e14');L.push([cx,py+6,170,'rgba(255,175,90,.85)',.85+.05*Math.sin(T*30)]);break;
   case 'b':R(5,5,14,16,'#3a281a');R(5,8,14,1,'#161008');R(5,16,14,1,'#161008');R(6,5,12,2,'rgba(255,255,255,.1)');break;
   case 'S':R(1,5,22,17,'#4a3220');R(1,5,22,2,'#6a4a30');for(let i=0;i<4;i++)R(2+i*6,7,1,15,'rgba(0,0,0,.4)');R(5,18,14,3,fd?'#8a1818':'#150b0b');if(fd)R(11,19,2,1,'#d4a017');sp(18,4);mark('rgba(255,200,100,.7)',80);break;
   case 'N':R(5,7,14,14,'#3a281a');R(5,10,14,1,'#161008');R(5,17,14,1,'#161008');R(6,3,12,5,fd?'#7a6a48':'#e8d8a0');R(11,3,1,5,'#654');sp(16,0);mark();break;
   case 'K':R(8,8,8,13,'#101418');R(7,6,10,3,'#1a2028');R(9,3,6,4,fd?'#6a4a18':'#d09a28');R(11,4,2,2,'#401');sp(15,1);mark('rgba(255,190,90,.8)',90);break;
   case 'Y':{const open=countFound()>=MAPS.porto.need;R(0,0,24,24,'#0a0e14');for(let i=0;i<6;i++)R(2+i*4,2,2,20,'#2a3440');R(0,10,24,2,'#2a3440');if(open){R(0,0,24,24,'rgba(255,180,80,.18)');L.push([cx,cy,120,'rgba(255,170,80,.7)',.6+.3*Math.sin(T*3)])}break}
   case 'p':R(6,0,12,22,'#2c1816');R(5,0,14,3,'#4a2824');R(5,19,14,3,'#4a2824');R(6,3,12,1,'rgba(180,40,30,.6)');R(8,0,2,22,'rgba(255,160,120,.08)');break;
   case 'f':{R(11,10,2,12,'#0a0606');R(5,18,14,4,'#1a0c0a');R(6,8,12,5,'#2a1612');R(5,7,14,2,'#d4781c');
     const f1=Math.sin(T*9+x*3)*2,f2=Math.sin(T*7+y*2)*1.5;R(8,0+f1*.3,8,8,'rgba(255,120,30,.85)');R(10,-3+f2*.3,4,7,'rgba(255,220,130,.9)');
     L.push([cx,cy-10,210,'rgba(255,120,40,.9)',.75+.25*Math.sin(T*9+x*2)*Math.sin(T*3.7+y)]);break}
   case 's':R(0,1,24,21,'#1e130d');for(let r=0;r<3;r++){R(1,r*7+7,22,1,'#2a1b12');for(let k=0;k<8;k++){const h=4+((x*7+y*3+k*5+r)%3)*1.5;R(1+k*2.7,r*7+7-h,2.2,h,['#3a1a14','#1e2a2a','#4a3a20','#3a2230'][(k+r+x)%4])}}break;
   case 'm':R(0,1,24,21,'#1e130d');R(1,7,22,1,'#2a1b12');R(1,15,22,1,'#2a1b12');for(let k=0;k<3;k++){R(3+k*7,2,5,5,'#d8c8a0');R(4+k*7,3,1,1,'#120');R(6+k*7,3,1,1,'#120')}for(let k=0;k<2;k++){R(5+k*10,10,5,5,'#c8b890');R(6+k*10,11,1,1,'#120');R(8+k*10,11,1,1,'#120')}sp(18,2);mark('rgba(255,210,140,.7)',80);break;
   case 'G':R(2,12,20,9,'#2a1a10');R(3,3,18,10,'#1c1c20');R(5,5,5,5,'#0a0a0e');R(14,5,5,5,'#0a0a0e');if(!fd){const a=T*3;R(7+Math.cos(a)*1.5,7+Math.sin(a)*1.5,1,1,'#aaa');R(16+Math.cos(a)*1.5,7+Math.sin(a)*1.5,1,1,'#aaa')}R(10,11,4,2,fd?'#340808':'#d02020');sp(19,2);mark('rgba(255,90,70,.7)',90);break;
   case 'P':R(2,12,20,9,'#2a1a10');R(4,5,16,8,fd?'#6a6048':'#d8cca6');R(6,4,14,8,fd?'#5a5038':'#cfc29a');R(8,7,8,1,'#8a3028');sp(17,0);mark();break;
   case 'A':{const open=countFound()>=MAPS.templo.need-1;R(0,6,24,16,'#241410');R(0,4,24,3,'#3a2018');R(0,4,24,1,'rgba(212,160,60,.6)');
     if(!fd){const a=open?.7+.3*Math.sin(T*3):.25;R(10,0,4,7,'rgba(255,200,80,'+a+')');R(11,1,2,5,'rgba(255,250,210,'+a+')');L.push([cx,cy-8,open?260:110,'rgba(255,190,80,.9)',a])}break}
   case 'h':R(8,6,8,5,'#0a0506');R(7,10,10,12,'#0a0506');R(11,8,2,12,'rgba(180,40,30,.5)');R(7,21,10,1,'rgba(0,0,0,.6)');break;
  }
}
function _noop(){}

/* ---------- GESTÃO: DUPE / ZEE ---------- */
let MG=null;
const MACTS=[
 {n:'Expandir DUPE',d:'+influência, +confiança de Mao, +renda futura. Aumenta a pressão social.',c:15,f:()=>{G.dupe++;G.unrest++;G.infl+=4;add('mao',1);return 'Novas linhas de montagem. O DUPE ronca em três províncias.'}},
 {n:'Abrir ZEE',d:'+influência e +renda futura. Caro.',c:30,f:()=>{G.zee++;G.infl+=6;if(G.zee>2)G.unrest++;return 'Uma nova Zona Econômica Especial recebe os primeiros investidores.'}},
 {n:'Financiar pesquisa (Lobão)',d:'+pesquisa. Necessária para o final verdadeiro.',c:25,f:()=>{add('research',1);return 'Lobão sorri pela primeira vez no mês.'}},
 {n:'Reformas urbanas',d:'−pressão social. Mao torce o nariz.',c:25,f:()=>{G.unrest=Math.max(0,G.unrest-2);G.infl-=2;return 'Moradia, hospitais, transporte. Os protestos esfriam.'}},
 {n:'Diplomacia',d:'+influência, +confiança de Mao. Grátis.',c:0,f:()=>{G.infl+=7;add('mao',1);return 'Ernani fecha acordos de rota com três países.'}}
];
function startManage(n){MG={turns:n.turns,turn:1,then:n.then,title:n.title,fb:''};mode='manage';view='bg';renderManage()}
function renderManage(){
  const p=$('panel');p.classList.add('on');updHud();
  p.innerHTML='<div class="box"><h2>'+MG.title+'</h2><p>Turno '+MG.turn+' de '+MG.turns+' • ¥'+G.money+' • Influência '+clamp(G.infl,0,100)+'%</p>'+
   bar('DUPE (nível)',G.dupe,10,'#e33')+bar('ZEE',G.zee,10,'#3c6')+bar('Pesquisa',G.research,10,'#3cf')+bar('Pressão social',G.unrest,10,'#fa3')+bar('Confiança de Mao',G.mao,10,'#c3c')+
   '<div class="col acts" id="acts"></div><p id="fb">'+MG.fb+'</p></div>';
  acts().forEach((a,i)=>{const b=document.createElement('button');b.className='btn';b.disabled=G.money<a.c;b.innerHTML=a.n+(a.c?' (¥'+a.c+')':'')+'<small>'+a.d+'</small>';b.onclick=()=>manageDo(i);$('acts').appendChild(b)});
}
function manageDo(i){
  const a=acts()[i];G.money-=a.c;let fb=a.f();
  G.unrest=clamp(G.unrest,0,10);G.infl=clamp(G.infl,0,100);
  const inc=G.dupe*12+G.zee*10;G.money+=inc;fb+=' (+¥'+inc+' de renda)';
  if(G.unrest>=8){G.infl=clamp(G.infl-6,0,100);G.money=Math.max(0,G.money-15);fb+=' ⚠ GREVES em Dongguan: −6% de influência, −¥15.'}
  MG.fb=fb;
  if(MG.turn>=MG.turns){$('panel').classList.remove('on');mode='scene';updHud();jump(MG.then);return}
  MG.turn++;renderManage();
}

/* ---------- BATALHA ---------- */
let B=null;
const hpf=(p)=>Math.max(0,Math.round(p));
const BP=[[340,338],[215,310],[470,314]];   // posições dos aliados (pés)
const BOSS=[790,346];
const TIGER=[96,322];

/* ---- efeitos de combate ---- */
const BFX=(()=>{
  const an=[],beams=[],projs=[],lts=[],puddles=[];
  let zoom=1,zt=1,flareT=0,scanT=0,domeT=0;
  const later=(ms,f)=>setTimeout(f,ms);
  const addA=o=>an.push(Object.assign({t:0,dur:.4},o));
  const light=(x,y,r,c,dur)=>lts.push({x,y,r,c,t:0,dur:dur||.2});
  const beam=(x0,y0,x1,y1,col,w,dur)=>beams.push({x0,y0,x1,y1,col,w:w||3,t:0,dur:dur||.15});
  const bossHead=()=>[BOSS[0]-30,BOSS[1]-150];
  const partyHead=(i)=>[BP[i][0],BP[i][1]-100];
  function off(who){let x=0,hurt=0;for(const a of an){if(a.who!==who)continue;const k=Math.min(1,a.t/a.dur);if(a.kind==='lunge')x+=a.dx*Math.sin(k*Math.PI);if(a.kind==='hurt'){hurt=Math.max(hurt,1-k);x+=(Math.random()-.5)*12*(1-k)}}return{x,hurt}}
  function pulse(z){zt=Math.max(zt,z)}
  const R={
    hitBoss(d,col){const h=bossHead();addA({who:'boss',kind:'hurt',dur:.35});FX.text(h[0],h[1],'−'+d,col||'#fff',true);FX.sparks(h[0]+10,h[1]+50,14,'#ffd060',260);AUDIO.play('hit');pulse(1.04);FX.addAberr(3)},
    hurtParty(i,d){const h=partyHead(i);addA({who:'p'+i,kind:'hurt',dur:.4});FX.text(h[0],h[1],'−'+d,'#ff6060',true);FX.sparks(BP[i][0],BP[i][1]-50,10,'#ff8060',200);AUDIO.play('hit');if(i===1)addA({who:'tiger',kind:'hurt',dur:.3})},
    shot(d){
      addA({who:'p0',kind:'lunge',dx:-10,dur:.2});const mx=BP[0][0]+62,my=BP[0][1]-72,b=bossHead();
      AUDIO.play('shoot');light(mx,my,180,'rgba(255,200,100,.9)',.12);FX.sparks(mx,my,8,'#ffe090',240);
      beam(mx,my,b[0]+10,b[1]+55,'#fff0b0',3,.12);later(110,()=>R.hitBoss(d));
    },
    talk(d){
      const x=BP[0][0],y=BP[0][1]-70;AUDIO.play('heal');
      for(let i=0;i<3;i++)later(i*220,()=>FX.ring(x,y,260+i*40,'#ff80c0',.9));
      later(500,()=>{const h=bossHead();FX.ring(h[0],h[1]+50,100,'#ff80c0',.7);FX.text(h[0],h[1],'−'+d,'#ff9ad0',true);addA({who:'boss',kind:'hurt',dur:.5});pulse(1.03)});
    },
    tiger(d){
      addA({who:'p1',kind:'lunge',dx:BOSS[0]-BP[1][0]-110,dur:.8});addA({who:'tiger',kind:'lunge',dx:BOSS[0]-TIGER[0]-90,dur:.8});
      AUDIO.play('tiger');for(let i=0;i<10;i++)later(i*60,()=>FX.smoke(BP[1][0]+(BOSS[0]-BP[1][0])*(i/10),BP[1][1],1,'rgba(150,130,110,.5)'));
      later(400,()=>{const h=bossHead();FX.explosion(h[0]+20,h[1]+80,false);R.hitBoss(d,'#ffd060');pulse(1.07)});
    },
    heal(){
      AUDIO.play('heal');B.party.forEach((p,i)=>{if(p.hp>0){const h=partyHead(i);FX.text(h[0],h[1],'+12','#7dff9a',true);for(let k=0;k<10;k++)FX.add({kind:'dot',x:BP[i][0]+(Math.random()-.5)*50,y:BP[i][1]-10-Math.random()*70,vy:-50,life:1,s:3,c:'#7dff9a',add:true})}});
      const h=bossHead();FX.text(h[0],h[1]+20,'−4','#9fe',false);
    },
    flare(){
      flareT=2.4;AUDIO.play('shoot');beam(BP[1][0]+30,BP[1][1]-60,520,40,'#ff8060',2,.4);
      later(350,()=>{AUDIO.play('explosion');FX.flash('#ff4030',.35);for(let i=0;i<40;i++)FX.add({kind:'dot',x:520+(Math.random()-.5)*60,y:40,vx:(Math.random()-.5)*300,vy:Math.random()*160,g:120,life:1.4,s:2,c:'#ff7050',add:true})});
    },
    analyze(){AUDIO.play('shield');scanT=1.3;const h=bossHead();FX.ring(h[0],h[1]+60,170,'#40e0ff',1);FX.text(h[0],h[1]-10,'ANÁLISE','#40e0ff',false)},
    decode(d,good){
      const x=BP[2][0]+30,y=BP[2][1]-70,b=bossHead();AUDIO.play('shield');
      for(let i=0;i<3;i++)later(i*120,()=>beam(x,y,b[0]+(i-1)*14,b[1]+55+(i-1)*20,'#40e0ff',good?4:2,.35));
      later(380,()=>{FX.ring(b[0],b[1]+55,120,'#40e0ff',.6);FX.text(b[0],b[1],'−'+d,'#7fe8ff',good);if(good){FX.flash('#40e0ff',.25);FX.addAberr(5);pulse(1.05)}addA({who:'boss',kind:'hurt',dur:.4})});
    },
    shield(){AUDIO.play('shield');domeT=0.01;for(let i=0;i<3;i++)FX.ring(BP[1][0]+60,BP[1][1]-50,200,'#60b0ff',.8+i*.2)},
    cover(){AUDIO.play('thud');FX.smoke(BP[0][0]+90,BP[0][1],6,'rgba(120,120,130,.5)');FX.sparks(BP[0][0]+90,BP[0][1]-30,10,'#aab',150);pulse(1.02)},
    bomb(i,d,miss){
      addA({who:'boss',kind:'lunge',dx:-34,dur:.4});const b=bossHead(),tx=BP[i][0]+(miss?60:0),ty=BP[i][1]-40;
      projs.push({t:0,dur:.65,x0:b[0]-10,y0:b[1]+60,x1:tx,y1:ty,arc:130,draw(g,x,y,k){g.fillStyle='#9fff40';g.beginPath();g.arc(x,y,9,0,6.28);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x-3,y-4,3,3)},
        end(){FX.burst(tx,ty,'#8fff40',22,14);FX.smoke(tx,ty,6,'rgba(60,160,40,.5)');FX.ring(tx,ty,120,'#9fff40',.5);AUDIO.play('explosion');puddles.push({x:tx,y:ty+34,t:0,dur:7,r:50+Math.random()*10});if(miss){FX.text(tx,ty-30,'ERROU','#aaa',false)}else R.hurtParty(i,d)}});
    },
    gas(dm){
      addA({who:'boss',kind:'lunge',dx:-20,dur:.4});AUDIO.play('gas');const b=bossHead();
      for(let i=0;i<22;i++)later(i*35,()=>FX.add({kind:'blob',x:b[0]-20,y:b[1]+80,vx:-180-Math.random()*200,vy:(Math.random()-.4)*80,life:1.6,s:14,s1:46,c:'rgba(100,255,70,.35)',drag:.97}));
      later(550,()=>{dm.forEach(([i,d])=>R.hurtParty(i,d))});
    },
    jet(i,d){
      addA({who:'boss',kind:'lunge',dx:-26,dur:.4});const b=bossHead(),t=[BP[i][0],BP[i][1]-55];AUDIO.play('gas');
      beam(b[0]-30,b[1]+75,t[0],t[1],'#9fff40',9,.5);light(t[0],t[1],200,'rgba(130,255,60,.8)',.5);FX.burst(t[0],t[1],'#9fff40',16,10);later(200,()=>R.hurtParty(i,d));
    },
    charge(){AUDIO.play('charge');FX.flash('#40ff70',.2)},
    nuke(dm){
      AUDIO.play('nuclear');FX.flash('#e8fff0',.95);FX.addAberr(12);pulse(1.1);
      for(let i=0;i<4;i++)later(i*130,()=>FX.ring(BOSS[0],BOSS[1]-90,900,'#9fffbf',1.1));
      for(let i=0;i<30;i++)FX.add({kind:'blob',x:BOSS[0],y:BOSS[1]-90,vx:-(100+Math.random()*700),vy:(Math.random()-.5)*160,life:1.2,s:10,s1:40,c:'rgba(100,255,150,.4)',add:true,drag:.97});
      later(450,()=>dm.forEach(([i,d])=>R.hurtParty(i,d)));
    },
    phase2(){AUDIO.play('nuclear');FX.flash('#40ff70',.7);FX.addAberr(14);pulse(1.12);for(let i=0;i<3;i++)FX.ring(BOSS[0],BOSS[1]-90,800,'#40ff70',1.2)}
  };
  function update(dt){
    for(let i=an.length-1;i>=0;i--){an[i].t+=dt;if(an[i].t>an[i].dur)an.splice(i,1)}
    for(let i=beams.length-1;i>=0;i--){beams[i].t+=dt;if(beams[i].t>beams[i].dur)beams.splice(i,1)}
    for(let i=lts.length-1;i>=0;i--){lts[i].t+=dt;if(lts[i].t>lts[i].dur)lts.splice(i,1)}
    for(let i=puddles.length-1;i>=0;i--){puddles[i].t+=dt;if(puddles[i].t>puddles[i].dur)puddles.splice(i,1)}
    for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.t+=dt;if(p.t>=p.dur){p.end();projs.splice(i,1)}}
    zoom+=(zt-zoom)*Math.min(1,dt*8);zt+=(1-zt)*Math.min(1,dt*3);
    flareT=Math.max(0,flareT-dt);scanT=Math.max(0,scanT-dt);
    if(B&&(B.shield)){domeT=Math.min(1,domeT+dt*3)}else domeT=Math.max(0,domeT-dt*4);
  }
  function reset(){an.length=beams.length=projs.length=lts.length=puddles.length=0;zoom=zt=1;flareT=scanT=domeT=0}
  const flare=()=>flareT,scan=()=>scanT,dome=()=>domeT;
  return Object.assign(R,{off,update,reset,beams,projs,lts,puddles,get zoom(){return zoom},flare,scan,dome});
})();

const flC=FX.mk(440,480),flG=flC.getContext('2d');
function actorDraw(g,fn,x,y,hurt){
  if(hurt>.05){flG.clearRect(0,0,440,480);fn(flG,220,460);flG.globalCompositeOperation='source-atop';flG.fillStyle='rgba(255,255,255,'+Math.min(1,hurt*1.5)+')';flG.fillRect(0,0,440,480);flG.globalCompositeOperation='source-over';g.drawImage(flC,x-220,y-460)}
  else fn(g,x,y);
}

function startBattle(){
  B={hp:230,max:230,grip:100,i:0,phase:1,shield:0,cover:0,blind:0,analyzed:0,charge:0,spoke:{},party:[{k:'ernani',hp:70,max:70},{k:'milho',hp:60,max:60},{k:'lobao',hp:50,max:50}]};
  BFX.reset();AUDIO.setMood('battle');
  mode='battle';view='battle';updHud();bMenu();
}
const ACTS={
  ernani:[
    {n:'Tiro certeiro',f:()=>{const d=14+ri(8);B.hp-=d;return[{fn:()=>BFX.shot(d)},Nar('Ernani firma a pistola, respira e dispara. A bala arranca faíscas da armadura química. −'+d+' de vida.')]}},
    {n:'Falar com *****',f:()=>{const d=9+G.love;B.grip-=d;const o=[{fn:()=>BFX.talk(d)},Ern('Eu estou aqui. Não vim te vencer. Vim te buscar.'),Nar('O verde nos olhos dele recua por um instante. Controle do Núcleo −'+d+'.')];if(G.love>=5)o.push(Xx('...você sempre foi péssimo em obedecer ordens.','sad'));return o}},
    {n:'Cobertura tática',f:()=>{B.cover=1;return[{fn:()=>BFX.cover()},Nar('Ernani derruba uma mesa de aço e arrasta o grupo para trás dela. O próximo ataque vai doer menos.')]}}
  ],
  milho:[
    {n:'Carga com o Tigre',f:()=>{const d=18+ri(10);B.hp-=d;return[Mil('Tigre! Vai!','smile'),{fn:()=>BFX.tiger(d)},Nar('A moto cruza o salão em derrapagem. O Tigre salta por cima do capô e derruba o chefe contra a parede. −'+d+' de vida.')]}},
    {n:'Piada de emergência',f:()=>{B.party.forEach(p=>{if(p.hp>0)p.hp=Math.min(p.max,p.hp+12)});B.grip-=4;return[Mil('Alguém avisa que o chefe final esqueceu o tênis de laboratório em casa?','smile'),{fn:()=>BFX.heal()},Nar('Até *****, por um segundo, quase sorri. Equipe +12 de vida, controle −4.')]}},
    {n:'Lançar sinalizador',f:()=>{B.blind=1;return[{fn:()=>BFX.flare()},Nar('Um sinalizador vermelho estoura no teto. O salão inteiro vira neblina rubra. O próximo ataque dele sai pela metade.')]}}
  ],
  lobao:[
    {n:'Analisar o Núcleo',f:()=>{B.analyzed=1;B.grip-=8;return[Lob('O sinal vem do cilindro, não dele. O Núcleo está falando através dele! Posso quebrar isso.'),{fn:()=>BFX.analyze()},Nar('Controle do Núcleo −8. Decodificação preparada.')]}},
    {n:'Escudo de coerência',f:()=>{B.shield=1;return[{fn:()=>BFX.shield()},Nar('Lobão projeta um campo de energia azul diante do grupo. O próximo ataque será drasticamente reduzido.')]}},
    {n:'Decodificar sinal',f:()=>{const good=B.analyzed,d=good?26:6;B.grip-=d;return[Lob(good?'Achei a frequência! Agora!':'Sem análise prévia o sinal escapa!'),{fn:()=>BFX.decode(d,good)},Nar('Controle do Núcleo −'+d+'.'+(good?'':' (use "Analisar" antes para um efeito muito maior)'))]}}
  ]
};
function bMenu(){
  while(B.party[B.i]&&B.party[B.i].hp<=0)B.i++;
  if(B.i>=B.party.length){B.i=0;bossTurn();return}
  const a=B.party[B.i],d=$('dlg');d.classList.add('on','pt');$('name').textContent=CH[a.k].n;PORT={k:a.k,expr:'neutral'};
  $('text').className='';$('text').textContent='O que '+CH[a.k].n+' faz?'+(B.charge?'\n⚠ Ele está CARREGANDO a carga nuclear!':'');$('nxt').style.display='none';
  const box=$('choices');box.innerHTML='';box.className='row';
  ACTS[a.k].forEach((act,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+act.n;b.onclick=()=>{AUDIO.play('choose');box.innerHTML='';const lines=act.f();playLines(lines,afterAct)};box.appendChild(b)});
  waiting='choice';
}
function afterAct(){
  if(B.grip<=0)return endBattle('grip');
  if(B.hp<=0)return endBattle('hp');
  const out=storyBeats();B.i++;
  if(out.length)playLines(out,bMenu);else bMenu();
}
function storyBeats(){
  const o=[];
  if(!B.spoke.a&&B.grip<=75){B.spoke.a=1;o.push(Xx('Ernani... pare. Vá embora. É uma ordem.','sad'),Ern('Você nunca me deu uma ordem na vida. Só pedidos.'),Xx('Então eu peço: desista.'))}
  if(B.phase===1&&(B.hp<115||B.grip<50)){B.phase=2;o.push({fn:()=>BFX.phase2()},{shake:20},Nar('O laboratório inteiro vibra. Os cilindros acendem em verde. FASE 2 — LIBERAÇÃO DO PROTOCOLO NUCLEAR.'),Lob('Ele não está mais no controle! O Núcleo está empurrando o corpo dele além do limite!'))}
  if(!B.spoke.c&&B.grip<=30){B.spoke.c=1;o.push(Ern('Eu lembro. Lembro do seu café queimado. Lembro de você corrigindo meu chinês no meio da madrugada. Lembro que...'),{glitch:50},Nar('Ernani diz o nome. O áudio do laboratório registra apenas um intervalo de silêncio.'),Nar('Mas os olhos de ***** voltam a ser castanhos.'))}
  return o;
}
function bossTurn(){
  hideDlg();PORT.k=null;const o=[],alive=B.party.filter(p=>p.hp>0);
  const mult=(B.shield?0.4:1)*(B.cover?0.6:1)*(B.blind?0.5:1);
  const hit=(p,d)=>{d=Math.max(1,Math.round(d*mult));p.hp=Math.max(0,p.hp-d);shake=10;return d};
  const ix=p=>B.party.indexOf(p);
  if(B.charge){
    B.charge=0;const dm=alive.map(p=>[ix(p),hit(p,28+ri(7))]);
    o.push({fn:()=>BFX.nuke(dm)},{shake:24},Nar('CARGA NUCLEAR! Uma onda verde varre o salão. '+dm.map(a=>CH[B.party[a[0]].k].n+' −'+a[1]).join(', ')+'.'));if(B.shield)o.push(Lob('O escudo segurou o pior!'));
  }else if(B.phase===2&&Math.random()<0.4){
    B.charge=1;o.push({fn:()=>BFX.charge()},Nar('***** ergue a carga nuclear. O cilindro gira cada vez mais rápido... Ele vai liberar tudo no próximo turno! (use Escudo ou Cobertura)'));
  }else if(G.love>=6&&Math.random()<0.3){
    const p=alive[ri(alive.length)],i=ix(p);
    o.push({fn:()=>BFX.bomb(i,0,true)},Nar('***** levanta a bomba química... e hesita. Ela cai ao lado do alvo, sem acertar ninguém. Ele não olha para Ernani.'));
  }else{
    const r=ri(3);
    if(r===0){const p=alive[ri(alive.length)],i=ix(p),d=hit(p,14+ri(7));o.push({fn:()=>BFX.bomb(i,d)},Nar('Bomba química! O frasco explode em cima de '+CH[p.k].n+'. −'+d+'.'))}
    else if(r===1){const dm=alive.map(p=>[ix(p),hit(p,6+ri(4))]);o.push({fn:()=>BFX.gas(dm)},Nar('Gás tóxico! Uma nuvem verde se espalha pelo salão. '+dm.map(a=>CH[B.party[a[0]].k].n+' −'+a[1]).join(', ')+'.'))}
    else{const p=alive[ri(alive.length)],i=ix(p),d=hit(p,12+ri(5));o.push({fn:()=>BFX.jet(i,d)},Nar('O lança-químicos dispara um jato corrosivo contra '+CH[p.k].n+'. −'+d+'.'))}
  }
  B.shield=B.cover=B.blind=0;
  playLines(o,()=>{
    if(B.party.every(p=>p.hp<=0)){
      B.party.forEach(p=>p.hp=Math.round(p.max*0.6));B.grip=Math.min(100,B.grip+10);B.charge=0;B.i=0;
      playLines([{glitch:60},Nar('Todos caem. O mundo escurece.'),Gl(null,'REINICIANDO CENA. REINICIANDO CENA. REINICIANDO CENA.'),Nar('O Núcleo recomeça a lutar. Mas desta vez, vocês lembram.')],bMenu);return;
    }
    B.i=0;bMenu();
  });
}
function endBattle(how){hideDlg();PORT.k=null;G.flags.fight=how;view='bg';mode='scene';jump(how==='grip'?'fight_grip':'fight_hp')}

function drawBattle(dt){
  const g=ctx;BFX.update(dt);
  g.save();g.translate(W/2,H*.66);g.scale(BFX.zoom,BFX.zoom);g.translate(-W/2,-H*.66);
  ART.draw(g,'tower',T,dt);
  // poças químicas
  BFX.puddles.forEach(p=>{const a=Math.min(1,(p.dur-p.t)*.6);g.fillStyle='rgba(120,255,60,'+.35*a+')';g.beginPath();g.ellipse(p.x,p.y,p.r,p.r*.28,0,0,6.28);g.fill();FX.light(p.x,p.y,90,'rgba(120,255,60,.55)',.5*a)});
  // boss
  const bo=BFX.off('boss'),ph2=B.phase===2;
  if(ph2||B.charge){for(let i=0;i<(B.charge?3:1);i++)if(Math.random()<.7)FX.add({kind:'blob',x:BOSS[0]+(Math.random()-.5)*90,y:BOSS[1]-30-Math.random()*150,vy:-90,vx:(Math.random()-.5)*30,life:.7,s:7,s1:1,c:ph2?'#60ff90':'#9fff60',add:true})}
  FX.light(BOSS[0],BOSS[1]-110,ph2?380:230,ph2?'rgba(80,255,130,.8)':'rgba(80,255,130,.4)',.8+.15*Math.sin(T*(ph2?9:3)));
  if(B.charge){const k=(T*2)%1;g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(150,255,190,'+(1-k)+')';g.lineWidth=3;g.beginPath();g.arc(BOSS[0],BOSS[1]-110,260*(1-k)+20,0,6.28);g.stroke();g.restore()}
  actorDraw(g,(gg,x,y)=>ACT.sprite(gg,'x',x,y,5.0,{t:T,face:-1,atk:0}),BOSS[0]+bo.x,BOSS[1],bo.hurt);
  // tigre + aliados
  const tg=BFX.off('tiger');actorDraw(g,(gg,x,y)=>ACT.tiger(gg,x,y,2.7,{t:T,face:1,pose:Math.abs(tg.x)>8?'atk':(tg.hurt>0?'roar':null)}),TIGER[0]+tg.x,TIGER[1],tg.hurt);
  B.party.forEach((p,i)=>{
    const o=BFX.off('p'+i),dead=p.hp<=0;
    g.save();if(dead){g.globalAlpha=.4;g.translate(BP[i][0],BP[i][1]);g.rotate(-1.3);g.translate(-BP[i][0],-BP[i][1]+10)}
    actorDraw(g,(gg,x,y)=>ACT.sprite(gg,p.k,x,y,3.0,{t:T+i,face:1,atk:(o.x!==0&&!dead)?Math.abs(o.x)/60:0}),BP[i][0]+o.x,BP[i][1],o.hurt);
    g.restore();
  });
  // cobertura
  if(B.cover){g.fillStyle='#3a4250';g.fillRect(BP[0][0]+62,BP[0][1]-52,22,52);g.fillStyle='#5a6575';g.fillRect(BP[0][0]+62,BP[0][1]-52,22,5);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(BP[0][0]+76,BP[0][1]-52,8,52);g.fillStyle='#d4a017';g.fillRect(BP[0][0]+64,BP[0][1]-30,18,2)}
  // escudo
  const dm=BFX.dome();if(dm>0.01){const cx=BP[1][0]+70,cy=BP[1][1]-40;g.save();g.globalAlpha=dm*.9;const rg=g.createRadialGradient(cx,cy,60,cx,cy,230);rg.addColorStop(0,'rgba(60,160,255,0)');rg.addColorStop(.8,'rgba(60,160,255,.18)');rg.addColorStop(1,'rgba(160,220,255,.55)');g.fillStyle=rg;g.beginPath();g.ellipse(cx,cy,230,150,0,0,6.28);g.fill();g.strokeStyle='rgba(180,230,255,.7)';g.lineWidth=2;g.beginPath();g.ellipse(cx,cy,230,150,0,0,6.28);g.stroke();
    g.globalAlpha=dm*.35;g.strokeStyle='#bfe8ff';g.lineWidth=1;for(let a=0;a<6.28;a+=.52){g.beginPath();g.moveTo(cx+Math.cos(a)*40,cy+Math.sin(a)*26);g.lineTo(cx+Math.cos(a)*226,cy+Math.sin(a)*146);g.stroke()}g.restore();FX.light(cx,cy,300,'rgba(60,160,255,.5)',.6)}
  // scan
  if(BFX.scan()>0){const k=1-BFX.scan()/1.3,y=BOSS[1]-240+k*250;g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(64,224,255,.6)';g.fillRect(BOSS[0]-90,y,180,3);g.fillStyle='rgba(64,224,255,.08)';g.fillRect(BOSS[0]-90,BOSS[1]-240,180,250);g.restore()}
  // luz de sinalizador
  if(BFX.flare()>0){const f=Math.min(1,BFX.flare());FX.light(520,40,720,'rgba(255,60,40,.85)',f);g.fillStyle='rgba(255,40,30,'+.12*f+')';g.fillRect(0,0,W,H)}
  // projéteis e feixes
  BFX.projs.forEach(p=>{const k=p.t/p.dur,x=p.x0+(p.x1-p.x0)*k,y=p.y0+(p.y1-p.y0)*k-Math.sin(k*Math.PI)*p.arc;p.draw(g,x,y,k);FX.light(x,y,90,'rgba(150,255,60,.8)',.8);if(Math.random()<.8)FX.add({kind:'dot',x,y,vx:(Math.random()-.5)*20,vy:20,life:.4,s:2,c:'#9fff40',add:true})});
  BFX.beams.forEach(b=>{const k=1-b.t/b.dur;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=b.col;g.globalAlpha=k;g.lineWidth=b.w*k+1;g.lineCap='round';g.beginPath();g.moveTo(b.x0,b.y0);g.lineTo(b.x1,b.y1);g.stroke();g.lineWidth=b.w*3*k;g.globalAlpha=k*.3;g.stroke();g.restore()});
  BFX.lts.forEach(l=>FX.light(l.x,l.y,l.r,l.c,1-l.t/l.dur));
  g.restore();
}
function drawBattleUI(g){
  const bar=(x,y,w,h,v,max,c,bg)=>{g.fillStyle='#000a';g.fillRect(x-2,y-2,w+4,h+4);g.fillStyle=bg;g.fillRect(x,y,w,h);g.fillStyle=c;g.fillRect(x,y,w*Math.max(0,v)/max,h);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x,y,w*Math.max(0,v)/max,2)};
  g.font='bold 13px "Courier New",monospace';g.textAlign='left';
  g.fillStyle='#fff';g.fillText('*****  —  Vida '+Math.max(0,B.hp)+' / '+B.max,520,22);bar(520,28,420,12,B.hp,B.max,'#e33','#300');
  g.fillStyle='#8ee';g.fillText('Controle do Núcleo '+Math.max(0,B.grip)+'%',520,60);bar(520,66,420,12,B.grip,100,'#3cf','#012');
  if(B.phase===2){g.fillStyle='#6f8';g.fillText('FASE 2 — PROTOCOLO NUCLEAR',520,98)}
  if(B.charge&&Math.floor(T*4)%2){g.fillStyle='#ff4040';g.font='bold 20px "Courier New",monospace';g.textAlign='center';g.fillText('⚠ CARGA NUCLEAR — USE ESCUDO OU COBERTURA',W/2,130)}
  g.textAlign='center';g.font='11px "Courier New",monospace';
  B.party.forEach((p,i)=>{const x=BP[i][0];bar(x-30,BP[i][1]+8,60,6,p.hp,p.max,p.hp/p.max>.35?'#3c4':'#e83','#300');g.fillStyle='#fff';g.fillText(CH[p.k].n.split(' ')[0]+' '+hpf(p.hp),x,BP[i][1]+30)});
  g.textAlign='left';
}

/* ---------- FINAIS ---------- */
const ENDS={
 true:{n:'O Nome Que Ninguém Diz',t:'O Núcleo foi aberto ao mundo. A China ascende sob olhos que não pode apagar. Ernani lembra de tudo — e escolhe ficar.'},
 empire:{n:'Dragão Sem Rosto',t:'O império vence. Ernani acorda sem memória, ao lado de Mao, diante de um mapa vitorioso. Algo falta. Ele não sabe o quê.'},
 exile:{n:'Rota Interrompida',t:'Dois homens e uma moto cruzam a fronteira. O mundo muda sem eles. Eles, pelo menos, têm um ao outro.'},
 ash:{n:'Cinzas de Xangai',t:'O Núcleo se desfaz em fogo e silêncio. A cidade apaga. A China cresce, mas Ernani nunca mais soube o que é acordar sem ouvir uma voz que não está lá.'}
};
function showEnding(id){
  const e=ENDS[id],ls=endings();if(!ls.includes(id)){ls.push(id);try{localStorage.setItem(ENDS_KEY,JSON.stringify(ls))}catch(x){}}
  hideDlg();mode='end';showHud(false);const p=$('panel');p.classList.add('on');
  p.innerHTML='<div class="box"><div class="sub">FINAL '+(['true','empire','exile','ash'].indexOf(id)+1)+' / 4</div><h1>'+e.n+'</h1><p style="text-align:center">'+e.t+'</p><p class="sub">Influência '+clamp(G.infl,0,100)+'% • DUPE nv.'+G.dupe+' • ZEE '+G.zee+' • Vínculo '+G.love+' • Fragmentos '+G.frag+'/5</p><p class="sub">Finais desbloqueados: '+ls.length+'/4</p><div class="col"><button class="btn" id="eBack">Voltar ao menu principal</button></div></div>';
  $('eBack').onclick=toTitle;
}

/* =========================================================
   HISTÓRIA
   ========================================================= */
const S={};

/* ---------- ATO I ---------- */
S.intro=[
 {title:'ATO I — O NASCIMENTO DO DRAGÃO',sub:'Capítulo 1 — Um país que não aceita perder'},
 {bg:'office'},
 Nar('Xangai, 2041.\nA China atravessa a pior crise em décadas: rotas bloqueadas, mercados fechados e apagões que derrubam fábricas inteiras.'),
 Nar('No topo da Torre do Dragão, um homem decide que o país não vai mais pedir licença para existir.'),
 Mao('Nossa força não será medida apenas pelo que conseguimos destruir, mas pelo que somos capazes de construir. Cada fábrica deverá produzir. Cada porto deverá funcionar.'),
 Mao('Cada descoberta deverá nos aproximar de um futuro que não dependa da autorização de ninguém.'),
 Nar('Nas telas, a multidão aplaude. Na sala fechada, os ministros se atacam: crescimento econômico ou expansão militar?'),
 Mao('Temos a visão. Precisamos de alguém que faça a visão funcionar.'),
 Ern('Então precisamos parar de anunciar fábricas antes de descobrir quem vai fornecer as peças.'),
 Nar('Silêncio. Mao Ernani encara o novo gestor por alguns segundos... e começa a rir.'),
 Mao('Finalmente alguém nesta sala que sabe contar.','smile'),
 Nar('Mao pensa em escala de países. Ernani enxerga o parafuso que derruba um império.'),
 Mao('Você parece cansado, Ernani.'),
 Ern('Dormi bem.'),
 Mao('Você tem dormido bem demais ultimamente.'),
 Ern('Isso é uma crítica?'),
 Mao('É inveja.'),
 {glitch:20},
 Nar('Por um instante, Ernani tem a certeza de que já viveu esta cena. O riso de Mao, o cheiro de chá, a mesa de luz azul. Algo dentro dele se encolhe, e passa.'),
 {bg:'port'},
 Nar('MISSÃO 1 — DUPE\nReativar três complexos industriais, reorganizar o transporte e recuperar a confiança dos investidores.'),
 Nar('Num centro logístico, um motor ruge. Uma moto derrapa na entrada... com um tigre adulto correndo ao lado como se isso fosse perfeitamente normal.'),
 Mil('Cheguei!','smile'),
 Ern('Você tinha que entregar as amostras às oito.'),
 Mil('Entreguei às oito.'),
 Ern('São onze e quarenta.'),
 Mil('Eu não disse de qual fuso horário.','smile'),
 Nar('Ernani fecha os olhos. O tigre — o nome dele é Tigre — se deita aos pés dele e boceja.'),
 Ern('Um dia você vai ser responsável por alguma coisa importante.'),
 Mil('Eu já sou. Sou responsável por impedir que vocês dois enlouqueçam trabalhando.'),
 Mil('Sonho grande, irmão. E a gente chega lá.','smile'),
 Nar('Na inspeção, o Menino do Milho acha uma remessa fora dos registros: contêineres com símbolo de risco químico, cadastrados como componentes eletrônicos.'),
 Mil('Isso não é eletrônico. Eletrônico não cheira a hospital.'),
 {q:'Ernani fotografa os números de série. O que faz com a descoberta?',ch:[
   {t:'Investigar em sigilo',fx:()=>{G.flags.secret=1},do:[Ern('Isso fica entre nós. Por enquanto.'),Mil('Ótimo. Adoro segredos. Sou péssimo neles.')]},
   {t:'Reportar a Mao Ernani',fx:()=>add('mao',1),do:[Ern('Vou levar isso a Mao hoje.'),Mil('Honesto. Chato. Mas honesto.')]}]},
 Nar('É a primeira pista de que existe outro projeto dentro do Programa de Ascensão. Um que ninguém apresentou a Ernani.'),
 Nar('Antes disso, a produção precisa voltar. DUPE: escolha suas ações.'),
 {mode:'manage',turns:2,then:'cap2',title:'Missão 1 — Reativar o DUPE'}
];

S.cap2=[
 {title:'Capítulo 2 — A cidade que nunca dorme'},
 {bg:'city'},
 Nar('O primeiro complexo volta a funcionar. As ações sobem. Mao Ernani anuncia as Zonas Econômicas Especiais: capital, tecnologia e mão de obra num só lugar.'),
 Mao('Cada ZEE será uma pequena China dentro da China. E depois, uma pequena China dentro do mundo.'),
 {mode:'manage',turns:3,then:'cap2b',title:'ZEE — A grande expansão'}
];
S.cap2b=[
 {bg:'office'},
 {if:()=>G.unrest>=5,then:[
   Ern('As cidades estão sufocando. Se aumentarmos a produção sem melhorar a vida de quem trabalha, vamos construir uma potência cercada de pessoas que não querem viver nela.'),
   Mao('E se avançarmos devagar demais, outras potências decidirão o nosso futuro.'),
   Ern('Existe uma diferença entre não depender dos outros e obrigar todos a dependerem de nós.'),
   Nar('Mao não responde. Pela primeira vez, desvia o olhar.')],
  else:[
   Mao('Os números estão ótimos. Estranhamente ótimos. Onde está o preço?'),
   Ern('Nas cidades. Ainda não apareceu, mas vai aparecer.'),
   Mao('Então que apareça depois da vitória.')]},
 Nar('A porta se abre sem bater. Lobão entra: jaleco, olheiras, um tablet apertado como escudo.'),
 Lob('Preciso de cinco minutos e de uma cadeira. Nessa ordem. Ou na inversa.'),
 Lob('Meu projeto reduz o custo de energia das fábricas e dos trens em quase 70%. Depende do Núcleo de Coerência: uma estrutura que estabiliza reações que antes não dava para controlar.'),
 {q:'Lobão pede um orçamento ampliado. Mao olha para Ernani.',ch:[
   {t:'Financiar a pesquisa',fx:()=>{add('research',2);G.money=Math.max(0,G.money-40)},do:[Ern('Aprovado. Mas com revisão independente.'),Lob('Ética em primeiro lugar. Eu vou gostar de você.')]},
   {t:'Manter o orçamento',do:[Ern('Primeiro quero ver a energia funcionando.'),Lob('Entendo. A ciência adora esperar.')]}]},
 Lob('Tem um problema. Nos registros de fabricação do Núcleo achei uma assinatura científica desconhecida. A mesma dos contêineres do Milho.'),
 Ern('De quem?'),
 Lob('Não sei. Mas alguém está construindo uma segunda versão do nosso reator. E ela não foi projetada para produzir energia.'),
 Ern('Projetada para quê?'),
 Lob('Para aprender.'),
 {bg:'black'},{glitch:30},
 Nar('Naquela noite, uma gravação aparece no terminal de Ernani. Sem remetente.'),
 Nar('Um homem diante de uma parede de fórmulas. Camisa vinho com o símbolo de um átomo. Ao fundo, um mapa dos centros industriais chineses.'),
 Xx('Vocês estão construindo um império sobre uma descoberta que não compreendem.'),
 Nar('Ernani percebe que o homem não falou com Mao. Falou diretamente com ele.'),
 {q:'O que Ernani faz com a gravação?',ch:[
   {t:'Mostrar a Mao',fx:()=>{add('mao',1);G.flags.showed=1},do:[Nar('Mao assiste duas vezes. Quando termina, está sorrindo — mas a xícara em sua mão treme.'),Mao('Um fantasma com ambição científica. Encontre-o, Ernani.')]},
   {t:'Guardar para si',fx:()=>{G.flags.hid=1},do:[Nar('Ernani apaga o registro do servidor. Não sabe explicar por que o gesto lhe parece... familiar.')]}]},
 {go:'cap3'}
];

S.cap3=[
 {title:'Capítulo 3 — O homem sem nome'},
 {bg:'lab'},
 Nar('Um laboratório abandonado nos arredores de Shenzhen. Refeições pela metade, cadernos abertos, um quadro tomado por equações.'),
 Nar('Não existe registro civil dele. Os documentos têm símbolos que não pertencem a nenhum idioma. Quando alguém tenta pronunciar o nome, o áudio registra apenas silêncio. Nos relatórios, ele é simplesmente: *****.'),
 Mil('Eu fico no rádio com o Tigre na porta. Ele odeia cheiro de ácido.'),
 Lob('Procurem registros. Anotações, telas, qualquer coisa que explique a assinatura.'),
 Nar('[Explore o laboratório. Setas/WASD para andar, Espaço ou botão A para examinar.]'),
 {mode:'explore',map:'lab'}
];
S.lab_board=[
 Nar('No quadro, uma frase escrita dezenas de vezes entre as equações:'),
 Nar('“O OBSERVADOR TAMBÉM FAZ PARTE DO EXPERIMENTO.”'),
 Lob('Isso não é uma equação. É um recado.'),
 {fn:()=>{G.frag=Math.min(5,G.frag+1)}},Nar('[Fragmento +1]')
];
S.lab_book=[
 Nar('Um caderno de campo. Quase tudo é cálculo. Na última página, um desenho à mão: duas xícaras de chá lado a lado.'),
 Nar('Embaixo, uma anotação: “3h da manhã. Ele esquece o café esfriar.”'),
 Ern('Quem esquece o café esfriar?'),
 Nar('Ernani nota que a caligrafia tem um carinho que não combina com um terrorista.')
];
S.lab_mon=[
 Nar('Uma sala com dezenas de monitores. Em cada um: trabalhadores, pesquisadores, ministros e soldados do Programa de Ascensão.'),
 Nar('No último monitor, Ernani caminha por um corredor. Ele ainda não chegou àquele corredor.'),
 {glitch:40},
 Gl('ernani','Você não deveria ter vindo sozinho.'),
 Nar('O Ernani da tela olhou diretamente para a câmera. Ele mesmo — mais cansado, mais magro. Vestia um jaleco que Ernani não tem.'),
 Ern('...Isso não aconteceu.')
];
S.cap3b=[
 {bg:'lab'},{shake:10},
 Nar('As luzes do laboratório piscam e se apagam. Uma voz enche o sistema de som.'),
 Xx('Agora você entende por que precisei encontrar você primeiro.'),
 Nar('Ernani aponta a lanterna para o fim do corredor. Um homem está parado ali. Camisa vinho, símbolo de átomo.'),
 Nar('É a primeira vez que se encontram pessoalmente. *****  não ataca. Não foge. Apenas observa Ernani como quem espera há muito tempo.'),
 Ern('Você sabotou nossas instalações.'),
 Xx('Sim.'),
 Ern('Colocou pessoas em perigo.'),
 Xx('Sim.'),
 Ern('Então por que não fugiu?'),
 Xx('Porque eu precisava saber se você viria.'),
 Nar('A resposta irrita Ernani mais do que qualquer ameaça. Ele saca a pistola e ordena a prisão. Antes que os agentes avancem, todas as portas se abrem ao mesmo tempo.'),
 {bg:'black'},
 Nar('***** desaparece nos corredores. No lugar onde estava, deixa uma folha com uma equação que Lobão reconhece na hora: uma fórmula do projeto dele, com uma variável que não deveria existir.'),
 Nar('No rodapé, a letra do caderno: “Pergunte ao seu físico por que ele sonha com uma cidade que nunca visitou.”'),
 Lob('Eu... não contei isso a ninguém.'),
 Nar('Naquela noite, Lobão acorda de um pesadelo com o nome de uma cidade que nunca visitou escrito no próprio caderno. A letra é a dele.'),
 Nar('A investigação deixou de ser apenas política.'),
 {go:'cap4'}
];

/* ---------- ATO II ---------- */
S.cap4=[
 {title:'ATO II — A PESSOA DO OUTRO LADO',sub:'Capítulo 4 — Um inimigo inconvenientemente humano'},
 {bg:'station'},
 Nar('Nas semanas seguintes, ***** aparece em lugares impossíveis. Mensagens nos terminais. Uma sombra num corredor. Ele sempre tem a chance de ferir Ernani. E sempre escolhe não fazer.'),
 Nar('Uma mensagem promete a localização do segundo reator clandestino. Ernani vai sozinho. Uma estação ferroviária desativada, uma tempestade lá fora.'),
 Nar('No banco, ***** segura dois copos de chá quente.'),
 Ern('Você me chamou até aqui para tomar chá?'),
 Xx('Você parece decepcionado.'),
 Ern('Eu esperava uma explicação.'),
 Xx('As explicações costumam ser menos interessantes do que as pessoas imaginam.'),
 {q:'***** empurra um dos copos na direção de Ernani.',ch:[
   {t:'Beber',fx:()=>add('love',2),do:[Nar('Ernani bebe. Está quente. Do jeito exato que ele gosta.'),Ern('Como sabe como eu gosto?'),Xx('Eu li sua ficha.','sad'),Nar('A resposta veio um segundo atrasada.')]},
   {t:'Recusar, mão na arma',fx:()=>add('love',0),do:[Ern('Você envenenou?'),Xx('Se eu quisesse matar você, teria escolhido algo menos caro.'),Nar('Ernani quase sorri. Quase. Pega o copo, mas não bebe.')]}]},
 Nar('Eles conversam por horas. Pela primeira vez, ***** fala do passado sem esconder tudo numa metáfora científica.'),
 Xx('Passei anos em projetos financiados por organizações que prometiam progresso, mas cobravam resultados sem perguntar o custo. Cada descoberta era celebrada até alguém perguntar quanto custava repetir.'),
 Xx('Então vinham os contratos, os segredos e as ameaças. A humanidade não sabe lidar com o poder que produz.'),
 Ern('E sua solução foi tirar esse poder das mãos de todo mundo?'),
 Xx('Minha solução foi impedir que alguém pudesse usá-lo para escravizar os outros.'),
 Ern('Destruindo cidades?'),
 Xx('Eu disse que era a minha solução. Não disse que era uma solução justa.','sad'),
 Nar('É a primeira rachadura na imagem do vilão. Ele não se acha inocente. Acha que o mundo está tão corrompido que a inocência virou impossibilidade.'),
 Nar('Quando a tempestade passa, ***** pergunta, já de costas:'),
 Xx('Se você descobrisse que tudo o que construiu foi planejado por outra pessoa, continuaria lutando?'),
 {q:'O que Ernani responde?',ch:[
   {t:'“Depende de quem tentasse me convencer a desistir.”',fx:()=>add('love',1),do:[Nar('*****  fica em silêncio. Pela primeira vez, Ernani percebe que o homem não está satisfeito com a própria solidão.')]},
   {t:'“Eu pararia de acreditar em você.”',do:[Xx('Justo.','sad'),Nar('Ele vai embora sem olhar para trás. Ernani sente que disse a coisa errada, e não sabe por quê.')]}]},
 {go:'cap5'}
];

S.cap5=[
 {title:'Capítulo 5 — A rotina das coisas impossíveis'},
 {bg:'city'},
 Nar('O jogo muda de ritmo. As missões continuam: reuniões, fábricas, acordos. Mas, entre elas, pequenos momentos.'),
 Nar('Um bilhete dentro de um livro: “Você deixou o café esfriar de novo.”'),
 {q:'Ernani guarda o bilhete. E responde com um recado deixado no mesmo livro:',ch:[
   {t:'“Quem está me vigiando?”',do:[Nar('Dois dias depois, o livro traz: “Ninguém precisa te vigiar. Você sempre volta.”')]},
   {t:'“Da próxima vez eu bebo quente.”',fx:()=>add('love',1),do:[Nar('Dois dias depois, o livro traz um desenho: duas xícaras, e uma delas sorrindo.')]}]},
 {bg:'black'},
 Nar('3h07 da manhã. Uma mensagem no celular.'),
 Xx('Está acordado?'),
 Ern('Agora estou.'),
 Xx('Eu estava pensando. Por que a gente continua, num mundo que...'),
 Ern('Que o quê?'),
 Xx('...esquece as pessoas tão rápido.','sad'),
 {q:'Ernani digita devagar.',ch:[
   {t:'“Eu não esqueço quem importa.”',fx:()=>add('love',1),do:[Xx('Isso é uma promessa ou uma ameaça?'),Ern('Depende do fuso horário.','smile'),Nar('Ele ri sozinho, no escuro. Esquece de quanto tempo faz que não ria assim.')]},
   {t:'“Vai dormir. Você é um criminoso, não meu amigo.”',do:[Xx('Tudo bem.'),Nar('A conversa termina. O silêncio dói mais do que deveria.')]}]},
 {bg:'port'},
 Nar('Menino do Milho nota Ernani sorrindo para o celular.'),
 Mil('Você tá sorrindo.'),
 Ern('Estou olhando um relatório.'),
 Mil('Você sempre sorri nessa hora. Quer dizer... sorria. Sorria nessa hora.'),
 Ern('Que hora?'),
 Mil('Esquece. Deixei sua marmita no Tigre, ele te protege dela.','smile'),
 {glitch:25},
 Gl('milho','Você já salvou o jogo hoje? Brincadeira. Vai que a vida tem save.'),
 Nar('Ernani ri. O Menino do Milho não.'),
 {bg:'station'},
 Nar('Na terceira noite, ele recebe uma conversa que já teve. Palavra por palavra: o café, o chá, o mundo que esquece rápido demais.'),
 Gl('ernani','Já tivemos essa conversa.'),
 Xx('Tivemos?','sad'),
 {glitch:60},{shake:12},
 Nar('A imagem treme. Por um segundo, o banco da estação parece a mesa de um café que Ernani nunca visitou. Duas xícaras. Uma foto instantânea na mesa, virada para baixo.'),
 Nar('*****  desvia o olhar.'),
 Xx('Quando o Núcleo estiver pronto, ele vai nos observar. Quanto mais forte você sentir, mais ele aprende.'),
 Ern('Aprende o quê?'),
 Xx('Como controlar pessoas. A partir de quem elas amam.'),
 {go:'sx0'}
];

S.cap6=[
 {bg:'office'},
 Nar('Na Torre do Dragão, Mao convoca a cúpula. Delegações de quarenta países. O mundo está, de repente, interessado.'),
 Mao('Os apagões acabaram. A China exporta energia limpa a metade do planeta. Lobão, apresente.'),
 Lob('O Núcleo de Coerência opera a 94% da capacidade teórica. O segundo reator... ainda não deveria existir.'),
 Mao('Existe. Eu o autorizei. Será ativado em trinta dias, controlado por uma versão adaptativa do sistema.'),
 Ern('Você autorizou um reator que aprende, sem contar a ninguém?'),
 Mao('Contei a quem precisava saber.'),
 {mode:'manage',turns:3,then:'cap6b',title:'Cúpula Global — Diplomacia e Poder'}
];
S.cap6b=[
 {bg:'roof'},
 Nar('Depois da cúpula, Mao e Ernani no terraço da Torre. Xangai brilha como um circuito aceso.'),
 Mao('Minha mãe morreu num hospital sem energia. Eu tinha dezenove anos. Prometi que nenhum chinês voltaria a morrer no escuro por causa da autorização de outro país.'),
 Mao('Se for preciso construir um dragão para cumprir isso, constrói-se um dragão.','sad'),
 {q:'Ernani pensa no homem que não consegue nomear.',ch:[
   {t:'Apoiar a promessa de Mao',fx:()=>add('mao',1),do:[Ern('Então vamos construir. Mas com pessoas lá dentro, não só números.'),Mao('É por isso que você está aqui.','smile')]},
   {t:'Perguntar: “Já trabalhei em Qinghe?”',fx:()=>{G.flags.asked=1},do:[Nar('O nome sai da boca de Ernani sem aviso. Ele não sabe de onde veio.'),Mao('Nunca ouvi esse nome.'),Nar('Mao sustenta o olhar. Mas o copo na mão dele racha com um estalo mínimo.')]}]},
 Nar('A partir dali, nada era mais simples.'),
 {go:'cap7'}
];

/* SEITA */
const Sei=(t,e)=>sayf('seita',t,e);
const sinal=()=>{G.seita.sinais=Math.min(6,G.seita.sinais+1)};
const GRAO_ACT={n:"Estudar o Grão (Lobão)",d:"+2 pesquisa. Cada estudo contamina o laboratório: a partir da 3ª vez, +pressão social.",c:20,f:()=>{add("research",2);G.seita.contam++;let t="Lobão passa a noite medindo o Grão. Os números não fecham, e ele sorri mesmo assim.";if(G.seita.contam>=3){G.unrest=clamp(G.unrest+1,0,10);t+=" Assistentes relatam vozes no corredor: +pressão social."}return t}};
const acts=()=>MACTS.concat(G.seita&&G.seita.grao?[GRAO_ACT]:[]);

S.sx0=[
 {title:"CAPÍTULO 5½ — O MENINO E O SÍMBOLO",sub:"Interlúdio • Você controla o Menino do Milho"},
 {bg:"porto_noite"},
 Nar("Porto de Xangai, 01h40. Chove fino. O vapor sobe das docas e os guindastes piscam em vermelho, um depois do outro, como se contassem alguma coisa."),
 Nar("Três lotes de componentes do DUPE chegaram com a papelada em ordem. O peso, não."),
 Ern("Milho, o lote 17 pesa quarenta quilos a mais que o manifesto. Eu não posso aparecer aí, a Segurança vai perguntar por quê. Dá uma olhada. Sem alarde.","neutral"),
 Mil("Sem alarde é meu sobrenome. Tigre, vem.","smile"),
 Nar("O Tigre salta da caçamba da moto sem fazer um ruído. Ele não gosta do cheiro do cais. As orelhas estão coladas na cabeça."),
 Mil("Calma, grandão. É só um porto."),
 Nar("O Menino do Milho ainda não sabe, mas já viu aquela marca antes. Só não lembra onde."),
 Nar("[Controle o Menino do Milho. Examine as pistas (Espaço / A). O Tigre vai atrás de você.]"),
 {mode:"explore",map:"porto"}
];
S.sx_caixa=[
 Nar("Lote 17. O contêiner está violado por fora, mas os lacres estão intactos, como se alguém tivesse aberto por dentro. Na lateral, em tinta desbotada: “Fornecimento Primeiro Campo Ltda.”"),
 Mil("Primeiro Campo... Essa empresa não está em nenhum cadastro do DUPE."),
 Nar("Ele se agacha. Sob o estrado de madeira, riscado a ferro quente, um desenho: três círculos incompletos cortados por uma linha vertical e, no centro, uma semente."),
 {glitch:20},
 Mil("Eu conheço isso."),
 Nar("O Tigre rosna baixo. Não para o desenho. Para o escuro atrás do contêiner."),
 {fn:sinal},Nar("[Pista da Seita 1/6 — O símbolo]")
];
S.sx_caderno=[
 Nar("Um caderno de capa mole, preso por um barbante sobre um barril. A chuva não molhou as páginas. Alguém o deixou ali há pouco."),
 Nar("Metade são medições de umidade e temperatura, em colunas perfeitas. A outra metade são orações. As duas letras são da mesma mão."),
 Nar("Uma frase sublinhada duas vezes: “O Grão não distingue uma lembrança verdadeira de uma reconstrução convincente.”"),
 Mil("Que tipo de gente mede temperatura e reza ao mesmo tempo?"),
 Nar("Na última página, em tinta nova: “Para o neto de L., caso ele venha: não pegue o que brilhar.”"),
 Mil("..."),
 Nar("O Menino do Milho fecha o caderno devagar. Ninguém, nunca, chamou o avô dele só pela inicial."),
 {fn:sinal},Nar("[Pista da Seita 2/6 — Caderno de cultivo]")
];
S.sx_selo=[
 Nar("Um cabeço de ferro no cais e, preso nele, um disco de bronze do tamanho de uma palma, com o mesmo símbolo em relevo. Está quente. Não deveria estar, na chuva."),
 Mil("Selo de passagem. Meu avô tinha um desenho disso na tampa de um baú que ele nunca deixou eu abrir."),
 Nar("O Tigre cheira o disco e recua dois passos. Não rosna. Apenas recua."),
 Mil("Eu sei, grandão. Eu também não gosto."),
 {fn:sinal},Nar("[Pista da Seita 3/6 — Selo de passagem]")
];
S.sx_porta=[
 Nar("Atrás da pilha de contêineres 14, onde o mapa do porto mostra só concreto, há um portão baixo de ferro. Na fechadura, um recesso circular. O disco encaixa com um estalo seco."),
 Nar("Sob o cais, a escada desce muito mais do que deveria. O ar é frio, mineral, com cheiro de incenso velho e terra molhada."),
 Nar("O Tigre para no primeiro degrau. Olha para o Menino do Milho. Não atravessa."),
 Mil("Eu preciso entrar. Se não for eu, vai ser a Segurança, e eles vão destruir tudo antes que alguém entenda."),
 Nar("O Tigre baixa a cabeça, encosta a testa no peito dele e, depois de um longo suspiro, desce na frente."),
 Mil("Obrigado. Eu te devo mais uma.","smile"),
 {bg:"templo"},
 Nar("Embaixo do porto de Xangai existe um templo."),
 Nar("Colunas de pedra escura, braseiros acesos, silhuetas ajoelhadas que, a esta distância, ainda podem ser só sombras. Ao fundo, um altar de três degraus. Em todas as paredes, o mesmo símbolo."),
 Nar("[Examine o templo. O altar só responde depois que você entender onde está: encontre as 3 outras pistas.]"),
 {mode:"explore",map:"templo"}
];
S.sx_grav=[
 Nar("Um gravador de rolo sobre uma mesa baixa, ainda ligado à tomada. Duas fitas rotuladas com a mesma data: “Qinghe, 2038”."),
 Nar("Na primeira, uma voz de mulher: “Eu nunca estive em Qinghe. Eu nunca estive em Qinghe.” Na segunda, a mesma voz, cansada: “Eu estava no reator. Eu vi tudo acontecer.”"),
 Mil("Alguém gravou duas versões da mesma pessoa."),
 Nar("A fita continua. Um silêncio longo. Depois, bem baixo, atrás do chiado: “Menino do Mi—”"),
 Nar("O nome está incompleto. A segunda regra do avô sobe pela garganta como um gosto de metal."),
 {q:"A voz espera. O Tigre eriça o pelo.",ch:[
   {t:"Responder: “Estou aqui.”",fx:()=>{G.seita.contam++},do:[Nar("Silêncio. Depois, na fita, a voz repete a sua resposta, palavra por palavra, só que mais velha. Por alguns segundos, você não sente o próprio coração."),Mil("...Tá. Isso foi péssima ideia.","sad")]},
   {t:"Não responder. Desligar o gravador.",fx:()=>{G.seita.calma++},do:[Nar("Você aperta o botão. O chiado morre. O Tigre solta o ar, como quem também estava prendendo a respiração."),Mil("Regra dois. Valeu, vô.")]}]},
 {fn:sinal},Nar("[Pista da Seita 4/6 — Gravações contraditórias]")
];
S.sx_doc=[
 Nar("Uma pasta de papelão amarelada, aberta numa estante. Dentro, duas versões de um mesmo relatório."),
 Nar("Versão A, 1971, tinta azul: “A seita foi dissolvida. Os últimos Guardiões morreram durante a perseguição.”"),
 Nar("Versão B, 2031, papel timbrado do Instituto de Qinghe: “Convênio 07 — calibração do núcleo DUPE com os registros do Primeiro Campo.” Assinatura ilegível. Carimbo oficial."),
 Mil("Alguém mentiu em uma das duas. Ou nas duas."),
 Nar("O DUPE não nasceu do nada. Alguém leu aquelas páginas antes de construí-lo. E essa pessoa tinha carimbo oficial."),
 {fn:sinal},Nar("[Pista da Seita 5/6 — Documentos conflitantes]")
];
S.sx_mask=[
 Nar("Uma prateleira de máscaras rígidas de madeira clara, cada uma com um número na testa. Faltam duas. Em uma das vagas, uma etiqueta com uma só letra: “L.”"),
 Nar("Dentro de uma das máscaras, um papel dobrado: uma lista de nomes riscados à mão. Entre eles, nomes que Mao citou em discursos como “mártires da modernização”."),
 Mil("Eles não são só fanáticos de roupão. Eles estiveram infiltrados em tudo."),
 Nar("O Tigre fareja a vaga de “L.” por muito tempo. Depois deita-se diante dela, como num velório."),
 {fn:sinal},Nar("[Pista da Seita 6/6 — Máscaras]")
];
const TAKE={t:"Pegar o Grão.",fx:()=>{G.seita.grao=1;G.seita.contam++;add("research",1);G.unrest=clamp(G.unrest+1,0,10)},do:[
   Nar("É morno. É mais leve do que parece. Quando os dedos se fecham, o templo some por um instante."),
   {glitch:80},{shake:18},
   Nar("Você está num laboratório limpo, em Qinghe, 2038. Alguém te entrega um café e diz o seu nome inteiro. Você nunca esteve ali. Você estava em casa. E lembra de tudo perfeitamente."),
   Nar("O templo volta. O Tigre está de pé, eriçado, olhando para você como se você fosse outra coisa."),
   Sei("Eu não o impeço. Mas o Grão não distingue uma lembrança verdadeira de uma reconstrução convincente. Você acabou de aprender qual das duas era aquela."),
   Mil("(Vou guardar isso no bolso e fingir que não aconteceu. Ótima estratégia.)","sad"),
   Nar("[Grão obtido. Pesquisa +1, Pressão social +1. Você poderá pedir ao Lobão que o estude, mas todo estudo contamina um pouco mais.]")]};
const LEAVE={t:"Deixar o Grão e pedir os arquivos.",fx:()=>{G.seita.aliado=1;G.unrest=clamp(G.unrest-1,0,10)},do:[
   Mil("Eu não toco nisso. Mas quero os arquivos. Todos. E você garante que a Segurança não encoste neles antes de nós."),
   Sei("Você é bem mais esperto que seu avô."),
   Sei("As cópias irão com o Tigre. Os animais passam melhor que os homens por onde estamos."),
   Nar("O Guardião toca o peito com dois dedos, numa saudação antiga, e some entre as colunas como se nunca tivesse estado ali."),
   Nar("[Aliança com uma ala dos Guardiões. Pressão social −1. Os arquivos serão úteis mais adiante.]")]};
S.sx_altar=[
 {bg:"templo"},
 Nar("O altar. No topo, sobre um disco de pedra gravado com três anéis, um grão do tamanho de um dedo, dourado, com uma luz interna que pulsa devagar, como se respirasse."),
 Nar("O Tigre passa na frente do Menino do Milho. Senta-se diante do altar, de costas para ele, e fica ali. Como quem espera alguém."),
 Mil("Regra um: nunca pegar um Grão perto de uma estrutura circular."),
 Mil("Isso aqui é inteiro circular."),
 {glitch:30},
 Sei("Ele disse que viria alguém. Esperávamos que fosse mais tarde.","neutral"),
 Nar("Uma figura de capuz escuro, que ninguém ouviu entrar, está de pé entre duas colunas. Não ergue as mãos. Não ameaça."),
 Sei("Você é o neto do Velho L. Tem o mesmo jeito de falar sozinho."),
 Mil("Você conheceu meu avô?"),
 Sei("Conheci. Ele foi o último que acreditou que o Grão podia ser apenas guardado. Eu ainda tento."),
 Mil("E você é de qual lado dessa seita? Do tipo que reza ou do tipo que quebra coisas?"),
 Sei("Do tipo que ainda não decidiu. Somos muitos e não nos entendemos. Alguns querem guardar o Grão. Alguns querem usá-lo. E alguns... querem usar vocês."),
 {q:"O Guardião estende a mão para o altar, sem tocá-lo.",ch:[
   {t:"Perguntar: “Quem manda nessa seita?”",do:[
      Sei("Ninguém manda em todos. Há um homem de quem já se fala como Cultivador-Mor. Ele dirige a ala que quer fazer da colheita uma lei. A voz dele já passou pelo seu país. Em gravações. Em retratos antigos."),
      Sei("Pelo que sei, ele conhece vocês. Conhece o que vocês perderam melhor do que vocês mesmos."),
      Mil("Isso foi a regra três falando."),
      {q:"O Grão pulsa. O Guardião espera.",ch:[TAKE,LEAVE]}]},
   TAKE,LEAVE]}
];
S.sx_out=[
 {bg:"porto_noite"},
 Nar("Amanhece. A chuva parou. O Menino do Milho sobe do porto com o Tigre atrás, e o mundo parece exatamente o mesmo, o que é um pouco ofensivo."),
 Mil("Ernani, atende."),
 Ern("Você demorou. Achou alguma coisa?"),
 Mil("Achei um problema. Sabe aquele desenho que você viu no laboratório e achou que era marca de fabricante?"),
 Ern("A semente com os círculos... Eu vi no reator, sim. Mas por que você está..."),
 Mil("Porque ele também está embaixo do porto. E dentro do DUPE."),
 Nar("Ernani fica em silêncio tempo suficiente para o Menino do Milho ouvir a própria respiração."),
 Ern("Manda tudo para mim. Eu levo ao Lobão."),
 {if:()=>G.seita.grao,then:[
   Lob("Milho, seus olhos estão vermelhos. Quando foi a última vez que você dormiu?"),
   Mil("Dormir? Que conceito."),
   Nar("Dentro do bolso do casaco, algo pequeno e morno bate devagar. Como um coração. Como um segundo coração.")],
  else:[Nar("Preso na coleira do Tigre, um tubo de couro com cópias de tudo. Ele caminha com a dignidade de quem sabe o valor do que carrega.")]},
 {t:()=>"[Pistas da Seita: "+G.seita.sinais+"/6]"},
 {go:"cap6"}
];

/* ---------- ATO III ---------- */
S.cap7=[
 {title:'ATO III — O QUE FOI APAGADO',sub:'Capítulo 7 — Uma noite em Xangai'},
 {bg:'roof'},
 Nar('Meia-noite. Chuva fina. A mensagem diz apenas: “Telhado. Venha sozinho.”'),
 Nar('Ernani vem. Sozinho, desarmado, o coração batendo mais rápido que a lógica. *****  está de pé na beira do prédio, camisa molhada.'),
 Ern('Eu devia te prender.'),
 Xx('Devia.'),
 Ern('Mas estou aqui.'),
 Xx('E eu estou aqui. Aparentemente, nós dois somos péssimos em obedecer.'),
 Nar('A cidade inteira brilha abaixo deles. Há trens, luzes, milhões de vidas que nunca saberão desta conversa.'),
 {q:'*****  dá um passo na direção dele.',ch:[
   {t:'Segurar a mão dele',fx:()=>add('love',2),do:[Nar('Ernani segura a mão molhada. É a primeira coisa, em semanas, que parece verdadeira.'),Xx('Você tem as mãos quentes. Sempre teve.','sad'),Ern('Sempre?')]},
   {t:'Ficar parado, esperando',fx:()=>add('love',1),do:[Nar('Ernani não se mexe. É *****  quem diminui a distância.')]}]},
 Xx('Eu devia te odiar. Todas as razões estão aqui. Mas passei tempo demais sozinho para entender que o único lugar onde fico em paz é perto de você.'),
 Ern('Quem é você?'),
 Nar('*****  tenta dizer o nome. A voz some. O som da chuva, o barulho da cidade, tudo continua. Só a palavra não existe.'),
 Xx('Se eu disser, você vai lembrar tudo de uma vez. E não sobreviveria a isso agora.'),
 Nar('Ernani encosta a testa na dele. O beijo é lento, cuidadoso, como o de quem reconhece o gosto de algo que perdeu e não sabia.'),
 {glitch:50},
 Nar('Flash. Um café pequeno, de madrugada. Duas xícaras, uma foto instantânea, uma risada. A mesma risada. Os mesmos olhos. Outro ano, outra cidade.'),
 {bg:'roof'},
 Ern('Qinghe.'),
 Xx('...É.'),
 Nar('O celular de Ernani vibra. Lobão: “Achei. A cidade dos meus sonhos existe. Qinghe. Fica a duzentos quilômetros daqui. Fomos lá, Ernani. Nós três, e mais gente.”'),
 {go:'cap8'}
];

S.cap8=[
 {title:'Capítulo 8 — Qinghe'},
 {bg:'qinghe'},
 Nar('Qinghe, hoje: uma cidade fantasma. Zona de exclusão desde 2038. Oficialmente, houve um “incidente de infraestrutura”.'),
 Mil('Eu e o Tigre ficamos na entrada. Chega. Eu aviso se alguém vier.'),
 Nar('Mas, por algum motivo, o Menino do Milho ficou muito pálido ao ver o letreiro da cidade. Ele se recompõe rápido demais.'),
 Lob('Pessoal, eu conheço estas ruas. Eu não deveria conhecer estas ruas.'),
 Nar('[Procure 3 fragmentos de memória espalhados pela cidade.]'),
 {mode:'explore',map:'qinghe'}
];
S.q1=[
 Nar('Um triciclo infantil enferrujado, preso entre escombros. Na lateral, escrito com tinta: “Dr. Lobão — 3º andar”.'),
 Lob('Eu... trazia a filha de um colega à escola. Todo dia. Eu esqueci o nome dela.'),
 {fn:()=>{G.frag=Math.min(5,G.frag+1)}},Nar('[Fragmento +1]')
];
S.q2=[
 Nar('Uma moldura quebrada. Dentro, uma foto instantânea desbotada: Ernani e ***** num café, rindo. Atrás deles, um Menino do Milho mais novo, de óculos, fazendo pose.'),
 Ern('Isso é... a gente.'),
 {glitch:30},
 {fn:()=>{G.frag=Math.min(5,G.frag+1)}},Nar('[Fragmento +1]')
];
S.q3=[
 Nar('Uma plaqueta de metal derretida. Dá para ler: “Reator Experimental 01 — Qinghe — Operações: E.”'),
 Ern('E de... Ernani.'),
 Lob('Você era o chefe de operações. Você assinou a ordem de ativação.'),
 {fn:()=>{G.frag=Math.min(5,G.frag+1)}},Nar('[Fragmento +1]')
];

S.cap8b=[
 {bg:'qinghe'},{glitch:80},{shake:16},
 Nar('A cidade vibra. As lembranças chegam, desordenadas, como uma onda atrás da outra.'),
 {bg:'lab'},
 Nar('QINGHE, 2038. Um laboratório limpo, sem rachaduras. Lobão discute fórmulas. Um Menino do Milho mais jovem, assistente técnico, derruba café nos papéis.'),
 Nar('E *****, chefe de química e de reações. Rindo, de camisa vinho, um café esquecido na mesa ao lado de outro.'),
 Mao('Vocês têm dez dias. O Reator 01 liga antes do prazo ou perdemos o financiamento da província.','sad'),
 Xx('O núcleo ainda não estabilizou. Se ligarmos antes, ele aprende o que somos agora, e não o que queremos ser.'),
 Ern('Ele tem razão, Mao. Precisamos de mais tempo.'),
 Mao('Não tenho mais tempo. Assine, Ernani.'),
 Nar('Ernani, em lágrimas e cansaço, assina. Ele lembra do próprio nome tremendo no papel.'),
 {bg:'qinghe'},{shake:30},{glitch:60},
 Nar('A cascata. Os alarmes. A cidade apagada em três minutos. Milhares de pessoas. *****, no coração do reator, tentando estabilizá-lo sozinho.'),
 Xx('Vá! Fuja, Ernani!'),
 Nar('Ernani vê o laboratório desaparecer em branco. Depois, nada. Nem o corpo. Nem o nome.'),
 Nar('Meses depois, Ernani implora a Mao que apague aquela memória. Que apague ele. Que o deixe dormir.'),
 {bg:'qinghe'},
 Ern('Eu pedi.'),
 Lob('Você pediu. E eu, covarde, também pedi. Os dois somos de lá. Os dois esquecemos.'),
 Nar('O Menino do Milho tira do bolso uma foto dobrada: a mesma da moldura.'),
 Mil('Eu não pedi. Você me pediu para ficar. “Se eu esquecer, fica perto.” Eu fiquei, irmão.','sad'),
 Mil('Por isso eu faço piada. Se eu parar de rir, eu conto.'),
 {fn:()=>{G.frag=Math.min(5,G.frag+1)}},Nar('[Fragmento +1: a foto do Menino do Milho]'),
 Nar('O Núcleo 02 foi construído com os dados de Qinghe. E *****  não é um terrorista. Ele passou três anos escondido, sabotando cada tentativa de repetir o desastre.'),
 {q:'Ernani, no meio dos escombros, precisa aceitar o que foi.',ch:[
   {t:'“Eu assinei. E posso consertar.”',fx:()=>add('love',1),do:[Ern('Se eu fugir de novo, ele morre de novo. Desta vez eu fico.')]},
   {t:'“Mao me manipulou.”',fx:()=>add('mao',-1),do:[Ern('Ele me usou. E eu deixei. Eu vou falar com ele.')]}]},
 {go:'cap9'}
];

/* ---------- ATO IV ---------- */
S.cap9=[
 {title:'ATO IV — O ÚLTIMO OBSTÁCULO',sub:'Capítulo 9 — O dragão acordado'},
 {bg:'office'},
 Nar('Torre do Dragão. Mao está de pé diante da mesa holográfica, de costas. Quando se vira, não parece surpreso.'),
 Ern('Você apagou minha memória.'),
 Mao('Você me implorou. De joelhos, no chão de um hospital. Eu cumpri.'),
 Ern('E depois me trouxe de volta ao mesmo projeto.'),
 Mao('Porque o país precisava de você inteiro. E porque eu não consigo construir nada sem alguém que saiba contar.'),
 {if:()=>G.mao>=5,then:[
   Mao('Eu errei em Qinghe. Eu sei. Se você me pedir para parar o Núcleo, eu vou... considerar. Pela primeira vez.','sad')],
  else:[
   Mao('Eu não paro. Se eu parar, tudo o que construímos, tudo o que prometi à minha mãe, vira pó.')]},
 Nar('Um alarme corta a sala. Os telões acendem em vermelho.'),
 Lob('O Núcleo 02 acaba de ligar. Antes do prazo. Alguém o ativou de dentro!'),
 Mao('Impossível, o acesso exige uma chave biológica específica...'),
 Lob('...a de quem o projetou. A dele. Ele se entregou. *****  entrou no núcleo para desligar o sistema por dentro.'),
 Ern('E o Núcleo prendeu ele.'),
 Mil('Eu pego a moto. Tigre, vem.','smile'),
 Nar('A moto cruza a Avenida do Rio, o tigre correndo ao lado, Ernani na garupa e Lobão numa van logo atrás. A cidade pisca azul e vermelha.'),
 Ern('Se o Núcleo aprende com o que eu sinto, então quanto mais eu me aproximar, mais forte ele fica.'),
 Lob('Ou mais fraco. Depende de quem está no controle. Se o sinal dele for forte o bastante, a gente quebra o controle sem matar ninguém.'),
 Mil('Resumindo: a gente não vai vencer. A gente vai convencer.'),
 {go:'boss_intro'}
];
S.boss_intro=[
 {bg:'tower'},{shake:20},
 Nar('O salão do Núcleo. Cilindros verdes, cabos pulsando como veias, e no centro, de pé sobre uma plataforma, ele.'),
 Nar('2,03 m de aço, ciência e luto. Os olhos, verdes. O símbolo do átomo na camisa brilhando.'),
 Xx('Eu pedi para você não vir.','sad'),
 Ern('Você sempre pede. É a parte em que eu desobedeço.'),
 Xx('Ele não quer ser vencido. Ele quer que você desista. É o único jeito de... eu não ter que te machucar.'),
 Nar('Mas o corpo dele já não obedece. O Núcleo usa o que ele sente por Ernani como combustível.'),
 Lob('Não queremos vencê-lo! Reduzam o controle do Núcleo! Ele só cai quando o sinal quebrar!'),
 Nar('THE BOSS — *****\n[Dica: o importante é a barra azul, “Controle do Núcleo”. Se a vida dele chegar a zero, ele não sobrevive.]'),
 {mode:'battle'}
];

S.fight_hp=[
 {bg:'tower'},{shake:30},{glitch:80},
 Nar('O último golpe acerta. O corpo de ***** cede. Os olhos voltam a ser castanhos, por um segundo.'),
 Xx('Você veio...','sad'),
 Ern('Eu...'),
 Xx('Obrigado por me parar. Eu não queria que fosse você. Mas... prefiro assim.'),
 Nar('Ernani segura o corpo dele no chão frio do laboratório. O Núcleo, sem hospedeiro, entra em colapso em cadeia.'),
 Lob('Vai explodir! Todo mundo pra fora!'),
 {go:'end_ash'}
];
S.fight_grip=[
 {bg:'tower'},{shake:20},{glitch:40},
 Nar('O sinal quebra. O verde nos olhos de ***** se apaga como uma lâmpada queimando. Ele desaba nos braços de Ernani.'),
 Xx('...você disse o nome.'),
 Ern('Eu disse.'),
 Xx('Eu não ouvi.'),
 Ern('Nem eu. Mas eu sei.'),
 Nar('O Núcleo emite um último ruído. Ainda ativo. Esperando uma decisão.'),
 {bg:'office'},
 Nar('A porta do salão se abre. Mao Ernani entra, cercado de guardas, o rosto sem cor.'),
 Mao('Entregue ele, Ernani. O Núcleo está estabilizando. Ainda posso usá-lo. Ainda posso salvar o que construímos.'),
 Lob('Mao, é Qinghe de novo. Você sabe.'),
 Mao('Eu sei. E sei o que acontece se eu parar agora.','sad'),
 Nar('Todos olham para Ernani. O jogador, o gestor, o homem que assinou uma ordem em 2038.'),
 {go:'final'}
];
S.final=[
 {q:'A DECISÃO FINAL — Ernani, nos braços de *****, diante de Mao.',ch:[
   {t:'Entregar ***** e manter o império',go:'end_empire'},
   {t:'Fugir com ***** na moto do Menino do Milho',go:'end_exile'},
   {t:'Apelar a Mao: abrir o Núcleo ao mundo, com Lobão no comando e supervisão pública',go:'open_try'}]}
];
S.open_try=[
 {if:()=>canTrue(),then:[{go:'end_true'}],else:[{go:'open_fail'}]}
];
S.open_fail=[
 Ern('Abre o Núcleo. Deixa o mundo olhar. Deixa Lobão desligar com segurança.'),
 Mao('Eu... não consigo, Ernani. Eu não confio no mundo. Eu mal confio em mim.','sad'),
 Nar('O Núcleo percebe a hesitação de todos. Os cabos acendem de novo. O salão começa a ruir.'),
 Xx('Deixa eu terminar o que comecei, Ernani. Era a minha parte.'),
 Nar('*****  se solta dos braços dele e caminha, sozinho, até o cilindro central.'),
 {go:'end_ash'}
];

/* ---------- FINAIS ---------- */
S.end_empire=[
 {bg:'office'},
 Ern('Leve-o.'),
 Nar('Mao não sorri. Não comemora. Apenas assente, como quem aceita um presente que não queria.'),
 Xx('Eu entendo.','sad'),
 Nar('O Núcleo 02 é estabilizado. Os guardas levam *****. A China se torna a maior potência do planeta em seis anos.'),
 Nar('Ernani recebe a medalha, o título e uma cama limpa. Naquela noite, dorme profundamente, sem sonhos. Mao garantiu isso.'),
 {bg:'black'},
 Nar('Anos depois, acorda ao lado de uma mesa de café com duas xícaras. Uma está esfriando.'),
 Ern('...Eu esqueci de alguma coisa?'),
 Gl('milho','Você sempre pergunta isso, irmão.'),
 {end:'empire'}
];
S.end_exile=[
 {bg:'port'},
 Ern('Menino do Milho. Liga a moto.'),
 Mil('Eu sabia que você ia dizer isso.','smile'),
 Nar('A moto corta o porto de Xangai. O Tigre vai na frente. *****, enrolado num casaco, abraça Ernani pela cintura.'),
 Xx('E o país?','sad'),
 Ern('O país vai sobreviver sem a gente. Já provou que sabe contar.'),
 Nar('Eles atravessam a fronteira ao amanhecer. O Núcleo 02 é desligado à força por Lobão, a um custo político altíssimo. Mao, sozinho, assume o resto.'),
 Nar('Em algum lugar, dois homens dividem um chá numa mesa pequena. Ele esfria. Mas, dessa vez, nenhum dos dois esquece.'),
 {end:'exile'}
];
S.end_ash=[
 {bg:'tower'},{shake:30},{glitch:90},
 Nar('O Núcleo 02 entra em colapso. A onda de luz atravessa a torre, depois a avenida, depois o rio.'),
 Nar('Xangai escurece em quatro minutos. A Torre do Dragão apaga. Pela primeira vez em décadas, a cidade é só noite.'),
 Mao('...Eu prometi à minha mãe que ninguém voltaria a morrer no escuro.','sad'),
 Nar('A China ainda será uma potência. Mas lenta, sem aquele brilho, sem aquele homem.'),
 Nar('Ernani sobrevive. No bolso da camisa, uma foto instantânea de um café pequeno, duas xícaras, duas pessoas rindo.'),
 Nar('Todas as madrugadas, às três e sete, ele acorda com um nome na ponta da língua que o mundo não registra.'),
 {end:'ash'}
];
S.end_true=[
 {bg:'tower'},
 Ern('Mao. Olhe pra mim. Lembra do que sua mãe te pediu?'),
 Mao('...Que nenhum chinês morresse no escuro.'),
 Ern('E se o escuro for outra coisa? Um país que não pode ver o que fabrica?'),
 Nar('Mao olha para o Núcleo. Para ***** nos braços de Ernani. Para Lobão, para o Menino do Milho, para o tigre deitado.'),
 Mao('Abra os registros. Todos. Lobão, o Núcleo é seu. Com auditoria pública, universidades e vinte países. E quero que o nome de Qinghe fique escrito na primeira linha.','sad'),
 Lob('Esse é o primeiro dia em que eu tenho orgulho do meu trabalho.'),
 Nar('Lobão desliga o Núcleo por etapas, com o sinal de *****  como chave de sincronização. O cilindro apaga, em verde, devagar.'),
 {bg:'roof'},
 Nar('Meses depois. O sol nasce sobre Xangai. A China ainda cresce. Mas agora há luz em cada porto, e ninguém precisa de licença para olhar.'),
 Nar('O Memorial de Qinghe é inaugurado. Mao deposita uma flor, sozinho. Pela primeira vez, chora em público.'),
 {bg:'station'},
 Nar('3h07 da manhã. Um café pequeno. Duas xícaras. Uma foto instantânea, virada para cima.'),
 Xx('Está acordado?'),
 Ern('Agora estou.'),
 Xx('Eu estava pensando. Por que a gente continua, num mundo que...'),
 Ern('...lembra de você. Agora lembra.'),
 Nar('Ernani diz o nome. O áudio do café registra apenas um intervalo de silêncio. Mas *****  sorri.'),
 Nar('O observador também faz parte do experimento. E, desta vez, escolheu ficar.'),
 {glitch:30},
 Gl('milho','Valeu por lembrar, irmão. Eu guardo a foto.'),
 {end:'true'}
];


/* =========================================================
   LOOP PRINCIPAL
   ========================================================= */
const pg=$('pcv').getContext('2d');
function updPortrait(){
  if(!PORT.k||!$('dlg').classList.contains('on'))return;
  const tint=(mode==='battle'&&B&&B.phase===2&&PORT.k==='x')?'#40ff70':null;
  ACT.portrait(pg,PORT.k,96,PORT.expr,T,!!typing,tint);
}
function draw(dt){
  const g=ctx;
  g.save();
  if(shake>0){g.translate((Math.random()-.5)*shake*1.6,(Math.random()-.5)*shake*1.6);shake=Math.max(0,shake-.6)}
  if(view==='explore')drawExplore();
  else if(view==='battle')drawBattle(dt);
  else{const lift=(mode==='scene')?-44:0;FX.offset(lift);g.fillStyle='#04040a';g.fillRect(0,0,W,H);g.save();g.translate(0,lift);ART.draw(g,bgName,T,dt);g.restore()}
  if(view!=='bg')FX.offset(0);
  FX.update(dt);FX.draw(g);
  g.restore();
  FX.post(g,dt*1000,T);
  if(glitchT>0){
    for(let i=0;i<6;i++){const y=ri(H-30),h=6+ri(26);g.drawImage(cv,0,y,W,h,(Math.random()-.5)*60,y,W,h)}
    g.fillStyle='rgba(255,0,60,.10)';g.fillRect(0,0,W,H);
    if(Math.random()<.5){g.fillStyle='rgba(0,255,255,.12)';g.fillRect(0,ri(H),W,3+ri(8))}
    glitchT--;
  }
  if(view==='battle'&&B)drawBattleUI(g);
}
let last=0;
function frame(ts){
  const dt=Math.min(.05,(ts-(last||ts))/1000);dtS=dt;last=ts;T=ts/1000;
  if(mode==='explore'&&E)updateExplore(dt*1000);
  else if($('hint').style.display!=='none'&&mode!=='explore')$('hint').style.display='none';
  if(mode!=='title')updHud();
  FX.letterbox(mode==='scene'&&view==='bg');
  updPortrait();
  draw(dt);
  requestAnimationFrame(frame);
}
toTitle();
requestAnimationFrame(frame);
