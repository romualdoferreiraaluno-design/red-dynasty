'use strict';
/* =========================================================
   AUDIO — sintetizado (WebAudio). Sem arquivos.
   Música generativa em escala pentatônica chinesa por clima,
   ambiência (chuva, laboratório), voz em "blips" e efeitos.
   Se existir assets/audio/<nome>.mp3, ele pode ser ligado depois.
   ========================================================= */
const AUDIO=(()=>{
  let ac=null,master,musG,sfxG,ambG,noiseBuf,on=true,vol=.55,started=false;
  try{const s=JSON.parse(localStorage.getItem('chinaRPG_opts')||'{}');if(s.mute)on=false;if(s.vol!==undefined)vol=s.vol}catch(e){}
  const SC={calm:[0,2,4,7,9],dark:[0,3,5,7,10],sad:[0,2,3,7,8]};
  const MOODS={
    title:{scale:'calm',root:50,bpm:62,pad:1,lead:1,perc:0,ambience:null},
    office:{scale:'calm',root:50,bpm:68,pad:1,lead:1,perc:0,ambience:'dust'},
    city:{scale:'calm',root:52,bpm:84,pad:1,lead:1,perc:1,ambience:'rain'},
    port:{scale:'calm',root:48,bpm:76,pad:1,lead:1,perc:1,ambience:'sea'},
    lab:{scale:'dark',root:41,bpm:70,pad:1,lead:0,perc:0,ambience:'hum'},
    station:{scale:'sad',root:45,bpm:56,pad:1,lead:1,perc:0,ambience:'rain'},
    roof:{scale:'sad',root:50,bpm:60,pad:1,lead:1,perc:0,ambience:'rain'},
    qinghe:{scale:'dark',root:40,bpm:48,pad:1,lead:0,perc:0,ambience:'wind'},
    tower:{scale:'dark',root:38,bpm:120,pad:1,lead:0,perc:2,ambience:'hum'},
    battle:{scale:'dark',root:38,bpm:132,pad:1,lead:1,perc:2,ambience:'hum'},
    black:{scale:'dark',root:40,bpm:50,pad:1,lead:0,perc:0,ambience:null}
  };
  let mood=null,nextT=0,step=0,sched=null,ambNode=null,ambKind=null;
  const mtof=n=>440*Math.pow(2,(n-69)/12);
  function init(){
    if(ac)return;
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    ac=new C();master=ac.createGain();master.gain.value=on?vol:0;master.connect(ac.destination);
    musG=ac.createGain();musG.gain.value=.55;musG.connect(master);sfxG=ac.createGain();sfxG.gain.value=.8;sfxG.connect(master);ambG=ac.createGain();ambG.gain.value=.5;ambG.connect(master);
    noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    // reverb simples (delay com feedback)
    const dl=ac.createDelay(1);dl.delayTime.value=.32;const fb=ac.createGain();fb.gain.value=.38;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;
    dl.connect(lp);lp.connect(fb);fb.connect(dl);musG.connect(dl);lp.connect(master);
    started=true;sched=setInterval(tick,50);
  }
  function resume(){init();if(ac&&ac.state==='suspended')ac.resume()}
  function env(g,t,a,d,s,r,peak,dur){g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.linearRampToValueAtTime(peak*s,t+a+d);g.gain.setValueAtTime(peak*s,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+r)}
  function tone(f,t,dur,type,peak,dest,o){
    o=o||{};const os=ac.createOscillator(),g=ac.createGain();os.type=type;os.frequency.setValueAtTime(f,t);
    if(o.slide)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.slide),t+dur);
    if(o.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=5.2;lg.gain.value=f*.012;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+dur+.5)}
    env(g,t,o.a||.005,o.d||.1,o.s||.4,o.r||.2,peak,dur);os.connect(g);
    if(o.lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;g.connect(fl);fl.connect(dest||musG)}else g.connect(dest||musG);
    os.start(t);os.stop(t+dur+(o.r||.2)+.05);
  }
  function noise(t,dur,peak,fq,type,dest,o){
    o=o||{};const s=ac.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=ac.createBiquadFilter();f.type=type||'bandpass';f.frequency.setValueAtTime(fq,t);if(o.slide)f.frequency.exponentialRampToValueAtTime(o.slide,t+dur);f.Q.value=o.q||1;const g=ac.createGain();env(g,t,o.a||.002,o.d||.05,o.s||.5,o.r||.1,peak,dur);s.connect(f);f.connect(g);g.connect(dest||sfxG);s.start(t);s.stop(t+dur+(o.r||.1)+.05);
  }
  /* ---- música ---- */
  function note(deg,oct){const sc=SC[mood.scale];const i=((deg%5)+5)%5,o=Math.floor(deg/5);return mood.root+sc[i]+12*(o+(oct||0))}
  let melody=[0,2,1,3,2,4,3,1];let chord=0;
  function tick(){
    if(!ac||!mood||!on)return;const sp=60/mood.bpm/2;
    while(nextT<ac.currentTime+.25){
      if(nextT<ac.currentTime-.2)nextT=ac.currentTime;
      const t=nextT,s=step;
      if(s%16===0){chord=[0,3,2,4][(s/16|0)%4];
        if(mood.pad){[0,2,4].forEach(k=>{tone(mtof(note(chord+k,-1)),t,sp*14,'sine',.07,musG,{a:1.2,d:2,s:.7,r:2})});tone(mtof(note(chord,-2)),t,sp*14,'triangle',.1,musG,{a:.6,d:1,s:.8,r:1.5,lp:400})}}
      if(mood.lead&&s%2===0&&Math.random()<.62){const m=melody[(s/2|0)%8]+(Math.random()<.2?1:0)+chord;tone(mtof(note(m,1)),t,sp*1.6,'sawtooth',.045,musG,{a:.03,d:.15,s:.5,r:.3,lp:2200,vib:1})}
      if(mood.lead&&s%4===0&&Math.random()<.3){tone(mtof(note(chord+Math.floor(Math.random()*5),2)),t,.15,'triangle',.05,musG,{a:.002,d:.08,s:.1,r:.4})}
      if(mood.perc){if(s%4===0)tone(90,t,.14,'sine',mood.perc>1?.5:.3,sfxG,{slide:40,a:.002,d:.1,s:.1,r:.1});if(mood.perc>1&&s%4===2)noise(t,.08,.15,6000,'highpass',musG);if(s%2===1&&mood.perc>1)noise(t,.03,.07,9000,'highpass',musG);if(s%8===6&&mood.perc)noise(t,.12,.18,1200,'bandpass',musG)}
      nextT+=sp;step++;
    }
  }
  function setMood(name){
    if(!ac)return;const m=MOODS[name]||MOODS.black;if(mood===m)return;mood=m;step=0;nextT=ac.currentTime+.1;
    setAmb(m.ambience);
  }
  function setAmb(kind){
    if(kind===ambKind)return;ambKind=kind;
    if(ambNode){const old=ambNode;old.g.gain.linearRampToValueAtTime(0,ac.currentTime+1.2);setTimeout(()=>{try{old.stop()}catch(e){}},1500);ambNode=null}
    if(!kind||kind==='dust')return;
    const s=ac.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=ac.createBiquadFilter();const g=ac.createGain();g.gain.value=0;
    let nodes=[];
    if(kind==='rain'){f.type='highpass';f.frequency.value=1800;g.gain.linearRampToValueAtTime(.16,ac.currentTime+1.5)}
    else if(kind==='sea'){f.type='lowpass';f.frequency.value=600;g.gain.linearRampToValueAtTime(.2,ac.currentTime+1.5);const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=.12;lg.gain.value=.12;l.connect(lg);lg.connect(g.gain);l.start();nodes.push(l)}
    else if(kind==='wind'){f.type='bandpass';f.frequency.value=500;f.Q.value=2;g.gain.linearRampToValueAtTime(.12,ac.currentTime+1.5);const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=.2;lg.gain.value=300;l.connect(lg);lg.connect(f.frequency);l.start();nodes.push(l)}
    else if(kind==='hum'){f.type='lowpass';f.frequency.value=180;g.gain.linearRampToValueAtTime(.35,ac.currentTime+1.5);const o=ac.createOscillator(),og=ac.createGain();o.type='sawtooth';o.frequency.value=55;og.gain.value=.05;o.connect(og);og.connect(ambG);o.start();nodes.push(o)}
    s.connect(f);f.connect(g);g.connect(ambG);s.start();
    ambNode={g,stop(){s.stop();nodes.forEach(n=>{try{n.stop()}catch(e){}})}};
  }
  /* ---- efeitos ---- */
  const VOICE={mao:[110,'sawtooth'],ernani:[150,'square'],milho:[210,'square'],lobao:[130,'triangle'],x:[80,'sawtooth']};
  function blip(k,i){if(!ac||!on)return;const v=VOICE[k]||[170,'square'];const t=ac.currentTime;tone(v[0]*(1+((i*7)%5)*.07),t,.045,v[1],.07,sfxG,{a:.002,d:.02,s:.3,r:.02,lp:1800})}
  const sfx={
    click(){const t=ac.currentTime;tone(660,t,.05,'square',.06,sfxG,{lp:2500,r:.05})},
    choose(){const t=ac.currentTime;tone(440,t,.06,'triangle',.1,sfxG);tone(660,t+.07,.1,'triangle',.1,sfxG)},
    hit(){const t=ac.currentTime;noise(t,.12,.5,800,'lowpass',sfxG);tone(120,t,.18,'sine',.5,sfxG,{slide:40})},
    shoot(){const t=ac.currentTime;noise(t,.1,.5,3500,'highpass',sfxG,{slide:900});tone(220,t,.12,'square',.2,sfxG,{slide:60});noise(t+.05,.25,.1,500,'lowpass',sfxG)},
    explosion(){const t=ac.currentTime;noise(t,.9,.7,700,'lowpass',sfxG,{slide:80,r:.4});tone(70,t,.7,'sine',.7,sfxG,{slide:25})},
    shield(){const t=ac.currentTime;tone(500,t,.5,'sine',.12,sfxG,{slide:1200});tone(750,t,.5,'triangle',.08,sfxG,{slide:1800})},
    heal(){const t=ac.currentTime;[0,4,7,12].forEach((n,i)=>tone(mtof(72+n),t+i*.07,.2,'triangle',.1,sfxG))},
    charge(){const t=ac.currentTime;tone(80,t,1.6,'sawtooth',.18,sfxG,{slide:900,lp:900,a:.4});noise(t,1.6,.15,400,'bandpass',sfxG,{slide:5000})},
    nuclear(){const t=ac.currentTime;noise(t,1.4,.8,500,'lowpass',sfxG,{slide:60,r:.8});tone(55,t,1.2,'sine',.8,sfxG,{slide:22})},
    gas(){const t=ac.currentTime;noise(t,.9,.25,2000,'bandpass',sfxG,{slide:600,a:.2})},
    glitch(){const t=ac.currentTime;for(let i=0;i<5;i++)noise(t+i*.04,.04,.25,200+Math.random()*3000,'bandpass',sfxG,{q:8});tone(1800,t,.2,'square',.05,sfxG,{slide:90})},
    thud(){const t=ac.currentTime;tone(60,t,.4,'sine',.6,sfxG,{slide:28})},
    tiger(){const t=ac.currentTime;tone(160,t,.5,'sawtooth',.2,sfxG,{slide:70,lp:700,vib:1});noise(t,.4,.1,400,'bandpass',sfxG)},
    ok(){const t=ac.currentTime;tone(523,t,.1,'triangle',.1,sfxG);tone(784,t+.08,.18,'triangle',.1,sfxG)},
    end(){const t=ac.currentTime;[0,7,12,16,19].forEach((n,i)=>tone(mtof(62+n),t+i*.15,1.4,'sine',.1,musG,{a:.1,r:1}))}
  };
  function play(n,a,b){if(!ac||!on)return;try{n==='blip'?blip(a,b):sfx[n]&&sfx[n]()}catch(e){}}
  function toggle(){on=!on;if(master)master.gain.value=on?vol:0;save();return on}
  function setVol(v){vol=v;if(master&&on)master.gain.value=v;save()}
  function save(){try{const s=JSON.parse(localStorage.getItem('chinaRPG_opts')||'{}');s.mute=!on;s.vol=vol;localStorage.setItem('chinaRPG_opts',JSON.stringify(s))}catch(e){}}
  return {resume,setMood,play,toggle,get on(){return on},get started(){return started},setVol,get vol(){return vol}};
})();
