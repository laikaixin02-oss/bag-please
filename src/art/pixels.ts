import type { Passenger, Item } from '../game/GameStateManager';
export function rect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
export function poly(c: CanvasRenderingContext2D, points: number[][], color: string) { c.fillStyle = color; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); }
export function noise(c: CanvasRenderingContext2D, w: number, h: number, n: number, colors: string[], seed = 7) { let v = seed; for (let i = 0; i < n; i++) {
    v = (v * 1664525 + 1013904223) >>> 0;
    const x = v % w;
    v = (v * 1664525 + 1013904223) >>> 0;
    const y = v % h;
    rect(c, x, y, 1 + (i % 3), 1, colors[i % colors.length]);
} }
export function person(p: Passenger, walking = false, frame = 0) { const cv = document.createElement('canvas'); cv.width = 18; cv.height = 35; const c = cv.getContext('2d')!; const r = (x: number, y: number, w: number, h: number, col: string) => rect(c, x, y, w, h, col); r(4, 32, 11, 2, '#2a2824'); r(6, 21, 3, 11, '#343737'); r(10, 21, 3, 11, '#292d30'); if (walking) {
    r(6, 29, 3, 4, '#6e695c');
    r(10, 30 + (frame % 2 ? -2 : 0), 3, 3, '#747066');
} r(5, 12, 9, 12, p.coat); r(6, 13, 2, 9, '#bdac8c'); r(4, 14, 2, 10, p.coat); r(14, 14, 2, 9, p.coat); r(4, 24, 2, 3, p.skin); r(14, 23, 2, 3, p.skin); r(7, 9, 5, 4, p.skin); r(6, 3, 8, 7, p.hair); r(7, 5, 6, 6, p.skin); r(6, 3, 8, 3, p.hair); r(11, 7, 1, 1, '#221b19'); r(7, 32, 3, 2, '#171b1d'); r(11, 32, 4, 2, '#171b1d'); r(1, 13, 3, 10, '#303b35'); r(15, 25, 3, 7, '#5b4533'); r(15, 24, 3, 1, '#a28c61');
    if (p.style >= 6) {
        const s = p.style - 6;
        if (s === 0) { r(5,2,10,3,p.hair); r(14,4,3,7,p.hair); r(5,13,10,2,'#a97f5b'); }
        if (s === 1) { r(4,2,11,5,p.hair); r(3,6,4,8,p.hair); r(12,6,4,8,p.hair); }
        if (s === 2) { r(6,1,9,4,p.hair); r(5,4,10,2,p.hair); r(7,10,6,2,p.hair); r(6,15,8,2,'#bca67e'); }
        if (s === 3) { r(6,2,8,3,p.hair); r(5,5,2,5,p.hair); r(7,7,6,1,'#403e39'); r(8,15,2,7,'#b3a485'); }
        if (s === 4) { r(5,2,10,3,'#8d774d'); r(4,5,12,2,'#685938'); r(8,11,5,2,p.hair); }
        if (s === 5) { r(6,1,9,4,p.hair); r(7,4,4,3,p.hair); r(6,15,8,2,'#8d5346'); }
    }
    return cv; }
export function portrait(canvas: HTMLCanvasElement, p: Passenger) { canvas.width = 156; canvas.height = 93; const c = canvas.getContext('2d')!; const r = (x: number, y: number, w: number, h: number, col: string) => rect(c, x, y, w, h, col); r(0, 0, 156, 93, '#535b54'); for (let x = 0; x < 156; x += 39) {
    r(x, 0, 2, 93, '#303b37');
    r(x + 2, 0, 1, 93, '#778174');
} r(0, 52, 156, 2, '#303b37'); poly(c, [[98, 0], [106, 0], [59, 93], [51, 93]], '#6b7468'); poly(c, [[114, 0], [117, 0], [70, 93], [67, 93]], '#767d70'); noise(c, 156, 93, 230, ['#5e655b', '#4b554e']); if (p.style >= 6) { portraitDayTwo(c, p); return; } const s = p.style; const hair = p.hair; const skin = p.skin; poly(c, [[47, 59], [43, 28], [49, 13], [61, 5], [83, 5], [97, 13], [105, 28], [104, 64], [94, 77], [51, 76]], hair); if (s === 5) { r(43, 41, 11, 30, '#535b54'); r(95, 37, 11, 34, '#535b54'); } if (s === 1 || s === 3)
    r(45, 41, 12, 25, '#535b54'); poly(c, [[20, 93], [25, 78], [42, 69], [60, 65], [89, 65], [111, 72], [126, 84], [130, 93]], p.coat); poly(c, [[61, 56], [86, 56], [89, 75], [77, 84], [58, 72]], skin); r(64, 63, 19, 6, '#a97c5c'); poly(c, [[53, 26], [59, 18], [83, 18], [94, 29], [94, 49], [88, 60], [77, 67], [65, 63], [56, 52]], skin); poly(c, [[53, 26], [59, 18], [67, 20], [62, 29], [59, 48], [63, 58], [57, 51]], '#ad8063'); poly(c, [[83, 19], [94, 29], [94, 49], [89, 55], [89, 30]], '#ae8066'); poly(c, [[49, 31], [51, 18], [61, 10], [81, 9], [96, 20], [99, 32], [88, 28], [78, 18], [62, 24]], hair); if (s === 2) {
    r(50, 25, 8, 14, hair);
    r(91, 20, 7, 21, hair);
} r(60, 35, 10, 2, '#49372e'); r(81, 35, 10, 2, '#49372e'); r(62, 39, 7, 2, '#2d2925'); r(82, 39, 7, 2, '#2d2925'); r(64, 38, 2, 3, '#332a24'); r(84, 38, 2, 3, '#332a24'); r(62, 41, 7, 1, '#e4be99'); r(82, 41, 7, 1, '#e4be99'); poly(c, [[75, 39], [73, 48], [79, 48], [79, 46], [76, 45]], '#a7795e'); r(70, 54, 13, 1, '#815447'); r(73, 55, 8, 1, '#bf8a72'); r(57, 46, 3, 6, '#c6a181'); if (s === 0 || s === 4) {
    r(53, 48, 2, 6, '#c6a15c');
    r(94, 47, 2, 6, '#c6a15c');
} if (s === 1) {
    r(63, 54, 6, 5, hair);
    r(84, 54, 5, 5, hair);
    r(67, 59, 18, 3, hair);
} if (s === 3) {
    r(59, 37, 13, 7, '#30383a');
    r(79, 37, 13, 7, '#30383a');
    r(72, 39, 7, 1, '#30383a');
    r(61, 39, 9, 3, '#8f9c8e');
    r(81, 39, 9, 3, '#8f9c8e');
} poly(c, [[58, 66], [66, 73], [77, 83], [65, 93], [54, 76]], '#d0ba96'); poly(c, [[88, 66], [81, 78], [77, 83], [92, 93], [99, 73]], '#c2a681'); poly(c, [[67, 73], [77, 83], [83, 76], [86, 93], [65, 93]], '#33352f'); r(35, 80, 3, 13, '#cfb894'); r(109, 79, 4, 14, '#725d47'); noise(c, 156, 93, 100, ['#7c776233', '#201b1922'], p.style + 22); r(0, 89, 156, 4, '#33382f'); }
export function itemArt(c: CanvasRenderingContext2D, item: Item, x: number, y: number, w: number, h: number, color: string, fill = true, pixelAspect = 1) {
    c.save();
    c.translate(x, y);
    const art = item.art ?? item.id;
    if (art === 'camera' || art === 'cable') {
        // The X-ray canvas is wider on screen than its data grid. Compensate for
        // that presentation stretch as well as fitting the item slot uniformly.
        const nativeHeight = art === 'camera' ? 48 : 40;
        const scale = Math.min(w * pixelAspect / 64, h / nativeHeight);
        c.translate((w - 64 * scale / pixelAspect) / 2, (h - nativeHeight * scale) / 2);
        c.scale(scale / pixelAspect, scale);
    } else c.scale(w / 64, h / 64);
    c.lineWidth = 2; c.strokeStyle = color; c.fillStyle = color; const box = (a: number, b: number, d: number, e: number) => { if (fill) {
    c.globalAlpha = .2;
    c.fillRect(a, b, d, e);
    c.globalAlpha = 1;
} c.strokeRect(a, b, d, e); }; const line = (pts: number[][]) => { c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.stroke(); }; switch (art) {
    case 'camera':
        // Compact body, raised viewfinder, grip, flash, and concentric pixel lens.
        if (fill) {
            c.globalAlpha = .2;
            c.fillRect(5, 14, 54, 29);
            c.globalAlpha = 1;
        }
        line([[6,13],[58,13],[58,15],[60,15],[60,42],[58,42],[58,44],[6,44],[6,42],[4,42],[4,15],[6,15],[6,13]]);
        box(16, 6, 18, 7);
        box(49, 17, 7, 4);
        line([[9,17],[15,17],[15,40],[9,40]]);
        line([[30,16],[38,16],[38,18],[42,18],[42,20],[44,20],[44,24],[46,24],[46,32],[44,32],[44,36],[42,36],[42,38],[38,38],[38,40],[30,40],[30,38],[26,38],[26,36],[24,36],[24,32],[22,32],[22,24],[24,24],[24,20],[26,20],[26,18],[30,18],[30,16]]);
        line([[31,21],[37,21],[37,23],[39,23],[39,25],[41,25],[41,31],[39,31],[39,33],[37,33],[37,35],[31,35],[31,33],[29,33],[29,31],[27,31],[27,25],[29,25],[29,23],[31,23],[31,21]]);
        c.fillRect(31, 24, 2, 2);
        break;
    case 'cable':
        // Three rounded, staggered loops with loose leads and distinct USB plugs.
        line([[19,8],[39,8],[39,10],[45,10],[45,12],[49,12],[49,16],[51,16],[51,24],[49,24],[49,28],[45,28],[45,30],[39,30],[39,32],[19,32],[19,30],[13,30],[13,28],[9,28],[9,24],[7,24],[7,16],[9,16],[9,12],[13,12],[13,10],[19,10],[19,8]]);
        line([[20,13],[38,13],[38,15],[43,15],[43,18],[46,18],[46,23],[43,23],[43,26],[38,26],[38,28],[20,28],[20,26],[15,26],[15,23],[12,23],[12,18],[15,18],[15,15],[20,15],[20,13]]);
        line([[22,18],[36,18],[36,20],[40,20],[40,23],[36,23],[36,24],[22,24],[22,23],[18,23],[18,20],[22,20],[22,18]]);
        line([[13,12],[13,4],[11,4]]);
        box(1, 1, 10, 7);
        line([[4,3],[4,6],[7,3],[7,6]]);
        line([[43,27],[52,27],[52,35],[56,35]]);
        box(56, 32, 7, 6);
        line([[58,34],[61,34]]);
        // A small keeper strap makes the coiled bundle read as a real cable.
        c.globalAlpha = .18;
        c.fillRect(27, 8, 5, 24);
        c.globalAlpha = 1;
        line([[27,8],[32,8],[32,13],[27,13],[27,8]]);
        break;
    case 'lens':
        line([[19,5],[43,5],[43,9],[52,9],[52,17],[57,17],[57,44],[52,44],[52,53],[43,53],[43,58],[19,58],[19,53],[10,53],[10,44],[5,44],[5,17],[10,17],[10,9],[19,9],[19,5]]);
        box(17,17,28,29);box(23,23,16,17);line([[9,22],[17,22],[9,39],[17,39],[45,22],[54,22],[45,39],[54,39]]);break;
    case 'memory-card':
        box(4,9,56,46);box(11,16,17,29);box(35,16,17,29);
        for(let a=14;a<26;a+=4)box(a,34,2,6);for(let a=38;a<50;a+=4)box(a,34,2,6);break;
    case 'brush':
        box(26,29,12,32);box(17,18,30,12);line([[17,18],[14,3],[49,3],[47,18]]);
        for(let a=19;a<47;a+=6)line([[a,5],[a,18]]);break;
    case 'violin':
        line([[27,3],[37,3],[37,25],[47,29],[48,36],[43,41],[48,47],[47,56],[40,61],[24,61],[17,56],[16,47],[21,41],[16,36],[17,29],[27,25],[27,3]]);
        box(28,8,8,43);line([[23,35],[25,38],[23,42],[41,35],[39,38],[41,42],[26,48],[38,48]]);box(29,54,6,8);break;
    case 'bow':
        line([[26,3],[36,3],[36,61],[26,61],[26,3],[29,7],[29,57]]);box(22,48,16,10);break;
    case 'metronome':
        line([[22,4],[42,4],[56,60],[8,60],[22,4]]);box(23,14,18,32);line([[31,44],[42,12]]);box(35,21,9,8);box(13,53,38,4);break;
    case 'rosin':
        box(7,20,50,34);box(13,9,38,15);box(14,28,36,17);line([[21,31],[28,39],[42,31]]);break;
    case 'tuner':
        box(7,13,50,39);box(13,18,37,17);line([[17,31],[31,21],[43,31],[31,21],[31,32]]);box(17,42,7,5);box(39,42,7,5);break;
    case 'score':
        box(8,3,48,58);for(let y=18;y<41;y+=5)line([[15,y],[50,y]]);
        box(22,29,5,4);line([[27,30],[27,15],[39,19],[39,36]]);box(34,35,5,4);break;
    case 'tool-roll':
        box(4,13,55,40);for(let x=11;x<55;x+=12){box(x,20,8,23);line([[x+3,15],[x+3,35]]);}box(27,9,8,47);break;
    case 'cutter':
        line([[24,5],[31,1],[38,5],[36,27],[42,31],[40,61],[23,61],[21,31],[27,27],[24,5]]);box(26,34,10,22);line([[29,6],[31,23]]);break;
    case 'ruler':
        box(3,22,58,21);for(let x=9;x<60;x+=7)line([[x,23],[x,x%2?32:37]]);break;
    case 'markers':
        for(let x=8;x<54;x+=17){box(x,15,11,43);box(x,5,11,10);line([[x+3,21],[x+8,21],[x+3,44],[x+8,44]]);}break;
    case 'spool':
        box(10,6,44,8);box(16,14,32,36);box(10,50,44,8);for(let y=19;y<47;y+=6)line([[18,y],[46,y+4]]);break;
    case 'stencils':
        box(6,6,46,50);box(14,13,44,46);line([[20,34],[32,22],[46,34],[46,49],[20,49],[20,34]]);box(29,39,8,10);break;
    case 'meter':
        box(12,4,40,56);box(18,11,28,17);box(22,36,20,17);line([[25,48],[38,39],[31,44],[31,50]]);break;
    case 'caliper':
        box(7,25,51,9);box(11,7,8,27);box(33,10,8,24);line([[11,7],[25,7],[33,10],[46,10],[19,34],[19,50],[33,34],[33,47]]);break;
    case 'notebook':
        box(10,4,44,56);line([[17,5],[17,60],[23,17],[46,17],[23,25],[46,25],[23,34],[42,34]]);for(let y=10;y<55;y+=9)box(5,y,8,3);break;
    case 'pouch':
        line([[10,13],[53,13],[59,20],[59,54],[5,54],[5,20],[10,13]]);box(24,6,17,7);line([[9,24],[55,24]]);box(44,24,5,10);break;
    case 'radio':
        box(14,18,36,43);box(19,24,26,15);box(20,3,5,15);box(39,11,9,7);for(let y=45;y<57;y+=4)line([[21,y],[43,y]]);break;
    case 'light-panel':
        box(5,8,54,43);box(11,14,42,30);for(let y=20;y<42;y+=8)for(let x=16;x<51;x+=9)box(x,y,3,3);box(26,51,12,10);break;
    case 'gloves':
        line([[8,59],[6,37],[3,28],[9,23],[15,31],[15,8],[21,8],[23,31],[24,3],[30,3],[31,31],[34,8],[40,8],[40,33],[44,16],[50,16],[50,43],[43,59],[8,59]]);line([[48,43],[58,43],[58,60],[43,60]]);break;
    case 'clipboard':
        box(8,9,48,51);box(23,3,18,12);line([[15,24],[48,24],[15,34],[48,34],[15,44],[41,44]]);break;
    case 'clamp':
        line([[8,9],[55,9],[55,22],[36,22],[36,43],[53,43],[53,57],[8,57],[8,43],[25,43],[25,22],[8,22],[8,9]]);box(24,28,13,9);break;
    case 'glasses':
        box(4,22,23,22);box(37,22,23,22);line([[27,28],[37,28],[4,23],[1,11],[60,23],[63,11]]);break;
    case 'umbrella':
        line([[11,5],[20,7],[43,42],[41,49],[34,48],[11,12],[11,5],[41,49],[49,59],[55,59],[59,55],[55,50]]);line([[16,10],[38,43]]);box(25,26,10,5);break;
    case 'watch':
        box(23,1,18,15);box(23,49,18,14);box(13,15,38,35);box(19,21,26,23);line([[32,24],[32,34],[42,37]]);box(52,27,6,9);break;
    case 'keys':
        line([[10,7],[22,7],[28,13],[28,24],[22,30],[10,30],[4,24],[4,13],[10,7]]);box(11,14,10,9);line([[23,28],[40,45],[49,36],[56,43],[50,49],[57,56],[50,61],[24,35]]);break;
    case 'map':
    case 'postcards':
        line([[5,11],[22,7],[42,13],[59,8],[59,53],[42,58],[22,52],[5,57],[5,11],[22,7],[22,52],[42,13],[42,58]]);line([[11,39],[18,27],[30,34],[49,22],[53,31]]);break;
    case 'sealed-module':
        // Fictional sealed equipment shell; no real device internals are depicted.
        box(6, 8, 52, 48);
        box(11, 13, 42, 38);
        line([[6,20],[58,20],[6,44],[58,44]]);
        box(26, 23, 12, 18);
        line([[15,27],[21,27],[15,36],[21,36],[43,27],[49,27],[43,36],[49,36]]);
        box(8, 10, 3, 3); box(53, 51, 3, 3);
        break;
    case 'cell':
        box(17, 9, 30, 48); box(24, 3, 16, 6);
        line([[24,23],[40,23],[32,37],[40,37],[25,49],[31,34],[24,34],[24,23]]);
        if (item.protectedTerminals) { box(14, 1, 36, 10); box(14, 55, 36, 8); }
        break;
    case 'permit':
        box(4, 12, 56, 40); box(10, 19, 15, 19);
        line([[31,21],[53,21],[31,28],[50,28],[10,44],[52,44]]);
        box(40, 33, 10, 6); break;
    case 'bottle':
        box(23, 1, 18, 8);
        line([[23, 10], [23, 14], [14, 20], [14, 59], [18, 63], [47, 63], [50, 59], [50, 20], [41, 14], [41, 10]]);
        box(18, 29, 28, 21);
        line([[21, 37], [41, 37], [41, 43], [21, 43]]);
        break;
    case 'headphones':
        line([[5, 44], [5, 25], [10, 12], [21, 5], [41, 5], [54, 14], [59, 27], [59, 44]]);
        line([[10, 33], [10, 24], [19, 12], [41, 12], [51, 24], [51, 33]]);
        box(3, 32, 13, 27);
        box(48, 32, 13, 27);
        line([[20, 60], [44, 60]]);
        break;
    case 'phone':
        box(10, 2, 44, 60);
        box(15, 9, 34, 43);
        line([[25, 57], [38, 57]]);
        break;
    case 'book':
        box(8, 4, 49, 57);
        line([[14, 4], [14, 61], [56, 54], [18, 54], [18, 12], [49, 12]]);
        line([[22, 23], [46, 23], [46, 28], [22, 28]]);
        break;
    case 'scissors':
        c.beginPath();
        c.arc(14, 49, 10, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.arc(46, 49, 10, 0, Math.PI * 2);
        c.stroke();
        line([[20, 42], [47, 2], [33, 36], [52, 41]]);
        line([[40, 41], [15, 2], [28, 36], [12, 40]]);
        box(29, 29, 4, 4);
        break;
    default:
        for (let i = 0; i < 4; i++) {
            c.strokeRect(4 + i * 5, 8 + i * 5, 55 - i * 10, 46 - i * 10);
        }
        line([[55, 55], [62, 55], [62, 44]]);
} c.restore(); }

function portraitDayTwo(c: CanvasRenderingContext2D, p: Passenger) {
 const r=(x:number,y:number,w:number,h:number,col:string)=>rect(c,x,y,w,h,col);
 const shape=(pts:number[][],col:string)=>poly(c,pts,col);
 const s=p.style-6, skin=p.skin, hair=p.hair, ink='#352d27', shadow='#916b53';
 // Different shoulder widths, necks, face proportions and hair outlines per person.
 const faces=[
  [[60,23],[68,17],[87,19],[95,30],[93,50],[84,64],[72,66],[60,53]],
  [[54,27],[62,18],[83,17],[95,28],[95,49],[87,59],[73,65],[60,57],[54,43]],
  [[54,24],[65,17],[87,20],[99,30],[97,54],[87,66],[66,65],[53,51]],
  [[59,24],[67,16],[85,18],[94,30],[92,50],[84,64],[73,67],[62,56]],
  [[51,27],[60,18],[83,17],[97,29],[99,48],[91,64],[71,69],[56,60],[49,44]],
  [[60,23],[68,16],[85,18],[94,28],[96,50],[88,62],[77,69],[64,58]]
 ];
 if(s===0)shape([[57,31],[57,13],[66,7],[87,7],[98,18],[102,53],[94,71],[85,72],[91,34]],hair);
 if(s===1)shape([[46,56],[44,29],[49,15],[62,7],[81,6],[96,14],[105,31],[104,62],[95,70],[48,70]],hair);
 if(s===2)shape([[49,34],[48,19],[54,19],[54,11],[62,11],[62,7],[87,7],[87,11],[97,11],[97,18],[103,18],[103,34]],hair);
 if(s===3)shape([[54,31],[54,17],[64,9],[84,8],[97,19],[99,37],[91,35],[87,19],[66,21],[60,35]],hair);
 if(s===4)shape([[49,37],[50,21],[59,14],[86,13],[99,23],[102,42],[93,42],[86,21],[59,27]],hair);
 if(s===5)shape([[56,36],[54,17],[62,8],[84,6],[99,17],[102,36],[92,34],[84,20],[67,27]],hair);
 const shoulder=s===4?13:s===2?17:24;
 shape([[shoulder,93],[shoulder+8,78],[56,67],[91,67],[116,78],[135-shoulder/4,93]],p.coat);
 r(68,57,19,20,skin);r(68,64,19,6,shadow);
 shape(faces[s],skin);
 // Side shade follows this cast's faces, rather than a common painted mask.
 shape([[faces[s][0][0],30],[faces[s][0][0]+5,27],[faces[s][0][0]+5,49],[67,60],[60,55]],shadow);
 r(s===4?47:55,36,5,11,skin);r(94,36,5,11,skin);
 const eyeY=s===3?38:s===4?37:36, lx=s===0?65:s===4?59:61, rx=s===0?84:s===4?83:83;
 r(lx-1,eyeY-5,11,2,hair);r(rx-1,eyeY-5,10,2,hair);
 r(lx,eyeY,7,2,ink);r(rx,eyeY,6,2,ink);
 r(lx+2,eyeY-1,2,3,ink);r(rx+1,eyeY-1,2,3,ink);
 shape([[77,eyeY+2],[74,48],[81,49],[81,46],[78,45]],shadow);
 r(s===4?68:71,55,s===4?17:12,2,'#795344');
 if(s===0) {
  // High ponytail, asymmetric fringe and knitted rust scarf.
  shape([[58,25],[61,13],[83,11],[94,20],[87,25],[80,17],[67,27]],hair);
  r(96,6,9,14,hair);r(100,17,8,29,hair);r(96,18,6,3,'#bd8e54');
  shape([[57,69],[69,72],[87,68],[96,74],[85,83],[62,81]],'#a37b57');r(64,81,10,12,'#b28a62');
 } else if(s===1) {
  // Copper curly bob, round cheeks, striped blouse and small earrings.
  for(const [x,y] of [[46,23],[50,14],[60,9],[76,8],[91,14],[98,26],[98,44],[48,44]])r(x,y,9,9,hair);
  r(57,23,27,5,hair);r(87,25,10,18,hair);r(52,47,4,9,'#c6a365');r(96,47,3,9,'#c6a365');
  shape([[60,69],[76,79],[90,68],[96,93],[54,93]],'#c6b591');for(let y=81;y<93;y+=5)r(58,y,35,2,'#767867');
 } else if(s===2) {
  // Broad jaw, short textured crop, boxed beard and workwear shoulder seams.
  for(let x=54;x<97;x+=8)r(x,10+(x%3),6,7,hair);
  shape([[55,47],[63,52],[68,58],[87,58],[96,48],[96,58],[87,69],[65,68],[56,59]],hair);
  r(69,53,16,3,skin);r(30,79,21,3,'#b39b69');r(104,79,15,3,'#b39b69');r(75,76,3,17,'#c1ad82');r(40,86,17,5,'#6f5d3d');
 } else if(s===3) {
  // Older narrow face, close silver crop, rectangular spectacles and cardigan.
  r(58,19,7,13,hair);r(88,19,7,14,hair);r(63,12,23,7,hair);
  c.strokeStyle='#504b3e';c.lineWidth=1;c.strokeRect(59,35,14,10);c.strokeRect(80,35,14,10);r(73,38,7,1,'#504b3e');
  r(63,48,5,1,shadow);r(86,48,5,1,shadow);r(68,58,15,1,shadow);
  shape([[57,69],[75,82],[91,69],[99,93],[52,93]],'#b8b099');r(75,81,4,12,'#535951');r(44,77,5,16,'#89917a');r(104,77,4,16,'#89917a');
 } else if(s===4) {
  // Flat cap, wide face, moustache and checked overshirt.
  shape([[47,25],[51,13],[63,8],[86,10],[98,18],[102,27]],'#857451');r(45,25,57,5,'#584e38');r(53,17,39,2,'#9e8960');
  shape([[66,50],[75,49],[84,50],[89,54],[79,54],[76,52],[71,55],[63,54]],hair);
  for(let x=32;x<123;x+=13)r(x,79,2,14,'#a18b6a');r(27,84,98,2,'#a18b6a');r(77,77,3,16,'#453f33');
 } else {
  // Tall swept quiff, clean jaw, high collar and diagonal messenger strap.
  shape([[56,24],[61,7],[73,1],[91,4],[101,15],[95,25],[83,19],[71,25]],hair);r(69,7,19,3,'#655448');
  shape([[59,68],[74,76],[91,67],[94,83],[80,88],[60,80]],'#a9ab91');
  shape([[108,73],[117,77],[93,93],[81,93]],'#775c44');r(99,83,6,4,'#b8a17a');
 }
 noise(c,156,93,45,['#eee0bc18','#181a191a'],p.style+71);r(0,91,156,2,'#33382f');
}
