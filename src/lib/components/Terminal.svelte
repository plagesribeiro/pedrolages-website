<script lang="ts">
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { locale, tt } from '$lib/i18n';
  import { yearsSince } from '$lib/utils/dates';
  import * as M from '$lib/content/manifest';
  import { manifestStore } from '$lib/content/store';
  import type { Folder as ContentFolder } from '$lib/content/types';
  import {
    terminalLines,
    terminalHistory,
    terminalCwd,
    terminalBooted,
    type TerminalTone
  } from '$lib/terminal/store';
  import HackOverlay from './HackOverlay.svelte';
  import type { Resume } from '$lib/data/types';

  export let resume: Resume;
  /** When true, the parent is a modal — `exit` should close, not navigate. */
  export let inModal = false;

  const dispatch = createEventDispatcher<{ navigate: { path: string }; close: void }>();

  let input = '';
  let inputEl: HTMLInputElement;
  let scrollEl: HTMLDivElement;
  let historyCursor = -1;
  let hackOpen = false;

  let currentLocale: 'pt' | 'en' = 'pt';
  locale.subscribe((v) => (currentLocale = v));

  const HOST = 'plagesribeiro';
  const USER = 'pedrolages';
  $: prompt = `${USER}@${HOST}:${$terminalCwd}$ `;

  // ---------------------------------------------------------------------------
  // "filesystem": only real, existing routes — never something that 404s.
  // Dynamic content folders (/md, /html, /pdf) get their children from the
  // build-time content manifest so `ls /md` shows actual public files.
  // ---------------------------------------------------------------------------
  const STATIC_ROUTES: Record<string, { label: string }> = {
    '/': { label: 'home menu' },
    '/about': { label: 'a história toda' },
    '/hack': { label: 'terminal full-page' },
    '/games': { label: 'arcade index' },
    '/games/snake': { label: 'classic snake + bombs' },
    '/games/tokens': { label: 'token catcher' },
    '/games/pong': { label: 'pong vs ai' },
    '/games/bugs': { label: 'whack-a-bug' },
    '/contact': { label: 'stalk me' },
    '/resume': { label: 'printable cv' },
    '/md': { label: 'markdown shares' },
    '/html': { label: 'html shares' },
    '/pdf': { label: 'pdf shares' },
    '/coffee': { label: '418 teapot' },
    '/admin': { label: 'access denied :p' }
  };

  /** Identify if a path lives inside one of the content trees, e.g. /md/notas. */
  function contentSplit(p: string): { folder: ContentFolder; sub: string } | null {
    const m = p.match(/^\/(md|html|pdf)(?:\/(.+))?$/);
    if (!m) return null;
    return { folder: m[1] as ContentFolder, sub: (m[2] ?? '').replace(/\/$/, '') };
  }

  function labelFor(folder: ContentFolder): string {
    return folder === 'md' ? 'markdown post' : folder === 'html' ? 'html share' : 'pdf';
  }

  /** Shorthand to read the current manifest synchronously. */
  const m = () => get(manifestStore);

  function dynamicChildren(parent: string): { path: string; label: string; isDir: boolean }[] {
    const split = contentSplit(parent);
    if (!split) return [];
    return M.listFolderChildren(m(), split.folder, split.sub).map((c) => ({
      path: `/${split.folder}/${split.sub ? split.sub + '/' : ''}${c.name}`,
      label: c.isDir ? 'pasta' : labelFor(split.folder),
      isDir: c.isDir
    }));
  }

  function normalizePath(arg: string, cwd: string): string {
    if (!arg || arg === '~') return '/';
    const p = arg.startsWith('/') ? arg : cwd === '/' ? `/${arg}` : `${cwd}/${arg}`;
    const parts: string[] = [];
    for (const seg of p.split('/').filter(Boolean)) {
      if (seg === '..') parts.pop();
      else if (seg !== '.') parts.push(seg);
    }
    return '/' + parts.join('/');
  }

  function listChildren(path: string): { path: string; label: string; isDir: boolean }[] {
    const norm = path === '/' ? '/' : path.replace(/\/$/, '');
    const out: { path: string; label: string; isDir: boolean }[] = [];
    for (const [p, meta] of Object.entries(STATIC_ROUTES)) {
      if (p === norm) continue;
      const prefix = norm === '/' ? '/' : norm + '/';
      if (!p.startsWith(prefix)) continue;
      const rest = p.slice(prefix.length);
      if (!rest || rest.includes('/')) continue;
      const hasStaticChildren = Object.keys(STATIC_ROUTES).some((q) => q.startsWith(p + '/'));
      const hasDynamicChildren = p === '/md' || p === '/html' || p === '/pdf';
      out.push({ path: p, label: meta.label, isDir: hasStaticChildren || hasDynamicChildren });
    }
    for (const dyn of dynamicChildren(norm)) out.push(dyn);
    return out.sort((a, b) => a.path.localeCompare(b.path));
  }

  function pathLooksValid(p: string): boolean {
    if (Object.prototype.hasOwnProperty.call(STATIC_ROUTES, p)) return true;
    // dynamic content paths: /md/<...>, /html/<...>, /pdf/<...> — public OR private
    const split = contentSplit(p);
    if (split && split.sub) {
      if (M.findItem(m(), split.folder, split.sub)) return true;
      if (M.folderExists(m(), split.folder, split.sub)) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // helpers that write to the shared store
  // ---------------------------------------------------------------------------
  function print(text: string, tone?: TerminalTone) {
    terminalLines.update((arr) => [...arr, { text, tone }]);
  }
  function printMany(arr: string[], tone?: TerminalTone) {
    for (const t of arr) print(t, tone);
  }

  // ---------------------------------------------------------------------------
  // commands — every one of these must do something real (no 404 routes, no
  // eval of user input, no script injection vectors).
  // ---------------------------------------------------------------------------
  type Cmd = {
    desc: string;
    run: (args: string[]) => string[] | string | void | Promise<string[] | string | void>;
  };

  const COMMANDS: Record<string, Cmd> = {
    help: {
      desc: 'lista os comandos',
      run: () => {
        const rows = Object.entries(COMMANDS).map(
          ([name, c]) => `  ${name.padEnd(10)} — ${c.desc}`
        );
        return [
          'available commands:',
          ...rows,
          '',
          'TAB autocompleta · ↑↓ histórico · CTRL+L limpa · CTRL+C cancela'
        ];
      }
    },
    whoami: {
      desc: 'quem é esse cara',
      run: () => {
        const years = yearsSince(resume.careerStart);
        const ai = yearsSince(resume.aiStart);
        return [
          `uid=1000(${resume.handle}) gid=1000(devs) groups=1000(devs),1337(founders)`,
          `${resume.name}`,
          `${years}y construindo software · ${ai}y trabalhando com IA`,
          resume.location[currentLocale]
        ];
      }
    },
    about: { desc: 'bio rápida', run: () => resume.bio[currentLocale] },
    contact: {
      desc: 'formas de me achar',
      run: () => [
        `email:     ${resume.email}`,
        `whatsapp:  ${resume.links.whatsapp ?? '—'}`,
        `instagram: ${resume.links.instagram ?? '—'}`,
        `linkedin:  ${resume.links.linkedin}`,
        `github:    ${resume.links.github}`,
        `lattes:    ${resume.links.lattes ?? '—'}`,
        '',
        currentLocale === 'pt'
          ? 'tip: `cd /contact` pra abrir a página'
          : 'tip: `cd /contact` to open the page'
      ]
    },
    resume: {
      desc: 'baixar CV (PDF)',
      run: async () => {
        const { downloadResumePDF } = await import('$lib/utils/pdf');
        downloadResumePDF(resume, currentLocale);
        return [currentLocale === 'pt' ? 'baixando currículo...' : 'downloading cv...'];
      }
    },
    hack: {
      desc: 'me hackear (cuidado)',
      run: () => {
        hackOpen = true;
      }
    },
    ls: {
      desc: 'lista as áreas',
      run: (args) => {
        const requested = args[0] ? normalizePath(args[0], get(terminalCwd)) : get(terminalCwd);
        let target = requested;
        let children = listChildren(target);
        let usedRootFallback = false;
        if (children.length === 0 && target !== '/') {
          // try to be friendly: if it's a dir-shaped path but empty, list root.
          target = '/';
          children = listChildren('/');
          usedRootFallback = true;
        }
        const rows = children.map(({ path, label, isDir }) => {
          const name = path === '/' ? '/' : path.split('/').pop();
          const tag = isDir ? '/' : '-';
          return `${tag}  ${name?.padEnd(14)} ${label}`;
        });
        if (usedRootFallback) {
          const note =
            currentLocale === 'pt'
              ? `# ${requested} não tem itens públicos — mostrando /`
              : `# ${requested} has no public items — showing /`;
          return [note, ...rows];
        }
        return rows;
      }
    },
    cd: {
      desc: 'navega de verdade pra outra rota',
      run: async (args) => {
        const arg = args[0] ?? '/';
        let target = normalizePath(arg, get(terminalCwd));
        if (!pathLooksValid(target)) {
          const absolute = normalizePath('/' + arg.replace(/^\/+/, ''), '/');
          if (pathLooksValid(absolute)) target = absolute;
          else return [`cd: ${arg}: No such file or directory`];
        }
        terminalCwd.set(target);
        print(`navigating to ${target} ...`, 'muted');
        await tick();
        dispatch('navigate', { path: target });
        goto(target);
        return '';
      }
    },
    tree: {
      desc: 'estrutura do site',
      run: () => {
        const grouped: Record<string, string[]> = {};
        for (const path of Object.keys(STATIC_ROUTES)) {
          const parts = path.split('/').filter(Boolean);
          const top = '/' + (parts[0] ?? '');
          if (!grouped[top]) grouped[top] = [];
          if (path !== top) grouped[top].push(path);
        }
        for (const f of ['md', 'html', 'pdf'] as const) {
          const top = '/' + f;
          for (const slug of M.publicSlugs(m(), f)) {
            (grouped[top] ??= []).push(`${top}/${slug}`);
          }
        }
        const out: string[] = ['/'];
        const tops = Object.keys(grouped).sort();
        tops.forEach((top, ti) => {
          if (top === '/') return;
          const isLast = ti === tops.length - 1;
          out.push(`${isLast ? '└──' : '├──'} ${top.slice(1)}`);
          grouped[top].forEach((sub, si) => {
            const subLast = si === grouped[top].length - 1;
            out.push(
              `${isLast ? '    ' : '│   '}${subLast ? '└──' : '├──'} ${sub.split('/').pop()}`
            );
          });
        });
        return out;
      }
    },
    date: { desc: 'que dia é hoje', run: () => new Date().toString() },
    uname: { desc: 'sistema', run: () => 'PlagesOS 4.7.1 (svelte-cloudflare) x86_64 GNU/Caffeine' },
    history: {
      desc: 'histórico de comandos',
      run: () => get(terminalHistory).map((h, i) => `${String(i + 1).padStart(3, ' ')}  ${h}`)
    },
    open: {
      desc: 'abre um link externo (apenas http/https/mailto)',
      run: (args) => {
        const aliases: Record<string, string> = {
          github: resume.links.github,
          linkedin: resume.links.linkedin,
          lattes: resume.links.lattes ?? '',
          instagram: resume.links.instagram ?? '',
          email: `mailto:${resume.email}`,
          whatsapp: resume.links.whatsapp
            ? `https://wa.me/${resume.links.whatsapp.replace(/[^0-9]/g, '')}`
            : '',
          kofi: resume.links.kofi ?? ''
        };
        const raw = aliases[args[0]?.toLowerCase()] ?? args[0];
        if (!raw) return ['open <github|linkedin|lattes|instagram|email|whatsapp|kofi|url>'];
        // hard sanitize: only allow safe schemes — no javascript:, data:, etc.
        const safe = /^(https?:|mailto:)/i.test(raw);
        if (!safe) return [`open: blocked unsafe url: ${raw}`];
        window.open(raw, '_blank', 'noopener,noreferrer');
        return [`opening ${raw} ...`];
      }
    },
    play: {
      desc: 'atalho pra um jogo',
      run: async (args) => {
        const games = ['snake', 'tokens', 'pong', 'bugs'];
        const target = args[0] ?? '';
        if (!games.includes(target)) return [`play <${games.join('|')}>`];
        const path = `/games/${target}`;
        await tick();
        dispatch('navigate', { path });
        goto(path);
        return [`loading ${target}...`];
      }
    },
    games: {
      desc: 'abre o arcade',
      run: async () => {
        await tick();
        dispatch('navigate', { path: '/games' });
        goto('/games');
        return ['loading arcade...'];
      }
    },
    theme: {
      desc: 'alterna verde/amber/branco',
      run: (args) => {
        const t = (args[0] ?? '').toLowerCase();
        const map: Record<string, string> = {
          green: '#9bbc0f',
          amber: '#facc15',
          white: '#fafafa'
        };
        if (!map[t]) return ['theme <green|amber|white>'];
        document.documentElement.style.setProperty('--color-gb-light', map[t]);
        return [`theme set to ${t}`];
      }
    },
    matrix: { desc: 'rabbit hole', run: () => ['take the blue pill, friend.'] },
    sl: {
      desc: 'você quis dizer `ls`? toma um trem.',
      run: () => [
        '   choo choo!',
        '',
        '       _____________________',
        '      /   ___       ___     \\',
        '     |   |[o]|     |[o]|     |======[][]====[][]',
        '     |   |___|     |___|     |',
        '     |__________________  __|',
        '       (O)            (O)',
        '',
        '   (psst: o comando era `ls`)'
      ]
    },
    sudo: {
      desc: 'nope',
      run: (args) => {
        if (args.join(' ').startsWith('rm -rf')) {
          document.documentElement.animate(
            [
              { transform: 'translate(0,0)' },
              { transform: 'translate(-4px, 2px)' },
              { transform: 'translate(3px, -2px)' },
              { transform: 'translate(0,0)' }
            ],
            { duration: 350, iterations: 2 }
          );
          return ['nice try.'];
        }
        return ['Permission denied.'];
      }
    },
    clear: {
      desc: 'limpa o terminal',
      run: () => {
        terminalLines.set([]);
        return '';
      }
    },
    exit: {
      desc: 'volta pro menu',
      run: async () => {
        if (inModal) {
          dispatch('close');
          return '';
        }
        await tick();
        dispatch('navigate', { path: '/' });
        goto('/');
        return '';
      }
    }
  };

  function parse(raw: string): { cmd: string; args: string[] } {
    const tokens = raw.trim().split(/\s+/);
    return { cmd: (tokens[0] ?? '').toLowerCase(), args: tokens.slice(1) };
  }

  function suggest(cmd: string, raw: string): string[] {
    if (raw === '?') return ["digite 'help' pra ver os comandos."];
    if (raw.startsWith('rm -rf')) return ['lol no.'];
    if (cmd === 'vim' || cmd === 'emacs' || cmd === 'nano')
      return ['use vscode like the rest of us.'];
    const known = Object.keys(COMMANDS);
    const near = known.find((k) => k.startsWith(cmd) || cmd.startsWith(k.slice(0, 2)));
    return [`zsh: command not found: ${cmd}${near ? `  (você quis dizer \`${near}\`?)` : ''}`];
  }

  async function scrollDown() {
    await tick();
    scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
  }

  export async function runCommand(raw: string) {
    const trimmed = raw.trim();
    print(`${prompt}${trimmed}`, 'muted');
    if (!trimmed) return;
    terminalHistory.update((h) => [...h, trimmed]);
    historyCursor = -1;
    const { cmd, args } = parse(trimmed);
    const handler = COMMANDS[cmd];
    if (!handler) {
      printMany(suggest(cmd, trimmed), 'err');
      await scrollDown();
      return;
    }
    const result = await handler.run(args);
    if (Array.isArray(result)) for (const ln of result) print(ln);
    else if (result) print(result);
    await scrollDown();
  }

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    const value = input;
    input = '';
    runCommand(value);
  }

  function commonPrefix(arr: string[]): string {
    if (arr.length === 0) return '';
    let prefix = arr[0];
    for (const s of arr) {
      while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
      if (!prefix) break;
    }
    return prefix;
  }

  function autocomplete(value: string): string {
    const trailingSpace = /\s$/.test(value);
    const tokens = value.trim().split(/\s+/).filter(Boolean);

    // command stage: still typing the command name
    if (tokens.length === 0 || (tokens.length === 1 && !trailingSpace)) {
      const start = (tokens[0] ?? '').toLowerCase();
      const matches = Object.keys(COMMANDS).filter((k) => k.startsWith(start));
      if (matches.length === 1) return matches[0] + ' ';
      if (matches.length > 1) {
        printMany(['matches:', '  ' + matches.join('   ')], 'muted');
        const prefix = commonPrefix(matches);
        return prefix.length > start.length ? prefix : value;
      }
      return value;
    }

    const cmd = tokens[0].toLowerCase();

    if (cmd === 'cd' || cmd === 'ls') {
      const last = trailingSpace ? '' : tokens[tokens.length - 1];
      const base = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '';
      const stub = last.slice(base.length);
      const parent = base
        ? normalizePath(base.replace(/\/$/, '') || '/', get(terminalCwd))
        : get(terminalCwd);
      const candidates = listChildren(parent)
        .map((c) => c.path.split('/').pop()!)
        .filter((n) => n.startsWith(stub));
      if (candidates.length === 1) {
        const next = trailingSpace
          ? [...tokens, base + candidates[0]]
          : [...tokens.slice(0, -1), base + candidates[0]];
        return next.join(' ') + ' ';
      }
      if (candidates.length > 1) {
        printMany(['matches:', '  ' + candidates.join('   ')], 'muted');
        const prefix = commonPrefix(candidates);
        if (prefix && prefix.length > stub.length) {
          const next = trailingSpace
            ? [...tokens, base + prefix]
            : [...tokens.slice(0, -1), base + prefix];
          return next.join(' ');
        }
      }
      return value;
    }

    if (cmd === 'play') {
      const games = ['snake', 'tokens', 'pong', 'bugs'];
      const last = trailingSpace ? '' : (tokens[1] ?? '');
      const matches = games.filter((g) => g.startsWith(last));
      if (matches.length === 1) return `${cmd} ${matches[0]} `;
      if (matches.length > 1) {
        printMany(['matches:', '  ' + matches.join('   ')], 'muted');
        const prefix = commonPrefix(matches);
        if (prefix && prefix.length > last.length) return `${cmd} ${prefix}`;
      }
    }

    if (cmd === 'open') {
      const aliases = ['github', 'linkedin', 'lattes', 'instagram', 'email', 'whatsapp', 'kofi'];
      const last = trailingSpace ? '' : (tokens[1] ?? '');
      const matches = aliases.filter((a) => a.startsWith(last));
      if (matches.length === 1) return `${cmd} ${matches[0]} `;
      if (matches.length > 1) {
        printMany(['matches:', '  ' + matches.join('   ')], 'muted');
        const prefix = commonPrefix(matches);
        if (prefix && prefix.length > last.length) return `${cmd} ${prefix}`;
      }
    }

    return value;
  }

  function onKeyDown(e: KeyboardEvent) {
    const hist = get(terminalHistory);
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hist.length === 0) return;
      historyCursor = historyCursor < 0 ? hist.length - 1 : Math.max(0, historyCursor - 1);
      input = hist[historyCursor] ?? '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyCursor < 0) return;
      historyCursor = Math.min(hist.length, historyCursor + 1);
      input = hist[historyCursor] ?? '';
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      terminalLines.set([]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      input = autocomplete(input);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      print(`${prompt}${input}`, 'muted');
      print('^C', 'err');
      input = '';
    }
  }

  // ASCII banner kept short + uses simple block chars so it reads at any width.
  const banner = [
    '╔══════════════════════════════════════╗',
    '║   PLAGESRIBEIRO // TERMINAL  v0.1    ║',
    '╚══════════════════════════════════════╝',
    'type `help` · TAB autocompletes · ↑↓ history · CTRL+L clear'
  ];

  onMount(async () => {
    // boot sequence runs once per session — second mount just focuses the input.
    if (!get(terminalBooted)) {
      terminalBooted.set(true);
      for (const ln of banner) print(ln, 'accent');
      print('');
      await runCommand('whoami');
    }
    inputEl?.focus();
    await scrollDown();
  });

  export function focusInput() {
    inputEl?.focus();
  }

  // Click anywhere in the output area focuses the input — but only if the user
  // isn't currently selecting text (so Ctrl+C copy works).
  function onScrollClick() {
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (sel && sel.toString().length > 0) return;
    inputEl?.focus();
  }
</script>

<div
  class="overflow-hidden rounded-2xl border border-[color:var(--color-gb-green)]/30 bg-zinc-950/95 shadow-[0_0_120px_-30px_rgba(155,188,15,0.45)]"
>
  <div class="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-3 py-2">
    <span class="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-amber-400/80"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
    <span class="ml-2 select-none font-mono text-xs text-zinc-500"
      >{USER}@{HOST}:{$terminalCwd} — zsh</span
    >
    {#if inModal}
      <button
        class="ml-auto text-xs text-zinc-500 hover:text-zinc-200"
        on:click={() => dispatch('close')}
        aria-label="close"
      >
        ESC
      </button>
    {/if}
  </div>

  <div
    bind:this={scrollEl}
    class="terminal-body h-[70vh] overflow-auto p-4 font-mono text-[13px] leading-relaxed"
    on:mouseup={onScrollClick}
    role="presentation"
  >
    {#each $terminalLines as line}
      <pre
        class="m-0 font-mono whitespace-pre {line.tone === 'accent'
          ? 'text-[color:var(--color-gb-light)]'
          : line.tone === 'muted'
            ? 'text-zinc-500'
            : line.tone === 'warn'
              ? 'text-amber-300'
              : line.tone === 'err'
                ? 'text-rose-400'
                : 'text-zinc-300'}">{line.text || ' '}</pre>
    {/each}
    <form on:submit={onSubmit} class="mt-1 flex items-center gap-2">
      <span class="select-none text-[color:var(--color-gb-light)]">{prompt}</span>
      <input
        bind:this={inputEl}
        bind:value={input}
        on:keydown={onKeyDown}
        class="flex-1 bg-transparent text-zinc-100 caret-[color:var(--color-gb-light)] outline-none placeholder:text-zinc-700"
        placeholder={$tt({ pt: 'digita `help` e aperta enter', en: 'type `help` and hit enter' })}
        autocomplete="off"
        spellcheck="false"
        autocapitalize="off"
      />
    </form>
  </div>
</div>

<HackOverlay bind:open={hackOpen} on:close={() => inputEl?.focus()} />

<style>
  /* explicit text-selection so the user can highlight + copy with Ctrl+C */
  .terminal-body,
  .terminal-body :global(*) {
    user-select: text;
    -webkit-user-select: text;
  }
  .terminal-body :global(.select-none) {
    user-select: none;
    -webkit-user-select: none;
  }
</style>
