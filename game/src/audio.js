(function(){
  let ctx=null, muted=false;
  function wake(){if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(C)ctx=new C();}if(ctx&&ctx.state==='suspended')ctx.resume();}
  function tone(freq,duration,type,volume){if(muted)return;wake();if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.72,ctx.currentTime+duration);g.gain.setValueAtTime(volume||.035,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration);}
  function toggle(){muted=!muted;return muted;}
  window.ReefAudio={wake,tone,turn(){tone(410,.12,'sine',.025)},deliver(){tone(660,.28,'sine',.04);setTimeout(()=>tone(880,.22,'sine',.026),70)},pulse(){tone(170,.48,'triangle',.05)},toggle,get muted(){return muted;}};
})();
