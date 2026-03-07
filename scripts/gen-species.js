const { SPECIES } = require('../damage-calc/calc/dist/data/species.js');
const fs = require('fs');
const path = require('path');

const gen4 = SPECIES[4];

const names = [
  'Caterpie','Metapod','Butterfree','Weedle','Kakuna','Beedrill',
  'Pidgey','Pidgeotto','Pidgeot','Rattata','Raticate','Spearow','Fearow',
  'Zubat','Golbat','Bulbasaur','Ivysaur','Venusaur','Charmander','Charmeleon',
  'Charizard','Squirtle','Wartortle','Blastoise','Pikachu','Raichu',
  'Abra','Kadabra','Alakazam','Machop','Machoke','Machamp',
  'Gastly','Haunter','Gengar','Dratini','Dragonair','Dragonite',
  'Larvitar','Pupitar','Tyranitar','Bagon','Shelgon','Salamence',
  'Beldum','Metang','Metagross','Snorlax','Lapras','Gyarados',
  'Lotad','Lombre','Ludicolo','Exeggcute','Exeggutor',
];

let out = '// Auto-generated from damage-calc Gen 4 species data\n';
out += '// Regenerate with: node scripts/gen-species.js\n\n';
out += 'export const SPECIES_DATA: Record<string, {\n';
out += '  types: string[];\n';
out += '  bs: { hp: number; at: number; df: number; sa: number; sd: number; sp: number };\n';
out += '}> = {\n';

for (const name of names) {
  const s = gen4[name];
  if (!s) { console.error('Missing:', name); continue; }
  const types = JSON.stringify(s.types);
  out += `  ${name}: { types: ${types}, bs: { hp: ${s.bs.hp}, at: ${s.bs.at}, df: ${s.bs.df}, sa: ${s.bs.sa||0}, sd: ${s.bs.sd||0}, sp: ${s.bs.sp} } },\n`;
}

out += '};\n';

fs.writeFileSync(path.join(__dirname, '../shared/species-data.ts'), out);
console.log('Generated shared/species-data.ts');
