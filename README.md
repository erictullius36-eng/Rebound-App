# Rebound 🏀

Personal workout generator + protein tracker for Eric and Julia. Zero services, zero cost. All data lives in each phone's browser — nothing is ever sent anywhere.

## Two profiles

First launch on a new device asks "Who's training on this phone?" — the phone remembers forever (switchable in Settings → Switch profile). Each profile's data is stored separately and never mixes. Eric's existing phone auto-claims his profile with all history intact; Julia just opens the same URL on her phone and taps her name.

- **Eric:** weekday gym/home template around basketball nights, injury rebuild ladders, adaptive check-ins and ratings, dunk track.
- **Julia:** on-demand Full Body A/B/C rotation whenever she trains (2–3x/week), 15–20 min default (length, difficulty, and equipment all adjustable in her Settings), postpartum core ladder that advances every 4 sessions, pelvic-floor-safe exercise selection, left-knee-aware picks, no impact work. Breastfeeding toggle: on = gentle supply-safe deficit with high protein; off = recalculates toward her goal weight instantly.

## What it does

- **Generates a fresh workout every day** built around your week: gym Mon–Fri, home basement gym Sat–Sun, basketball Tue/Thu/Fri nights (lifts on ball days stay off your legs).
- **Rebuild engine:** squat, lunge, hinge, and jump patterns each climb 4 stages (Foundation → Rebuilding → Loading → Cleared). Three pain-free sessions advance a stage; reporting pain drops it back and benches the offending exercises for a week. The **dunk track** (jump training) unlocks only when squat and lunge are both cleared.
- **Auto-progression:** hit the top of a rep range and the app suggests more weight next time. "Too easy" ratings accelerate it; "too hard" holds it; 5+ missed days trigger a lighter re-entry session.
- **Protein tracking in seconds:** quick-add buttons for your usual foods, custom entry, daily ring on the dashboard. Targets auto-calculated (200g protein / ~2,450 cal to start) and recalculated as your weight drops — or override them.
- **History:** weekly summary, 30-day success rate against your 80% goal, day-by-day log.
- **Your data, your file:** JSON backup/restore + monthly CSV exports (workouts and protein) from Settings or History.

## Put it on your phone (one-time, ~10 minutes)

The app needs to live at a web address to install to your home screen. Free with a GitHub account:

1. Go to **github.com** → Sign up (email + password, no credit card).
2. Top-right **+** → **New repository** → name it `rebound` → check **"Add a README"** → Create.
3. In the repo: **Add file → Upload files** → drag in everything inside this `workout-app` folder (keep the folder structure: `css/`, `js/`, `icons/` — drag the folders themselves) → **Commit changes**.
4. Repo **Settings → Pages** → under "Branch" pick **main** and **/ (root)** → Save.
5. Wait ~2 minutes. Your app is live at `https://YOURNAME.github.io/rebound/`

### Install on iPhone
Open that link in **Safari** → tap the **Share** button → **Add to Home Screen** → Add. Done — it opens full-screen like a real app and works offline.

### Install on Android
Open the link in **Chrome** → menu (⋮) → **Add to Home screen / Install app**.

### Updating the app later
Re-upload the changed files in GitHub (same Upload files flow). On your phone, close and reopen the app. If it seems stale, the service worker version in `sw.js` needs a bump (`rebound-v1` → `rebound-v2`).

## Try it on your computer first

```bash
cd workout-app
python3 -m http.server 8000
```
Open http://localhost:8000

## Monthly habit

Settings → **Backup everything (JSON)** — save the file somewhere safe (iCloud/Files). That one file restores your entire history on any phone via **Restore backup**.

## A note on pain

The app distinguishes soreness (train around it) from pain (back off). Be honest in the post-workout check — that's the mechanism that gets you from "can't squat pain-free" to dunking. Nothing here is medical advice; sharp pain, dizziness, or chest pain means stop, full stop.




