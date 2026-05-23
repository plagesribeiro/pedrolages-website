import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';

let cachedProcessor: ReturnType<typeof unified> | null = null;

async function getProcessor() {
  if (cachedProcessor) return cachedProcessor;
  cachedProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeShiki, {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'dark'
    })
    .use(rehypeStringify, { allowDangerousHtml: true });
  return cachedProcessor;
}

export async function renderMarkdown(source: string): Promise<string> {
  const proc = await getProcessor();
  const file = await proc.process(source);
  return String(file);
}
