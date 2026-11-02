import Phaser from 'phaser';
import { bitmapText } from '../art/bitmapText';
import { noise, rect, person, poly } from '../art/pixels';
import { passengers as dayOnePassengers, type Passenger, type SecurityOutcome } from './GameStateManager';
export type LockdownStage = 'idle' | 'flights-held' | 'gate-closing' | 'sealed';

export class AirportQueueScene extends Phaser.Scene {
    roster: Passenger[] = dayOnePassengers;
    people: Phaser.GameObjects.Image[] = [];
    active?: Phaser.GameObjects.Image;
    index = 0;
    ready = false;
    securityGuard?: Phaser.GameObjects.Image;
    gateLight?: Phaser.GameObjects.Rectangle;
    escorting = false;
    moving = false;
    lockdownStage: LockdownStage = 'idle';
    onLockdownStage?: (stage: LockdownStage) => void;
    private heldBoard?: Phaser.GameObjects.Image;
    private suspendedSign?: Phaser.GameObjects.Image;
    private shutter?: Phaser.GameObjects.Image;
    private shutterEdge?: Phaser.GameObjects.Image;
    private emergencyLights?: Phaser.GameObjects.Container;
    private floorMarkers?: Phaser.GameObjects.Graphics;
    private reducedMotion = false;
    constructor() { super('AirportQueueScene'); }
    create() {
        this.people = [];
        this.moving = false;
        this.index = 0;
        this.ready = false;
        this.escorting = false;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.setLockdownStage('idle');
        const cv = document.createElement('canvas');
        cv.width = 480;
        cv.height = 75;
        const c = cv.getContext('2d')!;
        const r = (x: number, y: number, w: number, h: number, col: string) => rect(c, x, y, w, h, col);
        r(0, 0, 480, 75, '#77756a');
        r(0, 0, 480, 51, '#59645f');
        for (let x = 3; x < 480; x += 41) {
            r(x, 0, 37, 44, '#738a89');
            r(x, 22, 37, 12, '#6c7c74');
            poly(c, [[x, 33], [x + 8, 23], [x + 17, 27], [x + 28, 18], [x + 37, 25], [x + 37, 38], [x, 38]], '#69766e');
            r(x + 1, 0, 2, 44, '#afb2a0');
            r(x + 36, 0, 5, 48, '#353f3d');
            r(x, 18, 38, 2, '#3c4c49');
            poly(c, [[x + 27, 0], [x + 30, 0], [x + 7, 42], [x + 4, 42]], '#95a396');
        }
        r(0, 42, 480, 11, '#7a7a6a');
        r(0, 49, 480, 4, '#a29a80');
        r(0, 53, 480, 22, '#696a5c');
        for (let x = 0; x < 480; x += 32) {
            r(x, 53, 1, 22, '#555b51');
        }
        r(0, 64, 480, 1, '#878573');
        noise(c, 480, 75, 1800, ['#9c98821a', '#303c3228', '#d4c9a51a']);
        for (const x of [9, 205, 347]) {
            r(x, 0, 12, 48, '#4c514b');
            r(x + 2, 0, 7, 48, '#696c60');
            r(x + 3, 27, 6, 9, '#b08b49');
            r(x + 3, 27, 6, 1, '#cfaf6b');
        }
        // Native bitmap lettering stays legible under nearest-neighbor scaling.
        r(22, 1, 126, 31, '#92917a');
        r(23, 2, 124, 29, '#27352f');
        r(25, 3, 120, 27, '#14251f');
        const columns = [28, 62, 112];
        ['FLIGHT', 'TO', 'STATUS'].forEach((value, col) => bitmapText(c, value, columns[col], 4, '#dcd1ba'));
        r(28, 10, 115, 1, '#52634b');
        const flights = [['AT102', 'TOKYO', 'ON TIME'], ['VL218', 'SINGAPORE', 'ON TIME'], ['ND307', 'SEOUL', 'BOARDING']];
        flights.forEach((row, i) => row.forEach((value, col) => bitmapText(c, value, columns[col], 11 + i * 6, col === 2 && i === 2 ? '#aebb85' : '#d7ac69')));
        r(256, 25, 8, 39, '#3a403c');
        r(286, 25, 8, 39, '#3a403c');
        r(254, 22, 42, 6, '#a7a394');
        r(258, 23, 34, 2, '#787b6c');
        r(269, 23, 5, 2, '#b09a51');
        r(276, 23, 4, 2, '#546850');
        r(256, 28, 4, 36, '#9a9986');
        r(288, 28, 4, 36, '#8c8e7b');
        r(256, 63, 8, 2, '#303932');
        r(286, 63, 8, 2, '#303932');
        r(261, 3, 32, 13, '#343d37');
        c.fillStyle = '#d0b780';
        c.font = '5px monospace';
        c.fillText('SECURITY', 265, 9);
        c.fillText('CHECK', 270, 14);
        r(317, 28, 38, 34, '#343e38');
        r(319, 28, 33, 30, '#939281');
        r(321, 29, 29, 2, '#c5baa1');
        r(322, 38, 24, 21, '#25312b');
        r(325, 40, 18, 17, '#101e1c');
        r(327, 44, 14, 12, '#233631');
        r(330, 40, 8, 3, '#a39d83');
        c.font = '5px monospace';
        c.fillStyle = '#303a32';
        c.fillText('X-RAY', 325, 36);
        r(306, 54, 17, 8, '#494f43');
        r(352, 54, 83, 7, '#292f2b');
        for (let x = 354; x < 435; x += 5)
            r(x, 55, 2, 4, '#5d6559');
        r(353, 61, 82, 3, '#a09c85');
        r(358, 64, 3, 8, '#393f36');
        r(424, 64, 3, 8, '#393f36');
        for (let j = 0; j < 3; j++) {
            let x = 365 + j * 23;
            r(x, 45 - j % 2 * 3, 15, 10 + j % 2 * 3, ['#865d47', '#547a84', '#8a8b4e'][j]);
            r(x + 5, 42 - j % 2 * 3, 6, 3, '#343f36');
            r(x + 2, 45 - j % 2 * 3, 2, 10 + j % 2 * 3, '#b39a6c');
        }
        for (let x = 252; x < 435; x += 11)
            r(x, 70, 7, 2, '#bc9d52');
        r(247, 32, 2, 39, '#bc9d52');
        r(437, 40, 40, 4, '#535f52');
        r(440, 32, 16, 10, '#3a5146');
        r(459, 32, 16, 10, '#3a5146');
        r(450, 15, 5, 17, '#535a40');
        r(446, 21, 12, 5, '#4c6046');
        r(448, 31, 9, 8, '#625c47');
        r(440, 52, 37, 16, '#343c34');
        r(439, 47, 39, 7, '#9a9b80');
        r(442, 38, 15, 11, '#253a36');
        r(459, 38, 16, 11, '#253a36');
        r(444, 40, 11, 6, '#658d85');
        r(461, 40, 12, 6, '#658d85');
        r(456, 60, 13, 12, '#27312b');
        if (this.textures.exists('terminal'))
            this.textures.remove('terminal');
        this.textures.addCanvas('terminal', cv);
        this.add.image(0, 0, 'terminal').setOrigin(0).setScale(2);
        for (let i = 0; i < 8; i++) {
            const p = this.roster[i % this.roster.length];
            if (this.textures.exists('p' + i))
                this.textures.remove('p' + i);
            this.textures.addCanvas('p' + i, person(p));
            for (let f = 0; f < 2; f++) {
                const k = 'p' + i + 'w' + f;
                if (this.textures.exists(k))
                    this.textures.remove(k);
                this.textures.addCanvas(k, person(p, true, f));
            }
        }
        for (let i = 0; i < 7; i++) {
            const im = this.add.image(45 + i * 55, 123, 'p' + ((6 - i) % this.roster.length)).setOrigin(.5, 1).setScale(1.7);
            this.people.push(im);
        }
        this.active = this.add.image(548, 128, 'p0').setOrigin(.5, 1).setScale(1.7);
        const guard = person({ ...this.roster[1], coat: '#354b51', hair: '#1e2d2c', skin: '#b99a74' });
        if (this.textures.exists('guard'))
            this.textures.remove('guard');
        this.textures.addCanvas('guard', guard);
        this.securityGuard = this.add.image(477, 125, 'guard').setScale(1.7).setOrigin(.5, 1);
        this.gateLight = this.add.rectangle(552, 48, 8, 3, 0x9aab73);
        this.add.rectangle(477, 70, 17, 5, 0x1f3032);
        this.add.rectangle(480, 70, 4, 2, 0xb49a55);
        // Rails sit in front of the queue, reinforcing the fixed inspection lane.
        this.add.image(925, 143, 'guard').setScale(1.6).setOrigin(.5, 1);
        this.add.rectangle(925, 130, 18, 13, 0x27372e).setStrokeStyle(2, 0x1c2b24);
        const g = this.add.graphics();
        for (let i = 0; i < 9; i++) {
            const x = 15 + i * 48;
            g.fillStyle(0x222d29).fillRect(x, 112, 4, 33).fillRect(x - 4, 144, 12, 3);
            g.fillStyle(0x999b84).fillRect(x, 113, 1, 29);
            if (i < 8) {
                g.fillStyle(0x344a4b).fillRect(x + 4, 115, 45, 3);
            }
        }
        this.createLockdownAssets();
        this.ready = true;
    }
    advance(index: number) { if (!this.ready || this.moving)
        return; this.moving = true; this.index = index; const old = this.active!; this.tweens.add({ targets: old, x: 650, alpha: 0, duration: 680, onComplete: () => old.destroy() }); const p = this.roster[index]; if (!p) {
        this.moving = false;
        return;
    } const incoming = this.people.pop()!; this.active = incoming; incoming.setTexture('p' + index); this.tweens.add({ targets: incoming, x: 548, y: 128, duration: 1000, ease: 'Sine.easeInOut', onComplete: () => { this.moving = false; incoming.y = 128; } }); this.people.forEach(im => this.tweens.add({ targets: im, x: im.x + 55, duration: 700, ease: 'Sine.easeInOut' })); const back = this.add.image(0, 123, 'p' + ((index + 2) % this.roster.length)).setOrigin(.5, 1).setScale(1.7); this.people.unshift(back); this.tweens.add({ targets: back, x: 45, duration: 700 }); }
    resolveSecurity(outcome: SecurityOutcome) {
        if (!this.ready || !this.active || !this.securityGuard) return;
        this.gateLight?.setFillStyle(outcome === 'intercepted' ? 0x9aa968 : 0xc45b40);
        if (outcome === 'intercepted') {
            this.escorting = true;
            const traveler = this.active;
            const guard = this.securityGuard;
            this.tweens.add({ targets: guard, x: 521, duration: 500, onComplete: () => {
                this.tweens.add({ targets: traveler, x: 660, alpha: 0, duration: 1050, onComplete: () => { traveler.setVisible(false); this.escorting = false; } });
                this.tweens.add({ targets: guard, x: 638, duration: 1050, onComplete: () => {
                    this.tweens.add({ targets: guard, x: 477, duration: 800, delay: 200 });
                } });
            } });
        } else {
            this.startLockdown();
        }
    }
    private setLockdownStage(stage: LockdownStage) {
        this.lockdownStage = stage;
        this.onLockdownStage?.(stage);
    }
    private pixelImage(key: string, canvas: HTMLCanvasElement, x: number, y: number) {
        if (this.textures.exists(key)) this.textures.remove(key);
        this.textures.addCanvas(key, canvas);
        return this.add.image(x, y, key).setOrigin(0).setScale(2).setVisible(false);
    }
    private createLockdownAssets() {
        const board = document.createElement('canvas'); board.width = 126; board.height = 31;
        const c = board.getContext('2d')!;
        rect(c, 0, 0, 126, 31, '#92917a'); rect(c, 1, 1, 124, 29, '#27352f'); rect(c, 3, 2, 120, 27, '#14251f');
        const cols = [6, 40, 90];
        ['FLIGHT', 'TO', 'STATUS'].forEach((label, i) => bitmapText(c, label, cols[i], 3, '#dcd1ba'));
        rect(c, 6, 9, 115, 1, '#52634b');
        [['AT102','TOKYO','HOLD'],['VL218','SINGAPORE','HOLD'],['ND307','SEOUL','HOLD']].forEach((row, i) => row.forEach((value, col) => bitmapText(c, value, cols[col], 10 + i * 6, col === 2 ? '#ff694c' : '#d7ac69')));
        this.heldBoard = this.pixelImage('lockdown-board', board, 44, 2).setDepth(8);
        const sign = document.createElement('canvas'); sign.width = 64; sign.height = 18;
        const sc = sign.getContext('2d')!;
        rect(sc, 0, 0, 64, 18, '#e75434'); rect(sc, 1, 1, 62, 16, '#361b17');
        bitmapText(sc, 'BOARDING', 16, 3, '#ff6a44'); bitmapText(sc, 'SUSPENDED', 14, 10, '#ff6a44');
        this.suspendedSign = this.pixelImage('lockdown-sign', sign, 488, 0).setDepth(9);
        const gate = document.createElement('canvas'); gate.width = 28; gate.height = 34;
        const gc = gate.getContext('2d')!;
        rect(gc, 0, 0, 28, 34, '#686d5b');
        for (let y = 0; y < 34; y += 3) { rect(gc, 0, y, 28, 1, '#92917a'); rect(gc, 0, y + 2, 28, 1, '#414c3e'); }
        rect(gc, 0, 0, 2, 34, '#303c32'); rect(gc, 26, 0, 2, 34, '#303c32');
        this.shutter = this.pixelImage('lockdown-shutter', gate, 520, 58).setDepth(12);
        const edge = document.createElement('canvas'); edge.width = 28; edge.height = 7;
        const ec = edge.getContext('2d')!;
        rect(ec, 0, 0, 28, 7, '#242820');
        for (let x = -7; x < 35; x += 10) poly(ec, [[x,7],[x+7,0],[x+12,0],[x+5,7]], '#bd8b49');
        poly(ec, [[12,0],[16,0],[18,2],[18,5],[16,7],[12,7],[10,5],[10,2]], '#994831');
        rect(ec, 12, 3, 4, 1, '#e6c6a0');
        this.shutterEdge = this.pixelImage('lockdown-edge', edge, 520, 58).setDepth(13);
        this.emergencyLights = this.add.container(0, 0).setDepth(20).setVisible(false);
        const tint = this.add.graphics().fillStyle(0x231417, .26).fillRect(0, 0, 960, 150);
        tint.fillStyle(0xbf3725, .2).fillRect(0, 92, 960, 58);
        [25, 390, 550, 680, 820, 940].forEach(x => {
          tint.fillStyle(0xd83a21,.08).fillRect(x-34,0,68,150);
          tint.fillStyle(0xe94a29,.12).fillRect(x-13,0,26,150);
          tint.fillStyle(0xfa4b24,.18).fillRect(x-5,0,10,140);
        });
        this.emergencyLights.add(tint);
        [20, 304, 405, 552, 695, 820, 944].forEach((x, i) => {
            const post = this.add.graphics().fillStyle(0x2d3026).fillRect(x-1, 29, 3, 55);
            const beacon = this.add.graphics();
            beacon.fillStyle(0xff351c, .1).fillRect(x-24, 8, 49, 36);
            beacon.fillStyle(0xff3d1c, .2).fillRect(x-15, 14, 31, 24);
            beacon.fillStyle(0xff4b21, .35).fillRect(x-8, 20, 17, 10);
            beacon.fillStyle(0xee3e20).fillRect(x-5, 23, 11, 5);
            beacon.fillStyle(0xff652b).fillRect(x-3, 23, 7, 3);
            beacon.fillStyle(0xffdb8a).fillRect(x-1, 23, 3, 2);
            this.emergencyLights!.add([post, beacon]);
            if (!this.reducedMotion) this.tweens.add({ targets: beacon, alpha: .65, duration: 700, yoyo: true, repeat: -1, delay: i % 2 * 350 });
        });
        this.floorMarkers = this.add.graphics().setDepth(21).setVisible(false);
        for (let x = 10; x < 960; x += 20) {
            this.floorMarkers.fillStyle(0xf43b24).fillRect(x, 142, 10, 4);
            this.floorMarkers.fillStyle(0xff652b).fillRect(x+2, 142, 6, 2);
        }
    }
    private startLockdown() {
        if (this.lockdownStage !== 'idle') return;
        this.heldBoard?.setVisible(true);
        this.suspendedSign?.setVisible(true);
        this.emergencyLights?.setVisible(true);
        this.gateLight?.setFillStyle(0xff4827).setSize(20,5);
        this.setLockdownStage('flights-held');
        this.tweens.add({ targets: this.active, x: 680, alpha: 0, duration: 450 });
        if (this.gateLight && !this.reducedMotion) this.tweens.add({ targets: this.gateLight, alpha: .3, yoyo: true, repeat: -1, duration: 700 });
        this.time.delayedCall(450, () => {
            this.setLockdownStage('gate-closing');
            this.shutter?.setVisible(true).setCrop(0, 0, 28, 1);
            const reveal = { height: 0 };
            this.tweens.add({ targets: reveal, height: 34, duration: this.reducedMotion ? 1 : 650, ease: 'Sine.easeIn', onUpdate: () => {
                const height = Math.max(1, Math.round(reveal.height));
                this.shutter?.setCrop(0, 0, 28, height);
                this.shutterEdge?.setY(58 + height * 2 - 14).setVisible(height >= 7);
            }, onComplete: () => {
                this.shutter?.setCrop(0, 0, 28, 34);
                this.shutterEdge?.setY(112).setVisible(true);
                this.floorMarkers?.setVisible(true);
                this.setLockdownStage('sealed');
            } });
        });
    }
    update(time: number) { if ((this.moving || this.escorting) && this.active) {
        this.active.y = 128 + Math.floor(Math.sin(time * .025) * 2);
        this.active.setTexture('p' + this.index + 'w' + Math.floor(time / 150) % 2);
        this.people.forEach((im, i) => { im.y = 123 + Math.floor(Math.sin(time * .025 + i) * 1); });
    }
    else if (this.active) {
        this.active.setTexture('p' + this.index);
        this.people.forEach(im => im.y = 123);
    } }
}
