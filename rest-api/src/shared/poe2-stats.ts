export interface StatEntry {
  id: string;
  text: string;
  type: string;
}

export interface StatGroup {
  id: string;
  label: string;
  entries: StatEntry[];
}

export const POE2_STATS: StatGroup[] = [
  {
    "id": "explicit",
    "label": "Explicit",
    "entries": [
      {"id": "explicit.stat_1050105434", "text": "# to maximum Mana", "type": "explicit"},
      {"id": "explicit.stat_3299347043", "text": "# to maximum Life", "type": "explicit"},
      {"id": "explicit.stat_4220027924", "text": "#% to Cold Resistance", "type": "explicit"},
      {"id": "explicit.stat_1671376347", "text": "#% to Lightning Resistance", "type": "explicit"},
      {"id": "explicit.stat_3372524247", "text": "#% to Fire Resistance", "type": "explicit"},
      {"id": "explicit.stat_328541901", "text": "# to Intelligence", "type": "explicit"},
      {"id": "explicit.stat_3917489142", "text": "#% increased Rarity of Items found", "type": "explicit"},
      {"id": "explicit.stat_3261801346", "text": "# to Dexterity", "type": "explicit"},
      {"id": "explicit.stat_4080418644", "text": "# to Strength", "type": "explicit"},
      {"id": "explicit.stat_3325883026", "text": "# Life Regeneration per second", "type": "explicit"},
      {"id": "explicit.stat_789117908", "text": "#% increased Mana Regeneration Rate", "type": "explicit"},
      {"id": "explicit.stat_803737631", "text": "# to Accuracy Rating", "type": "explicit"},
      {"id": "explicit.stat_2974417149", "text": "#% increased Spell Damage", "type": "explicit"},
      {"id": "explicit.stat_4052037485", "text": "# to maximum Energy Shield (Local)", "type": "explicit"},
      {"id": "explicit.stat_4015621042", "text": "#% increased Energy Shield", "type": "explicit"},
      {"id": "explicit.stat_3032590688", "text": "Adds # to # Physical Damage to Attacks", "type": "explicit"},
      {"id": "explicit.stat_2891184298", "text": "#% increased Cast Speed", "type": "explicit"},
      {"id": "explicit.stat_1368271171", "text": "Gain # Mana per Enemy Killed", "type": "explicit"},
      {"id": "explicit.stat_3695891184", "text": "Gain # Life per Enemy Killed", "type": "explicit"},
      {"id": "explicit.stat_915769802", "text": "# to Stun Threshold", "type": "explicit"},
      {"id": "explicit.stat_3639275092", "text": "#% increased Attribute Requirements", "type": "explicit"},
      {"id": "explicit.stat_2901986750", "text": "#% to all Elemental Resistances", "type": "explicit"},
      {"id": "explicit.stat_1509134228", "text": "#% increased Attack Speed", "type": "explicit"},
      {"id": "explicit.stat_681332047", "text": "Adds # to # Lightning Damage to Attacks", "type": "explicit"},
      {"id": "explicit.stat_1334060246", "text": "Adds # to # Cold Damage to Attacks", "type": "explicit"},
      {"id": "explicit.stat_321077055", "text": "Adds # to # Fire Damage to Attacks", "type": "explicit"},
      {"id": "explicit.stat_3141070085", "text": "#% increased Movement Speed", "type": "explicit"},
      {"id": "explicit.stat_3484657501", "text": "#% increased Global Critical Strike Multiplier", "type": "explicit"},
      {"id": "explicit.stat_587431675", "text": "#% increased Global Critical Strike Chance", "type": "explicit"}
    ]
  },
  {
    "id": "pseudo",
    "label": "Pseudo",
    "entries": [
      {"id": "pseudo.pseudo_total_life", "text": "+# total maximum Life", "type": "pseudo"},
      {"id": "pseudo.pseudo_total_mana", "text": "+# total maximum Mana", "type": "pseudo"},
      {"id": "pseudo.pseudo_total_energy_shield", "text": "+# total maximum Energy Shield", "type": "pseudo"},
      {"id": "pseudo.pseudo_total_resistances", "text": "+#% total Resistances", "type": "pseudo"},
      {"id": "pseudo.pseudo_total_elemental_resistance", "text": "+#% total Elemental Resistances", "type": "pseudo"},
      {"id": "pseudo.pseudo_increased_elemental_damage_with_attacks", "text": "#% increased Elemental Damage with Attacks", "type": "pseudo"},
      {"id": "pseudo.pseudo_increased_physical_damage", "text": "#% increased Physical Damage", "type": "pseudo"},
      {"id": "pseudo.pseudo_adds_elemental_damage", "text": "Adds # to # Elemental Damage to Attacks", "type": "pseudo"},
      {"id": "pseudo.pseudo_total_attack_speed", "text": "#% increased Attack Speed", "type": "pseudo"},
      {"id": "pseudo.pseudo_total_cast_speed", "text": "#% increased Cast Speed", "type": "pseudo"}
    ]
  },
  {
    "id": "implicit",
    "label": "Implicit",
    "entries": [
      {"id": "implicit.stat_3299347043", "text": "# to maximum Life", "type": "implicit"},
      {"id": "implicit.stat_1050105434", "text": "# to maximum Mana", "type": "implicit"},
      {"id": "implicit.stat_4015621042", "text": "#% increased Energy Shield", "type": "implicit"}
    ]
  },
  {
    "id": "enchant",
    "label": "Enchant",
    "entries": [
      {"id": "enchant.stat_2954116742", "text": "#% increased Spell Damage", "type": "enchant"},
      {"id": "enchant.stat_210067635", "text": "#% increased Attack Speed", "type": "enchant"}
    ]
  }
];

// Common stat mappings for easy lookup
export const STAT_MAPPINGS = {
  // Life & Mana
  life: "explicit.stat_3299347043",
  mana: "explicit.stat_1050105434",
  energyShield: "explicit.stat_4015621042",
  lifeRegen: "explicit.stat_3325883026",
  manaRegen: "explicit.stat_789117908",
  
  // Resistances
  fireRes: "explicit.stat_3372524247",
  coldRes: "explicit.stat_4220027924",
  lightningRes: "explicit.stat_1671376347",
  allRes: "explicit.stat_2901986750",
  
  // Attributes
  strength: "explicit.stat_4080418644",
  dexterity: "explicit.stat_3261801346",
  intelligence: "explicit.stat_328541901",
  
  // Damage
  physicalDamage: "explicit.stat_3032590688",
  fireDamage: "explicit.stat_321077055",
  coldDamage: "explicit.stat_1334060246",
  lightningDamage: "explicit.stat_681332047",
  spellDamage: "explicit.stat_2974417149",
  
  // Speed & Critical
  attackSpeed: "explicit.stat_1509134228",
  castSpeed: "explicit.stat_2891184298",
  movementSpeed: "explicit.stat_3141070085",
  critChance: "explicit.stat_587431675",
  critMulti: "explicit.stat_3484657501",
  
  // Other
  accuracy: "explicit.stat_803737631",
  stunThreshold: "explicit.stat_915769802",
  itemRarity: "explicit.stat_3917489142",
  
  // Pseudo stats
  totalLife: "pseudo.pseudo_total_life",
  totalMana: "pseudo.pseudo_total_mana",
  totalES: "pseudo.pseudo_total_energy_shield",
  totalRes: "pseudo.pseudo_total_resistances"
};

export function getStatFilter(statId: string, min?: number, max?: number) {
  return {
    id: statId,
    value: {
      min: min,
      max: max
    }
  };
}

export function createStatFilters(stats: { [key: string]: { min?: number, max?: number } }) {
  return Object.entries(stats).map(([statKey, values]) => {
    const statId = STAT_MAPPINGS[statKey as keyof typeof STAT_MAPPINGS];
    if (!statId) {
      throw new Error(`Unknown stat key: ${statKey}`);
    }
    return getStatFilter(statId, values.min, values.max);
  });
}