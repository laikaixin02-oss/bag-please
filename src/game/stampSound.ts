/** A short rubber-stamp impact: desk thump, dry contact, then mechanism rebound. */
export function playStamp(context: AudioContext) {
  const now = context.currentTime + .18; // Align with the stamp touching the paper.
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * .19), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.exp(-i / (context.sampleRate * .022));
  const noise = context.createBufferSource();
  noise.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 1800; filter.Q.value = .7;
  const contact = context.createGain();
  contact.gain.setValueAtTime(.0001, now);
  contact.gain.linearRampToValueAtTime(.22, now + .002);
  contact.gain.exponentialRampToValueAtTime(.0001, now + .17);
  noise.connect(filter); filter.connect(contact); contact.connect(context.destination);
  noise.start(now); noise.stop(now + .19);
  const body = context.createOscillator(), weight = context.createGain();
  body.type = 'sine'; body.frequency.setValueAtTime(125, now); body.frequency.exponentialRampToValueAtTime(47, now + .1);
  weight.gain.setValueAtTime(.0001, now); weight.gain.linearRampToValueAtTime(.25, now + .004); weight.gain.exponentialRampToValueAtTime(.0001, now + .16);
  body.connect(weight); weight.connect(context.destination); body.start(now); body.stop(now + .18);
  const rebound = context.createOscillator(), spring = context.createGain();
  rebound.type = 'triangle'; rebound.frequency.setValueAtTime(420, now + .075); rebound.frequency.exponentialRampToValueAtTime(180, now + .12);
  spring.gain.setValueAtTime(.0001, now); spring.gain.setValueAtTime(.035, now + .075); spring.gain.exponentialRampToValueAtTime(.0001, now + .14);
  rebound.connect(spring); spring.connect(context.destination); rebound.start(now + .075); rebound.stop(now + .15);
  noise.onended=()=>{noise.disconnect();filter.disconnect();contact.disconnect()};
  body.onended=()=>{body.disconnect();weight.disconnect()};
  rebound.onended=()=>{rebound.disconnect();spring.disconnect()};
}
