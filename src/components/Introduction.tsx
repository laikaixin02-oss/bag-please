import { useEffect, useRef, useState } from 'react';
import titleCoverUrl from '../assets/title-cover.jpg';
import titleCoverFallbackUrl from '../assets/title-cover-fallback.png';
import { CURRENCY, PAY_RULES } from '../game/GameStateManager';

export type IntroScreen = 'orientation' | 'title' | 'appointment' | 'day-start';
interface Props {
  day: number;
  screen: IntroScreen;
  muted: boolean;
  reporting: boolean;
  revealNotice: boolean;
  onTypingDone: (ready: boolean) => void;
  onTypingTick: (index: number) => void;
  onSound: () => void;
  onContinue: () => void;
  onCoverReady: (ready: boolean) => void;
  entryPending: boolean;
}

const NOTICE = [
  '恭喜。\n你的机场行李安检员应聘申请已获批准。',
  '请于今日 07:48，前往阿斯提亚国际机场。\n一号航站楼，04 号安检通道。',
  '请谨慎查验每一件行李。\n一次疏忽，可能让恐怖分子混入航班。',
];
const FULL_NOTICE = NOTICE.join('\n');
export function Introduction({ day, screen, muted, reporting, revealNotice, onTypingDone, onTypingTick, onSound, onContinue, onCoverReady, entryPending }: Props) {
  const [count, setCount] = useState(0);
  const [coverSource, setCoverSource] = useState(0);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [coverRetry, setCoverRetry] = useState(0);
  useEffect(() => { onCoverReady(coverLoaded || coverFailed); }, [coverLoaded, coverFailed, onCoverReady]);
  const coverSrc = (coverSource === 0 ? titleCoverUrl : titleCoverFallbackUrl) + (coverRetry ? `?retry=${coverRetry}` : '');
  const tick = useRef(onTypingTick); tick.current = onTypingTick;
  useEffect(() => {
    if (screen !== 'appointment') { setCount(0); onTypingDone(false); return; }
    if (revealNotice || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setCount(FULL_NOTICE.length); onTypingDone(true); return; }
    setCount(0); onTypingDone(false);
    let position = 0, timer: ReturnType<typeof setTimeout>;
    const type = () => {
      const char = FULL_NOTICE[position++]; setCount(position);
      if (char && !/\s/.test(char)) tick.current(position);
      if (position >= FULL_NOTICE.length) onTypingDone(true);
      else timer = setTimeout(type, char === '\n' ? 180 : /[。，。]/.test(char) ? 190 : 42);
    };
    timer = setTimeout(type, 160);
    return () => clearTimeout(timer);
  }, [screen, revealNotice, onTypingDone]);
  const typed = count >= FULL_NOTICE.length;
  return <section className={`introduction ${screen}${screen === 'title' && coverFailed ? ' cover-image-failed' : ''}`} aria-label={screen === 'orientation' ? '横屏体验提示' : screen === 'title' ? '游戏标题' : screen === 'appointment' ? '录用通知' : `第${day}天`}>
    <img className={'title-cover-image' + (screen !== 'title' ? ' cover-prewarm' : '')} src={coverSrc} alt={screen === 'title' ? '落日航站楼、安检员与行李扫描台组成的像素封面' : ''} aria-hidden={screen !== 'title'} draggable={false} loading="eager" fetchPriority="high" decoding="async" data-load-state={coverFailed ? 'error' : coverLoaded ? 'ready' : 'loading'} onLoad={event => {
      const image = event.currentTarget;
      const decoded = typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve();
      void decoded.then(() => { if (image.isConnected && image.complete && image.naturalWidth > 0) { setCoverLoaded(true); setCoverFailed(false); } });
    }} onError={() => { setCoverLoaded(false); if (coverSource === 0) setCoverSource(1); else setCoverFailed(true); }} />
    {screen !== 'title' && <div className="intro-topline"><span>ARSTIA AIRPORT AUTHORITY</span><button onClick={onSound} aria-label={muted ? '开启声音' : '关闭声音'}>声音：{muted ? '关' : '开'}</button></div>}
    {screen === 'orientation' ? <>
      <div className="orientation-card">
        <span className="orientation-eyebrow">BEFORE YOUR SHIFT / 开始之前</span>
        <svg className="orientation-device" viewBox="0 0 104 76" shapeRendering="crispEdges" aria-hidden="true"><path d="M24 25H96V68H24Z" fill="#282d25" stroke="#bd9c69" strokeWidth="3"/><path d="M32 32H86V61H32Z" fill="#59665b"/><path d="M90 43V51" stroke="#bd9c69" strokeWidth="2"/><path d="M9 9V42H18M9 9H44V18M32 7H48V23M49 7L39 17" fill="none" stroke="#ca835e" strokeWidth="3"/></svg>
        <h1>手机横屏，体验更好</h1>
        <p>本游戏采用横向安检工作台。<br/>使用手机时，建议旋转屏幕后体验。</p>
        <button className="orientation-enter" aria-busy={entryPending} disabled={entryPending} onClick={onContinue}>进入游戏　→</button>
        <small>也可以继续使用当前屏幕方向。</small>
      </div>
      <div className="intro-bottomline"><span>BAG, PLEASE · 行李请过安检</span><span>960 × 540 / PIXEL PERFECT</span></div>
    </> : screen === 'title' ? <>
      {coverFailed && <div className="cover-recovery" role="alert"><h2>BAG, PLEASE</h2><p>封面暂未加载，请重试。</p><button onClick={() => { setCoverFailed(false); setCoverLoaded(false); setCoverSource(0); setCoverRetry(value => value + 1); }}>重新加载封面</button></div>}
      <h1 className="cover-accessible">BAG, PLEASE</h1><p className="title-subtitle cover-accessible">行李请过安检</p>
      <button className="cover-start" onClick={onContinue} aria-label="点击开始上班"><span className="cover-accessible">点击开始上班</span></button>
      <button className="cover-sound" onClick={onSound} aria-label={muted ? '开启声音' : '关闭声音'}>声音：{muted ? '关' : '开'}</button>
    </> : screen === 'appointment' ? <>
      <div className="appointment-body">
      <div className="appointment-heading">任用通知　/　NO. 084</div>
      <div className="appointment-copy" data-typed-count={count} data-typed-total={FULL_NOTICE.length} aria-live="off">
        {NOTICE.map((text, index) => {
          const offset = NOTICE.slice(0,index).reduce((sum,line)=>sum+line.length+1,0);
          const shown = Math.max(0, Math.min(text.length, count-offset));
          return <p className="appointment-line" key={index}><span className="notice-measure" aria-hidden="true">{text}</span><span className="notice-typed">{text.slice(0,shown)}{!typed && count >= offset && count <= offset+text.length && <i className="typing-caret" aria-hidden="true">▌</i>}</span></p>;
        })}
      </div>
      <button className={'report-to-duty report-button' + (reporting ? ' reported' : '')} disabled={reporting || !typed} aria-label={reporting ? '安检通过' : '前往岗位'} onClick={onContinue}>
        <span className="report-label">前往岗位</span>
        {reporting && <><span className="stamp-tool" aria-hidden="true"><i /><em /></span><span className="entry-stamp" aria-hidden="true"><small>ARSTIA · APPROVED</small><b>安检通过</b></span></>}
      </button>
      </div>
      <div className="intro-bottomline"><span>阿斯提亚机场管理局 · 人事处</span><span>{reporting ? '已核验 · 正在前往岗位' : '录用通知 / 084'}</span></div>
    </> : <>
      <div className="day-card">
        <span className="day-eyebrow">阿斯提亚国际机场　/　04 号通道</span>
        <h1>DAY {day}</h1>
        <p className="day-date">2026年10月{day === 1 ? 19 : 20}日</p>
        <span className="day-rule" />
        <p className="day-motto">忠于职守，护航远方。</p>
        <p className="day-pay-terms">本日工资 {PAY_RULES.base} {CURRENCY} · 每次误判扣 {PAY_RULES.perError} {CURRENCY}<br />严重漏检另扣 {PAY_RULES.missedThreat} {CURRENCY} · {day === 1 ? '安保补充通告 04 已生效' : '新增规则 05–06 已生效'}</p>
        {day === 2 && <div className="day-two-briefing"><b>第二日补充通告</b><p>05 · 备用电芯最多 2 枚，每枚端子须有保护帽。</p><p>06 · 封装设备须持许可，许可编号与机身完全一致。</p><small>原有液体、工具规则继续生效 · 6 位旅客 · 每包 6–8 件</small></div>}
      </div>
      <p className="day-continue" role="status">正在前往安检岗位…</p>
      <div className="intro-bottomline"><span>ARSTIA AIRPORT AUTHORITY</span><span>第 {day} 工作日 · 早班</span></div>
    </>}
  </section>;
}
