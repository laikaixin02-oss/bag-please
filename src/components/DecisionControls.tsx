import type { Decision } from '../game/GameStateManager';
export function DecisionControls({ disabled, onDecision }: {
    disabled: boolean;
    onDecision: (d: Decision) => void;
}) { return <div className="decision-controls"><button className="decision approve" disabled={disabled} onClick={() => onDecision('approve')} aria-label="放行"><span className="stamp-icon">↗</span><b>放行</b><small>APPROVE</small></button><button className="decision secondary" disabled={disabled} onClick={() => onDecision('secondary')} aria-label="人工复检"><span className="stamp-icon stop-icon">×</span><b>人工复检</b><small>SECONDARY</small></button></div>; }
