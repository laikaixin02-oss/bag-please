import { CURRENCY, COLLEAGUES, MAX_MISTAKES, PAY_RULES, calculatePayroll, passengers, type RecordEntry } from '../game/GameStateManager';

interface Props { day: number; onNextDay?: () => void; records: RecordEntry[]; reassessment: boolean; evacuated: boolean; onRestart: () => void; onTitle: () => void }

export function PayrollSettlement({ day, onNextDay, records, reassessment, evacuated, onRestart, onTitle }: Props) {
  const pay = calculatePayroll(records);
  const security = records.find(record => record.securityOutcome)?.securityOutcome;
  const best = Math.max(...COLLEAGUES.map(peer => peer.pay));
  return <div className="summary-overlay"><section className={'payroll-paper' + (reassessment ? ' reassessment-paper' : '')} role="dialog" aria-modal="true" aria-label="本日工资结算">
    <div className="payroll-top"><span>ARSTIA AIRPORT / PAYROLL OFFICE</span><span>HZ · 航铢</span></div>
    <h1>本日工资结算</h1>
    <div className="payroll-date"><span>2026.10.{day === 1 ? 19 : 20}　·　检查员 084</span><span>DAY {day} / {evacuated ? '应急撤离' : pay.reviewed === passengers.length ? '班次完成' : '提前结算'}</span></div>
    {reassessment && <div className="payroll-reassessment">请重新考核入职 · 累计 {MAX_MISTAKES} 次失误，当前班次暂停。</div>}
    <div className="payroll-columns">
      <div className="wage-ledger">
        <h2>你的工资单</h2>
        <div className="wage-row"><span>本日应得工资</span><b>{pay.base} {CURRENCY}</b></div>
        {pay.unworked > 0 && <div className="wage-row deduction"><span>未完成任务<small>剩余 {passengers.length - pay.reviewed} 位未审核</small></span><b>−{pay.unworked} {CURRENCY}</b></div>}
        <div className="wage-row deduction"><span>审核扣款<small>{pay.mistakes} 次 × {PAY_RULES.perError} {CURRENCY}</small></span><b>−{pay.auditDeduction} {CURRENCY}</b></div>
        {pay.incidentDeduction > 0 && <div className="wage-row deduction"><span>严重漏检追加</span><b>−{pay.incidentDeduction} {CURRENCY}</b></div>}
        <div className="wage-net"><span>今日实发</span><b>{pay.net}<small>{CURRENCY}</small></b></div>
        <p className="currency-note">航铢 HZ · 阿斯提亚机场薪酬货币</p>
      </div>
      <div className="colleague-ledger">
        <h2>同事本日表现</h2>
        <div className="peer-head"><span>检查员</span><span>正确率</span><span>实发</span></div>
        {COLLEAGUES.map(peer => <div className="peer-row" key={peer.id}><span>{peer.id}　{peer.name}</span><b>{peer.accuracy}%</b><span>{peer.pay} {CURRENCY}</span></div>)}
        <div className={'peer-comparison' + (pay.net < best ? ' behind' : '')}>{pay.net < best ? <>你比本组最高实发少 <b>{best - pay.net}</b> {CURRENCY}。</> : '你与本组最高实发持平。'}<small>每一次判断，都记入本日薪酬。</small></div>
        <p className="peer-fiction">同事数据为本关预设的虚构记录。</p>
      </div>
    </div>
    <div className="payroll-performance"><span>已审 {pay.reviewed} / {passengers.length}</span><span>审核正确率 <b>{pay.accuracy}%</b></span><span>失误 {pay.mistakes} / {MAX_MISTAKES}</span></div>
    <div className="payroll-records" aria-label="逐人审核记录">{records.map(record => <span key={record.id} className={record.correct ? 'good' : 'bad'}>{record.id} {record.correct ? '正确' : '有误'}</span>)}</div>
    {security && <div className={'payroll-security ' + security}>{security === 'intercepted' ? '安保回报：危险旅客已拦截，通道恢复正常运行。' : '已撤离工作台。危险装置漏检，航班暂停登机，事件已进入复盘。'}</div>}
    {onNextDay && <p className="next-day-note">正确率达到 60%，工资结算后将自动进入第二关。</p>}
    <div className="payroll-actions">{onNextDay && <button className="next-button" onClick={onNextDay}>进入第二关 · DAY 2　→</button>}<button className="next-button" onClick={onRestart}>{reassessment ? '开始入职复考' : day === 1 ? '重玩第一关' : '重玩第二关'}　↻</button><button className="return-title" onClick={onTitle}>返回标题</button></div>
    <p className="fiction-note">虚构规则与货币，仅供游戏体验。</p>
  </section></div>;
}
