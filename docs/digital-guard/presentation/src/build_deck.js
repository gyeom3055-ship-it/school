// Data, Please. mid-term deck (20 slides). Usage: npm install && node build_deck.js out.pptx
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
// Optional: a theme-XML patcher. Without it the deck still builds (fonts/colours are set per element).
let applyTheme = async () => {};
try { ({ applyTheme } = require(process.env.APPLY_THEME || "./apply_theme.js")); } catch (e) { /* skip */ }

const OUT = process.argv[2] || "mid.pptx";
const HEAD = "Galmuri14", PIX = "Galmuri11", BODY = "맑은 고딕";

// 16-colour pixel palette (same as the game's doc 8.2)
const NIGHT = "0F1426", NIGHT2 = "151C33", PANEL = "1F2A4A", STEEL = "3A4E7A", HAZE = "7F9CC9";
const PAPER = "F2EBD9", PAPER2 = "E3D7BC", INK = "22201F", PENCIL = "6B6560";
const YELLOW = "F7D84A", YELLOWD = "B08E1C", GREEN = "3FBF6F", GREEND = "23784A", RED = "E0503C", REDD = "8E2B25";
const TEAL = "45C7C1", TEALD = "2A8C88", PURPLE = "8A6BD1", WOOD = "8A5A3B", WHITE = "FFFFFF", MUTED = "B9C6E2", DEEP = "0B0F1E";

const THEME = { name: "Data Please Pixel", headFontFace: HEAD, bodyFontFace: BODY,
  colors: { dk1: NIGHT, lt1: WHITE, dk2: PANEL, lt2: PAPER, accent1: TEAL, accent2: RED, accent3: YELLOW, accent4: HAZE, accent5: GREEN, accent6: PURPLE, hlink: TEAL, folHlink: HAZE } };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Data, Please. 중간 설계발표";
pres.subject = "전연령 디지털 안전 퍼즐 게임 — 중간 설계발표 (도트 스타일)";
pres.author = "팀 셜록홈즈";
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

/* ---------- pixel icons ---------- */
const ICONS = {
  mag: ["..XXX....", ".X...X...", "X.....X..", "X.....X..", "X.....X..", ".X...X...", "..XXXXX..", "......XX.", ".......XX"],
  flag: [".XXXXXXX.", ".XXXXXX..", ".XXXXXXX.", ".X.......", ".X.......", ".X.......", ".X.......", "XXX......"],
  book: ["XXXX.XXXX", "X..X.X..X", "X.XX.XX.X", "X..X.X..X", "X.XX.XX.X", "X..X.X..X", "XXXXXXXXX"],
  folder: ["XXX......", "X..XXXXXX", "X.......X", "X.......X", "X.......X", "XXXXXXXXX"],
  check: ["........X", ".......XX", "X.....XX.", "XX...XX..", ".XX.XX...", "..XXX....", "...X....."],
  cross: ["XX.....XX", ".XX...XX.", "..XX.XX..", "...XXX...", "..XX.XX..", ".XX...XX.", "XX.....XX"],
  q: [".XXXXX.", "XX...XX", ".....XX", "...XXX.", "...XX..", ".......", "...XX.."],
  person: ["..XXX..", ".XXXXX.", ".XXXXX.", "..XXX..", ".......", "XXXXXXX", "XXXXXXX"],
  mail: ["XXXXXXXXX", "XX.....XX", "X.X...X.X", "X..X.X..X", "X...X...X", "XXXXXXXXX"],
  star: ["....X....", "....X....", "...XXX...", "XXXXXXXXX", ".XXXXXXX.", "..XXXXX..", ".XXX.XXX.", "XX.....XX"],
  shield: ["XXXXXXXXX", "XXXXXXXXX", "XXXXXXX.X", "X.XXXX..X", "X..XX..XX", "XX....XXX", ".XX..XXX.", "..XXXXX..", "...XXX..."],
  doc: ["XXXXXX..", "X....XX.", "X.XX..XX", "X......X", "X.XXXX.X", "X......X", "X.XXXX.X", "X......X", "XXXXXXXX"],
  stamp: ["..XXXX..", "..XXXX..", "...XX...", "...XX...", ".XXXXXX.", "XXXXXXXX", "XXXXXXXX", "........", "XXXXXXXX"],
  fish: ["....XXX.....", "..XXXXXX...X", ".XXXXXXXX.XX", "XX.XXXXXXXXX", ".XXXXXXXX.XX", "..XXXXXX...X", "....XXX....."],
  puzzle: ["...XX....", "..XXXX...", "XXXXXXXX.", "XXXXXXXXX", "XXXXXXXXX", ".XXXXXXX.", "XXXXXXXXX", "XXXXXXXXX", "XXXXXXXX."],
  terminal: ["XXXXXXXXXX", "X........X", "X.X......X", "X..X.....X", "X.X..XXX.X", "X........X", "XXXXXXXXXX"],
  inbox: [".XXXXXXX.", "X.......X", "X.......X", "XXX...XXX", "X..XXX..X", "X.......X", "XXXXXXXXX"],
  layers: ["..XXXXX..", ".........", ".XXXXXXX.", ".........", "XXXXXXXXX"],
  scale: ["....X....", "XXXXXXXXX", "X...X...X", "X...X...X", "XX..X..XX", "XXX.X.XXX", "....X....", "..XXXXX.."],
  mobile: ["XXXXX", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXXX", "XX.XX", "XXXXX"],
  cap: ["....XX....", "..XXXXXX..", "XXXXXXXXXX", "..XXXXXX.X", "..X....X.X", "..XXXXXX.X"],
  gamepad: [".XXXXXXXXX.", "XX.XXXXX.XX", "X...XXX.X.X", "XX.XXXXX.XX", "XXXXXXXXXXX", "XXX.....XXX"],
  cubes: ["..XXXXX..", "..X...X..", "..XXXXX..", "XXXXXXXXX", "X...XX..X", "XXXXXXXXX"],
  tools: ["XX....XX", "XXX..XXX", ".XXXXXX.", "..XXXX..", "..XXXX..", ".XX..XX.", "XX....XX"],
  medal: ["XX...XX", ".XX.XX.", "..XXX..", ".XXXXX.", "XXX.XXX", ".XXXXX.", "..XXX.."],
  route: ["XX......", "XX......", ".X......", ".XXXXXX.", "......X.", "......XX", "......XX"],
  redo: ["..XXXX.X", ".X....XX", "X....XXX", "X.......", "X......X", ".X....X.", "..XXXX.."],
  database: [".XXXXXX.", "X......X", ".XXXXXX.", "X......X", ".XXXXXX.", "X......X", ".XXXXXX."],
  save: ["XXXXXXX.", "X.XXX.XX", "X.XXX..X", "X......X", "X.XXXX.X", "X.X..X.X", "XXXXXXXX"],
  chart: ["X.......", "X.....X.", "X....XX.", "X.X.XXX.", "X.XXXXX.", "XXXXXXXX"],
  arrow: ["X....", "XX...", "XXX..", "XXXX.", "XXX..", "XX...", "X...."],
  clock: ["..XXXXX..", ".X.....X.", "X...X...X", "X...X...X", "X...XXX.X", "X.......X", ".X.....X.", "..XXXXX.."],
  alert: ["....X....", "...XXX...", "...X.X...", "..XX.XX..", "..XX.XX..", ".XXXXXXX.", ".XXX.XXX.", "XXXXXXXXX"],
};
const cache = {};
async function icon(name, color) {
  const key = name + color; if (cache[key]) return cache[key];
  const g = ICONS[name], h = g.length, w = Math.max(...g.map((r) => r.length)), n = Math.max(w, h);
  const buf = Buffer.alloc(n * n * 4);
  const [r, gg, b] = [0, 2, 4].map((i) => parseInt(color.slice(i, i + 2), 16));
  const ox = Math.floor((n - w) / 2), oy = Math.floor((n - h) / 2);
  g.forEach((row, y) => [...row].forEach((c, x) => { if (c === "X") { const i = ((y + oy) * n + x + ox) * 4; buf[i] = r; buf[i + 1] = gg; buf[i + 2] = b; buf[i + 3] = 255; } }));
  const png = await sharp(buf, { raw: { width: n, height: n, channels: 4 } }).resize(n * 24, n * 24, { kernel: "nearest" }).png().toBuffer();
  return (cache[key] = "image/png;base64," + png.toString("base64"));
}
async function ic(s, name, color, x, y, d) { s.addImage({ data: await icon(name, color), x, y, w: d, h: d }); }

/* ---------- pixel drawing helpers ---------- */
const U = 0.055;
function rect(s, x, y, w, h, color, name) { const o = { x, y, w, h, fill: { color } }; if (name) o.objectName = name; s.addShape(pres.shapes.RECTANGLE, o); }
// panel with hard pixel border and notched corners; bg = colour behind the panel
function pxPanel(s, x, y, w, h, fill, border, o = {}) {
  const bg = o.bg || NIGHT;
  if (o.shadow) { rect(s, x + U * 2, y + U * 2, w, h, o.shadow); }
  rect(s, x, y, w, h, border, o.name);
  rect(s, x + U, y + U, w - 2 * U, h - 2 * U, fill);
  if (!o.square) { [[x, y], [x + w - U, y], [x, y + h - U], [x + w - U, y + h - U]].forEach(([cx, cy]) => rect(s, cx, cy, U, U, o.shadow ? bg : bg)); }
}
function txt(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, fontFace: BODY, lang: "ko-KR", margin: 0, valign: "top", color: WHITE }, o)); }
function ptxt(s, text, o) { txt(s, text, Object.assign({ fontFace: PIX }, o)); }
function htxt(s, text, o) { txt(s, text, Object.assign({ fontFace: HEAD }, o)); }
function chip(s, text, x, y, w, h, fill, color, fs = 11, o = {}) {
  pxPanel(s, x, y, w, h, fill, o.border || INK, { bg: o.bg || NIGHT });
  ptxt(s, text, { x, y, w, h, fontSize: fs, bold: !!o.bold, color, align: "center", valign: "middle" });
}
async function iconTile(s, name, x, y, d, fill, color, o = {}) {
  pxPanel(s, x, y, d, d, fill, o.border || INK, { bg: o.bg || NIGHT });
  await ic(s, name, color, x + d * 0.22, y + d * 0.22, d * 0.56);
}
function protoTag(s, x, y, w = 3.1) { chip(s, "HTML 시제품 화면 · Unity 구현 전", x, y, w, 0.36, YELLOW, INK, 11); }
function phoneFrame(s, x, y, w, h) {
  pxPanel(s, x, y, w, h, "060A15", STEEL, { shadow: DEEP });
  rect(s, x + w / 2 - 0.25, y + 0.07, 0.5, 0.05, STEEL);
  return { x: x + 0.08, y: y + 0.17, w: w - 0.16, h: h - 0.3 };
}
function fitImage(s, path, sc, ratio = 748 / 1664, alt = "") {
  let ih = sc.h, iw = ih * ratio; if (iw > sc.w) { iw = sc.w; ih = iw / ratio; }
  s.addImage({ path, x: sc.x + (sc.w - iw) / 2, y: sc.y + (sc.h - ih) / 2, w: iw, h: ih, altText: alt });
}

/* ================= mid-term deck v0.4 (team meeting reflected; structure: 환경·경쟁·SWOT·해결·기능·화면·기대효과) ================= */
const FOOT = "Data, Please.  |  소프트웨어창의설계1 중간 설계발표  |  팀 셜록홈즈  |  ※ 게임 속 인물·기관·자료는 모두 가상";
pres.defineSlideMaster({ title: "COVER", background: { color: NIGHT }, objects: [] });
pres.defineSlideMaster({
  title: "MID",
  background: { path: "assets/px_bg.png" },
  objects: [
    { text: { text: FOOT, options: { x: 0.6, y: 7.06, w: 9, h: 0.26, fontFace: PIX, fontSize: 10, color: "6F86A6", margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.8, w: 12.1, h: 0.7, fontFace: HEAD, fontSize: 28, color: WHITE, valign: "middle", align: "left", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 12.33, y: 7.06, w: 0.4, h: 0.26, fontFace: PIX, fontSize: 10, color: "6F86A6", align: "right" },
});
function head(s, section, title) {
  const w = 0.32 + section.length * 0.13;
  chip(s, section, 0.6, 0.36, w, 0.34, YELLOW, INK, 11, { bold: true });
  s.addText(title, { placeholder: "title" });
}
function marker(s, n, x, y, d = 0.3, fill = RED) {
  pxPanel(s, x - d / 2, y - d / 2, d, d, fill, INK, { square: true });
  ptxt(s, String(n), { x: x - d / 2, y: y - d / 2, w: d, h: d, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle" });
}
function seg(s, x1, y1, x2, y2, o = {}) {
  const line = { color: o.color || HAZE, width: o.width || 1.75 };
  if (o.dash) line.dashType = "sysDash";
  if (o.arrow !== false) line.endArrowType = "triangle";
  if (o.both) line.beginArrowType = "triangle";
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), line, flipH: x2 < x1, flipV: y2 < y1 });
}
function tag(s, text, x, y, fill = TEAL, color = INK) { chip(s, text, x, y, 0.13 * text.length + 0.26, 0.26, fill, color, 9.5, { bold: true }); }
const DEV_W = 374, DEV_H = 832, SH = "shots4/";
function phoneShot(s, shot, x, y, h, alt) {
  const fw = h * DEV_W / DEV_H + 0.16, sc = phoneFrame(s, x, y, fw, h + 0.3);
  const ih = sc.h, iw = ih * DEV_W / DEV_H, ix = sc.x + (sc.w - iw) / 2;
  s.addImage({ path: SH + shot + ".png", x: ix, y: sc.y, w: iw, h: ih, altText: alt });
  return { ix, iy: sc.y, iw, ih, fw };
}
// phone + numbered markers on the right edge + explanation column (2 per slide)
async function screenUnit(s, x, u) {
  const P = phoneShot(s, u.shot, x, 1.62, 4.82, `${u.no} ${u.name} 화면 (HTML 시제품 캡처)`);
  u.items.forEach((it, i) => marker(s, i + 1, P.ix + P.iw + 0.02, P.iy + it.at / DEV_H * P.ih, 0.28));
  const tx = x + P.fw + 0.28, tw = 3.12;
  chip(s, u.no, tx, 1.68, 0.86, 0.3, YELLOW, INK, 11, { bold: true });
  if (u.who) ptxt(s, u.who, { x: tx + 0.98, y: 1.68, w: tw - 1, h: 0.3, fontSize: 11, color: MUTED, valign: "middle" });
  htxt(s, u.name, { x: tx, y: 2.1, w: tw, h: 0.5, fontSize: 20, color: WHITE, valign: "middle" });
  u.items.forEach((it, i) => {
    const y = 2.86 + i * 1.3;
    marker(s, i + 1, tx + 0.15, y + 0.16, 0.3);
    txt(s, it.t, { x: tx + 0.42, y, w: tw - 0.42, h: 0.34, fontSize: 14, bold: true, color: WHITE, valign: "middle", fit: "shrink" });
    if (it.f) tag(s, it.f, tx + 0.42, y + 0.4, it.fc || TEAL);
    txt(s, it.d, { x: tx + 0.42, y: y + (it.f ? 0.72 : 0.42), w: tw - 0.42, h: 0.56, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.05 });
  });
}
async function screenSlide(section, title, units, notes) {
  const s = pres.addSlide({ masterName: "MID", sectionTitle: "03 화면 설계" });
  head(s, section, title);
  await screenUnit(s, 0.6, units[0]);
  await screenUnit(s, 6.78, units[1]);
  s.addNotes(notes);
  return s;
}

(async () => {
  let s;
  /* ======================= 1. Cover ======================= */
  pres.addSection({ title: "표지" });
  s = pres.addSlide({ masterName: "COVER", sectionTitle: "표지" });
  s.addImage({ path: "assets/px_keyart.png", x: 0, y: 0, w: 13.333, h: 7.5, altText: "도트 그림: 디지털 안전 센터 책상에서 서류를 살피는 디지털 보안관과 AI 조수 도트" });
  chip(s, "소프트웨어창의설계1 (캡스톤디자인)  ·  중간 설계발표", 0.75, 0.95, 5.3, 0.4, YELLOW, INK, 13, { bold: true });
  htxt(s, "DATA,", { x: 0.79, y: 1.59, w: 5.4, h: 0.95, fontSize: 62, color: STEEL });
  htxt(s, "DATA,", { x: 0.75, y: 1.55, w: 5.4, h: 0.95, fontSize: 62, color: WHITE });
  htxt(s, "PLEASE.", { x: 0.79, y: 2.49, w: 5.4, h: 0.95, fontSize: 62, color: STEEL });
  htxt(s, "PLEASE.", { x: 0.75, y: 2.45, w: 5.4, h: 0.95, fontSize: 62, color: TEAL });
  txt(s, [{ text: "창구로 들어오는 수상한 요청을", options: { breakLine: true } }, { text: "단서로 가려내는 추리 퍼즐 게임" }],
    { x: 0.75, y: 3.6, w: 4.6, h: 0.85, fontSize: 19, color: WHITE, lineSpacingMultiple: 1.1 });
  chip(s, "Unity 6 · Android / iOS · 세로 화면", 0.75, 4.62, 3.75, 0.38, PANEL, WHITE, 12, { border: STEEL });
  ptxt(s, "Team 셜록홈즈  |  ○○○·○○○·○○○·○○○", { x: 0.75, y: 5.5, w: 4.2, h: 0.3, fontSize: 13, color: MUTED });
  ptxt(s, "지도교수 ________  |  2026. 10.", { x: 0.75, y: 5.88, w: 4.2, h: 0.3, fontSize: 13, color: MUTED });
  ptxt(s, "※ 게임 속 인물·기관·자료는 모두 가상입니다. 화면은 HTML 시제품 캡처입니다.", { x: 0.75, y: 6.75, w: 6.5, h: 0.26, fontSize: 10, color: "6F86A6" });
  s.addNotes("안녕하세요, 팀 셜록홈즈입니다. 저희는 플레이어가 창구로 들어오는 수상한 문자와 메일, 파일 요청을 단서로 가려내는 추리 퍼즐 게임, Data, Please.를 기획하고 있습니다. 서류를 보여 달라고 하는 심사 게임의 대표작 Papers, Please에 대한 오마주로, 서류 대신 문자·메일·파일 같은 데이터를 심사한다는 뜻을 담았습니다. 환경 분석과 경쟁작, SWOT을 짧게 보고, 팀 회의에서 정한 화면과 기능을 중심으로 말씀드리겠습니다.");

  /* ======================= 2. Environment ======================= */
  pres.addSection({ title: "01 분석" });
  s = pres.addSlide({ masterName: "MID", sectionTitle: "01 분석" });
  head(s, "01  환경 분석", "수상한 문자, 이제 누구나 받는다");
  pxPanel(s, 0.6, 1.72, 6.0, 4.55, PANEL, STEEL);
  ptxt(s, "스미싱 문자 탐지 건수 (한국인터넷진흥원)", { x: 0.85, y: 1.88, w: 5.6, h: 0.3, fontSize: 12.5, color: MUTED });
  const kisa = [["2022", 37122, "3만 7,122건"], ["2023", 503300, "50만 3,300건"], ["2024", 2196469, "219만 6,469건"]];
  const base = 5.75, maxH = 3.0;
  kisa.forEach(([yr, v, lb], i) => {
    const x = 1.25 + i * 1.75, h = Math.max(0.06, v / 2196469 * maxH);
    rect(s, x, base - h, 1.0, h, i === 2 ? RED : i === 1 ? YELLOW : HAZE);
    ptxt(s, lb, { x: x - 0.4, y: base - h - 0.36, w: 1.8, h: 0.3, fontSize: 12.5, bold: true, color: WHITE, align: "center" });
    ptxt(s, yr, { x: x - 0.2, y: base + 0.08, w: 1.4, h: 0.3, fontSize: 13, color: MUTED, align: "center" });
  });
  rect(s, 0.95, base, 5.3, 0.04, STEEL);
  ptxt(s, "2년 만에 약 59배 ↑", { x: 0.95, y: 2.35, w: 3.2, h: 0.4, fontSize: 18, bold: true, color: RED });
  const env = [
    ["mail", "세대를 가리지 않는다", "택배·쇼핑·가족·기관을 사칭한 문자와\n메일이 어린이부터 어르신까지 온다."],
    ["alert", "직접 판단해야 하는 순간", "링크를 누를지, 파일을 열지, 인증번호를\n줄지 스마트폰 앞에서 혼자 정한다."],
    ["puzzle", "게임 소재로 딱 좋은 이유", "누구나 받아 본 문자라 설명 없이 몰입하고,\n진짜와 가짜의 작은 차이가 그대로 퍼즐이 된다."],
  ];
  for (let i = 0; i < 3; i++) {
    const y = 1.72 + i * 1.55, [ico, t, d] = env[i];
    pxPanel(s, 6.85, y, 5.88, 1.38, NIGHT2, STEEL);
    await iconTile(s, ico, 7.07, y + 0.22, 0.6, TEAL, INK, { bg: NIGHT2 });
    txt(s, t, { x: 7.9, y: y + 0.17, w: 4.7, h: 0.38, fontSize: 15, bold: true, color: WHITE });
    txt(s, d, { x: 7.9, y: y + 0.57, w: 4.75, h: 0.72, fontSize: 12, color: MUTED, lineSpacingMultiple: 1.05 });
  }
  pxPanel(s, 0.6, 6.42, 12.13, 0.5, PAPER, YELLOWD);
  txt(s, "→ 누구나 겪는 '이거 진짜일까?'의 순간을, 단서를 대조해 가려내는 추리 게임으로 만든다", { x: 0.8, y: 6.42, w: 11.8, h: 0.5, fontSize: 14, bold: true, color: REDD, valign: "middle" });
  s.addNotes("먼저 환경입니다. 한국인터넷진흥원 자료에 따르면 스미싱 문자 탐지 건수는 2022년 3만 7천여 건에서 2024년 219만 건으로 약 59배 늘었습니다. 택배, 쇼핑, 가족, 기관을 사칭한 문자는 나이를 가리지 않고 오고, 링크를 누를지, 파일을 열지는 결국 스마트폰 앞에서 혼자 판단해야 합니다. 누구나 받아 본 문자라 따로 설명하지 않아도 바로 몰입할 수 있고, 진짜와 가짜의 작은 차이가 그대로 퍼즐이 됩니다. 그래서 이 '진짜일까?'의 순간을 단서를 대조해 가려내는 추리 게임으로 만들기로 했습니다. (출처: 한국인터넷진흥원, 스미싱 문자 탐지 현황, 국회 국정감사 제출자료, 2024 — 과제 계획서 인용)");

  /* ======================= 3. Market & competitors ======================= */
  s = pres.addSlide({ masterName: "MID", sectionTitle: "01 분석" });
  head(s, "01  시장 · 경쟁 분석", "비슷한 게임은 있지만, 같은 경험은 없다");
  const cH = ["", "Papers, Please", "Jigsaw Phishing Quiz", "CyberStart", "Data, Please."];
  const cR = [
    ["장르", "문서 심사 시뮬레이션", "피싱 판별 퀴즈", "보안 퍼즐·챌린지", "창구 심사 추리 퍼즐"],
    ["핵심 플레이", "입국 서류·규칙 대조", "메일 한 통씩 판별", "기술 과제 풀이", "문자·메일·파일·로그인 대조"],
    ["판정", "승인 · 거부", "정상 · 피싱", "과제별", "승인 · 거부 · 추가 확인"],
    ["결과 공개", "하루가 끝난 뒤", "문항마다 즉시", "과제별", "근무가 끝난 뒤 해설"],
    ["반복 동기", "스토리 · 엔딩", "없음", "단계 진행", "난이도 4단계 · 경쟁 모드 랭킹"],
    ["플랫폼 · 상태", "PC · 모바일 출시", "2019년 웹 공개", "2024년 종료", "모바일 세로 · 기획 단계"],
  ];
  const cc = (t, o) => ({ text: t, options: Object.assign({ fontFace: BODY, fontSize: 12.5, color: INK, valign: "middle", align: "center" }, o) });
  const ct = [cH.map((h, j) => cc(h, { fontFace: PIX, bold: true, fontSize: 13, color: j === 4 ? INK : WHITE, fill: { color: j === 4 ? TEAL : STEEL } }))];
  cR.forEach((r, i) => ct.push(r.map((t, j) => j === 0 ? cc(t, { fontFace: PIX, bold: true, color: WHITE, fill: { color: PANEL }, align: "left" }) : j === 4 ? cc(t, { bold: true, fill: { color: "9BE3DF" } }) : cc(t, { fill: { color: i % 2 ? PAPER2 : PAPER } }))));
  s.addTable(ct, { x: 0.6, y: 1.72, w: 12.13, colW: [1.73, 2.55, 2.55, 2.55, 2.75], rowH: 0.5, margin: [0.03, 0.08, 0.03, 0.08], border: { type: "solid", color: NIGHT, pt: 2 } });
  pxPanel(s, 0.6, 5.42, 12.13, 0.9, NIGHT2, STEEL);
  await ic(s, "shield", TEAL, 0.85, 5.62, 0.48);
  txt(s, [{ text: "시장 포인트  ", options: { bold: true, color: TEAL } }, { text: "세로 한 손·10~15분 한 판의 캐주얼 퍼즐 이용자, 그리고 가족·친구가 같이 해 볼 거리를 찾는 이용자." , options: { color: WHITE } },
    { text: "", options: { breakLine: true } }, { text: "빈자리  ", options: { bold: true, color: YELLOW } }, { text: "심사 장르의 재미 × 생활 속 사칭 사건 × 모바일 세로 화면을 함께 가진 게임이 없다.", options: { color: WHITE } }],
    { x: 1.5, y: 5.47, w: 11.1, h: 0.8, fontSize: 13, valign: "middle", lineSpacingMultiple: 1.15 });
  ptxt(s, "출처: Pocket Gamer(2022.07) Papers, Please 모바일 출시 / Dark Reading(2019.01.23) Google 피싱 퀴즈 / HackerDNA(2026) CyberStart 종료 — 2026년 10월 조사. 공개 자료 기준 비교이며 Data, Please. 열은 기획 목표.", { x: 0.6, y: 6.45, w: 12.1, h: 0.4, fontSize: 9.5, color: "8197B5" });
  s.addNotes("비슷한 게임을 같은 기준으로 비교했습니다. Papers, Please는 서류를 대조하는 심사 장르의 대표작이고, 구글 Jigsaw 피싱 퀴즈는 메일 한 통씩 판별하며 바로 정답을 알려 줍니다. CyberStart는 단계형 보안 챌린지였지만 2024년에 종료됐습니다. Data, Please.는 심사 장르의 재미를 생활 속 사칭 사건에 적용하고, 승인·거부·추가 확인 세 가지로 판정하며, 난이도와 경쟁 모드 랭킹으로 다시 하게 만드는 모바일 세로 게임입니다. (출처: pocketgamer.com/papers-please/ios-android-release-date-august-5th/ · darkreading.com/cyberattacks-data-breaches/google-creates-online-phishing-quiz · hackerdna.com/blog/cyberstart — Jigsaw 퀴즈의 현재 접속 가능 여부는 발표 전 확인 권장)");

  /* ======================= 4. SWOT ======================= */
  s = pres.addSlide({ masterName: "MID", sectionTitle: "01 분석" });
  head(s, "01  SWOT 분석", "강점은 살리고, 약점은 설계로 막는다");
  const sw = [
    ["S", "강점", GREEN, ["서류 대조 + 3가지 판정의 독창적인 플레이", "택배·가족·파일 등 누구나 겪는 생활 사건", "판정 규칙을 데이터로 분리 → 사건 추가가 쉬움", "HTML 시제품으로 흐름을 미리 검증"]],
    ["W", "약점", YELLOW, ["사건을 직접 써야 해서 콘텐츠 제작 부담", "읽을 글이 많아 어린이에게 어려울 수 있음", "4명 · 두 학기라는 짧은 제작 기간"]],
    ["O", "기회", TEAL, ["스미싱 급증으로 관심이 커진 소재", "Papers, Please로 검증된 심사 장르의 재미", "가족·친구와 같이 하기 좋은 주제"]],
    ["T", "위협", RED, ["사칭 수법이 빠르게 바뀜 → 사건 업데이트 필요", "무료 퀴즈형 콘텐츠와 비교됨", "랭킹 점수 조작 가능성"]],
  ];
  for (let i = 0; i < 4; i++) {
    const [k, t, c, items] = sw[i], x = 0.6 + (i % 2) * 6.13, y = 1.72 + Math.floor(i / 2) * 2.32;
    pxPanel(s, x, y, 6.0, 2.17, PANEL, c);
    pxPanel(s, x + 0.2, y + 0.2, 0.62, 0.62, c, INK, { bg: PANEL });
    htxt(s, k, { x: x + 0.2, y: y + 0.2, w: 0.62, h: 0.62, fontSize: 24, color: INK, align: "center", valign: "middle" });
    htxt(s, t, { x: x + 0.98, y: y + 0.22, w: 3, h: 0.58, fontSize: 19, color: WHITE, valign: "middle" });
    txt(s, items.map((m, j) => ({ text: m, options: { bullet: { indent: 12 }, breakLine: j < items.length - 1 } })), { x: x + 0.98, y: y + 0.86, w: 4.85, h: 1.22, fontSize: 12.5, color: MUTED, paraSpaceAfter: 2 });
  }
  pxPanel(s, 0.6, 6.4, 12.13, 0.52, PAPER, YELLOWD);
  txt(s, [{ text: "전략  ", options: { bold: true, color: REDD } }, { text: "난이도 4단계로 글 양을 조절(W) · 사건은 데이터로 추가(T) · 경쟁 모드로 다시 하기(O) · 랭킹 점수는 2단계 서버에서 다시 계산(T)", options: { color: INK } }],
    { x: 0.8, y: 6.4, w: 11.8, h: 0.52, fontSize: 12.5, valign: "middle" });
  s.addNotes("SWOT입니다. 강점은 서류를 대조하고 세 가지로 판정하는 플레이, 누구나 겪는 생활 사건, 그리고 판정 규칙을 데이터로 분리해 사건을 쉽게 늘릴 수 있다는 점입니다. 약점은 사건을 직접 써야 하는 부담과 읽을 글의 양, 짧은 제작 기간입니다. 기회는 스미싱에 대한 관심과 검증된 심사 장르의 재미이고, 위협은 빠르게 바뀌는 수법과 무료 퀴즈와의 비교, 랭킹 조작 가능성입니다. 그래서 난이도로 글 양을 조절하고, 사건은 데이터로 추가하고, 랭킹 점수는 서버에서 다시 계산하는 방향으로 설계했습니다.");

  /* ======================= 5. Solution ======================= */
  pres.addSection({ title: "02 해결 방안" });
  s = pres.addSlide({ masterName: "MID", sectionTitle: "02 해결 방안" });
  head(s, "02  해결 방안", "플레이어 한 명이 창구에서, 단서로 가려낸다");
  pxPanel(s, 0.6, 1.72, 12.13, 1.3, PAPER, YELLOWD, { shadow: DEEP });
  txt(s, [{ text: "", options: {} }, { text: "플레이어 한 명", options: { color: REDD } }, { text: "이 디지털 안전 센터 창구에서, 들어오는 문자·메일·파일 요청을", options: { breakLine: true } },
    { text: "내 기록·공식 자료와 대조", options: { color: "1D7570" } }, { text: "하고 ", options: {} }, { text: "승인 · 거부 · 추가 확인", options: { color: REDD } }, { text: "으로 판정한다.", options: {} }],
    { x: 0.9, y: 1.78, w: 11.6, h: 1.18, fontSize: 17, bold: true, color: INK, valign: "middle", lineSpacingMultiple: 1.2 });
  const sol = [
    ["person", "한 명이 모든 판정", "동료·상사 없이 플레이어 혼자\n창구의 모든 요청을 보고 결정한다.\n(회의: “모든 것 한 명 = 유저 역할”)", TEAL],
    ["mag", "대조해서 판단", "요청이 말하는 것 ↔ 내가 원래 아는 것.\n단서를 모아 근거를 만들고, 정답은\n근무가 끝난 뒤 한꺼번에 공개한다.", YELLOW],
    ["clock", "두 가지로 즐기기", "일반 모드: 시간 제한 없이 차근차근\n경쟁 모드: 사건마다 제한 시간,\n빠르고 정확할수록 랭킹 위로.", GREEN],
  ];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.11, [ico, t, d, c] = sol[i];
    pxPanel(s, x, 3.3, 3.91, 2.75, PANEL, STEEL);
    await iconTile(s, ico, x + 0.28, 3.52, 0.66, c, INK, { bg: PANEL });
    htxt(s, t, { x: x + 1.1, y: 3.52, w: 2.7, h: 0.66, fontSize: 18, color: WHITE, valign: "middle" });
    txt(s, d, { x: x + 0.28, y: 4.4, w: 3.5, h: 1.5, fontSize: 13, color: MUTED, lineSpacingMultiple: 1.15 });
  }
  ptxt(s, "분위기는 어둡게(밤 근무)·밝게(낮 근무) 두 가지를 만들어 설정에서 고른다 — 기본값은 오늘 의견을 받아 확정 (15쪽)", { x: 0.6, y: 6.35, w: 12.1, h: 0.3, fontSize: 12, color: MUTED });
  s.addNotes("해결 방안입니다. 플레이어 한 명이 디지털 안전 센터 창구에서, 문자, 메일, 파일, 로그인 요청을 내 기록과 공식 자료에 대조하고 승인, 거부, 추가 확인으로 판정합니다. 회의에서 정한 대로 모든 판정은 유저 한 명이 맡습니다. 단서를 모아 근거를 만들고, 정답은 근무가 끝난 뒤 한꺼번에 공개합니다. 그리고 차근차근 하는 일반 모드와, 시간 제한 속에서 점수를 겨루는 경쟁 모드 두 가지로 즐길 수 있습니다.");

  /* ======================= 6. Core features ======================= */
  s = pres.addSlide({ masterName: "MID", sectionTitle: "02 해결 방안" });
  head(s, "02  핵심 기능", "꼭 만들 핵심 기능 6가지");
  const feats = [
    ["F1", "gamepad", "모드 선택", "일반 모드 · 경쟁 모드\n메인에서 바로 고르기", "메인"],
    ["F2", "chart", "난이도 4단계", "쉬움·보통·어려움·전문가\n앞 단계 통과 시 열림", "난이도 선택"],
    ["F3", "mag", "창구 심사", "창구 장면 + 서류 대조·\n의심 깃발·자료 조회", "인게임"],
    ["F4", "stamp", "판정과 처리", "승인·거부·추가 확인\n근거·확인 경로·신고", "인게임"],
    ["F5", "book", "결과와 해설", "정답·해설은 근무 끝에\n실패하면 처음부터", "근무 결과"],
    ["F6", "medal", "랭킹 · 설정", "경쟁 점수 랭킹, 일시정지·\n소리·분위기·글자 크기", "랭킹 · 일시정지"],
  ];
  for (let i = 0; i < 6; i++) {
    const [f, ico, t, d, scr] = feats[i], x = 0.6 + (i % 3) * 4.11, y = 1.72 + Math.floor(i / 3) * 2.45;
    pxPanel(s, x, y, 3.91, 2.28, PANEL, STEEL);
    chip(s, f, x + 0.22, y + 0.22, 0.58, 0.3, YELLOW, INK, 11, { bold: true, bg: PANEL });
    await iconTile(s, ico, x + 0.22, y + 0.7, 0.72, TEAL, INK, { bg: PANEL });
    htxt(s, t, { x: x + 1.12, y: y + 0.66, w: 2.65, h: 0.45, fontSize: 18, color: WHITE, valign: "middle" });
    txt(s, d, { x: x + 1.12, y: y + 1.14, w: 2.7, h: 0.7, fontSize: 12, color: MUTED, lineSpacingMultiple: 1.1 });
    ptxt(s, "화면: " + scr, { x: x + 0.22, y: y + 1.86, w: 3.5, h: 0.28, fontSize: 11.5, bold: true, color: YELLOW });
  }
  ptxt(s, "여유가 있으면:  + 보안 사전·복습 노트   + 서버 랭킹 (2단계)   + 밝은 모던 테마", { x: 0.6, y: 6.62, w: 12, h: 0.3, fontSize: 12, color: MUTED });
  s.addNotes("꼭 만들 기능은 여섯 가지입니다. 메인에서 고르는 일반·경쟁 모드, 앞 단계를 통과해야 열리는 난이도 네 단계, 창구 장면과 서류 대조로 이뤄진 심사, 승인·거부·추가 확인 판정과 처리, 근무가 끝난 뒤 한꺼번에 보는 결과와 해설, 그리고 랭킹과 일시정지·설정입니다. 각 기능이 어느 화면에 있는지 아래에 적었습니다.");

  /* ======================= 7. Screen flow ======================= */
  pres.addSection({ title: "03 화면 설계" });
  s = pres.addSlide({ masterName: "MID", sectionTitle: "03 화면 설계" });
  head(s, "03  화면 설계", "화면 흐름: 메인에서 랭킹까지");
  const BW = 1.6, BH = 0.78;
  const node = (no, name, x, y, fill, color = INK) => {
    pxPanel(s, x, y, BW, BH, fill, INK, { shadow: DEEP });
    ptxt(s, no, { x: x + 0.12, y: y + 0.06, w: BW - 0.2, h: 0.26, fontSize: 10, color });
    ptxt(s, name, { x: x + 0.12, y: y + 0.32, w: BW - 0.2, h: 0.36, fontSize: 14, bold: true, color, valign: "middle" });
  };
  const lbl = (t, x, y, w, color = MUTED, align = "center") => ptxt(s, t, { x, y, w, h: 0.26, fontSize: 10.5, color, align });
  const MY = 3.25, X = [0.6, 2.7, 4.8, 6.9, 9.0, 11.1];
  node("메인", "모드 선택", X[0], MY, STEEL, WHITE);
  node("난이도", "4단계 선택", X[1], MY, STEEL, WHITE);
  node("브리핑", "오늘의 조건", X[2], MY, STEEL, WHITE);
  node("인게임", "창구 심사", X[3], MY, TEAL);
  node("처리", "처리 완료", X[4], MY, YELLOW);
  node("결과", "근무 결과", X[5], MY, GREEN);
  node("일시정지", "설정 · 나가기", X[3], 1.72, PAPER);
  node("랭킹", "난이도별 순위", X[5], 5.3, YELLOW);
  for (let i = 0; i < 5; i++) seg(s, X[i] + BW + 0.02, MY + 0.39, X[i + 1] - 0.02, MY + 0.39);
  lbl("일반 / 경쟁", X[0] + BW - 0.15, MY - 0.27, 0.85);
  lbl("마지막 사건 뒤", X[4] + BW - 0.15, MY - 0.27, 1.0);
  // pause
  seg(s, X[3] + 0.6, MY, X[3] + 0.6, 1.72 + BH, { dash: true, color: PAPER2 });
  seg(s, X[3] + 1.0, 1.72 + BH, X[3] + 1.0, MY, { dash: true, color: PAPER2 });
  lbl("오가기", X[3] + 1.05, 2.72, 0.8, PAPER2, "left");
  seg(s, X[3], 2.11, X[0] + 0.8, 2.11, { arrow: false, color: PAPER2, dash: true });
  seg(s, X[0] + 0.8, 2.11, X[0] + 0.8, MY, { color: PAPER2, dash: true });
  lbl("나가기", X[1], 1.85, 1.6, PAPER2);
  // next case loop
  seg(s, X[4] + 0.8, MY + BH, X[4] + 0.8, 4.45, { arrow: false });
  seg(s, X[4] + 0.8, 4.45, X[3] + 1.1, 4.45, { arrow: false });
  seg(s, X[3] + 1.1, 4.45, X[3] + 1.1, MY + BH);
  lbl("다음 사건", X[3] + 1.2, 4.18, 1.5);
  // incident
  seg(s, X[3] + 0.4, MY + BH, X[3] + 0.4, 4.85, { arrow: false, color: RED });
  seg(s, X[3] + 0.4, 4.85, X[5] + 0.4, 4.85, { arrow: false, color: RED });
  seg(s, X[5] + 0.4, 4.85, X[5] + 0.4, MY + BH, { color: RED });
  lbl("위험한 요청 승인 → 보안 사고로 바로 결과", X[3] + 0.5, 4.88, 3.8, RED, "left");
  // result -> rank, main -> rank
  seg(s, X[5] + 1.1, MY + BH, X[5] + 1.1, 5.3, { color: YELLOW });
  lbl("경쟁", X[5] + 1.15, 4.4, 0.6, YELLOW, "left");
  seg(s, X[0] + 0.5, MY + BH, X[0] + 0.5, 5.69, { arrow: false, dash: true });
  seg(s, X[0] + 0.5, 5.69, X[5], 5.69, { dash: true });
  lbl("메인의 랭킹 버튼", X[1], 5.42, 2.0);
  pxPanel(s, 0.6, 6.15, 8.6, 0.72, NIGHT2, STEEL);
  txt(s, [{ text: "근무 결과 → ", options: { bold: true, color: WHITE } }, { text: "통과하면 다음 난이도 · 다시 하기 / 보안 사고·점검 미달이면 해설을 보고 처음부터", options: { color: MUTED, breakLine: true } },
    { text: "설정(메인) → ", options: { bold: true, color: WHITE } }, { text: "소리 · 분위기 · 글자 크기 · 기록 초기화", options: { color: MUTED } }],
    { x: 0.8, y: 6.17, w: 8.3, h: 0.68, fontSize: 11.5, valign: "middle" });
  [["시작", STEEL], ["심사", TEAL], ["처리·랭킹", YELLOW], ["결과", GREEN], ["사고", RED]].forEach(([t, c], i) => {
    rect(s, 9.45 + (i % 3) * 1.12, 6.2 + Math.floor(i / 3) * 0.36, 0.22, 0.22, c);
    ptxt(s, t, { x: 9.72 + (i % 3) * 1.12, y: 6.16 + Math.floor(i / 3) * 0.36, w: 0.9, h: 0.3, fontSize: 10.5, color: MUTED, valign: "middle" });
  });
  s.addNotes("전체 화면 흐름입니다. 메인에서 일반 모드나 경쟁 모드를 고르면 난이도 선택, 브리핑을 거쳐 창구 심사 화면에 들어갑니다. 한 건을 처리하면 처리 완료 도장이 찍히고 다음 사건으로 넘어가며, 마지막 사건 뒤에 근무 결과가 나옵니다. 위험한 요청을 승인하면 보안 사고로 바로 결과 화면이 나옵니다. 인게임 왼쪽 위 일시정지 버튼에서 설정을 바꾸거나 메인으로 나갈 수 있고, 경쟁 모드 결과에서는 랭킹으로 이어집니다.");

  /* ======================= 8. Sketch -> screen ======================= */
  s = pres.addSlide({ masterName: "MID", sectionTitle: "03 화면 설계" });
  head(s, "03  화면 설계", "회의 스케치를 이렇게 화면으로 만들었어요");
  const sk = [["sk_main", "m01-main", "메인 화면", "세로 고정 · 사운드·설정 · 일반/경쟁 모드", 212 / 437], ["sk_diff", "m03-diff", "난이도 선택", "쉬움·보통·어려움·전문가, 잠금 표시", 235 / 425], ["sk_game", "m05-desk", "인게임 (Papers, Please)", "창밖 배경 · 상대방 · 메일 내용 말풍선", 238 / 540]];
  sk.forEach(([a, b, t, d, r], i) => {
    const x = 0.6 + i * 4.11, top = 1.72, h = 4.05;
    pxPanel(s, x, top, 3.91, h + 0.75, NIGHT2, STEEL);
    const sw2 = Math.min(1.62, h * 0.86 * r), sh2 = sw2 / r;
    rect(s, x + 0.18, top + 0.18, sw2 + 0.08, sh2 + 0.08, WHITE);
    s.addImage({ path: `assets/${a}.png`, x: x + 0.22, y: top + 0.22, w: sw2, h: sh2, altText: `회의 손그림: ${t}` });
    ptxt(s, "회의 스케치", { x: x + 0.18, y: top + sh2 + 0.32, w: sw2, h: 0.26, fontSize: 10, color: MUTED, align: "center" });
    seg(s, x + sw2 + 0.32, top + 1.9, x + sw2 + 0.62, top + 1.9, { color: YELLOW, width: 2.5 });
    const ph = 3.55, pw = ph * DEV_W / DEV_H;
    s.addImage({ path: SH + b + ".png", x: x + 3.91 - pw - 0.18, y: top + 0.18, w: pw, h: ph, altText: `${t} 시제품 화면` });
    ptxt(s, t, { x: x + 0.18, y: top + h - 0.02, w: 3.6, h: 0.34, fontSize: 14, bold: true, color: WHITE });
    txt(s, d, { x: x + 0.18, y: top + h + 0.32, w: 3.6, h: 0.32, fontSize: 11, color: MUTED });
  });
  ptxt(s, "※ 인게임은 다음 4장에 나눠 설명합니다 (회의 메모: “4장 정도로 나눠 설명”).", { x: 0.6, y: 6.68, w: 12, h: 0.28, fontSize: 11, color: MUTED });
  s.addNotes("회의에서 그린 스케치를 실제 화면으로 옮긴 결과입니다. 메인 화면은 세로로 고정하고 위쪽에 사운드와 설정, 가운데 일반 모드와 경쟁 모드 버튼을 두었습니다. 난이도 선택은 쉬움부터 전문가까지 네 단계로, 앞 단계를 통과해야 열립니다. 인게임은 Papers, Please처럼 창밖 배경과 창구 앞 상대방, 상대가 보낸 메일 내용을 말풍선으로 보여 주는 구도입니다. 인게임은 회의에서 정한 대로 다음 네 장에 나눠 설명하겠습니다.");

  /* ======================= 9. Main & difficulty ======================= */
  await screenSlide("03  화면 설계 · 메인", "메인 화면과 난이도 선택", [
    { shot: "m01-main", no: "메인", who: "세로 고정", name: "메인 화면", items: [
      { at: 99, t: "사운드 · 설정", f: "F6", fc: GREEN, d: "왼쪽 위 소리 켜고 끄기,\n오른쪽 위 설정." },
      { at: 487, t: "일반 모드 · 경쟁 모드", f: "F1", d: "큰 버튼 두 개로 바로 시작.\n모드 설명은 화면에 넣지 않아요." },
      { at: 690, t: "랭킹 · 플레이어 이름", f: "F6", fc: GREEN, d: "이름은 조합 뽑기로만 정해요.\n실명·나이는 묻지 않아요." },
    ] },
    { shot: "m03-diff", no: "난이도", who: "일반·경쟁 공통", name: "난이도 선택", items: [
      { at: 178, t: "쉬움: 문자 · 메시지부터", f: "F2", d: "카드에는 사건 종류만\n짧게 적어요." },
      { at: 303, t: "앞 단계를 통과하면 열림", f: "F2", d: "잠긴 카드에는 '잠김'만\n표시해요." },
      { at: 551, t: "화면은 같고 사건만 어렵게", f: "F2", d: "■□ 단계 · 사건 수 표시.\n경쟁 모드면 제한 시간도." },
    ] },
  ], "메인 화면은 세로로 고정합니다. 왼쪽 위에서 소리를 켜고 끄고, 오른쪽 위 설정에서 분위기와 글자 크기를 바꿉니다. 가운데 큰 버튼 두 개로 일반 모드와 경쟁 모드를 고르고, 아래에서 랭킹을 봅니다. 랭킹에 올라가는 이름은 미리 만든 조합에서 뽑기 때문에 실명이나 나이를 묻지 않습니다. 난이도는 쉬움, 보통, 어려움, 전문가 네 단계이고, 앞 단계를 통과해야 열립니다. 화면과 조작은 모두 같고 들어오는 사건만 어려워집니다.");

  /* ======================= 10. In-game 1: layout (single big phone) ======================= */
  s = pres.addSlide({ masterName: "MID", sectionTitle: "03 화면 설계" });
  head(s, "03  인게임 1/4", "화면 구성: 창구 너머 상대방과 책상 위 서류");
  const P1 = phoneShot(s, "m05-desk", 0.6, 1.62, 4.82, "인게임 화면 (HTML 시제품 캡처)");
  const parts = [
    [28, "상단 바", "일시정지·소리 버튼, 난이도와 모드,\n(경쟁 모드) 남은 시간", "F6"],
    [86, "오늘의 조건 띠", "난이도별 핵심 규칙 한 줄. 누르면 규칙 카드", "F3"],
    [200, "창구 장면", "창밖 도시 배경 + 창구 앞 상대방 + 상대가 보낸 문자·메일 내용 말풍선", "F3"],
    [470, "서류 탭", "받은 문자 · 공식 연락처 · 내 기록 · 파일 정보 · 조회한 자료", "F3"],
    [718, "도구", "대조 · 표시(깃발) · 조회 · 규칙", "F3"],
    [787, "판정 버튼", "승인 · 거부 · (필요할 때) 추가 확인", "F4"],
  ];
  parts.forEach(([at, t, d, f], i) => {
    marker(s, i + 1, P1.ix + P1.iw + 0.02, P1.iy + at / DEV_H * P1.ih, 0.28);
    const x = 3.55 + (i % 2) * 4.65, y = 1.72 + Math.floor(i / 2) * 1.55;
    pxPanel(s, x, y, 4.45, 1.38, PANEL, STEEL);
    marker(s, i + 1, x + 0.35, y + 0.35, 0.32);
    txt(s, t, { x: x + 0.65, y: y + 0.17, w: 2.8, h: 0.36, fontSize: 15, bold: true, color: WHITE, valign: "middle" });
    tag(s, f, x + 4.45 - 0.62, y + 0.22, f === "F6" ? GREEN : f === "F4" ? YELLOW : TEAL);
    txt(s, d, { x: x + 0.65, y: y + 0.6, w: 3.65, h: 0.7, fontSize: 12, color: MUTED, lineSpacingMultiple: 1.05 });
  });
  s.addNotes("인게임 첫 번째, 화면 구성입니다. 회의에서 정한 Papers, Please 구도대로, 위쪽 창구 장면에 창밖 도시 배경과 창구 앞 상대방, 그리고 상대가 보낸 문자나 메일 내용을 말풍선으로 보여 줍니다. 그 아래가 책상 위 서류입니다. 받은 문자, 공식 연락처, 내 기록, 파일 정보를 탭으로 넘겨 보고, 아래 도구로 대조하고 깃발을 꽂은 뒤 판정 버튼을 누릅니다. 상단 바 왼쪽에는 일시정지와 소리 버튼이 있고, 경쟁 모드에서는 오른쪽에 남은 시간이 나옵니다.");

  /* ======================= 11-13. In-game 2..4 ======================= */
  await screenSlide("03  인게임 2/4", "단서 찾기: 대조하고, 깃발을 꽂고, 파일을 열어 본다", [
    { shot: "m06-clues", no: "단서", who: "쉬움 · 택배 문자", name: "대조와 깃발", items: [
      { at: 420, t: "두 정보를 차례로 누르면", f: "F3", d: "같은지 다른지 '일치·불일치'\n표시가 붙어요." },
      { at: 520, t: "의심 깃발", f: "F3", d: "이상한 곳에 직접 깃발을\n꽂아 표시해요." },
      { at: 650, t: "근거 트레이", f: "F3", d: "모은 단서가 한곳에 쌓여\n판정의 근거가 돼요." },
    ] },
    { shot: "m10-fileinfo", no: "파일", who: "쉬움 · 사진 압축 파일", name: "파일 정보", items: [
      { at: 315, t: "첨부를 누르면 파일 정보", f: "F3", d: "전체 이름 · 마지막 확장자 ·\n압축 안에 든 파일." },
      { at: 440, t: "마지막 확장자 = 진짜 종류", f: "F3", d: ".zip · .pdf · .apk · .exe 등\n여러 종류가 나와요." },
      { at: 520, t: "낯설다고 다 위험하진 않다", f: "F3", d: "사진·동영상만 든 압축 파일은\n승인이 정답이에요." },
    ] },
  ], "단서 찾기입니다. 대조 도구로 링크와 공식 주소처럼 두 정보를 차례로 누르면 일치나 불일치 표시가 붙고, 이상한 곳에는 직접 깃발을 꽂습니다. 모은 단서는 근거 트레이에 쌓입니다. 첨부 파일을 누르면 파일 정보가 열려서 마지막 확장자와 압축 안에 든 파일을 볼 수 있습니다. 확장자는 여러 종류가 나오고, 사진만 든 압축 파일처럼 낯설어도 정상인 사건을 섞어서 무조건 거부하지 않게 했습니다.");

  await screenSlide("03  인게임 3/4", "판정하기: 한 번 누르면 끝, 정답은 아직 비밀", [
    { shot: "m08-decide", no: "판정", who: "거부 · 추가 확인일 때", name: "처리 시트", items: [
      { at: 640, t: "거부·추가 확인만 시트", f: "F4", fc: YELLOW, d: "승인은 누르면 바로 처리.\n다시 묻는 확인 창은 없어요." },
      { at: 700, t: "신고 · 근거 · 확인 경로", f: "F4", fc: YELLOW, d: "거부면 신고 여부, 추가 확인이면\n근거와 공식 확인 경로를 골라요." },
      { at: 787, t: "보내기 한 번", f: "F4", fc: YELLOW, d: "맞았는지는 이 자리에서\n알려 주지 않아요." },
    ] },
    { shot: "m09-processed", no: "처리", who: "모든 판정 뒤", name: "처리 완료", items: [
      { at: 667, t: "처리 완료 도장", f: "F4", fc: YELLOW, d: "내가 고른 판정만 도장으로\n찍혀요." },
      { at: 735, t: "내 처리만 다시 알려 주기", d: "'거부하고 신고했어요'처럼\n내 선택을 보여 줘요." },
      { at: 782, t: "다음 요청으로", f: "F5", fc: GREEN, d: "남은 사건 수도 보여 주지\n않고 다음 상대가 와요." },
    ] },
  ], "판정입니다. 승인은 누르면 바로 처리되고, 거부나 추가 확인을 누르면 처리 시트가 열립니다. 거부라면 신고 여부를, 추가 확인이라면 근거와 공식 확인 경로를 고릅니다. 다시 묻는 확인 창은 없앴습니다. 처리하면 도장만 찍히고 맞았는지는 알려 주지 않으며, 남은 사건 수도 보여 주지 않고 다음 상대가 창구에 옵니다.");

  await screenSlide("03  인게임 4/4", "일시정지와 근무 결과", [
    { shot: "m07-pause", no: "일시정지", who: "왼쪽 위 버튼", name: "일시정지 · 설정", items: [
      { at: 330, t: "계속하기", f: "F6", fc: GREEN, d: "경쟁 모드면 시간도\n함께 멈춰요." },
      { at: 520, t: "소리 · 분위기 · 글자 크기", f: "F6", fc: GREEN, d: "게임 중에도 바로 바꿀 수\n있어요." },
      { at: 782, t: "처음 화면으로 나가기", f: "F6", fc: GREEN, d: "한 번 더 묻고 나가요. 일반\n모드는 이어서 하기 가능." },
    ] },
    { shot: "m11-end", no: "결과", who: "마지막 사건 뒤", name: "근무 결과", items: [
      { at: 124, t: "별점과 지표", f: "F5", fc: GREEN, d: "정확도·위험 탐지·과잉 차단·\n신고 판단을 한꺼번에." },
      { at: 562, t: "사건별 판정과 해설", f: "F5", fc: GREEN, d: "누르면 정답·위험 요소·\n해설·인물 반응이 열려요." },
      { at: 720, t: "다음 난이도 · 다시 하기", f: "F2", d: "실패(보안 사고·60% 미만)면\n해설을 보고 처음부터." },
    ] },
  ], "인게임 마지막은 일시정지와 결과입니다. 회의에서 정한 대로 왼쪽 위 버튼을 누르면 일시정지되고, 계속하기, 소리, 분위기, 글자 크기, 그리고 처음 화면으로 나가기가 있습니다. 경쟁 모드에서는 시간도 같이 멈춥니다. 마지막 사건이 끝나면 근무 결과에서 별점과 지표, 사건별 정답과 해설을 한꺼번에 보여 주고, 통과하면 다음 난이도가 열립니다. 위험한 요청을 승인했거나 처리 성공률이 60%보다 낮으면 해설을 보고 처음부터 다시 합니다.");

  /* ======================= 14. Versus & ranking ======================= */
  await screenSlide("03  화면 설계 · 경쟁", "경쟁 모드와 랭킹", [
    { shot: "v02-desk", no: "경쟁", who: "보통 · 사건당 50초", name: "경쟁 모드", items: [
      { at: 28, t: "사건마다 제한 시간", f: "F1", d: "쉬움 60 · 보통 50 · 어려움 45 ·\n전문가 40초. 10초 남으면 빨강." },
      { at: 200, t: "화면·사건은 일반과 같다", f: "F3", d: "속도만 겨루고, 정답 공개도\n근무가 끝난 뒤." },
      { at: 787, t: "시간이 다 되면", f: "F4", fc: YELLOW, d: "'시간 초과' 도장, 그 사건은\n놓친 것으로 처리." },
    ] },
    { shot: "v06-rank", no: "랭킹", who: "난이도별", name: "랭킹", items: [
      { at: 148, t: "난이도 탭 4개", f: "F6", fc: GREEN, d: "같은 난이도끼리만\n순위를 비교해요." },
      { at: 219, t: "방금 기록 강조", f: "F6", fc: GREEN, d: "점수 = 판정 점수 + 시간 보너스\n(맞힌 사건의 남은 초)." },
      { at: 434, t: "1단계 기기 안 → 2단계 서버", f: "F6", fc: GREEN, d: "보안 사고 기록은 올리지 않고,\n서버가 점수를 다시 계산." },
    ] },
  ], "경쟁 모드입니다. 화면과 사건은 일반 모드와 같고, 사건마다 제한 시간만 붙습니다. 쉬움 60초부터 전문가 40초까지이고, 10초가 남으면 시간이 빨간색으로 바뀝니다. 시간이 다 되면 시간 초과 도장이 찍히고 그 사건은 놓친 것으로 처리됩니다. 점수는 판정 점수에 맞힌 사건의 남은 시간을 보너스로 더합니다. 랭킹은 난이도별로 보여 주고, 이번 학기에는 기기 안 기록, 다음 학기에는 계획서의 서버로 함께 보는 랭킹을 만듭니다. 보안 사고 기록은 랭킹에 올리지 않습니다. 랭킹 화면의 기록은 시제품을 직접 여러 번 플레이해서 남긴 것입니다.");

  /* ======================= 15. Difficulty design ======================= */
  s = pres.addSlide({ masterName: "MID", sectionTitle: "03 화면 설계" });
  head(s, "03  난이도 설계", "화면은 똑같이, 사건만 어렵게");
  const dH = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: STEEL }, fontFace: PIX, fontSize: 12.5 } });
  const lvC = [GREEN, TEAL, YELLOW, RED];
  const dRows = [
    ["쉬움", "문자 · 메시지 한 통", "서류 2~3장 대조, 승인·거부", "택배 문자, 사진 압축 파일", "60초", "처음부터"],
    ["보통", "메일 · 첨부파일 · 로그인", "파일 정보(확장자), 자료 조회", "+ 견적서(.pdf .exe), 새 기기 로그인", "50초", "쉬움 통과"],
    ["어려움", "가족 · 지인 사칭", "추가 확인, 근거·확인 경로", "+ 손녀라는 새 번호", "45초", "보통 통과"],
    ["전문가", "2단계 사건 · 재촉", "모든 도구, 확인 결과로 다시 판정", "+ '선생님'의 긴급 부탁", "40초", "어려움 통과"],
  ];
  const dt = [[dH("난이도"), dH("들어오는 사건"), dH("필요한 판단"), dH("시제품 사건"), dH("경쟁 시간"), dH("열림")]];
  dRows.forEach((r, i) => dt.push(r.map((t, j) => ({ text: t, options: j === 0 ? { bold: true, color: INK, fill: { color: lvC[i] }, fontFace: PIX } : { color: j === 1 ? WHITE : MUTED, bold: j === 1, fill: { color: i % 2 ? NIGHT2 : PANEL }, align: j >= 4 ? "center" : "left" } }))));
  s.addTable(dt, { x: 0.6, y: 1.72, w: 12.13, colW: [1.25, 2.55, 3.1, 2.98, 1.1, 1.15], rowH: 0.58, fontFace: BODY, fontSize: 12.5, valign: "middle", margin: [0.04, 0.12, 0.04, 0.12], border: { type: "solid", color: NIGHT, pt: 2 } });
  pxPanel(s, 0.6, 4.95, 7.4, 1.9, NIGHT2, STEEL);
  ptxt(s, "회의 메모", { x: 0.8, y: 5.05, w: 3, h: 0.28, fontSize: 11, color: YELLOW });
  rect(s, 0.8, 5.36, 3.62, 0.76, WHITE);
  s.addImage({ path: "assets/sk_level.png", x: 0.82, y: 5.38, w: 3.58, h: 3.58 * 155 / 745, altText: "회의 손그림: 난이도 — 화면 방식은 똑같이(Play), 문자 화면" });
  txt(s, "“화면은 똑같이(Play),\n문자 화면부터…”\n→ 조작은 한 번만 배우고,\n사건·단서·도구만 단계마다 늘린다.", { x: 4.6, y: 5.3, w: 3.3, h: 1.45, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.1 });
  pxPanel(s, 8.2, 4.95, 4.53, 1.9, PANEL, STEEL);
  txt(s, [{ text: "모든 난이도 공통", options: { bold: true, color: WHITE, breakLine: true } }, { text: "• 정상 요청(승인이 정답)을 30~40% 섞기", options: { breakLine: true } }, { text: "• 위험 승인 = 보안 사고, 60% 미만 = 다시", options: { breakLine: true } }, { text: "• 본 게임은 Day 사건들을 4단계로 묶어 배치" }],
    { x: 8.4, y: 5.08, w: 4.2, h: 1.65, fontSize: 12, color: MUTED, lineSpacingMultiple: 1.15 });
  s.addNotes("난이도 설계입니다. 회의 메모대로 화면과 조작은 모든 난이도에서 똑같고, 들어오는 사건만 어려워집니다. 쉬움은 문자 한 통으로 서류 두세 장만 비교하면 되고, 보통은 메일과 첨부파일이 들어와 확장자와 조회 자료를 봐야 합니다. 어려움은 가족 사칭이 섞여서 추가 확인과 확인 경로까지 고르고, 전문가는 확인 결과를 보고 다시 판정하는 2단계 사건이 나옵니다. 모든 난이도에 정상 요청을 30~40% 섞어서 무조건 거부하면 점수가 떨어지게 했습니다.");

  /* ======================= 16. Mood ======================= */
  s = pres.addSlide({ masterName: "MID", sectionTitle: "03 화면 설계" });
  head(s, "03  분위기", "어둡게 갈까, 밝게 갈까? 둘 다 만들어 봤어요");
  const mood = [["어둡게 · 밤 근무", "m01-main", "m05-desk", NIGHT2, "집중 · 긴장감 · 도트 네온", "경쟁 모드, 몰입 플레이"], ["밝게 · 낮 근무", "l01-main", "l03-desk", PAPER, "친근함 · 가벼움 · 오래 봐도 편함", "일반 모드, 밝은 곳·오래 하기"]];
  for (let i = 0; i < 2; i++) {
    const [t, a, b, bg, feel, fit] = mood[i], x = 0.6 + i * 4.5;
    pxPanel(s, x, 1.72, 4.3, 5.15, i ? PAPER2 : PANEL, i ? YELLOWD : STEEL);
    htxt(s, t, { x: x + 0.25, y: 1.85, w: 3.8, h: 0.42, fontSize: 17, color: i ? INK : WHITE });
    const ph = 3.15, pw = ph * DEV_W / DEV_H;
    s.addImage({ path: SH + a + ".png", x: x + 0.3, y: 2.4, w: pw, h: ph, altText: `${t} 메인 화면` });
    s.addImage({ path: SH + b + ".png", x: x + 0.3 + pw + 0.25, y: 2.4, w: pw, h: ph, altText: `${t} 인게임 화면` });
    txt(s, [{ text: "느낌  ", options: { bold: true } }, { text: feel, options: { breakLine: true } }, { text: "어울림  ", options: { bold: true } }, { text: fit }],
      { x: x + 0.3, y: 5.72, w: 3.85, h: 0.95, fontSize: 12, color: i ? INK : MUTED, lineSpacingMultiple: 1.15 });
  }
  pxPanel(s, 9.75, 1.72, 2.98, 5.15, NIGHT2, STEEL);
  ptxt(s, "회의 메모", { x: 9.95, y: 1.85, w: 2.6, h: 0.28, fontSize: 11, color: YELLOW });
  rect(s, 9.95, 2.2, 2.58, 0.7, WHITE);
  s.addImage({ path: "assets/sk_mood.png", x: 9.97, y: 2.22, w: 2.54, h: 2.54 * 190 / 745, altText: "회의 손그림: 분위기 어둡게? 밝게?" });
  txt(s, [{ text: "같은 화면에 색만 바꿔요", options: { bold: true, color: WHITE, breakLine: true } }, { text: "판정 로직·사건 데이터는 그대로, 설정 · 일시정지에서 언제든 전환.", options: { color: MUTED, breakLine: true } },
    { text: " ", options: { breakLine: true } }, { text: "제안", options: { bold: true, color: YELLOW, breakLine: true } }, { text: "기본값은 어둡게, 밝게는 선택. 오늘 의견을 받아 확정할게요.", options: { color: MUTED } }],
    { x: 9.95, y: 3.1, w: 2.6, h: 3.6, fontSize: 12, lineSpacingMultiple: 1.15 });
  s.addNotes("회의에서 분위기를 어둡게 할지 밝게 할지 정하지 못해서, 둘 다 만들어 봤습니다. 어둡게는 밤 근무 느낌으로 집중되고 긴장감이 있어 경쟁 모드와 잘 어울리고, 밝게는 낮 근무 느낌으로 친근하고 오래 봐도 편합니다. 같은 화면에서 색만 바꾸는 방식이라 판정 로직과 사건 데이터는 그대로이고, 설정이나 일시정지에서 언제든 바꿀 수 있습니다. 저희는 기본값을 어둡게, 밝게를 선택으로 제안하고, 오늘 의견을 받아 확정하겠습니다.");


  /* ======================= Play guide (outside the game) ======================= */
  s = pres.addSlide({ masterName: "MID", sectionTitle: "03 화면 설계" });
  head(s, "03  플레이 가이드", "플레이 가이드: 게임 화면 밖에서 설명할 것");
  chip(s, "게임 밖 설명 · 인게임에는 표시하지 않음", 8.35, 0.36, 4.38, 0.34, PAPER, INK, 11, { bold: true, border: YELLOWD });
  const G = [
    ["조작", "tools", ["대조: 정보 두 개를 차례로 누르면 일치·불일치 (같은 종류끼리)", "표시: 의심스러운 곳에 깃발 꽂기·빼기", "조회: 센터 자료 꺼내기, 몇 번 해도 감점 없음", "규칙: 오늘의 조건과 규칙집 다시 보기", "첨부 파일을 누르면 파일 정보(마지막 확장자)"]],
    ["규칙", "scale", ["판정 결과는 근무가 끝난 뒤 한꺼번에 공개", "위험한 요청 승인 = 보안 사고, 그 자리에서 종료", "처리 성공률 60% 미만 = 점검 미달", "실패하면 그 난이도를 처음부터", "정상 요청을 막아도 감점 (편의 게이지)"]],
    ["모드 · 난이도", "gamepad", ["일반: 시간 제한 없음, 나갔다 와도 이어서", "경쟁: 사건당 60·50·45·40초, 남은 초 = 보너스", "경쟁: 시간 초과 = 놓침, 나가면 이번 기록 삭제", "난이도: 화면·조작은 같고 사건만 어려워짐", "앞 난이도를 통과하면 다음 난이도가 열림"]],
    ["이름 · 기록 · 시제품", "save", ["이름은 미리 만든 조합 뽑기 (실명·나이 없음)", "랭킹: 1단계 기기 안 상위 10 → 2단계 서버", "보안 사고 판은 랭킹에 오르지 않음", "화면은 HTML 시제품 (Unity 구현 전)", "인물·번호·주소는 모두 가상 (.example 도메인)"]],
  ];
  for (let i = 0; i < 4; i++) {
    const [t, ico, items] = G[i], x = 0.6 + (i % 2) * 6.13, y = 1.72 + Math.floor(i / 2) * 2.55;
    pxPanel(s, x, y, 6.0, 2.38, PAPER, YELLOWD, { shadow: DEEP });
    await iconTile(s, ico, x + 0.25, y + 0.22, 0.55, WOOD, PAPER, { bg: PAPER });
    htxt(s, t, { x: x + 0.95, y: y + 0.22, w: 4.8, h: 0.55, fontSize: 18, color: INK, valign: "middle" });
    txt(s, items.map((m, j) => ({ text: m, options: { bullet: { indent: 12 }, breakLine: j < items.length - 1 } })), { x: x + 0.3, y: y + 0.88, w: 5.55, h: 1.42, fontSize: 12, color: INK, paraSpaceAfter: 1 });
  }
  ptxt(s, "※ 이 내용은 게임 안에 튜토리얼·안내 문구로 넣지 않고, 발표·설명서(play-guide.md)로만 전달합니다.", { x: 0.6, y: 6.85, w: 12, h: 0.2, fontSize: 10, color: MUTED });
  s.addNotes("게임 화면에는 규칙과 사건, 결과만 남기고 튜토리얼이나 안내 문구는 모두 뺐습니다. 대신 조작법, 규칙, 모드와 난이도, 이름과 기록에 대한 설명은 이렇게 게임 밖 플레이 가이드로 따로 정리했습니다. 대조는 정보 두 개를 차례로 눌러 비교하는 것이고, 판정 결과는 근무가 끝난 뒤 한꺼번에 공개됩니다. 위험한 요청을 승인하면 보안 사고로 바로 끝나고, 처리 성공률이 60%보다 낮아도 처음부터 다시 합니다. 경쟁 모드는 사건마다 제한 시간이 있고 남은 시간이 보너스가 됩니다.");

  /* ======================= 17. Expected effects ======================= */
  pres.addSection({ title: "04 기대효과 · 계획" });
  s = pres.addSlide({ masterName: "MID", sectionTitle: "04 기대효과 · 계획" });
  head(s, "04  기대효과", "이 게임으로 기대하는 것");
  const eff = [
    ["puzzle", "추리하는 재미", "작은 차이를 찾아내는 심사 장르의 재미를\n누구나 겪는 생활 사건으로 옮긴다.", TEAL],
    ["redo", "다시 하게 되는 구조", "난이도 4단계와 경쟁 모드 랭킹으로\n같은 사건도 더 빠르고 정확하게 도전.", YELLOW],
    ["medal", "함께 겨루는 재미", "같은 사건, 같은 난이도에서 점수 경쟁.\n친구·가족과 랭킹을 두고 다시 도전.", GREEN],
    ["database", "쉽게 늘어나는 콘텐츠", "사건·규칙을 데이터로 분리해 새 수법이\n나오면 사건만 추가. 2단계에 서버 랭킹.", PURPLE],
  ];
  for (let i = 0; i < 4; i++) {
    const [ico, t, d, c] = eff[i], x = 0.6 + (i % 2) * 6.13, y = 1.72 + Math.floor(i / 2) * 2.4;
    pxPanel(s, x, y, 6.0, 2.22, PANEL, STEEL);
    await iconTile(s, ico, x + 0.3, y + 0.32, 0.8, c, INK, { bg: PANEL });
    htxt(s, t, { x: x + 1.32, y: y + 0.32, w: 4.5, h: 0.5, fontSize: 19, color: WHITE, valign: "middle" });
    txt(s, d, { x: x + 1.32, y: y + 0.95, w: 4.55, h: 1.1, fontSize: 14, color: MUTED, lineSpacingMultiple: 1.2 });
  }
  ptxt(s, "형태: 광고·결제 없는 모바일 게임 · 오프라인 플레이 · 세로 한 손 조작", { x: 0.6, y: 6.6, w: 12.1, h: 0.3, fontSize: 12, color: MUTED });
  s.addNotes("기대효과입니다. 첫째, 서류 속 작은 차이를 찾아내는 심사 장르의 재미를 누구나 겪는 생활 사건으로 옮깁니다. 둘째, 난이도 네 단계와 경쟁 모드 랭킹으로 같은 사건도 더 빠르고 정확하게 다시 도전하게 됩니다. 셋째, 같은 난이도에서 점수를 겨루는 랭킹으로 친구나 가족과 함께 다시 도전하게 됩니다. 넷째, 사건과 규칙이 데이터로 분리돼 있어 새로운 수법이 나오면 사건만 추가하면 되고, 다음 학기에는 서버 랭킹을 붙일 수 있습니다.");

  /* ======================= 18. Plan & roles ======================= */
  s = pres.addSlide({ masterName: "MID", sectionTitle: "04 기대효과 · 계획" });
  head(s, "04  일정 · 역할", "앞으로 이렇게 만들어요");
  pxPanel(s, 0.6, 1.7, 9.55, 0.4, PANEL, STEEL);
  ptxt(s, "1단계 · 이번 학기 (설계 · 프로토타입)", { x: 0.6, y: 1.7, w: 9.55, h: 0.4, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle" });
  pxPanel(s, 10.35, 1.7, 2.38, 0.4, PANEL, STEEL);
  ptxt(s, "2단계 · 다음 학기", { x: 10.35, y: 1.7, w: 2.38, h: 0.4, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle" });
  const plan = [["1~4주 · 9월", "주제 확정\n유사 콘텐츠 조사"], ["5~7주 · 현재", "회의 반영 화면 설계\nHTML 시제품 v0.4\n중간발표"], ["8~10주", "사건·규칙 데이터\n난이도 배치·저장 설계"], ["11~13주", "Unity 프로토타입\n메인→인게임→결과"], ["14~15주", "테스트·산출물 정리\n기말발표"], ["다음 학기", "서버 랭킹·사건 확충\n테스트·최종 발표"]];
  const xs = [1.4, 3.3, 5.2, 7.1, 9.0, 11.54];
  rect(s, 0.85, 2.83, 11.6, 0.06, STEEL);
  plan.forEach(([m, d], i) => {
    const x = xs[i], cur = i === 1, done = i === 0;
    ptxt(s, m, { x: x - 0.9, y: 2.22, w: 1.8, h: 0.32, fontSize: 13, bold: true, color: cur ? YELLOW : WHITE, align: "center" });
    const d0 = cur ? 0.3 : 0.2; rect(s, x - d0 / 2, 2.86 - d0 / 2, d0, d0, cur ? YELLOW : done ? GREEN : TEAL);
    txt(s, d, { x: x - 0.93, y: 3.1, w: 1.86, h: 0.8, fontSize: 11, color: MUTED, align: "center", lineSpacingMultiple: 1.05 });
  });
  ptxt(s, "누가 무엇을 맡나요?", { x: 0.6, y: 4.2, w: 6, h: 0.32, fontSize: 14, bold: true, color: WHITE });
  const roles = [["A", "○○○ (팀장)", "기획·자료 수집·디자인·사건 개발"], ["B", "○○○", "기획·메인 개발(Unity)·테스트"], ["C", "○○○", "기획·자료 수집·디자인·사건 개발"], ["D", "○○○", "기획·자료 수집·디자인·보고서"]];
  roles.forEach(([a, n, d], i) => {
    const x = 0.6 + i * 3.08;
    pxPanel(s, x, 4.65, 2.9, 1.35, PANEL, STEEL);
    pxPanel(s, x + 0.22, 4.85, 0.5, 0.5, TEAL, INK, { bg: PANEL });
    htxt(s, a, { x: x + 0.22, y: 4.85, w: 0.5, h: 0.5, fontSize: 16, color: INK, align: "center", valign: "middle" });
    txt(s, n, { x: x + 0.85, y: 4.85, w: 1.95, h: 0.5, fontSize: 13, bold: true, color: WHITE, valign: "middle" });
    txt(s, d, { x: x + 0.22, y: 5.48, w: 2.6, h: 0.4, fontSize: 11.5, color: MUTED });
  });
  ptxt(s, "※ 일정과 역할은 과제 계획서(2026.09~12, 4명)를 따르고, 작업 내용은 회의 반영 기획(v0.4)에 맞췄습니다.", { x: 0.6, y: 6.35, w: 12, h: 0.28, fontSize: 11, color: MUTED });
  s.addNotes("일정은 과제 계획서의 주차 계획을 따릅니다. 지금은 회의 내용을 반영해 화면을 설계하고 HTML 시제품을 만든 단계입니다. 8~10주에는 사건과 규칙 데이터, 난이도 배치, 저장 방식을 정리하고, 11~13주에 메인부터 인게임, 결과까지 한 판이 도는 Unity 프로토타입을 만든 뒤, 14~15주에 테스트와 기말발표를 하겠습니다. 다음 학기에는 서버 랭킹과 사건을 늘리고 최종 발표를 합니다.");

  /* ======================= 19. Concerns & Q&A ======================= */
  pres.addSection({ title: "마무리" });
  s = pres.addSlide({ masterName: "COVER", sectionTitle: "마무리" });
  s.background = { path: "assets/px_bg.png" };
  htxt(s, "걱정되는 점, 함께 봐 주세요", { x: 0.75, y: 0.6, w: 11, h: 0.75, fontSize: 32, color: WHITE });
  ptxt(s, "피드백을 주시면 기말까지 반영하겠습니다.", { x: 0.75, y: 1.38, w: 8, h: 0.36, fontSize: 15, color: MUTED });
  const qs = [
    ["Q1", "기본 분위기,\n어둡게? 밝게?", "→ 둘 다 만들었어요. 기본은 어둡게, 밝게는 선택으로 제안합니다. 의견 부탁드립니다"],
    ["Q2", "경쟁 모드의 제한 시간이\n판단을 서두르게 하지 않을까?", "→ 일반 모드와 나누고, 시간 보너스는 맞힌 사건에만 줘요. 테스트로 시간을 조정할게요"],
    ["Q3", "이번 학기 Unity\n프로토타입 범위는?", "→ 메인부터 결과까지 한 판 + 기기 안 랭킹. 서버 랭킹은 다음 학기로 계획했어요"],
  ];
  qs.forEach(([q, t, a], i) => {
    const x = 0.75 + i * 4.0;
    pxPanel(s, x, 2.1, 3.75, 2.75, PANEL, STEEL, { shadow: DEEP });
    htxt(s, q, { x: x + 0.28, y: 2.28, w: 1, h: 0.45, fontSize: 22, color: YELLOW });
    txt(s, t, { x: x + 0.28, y: 2.8, w: 3.25, h: 0.8, fontSize: 15, bold: true, color: WHITE, lineSpacingMultiple: 1.1 });
    txt(s, a, { x: x + 0.28, y: 3.72, w: 3.25, h: 0.95, fontSize: 12, color: MUTED, lineSpacingMultiple: 1.1 });
  });
  pxPanel(s, 9.95, 5.05, 2.8, 1.75, PANEL, STEEL, { shadow: DEEP });
  s.addImage({ path: "assets/px_officer.png", x: 11.0, y: 5.13, w: 1.6, h: 1.6, altText: "도트 보안관" });
  s.addImage({ path: "assets/px_dot.png", x: 10.2, y: 5.92, w: 0.75, h: 0.75, altText: "AI 조수 도트" });
  htxt(s, "감사합니다  ·  Q&A", { x: 0.75, y: 5.45, w: 8, h: 0.7, fontSize: 30, color: TEAL });
  ptxt(s, "Team 셜록홈즈  |  Data, Please.", { x: 0.75, y: 6.2, w: 8, h: 0.32, fontSize: 13, color: MUTED });
  s.addNotes("마지막으로 함께 봐 주셨으면 하는 세 가지입니다. 기본 분위기를 어둡게 할지 밝게 할지, 경쟁 모드의 제한 시간이 판단을 서두르게 하지는 않을지, 그리고 이번 학기 Unity 프로토타입의 범위가 적절한지입니다. 의견 주시면 기말까지 반영하겠습니다. 감사합니다.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
