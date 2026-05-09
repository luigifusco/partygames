import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';
import {
  BATTLE_TOWER_FORMATS,
  BATTLE_TOWER_RUN_LENGTH,
  battleTowerBattleBracket,
  battleTowerDifficultyLabel,
  battleTowerEconomy,
} from '../../../shared/battle-tower.js';
import { generateBattleTowerOpponents } from '../battle-tower.js';

const repoRoot = path.resolve(process.cwd(), '..');

function bracketLabels(level: number): string[] {
  return Array.from({ length: BATTLE_TOWER_RUN_LENGTH }, (_, battleIndex) =>
    battleTowerDifficultyLabel(battleTowerBattleBracket(level, battleIndex)),
  );
}

assert.deepEqual(bracketLabels(0), ['Veteran', 'Veteran', 'Elite']);
assert.deepEqual(bracketLabels(1), ['Elite', 'Elite', 'Master']);
assert.deepEqual(bracketLabels(2), ['Master', 'Master', 'Bonus']);
assert.deepEqual(bracketLabels(99), ['Master', 'Master', 'Bonus']);

for (const currentStreak of [0, 1, 2, 5, 12]) {
  const single = battleTowerEconomy('single', currentStreak);
  const double = battleTowerEconomy('double', currentStreak);
  assert.equal(single.entryCost, double.entryCost, `entry cost differs at streak ${currentStreak}`);
  assert.equal(single.rewardEssence, double.rewardEssence, `reward differs at streak ${currentStreak}`);
}

for (const [format, def] of Object.entries(BATTLE_TOWER_FORMATS)) {
  const opponents = generateBattleTowerOpponents(format as keyof typeof BATTLE_TOWER_FORMATS, def.teamSize, 2);
  assert.equal(opponents.length, BATTLE_TOWER_RUN_LENGTH);
  assert.equal(opponents[2].difficultyLabel, 'Bonus');
  assert.ok(opponents[2].themeName, `${format} Bonus boss should have a theme`);
  assert.equal(opponents[2].team.length, def.teamSize);
  for (const entry of opponents[2].team) {
    assert.ok(entry.moves, `${format} Bonus boss Pokemon must have fixed moves`);
    assert.equal(entry.moves?.length, 2);
  }
}

const chooseActionPath = path.join(repoRoot, 'server/src/ai/chooseAction.ts');
const chooseActionSource = fs.readFileSync(chooseActionPath, 'utf8');
const activeTurnSection = chooseActionSource.slice(chooseActionSource.indexOf('if (!req.active)'));
assert.equal(
  /choices\.push\(`switch|return\s+[`'"][^`'"]*switch/.test(activeTurnSection),
  false,
  'AI active-turn logic must not emit switch choices',
);

console.log('Core rule tests passed.');
