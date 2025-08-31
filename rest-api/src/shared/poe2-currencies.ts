export interface CurrencyEntry {
  id: string;
  text: string;
  image?: string;
}

export interface CurrencyGroup {
  id: string;
  label: string;
  entries: CurrencyEntry[];
}

export const POE2_CURRENCIES: CurrencyGroup[] = [
  {
    "id": "Currency",
    "label": "Currency",
    "entries": [
      {"id": "sep", "text": "Currency"},
      {"id": "wisdom", "text": "Scroll of Wisdom", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lJZGVudGlmaWNhdGlvbiIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/884f7bc58b/CurrencyIdentification.png"},
      {"id": "transmute", "text": "Orb of Transmutation", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lVcGdyYWRlVG9NYWdpYyIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/2f8e1ff9f8/CurrencyUpgradeToMagic.png"},
      {"id": "greater-orb-of-transmutation", "text": "Greater Orb of Transmutation"},
      {"id": "perfect-orb-of-transmutation", "text": "Perfect Orb of Transmutation"},
      {"id": "aug", "text": "Orb of Augmentation", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lBZGRNb2RUb01hZ2ljIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/c8ad0ddc84/CurrencyAddModToMagic.png"},
      {"id": "greater-orb-of-augmentation", "text": "Greater Orb of Augmentation"},
      {"id": "perfect-orb-of-augmentation", "text": "Perfect Orb of Augmentation"},
      {"id": "chance", "text": "Orb of Chance", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lVcGdyYWRlVG9VbmlxdWUiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/93c6cc8d5b/CurrencyUpgradeToUnique.png"},
      {"id": "alch", "text": "Orb of Alchemy", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lVcGdyYWRlVG9SYXJlIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/d8fa1ad7d1/CurrencyUpgradeToRare.png"},
      {"id": "greater-orb-of-alchemy", "text": "Greater Orb of Alchemy"},
      {"id": "perfect-orb-of-alchemy", "text": "Perfect Orb of Alchemy"},
      {"id": "chaos", "text": "Chaos Orb", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/4b3a3ad1bd/CurrencyRerollRare.png"},
      {"id": "regal", "text": "Regal Orb", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lVcGdyYWRlTWFnaWNUb1JhcmUiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/c61d1e4f54/CurrencyUpgradeMagicToRare.png"},
      {"id": "exalted", "text": "Exalted Orb", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lBZGRNb2RUb1JhcmUiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/f5c6bb7458/CurrencyAddModToRare.png"},
      {"id": "divine", "text": "Divine Orb", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/ca9bc756bc/CurrencyModValues.png"},
      {"id": "annul", "text": "Orb of Annulment", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZW1vdmVNb2QiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/9b5ded49c7/CurrencyRemoveMod.png"},
      {"id": "vaal", "text": "Vaal Orb", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lWYWFsIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/1bb8bd5e2c/CurrencyVaal.png"},
      {"id": "mirror", "text": "Mirror of Kalandra", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lEdXBsaWNhdGUiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/0b7eccd5cf/CurrencyDuplicate.png"},
      {"id": "ancient-exalted", "text": "Ancient Exalted Orb"},
      {"id": "ancient-chaos", "text": "Ancient Chaos Orb"},
      {"id": "ancient-regal", "text": "Ancient Regal Orb"},
      {"id": "chromatic", "text": "Chromatic Orb", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxTb2NrZXRDb2xvdXJzIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/cfb04d8ab7/CurrencyRerollSocketColours.png"},
      {"id": "jewellers", "text": "Jeweller's Orb", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxTb2NrZXROdW1iZXJzIiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/e6e88cb13e/CurrencyRerollSocketNumbers.png"},
      {"id": "fusing", "text": "Orb of Fusing", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxTb2NrZXRMaW5rcyIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/b98077eba6/CurrencyRerollSocketLinks.png"},
      {"id": "blessed", "text": "Blessed Orb", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lJbXBsaWNpdE1vZFZhbHVlcyIsInNjYWxlIjoxLCJyZWFsbSI6InBvZTIifV0/e07b2e6a98/CurrencyImplicitModValues.png"},
      {"id": "gcp", "text": "Gemcutter's Prism", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lHZW1RdWFsaXR5Iiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/c8f9063c22/CurrencyGemQuality.png"},
      {"id": "armourer", "text": "Armourer's Scrap", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lBcm1vdXJRdWFsaXR5Iiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/79c65b0b8c/CurrencyArmourQuality.png"},
      {"id": "blacksmith", "text": "Blacksmith's Whetstone", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lXZWFwb25RdWFsaXR5Iiwic2NhbGUiOjEsInJlYWxtIjoicG9lMiJ9XQ/e6b43fda3e/CurrencyWeaponQuality.png"},
      {"id": "portal", "text": "Portal Scroll", "image": "/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lQb3J0YWwiLCJzY2FsZSI6MSwicmVhbG0iOiJwb2UyIn1d/dc1a64f6e7/CurrencyPortal.png"}
    ]
  }
];

export const CURRENCY_MAPPINGS = {
  wisdom: "wisdom",
  transmute: "transmute",
  aug: "aug", 
  chance: "chance",
  alch: "alch",
  chaos: "chaos",
  regal: "regal",
  exalted: "exalted",
  divine: "divine",
  annul: "annul",
  vaal: "vaal",
  mirror: "mirror",
  chromatic: "chromatic",
  jewellers: "jewellers",
  fusing: "fusing",
  blessed: "blessed",
  gcp: "gcp",
  armourer: "armourer",
  blacksmith: "blacksmith",
  portal: "portal"
};

export const CURRENCY_VALUES = {
  // Base currencies (in chaos orb equivalents, approximate)
  wisdom: 0.001,
  transmute: 0.01,
  aug: 0.02,
  chance: 0.1,
  alch: 0.3,
  chaos: 1,
  regal: 2,
  exalted: 50,
  divine: 200,
  annul: 30,
  vaal: 5,
  mirror: 50000,
  chromatic: 0.05,
  jewellers: 0.1,
  fusing: 0.5,
  blessed: 0.8,
  gcp: 0.5,
  armourer: 0.02,
  blacksmith: 0.02,
  portal: 0.005
};