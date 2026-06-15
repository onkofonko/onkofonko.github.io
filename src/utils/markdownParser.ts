export interface Article {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
  date: string;
  image: string;
  content: {
    sectionTitle?: string;
    paragraphs: string[];
    bulletPoints?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }[];
}

export interface CaseStudyDetail {
  id: string | number;
  title: string;
  subtitle: string;
  category: string;
  challenge: string;
  solution: string;
  results: { metric: string; description: string }[];
  tools: string[];
  timeline: string;
  client: string;
  longDescription: string;
  asIsFlow: string[];
  toBeFlow: string[];
  methodology: string[];
  deliverables: string[];
}

const NEWLINE_REGEX = /\r?\n/;
const QUOTE_TRIM_REGEX = /^['"]|['"]$/g;

export function parseMarkdownArticle(filename: string, rawText: string): Article {
  const parts = rawText.split('---');
  if (parts.length < 3) {
    throw new Error(`Invalid markdown format in ${filename}. Must contain YAML frontmatter surrounded by '---'.`);
  }

  const frontmatter = parts[1];
  const body = parts.slice(2).join('---').trim();

  // Parse frontmatter (YAML keys)
  const metadata: Record<string, string> = {};
  frontmatter.split(NEWLINE_REGEX).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim();
      metadata[key] = val.replace(QUOTE_TRIM_REGEX, '');
    }
  });

  const id = metadata.id || filename.replace(/\.md$/, '');
  const title = metadata.title || 'Untitled';
  const subtitle = metadata.subtitle || '';
  
  // Calculate read time dynamically (200 words per minute average) if not provided in YAML metadata
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const computedReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  const readTime = metadata.readTime || computedReadTime;

  const date = metadata.date || '';
  const image = metadata.image || '';

  // Parse body line by line
  const sections: Article['content'] = [];
  let currentSection: typeof sections[number] = { paragraphs: [] };
  let currentParagraph = '';
  let inBulletPoints = false;

  const commitCurrentSection = () => {
    if (currentSection.paragraphs.length > 0 || currentSection.sectionTitle || currentSection.bulletPoints || currentSection.table) {
      sections.push(currentSection);
    }
  };

  const lines = body.split(NEWLINE_REGEX);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('### ')) {
      if (currentParagraph) {
        currentSection.paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
      commitCurrentSection();

      currentSection = {
        sectionTitle: line.substring(4).trim(),
        paragraphs: []
      };
      inBulletPoints = false;
    } else if (line.startsWith('|')) {
      if (currentParagraph) {
        currentSection.paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
      
      const cells = line.split('|').map(c => c.trim());
      if (line.startsWith('|')) cells.shift();
      if (line.endsWith('|')) cells.pop();
      
      const isSeparator = cells.every(c => /^[:\-\s]*$/.test(c));
      if (!isSeparator) {
        if (!currentSection.table) {
          currentSection.table = {
            headers: cells,
            rows: []
          };
        } else {
          currentSection.table.rows.push(cells);
        }
      }
      inBulletPoints = false;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (currentParagraph) {
        currentSection.paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
      if (!currentSection.bulletPoints) {
        currentSection.bulletPoints = [];
      }
      currentSection.bulletPoints.push(line.substring(2).trim());
      inBulletPoints = true;
    } else if (line === '') {
      if (currentParagraph) {
        currentSection.paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
      inBulletPoints = false;
    } else {
      if (inBulletPoints) {
        inBulletPoints = false;
      }
      if (currentParagraph) {
        currentParagraph += ' ' + line;
      } else {
        currentParagraph = line;
      }
    }
  }

  if (currentParagraph) {
    currentSection.paragraphs.push(currentParagraph);
  }
  commitCurrentSection();

  return {
    id,
    title,
    subtitle,
    readTime,
    date,
    image,
    content: sections
  };
}

export function parseCaseStudy(filename: string, rawText: string): CaseStudyDetail {
  const parts = rawText.split('---');
  if (parts.length < 3) {
    throw new Error(`Invalid markdown format in ${filename}. Must contain YAML frontmatter surrounded by '---'.`);
  }

  const frontmatter = parts[1];
  const body = parts.slice(2).join('---').trim();

  // Parse frontmatter
  const metadata: Record<string, string> = {};
  frontmatter.split(NEWLINE_REGEX).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim();
      metadata[key] = val.replace(QUOTE_TRIM_REGEX, '');
    }
  });

  const id = metadata.id || filename.replace(/\.md$/, '');
  const title = metadata.title || 'Untitled';
  const subtitle = metadata.subtitle || '';
  const category = metadata.category || '';
  const challenge = metadata.challenge || '';
  const solution = metadata.solution || '';
  const timeline = metadata.timeline || '';
  const client = metadata.client || '';

  // Parse tools (comma-separated list)
  const tools = metadata.tools 
    ? metadata.tools.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  // Parse results: "37% | Reduction in picking time; 19.4% | Improvement..."
  const results = metadata.results
    ? metadata.results.split(';').map(item => {
        const pipeIndex = item.indexOf('|');
        if (pipeIndex !== -1) {
          return {
            metric: item.substring(0, pipeIndex).trim(),
            description: item.substring(pipeIndex + 1).trim()
          };
        }
        return { metric: item.trim(), description: '' };
      }).filter(r => r.metric)
    : [];

  // Parse body line by line
  const lines = body.split(NEWLINE_REGEX);
  let longDescription = '';
  let currentHeader = '';
  const asIsFlow: string[] = [];
  const toBeFlow: string[] = [];
  const methodology: string[] = [];
  const deliverables: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('### ')) {
      currentHeader = line.substring(4).trim().toLowerCase();
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const item = line.substring(2).trim();
      if (currentHeader.includes('as-is') || currentHeader.includes('source') || currentHeader.includes('legacy')) {
        asIsFlow.push(item);
      } else if (currentHeader.includes('to-be') || currentHeader.includes('model') || currentHeader.includes('bpmn')) {
        toBeFlow.push(item);
      } else if (currentHeader.includes('methodology')) {
        methodology.push(item);
      } else if (currentHeader.includes('deliverable')) {
        deliverables.push(item);
      }
    } else if (line !== '') {
      // If we don't have a header yet, it goes into the long description
      if (!currentHeader) {
        if (longDescription) {
          longDescription += ' ' + line;
        } else {
          longDescription = line;
        }
      }
    }
  }

  return {
    id,
    title,
    subtitle,
    category,
    challenge,
    solution,
    results,
    tools,
    timeline,
    client,
    longDescription,
    asIsFlow,
    toBeFlow,
    methodology,
    deliverables
  };
}
