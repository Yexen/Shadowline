interface CharacterData {
  name: string;
  realName?: string;
  aliases?: string[];
  backstory?: string;
  personality?: string;
  abilities?: string[];
  relationships?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  physicalDescription?: string;
  details: Record<string, string>;
}

export interface ImportedCharacter {
  id: string;
  path: string;
  title: string;
  content: string;
  type: 'character';
  lastModified: Date;
  bibleEntry?: {
    title: string;
    fields: Array<{ label: string; value: string }>;
    fixedFields: {
      realName?: string;
      aliases?: string;
      age?: string;
      nationality?: string;
      alignment?: string;
      affiliation?: string[];
    };
    relationships: Array<{
      characterName: string;
      relationshipType: string;
      description: string;
    }>;
  };
}

export function parseCharacterHTML(htmlContent: string, fileName: string): CharacterData | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Extract title from multiple possible sources
    const title = doc.querySelector('title')?.textContent ||
                  doc.querySelector('h1.page-title')?.textContent ||
                  doc.querySelector('h1')?.textContent ||
                  fileName.replace('.html', '').replace(/^\w+\s+/, ''); // Remove file ID prefixes

    // Clean title by removing file ID patterns
    const cleanTitle = title?.replace(/\s+[a-f0-9]{32}$/, '').trim() || 'Unknown Character';

    // Extract all text content and organize by sections
    const details: Record<string, string> = {};

    // Get all paragraphs and structured content
    const pageBody = doc.querySelector('.page-body') || doc.body;

    // Extract strong/bold labels and their content
    const paragraphs = pageBody?.querySelectorAll('p');
    paragraphs?.forEach(p => {
      const strongElement = p.querySelector('strong');
      if (strongElement) {
        const label = strongElement.textContent?.trim();
        const fullText = p.textContent?.trim();
        if (label && fullText && fullText.includes(':')) {
          const content = fullText.replace(label, '').replace(/^:\s*/, '').trim();
          if (content) {
            details[label] = content;
          }
        }
      }
    });

    // Get all headings and their content
    const headings = pageBody?.querySelectorAll('h1, h2, h3, h4');
    headings?.forEach(heading => {
      const headingText = heading.textContent?.trim();
      if (headingText) {
        // Get content after this heading until next heading
        let nextSibling = heading.nextElementSibling;
        let content = '';

        while (nextSibling && !['H1', 'H2', 'H3', 'H4'].includes(nextSibling.tagName)) {
          const text = nextSibling.textContent?.trim();
          if (text) {
            content += text + '\n';
          }
          nextSibling = nextSibling.nextElementSibling;
        }

        if (content.trim()) {
          details[headingText] = content.trim();
        }
      }
    });

    // Extract lists and tables
    const lists = pageBody?.querySelectorAll('ul, ol');
    lists?.forEach((list, index) => {
      const items = Array.from(list.querySelectorAll('li')).map(li => {
        // Handle nested structure with strong elements
        const strongElement = li.querySelector('strong');
        if (strongElement) {
          const label = strongElement.textContent?.trim();
          const fullText = li.textContent?.trim();
          if (label && fullText) {
            return `${label}: ${fullText.replace(label, '').replace(/^:\s*/, '').trim()}`;
          }
        }
        return li.textContent?.trim();
      }).filter(Boolean);

      if (items.length > 0) {
        const precedingHeading = getPrecedingHeading(list);
        const key = precedingHeading || `List ${index + 1}`;
        details[key] = items.join('\n');
      }
    });

    const tables = pageBody?.querySelectorAll('table');
    tables?.forEach((table, index) => {
      const rows = Array.from(table.querySelectorAll('tr'));
      const tableContent = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        return cells.map(cell => cell.textContent?.trim()).join(' | ');
      }).join('\n');

      if (tableContent.trim()) {
        const precedingHeading = getPrecedingHeading(table);
        const key = precedingHeading || `Table ${index + 1}`;
        details[key] = tableContent;
      }
    });

    // Parse specific character information
    const characterData: CharacterData = {
      name: cleanTitle,
      details
    };

    // Try to extract common character fields
    const nameData = extractNameData(details);
    if (nameData.realName) characterData.realName = nameData.realName;
    if (nameData.aliases.length > 0) characterData.aliases = nameData.aliases;

    // Extract backstory
    const backstoryKeys = ['Backstory', 'Background', 'History', 'Origin'];
    for (const key of backstoryKeys) {
      if (details[key]) {
        characterData.backstory = details[key];
        break;
      }
    }

    // Extract personality
    const personalityKeys = ['Personality', 'Personality Overview', 'Character', 'Traits'];
    for (const key of personalityKeys) {
      if (details[key]) {
        characterData.personality = details[key];
        break;
      }
    }

    // Extract physical description
    const physicalKeys = ['Physical Appearance', 'Physical Appearances', 'Appearance', 'Physical Description', 'Physical Traits and Presence'];
    for (const key of physicalKeys) {
      if (details[key]) {
        characterData.physicalDescription = details[key];
        break;
      }
    }

    // Extract relationships
    characterData.relationships = extractRelationships(details);

    return characterData;
  } catch (error) {
    console.error('Error parsing character HTML:', error);
    return null;
  }
}

function getPrecedingHeading(element: Element): string | null {
  let current = element.previousElementSibling;
  while (current) {
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(current.tagName)) {
      return current.textContent?.trim() || null;
    }
    current = current.previousElementSibling;
  }
  return null;
}

function extractNameData(details: Record<string, string>): { realName?: string; aliases: string[] } {
  const result = { aliases: [] as string[] };

  // Look for name information in various sections
  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('name') || lowerKey.includes('identity') || lowerKey.includes('overview')) {
      const lines = value.split('\n');
      for (const line of lines) {
        // Handle different name patterns
        const cleanLine = line.trim();

        // Match patterns like "Current Name:", "Real Name:", "Birth Name:", etc.
        if (cleanLine.match(/(?:real name|birth name|current name):/i)) {
          const match = cleanLine.match(/(?:real name|birth name|current name):\s*(.+?)(?:\s*\(.*\))?$/i);
          if (match) {
            result.realName = match[1].trim();
          }
        }

        // Match alias patterns
        if (cleanLine.match(/(?:alias|aliases|vigilante alias|married name|goddess name):/i)) {
          const match = cleanLine.match(/(?:alias|aliases|vigilante alias|married name|goddess name):\s*(.+?)(?:\s*\(.*\))?$/i);
          if (match) {
            result.aliases.push(match[1].trim());
          }
        }

        // Match bullet point patterns
        if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
          const bulletMatch = cleanLine.match(/^[•-]\s*(.+?):\s*(.+?)(?:\s*\(.*\))?$/);
          if (bulletMatch) {
            const label = bulletMatch[1].toLowerCase();
            const value = bulletMatch[2].trim();

            if (label.includes('real name') || label.includes('birth name') || label.includes('current name')) {
              result.realName = value;
            } else if (label.includes('alias') || label.includes('vigilante') || label.includes('married') || label.includes('goddess')) {
              result.aliases.push(value);
            }
          }
        }
      }
    }
  }

  return result;
}

function extractRelationships(details: Record<string, string>): Array<{ name: string; type: string; description: string }> {
  const relationships: Array<{ name: string; type: string; description: string }> = [];

  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('relationship') || lowerKey.includes('family') || lowerKey.includes('friends')) {
      const lines = value.split('\n');
      for (const line of lines) {
        // Try to parse relationship lines like "Bruce Wayne - Love interest" or "Alfred - Father figure"
        const relationshipMatch = line.match(/^(.+?)\s*[-–—]\s*(.+)$/);
        if (relationshipMatch) {
          relationships.push({
            name: relationshipMatch[1].trim(),
            type: relationshipMatch[2].trim(),
            description: line.trim()
          });
        }
      }
    }
  }

  return relationships;
}

export function createCodexNodeFromCharacter(character: CharacterData): ImportedCharacter {
  const id = `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const safeName = character.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  const path = `/characters/${safeName}`;

  // Create markdown content
  let content = `# ${character.name}\n\n`;

  if (character.realName) {
    content += `**Real Name:** ${character.realName}\n\n`;
  }

  if (character.aliases && character.aliases.length > 0) {
    content += `**Aliases:** ${character.aliases.join(', ')}\n\n`;
  }

  if (character.backstory) {
    content += `## Backstory\n\n${character.backstory}\n\n`;
  }

  if (character.personality) {
    content += `## Personality\n\n${character.personality}\n\n`;
  }

  if (character.physicalDescription) {
    content += `## Physical Description\n\n${character.physicalDescription}\n\n`;
  }

  if (character.relationships && character.relationships.length > 0) {
    content += `## Relationships\n\n`;
    character.relationships.forEach(rel => {
      content += `- **${rel.name}**: ${rel.description}\n`;
    });
    content += '\n';
  }

  // Add other details
  if (Object.keys(character.details).length > 0) {
    content += `## Additional Information\n\n`;
    Object.entries(character.details).forEach(([key, value]) => {
      if (!['Backstory', 'Personality', 'Physical Appearance', 'Physical Appearances', 'Relationships'].includes(key)) {
        content += `### ${key}\n\n${value}\n\n`;
      }
    });
  }

  // Create Bible entry
  const bibleEntry = {
    title: character.name,
    fields: Object.entries(character.details).map(([label, value]) => ({ label, value })),
    fixedFields: {
      realName: character.realName,
      aliases: character.aliases?.join(', '),
      nationality: extractFieldValue(character.details, ['Nationality', 'Origin']),
      age: extractFieldValue(character.details, ['Age']),
    },
    relationships: character.relationships?.map(rel => ({
      characterName: rel.name,
      relationshipType: rel.type,
      description: rel.description
    })) || []
  };

  return {
    id,
    path,
    title: character.name,
    content,
    type: 'character',
    lastModified: new Date(),
    bibleEntry
  };
}

function extractFieldValue(details: Record<string, string>, possibleKeys: string[]): string | undefined {
  for (const key of possibleKeys) {
    if (details[key]) {
      return details[key];
    }
  }
  return undefined;
}

export async function importCharacterFromFiles(files: FileList): Promise<ImportedCharacter[]> {
  const characters: ImportedCharacter[] = [];

  for (const file of Array.from(files)) {
    if (file.type === 'text/html' || file.name.endsWith('.html')) {
      try {
        const content = await file.text();
        const characterData = parseCharacterHTML(content, file.name);

        if (characterData) {
          const codexNode = createCodexNodeFromCharacter(characterData);
          characters.push(codexNode);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
  }

  return characters;
}