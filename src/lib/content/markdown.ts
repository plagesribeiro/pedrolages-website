import { unified, type Processor } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';

// Use a loose type for the cached chain — the configured pipeline isn't
// assignable to `ReturnType<typeof unified>` because each `.use()` narrows
// the generic parameters. We only ever call `.process()`, which is on every
// processor regardless.
let cachedProcessor: Processor | null = null;

function getProcessor(): Processor {
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
    .use(rehypeStringify, { allowDangerousHtml: true }) as unknown as Processor;
  return cachedProcessor;
}

export async function renderMarkdown(source: string): Promise<string> {
  const proc = getProcessor();
  const file = await proc.process(source);
  return String(file);
}
