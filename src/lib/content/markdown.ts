import { unified, type Processor } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

// Shiki was dropped from the Cloudflare-Workers build because its singleton
// highlighter dynamically loads grammars/themes and pushes the request past
// the CPU budget on the Bundled usage model (which is what Pages Functions
// default to). Code blocks render as plain <pre><code>; styling lives in CSS.
let cachedProcessor: Processor | null = null;

function getProcessor(): Processor {
  if (cachedProcessor) return cachedProcessor;
  cachedProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true }) as unknown as Processor;
  return cachedProcessor;
}

export async function renderMarkdown(source: string): Promise<string> {
  const proc = getProcessor();
  const file = await proc.process(source);
  return String(file);
}
