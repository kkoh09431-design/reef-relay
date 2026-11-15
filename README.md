# Reef Relay

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/kkoh09431-design/reef-relay/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/kkoh09431-design/reef-relay/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

An original offline browser puzzle about bending underwater currents to guide glowing spores into coral gardens of matching color. Rotate the currents, manage oxygen, and clear five tides to restore the reef.

![Reef Relay opening tide](screenshots/01-title.jpg)

## Run it

Open `game/index.html` directly in a desktop browser. No install, build, or network connection is required. Alternatively, serve the game locally:

```sh
cd game && python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## How to play

- Select a current well with a click; click it again to turn clockwise. Right-click turns it counterclockwise.
- Use Left/Right or A/D to turn the selected well, and Up/Down or W/S to select another.
- Press Space or Enter, or use the on-screen `PULSE` button, to nudge spores forward. The pulse recharges over time.
- Match amber spores to fan-shaped amber gardens and sea-glass spores to cup-shaped gardens. Wrong deliveries and missed spores cost oxygen; zero oxygen ends the run.
- Clear all five tides. P pauses or resumes, and R restarts.

## Route notes

The bright dashed path shows each tide's intended exit lanes. Turns below are relative to the wells' starting arrows; spores can be in flight while you adjust a well.

- Tide 01: Turn the single upward arrow clockwise to the right.
- Tide 02: Turn the first well counterclockwise to climb, then the upper well clockwise to exit right.
- Tide 03: Turn the first well counterclockwise to climb; the upper well already exits right.
- Tide 04: Turn the second well clockwise to descend; the third well already exits right toward the amber garden.
- Tide 05: Turn the second well clockwise to descend, then the fourth well counterclockwise to climb to the mint garden.

## Quality checks

Run `node tests/model.test.cjs` for deterministic simulation checks. Check JavaScript syntax with `for f in game/src/*.js; do node --check "$f"; done`. The game uses plain JavaScript and local assets and also runs from `file://`.

## Known limitations

This is a short arcade puzzle rather than a long-form campaign. It has no saved high score or persistent settings.

## License

MIT. See [LICENSE](LICENSE).

## make.fun bounty

Built for the [make.fun “Make the best game” bounty](https://make.fun/bounty/best-game-01). Prize placement is not guaranteed.
