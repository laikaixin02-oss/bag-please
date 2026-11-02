/** Small, original procedural sounds; no network assets or borrowed melodies. */
function note(context: AudioContext, frequency: number, start: number, duration: number, volume: number, type: OscillatorType = 'triangle', destination: AudioNode = context.destination) {
  const oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.type = type; oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + .004);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain); gain.connect(destination);
  oscillator.start(start); oscillator.stop(start + duration + .01);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  return oscillator;
}
export function playKeyboard(context: AudioContext, index: number) {
  const now = context.currentTime;
  note(context, [225, 265, 210, 245][index % 4], now, .027, .035, 'triangle');
  const source = context.createBufferSource(), gain = context.createGain();
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * .018), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i=0; i<data.length; i++) data[i] = (Math.random()*2-1)*Math.exp(-i/(context.sampleRate*.003));
  source.buffer=buffer; gain.gain.value=.025; source.connect(gain); gain.connect(context.destination); source.start();
  source.onended=()=>{ source.disconnect(); gain.disconnect(); };
}
export function playMoney(context: AudioContext): () => void {
  const now=context.currentTime, sources: OscillatorNode[]=[];
  // A clear register opening, multiple falling coins, then the payment-confirmation chime.
  sources.push(note(context,180,now,.10,.16,'triangle'));
  [0.08,.20,.33,.48,.62].forEach((offset,i)=> {
    sources.push(note(context,[1568,2093,1760,2349,2637][i],now+offset,.23,.19,'sine'));
    sources.push(note(context,[3136,4186,3520,4698,5274][i],now+offset,.10,.045,'sine'));
  });
  sources.push(note(context,659.25,now+.83,.20,.14,'triangle'));
  sources.push(note(context,987.77,now+1.02,.34,.14,'triangle'));
  return ()=>sources.forEach(source=>{try { source.stop(); } catch { /* Already ended. */ }});
}
export function startAirportAmbience(context: AudioContext): { stop: () => void; duck: (seconds: number) => void } {
  const master=context.createGain(), filter=context.createBiquadFilter(), noise=context.createBufferSource();
  const buffer=context.createBuffer(1,context.sampleRate*4,context.sampleRate), data=buffer.getChannelData(0);
  let smooth=0;
  for(let i=0;i<data.length;i++){smooth=(smooth+(Math.random()*2-1)*.035)/1.035;data[i]=smooth;}
  noise.buffer=buffer; noise.loop=true;
  filter.type='lowpass'; filter.frequency.value=1100;
  master.gain.setValueAtTime(0,context.currentTime); master.gain.linearRampToValueAtTime(.055,context.currentTime+1.2);
  noise.connect(filter);filter.connect(master);master.connect(context.destination);noise.start();
  const air=context.createOscillator(), airGain=context.createGain();air.type='sine';air.frequency.value=62;airGain.gain.value=.012;
  air.connect(airGain);airGain.connect(master);air.start();
  let stopped=false;const chimes:OscillatorNode[]=[];
  const chime=()=>{if(stopped)return;const now=context.currentTime;[523.25,659.25,392].forEach((f,i)=>chimes.push(note(context,f,now+i*.28,.65,.045,'sine',master)));};
  const first=setTimeout(chime,500), loop=setInterval(chime,18000);
  return {
    duck:(seconds)=>{if(stopped)return;const now=context.currentTime;master.gain.cancelScheduledValues(now);master.gain.setTargetAtTime(.012,now,.015);master.gain.setTargetAtTime(.055,now+seconds,.15);},
    stop:()=>{stopped=true;clearTimeout(first);clearInterval(loop);noise.stop();air.stop();chimes.forEach(n=>{try{n.stop()}catch{/* Already ended. */}});[noise,air,airGain,filter,master].forEach(n=>n.disconnect());}
  };
}
export const EVACUATION_TEXT='Attention, this is a security emergency. Leave the terminal immediately and follow staff instructions.';
export type BroadcastState='off'|'waiting'|'speaking'|'unavailable';
function startSpeechEvacuationBroadcast(onState:(state:BroadcastState)=>void,onDuck:(duck:boolean)=>void):()=>void {
  if(!('speechSynthesis' in window)){onState('unavailable');return ()=>{};}
  const synth=window.speechSynthesis;let stopped=false, utterance:SpeechSynthesisUtterance|null=null;
  let timer:ReturnType<typeof setTimeout>, watchdog:ReturnType<typeof setTimeout>;
  const speak=()=>{
    if(stopped)return;
    const daniel=synth.getVoices().find(v=>/Daniel/i.test(v.name)&&v.lang.toLowerCase().startsWith('en'));
    const voice=daniel ?? synth.getVoices().find(v=>v.lang.toLowerCase().startsWith('en'));
    if(!voice){onState('unavailable');return;}
    utterance=new SpeechSynthesisUtterance(EVACUATION_TEXT);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=1.12;utterance.pitch=.98;utterance.volume=.85;
    utterance.onstart=()=>{if(!stopped){clearTimeout(watchdog);onDuck(true);onState('speaking');}};
    utterance.onend=()=>{if(!stopped){clearTimeout(watchdog);onDuck(false);onState('waiting');timer=setTimeout(speak,22000);}};
    utterance.onerror=()=>{if(!stopped){clearTimeout(watchdog);onDuck(false);onState('unavailable');}};
    synth.speak(utterance);
    watchdog=setTimeout(()=>{if(!stopped){synth.cancel();onDuck(false);onState('unavailable');}},5000);
  };
  onState('waiting');timer=setTimeout(speak,1400);
  const voicesChanged=()=>{if(!stopped&&!utterance){clearTimeout(timer);timer=setTimeout(speak,100);}};
  synth.addEventListener('voiceschanged',voicesChanged);
  return ()=>{stopped=true;clearTimeout(timer);clearTimeout(watchdog);synth.removeEventListener('voiceschanged',voicesChanged);synth.cancel();onDuck(false);};
}

export type PassengerVoiceState = 'off' | 'loading' | 'playing' | 'finished' | 'unavailable';
/** One original cartoon greeting per passenger; identity is independent of threat status. */
export function playPassengerVoice(context: AudioContext, passengerId: string, onState: (state: PassengerVoiceState) => void): () => void {
  let stopped = false, source: AudioBufferSourceNode | null = null;
  const gain = context.createGain(); gain.gain.value = .55; gain.connect(context.destination);
  const controller = new AbortController(); onState('loading');
  void fetch(import.meta.env.BASE_URL + `audio/passengers/passenger-${passengerId}.wav`, {signal:controller.signal})
    .then(response => { if (!response.ok) throw new Error('Passenger voice unavailable'); return response.arrayBuffer(); })
    .then(bytes => context.decodeAudioData(bytes))
    .then(buffer => {
      if (stopped) return;
      source = context.createBufferSource(); source.buffer = buffer; source.connect(gain);
      source.onended = () => { source?.disconnect(); if (!stopped) onState('finished'); };
      source.start(); onState('playing');
    }).catch(() => { if (!stopped) onState('unavailable'); });
  return () => { stopped = true; controller.abort(); if (source) { source.onended = null; try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); } gain.disconnect(); };
}

export type FlyoverState = 'off' | 'loading' | 'playing' | 'finished' | 'unavailable';
/** The selected airport A: a short two-note boarding chime, played once. No speech. */
export function startTitleFlyover(context: AudioContext, onState: (state: FlyoverState) => void): () => void {
  let stopped = false, source: AudioBufferSourceNode | null = null;
  const gain = context.createGain(); gain.gain.value = .8; gain.connect(context.destination);
  const controller = new AbortController();
  onState('loading');
  void fetch(import.meta.env.BASE_URL + 'audio/airport-arrival-chime.wav', {signal:controller.signal})
    .then(response => { if (!response.ok) throw new Error('Flyover audio unavailable'); return response.arrayBuffer(); })
    .then(bytes => context.decodeAudioData(bytes))
    .then(buffer => {
      const play = () => {
        if (stopped) return;
        source = context.createBufferSource(); source.buffer = buffer; source.connect(gain);
        source.onended = () => { source?.disconnect(); if (!stopped) onState('finished'); };
        source.start(); onState('playing');
      };
      play();
    }).catch(() => { if (!stopped) onState('unavailable'); });
  return () => { stopped = true; controller.abort(); if (source) { source.onended = null; try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); } gain.disconnect(); };
}

/** Selected scanner C: a finite relay engagement, motor hum, and stop. */
export function playScanner(context: AudioContext, onState: (state: PassengerVoiceState) => void): () => void {
  let stopped = false, source: AudioBufferSourceNode | null = null;
  const gain = context.createGain(); gain.gain.value = .58; gain.connect(context.destination);
  const controller = new AbortController(); onState('loading');
  void fetch(import.meta.env.BASE_URL + 'audio/scanner-relay.wav', {signal:controller.signal})
    .then(r => { if (!r.ok) throw new Error('Scanner audio unavailable'); return r.arrayBuffer(); })
    .then(b => context.decodeAudioData(b)).then(buffer => {
      if (stopped) return;
      source = context.createBufferSource(); source.buffer = buffer; source.connect(gain);
      source.onended = () => { source?.disconnect(); if (!stopped) onState('finished'); };
      source.start(); onState('playing');
    }).catch(() => { if (!stopped) onState('unavailable'); });
  return () => { stopped = true; controller.abort(); if (source) { source.onended = null; try { source.stop(); } catch { /* Already stopped. */ } source.disconnect(); } gain.disconnect(); };
}

/** Recorded Daniel works even when the visitor has no Daniel system voice installed. */
export function startEvacuationBroadcast(onState:(s:BroadcastState)=>void,onDuck:(d:boolean)=>void,context:AudioContext):()=>void {
 let stopped=false, source:AudioBufferSourceNode|null=null, loop:ReturnType<typeof setTimeout>|undefined, fallback:(()=>void)|undefined;
 const abort=new AbortController(), gain=context.createGain();gain.gain.value=.85;gain.connect(context.destination);onState('waiting');
 const play=(buffer:AudioBuffer)=>{if(stopped)return;source=context.createBufferSource();source.buffer=buffer;source.connect(gain);source.onended=()=>{source?.disconnect();if(!stopped){onDuck(false);onState('waiting');loop=setTimeout(()=>play(buffer),22000);}};source.start();onDuck(true);onState('speaking');};
 void fetch(import.meta.env.BASE_URL+'audio/evacuation-daniel.wav',{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('PA asset unavailable');return r.arrayBuffer();}).then(b=>context.decodeAudioData(b)).then(b=>{if(!stopped)play(b);}).catch(()=>{if(!stopped)fallback=startSpeechEvacuationBroadcast(onState,onDuck);});
 return ()=>{stopped=true;abort.abort();clearTimeout(loop);fallback?.();if(source){source.onended=null;try{source.stop();}catch{/* ended */}source.disconnect();}gain.disconnect();onDuck(false);};
}
