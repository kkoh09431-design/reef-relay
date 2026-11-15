(function () {
  const stages = [
    { name: 'The nursery shelf', depth: '024m', goal: 4, speed: .16, layout: 0 },
    { name: 'Glass kelp passage', depth: '061m', goal: 5, speed: .17, layout: 1 },
    { name: 'Lantern drift', depth: '108m', goal: 5, speed: .18, layout: 2 },
    { name: 'The turning blue', depth: '177m', goal: 6, speed: .19, layout: 3 },
    { name: 'Heart of the reef', depth: '240m', goal: 6, speed: .2, layout: 4 }
  ];
  const layouts = [
    { vanes: [{ x:.48,y:.52,dir:0 }], gardens:[{x:.85,y:.52,color:'amber',shape:'fan'}], spawns:[[.12,.52,'amber']], currents:[] },
    { vanes:[{x:.32,y:.52,dir:1},{x:.32,y:.30,dir:0},{x:.32,y:.74,dir:0}], gardens:[{x:.88,y:.30,color:'amber',shape:'fan'},{x:.88,y:.74,color:'mint',shape:'cup'}], spawns:[[.08,.52,'amber'],[.08,.52,'mint']], currents:[] },
    { vanes:[{x:.30,y:.52,dir:1},{x:.30,y:.29,dir:0},{x:.30,y:.75,dir:0}], gardens:[{x:.91,y:.29,color:'mint',shape:'cup'},{x:.91,y:.75,color:'amber',shape:'fan'}], spawns:[[.07,.52,'amber'],[.07,.52,'mint']], currents:[] },
    { vanes:[{x:.24,y:.52,dir:1},{x:.24,y:.28,dir:0},{x:.24,y:.76,dir:0},{x:.57,y:.28,dir:1},{x:.57,y:.76,dir:3}], gardens:[{x:.57,y:.16,color:'amber',shape:'fan'},{x:.57,y:.86,color:'mint',shape:'cup'}], spawns:[[.06,.52,'amber'],[.06,.52,'mint']], currents:[] },
    { vanes:[{x:.20,y:.52,dir:1},{x:.20,y:.28,dir:0},{x:.48,y:.28,dir:1}], gardens:[{x:.48,y:.16,color:'mint',shape:'cup'},{x:.48,y:.86,color:'amber',shape:'fan'}], spawns:[[.05,.52,'amber'],[.05,.52,'mint']], currents:[] }
  ];
  const dirs=[[1,0],[0,-1],[-1,0],[0,1]];
  function createGame(){return{mode:'title',stage:0,score:0,streak:0,bestStreak:0,oxygen:100,selected:0,vanes:[],spores:[],particles:[],elapsed:0,tideTime:0,spawnTimer:.65,spawnIndex:0,pulse:1,pulseCooldown:0,transition:0,message:'A quiet current is finding its way.',runScore:0,deliveredTotal:0,deliveredByColor:{amber:0,mint:0},seed:781};}
  function random(g){g.seed=(g.seed*1664525+1013904223)>>>0;return g.seed/4294967296;}
  function loadStage(g,n){g.stage=n;g.score=0;g.elapsed=0;g.tideTime=0;g.spawnTimer=.65;g.spawnIndex=0;g.selected=0;g.transition=0;g.pulse=1;g.pulseCooldown=0;g.vanes=layouts[n].vanes.map((v,i)=>({x:v.x,y:v.y,dir:v.dir,baseDir:v.dir,index:i,flash:0}));g.spores=[];g.particles=[];g.message='Read each spore color and the nearby exit arrows.';return stages[n];}
  function start(g){g.runScore=0;g.deliveredTotal=0;g.deliveredByColor={amber:0,mint:0};g.streak=0;g.bestStreak=0;g.oxygen=100;g.mode='playing';loadStage(g,0);}
  function turn(g,index,delta){if(g.mode!=='playing'||!g.vanes[index])return false;const v=g.vanes[index];v.dir=(v.dir-delta+4)%4;v.flash=.3;g.selected=index;g.message=delta>0?'Vane turned clockwise.':'Vane turned counterclockwise.';return true;}
  function pulse(g){if(g.mode!=='playing'||g.pulseCooldown>0)return false;g.pulse=0;g.pulseCooldown=7;g.message='A soft pulse nudges every spore forward.';for(const p of g.spores){p.vx+=.09;p.vy+=p.y<.5?.035:-.035;p.glow=.7;}return true;}
  function spawn(g){const seeds=layouts[g.stage].spawns,index=g.spawnIndex++%seeds.length,seed=seeds[index];g.spores.push({x:seed[0],y:seed[1],color:seed[2],vx:stages[g.stage].speed,vy:0,r:.016,glow:0,age:0,spin:random(g)*6,well:-1,insideWell:-1});}
  function loseOxygen(g,amount,message){g.oxygen=Math.max(0,g.oxygen-amount);g.streak=0;g.message=message;}
  function deliver(g,color){g.score++;g.runScore+=100+Math.min(g.streak,8)*25;g.streak++;g.bestStreak=Math.max(g.bestStreak,g.streak);g.deliveredTotal++;g.deliveredByColor[color]++;g.message=g.streak>1?'Beautiful weave! '+g.streak+' in a row.':'A garden blooms. Nice route!';}
  function step(g,dt){
    if(g.mode!=='playing')return;
    if(g.oxygen<=0){g.mode='lost';g.message='The current slipped away. The reef will wait.';return;}
    dt=Math.min(dt,.04);g.elapsed+=dt;g.tideTime+=dt;g.pulseCooldown=Math.max(0,g.pulseCooldown-dt);g.pulse=Math.min(1,g.pulse+dt/7);
    const layout=layouts[g.stage],spec=stages[g.stage];g.spawnTimer-=dt;if(g.spawnTimer<=0){spawn(g);g.spawnTimer=5.2;}
    const keep=[];
    for(const p of g.spores){p.age+=dt;p.glow=Math.max(0,p.glow-dt);p.spin+=dt*1.2;
      if(p.age>20){loseOxygen(g,4,'A spore drifted too long. Bring it through a bright well.');continue;}
      let entered=-1;
      for(let i=0;i<g.vanes.length;i++){const v=g.vanes[i],d=Math.hypot(p.x-v.x,p.y-v.y);if(d<.045){entered=i;break;}}
      if(entered>=0&&p.insideWell!==entered){const v=g.vanes[entered],vec=dirs[v.dir];p.vx=vec[0]*spec.speed;p.vy=vec[1]*spec.speed;p.well=entered;p.insideWell=entered;v.flash=.24;}
      if(p.insideWell>=0){const v=g.vanes[p.insideWell];if(Math.hypot(p.x-v.x,p.y-v.y)>.075)p.insideWell=-1;}
      for(const c of layout.currents||[]){const d=Math.hypot(p.x-c.x,p.y-c.y);if(d<c.r){const a=Math.atan2(p.y-c.y,p.x-c.x);p.vx+=Math.cos(a)*dt*.35;p.vy+=Math.sin(a)*dt*.35;}}
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      p.y=Math.max(.14,Math.min(.87,p.y));
      let hit=null;for(const bed of layout.gardens)if(Math.hypot(p.x-bed.x,p.y-bed.y)<.052)hit=bed;
      if(hit){if(hit.color===p.color)deliver(g,p.color);else{loseOxygen(g,8,'Wrong garden. Oxygen lost; the spore loops back.');p.x=Math.max(.08,hit.x-.08);p.vx=-spec.speed*.75;p.vy=0;p.well=-1;p.insideWell=-1;keep.push(p);}continue;}
      if(p.x>1.04){loseOxygen(g,7,'A spore slipped past the garden.');continue;}
      if(p.x<.045){p.vx=Math.abs(p.vx);p.well=-1;p.insideWell=-1;}
      keep.push(p);
    }
    g.spores=keep;for(const v of g.vanes)v.flash=Math.max(0,v.flash-dt);
    if(g.oxygen<=0){g.mode='lost';g.message='Oxygen depleted. The reef will wait.';return;}
    if(g.score>=spec.goal){if(g.stage===stages.length-1){g.mode='won';g.message='The reef is glowing with new life.';}else{g.mode='transition';g.transition=2.2;g.message='Tide complete. The reef opens deeper.';}}
  }
  function advance(g,dt){if(g.mode!=='transition')return;g.transition-=dt;if(g.transition<=0){g.mode='playing';loadStage(g,g.stage+1);}}
  window.ReefModel={stages,layouts,dirs,createGame,start,loadStage,turn,pulse,step,advance};
})();
