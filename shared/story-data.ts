// Story Mode — Multi-storyline system
// Each storyline is a sequence of battle and dialogue steps

const TRAINERS_PATH = '/pokemonparty/assets/trainers';

export interface StoryStep {
  type: 'battle' | 'dialogue';
  speaker?: string;
  sprite?: string;
  lines?: string[];
  trainerName?: string;
  trainerTitle?: string;
  team?: number[];
  fieldSize?: 1 | 2 | 3;
  essenceReward?: number;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TeamChoice {
  label: string;
  pokemonIds: number[];
}

export interface Storyline {
  id: string;
  title: string;
  description: string;
  region: string;
  difficulty: Difficulty;
  icon: string;
  requires: string[];
  requiresCount?: number;
  steps: StoryStep[];
  completionReward: {
    essence: number;
    pack?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
  /** If set, player chooses one team at completion and receives those pokemon */
  teamChoices?: TeamChoice[];
}

function sp(name: string) { return TRAINERS_PATH + '/' + name + '.png'; }

export const STORYLINES: Storyline[] = [
  // ───────────── STARTER ─────────────
  {
    id: 'oak-starters', title: "Oak's Gift", description: 'Professor Oak has a gift for new trainers!',
    region: 'Kanto', difficulty: 'beginner', icon: '🧪', requires: [],
    steps: [
      { type: 'dialogue', speaker: 'Prof. Oak', sprite: sp('oak'), lines: [
        "Hello there! Welcome to the world of Pokémon!",
        "My name is Oak. People call me the Pokémon Professor.",
        "You must be a new trainer. I have something special for you.",
      ]},
      { type: 'dialogue', speaker: 'Prof. Oak', sprite: sp('oak'), lines: [
        "I've prepared five teams of starter Pokémon.",
        "Each team comes from a different region.",
        "Choose wisely — these will be your first partners!",
      ]},
    ],
    completionReward: { essence: 0 },
    teamChoices: [
      { label: 'Kanto Starters', pokemonIds: [1, 4, 7] },
      { label: 'Johto Starters', pokemonIds: [152, 155, 158] },
      { label: 'Hoenn Starters', pokemonIds: [252, 255, 258] },
      { label: 'Sinnoh Starters', pokemonIds: [387, 390, 393] },
      { label: 'Unova Starters', pokemonIds: [495, 498, 501] },
    ],
  },

  // ───────────── BEGINNER ─────────────
  {
    id: 'bug-catcher', title: 'Bug Catcher Frenzy', description: 'A bug enthusiast blocks the path!',
    region: 'Kanto', difficulty: 'beginner', icon: '🐛', requires: ['oak-starters'],
    steps: [
      { type: 'dialogue', speaker: 'Bug Catcher', sprite: sp('bugcatcher'), lines: ["Hey! You stepped into my web of bugs!", "Nobody passes without a battle!"] },
      { type: 'battle', trainerName: 'Bug Catcher', trainerTitle: 'Trainer', team: [10, 13], fieldSize: 1, essenceReward: 80 },
      { type: 'dialogue', speaker: 'Bug Catcher', sprite: sp('bugcatcher'), lines: ["Wow, your Pokémon are way stronger than my bugs...", "Good luck out there!"] },
    ],
    completionReward: { essence: 150 },
  },
  {
    id: 'youngster-joey', title: "Youngster Joey's Dare", description: 'His Rattata is in the top percentage!',
    region: 'Kanto', difficulty: 'beginner', icon: '👦', requires: ['oak-starters'],
    steps: [
      { type: 'dialogue', speaker: 'Youngster Joey', sprite: sp('youngster'), lines: ["Hey! My Rattata is in the top percentage of all Rattata!", "I challenge you to prove it!"] },
      { type: 'battle', trainerName: 'Youngster Joey', trainerTitle: 'Trainer', team: [19, 20], fieldSize: 1, essenceReward: 80 },
      { type: 'dialogue', speaker: 'Youngster Joey', sprite: sp('youngster'), lines: ["Okay maybe he's not THE top percentage...", "But he's still pretty good, right?"] },
    ],
    completionReward: { essence: 150 },
  },
  {
    id: 'brock-challenge', title: "Brock's Challenge", description: 'Prove yourself to the rock-solid gym leader.',
    region: 'Kanto', difficulty: 'beginner', icon: '🪨', requires: ['bug-catcher', 'youngster-joey'],
    steps: [
      { type: 'dialogue', speaker: 'Brock', sprite: sp('brock'), lines: ["So you want to become a trainer?", "Show me you can handle rock-solid defense!"] },
      { type: 'battle', trainerName: 'Brock', trainerTitle: 'Gym Leader', team: [74, 95], fieldSize: 1, essenceReward: 100 },
      { type: 'dialogue', speaker: 'Brock', sprite: sp('brock'), lines: ["Not bad! You've got potential.", "Keep training and you'll go far."] },
    ],
    completionReward: { essence: 200 },
  },
  {
    id: 'misty-trial', title: "Misty's Trial", description: 'Face the power of water at Cerulean Gym.',
    region: 'Kanto', difficulty: 'beginner', icon: '🌊', requires: ['bug-catcher', 'youngster-joey'],
    steps: [
      { type: 'dialogue', speaker: 'Misty', sprite: sp('misty'), lines: ["Think you can handle the power of water?", "Let's find out!"] },
      { type: 'battle', trainerName: 'Misty', trainerTitle: 'Gym Leader', team: [120, 121], fieldSize: 1, essenceReward: 100 },
      { type: 'dialogue', speaker: 'Misty', sprite: sp('misty'), lines: ["Hmph... you got lucky.", "But I respect your skill."] },
    ],
    completionReward: { essence: 200 },
  },
  {
    id: 'whitney-fury', title: "Whitney's Fury", description: "Whitney won't let anyone call her weak!",
    region: 'Johto', difficulty: 'beginner', icon: '🐄', requires: ['bug-catcher', 'youngster-joey'],
    steps: [
      { type: 'dialogue', speaker: 'Whitney', sprite: sp('whitney'), lines: ["Everyone thinks I'm just a crybaby!", "I'll show you how strong I really am!"] },
      { type: 'battle', trainerName: 'Whitney', trainerTitle: 'Gym Leader', team: [35, 241], fieldSize: 1, essenceReward: 100 },
      { type: 'dialogue', speaker: 'Whitney', sprite: sp('whitney'), lines: ["*sniff*... Okay, you win.", "But next time I won't go easy!"] },
    ],
    completionReward: { essence: 200 },
  },
  {
    id: 'roxanne-lesson', title: "Roxanne's Lesson", description: 'A studious battle with the Hoenn professor.',
    region: 'Hoenn', difficulty: 'beginner', icon: '📖', requires: ['bug-catcher', 'youngster-joey'],
    steps: [
      { type: 'dialogue', speaker: 'Roxanne', sprite: sp('roxanne'), lines: ["Type matchups are the foundation of strategy.", "Allow me to demonstrate!"] },
      { type: 'battle', trainerName: 'Roxanne', trainerTitle: 'Gym Leader', team: [74, 299], fieldSize: 1, essenceReward: 100 },
      { type: 'dialogue', speaker: 'Roxanne', sprite: sp('roxanne'), lines: ["Excellent application of type advantages!", "You learn fast."] },
    ],
    completionReward: { essence: 200 },
  },

  // ───────────── INTERMEDIATE ─────────────
  {
    id: 'kanto-gyms', title: 'Kanto Gym Circuit', description: 'Challenge the Kanto gym leaders in sequence.',
    region: 'Kanto', difficulty: 'intermediate', icon: '🏛️',
    requires: ['brock-challenge', 'misty-trial', 'whitney-fury', 'roxanne-lesson', 'bug-catcher', 'youngster-joey'], requiresCount: 2,
    steps: [
      { type: 'dialogue', speaker: 'Brock', sprite: sp('brock'), lines: ["Ready for the real challenge?", "The Kanto gyms await — and I'm your first opponent again!"] },
      { type: 'battle', trainerName: 'Brock', trainerTitle: 'Pewter Gym Leader', team: [95, 76, 141], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Brock', sprite: sp('brock'), lines: ["You really have grown stronger.", "Cerulean City is next — Misty won't go easy on you."] },
      { type: 'dialogue', speaker: 'Misty', sprite: sp('misty'), lines: ["So you beat Brock, huh?", "My water Pokémon will wash you right back to Pallet!"] },
      { type: 'battle', trainerName: 'Misty', trainerTitle: 'Cerulean Gym Leader', team: [121, 131, 130], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Misty', sprite: sp('misty'), lines: ["You're better than I thought.", "Head to Vermilion — Lt. Surge is waiting."] },
      { type: 'dialogue', speaker: 'Lt. Surge', sprite: sp('ltsurge'), lines: ["Hey, kid! You think you've got what it takes?", "I'll show you the shocking power of electricity!"] },
      { type: 'battle', trainerName: 'Lt. Surge', trainerTitle: 'Vermilion Gym Leader', team: [26, 101, 135], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Lt. Surge', sprite: sp('ltsurge'), lines: ["Hah! You really are something.", "Celadon's gym is next — try not to get charmed."] },
      { type: 'dialogue', speaker: 'Erika', sprite: sp('erika'), lines: ["Welcome to Celadon Gym.", "I shall not lose this match."] },
      { type: 'battle', trainerName: 'Erika', trainerTitle: 'Celadon Gym Leader', team: [45, 114, 3], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Erika', sprite: sp('erika'), lines: ["Oh! I concede the match.", "You're elegant in battle. Sabrina awaits in Saffron."] },
      { type: 'dialogue', speaker: 'Sabrina', sprite: sp('sabrina'), lines: ["I have foreseen your arrival.", "And I have foreseen your defeat."] },
      { type: 'battle', trainerName: 'Sabrina', trainerTitle: 'Saffron Gym Leader', team: [65, 196, 122], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Sabrina', sprite: sp('sabrina'), lines: ["I foresee great things in your future...", "The Elite Four awaits."] },
    ],
    completionReward: { essence: 1000, pack: 'uncommon' },
  },
  {
    id: 'johto-gyms', title: 'Johto Gym Circuit', description: 'Challenge the Johto gym leaders.',
    region: 'Johto', difficulty: 'intermediate', icon: '🏛️',
    requires: ['brock-challenge', 'misty-trial', 'whitney-fury', 'roxanne-lesson', 'bug-catcher', 'youngster-joey'], requiresCount: 2,
    steps: [
      { type: 'dialogue', speaker: 'Falkner', sprite: sp('falkner'), lines: ["Johto's gym leaders are no pushovers.", "I, Falkner, am the first wall you must break."] },
      { type: 'battle', trainerName: 'Falkner', trainerTitle: 'Violet Gym Leader', team: [22, 164], fieldSize: 1, essenceReward: 100 },
      { type: 'dialogue', speaker: 'Falkner', sprite: sp('falkner'), lines: ["Father's birds were no match for you.", "Try Azalea Town next — Bugsy is sharp."] },
      { type: 'dialogue', speaker: 'Bugsy', sprite: sp('bugsy'), lines: ["Bug-type Pokémon are misunderstood.", "Allow me to demonstrate their true power!"] },
      { type: 'battle', trainerName: 'Bugsy', trainerTitle: 'Azalea Gym Leader', team: [123, 214], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Bugsy', sprite: sp('bugsy'), lines: ["Hmm! That's data I can use.", "Whitney is up next — and she's tougher than she looks."] },
      { type: 'dialogue', speaker: 'Whitney', sprite: sp('whitney'), lines: ["I won't cry this time!", "Miltank, let's roll!"] },
      { type: 'battle', trainerName: 'Whitney', trainerTitle: 'Goldenrod Gym Leader', team: [241, 36, 210], fieldSize: 1, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Whitney', sprite: sp('whitney'), lines: ["W-waaah! Fine, take the badge!", "Morty in Ecruteak will spook you good."] },
      { type: 'dialogue', speaker: 'Morty', sprite: sp('morty'), lines: ["Welcome to the Ecruteak Gym.", "I see your aura clearly... but can you see mine?"] },
      { type: 'battle', trainerName: 'Morty', trainerTitle: 'Ecruteak Gym Leader', team: [94, 200, 429], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Morty', sprite: sp('morty'), lines: ["Your light shines brighter than I imagined.", "Cianwood and Chuck are next."] },
      { type: 'dialogue', speaker: 'Chuck', sprite: sp('chuck'), lines: ["WAHAHAHA! A challenger!", "Train your body and your Pokémon will follow!"] },
      { type: 'battle', trainerName: 'Chuck', trainerTitle: 'Cianwood Gym Leader', team: [62, 107], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Chuck', sprite: sp('chuck'), lines: ["A worthy fight!", "Olivine's lighthouse keeper is your last test."] },
      { type: 'dialogue', speaker: 'Jasmine', sprite: sp('jasmine'), lines: ["I... I'll try my best.", "Please, take this seriously."] },
      { type: 'battle', trainerName: 'Jasmine', trainerTitle: 'Olivine Gym Leader', team: [208, 82, 227], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Jasmine', sprite: sp('jasmine'), lines: ["Your bond with your Pokémon is beautiful.", "Keep going!"] },
    ],
    completionReward: { essence: 1000, pack: 'uncommon' },
  },
  {
    id: 'hoenn-gyms', title: 'Hoenn Gym Circuit', description: 'Challenge the Hoenn gym leaders.',
    region: 'Hoenn', difficulty: 'intermediate', icon: '🏛️',
    requires: ['brock-challenge', 'misty-trial', 'whitney-fury', 'roxanne-lesson', 'bug-catcher', 'youngster-joey'], requiresCount: 2,
    steps: [
      { type: 'dialogue', speaker: 'Roxanne', sprite: sp('roxanne'), lines: ["Welcome to Rustboro Gym.", "I'll teach you that rock-types aren't to be underestimated."] },
      { type: 'battle', trainerName: 'Roxanne', trainerTitle: 'Rustboro Gym Leader', team: [76, 299, 306], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Roxanne', sprite: sp('roxanne'), lines: ["Excellent... noted.", "Brawly trains in Dewford. He hits hard."] },
      { type: 'dialogue', speaker: 'Brawly', sprite: sp('brawly'), lines: ["The big wave's coming, kid!", "Show me your fighting spirit!"] },
      { type: 'battle', trainerName: 'Brawly', trainerTitle: 'Dewford Gym Leader', team: [296, 297], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Brawly', sprite: sp('brawly'), lines: ["Whoa! You ride that wave well.", "Mauville's Wattson will have a real charge for you."] },
      { type: 'dialogue', speaker: 'Wattson', sprite: sp('wattson'), lines: ["Wahaha! Welcome, welcome!", "Mauville Gym's traps will give you a jolt!"] },
      { type: 'battle', trainerName: 'Wattson', trainerTitle: 'Mauville Gym Leader', team: [82, 310, 181], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Wattson', sprite: sp('wattson'), lines: ["Wahaha! Sparks will fly elsewhere now.", "Lavaridge — and Flannery — burn next!"] },
      { type: 'dialogue', speaker: 'Flannery', sprite: sp('flannery'), lines: ["My grandfather built this gym!", "I won't let his legacy down — burn!"] },
      { type: 'battle', trainerName: 'Flannery', trainerTitle: 'Lavaridge Gym Leader', team: [323, 219, 324], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Flannery', sprite: sp('flannery'), lines: ["I... I learned a lot from you.", "Petalburg's leader is... well, you'll see."] },
      { type: 'dialogue', speaker: 'Norman', sprite: sp('norman'), lines: ["So you've made it this far.", "I won't go easy just because we may know each other."] },
      { type: 'battle', trainerName: 'Norman', trainerTitle: 'Petalburg Gym Leader', team: [289, 335, 128], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Norman', sprite: sp('norman'), lines: ["I'm proud of you.", "Fortree's Winona soars high — be ready."] },
      { type: 'dialogue', speaker: 'Winona', sprite: sp('winona'), lines: ["I am the Flying-type user, Winona.", "Soar with me — if you can keep up!"] },
      { type: 'battle', trainerName: 'Winona', trainerTitle: 'Fortree Gym Leader', team: [334, 277, 227], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Winona', sprite: sp('winona'), lines: ["You fly higher than I imagined.", "The skies of Hoenn welcome you, Champion-to-be."] },
    ],
    completionReward: { essence: 1000, pack: 'uncommon' },
  },
  {
    id: 'sinnoh-gyms', title: 'Sinnoh Gym Circuit', description: 'Challenge the Sinnoh gym leaders.',
    region: 'Sinnoh', difficulty: 'intermediate', icon: '🏛️',
    requires: ['brock-challenge', 'misty-trial', 'whitney-fury', 'roxanne-lesson', 'bug-catcher', 'youngster-joey'], requiresCount: 2,
    steps: [
      { type: 'dialogue', speaker: 'Maylene', sprite: sp('maylene'), lines: ["I'm the Veilstone Gym Leader, Maylene.", "Don't hold back — I won't!"] },
      { type: 'battle', trainerName: 'Maylene', trainerTitle: 'Veilstone Gym Leader', team: [308, 448, 214], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Maylene', sprite: sp('maylene'), lines: ["You hit hard. Respect.", "Crasher Wake makes a big splash next — literally."] },
      { type: 'dialogue', speaker: 'Crasher Wake', sprite: sp('crasherwake'), lines: ["I am Crasher Waaaaake!", "Time to crash and splash, friend!"] },
      { type: 'battle', trainerName: 'Crasher Wake', trainerTitle: 'Pastoria Gym Leader', team: [130, 195, 419], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Crasher Wake', sprite: sp('crasherwake'), lines: ["Whoo-aah! That was a soaking!", "Hearthome's Fantina will charm you right out of the gym."] },
      { type: 'dialogue', speaker: 'Fantina', sprite: sp('fantina'), lines: ["Bonjour, mon challenger!", "My ghosts shall dance you into defeat!"] },
      { type: 'battle', trainerName: 'Fantina', trainerTitle: 'Hearthome Gym Leader', team: [429, 426, 94], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Fantina', sprite: sp('fantina'), lines: ["Magnifique! You danced through my ghosts.", "Canalave's Byron — strong as steel — is next."] },
      { type: 'dialogue', speaker: 'Byron', sprite: sp('byron'), lines: ["Wha-ha-ha! A sturdy challenger!", "Steel will not yield easily!"] },
      { type: 'battle', trainerName: 'Byron', trainerTitle: 'Canalave Gym Leader', team: [411, 208, 306], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Byron', sprite: sp('byron'), lines: ["Hrm! You bent the iron.", "Snowpoint freezes the toughest hearts — Candice awaits."] },
      { type: 'dialogue', speaker: 'Candice', sprite: sp('candice'), lines: ["Hi-hi! I'm Candice!", "Focus, friend — my ice will test your spirit!"] },
      { type: 'battle', trainerName: 'Candice', trainerTitle: 'Snowpoint Gym Leader', team: [473, 461, 460], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Candice', sprite: sp('candice'), lines: ["Wow, you're really focused!", "Sunyshore's Volkner is the last gym — and the brightest."] },
      { type: 'dialogue', speaker: 'Volkner', sprite: sp('volkner'), lines: ["...Finally, a challenger worth my time.", "Light up the gym!"] },
      { type: 'battle', trainerName: 'Volkner', trainerTitle: 'Sunyshore Gym Leader', team: [466, 405, 135, 26], fieldSize: 2, essenceReward: 250 },
      { type: 'dialogue', speaker: 'Volkner', sprite: sp('volkner'), lines: ["That sparked something in me.", "Go — the Pokémon League is calling you."] },
    ],
    completionReward: { essence: 1000, pack: 'uncommon' },
  },

  // ───────────── ADVANCED ─────────────
  {
    id: 'team-rocket', title: 'Team Rocket Hideout', description: 'Infiltrate Team Rocket and face Giovanni.',
    region: 'Kanto', difficulty: 'advanced', icon: '🚀',
    requires: ['kanto-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Rocket Grunt', sprite: sp('rocketgrunt'), lines: ["Hand over your Pokémon!", "Team Rocket doesn't take no for an answer!"] },
      { type: 'battle', trainerName: 'Rocket Grunt', trainerTitle: 'Team Rocket', team: [41, 109, 24], fieldSize: 1, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Rocket Grunt', sprite: sp('rocketgruntf'), lines: ["You beat my partner? You won't get past me!"] },
      { type: 'battle', trainerName: 'Rocket Grunt', trainerTitle: 'Team Rocket', team: [110, 89, 42], fieldSize: 1, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Giovanni', sprite: sp('giovanni'), lines: ["So you've made it to the boss.", "I don't need heroes. I need power.", "And you're in my way."] },
      { type: 'battle', trainerName: 'Giovanni', trainerTitle: 'Team Rocket Boss', team: [34, 112, 31, 89], fieldSize: 2, essenceReward: 500 },
      { type: 'dialogue', speaker: 'Giovanni', sprite: sp('giovanni'), lines: ["Impressive... Team Rocket will remember this.", "But we'll be back."] },
    ],
    completionReward: { essence: 1500, pack: 'uncommon' },
  },
  {
    id: 'aqua-magma', title: 'Aqua vs Magma', description: 'Stop both teams from tearing Hoenn apart.',
    region: 'Hoenn', difficulty: 'advanced', icon: '🌋',
    requires: ['hoenn-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Aqua Grunt', sprite: sp('aquagrunt'), lines: ["Team Aqua will expand the seas!", "Stand aside or face the tide!"] },
      { type: 'battle', trainerName: 'Aqua Grunt', trainerTitle: 'Team Aqua', team: [318, 320, 72], fieldSize: 1, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Magma Grunt', sprite: sp('magmagrunt'), lines: ["Team Magma will expand the land!", "We need that power more than Aqua does!"] },
      { type: 'battle', trainerName: 'Magma Grunt', trainerTitle: 'Team Magma', team: [322, 218, 88], fieldSize: 1, essenceReward: 200 },
      { type: 'battle', trainerName: 'Archie', trainerTitle: 'Team Aqua Boss', team: [319, 130, 342, 73], fieldSize: 2, essenceReward: 400 },
      { type: 'battle', trainerName: 'Maxie', trainerTitle: 'Team Magma Boss', team: [323, 229, 330, 324], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Steven', sprite: sp('steven'), lines: ["You've saved Hoenn from both teams.", "The balance of land and sea is restored."] },
    ],
    completionReward: { essence: 2000, pack: 'rare' },
  },
  {
    id: 'kanto-e4', title: 'Kanto Elite Four', description: 'Face the strongest trainers in Kanto.',
    region: 'Kanto', difficulty: 'advanced', icon: '⭐',
    requires: ['kanto-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Lance', sprite: sp('lance'), lines: ["The Elite Four awaits.", "Only the strongest may pass."] },
      { type: 'dialogue', speaker: 'Lorelei', sprite: sp('lorelei'), lines: ["Welcome, challenger.", "I, Lorelei of the Elite Four, will freeze you in your tracks."] },
      { type: 'battle', trainerName: 'Lorelei', trainerTitle: 'Elite Four', team: [87, 91, 124, 131], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Bruno', sprite: sp('bruno'), lines: ["Hwa-haa!", "I am Bruno. My fighting Pokémon will crush you!"] },
      { type: 'battle', trainerName: 'Bruno', trainerTitle: 'Elite Four', team: [68, 107, 106, 95], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Agatha', sprite: sp('agatha'), lines: ["Oak's been talking about you, child.", "Let's see if you can survive my ghosts!"] },
      { type: 'battle', trainerName: 'Agatha', trainerTitle: 'Elite Four', team: [94, 169, 110, 429], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Lance', sprite: sp('lance'), lines: ["I am Lance, the Dragon Master.", "Show me what you're made of!"] },
      { type: 'battle', trainerName: 'Lance', trainerTitle: 'Champion', team: [149, 130, 142, 6], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Lance', sprite: sp('lance'), lines: ["You are truly worthy.", "But there is one more challenger..."] },
      { type: 'dialogue', speaker: 'Blue', sprite: sp('blue'), lines: ["Yo! Long time no see!", "I'm the strongest trainer in Kanto. Don't you forget it!"] },
      { type: 'battle', trainerName: 'Blue', trainerTitle: 'Champion', team: [9, 65, 59, 103, 112, 130], fieldSize: 3, essenceReward: 500 },
      { type: 'dialogue', speaker: 'Blue', sprite: sp('blue'), lines: ["Tch... well, you're not bad.", "I'll be back stronger. Count on it."] },
    ],
    completionReward: { essence: 2000, pack: 'rare' },
  },
  {
    id: 'johto-e4', title: 'Johto Elite Four', description: 'Face the strongest trainers in Johto.',
    region: 'Johto', difficulty: 'advanced', icon: '⭐',
    requires: ['johto-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Will', sprite: sp('will'), lines: ["Welcome, I am Will.", "I have trained all around the world. My psychic Pokémon are unbeatable!"] },
      { type: 'battle', trainerName: 'Will', trainerTitle: 'Elite Four', team: [178, 80, 103, 196], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Koga', sprite: sp('koga'), lines: ["Fwahahaha!", "A ninja's poisons will be your demise!"] },
      { type: 'battle', trainerName: 'Koga', trainerTitle: 'Elite Four', team: [169, 110, 89, 49], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Bruno', sprite: sp('bruno'), lines: ["We meet again.", "My fists are sharper than ever!"] },
      { type: 'battle', trainerName: 'Bruno', trainerTitle: 'Elite Four', team: [68, 106, 107, 95, 62], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Karen', sprite: sp('karen'), lines: ["I am Karen of the Elite Four.", "I prefer Pokémon I personally like — strong feelings make strong Pokémon."] },
      { type: 'battle', trainerName: 'Karen', trainerTitle: 'Elite Four', team: [197, 229, 215, 359], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Lance', sprite: sp('lance'), lines: ["Welcome to the Champion's room.", "I am Lance, the dragon trainer. There's no losing this time!"] },
      { type: 'battle', trainerName: 'Lance', trainerTitle: 'Champion', team: [149, 130, 142, 6, 148, 230], fieldSize: 3, essenceReward: 500 },
      { type: 'dialogue', speaker: 'Lance', sprite: sp('lance'), lines: ["You... you defeated even me.", "You are the new Champion of Johto."] },
    ],
    completionReward: { essence: 2000, pack: 'rare' },
  },
  {
    id: 'hoenn-e4', title: 'Hoenn Elite Four', description: 'Face the strongest trainers in Hoenn.',
    region: 'Hoenn', difficulty: 'advanced', icon: '⭐',
    requires: ['hoenn-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Sidney', sprite: sp('sidney'), lines: ["Heh, you got grit.", "I'm Sidney — Dark-type's the name, and I don't play nice."] },
      { type: 'battle', trainerName: 'Sidney', trainerTitle: 'Elite Four', team: [275, 319, 332, 359], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Phoebe', sprite: sp('phoebe'), lines: ["Hi! I'm Phoebe.", "I trained with the spirits on Mt. Pyre. They never quite let me go..."] },
      { type: 'battle', trainerName: 'Phoebe', trainerTitle: 'Elite Four', team: [356, 354, 429, 477], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Glacia', sprite: sp('glacia'), lines: ["Welcome.", "My Ice Pokémon froze in passion the day they met you."] },
      { type: 'battle', trainerName: 'Glacia', trainerTitle: 'Elite Four', team: [362, 365, 461, 473], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Drake', sprite: sp('drake'), lines: ["I am Drake, of the Elite Four.", "Riding dragons takes courage. Show me yours!"] },
      { type: 'battle', trainerName: 'Drake', trainerTitle: 'Elite Four', team: [373, 330, 334, 350], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Steven', sprite: sp('steven'), lines: ["Welcome, challenger.", "I am Steven, the Hoenn Champion. Let our stones clash!"] },
      { type: 'battle', trainerName: 'Steven', trainerTitle: 'Champion', team: [376, 306, 348, 346, 227, 344], fieldSize: 3, essenceReward: 500 },
      { type: 'dialogue', speaker: 'Steven', sprite: sp('steven'), lines: ["A truly dazzling battle.", "Hoenn has a new Champion."] },
    ],
    completionReward: { essence: 2500, pack: 'rare' },
  },
  {
    id: 'sinnoh-e4', title: 'Sinnoh Elite Four', description: 'Face the strongest trainers in Sinnoh.',
    region: 'Sinnoh', difficulty: 'advanced', icon: '⭐',
    requires: ['sinnoh-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Aaron', sprite: sp('aaron'), lines: ["Welcome to the Pokémon League.", "I'm Aaron — Bug-types are way stronger than people think!"] },
      { type: 'battle', trainerName: 'Aaron', trainerTitle: 'Elite Four', team: [416, 214, 469, 402], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Bertha', sprite: sp('bertha'), lines: ["Well, hello, sonny!", "Granny Bertha will teach you how strong the earth can be."] },
      { type: 'battle', trainerName: 'Bertha', trainerTitle: 'Elite Four', team: [450, 76, 340, 464], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Flint', sprite: sp('flint'), lines: ["You ready to get fired up?", "My Fire-types will burn you to a crisp!"] },
      { type: 'battle', trainerName: 'Flint', trainerTitle: 'Elite Four', team: [392, 467, 136, 59], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Lucian', sprite: sp('lucian'), lines: ["A moment, please — let me finish this paragraph.", "Now... shall we begin?"] },
      { type: 'battle', trainerName: 'Lucian', trainerTitle: 'Elite Four', team: [475, 122, 437, 376], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: ["I'm Cynthia, the Sinnoh Champion.", "I never lose lightly. Bring everything you've got!"] },
      { type: 'battle', trainerName: 'Cynthia', trainerTitle: 'Champion', team: [445, 448, 442, 350, 407, 468], fieldSize: 3, essenceReward: 600 },
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: ["What a thrilling battle...", "You truly are a Champion. Sinnoh is yours."] },
    ],
    completionReward: { essence: 3000, pack: 'epic' },
  },

  // ───────────── EXPERT ─────────────
  {
    id: 'red-challenge', title: 'The Red Challenge', description: 'Face the legendary trainer atop Mt. Silver.',
    region: 'Kanto', difficulty: 'expert', icon: '🏔️',
    requires: ['kanto-e4', 'johto-e4'],
    steps: [
      { type: 'dialogue', speaker: 'Blue', sprite: sp('blue'), lines: ["You've beaten the Elite Four in two regions...", "But Red is on another level.", "He doesn't speak. He just battles."] },
      { type: 'battle', trainerName: 'Red', trainerTitle: 'Pokémon Master', team: [25, 143, 131, 3, 6, 9], fieldSize: 3, essenceReward: 1000 },
      { type: 'dialogue', speaker: 'Red', sprite: sp('red'), lines: ["..."] },
    ],
    completionReward: { essence: 5000, pack: 'legendary' },
  },
  {
    id: 'cynthia-rematch', title: "Cynthia's Rematch", description: 'The Sinnoh Champion seeks a worthy challenger.',
    region: 'Sinnoh', difficulty: 'expert', icon: '🌟',
    requires: ['sinnoh-e4'],
    steps: [
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: ["I've been training since our last battle.", "No holding back this time."] },
      { type: 'battle', trainerName: 'Cynthia', trainerTitle: 'Champion', team: [445, 448, 442, 350, 407, 468], fieldSize: 3, essenceReward: 1000 },
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: ["Magnificent... You truly are the strongest trainer I've ever faced."] },
    ],
    completionReward: { essence: 5000, pack: 'epic' },
  },
];

export const STORYLINES_BY_ID: Record<string, Storyline> = Object.fromEntries(
  STORYLINES.map((s) => [s.id, s])
);

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  beginner: 0, intermediate: 1, advanced: 2, expert: 3,
};
