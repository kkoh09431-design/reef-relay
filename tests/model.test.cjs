const assert = require('node:assert/strict');
global.window = global;
require('../game/src/model.js');
const M = global.ReefModel;

const solutions = [
  [0],
  [1, 0],
  [1, 0],
  [0, 3, 0],
  [0, 3, 0, 1, 0]
];
function applyRouteInputs(game) {
  const route = solutions[game.stage];
  route.forEach((wanted, i) => {
    const current = game.vanes[i].dir;
    const clockwise = (current - wanted + 4) % 4;
    const delta = clockwise === 3 ? -1 : clockwise === 1 ? 1 : 0;
    if (delta) assert.equal(M.turn(game, i, delta), true, `tide ${game.stage + 1} vane ${i + 1} accepts a player turn`);
  });
}
function runUntil(game, predicate, maxFrames = 14000) {
  for (let i = 0; i < maxFrames && !predicate(); i++) {
    if (game.mode === 'playing') M.step(game, .02);
    else if (game.mode === 'transition') M.advance(game, .02);
    else break;
  }
}

const game = M.createGame();
assert.equal(game.mode, 'title');
M.start(game);
assert.equal(game.mode, 'playing');
assert.equal(game.stage, 0);
applyRouteInputs(game);
assert.equal(M.pulse(game), true);
assert.equal(M.pulse(game), false, 'pulse respects cooldown');
runUntil(game, () => game.stage > 0 || game.mode === 'won' || game.mode === 'lost');
assert.equal(game.stage, 1, 'first tide is cleared by a real matching spore delivery');

for (let expectedStage = 1; expectedStage < M.stages.length; expectedStage++) {
  assert.equal(game.stage, expectedStage);
  assert.equal(game.mode, 'playing');
  applyRouteInputs(game);
  runUntil(game, () => game.stage > expectedStage || game.mode === 'won' || game.mode === 'lost');
  assert.ok(game.stage > expectedStage || game.mode === 'won', `tide ${expectedStage + 1} completes through simulation`);
}
assert.equal(game.mode, 'won', 'all five tides reach the real win state');
assert.equal(game.deliveredTotal, M.stages.reduce((sum, stage) => sum + stage.goal, 0));

const lost = M.createGame();
M.start(lost);
runUntil(lost, () => lost.mode === 'lost', 8000);
assert.equal(lost.mode, 'lost', 'zero oxygen ends a run');
M.start(lost);
assert.equal(lost.mode, 'playing', 'restart returns to the first tide');
assert.equal(lost.stage, 0);
assert.equal(lost.deliveredTotal, 0);

console.log('model checks passed: route inputs clear all five tides; win, oxygen loss, and restart');
