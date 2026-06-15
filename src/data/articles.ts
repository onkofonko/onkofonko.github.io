import { parseMarkdownArticle, type Article } from '../utils/markdownParser';

// Eagerly import all markdown files in the articles subfolder as raw text strings
const markdownModules = import.meta.glob('./articles/*.md', { query: '?raw', eager: true }) as Record<
  string,
  { default: string }
>;

export type { Article };

// Map, parse, and sort articles by date descending eagerly at module load time
export const ARTICLES: Article[] = Object.entries(markdownModules)
  .map(([path, module]) => {
    const filename = path.split('/').pop() || '';
    return parseMarkdownArticle(filename, module.default);
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
