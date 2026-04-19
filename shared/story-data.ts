// Story Mode — Multi-storyline system
// Each storyline is a sequence of battle and dialogue steps

const TRAINERS_PATH = '/pokemonparty/assets/trainers';

export interface StoryStep {
  type: 'battle' | 'dialogue' | 'info';
  speaker?: string;
  sprite?: string;
  lines?: string[];
  trainerName?: string;
  trainerTitle?: string;
  team?: number[];
  /** Optional per-pokemon hardcoded movesets (aligned with `team`). null → roll automatically. */
  teamMoves?: ([string, string] | null)[];
  fieldSize?: 1 | 2 | 3;
  essenceReward?: number;
  /** For 'info' steps: the title of the info card. */
  infoTitle?: string;
  /** For 'info' steps: the icon shown on the info card. */
  infoIcon?: string;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TeamChoice {
  label: string;
  pokemonIds: number[];
  /** Region lock activated when this team is chosen. Storylines with a
   *  matching `regionLock` become available; others stay locked forever. */
  region?: string;
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
  /** If set, only unlocks for players whose chosen starter region matches. */
  regionLock?: string;
}

/** Special chapter id used to record the irreversible starter-region pick. */
export const STARTER_REGION_PREFIX = 'starter-region:';
export function starterRegionChapter(region: string) { return STARTER_REGION_PREFIX + region; }

// Sentinel chapter ids posted on first-clear of specific storylines.
// Mechanics elsewhere in the code gate on these.
export const BOND_UNLOCK_CHAPTER = 'n-bond-awakening:complete';
export const CHARACTER_UNLOCK_CHAPTER = 'n-styles-revealed:complete';
export const MENU_UNLOCK_CHAPTER = 'cynthia-intro:complete';

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
      { label: 'Kanto Starters', pokemonIds: [1, 4, 7], region: 'Kanto' },
      { label: 'Johto Starters', pokemonIds: [152, 155, 158], region: 'Johto' },
      { label: 'Hoenn Starters', pokemonIds: [252, 255, 258], region: 'Hoenn' },
      { label: 'Sinnoh Starters', pokemonIds: [387, 390, 393], region: 'Sinnoh' },
      { label: 'Unova Starters', pokemonIds: [495, 498, 501], region: 'Unova' },
    ],
  },

  // ───────────── BEGINNER ─────────────
  {
    id: 'cynthia-intro', title: 'The Champion at the Crossroads',
    description: 'A quiet woman in black offers to teach you what a Pokémon battle really is.',
    region: 'Sinnoh', difficulty: 'beginner', icon: '🌙',
    requires: ['oak-starters'],
    steps: [
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "Oh — a new trainer. Professor Oak said you might pass through here. My name is Cynthia. I travel between the regions, researching the myths that people have forgotten and the ones they're still afraid to remember.",
        "Before you walk any further, I'd like to tell you something. Something every trainer should hear once, from someone who actually means it.",
        "The world you're standing in is older than any town or league. Long before there were trainers, there were Pokémon, and the land itself was shaped by them — mountains raised, oceans calmed, storms summoned and laid to rest. The regions you'll travel through each remember a different part of that story.",
      ]},
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "People and Pokémon have walked alongside each other for so long that nobody is quite sure who first reached out to whom. But somewhere along the way, we learned to ask them for help, and they learned to trust that we would care for them in return.",
        "That is what a battle is. Not a fight to prove who is stronger. A conversation. A moment in which your Pokémon shows you who they are, and you show them who you want to become.",
        "I'd like to have that conversation with you. Just once, so you understand the shape of it. Will you battle me?",
      ]},
      { type: 'battle', trainerName: 'Cynthia', trainerTitle: 'Champion', team: [443], teamMoves: [['Tackle', 'Sand Attack']], fieldSize: 1, essenceReward: 120 },
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "Thank you. That was a good conversation — and a better one than you realize.",
        "Did you feel it? The way your Pokémon waited for you, then trusted you, then moved? That feeling has a name in some of the old stories. The people of Sinnoh called it the thread. Every time you and a Pokémon share a moment — a victory, a rescue, even just a long walk — a thread is spun between you. Over time, those threads weave together into something the world itself can feel.",
        "That's the real reason trainers exist. Not to collect Pokémon. Not even to win. It's to weave.",
      ]},
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "A word of practical advice before I go. As you travel, you'll earn something the old records call Essence — the residue of all those shared moments. You can trade it at the Dreaming Market for supplies, for new partners not yet born into the waking world, and for the little catalysts that help a Pokémon grow into what it's always been becoming.",
        "You'll also meet other trainers who want to test themselves against you, and tournaments where the whole world is watching. Don't be afraid of any of it. The thread between you and your team is already strong enough.",
        "Go on, then. The world is ready for you.",
      ]},
      { type: 'info', infoTitle: 'The World Opens Up', infoIcon: '🌅', lines: [
        "Battles, Collection, Pokédex, Shop — all unlocked.",
        "Your journey begins.",
      ]},
    ],
    completionReward: { essence: 300 },
  },
  {
    id: 'bug-catcher', title: 'Bug Catcher Frenzy', description: 'A bug enthusiast blocks the path!',
    region: 'Kanto', difficulty: 'beginner', icon: '🐛', requires: ['cynthia-intro'],
    steps: [
      { type: 'dialogue', speaker: 'Bug Catcher', sprite: sp('bugcatcher'), lines: [
        "Hey, wait — you felt that too, right? The little hum when a Caterpie walks past?",
        "Everyone else says bugs don't have much going on. I don't believe that. I think their threads are just quieter — you have to lean in to hear them.",
        "Battle me! I want to prove their voices count too.",
      ]},
      { type: 'battle', trainerName: 'Bug Catcher', trainerTitle: 'Trainer', team: [10, 13], fieldSize: 1, essenceReward: 80 },
      { type: 'dialogue', speaker: 'Bug Catcher', sprite: sp('bugcatcher'), lines: [
        "...You heard them too, didn't you. Not just mine — yours.",
        "That's all I wanted. Thanks, trainer. I'll keep listening.",
      ]},
    ],
    completionReward: { essence: 150 },
  },
  {
    id: 'youngster-joey', title: "Youngster Joey's Dare", description: 'His Rattata is in the top percentage!',
    region: 'Kanto', difficulty: 'beginner', icon: '👦', requires: ['cynthia-intro'],
    steps: [
      { type: 'dialogue', speaker: 'Youngster Joey', sprite: sp('youngster'), lines: [
        "Hey! You're a real trainer, right? You've gotta fight me.",
        "Everyone laughs at my Rattata. But he's been with me since before I even knew what a Pokémon was — he used to sleep on my pillow.",
        "If the thread is real, then ours is the strongest one out there. Let me prove it!",
      ]},
      { type: 'battle', trainerName: 'Youngster Joey', trainerTitle: 'Trainer', team: [19, 20], fieldSize: 1, essenceReward: 80 },
      { type: 'dialogue', speaker: 'Youngster Joey', sprite: sp('youngster'), lines: [
        "Aw man... okay, fine, you beat us.",
        "But you saw him, right? He fought his heart out. That counts for something.",
        "He's still in the top percentage to me.",
      ]},
    ],
    completionReward: { essence: 150 },
  },
  {
    id: 'n-bond-awakening', title: 'A Stranger Named N',
    description: 'A mysterious young man wants to talk about your Pokémon.',
    region: 'Unova', difficulty: 'beginner', icon: '👁️',
    requires: ['bug-catcher', 'youngster-joey'],
    steps: [
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "...Your Pokémon. They're saying something. Yes — I can hear them. Most people can't, but I always have.",
        "Tell me, trainer: do you think your Pokémon are happy by your side?",
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "I'm called N. I travel the world looking for the truth about Pokémon and people. I've seen trainers who treat their Pokémon as tools. Weapons. But I've also seen ones — like you — who might just be friends with them.",
        "I want to feel for myself. Battle me, and let me hear your Pokémon's voices.",
      ]},
      { type: 'battle', trainerName: 'N', trainerTitle: 'Mysterious Trainer', team: [509, 519, 531], fieldSize: 1, essenceReward: 120 },
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "...I felt it. Your Pokémon trust you. That bond is not something you train into them. It's something you earn — together, over time.",
        "Every battle you fight beside them, every moment you share, they grow closer to you. And as that bond deepens, your Pokémon themselves change. They grow. They become more.",
      ]},
      { type: 'info', infoTitle: 'Bond XP — Unlocked!', infoIcon: '💞', lines: [
        "Your Pokémon now earn Bond XP from every battle.",
        "Higher bond → evolution.",
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "We will meet again, trainer. The world is larger than you realize. Until then... listen to your Pokémon. They have so much to say."
      ]},
    ],
    completionReward: { essence: 300 },
  },
  {
    id: 'may-rival', title: "May's Challenge", description: 'A Hoenn rival blocks the path with her starter!',
    region: 'Hoenn', difficulty: 'beginner', icon: '🌿', requires: ['n-bond-awakening'],
    steps: [
      { type: 'dialogue', speaker: 'May', sprite: sp('may'), lines: [
        "Hey! You're the trainer Dad's been going on about. Figures.",
        "My dad runs the Petalburg Gym, so people expect a lot from me — but that's not why I'm out here. I'm out here because the ocean off Hoenn hums, and I want to know why.",
        "Cynthia told me you'd be someone to test myself against. Ready?",
      ]},
      { type: 'battle', trainerName: 'May', trainerTitle: 'Hoenn Rival', team: [255, 261, 273], fieldSize: 1, essenceReward: 100 },
      { type: 'dialogue', speaker: 'May', sprite: sp('may'), lines: [
        "Whoa — okay, you're better than I thought. A lot better.",
        "I felt the thread pull when you moved. I want that too.",
        "Next time I see you, I'll have my own answer. Promise.",
      ]},
    ],
    completionReward: { essence: 200 },
  },
  {
    id: 'barry-rival', title: "Barry's Rush", description: "Sinnoh's hyper rival has no time to lose!",
    region: 'Sinnoh', difficulty: 'beginner', icon: '⚡', requires: ['n-bond-awakening'],
    steps: [
      { type: 'dialogue', speaker: 'Barry', sprite: sp('barry'), lines: [
        "Hey hey hey! You're the one Cynthia battled, right?! I can't BELIEVE she battled you before me!",
        "I want to be Champion someday. Like, by next week. I know everyone laughs but if I just keep moving, keep battling, the thread's gotta grow, right?!",
        "So — BATTLE! Right now! No excuses!",
      ]},
      { type: 'battle', trainerName: 'Barry', trainerTitle: 'Sinnoh Rival', team: [390, 396, 399], fieldSize: 1, essenceReward: 100 },
      { type: 'dialogue', speaker: 'Barry', sprite: sp('barry'), lines: [
        "AAGH! Lost again! Fine, fine, FINE —",
        "But did you see them? My guys fought so hard. That's the thread thing, right?? That was the thing?!",
        "Okay okay I gotta go train. I'm fining myself ten thousand for losing. BYE!",
      ]},
    ],
    completionReward: { essence: 200 },
  },
  {
    id: 'n-styles-revealed', title: 'A Familiar Stranger',
    description: 'N returns — and brings a question about how you fight.',
    region: 'Unova', difficulty: 'beginner', icon: '🎭',
    requires: ['may-rival', 'barry-rival'],
    steps: [
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "We meet again, trainer. I told you we would.",
        "I've been watching. Your bond with your Pokémon — it's grown. But I've also noticed something curious.",
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "Every trainer I've met fights differently. Some plan, some attack, some protect. Your Pokémon don't just listen to your moves — they listen to who you are in battle.",
        "Tell me... do you even know what kind of trainer you've become? Show me. Battle me again, and let your style speak.",
      ]},
      { type: 'battle', trainerName: 'N', trainerTitle: 'Mysterious Trainer', team: [625, 533, 544], fieldSize: 1, essenceReward: 240 },
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "Yes... I see it now. You have a voice in battle, even if you've never heard it.",
        "From now on, when you send out a Pokémon, choose how you show up too. Your style shapes their resolve. Their resolve shapes the fight.",
      ]},
      { type: 'info', infoTitle: 'Battle Styles — Unlocked!', infoIcon: '🎭', lines: [
        "Pick a battle style for each Pokémon when you send it out.",
        "Different styles, different vibes. Find what fits you.",
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "Until next time, trainer. I'm curious to see who you become.",
      ]},
    ],
    completionReward: { essence: 400 },
  },

  // ───────────── INTERMEDIATE ─────────────
  {
    id: 'kanto-gyms', title: 'Kanto Gym Circuit', description: 'Challenge the Kanto gym leaders in sequence.',
    region: 'Kanto', difficulty: 'intermediate', icon: '🏛️', regionLock: 'Kanto',
    requires: ['n-styles-revealed'],
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
    region: 'Johto', difficulty: 'intermediate', icon: '🏛️', regionLock: 'Johto',
    requires: ['n-styles-revealed'],
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
    region: 'Hoenn', difficulty: 'intermediate', icon: '🏛️', regionLock: 'Hoenn',
    requires: ['n-styles-revealed'],
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
    region: 'Sinnoh', difficulty: 'intermediate', icon: '🏛️', regionLock: 'Sinnoh',
    requires: ['n-styles-revealed'],
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
  {
    id: 'unova-gyms', title: 'Unova Gym Circuit', description: 'Challenge the Unova gym leaders.',
    region: 'Unova', difficulty: 'intermediate', icon: '🏛️', regionLock: 'Unova',
    requires: ['n-styles-revealed'],
    steps: [
      { type: 'dialogue', speaker: 'Cilan', sprite: sp('cilan'), lines: ["Welcome to the Striaton Gym restaurant.", "Today's special: a battle with the Triple Gym Leaders!"] },
      { type: 'battle', trainerName: 'Cilan', trainerTitle: 'Striaton Gym Leader', team: [511, 506, 270], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Chili', sprite: sp('chili'), lines: ["My turn! Time to fire things up!", "Get ready to feel the heat!"] },
      { type: 'battle', trainerName: 'Chili', trainerTitle: 'Striaton Gym Leader', team: [513, 58, 322], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Cress', sprite: sp('cress'), lines: ["My elegant water Pokémon will rinse you out.", "Shall we begin?"] },
      { type: 'battle', trainerName: 'Cress', trainerTitle: 'Striaton Gym Leader', team: [515, 60, 318], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Lenora', sprite: sp('lenora'), lines: ["Welcome, dear, to the Nacrene Museum.", "Time for a research project — on you!"] },
      { type: 'battle', trainerName: 'Lenora', trainerTitle: 'Nacrene Gym Leader', team: [505, 507, 508], fieldSize: 1, essenceReward: 150 },
      { type: 'dialogue', speaker: 'Burgh', sprite: sp('burgh'), lines: ["Inspiration strikes when I battle.", "Let's create a masterpiece together!"] },
      { type: 'battle', trainerName: 'Burgh', trainerTitle: 'Castelia Gym Leader', team: [542, 545, 589], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Elesa', sprite: sp('elesa'), lines: ["Welcome to my electrifying gym, model challenger.", "Let's give the audience a show!"] },
      { type: 'battle', trainerName: 'Elesa', trainerTitle: 'Nimbasa Gym Leader', team: [587, 523, 595], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Clay', sprite: sp('clay'), lines: ["Now, that's a sturdy challenger!", "Let me show you what real ground-shakin' looks like!"] },
      { type: 'battle', trainerName: 'Clay', trainerTitle: 'Driftveil Gym Leader', team: [536, 552, 530], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Skyla', sprite: sp('skyla'), lines: ["Welcome to Mistralton Gym, the runway!", "Ready to soar? My birds will take you on a flight!"] },
      { type: 'battle', trainerName: 'Skyla', trainerTitle: 'Mistralton Gym Leader', team: [581, 561, 277], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Brycen', sprite: sp('brycen'), lines: ["Hmph. The cold reveals all weakness.", "Let me chill your spirit."] },
      { type: 'battle', trainerName: 'Brycen', trainerTitle: 'Icirrus Gym Leader', team: [524, 615, 583], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Drayden', sprite: sp('drayden'), lines: ["Long has Opelucid waited for a worthy challenger.", "Show me the fire of a true dragon trainer!"] },
      { type: 'battle', trainerName: 'Drayden', trainerTitle: 'Opelucid Gym Leader', team: [621, 612, 635], fieldSize: 2, essenceReward: 250 },
      { type: 'dialogue', speaker: 'Drayden', sprite: sp('drayden'), lines: ["Marvelous!", "Unova's Pokémon League awaits you, Champion-to-be."] },
    ],
    completionReward: { essence: 1000, pack: 'uncommon' },
  },
  {
    id: 'team-rocket', title: 'Team Rocket Hideout',
    description: 'Silph Co. has gone dark. Something very old, and very patient, has crawled out of retirement.',
    region: 'Kanto', difficulty: 'advanced', icon: '🚀', regionLock: 'Kanto',
    requires: ['kanto-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Prof. Oak', sprite: sp('oak'), lines: [
        "I got your message. And yes — it's them again.",
        "Silph Co. stopped answering their phones two days ago. Officer Jenny found a sigil on the back of the lobby doors. A red R, stitched into the wallpaper like it had always been there.",
        "Team Rocket never really left, you understand. They just learned to wait. The only person who could call them back is the one who built them.",
        "I won't ask you to go in. I'll just tell you what Cynthia once told me, the first time I stood at a door like this. A trained Pokémon is a small, strange gift. Team Rocket are the people who learned how to steal that gift. Don't forget which of those things you are."
      ]},
      { type: 'dialogue', speaker: 'Rocket Grunt', sprite: sp('rocketgrunt'), lines: [
        "Hey, kid! You're not on the visitor list.",
        "Hand over your Pokémon and we'll call it a nice walk. Otherwise my Koffing gets to say hi."
      ]},
      { type: 'battle', trainerName: 'Rocket Grunt', trainerTitle: 'Team Rocket', team: [41, 109, 24], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Rocket Grunt', sprite: sp('rocketgrunt'), lines: [
        "Tch — lucky hit. The boss said there'd be a brat.",
        "You're bouncing back up to the tenth floor now, right? Fine. Save me the climb."
      ]},
      { type: 'dialogue', speaker: 'Rocket Grunt', sprite: sp('rocketgruntf'), lines: [
        "You're the one ruining our evening, huh?",
        "Team Rocket pays in cold cash and colder feelings. Trust me — this is the best job a girl can have in Kanto right now."
      ]},
      { type: 'battle', trainerName: 'Rocket Grunt', trainerTitle: 'Team Rocket', team: [110, 89, 42], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Rocket Grunt', sprite: sp('rocketgruntf'), lines: [
        "...okay, fine, you're good.",
        "Petrel is next. He's... weird. Just pretend you don't notice."
      ]},
      { type: 'dialogue', speaker: 'Petrel', sprite: sp('petrel'), lines: [
        "Ahh, so this is the famous kid. Younger than I pictured. Meaner mouth, though — you looked at my face like I owed you something.",
        "I do impressions, you know. Little hobby. Want to hear me do the boss? 'You're in my way.' Chilling, isn't it? I've been rehearsing for years.",
        "Enough warm-up. Let's see how you handle an actual rocket instead of the firecrackers downstairs."
      ]},
      { type: 'battle', trainerName: 'Petrel', trainerTitle: 'Team Rocket Executive', team: [42, 89, 110, 24], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Petrel', sprite: sp('petrel'), lines: [
        "Fine, fine. You win this one. I'll go practise a new voice.",
        "Proton is on the staircase. Don't joke with him. He doesn't know what jokes are."
      ]},
      { type: 'dialogue', speaker: 'Proton', sprite: sp('proton'), lines: [
        "So you're the one who won't stop moving.",
        "I don't have anything to say to you. People who talk give people who listen something to use. I only use.",
        "Your Pokémon won't be returned. Nothing here is returned."
      ]},
      { type: 'battle', trainerName: 'Proton', trainerTitle: 'Team Rocket Executive', team: [95, 53, 49, 109], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Proton', sprite: sp('proton'), lines: [
        "...",
        "Go on, then. The next door is open. I don't waste breath twice."
      ]},
      { type: 'dialogue', speaker: 'Ariana', sprite: sp('ariana'), lines: [
        "Well. Look at you — climbing through our whole building in one afternoon.",
        "You remind me of someone, actually. A boy I used to know. He was very sweet, very loud, and very dead by the time he was sixteen.",
        "The problem with children like him, and like you, is you think being right is a shield. It isn't. It's a very pretty piece of glass."
      ]},
      { type: 'battle', trainerName: 'Ariana', trainerTitle: 'Team Rocket Executive', team: [59, 229, 31, 169], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Ariana', sprite: sp('ariana'), lines: [
        "...I misjudged you. Not glass, then. Something with more edges.",
        "Go. Archer is up the hall. He is the only one of us the boss genuinely likes. Be careful how you stand in front of him."
      ]},
      { type: 'dialogue', speaker: 'Archer', sprite: sp('archer'), lines: [
        "Trainer. You must be tired. Please — sit if you like. You've earned it.",
        "I am Archer. I am the hand that brought Team Rocket back together. Ariana calls me the one who believes in him, and I suppose that's right. Somebody had to.",
        "I don't dislike you. I don't think Giovanni does either. You are simply the last lock on a door we've been opening for years. Locks don't mean to be inconvenient. They just are."
      ]},
      { type: 'battle', trainerName: 'Archer', trainerTitle: "Giovanni's Right Hand", team: [51, 93, 229, 68, 65], fieldSize: 2, essenceReward: 450 },
      { type: 'dialogue', speaker: 'Archer', sprite: sp('archer'), lines: [
        "...Inconvenient, then. I was wrong.",
        "The boss is waiting. He asked me to let you through if you got this far. He always said he wanted to meet the kid personally."
      ]},
      { type: 'dialogue', speaker: 'Giovanni', sprite: sp('giovanni'), lines: [
        "So — you are the child.",
        "I watched you through the cameras on every floor. You move well. Your Pokémon move better. That is rare.",
        "Do you understand what I've spent my life doing? I have taken the strongest creatures on this continent and I have made them useful. Useful — that is the only honest word for what a Pokémon is to a person. Everything else is decoration."
      ]},
      { type: 'dialogue', speaker: 'Giovanni', sprite: sp('giovanni'), lines: [
        "Cynthia teaches children about threads and conversations. Professor Oak writes papers about friendship. I respect them. I do. They are the paint on the outside of a very expensive machine.",
        "I am the machine.",
        "Show me your machine, then. Let's see whose runs cleaner."
      ]},
      { type: 'battle', trainerName: 'Giovanni', trainerTitle: 'Team Rocket Boss', team: [34, 112, 31, 51, 248, 130], fieldSize: 2, essenceReward: 900 },
      { type: 'dialogue', speaker: 'Giovanni', sprite: sp('giovanni'), lines: [
        "...",
        "I felt that last hit. Not in my Pokémon. In me. How strange.",
        "Perhaps I have been wrong about one thing. A machine does not flinch when it loses. You — and the small, stubborn creatures behind you — flinched together.",
        "Take the building. Take the company. Take the R on the door. I am done with them. They were never enough."
      ]},
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "I heard it from across the region. The whole Silph tower quietly unknotting itself.",
        "Remember what I told you at the crossroads? About a battle being a conversation?",
        "He just had one. He'll spend the rest of his life trying to decide whether it was with you, or with the part of himself he gave up a long time ago. Either way — it wasn't about power. Not in the end.",
        "Go home, trainer. You did a rare thing today."
      ]},
    ],
    completionReward: { essence: 1800, pack: 'rare' },
  },
  {
    id: 'aqua-magma', title: 'Aqua vs Magma',
    description: 'Two teams. One sea, one mountain. Neither willing to listen. And Hoenn in the middle.',
    region: 'Hoenn', difficulty: 'advanced', icon: '🌋', regionLock: 'Hoenn',
    requires: ['hoenn-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Steven', sprite: sp('steven'), lines: [
        "You picked a bad week to finish the gym circuit. Or a good one, depending on how brave you are.",
        "Team Aqua have taken the submarine bay at Slateport. Team Magma have taken the volcano at Mt. Chimney. Both of them are chasing the same pair of ancient Pokémon, from the two ends of a very old story.",
        "The worst of it isn't that either team is cruel. It's that both of them think they're the kind one. Archie wants the sea to cover the world so people stop hurting the ocean. Maxie wants the land to swallow the sea so people stop drowning in storms.",
        "Neither of them is listening to Hoenn itself. I need someone who will listen. Will you go?"
      ]},
      { type: 'dialogue', speaker: 'Aqua Grunt', sprite: sp('aquagrunt'), lines: [
        "Oi! No dry-landers past this point.",
        "Archie is busy saving the world, and you're in our wake."
      ]},
      { type: 'battle', trainerName: 'Aqua Grunt', trainerTitle: 'Team Aqua', team: [318, 320, 72], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Aqua Grunt', sprite: sp('aquagrunt'), lines: [
        "Grr — fine. Go find Shelly. See how she likes you."
      ]},
      { type: 'dialogue', speaker: 'Shelly', sprite: sp('shelly'), lines: [
        "You're the kid the gym leaders wouldn't shut up about. Smaller than I pictured.",
        "Let me make this short. The sea has been a garbage dump for a hundred years. Every coral I cut open has a cigarette in it. Every fish I tag has a story it shouldn't have.",
        "Archie is going to wash all of that away. And yes, it will cost us some things. Land things. Your things. That is how a debt gets paid."
      ]},
      { type: 'battle', trainerName: 'Shelly', trainerTitle: 'Team Aqua Admin', team: [367, 319, 224, 73], fieldSize: 2, essenceReward: 350 },
      { type: 'dialogue', speaker: 'Shelly', sprite: sp('shelly'), lines: [
        "...Alright. Alright.",
        "Matt is guarding the sub. Don't let him scare you — he's mostly elbows."
      ]},
      { type: 'dialogue', speaker: 'Matt', sprite: sp('matt'), lines: [
        "WOOO! Yes! Someone finally showed up! This is what I trained for!",
        "Archie says fight smart. Archie says think first. Archie says I talk too loud.",
        "Archie's not here right now, is he. Let's GO, kid!"
      ]},
      { type: 'battle', trainerName: 'Matt', trainerTitle: 'Team Aqua Admin', team: [319, 130, 34, 223], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Matt', sprite: sp('matt'), lines: [
        "Hah! HAHA! Oh man, you got me! That was great!",
        "Go see the boss. Tell him Matt said he's gonna like you. He won't, but tell him anyway."
      ]},
      { type: 'dialogue', speaker: 'Archie', sprite: sp('archie'), lines: [
        "You came all the way down here just to argue with me? I respect that, kid. I really do.",
        "Look. I've spent my whole life on the water. I know what a dying sea sounds like. It's quieter every year. No whale song in the gulf anymore. No Wailord calling back. The old waters are starving.",
        "I'm not a bad man. I'm just the only one who stopped pretending.",
      ]},
      { type: 'dialogue', speaker: 'Archie', sprite: sp('archie'), lines: [
        "Your teacher Cynthia would say I'm not listening. She's wrong. I've been listening my whole life. I just don't like the answer I got.",
        "So let's have one of her conversations, then. You and me. Loud as you can."
      ]},
      { type: 'battle', trainerName: 'Archie', trainerTitle: 'Team Aqua Leader', team: [319, 130, 342, 73, 593, 321], fieldSize: 2, essenceReward: 700 },
      { type: 'dialogue', speaker: 'Archie', sprite: sp('archie'), lines: [
        "...",
        "You fight like the ocean does. Not against me — around me. Taking what's weak and leaving the rest.",
        "Fine. Go stop Maxie too, if you still can. And after — come find me. There's a beach at Pacifidlog I haven't walked in years. I'd like to see it with someone who doesn't want anything."
      ]},
      { type: 'dialogue', speaker: 'Magma Grunt', sprite: sp('magmagrunt'), lines: [
        "No outsiders on the mountain!",
        "Maxie's drilling to the magma vein. Nothing's stopping us — not a sea-brat, and definitely not you."
      ]},
      { type: 'battle', trainerName: 'Magma Grunt', trainerTitle: 'Team Magma', team: [322, 218, 88], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Magma Grunt', sprite: sp('magmagrunt'), lines: [
        "Get lost already! Courtney will deal with you!"
      ]},
      { type: 'dialogue', speaker: 'Courtney', sprite: sp('courtney'), lines: [
        "Target. Acquired.",
        "I am Courtney. I am a researcher. I do not feel anger. I only feel pattern.",
        "Pattern says: there is too much ocean. Pattern says: land must increase. Pattern says: obstacles are removed. You are an obstacle. This is not personal."
      ]},
      { type: 'battle', trainerName: 'Courtney', trainerTitle: 'Team Magma Admin', team: [37, 58, 156, 323], fieldSize: 2, essenceReward: 350 },
      { type: 'dialogue', speaker: 'Courtney', sprite: sp('courtney'), lines: [
        "Pattern adjusted. Obstacle remains. Obstacle is... interesting.",
        "Proceed. Tabitha is guarding the caldera."
      ]},
      { type: 'dialogue', speaker: 'Tabitha', sprite: sp('tabitha'), lines: [
        "You've made it further than any trainer has ever made it through Magma's ranks. Congratulations.",
        "I don't intend to let you reach Maxie. Not because I dislike you — I barely know you — but because he is the only person in my life who has ever made me feel useful, and I owe him everything.",
        "A man who saves you from being nothing will set the world on fire for you if you ask. That is the secret nobody at the university wants to print."
      ]},
      { type: 'battle', trainerName: 'Tabitha', trainerTitle: 'Team Magma Admin', team: [324, 219, 59, 323], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Tabitha', sprite: sp('tabitha'), lines: [
        "...You've won. I'm finished. I only ask that, whatever you say to him next, you say it gently. He does love us. He just loves the mountain a little more."
      ]},
      { type: 'dialogue', speaker: 'Maxie', sprite: sp('maxie'), lines: [
        "Ah. You. I wondered whether the gym leaders would send you, or whether Archie would talk you into his version of it first.",
        "Look around, trainer. The caldera is warm. The mountain is awake. Do you know how many people drown every year in Hoenn? Seven hundred and twenty-nine, last count. Do you know how many burn?",
        "Seven. Water has always killed more of us than fire. I am not a fanatic. I am a statistician."
      ]},
      { type: 'dialogue', speaker: 'Maxie', sprite: sp('maxie'), lines: [
        "Archie believes that if he drowns the world slowly, it will be kinder than if nature drowns it in pieces. He is sentimental. Magma would be quick. Magma would be final. Magma would be, in the cold end, merciful.",
        "I will not convince you. I don't think you'd let me. So — let my Pokémon argue instead. They always say it better than I do."
      ]},
      { type: 'battle', trainerName: 'Maxie', trainerTitle: 'Team Magma Leader', team: [323, 229, 330, 324, 126, 219], fieldSize: 2, essenceReward: 700 },
      { type: 'dialogue', speaker: 'Maxie', sprite: sp('maxie'), lines: [
        "...",
        "My numbers were clean. My reasoning was sound. And yet you've just... disproven me, with nothing more than a handful of ordinary Pokémon who happened to still be holding hands.",
        "There is a variable I did not account for. I'll have to start over.",
        "Go. Tell Archie he was also wrong. Maybe, if we are both wrong together, we can stop shouting."
      ]},
      { type: 'dialogue', speaker: 'Steven', sprite: sp('steven'), lines: [
        "You've quieted both volcanos. One of rock. One of men.",
        "Hoenn breathes easier tonight than it has in a decade. And the funny thing — neither of those two were lying. They were both telling a true story, with one bad ending.",
        "Cynthia wrote me last week. She said you were the first trainer she'd met in a long time whose Pokémon would lose for you before they'd leave you. I didn't understand what she meant then. I do now."
      ]},
    ],
    completionReward: { essence: 2200, pack: 'rare' },
  },
  {
    id: 'team-rocket-revival', title: 'The Signal Under Johto',
    description: 'Giovanni is gone, but his company isn\'t. Someone is broadcasting his voice out of Goldenrod — and the Pokémon are listening.',
    region: 'Johto', difficulty: 'advanced', icon: '📡', regionLock: 'Johto',
    requires: ['johto-gyms', 'team-rocket'],
    steps: [
      { type: 'dialogue', speaker: 'Prof. Oak', sprite: sp('oak'), lines: [
        "It's happening again. But not how you'd expect.",
        "Three years after Silph. The Goldenrod Radio Tower has been pushing an old, scrambled signal on a sub-band at night. Kurt in Azalea says his slowpokes line up when it starts playing. The tails don't grow back for days.",
        "This isn't Giovanni. He's in hiding, if he's alive. This is someone trying very hard to be him. Be careful, trainer. A copy of a villain is sometimes worse than the original — copies have something to prove."
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "I came because the signal hurts.",
        "I hear Pokémon the way you hear music. And tonight, in the low band, I hear them being tuned. Forced into a key they were not born in. It is the worst thing I have felt since I was a boy.",
        "I can't fight the people who built it. I am not... that kind of person anymore. But you are a trainer, and the Pokémon at your side chose you freely. Walk me up the tower. I will tell you what I hear at every floor."
      ]},
      { type: 'dialogue', speaker: 'Rocket Grunt', sprite: sp('rocketgrunt'), lines: [
        "Hah, a fan? The boss said we'd get the usual curious kid.",
        "You heard the broadcast too, I bet. It's catchy, isn't it? Doesn't matter. You're not going up."
      ]},
      { type: 'battle', trainerName: 'Rocket Grunt', trainerTitle: 'Team Rocket', team: [43, 96, 41], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "The Zubat on that grunt's belt — its ears are bleeding. The signal pushes them past their range.",
        "Keep climbing. The next floor is louder."
      ]},
      { type: 'dialogue', speaker: 'Rocket Grunt', sprite: sp('rocketgruntf'), lines: [
        "You brought a guy with green hair up a radio tower? Huh. Weird date.",
        "Team Rocket's back, kid. Giovanni or no Giovanni. Ideas don't need a face."
      ]},
      { type: 'battle', trainerName: 'Rocket Grunt', trainerTitle: 'Team Rocket', team: [19, 20, 48, 49], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Petrel', sprite: sp('petrel'), lines: [
        "Well, hello again. Remember me? Silph tower, floor nine, the one with the voice.",
        "Ahem. '...I do not need heroes. I need power. And you are in my way.' Still got it? Be honest.",
        "I've been running this whole operation for months. The grunts think I am him. Archer even fell for it once. That's a man with his eyes closed and his ears open — the best kind of follower."
      ]},
      { type: 'battle', trainerName: 'Petrel', trainerTitle: 'Team Rocket Executive', team: [43, 42, 110, 89], fieldSize: 2, essenceReward: 350 },
      { type: 'dialogue', speaker: 'Petrel', sprite: sp('petrel'), lines: [
        "Okay, okay. Voice lessons clearly weren't enough.",
        "Go on up. The real believers are waiting."
      ]},
      { type: 'dialogue', speaker: 'Proton', sprite: sp('proton'), lines: [
        "You again.",
        "Last time I said nothing to you. I'll say one thing this time — the signal was my idea. Pokémon listen to the same frequency whales use to call home across an ocean. It turns out you can call them somewhere else with it. Anywhere else.",
        "Imagine what a boy like you could do with an army that came when you whistled."
      ]},
      { type: 'battle', trainerName: 'Proton', trainerTitle: 'Team Rocket Executive', team: [95, 107, 49, 24, 101], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "He was going to sell that idea to governments. He already has a buyer.",
        "One more floor. The tower-top is where the transmitter lives. Ariana will not move from it. She believes Giovanni is coming back, and she has built a pulpit for him."
      ]},
      { type: 'dialogue', speaker: 'Ariana', sprite: sp('ariana'), lines: [
        "You're the child who finished my boss. I've thought about you every night since.",
        "Do you know what it is to love a man who made you somebody? Before Giovanni, I was nothing — a waitress from Celadon with a bad temper and a cheap haircut. He looked at me for ten seconds and said, 'You will run my advertising department.' And I did. And I was good.",
        "He went quiet after you beat him. We didn't know what to do. So we built this — a signal that calls him home. If Pokémon can hear it, maybe he can too. Maybe he'll remember us."
      ]},
      { type: 'battle', trainerName: 'Ariana', trainerTitle: 'Team Rocket Executive', team: [229, 31, 59, 169, 432], fieldSize: 2, essenceReward: 500 },
      { type: 'dialogue', speaker: 'Ariana', sprite: sp('ariana'), lines: [
        "...It was never going to work, was it.",
        "He's not coming. He was never coming. Archer — Archer kept saying 'just one more broadcast.' I was the one pouring the drinks. I heard him cry once. I pretended I didn't.",
        "Go. Shut off the tower. Shut off us."
      ]},
      { type: 'dialogue', speaker: 'Archer', sprite: sp('archer'), lines: [
        "Trainer. I remember you.",
        "At Silph I told you locks don't mean to be inconvenient. I've thought about that line for years. I was wrong. Locks do mean to be inconvenient. That is the whole point of a lock. That is what we were.",
        "Without him, I had to choose what to love. I chose the shape of him. A voice. A signal. A broadcast. I taught it to every Pokémon in this building. I called it him.",
        "And then you came back. And I realised — the only person in the world who can tell a copy from the original is the person who once defeated the original."
      ]},
      { type: 'dialogue', speaker: 'Archer', sprite: sp('archer'), lines: [
        "One last fight, then. Not for him. For the lock. So at least the door closes cleanly this time."
      ]},
      { type: 'battle', trainerName: 'Archer', trainerTitle: 'Team Rocket Leader', team: [51, 93, 229, 58, 65, 130], fieldSize: 2, essenceReward: 900 },
      { type: 'dialogue', speaker: 'Archer', sprite: sp('archer'), lines: [
        "...",
        "Goodnight, trainer. The signal is off. The Pokémon outside have stopped walking. You can hear the crickets again — I couldn't hear them for six months.",
        "If you ever see him — tell him his company was good. Tell him his people waited. And tell him... we are done waiting."
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "The sky is quiet. The birds are flying the wrong direction — they are remembering where south is. It will take them a few hours.",
        "Thank you for doing what I could not. I have spent so long being angry at men that I forget some of them are already in pain, and they make their monsters out of it.",
        "Walk home slowly. Hold your Pokémon's hands. The thread held tonight, and it was because of you."
      ]},
    ],
    completionReward: { essence: 2000, pack: 'rare' },
  },
  {
    id: 'team-galactic', title: 'The World Without Spirit',
    description: 'A quiet man in Sinnoh is trying to unmake the sky. He believes he is saving everyone.',
    region: 'Sinnoh', difficulty: 'advanced', icon: '🌌', regionLock: 'Sinnoh',
    requires: ['sinnoh-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "I came back to Sinnoh because I felt the sky lean.",
        "You won't find this in any newspaper yet. A man named Cyrus, who owns half of Veilstone, has been buying artifacts related to Dialga and Palkia for ten years. Quietly. Legally. Through thirty-one shell companies.",
        "Last week one of his employees — a grey-haired researcher named Charon — filed a patent for a machine called the 'Red Chain.' The description says it resonates with the fabric of reality. It also says, in a footnote, that the intended purpose is to 'restart' said fabric.",
        "I am not a detective, trainer. But I am very frightened. Would you walk with me?"
      ]},
      { type: 'dialogue', speaker: 'Galactic Grunt', sprite: sp('galacticgrunt'), lines: [
        "Galactic business. Move along.",
        "The boss is building a better world. Your 'world' is in the way."
      ]},
      { type: 'battle', trainerName: 'Galactic Grunt', trainerTitle: 'Team Galactic', team: [431, 451, 109], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Galactic Grunt', sprite: sp('galacticgrunt'), lines: [
        "Lucky. The Commanders are on every floor above. You'll run out of luck on one of them."
      ]},
      { type: 'dialogue', speaker: 'Mars', sprite: sp('mars'), lines: [
        "Well hey there! Don't tell me — you're the trainer! The one people gossip about!",
        "You want to know a fun secret? I am Galactic's morale officer. My actual job is to make everyone here feel better about the fact that we are going to delete the universe. Cheering them up in the mess hall. Doing karaoke. I'm so good at it.",
        "Cyrus doesn't smile. He said the mission didn't need it. I disagreed. I smile twice as much so the average comes out right."
      ]},
      { type: 'battle', trainerName: 'Mars', trainerTitle: 'Galactic Commander', team: [431, 510, 432, 405], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Mars', sprite: sp('mars'), lines: [
        "Oof! Okay! Well! I lost, didn't I!",
        "Don't feel bad, trainer. I lose to Cyrus in chess every Wednesday. I'm used to it.",
        "Jupiter's up the elevator. She will not smile at you. That is her job."
      ]},
      { type: 'dialogue', speaker: 'Jupiter', sprite: sp('jupiter'), lines: [
        "You are the obstacle Mars mentioned. Smaller than her report suggested.",
        "I am Jupiter. I run internal security. My Pokémon and I have one rule: we do not lose to obstacles.",
        "Cyrus says emotion is noise. I don't agree with everything he says — I enjoy winning, for instance — but I agree with that one. You should try silencing yourself sometime. It is very efficient."
      ]},
      { type: 'battle', trainerName: 'Jupiter', trainerTitle: 'Galactic Commander', team: [42, 452, 466, 461], fieldSize: 2, essenceReward: 450 },
      { type: 'dialogue', speaker: 'Jupiter', sprite: sp('jupiter'), lines: [
        "...I have lost. How strange. I will need to recalibrate.",
        "Saturn is at the inner lab. He is the one who built what we are about to start. Talk to him, if you can. He listens. I never understood why."
      ]},
      { type: 'dialogue', speaker: 'Saturn', sprite: sp('saturn'), lines: [
        "Trainer. Please — I have two minutes. The Red Chain is priming. I want to use them carefully.",
        "I was Cyrus's first employee. I was the one who wrote the specification for the Chain. I have thought every day for a year about whether it is right to finish it.",
        "He is not cruel. Do you understand that? He is not angry. He has simply decided that every bad thing that has ever happened to a living creature in this universe happens because that creature can feel. Remove feeling, and suffering ends with it.",
        "I think he is wrong. I think he is beautifully, terribly wrong. But I am going to fight you anyway, because he asked me to, and I have not yet found the moment where I refuse him."
      ]},
      { type: 'battle', trainerName: 'Saturn', trainerTitle: 'Galactic Commander', team: [215, 452, 475, 426, 437], fieldSize: 2, essenceReward: 550 },
      { type: 'dialogue', speaker: 'Saturn', sprite: sp('saturn'), lines: [
        "...That is the moment, then. The one I was waiting for.",
        "Go past me. I am going to shut down the outer ring. I am going to watch my Toxicroak drink water for the first time in a week. I am going to remember what a Pokémon is for.",
        "He is in the inner chamber. He will not shout. He never shouts."
      ]},
      { type: 'dialogue', speaker: 'Cyrus', sprite: sp('cyrus'), lines: [
        "You are the child the Champion brought.",
        "I do not hate you. I do not hate anyone. I spent my childhood watching my parents hate each other across a dinner table, and I decided when I was nine years old that hate is simply a feeling looking for an excuse.",
        "All feelings are. Love, fear, grief, joy — they are excuses the brain invents to justify more of itself. Remove the brain's permission to feel, and you remove everyone's excuse to ruin everything."
      ]},
      { type: 'dialogue', speaker: 'Cyrus', sprite: sp('cyrus'), lines: [
        "Your teacher Cynthia told you the land is held together by thread. I agree with her. I simply think the thread is the source of the knot, not the cure for it.",
        "Dialga, Palkia. Time, space. I will ask them for a world with no thread at all. A clean, quiet sheet. No one will hurt. No one will love. Those are the same word, trainer, spelled in two different fonts.",
        "I realise you will disagree with me. Disagreement is itself a feeling. Show me how much of it you've built — and I will show you how little it was worth."
      ]},
      { type: 'battle', trainerName: 'Cyrus', trainerTitle: 'Galactic Boss', team: [229, 430, 130, 461, 448, 445], fieldSize: 2, essenceReward: 1000 },
      { type: 'dialogue', speaker: 'Cyrus', sprite: sp('cyrus'), lines: [
        "...",
        "My Pokémon are not standing up. They are looking at me. I have never seen them look at me before.",
        "Something in the model is wrong. Perhaps the thread is not the knot. Perhaps it is what keeps the universe from being a knot.",
        "I... require time. I require thought. I require silence, which is the only emotion I was ever willing to admit to. Excuse me."
      ]},
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "...I watched the whole thing on the monitor. I do not think I breathed.",
        "He spoke my words back to me, did you hear it? He took the thread and called it the knot. For a moment I thought — what if he's right? What if I've been teaching this to children for ten years and I've been the fool?",
        "And then your Pokémon stood up. And looked at you. And I knew the answer. I watched it happen, and I knew.",
        "The thread is what keeps the universe from being a knot. He had the geometry inside-out. That is a relief I will be drinking tea about for years."
      ]},
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "Thank you for coming when I called. Very few people would. Fewer would have won.",
        "Go home. Walk the lake road — the Pokémon there will come out to meet you tonight. They felt it too. They always feel it first."
      ]},
    ],
    completionReward: { essence: 2500, pack: 'epic' },
  },
  {
    id: 'team-plasma', title: 'The King and the Harness',
    description: "Ghetsis never stopped speaking for N. Someone has to shut him up.",
    region: 'Unova', difficulty: 'expert', icon: '⚜️', regionLock: 'Unova',
    requires: ['unova-gyms', 'n-styles-revealed'],
    steps: [
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "I would not have come for this if I could have helped it.",
        "You know the other half of my story, trainer. You have seen me at crossroads, at rivers, at the edge of forests where I could hear my Pokémon disagreeing with me. You have been very patient.",
        "There is one person I have not spoken to since I left him. He raised me. He dressed me in a crown I could not see the inside of. He put sages around me like a cage of reasonable men, and he taught me that every sentence I said was also his.",
        "His name is Ghetsis. He is still broadcasting. He still has followers. And there is a cold brain called Colress testing their Pokémon in a lab outside Opelucid, to see if he can make them obey without any of what we used to call bonding. I cannot face any of them on my own. Please."
      ]},
      { type: 'dialogue', speaker: 'Plasma Grunt', sprite: sp('plasmagrunt'), lines: [
        "Halt, trainer! Plasma demands the liberation of all Pokémon!",
        "...also specifically the ones in your pockets. Hand them over and we'll call it liberation."
      ]},
      { type: 'battle', trainerName: 'Plasma Grunt', trainerTitle: 'Team Plasma', team: [519, 506, 551], fieldSize: 2, essenceReward: 200 },
      { type: 'dialogue', speaker: 'Plasma Grunt', sprite: sp('plasmagrunt'), lines: [
        "Tch — fine, keep your stolen friends. The sages will sort you out."
      ]},
      { type: 'dialogue', speaker: 'Zinzolin', sprite: sp('zinzolin'), lines: [
        "So. N's chosen trainer. I have heard the Lord speak of you. He does not like you.",
        "I am one of the seven. I was with him before you were born. I helped write the speeches that raised that boy like a greenhouse flower — tall, beautiful, brittle, and useless outside the glass.",
        "You pulled the glass off him. For that I will not forgive you, and I will not lose."
      ]},
      { type: 'battle', trainerName: 'Zinzolin', trainerTitle: 'Plasma Sage', team: [461, 472, 478, 615], fieldSize: 2, essenceReward: 500 },
      { type: 'dialogue', speaker: 'Zinzolin', sprite: sp('zinzolin'), lines: [
        "...You broke my ice as easily as you broke him. Predictable.",
        "Go. Rood is waiting. He used to be one of us. He is not anymore. Traitor's fate."
      ]},
      { type: 'dialogue', speaker: 'Rood', sprite: sp('rood'), lines: [
        "Trainer — wait. I am not here to stop you.",
        "I was one of the seven sages. I served Ghetsis for thirty-one years. I taught N to read Pokémon-song from the cradle. I also watched the man I trusted turn my student into a puppet and tell him it was a coronation.",
        "I left Plasma two years ago. I took the Pokémon the Lord had forgotten — the ones he called 'symbolic' — and I've been returning them to the wild, one river at a time. That is my penance.",
        "I cannot stop Ghetsis alone. But I can test you. If you still deserve to stand in front of him, my Pokémon will tell you. If you don't — better that you learn it now, from me, than later, from him."
      ]},
      { type: 'battle', trainerName: 'Rood', trainerTitle: 'Defected Sage', team: [553, 536, 563, 601, 611], fieldSize: 2, essenceReward: 600 },
      { type: 'dialogue', speaker: 'Rood', sprite: sp('rood'), lines: [
        "...You deserve to stand in front of him. Go.",
        "One more thing — the cold man, Colress, is not Plasma. Not really. He is a scientist, and his currency is curiosity. He will be in the next chamber. He wishes to compare you with the boy he calls N. Oblige him, or don't. But do not underestimate him — he is the only one in that building who does not lie."
      ]},
      { type: 'dialogue', speaker: 'Colress', sprite: sp('colress'), lines: [
        "Ah! The other trainer. Excellent. Excellent.",
        "I am Colress. I have spent the better part of my career testing the hypothesis that the strength of a Pokémon is precisely equal to the strength of its bond with its trainer, weighted by the trainer's willpower and divided by the number of times the trainer has failed them publicly.",
        "It is a messy equation. Your data, however — your data is remarkable. I have been tracking your battles from the league records. Your team's standard deviation is vanishingly low. That is, forgive me, beautiful.",
        "I don't care about Ghetsis. I care about the graph. Lend me five more points of data, if you would."
      ]},
      { type: 'battle', trainerName: 'Colress', trainerTitle: 'Plasma Scientist', team: [598, 376, 462, 479, 613, 571], fieldSize: 2, essenceReward: 700 },
      { type: 'dialogue', speaker: 'Colress', sprite: sp('colress'), lines: [
        "Ahh. Wonderful. The coefficient is clean. I will be writing about this battle for the next decade.",
        "I owe you a favour. When you open the next door, Ghetsis will attempt to have his Hydreigon hit you before you finish your first sentence. I have subtly unplugged the projector he was going to use to intimidate you. He hates working without his projector. Enjoy."
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "He is on the other side of that door. I can hear him pacing. He paces when the lights go out — he always did.",
        "Trainer. I have to ask you something difficult. I have spent six months watching you build a team that argues with you. Pokémon that refuse moves you pick, that glare at you when you heal them, that love you in spite of you. That is what I always wanted, and never dared to make.",
        "He will tell you the bond is a lie. He will tell you I am his. He will tell you that what you have is a puppet show and he is the only one who ever took off the gloves.",
        "Please — do not listen. He is a very persuasive man. He made a king out of me without my knowing. He will not do that to you. Not today. Go."
      ]},
      { type: 'dialogue', speaker: 'Ghetsis', sprite: sp('ghetsis'), lines: [
        "So. The other child.",
        "N spoke of you on the rare occasions I could force him to speak at all. He spoke with a warmth I had not heard in him before, and it was — I will admit — deeply inconvenient.",
        "You are the reason my kingdom did not happen. I had it all. A boy whose tongue I owned. Seven sages to nod at him. A continent that had forgotten what it was to say no. And then you walked into a forest clearing with a tired Oshawott and you asked him, 'Who are you?' Like it was a thing he was allowed to answer."
      ]},
      { type: 'dialogue', speaker: 'Ghetsis', sprite: sp('ghetsis'), lines: [
        "I am not going to repeat his arguments back to you. I do not agree with them. I never did. Plasma was my instrument; the philosophy was a leash. I used the language of liberation to build the tightest cage anyone in Unova has ever seen, and my boy wore it for ten years and thanked me every morning.",
        "Bonds, trainer, are harnesses. The thing you call love between you and your Pokémon is merely the softest rope ever invented. I know this because I have pulled on it, and it has always come.",
        "Come, then. Pull on yours. Let us see if it snaps cleanly or takes a few tries."
      ]},
      { type: 'battle', trainerName: 'Ghetsis', trainerTitle: 'Team Plasma Lord', team: [635, 626, 563, 537, 625, 604], fieldSize: 2, essenceReward: 1200 },
      { type: 'dialogue', speaker: 'Ghetsis', sprite: sp('ghetsis'), lines: [
        "...",
        "My Hydreigon will not rise. She is looking at me. She has never looked at me before. I have owned her for eleven years.",
        "A harness does not look back at its rider. A harness is a harness. Unless it was something else, the whole time, and I simply failed to notice.",
        "No. No. I refuse this conclusion. I have worked too hard. Take my son if you must — he is already not mine. Take my team. Take my tower. I will not take the thought that I was wrong."
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "He's gone. He walked out of the back door still telling himself he won.",
        "That's alright. People like him always walk out the back door. The front door is where the rest of us say goodnight.",
        "Trainer — I do not think I'm going to cry, and I do not think I'm going to feel proud either, and that's a strange, quiet thing to feel after ten years of being told to feel exactly one way.",
        "Thank you. For the thing that is neither pride nor grief. For the quiet place in the middle, where a boy gets to simply be a person for the first time."
      ]},
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "I watched this one from Sinnoh. Steven was sitting next to me. Neither of us spoke.",
        "You have now closed every loop the last generation of villains left open. Rocket. Aqua. Magma. Galactic. Plasma. Each of them thought they had found the one correct way to hold a Pokémon. Each of them was wrong, and each of them was wrong in a different interesting shape.",
        "What you have, trainer, is the only correct answer. It is: you do not hold them. You stand next to them. You ask them things. They answer. That is enough.",
        "It has always been enough. It was always going to be you who proved it."
      ]},
    ],
    completionReward: { essence: 3000, pack: 'epic' },
  },
  {
    id: 'kanto-e4', title: 'Kanto Elite Four', description: 'Face the strongest trainers in Kanto.',
    region: 'Kanto', difficulty: 'advanced', icon: '⭐', regionLock: 'Kanto',
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
    region: 'Johto', difficulty: 'advanced', icon: '⭐', regionLock: 'Johto',
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
    region: 'Hoenn', difficulty: 'advanced', icon: '⭐', regionLock: 'Hoenn',
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
    region: 'Sinnoh', difficulty: 'advanced', icon: '⭐', regionLock: 'Sinnoh',
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
  {
    id: 'unova-e4', title: 'Unova Elite Four', description: 'Face the strongest trainers in Unova.',
    region: 'Unova', difficulty: 'advanced', icon: '⭐', regionLock: 'Unova',
    requires: ['unova-gyms'],
    steps: [
      { type: 'dialogue', speaker: 'Shauntal', sprite: sp('shauntal'), lines: ["You... are an inspiration for my next novel.", "Let my Ghost-types haunt the page!"] },
      { type: 'battle', trainerName: 'Shauntal', trainerTitle: 'Elite Four', team: [563, 571, 622, 593], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Marshal', sprite: sp('marshal'), lines: ["Hyaaaah!", "I'll show you the strength of a true martial artist!"] },
      { type: 'battle', trainerName: 'Marshal', trainerTitle: 'Elite Four', team: [538, 539, 619, 534], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Grimsley', sprite: sp('grimsley'), lines: ["Life is a serious game of chance.", "Care to wager on this match?"] },
      { type: 'battle', trainerName: 'Grimsley', trainerTitle: 'Elite Four', team: [510, 552, 625, 461], fieldSize: 2, essenceReward: 300 },
      { type: 'dialogue', speaker: 'Caitlin', sprite: sp('caitlin'), lines: ["I have awakened from my slumber for you.", "Show me a battle worth the dream."] },
      { type: 'battle', trainerName: 'Caitlin', trainerTitle: 'Elite Four', team: [579, 518, 561, 576], fieldSize: 2, essenceReward: 400 },
      { type: 'dialogue', speaker: 'Alder', sprite: sp('alder'), lines: ["Hahaha! What an incredible run!", "I am Alder, the Champion of Unova. Let's enjoy this!"] },
      { type: 'battle', trainerName: 'Alder', trainerTitle: 'Champion', team: [637, 631, 615, 553, 612, 596], fieldSize: 3, essenceReward: 500 },
      { type: 'dialogue', speaker: 'Alder', sprite: sp('alder'), lines: ["A truly fiery battle!", "You are now the Champion of Unova. Wear the title with pride."] },
    ],
    completionReward: { essence: 3000, pack: 'epic' },
  },
  {
    id: 'red-challenge', title: 'The Red Challenge', description: 'Face the legendary trainer atop Mt. Silver.',
    region: 'Kanto', difficulty: 'expert', icon: '🏔️', regionLock: 'Kanto',
    requires: ['kanto-e4'],
    steps: [
      { type: 'dialogue', speaker: 'Blue', sprite: sp('blue'), lines: ["You've beaten the Elite Four in two regions...", "But Red is on another level.", "He doesn't speak. He just battles."] },
      { type: 'battle', trainerName: 'Red', trainerTitle: 'Pokémon Master', team: [25, 143, 131, 3, 6, 9], fieldSize: 3, essenceReward: 1000 },
      { type: 'dialogue', speaker: 'Red', sprite: sp('red'), lines: ["..."] },
    ],
    completionReward: { essence: 5000, pack: 'legendary' },
  },
  {
    id: 'cynthia-rematch', title: "Cynthia's Rematch", description: 'The Sinnoh Champion seeks a worthy challenger.',
    region: 'Sinnoh', difficulty: 'expert', icon: '🌟', regionLock: 'Sinnoh',
    requires: ['sinnoh-e4'],
    steps: [
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: ["I've been training since our last battle.", "No holding back this time."] },
      { type: 'battle', trainerName: 'Cynthia', trainerTitle: 'Champion', team: [445, 448, 442, 350, 407, 468], fieldSize: 3, essenceReward: 1000 },
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: ["Magnificent... You truly are the strongest trainer I've ever faced."] },
    ],
    completionReward: { essence: 5000, pack: 'epic' },
  },
  {
    id: 'n-finale', title: 'The King of Truths and Ideals',
    description: 'N has called the old gods. One last conversation — three of them, really.',
    region: 'Unova', difficulty: 'expert', icon: '👑',
    requires: ['kanto-e4', 'johto-e4', 'hoenn-e4', 'sinnoh-e4', 'unova-e4'], requiresCount: 1,
    steps: [
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "You came. I hoped you would.",
        "Do you remember what I told you, at the beginning? About the thread — the little line of feeling spun between a trainer and a Pokémon with every shared moment?",
        "Yours has become a rope. Thicker than anything the world has seen in a very long time. And he has noticed.",
        "N has spent all these months traveling behind you, listening. And somewhere out there, the oldest Pokémon in the world — the ones who are the thread itself — have started to answer him back.",
        "He is waiting up the path. I won't pretend this is just another battle. Go carefully.",
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "You came. Thank you.",
        "I've been watching you from the edge of every town, every gym, every league. I've heard your Pokémon grow louder, happier, prouder. I've heard them love you.",
        "And still, I am not sure. Not yet. Because I have also heard — in older voices, in voices that were singing before the first human spoke — questions that no one alive has answered. I will ask them through three battles. Three questions, three teams. If you can hold your thread against all three, I will believe what I want to believe.",
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "The first question — the simplest one. Is what you feel real, or is it only what you've trained them to feel? My partner will ask it for me. Don't be afraid.",
      ]},
      { type: 'battle', trainerName: 'N', trainerTitle: 'Seeker of Truth', team: [643, 571, 567, 601, 584, 625], fieldSize: 3, essenceReward: 1500 },
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "...One truth is not enough. A trained ear can mistake a good mimic for a real voice.",
        "The second question, then. The world you dream of sharing with them — would they choose it, if they could speak? Show me what you would want them to want.",
      ]},
      { type: 'battle', trainerName: 'N', trainerTitle: 'Keeper of Ideals', team: [644, 635, 637, 612, 579, 526], fieldSize: 3, essenceReward: 1500 },
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "...I think I'm smiling. I didn't expect to.",
        "One last question. The oldest one. Neither of us has an answer to it — but I want to see what happens when we ask together. If the thread could be cut, and your Pokémon chose to stay anyway — would they?",
        "Kyurem is the silence your thread is stretched across. The kami have come because the sky is listening. Fight me one more time.",
      ]},
      { type: 'battle', trainerName: 'N', trainerTitle: 'At the Crossroads', team: [646, 641, 642, 645, 638, 640], fieldSize: 3, essenceReward: 2000 },
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "...It held. Even against Kyurem, it held.",
        "They stayed with you. Not because you commanded them to. Because they chose to. That is what I needed to know. That is the only answer I ever wanted. Thank you, trainer. Truly.",
      ]},
      { type: 'dialogue', speaker: 'N', sprite: sp('n'), lines: [
        "I'm going to release them back to the wind and the storm and the deep places they came from. They shouldn't belong to anyone — least of all me.",
        "And then I'm going somewhere quiet. I want to listen again, properly, without questions in my head for once. If you ever hear a small voice you don't recognize, on the road or in a dream — it might be one of mine, passing through. Say hello for me.",
      ]},
      { type: 'dialogue', speaker: 'Cynthia', sprite: sp('cynthia'), lines: [
        "I felt it from the crossroads. The whole sky did.",
        "You held the thread against the silence itself. Do you understand what that means?",
        "It means the world is a little more woven today than it was yesterday. Because of you. Because of them.",
        "Thank you for taking the long walk. Now — go wherever you'd like to go next. The path is yours.",
      ]},
      { type: 'info', infoTitle: 'The Thread, Unbroken', infoIcon: '🪢', lines: [
        "You've reached the end of the story.",
        "Everything after this — every battle, every pack, every quiet walk — is yours to weave.",
      ]},
    ],
    completionReward: { essence: 10000, pack: 'legendary' },
  },
];

export const STORYLINES_BY_ID: Record<string, Storyline> = Object.fromEntries(
  STORYLINES.map((s) => [s.id, s])
);

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  beginner: 0, intermediate: 1, advanced: 2, expert: 3,
};
