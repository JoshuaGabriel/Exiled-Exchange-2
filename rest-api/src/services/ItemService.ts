import { err, ok, Result } from "neverthrow";
import { ParseItemRequest, ApiErrorCode } from "../types/api";

// Simplified ParsedItem interface for the REST API
export interface ParsedItem {
  name: string;
  baseType?: string;
  rarity?: string;
  itemLevel?: number;
  isCorrupted: boolean;
  category?: string;
  rawText: string;
  // Add more properties as needed for basic functionality
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
   * item parser
   */
  private static basicParse(itemText: string): ParsedItem | null {
    const lines = itemText.split('\n');
    const sections = itemText.split('--------');
    
    if (sections.length < 2) {
      return null;
    }

    const headerLines = sections[0].trim().split('\n');
    let name = '';
    let baseType = '';
    let rarity = '';
    let itemLevel: number | undefined;

    for (let i = 0; i < headerLines.length; i++) {
      const line = headerLines[i].trim();
      if (line.startsWith('Rarity: ')) {
        rarity = line.substring(8);
      } else if (line && !line.startsWith('Item Class:') && !line.startsWith('Rarity:')) {
        if (!name) {
          name = line;
        } else if (!baseType) {
          baseType = line;
        }
      }
    }

    for (const section of sections) {
      const match = section.match(/Item Level: (\d+)/);
      if (match) {
        itemLevel = parseInt(match[1], 10);
        break;
      }
    }

    let category: string | undefined;
    if (itemText.includes('Item Class: Currency')) {
      category = 'Currency';
    } else if (itemText.includes('Item Class: Divination Card')) {
      category = 'DivinationCard';
    } else if (itemText.includes('Item Class: Gem')) {
      category = 'Gem';
    } else if (itemText.includes('Item Class: Map')) {
      category = 'Map';
    }

    return {
      name: name || 'Unknown Item',
      baseType,
      rarity,
      itemLevel,
      isCorrupted: itemText.includes('Corrupted'),
      category,
      rawText: itemText
    };
  }
}
