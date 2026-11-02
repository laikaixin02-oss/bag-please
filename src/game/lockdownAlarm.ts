/** Repeating two-tone emergency bed: audible beneath the English PA announcement. */
export function startLockdownAlarm(context: AudioContext): {stop:()=>void;setDucked:(ducked:boolean)=>void} {
  const master=context.createGain();master.gain.value=.7;master.connect(context.destination);
  const sources=new Set<OscillatorNode>();let stopped=false;
  const pair=()=>{
    if(stopped)return;
    [587.33,440].forEach((frequency,i)=>{
      const source=context.createOscillator(),gain=context.createGain(),now=context.currentTime+i*.56;
      source.type='triangle';source.frequency.value=frequency;
      // Hold each tone instead of letting a short decay vanish under the voice.
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.linearRampToValueAtTime(.085,now+.025);
      gain.gain.setValueAtTime(.085,now+.45);
      gain.gain.exponentialRampToValueAtTime(.0001,now+.54);
      source.connect(gain);gain.connect(master);source.start(now);source.stop(now+.55);sources.add(source);
      source.onended=()=>{sources.delete(source);source.disconnect();gain.disconnect();};
    });
  };
  pair();const timer=setInterval(pair,1140);
  return {
    // A mild 4.4 dB reduction keeps the alert present while Daniel speaks.
    setDucked:(ducked)=>{if(!stopped)master.gain.setTargetAtTime(ducked ? .42 : .7,context.currentTime,.08);},
    stop:()=>{if(stopped)return;stopped=true;clearInterval(timer);sources.forEach(source=>{try{source.stop()}catch{/* Already ended. */}});master.disconnect();}
  };
}
