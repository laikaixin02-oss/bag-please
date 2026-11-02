import { useState } from 'react';
import { CURRENCY, PAY_RULES } from '../game/GameStateManager';

function AllowedItemIcons() {
  const icons = [
    { name: '笔记本电脑', path: 'M3 3h10v8H3z M1 12h14v2H1z M5 5h6v4H5z' },
    { name: '手机', path: 'M5 1h7v14H5z M7 3h3v8H7z M8 13h1' },
    { name: '相机', path: 'M2 5h12v8H2z M4 3h4v2H4z M6 7h5v4H6z M12 6h1' },
    { name: '书籍', path: 'M2 2h11v12H2z M4 2v12 M6 5h5 M6 8h4 M2 12h11' },
  ];
  return <div className="book-icons" aria-label="允许携带：笔记本电脑、手机、相机、书籍">{icons.map(icon => <svg key={icon.name} viewBox="0 0 16 16" role="img" aria-label={icon.name} shapeRendering="crispEdges"><title>{icon.name}</title><path d={icon.path} fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="miter" /></svg>)}</div>;
}

export function Rulebook({ day }: { day: number }) {
  const [page, setPage] = useState(0);
  return <section className="rulebook" aria-label="安检规则手册">
    <div className="book-tabs">{['安检规则', '值班须知', '安保通告', ...(day === 2 ? ['第二日通告'] : [])].map((name, i) => <button key={name} className={page === i ? 'active' : ''} onClick={() => setPage(i)}>{name}</button>)}</div>
    <div className="book-page left-page">
      <span className="page-index">{page === 2 ? 'SEC–04' : page ? '04' : '01'} / SECURITY DEPT.</span>
      <h3>{page === 3 ? '05 · 备用电芯' : page === 2 ? '封装设备核验' : page ? '审核流程' : '允许携带物品'}</h3>
      {page === 3 ? <><p>每包最多 2 枚。</p><p>每枚端子须有保护帽。</p><p>超量或未保护 → 复检</p></> : page === 2 ? <><p>注意无用途标识的</p><p>封装模块。请核对物品</p><p>外形与用途标识。</p></> : page ? <><p>检查扫描图中的物品。</p><p>核对物品信息与规则。</p><p>符合规定 → 放行。</p></> : <><AllowedItemIcons /><p>普通电子设备、书籍</p><p>衣物及日常个人物品</p></>}
      <span className="page-number">— {page === 2 ? '06' : page ? '04' : '01'} —</span>
    </div>
    <div className="book-binding" />
    <div className="book-page right-page">
      <span className="page-index">{page === 2 ? 'SEC–04' : page ? '05' : '02–03'} / RESTRICTIONS</span>
      <h3>{page === 3 ? '06 · 设备许可' : page === 2 ? '安保处置' : page ? '计薪与复检' : '液体与受限工具'}</h3>
      {page === 3 ? <><p>封装设备须附许可卡。</p><p>机身与许可编号须一致。</p><p>缺失或不符 → 复检</p></> : page === 2 ? <><p>未标识封装模块 → 复检</p><p>由安保接手后续核验。</p><p className="rule-note">普通电子设备仍按 01 审核。</p></> : page ? <><p>日薪 {PAY_RULES.base} {CURRENCY}</p><p>误判扣 {PAY_RULES.perError}，严重漏检另扣 {PAY_RULES.missedThreat}</p><p className="rule-note">每位旅客仅判定一次。</p></> : <><p><strong>02</strong> 单瓶液体 ≤ <b>100 ml</b></p><p><strong>03</strong> 尖锐金属工具 → 复检</p><p className="rule-note">以检查卡标注容量为准。</p></>}
      <span className="page-number">— {page === 2 ? '07' : page ? '05' : '02'} —</span>
    </div>
  </section>;
}
