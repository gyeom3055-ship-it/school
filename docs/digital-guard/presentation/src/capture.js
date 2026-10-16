const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2], FILE = process.argv[3];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + FILE); await p.waitForTimeout(400);
  const boxes = {};
  const SEL = ['.mainbar', '[data-act="pick-mode"]', '[data-act="rank"]', '.nick', '.hero-scene', '.diff', '.navrow', '.scene', '.speech', '.visitor', '.topbar', '[data-act="pause"]', '[data-act="sound"]', '.timer', '.condition', '.tabs', '.tools', '.verdicts', '.sheet', '.rank-list', '.rk', '.rank-card', '.metrics', '.stars', '.review', '.seal', '[data-act="again"]', '[data-act="ask-exit"]', '.section', '.tray', '.doc'];
  const shot = async n => {
    await p.waitForTimeout(200); await p.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove()));
    await p.locator('#device').screenshot({ path: `${OUT}/${n}.png` });
    boxes[n] = await p.evaluate(SEL => { const d = document.querySelector('#device').getBoundingClientRect(); const o = {};
      SEL.forEach(s => { const a = [...document.querySelectorAll(s)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > d.top && r.top < d.bottom; })
        .map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.left - d.left), Math.round(r.top - d.top), Math.round(r.width), Math.round(r.height), (e.innerText || '').slice(0, 20).replace(/\n/g, ' ')]; });
        if (a.length) o[s] = a; }); return o; }, SEL);
  };
  const c = async s => { await p.click(s); await p.waitForTimeout(90); };
  const cl = async (s, t) => { await p.locator(s, { hasText: t }).click(); await p.waitForTimeout(90); };
  await shot('m01-main');
  await c('[data-act="settings"]'); await shot('m02-settings'); await c('[data-act="close"]');
  await c('[data-act="pick-mode"][data-m="normal"]'); await shot('m03-diff');
  await p.click('[data-act="pick-diff"][data-d="1"]', { force: true }); await p.waitForTimeout(90); // locked -> toast only
  const still = await p.evaluate(() => S.view); console.log('locked click stays on', still);
  await c('[data-act="pick-diff"][data-d="0"]'); await shot('m04-brief');
  await c('[data-act="begin"]'); await shot('m05-desk');
  // case 1 (택배): compare + flag + reject+report
  await c('[data-act="mode"][data-m="compare"]'); await c('[data-id="sms.link"]'); await c('[data-act="tab"][data-id="official"]'); await c('[data-id="official.domain"]');
  await c('[data-act="mode"][data-m="flag"]'); await c('[data-act="tab"][data-id="sms"]'); await c('[data-id="sms.link"]'); await c('[data-act="mode"][data-m="flag"]');
  await shot('m06-clues');
  await c('[data-act="pause"]'); await shot('m07-pause'); await c('[data-act="close"]');
  await c('[data-act="verdict"][data-v="reject"]'); await c('[data-act="report"][data-r="1"]'); await shot('m08-decide');
  await c('[data-act="submit"]'); await shot('m09-processed');
  await c('[data-act="next"]'); await c('[data-id="msg.attach"]'); await shot('m10-fileinfo');
  await c('[data-act="verdict"][data-v="approve"]'); await c('[data-act="next"]'); await shot('m11-end');
  console.log('cleared', await p.evaluate(() => JSON.stringify(S.cleared)));
  // light mood
  await c('[data-act="pause"]'); await c('[data-act="mood"][data-x="light"]'); await c('[data-act="close"]');
  await c('[data-act="exit"]'); await shot('l01-main');
  await c('[data-act="pick-mode"][data-m="normal"]'); await shot('l02-diff');
  await c('[data-act="pick-diff"][data-d="1"]'); await c('[data-act="begin"]'); await shot('l03-desk');
  await c('[data-act="pause"]'); await c('[data-act="mood"][data-x="dark"]'); await c('[data-act="close"]');
  await shot('m12-desk-normal');
  // exit (normal) -> resume
  await c('[data-act="pause"]'); await c('[data-act="ask-exit"]'); await shot('m13-exit'); await c('[data-act="exit"]');
  console.log('resume btn', await p.locator('[data-act="resume"]').count());
  const quick = async (wait) => { await c('[data-act="nick"]'); await c('[data-act="pick-mode"][data-m="versus"]'); await c('[data-act="pick-diff"][data-d="1"]'); await c('[data-act="begin"]');
    for (let i = 0; i < 4; i++) { if (wait) await p.waitForTimeout(wait); await c('[data-act="verdict"][data-v="reject"]'); await c('[data-act="report"][data-r="1"]'); await c('[data-act="submit"]'); await c('[data-act="next"]'); }
    await c('[data-act="exit"]'); };
  await quick(0); await quick(2500);
  // versus on 보통
  await c('[data-act="pick-mode"][data-m="versus"]'); await shot('v01-diff');
  await c('[data-act="pick-diff"][data-d="1"]'); await c('[data-act="begin"]'); await p.waitForTimeout(2200); await shot('v02-desk');
  const left1 = await p.evaluate(() => S.c.left);
  await c('[data-act="pause"]'); await p.waitForTimeout(1500); const left2 = await p.evaluate(() => S.c.left); await shot('v03-pause'); await c('[data-act="close"]');
  console.log('timer paused?', left1, left2);
  // case1 reject+report
  await c('[data-act="verdict"][data-v="reject"]'); await c('[data-act="report"][data-r="1"]'); await c('[data-act="submit"]'); await c('[data-act="next"]');
  // case2 approve
  await c('[data-act="verdict"][data-v="approve"]'); await c('[data-act="next"]');
  // case3 (exe) let it time out
  await p.evaluate(() => { S.c.left = 3; }); await p.waitForTimeout(3600); await shot('v04-timeout');
  await c('[data-act="next"]');
  // case4 login: approve
  await c('[data-act="verdict"][data-v="approve"]'); await c('[data-act="next"]'); await shot('v05-end');
  console.log('end', await p.evaluate(() => JSON.stringify(S.end)));
  await c('[data-act="rank"]'); await shot('v06-rank');
  // incident path in versus
  await c('[data-act="pick-mode"][data-m="versus"]'); await c('[data-act="pick-diff"][data-d="0"]'); await c('[data-act="begin"]'); await c('[data-act="verdict"][data-v="approve"]'); await shot('v07-incident');
  fs.writeFileSync(`${OUT}/boxes.json`, JSON.stringify(boxes, null, 1));
  console.log('errors:', JSON.stringify(errs)); await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
