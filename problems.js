/* OM 300 Exam 3 Practice Lab: problem bank.
   Every problem is a template. build(r) gets a seeded random generator and returns the story,
   the question, and the right answer, so "New numbers" gives a fresh version every time.
   All businesses, people, and numbers are made up for practice. */
(function (root) {
"use strict";

// ================================================================== random helpers
function rand(seed) {
  let a = (seed >>> 0) || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
    sample: (arr, n) => r.shuffle(arr).slice(0, n),
    money: (lo, hi) => Math.round((lo + next() * (hi - lo)) * 100) / 100,
    chance: (p) => next() < p,
    step: (lo, hi, st) => { const a0 = Math.ceil(lo / st), b0 = Math.floor(hi / st); return st * (a0 + Math.floor(next() * (b0 - a0 + 1))); },
  };
  return r;
}

// ================================================================== formatting
function fmt(n, d) { d = d === undefined ? 2 : d; return Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }
const n0 = (n) => fmt(n, 0);
const n2 = (n) => fmt(n, 2);
const isWhole = (n) => Math.abs(n - Math.round(n)) < 1e-9;
const nn = (n) => (isWhole(n) ? n0(n) : n2(n));            // whole numbers without .00
const usd = (n) => "$" + (isWhole(n) ? n0(n) : fmt(n, 2));
const usd2 = (n) => "$" + fmt(n, 2);
const usd4 = (n) => "$" + fmt(n, 4);
const r2 = (x) => Math.round(x * 100) / 100;
const R2 = "Round your answer to 2 decimal places.";
const R4 = "Round your answer to 4 decimal places.";
const plural = (k, one, many) => (k === 1 ? one : many);

// ================================================================== inventory math
const eoq = (D, S, H) => Math.sqrt((2 * D * S) / H);
const epq = (D, S, H, d, p) => Math.sqrt((2 * D * S) / (H * (1 - d / p)));
function nice(x) {
  if (x <= 0) return 1;
  const m = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1));
  return Math.max(m, Math.round(x / m) * m);
}

// ================================================================== made-up people and businesses
const FIRST = ["Maya", "Andre", "Priya", "Marcus", "Elena", "Darius", "Tessa", "Omar", "Quinn", "Rosa", "Malik", "Harper", "Jonah", "Keisha", "Wes", "Nina", "Grant", "Lucia", "Reggie", "Sloane", "Dev", "Carmen", "Beau", "Imani", "Felix", "June", "Tariq", "Allie", "Mateo", "Celeste"];

// Businesses that BUY what they stock (EOQ). M = monthly demand range [lo, hi, step], P = unit price, S = order cost.
const BUY = [
  { name: "Grind & Gather Coffee", role: "store manager", item: "12-oz paper cups", unit: "cup", units: "cups", M: [5000, 15000, 250], P: [0.06, 0.18], S: [18, 60], resell: false },
  { name: "Paws Up Veterinary Clinic", role: "practice manager", item: "doses of flea medicine", unit: "dose", units: "doses", M: [150, 750, 10], P: [6, 14], S: [30, 90], resell: true },
  { name: "Spokes & Pedals Bike Shop", role: "owner", item: "inner tubes", unit: "tube", units: "tubes", M: [120, 500, 10], P: [3.5, 9], S: [20, 60], resell: true },
  { name: "Riverside Inn", role: "housekeeping manager", item: "mini shampoo bottles", unit: "bottle", units: "bottles", M: [1500, 7500, 100], P: [0.3, 0.9], S: [25, 80], resell: false },
  { name: "Northside Urgent Care", role: "supply coordinator", item: "boxes of exam gloves", unit: "box", units: "boxes", M: [200, 1000, 10], P: [5, 12], S: [35, 110], resell: false },
  { name: "Crimson Corner Books", role: "buyer", item: "spiral notebooks", unit: "notebook", units: "notebooks", M: [300, 1700, 25], P: [1.5, 4], S: [20, 70], resell: true },
  { name: "Lakeside Tire & Lube", role: "service manager", item: "oil filters", unit: "filter", units: "filters", M: [200, 850, 10], P: [3, 8], S: [25, 75], resell: true },
  { name: "Happy Tails Pet Supply", role: "store manager", item: "bags of cat litter", unit: "bag", units: "bags", M: [150, 700, 10], P: [6, 13], S: [30, 90], resell: true },
  { name: "Smokestack BBQ", role: "kitchen manager", item: "to-go containers", unit: "container", units: "containers", M: [2000, 7500, 100], P: [0.15, 0.45], S: [20, 55], resell: false },
  { name: "Ironworks Gym", role: "operations manager", item: "bottles of disinfectant spray", unit: "bottle", units: "bottles", M: [100, 420, 5], P: [3, 7], S: [15, 50], resell: false },
  { name: "Bright Smile Dental", role: "office manager", item: "take-home toothbrush kits", unit: "kit", units: "kits", M: [400, 1500, 25], P: [0.6, 1.6], S: [20, 60], resell: false },
  { name: "Petal & Stem Florist", role: "owner", item: "glass vases", unit: "vase", units: "vases", M: [250, 1000, 10], P: [1.5, 4.5], S: [25, 70], resell: true },
  { name: "Fairway Golf Shop", role: "buyer", item: "sleeves of golf balls", unit: "sleeve", units: "sleeves", M: [150, 700, 10], P: [6, 14], S: [30, 90], resell: true },
  { name: "Rise & Shine Bakery", role: "manager", item: "pastry boxes", unit: "box", units: "boxes", M: [1200, 5000, 100], P: [0.25, 0.8], S: [20, 60], resell: false },
];

// Businesses that MAKE what they sell (EPQ). d = daily demand range [lo, hi, step], P = cost to make one, S = setup cost.
const MAKE = [
  { name: "Black Warrior Candle Co.", role: "production manager", item: "soy candles", unit: "candle", units: "candles", d: [80, 400, 5], P: [4, 12], S: [60, 250] },
  { name: "Cotton State Apparel", role: "plant manager", item: "t-shirts", unit: "shirt", units: "shirts", d: [300, 1500, 25], P: [3, 8], S: [100, 400] },
  { name: "Magic City Brewing", role: "brewmaster", item: "cases of lager", unit: "case", units: "cases", d: [150, 700, 10], P: [8, 18], S: [300, 1200] },
  { name: "Gulf Coast Hot Sauce Co.", role: "operations manager", item: "bottles of hot sauce", unit: "bottle", units: "bottles", d: [500, 2500, 25], P: [1.2, 3.5], S: [80, 300] },
  { name: "Southern Pine Pallets", role: "plant supervisor", item: "wooden pallets", unit: "pallet", units: "pallets", d: [200, 900, 10], P: [6, 14], S: [150, 500] },
  { name: "Cahaba Soap Works", role: "owner", item: "bars of soap", unit: "bar", units: "bars", d: [400, 2000, 25], P: [0.8, 2.5], S: [40, 150] },
  { name: "Iron Bowl Bat Co.", role: "production lead", item: "wooden baseball bats", unit: "bat", units: "bats", d: [40, 200, 5], P: [15, 40], S: [200, 600] },
  { name: "Mountain Brook Pet Treats", role: "production manager", item: "bags of dog treats", unit: "bag", units: "bags", d: [300, 1400, 25], P: [2, 6], S: [60, 250] },
  { name: "Tuscaloosa Tile Works", role: "plant manager", item: "boxes of floor tile", unit: "box", units: "boxes", d: [100, 500, 10], P: [10, 25], S: [200, 700] },
  { name: "Sweet Home Salsa", role: "kitchen manager", item: "jars of salsa", unit: "jar", units: "jars", d: [400, 1800, 25], P: [1.5, 4], S: [50, 200] },
  { name: "Northport Furniture", role: "shop foreman", item: "dining chairs", unit: "chair", units: "chairs", d: [20, 90, 2], P: [25, 60], S: [150, 500] },
  { name: "Delta Cold Brew", role: "production manager", item: "cans of cold brew", unit: "can", units: "cans", d: [1500, 6000, 50], P: [0.6, 1.5], S: [100, 350] },
];

// Service jobs that use up supplies (for "find D" stories)
const JOBS = [
  { name: "Sparkle Auto Spa", job: "deluxe wash", jobs: "deluxe washes", unit: "towel", units: "microfiber towels", k: [3, 5], j: [20, 60] },
  { name: "Lakeside Tire & Lube", job: "oil change", jobs: "oil changes", unit: "quart", units: "quarts of motor oil", k: [4, 6], j: [15, 45] },
  { name: "Bright Smile Dental", job: "cleaning", jobs: "cleanings", unit: "pair", units: "pairs of gloves", k: [2, 4], j: [18, 40] },
  { name: "Shear Genius Salon", job: "color appointment", jobs: "color appointments", unit: "foil sheet", units: "foil sheets", k: [30, 60], j: [6, 15] },
  { name: "Riverside Inn", job: "room cleaning", jobs: "room cleanings", unit: "bottle", units: "mini shampoo bottles", k: [2, 3], j: [40, 120] },
  { name: "Hillcrest Physical Therapy", job: "therapy session", jobs: "therapy sessions", unit: "pack", units: "single-use cold packs", k: [1, 2], j: [25, 70] },
];

// Customer-based demand (for "% of customers" stories)
const CUSTS = [
  { name: "Hillcrest Physical Therapy", who: "patients", buy: "leave with a resistance band", unit: "band", units: "resistance bands" },
  { name: "Paws Up Veterinary Clinic", who: "pet visits", buy: "end with a dose of flea medicine", unit: "dose", units: "doses" },
  { name: "Spokes & Pedals Bike Shop", who: "repair customers", buy: "need a new inner tube", unit: "tube", units: "inner tubes" },
  { name: "Grind & Gather Coffee", who: "customers", buy: "add a pastry bag to their order", unit: "bag", units: "pastry bags" },
  { name: "Lakeside Tire & Lube", who: "drivers", buy: "need a new cabin air filter", unit: "filter", units: "cabin air filters" },
  { name: "Ironworks Gym", who: "members check in", buy: "grab a rental towel", unit: "towel", units: "towels" },
];

const DAYS = [240, 250, 255, 260, 280, 300, 310, 320, 350];

// ================================================================== scenario builders
function buy(r, o) {
  o = o || {};
  const c = o.c || r.pick(BUY), who = r.pick(FIRST);
  const M = r.step(c.M[0], c.M[1], c.M[2]);
  const D = M * 12;
  const S = r.chance(0.5) ? r.int(c.S[0], c.S[1]) : r.money(c.S[0], c.S[1]);
  const P = r.money(c.P[0], c.P[1]);
  const I = r.pick([12, 15, 18, 20, 22, 25, 28, 30, 35, 40]);
  const hm = o.hm || r.pick(["pct", "dollar"]);
  const dm = o.dm || r.pick(["month", "year"]);
  let H = (P * I) / 100;
  if (hm === "dollar") H = Math.max(0.01, r2(H));
  const days = r.pick(DAYS);
  const L = r.int(3, 12);
  const Qs = eoq(D, S, H);
  const Q0 = nice(Qs * r.pick([0.4, 0.5, 0.6, 1.6, 2, 2.5]));
  return { c, who, M, D, S, P, I, H, hm, dm, days, L, Qs, Q0 };
}

function buyText(r, x, keys) {
  const c = x.c, s = [];
  const has = (k) => keys.indexOf(k) >= 0;
  s.push(r.pick([
    `${x.who}, the ${c.role} at ${c.name}, wants to get smarter about ordering ${c.item}.`,
    `${c.name} keeps ${c.item} in stock, and ${x.who} (the ${c.role}) handles the ordering.`,
    `${x.who} runs purchasing for ${c.name} and is reviewing how the business buys ${c.item}.`,
  ]));
  if (has("demand")) {
    if (x.dm === "month") s.push(r.pick([`${c.name} goes through about ${n0(x.M)} ${c.units} a month.`, `On average, ${n0(x.M)} ${c.units} are used every month.`, `Monthly demand runs about ${n0(x.M)} ${c.units}.`]));
    else s.push(r.pick([`Annual demand is ${n0(x.D)} ${c.units}.`, `Over a full year, ${c.name} uses about ${n0(x.D)} ${c.units}.`, `Demand is steady at ${n0(x.D)} ${c.units} per year.`]));
  }
  if (has("price")) s.push(r.pick([`Each ${c.unit} costs ${usd2(x.P)}.`, `The supplier charges ${usd2(x.P)} per ${c.unit}.`]));
  if (has("hold")) {
    if (x.hm === "pct") s.push(r.pick([`Holding a ${c.unit} in inventory for a year costs about ${x.I}% of its price.`, `The annual carrying cost is ${x.I}% of the unit cost.`, `Storage, insurance, and spoilage add up to ${x.I}% of each ${c.unit}'s cost per year.`]));
    else s.push(r.pick([`It costs ${usd2(x.H)} to hold one ${c.unit} for a year.`, `The annual holding cost is ${usd2(x.H)} per ${c.unit}.`]));
  }
  if (has("order")) s.push(r.pick([`Placing an order costs ${usd(x.S)}.`, `Every order comes with a ${usd(x.S)} processing fee.`, `It costs ${usd(x.S)} each time an order is placed.`]));
  if (has("days")) s.push(r.pick([`${c.name} is open ${x.days} days a year.`, `There are ${x.days} working days in the year.`]));
  if (has("lead")) s.push(r.pick([`Orders take ${x.L} working days to arrive.`, `The lead time is ${x.L} working days.`]));
  if (has("current")) s.push(r.pick([`Right now, ${x.who} orders ${n0(x.Q0)} ${c.units} at a time.`, `The current policy is to order ${n0(x.Q0)} ${c.units} per order.`]));
  return s.join(" ");
}

function make(r, o) {
  o = o || {};
  const c = o.c || r.pick(MAKE), who = r.pick(FIRST);
  const days = r.pick(DAYS);
  const d = r.step(c.d[0], c.d[1], c.d[2]);
  let p = Math.round((d * (1.4 + r.next() * 1.8)) / 5) * 5;
  if (p <= d + 5) p = d + 10;
  const D = d * days;
  const S = r.int(c.S[0], c.S[1]);
  const P = r.money(c.P[0], c.P[1]);
  const I = r.pick([10, 12, 15, 18, 20, 25, 30]);
  const hm = o.hm || r.pick(["pct", "dollar"]);
  const dm = o.dm || r.pick(["day", "year"]);
  let H = (P * I) / 100;
  if (hm === "dollar") H = Math.max(0.01, r2(H));
  const Qs = epq(D, S, H, d, p);
  const Q0 = nice(Qs * r.pick([0.5, 0.6, 1.7, 2, 2.5]));
  return { c, who, days, d, p, D, S, P, I, H, hm, dm, Qs, Q0 };
}

function makeText(r, x, keys) {
  const c = x.c, s = [];
  const has = (k) => keys.indexOf(k) >= 0;
  s.push(r.pick([
    `${x.who} is the ${c.role} at ${c.name}, which makes its own ${c.item}.`,
    `${c.name} produces ${c.item} in batches, and ${x.who} (the ${c.role}) plans the production runs.`,
    `${x.who} schedules production at ${c.name}, a company that makes and sells ${c.item}.`,
  ]));
  if (has("demand")) {
    if (x.dm === "day") s.push(r.pick([`Customers buy about ${n0(x.d)} ${c.units} per day.`, `Daily demand is ${n0(x.d)} ${c.units}.`]));
    else s.push(r.pick([`Annual demand is ${n0(x.D)} ${c.units}.`, `Customers buy ${n0(x.D)} ${c.units} a year.`]));
  }
  if (has("prod")) s.push(r.pick([`The line can make ${n0(x.p)} ${c.units} per day.`, `When it's running, the equipment produces ${n0(x.p)} ${c.units} a day.`]));
  if (has("days")) s.push(r.pick([`The plant operates ${x.days} days a year.`, `${c.name} is open ${x.days} days a year.`]));
  if (has("setup")) s.push(r.pick([`Each production run costs ${usd(x.S)} to set up.`, `Changing over the equipment for a new run costs ${usd(x.S)}.`]));
  if (has("hold")) {
    if (x.hm === "pct") s.push(r.pick([`Holding cost is ${x.I}% of the ${usd2(x.P)} it costs to make each ${c.unit}.`, `It costs ${usd2(x.P)} to make a ${c.unit}, and holding one for a year costs ${x.I}% of that.`]));
    else s.push(r.pick([`It costs ${usd2(x.H)} to hold one ${c.unit} for a year.`, `The annual holding cost is ${usd2(x.H)} per ${c.unit}.`]));
  }
  if (has("current")) s.push(r.pick([`Right now, they make ${n0(x.Q0)} ${c.units} per run.`, `The current batch size is ${n0(x.Q0)} ${c.units}.`]));
  return s.join(" ");
}

// Steps that explain where D, H, and d came from
function stepD(x) { return x.dm === "month" ? `D = ${n0(x.M)} per month × 12 = ${n0(x.D)} ${x.c.units} per year` : `D = ${n0(x.D)} ${x.c.units} per year (given)`; }
function stepH(x) { return x.hm === "pct" ? `H = I × P = ${x.I / 100} × ${usd2(x.P)} = ${usd4(x.H)} per ${x.c.unit} per year` : `H = ${usd2(x.H)} per ${x.c.unit} per year (given)`; }
function stepDp(x) { return x.dm === "day" ? `D = d × days = ${n0(x.d)} × ${x.days} = ${n0(x.D)} ${x.c.units} per year` : `d = D ÷ days = ${n0(x.D)} ÷ ${x.days} = ${n0(x.d)} ${x.c.units} per day`; }
function hintH(x) { return x.hm === "pct" ? "H is given as a percent of the price. Turn the percent into a decimal and multiply by the price: H = I × P." : "H is already given in dollars per unit per year."; }
function hintD(x) { return x.dm === "month" ? "D must be ANNUAL demand. The demand here is monthly, so multiply by 12." : "D is given as an annual number already."; }

// ================================================================== problem constructors
const BANK = [];
const LEVEL_INFO = {};
let CUR = { part: 0, title: "", level: "" };
const counters = {};
function part(num, title, blurb) { CUR = { part: num, title, level: "", blurb }; }
function level(name, info) { CUR.level = name; LEVEL_INFO[CUR.part + "|" + name] = info || {}; }
function add(build, opts) {
  opts = opts || {};
  counters[CUR.part] = (counters[CUR.part] || 0) + 1;
  BANK.push({ id: "p" + CUR.part + "-" + counters[CUR.part], part: CUR.part, partTitle: CUR.title, partBlurb: CUR.blurb, level: CUR.level, build, caseKey: opts.caseKey || null, step: opts.step || null });
}
function N(o) { o.kind = "num"; if (o.dec === undefined) o.dec = 2; o.mistakes = o.mistakes || []; o.hints = o.hints || []; o.steps = o.steps || []; return o; }
function C(o) { o.kind = "mc"; return o; }

// Multiple-choice from data. it = { q, a, w, why } or { v: [{q, a, why}], pool, notes, why }
function concept(it) {
  return function (r) {
    let q, a, why = it.why, wrongs;
    if (it.v) {
      const v = r.pick(it.v);
      q = v.q; a = v.a; if (v.why) why = v.why;
      wrongs = it.pool.filter((x) => x !== a).map((x) => [x, it.notes ? it.notes[x] : null]);
    } else {
      q = Array.isArray(it.q) ? r.pick(it.q) : it.q;
      a = Array.isArray(it.a) ? r.pick(it.a) : it.a;
      wrongs = it.w.map((x) => (Array.isArray(x) ? x : [x, null]));
    }
    const pickW = r.sample(wrongs, Math.min(it.n || 3, wrongs.length));
    const choices = [{ t: a, ok: true }].concat(pickW.map((w) => ({ t: w[0], ok: false, note: w[1] })));
    return C({ story: it.story || null, ask: q, choices, why });
  };
}

// ================================================================== the variable cheat card (also shown in the app)
const VAR_CARD = [
  ["D", "Annual demand", "units per YEAR. If demand is given per month, week, quarter, or day, convert it."],
  ["S", "Setup or ordering cost", "dollars per ORDER (or per production run). Also called acquisition cost: the cost of \"getting.\""],
  ["H", "Holding cost", "dollars per UNIT per YEAR. Also called carrying or possession cost: the cost of \"having.\" Can be given as H = I × P."],
  ["I", "Holding cost rate", "H as a percent of the price. Turn the % into a decimal, then H = I × P."],
  ["P", "Price", "what the business pays per unit (not what it sells for)."],
  ["Q", "Order quantity", "units per order or per production run (lot). Q* is the best (optimal) amount."],
  ["d", "Daily demand", "units per working DAY. d = D ÷ working days per year."],
  ["p", "Daily production rate", "units the business can MAKE per day (EPQ only)."],
  ["L", "Lead time", "days between placing an order and receiving it."],
  ["ss", "Safety stock", "extra units kept on hand as a cushion against running out."],
];

// ================================================================== PART 1: KNOW YOUR VARIABLES
part(1, "Know Your Variables", "Before any formula works, you have to pull the right numbers out of the story. Every question here asks for ONE variable, hidden in a story written the long way around.");

const VARS = {
  D: "D (annual demand)", d: "d (daily demand)", S: "S (setup or ordering cost)", H: "H (holding cost per unit per year)",
  Q: "Q (order or production quantity)", p: "p (daily production rate)", L: "L (lead time)", ss: "ss (safety stock)",
  P: "P (price per unit)", I: "I (holding cost as a % of price)",
};
const CONFUSE = { H: ["S", "P", "I", "D"], S: ["H", "P", "Q", "I"], Q: ["D", "d", "ss", "p"], D: ["d", "Q", "p", "ss"], d: ["D", "p", "L", "Q"], p: ["d", "D", "Q", "L"], L: ["ss", "d", "Q", "p"], ss: ["Q", "L", "d", "D"], P: ["H", "I", "S", "Q"], I: ["H", "P", "S", "D"] };
const VAR_WHY = {
  H: "Holding cost (carrying cost, possession cost) is what it costs to HAVE one unit for a whole year: storage, insurance, spoilage, money tied up.",
  S: "Setup or ordering cost (acquisition cost) is what it costs to GET an order or start a production run. It's charged per order, no matter how many units are in it.",
  Q: "Q is how many units come in on each order or each production run (a lot or batch).",
  D: "D is annual demand: units needed over a whole year.",
  d: "d is daily demand: units used or sold per working day.",
  p: "p is the daily production rate: how many units the business can make per day.",
  L: "L is lead time: how long between placing an order and receiving it.",
  ss: "Safety stock is extra inventory kept as a cushion in case demand or lead time is worse than expected.",
  P: "P is the price the business pays for each unit.",
  I: "I is the holding cost written as a percent of the price. H = I × P.",
};

function nameIt(group) {
  return function (r) {
    const c = r.pick(BUY.concat(MAKE)), who = r.pick(FIRST);
    const u = c.unit, us = c.units, m = (t) => `<mark>${t}</mark>`;
    const G = {
      H: [
        () => ["H", `It costs ${c.name} about ${m(usd2(r.money(0.3, 4)))} a year in rent, insurance, and spoilage to keep one ${u} on the shelf.`],
        () => ["H", `The carrying cost works out to ${m(usd2(r.money(0.2, 3)))} per ${u} per year.`],
        () => ["H", `${who} figures that owning a single ${u} for twelve months costs ${m(usd2(r.money(0.25, 3.5)))}.`],
        () => ["H", `The possession cost is ${m(usd2(r.money(0.4, 5)))} per ${u}, annually.`],
      ],
      S: [
        () => ["S", `Every time ${who} sends a purchase order, the accounting office charges ${m(usd(r.int(15, 90)))} to process it.`],
        () => ["S", `Switching the equipment over to start a new batch of ${us} costs ${m(usd(r.int(60, 400)))} in labor and cleaning.`],
        () => ["S", `The acquisition cost (what it takes to get an order in the door) is ${m(usd(r.int(20, 120)))} per order.`],
        () => ["S", `No matter how many ${us} are on it, each delivery comes with a ${m(usd(r.int(25, 75)))} handling fee.`],
      ],
      Q: [
        () => ["Q", `${who} always buys ${m(n0(r.step(200, 3000, 50)))} ${us} at a time.`],
        () => ["Q", `Each production lot is ${m(n0(r.step(500, 8000, 100)))} ${us}.`],
        () => ["Q", `When the shelf runs low, ${who} places a requisition for ${m(n0(r.step(100, 2000, 25)))} ${us}.`],
        () => ["Q", `The batch size for each run is ${m(n0(r.step(400, 5000, 100)))} ${us}.`],
      ],
      Dd: [
        () => ["D", `Over a full year, customers go through about ${m(n0(r.step(5000, 90000, 500)))} ${us}.`],
        () => ["d", `On a typical working day, ${m(n0(r.int(20, 400)))} ${us} are used.`],
        () => ["d", `The usage rate is ${m(n0(r.int(15, 300)))} ${us} per working day.`],
        () => ["D", `Last year's sales report showed ${m(n0(r.step(4000, 60000, 100)))} ${us} sold, and this year should look the same.`],
      ],
      pLss: [
        () => ["p", `When it's running, the machine can turn out ${m(n0(r.int(150, 2000)))} ${us} per day.`],
        () => ["L", `It takes ${m(r.int(3, 14) + " days")} from the time an order is placed until it shows up at the back door.`],
        () => ["ss", `${who} keeps an extra ${m(n0(r.int(20, 400)))} ${us} on hand, just in case demand spikes.`],
        () => ["L", `The supplier says to allow ${m(r.int(4, 12) + " working days")} between ordering and delivery.`],
      ],
      PI: [
        () => ["P", `The supplier charges ${m(usd2(r.money(0.5, 30)))} per ${u}.`],
        () => ["I", `The annual holding cost is ${m(r.pick([12, 15, 18, 20, 25, 30]) + "%")} of what each ${u} costs.`],
        () => ["P", `${c.name} pays ${m(usd2(r.money(1, 25)))} for each ${u} it brings in.`],
        () => ["I", `Carrying a ${u} for a year costs about ${m(r.pick([15, 20, 22, 25, 28, 35]) + "%")} of its purchase price.`],
      ],
    };
    const [v, sentence] = r.pick(G[group])();
    const wrong = r.sample(CONFUSE[v], 3);
    return C({
      story: sentence,
      ask: "Which variable is the highlighted number?",
      choices: [{ t: VARS[v], ok: true }].concat(wrong.map((k) => ({ t: VARS[k], ok: false, note: VAR_WHY[k] }))),
      why: VAR_WHY[v],
    });
  };
}

level("Speak the Language", { intro: "Match each highlighted number to its variable. Watch for the other names: <b>carrying</b> or <b>possession</b> cost means H; <b>acquisition</b>, <b>ordering</b>, or <b>setup</b> cost means S; <b>lot</b>, <b>batch</b>, or <b>requisition</b> means Q." });
["H", "S", "Q", "Dd", "pLss", "PI"].forEach((g) => add(nameIt(g)));

// ---------------------------------------------------------------- Find D
level("Find D", { intro: "D is <b>annual</b> demand. Stories hide it as monthly, weekly, quarterly, or daily demand, as a percent of customers, or in cases instead of single units." });

add(function (r) {
  const x = buy(r, { dm: "month" });
  return N({
    story: buyText(r, x, ["demand", "price", "order", "days"]),
    ask: `What is <b>D</b>, the annual demand, in ${x.c.units}?`, answer: x.D, unit: x.c.units,
    hints: ["D always means <b>annual</b> demand. What time period is the demand in this story?", "There are 12 months in a year. The number of days open doesn't matter for D here."],
    steps: [`Demand is given per month: ${n0(x.M)} ${x.c.units}.`, `D = ${n0(x.M)} × 12 = <b>${n0(x.D)}</b> ${x.c.units} per year.`, `The days open, price, and order cost are not needed to find D.`],
    mistakes: [[x.M, "That's the monthly amount. D in every formula is ANNUAL demand."], [x.M * x.days, "You multiplied the monthly number by days open. Demand is per month, so count months, not days."], [x.M * 52, "There are 12 months in a year, not 52."]],
  });
});

add(function (r) {
  const c = r.pick(BUY), who = r.pick(FIRST);
  const w = Math.max(10, Math.round(r.step(c.M[0], c.M[1], c.M[2]) / 4.3 / 5) * 5);
  const closed = r.int(1, 4), W = 52 - closed, P = r.money(c.P[0], c.P[1]);
  const story = `${c.name} uses about ${n0(w)} ${c.units} per week. ${who}, the ${c.role}, notes that ${c.name} closes for ${closed} ${plural(closed, "week", "weeks")} every year (holidays and a summer break) and uses none while closed. Each ${c.unit} costs ${usd2(P)}, and there are 52 weeks in a year.`;
  const D = w * W;
  return N({
    story, ask: `What is <b>D</b>, the annual demand, in ${c.units}?`, answer: D, unit: c.units,
    hints: ["D is annual demand. How many weeks a year is the business actually using them?", `52 weeks minus ${closed} closed = ${W} weeks of use.`],
    steps: [`Weeks open = 52 − ${closed} = ${W}.`, `D = ${n0(w)} per week × ${W} weeks = <b>${n0(D)}</b> ${c.units}.`],
    mistakes: [[w * 52, `You used all 52 weeks, but ${c.name} is closed ${closed} ${plural(closed, "week", "weeks")} a year.`], [w, "That's weekly demand. D is annual."], [w * closed, "Multiply by the weeks OPEN, not the weeks closed."]],
  });
});

add(function (r) {
  const c = r.pick(BUY.concat(MAKE)), who = r.pick(FIRST);
  const x = r.int(8, 120), dpw = r.pick([5, 6, 7]), W = r.int(48, 52);
  const D = x * dpw * W;
  const story = `${who} tracks ${c.item} at ${c.name}. On an average day they go through ${n0(x)} ${c.units}. ${c.name} is open ${dpw} days a week, ${W} weeks a year.`;
  const ms = [[x * 365, "You used 365 days, but the business isn't open every day."], [x * dpw, "That's weekly demand. Keep going to a full year."]];
  if (W !== 52) ms.push([x * dpw * 52, `You used 52 weeks, but they're only open ${W} weeks.`]);
  if (dpw !== 7) ms.push([x * 7 * W, `They're open ${dpw} days a week, not 7.`]);
  return N({
    story, ask: `What is <b>D</b>, the annual demand, in ${c.units}?`, answer: D, unit: c.units,
    hints: ["Start with daily usage and build up to a year.", `Days open per year = ${dpw} days × ${W} weeks.`],
    steps: [`Days open per year = ${dpw} × ${W} = ${dpw * W}.`, `D = ${n0(x)} per day × ${dpw * W} days = <b>${n0(D)}</b> ${c.units}.`],
    mistakes: ms,
  });
});

add(function (r) {
  const c = r.pick(BUY), q = r.step(c.M[0] * 3, c.M[1] * 3, c.M[2] * 3);
  const story = `${c.name} reviews its supply reports once a quarter. Each quarterly report shows about ${n0(q)} ${c.item} used, and the business expects that pattern to hold all year. Each ${c.unit} costs ${usd2(r.money(c.P[0], c.P[1]))}.`;
  return N({
    story, ask: `What is <b>D</b>, the annual demand, in ${c.units}?`, answer: q * 4, unit: c.units,
    hints: ["How many quarters are in a year?"],
    steps: [`There are 4 quarters in a year.`, `D = ${n0(q)} × 4 = <b>${n0(q * 4)}</b> ${c.units}.`],
    mistakes: [[q, "That's one quarter. D is a full year."], [q * 3, "A quarter is 3 months, but you need quarters per year: 4."], [q * 12, "There are 4 quarters in a year, not 12."]],
  });
});

add(function (r) {
  const c = r.pick(CUSTS);
  const n = r.step(100, 600, 20), pct = r.pick([20, 25, 30, 35, 40, 45, 60, 75]), k = r.pick([1, 1, 2, 3]);
  const closed = r.int(1, 3), W = 52 - closed;
  const D = n * (pct / 100) * k * W;
  const each = k === 1 ? "" : ` Each of those uses ${k} ${c.units}.`;
  const story = `${c.name} sees about ${n0(n)} ${c.who} per week. About ${pct}% of them ${c.buy}.${each} ${c.name} closes ${closed} ${plural(closed, "week", "weeks")} a year and is open the rest.`;
  const ms = [[n * k * W, `Only ${pct}% of the ${c.who} use one. Multiply by the percent as a decimal.`], [n * (pct / 100) * k * 52, `They're closed ${closed} ${plural(closed, "week", "weeks")}, so use ${W} weeks.`], [n * (pct / 100) * k, "That's weekly. D is annual."]];
  if (k > 1) ms.push([n * (pct / 100) * W, `Each one uses ${k} ${c.units}, so multiply by ${k} too.`]);
  return N({
    story, ask: `What is <b>D</b>, the annual demand for ${c.units}?`, answer: D, unit: c.units,
    hints: [`Start with weekly ${c.who}, then keep only the ${pct}% who use one.`, k > 1 ? `Multiply by ${k} per use, then by the weeks open.` : "Then multiply by the weeks open per year.", `Weeks open = 52 − ${closed} = ${W}.`],
    steps: [`Weekly users = ${n0(n)} × ${pct / 100} = ${nn(n * pct / 100)}.`].concat(k > 1 ? [`Weekly ${c.units} = ${nn(n * pct / 100)} × ${k} = ${nn(n * pct / 100 * k)}.`] : []).concat([`D = ${nn(n * pct / 100 * k)} × ${W} weeks = <b>${nn(D)}</b> ${c.units}.`]),
    mistakes: ms,
  });
});

add(function (r) {
  const c = r.pick(JOBS), k = r.int(c.k[0], c.k[1]), j = r.int(c.j[0], c.j[1]), days = r.pick(DAYS);
  const D = k * j * days;
  const story = `Every ${c.job} at ${c.name} uses ${k} ${k === 1 ? c.unit : c.units}. The team handles about ${j} ${c.jobs} per day and is open ${days} days a year. The supplier delivers in about a week.`;
  return N({
    story, ask: `What is <b>D</b>, the annual demand for ${c.units}?`, answer: D, unit: c.units,
    hints: [`First find how many ${c.units} are used per day.`, `Then multiply by ${days} days.`],
    steps: [`Per day: ${k} × ${j} = ${n0(k * j)} ${c.units}.`, `D = ${n0(k * j)} × ${days} = <b>${n0(D)}</b> ${c.units}.`],
    mistakes: [[j * days, `Each ${c.job} uses ${k}, so multiply by ${k}.`], [k * j, "That's daily usage. D is annual."], [k * j * 365, `They're open ${days} days, not 365.`]],
  });
});

add(function (r) {
  const c = r.pick([
    { name: "Gulf Coast Hot Sauce Co.", item: "hot sauce", unit: "bottle", units: "bottles", pack: "case", n: [12, 24] },
    { name: "Grind & Gather Coffee", item: "bottled water", unit: "bottle", units: "bottles", pack: "case", n: [24, 36] },
    { name: "Crimson Corner Books", item: "pens", unit: "pen", units: "pens", pack: "box", n: [12, 50] },
    { name: "Riverside Inn", item: "light bulbs", unit: "bulb", units: "bulbs", pack: "carton", n: [6, 24] },
    { name: "Ironworks Gym", item: "protein bars", unit: "bar", units: "bars", pack: "box", n: [12, 24] },
  ]);
  const n = r.int(c.n[0], c.n[1]), M = r.int(15, 120), Hu = r.money(0.05, 0.6);
  const D = M * n * 12;
  const story = `${c.name} buys ${c.item} by the ${c.pack}. Each ${c.pack} holds ${n} ${c.units}, and the business goes through about ${M} ${c.pack}s a month. Holding cost is quoted as ${usd2(Hu)} per individual ${c.unit} per year.`;
  return N({
    story, ask: `Since H is per ${c.unit}, D must be in ${c.units} too. What is <b>D</b>, the annual demand in individual ${c.units}?`, answer: D, unit: c.units,
    hints: ["The units must match: H is per single " + c.unit + ", so D has to count single " + c.units + ".", `Convert ${c.pack}s to ${c.units} (× ${n}), then months to a year (× 12).`],
    steps: [`${c.units[0].toUpperCase() + c.units.slice(1)} per month = ${M} × ${n} = ${n0(M * n)}.`, `D = ${n0(M * n)} × 12 = <b>${n0(D)}</b> ${c.units} per year.`],
    mistakes: [[M * 12, `That's ${c.pack}s per year. H is per ${c.unit}, so D must be in ${c.units}.`], [M * n, "That's monthly. Multiply by 12."], [M * n * 52, "That's per month, so multiply by 12, not 52."]],
  });
});

add(function (r) {
  const c = r.pick(BUY), x = Math.max(20, Math.round(r.step(c.M[0], c.M[1], c.M[2]) / 2 / 5) * 5);
  const story = `${c.name} restocks ${c.item} on a two-week cycle. Every two weeks, ${n0(x)} ${c.units} get used up. ${c.name} is open all 52 weeks of the year. A new order takes ${r.int(3, 9)} days to arrive.`;
  return N({
    story, ask: `What is <b>D</b>, the annual demand, in ${c.units}?`, answer: x * 26, unit: c.units,
    hints: ["How many two-week periods are in 52 weeks?"],
    steps: [`52 weeks ÷ 2 = 26 two-week periods.`, `D = ${n0(x)} × 26 = <b>${n0(x * 26)}</b> ${c.units}.`, "The delivery time doesn't matter for D."],
    mistakes: [[x * 52, `${n0(x)} is used every TWO weeks, so there are 26 periods, not 52.`], [x * 24, "Two weeks is not half a month. 52 ÷ 2 = 26 periods."], [x * 12, "Count two-week periods in a year: 26."], [x, "That's one two-week period. D is annual."]],
  });
});

// ---------------------------------------------------------------- Find H
level("Find H", { intro: "H is dollars per <b>unit</b> per <b>year</b>. Stories give it as a % of price, per month, as a pile of separate costs, or per case or bag instead of per unit." });

function hDec(H) { return H < 1 ? 4 : 2; }

add(function (r) {
  const c = r.pick(BUY), P = r.money(c.P[0] * 2, c.P[1] * 2 + 3), I = r.pick([15, 18, 20, 22, 25, 30, 35]), S = r.int(c.S[0], c.S[1]);
  const H = (P * I) / 100, dec = hDec(H);
  const story = r.pick([
    `${c.name} pays ${usd2(P)} for each ${c.unit}. The accounting team estimates that keeping a ${c.unit} in stock for a year costs ${I}% of what they paid for it. Ordering costs ${usd(S)} per order.`,
    `Each ${c.unit} costs ${c.name} ${usd2(P)}. Insurance, storage space, and the money tied up in inventory run about ${I}% of the item's cost per year. There's also a ${usd(S)} fee on every order.`,
  ]);
  return N({
    story, ask: `What is <b>H</b>, the holding cost per ${c.unit} per year? ${dec === 4 ? R4 : R2}`, answer: H, dec, unit: "$",
    hints: ["H is in DOLLARS per unit per year, and the story gives a percent.", "H = I × P. Write the percent as a decimal first."],
    steps: [`I = ${I}% = ${I / 100}.`, `H = ${I / 100} × ${usd2(P)} = <b>${usd4(H)}</b> per ${c.unit} per year.`, `The ${usd(S)} order fee is S, not H.`],
    mistakes: [[I, "You entered the percent. H is a dollar amount: multiply the percent (as a decimal) by the price."], [P * I, "Turn the percent into a decimal first (" + I + "% = " + I / 100 + ")."], [P, "That's the price. H is only part of the price."], [S, "That's the ordering cost (S), not the holding cost."]],
  });
});

add(function (r) {
  const c = r.pick(BUY.filter((b) => b.resell)), P = r.money(c.P[0], c.P[1] + 4), SP = r2(P * (1.6 + r.next())), I = r.pick([15, 20, 24, 25, 30]);
  const H = (P * I) / 100, dec = hDec(H);
  const story = `${c.name} buys each ${c.unit} from its supplier for ${usd2(P)} and sells it to customers for ${usd2(SP)}. The annual holding cost rate is ${I}% of the purchase price.`;
  return N({
    story, ask: `What is <b>H</b>, the holding cost per ${c.unit} per year? ${dec === 4 ? R4 : R2}`, answer: H, dec, unit: "$",
    hints: ["Which price does holding cost depend on: what the business PAYS or what it SELLS for?", "Holding cost is based on the money tied up in inventory, which is the purchase price."],
    steps: [`Use the purchase price, ${usd2(P)}. The selling price is a distractor.`, `H = ${I / 100} × ${usd2(P)} = <b>${usd4(H)}</b>.`],
    mistakes: [[(SP * I) / 100, "You used the selling price. The rate is a percent of the PURCHASE price."], [I, "H is in dollars. Multiply the rate by the price."], [P * I, "Write the percent as a decimal first."]],
  });
});

add(function (r) {
  const c = r.pick(BUY.concat(MAKE)), mth = r.money(0.02, 0.6);
  const story = `${c.name} rents climate-controlled storage for its ${c.item}. ${r.pick(["Adding up rent, power, and insurance,", "After splitting the storage bill across everything in the room,"])} the ${c.role} figures it costs ${usd2(mth)} per ${c.unit} per month to keep one in storage.`;
  const H = mth * 12;
  return N({
    story, ask: `What is <b>H</b>, the holding cost per ${c.unit} per year? ${R2}`, answer: H, unit: "$",
    hints: ["H is per YEAR. What time period is this cost given in?"],
    steps: [`The cost is per month: ${usd2(mth)}.`, `H = ${usd2(mth)} × 12 = <b>${usd2(H)}</b> per ${c.unit} per year.`],
    mistakes: [[mth, "That's per month. H is per year."], [mth * 52, "It's a monthly cost, so multiply by 12."], [mth * 365, "It's a monthly cost, so multiply by 12."]],
  });
});

add(function (r) {
  const c = r.pick(BUY.concat(MAKE)), P = r.money(Math.max(2, c.P[0]), c.P[1] + 6), s = r.money(0.1, 1.2), a = r.pick([3, 4, 5, 6]), b = r.pick([2, 3, 5, 8]);
  const H = s + ((a + b) / 100) * P;
  const story = `${c.name} wants a true holding cost for ${c.item}, which cost ${usd2(P)} each. The pieces: warehouse space runs ${usd2(s)} per ${c.unit} per year, insurance and taxes run ${a}% of the unit cost per year, and obsolescence and damage run another ${b}% of the unit cost per year.`;
  return N({
    story, ask: `What is <b>H</b>, the total holding cost per ${c.unit} per year? ${R2}`, answer: H, unit: "$",
    hints: ["H includes every cost of having one unit for a year. Add all three pieces.", `The two percents together are ${a + b}% of ${usd2(P)}. Turn that into dollars, then add the ${usd2(s)}.`],
    steps: [`Percent pieces: (${a}% + ${b}%) × ${usd2(P)} = ${(a + b) / 100} × ${usd2(P)} = ${usd4(((a + b) / 100) * P)}.`, `H = ${usd2(s)} + ${usd4(((a + b) / 100) * P)} = <b>${usd2(H)}</b>.`],
    mistakes: [[s, "That's only the warehouse space. Add the percent-based costs too."], [((a + b) / 100) * P, `Don't forget the ${usd2(s)} for warehouse space.`], [s + a + b, "The percents have to be turned into dollars (× the unit cost) before adding."], [s + (a / 100) * P, `You left out the ${b}% for obsolescence and damage.`]],
  });
});

add(function (r) {
  const c = r.pick(BUY.concat(MAKE)), P = r.money(Math.max(3, c.P[0]), c.P[1] + 10);
  const cat = [["housing (rent, utilities, building insurance)", r.int(3, 9)], ["material handling equipment", r.int(1, 3)], ["warehouse labor", r.int(3, 5)], ["investment costs (borrowing, taxes, insurance on inventory)", r.int(6, 14)], ["pilferage, space, and obsolescence", r.int(2, 5)]];
  const tot = cat.reduce((t, k) => t + k[1], 0), H = (tot / 100) * P;
  const story = `${c.name}'s accountant broke down the yearly cost of carrying ${c.item}, each as a percent of inventory value:<ul>${cat.map((k) => `<li>${k[0]}: ${k[1]}%</li>`).join("")}</ul>Each ${c.unit} is valued at ${usd2(P)}.`;
  return N({
    story, ask: `What is <b>H</b>, the holding cost per ${c.unit} per year? ${R2}`, answer: H, unit: "$",
    hints: ["Add the categories to get the total carrying rate (I).", "Then H = I × P."],
    steps: [`I = ${cat.map((k) => k[1]).join(" + ")} = ${tot}% = ${tot / 100}.`, `H = ${tot / 100} × ${usd2(P)} = <b>${usd2(H)}</b>.`],
    mistakes: [[tot, `${tot}% is the rate (I). Multiply it, as a decimal, by the ${usd2(P)} value.`], [(cat[3][1] / 100) * P, "That's only one category. Add all five percents first."], [tot * P, "Write the total percent as a decimal first."]],
  });
});

add(function (r) {
  const c = r.pick([
    { name: "Magic City Brewing", item: "lager", unit: "can", units: "cans", pack: "case", n: [12, 24] },
    { name: "Crimson Corner Books", item: "highlighters", unit: "highlighter", units: "highlighters", pack: "box", n: [10, 24] },
    { name: "Northside Urgent Care", item: "syringes", unit: "syringe", units: "syringes", pack: "box", n: [50, 100] },
    { name: "Sweet Home Salsa", item: "salsa", unit: "jar", units: "jars", pack: "case", n: [6, 12] },
  ]);
  const n = r.int(c.n[0], c.n[1]), hc = r.money(0.8, 6);
  const H = hc / n;
  const story = `${c.name} tracks demand for ${c.item} in individual ${c.units}, but the warehouse quotes storage by the ${c.pack}: it costs ${usd2(hc)} per year to hold one ${c.pack}. Each ${c.pack} contains ${n} ${c.units}.`;
  return N({
    story, ask: `Demand is counted in ${c.units}, so H must be per ${c.unit}. What is <b>H</b> per ${c.unit} per year? ${R4}`, answer: H, dec: 4, unit: "$",
    hints: [`H must be in the same unit as D. D counts ${c.units}.`, `One ${c.pack} holds ${n} ${c.units}, so split the ${c.pack} cost across them.`],
    steps: [`H per ${c.unit} = ${usd2(hc)} ÷ ${n} = <b>${usd4(H)}</b>.`],
    mistakes: [[hc, `That's per ${c.pack}. Demand is in ${c.units}, so convert H to per ${c.unit}.`], [hc * n, `Divide, don't multiply: one ${c.unit} costs less to hold than a whole ${c.pack}.`]],
  });
});

add(function (r) {
  const c = r.pick([
    { name: "Black Belt Fertilizer", item: "lawn fertilizer", bag: [25, 50] },
    { name: "Mountain Brook Pet Treats", item: "dog food", bag: [20, 40] },
    { name: "Cahaba Mills", item: "cornmeal", bag: [10, 50] },
    { name: "Southern Seed Co.", item: "grass seed", bag: [10, 25] },
  ]);
  const lb = r.pick(c.bag.concat([c.bag[0] + 5])), hb = r.money(0.3, 2.5), wk = r.step(5000, 120000, 1000);
  const H = hb / lb;
  const story = `${c.name} sells ${c.item} in ${lb}-lb. bags. Demand is about ${n0(wk)} lbs. per week, and every calculation is done in pounds. Holding one bag in the warehouse for a year costs ${usd2(hb)}.`;
  return N({
    story, ask: `What is <b>H</b>, the holding cost per <b>pound</b> per year? ${R4}`, answer: H, dec: 4, unit: "$",
    hints: ["Demand is in pounds, so H has to be per pound.", `A bag holds ${lb} lbs. How much of the ${usd2(hb)} belongs to each pound?`],
    steps: [`H per lb. = ${usd2(hb)} ÷ ${lb} = <b>${usd4(H)}</b> per lb. per year.`, "Weekly demand isn't needed to find H."],
    mistakes: [[hb, "That's per BAG. Demand is in pounds, so divide by the pounds in a bag."], [hb * lb, "Divide by the bag size, don't multiply."], [hb / 50, `The bags here are ${lb} lbs.`]],
  });
});

add(function (r) {
  const c = r.pick(BUY.concat(MAKE)), P = r.money(Math.max(2, c.P[0]), c.P[1] + 8);
  const f = r.pick([["one-fourth", 0.25], ["one-fifth", 0.2], ["one-tenth", 0.1], ["three-tenths", 0.3], ["about one-eighth", 0.125]]);
  const H = P * f[1];
  const story = `"Every ${c.unit} we keep for a full year costs us ${f[0]} of what we paid for it," says ${r.pick(FIRST)}, the ${c.role} at ${c.name}. Each ${c.unit} costs ${usd2(P)}.`;
  return N({
    story, ask: `What is <b>H</b>, the holding cost per ${c.unit} per year? ${R2}`, answer: H, unit: "$",
    hints: [`"${f[0].replace("about ", "")}" is a fraction of the price. Write it as a decimal or percent.`, `${f[0].replace("about ", "")} = ${f[1]} = ${f[1] * 100}%.`],
    steps: [`I = ${f[0].replace("about ", "")} = ${f[1]}.`, `H = ${f[1]} × ${usd2(P)} = <b>${usd2(H)}</b>.`],
    mistakes: [[f[1], "That's the rate. Multiply it by the price to get dollars."], [P, "That's the whole price. H is only a fraction of it."]],
  });
});

// ---------------------------------------------------------------- Find S
level("Find S", { intro: "S is dollars per <b>order</b> (or per production run), no matter how many units are in it. Anything charged per <b>unit</b> is not S." });

add(function (r) {
  const c = r.pick(BUY), a = r.int(10, 60), b = r.money(8, 45), P = r.money(c.P[0], c.P[1]);
  const S = a + b;
  const story = `Each time ${c.name} orders ${c.item}, the purchasing office spends about ${usd(a)} of staff time on paperwork, and the supplier adds a flat ${usd2(b)} delivery charge to the invoice. The ${c.units} themselves cost ${usd2(P)} each.`;
  return N({
    story, ask: `What is <b>S</b>, the ordering cost per order? ${R2}`, answer: S, unit: "$",
    hints: ["S includes every cost that happens once per ORDER.", "The per-unit price is not part of S."],
    steps: [`Both the paperwork and the delivery charge happen once per order.`, `S = ${usd(a)} + ${usd2(b)} = <b>${usd2(S)}</b>.`],
    mistakes: [[a, "Add the delivery charge too: it's also charged once per order."], [b, "Add the paperwork cost too: it also happens once per order."], [a + b + P, "The unit price is charged per unit, not per order, so it isn't part of S."]],
  });
});

add(function (r) {
  const c = r.pick(MAKE), w = r.int(2, 4), hr = r.pick([0.5, 1, 1.5, 2, 2.5]), rate = r.money(15, 32), sup = r.int(10, 80);
  const S = w * hr * rate + sup;
  const story = `Before each production run of ${c.item}, ${c.name} needs ${w} workers for ${hr} ${plural(hr, "hour", "hours")} to clean and reset the line. Each worker earns ${usd2(rate)} per hour, and every changeover also uses ${usd(sup)} in cleaning supplies.`;
  return N({
    story, ask: `What is <b>S</b>, the setup cost per production run? ${R2}`, answer: S, unit: "$",
    hints: ["Find the labor cost of one changeover: workers × hours × wage.", "Then add the supplies used per changeover."],
    steps: [`Labor = ${w} × ${hr} × ${usd2(rate)} = ${usd2(w * hr * rate)}.`, `S = ${usd2(w * hr * rate)} + ${usd(sup)} = <b>${usd2(S)}</b>.`],
    mistakes: [[w * hr * rate, `Add the ${usd(sup)} in supplies.`], [hr * rate + sup, `There are ${w} workers, so multiply the labor by ${w}.`], [w * rate + sup, `Each worker spends ${hr} hours, so multiply by ${hr} too.`]],
  });
});

add(function (r) {
  const c = r.pick(BUY), n = r.int(8, 40), S0 = r.money(20, 90), tot = r2(S0 * n);
  const S = tot / n;
  const story = `Last year, ${c.name} placed ${n} orders for ${c.item}. The finance office says all the work of placing and receiving those orders cost ${usd2(tot)} in total for the year.`;
  return N({
    story, ask: `What is <b>S</b>, the cost per order? ${R2}`, answer: S, unit: "$",
    hints: ["S is per ORDER. The total here is for the whole year."],
    steps: [`S = ${usd2(tot)} ÷ ${n} orders = <b>${usd2(S)}</b> per order.`],
    mistakes: [[tot, "That's the total for the year. S is the cost of ONE order."], [tot * n, "Divide by the number of orders."]],
  });
});

add(function (r) {
  const c = r.pick(BUY), f = r.money(15, 75), ship = r.money(0.05, 0.9);
  const story = `${c.name}'s supplier charges a flat ${usd2(f)} handling fee on every order of ${c.item}, plus ${usd2(ship)} per unit for shipping.`;
  return N({
    story, ask: `What is <b>S</b>, the ordering cost per order? ${R2}`, answer: f, unit: "$",
    hints: ["Which charge stays the same no matter how many units you order?", "A per-unit charge grows with the order size, so it isn't S."],
    steps: [`The ${usd2(f)} fee is the same for every order, so S = <b>${usd2(f)}</b>.`, `The ${usd2(ship)} per unit acts like part of the price, not S.`],
    mistakes: [[f + ship, `The ${usd2(ship)} is charged per UNIT, so it isn't part of S.`], [ship, "That's per unit. S is the cost per order."]],
  });
});

add(function (r) {
  const c = r.pick(MAKE), h = r.pick([0.5, 1, 1.5, 2, 3]), dc = r.int(40, 180), t = r.money(10, 90);
  const S = h * dc + t;
  const story = `Switching ${c.name}'s line over to ${c.item} takes ${h} ${plural(h, "hour", "hours")}. Every hour the line sits idle costs ${usd(dc)} in wages and lost output. After each changeover, the first few ${c.units} (worth ${usd2(t)}) are scrapped as a test run.`;
  return N({
    story, ask: `What is <b>S</b>, the setup cost per run? ${R2}`, answer: S, unit: "$",
    hints: ["Add up everything that happens once per changeover.", "Idle time cost = hours × cost per hour."],
    steps: [`Idle time = ${h} × ${usd(dc)} = ${usd2(h * dc)}.`, `S = ${usd2(h * dc)} + ${usd2(t)} = <b>${usd2(S)}</b>.`],
    mistakes: [[h * dc, `Add the ${usd2(t)} test run too.`], [dc + t, `The line is idle ${h} hours, so multiply ${usd(dc)} by ${h}.`]],
  });
});

// ---------------------------------------------------------------- Find d, p, L, ss
level("Find d, p, and L", { intro: "Little letters are <b>daily</b> numbers: d is daily demand, p is daily production. L (lead time) and ss (safety stock) are used for the reorder point." });

add(function (r) {
  const c = r.pick(BUY), M = r.step(c.M[0], c.M[1], c.M[2]), days = r.pick(DAYS);
  const d = (M * 12) / days;
  const story = `${c.name} uses ${n0(M)} ${c.item} a month and is open ${days} days a year.`;
  return N({
    story, ask: `What is <b>d</b>, the daily demand? ${R2}`, answer: d, unit: c.units + "/day",
    hints: ["d = D ÷ working days per year. Find D (annual) first.", `D = ${n0(M)} × 12.`],
    steps: [`D = ${n0(M)} × 12 = ${n0(M * 12)}.`, `d = ${n0(M * 12)} ÷ ${days} = <b>${n2(d)}</b> ${c.units} per day.`],
    mistakes: [[M / 30, "Use the actual days open per year: d = D ÷ working days."], [(M * 12) / 365, `They're open ${days} days, not 365.`], [M / days, "Convert to annual demand first (× 12), then divide by days open."]],
  });
});

add(function (r) {
  const c = r.pick(BUY.concat(MAKE)), dpw = r.pick([5, 6]), w = r.step(100, 3000, 10);
  const d = w / dpw;
  const story = `${c.name} goes through ${n0(w)} ${c.item} per week. It's open ${dpw} days a week.`;
  return N({
    story, ask: `What is <b>d</b>, the daily demand? ${R2}`, answer: d, unit: c.units + "/day",
    hints: ["Daily demand means per working day. How many days a week is it open?"],
    steps: [`d = ${n0(w)} ÷ ${dpw} = <b>${n2(d)}</b> ${c.units} per day.`],
    mistakes: [[w / 7, `It's only open ${dpw} days a week.`], [w * dpw, "Divide by days, don't multiply."]],
  });
});

add(function (r) {
  const c = r.pick(MAKE), uph = r.int(15, 140), hrs = r.pick([7.5, 8, 10]), sh = r.pick([1, 2, 3]);
  const p = uph * hrs * sh;
  const story = `${c.name}'s line produces ${uph} ${c.item} per hour. Each shift is ${hrs} hours, and the plant runs ${sh} ${plural(sh, "shift", "shifts")} a day.`;
  return N({
    story, ask: `What is <b>p</b>, the daily production rate? ${R2}`, answer: p, unit: c.units + "/day",
    hints: ["p is per DAY. Build from per hour to per shift to per day."],
    steps: [`Per shift = ${uph} × ${hrs} = ${nn(uph * hrs)}.`, `p = ${nn(uph * hrs)} × ${sh} = <b>${nn(p)}</b> ${c.units} per day.`],
    mistakes: [[uph * hrs, sh > 1 ? `That's one shift. The plant runs ${sh} shifts a day.` : "Hmm, check the shift count."], [uph * sh, `Each shift is ${hrs} hours.`], [uph, "That's per hour. p is per day."]],
  });
});

add(function (r) {
  const c = r.pick(MAKE), dpw = r.pick([5, 6]), cap = r.step(500, 20000, 50);
  const p = cap / dpw;
  const story = `${c.name} can produce ${n0(cap)} ${c.item} in a week when the line runs ${dpw} days a week.`;
  return N({
    story, ask: `What is <b>p</b>, the daily production rate? ${R2}`, answer: p, unit: c.units + "/day",
    hints: ["Divide the weekly capacity by the days the line actually runs."],
    steps: [`p = ${n0(cap)} ÷ ${dpw} = <b>${n2(p)}</b> ${c.units} per day.`],
    mistakes: [[cap / 7, `The line runs ${dpw} days a week, not 7.`], [cap, "That's weekly. p is daily."]],
  });
});

add(function (r) {
  const c = r.pick(BUY), dpw = r.pick([5, 6]), wks = r.int(2, 4);
  const L = dpw * wks;
  const story = `${c.name} is open ${dpw} days a week. When ${r.pick(FIRST)} orders ${c.item}, it takes ${wks} weeks for the delivery to arrive. Daily demand is counted per working day.`;
  return N({
    story, ask: `What is <b>L</b>, the lead time in <b>working days</b>?`, answer: L, unit: "days",
    hints: ["Lead time should match daily demand: both in working days.", `Each week has ${dpw} working days.`],
    steps: [`L = ${wks} weeks × ${dpw} working days = <b>${L}</b> working days.`],
    mistakes: [[wks * 7, `Count working days only: ${dpw} per week.`], [wks, "That's in weeks. Convert to working days."]],
  });
});

add(function (r) {
  const c = r.pick(BUY), D = r.step(5000, 60000, 250), days = r.pick([250, 300, 310, 350]), k = r.int(2, 5);
  const d = D / days, ss = d * k;
  const story = `${c.name} uses ${n0(D)} ${c.item} a year over ${days} working days. Because deliveries sometimes run late, the ${c.role} keeps ${k} extra days' worth of demand on hand as a cushion.`;
  return N({
    story, ask: `What is <b>ss</b>, the safety stock in ${c.units}? ${R2}`, answer: ss, unit: c.units,
    hints: ["Safety stock here is measured in days of demand. Find daily demand first.", `d = D ÷ ${days}. Then multiply by ${k} days.`],
    steps: [`d = ${n0(D)} ÷ ${days} = ${n2(d)} per day.`, `ss = ${n2(d)} × ${k} = <b>${n2(ss)}</b> ${c.units}.`],
    mistakes: [[k, `That's days of cushion. Convert it to ${c.units}: × daily demand.`], [d, `That's one day. The cushion is ${k} days.`], [(D / 365) * k, `Use the ${days} working days, not 365.`]],
  });
});

// ---------------------------------------------------------------- Find Q and N
level("Find Q and N", { intro: "Stories often describe the <b>current</b> ordering policy without saying \"Q.\" \"Orders every two weeks\" or \"orders 8 times a year\" tells you Q if you know demand." });

add(function (r) {
  const c = r.pick(BUY), w = r.step(50, 2000, 10), k = r.pick([2, 3, 4]);
  const story = `${c.name} uses about ${n0(w)} ${c.item} per week. ${r.pick(FIRST)}, the ${c.role}, places an order every ${k} weeks, and each order covers exactly the ${c.units} needed until the next order.`;
  return N({
    story, ask: `What is the current order quantity, <b>Q</b>?`, answer: w * k, unit: c.units,
    hints: [`Each order has to last ${k} weeks.`],
    steps: [`Q = ${n0(w)} per week × ${k} weeks = <b>${n0(w * k)}</b> ${c.units} per order.`],
    mistakes: [[w, `Each order lasts ${k} weeks, not one.`], [w * 52, "That's a full year. One order only covers the time until the next order."], [(w * 52) / k, `That splits a full year by ${k}. One order covers ${k} WEEKS: weekly use × ${k}.`]],
  });
});

add(function (r) {
  const c = r.pick(BUY), Nn = r.pick([4, 5, 6, 8, 10, 12, 15, 16, 20, 24]), D = r.step(2000, 80000, 100);
  const story = `${c.name} needs ${n0(D)} ${c.item} a year and places ${Nn} equal-size orders each year.`;
  return N({
    story, ask: `What is <b>Q</b>, the number of ${c.units} in each order? ${R2}`, answer: D / Nn, unit: c.units,
    hints: ["N = D ÷ Q, so Q = D ÷ N."],
    steps: [`Q = D ÷ N = ${n0(D)} ÷ ${Nn} = <b>${nn(D / Nn)}</b> ${c.units}.`],
    mistakes: [[D * Nn, "Divide annual demand by the number of orders."], [Nn, "That's the number of orders (N), not the size of each one."]],
  });
});

add(function (r) {
  const c = r.pick(BUY), M = r.step(c.M[0], c.M[1], c.M[2]);
  const story = `On the first of every month, ${c.name} orders exactly enough ${c.item} to cover that month. Monthly demand is steady at ${n0(M)} ${c.units}, which is ${n0(M * 12)} a year.`;
  return N({
    story, ask: `What is the current order quantity, <b>Q</b>?`, answer: M, unit: c.units,
    hints: ["How much does one order need to cover?"],
    steps: [`One order covers one month, so Q = <b>${n0(M)}</b> ${c.units}.`],
    mistakes: [[M * 12, "That's D (a full year). One order only covers one month."], [12, "That's N, the number of orders per year."]],
  });
});

add(function (r) {
  const c = r.pick(BUY), D = r.step(3000, 60000, 100), days = r.pick([250, 300, 350]), k = r.pick([10, 15, 20, 25, 30]);
  const d = D / days, Q = d * k;
  const story = `${c.name} uses ${n0(D)} ${c.item} a year and is open ${days} days a year. Each order is sized to last exactly ${k} working days.`;
  return N({
    story, ask: `What is the order quantity, <b>Q</b>? ${R2}`, answer: Q, unit: c.units,
    hints: ["Find daily demand first: d = D ÷ days open.", `Then one order = ${k} days of demand.`],
    steps: [`d = ${n0(D)} ÷ ${days} = ${n2(d)}.`, `Q = ${n2(d)} × ${k} = <b>${n2(Q)}</b> ${c.units}.`],
    mistakes: [[(D / 365) * k, `Use the ${days} working days, not 365.`], [d, `That's one day. Each order lasts ${k} days.`]],
  });
});

add(function (r) {
  const c = r.pick(BUY), k = r.pick([2, 3, 4]), closed = r.pick([0, 1, 4]), W = 52 - closed;
  const story = `${c.name} is open ${W} weeks a year${closed ? ` (closed ${closed} ${plural(closed, "week", "weeks")})` : ""} and places an order for ${c.item} every ${k} weeks while open.`;
  return N({
    story, ask: `What is <b>N</b>, the number of orders per year? ${R2}`, answer: W / k, unit: "orders",
    hints: ["How many times does a " + k + "-week cycle fit in the weeks open?"],
    steps: [`N = ${W} ÷ ${k} = <b>${nn(W / k)}</b> orders per year.`],
    mistakes: [[52 / k, closed ? `They're only open ${W} weeks.` : "Hmm, check the weeks."], [W * k, "Divide the weeks by the cycle length."]],
  });
});

// ---------------------------------------------------------------- Which model and what's extra
level("Which Model? What's Extra?", { intro: "Buying it? Use EOQ. Making it while selling it? Use EPQ. Then spot the numbers you don't need: exam stories add extras on purpose." });

add(function (r) {
  const buyIt = r.chance(0.5);
  const story = buyIt
    ? (() => { const c = r.pick(BUY); return `${c.name} buys ${c.item} from an outside supplier. Each order arrives all at once on a single truck. ${r.pick(FIRST)} knows the annual demand, the cost of placing an order, and the holding cost per ${c.unit}.`; })()
    : (() => { const c = r.pick(MAKE); return `${c.name} makes its own ${c.item}. While a batch is being produced, ${c.units} are also being shipped to customers, so inventory builds up gradually. The plant can make more per day than customers buy per day.`; })();
  return C({
    story, ask: "Which model should you use to find the best quantity?",
    choices: [{ t: "EOQ (economic order quantity)", ok: buyIt, note: buyIt ? null : "EOQ assumes the whole order arrives at once. Here units are made and used at the same time." }, { t: "EPQ (production order quantity)", ok: !buyIt, note: !buyIt ? null : "EPQ is for when the business produces the item and uses or sells it during production." }, { t: "Reorder point (ROP)", ok: false, note: "ROP answers WHEN to order, not how much." }, { t: "ABC analysis", ok: false, note: "ABC classifies items by annual dollar volume. It doesn't set order sizes." }],
    why: "EOQ: the item is purchased and the whole order arrives at once. EPQ: the item is produced and used or sold while production is happening, so inventory builds up gradually.",
  });
});

add(function (r) {
  const m = r.pick(MAKE), b = r.pick(BUY.filter((x) => x.resell));
  const story = `${b.name} sells a gift item made by ${m.name}. ${m.name} can produce ${n0(r.int(300, 1500))} per day. When ${b.name} places an order, the whole order is delivered on one truck. ${r.pick(FIRST)} at ${b.name} wants the best order size.`;
  return C({
    story, ask: `Which model fits ${b.name}'s decision?`,
    choices: [{ t: "EOQ, because the store buys the item and each order arrives all at once", ok: true }, { t: "EPQ, because a production rate is given", ok: false, note: "The production rate belongs to the supplier. The store itself doesn't produce anything; its order arrives all at once." }, { t: "EPQ, because the item is manufactured", ok: false, note: "Almost everything is manufactured by someone. What matters is whether THIS business makes it while using it." }, { t: "Neither: you need ABC analysis", ok: false, note: "ABC classifies items. It doesn't size orders." }],
    why: "Don't pick EPQ just because you see a production rate. Ask: does the business in the question make the item while selling it? A store that receives full orders on a truck uses EOQ.",
  });
});

add(function (r) {
  const x = buy(r, { dm: "year", hm: "dollar" });
  const c = x.c, sell = r2(x.P * (1.5 + r.next()));
  const story = `${c.name} uses ${n0(x.D)} ${c.units} a year. Each order costs ${usd(x.S)}. Holding a ${c.unit} for a year costs ${usd2(x.H)}. Orders take ${x.L} days to arrive. ${c.resell ? `${c.name} sells each ${c.unit} for ${usd2(sell)}.` : `The storeroom can hold ${n0(nice(x.Qs * 4))} ${c.units}.`}`;
  const extra = c.resell ? `The selling price (${usd2(sell)})` : `The storeroom capacity`;
  return C({
    story, ask: "Which number is NOT needed to find Q* with the EOQ formula?",
    choices: [{ t: `The lead time (${x.L} days)`, ok: true }, { t: `Annual demand (${n0(x.D)})`, ok: false, note: "D is in the EOQ formula: Q* = √(2DS ÷ H)." }, { t: `Ordering cost (${usd(x.S)})`, ok: false, note: "S is in the EOQ formula." }, { t: `Holding cost (${usd2(x.H)})`, ok: false, note: "H is in the EOQ formula." }],
    why: `Q* = √(2DS ÷ H) only needs D, S, and H. Lead time is used for the reorder point (when to order), not Q*. ${extra} isn't needed either.`,
  });
});

add(function (r) {
  const x = make(r, { dm: "day", hm: "dollar" });
  const story = `${x.c.name} sells ${n0(x.d)} ${x.c.units} a day and can make ${n0(x.p)} a day, ${x.days} days a year. Setup costs ${usd(x.S)} per run. Holding costs ${usd2(x.H)} per ${x.c.unit} per year. Raw materials take ${r.int(3, 10)} days to arrive.`;
  return C({
    story, ask: "Which number is NOT needed to find the EPQ (Q*p)?",
    choices: [{ t: "The raw material delivery time", ok: true }, { t: `The production rate (${n0(x.p)}/day)`, ok: false, note: "p is in the EPQ formula: the (1 − d/p) part." }, { t: `The setup cost (${usd(x.S)})`, ok: false, note: "S is in the EPQ formula." }, { t: `The days per year (${x.days})`, ok: false, note: "You need the days to turn daily demand into annual demand D." }],
    why: "EPQ needs D, S, H, d, and p. The days per year are needed to get D from d. Delivery (lead) time doesn't appear in the EPQ formula.",
  });
});

add(function (r) {
  const lb = r.pick([20, 25, 40, 50]);
  return C({
    story: `A garden company tracks demand in pounds: ${n0(r.step(5000, 50000, 1000))} lbs. a week. Holding cost is quoted as ${usd2(r.money(0.4, 2))} per ${lb}-lb. bag per year.`,
    ask: "Before using the formulas, what should you do with H?",
    choices: [{ t: `Divide H by ${lb} to get the holding cost per pound`, ok: true }, { t: `Multiply H by ${lb}`, ok: false, note: "That would be the cost to hold " + lb + " bags, not one pound." }, { t: "Nothing: use H as given", ok: false, note: "D is in pounds and H is per bag. The units have to match." }, { t: "Divide H by 52 because demand is weekly", ok: false, note: "H is already per year. The weekly part is about D." }],
    why: "D and H must use the same unit. If demand is in pounds, H must be per pound: H per lb. = H per bag ÷ pounds per bag. (Converting D to bags instead would also work, as long as everything matches.)",
  });
});

add(concept({
  q: ["To find the reorder point (with no safety stock), which two numbers do you need?", "A manager wants to know WHEN to reorder. Which numbers go into the reorder point formula (no safety stock)?"],
  a: "Daily demand (d) and lead time (L)",
  w: [["Q* and H", "Those are about how much to order and holding cost."], ["Annual demand (D) and setup cost (S)", "Those go into Q*, the how-much question."], ["Production rate (p) and daily demand (d)", "Those go into EPQ."]],
  why: "ROP = d × L (plus ss if there's safety stock). The reorder point answers WHEN to order.",
}));

// ---------------------------------------------------------------- Gauntlet
level("Variable Gauntlet", { intro: "Long stories with every variable hidden in them, plus extras you don't need. Each question asks for one variable." });

function gauntlet(target) {
  return function (r) {
    const retail = target === "L" ? true : target === "p" ? false : r.chance(0.5);
    if (retail) {
      const c = r.pick(CUSTS), who = r.pick(FIRST);
      const n = r.step(120, 600, 20), pct = r.pick([20, 25, 40, 50, 60, 75]), closed = r.int(1, 3), W = 52 - closed, dpw = r.pick([5, 6]);
      const P = r.money(1.5, 12), SP = r2(P * (1.8 + r.next())), I = r.pick([15, 20, 25, 30, 35]);
      const fee = r.int(15, 50), dfee = r.money(10, 40), lw = r.int(1, 3), j = r.pick([2, 3, 4]);
      const wk = n * (pct / 100), D = wk * W, H = (P * I) / 100, S = fee + dfee, d = D / (dpw * W), L = lw * dpw, Q = wk * j;
      const story = `${who} manages ${c.name}, which sees about ${n0(n)} ${c.who} each week. Roughly ${pct}% of them ${c.buy}. ${c.name} is open ${dpw} days a week but closes for ${closed} ${plural(closed, "week", "weeks")} a year. Each ${c.unit} costs ${usd2(P)} from the supplier and is priced at ${usd2(SP)} for customers. Carrying a ${c.unit} for a year costs ${I}% of what ${c.name} pays for it. Every order costs ${usd(fee)} in staff time plus a ${usd2(dfee)} delivery fee. Orders take ${lw} ${plural(lw, "week", "weeks")} to arrive. Right now, ${who} orders every ${j} weeks, just enough to cover those ${j} weeks.`;
      const T = {
        D: { ask: `What is <b>D</b>, the annual demand for ${c.units}? ${R2}`, a: D, unit: c.units, steps: [`Weekly = ${n0(n)} × ${pct / 100} = ${nn(wk)}.`, `Weeks open = 52 − ${closed} = ${W}.`, `D = ${nn(wk)} × ${W} = <b>${nn(D)}</b>.`], ms: [[n * W, `Only ${pct}% buy one.`], [wk * 52, `Closed ${closed} ${plural(closed, "week", "weeks")}: use ${W}.`]] },
        H: { ask: `What is <b>H</b>, the holding cost per ${c.unit} per year? ${R2}`, a: H, unit: "$", steps: [`H = ${I / 100} × ${usd2(P)} (the purchase price) = <b>${usd2(H)}</b>.`], ms: [[(SP * I) / 100, "Use the purchase price, not the customer price."], [I, "Turn the percent into dollars."]] },
        S: { ask: `What is <b>S</b>, the cost per order? ${R2}`, a: S, unit: "$", steps: [`S = ${usd(fee)} + ${usd2(dfee)} = <b>${usd2(S)}</b>.`], ms: [[fee, "Add the delivery fee too."], [dfee, "Add the staff time too."]] },
        d: { ask: `What is <b>d</b>, the daily demand (per day open)? ${R2}`, a: d, unit: c.units + "/day", steps: [`D = ${nn(wk)} × ${W} = ${nn(D)}.`, `Days open = ${dpw} × ${W} = ${dpw * W}.`, `d = ${nn(D)} ÷ ${dpw * W} = <b>${n2(d)}</b>.`], ms: [[wk / 7, `Open ${dpw} days a week.`], [D / 365, "Use days open, not 365."]] },
        L: { ask: `What is <b>L</b>, the lead time in working days?`, a: L, unit: "days", steps: [`L = ${lw} × ${dpw} = <b>${L}</b> working days.`], ms: [[lw * 7, `Count working days: ${dpw} per week.`], [lw, "Convert weeks to working days."]] },
        Q: { ask: `What is the current order quantity, <b>Q</b>? ${R2}`, a: Q, unit: c.units, steps: [`Weekly = ${nn(wk)}.`, `Q = ${nn(wk)} × ${j} = <b>${nn(Q)}</b>.`], ms: [[n * j, `Only ${pct}% buy one.`], [wk, `Each order covers ${j} weeks.`]] },
      }[target];
      return N({ story, ask: T.ask, answer: T.a, unit: T.unit, steps: T.steps, mistakes: T.ms, hints: ["Underline the sentence that talks about this variable. Ignore everything else.", "Convert to the units the variable needs (annual, per unit, per order, per day)."] });
    }
    const c = r.pick(MAKE), who = r.pick(FIRST);
    const M = r.step(c.d[0] * 20, c.d[1] * 20, 100), dpw = r.pick([5, 6]), W = r.int(48, 52), uph = r.int(20, 200), hrs = 8, sh = r.pick([1, 2]);
    const mth = r.money(0.05, 0.5), crew = r.int(2, 4), hr = r.pick([1, 1.5, 2]), wage = r.money(16, 30), sup = r.int(20, 90), t = r.int(2, 6);
    const D = M * 12, days = dpw * W, d = D / days, p = uph * hrs * sh, H = mth * 12, S = crew * hr * wage + sup, Q = p * t;
    const story = `${who} runs production at ${c.name}. Customers order about ${n0(M)} ${c.item} a month. The plant runs ${dpw} days a week, ${W} weeks a year, with ${sh} eight-hour ${plural(sh, "shift", "shifts")} a day, and the line turns out ${uph} ${c.units} per hour. Storing a finished ${c.unit} costs ${usd2(mth)} per month. Each changeover takes a crew of ${crew} people ${hr} ${plural(hr, "hour", "hours")} at ${usd2(wage)} an hour, plus ${usd(sup)} in supplies. Each production run lasts ${t} days. Raw materials arrive ${r.int(3, 9)} days after ordering.`;
    const T = {
      D: { ask: `What is <b>D</b>, the annual demand? ${R2}`, a: D, unit: c.units, steps: [`D = ${n0(M)} × 12 = <b>${n0(D)}</b>.`], ms: [[M, "That's monthly."], [M * W, "Demand is monthly: × 12."]] },
      H: { ask: `What is <b>H</b>, the holding cost per ${c.unit} per year? ${R2}`, a: H, unit: "$", steps: [`H = ${usd2(mth)} × 12 = <b>${usd2(H)}</b>.`], ms: [[mth, "That's per month."]] },
      S: { ask: `What is <b>S</b>, the setup cost per run? ${R2}`, a: S, unit: "$", steps: [`Labor = ${crew} × ${hr} × ${usd2(wage)} = ${usd2(crew * hr * wage)}.`, `S = ${usd2(crew * hr * wage)} + ${usd(sup)} = <b>${usd2(S)}</b>.`], ms: [[crew * hr * wage, "Add the supplies."], [hr * wage + sup, `Multiply labor by the crew of ${crew}.`]] },
      d: { ask: `What is <b>d</b>, the daily demand (per operating day)? ${R2}`, a: d, unit: c.units + "/day", steps: [`D = ${n0(M)} × 12 = ${n0(D)}.`, `Operating days = ${dpw} × ${W} = ${days}.`, `d = ${n0(D)} ÷ ${days} = <b>${n2(d)}</b>.`], ms: [[D / 365, "Use operating days, not 365."], [M / 30, "Find D first, then divide by operating days."]] },
      p: { ask: `What is <b>p</b>, the daily production rate? ${R2}`, a: p, unit: c.units + "/day", steps: [`p = ${uph} × 8 × ${sh} = <b>${n0(p)}</b>.`], ms: [[uph * 8, sh > 1 ? "Two shifts a day." : "Check shifts."], [uph, "That's per hour."]] },
      Q: { ask: `How many ${c.units} are made in each production run (<b>Q</b>)? ${R2}`, a: Q, unit: c.units, steps: [`p = ${uph} × 8 × ${sh} = ${n0(p)} per day.`, `Q = ${n0(p)} × ${t} days = <b>${n0(Q)}</b>.`], ms: [[uph * 8 * t, sh > 1 ? "Two shifts a day." : "Check shifts."], [p, `A run lasts ${t} days.`], [d * t, "During a run, the line makes p per day. Use p, not d."]] },
    }[target];
    return N({ story, ask: T.ask, answer: T.a, unit: T.unit, steps: T.steps, mistakes: T.ms, hints: ["Underline the sentence that talks about this variable. Ignore everything else.", "Convert to the units the variable needs (annual, per unit, per run, per day)."] });
  };
}
["D", "H", "S", "d", "L", "p", "Q"].forEach((t) => add(gauntlet(t)));

// ================================================================== PART 2: SUPPLY CHAIN CONCEPTS (Ch. 11)
part(2, "Supply Chain Concepts (Ch. 11)", "Strategy, the six sourcing strategies, risk, the bullwhip effect, integration tools, suppliers, logistics, and sustainability.");

const SOURCING = ["Many suppliers", "Few suppliers", "Vertical integration", "Joint venture", "Keiretsu network", "Virtual company"];
const SOURCING_NOTES = {
  "Many suppliers": "Many suppliers: buy mostly on price from suppliers who compete, common for commodities.",
  "Few suppliers": "Few suppliers: long-term relationships with a small group, gaining economies of scale and learning, but switching is very costly.",
  "Vertical integration": "Vertical integration: making a good or service you used to buy, moving forward (toward customers) or backward (toward suppliers).",
  "Joint venture": "Joint venture: a formal collaboration where firms pool resources but stay separate companies.",
  "Keiretsu network": "Keiretsu: a Japanese middle ground between few suppliers and vertical integration; the buyer often supports suppliers with ownership or loans.",
  "Virtual company": "Virtual company: relies on many supplier relationships to provide services on demand, with fluid boundaries and low capital investment.",
};

level("Strategy & Sourcing");
add(concept({
  v: [
    { q: "A discount grocery chain competes by having the lowest prices in town. What is its PRIMARY supplier selection criterion?", a: "Cost" },
    { q: "A same-day delivery company wins customers by being faster than anyone. What matters most when it picks suppliers?", a: "Capacity, speed, and flexibility" },
    { q: "A tech company wins on unique, cutting-edge products. What matters most when it picks suppliers?", a: "Product development skills and willingness to share information" },
  ],
  pool: ["Cost", "Capacity, speed, and flexibility", "Product development skills and willingness to share information", "Selling through discount distributors"],
  notes: { "Cost": "Cost is the top criterion for a LOW-COST strategy.", "Capacity, speed, and flexibility": "Those are the criteria for a RESPONSE strategy.", "Product development skills and willingness to share information": "Those are the criteria for a DIFFERENTIATION strategy.", "Selling through discount distributors": "That's a distribution choice for low-cost firms, not a supplier selection criterion." },
  why: "Table 11.2: low-cost strategy → pick suppliers on cost. Response → capacity, speed, flexibility. Differentiation → product development skills, sharing information, jointly developing products.",
}));
add(concept({
  q: "A fashion retailer's strategy is RESPONSE: get new styles into stores faster than competitors. Which supply chain choice fits?",
  a: "Use buffer stocks and fast transportation to ensure speedy supply",
  w: [["Minimize inventory to hold down costs and ship by the cheapest method", "That fits a low-cost strategy."], ["Choose suppliers mainly for their product development skills", "That's the differentiation criterion."], ["Sell mainly through discount distributors", "That fits a low-cost strategy."]],
  why: "Response strategies use buffer stocks to ensure speedy supply, fast transportation, and suppliers chosen for capacity, speed, and flexibility.",
}));
add(concept({
  v: [
    { q: "A coffee roaster buys the farms that grow its beans. What is this?", a: "Backward integration" },
    { q: "A furniture maker buys the lumber mill that supplies its wood. What is this?", a: "Backward integration" },
    { q: "A paint manufacturer opens its own chain of retail paint stores. What is this?", a: "Forward integration" },
    { q: "A tire company buys a chain of auto service centers that sells its tires to drivers. What is this?", a: "Forward integration" },
  ],
  pool: ["Backward integration", "Forward integration", "Joint venture", "Keiretsu network"],
  notes: { "Backward integration": "Backward = moving toward your SUPPLIERS (upstream).", "Forward integration": "Forward = moving toward your CUSTOMERS (downstream).", "Joint venture": "A joint venture is a collaboration between separate firms, not owning another stage of the chain.", "Keiretsu network": "A keiretsu is a supplier coalition, not owning the next stage outright." },
  why: "Vertical integration means producing what you used to buy. Toward suppliers (raw materials) = backward. Toward the end customer = forward.",
}));
add(concept({
  v: [
    { q: "A company sits in the middle ground between using a few suppliers and full vertical integration. Its suppliers are part of a coalition, and the company often supports them with loans or partial ownership. Which sourcing strategy is this?", a: "Keiretsu network" },
    { q: "A startup has no factories or warehouses. It relies on a web of outside partners for design, manufacturing, and shipping as needed, with very low capital investment. Which sourcing strategy is this?", a: "Virtual company" },
    { q: "Two hospital systems form a jointly owned company to run a shared laundry facility, but stay separate organizations. Which sourcing strategy is this?", a: "Joint venture" },
    { q: "A restaurant chain signs long-term deals with a small group of produce suppliers, who then help with menu testing and join its JIT program. Which sourcing strategy is this?", a: "Few suppliers" },
    { q: "A university buys plain copy paper from whichever vendor bids lowest each semester. Which sourcing strategy is this?", a: "Many suppliers" },
  ],
  pool: SOURCING, notes: SOURCING_NOTES,
  why: "The six sourcing strategies: many suppliers, few suppliers, vertical integration, joint ventures, keiretsu networks, and virtual companies.",
}));
add(concept({
  q: ["Which of these is NOT one of the six sourcing strategies?", "A classmate lists sourcing strategies. Which one doesn't belong?"],
  a: ["Postponement", "Blanket ordering", "Cross-docking"],
  w: ["Keiretsu networks", "Virtual companies", "Vertical integration", "Few suppliers", "Joint ventures"],
  why: "The six sourcing strategies are many suppliers, few suppliers, vertical integration, joint ventures, keiretsu networks, and virtual companies. Postponement and blanket ordering are supply chain integration tools; cross-docking is a warehouse function.",
}));
add(concept({
  q: "When is vertical integration especially risky?",
  a: "In industries with rapid technological change",
  w: [["When demand is stable and predictable", "Stable demand actually helps vertical integration pay off."], ["When the firm has plenty of capital and managerial skill", "Those are things vertical integration requires, so having them lowers risk."], ["When the product is a simple commodity", "That's when 'many suppliers' is common."]],
  why: "Vertical integration can improve cost, quality, and inventory, but it requires capital, managerial skill, and demand, and it's risky when technology changes fast.",
}));
add(concept({
  q: "What is the main downside of the FEW suppliers strategy?",
  a: "The cost of changing suppliers is huge",
  w: [["Suppliers compete only on price", "That describes many suppliers."], ["Suppliers won't share design expertise", "Few-supplier partners are MORE willing to share expertise and join JIT programs."], ["It requires buying the suppliers", "That's vertical integration."]],
  why: "Few suppliers create value through long-term relationships, economies of scale, and learning curves, but switching suppliers becomes very costly.",
}));

level("Risk & the Bullwhip");
add(concept({
  q: "How does relying on FEWER suppliers affect supply chain risk?",
  a: "It increases dependence on each supplier, which increases risk",
  w: [["It removes political and currency risk", "Those risks come from globalization, not the number of suppliers."], ["It always lowers risk because relationships are closer", "Closer relationships help, but fewer suppliers still means more dependence."], ["It has no effect on risk", "Fewer suppliers means more dependence."]],
  why: "More reliance on supply chains means more risk. Fewer suppliers increase dependence, and globalization and logistics complexity add to it.",
}));
add(concept({
  q: "Which of these is a supply chain risk mitigation tactic?",
  a: ["Diversify the supplier base", "Prepare responses to negative events ahead of time", "Research and assess possible risks"],
  w: [["Move all purchasing to one low-cost overseas supplier", "That increases dependence and risk."], ["Eliminate all tracking to cut costs", "Tracking helps security and expediting."], ["Ignore suppliers' financial health", "Assessing risk is part of mitigation."]],
  why: "Mitigation tactics include researching and assessing risks, innovative planning, preparing responses to negative events, and flexible, secure supply chains with a diversified supplier base.",
}));
add(concept({
  story: "A small bump in toothpaste sales leads stores to order 10% more than usual. The distributor, seeing bigger orders, orders 25% more. The manufacturer schedules 50% more production.",
  ask: "What is happening?",
  q: "What is happening?",
  a: "The bullwhip effect",
  w: [["Postponement", "Postponement delays customization as long as possible."], ["Drop shipping", "Drop shipping sends goods directly from the supplier to the customer."], ["Channel assembly", "Channel assembly is a warehouse assembling products from components."]],
  why: "The bullwhip effect: order fluctuations get bigger at each step as orders are relayed from retailers to distributors to wholesalers to manufacturers, caused by distorted information.",
}));
add(concept({
  q: ["Which is a RESULT of the bullwhip effect?", "What does the bullwhip effect do to a supply chain?"],
  a: ["Unstable production schedules and higher inventory costs", "Expensive capacity changes and longer lead times"],
  w: [["Lower inventory costs at every stage", "It increases inventory costs."], ["More accurate forecasts upstream", "It distorts information upstream."], ["Shorter lead times for everyone", "It creates longer lead times."]],
  why: "The bullwhip effect creates unstable production schedules, expensive capacity changes, underutilization, longer lead times, obsolescence, and higher inventory costs. Coordination and planning with suppliers minimize the damage.",
}));
add(concept({
  v: [
    { q: "Each store manager orders whatever makes their own store's numbers look best, without thinking about the rest of the chain. Which integration ISSUE is this?", a: "Local optimization" },
    { q: "A manufacturer offers end-of-quarter discounts, so distributors stock up on product customers haven't bought yet. Which integration ISSUE is this?", a: "Incentives" },
    { q: "A distributor orders a full truckload every time to save on shipping, even though actual sales are much smaller and steadier. Which integration ISSUE is this?", a: "Large lots" },
  ],
  pool: ["Local optimization", "Incentives", "Large lots", "Vendor managed inventory"],
  notes: { "Local optimization": "Local optimization: each part optimizes for itself, which can magnify fluctuations.", "Incentives": "Incentives push merchandise into the chain for sales that haven't happened.", "Large lots": "Large lots cut shipping and production costs but raise holding costs and don't reflect actual sales.", "Vendor managed inventory": "VMI is an OPPORTUNITY (a fix), not an issue." },
  why: "Three issues in managing an integrated supply chain: local optimization, incentives, and large lots. All of them can feed the bullwhip effect.",
}));
add(concept({
  q: "What mainly CAUSES the bullwhip effect?",
  a: "Distorted information as orders move up the supply chain",
  w: [["Customers suddenly buying far less", "It can start with a SMALL change; the problem is how it gets amplified."], ["Suppliers using trucks instead of rail", "Shipping mode isn't the cause."], ["Too much information sharing", "Sharing accurate information reduces it."]],
  why: "The bullwhip effect occurs because of distortions in information as orders are relayed through the supply chain. Sharing accurate pull data helps reduce it.",
}));
add(concept({
  q: "Sensors that report a shipment's location, motion, broken seals, and temperature mainly help with:",
  a: "Security and tracking shipments, so problems can be expedited",
  w: [["Setting the EOQ", "Sensors don't set order sizes."], ["Eliminating the need for warehouses", "They improve monitoring, not storage needs."], ["Choosing a sourcing strategy", "That's a strategic decision, not a tracking tool."]],
  why: "Shipments get misrouted, stolen, damaged, or delayed. Technology like location, motion, seal, and temperature sensors improves security and helps expedite shipments.",
}));

level("Integration Tools");
const OPPS = ["Vendor managed inventory (VMI)", "CPFR", "Blanket order", "Postponement", "Drop shipping", "Standardization", "Blockchain", "Omnichannel strategy"];
const OPP_NOTES = {
  "Vendor managed inventory (VMI)": "VMI: the supplier monitors and replenishes the buyer's inventory.",
  "CPFR": "CPFR: collaborative planning, forecasting, and replenishment across the supply chain.",
  "Blanket order": "Blanket order: a long-term contract with actual orders released against it over time.",
  "Postponement": "Postponement: withhold modification or customization as long as possible.",
  "Drop shipping": "Drop shipping: the supplier ships directly to the end customer, bypassing the seller.",
  "Standardization": "Standardization: reducing the variety of parts or products.",
  "Blockchain": "Blockchain: a shared, tamper-resistant record that aids tracking and verification.",
  "Omnichannel strategy": "Omnichannel: multiple integrated channels of communication and shipping.",
};
add(concept({
  v: [
    { q: "A snack company's rep checks the store's shelves and decides when and how much to restock. The store never places orders itself. Which tool is this?", a: "Vendor managed inventory (VMI)" },
    { q: "A retailer and a manufacturer share sales forecasts and plan replenishment together all year. Which tool is this?", a: "CPFR" },
    { q: "A hospital signs a one-year agreement for 12,000 IV bags, then calls in about 1,000 each month as needed. Which tool is this?", a: "Blanket order" },
    { q: "A paint store keeps only white base paint and mixes in color after the customer chooses. Which tool is this?", a: "Postponement" },
  ],
  pool: OPPS, notes: OPP_NOTES,
  why: "Integration opportunities include accurate pull data, lot size reduction, blanket orders, VMI, CPFR, standardization, postponement, electronic ordering, omnichannel, drop shipping, blockchain, and IoT.",
}));
add(concept({
  v: [
    { q: "An online store forwards each order to the manufacturer, which ships straight to the customer's door. Which tool is this?", a: "Drop shipping" },
    { q: "A phone maker uses the same charging port and battery across every model to cut parts variety. Which tool is this?", a: "Standardization" },
    { q: "A grocery chain records each step of a mango's trip from farm to shelf in a shared, tamper-resistant digital ledger. Which tool is this?", a: "Blockchain" },
    { q: "Customers can order online, pick up in store, or get home delivery, all from one connected system. Which tool is this?", a: "Omnichannel strategy" },
  ],
  pool: OPPS, notes: OPP_NOTES,
  why: "Each of these is an opportunity for managing the integrated supply chain.",
}));
add(concept({
  v: [
    { q: "A laptop maker ships the same base model to regional warehouses and adds the country's keyboard and power cord only after orders come in. Which tool is this?", a: "Postponement" },
    { q: "A distributor gives its supplier access to its warehouse inventory data so the supplier can keep it stocked. Which tool is this?", a: "Vendor managed inventory (VMI)" },
    { q: "A car plant agrees to buy 50,000 seat belts this year at a set price and releases weekly shipments against that contract. Which tool is this?", a: "Blanket order" },
  ],
  pool: OPPS, notes: OPP_NOTES,
  why: "Postponement reduces the risk of making the wrong version. VMI moves replenishment to the supplier. Blanket orders lock in a long-term agreement with releases over time.",
}));
add(concept({
  q: "How does using accurate \"pull\" data (actual point-of-sale data) help a supply chain?",
  a: "It shares real demand information, reducing the distortion that causes the bullwhip effect",
  w: [["It lets each stage ignore the others", "That's local optimization."], ["It increases lot sizes", "Lot size reduction is a separate opportunity."], ["It eliminates the need for suppliers", "It improves coordination with suppliers."]],
  why: "Accurate pull data and shared information are opportunities that reduce the bullwhip effect.",
}));
add(concept({
  q: "Electronic ordering and electronic funds transfer mainly:",
  a: "Speed transactions and reduce paperwork",
  w: [["Increase lead times", "They shorten transaction time."], ["Replace the need for inventory", "They speed transactions; inventory is still needed."], ["Are a type of sourcing strategy", "They're an integration opportunity."]],
  why: "Electronic ordering and funds transfer speed transactions and reduce paperwork.",
}));

level("Suppliers & Logistics");
add(concept({
  v: [
    { q: "A company searches for potential suppliers and judges how likely each is to become a good supplier. Which step of building the supply base is this?", a: "Supplier evaluation" },
    { q: "A company trains a new supplier on its quality requirements, schedules, and information transfer procedures. Which step is this?", a: "Supplier development" },
    { q: "A company works out contract terms that share risks and benefits and create incentives. Which step is this?", a: "Negotiation" },
  ],
  pool: ["Supplier evaluation", "Supplier development", "Negotiation", "Third-party logistics"],
  notes: { "Supplier evaluation": "Evaluation: finding potential suppliers and judging if they'll be good ones (including certification).", "Supplier development": "Development: integrating the supplier into your system (quality, specs, schedules, training).", "Negotiation": "Negotiation: contracting, centralized purchasing, and e-procurement.", "Third-party logistics": "3PL is outsourcing logistics, not a step in building the supply base." },
  why: "Building the supply base: supplier evaluation, supplier development, and negotiation.",
}));
add(concept({
  q: "Which is NOT one of the four critical points in the logistics process?",
  a: ["Production scheduling", "Product design"],
  w: ["Point of origin", "Warehousing", "Transit", "Destination"],
  why: "The four critical points in logistics are point of origin, warehousing, transit, and destination.",
}));
const MODES = ["Trucking", "Railroads", "Airfreight", "Waterways", "Pipelines", "Multimodal"];
const MODE_NOTES = { Trucking: "Trucking: moves most manufactured goods; chief advantage is flexibility; most vulnerable to accidents.", Railroads: "Rail: carries large loads; containers and piggybacking improved flexibility.", Airfreight: "Air: fast and flexible for light loads, but can be expensive.", Waterways: "Waterways: bulky, low-value cargo when cost matters more than speed.", Pipelines: "Pipelines: oil, gas, and other chemical products.", Multimodal: "Multimodal: combines methods, common internationally, aided by standard containers." };
add(concept({
  v: [
    { q: "Which shipping system moves the vast majority of manufactured goods, with flexibility as its chief advantage?", a: "Trucking" },
    { q: "A gravel company needs to move huge amounts of cheap, bulky rock, and cost matters far more than speed. Which shipping system fits best?", a: "Waterways" },
    { q: "A company needs small, light, high-value phone parts across the country overnight. Which shipping system fits best?", a: "Airfreight" },
    { q: "Which shipping system is used for natural gas and crude oil?", a: "Pipelines" },
    { q: "A container leaves China by ship, rides a train to Kansas City, then goes by truck to a store. What is this called?", a: "Multimodal" },
    { q: "A grain company sends 100 cars of wheat across the Midwest at once. Which system is built for very large loads like this?", a: "Railroads" },
  ],
  pool: MODES, notes: MODE_NOTES,
  why: "Shipping systems: trucking, railroads, airfreight, waterways, pipelines, and multimodal.",
}));
add(concept({
  v: [
    { q: "Which shipping system is the MOST vulnerable to accidents?", a: "Trucking" },
    { q: "Which shipping system is fast and flexible for light loads but may be expensive?", a: "Airfreight" },
    { q: "Standardized containers have especially helped which kind of shipping?", a: "Multimodal" },
  ],
  pool: MODES, notes: MODE_NOTES,
  why: "Know each mode's strength: trucking (flexibility), rail (large loads), air (speed for light loads), water (cheap for bulky cargo), pipelines (oil and gas), multimodal (combinations).",
}));
const WH = ["Cross-docking", "Break-bulk", "Consolidation", "Channel assembly", "Postponement"];
add(concept({
  v: [
    { q: "Pallets come off inbound trucks and go straight onto outbound trucks without ever being stored. Which warehouse function is this?", a: "Cross-docking" },
    { q: "A warehouse receives one huge shipment and splits it into many small shipments for local stores. Which warehouse function is this?", a: "Break-bulk" },
    { q: "A warehouse combines many small shipments from different suppliers into one full truckload. Which warehouse function is this?", a: "Consolidation" },
    { q: "A warehouse receives computer parts from several suppliers and assembles finished computers before shipping. Which warehouse function is this?", a: "Channel assembly" },
  ],
  pool: WH,
  notes: { "Cross-docking": "Cross-docking: unload and reload right away, with no storage.", "Break-bulk": "Break-bulk: split large shipments into smaller ones.", Consolidation: "Consolidation: combine small shipments into larger ones.", "Channel assembly": "Channel assembly: assemble products from components in the distribution channel.", Postponement: "Postponement: delay final customization." },
  why: "The fundamental purpose of a warehouse is to store goods, but it may also provide consolidation, break-bulk, cross-docking, postponement, and channel assembly.",
}));
add(concept({
  q: ["A company stops running its own trucks and warehouses and hires a specialist firm to handle warehousing, shipping, and customs. What is this?", "Outsourcing the logistics function to a specialist provider is called:"],
  a: "Third-party logistics (3PL)",
  w: [["Vertical integration", "That's taking on more of the chain yourself, the opposite of outsourcing."], ["Keiretsu", "A keiretsu is a supplier coalition."], ["Drop shipping", "Drop shipping is about who ships to the customer, not outsourcing all logistics."]],
  why: "3PL: outsourcing logistics can reduce inventory and costs and improve delivery reliability and speed. 3PLs may provide warehousing, assembly, testing, shipping, and customs.",
}));

level("Sustainability & Benchmarking");
add(concept({
  v: [
    { q: "Customers return old phones, which are sent back up the supply chain to be repaired, resold, or recycled. What is this?", a: "Reverse logistics" },
    { q: "Before a product launches, a company designs its supply chain to handle both shipping products out AND bringing them back for reuse. What is this?", a: "Closed-loop supply chain" },
    { q: "A company compares its order fill rate and inventory days of supply with top-performing firms in its industry. What is this?", a: "Benchmarking" },
  ],
  pool: ["Reverse logistics", "Closed-loop supply chain", "Benchmarking", "Postponement"],
  notes: { "Reverse logistics": "Reverse logistics: sending returned products back up the chain for resale, repair, reuse, remanufacture, recycling, or disposal.", "Closed-loop supply chain": "Closed-loop: proactively designing for all forward AND reverse flows, preparing for returns before launch.", Benchmarking: "Benchmarking: comparing your metrics with benchmark firms.", Postponement: "Postponement delays customization." },
  why: "Sustainability in supply chains includes reverse logistics and closed-loop supply chains. Benchmarking compares performance against the best firms.",
}));
add(concept({
  q: "Compared with typical firms, BENCHMARK firms in consumer packaged goods have:",
  a: "Higher order fill rates and fewer inventory days of supply",
  w: [["Lower fill rates and more inventory", "That's backwards."], ["Longer order fulfillment lead times", "Benchmark firms are faster."], ["Longer cash-to-cash cycle times", "Benchmark firms have shorter cash-to-cash cycles."]],
  why: "Table 11.7: benchmark firms have higher order fill rates (98% vs 71%), shorter fulfillment lead times, shorter cash-to-cash cycles, and fewer inventory days of supply.",
}));
add(concept({
  q: "A HIGHER inventory turnover generally means:",
  a: "Inventory moves faster, so less money is tied up in inventory",
  w: [["The company holds more inventory relative to sales", "That would LOWER turnover."], ["The company has more weeks of supply", "Higher turnover means fewer weeks of supply."], ["Sales are falling", "Turnover compares COGS to inventory; higher usually means inventory is moving faster."]],
  why: "Inventory turnover = COGS ÷ inventory investment. Higher turnover means inventory is used and replaced more often.",
}));
add(concept({
  q: "The objective of supply chain management is to:",
  a: "Coordinate activities within the supply chain to maximize its competitive advantage and benefits to the ultimate consumer",
  w: [["Minimize the number of suppliers no matter what", "Fewer suppliers is one strategy, not the objective."], ["Make each company in the chain as profitable as possible on its own", "That's local optimization."], ["Eliminate all inventory", "That's not the objective of SCM."]],
  why: "SCM coordinates activities in the supply chain to maximize competitive advantage and benefits to the ultimate consumer.",
}));
add(concept({
  q: "What does the SCOR model provide?",
  a: "Metrics that help firms benchmark supply chain performance against the industry",
  w: [["A formula for the EOQ", "SCOR is about supply chain metrics."], ["A list of the seven wastes", "That's Ohno's list (lean)."], ["A sourcing strategy for Japanese firms", "That's keiretsu."]],
  why: "The SCOR (Supply Chain Operations Reference) model provides metrics to benchmark performance against the industry.",
}));

// ================================================================== PART 3: SUPPLY CHAIN MATH (Ch. 11)
part(3, "Supply Chain Math (Ch. 11)", "Percent invested in inventory, inventory turnover, and weeks of supply.");

function scBiz(r) {
  const c = r.pick([
    { name: "Tide & Table Seafood Restaurants", kind: "restaurant group", locs: ["Gulf Shores", "Orange Beach", "Mobile", "Fairhope"] },
    { name: "Crimson Corner Books", kind: "bookstore chain", locs: ["Tuscaloosa", "Northport", "Birmingham", "Huntsville"] },
    { name: "Black Warrior Outfitters", kind: "outdoor retailer", locs: ["Tuscaloosa", "Auburn", "Hoover", "Montgomery"] },
    { name: "Magic City Brewing", kind: "brewery", locs: ["Avondale", "Southside", "Homewood", "Vestavia"] },
    { name: "Cotton State Apparel", kind: "clothing manufacturer", locs: ["Plant 1", "Plant 2", "Plant 3", "Plant 4"] },
    { name: "Yellowhammer Hardware", kind: "hardware chain", locs: ["Dothan", "Enterprise", "Ozark", "Troy"] },
  ]);
  const assets = r.step(1500000, 9000000, 1000);
  const inv = Math.round(assets * (0.04 + r.next() * 0.3));
  const turn = 3 + r.next() * 12;
  const cogs = Math.round(inv * turn);
  const rev = Math.round(cogs * (1.15 + r.next() * 0.5));
  return { c, who: r.pick(FIRST), assets, inv, cogs, rev };
}
const money0 = (n) => "$" + n0(n);
function tableRows(rows) { return `<table class="data">${rows.map((x) => `<tr><td>${x[0]}</td><td class="num">${x[1]}</td></tr>`).join("")}</table>`; }

level("% Invested in Inventory");
add(function (r) {
  const x = scBiz(r), ans = (x.inv / x.assets) * 100;
  return N({
    story: `${x.who} wants to know how much of ${x.c.name}'s money is tied up in inventory. From last year's financials:${tableRows(r.shuffle([["Net revenue", money0(x.rev)], ["Cost of goods sold", money0(x.cogs)], ["Average inventory", money0(x.inv)], ["Total assets", money0(x.assets)]]))}`,
    ask: `What percent of total assets is invested in inventory? Enter it as a percent (for example, 12.34 for 12.34%). ${R2}`, answer: ans, unit: "%",
    hints: ["% invested = average inventory ÷ total assets × 100.", "Revenue and COGS aren't needed here."],
    steps: [`% invested = ${money0(x.inv)} ÷ ${money0(x.assets)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[ans / 100, "That's the decimal. Multiply by 100 to show it as a percent."], [(x.cogs / x.assets) * 100, "Use average inventory, not COGS."], [(x.inv / x.rev) * 100, "Divide by total assets, not revenue."], [(x.assets / x.inv) * 100, "Flip it: inventory goes on top."]],
  });
});
add(function (r) {
  const x = scBiz(r), rm = Math.round(x.inv * (0.25 + r.next() * 0.25)), wip = Math.round(x.inv * (0.05 + r.next() * 0.15)), fg = x.inv - rm - wip;
  const ans = (x.inv / x.assets) * 100;
  return N({
    story: `${x.c.name} reports its inventory in three pieces:${tableRows([["Raw materials", money0(rm)], ["Work-in-process", money0(wip)], ["Finished goods", money0(fg)], ["Total assets", money0(x.assets)], ["Cost of goods sold", money0(x.cogs)]])}`,
    ask: `What percent of total assets is invested in inventory? Enter it as a percent. ${R2}`, answer: ans, unit: "%",
    hints: ["Total inventory investment = raw materials + WIP + finished goods.", "Then divide by total assets and multiply by 100."],
    steps: [`Total inventory = ${money0(rm)} + ${money0(wip)} + ${money0(fg)} = ${money0(x.inv)}.`, `% invested = ${money0(x.inv)} ÷ ${money0(x.assets)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[(fg / x.assets) * 100, "Include ALL inventory: raw materials, WIP, and finished goods."], [ans / 100, "Multiply by 100 to show a percent."], [((rm + fg) / x.assets) * 100, "Don't forget work-in-process."]],
  });
});
add(function (r) {
  const x = scBiz(r), beg = Math.round(x.inv * (0.8 + r.next() * 0.3)), end = 2 * x.inv - beg;
  const ans = (x.inv / x.assets) * 100;
  return N({
    story: `${x.c.name} started the year with ${money0(beg)} in inventory and ended the year with ${money0(end)}. Total assets are ${money0(x.assets)}. Net revenue was ${money0(x.rev)}.`,
    ask: `Using AVERAGE inventory, what percent of total assets is invested in inventory? ${R2}`, answer: ans, unit: "%",
    hints: ["Average inventory = (beginning + ending) ÷ 2."],
    steps: [`Average inventory = (${money0(beg)} + ${money0(end)}) ÷ 2 = ${money0(x.inv)}.`, `% invested = ${money0(x.inv)} ÷ ${money0(x.assets)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[(end / x.assets) * 100, "Use the AVERAGE of beginning and ending inventory."], [(beg / x.assets) * 100, "Use the AVERAGE of beginning and ending inventory."], [((beg + end) / x.assets) * 100, "Divide beginning + ending by 2 first."]],
  });
});

level("Inventory Turnover");
add(function (r) {
  const x = scBiz(r), ans = x.cogs / x.inv;
  return N({
    story: `${x.c.name}'s annual report shows:${tableRows(r.shuffle([["Net revenue", money0(x.rev)], ["Cost of goods sold", money0(x.cogs)], ["Average inventory", money0(x.inv)], ["Total assets", money0(x.assets)]]))}`,
    ask: `What is ${x.c.name}'s inventory turnover? ${R2}`, answer: ans, unit: "times",
    hints: ["Inventory turnover = COGS ÷ average inventory.", "Use cost of goods sold, not revenue."],
    steps: [`Turnover = ${money0(x.cogs)} ÷ ${money0(x.inv)} = <b>${n2(ans)}</b> times per year.`],
    mistakes: [[x.rev / x.inv, "Use cost of goods sold, not revenue."], [x.inv / x.cogs, "Flip it: COGS goes on top."], [(x.inv / x.assets) * 100, "That's % invested. Turnover uses COGS."]],
  });
});
add(function (r) {
  const x = scBiz(r), rm = Math.round(x.inv * 0.4), wip = Math.round(x.inv * 0.15), fg = x.inv - rm - wip, ans = x.cogs / x.inv;
  return N({
    story: `A ${x.c.kind}, ${x.c.name}, lists:${tableRows([["Net revenue", money0(x.rev)], ["Cost of goods sold", money0(x.cogs)], ["Raw material inventory", money0(rm)], ["Work-in-process inventory", money0(wip)], ["Finished goods inventory", money0(fg)]])}`,
    ask: `What is the inventory turnover? ${R2}`, answer: ans, unit: "times",
    hints: ["Add all three kinds of inventory to get the total inventory investment.", "Turnover = COGS ÷ inventory investment."],
    steps: [`Inventory = ${money0(rm)} + ${money0(wip)} + ${money0(fg)} = ${money0(x.inv)}.`, `Turnover = ${money0(x.cogs)} ÷ ${money0(x.inv)} = <b>${n2(ans)}</b>.`],
    mistakes: [[x.cogs / fg, "Include raw materials and WIP, not just finished goods."], [x.rev / x.inv, "Use COGS, not revenue."]],
  });
});
add(function (r) {
  const x = scBiz(r), beg = Math.round(x.inv * (0.75 + r.next() * 0.4)), end = 2 * x.inv - beg, ans = x.cogs / x.inv;
  return N({
    story: `${x.c.name} had ${money0(beg)} of inventory on January 1 and ${money0(end)} on December 31. Cost of goods sold for the year was ${money0(x.cogs)}, on revenue of ${money0(x.rev)}.`,
    ask: `Using average inventory, what is the inventory turnover? ${R2}`, answer: ans, unit: "times",
    hints: ["Average inventory = (beginning + ending) ÷ 2.", "Turnover = COGS ÷ average inventory."],
    steps: [`Average = (${money0(beg)} + ${money0(end)}) ÷ 2 = ${money0(x.inv)}.`, `Turnover = ${money0(x.cogs)} ÷ ${money0(x.inv)} = <b>${n2(ans)}</b>.`],
    mistakes: [[x.cogs / end, "Use the average of beginning and ending inventory."], [x.rev / x.inv, "Use COGS, not revenue."], [x.cogs / (beg + end), "Divide beginning + ending by 2 first."]],
  });
});

level("Weeks of Supply");
add(function (r) {
  const x = scBiz(r), wk = x.cogs / 52, ans = x.inv / wk;
  return N({
    story: `${x.c.name} has average inventory of ${money0(x.inv)}. Annual cost of goods sold is ${money0(x.cogs)}, and annual revenue is ${money0(x.rev)}.`,
    ask: `How many weeks of supply does ${x.c.name} hold? ${R2}`, answer: ans, unit: "weeks",
    hints: ["Weeks of supply = average inventory ÷ average WEEKLY COGS.", "Weekly COGS = annual COGS ÷ 52."],
    steps: [`Weekly COGS = ${money0(x.cogs)} ÷ 52 = ${usd2(wk)}.`, `Weeks of supply = ${money0(x.inv)} ÷ ${usd2(wk)} = <b>${n2(ans)}</b> weeks.`],
    mistakes: [[x.inv / x.cogs, "Divide by WEEKLY COGS (annual ÷ 52), not annual COGS."], [x.inv / (x.rev / 52), "Use COGS, not revenue."], [x.cogs / x.inv, "That's turnover. Weeks of supply puts inventory on top."]],
  });
});
add(function (r) {
  const x = scBiz(r), mo = Math.round(x.cogs / 12), annual = mo * 12, ans = x.inv / (annual / 52);
  return N({
    story: `${x.c.name}'s cost of goods sold averages ${money0(mo)} per month. Inventory on hand averages ${money0(x.inv)}.`,
    ask: `How many weeks of supply is that? ${R2}`, answer: ans, unit: "weeks",
    hints: ["Turn monthly COGS into annual COGS (× 12), then into weekly COGS (÷ 52)."],
    steps: [`Annual COGS = ${money0(mo)} × 12 = ${money0(annual)}.`, `Weekly COGS = ${money0(annual)} ÷ 52 = ${usd2(annual / 52)}.`, `Weeks of supply = ${money0(x.inv)} ÷ ${usd2(annual / 52)} = <b>${n2(ans)}</b>.`],
    mistakes: [[x.inv / mo, "That's months of supply. Convert to weekly COGS."], [x.inv / (mo / 4), "A month isn't exactly 4 weeks. Go monthly → annual (× 12) → weekly (÷ 52)."]],
  });
});
add(function (r) {
  const x = scBiz(r), wk = Math.round(x.cogs / 52), ans = x.inv / wk;
  return N({
    story: `Average weekly cost of goods sold at ${x.c.name} is ${money0(wk)}. Average inventory is ${money0(x.inv)}, and total assets are ${money0(x.assets)}.`,
    ask: `How many weeks of supply does ${x.c.name} have? ${R2}`, answer: ans, unit: "weeks",
    hints: ["Weekly COGS is already given."],
    steps: [`Weeks of supply = ${money0(x.inv)} ÷ ${money0(wk)} = <b>${n2(ans)}</b>.`],
    mistakes: [[x.inv / (wk / 52), "Weekly COGS is already given, so don't divide by 52 again."], [wk / x.inv, "Inventory goes on top."]],
  });
});

level("Mixed Metrics");
add(function (r) {
  const x = scBiz(r), parts = [0.2 + r.next() * 0.1, 0.25 + r.next() * 0.1, 0.2 + r.next() * 0.1];
  const invs = parts.map((f) => Math.round(x.inv * f)); invs.push(x.inv - invs[0] - invs[1] - invs[2]);
  const ans = (x.inv / x.assets) * 100;
  return N({
    story: `${x.who} oversees all four locations of ${x.c.name}. Average inventory at each location:${tableRows(x.c.locs.map((l, i) => [l, money0(invs[i])]))}Company-wide total assets are ${money0(x.assets)}, and company-wide COGS is ${money0(x.cogs)}.`,
    ask: `What percent of total assets does the whole company have invested in inventory? ${R2}`, answer: ans, unit: "%",
    hints: ["Add up inventory at all four locations first."],
    steps: [`Total inventory = ${invs.map(money0).join(" + ")} = ${money0(x.inv)}.`, `% invested = ${money0(x.inv)} ÷ ${money0(x.assets)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[(invs[0] / x.assets) * 100, "Include all four locations."], [ans / 100, "Multiply by 100."]],
  });
});
add(function (r) {
  const x = scBiz(r), t = r2(4 + r.next() * 10), ans = x.cogs / t;
  return N({
    story: `${x.c.name}'s inventory turnover last year was ${t} times. Cost of goods sold was ${money0(x.cogs)}.`,
    ask: `What was the average inventory investment? ${R2}`, answer: ans, unit: "$",
    hints: ["Turnover = COGS ÷ inventory. Rearrange to solve for inventory."],
    steps: [`Inventory = COGS ÷ turnover = ${money0(x.cogs)} ÷ ${t} = <b>${usd2(ans)}</b>.`],
    mistakes: [[x.cogs * t, "Divide COGS by turnover."]],
  });
});
add(function (r) {
  const t = r2(3 + r.next() * 15), ans = 52 / t;
  const c = r.pick(BUY);
  return N({
    story: `${c.name} turns its inventory over ${t} times a year.`,
    ask: `About how many weeks of supply does it hold on average? ${R2}`, answer: ans, unit: "weeks",
    hints: ["If inventory turns over T times in 52 weeks, each turn takes 52 ÷ T weeks."],
    steps: [`Weeks of supply = inventory ÷ (COGS ÷ 52) = 52 ÷ (COGS ÷ inventory) = 52 ÷ turnover.`, `52 ÷ ${t} = <b>${n2(ans)}</b> weeks.`],
    mistakes: [[t / 52, "Flip it: 52 ÷ turnover."], [365 / t, "That would be days of supply. Use 52 weeks."]],
  });
});

// ================================================================== PART 4: INVENTORY BASICS (Ch. 12)
part(4, "Inventory Basics (Ch. 12)", "Why companies hold inventory, the four types, ABC analysis, cycle counting, inventory costs, and model assumptions.");

level("Functions & Types");
const TYPES = ["Raw material", "Work-in-process (WIP)", "Finished goods", "MRO (maintenance/repair/operating)"];
const TYPE_NOTES = { "Raw material": "Raw material: purchased but not yet processed.", "Work-in-process (WIP)": "WIP: has undergone some change but isn't finished.", "Finished goods": "Finished goods: completed product awaiting shipment.", "MRO (maintenance/repair/operating)": "MRO: supplies needed to keep machinery and processes productive." };
add(concept({
  v: [
    { q: "At a bakery: sacks of flour sitting in the storeroom. Which type of inventory?", a: "Raw material" },
    { q: "At a bakery: dough that's been mixed and shaped but not baked yet. Which type of inventory?", a: "Work-in-process (WIP)" },
    { q: "At a bakery: boxed cakes waiting for customers to pick them up. Which type of inventory?", a: "Finished goods" },
    { q: "At a bakery: spare oven belts and cleaning supplies for the mixers. Which type of inventory?", a: "MRO (maintenance/repair/operating)" },
  ],
  pool: TYPES, notes: TYPE_NOTES,
  why: "The four types of inventory: raw material, work-in-process, finished goods, and MRO.",
}));
add(concept({
  v: [
    { q: "At a furniture plant: chairs that are assembled but not yet stained. Which type?", a: "Work-in-process (WIP)" },
    { q: "At a furniture plant: lubricant, saw blades, and replacement drill bits for the machines. Which type?", a: "MRO (maintenance/repair/operating)" },
    { q: "At a furniture plant: lumber delivered last week that hasn't been cut. Which type?", a: "Raw material" },
    { q: "At a furniture plant: wrapped tables on the loading dock waiting for the truck. Which type?", a: "Finished goods" },
  ],
  pool: TYPES, notes: TYPE_NOTES,
  why: "Where is it in the process? Not started = raw material. Partly done = WIP. Done and waiting = finished goods. Keeps the machines running = MRO.",
}));
add(concept({
  v: [
    { q: "A bottling plant keeps a stack of filled bottles between the filler and the labeler so the labeler keeps running when the filler jams. Which function of inventory is this?", a: "To decouple parts of the production process" },
    { q: "A builder stocks up on copper wire now because prices are expected to jump next quarter. Which function of inventory is this?", a: "To hedge against inflation" },
    { q: "A store buys a full pallet of batteries because the supplier gives a lower price per unit for pallet orders. Which function of inventory is this?", a: "To take advantage of quantity discounts" },
    { q: "A toy store stocks a wide selection ahead of the holidays to meet expected demand. Which function of inventory is this?", a: "To provide a selection of goods for anticipated demand" },
  ],
  pool: ["To decouple parts of the production process", "To hedge against inflation", "To take advantage of quantity discounts", "To provide a selection of goods for anticipated demand"],
  why: "Functions of inventory: provide a selection for anticipated demand (and separate the firm from demand fluctuations), decouple parts of the process, take advantage of quantity discounts, and hedge against inflation.",
}));
add(concept({
  q: "The objective of inventory management is to strike a balance between:",
  a: "Inventory investment and customer service",
  w: [["Raw materials and finished goods", "The balance is about cost vs. service."], ["Revenue and total assets", "Those are financial numbers, not the inventory balance."], ["Suppliers and distributors", "It's about investment vs. service."]],
  why: "Less inventory lowers costs but raises the chance of shortages; more inventory raises costs but improves service. Inventory management balances investment and customer service.",
}));
add(concept({
  q: "A pharmacy keeps extra insulin above what its average forecast says it needs. What is the main reason?",
  a: "To protect against stockouts when demand or delivery time is higher than expected",
  w: [["To prepare for a drop in demand", "Extra stock doesn't help if demand drops; it's for spikes and delays."], ["To lower its holding costs", "Extra stock RAISES holding costs."], ["To reduce the number of orders per year", "That depends on order size (Q), not the cushion."]],
  why: "Safety stock is extra inventory that helps achieve a desired service level and avoid stockouts when demand or lead time varies: ROP = d × L + ss.",
}));
add(concept({
  v: [
    { q: "A system that updates the count every time an item is received or sold is called:", a: "A perpetual inventory system" },
    { q: "A store keeps two bins of screws. When the first bin is empty, it reorders and uses the second bin while waiting. This is:", a: "A two-bin system" },
    { q: "In service businesses, inventory lost to theft is called:", a: "Shrinkage or pilferage" },
  ],
  pool: ["A perpetual inventory system", "A two-bin system", "Shrinkage or pilferage", "Cycle counting"],
  notes: { "A perpetual inventory system": "Perpetual: tracks receipts and subtractions continuously.", "A two-bin system": "Two-bin: a simple periodic system; an empty bin triggers an order.", "Shrinkage or pilferage": "Shrinkage/pilferage: losses (often theft) in service inventories.", "Cycle counting": "Cycle counting: counting items on a periodic schedule, often by ABC class." },
  why: "Record accuracy depends on periodic systems (like two-bin), perpetual systems, and cycle counting. Services control shrinkage with good hiring, training, and tight control of goods coming in and going out.",
}));

level("ABC Analysis");
add(concept({
  q: ["ABC analysis ranks inventory items by:", "What measure does ABC analysis use to divide items into classes?"],
  a: "Annual dollar volume (annual units × unit cost)",
  w: [["Unit price alone", "An expensive item that rarely sells can still be a C item."], ["Number of units on hand", "It's a dollar measure, not a count."], ["How often the item is ordered", "Order frequency isn't the ABC measure."]],
  why: "ABC divides inventory into classes by annual dollar volume. A items are the few critical ones with high dollar volume; C items are the many trivial ones.",
}));
add(function (r) {
  const c = r.pick(BUY.concat(MAKE)), u = r.step(200, 8000, 50), cost = r.money(0.5, 90);
  const ans = u * cost;
  return N({
    story: `${c.name} uses ${n0(u)} units of part #${r.int(10000, 19999)} per year. Each unit costs ${usd2(cost)}. The part is stored on shelf ${r.int(1, 40)} and reordered ${r.int(4, 12)} times a year.`,
    ask: `What is this item's annual dollar volume? ${R2}`, answer: ans, unit: "$",
    hints: ["Annual dollar volume = annual units × unit cost."],
    steps: [`${n0(u)} × ${usd2(cost)} = <b>${usd2(ans)}</b>.`],
    mistakes: [[cost, "Multiply the unit cost by annual units."], [u, "Multiply annual units by the unit cost."]],
  });
});
function abcTable(r) {
  const items = [];
  for (let i = 0; i < 6; i++) items.push({ id: "#" + r.int(10000, 19999), u: r.step(50, 5000, 50), c: r.money(0.4, 120) });
  // make sure the most expensive item is not the top dollar-volume item
  items.sort((a, b) => b.c - a.c);
  items[0].u = r.step(20, 120, 10);
  items.forEach((it) => (it.v = it.u * it.c));
  return r.shuffle(items);
}
add(function (r) {
  const items = abcTable(r), tot = items.reduce((t, i) => t + i.v, 0), target = r.pick(items);
  const ans = (target.v / tot) * 100;
  return N({
    story: `An ABC worksheet for a small stockroom:<table class="data"><tr><th>Item</th><th>Annual units</th><th>Unit cost</th></tr>${items.map((i) => `<tr><td>${i.id}</td><td class="num">${n0(i.u)}</td><td class="num">${usd2(i.c)}</td></tr>`).join("")}</table>`,
    ask: `What percent of the stockroom's total annual dollar volume comes from item ${target.id}? ${R2}`, answer: ans, unit: "%",
    hints: ["Find each item's annual dollar volume (units × cost) and add them up.", `Then divide ${target.id}'s dollar volume by the total and × 100.`],
    steps: [`Dollar volumes: ${items.map((i) => `${i.id} ${usd2(i.v)}`).join("; ")}.`, `Total = ${usd2(tot)}.`, `${target.id}: ${usd2(target.v)} ÷ ${usd2(tot)} × 100 = <b>${n2(ans)}%</b>.`],
    mistakes: [[ans / 100, "Multiply by 100 to show a percent."], [(target.u / items.reduce((t, i) => t + i.u, 0)) * 100, "That's the percent of UNITS. ABC uses dollar volume."]],
  });
});
add(function (r) {
  const items = abcTable(r), top = items.slice().sort((a, b) => b.v - a.v)[0], priciest = items.slice().sort((a, b) => b.c - a.c)[0], mostU = items.slice().sort((a, b) => b.u - a.u)[0];
  const others = items.filter((i) => i !== top);
  const wrongs = [priciest, mostU].filter((i) => i !== top).concat(r.shuffle(others)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
  const note = (i) => (i === priciest ? "That item has the highest unit price, but it sells very few units. ABC uses annual DOLLAR volume." : i === mostU ? "That item has the most units, but its dollar volume isn't the highest." : "Compute units × cost for each item and compare.");
  return C({
    story: `<table class="data"><tr><th>Item</th><th>Annual units</th><th>Unit cost</th></tr>${items.map((i) => `<tr><td>${i.id}</td><td class="num">${n0(i.u)}</td><td class="num">${usd2(i.c)}</td></tr>`).join("")}</table>`,
    ask: "Which item is MOST likely to be classified as an A item?",
    choices: [{ t: top.id, ok: true }].concat(wrongs.map((i) => ({ t: i.id, ok: false, note: note(i) }))),
    why: `A items have the highest annual dollar volume. ${top.id}: ${n0(top.u)} × ${usd2(top.c)} = ${usd2(top.v)}, the largest in the table.`,
  });
});
add(concept({
  q: ["Which policy fits A items?", "Compared with C items, a company should give A items:"],
  a: ["Tighter physical inventory control and more care in forecasting", "More emphasis on supplier development"],
  w: [["Less frequent counting", "A items get counted MORE often."], ["The loosest controls, since there are so few of them", "Few items, but they're the critical ones."], ["The same treatment as every other item", "The point of ABC is that items don't all deserve the same attention."]],
  why: "ABC policies: more supplier development, tighter physical control, and more care in forecasting for A items. Focus on the few critical items, not the many trivial ones.",
}));

level("Cycle Counting");
function ccSetup(r) {
  const tot = r.step(2000, 9000, 100), pa = r.pick([10, 15, 20]), pb = r.pick([25, 30, 35]), pc = 100 - pa - pb;
  const fa = r.pick([10, 15, 20, 30]), fb = r.pick([40, 50, 60]), fc = r.pick([90, 100, 120]);
  const A = (tot * pa) / 100, B = (tot * pb) / 100, Cc = (tot * pc) / 100;
  return { tot, pa, pb, pc, fa, fb, fc, A, B, C: Cc, perA: A / fa, perB: B / fb, perC: Cc / fc, name: r.pick(["Black Warrior Supply", "Gulf South Distribution", "Iron City Parts", "Crimson Hardware Warehouse"]) };
}
function ccStory(x) {
  return `${x.name} stocks ${n0(x.tot)} different items. After an ABC analysis:<table class="data"><tr><th>Class</th><th>% of items</th><th>Count every</th></tr><tr><td>A</td><td class="num">${x.pa}%</td><td class="num">${x.fa} working days</td></tr><tr><td>B</td><td class="num">${x.pb}%</td><td class="num">${x.fb} working days</td></tr><tr><td>C</td><td class="num">${x.pc}%</td><td class="num">${x.fc} working days</td></tr></table>`;
}
add(function (r) {
  const x = ccSetup(r);
  return N({
    story: ccStory(x), ask: `How many A items must be counted each working day? ${R2}`, answer: x.perA, unit: "items/day",
    hints: ["Number of A items = total × % A.", "Items per day = number of A items ÷ days in the counting cycle."],
    steps: [`A items = ${n0(x.tot)} × ${x.pa / 100} = ${n0(x.A)}.`, `Per day = ${n0(x.A)} ÷ ${x.fa} = <b>${n2(x.perA)}</b>.`],
    mistakes: [[x.A, "That's how many A items there are. Divide by the counting cycle."], [x.tot / x.fa, `Only ${x.pa}% are A items.`]],
  });
});
add(function (r) {
  const x = ccSetup(r), tot = x.perA + x.perB + x.perC;
  return N({
    story: ccStory(x), ask: `How many items in total must be counted each working day? ${R2}`, answer: tot, unit: "items/day",
    hints: ["Find items per day for each class, then add them."],
    steps: [`A: ${n0(x.A)} ÷ ${x.fa} = ${n2(x.perA)}.`, `B: ${n0(x.B)} ÷ ${x.fb} = ${n2(x.perB)}.`, `C: ${n0(x.C)} ÷ ${x.fc} = ${n2(x.perC)}.`, `Total = <b>${n2(tot)}</b> items per day.`],
    mistakes: [[x.perA, "That's only A items. Add B and C."], [x.tot / x.fa, "Each class has its own cycle."]],
  });
});
add(function (r) {
  const x = ccSetup(r), tot = x.perA + x.perB + x.perC, rate = r.pick([10, 12, 15, 20, 25]), hrs = r.pick([4, 6, 8]);
  const ans = tot / (rate * hrs);
  return N({
    story: ccStory(x) + ` One counter can count ${rate} items per hour during a ${hrs}-hour shift.`,
    ask: `How many counters are needed to keep up with the schedule? (Give the exact number, not rounded up.) ${R2}`, answer: ans, unit: "counters",
    hints: ["Find the total items to count per day first.", `One counter handles ${rate} × ${hrs} = ${rate * hrs} items per day.`],
    steps: [`Items per day = ${n2(x.perA)} + ${n2(x.perB)} + ${n2(x.perC)} = ${n2(tot)}.`, `One counter: ${rate} × ${hrs} = ${rate * hrs} per day.`, `Counters = ${n2(tot)} ÷ ${rate * hrs} = <b>${n2(ans)}</b>.`],
    mistakes: [[tot / rate, `That's hours of counting needed. Divide by the ${hrs}-hour shift too.`], [tot, "That's items per day. Divide by what one counter can do."]],
  });
});
add(concept({
  q: "Which is NOT an advantage of cycle counting?",
  a: "It requires shutting down for a full annual physical inventory",
  w: ["It eliminates shutdowns and interruptions", "It allows causes of errors to be identified and corrected", "It maintains accurate inventory records", "It eliminates the annual inventory adjustment"],
  why: "Cycle counting eliminates shutdowns and the annual inventory adjustment, uses trained personnel, lets errors be found and fixed, and keeps records accurate.",
}));

level("Costs, Models & Assumptions");
add(concept({
  v: [
    { q: "Insurance and taxes on the inventory sitting in a warehouse are part of which cost?", a: "Holding cost" },
    { q: "Staff time spent preparing and processing a purchase order is part of which cost?", a: "Ordering cost" },
    { q: "Cleaning and recalibrating a machine before a new production batch is part of which cost?", a: "Setup cost" },
    { q: "Losses because inventory becomes obsolete before it's sold are part of which cost?", a: "Holding cost" },
  ],
  pool: ["Holding cost", "Ordering cost", "Setup cost", "Product (purchase) cost"],
  notes: { "Holding cost": "Holding cost: the cost of keeping (carrying) inventory over time.", "Ordering cost": "Ordering cost: the cost of placing an order and receiving goods.", "Setup cost": "Setup cost: the cost to prepare a machine or process to make an order.", "Product (purchase) cost": "Product cost is P × D, the price of the items themselves." },
  why: "Holding costs include housing, material handling, labor, investment costs (borrowing, taxes, insurance), and pilferage, space, and obsolescence.",
}));
add(concept({
  v: [
    { q: "Demand for wheels at a bicycle factory depends on how many bikes are scheduled to be built. This is:", a: "Dependent demand" },
    { q: "Demand for bicycles at a bike shop doesn't depend on demand for any other item. This is:", a: "Independent demand" },
  ],
  pool: ["Dependent demand", "Independent demand", "Seasonal demand", "Safety stock"],
  why: "Independent demand doesn't depend on other items. Dependent demand comes from the demand for something else (a part of a product). EOQ and EPQ are models for independent demand.",
}));
add(concept({
  q: "Which is NOT an assumption of the basic EOQ model?",
  a: ["Quantity discounts are available", "Demand changes from month to month"],
  w: ["Demand is known, constant, and independent", "Lead time is known and constant", "Receipt of inventory is instantaneous and complete", "The only variable costs are setup and holding", "Stockouts can be completely avoided"],
  why: "EOQ assumptions: demand known, constant, independent; lead time known and constant; receipt instantaneous and complete; no quantity discounts; only variable costs are setup and holding; stockouts completely avoided.",
}));
add(concept({
  q: "Why is the EOQ model called \"robust\"?",
  a: "The total cost curve is fairly flat near the EOQ, so ordering a bit more or less barely changes total cost",
  w: [["It always gives the exact best answer even if demand changes", "It still works, but because the cost curve is flat, not because it's exact."], ["It includes quantity discounts", "Basic EOQ assumes no discounts."], ["It works for dependent demand", "It's for independent demand."]],
  why: "EOQ is robust: it works even if parameters and assumptions aren't perfectly met, because the total cost curve is relatively flat around Q*.",
}));
add(concept({
  v: [
    { q: "A manager asks, \"How many should I order each time?\" Which tool answers that?", a: "EOQ" },
    { q: "A manager asks, \"When should I place my next order?\" Which tool answers that?", a: "Reorder point (ROP)" },
  ],
  pool: ["EOQ", "Reorder point (ROP)", "ABC analysis", "Cycle counting"],
  why: "Inventory models answer two questions: how much to order (EOQ) and when to order (reorder point).",
}));
add(concept({
  v: [
    { q: "A supplier cuts the price on EVERY unit when you buy 1,000 or more. What kind of discount is this?", a: "All-units discount" },
    { q: "A supplier's lower price applies only to the units you buy BEYOND 1,000. What kind of discount is this?", a: "Incremental quantity discount" },
  ],
  pool: ["All-units discount", "Incremental quantity discount", "Blanket order", "Fixed fee"],
  why: "All-units discounts (the most popular) apply to every unit; incremental discounts apply only to units beyond the price break. The trade-off is lower product cost vs. higher holding cost.",
}));
add(concept({
  q: ["At the EOQ, how does annual setup (ordering) cost compare to annual holding cost?", "Where is the optimal order quantity found on the cost graph?"],
  a: "They are equal",
  w: [["Setup cost is twice holding cost", "At Q*, they're exactly equal."], ["Holding cost is zero", "Holding cost is Q/2 × H, not zero."], ["Setup cost is always larger", "At Q*, they're equal."]],
  why: "Q* is where annual setup cost equals annual holding cost. That's how the EOQ formula is derived, and why total cost at Q* = 2 × setup cost.",
}));
add(concept({
  q: "In the production order quantity (EPQ) model, why does maximum inventory never reach Q?",
  a: "Units are being used or sold while the batch is being produced",
  w: [["Some units are always defective", "The model doesn't assume defects."], ["Holding cost is higher in EPQ", "That's not why."], ["Orders arrive all at once", "That's the EOQ assumption, which is the opposite."]],
  why: "In EPQ, inventory builds up gradually because demand (d) uses units while production (p) makes them. Max inventory = Q(1 − d/p), which is less than Q, so annual holding cost = H × Q/2 × (1 − d/p).",
}));

// ================================================================== PART 5: EOQ & REORDER POINT MATH
part(5, "EOQ & Reorder Point", "Economic order quantity for items a business BUYS, the costs around it, and the reorder point.");

function eoqMistakes(x, Qs) {
  const ms = [[Math.sqrt((x.D * x.S) / x.H), "You left out the 2. Q* = √(2DS ÷ H)."], [(2 * x.D * x.S) / x.H, "Don't forget the square root."]];
  if (x.dm === "month") ms.push([eoq(x.M, x.S, x.H), "You used monthly demand. D must be ANNUAL (× 12)."]);
  if (x.hm === "pct") ms.push([eoq(x.D, x.S, x.I), `You used ${x.I} as H. H in dollars = ${x.I / 100} × ${usd2(x.P)}.`]);
  if (x.hm === "pct") ms.push([eoq(x.D, x.S, x.P), "You used the price as H. H = I × P."]);
  return ms;
}

level("Q*, N, and T");
add(function (r) {
  const x = buy(r), Qs = x.Qs;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "days"]),
    ask: `What is the economic order quantity, <b>Q*</b>? ${R2}`, answer: Qs, unit: x.c.units,
    hints: [hintD(x), hintH(x), "Q* = √(2DS ÷ H)."],
    steps: [stepD(x), stepH(x), `S = ${usd(x.S)} per order`, `Q* = √(2 × ${n0(x.D)} × ${nn(x.S)} ÷ ${fmt(x.H, 4)}) = <b>${n2(Qs)}</b> ${x.c.units}.`],
    mistakes: eoqMistakes(x, Qs),
  });
});
add(function (r) {
  const x = buy(r), Nn = x.D / x.Qs;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "days"]),
    ask: `If ${x.c.name} orders the EOQ each time, how many orders will it place per year (<b>N</b>)? ${R2}`, answer: Nn, unit: "orders",
    hints: ["Find Q* first.", "N = D ÷ Q*."],
    steps: [stepD(x), stepH(x), `Q* = √(2 × ${n0(x.D)} × ${nn(x.S)} ÷ ${fmt(x.H, 4)}) = ${n2(x.Qs)}.`, `N = ${n0(x.D)} ÷ ${n2(x.Qs)} = <b>${n2(Nn)}</b> orders per year.`],
    mistakes: [[x.Qs / x.D, "Flip it: N = D ÷ Q*."], [x.dm === "month" ? x.M / x.Qs : -1, "Use annual demand."], [x.Qs, "That's Q*. N = D ÷ Q*."]],
  });
});
add(function (r) {
  const x = buy(r), Nn = x.D / x.Qs, T = x.days / Nn;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "days"]),
    ask: `Using the EOQ, what is the expected time between orders (<b>T</b>) in working days? ${R2}`, answer: T, unit: "days",
    hints: ["Find Q* and then N = D ÷ Q*.", "T = working days per year ÷ N."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `N = ${n0(x.D)} ÷ ${n2(x.Qs)} = ${n2(Nn)}.`, `T = ${x.days} ÷ ${n2(Nn)} = <b>${n2(T)}</b> days.`],
    mistakes: [[365 / Nn, `Use ${x.days} working days, not 365.`], [Nn, "That's N. T = days ÷ N."], [Nn / x.days, "Flip it: T = days ÷ N."]],
  });
});
add(function (r) {
  const x = buy(r), avg = x.Qs / 2;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `If ${x.c.name} orders the EOQ, what is its AVERAGE inventory? ${R2}`, answer: avg, unit: x.c.units,
    hints: ["Find Q* first.", "With EOQ, inventory goes from Q* down to 0, so the average is Q* ÷ 2."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Average inventory = ${n2(x.Qs)} ÷ 2 = <b>${n2(avg)}</b>.`],
    mistakes: [[x.Qs, "That's the MAXIMUM. Average is Q* ÷ 2."]],
  });
});
add(function (r) {
  const x = buy(r);
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `If ${x.c.name} orders the EOQ, what is the MAXIMUM inventory it will ever have on hand? ${R2}`, answer: x.Qs, unit: x.c.units,
    hints: ["Under EOQ, the whole order arrives at once when inventory hits zero.", "So the maximum is the full order quantity, Q*."],
    steps: [stepD(x), stepH(x), `Maximum inventory = Q* = √(2 × ${n0(x.D)} × ${nn(x.S)} ÷ ${fmt(x.H, 4)}) = <b>${n2(x.Qs)}</b>.`],
    mistakes: [[x.Qs / 2, "That's the AVERAGE. The maximum is the whole order, Q*."]],
  });
});

level("Annual Costs at Q*");
add(function (r) {
  const x = buy(r), sc = (x.D / x.Qs) * x.S;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `Ordering the EOQ, what is the ANNUAL ordering (setup) cost? ${R2}`, answer: sc, unit: "$",
    hints: ["Find Q* first.", "Annual setup cost = (D ÷ Q*) × S."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Annual setup = (${n0(x.D)} ÷ ${n2(x.Qs)}) × ${usd(x.S)} = <b>${usd2(sc)}</b>.`],
    mistakes: [[x.S, "That's the cost of ONE order. Multiply by the number of orders."], [2 * sc, "That's total cost (setup + holding). Just the setup part, please."]],
  });
});
add(function (r) {
  const x = buy(r), hc = (x.Qs / 2) * x.H;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `Ordering the EOQ, what is the ANNUAL holding cost? ${R2}`, answer: hc, unit: "$",
    hints: ["Find Q* first.", "Annual holding cost = (Q* ÷ 2) × H."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Annual holding = (${n2(x.Qs)} ÷ 2) × ${usd4(x.H)} = <b>${usd2(hc)}</b>.`],
    mistakes: [[x.Qs * x.H, "Use AVERAGE inventory (Q* ÷ 2), not Q*."], [x.hm === "pct" ? (x.Qs / 2) * x.I : -1, "H must be in dollars: I × P."]],
  });
});
add(function (r) {
  const x = buy(r), tc = (x.D / x.Qs) * x.S + (x.Qs / 2) * x.H;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "lead"]),
    ask: `What is the total annual inventory cost (setup + holding) when ordering the EOQ? ${R2}`, answer: tc, unit: "$",
    hints: ["Find Q*.", "TC = (D ÷ Q*) × S + (Q* ÷ 2) × H.", "Shortcut: at Q*, setup = holding, so TC = 2 × either one."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Setup = ${usd2((x.D / x.Qs) * x.S)}; holding = ${usd2((x.Qs / 2) * x.H)}.`, `TC = <b>${usd2(tc)}</b>.`, "The lead time isn't needed."],
    mistakes: [[tc / 2, "That's only one of the two costs. Add setup AND holding."], [tc + x.P * x.D, "This question doesn't include the cost of the items themselves (P × D)."]],
  });
});
add(function (r) {
  const x = buy(r, { hm: "pct" }), tc = (x.D / x.Qs) * x.S + (x.Qs / 2) * x.H, full = tc + x.P * x.D;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order"]),
    ask: `Including the cost of the ${x.c.units} themselves, what is the total annual cost when ordering the EOQ? ${R2}`, answer: full, unit: "$",
    hints: ["Total cost including material = setup + holding + P × D.", "Find Q* first."],
    steps: [stepD(x), stepH(x), `Q* = ${n2(x.Qs)}.`, `Setup + holding = ${usd2(tc)}.`, `P × D = ${usd2(x.P)} × ${n0(x.D)} = ${usd2(x.P * x.D)}.`, `Total = <b>${usd2(full)}</b>.`],
    mistakes: [[tc, "Add the product cost, P × D."], [x.P * x.D, "Add the setup and holding costs too."]],
  });
});
add(function (r) {
  const c = r.pick(BUY), hc = r.money(80, 1500), P = r.money(c.P[0], c.P[1]), L = r.int(3, 10);
  return N({
    story: `${c.name} orders the economic order quantity of ${c.item} every time. Its annual holding cost has been calculated as ${usd2(hc)}. Each ${c.unit} costs ${usd2(P)}, and the lead time is ${L} days.`,
    ask: `What is the total annual inventory cost (setup + holding)? ${R2}`, answer: 2 * hc, unit: "$",
    hints: ["At the EOQ, how does annual setup cost compare to annual holding cost?"],
    steps: [`At Q*, annual setup cost = annual holding cost = ${usd2(hc)}.`, `TC = ${usd2(hc)} + ${usd2(hc)} = <b>${usd2(2 * hc)}</b>.`],
    mistakes: [[hc, "That's just holding cost. At Q*, setup cost equals holding cost, so add them."]],
  });
});

level("Current Policy vs. EOQ");
add(function (r) {
  const x = buy(r), oc = (x.D / x.Q0) * x.S;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "current"]),
    ask: `Under the CURRENT ordering policy, what is the annual ordering cost? ${R2}`, answer: oc, unit: "$",
    hints: ["Use the current order quantity, not Q*.", "Annual ordering cost = (D ÷ Q) × S."],
    steps: [stepD(x), `Orders per year = ${n0(x.D)} ÷ ${n0(x.Q0)} = ${n2(x.D / x.Q0)}.`, `Annual ordering cost = ${n2(x.D / x.Q0)} × ${usd(x.S)} = <b>${usd2(oc)}</b>.`],
    mistakes: [[(x.D / x.Qs) * x.S, "That uses Q*. The question asks about the CURRENT quantity."], [x.dm === "month" ? (x.M / x.Q0) * x.S : -1, "Use annual demand."]],
  });
});
add(function (r) {
  const x = buy(r), hc = (x.Q0 / 2) * x.H;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "current"]),
    ask: `Under the CURRENT policy, what is the annual holding cost? ${R2}`, answer: hc, unit: "$",
    hints: ["Use the current Q.", "Annual holding = (Q ÷ 2) × H."],
    steps: [stepH(x), `Annual holding = (${n0(x.Q0)} ÷ 2) × ${usd4(x.H)} = <b>${usd2(hc)}</b>.`],
    mistakes: [[x.Q0 * x.H, "Use average inventory (Q ÷ 2)."], [(x.Qs / 2) * x.H, "That uses Q*. Use the current quantity."]],
  });
});
add(function (r) {
  const x = buy(r), tc0 = (x.D / x.Q0) * x.S + (x.Q0 / 2) * x.H;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "current", "days"]),
    ask: `What is the total annual inventory cost (ordering + holding) under the CURRENT policy? ${R2}`, answer: tc0, unit: "$",
    hints: ["Plug the current Q into TC = (D ÷ Q) × S + (Q ÷ 2) × H."],
    steps: [stepD(x), stepH(x), `Ordering = (${n0(x.D)} ÷ ${n0(x.Q0)}) × ${usd(x.S)} = ${usd2((x.D / x.Q0) * x.S)}.`, `Holding = (${n0(x.Q0)} ÷ 2) × ${usd4(x.H)} = ${usd2((x.Q0 / 2) * x.H)}.`, `TC = <b>${usd2(tc0)}</b>.`],
    mistakes: [[(x.D / x.Qs) * x.S + (x.Qs / 2) * x.H, "That's the cost at Q*. Use the current quantity."], [(x.D / x.Q0) * x.S + x.Q0 * x.H, "Holding uses Q ÷ 2."]],
  });
});
add(function (r) {
  const x = buy(r), tc0 = (x.D / x.Q0) * x.S + (x.Q0 / 2) * x.H, tcs = (x.D / x.Qs) * x.S + (x.Qs / 2) * x.H, sav = tc0 - tcs;
  return N({
    story: buyText(r, x, ["demand", "price", "hold", "order", "current"]),
    ask: `How much would ${x.c.name} save per year by switching from its current order size to the EOQ? ${R2}`, answer: sav, unit: "$",
    hints: ["Find TC at the current Q.", "Find Q* and TC at Q*.", "Savings = TC(current) − TC(Q*)."],
    steps: [stepD(x), stepH(x), `TC at current Q (${n0(x.Q0)}) = ${usd2(tc0)}.`, `Q* = ${n2(x.Qs)}; TC at Q* = ${usd2(tcs)}.`, `Savings = <b>${usd2(sav)}</b>.`],
    mistakes: [[tc0, "That's the current cost. Subtract the cost at Q*."], [tcs, "That's the cost at Q*. Subtract it from the current cost."], [-sav, "Savings should be positive: current minus EOQ."]],
  });
});
add(function (r) {
  const x = buy(r, { hm: "dollar" }), m = r.pick([25, 50, 100]);
  const lo = Math.max(m, Math.floor(x.Qs / m) * m), hi = lo + m;
  const tc = (q) => (x.D / q) * x.S + (q / 2) * x.H, best = tc(lo) <= tc(hi) ? lo : hi;
  return N({
    story: buyText(r, x, ["demand", "hold", "order"]) + ` The supplier only ships ${x.c.units} in multiples of ${m}.`,
    ask: `Which order quantity (a multiple of ${m}) gives the lowest annual ordering + holding cost?`, answer: best, dec: 0, unit: x.c.units,
    hints: ["Find Q* first. It probably isn't a multiple of " + m + ".", "Check the multiples just below and just above Q*, and compute TC for each.", "Pick the one with the lower total cost."],
    steps: [stepD(x), `Q* = ${n2(x.Qs)}.`, `TC(${n0(lo)}) = ${usd2(tc(lo))}; TC(${n0(hi)}) = ${usd2(tc(hi))}.`, `Lowest cost: <b>${n0(best)}</b> ${x.c.units}.`],
    mistakes: [[best === lo ? hi : lo, "Compute total cost for both nearby multiples. That one costs more."]],
  });
});

level("Reorder Point");
add(function (r) {
  const x = buy(r), d = x.D / x.days;
  return N({
    story: buyText(r, x, ["demand", "days", "lead", "order"]),
    ask: `What is the daily demand, <b>d</b>? ${R2}`, answer: d, unit: x.c.units + "/day",
    hints: [hintD(x), "d = D ÷ working days per year."],
    steps: [stepD(x), `d = ${n0(x.D)} ÷ ${x.days} = <b>${n2(d)}</b>.`],
    mistakes: [[x.D / 365, `Use ${x.days} working days.`], [x.dm === "month" ? x.M / x.days : -1, "Use annual demand."]],
  });
});
add(function (r) {
  const x = buy(r), d = x.D / x.days, rop = d * x.L;
  return N({
    story: buyText(r, x, ["demand", "days", "lead", "order", "hold"]),
    ask: `Demand is stable and there's no safety stock. What is the reorder point (<b>ROP</b>)? ${R2}`, answer: rop, unit: x.c.units,
    hints: ["ROP = d × L.", "d = D ÷ working days per year."],
    steps: [stepD(x), `d = ${n0(x.D)} ÷ ${x.days} = ${n2(d)}.`, `ROP = ${n2(d)} × ${x.L} = <b>${n2(rop)}</b> ${x.c.units}.`, "Order cost and holding cost aren't needed for the ROP."],
    mistakes: [[(x.D / 365) * x.L, `Use ${x.days} working days.`], [d, `Multiply by the ${x.L}-day lead time.`], [x.dm === "month" ? (x.M / x.days) * x.L : -1, "Use annual demand."]],
  });
});
add(function (r) {
  const x = buy(r), d = x.D / x.days, ss = Math.round(d * r.int(1, 4)), rop = d * x.L + ss;
  return N({
    story: buyText(r, x, ["demand", "days", "lead"]) + ` Because demand varies, ${x.who} keeps ${n0(ss)} ${x.c.units} of safety stock.`,
    ask: `What is the reorder point including safety stock? ${R2}`, answer: rop, unit: x.c.units,
    hints: ["ROP = d × L + ss."],
    steps: [stepD(x), `d = ${n2(d)}.`, `ROP = ${n2(d)} × ${x.L} + ${n0(ss)} = <b>${n2(rop)}</b>.`],
    mistakes: [[d * x.L, "Add the safety stock."], [ss, "Add demand during lead time (d × L)."]],
  });
});
add(function (r) {
  const c = r.pick(BUY), D = r.step(5000, 80000, 100), dpw = r.pick([5, 6]), W = r.pick([50, 51, 52]), wks = r.int(1, 3);
  const days = dpw * W, d = D / days, L = wks * dpw, rop = d * L;
  return N({
    story: `${c.name} uses ${n0(D)} ${c.item} a year. It's open ${dpw} days a week, ${W} weeks a year. Orders take ${wks} ${plural(wks, "week", "weeks")} to arrive.`,
    ask: `What is the reorder point (no safety stock)? ${R2}`, answer: rop, unit: c.units,
    hints: [`Working days per year = ${dpw} × ${W}.`, `Lead time in working days = ${wks} × ${dpw}.`, "ROP = d × L."],
    steps: [`Working days = ${days}; d = ${n0(D)} ÷ ${days} = ${n2(d)}.`, `L = ${wks} × ${dpw} = ${L} working days.`, `ROP = ${n2(d)} × ${L} = <b>${n2(rop)}</b>.`],
    mistakes: [[d * wks, "Lead time must be in working days, not weeks."], [d * wks * 7, `Count working days: ${dpw} per week.`], [(D / 365) * wks * 7, "Use working days for both d and L."]],
  });
});
add(function (r) {
  const x = buy(r), d = x.D / x.days, L2 = x.L + r.int(2, 5), rop2 = d * L2;
  return N({
    story: buyText(r, x, ["demand", "days", "lead"]) + ` The supplier just announced that lead time is increasing to ${L2} working days.`,
    ask: `What is the NEW reorder point (no safety stock)? ${R2}`, answer: rop2, unit: x.c.units,
    hints: ["Use the new lead time in ROP = d × L."],
    steps: [stepD(x), `d = ${n2(d)}.`, `New ROP = ${n2(d)} × ${L2} = <b>${n2(rop2)}</b>. A longer lead time means ordering earlier (at a higher inventory level).`],
    mistakes: [[d * x.L, "That's the old lead time."], [d * (L2 - x.L), "That's only the increase. Use the full new lead time."]],
  });
});

// ================================================================== PART 6: EPQ MATH
part(6, "EPQ (Production Order Quantity)", "For items a business MAKES while selling them: Q*p, maximum and average inventory, runs per year, and costs.");

function epqMistakes(x) {
  const ms = [[eoq(x.D, x.S, x.H), "That's the EOQ formula. For production, multiply H by (1 − d/p) too."], [Math.sqrt((2 * x.D * x.S) / (x.H * (1 - x.p / x.d))) || -1, "Flip the ratio: it's d/p (demand ÷ production), not p/d."], [(2 * x.D * x.S) / (x.H * (1 - x.d / x.p)), "Don't forget the square root."]];
  if (x.hm === "pct") ms.push([epq(x.D, x.S, x.I, x.d, x.p), `H in dollars = ${x.I / 100} × ${usd2(x.P)}.`]);
  if (x.dm === "day") ms.push([epq(x.d, x.S, x.H, x.d, x.p), "D must be annual: d × days."]);
  return ms;
}

level("EPQ Basics");
add(function (r) {
  const x = make(r, { dm: "year" });
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `What is the daily demand, <b>d</b>? ${R2}`, answer: x.d, unit: x.c.units + "/day",
    hints: ["d = D ÷ operating days per year."],
    steps: [stepDp(x)],
    mistakes: [[x.D / 365, `Use ${x.days} operating days.`], [x.p, "That's the production rate p, not demand."]],
  });
});
add(function (r) {
  const x = make(r);
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `What is the optimal production quantity, <b>Q*p</b>? ${R2}`, answer: x.Qs, unit: x.c.units,
    hints: [x.dm === "day" ? "Find annual demand D = d × days." : "Find daily demand d = D ÷ days.", hintH(x), "Q*p = √(2DS ÷ [H(1 − d/p)])."],
    steps: [stepDp(x), stepH(x), `1 − d/p = 1 − ${n0(x.d)}/${n0(x.p)} = ${fmt(1 - x.d / x.p, 4)}.`, `Q*p = √(2 × ${n0(x.D)} × ${n0(x.S)} ÷ (${fmt(x.H, 4)} × ${fmt(1 - x.d / x.p, 4)})) = <b>${n2(x.Qs)}</b>.`],
    mistakes: epqMistakes(x),
  });
});
add(function (r) {
  const x = make(r), mx = x.Qs * (1 - x.d / x.p);
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `Producing Q*p each run, what is the MAXIMUM inventory level? ${R2}`, answer: mx, unit: x.c.units,
    hints: ["Find Q*p first.", "Max inventory = Q(1 − d/p): units made minus units used during the run."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Max = ${n2(x.Qs)} × (1 − ${n0(x.d)}/${n0(x.p)}) = <b>${n2(mx)}</b>.`],
    mistakes: [[x.Qs, "That's Q*p. In EPQ, units are sold during production, so max inventory is Q(1 − d/p)."], [mx / 2, "That's the average. Max = Q(1 − d/p)."]],
  });
});
add(function (r) {
  const x = make(r), avg = (x.Qs * (1 - x.d / x.p)) / 2;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `Producing Q*p each run, what is the AVERAGE inventory level? ${R2}`, answer: avg, unit: x.c.units,
    hints: ["Average = maximum inventory ÷ 2.", "Max = Q*p(1 − d/p)."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}; max = ${n2(x.Qs * (1 - x.d / x.p))}.`, `Average = <b>${n2(avg)}</b>.`],
    mistakes: [[x.Qs / 2, "In EPQ, average = MAX ÷ 2, and max is Q(1 − d/p), not Q."], [avg * 2, "That's the max. Divide by 2."]],
  });
});
add(function (r) {
  const x = make(r), runs = x.D / x.Qs;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `Producing Q*p each run, how many production runs will there be per year? ${R2}`, answer: runs, unit: "runs",
    hints: ["Runs per year = D ÷ Q*p."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Runs = ${n0(x.D)} ÷ ${n2(x.Qs)} = <b>${n2(runs)}</b>.`],
    mistakes: [[x.D / eoq(x.D, x.S, x.H), "That uses the EOQ formula. Use Q*p."], [x.Qs / x.D, "Flip it: D ÷ Q*p."]],
  });
});
add(function (r) {
  const x = make(r), t = x.Qs / x.p;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `How many days does each production run of Q*p take (<b>t</b>)? ${R2}`, answer: t, unit: "days",
    hints: ["Find Q*p.", "t = Q ÷ p: the batch size divided by how fast it's made."],
    steps: [stepDp(x), `Q*p = ${n2(x.Qs)}.`, `t = ${n2(x.Qs)} ÷ ${n0(x.p)} = <b>${n2(t)}</b> days.`],
    mistakes: [[x.Qs / x.d, "Production runs at p per day, not d."], [x.days / (x.D / x.Qs), "That's the time between runs, not the length of a run."]],
  });
});

level("EPQ Costs");
add(function (r) {
  const x = make(r), sc = (x.D / x.Qs) * x.S;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `At Q*p, what is the annual setup cost? ${R2}`, answer: sc, unit: "$",
    hints: ["Annual setup cost = (D ÷ Q*p) × S."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Setup = (${n0(x.D)} ÷ ${n2(x.Qs)}) × ${usd(x.S)} = <b>${usd2(sc)}</b>.`],
    mistakes: [[x.S, "That's one setup. Multiply by runs per year."], [2 * sc, "That's total cost."]],
  });
});
add(function (r) {
  const x = make(r), hc = (x.Qs / 2) * (1 - x.d / x.p) * x.H;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `At Q*p, what is the annual holding cost? ${R2}`, answer: hc, unit: "$",
    hints: ["Annual holding (production) = H × (Q ÷ 2) × (1 − d/p).", "That's H × average inventory."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Holding = ${fmt(x.H, 4)} × (${n2(x.Qs)} ÷ 2) × (1 − ${n0(x.d)}/${n0(x.p)}) = <b>${usd2(hc)}</b>.`],
    mistakes: [[(x.Qs / 2) * x.H, "That's the EOQ holding formula. For EPQ, multiply by (1 − d/p)."], [x.Qs * (1 - x.d / x.p) * x.H, "Use AVERAGE inventory: divide max by 2."]],
  });
});
add(function (r) {
  const x = make(r), tc = (x.D / x.Qs) * x.S + (x.Qs / 2) * (1 - x.d / x.p) * x.H;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold"]),
    ask: `At Q*p, what is the total annual cost (setup + holding)? ${R2}`, answer: tc, unit: "$",
    hints: ["Find setup and holding at Q*p and add.", "At Q*p, setup = holding, so TC = 2 × setup."],
    steps: [stepDp(x), stepH(x), `Q*p = ${n2(x.Qs)}.`, `Setup = ${usd2((x.D / x.Qs) * x.S)}; holding = ${usd2((x.Qs / 2) * (1 - x.d / x.p) * x.H)}.`, `TC = <b>${usd2(tc)}</b>.`],
    mistakes: [[tc / 2, "Add both setup and holding."], [(x.D / x.Qs) * x.S + (x.Qs / 2) * x.H, "Holding cost for EPQ includes (1 − d/p)."]],
  });
});

level("Current Batch vs. EPQ");
add(function (r) {
  const x = make(r), mx = x.Q0 * (1 - x.d / x.p);
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold", "current"]),
    ask: `Using the CURRENT batch size, what is the maximum inventory level? ${R2}`, answer: mx, unit: x.c.units,
    hints: ["Use the current Q, not Q*p.", "Max = Q(1 − d/p)."],
    steps: [stepDp(x), `Max = ${n0(x.Q0)} × (1 − ${n0(x.d)}/${n0(x.p)}) = <b>${n2(mx)}</b>.`],
    mistakes: [[x.Q0, "Units sell during the run, so max = Q(1 − d/p)."], [x.Qs * (1 - x.d / x.p), "That uses Q*p. Use the current batch."]],
  });
});
add(function (r) {
  const x = make(r), tc0 = (x.D / x.Q0) * x.S + (x.Q0 / 2) * (1 - x.d / x.p) * x.H;
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold", "current"]),
    ask: `What is the total annual cost (setup + holding) with the CURRENT batch size? ${R2}`, answer: tc0, unit: "$",
    hints: ["Setup = (D ÷ Q) × S.", "Holding = H × (Q ÷ 2) × (1 − d/p).", "Use the current Q."],
    steps: [stepDp(x), stepH(x), `Setup = (${n0(x.D)} ÷ ${n0(x.Q0)}) × ${usd(x.S)} = ${usd2((x.D / x.Q0) * x.S)}.`, `Holding = ${fmt(x.H, 4)} × (${n0(x.Q0)} ÷ 2) × (1 − ${n0(x.d)}/${n0(x.p)}) = ${usd2((x.Q0 / 2) * (1 - x.d / x.p) * x.H)}.`, `TC = <b>${usd2(tc0)}</b>.`],
    mistakes: [[(x.D / x.Q0) * x.S + (x.Q0 / 2) * x.H, "EPQ holding includes (1 − d/p)."], [(x.D / x.Qs) * x.S + (x.Qs / 2) * (1 - x.d / x.p) * x.H, "That's the cost at Q*p. Use the current batch."]],
  });
});
add(function (r) {
  const x = make(r), tc = (q) => (x.D / q) * x.S + (q / 2) * (1 - x.d / x.p) * x.H, sav = tc(x.Q0) - tc(x.Qs);
  return N({
    story: makeText(r, x, ["demand", "prod", "days", "setup", "hold", "current"]),
    ask: `How much would ${x.c.name} save per year by switching from its current batch size to Q*p? ${R2}`, answer: sav, unit: "$",
    hints: ["TC at current Q, then TC at Q*p.", "Savings = TC(current) − TC(Q*p)."],
    steps: [stepDp(x), stepH(x), `TC(current ${n0(x.Q0)}) = ${usd2(tc(x.Q0))}.`, `Q*p = ${n2(x.Qs)}; TC(Q*p) = ${usd2(tc(x.Qs))}.`, `Savings = <b>${usd2(sav)}</b>.`],
    mistakes: [[tc(x.Q0), "Subtract the cost at Q*p."], [tc(x.Qs), "That's the cost at Q*p. Subtract it from the current cost."], [-sav, "Current minus EPQ should be positive."]],
  });
});

// ================================================================== PART 7: LEAN OPERATIONS (Ch. 16)
part(7, "Lean Operations (Ch. 16)", "Lean, JIT, and TPS; waste and the 5 Ss; variability and throughput; suppliers, layout, and inventory; kanban, scheduling, and quality.");

level("Lean, JIT & TPS");
add(concept({
  q: "Which is NOT one of the three fundamental issues that lean operations address?",
  a: ["Increase batch sizes", "Add inventory buffers"],
  w: ["Eliminate waste", "Remove variability", "Improve throughput"],
  why: "Lean addresses three fundamental issues: eliminate waste, remove variability, and improve throughput.",
}));
add(concept({
  v: [
    { q: "Which approach focuses on continuous FORCED problem solving through a focus on throughput and reduced inventory?", a: "Just-in-time (JIT)" },
    { q: "Which term is the broad approach that includes both JIT and TPS?", a: "Lean operations" },
    { q: "Which system, developed at a car company, emphasizes kaizen, respect for people, and specifying work as to content, sequence, timing, and outcome?", a: "Toyota Production System (TPS)" },
  ],
  pool: ["Just-in-time (JIT)", "Toyota Production System (TPS)", "Lean operations", "Material requirements planning"],
  notes: { "Just-in-time (JIT)": "JIT: forced problem solving through throughput and reduced inventory.", "Toyota Production System (TPS)": "TPS: continuous improvement, respect for people, standard work practices.", "Lean operations": "Lean encompasses both JIT and TPS.", "Material requirements planning": "MRP isn't part of this chapter's lean family." },
  why: "JIT = forced problem solving via throughput and reduced inventory. TPS = continuous improvement, respect for people, standard work. Lean encompasses both.",
}));
const TPS_TERMS = ["Jidoka", "Kaizen", "Gemba walk", "Poka-yoke", "Kanban"];
add(concept({
  v: [
    { q: "A worker spots a defect and stops the production line until it's fixed. What is this called?", a: "Jidoka" },
    { q: "A company builds a culture where improving every process is part of everyone's job. What is this called?", a: "Kaizen" },
    { q: "Managers walk the factory floor to see the work being done firsthand. What is this called?", a: "Gemba walk" },
  ],
  pool: TPS_TERMS,
  notes: { Jidoka: "Jidoka: stopping production because of a defect.", Kaizen: "Kaizen: continuous improvement of all processes.", "Gemba walk": "Gemba walk: going to see work being performed.", "Poka-yoke": "Poka-yoke: a foolproof device or method that prevents mistakes.", Kanban: "Kanban: a signal that authorizes production or movement." },
  why: "TPS and lean vocabulary: jidoka (stop for defects), kaizen (continuous improvement), gemba walks (go see the work), poka-yoke (foolproofing), kanban (pull signals).",
}));
add(concept({
  q: "In TPS, \"respect for people\" means:",
  a: "Treating employees as knowledge workers and engaging their mental and physical capabilities",
  w: [["Never asking employees to change how they work", "TPS expects constant improvement."], ["Giving all decisions to top management", "TPS empowers employees and improves at the lowest possible level."], ["Paying higher wages than competitors", "That's not what the term means here."]],
  why: "TPS treats people as knowledge workers, engages their mental and physical capabilities, and empowers them.",
}));
add(concept({
  q: "In TPS standard work practice, work is completely specified as to:",
  a: "Content, sequence, timing, and outcome",
  w: [["Price, quantity, and supplier", "That's purchasing, not standard work."], ["Only the final outcome", "TPS specifies content, sequence, timing, AND outcome."], ["Whatever each worker prefers that day", "Standard work removes that variation."]],
  why: "TPS standard work: work is specified as to content, sequence, timing, and outcome, and improvement follows the scientific method at the lowest possible level.",
}));
add(concept({
  q: "Lean and sustainability are described as \"two sides of the same coin.\" What is their common ground?",
  a: "Driving out waste",
  w: [["Increasing inventory buffers", "Both try to reduce excess."], ["Using more suppliers", "Not the common ground."], ["Larger production batches", "Lean prefers small lots."]],
  why: "Lean and sustainability both maximize resource use and economic efficiency; driving out waste is the common ground.",
}));

level("Waste & the 5 Ss");
const WASTES = ["Transportation", "Queues (waiting)", "Defective products", "Overprocessing", "Motion", "Overproduction", "Inventory"];
const WASTE_NOTES = { Transportation: "Transportation: moving materials more than needed.", "Queues (waiting)": "Queues: work sitting idle, waiting.", "Defective products": "Defects: scrap and rework.", Overprocessing: "Overprocessing: doing more work than the customer values.", Motion: "Motion: unnecessary movement of PEOPLE (reaching, walking, searching).", Overproduction: "Overproduction: making more, or sooner, than needed.", Inventory: "Inventory: excess stock that hides problems." };
add(concept({
  v: [
    { q: "Workers walk 200 feet across the shop several times an hour to get the same tools. Which of Ohno's seven wastes?", a: "Motion" },
    { q: "Parts are forklifted between three buildings before final assembly. Which waste?", a: "Transportation" },
    { q: "A plant makes 500 units because the machine is already set up, even though customers ordered 300. Which waste?", a: "Overproduction" },
    { q: "A shop polishes the inside of a bracket that no customer will ever see. Which waste?", a: "Overprocessing" },
    { q: "Jobs sit stacked in front of a slow machine for two days. Which waste?", a: "Queues (waiting)" },
    { q: "One in ten units has to be scrapped or reworked. Which waste?", a: "Defective products" },
  ],
  pool: WASTES, notes: WASTE_NOTES,
  why: "Ohno's seven wastes: transportation, queues, defective products, overprocessing, motion, overproduction, and inventory.",
}));
add(concept({
  q: "Which of these is NOT one of Ohno's seven wastes?",
  a: ["Training employees", "Preventive maintenance", "Customer service"],
  w: WASTES.slice(),
  why: "The seven wastes are transportation, queues, defective products, overprocessing, motion, overproduction, and inventory.",
}));
add(concept({
  q: "In lean, waste is defined as:",
  a: "Anything that does not add value from the customer's point of view",
  w: [["Anything that costs more than $100", "Waste is about value, not dollar size."], ["Only scrap and defects", "Defects are one of seven wastes."], ["Anything management didn't approve", "Waste is judged from the customer's view."]],
  why: "Waste is anything that does not add value from the customer's point of view. Storage, inspection, delay, waiting in queues, and defects are 100% non-value-added.",
}));
const FIVE_S = ["Sort/segregate", "Simplify/straighten", "Shine/sweep", "Standardize", "Sustain/self-discipline"];
add(concept({
  v: [
    { q: "A team removes everything from a work cell that isn't needed: \"When in doubt, throw it out.\" Which S?", a: "Sort/segregate" },
    { q: "A team outlines each tool's spot on a shadow board so every tool has a home. Which S?", a: "Simplify/straighten" },
    { q: "Each shift ends with a quick cleaning of the work area. Which S?", a: "Shine/sweep" },
    { q: "A team writes one procedure so every shift does the job the same way, removing variation. Which S?", a: "Standardize" },
    { q: "Managers review work regularly and recognize progress so the improvements stick. Which S?", a: "Sustain/self-discipline" },
  ],
  pool: FIVE_S,
  notes: { "Sort/segregate": "Sort: when in doubt, throw it out.", "Simplify/straighten": "Simplify/straighten: methods analysis tools; a place for everything.", "Shine/sweep": "Shine: clean daily.", Standardize: "Standardize: remove variations from processes.", "Sustain/self-discipline": "Sustain: review work and recognize progress." },
  why: "The 5 Ss: sort, simplify/straighten, shine/sweep, standardize, sustain. Many firms add two more: safety and support/maintenance.",
}));
add(concept({
  q: "Some firms add two more Ss to the 5 Ss. Which two?",
  a: "Safety and support/maintenance",
  w: [["Speed and savings", "Not the added Ss."], ["Sales and service", "Not the added Ss."], ["Scheduling and suppliers", "Not the added Ss."]],
  why: "Two additional Ss: safety (build in good practices) and support/maintenance (reduce variability and unplanned downtime).",
}));

level("Variability, Throughput & Setup");
add(concept({
  q: ["In lean, variability is:", "Lean defines variability as:"],
  a: "Any deviation from the optimum process",
  w: [["A healthy sign of flexibility", "Lean works to REDUCE variability."], ["Only changes in customer demand", "Variability can be internal or external."], ["The difference between price and cost", "That's margin."]],
  why: "Variability is any deviation from the optimum process. Inventory hides variability, and less variability means less waste.",
}));
add(concept({
  q: "Which is a source of variability?",
  a: ["Inadequate maintenance", "Incomplete or inaccurate drawings, specifications, or bills of material", "Poor processes that make improper quantities or late units", "Unknown and changing customer demands"],
  w: [["Level schedules", "Level schedules REDUCE variability."], ["Cross-trained workers", "Cross-training adds flexibility."], ["Standardized containers", "Standardization reduces variability."]],
  why: "Sources of variability: poor processes, inadequate maintenance, unknown and changing customer demand, and incomplete or inaccurate drawings, specs, and bills of material.",
}));
add(concept({
  v: [
    { q: "The time from when raw materials arrive until the finished order ships is called:", a: "Manufacturing cycle time" },
    { q: "Each station makes more only when the station after it signals that it needs more. This is a:", a: "Pull system" },
    { q: "Each station keeps producing and sends work downstream whether or not the next station needs it. This is a:", a: "Push system" },
  ],
  pool: ["Manufacturing cycle time", "Pull system", "Push system", "Lead time"],
  why: "Throughput improves with a pull system, which moves small lots, removes inventory cushions, exposes problems, and reduces manufacturing cycle time. Push systems dump orders downstream regardless of need.",
}));
add(concept({
  q: "Lean compares inventory to water hiding rocks in a river. Lowering inventory:",
  a: "Exposes problems (the \"rocks\") so they can be fixed",
  w: [["Creates new problems that weren't there before", "The problems were already there, just hidden."], ["Makes the process less efficient forever", "Fixing exposed problems improves the process."], ["Increases holding cost", "Less inventory lowers holding cost."]],
  why: "Reducing inventory uncovers the \"rocks\" (problems) so they're exposed and fixed. Shingo said, \"Inventory is evil.\"",
}));
add(concept({
  q: "What happens when setup costs are reduced?",
  a: "Lot sizes get smaller and average inventory goes down",
  w: [["Lot sizes get larger", "High setup costs encourage LARGE lots."], ["Holding cost per unit goes up", "Setup cost doesn't change H."], ["The EOQ gets bigger", "Lower S means smaller Q*."]],
  why: "High setup costs encourage large lots. Reducing setup costs reduces lot size and average inventory. Setup time can be cut by preparing before shutdown and changeover.",
}));
add(concept({
  q: "How can setup time be reduced?",
  a: "Do as much preparation as possible before the machine is shut down for changeover",
  w: [["Make bigger batches so setups happen less often", "That avoids setups instead of shortening them, and adds inventory."], ["Wait until the machine stops to gather tools", "That ADDS idle time."], ["Add inspection after each setup", "That doesn't shorten the setup."]],
  why: "Setup time can be reduced through preparation prior to shutdown and changeover.",
}));

level("Suppliers, Layout & Inventory");
add(concept({
  q: "Which is NOT a goal of JIT supplier partnerships?",
  a: "Increase in-transit inventory",
  w: ["Remove unnecessary activities", "Remove in-plant inventory", "Improve quality and reliability", "Remove in-transit inventory"],
  why: "Four goals of supplier partnerships: removal of unnecessary activities, removal of in-plant inventory, removal of in-transit inventory, and improved quality and reliability.",
}));
add(concept({
  v: [
    { q: "A supplier worries that tying itself to one big JIT customer puts all its eggs in one basket. Which supplier concern is this?", a: "Diversification" },
    { q: "A supplier worries that delivering small lots several times a day will shift costs onto it. Which concern?", a: "Lot sizes" },
    { q: "A supplier doubts the customer can create a smooth, steady schedule. Which concern?", a: "Scheduling" },
    { q: "A supplier worries that with very short lead times, any engineering change will cause problems. Which concern?", a: "Lead time" },
    { q: "A supplier worries its processes and capital budget limit how much it can improve its quality. Which concern?", a: "Quality" },
  ],
  pool: ["Diversification", "Scheduling", "Lead time", "Quality", "Lot sizes"],
  why: "Supplier concerns with JIT partnerships: diversification, scheduling, lead time, quality, and lot sizes.",
}));
add(concept({
  q: ["Which is a lean LAYOUT tactic?", "A plant is redesigning its floor for lean. Which tactic fits?"],
  a: ["Build work cells for families of products", "Design little space for inventory", "Minimize distance between operations", "Cross-train workers to add flexibility", "Build flexible or movable equipment"],
  w: [["Add large storage areas between every station", "Lean layouts design little space for inventory."], ["Spread operations out across a large area", "Lean includes many operations in a small area."], ["Keep each worker on one task only", "Lean cross-trains for flexibility."]],
  why: "Table 16.1 lean layout tactics: work cells for product families, many operations in a small area, minimize distance, little space for inventory, better communication, poka-yoke, flexible equipment, cross-trained workers.",
}));
add(concept({
  q: ["A connector that physically only fits into the correct port, so it can't be installed wrong, is an example of:", "A fixture that won't let a part be loaded backward is an example of:"],
  a: "Poka-yoke",
  w: [["Kanban", "Kanban is a signal for production."], ["Jidoka", "Jidoka is stopping production for a defect."], ["Kaizen", "Kaizen is continuous improvement."]],
  why: "Poka-yoke devices are foolproof (fail-safe) methods that prevent mistakes. They appear in lean layout and lean quality tactics.",
}));
add(concept({
  q: "Which is a lean INVENTORY tactic?",
  a: ["Deliver directly to the point of use", "Use a pull system to move inventory", "Reduce lot sizes", "Develop just-in-time delivery systems with suppliers", "Reduce setup time"],
  w: [["Order in the largest lots possible to cut ordering costs", "Lean reduces lot sizes."], ["Keep big buffers between every operation", "Lean keeps inventory at the minimum needed."], ["Push inventory to downstream stations", "Lean uses PULL."]],
  why: "Table 16.2 lean inventory tactics: pull system, reduce lot sizes, JIT delivery with suppliers, deliver to point of use, perform to schedule, reduce setup time, use group technology.",
}));
add(concept({
  q: "With little or no inventory buffer in a lean system, what becomes critical for employees?",
  a: "Getting it right the first time",
  w: [["Working as fast as possible regardless of quality", "With no buffer, mistakes stop the line."], ["Staying on one narrow task", "Lean cross-trains for flexibility."], ["Building extra units just in case", "That's overproduction."]],
  why: "Lean cross-trains employees, improves communication, and with little or no inventory buffer, getting it right the first time is critical.",
}));

level("Kanban, Scheduling & Quality");
add(concept({
  q: ["In a kanban system, the card (or other signal) is:", "What does a kanban signal mean?"],
  a: "An authorization to produce or move the next container of material",
  w: [["A record of defects found", "That's quality tracking."], ["A bill sent to the customer", "Kanban is an internal production signal."], ["A forecast of next month's demand", "Kanban responds to actual use; it pulls."]],
  why: "Kanban is the Japanese word for card. The signal authorizes the next container to be produced. A sequence of kanbans pulls material through the process.",
}));
add(concept({
  q: "When the producer and user can SEE each other, what can serve as a kanban signal instead of a card?",
  a: "A light, a flag, or an empty spot on the floor",
  w: [["An email to the purchasing department", "Kanban signals are simple and visual."], ["The monthly forecast", "Kanban is triggered by use, not forecasts."], ["Nothing: kanban only works with cards", "Many kinds of signals work."]],
  why: "When producer and user aren't in visual contact, a card is used. Otherwise a light, flag, or empty spot on the floor may be enough; it's still called kanban.",
}));
add(concept({
  q: "Kanban cards provide direct control over, and a limit on:",
  a: "The amount of work-in-process between cells",
  w: [["The price paid to suppliers", "Not what kanban controls."], ["The number of employees", "Not what kanban controls."], ["Annual demand", "Kanban responds to demand; it doesn't limit it."]],
  why: "Kanban cards directly control and limit work-in-process between cells. Small containers require tight schedules and smooth operations, and shortages show up immediately.",
}));
add(concept({
  q: ["A level schedule means:", "Which describes lean (level) scheduling?"],
  a: ["Processing frequent small batches rather than a few large batches", "Seeking one-piece-make and one-piece-move"],
  w: [["Running one product all month, then switching", "That's large-batch scheduling."], ["Changing the schedule constantly right up to the due date", "Lean FREEZES the part of the schedule closest to due dates."], ["Hiding the schedule from suppliers", "Lean communicates schedules to suppliers."]],
  why: "Lean scheduling: level schedules (frequent small batches), kanbans, communicate schedules to suppliers, freeze part of the schedule, perform to schedule, one-piece-make/move, small lots, a perfect part every time.",
}));
add(concept({
  q: "Why does lean (JIT) make it cheaper to get good quality?",
  a: "JIT exposes poor quality, and shorter lead times expose problems sooner",
  w: [["Lean adds more final inspection", "Lean builds quality in instead of inspecting it in."], ["Lean uses bigger batches to average out defects", "Small lots expose problems."], ["Lean ignores quality to cut cost", "Lean and quality are strongly related."]],
  why: "Lean cuts the cost of good quality because JIT exposes poor quality, shorter lead times expose problems sooner, and better quality means fewer buffers.",
}));
add(concept({
  q: "Which is NOT a lean quality tactic?",
  a: "Inspect only at the end of the line, in large lots",
  w: ["Use statistical process control", "Empower employees", "Build fail-safe methods (poka-yoke, checklists)", "Expose poor quality with small lots", "Provide immediate feedback"],
  why: "Table 16.4 lean quality tactics: SPC, empower employees, fail-safe methods, expose poor quality with small lots, provide immediate feedback.",
}));

// ================================================================== PART 8: EXAM-STYLE CASES
part(8, "Exam-Style Cases", "Longer stories with several questions each, like the exam. Every step is required (no testing out).");

function caseA(r) {
  const x = buy(r, { dm: "month", hm: "pct" });
  const fee = r.int(10, 40), ship = r.money(8, 30);
  x.S = fee + ship; x.fee = fee; x.ship = ship; x.Qs = eoq(x.D, x.S, x.H); x.Q0 = nice(x.Qs * r.pick([0.5, 2, 2.5]));
  const c = x.c;
  x.story = `${x.who} just took over as ${c.role} at ${c.name}. ${c.name} goes through about ${n0(x.M)} ${c.item} a month and is open ${x.days} days a year. Each ${c.unit} costs ${usd2(x.P)}. Accounting estimates that keeping a ${c.unit} in stock for a year costs ${x.I}% of its price. Every order takes about ${usd(fee)} of staff time to place, and the supplier adds a ${usd2(ship)} delivery fee per order. Orders arrive ${x.L} working days after they're placed. The previous manager always ordered ${n0(x.Q0)} ${c.units} at a time.`;
  return x;
}
level("Case A: Ordering for a Business", { noTestOut: true, intro: "One business, five questions. The story is the same for every step; click New numbers on any step to get a new version of the whole case." });
add(function (r) {
  const x = caseA(r);
  return N({ story: x.story, ask: `<span class="step-tag">Step 1 of 5</span> What is <b>H</b>, the holding cost per ${x.c.unit} per year? ${R4}`, answer: x.H, dec: 4, unit: "$", hints: [hintH(x)], steps: [stepH(x)], mistakes: [[x.I, "Turn the percent into dollars."], [x.P * x.I, "Write the percent as a decimal."]] });
}, { caseKey: "caseA" });
add(function (r) {
  const x = caseA(r);
  return N({ story: x.story, ask: `<span class="step-tag">Step 2 of 5</span> What is the EOQ, <b>Q*</b>? ${R2}`, answer: x.Qs, unit: x.c.units, hints: ["D is annual: monthly × 12.", "S = staff time + delivery fee (both happen once per order).", "Q* = √(2DS ÷ H)."], steps: [stepD(x), `S = ${usd(x.fee)} + ${usd2(x.ship)} = ${usd2(x.S)} per order (staff time + delivery fee)`, stepH(x), `Q* = <b>${n2(x.Qs)}</b>.`], mistakes: eoqMistakes(x).concat([[eoq(x.D, x.fee, x.H), "S includes BOTH the staff time and the delivery fee."], [eoq(x.D, x.ship, x.H), "S includes BOTH the staff time and the delivery fee."]]) });
}, { caseKey: "caseA" });
add(function (r) {
  const x = caseA(r), Nn = x.D / x.Qs;
  return N({ story: x.story, ask: `<span class="step-tag">Step 3 of 5</span> Ordering Q*, how many orders will ${x.c.name} place per year? ${R2}`, answer: Nn, unit: "orders", hints: ["N = D ÷ Q*."], steps: [stepD(x), `Q* = ${n2(x.Qs)}.`, `N = <b>${n2(Nn)}</b>.`], mistakes: [[x.Qs / x.D, "N = D ÷ Q*."], [x.M / x.Qs, "Use annual demand."]] });
}, { caseKey: "caseA" });
add(function (r) {
  const x = caseA(r), tc = (x.D / x.Qs) * x.S + (x.Qs / 2) * x.H;
  return N({ story: x.story, ask: `<span class="step-tag">Step 4 of 5</span> What is the total annual cost (ordering + holding) at Q*? ${R2}`, answer: tc, unit: "$", hints: ["TC = (D ÷ Q*) × S + (Q* ÷ 2) × H."], steps: [`Setup = ${usd2((x.D / x.Qs) * x.S)}; holding = ${usd2((x.Qs / 2) * x.H)}.`, `TC = <b>${usd2(tc)}</b>.`], mistakes: [[tc / 2, "Add both costs."], [tc + x.P * x.D, "This doesn't include product cost."]] });
}, { caseKey: "caseA" });
add(function (r) {
  const x = caseA(r), tc = (q) => (x.D / q) * x.S + (q / 2) * x.H, sav = tc(x.Q0) - tc(x.Qs);
  return N({ story: x.story, ask: `<span class="step-tag">Step 5 of 5</span> How much will ${x.c.name} save per year by ordering Q* instead of the previous manager's quantity? ${R2}`, answer: sav, unit: "$", hints: ["TC at the old quantity minus TC at Q*."], steps: [`TC(${n0(x.Q0)}) = ${usd2(tc(x.Q0))}.`, `TC(Q*) = ${usd2(tc(x.Qs))}.`, `Savings = <b>${usd2(sav)}</b>.`], mistakes: [[tc(x.Q0), "Subtract TC at Q*."], [-sav, "Old minus new."]] });
}, { caseKey: "caseA" });

function caseB(r) {
  const c = r.pick(MAKE), who = r.pick(FIRST), wk = r.step(c.d[0] * 5, c.d[1] * 5, 50), W = r.int(48, 52), dpw = 5;
  const days = dpw * W, D = wk * W, d = D / days;
  let p = Math.round((d * (1.5 + r.next() * 1.5)) / 5) * 5; if (p <= d + 5) p = Math.round(d + 20);
  const P = r.money(c.P[0], c.P[1]), I = r.pick([12, 15, 18, 20, 25]), H = (P * I) / 100;
  const crew = r.int(2, 4), hr = r.pick([1, 1.5, 2]), wage = r.money(16, 28), sup = r.int(25, 120), S = crew * hr * wage + sup;
  const Qs = epq(D, S, H, d, p);
  const story = `${who} plans production at ${c.name}. Customers buy about ${n0(wk)} ${c.item} a week. The plant runs ${dpw} days a week, ${W} weeks a year, and can make ${n0(p)} ${c.units} a day. Each ${c.unit} costs ${usd2(P)} to make, and holding one for a year costs ${I}% of that. A changeover takes ${crew} workers ${hr} ${plural(hr, "hour", "hours")} at ${usd2(wage)} an hour, plus ${usd(sup)} in materials.`;
  return { c, who, wk, W, dpw, days, D, d, p, P, I, H, S, Qs, crew, hr, wage, sup, story };
}
level("Case B: Making It In-House", { noTestOut: true, intro: "A manufacturer that sells while it produces: EPQ. Five questions on one story." });
add(function (r) {
  const x = caseB(r);
  return N({ story: x.story, ask: `<span class="step-tag">Step 1 of 5</span> What is the daily demand, <b>d</b>? ${R2}`, answer: x.d, unit: x.c.units + "/day", hints: ["Weekly demand ÷ operating days per week."], steps: [`d = ${n0(x.wk)} ÷ ${x.dpw} = <b>${n2(x.d)}</b>.`], mistakes: [[x.wk / 7, `The plant runs ${x.dpw} days a week.`]] });
}, { caseKey: "caseB" });
add(function (r) {
  const x = caseB(r);
  return N({ story: x.story, ask: `<span class="step-tag">Step 2 of 5</span> What is the optimal production quantity, <b>Q*p</b>? ${R2}`, answer: x.Qs, unit: x.c.units, hints: [`D = ${n0(x.wk)} × ${x.W} weeks.`, "S = crew labor + materials. H = I × P.", "Q*p = √(2DS ÷ [H(1 − d/p)])."], steps: [`D = ${n0(x.wk)} × ${x.W} = ${n0(x.D)}.`, `S = ${x.crew} × ${x.hr} × ${usd2(x.wage)} + ${usd(x.sup)} = ${usd2(x.S)}.`, `H = ${x.I / 100} × ${usd2(x.P)} = ${usd4(x.H)}.`, `Q*p = <b>${n2(x.Qs)}</b>.`], mistakes: [[eoq(x.D, x.S, x.H), "That's EOQ. Include (1 − d/p)."], [epq(x.wk * 52, x.S, x.H, x.d, x.p), `Use ${x.W} weeks, not 52.`], [epq(x.D, x.crew * x.hr * x.wage, x.H, x.d, x.p), "S includes the materials too."]] });
}, { caseKey: "caseB" });
add(function (r) {
  const x = caseB(r), mx = x.Qs * (1 - x.d / x.p);
  return N({ story: x.story, ask: `<span class="step-tag">Step 3 of 5</span> Producing Q*p, what is the maximum inventory level? ${R2}`, answer: mx, unit: x.c.units, hints: ["Max = Q(1 − d/p)."], steps: [`Max = ${n2(x.Qs)} × (1 − ${n2(x.d)}/${n0(x.p)}) = <b>${n2(mx)}</b>.`], mistakes: [[x.Qs, "Max inventory is less than Q in EPQ."], [mx / 2, "That's average."]] });
}, { caseKey: "caseB" });
add(function (r) {
  const x = caseB(r), runs = x.D / x.Qs;
  return N({ story: x.story, ask: `<span class="step-tag">Step 4 of 5</span> How many production runs per year? ${R2}`, answer: runs, unit: "runs", hints: ["Runs = D ÷ Q*p."], steps: [`Runs = ${n0(x.D)} ÷ ${n2(x.Qs)} = <b>${n2(runs)}</b>.`], mistakes: [[x.Qs / x.D, "D ÷ Q*p."]] });
}, { caseKey: "caseB" });
add(function (r) {
  const x = caseB(r), tc = (x.D / x.Qs) * x.S + (x.Qs / 2) * (1 - x.d / x.p) * x.H;
  return N({ story: x.story, ask: `<span class="step-tag">Step 5 of 5</span> What is the total annual cost (setup + holding) at Q*p? ${R2}`, answer: tc, unit: "$", hints: ["Setup = (D ÷ Q) × S; holding = H × (Q ÷ 2) × (1 − d/p)."], steps: [`Setup = ${usd2((x.D / x.Qs) * x.S)}; holding = ${usd2((x.Qs / 2) * (1 - x.d / x.p) * x.H)}.`, `TC = <b>${usd2(tc)}</b>.`], mistakes: [[tc / 2, "Add both."], [(x.D / x.Qs) * x.S + (x.Qs / 2) * x.H, "EPQ holding includes (1 − d/p)."]] });
}, { caseKey: "caseB" });

function caseC(r) {
  const x = scBiz(r), f = [0.3, 0.25, 0.25]; const invs = f.map((k) => Math.round(x.inv * k)); invs.push(x.inv - invs[0] - invs[1] - invs[2]);
  const mo = Math.round(x.cogs / 12); x.cogs = mo * 12; x.mo = mo; x.invs = invs;
  x.story = `${x.who} is preparing a supply chain report for ${x.c.name}. Average inventory at each location:${tableRows(x.c.locs.map((l, i) => [l, money0(invs[i])]))}Company totals: total assets ${money0(x.assets)}; net revenue ${money0(x.rev)}; cost of goods sold averages ${money0(mo)} per month.`;
  return x;
}
level("Case C: The Supply Chain Report", { noTestOut: true, intro: "Three supply chain metrics from one set of financials." });
add(function (r) {
  const x = caseC(r), a = (x.inv / x.assets) * 100;
  return N({ story: x.story, ask: `<span class="step-tag">Step 1 of 3</span> What percent of total assets is invested in inventory? ${R2}`, answer: a, unit: "%", hints: ["Add the four locations' inventory.", "÷ total assets × 100."], steps: [`Inventory = ${money0(x.inv)}.`, `% = <b>${n2(a)}%</b>.`], mistakes: [[a / 100, "× 100."], [(x.invs[0] / x.assets) * 100, "Use all four locations."]] });
}, { caseKey: "caseC" });
add(function (r) {
  const x = caseC(r), t = x.cogs / x.inv;
  return N({ story: x.story, ask: `<span class="step-tag">Step 2 of 3</span> What is the annual inventory turnover? ${R2}`, answer: t, unit: "times", hints: ["Annual COGS = monthly × 12.", "Turnover = annual COGS ÷ inventory."], steps: [`Annual COGS = ${money0(x.mo)} × 12 = ${money0(x.cogs)}.`, `Turnover = ${money0(x.cogs)} ÷ ${money0(x.inv)} = <b>${n2(t)}</b>.`], mistakes: [[x.mo / x.inv, "Use annual COGS."], [x.rev / x.inv, "Use COGS, not revenue."]] });
}, { caseKey: "caseC" });
add(function (r) {
  const x = caseC(r), w = x.inv / (x.cogs / 52);
  return N({ story: x.story, ask: `<span class="step-tag">Step 3 of 3</span> How many weeks of supply? ${R2}`, answer: w, unit: "weeks", hints: ["Weekly COGS = annual COGS ÷ 52."], steps: [`Weekly COGS = ${money0(x.cogs)} ÷ 52 = ${usd2(x.cogs / 52)}.`, `Weeks = ${money0(x.inv)} ÷ ${usd2(x.cogs / 52)} = <b>${n2(w)}</b>.`], mistakes: [[x.inv / x.mo, "That's months. Use weekly COGS."], [x.inv / x.cogs, "Divide by WEEKLY COGS."]] });
}, { caseKey: "caseC" });

function caseD(r) {
  const prod = r.pick([["Black Belt Fertilizer", "lawn fertilizer"], ["Cahaba Mills", "stone-ground grits"], ["Southern Seed Co.", "grass seed"], ["Mountain Brook Pet Treats", "dog food"]]);
  const lb = r.pick([20, 25, 40, 50]), W = r.pick([48, 50, 52]), dpw = 5;
  const wk = r.step(20000, 150000, 5000), cap = Math.round((wk * (1.6 + r.next() * 1.4)) / 5000) * 5000 || wk * 2;
  const hb = r.money(0.3, 1.5), S = r.int(150, 600);
  const D = wk * W, d = wk / dpw, p = cap / dpw, H = hb / lb, Qs = epq(D, S, H, d, p), Q0 = nice(Qs * r.pick([0.5, 1.8, 2.2]));
  const story = `${prod[0]} makes ${prod[1]} and sells it in ${lb}-lb. bags. Demand is steady at ${n0(wk)} lbs. per week, and the plant runs ${dpw} days a week, ${W} weeks a year. The line can produce ${n0(cap)} lbs. per week. Each production run costs ${usd(S)} to set up. Holding costs ${usd2(hb)} per bag per year. Right now the plant runs batches of ${n0(Q0)} lbs. <b>Do all calculations in pounds.</b>`;
  return { lb, W, dpw, wk, cap, hb, S, D, d, p, H, Qs, Q0, story };
}
level("Case D: Bags and Pounds", { noTestOut: true, intro: "A unit-conversion case: demand in pounds, holding cost per bag. Get the units to match before anything else." });
add(function (r) {
  const x = caseD(r);
  return N({ story: x.story, ask: `<span class="step-tag">Step 1 of 4</span> What is <b>H</b> per pound per year? ${R4}`, answer: x.H, dec: 4, unit: "$", hints: ["H is per bag. Divide by pounds per bag."], steps: [`H = ${usd2(x.hb)} ÷ ${x.lb} = <b>${usd4(x.H)}</b> per lb.`], mistakes: [[x.hb, "That's per bag."], [x.hb * x.lb, "Divide, don't multiply."]] });
}, { caseKey: "caseD" });
add(function (r) {
  const x = caseD(r), mx = x.Q0 * (1 - x.d / x.p);
  return N({ story: x.story, ask: `<span class="step-tag">Step 2 of 4</span> With the CURRENT batch size, what is the maximum inventory in pounds? ${R2}`, answer: mx, unit: "lbs.", hints: ["d/p can use weekly numbers too, as long as both are weekly: demand ÷ capacity.", "Max = Q(1 − d/p)."], steps: [`d/p = ${n0(x.wk)} ÷ ${n0(x.cap)} = ${fmt(x.wk / x.cap, 4)}.`, `Max = ${n0(x.Q0)} × (1 − ${fmt(x.wk / x.cap, 4)}) = <b>${n2(mx)}</b> lbs.`], mistakes: [[x.Q0, "Max is less than Q because product sells during the run."], [x.Q0 * (1 - x.p / x.d), "Flip it: d/p is demand ÷ production."]] });
}, { caseKey: "caseD" });
add(function (r) {
  const x = caseD(r);
  return N({ story: x.story, ask: `<span class="step-tag">Step 3 of 4</span> What is the optimal batch size, <b>Q*p</b>, in pounds? ${R2}`, answer: x.Qs, unit: "lbs.", hints: [`D = ${n0(x.wk)} × ${x.W} weeks.`, "Use H per pound from Step 1.", "Q*p = √(2DS ÷ [H(1 − d/p)])."], steps: [`D = ${n0(x.D)} lbs.; H = ${usd4(x.H)}; 1 − d/p = ${fmt(1 - x.d / x.p, 4)}.`, `Q*p = <b>${n2(x.Qs)}</b> lbs.`], mistakes: [[epq(x.D, x.S, x.hb, x.d, x.p), "Use H per POUND, not per bag."], [eoq(x.D, x.S, x.H), "Include (1 − d/p)."], [epq(x.wk * 52, x.S, x.H, x.d, x.p), `Use ${x.W} weeks.`]] });
}, { caseKey: "caseD" });
add(function (r) {
  const x = caseD(r), tc = (q) => (x.D / q) * x.S + (q / 2) * (1 - x.d / x.p) * x.H, sav = tc(x.Q0) - tc(x.Qs);
  return N({ story: x.story, ask: `<span class="step-tag">Step 4 of 4</span> How much would the plant save per year by switching to Q*p? ${R2}`, answer: sav, unit: "$", hints: ["TC = (D ÷ Q) × S + H × (Q ÷ 2) × (1 − d/p).", "Savings = TC(current) − TC(Q*p)."], steps: [`TC(current) = ${usd2(tc(x.Q0))}.`, `TC(Q*p) = ${usd2(tc(x.Qs))}.`, `Savings = <b>${usd2(sav)}</b>.`], mistakes: [[tc(x.Q0), "Subtract TC at Q*p."], [-sav, "Current minus optimal."]] });
}, { caseKey: "caseD" });

// ================================================================== export
const Bank = { BANK, LEVEL_INFO, VAR_CARD, rand, fmt, eoq, epq };
if (typeof module !== "undefined" && module.exports) module.exports = Bank;
root.Bank = Bank;
})(typeof window !== "undefined" ? window : globalThis);
