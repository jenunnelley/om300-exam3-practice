/* OM 300 Exam 3 Practice Lab: runs entirely in the browser. Nothing is sent anywhere. */
"use strict";

// ------------------------------------------------------------------ settings you can change
const CONFIG = {
  LOCK_PARTS: false,        // true = students must finish (or test out of) a part before the next one opens
  JUMP_AHEAD: true,         // locked levels offer a one-shot "jump ahead" challenge problem
  TEST_OUT_STREAK: 2,       // first-try correct answers in a row needed to test out of a level
  MIN_LEVEL_SIZE: 3,        // levels smaller than this can't be tested out of
  STRUGGLE_FAILS: 3,        // wrong checks on one problem before the level turns off test-out
  STRUGGLE_HINTS: 2,        // hints on one problem before the level turns off test-out
  SHOW_SOLUTION_AFTER: 3,   // wrong checks before "Show me how" appears
  NO_TEST_OUT_PARTS: [8],   // exam-style cases: do every question
  DRILL_LENGTH: 8,          // questions per speed drill
  DRILL_SKIP_PENALTY: 15,   // seconds added for skipping a drill question
};
const STORE_KEY = "om300-exam3-v1";

// ------------------------------------------------------------------ state
let state = loadState();
let view = { screen: "welcome" };
const PARTS = [];
const BYID = {};

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.probs) { s.levels = s.levels || {}; s.drills = s.drills || {}; s.seeds = s.seeds || {}; return s; }
  } catch (e) { /* storage blocked: start fresh */ }
  return { name: "", probs: {}, levels: {}, drills: {}, seeds: {}, current: null };
}
function saveState() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
function ps(id) { return state.probs[id] || (state.probs[id] = { status: null, fails: 0, hints: 0 }); }
function ls(key) { return state.levels[key] || (state.levels[key] = { mastered: false, struggle: false, streak: 0 }); }
const levelKey = (p) => p.part + "|" + p.level;
const seedKey = (p) => p.caseKey || p.id;
function seedFor(p) {
  const k = seedKey(p);
  if (!state.seeds[k]) { state.seeds[k] = 1 + Math.floor(Math.random() * 1e9); saveState(); }
  return state.seeds[k];
}
function newSeed(p) { state.seeds[seedKey(p)] = 1 + Math.floor(Math.random() * 1e9); saveState(); }

// ------------------------------------------------------------------ structure
function buildParts() {
  for (const p of Bank.BANK) {
    BYID[p.id] = p;
    let part = PARTS.find((x) => x.num === p.part);
    if (!part) { part = { num: p.part, title: p.partTitle, blurb: p.partBlurb, levels: [] }; PARTS.push(part); }
    let lv = part.levels.find((l) => l.key === levelKey(p));
    if (!lv) { lv = { key: levelKey(p), name: p.level, part: p.part, ids: [] }; part.levels.push(lv); }
    lv.ids.push(p.id);
  }
}
const levelOf = (id) => { const p = BYID[id]; return partOf(p.part).levels.find((l) => l.key === levelKey(p)); };
const partOf = (num) => PARTS.find((x) => x.num === num);
const isDone = (id) => { const s = state.probs[id]; return !!(s && (s.status === "solved" || s.status === "shown")) || ls(levelOf(id).key).mastered; };
const levelComplete = (lv) => ls(lv.key).mastered || lv.ids.every(isDone);
const partComplete = (part) => part.levels.every(levelComplete);
function partUnlocked(part) {
  if (!CONFIG.LOCK_PARTS) return true;
  const i = PARTS.indexOf(part);
  return i === 0 || partComplete(PARTS[i - 1]) || part.levels.some((lv) => lv.ids.some((id) => state.probs[id] && state.probs[id].status));
}
function levelUnlocked(lv) {
  const part = partOf(lv.part);
  if (!partUnlocked(part)) return false;
  const i = part.levels.indexOf(lv);
  return i === 0 || ls(lv.key).unlocked || levelComplete(part.levels[i - 1]) || lv.ids.some((id) => state.probs[id] && (state.probs[id].status || state.probs[id].fails));
}
function canTestOut(lv) {
  const info = Bank.LEVEL_INFO[lv.key] || {};
  return !info.noTestOut && !CONFIG.NO_TEST_OUT_PARTS.includes(lv.part) && lv.ids.length >= CONFIG.MIN_LEVEL_SIZE;
}
const solvedCount = () => Object.values(state.probs).filter((x) => x.status === "solved").length;
function jumpCandidate(lv) {
  const lvs = ls(lv.key);
  if (lvs.jumpWaitUntil != null && solvedCount() <= lvs.jumpWaitUntil) return null;
  for (let k = lv.ids.length - 1; k >= 0; k--) {
    const s = state.probs[lv.ids[k]];
    if (!s || (!s.status && !s.jumpFailed && !s.fails && !s.hints)) return lv.ids[k];
  }
  return null;
}
function nextUndone(fromId) {
  const all = Bank.BANK.map((p) => p.id);
  const start = fromId ? all.indexOf(fromId) + 1 : 0;
  for (let k = 0; k < all.length; k++) {
    const id = all[(start + k) % all.length];
    if (!isDone(id) && levelUnlocked(levelOf(id))) return id;
  }
  return null;
}
function counts(ids) {
  let solved = 0, tested = 0, shown = 0;
  for (const id of ids) {
    const s = state.probs[id];
    if (s && s.status === "solved") solved++;
    else if (s && s.status === "shown") shown++;
    else if (ls(levelOf(id).key).mastered) tested++;
  }
  return { solved, tested, shown, total: ids.length };
}

// ------------------------------------------------------------------ dom helpers
const $ = (sel, el) => (el || document).querySelector(sel);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const k of Object.keys(attrs)) {
    const v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}
const fmt = (n, d) => Bank.fmt(n, d);

// ------------------------------------------------------------------ building a problem instance
function instance(p, seed) {
  const inst = p.build(Bank.rand(seed));
  if (inst.kind === "mc") {
    const r = Bank.rand(seed * 31 + 7);
    inst.choices = r.shuffle(inst.choices);
  }
  return inst;
}

// ------------------------------------------------------------------ answer checking
function parseNum(s) {
  if (s == null) return null;
  let t = String(s).trim().toLowerCase().replace(/[$,\s]/g, "").replace(/%$/, "");
  t = t.replace(/[a-z/.]+$/, (m) => (/^\.\d/.test(m) ? m : "")); // drop trailing words like "units"
  if (t === "" || t === "-" || t === ".") return null;
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return parseFloat(t);
}
// Accept the answer rounded to the requested decimals, or within 0.05% (small rounding differences in middle steps).
function tolFor(ans, dec) { return Math.max(0.51 * Math.pow(10, -dec), Math.abs(ans) * 0.0005); }
function checkNum(inst, raw) {
  const v = parseNum(raw);
  if (v === null) return { ok: false, kind: "warn", title: "Enter a number", msg: "Type just the number (you can include $ or commas)." };
  const a = inst.answer, dec = inst.dec;
  if (Math.abs(v - a) <= tolFor(a, dec)) return { ok: true };
  for (const m of inst.mistakes) {
    if (!isFinite(m[0]) || m[0] === -1) continue; // -1 marks a mistake that doesn't apply to this version
    if (Math.abs(m[0] - a) <= tolFor(a, dec)) continue; // a "mistake" that equals the answer isn't a mistake
    if (Math.abs(v - m[0]) <= Math.max(tolFor(m[0], dec), Math.abs(m[0]) * 0.002)) return { ok: false, kind: "bad", title: "Not quite", msg: m[1] };
  }
  if (Math.abs(v - a) <= Math.abs(a) * 0.01) return { ok: false, kind: "warn", title: "Very close", msg: "You're within 1%. Don't round in the middle steps: keep full numbers until the final answer, then round to " + dec + " decimal places." };
  if (a !== 0 && Math.abs(v * 100 - a) <= tolFor(a, dec) * 2) return { ok: false, kind: "warn", title: "Check the format", msg: "It looks like you entered a decimal. This answer should be written as a percent (for example, 12.5 instead of 0.125)." };
  if (a !== 0 && Math.abs(v - a * 100) <= Math.abs(a * 100) * 0.001) return { ok: false, kind: "warn", title: "Check the format", msg: "Off by a factor of 100. Check how you converted the percent." };
  return { ok: false, kind: "bad", title: "Not yet", msg: "That's not it. Re-read the story for the units (annual? per unit? per order?) or try a hint." };
}

// ------------------------------------------------------------------ sidebar
function renderSidebar() {
  const sb = $("#sidebar");
  sb.innerHTML = "";
  sb.append(
    h("button", { class: "drill-link" + (view.screen === "drills" || view.screen === "drill" ? " current" : ""), onclick: () => { closeMenu(); go({ screen: "drills" }); } }, h("span", { class: "bolt" }, "⚡"), "Speed Drills"),
    h("button", { class: "drill-link" + (view.screen === "cheat" ? " current" : ""), onclick: () => { closeMenu(); go({ screen: "cheat" }); } }, h("span", { class: "bolt" }, "📘"), "Variables & Formulas"),
  );
  const curId = view.screen === "problem" ? view.pid : null;
  for (const part of PARTS) {
    const all = part.levels.flatMap((l) => l.ids), c = counts(all), done = partComplete(part), open = partUnlocked(part);
    const collapsed = state["collapse" + part.num] != null ? state["collapse" + part.num] : !(curId && BYID[curId].part === part.num);
    const el = h("div", { class: "part" + (done ? " done" : "") + (open ? "" : " locked") + (collapsed ? " collapsed" : "") },
      h("button", { class: "part-head", onclick: () => { state["collapse" + part.num] = !collapsed; saveState(); renderSidebar(); } },
        h("span", { class: "num" }, done ? "✓" : part.num), h("span", null, part.title), h("span", { class: "meta" }, `${c.solved + c.tested + c.shown}/${c.total}`)));
    const lvWrap = h("div", { class: "levels" });
    for (const lv of part.levels) {
      const unlocked = levelUnlocked(lv), lvs = ls(lv.key), jc = !unlocked && CONFIG.JUMP_AHEAD && partUnlocked(part) ? jumpCandidate(lv) : null;
      const lc = counts(lv.ids);
      let badge = `${lc.solved + lc.tested + lc.shown}/${lc.total}`, bcls = "badge";
      if (lvs.mastered) { badge = "tested out"; bcls += " mastered"; }
      else if (levelComplete(lv)) { badge = "done"; bcls += " done"; }
      else if (!unlocked) { badge = jc ? "🔒 jump" : "🔒"; bcls += " jump"; }
      const dots = h("div", { class: "dots" }, lv.ids.map((id) => {
        const s = state.probs[id];
        const cls = id === curId ? "cur" : s && s.status === "solved" ? "ok" : s && s.status === "shown" ? "skip" : lvs.mastered ? "tested" : "";
        return h("i", { class: cls });
      }));
      lvWrap.append(h("button", {
        class: "level" + (curId && lv.ids.includes(curId) ? " current" : ""), disabled: !unlocked && !jc,
        onclick: () => { closeMenu(); if (unlocked) go({ screen: "problem", pid: firstOpen(lv) }); else if (jc) go({ screen: "problem", pid: jc, jump: true }); },
      }, h("span", { class: "lname" }, h("span", null, lv.name), h("span", { class: bcls }, badge)), dots));
    }
    el.append(lvWrap);
    sb.append(el);
  }
}
function firstOpen(lv) { return lv.ids.find((id) => !isDone(id)) || lv.ids[0]; }

function renderTop() {
  const total = Bank.BANK.length, done = Bank.BANK.filter((p) => isDone(p.id)).length;
  $("#topProgress").innerHTML = "";
  $("#topProgress").append(h("div", { class: "bar" }, h("span", { style: `width:${(100 * done) / total}%` })), h("span", null, `${done} of ${total} done`));
}

// ------------------------------------------------------------------ navigation
function go(v) {
  view = Object.assign({ hintsShown: 0, feedback: null, solved: false, shown: false, input: "", picked: null }, v);
  if (v.screen === "problem") { state.current = v.pid; saveState(); }
  render();
  window.scrollTo(0, 0);
}
function render() {
  renderTop();
  renderSidebar();
  const main = $("#main");
  main.innerHTML = "";
  if (view.screen === "welcome") main.append(renderWelcome());
  else if (view.screen === "problem") main.append(renderProblem());
  else if (view.screen === "drills") main.append(renderDrills());
  else if (view.screen === "drill") main.append(renderDrill());
  else if (view.screen === "cheat") main.append(renderCheat());
  const inp = $("#answerInput");
  if (inp && !view.solved) inp.focus();
}
function closeMenu() { document.body.classList.remove("menu-open"); }

// ------------------------------------------------------------------ welcome
function renderWelcome() {
  const resume = state.current && BYID[state.current] ? state.current : nextUndone(null);
  return h("div", { class: "welcome" },
    h("div", { class: "hero" }, h("div", { class: "hero-mark" }, "Q*"), h("div", null, h("h1", null, "Exam 3 Practice Lab"), h("p", { class: "lead" }, "Supply chains, inventory, and lean (Chapters 11, 12, and 16)"))),
    h("p", null, "Practice the kind of thinking Exam 3 asks for: pull the right numbers out of a story, pick the right formula, and know the concepts cold. Every problem has made-up numbers, and ", h("b", null, "New numbers"), " gives you a fresh version as many times as you want."),
    h("div", { class: "actions" },
      h("button", { class: "btn big", onclick: () => go({ screen: "problem", pid: resume || Bank.BANK[0].id }) }, state.current ? "Keep going →" : "Start practicing →"),
      h("button", { class: "btn ghost big", onclick: () => go({ screen: "problem", pid: partOf(1).levels[0].ids[0] }) }, "Start with Know Your Variables"),
      h("button", { class: "btn ghost big", onclick: () => go({ screen: "drills" }) }, "⚡ Speed Drills")),
    h("div", { class: "how" },
      h("div", null, h("h3", null, "What's inside"), h("ul", null, PARTS.map((p) => h("li", null, h("b", null, p.title), ": ", p.blurb)))),
      h("div", null, h("h3", null, "How it works"), h("ul", null,
        h("li", null, "Type a number (or pick an answer) and press ", h("kbd", null, "Enter"), " to check."),
        h("li", null, "Wrong answers get specific feedback, like \"that's monthly demand, D is annual.\""),
        h("li", null, h("b", null, "Hints"), " point the way. After you solve it, you'll see the worked solution."),
        h("li", null, h("b", null, "Test out:"), " get the first two in a level right on the first try with no hints, and you can skip the rest."),
        h("li", null, "Stuck after a few tries? ", h("b", null, "Show me how"), " walks through it."),
        h("li", null, "Your progress saves in this browser. Nothing is sent anywhere.")))),
    h("p", { class: "muted small" }, "Just for practice: not graded, and it won't count toward or against your grade. If something here looks different from class, follow the class materials and the formula sheet."),
  );
}

// ------------------------------------------------------------------ variables & formulas page
function renderCheat() {
  const F = [
    ["Percent invested in inventory", "Average inventory ÷ Total assets × 100"],
    ["Inventory turnover", "COGS ÷ Average inventory"],
    ["Weeks of supply", "Average inventory ÷ (Annual COGS ÷ 52)"],
    ["Holding cost from a %", "H = I × P"],
    ["Daily demand", "d = D ÷ working days per year"],
    ["Reorder point", "ROP = d × L (+ ss if there's safety stock)"],
    ["EOQ", "Q* = √(2DS ÷ H)"],
    ["Number of orders", "N = D ÷ Q"],
    ["Time between orders", "T = working days per year ÷ N"],
    ["Annual setup (ordering) cost", "(D ÷ Q) × S"],
    ["Annual holding cost (EOQ)", "(Q ÷ 2) × H"],
    ["Total annual cost", "Setup cost + Holding cost (+ P × D if product cost is included)"],
    ["EPQ", "Q*p = √(2DS ÷ [H(1 − d/p)])"],
    ["Maximum inventory (EPQ)", "Q(1 − d/p)  =  pt − dt"],
    ["Average inventory (EPQ)", "Maximum inventory ÷ 2"],
    ["Annual holding cost (EPQ)", "H × (Q ÷ 2) × (1 − d/p)"],
    ["Length of a production run", "t = Q ÷ p"],
  ];
  return h("div", { class: "cheat" },
    h("h1", null, "Variables & Formulas"),
    h("p", { class: "muted" }, "Same formulas as the Exam 3 formula sheet. On the exam you'll get the formula sheet, so the real skill is knowing which number in the story is which variable."),
    h("h2", null, "The variables"),
    h("table", { class: "data wide" }, h("tr", null, h("th", null, "Letter"), h("th", null, "Means"), h("th", null, "Watch out for")),
      Bank.VAR_CARD.map((v) => h("tr", null, h("td", null, h("b", { class: "var" }, v[0])), h("td", null, v[1]), h("td", null, v[2])))),
    h("h2", null, "The formulas"),
    h("table", { class: "data wide" }, F.map((f) => h("tr", null, h("td", null, f[0]), h("td", null, h("code", null, f[1]))))),
    h("h2", null, "Five traps to check every time"),
    h("ol", null,
      h("li", null, h("b", null, "Is D annual?"), " Monthly × 12, weekly × weeks open, quarterly × 4, daily × days open."),
      h("li", null, h("b", null, "Is H in dollars per unit per year?"), " A percent means H = I × P. Monthly cost × 12. Per case or per bag ÷ units in it."),
      h("li", null, h("b", null, "Is S per order?"), " Add every per-order fee. Per-unit charges are not S."),
      h("li", null, h("b", null, "Buying or making?"), " Buying, with the whole order arriving at once: EOQ. Making while selling: EPQ."),
      h("li", null, h("b", null, "What's extra?"), " Lead time isn't in Q*. Selling price isn't in H. Revenue isn't in turnover.")),
  );
}

// ------------------------------------------------------------------ problem screen
function renderProblem() {
  const p = BYID[view.pid], lv = levelOf(p.id), part = partOf(p.part), idx = lv.ids.indexOf(p.id);
  const seed = seedFor(p), inst = instance(p, seed), st = ps(p.id), info = Bank.LEVEL_INFO[lv.key] || {};
  view.inst = inst;
  const wrap = h("div", { class: "problem" });
  wrap.append(h("div", { class: "crumbs" }, `Part ${part.num}: ${part.title}  ›  ${lv.name}`));
  if (view.jump) wrap.append(h("div", { class: "banner jump" }, h("b", null, "Jump-ahead challenge. "), "Get this one right on your first check and this level opens up. You get one check, so take your time."));
  if (ls(lv.key).mastered && st.status !== "solved") wrap.append(h("div", { class: "banner info" }, "You tested out of this level. Practice is still welcome."));
  wrap.append(h("h2", { class: "ptitle" }, `${lv.name}: ${idx + 1} of ${lv.ids.length}`, st.status === "solved" ? h("span", { class: "chip ok" }, "✓ solved") : null));
  if (info.intro && idx === 0) wrap.append(h("details", { class: "intro", open: !st.status }, h("summary", null, "About this level"), h("div", { class: "intro-body", html: info.intro })));
  if (p.part === 1) wrap.append(varCardDetails());
  if (inst.story) wrap.append(h("div", { class: "story", html: inst.story }));
  wrap.append(h("div", { class: "prompt", html: inst.ask }));

  const fb = h("div", { class: "feedback" });
  const showFb = (f) => {
    fb.className = "feedback " + (f ? f.kind : "");
    fb.innerHTML = "";
    if (f) { fb.append(h("div", { class: "fb-title" }, f.title)); if (f.msg) fb.append(h("div", { class: "fb-msg", html: f.msg })); }
  };

  const onCheck = () => {
    if (view.solved) return;
    let res;
    if (inst.kind === "num") {
      view.input = $("#answerInput").value;
      res = checkNum(inst, view.input);
      if (res.kind === "warn" && res.title === "Enter a number") { showFb(res); return; }
    } else {
      if (view.picked == null) { showFb({ kind: "warn", title: "Pick an answer first" }); return; }
      const ch = inst.choices[view.picked];
      res = ch.ok ? { ok: true } : { ok: false, kind: "bad", title: "Not quite", msg: ch.note || "Try again. Re-read the question carefully." };
    }
    record(p, lv, res.ok);
    if (res.ok) { view.solved = true; view.feedback = { kind: "good", title: pickPraise(), msg: null }; }
    else view.feedback = res;
    render();
  };

  if (inst.kind === "num") {
    const unit = inst.unit || "";
    const dollar = unit === "$";
    const inp = h("input", { id: "answerInput", class: "answer-input", type: "text", inputmode: "decimal", autocomplete: "off", spellcheck: "false", "aria-label": "Your answer", value: view.input || "", disabled: view.solved || (view.jump && st.jumpFailed) });
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); onCheck(); } });
    inp.addEventListener("input", () => { view.input = inp.value; });
    wrap.append(h("div", { class: "answer-row" }, dollar ? h("span", { class: "affix" }, "$") : null, inp, !dollar && unit ? h("span", { class: "affix unit" }, unit) : null));
  } else {
    const list = h("div", { class: "choices", role: "radiogroup" });
    inst.choices.forEach((ch, i) => {
      const cls = "choice" + (view.picked === i ? " picked" : "") + (view.solved && ch.ok ? " right" : "") + (view.tried && view.tried.includes(i) && !ch.ok ? " wrong" : "");
      list.append(h("button", { class: cls, role: "radio", "aria-checked": view.picked === i ? "true" : "false", disabled: view.solved, onclick: () => { view.picked = i; render(); }, ondblclick: () => { view.picked = i; onCheck(); } }, h("span", { class: "letter" }, "ABCDEF"[i]), h("span", { class: "ctext", html: ch.t })));
    });
    wrap.append(list);
  }

  const acts = h("div", { class: "actions" });
  if (!view.solved) {
    acts.append(h("button", { class: "btn", onclick: onCheck, disabled: view.jump && st.jumpFailed }, "Check answer"));
    if (!view.jump && inst.hints && view.hintsShown < (inst.hints || []).length) acts.append(h("button", { class: "btn ghost", onclick: () => { view.hintsShown++; st.hints = Math.max(st.hints, view.hintsShown); if (st.hints >= CONFIG.STRUGGLE_HINTS) ls(lv.key).struggle = true; ls(lv.key).streak = 0; saveState(); render(); } }, `Hint (${view.hintsShown}/${inst.hints.length})`));
    if (!view.jump && inst.kind === "num" && st.fails >= CONFIG.SHOW_SOLUTION_AFTER) acts.append(h("button", { class: "btn ghost", onclick: () => { view.shown = true; view.solved = true; if (st.status !== "solved") st.status = "shown"; ls(lv.key).streak = 0; saveState(); render(); } }, "Show me how"));
  } else {
    const nxt = nextInLevelOrNext(p.id);
    if (nxt) acts.append(h("button", { class: "btn", onclick: () => go({ screen: "problem", pid: nxt }) }, "Next →"));
  }
  if (!view.jump) acts.append(h("span", { class: "spacer" }), h("button", { class: "btn ghost subtle small", title: "Same question, different numbers", onclick: () => { newSeed(p); go({ screen: "problem", pid: p.id }); } }, "↻ New numbers"));
  if (view.jump) acts.append(h("span", { class: "spacer" }), h("button", { class: "btn ghost subtle small", onclick: () => go({ screen: "problem", pid: firstOpen(firstUnlockedLevel(part)) }) }, "Back to where I was"));
  wrap.append(acts);

  if (view.feedback) showFb(view.feedback);
  wrap.append(fb);

  if (view.hintsShown && !view.solved) wrap.append(h("div", { class: "hints" }, inst.hints.slice(0, view.hintsShown).map((t, i) => h("div", { class: "hint", html: `<b>Hint ${i + 1}.</b> ${t}` }))));

  if (view.solved) {
    if (inst.kind === "num") {
      const ans = (inst.unit === "$" ? "$" : "") + fmt(inst.answer, inst.dec) + (inst.unit && inst.unit !== "$" ? " " + inst.unit : "");
      wrap.append(h("div", { class: "solution" + (view.shown ? " shown" : "") }, h("div", { class: "sol-label" }, view.shown ? "Here's how it works" : "Worked solution"), h("div", { class: "sol-answer" }, "Answer: ", h("b", null, ans)), h("ol", { class: "sol-steps" }, inst.steps.map((s) => h("li", { html: s })))));
      if (view.shown) wrap.append(h("p", { class: "muted small" }, "Try ↻ New numbers to do one on your own."));
    } else if (inst.why) {
      wrap.append(h("div", { class: "solution" }, h("div", { class: "sol-label" }, "Why"), h("div", { html: inst.why })));
    }
    if (view.levelMsg) wrap.append(h("div", { class: "banner info" }, view.levelMsg));
  }
  if (view.jumpMsg) wrap.append(h("div", { class: "banner " + (view.jumpOk ? "info" : "jump") }, view.jumpMsg));
  return wrap;
}
function varCardDetails() {
  return h("details", { class: "intro varcard" }, h("summary", null, "📘 Variable cheat card"),
    h("div", { class: "intro-body" }, h("table", { class: "data" }, Bank.VAR_CARD.map((v) => h("tr", null, h("td", null, h("b", { class: "var" }, v[0])), h("td", null, h("b", null, v[1]), " — ", v[2]))))));
}
function firstUnlockedLevel(part) { return part.levels.filter(levelUnlocked).pop() || part.levels[0]; }
function nextInLevelOrNext(id) {
  const lv = levelOf(id);
  const rest = lv.ids.slice(lv.ids.indexOf(id) + 1).find((x) => !isDone(x));
  return rest || nextUndone(id);
}
const PRAISE = ["Correct!", "Nice work!", "That's it!", "Nailed it.", "Right on.", "Yes!"];
function pickPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

function record(p, lv, ok) {
  const st = ps(p.id), lvs = ls(lv.key);
  if (view.jump) {
    if (ok) { st.status = "solved"; lvs.unlocked = true; view.jumpOk = true; view.jumpMsg = "You got it. This level is open now."; view.jump = false; }
    else { st.jumpFailed = true; lvs.jumpWaitUntil = solvedCount() + 3; view.jumpOk = false; view.jumpMsg = "Not this time. Keep working through the earlier levels; you can try a jump again after solving 3 more problems."; }
    saveState();
    return;
  }
  if (ok) {
    const first = !st.fails && !view.hintsShown && !st.hints && st.status !== "solved" && st.status !== "shown";
    st.status = "solved";
    if (first && !lvs.struggle) lvs.streak = (lvs.streak || 0) + 1; else lvs.streak = 0;
    const idx = lv.ids.indexOf(p.id);
    if (canTestOut(lv) && !lvs.mastered && !lvs.struggle && lvs.streak >= CONFIG.TEST_OUT_STREAK && idx < CONFIG.TEST_OUT_STREAK + 1) {
      lvs.mastered = true;
      view.levelMsg = "🎉 You tested out of this level! Two right on the first try with no hints. Next will take you to the next level, or keep practicing here if you like.";
    } else if (lv.ids.every(isDone)) view.levelMsg = "Level complete!";
  } else {
    st.fails++;
    lvs.streak = 0;
    if (view.picked != null) { view.tried = view.tried || []; view.tried.push(view.picked); }
    if (st.fails >= CONFIG.STRUGGLE_FAILS) lvs.struggle = true;
  }
  saveState();
}

// ------------------------------------------------------------------ speed drills
const DRILLS = [
  { key: "vars", name: "Know Your Variables", desc: "Find D, H, S, d, p, L, and Q in convoluted stories.", f: (p) => p.part === 1 },
  { key: "eoq", name: "EOQ & Reorder Point", desc: "Q*, N, T, costs, and the ROP.", f: (p) => p.part === 5 },
  { key: "epq", name: "EPQ", desc: "Q*p, max and average inventory, runs, costs.", f: (p) => p.part === 6 },
  { key: "scm", name: "Supply Chain Math", desc: "% invested, turnover, weeks of supply, ABC, cycle counting.", f: (p) => p.part === 3 || (p.part === 4 && /ABC|Cycle/.test(p.level)) },
  { key: "concepts", name: "Concepts", desc: "Ch. 11, 12, and 16 multiple choice.", f: (p, i) => i.kind === "mc" && p.part !== 1 },
  { key: "mixed", name: "Mixed Bag", desc: "Anything from the whole lab.", f: (p) => p.part !== 8 },
];
function renderDrills() {
  return h("div", { class: "drills" },
    h("h1", null, "⚡ Speed Drills"),
    h("p", { class: "muted" }, `${CONFIG.DRILL_LENGTH} questions against the clock, with new numbers every time. A wrong answer just means try again. Skipping adds ${CONFIG.DRILL_SKIP_PENALTY} seconds. The exam gives you 65 minutes for 27 questions, so speed matters.`),
    h("div", { class: "drill-grid" }, DRILLS.map((d) => {
      const best = state.drills[d.key];
      return h("button", { class: "drill-card", onclick: () => startDrill(d) }, h("div", { class: "dc-name" }, d.name), h("div", { class: "dc-desc" }, d.desc), h("div", { class: "dc-best" }, best ? `Best: ${clock(best)}` : "No best yet"));
    })));
}
function startDrill(d) {
  const pool = [];
  for (const p of Bank.BANK) {
    if (p.caseKey) continue;
    const probe = instance(p, 12345);
    if (d.f(p, probe)) pool.push(p);
  }
  const picks = [];
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  for (let i = 0; i < CONFIG.DRILL_LENGTH; i++) picks.push(shuffled[i % shuffled.length]);
  const items = picks.map((p) => ({ p, seed: 1 + Math.floor(Math.random() * 1e9), status: null }));
  view = { screen: "drill", drill: d, items, i: 0, start: Date.now(), penalty: 0, done: false, input: "", picked: null, feedback: null };
  render();
  clearInterval(window._tick);
  window._tick = setInterval(() => { const t = $("#drillTimer"); if (t && view.screen === "drill" && !view.done) t.textContent = clock(elapsed()); }, 200);
}
const elapsed = () => (Date.now() - view.start) / 1000 + view.penalty;
function clock(s) { const m = Math.floor(s / 60), sec = s - m * 60; return `${m}:${sec < 10 ? "0" : ""}${sec.toFixed(1)}`; }
function renderDrill() {
  const d = view.drill;
  if (view.done) {
    const t = view.final, best = state.drills[d.key], isBest = !best || t < best;
    if (isBest) { state.drills[d.key] = t; saveState(); }
    return h("div", { class: "drills" },
      h("h1", null, d.name, " drill"), h("div", { class: "big-time" }, clock(t)),
      h("p", null, isBest ? "🏆 New personal best!" : `Your best is ${clock(best)}.`),
      h("table", { class: "drill-table" }, view.items.map((it, k) => h("tr", null, h("td", null, k + 1), h("td", null, it.p.level), h("td", null, it.status === "ok" ? "✓" : "skipped")))),
      h("div", { class: "actions" }, h("button", { class: "btn", onclick: () => startDrill(d) }, "Go again"), h("button", { class: "btn ghost", onclick: () => go({ screen: "drills" }) }, "All drills")));
  }
  const it = view.items[view.i], inst = instance(it.p, it.seed);
  const wrap = h("div", { class: "drills problem" });
  wrap.append(h("div", { class: "drill-head" }, h("span", { class: "drill-prog" }, `${view.i + 1} / ${view.items.length}`),
    h("span", { class: "drill-dots" }, view.items.map((x, k) => h("i", { class: k === view.i ? "cur" : x.status === "ok" ? "ok" : x.status === "skip" ? "skip" : "" }))),
    h("span", { class: "timer", id: "drillTimer" }, clock(elapsed()))));
  wrap.append(h("div", { class: "drill-topic" }, partOf(it.p.part).title + " › " + it.p.level));
  if (inst.story) wrap.append(h("div", { class: "story", html: inst.story }));
  wrap.append(h("div", { class: "prompt", html: inst.ask }));
  const advance = (status) => {
    it.status = status;
    if (status === "skip") view.penalty += CONFIG.DRILL_SKIP_PENALTY;
    view.i++; view.input = ""; view.picked = null; view.feedback = null;
    if (view.i >= view.items.length) { view.done = true; view.final = elapsed(); }
    render();
  };
  const check = () => {
    let ok;
    if (inst.kind === "num") { view.input = $("#answerInput").value; const res = checkNum(inst, view.input); ok = res.ok; if (!ok) view.feedback = res; }
    else { if (view.picked == null) return; const ch = inst.choices[view.picked]; ok = ch.ok; if (!ok) view.feedback = { kind: "bad", title: "Not quite", msg: ch.note || "Try again." }; }
    if (ok) advance("ok"); else render();
  };
  if (inst.kind === "num") {
    const dollar = inst.unit === "$";
    const inp = h("input", { id: "answerInput", class: "answer-input", type: "text", inputmode: "decimal", autocomplete: "off", value: view.input || "" });
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } });
    wrap.append(h("div", { class: "answer-row" }, dollar ? h("span", { class: "affix" }, "$") : null, inp, !dollar && inst.unit ? h("span", { class: "affix unit" }, inst.unit) : null));
  } else {
    wrap.append(h("div", { class: "choices" }, inst.choices.map((ch, i) => h("button", { class: "choice" + (view.picked === i ? " picked" : ""), onclick: () => { view.picked = i; check(); } }, h("span", { class: "letter" }, "ABCDEF"[i]), h("span", { class: "ctext", html: ch.t })))));
  }
  wrap.append(h("div", { class: "actions" }, inst.kind === "num" ? h("button", { class: "btn", onclick: check }, "Check") : null, h("span", { class: "spacer" }), h("button", { class: "btn ghost small", onclick: () => advance("skip") }, `Skip (+${CONFIG.DRILL_SKIP_PENALTY}s)`), h("button", { class: "btn ghost subtle small", onclick: () => { clearInterval(window._tick); go({ screen: "drills" }); } }, "Quit")));
  if (view.feedback) wrap.append(h("div", { class: "feedback " + view.feedback.kind }, h("div", { class: "fb-title" }, view.feedback.title), view.feedback.msg ? h("div", { class: "fb-msg", html: view.feedback.msg }) : null));
  return wrap;
}

// ------------------------------------------------------------------ progress report
function reportText() {
  const lines = [];
  lines.push("OM 300 Exam 3 Practice Lab: progress report");
  lines.push("Name: " + (state.name || "(not entered)"));
  lines.push("Date: " + new Date().toLocaleString());
  const total = Bank.BANK.length, done = Bank.BANK.filter((p) => isDone(p.id)).length;
  lines.push(`Overall: ${done} of ${total} problems done`);
  lines.push("");
  for (const part of PARTS) {
    const c = counts(part.levels.flatMap((l) => l.ids));
    lines.push(`Part ${part.num}. ${part.title}: ${c.solved} solved, ${c.tested} tested out, ${c.shown} walked through (of ${c.total})`);
    for (const lv of part.levels) {
      const lc = counts(lv.ids);
      lines.push(`   ${lv.name}: ${ls(lv.key).mastered ? "tested out" : `${lc.solved}/${lc.total} solved`}`);
    }
  }
  const bests = DRILLS.filter((d) => state.drills[d.key]);
  if (bests.length) { lines.push(""); lines.push("Speed drill bests:"); bests.forEach((d) => lines.push(`   ${d.name}: ${clock(state.drills[d.key])}`)); }
  return lines.join("\n");
}
function openReport() {
  $("#studentName").value = state.name || "";
  $("#reportBody").innerHTML = "";
  $("#reportBody").append(h("pre", { class: "report" }, reportText()));
  $("#reportDialog").showModal();
}

// ------------------------------------------------------------------ boot
function boot() {
  buildParts();
  $("#homeBtn").addEventListener("click", () => go({ screen: "welcome" }));
  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("menu-open"));
  $("#reportBtn").addEventListener("click", openReport);
  $("#studentName").addEventListener("input", (e) => { state.name = e.target.value; saveState(); $("#reportBody").innerHTML = ""; $("#reportBody").append(h("pre", { class: "report" }, reportText())); });
  $("#copyReportBtn").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(reportText()); $("#copyReportBtn").textContent = "Copied!"; } catch (e) { $("#copyReportBtn").textContent = "Select and copy the text"; }
    setTimeout(() => ($("#copyReportBtn").textContent = "Copy report"), 1800);
  });
  $("#resetBtn").addEventListener("click", () => {
    if (confirm("Erase all your progress in this browser and start over?")) { state = { name: state.name, probs: {}, levels: {}, drills: {}, seeds: {}, current: null }; saveState(); $("#reportDialog").close(); go({ screen: "welcome" }); }
  });
  document.addEventListener("keydown", (e) => {
    if (view.screen !== "problem" || !view.inst || view.inst.kind !== "mc" || view.solved) return;
    if (e.target && e.target.tagName === "INPUT") return;
    const k = "abcdef".indexOf(e.key.toLowerCase());
    if (k >= 0 && k < view.inst.choices.length) { view.picked = k; render(); }
    if (e.key === "Enter" && view.picked != null) { const btn = [...document.querySelectorAll(".actions .btn")].find((b) => b.textContent === "Check answer"); if (btn) btn.click(); }
  });
  go({ screen: "welcome" });
}
boot();
