const assert = require('node:assert/strict');
global.window = global;
require('../game/src/model.js');
const M = global.ReefModel;

function turnTo(game, index, direction) {
  let turns = 0;
  while (game.vanes[index].dir !== direction && turns < 4) {
    const clockwise = (game.vanes[index].dir - direction + 4) % 4;
    assert.equal(M.turn(game, index, clockwise === 1 ? 1 : -1), true, 'player turns the junction through M.turn');
    turns++;
  }
  assert.equal(game.vanes[index].dir, direction);
}

function intendedDirection(stage, index, color) {
  if (stage === 1) return index === 0 ? (color === 'amber' ? 1 : 3) : 0;
  if (stage === 2) return index === 0 ? (color === 'amber' ? 3 : 1) : 0;
  if (stage === 3) return index === 0 ? (color === 'amber' ? 1 : 3) : (index < 3 ? 0 : (index === 3 ? 1 : 3));
  if (stage === 4) return index === 0 ? 1 : (index === 1 ? 0 : (color === 'amber' ? 3 : 1));
  return 0;
}

function routeSpores(game) {
  if (game.stage === 0) return;
  for (const spore of game.spores) {
    for (let i = 0; i < game.vanes.length; i++) {
      const vane = game.vanes[i];
      const dx = vane.x - spore.x, dy = vane.y - spore.y;
      const approaching = dx * spore.vx + dy * spore.vy > 0 && Math.hypot(dx, dy) < .13;
      if (approaching) turnTo(game, i, intendedDirection(game.stage, i, spore.color));
    }
  }
}

function tick(game, route = true) {
  if (game.mode === 'playing') {
    if (route) routeSpores(game);
    M.step(game, .02);
  } else if (game.mode === 'transition') {
    M.advance(game, .02);
  }
}

function runUntil(game, predicate, route = true, maxFrames = 50000) {
  for (let i = 0; i < maxFrames && !predicate(); i++) tick(game, route);
  assert.ok(predicate(), `simulation reached target (mode ${game.mode}, tide ${game.stage + 1})`);
}

const game = M.createGame();
assert.equal(game.mode, 'title');
M.start(game);
assert.equal(game.mode, 'playing');
assert.equal(game.stage, 0);
assert.equal(game.vanes[0].dir, 0, 'tide 1 starts with a simple rightward route');
game.oxygen = 73;
runUntil(game, () => game.mode === 'transition');
assert.equal(game.score, M.stages[0].goal, 'amber spores from the original spawn reach the tide 1 garden');
M.advance(game, 3);
assert.equal(game.stage, 1);
assert.equal(game.oxygen, 73, 'oxygen carries unchanged across the tide transition');

for (let stage = 1; stage < M.stages.length; stage++) {
  assert.equal(game.stage, stage);
  const prior = game.deliveredTotal;
  const priorColors = { ...game.deliveredByColor };
  runUntil(game, () => game.stage > stage || game.mode === 'won' || game.mode === 'lost');
  assert.ok(game.stage > stage || game.mode === 'won', `tide ${stage + 1} completes using player turns (${game.mode}, oxygen ${game.oxygen}, score ${game.score}, deliveries ${JSON.stringify(game.deliveredByColor)})`);
  assert.equal(game.deliveredTotal - prior, M.stages[stage].goal);
  assert.equal(game.oxygen, 73, `tide ${stage + 1} routes cleanly with no oxygen loss`);
  assert.ok(game.deliveredByColor.amber > priorColors.amber, `amber reaches its matching garden on tide ${stage + 1}`);
  assert.ok(game.deliveredByColor.mint > priorColors.mint, `mint reaches its matching garden on tide ${stage + 1}`);
}
assert.equal(game.mode, 'won', 'a clean run reaches the real win state on tide 5');
assert.equal(game.deliveredTotal, M.stages.reduce((sum, stage) => sum + stage.goal, 0));
assert.equal(game.oxygen, 73, 'a clean run preserves carried oxygen');

const wrongGarden = M.createGame();
M.start(wrongGarden);
M.loadStage(wrongGarden, 1);
wrongGarden.vanes[0].dir = 3;
runUntil(wrongGarden, () => wrongGarden.oxygen < 100, false);
assert.ok(wrongGarden.oxygen < 100, 'routing amber into the mint garden costs oxygen');

const escaped = M.createGame();
M.start(escaped);
while (escaped.spores.length === 0) M.step(escaped, .04);
escaped.spores[0].x = 1.05;
const beforeEscape = escaped.oxygen;
M.step(escaped, .02);
assert.ok(escaped.oxygen < beforeEscape, 'a spore that escapes costs oxygen');

const overdue = M.createGame();
M.start(overdue);
while (overdue.spores.length === 0) M.step(overdue, .04);
overdue.spores[0].age = 20.01;
const beforeOverdue = overdue.oxygen;
M.step(overdue, .02);
assert.ok(overdue.oxygen < beforeOverdue, 'a spore that drifts too long costs oxygen');

const depleted = M.createGame();
M.start(depleted);
depleted.oxygen = 7;
while (depleted.spores.length === 0) M.step(depleted, .04);
depleted.spores[0].x = 1.05;
M.step(depleted, .02);
assert.equal(depleted.oxygen, 0);
assert.equal(depleted.mode, 'lost', 'zero oxygen ends the run');
M.start(depleted);
assert.equal(depleted.mode, 'playing', 'restart begins a fresh run');
assert.equal(depleted.stage, 0);
assert.equal(depleted.oxygen, 100);
assert.equal(depleted.deliveredTotal, 0);

console.log('model checks passed: player-routed five-tide run, mixed-color deliveries, oxygen carry/loss, and restart');
