// Pixel-art key art: the digital security officer at the center's terminal desk.
// Drawn on a 320x180 logical grid, upscaled x10 with nearest-neighbour.
const sharp = require("sharp");
const fs = require("fs");
fs.mkdirSync("assets", { recursive: true });

const PAL = {
  night: "0F1426", night2: "151C33", panel: "1F2A4A", steel: "3A4E7A", haze: "7F9CC9",
  paper: "F2EBD9", paper2: "E3D7BC", ink: "22201F", pencil: "6B6560",
  yellow: "F7D84A", yellowD: "B08E1C", green: "3FBF6F", greenD: "23784A", red: "E0503C", redD: "8E2B25",
  teal: "45C7C1", tealD: "2A8C88", purple: "8A6BD1", wood: "8A5A3B", wood2: "A8714C", white: "FFFFFF",
  skin: "F2C9A0", skinD: "D9A77E", hair: "3A2A22", sky: "122544", sky2: "0B1A33", win: "1A2E55",
};
const hex = (h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];

// Officer sprite (front view, upper body). Keys -> palette
const OFFICER = [
  "........KKKKKKKK........",
  "......KKCCCCCCCCKK......",
  ".....KCCCCCYYCCCCCK.....",
  "....KCCCCCYYYYCCCCCK....",
  "....KCCCCCCYYCCCCCCK....",
  "....KccccccccccccccK....",
  "...KKKKKKKKKKKKKKKKKK...",
  "....KHHSSSSSSSSSSHHK....",
  "....KHSSSSSSSSSSSSHK....",
  "....KSSEESSSSSSEESSK....",
  "....KSSEESSSSSSEESSK....",
  "...KsSSSSSSSSSSSSSSsK...",
  "....KSSSSSMMMMSSSSSK....",
  ".....KSSSSSSSSSSSSK.....",
  "......KKSSSSSSSSKK......",
  "........KKSSSSKK........",
  "....KKKKTTWWWWTTKKKK....",
  "..KKUUUUUTTWWTTUUUUUKK..",
  ".KUUUUUUUUTWWTUUUUUUUUK.",
  ".KUUUYYUUUUWWUUUUUUUUUK.",
  "KUUUYYYYUUUWWUUUUUUUUUUK",
  "KUUUUYYUUUUWWUUUUUUUUUUK",
  "KUUUUUUUUUUWWUUUUUUUUUUK",
  "KUUUUUUUUUUUUUUUUUUUUUUK",
];
const OFFICER_PAL = { K: PAL.night, C: PAL.teal, c: PAL.tealD, Y: PAL.yellow, S: PAL.skin, s: PAL.skinD, H: PAL.hair, E: PAL.ink, M: PAL.red, T: PAL.teal, W: PAL.white, U: PAL.steel };
const BOT = [".....C......", ".....W......", "..WWWWWWWW..", ".WWWWWWWWWW.", ".WNNNNNNNNW.", ".WNCNNNNCNW.", ".WNCNNNNCNW.", ".WNNNCCNNNW.", ".WWWWWWWWWW.", "..WWWWWWWW..", "...WW..WW...", "..LLL..LLL.."];
const BOT_PAL = { C: PAL.teal, W: PAL.white, N: PAL.panel, L: PAL.haze };
const ICON = {
  shield: ["XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXXXXXXXWXX", "XXXXXXXXWWXX", "XWXXXXXWWXXX", "XWWXXXWWXXXX", ".XWWXWWXXXX.", ".XXWWWXXXXX.", "..XXWXXXXX..", "...XXXXXX...", "....XXXX....", ".....XX....."],
  mail: ["XXXXXXXXXXX", "XX.......XX", "X.X.....X.X", "X..X...X..X", "X...X.X...X", "X....X....X", "XXXXXXXXXXX"],
  mag: ["..XXX....", ".X...X...", "X.....X..", "X.....X..", "X.....X..", ".X...X...", "..XXXXX..", "......XX.", ".......XX"],
  alert: ["....X....", "...XXX...", "...X.X...", "..XX.XX..", "..XX.XX..", ".XXXXXXX.", ".XXX.XXX.", "XXXXXXXXX"],
  check: ["........X", ".......XX", "X.....XX.", "XX...XX..", ".XX.XX...", "..XXX....", "...X....."],
};

function canvas(W, H) {
  const buf = Buffer.alloc(W * H * 4);
  const px = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; const [r, g, b] = hex(c); buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; };
  const rect = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c); };
  const sprite = (rows, pal, x, y, k = 1) => rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) rect(x + i * k, y + j * k, k, k, pal[ch]); }));
  const icon = (name, x, y, c) => ICON[name].forEach((r, j) => [...r].forEach((ch, i) => { if (ch === "X") px(x + i, y + j, c); else if (ch === "W") px(x + i, y + j, PAL.white); }));
  // pixel panel with notched corners
  const panel = (x, y, w, h, fill, border) => { rect(x + 1, y, w - 2, h, border); rect(x, y + 1, w, h - 2, border); rect(x + 1, y + 1, w - 2, h - 2, fill); };
  return { W, H, buf, px, rect, sprite, icon, panel };
}

function keyArt({ fade = true, robot = true } = {}) {
  const c = canvas(320, 180);
  const { rect, px, sprite, icon, panel } = c;
  // background with dithered bands
  rect(0, 0, 320, 180, PAL.night);
  for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) if ((x + y) % 4 === 0 && y < 120 && x > 120) px(x, y, PAL.night2);
  // big window with city
  panel(150, 10, 164, 68, PAL.sky, PAL.steel);
  rect(152, 12, 160, 64, PAL.sky);
  for (let y = 12; y < 40; y += 2) rect(152, y, 160, 1, PAL.sky2);
  [[166, 9], [205, 6], [240, 11], [290, 7], [178, 14], [262, 15], [300, 22]].forEach(([x, y]) => px(x, y + 8, PAL.white));
  // moon
  rect(286, 18, 10, 10, PAL.paper); rect(285, 20, 12, 6, PAL.paper); rect(288, 17, 6, 12, PAL.paper); rect(290, 19, 3, 3, PAL.paper2);
  const bld = [[154, 36, 14], [170, 44, 12], [184, 30, 16], [202, 40, 12], [216, 26, 18], [236, 38, 14], [252, 32, 16], [270, 44, 12], [284, 36, 14], [300, 42, 12]];
  bld.forEach(([x, top, w], k) => {
    rect(x, top, w, 76 - top, PAL.win);
    for (let yy = top + 3; yy < 72; yy += 4) for (let xx = x + 2; xx < x + w - 2; xx += 3) if ((xx * 3 + yy * 7 + k) % 5 < 2) px(xx, yy, (xx + yy) % 3 ? PAL.yellow : PAL.teal);
  });
  // monitor wall
  const mon = (x, y, w, h, border) => { panel(x, y, w, h, PAL.panel, border); rect(x + 3, y + 3, w - 6, h - 9, PAL.sky2); for (let yy = y + 4; yy < y + h - 6; yy += 2) rect(x + 3, yy, w - 6, 1, "13284A"); rect(x + w / 2 - 3, y + h, 6, 4, PAL.steel); };
  mon(124, 66, 46, 34, PAL.haze); icon("mag", 143, 77, PAL.white);
  rect(129, 72, 12, 2, PAL.haze); rect(129, 76, 9, 1, PAL.steel); rect(129, 79, 11, 1, PAL.yellow); rect(129, 82, 8, 1, PAL.steel);
  mon(270, 66, 46, 34, PAL.haze); icon("mail", 281, 75, PAL.paper); icon("alert", 296, 82, PAL.yellow);
  mon(194, 22, 56, 42, PAL.teal); icon("shield", 216, 33, PAL.teal);
  // officer (2x) behind the desk
  sprite(OFFICER, OFFICER_PAL, 198, 98, 2);
  // desk
  rect(110, 144, 210, 4, PAL.wood2); rect(110, 148, 210, 3, PAL.wood); rect(110, 151, 210, 29, PAL.panel); for (let x = 112; x < 320; x += 6) rect(x, 155, 3, 1, PAL.steel);
  // hands resting on the desk
  rect(190, 139, 10, 6, PAL.skin); rect(190, 139, 10, 1, PAL.skinD); rect(244, 139, 10, 6, PAL.skin); rect(244, 139, 10, 1, PAL.skinD);
  // papers & stamp on desk
  panel(128, 128, 26, 17, PAL.paper, PAL.ink); rect(132, 132, 14, 1, PAL.pencil); rect(132, 135, 18, 1, PAL.pencil); rect(132, 138, 11, 1, PAL.red);
  panel(158, 131, 22, 14, PAL.paper2, PAL.ink); rect(162, 135, 12, 1, PAL.pencil); rect(162, 138, 14, 1, PAL.pencil);
  rect(262, 134, 10, 9, PAL.red); rect(265, 129, 4, 6, PAL.redD); rect(260, 142, 14, 2, PAL.redD);
  // DOT robot (2x) + speech chips
  if (robot) {
    sprite(BOT, BOT_PAL, 284, 112, 2); rect(284, 137, 24, 1, PAL.tealD);
    panel(276, 102, 26, 12, PAL.yellow, PAL.ink); icon("alert", 278, 104, PAL.ink); rect(289, 107, 9, 1, PAL.ink); rect(289, 110, 6, 1, PAL.ink);
  }
  panel(174, 86, 18, 11, PAL.green, PAL.ink); icon("check", 178, 88, PAL.ink);
  // left fade for the title area (dither, then solid)
  if (fade) {
    rect(0, 0, 76, 180, PAL.night);
    for (let y = 0; y < 180; y++) for (let x = 76; x < 108; x++) { const t = (x - 76) / 32; if (((x * 7 + y * 13) % 10) / 10 > t) px(x, y, PAL.night); }
  }
  return c;
}

function save(c, file, scale = 10) {
  return sharp(c.buf, { raw: { width: c.W, height: c.H, channels: 4 } }).resize(c.W * scale, c.H * scale, { kernel: "nearest" }).png().toFile(file);
}

(async () => {
  await save(keyArt(), "assets/px_keyart.png");
  await save(keyArt({ fade: false }), "assets/px_keyart_full.png");
  // officer portrait tile for slides
  const o = canvas(32, 32); o.rect(0, 0, 32, 32, PAL.panel); o.sprite(OFFICER, OFFICER_PAL, 4, 6); await save(o, "assets/px_officer.png", 16);
  const b = canvas(16, 16); b.rect(0, 0, 16, 16, PAL.night); b.sprite(BOT, BOT_PAL, 2, 2); await save(b, "assets/px_dot.png", 16);
  console.log("pixel art ok");
})();
module.exports = { OFFICER, OFFICER_PAL, PAL };
