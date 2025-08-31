import { err, ok, Result } from "neverthrow";
import { ParseItemRequest, ApiErrorCode } from "../types/api";
import { POE2_CATEGORIES, ITEM_TYPE_TO_CATEGORY } from "../shared/poe2-categories";
import { STAT_MAPPINGS } from "../shared/poe2-stats";

// Enhanced ParsedItem interface for comprehensive PoE2 support
export interface ParsedItem {
  name: string;
  baseType?: string;
  rarity?: string;
  itemLevel?: number;
  isCorrupted: boolean;
  category?: string;
  rawText: string;
  
  // Enhanced PoE2 properties
  quality?: number;
  gemLevel?: number;
  stackSize?: { value: number; max: number };
  mapTier?: number;
  
  // Weapon properties
  weaponPhysicalDamage?: { min: number; max: number };
  weaponElementalDamage?: { min: number; max: number };
  weaponCritChance?: number;
  weaponAttackSpeed?: number;
  weaponRange?: number;
  
  // Armour properties  
  armourAR?: number;
  armourEV?: number;
  armourES?: number;
  armourBLOCK?: number;
  
  // Sockets and links
  sockets?: {
    total: number;
    linked?: number;
    red?: number;
    green?: number;
    blue?: number;
    white?: number;
  };
  
  // Requirements
  requirements?: {
    level?: number;
    strength?: number;
    dexterity?: number;
    intelligence?: number;
  };
  
  // Stats/Modifiers
  stats?: {
    explicit: Array<{ id: string; text: string; values?: number[] }>;
    implicit: Array<{ id: string; text: string; values?: number[] }>;
    enchant: Array<{ id: string; text: string; values?: number[] }>;
    pseudo: Array<{ id: string; text: string; values?: number[] }>;
  };
  
  // Influences and special properties
  influences?: string[];
  isIdentified?: boolean;
  isUnique?: boolean;
  isMirrored?: boolean;
  isFractured?: boolean;
  isSynthesised?: boolean;
  isVeiled?: boolean;
  
  // Flask properties
  flaskCharges?: { current: number; max: number };
  flaskDuration?: number;
}

export class ItemService {
  /**
   * Parse item text into structured ParsedItem
   */
  static parseItem(request: ParseItemRequest): Result<ParsedItem, string> {
    try {
      if (!request.itemText || request.itemText.trim().length === 0) {
        return err("Item text is required");
      }

      // Clean the item text before parsing
      const cleanedText = this.cleanItemText(request.itemText);
      
      // For now, use our basic parser until the shared parser integration is complete
      const parsedItem = this.basicParse(cleanedText);
      
      if (!parsedItem) {
        return err("Failed to parse item text");
      }

      return ok(parsedItem);
    } catch (error) {
      console.error("ItemService.parseItem error:", error);
      return err("Failed to parse item text");
    }
  }

  /**
   * Validate that item text looks like a valid Path of Exile item
   */
  static validateItemText(itemText: string): boolean {
    if (!itemText || itemText.trim().length === 0) {
      return false;
    }

    // Basic validation - should contain sections separated by dashes
    const sections = itemText.split(/\r?\n--------\r?\n/);
    
    // Should have at least 2 sections (header + at least one property section)
    return sections.length >= 2;
  }

  /**
   * Clean item text from potential formatting issues
   */
  static cleanItemText(itemText: string): string {
    return itemText
      .trim()
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines
  }

  /**
   * Enhanced PoE2 item parser with comprehensive support
   */
  private static basicParse(itemText: string): ParsedItem | null {
    const lines = itemText.split('\n');
    const sections = itemText.split('--------');
    
    if (sections.length < 2) {
      return null;
    }

    // Parse header section
    const headerLines = sections[0].trim().split('\n');
    let name = '';
    let baseType = '';
    let rarity = '';
    let itemClass = '';

    for (let i = 0; i < headerLines.length; i++) {
      const line = headerLines[i].trim();
      if (line.startsWith('Item Class: ')) {
        itemClass = line.substring(12);
      } else if (line.startsWith('Rarity: ')) {
        rarity = line.substring(8);
      } else if (line && !line.startsWith('Item Class:') && !line.startsWith('Rarity:')) {
        if (!name) {
          name = line;
        } else if (!baseType) {
          baseType = line;
        }
      }
    }

    // Initialize parsed item
    const parsedItem: ParsedItem = {
      name: name || 'Unknown Item',
      baseType,
      rarity,
      isCorrupted: itemText.includes('Corrupted'),
      rawText: itemText,
      stats: {
        explicit: [],
        implicit: [],
        enchant: [],
        pseudo: []
      }
    };

    // Parse item level
    for (const section of sections) {
      const match = section.match(/Item Level: (\d+)/);
      if (match) {
        parsedItem.itemLevel = parseInt(match[1], 10);
        break;
      }
    }

    // Parse quality
    const qualityMatch = itemText.match(/Quality: \+?(\d+)%/);
    if (qualityMatch) {
      parsedItem.quality = parseInt(qualityMatch[1], 10);
    }

    // Parse gem level
    const gemLevelMatch = itemText.match(/Level: (\d+)/);
    if (gemLevelMatch && itemClass === 'Gem') {
      parsedItem.gemLevel = parseInt(gemLevelMatch[1], 10);
    }

    // Parse stack size
    const stackMatch = itemText.match(/Stack Size: ([\d,]+)\/([\d,]+)/);
    if (stackMatch) {
      parsedItem.stackSize = {
        value: parseInt(stackMatch[1].replace(/,/g, ''), 10),
        max: parseInt(stackMatch[2].replace(/,/g, ''), 10)
      };
    }

    // Parse map tier
    const mapTierMatch = itemText.match(/Map Tier: (\d+)/);
    if (mapTierMatch) {
      parsedItem.mapTier = parseInt(mapTierMatch[1], 10);
    }

    // Parse weapon properties
    this.parseWeaponProperties(itemText, parsedItem);
    
    // Parse armour properties
    this.parseArmourProperties(itemText, parsedItem);
    
    // Parse sockets
    this.parseSockets(itemText, parsedItem);
    
    // Parse requirements
    this.parseRequirements(itemText, parsedItem);
    
    // Parse modifiers/stats
    this.parseModifiers(sections, parsedItem);

    // Determine category
    parsedItem.category = this.determineCategory(itemClass, baseType, name, rarity);

    // Set additional flags
    parsedItem.isIdentified = !itemText.includes('Unidentified');
    parsedItem.isUnique = rarity === 'Unique';
    parsedItem.isMirrored = itemText.includes('Mirrored');
    parsedItem.isFractured = itemText.includes('Fractured');
    parsedItem.isSynthesised = itemText.includes('Synthesised');
    parsedItem.isVeiled = itemText.includes('Veiled');

    return parsedItem;
  }

  private static parseWeaponProperties(itemText: string, item: ParsedItem): void {
    // Physical damage
    const physDamageMatch = itemText.match(/Physical Damage: (\d+)-(\d+)/);
    if (physDamageMatch) {
      item.weaponPhysicalDamage = {
        min: parseInt(physDamageMatch[1], 10),
        max: parseInt(physDamageMatch[2], 10)
      };
    }

    // Elemental damage (combined)
    const eleDamageMatch = itemText.match(/Elemental Damage: (\d+)-(\d+)/);
    if (eleDamageMatch) {
      item.weaponElementalDamage = {
        min: parseInt(eleDamageMatch[1], 10),
        max: parseInt(eleDamageMatch[2], 10)
      };
    }

    // Critical strike chance
    const critMatch = itemText.match(/Critical Strike Chance: ([\d.]+)%/);
    if (critMatch) {
      item.weaponCritChance = parseFloat(critMatch[1]);
    }

    // Attack speed
    const attackSpeedMatch = itemText.match(/Attacks per Second: ([\d.]+)/);
    if (attackSpeedMatch) {
      item.weaponAttackSpeed = parseFloat(attackSpeedMatch[1]);
    }

    // Weapon range
    const rangeMatch = itemText.match(/Weapon Range: (\d+)/);
    if (rangeMatch) {
      item.weaponRange = parseInt(rangeMatch[1], 10);
    }
  }

  private static parseArmourProperties(itemText: string, item: ParsedItem): void {
    // Armour
    const armourMatch = itemText.match(/Armour: (\d+)/);
    if (armourMatch) {
      item.armourAR = parseInt(armourMatch[1], 10);
    }

    // Evasion
    const evasionMatch = itemText.match(/Evasion Rating: (\d+)/);
    if (evasionMatch) {
      item.armourEV = parseInt(evasionMatch[1], 10);
    }

    // Energy Shield
    const esMatch = itemText.match(/Energy Shield: (\d+)/);
    if (esMatch) {
      item.armourES = parseInt(esMatch[1], 10);
    }

    // Block chance
    const blockMatch = itemText.match(/Chance to Block: (\d+)%/);
    if (blockMatch) {
      item.armourBLOCK = parseInt(blockMatch[1], 10);
    }
  }

  private static parseSockets(itemText: string, item: ParsedItem): void {
    // Socket pattern matching (e.g., "Sockets: R-G-B W-W-W")
    const socketMatch = itemText.match(/Sockets: ([RGBW\-\s]+)/);
    if (socketMatch) {
      const socketString = socketMatch[1];
      const sockets = socketString.replace(/[\s\-]/g, '').split('');
      
      item.sockets = {
        total: sockets.length,
        red: sockets.filter(s => s === 'R').length,
        green: sockets.filter(s => s === 'G').length,
        blue: sockets.filter(s => s === 'B').length,
        white: sockets.filter(s => s === 'W').length,
      };

      // Calculate links (count consecutive linked groups)
      const linkGroups = socketString.split(/\s+/);
      item.sockets.linked = Math.max(...linkGroups.map(group => 
        group.replace(/\-/g, '').length
      ));
    }
  }

  private static parseRequirements(itemText: string, item: ParsedItem): void {
    const reqSection = itemText.match(/Requirements:\s*((?:.|\n)*?)(?:\n--------|\n\n|$)/);
    if (reqSection) {
      const reqText = reqSection[1];
      
      const levelMatch = reqText.match(/Level (\d+)/);
      const strMatch = reqText.match(/(\d+) Str/);
      const dexMatch = reqText.match(/(\d+) Dex/);
      const intMatch = reqText.match(/(\d+) Int/);

      item.requirements = {
        level: levelMatch ? parseInt(levelMatch[1], 10) : undefined,
        strength: strMatch ? parseInt(strMatch[1], 10) : undefined,
        dexterity: dexMatch ? parseInt(dexMatch[1], 10) : undefined,
        intelligence: intMatch ? parseInt(intMatch[1], 10) : undefined,
      };
    }
  }

  private static parseModifiers(sections: string[], item: ParsedItem): void {
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;

      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      
      // Skip sections that are just properties/requirements
      if (this.isPropertySection(section)) continue;

      // Determine modifier type
      let modType: 'implicit' | 'explicit' | 'enchant' | 'pseudo' = 'explicit';
      
      if (section.includes('(implicit)')) {
        modType = 'implicit';
      } else if (section.includes('(enchant)')) {
        modType = 'enchant';
      }

      // Parse each line as a potential modifier
      for (const line of lines) {
        if (this.isModifierLine(line)) {
          const stat = this.parseStatLine(line);
          if (stat) {
            item.stats![modType].push(stat);
          }
        }
      }
    }
  }

  private static isPropertySection(section: string): boolean {
    const propertyKeywords = [
      'Requirements:', 'Armour:', 'Evasion Rating:', 'Energy Shield:',
      'Physical Damage:', 'Elemental Damage:', 'Critical Strike Chance:',
      'Attacks per Second:', 'Weapon Range:', 'Quality:', 'Level:',
      'Stack Size:', 'Map Tier:', 'Item Level:', 'Sockets:'
    ];
    
    return propertyKeywords.some(keyword => section.includes(keyword));
  }

  private static isModifierLine(line: string): boolean {
    // Skip property lines, corrupted, unidentified, etc.
    const skipPatterns = [
      /^(Corrupted|Unidentified|Mirrored|Fractured|Synthesised)$/,
      /^Requirements:/,
      /^(Item Class|Rarity):/,
      /^\d+% increased/,  // Quality lines often start this way
      /^Level:/,
      /^Stack Size:/,
      /^Map Tier:/,
    ];

    return !skipPatterns.some(pattern => pattern.test(line)) && 
           line.length > 0 && 
           !line.includes('--------');
  }

  private static parseStatLine(line: string): { id: string; text: string; values?: number[] } | null {
    // Extract numbers from the line
    const numbers = line.match(/-?\d+(?:\.\d+)?/g);
    const values = numbers ? numbers.map(n => parseFloat(n)) : undefined;

    // Create a normalized version for ID mapping
    const normalizedText = line.replace(/-?\d+(?:\.\d+)?/g, '#');
    
    // Try to find matching stat ID
    let statId = '';
    for (const [key, id] of Object.entries(STAT_MAPPINGS)) {
      // This is a simplified mapping - in a full implementation you'd need
      // comprehensive text-to-ID mapping based on the actual stat database
      if (normalizedText.toLowerCase().includes(key.toLowerCase())) {
        statId = id;
        break;
      }
    }

    return {
      id: statId || `unknown_${normalizedText.replace(/[^a-zA-Z0-9]/g, '_')}`,
      text: line,
      values
    };
  }

  private static determineCategory(itemClass: string, baseType?: string, name?: string, rarity?: string): string {
    // First try item class mapping
    const classMapping: { [key: string]: string } = {
      'Currency': 'currency',
      'Divination Card': 'card',
      'Gem': 'gem',
      'Map': 'map',
      'Jewel': 'jewel',
      'Flask': 'flask'
    };

    if (classMapping[itemClass]) {
      return classMapping[itemClass];
    }

    // Try base type mapping from PoE2 categories
    const typeToCheck = baseType || name || '';
    const category = ITEM_TYPE_TO_CATEGORY[typeToCheck];
    if (category) {
      return category;
    }

    // Fallback heuristics based on item class and properties
    if (itemClass.includes('Weapon') || itemClass.includes('Bow') || itemClass.includes('Claw')) {
      return 'weapon';
    }
    if (itemClass.includes('Armour') || itemClass.includes('Shield') || itemClass.includes('Helmet')) {
      return 'armour';
    }
    if (itemClass.includes('Ring') || itemClass.includes('Amulet') || itemClass.includes('Belt')) {
      return 'accessory';
    }

    return 'unknown';
  }
}
