import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { playStamp } from './game/stampSound';
import { AirportQueueScene, type LockdownStage } from './game/AirportQueueScene';
import { startLockdownAlarm } from './game/lockdownAlarm';
import { playScanner, playKeyboard, playMoney, startAirportAmbience, startEvacuationBroadcast, EVACUATION_TEXT, playPassengerVoice, startTitleFlyover, type PassengerVoiceState, type FlyoverState, type BroadcastState } from './game/soundscape';
import { rosterFor, judge, MAX_MISTAKES, CURRENCY, PAY_RULES, calculatePayroll, type Item, type Decision, type RecordEntry } from './game/GameStateManager';
import { PassengerPortrait } from './components/PassengerPortrait';
import { DialoguePanel } from './components/DialoguePanel';
import { InspectionDesk } from './components/InspectionDesk';
import { Introduction } from './components/Introduction';
import { PayrollSettlement } from './components/PayrollSettlement';
import { SecurityReport } from './components/SecurityReport';

type Screen = 'orientation' | 'title' | 'appointment' | 'day-start' | 'work';
type Finish = 'complete' | 'reassessment' | 'evacuated' | null;

function App() {
  const [day, setDay] = useState(1);
  const passengers = rosterFor(day);
  const [scannerSoundState, setScannerSoundState] = useState<PassengerVoiceState>('off');
  const [screen, setScreen] = useState<Screen>('orientation');
  const [reporting, setReporting] = useState(false);
  const [coverReady, setCoverReady] = useState(false);
  const [entryPending, setEntryPending] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [revealNotice, setRevealNotice] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [broadcastState, setBroadcastState] = useState<BroadcastState>('off');
  const [ambiencePlaying, setAmbiencePlaying] = useState(false);
  const [moneyCueCount, setMoneyCueCount] = useState(0);
  const paid = useRef(false);
  const ambient = useRef<ReturnType<typeof startAirportAmbience> | null>(null);
  const greeted = useRef<number | null>(null);
  const [passengerCueCount, setPassengerCueCount] = useState(0);
  const [passengerVoiceState, setPassengerVoiceState] = useState<PassengerVoiceState>('off');
  const [passengerVoiceId, setPassengerVoiceId] = useState<string | null>(null);
  const [flyoverState, setFlyoverState] = useState<FlyoverState>('off');
  const titleFlyoverPlayed = useRef(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Item | null>(passengers[0].items[0]);
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [result, setResult] = useState<ReturnType<typeof judge> | null>(null);
  const [scanning, setScanning] = useState(false);
  const [finish, setFinish] = useState<Finish>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lockdownStage, setLockdownStage] = useState<LockdownStage>('idle');
  const [lockdownTimeline, setLockdownTimeline] = useState<Array<{stage: LockdownStage; at: number}>>([]);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [scale, setScale] = useState(1);
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);
  const scene = useRef<AirportQueueScene | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const passenger = passengers[index];
  const correct = records.filter(r => r.correct).length;
  const mistakes = records.length - correct;
  const payroll = calculatePayroll(records);
  const securityOutcome = records.find(record => record.securityOutcome)?.securityOutcome ?? null;
  const minutes = 7 * 60 + 48 + index * 3;
  const shiftTime = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

  const coverScreen = screen === 'title';
  const stageHeight = coverScreen ? 960 * 992 / 1586 : 540;
  useEffect(() => {
    const resize = () => setScale(Math.min((window.innerWidth - 24) / 960, (window.innerHeight - 24) / stageHeight, 1.8));
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [coverScreen, stageHeight]);

  useEffect(() => {
    const s = new AirportQueueScene();
    const onLockdownStage = (stage: LockdownStage) => {
      setLockdownStage(stage);
      setLockdownTimeline(log => stage === 'idle' ? [] : [...log, { stage, at: Math.round(performance.now()) }]);
    };
    s.onLockdownStage = onLockdownStage;
    scene.current = s;
    game.current = new Phaser.Game({ type: Phaser.CANVAS, width: 960, height: 150, parent: host.current!, pixelArt: true, roundPixels: true, backgroundColor: '#666b5b', scene: s, banner: false, audio: { noAudio: true } });
    return () => {
      s.onLockdownStage = undefined;
      game.current?.destroy(true);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Browsers permit sound after the first deliberate pointer or keyboard input.
  useEffect(() => {
    const unlock = () => {
      if (muted) return;
      try { audio.current ??= new AudioContext(); void audio.current.resume().then(() => setAudioReady(true)).catch(() => {}); } catch { /* Visual fallback. */ }
    };
    unlock();
    window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  }, [muted]);

  useEffect(() => {
    setAmbiencePlaying(false);
    if (!audioReady || muted || !pageVisible || finish || securityOutcome === 'missed' || !audio.current) return;
    const bed = startAirportAmbience(audio.current); ambient.current = bed; setAmbiencePlaying(true);
    return () => { bed.stop(); ambient.current = null; };
  }, [audioReady, muted, pageVisible, finish, securityOutcome]);

  useEffect(() => {
    let disposed = false;
    let stop: (() => void) | undefined;
    let stopBroadcast: (() => void) | undefined;
    setAlarmPlaying(false); setBroadcastState('off');
    if (securityOutcome !== 'missed' || screen !== 'work' || finish || muted || !pageVisible) return;
    try {
      audio.current ??= new AudioContext();
      const context = audio.current;
      void context.resume().then(() => {
        if (!disposed) {
          const alarm = startLockdownAlarm(context); stop = alarm.stop; setAlarmPlaying(true);
          stopBroadcast = startEvacuationBroadcast(state => { if (!disposed) setBroadcastState(state); }, alarm.setDucked, context);
        }
      }).catch(() => { if (!disposed) setAlarmPlaying(false); });
    } catch { /* Alarm visuals and subtitles remain available without sound. */ }
    return () => { disposed = true; stopBroadcast?.(); stop?.(); };
  }, [securityOutcome, screen, finish, muted, pageVisible]);

  useEffect(() => {
    if (!finish) { paid.current = false; return; }
    if (paid.current || muted || !audioReady || !pageVisible || !audio.current) return;
    const context = audio.current;
    let cancelled = false, stop: (() => void) | undefined;
    void context.resume().then(() => {
      if (cancelled || context.state !== 'running') return;
      paid.current = true;
      stop = playMoney(context);
      setMoneyCueCount(value => value + 1);
    }).catch(() => {});
    return () => { cancelled = true; stop?.(); };
  }, [finish, muted, audioReady, pageVisible]);

  const typeSound = useCallback((index: number) => {
    if (flyoverState === 'playing') return;
    if (!muted && audio.current?.state === 'running' && !document.hidden) playKeyboard(audio.current, index);
  }, [muted, flyoverState]);

  // Keep the first-click chime alive across title → appointment navigation.
  const titleCueEligible = screen === 'title' || screen === 'appointment';
  useEffect(() => {
    setFlyoverState('off');
    if (!titleCueEligible || !audioReady || muted || !pageVisible || !audio.current || titleFlyoverPlayed.current) return;
    return startTitleFlyover(audio.current, state => { if (state === 'playing') { titleFlyoverPlayed.current = true; ambient.current?.duck(1.8); } setFlyoverState(state); });
  }, [titleCueEligible, audioReady, muted, pageVisible]);

  useEffect(() => {
    setPassengerVoiceState('off');
    if (screen !== 'work' || scanning || result || finish || !audioReady || muted || !pageVisible || !audio.current || greeted.current === index) return;
    greeted.current = index; ambient.current?.duck(1.5);
    return playPassengerVoice(audio.current,passengers[index].voiceId ?? passengers[index].id,state => { setPassengerVoiceState(state); if (state === 'playing') { setPassengerVoiceId(passengers[index].id); setPassengerCueCount(value => value + 1); } });
  }, [screen, index, scanning, result, finish, audioReady, muted, pageVisible]);

  useEffect(() => {
    setScannerSoundState('off');
    if (!scanning || screen !== 'work' || muted || !pageVisible || !audioReady || !audio.current) return;
    ambient.current?.duck(1.5);
    return playScanner(audio.current, setScannerSoundState);
  }, [scanning, screen, muted, pageVisible, audioReady]);

  const toggleSound = useCallback(() => {
    if (muted) {
      try { audio.current ??= new AudioContext(); void audio.current.resume().then(() => setAudioReady(true)).catch(() => {}); } catch { /* Optional audio. */ }
    }
    setMuted(!muted);
  }, [muted]);

  const acknowledgeNotice = useCallback(() => {
    if (result?.securityOutcome === 'missed') {
      if (lockdownStage !== 'sealed') return;
      setNoticeOpen(false);
      setFinish(mistakes >= MAX_MISTAKES ? 'reassessment' : 'evacuated');
      return;
    }
    setNoticeOpen(false);
    if (mistakes >= MAX_MISTAKES) setFinish('reassessment');
  }, [result, lockdownStage, mistakes]);

  const alarmState = securityOutcome !== 'missed' || screen !== 'work' || finish ? 'off' : muted ? 'muted' : !pageVisible ? 'paused' : alarmPlaying ? 'playing' : 'starting';

  const beep = useCallback((good = true) => {
    if (muted) return;
    ambient.current?.duck(.25);
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
      const oscillator = audio.current.createOscillator(), gain = audio.current.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = good ? 520 : 165;
      gain.gain.setValueAtTime(.028, audio.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.current.currentTime + .13);
      oscillator.connect(gain); gain.connect(audio.current.destination);
      oscillator.start(); oscillator.stop(audio.current.currentTime + .14);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Sound is optional. */ }
  }, [muted]);

  const stamp = useCallback(() => {
    if (muted) return;
    ambient.current?.duck(.65);
    try {
      audio.current ??= new AudioContext();
      const context = audio.current;
      void context.resume().then(() => playStamp(context));
    } catch { /* Visual feedback is always available. */ }
  }, [muted]);

  const decide = useCallback((decision: Decision) => {
    if (screen !== 'work' || result || scanning || finish) return;
    const decisionResult = judge(passenger, decision);
    setResult(decisionResult);
    setRecords(r => [...r, { id: passenger.id, decision, correct: decisionResult.correct, reason: decisionResult.reason, securityOutcome: decisionResult.securityOutcome }]);
    if (decisionResult.securityOutcome) {
      setNoticeOpen(true);
      scene.current?.resolveSecurity(decisionResult.securityOutcome);
    }
    if (decisionResult.correct) stamp();
    else {
      setNoticeOpen(true);
      beep(false);
      if (mistakes + 1 >= MAX_MISTAKES && decisionResult.securityOutcome !== 'missed') setFinish('reassessment');
    }
  }, [screen, result, scanning, finish, passenger, mistakes, stamp, beep]);

  const next = useCallback(() => {
    if (screen !== 'work' || !result || scanning || finish || noticeOpen) return;
    if (index === passengers.length - 1) { setFinish('complete'); return; }
    setIndex(i => i + 1);
    setSelected(passengers[index + 1].items[0]);
    setResult(null); setScanning(true);
    scene.current?.advance(index + 1);
    beep();
    timer.current = setTimeout(() => setScanning(false), 1500);
  }, [screen, result, scanning, finish, noticeOpen, index, beep]);

  const restart = useCallback((destination: Screen = 'work', targetDay = day) => {
    setDay(targetDay);
    const roster = rosterFor(targetDay);
    if (scene.current) scene.current.roster = roster;
    setLockdownStage('idle'); setLockdownTimeline([]);
    setIndex(0); setRecords([]); setResult(null); setSelected(roster[0].items[0]);
    setFinish(null); setNoticeOpen(false); setScanning(false); setReporting(false); setScreen(destination); setRevealNotice(false); setIntroReady(false); setMoneyCueCount(0); setPassengerCueCount(0); setPassengerVoiceId(null); greeted.current = null; titleFlyoverPlayed.current = false;
    if (timer.current) clearTimeout(timer.current);
    scene.current?.scene.restart();
  }, [day]);

  useEffect(() => {
    if (day !== 1 || finish !== 'complete' || payroll.accuracy < 60 || !pageVisible) return;
    const advance = setTimeout(() => restart('day-start', 2), 3200);
    return () => clearTimeout(advance);
  }, [day, finish, payroll.accuracy, restart, pageVisible]);

  const continueIntro = useCallback(() => {
    if (reporting) return;
    if (screen === 'orientation') { if (coverReady) setScreen('title'); else setEntryPending(true); }
    else if (screen === 'title') setScreen('appointment');
    else if (screen === 'appointment') {
      if (!introReady) { setRevealNotice(true); return; }
      setReporting(true);
      stamp();
      timer.current = setTimeout(() => { setReporting(false); setScreen('day-start'); }, 1500);
    } else if (screen === 'day-start') { setScreen('work'); setScanning(true); timer.current = setTimeout(() => setScanning(false), 1500); }
  }, [screen, reporting, introReady, stamp, coverReady]);
  useEffect(() => {
    if (screen !== 'day-start') return;
    const transition = setTimeout(continueIntro, day === 2 ? 6500 : 2500);
    return () => clearTimeout(transition);
  }, [screen, day, continueIntro]);

  useEffect(() => {
    if (screen === 'orientation' && entryPending && coverReady) { setEntryPending(false); setScreen('title'); }
  }, [screen, entryPending, coverReady]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat || ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (screen !== 'work') {
        if (e.key === 'Enter') { e.preventDefault(); continueIntro(); }
        return;
      }
      if (finish) return;
      if (noticeOpen && e.key === 'Enter') { e.preventDefault(); acknowledgeNotice(); return; }
      if (e.key === '1') { e.preventDefault(); decide('approve'); }
      if (e.key === '2') { e.preventDefault(); decide('secondary'); }
      if (e.key === 'Enter' && result) { e.preventDefault(); next(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, finish, noticeOpen, decide, next, result, continueIntro, acknowledgeNotice]);

  useEffect(() => {
    document.documentElement.dataset.gameState = JSON.stringify({ day, scannerSoundState, index, screen, reporting, coverReady, entryPending, phase: reporting ? 'reporting' : screen !== 'work' ? screen : finish === 'reassessment' ? 'reassessment' : finish === 'evacuated' ? 'evacuated' : finish ? 'finished' : result ? 'judged' : scanning ? 'scanning' : 'inspecting', correct, mistakes, payroll, total: passengers.length, securityOutcome, lockdownStage, lockdownTimeline, alarmState, alarmPlaying, broadcastState, broadcastText: EVACUATION_TEXT, flyoverState, passengerVoiceState, passengerVoiceId, passengerCueCount, ambiencePlaying, audioReady, moneyCueCount, introReady, pageVisible, noticeOpen: noticeOpen && !finish, maxMistakes: MAX_MISTAKES, processed: records.length, selected: selected?.id ?? null });
  }, [day, scannerSoundState, index, screen, reporting, coverReady, entryPending, finish, result, scanning, correct, mistakes, noticeOpen, records, selected, lockdownStage, lockdownTimeline, alarmState, alarmPlaying, broadcastState, flyoverState, passengerVoiceState, passengerVoiceId, passengerCueCount, ambiencePlaying, audioReady, moneyCueCount, introReady, pageVisible]);

  return <main data-screen={screen} className={'app' + (coverScreen ? ' cover-screen' : '')}>
    <div className="game-shell" style={{ width: 960 * scale, height: stageHeight * scale }}>
      <div className={'game' + (lockdownStage !== 'idle' ? ' has-lockdown' : '') + (coverScreen ? ' is-cover' : '')} style={{ transform: `scale(${scale})`, height: stageHeight }}>
        <div className="work-content" inert={screen !== 'work'} aria-hidden={screen !== 'work'}>
          <header className="terminal-header">
            <div className="airport-logo"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 16h10L24 4h4l-7 12h7v4h-9l-5 9h-4l2-9H3z" fill="currentColor" /></svg><span>ARSTIA INTERNATIONAL AIRPORT<small>阿斯提亚国际机场</small></span></div>
            <div className="terminal-sign">T1 <span>TERMINAL 1<small>一号航站楼</small></span><b>→</b></div>
            <div className={'security-sign' + (lockdownStage !== 'idle' ? ' is-suspended' : '')}><span className="security-symbol">{lockdownStage !== 'idle' ? 'Ⅱ' : '▣'}</span><span>{lockdownStage !== 'idle' ? '暂停登机' : 'SECURITY CHECK'}<small>{lockdownStage !== 'idle' ? 'BOARDING SUSPENDED' : '安全检查 · 04 号通道'}</small></span></div>
            <div className="shift-clock">2026.10.{day === 1 ? 19 : 20}　{day === 1 ? 'MON' : 'TUE'}　{shiftTime}<small>第 {day === 1 ? '一' : '二'} 关 · DAY 0{day} / 早班</small></div>
            <button className="sound-button" onClick={toggleSound} aria-label={muted ? '开启声音' : '关闭声音'} title={muted ? '开启声音' : alarmPlaying ? '警报播放中 · 点击静音' : '关闭声音'}><i className={alarmPlaying ? 'sound-alarm-playing' : ''} />{muted ? '♪ OFF' : '♪ ON'}</button>
          </header>
          <div className="airport-scene" data-lockdown-stage={lockdownStage} data-flight-status={lockdownStage === 'idle' ? 'normal' : 'HOLD'} ref={host} role="img" aria-label="有七名排队旅客、金属隔离栏、安检门和行李传送带的像素机场场景" />
          {lockdownStage !== 'idle' && <div className="emergency-hanging-sign" aria-label="暂停登机"><i>Ⅱ</i><span>暂停登机<small>BOARDING SUSPENDED</small></span></div>}
          <div className={'scene-caption' + (lockdownStage === 'sealed' ? ' is-locked' : '')}>
            {lockdownStage === 'sealed' ? <><span className="lock-stripe" /><span className="lockdown-title">通道封锁 <small>GATE LOCKDOWN</small></span><span className="lock-stripe" /></> : <><span><i />{lockdownStage !== 'idle' ? '安保警报 · 正在封锁通道' : securityOutcome === 'intercepted' ? '安保已接手 · 通道正常运行' : '通道 04 · 正常运行'}</span><span>请将随身行李放上传送带　/　PLACE YOUR BAG ON THE BELT</span><span>GATES 01–16 →</span></>}
          </div>
          {lockdownStage !== 'idle' && !finish && <div className={'evacuation-pa ' + (broadcastState === 'speaking' ? 'is-speaking' : '')} role="status"><span>机场紧急广播 / {broadcastState === 'speaking' ? 'DANIEL · LIVE' : 'EVACUATION'}</span><b>航站楼发生安保紧急事件。请保持冷静，立即撤离并听从工作人员指引。</b><small>{EVACUATION_TEXT}</small></div>}
          <div className="workstation">
            <aside className="passenger-panel">
              <PassengerPortrait passenger={passenger} dangerous={!!result?.securityOutcome} />
              <DialoguePanel text={result ? (result.correct ? passenger.replyGood : passenger.replyBad) : passenger.dialogue} />
              <div className="passenger-details"><div><span>旅客</span><b>{passenger.id}　{passenger.latin}</b></div><div><span>国籍</span><b>{passenger.nation} <small> / {passenger.code}</small></b></div><div><span>航班</span><b>{passenger.flight} → {passenger.destination}</b></div></div>
              <div className="passenger-bottom">
                <span className="passport-tag">已审核 <b>{String(records.length).padStart(2, '0')}</b> / {String(passengers.length).padStart(2, '0')}<small className={'mistake-counter' + (mistakes ? ' has-mistakes' : '')}>失误 {mistakes} / {MAX_MISTAKES} <i>{[0, 1, 2].map(i => <em key={i} className={i < mistakes ? 'marked' : ''} />)}</i></small></span>
                <button className={'next-button' + (result && !scanning && !finish && !noticeOpen ? ' next-ready' : '')} disabled={!result || scanning || !!finish || noticeOpen} onClick={next}>{index === passengers.length - 1 ? '结束班次' : '下一位旅客'} <b>〉</b></button>
              </div>
            </aside>
            <InspectionDesk day={day} passenger={passenger} selected={selected} onSelect={i => { if (!scanning && !finish && screen === 'work') { setSelected(i); beep(); } }} onDecision={decide} disabled={!!result || scanning || !!finish || screen !== 'work'} scanning={scanning} />
          </div>
          <footer className="status-bar"><span><i /> {scanning ? '行李扫描中' : result ? result.correct ? '审核正确' : '失误已记录' : '值班中'} <b>·</b> {result ? result.reason : '点击扫描物品 → 核对规则 → 选择放行或复检'}</span><span className={mistakes ? 'score-warning' : ''}>预计 {payroll.projected} {CURRENCY}　/　失误 {mistakes} / {MAX_MISTAKES}</span></footer>
          {result && !finish && (result.securityOutcome ? (noticeOpen && (result.securityOutcome !== 'missed' || lockdownStage === 'sealed') && <SecurityReport day={day} passengerId={passenger.id} outcome={result.securityOutcome} message={result.securityMessage!} onAcknowledge={acknowledgeNotice} />) : result.correct ? <div key={passenger.id} className="result-slip correct" role="status">
            <span className="stamp-impression"><span className="stamp-tool" aria-hidden="true"><i /><em /></span><span className="result-seal" aria-hidden="true"><small>SECURITY · 084</small><b>审核正确</b><em>VERIFIED</em></span></span>
            <div><b>审核正确</b><p>{result.reason}</p></div><small>计薪 +20 {CURRENCY}<br />{passenger.id} / DAY 0{day}</small>
          </div> : noticeOpen && <div key={passenger.id} className="error-notice" role="alertdialog" aria-modal="true" aria-label="失误记录">
            <div className="citation-heading"><b>失误记录 {String(mistakes).padStart(2, '0')}</b><span>扣薪 {PAY_RULES.perError} {CURRENCY}</span></div>
            <p>{result.reason}</p><div className="citation-warning">再错 <b>{MAX_MISTAKES - mistakes}</b> 次需重新考核入职，请谨慎审核行李。</div><div className="citation-footer"><small>SECURITY DEPARTMENT / PERSONNEL FILE 084</small><button className="citation-ack" autoFocus onClick={acknowledgeNotice}>知悉</button></div>
          </div>)}
          {finish && <PayrollSettlement day={day} onNextDay={day === 1 && finish === 'complete' && payroll.accuracy >= 60 ? () => restart('day-start', 2) : undefined} records={records} reassessment={finish === 'reassessment'} evacuated={securityOutcome === 'missed'} onRestart={() => restart()} onTitle={() => restart('title', 1)} />}
        </div>
        {screen !== 'work' && <Introduction day={day} screen={screen} muted={muted} reporting={reporting} revealNotice={revealNotice} onTypingDone={setIntroReady} onTypingTick={typeSound} onSound={toggleSound} onContinue={continueIntro} onCoverReady={setCoverReady} entryPending={entryPending} />}
      </div>
    </div>
  </main>;
}
export default App;
