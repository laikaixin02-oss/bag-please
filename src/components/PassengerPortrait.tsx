import { useEffect, useRef } from 'react';
import { portrait } from '../art/pixels';
import type { Passenger } from '../game/GameStateManager';
export function PassengerPortrait({ passenger, dangerous = false }: {
    passenger: Passenger; dangerous?: boolean;
}) { const ref = useRef<HTMLCanvasElement>(null); useEffect(() => { portrait(ref.current!, passenger); }, [passenger]); return <div className="portrait-frame"><canvas ref={ref} aria-label={`${passenger.name}的像素肖像`}/><span className="portrait-label">旅客窗口 / INTERVIEW</span><span className="live-dot"/>{dangerous && <div className="danger-seal" role="status"><b>危险人物</b><span>DANGEROUS PERSON</span><small>SECURITY CONFIRMED · 04</small></div>}</div>; }
