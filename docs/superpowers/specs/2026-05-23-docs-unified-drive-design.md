# /docs — biblioteca unificada vinda do Google Drive

**Status:** draft, aguardando revisão
**Data:** 2026-05-23
**Branches afetadas:** `staging` (trabalho), `production` (deploy)

## Contexto

Hoje o site expõe três rotas de conteúdo vindo do Google Drive — `/md`, `/html`, `/pdf` — cada uma com seu próprio índice e árvore. A estrutura no Drive reflete isso: `ROOT/{md|html|pdf}/{public|private}/...`, seis subárvores separadas. O manifest é cacheado por 5min sem nenhum sinal de invalidação, então mudanças no Drive demoram pra aparecer no site.

Esta spec redesenha a área de conteúdo pra:

1. Unificar md/html/pdf em uma única biblioteca em `/docs/<path>`.
2. Simplificar a estrutura no Drive pra apenas `public/` e `private/` no nível raiz.
3. Reduzir a latência de atualização do Drive pra o site pra ~10–20s sem cron e sem webhooks.

## Decisões fechadas no brainstorm

| Decisão | Escolha |
|---|---|
| Prefixo de URL | `/docs/<path>` |
| Rotas antigas (`/md`, `/html`, `/pdf`) | Remover de vez (não redirecionar) |
| Mecanismo de real-time | TTL curto + browser polling, sem cron |
| Slug com ou sem extensão | **Com** extensão (mata colisão entre kinds, URLs honestas) |
| Dedupe entre public e private | Public ganha (regra atual mantida) |

## Estrutura no Drive (depois)

```
ROOT/                          ← GOOGLE_DRIVE_ROOT_FOLDER_ID (mesmo de hoje)
  public/
    notas/
      dia-1.md
      dia-2.md
    relatorios/
      q4-2025.pdf
      checklist.html
    sobre.md
  private/
    diario/
      2026-05.md
    receitas.pdf
```

**Regras:**

- Só `public/` e `private/` na raiz importam. Qualquer outra pasta na raiz é ignorada em silêncio (igual à regra atual pra `md/html/pdf`).
- Dentro de `public/` e `private/`, estrutura arbitrária — qualquer pasta, qualquer profundidade.
- Tipo do arquivo vem da extensão: `.md`, `.html`, `.pdf`. Extensões não suportadas são ignoradas em silêncio.
- Service account já tem acesso ao root — sem mudança de credencial.

## Modelo de dados

```ts
// src/lib/content/types.ts
export type Kind = 'md' | 'html' | 'pdf';
export type Visibility = 'public' | 'private';

export interface ContentItem {
  /** slug relativo a public/ ou private/, COM extensão. ex: "notas/dia-1.md" */
  slug: string;
  /** URL no site. ex: "/docs/notas/dia-1.md" */
  url: string;
  kind: Kind;
  visibility: Visibility;
  /** pasta pai relativa a public/ ou private/. "" pra raiz */
  folder: string;
  /** nome do arquivo COM extensão (pra exibição). ex: "dia-1.md" */
  name: string;
  driveId: string;
  /** ISO do Drive — usado como cache-buster do conteúdo do arquivo */
  modifiedTime: string;
}

export interface Manifest {
  items: ContentItem[];     // tudo misturado: md/html/pdf, public+private
  builtAt: string;          // ISO de quando foi montado
  /**
   * Hash determinístico curto pra polling. Computado concatenando
   * `${driveId}:${modifiedTime}` de cada item (ordenado por slug) e passando
   * por FNV-1a 32-bit em hex. Mudança em qualquer item ou inclusão/remoção
   * de item muda o tag. Não precisa ser criptográfico.
   */
  revisionTag: string;
}
```

**Dedupe:** quando o mesmo slug aparece em `public/` e `private/`, public ganha. Sem extensão no slug haveria colisão entre kinds (`dia.md` vs `dia.pdf`); com extensão, slugs são únicos por kind.

## Helpers (`src/lib/content/manifest.ts`)

Operações sobre a lista plana, sem buckets por tipo:

- `publicItems(manifest): ContentItem[]` — só visíveis na raiz do índice.
- `findItem(manifest, slug): ContentItem | null` — match exato.
- `folderExists(manifest, folderPath): boolean` — pasta tem algum item recursivamente.
- `itemsInFolder(manifest, folderPath): ContentItem[]` — todos os items abaixo dela (public+private).
- `listFolderChildren(manifest, folderPath): { name, isDir, slug }[]` — filhos imediatos, usado pelo terminal.

Comportamento dos helpers replica o atual, só que numa lista única.

## Rotas

**Remover:**

- `src/routes/md/` (todo)
- `src/routes/html/` (todo)
- `src/routes/pdf/` (todo)

**Adicionar:**

```
src/routes/docs/
  +page.server.ts        carrega manifest, retorna publicItems()
  +page.svelte           renderiza índice raiz com Tree
  [...path]/
    +page.server.ts      resolve path → file | folder | 404
    +page.svelte         renderiza file (md/html/pdf) OU folder (Tree)
```

**Resolução em `/docs/[...path]/+page.server.ts`:**

```
1. item = findItem(manifest, path)
   se achou:
     - kind === 'md'   → getFileText(driveId, modifiedTime) + renderMarkdown
     - kind === 'html' → getFileText(driveId, modifiedTime), retorna raw
     - kind === 'pdf'  → retorna proxy URL `/api/drive-file/<driveId>`
2. senão se folderExists(manifest, path) e itemsInFolder().length > 0
     → mode: 'folder', items: itemsInFolder(manifest, path)
3. senão throw error(404)
```

**`+page.svelte` consolida as três renderizações (md/html/pdf) num único componente** com discriminated union `{ mode: 'file', kind, ... } | { mode: 'folder', ... }`. A renderização de cada kind preserva exatamente o que existe hoje em `routes/md|html|pdf/[...path]/+page.svelte`.

**`/api/drive-file/[fileId]/+server.ts`:** sem mudança estrutural. Único ajuste: `Cache-Control: public, max-age=60, must-revalidate` (em vez de 3600).

## Componente Tree

`src/lib/components/Tree.svelte` ganha:

- Ícone por `kind`: `FileText` (md), `Code` (html), `FileType` (pdf) — `lucide`.
- Sem outras mudanças. Continua plano-em-cima-de-lista.

`ContentIndex.svelte` deixa de ser usado pelas rotas removidas. Ele pode ser deletado ou ficar se ainda houver call sites — durante a implementação, conferir e remover se sobrar morto.

## Real-time (TTL curto sem cron)

### Servidor

| Cache | Hoje | Novo |
|---|---|---|
| Manifest (memória, `mem.set` em `drive/cache.ts`) | 60s mirror | **5s** |
| Manifest (KV `drive:manifest:v1`) | 300s | **15s** |
| Conteúdo md/html (memória) | 60s | **10s** |
| Conteúdo md/html (KV `drive:file:<id>`) | 300s | **60s** |
| PDF proxy (`Cache-Control`) | `max-age=3600` | `max-age=60, must-revalidate` |

**Cache key do conteúdo:** muda de `drive:file:<driveId>` pra `drive:file:<driveId>:<modifiedTime>`. Quando você edita um arquivo no Drive, o `modifiedTime` muda e o cache vira chave nova automaticamente — sem precisar esperar TTL expirar pra ver edição. Entradas com chave antiga viram lixo no KV, mas expiram naturalmente pelo TTL — sem GC explícito.

**Assinatura de `getFileText`:** muda de `(platform, driveId)` pra `(platform, driveId, modifiedTime)` — todos os call sites passam por `findItem` antes, então `modifiedTime` está sempre disponível.

Sem cron, sem webhook, sem estado novo. **Demand-pull:** quando o cache expira e alguém pede, o próximo request reconstrói. Drive API quota (1000 queries/100s/user) sobra com folga pro tamanho previsto.

### Endpoint novo

```
GET /api/manifest-version
→ { builtAt: string, revisionTag: string }
   Headers: Cache-Control: no-store
```

Lê o manifest pelo cache normal (qualquer hit nele dispara o eventual refresh quando expira). Sem `force: true` — manter respostas baratas.

### Cliente (browser polling)

Em `src/routes/docs/+layout.svelte`:

- A cada **5s**, `fetch('/api/manifest-version')`.
- Se `revisionTag` ≠ último visto → `invalidateAll()` de `$app/navigation` → SvelteKit refaz os `load`s da rota atual e o DOM atualiza sem refresh manual.
- Pausa quando `document.visibilityState !== 'visible'`; revalida imediato no `visibilitychange` → `visible`.

### Latência efetiva

```
Upload no Drive
   │
   │ até 15s — próximo request com cache expirado revalida manifest
   ▼
Servidor tem o manifest novo
   │
   │ até 5s — próximo poll do browser
   ▼
Browser invalida e atualiza DOM

Pior caso: ~20s.  Médio: ~10s.  Edições aparecem sem TTL (cache key inclui modifiedTime).
```

## i18n

Strings novas em `src/lib/i18n/pt.json` e `src/lib/i18n/en.json`:

| Chave | PT | EN |
|---|---|---|
| `docs.title` | documentos | documents |
| `docs.subtitle` | só arquivos públicos. pastas começam fechadas — clica no nome pra abrir a rota, ou na setinha pra expandir aqui. | public files only. folders are collapsed — click the name to open the route, or the chevron to expand inline. |
| `docs.empty` | nada por enquanto. | nothing here yet. |
| `docs.back` | voltar pra listagem | back to listing |

Strings das chaves antigas `md.*`, `html.*`, `pdf.*` ficam removidas.

## Migração

### No Drive (manual, você)

1. Criar `public/` e `private/` na raiz do Drive (mesmo root id, sem mudar variável de ambiente).
2. Mover conteúdo de `md/public/*`, `html/public/*`, `pdf/public/*` pra `public/` preservando subpastas.
3. Idem pra `private/*`.
4. Apagar (ou ignorar) `md/`, `html/`, `pdf/` antigas.

Como tudo continua dentro do mesmo `ROOT` (que já está compartilhado com a service account), a permissão é herdada — sem novo `share`.

Posso escrever um script Node usando a service account se preferir, mas o caminho mais seguro é manual pelo Drive UI.

### No código

1. Atualizar `src/lib/content/types.ts` pro shape novo (`Kind`, `ContentItem`, `Manifest`).
2. Reescrever `src/lib/drive/manifest.ts`: walker novo de duas pastas (`public`, `private`), extensão decide kind, `modifiedTime` no fetch.
3. Reescrever helpers em `src/lib/content/manifest.ts` pra operar na lista única.
4. Adicionar `src/routes/docs/+page.{server.ts,svelte}` e `src/routes/docs/[...path]/+page.{server.ts,svelte}`.
5. Adicionar `src/routes/docs/+layout.svelte` com o polling de 5s.
6. Adicionar `src/routes/api/manifest-version/+server.ts`.
7. Remover `src/routes/md/`, `src/routes/html/`, `src/routes/pdf/`.
8. Ajustar TTLs em `src/lib/drive/cache.ts` (memória) e `src/lib/drive/manifest.ts` (`MANIFEST_TTL`, `FILE_TTL`).
9. Mudar cache key de `getFileText` pra incluir `modifiedTime`.
10. Ajustar `Cache-Control` em `src/routes/api/drive-file/[fileId]/+server.ts`.
11. Atualizar terminal (`src/lib/terminal/`) que referencia `md`/`html`/`pdf` por nome.
12. Atualizar `Tree.svelte` pra ícone por kind.
13. Apagar `ContentIndex.svelte` se ficar sem call site.
14. Atualizar `pt.json`, `en.json` (strings novas, strings velhas removidas).
15. Atualizar `CLAUDE.md` §7 (mapa mental) e `README.md` (estrutura do Drive + rotas).
16. Atualizar `+layout.server.ts` se necessário (o `getManifest` continua chamado lá; só o shape do retorno muda).
17. Atualizar `manifestStore` em `src/lib/content/store.ts` pro shape novo.

## Edge cases

| Caso | Tratamento |
|---|---|
| Pasta vazia | 404 (igual ao comportamento atual). |
| Slug colide entre public e private | Public ganha. |
| Slug colide entre kinds | Não acontece — extensão entra no slug. |
| Arquivo com extensão não suportada | Ignorado em silêncio. |
| Drive offline / auth falhou | Serve manifest stale do KV; se nem stale → manifest vazio (mantém regra atual). |
| Polling do browser falha (rede caiu) | Próximo tick tenta de novo. Nenhum estado quebra. |
| Aba em background | Polling pausado; revalida no `visibilitychange`. |
| Usuário acessa `/md/foo` antigo | 404 (rota não existe mais — decisão fechada). |

## O que NÃO está nesta spec

- Não migra automaticamente arquivos no Drive (você faz manual ou peço um script depois).
- Não adiciona busca textual dentro de `/docs` (escopo separado).
- Não adiciona upload pelo site (Drive UI continua sendo a fonte).
- Não adiciona autenticação pra `/docs/private/*` — privado continua significando "não aparece no índice raiz, mas qualquer URL direta funciona", igual hoje.

## Critério de pronto

- [ ] `npm run lint`, `npm run check`, `npm run test` passam.
- [ ] `/docs` lista misturando md/html/pdf públicos.
- [ ] `/docs/<path>.md` renderiza markdown idêntico à rota velha.
- [ ] `/docs/<path>.html` renderiza HTML raw.
- [ ] `/docs/<path>.pdf` embeda PDF via `/api/drive-file/<id>`.
- [ ] `/docs/<folderPath>` lista filhos (incluindo private quando dentro de pasta).
- [ ] `/md`, `/html`, `/pdf` retornam 404.
- [ ] Edição de arquivo no Drive aparece no site em ≤20s sem refresh manual.
- [ ] Strings PT e EN atualizadas.
- [ ] `CLAUDE.md` e `README.md` refletem nova estrutura.
