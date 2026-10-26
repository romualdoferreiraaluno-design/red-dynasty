const {chromium}=require('playwright');const fs=require('fs');
const botSrc=require('./bot.js')().toString();
const PERS=require('./personas.js');
(async()=>{
  const only=process.argv[2]?process.argv[2].split(',').map(Number):null;
  const b=await chromium.launch({args:['--use-gl=swiftshader']});
  const list=PERS.map((p,i)=>({...p,id:i+1})).filter(p=>!only||only.includes(p.id));
  let idx=0;const CONC=4;
  async function worker(){
    while(idx<list.length){const P=list[idx++];
      const pg=await b.newPage({viewport:{width:960,height:540}});
      const errs=[];pg.on('pageerror',e=>errs.push(e.message));
      await pg.goto('file:///home/claude/work/rpg/index.html');await pg.waitForTimeout(300);
      await pg.evaluate(()=>{FX.set({level:'low',reduce:true})});await pg.click('#bNew');
      const t0=Date.now();
      let M;try{M=await pg.evaluate(`(${botSrc})(${JSON.stringify(P)})`)}catch(e){M={persona:P.name,crash:String(e)}}
      M.errs=errs;M.wall=(Date.now()-t0)/1000;M.id=P.id;
      fs.writeFileSync(`out/p${String(P.id).padStart(2,'0')}.json`,JSON.stringify(M));
      console.log(P.id,P.name,'->',M.ending,'lines',M.lines,'stuck',JSON.stringify(M.stuck||false),'errs',errs.length,'t',M.wall.toFixed(0)+'s');
      await pg.close();}}
  fs.mkdirSync('out',{recursive:true});
  await Promise.all(Array.from({length:CONC},worker));await b.close();
})();
