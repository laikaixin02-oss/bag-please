import data from '../data/passengers.json';
import shift from '../data/shift.json';
import dayTwo from '../data/passengers-day2.json';
export interface Item {
    id: string;
    name: string;
    kind: string;
    detail: string;
    rule: string;
    volume?: number;
    restricted?: boolean;
    securityEvidence?: boolean;
    art?: string;
    spareCell?: boolean;
    protectedTerminals?: boolean;
    equipmentCode?: string;
    permitCode?: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
}
export interface Passenger {
    id: string;
    name: string;
    latin: string;
    nation: string;
    code: string;
    flight: string;
    destination: string;
    skin: string;
    hair: string;
    coat: string;
    style: number;
    dialogue: string;
    replyGood: string;
    replyBad: string;
    items: Item[];
    voiceId?: string;
    day?: number;
    securityCase?: { intercepted: string; missed: string };
}
export const passengers = data as Passenger[];
export const dayTwoPassengers = dayTwo as Passenger[];
export function rosterFor(day: number) { return day === 2 ? dayTwoPassengers : passengers; }
export type Decision = 'approve' | 'secondary';
export function violations(p: Passenger) {
    const spareCount = p.items.filter(i => i.spareCell).length;
    return p.items.filter(i => i.restricted || (i.volume ?? 0) > 100 || (p.day === 2 && ((i.spareCell && (!i.protectedTerminals || spareCount > 2)) || (i.equipmentCode && !p.items.some(permit => permit.permitCode === i.equipmentCode)))));
}
export type SecurityOutcome = 'intercepted' | 'missed';
export function judge(p: Passenger, decision: Decision) {
    const bad = violations(p);
    const securityOutcome: SecurityOutcome | null = p.securityCase ? (decision === 'secondary' ? 'intercepted' : 'missed') : null;
    return {
        correct: decision === (bad.length ? 'secondary' : 'approve'),
        expected: bad.length ? 'secondary' : 'approve',
        reason: bad.length ? bad.map(i => `${i.name}${i.volume ? ` ${i.volume} ml` : i.spareCell ? '（核对数量与端子保护）' : i.equipmentCode ? '（许可编号不符）' : i.securityEvidence ? '（需安保核验）' : '（受限工具）'}`).join('、') + '，应转交人工复检。' : '所有物品符合本班次规定，可以放行。',
        securityOutcome,
        securityMessage: securityOutcome ? p.securityCase![securityOutcome] : null,
    };
}
export interface RecordEntry {
    id: string;
    decision: Decision;
    correct: boolean;
    reason: string;
    securityOutcome?: SecurityOutcome | null;
}

export const MAX_MISTAKES = 3;
export function shiftScore(records: RecordEntry[]) {
    return records.reduce((total, record) => total + (record.correct ? 20 : -10), 0);
}

export const CURRENCY = shift.currency.name;
export const PAY_RULES = shift.pay;
export const COLLEAGUES = shift.colleagues.map(peer => ({
    ...peer,
    accuracy: Math.round(peer.correct / peer.reviewed * 100),
    pay: Math.max(0, shift.pay.base - (peer.reviewed - peer.correct) * shift.pay.perError),
}));
export function calculatePayroll(records: RecordEntry[]) {
    const reviewed = Math.min(records.length, passengers.length);
    const mistakes = records.filter(record => !record.correct).length;
    const unworked = Math.round(shift.pay.base * (passengers.length - reviewed) / passengers.length);
    const auditDeduction = mistakes * shift.pay.perError;
    const incidentDeduction = records.some(record => record.securityOutcome === 'missed') ? shift.pay.missedThreat : 0;
    return {
        base: shift.pay.base,
        unworked,
        auditDeduction,
        incidentDeduction,
        net: Math.max(0, shift.pay.base - unworked - auditDeduction - incidentDeduction),
        projected: Math.max(0, shift.pay.base - auditDeduction - incidentDeduction),
        accuracy: reviewed ? Math.round((reviewed - mistakes) / reviewed * 100) : 0,
        reviewed,
        mistakes,
    };
}
