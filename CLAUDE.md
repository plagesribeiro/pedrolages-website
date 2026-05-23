# CLAUDE.md

Guia rápido para qualquer agente (Claude, Codex, etc.) trabalhando neste repositório. Leia antes de tocar em código.

> Para visão geral pública e instruções de setup, ver `README.md`. Este arquivo é o que você precisa saber para **desenvolver** aqui sem quebrar convenções.

---

## 1. O que é este projeto

`pedrolages.dev` — site pessoal + portfólio + playground do Pedro Lages Ribeiro.

- **Bilíngue PT/EN** (PT é primário, EN sempre acompanha).
- Metade currículo sério (Hero, Timeline, Skills, Education, `/resume`).
- Metade brincadeira: mini-games com leaderboard global, terminal falso, Konami code, rotas escondidas, glitch overlay, CMS via Google Drive.
- Roda inteiramente no **edge da Cloudflare** (Pages + Workers KV). Sem servidor tradicional, sem banco.

Quando estiver em dúvida sobre tom/escopo: o site é **sério o suficiente para um recrutador** mas **divertido o bastante para alguém ficar bisbilhotando**. Não sacrifique nenhum dos dois.

---

## 2. Stack

| Camada      | Ferramenta                                                              |
| ----------- | ----------------------------------------------------------------------- |
| Framework   | SvelteKit 2 + **Svelte 5 (runes)** + TypeScript **strict**              |
| Estilo      | **Tailwind CSS v4** via plugin Vite (não há `postcss.config`)           |
| Build       | Vite 6                                                                  |
| Runtime     | Cloudflare Pages (`@sveltejs/adapter-cloudflare`)                       |
| Storage     | Workers KV — `SCORES` (leaderboard) e `CONTENT_CACHE` (Drive, TTL 5min) |
| CMS         | Google Drive API (service account, base64 no env)                       |
| Markdown    | unified (remark + rehype) + Shiki + KaTeX                               |
| PDF         | jsPDF + jspdf-autotable (client-side)                                   |
| Testes      | Vitest                                                                  |
| Format/Lint | Prettier (+ plugin svelte e tailwindcss)                                |
| Type-check  | svelte-check (svelte + tsc)                                             |
| CI/CD       | GitHub Actions → Wrangler                                               |

---

## 3. Comandos essenciais

```bash
npm run dev       # vite dev — http://localhost:5173
npm run build     # bundle pra .svelte-kit/cloudflare
npm run preview   # serve o bundle prod localmente
npm run check     # svelte-kit sync + svelte-check (type-check)
npm run lint      # prettier --check .
npm run format    # prettier --write . (use antes de commitar)
npm run test      # vitest run (não usa --watch por padrão)
npm run deploy    # wrangler pages deploy (manual; deploy normal é via push)
```

**Antes de declarar tarefa concluída**, rode no mínimo: `npm run lint && npm run check && npm run test`. Esses três são exatamente o gate do CI — se passarem aqui, passam lá.

Para testar KV de verdade local:

```bash
npx wrangler pages dev .svelte-kit/cloudflare --kv SCORES --kv CONTENT_CACHE
```

Sem isso, KV usa fallback em memória — funciona pra desenvolvimento, mas não persiste entre reloads.

---

## 4. CI / Deploy / Branch model

### 4.1. Branches

Só existem **duas branches que importam** para CI/CD:

| Branch       | Propósito                                                        | Ambiente                                                                     |
| ------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `staging`    | **Branch de trabalho.** Todo desenvolvimento acontece aqui.      | Preview no Cloudflare Pages (`https://staging.pedrolages-website.pages.dev`) |
| `production` | **Branch publicada.** Só recebe merge vindo de `staging` via PR. | Produção (`https://pedrolages.dev`)                                          |

Branch `main` é legado — não recebe deploy nem dispara CI. Pode ser deletada/ignorada com segurança. **Não trabalhe em `main`.**

### 4.2. Workflow do GitHub Actions

`.github/workflows/deploy.yml` dispara **apenas** nesses eventos:

| Evento                                               | O que roda                                            |
| ---------------------------------------------------- | ----------------------------------------------------- |
| `push` em `staging`                                  | CI (`lint → check → test`) → deploy preview `staging` |
| `push` em `production`                               | CI → deploy production                                |
| `pull_request` com base em `staging` ou `production` | CI apenas (sem deploy)                                |
| `workflow_dispatch`                                  | Gatilho manual via UI                                 |
| Qualquer outra branch                                | **Nada.** Sem CI, sem deploy.                         |

Secrets do runner: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Secrets de runtime (Drive) ficam no Cloudflare Pages, **nunca** no Actions.

### 4.3. Fluxo de desenvolvimento (obrigatório)

```
trabalha local em `staging`
        │
        ├── valida: npm run lint && npm run check && npm run test
        │
        ├── commit em `staging`
        │
        ├── git push origin staging        →  CI roda + deploy preview sobe
        │
        └── gh pr create --base production --head staging
                  ↓
            revisa preview, mescla PR
                  ↓
            push em `production` (via merge do PR)
                  ↓
            CI roda + deploy production sobe
```

Não pule hooks (`--no-verify`) nem faça force-push em `staging` ou `production` sem pedir.

### 4.4. Regra para agentes (Claude, Codex, etc.)

**Sempre que terminar uma alteração de código neste repositório, o agente DEVE, nesta ordem:**

1. Rodar `npm run lint`, `npm run check`, `npm run test` localmente — todos os três precisam passar.
2. Fazer `git commit` na branch `staging` com mensagem descritiva (siga o estilo de commits do `git log`).
3. Fazer `git push origin staging` (use `-u` na primeira vez).
4. Garantir que existe um PR aberto de `staging` → `production`. Se não houver, criar com `gh pr create --base production --head staging --title "..." --body "..."`. Se já houver, deixar o PR existente — o push já atualiza o diff automaticamente.

Não pule etapas. Se algo na validação local falhar, **corrija antes de commitar** — não suba código quebrado pra `staging` mesmo sendo "só preview". O preview existe pra revisão visual, não pra acolher build quebrado.

Se a tarefa for _apenas_ leitura/exploração (não tocou em arquivo), pule este ciclo — só se aplica quando houve mudança de código.

---

## 5. Regras inegociáveis

### 5.1. Internacionalização (PT/EN) — todo conteúdo visível é bilíngue

Existem **dois mecanismos**, escolha de acordo com a origem do texto:

**(a) Strings de UI** → dicionários planos em `src/lib/i18n/{pt,en}.json`:

```svelte
<script>
  import { t } from '$lib/i18n';
</script>

<button>{$t('hero.cta')}</button>
```

- Toda chave nova entra **simultaneamente** em `pt.json` E `en.json`. Se faltar em uma, a outra serve como fallback, mas isso é bug, não feature.
- Interpolação simples: `{name}`. Plural ICU mínimo: `{n, plural, one {item} other {items}}`.
- Para texto inline pontual: `$tt({ pt: 'olá', en: 'hello' })`.

**(b) Conteúdo estruturado** (currículo, posts, etc.) → campos com shape `{ pt: ..., en: ... }`:

```ts
{ "title": { "pt": "Engenheiro de Software", "en": "Software Engineer" } }
```

Use `pick(field, $locale)` para extrair. O `resume.json` é todo assim.

**Nunca** hardcode texto visível em um só idioma. Se for adicionar conteúdo, traduz já — não deixe TODO.

### 5.2. Sem env vars `PUBLIC_`

Tudo que envolve credenciais vive **só no servidor** (Worker). O bundle do browser nunca recebe. Se você precisa expor algo pro cliente, pense duas vezes: provavelmente devia ser uma rota `/api/*` que retorna só o necessário.

`.env.example` é o contrato — atualize quando adicionar uma variável.

### 5.3. KV degrada graciosamente

`SCORES` e `CONTENT_CACHE` têm fallback em memória (`src/lib/leaderboard/`, `src/lib/drive/`). Qualquer código novo que toque KV **deve** continuar funcionando se `platform.env.SCORES` for `undefined`. Isso mantém `npm run dev` sem setup Cloudflare.

### 5.4. Currículo tem fonte única

`src/lib/data/resume.json` alimenta landing, `/resume` e o export PDF. Não duplique dados em componente. Se um campo não existe, adicione no JSON e tipa em `src/lib/data/types.ts`.

---

## 6. Padrões de código

### 6.1. Prettier (`.prettierrc`)

- 2 espaços, sem tabs.
- Aspas simples.
- Sem trailing comma.
- `printWidth: 100`.
- Plugins: `prettier-plugin-svelte`, `prettier-plugin-tailwindcss` (ordenação automática das classes — não brigue com a ordem).

Sempre rode `npm run format` antes de commitar arquivos editados. O CI quebra se `npm run lint` reclamar.

### 6.2. Svelte 5 — use runes

Este projeto está em **Svelte 5**, não Svelte 4. Use:

- `$state`, `$derived`, `$effect`, `$props`, `$bindable`.
- Eventos: `onclick={...}` direto na prop, **não** `on:click`.
- Slots → snippets: `{#snippet name()} ... {/snippet}` + `{@render name()}`.

Não escreva `export let`, `$:`, ou stores reativas onde rune cabe. Stores ainda existem para estado global compartilhado (i18n, leaderboard, terminal) — ali estão ok.

### 6.3. TypeScript estrito

`tsconfig.json` tem `strict: true` + `checkJs: true`. Não use `any` para mascarar erro — refaça o tipo. Tipos compartilhados ficam em `src/lib/data/types.ts`.

### 6.4. Tailwind v4

- Importação por `@import 'tailwindcss'` em `app.css` (sem `tailwind.config.js`).
- Tema customizado via `@theme` direto no CSS.
- Classes ordenadas pelo plugin — não tente manter ordem manualmente.

### 6.5. Comentários

Padrão é **não escrever comentários**. Só comente quando o _porquê_ não é óbvio (uma invariante escondida, um workaround, comportamento que surpreenderia outro leitor). Nunca explique _o quê_ — código nomeado faz isso.

### 6.6. Aliases

- `$lib` → `src/lib` (padrão SvelteKit).
- `$content` → `content/` (definido em `svelte.config.js`).

---

## 7. Como cada peça funciona (mapa mental)

```
src/
  app.html         shell HTML + fonts (Geist / Geist Mono / Press Start 2P / VT323)
  app.css          import do Tailwind v4 + tokens de tema
  routes/
    +layout.server.ts    carrega resume.json + manifest do Drive
    +layout.svelte       cabeçalho, alternador PT/EN, overlays globais
    +page.svelte         landing
    api/scores/[game]/   leaderboard KV
    api/drive-file/      proxy de arquivo do Drive (com cache)
    md|html|pdf/[slug]   conteúdo dropado no Drive vira rota
    games/               Snake, Pong, WhackBug, TokenCatcher
    hack|coffee|admin/   easter eggs (404 customizadas etc.)
  lib/
    components/      UI (Svelte 5 runes em tudo)
    games/           lógica pura dos jogos (separada da UI)
    content/         pipeline markdown + manifest
    drive/           cliente Drive + auth service-account + cache
    data/            resume.json (verdade) + types.ts
    i18n/            pt.json, en.json, store + helpers t, tt, pick
    leaderboard/     cliente KV + store com fallback in-memory
    terminal/        estado do terminal falso
    utils/           dates, pdf, console-art, reveal
tests/               vitest (apenas unidades puras por enquanto)
static/              assets servidos como estão
```

### 7.1. Pipeline de markdown (server-only)

```
remark-parse → remark-math → remark-gfm → remark-rehype → rehype-katex → @shikijs/rehype → rehype-stringify
```

Saída é HTML simples cacheado no KV por `fileId + revision`. Quando mudar o pipeline, invalide o cache (ou aceite janela de 5min de TTL).

### 7.2. Conteúdo via Drive

Coloque `slug.md` (ou `.html`, `.pdf`) na pasta do Drive mapeada para `/md/public/` e ele aparece em `/md/<slug>`. Manifest é buscado uma vez por 5min, corpo do arquivo é cacheado no primeiro hit. Nenhuma alteração de código é necessária para adicionar conteúdo.

### 7.3. Leaderboard

`POST /api/scores/[game]` grava no KV `SCORES`. `GET` lê top N. Sem KV (dev sem wrangler), usa Map em memória. Não há autenticação — submissions têm validação básica (nome curto, score numérico). Se for adicionar jogo, registre o slug em `src/lib/games/`.

### 7.4. Prerender vs SSR

Layout raiz tem `export const prerender = false` porque o manifest do Drive é dinâmico. Páginas estáticas (`/about`, `/games`, `/contact`, easter eggs) podem opt-in via `export const prerender = true` no seu próprio `+page.ts`. Mantenha o Worker pequeno.

---

## 8. Testes

- Vitest com config em `vitest.config.ts`. Lê de `tests/**/*.test.ts`.
- Alias `$lib` está mapeado pra `src/lib` — testes podem importar exatamente como o app.
- Cobertura atual é pequena (`dates.test.ts`). Quando adicionar lógica não trivial em `src/lib/utils` ou `src/lib/games`, **adicione teste**. Testes pra componente Svelte ainda não são padrão aqui — não force se não couber.

---

## 9. Checklist antes de commit + push + PR

Antes de executar o ciclo da seção 4.4, valide:

1. `npm run format` — Prettier passou.
2. `npm run lint` — Prettier `--check` passou (CI exige).
3. `npm run check` — type-check limpo.
4. `npm run test` — verde.
5. Toquei em texto visível? Atualizei **PT e EN** (`pt.json` + `en.json`, ou `{ pt, en }` no JSON).
6. Adicionei env var? Atualizei `.env.example` (e no Cloudflare Pages se for pra produção).
7. Toquei em KV? Fallback em memória ainda funciona em `npm run dev`?
8. Mudei pipeline de markdown ou shape do manifest? Documentei aqui ou no README.
9. Easter egg novo? Não exponha credencial nem URL que vaze infra.

**Não declare "pronto" sem rodar os comandos.** "Acho que está ok" não basta — o gate do CI é objetivo, então a verificação local também é.

Depois desse checklist, executa o ciclo da §4.4: commit em `staging` → push → garantir PR aberto para `production`.

---

## 10. Onde NÃO mexer sem avisar

- `wrangler.toml` — os IDs de KV são deliberadamente públicos, mas mudar o nome de um binding quebra tudo no edge.
- `.github/workflows/deploy.yml` — alterações no CI/CD afetam o deploy real.
- Service account do Drive — é credencial em produção, qualquer rotação tem que ser combinada.
- Branches `staging` e `production` — `production` só recebe merge via PR a partir de `staging`. **Nunca** commit direto em `production`. Nunca use nenhuma das duas como branch de feature ad-hoc — feature branches (se você criar uma) sempre fazem merge em `staging` primeiro.

Quando em dúvida sobre escopo, pergunte antes de agir.
