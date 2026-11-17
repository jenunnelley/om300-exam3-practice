# OM 300 Exam 3 Practice Lab

A self-paced practice site for OM 300 Exam 3 (Chapter 11 Supply Chain Management, Chapter 12 Inventory Management, Chapter 16 Lean Operations). Students answer story problems and concept questions right in the browser and get instant, specific feedback. Nothing to install, no accounts, and nothing is sent anywhere.

Built the same way as the OM 305 Excel Practice Lab.

## Put it online with GitHub Pages (about 10 minutes, free)

1. Go to **github.com** and sign in.
2. Click **+** (top right), then **New repository**. Name it `om300-exam3-practice`, choose **Public**, and click **Create repository**.
3. Click **uploading an existing file**.
4. Drag in these files: `index.html`, `app.js`, `problems.js`, `style.css`, `README.md`.
   (The `dev` folder is only for testing. Don't upload it.)
5. Click **Commit changes**.
6. Go to **Settings**, then **Pages**. Under **Branch**, choose **main** and **/ (root)**, then click **Save**.
7. Wait 1–2 minutes and refresh. Your link appears at the top, like `https://YOUR-USERNAME.github.io/om300-exam3-practice/`.
8. Open `blackboard-button.html` and `blackboard-intro.html`. If your link is different from the one in them, change it. Paste either into a Blackboard item (HTML view).

## What's in it

**194 problems in 8 parts, 37 levels.** Every problem is a template, so **New numbers** gives a fresh version with new businesses, names, and numbers.

| Part | Topics |
|---|---|
| 1. Know Your Variables | Find D, H, S, d, p, L, ss, Q, and N in stories written the long way around: monthly/weekly/quarterly demand, closed weeks, % of customers, cases vs. units, H as a % of price, H per month, H from a stack of cost categories, H per bag vs. per pound, S from several per-order fees or crew labor, lead time in weeks. Also: EOQ or EPQ? Which number isn't needed? A "Variable Gauntlet" with every variable hidden in one long story. |
| 2. Supply Chain Concepts (Ch. 11) | Strategy (Table 11.2), the six sourcing strategies, forward vs. backward integration, risk, the bullwhip effect, integration issues and opportunities (VMI, CPFR, blanket orders, postponement, drop shipping...), suppliers, shipping systems, warehousing functions, 3PL, reverse logistics, benchmarking |
| 3. Supply Chain Math (Ch. 11) | % invested in inventory, inventory turnover, weeks of supply (with distractors like revenue, beginning/ending inventory, RM/WIP/FG, monthly COGS) |
| 4. Inventory Basics (Ch. 12) | Functions and types of inventory, ABC analysis (concept and math), cycle counting (items per day, counters needed), inventory costs, EOQ assumptions, robustness, quantity discounts |
| 5. EOQ & Reorder Point | Q*, N, T, average and max inventory, annual costs, TC with product cost, current policy vs. EOQ savings, order-in-multiples, reorder point (with safety stock, lead time in weeks, lead-time changes) |
| 6. EPQ | d, Q*p, max and average inventory, runs per year, run length, annual costs, current batch vs. EPQ |
| 7. Lean Operations (Ch. 16) | Lean vs. JIT vs. TPS, jidoka/kaizen/gemba, seven wastes, 5 Ss, variability, throughput, push vs. pull, setup reduction, supplier partnerships and concerns, lean layout/inventory/scheduling/quality tactics, kanban |
| 8. Exam-Style Cases | Four multi-step cases (EOQ business, EPQ manufacturer, supply chain report, bags-and-pounds EPQ). Every step is required. |

All content was written from the Ch. 11, 12, and 16 lecture slides, the class examples, the Exam 3 formula sheet, and the inventory practice handout's style. **No questions, scenarios, or names come from the Exam 3 versions.**

## How it works for students

- **Number answers** are typed into a box (with $ or commas allowed). Answers rounded to the requested decimals are accepted, plus a tiny tolerance for rounding in the middle steps.
- **Feedback names the mistake without giving the answer.** Each problem knows the common wrong answers and what causes them: forgetting × 12 on monthly demand, using all 52 weeks when the business is closed some weeks, using the selling price instead of the purchase price, using H per bag when demand is in pounds, using the EOQ formula on an EPQ problem, using Q instead of Q/2, using revenue instead of COGS, entering a decimal instead of a percent, and many more. Answers within 1% get a "don't round in the middle" note.
- **Multiple choice** wrong answers explain what the chosen term actually means.
- **Hints** point toward the setup. After solving, the **worked solution** shows every step. After 3 misses, **Show me how** walks through it (that problem is then marked "walked through," not "solved").
- **Testing out:** the first two problems in a level right on the first try, without hints, tests out of that level. Missing a problem 3 times or using 2 hints turns testing out off for that level. Locked levels offer a one-shot **jump-ahead** challenge.
- **⚡ Speed Drills:** 8 questions against the clock (Variables, EOQ & ROP, EPQ, Supply Chain Math, Concepts, Mixed Bag). Skipping costs 15 seconds. Personal bests are saved.
- **📘 Variables & Formulas** page: the variable cheat card, the formulas (matching the Exam 3 formula sheet), and five traps to check every time.
- **My progress** shows a report students can copy and paste (for example, into a Blackboard submission) if you want proof of practice.

## Settings you can change

Open `app.js` on GitHub, click the pencil icon, and change the values near the top:

| Setting | What it does | Default |
|---|---|---|
| `LOCK_PARTS` | `true` = students must finish (or test out of) a part before the next opens | `false` |
| `JUMP_AHEAD` | Locked levels offer a one-shot jump-ahead challenge | `true` |
| `TEST_OUT_STREAK` | First-try answers in a row needed to test out of a level | `2` |
| `STRUGGLE_FAILS` / `STRUGGLE_HINTS` | Misses / hints on one problem before testing out turns off for that level | `3` / `2` |
| `SHOW_SOLUTION_AFTER` | Misses before "Show me how" appears | `3` |
| `NO_TEST_OUT_PARTS` | Parts where every problem is required | `[8]` |
| `DRILL_LENGTH` | Questions per speed drill | `8` |
| `DRILL_SKIP_PENALTY` | Seconds added for skipping a drill question | `15` |

## Good to know

- **The math was checked.** The formulas reproduce the answers on the inventory practice handout (Problems 1–4 and 6) and the slide examples. The self-test page builds every problem with 60 different random seeds (about 11,600 versions) and checks that every answer is a real positive number, every worked solution and hint exists, every multiple-choice question has exactly one right answer, and no text shows "undefined" or "NaN."
- **Progress lives in each student's browser.** It doesn't follow them to another computer. You only see progress if they send you their report.
- **Answers are in the page's code.** A tech-savvy student could find them, so treat this as practice, not a test.
- **Browsers:** current Chrome, Edge, Firefox, and Safari. It works on phones too.

## For future edits (optional)

Problems live in `problems.js`. Each one is a small function that builds the story, the question, the answer, hints, worked steps, and a list of common wrong answers with a message for each. After adding or changing problems, run the self-test: from this folder, run `python -m http.server 8766`, then open `http://localhost:8766/dev/test.html`.
