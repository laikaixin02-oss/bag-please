import { CURRENCY, PAY_RULES, type SecurityOutcome } from '../game/GameStateManager';
export function SecurityReport({ day, passengerId, outcome, message, onAcknowledge }: { day: number; passengerId: string; outcome: SecurityOutcome; message: string; onAcknowledge: () => void }) {
  return <section className={'security-report ' + outcome} role="alertdialog" aria-modal="true" aria-label="安保回报">
    <div className="security-report-header"><span><i /> SECURITY RADIO / SEC–04</span><span>旅客 {passengerId}</span></div>
    <h2>{outcome === 'intercepted' ? '危险旅客已拦截' : '安保已接管'}</h2>
    <p>{outcome === 'missed' ? '危险物品漏检，相关航班暂停登机。安保已接管现场，请有序撤离。' : message}</p>
    <div className="security-pay-impact">{outcome === 'intercepted' ? '处置正确，工资不扣减。安保已接手后续调查。' : `审核扣款 ${PAY_RULES.perError} ${CURRENCY}，严重漏检另扣 ${PAY_RULES.missedThreat} ${CURRENCY}。`}</div>
    <div className="citation-footer"><small>INCIDENT RECORD / DAY 0{day}</small><button className="citation-ack" autoFocus onClick={onAcknowledge}>{outcome === 'missed' ? '撤离' : '知悉'}</button></div>
  </section>;
}
