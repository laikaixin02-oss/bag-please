import { useEffect, useRef } from 'react';
import { itemArt, rect, noise } from '../art/pixels';
import type { Item, Passenger } from '../game/GameStateManager';
export function ItemIcon({ item, color = '#534b3e' }: {
    item: Item;
    color?: string;
}) { const r = useRef<HTMLCanvasElement>(null); useEffect(() => { const c = r.current!.getContext('2d')!; c.clearRect(0, 0, 64, 64); itemArt(c, item, 0, 0, 64, 64, color); }, [item, color]); return <canvas ref={r} width={64} height={64} aria-hidden="true"/>; }
export function XRayScanner({ passenger, selected, onSelect, scanning }: {
    passenger: Passenger;
    selected: Item | null;
    onSelect: (i: Item) => void;
    scanning: boolean;
}) { const ref = useRef<HTMLCanvasElement>(null); useEffect(() => { const cv = ref.current!; cv.width = 300; cv.height = 164; const c = cv.getContext('2d')!; c.imageSmoothingEnabled = false; const pixelAspect = cv.clientWidth && cv.clientHeight ? (cv.clientWidth / cv.width) / (cv.clientHeight / cv.height) : 1; rect(c, 0, 0, 300, 164, '#102e2a'); for (let x = 0; x < 300; x += 12)
    rect(c, x, 0, 1, 164, '#1c3c32'); for (let y = 0; y < 164; y += 12)
    rect(c, 0, y, 300, 1, '#1c3c32'); noise(c, 300, 164, 600, ['#2d514022', '#5e804422', '#091b1922']); c.strokeStyle = '#657e3c'; c.lineWidth = 2; c.strokeRect(24, 18, 233, 133); c.strokeStyle = '#8a9c50'; c.strokeRect(29, 22, 223, 125); c.strokeRect(108, 9, 58, 9); c.strokeRect(118, 5, 37, 4); c.strokeRect(17, 62, 7, 42); c.strokeRect(256, 65, 7, 39); c.strokeStyle = '#3a5932'; c.strokeRect(34, 27, 213, 115); for (let x = 40; x < 249; x += 7) {
    rect(c, x, 19, 3, 2, '#99a94a');
    rect(c, x, 148, 3, 2, '#99a94a');
} for (const item of passenger.items) {
    itemArt(c, item, item.x, item.y, item.w, item.h, { orange: '#d6974d', green: '#6ca57c', blue: '#61adc3' }[item.color] ?? '#6ca57c', true, pixelAspect);
    if (selected === item) {
        c.strokeStyle = '#dcba6f';
        c.lineWidth = 1;
        c.setLineDash([3, 3]);
        c.strokeRect(item.x - 5, item.y - 5, item.w + 10, item.h + 10);
        c.setLineDash([]);
    }
} }, [passenger, selected]); return <section className="monitor"><div className="monitor-title"><span><i /> X-RAY SCANNER</span><span className="bag-id">BAG {passenger.id}</span></div><div className={'scan-screen ' + (scanning ? 'scanning' : '')}><canvas ref={ref} aria-label="X 光行李扫描图"/>{!scanning && passenger.items.map((i) => <button key={i.id} className={'item-hit ' + (selected === i ? 'selected' : '')} style={{ left: `${i.x / 3}%`, top: `${i.y / 1.64}%`, width: `${i.w / 3}%`, height: `${i.h / 1.64}%` }} onClick={() => onSelect(i)} aria-label={`检查${i.name}`} title={`检查${i.name}`}/>)}<div className="scan-sweep"/>{scanning && <span className="scan-message">正在扫描行李…</span>}<span className="scan-coordinate">SYS.04 // DUAL ENERGY</span><span className="crosshair">⌖</span></div><div className="item-tray">{passenger.items.map(i => <button onClick={() => onSelect(i)} disabled={scanning} key={i.id} aria-label={`选择${i.name}`} className={selected === i ? 'active' : ''}><ItemIcon item={i} color={i.color === 'orange' ? '#ca835e' : i.color === 'blue' ? '#609da8' : '#73947a'}/></button>)}<span className="tray-count">{passenger.items.length} ITEMS<br /><b>点击物品检查</b></span></div></section>; }
