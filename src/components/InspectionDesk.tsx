import type { Decision, Item, Passenger } from '../game/GameStateManager';
import { XRayScanner, ItemIcon } from './XRayScanner';
import { Rulebook } from './Rulebook';
import { DecisionControls } from './DecisionControls';
export function InspectionDesk({ day, passenger, selected, onSelect, onDecision, disabled, scanning }: {
    day: number;
    passenger: Passenger;
    selected: Item | null;
    onSelect: (i: Item) => void;
    onDecision: (d: Decision) => void;
    disabled: boolean;
    scanning: boolean;
}) { return <section className="desk"><div className="desk-main"><XRayScanner passenger={passenger} selected={selected} onSelect={onSelect} scanning={scanning}/><Rulebook key={day} day={day} /></div><div className="desk-side"><div className="inspection-card"><div className="card-top"><span>物品检查记录</span><b>SEC–01</b></div>{selected ? <><div className="card-item"><div className="item-illustration"><ItemIcon item={selected}/></div><div><h3>{selected.name}</h3><span>{selected.kind}</span></div></div><p className="item-detail">{selected.detail}</p><div className="card-rule"><span>核对依据</span><p>{selected.rule}</p></div></> : <div className="empty-card"><span className="magnify-icon"/><h3>等待物品检查</h3><p>点击 X 光图像中的物品<br />查看名称、容量与审核依据。</p></div>}<div className="card-bottom">BAG {passenger.id}<span>INSPECTOR 084</span></div></div><div className="decision-label"><i /> 安检处置 / DECISION</div><DecisionControls disabled={disabled} onDecision={onDecision}/></div></section>; }
