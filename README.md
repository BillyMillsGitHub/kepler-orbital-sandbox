# Kepler

You cloned an orbital gravity sandbox. Drag to fling planets, then watch them orbit, slingshot, collide, and merge.

The sim is Newtonian n-body gravity with a symplectic leapfrog integrator, collision merging, and a live two-body readout when you select a body. Units are sandbox units chosen so orbits read well on a screen — not a scale model of the solar system.

## Play

- **Drag empty space** to launch a new body. The dashed line is a short n-body prediction.
- **Drag a body** to throw it.
- **Tap a body** to inspect it. You get:
  - live **speed** (large readout + sparkline)
  - mass, radius, heading, acceleration, kinetic energy
  - distance and relative speed versus the nearest heavier neighbour
  - orbit class (**bound** / **flyby** / **escape**), eccentricity, period
  - periapsis, apoapsis, specific energy ε
  - a vis-viva rail: circular speed vs yours vs escape
- A faint Kepler ellipse is drawn for bound orbits (periapsis filled, apoapsis ring).
- **Follow** keeps the camera locked on your selection.
- **Mass chips** (Dust → Star) set what you spawn next.
- **Time scale** runs the clock from a crawl to 4×.
- **Scenes:** Helios, Binary, Figure 8, or Empty.
- **Shield** opens the privacy sheet. **Forget this device** clears local prefs.

Keyboard: Space pause, C clear, F follow, Esc deselect, 1–5 mass, T trails, M mute, scroll zoom, WASD pan.

## Privacy

Kepler cannot see your PC. It is a browser canvas game. It does not upload your files, photos, documents, contacts, camera, microphone, location, cookies from other sites, or anything else from your computer.

If you publish this project (to X, GitHub, or the web), you are publishing **this game**: source, art, and the sandbox. You are not publishing your personal machine. There is no file picker, no cloud save of worlds, and no login.

| What | Where it goes |
| --- | --- |
| Physics, trails, selection stats, speed history | Stay in your browser tab. Never sent anywhere. Discarded when you close the tab. |
| UI prefs (trails, mute, time scale, mass chip, help dismissed) | Optional `localStorage` on **your** device. Booleans and numbers only. No names. |
| Third-party fonts, analytics, ads, accounts, backend | None. Kepler does not call Google, trackers, or an app API. |
| Camera, mic, filesystem, geolocation | Not requested. Not used. A Permissions-Policy header disables them. |
| Collision SFX | Synthesized locally with the Web Audio API. No audio files are fetched. |

A public link **does** contain:

- The Kepler app itself, so you can play it.
- Public share-card art for the link preview.

A public link **does not** contain:

- Anything from your hard drive except the files that make up this app.
- Your play sessions, selected-body stats, or local preferences.

When you open Kepler, the sim runs **in your browser**. If you share the link, the next person plays in theirs. Their orbits stay on their device the same way yours stay on yours.

The host may still show a small “Created with Grok” badge. That is site chrome, not Kepler reading your PC, and this project cannot remove it.

What the game code itself does:

1. No accounts, no database, no server-side player state.
2. No network calls from game code — no `fetch`, no analytics, no font CDN, no websocket.
3. No access to your files or sensors.
4. Prefs are local only. Use **Forget this device** in the privacy sheet (shield icon), or clear site data in your browser.
5. Referrer is `no-referrer`, so outbound navigations do not leak the page URL.

If you want a completely empty browser store after playing, clear site data for this origin. That only deletes the tiny prefs blob above.

## License

Kepler is open source under the [MIT License](LICENSE).

**Copyright (c) 2026 [BMills](https://github.com/BillyMillsGitHub).** You keep that copyright. MIT lets anyone play, copy, modify, share, and redistribute Kepler, as long as they keep your copyright notice. Owning the rights and letting people play are not in conflict — the license is permission, not a transfer of ownership.

If you fork or share Kepler, keep the `LICENSE` file (and this notice) with it.

Project by [BMills](https://github.com/BillyMillsGitHub). Implementation assistance from Grok.

## Stack

React, Canvas 2D, fixed-timestep leapfrog gravity, client-only.
