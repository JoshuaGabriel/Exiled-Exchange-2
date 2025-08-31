export interface CategoryEntry {
  type: string;
  text?: string;
  name?: string;
  flags?: {
    unique?: boolean;
  };
}

export interface CategoryGroup {
  id: string;
  label: string;
  entries: CategoryEntry[];
}

export const POE2_CATEGORIES: CategoryGroup[] = [
  {
    "id": "accessory",
    "label": "Accessories",
    "entries": [
      {"type": "Crimson Amulet"},
      {"type": "Gold Amulet"},
      {"type": "Pearlescent Amulet"},
      {"type": "Azure Amulet"},
      {"type": "Amber Amulet"},
      {"type": "Jade Amulet"},
      {"type": "Lapis Amulet"},
      {"type": "Lunar Amulet"},
      {"type": "Bloodstone Amulet"},
      {"type": "Stellar Amulet"},
      {"type": "Solar Amulet"},
      {"type": "Dusk Amulet"},
      {"type": "Gloam Amulet"},
      {"type": "Penumbra Amulet"},
      {"type": "Tenebrous Amulet"},
      {"type": "Rawhide Belt"},
      {"type": "Utility Belt"},
      {"type": "Fine Belt"},
      {"type": "Linen Belt"},
      {"type": "Wide Belt"},
      {"type": "Long Belt"},
      {"type": "Plate Belt"},
      {"type": "Ornate Belt"},
      {"type": "Mail Belt"},
      {"type": "Double Belt"},
      {"type": "Heavy Belt"},
      {"type": "Iron Ring"},
      {"type": "Gold Ring"},
      {"type": "Unset Ring"},
      {"type": "Abyssal Signet"},
      {"type": "Lazuli Ring"},
      {"type": "Ruby Ring"},
      {"type": "Sapphire Ring"},
      {"type": "Topaz Ring"},
      {"type": "Amethyst Ring"},
      {"type": "Emerald Ring"},
      {"type": "Pearl Ring"},
      {"type": "Prismatic Ring"},
      {"type": "Ring"},
      {"type": "Breach Ring"},
      {"type": "Dusk Ring"},
      {"type": "Gloam Ring"},
      {"type": "Penumbra Ring"},
      {"type": "Tenebrous Ring"}
    ]
  },
  {
    "id": "weapon",
    "label": "Weapons",
    "entries": [
      {"type": "Crossbow"},
      {"type": "Quarterstaff"},
      {"type": "Spear"},
      {"type": "Sceptre"},
      {"type": "Mace"},
      {"type": "Bow"},
      {"type": "Wand"},
      {"type": "Sword"},
      {"type": "Dagger"},
      {"type": "Axe"},
      {"type": "Claw"},
      {"type": "Flail"},
      {"type": "Focus"}
    ]
  },
  {
    "id": "armour",
    "label": "Armour",
    "entries": [
      {"type": "Helmet"},
      {"type": "Body Armour"},
      {"type": "Gloves"},
      {"type": "Boots"},
      {"type": "Shield"}
    ]
  },
  {
    "id": "gem",
    "label": "Gems",
    "entries": [
      {"type": "Skill Gem"},
      {"type": "Support Gem"},
      {"type": "Spirit Gem"}
    ]
  },
  {
    "id": "flask",
    "label": "Flasks",
    "entries": [
      {"type": "Life Flask"},
      {"type": "Mana Flask"},
      {"type": "Utility Flask"}
    ]
  },
  {
    "id": "currency",
    "label": "Currency",
    "entries": [
      {"type": "Currency"}
    ]
  },
  {
    "id": "map",
    "label": "Maps",
    "entries": [
      {"type": "Map"}
    ]
  },
  {
    "id": "jewel",
    "label": "Jewels",
    "entries": [
      {"type": "Jewel"}
    ]
  }
];

export const ITEM_TYPE_TO_CATEGORY: { [key: string]: string } = {
  // Accessories
  'Crimson Amulet': 'accessory',
  'Gold Amulet': 'accessory',
  'Pearlescent Amulet': 'accessory',
  'Azure Amulet': 'accessory',
  'Amber Amulet': 'accessory',
  'Jade Amulet': 'accessory',
  'Lapis Amulet': 'accessory',
  'Lunar Amulet': 'accessory',
  'Bloodstone Amulet': 'accessory',
  'Stellar Amulet': 'accessory',
  'Solar Amulet': 'accessory',
  'Dusk Amulet': 'accessory',
  'Gloam Amulet': 'accessory',
  'Penumbra Amulet': 'accessory',
  'Tenebrous Amulet': 'accessory',
  'Rawhide Belt': 'accessory',
  'Utility Belt': 'accessory',
  'Fine Belt': 'accessory',
  'Linen Belt': 'accessory',
  'Wide Belt': 'accessory',
  'Long Belt': 'accessory',
  'Plate Belt': 'accessory',
  'Ornate Belt': 'accessory',
  'Mail Belt': 'accessory',
  'Double Belt': 'accessory',
  'Heavy Belt': 'accessory',
  'Iron Ring': 'accessory',
  'Gold Ring': 'accessory',
  'Unset Ring': 'accessory',
  'Abyssal Signet': 'accessory',
  'Lazuli Ring': 'accessory',
  'Ruby Ring': 'accessory',
  'Sapphire Ring': 'accessory',
  'Topaz Ring': 'accessory',
  'Amethyst Ring': 'accessory',
  'Emerald Ring': 'accessory',
  'Pearl Ring': 'accessory',
  'Prismatic Ring': 'accessory',
  'Ring': 'accessory',
  'Breach Ring': 'accessory',
  'Dusk Ring': 'accessory',
  'Gloam Ring': 'accessory',
  'Penumbra Ring': 'accessory',
  'Tenebrous Ring': 'accessory',
  
  // Weapons
  'Crossbow': 'weapon',
  'Quarterstaff': 'weapon',
  'Spear': 'weapon',
  'Sceptre': 'weapon',
  'Mace': 'weapon',
  'Bow': 'weapon',
  'Wand': 'weapon',
  'Sword': 'weapon',
  'Dagger': 'weapon',
  'Axe': 'weapon',
  'Claw': 'weapon',
  'Flail': 'weapon',
  'Focus': 'weapon',
  
  // Armour
  'Helmet': 'armour',
  'Body Armour': 'armour',
  'Gloves': 'armour',
  'Boots': 'armour',
  'Shield': 'armour',
  
  // Gems
  'Skill Gem': 'gem',
  'Support Gem': 'gem',
  'Spirit Gem': 'gem',
  
  // Flasks
  'Life Flask': 'flask',
  'Mana Flask': 'flask',
  'Utility Flask': 'flask',
  
  // Other
  'Currency': 'currency',
  'Map': 'map',
  'Jewel': 'jewel'
};

export const CATEGORY_FILTERS = {
  accessory: { category: { option: 'accessory' } },
  weapon: { category: { option: 'weapon' } },
  armour: { category: { option: 'armour' } },
  gem: { category: { option: 'gem' } },
  flask: { category: { option: 'flask' } },
  currency: { category: { option: 'currency' } },
  map: { category: { option: 'map' } },
  jewel: { category: { option: 'jewel' } }
};