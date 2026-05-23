# Main menu restructure — inline expand + floating Ko-fi

**Date:** 2026-05-23
**Status:** Approved, ready for plan

## Goal

Quebrar o item #4 do menu da home (`me stalkear`, que hoje junta socials + email + whatsapp + ko-fi) em três peças com responsabilidades claras:

1. `me stalkear` → só socials públicos (IG / LinkedIn / GitHub / Lattes)
2. `me contactar` → só canais diretos (email + WhatsApp)
3. `buy me a coffee` → CTA flutuante separado do menu

Itens 4 e 5 expandem inline na home — sem navegação. A rota `/contact` é apagada.

## Estrutura final do menu

```
┌──────────────────────────────────┐
│ 01  about pedro             ▶    │  → link /about
│ 02  $ hack me               ▶    │  → link /hack
│ 03  jogar               NEW ▶    │  → link /games
│ 04  me stalkear             ▼    │  ← expandable (accordion)
│      └─ IG · LinkedIn · GH · CV  │
│ 05  me contactar            ▶    │  ← expandable (accordion)
└──────────────────────────────────┘
                                 ┌──────────┐
                                 │ ☕ ko-fi │   ← FAB (só na home)
                                 └──────────┘
```

## Componentes

### Modificados

**`src/routes/+page.svelte`**
- `items[]` ganha campo `kind: 'link' | 'expand'` e `panelId?: string`.
- Novo estado `openPanel: string | null` (apenas um painel aberto por vez).
- Adapta `onKey`: Enter/Space em item `kind: 'expand'` → toggle do painel (não navega).
- Adapta atalhos `1`–`9`: para item expand, toggle em vez de `goto`.
- Atualiza dica visual `1-4` → `1-5`.
- Adiciona Esc listener: fecha painel aberto.
- Renderiza `<KofiFab />` no final.

**`src/lib/components/MenuButton.svelte`**
- Nova prop opcional `expanded: boolean | undefined`.
- Quando `expanded === undefined`: comportamento atual (renderiza `<a href>`).
- Quando `expanded` é boolean: renderiza `<button>` em vez de `<a>`, com `aria-expanded={expanded}`, `aria-controls={panelId}`, e dispatch `on:toggle`.
- Caret (`icon`) gira: `▶` quando colapsado, `▼` quando expandido. CSS `transform: rotate(90deg)` com transição 150ms.

### Novos

**`src/lib/components/StalkPanel.svelte`**
- Recebe `resume: Resume` como prop.
- Layout: grid 2 colunas em sm+, 1 coluna em mobile. Reutiliza `.card` style global.
- Cards: Instagram, LinkedIn, GitHub, Lattes (condicionais com `{#if resume.links.X}`).
- Animação de abertura: container com `max-height` 0 → auto via técnica de `grid-template-rows: 0fr` → `1fr` (animatable), e `opacity` 0 → 1. Duração ~200ms `ease-out`.
- Respeita `prefers-reduced-motion: reduce` (zero transição).

**`src/lib/components/ContactPanel.svelte`**
- Recebe `resume: Resume` como prop.
- Cards: Email (mailto + botão copy), WhatsApp (wa.me + botão copy), condicional em `resume.links.whatsapp`.
- Lógica de `copy()` portada de `src/routes/contact/+page.svelte:18-25`.
- Mesma animação que `StalkPanel`.

**`src/lib/components/KofiFab.svelte`**
- Recebe `href: string` (kofi link do resume).
- `position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 40;`.
- Pill âmbar: `border-amber-400/40`, `bg-amber-400/10`, texto âmbar.
- Conteúdo: `<Coffee class="h-4 w-4" />` + label `ko-fi`.
- Hover: `scale(1.05)`, `box-shadow` âmbar suave.
- `aria-label`: `buy me a coffee` (bilíngue via `$tt`).

### Removidos

- `src/routes/contact/+page.svelte` e diretório `src/routes/contact/`.

## Comportamento

### Accordion
- Apenas um painel aberto por vez. Abrir o painel B fecha o A automaticamente.
- Clicar no botão já aberto colapsa.
- Esc com foco em qualquer lugar fecha o painel aberto.

### Keyboard
| Tecla | Item link (#1–3) | Item expand (#4–5) |
|---|---|---|
| Setas / WASD | move cursor | move cursor |
| Enter / Space | navega | toggle painel |
| `1`–`3` | navega | — |
| `4`, `5` | — | toggle painel |
| Esc | — | fecha painel aberto |

### Acessibilidade
- Botão expand: `aria-expanded="true|false"`, `aria-controls="<panelId>"`.
- Painel: `role="region"`, `aria-labelledby="<buttonId>"`, atributo `hidden` quando fechado (não só `display: none`).
- FAB: `aria-label` bilíngue.
- Foco visível mantido (já existe `focus-visible:ring-2`).

### i18n
Sem novas chaves no JSON; bilíngue inline com `$tt`:
- Label item 5: `{ pt: 'me contactar', en: 'contact me' }`
- Hint item 4: `{ pt: 'redes sociais e cv', en: 'socials and cv' }` (substitui o atual `mandar mensagem · me pagar um café`)
- Hint item 5: `{ pt: 'email e whatsapp', en: 'email and whatsapp' }`
- FAB label: `{ pt: 'me pagar um café', en: 'buy me a coffee' }`

## Edge cases

- **Resume sem `whatsapp` / `lattes`:** cards condicionais com `{#if}` (igual `/contact` faz hoje).
- **Clipboard API indisponível:** `copy()` já tem try/catch que falha silenciosamente.
- **Sem JS:** assumido — o resto da home já depende de JS (parallax, particles, teclado, terminal). Não adicionar fallback `<details>`.
- **Mobile:** painel ocupa largura full do menu (`max-w-md` herdado). Cards em 1 coluna abaixo de 640px.

## Testes

Projeto não tem suite de testes ativa (diretório `tests/` existe untracked mas vazio na história). Sem testes automatizados nessa mudança. Plano de verificação manual no dev server:

- Abrir/fechar cada painel via clique.
- Abrir painel B fecha painel A.
- Teclado: Enter, Space, Esc, setas, `1`–`5`.
- Mobile (375px) e desktop.
- Copy email e WhatsApp (verificar feedback "copiado").
- `/contact` retorna 404.
- FAB aparece só em `/`, não em `/about`, `/games`, `/hack`.
- Toggle de idioma PT/EN troca labels corretamente.

## Out of scope

- Adicionar suite de testes (Vitest está configurado mas vazio).
- Reorganizar conteúdo da página `/about` ou outras rotas.
- Mudar o ícone do FAB ou criar variantes regionais.
- Adicionar formulário de contato (decisão: links diretos são suficientes).
