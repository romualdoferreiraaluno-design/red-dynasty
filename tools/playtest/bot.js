// Bot de playtest: roda UMA partida inteira dentro da página, com uma persona.
module.exports = function botSource(){
return async function(P){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const M={persona:P.name,lines:0,chars:0,says:[],choices:[],manage:[],battle:null,scenes:[],gaps:[],cosmeticChoices:0,totalChoices:0,iter:0,stuck:false,timeline:[]};
  let run=0,runChars=0,LAST=null,curScene='intro';
  const inter=(kind)=>{if(run>0)M.gaps.push({lines:run,chars:runChars,before:kind,scene:curScene});run=0;runChars=0};
  const _ss=showSay;showSay=function(n){const s=typeof n.t==='function'?n.t():n.t;M.lines++;M.chars+=(s||'').length;run++;runChars+=(s||'').length;return _ss(n)};
  const _sc=showChoice;showChoice=function(n){LAST=n;return _sc(n)};
  const _j=jump;jump=function(id){curScene=id;M.scenes.push(id);return _j(id)};
  const _se=startExplore;startExplore=function(m){inter('explore');return _se(m)};
  const _sm=startManage;startManage=function(n){inter('manage');return _sm(n)};
  const _sb=startBattle;startBattle=function(){inter('battle');return _sb()};
  const _sk=showEnding;showEnding=function(id){inter('end');M.ending=id;return _sk(id)};
  const rnd=()=>Math.random();
  const NUM=['love','mao','unrest','research','frag','money','infl','dupe','zee'];
  const snapG=()=>JSON.parse(JSON.stringify(G));
  const diff=(a,b)=>{const d={};NUM.forEach(k=>{if(a[k]!==b[k])d[k]=b[k]-a[k]});
    Object.keys(b.flags||{}).forEach(k=>{const x=a.flags[k]||0,y=b.flags[k]||0;if(typeof y==='number'&&x!==y)d['f_'+k]=y-x;else if(typeof y!=='number'&&x!==y)d['f_'+k]=1});
    if(b.seita)Object.keys(b.seita).forEach(k=>{if(a.seita[k]!==b.seita[k])d['s_'+k]=b.seita[k]-a.seita[k]});
    if(b.speech&&a.speech)Object.keys(b.speech).forEach(k=>{if(a.speech[k]!==b.speech[k])d['sp_'+k]=b.speech[k]-a.speech[k]});
    return d};
  const restore=s=>{G=Object.assign(fresh(),JSON.parse(s))};
  const W=Object.assign({etica:0,hid:0,secret:0,f_etica:0},P.w||{});
  const scoreD=d=>{let s=0;for(const k in d){const kk=k.replace(/^f_/,'');let w=W[kk];if(w===undefined)w=(k==='dupe'||k==='zee')?.4:0;s+=w*d[k]}return s};
  const pick=(n,scores,style)=>{
    if(style==='first')return 0;if(style==='last')return n-1;if(style==='mid')return Math.min(1,n-1);if(style==='random')return Math.floor(rnd()*n);
    let b=0,bs=-1e9;scores.forEach((s,i)=>{const v=s+(rnd()-.5)*(P.noise||.3);if(v>bs){bs=v;b=i}});return b};
  const explore=()=>{const mp=MAPS[E.map];for(let y=0;y<11;y++)for(let x=0;x<20;x++){const g=mp.rows[y][x];if(mp.items[g]){const it=mp.items[g];const key=E.map+(it.multi?x+','+y:it.id);if(!G.found[key]){for(const [dx,dy] of [[-1,0],[1,0],[0,1],[0,-1]]){E.x=x+dx;E.y=y+dy;if(!solidAt(E.x,E.y)){E.face=[-dx,-dy];if(nearItem()){exploreAct();return true}}}}}}return false};
  let lastSig='',same=0;
  while(M.iter<30000){
    M.iter++;
    if(mode==='end')break;
    const sig=mode+'|'+waiting+'|'+G.scene+'|'+queue.length+'|'+(typing?1:0)+'|'+(MG?MG.turn:0)+'|'+(B?B.i+'/'+B.hp+'/'+B.grip:'');
    if(sig===lastSig){same++;if(same>600){M.stuck={mode,waiting,scene:G.scene,sig};break}}else{same=0;lastSig=sig}
    if(typing&&typeFull){typeFull();await sleep(0);continue}
    if(mode==='manage'){
      const a=acts(),s0=JSON.stringify(G),sc=[];
      for(let i=0;i<a.length;i++){if(G.money<a[i].c){sc.push(-1e9);continue}
        const snap=JSON.stringify(G);G.money-=a[i].c;a[i].f();G.money+=G.dupe*12+G.zee*10;const d=diff(JSON.parse(snap),G);restore(snap);sc.push(scoreD(d)+(P.wealth?d.money*P.wealth:0))}
      let i=pick(a.length,sc,P.manageStyle);if(G.money<a[i].c){i=sc.indexOf(Math.max(...sc))}
      const before=snapG();manageDo(i);const after=snapG();
      M.manage.push({act:a[i].n,cost:a[i].c,before:{unrest:before.unrest,money:before.money,infl:before.infl,research:before.research},after:{unrest:after.unrest,money:after.money,infl:after.infl,research:after.research},fb:MG?MG.fb:''});
      await sleep(0);continue}
    if(mode==='explore'){if(!explore()){M.stuck={explore:true};break}await sleep(0);continue}
    if(mode==='battle'){
      if(waiting==='choice'){
        if(!M.battle)M.battle={turns:0,log:[]};
        const a=B.party[B.i],names=ACTS[a.k].map(x=>x.n),ch=$('choices').children;let idx=0;
        const has=n=>names.findIndex(x=>x.includes(n));
        const st=P.battleStyle;
        if(st==='aggr')idx=0;else if(st==='last')idx=names.length-1;else if(st==='rand')idx=Math.floor(rnd()*names.length);
        else{ // smart / defensive
          if(a.k==='lobao'){idx=B.analyzed?has('Decodificar'):has('Analisar');if(B.charge&&B.shield===0)idx=has('Escudo')}
          if(a.k==='milho'){idx=has('Carga');if(st==='defensive'||(B.charge&&!B.blind))idx=has('Lançar')}
          if(a.k==='ernani'){idx=G.love>=5?has('Falar'):has('Tiro');if(B.charge&&!B.cover)idx=has('Cobertura')}
          if(idx<0)idx=0}
        M.battle.turns++;M.battle.log.push({who:a.k,act:names[idx],hp:B.hp,grip:B.grip,party:B.party.map(p=>p.hp)});
        ch[idx].click();await sleep(0);continue}
      if(waiting==='say'){step();await sleep(0);continue}
      await sleep(4);continue}
    if(waiting==='card'){closeCard();await sleep(0);continue}
    if(waiting==='say'){step();await sleep(0);continue}
    if(waiting==='choice'){
      const n=LAST,vis=n.ch.filter(o=>!(o.if&&!o.if())),sc=[],ds=[];
      vis.forEach(o=>{const snap=JSON.stringify(G);let d={};try{if(o.fx)o.fx();d=diff(JSON.parse(snap),G)}catch(e){d={err:1}}restore(snap);ds.push(d);sc.push(scoreD(d)+(o.go?0:0))});
      const allZero=ds.every(d=>Object.keys(d).length===0&&true)&&!vis.some(o=>o.go);
      const same=new Set(ds.map(d=>JSON.stringify(d))).size===1;
      M.totalChoices++;if(allZero)M.cosmeticChoices++;
      inter('choice');
      const i=pick(vis.length,sc,P.style);
      M.choices.push({scene:curScene,q:(n.q||'').slice(0,60),opts:vis.map((o,k)=>({t:o.t.slice(0,50),d:ds[k],go:o.go||null})),picked:i,allZero,identical:same});
      $('choices').children[i].click();await sleep(0);continue}
    await sleep(2);
  }
  M.final={love:G.love,mao:G.mao,unrest:G.unrest,research:G.research,frag:G.frag,money:G.money,infl:G.infl,dupe:G.dupe,zee:G.zee,seita:G.seita,flags:G.flags,canTrue:canTrue(),fight:G.flags.fight};
  M.ending=M.ending||null;if(run>0)M.gaps.push({lines:run,chars:runChars,before:'end',scene:curScene});
  if(M.battle){M.battle.final={hp:B.hp,grip:B.grip,party:B.party.map(p=>p.hp)}}
  return M;
}}
